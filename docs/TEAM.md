# TEAM.md — Kelompok ChemiVerse

> Produk: ChemiVerse: Asam Basa Interactive Lab
> Repo: `aundraghefira-debug/princess`

---

## 1. Anggota & Peran

| Nama | Akun GitHub | Peran | Tanggung jawab umum |
|---|---|---|---|
| Maziatul Falah El Mahfudzah | `mztlflhelma-art` | **Konten Kimia Modul 1 & 2** | Menulis tujuan belajar, apersepsi, konsep inti, dan representasi Modul 1 (Teori Asam Basa) dan Modul 2 (Kekuatan Asam Basa & pH); merancang isi kimia untuk fitur teori dan simulator. |
| Khoirina Nihayatul Ismahani | `nihayatulkhoirina-creator` | **Contoh & Rujukan** | Menyusun contoh soal, persamaan reaksi, soal kuis, dan sumber pustaka ketiga modul; menjadi pemeriksa data (Ka/Kb, trayek indikator, rumus) dari buku sumber. |
| Ghefira Amelia Aundra | `aundraghefira-debug` | **Konten Kimia Modul 3, Navigasi & Tampilan** (pemilik repo) | Menulis tujuan belajar, apersepsi, konsep inti, dan representasi Modul 3 (Titrasi Asam Basa); membangun komponen React, navigasi, layout responsif, dan penyimpanan progres; menjaga `main` tetap stabil dan melakukan merge PR. |

---

## 2. Pembagian Tugas per Modul

| Bagian modul | Modul 1 — Teori Asam Basa | Modul 2 — Kekuatan Asam Basa & pH | Modul 3 — Titrasi Asam Basa |
|---|---|---|---|
| Tujuan belajar & apersepsi | Maziatul | Maziatul | **Ghefira** |
| Konsep inti (sub-materi) | Maziatul | Maziatul | **Ghefira** |
| Representasi makro/submikro/simbolik | Maziatul | Maziatul | **Ghefira** |
| Contoh soal & persamaan reaksi | Khoirina | Khoirina | Khoirina |
| Sumber pustaka | Khoirina | Khoirina | Khoirina |
| Soal kuis (min. 5) + kunci + pembahasan | Khoirina | Khoirina | Khoirina |
| Halaman modul & navigasi | Ghefira | Ghefira | Ghefira |
| Review konten | Khoirina | Khoirina | Maziatul |
| Review contoh & soal | Maziatul | Maziatul | Ghefira |

---

## 3. Pembagian Tugas per Fitur

**PJ** = penanggung jawab utama (membuat branch & PR). **Pendukung** = menyiapkan data/isi kimia atau membantu menguji.

| Kode | Fitur | PJ | Pendukung | Tugas pendukung |
|---|---|---|---|---|
| F1 | Halaman Modul Materi | Ghefira | Maziatul, Khoirina | Mengisi data materi, contoh, dan sumber di `chemData.ts` |
| F2 | Sandbox Teori Asam Basa | Maziatul | Ghefira | Maziatul menentukan daftar reaksi, pasangan konjugasi, dan pesan umpan balik; Ghefira membantu kode drag-and-drop |
| F3 | Eksplorasi Skala pH Real-Time | Ghefira | Khoirina | Mengecek kebenaran nilai [H⁺], [OH⁻], dan contoh larutan di tiap pH |
| F4 | Simulator Mikro–Makro | Maziatul | Ghefira | Maziatul menentukan zat, nilai Ka, dan tampilan partikel; Ghefira membantu animasi |
| F5 | Kalkulator pH Bertahap | Ghefira | Khoirina | Menyiapkan rumus, kasus uji, dan jawaban yang benar untuk menguji kalkulator |
| F6 | Praktikum Titrasi Virtual | Ghefira | Khoirina | Ghefira menyusun alur prosedur dan teks refleksi sekaligus kodenya; Khoirina menyiapkan data trayek indikator dan konsentrasi |
| F7 | Kuis Adaptif & Pohon Kesalahan | Khoirina | Ghefira | Khoirina menyusun soal dan cabang kesalahan; Ghefira membantu logika kode |
| F8 | Penyimpanan Progres Lokal | Ghefira | — | — |

**Fitur tambahan (jika waktu cukup):**

| Fitur | PJ | Pendukung |
|---|---|---|
| Uji pH Benda Sehari-hari | Khoirina | Ghefira |
| Indikator Alami (kubis ungu) | Ghefira | Maziatul |
| Kartu Perbandingan Teori | Maziatul | Khoirina |
| Pemburu Miskonsepsi | Khoirina | Maziatul |

