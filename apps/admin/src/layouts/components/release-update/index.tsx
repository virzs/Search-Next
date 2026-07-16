import { getLatestReleasePublication } from "@/services/system/version";
import { Button, App, Space } from "antd";
import { useCallback, useEffect } from "react";
import { OPEN_ADMIN_NOTICES_EVENT } from "../notice";

const POLL_INTERVAL = 5 * 60 * 1000;
const CURRENT_RELEASE_TAG = import.meta.env.VITE_RELEASE_TAG?.trim() || "dev";

const reloadForRelease = (tagName: string) => {
  const url = new URL(window.location.href);
  url.searchParams.set("_sn_v", tagName);
  window.location.replace(url.toString());
};

const AdminReleaseUpdatePrompt = () => {
  const { notification } = App.useApp();

  const check = useCallback(async () => {
    if (CURRENT_RELEASE_TAG === "dev") return;
    try {
      const latest = await getLatestReleasePublication("admin");
      if (!latest?.tagName || latest.tagName === CURRENT_RELEASE_TAG) return;

      const storageKey = `search-next:release-update-notified:admin:${latest.tagName}`;
      if (sessionStorage.getItem(storageKey)) return;
      sessionStorage.setItem(storageKey, "1");

      notification.open({
        key: "admin-release-update",
        duration: 0,
        message: "管理后台有新版本可用",
        description: `${latest.tagName} 已发布，刷新后即可使用。`,
        btn: (
          <Space>
            <Button
              size="small"
              onClick={() =>
                window.dispatchEvent(new Event(OPEN_ADMIN_NOTICES_EVENT))
              }
            >
              查看更新
            </Button>
            <Button
              size="small"
              type="primary"
              onClick={() => reloadForRelease(latest.tagName)}
            >
              刷新页面
            </Button>
          </Space>
        ),
      });
    } catch {
      // 更新检测不能阻断后台的正常使用，等待下次轮询即可。
    }
  }, [notification]);

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

export default AdminReleaseUpdatePrompt;
