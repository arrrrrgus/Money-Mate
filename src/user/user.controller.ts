import { Body, Controller, Get, Patch } from '@nestjs/common';
import { UserService } from './user.service';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile')
  async getProfile(@CurrentUser('sub') userId: string) {
    return this.userService.getProfile(userId);
  }

  @Patch('me')
  async updateProfile(
    @CurrentUser('sub') userId: string,
    @Body() dto: UpdateProfileDto
  ) {
    return this.userService.updateProfile(userId, dto);
  }

  @Patch('me/password')
  async changePassword(
    @CurrentUser('sub') userId: string,
    @Body() dto: ChangePasswordDto
  ) {
    return this.userService.changePassword(userId, dto);
  }
}
