import { addPreset, updatePreset, getPresetDetail, AddPresetData } from "@/services/ai/preset";
import { baseFormItemLayout } from "@/utils/utils";
import {
  ModalForm,
  ProFormInstance,
  ProFormText,
  ProFormTextArea,
  ProFormDigit,
  ProFormSwitch,
  ProFormSelect,
  ProFormDependency,
} from "@ant-design/pro-components";
import { RiAddLine } from "@remixicon/react";
import { useRequest } from "ahooks";
import { Button, message } from "antd";
import { useState, useEffect, useRef } from "react";

interface PresetHandleProps {
  open: boolean;
  editId?: string;
  onClose: () => void;
  onFinished: () => void;
}

const PresetHandle = ({ open, editId, onClose, onFinished }: PresetHandleProps) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const ref = useRef<ProFormInstance<AddPresetData>>(null);

  const { data, run } = useRequest(getPresetDetail, {
    manual: true,
  });

  useEffect(() => {
    if (editId) {
      run(editId);
    }
  }, [editId]);

  useEffect(() => {
    if (data) {
      ref.current?.setFieldsValue({
        ...data,
      } as any);
    }
  }, [data]);

  return (
    <>
      <Button type="primary" icon={<RiAddLine size={16} />} onClick={() => setModalOpen(true)}>
        新增预设
      </Button>
      <ModalForm<AddPresetData>
        title={editId ? "编辑预设" : "新增预设"}
        {...baseFormItemLayout}
        open={open || modalOpen}
        formRef={ref}
        onOpenChange={(visible) => {
          if (!visible) {
            setModalOpen(false);
            onClose();
            ref.current?.resetFields();
          }
        }}
        onFinish={async (values) => {
          const advancedValues = ref.current?.getFieldsValue(true);
          const subValues = {
            ...values,
            maxContext: values.maxContext ?? advancedValues.maxContext ?? null,
            maxTokens: values.maxTokens ?? advancedValues.maxTokens ?? null,
            temperature: values.temperature ?? advancedValues.temperature ?? null,
          };
          try {
            await (editId ? updatePreset(editId, subValues) : addPreset(subValues));
            messageApi.success(editId ? "修改成功" : "新增成功");
            onFinished();
            ref.current?.resetFields();
            setModalOpen(false);
            return true;
          } catch (error) {
            return false;
          }
        }}
        modalProps={{
          destroyOnClose: true,
        }}
      >
        <ProFormText
          name="name"
          label="预设名称"
          placeholder="请输入预设名称"
          rules={[
            {
              required: true,
              message: "请输入预设名称",
            },
          ]}
        />
        <ProFormTextArea
          name="description"
          label="描述"
          placeholder="请输入预设描述"
          rules={[
            {
              required: true,
              message: "请输入预设描述",
            },
          ]}
        />
        <ProFormTextArea
          name="systemPrompt"
          label="系统提示词"
          placeholder="请输入系统提示词"
          rules={[
            {
              required: true,
              message: "请输入系统提示词",
            },
          ]}
        />
        <ProFormTextArea name="userPrompt" label="用户提示词模板" placeholder="请输入用户提示词模板（可选）" />
        <ProFormSelect
          name="tags"
          label="标签"
          mode="tags"
          placeholder="请输入标签，按回车添加"
          fieldProps={{
            tokenSeparators: [",", " "],
          }}
        />
        <ProFormSwitch name="stream" label="是否流式输出" initialValue={true} />
        <ProFormSwitch name="enabled" label="是否启用" initialValue={true} />
        <ProFormSwitch name="showAdvanced" label="高级设置" initialValue={false} />
        <ProFormDependency name={["showAdvanced"]}>
          {({ showAdvanced }) => {
            if (!showAdvanced) return null;
            return (
              <>
                <ProFormDigit
                  name="temperature"
                  label="模型温度"
                  placeholder="请输入模型温度"
                  min={0}
                  max={2}
                  initialValue={0.7}
                  fieldProps={{
                    step: 0.1,
                    precision: 1,
                  }}
                />
                <ProFormDigit
                  name="maxTokens"
                  label="最大token数"
                  placeholder="请输入最大token数"
                  min={1}
                  initialValue={2048}
                />
                <ProFormDigit
                  name="maxContext"
                  label="最大上下文长度"
                  placeholder="请输入最大上下文长度"
                  min={1}
                  initialValue={4096}
                />
              </>
            );
          }}
        </ProFormDependency>
      </ModalForm>
      {contextHolder}
    </>
  );
};

export default PresetHandle;
