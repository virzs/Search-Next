import type {
  Direction,
  GameSnapshot,
  GameState,
  LevelConfig,
  MoveResult,
  PipeShape,
  Point,
  TileKind,
} from "./types";

export const DIRECTIONS: Direction[] = ["up", "right", "down", "left"];

export const DIRECTION_VECTORS: Record<Direction, Point> = {
  up: { row: -1, col: 0 },
  right: { row: 0, col: 1 },
  down: { row: 1, col: 0 },
  left: { row: 0, col: -1 },
};

export const OPPOSITE_DIRECTION: Record<Direction, Direction> = {
  up: "down",
  right: "left",
  down: "up",
  left: "right",
};

const PIPE_CONNECTIONS: Record<PipeShape, Direction[]> = {
  horizontal: ["left", "right"],
  vertical: ["up", "down"],
  "curve-ur": ["up", "right"],
  "curve-rd": ["right", "down"],
  "curve-dl": ["down", "left"],
  "curve-lu": ["left", "up"],
};

const ROTATED_PIPE_SHAPE: Record<PipeShape, PipeShape> = {
  horizontal: "vertical",
  vertical: "horizontal",
  "curve-ur": "curve-rd",
  "curve-rd": "curve-dl",
  "curve-dl": "curve-lu",
  "curve-lu": "curve-ur",
};

export const pointKey = (point: Point) => `${point.row}:${point.col}`;

export const samePoint = (a: Point, b: Point) =>
  a.row === b.row && a.col === b.col;

export const movePoint = (point: Point, direction: Direction): Point => {
  const vector = DIRECTION_VECTORS[direction];
  return {
    row: point.row + vector.row,
    col: point.col + vector.col,
  };
};

export const isInsideLevel = (level: LevelConfig, point: Point) =>
  point.row >= 0 &&
  point.col >= 0 &&
  point.row < level.rows &&
  point.col < level.cols;

export const getPipeShapeAt = (
  level: LevelConfig,
  state: Pick<GameState, "pipeShapes">,
  point: Point,
) => state.pipeShapes[pointKey(point)] ?? null;

export const getPipeConnections = (shape: PipeShape) =>
  PIPE_CONNECTIONS[shape];

export const getTileKind = (
  level: LevelConfig,
  state: Pick<GameState, "pipeShapes">,
  point: Point,
): TileKind => {
  if (samePoint(point, level.start)) return "start";
  if (samePoint(point, level.finish)) return "finish";
  const key = pointKey(point);
  if (level.targets.some((target) => pointKey(target) === key)) return "target";
  if (level.blockers?.some((blocker) => pointKey(blocker) === key)) {
    return "block";
  }
  if (level.rotators?.some((rotator) => pointKey(rotator) === key)) {
    return "rotate";
  }
  if (state.pipeShapes[key]) return "pipe";
  return "normal";
};

export const countTargets = (level: LevelConfig) => level.targets.length;

export const createGameState = (level: LevelConfig): GameState => {
  const pipeShapes = Object.fromEntries(
    (level.pipes ?? []).map((pipe) => [pointKey(pipe.point), pipe.shape]),
  );
  const startKey = pointKey(level.start);
  return {
    levelId: level.id,
    position: { ...level.start },
    visitedKeys: [startKey],
    collectedTargetKeys: level.targets.some((target) => pointKey(target) === startKey)
      ? [startKey]
      : [],
    pipeShapes,
    steps: 0,
    completed: false,
    history: [],
  };
};

const snapshotState = (state: GameState): GameSnapshot => ({
  position: { ...state.position },
  previousPosition: state.previousPosition
    ? { ...state.previousPosition }
    : undefined,
  enteredPipeFrom: state.enteredPipeFrom,
  visitedKeys: [...state.visitedKeys],
  collectedTargetKeys: [...state.collectedTargetKeys],
  pipeShapes: { ...state.pipeShapes },
  steps: state.steps,
  completed: state.completed,
  message: state.message,
});

