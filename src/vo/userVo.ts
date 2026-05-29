import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class AppLoginVo {
  @ApiProperty({ description: '用户 ID', example: '1' })
  @Expose()
  public userId: string;

  @ApiProperty({ description: '用户名', example: 'alice', nullable: true })
  @Expose()
  public username: string | null;

  @ApiProperty({ description: '昵称', example: '小明', nullable: true })
  @Expose()
  public nickname: string | null;
}

export class AppUserInfoVo {
  @ApiProperty({ description: '用户 ID', example: '1' })
  @Expose()
  public userId: string;

  @ApiProperty({ description: '用户名', example: 'alice', nullable: true })
  @Expose()
  public username: string | null;

  @ApiProperty({ description: '昵称', example: '小明', nullable: true })
  @Expose()
  public nickname: string | null;

  @ApiProperty({ description: '头像 URL', nullable: true })
  @Expose()
  public avatarUrl: string | null;

  @ApiProperty({ description: '手机号', example: '138****8000', nullable: true })
  @Expose()
  public phone: string | null;

  @ApiProperty({ description: '注册来源', example: 'app' })
  @Expose()
  public registrationSource: string;

  @ApiProperty({ description: '最后登录时间', nullable: true })
  @Expose()
  public lastLoginAt: Date | null;

  @ApiProperty({ description: '注册时间' })
  @Expose()
  public createdAt: Date;
}
