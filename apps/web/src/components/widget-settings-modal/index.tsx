import { DesktopNextBaseModal } from "zs_library";
import { Form, Input, InputNumber, Select, Switch, Button } from "antd";
import { useEffect, useMemo, type FC } from "react";
import type { WidgetSettingsField } from "@/types";
import { sharedEventBus } from "@/sdk";
import PureWidget from "@/components/micro-frontend/pure-widget";
import type { PureWidgetConfig } from "@/components/micro-frontend/pure-widget";
import { css } from "@emotion/css";

interface WidgetSettingsModalProps {
  visible: boolean;
  onClose: () => void;
  widgetId: string;
  widgetName?: string;
  settingsSchema: WidgetSettingsField[];
  settingsPagePath?: string;
  customConfig?: PureWidgetConfig;
}

/** 从 localStorage 读取小组件的已保存设置值 */
const loadStoredValues = (
  widgetId: string,
  schema: WidgetSettingsField[],
): Record<string, any> => {
  const values: Record<string, any> = {};
  for (const field of schema) {
    const raw = localStorage.getItem(`widget:${widgetId}:${field.key}`);
    if (raw !== null) {
      if (field.type === "switch") {
        values[field.key] = raw === "true";
      } else if (field.type === "number") {
        const n = Number(raw);
        values[field.key] = isNaN(n) ? field.default : n;
      } else {
        values[field.key] = raw;
      }
    } else if (field.default !== undefined) {
      values[field.key] = field.default;
    }
  }
  return values;
};

/** 将设置值写入 localStorage 并通过 sharedEventBus 逐个广播 storage:changed 事件 */
const saveValues = (
  widgetId: string,
  schema: WidgetSettingsField[],
  values: Record<string, any>,
) => {
  for (const field of schema) {
    const val = values[field.key];
    if (val !== undefined && val !== null) {
      localStorage.setItem(`widget:${widgetId}:${field.key}`, String(val));
    } else {
      localStorage.removeItem(`widget:${widgetId}:${field.key}`);
    }
    sharedEventBus.emit("storage:changed", {
      widgetId,
      key: field.key,
      value: val !== undefined && val !== null ? String(val) : null,
    });
  }
};

/** 根据 schema 字段类型渲染对应的 antd 表单控件 */
const renderField = (field: WidgetSettingsField) => {
  switch (field.type) {
    case "input":
      return (
        <Input placeholder={field.placeholder ?? `请输入${field.label}`} />
      );
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

const WidgetSettingsModal: FC<WidgetSettingsModalProps> = ({
  visible,
  onClose,
  widgetId,
  widgetName,
  settingsSchema,
  settingsPagePath,
  customConfig,
}) => {
  const [form] = Form.useForm();

  const initialValues = useMemo(
    () => loadStoredValues(widgetId, settingsSchema),
    [widgetId, settingsSchema],
  );

  useEffect(() => {
    if (visible) {
      (form as any).setFieldsValue(loadStoredValues(widgetId, settingsSchema));
    }
  }, [visible, widgetId, settingsSchema, form]);

  const handleSave = () => {
    (form as any).validateFields().then((values: Record<string, unknown>) => {
      saveValues(widgetId, settingsSchema, values);
      onClose();
    });
  };

  const customSettingsConfig = settingsPagePath ? customConfig : undefined;

  if (customSettingsConfig) {
    return (
      <DesktopNextBaseModal
        visible={visible}
        onClose={onClose}
        width={560}
        destroyOnClose
      >
        <div className={`w-full h-full overflow-hidden ${appleWidgetSettingsModalClassName}`}>
          <div
            className="relative w-full overflow-hidden rounded-[18px] border border-white/80 bg-white/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]"
            style={{ height: 520 }}
          >
            <PureWidget
              config={customSettingsConfig}
              className="w-full h-full"
            />
          </div>
        </div>
      </DesktopNextBaseModal>
    );
  }

  return (
    <DesktopNextBaseModal
      visible={visible}
      onClose={onClose}
      width={480}
      destroyOnClose
    >
      <div className={`w-full h-full overflow-hidden ${appleWidgetSettingsModalClassName}`}>
        <div className="mb-4 text-[21px] font-semibold tracking-tight text-[#1d1d1f]">
          {widgetName ? `${widgetName} - 设置` : "小组件设置"}
        </div>

        <Form form={form} layout="vertical" initialValues={initialValues}>
          {settingsSchema.map((field) => (
            <Form.Item
              key={field.key}
              name={field.key}
              label={field.label}
              tooltip={field.description}
              valuePropName={field.type === "switch" ? "checked" : "value"}
              rules={field.rules}
            >
              {renderField(field)}
            </Form.Item>
          ))}
        </Form>

        <div className="flex items-center justify-center gap-2 pt-2">
          <Button shape="round" onClick={onClose}>
            取消
          </Button>
          <Button
            shape="round"
            type="primary"
            className="apple-primary"
            onClick={handleSave}
          >
            保存
          </Button>
        </div>
      </div>
    </DesktopNextBaseModal>
  );
};

export default WidgetSettingsModal;

const appleWidgetSettingsModalClassName = css`
  border: 1px solid rgba(255, 255, 255, 0.72);
  border-radius: 18px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.82), rgba(245, 245, 247, 0.82)),
    rgba(245, 245, 247, 0.72);
  padding: 22px;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.88),
    0 24px 70px rgba(0, 0, 0, 0.18);
  backdrop-filter: blur(28px) saturate(1.18);

  .ant-form-item-label > label {
    color: #1d1d1f;
    font-weight: 600;
  }

  .ant-input,
  .ant-input-number,
  .ant-select-selector {
    border-color: rgba(60, 60, 67, 0.16) !important;
    border-radius: 10px !important;
    background: rgba(255, 255, 255, 0.74) !important;
  }

  .ant-input:hover,
  .ant-input:focus,
  .ant-input-number:hover,
  .ant-input-number-focused,
  .ant-select-focused .ant-select-selector {
    border-color: rgba(0, 122, 255, 0.42) !important;
    box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.12) !important;
  }

  .apple-primary {
    border-color: #007aff !important;
    background: #007aff !important;
    box-shadow: 0 8px 18px rgba(0, 122, 255, 0.2);
  }
`;
