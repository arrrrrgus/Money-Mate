import { PrismaService } from '@/database/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { TicketStatus } from '@/database/generated/prisma/enums';
import { UpdateTicketStatusDto } from './dto/update-ticket-status.dto';

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

  async getAllTicketsForAdmin(status?: TicketStatus) {
    return this.prismaService.supportTicket.findMany({
      where: status ? { status } : {},
      select: {
        id: true,
        subject: true,
        description: true,
        status: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async updateTicketStatus(id: number, dto: UpdateTicketStatusDto) {
    const ticket = await this.prismaService.supportTicket.findUnique({
      where: { id }
    });
    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }
    return this.prismaService.supportTicket.update({
      where: { id },
      data: {
        status: dto.status
      }
    });
  }
}
