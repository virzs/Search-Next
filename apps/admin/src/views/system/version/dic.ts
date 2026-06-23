export const platformDicMap = {
  windows: "Windows",
  mac: "Mac",
};

export const getPlatformDicLabel = (
  key: keyof typeof platformDicMap | null
) => {
  return (platformDicMap as any)[key as any] ?? null;
};

export const updateTypeDicMap = {
  1: "强制更新",
  2: "可选更新",
};

export const getUpdateTypeDicLabel = (
  key: keyof typeof updateTypeDicMap | null
) => {
  return (updateTypeDicMap as any)[key as any] ?? null;
};

export const platformAcceptDicMap: { [x: string]: string } = {
  windows: ".msi,.exe",
  mac: ".dmg",
};
