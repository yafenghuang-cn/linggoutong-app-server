import { SetMetadata } from '@nestjs/common';
import type { AuthClient } from '../auth.interfaces';

/**
 * 限制路由只允许指定端的用户访问
 * 用法: @AllowClients(AuthClient.APP)
 *
 * 如果不加此装饰器，则所有已认证的 Token 都可访问（仅校验 Token 有效性）
 */
export const ALLOW_CLIENTS_KEY = 'allow_clients';
export const AllowClients = (...clients: AuthClient[]) => SetMetadata(ALLOW_CLIENTS_KEY, clients);
