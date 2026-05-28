import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsString } from 'class-validator';

export class AppLoginVo {
  @ApiProperty({ description: '用户名', example: 'alice' })
  @Expose()
  @IsString()
  public username: string;

  @ApiProperty({ description: '用户 ID', example: '1' })
  @Expose()
  @IsString()
  public userId: string;
}
