import { ObjectType, Field, Int, InputType } from '@nestjs/graphql';
import { IsOptional, IsPositive, Min } from 'class-validator';
import { Type } from 'class-transformer';
@InputType()
export class PaginationDto {
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  perPage: number = 10;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @Type(() => Number)
  page: number = 1;
}
