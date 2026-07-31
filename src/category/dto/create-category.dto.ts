import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString
} from 'class-validator';
import { Type } from '@/database/generated/prisma/enums';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(Type)
  @IsNotEmpty()
  type: Type;

  @IsBoolean()
  @IsOptional()
  isSystemCore?: boolean;
}
