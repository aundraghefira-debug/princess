// src/data/chemData.ts
// ChemiVerse: Data materi bersama sesuai DESAIN_TEKNIS.md Bagian 5 dan TUGAS_MAZIATUL.md

// ---------- TIPE DATA (DESAIN_TEKNIS.md Bagian 5) ----------

export interface Representasi {
  makroskopis: string;
  submikroskopis: string;
  simbolik: string;
}

export interface SubMateri {
  id: string;
  judul: string;
  isi: string[];               // paragraf-paragraf penjelasan
  persamaanReaksi?: string[];  // contoh: "HCl(aq) → H⁺(aq) + Cl⁻(aq)"
  representasi?: Representasi;
  keterbatasan?: string;       // batas berlakunya teori atau rumus
}

export interface ContohSoal {
  id?: string;
  soal: string;
  langkah: string[];
  jawaban: string;
}

export interface Sumber {
  penulis: string;
  tahun: string;
  judul: string;
  penerbit: string;
  halaman?: string;
}

export interface Modul {
  id: 'modul_1' | 'modul_2' | 'modul_3';
  judul: string;
  tersedia: boolean;           // false → kartu berlabel "Segera hadir"
  tujuan: string[];
  tujuanBelajar?: string[];    // alias kompatibilitas komponen
  apersepsi: {
    judul: string;
    cerita: string;
    pertanyaan: string[];
    kaitan: string;
  };
  subMateri: SubMateri[];
  contohSoal: ContohSoal[];
  ringkasan: string[];
  sumber: Sumber[];
}

// Data tambahan (sprint berikutnya sesuai DESAIN_TEKNIS.md Bagian 5)
export interface Zat {
  id: string;
  nama: string;          // "Asam asetat"
  rumus: string;         // "CH₃COOH"
  jenis: 'asam_kuat' | 'basa_kuat' | 'asam_lemah' | 'basa_lemah';
  valensi: number;
  ka?: number;           // dari buku sumber
  kb?: number;           // dari buku sumber
}

export interface Indikator {
  id: string;
  nama: string;
  trayekBawah: number;
  trayekAtas: number;
  warnaAsam: string;     // kode hex
  warnaBasa: string;     // kode hex
}

// Kompatibilitas global
declare global {
  interface Array<T> {
    trim(): string;
  }
}

// Polyfill trim array untuk kompatibilitas pemanggilan sub.isi.trim() di ModulDetail.tsx
if (typeof (Array.prototype as unknown as { trim?: () => string }).trim !== 'function') {
  Object.defineProperty(Array.prototype, 'trim', {
    value: function (this: unknown[]) {
      return this.filter(Boolean).join('\n\n').trim();
    },
    configurable: true,
    writable: true,
  });
}

// ---------- DAFTAR MODUL ----------

