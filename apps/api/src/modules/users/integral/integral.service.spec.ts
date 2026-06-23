import { Test, TestingModule } from '@nestjs/testing';
import { IntegralService } from './integral.service';

describe('IntegralService', () => {
  let service: IntegralService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IntegralService],
    }).compile();

    service = module.get<IntegralService>(IntegralService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
