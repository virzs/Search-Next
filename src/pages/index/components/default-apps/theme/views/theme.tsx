import { AppSegmented, DefaultAppView } from "@/components";
import { cx } from "@emotion/css";
import { FC, useMemo, useState } from "react";
import useDesktopTheme from "@/hooks/useDesktopTheme";

const getThemePreview = (theme: any) => {
  const base = theme?.token?.base ?? {};
  const dock = theme?.token?.dock ?? {};
  const items = theme?.token?.items ?? {};

  return {
    background: base.backgroundColor ?? "rgba(255,255,255,0.18)",
    border: base.borderColor ?? "rgba(255,255,255,0.20)",
    text: base.textColor ?? "rgba(0,0,0,0.88)",
    hover: base.hoverColor ?? "rgba(0,0,0,0.06)",
    dock: dock.backgroundColor ?? "rgba(255,255,255,0.16)",
    iconBg: items.iconBackgroundColor ?? "rgba(0,0,0,0.08)",
  };
};

const ThemeCard = ({
  name,
  theme,
  active,
  onClick,
}: {
  name: string;
  theme: any;
  active: boolean;
  onClick: () => void;
}) => {
  const preview = getThemePreview(theme);
  const ringColor = active ? "rgba(22, 119, 255, 0.45)" : "transparent";
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
        background: preview.background,
        borderColor: preview.border,
        color: preview.text,
        boxShadow: `0 0 0 2px ${ringColor}`,
      }}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick();
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="font-semibold truncate">{name}</div>
          <div className="text-xs opacity-70 mt-1">点击应用到桌面</div>
        </div>
        <div
          className="h-8 w-8 rounded-xl border flex items-center justify-center"
          style={{
            background: preview.dock,
            borderColor: preview.border,
          }}
        >
          <div
            className="h-3 w-3 rounded-full"
            style={{ background: preview.iconBg }}
          />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <div
          className="h-2 w-10 rounded-full"
          style={{ background: preview.hover }}
        />
        <div
          className="h-2 w-10 rounded-full"
          style={{ background: preview.dock }}
        />
        <div
          className="h-2 w-10 rounded-full"
          style={{ background: preview.iconBg }}
        />
      </div>
    </div>
  );
};

const ThemeView: FC = () => {
  const { themes, activeThemeId, setActiveThemeId } = useDesktopTheme();
  const [activeKind, setActiveKind] = useState<"all" | "light" | "dark">("all");

  const filteredThemes = useMemo(() => {
    const kindFiltered =
      activeKind === "all"
        ? themes
        : themes.filter((t) =>
            activeKind === "light" ? t.kind === "light" : t.kind === "dark",
          );

    return kindFiltered;
  }, [themes, activeKind]);

  return (
    <DefaultAppView
      headerLeft={
        <AppSegmented
          options={[
            { label: "全部", value: "all" },
            { label: "浅色", value: "light" },
            { label: "深色", value: "dark" },
          ]}
          value={activeKind}
          onChange={(v) => setActiveKind(v as any)}
          className="max-w-full overflow-auto"
        />
      }
      contentClassName="overflow-y-auto px-1 pb-4"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredThemes.map((t) => (
          <ThemeCard
            key={t.id}
            name={t.name}
            theme={t.theme}
            active={t.id === activeThemeId}
            onClick={() => setActiveThemeId(t.id)}
          />
        ))}
      </div>
    </DefaultAppView>
  );
};

export default ThemeView;
