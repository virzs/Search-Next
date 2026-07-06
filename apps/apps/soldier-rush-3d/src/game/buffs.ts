export type BuffKind = "good" | "bad" | "mixed";
export type WeaponType = "rifle" | "spread" | "laser" | "rocket" | "missile";
export type HeroType = "vanguard" | "gunner" | "sniper";
export type ActiveSkillType = "none" | "airstrike" | "laserBarrage" | "cannonSweep";

export interface RunStats {
  squadCount: number;
  damage: number;
  multishot: number;
  critChance: number;
  critDamage: number;
  fireRate: number;
  shield: number;
  score: number;
  weapon: WeaponType;
  heroHealth: number;
  heroTimer: number;
  heroType: HeroType;
  activeSkill: ActiveSkillType;
  activeSkillCharges: number;
}

export interface BuffDefinition {
  id: string;
  label: string;
  kind: BuffKind;
  color: string;
  apply: (stats: RunStats) => string;
}

export const STAT_LIMITS = {
  squadCount: Number.POSITIVE_INFINITY,
  damage: Number.POSITIVE_INFINITY,
  multishot: Number.POSITIVE_INFINITY,
  critChance: 1,
  critDamage: Number.POSITIVE_INFINITY,
  fireRate: Number.POSITIVE_INFINITY,
  shield: Number.POSITIVE_INFINITY,
  heroHealth: Number.POSITIVE_INFINITY,
} as const;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const randomRange = (min: number, max: number) => min + Math.random() * (max - min);

const randomInt = (min: number, max: number) => Math.round(randomRange(min, max));

const varyPercent = (percent: number) => percent * randomRange(0.72, 1.55);

const formatSignedPercent = (fraction: number) => {
  if (fraction === 0) return "+0%";
  const sign = fraction > 0 ? "+" : "-";
  const percent = Math.abs(fraction * 100);
  return percent < 1 ? `${sign}<1%` : `${sign}${Math.round(percent)}%`;
};

const formatSignedX = (value: number) => {
  if (value === 0) return "+0x";
  const sign = value > 0 ? "+" : "-";
  const amount = Math.abs(value);
  if (amount < 0.01) return `${sign}<0.01x`;
  return `${sign}${amount < 0.1 ? amount.toFixed(2) : amount.toFixed(1)}x`;
};

const softGrowth = (current: number, pivot: number) =>
  1 / Math.sqrt(1 + Math.max(0, current) / pivot);

const addSquad = (stats: RunStats, amount: number) => {
  const before = stats.squadCount;
  const magnitude = Math.max(1, Math.abs(amount));
  const rawRolled = randomInt(Math.max(1, Math.floor(magnitude * 0.55)), Math.max(1, Math.ceil(magnitude * 1.85)));
  const rolled = amount >= 0 ? Math.max(1, Math.round(rawRolled * softGrowth(stats.squadCount, 90))) : rawRolled;
  const delta = amount >= 0 ? rolled : -rolled;
  stats.squadCount = amount >= 0
    ? stats.squadCount + delta
    : Math.max(1, stats.squadCount + delta);
  return stats.squadCount - before;
};

const addDamagePercent = (stats: RunStats, percent: number) => {
  const rolled = varyPercent(percent);
  const effective = rolled * softGrowth(stats.damage, 520);
  stats.damage = Math.max(4, Math.round(stats.damage * (1 + effective)));
  return effective;
};

const multiplyFireRate = (stats: RunStats, value: number) => {
  const rolled = value >= 1 ? randomRange(1 + (value - 1) * 0.65, 1 + (value - 1) * 1.7) : randomRange(value * 0.82, 0.98);
  const effective = value >= 1 ? 1 + (rolled - 1) * softGrowth(stats.fireRate, 4.4) : rolled;
  stats.fireRate = Math.max(0.55, stats.fireRate * effective);
  return effective;
};

