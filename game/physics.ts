import { TILE, MAP_COLS, MAP_ROWS, type ParsedLevel } from './levels';

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export function isSolidTile(level: ParsedLevel, col: number, row: number): boolean {
  if (col < 0 || row < 0 || col >= MAP_COLS || row >= MAP_ROWS) return true;
  return level.solid[row][col];
}

/** AABB rect vs grid tile: true jika menabrak dinding. */
export function rectCollides(level: ParsedLevel, rect: Rect): boolean {
  const c0 = Math.floor(rect.x / TILE);
  const c1 = Math.floor((rect.x + rect.w - 1) / TILE);
  const r0 = Math.floor(rect.y / TILE);
  const r1 = Math.floor((rect.y + rect.h - 1) / TILE);
  for (let row = r0; row <= r1; row++) {
    for (let col = c0; col <= c1; col++) {
      if (isSolidTile(level, col, row)) return true;
    }
  }
  return false;
}

/** Gerak per-axis: cek X dulu lalu Y, snap ke tepi tile saat kena dinding. */
export function moveRectWithCollision(
  level: ParsedLevel,
  rect: Rect,
  dx: number,
  dy: number,
): void {
  if (dx !== 0) {
    const newX = rect.x + dx;
    if (rectCollides(level, { ...rect, x: newX })) {
      rect.x =
        dx > 0
          ? Math.floor((newX + rect.w) / TILE) * TILE - rect.w
          : Math.floor(newX / TILE + 1) * TILE;
    } else {
      rect.x = newX;
    }
  }
  if (dy !== 0) {
    const newY = rect.y + dy;
    if (rectCollides(level, { ...rect, y: newY })) {
      rect.y =
        dy > 0
          ? Math.floor((newY + rect.h) / TILE) * TILE - rect.h
          : Math.floor(newY / TILE + 1) * TILE;
    } else {
      rect.y = newY;
    }
  }
}

export function rectsOverlap(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}
