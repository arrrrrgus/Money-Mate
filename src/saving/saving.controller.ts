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
import { SavingService } from './saving.service';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { CreateSavingDto } from './dto/create-saving.dto';
import { TopupSavingDto } from './dto/topup-saving.dto';
import { UpdateSavingDto } from './dto/update-saving.dto';

@Controller('saving')
export class SavingController {
  constructor(private readonly savingService: SavingService) {}

  @Get()
  async getUserSaving(@CurrentUser('sub') userId: string) {
    return this.savingService.getUserSavings(userId);
  }

  @Post()
  async createSaving(
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateSavingDto
  ) {
    return this.savingService.createSaving(userId, dto);
  }

  @Patch(':id/topup')
  async topupSaving(
    @CurrentUser('sub') userId: string,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: TopupSavingDto
  ) {
    return this.savingService.topupSaving(userId, id, dto);
  }

  @Get(':id')
  async getSavingById(
    @CurrentUser('sub') userId: string,
    @Param('id', ParseIntPipe) id: number
  ) {
    return this.savingService.getSavingByid(userId, id);
  }

  @Patch(':id')
  async updateSaving(
    @CurrentUser('sub') userId: string,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSavingDto
  ) {
    return this.savingService.updateSaving(userId, id, dto);
  }

  @Delete(':id')
  async deleteSaving(
    @CurrentUser('sub') userId: string,
    @Param('id', ParseIntPipe) id: number
  ) {
    return this.savingService.deleteSaving(userId, id);
  }
}
