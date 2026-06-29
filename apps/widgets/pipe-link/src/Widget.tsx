import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BoardCanvas } from "./game/BoardCanvas";
import { LEVELS, getLevelById, getNextLevel } from "./game/levels";
import {
  applyMove,
  createGameState,
} from "./game/logic";
import type { Direction, GameState, LevelConfig, PipeShape, Point } from "./game/types";
import type {
  PipeLinkSettings,
  ProgressState,
  StorageChangedPayload,
  WidgetProps,
  WidgetSDK,
} from "./types";

const PROGRESS_STORAGE_KEY = "pipeLinkProgress";
const SETTINGS_STORAGE_KEY = "pipeLinkSettings";
const EDITOR_STORAGE_KEY = "pipeLinkEditorDraft";
const EDITOR_SIZE = 6;

const DEFAULT_SETTINGS: PipeLinkSettings = {
  animation: "normal",
  showHints: true,
};

type PipeLinkView = "home" | "game" | "levels" | "settings" | "editor";
type PipeLinkDialog = "pause" | "complete" | null;
type EditorTool =
  | "normal"
  | "start"
  | "finish"
  | "target"
  | "block"
  | "rotate"
  | "pipe-horizontal"
  | "pipe-vertical"
  | "pipe-curve-ur"
  | "pipe-curve-rd"
  | "pipe-curve-dl"
  | "pipe-curve-lu";

interface EditorDraft {
  name: string;
  start: Point;
  finish: Point;
  targets: Point[];
  blockers: Point[];
  rotators: Point[];
  pipes: Array<{ point: Point; shape: PipeShape }>;
}

const DEFAULT_EDITOR_DRAFT: EditorDraft = {
  name: "自定义关卡",
  start: { row: 0, col: 0 },
  finish: { row: 5, col: 5 },
  targets: [{ row: 2, col: 2 }],
  blockers: [],
  rotators: [],
  pipes: [],
};

const EDITOR_PIPE_TOOLS: Record<string, PipeShape> = {
  "pipe-horizontal": "horizontal",
  "pipe-vertical": "vertical",
  "pipe-curve-ur": "curve-ur",
  "pipe-curve-rd": "curve-rd",
  "pipe-curve-dl": "curve-dl",
  "pipe-curve-lu": "curve-lu",
};

const EDITOR_TOOLS: Array<{ id: EditorTool; label: string; mark: string }> = [
  { id: "normal", label: "普通", mark: "·" },
  { id: "start", label: "起点", mark: "S" },
  { id: "finish", label: "终点", mark: "E" },
  { id: "target", label: "目标", mark: "◆" },
  { id: "block", label: "错误", mark: "X" },
  { id: "rotate", label: "旋转", mark: "↻" },
  { id: "pipe-horizontal", label: "横管", mark: "─" },
  { id: "pipe-vertical", label: "竖管", mark: "│" },
  { id: "pipe-curve-ur", label: "上右", mark: "└" },
  { id: "pipe-curve-rd", label: "右下", mark: "┌" },
  { id: "pipe-curve-dl", label: "下左", mark: "┐" },
  { id: "pipe-curve-lu", label: "左上", mark: "┘" },
];

const createDefaultProgress = (): ProgressState => ({
  completedLevelIds: [],
  bestSteps: {},
  activeLevelId: LEVELS[0]?.id ?? "level-01",
});

const safeParseJson = (value: unknown): unknown => {
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const sameEditorPoint = (a: Point, b: Point) =>
  a.row === b.row && a.col === b.col;

const pointKey = (point: Point) => `${point.row}:${point.col}`;

const isEditorPoint = (value: unknown): value is Point => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const point = value as Partial<Point>;
  return (
    Number.isInteger(point.row) &&
    Number.isInteger(point.col) &&
    point.row! >= 0 &&
    point.row! < EDITOR_SIZE &&
    point.col! >= 0 &&
    point.col! < EDITOR_SIZE
  );
};

