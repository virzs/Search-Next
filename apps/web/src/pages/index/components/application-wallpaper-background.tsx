import { useEffect, useMemo, useRef, useState } from "react";
import type { PersonalizationWallpaper } from "@/contexts/DesktopThemeContext";
import {
  getActiveWallpaperDetail,
  getWallpaperApplicationEntryUrl,
  getWallpaperApplicationPreviewUrl,
  type WallpaperApiItem,
} from "@/services/desktop";

const WALLPAPER_CHANNEL = "search-next-wallpaper-v1";

export type WallpaperBridgeKeyEvent = {
  key: string;
  code: string;
  metaKey: boolean;
  ctrlKey: boolean;
  altKey: boolean;
  shiftKey: boolean;
  repeat: boolean;
};

export interface ApplicationWallpaperBackgroundProps {
  wallpaper: Extract<PersonalizationWallpaper, { type: "application" }>;
  theme: "light" | "dark";
  language: "zh-CN" | "en-US";
  onResolved: (
    wallpaper: Extract<PersonalizationWallpaper, { type: "application" }>,
  ) => void;
  onUnavailable: () => void;
  onBridgeKeyDown?: (event: WallpaperBridgeKeyEvent) => void;
}

const useReducedMotion = () => {
  const [reduced, setReduced] = useState(
    () =>
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false,
  );
  useEffect(() => {
    const query = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!query) return undefined;
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return reduced;
};

const ApplicationWallpaperBackground = ({
  wallpaper,
  theme,
  language,
  onResolved,
  onUnavailable,
  onBridgeKeyDown,
}: ApplicationWallpaperBackgroundProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [runtimeWallpaper, setRuntimeWallpaper] =
    useState<WallpaperApiItem | null>(null);
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(() => !document.hidden);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    let cancelled = false;
    setReady(false);
    setRuntimeWallpaper(null);
    getActiveWallpaperDetail(wallpaper.id)
      .then((item) => {
        if (cancelled || item.type !== "application" || !item.application)
          return;
        setRuntimeWallpaper(item);
        const previewUrl = getWallpaperApplicationPreviewUrl(item) || "";
        if (
          wallpaper.revision !== item.application.revision ||
          wallpaper.previewUrl !== previewUrl ||
          wallpaper.name !== item.name
        ) {
          onResolved({
            type: "application",
            id: item._id,
            revision: item.application.revision,
            previewUrl,
            name: item.name,
          });
        }
      })
      .catch(() => {
        if (!cancelled) onUnavailable();
      });
    return () => {
      cancelled = true;
    };
  }, [onResolved, onUnavailable, wallpaper]);

  useEffect(() => {
    const update = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.source !== iframeRef.current?.contentWindow) return;
      const data = event.data as {
        channel?: string;
        type?: string;
        payload?: WallpaperBridgeKeyEvent;
      };
      if (data?.channel !== WALLPAPER_CHANNEL) return;
      if (data.type === "ready") setReady(true);
      if (data.type === "navigating") setReady(false);
      if (data.type === "keydown" && data.payload) {
        onBridgeKeyDown?.(data.payload);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [onBridgeKeyDown]);

  useEffect(() => {
    if (!ready || !iframeRef.current?.contentWindow) return;
    iframeRef.current.contentWindow.postMessage(
      {
        channel: WALLPAPER_CHANNEL,
        type: "environment",
        payload: { theme, language, reducedMotion, visible },
      },
      "*",
    );
  }, [language, ready, reducedMotion, theme, visible]);

  const previewUrl =
    (runtimeWallpaper && getWallpaperApplicationPreviewUrl(runtimeWallpaper)) ||
    wallpaper.previewUrl;
  const entryUrl = useMemo(
    () =>
      runtimeWallpaper
        ? getWallpaperApplicationEntryUrl(runtimeWallpaper)
        : null,
    [runtimeWallpaper],
  );

  useEffect(() => {
    if (reducedMotion || !entryUrl || ready) return undefined;
    const timeout = window.setTimeout(onUnavailable, 10_000);
    return () => window.clearTimeout(timeout);
  }, [entryUrl, onUnavailable, ready, reducedMotion]);

  return (
    <div
      aria-hidden={reducedMotion ? "true" : undefined}
      className="absolute inset-0 z-0 overflow-hidden bg-black"
      data-application-wallpaper
    >
      {previewUrl ? (
        <img
          src={previewUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : null}
      {!reducedMotion && entryUrl ? (
        <iframe
          ref={iframeRef}
          title={runtimeWallpaper?.name || wallpaper.name || "网页壁纸"}
          src={entryUrl}
          sandbox="allow-scripts"
          referrerPolicy="no-referrer"
          allow="accelerometer 'none'; autoplay 'none'; camera 'none'; clipboard-read 'none'; clipboard-write 'none'; display-capture 'none'; encrypted-media 'none'; fullscreen 'none'; geolocation 'none'; gyroscope 'none'; microphone 'none'; payment 'none'; picture-in-picture 'none'; publickey-credentials-get 'none'; screen-wake-lock 'none'; usb 'none'; xr-spatial-tracking 'none'"
          className="absolute inset-0 h-full w-full border-0 bg-transparent transition-opacity duration-[180ms] motion-reduce:transition-none"
          style={{ opacity: ready ? 1 : 0 }}
        />
      ) : null}
    </div>
  );
};

export default ApplicationWallpaperBackground;
