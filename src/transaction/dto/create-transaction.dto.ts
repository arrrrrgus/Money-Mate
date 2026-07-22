import { Type } from 'class-transformer';
import {
  IsDate,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min
} from 'class-validator';

export class CreateTransactionDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsInt()
  @IsNotEmpty()
  categoryId: number;

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  transactionDate: Date;

  @IsOptional()
  @IsString()
  note?: string;
}
