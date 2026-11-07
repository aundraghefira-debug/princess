# ATURAN KERJA PENGEMBANGAN (AGENT.md)

Dokumen ini adalah instruksi wajib bagi AI agent dan anggota tim yang mengembangkan web pembelajaran kimia "ChemiVerse: Asam Basa Interactive Lab". Setiap aturan ditulis agar bisa diperiksa dengan jawaban Ya/Tidak.

---

## 00 Cara Kerja Agent

* **Baca dulu:** Sebelum mengubah kode, baca `docs/PRD.md`, `docs/TEAM.md`, `docs/USER_FLOW.md`, dan `docs/DESAIN_TEKNIS.md`.
* **Batasi perubahan:** Ubah hanya file yang relevan dengan tugas yang diminta. Jangan merapikan, mengganti nama, atau memindahkan file lain tanpa diminta.
* **Konfigurasi terkunci:** Jangan mengubah `package.json`, `vite.config.ts`, `tsconfig*.json`, atau `.gitignore`, dan jangan menambah library baru tanpa persetujuan tim.
* **Tanpa Git otomatis:** Jangan membuat commit, push, merge, atau `git push --force`. Mahasiswa yang menguji dan membuat commit.
* **Laporan wajib:** Setiap selesai bekerja, jelaskan (1) file yang berubah, (2) langkah menguji di browser, dan (3) isi kimia (rumus, angka, istilah) yang harus diperiksa manusia.
* **Pencatatan:** Peran AI, prompt utama, dan hasil verifikasi dicatat oleh mahasiswa di `AI_LOG.md`.

## 01 Teknologi (React + Vite + TypeScript)

* **Komponen:** Wajib *Functional Component* dengan React Hooks (`useState`, `useEffect`, `useMemo`, `useRef`). Dilarang memakai *Class Component*.
* **TypeScript:** Semua komponen berekstensi `.tsx`, semua data/logika berekstensi `.ts`. Hindari tipe `any`; buat `interface` atau `type` untuk data materi.
* **Styling:** Gunakan file CSS per komponen atau `App.css`. Tata letak tidak boleh rusak atau memunculkan scroll horizontal pada lebar layar 360px hingga 1440px.

## 02 Penyimpanan (LocalStorage & Privasi)

* **Kontrak:** Struktur penyimpanan mengikuti `docs/DATABASE.md`. Jangan membuat struktur sendiri.
* **Satu pintu:** Semua akses `localStorage` hanya melalui `src/lib/localStore.ts`.
* **Dilarang** memakai `localStorage.clear()`.
* **Tanpa server:** Pertemuan 03 tidak mengirim data ke server luar.

## 03 Struktur Folder

```
src/
├── data/
│   └── chemData.ts            # Seluruh teks materi, rumus, data Ka/Kb, indikator, soal, sumber
├── utils/
│   ├── phCalc.ts              # Fungsi perhitungan pH (murni, tanpa tampilan)
│   └── titrationEngine.ts     # F6  Mesin pH titrasi (murni, tanpa tampilan)
├── components/
│   ├── ModulDetail.tsx        # F1  Halaman modul materi
│   ├── TheoryMatrix.tsx       # F2  Drag-and-drop teori asam basa
│   ├── PhExplorer.tsx         # F3  Eksplorasi skala pH real-time
│   ├── MicroMacroSimulator.tsx# F4  Gelas kimia & kaca pembesar
│   ├── PhCalculator.tsx       # F5  Kalkulator pH bertahap
│   ├── TitrationLab.tsx       # F6  Praktikum titrasi virtual (induk)
│   ├── titration/             # F6  Komponen pendukung titrasi
│   │   ├── Burette.tsx        #     Buret SVG, kran, animasi tetes
│   │   ├── Flask.tsx          #     Erlenmeyer SVG, warna indikator
│   │   ├── TitrationChart.tsx #     Kurva pH vs volume (SVG)
│   │   └── DataTable.tsx      #     Tabel pengamatan
│   └── QuizScaffolding.tsx    # F7  Kuis & pohon kesalahan
├── App.tsx
└── App.css
```

* **Pisahkan konten dari tampilan:** Teks materi, rumus, nilai Ka/Kb, trayek indikator, dan soal **hanya** boleh ditulis di `src/data/chemData.ts`. Komponen hanya membaca data tersebut.
* **File lama:** Komponen yang sudah ada di baseline tidak dipindahkan tanpa persetujuan tim. Komponen baru dibuat di `src/components/`.

## 04 Kebenaran Kimia

* **Dilarang mengarang data:** Agent tidak boleh membuat sendiri nilai Ka, Kb, trayek indikator, atau fakta kimia. Gunakan hanya data yang sudah ada di `chemData.ts`. Jika data belum ada, tulis `// TODO: isi dari buku sumber` dan laporkan.
* **Kondisi standar:** Semua perhitungan mengasumsikan suhu 25 °C (Kw = 1 × 10⁻¹⁴) dan hal ini ditampilkan kepada siswa.
* **Ruang lingkup:** Ikuti Bagian 4 PRD. Larutan penyangga dan hidrolisis garam tidak dibahas sebagai materi tersendiri.

