import { PrismaService } from '@/database/prisma.service';
import {
  ForbiddenException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

@Injectable()
export class TransactionService {
  constructor(private readonly prisma: PrismaService) {}

  async createTransaction(userId: string, dto: CreateTransactionDto) {
    const category = await this.prisma.category.findUnique({
      where: { id: dto.categoryId }
    });

    if (!category) {
      throw new NotFoundException('The specified category was not found');
    }

    return this.prisma.transaction.create({
      data: {
        title: dto.title,
        amount: dto.amount,
        transactionDate: dto.transactionDate,
        note: dto.note,
        userId: userId,
        categoryId: dto.categoryId
      },
      include: {
        category: true
      }
    });
  }
  async getUserTransactions(userId: string) {
    return this.prisma.transaction.findMany({
      where: { userId, deletedAt: null },
      include: { category: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getTransactionById(userId: string, transactionId: number) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { category: true }
    });
    if (!transaction) {
      throw new NotFoundException('This transaction record was not found.');
    }
    if (transaction.userId !== userId) {
      throw new ForbiddenException('You do not have access to this item.');
    }
    return transaction;
  }

  async updateTransaction(
    userId: string,
    transactionId: number,
    dto: UpdateTransactionDto
  ) {
    await this.getTransactionById(userId, transactionId);
    if (dto.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: dto.categoryId }
      });
      if (!category) {
        throw new NotFoundException('The specified category was not found.');
      }
    }

    return this.prisma.transaction.update({
      where: { id: transactionId },
      data: dto,
      include: { category: true }
    });
  }

  async deleteTransaction(userId: string, transactionId: number) {
    await this.getTransactionById(userId, transactionId);

    await this.prisma.transaction.update({
      where: { id: transactionId },
      data: { deletedAt: new Date() }
    });

    return { message: 'Deleted success' };
  }

  async getSummary(userId: string) {
    const transaction = await this.prisma.transaction.findMany({
      where: { userId, deletedAt: null },
      include: {
        category: true
      }
    });

    let totalIncome = 0;
    let totalExpense = 0;

    transaction.forEach((t) => {
      const amount = Number(t.amount);
      if (t.category.type === 'INCOME') {
        totalIncome += amount;
      } else if (t.category.type === 'EXPENSE') {
        totalExpense += amount;
      }
    });
    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense
    };
  }
}