export const daftarModul: Modul[] = [
  // =========================================================================
  // MODUL 1: TEORI ASAM BASA
  // =========================================================================
  {
    id: 'modul_1',
    judul: 'Modul 1: Teori Asam Basa',
    tersedia: true,
    tujuan: [
      'Peserta didik dapat menjelaskan konsep asam-basa menurut teori Arrhenius',
      'Peserta didik dapat menjelaskan konsep asam-basa menurut teori Brønsted-Lowry',
      'Peserta didik dapat menjelaskan konsep asam-basa menurut teori Lewis',
      'Peserta didik dapat menghubungkan karakteristik asam-basa di kehidupan sehari-hari dengan konsep teori asam-basa',
    ],
    tujuanBelajar: [
      'Peserta didik dapat menjelaskan konsep asam-basa menurut teori Arrhenius',
      'Peserta didik dapat menjelaskan konsep asam-basa menurut teori Brønsted-Lowry',
      'Peserta didik dapat menjelaskan konsep asam-basa menurut teori Lewis',
      'Peserta didik dapat menghubungkan karakteristik asam-basa di kehidupan sehari-hari dengan konsep teori asam-basa',
    ],
    apersepsi: {
      judul: 'Satu Larutan, Tiga Cara Pandang!',
      cerita:
        'Ketika mempelajari materi Asam-Basa, kita mengetahui bahwa larutan HCl, NaOH, dan NH₃ merupakan contoh larutan asam dan basa. Menariknya, larutan NH₃ bersifat basa meskipun dalam larutannya tidak melepaskan ion OH⁻ (konsep basa menurut Arrhenius). Lalu bagaimanakah para ilmuwan mengetahui bahwa larutan NH₃ termasuk larutan yang bersifat basa?',
      pertanyaan: [
        'Apakah semua larutan yang bersifat asam melepas ion H⁺ dalam reaksi kimianya dan semua larutan yang bersifat basa melepas ion OH⁻ dalam reaksi kimianya?',
      ],
      kaitan:
        'Mengantarkan peserta didik untuk memahami perkembangan teori asam-basa menurut Arrhenius, Brønsted-Lowry, dan Lewis',
    },
    subMateri: [
      {
        id: 'm1-arrhenius',
        judul: 'Teori Arrhenius',
        isi: [
          'Arrhenius menyatakan bahwa asam merupakan spesi kimia yang menghasilkan ion hidrogen (H⁺) dalam larutan berair. Contohnya adalah asam klorida (HCl) yang mengalami ionisasi dalam air membentuk ion H⁺ dan ion Cl⁻: HCl(g) —(H₂O)→ H⁺(aq) + Cl⁻(aq).',
          'Sedangkan basa merupakan spesi kimia yang menghasilkan ion OH⁻ dalam larutan berair. Contohnya adalah natrium hidroksida yang mengalami disosiasi (pemutusan ikatan ion) saat dilarutkan dalam air membentuk ion natrium (Na⁺) dan ion hidroksida (OH⁻): NaOH(s) —(H₂O)→ Na⁺(aq) + OH⁻(aq).',
          'Model asam-basa menurut Arrhenius menjelaskan bahwa asam dan basa saling menetralkan atau mengalami netralisasi. Sebagai contoh, saat larutan HCl dan NaOH direaksikan, ion H⁺ yang dilepaskan oleh HCl akan berikatan dengan ion OH⁻ yang dilepaskan oleh NaOH untuk menghasilkan air: H⁺(aq) + OH⁻(aq) → H₂O(l).',
          'Teori asam-basa Arrhenius memiliki beberapa batasan. Secara molekuler, ion H⁺ bebas tidak mungkin ada dalam larutan berair, tetapi terikat dengan molekul air di sekitarnya sehingga direpresentasikan sebagai ion hidronium (H₃O⁺). Selain itu, model Arrhenius menganggap bahwa semua basa mengandung ion OH⁻. Pada kenyataannya, terdapat senyawa yang bersifat basa tetapi tidak mengandung ion OH⁻, contohnya amonia (NH₃).',
        ],
        persamaanReaksi: [
          'HCl(g) —(H₂O)→ H⁺(aq) + Cl⁻(aq)',
          'NaOH(s) —(H₂O)→ Na⁺(aq) + OH⁻(aq)',
          'H⁺(aq) + OH⁻(aq) → H₂O(l)',
        ],
        representasi: {
          makroskopis:
            'Larutan yang bersifat asam seperti HCl dapat mengubah kertas lakmus biru menjadi merah. Larutan yang bersifat basa seperti NaOH dapat mengubah kertas lakmus merah menjadi biru. Reaksi netralisasi antara larutan HCl dan NaOH menghasilkan air (H₂O) dan garam natrium klorida (NaCl). Larutan asam dan basa dapat menghantarkan listrik karena mengandung ion-ion yang bergerak bebas.',
          submikroskopis:
            'Asam merupakan spesi kimia yang menghasilkan ion H⁺ dalam air. Basa merupakan spesi kimia yang menghasilkan ion OH⁻ dalam air. Saat gas HCl dilarutkan dalam air, HCl terionisasi menjadi ion H⁺ dan Cl⁻. Saat padatan NaOH dilarutkan dalam air, NaOH terdisosiasi menjadi ion Na⁺ dan OH⁻. Pada reaksi netralisasi HCl dan NaOH, ion H⁺ dari HCl bereaksi dengan ion OH⁻ dari NaOH membentuk molekul air.',
          simbolik:
            'Ionisasi asam (HCl):\nHCl(g) —(H₂O)→ H⁺(aq) + Cl⁻(aq)\n\nDisosiasi basa (NaOH):\nNaOH(s) —(H₂O)→ Na⁺(aq) + OH⁻(aq)\n\nReaksi netralisasi asam basa:\nPersamaan molekuler : HCl(aq) + NaOH(aq) → NaCl(aq) + H₂O(l)\nPersamaan ionik     : H⁺(aq) + OH⁻(aq) → H₂O(l)',
        },
      },
      {
        id: 'm1-bronsted-lowry',
        judul: 'Teori Brønsted-Lowry',
        isi: [
          'Dikarenakan terdapat keterbatasan pada teori Arrhenius, J. N. Brønsted dan T. M. Lowry mengusulkan teori baru yang dikenal dengan teori asam-basa Brønsted-Lowry. Dalam teori ini, asam didefinisikan sebagai spesi kimia yang dapat mendonorkan ion H⁺ kepada spesi kimia lain, sedangkan basa didefinisikan sebagai spesi kimia yang dapat menerima ion H⁺ dari spesi kimia lain. Contohnya, ketika HCl dilarutkan ke dalam air akan dihasilkan ion hidronium (H₃O⁺) dan ion klorida (Cl⁻): HCl(g) + H₂O(l) → H₃O⁺(aq) + Cl⁻(aq). Molekul air (H₂O) pada reaksi tersebut bertindak sebagai basa Brønsted-Lowry karena menerima ion H⁺ dari HCl.',
          'Sedangkan ketika amonia dilarutkan ke dalam air, akan dihasilkan ion amonium (NH₄⁺) dan ion hidroksida (OH⁻): NH₃(aq) + H₂O(l) ⇌ NH₄⁺(aq) + OH⁻(aq). Air pada persamaan tersebut bertindak sebagai asam karena mendonorkan ion H⁺ kepada molekul NH₃, sedangkan NH₃ bertindak sebagai basa. Ion OH⁻ yang terbentuk merupakan basa konjugasi dari H₂O.',
          'Dalam teori asam-basa Brønsted-Lowry, terdapat istilah asam konjugasi dan basa konjugasi. Asam konjugasi adalah spesi yang terbentuk ketika suatu basa menerima ion H⁺. Basa konjugasi adalah spesi yang terbentuk ketika suatu asam mendonorkan ion H⁺.',
          'Pada reaksi HCl dengan air: HCl(g) + H₂O(l) → H₃O⁺(aq) + Cl⁻(aq), di mana asam: HCl, basa: H₂O, asam konjugasi: H₃O⁺, dan basa konjugasi: Cl⁻. Dalam air, asam HCl bereaksi membentuk basa konjugasinya (Cl⁻), dan basa H₂O bereaksi membentuk asam konjugasinya (H₃O⁺). Asam dan basa konjugasinya disebut pasangan asam-basa konjugasi (HCl dan Cl⁻), demikian pula basa dan asam konjugasinya (H₂O dan H₃O⁺). Dari persamaan reaksinya dapat dilihat bahwa asam konjugasi memiliki satu ion H⁺ lebih banyak daripada basa asalnya, sedangkan basa konjugasi memiliki satu ion H⁺ lebih sedikit daripada asam asalnya.',
          'Contoh pasangan asam-basa konjugasi lainnya dapat dilihat pada reaksi antara ion bikarbonat dengan ion hidroksida dalam larutan basa: HCO₃⁻(aq) + OH⁻(aq) → CO₃²⁻(aq) + H₂O(l), dengan asam: HCO₃⁻, basa: OH⁻, basa konjugasi: CO₃²⁻, dan asam konjugasi: H₂O. Ion bikarbonat bertindak sebagai asam (mendonorkan 1 ion H⁺) dan menghasilkan basa konjugasinya, sedangkan ion hidroksida bertindak sebagai basa (menerima 1 ion H⁺) dan menghasilkan asam konjugasinya.',
          'Pasangan asam-basa konjugasi pada reaksi-reaksi tersebut meliputi:\n1) Reaksi HCl dan air: HCl(g) + H₂O(l) → H₃O⁺(aq) + Cl⁻(aq). Pasangan asam-basa konjugasi adalah HCl/Cl⁻ dan H₂O/H₃O⁺.\n2) Reaksi NH₃ dan air: NH₃(aq) + H₂O(l) ⇌ NH₄⁺(aq) + OH⁻(aq). Pasangan asam-basa konjugasi adalah NH₄⁺/NH₃ dan H₂O/OH⁻.\n3) Reaksi HCO₃⁻ dan OH⁻: HCO₃⁻(aq) + OH⁻(aq) → CO₃²⁻(aq) + H₂O(l). Pasangan asam-basa konjugasi adalah HCO₃⁻/CO₃²⁻ dan H₂O/OH⁻.',
        ],
        persamaanReaksi: [
          'HCl(g) + H₂O(l) → H₃O⁺(aq) + Cl⁻(aq)',
          'NH₃(aq) + H₂O(l) ⇌ NH₄⁺(aq) + OH⁻(aq)',
          'HCO₃⁻(aq) + OH⁻(aq) → CO₃²⁻(aq) + H₂O(l)',
        ],
        representasi: {
          makroskopis:
            'Larutan HCl dan NH₃ ketika direaksikan akan menghasilkan larutan yang mengandung ion NH₄⁺ dan ion Cl⁻. Ketika larutan asam dicampurkan dengan larutan basa akan terjadi perubahan pH larutan. Indikator asam-basa akan mengalami perubahan warna saat dimasukkan ke dalam larutan asam dan basa.',
          submikroskopis:
            'Terjadi perpindahan ion H⁺ dari spesi asam (mendonorkan H⁺) ke spesi basa (menerima H⁺). Asam konjugasi merupakan spesi basa yang telah menerima satu ion H⁺. Basa konjugasi merupakan spesi asam yang telah mendonorkan satu ion H⁺. HCl dan Cl⁻ merupakan pasangan asam-basa konjugasi. NH₃ dan NH₄⁺ merupakan pasangan basa-asam konjugasi.',
          simbolik:
            'Reaksi HCl dengan air dan NH₃ dengan air:\nHCl(g) + H₂O(l) → H₃O⁺(aq) + Cl⁻(aq)\nNH₃(aq) + H₂O(l) ⇌ NH₄⁺(aq) + OH⁻(aq)\n\nReaksi ion bikarbonat dengan larutan basa:\nHCO₃⁻(aq) + OH⁻(aq) → CO₃²⁻(aq) + H₂O(l)\nAsam : HCO₃⁻ | Basa : OH⁻ | Basa konjugasi : CO₃²⁻ | Asam konjugasi : H₂O',
        },
      },
      {
        id: 'm1-lewis',
        judul: 'Teori Lewis',
        isi: [
          'Teori asam-basa Brønsted-Lowry masih memiliki keterbatasan karena hanya berlaku pada reaksi yang melibatkan perpindahan ion H⁺. Pada kenyataannya, terdapat reaksi asam-basa yang tidak melibatkan perpindahan H⁺. Oleh karena itu, G. N. Lewis mengusulkan teori yang lebih luas, yaitu teori asam-basa Lewis, yang didasarkan pada perpindahan pasangan elektron. Dalam teori ini, asam didefinisikan sebagai spesi kimia yang dapat menerima pasangan elektron (akseptor pasangan elektron), sedangkan basa didefinisikan sebagai spesi kimia yang dapat mendonorkan pasangan elektron (donor pasangan elektron).',
          'Contohnya adalah reaksi antara amonia (NH₃) dan boron trifluorida (BF₃). Atom N pada NH₃ memiliki satu pasangan elektron bebas (PEB) yang dapat didonorkan, sedangkan atom B pada BF₃ hanya memiliki 6 elektron valensi (kurang dari oktet) sehingga mampu menerima pasangan elektron. Pasangan elektron bebas dari NH₃ digunakan bersama untuk membentuk ikatan kovalen koordinasi dengan BF₃. Dengan demikian, NH₃ bertindak sebagai basa Lewis dan BF₃ bertindak sebagai asam Lewis: NH₃(g) + BF₃(g) → H₃N–BF₃(s).',
          'Teori Lewis juga dapat menjelaskan mengapa NH₃ bersifat basa walaupun tidak melepaskan ion OH⁻ (seperti pada apersepsi). Atom N pada NH₃ memiliki pasangan elektron bebas yang dapat didonorkan kepada ion H⁺ sehingga membentuk ion amonium (NH₄⁺). Pada reaksi ini, H⁺ bertindak sebagai asam Lewis karena menerima pasangan elektron dari NH₃: H⁺(aq) + NH₃(aq) → NH₄⁺(aq).',
          'Contoh lain adalah pembentukan ion kompleks. Ion logam transisi seperti Cu²⁺ memiliki orbital kosong sehingga dapat menerima pasangan elektron dari molekul NH₃. Ion Cu²⁺ bertindak sebagai asam Lewis dan NH₃ bertindak sebagai basa Lewis, menghasilkan ion kompleks tetraaminatembaga(II): Cu²⁺(aq) + 4NH₃(aq) → [Cu(NH₃)₄]²⁺(aq).',
          'Teori asam-basa Lewis memiliki cakupan paling luas karena dapat menjelaskan reaksi asam-basa tanpa melibatkan H⁺ maupun pelarut air. Setiap asam-basa Arrhenius dan Brønsted-Lowry juga merupakan asam-basa Lewis, tetapi tidak sebaliknya. Meskipun demikian, teori Lewis lebih sulit digunakan untuk menentukan kekuatan asam-basa secara kuantitatif karena tidak berkaitan langsung dengan konsentrasi H⁺ atau nilai pH.',
        ],
        persamaanReaksi: [
          'NH₃(g) + BF₃(g) → H₃N–BF₃(s)',
          'H⁺(aq) + NH₃(aq) → NH₄⁺(aq)',
          'Cu²⁺(aq) + 4NH₃(aq) → [Cu(NH₃)₄]²⁺(aq)',
        ],
        representasi: {
          makroskopis:
            'Larutan NH₃ berbau menyengat dan dapat mengubah kertas lakmus merah menjadi biru. Ketika larutan NH₃ ditambahkan sedikit demi sedikit ke dalam larutan CuSO₄ (berwarna biru muda), terbentuk endapan biru muda. Penambahan larutan NH₃ berlebih membuat endapan larut dan menghasilkan larutan berwarna biru tua pekat akibat terbentuknya ion kompleks [Cu(NH₃)₄]²⁺. Ketika gas NH₃ bertemu dengan gas HCl, terbentuk asap putih berupa padatan NH₄Cl.',
          submikroskopis:
            'Asam Lewis merupakan spesi kimia yang menerima pasangan elektron. Basa Lewis merupakan spesi kimia yang mendonorkan pasangan elektron. Atom N pada NH₃ memiliki satu pasangan elektron bebas yang dapat didonorkan. Atom B pada BF₃ kekurangan elektron (hanya 6 elektron valensi) sehingga dapat menerima pasangan elektron. Pasangan elektron bebas dari N digunakan bersama dengan B membentuk ikatan kovalen koordinasi. Ion Cu²⁺ menerima empat pasangan elektron bebas dari empat molekul NH₃ membentuk ion kompleks [Cu(NH₃)₄]²⁺.',
          simbolik:
            'Reaksi NH₃ dengan BF₃ (pembentukan ikatan kovalen koordinasi):\nNH₃(g) + BF₃(g) → H₃N–BF₃(s)\nBasa Lewis (donor pasangan elektron) : NH₃\nAsam Lewis (akseptor pasangan elektron) : BF₃\n\nReaksi H⁺ dengan NH₃:\nH⁺(aq) + NH₃(aq) → NH₄⁺(aq)\nAsam Lewis : H⁺\nBasa Lewis : NH₃\n\nReaksi pembentukan ion kompleks:\nCu²⁺(aq) + 4NH₃(aq) → [Cu(NH₃)₄]²⁺(aq)\nAsam Lewis : Cu²⁺\nBasa Lewis : NH₃',
        },
      },
    ],
    contohSoal: [
      {
        id: 'cs-m1-1',
        soal:
          'Arrhenius. Tentukan zat yang bersifat asam dan basa menurut teori Arrhenius dari reaksi ionisasinya di dalam air. Perhatikan dua reaksi berikut: HCl(aq) → H⁺(aq) + Cl⁻(aq) dan NaOH(aq) → Na⁺(aq) + OH⁻(aq). Tentukan zat yang merupakan asam dan basa Arrhenius serta jelaskan alasannya.',
        langkah: [
          '1) Perhatikan ion yang dihasilkan setiap zat ketika dilarutkan dalam air.',
          '2) Asam Arrhenius meningkatkan konsentrasi ion H⁺ dalam air.',
          '3) Basa Arrhenius meningkatkan konsentrasi ion OH⁻ dalam air.',
        ],
        jawaban:
          'HCl merupakan asam Arrhenius karena menghasilkan ion H⁺. NaOH merupakan basa Arrhenius karena menghasilkan ion OH⁻.',
      },
      {
        id: 'cs-m1-2',
        soal:
          'Brønsted-Lowry. Tentukan asam, basa, asam konjugasi, dan basa konjugasi berdasarkan reaksi berikut: NH₃(aq) + H₂O(l) ⇌ NH₄⁺(aq) + OH⁻(aq). Tentukan (a) asam Brønsted-Lowry, (b) basa Brønsted-Lowry, (c) asam konjugasi, dan (d) basa konjugasi.',
        langkah: [
          '1) Asam Brønsted-Lowry adalah zat yang mendonorkan proton (H⁺).',
          '2) Basa Brønsted-Lowry adalah zat yang menerima proton.',
          '3) H₂O memberikan proton kepada NH₃, sehingga terbentuk OH⁻ dan NH₄⁺.',
          '4) Pasangan konjugasi terbentuk dari spesi sebelum dan sesudah transfer proton.',
        ],
        jawaban:
          'Asam: H₂O. Basa: NH₃. Asam konjugasi: NH₄⁺. Basa konjugasi: OH⁻.',
      },
      {
        id: 'cs-m1-3',
        soal:
          'Brønsted-Lowry (spesi amfiprotik). Ion bikarbonat (HCO₃⁻) dapat bereaksi dengan air melalui dua kemungkinan reaksi: HCO₃⁻(aq) + H₂O(l) ⇌ H₂CO₃(aq) + OH⁻(aq) dan HCO₃⁻(aq) + H₂O(l) ⇌ CO₃²⁻(aq) + H₃O⁺(aq). Jelaskan mengapa HCO₃⁻ disebut spesi amfiprotik.',
        langkah: [
          '1) Pada reaksi pertama, perhatikan apakah HCO₃⁻ menerima atau melepaskan proton.',
          '2) Pada reaksi kedua, lakukan pengamatan yang sama.',
          '3) Spesi amfiprotik dapat bertindak sebagai donor maupun akseptor proton.',
        ],
        jawaban:
          'HCO₃⁻ bersifat amfiprotik karena pada reaksi pertama HCO₃⁻ menerima proton (H⁺) dan bertindak sebagai basa, sedangkan pada reaksi kedua HCO₃⁻ melepaskan proton (H⁺) dan bertindak sebagai asam.',
      },
      {
        id: 'cs-m1-4',
        soal:
          'Lewis. Perhatikan reaksi pembentukan aduk berikut: NH₃ + BF₃ → H₃N–BF₃. Tentukan zat yang bertindak sebagai asam Lewis dan basa Lewis.',
        langkah: [
          '1) Basa Lewis merupakan donor pasangan elektron.',
          '2) Asam Lewis merupakan akseptor pasangan elektron.',
          '3) Atom N pada NH₃ memiliki pasangan elektron bebas.',
          '4) Atom B pada BF₃ kekurangan elektron sehingga dapat menerima pasangan elektron.',
        ],
        jawaban:
          'NH₃ merupakan basa Lewis karena mendonorkan pasangan elektron bebas. BF₃ merupakan asam Lewis karena menerima pasangan elektron bebas dari NH₃.',
      },
      {
        id: 'cs-m1-5',
        soal:
          'Perbandingan teori asam basa. Reaksi berikut terjadi: NH₃ + H⁺ → NH₄⁺. Jelaskan mengapa reaksi tersebut dapat dijelaskan menggunakan teori Brønsted-Lowry dan Lewis.',
        langkah: [
          '1) Identifikasi perpindahan proton.',
          '2) Identifikasi perpindahan pasangan elektron.',
          '3) Tentukan peran NH₃ dalam kedua teori.',
        ],
        jawaban:
          'Menurut Brønsted-Lowry, NH₃ merupakan basa karena menerima proton (H⁺). Menurut Lewis, NH₃ merupakan basa karena mendonorkan pasangan elektron bebas kepada H⁺.',
      },
    ],
    ringkasan: [
      'Menurut Arrhenius, asam adalah zat yang menghasilkan ion H⁺ dalam air dan basa adalah zat yang menghasilkan ion OH⁻ dalam air; reaksi netralisasi keduanya membentuk air (H⁺ + OH⁻ → H₂O). Teori ini terbatas pada larutan berair dan tidak dapat menjelaskan sifat basa NH₃.',
      'Menurut Brønsted-Lowry, asam adalah donor proton (H⁺) dan basa adalah akseptor proton (H⁺). Reaksi asam-basa melibatkan perpindahan proton sehingga terbentuk pasangan asam-basa konjugasi, misalnya HCl/Cl⁻ dan NH₄⁺/NH₃.',
      'Menurut Lewis, asam adalah akseptor pasangan elektron dan basa adalah donor pasangan elektron; reaksinya membentuk ikatan kovalen koordinasi, misalnya NH₃ + BF₃ → H₃N–BF₃. Teori ini mencakup reaksi tanpa perpindahan H⁺.',
      'Cakupan teori semakin luas dari Arrhenius, Brønsted-Lowry, hingga Lewis: setiap asam-basa Arrhenius juga merupakan asam-basa Brønsted-Lowry dan Lewis, tetapi tidak sebaliknya.',
      'Satu zat dapat dipandang berbeda oleh tiap teori, misalnya NH₃ bukan basa Arrhenius, tetapi merupakan basa Brønsted-Lowry (akseptor H⁺) sekaligus basa Lewis (donor pasangan elektron).',
    ],
    sumber: [
      {
        penulis: 'McMurry, J., Fay, R. C., & Robinson, J. K.',
        tahun: '2016',
        judul: 'Chemistry (7th ed., Global ed.)',
        penerbit: 'Pearson Education',
        halaman: 'Hlm. 603–640',
      },
      {
        penulis: 'Chang, R., & Goldsby, K.',
        tahun: '2016',
        judul: 'Chemistry (12th ed.)',
        penerbit: 'McGraw-Hill Education',
        halaman: 'Hlm. 666–704',
      },
    ],
  },

  // =========================================================================
  // MODUL 2: KEKUATAN ASAM-BASA DAN PENENTUAN pH LARUTAN
  // =========================================================================
  {
    id: 'modul_2',
    judul: 'Modul 2: Kekuatan Asam-Basa dan Penentuan pH Larutan',
    tersedia: true,
    tujuan: [
      'Peserta didik dapat membedakan kekuatan asam dan basa berdasarkan derajat ionisasi dan nilai Ka atau Kb',
      'Peserta didik dapat mengidentifikasi karakteristik asam kuat, asam lemah, basa kuat, dan basa lemah',
      'Peserta didik dapat menentukan pH larutan asam dan basa berdasarkan konsentrasi ion H⁺ dan OH⁻',
      'Peserta didik dapat menganalisis hubungan kekuatan asam-basa, konsentrasi larutan, dan nilai pH',
    ],
    tujuanBelajar: [
      'Peserta didik dapat membedakan kekuatan asam dan basa berdasarkan derajat ionisasi dan nilai Ka atau Kb',
      'Peserta didik dapat mengidentifikasi karakteristik asam kuat, asam lemah, basa kuat, dan basa lemah',
      'Peserta didik dapat menentukan pH larutan asam dan basa berdasarkan konsentrasi ion H⁺ dan OH⁻',
      'Peserta didik dapat menganalisis hubungan kekuatan asam-basa, konsentrasi larutan, dan nilai pH',
    ],
    apersepsi: {
      judul: 'Apakah Semua Spesi Asam dan Basa Memiliki Kekuatan yang Sama?',
      cerita:
        'Pernahkah kamu mencicipi jeruk nipis dan cuka? Keduanya sama-sama memiliki rasa asam, tetapi jeruk nipis rasanya jauh lebih asam daripada cuka. Ini menunjukkan bahwa dua larutan yang bersifat asam belum tentu memiliki kekuatan asam dan nilai pH yang sama.',
      pertanyaan: [
        'Mengapa dua larutan yang sama-sama bersifat asam dapat memiliki kekuatan asam dan nilai pH yang berbeda?',
      ],
      kaitan:
        'Fenomena tersebut berkaitan dengan konsep kekuatan asam-basa, derajat ionisasi, serta konsentrasi ion H⁺ dan OH⁻ yang menjadi dasar penentuan nilai pH larutan.',
    },
    subMateri: [
      {
        id: 'm2-tetapan-ionisasi-air',
        judul: 'Tetapan Ionisasi Air',
        isi: [
          'Air dapat berfungsi sebagai basa dalam reaksinya dengan asam seperti HCl dan CH₃COOH. Air juga dapat berfungsi sebagai asam dalam reaksinya dengan basa seperti NH₃. Meskipun air merupakan elektrolit yang sangat lemah, air tetap mengalami ionisasi dalam jumlah yang sangat kecil. Reaksi ini disebut autoionisasi air: H₂O(l) ⇌ H⁺(aq) + OH⁻(aq) atau H₂O(l) + H₂O(l) ⇌ H₃O⁺(aq) + OH⁻(aq).',
          'Karena hanya sangat sedikit molekul air yang terionisasi, konsentrasi air (H₂O) dianggap tetap. Oleh karena itu, tetapan kesetimbangan untuk reaksi autoionisasi air dinyatakan sebagai tetapan ionisasi air (Kw): Kw = [H₃O⁺][OH⁻], atau dengan penyederhanaan H₃O⁺ ditulis sebagai H⁺: Kw = [H⁺][OH⁻].',
          'Dalam air murni pada suhu 25°C, konsentrasi ion H⁺ dan OH⁻ sama, yaitu 1,0 × 10⁻⁷ M, sehingga nilai Kw menjadi: Kw = [H⁺][OH⁻] = (1,0 × 10⁻⁷)(1,0 × 10⁻⁷) = 1,0 × 10⁻¹⁴.',
          'Larutan bersifat netral jika konsentrasi H⁺ dan OH⁻ sama, [H⁺] = [OH⁻]. Dalam larutan asam, terdapat kelebihan ion H⁺ sehingga [H⁺] > [OH⁻]. Sedangkan dalam larutan basa terdapat kelebihan ion OH⁻ sehingga [H⁺] < [OH⁻]. Nilai Kw bergantung pada suhu, dan pada 25°C Kw = 1,0 × 10⁻¹⁴. Jika nilai Kw diketahui, maka [H⁺] atau [OH⁻] yang belum diketahui dapat ditentukan dengan membagi Kw dengan konsentrasi yang telah diketahui: [H⁺] = Kw / [OH⁻] dan [OH⁻] = Kw / [H⁺].',
          'Contohnya, jika dalam suatu larutan diketahui [H⁺] = 1,0 × 10⁻⁶ M, maka [OH⁻] menjadi: [OH⁻] = Kw / [H⁺] = (1,0 × 10⁻¹⁴) / (1,0 × 10⁻⁶) = 1,0 × 10⁻⁸ M.',
        ],
        persamaanReaksi: [
          'H₂O(l) ⇌ H⁺(aq) + OH⁻(aq)',
          'H₂O(l) + H₂O(l) ⇌ H₃O⁺(aq) + OH⁻(aq)',
        ],
        representasi: {
          makroskopis:
            'Air murni sangat sulit menghantarkan listrik karena hanya mengandung ion H⁺ dan OH⁻ dalam jumlah yang sangat sedikit. Air murni tidak mengubah warna kertas lakmus merah maupun lakmus biru karena bersifat netral. Pada suhu 25°C, air murni memiliki pH 7 jika diukur dengan pH meter.',
          submikroskopis:
            'Sebagian sangat kecil molekul air terionisasi; pada 25°C hanya sekitar 1 dari 555 juta molekul air yang terionisasi. Satu molekul air mendonorkan H⁺ kepada molekul air lain sehingga terbentuk ion H₃O⁺ dan OH⁻. Pada air murni, konsentrasi H₃O⁺ sama dengan konsentrasi OH⁻, yaitu 1,0 × 10⁻⁷ M. Pada larutan asam maupun basa, ion H⁺ dan OH⁻ tetap ada bersamaan dengan hasil kali konsentrasi yang tetap (Kw).',
          simbolik:
            'Autoionisasi air:\nH₂O(l) + H₂O(l) ⇌ H₃O⁺(aq) + OH⁻(aq)\n\nTetapan ionisasi air pada 25°C:\nKw = [H⁺][OH⁻] = 1,0 × 10⁻¹⁴\n\nKriteria larutan:\nNetral : [H⁺] = [OH⁻] = 1,0 × 10⁻⁷ M\nAsam   : [H⁺] > [OH⁻]\nBasa   : [H⁺] < [OH⁻]',
        },
      },
      {
        id: 'm2-kekuatan-asam-basa',
        judul: 'Kekuatan Asam-Basa',
        isi: [
          'Kekuatan asam dan basa ditentukan oleh kemampuannya terionisasi dalam air. Ukuran banyaknya zat yang terionisasi dinyatakan dengan derajat ionisasi (α), yaitu perbandingan jumlah zat yang terionisasi dengan jumlah zat mula-mula: α = jumlah zat yang terionisasi / jumlah zat mula-mula. Semakin besar derajat ionisasi, semakin kuat asam atau basa tersebut.',
          'Asam kuat adalah asam yang terionisasi sempurna dalam air (α ≈ 1), sehingga hampir tidak ada molekul asam yang tersisa dan reaksinya berlangsung satu arah. Contoh asam kuat adalah HCl, HBr, HI, HNO₃, HClO₄, dan H₂SO₄ (pada tahap ionisasi pertama): HCl(aq) + H₂O(l) → H₃O⁺(aq) + Cl⁻(aq).',
          'Basa kuat adalah basa yang terdisosiasi sempurna dalam air. Contoh basa kuat adalah hidroksida logam golongan 1 (LiOH, NaOH, KOH) dan hidroksida logam golongan 2 yang larut (Ca(OH)₂, Sr(OH)₂, Ba(OH)₂): NaOH(s) → Na⁺(aq) + OH⁻(aq).',
          'Asam lemah hanya terionisasi sebagian dalam air (α < 1), sehingga dalam larutan terdapat molekul asam yang belum terionisasi bersama ion-ionnya dalam keadaan setimbang. Reaksinya ditulis dengan tanda panah kesetimbangan. Contoh asam lemah adalah CH₃COOH, HF, HCN, dan H₂CO₃: CH₃COOH(aq) + H₂O(l) ⇌ CH₃COO⁻(aq) + H₃O⁺(aq). Kekuatan asam lemah dinyatakan dengan tetapan ionisasi asam (Ka). Semakin besar nilai Ka, semakin kuat asam tersebut: Ka = [CH₃COO⁻][H₃O⁺] / [CH₃COOH].',
          'Basa lemah juga hanya terionisasi sebagian dalam air dan berada dalam kesetimbangan. Contoh basa lemah adalah NH₃: NH₃(aq) + H₂O(l) ⇌ NH₄⁺(aq) + OH⁻(aq). Kekuatan basa lemah dinyatakan dengan tetapan ionisasi basa (Kb). Semakin besar nilai Kb, semakin kuat basa tersebut: Kb = [NH₄⁺][OH⁻] / [NH₃].',
          'Kekuatan asam dan basa konjugasi saling berlawanan. Semakin kuat suatu asam, semakin lemah basa konjugasinya, dan sebaliknya. Untuk pasangan asam-basa konjugasi berlaku hubungan: Ka × Kb = Kw.',
          'Kekuatan asam-basa tidak sama dengan konsentrasi larutan. Kekuatan menunjukkan seberapa besar zat terionisasi, sedangkan konsentrasi menunjukkan banyaknya zat terlarut per liter larutan. Larutan asam lemah yang pekat dapat memiliki pH yang lebih rendah daripada larutan asam kuat yang sangat encer. Karena itu, nilai pH ditentukan oleh kekuatan sekaligus konsentrasi larutan.',
          'Konsentrasi ion H⁺ atau OH⁻ dalam larutan dapat dihitung sebagai berikut: Asam kuat: [H⁺] = a × Ma; Basa kuat: [OH⁻] = b × Mb; Asam lemah: [H⁺] = √(Ka × Ma); Basa lemah: [OH⁻] = √(Kb × Mb), dengan a adalah jumlah ion H⁺ yang dilepas per molekul asam dan b adalah jumlah ion OH⁻ yang dilepas per satuan rumus basa. Rumus asam lemah dan basa lemah tersebut berlaku dengan pendekatan bahwa jumlah zat yang terionisasi sangat kecil dibandingkan konsentrasi mula-mula.',
        ],
        persamaanReaksi: [
          'HCl(aq) + H₂O(l) → H₃O⁺(aq) + Cl⁻(aq)',
          'NaOH(s) → Na⁺(aq) + OH⁻(aq)',
          'CH₃COOH(aq) + H₂O(l) ⇌ CH₃COO⁻(aq) + H₃O⁺(aq)',
          'NH₃(aq) + H₂O(l) ⇌ NH₄⁺(aq) + OH⁻(aq)',
        ],
        representasi: {
          makroskopis:
            'Larutan HCl 0,1 M (asam kuat) menghantarkan listrik lebih baik daripada larutan CH₃COOH 0,1 M (asam lemah), ditandai nyala lampu yang lebih terang. Pada konsentrasi yang sama, pH larutan HCl lebih rendah daripada pH larutan CH₃COOH. Pada konsentrasi yang sama, logam Mg bereaksi lebih cepat dan menghasilkan gelembung gas H₂ lebih banyak dalam larutan HCl daripada dalam larutan CH₃COOH.',
          submikroskopis:
            'Asam kuat terionisasi sempurna sehingga dalam larutan hanya terdapat ion H₃O⁺ dan Cl⁻ tanpa molekul HCl. Asam lemah hanya terionisasi sebagian sehingga dalam larutan terdapat molekul CH₃COOH yang belum terionisasi bersama ion CH₃COO⁻ dan H₃O⁺. Pada larutan CH₃COOH 0,1 M, hanya sekitar 1,3% molekul yang terionisasi. Basa kuat terdisosiasi sempurna menjadi ion-ionnya, sedangkan basa lemah hanya sebagian kecil molekulnya yang bereaksi dengan air membentuk ion OH⁻. Semakin besar nilai Ka atau Kb, semakin banyak spesi yang terionisasi.',
          simbolik:
            'Asam kuat (ionisasi sempurna):\nHCl(aq) + H₂O(l) → H₃O⁺(aq) + Cl⁻(aq)\n[H⁺] = a × Ma\n\nBasa kuat (disosiasi sempurna):\nNaOH(s) → Na⁺(aq) + OH⁻(aq)\n[OH⁻] = b × Mb\n\nAsam lemah (ionisasi sebagian):\nCH₃COOH(aq) + H₂O(l) ⇌ CH₃COO⁻(aq) + H₃O⁺(aq)\nKa = [CH₃COO⁻][H₃O⁺] / [CH₃COOH]\n[H⁺] = √(Ka × Ma)\n\nBasa lemah (ionisasi sebagian):\nNH₃(aq) + H₂O(l) ⇌ NH₄⁺(aq) + OH⁻(aq)\nKb = [NH₄⁺][OH⁻] / [NH₃]\n[OH⁻] = √(Kb × Mb)\n\nHubungan asam-basa konjugasi:\nKa × Kb = Kw',
        },
      },
      {
        id: 'm2-penentuan-ph',
        judul: 'Penentuan Nilai pH Larutan',
        isi: [
          'pH larutan didefinisikan sebagai logaritma negatif dari konsentrasi ion hidrogen (H⁺) dalam satuan mol/L: pH = –log [H⁺].',
          'pH dapat digunakan sebagai ukuran tingkat keasaman suatu larutan berdasarkan besar konsentrasi ion H⁺ di dalamnya. Pada suhu 25°C, nilai pH memiliki kriteria sebagai berikut:\n• Larutan asam : [H⁺] > 1,0 × 10⁻⁷ M, pH < 7,00\n• Larutan netral : [H⁺] = 1,0 × 10⁻⁷ M, pH = 7,00\n• Larutan basa : [H⁺] < 1,0 × 10⁻⁷ M, pH > 7,00',
          'Jika yang diketahui adalah nilai pH suatu larutan, maka konsentrasi ion H⁺ dapat ditentukan dengan rumus: [H⁺] = 10⁻ᵖᴴ.',
          'Selain pH, tingkat kebasaan larutan juga dapat dinyatakan dengan pOH, yaitu logaritma negatif dari konsentrasi ion OH⁻: pOH = –log [OH⁻] dan [OH⁻] = 10⁻ᵖᴼᴴ.',
          'Di laboratorium, nilai yang umum diukur secara makroskopis adalah pH. Berdasarkan nilai Kw, hasil kali [H⁺] dan [OH⁻] adalah 1,0 × 10⁻¹⁴. Jika kedua ruas persamaan Kw diberi logaritma negatif, diperoleh hubungan bahwa jumlah pH dan pOH sama dengan 14 pada suhu 25°C: pH + pOH = 14.',
          'Setiap perubahan satu satuan pH menunjukkan perubahan konsentrasi H⁺ sebesar 10 kali. Larutan dengan pH 3 memiliki [H⁺] 10 kali lebih besar daripada larutan dengan pH 4.',
        ],
        persamaanReaksi: [
          'pH = –log [H⁺]',
          '[H⁺] = 10⁻ᵖᴴ',
          'pOH = –log [OH⁻]',
          '[OH⁻] = 10⁻ᵖᴼᴴ',
          'pH + pOH = 14',
        ],
        representasi: {
          makroskopis:
            'Nilai pH larutan dapat diukur menggunakan pH meter atau kertas indikator universal. Indikator universal menunjukkan perubahan warna dari merah (asam) ke hijau (netral) hingga ungu (basa) sesuai nilai pH larutan. Larutan HCl 0,01 M memiliki pH 2, sedangkan larutan NaOH 0,001 M memiliki pH 11.',
          submikroskopis:
            'Semakin besar konsentrasi ion H⁺ dalam larutan, semakin kecil nilai pH. Pada larutan asam, jumlah ion H⁺ lebih banyak daripada ion OH⁻, tetapi ion OH⁻ tetap ada dari autoionisasi air. Pada larutan basa, jumlah ion OH⁻ lebih banyak daripada ion H⁺, tetapi ion H⁺ tetap ada dari autoionisasi air. Penurunan satu satuan pH berarti jumlah ion H⁺ per liter larutan menjadi 10 kali lebih banyak.',
          simbolik:
            'Hubungan pH dan [H⁺]:\npH = –log [H⁺]\n[H⁺] = 10⁻ᵖᴴ\n\nHubungan pOH dan [OH⁻]:\npOH = –log [OH⁻]\n[OH⁻] = 10⁻ᵖᴼᴴ\n\nHubungan pH dan pOH (25°C):\npH + pOH = 14\n\nContoh penerapan:\nHCl 0,01 M : [H⁺] = 10⁻² M, pH = 2\nNaOH 0,001 M : [OH⁻] = 10⁻³ M, pOH = 3, pH = 14 – 3 = 11',
        },
      },
    ],
    contohSoal: [
      {
        id: 'cs-m2-1',
        soal:
          'Asam kuat. Sebanyak 100 mL larutan HCl memiliki konsentrasi 0,01 M. Jika HCl terionisasi sempurna, tentukan pH larutan tersebut. (Asumsi perhitungan: suhu 25°C, Kw = 1,0 × 10⁻¹⁴, dan aktivitas ion dianggap mendekati konsentrasi.)',
        langkah: [
          '1) HCl merupakan asam kuat monoprotik, sehingga [H⁺] = a × Ma dengan a = 1.',
          '2) Masukkan konsentrasi HCl: [H⁺] = 1 × 0,01 = 10⁻² M.',
          '3) Hitung pH: pH = –log [H⁺] = –log (10⁻²) = 2.',
        ],
        jawaban: 'pH = 2',
      },
      {
        id: 'cs-m2-2',
        soal:
          'Basa kuat. Larutan NaOH memiliki konsentrasi 0,001 M. Jika NaOH terdisosiasi sempurna, tentukan pH larutan tersebut.',
        langkah: [
          '1) NaOH merupakan basa kuat dengan satu ion OH⁻ per satuan rumus, sehingga [OH⁻] = b × Mb dengan b = 1.',
          '2) Hitung konsentrasi ion hidroksida: [OH⁻] = 1 × 0,001 = 10⁻³ M.',
          '3) Hitung pOH: pOH = –log (10⁻³) = 3.',
          '4) Hitung pH: pH = 14 – pOH = 14 – 3 = 11.',
        ],
        jawaban: 'pH = 11',
      },
      {
        id: 'cs-m2-3',
        soal:
          'Asam lemah. Larutan asam asetat (CH₃COOH) memiliki konsentrasi 0,1 M. Jika diketahui nilai Ka = 1,8 × 10⁻⁵, tentukan pH larutan dengan pendekatan ionisasi asam lemah.',
        langkah: [
          '1) Gunakan persamaan pendekatan: [H⁺] = √(Ka × Ma).',
          '2) Masukkan nilai yang diketahui: [H⁺] = √(1,8 × 10⁻⁵ × 0,1) = √(1,8 × 10⁻⁶) ≈ 1,34 × 10⁻³ M.',
          '3) Hitung pH: pH = –log (1,34 × 10⁻³) ≈ 2,87.',
        ],
        jawaban: 'pH ≈ 2,87',
      },
      {
        id: 'cs-m2-4',
        soal:
          'Basa lemah. Larutan amonia (NH₃) memiliki konsentrasi 0,1 M. Jika diketahui nilai Kb = 1,8 × 10⁻⁵, tentukan pH larutan dengan pendekatan ionisasi basa lemah.',
        langkah: [
          '1) Gunakan persamaan pendekatan: [OH⁻] = √(Kb × Mb).',
          '2) Masukkan nilai yang diketahui: [OH⁻] = √(1,8 × 10⁻⁵ × 0,1) = √(1,8 × 10⁻⁶) ≈ 1,34 × 10⁻³ M.',
          '3) Hitung pOH: pOH = –log (1,34 × 10⁻³) ≈ 2,87.',
          '4) Hitung pH: pH = 14 – 2,87 = 11,13.',
        ],
        jawaban: 'pH ≈ 11,13',
      },
      {
        id: 'cs-m2-5',
        soal:
          'Perbandingan konsentrasi ion hidrogen. Larutan A memiliki pH 3, sedangkan larutan B memiliki pH 5. Berapa kali konsentrasi ion H⁺ larutan A dibandingkan larutan B?',
        langkah: [
          '1) Gunakan hubungan [H⁺] = 10⁻ᵖᴴ.',
          '2) Hitung [H⁺] larutan A: [H⁺]A = 10⁻³ M.',
          '3) Hitung [H⁺] larutan B: [H⁺]B = 10⁻⁵ M.',
          '4) Bandingkan: [H⁺]A / [H⁺]B = 10⁻³ / 10⁻⁵ = 10² = 100.',
        ],
        jawaban:
          'Konsentrasi ion H⁺ larutan A 100 kali lebih besar daripada larutan B.',
      },
    ],
    ringkasan: [
      'Air murni mengalami autoionisasi dalam jumlah sangat kecil menurut reaksi H₂O(l) + H₂O(l) ⇌ H₃O⁺(aq) + OH⁻(aq). Tetapan ionisasi air pada 25°C adalah Kw = [H⁺][OH⁻] = 1,0 × 10⁻¹⁴, dengan [H⁺] = [OH⁻] = 1,0 × 10⁻⁷ M pada air murni.',
      'Kekuatan asam-basa ditentukan oleh derajat ionisasinya. Asam kuat dan basa kuat terionisasi sempurna (α ≈ 1), sedangkan asam lemah dan basa lemah hanya terionisasi sebagian dan dinyatakan dengan nilai Ka atau Kb; semakin besar Ka atau Kb, semakin kuat asam atau basanya.',
      'Kekuatan tidak sama dengan konsentrasi: kekuatan menyatakan banyaknya zat yang terionisasi, sedangkan konsentrasi menyatakan banyaknya zat terlarut per liter larutan. Keduanya menentukan nilai pH larutan.',
      'pH = –log [H⁺] dan pOH = –log [OH⁻], dengan pH + pOH = 14 pada 25°C. Larutan bersifat asam jika pH < 7, netral jika pH = 7, dan basa jika pH > 7.',
      'Perhitungan [H⁺] atau [OH⁻]: asam kuat [H⁺] = a × Ma, basa kuat [OH⁻] = b × Mb, asam lemah [H⁺] = √(Ka × Ma), dan basa lemah [OH⁻] = √(Kb × Mb). Setiap perubahan 1 satuan pH berarti konsentrasi H⁺ berubah 10 kali.',
    ],
    sumber: [
      {
        penulis: 'McMurry, J., Fay, R. C., & Robinson, J. K.',
        tahun: '2016',
        judul: 'Chemistry (7th ed., Global ed.)',
        penerbit: 'Pearson Education',
        halaman: 'Hlm. 616–634',
      },
      {
        penulis: 'Chang, R., & Goldsby, K.',
        tahun: '2016',
        judul: 'Chemistry (12th ed.)',
        penerbit: 'McGraw-Hill Education',
        halaman: 'Hlm. 670–687',
      },
    ],
  },

  // =========================================================================
  // MODUL 3: TITRASI ASAM-BASA
  // =========================================================================
  {
    id: 'modul_3',
    judul: 'Modul 3: Titrasi Asam-Basa',
    tersedia: true,
    tujuan: [
      'Menjelaskan prinsip dan prosedur titrasi asam basa, termasuk fungsi titran, titrat (analit), buret, dan indikator. (C2)',
      'Menghitung konsentrasi larutan asam atau basa dari data hasil titrasi. (C3)',
      'Menganalisis kurva titrasi serta membedakan titik ekuivalen dan titik akhir titrasi. (C4)',
      'Menentukan indikator yang tepat untuk suatu titrasi dan memberikan alasan berdasarkan trayek pH indikator serta pH titik ekuivalen. (C5)',
    ],
    tujuanBelajar: [
      'Menjelaskan prinsip dan prosedur titrasi asam basa, termasuk fungsi titran, titrat (analit), buret, dan indikator. (C2)',
      'Menghitung konsentrasi larutan asam atau basa dari data hasil titrasi. (C3)',
      'Menganalisis kurva titrasi serta membedakan titik ekuivalen dan titik akhir titrasi. (C4)',
      'Menentukan indikator yang tepat untuk suatu titrasi dan memberikan alasan berdasarkan trayek pH indikator serta pH titik ekuivalen. (C5)',
    ],
    apersepsi: {
      judul: 'Ketika Sungai Kafue Berubah Menjadi Asam',
      cerita:
        'Pada 18 Februari 2025, bendungan penampung limbah (tailing) sebuah tambang tembaga di dekat Kota Kitwe, Zambia, jebol. Diperkirakan sekitar 50 juta liter limbah yang mengandung asam sulfat (H₂SO₄) dan logam berat mengalir ke anak sungai yang bermuara di Sungai Kafue, sungai terpenting di Zambia. Ikan-ikan mati hingga sekitar 100 km dari lokasi tambang, lahan pertanian di tepi sungai rusak, dan pasokan air bersih warga terganggu. Untuk menetralkan asamnya, pemerintah Zambia menebarkan ratusan ton kapur ke sungai, baik dari pesawat maupun dengan perahu motor.',
      pertanyaan: [
        'Mengapa kapur bisa menetralkan asam di sungai? Jika kapur yang digunakan adalah kapur padam, Ca(OH)₂, bagaimana persamaan reaksinya dengan asam sulfat?',
        'Kapur yang terlalu sedikit membuat air tetap asam, sedangkan kapur padam yang terlalu banyak membuat air menjadi basa. Bagaimana petugas bisa memperkirakan jumlah kapur yang tepat?',
        'Apa yang perlu diketahui lebih dulu tentang air yang tercemar, dan bagaimana cara mengetahui bahwa asamnya sudah tepat habis dinetralkan?',
      ],
      kaitan:
        'Menentukan jumlah asam dalam suatu larutan dengan menambahkan basa yang konsentrasinya sudah diketahui sampai keduanya tepat habis bereaksi adalah prinsip titrasi asam basa. Prinsip inilah yang akan kamu pelajari di modul ini.',
    },
    subMateri: [
      {
        id: 'm3-prinsip-prosedur',
        judul: 'Prinsip dan Prosedur Titrasi',
        isi: [
          'Asam melepas ion H⁺ dan basa melepas ion OH⁻ di dalam air. Jika asam bereaksi dengan basa, ion H⁺ dan OH⁻ bergabung membentuk air. Reaksi ini disebut reaksi penetralan. Karena juga menghasilkan garam, reaksi ini sering disebut reaksi penggaraman: asam + basa → garam + air. Larutan hasilnya tidak selalu netral (pH 7), tergantung kekuatan asam dan basa yang bereaksi.',
          'Titrasi adalah cara menentukan konsentrasi suatu larutan. Caranya, larutan baku (larutan yang konsentrasinya sudah diketahui) ditambahkan sedikit demi sedikit ke larutan tersebut, dengan bantuan indikator. Dari volume larutan baku yang terpakai, konsentrasi larutan yang dititrasi dapat dihitung.',
          'Istilah penting dalam titrasi: 1) Titran adalah larutan baku yang diteteskan dari buret, contohnya NaOH 0,1 M; 2) Titrat (analit) adalah larutan yang dicari konsentrasinya dan berada di Erlenmeyer, contohnya HCl atau cuka; 3) Indikator adalah zat yang warnanya berubah pada rentang pH tertentu, contohnya fenolftalein; 4) Titik ekuivalen (TE) adalah saat jumlah mol H⁺ tepat sama dengan jumlah mol OH⁻ yang dihitung dari stoikiometri; 5) Titik akhir titrasi (TA) adalah saat indikator berubah warna dan titrasi dihentikan, contohnya terbentuk warna merah muda samar pada fenolftalein.',
          'Alat yang digunakan dalam titrasi mencakup: buret berupa tabung kaca bergaris dengan kran untuk mengeluarkan titran dengan volume terukur, statif dan klem untuk menegakkan dan memegang buret, Erlenmeyer sebagai wadah titrat yang memudahkan labu digoyang tanpa tumpah, pipet volume untuk mengambil titrat dengan volume tepat, pipet tetes untuk meneteskan indikator, serta corong untuk mengisi buret.',
          'Langkah prosedur titrasi: 1) Bilas buret dengan sedikit titran, isi buret lewat corong, pastikan tidak ada gelembung udara di ujungnya, lalu catat volume awal; 2) Ambil titrat dengan pipet volume dan masukkan ke Erlenmeyer; 3) Tambahkan 2–3 tetes indikator; 4) Teteskan titran sambil menggoyang Erlenmeyer, perlambat tetesan saat warna mulai berubah, dan hentikan saat warna berubah tetap (titik akhir); 5) Catat volume akhir buret, lalu hitung volume titran yang terpakai; 6) Ulangi minimal tiga kali dan ambil volume rata-ratanya.',
        ],
        persamaanReaksi: [
          'H⁺(aq) + OH⁻(aq) → H₂O(l)',
          'HCl(aq) + NaOH(aq) → NaCl(aq) + H₂O(l)',
          'H₂SO₄(aq) + 2NaOH(aq) → Na₂SO₄(aq) + 2H₂O(l)',
        ],
        representasi: {
          makroskopis:
            'Pada titrasi HCl dengan NaOH dan indikator fenolftalein, larutan di Erlenmeyer awalnya bening. Setiap tetes NaOH menimbulkan bercak merah muda yang langsung hilang saat labu digoyang. Mendekati titik akhir, warna merah muda hilang makin lambat. Di titik akhir, satu tetes NaOH membuat seluruh larutan berwarna merah muda samar yang bertahan sekitar 30 detik. Jika titran berlebih, warna larutan menjadi merah muda pekat.',
          submikroskopis:
            'HCl terionisasi sempurna dan NaOH terdisosiasi sempurna, sehingga di larutan terdapat ion H⁺, Cl⁻, Na⁺, dan OH⁻. Setiap ion OH⁻ yang masuk langsung bergabung dengan satu ion H⁺ membentuk molekul H₂O, sehingga ion H⁺ makin sedikit. Tepat di titik ekuivalen, yang tersisa hanya ion Na⁺, Cl⁻, dan molekul H₂O. Ion Na⁺ dan Cl⁻ tidak ikut bereaksi (ion penonton). Setelah titik ekuivalen, ion OH⁻ berlebih dan fenolftalein berubah menjadi merah muda.',
          simbolik:
            'Jumlah mol : n = M × V (jika V dalam mL, hasilnya dalam mmol)\n\nDi titik ekuivalen, mol H⁺ = mol OH⁻, sehingga:\nVa × Ma × a = Vb × Mb × b\n\nKeterangan : a = jumlah H⁺ yang dilepas satu molekul asam; b = jumlah OH⁻ yang dilepas satu molekul basa',
        },
      },
      {
        id: 'm3-hitung-konsentrasi',
        judul: 'Menghitung Konsentrasi dari Data Titrasi',
        isi: [
          'Karena mol H⁺ sama dengan mol OH⁻ di titik ekuivalen, konsentrasi titrat dapat dihitung dari volume titran yang terpakai. Rumus ini berlaku untuk asam atau basa kuat maupun lemah, karena yang dihitung adalah jumlah zat yang bereaksi, bukan pH-nya.',
          'Nilai a untuk asam dan nilai b untuk basa menyatakan jumlah ion yang dilepaskan: untuk asam HCl, HNO₃, dan CH₃COOH memiliki a = 1, sedangkan H₂SO₄ memiliki a = 2. Untuk basa NaOH, KOH, dan NH₃ memiliki b = 1, sedangkan Ca(OH)₂ dan Ba(OH)₂ memiliki b = 2.',
          'Langkah menghitung: 1) Tulis persamaan reaksi setara dan tentukan nilai a dan b; 2) Hitung volume titran tiap percobaan dari pembacaan buret; 3) Periksa data, di mana volume percobaan ulang harus berdekatan (selisih sekitar 0,1 mL) dan data yang menyimpang jauh tidak dipakai; 4) Hitung volume rata-rata; 5) Masukkan ke rumus Va × Ma × a = Vb × Mb × b; 6) Jika sampel diencerkan sebelum dititrasi, hitung konsentrasi awalnya dengan V₁ × M₁ = V₂ × M₂.',
        ],
        persamaanReaksi: [
          'HCl(aq) + NaOH(aq) → NaCl(aq) + H₂O(l)',
          'CH₃COOH(aq) + NaOH(aq) → CH₃COONa(aq) + H₂O(l)',
          'H₂SO₄(aq) + 2NaOH(aq) → Na₂SO₄(aq) + 2H₂O(l)',
        ],
        representasi: {
          makroskopis:
            'Data dari buret dicatat dalam tabel pengamatan. Contoh data titrasi 20 mL HCl dengan NaOH 0,1 M: Pada Percobaan 1 volume NaOH terpakai adalah 11,65 mL, pada Percobaan 2 adalah 11,60 mL, dan pada Percobaan 3 adalah 11,61 mL, sehingga rata-rata volume NaOH yang terpakai adalah 11,62 mL.',
          submikroskopis:
            'Setiap ion OH⁻ menetralkan tepat satu ion H⁺. Satu molekul HCl melepas satu ion H⁺, sedangkan satu molekul H₂SO₄ melepas dua ion H⁺, sehingga H₂SO₄ membutuhkan ion OH⁻ dua kali lebih banyak. Karena itu valensi harus diperhitungkan. Pada pengenceran, yang bertambah hanya molekul air, sedangkan jumlah partikel zat terlarut tetap.',
          simbolik:
            'Va × Ma × a = Vb × Mb × b\n20 × Ma × 1 = 11,62 × 0,1 × 1\nMa = 1,162 / 20 = 0,0581 M',
        },
      },
      {
        id: 'm3-kurva-titrasi',
        judul: 'Kurva Titrasi, Titik Ekuivalen, dan Titik Akhir',
        isi: [
          'Kurva titrasi adalah grafik pH larutan (sumbu y) terhadap volume titran yang ditambahkan (sumbu x). Di dekat titik ekuivalen, pH berubah sangat tajam hanya dengan beberapa tetes titran. Titik ekuivalen terletak di tengah bagian kurva yang curam itu.',
          'Titik ekuivalen (TE) adalah saat mol H⁺ tepat sama dengan mol OH⁻. Titik akhir titrasi (TA) adalah saat indikator berubah warna. Idealnya keduanya berimpit. Selisih keduanya disebut galat titrasi, dan galat ini kecil jika indikatornya dipilih dengan tepat.',
          'Data pH titrasi 25 mL larutan 0,1 M dengan NaOH 0,1 M (Ka CH₃COOH = 1,8 × 10⁻⁵): Pada penambahan 0 mL titran, pH HCl adalah 1,00 dan pH CH₃COOH adalah 2,87; pada 10 mL titran, pH HCl adalah 1,37 dan pH CH₃COOH adalah 4,57; pada 20 mL titran, pH HCl adalah 1,95 dan pH CH₃COOH adalah 5,35; pada 24 mL titran, pH HCl adalah 2,69 dan pH CH₃COOH adalah 6,13; pada 25 mL titran (titik ekuivalen), pH HCl melonjak menjadi 7,00 dan pH CH₃COOH melonjak menjadi 8,72; pada 26 mL titran, pH keduanya adalah 11,29; serta pada 30 mL titran, pH keduanya adalah 11,96.',
          'Perbandingan kurva titrasi asam kuat dan asam lemah dengan basa kuat: Pada titrasi asam kuat–basa kuat, pH awal bernilai rendah (±1), pH di titik ekuivalen = 7, dan lonjakan pH di sekitar titik ekuivalen lebar (±3,7 sampai ±10,3). Sementara pada titrasi asam lemah–basa kuat, pH awal lebih tinggi (±2,9), pH di titik ekuivalen > 7 (±8,7), dan lonjakan pH di sekitar titik ekuivalen lebih sempit (±7 sampai ±10,3).',
          'Cara membaca kurva titrasi: 1) Lihat arah kurva; jika naik, titran adalah basa, jika turun, titran adalah asam; 2) Tentukan titik ekuivalen di tengah bagian kurva yang paling curam; 3) Baca volume titran dan pH di titik itu; 4) Tentukan jenis titrasi: pH titik ekuivalen = 7 berarti asam kuat–basa kuat, sedangkan pH titik ekuivalen di atas 7 berarti asam lemah–basa kuat.',
        ],
        persamaanReaksi: [
          'HCl(aq) + NaOH(aq) → NaCl(aq) + H₂O(l)',
          'CH₃COOH(aq) + NaOH(aq) → CH₃COONa(aq) + H₂O(l)',
          'CH₃COOH(aq) ⇌ CH₃COO⁻(aq) + H⁺(aq)',
        ],
        representasi: {
          makroskopis:
            'Jika diukur dengan pH meter, pada titrasi HCl–NaOH pH naik sangat pelan dari 1, lalu melonjak dari sekitar 3,7 ke 10,3 hanya dengan 0,2 mL (sekitar 4 tetes), lalu naik pelan lagi. Pada titrasi CH₃COOH–NaOH, pH awalnya lebih tinggi dan kurvanya hampir datar di pH 4–6 untuk waktu yang lama, lalu melonjak di dekat 25 mL. Lonjakan pH pada titrasi asam lemah–basa kuat lebih pendek daripada titrasi asam kuat–basa kuat.',
          submikroskopis:
            'HCl terionisasi sempurna, jadi sejak awal larutan penuh ion H⁺. CH₃COOH hanya terionisasi sebagian, jadi sebagian besar masih berupa molekul utuh. Ion OH⁻ dari titran mengambil H⁺ dari molekul CH₃COOH dan membentuk ion CH₃COO⁻. Di titik ekuivalen, larutan berisi ion Na⁺ dan CH₃COO⁻. Ion CH₃COO⁻ sedikit bereaksi dengan air dan menghasilkan OH⁻, sehingga pH di titik ekuivalen berada di atas 7.',
          simbolik:
            'Contoh 25 mL HCl 0,1 M dititrasi NaOH 0,1 M:\nSebelum titrasi : [H⁺] = 0,1 M, pH = –log 10⁻¹ = 1\nSetelah 10 mL NaOH : mol H⁺ sisa = 2,5 – 1,0 = 1,5 mmol dalam 35 mL; [H⁺] = 0,0429 M; pH = 1,37\nTepat 25 mL (TE) : H⁺ dan OH⁻ habis bereaksi, pH = 7',
        },
      },
      {
        id: 'm3-pemilihan-indikator',
        judul: 'Pemilihan Indikator',
        isi: [
          'Indikator adalah zat yang warnanya berubah ketika pH larutan melewati rentang tertentu. Rentang ini disebut trayek pH indikator. Indikator hanya dipakai 2–3 tetes supaya tidak ikut memengaruhi hasil titrasi.',
          'Aturan memilih indikator: trayek pH indikator harus mengandung pH titik ekuivalen dan berada di dalam daerah lonjakan pH. Jika trayeknya jauh dari titik ekuivalen, warna berubah terlalu cepat atau terlalu lambat, sehingga volume yang dicatat salah dan konsentrasi yang dihitung ikut salah.',
          'Trayek pH beberapa indikator beserta perubahan warnanya (asam ke basa): Metil jingga memiliki trayek pH 3,1 – 4,4 (merah ke kuning); Metil merah memiliki trayek pH 4,4 – 6,2 (merah ke kuning); Bromtimol biru memiliki trayek pH 6,0 – 7,6 (kuning ke biru); dan Fenolftalein memiliki trayek pH 8,3 – 10,0 (tak berwarna ke merah muda).',
          'Indikator yang sesuai untuk tiap jenis titrasi: Untuk titrasi asam kuat–basa kuat dengan pH di titik ekuivalen = 7, indikator yang cocok adalah fenolftalein, bromtimol biru, dan metil merah. Untuk titrasi asam lemah–basa kuat dengan pH di titik ekuivalen ±8,7, indikator yang cocok adalah fenolftalein, sedangkan metil merah tidak cocok karena warnanya berubah bertahap sebelum titik ekuivalen.',
        ],
        persamaanReaksi: [
          'HIn(aq) ⇌ H⁺(aq) + In⁻(aq)',
        ],
        representasi: {
          makroskopis:
            'Pada titrasi CH₃COOH dengan NaOH, fenolftalein berubah dari tak berwarna menjadi merah muda secara tajam di sekitar 25 mL, sehingga titik akhirnya mudah diamati. Jika dipakai metil merah, warnanya berubah perlahan dari merah ke jingga sejak sekitar 8 mL dan sudah kuning sebelum mencapai 25 mL. Karena perubahannya tidak tajam, siswa sulit menentukan kapan harus berhenti, dan volume yang dicatat cenderung lebih kecil dari volume titik ekuivalen.',
          submikroskopis:
            'Di bawah trayek, ion H⁺ melimpah sehingga kesetimbangan bergeser ke kiri dan bentuk HIn yang dominan. Di atas trayek, ion OH⁻ mengikat H⁺ sehingga kesetimbangan bergeser ke kanan dan bentuk In⁻ yang dominan. Di dalam trayek, kedua bentuk hadir dalam jumlah sebanding sehingga warnanya campuran. Karena itu perubahan warna terjadi pada suatu rentang pH, bukan pada satu angka.',
          simbolik:
            'Langkah memilih indikator:\n1. Tentukan jenis titrasi.\n2. Tentukan pH titik ekuivalen (= 7 atau > 7).\n3. Pilih indikator yang trayeknya mengandung pH tersebut.\n\nContoh : titrasi CH₃COOH dengan NaOH, pH TE = 8,72. Trayek fenolftalein (8,3–10,0) mengandung 8,72, sehingga fenolftalein dipilih.',
        },
      },
    ],
    contohSoal: [
      {
        id: 'cs-m3-1',
        soal:
          'Menghitung konsentrasi dari data titrasi. Sebanyak 25 mL larutan HCl dititrasi menggunakan larutan NaOH 0,1 M. Hasil pengukuran volume NaOH yang digunakan adalah 24,8 mL (percobaan 1), 25,0 mL (percobaan 2), dan 25,2 mL (percobaan 3). Tentukan konsentrasi HCl.',
        langkah: [
          '1) Hitung volume rata-rata NaOH: Vb = (24,8 + 25,0 + 25,2) / 3 = 25,0 mL.',
          '2) Tuliskan persamaan reaksi: HCl(aq) + NaOH(aq) → NaCl(aq) + H₂O(l).',
          '3) Gunakan rumus titrasi: Va × Ma × a = Vb × Mb × b, dengan a = 1 dan b = 1.',
          '4) Masukkan nilai: 25 × Ma × 1 = 25,0 × 0,1 × 1, sehingga Ma = 0,1 M.',
        ],
        jawaban: '[HCl] = 0,1 M',
      },
      {
        id: 'cs-m3-2',
        soal:
          'Titrasi asam diprotik. Sebanyak 20 mL larutan H₂SO₄ 0,1 M dititrasi menggunakan larutan NaOH. Jika volume NaOH yang dibutuhkan sampai titik ekuivalen adalah 40 mL, tentukan konsentrasi NaOH.',
        langkah: [
          '1) Tuliskan persamaan reaksi: H₂SO₄(aq) + 2NaOH(aq) → Na₂SO₄(aq) + 2H₂O(l).',
          '2) Tentukan nilai a dan b: a = 2 (jumlah H⁺ yang dapat dilepaskan H₂SO₄) dan b = 1 (jumlah OH⁻ yang dapat diberikan NaOH).',
          '3) Gunakan persamaan titrasi: Va × Ma × a = Vb × Mb × b.',
          '4) Masukkan nilai: 20 × 0,1 × 2 = 40 × Mb × 1, sehingga 4 = 40 Mb dan Mb = 0,1 M.',
        ],
        jawaban: '[NaOH] = 0,1 M',
      },
      {
        id: 'cs-m3-3',
        soal:
          'Memilih indikator titrasi. Seorang siswa melakukan titrasi larutan asam asetat (CH₃COOH) menggunakan larutan NaOH. Titik ekuivalen titrasi berada pada kondisi basa, dengan pH sekitar 8,7. Diketahui trayek perubahan warna indikator: metil merah 4,4–6,2; bromtimol biru 6,0–7,6; fenolftalein 8,3–10,0. Indikator manakah yang paling sesuai? Jelaskan alasannya.',
        langkah: [
          '1) Identifikasi jenis titrasi: asam lemah dengan basa kuat.',
          '2) Titik ekuivalen titrasi asam lemah–basa kuat berada pada pH lebih dari 7.',
          '3) Bandingkan pH titik ekuivalen dengan trayek perubahan warna indikator.',
          '4) Pilih indikator yang trayek perubahannya mencakup daerah lonjakan pH di sekitar titik ekuivalen.',
        ],
        jawaban:
          'Indikator yang paling sesuai adalah fenolftalein, karena trayek perubahan warnanya (pH 8,3–10,0) mencakup pH titik ekuivalen sekitar 8,7. Fenolftalein berubah dari tidak berwarna menjadi merah muda dalam kondisi basa.',
      },
      {
        id: 'cs-m3-4',
        soal:
          'Menentukan pH pada titik ekuivalen. Sebanyak 25 mL larutan HCl 0,1 M dititrasi menggunakan larutan NaOH 0,1 M pada suhu 25°C. Tentukan (a) volume NaOH yang diperlukan untuk mencapai titik ekuivalen dan (b) pH larutan pada titik ekuivalen.',
        langkah: [
          '1) Tuliskan persamaan reaksi: HCl(aq) + NaOH(aq) → NaCl(aq) + H₂O(l).',
          '2) Tentukan volume NaOH pada titik ekuivalen: Va × Ma = Vb × Mb, sehingga 25 × 0,1 = Vb × 0,1 dan Vb = 25 mL.',
          '3) Pada titik ekuivalen, mol HCl sama dengan mol NaOH. Larutan hanya mengandung garam NaCl yang berasal dari asam kuat dan basa kuat.',
          '4) Ion Na⁺ dan Cl⁻ tidak bereaksi dengan air, sehingga pada suhu 25°C pH larutan pada titik ekuivalen adalah 7.',
        ],
        jawaban:
          '(a) Volume NaOH pada titik ekuivalen = 25 mL. (b) pH pada titik ekuivalen = 7.',
      },
      {
        id: 'cs-m3-5',
        soal:
          'Kadar asam asetat dalam cuka. Seorang siswa mengambil 10 mL sampel cuka dapur, kemudian mengencerkannya hingga volume 100 mL. Sebanyak 10 mL larutan hasil pengenceran dititrasi menggunakan NaOH 0,1 M. Volume NaOH rata-rata yang diperlukan hingga titik akhir titrasi adalah 8 mL. Reaksi yang terjadi: CH₃COOH(aq) + NaOH(aq) → CH₃COONa(aq) + H₂O(l). Tentukan (a) konsentrasi asam asetat pada larutan hasil pengenceran, (b) konsentrasi asam asetat pada sampel cuka awal, dan (c) kadar asam asetat dalam persen massa/volume. Diketahui massa molar CH₃COOH = 60 g/mol.',
        langkah: [
          '1) Tentukan perbandingan koefisien reaksi: a : b = 1 : 1.',
          '2) Hitung konsentrasi larutan hasil pengenceran: Va × Ma × a = Vb × Mb × b, sehingga 10 × Ma × 1 = 8 × 0,1 × 1 dan Ma = 0,08 M.',
          '3) Hitung konsentrasi sampel cuka awal menggunakan faktor pengenceran: M₁ × V₁ = M₂ × V₂, sehingga Mawal × 10 = 0,08 × 100 dan Mawal = 0,8 M.',
          '4) Hitung massa asam asetat dalam 1 liter sampel: m = M × Mr = 0,8 × 60 = 48 g/L.',
          '5) Ubah menjadi gram per 100 mL: (48 / 1000) × 100 = 4,8 g/100 mL.',
        ],
        jawaban:
          '(a) Konsentrasi larutan hasil pengenceran = 0,08 M. (b) Konsentrasi cuka awal = 0,8 M. (c) Kadar asam asetat = 4,8% (b/v).',
      },
    ],
    ringkasan: [
      'Reaksi penetralan H⁺(aq) + OH⁻(aq) → H₂O(l) menghasilkan garam dan air. Titrasi adalah penambahan larutan baku (titran) dari buret ke titrat di Erlenmeyer, dibantu indikator, untuk menentukan konsentrasi titrat.',
      'Di titik ekuivalen berlaku Va × Ma × a = Vb × Mb × b. Gunakan volume rata-rata dari beberapa percobaan, dan perhitungkan faktor pengenceran jika sampel diencerkan sebelum dititrasi.',
      'Titik ekuivalen adalah saat mol H⁺ = mol OH⁻, sedangkan titik akhir titrasi adalah saat indikator berubah warna. Keduanya harus sedekat mungkin agar galat titrasi kecil.',
      'Pada kurva titrasi, titik ekuivalen berada di tengah bagian kurva yang curam. pH titik ekuivalen asam kuat–basa kuat = 7, sedangkan asam lemah–basa kuat > 7.',
      'Indikator dipilih agar trayek pH-nya mengandung pH titik ekuivalen. Fenolftalein cocok untuk kedua jenis titrasi tersebut, sedangkan metil merah tidak cocok untuk titrasi asam lemah–basa kuat.',
    ],
    sumber: [
      {
        penulis: 'Kusumaningrum, W. I.',
        tahun: '2020',
        judul: 'Modul Pembelajaran SMA Kimia Kelas XI KD 3.13: Titrasi Asam Basa',
        penerbit: 'Direktorat SMA, Kemendikbud',
        halaman: 'Hlm. 7–12 dan 23–24',
      },
      {
        penulis: 'Kalsum, S., Devi, P. K., Masmiami, & Syahrul, H.',
        tahun: '2009',
        judul: 'Kimia 2: untuk SMA dan MA Kelas XI',
        penerbit: 'Pusat Perbukuan Depdiknas',
        halaman: 'Hlm. 179, 187–198',
      },
      {
        penulis: 'Chang, R., & Goldsby, K.',
        tahun: '2016',
        judul: 'Chemistry (12th ed.)',
        penerbit: 'McGraw-Hill Education',
        halaman: 'Bab 16, hlm. 730–741',
      },
      {
        penulis: 'Alviar-Agnew, M., & Agnew, H.',
        tahun: 't.t.',
        judul: '13.6: Acid–Base Titration',
        penerbit: 'Chemistry LibreTexts',
      },
      {
        penulis: 'Tempo',
        tahun: '2025',
        judul: '“Sungai di Zambia Mati Setelah Dam Tailing Tambang Milik Perusahaan Cina Jebol”',
        penerbit: 'Tempo',
      },
      {
        penulis: 'Kille, R., & Zimba, J.',
        tahun: '2025',
        judul: '“A river ‘died’ overnight in Zambia after an acidic waste spill at a Chinese-owned mine”',
        penerbit: 'Associated Press',
      },
    ],
  },
];

