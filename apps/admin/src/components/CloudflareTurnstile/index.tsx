import { Alert } from "antd";
import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          callback?: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
        }
      ) => string;
      remove?: (widgetId: string) => void;
      reset?: (widgetId: string) => void;
    };
  }
}

let turnstileScriptPromise: Promise<void> | null = null;

const loadTurnstileScript = () => {
  if (window.turnstile) return Promise.resolve();

  if (!turnstileScriptPromise) {
    turnstileScriptPromise = new Promise((resolve, reject) => {
      const existing = document.querySelector<HTMLScriptElement>(
        'script[src^="https://challenges.cloudflare.com/turnstile/v0/api.js"]'
      );

      if (existing) {
        existing.addEventListener("load", () => resolve(), { once: true });
        existing.addEventListener(
          "error",
          () => {
            turnstileScriptPromise = null;
            reject(new Error("Turnstile script load failed"));
          },
          { once: true }
        );
        return;
      }

      const script = document.createElement("script");
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => {
        turnstileScriptPromise = null;
        reject(new Error("Turnstile script load failed"));
      };
      document.head.appendChild(script);
    });
  }

  return turnstileScriptPromise;
};

interface CloudflareTurnstileProps {
  siteKey: string;
  resetKey?: number;
  onVerify: (token: string) => void;
  onExpire?: () => void;
  onError?: () => void;
}

const CloudflareTurnstile = ({ siteKey, resetKey, onVerify, onExpire, onError }: CloudflareTurnstileProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | undefined>(undefined);
  const onVerifyRef = useRef(onVerify);
  const onExpireRef = useRef(onExpire);
  const onErrorRef = useRef(onError);
  const [loadFailed, setLoadFailed] = useState(false);

  onVerifyRef.current = onVerify;
  onExpireRef.current = onExpire;
  onErrorRef.current = onError;

  useEffect(() => {
    let mounted = true;

    setLoadFailed(false);
    onExpireRef.current?.();

    loadTurnstileScript()
      .then(() => {
        if (!mounted || !containerRef.current || !window.turnstile) return;

        if (widgetIdRef.current && window.turnstile.remove) {
          window.turnstile.remove(widgetIdRef.current);
        }
        containerRef.current.innerHTML = "";

        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          callback: (token) => onVerifyRef.current(token),
          "expired-callback": () => onExpireRef.current?.(),
          "error-callback": () => onErrorRef.current?.(),
        });
      })
      .catch(() => {
        if (mounted) {
          setLoadFailed(true);
          onErrorRef.current?.();
        }
      });

    return () => {
      mounted = false;
      if (widgetIdRef.current && window.turnstile?.remove) {
        window.turnstile.remove(widgetIdRef.current);
      }
      widgetIdRef.current = undefined;
    };
  }, [siteKey, resetKey]);

  if (loadFailed) {
    return <Alert type="error" showIcon message="人机验证加载失败，请检查网络后重试" />;
  }

  return <div ref={containerRef} className="min-h-[65px]" />;
};

export default CloudflareTurnstile;
