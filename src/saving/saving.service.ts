import { PrismaService } from '@/database/prisma.service';
import {
  ForbiddenException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { CreateSavingDto } from './dto/create-saving.dto';
import { TopupSavingDto } from './dto/topup-saving.dto';
import { UpdateSavingDto } from './dto/update-saving.dto';
import { Saving } from '@/database/generated/prisma/client';

@Injectable()
export class SavingService {
  constructor(private readonly prismaService: PrismaService) {}

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

  private formatSavingResponse(saving: Saving) {
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

  async getUserSavings(userId: string) {
    const savings = await this.prismaService.saving.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
    return savings.map((s) => this.formatSavingResponse(s));
  }

  async createSaving(userId: string, dto: CreateSavingDto) {
    const saving = await this.prismaService.saving.create({
      data: {
        userId,
        projectName: dto.projectName,
        targetAmount: dto.targetAmount
      }
    });
    return this.formatSavingResponse(saving);
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
    return this.formatSavingResponse(updatedSaving);
  }

  async getSavingById(userId: string, savingId: number) {
    const saving = await this.getSavingAndValidateOwner(userId, savingId);
    return this.formatSavingResponse(saving);
  }

  async updateSaving(userId: string, savingId: number, dto: UpdateSavingDto) {
    await this.getSavingAndValidateOwner(userId, savingId);

    const updatedSaving = await this.prismaService.saving.update({
      where: { id: savingId },
      data: dto
    });

    return this.formatSavingResponse(updatedSaving);
  }

  async deleteSaving(userId: string, savingId: number) {
    await this.getSavingAndValidateOwner(userId, savingId);

    return this.prismaService.saving.delete({
      where: { id: savingId }
    });
  }
}
