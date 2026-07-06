import { DesktopNextBaseModal } from "zs_library";
import { Button, Form, Input, InputNumber } from "antd";
import { RiAddLine, RiCloseLine } from "@remixicon/react";
import type { FC } from "react";
import type { DevApp } from "@/contexts/AppContext";
import type { AppSizeConfig } from "@/types";
import { css } from "@emotion/css";
import { useI18n } from "@/i18n";

// ====== 表单数据类型 ======

interface SizeFormItem {
  col: number;
  row: number;
  name: string;
}

export interface DevAppFormValues {
  name: string;
  entry: string;
  sizes: SizeFormItem[];
}

// ====== 尺寸配置列表组件 ======

const defaultSize: SizeFormItem = { col: 2, row: 2, name: "2x2" };

const SizeConfigList: FC<{
  value?: SizeFormItem[];
  onChange?: (v: SizeFormItem[]) => void;
}> = ({ value = [], onChange }) => {
  const { t } = useI18n();
  const update = (index: number, field: keyof SizeFormItem, val: any) => {
    const next = [...value];
    next[index] = { ...next[index], [field]: val };
    // 当列数或行数变化时，自动生成名称（如 "2x2"）
    if (field === "col" || field === "row") {
      const c = field === "col" ? val : next[index].col;
      const r = field === "row" ? val : next[index].row;
      if (!next[index].name || /^\d+x\d+$/.test(next[index].name)) {
        next[index].name = `${c}x${r}`;
      }
    }
    onChange?.(next);
  };

  const add = () => onChange?.([...value, { ...defaultSize }]);

  const remove = (index: number) => {
    const next = value.filter((_, i) => i !== index);
    onChange?.(next);
  };

  return (
    <div className="flex flex-col gap-2">
      {value.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <InputNumber
            min={1}
            max={8}
            value={item.col}
            onChange={(v) => update(index, "col", v ?? 1)}
            className="w-18!"
            placeholder={t("ui.columns")}
          />
          <InputNumber
            min={1}
            max={8}
            value={item.row}
            onChange={(v) => update(index, "row", v ?? 1)}
            className="w-18!"
            placeholder={t("ui.rows")}
          />
          <Input
            value={item.name}
            onChange={(e) => update(index, "name", e.target.value)}
            className="w-20! shrink-0"
            placeholder={t("ui.name")}
          />
          {value.length > 1 && (
            <Button
              type="text"
              danger
              icon={<RiCloseLine size={16} />}
              onClick={() => remove(index)}
            />
          )}
        </div>
      ))}
      <Button
        type="dashed"
        icon={<RiAddLine size={16} />}
        onClick={add}
        className="w-full"
      >
        {t("ui.addSize")}
      </Button>
    </div>
  );
};

// ====== 尺寸配置转换工具 ======

/** 表单数据 → AppSizeConfig */
export const toSizeConfigs = (sizes: SizeFormItem[]): AppSizeConfig[] =>
  sizes.map((s) => ({
    col: s.col,
    row: s.row,
    name: s.name || `${s.col}x${s.row}`,
    id: `${s.col}x${s.row}`,
  }));

/** AppSizeConfig → 表单数据 */
export const fromSizeConfigs = (configs: AppSizeConfig[]): SizeFormItem[] =>
  configs.map((c) => ({ col: c.col, row: c.row, name: c.name || `${c.col}x${c.row}` }));

// ====== 弹窗组件 ======

export interface DevAppModalProps {
  /** 弹窗是否可见 */
  open: boolean;
  /** 关闭弹窗回调 */
  onClose: () => void;
  /** 正在编辑的应用（null 表示新增模式） */
  editingApp: DevApp | null;
  /** 提交回调，返回表单值和转换后的尺寸配置 */
  onSubmit: (values: DevAppFormValues, sizeConfigs: AppSizeConfig[]) => void;
}