const dedupePoints = (value: unknown, blockedKeys = new Set<string>()) => {
  if (!Array.isArray(value)) return [];
  const seen = new Set(blockedKeys);
  return value.filter((point): point is Point => {
    if (!isEditorPoint(point)) return false;
    const key = pointKey(point);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const parseEditorDraft = (value: unknown): EditorDraft => {
  const parsed = safeParseJson(value);
  const source =
    parsed && typeof parsed === "object" && !Array.isArray(parsed) && "level" in parsed
      ? (parsed as { level?: unknown }).level
      : parsed;
  if (!source || typeof source !== "object" || Array.isArray(source)) {
    return DEFAULT_EDITOR_DRAFT;
  }

  const raw = source as Record<string, unknown>;
  const start = isEditorPoint(raw.start) ? raw.start : DEFAULT_EDITOR_DRAFT.start;
  const finish =
    isEditorPoint(raw.finish) && !sameEditorPoint(raw.finish, start)
      ? raw.finish
      : DEFAULT_EDITOR_DRAFT.finish;
  const reservedKeys = new Set([pointKey(start), pointKey(finish)]);
  const targets = dedupePoints(raw.targets, reservedKeys);
  const blockers = dedupePoints(raw.blockers, new Set([...reservedKeys, ...targets.map(pointKey)]));
  const rotators = dedupePoints(raw.rotators, new Set([...reservedKeys, ...targets.map(pointKey), ...blockers.map(pointKey)]));
  const occupiedKeys = new Set([
    ...reservedKeys,
    ...targets.map(pointKey),
    ...blockers.map(pointKey),
    ...rotators.map(pointKey),
  ]);
  const pipes = Array.isArray(raw.pipes)
    ? raw.pipes.filter((pipe): pipe is { point: Point; shape: PipeShape } => {
        if (!pipe || typeof pipe !== "object" || Array.isArray(pipe)) return false;
        const item = pipe as { point?: unknown; shape?: unknown };
        if (!isEditorPoint(item.point)) return false;
        if (
          item.shape !== "horizontal" &&
          item.shape !== "vertical" &&
          item.shape !== "curve-ur" &&
          item.shape !== "curve-rd" &&
          item.shape !== "curve-dl" &&
          item.shape !== "curve-lu"
        ) {
          return false;
        }
        const key = pointKey(item.point);
        if (occupiedKeys.has(key)) return false;
        occupiedKeys.add(key);
        return true;
      })
    : [];

  return {
    name: typeof raw.name === "string" && raw.name.trim() ? raw.name.trim() : DEFAULT_EDITOR_DRAFT.name,
    start,
    finish,
    targets,
    blockers,
    rotators,
    pipes,
  };
};

const parseSettings = (value: unknown): PipeLinkSettings => {
  const parsed = safeParseJson(value);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return DEFAULT_SETTINGS;
  }
  const raw = parsed as Record<string, unknown>;
  const animation =
    raw.animation === "low" || raw.animation === "high" || raw.animation === "normal"
      ? raw.animation
      : DEFAULT_SETTINGS.animation;
  return {
    animation,
    showHints:
      typeof raw.showHints === "boolean"
        ? raw.showHints
        : DEFAULT_SETTINGS.showHints,
  };
};

const parseProgress = (value: unknown): ProgressState => {
  const defaults = createDefaultProgress();
  const parsed = safeParseJson(value);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return defaults;
  }
  const raw = parsed as Record<string, unknown>;
  const completedLevelIds = Array.isArray(raw.completedLevelIds)
    ? raw.completedLevelIds.filter(
        (levelId): levelId is string =>
          typeof levelId === "string" && LEVELS.some((level) => level.id === levelId),
      )
    : [];
  const bestSteps =
    raw.bestSteps && typeof raw.bestSteps === "object" && !Array.isArray(raw.bestSteps)
      ? Object.fromEntries(
          Object.entries(raw.bestSteps as Record<string, unknown>).filter(
            ([levelId, steps]) =>
              LEVELS.some((level) => level.id === levelId) &&
              typeof steps === "number" &&
              Number.isFinite(steps),
          ),
        )
      : {};
  const activeLevelId =
    typeof raw.activeLevelId === "string" &&
    LEVELS.some((level) => level.id === raw.activeLevelId)
      ? raw.activeLevelId
      : defaults.activeLevelId;

  return {
    completedLevelIds,
    bestSteps: bestSteps as Record<string, number>,
    activeLevelId,
  };
};

const readProgress = async (sdk?: WidgetSDK) => {
  if (!sdk?.storage) return createDefaultProgress();
  return parseProgress(await sdk.storage.get(PROGRESS_STORAGE_KEY));
};

const readSettings = async (sdk?: WidgetSDK) => {
  if (!sdk?.storage) return DEFAULT_SETTINGS;
  return parseSettings(await sdk.storage.get(SETTINGS_STORAGE_KEY));
};

const readEditorDraft = async (sdk?: WidgetSDK) => {
  if (!sdk?.storage) return DEFAULT_EDITOR_DRAFT;
  return parseEditorDraft(await sdk.storage.get(EDITOR_STORAGE_KEY));
};

const writeProgress = async (sdk: WidgetSDK | undefined, progress: ProgressState) => {
  if (!sdk?.storage) return;
  await sdk.storage.set(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
};

const writeSettings = async (
  sdk: WidgetSDK | undefined,
  settings: PipeLinkSettings,
) => {
  if (!sdk?.storage) return;
  await sdk.storage.set(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
};

const writeEditorDraft = async (
  sdk: WidgetSDK | undefined,
  draft: EditorDraft,
) => {
  if (!sdk?.storage) return;
  await sdk.storage.set(EDITOR_STORAGE_KEY, JSON.stringify(draft));
};

const getUnlockedLevelIds = (progress: ProgressState) => {
  const completed = new Set(progress.completedLevelIds);
  const lastCompletedIndex = LEVELS.reduce(
    (maxIndex, level, index) => (completed.has(level.id) ? Math.max(maxIndex, index) : maxIndex),
    -1,
  );
  return new Set(LEVELS.slice(0, Math.min(LEVELS.length, lastCompletedIndex + 2)).map((level) => level.id));
};

const getLevelNumber = (level: LevelConfig) =>
  LEVELS.findIndex((item) => item.id === level.id) >= 0
    ? String(LEVELS.findIndex((item) => item.id === level.id) + 1).padStart(2, "0")
    : "自定义";

const isBuiltInLevel = (levelId: string) =>
  LEVELS.some((item) => item.id === levelId);

const createEditorLevel = (draft: EditorDraft): LevelConfig => ({
  id: "custom-editor",
  name: draft.name.trim() || "自定义关卡",
  difficulty: 0,
  rows: EDITOR_SIZE,
  cols: EDITOR_SIZE,
  start: draft.start,
  finish: draft.finish,
  targets: draft.targets,
  blockers: draft.blockers,
  rotators: draft.rotators,
  pipes: draft.pipes,
  solution: [],
});

const exportEditorDraft = (draft: EditorDraft) =>
  JSON.stringify(
    {
      type: "pipe-link-level",
      version: 1,
      level: createEditorLevel(draft),
    },
    null,
    2,
  );

const clearEditorPoint = (draft: EditorDraft, point: Point): EditorDraft => {
  const key = pointKey(point);
  return {
    ...draft,
    targets: draft.targets.filter((item) => pointKey(item) !== key),
    blockers: draft.blockers.filter((item) => pointKey(item) !== key),
    rotators: draft.rotators.filter((item) => pointKey(item) !== key),
    pipes: draft.pipes.filter((item) => pointKey(item.point) !== key),
  };
};

const PipeLink = ({ mode = "icon", title = "管道连线", sdk }: WidgetProps) => {
  const [themeId, setThemeId] = useState(sdk?.theme?.activeThemeId || "light");
  const [settings, setSettings] = useState<PipeLinkSettings>(DEFAULT_SETTINGS);
  const [progress, setProgress] = useState<ProgressState>(() => createDefaultProgress());
  const [level, setLevel] = useState<LevelConfig>(() => LEVELS[0]);
  const [gameState, setGameState] = useState<GameState>(() => createGameState(LEVELS[0]));
  const [activeView, setActiveView] = useState<PipeLinkView>("home");
  const [dialogView, setDialogView] = useState<PipeLinkDialog>(null);
  const [editorDraft, setEditorDraft] = useState<EditorDraft>(DEFAULT_EDITOR_DRAFT);
  const [editorTool, setEditorTool] = useState<EditorTool>("target");
  const [editorTransfer, setEditorTransfer] = useState("");
  const [editorTransferOpen, setEditorTransferOpen] = useState(false);
  const [editorMessage, setEditorMessage] = useState("");

  useEffect(() => {
    let mounted = true;
    Promise.all([readProgress(sdk), readSettings(sdk), readEditorDraft(sdk)]).then(
      ([nextProgress, nextSettings, nextDraft]) => {
        if (!mounted) return;
        const nextLevel = getLevelById(nextProgress.activeLevelId);
        setProgress(nextProgress);
        setSettings(nextSettings);
        setEditorDraft(nextDraft);
        setLevel(nextLevel);
        setGameState(createGameState(nextLevel));
      },
    );
    return () => {
      mounted = false;
    };
  }, [sdk]);

  useEffect(() => {
    const events = sdk?.events;
    if (!events) return undefined;
    const handler = (payload: StorageChangedPayload) => {
      if (!payload || payload.widgetId !== sdk.widgetId) return;
      if (payload.key === PROGRESS_STORAGE_KEY) {
        const nextProgress = parseProgress(payload.value);
        setProgress(nextProgress);
      }
      if (payload.key === SETTINGS_STORAGE_KEY) {
        setSettings(parseSettings(payload.value));
      }
      if (payload.key === EDITOR_STORAGE_KEY) {
        setEditorDraft(parseEditorDraft(payload.value));
      }
    };
    events.on("storage:changed", handler);
    return () => events.off?.("storage:changed", handler);
  }, [sdk]);

  useEffect(() => {
    if (!sdk?.onThemeChange) return undefined;
    return sdk.onThemeChange((theme) => setThemeId(theme.activeThemeId));
  }, [sdk]);

  useEffect(() => {
    if (mode !== "full") return undefined;
    sdk?.events?.emit?.("widget:chrome", {
      widgetId: sdk.widgetId,
      backVisible: activeView !== "home",
    });

    return () => {
      sdk?.events?.emit?.("widget:chrome", {
        widgetId: sdk.widgetId,
        backVisible: false,
      });
    };
  }, [activeView, mode, sdk]);

  useEffect(() => {
    const events = sdk?.events;
    if (!events) return undefined;

    const handler = (payload: Record<string, unknown>) => {
      if (payload?.widgetId && payload.widgetId !== sdk.widgetId) return;
      if (activeView === "game") {
        setDialogView(gameState.completed ? "complete" : "pause");
        return;
      }
      setDialogView(null);
      setActiveView("home");
    };

    events.on("widget:title-back", handler);
    return () => events.off?.("widget:title-back", handler);
  }, [activeView, gameState.completed, sdk]);

  const unlockedLevelIds = useMemo(() => getUnlockedLevelIds(progress), [progress]);
  const completedCount = progress.completedLevelIds.length;
  const editorLevel = useMemo(() => createEditorLevel(editorDraft), [editorDraft]);
  const editorPreviewState = useMemo(() => createGameState(editorLevel), [editorLevel]);

  const persistProgress = useCallback(
    (nextProgress: ProgressState) => {
      setProgress(nextProgress);
      void writeProgress(sdk, nextProgress);
    },
    [sdk],
  );

  const persistSettings = useCallback(
    (nextSettings: PipeLinkSettings) => {
      setSettings(nextSettings);
      void writeSettings(sdk, nextSettings);
    },
    [sdk],
  );

  const persistEditorDraft = useCallback(
    (nextDraft: EditorDraft) => {
      setEditorDraft(nextDraft);
      void writeEditorDraft(sdk, nextDraft);
    },
    [sdk],
  );

  const updateEditorName = useCallback(
    (name: string) => {
      persistEditorDraft({
        ...editorDraft,
        name,
      });
    },
    [editorDraft, persistEditorDraft],
  );

  const applyEditorTool = useCallback(
    (point: Point) => {
      const cleaned = clearEditorPoint(editorDraft, point);
      let nextDraft = cleaned;

      if (editorTool === "start") {
        nextDraft = {
          ...cleaned,
          start: point,
          finish: sameEditorPoint(cleaned.finish, point) ? editorDraft.start : cleaned.finish,
        };
      } else if (editorTool === "finish") {
        nextDraft = {
          ...cleaned,
          finish: point,
          start: sameEditorPoint(cleaned.start, point) ? editorDraft.finish : cleaned.start,
        };
      } else if (editorTool === "target") {
        nextDraft = { ...cleaned, targets: [...cleaned.targets, point] };
      } else if (editorTool === "block") {
        nextDraft = { ...cleaned, blockers: [...cleaned.blockers, point] };
      } else if (editorTool === "rotate") {
        nextDraft = { ...cleaned, rotators: [...cleaned.rotators, point] };
      } else if (editorTool.startsWith("pipe-")) {
        nextDraft = {
          ...cleaned,
          pipes: [
            ...cleaned.pipes,
            {
              point,
              shape: EDITOR_PIPE_TOOLS[editorTool],
            },
          ],
        };
      }

      persistEditorDraft(nextDraft);
      setEditorMessage("");
    },
    [editorDraft, editorTool, persistEditorDraft],
  );

  const playEditorLevel = useCallback(() => {
    if (sameEditorPoint(editorDraft.start, editorDraft.finish)) {
      setEditorMessage("起点和终点不能在同一格");
      return;
    }
    const nextLevel = createEditorLevel(editorDraft);
    setLevel(nextLevel);
    setGameState(createGameState(nextLevel));
    setDialogView(null);
    setActiveView("game");
  }, [editorDraft]);

  const exportCurrentEditorLevel = useCallback(() => {
    setEditorTransfer(exportEditorDraft(editorDraft));
    setEditorTransferOpen(true);
    setEditorMessage("配置已生成，可复制分享");
  }, [editorDraft]);

  const importEditorLevel = useCallback(() => {
    if (!editorTransferOpen) {
      setEditorTransferOpen(true);
      setEditorMessage("粘贴关卡 JSON 后再次点击导入");
      return;
    }
    const parsed = safeParseJson(editorTransfer);
    if (!parsed) {
      setEditorMessage("导入失败：配置不是有效 JSON");
      return;
    }
    const nextDraft = parseEditorDraft(parsed);
    persistEditorDraft(nextDraft);
    setEditorTransfer(exportEditorDraft(nextDraft));
    setEditorMessage("导入成功，可以继续编辑或试玩");
  }, [editorTransfer, persistEditorDraft]);

  const selectLevel = useCallback(
    (nextLevel: LevelConfig, nextView: PipeLinkView = "game") => {
      const nextProgress = { ...progress, activeLevelId: nextLevel.id };
      persistProgress(nextProgress);
      setLevel(nextLevel);
      setGameState(createGameState(nextLevel));
      setDialogView(null);
      setActiveView(nextView);
    },
    [persistProgress, progress],
  );

  const startNewGame = useCallback(() => {
    const firstLevel = LEVELS[0];
    const nextProgress = { ...progress, activeLevelId: firstLevel.id };
    persistProgress(nextProgress);
    setLevel(firstLevel);
    setGameState(createGameState(firstLevel));
    setDialogView(null);
    setActiveView("game");
  }, [persistProgress, progress]);

  const continueGame = useCallback(() => {
    setDialogView(gameState.completed ? "complete" : null);
    setActiveView("game");
  }, [gameState.completed]);

  const restart = useCallback(() => {
    setGameState(createGameState(level));
    setDialogView(null);
    setActiveView("game");
  }, [level]);

  const recordCompletion = useCallback(
    (completedState: GameState) => {
      if (!isBuiltInLevel(level.id)) {
        sdk?.toast?.success("关卡完成", `${level.name} 用了 ${completedState.steps} 步`);
        return;
      }
      const previousBest = progress.bestSteps[level.id];
      const nextProgress: ProgressState = {
        completedLevelIds: progress.completedLevelIds.includes(level.id)
          ? progress.completedLevelIds
          : [...progress.completedLevelIds, level.id],
        bestSteps: {
          ...progress.bestSteps,
          [level.id]:
            previousBest && previousBest <= completedState.steps
              ? previousBest
              : completedState.steps,
        },
        activeLevelId: level.id,
      };
      persistProgress(nextProgress);
      sdk?.toast?.success("关卡完成", `${level.name} 用了 ${completedState.steps} 步`);
    },
    [level.id, level.name, persistProgress, progress, sdk],
  );

  const move = useCallback(
    (direction: Direction) => {
      setGameState((state) => {
        const result = applyMove(level, state, direction);
        if (result.state.completed && !state.completed) {
          recordCompletion(result.state);
          setDialogView("complete");
        }
        return result.state;
      });
    },
    [level, recordCompletion],
  );

  const nextLevel = useCallback(() => {
    selectLevel(getNextLevel(level.id));
  }, [level.id, selectLevel]);

  const clearProgress = useCallback(() => {
    const nextProgress = createDefaultProgress();
    persistProgress(nextProgress);
    const firstLevel = LEVELS[0];
    setLevel(firstLevel);
    setGameState(createGameState(firstLevel));
    setDialogView(null);
    setActiveView("home");
    sdk?.toast?.success("进度已清除");
  }, [persistProgress, sdk]);

  const isIcon = mode === "icon" || mode === "appIcon";
  const isAppIcon = mode === "appIcon";
  const isTinyIcon = sdk?.sizeId === "1x1";
  const isSettings = mode === "settings";
  const shellClassName = cn(
    "pipe-link-shell",
    themeId === "dark" ? "pipe-link-shell--dark" : "pipe-link-shell--light",
    isIcon && "pipe-link-shell--icon",
    isAppIcon && "pipe-link-shell--app-icon",
  );
  const activeLevelNumber = getLevelNumber(level);
  const activeBestSteps = progress.bestSteps[level.id];
  const progressLabel = `${completedCount}/${LEVELS.length}`;

  if (isIcon) {
    return (
      <div className={shellClassName}>
        <div className="pipe-link-icon">
          <BoardCanvas
            level={level}
            state={gameState}
            animation={settings.animation}
            interactive={false}
            compact
          />
          <div className="pipe-link-icon__badge">
            <span>{completedCount}</span>
            <small>/ {LEVELS.length}</small>
          </div>
          {!isAppIcon && !isTinyIcon && (
            <div className="pipe-link-icon__meta">
              <strong>{title}</strong>
              <span>第 {getLevelNumber(level)} 关</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (isSettings) {
    return (
      <div className={shellClassName}>
        <div className="pipe-link-settings">
          <header className="pipe-link-panel-header">
            <div>
              <p>设置</p>
              <h1>{title}</h1>
            </div>
            <span>{completedCount}/{LEVELS.length}</span>
          </header>

          <section className="pipe-link-settings__group">
            <label className="pipe-link-field">
              <span>动画强度</span>
              <select
                value={settings.animation}
                onChange={(event) =>
                  persistSettings({
                    ...settings,
                    animation: event.target.value as PipeLinkSettings["animation"],
                  })
                }
              >
                <option value="low">低</option>
                <option value="normal">标准</option>
                <option value="high">高</option>
              </select>
            </label>
            <label className="pipe-link-toggle">
              <span>显示键盘提示</span>
              <input
                type="checkbox"
                checked={settings.showHints}
                onChange={(event) =>
                  persistSettings({
                    ...settings,
                    showHints: event.target.checked,
                  })
                }
              />
            </label>
            {settings.showHints && (
              <div className="pipe-link-key-hints" aria-label="按键提示">
                <span>W / ↑</span>
                <span>A / ←</span>
                <span>S / ↓</span>
                <span>D / →</span>
              </div>
            )}
          </section>

          <section className="pipe-link-settings__group">
            <div className="pipe-link-progress-list">
              {LEVELS.map((item) => (
                <div key={item.id} className="pipe-link-progress-row">
                  <span>{getLevelNumber(item)} {item.name}</span>
                  <strong>
                    {progress.bestSteps[item.id]
                      ? `${progress.bestSteps[item.id]} 步`
                      : progress.completedLevelIds.includes(item.id)
                        ? "已完成"
                        : "未完成"}
                  </strong>
                </div>
              ))}
            </div>
          </section>

          <Button type="button" variant="secondary" onClick={clearProgress}>
            清除通关记录
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={shellClassName}>
      <div className="pipe-link-app">
        {activeView === "home" ? (
          <section className="pipe-link-home-view">
            <div className="pipe-link-title-screen">
              <div className="pipe-link-title-copy">
                <p>管道连线</p>
                <h1>{title}</h1>
                <span>连接所有节点，避开错误方块</span>
              </div>

              <div className="pipe-link-title-menu" aria-label="主菜单">
                <button type="button" className="pipe-link-title-button pipe-link-title-button--primary" onClick={continueGame}>
                  开始游戏
                </button>
                <button type="button" className="pipe-link-title-button" onClick={startNewGame}>
                  新游戏
                </button>
                <button type="button" className="pipe-link-title-button" onClick={() => setActiveView("levels")}>
                  选择关卡
                </button>
                <button type="button" className="pipe-link-title-button" onClick={() => setActiveView("editor")}>
                  关卡编辑器
                </button>
                <button type="button" className="pipe-link-title-button" onClick={() => setActiveView("settings")}>
                  设置
                </button>
              </div>
            </div>
          </section>
        ) : (
          <div className="pipe-link-workspace">
            {activeView === "game" && (
              <main className="pipe-link-content pipe-link-content--game">
                <header className="pipe-link-view-header">
                  <div className="pipe-link-view-title">
                    <div>
                      <h2 className="pipe-link-level-heading">
                        <span>{isBuiltInLevel(level.id) ? `第 ${activeLevelNumber} 关` : "自定义关卡"}</span>
                        {level.name}
                      </h2>
                    </div>
                  </div>
                </header>

                <div className="pipe-link-board-shell">
                  <BoardCanvas
                    level={level}
                    state={gameState}
                    animation={settings.animation}
                    interactive={dialogView === null}
                    onMove={move}
                  />
                </div>

                {dialogView && (
                  <div className="pipe-link-dialog-layer" role="dialog" aria-modal="true">
                    {dialogView === "pause" ? (
                      <section className="pipe-link-dialog">
                        <p>暂停菜单</p>
                        <h3>暂停</h3>
                        <span>当前进度已保留</span>
                        <div className="pipe-link-dialog-actions">
                          <Button type="button" onClick={() => setDialogView(null)}>
                            继续游戏
                          </Button>
                          <Button type="button" variant="secondary" onClick={restart}>
                            重新开始
                          </Button>
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={() => {
                              setDialogView(null);
                              setActiveView("settings");
                            }}
                          >
                            设置
                          </Button>
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={() => {
                              setDialogView(null);
                              setActiveView("home");
                            }}
                          >
                            返回主菜单
                          </Button>
                        </div>
                      </section>
                    ) : (
                      <section className="pipe-link-dialog">
                        <p>{isBuiltInLevel(level.id) ? `第 ${activeLevelNumber} 关` : "自定义关卡"}</p>
                        <h3>通关完成</h3>
                        <span>{level.name} · {gameState.steps} 步</span>
                        <div className="pipe-link-dialog-actions pipe-link-dialog-actions--complete">
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={() => {
                              setDialogView(null);
                              setActiveView("home");
                            }}
                          >
                            主菜单
                          </Button>
                          <Button type="button" onClick={nextLevel}>
                            下一关
                          </Button>
                          <Button type="button" variant="secondary" onClick={restart}>
                            重玩
                          </Button>
                        </div>
                      </section>
                    )}
                  </div>
                )}
              </main>
            )}

            {activeView === "levels" && (
              <main className="pipe-link-content pipe-link-content--levels">
                <header className="pipe-link-view-header">
                  <div className="pipe-link-view-title">
                    <div>
                      <p>内置关卡</p>
                      <h2>选择关卡</h2>
                    </div>
                  </div>
                  <span>{progressLabel} 已完成</span>
                </header>

                <div className="pipe-link-level-grid" aria-label="选择关卡">
                  {LEVELS.map((item) => {
                    const unlocked = unlockedLevelIds.has(item.id);
                    const completed = progress.completedLevelIds.includes(item.id);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        className={cn(
                          "pipe-link-level-card",
                          item.id === level.id && "pipe-link-level-card--active",
                          completed && "pipe-link-level-card--done",
                        )}
                        disabled={!unlocked}
                        onClick={() => selectLevel(item)}
                      >
                        <span>{getLevelNumber(item)}</span>
                        <strong>{item.name}</strong>
                        <small>
                          {completed
                            ? progress.bestSteps[item.id]
                              ? `${progress.bestSteps[item.id]} 步`
                              : "已通关"
                            : unlocked
                              ? `难度 ${item.difficulty}`
                              : "锁定"}
                        </small>
                      </button>
                    );
                  })}
                </div>
              </main>
            )}

            {activeView === "editor" && (
              <main className="pipe-link-content pipe-link-content--editor">
                <header className="pipe-link-view-header">
                  <div className="pipe-link-view-title">
                    <div>
                      <p>自定义关卡</p>
                      <h2>关卡编辑器</h2>
                    </div>
                  </div>
                </header>

                <section className="tw:grid tw:min-h-0 tw:grid-cols-[minmax(0,1fr)_minmax(210px,34%)] tw:gap-2 tw:overflow-hidden max-[760px]:tw:grid-cols-1 max-[760px]:tw:overflow-auto">
                  <div className="pipe-link-board-shell tw:cursor-crosshair" aria-label="编辑关卡棋盘">
                    <BoardCanvas
                      level={editorLevel}
                      state={editorPreviewState}
                      animation={settings.animation}
                      interactive={false}
                      onCellClick={applyEditorTool}
                    />
                  </div>

                  <aside className="tw:grid tw:min-h-0 tw:min-w-0 tw:content-start tw:gap-1.5 tw:overflow-auto tw:pr-0.5 max-[760px]:tw:overflow-visible">
                    <label className="tw:grid tw:gap-1 tw:text-[13px] tw:font-black tw:text-[var(--pipe-fg)]">
                      <span>关卡名</span>
                      <input
                        className="tw:h-8 tw:w-full tw:min-w-0 tw:rounded-lg tw:border tw:border-[var(--pipe-border)] tw:bg-[var(--pipe-panel-strong)] tw:px-2.5 tw:text-[var(--pipe-fg)] tw:outline-none"
                        value={editorDraft.name}
                        maxLength={18}
                        onChange={(event) => updateEditorName(event.target.value)}
                      />
                    </label>

                    <div className="tw:grid tw:grid-cols-4 tw:gap-1.5 max-[520px]:tw:grid-cols-3" aria-label="编辑工具">
                      {EDITOR_TOOLS.map((tool) => (
                        <button
                          key={tool.id}
                          type="button"
                          className={cn(
                            "tw:grid tw:min-h-0 tw:min-w-0 tw:cursor-pointer tw:justify-items-center tw:gap-0.5 tw:rounded-md tw:border tw:border-[var(--pipe-border)] tw:bg-[rgba(7,22,30,0.58)] tw:px-1 tw:py-1.5 tw:text-[var(--pipe-fg)] tw:transition-colors hover:tw:border-cyan-200",
                            editorTool === tool.id && "tw:border-white/90 tw:bg-cyan-500/25",
                          )}
                          onClick={() => setEditorTool(tool.id)}
                        >
                          <strong className="tw:text-[13px] tw:leading-none">{tool.mark}</strong>
                          <span className="tw:text-[10px] tw:font-black tw:leading-none">{tool.label}</span>
                        </button>
                      ))}
                    </div>

                    <div className="tw:grid tw:grid-cols-3 tw:gap-1.5 max-[520px]:tw:grid-cols-1">
                      <Button type="button" size="sm" onClick={playEditorLevel}>
                        试玩
                      </Button>
                      <Button type="button" size="sm" variant="secondary" onClick={exportCurrentEditorLevel}>
                        导出
                      </Button>
                      <Button type="button" size="sm" variant="secondary" onClick={importEditorLevel}>
                        导入
                      </Button>
                    </div>

                    {editorTransferOpen && (
                      <textarea
                        className="tw:min-h-[70px] tw:w-full tw:min-w-0 tw:resize-y tw:rounded-lg tw:border tw:border-[var(--pipe-border)] tw:bg-[var(--pipe-panel-strong)] tw:px-2.5 tw:py-2 tw:text-[11px] tw:leading-snug tw:text-[var(--pipe-fg)] tw:outline-none"
                        value={editorTransfer}
                        onChange={(event) => setEditorTransfer(event.target.value)}
                        placeholder="粘贴别人分享的关卡 JSON，或点击导出生成当前配置"
                      />
                    )}
                    {editorMessage && (
                      <p className="tw:m-0 tw:text-xs tw:font-black tw:leading-snug tw:text-[var(--pipe-target)]">
                        {editorMessage}
                      </p>
                    )}
                  </aside>
                </section>
              </main>
            )}

            {activeView === "settings" && (
              <main className="pipe-link-content pipe-link-content--settings">
                <header className="pipe-link-view-header">
                  <div className="pipe-link-view-title">
                    <div>
                      <p>偏好设置</p>
                      <h2>设置</h2>
                    </div>
                  </div>
                  <Button type="button" size="sm" variant="secondary" onClick={clearProgress}>
                    清除进度
                  </Button>
                </header>

                <section className="pipe-link-settings-grid">
                  <label className="pipe-link-setting-card">
                    <span>动画强度</span>
                    <small>控制路径高亮和管道脉冲动画</small>
                    <select
                      value={settings.animation}
                      onChange={(event) =>
                        persistSettings({
                          ...settings,
                          animation: event.target.value as PipeLinkSettings["animation"],
                        })
                      }
                    >
                      <option value="low">低</option>
                      <option value="normal">标准</option>
                      <option value="high">高</option>
                    </select>
                  </label>

                  <label className="pipe-link-setting-card pipe-link-setting-card--inline">
                    <span>显示键盘提示</span>
                    <small>在设置页显示移动按键说明</small>
                    <input
                      type="checkbox"
                      checked={settings.showHints}
                      onChange={(event) =>
                        persistSettings({
                          ...settings,
                          showHints: event.target.checked,
                        })
                      }
                    />
                  </label>

                  {settings.showHints && (
                    <section className="pipe-link-setting-card pipe-link-setting-card--wide">
                      <span>按键提示</span>
                      <div className="pipe-link-key-hints" aria-label="按键提示">
                        <span>W / ↑ 上移</span>
                        <span>A / ← 左移</span>
                        <span>S / ↓ 下移</span>
                        <span>D / → 右移</span>
                      </div>
                    </section>
                  )}

                  <section className="pipe-link-setting-card pipe-link-setting-card--wide">
                    <span>通关记录</span>
                    <div className="pipe-link-progress-list">
                      {LEVELS.map((item) => (
                        <div key={item.id} className="pipe-link-progress-row">
                          <span>{getLevelNumber(item)} {item.name}</span>
                          <strong>
                            {progress.bestSteps[item.id]
                              ? `${progress.bestSteps[item.id]} 步`
                              : progress.completedLevelIds.includes(item.id)
                                ? "已完成"
                                : "未完成"}
                          </strong>
                        </div>
                      ))}
                    </div>
                  </section>
                </section>
              </main>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PipeLink;
