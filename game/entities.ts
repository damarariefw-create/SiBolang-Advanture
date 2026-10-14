import { TILE, MAP_COLS, MAP_ROWS, type ParsedLevel, type Pos } from './levels';
import { rectCollides, moveRectWithCollision, rectsOverlap, type Rect } from './physics';

export const PLAYER_SIZE = 34;
export const PLAYER_SPEED = 190; // px per detik
export const SWING_COOLDOWN_TICKS = 24;
export const INVULNERABLE_TICKS = 90;
export const PLAYER_MAX_HP = 5;
export const TICK_MS = 16;

export type Facing = 'up' | 'down' | 'left' | 'right';

export interface Enemy {
  type: 'h' | 'v';
  /** posisi saat ini (px) */
  x: number;
  y: number;
  col: number;
  row: number;
  dir: 1 | -1;
  speedPx: number;
  /** batas patrol dalam px [min, max] pada satu sumbu */
  minPatrol: number;
  maxPatrol: number;
  size: number;
  alive: boolean;
}

export interface Projectile {
  x: number;
  y: number;
  dx: number;
  dy: number;
  speedPx: number;
  alive: boolean;
}

export interface GameState {
  level: ParsedLevel;
  player: Rect & { facing: Facing; hp: number; invul: number; swingCooldown: number; deaths: number };
  enemies: Enemy[];
  items: { pos: Pos; collected: boolean }[];
  projectiles: Projectile[];
  collectedCount: number;
  doorOpen: boolean;
  levelClear: boolean;
  gameOver: boolean;
  swing: { rect: Rect; tick: number } | null;
  tick: number;
}

const ENEMY_SIZE = 32;
const ENEMY_SPEED_PX = 96; // 2 tile/s
const PROJECTILE_SPEED = 160; // dipakai pelempar (Dev 3)

function centerPos(col: number, row: number, size: number): { x: number; y: number } {
  return {
    x: col * TILE + (TILE - size) / 2,
    y: row * TILE + (TILE - size) / 2,
  };
}

export function createEnemy(e: { type: 'h' | 'v'; col: number; row: number }): Enemy {
  const { x, y } = centerPos(e.col, e.row, ENEMY_SIZE);
  // patrol bolak-balik dalam rentang ±2 tile dari posisi awal (deterministik)
  return {
    type: e.type,
    x,
    y,
    col: e.col,
    row: e.row,
    dir: 1,
    speedPx: ENEMY_SPEED_PX,
    minPatrol: e.type === 'h' ? x - 2 * TILE : y - 2 * TILE,
    maxPatrol: e.type === 'h' ? x + 2 * TILE : y + 2 * TILE,
    size: ENEMY_SIZE,
    alive: true,
  };
}

export function createGame(level: ParsedLevel): GameState {
  const { x, y } = centerPos(level.spawn.col, level.spawn.row, PLAYER_SIZE);
  return {
    level,
    player: { x, y, w: PLAYER_SIZE, h: PLAYER_SIZE, facing: 'down', hp: PLAYER_MAX_HP, invul: 0, swingCooldown: 0, deaths: 0 },
    enemies: level.enemies.map(createEnemy),
    items: level.items.map((pos) => ({ pos, collected: false })),
    projectiles: [],
    collectedCount: 0,
    doorOpen: false,
    levelClear: false,
    gameOver: false,
    swing: null,
    tick: 0,
  };
}

export function respawnPlayer(state: GameState): void {
  const source = state.level.checkpoint ?? state.level.spawn;
  const { x, y } = centerPos(source.col, source.row, PLAYER_SIZE);
  state.player.x = x;
  state.player.y = y;
  state.player.hp = PLAYER_MAX_HP;
  state.player.invul = INVULNERABLE_TICKS;
  state.player.deaths += 1;
}

