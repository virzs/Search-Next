import type { RunStats, WeaponType } from "./buffs";
import type { EnemyType, GameAudioSettings } from "./types";

export const PLAYER_Z = 5.35;
export const WORLD_MIN_Z = -72;
export const WORLD_MAX_Z = 18;
export const ROAD_HALF_WIDTH = 4.6;
export const PLAYER_LIMIT = 3.15;
export const GATE_X = 2.25;
export const ENEMY_LIMIT = 3.35;
export const FIRST_BOSS_AT = 76;
export const BOSS_Z = -24;
export const BOSS_WARNING_TIME = 6;
export const MAX_RENDERED_SQUAD = 96;
export const DEFAULT_AUDIO_SETTINGS: GameAudioSettings = {
  musicVolume: 0.28,
  effectsVolume: 0.52,
};

export const WEAPON_LABELS: Record<WeaponType, string> = {
  rifle: "步枪",
  spread: "散弹",
  laser: "激光",
  rocket: "火箭",
  missile: "导弹",
};

export const ENVIRONMENTS = [
  {
    name: "草原",
    notice: "环境切换：草原公路",
    sky: 0x7ec2e8,
    fog: 0x9ed1e7,
    grass: 0xbdf19d,
    road: 0xffefbf,
    curb: 0xdcc893,
    tree: 0x2e7d42,
    trunk: 0x7b4b2d,
    hemiGround: 0x4a7e58,
    transition: "rgba(154, 220, 166, 0.34)",
  },
  {
    name: "沙漠",
    notice: "环境切换：荒漠战线",
    sky: 0xf2c786,
    fog: 0xf4d9a5,
    grass: 0xd9c56f,
    road: 0xf6d28b,
    curb: 0xc99a4b,
    tree: 0x7ea34a,
    trunk: 0x8a5a2d,
    hemiGround: 0x8d6b35,
    transition: "rgba(238, 177, 92, 0.4)",
  },
  {
    name: "雪原",
    notice: "环境切换：雪原大道",
    sky: 0xb9d7f3,
    fog: 0xd8ecff,
    grass: 0xe9f7fb,
    road: 0xd8e7ed,
    curb: 0xa7c1cc,
    tree: 0x1f6f63,
    trunk: 0x5a4737,
    hemiGround: 0x8fb7c5,
    transition: "rgba(216, 239, 255, 0.46)",
  },
  {
    name: "夜城",
    notice: "环境切换：夜色封锁区",
    sky: 0x17243a,
    fog: 0x283a54,
    grass: 0x4f755f,
    road: 0x46566d,
    curb: 0x7dd3fc,
    tree: 0x1c5f54,
    trunk: 0x4b3a31,
    hemiGround: 0x1e3a4c,
    transition: "rgba(39, 74, 110, 0.48)",
  },
] as const;

export const ENEMY_TYPES: EnemyType[] = [
  {
    name: "raider",
    health: 24,
    speed: 1.1,
    score: 45,
    squadDamage: 1,
    radius: 0.55,
    scale: 1,
    color: 0xd83a31,
    shootInterval: 99,
    bulletDamage: 1,
    behavior: "runner",
    weapon: "none",
  },
  {
    name: "runner",
    health: 20,
    speed: 4.3,
    score: 58,
    squadDamage: 1,
    radius: 0.48,
    scale: 0.86,
    color: 0xff6c42,
    shootInterval: 99,
    bulletDamage: 1,
    behavior: "runner",
    weapon: "none",
  },
  {
    name: "rifleman",
    health: 32,
    speed: 0.9,
    score: 72,
    squadDamage: 1,
    radius: 0.55,
    scale: 1,
    color: 0xa855f7,
    shootInterval: 0.92,
    bulletDamage: 1,
    behavior: "shooter",
    weapon: "rifle",
  },
  {
    name: "shotgunner",
    health: 42,
    speed: 0.72,
    score: 96,
    squadDamage: 2,
    radius: 0.62,
    scale: 1.08,
    color: 0x0ea5e9,
    shootInterval: 1.22,
    bulletDamage: 1,
    behavior: "shooter",
    weapon: "spread",
  },
  {
    name: "guard",
    health: 56,
    speed: 0.85,
    score: 88,
    squadDamage: 2,
    radius: 0.68,
    scale: 1.18,
    color: 0xb6333f,
    shootInterval: 99,
    bulletDamage: 2,
    behavior: "runner",
    weapon: "none",
  },
  {
    name: "grenadier",
    health: 64,
    speed: 0.62,
    score: 126,
    squadDamage: 2,
    radius: 0.66,
    scale: 1.16,
    color: 0x16a34a,
    shootInterval: 1.55,
    bulletDamage: 2,
    behavior: "shooter",
    weapon: "rocket",
  },
  {
    name: "breaker",
    health: 118,
    speed: 0.58,
    score: 145,
    squadDamage: 3,
    radius: 0.86,
    scale: 1.46,
    color: 0x6d223c,
    shootInterval: 99,
    bulletDamage: 3,
    behavior: "runner",
    weapon: "none",
  },
  {
    name: "laser-eye",
    health: 92,
    speed: 0.56,
    score: 172,
    squadDamage: 2,
    radius: 0.7,
    scale: 1.22,
    color: 0xec4899,
    shootInterval: 1.02,
    bulletDamage: 2,
    behavior: "shooter",
    weapon: "laser",
  },
];

export const BOSS_TYPES: EnemyType[] = [
  {
    name: "tank-boss",
    health: 18000,
    speed: 0.35,
    score: 5200,
    squadDamage: 9,
    radius: 1.95,
    scale: 1.25,
    color: 0x55307f,
    shootInterval: 0.94,
    bulletDamage: 1,
    behavior: "summon",
    weapon: "spread",
  },
  {
    name: "gunship-boss",
    health: 26000,
    speed: 0.42,
    score: 5600,
    squadDamage: 8,
    radius: 2.05,
    scale: 1.32,
    color: 0x2563eb,
    shootInterval: 0.56,
    bulletDamage: 2,
    behavior: "summon",
    weapon: "laser",
  },
  {
    name: "rocket-boss",
    health: 34000,
    speed: 0.28,
    score: 6200,
    squadDamage: 10,
    radius: 2.18,
    scale: 1.38,
    color: 0xb45309,
    shootInterval: 0.92,
    bulletDamage: 3,
    behavior: "summon",
    weapon: "missile",
  },
];

export const BOSS_SUMMON_TYPE: EnemyType = {
  name: "drone",
  health: 82,
  speed: 0.45,
  score: 84,
  squadDamage: 1,
  radius: 0.52,
  scale: 0.92,
  color: 0x334155,
  shootInterval: 0.95,
  bulletDamage: 1,
  behavior: "summon",
  weapon: "rifle",
};

export const createStats = (): RunStats => ({
  squadCount: 4,
  damage: 22,
  multishot: 2,
  critChance: 0.1,
  critDamage: 1.8,
  fireRate: 1.12,
  shield: 0,
  score: 0,
  weapon: "rifle",
  heroHealth: 0,
  heroTimer: 0,
  heroType: "vanguard",
  activeSkill: "none",
  activeSkillCharges: 0,
});

export const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export type EnvironmentConfig = (typeof ENVIRONMENTS)[number];
export type EnvironmentName = EnvironmentConfig["name"];
