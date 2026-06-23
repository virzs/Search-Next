import { IsOptional } from 'class-validator';
import { BaseUserDto } from './create-user.dto';

export class UpdateUserDto extends BaseUserDto {
  @IsOptional()
  username: string;

  @IsOptional()
  email: string;

  @IsOptional()
  status: number;

  @IsOptional()
  roles: string[];
}
