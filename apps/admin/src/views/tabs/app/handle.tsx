import { baseFormItemLayout } from "@/utils/utils";
import { ProForm, ProFormInstance, ProFormText, ProFormTextArea, ProFormDependency, ProFormDigit } from "@ant-design/pro-components";
import { Form, Select, App, Switch, InputNumber, Input, Button, Upload, Alert, Card, Space, Tag, Typography, Image, Segmented } from "antd";
import { FC, useEffect, useMemo, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useNavigate, useParams } from "react-router";
import { addApp, getAppDetail, updateApp, uploadAppPackage, AppItem, AppScreenshot, AppSettingsField } from "@/services/tabs/app";
import { useRequest } from "ahooks";
import { getAllAppClassify } from "@/services/tabs/app_classify";
import FullPageContainer from "@/components/containter/full";
import ProFormUpload from "@/components/pro-form/fields/upload";
import { RiUploadCloud2Line } from "@remixicon/react";
import Access from "@/components/Access";
import { useHasPermission } from "@/contexts/AccessContext";
import { APP_PERMISSIONS } from "./permissions";

const { Text } = Typography;

const COMMON_ENTRY_BASENAMES = ["index", "main", "app"];
const COMMON_EXTS = ["ts", "tsx", "js", "jsx", "mjs", "cjs", "html", "css"];
const DEFAULT_SIZE_CONFIG = { row: 2, col: 2, name: "2x2", id: "2x2" };
const ALLOWED_SETTINGS_TYPES = ["input", "select", "switch", "textarea", "number"] as const;
const PREVIEW_THEME_OPTIONS = [
  { label: "浅色", value: "light" },
  { label: "深色", value: "dark" },
];

type SettingsSchemaInput = string | AppSettingsField[] | undefined;
type PreviewTheme = "light" | "dark";

const parseSettingsSchema = (value: SettingsSchemaInput): AppSettingsField[] | undefined => {
  if (!value || value === "") return undefined;
  if (Array.isArray(value)) return value;
  return JSON.parse(value);
};

const validateSettingsSchemaValue = (value: SettingsSchemaInput): string | null => {
  let schema: AppSettingsField[] | undefined;
  try {
    schema = parseSettingsSchema(value);
  } catch {
    return "JSON 格式不正确";
  }

  if (!schema) return null;
  if (!Array.isArray(schema)) return "必须是 JSON 数组格式";

  const invalidIndex = schema.findIndex((field) => {
    if (!field || typeof field !== "object") return true;
    const hasRequiredText = [field.key, field.label, field.type].every((item) => typeof item === "string" && item.trim());
    return !hasRequiredText || !isAllowedSettingsType(field.type);
  });

  if (invalidIndex >= 0) {
    return `第 ${invalidIndex + 1} 项必须包含 key、label、type，且 type 仅支持 ${ALLOWED_SETTINGS_TYPES.join("/")}`;
  }

  return null;
};

const isAllowedSettingsType = (type: unknown): type is AppSettingsField["type"] =>
  typeof type === "string" && ALLOWED_SETTINGS_TYPES.some((allowedType) => allowedType === type);

const normalizeAppPayload = (values: AppItem): AppItem => {
  const sizeConfigs = values.sizeConfigs?.length ? values.sizeConfigs : [{ ...DEFAULT_SIZE_CONFIG }];
  const defaultSizeId = values.defaultSizeId || DEFAULT_SIZE_CONFIG.id;
  const supportAppMode = values.supportAppMode ?? false;
  return {
    ...values,
    enable: values.enable ?? true,
    supportIconMode: values.supportIconMode ?? true,
    supportAppMode,
    appIcon: supportAppMode ? (values.appIcon ?? { type: "image" }) : values.appIcon,
    appIconUrl: values.appIconUrl || undefined,
    sortOrder: values.sortOrder ?? 0,
    sizeConfigs,
    defaultSizeId,
    settingsSchema: parseSettingsSchema(values.settingsSchema as SettingsSchemaInput),
  };
};

const getConfigValue = (data: AppItem | undefined, key: string) => data?.configSnapshot?.[key];

