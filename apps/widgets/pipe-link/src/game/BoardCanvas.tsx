import { useEffect, useRef } from "react";
import { GameLoop, init, initKeys, offKey, onKey } from "kontra";
import {
  getPipeConnections,
  getPipeShapeAt,
  getTileKind,
  pointKey,
} from "./logic";
import type { WidgetTranslationFn } from "../i18n";
import type { AnimationLevel } from "../types";
import type { Direction, GameState, LevelConfig, PipeShape, Point } from "./types";

const KEY_BINDINGS: Array<[string[], Direction]> = [
  [["w", "arrowup"], "up"],
  [["d", "arrowright"], "right"],
  [["s", "arrowdown"], "down"],
  [["a", "arrowleft"], "left"],
];

const BOARD_ROWS = 6;
const BOARD_COLS = 6;

const getBoardMetrics = (width: number, height: number, compact: boolean) => {
  const padding = compact ? width * 0.055 : Math.min(width, height) * 0.055;
  const gap = compact ? Math.max(3, width * 0.012) : Math.max(6, Math.min(width, height) * 0.012);
  const availableWidth = width - padding * 2 - gap * (BOARD_COLS - 1);
  const availableHeight = height - padding * 2 - gap * (BOARD_ROWS - 1);
  const cellSize = Math.floor(
    Math.min(availableWidth / BOARD_COLS, availableHeight / BOARD_ROWS),
  );
  const boardWidth = cellSize * BOARD_COLS + gap * (BOARD_COLS - 1);
  const boardHeight = cellSize * BOARD_ROWS + gap * (BOARD_ROWS - 1);
  return {
    cellSize,
    gap,
    originX: (width - boardWidth) / 2,
    originY: (height - boardHeight) / 2,
  };
};

const getPointFromCanvasEvent = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  compact: boolean,
): Point | null => {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const x = (event.clientX - rect.left) * scaleX;
  const y = (event.clientY - rect.top) * scaleY;
  const { originX, originY, cellSize, gap } = getBoardMetrics(canvas.width, canvas.height, compact);
  const stride = cellSize + gap;
  const col = Math.floor((x - originX) / stride);
  const row = Math.floor((y - originY) / stride);
  if (row < 0 || row >= BOARD_ROWS || col < 0 || col >= BOARD_COLS) return null;
  const cellX = originX + col * stride;
  const cellY = originY + row * stride;
  if (x < cellX || x > cellX + cellSize || y < cellY || y > cellY + cellSize) {
    return null;
  }
  return { row, col };
};

const drawRoundedRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) => {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
};

const getCenter = (
  point: Point,
  originX: number,
  originY: number,
  cellSize: number,
  gap: number,
) => ({
  x: originX + point.col * (cellSize + gap) + cellSize / 2,
  y: originY + point.row * (cellSize + gap) + cellSize / 2,
});

const directionAngle: Record<Direction, number> = {
  right: 0,
  down: Math.PI / 2,
  left: Math.PI,
  up: -Math.PI / 2,
};

const drawConnector = (
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  cellSize: number,
  direction: Direction,
  color: string,
) => {
  const length = cellSize * 0.36;
  const width = Math.max(8, cellSize * 0.16);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(directionAngle[direction]);
  const gradient = ctx.createLinearGradient(0, 0, length, 0);
  gradient.addColorStop(0, "#0b2634");
  gradient.addColorStop(0.45, color);
  gradient.addColorStop(1, "#93f7ff");
  ctx.fillStyle = gradient;
  drawRoundedRect(ctx, 0, -width / 2, length, width, width / 2);
  ctx.fill();
  ctx.restore();
};

const drawPipe = (
  ctx: CanvasRenderingContext2D,
  shape: PipeShape,
  x: number,
  y: number,
  cellSize: number,
  active: boolean,
) => {
  const cx = x + cellSize / 2;
  const cy = y + cellSize / 2;
  const core = active ? "#b8fbff" : "#28b9d5";
  ctx.save();
  ctx.globalAlpha = active ? 1 : 0.82;
  for (const direction of getPipeConnections(shape)) {
    drawConnector(ctx, cx, cy, cellSize, direction, core);
  }
  ctx.fillStyle = active ? "#eaffff" : "#103b4f";
  ctx.beginPath();
  ctx.arc(cx, cy, Math.max(8, cellSize * 0.17), 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = active ? "#ffffff" : "#51d8ef";
  ctx.lineWidth = Math.max(2, cellSize * 0.035);
  ctx.stroke();
  ctx.restore();
};

const drawRotator = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  cellSize: number,
  active: boolean,
  tick: number,
) => {
  const cx = x + cellSize / 2;
  const cy = y + cellSize / 2;
  const radius = cellSize * 0.25;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(active ? tick * 0.04 : 0);
  ctx.strokeStyle = active ? "#eaffff" : "#42c7df";
  ctx.lineWidth = Math.max(7, cellSize * 0.09);
  ctx.beginPath();
  ctx.arc(0, 0, radius, Math.PI * 0.1, Math.PI * 1.62);
  ctx.stroke();
  ctx.fillStyle = active ? "#ffffff" : "#42c7df";
  ctx.beginPath();
  ctx.moveTo(radius * 0.98, -radius * 0.25);
  ctx.lineTo(radius * 1.45, -radius * 0.08);
  ctx.lineTo(radius * 1.05, radius * 0.28);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
};

