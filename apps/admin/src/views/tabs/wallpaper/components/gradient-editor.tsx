import { useSize } from "ahooks";
import {
  DeleteOutlined,
  HolderOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS as DndCss } from "@dnd-kit/utilities";
import { Alert, Button, Collapse, Input, Tag, Tooltip, Typography } from "antd";
import { useEffect, useMemo, useRef, useState } from "react";
import ColorPicker, {
  type Styles as GradientPickerStyles,
} from "react-best-gradient-color-picker";
import {
  isSafeGradientCss,
  mergePickerGradient,
  parseGradientLayer,
  splitGradientLayers,
  toPickerGradient,
} from "./gradient-utils";
import "./gradient-editor.css";

const DEFAULT_VISUAL_GRADIENT =
  "linear-gradient(135deg, rgba(52, 199, 89, 1) 0%, rgba(10, 132, 255, 1) 100%)";
const DEFAULT_NEW_LAYER =
  "radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0) 70%)";

const GRADIENT_PRESETS = [
  {
    name: "海风",
    value:
      "linear-gradient(135deg, rgba(50, 173, 230, 1) 0%, rgba(48, 209, 88, 1) 100%)",
  },
  {
    name: "落日",
    value:
      "linear-gradient(135deg, rgba(255, 159, 10, 1) 0%, rgba(255, 55, 95, 1) 100%)",
  },
  {
    name: "紫霞",
    value:
      "linear-gradient(135deg, rgba(191, 90, 242, 1) 0%, rgba(94, 92, 230, 1) 100%)",
  },
  {
    name: "森林",
    value:
      "linear-gradient(145deg, rgba(48, 209, 88, 1) 0%, rgba(0, 122, 255, 1) 100%)",
  },
  {
    name: "晨光",
    value:
      "radial-gradient(circle, rgba(255, 214, 10, 1) 0%, rgba(255, 159, 10, 1) 45%, rgba(255, 55, 95, 1) 100%)",
  },
  {
    name: "薄荷",
    value:
      "radial-gradient(circle, rgba(172, 255, 232, 1) 0%, rgba(90, 200, 250, 1) 100%)",
  },
  {
    name: "雾白",
    value:
      "linear-gradient(135deg, rgba(250, 250, 252, 1) 0%, rgba(210, 210, 218, 1) 100%)",
  },
  {
    name: "深夜",
    value:
      "linear-gradient(135deg, rgba(28, 28, 35, 1) 0%, rgba(44, 43, 91, 1) 55%, rgba(10, 80, 130, 1) 100%)",
  },
] as const;

const COLOR_PRESETS = [
  "rgba(255, 59, 48, 1)",
  "rgba(255, 149, 0, 1)",
  "rgba(255, 204, 0, 1)",
  "rgba(52, 199, 89, 1)",
  "rgba(0, 199, 190, 1)",
  "rgba(50, 173, 230, 1)",
  "rgba(0, 122, 255, 1)",
  "rgba(88, 86, 214, 1)",
  "rgba(175, 82, 222, 1)",
  "rgba(255, 45, 85, 1)",
  "rgba(142, 142, 147, 1)",
  "rgba(28, 28, 30, 1)",
];

const pickerStyles: GradientPickerStyles = {
  body: {
    padding: 0,
    background: "transparent",
    boxShadow: "none",
    color: "var(--ant-color-text)",
  },
  rbgcpControlBtnWrapper: {
    background: "var(--ant-color-fill-tertiary)",
    borderRadius: 6,
  },
  rbgcpControlBtn: {
    color: "var(--ant-color-text-secondary)",
  },
  rbgcpControlBtnSelected: {
    color: "var(--ant-color-primary)",
  },
  rbgcpControlInput: {
    color: "var(--ant-color-text)",
    background: "var(--ant-color-bg-container)",
    borderColor: "var(--ant-color-border)",
  },
  rbgcpInput: {
    color: "var(--ant-color-text)",
    background: "var(--ant-color-bg-container)",
    borderColor: "var(--ant-color-border)",
  },
  rbgcpColorModelDropdown: {
    color: "var(--ant-color-text)",
    background: "var(--ant-color-bg-container)",
  },
};

const getLayerTypeLabel = (type?: string) => {
  if (type === "linear-gradient") return "线性";
  if (type === "radial-gradient") return "径向";
  if (type === "conic-gradient") return "锥形";
  if (type?.startsWith("repeating-")) return "重复";
  return "渐变";
};

interface SortableGradientLayerProps {
  id: string;
  index: number;
  layer: string;
  selected: boolean;
  typeLabel: string;
  onSelect: () => void;
}

