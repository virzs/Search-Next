import { Form, Input, Modal } from "antd";
import { useEffect } from "react";
import IconSelecter from "../../../../components/icon/selecter";
import { DesktopSortItem } from "zs_library";

interface DesktopItemData {
  name: string;
  icon?: string | { iconName: string; iconType: string };
}

interface HandleRootGroupModalProps {
  open: boolean;
  onCancel: () => void;
  onOk: (values: { name: string; icon: string }) => void;
  editItem?: DesktopSortItem<DesktopItemData>;
  title?: string;
}

const HandleRootGroupModal: React.FC<HandleRootGroupModalProps> = ({
  open,
  onCancel,
  onOk,
  editItem,
  title = "新建分类",
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open && editItem) {
      form.setFieldsValue({
        name: editItem.data?.name,
        icon: editItem.data?.icon,
      });
    } else if (open) {
      form.resetFields();
    }
  }, [open, editItem, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onOk(values);
    } catch (error) {
      console.error("Validate Failed:", error);
    }
  };

  return (
    <Modal
      destroyOnClose
      title={editItem ? "编辑分类" : title}
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="name"
          rules={[
            {
              required: true,
              message: "请输入分类名称",
            },
          ]}
        >
          <Input placeholder="分类名称" />
        </Form.Item>
        <Form.Item
          name="icon"
          rules={[
            {
              required: true,
              message: "请选择图标",
            },
          ]}
        >
          <IconSelecter />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default HandleRootGroupModal;
