import React, { useEffect, useRef, useState } from "react";

export interface PureWidgetConfig {
  entry: string;
  props?: Record<string, unknown>;
  mode?: "icon" | "full";
}

interface PureWidgetProps {
  config: PureWidgetConfig;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

const PureWidget: React.FC<PureWidgetProps> = ({ config, className, style, onClick }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cleanup: (() => void) | undefined;

    const load = async () => {
      try {
        // 某些打包后的库可能引用 Node 的 process 变量，运行时为其提供最小 polyfill
        try {
          (globalThis as any).process = (globalThis as any).process || { env: {} };
        } catch {
          /* empty */
        }
        // 构建绝对 URL，确保在 dev 模式下从 public 正确加载
        const toAbsUrl = (entry: string) => {
          if (!entry) return entry;
          if (entry.startsWith("http://") || entry.startsWith("https://")) return entry;
          if (entry.startsWith("//")) return `${window.location.protocol}${entry}`;
          // 相对或以 / 开头的路径，统一转为基于 origin 的绝对地址
          return new URL(entry, window.location.origin).href;
        };

        const abs = toAbsUrl(String(config.entry));

        // 为跨源小组件注入对应 Vite HMR 客户端，让 import.meta.hot 正常工作
        try {
          const u = new URL(abs);
          const clientUrl = `${u.protocol}//${u.host}/@vite/client`;
          try {
            await import(/* @vite-ignore */ clientUrl);
          } catch {
            /* empty */
          }
          try {
            await new Function("u", "return import(u)")(clientUrl);
          } catch {
            /* empty */
          }
        } catch {
          /* empty */
        }

        // 动态导入外部 ESM（来自 public），避免 Vite 静态分析和路径重写
        let mod: any;
        try {
          mod = await import(/* @vite-ignore */ abs);
        } catch {
          /* empty */
        }
        try {
          mod = await new Function("u", "return import(u)")(abs);
        } catch {
          /* empty */
        }

        const mount = (mod?.mount || mod?.default) as (
          el: HTMLElement,
          props?: Record<string, unknown>
        ) => (() => void) | void;

        if (!mount || typeof mount !== "function") {
          throw new Error("Widget module does not export mount/default function");
        }

        if (containerRef.current) {
          const ret = mount(containerRef.current, { ...(config.props || {}), mode: config.mode || "icon" });
          if (typeof ret === "function") cleanup = ret;
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        setError(msg);
        console.error("Failed to load widget:", msg);
      }
    };

    load();
    return () => {
      try {
        cleanup?.();
      } catch {
        /* empty */
      }
    };
  }, [config.entry, config.mode, config.props]);

  if (error) {
    return (
      <div className={className} style={style}>
        <div className="flex items-center justify-center w-full h-full text-red-500 text-xs">小组件加载失败</div>
      </div>
    );
  }

  return <div ref={containerRef} className={className} style={style} onClick={onClick} />;
};

export default PureWidget;
