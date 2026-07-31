import { Role, TicketStatus } from '@/database/generated/prisma/enums';
import { PrismaService } from '@/database/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class AdminService {
  constructor(private readonly prismaService: PrismaService) {}

  async getUsers(page = 1, limit = 10, search?: string) {
    const skip = (page - 1) * limit;

    const where = {
      role: Role.USER,
      ...(search
        ? {
            OR: [
              { username: { contains: search, mode: 'insensitive' as const } },
              { email: { contains: search, mode: 'insensitive' as const } }
            ]
          }
        : {})
    };
    const [users, total] = await Promise.all([
      this.prismaService.user.findMany({
        where,
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          createdAt: true,
          deletedAt: true
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      this.prismaService.user.count({ where })
    ]);
    return {
      users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async getCategories() {
    return this.prismaService.category.findMany({
      where: { isSystemCore: true },
      select: {
        id: true,
        name: true,
        type: true,
        isSystemCore: true
      },
      orderBy: { id: 'asc' }
    });
  }

  async getStatusOverview() {
    const [totalUserscount, totalTicketsPending, totalSystemCategories] =
      await Promise.all([
        this.prismaService.user.count({
          where: { deletedAt: null }
        }),
        this.prismaService.supportTicket.count({
          where: { status: TicketStatus.PENDING }
        }),
        this.prismaService.category.count({
          where: { isSystemCore: true }
        })
      ]);
    return {
      totalUsers: totalUserscount,
      activeUsers: totalUserscount,
      totalTicketsPending,
      totalSystemCategories
    };
  }

  async toggleUserStatus(userid: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userid }
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updateUser = await this.prismaService.user.update({
      where: { id: userid },
      data: {
        deletedAt: user.deletedAt ? null : new Date()
      },
      select: { id: true, username: true, email: true, deletedAt: true }
    });

    return {
      message: updateUser.deletedAt
        ? 'ปิดใช้งานผู้ใช้สำเร็จ'
        : 'เปิดใช้งานผู้ใช้เรียบร้อย',
      user: updateUser
    };
  }
}
