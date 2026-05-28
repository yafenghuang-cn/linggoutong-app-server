import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsMobilePhone, IsNotEmpty, IsOptional, IsString, Matches, MinLength, ValidateIf } from 'class-validator';

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

export enum AppRegisterType {
  USERNAME_PASSWORD = 'username_password',
  PHONE_PASSWORD = 'phone_password',
  PHONE_CODE = 'phone_code',
}

export class AppRegisterDto {
  @ApiProperty({
    description: '注册方式',
    enum: AppRegisterType,
    example: AppRegisterType.USERNAME_PASSWORD,
  })
  @IsEnum(AppRegisterType)
  public type: AppRegisterType;

  @ApiProperty({ description: '用户名，用户名注册时必填', required: false, example: 'alice' })
  @ValidateIf((dto: AppRegisterDto) => dto.type === AppRegisterType.USERNAME_PASSWORD)
  @IsString()
  @IsNotEmpty({ message: '用户名不能为空' })
  @MinLength(3, { message: '用户名至少3个字符' })
  public username?: string;

  @ApiProperty({ description: '手机号，手机号注册时必填', required: false, example: '13800138000' })
  @ValidateIf(
    (dto: AppRegisterDto) =>
      dto.type === AppRegisterType.PHONE_PASSWORD || dto.type === AppRegisterType.PHONE_CODE,
  )
  @IsNotEmpty({ message: '手机号不能为空' })
  @IsMobilePhone('zh-CN', {}, { message: '手机号格式不正确' })
  public phone?: string;

  @ApiProperty({ description: '密码，密码注册时必填', required: false, example: 'secret123' })
  @ValidateIf(
    (dto: AppRegisterDto) =>
      dto.type === AppRegisterType.USERNAME_PASSWORD || dto.type === AppRegisterType.PHONE_PASSWORD,
  )
  @IsString()
  @IsNotEmpty({ message: '密码不能为空' })
  @MinLength(6, { message: '密码至少6个字符' })
  public password?: string;

  @ApiProperty({ description: '手机验证码，验证码注册时必填', required: false, example: '123456' })
  @ValidateIf((dto: AppRegisterDto) => dto.type === AppRegisterType.PHONE_CODE)
  @IsString()
  @IsNotEmpty({ message: '验证码不能为空' })
  @Matches(/^\d{6}$/, { message: '验证码必须为6位数字' })
  public verificationCode?: string;

  @ApiProperty({ description: '昵称', required: false, example: '小明' })
  @ValidateIf((dto: AppRegisterDto) => !!dto.nickname)
  @IsString()
  public nickname?: string;
}

export class AppQueryUserDto {
  @ApiProperty({ description: '用户 ID', required: false, example: '1' })
  @IsOptional()
  @IsString()
  public userId?: string;

  @ApiProperty({ description: '用户名', required: false, example: 'alice' })
  @IsOptional()
  @IsString()
  public username?: string;

  @ApiProperty({ description: '手机号', required: false, example: '13800138000' })
  @IsOptional()
  @IsMobilePhone('zh-CN', {}, { message: '手机号格式不正确' })
  public phone?: string;
}