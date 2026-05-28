import type { ExecutionContext } from '@nestjs/common';
import { createParamDecorator } from '@nestjs/common';
import type { JwtPayload } from '../auth.interfaces';

/**
 * 从请求中提取当前登录用户信息
 *
 * @example
 * // 获取完整 payload
 * getProfile(@CurrentUser() user: JwtPayload) {}
 *
 * // 只获取用户 ID
 * getProfile(@CurrentUser('sub') userId: string) {}
 *
 * // 获取附加信息
 * getProfile(@CurrentUser('extra') extra: Record<string, unknown>) {}
 */
export const CurrentUser = createParamDecorator(
  (data: keyof JwtPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as JwtPayload;
    if (!user) return undefined;
    return data ? user[data] : user;
  },
);
