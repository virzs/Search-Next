import { Test, TestingModule } from '@nestjs/testing';
import { TabsService } from './tabs.service';

describe('TabsService', () => {
  let service: TabsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TabsService],
    }).compile();

    service = module.get<TabsService>(TabsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
