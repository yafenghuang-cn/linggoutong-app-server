import { SetMetadata } from '@nestjs/common';

/**
 * 标记路由为公开，跳过 JWT 认证
 * 用法: @Public()
 */
export const PUBLIC_KEY = 'is_public_route';
export const Public = () => SetMetadata(PUBLIC_KEY, true);