const DevAppModal: FC<DevAppModalProps> = ({
  open,
  onClose,
  editingApp,
  onSubmit,
}) => {
  const { t } = useI18n();
  const [form] = Form.useForm<DevAppFormValues>();

  /** 弹窗打开时，若为编辑模式则回填表单 */
  const handleAfterOpen = () => {
    if (editingApp) {
      (form as any).setFieldsValue({
        name: editingApp.name,
        entry: editingApp.entry,
        sizes: fromSizeConfigs(editingApp.sizeConfigs),
      });
    } else {
      (form as any).resetFields();
      (form as any).setFieldsValue({ sizes: [{ ...defaultSize }] });
    }
  };

  /** 关闭时重置表单 */
  const handleClose = () => {
    (form as any).resetFields();
    onClose();
  };

  return (
    <DesktopNextBaseModal
      visible={open}
      onClose={handleClose}
      width={520}
      destroyOnClose
      styles={{
        body: { padding: 0 },
        inner: {
          width: "100%",
          maxHeight: "calc(100dvh - 64px)",
          overflowY: "auto",
          overscrollBehavior: "contain",
        },
      }}
    >
      <div
        className={`w-full min-h-full ${appleDevAppModalClassName}`}
        // 弹窗渲染完成后回填表单
        ref={(el) => {
          if (el && open) handleAfterOpen();
        }}
      >
        <div className="mb-4 text-[21px] font-semibold tracking-tight text-[#1d1d1f]">
          {editingApp ? t("ui.editApp") : t("ui.addApp")}
        </div>

        <Form
          form={form}
          layout="vertical"
          initialValues={{ sizes: [{ ...defaultSize }] }}
          onFinish={(values) => {
            const sizeConfigs = toSizeConfigs(values.sizes);
            onSubmit(values, sizeConfigs);
            handleClose();
          }}
        >
          <Form.Item
            name="name"
            label={t("ui.name")}
            rules={[{ required: true, message: t("ui.enterAAppName") }]}
          >
            <Input placeholder={t("ui.exampleMyClock")} />
          </Form.Item>

          <Form.Item
            name="entry"
            label={t("ui.eSMEntryURL")}
            rules={[
              { required: true, message: t("ui.enterAnEntryURL") },
              { type: "url", message: t("ui.enterAValidURL") },
            ]}
          >
            <Input placeholder="http://localhost:5173/src/index.tsx" />
          </Form.Item>

          <Form.Item
            name="sizes"
            label={t("ui.sizeConfig")}
            rules={[
              {
                validator: (_, val) =>
                  val?.length > 0
                    ? Promise.resolve()
                    : Promise.reject(t("ui.atLeastOneSizeConfigIsRequired")),
              },
            ]}
          >
            <SizeConfigList />
          </Form.Item>

          <div className="flex items-center justify-center gap-2 pt-2">
            <Button shape="round" onClick={handleClose}>
              {t("ui.cancel")}
            </Button>
            <Button
              shape="round"
              type="primary"
              className="apple-primary"
              onClick={() => (form as any).submit()}
            >
              {editingApp ? t("ui.save") : t("ui.addToDesktop")}
            </Button>
          </div>
        </Form>
      </div>
    </DesktopNextBaseModal>
  );
};

export default DevAppModal;

const appleDevAppModalClassName = css`
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.82), rgba(245, 245, 247, 0.82)),
    rgba(245, 245, 247, 0.72);
  padding: 22px;
  backdrop-filter: blur(28px) saturate(1.18);

  .ant-form-item-label > label {
    color: #1d1d1f;
    font-weight: 600;
  }

  .ant-input,
  .ant-input-number,
  .ant-input-number-input {
    border-radius: 10px;
  }

  .ant-input,
  .ant-input-number {
    border-color: rgba(60, 60, 67, 0.16);
    background: rgba(255, 255, 255, 0.74);
  }

  .ant-input:hover,
  .ant-input:focus,
  .ant-input-number:hover,
  .ant-input-number-focused {
    border-color: rgba(0, 122, 255, 0.42);
    box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.12);
  }

  .ant-btn-dashed {
    border-color: rgba(0, 122, 255, 0.24);
    background: rgba(0, 122, 255, 0.06);
    color: #007aff;
  }

  .apple-primary {
    border-color: #007aff !important;
    background: #007aff !important;
    box-shadow: 0 8px 18px rgba(0, 122, 255, 0.2);
  }
`;