const restoreSnapshot = (
  levelId: string,
  snapshot: GameSnapshot,
  history: GameSnapshot[],
): GameState => ({
  levelId,
  position: { ...snapshot.position },
  previousPosition: snapshot.previousPosition
    ? { ...snapshot.previousPosition }
    : undefined,
  enteredPipeFrom: snapshot.enteredPipeFrom,
  visitedKeys: [...snapshot.visitedKeys],
  collectedTargetKeys: [...snapshot.collectedTargetKeys],
  pipeShapes: { ...snapshot.pipeShapes },
  steps: snapshot.steps,
  completed: snapshot.completed,
  message: snapshot.message,
  history,
});

const restorePreviousStep = (state: GameState): GameState | null => {
  const previous = state.history[state.history.length - 1];
  if (!previous) return null;
  return {
    ...restoreSnapshot(state.levelId, previous, state.history.slice(0, -1)),
    message: "已回退一步",
  };
};

const rotatePipes = (pipeShapes: Record<string, PipeShape>) =>
  Object.fromEntries(
    Object.entries(pipeShapes).map(([key, shape]) => [
      key,
      ROTATED_PIPE_SHAPE[shape],
    ]),
  );

const serializeSearchState = (state: GameState) => {
  const visitedKeys = state.visitedKeys.join(">");
  const targetKeys = [...state.collectedTargetKeys].sort().join(",");
  const pipeShapes = Object.entries(state.pipeShapes)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, shape]) => `${key}:${shape}`)
    .join(",");

  return [
    pointKey(state.position),
    state.enteredPipeFrom ?? "free",
    visitedKeys,
    targetKeys,
    pipeShapes,
  ].join("|");
};

const canCompleteWhileAvoiding = (
  level: LevelConfig,
  avoidedTileKeys: Set<string>,
) => {
  if (avoidedTileKeys.has(pointKey(level.start))) return false;

  const initialState = createGameState(level);
  const queue: GameState[] = [{ ...initialState, history: [] }];
  const seen = new Set([serializeSearchState(initialState)]);

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) break;
    if (current.completed) return true;

    for (const direction of DIRECTIONS) {
      const move = applyMove(level, current, direction);
      if (!move.moved) continue;

      const nextKey = pointKey(move.state.position);
      if (avoidedTileKeys.has(nextKey)) continue;

      const nextState = { ...move.state, history: [] };
      const stateKey = serializeSearchState(nextState);
      if (seen.has(stateKey)) continue;

      seen.add(stateKey);
      queue.push(nextState);
    }
  }

  return false;
};

const canEnterPipe = (
  level: LevelConfig,
  state: GameState,
  point: Point,
  movementDirection: Direction,
) => {
  const shape = getPipeShapeAt(level, state, point);
  if (!shape) return true;
  const entrySide = OPPOSITE_DIRECTION[movementDirection];
  return PIPE_CONNECTIONS[shape].includes(entrySide);
};

const getRequiredPipeExit = (
  level: LevelConfig,
  state: GameState,
): Direction | null => {
  const shape = getPipeShapeAt(level, state, state.position);
  if (!shape || !state.enteredPipeFrom) return null;
  const connections = PIPE_CONNECTIONS[shape];
  if (!connections.includes(state.enteredPipeFrom)) return null;
  return connections.find((direction) => direction !== state.enteredPipeFrom) ?? null;
};

