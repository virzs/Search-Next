import { AppSegmented, DefaultAppView } from "@/components";
import { cx } from "@emotion/css";
import { useRequest } from "ahooks";
import { Button, Empty, Image } from "antd";
import { FC, useEffect, useMemo, useRef, useState } from "react";
import useDesktopTheme from "@/hooks/useDesktopTheme";
import {
  getActiveThemeConfigs,
  getThemePreviewImageUrl,
  getUserThemeCategories,
  ThemeCategoryApiItem,
  ThemeConfigApiItem,
} from "@/services/desktop";
import { useLocation, useNavigate, useParams } from "react-router";
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

export const ThemeDetailView: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const themeId = params.id ? decodeURIComponent(String(params.id)) : "";
  const { activeThemeId, setActiveThemeId } = useDesktopTheme();
  const stateTheme = (location.state as any)?.theme ?? null;
  const themeRef = useRef<ThemeConfigApiItem | null>(stateTheme);
  if (!themeRef.current && stateTheme) themeRef.current = stateTheme;

  const { data: themes, loading } = useRequest(getActiveThemeConfigs);

  const theme = useMemo(() => {
    if (themeRef.current && themeRef.current._id === themeId)
      return themeRef.current;
    return (themes ?? []).find((t) => t._id === themeId) ?? null;
  }, [themes, themeId]);

  useEffect(() => {
    if (!themeId) navigate(themeRoute.path.root, { replace: true });
  }, [navigate, themeId]);

  useEffect(() => {
    if (loading) return;
    if (themeId && !theme) navigate(themeRoute.path.root, { replace: true });
  }, [loading, navigate, theme, themeId]);

  if (!theme) return null;

  const active = theme._id === activeThemeId;
  const previewUrls = (theme.previewImages ?? [])
    .map((_, i) => getThemePreviewImageUrl(theme, i))
    .filter((v): v is string => Boolean(v));
  const coverUrl = previewUrls[0] ?? null;

  return (
    <DefaultAppView className="h-full" animate>
      <div className="max-w-3xl mx-auto p-6 pt-0">
        <div className="pt-8 flex items-start gap-4">
          <div className="min-w-0 flex-1">
            <div className="text-2xl font-bold tracking-tight truncate">
              {theme.name}
            </div>
            {theme.description ? (
              <div className="text-sm text-gray-600 mt-2">
                {theme.description}
              </div>
            ) : null}
          </div>
          <div className="shrink-0">
            <Button
              type="primary"
              shape="round"
              disabled={active}
              onClick={() => setActiveThemeId(theme._id)}
            >
              {active ? "已应用" : "应用到桌面"}
            </Button>
          </div>
        </div>

        <div className="mt-6">
          <div
            className="w-full aspect-video rounded-3xl border overflow-hidden"
            style={{
              background: "rgba(255,255,255,0.18)",
              borderColor: "rgba(0,0,0,0.08)",
            }}
          >
            {coverUrl ? (
              <Image className="w-full! h-full! object-cover" src={coverUrl} />
            ) : (
              <ThemeDesktopPreview theme={theme} draggable />
            )}
          </div>

          {previewUrls.length > 1 ? (
            <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 gap-3">
              {previewUrls.slice(1, 9).map((url) => (
                <Image
                  key={url}
                  className="w-full! h-20! rounded-2xl object-cover border"
                  style={{ borderColor: "rgba(0,0,0,0.08)" }}
                  src={url}
                  preview={false}
                />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </DefaultAppView>
  );
};

export default ThemeView;
