import { Module, Global } from '@nestjs/common';
import { MockIntegrationsService } from './integrations/mock-integrations.service';
import { MediaController } from './media.controller';

@Global()
@Module({
  controllers: [MediaController],
  providers: [MockIntegrationsService],
  exports: [MockIntegrationsService],
})
export class CommonModule {}