const drawTarget = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  cellSize: number,
  collected: boolean,
) => {
  const cx = x + cellSize / 2;
  const cy = y + cellSize / 2;
  const size = cellSize * 0.32;
  ctx.save();
  ctx.strokeStyle = collected ? "#2a1b05" : "#351d06";
  ctx.lineWidth = Math.max(4, cellSize * 0.06);
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(cx - size, cy - size);
  ctx.lineTo(cx + size, cy + size);
  ctx.moveTo(cx + size, cy - size);
  ctx.lineTo(cx - size, cy + size);
  ctx.moveTo(cx - size, cy);
  ctx.lineTo(cx + size, cy);
  ctx.moveTo(cx, cy - size);
  ctx.lineTo(cx, cy + size);
  ctx.stroke();
  ctx.fillStyle = collected ? "#fff2a8" : "#1e1205";
  for (const [dx, dy] of [
    [-size, -size],
    [size, -size],
    [-size, size],
    [size, size],
  ]) {
    ctx.beginPath();
    ctx.arc(cx + dx, cy + dy, cellSize * 0.045, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
};

const drawStartFinish = (
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  cellSize: number,
  color: string,
) => {
  ctx.fillStyle = color;
  ctx.font = `800 ${Math.max(11, cellSize * 0.18)}px -apple-system,BlinkMacSystemFont,system-ui,sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, x + cellSize / 2, y + cellSize / 2);
};

const drawCurrentMarker = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  cellSize: number,
) => {
  ctx.save();
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = Math.max(4, cellSize * 0.06);
  drawRoundedRect(
    ctx,
    x + cellSize * 0.04,
    y + cellSize * 0.04,
    cellSize * 0.92,
    cellSize * 0.92,
    cellSize * 0.14,
  );
  ctx.stroke();
  ctx.shadowColor = "#ffffff";
  ctx.shadowBlur = 16;
  ctx.stroke();
  ctx.restore();
};

const drawVisitedLinks = (
  ctx: CanvasRenderingContext2D,
  level: LevelConfig,
  state: GameState,
  originX: number,
  originY: number,
  cellSize: number,
  gap: number,
) => {
  ctx.save();
  ctx.strokeStyle = "rgba(231, 255, 255, 0.78)";
  ctx.lineWidth = Math.max(3, cellSize * 0.045);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  const validVisited = state.visitedKeys
    .map((key) => {
      const [row, col] = key.split(":").map(Number);
      return { row, col };
    })
    .filter((point) => point.row < level.rows && point.col < level.cols);
  validVisited.forEach((point, index) => {
    const center = getCenter(point, originX, originY, cellSize, gap);
    if (index === 0) ctx.moveTo(center.x, center.y);
    else ctx.lineTo(center.x, center.y);
  });
  ctx.stroke();
  ctx.restore();
};

export interface BoardCanvasProps {
  level: LevelConfig;
  state: GameState;
  animation: AnimationLevel;
  interactive?: boolean;
  compact?: boolean;
  label?: string;
  onMove?: (direction: Direction) => void;
  onCellClick?: (point: Point) => void;
  t?: WidgetTranslationFn;
}

export const BoardCanvas = ({
  level,
  state,
  animation,
  interactive = true,
  compact = false,
  label,
  onMove,
  onCellClick,
  t,
}: BoardCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef(state);
  const levelRef = useRef(level);
  const animationRef = useRef(animation);
  const onMoveRef = useRef(onMove);
  const onCellClickRef = useRef(onCellClick);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    levelRef.current = level;
  }, [level]);

  useEffect(() => {
    animationRef.current = animation;
  }, [animation]);

  useEffect(() => {
    onMoveRef.current = onMove;
  }, [onMove]);

  useEffect(() => {
    onCellClickRef.current = onCellClick;
  }, [onCellClick]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const scale = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.floor(rect.width * scale));
      canvas.height = Math.max(1, Math.floor(rect.height * scale));
    };

    resizeCanvas();
    const observer = new ResizeObserver(resizeCanvas);
    observer.observe(canvas);

    init(canvas);
    if (interactive) {
      initKeys();
      KEY_BINDINGS.forEach(([keys, direction]) => {
        onKey(keys, (event: KeyboardEvent) => {
          onMoveRef.current?.(direction);
        });
      });
    }
    const handlePointerDown = (event: PointerEvent) => {
      const point = getPointFromCanvasEvent(canvas, event, compact);
      if (point) onCellClickRef.current?.(point);
    };
    if (onCellClickRef.current) {
      canvas.addEventListener("pointerdown", handlePointerDown);
    }

    let tick = 0;
    const loop = GameLoop({
      update() {
        tick += animationRef.current === "high" ? 2 : 1;
      },
      render() {
        drawBoard(
          canvas,
          levelRef.current,
          stateRef.current,
          animationRef.current,
          tick,
          compact,
          t,
        );
      },
    });
    loop.start();

    return () => {
      loop.stop();
      observer.disconnect();
      if (interactive) {
        KEY_BINDINGS.forEach(([keys]) => offKey(keys));
      }
      canvas.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [compact, interactive, Boolean(onCellClick), t]);

  return (
    <canvas
      ref={canvasRef}
      className="pipe-link-canvas"
      aria-label={t ? t("aria.board", { name: label ?? level.name }) : `${label ?? level.name} game board`}
    />
  );
};

export const drawBoard = (
  canvas: HTMLCanvasElement,
  level: LevelConfig,
  state: GameState,
  animation: AnimationLevel,
  tick: number,
  compact: boolean,
  t?: WidgetTranslationFn,
) => {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const width = canvas.width;
  const height = canvas.height;
  ctx.clearRect(0, 0, width, height);

  const background = ctx.createLinearGradient(0, 0, width, height);
  background.addColorStop(0, "#08161d");
  background.addColorStop(0.52, "#0b2d3a");
  background.addColorStop(1, "#061014");
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, width, height);

  const { originX, originY, cellSize, gap } = getBoardMetrics(width, height, compact);
  const pulse =
    animation === "low" ? 0 : (Math.sin(tick / 18) + 1) * (animation === "high" ? 0.08 : 0.04);

  drawVisitedLinks(ctx, level, state, originX, originY, cellSize, gap);

  for (let row = 0; row < BOARD_ROWS; row += 1) {
    for (let col = 0; col < BOARD_COLS; col += 1) {
      const point = { row, col };
      const key = pointKey(point);
      const x = originX + col * (cellSize + gap);
      const y = originY + row * (cellSize + gap);
      const playable = row < level.rows && col < level.cols;
      const kind = playable ? getTileKind(level, state, point) : "block";
      const visited = state.visitedKeys.includes(key);
      const collected = state.collectedTargetKeys.includes(key);
      const isCurrent = pointKey(state.position) === key;

      const tileGradient = ctx.createLinearGradient(x, y, x, y + cellSize);
      if (kind === "block") {
        tileGradient.addColorStop(0, "#263238");
        tileGradient.addColorStop(1, "#101820");
      } else if (kind === "target") {
        tileGradient.addColorStop(0, collected ? "#ffd66d" : "#f0a332");
        tileGradient.addColorStop(1, collected ? "#f9a91d" : "#8f4c17");
      } else if (kind === "start") {
        tileGradient.addColorStop(0, "#5fffd1");
        tileGradient.addColorStop(1, "#19c58e");
      } else if (kind === "finish") {
        tileGradient.addColorStop(0, "#6ff0c4");
        tileGradient.addColorStop(1, "#159f77");
      } else if (visited) {
        tileGradient.addColorStop(0, `rgba(98, 237, 255, ${0.96 + pulse})`);
        tileGradient.addColorStop(1, "#1da7c3");
      } else {
        tileGradient.addColorStop(0, "#0c4153");
        tileGradient.addColorStop(1, "#082430");
      }

      ctx.save();
      ctx.shadowColor = visited || isCurrent ? "#77f8ff" : "rgba(0,0,0,0.55)";
      ctx.shadowBlur = visited || isCurrent ? 16 : 7;
      drawRoundedRect(ctx, x, y, cellSize, cellSize, cellSize * 0.11);
      ctx.fillStyle = tileGradient;
      ctx.fill();
      ctx.restore();

      ctx.strokeStyle =
        kind === "block"
          ? "#39464e"
          : visited || isCurrent
            ? "rgba(224, 255, 255, 0.85)"
            : "#176b83";
      ctx.lineWidth = Math.max(2, cellSize * 0.025);
      drawRoundedRect(ctx, x + 1, y + 1, cellSize - 2, cellSize - 2, cellSize * 0.11);
      ctx.stroke();

      if (kind === "block") {
        ctx.save();
        ctx.strokeStyle = "#566269";
        ctx.lineWidth = Math.max(7, cellSize * 0.11);
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(x + cellSize * 0.25, y + cellSize * 0.25);
        ctx.lineTo(x + cellSize * 0.75, y + cellSize * 0.75);
        ctx.moveTo(x + cellSize * 0.75, y + cellSize * 0.25);
        ctx.lineTo(x + cellSize * 0.25, y + cellSize * 0.75);
        ctx.stroke();
        ctx.restore();
      }

      if (kind === "target") drawTarget(ctx, x, y, cellSize, collected);
      if (kind === "rotate") drawRotator(ctx, x, y, cellSize, visited, tick);

      const pipeShape = getPipeShapeAt(level, state, point);
      if (pipeShape) drawPipe(ctx, pipeShape, x, y, cellSize, visited || isCurrent);

      if (kind === "start") drawStartFinish(ctx, t?.("board.start") ?? "Start", x, y, cellSize, "#05271f");
      if (kind === "finish") drawStartFinish(ctx, t?.("board.finish") ?? "Finish", x, y, cellSize, "#05271f");
      if (isCurrent) drawCurrentMarker(ctx, x, y, cellSize);
    }
  }
};
