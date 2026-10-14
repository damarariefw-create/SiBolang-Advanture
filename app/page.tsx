import Link from 'next/link';

export default function Home() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        background: '#0d2417',
        color: '#f5f5dc',
        fontFamily: 'monospace',
      }}
    >
      <div
        style={{
          display: 'grid',
          gap: 16,
          justifyItems: 'center',
          textAlign: 'center',
          padding: 24,
        }}
      >
        <h1 style={{ fontSize: 42, margin: 0, letterSpacing: 4 }}>SiBolang</h1>
        <p style={{ margin: 0, maxWidth: 480, lineHeight: 1.6 }}>
          Petualangan Bolang mencari keadilan di negerinya.
          <br />
          Kumpulkan <strong>3 bukti</strong> di tiap level, hindari musuh,
          <br />
          dan hadapi <strong>Wowo</strong> di akhir perjalanan.
        </p>
        <Link
          href="/game"
          style={{
            background: '#f2d94e',
            color: '#1e1206',
            padding: '14px 36px',
            border: '4px solid #4a3b2a',
            fontSize: 18,
            letterSpacing: 2,
          }}
        >
          ▶ MULAI BAB 1
        </Link>
        <p style={{ opacity: 0.6, fontSize: 12 }}>
          Co-op multiplayer via Supabase Realtime menyusul di Dev 2.
        </p>
      </div>
    </main>
  );
}
