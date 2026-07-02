import axios from "axios";
import type { AppLanguage } from "@/i18n/languages";

// DeepSeek API 配置
const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";
const DEEPSEEK_API_KEY = "";

// 搜索引擎配置
interface SearchEngineConfig {
  name: string;
  searchUrl: string;
  description: string;
}

const searchEngineConfigs: Record<string, SearchEngineConfig> = {
  bing: {
    name: "Bing",
    searchUrl: "https://www.bing.com/search?q=",
    description: "微软必应搜索引擎，提供全面的网络搜索结果",
  },
  baidu: {
    name: "百度",
    searchUrl: "https://www.baidu.com/s?wd=",
    description: "百度搜索引擎，专注中文内容搜索",
  },
  google: {
    name: "Google",
    searchUrl: "https://www.google.com/search?q=",
    description: "Google搜索引擎，全球最大的搜索引擎",
  },
};

// AI搜索请求接口
export interface AISearchRequest {
  query: string;
  searchEngine: string;
  context?: string;
}

// AI搜索响应接口
export interface AISearchResponse {
  content: string;
  searchEngine: string;
  searchResults?: SearchResult[];
  sources?: string[];
}

export interface AISearchOptions {
  language?: AppLanguage;
}

// 搜索结果接口
export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

/**
 * 使用DeepSeek API进行AI网络搜索
 * @param request 搜索请求参数
 * @returns AI搜索响应
 */
export async function performAISearch(
  request: AISearchRequest,
  options: AISearchOptions = {},
): Promise<AISearchResponse> {
  const { query, searchEngine, context } = request;
  const engineConfig = searchEngineConfigs[searchEngine];
  const useEnglish = options.language === "en-US";

  if (!engineConfig) {
    throw new Error(
      useEnglish
        ? `Unsupported search engine: ${searchEngine}`
        : `不支持的搜索引擎: ${searchEngine}`,
    );
  }

  if (!DEEPSEEK_API_KEY) {
    // 如果没有配置API密钥，返回模拟响应
    return {
      content: useEnglish
        ? `Simulated AI search response:\n\nYou asked "${query}". I will search with ${engineConfig.name}.\n\nDeepSeek API key is not configured, so this is a simulated response. To enable real AI search:\n\n1. Get a DeepSeek API key\n2. Set REACT_APP_DEEPSEEK_API_KEY in environment variables\n3. Restart the app\n\n${engineConfig.description}`
        : `模拟AI搜索响应：\n\n您询问了"${query}"，我将使用${engineConfig.name}进行搜索。\n\n由于未配置DeepSeek API密钥，这是一个模拟响应。要启用真实的AI搜索功能，请：\n\n1. 获取DeepSeek API密钥\n2. 在环境变量中设置 REACT_APP_DEEPSEEK_API_KEY\n3. 重新启动应用\n\n${engineConfig.description}`,
      searchEngine,
      sources: [engineConfig.searchUrl + encodeURIComponent(query)],
    };
  }

  try {
    // 构建AI提示词
    const systemPrompt = useEnglish
      ? `You are a professional AI search assistant. Users ask questions, and you should:

1. Understand the user's search intent
2. Provide relevant suggestions and information based on ${engineConfig.name}
3. Give structured and accurate answers
4. Provide related search links when useful

Search engine information:
- Name: ${engineConfig.name}
- Description: ${engineConfig.description}
- Search URL: ${engineConfig.searchUrl}

Answer in English with a professional and friendly tone.`
      : `你是一个专业的AI搜索助手。用户会向你提出问题，你需要：

1. 理解用户的搜索意图
2. 基于${engineConfig.name}搜索引擎的特点，提供相关的搜索建议和信息
3. 给出结构化、准确的回答
4. 如果需要，提供相关的搜索链接

搜索引擎信息：
- 名称：${engineConfig.name}
- 描述：${engineConfig.description}
- 搜索链接：${engineConfig.searchUrl}

请用中文回答，保持专业和友好的语调。`;

    const userPrompt = context
      ? useEnglish
        ? `Previous conversation context: ${context}\n\nUser's new search question: ${query}`
        : `基于之前的对话上下文：${context}\n\n用户新的搜索问题：${query}`
      : useEnglish
        ? `User search question: ${query}`
        : `用户搜索问题：${query}`;

    // 调用DeepSeek API
    const response = await axios.post(
      DEEPSEEK_API_URL,
      {
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: userPrompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
        stream: false,
      },
      {
        headers: {
          Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 30000, // 30秒超时
      }
    );

    const aiContent =
      response.data.choices[0]?.message?.content ||
      (useEnglish
        ? "Sorry, unable to get search results."
        : "抱歉，无法获取搜索结果。");

    return {
      content: aiContent,
      searchEngine,
      sources: [engineConfig.searchUrl + encodeURIComponent(query)],
    };
  } catch (error) {
    console.error("DeepSeek API调用失败:", error);

    // 错误处理
    let errorMessage = useEnglish
      ? "Search failed. Please try again later."
      : "搜索失败，请稍后重试。";

    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        errorMessage = useEnglish
          ? "Invalid API key. Check your DeepSeek API configuration."
          : "API密钥无效，请检查DeepSeek API配置。";
      } else if (error.response?.status === 429) {
        errorMessage = useEnglish
          ? "API rate limit exceeded. Please try again later."
          : "API调用频率超限，请稍后重试。";
      } else if (error.code === "ECONNABORTED") {
        errorMessage = useEnglish
          ? "Request timed out. Check your network connection."
          : "请求超时，请检查网络连接。";
      }
    }

    return {
      content: useEnglish
        ? `Search encountered a problem: ${errorMessage}\n\nYou can search directly with ${engineConfig.name}: ${
            engineConfig.searchUrl
          }${encodeURIComponent(query)}`
        : `搜索遇到问题：${errorMessage}\n\n您可以直接访问${engineConfig.name}搜索：${
            engineConfig.searchUrl
          }${encodeURIComponent(query)}`,
      searchEngine,
      sources: [engineConfig.searchUrl + encodeURIComponent(query)],
    };
  }
}

/**
 * 获取支持的搜索引擎列表
 * @returns 搜索引擎配置列表
 */
export function getSupportedSearchEngines(): SearchEngineConfig[] {
  return Object.entries(searchEngineConfigs).map(([key, config]) => ({
    ...config,
    key,
  })) as (SearchEngineConfig & { key: string })[];
}

/**
 * 检查DeepSeek API是否已配置
 * @returns 是否已配置API密钥
 */
export function isDeepSeekConfigured(): boolean {
  return !!DEEPSEEK_API_KEY;
}
