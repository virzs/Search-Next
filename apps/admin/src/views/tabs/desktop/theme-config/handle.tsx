import FullPageContainer from "@/components/containter/full";
import { ProForm, ProFormSelect, ProFormText, ProFormTextArea } from "@ant-design/pro-components";
import { Desktop, DesktopListItem, desktopThemeDark, desktopThemeLight } from "zs_library";
import defaultList from "./default-list.json";
import { useEffect, useMemo, useState } from "react";
import { App, Card, Row, Col, Button, Steps, Radio } from "antd";
import { RiSaveLine } from "@remixicon/react";
import { css, cx } from "@emotion/css";
import { useRequest } from "ahooks";
import {
  createDesktopThemeConfig,
  getDesktopThemeCategory,
  getDesktopThemeConfigDetail,
  updateDesktopThemeConfig,
} from "@/services/tabs/desktop/theme-config";
import { useNavigate, useParams } from "react-router";
import ColorConfigFields from "./components/color-config-fields";
import { AnimatePresence, motion } from "motion/react";

const { useWatch, useForm } = ProForm;

const DesktopThemeConfigHandle = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { message } = App.useApp();

  const [activeStep, setActiveStep] = useState<number>(0);
  const [editingTheme, setEditingTheme] = useState<"light" | "dark">("light");

  const [form] = useForm();

  const { setFieldsValue, getFieldsValue } = form;

  const lightThemeConfig = useWatch("lightConfig", form);
  const darkThemeConfig = useWatch("darkConfig", form);

  const requiredName = useWatch("name", form);

  const { data: categoryData, run: categoryRun } = useRequest(getDesktopThemeCategory, { manual: true });

  const { loading: detailLoading, run: detailRun } = useRequest(getDesktopThemeConfigDetail, {
    manual: true,
    onSuccess: (res: any) => {
      setFieldsValue({
        name: res?.name,
        description: res?.description,
        categoryId: res?.categoryId?._id ?? res?.categoryId,
        lightConfig: res?.lightConfig ?? desktopThemeLight,
        darkConfig: res?.darkConfig ?? desktopThemeDark,
      });
    },
  });

  const { loading: createLoading, run: createRun } = useRequest(createDesktopThemeConfig, {
    manual: true,
    onSuccess: () => {
      message.success("新增成功");
      navigate(-1);
    },
  });

  const { loading: updateLoading, run: updateRun } = useRequest(updateDesktopThemeConfig, {
    manual: true,
    onSuccess: () => {
      message.success("编辑成功");
      navigate(-1);
    },
  });

  useEffect(() => {
    if (id) {
      detailRun(id);
    }
  }, [id]);

  useEffect(() => {
    categoryRun({ page: 1, pageSize: 200 });
  }, [categoryRun]);

  const categoryOptions = useMemo(() => {
    const items = (categoryData as any)?.data ?? categoryData ?? [];
    return (Array.isArray(items) ? items : []).map((item: any) => ({
      label: item?.name ?? "-",
      value: item?._id,
    }));
  }, [categoryData]);

  const handleSave = () => {
    const values = getFieldsValue(true);
    const payload = {
      name: values?.name,
      description: values?.description,
      categoryId: values?.categoryId,
      lightConfig: values?.lightConfig,
      darkConfig: values?.darkConfig,
    } as any;
    if (id) {
      updateRun(id as string, payload);
    } else {
      createRun(payload);
    }
  };

  return (
    <FullPageContainer
      cardProps={{
        title: <Steps size="small" current={activeStep} items={[{ title: "基础信息" }, { title: "主题配置" }]} />,
        extra: (
          <>
            <Button.Group>
              <Button disabled={activeStep === 0} onClick={() => setActiveStep((s) => Math.max(0, s - 1))}>
                上一步
              </Button>
              <Button
                type="primary"
                disabled={!requiredName || activeStep === 1}
                onClick={() => setActiveStep((s) => Math.min(1, s + 1))}
              >
                下一步
              </Button>
            </Button.Group>
            <Button
              type="primary"
              icon={<RiSaveLine size={16} />}
              loading={createLoading || updateLoading}
              onClick={handleSave}
            >
              保存
            </Button>
          </>
        ),
      }}
      backButtonProps={{
        confirm: true,
      }}
      loading={detailLoading}
    >
      <ProForm
        rootClassName="h-full"
        {...{
          labelCol: { span: 10 },
          wrapperCol: { span: 14 },
        }}
        form={form}
        initialValues={{
          name: undefined,
          description: undefined,
          lightConfig: desktopThemeLight,
          darkConfig: desktopThemeDark,
        }}
        submitter={false}
        layout="horizontal"
        className={css`
          .ant-pro-field-color-picker {
            width: auto !important;
            display: inline-flex !important;
          }
        `}
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
                  labelCol={{ span: 4 }}
                />
                <ProFormSelect
                  name="categoryId"
                  label="分类"
                  placeholder="请选择分类"
                  options={categoryOptions}
                  allowClear
                  labelCol={{ span: 4 }}
                />
                <ProFormTextArea name="description" label="描述" placeholder="请输入描述" labelCol={{ span: 4 }} />
              </div>
            </motion.div>
          )}
          {activeStep === 1 && (
            <motion.div className="h-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Row gutter={24} className="h-full">
                <Col className="h-full" span={6}>
                  <Card
                    title="主题配置"
                    className="h-full"
                    styles={{
                      body: {
                        height: "calc(100% - 56px)",
                        overflow: "auto",
                        padding: 0,
                      },
                    }}
                    extra={
                      <Radio.Group
                        value={editingTheme}
                        onChange={(e) => setEditingTheme(e.target.value)}
                        optionType="button"
                        buttonStyle="solid"
                      >
                        <Radio.Button value="light">亮色</Radio.Button>
                        <Radio.Button value="dark">暗色</Radio.Button>
                      </Radio.Group>
                    }
                  >
                    {editingTheme === "light" ? (
                      <ProForm.Item name="lightConfig" noStyle>
                        <ColorConfigFields themePrefix="lightConfig" />
                      </ProForm.Item>
                    ) : (
                      <ProForm.Item name="darkConfig" noStyle>
                        <ColorConfigFields themePrefix="darkConfig" />
                      </ProForm.Item>
                    )}
                  </Card>
                </Col>

                <Col className="h-full" span={18}>
                  <Card title="主题预览" className="h-full" styles={{ body: { height: "calc(100% - 56px)" } }}>
                    <div className={cx("max-h-96 h-full rounded", editingTheme === "light" ? "bg-white" : "bg-black")}>
                      <Desktop
                        list={defaultList as DesktopListItem[]}
                        theme={editingTheme === "light" ? lightThemeConfig : darkThemeConfig}
                        enableCaching={false}
                      />
                    </div>
                  </Card>
                </Col>
              </Row>
            </motion.div>
          )}
        </AnimatePresence>
      </ProForm>
    </FullPageContainer>
  );
};

export default DesktopThemeConfigHandle;
