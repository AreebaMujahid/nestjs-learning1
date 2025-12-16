import { ObjectType, Field, Float } from '@nestjs/graphql';

@ObjectType()
export class GeoPoint {
  @Field(() => Float)
  latitude: number;

  @Field(() => Float)
  longitude: number;
}
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

  @Field({ nullable: true })
  googleId?: string;

  @Field({ nullable: true })
  provider?: string;

  @Field()
  isActive: boolean;

  @Field()
  isArchived: boolean;

  @Field()
  isProfileComplete: boolean;

  @Field({ nullable: true })
  currentAddress: string;

  @Field({ nullable: true })
  boatName?: string;

  @Field({ nullable: true })
  contactNumber?: string;

  @Field({ nullable: true })
  ownerCaptain?: string;

  @Field({ nullable: true })
  websiteUrl?: string;

  @Field({ nullable: true })
  countryName?: string;

  @Field({ nullable: true })
  currentLocation?: GeoPoint;
}
