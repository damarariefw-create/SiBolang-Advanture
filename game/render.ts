import { TILE, MAP_COLS, MAP_ROWS, type Pos } from './levels';
import type { GameState } from './entities';

// Palet retro terbatas
const COLORS = {
  wall: '#4a3b2a',
  wallTop: '#6b5741',
  floor: '#2f4f3a',
  player: '#f2d94e', // kuning Bolang
  playerHurt: '#e05252',
  enemy: '#c2553f',
  projectile: '#8ad6c8',
  item: '#ffe9a0',
  itemGlow: '#fff7d6',
  door: '#3a7bd5',
  doorOpen: '#7ef29a',
  checkpoint: '#66d9cd',
  sword: '#f5f5f5',
  text: '#f5f5dc',
};

interface RenderOptions {
  /** tampilkan overlay layar'](nilai) */
  message?: string | null;
}

export function renderGame(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  opts: RenderOptions = {},
): void {
  const { level, player } = state;
  const W = MAP_COLS * TILE;
  const H = MAP_ROWS * TILE;

  // lantai (checkerboard retro)
  for (let row = 0; row < MAP_ROWS; row++) {
    for (let col = 0; col < MAP_COLS; col++) {
      const solid = level.solid[row][col];
      ctx.fillStyle = solid ? COLORS.wall : (row + col) % 2 === 0 ? COLORS.floor : '#355842';
      ctx.fillRect(col * TILE, row * TILE, TILE, TILE);
      if (solid) {
        ctx.fillStyle = COLORS.wallTop;
        // cek tile bawahnya lantai → jadikan tepi atas dinding
        if (row + 1 < MAP_ROWS && !level.solid[row + 1][col]) {
          ctx.fillRect(col * TILE, row * TILE, TILE, 8);
        }
        if (row - 1 >= 0 && !level.solid[row - 1][col]) {
          ctx.fillStyle = COLORS.wall;
          ctx.fillRect(col * TILE, (row + 1) * TILE - 8, TILE, 8);
        }
      }
    }
  }

  // checkpoint
  if (level.checkpoint) drawTile(ctx, level.checkpoint, COLORS.checkpoint);

  // pintu exit
  drawTile(ctx, level.door, state.doorOpen ? COLORS.doorOpen : COLORS.door);
  if (state.doorOpen) {
    ctx.fillStyle = '#0d2417';
    ctx.font = 'bold 20px monospace';
    ctx.fillText('EXIT', level.door.col * TILE + 16, level.door.row * TILE + 30);
    ctx.fillStyle = COLORS.text;
  }

  // bukti keadilan
  for (const item of state.items) {
    if (item.collected) continue;
    const { col, row } = item.pos;
    const cx = col * TILE + TILE / 2;
    const cy = row * TILE + TILE / 2;
    ctx.fillStyle = COLORS.item;
    ctx.beginPath();
    ctx.arc(cx, cy, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = COLORS.itemGlow;
    ctx.fillRect(cx - 2, cy - 12, 4, 6);
  }

  // musuh
  for (const e of state.enemies) {
    if (!e.alive) continue;
    ctx.fillStyle = COLORS.enemy;
    ctx.fillRect(e.x, e.y, e.size, e.size);
    ctx.fillStyle = '#2b1a14';
    // mata menghadap arah gerak
    const eyeX = e.type === 'h' ? (e.dir === 1 ? e.x + e.size - 12 : e.x + 6) : e.x + e.size / 2 - 3;
    const eyeY = e.type === 'v' ? (e.dir === 1 ? e.y + e.size - 12 : e.y + 6) : e.y + 8;
    ctx.fillRect(eyeX, eyeY, 6, 6);
    ctx.fillRect(eyeX + (e.type === 'h' ? 12 : -10), eyeY, 6, 6);
  }

  // proyektil
  ctx.fillStyle = COLORS.projectile;
  for (const p of state.projectiles) {
    if (p.alive) ctx.fillRect(p.x - 4, p.y - 4, 8, 8);
  }

  // checkpoint label kecil
  if (level.checkpoint) {
    ctx.fillStyle = '#0d3330';
    ctx.font = 'bold 11px monospace';
    ctx.fillText('CP', level.checkpoint.col * TILE + 16, level.checkpoint.row * TILE + 14);
  }

  // pedang (saat swing aktif)
  if (state.swing) {
    ctx.fillStyle = COLORS.sword;
    ctx.fillRect(state.swing.rect.x, state.swing.rect.y, state.swing.rect.w, state.swing.rect.h);
  }

  // pemain (kedip saat invulnerability)
  if (player.invul <= 0 || Math.floor(state.tick / 6) % 2 === 0) {
    ctx.fillStyle = player.hp <= 2 ? COLORS.playerHurt : COLORS.player;
    ctx.fillRect(player.x, player.y, player.w, player.h);
    ctx.fillStyle = '#1e1206';
    // mata sesuai arah hadap
    let ex = player.x + 8;
    let ey = player.y + 10;
    if (player.facing === 'left') ex -= 4;
    if (player.facing === 'right') ex += 4;
    if (player.facing === 'up') ey -= 5;
    ctx.fillRect(ex, ey, 5, 7);
    ctx.fillRect(ex + 14, ey, 5, 7);
  }

  // pesan overlay (level clear, dsb.)
  if (opts.message) {
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(0, H / 2 - 56, W, 112);
    ctx.fillStyle = COLORS.text;
    ctx.font = 'bold 28px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(opts.message, W / 2, H / 2);
    ctx.font = '14px monospace';
    ctx.fillText('Tekan R untuk main lagi', W / 2, H / 2 + 34);
    ctx.textAlign = 'left';
  }
}

function drawTile(ctx: CanvasRenderingContext2D, pos: Pos, color: string): void {
  ctx.fillStyle = color;
  ctx.fillRect(pos.col * TILE + 6, pos.row * TILE + 6, TILE - 12, TILE - 12);
}
