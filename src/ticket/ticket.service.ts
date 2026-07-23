import { PrismaService } from '@/database/prisma.service';
import { Injectable } from '@nestjs/common';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { TicketStatus } from '@/database/generated/prisma/enums';

@Injectable()
export class TicketService {
  constructor(private readonly prismaService: PrismaService) {}

  async createTicket(userId: string, dto: CreateTicketDto) {
    return this.prismaService.supportTicket.create({
      data: {
        userId,
        subject: dto.subject,
        description: dto.description,
        status: TicketStatus.PENDING
      }
    });
  }

  async getUserTickets(userId: string) {
    return this.prismaService.supportTicket.findMany({
      where: { userId },
      select: {
        id: true,
        subject: true,
        description: true,
        status: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }
}