const addMultishot = (stats: RunStats, amount: number) => {
  const before = stats.multishot;
  const magnitude = Math.max(1, Math.abs(amount));
  const rawRolled = randomInt(Math.max(1, Math.floor(magnitude * 0.75)), Math.max(1, Math.ceil(magnitude * 2.15)));
  const rolled = amount >= 0 ? Math.max(1, Math.round(rawRolled * softGrowth(stats.multishot, 34))) : rawRolled;
  const delta = amount >= 0 ? rolled : -rolled;
  stats.multishot = Math.max(1, stats.multishot + delta);
  return stats.multishot - before;
};

const addShield = (stats: RunStats, amount: number) => {
  const delta = randomInt(Math.max(1, Math.floor(amount * 0.7)), Math.max(1, Math.ceil(amount * 2.2)));
  stats.shield += delta;
  return delta;
};

const addCritDamage = (stats: RunStats, min: number, max: number) => {
  const delta = randomRange(min, max) * softGrowth(stats.critDamage, 5.5);
  stats.critDamage = Math.max(1.3, stats.critDamage + delta);
  return delta;
};

const setActiveSkill = (stats: RunStats, activeSkill: ActiveSkillType, charges: number) => {
  stats.activeSkill = activeSkill;
  const delta = randomInt(charges, charges + 1);
  stats.activeSkillCharges += delta;
  return delta;
};

export const POSITIVE_BUFFS: BuffDefinition[] = [
  {
    id: "squad-plus-3",
    label: "兵力补给",
    kind: "good",
    color: "#55d66b",
    apply: (stats) => {
      const delta = addSquad(stats, 3);
      return `小队扩编 ${delta > 0 ? `+${delta}` : delta}`;
    },
  },
  {
    id: "squad-plus-6",
    label: "兵力扩编",
    kind: "good",
    color: "#36c16f",
    apply: (stats) => {
      const delta = addSquad(stats, 6);
      return `兵力扩编 +${delta}`;
    },
  },
  {
    id: "damage-up",
    label: "火力提升",
    kind: "good",
    color: "#ffb347",
    apply: (stats) => {
      const rolled = addDamagePercent(stats, 0.35);
      return `武器威力提升 ${formatSignedPercent(rolled)}`;
    },
  },
  {
    id: "damage-big",
    label: "火力爆发",
    kind: "good",
    color: "#ff9f43",
    apply: (stats) => {
      const rolled = addDamagePercent(stats, 0.6);
      return `重火力上线 ${formatSignedPercent(rolled)}`;
    },
  },
  {
    id: "multishot-up",
    label: "弹幕扩展",
    kind: "good",
    color: "#69d6ff",
    apply: (stats) => {
      const delta = addMultishot(stats, 1);
      return `弹幕加宽 +${delta}`;
    },
  },
  {
    id: "multishot-big",
    label: "弹幕矩阵",
    kind: "good",
    color: "#58c7ff",
    apply: (stats) => {
      const delta = addMultishot(stats, 2);
      return `双排弹幕展开 +${delta}`;
    },
  },
  {
    id: "crit-up",
    label: "暴率训练",
    kind: "good",
    color: "#ffdf57",
    apply: (stats) => {
      const before = stats.critChance;
      const delta = randomRange(0.08, 0.22);
      stats.critChance = clamp(stats.critChance + delta, 0, STAT_LIMITS.critChance);
      const actual = stats.critChance - before;
      return actual > 0 ? `暴击率提升 ${formatSignedPercent(actual)}` : "暴击率已达上限";
    },
  },
  {
    id: "crit-damage-up",
    label: "暴伤训练",
    kind: "good",
    color: "#f97316",
    apply: (stats) => {
      const before = stats.critDamage;
      const delta = addCritDamage(stats, 0.24, 0.72);
      return `暴击伤害提升 ${formatSignedX(stats.critDamage - before || delta)}`;
    },
  },
  {
    id: "rate-up",
    label: "射速提升",
    kind: "good",
    color: "#b184ff",
    apply: (stats) => {
      const rolled = multiplyFireRate(stats, 1.24);
      return `射击节奏加快 ${formatSignedPercent(rolled - 1)}`;
    },
  },
  {
    id: "shield-up",
    label: "临时护盾",
    kind: "good",
    color: "#58e2ca",
    apply: (stats) => {
      const delta = addShield(stats, 5);
      return `临时护盾部署 +${delta}`;
    },
  },
  {
    id: "score-up",
    label: "积分奖励",
    kind: "good",
    color: "#ffd34d",
    apply: (stats) => {
      stats.score += 450;
      return "奖励积分入账";
    },
  },
  {
    id: "weapon-spread",
    label: "武器: 散弹",
    kind: "good",
    color: "#38bdf8",
    apply: (stats) => {
      stats.weapon = "spread";
      addMultishot(stats, 1);
      return "切换散弹武器";
    },
  },
  {
    id: "weapon-laser",
    label: "武器: 激光",
    kind: "good",
    color: "#a78bfa",
    apply: (stats) => {
      stats.weapon = "laser";
      stats.critChance = clamp(stats.critChance + randomRange(0.04, 0.14), 0, STAT_LIMITS.critChance);
      return "切换穿透激光";
    },
  },
  {
    id: "weapon-rocket",
    label: "武器: 火箭",
    kind: "good",
    color: "#fb923c",
    apply: (stats) => {
      stats.weapon = "rocket";
      addDamagePercent(stats, 0.2);
      return "切换爆炸火箭";
    },
  },
  {
    id: "weapon-missile",
    label: "武器: 导弹",
    kind: "good",
    color: "#facc15",
    apply: (stats) => {
      stats.weapon = "missile";
      addCritDamage(stats, 0.18, 0.52);
      return "切换追踪导弹";
    },
  },
];

