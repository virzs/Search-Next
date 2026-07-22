import FullPageContainer from "@/components/containter/full";
import ProFormUpload from "@/components/pro-form/fields/upload";
import {
  getEnabledDesktopWallpaperCategories,
  getDesktopWallpaperPreviewUrl,
  type DesktopWallpaper,
} from "@/services/tabs/desktop/wallpaper";
import {
  createDesktopWallpaperCollection,
  getDesktopWallpaperCollectionDetail,
  previewDesktopWallpaperCollectionDynamic,
  updateDesktopWallpaperCollection,
  type DesktopWallpaperCollection,
} from "@/services/tabs/desktop/wallpaper-collection";
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
import { useRequest } from "ahooks";
import dayjs from "dayjs";
import { FC, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import WallpaperSelectModal from "./wallpaper-select-modal";

type CollectionFormValues = Omit<
  DesktopWallpaperCollection,
  "wallpapers" | "effectiveStart" | "effectiveEnd"
> & {
  wallpapers?: string[];
  effectiveRange?: [any, any];
};

const normalizeWallpaperIds = (input: unknown): string[] =>
  (Array.isArray(input) ? input : [])
    .map((item: any) =>
      typeof item === "string" ? item : (item?._id ?? item?.id),
    )
    .filter(Boolean);

const normalizeWallpaperRecords = (input: unknown): DesktopWallpaper[] =>
  (Array.isArray(input) ? input : []).filter(
    (item: any) => item && typeof item === "object" && item._id,
  );

const wallpaperPreviewStyle = (wallpaper: DesktopWallpaper) =>
  wallpaper.type === "gradient" && wallpaper.css
    ? { background: wallpaper.css }
    : undefined;

const pickIntervalUnitFromSec = (seconds?: number) => {
  const value = Number(seconds ?? 0) || 0;
  if (value > 0 && value % 86400 === 0)
    return { unit: "day" as const, value: value / 86400 };
  if (value > 0 && value % 3600 === 0)
    return { unit: "hour" as const, value: value / 3600 };
  if (value > 0 && value % 60 === 0)
    return { unit: "minute" as const, value: value / 60 };
  return { unit: "second" as const, value: value || 300 };
};

const DynamicWallpaperPreview: FC<{
  dynamic?: DesktopWallpaperCollection["dynamic"];
}> = ({ dynamic }) => {
  const payload = useMemo(() => ({ dynamic }), [dynamic]);
  const { data, loading } = useRequest(
    async () => {
      if (!payload.dynamic) return [];
      return (await previewDesktopWallpaperCollectionDynamic(
        payload,
      )) as DesktopWallpaper[];
    },
    {
      refreshDeps: [JSON.stringify(payload)],
      debounceWait: 300,
      ready: Boolean(payload.dynamic),
    },
  );
  const wallpapers = (data as DesktopWallpaper[]) ?? [];

  return (
    <div className="flex flex-col gap-2">
      <div className="text-xs text-gray-500">
        规则预览（最多 {dynamic?.limit ?? 200} 项）
      </div>
      {loading ? (
        <div className="text-sm text-gray-500">加载中...</div>
      ) : wallpapers.length ? (
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
          {wallpapers.slice(0, 12).map((wallpaper) => {
            const preview = getDesktopWallpaperPreviewUrl(wallpaper);
            return (
              <div
                key={wallpaper._id}
                className="overflow-hidden rounded-md border border-black/10"
              >
                <div className="aspect-video bg-black/5">
                  {wallpaper.type === "gradient" && wallpaper.css ? (
                    <div
                      className="h-full w-full"
                      style={wallpaperPreviewStyle(wallpaper)}
                    />
                  ) : preview ? (
                    <img
                      src={preview}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                </div>
                <div className="truncate px-2 py-1.5 text-xs">
                  {wallpaper.name || "未命名壁纸"}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-sm text-gray-500">暂无符合规则的壁纸</div>
      )}
    </div>
  );
};

const WallpaperCollectionHandle: FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { message } = App.useApp();
  const formRef = useRef<ProFormInstance<CollectionFormValues>>(null);
  const [selectOpen, setSelectOpen] = useState(false);
  const [selectedWallpapers, setSelectedWallpapers] = useState<
    DesktopWallpaper[]
  >([]);
  const [intervalUnit, setIntervalUnit] = useState<
    "second" | "minute" | "hour" | "day"
  >("second");
  const [intervalValue, setIntervalValue] = useState(300);

  const {
    data: detail,
    run: getDetail,
    loading,
  } = useRequest(getDesktopWallpaperCollectionDetail, { manual: true });
  const { data: categoryData } = useRequest(
    getEnabledDesktopWallpaperCategories,
  );

  useEffect(() => {
    if (id) getDetail(id);
  }, [id, getDetail]);

  useEffect(() => {
    if (!detail) return;
    const value = detail as DesktopWallpaperCollection;
    const interval = pickIntervalUnitFromSec(value.updateIntervalSec);
    setIntervalUnit(interval.unit);
    setIntervalValue(interval.value);
    setSelectedWallpapers(normalizeWallpaperRecords(value.wallpapers));
    formRef.current?.setFieldsValue({
      ...value,
      wallpapers: normalizeWallpaperIds(value.wallpapers),
      effectiveRange:
        value.effectiveStart || value.effectiveEnd
          ? [
              value.effectiveStart ? dayjs(value.effectiveStart) : null,
              value.effectiveEnd ? dayjs(value.effectiveEnd) : null,
            ]
          : undefined,
    });
  }, [detail]);

  useEffect(() => {
    const unitMap = { second: 1, minute: 60, hour: 3600, day: 86400 };
    const seconds = Math.max(
      1,
      Math.floor((Number(intervalValue) || 0) * unitMap[intervalUnit]),
    );
    formRef.current?.setFieldValue("updateIntervalSec", seconds);
  }, [intervalUnit, intervalValue]);

  const categoryOptions = useMemo(() => {
    const raw = (categoryData as any)?.data ?? categoryData ?? [];
    return (Array.isArray(raw) ? raw : [])
      .map((item: any) => ({ label: item.name, value: item._id }))
      .filter((item: any) => item.value);
  }, [categoryData]);

  return (
    <FullPageContainer loading={loading}>
      <div className="mx-auto max-w-5xl py-6">
        <ProForm<CollectionFormValues>
          {...baseFormItemLayout}
          formRef={formRef}
          initialValues={{
            enable: true,
            sort: 0,
            featured: false,
            layout: "story",
            itemLimit: 8,
            type: "static",
            updateIntervalSec: 300,
            dynamic: {
              wallpaperTypes: ["image", "gradient", "application"],
              sortBy: "createdAt",
              sortOrder: "desc",
              limit: 200,
            },
          }}
          submitter={{
            searchConfig: { submitText: "保存" },
            render: (_, dom) => (
              <div className="flex justify-center gap-2">{dom}</div>
            ),
          }}
          onFinish={async (values) => {
            const type = values.type ?? "static";
            const range = values.effectiveRange;
            const payload: DesktopWallpaperCollection = {
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
              dynamic: values.dynamic,
              updateIntervalSec: values.updateIntervalSec,
              wallpapers:
                type === "dynamic"
                  ? []
                  : normalizeWallpaperIds(values.wallpapers),
              effectiveStart: range?.[0]
                ? dayjs(range[0]).toISOString()
                : undefined,
              effectiveEnd: range?.[1]
                ? dayjs(range[1]).toISOString()
                : undefined,
            };
            if (id) {
              await updateDesktopWallpaperCollection(id, payload);
              message.success("修改成功");
            } else {
              await createDesktopWallpaperCollection(payload);
              message.success("新增成功");
            }
            navigate(-1);
            return true;
          }}
        >
          <ProFormText
            name="title"
            label="名称"
            rules={[{ required: true, message: "请输入名称" }]}
          />
          <ProFormText
            name="kicker"
            label="短标题"
            placeholder="例如 编辑精选 / Editor's Choice"
          />
          <ProFormTextArea name="description" label="简介" />
          <ProFormUpload
            name="cover"
            label="封面图"
            fieldProps={{
              dir: "wallpaper_collection_cover",
              accept: "image/*",
              maxCount: 1,
            }}
          />
          <ProFormColorPicker
            name="accentColor"
            label="强调色"
            formItemProps={{
              getValueFromEvent: (value: any) => value.toRgbString(),
            }}
            // @ts-ignore ProComponents 类型中缺少 format
            fieldProps={{ format: "rgb" }}
          />
          <ProFormSelect
            name="layout"
            label="展示样式"
            valueEnum={{ story: "大卡故事", compact: "紧凑列表" }}
            fieldProps={{ allowClear: false }}
          />
          <ProFormSwitch name="featured" label="推荐为大卡" />
          <ProFormDigit
            name="itemLimit"
            label="前台预览数量"
            fieldProps={{ precision: 0, min: 1, max: 20 }}
          />
          <ProFormDigit
            name="sort"
            label="排序"
            fieldProps={{ precision: 0, min: 0 }}
          />
          <ProFormSwitch name="enable" label="是否启用" />
          <ProFormDateRangePicker name="effectiveRange" label="生效时间范围" />
          <ProFormSelect
            name="type"
            label="合集类型"
            valueEnum={{
              static: "静态（手动绑定壁纸）",
              dynamic: "动态（按规则自动生成）",
            }}
            fieldProps={{ allowClear: false }}
          />

          <ProForm.Item shouldUpdate noStyle>
            {(form) => {
              const type = form.getFieldValue("type");
              if (type !== "dynamic") return null;
              const dynamic = form.getFieldValue("dynamic") || {};
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
                        onChange={(value) =>
                          setIntervalValue(Number(value ?? 0) || 0)
                        }
                        className="w-40"
                      />
                      <Select
                        value={intervalUnit}
                        onChange={setIntervalUnit}
                        className="w-28"
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
                    name={["dynamic", "wallpaperTypes"]}
                    label="壁纸类型"
                    fieldProps={{
                      mode: "multiple",
                      allowClear: true,
                      options: [
                        { label: "图片壁纸", value: "image" },
                        { label: "渐变壁纸", value: "gradient" },
                        { label: "网页壁纸", value: "application" },
                      ],
                    }}
                  />
                  <ProFormSelect
                    name={["dynamic", "categoryIds"]}
                    label="分类筛选"
                    fieldProps={{ mode: "multiple", options: categoryOptions }}
                  />
                  <ProFormSelect
                    name={["dynamic", "sortBy"]}
                    label="排序字段"
                    valueEnum={{
                      createdAt: "最近新增",
                      updatedAt: "最近更新",
                      sortOrder: "壁纸排序",
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
                  <ProForm.Item label="规则预览">
                    <DynamicWallpaperPreview dynamic={dynamic} />
                  </ProForm.Item>
                </>
              );
            }}
          </ProForm.Item>

          <ProForm.Item name="wallpapers" hidden>
            <div />
          </ProForm.Item>
          <ProForm.Item label="绑定壁纸" shouldUpdate>
            {(form) => {
              const type = form.getFieldValue("type");
              const ids = form.getFieldValue("wallpapers") || [];
              const visible = selectedWallpapers.filter(
                (wallpaper) => wallpaper._id && ids.includes(wallpaper._id),
              );
              return (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <Button
                      disabled={type === "dynamic"}
                      onClick={() => setSelectOpen(true)}
                    >
                      选择壁纸
                    </Button>
                    <Button
                      disabled={!ids.length}
                      onClick={() => {
                        setSelectedWallpapers([]);
                        formRef.current?.setFieldValue("wallpapers", []);
                      }}
                    >
                      清空
                    </Button>
                    <span className="text-xs text-gray-500">
                      {type === "dynamic"
                        ? "按规则自动生成壁纸"
                        : `已选择：${ids.length} 项`}
                    </span>
                  </div>
                  {visible.length ? (
                    <div className="flex flex-wrap gap-2">
                      {visible.map((wallpaper, index) => (
                        <Tag key={wallpaper._id} className="py-1">
                          {wallpaper.name || wallpaper._id}
                          <Button
                            type="link"
                            size="small"
                            className="px-1!"
                            disabled={index === 0}
                            onClick={() => {
                              const next = [...visible];
                              const [item] = next.splice(index, 1);
                              next.splice(index - 1, 0, item);
                              setSelectedWallpapers(next);
                              formRef.current?.setFieldValue(
                                "wallpapers",
                                next.map((value) => value._id),
                              );
                            }}
                          >
                            ↑
                          </Button>
                          <Button
                            type="link"
                            size="small"
                            className="px-1!"
                            disabled={index === visible.length - 1}
                            onClick={() => {
                              const next = [...visible];
                              const [item] = next.splice(index, 1);
                              next.splice(index + 1, 0, item);
                              setSelectedWallpapers(next);
                              formRef.current?.setFieldValue(
                                "wallpapers",
                                next.map((value) => value._id),
                              );
                            }}
                          >
                            ↓
                          </Button>
                        </Tag>
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            }}
          </ProForm.Item>
        </ProForm>

        <WallpaperSelectModal
          open={selectOpen}
          value={selectedWallpapers}
          onCancel={() => setSelectOpen(false)}
          onOk={(wallpapers) => {
            setSelectedWallpapers(wallpapers);
            formRef.current?.setFieldValue(
              "wallpapers",
              wallpapers.map((wallpaper) => wallpaper._id),
            );
            setSelectOpen(false);
          }}
        />
      </div>
    </FullPageContainer>
  );
};

export default WallpaperCollectionHandle;
