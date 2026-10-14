'use client';

import { useState } from 'react';
import { requireSupabase } from '@/lib/supabase/client';

interface LobbyProps {
  onJoinRoom: (roomCode: string, playerName: string, playerId: string, roomId: string) => void;
}

export default function Lobby({ onJoinRoom }: LobbyProps) {
  const [playerName, setPlayerName] = useState('');
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const supabase = requireSupabase();

  const handleCreateRoom = async () => {
    if (!playerName.trim()) {
      setError('Masukkan nama pemain!');
      return;
    }
    setLoading(true);
    setError(null);

    const generatedCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    try {
      // 1. Insert room
      const { data: roomData, error: roomError } = await supabase
        .from('rooms')
        .insert([{ code: generatedCode, status: 'waiting' }])
        .select()
        .single();

      if (roomError) throw roomError;

      // 2. Insert player
      const { data: playerData, error: playerError } = await supabase
        .from('players')
        .insert([{ room_id: roomData.id, name: playerName.trim(), is_ready: true }])
        .select()
        .single();

      if (playerError) throw playerError;

      onJoinRoom(generatedCode, playerName.trim(), playerData.id, roomData.id);
    } catch (err: any) {
      setError(err.message || 'Gagal membuat room.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!playerName.trim()) {
      setError('Masukkan nama pemain!');
      return;
    }
    if (!roomCodeInput.trim()) {
      setError('Masukkan kode room!');
      return;
    }
    setLoading(true);
    setError(null);

    const code = roomCodeInput.trim().toUpperCase();

    try {
      // 1. Find room by code
      const { data: roomData, error: roomError } = await supabase
        .from('rooms')
        .select()
        .eq('code', code)
        .single();

      if (roomError || !roomData) {
        setError('Room tidak ditemukan!');
        setLoading(false);
        return;
      }

      // 2. Insert player
      const { data: playerData, error: playerError } = await supabase
        .from('players')
        .insert([{ room_id: roomData.id, name: playerName.trim(), is_ready: true }])
        .select()
        .single();

      if (playerError) throw playerError;

      onJoinRoom(code, playerName.trim(), playerData.id, roomData.id);
    } catch (err: any) {
      setError(err.message || 'Gagal bergabung ke room.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      fontFamily: 'monospace',
      background: '#2f4f3a',
      color: '#f5f5dc',
      padding: 24,
      borderRadius: 8,
      border: '4px solid #4a3b2a',
      maxWidth: 400,
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }}>
      <h2 style={{ margin: 0, textAlign: 'center', fontSize: 20 }}>LOBBY MULTIPLAYER</h2>
      
      {error && (
        <div style={{ background: '#e05252', padding: 8, borderRadius: 4, color: '#fff', fontSize: 13 }}>
          {error}
        </div>
      )}

      <div>
        <label style={{ display: 'block', marginBottom: 4, fontSize: 13 }}>Nama Pemain:</label>
        <input
          type="text"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          placeholder="Contoh: Bolang"
          disabled={loading}
          style={{
            width: '100%',
            padding: 8,
            borderRadius: 4,
            border: '1px solid #4a3b2a',
            background: '#1e1206',
            color: '#fff',
            fontFamily: 'monospace',
            boxSizing: 'border-box'
          }}
        />
      </div>

      <button
        onClick={handleCreateRoom}
        disabled={loading}
        style={{
          padding: 10,
          background: '#f2d94e',
          color: '#1e1206',
          border: 'none',
          borderRadius: 4,
          fontWeight: 'bold',
          cursor: 'pointer',
          fontFamily: 'monospace'
        }}
      >
        {loading ? 'Processing...' : 'Buat Room Baru'}
      </button>

      <div style={{ textAlign: 'center', fontSize: 12, opacity: 0.7 }}>— ATAU JOIN ROOM —</div>

      <div style={{ display: 'flex', gap: 8 }}>
        <input
          type="text"
          value={roomCodeInput}
          onChange={(e) => setRoomCodeInput(e.target.value)}
          placeholder="Kode Room (misal: X8A92K)"
          disabled={loading}
          style={{
            flex: 1,
            padding: 8,
            borderRadius: 4,
            border: '1px solid #4a3b2a',
            background: '#1e1206',
            color: '#fff',
            fontFamily: 'monospace',
            textTransform: 'uppercase',
            boxSizing: 'border-box'
          }}
        />
        <button
          onClick={handleJoinRoom}
          disabled={loading}
          style={{
            padding: 10,
            background: '#7ef29a',
            color: '#1e1206',
            border: 'none',
            borderRadius: 4,
            fontWeight: 'bold',
            cursor: 'pointer',
            fontFamily: 'monospace'
          }}
        >
          Join
        </button>
      </div>
    </div>
  );
}
