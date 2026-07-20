export const appRadii = {
  compact: 6,
  control: 10,
  surface: 12,
  panel: 16,
  round: 999,
} as const;

export const appControlHeights = {
  small: 24,
  default: 32,
  large: 40,
} as const;

const appThemeCssVariables = {
  "--sn-radius-compact": `${appRadii.compact}px`,
  "--sn-radius-control": `${appRadii.control}px`,
  "--sn-radius-surface": `${appRadii.surface}px`,
  "--sn-radius-panel": `${appRadii.panel}px`,
  "--sn-radius-round": `${appRadii.round}px`,
  "--sn-control-height-sm": `${appControlHeights.small}px`,
  "--sn-control-height": `${appControlHeights.default}px`,
  "--sn-control-height-lg": `${appControlHeights.large}px`,
} as const;

export const installAppThemeCssVariables = (
  root: HTMLElement = document.documentElement,
) => {
  Object.entries(appThemeCssVariables).forEach(([property, value]) => {
    root.style.setProperty(property, value);
  });
};
