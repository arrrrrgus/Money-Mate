import { Body, Controller, Post } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { CreateTicketDto } from './dto/create-ticket.dto';

@Controller('ticket')
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  @Post()
  async createTicket(
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateTicketDto
  ) {
    return this.ticketService.createTicket(userId, dto);
  }
}
