import { Body, Controller, Get, Param, Put, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AiBalanceService } from './ai-balance.service';
import { AdjustAiBalanceDto } from './dto/ai-balance.dto';

@ApiTags('AI/余额管理')
@Controller('ai/balances')
export class AiBalanceController {
  constructor(private readonly aiBalanceService: AiBalanceService) {}

  @Get()
  @ApiOperation({ summary: 'AI 余额列表' })
  page(@Query() query: any) {
    return this.aiBalanceService.page(query);
  }

  @Put(':userId')
  @ApiOperation({ summary: '调整用户 AI 余额' })
  adjust(@Param('userId') userId: string, @Body() body: AdjustAiBalanceDto) {
    return this.aiBalanceService.adjust(userId, body.integral, body.reason);
  }

  @Get(':userId/logs')
  @ApiOperation({ summary: '用户 AI 余额流水' })
  logs(@Param('userId') userId: string, @Query() query: any) {
    return this.aiBalanceService.logs(userId, query);
  }
}
