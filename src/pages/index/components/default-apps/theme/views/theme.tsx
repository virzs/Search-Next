import { AppSegmented, DefaultAppView } from "@/components";
import { cx } from "@emotion/css";
import { useRequest } from "ahooks";
import { Empty, Image } from "antd";
import { FC, useMemo, useState } from "react";
import useDesktopTheme from "@/hooks/useDesktopTheme";
import {
  getActiveThemeConfigs,
  getThemePreviewImageUrl,
  getUserThemeCategories,
  ThemeCategoryApiItem,
  ThemeConfigApiItem,
} from "@/services/desktop";
import { useNavigate } from "react-router";
import { themeRoute } from "../route-paths";
import { ThemeDesktopPreview } from "./theme-preview";

const ThemeCard: FC<{
  theme: ThemeConfigApiItem;
  active: boolean;
  onOpen: () => void;
}> = ({ theme, active, onOpen }) => {
  const ringColor = active ? "rgba(22, 119, 255, 0.45)" : "transparent";
  const previewUrl = getThemePreviewImageUrl(theme, 0);
  const cardClassName = cx(
    "rounded-2xl border p-4 transition select-none",
    "hover:opacity-95 active:opacity-90",
    "cursor-pointer",
  );

  return (
    <div
      role="button"
      tabIndex={0}
      className={cardClassName}
      style={{
        background: "rgba(255,255,255,0.18)",
        borderColor: "rgba(0,0,0,0.08)",
        color: "rgba(0,0,0,0.88)",
        boxShadow: `0 0 0 2px ${ringColor}`,
      }}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onOpen();
      }}
    >
      <div
        className="h-28 rounded-xl border overflow-hidden"
        style={{ borderColor: "rgba(0,0,0,0.08)" }}
      >
        {previewUrl ? (
          <Image
            className="w-full! h-full! object-cover"
            src={previewUrl}
            preview={false}
          />
        ) : (
          <ThemeDesktopPreview theme={theme} />
        )}
      </div>

      <div className="mt-3 min-w-0">
        <div className="font-semibold truncate">{theme.name}</div>
        {theme.description ? (
          <div className="text-xs opacity-70 mt-1 line-clamp-2">
            {theme.description}
          </div>
        ) : (
          <div className="text-xs opacity-50 mt-1">暂无描述</div>
        )}
      </div>

      <div className="text-xs opacity-70 mt-2">
        {active ? "已应用" : "查看详情"}
      </div>
    </div>
  );
};

const ThemeView: FC = () => {
  const navigate = useNavigate();
  const { activeThemeId } = useDesktopTheme();
  const [activeCategoryId, setActiveCategoryId] = useState<string>("all");
  const { data: categories, loading: categoryLoading } = useRequest(
    getUserThemeCategories,
  );
  const { data: themes, loading: themeLoading } = useRequest(
    () =>
      getActiveThemeConfigs(
        activeCategoryId === "all"
          ? undefined
          : { categoryId: activeCategoryId },
      ),
    { refreshDeps: [activeCategoryId] },
  );

  const categoryOptions = useMemo(() => {
    const items: ThemeCategoryApiItem[] = categories ?? [];
    return [
      { label: "全部", value: "all" },
      ...items.map((c) => ({ label: c.name, value: c._id })),
    ];
  }, [categories]);

  const openThemeDetail = (theme: ThemeConfigApiItem) => {
    navigate(themeRoute.path.detail(theme._id), { state: { theme } });
  };

  return (
    <DefaultAppView
      headerLeft={
        <AppSegmented
          options={categoryOptions}
          value={activeCategoryId}
          onChange={(v) => setActiveCategoryId(String(v))}
          className="max-w-full overflow-auto"
        />
      }
      contentClassName="overflow-y-auto px-1 pb-4"
    >
      {themeLoading || categoryLoading ? (
        <div className="h-[220px] w-full flex items-center justify-center">
          <div className="text-sm text-gray-500">正在加载主题…</div>
        </div>
      ) : themes?.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {themes?.map((t) => (
            <ThemeCard
              key={t._id}
              theme={t}
              active={t._id === activeThemeId}
              onOpen={() => openThemeDetail(t)}
            />
          ))}
        </div>
      ) : (
        <div className="h-[220px] w-full flex items-center justify-center">
          <Empty description="暂无数据" />
        </div>
      )}
    </DefaultAppView>
  );
};

export default ThemeView;
