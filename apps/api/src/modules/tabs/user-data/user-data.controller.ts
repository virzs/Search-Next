import { Controller } from '@nestjs/common';
import { UserDataService } from './user-data.service';

@Controller('user-data')
export class UserDataController {
  constructor(private readonly userDataService: UserDataService) {}
}