const SortableGradientLayer = ({
  id,
  index,
  layer,
  selected,
  typeLabel,
  onSelect,
}: SortableGradientLayerProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      className="flex min-w-0 items-center rounded-lg border outline-none transition-[border-color,background-color,box-shadow,opacity] duration-150"
      style={{
        transform: DndCss.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 2 : undefined,
        opacity: isDragging ? 0.82 : 1,
        borderColor: selected ? "var(--ant-color-primary)" : "transparent",
        backgroundColor: selected
          ? "var(--ant-color-primary-bg)"
          : "transparent",
        boxShadow: isDragging ? "0 10px 28px rgba(0, 0, 0, 0.16)" : undefined,
      }}
    >
      <button
        type="button"
        aria-pressed={selected}
        className="flex min-w-0 flex-1 items-center gap-2 rounded-l-lg border-0 bg-transparent p-1.5 text-left outline-none transition-[background-color,transform] duration-150 hover:bg-[var(--ant-color-fill-secondary)] active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--ant-color-primary-border)] motion-reduce:transform-none motion-reduce:transition-none"
        onClick={onSelect}
      >
        <span
          aria-hidden
          className="h-9 w-11 shrink-0 rounded-md border border-[var(--ant-color-border-secondary)] bg-[length:100%_100%] shadow-sm"
          style={{
            backgroundColor: "var(--ant-color-fill-tertiary)",
            backgroundImage: `${layer}, linear-gradient(135deg, #f2f2f7 25%, #d1d1d6 25%, #d1d1d6 50%, #f2f2f7 50%, #f2f2f7 75%, #d1d1d6 75%)`,
          }}
        />
        <span className="min-w-0">
          <span className="block truncate text-sm font-medium text-[var(--ant-color-text)]">
            图层 {index + 1}
          </span>
          <span className="block text-xs text-[var(--ant-color-text-secondary)]">
            {typeLabel}
          </span>
        </span>
      </button>
      <Tooltip title="拖拽排序">
        <button
          type="button"
          className="mr-1 flex h-8 w-7 touch-none cursor-grab items-center justify-center rounded-md border-0 bg-transparent text-[var(--ant-color-text-tertiary)] outline-none transition-colors hover:bg-[var(--ant-color-fill-secondary)] hover:text-[var(--ant-color-text)] active:cursor-grabbing focus-visible:ring-2 focus-visible:ring-[var(--ant-color-primary-border)]"
          {...attributes}
          {...listeners}
          aria-label={`拖动图层 ${index + 1} 排序`}
        >
          <HolderOutlined />
        </button>
      </Tooltip>
    </div>
  );
};

const moveSelectedLayerIndex = (
  selectedIndex: number,
  oldIndex: number,
  newIndex: number,
) => {
  if (selectedIndex === oldIndex) return newIndex;
  if (
    oldIndex < newIndex &&
    selectedIndex > oldIndex &&
    selectedIndex <= newIndex
  ) {
    return selectedIndex - 1;
  }
  if (
    newIndex < oldIndex &&
    selectedIndex >= newIndex &&
    selectedIndex < oldIndex
  ) {
    return selectedIndex + 1;
  }
  return selectedIndex;
};

interface GradientEditorProps {
  value?: string;
  onChange?: (value: string) => void;
}

