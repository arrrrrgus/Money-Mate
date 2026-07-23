import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateTicketDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  subject: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  description: string;
}
