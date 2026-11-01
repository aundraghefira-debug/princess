# PRD — ChemiVerse: Asam Basa Interactive Lab

> Versi 2 · Revisi Pertemuan 02 · Status: Final

---

## 1. Identitas Produk

| Item | Isi |
|---|---|
| Nama media | ChemiVerse: Asam Basa Interactive Lab |
| Jenis | Web pembelajaran interaktif (React + Vite + TypeScript), tanpa login |
| Materi | Asam dan Basa |
| Jenjang | SMA Kelas XI (Fase F, Kurikulum Merdeka) |
| Perangkat utama | Laptop / PC; tetap terbaca di tablet |

---

## 2. Target Pengguna

**Pengguna utama:** siswa SMA kelas XI (usia ±16–17 tahun) yang sedang mempelajari bab asam basa.

Karakteristik:
- Lebih mudah paham lewat visual dan aktivitas langsung (visual-kinestetik).
- Sering cemas saat bertemu logaritma dalam perhitungan pH (*math anxiety*).
- Kesulitan membayangkan apa yang terjadi pada partikel di dalam larutan.

**Pengguna pendukung:** guru kimia, sebagai pemandu aktivitas di kelas.

---

## 3. Masalah Belajar yang Diselesaikan

| Kode | Masalah | Gejala pada siswa |
|---|---|---|
| **M1** | Tiga level representasi (Johnstone) tidak terhubung | Siswa hafal rumus pH dan warna indikator, tetapi tidak bisa menjelaskan apa yang terjadi pada ion di dalam air. |
| **M2** | Kesulitan membedakan teori asam basa | Bingung membedakan Arrhenius, Brønsted-Lowry, dan Lewis; sulit menentukan pasangan konjugasi dan spesi amfiprotik (contoh: HCO₃⁻, H₂O). |
| **M3** | *Logarithmic blind spot* | Tidak paham bahwa selisih 1 satuan pH berarti perbedaan [H⁺] sebesar 10 kali. |
| **M4** | Asam/basa kuat vs lemah | Menyamakan "kuat" dengan "pekat"; tidak paham derajat ionisasi (α) dan peran Ka/Kb. |
| **M5** | Titrasi hanya prosedural | Bisa mengikuti langkah praktikum, tetapi tidak paham titik ekuivalen, titik akhir, dan alasan pemilihan indikator. |

Setiap fitur di bawah menyebutkan kode masalah yang diselesaikannya.

---

## 4. Ruang Lingkup Materi

| Modul | Topik | Sub-materi |
|---|---|---|
| **Modul 1** | Teori Asam Basa | Arrhenius · Brønsted-Lowry (pasangan konjugasi, amfiprotik) · Lewis (donor–akseptor PEB) |
| **Modul 2** | Kekuatan Asam Basa & pH | Kesetimbangan air (Kw) · pH dan pOH · asam/basa kuat · asam/basa lemah (Ka, Kb, α) · indikator asam basa |
| **Modul 3** | Titrasi Asam Basa | Prosedur titrasi · kurva titrasi · titik ekuivalen vs titik akhir · pemilihan indikator · menghitung konsentrasi titrat |

**Batasan:** larutan penyangga dan hidrolisis garam diperlakukan sebagai bab terpisah dan **tidak** dibahas sebagai materi tersendiri. Di Modul 3, titrasi asam lemah–basa kuat hanya ditampilkan bentuk kurvanya (titik ekuivalen di atas pH 7) tanpa penurunan rumus penyangga.

---

## 5. Fitur Inti

### F1. Halaman Modul Materi
**Menyelesaikan:** M1, M2, M4
Setiap modul memiliki: tujuan belajar → apersepsi (masalah kontekstual) → konsep inti → representasi (makro/submikro/simbolik) → contoh soal → sumber pustaka.
Konten disimpan terpisah di `src/data/chemData.ts`, bukan di dalam komponen.

