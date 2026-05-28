import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { UserEntity, UserRegistrationSource } from '@/apps/entity/user.entity';
import { AuthService, AuthClient } from '@/core/auth';
import { RedisService } from '@/core/redis/redis.service';
import {
  AppConflictException,
  AppDataNotFoundException,
  AppBusinessException,
  AppUnauthorizedException,
} from '@/common/enterprise-exceptions';

const SALT_ROUNDS = 10;
const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION_MINUTES = 30;

/** 登录请求 — 各端 DTO 只要结构兼容即可 */
export interface LoginParams {
  type: string;
  username?: string;
  phone?: string;
  password?: string;
  verificationCode?: string;
}

/** 注册请求 */
export interface RegisterParams {
  type: string;
  username?: string;
  phone?: string;
  password?: string;
  verificationCode?: string;
  nickname?: string;
}

/** 查询用户请求 */
export interface QueryUserParams {
  userId?: string;
  username?: string;
  phone?: string;
}

/** 登录/注册成功后的用户信息 */
export interface AuthUserResult {
  userId: string;
  username: string | null;
  nickname: string | null;
}

/** 用户详情 */
export interface UserInfoResult {
  userId: string;
  username: string | null;
  nickname: string | null;
  avatarUrl: string | null;
  phone: string | null;
  registrationSource: string;
  lastLoginAt: Date | null;
  createdAt: Date;
}

@Injectable()
export class UserAuthService {
  private readonly logger = new Logger(UserAuthService.name);

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
  public async login(params: LoginParams, client: AuthClient): Promise<AuthUserResult> {
    const user = await this.findUserForLogin(params);
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

    await this.verifyPassword(params, user);

    if (user.failedLoginCount > 0) {
      await this.userRepo.update(user.id, { failedLoginCount: 0, lockedUntil: null });
    }

    await this.userRepo.update(user.id, { lastLoginAt: new Date() });

    const tokenResult = await this.authService.signToken({
      sub: user.id,
      client,
      extra: { username: user.username },
    });

    await this.redisService.set(
      this.tokenKey(user.id, client),
      tokenResult.accessToken,
      tokenResult.expiresIn,
    );

    this.logger.log(`用户登录成功: client=${client}, userId=${user.id}`);

    return {
      userId: user.id,
      username: user.username,
      nickname: user.nickname,
    };
  }

  /**
   * 注册 — 事务保证原子性
   */
  public async register(params: RegisterParams, client: AuthClient): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      await this.checkUserExists(manager, params);

      const user = manager.create(UserEntity, {
        ...this.buildRegisterData(params),
        registrationSource: UserRegistrationSource.APP,
      });

      await manager.save(user);
      this.logger.log(`用户注册成功: client=${client}, userId=${user.id}`);
    });
  }

  /**
   * 查询用户信息
   */
  public async queryUser(params: QueryUserParams): Promise<UserInfoResult> {
    const where: Record<string, string> = {};

    if (params.userId) {
      where.id = params.userId;
    } else if (params.username) {
      where.username = params.username;
    } else if (params.phone) {
      where.phone = params.phone;
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
   * 获取 Token
   */
  public async getToken(userId: string, client: AuthClient): Promise<string | null> {
    return this.redisService.get(this.tokenKey(userId, client));
  }

  /**
   * 退出登录
   */
  public async logout(userId: string, client: AuthClient): Promise<void> {
    await this.redisService.del(this.tokenKey(userId, client));
    this.logger.log(`用户退出登录: client=${client}, userId=${userId}`);
  }

  // ━━━ 私有方法 ━━━

  private tokenKey(userId: string, client: AuthClient): string {
    return `auth:${client}:user:${userId}`;
  }

  private async findUserForLogin(params: LoginParams): Promise<UserEntity | null> {
    if (params.type === 'account_password') {
      return this.userRepo.findOne({ where: { username: params.username } });
    }
    if (params.type === 'phone_password' || params.type === 'phone_code') {
      return this.userRepo.findOne({ where: { phone: params.phone } });
    }
    return null;
  }

  private async verifyPassword(params: LoginParams, user: UserEntity): Promise<void> {
    if (params.type === 'phone_code') {
      // TODO: 验证短信验证码
      return;
    }

    if (!params.password || !user.passwordHash) {
      throw new AppUnauthorizedException('用户名或密码错误');
    }

    const isMatch = await bcrypt.compare(params.password, user.passwordHash);
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
    params: RegisterParams,
  ): Promise<void> {
    if (params.type === 'username_password' && params.username) {
      const existing = await manager.findOne(UserEntity, {
        where: { username: params.username },
      });
      if (existing) {
        throw new AppConflictException('用户名已存在');
      }
    }

    if (
      (params.type === 'phone_password' || params.type === 'phone_code') &&
      params.phone
    ) {
      const existing = await manager.findOne(UserEntity, {
        where: { phone: params.phone },
      });
      if (existing) {
        throw new AppConflictException('该手机号已注册');
      }
    }
  }

  private buildRegisterData(params: RegisterParams): Partial<UserEntity> {
    const data: Partial<UserEntity> = {};

    if (params.type === 'username_password') {
      data.username = params.username!;
      data.passwordHash = bcrypt.hashSync(params.password!, SALT_ROUNDS);
    }

    if (params.type === 'phone_password') {
      data.phone = params.phone!;
      data.passwordHash = bcrypt.hashSync(params.password!, SALT_ROUNDS);
    }

    if (params.type === 'phone_code') {
      data.phone = params.phone!;
      // TODO: 验证短信验证码
    }

    if (params.nickname) {
      data.nickname = params.nickname;
    }

    return data;
  }
}
