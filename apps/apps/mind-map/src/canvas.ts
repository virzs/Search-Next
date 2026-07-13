import { Box, DragEvent, Group, Leafer, Path, PointerEvent, Rect, Text } from "leafer-ui";
import "@leafer-in/export";
import { descendantsOf } from "./model";
import { layoutMindMap } from "./layout";
import type { LayoutEdge, LayoutNode, MindMapLayout } from "./layout";
import type { ConnectorStyle, MindMapDocument } from "./model";

export interface CanvasCallbacks {
  onSelect: (id: string) => void;
  onSelectMany: (ids: string[]) => void;
  onEdit: (id: string) => void;
  onToggleCollapse: (id: string) => void;
  onDrop: (draggedId: string, targetId: string, before: boolean) => void;
  onMovePosition: (id: string, delta: { x: number; y: number }) => void;
  onViewport?: (scale: number) => void;
}
type NodeView = { group: Group; box: Rect; text: Text; badge: Box; badgeText: Text };

export class MindMapCanvas {
  private leafer: Leafer;
  private scene = new Group();
  private edges = new Group();
  private nodes = new Group();
  private nodeViews = new Map<string, NodeView>();
  private edgeViews = new Map<string, Path>();
  private layout: MindMapLayout = { nodes: [], edges: [], bounds: { x: 0, y: 0, width: 0, height: 0 } };
  private document?: MindMapDocument;
  private selectedId?: string;
  private selectedIds = new Set<string>();
  private scale = 1;
  private connectorStyle: ConnectorStyle = "curve";
  private dark = false;
  private callbacks: CanvasCallbacks;
  private resizeObserver: ResizeObserver;
  private wheel: (event: WheelEvent) => void;
  private selectionElement: HTMLDivElement;
  private selecting?: { startWorld: { x: number; y: number }; startPage: { x: number; y: number } };
  private renderVersion = 0;
  private reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
  private nodeAnimationFrames = new Map<string, number>();
  private edgeAnimationFrames = new Map<string, number>();
  private exitingEdges = new Map<string, LayoutEdge>();

  constructor(private container: HTMLElement, callbacks: CanvasCallbacks) {
    this.callbacks = callbacks;
    this.leafer = new Leafer({ view: container, fill: "rgba(0,0,0,0)" });
    this.scene.add(this.edges); this.scene.add(this.nodes); this.leafer.add(this.scene);
    this.resizeObserver = new ResizeObserver(() => { this.leafer.resize({ width: container.clientWidth, height: container.clientHeight }); });
    this.resizeObserver.observe(container);
    this.selectionElement = document.createElement("div");
    Object.assign(this.selectionElement.style, { position: "fixed", display: "none", pointerEvents: "none", zIndex: "40", border: "1.5px solid #4F7FE8", borderRadius: "8px", background: "rgba(79,127,232,.12)", boxShadow: "0 3px 12px rgba(79,127,232,.12)" });
    container.append(this.selectionElement);
    this.leafer.on(PointerEvent.DOWN, (event) => {
      if (event.target !== this.leafer || !event.shiftKey) return;
      event.stop(); this.selecting = { startWorld: event.getInnerPoint(this.scene), startPage: event.getPagePoint() };
      this.selectionElement.style.display = "block";
    });
    this.leafer.on(PointerEvent.MOVE, (event) => {
      if (!this.selecting) return;
      const point = event.getPagePoint(); const left = Math.min(this.selecting.startPage.x, point.x); const top = Math.min(this.selecting.startPage.y, point.y);
      Object.assign(this.selectionElement.style, { left: `${left}px`, top: `${top}px`, width: `${Math.abs(point.x - this.selecting.startPage.x)}px`, height: `${Math.abs(point.y - this.selecting.startPage.y)}px` });
    });
    this.leafer.on(PointerEvent.UP, (event) => {
      if (!this.selecting) return;
      const end = event.getInnerPoint(this.scene); const left = Math.min(this.selecting.startWorld.x, end.x); const right = Math.max(this.selecting.startWorld.x, end.x); const top = Math.min(this.selecting.startWorld.y, end.y); const bottom = Math.max(this.selecting.startWorld.y, end.y);
      const ids = this.layout.nodes.filter((item) => item.x + item.width >= left && item.x <= right && item.y + item.height >= top && item.y <= bottom).map((item) => item.node.id);
      this.selectionElement.style.display = "none"; this.selecting = undefined; if (ids.length) this.callbacks.onSelectMany(ids);
    });
    this.leafer.on(PointerEvent.TAP, (event) => {
      if (event.target === this.leafer && !event.shiftKey) this.callbacks.onSelectMany([]);
    });
    this.leafer.on(DragEvent.DRAG, (event) => {
      if (event.target !== this.leafer || this.selecting) return;
      this.scene.x = (this.scene.x || 0) + event.moveX; this.scene.y = (this.scene.y || 0) + event.moveY;
    });
    this.wheel = (event) => {
      event.preventDefault();
      if (!event.deltaY) return;
      const bounds = container.getBoundingClientRect();
      const factor = Math.exp(-event.deltaY * 0.0018);
      this.zoomAt(factor, event.clientX - bounds.left, event.clientY - bounds.top);
    };
    container.addEventListener("wheel", this.wheel, { passive: false });
  }

