import { useEffect, useMemo, useState } from "react";
import type { AppLanguage, AppSDK } from "./types";

const zh = {
  appName: "思维导图", home: "首页", library: "我的导图", librarySubtitle: "已创建的导图会自动保存在当前设备上", openMap: "打开导图", newMap: "新建导图", untitled: "未命名导图", newIdea: "新想法", search: "搜索节点", documents: "导图", nodeCount: "{{count}} 个节点",
  addChild: "添加子节点", addSibling: "添加同级节点", undo: "撤销", redo: "重做", fit: "适应画布", zoomIn: "放大", zoomOut: "缩小",
  export: "导出", exportJson: "导出 JSON", exportPng: "导出 PNG", importJson: "导入 JSON", delete: "删除", duplicate: "复制导图",
  inspector: "节点", nodeText: "节点内容", branchColor: "分支颜色", collapse: "折叠分支", expand: "展开分支", noSelection: "选择一个节点以编辑",
  emptySearch: "没有匹配的节点", settings: "思维导图设置", appearance: "画布显示", showGrid: "显示点阵背景", showGridDesc: "帮助感知画布移动和缩放",
  showMinimap: "显示小地图", showMinimapDesc: "在画布右下角显示结构概览", autosave: "自动保存", autosaveDesc: "所有更改都会保存在当前设备上",
  saved: "已自动保存", importSuccess: "导图已导入", importError: "无法导入：文件格式不正确", storageError: "保存失败，当前更改仍保留在本次会话中",
  deleteMapTitle: "删除这张导图？", deleteMapBody: "此操作会删除“{{title}}”，你仍可以立即撤销节点操作，但无法撤销删除整张导图。", cancel: "取消", confirmDelete: "删除导图",
  editHint: "拖动自由摆放 · Option 拖动换父级 · Shift 拖拽框选", rootHint: "根节点不能删除", searchResult: "{{current}} / {{total}}",
  connectorStyle: "连线风格", curve: "曲线", elbow: "折线", straight: "直线", resetPosition: "重置自动位置",
  widgetSubtitle: "把想法变成结构", active: "当前", close: "关闭", done: "完成", rename: "重命名", importVersion: "仅支持由本应用导出的 JSON 文件",
};
const en: Record<keyof typeof zh, string> = {
  appName: "Mind Map", home: "Home", library: "My Mind Maps", librarySubtitle: "Your mind maps are saved automatically on this device", openMap: "Open map", newMap: "New map", untitled: "Untitled map", newIdea: "New idea", search: "Search nodes", documents: "Maps", nodeCount: "{{count}} nodes",
  addChild: "Add child", addSibling: "Add sibling", undo: "Undo", redo: "Redo", fit: "Fit canvas", zoomIn: "Zoom in", zoomOut: "Zoom out",
  export: "Export", exportJson: "Export JSON", exportPng: "Export PNG", importJson: "Import JSON", delete: "Delete", duplicate: "Duplicate map",
  inspector: "Node", nodeText: "Node text", branchColor: "Branch color", collapse: "Collapse branch", expand: "Expand branch", noSelection: "Select a node to edit",
  emptySearch: "No matching nodes", settings: "Mind Map Settings", appearance: "Canvas", showGrid: "Show dot grid", showGridDesc: "Makes canvas movement and zoom easier to perceive",
  showMinimap: "Show minimap", showMinimapDesc: "Show a structural overview in the lower-right corner", autosave: "Autosave", autosaveDesc: "Every change is saved on this device",
  saved: "Saved automatically", importSuccess: "Mind map imported", importError: "Import failed: invalid file format", storageError: "Save failed. Your changes remain available in this session.",
  deleteMapTitle: "Delete this map?", deleteMapBody: "This permanently removes “{{title}}”. Node actions can be undone, but deleting an entire map cannot.", cancel: "Cancel", confirmDelete: "Delete map",
  editHint: "Drag to place · Option-drag to reparent · Shift-drag to select", rootHint: "The root node cannot be deleted", searchResult: "{{current}} / {{total}}",
  connectorStyle: "Connector style", curve: "Curve", elbow: "Elbow", straight: "Straight", resetPosition: "Reset automatic position",
  widgetSubtitle: "Turn ideas into structure", active: "Current", close: "Close", done: "Done", rename: "Rename", importVersion: "Only JSON files exported by this app are supported",
};
export type TranslationKey = keyof typeof zh;

export function useI18n(sdk?: AppSDK) {
  const getLanguage = (): AppLanguage => sdk?.getLocale?.().language || sdk?.locale?.language || (navigator.language.startsWith("zh") ? "zh-CN" : "en-US");
  const [language, setLanguage] = useState<AppLanguage>(getLanguage);
  useEffect(() => sdk?.onLocaleChange?.((locale) => setLanguage(locale.language)) || undefined, [sdk]);
  return useMemo(() => ({ language, t: (key: TranslationKey, values?: Record<string, string | number>) => {
    let value = (language === "zh-CN" ? zh : en)[key];
    Object.entries(values || {}).forEach(([name, replacement]) => { value = value.replace(`{{${name}}}`, String(replacement)); });
    return value;
  } }), [language]);
}