---

## 4. Rencana Sprint

| Sprint | Target | Maziatul | Khoirina | Ghefira |
|---|---|---|---|---|
| **Pertemuan 02** | Modul 1 lengkap & navigasi berfungsi | Konten Modul 1 | Contoh & sumber Modul 1 | Navigasi beranda → Modul 1, layout modul, mulai draf konten Modul 3 |
| **Pertemuan 03** | Kuis Modul 1 & interaktivitas awal | Isi F2 (reaksi & umpan balik) | Soal kuis Modul 1 (F7 dasar) | Kode kuis, kode F2 |
| **Sprint 3** | Modul 2 & alat hitung | Konten Modul 2, isi F4 | Contoh & sumber Modul 2, kasus uji F5 | F5 Kalkulator pH, pengembangan F3 |
| **Sprint 4** | Modul 3 & titrasi | Bantu kode F4 Simulator | Contoh & sumber Modul 3, data indikator | Konten Modul 3, alur & kode F6 Praktikum Titrasi |
| **Sprint 5** | Penyempurnaan | Uji keterbacaan materi | Kuis Modul 2 & 3, pohon kesalahan F7 | F8 Progres lokal, perbaikan tampilan |

Jika satu sprint belum selesai, sisa pekerjaan dipindah ke sprint berikutnya. Fitur tambahan hanya dikerjakan setelah Sprint 5 stabil.

---

## 5. Baseline

**Dipilih:** beranda Pertemuan 1 milik Ghefira Amelia Aundra.

**Alasan:**
- Sudah berjalan stabil dengan `npm run dev` di `localhost:5173` tanpa error.
- Sudah memiliki fitur Eksplorasi Skala pH Real-Time yang sesuai dengan PRD (fitur F3), sehingga bisa langsung dikembangkan.
- Repo sudah tersedia dan menjadi tempat kerja bersama kelompok.

Beranda anggota lain tetap menjadi portofolio individu Pertemuan 1. Elemen yang menarik dari beranda tersebut dicatat di `BACKLOG.md` untuk diintegrasikan bertahap.

---

## 6. Aturan Kerja Git

1. Setiap anggota memakai akun GitHub sendiri.
2. `main` adalah versi stabil. Semua pekerjaan dimulai dari branch baru.
3. Nama branch: `feat/nama-tugas` untuk fitur, `docs/nama-tugas` untuk dokumen, `fix/nama-tugas` untuk perbaikan.
   Contoh: `feat/maziatul-modul-1-content`, `feat/khoirina-contoh-sumber`, `feat/ghefira-navigation`.
4. Satu PR untuk satu tugas, jangan menggabungkan banyak perubahan sekaligus.
5. Dilarang `git push --force` dan dilarang meng-commit file `.env`, API key, atau data pribadi.
6. Sebelum mulai bekerja, selalu jalankan `git checkout main` lalu `git pull main main`.

---

## 7. Aturan Review

| PR dibuat oleh | Ditinjau oleh | Fokus review |
|---|---|---|
| Maziatul | Khoirina | Kebenaran konsep kimia dan kesesuaian dengan sumber |
| Khoirina | Maziatul | Ketepatan rumus, satuan, dan langkah perhitungan |
| Ghefira (konten Modul 3) | Maziatul | Kebenaran konsep titrasi dan kesesuaian dengan sumber |
| Ghefira (kode) | Maziatul atau Khoirina | Aplikasi berjalan tanpa error dan tampilan tidak rusak |

- PR baru boleh di-merge setelah minimal **satu Approve** dari anggota lain.
- Merge dilakukan oleh Ghefira sebagai pemilik repo.
- Konflik merge diselesaikan bersama penulis kode terkait, tidak memakai "Accept All" tanpa dibaca.

---

## 8. Komunikasi

- Koordinasi harian lewat grup chat kelompok.
- Setiap kali membuka PR, kabari peninjau di grup.
- Jika menemukan kesalahan kimia di kode atau dokumen, tulis sebagai komentar di PR atau buka *Issue* di GitHub.

---

## 9. Penggunaan AI

- AI agent mengikuti aturan di `docs/AGENT.md`.
- Setiap anggota mencatat prompt penting, peran AI, dan hasil verifikasinya di `AI_LOG.md`.
- Semua rumus, angka, dan istilah kimia dari AI wajib dicek manusia sebelum di-commit.