  render(document: MindMapDocument, selectedIds: string[], dark: boolean, connectorStyle: ConnectorStyle) {
    const previousLayout = this.layout;
    const previousDocument = this.document;
    const animateChanges = previousLayout.nodes.length > 0;
    const version = ++this.renderVersion;
    this.document = document; this.selectedIds = new Set(selectedIds); this.selectedId = selectedIds[selectedIds.length - 1]; this.layout = layoutMindMap(document); this.dark = dark; this.connectorStyle = connectorStyle;
    const activeNodes = new Set(this.layout.nodes.map((item) => item.node.id));
    const activeEdges = new Set(this.layout.edges.map((item) => item.to.node.id));
    for (const [id, view] of this.nodeViews) if (!activeNodes.has(id)) {
      const previous = previousLayout.nodes.find((item) => item.node.id === id);
      const ancestor = this.visibleAncestor(previous?.node.parentId, previousDocument);
      const targetX = ancestor && previous ? ancestor.x + (ancestor.width - previous.width) / 2 : view.group.x || 0;
      const targetY = ancestor && previous ? ancestor.y + (ancestor.height - previous.height) / 2 : view.group.y || 0;
      const finish = () => { if (version === this.renderVersion && !this.layout.nodes.some((item) => item.node.id === id)) { view.group.remove(); this.nodeViews.delete(id); } };
      if (animateChanges && !this.reduceMotion) this.animateNode(id, { x: targetX, y: targetY, opacity: 0, scaleX: .92, scaleY: .92 }, 320, finish);
      else finish();
    }
    for (const [id, path] of this.edgeViews) if (!activeEdges.has(id)) {
      const previous = previousLayout.edges.find((item) => item.to.node.id === id);
      if (previous) this.exitingEdges.set(id, previous);
      const finish = () => { if (version === this.renderVersion && !this.layout.edges.some((item) => item.to.node.id === id)) { path.remove(); this.edgeViews.delete(id); this.exitingEdges.delete(id); } };
      if (animateChanges && !this.reduceMotion) this.animateEdgeOpacity(id, 0, 280, finish);
      else finish();
    }
    this.layout.nodes.forEach((item) => this.reconcileNode(item, dark, animateChanges));
    this.layout.edges.forEach((edge) => this.reconcileEdge(edge.to.node.id, animateChanges));
  }

  private visibleAncestor(parentId: string | null | undefined, document?: MindMapDocument) {
    let id = parentId;
    while (id) {
      const visible = this.layout.nodes.find((item) => item.node.id === id);
      if (visible) return visible;
      id = document?.nodes[id]?.parentId;
    }
    return undefined;
  }

