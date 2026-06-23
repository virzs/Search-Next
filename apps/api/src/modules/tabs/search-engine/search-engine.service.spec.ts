import { Test, TestingModule } from '@nestjs/testing';
import { SearchEngineService } from './search-engine.service';

describe('SearchEngineService', () => {
  let service: SearchEngineService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SearchEngineService],
    }).compile();

    service = module.get<SearchEngineService>(SearchEngineService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
