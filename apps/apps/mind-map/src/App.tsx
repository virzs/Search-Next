import { cloneElement, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type React from "react";
import {
  RiAddLine, RiArrowGoBackLine, RiArrowGoForwardLine, RiArrowLeftSLine, RiArrowRightSLine,
  RiBracesLine, RiCheckboxCircleFill, RiCloseLine, RiCornerDownRightLine, RiDeleteBinLine,
  RiDownload2Line, RiFileAddLine, RiFileCopyLine, RiFocus3Line, RiHome5Line, RiImageLine, RiMindMap,
  RiRouteLine, RiSearchLine, RiSidebarFoldLine, RiSidebarUnfoldLine, RiSubtractLine,
  RiUpload2Line, RiZoomInLine, RiZoomOutLine,
} from "@remixicon/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { MindMapCanvas } from "./canvas";
import { useI18n } from "./i18n";
import { BRANCH_COLORS, childrenOf } from "./model";
import type { ConnectorStyle, MindMapDocument, MindMapNode, MindMapSettings } from "./model";
import { layoutMindMap } from "./layout";
import type { AppProps } from "./types";
import { useMindMapStore } from "./useMindMapStore";

const downloadText = (filename: string, text: string, type: string) => {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const anchor = document.createElement("a"); anchor.href = url; anchor.download = filename; anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
};
const safeFilename = (value: string) => value.replace(/[\\/:*?"<>|]/g, "-").trim() || "mind-map";

export default function App({ mode = "icon", sdk }: AppProps) {
  const { t, language } = useI18n(sdk);
  const mindMap = useMindMapStore(sdk, language);
  const [themeId, setThemeId] = useState(sdk?.theme?.activeThemeId || "light");
  useEffect(() => sdk?.onThemeChange?.((theme) => setThemeId(theme.activeThemeId)) || undefined, [sdk]);
  const dark = themeId === "dark";
  const isIcon = mode === "icon" || mode === "appIcon";
  const variables = {
    "--mm-bg": dark ? "#111317" : "#F4F5F7", "--mm-panel": dark ? "#1C1E23" : "#FFFFFF", "--mm-sidebar": dark ? "rgba(31,33,39,.86)" : "rgba(239,241,245,.84)",
    "--mm-fg": dark ? "#F5F5F7" : "#202124", "--mm-muted": dark ? "#A7A8AE" : "#6E7078", "--mm-line": dark ? "rgba(255,255,255,.10)" : "rgba(20,28,45,.09)",
    "--mm-control": dark ? "rgba(255,255,255,.08)" : "rgba(28,34,48,.06)", "--mm-control-hover": dark ? "rgba(255,255,255,.13)" : "rgba(28,34,48,.1)",
    "--mm-accent": "#4F7FE8", "--mm-switch-off": dark ? "#4A4B50" : "#D6D7DC",
  } as React.CSSProperties;
  return <TooltipProvider><div className="mm-root tw:h-full tw:w-full tw:overflow-hidden tw:bg-[var(--mm-bg)] tw:font-[-apple-system,BlinkMacSystemFont,SF_Pro_Text,system-ui,sans-serif] tw:text-[var(--mm-fg)] tw:[container-type:size] tw:[&_*]:box-border" style={variables}>
    {isIcon ? <Widget document={mindMap.activeDocument} sizeId={sdk?.sizeId || "2x2"} dark={dark} t={t} /> : mode === "settings" ? <SettingsView settings={mindMap.store.settings} onChange={mindMap.updateSettings} t={t} /> : <Editor mindMap={mindMap} dark={dark} t={t} sdk={sdk} />}
  </div></TooltipProvider>;
}

function Widget({ document, sizeId, dark, t }: { document?: MindMapDocument; sizeId: string; dark: boolean; t: ReturnType<typeof useI18n>["t"] }) {
  if (!document) return null;
  const layout = layoutMindMap(document); const count = Object.keys(document.nodes).length;
  return <div className={cn("tw:relative tw:h-full tw:w-full tw:overflow-hidden tw:rounded-[20px] tw:border tw:border-[var(--mm-line)] tw:bg-[var(--mm-panel)] tw:p-3 tw:shadow-[0_8px_24px_rgba(24,35,55,.1)]", sizeId === "4x2" && "tw:grid tw:grid-cols-[.8fr_1.2fr] tw:gap-4 tw:p-4") }>
    <div className="tw:relative tw:z-10 tw:flex tw:min-w-0 tw:flex-col tw:justify-between">
      <div className="tw:flex tw:items-center tw:gap-2 tw:text-[#4F7FE8]"><span className="tw:flex tw:size-7 tw:items-center tw:justify-center tw:rounded-[9px] tw:bg-[#4F7FE8]/12"><RiMindMap size={18} /></span><span className="tw:text-[11px] tw:font-bold tw:uppercase tw:tracking-[.07em]">{t("appName")}</span></div>
      <div className="tw:min-w-0"><h3 className="tw:m-0 tw:truncate tw:text-[17px] tw:font-[750] tw:leading-tight tw:tracking-[-.02em]">{document.title}</h3><p className="tw:m-0 tw:mt-1 tw:text-[11px] tw:font-medium tw:text-[var(--mm-muted)]">{t("nodeCount", { count })}</p></div>
    </div>
    <Miniature layout={layout} dark={dark} compact={sizeId !== "4x2"} />
  </div>;
}

function Miniature({ layout, compact = false }: { layout: ReturnType<typeof layoutMindMap>; dark?: boolean; compact?: boolean }) {
  const width = 260, height = 130, bounds = layout.bounds;
  const scale = Math.min((width - 18) / Math.max(bounds.width, 1), (height - 18) / Math.max(bounds.height, 1));
  const ox = width / 2 - (bounds.x + bounds.width / 2) * scale, oy = height / 2 - (bounds.y + bounds.height / 2) * scale;
  return <svg className={cn("tw:h-full tw:w-full tw:overflow-visible", compact && "tw:absolute tw:inset-x-2 tw:bottom-2 tw:h-[62%] tw:w-[calc(100%-1rem)] tw:opacity-25")} viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
    {layout.edges.map((edge) => <line key={edge.to.node.id} x1={(edge.from.x + edge.from.width / 2) * scale + ox} y1={(edge.from.y + edge.from.height / 2) * scale + oy} x2={(edge.to.x + edge.to.width / 2) * scale + ox} y2={(edge.to.y + edge.to.height / 2) * scale + oy} stroke={edge.color} strokeWidth="2" opacity=".55" />)}
    {layout.nodes.map((item) => <rect key={item.node.id} x={item.x * scale + ox} y={item.y * scale + oy} width={Math.max(8, item.width * scale)} height={Math.max(4, item.height * scale)} rx={Math.max(2, 10 * scale)} fill={item.side === "root" ? item.color : item.color} opacity={item.side === "root" ? 1 : .72} />)}
  </svg>;
}

type MindMapController = ReturnType<typeof useMindMapStore>;
function Editor({ mindMap, dark, t, sdk }: { mindMap: MindMapController; dark: boolean; t: ReturnType<typeof useI18n>["t"]; sdk?: AppProps["sdk"] }) {
  const { activeDocument: document } = mindMap;
  const [view, setView] = useState<"home" | "editor">("home");
  const [selectedId, setSelectedId] = useState<string>();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [inspectorOpen, setInspectorOpen] = useState(true);
  const [query, setQuery] = useState(""); const [searchIndex, setSearchIndex] = useState(0); const [exportOpen, setExportOpen] = useState(false);
  const [connectorOpen, setConnectorOpen] = useState(false); const [searchOpen, setSearchOpen] = useState(false);
  const [deleteMapId, setDeleteMapId] = useState<string>(); const [editing, setEditing] = useState<{ id: string; value: string }>();
  const [editingRect, setEditingRect] = useState<{ left: number; top: number; width: number; height: number } | null>(null);
  const [zoom, setZoom] = useState(1); const editorHostRef = useRef<HTMLDivElement>(null); const canvasHostRef = useRef<HTMLDivElement>(null); const canvasRef = useRef<MindMapCanvas | undefined>(undefined); const fileRef = useRef<HTMLInputElement>(null);
  const handlersRef = useRef({ select: (_id: string) => {}, selectMany: (_ids: string[]) => {}, edit: (_id: string) => {}, collapse: (_id: string) => {}, drop: (_id: string, _target: string, _before: boolean) => {}, movePosition: (_id: string, _delta: { x: number; y: number }) => {} });
  const selected = document && selectedId ? document.nodes[selectedId] : undefined;
  const searchResults = useMemo(() => document && query.trim() ? Object.values(document.nodes).filter((node) => node.text.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())) : [], [document, query]);

  const openEditor = useCallback((id: string) => { const node = document?.nodes[id]; if (node) { setSelectedId(id); setEditing({ id, value: node.text }); } }, [document]);
  handlersRef.current = { select: (id) => { setSelectedId(id); setSelectedIds([id]); }, selectMany: (ids) => { setSelectedIds(ids); setSelectedId(ids[ids.length - 1]); if (!ids.length) setEditing(undefined); }, edit: openEditor, collapse: (id) => { const node = document?.nodes[id]; if (node) mindMap.updateNode(id, { collapsed: !node.collapsed }); }, drop: mindMap.moveNode, movePosition: mindMap.moveNodePosition };
  useEffect(() => {
    if (!canvasHostRef.current) return;
    const canvas = new MindMapCanvas(canvasHostRef.current, { onSelect: (id) => handlersRef.current.select(id), onSelectMany: (ids) => handlersRef.current.selectMany(ids), onEdit: (id) => handlersRef.current.edit(id), onToggleCollapse: (id) => handlersRef.current.collapse(id), onDrop: (id, target, before) => handlersRef.current.drop(id, target, before), onMovePosition: (id, delta) => handlersRef.current.movePosition(id, delta), onViewport: setZoom });
    canvasRef.current = canvas; return () => { canvas.destroy(); canvasRef.current = undefined; };
  }, []);
  useEffect(() => { if (document) canvasRef.current?.render(document, selectedIds, dark, mindMap.store.settings.connectorStyle); }, [document, selectedIds, dark, mindMap.store.settings.connectorStyle]);
  useEffect(() => { if (!document) return; setSelectedId(document.rootId); setSelectedIds([document.rootId]); setEditing(undefined); window.setTimeout(() => canvasRef.current?.fit(), 80); }, [document?.id]);
  useEffect(() => { if (searchResults.length) { const index = Math.min(searchIndex, searchResults.length - 1); setSelectedId(searchResults[index].id); setSelectedIds([searchResults[index].id]); canvasRef.current?.focusNode(searchResults[index].id); } }, [searchIndex, searchResults]);
  useEffect(() => {
    if (!editing?.id) { setEditingRect(null); return undefined; }
    let frame = 0;
    const update = () => {
      const next = canvasRef.current?.getNodeRect(editing.id) || null;
      setEditingRect((previous) => {
        if (!next) return previous;
        if (previous && Math.abs(previous.left - next.left) < .1 && Math.abs(previous.top - next.top) < .1 && Math.abs(previous.width - next.width) < .1 && Math.abs(previous.height - next.height) < .1) return previous;
        return next;
      });
      frame = window.requestAnimationFrame(update);
    };
    update();
    return () => window.cancelAnimationFrame(frame);
  }, [editing?.id]);
  useEffect(() => {
    const host = editorHostRef.current;
    if (!host) return;
    let previousWidth = Number.POSITIVE_INFINITY;
    const observer = new ResizeObserver(([entry]) => {
      const width = entry.contentRect.width;
      if (width <= 900 && previousWidth > 900) setInspectorOpen(false);
      previousWidth = width;
    });
    observer.observe(host);
    return () => observer.disconnect();
  }, []);

  const addChild = () => { if (!document) return; const id = mindMap.addNode(selectedId || document.rootId, t("newIdea")); setSelectedId(id); setSelectedIds([id]); setEditing({ id, value: t("newIdea") }); };
  const addSibling = () => { if (!document) return; const id = selectedId ? mindMap.addSibling(selectedId, t("newIdea")) : mindMap.addNode(document.rootId, t("newIdea")); setSelectedId(id); setSelectedIds([id]); setEditing({ id, value: t("newIdea") }); };
  const deleteSelected = () => { if (!document || !selectedId || selectedId === document.rootId) { sdk?.toast?.error(t("rootHint")); return; } const parentId = document.nodes[selectedId]?.parentId || document.rootId; mindMap.removeNode(selectedId); setSelectedId(parentId); setSelectedIds([parentId]); };
  const commitEditing = () => { if (editing) mindMap.updateNode(editing.id, { text: editing.value.trim() || t("untitled") }); setEditing(undefined); };
  const exportJson = () => { if (!document) return; downloadText(`${safeFilename(document.title)}.json`, JSON.stringify({ schemaVersion: 1, type: "search-next-mind-map", document }, null, 2), "application/json"); setExportOpen(false); };
  const importFile = async (file?: File) => { if (!file) return; try { const value = JSON.parse(await file.text()); if (!mindMap.importDocument(value)) throw new Error(); sdk?.toast?.success(t("importSuccess")); } catch { sdk?.toast?.error(t("importError"), t("importVersion")); } };
  const exportPng = async () => { if (!document) return; setExportOpen(false); await canvasRef.current?.exportPng(`${safeFilename(document.title)}.png`, dark); };
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement; const typing = target.matches("input, textarea, [contenteditable=true]");
      if (event.key === "Escape") { setEditing(undefined); setExportOpen(false); setConnectorOpen(false); setSearchOpen(false); return; }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "f") { event.preventDefault(); if (view === "home") setView("editor"); setSearchOpen(true); window.setTimeout(() => documentQuery()?.focus(), 40); return; }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "n") { event.preventDefault(); mindMap.addDocument(); setView("editor"); return; }
      if (view === "home") return;
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "z") { event.preventDefault(); event.shiftKey ? mindMap.redo() : mindMap.undo(); return; }
      if (typing) return;
      if (event.key === "Tab") { event.preventDefault(); addChild(); }
      else if (event.key === "Enter") { event.preventDefault(); addSibling(); }
      else if (event.key === "Delete" || event.key === "Backspace") { event.preventDefault(); deleteSelected(); }
    };
    window.addEventListener("keydown", onKeyDown); return () => window.removeEventListener("keydown", onKeyDown);
  });
  const documentQuery = () => editorHostRef.current?.querySelector<HTMLInputElement>("[data-search]") || null;
  if (!document) return null;
  const inspectorVisible = view === "editor" && inspectorOpen;
  const openDocument = (id: string) => { mindMap.selectDocument(id); setView("editor"); window.setTimeout(() => canvasRef.current?.fit(), 80); };
  const createDocument = () => { mindMap.addDocument(); setView("editor"); };

  return <div ref={editorHostRef} className="tw:relative tw:h-full tw:min-h-[420px] tw:w-full tw:overflow-hidden tw:bg-[var(--mm-bg)]">
    <main className="tw:absolute tw:inset-0 tw:overflow-hidden">
      <div ref={canvasHostRef} className={cn("tw:absolute tw:inset-0 tw:touch-none", mindMap.store.settings.showGrid && "mm-grid")} aria-label={t("appName")} />

      {view === "editor" && <div className="mm-toolbar tw:absolute tw:left-1/2 tw:top-3 tw:z-30 tw:flex tw:-translate-x-1/2 tw:flex-nowrap tw:items-center tw:justify-center tw:gap-1 tw:rounded-[14px] tw:border tw:border-[var(--mm-line)] tw:bg-[color-mix(in_srgb,var(--mm-panel)_82%,transparent)] tw:p-1.5 tw:shadow-[0_10px_30px_rgba(20,32,54,.12)] tw:backdrop-blur-xl">
          <Tool icon={<RiHome5Line />} label={t("home")} onClick={() => { setView("home"); setEditing(undefined); setSearchOpen(false); setConnectorOpen(false); setExportOpen(false); }} /><Separator />
          <Tool icon={<RiAddLine />} label={t("addChild")} onClick={addChild} /><Tool icon={<RiCornerDownRightLine />} label={t("addSibling")} onClick={addSibling} />
          <Separator /><Tool icon={<RiArrowGoBackLine />} label={t("undo")} onClick={mindMap.undo} disabled={!mindMap.canUndo} /><Tool icon={<RiArrowGoForwardLine />} label={t("redo")} onClick={mindMap.redo} disabled={!mindMap.canRedo} />
          <Separator />
          <div className="tw:relative"><Tool icon={<RiSearchLine />} label={t("search")} onClick={() => { setSearchOpen((value) => !value); setConnectorOpen(false); setExportOpen(false); window.setTimeout(() => documentQuery()?.focus(), 30); }} />{searchOpen && <div className="mm-popover tw:absolute tw:left-1/2 tw:top-10 tw:w-56 tw:-translate-x-1/2 tw:rounded-[12px] tw:border tw:border-[var(--mm-line)] tw:bg-[var(--mm-panel)] tw:p-1.5 tw:shadow-2xl"><label className="tw:flex tw:h-8 tw:items-center tw:gap-1.5 tw:rounded-[9px] tw:bg-[var(--mm-control)] tw:px-2 tw:text-[var(--mm-muted)]"><RiSearchLine size={16} /><input data-search value={query} onChange={(event) => { setQuery(event.target.value); setSearchIndex(0); }} placeholder={t("search")} className="tw:min-w-0 tw:flex-1 tw:border-0 tw:bg-transparent tw:text-[12px] tw:text-[var(--mm-fg)] tw:outline-none" />{query && <button aria-label={t("close")} onClick={() => setQuery("")} className="tw:flex tw:size-5 tw:items-center tw:justify-center tw:border-0 tw:bg-transparent tw:p-0 tw:text-[var(--mm-muted)]"><RiCloseLine size={14} /></button>}</label><div className="tw:mt-1 tw:max-h-44 tw:overflow-auto">{query && (searchResults.length ? searchResults.map((node, index) => <button key={node.id} onClick={() => { setSearchIndex(index); setSearchOpen(false); }} className={cn("tw:flex tw:h-7 tw:w-full tw:items-center tw:gap-2 tw:rounded-[8px] tw:border-0 tw:bg-transparent tw:px-2 tw:text-left tw:text-[12px] tw:text-[var(--mm-fg)] tw:hover:bg-[var(--mm-control)]", index === searchIndex && "tw:bg-[var(--mm-control)]")}><span className="tw:size-1.5 tw:shrink-0 tw:rounded-full tw:bg-[var(--mm-accent)]" /><span className="tw:truncate">{node.text}</span></button>) : <p className="tw:m-0 tw:px-2 tw:py-2 tw:text-[11px] tw:text-[var(--mm-muted)]">{t("emptySearch")}</p>)}</div></div>}</div>
          <Tool icon={<RiFocus3Line />} label={t("fit")} onClick={() => canvasRef.current?.fit()} />
          <div className="tw:relative"><Tool icon={<RiRouteLine />} label={t("connectorStyle")} onClick={() => { setConnectorOpen((value) => !value); setSearchOpen(false); setExportOpen(false); }} />{connectorOpen && <div className="mm-popover tw:absolute tw:right-0 tw:top-10 tw:w-32 tw:rounded-[10px] tw:border tw:border-[var(--mm-line)] tw:bg-[var(--mm-panel)] tw:p-1 tw:shadow-2xl">{(["curve", "elbow", "straight"] as ConnectorStyle[]).map((style) => <MenuItem key={style} icon={mindMap.store.settings.connectorStyle === style ? <RiCheckboxCircleFill className="tw:text-[#4F7FE8]" /> : <RiRouteLine />} label={t(style)} onClick={() => { mindMap.updateSettings({ connectorStyle: style }); setConnectorOpen(false); }} />)}</div>}</div>
          <div className="tw:relative"><Tool icon={<RiDownload2Line />} label={t("export")} onClick={() => { setExportOpen((value) => !value); setSearchOpen(false); setConnectorOpen(false); }} />{exportOpen && <div className="mm-popover tw:absolute tw:right-0 tw:top-10 tw:w-40 tw:rounded-[10px] tw:border tw:border-[var(--mm-line)] tw:bg-[var(--mm-panel)] tw:p-1 tw:shadow-2xl"><MenuItem icon={<RiBracesLine />} label={t("exportJson")} onClick={exportJson} /><MenuItem icon={<RiImageLine />} label={t("exportPng")} onClick={exportPng} /><MenuItem icon={<RiUpload2Line />} label={t("importJson")} onClick={() => { setExportOpen(false); fileRef.current?.click(); }} /></div>}</div>
      </div>}

      {view === "editor" && <div className="tw:absolute tw:left-4 tw:top-4 tw:z-30 tw:flex tw:h-11 tw:items-center tw:rounded-[13px] tw:border tw:border-[var(--mm-line)] tw:bg-[color-mix(in_srgb,var(--mm-panel)_84%,transparent)] tw:p-1.5 tw:shadow-lg tw:backdrop-blur-xl"><input value={document.title} onChange={(event) => mindMap.renameDocument(event.target.value)} className="tw:h-8 tw:w-[168px] tw:rounded-[9px] tw:border-0 tw:bg-transparent tw:px-3 tw:text-[11px] tw:font-semibold tw:text-[var(--mm-fg)] tw:outline-none tw:hover:bg-[var(--mm-control)] tw:focus:bg-[var(--mm-control)] tw:[@container(max-width:900px)]:w-[112px]" aria-label={t("rename")} /></div>}
      {view === "editor" && !inspectorOpen && <div className="tw:absolute tw:right-3 tw:top-3 tw:z-30 tw:rounded-[14px] tw:border tw:border-[var(--mm-line)] tw:bg-[color-mix(in_srgb,var(--mm-panel)_84%,transparent)] tw:p-1.5 tw:shadow-lg tw:backdrop-blur-xl"><Tooltip label={t("inspector")}><Button aria-label={t("inspector")} size="icon" variant="ghost" onClick={() => setInspectorOpen(true)}><RiSidebarFoldLine size={18} /></Button></Tooltip></div>}

      {view === "editor" && editing && editingRect && <div className="tw:fixed tw:z-50" style={{ left: editingRect.left, top: editingRect.top, width: Math.max(104, editingRect.width), height: Math.max(32, editingRect.height) }}><input autoFocus value={editing.value} onChange={(event) => setEditing({ ...editing, value: event.target.value })} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); commitEditing(); } }} className="tw:h-full tw:w-full tw:rounded-[10px] tw:border-2 tw:border-[#4F7FE8] tw:bg-[var(--mm-panel)] tw:px-2 tw:text-center tw:text-[11px] tw:font-medium tw:text-[var(--mm-fg)] tw:shadow-lg tw:outline-none" /></div>}
      {view === "editor" && <div className="tw:absolute tw:bottom-3 tw:left-3 tw:z-10 tw:flex tw:items-center tw:gap-1 tw:rounded-[12px] tw:border tw:border-[var(--mm-line)] tw:bg-[color-mix(in_srgb,var(--mm-panel)_84%,transparent)] tw:p-1 tw:shadow-lg tw:backdrop-blur-xl"><Tool icon={<RiZoomOutLine />} label={t("zoomOut")} onClick={() => canvasRef.current?.zoomBy(.85)} /><span className="tw:w-11 tw:text-center tw:text-[11px] tw:font-bold tw:text-[var(--mm-muted)]">{Math.round(zoom * 100)}%</span><Tool icon={<RiZoomInLine />} label={t("zoomIn")} onClick={() => canvasRef.current?.zoomBy(1.15)} /></div>}
      {view === "editor" && <div className="tw:absolute tw:bottom-4 tw:left-1/2 tw:z-10 tw:-translate-x-1/2 tw:rounded-full tw:bg-[color-mix(in_srgb,var(--mm-panel)_86%,transparent)] tw:px-3 tw:py-1.5 tw:text-[11px] tw:font-semibold tw:text-[var(--mm-muted)] tw:shadow-sm tw:backdrop-blur-xl tw:[@container(max-width:680px)]:hidden">{t("editHint")}</div>}
      {view === "editor" && mindMap.store.settings.showMinimap && <div className="tw:absolute tw:bottom-3 tw:right-3 tw:h-[96px] tw:w-[164px] tw:overflow-hidden tw:rounded-[14px] tw:border tw:border-[var(--mm-line)] tw:bg-[color-mix(in_srgb,var(--mm-panel)_88%,transparent)] tw:p-2 tw:shadow-lg tw:backdrop-blur-xl"><Miniature layout={layoutMindMap(document)} /></div>}
      <input ref={fileRef} className="tw:hidden" type="file" accept="application/json,.json" onChange={(event) => { void importFile(event.target.files?.[0]); event.target.value = ""; }} />
    </main>

    <Card role="complementary" aria-hidden={!inspectorVisible} inert={!inspectorVisible} className={cn("mm-sidebar tw:absolute tw:bottom-4 tw:right-4 tw:top-4 tw:z-40 tw:flex tw:w-[260px] tw:flex-col tw:overflow-hidden tw:bg-[color-mix(in_srgb,var(--mm-panel)_90%,transparent)] tw:backdrop-blur-2xl tw:will-change-[translate,opacity] tw:transition-[translate,opacity] tw:duration-300 tw:[transition-timing-function:cubic-bezier(.2,.8,.2,1)]", inspectorVisible ? "tw:translate-x-0 tw:opacity-100" : "tw:pointer-events-none tw:translate-x-[calc(100%+24px)] tw:opacity-0")}>
      <CardHeader className="tw:h-14 tw:shrink-0 tw:px-4 tw:py-3"><h2 className="tw:m-0 tw:text-[14px] tw:font-bold tw:leading-none">{t("inspector")}</h2><Tooltip label={t("close")}><Button aria-label={t("close")} className="tw:size-7" size="icon" variant="ghost" onClick={() => setInspectorOpen(false)}><RiSidebarUnfoldLine size={16} /></Button></Tooltip></CardHeader>
      <CardContent className="tw:min-h-0 tw:flex-1 tw:overflow-auto tw:p-0">{selected ? <Inspector node={selected} document={document} onUpdate={(patch) => mindMap.updateNode(selected.id, patch)} onDelete={deleteSelected} t={t} /> : <div className="tw:flex tw:h-[60%] tw:flex-col tw:items-center tw:justify-center tw:gap-2 tw:px-6 tw:text-center tw:text-[12px] tw:text-[var(--mm-muted)]"><RiMindMap size={16} className="tw:opacity-40" />{t("noSelection")}</div>}</CardContent>
    </Card>

    {view === "home" && <MindMapHome documents={mindMap.store.documents} saveState={mindMap.saveState} dark={dark} onOpen={openDocument} onCreate={createDocument} onDuplicate={mindMap.duplicateDocument} onDelete={setDeleteMapId} t={t} />}
    {deleteMapId && <ConfirmDialog title={t("deleteMapTitle")} body={t("deleteMapBody", { title: mindMap.store.documents.find((item) => item.id === deleteMapId)?.title || "" })} cancel={t("cancel")} confirm={t("confirmDelete")} onCancel={() => setDeleteMapId(undefined)} onConfirm={() => { mindMap.deleteDocument(deleteMapId); setDeleteMapId(undefined); }} />}
  </div>;
}

