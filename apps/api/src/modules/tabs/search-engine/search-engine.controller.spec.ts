import { Test, TestingModule } from '@nestjs/testing';
import { SearchEngineController } from './search-engine.controller';
import { SearchEngineService } from './search-engine.service';

describe('SearchEngineController', () => {
  let controller: SearchEngineController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SearchEngineController],
      providers: [SearchEngineService],
    }).compile();

    controller = module.get<SearchEngineController>(SearchEngineController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
