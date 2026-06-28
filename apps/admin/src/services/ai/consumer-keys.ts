import {
  baseDeleteRequest,
  baseDetailRequest,
  baseGetRequest,
  basePostRequest,
  basePutRequest,
  basePutRequestNoId,
} from "@/utils/axios";

export interface ConsumerKey {
  _id: string;
  name: string;
  keyPreview: string;
  ownerUser?: any;
  allowedModels?: any[];
  enabled: boolean;
  expiresAt?: string;
  usageCount?: number;
  lastUsedAt?: string;
  description?: string;
  plainKey?: string;
}

export interface SaveConsumerKeyData {
  name: string;
  ownerUser: string;
  allowedModels?: string[];
  enabled?: boolean;
  expiresAt?: string;
  description?: string;
}

export const getConsumerKeysList = (params: any) => baseGetRequest("/ai/consumer-keys")(params);

export const getConsumerKeyDetail = (id: string) => baseDetailRequest<ConsumerKey>("/ai/consumer-keys")(id);

export const addConsumerKey = (data: SaveConsumerKeyData) => basePostRequest<ConsumerKey>("/ai/consumer-keys")(data);

export const updateConsumerKey = (id: string, data: SaveConsumerKeyData) => basePutRequest("/ai/consumer-keys")(id, data);

export const toggleConsumerKey = (id: string) => basePutRequestNoId(`/ai/consumer-keys/${id}/toggle`)({});

export const resetConsumerKey = (id: string) => basePostRequest<ConsumerKey>(`/ai/consumer-keys/${id}/reset`)();

export const deleteConsumerKey = (id: string) => baseDeleteRequest("/ai/consumer-keys")(id);
