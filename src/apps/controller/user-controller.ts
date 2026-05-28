import { Body, Controller, Get, Post, Query, Res } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { AppLoginDto, AppQueryUserDto, AppRegisterDto } from '@/apps/dto/userDto';
import { AppLoginVo, AppUserInfoVo } from '@/apps/vo/userVo';
import { UserAuthService } from '@/core/user/user-auth.service';
import { AuthClient, Public } from '@/core/auth';

@ApiTags('/app/user')
@Controller('/app/user')
export class UserController {
  constructor(private readonly userAuthService: UserAuthService) {}

  @Post('login')
  @Public()
  @ApiOperation({ summary: 'App 用户登录' })
  @ApiOkResponse({ type: AppLoginVo, description: '登录成功' })
  @ApiBody({ type: AppLoginDto })
  public async login(
    @Body() loginDto: AppLoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AppLoginVo> {
    const result = await this.userAuthService.login(loginDto, AuthClient.APP);

    const token = await this.userAuthService.getToken(result.userId, AuthClient.APP);
    if (token) {
      res.header('Authorization', `Bearer ${token}`);
    }

    return result;
  }

  @Post('register')
  @Public()
  @ApiOperation({ summary: 'App 用户注册' })
  @ApiOkResponse({ description: '注册成功' })
  @ApiBody({ type: AppRegisterDto })
  public async register(@Body() registerDto: AppRegisterDto): Promise<void> {
    await this.userAuthService.register(registerDto, AuthClient.APP);
  }

  @Get('info')
  @ApiOperation({ summary: '查询用户信息' })
  @ApiOkResponse({ type: AppUserInfoVo, description: '查询成功' })
  public async getUserInfo(@Query() queryDto: AppQueryUserDto): Promise<AppUserInfoVo> {
    return this.userAuthService.queryUser(queryDto);
  }
}
