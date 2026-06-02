// 第三方服务API配置类型定义

// API配置项接口
export interface ApiConfigItem {
  key: string;
  label: string;
  value: string;
  placeholder: string;
  description?: string;
  required?: boolean;
  type?: "password" | "text";
}

// 第三方服务配置接口
export interface ThirdPartyConfig {
  deepseek: {
    apiKey: string;
  };
  serper: {
    apiKey: string;
  };
}

// 同步设置接口
export interface SyncSettings {
  enabled: boolean;
  lastSyncTime: Date | null;
  autoSync: boolean;
}

// 第三方服务设置状态接口
export interface ThirdPartySettingsState {
  config: ThirdPartyConfig;
  syncSettings: SyncSettings;
  isLoggedIn: boolean;
  isSaving: boolean;
  isSyncing: boolean;
}

// API配置更新请求接口
export interface UpdateApiConfigRequest {
  config: Partial<ThirdPartyConfig>;
  syncToServer?: boolean;
}

// API配置响应接口
export interface ApiConfigResponse {
  success: boolean;
  message?: string;
  config?: ThirdPartyConfig;
  lastSyncTime?: Date;
}
