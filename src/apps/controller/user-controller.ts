import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AppLoginDto } from '../dto/userDto';
import { UserServices } from '../service/user-service';
import { AppLoginVo } from '../vo/userVo';

@ApiTags('/app/user')
@Controller('/app/user')
export class UserController {
  constructor(private readonly UserServices: UserServices) {}
  /**
   * app登录接口
   */
  @Post('login')
  @ApiOperation({ summary: 'App 用户登录' })
  @ApiOkResponse({ type: AppLoginVo, description: '登录成功' })
  @ApiBody({ type: AppLoginDto })
  public async login(@Body() loginDto: AppLoginDto): Promise<AppLoginVo> {
    return this.UserServices.loginAppUser(loginDto);
  }

  /**
   * app注册
   */
  // @Post('register')
  // @ApiOperation({ summary: 'App 用户注册' })
  // register() {
  //   return '注册成功';
  // }
}
