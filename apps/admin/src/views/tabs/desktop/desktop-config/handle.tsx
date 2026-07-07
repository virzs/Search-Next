import { baseFormItemLayout } from "@/utils/utils";
import {
  ProForm,
  ProFormText,
  ProFormTextArea,
} from "@ant-design/pro-components";
import DesktopEditor, {
  DesktopEditorToolbar,
  type DesktopThemeType,
} from "./components/desktop-editor";
import FullPageContainer from "@/components/containter/full";
import { App, Button, Steps } from "antd";
import { RiSaveLine } from "@remixicon/react";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useNavigate, useParams } from "react-router";
import { useRequest } from "ahooks";
import {
  detailDesktopAdminConfig,
  postDesktopAdminConfig,
  putDesktopAdminConfig,
} from "@/services/tabs/desktop/desktop-config";
import type { DesktopThemeConfig } from "@/services/tabs/desktop/theme-config";

const { useForm } = ProForm;

const DesktopHandle = () => {
  const navigate = useNavigate();

  const [form] = useForm();
  const { validateFields, getFieldsValue } = form;

  const { id } = useParams();
  const { message } = App.useApp();

  const [activeStep, setActiveStep] = useState<number>(0);
  const [selectedDesktopTheme, setSelectedDesktopTheme] =
    useState<DesktopThemeConfig | null>(null);
  const [selectedDesktopThemeType, setSelectedDesktopThemeType] =
    useState<DesktopThemeType>("lightConfig");

  const { loading: getLoading, run: getRun } = useRequest(
    detailDesktopAdminConfig,
    {
      manual: true,
      onSuccess: (data) => {
        form.setFieldsValue(data);
      },
    },
  );

  const { loading: postLoading, run: postRun } = useRequest(
    postDesktopAdminConfig,
    {
      manual: true,
      onSuccess: () => {
        message.success("保存成功");
        navigate(-1);
      },
    },
  );

  const { loading: putLoading, run: putRun } = useRequest(
    putDesktopAdminConfig,
    {
      manual: true,
      onSuccess: () => {
        message.success("保存成功");
        navigate(-1);
      },
    },
  );

  const handleSubmit = () => {
    const values = getFieldsValue(true);
    console.log("🚀 ~ handleSubmit ~ values:", values);
    if (id) {
      putRun(id, values);
    } else {
      postRun(values);
    }
  };

  useEffect(() => {
    if (id) {
      getRun(id);
    }
  }, [id]);

  return (
    <FullPageContainer
      backButtonProps={{ confirm: true }}
      title={
        activeStep === 0 ? (
          <Steps
            size="small"
            current={activeStep}
            items={[{ title: "基本信息" }, { title: "桌面配置" }]}
          />
        ) : null
      }
      cardProps={{
        className:
          activeStep === 1
            ? "[&>.ant-pro-card-body]:!overflow-hidden [&>.ant-pro-card-body]:!p-0"
            : undefined,
        extra: (
          <div className="flex flex-nowrap items-center gap-2">
            {activeStep === 1 ? (
              <DesktopEditorToolbar
                theme={selectedDesktopTheme}
                themeType={selectedDesktopThemeType}
                onThemeChange={setSelectedDesktopTheme}
                onThemeTypeChange={setSelectedDesktopThemeType}
              />
            ) : null}
            <Button.Group>
              <Button
                disabled={activeStep === 0}
                onClick={() => setActiveStep((s) => Math.max(0, s - 1))}
              >
                上一步
              </Button>
              <Button
                type="primary"
                disabled={activeStep === 1}
                onClick={() => {
                  validateFields().then(() => {
                    setActiveStep((s) => Math.min(1, s + 1));
                  });
                }}
              >
                下一步
              </Button>
            </Button.Group>
            <Button
              type="primary"
              icon={<RiSaveLine size={16} />}
              onClick={handleSubmit}
              loading={postLoading || putLoading}
            >
              保存
            </Button>
          </div>
        ),
      }}
      loading={getLoading}
    >
      <ProForm
        rootClassName="h-full"
        {...baseFormItemLayout}
        form={form}
        submitter={false}
        layout="horizontal"
      >
        <AnimatePresence mode="popLayout">
          {activeStep === 0 && (
            <motion.div
              className="flex items-center justify-center h-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="max-w-3xl w-full pb-[16%]">
                <ProFormText
                  name="name"
                  label="名称"
                  placeholder="请输入名称"
                  rules={[{ required: true, message: "请输入名称" }]}
                />
                <ProFormTextArea
                  name="description"
                  label="描述"
                  placeholder="请输入描述"
                />
              </div>
            </motion.div>
          )}
          {activeStep === 1 && (
            <motion.div
              className="h-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ProForm.Item name="config" noStyle>
                <DesktopEditor
                  theme={selectedDesktopTheme}
                  themeType={selectedDesktopThemeType}
                />
              </ProForm.Item>
            </motion.div>
          )}
        </AnimatePresence>
      </ProForm>
    </FullPageContainer>
  );
};

export default DesktopHandle;
