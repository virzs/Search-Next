import { getNoticeInbox, type NoticeInboxItem } from "@/services/system/notice";
import { RiCheckLine, RiMessageLine } from "@remixicon/react";
import { useRequest } from "ahooks";
import { Badge, Button, Drawer, Empty, List, Tooltip, Typography } from "antd";
import dayjs from "dayjs";
import { useCallback, useEffect, useMemo, useState } from "react";
import { SimpleEditorViewer } from "zs_library";

const READ_STORAGE_KEY = "search-next:admin-notice-read-ids";
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

const AdminNoticeCenter = () => {
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState<string>();
  const [readIds, setReadIds] = useState<string[]>(readStoredIds);
  const { data = [], run } = useRequest(() => getNoticeInbox("admin"), {
    pollingInterval: 60 * 60 * 1000,
  });

  const notices = data as NoticeInboxItem[];
  const active = notices.find((item) => item._id === activeId) || notices[0];
  const readSet = useMemo(() => new Set(readIds), [readIds]);
  const hasUnread = notices.some((item) => !readSet.has(item._id));

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
      <Drawer
        title="消息中心"
        placement="right"
        width="min(520px, 100vw)"
        open={open}
        onClose={() => setOpen(false)}
        styles={{ body: { padding: 0 } }}
      >
        {notices.length ? (
          <div className="grid h-full min-h-0 grid-cols-[180px_minmax(0,1fr)] max-sm:grid-cols-1">
            <div className="overflow-y-auto border-r border-gray-100 max-sm:max-h-52 max-sm:border-b max-sm:border-r-0">
              <List
                dataSource={notices}
                renderItem={(item) => (
                  <List.Item
                    className={`cursor-pointer px-4! transition-colors ${
                      active?._id === item._id
                        ? "bg-orange-50"
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => {
                      setActiveId(item._id);
                      markRead(item._id);
                    }}
                  >
                    <div className="min-w-0 py-1">
                      <div className="flex items-center gap-2">
                        {!readSet.has(item._id) ? (
                          <span className="h-2 w-2 shrink-0 rounded-full bg-orange-500" />
                        ) : null}
                        <span className="truncate text-sm font-medium">
                          {item.title}
                        </span>
                      </div>
                      <div className="mt-1 text-xs text-gray-400">
                        {dayjs(item.effectiveStart || item.createdAt).format(
                          "YYYY-MM-DD",
                        )}
                      </div>
                    </div>
                  </List.Item>
                )}
              />
            </div>
            <div className="min-w-0 overflow-y-auto p-5">
              {active ? (
                <div>
                  <div className="mb-4 flex items-start justify-between gap-3 border-b border-gray-100 pb-4">
                    <div>
                      <Typography.Title level={4} className="mb-1!">
                        {active.title}
                      </Typography.Title>
                      <Typography.Text type="secondary" className="text-xs!">
                        {dayjs(
                          active.effectiveStart || active.createdAt,
                        ).format("YYYY-MM-DD HH:mm")}
                      </Typography.Text>
                    </div>
                    {!readSet.has(active._id) ? (
                      <Button
                        size="small"
                        icon={<RiCheckLine size={14} />}
                        onClick={() => markRead(active._id)}
                      >
                        已读
                      </Button>
                    ) : null}
                  </div>
                  <SimpleEditorViewer value={active.content || ""} sanitize />
                </div>
              ) : (
                <Empty description="请选择一条消息" />
              )}
            </div>
          </div>
        ) : (
          <div className="grid h-full place-items-center">
            <Empty description="暂无消息" />
          </div>
        )}
      </Drawer>
    </>
  );
};

export default AdminNoticeCenter;
