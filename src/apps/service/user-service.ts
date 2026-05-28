import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { UserEntity, UserRegistrationSource } from '@/apps/entity/user.entity';
import { AuthService, AuthClient } from '@/core/auth';
import { RedisService } from '@/core/redis/redis.service';
import { AppLoginDto, AppLoginType, AppQueryUserDto, AppRegisterDto, AppRegisterType } from '@/apps/dto/userDto';
import {
  AppConflictException,
  AppDataNotFoundException,
  AppBusinessException,
  AppUnauthorizedException,
} from '@/common/enterprise-exceptions';

const SALT_ROUNDS = 10;
const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION_MINUTES = 30;
const REDIS_TOKEN_PREFIX = 'auth:app:user:';

@Injectable()
export class UserServices {
  private readonly logger = new Logger(UserServices.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    private readonly dataSource: DataSource,
    private readonly authService: AuthService,
    private readonly redisService: RedisService,
  ) {}

  /**
   * 登录
   */
  public async loginAppUser(
    loginDto: AppLoginDto,
  ): Promise<{ userId: string; username: string | null; nickname: string | null }> {
    const user = await this.findUserForLogin(loginDto);
    if (!user) {
      throw new AppDataNotFoundException('用户不存在');
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const minutes = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
      throw new AppBusinessException(`账号已锁定，请${minutes}分钟后再试`);
    }

    if (!user.enabled) {
      throw new AppBusinessException('账号已被禁用');
    }

    await this.verifyPassword(loginDto, user);

    if (user.failedLoginCount > 0) {
      await this.userRepo.update(user.id, { failedLoginCount: 0, lockedUntil: null });
    }

    await this.userRepo.update(user.id, { lastLoginAt: new Date() });

    const tokenResult = await this.authService.signToken({
      sub: user.id,
      client: AuthClient.APP,
      extra: { username: user.username },
    });

    await this.redisService.set(
      `${REDIS_TOKEN_PREFIX}${user.id}`,
      tokenResult.accessToken,
      tokenResult.expiresIn,
    );

    this.logger.log(`用户登录成功: ${user.id}`);

    return {
      userId: user.id,
      username: user.username,
      nickname: user.nickname,
    };
  }

  /**
   * 获取用户 Token（用于 Controller 设置响应头）
   */
  public async getAppToken(userId: string): Promise<string | null> {
    return this.redisService.get(`${REDIS_TOKEN_PREFIX}${userId}`);
  }

  /**
   * 注册 — 事务保证原子性
   */
  public async registerAppUser(registerDto: AppRegisterDto): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      // 检查用户是否已存在
      await this.checkUserExists(manager, registerDto);

      const user = manager.create(UserEntity, {
        ...this.buildRegisterData(registerDto),
        registrationSource: UserRegistrationSource.APP,
      });

      await manager.save(user);
      this.logger.log(`用户注册成功: ${user.id}`);
    });
  }

  /**
   * 查询用户信息
   */
  public async queryUserInfo(
    queryDto: AppQueryUserDto,
  ): Promise<{ userId: string; username: string | null; nickname: string | null; avatarUrl: string | null; phone: string | null; registrationSource: string; lastLoginAt: Date | null; createdAt: Date }> {
    const where: Record<string, string> = {};

    if (queryDto.userId) {
      where.id = queryDto.userId;
    } else if (queryDto.username) {
      where.username = queryDto.username;
    } else if (queryDto.phone) {
      where.phone = queryDto.phone;
    }

    const user = await this.userRepo.findOne({ where });
    if (!user) {
      throw new AppDataNotFoundException('用户不存在');
    }

    return {
      userId: user.id,
      username: user.username,
      nickname: user.nickname,
      avatarUrl: user.avatarUrl,
      phone: user.phone,
      registrationSource: user.registrationSource,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
    };
  }

  /**
   * 退出登录 — 删除 Redis 中的 Token
   */
  public async logout(userId: string): Promise<void> {
    await this.redisService.del(`${REDIS_TOKEN_PREFIX}${userId}`);
    this.logger.log(`用户退出登录: ${userId}`);
  }

  // ━━━ 私有方法 ━━━

  private async findUserForLogin(loginDto: AppLoginDto): Promise<UserEntity | null> {
    if (loginDto.type === AppLoginType.ACCOUNT_PASSWORD) {
      return this.userRepo.findOne({ where: { username: loginDto.username } });
    }
    if (loginDto.type === AppLoginType.PHONE_PASSWORD || loginDto.type === AppLoginType.PHONE_CODE) {
      return this.userRepo.findOne({ where: { phone: loginDto.phone } });
    }
    return null;
  }

  private async verifyPassword(loginDto: AppLoginDto, user: UserEntity): Promise<void> {
    if (loginDto.type === AppLoginType.PHONE_CODE) {
      // TODO: 验证短信验证码
      return;
    }

    if (!loginDto.password || !user.passwordHash) {
      throw new AppUnauthorizedException('用户名或密码错误');
    }

    const isMatch = await bcrypt.compare(loginDto.password, user.passwordHash);
    if (!isMatch) {
      const newCount = user.failedLoginCount + 1;
      const updateData: Partial<UserEntity> = { failedLoginCount: newCount };

      if (newCount >= MAX_FAILED_ATTEMPTS) {
        updateData.lockedUntil = new Date(Date.now() + LOCK_DURATION_MINUTES * 60 * 1000);
      }

      await this.userRepo.update(user.id, updateData);
      throw new AppUnauthorizedException('用户名或密码错误');
    }
  }

  private async checkUserExists(
    manager: import('typeorm').EntityManager,
    registerDto: AppRegisterDto,
  ): Promise<void> {
    if (registerDto.type === AppRegisterType.USERNAME_PASSWORD && registerDto.username) {
      const existing = await manager.findOne(UserEntity, {
        where: { username: registerDto.username },
      });
      if (existing) {
        throw new AppConflictException('用户名已存在');
      }
    }

    if (
      (registerDto.type === AppRegisterType.PHONE_PASSWORD ||
        registerDto.type === AppRegisterType.PHONE_CODE) &&
      registerDto.phone
    ) {
      const existing = await manager.findOne(UserEntity, {
        where: { phone: registerDto.phone },
      });
      if (existing) {
        throw new AppConflictException('该手机号已注册');
      }
    }
  }

  private buildRegisterData(registerDto: AppRegisterDto): Partial<UserEntity> {
    const data: Partial<UserEntity> = {};

    if (registerDto.type === AppRegisterType.USERNAME_PASSWORD) {
      data.username = registerDto.username!;
      data.passwordHash = bcrypt.hashSync(registerDto.password!, SALT_ROUNDS);
    }

    if (registerDto.type === AppRegisterType.PHONE_PASSWORD) {
      data.phone = registerDto.phone!;
      data.passwordHash = bcrypt.hashSync(registerDto.password!, SALT_ROUNDS);
    }

    if (registerDto.type === AppRegisterType.PHONE_CODE) {
      data.phone = registerDto.phone!;
      // TODO: 验证短信验证码
    }

    if (registerDto.nickname) {
      data.nickname = registerDto.nickname;
    }

    return data;
  }
}
