# SOUNDGIT — Git for Music.

> Beat'ini commit'le. Branch aç. Remix'le. Merge et.

**Live:** https://soundgit.online

### Neden?
DAW'da versiyon yok. "final_final2.wav" bitti. Her drop bir commit.

### Akış
/ → invite ile gir
/studio → global jam
/studio/projects → albümler
/studio/projects/[id] → commits + stems
/studio/pulls → merge
/admin → invite üret (şifre: cigaw2024)

### Tech
Next.js + Supabase + Vercel
Buckets: tracks (50MB) + stems (50MB)

### Kurulum
npm install
.env.local içine SUPABASE_URL ve KEY ekle
npm run dev