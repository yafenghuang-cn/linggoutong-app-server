import { ClassSerializerInterceptor, Module } from '@nestjs/common';

import { AppsModule } from '@/apps/module';
@Module({
  imports: [AppsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
