import { useEffect, useMemo, useState } from "react";
import { Button, Form, Input, InputNumber, Select, Switch } from "antd";
import { RiArrowLeftSLine, RiSettings3Line } from "@remixicon/react";
import { DesktopNextBaseModal } from "zs_library";
import PureWidget, { PureWidgetConfig } from "../micro-frontend/pure-widget";
import { sharedEventBus, type WidgetMode, type WidgetSDK } from "@/sdk";
import type { WidgetConfig, WidgetSettingsField } from "@/types";
import {
  getWidgetStorageItem,
  removeWidgetStorageItem,
  setWidgetStorageItem,
} from "@/utils/widget-storage";

interface PureWidgetWindowProps {
  config: PureWidgetConfig;
  visible: boolean;
  onClose: () => void;
  title?: string;
  width?: number | string;
  height?: number | string;
  widgetConfig?: WidgetConfig;
  /** 小组件 SDK 实例 */
  sdk?: WidgetSDK;
  createSdk?: (mode: WidgetMode, sizeId: string) => WidgetSDK | undefined;
}

const loadStoredValues = (
  widgetId: string,
  schema: WidgetSettingsField[],
): Record<string, unknown> => {
  const values: Record<string, unknown> = {};
  for (const field of schema) {
    const raw = getWidgetStorageItem(widgetId, field.key);
    if (raw !== null) {
      if (field.type === "switch") {
        values[field.key] = raw === "true";
      } else if (field.type === "number") {
        const n = Number(raw);
        values[field.key] = Number.isNaN(n) ? field.default : n;
      } else {
        values[field.key] = raw;
      }
    } else if (field.default !== undefined) {
      values[field.key] = field.default;
    }
  }
  return values;
};

const saveValues = (
  widgetId: string,
  schema: WidgetSettingsField[],
  values: Record<string, unknown>,
) => {
  for (const field of schema) {
    const val = values[field.key];
    if (val !== undefined && val !== null) {
      setWidgetStorageItem(widgetId, field.key, String(val));
    } else {
      removeWidgetStorageItem(widgetId, field.key);
    }
    sharedEventBus.emit("storage:changed", {
      widgetId,
      key: field.key,
      value: val !== undefined && val !== null ? String(val) : null,
    });
  }
};

const renderSettingsField = (field: WidgetSettingsField) => {
  switch (field.type) {
    case "input":
      return <Input placeholder={field.placeholder ?? `请输入${field.label}`} />;
    case "textarea":
      return (
        <Input.TextArea
          rows={3}
          placeholder={field.placeholder ?? `请输入${field.label}`}
        />
      );
    case "number":
      return (
        <InputNumber
          className="w-full!"
          placeholder={field.placeholder ?? `请输入${field.label}`}
        />
      );
    case "select":
      return (
        <Select
          role="combobox"
          placeholder={field.placeholder ?? `请选择${field.label}`}
          options={field.options}
        />
      );
    case "switch":
      return <Switch />;
    default:
      return <Input placeholder={field.placeholder} />;
  }
};

const SchemaSettingsPage: React.FC<{
  widgetId: string;
  widgetName: string;
  settingsSchema: WidgetSettingsField[];
}> = ({ widgetId, widgetName, settingsSchema }) => {
  const [form] = Form.useForm();
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (form as any).setFieldsValue(loadStoredValues(widgetId, settingsSchema));
    setSaved(false);
  }, [form, settingsSchema, widgetId]);

  const handleSave = () => {
    (form as any).validateFields().then((values: Record<string, unknown>) => {
      saveValues(widgetId, settingsSchema, values);
      setSaved(true);
    });
  };

  return (
    <div className="flex h-full w-full flex-col overflow-y-auto overflow-x-hidden rounded-[18px] bg-[#f5f5f7] p-4 text-[#1d1d1f] [scrollbar-gutter:stable]">
      <div className="mb-4 flex-none">
        <div className="text-[24px] font-semibold tracking-[0]">
          {widgetName} 设置
        </div>
        <div className="mt-1 text-[13px] text-[#6e6e73]">
          调整后会同步到该组件的本地存储。
        </div>
      </div>
      <div className="flex-none rounded-[16px] border border-black/5 bg-white/80 px-4 pt-4">
        <Form form={form} layout="vertical">
          {settingsSchema.map((field) => (
            <Form.Item
              key={field.key}
              name={field.key}
              label={field.label}
              tooltip={field.description}
              valuePropName={field.type === "switch" ? "checked" : "value"}
              rules={field.rules}
            >
              {renderSettingsField(field)}
            </Form.Item>
          ))}
        </Form>
      </div>
      <div className="mt-4 flex items-center justify-end gap-3">
        {saved && <span className="text-[12px] text-[#34c759]">已保存</span>}
        <Button shape="round" type="primary" onClick={handleSave}>
          保存
        </Button>
      </div>
    </div>
  );
};

