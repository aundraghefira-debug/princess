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

## 3A. Alur Modul 3 — Titrasi Asam Basa (Sprint 4)

Tujuan pembelajaran Modul 3 mengacu pada dokumen MODUL.

| Urutan | Bagian | Yang dilihat / dilakukan siswa |
|---|---|---|
| 1 | Tujuan Belajar | Membaca kompetensi yang akan dikuasai |
| 2 | Apersepsi | Membaca masalah pemantik sehari-hari dan memikirkan jawabannya |
| 3 | Konsep: Prinsip dan Prosedur Titrasi | Membaca fungsi buret, titrat, titran, dan indikator |
| 4 | Konsep: Kurva Titrasi dan Titik Ekuivalen | Membaca perbedaan titik ekuivalen dan titik akhir titrasi, serta bentuk kurva |
| 5 | Konsep: Pemilihan Indikator | Membaca hubungan trayek indikator dengan pH titik ekuivalen |
| 6 | Praktikum Titrasi Virtual (F6) | Mengikuti tahap 1–6 pada Bagian 3A.1 |
| 7 | Contoh Soal | Mengikuti langkah menghitung konsentrasi titrat dari volume titran |
| 8 | Ringkasan | Membaca poin inti dan perbandingan kurva titrasi |
| 9 | Sumber Pustaka | Melihat daftar rujukan |
| 10 | Kuis | Mengerjakan kuis Modul 3 (F7) |

Urutan sub-materi (baris 3–5) disesuaikan dengan susunan di dokumen MODUL.

### 3A.1 Alur Praktikum Titrasi Virtual (F6)

| Tahap | Yang dilakukan siswa | Respons sistem |
|---|---|---|
| 1. Prediksi dan persiapan | Memilih jenis titrasi, titrat, titran, dan indikator; mengatur konsentrasi dan volume; menebak bentuk kurva dan pH titik ekuivalen | Menampilkan buret berisi titran dan erlenmeyer berisi titrat; pH awal tampil di pH meter |
| 2. Titrasi | Membuka kran buret (tetes 0,01 mL atau aliran cepat) | Volume buret bertambah; warna larutan berubah bertahap di dalam trayek indikator; pH meter bergerak |
| 3. Kurva | Mengamati grafik pH vs volume terbentuk; menandai perkiraan titik ekuivalen | Menggambar kurva titik demi titik; setelah siswa menandai, menampilkan garis titik ekuivalen dan pita trayek indikator |
| 4. Pencatatan | Mengisi volume awal dan akhir buret di tabel pengamatan | Menampilkan data pH dan warna pada tiap volume |
| 5. Analisis | Menghitung konsentrasi titrat dengan Va × Ma × a = Vb × Mb × b | Memeriksa jawaban; jika salah, memberi petunjuk letak kesalahan, bukan langsung kunci |
| 6. Refleksi | Membandingkan titik akhir (warna berubah) dengan titik ekuivalen; menjawab pertanyaan pemantik | Menjelaskan apakah indikator tepat atau tidak beserta alasannya |

### 3A.2 Kondisi Khusus

| Situasi | Yang terjadi |
|---|---|
| Indikator tidak cocok | Setelah tahap 6, muncul penjelasan yang membandingkan trayek indikator dengan pH titik ekuivalen. Contoh: "Indikator ini berubah warna jauh sebelum titik ekuivalen. Coba bandingkan trayek pH-nya dengan pH titik ekuivalen pada kurva." Siswa bisa mengulang dengan indikator lain tanpa mengatur ulang semua pengaturan |
| Mengubah pengaturan di tengah titrasi | Buret kembali ke 0,00 mL dan riwayat dikosongkan, dengan pesan penjelas |
| Buret hampir habis | Muncul pesan di dekat buret bahwa titran hampir habis, dan siswa diarahkan menekan Reset |
| Masukan tidak valid | Pesan mendidik di dekat kolom yang bermasalah, tanpa `alert()` |
| Mode Soal Acak (opsional) | Konsentrasi titrat disembunyikan dan diacak. Siswa menitrasi, menghitung, lalu memasukkan jawaban. Sistem memberi umpan balik benar atau salah, lalu menawarkan soal baru |
| Keluar di tengah praktikum | Posisi terakhir (jenis titrasi, konsentrasi, volume titran) tersimpan sesuai F8. Saat siswa kembali, ia bisa melanjutkan atau mengulang dari awal |
| Membandingkan dua jenis titrasi | Siswa menjalankan asam kuat–basa kuat, lalu asam lemah–basa kuat, dan membandingkan pH awal, titik ekuivalen, dan bentuk kurva pada tahap refleksi |

## 4. Alur Fitur Interaktif (Sprint Berikutnya)

### F2 Sandbox Teori (Modul 1)
Pilih reaksi → seret H⁺ atau panah PEB → jika benar, label asam/basa/konjugasi muncul → jika salah, muncul umpan balik penjelas → coba reaksi berikutnya.

### F5 Kalkulator pH (Modul 2)
Pilih jenis larutan → isi konsentrasi (dan Ka/Kb untuk zat lemah) → klik "Hitung" → lihat langkah perhitungan → lihat posisi pH pada skala → coba ubah nilai.

### F6 Praktikum Titrasi (Modul 3)
Alur lengkapnya ada di Bagian 3A. Ringkasnya: prediksi → persiapan (pilih jenis titrasi, titrat, titran, indikator) → teteskan titran dari buret → amati warna dan kurva → catat volume di tabel pengamatan → hitung konsentrasi titrat → refleksi titik akhir vs titik ekuivalen.

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
| Modul 3 | Materi + F6 (alur Bagian 3A) + kuis F7 | Sprint 4 |
