import { Segmented, Select } from "antd";
import { useEffect, useMemo, useRef, useState, type DragEvent } from "react";
import {
  DesktopNext,
  desktopNextThemeDark,
  desktopNextThemeLight,
} from "zs_library";
import type { DesktopNextHandle, TypeConfigMap } from "zs_library";
import { useRequest } from "ahooks";
import {
  buildDesktopTypeConfigMap,
  createEmptyDesktopPages,
  DEFAULT_DESKTOP_FIXED_DOCK_ITEMS,
  extractDockItems,
  toDesktopPages,
  toDesktopRoots,
  type DesktopItemData,
  type DesktopPage,
  type DesktopRootItem,
  type DesktopSortItem,
} from "@search-next/desktop";
import {
  DesktopThemeConfig,
  getActiveDesktopThemeConfig,
} from "@/services/tabs/desktop/theme-config";
import { useLayout } from "@/context";
import { Theme } from "@/hooks/useTheme";
import {
  createAdminDesktopItemIconBuilder,
  createAdminFixedItemBuilder,
  emitAdminDesktopPreviewThemeChange,
  type AdminDesktopPreviewThemeMode,
} from "./desktop-rendering";
import DesktopResourceTabs from "./desktop-resource-tabs";

const RESOURCE_DRAG_TYPE = "application/x-search-next-desktop-item";

export type DesktopThemeType = "lightConfig" | "darkConfig";

export interface DesktopEditorProps {
  value?: {
    list?: DesktopRootItem[];
    [key: string]: unknown;
  };
  onChange?: (value: {
    list: DesktopRootItem[];
    [key: string]: unknown;
  }) => void;
  theme?: DesktopThemeConfig | null;
  themeType?: DesktopThemeType;
}

export interface DesktopEditorToolbarProps {
  theme?: DesktopThemeConfig | null;
  themeType: DesktopThemeType;
  onThemeChange: (theme: DesktopThemeConfig | null) => void;
  onThemeTypeChange: (themeType: DesktopThemeType) => void;
}

export const DesktopEditorToolbar = ({
  theme,
  themeType,
  onThemeChange,
  onThemeTypeChange,
}: DesktopEditorToolbarProps) => {
  const { data: themes = [], loading } = useRequest(
    getActiveDesktopThemeConfig,
  );

  const options = useMemo(
    () =>
      themes.map((item) => ({
        label: item.name,
        value: item._id || item.name,
        theme: item,
      })),
    [themes],
  );

  return (
    <div className={desktopHeaderToolbarClassName}>
      <Select
        allowClear
        className={themeSelectClassName}
        loading={loading}
        options={options}
        placeholder="默认主题"
        value={theme?._id || theme?.name}
        onClear={() => onThemeChange(null)}
        onChange={(_, option) => {
          const selectedOption = Array.isArray(option) ? option[0] : option;
          onThemeChange(
            (selectedOption as { theme?: DesktopThemeConfig } | undefined)
              ?.theme ?? null,
          );
        }}
      />
      <Segmented
        className={themeModeSegmentClassName}
        value={themeType}
        options={[
          { label: "浅色", value: "lightConfig" },
          { label: "深色", value: "darkConfig" },
        ]}
        onChange={(nextValue) =>
          onThemeTypeChange(nextValue as DesktopThemeType)
        }
      />
    </div>
  );
};

