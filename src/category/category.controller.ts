import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Role } from '@/database/generated/prisma/enums';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  async getMyCategories(@CurrentUser('sub') userId: string) {
    return this.categoryService.findAllByUser(userId);
  }

  @Post()
  async createCategory(
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') role: Role,
    @Body() dto: CreateCategoryDto
  ) {
    return this.categoryService.create(userId, role, dto);
  }

  @Patch(':id')
  async updateCategory(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') role: Role,
    @Body() dto: UpdateCategoryDto
  ) {
    return this.categoryService.update(id, userId, role, dto);
  }

  @Delete(':id')
  async deleteCategory(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') role: Role
  ) {
    return this.categoryService.remove(id, userId, role);
  }
}
