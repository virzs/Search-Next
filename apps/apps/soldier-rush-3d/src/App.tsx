import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import {
  SoldierRushThreeGame,
  type GameAudioSettings,
  type RunResult,
  type RunSnapshot,
} from "./game/SoldierRushThreeGame";
import { resources, type AppTranslationFn, useAppI18n } from "./i18n";
import type { ScoreRecord, ScoreState, AppProps, AppSDK } from "./types";

const SCORE_STORAGE_KEY = "soldierRush3dScores";
const SETTINGS_STORAGE_KEY = "soldierRush3dSettings";
const MAX_SCORE_RECORDS = 10;
const DEFAULT_GAME_SETTINGS: GameAudioSettings = {
  musicVolume: 0.28,
  effectsVolume: 0.52,
};
type MenuPanel = "home" | "history" | "settings";

const INITIAL_SNAPSHOT: RunSnapshot = {
  status: "idle",
  score: 0,
  elapsed: 0,
  distance: 0,
  squadCount: 4,
  damage: 22,
  multishot: 2,
  critChance: 0.1,
  critDamage: 1.8,
  fireRate: 1.12,
  shield: 0,
  weapon: "rifle",
  heroHealth: 0,
  heroTimer: 0,
  heroType: "vanguard",
  activeSkill: "none",
  activeSkillCharges: 0,
  activeSkillCooldown: 0,
  bossHealth: 0,
  bossMaxHealth: 0,
  bossActive: false,
  bossWarning: false,
  difficulty: 1,
  notice: "准备出发",
};

const EMPTY_SCORE_STATE: ScoreState = {
  bestScore: 0,
  lastScore: 0,
  runs: [],
};

const safeParseJson = (value: unknown) => {
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const toFiniteNumber = (value: unknown, fallback = 0) =>
  typeof value === "number" && Number.isFinite(value) ? value : fallback;

const parseScoreState = (value: unknown): ScoreState => {
  const parsed = safeParseJson(value);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return EMPTY_SCORE_STATE;
  }
  const raw = parsed as Record<string, unknown>;
  const runs = Array.isArray(raw.runs)
    ? raw.runs
        .map((item): ScoreRecord | null => {
          if (!item || typeof item !== "object" || Array.isArray(item)) return null;
          const record = item as Record<string, unknown>;
          return {
            score: Math.max(0, Math.floor(toFiniteNumber(record.score))),
            elapsed: Math.max(0, toFiniteNumber(record.elapsed)),
            distance: Math.max(0, toFiniteNumber(record.distance)),
            at: typeof record.at === "string" ? record.at : new Date().toISOString(),
          };
        })
        .filter((item): item is ScoreRecord => Boolean(item))
        .slice(0, MAX_SCORE_RECORDS)
    : [];
  const bestFromRuns = runs.reduce((best, run) => Math.max(best, run.score), 0);
  return {
    bestScore: Math.max(bestFromRuns, Math.floor(toFiniteNumber(raw.bestScore))),
    lastScore: Math.floor(toFiniteNumber(raw.lastScore, runs[0]?.score ?? 0)),
    runs,
  };
};

const readScoreState = async (sdk?: AppSDK) => {
  try {
    if (sdk?.storage?.get) {
      return parseScoreState(await sdk.storage.get(SCORE_STORAGE_KEY));
    }
    if (typeof window !== "undefined") {
      return parseScoreState(window.localStorage.getItem(SCORE_STORAGE_KEY));
    }
  } catch {
    return EMPTY_SCORE_STATE;
  }
  return EMPTY_SCORE_STATE;
};

const writeScoreState = async (sdk: AppSDK | undefined, value: ScoreState) => {
  const payload = JSON.stringify(value);
  try {
    if (sdk?.storage?.set) {
      await sdk.storage.set(SCORE_STORAGE_KEY, payload);
      return;
    }
    if (typeof window !== "undefined") {
      window.localStorage.setItem(SCORE_STORAGE_KEY, payload);
    }
  } catch {
    // Score persistence should never interrupt a run.
  }
};

