import { FC, useEffect, useState } from "react";
import { Checkbox, Empty, Image, Input, Modal, Pagination, Spin } from "antd";
import { useTablePage } from "@/hooks/useTablePage2";
import { getApp, AppItem } from "@/services/tabs/app";
import {
  toBackendAssetUrl,
} from "@/views/tabs/desktop/desktop-config/components/app-select-modal";

export interface AppSelectModalProps {
  open: boolean;
  value?: AppItem[];
  title?: string;
  okText?: string;
  onOk: (apps: AppItem[]) => void | Promise<void>;
  onCancel: () => void;
}

const supportsAppMode = (item: AppItem) =>
  Boolean((item.configSnapshot?.supportAppMode as boolean | undefined) ?? item.supportAppMode);

const getIconUrl = (item: AppItem) => {
  const snapshotIconUrl =
    typeof item.configSnapshot?.iconUrl === "string"
      ? item.configSnapshot.iconUrl
      : undefined;
  return item.iconUrl || snapshotIconUrl || item.icon?.url || "";
};

const AppSelectModal: FC<AppSelectModalProps> = (props) => {
  const { open, value, title, okText, onOk, onCancel } = props;
  const [selectedMap, setSelectedMap] = useState<Map<string, AppItem>>(new Map());
  const [keyword, setKeyword] = useState("");

  const table = useTablePage<AppItem>(getApp, {
    pathname: "/tabs/app-collection-select-modal",
    defaultParams: { page: 1, pageSize: 1000 },
  });

  const {
    data: appData = [],
    total = 0,
    current,
    setCurrent,
    pageSize,
    setPageSize,
    loading,
  } = table;

  const visibleData = appData.filter(supportsAppMode);

  useEffect(() => {
    if (!open) return;
    setSelectedMap(() => {
      const next = new Map<string, AppItem>();
      for (const app of value || []) {
        if (app?._id) next.set(app._id, app);
      }
      return next;
    });
  }, [open, value]);

  useEffect(() => {
    if (!open) return;
    table.run({ ...table.params, page: 1, search: keyword || undefined });
  }, [open]);

  const toggleSelect = (record: AppItem, checked?: boolean) => {
    setSelectedMap((prev) => {
      const next = new Map(prev);
      const key = record._id;
      if (!key) return next;
      if (checked ?? !next.has(key)) next.set(key, record);
      else next.delete(key);
      return next;
    });
  };

  const handleSearch = (v?: string) => {
    const nextKeyword = (v || "").trim();
    setKeyword(nextKeyword);
    table.run({ ...table.params, page: 1, search: nextKeyword || undefined });
  };

  return (
    <Modal
      open={open}
      width={820}
      okText={okText ?? "确定"}
      title={title ?? "选择应用"}
      onCancel={onCancel}
      onOk={async () => onOk(Array.from(selectedMap.values()))}
    >
      <div style={{ minHeight: 520 }}>
        <div className="mb-3">
          <Input.Search
            allowClear
            placeholder="搜索应用名称"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onSearch={handleSearch}
            onClear={() => handleSearch("")}
          />
        </div>
        <Spin className="w-full" spinning={loading}>
          {visibleData.length ? (
            <div className="flex flex-wrap gap-3">
              {visibleData.map((item) => {
                const selected = item._id ? selectedMap.has(item._id) : false;
                const iconUrl = toBackendAssetUrl(getIconUrl(item));
                return (
                  <div key={item._id} className="max-w-60 w-full">
                    <div
                      className={`flex items-center gap-2 p-2 rounded border cursor-pointer ${
                        selected ? "border-blue-500" : "border-gray-200"
                      }`}
                      onClick={() => toggleSelect(item)}
                    >
                      {iconUrl ? (
                        <Image
                          className="!w-9 !h-9 object-contain shrink-0"
                          preview={false}
                          src={iconUrl}
                        />
                      ) : null}
                      <div className="flex-1 w-0">
                        <div className="font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                          {item.name}
                        </div>
                        <div className="text-xs text-gray-400 whitespace-nowrap overflow-hidden text-ellipsis">
                          {item.version || "未设置版本"}
                        </div>
                      </div>
                      <Checkbox
                        checked={selected}
                        onChange={(e) => toggleSelect(item, e.target.checked)}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <Empty description="暂无可添加应用" />
          )}
        </Spin>
        <div className="mt-3 flex items-center justify-between">
          <div className="text-sm">已选择：{selectedMap.size} 项</div>
          <Pagination
            pageSize={pageSize}
            total={total}
            current={current}
            showSizeChanger
            pageSizeOptions={[200, 1000, 3000, 5000, 10000]}
            onChange={(page, size) => {
              if (size !== pageSize) {
                table.setCurrent(1);
                setPageSize(size);
                return;
              }
              setCurrent(page);
            }}
          />
        </div>
      </div>
    </Modal>
  );
};

export default AppSelectModal;
