import { Module } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { StripeResolver } from './stripe.resolver';
import { SharedModule } from '../shared/shared.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [SharedModule, ConfigModule],
  providers: [StripeService, StripeResolver],
})
export class StripeModule {}
