import { ObjectType, Field, InputType } from '@nestjs/graphql';
import { PaginationDto } from 'src/modules/shared/pagination/pagination.input.dto';
import { ListingResponse } from './listing-response.dto';
import { Int } from '@nestjs/graphql';

@InputType()
export class FetchAllListingsInput {
  @Field()
  isActive: boolean;

  @Field(() => PaginationDto, { nullable: true })
  pagination?: PaginationDto;
}

@ObjectType()
export class PaginatedListings {
  @Field(() => [ListingResponse])
  data: ListingResponse[];

  @Field(() => Int)
  total: number;

  @Field(() => Int, { nullable: true })
  prevPage: number;

  @Field(() => Int, { nullable: true })
  nextPage: number;

  @Field(() => Boolean)
  hasNextPage: boolean;

  @Field(() => Boolean)
  hasPreviousPage: boolean;

  @Field(() => Int)
  totalPages: number;

  @Field(() => Int)
  perPage: number;
}