function MindMapHome({ documents, saveState, dark, onOpen, onCreate, onDuplicate, onDelete, t }: { documents: MindMapDocument[]; saveState: MindMapController["saveState"]; dark: boolean; onOpen: (id: string) => void; onCreate: () => void; onDuplicate: (id: string) => void; onDelete: (id: string) => void; t: ReturnType<typeof useI18n>["t"] }) {
  return <section className="mm-home tw:absolute tw:inset-0 tw:z-[70] tw:overflow-auto tw:bg-[var(--mm-bg)] tw:px-[clamp(20px,5vw,64px)] tw:py-[clamp(24px,5vh,48px)]">
    <div className="tw:mx-auto tw:max-w-[1040px]">
      <header className="tw:mb-7 tw:flex tw:items-center tw:justify-between tw:gap-4"><div className="tw:flex tw:min-w-0 tw:items-center tw:gap-3"><span className="tw:flex tw:size-9 tw:shrink-0 tw:items-center tw:justify-center tw:rounded-[12px] tw:bg-[var(--mm-accent)] tw:text-white tw:shadow-[0_7px_18px_rgba(79,127,232,.22)]"><RiMindMap size={18} /></span><div className="tw:min-w-0"><h1 className="tw:m-0 tw:text-[18px] tw:font-bold tw:leading-tight tw:tracking-[-.018em]">{t("library")}</h1><p className="tw:m-0 tw:mt-0.5 tw:truncate tw:text-[12px] tw:text-[var(--mm-muted)]">{t("librarySubtitle")}</p></div></div><Button className="tw:h-7 tw:px-2.5 tw:text-[11px]" onClick={onCreate}><RiFileAddLine size={14} />{t("newMap")}</Button></header>
      <div className="tw:grid tw:grid-cols-[repeat(auto-fill,minmax(220px,1fr))] tw:gap-4">{documents.map((item) => <Card key={item.id} className="tw:group tw:relative tw:overflow-hidden tw:rounded-[16px] tw:shadow-[0_8px_28px_rgba(20,30,50,.08)] tw:transition-[translate,box-shadow] tw:duration-200 tw:hover:-translate-y-0.5 tw:hover:shadow-[0_14px_36px_rgba(20,30,50,.13)]"><button onClick={() => onOpen(item.id)} aria-label={`${t("openMap")} ${item.title}`} className="tw:block tw:w-full tw:border-0 tw:bg-transparent tw:p-0 tw:text-left tw:text-[var(--mm-fg)]"><div className="tw:h-32 tw:border-b tw:border-[var(--mm-line)] tw:bg-[var(--mm-control)] tw:p-3"><Miniature layout={layoutMindMap(item)} dark={dark} /></div><div className="tw:px-3 tw:py-3 tw:pr-20"><strong className="tw:block tw:truncate tw:text-[13px] tw:font-bold">{item.title}</strong><span className="tw:mt-1 tw:block tw:text-[11px] tw:text-[var(--mm-muted)]">{t("nodeCount", { count: Object.keys(item.nodes).length })}</span></div></button><div className="tw:absolute tw:bottom-2 tw:right-2 tw:flex tw:gap-0.5"><Tooltip label={t("duplicate")}><Button aria-label={t("duplicate")} className="tw:size-7" size="icon" variant="ghost" onClick={() => onDuplicate(item.id)}><RiFileCopyLine size={16} /></Button></Tooltip><Tooltip label={t("delete")}><Button aria-label={t("delete")} className="tw:size-7 tw:text-red-500" size="icon" variant="ghost" onClick={() => onDelete(item.id)}><RiDeleteBinLine size={16} /></Button></Tooltip></div></Card>)}</div>
      <div className="tw:mt-6 tw:flex tw:items-center tw:gap-2 tw:text-[11px] tw:font-semibold tw:text-[var(--mm-muted)]">{saveState === "saved" ? <RiCheckboxCircleFill className="tw:text-emerald-500" size={16} /> : <span className={cn("tw:size-2 tw:rounded-full tw:bg-amber-500", saveState === "saving" && "tw:animate-pulse", saveState === "error" && "tw:bg-red-500")} />}{saveState === "error" ? t("storageError") : t("saved")}</div>
    </div>
  </section>;
}

