import { Module } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { StripeResolver } from './stripe.resolver';
import { SharedModule } from '../shared/shared.module';
import { ConfigModule } from '@nestjs/config';
import { WebhookController } from '../webhook/webhook.controller';
import { ListingModule } from '../listing/listing.module';

@Module({
  imports: [SharedModule, ConfigModule, ListingModule],
  controllers: [WebhookController],
  providers: [StripeService, StripeResolver],
})
export class StripeModule {}
