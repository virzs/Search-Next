import FullPageContainer from "@/components/containter/full";
import ProFormUpload from "@/components/pro-form/fields/upload";
import { baseFormItemLayout } from "@/utils/utils";
import {
  ProForm,
  ProFormColorPicker,
  ProFormDateRangePicker,
  ProFormDigit,
  ProFormInstance,
  ProFormSelect,
  ProFormSwitch,
  ProFormText,
  ProFormTextArea,
} from "@ant-design/pro-components";
import { App, Button, InputNumber, Select, Tag } from "antd";
import dayjs from "dayjs";
import { useRequest } from "ahooks";
import { FC, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  addAppCollection,
  getAppCollectionDetail,
  previewAppCollectionDynamic,
  updateAppCollection,
} from "@/services/tabs/app_collection";
import type { AppItem } from "@/services/tabs/app";
import { getAllAppClassify } from "@/services/tabs/app_classify";
import AppSelectModal from "./app-select-modal";

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
  apps?: string[];
  effectiveRange?: [any, any];
  type?: "static" | "dynamic";
  dynamic?: {
    classifyIds?: string[];
    sortBy?: "createdAt" | "updatedAt";
    sortOrder?: "asc" | "desc";
    limit?: number;
  };
  updateIntervalSec?: number;
};

const normalizeAppIds = (input: unknown): string[] => {
  const arr = Array.isArray(input) ? input : [];
  return arr
    .map((item: any) => {
      if (!item) return undefined;
      if (typeof item === "string") return item;
      return item?._id ?? item?.id;
    })
    .filter(Boolean);
};

const normalizeAppRecords = (input: unknown): AppItem[] => {
  const arr = Array.isArray(input) ? input : [];
  return arr.filter((item: any) => item && typeof item === "object" && typeof item._id === "string");
};

const supportsAppMode = (item: AppItem) =>
  Boolean(
    (item.configSnapshot?.supportAppMode as boolean | undefined) ??
      item.supportAppMode,
  );

const pickIntervalUnitFromSec = (sec?: number) => {
  const v = Number(sec ?? 0) || 0;
  if (v > 0 && v % 86400 === 0) return { unit: "day" as const, value: v / 86400 };
  if (v > 0 && v % 3600 === 0) return { unit: "hour" as const, value: v / 3600 };
  if (v > 0 && v % 60 === 0) return { unit: "minute" as const, value: v / 60 };
  return { unit: "second" as const, value: v || 300 };
};

const DynamicAppPreview: FC<{ dynamic?: CollectionFormValues["dynamic"] }> = ({ dynamic }) => {
  const payload = useMemo(() => ({ dynamic }), [dynamic]);
  const { data, loading } = useRequest(
    async () => {
      if (!payload.dynamic) return [];
      return (await previewAppCollectionDynamic(payload as any)) as any[];
    },
    {
      refreshDeps: [JSON.stringify(payload)],
      debounceWait: 300,
      ready: !!payload.dynamic,
    },
  );

  const list = ((data as AppItem[]) || []).filter(supportsAppMode);
  return (
    <div className="flex flex-col gap-2">
      <div className="text-xs text-gray-500">
        应用预览（前台仅展示支持应用模式的项目）
      </div>
      {loading ? (
        <div className="text-sm text-gray-500">加载中...</div>
      ) : list.length ? (
        <div className="flex flex-wrap gap-2">
          {list.slice(0, 30).map((w: any) => (
            <Tag key={w?._id}>{w?.name ?? w?._id}</Tag>
          ))}
          {list.length > 30 ? <div className="text-xs text-gray-500 self-center">等 {list.length} 个</div> : null}
        </div>
      ) : (
        <div className="text-sm text-gray-500">暂无符合规则的应用</div>
      )}
    </div>
  );
};

