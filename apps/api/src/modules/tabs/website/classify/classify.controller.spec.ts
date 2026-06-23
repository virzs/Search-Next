import { Test, TestingModule } from '@nestjs/testing';
import { ClassifyController } from './classify.controller';
import { ClassifyService } from './classify.service';

describe('ClassifyController', () => {
  let controller: ClassifyController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClassifyController],
      providers: [ClassifyService],
    }).compile();

    controller = module.get<ClassifyController>(ClassifyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
