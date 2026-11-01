# USER_FLOW.md — Perjalanan Belajar Siswa

> Menggambarkan langkah siswa saat memakai ChemiVerse, dari beranda sampai evaluasi.
> Mengikuti `docs/PRD.md` (fitur F1–F8) dan `docs/BACKLOG.md`.

---

## 1. Alur Utama

```
Beranda
  └─► Pilih Modul (1 / 2 / 3)
        └─► Tujuan Belajar
              └─► Apersepsi (masalah pemantik)
                    └─► Konsep Inti (sub-materi berurutan)
                          └─► Representasi + Aktivitas Interaktif
                                └─► Contoh Soal
                                      └─► Ringkasan
                                            └─► Kuis
                                                  └─► Modul selesai → kembali ke Beranda / lanjut modul berikutnya
```

---

## 2. Tiga Pertanyaan Kunci

### 2.1 Apa yang pertama kali dilihat siswa?

**Di beranda:**
- Judul "ChemiVerse: Asam Basa Interactive Lab" dan satu kalimat tujuan media.
- Tiga kartu modul berurutan: Modul 1 Teori Asam Basa, Modul 2 Kekuatan Asam Basa & pH, Modul 3 Titrasi Asam Basa.
- Kartu yang belum tersedia diberi label "Segera hadir" dan tidak bisa diklik.
- Akses cepat ke Eksplorasi Skala pH (F3).

**Di halaman modul:**
- Judul modul dan tujuan belajar langsung tampak di bagian atas.
- Tepat di bawahnya ada apersepsi berupa masalah sehari-hari, sehingga siswa tahu mengapa materi ini penting.

### 2.2 Apa tindakan belajar berikutnya?

- Setiap bagian diakhiri tombol **"Lanjut"** menuju bagian berikutnya.
- Ada daftar isi kecil di atas halaman agar siswa bisa melompat ke bagian tertentu.
- Tombol **"Kembali ke Beranda"** selalu tersedia.
- Di bagian representasi, siswa diajak mencoba aktivitas interaktif sebelum lanjut ke contoh soal.

### 2.3 Bagaimana siswa tahu sudah selesai?

- Bagian **Ringkasan** berisi poin-poin inti modul.
- **Kuis** memberi skor dan umpan balik per soal (mulai Pertemuan 03).
- Setelah kuis, muncul pesan "Modul selesai" dan kartu modul di beranda diberi tanda centang ✅ (disimpan dengan F8).

---

## 3. Alur Modul 1 — Teori Asam Basa (MVP Pertemuan 02)

| Urutan | Bagian | Yang dilihat / dilakukan siswa |
|---|---|---|
| 1 | Tujuan Belajar | Membaca 3–4 kompetensi yang akan dikuasai |
| 2 | Apersepsi | Membaca masalah pemantik sehari-hari dan memikirkan jawabannya |
| 3 | Konsep: Teori Arrhenius | Membaca definisi, contoh reaksi ionisasi, dan keterbatasannya |
| 4 | Konsep: Teori Brønsted-Lowry | Membaca definisi, pasangan asam–basa konjugasi, dan spesi amfiprotik |
| 5 | Konsep: Teori Lewis | Membaca definisi donor–akseptor PEB dan contoh reaksi tanpa H⁺ |
| 6 | Representasi | Melihat perbandingan makroskopis, submikroskopis, dan simbolik |
| 7 | Contoh Soal | Mengikuti langkah penyelesaian menentukan asam, basa, dan konjugasinya |
| 8 | Ringkasan | Membaca tabel perbandingan ketiga teori |
| 9 | Sumber Pustaka | Melihat daftar rujukan |
| 10 | Kuis | *(Pertemuan 03)* |

---

## 4. Alur Fitur Interaktif (Sprint Berikutnya)

### F2 Sandbox Teori (Modul 1)
Pilih reaksi → seret H⁺ atau panah PEB → jika benar, label asam/basa/konjugasi muncul → jika salah, muncul umpan balik penjelas → coba reaksi berikutnya.

### F5 Kalkulator pH (Modul 2)
Pilih jenis larutan → isi konsentrasi (dan Ka/Kb untuk zat lemah) → klik "Hitung" → lihat langkah perhitungan → lihat posisi pH pada skala → coba ubah nilai.

### F6 Praktikum Titrasi (Modul 3)
Persiapan (pilih titran, titrat, indikator) → teteskan titran dari buret → amati warna dan kurva → catat volume di tabel pengamatan → hitung konsentrasi titrat → refleksi titik akhir vs titik ekuivalen.

### F7 Kuis
Jawab soal → jika benar, lanjut → jika salah, jawab pertanyaan penuntun untuk menemukan letak kesalahan → coba lagi → skor akhir.

---

## 5. Peta Halaman

| Halaman | Berisi | Status |
|---|---|---|
| Beranda | Judul, kartu 3 modul, akses Eksplorasi pH | Ada (baseline) |
| Eksplorasi Skala pH | F3 | Ada (baseline) |
| Modul 1 | Alur Bagian 3 | Pertemuan 02 |
| Modul 2 | Materi + F3, F4, F5 | Sprint 3 |
| Modul 3 | Materi + F6 | Sprint 4 |
