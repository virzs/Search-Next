import React, { useEffect, useRef, useState, useMemo } from "react";
import { microAppManager, MicroAppConfig } from "../../services/micro-frontend";
import { Spin } from "antd";

// 全局失败缓存，避免重复尝试加载失败的微应用
const failedAppsCache = new Set<string>();

interface WidgetIconProps {
  config: MicroAppConfig;
  className?: string;
  style?: React.CSSProperties;
  onDoubleClick?: () => void;
  fallbackIcon?: React.ReactNode;
}

const WidgetIcon: React.FC<WidgetIconProps> = ({
  config,
  className,
  style,
  onDoubleClick,
  fallbackIcon,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState<boolean>(false);
  const appNameRef = useRef<string | null>(null);
  const mountedRef = useRef(false);

  // 创建配置的稳定版本，避免无必要的重新渲染
  const stableConfig = useMemo(() => ({
    name: config.name,
    entry: config.entry,
    container: config.container,
    props: config.props
  }), [config.name, config.entry, config.container, config.props]);

  useEffect(() => {
    if (!containerRef.current) return;

    const cacheKey = `${stableConfig.name}-${stableConfig.entry}`;
    
    // 如果这个应用之前加载失败过，直接显示fallback
    if (failedAppsCache.has(cacheKey)) {
      setError('Previously failed');
      setLoading(false);
      return;
    }

    const loadApp = async () => {
      // 防止重复加载
      if (mountedRef.current || appNameRef.current) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // 生成唯一的容器ID和应用名称
        const timestamp = Date.now();
        const containerId = `widget-icon-${stableConfig.name}-${timestamp}`;
        appNameRef.current = `${stableConfig.name}-icon-${timestamp}`;

        if (containerRef.current) {
          containerRef.current.id = containerId;
        }

        // 为图标模式创建特殊配置，使用唯一的应用名称
        const iconConfig: MicroAppConfig = {
          ...stableConfig,
          name: appNameRef.current,
          container: `#${containerId}`,
          props: {
            ...stableConfig.props,
            mode: "icon", // 标识为图标模式
            routerBase: `/widget-icon/${stableConfig.name}`,
          },
        };

        const app = await microAppManager.loadApp(iconConfig);

        if (app) {
          setIsReady(true);
          mountedRef.current = true;
        } else {
          throw new Error(`Failed to load widget icon: ${stableConfig.name}`);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        console.warn(`Widget icon fallback for ${stableConfig.name}:`, err);
        
        // 将失败的应用添加到缓存中
        const cacheKey = `${stableConfig.name}-${stableConfig.entry}`;
        failedAppsCache.add(cacheKey);
        
        // 清理状态
        appNameRef.current = null;
      } finally {
        setLoading(false);
      }
    };

    // 如果配置中支持图标模式，则加载
    if (stableConfig.props?.supportIconMode) {
      loadApp();
    } else {
      setLoading(false);
    }

    // 清理函数
    return () => {
      if (appNameRef.current && mountedRef.current) {
        microAppManager
          .unloadApp(appNameRef.current)
          .catch((err) => {
            console.warn(
              `Failed to cleanup widget icon ${appNameRef.current}:`,
              err
            );
          })
          .finally(() => {
            appNameRef.current = null;
            mountedRef.current = false;
          });
      }
    };
  }, [stableConfig]); // 使用稳定的配置依赖

  // 如果出错或不支持图标模式，显示默认图标
  if (error || !stableConfig.props?.supportIconMode) {
    return (
      <div className={className} style={style} onDoubleClick={onDoubleClick}>
        {fallbackIcon}
      </div>
    );
  }

  return (
    <div className={className} style={style} onDoubleClick={onDoubleClick}>
      {loading && (
        <div className="flex items-center justify-center w-full h-full">
          <Spin size="small" />
        </div>
      )}
      <div
        ref={containerRef}
        style={{
          width: "100%",
          height: "100%",
          visibility: loading ? "hidden" : "visible",
        }}
      />
    </div>
  );
};

export default WidgetIcon;
