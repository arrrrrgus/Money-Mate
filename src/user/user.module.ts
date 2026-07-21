import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { HashModule } from '@/infrastructure/hash/hash.module';
import { UserService } from './user.service';

@Module({
  imports: [HashModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
