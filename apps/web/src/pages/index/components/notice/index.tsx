import { AppSidebar } from "@/components";
import { getNotice } from "@/services/system";
import { getNoticeReadIds, setNoticeReadIds } from "@/utils/notice";
import { RiNotification3Fill } from "@remixicon/react";
import { useBoolean, useRequest } from "ahooks";
import { Badge, Button, Empty, Tooltip } from "antd";
import { format } from "date-fns";
import { useEffect, useMemo, useRef, useState } from "react";
import { DesktopNextBaseModal, SimpleEditorViewer } from "zs_library";

const Notice = () => {
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

  useEffect(() => {
    if (!open) return;
    if (!activeId) return;
    setReadIds((prev) => {
      if (prev.includes(activeId)) return prev;
      const next = [...prev, activeId];
      setNoticeReadIds(next);
      return next;
    });
  }, [activeId, open]);

  const readIdSet = useMemo(() => new Set(readIds), [readIds]);

  const activeNotice = useMemo(() => {
    if (!activeId) return null;
    return notices.find((n) => n._id === activeId) ?? null;
  }, [activeId, notices]);

  const hasUnread = useMemo(() => {
    return notices.some((n) => !readIdSet.has(n._id));
  }, [notices, readIdSet]);

  useEffect(() => {
    if (autoOpenCheckedRef.current) return;
    if (data === undefined) return;
    autoOpenCheckedRef.current = true;
    if (!hasUnread) return;
    setActiveId(null);
    openModal();
  }, [data, hasUnread, openModal]);

  return (
    <div>
      <Badge dot={hasUnread}>
        <Tooltip title="通知">
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
      >
        <div className="flex w-full overflow-hidden h-[50vh] min-h-full max-h-[500px]">
          <AppSidebar
            header={
              <div className="text-2xl font-bold tracking-tight">通知</div>
            }
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
                <div className="min-w-0 w-full">
                  <div className="text-xs leading-4 text-gray-500">
                    {format(i.effectiveStart, "yyyy-MM-dd")}
                  </div>
                  <div className="min-w-0 text-sm font-medium text-gray-900 leading-5 line-clamp-1 wrap-break-word">
                    {i.title}
                  </div>
                </div>
              ),
            }))}
            onMenuSelect={setActiveId}
            className="w-44! pr-2!"
          />
          <div className="flex-1 min-h-0 flex overflow-hidden rounded-xl border border-gray-200 bg-white">
            <div className="flex-1 min-w-0 overflow-y-auto p-4">
              {activeNotice ? (
                <div className="min-w-0">
                  <SimpleEditorViewer
                    value={activeNotice.content ?? ""}
                    sanitize
                    className="w-full [&_.simple-editor]:p-0! [&_.simple-editor]:text-[14px]! [&_.simple-editor]:whitespace-normal!"
                  />
                </div>
              ) : activeId ? (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="通知不存在或已下线"
                />
              ) : (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="请从左侧选择一条通知查看详情"
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
