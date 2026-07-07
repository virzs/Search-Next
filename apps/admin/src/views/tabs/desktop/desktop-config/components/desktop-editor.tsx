import { Button, Tooltip } from "antd";
import { useEffect, useMemo, useRef, useState } from "react";
import { DesktopNext } from "zs_library";
import type { DesktopNextHandle, TypeConfigMap } from "zs_library";
import { v4 as uuidv4 } from "uuid";
import { ProFormRadio, ProFormSelect } from "@ant-design/pro-components";
import {
  buildAppLauncherDesktopItem,
  buildSizedAppDesktopItem,
  buildDesktopTypeConfigMap,
  buildWebsiteDesktopItem,
  createEmptyDesktopPages,
  DEFAULT_DESKTOP_FIXED_DOCK_ITEMS,
  extractDockItems,
  toDesktopPages,
  toDesktopRoots,
  type DesktopItemData,
  type DesktopPage,
  type DesktopRootItem,
  type DesktopSortItem,
} from "@search-next/desktop";
import {
  DesktopThemeConfig,
  getActiveDesktopThemeConfig,
} from "@/services/tabs/desktop/theme-config";
import WebsiteSelectModal from "./website-select-modal";
import type { Website } from "@/services/tabs/website_classifty";
import AppSelectModal, {
  toBackendAssetUrl,
  type AppItemWithDesktopSize,
} from "./app-select-modal";
import type { AppItem } from "@/services/tabs/app";
import {
  adminDesktopItemIconBuilder,
  createAdminFixedItemBuilder,
} from "./desktop-rendering";

export interface DesktopEditorProps {
  value?: {
    list?: DesktopRootItem[];
    [key: string]: unknown;
  };
  onChange?: (value: {
    list: DesktopRootItem[];
    [key: string]: unknown;
  }) => void;
}

