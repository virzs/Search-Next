import { ThirdPartyConfig, SyncSettings } from "../types/api-config";
import { basePostRequest, baseGetRequest } from "./axios";

// 本地存储键名
const API_CONFIG_KEY = "third_party_api_config";
const SYNC_SETTINGS_KEY = "api_sync_settings";

// 默认配置
const DEFAULT_CONFIG: ThirdPartyConfig = {
  deepseek: {
    apiKey: "",
  },
  serper: {
    apiKey: "",
  },
};

const DEFAULT_SYNC_SETTINGS: SyncSettings = {
  enabled: false,
  lastSyncTime: null,
  autoSync: false,
};

/**
 * 获取本地存储的API配置
 */
export function getLocalApiConfig(): ThirdPartyConfig {
  try {
    const stored = localStorage.getItem(API_CONFIG_KEY);
    if (stored) {
      const config = JSON.parse(stored);
      return { ...DEFAULT_CONFIG, ...config };
    }
  } catch (error) {
    console.error("获取本地API配置失败:", error);
  }
  return DEFAULT_CONFIG;
}

/**
 * 保存API配置到本地存储
 */
export function saveLocalApiConfig(config: Partial<ThirdPartyConfig>): void {
  try {
    const currentConfig = getLocalApiConfig();
    const newConfig = {
      ...currentConfig,
      ...config,
    };
    localStorage.setItem(API_CONFIG_KEY, JSON.stringify(newConfig));
  } catch (error) {
    console.error("保存本地API配置失败:", error);
    throw new Error("保存配置失败");
  }
}

/**
 * 获取同步设置
 */
export function getSyncSettings(): SyncSettings {
  try {
    const stored = localStorage.getItem(SYNC_SETTINGS_KEY);
    if (stored) {
      const settings = JSON.parse(stored);
      // 转换日期字符串为Date对象
      if (settings.lastSyncTime) {
        settings.lastSyncTime = new Date(settings.lastSyncTime);
      }
      return { ...DEFAULT_SYNC_SETTINGS, ...settings };
    }
  } catch (error) {
    console.error("获取同步设置失败:", error);
  }
  return DEFAULT_SYNC_SETTINGS;
}

/**
 * 保存同步设置
 */
export function saveSyncSettings(settings: Partial<SyncSettings>): void {
  try {
    const currentSettings = getSyncSettings();
    const newSettings = {
      ...currentSettings,
      ...settings,
    };
    localStorage.setItem(SYNC_SETTINGS_KEY, JSON.stringify(newSettings));
  } catch (error) {
    console.error("保存同步设置失败:", error);
    throw new Error("保存同步设置失败");
  }
}

/**
 * 从服务器获取API配置
 */
export const getServerApiConfig = baseGetRequest<ThirdPartyConfig>("/api/user/config");

/**
 * 将API配置同步到服务器
 */
export const syncApiConfigToServer = basePostRequest<{ success: boolean; message: string }>("/api/user/config");

/**
 * 同步API配置
 * @param config 要同步的配置
 * @param syncToServer 是否同步到服务器
 */
export async function syncApiConfig(
  config: Partial<ThirdPartyConfig>,
  syncToServer: boolean = false
): Promise<{ success: boolean; message: string }> {
  try {
    // 保存到本地
    saveLocalApiConfig(config);

    let serverResult = { success: true, message: "本地保存成功" };

    // 如果需要同步到服务器
    if (syncToServer) {
      try {
        serverResult = await syncApiConfigToServer(config);

        // 更新同步时间
        saveSyncSettings({
          lastSyncTime: new Date(),
        });

        serverResult.message = "配置已保存并同步到服务器";
      } catch (error) {
        console.error("同步到服务器失败:", error);
        return {
          success: false,
          message: "本地保存成功，但同步到服务器失败",
        };
      }
    }

    return serverResult;
  } catch (error) {
    console.error("同步API配置失败:", error);
    return {
      success: false,
      message: "保存配置失败",
    };
  }
}

/**
 * 从服务器拉取配置并更新本地
 */
export async function pullConfigFromServer(): Promise<{ success: boolean; message: string }> {
  try {
    const serverConfig = await getServerApiConfig();
    saveLocalApiConfig(serverConfig);

    // 更新同步时间
    saveSyncSettings({
      lastSyncTime: new Date(),
    });

    return {
      success: true,
      message: "配置已从服务器同步",
    };
  } catch (error) {
    console.error("从服务器拉取配置失败:", error);
    return {
      success: false,
      message: "从服务器同步配置失败",
    };
  }
}

/**
 * 清除所有API配置
 */
export function clearApiConfig(): void {
  try {
    localStorage.removeItem(API_CONFIG_KEY);
    localStorage.removeItem(SYNC_SETTINGS_KEY);
  } catch (error) {
    console.error("清除API配置失败:", error);
  }
}
