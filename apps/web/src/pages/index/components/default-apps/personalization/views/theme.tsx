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
import { useI18n } from "@/i18n";

const themeViewClassName = css`
  .apple-theme-action.ant-btn-primary:not(:disabled) {
    border-color: #007aff !important;
    background: #007aff !important;
    box-shadow: 0 8px 18px rgba(0, 122, 255, 0.2);
  }
`;

const ThemeView: FC = () => {
  const { t } = useI18n();
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
      { label: t("ui.all"), value: "all" },
      ...items.map((c) => ({ label: c.name, value: c._id })),
    ];
  }, [categories, t]);

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
            {t("ui.theme")}
          </div>
          <div className="mt-1 text-[13px] font-medium leading-5 text-[#6e6e73]">
            {t("ui.theme.chooseDescription")}
          </div>
        </div>

        {themeLoading || categoryLoading ? (
          <div className="flex h-[220px] w-full items-center justify-center">
            <div className="text-sm text-[#6e6e73]">{t("ui.loadingThemes")}</div>
          </div>
        ) : themes?.length ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {themes.map((theme) => {
              const previewUrl = getThemePreviewImageUrl(theme, 0);
              const active =
                theme._id === activeThemeId ||
                ((activeThemeId === "light" || activeThemeId === "default") &&
                  (theme._id === "light" ||
                    theme._id === "default" ||
                    theme.name === "默认"));
              return (
                <PreviewCard
                  key={theme._id}
                  active={active}
                  title={theme.name}
                  description={
                    active
                      ? t("ui.inUse")
                      : theme.description || t("ui.clickTheCardToViewPreviewDetails")
                  }
                  status={
                    active ? (
                      <span className="rounded-full bg-[#e9f3ff] px-2 py-0.5 text-[11px] font-bold text-[#007aff]">
                        {t("ui.current")}
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
                      onClick={() => setActiveThemeId(theme._id)}
                    >
                      {active ? t("ui.applied") : t("action.apply")}
                    </Button>
                  }
                  onClick={() => openThemeDetail(theme)}
                  cover={
                    <div className="h-full w-full">
                      {previewUrl ? (
                        <img
                          className="h-full w-full object-cover"
                          src={previewUrl}
                          alt={theme.name}
                        />
                      ) : (
                        <ThemeDesktopPreview theme={theme} />
                      )}
                    </div>
                  }
                />
              );
            })}
          </div>
        ) : (
          <div className="flex h-[220px] w-full items-center justify-center rounded-[22px] bg-white/80">
            <Empty description={t("ui.noThemesAvailable")} />
          </div>
        )}
      </div>
    </DefaultAppView>
  );
};

export default ThemeView;
