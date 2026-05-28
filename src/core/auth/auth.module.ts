import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';

@Global()
@Module({
  imports: [
    JwtModule.register({
      // 这里设置一个默认配置，实际签发/验证时会被 signToken/verifyToken 中的参数覆盖
      secret: process.env.JWT_DEFAULT_SECRET || 'default-secret',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  providers: [AuthService, AuthGuard],
  exports: [AuthService, JwtModule],
})
export class CoreAuthModule {}
