# Level desain / dokumen teknis game SiBolang (see AGENTS.md for details)

## Repo
- Game co-op platformer/top-down multiplayer, MVP-first, docs: planning sudah disetujui (Level Design Doc final).
- Dev 1 (engine canvas top-down, Level 1 Alun-Alun Kota) sudah selesai & di-push.

## Commands
- dev: `npm run dev` (localhost:3000, halaman game di /game)
- build: `npm run build` — wajib lulus sebelum commit
- lint: `npx eslint .` ; typecheck: `npx tsc --noEmit`

## Convention
- Game code di folder `game/` (dipisah dari UI), komponen di `components/`.
- Client-side Supabase: satu instance di `lib/supabase/client.ts`, kredensial hanya dari env `NEXT_PUBLIC_*`.
- `.env.local` tidak berjarak commit (di-ignore `.gitignore`, `.env.example` di-whitelist).
- `next/dynamic` dengan `ssr:false` harus dipanggil dari Client Component (lih.components/game-loader.tsx).
