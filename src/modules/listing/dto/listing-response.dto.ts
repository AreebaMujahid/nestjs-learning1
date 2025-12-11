import { ObjectType, Field, ID } from '@nestjs/graphql';
import { GeoPoint } from 'src/utilities/types/geojson.type';
@ObjectType()
export class ListingResponse {
  @Field()
  id: string;

  @Field()
  image: string;

  @Field()
  name: string;

  @Field()
  description: string;

  @Field()
  isActive: boolean;

  @Field()
  isArchived: boolean;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
