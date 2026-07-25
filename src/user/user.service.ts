import { PrismaService } from '@/database/prisma.service';
import { BcryptService } from '@/infrastructure/hash/bcrypt.service';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { UserCreateInput } from './types/user.type';
import { User } from '@/database/generated/prisma/client';
import { UserGetPayload } from '@/database/generated/prisma/internal/prismaNamespace';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly bcryptService: BcryptService
  ) {}
  async createUser(input: UserCreateInput): Promise<void> {
    const existingUsername = await this.prisma.user.findFirst({
      where: { username: input.username, deletedAt: null }
    });
    if (existingUsername) {
      throw new ConflictException('Username already exists');
    }
    const existingEmail = await this.prisma.user.findFirst({
      where: { email: input.email, deletedAt: null }
    });
    if (existingEmail) {
      throw new ConflictException('Email already exists');
    }

    const hash = await this.bcryptService.hash(input.password);
    await this.prisma.user.create({ data: { ...input, password: hash } });
  }

  async getUserByIdentifier(identifier: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { username: identifier }],
        deletedAt: null
      }
    });
  }

  async getUserById(
    id: string
  ): Promise<UserGetPayload<{ omit: { password: true } }> | null> {
    const user = await this.prisma.user.findUnique({
      where: { id, deletedAt: null },
      omit: { password: true }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async getProfile(userId: string) {
    return this.getUserById(userId);
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    if (dto.oldPassword === dto.newPassword) {
      throw new BadRequestException(
        'New password must be different from old password'
      );
    }
    const user = await this.prisma.user.findUnique({
      where: { id: userId, deletedAt: null }
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const isPasswordValid = await this.bcryptService.compare(
      dto.oldPassword,
      user.password
    );
    if (!isPasswordValid) {
      throw new BadRequestException('The old password is incorrect');
    }
    const newHashedPassword = await this.bcryptService.hash(dto.newPassword);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: newHashedPassword }
    });
    return { message: 'Password updated successfully' };
  }
}