export const applyMove = (
  level: LevelConfig,
  state: GameState,
  direction: Direction,
): MoveResult => {
  if (state.completed) {
    return { state, moved: false, blockedReason: "关卡已完成" };
  }

  const nextPosition = movePoint(state.position, direction);
  const nextKey = pointKey(nextPosition);
  const previousPathKey = state.visitedKeys[state.visitedKeys.length - 2];
  if (previousPathKey && nextKey === previousPathKey) {
    const backtrackedState = restorePreviousStep(state);
    if (backtrackedState) {
      return { state: backtrackedState, moved: true };
    }
  }

  const requiredPipeExit = getRequiredPipeExit(level, state);
  if (requiredPipeExit && direction !== requiredPipeExit) {
    return {
      state: {
        ...state,
        message: "管道只能从另一端离开",
      },
      moved: false,
      blockedReason: "pipe-exit",
    };
  }

  if (!isInsideLevel(level, nextPosition)) {
    return {
      state: { ...state, message: "已经到达边界" },
      moved: false,
      blockedReason: "bounds",
    };
  }

  const nextKind = getTileKind(level, state, nextPosition);
  if (nextKind === "block") {
    return {
      state: { ...state, message: "深灰色错误方块不可进入" },
      moved: false,
      blockedReason: "block",
    };
  }

  if (!canEnterPipe(level, state, nextPosition, direction)) {
    return {
      state: { ...state, message: "管道入口方向不匹配" },
      moved: false,
      blockedReason: "pipe-entry",
    };
  }

  if (state.visitedKeys.includes(nextKey)) {
    return {
      state: { ...state, message: "只能按原路回退上一步" },
      moved: false,
      blockedReason: "visited",
    };
  }

  const isTarget = level.targets.some((target) => pointKey(target) === nextKey);
  const visitedKeys = [...state.visitedKeys, nextKey];
  const collectedTargetKeys =
    isTarget && !state.collectedTargetKeys.includes(nextKey)
      ? [...state.collectedTargetKeys, nextKey]
      : state.collectedTargetKeys;
  const nextPipeShape = getPipeShapeAt(level, state, nextPosition);
  const pipeShapes =
    nextKind === "rotate" ? rotatePipes(state.pipeShapes) : state.pipeShapes;
  const completed =
    samePoint(nextPosition, level.finish) &&
    collectedTargetKeys.length === level.targets.length;

  return {
    state: {
      levelId: state.levelId,
      position: nextPosition,
      previousPosition: { ...state.position },
      enteredPipeFrom: nextPipeShape
        ? OPPOSITE_DIRECTION[direction]
        : undefined,
      visitedKeys,
      collectedTargetKeys,
      pipeShapes,
      steps: state.steps + 1,
      completed,
      message: completed
        ? "连接完成"
        : nextKind === "rotate"
          ? "旋转方块已转动所有管道"
          : undefined,
      history: [...state.history, snapshotState(state)],
    },
    moved: true,
  };
};

export const runSolution = (level: LevelConfig) =>
  level.solution.reduce((state, direction, index) => {
    const move = applyMove(level, state, direction);
    if (!move.moved) {
      throw new Error(
        `Level ${level.id} solution step ${index + 1} (${direction}) blocked: ${
          move.blockedReason ?? "unknown"
        }`,
      );
    }
    return move.state;
  }, createGameState(level));

export const validateLevel = (level: LevelConfig) => {
  const finalState = runSolution(level);
  if (!finalState.completed) {
    throw new Error(`Level ${level.id} solution does not complete`);
  }

  const solutionVisited = new Set(finalState.visitedKeys);
  const pipeKeys = new Set((level.pipes ?? []).map((pipe) => pointKey(pipe.point)));
  const rotatorKeys = new Set((level.rotators ?? []).map(pointKey));

  if (
    pipeKeys.size > 0 &&
    !Array.from(pipeKeys).some((key) => solutionVisited.has(key))
  ) {
    throw new Error(`Level ${level.id} solution does not use any pipe`);
  }

  if (
    rotatorKeys.size > 0 &&
    !Array.from(rotatorKeys).some((key) => solutionVisited.has(key))
  ) {
    throw new Error(`Level ${level.id} solution does not use any rotator`);
  }

  if (pipeKeys.size > 0 && canCompleteWhileAvoiding(level, pipeKeys)) {
    throw new Error(`Level ${level.id} can be completed without using pipes`);
  }

  if (rotatorKeys.size > 0 && canCompleteWhileAvoiding(level, rotatorKeys)) {
    throw new Error(`Level ${level.id} can be completed without using rotators`);
  }

  return true;
};

export const getCompletionPercent = (level: LevelConfig, state: GameState) =>
  countTargets(level) === 0
    ? 100
    : Math.round((state.collectedTargetKeys.length / countTargets(level)) * 100);
