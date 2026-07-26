import {
  IsAlphanumeric,
  IsNotEmpty,
  IsString,
  MinLength
} from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @IsAlphanumeric()
  oldPassword: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @IsAlphanumeric()
  newPassword: string;
}
