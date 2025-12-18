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
        const listingId = Number(metadata.listingId);
        const targetPackageId = Number(metadata.targetedPackageId);
        const previousPackageId = metadata.previousPackageId
          ? Number(metadata.previousPackageId)
          : null;

        // Fetch existing listing
        let listing = await this.listingRepository.findOne({
          where: { id: listingId },
          relations: ['package'],
        });

        // If listing does not exist, create it
        if (!listing) {
          listing = this.listingRepository.create({
            name: metadata.name,
            description: metadata.description,
            package: { id: metadata.packageId },
            owner: { id: metadata.ownerId },
          });
          await this.listingRepository.save(listing);
          this.logger.log(`Listing ${listingId} created.`);
        }

        // Fetch the target package
        const targetPackage = await this.packageRepository.findOne({
          where: { id: targetPackageId },
        });

        if (!targetPackage) {
          this.logger.warn(`Target package ${targetPackageId} not found`);
          return res.status(404).send('Target package not found');
        }

        // Upgrade or first-time purchase
        if (!listing.package || listing.package.id !== targetPackageId) {
          listing.package = targetPackage;
          await this.listingRepository.save(listing);
          this.logger.log(
            `Listing ${listing.id} package set/updated to ${targetPackage.name}`,
          );
        } else {
          this.logger.log(
            `Listing ${listing.id} already has package ${targetPackage.name}, no change.`,
          );
        }

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
