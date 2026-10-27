# ATURAN KERJA PENGEMBANGAN (AGENT.md)

Dokumen ini adalah instruksi mutlak bagi proses pengembangan kode web pembelajaran kimia "ChemiVerse". Aturan di bawah ini dibuat agar hasil inspeksi kode dapat diverifikasi secara biner (Ya/Tidak) sesuai standar praktikum.

---

## 01 Teknologi (React + Vite & Functional Component)
*   **Arsitektur Komponen:** Wajib menggunakan *Functional Components* dengan React Hooks (`useState`, `useEffect`, `useMemo`, `useRef`). Dilarang keras menggunakan *Class Components*.
*   **Styling:** Interface harus menggunakan file CSS yang terstruktur untuk menjamin responsivitas tata letak (layout mobile-friendly minimal lebar 360px).

## 02 Penyimpanan (LocalStorage & Anonimitas Data)
*   **Skema Data:** Data progres belajar disimpan dalam `localStorage` menggunakan key utama `_chemiverse_user_state` dalam format string JSON.
*   **Struktur Objek JSON:** Wajib mengikuti format berikut:
    ```json
    {
      "completed_modules": ["modul_1", "modul_2"],
      "quiz_high_scores": { "quiz_1": 90, "quiz_2": 0 },
      "titration_checkpoint": { "v_buret_left": 15.4 }
    }
    ```
*   **Zero-Server Privacy:** Tidak boleh ada pengiriman data siswa ke server luar. Semua kalkulasi matematika pH (-log[H+]) wajib diproses 100% di sisi klien (*client-side*).

## 03 Struktur (Modul & Tata Letak Folder)
*   Semua file komponen utama untuk fitur materi asam basa wajib diletakkan langsung di dalam struktur folder **`src/`** Anda. Komponen tersebut meliputi:
    *   `src/TheoryMatrix.tsx` (Kanvas Drag-and-Drop Teori Asam Basa)
    *   `src/MicroMacroSimulator.tsx` (Simulator Gelas Kimia & Kaca Pembesar)
    *   `src/TitrationLab.tsx` (Buret Digital & Simulasi Perubahan Warna)
    *   `src/QuizScaffolding.tsx` (Sistem Soal & Logika Umpan Balik)

## 04 Bahasa (Indonesia Baku & Komunikatif)
*   **Sistem Istilah:** Istilah kimia asing wajib diserap secara baku. Contoh: *Buffer* ditulis menjadi Larutan Penyangga, *Endpoint* ditulis menjadi Titik Akhir Titrasi.
*   **Pesan Eror:** Alert eror harus bersifat mendidik dan membantu siswa. Dilarang memunculkan teks eror bawaan sistem. Wajib diganti dengan pesan edukatif: *"Konsentrasi larutan tidak boleh bernilai negatif. Silakan periksa kembali data Anda."*

## 05 Notasi (Format Ilmiah Rumus Kimia)
*   **Format Rumus Kimia:** Dilarang menulis rumus kimia sebagai teks biasa biasa (seperti H2SO4 atau H+). Semua representasi rumus kimia wajib menggunakan format teks ilmiah yang benar (contoh: **H₂SO₄**, **CH₃COOH**, **Ca²⁺**, **H⁺**, **OH⁻**).
*   **Aturan Presisi Kalkulator pH:**
    *   Tetapan eksponensial seperti Ka = 10⁻⁵ harus ditulis menggunakan notasi matematika yang rapi (10⁻⁵ atau 1 x 10⁻⁵).
    *   Hasil akhir penghitungan pH pada simulator wajib dibatasi maksimal **2 angka di belakang koma** (menggunakan fungsi `.toFixed(2)`) untuk menyesuaikan standar ketelitian alat pH meter asli.
