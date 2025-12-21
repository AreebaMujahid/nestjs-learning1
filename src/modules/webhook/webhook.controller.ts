import { Controller, Post, Req, Res, Logger } from '@nestjs/common';
import { stripe } from '../stripe/stripe';
import type { Request, Response } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Listing } from '../listing/entities/listing.entity';
import { Repository } from 'typeorm';
import { FeaturePayment } from '../listing/entities/feature-payment.entity';
import { Package } from '../listing/entities/package.entity';

@Controller('webhook')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  constructor(
    @InjectRepository(Listing)
    private readonly listingRepository: Repository<Listing>,
    @InjectRepository(FeaturePayment)
    private readonly featurePaymentRepository: Repository<FeaturePayment>,
    @InjectRepository(Package)
    private readonly packageRepository: Repository<Package>,
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
      this.logger.warn(`Webhook signature verification failed: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any;
        const metadata = session.metadata;

        console.log('I am in webhook controler', metadata);
        console.log('listingid is', metadata.listingId);
        const listingId = Number(metadata.listingId);
        const flowType = metadata.flowType;

        if (!listingId || !flowType) {
          this.logger.error(
            'Missing listingId or flowType in metadata',
            metadata,
          );
          return res.status(400).send('Invalid metadata');
        }

        const listing = await this.listingRepository.findOne({
          where: { id: listingId },
          relations: ['package'],
        });

        if (!listing) {
          this.logger.error(`Listing ${listingId} not found`);
          return res.status(400).send('Listing not found');
        }

        if (flowType === 'CREATE_LISTING') {
          // First-time purchase: we don't need targetPackageId
          // Just record the payment
          await this.featurePaymentRepository.save(
            this.featurePaymentRepository.create({
              amount: session.amount_total / 100,
              currency: session.currency,
              status: 'success',
              stripePaymentId: session.payment_intent,
              listing,
              isPaid: true,
            }),
          );

          this.logger.log(`Payment recorded for listing ${listing.id}`);
        } else if (flowType === 'UPGRADE_LISTING') {
          // Handle upgrade scenario
          const targetPackageId = Number(metadata.targetPackageId);
          const targetPackage = await this.packageRepository.findOne({
            where: { id: targetPackageId },
          });

          if (!targetPackage) {
            return res.status(404).send('Target package not found');
          }

          listing.package = targetPackage;
          await this.listingRepository.save(listing);

          await this.featurePaymentRepository.save(
            this.featurePaymentRepository.create({
              amount: session.amount_total / 100,
              currency: session.currency,
              status: 'success',
              stripePaymentId: session.payment_intent,
              listing,
              isPaid: true,
            }),
          );

          this.logger.log(
            `Listing ${listing.id} upgraded to package ${targetPackage.name}`,
          );
        }

        break;
      }

      case 'checkout.session.expired':
        this.logger.warn('Checkout session expired');
        break;

      case 'payment_intent.payment_failed':
        this.logger.warn('Payment failed');
        break;

      default:
        this.logger.log(`Unhandled event type: ${event.type}`);
    }

    res.status(200).send('ok');
  }
}
