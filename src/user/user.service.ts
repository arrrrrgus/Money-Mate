import { PrismaService } from '@/database/prisma.service';
import { BcryptService } from '@/infrastructure/hash/bcrypt.service';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserCreateInput } from './types/user.type';
import { User } from '@/database/generated/prisma/client';
import {
  PrismaClientKnownRequestError,
  UserGetPayload,
} from '@/database/generated/prisma/internal/prismaNamespace';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly bcryptService: BcryptService,
  ) {}
  async createUser(input: UserCreateInput): Promise<void> {
    const hash = await this.bcryptService.hash(input.password);

    try {
      await this.prisma.user.create({ data: { ...input, password: hash } });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          const target = error.meta?.target as string[] | undefined;
          if (target?.includes('username'))
            throw new ConflictException('Username already exists');
          if (target?.includes('email'))
            throw new ConflictException('Email already exists');
          throw new ConflictException('Identity data already exists');
        }
      }
      throw error;
    }
  }

  async getUserByIdentifier(identifier: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { username: identifier }],
        deletedAt: null,
      },
    });
  }

  async getUserById(
    id: string,
  ): Promise<UserGetPayload<{ omit: { password: true } }> | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      omit: { password: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async getProFile(userId: string) {
    return this.getUserById(userId);
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const isPasswordValid = await this.bcryptService.compare(
      dto.oldPassword,
      user.password,
    );
    if (!isPasswordValid) {
      throw new BadRequestException('The old password is incorrect');
    }
    const newHashedPassword = await this.bcryptService.hash(dto.newPassword);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: newHashedPassword },
    });
    return { message: 'Password updated successfully' };
  }
}