  private reconcileEdge(id: string, animate = false) {
    const edge = this.layout.edges.find((item) => item.to.node.id === id); if (!edge) return;
    this.exitingEdges.delete(id);
    let path = this.edgeViews.get(id);
    const created = !path;
    if (!path) { path = new Path({ opacity: 0 }); this.edgeViews.set(id, path); this.edges.add(path); }
    const opacity = this.dark ? .72 : .58;
    path.set({ path: this.createEdgePath(edge.from, edge.to), stroke: edge.color, strokeWidth: 3, strokeCap: "round", strokeJoin: "round", hitStroke: "none" });
    if (animate && !this.reduceMotion) this.animateEdgeOpacity(id, opacity, created ? 220 : 260);
    else { this.cancelEdgeAnimation(id); path.set({ opacity }); }
  }

  private liveNode(item: LayoutNode) {
    const group = this.nodeViews.get(item.node.id)?.group;
    return { ...item, x: group?.x ?? item.x, y: group?.y ?? item.y };
  }

  private createEdgePath(fromItem: LayoutNode, toItem: LayoutNode) {
    const from = this.liveNode(fromItem); const to = this.liveNode(toItem);
    const goesRight = to.x + to.width / 2 >= from.x + from.width / 2;
    const fromX = goesRight ? from.x + from.width : from.x;
    const toX = goesRight ? to.x : to.x + to.width;
    const fromY = from.y + from.height / 2; const toY = to.y + to.height / 2;
    if (this.connectorStyle === "straight") return `M ${fromX} ${fromY} L ${toX} ${toY}`;
    const direction = goesRight ? 1 : -1;
    const bend = Math.max(36, Math.abs(toX - fromX) * .52);
    if (this.connectorStyle === "elbow") {
      const middleX = fromX + (toX - fromX) / 2;
      return `M ${fromX} ${fromY} L ${middleX} ${fromY} L ${middleX} ${toY} L ${toX} ${toY}`;
    }
    return `M ${fromX} ${fromY} C ${fromX + direction * bend} ${fromY}, ${toX - direction * bend} ${toY}, ${toX} ${toY}`;
  }

  private updateConnectedEdges(id: string) {
    this.layout.edges.forEach((edge) => {
      if (edge.from.node.id !== id && edge.to.node.id !== id) return;
      this.edgeViews.get(edge.to.node.id)?.set({ path: this.createEdgePath(edge.from, edge.to) });
    });
    this.exitingEdges.forEach((edge, edgeId) => {
      if (edge.from.node.id !== id && edge.to.node.id !== id) return;
      this.edgeViews.get(edgeId)?.set({ path: this.createEdgePath(edge.from, edge.to) });
    });
  }

  private cancelNodeAnimation(id: string) {
    const frame = this.nodeAnimationFrames.get(id);
    if (frame !== undefined) window.cancelAnimationFrame(frame);
    this.nodeAnimationFrames.delete(id);
  }

  private cancelEdgeAnimation(id: string) {
    const frame = this.edgeAnimationFrames.get(id);
    if (frame !== undefined) window.cancelAnimationFrame(frame);
    this.edgeAnimationFrames.delete(id);
  }

