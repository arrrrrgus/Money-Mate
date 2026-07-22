import { forwardRef, Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { HashModule } from '@/infrastructure/hash/hash.module';
import { UserService } from './user.service';
import { AuthModule } from '@/auth/auth.module';

@Module({
  imports: [forwardRef(() => AuthModule), HashModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService]
})
export class UserModule {}
