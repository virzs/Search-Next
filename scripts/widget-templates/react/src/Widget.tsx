import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { resources, useWidgetI18n } from "./i18n";
import type { WidgetProps } from "./types";

const Widget = ({ mode = "icon", sdk }: WidgetProps) => {
  const { t } = useWidgetI18n(sdk, resources);
  const [themeId, setThemeId] = useState(sdk?.theme?.activeThemeId || "light");

  useEffect(() => {
    if (!sdk?.onThemeChange) return undefined;
    return sdk.onThemeChange((theme) => setThemeId(theme.activeThemeId));
  }, [sdk]);

  const isIcon = mode === "icon" || mode === "appIcon";
  const isSettings = mode === "settings";
  const shellClassName = cn(
    "tw:box-border tw:flex tw:h-full tw:w-full tw:flex-col tw:justify-center tw:gap-2 tw:overflow-hidden tw:rounded-2xl tw:p-[14px]",
    themeId === "dark"
      ? "tw:bg-[linear-gradient(135deg,#064e3b_0%,#022c22_100%)] tw:text-emerald-100"
      : "tw:bg-[linear-gradient(135deg,#d1fae5_0%,#a7f3d0_100%)] tw:text-emerald-950",
  );

  return (
    <div className={shellClassName}>
      <div className="tw:text-[11px] tw:font-bold tw:uppercase tw:tracking-[0.08em] tw:opacity-75">
        {isSettings ? t("label.settings") : t("label.widget")}
      </div>
      <div className="tw:text-[22px] tw:font-extrabold tw:leading-tight">__WIDGET_DISPLAY_NAME__</div>
      {!isIcon && (
        <p className="tw:m-0 tw:text-[13px] tw:leading-normal tw:opacity-80">
          {!sdk ? t("copy.standalone") : isSettings ? t("copy.settings") : t("copy.host")}
        </p>
      )}
      {!isIcon && (
        <div className="tw:mt-1 tw:flex tw:items-center tw:gap-2">
          <Button size="sm" variant={themeId === "dark" ? "ghost" : "secondary"} type="button">
            {t("action.button")}
          </Button>
        </div>
      )}
    </div>
  );
};

export default Widget;
