export type GradientWallpaperPreset = {
  id: string;
  name: string;
  css: string;
};

export const gradientWallpaperPresets: readonly GradientWallpaperPreset[] = [
  { id: "none", name: "无", css: "" },
  {
    id: "aurora",
    name: "极光",
    css: "radial-gradient(80% 70% at 15% 20%, rgba(0, 199, 190, 0.70) 0%, rgba(0, 0, 0, 0) 65%), radial-gradient(80% 70% at 85% 15%, rgba(10, 132, 255, 0.62) 0%, rgba(0, 0, 0, 0) 60%), radial-gradient(90% 80% at 55% 92%, rgba(255, 45, 85, 0.55) 0%, rgba(0, 0, 0, 0) 62%), linear-gradient(135deg, #0b0b10 0%, #111325 40%, #0b1220 100%)",
  },
  {
    id: "sky",
    name: "天光",
    css: "radial-gradient(120% 90% at 20% 10%, rgba(90, 200, 250, 0.85) 0%, rgba(10, 132, 255, 0.0) 55%), radial-gradient(100% 80% at 90% 30%, rgba(88, 86, 214, 0.55) 0%, rgba(88, 86, 214, 0) 60%), linear-gradient(135deg, rgba(242, 242, 247, 1) 0%, rgba(224, 235, 255, 1) 55%, rgba(236, 232, 255, 1) 100%)",
  },
  {
    id: "sunset",
    name: "落日",
    css: "radial-gradient(110% 90% at 15% 25%, rgba(255, 159, 10, 0.80) 0%, rgba(255, 159, 10, 0) 55%), radial-gradient(120% 100% at 85% 20%, rgba(255, 45, 85, 0.70) 0%, rgba(255, 45, 85, 0) 60%), linear-gradient(135deg, rgba(255, 250, 245, 1) 0%, rgba(255, 231, 220, 1) 60%, rgba(255, 220, 236, 1) 100%)",
  },
  {
    id: "lime",
    name: "青柠",
    css: "radial-gradient(110% 90% at 20% 20%, rgba(48, 209, 88, 0.70) 0%, rgba(48, 209, 88, 0) 55%), radial-gradient(120% 90% at 80% 30%, rgba(0, 199, 190, 0.55) 0%, rgba(0, 199, 190, 0) 60%), linear-gradient(135deg, rgba(245, 255, 252, 1) 0%, rgba(226, 255, 243, 1) 55%, rgba(224, 248, 255, 1) 100%)",
  },
  {
    id: "mono",
    name: "雾白",
    css: "radial-gradient(120% 90% at 25% 20%, rgba(255, 255, 255, 0.80) 0%, rgba(255, 255, 255, 0) 55%), radial-gradient(120% 90% at 85% 35%, rgba(199, 199, 204, 0.55) 0%, rgba(199, 199, 204, 0) 60%), linear-gradient(135deg, rgba(242, 242, 247, 1) 0%, rgba(232, 232, 236, 1) 100%)",
  },
  {
    id: "midnight",
    name: "深夜",
    css: "radial-gradient(100% 80% at 20% 25%, rgba(88, 86, 214, 0.55) 0%, rgba(88, 86, 214, 0) 60%), radial-gradient(120% 90% at 82% 18%, rgba(10, 132, 255, 0.55) 0%, rgba(10, 132, 255, 0) 60%), radial-gradient(110% 90% at 60% 92%, rgba(255, 45, 85, 0.40) 0%, rgba(255, 45, 85, 0) 62%), linear-gradient(135deg, #050509 0%, #0b0b14 55%, #070710 100%)",
  },
];
