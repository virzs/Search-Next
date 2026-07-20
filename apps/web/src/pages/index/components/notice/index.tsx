import { AppSidebar } from "@/components";
import {
  getNotice,
  getVersionUpdates,
} from "@/services/system";
import { getNoticeReadIds, setNoticeReadIds } from "@/utils/notice";
import {
  getVersionUpdateReadIds,
  setVersionUpdateReadIds,
  VERSION_UPDATE_READ_IDS_CHANGED_EVENT,
} from "@/utils/version-update";
import { VersionUpdateBody } from "@/components/version-updates";
import { formatVersionUpdateDate } from "@/components/version-updates/format";
import {
  OPEN_WEB_MESSAGE_CENTER_EVENT,
  type MessageCenterTab,
  type OpenWebMessageCenterDetail,
} from "@/utils/message-center";
import {
  RiCalendarLine,
  RiCheckLine,
  RiHistoryLine,
  RiNotification3Fill,
} from "@remixicon/react";
import { useBoolean, useRequest } from "ahooks";
import { Badge, Empty, Tooltip, theme as antdTheme } from "antd";
import { format } from "date-fns";
import {
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { DesktopNextBaseModal, SimpleEditorViewer } from "zs_library";
import { css } from "@emotion/css";
import { useI18n } from "@/i18n";
import {
  AppButton,
  AppIconButton,
  type AppButtonElement,
} from "@/components/ui";

const NOTICE_POLL_INTERVAL = 2 * 60 * 1000;
const MESSAGE_CENTER_TABS = ["notifications", "versions"] as const satisfies
  readonly MessageCenterTab[];

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
  const [activeTab, setActiveTab] =
    useState<MessageCenterTab>("notifications");
  const [activeNoticeId, setActiveNoticeId] = useState<string | null>(null);
  const [activeVersionId, setActiveVersionId] = useState<string | null>(null);
  const [noticeReadIds, setNoticeReadIdsState] = useState<string[]>(() =>
    getNoticeReadIds(),
  );
  const [versionReadIds, setVersionReadIdsState] = useState<string[]>(() =>
    getVersionUpdateReadIds(),
  );
  const autoOpenCheckedRef = useRef(false);
  const tabButtonRefs = useRef<
    Record<MessageCenterTab, AppButtonElement | null>
  >({
    notifications: null,
    versions: null,
  });

  const { data: noticeData, run: runNotices } = useRequest(getNotice, {
    pollingInterval: NOTICE_POLL_INTERVAL,
    pollingWhenHidden: false,
  });
  const { data: versionData, run: runVersions } = useRequest(
    () => getVersionUpdates("web"),
    {
      pollingInterval: NOTICE_POLL_INTERVAL,
      pollingWhenHidden: false,
    },
  );

  const notices = useMemo(() => {
    const parseTime = (value?: string | null) => {
      if (!value) return 0;
      const t = new Date(value).getTime();
      return Number.isFinite(t) ? t : 0;
    };

    return [...(noticeData ?? [])].sort((a, b) => {
      const bTime = parseTime(b.effectiveStart) || parseTime(b.createdAt);
      const aTime = parseTime(a.effectiveStart) || parseTime(a.createdAt);
      return bTime - aTime;
    });
  }, [noticeData]);

  const versions = useMemo(
    () =>
      [...(versionData ?? [])].sort(
        (a, b) =>
          new Date(b.publishedAt).getTime() -
          new Date(a.publishedAt).getTime(),
      ),
    [versionData],
  );

  useEffect(() => {
    if (!notices.length) return;
    const allowed = new Set(notices.map((n) => n._id));
    setNoticeReadIdsState((prev) => {
      const next = prev.filter((id) => allowed.has(id));
      if (next.length !== prev.length) setNoticeReadIds(next);
      return next;
    });
  }, [notices]);

  useEffect(() => {
    if (!versions.length) return;
    const allowed = new Set(versions.map((version) => version._id));
    setVersionReadIdsState((previous) => {
      const next = previous.filter((id) => allowed.has(id));
      if (next.length !== previous.length) setVersionUpdateReadIds(next);
      return next;
    });
  }, [versions]);

  useEffect(() => {
    const syncReadIds = () =>
      setVersionReadIdsState(getVersionUpdateReadIds());
    window.addEventListener(
      VERSION_UPDATE_READ_IDS_CHANGED_EVENT,
      syncReadIds,
    );
    return () =>
      window.removeEventListener(
        VERSION_UPDATE_READ_IDS_CHANGED_EVENT,
        syncReadIds,
      );
  }, []);

  useEffect(() => {
    if (!open) return;
    if (activeTab === "notifications") {
      if (!activeNoticeId && notices[0]) setActiveNoticeId(notices[0]._id);
      return;
    }
    if (!activeVersionId && versions[0]) setActiveVersionId(versions[0]._id);
  }, [
    activeNoticeId,
    activeTab,
    activeVersionId,
    notices,
    open,
    versions,
  ]);

  const noticeReadSet = useMemo(
    () => new Set(noticeReadIds),
    [noticeReadIds],
  );
  const versionReadSet = useMemo(
    () => new Set(versionReadIds),
    [versionReadIds],
  );

  const markNoticeRead = useCallback((id: string) => {
    setNoticeReadIdsState((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      setNoticeReadIds(next);
      return next;
    });
  }, []);

  const markVersionRead = useCallback((id: string) => {
    setVersionReadIdsState((previous) => {
      if (previous.includes(id)) return previous;
      const next = [...previous, id];
      setVersionUpdateReadIds(next);
      return next;
    });
  }, []);

  const activeNotice = useMemo(() => {
    if (!activeNoticeId) return null;
    return notices.find((notice) => notice._id === activeNoticeId) ?? null;
  }, [activeNoticeId, notices]);

  const activeVersion = useMemo(() => {
    if (!activeVersionId) return null;
    return (
      versions.find((version) => version._id === activeVersionId) ?? null
    );
  }, [activeVersionId, versions]);

  const firstUnreadNoticeId = useMemo(
    () => notices.find((notice) => !noticeReadSet.has(notice._id))?._id ?? null,
    [noticeReadSet, notices],
  );
  const firstUnreadVersionId = useMemo(
    () =>
      versions.find((version) => !versionReadSet.has(version._id))?._id ?? null,
    [versionReadSet, versions],
  );
  const hasUnreadNotice = Boolean(firstUnreadNoticeId);
  const hasUnreadVersion = Boolean(firstUnreadVersionId);
  const hasUnread = hasUnreadNotice || hasUnreadVersion;

  const activeNoticeDate = getNoticeDisplayDate(activeNotice);
  const activeVersionDate = formatVersionUpdateDate(
    activeVersion?.publishedAt,
  );
  const visibleDate =
    activeTab === "notifications" ? activeNoticeDate : activeVersionDate;

  useEffect(() => {
    if (autoOpenCheckedRef.current) return;
    if (noticeData === undefined) return;
    autoOpenCheckedRef.current = true;
    if (!firstUnreadNoticeId) return;
    setActiveTab("notifications");
    setActiveNoticeId(firstUnreadNoticeId);
    openModal();
  }, [firstUnreadNoticeId, noticeData, openModal]);

  useEffect(() => {
    const listener = (event: Event) => {
      const detail = (event as CustomEvent<OpenWebMessageCenterDetail>)
        .detail;
      const nextTab = detail?.tab ?? "notifications";
      setActiveTab(nextTab);
      if (detail?.recordId) {
        if (nextTab === "versions") {
          setActiveVersionId(detail.recordId);
          markVersionRead(detail.recordId);
        } else {
          setActiveNoticeId(detail.recordId);
          markNoticeRead(detail.recordId);
        }
      }
      openModal();
      runNotices();
      runVersions();
    };
    window.addEventListener(OPEN_WEB_MESSAGE_CENTER_EVENT, listener);
    return () =>
      window.removeEventListener(OPEN_WEB_MESSAGE_CENTER_EVENT, listener);
  }, [markNoticeRead, markVersionRead, openModal, runNotices, runVersions]);

  useEffect(() => {
    const refresh = () => {
      runNotices();
      runVersions();
    };
    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") refresh();
    };
    window.addEventListener("focus", refresh);
    window.addEventListener("online", refresh);
    document.addEventListener("visibilitychange", refreshWhenVisible);
    return () => {
      window.removeEventListener("focus", refresh);
      window.removeEventListener("online", refresh);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, [runNotices, runVersions]);

  const activeId =
    activeTab === "notifications" ? activeNoticeId : activeVersionId;
  const visibleNotice = activeTab === "notifications" ? activeNotice : null;
  const visibleVersion = activeTab === "versions" ? activeVersion : null;
  const currentItems =
    activeTab === "notifications"
      ? notices.map((notice) => ({
          id: notice._id,
          title: notice.title,
          date: getNoticeDisplayDate(notice),
          unread: !noticeReadSet.has(notice._id),
        }))
      : versions.map((version) => ({
          id: version._id,
          title: version.title,
          date: formatVersionUpdateDate(version.publishedAt),
          unread: !versionReadSet.has(version._id),
        }));

  const selectTab = (tab: MessageCenterTab) => {
    setActiveTab(tab);
    if (tab === "notifications") runNotices();
    else runVersions();
  };

  const handleTabKeyDown = (
    event: ReactKeyboardEvent<HTMLButtonElement>,
    currentTab: MessageCenterTab,
  ) => {
    const currentIndex = MESSAGE_CENTER_TABS.indexOf(currentTab);
    let nextIndex: number;

    switch (event.key) {
      case "ArrowLeft":
        nextIndex =
          (currentIndex - 1 + MESSAGE_CENTER_TABS.length) %
          MESSAGE_CENTER_TABS.length;
        break;
      case "ArrowRight":
        nextIndex = (currentIndex + 1) % MESSAGE_CENTER_TABS.length;
        break;
      case "Home":
        nextIndex = 0;
        break;
      case "End":
        nextIndex = MESSAGE_CENTER_TABS.length - 1;
        break;
      default:
        return;
    }

    event.preventDefault();
    event.stopPropagation();
    const nextTab = MESSAGE_CENTER_TABS[nextIndex];
    selectTab(nextTab);
    tabButtonRefs.current[nextTab]?.focus();
  };

  return (
    <div>
      <Badge dot={hasUnread}>
        <Tooltip title={t("ui.notifications")}>
          <AppIconButton
            aria-label={t("ui.notifications")}
            intent="quiet"
            size="small"
            onClick={() => {
              setActiveTab("notifications");
              openModal();
              runNotices();
              runVersions();
            }}
            icon={<RiNotification3Fill color="#fff" size={20} />}
          />
        </Tooltip>
      </Badge>
      <DesktopNextBaseModal
        visible={open}
        onClose={() => {
          closeModal();
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
            header={
              <div
                className="message-center-tabs"
                role="tablist"
                aria-label={t("ui.messageCenter.categories")}
              >
                <AppButton
                  ref={(element) => {
                    tabButtonRefs.current.notifications = element;
                  }}
                  intent="quiet"
                  size="small"
                  role="tab"
                  aria-selected={activeTab === "notifications"}
                  data-active={activeTab === "notifications"}
                  tabIndex={activeTab === "notifications" ? 0 : -1}
                  onClick={() => selectTab("notifications")}
                  onKeyDown={(event) =>
                    handleTabKeyDown(event, "notifications")
                  }
                >
                  {t("ui.notifications")}
                  {hasUnreadNotice ? <span className="tab-unread-dot" /> : null}
                </AppButton>
                <AppButton
                  ref={(element) => {
                    tabButtonRefs.current.versions = element;
                  }}
                  intent="quiet"
                  size="small"
                  role="tab"
                  aria-selected={activeTab === "versions"}
                  data-active={activeTab === "versions"}
                  tabIndex={activeTab === "versions" ? 0 : -1}
                  onClick={() => selectTab("versions")}
                  onKeyDown={(event) => handleTabKeyDown(event, "versions")}
                >
                  {t("ui.versionHistory")}
                  {hasUnreadVersion ? <span className="tab-unread-dot" /> : null}
                </AppButton>
              </div>
            }
            menuItems={currentItems.map((item) => ({
                key: item.id,
                label: (
                  <div className="notice-menu-label">
                    <div className="notice-menu-meta">
                      {item.date ? <time>{item.date}</time> : <span />}
                      {item.unread ? (
                        <span className="notice-unread-dot" />
                      ) : null}
                    </div>
                    <div className="notice-menu-title">{item.title}</div>
                  </div>
                ),
              }))}
            onMenuSelect={(key) => {
              if (activeTab === "notifications") {
                setActiveNoticeId(key);
                markNoticeRead(key);
              } else {
                setActiveVersionId(key);
                markVersionRead(key);
              }
            }}
            emptyText={
              activeTab === "notifications"
                ? t("ui.noNotifications")
                : t("ui.versionHistory.empty")
            }
          />

          <main className="notice-reader">
            {visibleNotice || visibleVersion ? (
              <article key={activeId} className="notice-article">
                <header className="notice-article-header">
                  <div className="notice-kind">
                    {activeTab === "versions" ? (
                      <RiHistoryLine size={13} />
                    ) : (
                      <RiNotification3Fill size={13} />
                    )}
                    <span>
                      {activeTab === "versions"
                        ? t("ui.versionHistory")
                        : t("ui.notice.system")}
                    </span>
                  </div>
                  <div className="notice-article-heading">
                    <h1 title={visibleNotice?.title ?? visibleVersion?.title}>
                      {visibleNotice?.title ?? visibleVersion?.title}
                    </h1>
                    <div className="notice-article-actions">
                      {visibleDate ? (
                        <div className="notice-article-meta">
                          <RiCalendarLine size={14} />
                          <time
                            dateTime={
                              visibleNotice?.effectiveStart ??
                              visibleNotice?.createdAt ??
                              visibleVersion?.publishedAt
                            }
                          >
                            {visibleDate}
                          </time>
                        </div>
                      ) : null}
                      {(visibleNotice &&
                        !noticeReadSet.has(visibleNotice._id)) ||
                      (visibleVersion &&
                        !versionReadSet.has(visibleVersion._id)) ? (
                        <AppButton
                          intent="quiet"
                          size="small"
                          icon={<RiCheckLine size={14} />}
                          onClick={() => {
                            if (visibleNotice)
                              markNoticeRead(visibleNotice._id);
                            if (visibleVersion)
                              markVersionRead(visibleVersion._id);
                          }}
                        >
                          {t("ui.markAsRead")}
                        </AppButton>
                      ) : null}
                    </div>
                  </div>
                </header>
                {visibleVersion ? (
                  <VersionUpdateBody
                    update={visibleVersion}
                    viewerClassName="notice-richtext"
                    footerClassName="notice-article-footer"
                  />
                ) : (
                  <SimpleEditorViewer
                    value={visibleNotice?.content ?? ""}
                    sanitize
                    className="notice-richtext"
                  />
                )}
              </article>
            ) : activeId ? (
              <div className="notice-empty-state">
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    activeTab === "notifications"
                      ? t("ui.notice.missingDescription")
                      : t("ui.versionHistory.missingDescription")
                  }
                />
              </div>
            ) : (
              <div className="notice-empty-state">
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    activeTab === "notifications"
                      ? t("ui.notice.selectPlaceholder")
                      : t("ui.versionHistory.selectPlaceholder")
                  }
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
    border-radius: var(--sn-radius-surface);
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
    border-radius: var(--sn-radius-round);
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
    border-radius: var(--sn-radius-compact);
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
      border-radius: var(--sn-radius-surface);
      padding: 18px;
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

  @media (prefers-contrast: more) {
    .notice-article {
      border-color: currentColor;
    }
  }
`;

const noticeSidebarClassName = css`
  width: 224px !important;
  flex: 0 0 224px;

  .message-center-tabs {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 3px;
    border: 1px solid rgba(60, 60, 67, 0.1);
    border-radius: var(--sn-radius-control);
    padding: 3px;
    background: rgba(118, 118, 128, 0.1);
  }

  .message-center-tabs [role="tab"] {
    min-width: 0;
  }

  .message-center-tabs [role="tab"][data-active="true"] {
    color: #1d1d1f;
    background: rgba(255, 255, 255, 0.9);
    box-shadow:
      0 1px 3px rgba(0, 0, 0, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.76);
  }

  .tab-unread-dot {
    width: 6px;
    height: 6px;
    flex: 0 0 auto;
    border-radius: 50%;
    background: var(--sn-accent, #007aff);
  }

  [data-theme="dark"] & .message-center-tabs {
    border-color: rgba(235, 235, 245, 0.1);
    background: rgba(118, 118, 128, 0.2);
  }

  [data-theme="dark"]
    &
    .message-center-tabs
    [role="tab"][data-active="true"] {
    color: #f5f5f7;
    background: rgba(255, 255, 255, 0.12);
    box-shadow:
      0 1px 3px rgba(0, 0, 0, 0.28),
      inset 0 1px 0 rgba(255, 255, 255, 0.08);
  }

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
