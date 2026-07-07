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
import { DesktopNext } from "zs_library";
import type { TypeConfigMap } from "zs_library";
import {
  adminDesktopItemIconBuilder,
  createAdminFixedItemBuilder,
} from "./components/desktop-rendering";

const DesktopConfigPreview = () => {
  const { id } = useParams();

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

  useEffect(() => {
    if (id) {
      run(id);
    }
  }, [id]);

  return (
    <FullPageContainer loading={loading}>
      <DesktopNext<DesktopItemData>
        pages={pages}
        onChange={() => undefined}
        theme={config?.theme && (config?.theme?.value ?? config?.theme)}
        typeConfigMap={typeConfigMap}
        itemIconBuilder={adminDesktopItemIconBuilder}
        dockProps={{
          items: dockItems,
          fixedItems: DEFAULT_DESKTOP_FIXED_DOCK_ITEMS,
          fixedItemBuilder: createAdminFixedItemBuilder,
        }}
      />
    </FullPageContainer>
  );
};

export default DesktopConfigPreview;
