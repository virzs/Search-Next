import { Test, TestingModule } from '@nestjs/testing';
import { CloudflareR2Service } from './cloudflare-r2.service';

describe('CloudflareR2Service', () => {
  let service: CloudflareR2Service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CloudflareR2Service],
    }).compile();

    service = module.get<CloudflareR2Service>(CloudflareR2Service);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
