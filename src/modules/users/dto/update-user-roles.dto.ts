import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, ArrayUnique, IsArray, IsEmail, IsString, MinLength } from 'class-validator';

export class UpdateUserRolesDto {
  @ApiProperty({ type: [String], example: ['role-author', 'role-reviewer'] })
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsString({ each: true })
  roleIds!: string[];

  @ApiProperty({ example: 'admin@example.com', description: 'Current administrator email' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: '123456', description: 'Current administrator password', writeOnly: true })
  @IsString()
  @MinLength(6)
  password!: string;
}
