import { addWebsite, getWebsiteDetail, parseWebsite, updateWebsite } from "@/services/tabs/website";
import { getWebsiteClassify } from "@/services/tabs/website_classifty";
import { baseFormItemLayout } from "@/utils/utils";
import {
  ModalForm,
  ProForm,
  ProFormInstance,
  ProFormText,
  ProFormTextArea,
  ProFormTreeSelect,
  ProFormSwitch,
  ProFormColorPicker,
} from "@ant-design/pro-components";
import ProFormUpload from "@/components/pro-form/fields/upload";
import { RiAddLine } from "@remixicon/react";
import { useRequest } from "ahooks";
import { App, Button, Image, Input, Space } from "antd";
import { FC, useEffect, useRef, useState } from "react";
import { getDominantColor } from "@/utils/color";
import ParseResultModal from "./components/ParseResultModal";
import IconEditorModal from "./components/IconEditorModal";
import Access from "@/components/Access";
import { routeAuth } from "@/contexts/AccessContext";

export interface HandleModalProps {
  onFinished?: (values: any) => void;
  open?: boolean;
  editId?: string;
  onClose?: () => void;
  onDetailLoading?: (loading: boolean) => void;
}

const WebsiteHandle: FC<HandleModalProps> = (props) => {
  const { onFinished, open, editId, onClose, onDetailLoading } = props;

  const { message } = App.useApp();

  const [parseModalOpen, setParseModalOpen] = useState(false);
  const [parseResult, setParseResult] = useState<any>(null);
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const [iconEditorOpen, setIconEditorOpen] = useState(false);
  const [iconEditorInitialUrl, setIconEditorInitialUrl] = useState<string | null>(null);

  const ref = useRef<ProFormInstance<any>>(null);
  const parseFormRef = useRef<ProFormInstance<any>>(null);

  const { data, loading, run } = useRequest(getWebsiteDetail, {
    manual: true,
  });

  const handleUseParseResult = async () => {
    if (!parseResult) return;

    const formThemeColor = ref.current?.getFieldValue("themeColor");

    let themeColor = undefined;
    if (selectedIcon && !formThemeColor) {
      try {
        themeColor = await getDominantColor(selectedIcon);
      } catch (error) {
        console.error("获取图标主色失败:", error);
      }
    }

    ref.current?.setFieldsValue({
      ...parseResult,
      name: parseResult.title,
      icon: selectedIcon
        ? {
            name: selectedIcon?.split("/").pop(),
            url: selectedIcon,
          }
        : null,
      iconEdited: null,
      themeColor: themeColor ?? formThemeColor,
    });

    setParseModalOpen(false);
    setSelectedIcon(null);
    setParseResult(null);
  };

  const getParseFailedContent = (options?: { status?: number; code?: string }) => {
    const status = options?.status;
    const code = options?.code;

    if (status === 403) {
      return (
        <Space direction="vertical" size={0}>
          <div>解析失败：目标站点拒绝访问</div>
          <div className="text-xs text-gray-500">可能触发人机验证/反爬限制，建议在浏览器确认可访问后重试。</div>
        </Space>
      );
    }

    if (status === 404) {
      return (
        <Space direction="vertical" size={0}>
          <div>解析失败：未找到解析服务</div>
          <div className="text-xs text-gray-500">请稍后重试；如果持续出现，可能需要更新应用或检查服务端配置。</div>
        </Space>
      );
    }

    if (code === "ECONNABORTED") {
      return (
        <Space direction="vertical" size={0}>
          <div>解析失败：请求超时</div>
          <div className="text-xs text-gray-500">可能是网站响应较慢或网络不稳定，建议检查网络后重试。</div>
        </Space>
      );
    }

    return (
      <Space direction="vertical" size={0}>
        <div>解析失败：未获取到网页信息</div>
        <div className="text-xs text-gray-500">可能原因：网站无法访问、触发人机验证/反爬、需要登录或网络异常。</div>
      </Space>
    );
  };

  const { loading: parseLoading, run: parseRun } = useRequest(parseWebsite, {
    manual: true,
    onSuccess: (res, [{ url }]) => {
      if (Object.keys(res ?? {}).length === 0) {
        message.error(getParseFailedContent());
        return;
      }

      const iconUrl = res.icon ? (res.icon.startsWith("http") ? res.icon : new URL(res.icon, url).href) : null;

      const iconUrls =
        res.icons?.map((item) => {
          return item.startsWith("http") ? item : new URL(item, url).href;
        }) ?? [];

      if (iconUrl && !iconUrls.includes(iconUrl)) {
        iconUrls.unshift(iconUrl);
      }

      if (iconUrls.length > 0) {
        setSelectedIcon(iconUrls[0]);
      }

      setParseResult({ ...res, icons: iconUrls });
      setParseModalOpen(true);
    },
    onError: (error: any) => {
      const status = error?.response?.status;
      if ([400, 429, 500].includes(status)) return;
      message.error(getParseFailedContent({ status, code: error?.code }));
    },
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
        classify: (data as any)?.classify?._id ?? (data as any)?.classify ?? null,
      } as any);
    }
  }, [data]);

  useEffect(() => {
    onDetailLoading?.(loading);
  }, [loading]);

  const reg = new RegExp(
    "^(https?|ftp|file):\\/\\/[\\w\\d\\-_]+(\\.[\\w\\d\\-_]+)+([\\w\\-.,@?^=%&:/~+#]*[\\w\\-@?^=%&/~+#])?$"
  );

  return (
    <>
      <ModalForm
        {...baseFormItemLayout}
        open={open}
        formRef={ref}
        trigger={
          <Button type="primary" icon={<RiAddLine size={16} />}>
            新增网站
          </Button>
        }
        title={editId ? "修改网站" : "新增网站"}
        onOpenChange={(visible) => {
          if (!visible) {
            onClose?.();
          }
          ref.current?.resetFields();
        }}
        onFinish={(values) => {
          return new Promise((resolve) => {
            (editId ? updateWebsite(editId, values) : addWebsite(values))
              .then(() => {
                message.success(editId ? "修改成功" : "新增成功");
                onFinished?.(values);
                resolve(true);
                ref.current?.resetFields();
              })
              .catch(() => {
                resolve(false);
              });
          });
        }}
        modalProps={{
          destroyOnClose: true,
        }}
      >
        <ProFormTreeSelect
          name="classify"
          label="分类"
          request={async () => {
            const result = await getWebsiteClassify({});
            const disabledParent = (d: any[]): any[] => {
              return d.map((item: any) => {
                if (item.children?.length) {
                  return {
                    ...item,
                    disabled: true,
                    children: disabledParent(item.children),
                  };
                }
                return item;
              });
            };
            return disabledParent(result);
          }}
          fieldProps={{
            fieldNames: {
              label: "name",
              value: "_id",
            },
          }}
        />
        <ProForm.Item
          label="URL"
          required
          rules={[
            { required: true, message: "请输入URL" },
            { pattern: reg, message: "请输入正确的URL" },
          ]}
        >
          <div className="flex gap-2">
            <ProForm.Item
              name="url"
              noStyle
              rules={[
                { required: true, message: "请输入URL" },
                { pattern: reg, message: "请输入正确的URL" },
              ]}
            >
              <Input.TextArea />
            </ProForm.Item>
            <ProForm.Item noStyle shouldUpdate>
              {(form: ProFormInstance) => {
                const url = form.getFieldValue("url");
                const isUrl = reg.test(url);
                return (
                  <Access auth={routeAuth("POST", "/tabs/website/parse")}>
                    <Button
                      disabled={!isUrl}
                      loading={parseLoading}
                      onClick={() => {
                        parseRun({ url });
                      }}
                    >
                      解析URL
                    </Button>
                  </Access>
                );
              }}
            </ProForm.Item>
          </div>
        </ProForm.Item>
        <ProFormText name="name" label="名称" rules={[{ required: true, message: "请输入名称" }]} />
        <ProFormTextArea name="description" label="描述" />
        <ProFormUpload name="icon" label="原始图标" fieldProps={{ dir: "website_icon", accept: "image/*", maxCount: 1 }} />
        <ProForm.Item name="iconEdited" hidden>
          <div />
        </ProForm.Item>
        <ProForm.Item label="图标编辑" shouldUpdate>
          {(form: ProFormInstance) => {
            const icon = form.getFieldValue("icon");
            const iconEdited = form.getFieldValue("iconEdited");
            const originalUrl = icon?.url;
            const editedUrl = iconEdited?.url;
            const activeUrl = editedUrl ?? originalUrl;

            return (
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="shrink-0 flex items-center gap-2">
                    <div className="w-10 h-10 rounded border border-solid border-gray-200 overflow-hidden bg-white">
                      {activeUrl ? <Image src={activeUrl} width={40} height={40} preview={false} /> : null}
                    </div>
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm">当前使用：{editedUrl ? "编辑后图标" : "原始图标"}</div>
                    <div className="text-xs text-gray-500 truncate">{activeUrl ?? "未设置"}</div>
                  </div>
                </div>
                <Space>
                  <Button
                    onClick={() => {
                      setIconEditorInitialUrl(editedUrl ?? originalUrl ?? null);
                      setIconEditorOpen(true);
                    }}
                  >
                    编辑图标
                  </Button>
                  <Button
                    disabled={!editedUrl}
                    onClick={() => {
                      ref.current?.setFieldsValue({ iconEdited: null });
                    }}
                  >
                    清除编辑
                  </Button>
                </Space>
              </div>
            );
          }}
        </ProForm.Item>
        <ProFormColorPicker
          name="themeColor"
          label="主题色"
          formItemProps={{
            getValueFromEvent: (e: any) => {
              return e.toRgbString();
            },
          }}
          // @ts-ignore 类型中缺少 format 属性,但实际运行时存在
          fieldProps={{ format: "rgb" }}
        />
        <ProFormSwitch name="enable" label="是否启用" initialValue={true} />
        <ProFormSwitch name="public" label="是否公开" initialValue={false} />
      </ModalForm>
      <ParseResultModal
        formRef={parseFormRef}
        open={parseModalOpen}
        initialValues={parseResult}
        selectedIcon={selectedIcon}
        onSelectIcon={(v) => setSelectedIcon(v)}
        onOpenChange={(open) => {
          if (!open) {
            setParseModalOpen(false);
            setSelectedIcon(null);
            setParseResult(null);
            parseFormRef.current?.resetFields();
          }
        }}
        onUse={async () => {
          await handleUseParseResult();
          return true;
        }}
      />
      <IconEditorModal
        open={iconEditorOpen}
        initialUrl={iconEditorInitialUrl}
        onOpenChange={(open) => {
          setIconEditorOpen(open);
          if (!open) setIconEditorInitialUrl(null);
        }}
        onUploaded={(resource) => {
          ref.current?.setFieldsValue({ iconEdited: resource });
        }}
      />
    </>
  );
};

export default WebsiteHandle;
