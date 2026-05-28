import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CLIENT_JWT_CONFIGS } from './auth.config';
import { AuthClient, JwtPayload, SignTokenOptions, TokenResult } from './auth.interfaces';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private readonly jwtService: JwtService) {}

  /**
   * 🔑 签发 Token
   * 各端的登录 Service 验证完账号密码后，调用此方法生成 Token
   *
   * @example
   * // 在 App 端的 user-service.ts 中：
   * const token = await this.authService.signToken({
   *   sub: user.id,
   *   client: AuthClient.APP,
   *   extra: { username: user.username },
   * });
   */
  public async signToken(options: SignTokenOptions): Promise<TokenResult> {
    const config = CLIENT_JWT_CONFIGS[options.client];
    if (!config) {
      throw new Error(`未知的 AuthClient: ${options.client}`);
    }

    const payload: JwtPayload = {
      sub: options.sub,
      client: options.client,
      extra: options.extra,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: config.secret,
      expiresIn: config.expiresIn as never,
    });


    this.logger.debug(`Token 签发成功: client=${options.client}, sub=${options.sub}`);

    return {
      accessToken,
      expiresIn: this.parseExpiry(config.expiresIn),
      tokenType: 'Bearer',
    };
  }

  /**
   * 🔍 验证 Token
   * Guard 内部调用此方法验证 Token 合法性
   * 会按 client 字段找到对应的 secret 进行验证
   */
  public async verifyToken(token: string): Promise<JwtPayload> {
    // 第一步：用通用方式解码（不验证签名），拿到 payload.client
    const decoded = this.jwtService.decode(token) as JwtPayload | null;
    if (!decoded?.client) {
      throw new Error('Token 格式无效');
    }

    // 第二步：根据 client 找到对应的 secret，进行签名验证
    const config = CLIENT_JWT_CONFIGS[decoded.client];
    if (!config) {
      throw new Error(`Token 中的 client 无效: ${decoded.client}`);
    }

    return this.jwtService.verify<JwtPayload>(token, {
      secret: config.secret,
    });
  }

  /**
   * 验证 Token 是否属于指定的端
   * 用于 Guard 中进一步校验角色匹配
   */
  public async verifyTokenForClients(
    token: string,
    allowedClients: AuthClient[],
  ): Promise<JwtPayload> {
    const payload = await this.verifyToken(token);

    if (allowedClients.length > 0 && !allowedClients.includes(payload.client)) {
      throw new Error(`权限不足: 需要 [${allowedClients.join(', ')}]，实际为 ${payload.client}`);
    }

    return payload;
  }

  /** 将 '7d' / '2h' 等字符串转为秒数 */
  private parseExpiry(expiresIn: string): number {
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) return 3600;
    const [, value, unit] = match;
    const num = parseInt(value, 10);
    const multipliers: Record<string, number> = {
      s: 1,
      m: 60,
      h: 3600,
      d: 86400,
    };
    return num * (multipliers[unit] ?? 1);
  }
}