const parseGameSettings = (value: unknown): GameAudioSettings => {
  const parsed = safeParseJson(value);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return DEFAULT_GAME_SETTINGS;
  }
  const raw = parsed as Record<string, unknown>;
  return {
    musicVolume: Math.min(1, Math.max(0, toFiniteNumber(raw.musicVolume, DEFAULT_GAME_SETTINGS.musicVolume))),
    effectsVolume: Math.min(1, Math.max(0, toFiniteNumber(raw.effectsVolume, DEFAULT_GAME_SETTINGS.effectsVolume))),
  };
};

const readGameSettings = async (sdk?: AppSDK) => {
  try {
    if (sdk?.storage?.get) {
      return parseGameSettings(await sdk.storage.get(SETTINGS_STORAGE_KEY));
    }
    if (typeof window !== "undefined") {
      return parseGameSettings(window.localStorage.getItem(SETTINGS_STORAGE_KEY));
    }
  } catch {
    return DEFAULT_GAME_SETTINGS;
  }
  return DEFAULT_GAME_SETTINGS;
};

const writeGameSettings = async (sdk: AppSDK | undefined, value: GameAudioSettings) => {
  const payload = JSON.stringify(value);
  try {
    if (sdk?.storage?.set) {
      await sdk.storage.set(SETTINGS_STORAGE_KEY, payload);
      return;
    }
    if (typeof window !== "undefined") {
      window.localStorage.setItem(SETTINGS_STORAGE_KEY, payload);
    }
  } catch {
    // Audio preferences are best-effort.
  }
};

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const rest = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${rest}`;
};

const formatPercent = (value: number) => `${Math.round(value * 100)}%`;
const formatCompact = (value: number) => {
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`;
  if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (abs >= 10_000) return `${(value / 1_000).toFixed(1)}K`;
  return `${Math.floor(value)}`;
};
const formatDistance = (value: number) => `${formatCompact(value)}m`;
const formatVolume = (value: number) => `${Math.round(value * 100)}%`;
const weaponLabels = {
  rifle: "步枪",
  spread: "散弹",
  laser: "激光",
  rocket: "火箭",
  missile: "导弹",
} as const;
const activeSkillLabels = {
  none: "-",
  airstrike: "空袭",
  laserBarrage: "激光雨",
  cannonSweep: "机炮扫射",
} as const;

const createNextScoreState = (previous: ScoreState, result: RunResult) => {
  const record: ScoreRecord = {
    score: result.score,
    elapsed: result.elapsed,
    distance: result.distance,
    at: new Date().toISOString(),
  };
  const runs = [record, ...previous.runs].slice(0, MAX_SCORE_RECORDS);
  return {
    bestScore: Math.max(previous.bestScore, result.score),
    lastScore: result.score,
    runs,
  };
};

const IconView = () => (
  <div className="sr3d-icon-view">
    <div className="sr3d-icon-glow" />
    <div className="sr3d-icon-gate sr3d-icon-gate-left" />
    <div className="sr3d-icon-gate sr3d-icon-gate-right" />
    <div className="sr3d-icon-road">
      <span className="sr3d-icon-dash" />
      <span className="sr3d-icon-dash" />
      <span className="sr3d-icon-dash" />
      <span className="sr3d-icon-bullet sr3d-icon-bullet-a" />
      <span className="sr3d-icon-bullet sr3d-icon-bullet-b" />
      <span className="sr3d-icon-bullet sr3d-icon-bullet-c" />
      <div className="sr3d-icon-squad">
        <span className="sr3d-icon-soldier sr3d-icon-soldier-a" />
        <span className="sr3d-icon-soldier sr3d-icon-soldier-b" />
        <span className="sr3d-icon-soldier sr3d-icon-soldier-c" />
      </div>
    </div>
  </div>
);

