import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsMobilePhone, IsNotEmpty, IsString, Matches, ValidateIf } from 'class-validator';

export enum AppLoginType {
  ACCOUNT_PASSWORD = 'account_password',
  PHONE_PASSWORD = 'phone_password',
  PHONE_CODE = 'phone_code',
}

export class AppLoginDto {
  @ApiProperty({
    description: '登录方式',
    enum: AppLoginType,
    example: AppLoginType.ACCOUNT_PASSWORD,
  })
  @IsEnum(AppLoginType)
  public type: AppLoginType;

  @ApiProperty({ description: '用户名，账号密码登录时必填', required: false, example: 'alice' })
  @ValidateIf((dto: AppLoginDto) => dto.type === AppLoginType.ACCOUNT_PASSWORD)
  @IsString()
  @IsNotEmpty({ message: '账号不能为空' })
  public username?: string;

  @ApiProperty({ description: '手机号，手机号登录时必填', required: false, example: '13800138000' })
  @ValidateIf(
    (dto: AppLoginDto) =>
      dto.type === AppLoginType.PHONE_PASSWORD || dto.type === AppLoginType.PHONE_CODE,
  )
  @IsNotEmpty({ message: '手机号不能为空' })
  @IsMobilePhone('zh-CN', {}, { message: '手机号格式不正确' })
  public phone?: string;

  @ApiProperty({ description: '密码，密码登录时必填', required: false, example: 'secret123' })
  @ValidateIf(
    (dto: AppLoginDto) =>
      dto.type === AppLoginType.ACCOUNT_PASSWORD || dto.type === AppLoginType.PHONE_PASSWORD,
  )
  @IsString()
  @IsNotEmpty({ message: '密码不能为空' })
  public password?: string;

  @ApiProperty({ description: '手机验证码，验证码登录时必填', required: false, example: '123456' })
  @ValidateIf((dto: AppLoginDto) => dto.type === AppLoginType.PHONE_CODE)
  @IsString()
  @IsNotEmpty({ message: '验证码不能为空' })
  @Matches(/^\d{6}$/, { message: '验证码必须为6位数字' })
  public verificationCode?: string;
}