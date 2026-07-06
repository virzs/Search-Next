import { Button, Tooltip } from "antd";
import { useEffect, useRef, useState } from "react";
import { Desktop, DesktopAppItem, DesktopHandle, DesktopListItem, DesktopSortItem } from "zs_library";
import { v4 as uuidv4 } from "uuid";
import { ProFormRadio, ProFormSelect } from "@ant-design/pro-components";
import { DesktopThemeConfig, getActiveDesktopThemeConfig } from "@/services/tabs/desktop/theme-config";
import { RemixiconComponentType, RiBrush2Fill, RiSettingsFill, RiStore2Fill, RiUserFill } from "@remixicon/react";
import { css, cx } from "@emotion/css";
import WebsiteSelectModal from "./website-select-modal";
import type { Website } from "@/services/tabs/website_classifty";
import AppSelectModal, { toBackendAssetUrl } from "./app-select-modal";
import type { AppItem } from "@/services/tabs/app";

export interface DesktopEditorProps {
  value?: any;
  onChange?: (value: any) => void;
}

const DesktopEditor = ({ value, onChange }: DesktopEditorProps) => {
  const desktopRef = useRef<DesktopHandle>(null);
  const initializedRef = useRef<boolean>(false);
  const [websiteModalOpen, setWebsiteModalOpen] = useState<boolean>(false);
  const [appModalOpen, setAppModalOpen] = useState<boolean>(false);

  const [list, setlist] = useState<DesktopListItem[]>([
    {
      id: "dock",
      type: "dock",
      children: [],
    },
  ]);

  const [selectedDesktopTheme, setSelectedDesktopTheme] = useState<DesktopThemeConfig | null>(null);
  const [selectedDesktopThemeType, setSelectedDesktopThemeType] = useState<"lightConfig" | "darkConfig" | null>(
    "lightConfig"
  );

  useEffect(() => {
    if (onChange) {
      onChange({
        list,
      });
    }
  }, [list]);

  // 仅第一次通过 value 进行回显初始化
  useEffect(() => {
    if (initializedRef.current) return;
    if (!value) return;

    try {
      // 回显列表
      if (Array.isArray((value as any)?.list)) {
        setlist((value as any).list as DesktopListItem[]);
        desktopRef.current?.state.setList((value as any).list as DesktopListItem[]);
      }
    } finally {
      initializedRef.current = true;
    }
  }, [value]);

  const createFixedItemBuilder = (i: DesktopSortItem) => {
    // 封装通用的固定项组件
    const createFixedItem = ({
      key,
      name,
      IconComponent,
      backgroundStyle,
      iconSize,
      onClick,
    }: {
      key: string;
      name: string;
      IconComponent: RemixiconComponentType;
      backgroundStyle: string;
      iconSize?: number;
      onClick?: () => void;
    }) => (
      <DesktopAppItem
        key={key}
        disabledDrag
        iconSize={56}
        data={{
          id: i.id,
          type: "app",
          data: { name },
        }}
        onClick={onClick}
        itemIndex={-1}
        noLetters
        contextMenuProps={false}
        icon={
          <div
            className={cx(
              "flex items-center justify-center w-full h-full rounded-lg",
              css`
                ${backgroundStyle}
                color: #fff;
              `
            )}
          >
            <IconComponent size={iconSize} />
          </div>
        }
      />
    );

    switch (i.id) {
      case "*:my":
        return createFixedItem({
          key: "my",
          name: "账号",
          IconComponent: RiUserFill,
          backgroundStyle: "background: linear-gradient(135deg, #ff6b6b 0%, #f06595 100%);",
        });
      case "*:theme":
        return createFixedItem({
          key: "theme",
          name: "主题",
          IconComponent: RiBrush2Fill,
          backgroundStyle: `background: conic-gradient(from 0deg at center,
            #ff0000 0deg, #ff8000 60deg, #ffff00 120deg,
            #80ff00 180deg, #00ff80 240deg, #0080ff 300deg, #ff0000 360deg);`,
          iconSize: 28,
        });
      case "*:store":
        return createFixedItem({
          key: "store",
          name: "应用商店",
          IconComponent: RiStore2Fill,
          backgroundStyle: "background: linear-gradient(135deg, #0066ff 0%, #3399ff 50%, #66b3ff 100%);",
        });
      case "*:settings":
        return createFixedItem({
          key: "settings",
          name: "设置",
          IconComponent: RiSettingsFill,
          backgroundStyle: "background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%);",
        });
      default:
        return null;
    }
  };

  const getAppEntryUrl = (app: AppItem) => {
    const snapshotEntry =
      typeof app.configSnapshot?.entryUrl === "string"
        ? app.configSnapshot.entryUrl
        : undefined;
    const entry =
      app.entryUrl ||
      snapshotEntry ||
      (app.dir && app.entryFileName
        ? `/uploads/${app.dir}/${app.entryFileName}`
        : "");
    return toBackendAssetUrl(entry);
  };

  const getAppIconUrl = (app: AppItem) => {
    const snapshotIconUrl =
      typeof app.configSnapshot?.appIconUrl === "string"
        ? app.configSnapshot.appIconUrl
        : undefined;
    const appIcon =
      (app.appIcon || app.configSnapshot?.appIcon) as
        | AppItem["appIcon"]
        | undefined;
    if (appIcon?.type === "custom") return "";
    return toBackendAssetUrl(
      app.appIconUrl ||
        snapshotIconUrl ||
        app.iconUrl ||
        app.icon?.url ||
        "",
    );
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
                      <Tooltip key={prop} title={`${(color as string) || "未设置"}`}>
                        <div
                          className="w-4 h-4 rounded border"
                          style={{ backgroundColor: (color as string) || "transparent" }}
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
                      <div className="text-xs text-gray-400 mt-1 mb-1">深色基础色</div>
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
          name="radio-group"
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
            onChange: (value) => {
              setSelectedDesktopThemeType(value.target.value as "lightConfig" | "darkConfig");
            },
          }}
        />
        <div className="flex mb-2">
          <Button type="primary" className="w-full" onClick={() => setWebsiteModalOpen(true)}>
            选择网站并添加
          </Button>
        </div>
        <div className="flex mb-2">
          <Button className="w-full" onClick={() => setAppModalOpen(true)}>
            选择应用并添加
          </Button>
        </div>
      </div>
      <Desktop
        ref={desktopRef}
        className="h-full flex-grow"
        enableCaching={false}
        theme={selectedDesktopTheme?.[selectedDesktopThemeType || "lightConfig"]}
        list={list}
        onChange={(d) => {
          setlist(d);
        }}
        dock={{
          enabled: true,
          fixedItems: [
            {
              id: "*:my",
              type: "app",
              data: {
                name: "账号",
              },
            },
            {
              id: "*:theme",
              type: "app",
              data: {
                name: "主题",
              },
            },
            {
              id: "*:store",
              type: "app",
              data: {
                name: "应用商店",
              },
            },
            {
              id: "*:settings",
              type: "app",
              data: {
                name: "设置",
              },
            },
          ],
          fixedItemBuilder: createFixedItemBuilder,
        }}
      />
      <WebsiteSelectModal
        open={websiteModalOpen}
        onCancel={() => setWebsiteModalOpen(false)}
        onOk={(websites: Website[]) => {
          if (!websites || !websites.length) {
            setWebsiteModalOpen(false);
            return;
          }
          const firstGroup = list.filter((item) => item.type === "page")[0];
          const items = websites.map((w) => ({
            id: uuidv4(),
            type: "app" as const,
            data: {
              name: w.name,
              icon: w.iconEdited?.url || w.icon?.url,
              iconColor: (w as any)?.themeColor,
              url: w.url,
            },
          }));
          if (firstGroup) {
            items.forEach((item) => desktopRef.current?.state.addItem(item, [firstGroup.id]));
          } else {
            desktopRef.current?.state?.addRootItem({
              id: uuidv4(),
              type: "page",
              children: items,
            });
          }
          setWebsiteModalOpen(false);
        }}
      />
      <AppSelectModal
        open={appModalOpen}
        onCancel={() => setAppModalOpen(false)}
        onOk={(apps: AppItem[]) => {
          if (!apps || !apps.length) {
            setAppModalOpen(false);
            return;
          }
          const firstGroup = list.filter((item) => item.type === "page")[0];
          const items = apps.map((app) => {
            const appIcon =
              (app.appIcon || app.configSnapshot?.appIcon) as
                | AppItem["appIcon"]
                | undefined;
            const appIconUrl = getAppIconUrl(app);
            return {
              id: uuidv4(),
              type: "app" as const,
              dataType: `app-launcher:${app._id}`,
              data: {
                name: app.name,
                ...(appIconUrl ? { icon: appIconUrl } : {}),
                appConfig: {
                  id: app._id || "",
                  name: app.name,
                  entry: getAppEntryUrl(app),
                  props: { title: app.name },
                  defaultSizeId: app.defaultSizeId,
                  supportAppMode: Boolean(
                    (app.configSnapshot?.supportAppMode as boolean | undefined) ??
                      app.supportAppMode,
                  ),
                  appIcon,
                  appIconUrl,
                  sourceType: app.sourceType,
                  version:
                    (app.configSnapshot?.version as string | undefined) ??
                    app.version,
                  author:
                    (app.configSnapshot?.author as string | undefined) ??
                    app.author,
                  description: app.description,
                },
              },
            };
          });
          if (firstGroup) {
            items.forEach((item) => desktopRef.current?.state.addItem(item, [firstGroup.id]));
          } else {
            desktopRef.current?.state?.addRootItem({
              id: uuidv4(),
              type: "page",
              children: items,
            });
          }
          setAppModalOpen(false);
        }}
      />
    </div>
  );
};

export default DesktopEditor;
