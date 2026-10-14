'use client';

import { useState } from 'react';
import Lobby from '@/components/lobby';
import GameLoader from '@/components/game-loader';

export default function GameRoom() {
  const [session, setSession] = useState<{
    roomCode: string;
    playerName: string;
    playerId: string;
    roomId: string;
  } | null>(null);

  if (!session) {
    return (
      <Lobby
        onJoinRoom={(roomCode, playerName, playerId, roomId) => {
          setSession({ roomCode, playerName, playerId, roomId });
        }}
      />
    );
  }

  return <GameLoader roomCode={session.roomCode} playerName={session.playerName} />;
}
