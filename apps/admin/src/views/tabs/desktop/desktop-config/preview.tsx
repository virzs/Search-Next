import FullPageContainer from "@/components/containter/full";
import { detailDesktopAdminConfig } from "@/services/tabs/desktop/desktop-config";
import {
  buildDesktopTypeConfigMap,
  DEFAULT_DESKTOP_FIXED_DOCK_ITEMS,
  extractDockItems,
  toDesktopPages,
  type DesktopItemData,
  type DesktopPage,
  type DesktopRootItem,
} from "@search-next/desktop";
import { useRequest } from "ahooks";
import { useEffect, useMemo } from "react";
import { useParams } from "react-router";
import {
  DesktopNext,
  desktopNextThemeDark,
  desktopNextThemeLight,
} from "zs_library";
import type { TypeConfigMap } from "zs_library";
import {
  createAdminDesktopItemIconBuilder,
  createAdminFixedItemBuilder,
  emitAdminDesktopPreviewThemeChange,
} from "./components/desktop-rendering";
import { useLayout } from "@/context";
import { Theme } from "@/hooks/useTheme";

const DesktopConfigPreview = () => {
  const { id } = useParams();
  const { theme: adminTheme } = useLayout();
  const themeMode = adminTheme === Theme.Dark ? "dark" : "light";

  const { data, loading, run } = useRequest(detailDesktopAdminConfig, {
    manual: true,
  });

  const { config } = data ?? {};
  const list = (
    Array.isArray(config?.list) ? config.list : []
  ) as DesktopRootItem[];
  const pages = useMemo(() => toDesktopPages(list) as DesktopPage[], [list]);
  const dockItems = useMemo(() => extractDockItems(list), [list]);
  const typeConfigMap = useMemo(
    () => buildDesktopTypeConfigMap([], pages) as TypeConfigMap,
    [pages],
  );
  const desktopTheme =
    (config?.theme && (config?.theme?.value ?? config?.theme)) ||
    (themeMode === "dark" ? desktopNextThemeDark : desktopNextThemeLight);
  const itemIconBuilder = useMemo(
    () => createAdminDesktopItemIconBuilder(themeMode),
    [themeMode],
  );

  useEffect(() => {
    if (id) {
      run(id);
    }
  }, [id]);

  useEffect(() => {
    emitAdminDesktopPreviewThemeChange(themeMode);
  }, [themeMode]);

  return (
    <FullPageContainer loading={loading}>
      <div
        className={getPreviewShellClassName(themeMode)}
        data-theme={themeMode}
        style={{
          colorScheme: themeMode,
        }}
      >
        <DesktopNext<DesktopItemData>
          key={themeMode}
          pages={pages}
          onChange={() => undefined}
          theme={desktopTheme}
          typeConfigMap={typeConfigMap}
          itemIconBuilder={itemIconBuilder}
          dockProps={{
            items: dockItems,
            fixedItems: DEFAULT_DESKTOP_FIXED_DOCK_ITEMS,
            fixedItemBuilder: createAdminFixedItemBuilder,
          }}
        />
      </div>
    </FullPageContainer>
  );
};

const getPreviewShellClassName = (themeMode: "light" | "dark") =>
  [
    "h-full w-full overflow-hidden",
    themeMode === "dark" ? "dark bg-[#141414]" : "bg-white",
  ].join(" ");

export default DesktopConfigPreview;
