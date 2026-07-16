import { AppSidebar } from "@/components";
import { getNotice } from "@/services/system";
import { getNoticeReadIds, setNoticeReadIds } from "@/utils/notice";
import { RiNotification3Fill } from "@remixicon/react";
import { useBoolean, useRequest } from "ahooks";
import { Badge, Button, Empty, Tooltip } from "antd";
import { format } from "date-fns";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DesktopNextBaseModal, SimpleEditorViewer } from "zs_library";
import { css } from "@emotion/css";
import { useI18n } from "@/i18n";

export const OPEN_WEB_NOTICES_EVENT = "search-next:open-web-notices";

const Notice = () => {
  const { t } = useI18n();
  const [open, { setTrue: openModal, setFalse: closeModal }] =
    useBoolean(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [readIds, setReadIds] = useState<string[]>(() => getNoticeReadIds());
  const autoOpenCheckedRef = useRef(false);

  const { data, run } = useRequest(getNotice, {
    pollingInterval: 60 * 60 * 1000,
  });

  const notices = useMemo(() => {
    const parseTime = (value: string) => {
      const t = new Date(value).getTime();
      return Number.isFinite(t) ? t : 0;
    };

    return [...(data ?? [])].sort(
      (a, b) => parseTime(b.effectiveStart) - parseTime(a.effectiveStart),
    );
  }, [data]);

  useEffect(() => {
    if (!notices.length) return;
    const allowed = new Set(notices.map((n) => n._id));
    setReadIds((prev) => {
      const next = prev.filter((id) => allowed.has(id));
      if (next.length !== prev.length) setNoticeReadIds(next);
      return next;
    });
  }, [notices]);

  useEffect(() => {
    if (!open) return;
    if (activeId) return;
    if (!notices.length) return;
    setActiveId(notices[0]._id);
  }, [activeId, notices, open]);

  const readIdSet = useMemo(() => new Set(readIds), [readIds]);

  const markNoticeRead = useCallback((id: string) => {
    setReadIds((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      setNoticeReadIds(next);
      return next;
    });
  }, []);

  const activeNotice = useMemo(() => {
    if (!activeId) return null;
    return notices.find((n) => n._id === activeId) ?? null;
  }, [activeId, notices]);

  const hasUnread = useMemo(() => {
    return notices.some((n) => !readIdSet.has(n._id));
  }, [notices, readIdSet]);

  const hasUnreadNonRelease = useMemo(() => {
    return notices.some(
      (n) => !readIdSet.has(n._id) && !n.sourceKey?.startsWith("github:"),
    );
  }, [notices, readIdSet]);

  useEffect(() => {
    if (autoOpenCheckedRef.current) return;
    if (data === undefined) return;
    autoOpenCheckedRef.current = true;
    if (!hasUnreadNonRelease) return;
    setActiveId(null);
    openModal();
  }, [data, hasUnreadNonRelease, openModal]);

  useEffect(() => {
    const listener = () => {
      setActiveId(null);
      openModal();
      run();
    };
    window.addEventListener(OPEN_WEB_NOTICES_EVENT, listener);
    return () => window.removeEventListener(OPEN_WEB_NOTICES_EVENT, listener);
  }, [openModal, run]);

  return (
    <div>
      <Badge dot={hasUnread}>
        <Tooltip title={t("ui.notifications")}>
          <Button
            type="text"
            onClick={() => {
              setActiveId(null);
              openModal();
              run();
            }}
            icon={<RiNotification3Fill color="#fff" size={20} />}
          ></Button>
        </Tooltip>
      </Badge>
      <DesktopNextBaseModal
        visible={open}
        onClose={() => {
          closeModal();
          setActiveId(null);
        }}
        width={800}
        styles={{
          body: { padding: 0 },
          inner: { width: "100%" },
        }}
      >
        <div
          className={`flex w-full overflow-hidden h-[50vh] min-h-full max-h-[500px] ${noticeWindowClassName}`}
        >
          <AppSidebar
            activeMenuKey={activeId || undefined}
            menuStyles={{
              item: {
                height: 42,
                paddingLeft: 8,
                paddingRight: 8,
                display: "flex",
                alignItems: "center",
              },
              itemContent: {
                display: "flex",
                alignItems: "center",
              },
            }}
            menuItems={notices.map((i) => ({
              key: i._id,
              label: (
                <div className="flex min-w-0 w-full items-center gap-2">
                  {!readIdSet.has(i._id) ? (
                    <span className="h-2 w-2 shrink-0 rounded-full bg-[#007aff]" />
                  ) : (
                    <span className="h-2 w-2 shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="text-xs leading-4 text-gray-500">
                      {format(i.effectiveStart, "yyyy-MM-dd")}
                    </div>
                    <div className="min-w-0 text-sm font-medium text-gray-900 leading-5 line-clamp-1 wrap-break-word">
                      {i.title}
                    </div>
                  </div>
                </div>
              ),
            }))}
            onMenuSelect={(key) => {
              setActiveId(key);
              markNoticeRead(key);
            }}
            className="w-44! pr-2!"
            emptyText={t("ui.noNotifications")}
          />
          <div className="flex-1 min-h-0 flex overflow-hidden bg-[#f5f5f7]">
            <div className="flex-1 min-w-0 overflow-y-auto p-5">
              {activeNotice ? (
                <div className="min-w-0 rounded-[18px] border border-white/80 bg-white/90 p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-xl">
                  <div className="mb-3 flex items-start justify-between gap-3 border-b border-[rgba(60,60,67,0.1)] pb-3">
                    <div className="min-w-0">
                      <div className="line-clamp-2 text-[17px] font-semibold text-[#1d1d1f]">
                        {activeNotice.title}
                      </div>
                      <div className="mt-1 text-xs font-medium text-[#6e6e73]">
                        {format(activeNotice.effectiveStart, "yyyy-MM-dd")}
                      </div>
                    </div>
                    {!readIdSet.has(activeNotice._id) ? (
                      <Button
                        size="small"
                        shape="round"
                        style={{
                          color: "#007aff",
                          borderColor: "rgba(0,122,255,0.24)",
                          background: "rgba(0,122,255,0.08)",
                        }}
                        onClick={() => markNoticeRead(activeNotice._id)}
                      >
                        {t("ui.markAsRead")}
                      </Button>
                    ) : null}
                  </div>
                  <SimpleEditorViewer
                    value={activeNotice.content ?? ""}
                    sanitize
                    className="w-full [&_.simple-editor]:p-0! [&_.simple-editor]:text-[14px]! [&_.simple-editor]:whitespace-normal!"
                  />
                </div>
              ) : activeId ? (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={t("ui.notice.missingDescription")}
                />
              ) : (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={t("ui.notice.selectPlaceholder")}
                />
              )}
            </div>
          </div>
        </div>
      </DesktopNextBaseModal>
    </div>
  );
};

export default Notice;

const noticeWindowClassName = css`
  background: rgba(245, 245, 247, 0.92);
`;