const GradientEditor = ({ value, onChange }: GradientEditorProps) => {
  const initializedRef = useRef(false);
  const pickerContainerRef = useRef<HTMLDivElement>(null);
  const pickerContainerSize = useSize(pickerContainerRef);
  const [selectedLayerIndex, setSelectedLayerIndex] = useState(0);
  const css =
    value === undefined ? DEFAULT_VISUAL_GRADIENT : String(value).trim();
  const isValid = isSafeGradientCss(css);
  const layers = useMemo(
    () => (isValid ? splitGradientLayers(css) : []),
    [css, isValid],
  );
  const parsedLayers = useMemo(
    () => layers.map((layer) => parseGradientLayer(layer)),
    [layers],
  );
  const layerIds = useMemo(
    () => layers.map((_, index) => `gradient-layer-${index}`),
    [layers],
  );
  const activeLayerIndex = Math.min(
    selectedLayerIndex,
    Math.max(0, layers.length - 1),
  );
  const activeLayer = parsedLayers[activeLayerIndex] ?? null;
  const pickerValue = activeLayer ? toPickerGradient(activeLayer) : null;
  const pickerWidth = Math.max(
    250,
    Math.min(380, Math.floor(pickerContainerSize?.width ?? 340)),
  );
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const applyPresetToActiveLayer = (presetValue: string) => {
    if (!isValid || layers.length === 0) {
      onChange?.(presetValue);
      return;
    }
    const nextLayers = [...layers];
    nextLayers[activeLayerIndex] = presetValue;
    onChange?.(nextLayers.join(", "));
  };

  const addLayer = () => {
    if (!isValid || layers.length === 0) return;
    const nextLayers = [...layers];
    nextLayers.splice(activeLayerIndex, 0, DEFAULT_NEW_LAYER);
    setSelectedLayerIndex(activeLayerIndex);
    onChange?.(nextLayers.join(", "));
  };

  const removeActiveLayer = () => {
    if (layers.length <= 1) return;
    const nextLayers = [...layers];
    nextLayers.splice(activeLayerIndex, 1);
    setSelectedLayerIndex(Math.min(activeLayerIndex, nextLayers.length - 1));
    onChange?.(nextLayers.join(", "));
  };

  const selectDraggedLayer = ({ active }: DragStartEvent) => {
    const index = layerIds.indexOf(String(active.id));
    if (index >= 0) setSelectedLayerIndex(index);
  };

  const reorderLayers = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const oldIndex = layerIds.indexOf(String(active.id));
    const newIndex = layerIds.indexOf(String(over.id));
    if (oldIndex < 0 || newIndex < 0) return;
    setSelectedLayerIndex((currentIndex) =>
      moveSelectedLayerIndex(currentIndex, oldIndex, newIndex),
    );
    onChange?.(arrayMove(layers, oldIndex, newIndex).join(", "));
  };

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    if (!value) onChange?.(DEFAULT_VISUAL_GRADIENT);
  }, [onChange, value]);

  useEffect(() => {
    if (selectedLayerIndex !== activeLayerIndex) {
      setSelectedLayerIndex(activeLayerIndex);
    }
  }, [activeLayerIndex, selectedLayerIndex]);

  const advancedItems = useMemo(
    () => [
      {
        key: "css",
        label: "高级 CSS",
        children: (
          <Input.TextArea
            value={value || ""}
            rows={6}
            maxLength={4000}
            showCount
            spellCheck={false}
            placeholder="linear-gradient(135deg, #34c759 0%, #0a84ff 100%)"
            onChange={(event) => onChange?.(event.target.value)}
          />
        ),
      },
    ],
    [onChange, value],
  );

  return (
    <div className="w-full min-w-0 overflow-hidden rounded-xl border border-[var(--ant-color-border-secondary)] bg-[var(--ant-color-bg-container)] shadow-sm">
      <div className="flex min-h-12 items-center justify-between gap-3 px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            aria-hidden
            className="h-2.5 w-2.5 shrink-0 rounded-full bg-[var(--ant-color-success)] shadow-[0_0_0_3px_var(--ant-color-success-bg)]"
          />
          <Typography.Text strong>渐变编辑器</Typography.Text>
          <Typography.Text
            className="hidden text-xs sm:inline"
            type="secondary"
          >
            可视化工作区
          </Typography.Text>
        </div>
        <Tag className="m-0" variant="filled">
          {isValid ? `${layers.length} 个图层` : "待配置"}
        </Tag>
      </div>

      <div className="overflow-x-auto">
        <div
          className="grid min-w-[770px] gap-px border-t border-[var(--ant-color-border-secondary)] bg-[var(--ant-color-border-secondary)]"
          style={{
            gridTemplateAreas: '"layers preview inspector"',
            gridTemplateColumns: "180px minmax(250px, 1fr) 340px",
          }}
        >
          <aside
            className="min-w-0 bg-[var(--ant-color-fill-quaternary)] p-3"
            style={{ gridArea: "layers" }}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <Typography.Text strong>图层</Typography.Text>
                <div className="mt-0.5 text-xs text-[var(--ant-color-text-secondary)]">
                  从上到下叠放
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-0.5">
                <Tooltip title="在当前图层上方添加">
                  <Button
                    type="text"
                    size="small"
                    aria-label="添加图层"
                    icon={<PlusOutlined />}
                    disabled={!isValid}
                    onClick={addLayer}
                  />
                </Tooltip>
                <Tooltip
                  title={
                    layers.length === 1 ? "至少保留一个图层" : "删除当前图层"
                  }
                >
                  <span>
                    <Button
                      danger
                      type="text"
                      size="small"
                      aria-label="删除当前图层"
                      icon={<DeleteOutlined />}
                      disabled={layers.length <= 1}
                      onClick={removeActiveLayer}
                    />
                  </span>
                </Tooltip>
              </div>
            </div>

            {isValid && layers.length > 0 ? (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={selectDraggedLayer}
                onDragEnd={reorderLayers}
              >
                <SortableContext
                  items={layerIds}
                  strategy={verticalListSortingStrategy}
                >
                  <div
                    className="mt-3 flex max-h-[310px] flex-col gap-1.5 overflow-y-auto pr-0.5"
                    role="group"
                    aria-label="渐变图层"
                  >
                    {layers.map((layer, index) => (
                      <SortableGradientLayer
                        key={layerIds[index]}
                        id={layerIds[index]}
                        index={index}
                        layer={layer}
                        selected={index === activeLayerIndex}
                        typeLabel={getLayerTypeLabel(parsedLayers[index]?.type)}
                        onSelect={() => setSelectedLayerIndex(index)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            ) : (
              <div className="mt-3 rounded-lg border border-dashed border-[var(--ant-color-border)] px-2 py-4 text-center text-xs text-[var(--ant-color-text-secondary)]">
                选择快捷样式开始
              </div>
            )}

            <div className="mt-4 border-t border-[var(--ant-color-border-secondary)] pt-3">
              <Typography.Text className="text-xs" strong>
                快捷样式
              </Typography.Text>
              <div className="mt-0.5 text-xs text-[var(--ant-color-text-secondary)]">
                应用到当前图层
              </div>
              <div className="mt-2 grid grid-cols-4 gap-1.5">
                {GRADIENT_PRESETS.map((preset) => (
                  <Tooltip
                    key={preset.name}
                    title={`${preset.name} · 应用到当前图层`}
                  >
                    <button
                      type="button"
                      aria-label={`应用${preset.name}模板`}
                      className="aspect-square w-full rounded-md border-2 border-transparent outline-none transition-[border-color,transform] duration-150 hover:scale-[1.04] hover:border-[var(--ant-color-primary-border)] active:scale-[0.96] focus-visible:ring-2 focus-visible:ring-[var(--ant-color-primary-border)] motion-reduce:transform-none motion-reduce:transition-none"
                      style={{ background: preset.value }}
                      onClick={() => applyPresetToActiveLayer(preset.value)}
                    />
                  </Tooltip>
                ))}
              </div>
            </div>
          </aside>

          <main
            className="flex min-h-[420px] min-w-0 flex-col bg-[var(--ant-color-fill-quaternary)] p-4"
            style={{ gridArea: "preview" }}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <Typography.Text strong>实时预览</Typography.Text>
                <div className="mt-0.5 text-xs text-[var(--ant-color-text-secondary)]">
                  图层调整会立即显示在画布中
                </div>
              </div>
              <Tag className="m-0" bordered={false}>
                16:10
              </Tag>
            </div>
            <div className="flex min-h-[300px] flex-1 items-center justify-center py-5">
              <div
                className="aspect-[16/10] w-full max-w-[560px] overflow-hidden rounded-xl border border-[var(--ant-color-border-secondary)] bg-[var(--ant-color-fill-tertiary)] shadow-[0_18px_46px_rgba(0,0,0,0.16)]"
                style={{ background: isValid ? css : undefined }}
                aria-label="渐变实时预览"
              />
            </div>
          </main>

          <section
            className="min-w-0 bg-[var(--ant-color-bg-container)] p-4"
            style={{ gridArea: "inspector" }}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <Typography.Text strong>
                  {activeLayer ? `图层 ${activeLayerIndex + 1}` : "图层属性"}
                </Typography.Text>
                <div className="mt-0.5 text-xs text-[var(--ant-color-text-secondary)]">
                  颜色、透明度与渐变位置
                </div>
              </div>
              {activeLayer ? (
                <Tag className="m-0" color="blue">
                  {getLayerTypeLabel(activeLayer.type)}
                </Tag>
              ) : null}
            </div>

            {pickerValue && activeLayer ? (
              <div ref={pickerContainerRef} className="mt-4 w-full">
              <ColorPicker
                key={`layer-${activeLayerIndex}`}
                className="gradient-picker-responsive"
                idSuffix={`wallpaper-gradient-${activeLayerIndex}`}
                  value={pickerValue}
                  onChange={(nextValue) => {
                    const nextLayers = [...layers];
                    nextLayers[activeLayerIndex] = mergePickerGradient(
                      activeLayer,
                      nextValue,
                    );
                    onChange?.(nextLayers.join(", "));
                  }}
                  width={pickerWidth}
                  height={190}
                  presets={COLOR_PRESETS}
                  hideColorTypeBtns
                  hideEyeDrop
                  hideAdvancedSliders
                  hideColorGuide
                  hideInputType
                  showHexAlpha
                  locales={{
                    CONTROLS: { SOLID: "纯色", GRADIENT: "渐变" },
                  }}
                  style={pickerStyles}
                />
              </div>
            ) : (
              <Alert
                className="mt-4"
                type="warning"
                showIcon
                title={isValid ? "当前图层需要高级编辑" : "渐变样式尚未完成"}
                description={
                  isValid
                    ? "请选择线性或径向图层进行可视化编辑，当前图层仍可在高级 CSS 中调整。"
                    : "请选择一个快捷样式，或在高级 CSS 中继续编辑。"
                }
              />
            )}
          </section>
        </div>
      </div>

      <div className="border-t border-[var(--ant-color-border-secondary)] px-2 py-1">
        <Collapse size="small" ghost items={advancedItems} />
      </div>
    </div>
  );
};

export default GradientEditor;
