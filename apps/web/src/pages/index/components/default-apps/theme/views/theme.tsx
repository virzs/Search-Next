import { AppSegmented, DefaultAppView } from "@/components";
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
import PreviewCard from "../components/PreviewCard";

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
          {themes?.map((t) => {
            const previewUrl = getThemePreviewImageUrl(t, 0);
            const active = t._id === activeThemeId;
            return (
              <PreviewCard
                key={t._id}
                active={active}
                title={t.name}
                description={t.description}
                onClick={() => openThemeDetail(t)}
                cover={
                  <div className="aspect-video">
                    {previewUrl ? (
                      <Image
                        className="w-full! h-full! object-cover"
                        src={previewUrl}
                        preview={false}
                      />
                    ) : (
                      <ThemeDesktopPreview theme={t} />
                    )}
                  </div>
                }
              />
            );
          })}
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
