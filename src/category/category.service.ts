import { PrismaService } from '@/database/prisma.service';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { Role } from '@/database/generated/prisma/enums';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllByUser(userId: string) {
    return this.prisma.category.findMany({
      where: {
        deletedAt: null,
        OR: [{ isSystemCore: true }, { createdByUserId: userId }]
      },
      select: {
        id: true,
        name: true,
        type: true,
        isSystemCore: true,
        createdByUserId: true,
        _count: {
          select: {
            transactions: {
              where: {
                userId: userId,
                deletedAt: null
              }
            }
          }
        }
      },
      orderBy: { id: 'asc' }
    });
  }

  async create(userId: string, role: Role, dto: CreateCategoryDto) {
    const isAdmin = role === Role.ADMIN;

    const existingCategory = await this.prisma.category.findFirst({
      where: {
        name: dto.name,
        type: dto.type,
        deletedAt: null,
        OR: [{ isSystemCore: true }, { createdByUserId: userId }]
      }
    });
    if (existingCategory) {
      if (existingCategory.isSystemCore) {
        throw new BadRequestException(
          `This name ${dto.name} is reserved for system categories.`
        );
      }
      throw new BadRequestException(`Category ${dto.name} already exists`);
    }

    return this.prisma.category.create({
      data: {
        name: dto.name,
        type: dto.type,
        createdByUserId: userId,
        isSystemCore: isAdmin
      },
      select: {
        id: true,
        name: true,
        type: true,
        isSystemCore: true
      }
    });
  }

  async update(id: number, userId: string, role: Role, dto: UpdateCategoryDto) {
    const category = await this.prisma.category.findUnique({
      where: { id, deletedAt: null }
    });
    if (!category) {
      throw new NotFoundException('Not found category');
    }

    const isAdmin = role === Role.ADMIN;
    if (category.isSystemCore && !isAdmin) {
      throw new ForbiddenException('Cannot edit the system main category.');
    }
    if (!isAdmin && category.createdByUserId !== userId) {
      throw new ForbiddenException('Not Permission to edit this category');
    }
    if (dto.name && dto.name !== category.name) {
      const existingCategory = await this.prisma.category.findFirst({
        where: {
          name: dto.name,
          type: category?.type,
          deletedAt: null,
          NOT: { id },
          OR: [{ isSystemCore: true }, { createdByUserId: userId }]
        }
      });
      if (existingCategory) {
        if (existingCategory.isSystemCore) {
          throw new BadRequestException(
            `This name ${dto.name} is reserved for system categories.`
          );
        }
        throw new BadRequestException(`Category ${dto.name} have already`);
      }
    }
    return this.prisma.category.update({
      where: { id },
      data: {
        name: dto.name
      },
      select: {
        id: true,
        name: true,
        type: true
      }
    });
  }

  async remove(id: number, userId: string, role: Role) {
    const category = await this.prisma.category.findFirst({
      where: { id }
    });
    if (!category) {
      throw new NotFoundException('Not found category');
    }

    const isAdmin = role === Role.ADMIN;

    if (category.isSystemCore && !isAdmin) {
      throw new ForbiddenException('Cannot delete the system main category.');
    }
    if (!isAdmin && category.createdByUserId !== userId) {
      throw new ForbiddenException('Not Permission to edit this category');
    }

    const isCurrentlyDeleted = category.deletedAt !== null;
    await this.prisma.category.update({
      where: { id },
      data: { deletedAt: isCurrentlyDeleted ? null : new Date() }
    });
    return {
      message: isCurrentlyDeleted
        ? 'เปิดใช้งานหมวดหมู่เรียบร้อย'
        : 'ปิดใช้งานหมวดหมู่เรียบร้อย'
    };
  }
}
