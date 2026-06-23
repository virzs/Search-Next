import { Controller } from '@nestjs/common';
import { TabsService } from './tabs.service';

@Controller('tabs')
export class TabsController {
  constructor(private readonly tabsService: TabsService) {}
}
