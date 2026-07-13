import { BRANCH_COLORS, childrenOf } from "./model";
import type { BranchSide, MindMapDocument, MindMapNode } from "./model";

export interface LayoutNode { node: MindMapNode; x: number; y: number; width: number; height: number; side: BranchSide | "root"; color: string }
export interface LayoutEdge { from: LayoutNode; to: LayoutNode; color: string }
export interface MindMapLayout { nodes: LayoutNode[]; edges: LayoutEdge[]; bounds: { x: number; y: number; width: number; height: number } }

const ROOT_WIDTH = 160;
const NODE_HEIGHT = 42;
const X_GAP = 108;
const Y_GAP = 18;
const MAX_NODE_WIDTH = 180;
const nodeWidth = (text: string, root = false) => root ? ROOT_WIDTH : Math.min(MAX_NODE_WIDTH, Math.max(104, 36 + Array.from(text).length * 7));

export function layoutMindMap(document: MindMapDocument): MindMapLayout {
  const output: LayoutNode[] = [];
  const edges: LayoutEdge[] = [];
  const root = document.nodes[document.rootId];
  if (!root) return { nodes: [], edges: [], bounds: { x: 0, y: 0, width: 0, height: 0 } };
  const rootLayout: LayoutNode = { node: root, x: -ROOT_WIDTH / 2 + (root.position?.x || 0), y: -NODE_HEIGHT / 2 + (root.position?.y || 0), width: ROOT_WIDTH, height: NODE_HEIGHT, side: "root", color: "#5B8DEF" };
  output.push(rootLayout);
  const firstLevel = root.collapsed ? [] : childrenOf(document, root.id);
  const left: MindMapNode[] = [];
  const right: MindMapNode[] = [];
  firstLevel.forEach((node, index) => (node.side || (index % 2 ? "left" : "right")) === "left" ? left.push(node) : right.push(node));

  const visibleHeight = (node: MindMapNode): number => {
    const children = node.collapsed ? [] : childrenOf(document, node.id);
    if (!children.length) return NODE_HEIGHT;
    return Math.max(NODE_HEIGHT, children.reduce((sum, child) => sum + visibleHeight(child), 0) + Y_GAP * (children.length - 1));
  };
  const branchHeight = (nodes: MindMapNode[]) => nodes.reduce((sum, node) => sum + visibleHeight(node), 0) + Math.max(0, nodes.length - 1) * Y_GAP;

  const place = (node: MindMapNode, side: BranchSide, depth: number, centerY: number, color: string, parent: LayoutNode) => {
    const width = nodeWidth(node.text);
    const autoX = side === "right" ? ROOT_WIDTH / 2 + X_GAP + (depth - 1) * (MAX_NODE_WIDTH + X_GAP) : -ROOT_WIDTH / 2 - X_GAP - (depth - 1) * (MAX_NODE_WIDTH + X_GAP) - width;
    const item: LayoutNode = { node, x: autoX + (node.position?.x || 0), y: centerY - NODE_HEIGHT / 2 + (node.position?.y || 0), width, height: NODE_HEIGHT, side, color };
    output.push(item); edges.push({ from: parent, to: item, color });
    if (node.collapsed) return;
    const children = childrenOf(document, node.id);
    let cursor = centerY - branchHeight(children) / 2;
    children.forEach((child) => {
      const height = visibleHeight(child);
      place(child, side, depth + 1, cursor + height / 2, color, item);
      cursor += height + Y_GAP;
    });
  };

  const placeSide = (nodes: MindMapNode[], side: BranchSide) => {
    let cursor = -branchHeight(nodes) / 2;
    nodes.forEach((node, index) => {
      const height = visibleHeight(node);
      place(node, side, 1, cursor + height / 2, node.color || BRANCH_COLORS[index % BRANCH_COLORS.length], rootLayout);
      cursor += height + Y_GAP;
    });
  };
  placeSide(left, "left"); placeSide(right, "right");
  const minX = Math.min(...output.map((item) => item.x));
  const minY = Math.min(...output.map((item) => item.y));
  const maxX = Math.max(...output.map((item) => item.x + item.width));
  const maxY = Math.max(...output.map((item) => item.y + item.height));
  return { nodes: output, edges, bounds: { x: minX, y: minY, width: maxX - minX, height: maxY - minY } };
}
