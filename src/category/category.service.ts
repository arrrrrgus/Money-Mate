import { PrismaService } from '@/database/prisma.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { Role } from '@/database/generated/prisma/enums';

@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllByUser(userId: string) {
    return this.prisma.category.findMany({
      where: {
        OR: [{ isSystemCore: true }, { createdByUserId: userId }],
      },
      select: {
        id: true,
        name: true,
        type: true,
      },
      orderBy: { id: 'asc' },
    });
  }

  async create(userId: string, role: Role, dto: CreateCategoryDto) {
    const isAdmin = role === Role.ADMIN;

    const existingCategory = await this.prisma.category.findFirst({
      where: {
        name: dto.name,
        type: dto.type,
        OR: [{ isSystemCore: true }, { createdByUserId: userId }],
      },
    });
    if (existingCategory) {
      if (existingCategory.isSystemCore) {
        throw new BadRequestException(
          `This name ${dto.name} is reserved for system categories.`,
        );
      }
      throw new BadRequestException(`Category ${dto.name} have already`);
    }

    return this.prisma.category.create({
      data: {
        name: dto.name,
        type: dto.type,
        createdByUserId: userId,
        isSystemCore: isAdmin,
      },
      select: {
        id: true,
        name: true,
        type: true,
        isSystemCore: true,
      },
    });
  }
}
