import * as THREE from "three";
import type { HeroType, WeaponType } from "./buffs";
import { clamp, type EnvironmentName } from "./constants";

const disposeMaterial = (material: THREE.Material) => {
  const maybeWithMap = material as THREE.Material & { map?: THREE.Texture | null };
  maybeWithMap.map?.dispose();
  material.dispose();
};

export const disposeObject = (object: THREE.Object3D) => {
  object.traverse((child) => {
    const mesh = child as THREE.Mesh;
    mesh.geometry?.dispose?.();
    const material = mesh.material;
    if (Array.isArray(material)) {
      material.forEach(disposeMaterial);
    } else if (material) {
      disposeMaterial(material);
    }
  });
};

const createCanvasLabel = (
  text: string,
  fill: string,
  options: { width?: number; height?: number; textColor?: string; fontSize?: number } = {},
) => {
  const width = options.width ?? 512;
  const height = options.height ?? 192;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(canvas);

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = fill;
  const radius = 36;
  ctx.beginPath();
  ctx.moveTo(radius, 16);
  ctx.lineTo(width - radius, 16);
  ctx.quadraticCurveTo(width - 16, 16, width - 16, radius);
  ctx.lineTo(width - 16, height - radius);
  ctx.quadraticCurveTo(width - 16, height - 16, width - radius, height - 16);
  ctx.lineTo(radius, height - 16);
  ctx.quadraticCurveTo(16, height - 16, 16, height - radius);
  ctx.lineTo(16, radius);
  ctx.quadraticCurveTo(16, 16, radius, 16);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "rgba(255,255,255,0.72)";
  ctx.lineWidth = 8;
  ctx.stroke();
  ctx.fillStyle = options.textColor ?? "#ffffff";
  ctx.font = `800 ${options.fontSize ?? 58}px "PingFang SC", "Microsoft YaHei", system-ui, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.shadowColor = "rgba(0,0,0,0.24)";
  ctx.shadowBlur = 6;
  ctx.fillText(text, width / 2, height / 2 + 2, width - 52);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
};

export const createMistTexture = (variant: "horizon" | "road") => {
  const width = variant === "horizon" ? 512 : 256;
  const height = variant === "horizon" ? 256 : 512;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(canvas);

  const image = ctx.createImageData(width, height);
  const data = image.data;
  for (let y = 0; y < height; y += 1) {
    const v = y / Math.max(1, height - 1);
    for (let x = 0; x < width; x += 1) {
      const u = x / Math.max(1, width - 1);
      const edgeX = Math.sin(Math.PI * u);
      const edgeY = Math.sin(Math.PI * v);
      const center = Math.sin(Math.PI * u) * Math.sin(Math.PI * (variant === "horizon" ? 1 - v * 0.72 : v));
      const softness = variant === "horizon"
        ? Math.pow(Math.max(0, edgeX), 0.72) * Math.pow(Math.max(0, edgeY), 1.8)
        : Math.pow(Math.max(0, edgeX), 0.9) * Math.pow(Math.max(0, edgeY), 0.58);
      const alpha = clamp(center * softness * (variant === "horizon" ? 245 : 185), 0, 255);
      const index = (y * width + x) * 4;
      data[index] = 255;
      data[index + 1] = 255;
      data[index + 2] = 255;
      data[index + 3] = alpha;
    }
  }
  ctx.putImageData(image, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
};

export const createTextSprite = (
  text: string,
  fill: string,
  options: { scale?: number; textColor?: string; fontSize?: number } = {},
) => {
  const texture = createCanvasLabel(text, fill, {
    textColor: options.textColor,
    fontSize: options.fontSize,
  });
  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthWrite: false,
  });
  const sprite = new THREE.Sprite(material);
  const scale = options.scale ?? 1;
  sprite.scale.set(2.9 * scale, 1.08 * scale, 1);
  return sprite;
};

export const createBox = (
  size: [number, number, number],
  color: THREE.ColorRepresentation,
  position: [number, number, number],
  options: { roughness?: number; metalness?: number } = {},
) => {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(size[0], size[1], size[2]),
    new THREE.MeshStandardMaterial({
      color,
      roughness: options.roughness ?? 0.72,
      metalness: options.metalness ?? 0.03,
    }),
  );
  mesh.position.set(position[0], position[1], position[2]);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
};

export const createSoldier = (uniformColor: THREE.ColorRepresentation, helmetColor: THREE.ColorRepresentation) => {
  const soldier = new THREE.Group();
  soldier.add(createBox([0.38, 0.56, 0.28], uniformColor, [0, 0.62, 0]));
  soldier.add(createBox([0.34, 0.24, 0.26], 0xffc09a, [0, 1.04, -0.02]));
  soldier.add(createBox([0.42, 0.16, 0.32], helmetColor, [0, 1.18, -0.02]));
  soldier.add(createBox([0.15, 0.38, 0.15], 0x1f2937, [-0.12, 0.19, 0.02]));
  soldier.add(createBox([0.15, 0.38, 0.15], 0x1f2937, [0.12, 0.19, 0.02]));
  soldier.add(createBox([0.11, 0.1, 0.56], 0x1c1b19, [0.28, 0.73, -0.24]));
  return soldier;
};

export const createHeroSoldier = (heroType: HeroType) => {
  const uniform = heroType === "gunner" ? 0xe45f23 : heroType === "sniper" ? 0x0f766e : 0x1d4ed8;
  const helmet = heroType === "gunner" ? 0x111827 : heroType === "sniper" ? 0xf8fafc : 0xfacc15;
  const hero = createSoldier(uniform, helmet);
  if (heroType === "gunner") {
    hero.add(createBox([0.64, 0.16, 0.18], 0xf97316, [0, 0.9, -0.34]));
    hero.add(createBox([0.12, 0.12, 0.84], 0x0f172a, [-0.34, 0.8, -0.44]));
    hero.add(createBox([0.12, 0.12, 0.84], 0x0f172a, [0.34, 0.8, -0.44]));
    hero.add(createBox([0.46, 0.12, 0.1], 0xfacc15, [0, 1.32, -0.04]));
  } else if (heroType === "sniper") {
    hero.add(createBox([0.34, 0.72, 0.08], 0x115e59, [0, 0.72, 0.2]));
    hero.add(createBox([0.13, 0.13, 1.28], 0x111827, [0.46, 0.82, -0.55]));
    hero.add(createBox([0.18, 0.18, 0.18], 0x7dd3fc, [0.46, 0.82, -0.14], { metalness: 0.1 }));
  } else {
    hero.add(createBox([0.72, 0.18, 0.2], 0xfacc15, [0, 0.9, -0.32]));
    hero.add(createBox([0.16, 0.16, 0.76], 0x0f172a, [0.42, 0.8, -0.38]));
    hero.add(createBox([0.54, 0.68, 0.1], 0x22c55e, [-0.48, 0.74, -0.22]));
  }
  hero.scale.setScalar(1.32);
  return hero;
};

export const createBossVehicle = (name: string, color: THREE.ColorRepresentation) => {
  const boss = new THREE.Group();
  if (name === "gunship-boss") {
    boss.add(createBox([2.2, 0.55, 1.4], color, [0, 1.18, 0], { metalness: 0.16, roughness: 0.48 }));
    boss.add(createBox([4.2, 0.18, 0.78], 0x93c5fd, [0, 1.26, -0.06], { metalness: 0.12 }));
    boss.add(createBox([0.42, 0.26, 1.7], 0x1e3a8a, [0, 1.34, -0.55], { metalness: 0.18 }));
    boss.add(createBox([0.36, 0.18, 0.92], 0x0f172a, [-0.52, 0.82, 0.24]));
    boss.add(createBox([0.36, 0.18, 0.92], 0x0f172a, [0.52, 0.82, 0.24]));
    boss.add(createBox([0.22, 0.22, 0.94], 0xf8fafc, [0, 1.68, -0.92], { metalness: 0.1 }));
    return boss;
  }

  if (name === "rocket-boss") {
    boss.add(createBox([2.35, 0.58, 1.65], color, [0, 0.66, 0], { metalness: 0.12, roughness: 0.52 }));
    boss.add(createBox([1.55, 0.5, 1.18], 0x78350f, [0, 1.2, -0.12], { metalness: 0.18 }));
    boss.add(createBox([0.26, 0.26, 1.45], 0xf97316, [-0.42, 1.55, -0.48], { metalness: 0.22 }));
    boss.add(createBox([0.26, 0.26, 1.45], 0xf97316, [0.42, 1.55, -0.48], { metalness: 0.22 }));
    boss.add(createBox([2.7, 0.28, 0.28], 0x111827, [0, 0.24, -0.62]));
    boss.add(createBox([2.7, 0.28, 0.28], 0x111827, [0, 0.24, 0.62]));
    return boss;
  }

  boss.add(createBox([2.45, 0.62, 1.72], color, [0, 0.6, 0], { metalness: 0.18, roughness: 0.5 }));
  boss.add(createBox([1.28, 0.54, 1.02], 0x6d28d9, [0, 1.2, -0.08], { metalness: 0.2 }));
  boss.add(createBox([0.32, 0.32, 1.7], 0x1f2937, [0, 1.24, -1.0], { metalness: 0.28 }));
  boss.add(createBox([2.84, 0.3, 0.3], 0x111827, [0, 0.24, -0.62]));
  boss.add(createBox([2.84, 0.3, 0.3], 0x111827, [0, 0.24, 0.62]));
  boss.add(createBox([0.42, 0.42, 0.24], 0xe879f9, [-0.62, 1.34, -0.62], { metalness: 0.12 }));
  boss.add(createBox([0.42, 0.42, 0.24], 0xe879f9, [0.62, 1.34, -0.62], { metalness: 0.12 }));
  return boss;
};

export const createPlayerBulletMesh = (weapon: WeaponType, heroColor?: THREE.ColorRepresentation) => {
  const bulletColor = heroColor ?? 0xfff177;
  const bulletEmissive = heroColor ?? 0xffd34a;
  if (weapon === "laser") {
    return new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.08, 1.18),
      new THREE.MeshStandardMaterial({
        color: heroColor ?? 0x8b5cf6,
        emissive: heroColor ?? 0xc084fc,
        emissiveIntensity: 1,
        roughness: 0.22,
      }),
    );
  }

  if (weapon === "rocket") {
    return new THREE.Mesh(
      new THREE.SphereGeometry(0.19, 12, 8),
      new THREE.MeshStandardMaterial({
        color: heroColor ?? 0xfb923c,
        emissive: heroColor ?? 0xf97316,
        emissiveIntensity: 0.75,
        roughness: 0.34,
      }),
    );
  }

  if (weapon === "missile") {
    return new THREE.Mesh(
      new THREE.ConeGeometry(0.18, 0.62, 10),
      new THREE.MeshStandardMaterial({
        color: heroColor ?? 0xfacc15,
        emissive: heroColor ?? 0xf97316,
        emissiveIntensity: 0.82,
        roughness: 0.3,
        metalness: 0.18,
      }),
    );
  }

  if (weapon === "spread") {
    return new THREE.Mesh(
      new THREE.BoxGeometry(0.15, 0.15, 0.44),
      new THREE.MeshStandardMaterial({
        color: heroColor ?? 0x67e8f9,
        emissive: heroColor ?? 0x22d3ee,
        emissiveIntensity: 0.78,
        roughness: 0.35,
      }),
    );
  }

  return new THREE.Mesh(
    new THREE.BoxGeometry(0.13, 0.13, 0.58),
    new THREE.MeshStandardMaterial({
      color: bulletColor,
      emissive: bulletEmissive,
      emissiveIntensity: 0.7,
      roughness: 0.35,
    }),
  );
};

export const createShieldMesh = () => {
  const group = new THREE.Group();
  const shape = new THREE.Shape();
  shape.moveTo(-1.52, -0.78);
  shape.lineTo(-1.52, 0.42);
  shape.quadraticCurveTo(-1.42, 1.08, 0, 1.24);
  shape.quadraticCurveTo(1.42, 1.08, 1.52, 0.42);
  shape.lineTo(1.52, -0.78);
  shape.quadraticCurveTo(0, -0.56, -1.52, -0.78);

  const field = new THREE.Mesh(
    new THREE.ShapeGeometry(shape),
    new THREE.MeshBasicMaterial({
      color: 0x67e8f9,
      transparent: true,
      opacity: 0.24,
      depthWrite: false,
      side: THREE.DoubleSide,
    }),
  );
  field.userData.shieldRole = "field";
  field.renderOrder = 8;

  const borderPoints = shape.getPoints(48).map((point) => new THREE.Vector3(point.x, point.y, 0.035));
  const border = new THREE.LineLoop(
    new THREE.BufferGeometry().setFromPoints(borderPoints),
    new THREE.LineBasicMaterial({
      color: 0xb8fbff,
      transparent: true,
      opacity: 0.62,
      depthWrite: false,
    }),
  );
  border.userData.shieldRole = "rim";
  border.renderOrder = 9;

  const core = new THREE.Mesh(
    new THREE.CircleGeometry(0.2, 24),
    new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.22,
      depthWrite: false,
    }),
  );
  core.userData.shieldRole = "core";
  core.position.set(0, 0.12, 0.05);
  core.renderOrder = 10;

  const ribMaterial = new THREE.MeshBasicMaterial({
    color: 0xc7ffff,
    transparent: true,
    opacity: 0.34,
    depthWrite: false,
  });
  const ribs = [-1.08, -0.54, 0, 0.54, 1.08].map((x) => {
    const rib = new THREE.Mesh(new THREE.BoxGeometry(0.035, 1.48, 0.035), ribMaterial.clone());
    rib.position.set(x, 0.02, 0.052);
    rib.userData.shieldRole = "rib";
    rib.renderOrder = 10;
    return rib;
  });
  const lowerBand = new THREE.Mesh(new THREE.BoxGeometry(2.52, 0.045, 0.04), ribMaterial.clone());
  lowerBand.position.set(0, -0.52, 0.055);
  lowerBand.userData.shieldRole = "rib";
  lowerBand.renderOrder = 10;

  group.add(field, border, core, lowerBand, ...ribs);
  group.position.set(0, 1.06, -1.46);
  group.scale.set(1.04, 1, 1);
  group.visible = false;
  return group;
};

const createTree = () => {
  const tree = new THREE.Group();
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.16, 0.7, 6),
    new THREE.MeshStandardMaterial({ color: 0x7b4b2d, roughness: 0.9 }),
  );
  trunk.position.y = 0.35;
  trunk.userData.envRole = "trunk";
  const leaves = new THREE.Mesh(
    new THREE.ConeGeometry(0.72, 1.45, 7),
    new THREE.MeshStandardMaterial({ color: 0x2e7d42, roughness: 0.86 }),
  );
  leaves.position.y = 1.22;
  leaves.userData.envRole = "leaves";
  trunk.castShadow = true;
  leaves.castShadow = true;
  tree.add(trunk, leaves);
  return tree;
};

const createRock = (color: THREE.ColorRepresentation, scale = 1) => {
  const rock = new THREE.Mesh(
    new THREE.DodecahedronGeometry(0.36 * scale, 0),
    new THREE.MeshStandardMaterial({ color, roughness: 0.94 }),
  );
  rock.position.y = 0.22 * scale;
  rock.scale.set(1.25, 0.58, 0.9);
  rock.castShadow = true;
  rock.receiveShadow = true;
  return rock;
};

const createFlowerPatch = () => {
  const patch = new THREE.Group();
  const colors = [0xff7ab6, 0xffdf57, 0x7dd3fc];
  for (let index = 0; index < 5; index += 1) {
    const stem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.015, 0.018, 0.24, 5),
      new THREE.MeshStandardMaterial({ color: 0x2f8f4f, roughness: 0.82 }),
    );
    const blossom = new THREE.Mesh(
      new THREE.SphereGeometry(0.055, 8, 6),
      new THREE.MeshStandardMaterial({ color: colors[index % colors.length], roughness: 0.66 }),
    );
    const angle = index * 1.25;
    const radius = 0.12 + (index % 2) * 0.12;
    stem.position.set(Math.cos(angle) * radius, 0.12, Math.sin(angle) * radius);
    blossom.position.set(stem.position.x, 0.27, stem.position.z);
    stem.castShadow = true;
    blossom.castShadow = true;
    patch.add(stem, blossom);
  }
  return patch;
};

const createCactus = () => {
  const cactus = new THREE.Group();
  const material = new THREE.MeshStandardMaterial({ color: 0x3f8c4a, roughness: 0.88 });
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, 1.58, 8), material.clone());
  trunk.position.y = 0.79;
  trunk.castShadow = true;
  const top = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 6), material.clone());
  top.position.y = 1.58;
  top.scale.set(1, 0.62, 1);
  top.castShadow = true;
  cactus.add(trunk, top);

  for (const side of [-1, 1]) {
    const arm = new THREE.Group();
    const horizontal = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.085, 0.48, 8), material.clone());
    horizontal.rotation.z = Math.PI / 2;
    horizontal.position.set(side * 0.28, 0.88, 0);
    const vertical = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.085, 0.62, 8), material.clone());
    vertical.position.set(side * 0.52, 1.08, 0);
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.078, 8, 5), material.clone());
    cap.position.set(side * 0.52, 1.39, 0);
    horizontal.castShadow = true;
    vertical.castShadow = true;
    cap.castShadow = true;
    arm.add(horizontal, vertical, cap);
    cactus.add(arm);
  }

  const sand = createRock(0xb8894f, 0.72);
  sand.position.set(0.34, 0.04, 0.32);
  cactus.add(sand);
  return cactus;
};

const createSnowPine = () => {
  const pine = new THREE.Group();
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.1, 0.14, 0.58, 6),
    new THREE.MeshStandardMaterial({ color: 0x5a4737, roughness: 0.9 }),
  );
  trunk.position.y = 0.29;
  const leaves = new THREE.Mesh(
    new THREE.ConeGeometry(0.74, 1.36, 7),
    new THREE.MeshStandardMaterial({ color: 0x1f6f63, roughness: 0.82 }),
  );
  leaves.position.y = 1.12;
  const snow = new THREE.Mesh(
    new THREE.ConeGeometry(0.62, 0.56, 7),
    new THREE.MeshStandardMaterial({ color: 0xf8fbff, roughness: 0.74 }),
  );
  snow.position.y = 1.48;
  trunk.castShadow = true;
  leaves.castShadow = true;
  snow.castShadow = true;
  pine.add(trunk, leaves, snow);
  return pine;
};

const createIceCrystal = () => {
  const crystal = new THREE.Group();
  const material = new THREE.MeshStandardMaterial({
    color: 0x9fe8ff,
    emissive: 0x60d9ff,
    emissiveIntensity: 0.18,
    roughness: 0.22,
    metalness: 0.02,
  });
  for (let index = 0; index < 3; index += 1) {
    const shard = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.72 + index * 0.18, 5), material.clone());
    shard.position.set((index - 1) * 0.18, 0.36 + index * 0.08, (index % 2) * 0.12);
    shard.rotation.z = (index - 1) * 0.18;
    shard.castShadow = true;
    crystal.add(shard);
  }
  return crystal;
};

const createNightProp = () => {
  const prop = new THREE.Group();
  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.045, 0.055, 1.42, 8),
    new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.58, metalness: 0.2 }),
  );
  pole.position.y = 0.71;
  const lamp = new THREE.Mesh(
    new THREE.SphereGeometry(0.16, 12, 8),
    new THREE.MeshStandardMaterial({
      color: 0x7dd3fc,
      emissive: 0x38bdf8,
      emissiveIntensity: 1,
      transparent: true,
      opacity: 0.92,
      roughness: 0.22,
    }),
  );
  lamp.position.y = 1.48;
  const barrier = createBox([0.92, 0.18, 0.18], 0xf472b6, [0.52, 0.28, 0.12], { metalness: 0.18, roughness: 0.46 });
  barrier.rotation.y = -0.22;
  pole.castShadow = true;
  lamp.castShadow = true;
  prop.add(pole, lamp, barrier);
  return prop;
};

export const createEnvironmentScenery = (environmentName: EnvironmentName) => {
  if (environmentName === "沙漠") {
    return Math.random() < 0.72 ? createCactus() : (() => {
      const group = new THREE.Group();
      group.add(createRock(0xb8894f, 1.1), createRock(0xd1a15f, 0.72));
      group.children[1].position.set(0.46, 0.1, -0.2);
      return group;
    })();
  }

  if (environmentName === "雪原") {
    const group = new THREE.Group();
    group.add(Math.random() < 0.68 ? createSnowPine() : createIceCrystal());
    if (Math.random() < 0.4) {
      const mound = new THREE.Mesh(
        new THREE.SphereGeometry(0.34, 10, 6),
        new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.82 }),
      );
      mound.position.set(0.34, 0.12, 0.24);
      mound.scale.set(1.2, 0.34, 0.82);
      mound.receiveShadow = true;
      group.add(mound);
    }
    return group;
  }

  if (environmentName === "夜城") {
    if (Math.random() < 0.62) return createNightProp();
    const group = new THREE.Group();
    group.add(createRock(0x334155, 1.05));
    return group;
  }

  const group = new THREE.Group();
  group.add(createTree());
  if (Math.random() < 0.42) {
    const accent = Math.random() < 0.58 ? createFlowerPatch() : createRock(0x8da47a, 0.72);
    accent.position.set(0.44, 0, 0.24);
    group.add(accent);
  }
  return group;
};
