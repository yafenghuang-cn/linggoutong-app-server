/**
 * JWT Payload 标准结构
 * 所有端签发的 Token 都遵循这个结构
 */
export interface JwtPayload {
  /** 用户唯一标识 */
  sub: string;
  /** 用户所属端 */
  client: AuthClient;
  /** 附加信息（如用户名、手机号等，按需传入） */
  extra?: Record<string, unknown>;
}

/**
 * 支持的客户端/端标识
 * 新增端只需在这里加一个枚举值
 */
export enum AuthClient {
  APP = 'app', // App C 端用户
  ADMIN = 'admin', // 后台管理员
  MERCHANT = 'merchant', // 商户端
  // 按需继续扩展...
}

/**
 * 每个端的 JWT 配置
 */
export interface ClientJwtConfig {
  /** JWT 签名密钥（不同端用不同密钥，互相隔离） */
  secret: string;
  /** Token 有效期，如 '7d'、'2h'、'30m' */
  expiresIn: string;
}

/**
 * signToken() 的入参
 */
export interface SignTokenOptions {
  /** 用户标识 */
  sub: string;
  /** 所属端 */
  client: AuthClient;
  /** 附加信息 */
  extra?: Record<string, unknown>;
}

/**
 * signToken() 的返回值
 */
export interface TokenResult {
  accessToken: string;
  expiresIn: number; // 秒
  tokenType: 'Bearer';
}
