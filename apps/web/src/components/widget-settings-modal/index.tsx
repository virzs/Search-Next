import { DesktopBaseModal } from "zs_library";
import { Form, Input, InputNumber, Select, Switch, Button } from "antd";
import { useEffect, useMemo, type FC } from "react";
import type { WidgetSettingsField } from "@/types";
import { sharedEventBus } from "@/sdk";

interface WidgetSettingsModalProps {
  visible: boolean;
  onClose: () => void;
  widgetId: string;
  widgetName?: string;
  settingsSchema: WidgetSettingsField[];
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

const WidgetSettingsModal: FC<WidgetSettingsModalProps> = ({
  visible,
  onClose,
  widgetId,
  widgetName,
  settingsSchema,
}) => {
  const [form] = Form.useForm();

  const initialValues = useMemo(
    () => loadStoredValues(widgetId, settingsSchema),
    [widgetId, settingsSchema],
  );

  useEffect(() => {
    if (visible) {
      form.setFieldsValue(loadStoredValues(widgetId, settingsSchema));
    }
  }, [visible, widgetId, settingsSchema, form]);

  const handleSave = () => {
    form.validateFields().then((values) => {
      saveValues(widgetId, settingsSchema, values);
      onClose();
    });
  };

  return (
    <DesktopBaseModal
      visible={visible}
      onClose={onClose}
      width={480}
      destroyOnClose
    >
      <div className="w-full h-full overflow-hidden">
        <div className="text-lg font-semibold tracking-tight pb-4">
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
          <Button shape="round" type="primary" onClick={handleSave}>
            保存
          </Button>
        </div>
      </div>
    </DesktopBaseModal>
  );
};

export default WidgetSettingsModal;
