import { Module } from '@nestjs/common';
import { SavingService } from './saving.service';
import { SavingController } from './saving.controller';

@Module({
  providers: [SavingService],
  controllers: [SavingController]
})
export class SavingModule {}
