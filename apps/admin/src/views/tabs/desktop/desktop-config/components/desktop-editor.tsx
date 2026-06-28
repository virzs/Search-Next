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
import WidgetAppSelectModal, { toBackendAssetUrl } from "./widget-app-select-modal";
import type { WidgetItem } from "@/services/tabs/widget";

export interface DesktopEditorProps {
  value?: any;
  onChange?: (value: any) => void;
}

const DesktopEditor = ({ value, onChange }: DesktopEditorProps) => {
  const desktopRef = useRef<DesktopHandle>(null);
  const initializedRef = useRef<boolean>(false);
  const [websiteModalOpen, setWebsiteModalOpen] = useState<boolean>(false);
  const [widgetAppModalOpen, setWidgetAppModalOpen] = useState<boolean>(false);

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

  const getWidgetEntryUrl = (widget: WidgetItem) => {
    const snapshotEntry =
      typeof widget.configSnapshot?.entryUrl === "string"
        ? widget.configSnapshot.entryUrl
        : undefined;
    const entry =
      widget.entryUrl ||
      snapshotEntry ||
      (widget.dir && widget.entryFileName
        ? `/uploads/${widget.dir}/${widget.entryFileName}`
        : "");
    return toBackendAssetUrl(entry);
  };

  const getWidgetAppIconUrl = (widget: WidgetItem) => {
    const snapshotIconUrl =
      typeof widget.configSnapshot?.appIconUrl === "string"
        ? widget.configSnapshot.appIconUrl
        : undefined;
    const appIcon =
      (widget.appIcon || widget.configSnapshot?.appIcon) as
        | WidgetItem["appIcon"]
        | undefined;
    if (appIcon?.type === "custom") return "";
    return toBackendAssetUrl(
      widget.appIconUrl ||
        snapshotIconUrl ||
        widget.iconUrl ||
        widget.icon?.url ||
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
          <Button className="w-full" onClick={() => setWidgetAppModalOpen(true)}>
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
      <WidgetAppSelectModal
        open={widgetAppModalOpen}
        onCancel={() => setWidgetAppModalOpen(false)}
        onOk={(widgets: WidgetItem[]) => {
          if (!widgets || !widgets.length) {
            setWidgetAppModalOpen(false);
            return;
          }
          const firstGroup = list.filter((item) => item.type === "page")[0];
          const items = widgets.map((widget) => {
            const appIcon =
              (widget.appIcon || widget.configSnapshot?.appIcon) as
                | WidgetItem["appIcon"]
                | undefined;
            const appIconUrl = getWidgetAppIconUrl(widget);
            return {
              id: uuidv4(),
              type: "app" as const,
              dataType: `widget-app:${widget._id}`,
              data: {
                name: widget.name,
                ...(appIconUrl ? { icon: appIconUrl } : {}),
                widgetConfig: {
                  id: widget._id || "",
                  name: widget.name,
                  entry: getWidgetEntryUrl(widget),
                  props: { title: widget.name },
                  defaultSizeId: widget.defaultSizeId,
                  supportAppMode: Boolean(
                    (widget.configSnapshot?.supportAppMode as boolean | undefined) ??
                      widget.supportAppMode,
                  ),
                  appIcon,
                  appIconUrl,
                  sourceType: widget.sourceType,
                  version:
                    (widget.configSnapshot?.version as string | undefined) ??
                    widget.version,
                  author:
                    (widget.configSnapshot?.author as string | undefined) ??
                    widget.author,
                  description: widget.description,
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
          setWidgetAppModalOpen(false);
        }}
      />
    </div>
  );
};

export default DesktopEditor;
