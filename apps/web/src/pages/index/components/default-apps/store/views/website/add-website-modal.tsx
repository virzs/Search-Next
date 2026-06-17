import { DesktopNextBaseModal } from "zs_library";
import { Button, Form, Input } from "antd";
import type { FC } from "react";

export type AddWebsitePayload = {
  name: string;
  url: string;
  icon?: { url: string };
};

export interface AddWebsiteModalProps {
  open: boolean;
  onClose: () => void;
  onAddWebsite?: (site: AddWebsitePayload) => void;
}

type AddWebsiteFormValues = {
  name: string;
  url: string;
  iconUrl?: string;
};

const AddWebsiteModal: FC<AddWebsiteModalProps> = ({
  open,
  onClose,
  onAddWebsite,
}) => {
  const [form] = Form.useForm<AddWebsiteFormValues>();

  return (
    <DesktopNextBaseModal visible={open} onClose={onClose} width={560}>
      <div className="w-full h-full overflow-hidden">
        <div className="text-lg font-semibold tracking-tight pb-4">
          新增网站
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
            onAddWebsite?.(site);
            onClose();
            form.resetFields();
          }}
        >
          <Form.Item name="name" label="名称" rules={[{ required: true }]}>
            <Input placeholder="例如：我的常用站点" />
          </Form.Item>
          <Form.Item
            name="url"
            label="网址"
            rules={[{ required: true, type: "url" }]}
          >
            <Input placeholder="例如：https://example.com" />
          </Form.Item>
          <Form.Item name="iconUrl" label="图标URL" rules={[{ type: "url" }]}>
            <Input placeholder="例如：https://example.com/icon.png" />
          </Form.Item>
          <div className="flex items-center justify-center gap-2 pt-2">
            <Button
              shape="round"
              onClick={() => {
                form.resetFields();
                onClose();
              }}
            >
              取消
            </Button>
            <Button shape="round" type="primary" onClick={() => form.submit()}>
              添加
            </Button>
          </div>
        </Form>
      </div>
    </DesktopNextBaseModal>
  );
};

export default AddWebsiteModal;
