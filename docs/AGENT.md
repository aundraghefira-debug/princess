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

* **Key:** Progres belajar disimpan di `localStorage` dengan key `_chemiverse_user_state` sebagai string JSON.
* **Struktur objek:**
    ```json
    {
      "version": 1,
      "completed_modules": ["modul_1", "modul_2"],
      "quiz_high_scores": { "quiz_1": 90, "quiz_2": 0 },
      "titration_checkpoint": {
        "titrant": "NaOH",
        "analyte": "HCl",
        "indicator": "fenolftalein",
        "v_buret_used": 15.4
      }
    }
    ```
* **Aman dari error:** Semua baca/tulis `localStorage` dibungkus `try/catch`. Jika data kosong, rusak, atau `version` berbeda, aplikasi kembali ke data awal tanpa crash.
* **Tanpa server:** Tidak ada pengiriman data siswa ke server luar. Semua perhitungan kimia diproses 100% di sisi klien.

## 03 Struktur Folder

```
src/
├── data/
│   └── chemData.ts            # Seluruh teks materi, rumus, data Ka/Kb, indikator, soal, sumber
├── utils/
│   └── phCalc.ts              # Fungsi perhitungan pH (murni, tanpa tampilan)
├── components/
│   ├── ModulDetail.tsx        # F1  Halaman modul materi
│   ├── TheoryMatrix.tsx       # F2  Drag-and-drop teori asam basa
│   ├── PhExplorer.tsx         # F3  Eksplorasi skala pH real-time
│   ├── MicroMacroSimulator.tsx# F4  Gelas kimia & kaca pembesar
│   ├── PhCalculator.tsx       # F5  Kalkulator pH bertahap
│   ├── TitrationLab.tsx       # F6  Praktikum titrasi virtual
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
