import * as THREE from "three";
import {
  pickBuffPair,
  pickChoiceBuffs,
  type BuffDefinition,
  type HeroType,
  type RunStats,
  type WeaponType,
} from "./buffs";
import {
  BOSS_SUMMON_TYPE,
  BOSS_TYPES,
  BOSS_WARNING_TIME,
  BOSS_Z,
  DEFAULT_AUDIO_SETTINGS,
  ENEMY_LIMIT,
  ENEMY_TYPES,
  ENVIRONMENTS,
  FIRST_BOSS_AT,
  GATE_X,
  MAX_RENDERED_SQUAD,
  PLAYER_LIMIT,
  PLAYER_Z,
  ROAD_HALF_WIDTH,
  WEAPON_LABELS,
  WORLD_MAX_Z,
  WORLD_MIN_Z,
  clamp,
  createStats,
} from "./constants";
import {
  createBossVehicle,
  createBox,
  createEnvironmentScenery,
  createHeroSoldier,
  createMistTexture,
  createPlayerBulletMesh,
  createShieldMesh,
  createSoldier,
  createTextSprite,
  disposeObject,
} from "./threeFactory";
import type {
  Beam,
  Bullet,
  Enemy,
  EnemyBehavior,
  EnemyBullet,
  EnemyType,
  EnemyWeaponType,
  FloatingLabel,
  GameAudioSettings,
  GateCluster,
  GateOption,
  Particle,
  RunResult,
  RunSnapshot,
  RunStatus,
  SkillBeam,
  SkillProjectile,
  SoldierRushCallbacks,
} from "./types";

export type { GameAudioSettings, RunResult, RunSnapshot, RunStatus } from "./types";

export class SoldierRushThreeGame {
  private readonly container: HTMLElement;
  private readonly callbacks: SoldierRushCallbacks;
  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.PerspectiveCamera(48, 1, 0.1, 220);
  private readonly renderer: THREE.WebGLRenderer;
  private readonly playerRoot = new THREE.Group();
  private readonly squadUnits: THREE.Group[] = [];
  private readonly heroUnit = new THREE.Group();
  private readonly shieldMesh = createShieldMesh();
  private readonly roadMarks: THREE.Mesh[] = [];
  private readonly trees: THREE.Group[] = [];
  private readonly bullets: Bullet[] = [];
  private readonly beams: Beam[] = [];
  private readonly enemyBullets: EnemyBullet[] = [];
  private readonly enemies: Enemy[] = [];
  private readonly gates: GateCluster[] = [];
  private readonly particles: Particle[] = [];
  private readonly skillProjectiles: SkillProjectile[] = [];
  private readonly skillBeams: SkillBeam[] = [];
  private readonly floatingLabels: FloatingLabel[] = [];
  private readonly keys = new Set<string>();
  private readonly resizeObserver?: ResizeObserver;
  private readonly curbMaterials: THREE.MeshStandardMaterial[] = [];
  private readonly transitionOverlay = document.createElement("div");
  private grassMaterial?: THREE.MeshStandardMaterial;
  private roadMaterial?: THREE.MeshStandardMaterial;
  private horizonMistMaterial?: THREE.MeshBasicMaterial;
  private roadMistMaterial?: THREE.MeshBasicMaterial;
  private audioSettings = DEFAULT_AUDIO_SETTINGS;
  private audioContext?: AudioContext;
  private musicGain?: GainNode;
  private effectsGain?: GainNode;
  private musicStepTimer = 0;
  private musicStep = 0;
  private lastSfxAt = new Map<string, number>();
  private skillCooldown = 0;
  private skillBossDamageBudget = Number.POSITIVE_INFINITY;
  private skillBossDamageUsed = 0;
  private shakeTimer = 0;
  private shakeStrength = 0;
  private lastHeroType: HeroType | null = null;
  private status: RunStatus = "idle";
  private stats = createStats();
  private frameId = 0;
  private lastFrameAt = performance.now();
  private playerX = 0;
  private targetX = 0;
  private elapsed = 0;
  private progressTime = 0;
  private distance = 0;
  private difficulty = 1;
  private shootTimer = 0.2;
  private enemySpawnTimer = 0.75;
  private gateSpawnTimer = 4.8;
  private nextChoiceLevel = 3;
  private nextBossAt = FIRST_BOSS_AT;
  private bossActive = false;
  private bossWarning = false;
  private bossSummonTimer = 5.2;
  private bossIntroTimer = 0;
  private bossCount = 0;
  private lastSnapshotAt = 0;
  private notice = "准备出发";
  private pointerActive = false;
  private pointerX = 0;
  private environmentIndex = 0;
  private environmentTransition: {
    fromIndex: number;
    toIndex: number;
    elapsed: number;
    duration: number;
    scenerySwapped: boolean;
  } | null = null;