export const NEGATIVE_BUFFS: BuffDefinition[] = [
  {
    id: "squad-minus",
    label: "兵力流失",
    kind: "bad",
    color: "#ff6f5f",
    apply: (stats) => {
      const delta = addSquad(stats, -3);
      if (delta === 0) return "最后 1 名士兵不会被减益带走";
      return `小队减员 ${delta}`;
    },
  },
  {
    id: "damage-down",
    label: "火力下降",
    kind: "bad",
    color: "#ff7b6b",
    apply: (stats) => {
      const factor = randomRange(0.58, 0.84);
      stats.damage = Math.max(4, Math.round(stats.damage * factor));
      return `武器输出降低 ${formatSignedPercent(factor - 1)}`;
    },
  },
  {
    id: "rate-down",
    label: "射速下降",
    kind: "bad",
    color: "#f37c72",
    apply: (stats) => {
      const factor = randomRange(0.68, 0.9);
      stats.fireRate = Math.max(0.55, stats.fireRate * factor);
      return `射击节奏变慢 ${formatSignedPercent(factor - 1)}`;
    },
  },
  {
    id: "crit-down",
    label: "暴率下降",
    kind: "bad",
    color: "#ff8276",
    apply: (stats) => {
      const before = stats.critChance;
      const delta = randomRange(0.07, 0.2);
      stats.critChance = clamp(stats.critChance - delta, 0, STAT_LIMITS.critChance);
      const actual = stats.critChance - before;
      return actual < 0 ? `暴击率降低 ${formatSignedPercent(actual)}` : "暴击率已经最低";
    },
  },
  {
    id: "crit-damage-down",
    label: "暴伤下降",
    kind: "bad",
    color: "#ff8276",
    apply: (stats) => {
      const before = stats.critDamage;
      const delta = randomRange(0.18, 0.48);
      stats.critDamage = Math.max(1.3, stats.critDamage - delta);
      return `暴击伤害降低 ${formatSignedX(stats.critDamage - before)}`;
    },
  },
  {
    id: "multishot-down",
    label: "弹幕收窄",
    kind: "bad",
    color: "#ff7669",
    apply: (stats) => {
      const delta = addMultishot(stats, -1);
      return `弹幕收窄 ${delta}`;
    },
  },
];

