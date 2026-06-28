import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequestLogService } from './request-log.service';

@ApiTags('AI/调用日志')
@Controller('ai/request-logs')
export class RequestLogController {
  constructor(private readonly requestLogService: RequestLogService) {}

  @Get()
  @ApiOperation({ summary: '调用日志列表' })
  page(@Query() query: any) {
    return this.requestLogService.page(query);
  }
}
