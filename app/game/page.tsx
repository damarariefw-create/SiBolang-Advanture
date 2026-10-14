import GameRoom from '@/components/game-room';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SiBolang — Bab 1: Alun-Alun Kota',
};

export default function GamePage() {
  return (
    <main style={{ padding: 16, display: 'grid', gap: 12, justifyItems: 'center' }}>
      <h1 style={{ fontFamily: 'monospace', margin: 0 }}>SiBolang — Bab 1: Alun-Alun Kota</h1>
      <p style={{ margin: 0, fontFamily: 'monospace', fontSize: 14 }}>
        Bolang mencari bukti ketidakadilan. Kumpulkan 3 bukti, buka pintu exit.
      </p>
      <GameRoom />
      <Link href="/" style={{ fontFamily: 'monospace', fontSize: 14 }}>
        ← Kembali ke beranda
      </Link>
    </main>
  );
}
