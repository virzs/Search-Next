import { AppSegmented, DefaultAppView } from "@/components";
import { useRequest } from "ahooks";
import { Button, Empty } from "antd";
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
import { personalizationRoute } from "../route-paths";
import { ThemeDesktopPreview } from "./theme-preview";
import PreviewCard from "../components/PreviewCard";
import { css } from "@emotion/css";

const themeViewClassName = css`
  .apple-theme-action.ant-btn-primary:not(:disabled) {
    border-color: #007aff !important;
    background: #007aff !important;
    box-shadow: 0 8px 18px rgba(0, 122, 255, 0.2);
  }
`;

const ThemeView: FC = () => {
  const navigate = useNavigate();
  const { activeThemeId, setActiveThemeId } = useDesktopTheme();
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
    navigate(personalizationRoute.path.detail(theme._id), { state: { theme } });
  };

  return (
    <DefaultAppView
      className={themeViewClassName}
      headerClassName="items-center px-3 pt-3 pb-2"
      headerLeft={
        <AppSegmented
          options={categoryOptions}
          value={activeCategoryId}
          onChange={(v) => setActiveCategoryId(String(v))}
          className="max-w-full overflow-auto"
        />
      }
      contentClassName="overflow-y-auto px-6 pb-8 pt-3 max-[640px]:px-4"
    >
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-5">
          <div className="text-[32px] font-bold leading-10 tracking-normal text-[#1d1d1f]">
            主题
          </div>
          <div className="mt-1 text-[13px] font-medium leading-5 text-[#6e6e73]">
            选择桌面的窗口、Dock、菜单和图标视觉风格。
          </div>
        </div>

        {themeLoading || categoryLoading ? (
          <div className="flex h-[220px] w-full items-center justify-center">
            <div className="text-sm text-[#6e6e73]">正在加载主题…</div>
          </div>
        ) : themes?.length ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {themes.map((t) => {
              const previewUrl = getThemePreviewImageUrl(t, 0);
              const active =
                t._id === activeThemeId ||
                ((activeThemeId === "light" || activeThemeId === "default") &&
                  (t._id === "light" ||
                    t._id === "default" ||
                    t.name === "默认"));
              return (
                <PreviewCard
                  key={t._id}
                  active={active}
                  title={t.name}
                  description={
                    active
                      ? "当前使用"
                      : t.description || "点击卡片查看预览详情"
                  }
                  status={
                    active ? (
                      <span className="rounded-full bg-[#e9f3ff] px-2 py-0.5 text-[11px] font-bold text-[#007aff]">
                        当前
                      </span>
                    ) : null
                  }
                  action={
                    <Button
                      size="small"
                      type={active ? "default" : "primary"}
                      shape="round"
                      disabled={active}
                      className={active ? undefined : "apple-theme-action"}
                      onClick={() => setActiveThemeId(t._id)}
                    >
                      {active ? "已应用" : "应用"}
                    </Button>
                  }
                  onClick={() => openThemeDetail(t)}
                  cover={
                    <div className="h-full w-full">
                      {previewUrl ? (
                        <img
                          className="h-full w-full object-cover"
                          src={previewUrl}
                          alt={t.name}
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
          <div className="flex h-[220px] w-full items-center justify-center rounded-[22px] bg-white/80">
            <Empty description="暂无可切换主题" />
          </div>
        )}
      </div>
    </DefaultAppView>
  );
};

export default ThemeView;