* **Titrasi:** Hanya jenis titrasi yang tercantum di F6 PRD (asam kuat–basa kuat dan asam lemah–basa kuat). Jangan menambah jenis lain tanpa persetujuan tim.

## 05 Bahasa (Indonesia Baku & Komunikatif)

* **Istilah:** Istilah asing diserap secara baku. Contoh: *endpoint* → titik akhir titrasi, *equivalence point* → titik ekuivalen, *burette* → buret, *conjugate base* → basa konjugasi.
* **Pesan error:** Dilarang memakai `alert()` atau menampilkan pesan error bawaan sistem. Tampilkan pesan di dekat kolom input yang bersifat mendidik. Contoh:
    * "Konsentrasi larutan tidak boleh bernilai negatif. Silakan periksa kembali data Anda."
    * "Nilai Ka diperlukan untuk menghitung pH asam lemah."
* **Sapaan:** Gunakan "kamu" secara konsisten untuk menyapa siswa.

## 06 Notasi Ilmiah

* **Rumus kimia:** Dilarang menulis rumus kimia sebagai teks datar (H2SO4, H+). Di tampilan siswa wajib memakai format ilmiah: **H₂SO₄**, **CH₃COOH**, **Ca²⁺**, **H⁺**, **OH⁻**.
* **Kode tetap ASCII:** Nama variabel, fungsi, dan key data tetap memakai huruf biasa (contoh: `ka`, `h_plus`). Format ilmiah hanya untuk teks yang dilihat siswa.
* **Eksponen:** Tulis dengan tanda kali dan pangkat: 1 × 10⁻⁵, bukan 1 x 10^-5 atau 1e-5.
* **Presisi pH:** Hasil akhir pH/pOH ditampilkan dengan **2 angka di belakang koma**. Pembulatan hanya dilakukan saat menampilkan, bukan pada perhitungan antara.
* **Format angka:** Tampilan memakai koma desimal sesuai kaidah Indonesia (contoh: pH 4,74; 0,01 mL), menggunakan `toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })`.

## 07 Simulasi Titrasi (F6)

* **Mesin terpisah:** Semua perhitungan pH titrasi hanya di `src/utils/titrationEngine.ts`. Komponen tampilan dilarang menghitung pH sendiri dan hanya memanggil mesin ini. Fungsi ini murni (tanpa efek samping dan tanpa tampilan).
* **Metode:** Pakai persamaan kesetimbangan muatan yang dipecahkan secara numerik (bisection pada skala log₁₀[H⁺]), bukan rumus pendekatan per daerah, supaya hasilnya tetap akurat di dekat titik ekuivalen. Rinciannya ada di `docs/DESAIN_TEKNIS.md`.
* **Sumber data:** Nilai Ka, Kb, trayek indikator, dan warna indikator dibaca dari `src/data/chemData.ts`. Jika belum ada, tulis `// TODO: isi dari buku sumber` dan laporkan. Jangan mengarang.
* **Tanpa library baru:** Kurva dan animasi digambar dengan SVG dan CSS. Jika dirasa perlu library grafik, ajukan ke tim dulu.
* **Warna indikator:** Warna larutan berubah bertahap (interpolasi) di dalam trayek pH, bukan berganti mendadak.
* **Nilai acuan:** Hasil mesin harus cocok dengan nilai acuan di `docs/DESAIN_TEKNIS.md` (toleransi ±0,02). Agen wajib mencantumkan hasil pemeriksaan ini di "Laporan wajib":
  * HCl 0,1 M (25 mL) + NaOH 0,1 M: pH awal 1,00 · pH pada 24,90 mL 3,70 · pH pada 25,00 mL 7,00 · pH pada 25,10 mL 10,30
  * CH₃COOH 0,1 M (25 mL) + NaOH 0,1 M: pH awal 2,87 · pH pada 12,50 mL 4,74 · pH pada 25,00 mL 8,72
* **Tampilan angka:** Volume ditulis dengan koma desimal dan satuan (contoh: 24,90 mL). Ketelitian buret 0,01 mL. Pembulatan pH hanya saat ditampilkan, sesuai Bagian 06.
* **Pesan untuk siswa:** Gunakan "kamu" dan pesan mendidik, tanpa `alert()`. Contoh: "Indikator ini berubah warna jauh sebelum titik ekuivalen. Coba bandingkan trayek pH-nya dengan pH titik ekuivalen pada kurva."
* **Mode Soal Acak:** Konsentrasi titrat disembunyikan dan diacak setiap sesi. Jawaban siswa diperiksa dengan toleransi yang ditetapkan di `DESAIN_TEKNIS.md`.
* **Penyimpanan:** Posisi terakhir simulator disimpan lewat `src/lib/localStore.ts` sesuai `docs/DATABASE.md`. Ekspor CSV bukan bagian versi ini (lihat PRD Bagian 7).