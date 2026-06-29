export type Direction = "up" | "right" | "down" | "left";

export type PipeShape =
  | "horizontal"
  | "vertical"
  | "curve-ur"
  | "curve-rd"
  | "curve-dl"
  | "curve-lu";

export type TileKind =
  | "normal"
  | "target"
  | "block"
  | "rotate"
  | "pipe"
  | "start"
  | "finish";

export interface Point {
  row: number;
  col: number;
}

export interface PipeTile {
  point: Point;
  shape: PipeShape;
}

export interface LevelConfig {
  id: string;
  name: string;
  difficulty: number;
  rows: number;
  cols: number;
  start: Point;
  finish: Point;
  targets: Point[];
  blockers?: Point[];
  rotators?: Point[];
  pipes?: PipeTile[];
  solution: Direction[];
}

export interface GameSnapshot {
  position: Point;
  previousPosition?: Point;
  enteredPipeFrom?: Direction;
  visitedKeys: string[];
  collectedTargetKeys: string[];
  pipeShapes: Record<string, PipeShape>;
  steps: number;
  completed: boolean;
  message?: string;
}

export interface GameState extends GameSnapshot {
  levelId: string;
  history: GameSnapshot[];
}

export interface MoveResult {
  state: GameState;
  moved: boolean;
  blockedReason?: string;
}