  private animateNode(id: string, target: { x: number; y: number; opacity: number; scaleX: number; scaleY: number }, duration: number, onComplete?: () => void) {
    const group = this.nodeViews.get(id)?.group;
    if (!group) { onComplete?.(); return; }
    this.cancelNodeAnimation(id);
    if (this.reduceMotion) { group.set(target); this.updateConnectedEdges(id); onComplete?.(); return; }
    const start = { x: group.x || 0, y: group.y || 0, opacity: group.opacity ?? 1, scaleX: group.scaleX ?? 1, scaleY: group.scaleY ?? 1 };
    const startedAt = performance.now();
    const tick = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      group.set({
        x: start.x + (target.x - start.x) * eased,
        y: start.y + (target.y - start.y) * eased,
        opacity: start.opacity + (target.opacity - start.opacity) * eased,
        scaleX: start.scaleX + (target.scaleX - start.scaleX) * eased,
        scaleY: start.scaleY + (target.scaleY - start.scaleY) * eased,
      });
      this.updateConnectedEdges(id);
      if (progress < 1) this.nodeAnimationFrames.set(id, window.requestAnimationFrame(tick));
      else { this.nodeAnimationFrames.delete(id); onComplete?.(); }
    };
    this.nodeAnimationFrames.set(id, window.requestAnimationFrame(tick));
  }

  private animateEdgeOpacity(id: string, target: number, duration: number, onComplete?: () => void) {
    const path = this.edgeViews.get(id);
    if (!path) { onComplete?.(); return; }
    this.cancelEdgeAnimation(id);
    if (this.reduceMotion) { path.set({ opacity: target }); onComplete?.(); return; }
    const start = path.opacity ?? 1;
    const startedAt = performance.now();
    const tick = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      path.set({ opacity: start + (target - start) * eased });
      if (progress < 1) this.edgeAnimationFrames.set(id, window.requestAnimationFrame(tick));
      else { this.edgeAnimationFrames.delete(id); onComplete?.(); }
    };
    this.edgeAnimationFrames.set(id, window.requestAnimationFrame(tick));
  }

  private reconcileNode(item: LayoutNode, dark: boolean, animate = false) {
    const id = item.node.id;
    let view = this.nodeViews.get(id);
    const created = !view;
    if (!view) {
      const group = new Group({ draggable: true, cursor: "pointer" });
      const box = new Rect();
      const text = new Text();
      const badge = new Box({ width: 18, height: 18, cornerRadius: 9, cursor: "pointer" });
      const badgeText = new Text({ width: 18, height: 18, textAlign: "center", verticalAlign: "middle", fontSize: 12, fontWeight: 650 });
      badge.add(badgeText); group.add(box); group.add(text); group.add(badge); this.nodes.add(group);
      group.on(PointerEvent.TAP, () => this.callbacks.onSelect(id));
      group.on(PointerEvent.DOUBLE_TAP, () => this.callbacks.onEdit(id));
      group.on(DragEvent.START, () => { this.cancelNodeAnimation(id); this.callbacks.onSelect(id); });
      group.on(DragEvent.DRAG, () => this.updateConnectedEdges(id));
      group.on(DragEvent.END, (event) => this.finishDrag(id, group, event.altKey));
      badge.on(PointerEvent.TAP, (event) => { event.stop(); this.callbacks.onToggleCollapse(id); });
      view = { group, box, text, badge, badgeText }; this.nodeViews.set(id, view);
    }
    const selected = this.selectedIds.has(id);
    if (created && animate && !this.reduceMotion) {
      const parent = this.layout.nodes.find((candidate) => candidate.node.id === item.node.parentId);
      view.group.set({ x: parent ? parent.x + (parent.width - item.width) / 2 : item.x, y: parent ? parent.y + (parent.height - item.height) / 2 : item.y, draggable: true, opacity: 0, scaleX: .92, scaleY: .92 });
    }
    const groupData = { x: item.x, y: item.y, draggable: true, opacity: 1, scaleX: 1, scaleY: 1 };
    if (animate && !this.reduceMotion) this.animateNode(id, groupData, 320);
    else { this.cancelNodeAnimation(id); view.group.set(groupData); }
    view.box.set({ width: item.width, height: item.height, cornerRadius: item.side === "root" ? 16 : 12, fill: item.side === "root" ? item.color : (dark ? "#25272D" : "#FFFFFF"), stroke: selected ? item.color : (dark ? "rgba(255,255,255,.12)" : "rgba(31,35,48,.09)"), strokeWidth: selected ? 2.5 : 1, shadow: { x: 0, y: selected ? 7 : 3, blur: selected ? 19 : 12, color: dark ? "rgba(0,0,0,.35)" : "rgba(35,51,79,.12)" } });
    view.text.set({ x: 14, y: 0, width: item.width - 28, height: item.height, text: item.node.text || " ", fill: item.side === "root" ? "#FFFFFF" : (dark ? "#F5F5F7" : "#202124"), fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Text, system-ui, sans-serif", fontSize: item.side === "root" ? 14 : 12, fontWeight: item.side === "root" ? 700 : 600, textAlign: "center", verticalAlign: "middle", textOverflow: "ellipsis", padding: [0, 2] });
    const childCount = this.document ? Object.values(this.document.nodes).filter((node) => node.parentId === id).length : 0;
    const showBadge = childCount > 0;
    view.badge.set({ visible: showBadge, x: item.side === "left" ? -9 : item.width - 9, y: 12, fill: dark ? "#3A3D45" : "#FFFFFF", stroke: item.color, strokeWidth: 1.5 });
    view.badgeText.set({ text: item.node.collapsed ? "+" : "−", fill: item.color });
  }

  private finishDrag(id: string, group: Group, reparent: boolean) {
    const source = this.layout.nodes.find((item) => item.node.id === id);
    if (!source || !this.document) return;
    const center = { x: (group.x || 0) + source.width / 2, y: (group.y || 0) + source.height / 2 };
    if (reparent && id !== this.document.rootId) {
      const invalid = new Set([id, ...descendantsOf(this.document, id)]);
      const target = this.layout.nodes.filter((item) => !invalid.has(item.node.id)).map((item) => {
        const live = this.liveNode(item);
        return { item, distance: Math.hypot(live.x + live.width / 2 - center.x, live.y + live.height / 2 - center.y) };
      }).sort((a, b) => a.distance - b.distance)[0];
      if (target && target.distance < 180) {
        group.set({ x: source.x, y: source.y }); this.updateConnectedEdges(id);
        this.callbacks.onDrop(id, target.item.node.id, center.y < target.item.y + target.item.height / 2); return;
      }
    }
    const delta = { x: (group.x || 0) - source.x, y: (group.y || 0) - source.y };
    if (Math.abs(delta.x) > .5 || Math.abs(delta.y) > .5) this.callbacks.onMovePosition(id, delta);
  }

  fit() {
    const { width, height } = this.container.getBoundingClientRect();
    if (!width || !height || !this.layout.nodes.length) return;
    const bounds = this.layout.bounds;
    this.scale = Math.min(1.2, Math.max(.28, Math.min((width - 120) / Math.max(bounds.width, 1), (height - 140) / Math.max(bounds.height, 1))));
    this.scene.set({ scaleX: this.scale, scaleY: this.scale, x: width / 2 - (bounds.x + bounds.width / 2) * this.scale, y: height / 2 - (bounds.y + bounds.height / 2) * this.scale });
    this.callbacks.onViewport?.(this.scale);
  }
  zoomBy(factor: number) { this.zoomAt(factor, this.container.clientWidth / 2, this.container.clientHeight / 2); }
  private zoomAt(factor: number, x: number, y: number) {
    const next = Math.max(.25, Math.min(2.5, this.scale * factor));
    const worldX = (x - (this.scene.x || 0)) / this.scale;
    const worldY = (y - (this.scene.y || 0)) / this.scale;
    this.scale = next;
    this.scene.set({ scaleX: next, scaleY: next, x: x - worldX * next, y: y - worldY * next });
    this.callbacks.onViewport?.(next);
  }
  focusNode(id: string) {
    const item = this.layout.nodes.find((node) => node.node.id === id); if (!item) return;
    this.scene.set({ x: this.container.clientWidth / 2 - (item.x + item.width / 2) * this.scale, y: this.container.clientHeight / 2 - (item.y + item.height / 2) * this.scale });
  }
  getNodeRect(id: string) {
    const item = this.layout.nodes.find((node) => node.node.id === id); if (!item) return null;
    const group = this.nodeViews.get(id)?.group;
    const bounds = this.container.getBoundingClientRect();
    return { left: bounds.left + (this.scene.x || 0) + (group?.x ?? item.x) * this.scale, top: bounds.top + (this.scene.y || 0) + (group?.y ?? item.y) * this.scale, width: item.width * this.scale, height: item.height * this.scale };
  }
  getLayout() { return this.layout; }
  async exportPng(filename: string, dark: boolean) { await this.scene.export(filename, { padding: 56, fill: dark ? "#14161A" : "#F7F8FA", pixelRatio: 2 }); }
  destroy() {
    this.container.removeEventListener("wheel", this.wheel); this.resizeObserver.disconnect(); this.selectionElement.remove();
    this.nodeAnimationFrames.forEach((frame) => window.cancelAnimationFrame(frame)); this.edgeAnimationFrames.forEach((frame) => window.cancelAnimationFrame(frame));
    this.nodeAnimationFrames.clear(); this.edgeAnimationFrames.clear(); this.exitingEdges.clear(); this.leafer.destroy();
  }
}
