import { getLatestReleasePublication } from "@/services/system";
import { App, Button, Space } from "antd";
import { useCallback, useEffect } from "react";
import { useI18n } from "@/i18n";
import { OPEN_WEB_NOTICES_EVENT } from "../notice";

const POLL_INTERVAL = 5 * 60 * 1000;
const CURRENT_RELEASE_TAG = import.meta.env.VITE_RELEASE_TAG?.trim() || "dev";

const reloadForRelease = (tagName: string) => {
  const url = new URL(window.location.href);
  url.searchParams.set("_sn_v", tagName);
  window.location.replace(url.toString());
};

const WebReleaseUpdatePrompt = () => {
  const { notification } = App.useApp();
  const { t } = useI18n();

  const check = useCallback(async () => {
    if (CURRENT_RELEASE_TAG === "dev") return;
    try {
      const latest = await getLatestReleasePublication("web");
      if (!latest?.tagName || latest.tagName === CURRENT_RELEASE_TAG) return;

      const storageKey = `search-next:release-update-notified:web:${latest.tagName}`;
      if (sessionStorage.getItem(storageKey)) return;
      sessionStorage.setItem(storageKey, "1");

      notification.open({
        key: "web-release-update",
        duration: 0,
        message: t("ui.releaseUpdate.title"),
        description: t("ui.releaseUpdate.description", {
          version: latest.tagName,
        }),
        btn: (
          <Space>
            <Button
              size="small"
              onClick={() =>
                window.dispatchEvent(new Event(OPEN_WEB_NOTICES_EVENT))
              }
            >
              {t("ui.releaseUpdate.view")}
            </Button>
            <Button
              size="small"
              type="primary"
              onClick={() => reloadForRelease(latest.tagName)}
            >
              {t("ui.releaseUpdate.refresh")}
            </Button>
          </Space>
        ),
      });
    } catch {
      // 更新检测失败不影响桌面使用，等待下一次轮询。
    }
  }, [notification, t]);

  useEffect(() => {
    check();
    const timer = window.setInterval(check, POLL_INTERVAL);
    const onVisible = () => document.visibilityState === "visible" && check();
    window.addEventListener("focus", check);
    window.addEventListener("online", check);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", check);
      window.removeEventListener("online", check);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [check]);

  return null;
};

export default WebReleaseUpdatePrompt;
