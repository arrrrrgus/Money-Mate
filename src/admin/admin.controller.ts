import { Roles } from '@/common/decorators/roles.decorator';
import { Role, TicketStatus } from '@/database/generated/prisma/enums';
import { TicketService } from '@/ticket/ticket.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { RolesGuard } from '@/common/guards/roles.guard';
import { UpdateTicketStatusDto } from '@/ticket/dto/update-ticket-status.dto';
import { CategoryService } from '@/category/category.service';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { CreateCategoryDto } from '@/category/dto/create-category.dto';
import { UpdateCategoryDto } from '@/category/dto/update-category.dto';

@UseGuards(RolesGuard)
@Roles(Role.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(
    private readonly ticketService: TicketService,
    private readonly adminService: AdminService,
    private readonly categoryService: CategoryService
  ) {}
  @Get('tickets')
  async getTickets(@Query('status') status?: TicketStatus) {
    return this.ticketService.getAllTicketsForAdmin(status);
  }

  @Patch('tickets/:id/status')
  async updateTicketStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTicketStatusDto
  ) {
    return this.ticketService.updateTicketStatus(id, dto);
  }

  @Get('users')
  async getUsers(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string
  ) {
    return this.adminService.getUsers(
      page ? Number(page) : 1,
      limit ? Number(limit) : 10,
      search
    );
  }

  @Get('categories')
  async getCategories() {
    return this.adminService.getCategories();
  }

  @Post('categories')
  async createCategory(
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateCategoryDto
  ) {
    return this.categoryService.create(userId, Role.ADMIN, dto);
  }

  @Patch('categories/:id')
  async updateCategory(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('sub') userId: string,
    @Body() dto: UpdateCategoryDto
  ) {
    return this.categoryService.update(id, userId, Role.ADMIN, dto);
  }

  @Delete('categories/:id')
  async deleteCategory(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('sub') userId: string
  ) {
    return this.categoryService.remove(id, userId, Role.ADMIN);
  }

  @Get('stats/overview')
  async getStatsOverview() {
    return this.adminService.getStatusOverview();
  }
}