export const MIXED_BUFFS: BuffDefinition[] = [
  {
    id: "berserk-fire",
    label: "狂热火力",
    kind: "mixed",
    color: "#f59e0b",
    apply: (stats) => {
      addDamagePercent(stats, 0.72);
      multiplyFireRate(stats, 1.18);
      addSquad(stats, -2);
      return "狂热火力：输出暴涨但小队减员";
    },
  },
  {
    id: "glass-cannon",
    label: "玻璃大炮",
    kind: "mixed",
    color: "#fb7185",
    apply: (stats) => {
      addDamagePercent(stats, 1);
      stats.shield = 0;
      return "玻璃大炮：火力翻倍但护盾清空";
    },
  },
  {
    id: "wide-burst",
    label: "扩散弹幕",
    kind: "mixed",
    color: "#38bdf8",
    apply: (stats) => {
      addMultishot(stats, 2);
      stats.weapon = "spread";
      multiplyFireRate(stats, 0.9);
      return "扩散弹幕：弹道增加但射速下降";
    },
  },
  {
    id: "heavy-guard",
    label: "重装推进",
    kind: "mixed",
    color: "#2dd4bf",
    apply: (stats) => {
      addShield(stats, 10);
      multiplyFireRate(stats, 0.86);
      return "重装推进：护盾大幅提升";
    },
  },
  {
    id: "bounty-contract",
    label: "赏金契约",
    kind: "mixed",
    color: "#facc15",
    apply: (stats) => {
      stats.score += 1400;
      addSquad(stats, -3);
      return "赏金契约：立刻获得大量积分";
    },
  },
];

export const HERO_BUFFS: BuffDefinition[] = [
  {
    id: "hero-vanguard",
    label: "英雄: 先锋",
    kind: "good",
    color: "#22c55e",
    apply: (stats) => {
      stats.heroType = "vanguard";
      stats.heroHealth += randomInt(7, 16);
      stats.heroTimer = Math.max(stats.heroTimer, randomInt(28, 44));
      addShield(stats, 4);
      return "英雄先锋加入战斗";
    },
  },
  {
    id: "hero-gunner",
    label: "英雄: 炮手",
    kind: "good",
    color: "#f97316",
    apply: (stats) => {
      stats.heroType = "gunner";
      stats.heroHealth += randomInt(6, 13);
      stats.heroTimer = Math.max(stats.heroTimer, randomInt(24, 38));
      addDamagePercent(stats, 0.45);
      return "英雄炮手临时入队";
    },
  },
  {
    id: "hero-sniper",
    label: "英雄: 狙击",
    kind: "good",
    color: "#eab308",
    apply: (stats) => {
      stats.heroType = "sniper";
      stats.heroHealth += randomInt(5, 11);
      stats.heroTimer = Math.max(stats.heroTimer, randomInt(22, 36));
      stats.critChance = clamp(stats.critChance + randomRange(0.1, 0.24), 0, STAT_LIMITS.critChance);
      addCritDamage(stats, 0.35, 0.9);
      return "英雄狙击手加入战斗";
    },
  },
];

export const ACTIVE_SKILL_BUFFS: BuffDefinition[] = [
  {
    id: "skill-airstrike",
    label: "技能: 空袭",
    kind: "good",
    color: "#facc15",
    apply: (stats) => {
      const charges = setActiveSkill(stats, "airstrike", 2);
      return `获得空袭技能 +${charges} 次`;
    },
  },
  {
    id: "skill-laser-barrage",
    label: "技能: 激光雨",
    kind: "good",
    color: "#a78bfa",
    apply: (stats) => {
      const charges = setActiveSkill(stats, "laserBarrage", 2);
      return `获得激光轰炸 +${charges} 次`;
    },
  },
  {
    id: "skill-cannon-sweep",
    label: "技能: 机炮扫射",
    kind: "good",
    color: "#38bdf8",
    apply: (stats) => {
      const charges = setActiveSkill(stats, "cannonSweep", 2);
      return `获得机炮扫射 +${charges} 次`;
    },
  },
];

export const BUFFS: BuffDefinition[] = [
  ...POSITIVE_BUFFS,
  ...NEGATIVE_BUFFS,
  ...MIXED_BUFFS,
  ...HERO_BUFFS,
  ...ACTIVE_SKILL_BUFFS,
];

const filterBuffsForWeapon = (pool: BuffDefinition[], currentWeapon?: WeaponType) => {
  if (!currentWeapon) return pool;
  return pool.filter((buff) => buff.id !== `weapon-${currentWeapon}` && !(currentWeapon === "spread" && buff.id === "wide-burst"));
};

