import { DesktopNextBaseModal } from "zs_library";
import { Button, Form, Input } from "antd";
import type { FC } from "react";
import { css } from "@emotion/css";
import { useI18n } from "@/i18n";

export type AddWebsitePayload = {
  name: string;
  url: string;
  icon?: { url: string };
};

export interface AddWebsiteModalProps {
  open: boolean;
  onClose: () => void;
  onAdd?: (site: AddWebsitePayload) => void;
}

type AddWebsiteFormValues = {
  name: string;
  url: string;
  iconUrl?: string;
};

const AddWebsiteModal: FC<AddWebsiteModalProps> = ({
  open,
  onClose,
  onAdd,
}) => {
  const { t } = useI18n();
  const [form] = Form.useForm<AddWebsiteFormValues>();

  return (
    <DesktopNextBaseModal
      visible={open}
      onClose={onClose}
      width={560}
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
      <div className={`w-full min-h-full ${appleFormModalClassName}`}>
        <div className="mb-4 text-[21px] font-semibold tracking-tight text-[#1d1d1f]">
          {t("ui.addWebsite")}
        </div>

        <Form
          form={form}
          layout="horizontal"
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 16 }}
          onFinish={(values) => {
            const site: AddWebsitePayload = {
              name: values.name,
              url: values.url,
              icon: values.iconUrl ? { url: values.iconUrl } : undefined,
            };
            onAdd?.(site);
            onClose();
            (form as any).resetFields();
          }}
        >
          <Form.Item name="name" label={t("ui.name")} rules={[{ required: true }]}>
            <Input placeholder={t("ui.exampleMyFavoriteSite")} />
          </Form.Item>
          <Form.Item
            name="url"
            label={t("ui.uRL")}
            rules={[{ required: true, type: "url" }]}
          >
            <Input placeholder={t("ui.exampleHttpExampleCom")} />
          </Form.Item>
          <Form.Item name="iconUrl" label={t("ui.iconURL")} rules={[{ type: "url" }]}>
            <Input placeholder={t("ui.exampleHttpExampleComIconPng")} />
          </Form.Item>
          <div className="flex items-center justify-center gap-2 pt-2">
            <Button
              shape="round"
              onClick={() => {
                (form as any).resetFields();
                onClose();
              }}
            >
              {t("ui.cancel")}
            </Button>
            <Button
              shape="round"
              type="primary"
              className="apple-primary"
              onClick={() => (form as any).submit()}
            >
              {t("ui.add")}
            </Button>
          </div>
        </Form>
      </div>
    </DesktopNextBaseModal>
  );
};

export default AddWebsiteModal;

const appleFormModalClassName = css`
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.82), rgba(245, 245, 247, 0.82)),
    rgba(245, 245, 247, 0.72);
  padding: 22px;
  backdrop-filter: blur(28px) saturate(1.18);

  .ant-form-item-label > label {
    color: #1d1d1f;
    font-weight: 600;
  }

  .ant-input {
    border-color: rgba(60, 60, 67, 0.16);
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.74);
  }

  .ant-input:hover,
  .ant-input:focus {
    border-color: rgba(0, 122, 255, 0.42);
    box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.12);
  }

  .apple-primary {
    border-color: #007aff !important;
    background: #007aff !important;
    box-shadow: 0 8px 18px rgba(0, 122, 255, 0.2);
  }
`;
