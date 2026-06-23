import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Param,
  ValidationPipe,
  NotFoundException,
} from '@nestjs/common';
import { AiSearchService } from './ai-search.service';
import { AiSearchDto, AiSearchResponseDto } from './dto/ai-search.dto';
import { User } from 'src/public/decorator/route-user.decoratpr';
import { Response } from 'src/utils/response';

@Controller('ai-search')
export class AiSearchController {
  constructor(private readonly aiSearchService: AiSearchService) {}

  /**
   * 执行AI搜索
   */
  @Post('search')
  async performSearch(
    @Body(ValidationPipe) searchDto: AiSearchDto,
    @User('_id') userId: string,
  ): Promise<AiSearchResponseDto> {
    return await this.aiSearchService.performAiSearch(searchDto, userId);
  }

  /**
   * 获取用户搜索历史（分页）
   */
  @Get('history')
  async getUserSearchHistory(
    @User('_id') userId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    const result = await this.aiSearchService.getUserSearchHistory(
      userId,
      Number(page),
      Number(limit),
    );
    
    return Response.page({
      page: result.page,
      limit: result.limit,
      total: result.total,
    }, result.records);
  }

  /**
   * 根据ID获取搜索记录详情
   */
  @Get('record/:id')
  async getSearchRecordById(@Param('id') recordId: string) {
    const record = await this.aiSearchService.getSearchRecordById(recordId);
    if (!record) {
      throw new NotFoundException('搜索记录不存在');
    }
    return record;
  }
}