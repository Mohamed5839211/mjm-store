import { Module } from '@nestjs/common';
import { WaterSubscriptionsController } from './water-subscriptions.controller';
import { WaterSubscriptionsService } from './water-subscriptions.service';

@Module({
  controllers: [WaterSubscriptionsController],
  providers: [WaterSubscriptionsService],
})
export class WaterSubscriptionsModule {}
