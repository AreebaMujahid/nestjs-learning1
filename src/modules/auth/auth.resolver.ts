import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { SignUpInput } from './dto/signup.input.dto';
import { SignUpResponse } from './dto/signup.response';
import { VerifyOtpInput } from './dto/verifyOtp.input.dto';
import { RefreshAccessTokenInput } from './dto/refreshaccesstoken.input.dto';
import { FileUpload } from 'graphql-upload-ts';
import { GraphQLUpload } from 'graphql-upload-ts';
import { CompleteProfileInput } from './dto/complete-profile.input.dto';
import {
  ForgotPasswordOtpInput,
  ForgotPasswordInput,
} from './dto/forgotPassword.input.dto';
import {
  ForgotPasswordOtpResponse,
  ForgotPasswordOtpVerifyResponse,
} from './dto/forgotPassword.response';
import { CompleteProfileInput } from './dto/complete-profile.input.dto';
import { ForgotPasswordOtpVerifyInput } from './dto/forgotPasswordOtpVerify.input.dto';
import { LoginUserInput, LoginGoogleInput } from './dto/login.input.dto';
import { LoginResponse } from './dto/login.response';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/utilities/guards/auth.guard';
import { CurrentUser } from 'src/utilities/decorators/user.decorator';
import type { JwtTokenPayload } from 'src/utilities/types/token-payload';
import { ChangePasswordInput } from './dto/change-password.input.dto';
import { UploadService } from '../shared/upload/upload.service';
@Resolver()
export class AuthResolver {
  constructor(
    private readonly authService: AuthService,
    private readonly uploadService: UploadService,
  ) {}
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
  @Mutation(() => ForgotPasswordOtpResponse)
  async sendForgotPasswordOtp(
    @Args('forgotPasswordOtpInput')
    forgotPasswordOtpInput: ForgotPasswordOtpInput,
  ) {
    return this.authService.sendForgotPasswordOtp(forgotPasswordOtpInput);
  }
  @Mutation(() => ForgotPasswordOtpVerifyResponse)
  async forgotPasswordOtpVerify(
    @Args('forgotPasswordOtpVerifyInput')
    forgotPasswordOtpVerifyInput: ForgotPasswordOtpVerifyInput,
  ) {
    return this.authService.forgotPasswordOtpVerify(
      forgotPasswordOtpVerifyInput,
    );
  }
  @Mutation(() => Boolean)
  async forgotPassword(
    @Args('forgotPasswordInput') forgotPasswordInput: ForgotPasswordInput,
  ) {
    return this.authService.forgotPassword(forgotPasswordInput);
  }
  @Mutation(() => LoginResponse)
  async login(@Args('loginInput') loginUserInput: LoginUserInput) {
    return this.authService.login(loginUserInput);
  }
  @Mutation(() => LoginResponse)
  async loginWithGoogle(
    @Args('loginGoogleInput') loginGoogleInput: LoginGoogleInput,
  ) {
    return this.authService.loginWithGoogle(loginGoogleInput);
  }
  @Mutation(() => LoginResponse)
  async refreshAccessToken(
    @Args('refreshAccessTokenInput')
    refreshAccessTokenInput: RefreshAccessTokenInput,
  ) {
    return this.authService.refreshAccessToken(refreshAccessTokenInput);
  }
  @Mutation(() => Boolean)
  @UseGuards(AuthGuard)
  async changePassword(
    @Args('changePasswordInput') changePasswordInput: ChangePasswordInput,
    @CurrentUser() user: JwtTokenPayload,
  ) {
    return this.authService.changePassword(changePasswordInput, user);
  }
  @Mutation(() => Boolean)
  @UseGuards(AuthGuard)
  async completeProfile(
    @Args('completeProfileInput') completeProfileInput: CompleteProfileInput,
    @Args({ name: 'profilePicture', type: () => GraphQLUpload })
    profilePicture: Promise<FileUpload> | null,
    @CurrentUser() user: JwtTokenPayload,
  ) {
    try {
      return await this.authService.completeProfile(
        completeProfileInput,
        profilePicture,
        user,
      );
    } catch (error) {
      console.error('CompleteProfile error:', error);
      return false; // never return null
    }
  }
}
