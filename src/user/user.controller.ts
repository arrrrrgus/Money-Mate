import { AuthGuard } from '@/auth/guards/auth.guard';
import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { ChangePasswordDto } from './dto/change-password.dto';

@UseGuards(AuthGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile')
  async getProfile(@CurrentUser('sub') userId: string) {
    return this.userService.getProFile(userId);
  }

  @Patch('me/password')
  async changePassword(
    @CurrentUser('sub') userId: string,
    @Body() dto: ChangePasswordDto
  ) {
    return this.userService.changePassword(userId, dto);
  }
}
