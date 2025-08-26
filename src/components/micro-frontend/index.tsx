import React, { useEffect, useRef, useState } from 'react';
import { microAppManager, MicroAppConfig } from '../../services/micro-frontend';
import { MicroApp } from 'qiankun';
import { Spin, Alert } from 'antd';

interface MicroFrontendProps {
  config: MicroAppConfig;
  className?: string;
  style?: React.CSSProperties;
  onLoad?: (app: MicroApp) => void;
  onError?: (error: Error) => void;
}

const MicroFrontend: React.FC<MicroFrontendProps> = ({
  config,
  className,
  style,
  onLoad,
  onError,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [microApp, setMicroApp] = useState<MicroApp | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const loadApp = async () => {
      setLoading(true);
      setError(null);

      try {
        // 生成唯一的容器ID
        const containerId = `micro-app-${config.name}-${Date.now()}`;
        containerRef.current!.id = containerId;

        const appConfig: MicroAppConfig = {
          ...config,
          container: `#${containerId}`,
        };

        const app = await microAppManager.loadApp(appConfig);
        
        if (app) {
          setMicroApp(app);
          onLoad?.(app);
        } else {
          throw new Error(`Failed to load micro app: ${config.name}`);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        onError?.(err instanceof Error ? err : new Error(errorMessage));
      } finally {
        setLoading(false);
      }
    };

    loadApp();

    // 清理函数
    return () => {
      if (microApp) {
        microAppManager.unloadApp(config.name);
      }
    };
  }, [config, microApp, onError, onLoad]);

  if (error) {
    return (
      <Alert
        message="小组件加载失败"
        description={error}
        type="error"
        showIcon
        className={className}
        style={style}
      />
    );
  }

  return (
    <div className={className} style={style}>
      {loading && (
        <div className="flex items-center justify-center p-8">
          <Spin size="large" tip="正在加载小组件..." />
        </div>
      )}
      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: '100%',
          visibility: loading ? 'hidden' : 'visible',
        }}
      />
    </div>
  );
};

export default MicroFrontend;
