<script setup>
import { onMounted, onUnmounted, ref } from "vue";

const props = defineProps({
  mode: { type: String, default: "icon" },
  sdk: { type: Object, default: null },
});

const themeId = ref(props.sdk?.theme?.activeThemeId || "light");
let cleanup;

onMounted(() => {
  cleanup = props.sdk?.onThemeChange?.((theme) => {
    themeId.value = theme.activeThemeId;
  });
});

onUnmounted(() => {
  cleanup?.();
});
</script>

<template>
  <div class="widget-shell" :class="{ 'is-dark': themeId === 'dark' }">
    <div class="widget-kicker">Vue Widget</div>
    <div class="widget-title">__WIDGET_DISPLAY_NAME__</div>
    <p v-if="mode !== 'icon'" class="widget-copy">
      通过 props.sdk 获取宿主能力，支持 icon/full 两种模式。
    </p>
  </div>
</template>