  constructor(container: HTMLElement, callbacks: SoldierRushCallbacks, audioSettings?: Partial<GameAudioSettings>) {
    this.container = container;
    this.callbacks = callbacks;
    this.audioSettings = {
      ...DEFAULT_AUDIO_SETTINGS,
      ...audioSettings,
    };
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
      preserveDrawingBuffer: true,
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.domElement.className = "soldier-rush-canvas";
    this.renderer.domElement.dataset.testid = "soldier-rush-canvas";
    this.renderer.domElement.style.touchAction = "none";
    this.container.append(this.renderer.domElement);
    this.transitionOverlay.className = "soldier-rush-transition";
    this.container.append(this.transitionOverlay);

    this.setupScene();
    this.resize();
    this.resizeObserver =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => this.resize())
        : undefined;
    this.resizeObserver?.observe(this.container);
    window.addEventListener("resize", this.resize);
    window.addEventListener("keydown", this.handleKeyDown);
    window.addEventListener("keyup", this.handleKeyUp);
    this.renderer.domElement.addEventListener("pointerdown", this.handlePointerDown);
    this.renderer.domElement.addEventListener("pointermove", this.handlePointerMove);
    window.addEventListener("pointerup", this.handlePointerUp);
    this.updateSquadModels();
    this.emitSnapshot(true);
    this.frameId = window.requestAnimationFrame(this.tick);
  }

  start = () => {
    void this.ensureAudio();
    this.status = "running";
    this.stats = createStats();
    this.elapsed = 0;
    this.progressTime = 0;
    this.distance = 0;
    this.difficulty = 1;
    this.playerX = 0;
    this.targetX = 0;
    this.shootTimer = 0.18;
    this.enemySpawnTimer = 1.15;
    this.gateSpawnTimer = 0.75;
    this.nextChoiceLevel = 3;
    this.nextBossAt = FIRST_BOSS_AT;
    this.bossActive = false;
    this.bossWarning = false;
    this.bossSummonTimer = 5.2;
    this.bossIntroTimer = 0;
    this.bossCount = 0;
    this.skillCooldown = 0;
    this.skillBossDamageBudget = Number.POSITIVE_INFINITY;
    this.skillBossDamageUsed = 0;
    this.shakeTimer = 0;
    this.shakeStrength = 0;
    this.musicStepTimer = 0;
    this.musicStep = 0;
    this.environmentIndex = 0;
    this.notice = "冲锋开始";
    this.clearDynamicObjects();
    this.applyEnvironment(0, false);
    this.updateSquadModels();
    this.lastFrameAt = performance.now();
    this.playSfx("start", 392, 0.18, "triangle", 0.28);
    this.emitSnapshot(true);
  };

  returnHome = () => {
    this.status = "idle";
    this.stats = createStats();
    this.elapsed = 0;
    this.progressTime = 0;
    this.distance = 0;
    this.difficulty = 1;
    this.playerX = 0;
    this.targetX = 0;
    this.bossActive = false;
    this.bossWarning = false;
    this.bossIntroTimer = 0;
    this.bossCount = 0;
    this.skillCooldown = 0;
    this.skillBossDamageBudget = Number.POSITIVE_INFINITY;
    this.skillBossDamageUsed = 0;
    this.shakeTimer = 0;
    this.shakeStrength = 0;
    this.nextBossAt = FIRST_BOSS_AT;
    this.notice = "准备出发";
    this.clearDynamicObjects();
    this.applyEnvironment(0, false);
    this.updateSquadModels();
    this.emitSnapshot(true);
  };

  setAudioSettings = (settings: Partial<GameAudioSettings>) => {
    this.audioSettings = {
      musicVolume: clamp(settings.musicVolume ?? this.audioSettings.musicVolume, 0, 1),
      effectsVolume: clamp(settings.effectsVolume ?? this.audioSettings.effectsVolume, 0, 1),
    };
    this.musicGain?.gain.setTargetAtTime(this.audioSettings.musicVolume, this.audioContext?.currentTime ?? 0, 0.04);
    this.effectsGain?.gain.setTargetAtTime(this.audioSettings.effectsVolume, this.audioContext?.currentTime ?? 0, 0.04);
  };

  dispose = () => {
    window.cancelAnimationFrame(this.frameId);
    this.resizeObserver?.disconnect();
    window.removeEventListener("resize", this.resize);
    window.removeEventListener("keydown", this.handleKeyDown);
    window.removeEventListener("keyup", this.handleKeyUp);
    this.renderer.domElement.removeEventListener("pointerdown", this.handlePointerDown);
    this.renderer.domElement.removeEventListener("pointermove", this.handlePointerMove);
    window.removeEventListener("pointerup", this.handlePointerUp);
    disposeObject(this.scene);
    this.renderer.dispose();
    this.renderer.domElement.remove();
    this.transitionOverlay.remove();
    void this.audioContext?.close();
  };

  private setupScene = () => {
    this.scene.background = new THREE.Color(0x7ec2e8);
    this.scene.fog = new THREE.Fog(0x9ed1e7, 26, 72);
    this.camera.position.set(0, 7.2, 16.2);
    this.camera.lookAt(0, 1, -10);

    const hemi = new THREE.HemisphereLight(0xffffff, 0x4a7e58, 2.1);
    hemi.userData.envRole = "hemi";
    this.scene.add(hemi);
    const sun = new THREE.DirectionalLight(0xffffff, 2.4);
    sun.position.set(-6, 11, 7);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.camera.near = 1;
    sun.shadow.camera.far = 40;
    sun.shadow.camera.left = -16;
    sun.shadow.camera.right = 16;
    sun.shadow.camera.top = 20;
    sun.shadow.camera.bottom = -12;
    this.scene.add(sun);

    this.grassMaterial = new THREE.MeshStandardMaterial({ color: 0xbdf19d, roughness: 0.92 });
    const grass = new THREE.Mesh(new THREE.PlaneGeometry(28, 160), this.grassMaterial);
    grass.rotation.x = -Math.PI / 2;
    grass.position.set(0, -0.04, -25);
    grass.receiveShadow = true;
    this.scene.add(grass);

    this.roadMaterial = new THREE.MeshStandardMaterial({ color: 0xffefbf, roughness: 0.88 });
    const road = new THREE.Mesh(new THREE.PlaneGeometry(ROAD_HALF_WIDTH * 2, 160), this.roadMaterial);
    road.rotation.x = -Math.PI / 2;
    road.position.set(0, 0, -25);
    road.receiveShadow = true;
    this.scene.add(road);

    this.horizonMistMaterial = new THREE.MeshBasicMaterial({
      color: 0x9ed1e7,
      map: createMistTexture("horizon"),
      transparent: true,
      opacity: 0.5,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const horizonMist = new THREE.Mesh(new THREE.PlaneGeometry(34, 12), this.horizonMistMaterial);
    horizonMist.position.set(0, 3.55, WORLD_MIN_Z + 14);
    horizonMist.renderOrder = 2;
    this.scene.add(horizonMist);

    this.roadMistMaterial = new THREE.MeshBasicMaterial({
      color: 0x9ed1e7,
      map: createMistTexture("road"),
      transparent: true,
      opacity: 0.28,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const roadMist = new THREE.Mesh(new THREE.PlaneGeometry(ROAD_HALF_WIDTH * 2.7, 38), this.roadMistMaterial);
    roadMist.rotation.x = -Math.PI / 2;
    roadMist.position.set(0, 0.055, WORLD_MIN_Z + 14);
    roadMist.renderOrder = 3;
    this.scene.add(roadMist);

    const curbMaterial = new THREE.MeshStandardMaterial({ color: 0xdcc893, roughness: 0.86 });
    for (const x of [-ROAD_HALF_WIDTH - 0.08, ROAD_HALF_WIDTH + 0.08]) {
      const curb = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.1, 160), curbMaterial.clone());
      this.curbMaterials.push(curb.material as THREE.MeshStandardMaterial);
      curb.position.set(x, 0.03, -25);
      curb.receiveShadow = true;
      this.scene.add(curb);
    }

    const markMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.62,
      emissive: 0xffffff,
      emissiveIntensity: 0.03,
    });
    for (let index = 0; index < 16; index += 1) {
      const mark = new THREE.Mesh(new THREE.BoxGeometry(0.23, 0.025, 2.1), markMaterial.clone());
      mark.position.set(0, 0.035, WORLD_MIN_Z + index * 6);
      mark.receiveShadow = true;
      this.roadMarks.push(mark);
      this.scene.add(mark);
    }

    for (let index = 0; index < 30; index += 1) {
      const tree = createEnvironmentScenery("草原");
      const side = index % 2 === 0 ? -1 : 1;
      tree.position.set(side * (6.4 + Math.random() * 3.6), 0, WORLD_MIN_Z + index * 4.7);
      tree.rotation.y = Math.random() * Math.PI;
      const scale = 0.82 + Math.random() * 0.55;
      tree.scale.setScalar(scale);
      this.trees.push(tree);
      this.scene.add(tree);
    }

    this.playerRoot.position.set(0, 0, PLAYER_Z);
    this.heroUnit.visible = false;
    this.playerRoot.add(this.heroUnit);
    this.playerRoot.add(this.shieldMesh);
    this.scene.add(this.playerRoot);
    this.applyEnvironment(0, false);
  };

  private resize = () => {
    const rect = this.container.getBoundingClientRect();
    const width = Math.max(1, Math.floor(rect.width));
    const height = Math.max(1, Math.floor(rect.height));
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setSize(width, height, false);
  };

  private tick = () => {
    const now = performance.now();
    const dt = Math.min((now - this.lastFrameAt) / 1000, 0.04);
    this.lastFrameAt = now;
    if (this.status === "running") {
      this.updateRunning(dt);
    } else {
      this.updateIdle(dt);
    }
    this.updateEnvironmentTransition(dt);
    this.updateCamera(dt);
    this.renderer.render(this.scene, this.camera);
    this.frameId = window.requestAnimationFrame(this.tick);
  };

  private updateIdle = (dt: number) => {
    const scroll = 2.8 * dt;
    this.moveScenery(scroll);
    this.playerRoot.rotation.y = Math.sin(performance.now() * 0.0018) * 0.06;
    this.playerRoot.children.forEach((child, index) => {
      child.position.y = Math.sin(performance.now() * 0.004 + index) * 0.03;
    });
    this.updateParticles(dt);
    this.updateFloatingLabels(dt);
    this.updateShieldVisual();
  };

  private updateRunning = (dt: number) => {
    this.elapsed += dt;
    this.updateDifficulty(dt);
    this.updateEnvironment();
    this.updateMusic(dt);
    if (this.bossIntroTimer > 0) this.bossIntroTimer = Math.max(0, this.bossIntroTimer - dt);
    if (this.skillCooldown > 0) this.skillCooldown = Math.max(0, this.skillCooldown - dt);
    if (this.shakeTimer > 0) {
      this.shakeTimer = Math.max(0, this.shakeTimer - dt);
      if (this.shakeTimer === 0) this.shakeStrength = 0;
    }
    const scrollSpeed = this.bossActive ? 0 : 9.8 + Math.min(8.4, this.progressTime * 0.16);
    if (!this.bossActive) this.distance += scrollSpeed * dt;
    this.stats.score += (18 + this.elapsed * 0.7) * dt;
    this.updateHero(dt);
    this.updateInput(dt);
    if (scrollSpeed > 0) this.moveScenery(scrollSpeed * dt);
    this.updateShooting(dt);
    this.updateBullets(dt);
    this.updateSkillProjectiles(dt);
    this.updateBeams(dt);
    this.updateEnemyBullets(dt);
    if (this.status !== "running") return;
    this.updateBossTiming();
    this.updateEnemies(dt, scrollSpeed);
    if (this.status !== "running") return;
    this.updateGates(dt, scrollSpeed);
    this.updateSkillBeams(dt);
    this.updateParticles(dt);
    this.updateFloatingLabels(dt);
    this.updateShieldVisual();
    this.emitSnapshot();
  };

  private updateDifficulty = (dt: number) => {
    if (this.bossActive || this.bossWarning) return;
    const normalEnemies = this.enemies.filter((enemy) => !enemy.isBoss).length;
    const enemyPressure = clamp(normalEnemies / 18, 0, 1);
    this.progressTime += dt * (1 - enemyPressure * 0.42);

    const baseTarget = 1 + this.progressTime / 54 + this.bossCount * 0.42;
    const expectedPower = 380 * Math.pow(Math.max(1, baseTarget), 2.04);
    const powerRatio = this.estimatePlayerDps() / expectedPower;
    const adaptive =
      powerRatio < 0.78
        ? -clamp((0.78 - powerRatio) * 0.95, 0, 0.52)
        : powerRatio > 2.25
          ? clamp((powerRatio - 2.25) * 0.14, 0, 0.42)
          : 0;
    const targetDifficulty = clamp(baseTarget + adaptive, 1, 12);
    this.difficulty += (targetDifficulty - this.difficulty) * Math.min(1, dt * 0.82);
  };

  private updateHero = (dt: number) => {
    if (this.stats.heroTimer <= 0) return;
    this.stats.heroTimer = Math.max(0, this.stats.heroTimer - dt);
    if (this.stats.heroTimer === 0 && this.stats.heroHealth > 0) {
      this.stats.heroHealth = 0;
      this.notice = "英雄完成支援后离队";
      this.updateSquadModels();
    }
  };

  private updateInput = (dt: number) => {
    const left = this.keys.has("a") || this.keys.has("arrowleft");
    const right = this.keys.has("d") || this.keys.has("arrowright");
    if (left && !right) this.targetX -= 6.3 * dt;
    if (right && !left) this.targetX += 6.3 * dt;
    this.targetX = clamp(this.targetX, -PLAYER_LIMIT, PLAYER_LIMIT);
    this.playerX += (this.targetX - this.playerX) * Math.min(1, dt * 12);
    this.playerRoot.position.x = this.playerX;
    this.playerRoot.rotation.z = (this.targetX - this.playerX) * -0.08;
  };

  private updateCamera = (dt: number) => {
    const desiredX = this.playerX * 0.22;
    this.camera.position.x += (desiredX - this.camera.position.x) * Math.min(1, dt * 4.2);
    const shake = this.shakeTimer > 0 ? this.shakeStrength * (this.shakeTimer / Math.max(0.001, this.shakeTimer + dt)) : 0;
    const shakeX = shake > 0 ? (Math.random() - 0.5) * shake : 0;
    const shakeY = shake > 0 ? (Math.random() - 0.5) * shake * 0.35 : 0;
    this.camera.position.x = this.camera.position.x + shakeX;
    this.camera.position.y = 7.2 + shakeY;
    this.camera.lookAt(this.playerX * 0.18 + shakeX * 0.35, 1.05 + shakeY * 0.2, -12);
  };

  private moveScenery = (amount: number) => {
    for (const mark of this.roadMarks) {
      mark.position.z += amount;
      if (mark.position.z > WORLD_MAX_Z) mark.position.z = WORLD_MIN_Z;
    }
    for (const tree of this.trees) {
      tree.position.z += amount;
      if (tree.position.z > WORLD_MAX_Z) {
        tree.position.z = WORLD_MIN_Z - Math.random() * 16;
        tree.position.x = (tree.position.x < 0 ? -1 : 1) * (6.2 + Math.random() * 4.2);
        this.replaceSceneryObject(tree, this.environmentIndex);
      }
    }
  };

  private updateEnvironment = () => {
    if (this.bossActive || this.bossWarning) return;
    if (this.elapsed >= this.nextBossAt - BOSS_WARNING_TIME) return;
    if (this.environmentTransition) return;
    const nextIndex = Math.floor(this.progressTime / 58) % ENVIRONMENTS.length;
    if (nextIndex === this.environmentIndex) return;
    this.startEnvironmentTransition(nextIndex);
  };

  private applyEnvironment = (index: number, announce: boolean) => {
    const normalizedIndex = index % ENVIRONMENTS.length;
    const environment = ENVIRONMENTS[normalizedIndex] ?? ENVIRONMENTS[0];
    this.environmentIndex = normalizedIndex;
    this.environmentTransition = null;
    this.transitionOverlay.style.opacity = "0";
    this.applyEnvironmentColors(environment);
    this.replaceSceneryForEnvironment(normalizedIndex);
    if (announce && this.status === "running") {
      this.notice = environment.notice;
      this.playSfx("environment", 262 + this.environmentIndex * 80, 0.28, "sine", 0.2);
    }
  };

  private startEnvironmentTransition = (index: number) => {
    const fromIndex = this.environmentIndex;
    const toIndex = index % ENVIRONMENTS.length;
    const environment = ENVIRONMENTS[toIndex] ?? ENVIRONMENTS[0];
    this.environmentIndex = toIndex;
    this.environmentTransition = {
      fromIndex,
      toIndex,
      elapsed: 0,
      duration: 2.8,
      scenerySwapped: false,
    };
    this.transitionOverlay.style.background = environment.transition;
    this.notice = `${environment.notice}...`;
    this.playSfx("environment", 262 + toIndex * 80, 0.28, "sine", 0.2);
  };

  private updateEnvironmentTransition = (dt: number) => {
    if (!this.environmentTransition) return;
    const transition = this.environmentTransition;
    transition.elapsed += dt;
    const rawProgress = clamp(transition.elapsed / transition.duration, 0, 1);
    const progress = rawProgress * rawProgress * (3 - 2 * rawProgress);
    const from = ENVIRONMENTS[transition.fromIndex] ?? ENVIRONMENTS[0];
    const to = ENVIRONMENTS[transition.toIndex] ?? ENVIRONMENTS[0];
    this.applyBlendedEnvironmentColors(from, to, progress);
    this.transitionOverlay.style.background = to.transition;
    this.transitionOverlay.style.opacity = `${Math.sin(rawProgress * Math.PI) * 0.42}`;

    if (rawProgress >= 1) {
      this.applyEnvironmentColors(to);
      this.transitionOverlay.style.opacity = "0";
      this.environmentTransition = null;
    }
  };

  private applyEnvironmentColors = (environment: (typeof ENVIRONMENTS)[number]) => {
    this.scene.background = new THREE.Color(environment.sky);
    this.scene.fog = new THREE.Fog(environment.fog, environment.name === "夜城" ? 20 : 26, environment.name === "夜城" ? 62 : 72);
    this.grassMaterial?.color.set(environment.grass);
    this.roadMaterial?.color.set(environment.road);
    this.horizonMistMaterial?.color.set(environment.fog);
    this.roadMistMaterial?.color.set(environment.fog);
    if (this.horizonMistMaterial) this.horizonMistMaterial.opacity = environment.name === "夜城" ? 0.52 : 0.44;
    if (this.roadMistMaterial) this.roadMistMaterial.opacity = environment.name === "夜城" ? 0.3 : 0.24;
    this.curbMaterials.forEach((material) => material.color.set(environment.curb));
    this.scene.children.forEach((child) => {
      if (child.userData.envRole === "hemi") {
        const hemi = child as THREE.HemisphereLight;
        hemi.groundColor.set(environment.hemiGround);
        hemi.intensity = environment.name === "夜城" ? 1.72 : 2.1;
      }
    });
  };

  private applyBlendedEnvironmentColors = (
    from: (typeof ENVIRONMENTS)[number],
    to: (typeof ENVIRONMENTS)[number],
    progress: number,
  ) => {
    const sky = new THREE.Color(from.sky).lerp(new THREE.Color(to.sky), progress);
    const fog = new THREE.Color(from.fog).lerp(new THREE.Color(to.fog), progress);
    const grass = new THREE.Color(from.grass).lerp(new THREE.Color(to.grass), progress);
    const road = new THREE.Color(from.road).lerp(new THREE.Color(to.road), progress);
    const curb = new THREE.Color(from.curb).lerp(new THREE.Color(to.curb), progress);
    const hemiGround = new THREE.Color(from.hemiGround).lerp(new THREE.Color(to.hemiGround), progress);
    const fromFogNear = from.name === "夜城" ? 20 : 26;
    const fromFogFar = from.name === "夜城" ? 62 : 72;
    const toFogNear = to.name === "夜城" ? 20 : 26;
    const toFogFar = to.name === "夜城" ? 62 : 72;
    this.scene.background = sky;
    this.scene.fog = new THREE.Fog(
      fog,
      fromFogNear + (toFogNear - fromFogNear) * progress,
      fromFogFar + (toFogFar - fromFogFar) * progress,
    );
    this.grassMaterial?.color.copy(grass);
    this.roadMaterial?.color.copy(road);
    this.horizonMistMaterial?.color.copy(fog);
    this.roadMistMaterial?.color.copy(fog);
    if (this.horizonMistMaterial) {
      const fromOpacity = from.name === "夜城" ? 0.52 : 0.44;
      const toOpacity = to.name === "夜城" ? 0.52 : 0.44;
      this.horizonMistMaterial.opacity = fromOpacity + (toOpacity - fromOpacity) * progress;
    }
    if (this.roadMistMaterial) {
      const fromOpacity = from.name === "夜城" ? 0.3 : 0.24;
      const toOpacity = to.name === "夜城" ? 0.3 : 0.24;
      this.roadMistMaterial.opacity = fromOpacity + (toOpacity - fromOpacity) * progress;
    }
    this.curbMaterials.forEach((material) => material.color.copy(curb));
    this.scene.children.forEach((child) => {
      if (child.userData.envRole === "hemi") {
        const hemi = child as THREE.HemisphereLight;
        const fromIntensity = from.name === "夜城" ? 1.72 : 2.1;
        const toIntensity = to.name === "夜城" ? 1.72 : 2.1;
        hemi.groundColor.copy(hemiGround);
        hemi.intensity = fromIntensity + (toIntensity - fromIntensity) * progress;
      }
    });
  };

  private replaceSceneryForEnvironment = (index: number) => {
    for (const scenery of this.trees) {
      this.replaceSceneryObject(scenery, index);
    }
  };

  private replaceSceneryObject = (target: THREE.Group, index: number) => {
    const environment = ENVIRONMENTS[index % ENVIRONMENTS.length] ?? ENVIRONMENTS[0];
    while (target.children.length) {
      const child = target.children.pop();
      if (child) disposeObject(child);
    }
    const next = createEnvironmentScenery(environment.name);
    while (next.children.length) {
      target.add(next.children[0]);
    }
    target.rotation.y = Math.random() * Math.PI * 2;
  };

  private ensureAudio = async () => {
    if (this.audioSettings.musicVolume <= 0 && this.audioSettings.effectsVolume <= 0) return;
    if (!this.audioContext) {
      const AudioContextCtor = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextCtor) return;
      this.audioContext = new AudioContextCtor();
      this.musicGain = this.audioContext.createGain();
      this.effectsGain = this.audioContext.createGain();
      this.musicGain.gain.value = this.audioSettings.musicVolume;
      this.effectsGain.gain.value = this.audioSettings.effectsVolume;
      this.musicGain.connect(this.audioContext.destination);
      this.effectsGain.connect(this.audioContext.destination);
    }
    if (this.audioContext.state === "suspended") {
      await this.audioContext.resume();
    }
  };

  private playTone = (
    frequency: number,
    duration: number,
    type: OscillatorType,
    volume: number,
    destination: GainNode | undefined,
  ) => {
    if (!this.audioContext || !destination || volume <= 0) return;
    const now = this.audioContext.currentTime;
    const oscillator = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, volume), now + 0.018);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    oscillator.connect(gain);
    gain.connect(destination);
    oscillator.start(now);
    oscillator.stop(now + duration + 0.03);
  };

  private playNoise = (duration: number, volume: number, destination: GainNode | undefined) => {
    if (!this.audioContext || !destination || volume <= 0) return;
    const sampleRate = this.audioContext.sampleRate;
    const frameCount = Math.max(1, Math.floor(sampleRate * duration));
    const buffer = this.audioContext.createBuffer(1, frameCount, sampleRate);
    const data = buffer.getChannelData(0);
    for (let index = 0; index < frameCount; index += 1) {
      const decay = 1 - index / frameCount;
      data[index] = (Math.random() * 2 - 1) * decay * decay;
    }
    const source = this.audioContext.createBufferSource();
    const gain = this.audioContext.createGain();
    const now = this.audioContext.currentTime;
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    source.buffer = buffer;
    source.connect(gain);
    gain.connect(destination);
    source.start(now);
    source.stop(now + duration + 0.02);
  };

  private playSfx = (
    id: string,
    frequency: number,
    duration: number,
    type: OscillatorType = "square",
    volume = 0.18,
    cooldown = 0.08,
  ) => {
    if (this.audioSettings.effectsVolume <= 0) return;
    void this.ensureAudio();
    const now = performance.now() / 1000;
    const last = this.lastSfxAt.get(id) ?? 0;
    if (now - last < cooldown) return;
    this.lastSfxAt.set(id, now);
    this.playTone(frequency, duration, type, volume, this.effectsGain);
  };

  private updateMusic = (dt: number) => {
    if (this.audioSettings.musicVolume <= 0) return;
    void this.ensureAudio();
    this.musicStepTimer -= dt;
    if (this.musicStepTimer > 0) return;
    const bossShift = this.bossActive || this.bossWarning ? -36 : 0;
    const notes = this.bossActive ? [147, 165, 196, 220, 196, 165] : [196, 247, 294, 330, 392, 330, 294, 247];
    const note = notes[this.musicStep % notes.length] + bossShift;
    this.playTone(note, this.bossActive ? 0.18 : 0.13, "square", 0.048, this.musicGain);
    if (this.musicStep % 2 === 0) {
      this.playTone(note * 1.5, 0.08, "square", 0.028, this.musicGain);
    }
    if (this.musicStep % 4 === 0) {
      this.playTone(note / 2, 0.22, "triangle", 0.05, this.musicGain);
      this.playNoise(0.045, 0.018, this.musicGain);
    }
    if (this.musicStep % 8 === 6) {
      this.playNoise(0.065, 0.014, this.musicGain);
    }
    this.musicStep += 1;
    this.musicStepTimer = this.bossActive ? 0.24 : 0.3;
  };

  useActiveSkill = () => {
    if (this.status !== "running") return false;
    if (this.stats.activeSkill === "none") {
      this.notice = "尚未获得主动技能";
      this.emitSnapshot(true);
      return false;
    }
    if (this.stats.activeSkillCharges <= 0) {
      this.stats.activeSkill = "none";
      this.skillCooldown = 0;
      this.notice = "尚未获得主动技能";
      this.emitSnapshot(true);
      return false;
    }
    if (this.skillCooldown > 0) {
      this.notice = "主动技能冷却中";
      this.emitSnapshot(true);
      return false;
    }
    const skill = this.stats.activeSkill;
    this.stats.activeSkillCharges = Math.max(0, this.stats.activeSkillCharges - 1);
    if (this.stats.activeSkillCharges > 0) {
      this.skillCooldown = skill === "airstrike" ? 7.2 : skill === "laserBarrage" ? 8.8 : 6.8;
    } else {
      this.stats.activeSkill = "none";
      this.skillCooldown = 0;
    }
    if (skill === "airstrike") this.castAirstrike();
    if (skill === "laserBarrage") this.castLaserBarrage();
    if (skill === "cannonSweep") this.castCannonSweep();
    this.emitSnapshot(true);
    return true;
  };

  private getSkillTargets = (count: number) => {
    const enemies = [...this.enemies].filter((enemy) => enemy.group.position.z < PLAYER_Z - 1.2);
    if (!enemies.length) {
      return Array.from({ length: count }, (_, index) => ({
        x: -2.4 + (4.8 * index) / Math.max(1, count - 1),
        z: -24 - Math.random() * 22,
      }));
    }
    enemies.sort((left, right) => this.getSkillTargetPriority(right) - this.getSkillTargetPriority(left));
    const bossTarget = enemies.find((enemy) => enemy.isBoss);
    return Array.from({ length: count }, (_, index) => {
      const enemy =
        bossTarget && index % 2 === 0
          ? bossTarget
          : enemies[(index + (bossTarget ? 1 : 0)) % enemies.length] ?? bossTarget ?? enemies[0];
      return {
        x: clamp(enemy.group.position.x + (Math.random() - 0.5) * 1.2, -ENEMY_LIMIT, ENEMY_LIMIT),
        z: clamp(enemy.group.position.z + (Math.random() - 0.5) * 4.2, WORLD_MIN_Z + 8, PLAYER_Z - 3),
      };
    });
  };

  private getSkillTargetPriority = (enemy: Enemy) => {
    const zThreat = clamp((PLAYER_Z - enemy.group.position.z) / 35, 0, 1);
    return (enemy.isBoss ? 20000 : 0) + enemy.health + enemy.maxHealth * 0.35 + zThreat * 1800;
  };

  private getActiveSkillPower = () => {
    const dpsPower = this.estimatePlayerDps() * 1.05;
    const basePower = Math.max(this.stats.damage * 5.5, dpsPower);
    const difficultyBoost = 1 + Math.min(1.35, Math.max(0, this.difficulty - 1) * 0.16);
    const bossBoost = this.bossActive
      ? this.bossCount === 0
        ? 1.78
        : 2 + Math.min(0.65, this.bossCount * 0.1)
      : 1.28;
    return basePower * difficultyBoost * bossBoost;
  };

  private getBossSkillDamageFloor = (ratio: number) => {
    const boss = this.enemies.find((enemy) => enemy.isBoss);
    if (!boss || !this.bossActive) return 0;
    return boss.maxHealth * ratio;
  };

  private setSkillBossDamageBudget = (ratio: number) => {
    const boss = this.enemies.find((enemy) => enemy.isBoss);
    this.skillBossDamageUsed = 0;
    this.skillBossDamageBudget = boss && this.bossActive ? boss.maxHealth * ratio : Number.POSITIVE_INFINITY;
  };

  private castAirstrike = () => {
    this.notice = "主动技能：炸弹空袭";
    const skillPower = this.getActiveSkillPower();
    this.setSkillBossDamageBudget(0.34);
    this.triggerScreenShake(1.8, 0.34);
    this.playSfx("skill-airstrike", 82, 0.55, "sawtooth", 0.34, 0.5);
    this.getSkillTargets(9).forEach((target, index) => {
      const bomb = new THREE.Mesh(
        new THREE.SphereGeometry(0.32, 12, 8),
        new THREE.MeshStandardMaterial({
          color: 0xfacc15,
          emissive: 0xf97316,
          emissiveIntensity: 0.9,
          roughness: 0.35,
        }),
      );
      bomb.position.set(target.x + (Math.random() - 0.5) * 0.8, 6.8 + index * 0.12, target.z - 2.4);
      bomb.castShadow = true;
      bomb.visible = index === 0;
      this.scene.add(bomb);
      this.skillProjectiles.push({
        mesh: bomb,
        velocity: new THREE.Vector3(0, -8.8 - index * 0.18, 1.15),
        damage: Math.max(skillPower * 4.8, this.getBossSkillDamageFloor(0.018)),
        radius: 3.45,
        color: 0xf97316,
        kind: "airstrike",
        delay: index * 0.13,
      });
    });
  };

  private castLaserBarrage = () => {
    this.notice = "主动技能：激光轰炸";
    const skillPower = this.getActiveSkillPower();
    this.setSkillBossDamageBudget(0.38);
    this.triggerScreenShake(4.2, 0.24);
    this.playSfx("skill-laser", 740, 0.72, "square", 0.28, 0.4);
    const target = this.getSkillTargets(1)[0] ?? { x: this.playerX, z: PLAYER_Z - 18 };
    const group = new THREE.Group();
    group.position.set(target.x, 0, target.z);

    const beamGlow = new THREE.Mesh(
      new THREE.CylinderGeometry(0.64, 0.94, 8.4, 16),
      new THREE.MeshBasicMaterial({
        color: 0x7dd3fc,
        transparent: true,
        opacity: 0.22,
        depthWrite: false,
      }),
    );
    beamGlow.position.y = 3.72;
    beamGlow.renderOrder = 7;

    const beamCore = new THREE.Mesh(
      new THREE.CylinderGeometry(0.27, 0.4, 8.8, 16),
      new THREE.MeshBasicMaterial({
        color: 0xc084fc,
        transparent: true,
        opacity: 0.74,
        depthWrite: false,
      }),
    );
    beamCore.position.y = 3.92;
    beamCore.renderOrder = 8;

    const groundMarker = new THREE.Mesh(
      new THREE.CircleGeometry(2.05, 28),
      new THREE.MeshBasicMaterial({
        color: 0xc084fc,
        transparent: true,
        opacity: 0.24,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    );
    groundMarker.rotation.x = -Math.PI / 2;
    groundMarker.position.y = 0.08;
    groundMarker.renderOrder = 7;

    group.add(beamGlow, beamCore, groundMarker);
    this.scene.add(group);
    this.skillBeams.push({
      group,
      life: 5.2,
      maxLife: 5.2,
      tickTimer: 0,
      damagePerTick: Math.max(skillPower * 0.72, this.getBossSkillDamageFloor(0.0032)),
      radius: 2.4,
      color: 0xc084fc,
    });
  };

  private castCannonSweep = () => {
    this.notice = "主动技能：机炮扫射";
    const skillPower = this.getActiveSkillPower();
    this.setSkillBossDamageBudget(0.3);
    this.triggerScreenShake(2.9, 0.27);
    this.playSfx("skill-cannon", 220, 0.36, "square", 0.24, 0.4);
    for (let index = 0; index < 54; index += 1) {
      const row = Math.floor(index / 6);
      const lane = -2.9 + (5.8 * (index % 6)) / 5;
      const x = lane + (Math.random() - 0.5) * 0.28;
      const z = PLAYER_Z - 2.6 - row * 1.15;
      const slug = new THREE.Mesh(
        new THREE.BoxGeometry(0.13, 0.22, 0.82),
        new THREE.MeshStandardMaterial({
          color: 0x7dd3fc,
          emissive: 0x38bdf8,
          emissiveIntensity: 0.95,
          roughness: 0.28,
        }),
      );
      slug.position.set(x, 5.4 + (index % 3) * 0.22, z);
      slug.rotation.x = -0.95;
      slug.visible = index < 6;
      this.scene.add(slug);
      this.skillProjectiles.push({
        mesh: slug,
        velocity: new THREE.Vector3((Math.random() - 0.5) * 0.42, -5.65, -12.5 - row * 1.2 - Math.random() * 3.8),
        damage: Math.max(skillPower * 0.95, this.getBossSkillDamageFloor(0.0045)),
        radius: 1.25,
        color: 0x38bdf8,
        kind: "cannonSweep",
        delay: index * 0.04,
      });
    }
  };

  private updateSkillBeams = (dt: number) => {
    for (let index = this.skillBeams.length - 1; index >= 0; index -= 1) {
      const beam = this.skillBeams[index];
      beam.life -= dt;
      const target = this.getBestSkillTarget();
      if (target) {
        beam.group.position.x += (target.group.position.x - beam.group.position.x) * Math.min(1, dt * 7.5);
        beam.group.position.z += (target.group.position.z - beam.group.position.z) * Math.min(1, dt * 7.5);
      } else {
        beam.group.position.x += (this.playerX - beam.group.position.x) * Math.min(1, dt * 3.5);
        beam.group.position.z = clamp(beam.group.position.z - dt * 7.5, WORLD_MIN_Z + 8, PLAYER_Z - 4);
      }

      beam.group.rotation.y += dt * 2.6;
      const ratio = clamp(beam.life / beam.maxLife, 0, 1);
      beam.group.scale.setScalar(0.92 + Math.sin(this.elapsed * 18) * 0.035);
      beam.group.children.forEach((child, childIndex) => {
        const object = child as THREE.Object3D & { material?: THREE.MeshBasicMaterial };
        if (object.material) object.material.opacity = clamp(ratio * (childIndex === 2 ? 0.3 : 0.72), 0, 0.78);
      });

      beam.tickTimer -= dt;
      if (beam.tickTimer <= 0 && beam.life > 0) {
        beam.tickTimer += 0.1;
        this.applyAreaDamage(beam.group.position.x, beam.group.position.z, beam.radius, beam.damagePerTick, beam.color);
        this.spawnHit(beam.group.position.x, beam.group.position.z, beam.color);
        this.triggerScreenShake(0.16, 0.05);
      }

      if (beam.life <= 0) {
        this.spawnExplosion(beam.group.position.x, beam.group.position.z, 1.05, beam.color);
        this.scene.remove(beam.group);
        disposeObject(beam.group);
        this.skillBeams.splice(index, 1);
      }
    }
  };

  private getBestSkillTarget = () => {
    let best: Enemy | null = null;
    let bestScore = Number.POSITIVE_INFINITY;
    for (const enemy of this.enemies) {
      if (enemy.group.position.z > PLAYER_Z - 1.2) continue;
      const distanceZ = Math.abs(enemy.group.position.z - PLAYER_Z);
      const distanceX = Math.abs(enemy.group.position.x - this.playerX);
      const score = distanceZ * 0.55 + distanceX * 2.2 + (enemy.isBoss ? -35 : 0);
      if (score < bestScore) {
        bestScore = score;
        best = enemy;
      }
    }
    return best;
  };

  private updateSkillProjectiles = (dt: number) => {
    for (let index = this.skillProjectiles.length - 1; index >= 0; index -= 1) {
      const projectile = this.skillProjectiles[index];
      if ((projectile.delay ?? 0) > 0) {
        projectile.delay = Math.max(0, (projectile.delay ?? 0) - dt);
        projectile.mesh.visible = projectile.delay <= 0;
        continue;
      }
      projectile.mesh.position.addScaledVector(projectile.velocity, dt);
      projectile.mesh.rotation.x += dt * (projectile.kind === "cannonSweep" ? 12 : 7);
      projectile.mesh.rotation.z += dt * 3;
      if (projectile.mesh.position.z < WORLD_MIN_Z + 4) {
        this.scene.remove(projectile.mesh);
        disposeObject(projectile.mesh);
        this.skillProjectiles.splice(index, 1);
        continue;
      }
      if (projectile.mesh.position.y > 0.28) continue;
      this.applyAreaDamage(
        projectile.mesh.position.x,
        projectile.mesh.position.z,
        projectile.radius,
        projectile.damage,
        projectile.color,
      );
      this.triggerScreenShake(projectile.kind === "cannonSweep" ? 0.12 : 0.2, projectile.kind === "cannonSweep" ? 0.045 : 0.09);
      this.spawnExplosion(projectile.mesh.position.x, projectile.mesh.position.z, projectile.radius, projectile.color);
      this.scene.remove(projectile.mesh);
      disposeObject(projectile.mesh);
      this.skillProjectiles.splice(index, 1);
    }
  };

  private applyAreaDamage = (x: number, z: number, radius: number, damage: number, color: THREE.ColorRepresentation) => {
    const radiusSq = radius * radius;
    for (const enemy of this.enemies) {
      if (enemy.isBoss && this.bossIntroTimer > 0) continue;
      const dx = enemy.group.position.x - x;
      const dz = enemy.group.position.z - z;
      const distanceSq = dx * dx + dz * dz;
      if (distanceSq > radiusSq) continue;
      const falloff = clamp(1 - Math.sqrt(distanceSq) / radius, 0.35, 1);
      let appliedDamage = damage * falloff;
      if (enemy.isBoss && Number.isFinite(this.skillBossDamageBudget)) {
        const remainingBudget = Math.max(0, this.skillBossDamageBudget - this.skillBossDamageUsed);
        if (remainingBudget <= 0) continue;
        appliedDamage = Math.min(appliedDamage, remainingBudget);
        this.skillBossDamageUsed += appliedDamage;
      }
      enemy.health -= appliedDamage;
      this.spawnHit(enemy.group.position.x, enemy.group.position.z, color);
      this.updateEnemyHealthBar(enemy);
    }
    this.defeatDeadEnemies();
  };

  private triggerScreenShake = (duration: number, strength: number) => {
    this.shakeTimer = Math.max(this.shakeTimer, duration);
    this.shakeStrength = Math.max(this.shakeStrength, strength);
  };

  private getEffectiveBaseVolley = () => {
    const squadBonus = Math.floor(Math.min(this.stats.squadCount, 120) / 4);
    const rawVolley = Math.max(1, this.stats.multishot + squadBonus);
    return rawVolley <= 24 ? rawVolley : 24 + Math.sqrt(rawVolley - 24) * 3.2;
  };

  private getWeaponVolleyCap = (weapon: WeaponType) => {
    if (weapon === "rocket" || weapon === "missile") return 18;
    if (weapon === "spread") return 42;
    if (weapon === "laser") return 12;
    return 36;
  };

  private updateShooting = (dt: number) => {
    this.shootTimer -= dt;
    const baseInterval = this.stats.weapon === "laser" ? 0.68 : this.stats.weapon === "missile" ? 0.58 : 0.48;
    const interval = clamp(baseInterval / this.stats.fireRate, this.stats.weapon === "laser" ? 0.18 : 0.11, 0.86);
    if (this.shootTimer > 0) return;
    this.shootTimer += interval;
    this.spawnBullets();
  };

  private spawnBullets = () => {
    if (this.stats.squadCount <= 0) return;
    const weapon = this.stats.weapon;
    const baseVolley = Math.round(clamp(this.getEffectiveBaseVolley(), 1, this.getWeaponVolleyCap(weapon)));
    const heroActive = this.stats.heroTimer > 0 && this.stats.heroHealth > 0;
    if (weapon === "laser") {
      const beamCount = clamp(Math.ceil(baseVolley / 2), 1, this.getWeaponVolleyCap("laser"));
      const span = Math.min(2.8, 0.56 * (beamCount - 1));
      for (let index = 0; index < beamCount; index += 1) {
        const offset = beamCount === 1 ? 0 : -span / 2 + (span * index) / (beamCount - 1);
        this.spawnPlayerLaser(this.playerX + offset, this.stats.damage * 1.08, 0.18);
      }
      if (heroActive) {
        this.spawnHeroAutoShots();
      }
      this.playSfx("laser", 660, 0.07, "sawtooth", 0.09, 0.16);
      return;
    }

    const volley =
      weapon === "rocket" || weapon === "missile"
        ? clamp(Math.ceil(baseVolley / 2), 1, this.getWeaponVolleyCap(weapon))
        : weapon === "spread"
          ? clamp(baseVolley + 2, 3, this.getWeaponVolleyCap(weapon))
          : clamp(baseVolley, 1, this.getWeaponVolleyCap(weapon));
    const span = Math.min(weapon === "spread" ? 4.2 : 3.25, (weapon === "spread" ? 0.42 : 0.34) * (volley - 1));
    const speed =
      weapon === "rocket"
        ? 23 + this.stats.fireRate * 2.2
        : weapon === "missile"
          ? 21 + this.stats.fireRate * 2.1
          : 28 + this.stats.fireRate * 3.5;

    for (let index = 0; index < volley; index += 1) {
      const offset = volley === 1 ? 0 : -span / 2 + (span * index) / (volley - 1);
      const bullet = createPlayerBulletMesh(weapon);
      if (weapon === "missile") bullet.rotation.x = -Math.PI / 2;
      bullet.position.set(this.playerX + offset, 0.76, PLAYER_Z - 1.05);
      bullet.castShadow = true;
      this.scene.add(bullet);
      this.bullets.push({
        mesh: bullet,
        velocityX: weapon === "spread" ? offset * 1.45 : weapon === "rocket" ? offset * 0.35 : weapon === "missile" ? offset * 0.24 : 0,
        velocityZ: speed,
        damage:
          this.stats.damage *
          (weapon === "rocket" ? 1.38 : weapon === "missile" ? 1.2 : weapon === "spread" ? 0.72 : 1),
        radius: weapon === "rocket" ? 0.38 : weapon === "missile" ? 0.32 : weapon === "spread" ? 0.2 : 0.18,
        pierce: 0,
        splashRadius: weapon === "rocket" ? 1.05 : weapon === "missile" ? 0.8 : 0,
        weapon,
      });
    }

    if (heroActive) {
      this.spawnHeroAutoShots();
    }
    this.playSfx(
      "shoot",
      weapon === "rocket" ? 150 : weapon === "missile" ? 210 : weapon === "spread" ? 330 : 440,
      weapon === "rocket" || weapon === "missile" ? 0.08 : 0.045,
      weapon === "spread" ? "square" : "triangle",
      weapon === "rocket" || weapon === "missile" ? 0.12 : 0.07,
      0.09,
    );
  };

  private spawnHeroAutoShots = () => {
    const heroWeapon = this.getHeroWeapon();
    const targets = this.getHeroTargets(heroWeapon === "spread" ? 3 : 2);
    if (!targets.length) {
      if (heroWeapon === "laser") {
        this.spawnPlayerLaser(this.playerX - 0.36, this.stats.damage * 0.82, 0.13, this.getHeroShotColor());
        this.spawnPlayerLaser(this.playerX + 0.36, this.stats.damage * 0.82, 0.13, this.getHeroShotColor());
        return;
      }
      this.spawnHeroWeaponProjectile(null, heroWeapon, -0.36, 1);
      this.spawnHeroWeaponProjectile(null, heroWeapon, 0.36, 1);
      return;
    }

    targets.forEach((target, index) => {
      if (heroWeapon === "laser") {
        this.spawnPlayerLaser(target.group.position.x, this.stats.damage * 0.9, 0.14, this.getHeroShotColor());
        return;
      }
      const startOffset = index % 2 === 0 ? -0.36 : 0.36;
      if (heroWeapon === "spread") {
        [-0.34, 0, 0.34].forEach((spreadOffset) => {
          this.spawnHeroWeaponProjectile(target, heroWeapon, startOffset, 0.68, spreadOffset);
        });
        return;
      }
      this.spawnHeroWeaponProjectile(target, heroWeapon, startOffset, heroWeapon === "rocket" ? 1.28 : 1.08);
    });
  };

  private getHeroWeapon = (): WeaponType => (this.stats.weapon === "missile" ? "rifle" : this.stats.weapon);

  private getHeroShotColor = () => {
    if (this.stats.heroType === "gunner") return 0xfb923c;
    if (this.stats.heroType === "sniper") return 0x7dd3fc;
    return 0x22c55e;
  };

  private spawnHeroWeaponProjectile = (
    target: Enemy | null,
    weapon: WeaponType,
    startOffset: number,
    damageMultiplier: number,
    aimOffset = 0,
  ) => {
    const bullet = createPlayerBulletMesh(weapon, this.getHeroShotColor());
    if (weapon === "missile") bullet.rotation.x = -Math.PI / 2;
    bullet.position.set(this.playerX + startOffset, 1.24, PLAYER_Z - 1.05);
    bullet.castShadow = true;
    this.scene.add(bullet);

    const targetX = target ? target.group.position.x + aimOffset : this.playerX + startOffset * 2.2 + aimOffset;
    const distanceZ = target ? Math.max(4, bullet.position.z - target.group.position.z) : 22;
    const speed =
      weapon === "rocket"
        ? 24 + this.stats.fireRate * 2.1
        : weapon === "missile"
          ? 22 + this.stats.fireRate * 2.1
          : 30 + this.stats.fireRate * 3.1;
    const travelTime = distanceZ / speed;
    const velocityX = clamp((targetX - bullet.position.x) / Math.max(0.18, travelTime), -8.5, 8.5);

    this.bullets.push({
      mesh: bullet,
      velocityX,
      velocityZ: speed,
      damage:
        this.stats.damage *
        damageMultiplier *
        (weapon === "rocket" ? 1.36 : weapon === "missile" ? 1.18 : weapon === "spread" ? 0.72 : 1),
      radius: weapon === "rocket" ? 0.38 : weapon === "missile" ? 0.32 : weapon === "spread" ? 0.2 : 0.18,
      pierce: 0,
      splashRadius: weapon === "rocket" ? 1.05 : weapon === "missile" ? 0.8 : 0,
      weapon,
    });
  };

  private getHeroTargets = (count: number) => {
    return [...this.enemies]
      .filter((enemy) => enemy.group.position.z < PLAYER_Z - 1.3)
      .sort((a, b) => {
        const priorityA = (a.isBoss ? -18 : 0) + Math.abs(a.group.position.x - this.playerX) + Math.abs(a.group.position.z - PLAYER_Z) * 0.05;
        const priorityB = (b.isBoss ? -18 : 0) + Math.abs(b.group.position.x - this.playerX) + Math.abs(b.group.position.z - PLAYER_Z) * 0.05;
        return priorityA - priorityB;
      })
      .slice(0, count);
  };

  private spawnBeam = (
    x: number,
    zMin: number,
    zMax: number,
    width: number,
    color: THREE.ColorRepresentation,
    hostile: boolean,
    damage: number,
  ) => {
    const length = Math.max(0.1, zMax - zMin);
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(width, 0.08, length),
      new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: hostile ? 0.44 : 0.62,
        depthWrite: false,
      }),
    );
    mesh.position.set(x, hostile ? 1.05 : 0.86, zMin + length / 2);
    this.scene.add(mesh);
    this.beams.push({
      mesh,
      life: hostile ? 0.18 : 0.13,
      maxLife: hostile ? 0.18 : 0.13,
      damage,
      x,
      zMin,
      zMax,
      width,
      hostile,
    });
  };

  private spawnPlayerLaser = (x: number, baseDamage: number, width: number, color: THREE.ColorRepresentation = 0xc084fc) => {
    const beamX = clamp(x, -ENEMY_LIMIT, ENEMY_LIMIT);
    this.spawnBeam(beamX, WORLD_MIN_Z + 5, PLAYER_Z - 0.9, width, color, false, baseDamage);
    for (const enemy of this.enemies) {
      const enemyZ = enemy.group.position.z;
      if (enemyZ < WORLD_MIN_Z + 5 || enemyZ > PLAYER_Z - 0.9) continue;
      if (Math.abs(enemy.group.position.x - beamX) > enemy.radius + width * 1.5) continue;
      if (enemy.isBoss && this.bossIntroTimer > 0) {
        this.spawnHit(enemy.group.position.x, enemy.group.position.z, 0x93c5fd);
        continue;
      }
      const isCritical = Math.random() < this.stats.critChance;
      const damage = baseDamage * (isCritical ? this.stats.critDamage : 1);
      enemy.health -= damage;
      this.spawnHit(enemy.group.position.x, enemy.group.position.z, isCritical ? 0xffdf57 : color);
      if (isCritical) this.spawnFloatingLabel("暴击", "#ffcf4d", enemy.group.position.x, enemy.group.position.z);
      this.updateEnemyHealthBar(enemy);
    }
    this.defeatDeadEnemies();
  };

  private updateBeams = (dt: number) => {
    for (let index = this.beams.length - 1; index >= 0; index -= 1) {
      const beam = this.beams[index];
      beam.life -= dt;
      const material = beam.mesh.material as THREE.MeshBasicMaterial;
      material.opacity = clamp((beam.life / beam.maxLife) * (beam.hostile ? 0.44 : 0.62), 0, 0.7);
      if (beam.life <= 0) {
        const [removed] = this.beams.splice(index, 1);
        this.scene.remove(removed.mesh);
        disposeObject(removed.mesh);
      }
    }
  };

  private updateBullets = (dt: number) => {
    for (let bulletIndex = this.bullets.length - 1; bulletIndex >= 0; bulletIndex -= 1) {
      const bullet = this.bullets[bulletIndex];
      if (bullet.weapon === "missile") {
        const target = this.findMissileTarget(bullet);
        if (target) {
          const desiredX = clamp((target.group.position.x - bullet.mesh.position.x) * 3.2, -7.5, 7.5);
          bullet.velocityX += (desiredX - bullet.velocityX) * Math.min(1, dt * 4.5);
          bullet.mesh.rotation.z = -bullet.velocityX * 0.08;
        }
      }
      bullet.mesh.position.x += bullet.velocityX * dt;
      bullet.mesh.position.z -= bullet.velocityZ * dt;
      if (bullet.weapon !== "missile") bullet.mesh.rotation.x += dt * 12;
      if (bullet.weapon === "rocket") bullet.mesh.scale.setScalar(1 + Math.sin(this.elapsed * 24) * 0.08);
      if (bullet.mesh.position.z < WORLD_MIN_Z - 8 || Math.abs(bullet.mesh.position.x) > ROAD_HALF_WIDTH + 2) {
        this.removeBullet(bulletIndex);
        continue;
      }

      let shouldRemove = false;
      for (let enemyIndex = this.enemies.length - 1; enemyIndex >= 0; enemyIndex -= 1) {
        const enemy = this.enemies[enemyIndex];
        const dx = bullet.mesh.position.x - enemy.group.position.x;
        const dz = bullet.mesh.position.z - enemy.group.position.z;
        const hitRadius = enemy.radius + bullet.radius;
        if (dx * dx + dz * dz > hitRadius * hitRadius) continue;
        if (enemy.isBoss && this.bossIntroTimer > 0) {
          this.spawnHit(enemy.group.position.x, enemy.group.position.z, 0x93c5fd);
          shouldRemove = true;
          break;
        }
        const isCritical = Math.random() < this.stats.critChance;
        const damage = bullet.damage * (isCritical ? this.stats.critDamage : 1);
        enemy.health -= damage;
        const hitColor =
          bullet.weapon === "rocket" ? 0xfb923c : isCritical ? 0xffdf57 : bullet.weapon === "laser" ? 0xc084fc : 0xfff177;
        this.spawnHit(enemy.group.position.x, enemy.group.position.z, hitColor);
        if (isCritical) {
          this.spawnFloatingLabel("暴击", "#ffcf4d", enemy.group.position.x, enemy.group.position.z);
        }
        this.updateEnemyHealthBar(enemy);
        if (bullet.splashRadius > 0) {
          this.spawnExplosion(
            enemy.group.position.x,
            enemy.group.position.z,
            bullet.splashRadius,
            bullet.weapon === "missile" ? 0xfacc15 : 0xfb923c,
          );
          this.applySplashDamage(
            enemy.group.position.x,
            enemy.group.position.z,
            damage * 0.58,
            bullet.splashRadius,
            enemy,
          );
        }
        bullet.pierce -= 1;
        shouldRemove = bullet.pierce < 0;
        this.defeatDeadEnemies();
        if (shouldRemove) break;
      }

      if (shouldRemove) {
        this.removeBullet(bulletIndex);
      }
    }
  };

  private findMissileTarget = (bullet: Bullet) => {
    let best: Enemy | null = null;
    let bestScore = Number.POSITIVE_INFINITY;
    for (const enemy of this.enemies) {
      const dz = bullet.mesh.position.z - enemy.group.position.z;
      if (dz < -1 || dz > 42) continue;
      const dx = Math.abs(bullet.mesh.position.x - enemy.group.position.x);
      const score = dx * 2.2 + dz * 0.12;
      if (score < bestScore) {
        bestScore = score;
        best = enemy;
      }
    }
    return best;
  };

  private applySplashDamage = (x: number, z: number, damage: number, radius: number, directHit: Enemy) => {
    const radiusSq = radius * radius;
    for (const enemy of this.enemies) {
      if (enemy === directHit) continue;
      const dx = enemy.group.position.x - x;
      const dz = enemy.group.position.z - z;
      const distanceSq = dx * dx + dz * dz;
      if (distanceSq > radiusSq) continue;
      const falloff = clamp(1 - Math.sqrt(distanceSq) / radius, 0.3, 0.86);
      enemy.health -= damage * falloff;
      this.spawnHit(enemy.group.position.x, enemy.group.position.z, 0xfb923c);
      this.updateEnemyHealthBar(enemy);
    }
  };

  private defeatDeadEnemies = () => {
    for (let enemyIndex = this.enemies.length - 1; enemyIndex >= 0; enemyIndex -= 1) {
      if (this.enemies[enemyIndex]?.health <= 0) {
        this.defeatEnemy(enemyIndex);
      }
    }
  };

  private updateEnemies = (dt: number, scrollSpeed: number) => {
    const canSpawnNormal = !this.bossActive && !this.bossWarning;
    if (canSpawnNormal) {
      this.enemySpawnTimer -= dt;
    }
    if (canSpawnNormal && this.enemySpawnTimer <= 0) {
      const normalEnemies = this.enemies.filter((enemy) => !enemy.isBoss).length;
      const aliveCap = clamp(11 + Math.floor(this.difficulty * 4.2), 12, 32);
      if (normalEnemies < aliveCap) {
        let spawnCount = 1;
        if (this.difficulty > 1.55 && Math.random() < 0.28 + this.difficulty * 0.035) spawnCount += 1;
        if (this.difficulty > 2.55 && Math.random() < 0.16 + this.difficulty * 0.025) spawnCount += 1;
        if (this.difficulty > 4.2 && Math.random() < 0.16) spawnCount += 1;
        for (let count = 0; count < spawnCount && normalEnemies + count < aliveCap; count += 1) {
          this.spawnEnemy();
        }
      }
      const baseInterval = clamp(1.42 - this.difficulty * 0.18, 0.34, 1.22);
      this.enemySpawnTimer = baseInterval + Math.random() * clamp(0.58 / this.difficulty, 0.12, 0.44);
    }

    for (let index = this.enemies.length - 1; index >= 0; index -= 1) {
      const enemy = this.enemies[index];
      if (enemy.isBoss) {
        enemy.group.position.z += (BOSS_Z + Math.sin(this.elapsed * 0.9) * 0.45 - enemy.group.position.z) * Math.min(1, dt * 2.6);
        const bossAmplitude = this.bossCount === 0 ? 1.15 : 2.1;
        const bossRate = this.bossCount === 0 ? 0.38 : 0.65;
        enemy.laneX = Math.sin(this.elapsed * bossRate + enemy.wobble) * bossAmplitude;
        enemy.group.position.x = clamp(enemy.laneX, -ENEMY_LIMIT, ENEMY_LIMIT);
        this.updateBossSummons(enemy, dt);
      } else if (enemy.behavior === "shooter" || enemy.behavior === "summon") {
        const hasReachedHold = enemy.group.position.z >= enemy.holdZ;
        if (hasReachedHold && enemy.holdTimer > 0) {
          enemy.holdTimer -= dt;
          enemy.group.position.z += (enemy.holdZ - enemy.group.position.z) * Math.min(1, dt * 4);
          const wiggle = enemy.behavior === "summon" ? 1.35 : 0.82;
          enemy.group.position.x = clamp(
            enemy.laneX + Math.sin(this.elapsed * 2.15 + enemy.wobble) * wiggle,
            -ENEMY_LIMIT,
            ENEMY_LIMIT,
          );
        } else {
          enemy.group.position.z += (scrollSpeed + enemy.speed * 0.85) * dt;
          enemy.group.position.x = clamp(
            enemy.laneX + Math.sin(this.elapsed * 2 + enemy.wobble) * 0.42,
            -ENEMY_LIMIT,
            ENEMY_LIMIT,
          );
        }
      } else {
        enemy.group.position.z += (scrollSpeed + enemy.speed) * dt;
        const wiggle = Math.min(0.68, 0.18 + this.difficulty * 0.035);
        enemy.group.position.x = clamp(
          enemy.laneX + Math.sin(this.elapsed * 1.7 + enemy.wobble) * wiggle,
          -ENEMY_LIMIT,
          ENEMY_LIMIT,
        );
      }
      enemy.group.rotation.y = Math.sin(this.elapsed * 3 + enemy.wobble) * 0.08;
      this.updateEnemyShooting(enemy, dt);

      if (!enemy.isBoss && enemy.group.position.z > PLAYER_Z + 0.9) {
        this.applyLeakPenalty(enemy);
        this.removeEnemy(index);
      }
    }
  };

  private updateBossSummons = (boss: Enemy, dt: number) => {
    this.bossSummonTimer -= dt;
    if (this.bossSummonTimer > 0) return;
    const summonCount = this.enemies.filter((enemy) => enemy.behavior === "summon" && !enemy.isBoss).length;
    const cap = this.bossCount === 0 ? 1 : 3 + Math.min(5, this.bossCount * 2);
    if (summonCount < cap) {
      const amount = this.bossCount >= 2 && Math.random() < 0.45 ? 2 : 1;
      for (let index = 0; index < amount && summonCount + index < cap; index += 1) {
        this.spawnBossSummon(boss, index);
      }
      this.notice = "Boss 召唤支援单位";
    }
    this.bossSummonTimer = this.bossCount === 0
      ? 7.8 + Math.random() * 1.2
      : Math.max(2.6, 6.4 - this.bossCount * 0.46 - this.difficulty * 0.22);
  };

  private spawnBossSummon = (boss: Enemy, index: number) => {
    const lane = clamp(boss.group.position.x + (index === 0 ? -1.2 : 1.2) + (Math.random() - 0.5) * 1.2, -ENEMY_LIMIT, ENEMY_LIMIT);
    const summon = this.createEnemy(BOSS_SUMMON_TYPE, { laneX: lane });
    summon.group.position.set(lane, 0, BOSS_Z + 4 + Math.random() * 3);
    summon.holdZ = clamp(BOSS_Z + 8 + Math.random() * 4, WORLD_MIN_Z + 12, PLAYER_Z - 5);
    summon.weapon = this.bossCount === 0 ? "rifle" : Math.random() < 0.28 + this.bossCount * 0.05 ? "spread" : "rifle";
    summon.shootInterval = this.bossCount === 0 ? 1.28 : Math.max(0.72, summon.shootInterval - this.bossCount * 0.05);
    if (this.bossCount === 0) {
      summon.health = Math.max(1, Math.round(summon.health * 0.64));
      summon.maxHealth = summon.health;
      this.updateEnemyHealthBar(summon);
    }
    this.scene.add(summon.group);
    this.enemies.push(summon);
  };

  private spawnEnemy = () => {
    const type = this.pickEnemyType();
    const lanes = this.progressTime < 18 ? [-0.9, 0, 0.9] : [-3, -1.5, 0, 1.5, 3];
    const lane = lanes[Math.floor(Math.random() * lanes.length)];
    const laneX = clamp(lane + (Math.random() - 0.5) * 0.38, -ENEMY_LIMIT, ENEMY_LIMIT);
    const enemy = this.createEnemy(type, { laneX });
    enemy.group.position.set(laneX, 0, WORLD_MIN_Z);
    this.scene.add(enemy.group);
    this.enemies.push(enemy);
  };

  private pickEnemyType = () => {
    const pool: { type: EnemyType; weight: number }[] = [
      { type: ENEMY_TYPES[0], weight: 4.2 },
      { type: ENEMY_TYPES[1], weight: this.progressTime > 14 ? 3.6 : 1.4 },
    ];
    if (this.progressTime > 18 || this.difficulty > 1.35) pool.push({ type: ENEMY_TYPES[2], weight: 2.1 + this.difficulty * 0.16 });
    if (this.progressTime > 30 || this.difficulty > 1.65) pool.push({ type: ENEMY_TYPES[4], weight: 1.45 });
    if (this.progressTime > 38 || this.difficulty > 1.95) pool.push({ type: ENEMY_TYPES[3], weight: 1.3 + this.difficulty * 0.12 });
    if (this.progressTime > 55 || this.difficulty > 2.45) pool.push({ type: ENEMY_TYPES[5], weight: 1.05 + this.difficulty * 0.1 });
    if (this.progressTime > 70 || this.difficulty > 2.85) pool.push({ type: ENEMY_TYPES[6], weight: 0.86 + this.difficulty * 0.08 });
    if (this.progressTime > 86 || this.difficulty > 3.25) pool.push({ type: ENEMY_TYPES[7], weight: 0.78 + this.difficulty * 0.1 });

    const total = pool.reduce((sum, item) => sum + item.weight, 0);
    let roll = Math.random() * total;
    for (const item of pool) {
      roll -= item.weight;
      if (roll <= 0) return item.type;
    }
    return pool[0].type;
  };

  private estimatePlayerDps = () => {
    const weapon = this.stats.weapon;
    const baseInterval = weapon === "laser" ? 0.68 : weapon === "missile" ? 0.58 : 0.48;
    const interval = clamp(baseInterval / this.stats.fireRate, weapon === "laser" ? 0.18 : 0.11, 0.86);
    const baseVolley = Math.round(clamp(this.getEffectiveBaseVolley(), 1, this.getWeaponVolleyCap(weapon)));
    const volley =
      weapon === "laser"
        ? clamp(Math.ceil(baseVolley / 2), 1, this.getWeaponVolleyCap("laser"))
        : weapon === "rocket" || weapon === "missile"
          ? clamp(Math.ceil(baseVolley / 2), 1, this.getWeaponVolleyCap(weapon))
          : weapon === "spread"
            ? clamp(baseVolley + 2, 3, this.getWeaponVolleyCap(weapon))
            : clamp(baseVolley, 1, this.getWeaponVolleyCap(weapon));
    const weaponMultiplier =
      weapon === "rocket" ? 1.38 : weapon === "missile" ? 1.2 : weapon === "spread" ? 0.72 : weapon === "laser" ? 1.08 : 1;
    const critMultiplier = 1 + this.stats.critChance * Math.max(0, this.stats.critDamage - 1);
    const heroMultiplier = this.stats.heroTimer > 0 && this.stats.heroHealth > 0 ? 1.22 : 1;
    return (this.stats.damage * weaponMultiplier * volley * critMultiplier * heroMultiplier) / interval;
  };

  private getPowerRatio = () => {
    const expectedPower = 360 * Math.pow(this.difficulty, 2.2);
    return clamp(this.estimatePlayerDps() / expectedPower, 0.4, 8);
  };

  private createEnemy = (
    type: EnemyType,
    options: { isBoss?: boolean; laneX?: number } = {},
  ): Enemy => {
    const group = new THREE.Group();
    group.name = type.name;
    const body = options.isBoss ? createBossVehicle(type.name, type.color) : createSoldier(type.color, 0x342835);
    const visualScale = options.isBoss
      ? type.scale * (1.38 + Math.min(0.72, this.bossCount * 0.16 + this.difficulty * 0.025))
      : type.scale;
    body.scale.setScalar(visualScale);
    group.add(body);

    const barWidth = options.isBoss ? 1.7 * visualScale : 0.92;
    const barFillWidth = options.isBoss ? 1.58 * visualScale : 0.84;
    const barRoot = new THREE.Group();
    barRoot.position.set(0, (options.isBoss ? 1.9 : 1.7) * visualScale, 0.06);
    const barBack = new THREE.Mesh(
      new THREE.BoxGeometry(barWidth, 0.08, 0.06),
      new THREE.MeshBasicMaterial({ color: 0x2b2630 }),
    );
    const barFill = new THREE.Mesh(
      new THREE.BoxGeometry(barFillWidth, 0.052, 0.07),
      new THREE.MeshBasicMaterial({ color: 0x72e081 }),
    );
    barFill.position.z = -0.005;
    barRoot.add(barBack, barFill);
    group.add(barRoot);

    const lateRamp = Math.max(0, this.progressTime - 30);
    const pressureRamp = Math.max(0, this.difficulty - 2.25);
    const bossScale = options.isBoss
      ? this.bossCount === 0
        ? 0.74 + Math.min(0.22, this.difficulty * 0.06)
        : 2.85 + this.bossCount * 1.08 + Math.max(0, this.difficulty - 3) * 0.26
      : 1;
    const healthScale =
      (options.isBoss ? bossScale : 0.82 + lateRamp * 0.011 + pressureRamp * 0.08);
    const baselineHealth = type.health * healthScale;
    const targetFightSeconds = options.isBoss
      ? this.bossCount === 0
        ? 13 + Math.min(5, this.difficulty * 0.9)
        : 22 + Math.min(22, this.bossCount * 5 + this.difficulty * 0.8)
      : 0;
    const health = Math.max(1, Math.round(options.isBoss ? Math.max(baselineHealth, this.estimatePlayerDps() * targetFightSeconds) : baselineHealth));
    const behavior: EnemyBehavior = options.isBoss ? "boss" : type.behavior;
    const holdBase = options.isBoss
      ? BOSS_Z
      : behavior === "summon"
        ? BOSS_Z + 8 + Math.random() * 4
        : -24 + Math.random() * 9;
    return {
      group,
      health,
      maxHealth: health,
      speed: type.speed + this.difficulty * 0.2,
      score: Math.round(type.score * (options.isBoss ? 1 + this.bossCount * 0.35 : 0.9 + this.difficulty * 0.16)),
      radius: type.radius * visualScale,
      squadDamage: type.squadDamage,
      barFill,
      barHalfWidth: barFillWidth / 2,
      laneX: options.laneX ?? 0,
      isBoss: Boolean(options.isBoss),
      shootTimer: options.isBoss ? (this.bossCount === 0 ? 1.45 : 0.86) : 0.55 + Math.random() * Math.min(0.75, type.shootInterval),
      shootInterval: options.isBoss
        ? this.bossCount === 0
          ? Math.max(1.28, type.shootInterval + 0.34)
          : Math.max(0.32, type.shootInterval - this.bossCount * 0.08)
        : type.weapon === "none"
          ? 99
          : Math.max(0.62, type.shootInterval - this.difficulty * 0.08),
      bulletDamage: type.bulletDamage + (options.isBoss ? Math.floor(this.bossCount / 2) : 0),
      behavior,
      weapon: type.weapon,
      holdZ: clamp(holdBase, WORLD_MIN_Z + 12, PLAYER_Z - 4),
      holdTimer: behavior === "shooter" ? 7.2 + Math.random() * 4 : behavior === "summon" ? 8 + Math.random() * 4 : 0,
      wobble: Math.random() * Math.PI * 2,
    };
  };

  private updateBossTiming = () => {
    if (this.bossActive) return;
    const warningStartsAt = this.nextBossAt - BOSS_WARNING_TIME;
    if (!this.bossWarning && this.elapsed >= warningStartsAt) {
      this.bossWarning = true;
      this.gateSpawnTimer = 99;
      this.notice = "Boss 警告：吃完剩余 buff 后清场";
      this.playSfx("boss-warning", 110, 0.38, "sawtooth", 0.24, 2);
    }
    if (!this.bossWarning) return;

    const remaining = this.enemies.filter((enemy) => !enemy.isBoss).length;
    const remainingGates = this.gates.length;
    if (this.elapsed < this.nextBossAt) {
      this.notice = `Boss 将在 ${Math.ceil(this.nextBossAt - this.elapsed)} 秒后进入`;
      return;
    }
    if (remainingGates > 0) {
      this.notice = `Boss 等待入场：剩余 buff ${remainingGates}`;
      return;
    }
    if (remaining > 0) {
      this.notice = `Boss 等待入场：剩余敌人 ${remaining}`;
      return;
    }
    this.startBossBattle();
  };

  private startBossBattle = () => {
    this.bossActive = true;
    this.bossWarning = false;
    this.bossSummonTimer = this.bossCount === 0 ? 8.4 : 4.2;
    this.bossIntroTimer = 2.1;
    this.notice = `Boss 来袭：第 ${this.bossCount + 1} 战`;
    this.playSfx("boss-start", 92, 0.55, "sawtooth", 0.34, 1);
    this.nextBossAt = Number.POSITIVE_INFINITY;
    while (this.enemyBullets.length) this.removeEnemyBullet(this.enemyBullets.length - 1);
    const boss = this.createEnemy(this.getBossType(), { isBoss: true, laneX: 0 });
    boss.group.position.set(0, 0, BOSS_Z);
    this.scene.add(boss.group);
    this.enemies.push(boss);
  };

  private getBossType = () => BOSS_TYPES[this.bossCount % BOSS_TYPES.length] ?? BOSS_TYPES[0];

  private finishBoss = (enemyIndex: number) => {
    const boss = this.enemies[enemyIndex];
    if (!boss) return;
    this.removeEnemy(enemyIndex);
    this.bossActive = false;
    this.bossWarning = false;
    this.bossCount += 1;
    this.nextBossAt = this.elapsed + Math.max(68, 86 - this.bossCount * 4);
    this.gateSpawnTimer = 5.2;
    this.notice = "Boss 击破：奖励三选一";
    this.playSfx("boss-finish", 523, 0.45, "triangle", 0.28, 0.8);
    this.spawnChoiceGate(true);
  };

  private defeatEnemy = (enemyIndex: number) => {
    const enemy = this.enemies[enemyIndex];
    if (!enemy) return;
    this.stats.score += enemy.score;
    this.spawnFloatingLabel(`+${enemy.score}`, "#3fd071", enemy.group.position.x, enemy.group.position.z);
    if (enemy.isBoss) {
      this.finishBoss(enemyIndex);
      return;
    }
    this.playSfx("defeat", 310, 0.07, "triangle", 0.08, 0.08);
    this.removeEnemy(enemyIndex);
  };

  private updateEnemyShooting = (enemy: Enemy, dt: number) => {
    if (enemy.weapon === "none") return;
    if (enemy.group.position.z < -46 || enemy.group.position.z > PLAYER_Z - 1.6) return;
    enemy.shootTimer -= dt;
    if (enemy.shootTimer > 0) return;
    enemy.shootTimer += enemy.shootInterval + Math.random() * (enemy.isBoss ? 0.2 : 0.26);
    if (enemy.isBoss) {
      this.fireBossPattern(enemy);
      return;
    }
    if (enemy.weapon === "spread") {
      const spread = this.difficulty > 3 ? [-0.9, -0.38, 0.38, 0.9] : [-0.55, 0, 0.55];
      spread.forEach((offset) => this.spawnEnemyBullet(enemy, offset, enemy.weapon));
      return;
    }
    if (enemy.weapon === "rocket") {
      this.spawnEnemyBullet(enemy, 0, enemy.weapon);
      return;
    }
    if (enemy.weapon === "missile") {
      this.spawnEnemyBullet(enemy, 0, enemy.weapon);
      return;
    }
    if (enemy.weapon === "laser") {
      this.spawnEnemyLaser(enemy, this.playerX + (Math.random() - 0.5) * 0.7, 0.22);
      return;
    }
    this.spawnEnemyBullet(enemy, 0, enemy.weapon);
  };

  private fireBossPattern = (boss: Enemy) => {
    const phase = Math.floor((this.elapsed + this.bossCount * 1.7) * 1.35) % 4;
    if (this.bossCount === 0) {
      if (phase === 0 || phase === 2) {
        this.spawnEnemyBullet(boss, 0, "rifle");
        return;
      }
      if (phase === 1) {
        this.spawnEnemyBullet(boss, Math.random() < 0.5 ? -0.95 : 0.95, "spread");
        return;
      }
      this.spawnEnemyBullet(boss, Math.random() < 0.5 ? -1.05 : 1.05, "rocket");
      return;
    }

    if (phase === 0) {
      [-0.82, 0, 0.82].forEach((offset) => this.spawnEnemyBullet(boss, offset, boss.weapon === "none" ? "rifle" : boss.weapon));
      return;
    }
    if (phase === 1) {
      this.spawnEnemyLaser(boss, this.playerX + (Math.random() - 0.5) * 1.15, 0.32);
      return;
    }
    if (phase === 2) {
      this.spawnEnemyBullet(boss, -0.72, "rocket");
      this.spawnEnemyBullet(boss, 0.72, "rocket");
      return;
    }
    this.spawnEnemyBullet(boss, 0, "missile");
    if (this.bossCount >= 2) this.spawnEnemyBullet(boss, Math.random() < 0.5 ? -1 : 1, "missile");
  };

  private spawnEnemyBullet = (enemy: Enemy, offsetX: number, weapon: EnemyWeaponType) => {
    const targetX = clamp(this.playerX + offsetX, -PLAYER_LIMIT, PLAYER_LIMIT);
    const dx = targetX - enemy.group.position.x;
    const dz = PLAYER_Z - enemy.group.position.z;
    const distance = Math.max(0.001, Math.sqrt(dx * dx + dz * dz));
    const isRocket = weapon === "rocket";
    const isMissile = weapon === "missile";
    const isLaser = weapon === "laser";
    const isSpread = weapon === "spread";
    const speed =
      (enemy.isBoss ? 14.2 + this.bossCount * 0.75 : 12.4 + this.difficulty * 0.42) *
      (isRocket ? 0.72 : isMissile ? 0.66 : isLaser ? 1.36 : 1);
    const bullet = new THREE.Mesh(
      isLaser
        ? new THREE.BoxGeometry(0.09, 0.09, 0.92)
        : isRocket
          ? new THREE.SphereGeometry(enemy.isBoss ? 0.22 : 0.17, 12, 8)
          : isMissile
            ? new THREE.ConeGeometry(enemy.isBoss ? 0.2 : 0.16, enemy.isBoss ? 0.7 : 0.54, 10)
            : new THREE.SphereGeometry(enemy.isBoss ? 0.16 : isSpread ? 0.13 : 0.12, 10, 8),
      new THREE.MeshStandardMaterial({
        color: isMissile ? 0xfacc15 : isRocket ? 0xfb923c : isLaser ? 0xf472b6 : enemy.isBoss ? 0xe879f9 : 0xff4d3f,
        emissive: isMissile ? 0xf97316 : isRocket ? 0xf97316 : isLaser ? 0xdb2777 : enemy.isBoss ? 0xc026d3 : 0xff2c21,
        emissiveIntensity: 0.68,
        roughness: 0.32,
      }),
    );
    if (isMissile) bullet.rotation.x = Math.PI / 2;
    bullet.position.set(enemy.group.position.x, enemy.isBoss ? 1.7 : 1.15, enemy.group.position.z + 0.65);
    bullet.castShadow = true;
    this.scene.add(bullet);
    this.enemyBullets.push({
      mesh: bullet,
      velocityX: (dx / distance) * speed,
      velocityZ: (dz / distance) * speed,
      damage: enemy.bulletDamage + (isRocket || isMissile ? 1 : 0),
      radius: isRocket ? 0.4 : isMissile ? 0.36 : isLaser ? 0.25 : enemy.isBoss ? 0.32 : 0.24,
      weapon,
      splashRadius: isRocket ? 0.88 : isMissile ? 0.68 : 0,
    });
  };

  private spawnEnemyLaser = (enemy: Enemy, targetX: number, width: number) => {
    const beamX = clamp(targetX, -PLAYER_LIMIT, PLAYER_LIMIT);
    this.spawnBeam(beamX, enemy.group.position.z + 0.8, PLAYER_Z + 0.5, width, 0xf472b6, true, enemy.bulletDamage);
    if (Math.abs(this.playerX - beamX) < 0.58 + width) {
      this.applySquadDamage(enemy.bulletDamage);
      this.spawnFloatingLabel(`-${enemy.bulletDamage}`, "#ff6f5f", this.playerX, PLAYER_Z);
      this.notice = "敌方激光命中";
    } else {
      this.notice = "敌方激光扫射";
    }
  };

  private updateEnemyBullets = (dt: number) => {
    for (let index = this.enemyBullets.length - 1; index >= 0; index -= 1) {
      const bullet = this.enemyBullets[index];
      if (bullet.weapon === "missile") {
        const desiredX = clamp((this.playerX - bullet.mesh.position.x) * 2.6, -6.2, 6.2);
        bullet.velocityX += (desiredX - bullet.velocityX) * Math.min(1, dt * 2.4);
        bullet.mesh.rotation.z = bullet.velocityX * 0.08;
      }
      bullet.mesh.position.x += bullet.velocityX * dt;
      bullet.mesh.position.z += bullet.velocityZ * dt;
      if (bullet.weapon !== "missile") bullet.mesh.rotation.x += dt * 8;
      bullet.mesh.rotation.y += dt * 11;

      const dx = bullet.mesh.position.x - this.playerX;
      const dz = bullet.mesh.position.z - PLAYER_Z;
      if (Math.abs(dz) < 0.72 && Math.abs(dx) < 0.62 + bullet.radius) {
        if (bullet.splashRadius > 0) {
          this.spawnExplosion(
            bullet.mesh.position.x,
            PLAYER_Z,
            bullet.splashRadius,
            bullet.weapon === "missile" ? 0xfacc15 : 0xfb923c,
          );
        }
        this.applySquadDamage(bullet.damage);
        this.spawnFloatingLabel(`-${bullet.damage}`, "#ff6f5f", this.playerX, PLAYER_Z);
        this.notice = "敌方弹幕命中";
        this.removeEnemyBullet(index);
        continue;
      }

      if (
        bullet.mesh.position.z > PLAYER_Z + 3 ||
        bullet.mesh.position.z < WORLD_MIN_Z - 4 ||
        Math.abs(bullet.mesh.position.x) > ROAD_HALF_WIDTH + 2
      ) {
        this.removeEnemyBullet(index);
      }
    }
  };

  private applyLeakPenalty = (enemy: Enemy) => {
    const scoreLoss = Math.round(enemy.score * 0.42);
    this.stats.score = Math.max(0, this.stats.score - scoreLoss);
    this.applySquadDamage(enemy.squadDamage);
    this.notice = "敌人突破防线";
    this.spawnFloatingLabel(`-${enemy.squadDamage}`, "#ff6f5f", this.playerX, PLAYER_Z);
    if (scoreLoss > 0) {
      this.spawnFloatingLabel(`-${scoreLoss}`, "#ffb347", enemy.group.position.x, PLAYER_Z - 0.55);
    }
  };

  private updateGates = (dt: number, scrollSpeed: number) => {
    if (this.bossActive) return;
    if (!this.bossWarning && this.difficulty >= this.nextChoiceLevel) {
      this.spawnChoiceGate(this.difficulty >= 5);
      this.nextChoiceLevel += 2.2;
      this.gateSpawnTimer = 5.8;
      return;
    }
    if (!this.bossWarning) this.gateSpawnTimer -= dt;
    if (!this.bossWarning && this.gateSpawnTimer <= 0) {
      this.spawnGatePair();
      const baseGateInterval =
        this.elapsed < 28 ? 5.6 : clamp(9.2 - this.elapsed * 0.03, 5.4, 9.2);
      this.gateSpawnTimer = baseGateInterval + Math.random() * 1.4;
    }

    for (let index = this.gates.length - 1; index >= 0; index -= 1) {
      const gate = this.gates[index];
      gate.group.position.z += scrollSpeed * dt;

      if (!gate.applied && Math.abs(gate.group.position.z - PLAYER_Z) < 0.85) {
        const option = this.getSelectedGateOption(gate);
        if (option) {
          gate.applied = true;
          const beforeStats = { ...this.stats };
          const message = option.buff.apply(this.stats);
          const appliedLabel = this.getAppliedBuffLabel(option.buff, message, beforeStats);
          this.notice = message;
          this.spawnFloatingLabel(appliedLabel, option.buff.color, option.x, PLAYER_Z - 0.6);
          this.updateSquadModels();
          this.playSfx(option.buff.kind === "bad" ? "bad-buff" : "buff", option.buff.kind === "bad" ? 180 : 520, 0.16, option.buff.kind === "bad" ? "sawtooth" : "triangle", 0.18, 0.2);
        }
      }

      if (gate.group.position.z > PLAYER_Z + 2.2) {
        this.removeGate(index);
      }
    }
  };

  private spawnGatePair = () => {
    const buffs = pickBuffPair(this.difficulty >= 4, this.stats.weapon, this.getPowerRatio());
    this.spawnGateCluster(
      buffs.map((buff, index) => ({
        buff,
        x: index === 0 ? -GATE_X : GATE_X,
      })),
      "pair",
    );
  };

  private formatSigned = (value: number, digits = 0, suffix = "") => {
    if (value === 0) return `+0${suffix}`;
    const sign = value > 0 ? "+" : "-";
    const amount = Math.abs(value);
    if (digits === 0 && amount < 1) return `${sign}<1${suffix}`;
    if (digits > 0 && Number(amount.toFixed(digits)) === 0) {
      return `${sign}${amount < 0.01 ? "<0.01" : amount.toFixed(2)}${suffix}`;
    }
    const rounded = digits > 0 ? amount.toFixed(digits) : `${Math.round(amount)}`;
    return `${sign}${rounded}${suffix}`;
  };

  private formatPercentChange = (before: number, after: number) => {
    if (before <= 0) return this.formatSigned((after - before) * 100, 0, "%");
    return this.formatSigned((after / before - 1) * 100, 0, "%");
  };

  private formatCritDamageChange = (value: number) =>
    this.formatSigned(value, Math.abs(value) > 0 && Math.abs(value) < 0.1 ? 2 : 1, "x");

  private getAppliedBuffLabel = (buff: BuffDefinition, message: string, before: RunStats) => {
    const after = this.stats;
    const squadDelta = after.squadCount - before.squadCount;
    const damageDelta = after.damage - before.damage;
    const multishotDelta = after.multishot - before.multishot;
    const critChanceDelta = after.critChance - before.critChance;
    const critDamageDelta = after.critDamage - before.critDamage;
    const shieldDelta = after.shield - before.shield;
    const scoreDelta = after.score - before.score;
    const skillDelta = after.activeSkillCharges - before.activeSkillCharges;

    if (buff.id === "berserk-fire") return `火力 ${this.formatPercentChange(before.damage, after.damage)} 兵${this.formatSigned(squadDelta)}`;
    if (buff.id === "glass-cannon") return `火力 ${this.formatPercentChange(before.damage, after.damage)} 护盾0`;
    if (buff.id === "wide-burst") return `子弹 ${this.formatSigned(multishotDelta)} 散弹`;
    if (buff.id === "heavy-guard") return `护盾 ${this.formatSigned(shieldDelta)} 射速${this.formatPercentChange(before.fireRate, after.fireRate)}`;
    if (buff.id === "bounty-contract") return `积分 ${this.formatSigned(scoreDelta)} ${squadDelta === 0 ? "兵不减" : `兵${this.formatSigned(squadDelta)}`}`;
    if (buff.id === "weapon-spread") return `武器: 散弹 子弹${this.formatSigned(multishotDelta)}`;
    if (buff.id === "weapon-laser") return `武器: 激光 暴率${this.formatSigned(critChanceDelta * 100, 0, "%")}`;
    if (buff.id === "weapon-rocket") return `武器: 火箭 火力${this.formatPercentChange(before.damage, after.damage)}`;
    if (buff.id === "weapon-missile") return `武器: 导弹 暴伤${this.formatCritDamageChange(critDamageDelta)}`;
    if (buff.id.includes("weapon")) return `武器: ${WEAPON_LABELS[after.weapon]}`;
    if (buff.id.includes("hero")) return `英雄 ${Math.ceil(after.heroTimer)}s HP${this.formatSigned(after.heroHealth - before.heroHealth)}`;
    if (buff.id.includes("skill")) return `技能 ${this.formatSigned(skillDelta)}次`;
    if (buff.id.includes("squad")) return squadDelta === 0 ? "兵力不变" : `兵 ${this.formatSigned(squadDelta)}`;
    if (buff.id.includes("crit-damage")) return critDamageDelta === 0 ? "暴伤不变" : `暴伤 ${this.formatCritDamageChange(critDamageDelta)}`;
    if (buff.id.includes("damage")) return damageDelta === 0 ? "火力不变" : `火力 ${this.formatSigned(damageDelta)}`;
    if (buff.id.includes("multishot")) return `子弹 ${this.formatSigned(multishotDelta)}`;
    if (buff.id.includes("crit")) return critChanceDelta === 0 ? "暴率不变" : `暴率 ${this.formatSigned(critChanceDelta * 100, 0, "%")}`;
    if (buff.id.includes("rate")) return `射速 ${this.formatPercentChange(before.fireRate, after.fireRate)}`;
    if (buff.id.includes("shield")) return `护盾 ${this.formatSigned(shieldDelta)}`;
    if (buff.id.includes("score")) return `积分 ${this.formatSigned(scoreDelta)}`;
    const numeric = message.match(/([+-]\d+(?:\.\d+)?x|[+-]\d+(?:\.\d+)?%?)/)?.[1];
    if (numeric) return numeric;
    return message.length <= 10 ? message : buff.label.replace(/\?/g, "");
  };

  private spawnChoiceGate = (allowMixed: boolean) => {
    const xs = [-3.05, 0, 3.05];
    const buffs = pickChoiceBuffs(allowMixed, this.stats.weapon, this.getPowerRatio());
    this.spawnGateCluster(
      buffs.map((buff, index) => ({
        buff,
        x: xs[index] ?? 0,
      })),
      "choice",
    );
  };

  private spawnGateCluster = (options: GateOption[], mode: GateCluster["mode"]) => {
    const group = new THREE.Group();
    group.position.z = WORLD_MIN_Z;
    const makePanel = ({ buff, x }: GateOption) => {
      const width = mode === "choice" ? 2.78 : 4.05;
      const panel = new THREE.Mesh(
        new THREE.BoxGeometry(width, 2.55, 0.24),
        new THREE.MeshStandardMaterial({
          color: buff.color,
          transparent: true,
          opacity: 0.58,
          roughness: 0.48,
          metalness: 0.05,
          emissive: buff.color,
          emissiveIntensity: 0.08,
        }),
      );
      panel.position.set(x, 1.28, 0);
      panel.castShadow = true;
      panel.receiveShadow = true;
      const label = createTextSprite(buff.label, buff.color, {
        scale: mode === "choice" ? 0.9 : 1.05,
        textColor: buff.kind === "bad" ? "#3c1012" : "#11311c",
        fontSize: buff.label.length > 8 ? 58 : 76,
      });
      label.position.set(x, 2.96, -0.1);
      const edge = createBox([0.08, 2.72, 0.28], 0xffffff, [x - width / 2, 1.32, 0.01]);
      const edgeRight = createBox([0.08, 2.72, 0.28], 0xffffff, [x + width / 2, 1.32, 0.01]);
      group.add(panel, label, edge, edgeRight);
    };
    options.forEach(makePanel);
    this.scene.add(group);
    this.gates.push({ group, options, applied: false, mode });
  };

  private getSelectedGateOption = (gate: GateCluster) => {
    if (!gate.options.length) return null;
    const normalized = clamp((this.playerX + PLAYER_LIMIT) / (PLAYER_LIMIT * 2), 0, 0.999);
    const index = clamp(Math.floor(normalized * gate.options.length), 0, gate.options.length - 1);
    return gate.options[index] ?? null;
  };

  private updateParticles = (dt: number) => {
    for (let index = this.particles.length - 1; index >= 0; index -= 1) {
      const particle = this.particles[index];
      particle.life -= dt;
      particle.mesh.position.addScaledVector(particle.velocity, dt);
      particle.velocity.y -= 3.4 * dt;
      particle.mesh.rotation.x += dt * 7;
      particle.mesh.rotation.y += dt * 5;
      const material = particle.mesh.material as THREE.MeshStandardMaterial;
      material.opacity = clamp(particle.life / 0.45, 0, 1);
      if (particle.life <= 0) {
        this.scene.remove(particle.mesh);
        disposeObject(particle.mesh);
        this.particles.splice(index, 1);
      }
    }
  };

  private spawnExplosion = (x: number, z: number, radius: number, color: THREE.ColorRepresentation) => {
    const pulse = new THREE.Mesh(
      new THREE.SphereGeometry(radius, 18, 10),
      new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.8,
        transparent: true,
        opacity: 0.28,
        depthWrite: false,
      }),
    );
    pulse.position.set(x, 0.72, z);
    pulse.scale.set(1, 0.32, 1);
    this.scene.add(pulse);
    this.particles.push({
      mesh: pulse,
      velocity: new THREE.Vector3(0, 0.2, 0),
      life: 0.38,
    });

    for (let index = 0; index < 16; index += 1) {
      const angle = (Math.PI * 2 * index) / 16;
      const speed = 2.8 + Math.random() * 2.4;
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 0.12, 0.12),
        new THREE.MeshStandardMaterial({
          color,
          emissive: color,
          emissiveIntensity: 0.7,
          transparent: true,
          opacity: 1,
        }),
      );
      mesh.position.set(x, 0.82 + Math.random() * 0.32, z);
      this.scene.add(mesh);
      this.particles.push({
        mesh,
        velocity: new THREE.Vector3(Math.cos(angle) * speed, 1.2 + Math.random() * 1.4, Math.sin(angle) * speed),
        life: 0.42 + Math.random() * 0.2,
      });
    }
  };

  private spawnHit = (x: number, z: number, color: THREE.ColorRepresentation) => {
    for (let index = 0; index < 5; index += 1) {
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 0.08, 0.08),
        new THREE.MeshStandardMaterial({
          color,
          emissive: color,
          emissiveIntensity: 0.45,
          transparent: true,
          opacity: 1,
        }),
      );
      mesh.position.set(x, 0.88 + Math.random() * 0.5, z);
      this.scene.add(mesh);
      this.particles.push({
        mesh,
        velocity: new THREE.Vector3((Math.random() - 0.5) * 2.4, 1.5 + Math.random() * 1.6, (Math.random() - 0.5) * 2.4),
        life: 0.35 + Math.random() * 0.24,
      });
    }
  };

  private updateFloatingLabels = (dt: number) => {
    for (let index = this.floatingLabels.length - 1; index >= 0; index -= 1) {
      const item = this.floatingLabels[index];
      item.life -= dt;
      item.sprite.position.y += item.velocityY * dt;
      const material = item.sprite.material as THREE.SpriteMaterial;
      material.opacity = clamp(item.life / 0.9, 0, 1);
      if (item.life <= 0) {
        this.scene.remove(item.sprite);
        disposeObject(item.sprite);
        this.floatingLabels.splice(index, 1);
      }
    }
  };

  private spawnFloatingLabel = (text: string, color: string, x: number, z: number) => {
    const sprite = createTextSprite(text, color, { scale: text.length > 8 ? 0.66 : 0.78, fontSize: text.length > 8 ? 66 : 84 });
    sprite.position.set(x, 2.86, z);
    this.scene.add(sprite);
    this.floatingLabels.push({ sprite, life: 1.05, velocityY: 0.92 });
  };

  private updateSquadModels = () => {
    const heroActive = this.stats.heroTimer > 0 && this.stats.heroHealth > 0;
    if (this.lastHeroType !== this.stats.heroType) {
      while (this.heroUnit.children.length) {
        const child = this.heroUnit.children.pop();
        if (child) disposeObject(child);
      }
      this.heroUnit.add(createHeroSoldier(this.stats.heroType));
      this.lastHeroType = this.stats.heroType;
    }
    this.heroUnit.visible = heroActive;
    this.heroUnit.position.set(0, 0, heroActive && this.stats.squadCount > 6 ? -0.54 : -0.34);
    this.heroUnit.scale.setScalar(heroActive ? 1.28 + Math.min(0.22, this.stats.heroHealth * 0.008) : 1.28);
    this.updateShieldVisual();
    while (this.squadUnits.length < MAX_RENDERED_SQUAD) {
      const unit = createSoldier(0x168bdb, 0x0b5f9a);
      this.squadUnits.push(unit);
      this.playerRoot.add(unit);
    }
    const visibleCount = clamp(this.stats.squadCount, 0, this.squadUnits.length);
    const columns = Math.min(8, Math.max(1, Math.ceil(Math.sqrt(Math.max(visibleCount, 1)))));
    const rows = Math.max(1, Math.ceil(Math.max(visibleCount, 1) / columns));
    for (let index = 0; index < this.squadUnits.length; index += 1) {
      const unit = this.squadUnits[index];
      unit.visible = index < visibleCount;
      if (!unit.visible) continue;
      const spacing = visibleCount > 36 ? 0.42 : visibleCount > 24 ? 0.48 : 0.56;
      if (heroActive) {
        const side = index % 2 === 0 ? -1 : 1;
        const wingIndex = Math.floor(index / 2);
        const wingColumns = Math.min(4, Math.max(1, Math.ceil(Math.sqrt(Math.max(visibleCount / 2, 1)))));
        const wingRows = Math.max(1, Math.ceil(Math.max(visibleCount / 2, 1) / wingColumns));
        const row = Math.floor(wingIndex / wingColumns);
        const col = wingIndex % wingColumns;
        const centerGap = visibleCount > 36 ? 0.58 : visibleCount > 16 ? 0.68 : 0.78;
        unit.position.set(side * (centerGap + col * spacing), 0, (row - (wingRows - 1) / 2) * spacing + 0.08);
      } else {
        const row = Math.floor(index / columns);
        const col = index % columns;
        unit.position.set((col - (columns - 1) / 2) * spacing, 0, (row - (rows - 1) / 2) * spacing);
      }
      unit.scale.setScalar(visibleCount > 40 ? 0.58 : visibleCount > 28 ? 0.66 : visibleCount > 16 ? 0.78 : visibleCount > 9 ? 0.9 : 1);
    }
  };

  private updateShieldVisual = () => {
    const active = this.status === "running" && this.stats.shield > 0;
    this.shieldMesh.visible = active;
    this.shieldMesh.position.set(0, 1.06, -1.46);
    this.shieldMesh.rotation.set(0, 0, 0);
    if (!active) return;
    const shieldRatio = clamp(this.stats.shield / 80, 0, 1);
    const baseColor = new THREE.Color(0x9af7ff).lerp(new THREE.Color(0x0f5fff), shieldRatio);
    const ringColor = new THREE.Color(0xe0ffff).lerp(new THREE.Color(0x38bdf8), shieldRatio);
    const opacity = clamp(0.17 + shieldRatio * 0.28 + Math.sin(this.elapsed * 7) * 0.025, 0.16, 0.52);
    this.shieldMesh.children.forEach((child) => {
      const object = child as THREE.Object3D & {
        material?: THREE.MeshBasicMaterial | THREE.LineBasicMaterial;
      };
      const material = object.material;
      if (!material) return;
      const role = child.userData.shieldRole as "field" | "rim" | "core" | "rib" | undefined;
      material.opacity =
        role === "field"
          ? opacity
          : role === "rim"
            ? clamp(opacity + 0.22, 0.38, 0.78)
            : role === "rib"
              ? clamp(opacity + 0.05, 0.24, 0.56)
              : clamp(opacity * 0.62, 0.12, 0.36);
      material.color.set(role === "rim" || role === "rib" ? ringColor : baseColor);
    });
    this.shieldMesh.scale.set(
      1.02 + Math.min(0.32, this.stats.shield * 0.01),
      1 + Math.min(0.24, this.stats.shield * 0.006),
      1,
    );
  };

  private updateEnemyHealthBar = (enemy: Enemy) => {
    const ratio = clamp(enemy.health / enemy.maxHealth, 0, 1);
    enemy.barFill.scale.x = ratio;
    enemy.barFill.position.x = -enemy.barHalfWidth * (1 - ratio);
    const material = enemy.barFill.material as THREE.MeshBasicMaterial;
    material.color.set(ratio < 0.32 ? 0xff6555 : ratio < 0.62 ? 0xffcf4d : 0x72e081);
  };

  private applySquadDamage = (amount: number, lethal = true) => {
    let damage = amount;
    if (this.stats.shield > 0) {
      const absorbed = Math.min(this.stats.shield, damage);
      this.stats.shield -= absorbed;
      damage -= absorbed;
      if (absorbed > 0) this.notice = "护盾吸收伤害";
    }
    if (damage > 0 && this.stats.heroHealth > 0 && this.stats.heroTimer > 0) {
      const absorbed = Math.min(this.stats.heroHealth, damage);
      this.stats.heroHealth -= absorbed;
      damage -= absorbed;
      this.notice = this.stats.heroHealth > 0 ? "英雄挡下伤害" : "英雄撤离战场";
      this.updateSquadModels();
    }
    if (damage > 0) {
      this.stats.squadCount = Math.max(lethal ? 0 : 1, this.stats.squadCount - damage);
      this.notice = "小队受到冲击";
      this.playSfx("damage", 130, 0.18, "sawtooth", 0.2, 0.22);
      this.updateSquadModels();
    }
    if (lethal && this.stats.squadCount <= 0) {
      this.endRun();
    }
  };

  private endRun = () => {
    if (this.status !== "running") return;
    this.status = "gameover";
    this.notice = "本轮结束";
    this.playSfx("gameover", 98, 0.62, "sawtooth", 0.28, 1);
    const result = {
      score: Math.floor(this.stats.score),
      elapsed: this.elapsed,
      distance: this.distance,
    };
    this.callbacks.onGameOver(result);
    this.emitSnapshot(true);
  };

  private clearDynamicObjects = () => {
    while (this.bullets.length) this.removeBullet(this.bullets.length - 1);
    while (this.skillProjectiles.length) {
      const projectile = this.skillProjectiles.pop();
      if (!projectile) continue;
      this.scene.remove(projectile.mesh);
      disposeObject(projectile.mesh);
    }
    while (this.skillBeams.length) {
      const beam = this.skillBeams.pop();
      if (!beam) continue;
      this.scene.remove(beam.group);
      disposeObject(beam.group);
    }
    while (this.beams.length) {
      const beam = this.beams.pop();
      if (!beam) continue;
      this.scene.remove(beam.mesh);
      disposeObject(beam.mesh);
    }
    while (this.enemyBullets.length) this.removeEnemyBullet(this.enemyBullets.length - 1);
    while (this.enemies.length) this.removeEnemy(this.enemies.length - 1);
    while (this.gates.length) this.removeGate(this.gates.length - 1);
    while (this.particles.length) {
      const particle = this.particles.pop();
      if (!particle) continue;
      this.scene.remove(particle.mesh);
      disposeObject(particle.mesh);
    }
    while (this.floatingLabels.length) {
      const label = this.floatingLabels.pop();
      if (!label) continue;
      this.scene.remove(label.sprite);
      disposeObject(label.sprite);
    }
  };

  private removeBullet = (index: number) => {
    const [bullet] = this.bullets.splice(index, 1);
    if (!bullet) return;
    this.scene.remove(bullet.mesh);
    disposeObject(bullet.mesh);
  };

  private removeEnemyBullet = (index: number) => {
    const [bullet] = this.enemyBullets.splice(index, 1);
    if (!bullet) return;
    this.scene.remove(bullet.mesh);
    disposeObject(bullet.mesh);
  };

  private removeEnemy = (index: number) => {
    const [enemy] = this.enemies.splice(index, 1);
    if (!enemy) return;
    this.scene.remove(enemy.group);
    disposeObject(enemy.group);
  };

  private removeGate = (index: number) => {
    const [gate] = this.gates.splice(index, 1);
    if (!gate) return;
    this.scene.remove(gate.group);
    disposeObject(gate.group);
  };

  private emitSnapshot = (force = false) => {
    const now = performance.now();
    if (!force && now - this.lastSnapshotAt < 100) return;
    this.lastSnapshotAt = now;
    const boss = this.enemies.find((enemy) => enemy.isBoss);
    this.callbacks.onSnapshot({
      status: this.status,
      score: Math.floor(this.stats.score),
      elapsed: this.elapsed,
      distance: this.distance,
      squadCount: this.stats.squadCount,
      damage: this.stats.damage,
      multishot: this.stats.multishot,
      critChance: this.stats.critChance,
      critDamage: this.stats.critDamage,
      fireRate: this.stats.fireRate,
      shield: this.stats.shield,
      weapon: this.stats.weapon,
      heroHealth: this.stats.heroHealth,
      heroTimer: this.stats.heroTimer,
      heroType: this.stats.heroType,
      activeSkill: this.stats.activeSkill,
      activeSkillCharges: this.stats.activeSkillCharges,
      activeSkillCooldown: this.skillCooldown,
      bossHealth: boss?.health ?? 0,
      bossMaxHealth: boss?.maxHealth ?? 0,
      bossActive: Boolean(boss && this.bossActive),
      bossWarning: this.bossWarning,
      difficulty: this.difficulty,
      notice: this.notice,
    });
  };

  private handleKeyDown = (event: KeyboardEvent) => {
    const key = event.key.toLowerCase();
    if (["a", "d", "arrowleft", "arrowright", " ", "enter", "e"].includes(key)) {
      event.preventDefault();
    }
    if (key === " " || key === "enter") {
      if (this.status !== "running") this.start();
      return;
    }
    if (key === "e") {
      this.useActiveSkill();
      return;
    }
    this.keys.add(key);
  };

  private handleKeyUp = (event: KeyboardEvent) => {
    this.keys.delete(event.key.toLowerCase());
  };

  private handlePointerDown = (event: PointerEvent) => {
    this.pointerActive = true;
    this.pointerX = event.clientX;
    this.renderer.domElement.setPointerCapture?.(event.pointerId);
    if (this.status !== "running") this.start();
  };

  private handlePointerMove = (event: PointerEvent) => {
    if (!this.pointerActive) return;
    const delta = event.clientX - this.pointerX;
    this.pointerX = event.clientX;
    this.targetX = clamp(this.targetX + delta * 0.018, -PLAYER_LIMIT, PLAYER_LIMIT);
  };

  private handlePointerUp = () => {
    this.pointerActive = false;
  };
}
