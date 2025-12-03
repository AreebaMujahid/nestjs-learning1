import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { SignUpInput } from './dto/signup.input.dto';
import { SignUpResponse } from './dto/signup.response';
import { VerifyOtpInput } from './dto/verifyOtp.input.dto';
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
}
