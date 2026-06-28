import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import axios from 'axios';
import {
  AiSearchRecord,
  AiSearchRecordDocument,
  AiSearchRecordName,
} from './schemas/ai-search-record.schema';
import { AiSearchDto, AiSearchResponseDto } from './dto/ai-search.dto';
import { AiServiceService } from '../../ai/service/ai-service.service';
import { SearchProviderService } from '../search-provider/search-provider.service';

@Injectable()
export class AiSearchService {
  constructor(
    @InjectModel(AiSearchRecordName)
    private aiSearchRecordModel: Model<AiSearchRecordDocument>,
    private aiServiceService: AiServiceService,
    private searchProviderService: SearchProviderService,
  ) {}

  /**
   * 执行AI搜索：调用第三方搜索API + AI分析
   */
  async performAiSearch(
    searchDto: AiSearchDto,
    userId?: string,
  ): Promise<AiSearchResponseDto> {
    const startTime = Date.now();
    let searchResults: any = null;
    let aiAnalysis = '';
    let aiProvider = 'search-next';
    let aiModel = '';
    let tokensUsed = 0;
    let status = 'error';
    let errorMessage = '';

    try {
      // 1. 调用第三方搜索API
      searchResults = await this.callSearchApi(searchDto);

      // 2. 使用AI分析搜索结果
      const aiResult = await this.analyzeWithAi(
        searchResults,
        searchDto.q,
        searchDto.aiModel,
      );

      aiAnalysis = aiResult.analysis;
      aiProvider = aiResult.provider;
      aiModel = aiResult.model;
      tokensUsed = aiResult.tokensUsed;
      status = 'success';
    } catch (error) {
      errorMessage = error.message;
      // 即使出错也要保存搜索结果（如果有的话）
    }

    const responseTime = Date.now() - startTime;

    // 3. 保存搜索记录
    const searchRecord = await this.saveSearchRecord({
      query: searchDto.q,
      language: searchDto.hl || 'zh-cn',
      country: searchDto.gl || 'cn',
      pageNumber: searchDto.page || 1,
      resultsCount: searchDto.num || 10,
      searchResults: searchResults || {},
      aiAnalysis,
      aiProvider,
      aiModel,
      tokensUsed,
      responseTime,
      status,
      errorMessage,
      userId,
    });

    // 4. 返回结果
    return {
      query: searchDto.q,
      searchResults: searchResults || {},
      aiAnalysis,
      aiProvider,
      aiModel,
      tokensUsed,
      responseTime,
      status,
      errorMessage: errorMessage || undefined,
      recordId: searchRecord._id.toString(),
    };
  }

  /**
   * 调用第三方搜索API（使用配置的搜索提供商）
   */
  private async callSearchApi(searchDto: AiSearchDto): Promise<any> {
    try {
      // 获取可用的搜索提供商
      const provider = await this.searchProviderService.getAvailableProvider(
        searchDto.searchProvider,
      );

      // 构建搜索参数
      const searchParams = {
        q: searchDto.q,
        gl: searchDto.gl || 'cn',
        hl: searchDto.hl || 'zh-cn',
        num: searchDto.num || 10,
        page: searchDto.page || 1,
      };

      // 调用搜索提供商API
      const searchResults = await this.searchProviderService.callSearchApi(
        provider.name,
        searchParams,
      );

      return searchResults;
    } catch (error) {
      throw new InternalServerErrorException(
        `搜索API调用失败: ${error.message}`,
      );
    }
  }

  /**
   * 使用AI分析搜索结果
   */
  private async analyzeWithAi(
    searchResults: any,
    query: string,
    aiModel?: string,
  ): Promise<{
    analysis: string;
    provider: string;
    model: string;
    tokensUsed: number;
  }> {
    // 构建AI分析提示词
    const prompt = this.buildAnalysisPrompt(searchResults, query);

    // 调用AI服务进行分析
    const openaiRequest = {
      model: aiModel || 'gpt-3.5-turbo', // 默认模型
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      stream: false,
      temperature: 0.7,
      max_tokens: 2000,
    };

    try {
      const aiResponse = await this.aiServiceService.callOpenAI(openaiRequest);
      return {
        analysis: aiResponse.choices[0]?.message?.content || '',
        provider: 'search-next',
        model: aiModel || 'gpt-3.5-turbo',
        tokensUsed: aiResponse.usage?.total_tokens || 0,
      };
    } catch (error) {
      throw new InternalServerErrorException(`AI分析失败: ${error.message}`);
    }
  }

  /**
   * 构建AI分析提示词
   */
  private buildAnalysisPrompt(searchResults: any, query: string): string {
    const resultsText = JSON.stringify(searchResults, null, 2);

    return `请分析以下搜索结果，并提供有价值的洞察和总结。

搜索查询：${query}

搜索结果：
${resultsText}

请从以下几个方面进行分析：
1. 搜索结果的主要内容和关键信息
2. 相关的重要事实和数据
3. 不同来源的观点和立场
4. 可能的趋势和发展方向
5. 对用户可能有价值的建议或结论

请用中文回答，内容要准确、客观、有条理。`;
  }

  /**
   * 保存搜索记录
   */
  private async saveSearchRecord(recordData: {
    query: string;
    language: string;
    country: string;
    pageNumber: number;
    resultsCount: number;
    searchResults: any;
    aiAnalysis: string;
    aiProvider: string;
    aiModel: string;
    tokensUsed: number;
    responseTime: number;
    status: string;
    errorMessage: string;
    userId?: string;
  }): Promise<AiSearchRecordDocument> {
    const searchRecord = new this.aiSearchRecordModel({
      ...recordData,
      createdBy: recordData.userId,
      updatedBy: recordData.userId,
    });

    return await searchRecord.save();
  }

  /**
   * 获取用户的搜索历史
   */
  async getUserSearchHistory(
    userId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    records: AiSearchRecord[];
    total: number;
    page: number;
    limit: number;
  }> {
    const skip = (page - 1) * limit;

    const [records, total] = await Promise.all([
      this.aiSearchRecordModel
        .find({ createdBy: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.aiSearchRecordModel.countDocuments({ createdBy: userId }),
    ]);

    return {
      records,
      total,
      page,
      limit,
    };
  }

  /**
   * 根据ID获取搜索记录详情
   */
  async getSearchRecordById(recordId: string): Promise<AiSearchRecord | null> {
    return await this.aiSearchRecordModel.findById(recordId).exec();
  }
}
