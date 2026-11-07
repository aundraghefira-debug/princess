# BACKLOG.md — ChemiVerse

> Daftar pekerjaan berurutan prioritas. Kode fitur (F1–F8) mengikuti `docs/PRD.md`, pembagian orang mengikuti `docs/TEAM.md`.
> Status: ⬜ belum · 🟨 dikerjakan · ✅ selesai (sudah di-merge ke `main`)

---

## 1. MVP Wajib — Pertemuan 02

| No | Tugas | PJ | Branch | Status |
|---|---|---|---|---|
| 1 | Konten Modul 1 (tujuan, apersepsi, Arrhenius, Brønsted-Lowry, Lewis, representasi) di `src/data/chemData.ts` | Maziatul | `feat/maziatul-modul-1-content` | ⬜ |
| 2 | Contoh soal, persamaan reaksi, dan sumber pustaka Modul 1 | Khoirina | `feat/khoirina-contoh-sumber` | ⬜ |
| 3 | Navigasi beranda → halaman Modul 1 dan layout halaman modul (F1) | Ghefira | `feat/ghefira-navigation` | ⬜ |
| 4 | Commit checkpoint `checkpoint: pertemuan 02` di `main` | Ghefira | — | ⬜ |

**Dokumen pendukung:**

| Dokumen | Status |
|---|---|
| PRD.md | ✅ |
| AGENT.md | ✅ |
| TEAM.md | ✅ |
| BACKLOG.md | 🟨 |
| AI_LOG.md | 🟨 |
| USER_FLOW.md (diselaraskan dengan PRD v2) | ⬜ |
| DESAIN_TEKNIS.md (diselaraskan dengan PRD v2 & AGENT) | ⬜ |

---

## 2. Sprint Berikutnya — Pertemuan 03

| No | Tugas | PJ | Pendukung | Status |
|---|---|---|---|---|
| 5 | Soal kuis Modul 1 (min. 5) + kunci + pembahasan | Khoirina | — | ⬜ |
| 6 | Komponen kuis dasar (F7) untuk Modul 1 | Ghefira | Khoirina | ⬜ |
| 7 | Isi Sandbox Teori: daftar reaksi, pasangan konjugasi, pesan umpan balik (F2) | Maziatul | — | ⬜ |
| 8 | Kode Sandbox Teori drag-and-drop (F2) | Maziatul | Ghefira | ⬜ |
| 9 | Draf konten Modul 3 (titrasi) | Ghefira | — | ⬜ |

---

## 3. Sprint 3 — Modul 2 & Alat Hitung

| No | Tugas | PJ | Pendukung | Status |
|---|---|---|---|---|
| 10 | Konten Modul 2 (Kw, pH/pOH, kuat/lemah, Ka/Kb, α, indikator) | Maziatul | — | ⬜ |
| 11 | Contoh soal & sumber Modul 2 | Khoirina | — | ⬜ |
| 12 | Kalkulator pH Bertahap (F5) + validasi input | Ghefira | Khoirina (kasus uji) | ⬜ |
| 13 | Pengembangan Eksplorasi Skala pH (F3): [H⁺], [OH⁻], perbandingan ×10 | Ghefira | Khoirina | ⬜ |
| 14 | Isi Simulator Mikro–Makro: zat, Ka, tampilan partikel (F4) | Maziatul | — | ⬜ |

---

## 4. Sprint 4 — Modul 3 & Titrasi

| No | Tugas | PJ | Pendukung | Status |
|---|---|---|---|---|
| 15 | Konten Modul 3 final (rujuk dokumen MODUL) | Ghefira | Maziatul (review) | ⬜ |
| 16 | Contoh soal, sumber, dan data trayek indikator Modul 3 | Khoirina | — | ⬜ |
| 17a | Data titrasi di `chemData.ts`: `daftarPresetTitrasi`, `daftarIndikator`, dan Ka asam asetat dari buku sumber (hapus penanda `TODO`) | Khoirina | Maziatul (cocokkan dengan buku sumber) | ⬜ |
| 17b | Mesin titrasi `src/utils/titrationEngine.ts` + fungsi `periksaNilaiAcuan`; semua baris nilai acuan harus lulus (±0,02) | Ghefira | Khoirina (verifikasi nilai acuan) | ⬜ |
| 17c | Komponen `Burette.tsx` dan `Flask.tsx`: buret SVG, kran, animasi tetes, warna bertahap | Ghefira | — | ⬜ |
| 17d | Komponen `TitrationChart.tsx`: kurva SVG, garis titik ekuivalen, pita trayek indikator | Ghefira | — | ⬜ |
| 17e | `TitrationLab.tsx` dan `DataTable.tsx`: alur 6 tahap (Bagian 3A USER_FLOW), validasi input, tabel pengamatan, pemeriksaan jawaban | Ghefira | Khoirina | ⬜ |
| 17f | Teks pertanyaan pemantik dan umpan balik indikator tidak cocok di `chemData.ts` | Khoirina | Maziatul (review) | ⬜ |
| 17g | Uji alur penuh F6 untuk kedua jenis titrasi (persiapan sampai refleksi) di laptop dan tablet | Khoirina | Ghefira | ⬜ |
| 18 | Kode Simulator Mikro–Makro (F4) | Ghefira | Maziatul | ⬜ |

**Urutan pengerjaan F6:** 17a lebih dulu, karena 17b membutuhkan nilai Ka yang sudah diverifikasi. Setelah 17b lulus uji, 17c, 17d, dan 17f bisa dikerjakan paralel. 17e menyusul, lalu 17g.

## 5. Sprint 5 — Penyempurnaan

| No | Tugas | PJ | Status |
|---|---|---|---|
| 19 | Soal kuis Modul 2 & 3 + pohon kesalahan (F7 lengkap) | Khoirina | ⬜ |
| 20 | Penyimpanan progres lokal (F8), termasuk posisi terakhir simulator titrasi (perbarui `docs/DATABASE.md` lebih dulu) | Ghefira | ⬜ |
| 21 | Uji keterbacaan seluruh materi | Maziatul | ⬜ |
| 22 | Uji tampilan di laptop, tablet, dan HP (360px), termasuk tiga panel simulator titrasi yang tersusun vertikal | Ghefira | ⬜ |

---

## 6. Jika Waktu Cukup

| Tugas | PJ |
|---|---|
| Uji pH Benda Sehari-hari | Khoirina |
| Indikator Alami (kubis ungu) | Ghefira |
| Kartu Perbandingan Teori | Maziatul |
| Pemburu Miskonsepsi | Khoirina |
| Ekspor progres ke file `.json` untuk guru | Ghefira |
| Elemen menarik dari beranda P1 Maziatul & Khoirina | Diputuskan bersama |
| Mode Soal Acak pada simulator titrasi | Khoirina |
| Titrasi basa lemah–asam kuat | Ghefira |
| Mode perbandingan dua kurva titrasi berdampingan dan ekspor tabel titrasi ke CSV | Ghefira |

---

## 7. Di Luar Lingkup

Login pengguna · database online · deployment domain resmi · materi larutan penyangga dan hidrolisis garam.
