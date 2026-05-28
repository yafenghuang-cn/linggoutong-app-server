import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from '@/apps/controller/user-controller';
import { UserServices } from '@/apps/service/user-service';
import { UserEntity } from '@/apps/entity/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  controllers: [UserController],
  providers: [UserServices],
})
export class AppsModule {}
