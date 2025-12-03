import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { SignUpInput } from './dto/signup.input.dto';
import { SignUpResponse } from './dto/signup.response';
import { VerifyOtpInput } from './dto/verifyOtp.input.dto';
import {
  ForgotPasswordOtpInput,
  ForgotPasswordInput,
} from './dto/forgotPassword.input.dto';
import {
  forgotPasswordOtpResponse,
  forgotPasswordOtpVerifyResponse,
} from './dto/forgotPassword.response';
import { ForgotPasswordOtpVerifyInput } from './dto/forgotPasswordOtpVerify.input.dto';
@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}
  @Query(() => String)
  healthCheck() {
    return 'Auth service is running';
  }
  @Mutation(() => SignUpResponse)
  async signUp(@Args('signUpInput') signUpInput: SignUpInput) {
    return this.authService.signUp(signUpInput);
  }
  @Mutation(() => Boolean)
  async verifyEmail(@Args('verifyOtpInput') verifyOtpInput: VerifyOtpInput) {
    return this.authService.verifyEmail(verifyOtpInput);
  }
  @Mutation(() => forgotPasswordOtpResponse)
  async sendForgotPasswordOtp(
    @Args('forgotPasswordOtpInput')
    forgotPasswordOtpInput: ForgotPasswordOtpInput,
  ) {
    return this.authService.sendForgotPasswordOtp(forgotPasswordOtpInput);
  }
  @Mutation(() => forgotPasswordOtpVerifyResponse)
  async forgotPasswordOtpVerify(
    @Args('forgotPasswordOtpVerifyInput')
    forgotPasswordOtpVerifyInput: ForgotPasswordOtpVerifyInput,
  ) {
    return this.authService.forgotPasswordOtpVerify(
      forgotPasswordOtpVerifyInput,
    );
  }
  @Mutation()
  async forgotPassword(
    @Args('forgotPasswordInput') forgotPasswordInput: ForgotPasswordInput,
  ) {
    return this.authService.forgotPassword(forgotPasswordInput);
  }
}
