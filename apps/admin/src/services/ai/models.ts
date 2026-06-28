import {
  baseDeleteRequest,
  baseDetailRequest,
  baseGetRequest,
  basePostRequest,
  basePutRequest,
  basePutRequestNoId,
} from "@/utils/axios";

export interface AiModel {
  _id: string;
  name: string;
  publicName: string;
  displayName: string;
  contextWindow?: number;
  inputPricePer1K?: number;
  outputPricePer1K?: number;
  enabled: boolean;
  description?: string;
  providerModelCount?: number;
  providerModels?: ProviderModel[];
}

export interface ProviderModel {
  _id?: string;
  provider: string | any;
  publicModel?: string | any;
  upstreamModel: string;
  priority?: number;
  enabled?: boolean;
  tag?: "official" | "proxy";
  costInputPricePer1K?: number;
  costOutputPricePer1K?: number;
}

export interface SaveAiModelData {
  publicName: string;
  displayName: string;
  contextWindow?: number;
  inputPricePer1K?: number;
  outputPricePer1K?: number;
  enabled?: boolean;
  description?: string;
}

export const getModelsList = (params: any) => baseGetRequest("/ai/models")(params);

export const getModelOptions = () => baseGetRequest<AiModel[]>("/ai/models/options")({});

export const getAllModelOptions = () => baseGetRequest<AiModel[]>("/ai/models/options")({ includeDisabled: true });

export const getModelDetail = (id: string) => baseDetailRequest<AiModel>("/ai/models")(id);

export const addModel = (data: SaveAiModelData) => basePostRequest("/ai/models")(data);

export const updateModel = (id: string, data: SaveAiModelData) => basePutRequest("/ai/models")(id, data);

export const toggleModel = (id: string) => basePutRequestNoId(`/ai/models/${id}/toggle`)({});

export const deleteModel = (id: string) => baseDeleteRequest("/ai/models")(id);