function Inspector({ node, document, onUpdate, onDelete, t }: { node: MindMapNode; document: MindMapDocument; onUpdate: (patch: Partial<MindMapNode>) => void; onDelete: () => void; t: ReturnType<typeof useI18n>["t"] }) {
  const childCount = childrenOf(document, node.id).length;
  return <div className="tw:flex tw:flex-col tw:gap-4 tw:px-4 tw:py-3"><label className="tw:flex tw:flex-col tw:gap-2"><span className="tw:text-[10px] tw:font-bold tw:text-[var(--mm-muted)]">{t("nodeText")}</span><textarea value={node.text} onChange={(event) => onUpdate({ text: event.target.value })} className="tw:min-h-20 tw:resize-none tw:rounded-[10px] tw:border tw:border-[var(--mm-line)] tw:bg-[var(--mm-control)] tw:p-3 tw:text-[11px] tw:font-medium tw:leading-[17px] tw:text-[var(--mm-fg)] tw:outline-none tw:focus:border-[#4F7FE8] tw:focus:bg-[var(--mm-panel)]" /></label>
    {(node.parentId === document.rootId || node.color) && <div><span className="tw:mb-2 tw:block tw:text-[10px] tw:font-bold tw:text-[var(--mm-muted)]">{t("branchColor")}</span><div className="tw:flex tw:flex-wrap tw:gap-2">{BRANCH_COLORS.map((color) => <button key={color} aria-label={color} onClick={() => onUpdate({ color })} className={cn("tw:size-6 tw:rounded-full tw:border-2 tw:border-[var(--mm-panel)] tw:shadow-sm tw:outline-none", node.color === color && "tw:ring-2 tw:ring-[var(--mm-fg)] tw:ring-offset-1 tw:ring-offset-[var(--mm-panel)]")} style={{ background: color }} />)}</div></div>}
    {childCount > 0 && <Button className="tw:h-7 tw:justify-start tw:px-3 tw:text-[11px]" variant="secondary" onClick={() => onUpdate({ collapsed: !node.collapsed })}>{node.collapsed ? <RiAddLine size={15} /> : <RiSubtractLine size={15} />}{node.collapsed ? t("expand") : t("collapse")}</Button>}
    {node.position && <Button className="tw:h-7 tw:justify-start tw:px-3 tw:text-[11px]" variant="secondary" onClick={() => onUpdate({ position: undefined })}><RiFocus3Line size={15} />{t("resetPosition")}</Button>}
    <div className="tw:mt-1 tw:border-t tw:border-[var(--mm-line)] tw:pt-4"><Button className="tw:h-7 tw:w-full tw:text-[11px]" variant="destructive" disabled={node.id === document.rootId} onClick={onDelete}><RiDeleteBinLine size={15} />{t("delete")}</Button>{node.id === document.rootId && <p className="tw:m-0 tw:mt-2 tw:text-center tw:text-[10px] tw:text-[var(--mm-muted)]">{t("rootHint")}</p>}</div>
  </div>;
}