function updateEnemies(state: GameState): void {
  for (const e of state.enemies) {
    if (!e.alive) continue;
    // deterministik: patrol bolak-balik per-tick, tanpa acak/waktu wall-clock
    const delta = (e.speedPx * TICK_MS) / 1000;
    const pos = e.type === 'h' ? e.x : e.y;
    let next = pos + delta * e.dir;
    if (next > e.maxPatrol) {
      next = e.maxPatrol;
      e.dir = -1;
    } else if (next < e.minPatrol) {
      next = e.minPatrol;
      e.dir = 1;
    }
    if (e.type === 'h') e.x = next;
    else e.y = next;

    // sentuh pemain = damage
    const enemyRect: Rect = { x: e.x, y: e.y, w: e.size, h: e.size };
    if (state.player.invul <= 0 && rectsOverlap(enemyRect, state.player)) {
      state.player.hp -= 1;
      state.player.invul = INVULNERABLE_TICKS;
      if (state.player.hp <= 0) respawnPlayer(state);
    }

    // ayunan pedang membunuh musuh (1 pukulan)
    if (state.swing && rectsOverlap(state.swing.rect, enemyRect)) {
      e.alive = false;
    }
  }
}

function updateProjectiles(state: GameState): void {
  for (const p of state.projectiles) {
    if (!p.alive) continue;
    p.x += (p.dx * p.speedPx * TICK_MS) / 1000;
    p.y += (p.dy * p.speedPx * TICK_MS) / 1000;
    const rect: Rect = { x: p.x - 4, y: p.y - 4, w: 8, h: 8 };
    if (
      rectCollides(state.level, rect) ||
      p.x < 0 ||
      p.y < 0 ||
      p.x > TILE * MAP_COLS ||
      p.y > TILE * MAP_ROWS
    ) {
      p.alive = false;
      continue;
    }
    if (state.player.invul <= 0 && rectsOverlap(rect, state.player)) {
      p.alive = false;
      state.player.hp -= 1;
      state.player.invul = INVULNERABLE_TICKS;
      if (state.player.hp <= 0) respawnPlayer(state);
    }
  }
}

export interface InputIntent {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  attack: boolean;
}

export function applyInput(state: GameState, intent: InputIntent): void {
  const { player } = state;

  if (state.levelClear) return;

  let dx = 0;
  let dy = 0;
  if (intent.left) dx -= 1;
  if (intent.right) dx += 1;
  if (intent.up) dy -= 1;
  if (intent.down) dy += 1;
  const norm = dx !== 0 && dy !== 0 ? Math.SQRT1_2 : 1;
  const dist = (PLAYER_SPEED * TICK_MS * norm) / 1000;

  if (dx > 0) player.facing = 'right';
  else if (dx < 0) player.facing = 'left';
  else if (dy > 0) player.facing = 'down';
  else if (dy < 0) player.facing = 'up';

  moveRectWithCollision(state.level, player, dx * dist, dy * dist);

  // serangan melee: pedang 1 tile ke arah hadap
  if (player.swingCooldown > 0) player.swingCooldown -= 1;
  if (intent.attack && player.swingCooldown <= 0 && !state.swing) {
    const sword = { w: TILE, h: TILE, x: player.x, y: player.y };
    if (player.facing === 'right') sword.x = player.x + player.w - HANDOVER;
    else if (player.facing === 'left') sword.x = player.x - TILE + HANDOVER;
    else if (player.facing === 'down') sword.y = player.y + player.h - HANDOVER;
    else sword.y = player.y - TILE + HANDOVER;
    state.swing = { rect: sword, tick: state.tick };
    player.swingCooldown = SWING_COOLDOWN_TICKS;
  }
  if (state.swing && state.tick - state.swing.tick >= 8) {
    state.swing = null;
  }

  if (player.invul > 0) player.invul -= 1;

  updateEnemies(state);
  updateProjectiles(state);

  // kumpulkan bukti
  for (const item of state.items) {
    if (item.collected) continue;
    const rect: Rect = {
      x: item.pos.col * TILE + 8,
      y: item.pos.row * TILE + 8,
      w: TILE - 16,
      h: TILE - 16,
    };
    if (rectsOverlap(rect, player)) {
      item.collected = true;
      state.collectedCount += 1;
    }
  }

  // pintu exit terbuka saat semua bukti terkumpul
  if (!state.doorOpen && state.collectedCount >= state.items.length && state.items.length > 0) {
    state.doorOpen = true;
  }

  // level clear: pemain berdiri di tile pintu yang terbuka
  if (state.doorOpen && !state.levelClear) {
    const doorRect: Rect = {
      x: state.level.door.col * TILE + 8,
      y: state.level.door.row * TILE + 8,
      w: TILE - 16,
      h: TILE - 16,
    };
    if (rectsOverlap(doorRect, player)) {
      state.levelClear = true;
    }
  }
}

// jarak tepi pedang menempel ke badan pemain
const HANDOVER = 6;
