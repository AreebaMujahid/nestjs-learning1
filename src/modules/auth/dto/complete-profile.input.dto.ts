import { InputType } from '@nestjs/graphql';
import { Field } from '@nestjs/graphql';
import { GraphQLUpload, FileUpload } from 'graphql-upload-ts';

@InputType()
export class CrewInput {
  @Field()
  name: string;

  @Field()
  designation: string;
}
@InputType()
export class CompleteProfileInput {
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
