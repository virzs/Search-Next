import { Test, TestingModule } from '@nestjs/testing';
import { QiniuService } from './qiniu.service';

describe('QiniuService', () => {
  let service: QiniuService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QiniuService],
    }).compile();

    service = module.get<QiniuService>(QiniuService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
