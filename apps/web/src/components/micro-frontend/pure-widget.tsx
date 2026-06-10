import React, { useEffect, useRef, useState } from "react";
import type { WidgetSDK } from "@/sdk";

export interface PureWidgetConfig {
  entry: string;
  props?: Record<string, unknown>;
  mode?: "icon" | "full" | "settings";
  /** 小组件 SDK 实例（由宿主创建并注入） */
  sdk?: WidgetSDK;
}

interface PureWidgetProps {
  config: PureWidgetConfig;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

const createShadowMount = (container: HTMLElement) => {
  const shadowRoot = container.shadowRoot || container.attachShadow({ mode: "open" });
  shadowRoot.querySelectorAll('[data-pure-widget-mount="true"]').forEach((node) => node.remove());
  const mountHost = document.createElement("div");
  const mountPoint = document.createElement("div");

  mountHost.className = "w-full h-full";
  mountHost.dataset.pureWidgetMount = "true";
  mountHost.style.width = "100%";
  mountHost.style.height = "100%";
  mountPoint.className = "w-full h-full";
  mountPoint.style.width = "100%";
  mountPoint.style.height = "100%";
  mountHost.append(mountPoint);
  shadowRoot.append(mountHost);

  return {
    mountPoint,
    cleanup: () => mountHost.remove(),
  };
};

const PureWidget: React.FC<PureWidgetProps> = ({ config, className, style, onClick }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  const propsRef = useRef(config.props);
  propsRef.current = config.props;
  const sdkRef = useRef(config.sdk);
  sdkRef.current = config.sdk;
  const propsKey = JSON.stringify(config.props ?? {});
  const sdkSizeId = config.sdk?.sizeId;

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    let shadowMount: ReturnType<typeof createShadowMount> | undefined;
    let cancelled = false;

    const load = async () => {
      try {
        setError(null);
        try {
          (globalThis as any).process = (globalThis as any).process || { env: {} };
        } catch {
          /* empty */
        }
        const toAbsUrl = (entry: string) => {
          if (!entry) return entry;
          if (entry.startsWith("http://") || entry.startsWith("https://")) return entry;
          if (entry.startsWith("//")) return `${window.location.protocol}${entry}`;
          return new URL(entry, window.location.origin).href;
        };

        const abs = toAbsUrl(String(config.entry));

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
          if (cancelled) return;
          shadowMount = createShadowMount(containerRef.current);

          const ret = mount(shadowMount.mountPoint, {
            ...(propsRef.current || {}),
            mode: config.mode || "icon",
            ...(sdkRef.current ? { sdk: sdkRef.current } : {}),
          });
          if (cancelled) {
            if (typeof ret === "function") ret();
            shadowMount.cleanup();
            return;
          }
          if (typeof ret === "function") cleanup = ret;
        }
      } catch (e) {
        if (cancelled) return;
        if (shadowMount) {
          shadowMount.cleanup();
          shadowMount = undefined;
        }
        const msg = e instanceof Error ? e.message : String(e);
        setError(msg);
        console.error("Failed to load widget:", msg);
      }
    };

    load();
    return () => {
      cancelled = true;
      try {
        cleanup?.();
      } catch {
        /* empty */
      }
      shadowMount?.cleanup();
    };
  }, [config.entry, config.mode, propsKey, sdkSizeId]);

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
