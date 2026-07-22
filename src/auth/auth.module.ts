import { forwardRef, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AccessTokenService } from './access-token.service';
import { UserModule } from '@/user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { HashModule } from '@/infrastructure/hash/hash.module';

@Module({
  imports: [forwardRef(() => UserModule), JwtModule, HashModule],
  controllers: [AuthController],
  providers: [AuthService, AccessTokenService],
  exports: [AccessTokenService, AuthModule]
})
export class AuthModule {}
