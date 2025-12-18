import { Test, TestingModule } from '@nestjs/testing';
import { ListingResolver } from './listing.resolver';

describe('ListingResolver', () => {
  let resolver: ListingResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ListingResolver],
    }).compile();

    resolver = module.get<ListingResolver>(ListingResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
