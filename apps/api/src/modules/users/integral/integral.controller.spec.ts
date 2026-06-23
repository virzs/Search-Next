import { Test, TestingModule } from '@nestjs/testing';
import { IntegralController } from './integral.controller';
import { IntegralService } from './integral.service';

describe('IntegralController', () => {
  let controller: IntegralController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IntegralController],
      providers: [IntegralService],
    }).compile();

    controller = module.get<IntegralController>(IntegralController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