### F2. Sandbox Teori Asam Basa (Modul 1)
**Menyelesaikan:** M2
- Brønsted-Lowry: siswa menyeret H⁺ dari donor ke akseptor; label "asam", "basa", "asam konjugasi", "basa konjugasi" muncul setelah tarikan benar.
- Lewis: siswa menarik panah PEB dari donor ke akseptor.
- Tarikan salah → umpan balik singkat yang menjelaskan *mengapa* salah.

### F3. Eksplorasi Skala pH Real-Time (Modul 2)
**Menyelesaikan:** M3
**Status:** sudah tersedia di baseline.
Siswa menggeser nilai pH dan melihat perubahan sifat larutan secara langsung. Pengembangan berikutnya: menampilkan [H⁺] dan [OH⁻] dalam notasi ilmiah serta perbandingan "berapa kali lebih asam/basa" dari pH 7.

### F4. Simulator Mikro–Makro (Modul 2)
**Menyelesaikan:** M1, M4
- Gelas kimia dengan pilihan zat dan slider konsentrasi.
- "Kaca pembesar" menampilkan partikel: asam kuat terion sempurna, asam lemah hanya sebagian (contoh: CH₃COOH ⇌ CH₃COO⁻ + H⁺).
- Di sampingnya: nilai pH, rumus yang dipakai, dan derajat ionisasi (α), ketiganya berubah bersamaan.

### F5. Kalkulator pH Bertahap (Modul 2)
**Menyelesaikan:** M3, M4
- **Input:** jenis larutan (asam kuat / basa kuat / asam lemah / basa lemah), konsentrasi (M), valensi, dan Ka atau Kb untuk zat lemah.
- **Rumus (25 °C):**
  - Asam kuat: [H⁺] = a × Ma
  - Basa kuat: [OH⁻] = b × Mb
  - Asam lemah: [H⁺] = √(Ka × Ma)
  - Basa lemah: [OH⁻] = √(Kb × Mb)
  - pH = −log[H⁺] · pOH = −log[OH⁻] · pH + pOH = 14
- **Output:** langkah perhitungan (rumus yang dipilih → substitusi → [H⁺] atau [OH⁻] → pH/pOH), posisi hasil pada skala pH, dan perbandingan kekuatan terhadap pH 7.
- **Validasi:** menolak input kosong, negatif, atau tidak wajar; memberi peringatan untuk konsentrasi sangat encer (≤ 10⁻⁶ M) karena ionisasi air tidak lagi bisa diabaikan.

### F6. Praktikum Titrasi Virtual (Modul 3)
**Menyelesaikan:** M5, M1
**Jenis titrasi:** asam kuat–basa kuat (utama) dan asam lemah–basa kuat (perbandingan kurva).
Alur mengikuti praktikum nyata:
1. **Persiapan:** memilih titran, titrat, volume titrat, dan indikator.
2. **Titrasi:** mengatur kran buret (tetes 0,01 mL atau aliran cepat); warna larutan di erlenmeyer berubah sesuai pH dan trayek indikator.
3. **Kurva:** grafik pH vs volume titran digambar titik demi titik.
4. **Pencatatan:** siswa mencatat volume awal dan akhir buret di tabel pengamatan.
5. **Analisis:** siswa menghitung konsentrasi titrat dengan Va × Ma × a = Vb × Mb × b; sistem memeriksa jawabannya.
6. **Refleksi:** perbandingan titik akhir (warna berubah) dengan titik ekuivalen; jika indikator kurang tepat, sistem menjelaskan sebabnya.

**Indikator yang tersedia (trayek pH perkiraan):**

| Indikator | Trayek pH | Warna (asam → basa) |
|---|---|---|
| Metil jingga | 3,1 – 4,4 | merah → kuning |
| Metil merah | 4,4 – 6,2 | merah → kuning |
| Bromtimol biru | 6,0 – 7,6 | kuning → biru |
| Fenolftalein | 8,3 – 10,0 | tak berwarna → merah muda |

