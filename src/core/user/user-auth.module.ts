import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '@/core/user/entity/user.entity';
import { UserAuthService } from './user-auth.service';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  providers: [UserAuthService],
  exports: [UserAuthService],
})
export class CoreUserModule {}
