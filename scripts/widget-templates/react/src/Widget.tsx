import { useEffect, useState } from "react";
import type { WidgetProps } from "./types";

const Widget = ({ mode = "icon", sdk }: WidgetProps) => {
  const [themeId, setThemeId] = useState(sdk?.theme?.activeThemeId || "light");

  useEffect(() => {
    if (!sdk?.onThemeChange) return undefined;
    return sdk.onThemeChange((theme) => setThemeId(theme.activeThemeId));
  }, [sdk]);

  const isIcon = mode === "icon";
  const isSettings = mode === "settings";
  const shellClassName = [
    "tw:box-border tw:flex tw:h-full tw:w-full tw:flex-col tw:justify-center tw:gap-2 tw:overflow-hidden tw:rounded-2xl tw:p-[14px]",
    themeId === "dark"
      ? "tw:bg-[linear-gradient(135deg,#064e3b_0%,#022c22_100%)] tw:text-emerald-100"
      : "tw:bg-[linear-gradient(135deg,#d1fae5_0%,#a7f3d0_100%)] tw:text-emerald-950",
  ].join(" ");

  return (
    <div className={shellClassName}>
      <div className="tw:text-[11px] tw:font-bold tw:uppercase tw:tracking-[0.08em] tw:opacity-75">
        {isSettings ? "Settings Page" : "React Widget"}
      </div>
      <div className="tw:text-[22px] tw:font-extrabold tw:leading-tight">__WIDGET_DISPLAY_NAME__</div>
      {!isIcon && (
        <p className="tw:m-0 tw:text-[13px] tw:leading-normal tw:opacity-80">
          {isSettings
            ? "这是由小组件自行渲染的设置页。可通过 props.sdk.storage 保存偏好。"
            : "通过 props.sdk 获取宿主能力，支持 icon/full/settings 三种模式。"}
        </p>
      )}
    </div>
  );
};

export default Widget;