// Alias ekspor untuk kompatibilitas kode lain
export const modules = daftarModul;

// ---------- DATA F2: SANDBOX TEORI ASAM BASA (FITUR MENDATANG) ----------

export type PeranTeori = 'asam' | 'basa' | 'bukan';

export type ReaksiSandbox = {
  id: string;
  persamaan: string;
  zat: {
    rumus: string;
    arrhenius: PeranTeori;
    bronstedLowry: PeranTeori;
    lewis: PeranTeori;
  }[];
  pasanganKonjugasi?: [string, string][];
  umpanBalik: {
    benar: string;
    salahUmum1: string;
    salahUmum2: string;
  };
  tingkat: 'mudah' | 'sedang' | 'sulit';
};

export const reaksiSandbox: ReaksiSandbox[] = [];

// ---------- DATA F4: SIMULATOR MIKRO-MAKRO (FITUR MENDATANG) ----------

export type ZatSimulator = {
  id: string;
  rumus: string;
  nama: string;
  jenis: 'asam-kuat' | 'basa-kuat' | 'asam-lemah' | 'basa-lemah';
  tetapan: number | null;
  sumberTetapan: string;
  konsentrasiMin: number;
  konsentrasiMax: number;
  langkah: number;
};

export const zatSimulator: ZatSimulator[] = [];


