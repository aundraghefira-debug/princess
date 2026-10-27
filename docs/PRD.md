PRD_MD

# PRD - Web Pembelajaran Kimia Asam Basa

## ## Identitas
* Nama media: ChemiVerse: Asam Basa Interactive Lab
* Target pengguna: Mahasiswa Kimia Dasar tahun pertama & Siswa SMA Kelas XI yang memiliki gaya belajar visual-kinestetik serta membutuhkan visualisasi konsep abstrak.
* Masalah belajar: 
  1. Miskonsepsi Tiga Tingkat Johnstone: Siswa gagal menghubungkan fenomena makroskopis (perubahan warna indikator) dengan tingkat simbolik (rumus matematika pH) dan tingkat sub-mikroskopis (perilaku partikel ion di dalam air).
  2. Limbo Teori Brønsted-Lowry & Lewis: Kesulitan mengidentifikasi spesi amfoter/amfiprotik (seperti HCO3-) dan memvisualisasikan transfer pasangan elektron bebas (PEB) pada reaksi non-air.
  3. Logarithmic Blind Spot: Ketidakmampuan mengaitkan skala pH eksponensial secara intuitif (misal: siswa tidak paham bahwa perubahan 1 digit pH berarti kekuatan asam berubah sebesar 10 kali lipat).

## ## Fitur inti
1. Interactive Johnstone’s Triplet Module (Tiga Modul Utama):
   * Modul 1 (Sandbox Ikatan & Transfer Elektron): Kanvas seret-lepas (drag-and-drop) molekul 2D. Siswa secara aktif menarik atom hidrogen (H+) dari molekul asam ke basa (Teori Brønsted-Lowry), atau menarik panah pasangan elektron bebas (PEB) dari donor ke akseptor (Teori Lewis). Sistem secara otomatis mengunci ikatan baru jika tarikan benar, lalu memberikan label animasi "Asam", "Basa", dan "Konjugasi" secara instan.
   * Modul 2 (Micro-Macro Simulator & Zoom Partikel): Simulasi gelas kimia interaktif dengan slider konsentrasi dan jenis zat kimia. Uniknya, terdapat fitur "Kaca Pembesar Virtual" yang jika digeser ke dalam gelas akan membuka jendela zoom-in sub-mikroskopis: menampilkan molekul yang bergerak acak. Jika zat adalah asam kuat, molekul akan pecah 100% saat diklik siswa; jika asam lemah, molekul hanya pecah sebagian (seperti CH3COOH terurai sebagian menjadi CH3COO- dan H+). Di sampingnya, grafik pH dan rumus matematika berubah naik-turun secara real-time mengikuti pergeseran slider.
   * Modul 3 (Gamified Titration Lab with Color Blending): Laboratorium titrasi virtual interaktif. Siswa mengontrol kran buret menggunakan knob putar digital (bisa tetes demi tetes sebesar 0.01 mL atau aliran cepat). Layar menampilkan grafik kurva titrasi yang digambar dinamis titik demi titik. Larutan di dalam erlenmeyer akan mengalami perubahan warna secara gradual (gradasi transisi dari bening, merah muda semu, hingga magenta pekat) menggunakan pencampuran kode warna Hex-RGB asli berdasarkan perhitungan rumus pH larutan penyangga dan hidrolisis garam yang sedang terjadi.
2. Kuis Adaptif dengan Scaffolding Error-Tree:
   * Kuis interaktif berbasis grafik atau pilihan ganda. Ketika siswa salah menghitung pH, sistem tidak langsung menampilkan kunci jawaban. Sistem akan mendeteksi letak kesalahan (apakah salah konsep rumus atau salah operasi logaritma) lewat pertanyaan percabangan (Error-Tree), lalu memberikan hint visual berupa kilasan animasi dari Modul 2 untuk memandu siswa membetulkan jawabannya sendiri secara mandiri.
3. Smart Local Progress Tracker (Zero-Login):
   * Manajemen state aplikasi menggunakan JSON-parsed LocalStorage untuk menyimpan modul yang sudah diselesaikan, skor kuis tertinggi, serta menyimpan checkpoint terakhir dari simulator titrasi (posisi volume buret terakhir), sehingga saat halaman web di-refresh, siswa dapat melanjutkan eksperimennya tanpa kehilangan data atau terpaksa melakukan registrasi akun.

## ## Jika waktu cukup
1. AI-Powered Formula Step Solver: Kolom input di mana pengguna bisa memasukkan reaksi asam-basa sembarang, dan sistem akan menjabarkan langkah perhitungan pH-nya secara matematis dan konseptual dari awal sampai akhir.
2. Teacher Dashboard Export: Fitur enkripsi data progres belajar lokal menjadi file teks ringkas (.json) yang bisa diunduh siswa untuk dikirimkan kepada guru sebagai bukti penyelesaian tugas praktikum.

PERTANYAAN PEMANDU
* Siapa siswa Anda? Pelajar usia 16–19 tahun yang mengalami math-anxiety saat bertemu logaritma kimia dan membutuhkan visualisasi molekuler yang interaktif untuk paham.
* Konsep kimia mana yang sulit? Asosiasi tingkat ionisasi asam/basa lemah, penentuan spesi konjugasi pada teori Lewis, serta penentuan titik ekuivalen titrasi yang presisi.
* Aktivitas apa yang membantu? Eksperimen simulasi mandiri yang menghubungkan pergeseran slider parameter kimia langsung dengan visualisasi partikel molekul dan grafik kurva pada layar.

SELESAI JIKA
✓ sasaran pengguna jelas (Siswa SMA XI & Mahasiswa Kimia Dasar tahun pertama)
✓ tiga topik dipilih (Matriks Teori, Micro-Macro pH Simulator, Dynamic Titration)
✓ empat fitur ditulis (Modul Johnstone, Kuis Scaffolding, Simulator Buret, Smart Local Storage)
✓ masalah belajar spesifik (Miskonsepsi Tiga Tingkat Johnstone & Logarithmic Blind Spot)
