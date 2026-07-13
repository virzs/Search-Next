export type BranchSide = "left" | "right";
export type ConnectorStyle = "curve" | "elbow" | "straight";

export interface MindMapNode {
  id: string;
  parentId: string | null;
  text: string;
  order: number;
  collapsed: boolean;
  color?: string;
  side?: BranchSide;
  position?: { x: number; y: number };
}

export interface MindMapDocument {
  id: string;
  title: string;
  rootId: string;
  nodes: Record<string, MindMapNode>;
  createdAt: number;
  updatedAt: number;
}

export interface MindMapSettings { showGrid: boolean; showMinimap: boolean; connectorStyle: ConnectorStyle }
export interface MindMapStoreV1 {
  schemaVersion: 1;
  activeDocumentId: string;
  documents: MindMapDocument[];
  settings: MindMapSettings;
}

export const DEFAULT_SETTINGS: MindMapSettings = { showGrid: true, showMinimap: true, connectorStyle: "curve" };
export const BRANCH_COLORS = ["#5B8DEF", "#9B7AE5", "#E8876B", "#4AAE8A", "#D39A3B", "#D56F9E"];
const uid = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export function createDocument(title?: string, language: "zh-CN" | "en-US" = "zh-CN"): MindMapDocument {
  const actualTitle = title || (language === "en-US" ? "Product vision" : "产品构想");
  const now = Date.now();
  const id = uid("map");
  const rootId = uid("node");
  const ideas = language === "en-US" ? [
    ["Experience", "right", "Clear structure", "Natural interactions"],
    ["Core features", "left", "Capture quickly", "Organize freely"],
    ["Next steps", "right", "Validate ideas", "Keep iterating"],
  ] as const : [
    ["用户体验", "right", "清晰的结构", "自然的交互"],
    ["核心功能", "left", "快速记录", "灵活整理"],
    ["下一步", "right", "验证想法", "持续迭代"],
  ] as const;
  const nodes: Record<string, MindMapNode> = {
    [rootId]: { id: rootId, parentId: null, text: actualTitle, order: 0, collapsed: false },
  };
  ideas.forEach(([label, side, ...children], index) => {
    const branchId = uid("node");
    nodes[branchId] = { id: branchId, parentId: rootId, text: label, order: index, collapsed: false, side, color: BRANCH_COLORS[index] };
    children.forEach((text, childIndex) => {
      const childId = uid("node");
      nodes[childId] = { id: childId, parentId: branchId, text, order: childIndex, collapsed: false };
    });
  });
  return { id, title: actualTitle, rootId, nodes, createdAt: now, updatedAt: now };
}

export function createStore(language: "zh-CN" | "en-US" = "zh-CN"): MindMapStoreV1 {
  const document = createDocument(undefined, language);
  return { schemaVersion: 1, activeDocumentId: document.id, documents: [document], settings: DEFAULT_SETTINGS };
}

export const childrenOf = (document: MindMapDocument, parentId: string) =>
  Object.values(document.nodes).filter((node) => node.parentId === parentId).sort((a, b) => a.order - b.order);

export function descendantsOf(document: MindMapDocument, nodeId: string): string[] {
  const output: string[] = [];
  const visit = (id: string) => childrenOf(document, id).forEach((child) => { output.push(child.id); visit(child.id); });
  visit(nodeId);
  return output;
}

export function validateDocument(value: unknown): MindMapDocument | null {
  if (!value || typeof value !== "object") return null;
  const candidate = value as Partial<MindMapDocument>;
  if (typeof candidate.id !== "string" || typeof candidate.title !== "string" || typeof candidate.rootId !== "string" || !candidate.nodes || typeof candidate.nodes !== "object") return null;
  const nodes = candidate.nodes as Record<string, MindMapNode>;
  const root = nodes[candidate.rootId];
  if (!root || root.parentId !== null) return null;
  for (const [id, node] of Object.entries(nodes)) {
    if (node.id !== id || typeof node.text !== "string" || typeof node.order !== "number" || typeof node.collapsed !== "boolean") return null;
    if (node.parentId !== null && !nodes[node.parentId]) return null;
    if (node.position && (!Number.isFinite(node.position.x) || !Number.isFinite(node.position.y))) return null;
  }
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const visit = (id: string): boolean => {
    if (visiting.has(id)) return false;
    if (visited.has(id)) return true;
    visiting.add(id);
    for (const child of Object.values(nodes).filter((item) => item.parentId === id)) if (!visit(child.id)) return false;
    visiting.delete(id); visited.add(id); return true;
  };
  if (!visit(candidate.rootId) || visited.size !== Object.keys(nodes).length) return null;
  return { id: candidate.id, title: candidate.title, rootId: candidate.rootId, nodes, createdAt: Number(candidate.createdAt) || Date.now(), updatedAt: Number(candidate.updatedAt) || Date.now() };
}