// ---------- KUIS (Pertemuan 03, kontrak docs/DATABASE.md) ----------

export interface OpsiSoal {
  id: 'A' | 'B' | 'C' | 'D';
  teks: string;
}

export interface SoalKuis {
  id: string;
  konsep: string;
  subMateriId: string;
  pertanyaan: string;
  opsi: OpsiSoal[];
  jawabanBenar: 'A' | 'B' | 'C' | 'D';
  pembahasan: string;
  miskonsepsi?: string;
}

export interface Kuis {
  activityId: string;
  questionVersion: string;
  soal: SoalKuis[];
}

export const kuisPerModul: Record<Modul['id'], Kuis> = {
  modul_1: {
    activityId: 'kuis-teori',
    questionVersion: 'v1',
    soal: [
      {
        id: 'm1-q1',
        konsep: 'definisi-arrhenius',
        subMateriId: 'm1-arrhenius',
        pertanyaan:
          'Menurut teori Arrhenius, pernyataan yang tepat untuk menjelaskan sifat asam HNO₃ ketika dilarutkan dalam air adalah ....',
        opsi: [
          { id: 'A', teks: 'HNO₃ meningkatkan konsentrasi ion H⁺ dalam larutan.' },
          { id: 'B', teks: 'HNO₃ meningkatkan konsentrasi ion OH⁻ dalam larutan.' },
          { id: 'C', teks: 'HNO₃ menerima pasangan elektron dari air.' },
          { id: 'D', teks: 'HNO₃ menerima proton dari air.' },
        ],
        jawabanBenar: 'A',
        pembahasan:
          'Asam Arrhenius adalah zat yang meningkatkan konsentrasi ion H⁺ (atau H₃O⁺) dalam air. HNO₃ terionisasi menghasilkan H⁺ dan NO₃⁻.',
        miskonsepsi:
          'Opsi B: Tertukar antara sifat asam dan basa Arrhenius; peningkatan OH⁻ merupakan ciri basa. Opsi C: Mencampuradukkan definisi asam Arrhenius dengan konsep asam Lewis. Opsi D: Mencampuradukkan definisi asam dengan basa Brønsted-Lowry; penerima proton adalah basa.',
      },
      {
        id: 'm1-q2',
        konsep: 'bronsted-lowry',
        subMateriId: 'm1-bronsted-lowry',
        pertanyaan:
          'Perhatikan reaksi: H₂PO₄⁻ + H₂O ⇌ HPO₄²⁻ + H₃O⁺. Spesi yang bertindak sebagai asam Brønsted-Lowry adalah ....',
        opsi: [
          { id: 'A', teks: 'H₂O, karena menerima proton.' },
          { id: 'B', teks: 'H₂PO₄⁻, karena mendonorkan proton.' },
          { id: 'C', teks: 'HPO₄²⁻, karena mendonorkan proton.' },
          { id: 'D', teks: 'H₃O⁺, karena menerima proton.' },
        ],
        jawabanBenar: 'B',
        pembahasan:
          'Asam Brønsted-Lowry adalah donor proton. H₂PO₄⁻ melepaskan satu H⁺ kepada H₂O sehingga terbentuk HPO₄²⁻ dan H₃O⁺.',
        miskonsepsi:
          'Opsi A: Membalik peran air pada reaksi; air menerima proton sehingga bertindak sebagai basa. Opsi C: Memilih produk hasil pelepasan proton, bukan spesi asam pada reaksi maju. Opsi D: Keliru mengidentifikasi arah perpindahan proton; H₃O⁺ terbentuk setelah air menerima proton.',
      },
      {
        id: 'm1-q3',
        konsep: 'asam-basa-lewis',
        subMateriId: 'm1-lewis',
        pertanyaan:
          'Dalam reaksi AlCl₃ + Cl⁻ → AlCl₄⁻, AlCl₃ bertindak sebagai asam Lewis karena ....',
        opsi: [
          { id: 'A', teks: 'Mendonorkan proton kepada Cl⁻.' },
          { id: 'B', teks: 'Menerima pasangan elektron dari Cl⁻.' },
          { id: 'C', teks: 'Mendonorkan pasangan elektron kepada Cl⁻.' },
          { id: 'D', teks: 'Menghasilkan ion OH⁻ dalam air.' },
        ],
        jawabanBenar: 'B',
        pembahasan:
          'Asam Lewis adalah penerima pasangan elektron. Atom Al pada AlCl₃ kekurangan elektron dan menerima pasangan elektron dari ion Cl⁻.',
        miskonsepsi:
          'Opsi A: Menggunakan definisi asam Brønsted-Lowry, bukan Lewis. Opsi C: Membalik definisi asam dan basa Lewis; donor pasangan elektron adalah basa Lewis. Opsi D: Menganggap definisi Lewis harus melibatkan pembentukan OH⁻ seperti konsep Arrhenius.',
      },
      {
        id: 'm1-q4',
        konsep: 'pasangan-asam-basa-konjugasi',
        subMateriId: 'm1-bronsted-lowry',
        pertanyaan:
          'Pada reaksi NH₃ + H₂O ⇌ NH₄⁺ + OH⁻, pasangan basa dan asam konjugasi yang benar adalah ....',
        opsi: [
          { id: 'A', teks: 'NH₃/NH₄⁺.' },
          { id: 'B', teks: 'H₂O/NH₄⁺.' },
          { id: 'C', teks: 'NH₃/OH⁻.' },
          { id: 'D', teks: 'H₂O/NH₃.' },
        ],
        jawabanBenar: 'A',
        pembahasan:
          'NH₃ menerima proton dari H₂O dan berubah menjadi NH₄⁺. Karena berbeda satu proton, NH₃ adalah basa dan NH₄⁺ adalah asam konjugasinya.',
        miskonsepsi:
          'Opsi B: Memasangkan spesi yang bukan pasangan konjugasi karena tidak berbeda hanya satu proton. Opsi C: Menganggap OH⁻ sebagai asam konjugasi NH₃, padahal OH⁻ terbentuk dari H₂O yang melepas proton. Opsi D: Tidak memperhatikan bahwa pasangan konjugasi harus berasal dari satu spesi yang menerima atau melepas H⁺.',
      },
      {
        id: 'm1-q5',
        konsep: 'spesi-amfiprotik',
        subMateriId: 'm1-bronsted-lowry',
        pertanyaan:
          'Pernyataan yang benar mengenai ion HCO₃⁻ adalah ....',
        opsi: [
          { id: 'A', teks: 'HCO₃⁻ hanya dapat bertindak sebagai asam.' },
          { id: 'B', teks: 'HCO₃⁻ hanya dapat bertindak sebagai basa.' },
          { id: 'C', teks: 'HCO₃⁻ dapat mendonorkan maupun menerima proton.' },
          { id: 'D', teks: 'HCO₃⁻ tidak dapat bereaksi dengan asam atau basa.' },
        ],
        jawabanBenar: 'C',
        pembahasan:
          'HCO₃⁻ bersifat amfiprotik. Ion ini dapat mendonorkan H⁺ menjadi CO₃²⁻ atau menerima H⁺ menjadi H₂CO₃.',
        miskonsepsi:
          'Opsi A: Hanya mengenali kemampuan HCO₃⁻ mendonorkan proton dan mengabaikan kemampuannya menerima proton. Opsi B: Hanya mengenali kemampuan HCO₃⁻ menerima proton dan mengabaikan kemampuannya mendonorkan proton. Opsi D: Belum memahami bahwa spesi amfiprotik dapat berperan sebagai asam maupun basa.',
      },
    ],
  },
  modul_2: {
    activityId: 'kuis-ph',
    questionVersion: 'v1',
    soal: [
      {
        id: 'm2-q1',
        konsep: 'ph-basa-kuat',
        subMateriId: 'm2-penentuan-ph',
        pertanyaan:
          'Larutan Ba(OH)₂ memiliki konsentrasi 0,0025 M dan terionisasi sempurna. Berapakah pH larutan tersebut pada 25 °C?',
        opsi: [
          { id: 'A', teks: '2,30' },
          { id: 'B', teks: '11,70' },
          { id: 'C', teks: '11,40' },
          { id: 'D', teks: '2,60' },
        ],
        jawabanBenar: 'B',
        pembahasan:
          'Ba(OH)₂ → Ba²⁺ + 2OH⁻, sehingga [OH⁻] = 2 × 0,0025 = 0,0050 M. pOH = −log(0,0050) ≈ 2,30; pH = 14 − 2,30 = 11,70.',
        miskonsepsi:
          'Opsi A: Melaporkan nilai pOH (2,30) sebagai pH, atau lupa hubungan pH + pOH = 14. Opsi C: Tidak memperhitungkan dua ion OH⁻ tiap satu formula Ba(OH)₂, sehingga [OH⁻] = 0,0025 M, pOH = 2,60, dan pH = 11,40. Opsi D: Tidak memperhitungkan dua ion OH⁻ dan sekaligus melaporkan pOH (2,60) sebagai pH.',
      },
      {
        id: 'm2-q2',
        konsep: 'ph-asam-kuat',
        subMateriId: 'm2-penentuan-ph',
        pertanyaan:
          'Larutan HCl 2,5 × 10⁻³ M dianggap terionisasi sempurna. Nilai pH larutan tersebut adalah ....',
        opsi: [
          { id: 'A', teks: '2,60' },
          { id: 'B', teks: '3,40' },
          { id: 'C', teks: '11,40' },
          { id: 'D', teks: '1,60' },
        ],
        jawabanBenar: 'A',
        pembahasan:
          'HCl merupakan asam kuat sehingga [H⁺] ≈ 2,5 × 10⁻³ M. pH = −log(2,5 × 10⁻³) ≈ 2,60.',
        miskonsepsi:
          'Opsi B: Menambahkan log 2,5 (0,40) ke pangkat 3, padahal seharusnya dikurangkan (3 − 0,40). Opsi C: Melaporkan pOH (14 − 2,60 = 11,40) sebagai pH, atau membalik sifat asam dan basa. Opsi D: Kesalahan memanipulasi pangkat sepuluh dan nilai log 2,5 (mis. 2 − 0,40).',
      },
      {
        id: 'm2-q3',
        konsep: 'ph-asam-lemah',
        subMateriId: 'm2-kekuatan-asam-basa',
        pertanyaan:
          'Asam benzoat (HBz) 0,20 M memiliki Ka = 6,3 × 10⁻⁵. Dengan pendekatan x kecil, perkiraan pH larutan adalah ....',
        opsi: [
          { id: 'A', teks: '1,45' },
          { id: 'B', teks: '2,45' },
          { id: 'C', teks: '3,45' },
          { id: 'D', teks: '4,45' },
        ],
        jawabanBenar: 'B',
        pembahasan:
          'Untuk asam lemah monoprotik, [H⁺] ≈ √(Ka × C) = √(6,3 × 10⁻⁵ × 0,20) ≈ 3,55 × 10⁻³ M. Maka pH ≈ −log(3,55 × 10⁻³) = 2,45.',
        miskonsepsi:
          'Opsi A: Kesalahan pangkat sepuluh pada [H⁺] (hasil 3,55 × 10⁻²) sehingga larutan terkesan jauh lebih asam. Opsi C: Kesalahan pangkat sepuluh pada [H⁺] (hasil 3,55 × 10⁻⁴) atau salah menghitung akar kuadrat. Opsi D: [H⁺] terlalu kecil dua orde; kemungkinan menganggap asam lemah hampir tidak terionisasi.',
      },
      {
        id: 'm2-q4',
        konsep: 'ph-basa-lemah',
        subMateriId: 'm2-kekuatan-asam-basa',
        pertanyaan:
          'Larutan piridina (C₅H₅N) 0,050 M memiliki Kb = 1,7 × 10⁻⁹. Dengan pendekatan x kecil, perkiraan pH larutan pada 25 °C adalah ....',
        opsi: [
          { id: 'A', teks: '5,04' },
          { id: 'B', teks: '7,00' },
          { id: 'C', teks: '8,96' },
          { id: 'D', teks: '12,70' },
        ],
        jawabanBenar: 'C',
        pembahasan:
          '[OH⁻] ≈ √(Kb × C) = √(1,7 × 10⁻⁹ × 0,050) ≈ 9,22 × 10⁻⁶ M. pOH ≈ 5,04 sehingga pH = 14 − 5,04 ≈ 8,96.',
        miskonsepsi:
          'Opsi A: Menghitung pOH tetapi melaporkannya sebagai pH. Opsi B: Menganggap semua larutan memiliki pH netral tanpa mempertimbangkan sifat basa lemah. Opsi D: Menganggap basa lemah terionisasi sempurna sehingga [OH⁻] = 0,050 M, pOH = 1,30, dan pH = 12,70.',
      },
      {
        id: 'm2-q5',
        konsep: 'hubungan-ph-konsentrasi-h',
        subMateriId: 'm2-penentuan-ph',
        pertanyaan:
          'Jika pH suatu larutan turun dari 5 menjadi 4 pada suhu yang sama, bagaimana perubahan konsentrasi ion H⁺?',
        opsi: [
          { id: 'A', teks: 'Menjadi 2 kali lebih besar.' },
          { id: 'B', teks: 'Menjadi 5 kali lebih besar.' },
          { id: 'C', teks: 'Menjadi 10 kali lebih besar.' },
          { id: 'D', teks: 'Menjadi 100 kali lebih kecil.' },
        ],
        jawabanBenar: 'C',
        pembahasan:
          'pH = −log[H⁺]. Penurunan pH satu satuan berarti konsentrasi H⁺ meningkat sepuluh kali lipat.',
        miskonsepsi:
          'Opsi A: Menganggap skala pH bersifat linear, bukan logaritmik. Opsi B: Tidak memahami bahwa perubahan satu satuan pH setara faktor sepuluh. Opsi D: Membalik arah perubahan (konsentrasi H⁺ justru naik saat pH turun) dan keliru menentukan faktor perubahannya.',
      },
    ],
  },
  modul_3: {
    activityId: 'kuis-titrasi',
    questionVersion: 'v1',
    soal: [
      {
        id: 'm3-q1',
        konsep: 'perhitungan-konsentrasi-titrasi',
        subMateriId: 'm3-hitung-konsentrasi',
        pertanyaan:
          'Sebanyak 18,0 mL larutan HNO₃ dititrasi dengan KOH 0,150 M. Titik ekuivalen tercapai setelah penambahan 15,0 mL KOH. Konsentrasi HNO₃ adalah ....',
        opsi: [
          { id: 'A', teks: '0,068 M' },
          { id: 'B', teks: '0,125 M' },
          { id: 'C', teks: '0,150 M' },
          { id: 'D', teks: '0,180 M' },
        ],
        jawabanBenar: 'B',
        pembahasan:
          'Reaksi HNO₃ + KOH → KNO₃ + H₂O memiliki perbandingan mol 1 : 1. Va × Ma = Vb × Mb, sehingga M HNO₃ = (0,150 × 15,0) ÷ 18,0 = 0,125 M.',
        miskonsepsi:
          'Opsi A: Membagi dengan volume total campuran (18,0 + 15,0 = 33,0 mL), bukan dengan volume analit awal. Opsi C: Menyalin konsentrasi titran sebagai konsentrasi analit tanpa perhitungan. Opsi D: Membalik rasio volume: 0,150 × 18,0 ÷ 15,0 = 0,180 M.',
      },
      {
        id: 'm3-q2',
        konsep: 'stoikiometri-titrasi-asam-poliprotik',
        subMateriId: 'm3-hitung-konsentrasi',
        pertanyaan:
          'Sebanyak 12,0 mL H₃PO₄ 0,080 M dititrasi dengan NaOH 0,120 M hingga seluruh proton H₃PO₄ ternetralkan (terbentuk Na₃PO₄). Volume NaOH yang diperlukan adalah ....',
        opsi: [
          { id: 'A', teks: '8,0 mL' },
          { id: 'B', teks: '16,0 mL' },
          { id: 'C', teks: '24,0 mL' },
          { id: 'D', teks: '32,0 mL' },
        ],
        jawabanBenar: 'C',
        pembahasan:
          'Reaksi H₃PO₄ + 3NaOH → Na₃PO₄ + 3H₂O membutuhkan 3 mol OH⁻ per 1 mol H₃PO₄. Mol H₃PO₄ = 0,080 × 0,0120 = 9,6 × 10⁻⁴ mol. Mol NaOH = 3 × 9,6 × 10⁻⁴ = 2,88 × 10⁻³ mol. V NaOH = n ÷ M = 0,00288 ÷ 0,120 = 0,0240 L = 24,0 mL.',
        miskonsepsi:
          'Opsi A: Mengabaikan faktor tiga proton yang dinetralkan pada H₃PO₄ (memakai faktor 1). Opsi B: Menggunakan faktor stoikiometri dua, bukan tiga. Opsi D: Menggunakan faktor stoikiometri empat atau salah menghitung mol titran.',
      },
      {
        id: 'm3-q3',
        konsep: 'ph-titik-ekuivalen',
        subMateriId: 'm3-kurva-titrasi',
        pertanyaan:
          'Pada titrasi 25 mL CH₃COOH 0,1 M dengan NaOH 0,1 M, titik ekuivalen tercapai pada 25 mL dengan pH sekitar 8,7. Pernyataan yang tepat mengenai pH di titik ekuivalen adalah ....',
        opsi: [
          { id: 'A', teks: 'pH di atas 7 karena larutan berisi ion CH₃COO⁻ yang bereaksi dengan air menghasilkan sedikit OH⁻.' },
          { id: 'B', teks: 'pH seharusnya 7 karena jumlah mol asam sama dengan jumlah mol basa.' },
          { id: 'C', teks: 'pH di atas 7 karena NaOH yang ditambahkan sudah berlebih.' },
          { id: 'D', teks: 'pH di bawah 7 karena asam asetat adalah asam lemah.' },
        ],
        jawabanBenar: 'A',
        pembahasan:
          'Di titik ekuivalen, seluruh CH₃COOH sudah bereaksi menjadi CH₃COO⁻ dan Na⁺. Ion CH₃COO⁻ sedikit bereaksi dengan air dan menghasilkan OH⁻, sehingga pH di titik ekuivalen berada di atas 7.',
        miskonsepsi:
          'Opsi B: Menyamakan titik ekuivalen dengan kondisi netral (pH 7). Opsi C: Menyamakan titik ekuivalen dengan kondisi setelah titik ekuivalen, saat NaOH berlebih. Opsi D: Mengira masih ada asam asetat tersisa di titik ekuivalen.',
      },
      {
        id: 'm3-q4',
        konsep: 'pemilihan-indikator',
        subMateriId: 'm3-pemilihan-indikator',
        pertanyaan:
          'Pada titrasi CH₃COOH dengan NaOH, pH titik ekuivalen sekitar 8,7. Indikator yang paling tepat digunakan adalah ....',
        opsi: [
          { id: 'A', teks: 'Metil jingga (trayek pH 3,1–4,4)' },
          { id: 'B', teks: 'Metil merah (trayek pH 4,4–6,2)' },
          { id: 'C', teks: 'Bromtimol biru (trayek pH 6,0–7,6)' },
          { id: 'D', teks: 'Fenolftalein (trayek pH 8,3–10,0)' },
        ],
        jawabanBenar: 'D',
        pembahasan:
          'Indikator dipilih agar trayek pH-nya mengandung pH titik ekuivalen. Trayek fenolftalein (8,3–10,0) mengandung pH 8,7, sehingga perubahan warnanya terjadi tepat di sekitar titik ekuivalen.',
        miskonsepsi:
          'Opsi A: Memilih indikator yang trayeknya jauh di bawah pH titik ekuivalen, sehingga warna berubah terlalu awal. Opsi B: Sama dengan A; metil merah cocok untuk titrasi yang pH titik ekuivalennya di bawah 7. Opsi C: Menganggap pH titik ekuivalen selalu 7 (netral).',
      },
      {
        id: 'm3-q5',
        konsep: 'pembacaan-buret',
        subMateriId: 'm3-prinsip-prosedur',
        pertanyaan:
          'Pembacaan buret sebelum titrasi adalah 0,35 mL dan setelah titrasi adalah 22,80 mL. Volume titran yang digunakan adalah ....',
        opsi: [
          { id: 'A', teks: '22,80 mL' },
          { id: 'B', teks: '23,15 mL' },
          { id: 'C', teks: '22,45 mL' },
          { id: 'D', teks: '0,35 mL' },
        ],
        jawabanBenar: 'C',
        pembahasan:
          'Volume titran yang keluar dari buret adalah pembacaan akhir dikurangi pembacaan awal: 22,80 − 0,35 = 22,45 mL.',
        miskonsepsi:
          'Opsi A: Menggunakan pembacaan akhir saja dan mengabaikan volume awal buret. Opsi B: Menjumlahkan pembacaan awal dan akhir, bukan mencari selisihnya. Opsi D: Menggunakan pembacaan awal sebagai volume titran yang terpakai.',
      },
    ],
  },
};

