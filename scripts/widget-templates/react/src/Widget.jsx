const Widget = ({ mode = "icon", sdk }) => {
  const React = globalThis.React;
  const { useEffect, useState } = React;
  const [themeId, setThemeId] = useState(sdk?.theme?.activeThemeId || "light");

  useEffect(() => {
    if (!sdk?.onThemeChange) return undefined;
    return sdk.onThemeChange((theme) => setThemeId(theme.activeThemeId));
  }, [sdk]);

  const isIcon = mode === "icon";

  return React.createElement(
    "div",
    { className: `widget-shell ${themeId === "dark" ? "is-dark" : ""}` },
    React.createElement("div", { className: "widget-kicker" }, "React Widget"),
    React.createElement("div", { className: "widget-title" }, "__WIDGET_DISPLAY_NAME__"),
    !isIcon && React.createElement("p", { className: "widget-copy" }, "通过 props.sdk 获取宿主能力，支持 icon/full 两种模式。"),
  );
};

export default Widget;
