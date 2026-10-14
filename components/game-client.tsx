'use client';

import { useEffect, useRef, useState } from 'react';
import { createEngine } from '@/game/engine';
import { PLAYER_MAX_HP } from '@/game/entities';

interface GameClientProps {
  roomCode: string;
  playerName: string;
}

export default function GameClient({ roomCode, playerName }: GameClientProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hud, setHud] = useState<{
    hp: number;
    deaths: number;
    collected: number;
    total: number;
    doorOpen: boolean;
  }>({ hp: PLAYER_MAX_HP, deaths: 0, collected: 0, total: 0, doorOpen: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dispose = createEngine(canvas, (state) => {
      setHud({
        hp: state.player.hp,
        deaths: state.player.deaths,
        collected: state.collectedCount,
        total: state.items.length,
        doorOpen: state.doorOpen,
      });
    });
    return dispose;
  }, []);

  return (
    <div className="game-wrap" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ fontFamily: 'monospace', marginBottom: 8, fontSize: 14, color: '#f2d94e' }}>
        ROOM: <strong>{roomCode}</strong> | Pemain: <strong>{playerName}</strong>
      </div>
      <canvas
        ref={canvasRef}
        width={960}
        height={576}
        style={{ imageRendering: 'pixelated', border: '4px solid #4a3b2a', maxWidth: '100%' }}
      />
      <div className="hud" style={{ display: 'flex', gap: 24, fontFamily: 'monospace', marginTop: 8 }}>
        <span>
          HP: {'♥'.repeat(Math.max(0, hud.hp)) || '—'}
        </span>
        <span>
          Bukti: {hud.collected}/{hud.total} {hud.doorOpen ? '→ EXIT TERBUKA!' : ''}
        </span>
        <span>Kematian: {hud.deaths}</span>
        <span style={{ opacity: 0.7 }}>
          [WASD/Arrow] gerak · [Space/Klik] serang · [R] ulang
        </span>
      </div>
    </div>
  );
}