const ScoreList = ({ scoreState }: { scoreState: ScoreState }) => (
  <div className="sr3d-score-list">
    {scoreState.runs.length ? (
      scoreState.runs.slice(0, 5).map((run, index) => (
        <div className="sr3d-score-row" key={`${run.at}-${index}`}>
          <span>#{index + 1}</span>
          <strong>{run.score}</strong>
          <span>{formatTime(run.elapsed)}</span>
        </div>
      ))
    ) : (
      <div className="sr3d-empty-score">暂无战绩</div>
    )}
  </div>
);

const AudioSettingsPanel = ({
  gameSettings,
  onChange,
  t,
}: {
  gameSettings: GameAudioSettings;
  onChange: (key: keyof GameAudioSettings, value: number) => void;
  t: AppTranslationFn;
}) => (
  <div className="sr3d-settings-panel">
    <label className="sr3d-volume-row">
      <span>{t("settings.music")}</span>
      <input
        min={0}
        max={1}
        step={0.01}
        type="range"
        value={gameSettings.musicVolume}
        onChange={(event) => onChange("musicVolume", Number(event.currentTarget.value))}
      />
      <strong>{formatVolume(gameSettings.musicVolume)}</strong>
    </label>
    <label className="sr3d-volume-row">
      <span>{t("settings.effects")}</span>
      <input
        min={0}
        max={1}
        step={0.01}
        type="range"
        value={gameSettings.effectsVolume}
        onChange={(event) => onChange("effectsVolume", Number(event.currentTarget.value))}
      />
      <strong>{formatVolume(gameSettings.effectsVolume)}</strong>
    </label>
  </div>
);

