import { AppSidebar } from "@/components";
import { getNotice } from "@/services/system";
import { getNoticeReadIds, setNoticeReadIds } from "@/utils/notice";
import {
  RiArrowRightUpLine,
  RiCalendarLine,
  RiCheckLine,
  RiNotification3Fill,
  RiSparkling2Line,
} from "@remixicon/react";
import { useBoolean, useRequest } from "ahooks";
import { Badge, Button, Empty, Tooltip, theme as antdTheme } from "antd";
import { format } from "date-fns";
import {
  type CSSProperties,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { DesktopNextBaseModal, SimpleEditorViewer } from "zs_library";
import { css } from "@emotion/css";
import { useI18n } from "@/i18n";

export const OPEN_WEB_NOTICES_EVENT = "search-next:open-web-notices";
const NOTICE_POLL_INTERVAL = 5 * 60 * 1000;

const formatNoticeDate = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "";
  return format(date, "yyyy-MM-dd");
};

const getNoticeDisplayDate = (
  notice?: {
    effectiveStart?: string | null;
    createdAt?: string | null;
  } | null,
) =>
  formatNoticeDate(notice?.effectiveStart) || formatNoticeDate(notice?.createdAt);

const Notice = () => {
  const { t } = useI18n();
  const { token } = antdTheme.useToken();
  const [open, { setTrue: openModal, setFalse: closeModal }] =
    useBoolean(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [readIds, setReadIds] = useState<string[]>(() => getNoticeReadIds());
  const autoOpenCheckedRef = useRef(false);

  const { data, run } = useRequest(getNotice, {
    pollingInterval: NOTICE_POLL_INTERVAL,
    pollingWhenHidden: false,
  });

  const notices = useMemo(() => {
    const parseTime = (value?: string | null) => {
      if (!value) return 0;
      const t = new Date(value).getTime();
      return Number.isFinite(t) ? t : 0;
    };

    return [...(data ?? [])].sort((a, b) => {
      const bTime = parseTime(b.effectiveStart) || parseTime(b.createdAt);
      const aTime = parseTime(a.effectiveStart) || parseTime(a.createdAt);
      return bTime - aTime;
    });
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

  const activeIsRelease = Boolean(
    activeNotice?.sourceKey?.startsWith("github:"),
  );

  const activeContent = useMemo(() => {
    const raw = activeNotice?.content?.trim() ?? "";
    if (!raw || !activeNotice?.sourceKey?.startsWith("github:")) return raw;

    let leadingTitleRemoved = false;
    return raw
      .split(/\r?\n/)
      .filter((line) => {
        const trimmed = line.trim();
        if (/^(Project|Range|Paths):\s*/i.test(trimmed)) return false;
        if (
          activeNotice.sourceUrl &&
          /^\[.*GitHub Release.*\]\(.*\)$/i.test(trimmed)
        ) {
          return false;
        }
        if (
          !leadingTitleRemoved &&
          /^#\s+(Web|Admin|Search Next)\s*$/i.test(trimmed)
        ) {
          leadingTitleRemoved = true;
          return false;
        }
        return true;
      })
      .map((line) =>
        /^##\s+Changes\s*$/i.test(line.trim())
          ? `## ${t("ui.notice.whatsNew")}`
          : line,
      )
      .join("\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }, [activeNotice, t]);

  const activeNoticeDate = getNoticeDisplayDate(activeNotice);

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

  useEffect(() => {
    const refresh = () => run();
    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") run();
    };
    window.addEventListener("focus", refresh);
    window.addEventListener("online", refresh);
    document.addEventListener("visibilitychange", refreshWhenVisible);
    return () => {
      window.removeEventListener("focus", refresh);
      window.removeEventListener("online", refresh);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, [run]);

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
        width={940}
        floatingControls
        styles={{
          body: { padding: 0 },
          inner: {
            width: "100%",
            maxWidth: "calc(100vw - 24px)",
            overflow: "hidden",
          },
        }}
      >
        <section
          className={noticeAppWindowClassName}
          aria-label={t("ui.notice.center")}
          style={{ "--sn-accent": token.colorPrimary } as CSSProperties}
        >
          <AppSidebar
            className={noticeSidebarClassName}
            activeMenuKey={activeId || undefined}
            menuItems={notices.map((notice) => {
              const noticeDate = getNoticeDisplayDate(notice);
              const unread = !readIdSet.has(notice._id);
              return {
                key: notice._id,
                label: (
                  <div className="notice-menu-label">
                    <div className="notice-menu-meta">
                      {noticeDate ? <time>{noticeDate}</time> : <span />}
                      {unread ? <span className="notice-unread-dot" /> : null}
                    </div>
                    <div className="notice-menu-title">{notice.title}</div>
                  </div>
                ),
              };
            })}
            onMenuSelect={(key) => {
              setActiveId(key);
              markNoticeRead(key);
            }}
            emptyText={t("ui.noNotifications")}
          />

          <main className="notice-reader">
            {activeNotice ? (
              <article key={activeNotice._id} className="notice-article">
                <header className="notice-article-header">
                  <div className="notice-kind">
                    {activeIsRelease ? (
                      <RiSparkling2Line size={13} />
                    ) : (
                      <RiNotification3Fill size={13} />
                    )}
                    <span>
                      {activeIsRelease
                        ? t("ui.notice.release")
                        : t("ui.notice.system")}
                    </span>
                  </div>
                  <div className="notice-article-heading">
                    <h1 title={activeNotice.title}>{activeNotice.title}</h1>
                    <div className="notice-article-actions">
                      {activeNoticeDate ? (
                        <div className="notice-article-meta">
                          <RiCalendarLine size={14} />
                          <time dateTime={activeNoticeDate}>
                            {activeNoticeDate}
                          </time>
                        </div>
                      ) : null}
                      {!readIdSet.has(activeNotice._id) ? (
                        <Button
                          className="notice-read-button"
                          type="text"
                          size="small"
                          shape="round"
                          icon={<RiCheckLine size={14} />}
                          onClick={() => markNoticeRead(activeNotice._id)}
                        >
                          {t("ui.markAsRead")}
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </header>
                <SimpleEditorViewer
                  value={activeContent}
                  sanitize
                  className="notice-richtext"
                />
                {activeNotice.sourceUrl ? (
                  <footer className="notice-article-footer">
                    <Button
                      className="notice-release-button"
                      type="primary"
                      shape="round"
                      href={activeNotice.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      icon={<RiArrowRightUpLine size={15} />}
                    >
                      {t("ui.notice.viewRelease")}
                    </Button>
                  </footer>
                ) : null}
              </article>
            ) : activeId ? (
              <div className="notice-empty-state">
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={t("ui.notice.missingDescription")}
                />
              </div>
            ) : (
              <div className="notice-empty-state">
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={t("ui.notice.selectPlaceholder")}
                />
              </div>
            )}
          </main>
        </section>
      </DesktopNextBaseModal>
    </div>
  );
};

export default Notice;

const noticeAppWindowClassName = css`
  --sn-page: #f5f5f7;
  --sn-surface: rgba(255, 255, 255, 0.84);
  --sn-surface-strong: #ffffff;
  --sn-text: #1d1d1f;
  --sn-text-secondary: #6e6e73;
  --sn-text-tertiary: #8e8e93;
  --sn-separator: rgba(60, 60, 67, 0.12);
  --sn-shadow: 0 1px 2px rgba(0, 0, 0, 0.045);
  --notice-text: var(--sn-text);
  --notice-secondary: var(--sn-text-secondary);
  --notice-tertiary: var(--sn-text-tertiary);
  --notice-blue: var(--sn-accent, #007aff);
  --notice-border: var(--sn-separator);
  display: flex;
  width: 100%;
  height: clamp(500px, 72vh, 680px);
  overflow: hidden;
  color: var(--sn-text);
  background: var(--sn-page);
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Text",
    "PingFang SC", "Helvetica Neue", sans-serif;
  letter-spacing: 0;
  backdrop-filter: none;

  .notice-reader {
    min-width: 0;
    flex: 1;
    overflow-y: auto;
    padding: 48px 20px 20px;
    background: var(--sn-page);
    scrollbar-width: thin;
  }

  .notice-article {
    width: min(100%, 720px);
    min-height: 340px;
    margin: 0 auto;
    border: 1px solid var(--sn-separator);
    border-radius: 14px;
    padding: 24px 26px;
    background: var(--sn-surface);
    box-shadow:
      var(--sn-shadow),
      inset 0 1px 0 color-mix(in srgb, white 55%, transparent);
    backdrop-filter: none;
    animation: none;
  }

  .notice-article-header {
    padding-bottom: 16px;
    border-bottom: 1px solid var(--sn-separator);
  }

  .notice-article-heading {
    display: flex;
    min-width: 0;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-top: 10px;
  }

  .notice-kind {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    border-radius: 999px;
    padding: 4px 8px;
    color: var(--sn-accent, #007aff);
    background: color-mix(
      in srgb,
      var(--sn-accent, #007aff) 9%,
      transparent
    );
    font-size: 11px;
    font-weight: 700;
    line-height: 14px;
  }

  .notice-article-header h1 {
    min-width: 0;
    margin: 0;
    overflow: hidden;
    color: var(--sn-text);
    font-size: clamp(20px, 2.6vw, 24px);
    font-weight: 700;
    line-height: 1.2;
    letter-spacing: -0.018em;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .notice-article-actions {
    display: flex;
    flex: 0 0 auto;
    align-items: center;
    gap: 8px;
  }

  .notice-article-meta {
    display: flex;
    align-items: center;
    gap: 5px;
    color: var(--sn-text-tertiary);
    font-size: 12px;
    font-weight: 550;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }

  .notice-read-button.ant-btn {
    flex: 0 0 auto;
    color: var(--sn-accent, #007aff);
    background: color-mix(
      in srgb,
      var(--sn-accent, #007aff) 8%,
      transparent
    );
  }

  .notice-read-button.ant-btn:hover {
    color: var(--sn-accent, #007aff);
    background: color-mix(
      in srgb,
      var(--sn-accent, #007aff) 13%,
      transparent
    );
  }

  .notice-richtext {
    padding-top: 18px;
  }

  .notice-richtext .simple-editor {
    padding: 0 !important;
    font-family: inherit !important;
    font-size: 15px !important;
    line-height: 1.72 !important;
    white-space: normal !important;
  }

  .notice-richtext .simple-editor,
  .notice-richtext .simple-editor p,
  .notice-richtext .simple-editor li {
    color: var(--sn-text) !important;
  }

  .notice-richtext .simple-editor > :first-child {
    margin-top: 0 !important;
  }

  .notice-richtext .simple-editor h1,
  .notice-richtext .simple-editor h2,
  .notice-richtext .simple-editor h3 {
    color: var(--sn-text) !important;
    font-family: inherit !important;
    letter-spacing: -0.012em;
  }

  .notice-richtext .simple-editor h1 {
    margin: 0 0 16px !important;
    font-size: 20px !important;
    line-height: 1.3 !important;
  }

  .notice-richtext .simple-editor h2 {
    margin: 22px 0 10px !important;
    font-size: 16px !important;
    font-weight: 700 !important;
    line-height: 1.35 !important;
  }

  .notice-richtext .simple-editor p {
    margin: 0 0 14px !important;
  }

  .notice-richtext .simple-editor ul,
  .notice-richtext .simple-editor ol {
    display: grid;
    gap: 9px;
    margin: 10px 0 18px !important;
    padding-left: 22px !important;
  }

  .notice-richtext .simple-editor li {
    padding-left: 3px;
  }

  .notice-richtext .simple-editor code {
    border: 1px solid var(--sn-separator);
    border-radius: 6px;
    padding: 1px 5px;
    color: var(--sn-text-secondary);
    background: var(--sn-surface-secondary, rgba(118, 118, 128, 0.09));
    font-size: 0.88em;
  }

  .notice-richtext .simple-editor a,
  .notice-richtext .simple-editor li::marker {
    color: var(--sn-accent, #007aff) !important;
  }

  .notice-richtext .simple-editor a {
    font-weight: 650;
    text-decoration: none !important;
  }

  .notice-richtext .simple-editor a:hover {
    text-decoration: underline !important;
    text-underline-offset: 3px;
  }

  .notice-article-footer {
    display: flex;
    justify-content: flex-end;
    margin-top: 24px;
    padding-top: 18px;
    border-top: 1px solid var(--sn-separator);
    border-top-color: var(--sn-separator);
  }

  .notice-release-button.ant-btn {
    height: 34px;
    padding-inline: 14px;
    border: 0;
    background: var(--sn-accent, #007aff);
    box-shadow: 0 5px 14px
      color-mix(in srgb, var(--sn-accent, #007aff) 18%, transparent);
    font-weight: 650;
    transition: transform 100ms ease-out;
  }

  .notice-release-button.ant-btn:active {
    transform: scale(0.98);
  }

  .notice-empty-state {
    display: grid;
    min-height: 100%;
    place-items: center;
  }

  [data-theme="dark"] & {
    --sn-page: #111113;
    --sn-surface: rgba(255, 255, 255, 0.08);
    --sn-surface-strong: #242426;
    --sn-surface-secondary: rgba(255, 255, 255, 0.06);
    --sn-text: #f5f5f7;
    --sn-text-secondary: #aeaeb2;
    --sn-text-tertiary: #8e8e93;
    --sn-separator: rgba(235, 235, 245, 0.12);
    --sn-shadow: 0 1px 2px rgba(0, 0, 0, 0.24);
    background: var(--sn-page);
  }

  [data-theme="dark"] & .notice-reader {
    background: var(--sn-page);
  }

  [data-theme="dark"] & .notice-article {
    border-color: var(--sn-separator);
    background: var(--sn-surface);
    box-shadow:
      var(--sn-shadow),
      inset 0 1px 0 rgba(255, 255, 255, 0.06);
  }

  @media (max-width: 680px) {
    & {
      height: min(78vh, 660px);
    }

    .notice-reader {
      padding: 48px 12px 14px;
    }

    .notice-article {
      min-height: 0;
      border-radius: 14px;
      padding: 18px;
    }

    .notice-read-button.ant-btn {
      padding-inline: 8px;
    }

    .notice-article-header {
      padding-bottom: 14px;
    }

    .notice-article-heading {
      gap: 10px;
      margin-top: 8px;
    }

    .notice-kind {
      padding-inline: 6px;
    }

    .notice-article-actions {
      gap: 5px;
    }
  }

  @media (prefers-reduced-transparency: reduce) {
    .notice-article {
      background: var(--sn-surface-strong);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .notice-release-button.ant-btn {
      transition: none;
    }

    .notice-release-button.ant-btn:active {
      transform: none;
    }
  }

  @media (prefers-contrast: more) {
    .notice-article {
      border-color: currentColor;
    }
  }
`;

const noticeSidebarClassName = css`
  width: 224px !important;
  flex: 0 0 224px;

  .ant-menu-item {
    height: 64px !important;
    margin-block: 4px !important;
    padding-inline: 10px !important;
    line-height: normal !important;
  }

  .ant-menu-title-content {
    min-width: 0;
  }

  .notice-menu-label {
    display: flex;
    min-width: 0;
    flex-direction: column;
    gap: 5px;
  }

  .notice-menu-meta {
    display: flex;
    min-height: 14px;
    align-items: center;
    justify-content: space-between;
    color: rgba(60, 60, 67, 0.54);
    font-size: 11px;
    font-weight: 650;
    line-height: 14px;
    font-variant-numeric: tabular-nums;
  }

  .notice-unread-dot {
    width: 7px;
    height: 7px;
    flex: 0 0 auto;
    border-radius: 50%;
    background: var(--sn-accent, #007aff);
  }

  .notice-menu-title {
    display: -webkit-box;
    overflow: hidden;
    color: #1d1d1f;
    font-size: 13px;
    font-weight: 650;
    line-height: 18px;
    overflow-wrap: anywhere;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }

  [data-theme="dark"] & .notice-menu-title {
    color: #f5f5f7;
  }

  [data-theme="dark"] & .notice-menu-meta {
    color: rgba(235, 235, 245, 0.52);
  }

  @media (max-width: 680px) {
    width: 164px !important;
    flex-basis: 164px;

    .ant-menu-item {
      padding-inline: 8px !important;
    }
  }

  @media (prefers-reduced-transparency: reduce) {
    backdrop-filter: none;
  }
`;
