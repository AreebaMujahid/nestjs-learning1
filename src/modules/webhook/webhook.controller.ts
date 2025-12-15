import { Controller, Post, Req, Res } from '@nestjs/common'; // ← Add Req, Res here
import { stripe } from '../stripe/stripe';
import type { Request, Response } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Listing } from '../listing/entities/listing.entity';
import { Repository } from 'typeorm';
import { FeaturePayment } from '../listing/entities/feature-payment.entity';

@Controller('webhook')
export class WebhookController {
  constructor(
    @InjectRepository(Listing)
    private readonly listingRepository: Repository<Listing>,
    @InjectRepository(FeaturePayment)
    private readonly featurePaymentRepository: Repository<FeaturePayment>,
  ) {}
  @Post('webhook')
  async handleStripeWebhook(@Req() req: Request, @Res() res: Response) {
    let event;
    const signature = req.headers['stripe-signature'] as string;
    try {
      event = stripe.webhooks.constructEvent(
        (req as any).rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!,
      );
    } catch (err: any) {
      console.log('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Process events
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as any;
        const metadata = session.metadata;
        //Update database, save payment details
        const listing = this.listingRepository.create({
          name: metadata.name,
          description: metadata.description,
          package: { id: metadata.packageId },
          owner: { id: metadata.ownerId },
        });
        await this.listingRepository.save(listing);

        // Save feature payment
        const payment = this.featurePaymentRepository.create({
          amount: session.amount_total / 100,
          currency: session.currency,
          status: 'success',
          stripePaymentId: session.payment_intent,
          listing: listing,
        });
        await this.featurePaymentRepository.save(payment);

        break;

      case 'checkout.session.expired':
        console.log('Checkout session expired');
        // TODO: Handle failure / expiration
        break;

      case 'payment_intent.payment_failed':
        console.log('Payment failed');
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.status(200).send('ok');
  }
}
