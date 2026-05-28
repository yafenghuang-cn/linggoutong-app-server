import { AppUnauthorizedException } from '@/common/enterprise-exceptions';
import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthClient } from './auth.interfaces';
import { AuthService } from './auth.service';
import { PUBLIC_KEY } from './decorators/public.decorator';
import { ALLOW_CLIENTS_KEY } from './decorators/roles.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly authService: AuthService,
  ) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    // ━━━ 1. 公开路由直接放行 ━━━
    const isPublic = this.reflector.getAllAndOverride<boolean>(PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    // ━━━ 2. 提取 Token ━━━
    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);
    if (!token) {
      throw new AppUnauthorizedException('缺少认证 Token，请先登录');
    }

    // ━━━ 3. 获取路由允许的端列表 ━━━
    const allowedClients =
      this.reflector.getAllAndOverride<AuthClient[]>(ALLOW_CLIENTS_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? []; // 空数组 = 不限制端，只要 Token 有效即可

    // ━━━ 4. 验证 Token ━━━
    try {
      const payload = await this.authService.verifyTokenForClients(token, allowedClients);
      // 将用户信息挂载到 request
      request.user = payload;
    } catch (error: any) {
      this.logger.warn(`Token 验证失败: ${error.message}`);
      throw new AppUnauthorizedException('Token 无效或已过期，请重新登录');
    }

    return true;
  }

  private extractToken(request: any): string | undefined {
    const [type, token] = request.headers?.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
