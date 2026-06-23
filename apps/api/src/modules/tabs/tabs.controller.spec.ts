import { Test, TestingModule } from '@nestjs/testing';
import { TabsController } from './tabs.controller';
import { TabsService } from './tabs.service';

describe('TabsController', () => {
  let controller: TabsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TabsController],
      providers: [TabsService],
    }).compile();

    controller = module.get<TabsController>(TabsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
