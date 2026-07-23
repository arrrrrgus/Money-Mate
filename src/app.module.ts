import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth/guards/auth.guard';
import { UserModule } from './user/user.module';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { CategoryModule } from './category/category.module';
import { validate } from './config/env.validation';
import { TransactionModule } from './transaction/transaction.module';
import { SavingModule } from './saving/saving.module';
import { TicketModule } from './ticket/ticket.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate }),
    AuthModule,
    UserModule,
    DatabaseModule,
    CategoryModule,
    TransactionModule,
    SavingModule,
    TicketModule,
    AdminModule
  ],
  providers: [{ provide: APP_GUARD, useClass: AuthGuard }]
})
export class AppModule {}
