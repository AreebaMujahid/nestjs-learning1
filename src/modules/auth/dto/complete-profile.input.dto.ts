import { InputType } from '@nestjs/graphql';
import { Field } from '@nestjs/graphql';

@InputType()
export class CrewInput {
  @Field()
  crewName: string;

  @Field()
  designation: string;
}
@InputType()
export class CompleteProfileInput {
  @Field()
  profilePhoto: string;

  @Field()
  boatName: string;

  @Field()
  contactNumber: string;

  @Field({ nullable: true })
  ownerCaptain?: string;

  @Field({ nullable: true })
  website?: string;

  @Field(() => [CrewInput], { nullable: true })
  crew?: CrewInput[];
  //crew - array of key-value pair
  @Field({ nullable: true })
  country?: string;

  @Field({ nullable: true })
  status?: string;
}
