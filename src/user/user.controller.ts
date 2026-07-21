import { AuthGuard } from '@/auth/guards/auth.guard';
import { Controller, Get, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@UseGuards(AuthGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile')
  async getProfile(@CurrentUser('sub') userId: string) {
    return this.userService.getProFile(userId);
  }
}
