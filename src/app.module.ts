import { Module } from '@nestjs/common';
import { INJECTION_TOKENS } from '@/common/injection-tokens';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { HttpExceptionFilter } from '@/shared/http-exception.interceptor';
import { DtoTransformInterceptor } from '@/shared/dto-transform.interceptor';
import { GlobalResponseWrapperInterceptor } from '@/shared/global-response.interceptor';
import { RequestLoggingInterceptor } from '@/shared/request-logging.interceptor';

import { AppsModule } from '@/apps/module';
@Module({
  imports: [AppsModule],
  controllers: [],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: RequestLoggingInterceptor },
    { provide: APP_INTERCEPTOR, useClass: GlobalResponseWrapperInterceptor },
    { provide: APP_INTERCEPTOR, useClass: DtoTransformInterceptor },
    // { provide: APP_GUARD, useClass: ≈≈ },
    { provide: INJECTION_TOKENS.DEFAULT_DTO, useValue: null },
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
    { provide: INJECTION_TOKENS.DEFAULT_SUCCESS_CODE, useValue: 0 },
    { provide: INJECTION_TOKENS.DEFAULT_ERROR_CODE, useValue: 9000 },
  ],
})
export class AppModule {}
