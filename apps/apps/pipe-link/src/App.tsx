import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BoardCanvas } from "./game/BoardCanvas";
import { LEVELS, getLevelById, getNextLevel } from "./game/levels";
import { resources, useAppI18n } from "./i18n";
import type { AppTranslationFn } from "./i18n";
import {
  applyMove,
  createGameState,
} from "./game/logic";
import type { Direction, GameState, LevelConfig, PipeShape, Point } from "./game/types";
import type {
  PipeLinkSettings,
  ProgressState,
  StorageChangedPayload,
  AppProps,
  AppSDK,
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
  name: "custom-level",
  start: { row: 0, col: 0 },
  finish: { row: 5, col: 5 },
  targets: [{ row: 2, col: 2 }],
  blockers: [],
  rotators: [],
  pipes: [],
};

const LEGACY_DEFAULT_EDITOR_NAME = "\u81ea\u5b9a\u4e49\u5173\u5361";

const EDITOR_PIPE_TOOLS: Record<string, PipeShape> = {
  "pipe-horizontal": "horizontal",
  "pipe-vertical": "vertical",
  "pipe-curve-ur": "curve-ur",
  "pipe-curve-rd": "curve-rd",
  "pipe-curve-dl": "curve-dl",
  "pipe-curve-lu": "curve-lu",
};

