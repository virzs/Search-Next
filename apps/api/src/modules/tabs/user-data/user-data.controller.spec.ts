import { Test, TestingModule } from '@nestjs/testing';
import { UserDataController } from './user-data.controller';
import { UserDataService } from './user-data.service';

describe('UserDataController', () => {
  let controller: UserDataController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserDataController],
      providers: [UserDataService],
    }).compile();

    controller = module.get<UserDataController>(UserDataController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
