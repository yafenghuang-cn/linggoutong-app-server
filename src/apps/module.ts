import { Module } from '@nestjs/common';
import { UserController } from '@/apps/controller/user-controller';

@Module({
  controllers: [UserController],
})
export class AppsModule {}
