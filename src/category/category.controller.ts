import { AuthGuard } from '@/auth/guards/auth.guard';
import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Role } from '@/database/generated/prisma/enums';
import { CreateCategoryDto } from './dto/create-category.dto';

@UseGuards(AuthGuard)
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
    @Body() dto: CreateCategoryDto,
  ) {
    return this.categoryService.create(userId, role, dto);
  }
}
