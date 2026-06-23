import { FC, RefObject } from "react";
import { ModalForm, ProForm, ProFormInstance, ProFormText, ProFormTextArea } from "@ant-design/pro-components";
import { Card, Empty, Image, Radio, Space } from "antd";

export interface ParseResultModalProps {
  formRef?: RefObject<ProFormInstance<any> | null>;
  open: boolean;
  initialValues?: any;
  selectedIcon: string | null;
  onSelectIcon: (value: string) => void;
  onOpenChange: (open: boolean) => void;
  onUse: () => Promise<boolean>;
}

const ParseResultModal: FC<ParseResultModalProps> = ({
  formRef,
  open,
  initialValues,
  selectedIcon,
  onSelectIcon,
  onOpenChange,
  onUse,
}) => {
  const icons: string[] = initialValues?.icons ?? [];

  return (
    <ModalForm
      formRef={formRef ?? undefined}
      title="解析成功"
      open={open}
      onOpenChange={onOpenChange}
      onFinish={onUse}
      initialValues={initialValues}
      modalProps={{
        zIndex: 1001,
        destroyOnClose: true,
        okText: "使用解析结果",
      }}
    >
      <ProFormText name="title" label="标题" readonly />
      <ProFormTextArea name="description" label="描述" readonly />
      <ProForm.Item label="图标" name="icons">
        {!icons.length ? (
          <Empty />
        ) : (
          <Radio.Group
            className="w-full"
            value={selectedIcon ?? undefined}
            onChange={(e) => onSelectIcon(e.target.value)}
          >
            <Space direction="vertical" className="w-full">
              {icons.map((item: string) => (
                <Card className="w-full" key={item}>
                  <Radio value={item}>
                    <div className="flex items-center gap-2">
                      <div className="shrink-0">
                        <Image src={item} width={48} height={48} />
                      </div>
                      <p>{item}</p>
                    </div>
                  </Radio>
                </Card>
              ))}
            </Space>
          </Radio.Group>
        )}
      </ProForm.Item>
    </ModalForm>
  );
};

export default ParseResultModal;
