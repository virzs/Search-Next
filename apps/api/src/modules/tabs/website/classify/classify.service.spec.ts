import { Test, TestingModule } from '@nestjs/testing';
import { ClassifyService } from './classify.service';

describe('ClassifyService', () => {
  let service: ClassifyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ClassifyService],
    }).compile();

    service = module.get<ClassifyService>(ClassifyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
