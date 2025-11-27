import { Test, TestingModule } from '@nestjs/testing';
import { CrewResolver } from './crew.resolver';

describe('CrewResolver', () => {
  let resolver: CrewResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CrewResolver],
    }).compile();

    resolver = module.get<CrewResolver>(CrewResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