const DesktopEditor = ({ value, onChange }: DesktopEditorProps) => {
  const desktopRef = useRef<DesktopNextHandle>(null);
  const initializedRef = useRef(false);
  const valueRef = useRef(value);
  const onChangeRef = useRef(onChange);
  const [websiteModalOpen, setWebsiteModalOpen] = useState(false);
  const [appModalOpen, setAppModalOpen] = useState(false);
  const [componentModalOpen, setComponentModalOpen] = useState(false);
  const [pages, setPages] = useState<DesktopPage[]>(createEmptyDesktopPages);
  const [dockItems, setDockItems] = useState<
    DesktopSortItem<DesktopItemData>[]
  >([]);

  const [selectedDesktopTheme, setSelectedDesktopTheme] =
    useState<DesktopThemeConfig | null>(null);
  const [selectedDesktopThemeType, setSelectedDesktopThemeType] = useState<
    "lightConfig" | "darkConfig"
  >("lightConfig");

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (initializedRef.current) return;
    if (!value) return;

    const list = Array.isArray(value.list) ? value.list : [];
    setPages(toDesktopPages(list) as DesktopPage[]);
    setDockItems(extractDockItems(list) as DesktopSortItem<DesktopItemData>[]);
    initializedRef.current = true;
  }, [value]);

  useEffect(() => {
    onChangeRef.current?.({
      ...(valueRef.current ?? {}),
      list: toDesktopRoots(pages, dockItems),
    });
  }, [dockItems, pages]);

  const typeConfigMap = useMemo(
    () => buildDesktopTypeConfigMap([], pages) as TypeConfigMap,
    [pages],
  );

  const addItemsToCurrentPage = (items: DesktopSortItem<DesktopItemData>[]) => {
    if (!items.length) return;
    setPages((currentPages) => {
      const sourcePages = currentPages.length
        ? currentPages
        : createEmptyDesktopPages();
      const currentPageIndex = desktopRef.current?.currentPage ?? 0;
      const targetPageIndex = Math.min(
        Math.max(currentPageIndex, 0),
        sourcePages.length - 1,
      );
      return sourcePages.map((page, index) =>
        index === targetPageIndex
          ? { ...page, children: [...page.children, ...items] }
          : page,
      );
    });
  };

  return (
    <div className="flex w-full h-full">
      <div className="w-64 border-r pr-4">
        <ProFormSelect
          wrapperCol={{ span: 24 }}
          fieldProps={{
            className: "w-full",
            fieldNames: {
              label: "name",
              value: "_id",
            },
            optionRender: (item) => {
              const data = item.data as DesktopThemeConfig;
              const { name, lightConfig, darkConfig } = data;

              const renderBaseSwatches = (cfg: any) => {
                const base = cfg?.token?.base || {};
                const entries = Object.entries(base || {});
                return (
                  <div className="flex flex-wrap items-center gap-2">
                    {entries.map(([prop, color]) => (
                      <Tooltip
                        key={prop}
                        title={`${(color as string) || "未设置"}`}
                      >
                        <div
                          className="w-4 h-4 rounded border"
                          style={{
                            backgroundColor: (color as string) || "transparent",
                          }}
                        />
                      </Tooltip>
                    ))}
                  </div>
                );
              };

              return (
                <div className="flex flex-col gap-1 py-1">
                  <div className="font-medium">{name}</div>
                  <div className="text-xs text-gray-400 mb-1">亮色基础色</div>
                  {renderBaseSwatches(lightConfig)}
                  {darkConfig ? (
                    <>
                      <div className="text-xs text-gray-400 mt-1 mb-1">
                        深色基础色
                      </div>
                      {renderBaseSwatches(darkConfig)}
                    </>
                  ) : null}
                </div>
              );
            },
            value: selectedDesktopTheme?._id,
            onChange: (_, option) => {
              setSelectedDesktopTheme(option as DesktopThemeConfig);
            },
          }}
          placeholder="默认主题"
          request={getActiveDesktopThemeConfig}
        />
        <ProFormRadio.Group
          name="desktop-theme-type"
          radioType="button"
          options={[
            {
              label: "浅色",
              value: "lightConfig",
            },
            {
              label: "深色",
              value: "darkConfig",
            },
          ]}
          fieldProps={{
            value: selectedDesktopThemeType,
            onChange: (event) => {
              setSelectedDesktopThemeType(
                event.target.value as "lightConfig" | "darkConfig",
              );
            },
          }}
        />
        <div className="flex mb-2">
          <Button
            type="primary"
            className="w-full"
            onClick={() => setWebsiteModalOpen(true)}
          >
            选择网站并添加
          </Button>
        </div>
        <div className="flex mb-2">
          <Button className="w-full" onClick={() => setAppModalOpen(true)}>
            选择应用并添加
          </Button>
        </div>
        <div className="flex mb-2">
          <Button className="w-full" onClick={() => setComponentModalOpen(true)}>
            选择组件并添加
          </Button>
        </div>
      </div>
      <DesktopNext<DesktopItemData>
        ref={desktopRef}
        className="h-full flex-grow"
        pages={pages}
        onChange={(nextPages) => setPages(nextPages as DesktopPage[])}
        maxPages={5}
        theme={selectedDesktopTheme?.[selectedDesktopThemeType]}
        typeConfigMap={typeConfigMap}
        contextMenuProps={{ showRemoveButton: true }}
        itemIconBuilder={adminDesktopItemIconBuilder}
        dockProps={{
          items: dockItems,
          fixedItems: DEFAULT_DESKTOP_FIXED_DOCK_ITEMS,
          fixedItemBuilder: createAdminFixedItemBuilder,
        }}
      />
      <WebsiteSelectModal
        open={websiteModalOpen}
        onCancel={() => setWebsiteModalOpen(false)}
        onOk={(websites: Website[]) => {
          const items = (websites ?? [])
            .filter((website) => Boolean(website?.url))
            .map((website) =>
              buildWebsiteDesktopItem({
                id: uuidv4(),
                name: website.name,
                icon: website.iconEdited?.url || website.icon?.url,
                iconColor: (website as any)?.themeColor,
                url: website.url,
              }),
            );
          addItemsToCurrentPage(items);
          setWebsiteModalOpen(false);
        }}
      />
      <AppSelectModal
        open={appModalOpen}
        onCancel={() => setAppModalOpen(false)}
        onOk={(apps: AppItem[]) => {
          const items = (apps ?? [])
            .map((app) =>
              buildAppLauncherDesktopItem(app, {
                instanceId: uuidv4(),
                appId: app._id,
                name: app.name,
                description: app.description,
                resolveAssetUrl: toBackendAssetUrl,
              }),
            )
            .filter(
              (item): item is DesktopSortItem<DesktopItemData> => item !== null,
            );
          addItemsToCurrentPage(items);
          setAppModalOpen(false);
        }}
      />
      <AppSelectModal
        open={componentModalOpen}
        mode="component"
        title="选择组件"
        okText="添加组件"
        onCancel={() => setComponentModalOpen(false)}
        onOk={(apps: AppItemWithDesktopSize[]) => {
          const items = (apps ?? [])
            .map((app) =>
              buildSizedAppDesktopItem(app, {
                instanceId: uuidv4(),
                appId: app._id,
                name: app.name,
                description: app.description,
                sizeId: app.desktopSizeId,
                resolveAssetUrl: toBackendAssetUrl,
              }),
            )
            .filter(
              (item): item is DesktopSortItem<DesktopItemData> => item !== null,
            );
          addItemsToCurrentPage(items);
          setComponentModalOpen(false);
        }}
      />
    </div>
  );
};

export default DesktopEditor;
