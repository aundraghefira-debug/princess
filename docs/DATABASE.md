# DATABASE.md — Kontrak Penyimpanan Lokal ChemiVerse

> Pertemuan 03 · Local First · Pemilik data: `guest`
> Kontrak ini menggantikan struktur `localStorage` lama di `AGENT.md` Bagian 02.
> Login, akun, dan penyimpanan cloud baru dibahas di Pertemuan 04.

---

## 1. Lokasi Data

| Jenis data | Disimpan di | Keterangan |
|---|---|---|
| Materi, soal, kunci, pembahasan | `src/data/chemData.ts` | Bagian dari kode, tidak berubah saat siswa belajar |
| Draf jawaban yang sedang dikerjakan | `localStorage` → `drafts` | Pulih setelah refresh |
| Hasil percobaan yang sudah dikirim | `localStorage` → `records` | Tidak diubah lagi setelah dibekukan |
| Progres modul | `localStorage` → `progress` | Modul yang sudah diselesaikan |

Semua akses `localStorage` hanya melalui `src/lib/localStore.ts`. Komponen tidak boleh memanggil `localStorage` secara langsung.

---

## 2. Key Penyimpanan

Satu key untuk seluruh produk:

```
chem:chemiverse:v1
```

Isinya satu string JSON dengan struktur:

```json
{
  "schemaVersion": 1,
  "scopes": {
    "guest": {
      "drafts": {
        "modul-1:kuis-teori:v1": { ...Draf }
      },
      "records": {
        "<ID-percobaan>": { ...Hasil }
      },
      "progress": {
        "completedModules": ["modul_1"]
      }
    }
  }
}
```

---

## 3. Kunci Aktivitas (`activityKey`)

Format: `<moduleId>:<activityId>:<questionVersion>`

| Aktivitas | activityKey | kind |
|---|---|---|
| Kuis gabungan Modul 1–3, Mode Evaluasi | `gabungan:kuis-gabungan:v1` | `diagnostic` |
| Kuis gabungan Modul 1–3, Mode Belajar | `gabungan:kuis-belajar:v1` | `practice` |

Soal diambil dari `kuisPerModul` di `src/data/chemData.ts` (5 soal per modul, total 15). Kunci aktivitas per modul (`modul-1:kuis-teori:v1`, dst.) tidak lagi dipakai untuk menyimpan hasil, karena kuis sudah dipindah ke halaman Kuis.

---

## 4. Struktur Draf

Disimpan setiap kali siswa mengubah pilihan.

```json
{
  "id": "<UUID-percobaan>",
  "moduleId": "modul-1",
  "activityId": "kuis-teori",
  "questionVersion": "v1",
  "kind": "diagnostic",
  "answers": { "m1-q1": "A", "m1-q2": "C" },
  "startedAt": "<waktu-perangkat-ISO>",
  "updatedAt": "<waktu-perangkat-ISO>"
}
```

---

## 5. Struktur Hasil (Record)

Dibuat saat siswa menekan **Kirim** dan semua validasi lolos.

```json
{
  "id": "<UUID-percobaan>",
  "ownerId": "guest",
  "alias": "",
  "moduleId": "modul-1",
  "activityId": "kuis-teori",
  "questionVersion": "v1",
  "kind": "diagnostic",
  "answers": {
    "m1-q1": "A",
    "m1-q2": "B",
    "m1-q3": "C",
    "m1-q4": "D",
    "m1-q5": "B"
  },
  "correctCount": 5,
  "totalQuestions": 5,
  "score": 100,
  "startedAt": "<waktu-perangkat-ISO>",
  "completedAt": "<waktu-perangkat-ISO>",
  "status": "local"
}
```

| Field | Aturan |
|---|---|
| `id` | `crypto.randomUUID()`, dibuat **sekali** saat siswa menekan Mulai. Tidak dibuat ulang saat render atau refresh. |
| `kind` | `"diagnostic"` = Mode Evaluasi, `"practice"` = Mode Belajar. Harus sesuai perilaku tampilan. |
| `answers` | Peta ID soal → ID opsi. Disimpan per butir, bukan hanya skor. |
| `score` | `correctCount ÷ totalQuestions × 100`, dibulatkan ke bilangan bulat. |
| `completedAt` | `new Date().toISOString()` dari perangkat. |
| `status` | `"local"` untuk Pertemuan 03. |
| `alias` | Dikosongkan. Jangan menyimpan nama asli, email, atau data pribadi siswa. |

---

## 6. Aturan Mode

| | Mode Evaluasi (`diagnostic`) | Mode Belajar (`practice`) |
|---|---|---|
| Kirim | Hanya jika semua soal terisi | Per soal |
| Jawaban setelah kirim | Dibekukan, tidak bisa diubah | Boleh diubah |
| Pembahasan | Muncul setelah kirim | Muncul per soal |
| Mengulang | ID percobaan baru; record lama tetap ada | ID percobaan baru |

---

## 7. Reset dan Hapus

| Tindakan | Yang terhapus | Yang tetap |
|---|---|---|
| **Ulangi kuis** | Draf aktivitas itu saja | Semua record |
| **Hapus riwayat perangkat** | Seluruh isi key `chem:chemiverse:v1` | Data situs lain |

- Hapus riwayat wajib memakai konfirmasi terpisah. Tombol **Batal** tidak menghapus apa pun.
- **Dilarang memakai `localStorage.clear()`.** Gunakan `localStorage.removeItem("chem:chemiverse:v1")`.

---

## 8. Penanganan Kegagalan

| Kondisi | Perilaku aplikasi |
|---|---|
| Key belum ada | Mulai dari struktur kosong. Tampilkan "Belum ada hasil", bukan skor 0. |
| JSON rusak | Jangan ditimpa diam-diam. Tampilkan pesan pemulihan dan tombol hapus data dengan konfirmasi. Materi dan kuis tetap bisa dibuka. |
| `localStorage` ditolak / penuh | Kuis tetap berjalan. Tampilkan "Hasil belum tersimpan pada perangkat" dan tombol coba lagi. |
| Simpan berhasil | Baru boleh menampilkan "Draf tersimpan" atau "Hasil tersimpan". |

Semua baca/tulis dibungkus `try/catch`.

---

## 9. Rencana Pertemuan 04

- Hasil `guest` dapat dipilih untuk dikaitkan ke akun siswa setelah login.
- `receivedAt` dibuat oleh server, terpisah dari `completedAt`.
- Satu akun guru dapat membaca hasil siswa di kelasnya.
- Kredensial (API key, config Firebase/Supabase) tidak disimpan di repo atau AI_LOG.

---

## 10. Rencana Integrasi Bab 4

| Hal | Keputusan |
|---|---|
| Provider | **Firebase** (Authentication + Firestore). Supabase sebagai cadangan. |
| Guru | Satu guru untuk satu kelas, membaca hasil siswa di kelasnya. |
| Data yang dikirim ke cloud | Record hasil (`records`) yang dipilih siswa setelah login. |
| Data yang tetap lokal | Draf yang sedang dikerjakan (`drafts`). |
| Label status hasil | `local` (tersimpan di perangkat) → `pending` (menunggu kirim) → `synced` (terkirim). |
| Kredensial | Disimpan di `.env.local`, tidak di-commit, tidak ditulis di AI_LOG. |