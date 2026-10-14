// Level data untuk SiBolang — data-driven, sesuai Level Design Doc.
// Legenda: '#' dinding, '.' lantai, 'S' spawn pemain, 'B' bukti keadilan,
// 'X' pintu exit, '@' checkpoint, 'h' musuh patrol horizontal, 'v' musuh patrol vertikal.

export const TILE = 48;
export const MAP_COLS = 20;
export const MAP_ROWS = 12;

export interface Pos {
  col: number;
  row: number;
}

export interface ParsedLevel {
  name: string;
  /** grid[row][col] = true jika tile solid (dinding) */
  solid: boolean[][];
  spawn: Pos;
  checkpoint: Pos | null;
  door: Pos;
  enemies: { type: 'h' | 'v'; col: number; row: number }[];
  items: Pos[];
}

interface LevelDef {
  name: string;
  rows: string[];
}

export const LEVEL_1: LevelDef = {
  name: 'Alun-Alun Kota',
  rows: [
    '####################',
    '#S.....h...........#',
    '#..................#',
    '#..B...####....B...#',
    '#......####........#',
    '#..v...####...B....#',
    '#......####........#',
    '#..................#',
    '#......@...........#',
    '#..................#',
    '#.................X#',
    '####################',
  ],
};

export function parseLevel(def: LevelDef): ParsedLevel {
  if (def.rows.length !== MAP_ROWS) {
    throw new Error(`Level "${def.name}" harus punya ${MAP_ROWS} baris.`);
  }

  const solid: boolean[][] = [];
  const spawn: Pos = { col: 1, row: 1 };
  let door: Pos | null = null;
  const enemies: ParsedLevel['enemies'] = [];
  const items: Pos[] = [];

  for (let row = 0; row < MAP_ROWS; row++) {
    const line = def.rows[row];
    if (line.length !== MAP_COLS) {
      throw new Error(`Level "${def.name}" baris ${row} harus ${MAP_COLS} karakter.`);
    }
    solid[row] = [];
    for (let col = 0; col < MAP_COLS; col++) {
      const ch = line[col];
      solid[row][col] = ch === '#';
      switch (ch) {
        case 'S':
          spawn.col = col;
          spawn.row = row;
          break;
        case 'B':
          items.push({ col, row });
          break;
        case 'X':
          door = { col, row };
          break;
        case '@':
          solid[row][col] = false;
          // checkpoint dikirim lewat closure di bawah, disimpan sementara:
          (solid as unknown as { _cp?: Pos })._cp = { col, row };
          break;
        case 'h':
        case 'v':
          enemies.push({ type: ch, col, row });
          solid[row][col] = false;
          break;
        default:
          break;
      }
    }
  }

  if (!door) {
    throw new Error(`Level "${def.name}" tidak punya pintu exit (X).`);
  }

  const cp = (solid as unknown as { _cp?: Pos })._cp ?? null;
  delete (solid as unknown as { _cp?: Pos })._cp;

  return {
    name: def.name,
    solid,
    spawn,
    checkpoint: cp,
    door,
    enemies,
    items,
  };
}
