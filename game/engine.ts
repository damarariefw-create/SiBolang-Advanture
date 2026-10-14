import { TICK_MS, createGame, applyInput, type InputIntent, type GameState } from './entities';
import { parseLevel, LEVEL_1 } from './levels';
import { renderGame } from './render';

const RESTART_KEY = 'r';

export function createEngine(
  canvas: HTMLCanvasElement,
  onHudChange: (state: GameState) => void,
): () => void {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context tidak tersedia');
  const renderCtx: CanvasRenderingContext2D = ctx;

  let state: GameState = createGame(parseLevel(LEVEL_1));
  const keys = new Set<string>();
  let raf = 0;
  let lastTime = performance.now();
  let accumulator = 0;
  let disposed = false;
  let lastHudTick = -1;

  const onKeyDown = (e: KeyboardEvent) => {
    const key = e.key.toLowerCase();
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(key)) e.preventDefault();
    if (key === RESTART_KEY && (state.gameOver || state.levelClear)) {
      state = createGame(parseLevel(LEVEL_1));
    }
    keys.add(key);
  };
  const onKeyUp = (e: KeyboardEvent) => keys.delete(e.key.toLowerCase());
  const onBlur = () => keys.clear();
  const onClick = () => keys.add(' '); // klik kiri = serang (mobile-friendly awal)

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  window.addEventListener('blur', onBlur);
  canvas.addEventListener('click', onClick);

  function readIntent(): InputIntent {
    return {
      up: keys.has('w') || keys.has('arrowup'),
      down: keys.has('s') || keys.has('arrowdown'),
      left: keys.has('a') || keys.has('arrowleft'),
      right: keys.has('d') || keys.has('arrowright'),
      attack: keys.has(' '),
    };
  }

  function hud(state2: GameState) {
    if (state2.tick !== lastHudTick) {
      lastHudTick = state2.tick;
      onHudChange(state2);
    }
  }

  function frame(now: number): void {
    if (disposed) return;
    raf = requestAnimationFrame(frame);
    const elapsed = Math.min(120, now - lastTime);
    lastTime = now;
    accumulator += elapsed;

    while (accumulator >= TICK_MS) {
      if (!state.levelClear && !state.gameOver) {
        applyInput(state, readIntent());
        state.tick += 1;
      }
      accumulator -= TICK_MS;
    }

    const message = state.levelClear
      ? 'LEVEL 1 CLEAR! Keadilan maju selangkah.'
      : state.gameOver
        ? 'GAME OVER'
        : null;
    renderGame(renderCtx, state, { message });
    hud(state);
  }

  raf = requestAnimationFrame(frame);

  return () => {
    if (disposed) return;
    disposed = true;
    cancelAnimationFrame(raf);
    window.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('keyup', onKeyUp);
    window.removeEventListener('blur', onBlur);
    canvas.removeEventListener('click', onClick);
  };
}
