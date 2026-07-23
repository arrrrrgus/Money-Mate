import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { TicketModule } from '@/ticket/ticket.module';
import { CategoryModule } from '@/category/category.module';

@Module({
  imports: [TicketModule, CategoryModule],
  controllers: [AdminController],
  providers: [AdminService]
})
export class AdminModule {}