const EDITOR_TOOLS: Array<{ id: EditorTool; labelKey: string; mark: string }> = [
  { id: "normal", labelKey: "tool.normal", mark: "·" },
  { id: "start", labelKey: "tool.start", mark: "S" },
  { id: "finish", labelKey: "tool.finish", mark: "E" },
  { id: "target", labelKey: "tool.target", mark: "◆" },
  { id: "block", labelKey: "tool.block", mark: "X" },
  { id: "rotate", labelKey: "tool.rotate", mark: "↻" },
  { id: "pipe-horizontal", labelKey: "tool.pipeH", mark: "─" },
  { id: "pipe-vertical", labelKey: "tool.pipeV", mark: "│" },
  { id: "pipe-curve-ur", labelKey: "tool.curveUr", mark: "└" },
  { id: "pipe-curve-rd", labelKey: "tool.curveRd", mark: "┌" },
  { id: "pipe-curve-dl", labelKey: "tool.curveDl", mark: "┐" },
  { id: "pipe-curve-lu", labelKey: "tool.curveLu", mark: "┘" },
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

const normalizeEditorName = (value: unknown) => {
  if (typeof value !== "string") return DEFAULT_EDITOR_DRAFT.name;
  const name = value.trim();
  if (!name || name === LEGACY_DEFAULT_EDITOR_NAME) return DEFAULT_EDITOR_DRAFT.name;
  return name;
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
    name: normalizeEditorName(raw.name),
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

const readProgress = async (sdk?: AppSDK) => {
  if (!sdk?.storage) return createDefaultProgress();
  return parseProgress(await sdk.storage.get(PROGRESS_STORAGE_KEY));
};

const readSettings = async (sdk?: AppSDK) => {
  if (!sdk?.storage) return DEFAULT_SETTINGS;
  return parseSettings(await sdk.storage.get(SETTINGS_STORAGE_KEY));
};

const readEditorDraft = async (sdk?: AppSDK) => {
  if (!sdk?.storage) return DEFAULT_EDITOR_DRAFT;
  return parseEditorDraft(await sdk.storage.get(EDITOR_STORAGE_KEY));
};

const writeProgress = async (sdk: AppSDK | undefined, progress: ProgressState) => {
  if (!sdk?.storage) return;
  await sdk.storage.set(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
};

const writeSettings = async (
  sdk: AppSDK | undefined,
  settings: PipeLinkSettings,
) => {
  if (!sdk?.storage) return;
  await sdk.storage.set(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
};

const writeEditorDraft = async (
  sdk: AppSDK | undefined,
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
    : "custom";

const getLevelName = (level: LevelConfig, t: AppTranslationFn) => {
  const index = LEVELS.findIndex((item) => item.id === level.id);
  if (index >= 0) return t(`level.name.${String(index + 1).padStart(2, "0")}`);
  return level.name === DEFAULT_EDITOR_DRAFT.name ? t("editor.defaultName") : level.name;
};

const stepText = (steps: number, t: AppTranslationFn) =>
  t("game.step", { steps });

const isBuiltInLevel = (levelId: string) =>
  LEVELS.some((item) => item.id === levelId);

const createEditorLevel = (draft: EditorDraft): LevelConfig => ({
  id: "custom-editor",
  name: draft.name.trim() || DEFAULT_EDITOR_DRAFT.name,
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

const PipeLink = ({ mode = "icon", title, sdk }: AppProps) => {
  const { t } = useAppI18n(sdk, resources);
  const displayTitle = title || t("title");
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
      if (!payload || payload.appId !== sdk.appId) return;
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
    sdk?.events?.emit?.("app:chrome", {
      appId: sdk.appId,
      backVisible: activeView !== "home",
    });

    return () => {
      sdk?.events?.emit?.("app:chrome", {
        appId: sdk.appId,
        backVisible: false,
      });
    };
  }, [activeView, mode, sdk]);

  useEffect(() => {
    const events = sdk?.events;
    if (!events) return undefined;

    const handler = (payload: Record<string, unknown>) => {
      if (payload?.appId && payload.appId !== sdk.appId) return;
      if (activeView === "game") {
        setDialogView(gameState.completed ? "complete" : "pause");
        return;
      }
      setDialogView(null);
      setActiveView("home");
    };

    events.on("app:title-back", handler);
    return () => events.off?.("app:title-back", handler);
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
      setEditorMessage(t("editor.samePoint"));
      return;
    }
    const nextLevel = createEditorLevel(editorDraft);
    setLevel(nextLevel);
    setGameState(createGameState(nextLevel));
    setDialogView(null);
    setActiveView("game");
  }, [editorDraft, t]);

  const exportCurrentEditorLevel = useCallback(() => {
    setEditorTransfer(exportEditorDraft(editorDraft));
    setEditorTransferOpen(true);
    setEditorMessage(t("editor.transfer.ready"));
  }, [editorDraft, t]);

  const importEditorLevel = useCallback(() => {
    if (!editorTransferOpen) {
      setEditorTransferOpen(true);
      setEditorMessage(t("editor.import.ready"));
      return;
    }
    const parsed = safeParseJson(editorTransfer);
    if (!parsed) {
      setEditorMessage(t("editor.import.fail"));
      return;
    }
    const nextDraft = parseEditorDraft(parsed);
    persistEditorDraft(nextDraft);
    setEditorTransfer(exportEditorDraft(nextDraft));
    setEditorMessage(t("editor.import.success"));
  }, [editorTransfer, persistEditorDraft, t]);

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
    setDialogView(gameState.completed && isBuiltInLevel(level.id) ? "complete" : null);
    setActiveView("game");
  }, [gameState.completed, level.id]);

  const restart = useCallback(() => {
    setGameState(createGameState(level));
    setDialogView(null);
    setActiveView("game");
  }, [level]);

  const recordCompletion = useCallback(
    (completedState: GameState) => {
      if (!isBuiltInLevel(level.id)) {
        sdk?.toast?.success(t("game.toastTrial"), `${getLevelName(level, t)} · ${stepText(completedState.steps, t)}`);
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
      sdk?.toast?.success(t("game.toastDone"), `${getLevelName(level, t)} · ${stepText(completedState.steps, t)}`);
    },
    [level, persistProgress, progress, sdk, t],
  );

  const move = useCallback(
    (direction: Direction) => {
      setGameState((state) => {
        const result = applyMove(level, state, direction);
        if (result.state.completed && !state.completed) {
          recordCompletion(result.state);
          if (isBuiltInLevel(level.id)) {
            setDialogView("complete");
          } else {
            setDialogView(null);
            setEditorMessage(t("editor.play.success", { steps: result.state.steps }));
            setActiveView("editor");
          }
        }
        return result.state;
      });
    },
    [level, recordCompletion, t],
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
    sdk?.toast?.success(t("action.clear"));
  }, [persistProgress, sdk, t]);

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
            label={getLevelName(level, t)}
            t={t}
          />
          <div className="pipe-link-icon__badge">
            <span>{completedCount}</span>
            <small>/ {LEVELS.length}</small>
          </div>
          {!isAppIcon && !isTinyIcon && (
            <div className="pipe-link-icon__meta">
              <strong>{displayTitle}</strong>
              <span>{t("game.level", { level: getLevelNumber(level) })}</span>
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
              <p>{t("settings.title")}</p>
              <h1>{displayTitle}</h1>
            </div>
            <span>{completedCount}/{LEVELS.length}</span>
          </header>

          <section className="pipe-link-settings__group">
            <label className="pipe-link-field">
                <span>{t("settings.animation.title")}</span>
              <select
                value={settings.animation}
                onChange={(event) =>
                  persistSettings({
                    ...settings,
                    animation: event.target.value as PipeLinkSettings["animation"],
                  })
                }
              >
                <option value="low">{t("animation.low")}</option>
                <option value="normal">{t("animation.normal")}</option>
                <option value="high">{t("animation.high")}</option>
              </select>
            </label>
            <label className="pipe-link-toggle">
              <span>{t("settings.hints.title")}</span>
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
              <div className="pipe-link-key-hints" aria-label={t("aria.keyHints")}>
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
                  <span>{getLevelNumber(item)} {getLevelName(item, t)}</span>
                  <strong>
                    {progress.bestSteps[item.id]
                      ? stepText(progress.bestSteps[item.id], t)
                      : progress.completedLevelIds.includes(item.id)
                        ? t("level.done")
                        : t("level.notDone")}
                  </strong>
                </div>
              ))}
            </div>
          </section>

          <Button type="button" variant="secondary" onClick={clearProgress}>
            {t("action.clearRecord")}
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
            <div className="pipe-link-home-backdrop" aria-hidden="true">
              <span className="pipe-link-home-grid" />
              <span className="pipe-link-home-scan" />
              <span className="pipe-link-home-route">
                <span className="pipe-link-home-route__segment pipe-link-home-route__segment--1" />
                <span className="pipe-link-home-route__segment pipe-link-home-route__segment--2" />
                <span className="pipe-link-home-route__segment pipe-link-home-route__segment--3" />
                <span className="pipe-link-home-route__segment pipe-link-home-route__segment--4" />
                <span className="pipe-link-home-route__segment pipe-link-home-route__segment--5" />
                <span className="pipe-link-home-route__node pipe-link-home-route__node--1" />
                <span className="pipe-link-home-route__node pipe-link-home-route__node--2" />
                <span className="pipe-link-home-route__node pipe-link-home-route__node--3" />
                <span className="pipe-link-home-route__node pipe-link-home-route__node--4" />
              </span>
              <span className="pipe-link-home-tile pipe-link-home-tile--1" />
              <span className="pipe-link-home-tile pipe-link-home-tile--2" />
              <span className="pipe-link-home-tile pipe-link-home-tile--3" />
              <span className="pipe-link-home-tile pipe-link-home-tile--4" />
              <span className="pipe-link-home-tile pipe-link-home-tile--5" />
            </div>
            <div className="pipe-link-title-screen">
              <div className="pipe-link-title-copy">
                <h1 className="pipe-link-art-title" data-text={displayTitle}>
                  {displayTitle}
                </h1>
                <span>{t("subtitle")}</span>
              </div>

              <div className="pipe-link-title-menu" aria-label={t("aria.mainMenu")}>
                <button type="button" className="pipe-link-title-button pipe-link-title-button--primary" onClick={continueGame}>
                  {t("menu.start")}
                </button>
                <button type="button" className="pipe-link-title-button" onClick={startNewGame}>
                  {t("menu.new")}
                </button>
                <button type="button" className="pipe-link-title-button" onClick={() => setActiveView("levels")}>
                  {t("menu.levels")}
                </button>
                <button type="button" className="pipe-link-title-button" onClick={() => setActiveView("editor")}>
                  {t("menu.editor")}
                </button>
                <button type="button" className="pipe-link-title-button" onClick={() => setActiveView("settings")}>
                  {t("action.settings")}
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
                        <span>{isBuiltInLevel(level.id) ? t("game.level", { level: activeLevelNumber }) : t("game.custom")}</span>
                        {getLevelName(level, t)}
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
                    label={getLevelName(level, t)}
                    t={t}
                  />
                </div>

                {gameState.message && (
                  <p className="pipe-link-game-message" role="status">
                    {t(gameState.message)}
                  </p>
                )}

                {dialogView && (
                  <div className="pipe-link-dialog-layer" role="dialog" aria-modal="true">
                    {dialogView === "pause" ? (
                      <section className="pipe-link-dialog">
                        <p>{t("dialog.pause")}</p>
                        <h3>{t("dialog.pause")}</h3>
                        <span>{t("dialog.pauseHint")}</span>
                        <div className="pipe-link-dialog-actions">
                          <Button type="button" onClick={() => setDialogView(null)}>
                            {t("action.continue")}
                          </Button>
                          <Button type="button" variant="secondary" onClick={restart}>
                            {t("action.restart")}
                          </Button>
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={() => {
                              setDialogView(null);
                              setActiveView("settings");
                            }}
                          >
                            {t("action.settings")}
                          </Button>
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={() => {
                              setDialogView(null);
                              setActiveView("home");
                            }}
                          >
                            {t("action.backHome")}
                          </Button>
                        </div>
                      </section>
                    ) : (
                      <section className="pipe-link-dialog">
                        <p>{isBuiltInLevel(level.id) ? t("game.level", { level: activeLevelNumber }) : t("game.custom")}</p>
                        <h3>{t("dialog.complete")}</h3>
                        <span>{getLevelName(level, t)} · {stepText(gameState.steps, t)}</span>
                        <div className="pipe-link-dialog-actions pipe-link-dialog-actions--complete">
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={() => {
                              setDialogView(null);
                              setActiveView("home");
                            }}
                          >
                            {t("action.menu")}
                          </Button>
                          <Button type="button" onClick={nextLevel}>
                            {t("action.next")}
                          </Button>
                          <Button type="button" variant="secondary" onClick={restart}>
                            {t("action.replay")}
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
                      <p>{t("level.builtIn")}</p>
                      <h2>{t("level.select")}</h2>
                    </div>
                  </div>
                  <span>{t("level.summaryDone", { progress: progressLabel })}</span>
                </header>

                <div className="pipe-link-level-grid" aria-label={t("level.select")}>
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
                        <strong>{getLevelName(item, t)}</strong>
                        <small>
                          {completed
                            ? progress.bestSteps[item.id]
                              ? stepText(progress.bestSteps[item.id], t)
                              : t("level.completed")
                            : unlocked
                              ? t("level.difficulty", { count: item.difficulty })
                              : t("level.locked")}
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
                      <p>{t("editor.type")}</p>
                      <h2>{t("editor.title")}</h2>
                    </div>
                  </div>
                </header>

                <section className="tw:grid tw:min-h-0 tw:grid-cols-[minmax(0,1fr)_minmax(210px,34%)] tw:gap-2 tw:overflow-hidden max-[760px]:tw:grid-cols-1 max-[760px]:tw:overflow-auto">
                  <div className="pipe-link-board-shell tw:cursor-crosshair" aria-label={t("aria.editorBoard")}>
                    <BoardCanvas
                      level={editorLevel}
                      state={editorPreviewState}
                      animation={settings.animation}
                      interactive={false}
                      label={getLevelName(editorLevel, t)}
                      onCellClick={applyEditorTool}
                      t={t}
                    />
                  </div>

                  <aside className="tw:grid tw:min-h-0 tw:min-w-0 tw:content-start tw:gap-1.5 tw:overflow-auto tw:pr-0.5 max-[760px]:tw:overflow-visible">
                    <label className="tw:grid tw:gap-1 tw:text-[13px] tw:font-black tw:text-[var(--pipe-fg)]">
                      <span>{t("editor.name")}</span>
                      <input
                        className="tw:h-8 tw:w-full tw:min-w-0 tw:rounded-lg tw:border tw:border-[var(--pipe-border)] tw:bg-[var(--pipe-panel-strong)] tw:px-2.5 tw:text-[var(--pipe-fg)] tw:outline-none"
                        value={editorDraft.name === DEFAULT_EDITOR_DRAFT.name ? t("editor.defaultName") : editorDraft.name}
                        maxLength={18}
                        onChange={(event) => updateEditorName(event.target.value)}
                      />
                    </label>

                    <div className="tw:grid tw:grid-cols-4 tw:gap-1.5 max-[520px]:tw:grid-cols-3" aria-label={t("aria.tools")}>
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
                          <span className="tw:text-[10px] tw:font-black tw:leading-none">{t(tool.labelKey)}</span>
                        </button>
                      ))}
                    </div>

                    <div className="tw:grid tw:grid-cols-3 tw:gap-1.5 max-[520px]:tw:grid-cols-1">
                      <Button type="button" size="sm" onClick={playEditorLevel}>
                        {t("action.play")}
                      </Button>
                      <Button type="button" size="sm" variant="secondary" onClick={exportCurrentEditorLevel}>
                        {t("action.export")}
                      </Button>
                      <Button type="button" size="sm" variant="secondary" onClick={importEditorLevel}>
                        {t("action.import")}
                      </Button>
                    </div>

                    {editorTransferOpen && (
                      <textarea
                        className="tw:min-h-[70px] tw:w-full tw:min-w-0 tw:resize-y tw:rounded-lg tw:border tw:border-[var(--pipe-border)] tw:bg-[var(--pipe-panel-strong)] tw:px-2.5 tw:py-2 tw:text-[11px] tw:leading-snug tw:text-[var(--pipe-fg)] tw:outline-none"
                        value={editorTransfer}
                        onChange={(event) => setEditorTransfer(event.target.value)}
                        placeholder={t("editor.placeholder")}
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
                      <p>{t("settings.pref")}</p>
                      <h2>{t("settings.title")}</h2>
                    </div>
                  </div>
                  <Button type="button" size="sm" variant="secondary" onClick={clearProgress}>
                    {t("action.clear")}
                  </Button>
                </header>

                <section className="pipe-link-settings-grid">
                  <label className="pipe-link-setting-card">
                    <span>{t("settings.animation.title")}</span>
                    <small>{t("settings.animation.desc")}</small>
                    <select
                      value={settings.animation}
                      onChange={(event) =>
                        persistSettings({
                          ...settings,
                          animation: event.target.value as PipeLinkSettings["animation"],
                        })
                      }
                    >
                      <option value="low">{t("animation.low")}</option>
                      <option value="normal">{t("animation.normal")}</option>
                      <option value="high">{t("animation.high")}</option>
                    </select>
                  </label>

                  <label className="pipe-link-setting-card pipe-link-setting-card--inline">
                    <span>{t("settings.hints.title")}</span>
                    <small>{t("settings.hints.desc")}</small>
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
                      <span>{t("aria.keyHints")}</span>
                      <div className="pipe-link-key-hints" aria-label={t("aria.keyHints")}>
                        <span>{t("key.up")}</span>
                        <span>{t("key.left")}</span>
                        <span>{t("key.down")}</span>
                        <span>{t("key.right")}</span>
                      </div>
                    </section>
                  )}

                  <section className="pipe-link-setting-card pipe-link-setting-card--wide">
                      <span>{t("progress.title")}</span>
                    <div className="pipe-link-progress-list">
                      {LEVELS.map((item) => (
                        <div key={item.id} className="pipe-link-progress-row">
                          <span>{getLevelNumber(item)} {getLevelName(item, t)}</span>
                          <strong>
                            {progress.bestSteps[item.id]
                              ? stepText(progress.bestSteps[item.id], t)
                              : progress.completedLevelIds.includes(item.id)
                                ? t("level.done")
                                : t("level.notDone")}
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
