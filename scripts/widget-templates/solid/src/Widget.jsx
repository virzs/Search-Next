import { createSignal, onCleanup, onMount } from "solid-js";

const Widget = (props) => {
  const [themeId, setThemeId] = createSignal(props.sdk?.theme?.activeThemeId || "light");

  onMount(() => {
    const cleanup = props.sdk?.onThemeChange?.((theme) => {
      setThemeId(theme.activeThemeId);
    });
    onCleanup(() => cleanup?.());
  });

  return (
    <div class={`widget-shell ${themeId() === "dark" ? "is-dark" : ""}`}>
      <div class="widget-kicker">Solid Widget</div>
      <div class="widget-title">__WIDGET_DISPLAY_NAME__</div>
      {props.mode !== "icon" && (
        <p class="widget-copy">
          {props.mode === "settings"
            ? "这是由小组件自行渲染的设置页。"
            : "通过 props.sdk 获取宿主能力，支持 icon/full/settings 三种模式。"}
        </p>
      )}
    </div>
  );
};

export default Widget;
