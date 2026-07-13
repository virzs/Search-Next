import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BRANCH_COLORS, childrenOf, createDocument, createStore, descendantsOf, validateDocument } from "./model";
import type { MindMapDocument, MindMapNode, MindMapSettings, MindMapStoreV1 } from "./model";
import { readStore, writeStore } from "./storage";
import type { AppSDK } from "./types";

type History = { past: MindMapDocument[]; future: MindMapDocument[] };
const clone = <T,>(value: T): T => structuredClone(value);
const uid = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

function cloneWithFreshIds(source: MindMapDocument, title = `${source.title} 副本`): MindMapDocument {
  const idMap = new Map(Object.keys(source.nodes).map((id) => [id, uid("node")]));
  const now = Date.now();
  const nodes = Object.fromEntries(Object.values(source.nodes).map((node) => {
    const id = idMap.get(node.id)!;
    return [id, { ...node, id, parentId: node.parentId ? idMap.get(node.parentId)! : null }];
  }));
  return { ...clone(source), id: uid("map"), title, rootId: idMap.get(source.rootId)!, nodes, createdAt: now, updatedAt: now };
}

export function useMindMapStore(sdk?: AppSDK, language: "zh-CN" | "en-US" = "zh-CN") {
  const untitled = language === "en-US" ? "Untitled map" : "未命名导图";
  const copySuffix = language === "en-US" ? " copy" : " 副本";
  const [store, setStore] = useState<MindMapStoreV1>(() => createStore(language));
  const [hydrated, setHydrated] = useState(false);
  const [saveState, setSaveState] = useState<"saved" | "saving" | "error">("saved");
  const historyRef = useRef(new Map<string, History>());
  useEffect(() => { let active = true; readStore(sdk).then((value) => { if (active) { setStore(value); setHydrated(true); } }); return () => { active = false; }; }, [sdk]);
  useEffect(() => {
    if (!hydrated) return;
    setSaveState("saving");
    const timer = window.setTimeout(() => writeStore(store, sdk).then(() => setSaveState("saved")).catch(() => { setSaveState("error"); sdk?.toast?.error("保存失败", "当前更改仍保留在本次会话中"); }), 300);
    return () => window.clearTimeout(timer);
  }, [store, sdk, hydrated]);
  const activeDocument = useMemo(() => store.documents.find((item) => item.id === store.activeDocumentId) || store.documents[0], [store]);
  const getHistory = (id: string) => {
    let value = historyRef.current.get(id);
    if (!value) { value = { past: [], future: [] }; historyRef.current.set(id, value); }
    return value;
  };
  const commitDocument = useCallback((mutate: (document: MindMapDocument) => MindMapDocument, record = true) => {
    setStore((current) => {
      const index = current.documents.findIndex((item) => item.id === current.activeDocumentId); if (index < 0) return current;
      const previous = current.documents[index]; const next = { ...mutate(clone(previous)), updatedAt: Date.now() };
      if (record) { const history = getHistory(previous.id); history.past.push(clone(previous)); if (history.past.length > 100) history.past.shift(); history.future = []; }
      const documents = [...current.documents]; documents[index] = next;
      return { ...current, documents };
    });
  }, []);
  const selectDocument = useCallback((id: string) => setStore((value) => value.documents.some((item) => item.id === id) ? { ...value, activeDocumentId: id } : value), []);
  const addDocument = useCallback(() => setStore((value) => { const document = createDocument(untitled, language); return { ...value, activeDocumentId: document.id, documents: [document, ...value.documents] }; }), [language, untitled]);
  const duplicateDocument = useCallback((id: string) => setStore((value) => { const source = value.documents.find((item) => item.id === id); if (!source) return value; const document = cloneWithFreshIds(source, `${source.title}${copySuffix}`); return { ...value, activeDocumentId: document.id, documents: [document, ...value.documents] }; }), [copySuffix]);
  const deleteDocument = useCallback((id: string) => setStore((value) => {
    let documents = value.documents.filter((item) => item.id !== id); if (!documents.length) documents = [createDocument(untitled, language)];
    historyRef.current.delete(id); return { ...value, documents, activeDocumentId: value.activeDocumentId === id ? documents[0].id : value.activeDocumentId };
  }), [language, untitled]);
  const renameDocument = useCallback((title: string) => commitDocument((document) => ({ ...document, title: title || untitled, nodes: { ...document.nodes, [document.rootId]: { ...document.nodes[document.rootId], text: title || untitled } } })), [commitDocument, untitled]);
  const updateNode = useCallback((id: string, patch: Partial<MindMapNode>) => commitDocument((document) => {
    const node = document.nodes[id]; if (!node) return document;
    const nodes = { ...document.nodes, [id]: { ...node, ...patch } };
    return { ...document, title: id === document.rootId && typeof patch.text === "string" ? (patch.text || untitled) : document.title, nodes };
  }), [commitDocument, untitled]);
  const moveNodePosition = useCallback((id: string, delta: { x: number; y: number }) => commitDocument((document) => {
    const node = document.nodes[id]; if (!node) return document;
    const current = node.position || { x: 0, y: 0 };
    return { ...document, nodes: { ...document.nodes, [id]: { ...node, position: { x: current.x + delta.x, y: current.y + delta.y } } } };
  }), [commitDocument]);
  const addNode = useCallback((parentId: string, text = "新想法") => {
    const id = uid("node");
    commitDocument((document) => {
      const parent = document.nodes[parentId]; if (!parent) return document;
      const siblings = childrenOf(document, parentId);
      const isRootChild = parentId === document.rootId;
      const side = isRootChild ? (siblings.filter((item) => item.side === "right").length <= siblings.filter((item) => item.side === "left").length ? "right" : "left") : undefined;
      const node: MindMapNode = { id, parentId, text, order: siblings.length, collapsed: false, side, color: isRootChild ? BRANCH_COLORS[siblings.length % BRANCH_COLORS.length] : undefined };
      return { ...document, nodes: { ...document.nodes, [id]: node, [parentId]: { ...parent, collapsed: false } } };
    });
    return id;
  }, [commitDocument]);
  const addSibling = useCallback((id: string, text = "新想法") => {
    const node = activeDocument?.nodes[id]; return node?.parentId ? addNode(node.parentId, text) : addNode(activeDocument.rootId, text);
  }, [activeDocument, addNode]);
  const removeNode = useCallback((id: string) => commitDocument((document) => {
    if (id === document.rootId || !document.nodes[id]) return document;
    const remove = new Set([id, ...descendantsOf(document, id)]); const nodes = Object.fromEntries(Object.entries(document.nodes).filter(([nodeId]) => !remove.has(nodeId)));
    return { ...document, nodes };
  }), [commitDocument]);
  const moveNode = useCallback((id: string, targetId: string, before: boolean) => commitDocument((document) => {
    const node = document.nodes[id]; const target = document.nodes[targetId]; if (!node || !target || id === document.rootId || descendantsOf(document, id).includes(targetId)) return document;
    const nodes = clone(document.nodes);
    nodes[id].position = undefined;
    if (node.parentId && node.parentId === target.parentId) {
      const siblings = childrenOf(document, node.parentId).filter((item) => item.id !== id);
      const at = Math.max(0, siblings.findIndex((item) => item.id === targetId) + (before ? 0 : 1)); siblings.splice(at, 0, nodes[id]);
      siblings.forEach((item, order) => { nodes[item.id].order = order; });
    } else {
      const parentId = targetId;
      nodes[id].parentId = parentId; nodes[id].order = childrenOf(document, parentId).length; nodes[id].side = parentId === document.rootId ? (target.side || "right") : undefined;
      if (parentId !== document.rootId) nodes[id].color = undefined;
      nodes[parentId].collapsed = false;
    }
    return { ...document, nodes };
  }), [commitDocument]);
  const undo = useCallback(() => setStore((current) => {
    const history = getHistory(current.activeDocumentId); const previous = history.past.pop(); if (!previous) return current;
    const index = current.documents.findIndex((item) => item.id === current.activeDocumentId); history.future.push(clone(current.documents[index]));
    const documents = [...current.documents]; documents[index] = previous; return { ...current, documents };
  }), []);
  const redo = useCallback(() => setStore((current) => {
    const history = getHistory(current.activeDocumentId); const next = history.future.pop(); if (!next) return current;
    const index = current.documents.findIndex((item) => item.id === current.activeDocumentId); history.past.push(clone(current.documents[index]));
    const documents = [...current.documents]; documents[index] = next; return { ...current, documents };
  }), []);
  const importDocument = useCallback((value: unknown) => {
    const payload = value && typeof value === "object" && "document" in value ? (value as { document: unknown }).document : value;
    const valid = validateDocument(payload); if (!valid) return false;
    const document = cloneWithFreshIds(valid, valid.title);
    setStore((current) => ({ ...current, activeDocumentId: document.id, documents: [document, ...current.documents] })); return true;
  }, []);
  const updateSettings = useCallback((patch: Partial<MindMapSettings>) => setStore((value) => ({ ...value, settings: { ...value.settings, ...patch } })), []);
  const history = activeDocument ? getHistory(activeDocument.id) : { past: [], future: [] };
  return { store, activeDocument, hydrated, saveState, selectDocument, addDocument, duplicateDocument, deleteDocument, renameDocument, updateNode, moveNodePosition, addNode, addSibling, removeNode, moveNode, undo, redo, canUndo: history.past.length > 0, canRedo: history.future.length > 0, importDocument, updateSettings };
}
