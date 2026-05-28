import type { ClientJwtConfig } from './auth.interfaces';
import { AuthClient } from './auth.interfaces';

/**
 * 各端的 JWT 配置映射
 * - 不同端使用不同的 secret，A 端的 Token 无法访问 B 端
 * - 不同端可以设置不同的过期时间
 * - 生产环境务必通过环境变量注入 secret
 */
export const CLIENT_JWT_CONFIGS: Record<AuthClient, ClientJwtConfig> = {
  [AuthClient.APP]: {
    secret: process.env.JWT_APP_SECRET || 'dev-app-secret-change-me',
    expiresIn: process.env.JWT_APP_EXPIRES || '30d',
  },
  [AuthClient.ADMIN]: {
    secret: process.env.JWT_ADMIN_SECRET || 'dev-admin-secret-change-me',
    expiresIn: process.env.JWT_ADMIN_EXPIRES || '2h',
  },
  [AuthClient.MERCHANT]: {
    secret: process.env.JWT_MERCHANT_SECRET || 'dev-merchant-secret-change-me',
    expiresIn: process.env.JWT_MERCHANT_EXPIRES || '7d',
  },
};
