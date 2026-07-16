import { getNoticeInbox, type NoticeInboxItem } from "@/services/system/notice";
import { css } from "@emotion/css";
import {
  RiCalendarLine,
  RiCheckLine,
  RiExternalLinkLine,
  RiMessageLine,
  RiNotification3Line,
  RiSparkling2Line,
} from "@remixicon/react";
import { useRequest } from "ahooks";
import { Badge, Button, Empty, Tooltip, theme as antdTheme } from "antd";
import dayjs from "dayjs";
import {
  type CSSProperties,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { DesktopNextBaseModal, SimpleEditorViewer } from "zs_library";

const READ_STORAGE_KEY = "search-next:admin-notice-read-ids";
const NOTICE_POLL_INTERVAL = 5 * 60 * 1000;
export const OPEN_ADMIN_NOTICES_EVENT = "search-next:open-admin-notices";

const readStoredIds = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(READ_STORAGE_KEY) || "[]");
    return Array.isArray(parsed)
      ? parsed.filter((item) => typeof item === "string")
      : [];
  } catch {
    return [];
  }
};

const getNoticeContent = (notice?: NoticeInboxItem) => {
  const raw = notice?.content?.trim() ?? "";
  if (!raw || !notice?.sourceKey?.startsWith("github:")) return raw;

  let leadingTitleRemoved = false;
  return raw
    .split(/\r?\n/)
    .filter((line) => {
      const trimmed = line.trim();
      if (/^(Project|Range|Paths):\s*/i.test(trimmed)) return false;
      if (
        notice.sourceUrl &&
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
      /^##\s+Changes\s*$/i.test(line.trim()) ? "## 本次更新" : line,
    )
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};

const formatNoticeDate = (value?: string, template = "YYYY-MM-DD") => {
  if (!value) return "";
  const date = dayjs(value);
  return date.isValid() ? date.format(template) : "";
};

const getNoticeDisplayDate = (
  notice?: NoticeInboxItem,
  template = "YYYY-MM-DD",
) =>
  formatNoticeDate(notice?.effectiveStart, template) ||
  formatNoticeDate(notice?.createdAt, template);

const AdminNoticeCenter = () => {
  const { token } = antdTheme.useToken();
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState<string>();
  const [readIds, setReadIds] = useState<string[]>(readStoredIds);
  const { data = [], run } = useRequest(() => getNoticeInbox("admin"), {
    pollingInterval: NOTICE_POLL_INTERVAL,
    pollingWhenHidden: false,
  });

  const notices = useMemo(() => {
    const parseTime = (value?: string) => {
      if (!value) return 0;
      const timestamp = dayjs(value).valueOf();
      return Number.isFinite(timestamp) ? timestamp : 0;
    };

    return [...(data as NoticeInboxItem[])].sort((a, b) => {
      const bTime = parseTime(b.effectiveStart) || parseTime(b.createdAt);
      const aTime = parseTime(a.effectiveStart) || parseTime(a.createdAt);
      return bTime - aTime;
    });
  }, [data]);
  const active = notices.find((item) => item._id === activeId) || notices[0];
  const readSet = useMemo(() => new Set(readIds), [readIds]);
  const hasUnread = notices.some((item) => !readSet.has(item._id));
  const activeContent = useMemo(() => getNoticeContent(active), [active]);
  const activeIsRelease = Boolean(active?.sourceKey?.startsWith("github:"));
  const activeDate = getNoticeDisplayDate(active, "YYYY-MM-DD HH:mm");

  const markRead = useCallback((id: string) => {
    setReadIds((previous) => {
      if (previous.includes(id)) return previous;
      const next = [...previous, id];
      try {
        localStorage.setItem(READ_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // 隐私模式下仍保持当前会话内的已读状态。
      }
      return next;
    });
  }, []);

  const show = useCallback(() => {
    setOpen(true);
    run();
  }, [run]);

  useEffect(() => {
    const listener = () => show();
    window.addEventListener(OPEN_ADMIN_NOTICES_EVENT, listener);
    return () => window.removeEventListener(OPEN_ADMIN_NOTICES_EVENT, listener);
  }, [show]);

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

  useEffect(() => {
    if (!activeId && notices[0]) setActiveId(notices[0]._id);
  }, [activeId, notices]);

  return (
    <>
      <Tooltip title="消息" placement="left">
        <Badge dot={hasUnread}>
          <Button
            aria-label="打开消息中心"
            icon={<RiMessageLine size={16} />}
            size="small"
            variant="text"
            onClick={show}
          />
        </Badge>
      </Tooltip>
      <DesktopNextBaseModal
        visible={open}
        onClose={() => setOpen(false)}
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
          className={adminNoticeWindowClassName}
          aria-label="消息中心"
          style={
            {
              "--notice-accent": token.colorPrimary,
              "--notice-page": token.colorBgLayout,
              "--notice-surface": token.colorBgContainer,
              "--notice-text": token.colorText,
              "--notice-secondary": token.colorTextSecondary,
              "--notice-tertiary": token.colorTextTertiary,
              "--notice-border": token.colorBorderSecondary,
              "--notice-hover": token.colorFillTertiary,
            } as CSSProperties
          }
        >
          <aside className="notice-sidebar" aria-label="消息列表">
            {notices.length ? (
              <div className="notice-list">
                {notices.map((item) => {
                  const itemDate = getNoticeDisplayDate(item);
                  const unread = !readSet.has(item._id);
                  return (
                    <button
                      key={item._id}
                      type="button"
                      className="notice-list-item"
                      data-active={active?._id === item._id}
                      aria-current={
                        active?._id === item._id ? "true" : undefined
                      }
                      onClick={() => {
                        setActiveId(item._id);
                        markRead(item._id);
                      }}
                    >
                      <span className="notice-list-meta">
                        {itemDate ? (
                          <time dateTime={itemDate}>{itemDate}</time>
                        ) : (
                          <span />
                        )}
                        {unread ? <span className="notice-unread-dot" /> : null}
                      </span>
                      <span className="notice-list-title">{item.title}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="notice-sidebar-empty">暂无消息</div>
            )}
          </aside>

          <main className="notice-reader">
            {active ? (
              <article key={active._id} className="notice-article">
                <header className="notice-article-header">
                  <div className="notice-kind">
                    {activeIsRelease ? (
                      <RiSparkling2Line size={13} />
                    ) : (
                      <RiNotification3Line size={13} />
                    )}
                    <span>{activeIsRelease ? "版本更新" : "系统消息"}</span>
                  </div>
                  <div className="notice-article-heading">
                    <h1 title={active.title}>{active.title}</h1>
                    <div className="notice-article-actions">
                      {activeDate ? (
                        <div className="notice-article-meta">
                          <RiCalendarLine size={14} />
                          <time dateTime={activeDate}>{activeDate}</time>
                        </div>
                      ) : null}
                      {!readSet.has(active._id) ? (
                        <Button
                          className="notice-read-button"
                          type="text"
                          size="small"
                          shape="round"
                          icon={<RiCheckLine size={14} />}
                          onClick={() => markRead(active._id)}
                        >
                          标为已读
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
                {active.sourceUrl ? (
                  <footer className="notice-article-footer">
                    <Button
                      className="notice-release-button"
                      type="primary"
                      shape="round"
                      href={active.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      icon={<RiExternalLinkLine size={14} />}
                    >
                      查看 Release
                    </Button>
                  </footer>
                ) : null}
              </article>
            ) : (
              <div className="notice-empty-state">
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={notices.length ? "请选择一条消息" : "暂无消息"}
                />
              </div>
            )}
          </main>
        </section>
      </DesktopNextBaseModal>
    </>
  );
};

export default AdminNoticeCenter;

const adminNoticeWindowClassName = css`
  display: flex;
  width: 100%;
  height: clamp(500px, 72vh, 680px);
  overflow: hidden;
  color: var(--notice-text);
  background: var(--notice-page);
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Text",
    "PingFang SC", "Helvetica Neue", sans-serif;
  letter-spacing: 0;

  .notice-sidebar {
    width: 224px;
    flex: 0 0 224px;
    overflow: hidden;
    padding: 58px 10px 16px;
    border-right: 1px solid var(--notice-border);
    background: color-mix(
      in srgb,
      var(--notice-surface) 86%,
      var(--notice-page)
    );
    box-shadow: inset -1px 0 0 color-mix(in srgb, white 25%, transparent);
  }

  .notice-list {
    display: flex;
    height: 100%;
    min-height: 0;
    flex-direction: column;
    gap: 4px;
    overflow-y: auto;
    scrollbar-width: thin;
  }

  .notice-list-item {
    display: flex;
    width: 100%;
    min-height: 64px;
    flex: 0 0 auto;
    flex-direction: column;
    justify-content: center;
    gap: 5px;
    margin: 0;
    border: 1px solid transparent;
    border-radius: 10px;
    padding: 9px 10px;
    color: var(--notice-text);
    background: transparent;
    font: inherit;
    text-align: left;
    cursor: pointer;
    transition:
      background-color 140ms ease,
      border-color 140ms ease,
      transform 100ms ease-out;
  }

  .notice-list-item:hover {
    background: var(--notice-hover);
  }

  .notice-list-item[data-active="true"] {
    border-color: color-mix(
      in srgb,
      var(--notice-accent) 14%,
      var(--notice-border)
    );
    background: var(--notice-surface);
    box-shadow: 0 5px 16px color-mix(in srgb, black 7%, transparent);
  }

  .notice-list-item:focus-visible {
    outline: 2px solid color-mix(in srgb, var(--notice-accent) 65%, white);
    outline-offset: -2px;
  }

  .notice-list-item:active {
    transform: scale(0.985);
  }

  .notice-list-meta {
    display: flex;
    min-height: 14px;
    align-items: center;
    justify-content: space-between;
    color: var(--notice-tertiary);
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
    background: var(--notice-accent);
    box-shadow: 0 0 0 3px
      color-mix(in srgb, var(--notice-accent) 9%, transparent);
  }

  .notice-list-title {
    display: -webkit-box;
    overflow: hidden;
    color: var(--notice-text);
    font-size: 13px;
    font-weight: 650;
    line-height: 18px;
    overflow-wrap: anywhere;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }

  .notice-sidebar-empty {
    padding: 18px 8px;
    color: var(--notice-tertiary);
    font-size: 12px;
    font-weight: 600;
    text-align: center;
  }

  .notice-reader {
    min-width: 0;
    flex: 1;
    overflow-y: auto;
    padding: 48px 20px 20px;
    background: var(--notice-page);
    scrollbar-width: thin;
  }

  .notice-article {
    width: min(100%, 720px);
    min-height: 340px;
    margin: 0 auto;
    border: 1px solid var(--notice-border);
    border-radius: 14px;
    padding: 24px 26px;
    background: color-mix(
      in srgb,
      var(--notice-surface) 92%,
      transparent
    );
    box-shadow:
      0 1px 2px color-mix(in srgb, black 5%, transparent),
      inset 0 1px 0 color-mix(in srgb, white 30%, transparent);
  }

  .notice-article-header {
    padding-bottom: 16px;
    border-bottom: 1px solid var(--notice-border);
  }

  .notice-kind {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    border-radius: 999px;
    padding: 4px 8px;
    color: var(--notice-accent);
    background: color-mix(in srgb, var(--notice-accent) 9%, transparent);
    font-size: 11px;
    font-weight: 700;
    line-height: 14px;
  }

  .notice-article-heading {
    display: flex;
    min-width: 0;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-top: 10px;
  }

  .notice-article-header h1 {
    min-width: 0;
    margin: 0;
    overflow: hidden;
    color: var(--notice-text);
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
    color: var(--notice-tertiary);
    font-size: 12px;
    font-weight: 550;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }

  .notice-read-button.ant-btn {
    flex: 0 0 auto;
    color: var(--notice-accent);
    background: color-mix(in srgb, var(--notice-accent) 8%, transparent);
  }

  .notice-read-button.ant-btn:hover {
    color: var(--notice-accent);
    background: color-mix(in srgb, var(--notice-accent) 13%, transparent);
  }

  .notice-richtext {
    padding-top: 18px;
  }

  .notice-richtext .simple-editor-wrapper,
  .notice-richtext .simple-editor-content {
    height: auto !important;
    min-height: 0 !important;
    overflow: visible;
  }

  .notice-richtext .simple-editor-content {
    display: block !important;
    flex: none !important;
    margin: 0;
  }

  .notice-richtext .simple-editor {
    min-height: 0 !important;
    flex: none !important;
    padding: 0 !important;
    color: var(--notice-text) !important;
    font-family: inherit !important;
    font-size: 15px !important;
    line-height: 1.72 !important;
    text-align: left !important;
    white-space: normal !important;
  }

  .notice-richtext .simple-editor p,
  .notice-richtext .simple-editor li {
    color: var(--notice-text) !important;
  }

  .notice-richtext .simple-editor > :first-child {
    margin-top: 0 !important;
  }

  .notice-richtext .simple-editor h1,
  .notice-richtext .simple-editor h2,
  .notice-richtext .simple-editor h3 {
    color: var(--notice-text) !important;
    font-family: inherit !important;
    letter-spacing: -0.012em;
    text-align: left !important;
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

  .notice-richtext .simple-editor h3 {
    margin: 18px 0 8px !important;
    font-size: 15px !important;
    font-weight: 700 !important;
    line-height: 1.4 !important;
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
    border: 1px solid var(--notice-border);
    border-radius: 6px;
    padding: 1px 5px;
    color: var(--notice-secondary);
    background: var(--notice-hover);
    font-size: 0.88em;
  }

  .notice-richtext .simple-editor a,
  .notice-richtext .simple-editor li::marker {
    color: var(--notice-accent) !important;
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
    border-top: 1px solid var(--notice-border);
  }

  .notice-release-button.ant-btn {
    height: 34px;
    padding-inline: 14px;
    border: 0;
    background: var(--notice-accent);
    box-shadow: 0 5px 14px
      color-mix(in srgb, var(--notice-accent) 18%, transparent);
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

  @media (max-width: 680px) {
    & {
      height: min(78vh, 660px);
    }

    .notice-sidebar {
      width: 164px;
      flex-basis: 164px;
      padding-inline: 6px;
    }

    .notice-list-item {
      padding-inline: 8px;
    }

    .notice-reader {
      padding: 48px 12px 14px;
    }

    .notice-article {
      min-height: 0;
      border-radius: 14px;
      padding: 18px;
    }

    .notice-article-heading {
      align-items: flex-start;
      flex-direction: column;
      gap: 10px;
      margin-top: 8px;
    }
  }

  @media (prefers-reduced-transparency: reduce) {
    .notice-sidebar,
    .notice-article {
      background: var(--notice-surface);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .notice-list-item,
    .notice-release-button.ant-btn {
      transition: none;
    }

    .notice-list-item:active,
    .notice-release-button.ant-btn:active {
      transform: none;
    }
  }

  @media (prefers-contrast: more) {
    .notice-list-item[data-active="true"],
    .notice-article {
      border-color: currentColor;
    }
  }
`;
