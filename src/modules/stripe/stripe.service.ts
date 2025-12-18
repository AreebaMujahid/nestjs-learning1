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
        name: listingData.name,
        description: listingData.description,
        serviceType: listingData.serviceType,
        startTime: listingData.startTime.toISOString(),
        endTime: listingData.endTime.toISOString(),
        contactNo: listingData.contactNo,
        country: listingData.country,
        address: listingData.address,
        packageId: listingData.packageId,
        ownerId: listingData.ownerId,
      },
      success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/cancel`,
    });

    return session.url;
  }
}