const getPreviewTheme = (themeId?: string): PreviewTheme => (themeId === "dark" ? "dark" : "light");

const getPreviewSortIndex = (sizeId: string) => {
  const order = ["1x1", "2x1", "2x2", "3x2", "4x2"];
  const index = order.indexOf(sizeId);
  return index >= 0 ? index : order.length;
};

const getAppAssetUrl = (url?: string) => {
  if (!url) return "";
  if (/^(https?:)?\/\//.test(url)) return url;
  const normalized = url.startsWith("/") ? url : `/${url}`;
  return normalized;
};

const getVisibleScreenshots = (screenshots: AppScreenshot[], theme: PreviewTheme) => {
  const bySize = new Map<string, AppScreenshot>();

  screenshots
    .filter((item) => getPreviewTheme(item.themeId) === theme)
    .sort((a, b) => Number(b.mode === "icon") - Number(a.mode === "icon"))
    .forEach((item) => {
      if (!bySize.has(item.sizeId)) bySize.set(item.sizeId, item);
    });

  return Array.from(bySize.values()).sort((a, b) => {
    const diff = getPreviewSortIndex(a.sizeId) - getPreviewSortIndex(b.sizeId);
    return diff || a.sizeId.localeCompare(b.sizeId);
  });
};

const AppScreenshotPreview: FC<{ screenshots?: AppScreenshot[] }> = ({ screenshots = [] }) => {
  const [theme, setTheme] = useState<PreviewTheme>("light");
  const validScreenshots = screenshots.filter((item) => item?.url && item?.sizeId);
  if (!validScreenshots.length) return null;

  const themes = new Set(validScreenshots.map((item) => getPreviewTheme(item.themeId)));
  const activeTheme = themes.has(theme) ? theme : themes.has("light") ? "light" : "dark";
  const visibleScreenshots = getVisibleScreenshots(validScreenshots, activeTheme);

  return (
    <Form.Item label="包内截图预览">
      <div className="w-full">
        <div className="mb-3 flex items-center justify-between gap-3">
          <Text type="secondary">共 {visibleScreenshots.length} 个尺寸</Text>
          <Segmented
            size="small"
            options={PREVIEW_THEME_OPTIONS.filter((item) => themes.has(item.value as PreviewTheme))}
            value={activeTheme}
            onChange={(value) => setTheme(value as PreviewTheme)}
          />
        </div>
        <Image.PreviewGroup>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {visibleScreenshots.map((item) => (
              <div key={`${item.themeId}-${item.sizeId}-${item.file}`} className="rounded-lg border border-solid border-gray-200 bg-gray-50 p-3">
                <div className="flex h-36 items-center justify-center overflow-hidden rounded-md bg-white">
                  <Image
                    src={getAppAssetUrl(item.url)}
                    alt={`${item.sizeId} ${activeTheme}`}
                    className="max-h-32 object-contain"
                  />
                </div>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <Tag className="m-0!">{item.sizeId}</Tag>
                  {item.width && item.height ? (
                    <Text type="secondary" className="text-xs!">
                      {item.width}×{item.height}
                    </Text>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </Image.PreviewGroup>
      </div>
    </Form.Item>
  );
};

const getConfigStringValue = (data: AppItem | undefined, key: string) => {
  const value = getConfigValue(data, key);
  return typeof value === "string" ? value : "";
};

const getConfigArrayValue = <T,>(data: AppItem | undefined, key: string): T[] | undefined => {
  const value = getConfigValue(data, key);
  return Array.isArray(value) ? value as T[] : undefined;
};

const getConfigBooleanValue = (data: AppItem | undefined, key: string) => {
  const value = getConfigValue(data, key);
  return typeof value === "boolean" ? value : undefined;
};

const buildFormValuesFromApp = (app: AppItem): Partial<AppItem> => ({
  ...app,
  name: app.name || getConfigStringValue(app, "displayName") || getConfigStringValue(app, "name"),
  description: app.description || getConfigStringValue(app, "description"),
  version: app.version || getConfigStringValue(app, "version"),
  author: app.author || getConfigStringValue(app, "author"),
  entryFileName: app.entryFileName || getConfigStringValue(app, "entry"),
  sizeConfigs: app.sizeConfigs?.length ? app.sizeConfigs : getConfigArrayValue(app, "sizeConfigs"),
  defaultSizeId: app.defaultSizeId || getConfigStringValue(app, "defaultSizeId"),
  supportIconMode: app.supportIconMode ?? getConfigBooleanValue(app, "supportIconMode"),
  supportAppMode: app.supportAppMode ?? getConfigBooleanValue(app, "supportAppMode"),
  appIcon: app.appIcon || getConfigValue(app, "appIcon") as AppItem["appIcon"],
  appIconUrl: app.appIconUrl || getConfigStringValue(app, "appIconUrl"),
  tags: app.tags?.length ? app.tags : getConfigArrayValue<string>(app, "tags"),
  settingsSchema: app.settingsSchema?.length ? app.settingsSchema : getConfigArrayValue<AppSettingsField>(app, "settingsSchema"),
});

const getClassifyValue = (classify: AppItem["classify"] | any) => {
  if (!classify) return undefined;
  if (typeof classify === "string") return classify;
  return classify._id ?? classify.id;
};

const inferEntry = (names: string[]): string | undefined => {
  const lower = names.map((n) => n.toLowerCase());
  // 单文件默认入口
  if (lower.length === 1) return names[0];
  // 匹配 index/main/app + 常见后缀
  for (const base of COMMON_ENTRY_BASENAMES) {
    for (const ext of COMMON_EXTS) {
      const full = `${base}.${ext}`;
      const i = lower.indexOf(full);
      if (i >= 0) return names[i];
    }
    // 无后缀匹配
    const j = lower.indexOf(base);
    if (j >= 0) return names[j];
  }
  // 兜底：返回第一个文件名
  return names[0];
};

const AppHandle: FC = () => {
  const ref = useRef<ProFormInstance<any>>(null);
  const navigate = useNavigate();
  const { id } = useParams();

  const { message } = App.useApp();

  const [fileNames, setFileNames] = useState<string[]>([]);
  const [packageAppId, setPackageAppId] = useState<string | undefined>();
  const [packageMeta, setPackageMeta] = useState<AppItem | undefined>();
  const uploadDir = useMemo(() => `app_${uuidv4()}`, []);

  const {
    data: detailData,
    run: detailRun,
    loading: detailLoading,
  } = useRequest(getAppDetail, {
    manual: true,
    onSuccess: (data: any) => {
      const names = (data?.files || []).map((f: any) => f?.name).filter(Boolean);
      setFileNames(names);
      setPackageMeta(data);
      ref.current?.setFieldsValue({
        ...buildFormValuesFromApp(data),
        enable: data.enable ?? true,
        sortOrder: data.sortOrder ?? 0,
        classify: getClassifyValue(data.classify),
      });
    },
  });

  useEffect(() => {
    if (id) {
      detailRun(id);
    }
  }, [id]);

  // 分类数据
  const { data: classifyOptions } = useRequest(getAllAppClassify);

  const entryDetected = useMemo(() => inferEntry(fileNames), [fileNames]);

  useEffect(() => {
    if (entryDetected && ref.current) {
      const current = ref.current.getFieldsValue();
      if (!current.entryFileName) {
        ref.current.setFieldsValue({ entryFileName: entryDetected });
      }
    }
  }, [entryDetected]);

  const { runAsync: addRun } = useRequest(addApp, {
    manual: true,
    onSuccess: () => {
      message.success("新增成功");
      navigate(-1);
    },
  });

  const { runAsync: editRun } = useRequest(updateApp, {
    manual: true,
    onSuccess: () => {
      message.success("修改成功");
      navigate(-1);
    },
  });

  const { runAsync: uploadPackageRun, loading: uploadPackageLoading } = useRequest(uploadAppPackage, {
    manual: true,
    onSuccess: (result) => {
      const app = result?.app;
      if (!app) {
        message.error("应用包上传成功，但响应中缺少应用数据");
        return;
      }
      const nextValues = {
        ...buildFormValuesFromApp(app),
        enable: app.enable ?? true,
        sortOrder: app.sortOrder ?? 0,
        classify: getClassifyValue(app.classify),
      };
      setPackageAppId(app._id);
      setPackageMeta(app);
      setFileNames([]);
      ref.current?.resetFields();
      window.setTimeout(() => {
        ref.current?.setFieldsValue(nextValues);
      }, 0);
      message.success("已读取 .snapp 配置并回填表单");
    },
  });

  const packageMode = packageMeta?.sourceType === "snapp" || !!packageAppId;
  const canSave = useHasPermission(
    id || packageAppId ? APP_PERMISSIONS.update : APP_PERMISSIONS.create,
  );

  return (
    <FullPageContainer loading={detailLoading}>
      <div className="max-w-5xl mx-auto py-6">
        <ProForm
          {...baseFormItemLayout}
          formRef={ref}
          initialValues={{
            enable: true,
            supportIconMode: true,
            supportAppMode: false,
            appIcon: { type: "image" },
            sortOrder: 0,
            sizeConfigs: [{ ...DEFAULT_SIZE_CONFIG }],
            defaultSizeId: DEFAULT_SIZE_CONFIG.id,
            dir: uploadDir,
            ...detailData,
          }}
          submitter={{
            searchConfig: { submitText: "保存" },
            render: (_, dom) =>
              canSave ? <div className="flex items-center justify-center gap-2">{...dom}</div> : null,
          }}
          onFinish={async (values: AppItem) => {
            const payload = normalizeAppPayload(values);
            const targetId = id || packageAppId;
            if (targetId) {
              await editRun(targetId, payload);
            } else {
              await addRun(payload);
            }
            ref.current?.resetFields();
            return true;
          }}
        >
          <Card className="mb-5" title="应用包" size="small">
            <Space direction="vertical" className="w-full" size={12}>
              <Access auth={APP_PERMISSIONS.importPackage}>
                <Upload
                  accept=".snapp"
                  showUploadList={false}
                  beforeUpload={(file) => {
                    uploadPackageRun(file, id || packageAppId);
                    return false;
                  }}
                >
                  <Button icon={<RiUploadCloud2Line size={16} />} loading={uploadPackageLoading}>
                    上传并读取 .snapp
                  </Button>
                </Upload>
              </Access>
              <Alert
                type="info"
                showIcon
                message="推荐使用应用包配置"
                description="上传 .snapp 后，名称、简介、入口、版本、作者、尺寸、图标模式、应用模式、标签和设置 Schema 会从包内 app.config.json 自动读取。表单中仅建议维护分类、启用状态、排序等运营字段。"
              />
              {packageMode ? (
                <div className="flex flex-wrap gap-2 text-sm">
                  <Tag color="blue">snapp</Tag>
                  {packageMeta?.packageName ? <Text type="secondary">包名：{packageMeta.packageName}</Text> : null}
                  {packageMeta?.entryUrl ? <Text copyable type="secondary">入口：{packageMeta.entryUrl}</Text> : null}
                </div>
              ) : null}
            </Space>
          </Card>
          {packageMode ? <AppScreenshotPreview screenshots={packageMeta?.screenshots} /> : null}
          <ProFormText
            name="name"
            label="名称"
            placeholder="请输入名称"
            disabled={packageMode}
            rules={[
              { required: true, message: "请输入名称" },
              { max: 50, message: "名称不超过50个字符" },
            ]}
          />
          <ProFormTextArea
            name="description"
            label="简介"
            placeholder="请输入简介"
            disabled={packageMode}
            fieldProps={{ rows: 3, maxLength: 200, showCount: true }}
          />
          <Form.Item label="分类" name="classify" tooltip="请选择所属分类">
            <Select
              showSearch
              placeholder="请选择分类"
              options={(classifyOptions || []).map((c: any) => ({ label: c.name, value: c._id }))}
            />
          </Form.Item>
          {!packageMode ? (
            <>
              <ProFormText name="dir" label="上传目录" placeholder="例如 app_xxx" />
              <ProFormDependency name={["dir"]}>
                {({ dir }) => (
                  <ProFormUpload
                    name="icon"
                    label="图标"
                    tooltip="上传应用图标"
                    fieldProps={{
                      dragger: true,
                      multiple: false,
                      accept: "image/*",
                      maxCount: 1,
                      showUploadList: true,
                      dir: (dir ?? "") || uploadDir,
                    }}
                  />
                )}
              </ProFormDependency>
              <ProFormDependency name={["dir"]}>
                {({ dir }) => (
                  <ProFormUpload
                    name="previewImages"
                    label="预览图"
                    tooltip="上传应用的预览图片"
                    fieldProps={{
                      dragger: true,
                      multiple: true,
                      accept: "image/*",
                      dir: (dir ?? "") || uploadDir,
                    }}
                  />
                )}
              </ProFormDependency>
              <ProFormDependency name={["dir"]}>
                {({ dir }) => (
                  <ProFormUpload
                    name="files"
                    label="上传文件"
                    tooltip="支持上传多个文件，自动识别入口文件"
                    fieldProps={{
                      dragger: true,
                      multiple: true,
                      showUploadList: true,
                      listType: "text",
                      dir: (dir ?? "") || uploadDir,
                      accept:
                        "text/html,text/css,application/javascript,application/json,image/svg+xml,image/*,font/woff,font/woff2,font/ttf",
                    }}
                    onChange={(list: any) => {
                      const arr = Array.isArray(list) ? list : [list];
                      const names = (arr || []).map((f: any) => f?.name).filter(Boolean);
                      setFileNames(names);
                    }}
                  />
                )}
              </ProFormDependency>
            </>
          ) : null}
          <ProFormText
            name="entryFileName"
            label="入口文件名称"
            placeholder="例如 index.tsx 或 main.js"
            tooltip="单文件默认即该文件名；多文件将尝试识别 index/main/app 等常见名称，可手动修改"
            disabled={packageMode}
            rules={[{ required: true, message: "请输入入口文件名称" }]}
          />
          {!packageMode ? (
            <Form.Item label="入口识别结果" tooltip="根据已上传文件自动推断的入口文件">
              <span>{entryDetected ?? "未上传文件或未识别"}</span>
            </Form.Item>
          ) : null}
          {/* 版本号 */}
          <ProFormText
            name="version"
            label="版本号"
            placeholder="例如 1.0.0"
            tooltip="应用版本号，建议使用语义化版本"
            disabled={packageMode}
          />

          {/* 作者 */}
          <ProFormText
            name="author"
            label="作者"
            placeholder="请输入作者名称"
            disabled={packageMode}
          />

          {/* 是否支持图标模式 */}
          <Form.Item label="支持图标模式" name="supportIconMode" valuePropName="checked" tooltip="是否支持在桌面上以小图标形式显示">
            <Switch disabled={packageMode} />
          </Form.Item>

          <Form.Item label="支持应用模式" name="supportAppMode" valuePropName="checked" tooltip="开启后会出现在前台 Store 的应用菜单中">
            <Switch disabled={packageMode} />
          </Form.Item>

          <ProFormDependency name={["supportAppMode", "appIcon"]}>
            {({ supportAppMode, appIcon }) =>
              supportAppMode ? (
                <>
                  <Form.Item label="应用图标类型" name={["appIcon", "type"]} tooltip="图片图标使用 appIconUrl， 自定义元素会以前台 appIcon 模式渲染入口">
                    <Select
                      disabled={packageMode}
                      options={[
                        { label: "图片", value: "image" },
                        { label: "自定义元素", value: "custom" },
                      ]}
                    />
                  </Form.Item>
                  {(appIcon?.type ?? "image") === "image" ? (
                    <ProFormText
                      name="appIconUrl"
                      label="应用图标URL"
                      placeholder="留空则回退应用图标"
                      disabled={packageMode}
                      tooltip="手动配置时可填完整URL；应用包会自动回填包内静态资源URL"
                    />
                  ) : null}
                </>
              ) : null
            }
          </ProFormDependency>

          {/* 排序权重 */}
          <ProFormDigit
            name="sortOrder"
            label="排序"
            placeholder="排序权重，值越小越靠前"
            fieldProps={{ min: 0 }}
            tooltip="数值越小排序越靠前"
          />

          {/* 标签 */}
          <Form.Item label="标签" name="tags" tooltip="用于前端搜索和分类展示的标签">
            <Select
              mode="tags"
              placeholder="输入标签后回车添加"
              tokenSeparators={[","]}
              disabled={packageMode}
            />
          </Form.Item>

          {/* 尺寸配置 */}
          <Form.Item label="尺寸配置" tooltip="定义该应用支持的桌面尺寸">
            <Form.List name="sizeConfigs">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <div key={key} className="flex items-center gap-2 mb-2">
                      <Form.Item {...restField} name={[name, "row"]} rules={[{ required: true, message: "请输入行数" }]} className="mb-0!">
                        <InputNumber placeholder="行" min={1} max={4} disabled={packageMode} />
                      </Form.Item>
                      <span>×</span>
                      <Form.Item {...restField} name={[name, "col"]} rules={[{ required: true, message: "请输入列数" }]} className="mb-0!">
                        <InputNumber placeholder="列" min={1} max={4} disabled={packageMode} />
                      </Form.Item>
                      <Form.Item {...restField} name={[name, "name"]} rules={[{ required: true, message: "请输入名称" }]} className="mb-0!">
                        <Input placeholder="名称，如 2x2" disabled={packageMode} />
                      </Form.Item>
                      <Form.Item {...restField} name={[name, "id"]} rules={[{ required: true, message: "请输入ID" }]} className="mb-0!">
                        <Input placeholder="ID，如 2x2" disabled={packageMode} />
                      </Form.Item>
                      {!packageMode ? <Button type="link" danger onClick={() => remove(name)}>删除</Button> : null}
                    </div>
                  ))}
                  {!packageMode ? (
                    <Button type="dashed" onClick={() => add({ ...DEFAULT_SIZE_CONFIG })} block>
                      + 添加尺寸配置
                    </Button>
                  ) : null}
                </>
              )}
            </Form.List>
          </Form.Item>

          {/* 默认尺寸 */}
          <ProFormDependency name={["sizeConfigs"]}>
            {({ sizeConfigs }) => (
              <Form.Item
                label="默认尺寸"
                name="defaultSizeId"
                tooltip="选择应用的默认桌面尺寸"
                rules={[
                  { required: true, message: "请选择默认尺寸" },
                  {
                    validator: (_, value) => {
                      if (!value) return Promise.resolve();
                      const exists = (sizeConfigs || []).some((item: any) => item?.id === value);
                      return exists ? Promise.resolve() : Promise.reject("默认尺寸必须属于尺寸配置");
                    },
                  },
                ]}
              >
                <Select placeholder="请选择默认尺寸" disabled={packageMode}>
                  {(sizeConfigs || []).map((item: any) => (
                    <Select.Option key={item?.id} value={item?.id}>
                      {item?.name || item?.id}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            )}
          </ProFormDependency>

          {/* 设置表单 Schema（JSON 格式，定义应用可配置项） */}
          <Form.Item
            label="设置Schema"
            name="settingsSchema"
            tooltip="JSON 数组格式，定义应用的用户可配置项（如时区、标题等），以 antd 表单组件为基准"
            normalize={(value) => {
              if (!value || typeof value !== "string") return value;
              try {
                return JSON.parse(value);
              } catch {
                return value;
              }
            }}
            getValueProps={(value) => ({
              value: value && typeof value !== "string" ? JSON.stringify(value, null, 2) : (value ?? ""),
            })}
            rules={[
              {
                validator: (_, value) => {
                  const error = validateSettingsSchemaValue(value);
                  return error ? Promise.reject(error) : Promise.resolve();
                },
              },
            ]}
          >
            <Input.TextArea
              rows={8}
              placeholder={`[{"key":"timezone","label":"时区","type":"select","default":"","options":[...]}]`}
              disabled={packageMode}
            />
          </Form.Item>
        </ProForm>
      </div>
    </FullPageContainer>
  );
};

export default AppHandle;
