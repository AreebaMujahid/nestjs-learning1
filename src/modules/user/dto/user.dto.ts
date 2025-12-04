import { ObjectType } from '@nestjs/graphql';
import { Field } from '@nestjs/graphql';
import type { GeoPoint } from 'src/utilities/types/geojson.type';

@ObjectType()
export class User {
  @Field()
  id: string;

  @Field()
  fullName: string;

  @Field()
  email: string;

  @Field({ nullable: true })
  profilePicture: string;

  @Field()
  isEmailVerified: boolean;

  @Field()
  isActive: boolean;

  @Field()
  isArchived: boolean;

  @Field()
  isProfileComplete: boolean;

  @Field({ nullable: true })
  currentAddress: string;
}