const pickUnique = (pool: BuffDefinition[], count: number) => {
  const options = [...pool];
  const picks: BuffDefinition[] = [];
  while (picks.length < count && options.length) {
    const index = Math.floor(Math.random() * options.length);
    const [next] = options.splice(index, 1);
    picks.push(next);
  }
  return picks;
};

const pickWeightedPool = (
  pools: Array<{ pool: BuffDefinition[]; weight: number }>,
) => {
  const viable = pools.filter((item) => item.pool.length > 0 && item.weight > 0);
  const total = viable.reduce((sum, item) => sum + item.weight, 0);
  let roll = Math.random() * total;
  for (const item of viable) {
    roll -= item.weight;
    if (roll <= 0) return item.pool;
  }
  return viable[0]?.pool ?? POSITIVE_BUFFS;
};

const getPressure = (powerRatio = 1) => clamp((powerRatio - 1.28) / 2.8, 0, 0.62);

export const pickBuffPair = (allowMixed = false, currentWeapon?: WeaponType, powerRatio = 1) => {
  const positives = filterBuffsForWeapon(POSITIVE_BUFFS, currentWeapon);
  const mixed = filterBuffsForWeapon(MIXED_BUFFS, currentWeapon);
  const pressure = getPressure(powerRatio);
  const mixedPool = allowMixed || pressure > 0.18 ? mixed : [];
  const firstPool = pickWeightedPool([
    { pool: HERO_BUFFS, weight: 0.08 - pressure * 0.04 },
    { pool: ACTIVE_SKILL_BUFFS, weight: 0.1 },
    { pool: positives, weight: 0.76 - pressure * 0.42 },
    { pool: mixedPool, weight: 0.08 + pressure * 0.32 },
    { pool: NEGATIVE_BUFFS, weight: 0.16 + pressure * 0.72 },
  ]);
  const first = firstPool[Math.floor(Math.random() * firstPool.length)];
  const secondPool = pickWeightedPool([
    { pool: HERO_BUFFS, weight: 0.05 - pressure * 0.03 },
    { pool: ACTIVE_SKILL_BUFFS, weight: 0.12 },
    { pool: positives, weight: 0.64 - pressure * 0.34 },
    { pool: mixedPool, weight: 0.12 + pressure * 0.34 },
    { pool: NEGATIVE_BUFFS, weight: 0.24 + pressure * 0.82 },
  ]);
  let second = secondPool[Math.floor(Math.random() * secondPool.length)];

  if (second.id === first.id) {
    second =
      secondPool.find((buff) => buff.id !== first.id) ||
      BUFFS.find((buff) => buff.id !== first.id) ||
      second;
  }

  return [first, second] as const;
};

export const pickChoiceBuffs = (allowMixed = false, currentWeapon?: WeaponType, powerRatio = 1) => {
  const positives = filterBuffsForWeapon(POSITIVE_BUFFS, currentWeapon);
  const mixed = filterBuffsForWeapon(MIXED_BUFFS, currentWeapon);
  const pressure = getPressure(powerRatio);
  const hasHero = Math.random() < 0.14;
  const hasSkill = Math.random() < 0.24;
  if (!allowMixed) {
    const pressurePool = pressure > 0.35 ? [...mixed, ...NEGATIVE_BUFFS] : [];
    return pickUnique([...positives, ...(hasHero ? HERO_BUFFS : []), ...(hasSkill ? ACTIVE_SKILL_BUFFS : []), ...pressurePool], 3);
  }
  const positivePicks = pickUnique(positives, pressure > 0.42 ? 1 : 2);
  const thirdPool = pressure > 0.42
    ? [...mixed, ...NEGATIVE_BUFFS, ...ACTIVE_SKILL_BUFFS]
    : hasSkill
      ? ACTIVE_SKILL_BUFFS
      : hasHero
        ? HERO_BUFFS
        : mixed;
  const third = pickUnique(thirdPool, 3 - positivePicks.length);
  return pickUnique([...positivePicks, ...third], 3);
};
