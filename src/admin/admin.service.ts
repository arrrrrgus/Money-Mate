import { PrismaService } from '@/database/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AdminService {
  constructor(private readonly prismaService: PrismaService) {}

  async getUsers(page = 1, limit = 10, search?: string) {
    const skip = (page - 1) * limit;

    const where = {
      deletedAt: null,
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
          firstName: true,
          lastName: true,
          role: true,
          createdAt: true
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
    const [categories, totalCategories] = await Promise.all([
      this.prismaService.category.findMany({
        where: { isSystemCore: true },
        orderBy: { name: 'asc' }
      }),
      this.prismaService.category.count()
    ]);
    return {
      systemCategories: categories,
      totalCategoriesCount: totalCategories
    };
  }
}
