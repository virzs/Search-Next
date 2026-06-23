import { baseDeleteRequest, baseDetailRequest, baseGetRequest, basePostRequest, basePutRequest } from "@/utils/axios";

export interface Preset {
  _id: string;
  name: string;
  description: string;
}

/**
 * 预设分页
 * /ai/preset
 */
export const getPresetList = async (params: any) => {
  return baseGetRequest("/ai/preset")(params);
};

export interface AddPresetData {
  name: string;
  systemPrompt: string;
  userPrompt?: string;
  temperature: number;
  maxTokens: number;
  maxContext: number;
  stream: boolean;
  config: any;
  enabled: boolean;
  description: string;
  tags: string[];
}

/**
 * 预设新增
 * /ai/preset post
 */
export const addPreset = async (data: AddPresetData) => {
  return basePostRequest("/ai/preset")(data);
};

/**
 * 预设修改
 * /ai/preset/:id put
 */
export const updatePreset = async (id: string, data: AddPresetData) => {
  return basePutRequest("/ai/preset")(id, data);
};

/**
 * 预设删除
 * /ai/preset/:id delete
 */
export const deletePreset = async (id: string) => {
  return baseDeleteRequest("/ai/preset")(id);
};

export interface PresetDetail extends AddPresetData {
  _id: string;
  creator: string;
  createdAt: string;
  updatedAt: string;
  updater: string;
}

/**
 * 预设详情
 * /ai/preset/:id get
 */
export const getPresetDetail = async (id: string) => {
  return baseDetailRequest<PresetDetail>("/ai/preset")(id);
};

/**
 * 预设列表
 * /ai/preset/list get
 */
export const getPresetOpts = async () => {
  return baseGetRequest<Preset[]>("/ai/preset/list")();
};
