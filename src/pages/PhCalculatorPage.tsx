import { useMemo, useState } from 'react';
import './LabTools.css';

interface PhCalculatorPageProps {
  onBackToHome: () => void;
}

type Mode = 'h-to-ph' | 'ph-to-h' | 'oh-to-ph' | 'ph-to-oh';

function fmtSci(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return '—';
  const exp = Math.floor(Math.log10(n));
  const mant = n / Math.pow(10, exp);
  return `${mant.toFixed(3)} × 10^${exp}`;
}

export function PhCalculatorPage({ onBackToHome }: PhCalculatorPageProps) {
  const [mode, setMode] = useState<Mode>('h-to-ph');
  const [input, setInput] = useState('1e-7');

  const result = useMemo(() => {
    const x = Number(input.replace(',', '.'));
    if (!Number.isFinite(x)) return { error: 'Masukkan angka yang valid.' };
    try {
      if (mode === 'h-to-ph') {
        if (x <= 0) return { error: '[H⁺] harus lebih besar dari 0.' };
        const ph = -Math.log10(x);
        const poh = 14 - ph;
        const oh = Math.pow(10, -poh);
        return { ph, poh, h: x, oh, note: 'Asumsi larutan encer pada 25 °C (pH + pOH = 14).' };
      }
      if (mode === 'ph-to-h') {
        if (x < 0 || x > 14) return { error: 'pH umum berada pada rentang 0–14.' };
        const h = Math.pow(10, -x);
        const poh = 14 - x;
        const oh = Math.pow(10, -poh);
        return { ph: x, poh, h, oh, note: 'Menggunakan [H⁺] = 10^(−pH).' };
      }
      if (mode === 'oh-to-ph') {
        if (x <= 0) return { error: '[OH⁻] harus lebih besar dari 0.' };
        const poh = -Math.log10(x);
        const ph = 14 - poh;
        const h = Math.pow(10, -ph);
        return { ph, poh, h, oh: x, note: 'Asumsi 25 °C.' };
      }
      if (x < 0 || x > 14) return { error: 'pOH umum berada pada rentang 0–14.' };
      const oh = Math.pow(10, -x);
      const ph = 14 - x;
      const h = Math.pow(10, -ph);
      return { ph, poh: x, h, oh, note: 'Menggunakan [OH⁻] = 10^(−pOH).' };
    } catch {
      return { error: 'Perhitungan gagal. Periksa input.' };
    }
  }, [mode, input]);

  return (
    <div className="lab-page">
      <div className="lab-page-inner">
        <button type="button" className="btn-back-home" onClick={onBackToHome}>← Kembali ke Beranda</button>
        <header className="lab-hero">
          <div className="section-title-badge" style={{ marginBottom: '0.75rem' }}><span>Alat Interaktif</span></div>
          <h1 className="lab-title">Kalkulator pH</h1>
          <p className="lab-desc">Hitung pH, pOH, [H⁺], dan [OH⁻] untuk larutan sederhana (MVP: konversi &amp; asumsi asam/basa kuat/encer pada 25 °C).</p>
        </header>

        <div className="lab-grid">
          <section className="lab-card" aria-labelledby="ph-input-title">
            <h2 id="ph-input-title" className="lab-card-title">Input</h2>
            <label className="lab-label" htmlFor="ph-mode">Mode perhitungan</label>
            <select id="ph-mode" className="lab-input" value={mode} onChange={(e) => setMode(e.target.value as Mode)}>
              <option value="h-to-ph">[H⁺] → pH, pOH, [OH⁻]</option>
              <option value="ph-to-h">pH → [H⁺], pOH, [OH⁻]</option>
              <option value="oh-to-ph">[OH⁻] → pOH, pH, [H⁺]</option>
              <option value="ph-to-oh">pOH → [OH⁻], pH, [H⁺]</option>
            </select>
            <label className="lab-label" htmlFor="ph-val">Nilai</label>
            <input id="ph-val" className="lab-input" value={input} onChange={(e) => setInput(e.target.value)} inputMode="decimal" placeholder="contoh: 1e-3 atau 7" />
            <p className="lab-hint">Gunakan notasi ilmiah seperti <code>2.5e-4</code> untuk konsentrasi (M).</p>
          </section>

          <section className="lab-card" aria-labelledby="ph-result-title">
            <h2 id="ph-result-title" className="lab-card-title">Hasil</h2>
            {'error' in result ? (
              <p className="lab-error" role="alert">{result.error}</p>
            ) : (
              <dl className="lab-dl">
                <div><dt>pH</dt><dd><strong>{result.ph.toFixed(2)}</strong></dd></div>
                <div><dt>pOH</dt><dd>{result.poh.toFixed(2)}</dd></div>
                <div><dt>[H⁺]</dt><dd>{fmtSci(result.h)} M</dd></div>
                <div><dt>[OH⁻]</dt><dd>{fmtSci(result.oh)} M</dd></div>
              </dl>
            )}
            {'note' in result && result.note ? <p className="lab-note">{result.note}</p> : null}
          </section>
        </div>
      </div>
    </div>
  );
}

export default PhCalculatorPage;
