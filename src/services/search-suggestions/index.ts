// 搜索建议服务 - 使用真实API
export interface SearchSuggestion {
  query: string;
  suggestions: string[];
}

import axiosInstance from "../../utils/axios";

// JSONP请求函数
const jsonpRequest = (url: string, data?: any): Promise<any> => {
  return (axiosInstance as any).jsonp(url, data);
};

// 获取百度搜索建议
const fetchBaiduSuggestions = async (query: string): Promise<string[]> => {
  try {
    const url = `https://suggestion.baidu.com/su?wd=${encodeURIComponent(query)}`;
    console.log(`Baidu JSONP URL: ${url}`);
    const data = await jsonpRequest(url, "cb");
    console.log(`Baidu response data:`, data);
    if (data && data.s && Array.isArray(data.s)) {
      console.log(`Baidu suggestions:`, data.s);
      return data.s.slice(0, 8);
    }
  } catch (error) {
    console.warn("Failed to fetch Baidu suggestions:", error);
  }
  return [];
};

// 获取Google搜索建议 - 使用支持JSONP的API
const fetchGoogleSuggestions = async (query: string): Promise<string[]> => {
  try {
    // Google的搜索建议API支持JSONP，使用正确的参数
    const url = `https://suggestqueries.google.com/complete/search?client=chrome&q=${encodeURIComponent(
      query
    )}&jsonp=true`;
    console.log(`Google JSONP URL: ${url}`);
    const data = await jsonpRequest(url, "callback");
    console.log(`Google response data:`, data);
    if (Array.isArray(data) && data.length > 1 && Array.isArray(data[1])) {
      console.log(`Google suggestions:`, data[1]);
      return data[1].slice(0, 8);
    }
  } catch (error) {
    console.warn("Failed to fetch Google suggestions:", error);
  }
  return [];
};

// 获取Bing搜索建议
const fetchBingSuggestions = async (query: string): Promise<string[]> => {
  console.log("Fetching Bing suggestions for query:", query);

  try {
    const url = `https://api.bing.com/osjson.aspx?query=${encodeURIComponent(query)}`;
    console.log("Bing JSONP URL:", url);

    const data = await jsonpRequest(url);

    console.log("Bing response data:", JSON.stringify(data, null, 2));
    console.log("Bing data type:", typeof data);
    console.log("Bing data is array:", Array.isArray(data));

    if (Array.isArray(data)) {
      console.log("Bing data length:", data.length);
      data.forEach((item, index) => {
        console.log(`Bing data[${index}]:`, typeof item, item);
      });

      if (data.length > 1 && Array.isArray(data[1])) {
        console.log("Bing suggestions found:", data[1]);
        return data[1].slice(0, 8);
      }
    }

    console.log("Bing: No valid suggestions found in response");
    return [];
  } catch (error) {
    console.warn("Failed to fetch Bing suggestions:", error);
    return [];
  }
};

// 获取DuckDuckGo搜索建议
const fetchDuckDuckGoSuggestions = async (query: string): Promise<string[]> => {
  try {
    const url = `https://duckduckgo.com/ac/?q=${encodeURIComponent(query)}&type=list`;
    console.log(`DuckDuckGo JSONP URL: ${url}`);
    const data = await jsonpRequest(url, "callback");
    console.log(`DuckDuckGo response data:`, data);
    // DuckDuckGo返回的是对象数组格式，需要提取phrase字段
    if (Array.isArray(data)) {
      const suggestions = data.map((item) => item.phrase || item).filter(Boolean);
      console.log(`DuckDuckGo suggestions:`, suggestions);
      return suggestions.slice(0, 8);
    }
  } catch (error) {
    console.warn("Failed to fetch DuckDuckGo suggestions:", error);
  }
  return [];
};

// 主要的搜索建议获取函数
export const tryFetchRealSuggestions = async (query: string, engine: string): Promise<string[]> => {
  if (!query.trim()) {
    return [];
  }

  const engineFunctions: { [key: string]: (query: string) => Promise<string[]> } = {
    baidu: fetchBaiduSuggestions,
    google: fetchGoogleSuggestions,
    bing: fetchBingSuggestions,
    duckduckgo: fetchDuckDuckGoSuggestions,
  };

  const fetchFunction = engineFunctions[engine];
  if (!fetchFunction) {
    console.warn(`Unsupported search engine: ${engine}`);
    return [];
  }

  try {
    const suggestions = await fetchFunction(query);
    return suggestions;
  } catch (error) {
    console.error(`Error fetching suggestions for ${engine}:`, error);
    return [];
  }
};
