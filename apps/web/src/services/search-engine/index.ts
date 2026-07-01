import { baseGetRequest } from "@/utils/axios";

export interface SearchEngineItem {
  _id: string;
  name: string;
  description?: string;
  icon?: string;
  searchUrl: string;
  suggestUrl?: string;
  jsonpCode?: string;
}

export const getEnabledSearchEngines = () =>
  baseGetRequest<SearchEngineItem[]>("/tabs/search-engine/enabled")();

export const buildSearchEngineUrl = (
  engine: Pick<SearchEngineItem, "searchUrl">,
  keyword: string,
) => engine.searchUrl.replace(/\{keyword\}/g, encodeURIComponent(keyword));
