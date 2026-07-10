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
import { useI18n } from "@/i18n";
import { RiCheckLine } from "@remixicon/react";

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
  const activeThemeName = useMemo(() => {
    const activeTheme = themes?.find(
      (theme) =>
        theme._id === activeThemeId ||
        ((activeThemeId === "light" || activeThemeId === "default") &&
          (theme._id === "light" ||
            theme._id === "default" ||
            theme.name === "默认")),
    );
    return activeTheme?.name ?? t("ui.default");
  }, [activeThemeId, t, themes]);

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
        <div className="mb-6 flex items-end justify-between gap-4 max-[640px]:items-start max-[640px]:flex-col">
          <div>
          <div className="text-[28px] font-bold leading-[34px] text-[var(--sn-text)]">
            {t("ui.theme")}
          </div>
          <div className="mt-1 text-[13px] font-medium leading-5 text-[var(--sn-text-secondary)]">
            {t("ui.theme.chooseDescription")}
          </div>
          </div>
          <div className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[var(--sn-surface-secondary)] px-3 py-1.5 text-[12px] font-medium leading-4 text-[var(--sn-text-secondary)]">
            <RiCheckLine size={13} className="text-[var(--sn-accent)]" />
            <span>{t("ui.currentTheme")} · {activeThemeName}</span>
          </div>
        </div>

        {themeLoading || categoryLoading ? (
          <div className="flex h-[220px] w-full items-center justify-center">
            <div className="text-[13px] text-[var(--sn-text-secondary)]">{t("ui.loadingThemes")}</div>
          </div>
        ) : themes?.length ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                  description={theme.description || t("ui.clickTheCardToViewPreviewDetails")}
                  action={
                    active ? null : (
                    <Button
                      size="small"
                      type="primary"
                      shape="round"
                      className="px-3! font-semibold!"
                      onClick={() => setActiveThemeId(theme._id)}
                    >
                      {t("action.apply")}
                    </Button>
                    )
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
          <div className="flex h-[220px] w-full items-center justify-center rounded-[8px] border border-[var(--sn-separator)] bg-[var(--sn-surface)]">
            <Empty description={t("ui.noThemesAvailable")} />
          </div>
        )}
      </div>
    </DefaultAppView>
  );
};

export default ThemeView;
