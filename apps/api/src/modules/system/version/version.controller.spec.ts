import { Test, TestingModule } from '@nestjs/testing';
import { VersionController } from './version.controller';
import { VersionService } from './version.service';

describe('VersionController', () => {
  let controller: VersionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VersionController],
      providers: [VersionService],
    }).compile();

    controller = module.get<VersionController>(VersionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