function SettingsView({ settings, onChange, t }: { settings: MindMapSettings; onChange: (patch: Partial<MindMapSettings>) => void; t: ReturnType<typeof useI18n>["t"] }) {
  return <div className="tw:h-full tw:overflow-auto tw:px-[clamp(20px,6vw,72px)] tw:py-8"><div className="tw:mx-auto tw:max-w-2xl"><div className="tw:mb-6 tw:flex tw:items-center tw:gap-3"><span className="tw:flex tw:size-9 tw:items-center tw:justify-center tw:rounded-[12px] tw:bg-[#4F7FE8] tw:text-white tw:shadow-[0_7px_18px_rgba(79,127,232,.22)]"><RiMindMap size={18} /></span><div><h1 className="tw:m-0 tw:text-[18px] tw:font-bold tw:tracking-[-.018em]">{t("settings")}</h1><p className="tw:m-0 tw:mt-0.5 tw:text-[12px] tw:text-[var(--mm-muted)]">{t("autosaveDesc")}</p></div></div><h2 className="tw:mb-2 tw:ml-3 tw:text-[11px] tw:font-bold tw:text-[var(--mm-muted)]">{t("appearance")}</h2><div className="tw:overflow-hidden tw:rounded-[16px] tw:border tw:border-[var(--mm-line)] tw:bg-[var(--mm-panel)] tw:shadow-[0_8px_30px_rgba(25,35,55,.06)]"><SettingRow title={t("showGrid")} description={t("showGridDesc")}><Switch checked={settings.showGrid} onCheckedChange={(checked) => onChange({ showGrid: checked })} /></SettingRow><SettingRow title={t("showMinimap")} description={t("showMinimapDesc")}><Switch checked={settings.showMinimap} onCheckedChange={(checked) => onChange({ showMinimap: checked })} /></SettingRow><SettingRow title={t("connectorStyle")} description={t(settings.connectorStyle)}><div className="tw:flex tw:gap-1 tw:rounded-[10px] tw:bg-[var(--mm-control)] tw:p-1">{(["curve", "elbow", "straight"] as ConnectorStyle[]).map((style) => <Button className="tw:h-7 tw:text-[12px]" key={style} size="sm" variant={settings.connectorStyle === style ? "default" : "ghost"} onClick={() => onChange({ connectorStyle: style })}>{t(style)}</Button>)}</div></SettingRow><SettingRow title={t("autosave")} description={t("autosaveDesc")}><RiCheckboxCircleFill className="tw:text-emerald-500" size={16} /></SettingRow></div></div></div>;
}