const DesktopEditor = ({
  value,
  onChange,
  theme,
  themeType = "lightConfig",
}: DesktopEditorProps) => {
  const desktopRef = useRef<DesktopNextHandle>(null);
  const initializedRef = useRef(false);
  const valueRef = useRef(value);
  const onChangeRef = useRef(onChange);
  const draggingResourceRef = useRef<DesktopSortItem<DesktopItemData> | null>(
    null,
  );
  const [pages, setPages] = useState<DesktopPage[]>(createEmptyDesktopPages);
  const [dockItems, setDockItems] = useState<
    DesktopSortItem<DesktopItemData>[]
  >([]);
  const { theme: adminTheme } = useLayout();
  const chromeThemeMode: AdminDesktopPreviewThemeMode =
    adminTheme === Theme.Dark ? "dark" : "light";
  const previewThemeMode: AdminDesktopPreviewThemeMode =
    themeType === "darkConfig" ? "dark" : "light";
  const resolvedTheme = useMemo(() => {
    if (theme) {
      return themeType === "darkConfig"
        ? theme.darkConfig || theme.lightConfig || desktopNextThemeDark
        : theme.lightConfig || desktopNextThemeLight;
    }
    return themeType === "darkConfig"
      ? desktopNextThemeDark
      : desktopNextThemeLight;
  }, [theme, themeType]);
  const itemIconBuilder = useMemo(
    () => createAdminDesktopItemIconBuilder(previewThemeMode),
    [previewThemeMode],
  );
  const desktopThemeKey = `${theme?._id || theme?.name || "default"}:${themeType}`;

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    emitAdminDesktopPreviewThemeChange(previewThemeMode);
  }, [previewThemeMode]);

  useEffect(() => {
    if (initializedRef.current) return;
    if (!value) return;

    const list = Array.isArray(value.list) ? value.list : [];
    setPages(toDesktopPages(list) as DesktopPage[]);
    setDockItems(extractDockItems(list) as DesktopSortItem<DesktopItemData>[]);
    initializedRef.current = true;
  }, [value]);

  useEffect(() => {
    onChangeRef.current?.({
      ...(valueRef.current ?? {}),
      list: toDesktopRoots(pages, dockItems),
    });
  }, [dockItems, pages]);

  const typeConfigMap = useMemo(
    () => buildDesktopTypeConfigMap([], pages) as TypeConfigMap,
    [pages],
  );

  const addItemsToCurrentPage = (items: DesktopSortItem<DesktopItemData>[]) => {
    if (!items.length) return;
    setPages((currentPages) => {
      const sourcePages = currentPages.length
        ? currentPages
        : createEmptyDesktopPages();
      const currentPageIndex = desktopRef.current?.currentPage ?? 0;
      const targetPageIndex = Math.min(
        Math.max(currentPageIndex, 0),
        sourcePages.length - 1,
      );
      return sourcePages.map((page, index) =>
        index === targetPageIndex
          ? { ...page, children: [...page.children, ...items] }
          : page,
      );
    });
  };

  const handleResourceDragStart = (
    event: DragEvent<HTMLElement>,
    item: DesktopSortItem<DesktopItemData>,
  ) => {
    draggingResourceRef.current = item;
    event.dataTransfer.effectAllowed = "copy";
    event.dataTransfer.setData(RESOURCE_DRAG_TYPE, JSON.stringify(item));
    event.dataTransfer.setData("text/plain", item.data?.name || "");
  };

  const handleResourceDrop = (event: DragEvent<HTMLElement>) => {
    const isResourceDrag = Array.from(event.dataTransfer.types).includes(
      RESOURCE_DRAG_TYPE,
    );
    if (!isResourceDrag && !draggingResourceRef.current) return;

    event.preventDefault();
    event.stopPropagation();

    const rawItem = event.dataTransfer.getData(RESOURCE_DRAG_TYPE);
    const item =
      draggingResourceRef.current ||
      (rawItem
        ? (JSON.parse(rawItem) as DesktopSortItem<DesktopItemData>)
        : null);
    if (item) addItemsToCurrentPage([item]);
    draggingResourceRef.current = null;
  };

  const handleResourceDragOver = (event: DragEvent<HTMLElement>) => {
    if (
      draggingResourceRef.current ||
      Array.from(event.dataTransfer.types).includes(RESOURCE_DRAG_TYPE)
    ) {
      event.preventDefault();
      event.dataTransfer.dropEffect = "copy";
    }
  };

  return (
    <div
      className={getDesktopEditorShellClassName(chromeThemeMode)}
      data-theme={chromeThemeMode}
    >
      <DesktopResourceTabs
        themeMode={chromeThemeMode}
        onResourceDragStart={handleResourceDragStart}
        onResourceDragEnd={() => {
          draggingResourceRef.current = null;
        }}
        onAddItem={(item) => addItemsToCurrentPage([item])}
      />
      <main
        className={desktopCanvasStageClassName}
        onDragOverCapture={handleResourceDragOver}
        onDropCapture={handleResourceDrop}
      >
        <div
          className={desktopCanvasFrameClassName}
          data-theme={previewThemeMode}
          style={{
            colorScheme: previewThemeMode,
          }}
        >
          <DesktopNext<DesktopItemData>
            key={desktopThemeKey}
            ref={desktopRef}
            className={desktopCanvasClassName}
            pages={pages}
            onChange={(nextPages) => setPages(nextPages as DesktopPage[])}
            maxPages={5}
            theme={resolvedTheme}
            typeConfigMap={typeConfigMap}
            contextMenuProps={{ showRemoveButton: true, showSizeButton: true }}
            itemIconBuilder={itemIconBuilder}
            dockProps={{
              items: dockItems,
              fixedItems: DEFAULT_DESKTOP_FIXED_DOCK_ITEMS,
              fixedItemBuilder: createAdminFixedItemBuilder,
            }}
          />
        </div>
      </main>
    </div>
  );
};

const getDesktopEditorShellClassName = (
  themeMode: AdminDesktopPreviewThemeMode,
) =>
  [
    "flex h-full max-h-full min-h-0 flex-row overflow-hidden",
    themeMode === "dark" ? "dark bg-[#141414]" : "bg-white",
  ].join(" ");

const desktopHeaderToolbarClassName =
  "flex min-w-[380px] flex-nowrap items-center gap-2.5";

const themeSelectClassName = "w-[220px]";

const themeModeSegmentClassName = "w-[136px]";

const desktopCanvasStageClassName = "min-h-0 w-0 flex-1 bg-inherit p-2.5";

const desktopCanvasFrameClassName = "h-full w-full overflow-hidden bg-inherit";

const desktopCanvasClassName = "h-full w-full overflow-hidden bg-inherit";

export default DesktopEditor;