const AppCollectionHandle: FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { message } = App.useApp();
  const ref = useRef<ProFormInstance<CollectionFormValues>>(null);
  const [appSelectOpen, setAppSelectOpen] = useState(false);
  const [selectedApps, setSelectedApps] = useState<AppItem[]>([]);
  const [intervalUnit, setIntervalUnit] = useState<"second" | "minute" | "hour" | "day">("second");
  const [intervalValue, setIntervalValue] = useState<number>(300);

  const { data: detailData, run: detailRun, loading: detailLoading } = useRequest(getAppCollectionDetail, {
    manual: true,
  });
  const { data: classifyOptionsData } = useRequest(getAllAppClassify);

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
    setSelectedApps(normalizeAppRecords((detailData as any)?.apps));
    ref.current?.setFieldsValue({
      ...(detailData as any),
      apps: normalizeAppIds((detailData as any)?.apps),
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
    [],
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

  const classifyOptions = useMemo(() => {
    const raw = (classifyOptionsData as any)?.data ?? classifyOptionsData ?? [];
    return (Array.isArray(raw) ? raw : []).map((item: any) => ({
      label: item?.name,
      value: item?._id,
    })).filter((item: any) => item.value);
  }, [classifyOptionsData]);

  return (
    <FullPageContainer loading={detailLoading}>
      <div className="max-w-5xl mx-auto py-6">
        <ProForm<CollectionFormValues>
          {...baseFormItemLayout}
          formRef={ref}
          initialValues={initialValues}
          submitter={{
            searchConfig: { submitText: "保存" },
            render: (_: any, dom: any) => <div className="flex items-center justify-center gap-2">{dom}</div>,
          }}
          onFinish={async (values) => {
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
              apps: type === "dynamic" ? [] : normalizeAppIds(values.apps),
              effectiveStart: range?.[0] ? dayjs(range[0]).toISOString() : undefined,
              effectiveEnd: range?.[1] ? dayjs(range[1]).toISOString() : undefined,
            };

            if (id) {
              await updateAppCollection(id, payload);
              message.success("修改成功");
            } else {
              await addAppCollection(payload);
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
            fieldProps={{ dir: "app_collection_cover", accept: "image/*", maxCount: 1 }}
          />
          <ProFormColorPicker
            name="accentColor"
            label="强调色"
            formItemProps={{ getValueFromEvent: (e: any) => e.toRgbString() }}
            // @ts-ignore 类型中缺少 format 属性,但实际运行时存在
            fieldProps={{ format: "rgb" }}
          />
          <ProFormSelect
            name="layout"
            label="展示样式"
            valueEnum={{ story: "大卡故事", compact: "紧凑列表" }}
            fieldProps={{ allowClear: false }}
          />
          <ProFormSwitch name="featured" label="推荐为应用大卡" />
          <ProFormDigit name="itemLimit" label="前台合集预览数量" fieldProps={{ precision: 0, min: 1, max: 20 }} />
          <ProFormDigit name="sort" label="排序" fieldProps={{ precision: 0, min: 0 }} />
          <ProFormSwitch name="enable" label="是否启用" />
          <ProFormDateRangePicker name="effectiveRange" label="生效时间范围" />
          <ProFormSelect
            name="type"
            label="合集类型"
            valueEnum={{
              static: "静态（手动绑定应用）",
              dynamic: "动态（按分类自动生成应用）",
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
                    </div>
                  </ProForm.Item>
                  <ProFormSelect
                    name={["dynamic", "classifyIds"]}
                    label="应用分类筛选"
                    fieldProps={{
                      mode: "multiple",
                      options: classifyOptions,
                    }}
                  />
                  <ProFormSelect
                    name={["dynamic", "sortBy"]}
                    label="排序字段"
                    valueEnum={{ createdAt: "最近新增", updatedAt: "最近更新" }}
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
                  <ProForm.Item label="规则预览">
                    <DynamicAppPreview dynamic={dynamic} />
                  </ProForm.Item>
                </>
              );
            }}
          </ProForm.Item>
          <ProForm.Item name="apps" hidden>
            <div />
          </ProForm.Item>
          <ProForm.Item label="绑定应用" shouldUpdate>
            {(form: any) => {
              const type = form.getFieldValue("type") as CollectionFormValues["type"];
              const ids = (form.getFieldValue("apps") as string[] | undefined) || [];
              const tags = selectedApps
                .filter((w) => w._id && ids.includes(w._id))
                .map((w, index) => (
                  <Tag key={w._id} className="py-1">
                    {w?.name ?? w?._id}
                    <Button
                      type="link"
                      size="small"
                      className="px-1!"
                      disabled={index === 0}
                      onClick={() => {
                        const next = [...selectedApps];
                        const [item] = next.splice(index, 1);
                        next.splice(index - 1, 0, item);
                        setSelectedApps(next);
                        ref.current?.setFieldValue("apps", next.map((w) => w._id));
                      }}
                    >
                      ↑
                    </Button>
                    <Button
                      type="link"
                      size="small"
                      className="px-1!"
                      disabled={index === selectedApps.length - 1}
                      onClick={() => {
                        const next = [...selectedApps];
                        const [item] = next.splice(index, 1);
                        next.splice(index + 1, 0, item);
                        setSelectedApps(next);
                        ref.current?.setFieldValue("apps", next.map((w) => w._id));
                      }}
                    >
                      ↓
                    </Button>
                  </Tag>
                ));

              return (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Button onClick={() => setAppSelectOpen(true)} disabled={type === "dynamic"}>
                      选择应用
                    </Button>
                    <Button
                      onClick={() => {
                        setSelectedApps([]);
                        ref.current?.setFieldValue("apps", []);
                      }}
                      disabled={!ids.length}
                    >
                      清空
                    </Button>
                    <div className="text-xs text-gray-500">
                      {type === "dynamic" ? "按规则自动生成应用" : `已选择：${ids.length} 项`}
                    </div>
                  </div>
                  {tags.length ? <div className="flex flex-wrap gap-2">{tags}</div> : null}
                </div>
              );
            }}
          </ProForm.Item>
        </ProForm>

        <AppSelectModal
          open={appSelectOpen}
          value={selectedApps}
          title="绑定应用"
          okText="确定"
          onCancel={() => setAppSelectOpen(false)}
          onOk={async (apps) => {
            setSelectedApps(apps);
            ref.current?.setFieldValue("apps", apps.map((w) => w._id));
            setAppSelectOpen(false);
          }}
        />
      </div>
    </FullPageContainer>
  );
};

export default AppCollectionHandle;
