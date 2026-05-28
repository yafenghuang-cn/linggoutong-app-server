import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { AppLoginDto } from '../dto/userDto';
import { AppLoginVo } from '../vo/userVo';

@Injectable()
export class UserServices {
  public async loginAppUser(loginDto: AppLoginDto): Promise<AppLoginVo> {
    if (loginDto.username) {
      return {
        username: loginDto.username,
        userId: '0001',
      };
    }

    throw new InternalServerErrorException('登录失败');
  }
}
