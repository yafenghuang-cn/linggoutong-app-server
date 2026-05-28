import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { UserController } from '@/apps/controller/user-controller';
import { UserServices } from '@/apps/service/user-service';

@Module({
  imports: [],
  controllers: [UserController],
  providers: [UserServices],
})
export class AppsModule {}
