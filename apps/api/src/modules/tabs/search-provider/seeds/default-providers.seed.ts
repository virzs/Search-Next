import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  SearchProvider,
  SearchProviderDocument,
  SearchProviderName,
} from '../schemas/search-provider.schema';

@Injectable()
export class DefaultProvidersSeed {
  constructor(
    @InjectModel(SearchProviderName)
    private searchProviderModel: Model<SearchProviderDocument>,
  ) {}

  /**
   * 创建默认搜索提供商配置
   */
  async seedDefaultProviders(): Promise<void> {
    // 检查是否已存在提供商
    const existingProviders = await this.searchProviderModel.countDocuments();
    if (existingProviders > 0) {
      console.log('搜索提供商已存在，跳过种子数据创建');
      return;
    }

    // 创建默认的Google Serper提供商
    const googleSerperProvider = {
      name: 'google-serper',
      displayName: 'Google Serper',
      apiEndpoint: 'https://google.serper.dev/search',
      config: {
        apiKey: process.env.SERPER_API_KEY || '',
        baseUrl: 'https://google.serper.dev',
        timeout: 10000,
        maxResults: 100,
        localization: {
          defaultCountry: 'cn',
          defaultLanguage: 'zh-cn',
          supportedCountries: ['cn', 'us', 'uk', 'jp', 'kr'],
          supportedLanguages: ['zh-cn', 'en', 'ja', 'ko'],
        },
        customHeaders: {
          'Content-Type': 'application/json',
        },
        customParams: {},
      },
      isEnabled: true,
      isDefault: true,
      priority: 100,
      description: 'Google搜索API服务，提供高质量的搜索结果',
      usageCount: 0,
      successCount: 0,
      errorCount: 0,
    };

    try {
      await this.searchProviderModel.create(googleSerperProvider);
      console.log('默认搜索提供商创建成功: Google Serper');
    } catch (error) {
      console.error('创建默认搜索提供商失败:', error.message);
    }

    // 可以添加更多默认提供商
    await this.createBingProvider();
    await this.createDuckDuckGoProvider();
  }

  /**
   * 创建Bing搜索提供商配置（示例）
   */
  private async createBingProvider(): Promise<void> {
    const bingProvider = {
      name: 'bing-search',
      displayName: 'Bing Search',
      apiEndpoint: 'https://api.bing.microsoft.com/v7.0/search',
      config: {
        apiKey: process.env.BING_API_KEY || '',
        baseUrl: 'https://api.bing.microsoft.com',
        timeout: 10000,
        maxResults: 50,
        localization: {
          defaultCountry: 'cn',
          defaultLanguage: 'zh-cn',
          supportedCountries: ['cn', 'us', 'uk', 'jp', 'kr'],
          supportedLanguages: ['zh-cn', 'en', 'ja', 'ko'],
        },
        customHeaders: {
          'Ocp-Apim-Subscription-Key': process.env.BING_API_KEY || '',
        },
        customParams: {
          responseFilter: 'webpages',
        },
      },
      isEnabled: false, // 默认禁用，需要配置API密钥后启用
      isDefault: false,
      priority: 80,
      description: 'Microsoft Bing搜索API，提供多样化的搜索结果',
      usageCount: 0,
      successCount: 0,
      errorCount: 0,
    };

    try {
      await this.searchProviderModel.create(bingProvider);
      console.log('Bing搜索提供商配置创建成功');
    } catch (error) {
      console.error('创建Bing搜索提供商失败:', error.message);
    }
  }

  /**
   * 创建DuckDuckGo搜索提供商配置（示例）
   */
  private async createDuckDuckGoProvider(): Promise<void> {
    const duckduckgoProvider = {
      name: 'duckduckgo',
      displayName: 'DuckDuckGo',
      apiEndpoint: 'https://api.duckduckgo.com/',
      config: {
        apiKey: '', // DuckDuckGo不需要API密钥
        baseUrl: 'https://api.duckduckgo.com',
        timeout: 8000,
        maxResults: 30,
        localization: {
          defaultCountry: 'cn',
          defaultLanguage: 'zh-cn',
          supportedCountries: ['cn', 'us', 'uk'],
          supportedLanguages: ['zh-cn', 'en'],
        },
        customHeaders: {
          'User-Agent': 'MyApp/1.0',
        },
        customParams: {
          format: 'json',
          no_html: '1',
        },
      },
      isEnabled: false, // 默认禁用
      isDefault: false,
      priority: 60,
      description: '注重隐私的搜索引擎，不跟踪用户',
      usageCount: 0,
      successCount: 0,
      errorCount: 0,
    };

    try {
      await this.searchProviderModel.create(duckduckgoProvider);
      console.log('DuckDuckGo搜索提供商配置创建成功');
    } catch (error) {
      console.error('创建DuckDuckGo搜索提供商失败:', error.message);
    }
  }

  /**
   * 重置所有提供商配置（谨慎使用）
   */
  async resetProviders(): Promise<void> {
    await this.searchProviderModel.deleteMany({});
    console.log('所有搜索提供商配置已清除');
    await this.seedDefaultProviders();
  }
}