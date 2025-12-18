import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class UpdateProfileSettingInput {
  @Field()
  fullName: string;

  @Field(() => String, { nullable: true })
  profilePictureUrl?: string | null;
}
