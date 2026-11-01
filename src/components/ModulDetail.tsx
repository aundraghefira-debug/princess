import React from 'react';
import { modules, type Modul, type SubMateri } from '../data/chemData';
import { type ChemiVerseState } from '../types';
import './ModulDetail.css';

export interface ModulDetailProps {
  moduleId: string; // e.g. 'modul_1' or 'modul-1'
  onBackToHome: () => void;
  onNavigateModule?: (moduleId: string) => void;
  userState?: ChemiVerseState;
  onUpdateUserState?: (newState: ChemiVerseState) => void;
}

interface ParsedApersepsi {
  judul: string;
  cerita: string;
  pertanyaan: string[];
  kaitan: string;
  hasContent: boolean;
}

export const ModulDetail: React.FC<ModulDetailProps> = ({
  moduleId,
  onBackToHome,
  onNavigateModule,
  userState,
  onUpdateUserState,
}) => {
  // Mencocokkan modul dari chemData.ts (baik berformat 'modul-1' maupun 'modul_1')
  const modul: Modul | undefined = modules.find(
    (m) =>
      m.id === moduleId ||
      m.id === moduleId.replace('_', '-') ||
      m.id.replace('-', '_') === moduleId
  );

  // Ambil nomor modul (1, 2, atau 3)
  const moduleNumberMatch = moduleId.match(/\d+/);
  const moduleNumber = moduleNumberMatch ? parseInt(moduleNumberMatch[0], 10) : 1;

  // Cek apakah modul ini sudah selesai di local storage
  const normalizedId = modul?.id || moduleId;
  const isCompleted = userState?.completed_modules.some(
    (id) => id === normalizedId || id === moduleId || id === moduleId.replace('-', '_')
  );

  const toggleCompletion = () => {
    if (!userState || !onUpdateUserState) return;
    const currentCompleted = userState.completed_modules;
    const keyToUse = moduleId;
    const exists = currentCompleted.includes(keyToUse) || currentCompleted.includes(normalizedId);

    const updated = exists
      ? currentCompleted.filter((id) => id !== keyToUse && id !== normalizedId)
      : [...currentCompleted, keyToUse];

    onUpdateUserState({
      ...userState,
      completed_modules: updated,
    });
  };

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (!modul) {
    return (
      <div className="modul-detail-container">
        <div className="modul-top-bar">
          <button type="button" className="btn-back-home" onClick={onBackToHome}>
            ← Kembali ke Beranda
          </button>
        </div>
        <div className="modul-hero-header">
          <h2 className="modul-hero-title">Modul Tidak Ditemukan</h2>
          <p className="modul-hero-desc">Materi bagian ini sedang disiapkan.</p>
          <button type="button" className="btn-primary-action" onClick={onBackToHome}>
            Kembali ke Beranda
          </button>
        </div>
      </div>
    );
  }

  // 1. Parsing Tujuan Belajar
  const rawTujuan = (modul.tujuanBelajar || (modul as unknown as { tujuan?: string[] }).tujuan || []);
  const tujuanList = rawTujuan.filter((t): t is string => typeof t === 'string' && t.trim().length > 0);

  // 2. Parsing Apersepsi (bisa berupa object maupun string dari chemData.ts)
  const parseApersepsiData = (raw: unknown): ParsedApersepsi => {
    if (!raw) {
      return { judul: '', cerita: '', pertanyaan: [], kaitan: '', hasContent: false };
    }

    if (typeof raw === 'object' && raw !== null) {
      const obj = raw as Record<string, unknown>;
      const judul = typeof obj.judul === 'string' ? obj.judul.trim() : '';
      const cerita = typeof obj.cerita === 'string' ? obj.cerita.trim() : '';
      let pertanyaan: string[] = [];
      if (Array.isArray(obj.pertanyaan)) {
        pertanyaan = obj.pertanyaan.filter((p): p is string => typeof p === 'string' && p.trim().length > 0);
      } else if (typeof obj.pertanyaan === 'string' && obj.pertanyaan.trim()) {
        pertanyaan = [obj.pertanyaan.trim()];
      }
      const kaitan = typeof obj.kaitan === 'string' ? obj.kaitan.trim() : '';
      return {
        judul,
        cerita,
        pertanyaan,
        kaitan,
        hasContent: Boolean(judul || cerita || pertanyaan.length > 0 || kaitan),
      };
    }

    if (typeof raw === 'string') {
      const trimmed = raw.trim();
      if (!trimmed) {
        return { judul: '', cerita: '', pertanyaan: [], kaitan: '', hasContent: false };
      }
      try {
        const parsed = JSON.parse(trimmed);
        if (typeof parsed === 'object' && parsed !== null) {
          return parseApersepsiData(parsed);
        }
      } catch {
        // Bukan format JSON, gunakan sebagai string cerita murni
      }
      return {
        judul: '',
        cerita: trimmed,
        pertanyaan: [],
        kaitan: '',
        hasContent: true,
      };
    }

    return { judul: '', cerita: '', pertanyaan: [], kaitan: '', hasContent: false };
  };

  const apersepsiData = parseApersepsiData(modul.apersepsi);

  // Helper untuk mengekstrak persamaan reaksi hanya dari data sub-materi chemData.ts
  const getPersamaanReaksi = (sub: SubMateri): string[] => {
    const explicitEq = (sub as unknown as { persamaanReaksi?: string[] | string }).persamaanReaksi;
    if (Array.isArray(explicitEq)) {
      return explicitEq.filter((eq): eq is string => typeof eq === 'string' && eq.trim().length > 0);
    }
    if (typeof explicitEq === 'string' && explicitEq.trim().length > 0) {
      return [explicitEq.trim()];
    }

    // Ekstraksi dari representasi simbolik jika memuat panah reaksi
    const simbolikText = sub.representasi?.simbolik || '';
    if (
      simbolikText &&
      (simbolikText.includes('→') ||
        simbolikText.includes('⇌') ||
        simbolikText.includes('->') ||
        simbolikText.includes('<=>'))
    ) {
      return simbolikText
        .split(/[;\n]/)
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
    }

    return [];
  };

  // Ringkasan data jika ada di chemData
  const rawRingkasan = (modul as unknown as { ringkasan?: string[] }).ringkasan;
  const ringkasanList = Array.isArray(rawRingkasan)
    ? rawRingkasan.filter((r): r is string => typeof r === 'string' && r.trim().length > 0)
    : [];

  return (
    <div className="modul-detail-container">
      {/* 01. Navigasi Atas & Status Progres Belajar */}
      <div className="modul-top-bar">
        <button
          type="button"
          id="btn-back-to-home"
          className="btn-back-home"
          onClick={onBackToHome}
          aria-label="Kembali ke Beranda"
        >
          <span>←</span>
          <span>Kembali ke Beranda</span>
        </button>

        <div className="modul-status-actions">
          <button
            type="button"
            className={`btn-status-toggle ${isCompleted ? 'completed' : ''}`}
            onClick={toggleCompletion}
            title="Klik untuk mengubah status penyelesaian modul ini"
          >
            <span>{isCompleted ? 'Modul Selesai ✓' : 'Tandai Belum Selesai'}</span>
          </button>
        </div>
      </div>

      {/* 02. Hero Banner Modul */}
      <header className="modul-hero-header">
        <div className="modul-badge-row">
          <span className="modul-tag-pill">Modul {moduleNumber}</span>
          <span className="fase-tag-pill">Fase F (Kelas XI)</span>
        </div>
        <h1 className="modul-hero-title">{modul.judul}</h1>
        <p className="modul-hero-desc">
          Tiga tingkat representasi: Makroskopis, Submikroskopis, dan Simbolik.
        </p>

        {/* Daftar Isi Cepat */}
        <nav className="modul-quick-nav" aria-label="Daftar Isi Modul">
          <span className="quick-nav-label">Daftar Isi:</span>
          <button type="button" className="quick-nav-link" onClick={() => scrollToSection('tujuan-belajar')}>
            1. Tujuan
          </button>
          <button type="button" className="quick-nav-link" onClick={() => scrollToSection('apersepsi')}>
            2. Apersepsi
          </button>
          <button type="button" className="quick-nav-link" onClick={() => scrollToSection('sub-materi')}>
            3. Sub-Materi
          </button>
          <button type="button" className="quick-nav-link" onClick={() => scrollToSection('contoh-soal')}>
            4. Contoh Soal
          </button>
          <button type="button" className="quick-nav-link" onClick={() => scrollToSection('ringkasan')}>
            5. Ringkasan
          </button>
          <button type="button" className="quick-nav-link" onClick={() => scrollToSection('sumber-pustaka')}>
            6. Sumber
          </button>
        </nav>
      </header>

      {/* ----------------------------------------------------------------------
         URUTAN 1: Tujuan Belajar (USER_FLOW.md Bagian 3)
         ---------------------------------------------------------------------- */}
      <section id="tujuan-belajar" className="modul-section-block">
        <div className="section-title-badge">
          <span>🎯 Bagian 1: Tujuan Pembelajaran</span>
        </div>
        <h2 className="section-main-heading">Tujuan Pembelajaran</h2>

        {tujuanList.length > 0 ? (
          <ul className="tujuan-list">
            {tujuanList.map((tujuan, idx) => (
              <li key={idx} className="tujuan-item">
                <span className="tujuan-check">✓</span>
                <span>{tujuan}</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="pending-content-box">
            <span className="pending-icon">ℹ️</span>
            <p>Materi bagian ini sedang disiapkan.</p>
          </div>
        )}

        <div className="section-next-action">
          <button
            type="button"
            className="btn-outline-next"
            onClick={() => scrollToSection('apersepsi')}
          >
            <span>Lanjut ke Apersepsi</span>
            <span>↓</span>
          </button>
        </div>
      </section>

      {/* ----------------------------------------------------------------------
         URUTAN 2: Apersepsi (USER_FLOW.md Bagian 3 & Aturan 2)
         - Tampilkan judul, cerita, daftar pertanyaan bernomor, lalu kalimat kaitan
           di dalam kotak berwarna.
         - Jika data kaitan belum ada, bagian itu tidak ditampilkan dan tidak error.
         ---------------------------------------------------------------------- */}
      <section id="apersepsi" className="modul-section-block">
        <div className="section-title-badge">
          <span>💡 Bagian 2: Apersepsi</span>
        </div>
        <h2 className="section-main-heading">Apersepsi</h2>

        {apersepsiData.hasContent ? (
          <div className="apersepsi-content-card">
            {apersepsiData.judul && (
              <h3 className="apersepsi-heading">{apersepsiData.judul}</h3>
            )}

            {apersepsiData.cerita && (
              <div className="apersepsi-story">
                {apersepsiData.cerita.split('\n\n').map((paragraf, pIdx) => (
                  <p key={pIdx}>{paragraf}</p>
                ))}
              </div>
            )}

            {apersepsiData.pertanyaan.length > 0 && (
              <div className="apersepsi-questions-group">
                <h4 className="apersepsi-subheading">Pertanyaan Pemantik:</h4>
                <ol className="apersepsi-numbered-list">
                  {apersepsiData.pertanyaan.map((pertanyaan, qIdx) => (
                    <li key={qIdx} className="apersepsi-q-item">
                      <span className="q-number">{qIdx + 1}.</span>
                      <span className="q-text">{pertanyaan}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Kotak Berwarna Kalimat Kaitan (HANYA tampil bila data kaitan ada dan tidak kosong) */}
            {apersepsiData.kaitan && apersepsiData.kaitan.trim() !== '' ? (
              <div className="apersepsi-kaitan-box">
                <div className="kaitan-box-header">
                  <span className="kaitan-icon">🔗</span>
                  <span>Kaitan Konsep:</span>
                </div>
                <p className="kaitan-text">{apersepsiData.kaitan}</p>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="pending-content-box">
            <span className="pending-icon">ℹ️</span>
            <p>Materi bagian ini sedang disiapkan.</p>
          </div>
        )}

        <div className="section-next-action">
          <button
            type="button"
            className="btn-outline-next"
            onClick={() => scrollToSection('sub-materi')}
          >
            <span>Lanjut ke Sub-Materi</span>
            <span>↓</span>
          </button>
        </div>
      </section>

      {/* ----------------------------------------------------------------------
         URUTAN 3: Sub-Materi (USER_FLOW.md Bagian 3 & Aturan 3)
         - Tampilkan penjelasan, persamaan reaksi, lalu representasi makroskopis,
           submikroskopis, dan simbolik dengan judul kecil masing-masing.
         ---------------------------------------------------------------------- */}
      <section id="sub-materi" className="modul-section-block">
        <div className="section-title-badge">
          <span>📚 Bagian 3: Sub-Materi</span>
        </div>
        <h2 className="section-main-heading">Sub-Materi &amp; Tiga Tingkat Representasi</h2>

        {modul.subMateri && modul.subMateri.length > 0 ? (
          <div className="submateri-list-wrapper">
            {modul.subMateri.map((sub, sIdx) => {
              const equations = getPersamaanReaksi(sub);
              const repMakro = sub.representasi?.makro || (sub.representasi as unknown as { makroskopis?: string })?.makroskopis;
              const repSubmikro = sub.representasi?.submikro || (sub.representasi as unknown as { submikroskopis?: string })?.submikroskopis;
              const repSimbolik = sub.representasi?.simbolik;

              return (
                <article key={sub.id || sIdx} className="submateri-card" id={`sub-${sub.id}`}>
                  {/* Header Sub-Materi */}
                  <div className="submateri-header-row">
                    <span className="submateri-pill">Sub-Materi 3.{sIdx + 1}</span>
                    <h3 className="submateri-title">{sub.judul}</h3>
                  </div>

                  {/* 1. Penjelasan Sub-Materi */}
                  <div className="submateri-penjelasan-box">
                    <h4 className="submateri-section-label">Penjelasan:</h4>
                    {sub.isi && sub.isi.trim() !== '' ? (
                      <p className="submateri-penjelasan-text">{sub.isi}</p>
                    ) : (
                      <p className="submateri-penjelasan-text empty-rep-note">
                        Materi bagian ini sedang disiapkan.
                      </p>
                    )}
                  </div>

                  {/* 2. Persamaan Reaksi (hanya menampilkan jika ada data di chemData.ts) */}
                  <div className="submateri-reaction-box">
                    <h4 className="submateri-section-label">
                      <span>🧪</span>
                      <span>Persamaan Reaksi:</span>
                    </h4>
                    {equations.length > 0 ? (
                      <div className="reaction-equations-list">
                        {equations.map((eq, eqIdx) => (
                          <div key={eqIdx} className="reaction-code-pill">
                            <code>{eq}</code>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="empty-rep-note">Materi bagian ini sedang disiapkan.</p>
                    )}
                  </div>

                  {/* Keterbatasan Teori jika ada pada data */}
                  {sub.keterbatasan && sub.keterbatasan.trim() !== '' && (
                    <div className="keterbatasan-box">
                      <span className="keterbatasan-badge">⚠️ Keterbatasan:</span>
                      <p>{sub.keterbatasan}</p>
                    </div>
                  )}

                  {/* 3. Tiga Tingkat Representasi Johnstone dengan Judul Kecil Masing-Masing */}
                  <div className="johnstone-submateri-section">
                    <div className="johnstone-section-header">
                      <h4 className="johnstone-section-title">
                        Tiga Tingkat Representasi Johnstone:
                      </h4>
                    </div>

                    <div className="johnstone-grid">
                      {/* 3.a. Representasi Makroskopis */}
                      <div className="johnstone-col-card card-makro">
                        <div className="johnstone-card-header">
                          <span className="johnstone-card-icon">👁️</span>
                          <h5 className="johnstone-card-title">Representasi Makroskopis</h5>
                        </div>
                        {repMakro && repMakro.trim() !== '' ? (
                          <p className="johnstone-card-content">{repMakro}</p>
                        ) : (
                          <p className="johnstone-card-content empty-rep-note">
                            Materi bagian ini sedang disiapkan.
                          </p>
                        )}
                      </div>

                      {/* 3.b. Representasi Submikroskopis */}
                      <div className="johnstone-col-card card-submikro">
                        <div className="johnstone-card-header">
                          <span className="johnstone-card-icon">🔬</span>
                          <h5 className="johnstone-card-title">Representasi Submikroskopis</h5>
                        </div>
                        {repSubmikro && repSubmikro.trim() !== '' ? (
                          <p className="johnstone-card-content">{repSubmikro}</p>
                        ) : (
                          <p className="johnstone-card-content empty-rep-note">
                            Materi bagian ini sedang disiapkan.
                          </p>
                        )}
                      </div>

                      {/* 3.c. Representasi Simbolik */}
                      <div className="johnstone-col-card card-simbolik">
                        <div className="johnstone-card-header">
                          <span className="johnstone-card-icon">📐</span>
                          <h5 className="johnstone-card-title">Representasi Simbolik</h5>
                        </div>
                        {repSimbolik && repSimbolik.trim() !== '' ? (
                          <p className="johnstone-card-content">
                            <code>{repSimbolik}</code>
                          </p>
                        ) : (
                          <p className="johnstone-card-content empty-rep-note">
                            Materi bagian ini sedang disiapkan.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="pending-content-box">
            <span className="pending-icon">ℹ️</span>
            <p>Materi bagian ini sedang disiapkan.</p>
          </div>
        )}

        <div className="section-next-action">
          <button
            type="button"
            className="btn-outline-next"
            onClick={() => scrollToSection('contoh-soal')}
          >
            <span>Lanjut ke Contoh Soal</span>
            <span>↓</span>
          </button>
        </div>
      </section>

      {/* ----------------------------------------------------------------------
         URUTAN 4: Contoh Soal (USER_FLOW.md Bagian 3)
         ---------------------------------------------------------------------- */}
      <section id="contoh-soal" className="modul-section-block">
        <div className="section-title-badge">
          <span>✏️ Bagian 4: Contoh Soal</span>
        </div>
        <h2 className="section-main-heading">Contoh Soal</h2>

        {modul.contohSoal && modul.contohSoal.length > 0 ? (
          <div className="contoh-soal-list">
            {modul.contohSoal.map((cs, cIdx) => (
              <div key={cs.id || cIdx} className="contoh-soal-card">
                <div className="cs-header">
                  <span className="cs-badge">Contoh {cIdx + 1}</span>
                </div>
                <p className="cs-problem">{cs.soal}</p>

                {cs.langkah && cs.langkah.length > 0 && (
                  <div className="cs-steps-box">
                    <h4 className="cs-steps-title">Langkah Penyelesaian:</h4>
                    <ol className="cs-steps-list">
                      {cs.langkah.map((step, sIdx) => (
                        <li key={sIdx}>{step}</li>
                      ))}
                    </ol>
                  </div>
                )}

                {cs.jawaban && (
                  <div className="cs-answer-box">
                    <span className="cs-answer-badge">Jawaban:</span>
                    <span className="cs-answer-text">{cs.jawaban}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="pending-content-box">
            <span className="pending-icon">ℹ️</span>
            <p>Materi bagian ini sedang disiapkan.</p>
          </div>
        )}

        <div className="section-next-action">
          <button
            type="button"
            className="btn-outline-next"
            onClick={() => scrollToSection('ringkasan')}
          >
            <span>Lanjut ke Ringkasan</span>
            <span>↓</span>
          </button>
        </div>
      </section>

      {/* ----------------------------------------------------------------------
         URUTAN 5: Ringkasan (USER_FLOW.md Bagian 3)
         - Hanya menampilkan data ringkasan dari chemData.ts
         ---------------------------------------------------------------------- */}
      <section id="ringkasan" className="modul-section-block">
        <div className="section-title-badge">
          <span>📋 Bagian 5: Ringkasan</span>
        </div>
        <h2 className="section-main-heading">Ringkasan</h2>

        <div className="ringkasan-content-wrapper">
          {ringkasanList.length > 0 ? (
            <ul className="ringkasan-points-list">
              {ringkasanList.map((pt, pIdx) => (
                <li key={pIdx} className="ringkasan-point-item">
                  <span className="ringkasan-bullet">✦</span>
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="pending-content-box">
              <span className="pending-icon">ℹ️</span>
              <p>Materi bagian ini sedang disiapkan.</p>
            </div>
          )}
        </div>

        <div className="section-next-action">
          <button
            type="button"
            className="btn-outline-next"
            onClick={() => scrollToSection('sumber-pustaka')}
          >
            <span>Lanjut ke Sumber Pustaka</span>
            <span>↓</span>
          </button>
        </div>
      </section>

      {/* ----------------------------------------------------------------------
         URUTAN 6: Sumber Pustaka (USER_FLOW.md Bagian 3)
         - Hanya menampilkan data sumber dari chemData.ts
         ---------------------------------------------------------------------- */}
      <section id="sumber-pustaka" className="modul-section-block">
        <div className="section-title-badge">
          <span>📖 Bagian 6: Sumber Pustaka</span>
        </div>
        <h2 className="section-main-heading">Sumber Pustaka</h2>

        {modul.sumber && modul.sumber.length > 0 ? (
          <ul className="sumber-list">
            {modul.sumber.map((smb, smbIdx) => (
              <li key={smbIdx} className="sumber-item">
                <span className="sumber-num">[{smbIdx + 1}]</span>
                <span>{smb}</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="pending-content-box">
            <span className="pending-icon">ℹ️</span>
            <p>Materi bagian ini sedang disiapkan.</p>
          </div>
        )}
      </section>

      {/* ----------------------------------------------------------------------
         Navigasi Footer Modul
         ---------------------------------------------------------------------- */}
      <div className="modul-footer-nav">
        <div className="modul-footer-nav-left">
          <button
            type="button"
            className="btn-back-home"
            onClick={onBackToHome}
          >
            <span>←</span>
            <span>Kembali ke Beranda</span>
          </button>
        </div>

        <div className="modul-footer-nav-right">
          <button
            type="button"
            className={`btn-status-toggle ${isCompleted ? 'completed' : ''}`}
            onClick={toggleCompletion}
          >
            <span>{isCompleted ? 'Modul Selesai ✓' : 'Tandai Selesai ✓'}</span>
          </button>

          {moduleNumber < 3 && onNavigateModule && (
            <button
              type="button"
              className="btn-primary-action"
              onClick={() => onNavigateModule(`modul_${moduleNumber + 1}`)}
            >
              <span>Lanjut ke Modul {moduleNumber + 1}</span>
              <span>→</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModulDetail;
