import { FC, useEffect, useMemo, useState } from "react";
import {
  Drawer,
  Spin,
  Checkbox,
  Pagination,
  Image,
  Empty,
  Input,
  Select,
  Button,
} from "antd";
import { useTablePage } from "@/hooks/useTablePage2";
import { getApp, AppItem } from "@/services/tabs/app";
import { getBackendOrigin, toBackendAssetUrl } from "./desktop-assets";

export { getBackendOrigin, toBackendAssetUrl };

export type AppSelectMode = "app" | "component";
export type AppItemWithDesktopSize = AppItem & { desktopSizeId?: string };

export interface AppSelectModalProps {
  open: boolean;
  mode?: AppSelectMode;
  value?: AppItemWithDesktopSize[];
  title?: string;
  okText?: string;
  onOk: (apps: AppItemWithDesktopSize[]) => void | Promise<void>;
  onCancel: () => void;
}

const supportsAppMode = (item: AppItem) =>
  Boolean(
    (item.configSnapshot?.supportAppMode as boolean | undefined) ??
    item.supportAppMode,
  );

const supportsIconMode = (item: AppItem) =>
  Boolean(
    (item.configSnapshot?.supportIconMode as boolean | undefined) ??
    item.supportIconMode,
  );

const getSizeConfigs = (item: AppItem) => {
  const snapshotSizeConfigs = Array.isArray(item.configSnapshot?.sizeConfigs)
    ? item.configSnapshot.sizeConfigs
    : undefined;
  const sizeConfigs = snapshotSizeConfigs?.length
    ? snapshotSizeConfigs
    : item.sizeConfigs;
  return sizeConfigs?.length
    ? sizeConfigs
    : [{ row: 2, col: 2, name: "2x2", id: "2x2" }];
};

const getDefaultSizeId = (item: AppItem) => {
  const snapshotDefaultSizeId =
    typeof item.configSnapshot?.defaultSizeId === "string"
      ? item.configSnapshot.defaultSizeId
      : undefined;
  return (
    item.desktopSizeId ||
    snapshotDefaultSizeId ||
    item.defaultSizeId ||
    getSizeConfigs(item)[0]?.id ||
    "2x2"
  );
};

const getAppIconUrl = (item: AppItem) => {
  const snapshotIconUrl =
    typeof item.configSnapshot?.appIconUrl === "string"
      ? item.configSnapshot.appIconUrl
      : undefined;
  return (
    item.appIconUrl || snapshotIconUrl || item.iconUrl || item.icon?.url || ""
  );
};

const AppSelectModal: FC<AppSelectModalProps> = (props) => {
  const { open, mode = "app", value, title, okText, onOk, onCancel } = props;
  const [selectedMap, setSelectedMap] = useState<
    Map<string, AppItemWithDesktopSize>
  >(new Map());
  const [keyword, setKeyword] = useState("");
  const resourceParams = useMemo(
    () =>
      mode === "component"
        ? { enable: true, supportIconMode: true }
        : { enable: true, supportAppMode: true },
    [mode],
  );

  const table = useTablePage<AppItem>(
    (params) =>
      getApp({
        ...params,
        ...resourceParams,
      }),
    {
      pathname: `/desktop/app-select-modal/${mode}`,
      defaultParams: {
        page: 1,
        pageSize: 1000,
        ...resourceParams,
      },
    },
  );

  const {
    data: rawAppData = [],
    total = 0,
    current,
    setCurrent,
    pageSize,
    setPageSize,
    loading,
  } = table;

  const appData = useMemo(() => {
    const predicate = mode === "component" ? supportsIconMode : supportsAppMode;
    return rawAppData.filter(
      (item) => item.enable !== false && predicate(item),
    );
  }, [mode, rawAppData]);

  useEffect(() => {
    if (!open) return;
    setSelectedMap(() => {
      const next = new Map<string, AppItemWithDesktopSize>();
      for (const app of value || []) {
        if (app?._id) {
          next.set(app._id, {
            ...app,
            desktopSizeId:
              app.desktopSizeId ||
              (mode === "component" ? getDefaultSizeId(app) : undefined),
          });
        }
      }
      return next;
    });
  }, [mode, open, value]);

  useEffect(() => {
    if (!open) return;
    table.run({
      ...table.params,
      ...resourceParams,
      page: 1,
      search: keyword || undefined,
    });
  }, [open]);

  const toggleSelect = (record: AppItem, checked?: boolean) => {
    setSelectedMap((prev) => {
      const next = new Map(prev);
      const key = record._id;
      if (!key) return next;
      if (checked ?? !next.has(key)) {
        next.set(key, {
          ...record,
          desktopSizeId:
            mode === "component" ? getDefaultSizeId(record) : undefined,
        });
      } else {
        next.delete(key);
      }
      return next;
    });
  };

  const updateSelectedSize = (record: AppItem, sizeId: string) => {
    if (!record._id) return;
    setSelectedMap((prev) => {
      const next = new Map(prev);
      const selected = next.get(record._id);
      next.set(record._id, {
        ...(selected ?? record),
        desktopSizeId: sizeId,
      });
      return next;
    });
  };

  const handleOk = async () => {
    await onOk(Array.from(selectedMap.values()));
  };

  const handleSearch = (v?: string) => {
    const nextKeyword = (v || "").trim();
    setKeyword(nextKeyword);
    table.run({
      ...table.params,
      ...resourceParams,
      page: 1,
      search: nextKeyword || undefined,
    });
  };

  return (
    <Drawer
      open={open}
      onClose={onCancel}
      width={560}
      title={title ?? (mode === "component" ? "选择组件" : "选择应用")}
      footer={
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm text-gray-500">
            已选择：{selectedMap.size} 项
          </span>
          <div className="flex items-center gap-2">
            <Button onClick={onCancel}>取消</Button>
            <Button type="primary" onClick={handleOk}>
              {okText ?? "确定"}
            </Button>
          </div>
        </div>
      }
    >
      <div className="flex h-full flex-col">
        <div className="mb-3">
          <Input.Search
            allowClear
            placeholder={mode === "component" ? "搜索组件名称" : "搜索应用名称"}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onSearch={handleSearch}
            onClear={() => handleSearch("")}
          />
        </div>
        <Spin className="w-full" spinning={loading}>
          {appData.length ? (
            <div className="grid grid-cols-1 gap-2">
              {appData.map((item) => {
                const selected = item._id ? selectedMap.has(item._id) : false;
                const selectedItem = item._id ? selectedMap.get(item._id) : undefined;
                const iconUrl = toBackendAssetUrl(getAppIconUrl(item));
                const sizeConfigs = getSizeConfigs(item);
                const activeSizeId =
                  selectedItem?.desktopSizeId || getDefaultSizeId(item);
                return (
                  <div key={item._id}>
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
                        {mode === "component" ? (
                          <div
                            className="mt-2"
                            onClick={(event) => event.stopPropagation()}
                          >
                            <Select
                              size="small"
                              className="w-full"
                              value={activeSizeId}
                              options={sizeConfigs.map((size) => ({
                                label: `${size.name || size.id} · ${size.col}x${size.row}`,
                                value: size.id || `${size.col}x${size.row}`,
                              }))}
                              onChange={(sizeId) => {
                                updateSelectedSize(item, sizeId);
                              }}
                            />
                          </div>
                        ) : null}
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
            <Empty
              description={
                mode === "component" ? "暂无可添加组件" : "暂无可添加应用"
              }
            />
          )}
        </Spin>

        <div className="mt-3 flex items-center justify-end">
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
    </Drawer>
  );
};

export default AppSelectModal;
