// src/data/chemData.ts
// ChemiVerse: data materi bersama.
// [MAZIATUL] = diisi Maziatul, [KHOIRINA] = diisi Khoirina, [GHEFIRA] = diisi Ghefira.
// Aturan: jangan ubah nama kolom tanpa kesepakatan. Tulis "PERLU DICEK" pada teks
// yang belum diverifikasi ke buku sumber.

// ---------- TIPE DATA ----------

export type Representasi = {
  makro: string      // yang teramati (warna, rasa, pH meter, daya hantar)
  submikro: string   // yang terjadi pada tingkat partikel
  simbolik: string   // persamaan reaksi dan rumus
}

export type SubMateri = {
  id: string
  judul: string
  isi: string
  keterbatasan?: string          // batas berlakunya teori atau rumus
  representasi: Representasi
}

export type ContohSoal = {       // [KHOIRINA]
  id: string
  soal: string
  langkah: string[]
  jawaban: string
}

export type SoalKuis = {         // [KHOIRINA]
  id: string
  pertanyaan: string
  pilihan: string[]
  kunciIndex: number             // nomor pilihan benar, mulai dari 0
  pembahasan: string
}

export type Modul = {
  id: string
  judul: string
  tujuanBelajar: string[]        // [MAZIATUL] atau [GHEFIRA] untuk Modul 3
  apersepsi: string
  subMateri: SubMateri[]
  contohSoal: ContohSoal[]       // [KHOIRINA]
  soalKuis: SoalKuis[]           // [KHOIRINA], minimal 5 per modul
  sumber: string[]               // [KHOIRINA]
}

// ---------- DATA MODUL ----------

export const modules: Modul[] = [
  // ===== MODUL 1: TEORI ASAM BASA [MAZIATUL] =====
  {
    id: "modul-1",
    judul: "Teori Asam Basa",
    tujuanBelajar: [
      "",   // contoh: "Menjelaskan konsep asam dan basa menurut Arrhenius"
    ],
    apersepsi: "",   // pertanyaan pemantik dari kehidupan sehari-hari
    subMateri: [
      {
        id: "m1-ciri",
        judul: "Ciri-ciri Asam dan Basa",
        isi: "",
        representasi: { makro: "", submikro: "", simbolik: "" },
      },
      {
        id: "m1-arrhenius",
        judul: "Teori Arrhenius",
        // CONTOH FORMAT. Ganti dengan versimu setelah dicek ke buku sumber.
        isi: "Asam adalah zat yang menghasilkan ion H⁺ dalam air. Basa adalah zat yang menghasilkan ion OH⁻ dalam air.",
        keterbatasan: "Hanya berlaku untuk larutan berair dan basa harus memiliki gugus OH. NH₃ tidak dapat dijelaskan secara langsung.",
        representasi: {
          makro: "",
          submikro: "",
          simbolik: "HCl → H⁺ + Cl⁻ ; NaOH → Na⁺ + OH⁻",
        },
      },
      {
        id: "m1-bronsted-lowry",
        judul: "Teori Bronsted-Lowry",
        isi: "",
        keterbatasan: "",
        representasi: { makro: "", submikro: "", simbolik: "" },
      },
      {
        id: "m1-konjugasi",
        judul: "Pasangan Asam Basa Konjugasi",
        isi: "",
        representasi: { makro: "", submikro: "", simbolik: "" },
      },
      {
        id: "m1-lewis",
        judul: "Teori Lewis",
        isi: "",
        keterbatasan: "",
        representasi: { makro: "", submikro: "", simbolik: "" },
      },
      {
        id: "m1-amfiprotik",
        judul: "Zat Amfoter dan Amfiprotik",
        isi: "",
        representasi: { makro: "", submikro: "", simbolik: "" },
      },
    ],
    contohSoal: [],   // [KHOIRINA]
    soalKuis: [],     // [KHOIRINA]
    sumber: [],       // [KHOIRINA]
  },

  // ===== MODUL 2: KEKUATAN ASAM BASA & pH [MAZIATUL] =====
  {
    id: "modul-2",
    judul: "Kekuatan Asam Basa dan pH",
    tujuanBelajar: [""],
    apersepsi: "",
    subMateri: [
      {
        id: "m2-air-kw",
        judul: "Ionisasi Air dan Tetapan Kesetimbangan Air (Kw)",
        isi: "",
        representasi: { makro: "", submikro: "", simbolik: "" },
      },
      {
        id: "m2-ph-poh",
        judul: "pH dan pOH",
        isi: "",
        representasi: { makro: "", submikro: "", simbolik: "" },
      },
      {
        id: "m2-kuat",
        judul: "Asam Kuat dan Basa Kuat",
        isi: "",
        representasi: { makro: "", submikro: "", simbolik: "" },
      },
      {
        id: "m2-lemah",
        judul: "Asam Lemah dan Basa Lemah (Ka, Kb, Derajat Ionisasi)",
        isi: "",
        keterbatasan: "",   // kapan rumus pendekatan boleh dipakai
        representasi: { makro: "", submikro: "", simbolik: "" },
      },
      {
        id: "m2-ka-kb",
        judul: "Hubungan Ka dan Kb Pasangan Konjugasi",
        isi: "",
        representasi: { makro: "", submikro: "", simbolik: "" },
      },
    ],
    contohSoal: [],   // [KHOIRINA]
    soalKuis: [],     // [KHOIRINA]
    sumber: [],       // [KHOIRINA]
  },

  // ===== MODUL 3: TITRASI ASAM BASA [GHEFIRA] =====
  {
    id: "modul-3",
    judul: "Titrasi Asam Basa",
    tujuanBelajar: [""],
    apersepsi: "",
    subMateri: [],
    contohSoal: [],
    soalKuis: [],
    sumber: [],
  },
]

// ---------- DATA F2: SANDBOX TEORI ASAM BASA [MAZIATUL] ----------
// Pindahkan ke file terpisah hanya jika Ghefira meminta.

export type PeranTeori = "asam" | "basa" | "bukan"

export type ReaksiSandbox = {
  id: string
  persamaan: string
  zat: {
    rumus: string
    arrhenius: PeranTeori
    bronstedLowry: PeranTeori
    lewis: PeranTeori
  }[]
  pasanganKonjugasi?: [string, string][]   // contoh: [["HCl", "Cl⁻"], ["H₂O", "H₃O⁺"]]
  umpanBalik: {
    benar: string
    salahUmum1: string
    salahUmum2: string
  }
  tingkat: "mudah" | "sedang" | "sulit"
}

export const reaksiSandbox: ReaksiSandbox[] = []

// ---------- DATA F4: SIMULATOR MIKRO-MAKRO [MAZIATUL] ----------

export type ZatSimulator = {
  id: string
  rumus: string
  nama: string
  jenis: "asam-kuat" | "basa-kuat" | "asam-lemah" | "basa-lemah"
  tetapan: number | null     // Ka atau Kb, isi dari sumber yang disepakati dengan Khoirina
  sumberTetapan: string      // nama buku dan halaman, kosong jika belum ada
  konsentrasiMin: number     // mol/L
  konsentrasiMax: number     // mol/L
  langkah: number            // kelipatan slider, mol/L
}

export const zatSimulator: ZatSimulator[] = []