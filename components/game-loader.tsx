'use client';

import dynamic from 'next/dynamic';

const GameClient = dynamic(() => import('@/components/game-client'), { ssr: false });

interface GameLoaderProps {
  roomCode: string;
  playerName: string;
}

export default function GameLoader({ roomCode, playerName }: GameLoaderProps) {
  return <GameClient roomCode={roomCode} playerName={playerName} />;
}
