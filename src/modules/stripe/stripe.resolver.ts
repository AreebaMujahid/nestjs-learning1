import { Resolver, Args, Mutation } from '@nestjs/graphql';
import { StripeService } from './stripe.service';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/utilities/guards/auth.guard';
import { CreateCheckoutInput } from '../listing/dto/create-checkout-input.dto';
@Resolver()
export class StripeResolver {
  constructor(private readonly stripeService: StripeService) {}
  @Mutation(() => String)
  @UseGuards(AuthGuard)
  async createCheckout(
    @Args('input') input: CreateCheckoutDto,
    @Args('checkoutInput') checkoutInput: CreateCheckoutInput,
  ) {
    return this.stripeService.createCheckoutSession(
      input.priceId,
      checkoutInput,
    );
  }
}
