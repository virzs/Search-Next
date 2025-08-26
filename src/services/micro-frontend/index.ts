import { loadMicroApp, MicroApp } from "qiankun";

// 微应用配置接口
export interface MicroAppConfig {
  name: string;
  entry: string;
  container: string;
  activeRule?: string;
  props?: Record<string, unknown>;
}

// 微应用管理器
class MicroAppManager {
  private apps: Map<string, MicroApp> = new Map();
  /**
   * 加载微应用
   */
  async loadApp(config: MicroAppConfig): Promise<MicroApp | null> {
    try {
      const { name, entry, container, props } = config;

      // 如果应用已存在，先卸载
      if (this.apps.has(name)) {
        await this.unloadApp(name);
      }

      const microApp = loadMicroApp({
        name,
        entry,
        container,
        props: {
          ...props,
          routerBase: `/widget/${name}`,
        },
      });

      this.apps.set(name, microApp);
      console.log(`Successfully loaded micro app: ${name}`);
      return microApp;
    } catch (error) {
      console.error(`Failed to load micro app ${config.name}:`, error);
      return null;
    }
  }
  /**
   * 卸载微应用
   */
  async unloadApp(name: string): Promise<void> {
    const app = this.apps.get(name);
    if (app) {
      try {
        await app.unmount();
        this.apps.delete(name);
        console.log(`Successfully unmounted micro app: ${name}`);
      } catch (error) {
        console.error(`Failed to unmount micro app ${name}:`, error);
        // 即使卸载失败，也要从管理器中移除，避免重复尝试
        this.apps.delete(name);
        // 重新抛出错误，但不阻塞后续操作
        throw error;
      }
    }
  }

  /**
   * 检查应用是否已加载
   */
  isAppLoaded(name: string): boolean {
    return this.apps.has(name);
  }

  /**
   * 获取或创建图标模式的微应用
   * 这个方法会复用已存在的图标应用，避免重复加载
   */
  async getOrCreateIconApp(
    baseConfig: Omit<MicroAppConfig, "container">,
    containerId: string
  ): Promise<MicroApp | null> {
    const iconAppName = `${baseConfig.name}-icon-shared`;

    // 如果图标应用已存在，返回现有实例
    if (this.apps.has(iconAppName)) {
      return this.apps.get(iconAppName)!;
    }

    // 创建新的图标应用
    const iconConfig: MicroAppConfig = {
      ...baseConfig,
      name: iconAppName,
      container: `#${containerId}`,
      props: {
        ...baseConfig.props,
        mode: "icon",
        routerBase: `/widget-icon/${baseConfig.name}`,
      },
    };

    return this.loadApp(iconConfig);
  }

  /**
   * 获取应用实例
   */
  getApp(name: string): MicroApp | undefined {
    return this.apps.get(name);
  }

  /**
   * 获取所有应用
   */
  getAllApps(): MicroApp[] {
    return Array.from(this.apps.values());
  }

  /**
   * 卸载所有应用
   */
  async unloadAllApps(): Promise<void> {
    const promises = Array.from(this.apps.keys()).map((name) =>
      this.unloadApp(name)
    );
    await Promise.all(promises);
  }
}

// 单例实例
export const microAppManager = new MicroAppManager();

// 预定义的小组件配置
export const WIDGET_CONFIGS: Record<
  string,
  Omit<MicroAppConfig, "container">
> = {
  weather: {
    name: "weather-widget",
    entry: "//localhost:3001",
    props: {
      title: "天气小组件",
      supportIconMode: false, // 不支持图标模式
    },
  },
  clock: {
    name: "clock-widget",
    entry: "//localhost:3002",
    props: {
      title: "时钟小组件",
      supportIconMode: true, // 支持图标模式
    },
  },
  todo: {
    name: "todo-widget",
    entry: "//localhost:3003",
    props: {
      title: "待办事项",
      supportIconMode: false,
    },
  },
  calculator: {
    name: "calculator-widget",
    entry: "//localhost:3004",
    props: {
      title: "计算器",
      supportIconMode: false,
    },
  },
  test: {
    name: "test-widget",
    entry: "internal", // 标识为内部组件，不通过网络加载
    props: {
      title: "测试小组件",
      supportIconMode: true, // 支持图标模式
      description: "演示图标模式和完整模式的小组件",
    },
  },
};