function SettingRow({ title, description, children }: { title: string; description: string; children: React.ReactNode }) { return <div className="tw:flex tw:min-h-[64px] tw:items-center tw:justify-between tw:gap-4 tw:border-b tw:border-[var(--mm-line)] tw:px-4 tw:py-3 tw:last:border-0"><div><strong className="tw:block tw:text-[12px] tw:font-semibold">{title}</strong><span className="tw:mt-1 tw:block tw:text-[11px] tw:leading-4 tw:text-[var(--mm-muted)]">{description}</span></div>{children}</div>; }
function Separator() { return <span className="tw:mx-0.5 tw:h-5 tw:w-px tw:bg-[var(--mm-line)]" />; }
function Tool({ icon, label, onClick, disabled }: { icon: React.ReactElement<{ size?: number }>; label: string; onClick: () => void; disabled?: boolean }) { return <Tooltip label={label}><Button aria-label={label} size="icon" variant="ghost" onClick={onClick} disabled={disabled}>{cloneElement(icon, { size: 18 })}</Button></Tooltip>; }
function MenuItem({ icon, label, onClick, destructive }: { icon: React.ReactNode; label: string; onClick: () => void; destructive?: boolean }) { return <button onClick={onClick} className={cn("tw:flex tw:h-7 tw:w-full tw:items-center tw:gap-1.5 tw:rounded-[8px] tw:border-0 tw:bg-transparent tw:px-2 tw:text-left tw:text-[12px] tw:font-semibold tw:text-[var(--mm-fg)] tw:hover:bg-[var(--mm-control)] tw:[&_svg]:size-4 tw:[&_svg]:shrink-0", destructive && "tw:text-red-500")}>{icon}{label}</button>; }
function ConfirmDialog({ title, body, cancel, confirm, onCancel, onConfirm }: { title: string; body: string; cancel: string; confirm: string; onCancel: () => void; onConfirm: () => void }) { return <div className="tw:fixed tw:inset-0 tw:z-[100] tw:flex tw:items-center tw:justify-center tw:bg-black/25 tw:p-5 tw:backdrop-blur-[2px]" onMouseDown={(event) => { if (event.target === event.currentTarget) onCancel(); }}><div role="alertdialog" aria-modal="true" className="tw:w-full tw:max-w-sm tw:rounded-[18px] tw:border tw:border-white/20 tw:bg-[var(--mm-panel)] tw:p-4 tw:shadow-[0_24px_80px_rgba(0,0,0,.28)]"><h2 className="tw:m-0 tw:text-[16px] tw:font-bold">{title}</h2><p className="tw:mb-4 tw:mt-2 tw:text-[12px] tw:leading-[18px] tw:text-[var(--mm-muted)]">{body}</p><div className="tw:flex tw:justify-end tw:gap-2"><Button onClick={onCancel}>{cancel}</Button><Button variant="destructive" onClick={onConfirm}>{confirm}</Button></div></div></div>; }
