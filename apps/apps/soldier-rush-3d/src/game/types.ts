import type * as THREE from "three";
import type { ActiveSkillType, BuffDefinition, HeroType, WeaponType } from "./buffs";

export type RunStatus = "idle" | "running" | "gameover";

export interface RunSnapshot {
  status: RunStatus;
  score: number;
  elapsed: number;
  distance: number;
  squadCount: number;
  damage: number;
  multishot: number;
  critChance: number;
  critDamage: number;
  fireRate: number;
  shield: number;
  weapon: WeaponType;
  heroHealth: number;
  heroTimer: number;
  heroType: HeroType;
  activeSkill: ActiveSkillType;
  activeSkillCharges: number;
  activeSkillCooldown: number;
  bossHealth: number;
  bossMaxHealth: number;
  bossActive: boolean;
  bossWarning: boolean;
  difficulty: number;
  notice: string;
}

export interface RunResult {
  score: number;
  elapsed: number;
  distance: number;
}

export interface GameAudioSettings {
  musicVolume: number;
  effectsVolume: number;
}

export interface SoldierRushCallbacks {
  onSnapshot: (snapshot: RunSnapshot) => void;
  onGameOver: (result: RunResult) => void;
}

export interface Bullet {
  mesh: THREE.Mesh;
  velocityX: number;
  velocityZ: number;
  damage: number;
  radius: number;
  pierce: number;
  splashRadius: number;
  weapon: WeaponType;
}

export interface Beam {
  mesh: THREE.Mesh;
  life: number;
  maxLife: number;
  damage: number;
  x: number;
  zMin: number;
  zMax: number;
  width: number;
  hostile: boolean;
}

export type EnemyBehavior = "runner" | "shooter" | "boss" | "summon";
export type EnemyWeaponType = "none" | WeaponType;

export interface Enemy {
  group: THREE.Group;
  health: number;
  maxHealth: number;
  speed: number;
  score: number;
  radius: number;
  squadDamage: number;
  barFill: THREE.Mesh;
  barHalfWidth: number;
  laneX: number;
  isBoss: boolean;
  shootTimer: number;
  shootInterval: number;
  bulletDamage: number;
  behavior: EnemyBehavior;
  weapon: EnemyWeaponType;
  holdZ: number;
  holdTimer: number;
  wobble: number;
}

export interface EnemyType {
  name: string;
  health: number;
  speed: number;
  score: number;
  squadDamage: number;
  radius: number;
  scale: number;
  color: number;
  shootInterval: number;
  bulletDamage: number;
  behavior: Exclude<EnemyBehavior, "boss">;
  weapon: EnemyWeaponType;
}

export interface EnemyBullet {
  mesh: THREE.Mesh;
  velocityX: number;
  velocityZ: number;
  damage: number;
  radius: number;
  weapon: EnemyWeaponType;
  splashRadius: number;
}

export interface GateOption {
  buff: BuffDefinition;
  x: number;
}

export interface GateCluster {
  group: THREE.Group;
  options: GateOption[];
  applied: boolean;
  mode: "pair" | "choice";
}

export interface Particle {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  life: number;
}

export interface SkillProjectile {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  damage: number;
  radius: number;
  color: THREE.ColorRepresentation;
  kind: ActiveSkillType;
  delay?: number;
}

export interface SkillBeam {
  group: THREE.Group;
  life: number;
  maxLife: number;
  tickTimer: number;
  damagePerTick: number;
  radius: number;
  color: THREE.ColorRepresentation;
}

export interface FloatingLabel {
  sprite: THREE.Sprite;
  life: number;
  velocityY: number;
}
