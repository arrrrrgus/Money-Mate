import { PrismaService } from '@/database/prisma.service';
import {
  ForbiddenException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { CreateSavingDto } from './dto/create-saving.dto';
import { TopupSavingDto } from './dto/topup-saving.dto';
import { UpdateSavingDto } from './dto/update-saving.dto';

@Injectable()
export class SavingService {
  constructor(private readonly prismaService: PrismaService) {}

  async getUserSavings(userId: string) {
    const savings = await this.prismaService.saving.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
    return savings.map((s) => {
      const current = Number(s.currentAmount);
      const target = Number(s.targetAmount);
      const progressPercentage =
        target > 0
          ? Math.min(100, Number(((current / target) * 100).toFixed(2)))
          : 0;
      return {
        ...s,
        currentAmount: current,
        targetAmount: target,
        progressPercentage,
        isCompleted: current >= target
      };
    });
  }

  async createSaving(userId: string, dto: CreateSavingDto) {
    return this.prismaService.saving.create({
      data: {
        userId,
        projectName: dto.projectName,
        targetAmount: dto.targetAmount
      }
    });
  }

  private async getSavingAndValidateOwner(userId: string, savingId: number) {
    const saving = await this.prismaService.saving.findUnique({
      where: { id: savingId }
    });

    if (!saving) {
      throw new NotFoundException('Saving goal not found');
    }
    if (saving.userId !== userId) {
      throw new ForbiddenException(
        'You do not have access to this saving goal'
      );
    }
    return saving;
  }

  async topupSaving(userId: string, savingId: number, dto: TopupSavingDto) {
    await this.getSavingAndValidateOwner(userId, savingId);
    const updatedSaving = await this.prismaService.saving.update({
      where: { id: savingId },
      data: {
        currentAmount: {
          increment: dto.amount
        }
      }
    });

    const current = Number(updatedSaving.currentAmount);
    const target = Number(updatedSaving.targetAmount);

    return {
      ...updatedSaving,
      currentAmount: current,
      targetAmount: target,
      isCompleted: current >= target
    };
  }

  async getSavingByid(userId: string, savingId: number) {
    const saving = await this.getSavingAndValidateOwner(userId, savingId);
    const current = Number(saving.currentAmount);
    const target = Number(saving.targetAmount);
    const progressPercentage =
      target > 0
        ? Math.min(100, Number(((current / target) * 100).toFixed(2)))
        : 0;

    return {
      ...saving,
      currentAmount: current,
      targetAmount: target,
      progressPercentage,
      isCompleted: current >= target
    };
  }

  async updateSaving(userId: string, savingId: number, dto: UpdateSavingDto) {
    await this.getSavingAndValidateOwner(userId, savingId);

    const updatedSaving = await this.prismaService.saving.update({
      where: { id: savingId },
      data: dto
    });

    const current = Number(updatedSaving.currentAmount);
    const target = Number(updatedSaving.targetAmount);

    return {
      ...updatedSaving,
      currentAmount: current,
      targetAmount: target,
      isCompleted: current >= target
    };
  }

  async deleteSaving(userId: string, savingId: number) {
    await this.getSavingAndValidateOwner(userId, savingId);

    return this.prismaService.saving.delete({
      where: { id: savingId }
    });
  }
}
