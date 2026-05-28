import { Global, Module } from '@nestjs/common';
import { INJECTION_TOKENS } from '@/common/injection-tokens';
import { RedisService } from './redis.service';

@Global()
@Module({
  providers: [
    RedisService,
    {
      provide: INJECTION_TOKENS.REDIS_SERVICE,
      useExisting: RedisService,
    },
  ],
  exports: [RedisService, INJECTION_TOKENS.REDIS_SERVICE],
})
export class CoreRedisModule {}
