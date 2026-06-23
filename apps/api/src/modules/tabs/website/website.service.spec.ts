import { Test, TestingModule } from '@nestjs/testing';
import { WebsiteService } from './website.service';

describe('WebsiteService', () => {
  let service: WebsiteService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WebsiteService],
    }).compile();

    service = module.get<WebsiteService>(WebsiteService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
