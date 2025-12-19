import { ObjectType, Field, InputType } from '@nestjs/graphql';
import { PaginationDto } from 'src/modules/shared/pagination/pagination.input.dto';

@InputType()
export class FetchAllListingsInput {
  @Field()
  isActive: boolean;

  @Field(() => PaginationDto, { nullable: true })
  pagination?: PaginationDto;
}
