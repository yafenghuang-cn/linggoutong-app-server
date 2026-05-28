// src/app.module.ts
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { INJECTION_TOKENS } from '@/common/injection-tokens';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpExceptionFilter } from '@/shared/http-exception.interceptor';
import { GlobalResponseWrapperInterceptor } from '@/shared/global-response.interceptor';
import { RequestLoggingInterceptor } from '@/shared/request-logging.interceptor';
import { RequestContextMiddleware } from '@/common/request-context.middleware';

import { CoreAuthModule, AuthGuard } from '@/core/auth';
import { CoreRedisModule } from '@/core/redis/redis.module';
import { CoreUserModule } from '@/core/user';
import { AppsModule } from '@/apps/module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get<string>('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 3306),
        username: config.get<string>('DB_USERNAME', 'root'),
        password: config.get<string>('DB_PASSWORD', 'root'),
        database: config.get<string>('DB_DATABASE', 'linggoutong'),
        autoLoadEntities: true,
        synchronize: config.get<boolean>('DB_SYNCHRONIZE', true),
        logging: config.get<boolean>('DB_LOGGING', false),
      }),
    }),
    CoreRedisModule,
    CoreAuthModule,
    CoreUserModule,
    AppsModule,
  ],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: RequestLoggingInterceptor },
    { provide: APP_INTERCEPTOR, useClass: GlobalResponseWrapperInterceptor },
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
    { provide: INJECTION_TOKENS.DEFAULT_SUCCESS_CODE, useValue: 0 },
    { provide: INJECTION_TOKENS.DEFAULT_ERROR_CODE, useValue: 9000 },
  ],
})
export class AppModule implements NestModule {
  public configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestContextMiddleware).forRoutes('*');
  }
}