const PureWidgetWindow: React.FC<PureWidgetWindowProps> = ({
  config,
  visible,
  onClose,
  title,
  width = 600,
  height = 400,
  widgetConfig,
  sdk,
  createSdk,
}) => {
  const [viewMode, setViewMode] = useState<"full" | "settings">("full");

  useEffect(() => {
    if (visible) setViewMode("full");
  }, [config.entry, visible]);

  const settingsSchema = widgetConfig?.settingsSchema ?? [];
  const settingsPagePath =
    widgetConfig?.pagePaths?.settings ??
    widgetConfig?.pages?.settings ??
    widgetConfig?.settingsPagePath ??
    widgetConfig?.settingsPath ??
    widgetConfig?.settingsPage;
  const hasCustomSettings = Boolean(settingsPagePath || widgetConfig?.customSettings);
  const hasSchemaSettings = settingsSchema.length > 0;
  const hasSettings = Boolean(widgetConfig?.id && (hasCustomSettings || hasSchemaSettings));
  const widgetTitle = title || widgetConfig?.name || "小组件";
  const contentHeight = typeof height === "number" ? height : undefined;
  const windowHeight = typeof height === "number" ? height + 46 : height;
  const currentSdk = useMemo(() => {
    if (!createSdk) return viewMode === "full" ? sdk : undefined;
    return createSdk(viewMode, viewMode === "settings" ? "settings" : "full");
  }, [createSdk, sdk, viewMode]);

  const fullConfig = useMemo(
    () => ({
      ...config,
      props: {
        ...(config.props ?? {}),
        title: widgetTitle,
      },
      mode: "full" as WidgetMode,
      ...(currentSdk ? { sdk: currentSdk } : {}),
    }),
    [config, currentSdk, widgetTitle],
  );

  const settingsConfig = useMemo(
    () => ({
      ...config,
      props: {
        ...(config.props ?? {}),
        title: widgetTitle,
        pagePath: settingsPagePath,
      },
      mode: "settings" as WidgetMode,
      ...(currentSdk ? { sdk: currentSdk } : {}),
    }),
    [config, currentSdk, settingsPagePath, widgetTitle],
  );

  return (
    <DesktopNextBaseModal
      visible={visible}
      onClose={onClose}
      width={typeof width === "number" ? width : undefined}
      destroyOnClose
    >
      <div
        className="flex w-full flex-col overflow-hidden rounded-[18px] bg-white/95 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.72)] backdrop-blur-xl"
        style={{ height: windowHeight }}
      >
        <div className="grid h-[46px] flex-none grid-cols-[92px_1fr_92px] items-center border-b border-black/5 bg-white/90 px-3">
          <div className="flex items-center justify-start">
            {viewMode === "settings" && (
              <button
                type="button"
                onClick={() => setViewMode("full")}
                className="inline-flex h-8 cursor-pointer items-center gap-0.5 rounded-full border-0 bg-transparent px-2 text-[13px] font-medium text-[#007aff] hover:bg-[#f2f2f7]"
              >
                <RiArrowLeftSLine size={18} />
                返回
              </button>
            )}
          </div>
          <div className="min-w-0 truncate text-center text-[13px] font-semibold text-[#424245]">
            {viewMode === "settings" ? `${widgetTitle} 设置` : widgetTitle}
          </div>
          <div className="flex items-center justify-end">
            {viewMode === "full" && hasSettings && (
              <button
                type="button"
                aria-label="打开设置"
                title="设置"
                onClick={() => setViewMode("settings")}
                className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-black/5 bg-[#f5f5f7] text-[#1d1d1f] shadow-[0_4px_12px_rgba(0,0,0,0.10)] transition hover:bg-white"
              >
                <RiSettings3Line size={17} />
              </button>
            )}
          </div>
        </div>
        <div
          className="min-h-0 flex-1 overflow-hidden"
          style={contentHeight ? { height: contentHeight } : undefined}
        >
          {viewMode === "full" ? (
            <PureWidget config={fullConfig} className="h-full w-full" />
          ) : hasCustomSettings ? (
            <PureWidget config={settingsConfig} className="h-full w-full" />
          ) : widgetConfig?.id ? (
            <SchemaSettingsPage
              widgetId={widgetConfig.id}
              widgetName={widgetTitle}
              settingsSchema={settingsSchema}
            />
          ) : null}
        </div>
      </div>
    </DesktopNextBaseModal>
  );
};

export default PureWidgetWindow;
