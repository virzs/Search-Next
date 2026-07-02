<script setup>
import { computed, onMounted, onUnmounted, ref } from "vue";
import {
  createWidgetTranslator,
  getWidgetLocale,
  languageStorageKey,
  localeEventName,
  normalizeLocale,
  resources,
} from "./i18n/index.js";

const props = defineProps({
  mode: { type: String, default: "icon" },
  sdk: { type: Object, default: null },
});

const themeId = ref(props.sdk?.theme?.activeThemeId || "light");
const locale = ref(getWidgetLocale(props.sdk));
const t = computed(() => createWidgetTranslator(resources, locale.value.language));
const isIcon = computed(() => props.mode === "icon" || props.mode === "appIcon");
const isSettings = computed(() => props.mode === "settings");
const copyText = computed(() => {
  if (!props.sdk) return t.value("copy.standalone");
  return isSettings.value ? t.value("copy.settings") : t.value("copy.host");
});
let themeCleanup;
let localeCleanup;
let eventCleanup;

onMounted(() => {
  themeCleanup = props.sdk?.onThemeChange?.((theme) => {
    themeId.value = theme.activeThemeId;
  });
  const updateLocale = (nextLocale) => {
    locale.value = normalizeLocale(nextLocale);
  };
  localeCleanup = props.sdk?.onLocaleChange?.(updateLocale);
  if (!localeCleanup && !props.sdk?.onLocaleChange) {
    eventCleanup = props.sdk?.events?.on?.("locale:change", updateLocale);
  }
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
});

onUnmounted(() => {
  themeCleanup?.();
  localeCleanup?.();
  eventCleanup?.();
});
</script>

<template>
  <div class="widget-shell" :class="{ 'is-dark': themeId === 'dark' }">
    <div class="widget-kicker">{{ isSettings ? t("label.settings") : t("label.widget") }}</div>
    <div class="widget-title">__WIDGET_DISPLAY_NAME__</div>
    <p v-if="!isIcon" class="widget-copy">
      {{ copyText }}
    </p>
  </div>
</template>
