import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import type { AppMode } from "./types";

export interface DesktopRemoteAppConfig<Sdk = unknown> {
  entry: string;
  props?: Record<string, unknown>;
  mode?: AppMode;
  sdk?: Sdk;
}

export interface DesktopRemoteAppProps<Sdk = unknown> {
  config: DesktopRemoteAppConfig<Sdk>;
  className?: string;
  style?: CSSProperties;
  onClick?: () => void;
  loadFailedFallback?: ReactNode | ((error: string) => ReactNode);
}

const createShadowMount = (container: HTMLElement) => {
  const shadowRoot =
    container.shadowRoot || container.attachShadow({ mode: "open" });
  shadowRoot
    .querySelectorAll('[data-desktop-remote-app-mount="true"]')
    .forEach((node) => node.remove());

  const mountHost = document.createElement("div");
  const mountPoint = document.createElement("div");

  mountHost.dataset.desktopRemoteAppMount = "true";
  mountHost.style.width = "100%";
  mountHost.style.height = "100%";
  mountPoint.style.width = "100%";
  mountPoint.style.height = "100%";
  mountHost.append(mountPoint);
  shadowRoot.append(mountHost);

  return {
    mountPoint,
    cleanup: () => mountHost.remove(),
  };
};

const toAbsoluteUrl = (entry: string) => {
  if (!entry) return entry;
  if (entry.startsWith("http://") || entry.startsWith("https://")) {
    return entry;
  }
  if (entry.startsWith("//")) return `${window.location.protocol}${entry}`;
  return new URL(entry, window.location.origin).href;
};

const loadModule = async (entry: string) => {
  const abs = toAbsoluteUrl(String(entry));

  try {
    const url = new URL(abs);
    const clientUrl = `${url.protocol}//${url.host}/@vite/client`;
    try {
      await import(/* @vite-ignore */ clientUrl);
    } catch {
      /* empty */
    }
    try {
      await new Function("url", "return import(url)")(clientUrl);
    } catch {
      /* empty */
    }
  } catch {
    /* empty */
  }

  try {
    return await import(/* @vite-ignore */ abs);
  } catch {
    return new Function("url", "return import(url)")(abs);
  }
};

const getDependencyKey = (value: unknown) => {
  try {
    return JSON.stringify(value ?? {});
  } catch {
    return String(value);
  }
};

const getSdkDependencyKey = (sdk: unknown) => {
  if (!sdk || typeof sdk !== "object") return "";
  const record = sdk as {
    appId?: unknown;
    sizeId?: unknown;
    mode?: unknown;
  };
  return [record.appId, record.sizeId, record.mode].join(":");
};

export const DesktopRemoteApp = <Sdk,>({
  config,
  className,
  style,
  onClick,
  loadFailedFallback,
}: DesktopRemoteAppProps<Sdk>) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  const propsRef = useRef(config.props);
  propsRef.current = config.props;
  const sdkRef = useRef(config.sdk);
  sdkRef.current = config.sdk;
  const propsKey = getDependencyKey(config.props);
  const sdkKey = getSdkDependencyKey(config.sdk);

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    let shadowMount: ReturnType<typeof createShadowMount> | undefined;
    let cancelled = false;

    const load = async () => {
      try {
        setError(null);
        try {
          (globalThis as { process?: { env?: Record<string, unknown> } })
            .process ||= { env: {} };
        } catch {
          /* empty */
        }

        const mod = await loadModule(config.entry);
        const mount = (mod?.mount || mod?.default) as
          | ((
              el: HTMLElement,
              props?: Record<string, unknown>,
            ) => (() => void) | void)
          | undefined;

        if (!mount || typeof mount !== "function") {
          throw new Error("App module does not export mount/default function");
        }

        if (!containerRef.current || cancelled) return;
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
      } catch (reason) {
        if (cancelled) return;
        shadowMount?.cleanup();
        shadowMount = undefined;
        const message = reason instanceof Error ? reason.message : String(reason);
        setError(message);
        console.error("Failed to load desktop remote app:", message);
      }
    };

    void load();
    return () => {
      cancelled = true;
      try {
        cleanup?.();
      } catch {
        /* empty */
      }
      shadowMount?.cleanup();
    };
  }, [config.entry, config.mode, propsKey, sdkKey]);

  if (error) {
    const fallback =
      typeof loadFailedFallback === "function"
        ? loadFailedFallback(error)
        : loadFailedFallback;
    return (
      <div className={className} style={style}>
        {fallback ?? (
          <div className="flex h-full w-full items-center justify-center text-xs text-red-500">
            Load failed
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={className}
      style={style}
      onClick={onClick}
    />
  );
};

export default DesktopRemoteApp;