const App = ({ mode = "full", sdk }: AppProps) => {
  const { t } = useAppI18n(sdk, resources);
  const hostRef = useRef<HTMLDivElement | null>(null);
  const gameRef = useRef<SoldierRushThreeGame | null>(null);
  const handleGameOverRef = useRef<(result: RunResult) => void>(() => undefined);
  const gameSettingsRef = useRef<GameAudioSettings>(DEFAULT_GAME_SETTINGS);
  const [themeId, setThemeId] = useState(sdk?.theme?.activeThemeId || "light");
  const [snapshot, setSnapshot] = useState<RunSnapshot>(INITIAL_SNAPSHOT);
  const [scoreState, setScoreState] = useState<ScoreState>(EMPTY_SCORE_STATE);
  const [gameSettings, setGameSettings] = useState<GameAudioSettings>(DEFAULT_GAME_SETTINGS);
  const [menuPanel, setMenuPanel] = useState<MenuPanel>("home");

  const isIcon = mode === "icon" || mode === "appIcon";
  const isSettings = mode === "settings";

  useEffect(() => {
    if (!sdk?.onThemeChange) return undefined;
    return sdk.onThemeChange((theme) => setThemeId(theme.activeThemeId));
  }, [sdk]);

  useEffect(() => {
    let disposed = false;
    void Promise.all([readScoreState(sdk), readGameSettings(sdk)]).then(([nextScoreState, nextSettings]) => {
      if (disposed) return;
      setScoreState(nextScoreState);
      gameSettingsRef.current = nextSettings;
      setGameSettings(nextSettings);
    });
    return () => {
      disposed = true;
    };
  }, [sdk]);

  const handleGameOver = useCallback(
    (result: RunResult) => {
      setScoreState((previous) => {
        const next = createNextScoreState(previous, result);
        void writeScoreState(sdk, next);
        return next;
      });
    },
    [sdk],
  );

  useEffect(() => {
    handleGameOverRef.current = handleGameOver;
  }, [handleGameOver]);

  useEffect(() => {
    if (isIcon || isSettings || !hostRef.current) return undefined;
    const game = new SoldierRushThreeGame(hostRef.current, {
      onSnapshot: setSnapshot,
      onGameOver: (result) => handleGameOverRef.current(result),
    }, gameSettingsRef.current);
    gameRef.current = game;
    return () => {
      game.dispose();
      if (gameRef.current === game) gameRef.current = null;
    };
  }, [isIcon, isSettings]);

  useEffect(() => {
    gameSettingsRef.current = gameSettings;
    gameRef.current?.setAudioSettings(gameSettings);
  }, [gameSettings]);

  const startRun = useCallback(() => {
    setMenuPanel("home");
    gameRef.current?.start();
  }, []);

  const returnHome = useCallback(() => {
    setMenuPanel("home");
    gameRef.current?.returnHome();
  }, []);

  const useActiveSkill = useCallback(() => {
    gameRef.current?.useActiveSkill();
  }, []);

  const updateAudioSetting = useCallback(
    (key: keyof GameAudioSettings, value: number) => {
      setGameSettings((previous) => {
        const next = {
          ...previous,
          [key]: Math.min(1, Math.max(0, value)),
        };
        void writeGameSettings(sdk, next);
        return next;
      });
    },
    [sdk],
  );

  const isBossPhase = snapshot.status === "running" && (snapshot.bossActive || snapshot.bossWarning);
  const hasActiveSkill = snapshot.activeSkill !== "none" && snapshot.activeSkillCharges > 0;
  const activeSkillLabel = hasActiveSkill ? (activeSkillLabels[snapshot.activeSkill] ?? "-") : "-";
  const skillCooldown = hasActiveSkill ? Math.ceil(snapshot.activeSkillCooldown) : 0;
  const skillHint = !hasActiveSkill ? "未获得" : skillCooldown > 0 ? `${skillCooldown}s` : "";
  const canUseSkill =
    snapshot.status === "running" &&
    hasActiveSkill &&
    snapshot.activeSkillCooldown <= 0;
  const skillButtonClassName = cn(
    "sr3d-skill-button",
    canUseSkill && "sr3d-skill-button-ready",
    !hasActiveSkill && "sr3d-skill-button-unavailable",
  );
  const shellClassName = cn(
    "sr3d-shell",
    themeId === "dark" && "sr3d-shell-dark",
    isIcon && "sr3d-shell-icon",
    isBossPhase && "sr3d-shell-boss",
    snapshot.status !== "running" && !isIcon && !isSettings && "sr3d-shell-menu",
  );

  const statItems = useMemo(
    () => [
      { label: t("stat.squad"), value: formatCompact(snapshot.squadCount) },
      { label: t("stat.damage"), value: formatCompact(snapshot.damage) },
      { label: t("stat.bullets"), value: formatCompact(snapshot.multishot) },
      { label: t("stat.critChance"), value: formatPercent(snapshot.critChance) },
      { label: t("stat.critDamage"), value: `${snapshot.critDamage.toFixed(1)}x` },
      { label: t("stat.weapon"), value: weaponLabels[snapshot.weapon] },
      { label: t("stat.shield"), value: formatCompact(snapshot.shield) },
      { label: t("stat.hero"), value: snapshot.heroTimer > 0 ? `${Math.ceil(snapshot.heroTimer)}s/${formatCompact(snapshot.heroHealth)}` : "-" },
      { label: t("stat.skill"), value: hasActiveSkill ? `${activeSkillLabel}x${snapshot.activeSkillCharges}` : "-" },
      { label: t("stat.level"), value: snapshot.difficulty.toFixed(1) },
    ],
    [activeSkillLabel, hasActiveSkill, snapshot, t],
  );

  if (isIcon) {
    return (
      <div className={shellClassName}>
        <IconView />
      </div>
    );
  }

  if (isSettings) {
    return (
      <div className={cn(shellClassName, "sr3d-settings")}>
        <div className="sr3d-settings-header">
          <strong>{t("settings.label")}</strong>
          <span>{t("settings.subtitle")}</span>
        </div>
        <AudioSettingsPanel gameSettings={gameSettings} onChange={updateAudioSetting} t={t} />
      </div>
    );
  }

  return (
    <div className={shellClassName}>
      <div ref={hostRef} className="sr3d-stage" />
      <div className="sr3d-top-panel" aria-live="polite">
        <div className="sr3d-hud">
          <div className="sr3d-score-box">
            <span>{t("stat.score")}</span>
            <strong>{formatCompact(snapshot.score)}</strong>
          </div>
          <div className="sr3d-score-box">
            <span>{t("stat.distance")}</span>
            <strong>{formatDistance(snapshot.distance)}</strong>
          </div>
          <div className="sr3d-score-box">
            <span>{t("stat.time")}</span>
            <strong>{formatTime(snapshot.elapsed)}</strong>
          </div>
        </div>
        <div className="sr3d-center-stack">
          {isBossPhase && (
            <div className={cn("sr3d-boss-bar", snapshot.bossWarning && "sr3d-boss-warning")}>
              <div className="sr3d-boss-bar-head">
                <span>{snapshot.bossWarning ? "BOSS WARNING" : "BOSS"}</span>
                <strong>
                  {snapshot.bossActive
                    ? `${Math.max(0, Math.ceil(snapshot.bossHealth))}/${Math.max(1, Math.ceil(snapshot.bossMaxHealth))}`
                    : "清场后出现"}
                </strong>
              </div>
              <div className="sr3d-boss-bar-track">
                <span
                  style={{
                    width: `${snapshot.bossActive ? Math.max(0, Math.min(100, (snapshot.bossHealth / Math.max(1, snapshot.bossMaxHealth)) * 100)) : 100}%`,
                  }}
                />
              </div>
            </div>
          )}
          <div className="sr3d-action-row">
            <div className="sr3d-notice">{snapshot.notice}</div>
            {snapshot.status === "running" && (
              <button className="sr3d-mini-button" type="button" onClick={returnHome}>
                {t("action.home")}
              </button>
            )}
          </div>
          {snapshot.status === "running" && (
            <button
              className={skillButtonClassName}
              type="button"
              onClick={useActiveSkill}
              disabled={!canUseSkill}
            >
              <span>{t("action.skill")}</span>
              <strong>
                {activeSkillLabel}
                {hasActiveSkill ? ` x${snapshot.activeSkillCharges}` : ""}
              </strong>
              {skillHint && <em>{skillHint}</em>}
            </button>
          )}
        </div>
        <div className="sr3d-stat-strip">
          {statItems.map((item) => (
            <div className="sr3d-stat-pill" key={item.label}>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </div>
          ))}
        </div>
      </div>
      {snapshot.status !== "running" && (
        <div className="sr3d-menu">
          <div className="sr3d-title-block">
            <span>{t("title.kicker")}</span>
            <h1>{t("title")}</h1>
          </div>
          {snapshot.status === "gameover" && (
            <div className="sr3d-result">
              <span>{t("result.last")}</span>
              <strong>{scoreState.lastScore}</strong>
            </div>
          )}
          <div className="sr3d-menu-actions">
            <button className="sr3d-primary-button" type="button" onClick={startRun}>
              {t("action.start")}
            </button>
            <button
              className={cn("sr3d-secondary-button", menuPanel === "history" && "sr3d-secondary-button-active")}
              type="button"
              onClick={() => setMenuPanel((previous) => (previous === "history" ? "home" : "history"))}
            >
              {t("action.history")}
            </button>
            <button
              className={cn("sr3d-secondary-button", menuPanel === "settings" && "sr3d-secondary-button-active")}
              type="button"
              onClick={() => setMenuPanel((previous) => (previous === "settings" ? "home" : "settings"))}
            >
              {t("action.settings")}
            </button>
          </div>
          {menuPanel === "history" && (
            <div className="sr3d-menu-panel">
              <div className="sr3d-menu-panel-head">
                <span>{t("action.history")}</span>
                <strong>{formatCompact(scoreState.bestScore)}</strong>
              </div>
              <ScoreList scoreState={scoreState} />
            </div>
          )}
          {menuPanel === "settings" && (
            <div className="sr3d-menu-panel">
              <div className="sr3d-menu-panel-head">
                <span>{t("action.settings")}</span>
                <strong>{t("settings.subtitle")}</strong>
              </div>
              <AudioSettingsPanel gameSettings={gameSettings} onChange={updateAudioSetting} t={t} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default App;
