import { Module } from '@nestjs/common';
import { PrintingRequestsController } from './printing-requests.controller';
import { PrintingRequestsService } from './printing-requests.service';

@Module({
  controllers: [PrintingRequestsController],
  providers: [PrintingRequestsService],
})
export class PrintingRequestsModule {}
