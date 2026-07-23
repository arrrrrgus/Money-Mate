import { TicketStatus } from '@/database/generated/prisma/enums';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class UpdateTicketStatusDto {
  @IsNotEmpty()
  @IsEnum(TicketStatus)
  status: TicketStatus;
}
