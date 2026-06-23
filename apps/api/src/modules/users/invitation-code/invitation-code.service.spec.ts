import { Test, TestingModule } from '@nestjs/testing';
import { InvitationCodeService } from './invitation-code.service';

describe('InvitationCodeService', () => {
  let service: InvitationCodeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InvitationCodeService],
    }).compile();

    service = module.get<InvitationCodeService>(InvitationCodeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
