import FormPageContainer, {
  FormPageActions,
} from "@/components/containter/form";
import { baseFormItemLayout } from "@/utils/utils";
import { ProForm, ProFormColorPicker, ProFormDateRangePicker, ProFormDigit, ProFormInstance, ProFormSelect, ProFormSwitch, ProFormText, ProFormTextArea } from "@ant-design/pro-components";
import ProFormUpload from "@/components/pro-form/fields/upload";
import { App, Button, InputNumber, Select, Tag, Tree } from "antd";
import dayjs from "dayjs";
import { useRequest } from "ahooks";
import { FC, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { addWebsiteCollection, getWebsiteCollectionDetail, previewWebsiteCollectionDynamic, updateWebsiteCollection } from "@/services/tabs/website_collection";
import WebsiteSelectModal from "@/views/tabs/desktop/desktop-config/components/website-select-modal";
import type { Website } from "@/services/tabs/website_classifty";
import { getWebsiteClassifyTree } from "@/services/tabs/website_classifty";

type CollectionFormValues = {
  title: string;
  description?: string;
  kicker?: string;
  cover?: any;
  accentColor?: string;
  layout?: "story" | "compact";
  featured?: boolean;
  itemLimit?: number;
  enable?: boolean;
  sort?: number;
  websites?: string[];
  effectiveRange?: [any, any];
  type?: "static" | "dynamic";
  dynamic?: {
    classifyIds?: string[];
    sortBy?: "createdAt" | "updatedAt" | "click";
    sortOrder?: "asc" | "desc";
    limit?: number;
  };
  updateIntervalSec?: number;
};

const normalizeWebsiteIds = (input: unknown): string[] => {
  const arr = Array.isArray(input) ? input : [];
  return arr
    .map((item: any) => {
      if (!item) return undefined;
      if (typeof item === "string") return item;
      return item?._id ?? item?.id;
    })
    .filter(Boolean);
};

const normalizeWebsiteRecords = (input: unknown): Website[] => {
  const arr = Array.isArray(input) ? input : [];
  return arr.filter((item: any) => item && typeof item === "object" && typeof item._id === "string");
};

const pickIntervalUnitFromSec = (sec?: number) => {
  const v = Number(sec ?? 0) || 0;
  if (v > 0 && v % 86400 === 0) return { unit: "day" as const, value: v / 86400 };
  if (v > 0 && v % 3600 === 0) return { unit: "hour" as const, value: v / 3600 };
  if (v > 0 && v % 60 === 0) return { unit: "minute" as const, value: v / 60 };
  return { unit: "second" as const, value: v || 300 };
};

const DynamicWebsitePreview: FC<{ dynamic?: CollectionFormValues["dynamic"] }> = (props) => {
  const { dynamic } = props;
  const payload = useMemo(() => ({ dynamic }), [dynamic]);
  const { data, loading } = useRequest(
    async () => {
      if (!payload.dynamic) return [];
      return (await previewWebsiteCollectionDynamic(payload as any)) as any[];
    },
    {
      refreshDeps: [JSON.stringify(payload)],
      debounceWait: 300,
      ready: !!payload.dynamic,
    }
  );

  const list = (data as any[]) || [];

  return (
    <div className="flex flex-col gap-2">
      <div className="text-xs text-gray-500">预览（最多 {dynamic?.limit ?? 200} 条）</div>
      {loading ? (
        <div className="text-sm text-gray-500">加载中...</div>
      ) : list.length ? (
        <div className="flex flex-wrap gap-2">
          {list.slice(0, 30).map((w: any) => (
            <Tag key={w?._id ?? w?.url}>{w?.name ?? w?._id ?? w?.url}</Tag>
          ))}
          {list.length > 30 ? <div className="text-xs text-gray-500 self-center">等 {list.length} 个</div> : null}
        </div>
      ) : (
        <div className="text-sm text-gray-500">暂无符合规则的网站</div>
      )}
    </div>
  );
};

const WebsiteCollectionHandle: FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { message } = App.useApp();
  const ref = useRef<ProFormInstance<CollectionFormValues>>(null);
  const [websiteSelectOpen, setWebsiteSelectOpen] = useState(false);
  const [selectedWebsites, setSelectedWebsites] = useState<Website[]>([]);
  const [intervalUnit, setIntervalUnit] = useState<"second" | "minute" | "hour" | "day">("second");
  const [intervalValue, setIntervalValue] = useState<number>(300);

  const { data: detailData, run: detailRun, loading: detailLoading } = useRequest(getWebsiteCollectionDetail, {
    manual: true,
  });

  const { data: classifyTree = [] } = useRequest(getWebsiteClassifyTree);

  useEffect(() => {
    if (id) detailRun(id);
  }, [id]);

  useEffect(() => {
    if (!detailData) return;
    const start = (detailData as any)?.effectiveStart;
    const end = (detailData as any)?.effectiveEnd;
    const { unit, value } = pickIntervalUnitFromSec((detailData as any)?.updateIntervalSec);
    setIntervalUnit(unit);
    setIntervalValue(value);
    setSelectedWebsites(normalizeWebsiteRecords((detailData as any)?.websites));
    ref.current?.setFieldsValue({
      ...(detailData as any),
      websites: normalizeWebsiteIds((detailData as any)?.websites),
      effectiveRange: start || end ? [start ? dayjs(start) : null, end ? dayjs(end) : null] : undefined,
    });

  }, [detailData]);

  const initialValues = useMemo(
    () => ({
      enable: true,
      sort: 0,
      featured: false,
      layout: "story" as const,
      itemLimit: 8,
      type: "static" as const,
      updateIntervalSec: 300,
      dynamic: {
        sortBy: "createdAt" as const,
        sortOrder: "desc" as const,
        limit: 200,
      },
    }),
    []
  );

  useEffect(() => {
    const unitMap = {
      second: 1,
      minute: 60,
      hour: 3600,
      day: 86400,
    } as const;
    const sec = Math.max(1, Math.floor((Number(intervalValue) || 0) * unitMap[intervalUnit]));
    ref.current?.setFieldValue("updateIntervalSec", sec);
  }, [intervalUnit, intervalValue]);

  return (
    <FormPageContainer form={ref} loading={detailLoading}>
      <div className="max-w-5xl mx-auto py-6">
        <ProForm<CollectionFormValues>
          {...baseFormItemLayout}
          formRef={ref}
          initialValues={initialValues}
          submitter={{
            searchConfig: { submitText: "保存" },
            render: (_: any, dom: any) => <FormPageActions>{dom}</FormPageActions>,
          }}
          onFinish={async (values: CollectionFormValues) => {
            const range = values.effectiveRange;
            const type = values.type ?? "static";
            const payload: any = {
              title: values.title,
              description: values.description,
              kicker: values.kicker,
              cover: values.cover,
              accentColor: values.accentColor,
              layout: values.layout,
              featured: values.featured ?? false,
              itemLimit: values.itemLimit ?? 8,
              enable: values.enable ?? true,
              sort: values.sort ?? 0,
              type,
              updateIntervalSec: values.updateIntervalSec,
              dynamic: values.dynamic,
              websites: type === "dynamic" ? [] : normalizeWebsiteIds(values.websites),
              effectiveStart: range?.[0] ? dayjs(range[0]).toISOString() : undefined,
              effectiveEnd: range?.[1] ? dayjs(range[1]).toISOString() : undefined,
            };

            if (id) {
              await updateWebsiteCollection(id, payload);
              message.success("修改成功");
            } else {
              await addWebsiteCollection(payload);
              message.success("新增成功");
            }

            navigate(-1);
            return true;
          }}
        >
          <ProFormText name="title" label="名称" rules={[{ required: true, message: "请输入名称" }]} />
          <ProFormText name="kicker" label="短标题" placeholder="例如 编辑精选 / Editor's Choice" />
          <ProFormTextArea name="description" label="简介" />
          <ProFormUpload
            name="cover"
            label="封面图"
            fieldProps={{ dir: "website_collection_cover", accept: "image/*", maxCount: 1 }}
          />
          <ProFormColorPicker
            name="accentColor"
            label="强调色"
            formItemProps={{
              getValueFromEvent: (e: any) => e.toRgbString(),
            }}
            // @ts-ignore 类型中缺少 format 属性,但实际运行时存在
            fieldProps={{ format: "rgb" }}
          />
          <ProFormSelect
            name="layout"
            label="展示样式"
            valueEnum={{ story: "大卡故事", compact: "紧凑列表" }}
            fieldProps={{ allowClear: false }}
          />
          <ProFormSwitch name="featured" label="推荐为大卡" />
          <ProFormDigit name="itemLimit" label="前台预览数量" fieldProps={{ precision: 0, min: 1, max: 20 }} />
          <ProFormDigit name="sort" label="排序" fieldProps={{ precision: 0, min: 0 }} />
          <ProFormSwitch name="enable" label="是否启用" />
          <ProFormDateRangePicker name="effectiveRange" label="生效时间范围" />
          <ProFormSelect
            name="type"
            label="合集类型"
            valueEnum={{
              static: "静态（手动绑定网站）",
              dynamic: "动态（按规则自动生成）",
            }}
            fieldProps={{ allowClear: false }}
          />
          <ProForm.Item shouldUpdate noStyle>
            {(form: any) => {
              const type = form.getFieldValue("type") as CollectionFormValues["type"];
              if (type !== "dynamic") return null;
              const dynamic = (form.getFieldValue("dynamic") as CollectionFormValues["dynamic"]) || {};
              return (
                <>
                  <ProForm.Item name="updateIntervalSec" hidden>
                    <div />
                  </ProForm.Item>
                  <ProForm.Item label="更新频率">
                    <div className="flex items-center gap-2">
                      <InputNumber
                        min={1}
                        precision={0}
                        value={intervalValue}
                        onChange={(v) => setIntervalValue(Number(v ?? 0) || 0)}
                        style={{ width: 160 }}
                      />
                      <Select
                        value={intervalUnit}
                        style={{ width: 120 }}
                        onChange={(v) => setIntervalUnit(v)}
                        options={[
                          { label: "秒", value: "second" },
                          { label: "分钟", value: "minute" },
                          { label: "小时", value: "hour" },
                          { label: "天", value: "day" },
                        ]}
                      />
                      <div className="text-xs text-gray-500">
                        {Math.max(1, Math.floor((Number(intervalValue) || 0) * (intervalUnit === "second" ? 1 : intervalUnit === "minute" ? 60 : intervalUnit === "hour" ? 3600 : 86400)))} 秒
                      </div>
                    </div>
                  </ProForm.Item>
                  <ProFormSelect
                    name={["dynamic", "sortBy"]}
                    label="排序字段"
                    valueEnum={{
                      createdAt: "最近新增",
                      updatedAt: "最近更新",
                      click: "点击排行",
                    }}
                    fieldProps={{ allowClear: false }}
                  />
                  <ProFormSelect
                    name={["dynamic", "sortOrder"]}
                    label="排序方向"
                    valueEnum={{ desc: "降序", asc: "升序" }}
                    fieldProps={{ allowClear: false }}
                  />
                  <ProFormDigit
                    name={["dynamic", "limit"]}
                    label="最大数量"
                    fieldProps={{ precision: 0, min: 1, max: 5000 }}
                  />
                  <ProForm.Item label="分类筛选" name={["dynamic", "classifyIds"]}>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <Button
                          size="small"
                          disabled={!((form.getFieldValue(["dynamic", "classifyIds"]) as string[] | undefined) || []).length}
                          onClick={() => form.setFieldValue(["dynamic", "classifyIds"], [])}
                        >
                          清空
                        </Button>
                      </div>
                      <div className="border rounded p-2 max-h-80 overflow-auto">
                        <Tree
                          checkable
                          selectable={false}
                          fieldNames={{ title: "name", key: "_id", children: "children" }}
                          treeData={classifyTree as any}
                          checkedKeys={(form.getFieldValue(["dynamic", "classifyIds"]) as string[] | undefined) || []}
                          onCheck={(checkedKeys: any) => {
                            const keys = Array.isArray(checkedKeys) ? checkedKeys : checkedKeys?.checked || [];
                            form.setFieldValue(["dynamic", "classifyIds"], keys);
                          }}
                        />
                      </div>
                    </div>
                  </ProForm.Item>
                  <ProForm.Item label="规则预览">
                    <DynamicWebsitePreview dynamic={dynamic} />
                  </ProForm.Item>
                </>
              );
            }}
          </ProForm.Item>
          <ProForm.Item name="websites" hidden>
            <div />
          </ProForm.Item>
          <ProForm.Item label="绑定网站" shouldUpdate>
            {(form: any) => {
              const type = form.getFieldValue("type") as CollectionFormValues["type"];
              const ids = (form.getFieldValue("websites") as string[] | undefined) || [];
              const tags = selectedWebsites
                .filter((w) => ids.includes(w._id))
                .map((w, index) => (
                  <Tag key={w._id} className="py-1">
                    {w?.name ?? w?._id}
                    <Button
                      type="link"
                      size="small"
                      className="px-1!"
                      disabled={index === 0}
                      onClick={() => {
                        const next = [...selectedWebsites];
                        const [item] = next.splice(index, 1);
                        next.splice(index - 1, 0, item);
                        setSelectedWebsites(next);
                        ref.current?.setFieldValue("websites", next.map((w) => w._id));
                      }}
                    >
                      ↑
                    </Button>
                    <Button
                      type="link"
                      size="small"
                      className="px-1!"
                      disabled={index === selectedWebsites.length - 1}
                      onClick={() => {
                        const next = [...selectedWebsites];
                        const [item] = next.splice(index, 1);
                        next.splice(index + 1, 0, item);
                        setSelectedWebsites(next);
                        ref.current?.setFieldValue("websites", next.map((w) => w._id));
                      }}
                    >
                      ↓
                    </Button>
                  </Tag>
                ));

              return (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Button onClick={() => setWebsiteSelectOpen(true)} disabled={type === "dynamic"}>
                      选择网站
                    </Button>
                    <Button
                      onClick={() => {
                        setSelectedWebsites([]);
                        ref.current?.setFieldValue("websites", []);
                      }}
                      disabled={!ids.length}
                    >
                      清空
                    </Button>
                    <div className="text-xs text-gray-500">
                      {type === "dynamic" ? "动态规则自动生成" : `已选择：${ids.length} 项`}
                    </div>
                  </div>
                  {tags.length ? <div className="flex flex-wrap gap-2">{tags}</div> : null}
                </div>
              );
            }}
          </ProForm.Item>
        </ProForm>

        <WebsiteSelectModal
          open={websiteSelectOpen}
          value={selectedWebsites}
          title="绑定网站"
          okText="确定"
          onCancel={() => setWebsiteSelectOpen(false)}
          onOk={async (websites) => {
            setSelectedWebsites(websites);
            ref.current?.setFieldValue("websites", websites.map((w) => w._id));
            setWebsiteSelectOpen(false);
          }}
        />
      </div>
    </FormPageContainer>
  );
};

export default WebsiteCollectionHandle;
