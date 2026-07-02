import { createMemo, createSignal, onCleanup, onMount } from "solid-js";
import {
  createWidgetTranslator,
  getWidgetLocale,
  languageStorageKey,
  localeEventName,
  normalizeLocale,
  resources,
} from "./i18n/index.js";

const Widget = (props) => {
  const [themeId, setThemeId] = createSignal(props.sdk?.theme?.activeThemeId || "light");
  const [locale, setLocale] = createSignal(getWidgetLocale(props.sdk));
  const t = createMemo(() => createWidgetTranslator(resources, locale().language));

  onMount(() => {
    const themeCleanup = props.sdk?.onThemeChange?.((theme) => {
      setThemeId(theme.activeThemeId);
    });
    const updateLocale = (nextLocale) => setLocale(normalizeLocale(nextLocale));
    const localeCleanup = props.sdk?.onLocaleChange?.(updateLocale);
    let eventCleanup = !localeCleanup && !props.sdk?.onLocaleChange
      ? props.sdk?.events?.on?.("locale:change", updateLocale)
      : undefined;
    if (!props.sdk && typeof window !== "undefined") {
      const handleLocaleEvent = (event) => updateLocale(event.detail);
      const handleStorage = (event) => {
        if (event.key === languageStorageKey) {
          updateLocale({ language: event.newValue, direction: "ltr" });
        }
      };
      window.addEventListener(localeEventName, handleLocaleEvent);
      window.addEventListener("storage", handleStorage);
      eventCleanup = () => {
        window.removeEventListener(localeEventName, handleLocaleEvent);
        window.removeEventListener("storage", handleStorage);
      };
    }
    onCleanup(() => {
      themeCleanup?.();
      localeCleanup?.();
      eventCleanup?.();
    });
  });

  const copyText = () => {
    if (!props.sdk) return t()("copy.standalone");
    return props.mode === "settings" ? t()("copy.settings") : t()("copy.host");
  };

  return (
    <div class={`widget-shell ${themeId() === "dark" ? "is-dark" : ""}`}>
      <div class="widget-kicker">{props.mode === "settings" ? t()("label.settings") : t()("label.widget")}</div>
      <div class="widget-title">__WIDGET_DISPLAY_NAME__</div>
      {props.mode !== "icon" && props.mode !== "appIcon" && (
        <p class="widget-copy">{copyText()}</p>
      )}
    </div>
  );
};

export default Widget;
