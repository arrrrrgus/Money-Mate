import { PrismaService } from '@/database/prisma.service';
import {
  ForbiddenException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { FilterTransactionDto } from './dto/filter-transaction.dto';
import { Prisma } from '@/database/generated/prisma/client';

@Injectable()
export class TransactionService {
  constructor(private readonly prisma: PrismaService) {}

  private buildWhereCondition(
    userId: string,
    filter?: FilterTransactionDto
  ): Prisma.TransactionWhereInput {
    const whereCondition: Prisma.TransactionWhereInput = {
      userId,
      deletedAt: null
    };

    if (filter?.type) {
      whereCondition.category = {
        type: filter.type
      };
    }

    if (filter?.startDate || filter?.endDate) {
      whereCondition.transactionDate = {};
      if (filter.startDate)
        whereCondition.transactionDate.gte = filter.startDate;
      if (filter.endDate) whereCondition.transactionDate.lte = filter.endDate;
    } else if (filter?.month || filter?.year) {
      const currentYear = filter.year ?? new Date().getFullYear();
      if (filter.month) {
        whereCondition.transactionDate = {
          gte: new Date(currentYear, filter.month - 1, 1),
          lt: new Date(currentYear, filter.month, 1)
        };
      } else {
        whereCondition.transactionDate = {
          gte: new Date(currentYear, 0, 1),
          lt: new Date(currentYear + 1, 0, 1)
        };
      }
    }
    return whereCondition;
  }

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
  async getUserTransactions(userId: string, filter?: FilterTransactionDto) {
    const page = filter?.page ?? 1;
    const limit = filter?.limit ?? 10;
    const skip = (page - 1) * limit;

    const whereCondition = this.buildWhereCondition(userId, filter);

    const [data, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where: whereCondition,
        include: { category: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      this.prisma.transaction.count({ where: whereCondition })
    ]);
    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    };
  }

  async getTransactionById(userId: string, transactionId: number) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { category: true }
    });
    if (!transaction || transaction.deletedAt !== null) {
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

  async getSummary(userId: string, filter?: FilterTransactionDto) {
    const whereCondition = this.buildWhereCondition(userId, filter);
    const transactions = await this.prisma.transaction.findMany({
      where: whereCondition,
      select: {
        amount: true,
        category: {
          select: { type: true }
        }
      }
    });
    let totalIncome = 0;
    let totalExpense = 0;
    for (const t of transactions) {
      const amt = Number(t.amount);
      if (t.category.type === 'INCOME') totalIncome += amt;
      else if (t.category.type === 'EXPENSE') totalExpense += amt;
    }

    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense
    };
  }
}
