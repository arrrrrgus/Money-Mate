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
import { TransactionService } from './transaction.service';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

@Controller('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  async createTransaction(
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateTransactionDto
  ) {
    return this.transactionService.createTransaction(userId, dto);
  }

  @Get()
  async getUserTransactions(@CurrentUser('sub') userId: string) {
    return this.transactionService.getUserTransactions(userId);
  }
  @Get('summary')
  async getSummary(@CurrentUser('sub') userId: string) {
    return this.transactionService.getSummary(userId);
  }

  @Get(':id')
  async getTransactionById(
    @CurrentUser('sub') userId: string,
    @Param('id', ParseIntPipe) id: number
  ) {
    return this.transactionService.getTransactionById(userId, id);
  }

  @Patch(':id')
  async updateTransaction(
    @CurrentUser('sub') userId: string,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTransactionDto
  ) {
    return this.transactionService.updateTransaction(userId, id, dto);
  }

  @Delete(':id')
  async deleteTransaction(
    @CurrentUser('sub') userId: string,
    @Param('id', ParseIntPipe) id: number
  ) {
    return this.transactionService.deleteTransaction(userId, id);
  }
}
