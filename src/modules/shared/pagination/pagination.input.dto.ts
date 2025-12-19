import { ObjectType, Min } from '@nestjs/graphql';
import { IsOptional, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

@ObjectType()
export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  limit: number = 10;

  @IsOptional()
  @Type(() => Number)
  @Min(0)
  offset: number = 0;
}