### F7. Kuis Adaptif dengan Pohon Kesalahan
**Menyelesaikan:** M3, M4, M5
- Saat jawaban salah, sistem tidak langsung memberi kunci, tetapi bertanya untuk menemukan letak kesalahan (salah memilih rumus / salah operasi logaritma / salah satuan).
- Petunjuk mengarah kembali ke fitur terkait (misalnya membuka F4 atau F5).
- Minimal 5 soal per modul, masing-masing dengan kunci dan pembahasan.

### F8. Penyimpanan Progres Lokal (tanpa login)
**Mendukung semua fitur**
Menggunakan `localStorage` untuk menyimpan modul yang selesai, skor kuis tertinggi, dan posisi terakhir simulator titrasi. Data hanya ada di browser siswa dan bisa hilang jika riwayat browser dihapus.

---

## 6. Fitur Tambahan

| Fitur | Deskripsi | Kode masalah | Prioritas |
|---|---|---|---|
| **Uji pH Benda Sehari-hari** | Siswa memilih benda (cuka, sabun, air jeruk, pasta gigi, dll.), menebak pH-nya, lalu "menguji" dengan kertas lakmus atau indikator universal virtual. | M1, M3 | Nilai tambah |
| **Indikator Alami** | Simulasi ekstrak kubis ungu yang berubah warna pada larutan dengan pH berbeda, sebagai jembatan ke praktikum sederhana di rumah. | M1 | Nilai tambah |
| **Kartu Perbandingan Teori** | Satu reaksi yang sama dilihat dari sudut Arrhenius, Brønsted-Lowry, dan Lewis secara berdampingan. | M2 | Nilai tambah |
| **Pemburu Miskonsepsi** | Pernyataan benar/salah tentang miskonsepsi umum (misalnya "asam kuat pasti pekat"), lengkap dengan penjelasan. | M4 | Nilai tambah |

---

## 7. Prioritas Pengembangan

| Fase | Isi | Target |
|---|---|---|
| **MVP (Pertemuan 02)** | Beranda → navigasi ke Modul 1 · konten Modul 1 lengkap dan bersumber (F1) | Stabil di branch `main` |
| **Sprint berikutnya** | F2 · pengembangan F3 · F5 · kuis Modul 1 (Pertemuan 03) | Bertahap per pertemuan |
| **Pengembangan** | F4 · F6 · F7 lengkap · F8 | Setelah fitur sebelumnya stabil |
| **Jika waktu cukup** | Fitur tambahan (Bagian 6) · ekspor progres ke file `.json` untuk dikirim ke guru · penjelas langkah otomatis untuk reaksi apa pun | Opsional |
| **Di luar lingkup** | Login, database online, deployment domain resmi | Tidak dikerjakan |

---

## 8. Kriteria Selesai

- [x] Target pengguna ditetapkan: SMA kelas XI
- [x] Ruang lingkup materi ditetapkan (penyangga dan hidrolisis di luar lingkup)
- [x] Setiap fitur terhubung ke minimal satu masalah belajar (M1–M5)
- [ ] Rumus, data Ka/Kb, dan trayek indikator dicocokkan dengan buku sumber
- [ ] PRD disetujui seluruh anggota dan dirujuk di `TEAM.md`

---

## 9. Sumber Pustaka Utama

- Buku paket Kimia SMA Kelas XI Kurikulum Merdeka yang digunakan di sekolah sasaran.
- Chang, R. & Goldsby, K. A. *Chemistry*. McGraw-Hill.
- Petrucci, R. H., dkk. *General Chemistry: Principles and Modern Applications*. Pearson.

---

## 10. Dokumen Terkait

`TEAM.md` · `BACKLOG.md` · `USER_FLOW.md` · `DESAIN_TEKNIS.md` · `AI_LOG.md`
