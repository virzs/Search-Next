import React, { useRef, useEffect, useState } from "react";
import { Button } from "antd";
import { ProForm, ProFormSelect, ProFormTextArea, ProFormDigit, ProFormInstance } from "@ant-design/pro-components";
import { getModelOptions } from "@/services/ai/models";
import { getPresetOpts, getPresetDetail } from "@/services/ai/preset";
import { useRequest } from "ahooks";

interface PlaygroundFormProps {
  value?: any;
  onChange?: (values: any) => void;
}

const PlaygroundForm: React.FC<PlaygroundFormProps> = ({ value, onChange }) => {
  const formRef = useRef<ProFormInstance>(null);
  const { data: models = [] } = useRequest(getModelOptions);
  const { data: presets = [] } = useRequest(getPresetOpts);

  // 当外部value变化时，更新表单值
  useEffect(() => {
    if (value && formRef.current) {
      formRef.current.setFieldsValue(value);
    }
  }, [value]);

  // 当模型加载完成且没有选中模型时，自动选择第一个
  useEffect(() => {
    if (models.length > 0 && !value?.model && formRef.current) {
      const firstModel = models[0];
      const initialValues = {
        model: firstModel.publicName || firstModel.name,
      };
      formRef.current.setFieldsValue(initialValues);
      onChange?.(initialValues);
    }
  }, [models, value?.model, onChange]);

  // 处理表单值变化
  const handleValuesChange = (_: any, allValues: any) => {
    onChange?.(allValues);
  };

  // 处理重置
  const handleReset = () => {
    const initialValues = {
      model: undefined,
      presetId: undefined,
      prompt: "",
      systemPrompt: "",
      temperature: 0.7,
      maxTokens: 2000,
      maxContext: 4000,
      stream: true,
    };
    formRef.current?.setFieldsValue(initialValues);
    onChange?.(initialValues);
  };

  // 获取预设详情的请求
  const { run: fetchPresetDetail } = useRequest(getPresetDetail, {
    manual: true,
    onSuccess: (preset) => {
      if (preset) {
        const presetValues = {
          systemPrompt: preset.systemPrompt,
          temperature: preset.temperature,
          maxTokens: preset.maxTokens,
          maxContext: preset.maxContext,
          stream: preset.stream,
        };
        formRef.current?.setFieldsValue(presetValues);
        const currentValues = formRef.current?.getFieldsValue();
        onChange?.({ ...currentValues, ...presetValues, presetId: preset._id });
      }
    },
    onError: (error) => {
      console.error("获取预设详情失败:", error);
    },
  });

  // 处理预设变化
  const handlePresetChange = (presetId: string) => {
    fetchPresetDetail(presetId);
  };

  return (
    <ProForm
      formRef={formRef}
      initialValues={{
        model: undefined,
        presetId: undefined,
        prompt: "",
        systemPrompt: "",
        temperature: 0.7,
        maxTokens: 2000,
        maxContext: 4000,
        stream: true,
        usePreset: false,
      }}
      onValuesChange={handleValuesChange}
      submitter={{
        render: () => [
          <Button key="reset" onClick={handleReset}>
            重置
          </Button>,
        ],
      }}
    >
      <ProFormSelect
        label="模型"
        name="model"
        placeholder="选择模型"
        rules={[{ required: true, message: "请选择模型" }]}
        showSearch
        fieldProps={{
          filterOption: (input: string, option: any) => option?.label?.toLowerCase().includes(input.toLowerCase()),
        }}
        options={models.map((model: any) => ({
          label: model.displayName || model.publicName || model.name,
          value: model.publicName || model.name,
        }))}
      />
      <ProFormSelect
        name="presetId"
        label="选择预设"
        placeholder="选择预设模板"
        allowClear
        showSearch
        fieldProps={{
          onChange: handlePresetChange,
          filterOption: (input: string, option: any) => option?.label?.toLowerCase().includes(input.toLowerCase()),
        }}
        options={presets.map((preset) => ({
          value: preset._id,
          label: preset.name,
          title: preset.description,
        }))}
      />
      <ProFormTextArea
        name="systemPrompt"
        label="系统提示词"
        placeholder="设置AI的角色和行为规则"
        fieldProps={{
          rows: 3,
          showCount: true,
          maxLength: 1000,
        }}
      />
      <ProFormDigit
        name="temperature"
        label="模型温度"
        tooltip="控制输出的随机性，0-2之间，值越高越随机"
        fieldProps={{
          min: 0,
          max: 2,
          step: 0.1,
          precision: 1,
        }}
      />
      <ProFormDigit
        name="maxTokens"
        label="最大Token数"
        tooltip="限制生成内容的最大长度"
        fieldProps={{
          min: 1,
          max: 8000,
          step: 100,
        }}
      />
      <ProFormDigit
        name="maxContext"
        label="最大上下文"
        tooltip="对话历史的最大Token数"
        fieldProps={{
          min: 1000,
          max: 32000,
          step: 1000,
        }}
      />
      <ProFormTextArea
        label="提示词"
        name="prompt"
        placeholder="输入你的提示词..."
        fieldProps={{
          rows: 8,
          showCount: true,
          maxLength: 2000,
        }}
      />
    </ProForm>
  );
};

export default PlaygroundForm;
