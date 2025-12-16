import { Injectable } from '@nestjs/common';
import { stripe } from './stripe';
@Injectable()
export class StripeService {
  async createCheckoutSession(priceId: string, listingData: any) {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata: {
        id: listingData.id,
        name: listingData.name,
        serviceType: listingData.serviceType,
        packageId: listingData.packageId,
        ownerId: listingData.ownerId,
      },
      success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/cancel`,
    });

    return session.url;
  }
}
