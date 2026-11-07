# AI_LOG.md — Catatan Penggunaan AI

> Setiap anggota menambahkan entri setiap kali memakai AI untuk dokumen, konten kimia, atau kode.
> Entri terbaru ditulis paling bawah.

---

## Format Entri

```
### [Tanggal] — [Nama] — [Judul singkat]
- **Alat AI:** (contoh: Claude, Gemini di Antigravity)
- **Tujuan:** apa yang diminta dari AI
- **Prompt utama:** ringkasan perintah yang diberikan
- **Hasil AI:** file/bagian yang dibuat atau diubah
- **Yang diubah manusia:** bagian yang direvisi atau ditolak dari usulan AI
- **Verifikasi:** apa yang dicek dan pakai sumber apa
- **Branch / PR:** nama branch dan nomor PR
```

---

## Entri

### 1 Nov 2026 — Ghefira Amelia Aundra — Revisi PRD dan AGENT
- **Alat AI:** Claude
- **Tujuan:** Menyesuaikan PRD dengan fitur kalkulator pH dan praktikum titrasi, serta memperbaiki aturan kerja agent.
- **Prompt utama:** Meminta AI mengarahkan langkah pengembangan web, lalu merevisi PRD dan AGENT.md menjadi versi final.
- **Hasil AI:** `docs/PRD.md` versi 2 (target SMA XI, kode masalah M1–M5, fitur F1–F8, rumus pH, tabel indikator); `docs/AGENT.md` (aturan cara kerja agent, kebenaran kimia, struktur folder).
- **Yang diubah manusia:** Keputusan fokus 1 modul dulu untuk Pertemuan 02.
- **Verifikasi:** Direview Maziatul lewat PR. Rumus pH dan trayek indikator ⬜ belum dicocokkan dengan buku paket.
- **Branch / PR:** `docs/revisi-prd` · PR #1

### 1 Nov 2026 — Ghefira Amelia Aundra — Penyusunan TEAM.md
- **Alat AI:** Claude
- **Tujuan:** Menyusun pembagian peran, tugas per modul dan fitur, rencana sprint, dan aturan review.
- **Prompt utama:** Memberikan nama anggota, akun GitHub, peran, dan baseline, lalu meminta AI merapikannya menjadi TEAM.md.
- **Hasil AI:** `docs/TEAM.md`
- **Yang diubah manusia:** Meminta Ghefira juga memegang konten Modul 3.
- **Verifikasi:** Pembagian tugas disetujui anggota; direview Khoirina lewat PR.
- **Branch / PR:** `docs/team` · PR #2

### 1 Nov 2026 — Ghefira Amelia Aundra — Pembuatan BACKLOG.md dan AI_LOG.md
- **Alat AI:** Claude
- **Tujuan:** Membuat daftar prioritas pekerjaan dan format catatan penggunaan AI.
- **Prompt utama:** Meminta AI menyusun BACKLOG.md dari PRD dan TEAM.md, serta membuat AI_LOG.md.
- **Hasil AI:** `docs/BACKLOG.md`, `docs/AI_LOG.md`
- **Yang diubah manusia:** —
- **Verifikasi:** Urutan prioritas dicocokkan dengan PRD Bagian 7 dan TEAM.md Bagian 4.
- **Branch / PR:** (isi setelah PR dibuat)
