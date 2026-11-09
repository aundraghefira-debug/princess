import { useMemo, useState } from 'react';
import { type ChemiVerseState } from '../types';
import './LabTools.css';

interface TitrationLabPageProps {
  onBackToHome: () => void;
  userState?: ChemiVerseState;
  onUpdateUserState?: (newState: ChemiVerseState) => void;
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export function TitrationLabPage({ onBackToHome, userState, onUpdateUserState }: TitrationLabPageProps) {
  // Skenario MVP: titrasi asam kuat (HCl) dengan basa kuat (NaOH), 25 °C
  const [cAcid, setCAcid] = useState(0.1); // M
  const [vAcid, setVAcid] = useState(25); // mL
  const [cBase, setCBase] = useState(0.1); // M
  const [vAdded, setVAdded] = useState(() => clamp(50 - (userState?.titration_checkpoint?.v_buret_left ?? 50), 0, 50));

  const data = useMemo(() => {
    const Va = vAcid / 1000;
    const Vb = vAdded / 1000;
    const nA = cAcid * Va;
    const nB = cBase * Vb;
    const Vt = Va + Vb;
    let ph = 7;
    if (Vt > 0) {
      if (nB < nA) {
        const h = (nA - nB) / Vt;
        ph = -Math.log10(Math.max(h, 1e-14));
      } else if (nB > nA) {
        const oh = (nB - nA) / Vt;
        const poh = -Math.log10(Math.max(oh, 1e-14));
        ph = 14 - poh;
      } else {
        ph = 7;
      }
    }
    const vEq = cBase > 0 ? (cAcid * vAcid) / cBase : 0;
    let indicator = 'Hijau (mendekati netral)';
    let color = '#10b981';
    if (ph < 6.2) { indicator = 'Kuning/merah (asam)'; color = '#f97316'; }
    if (ph < 3.5) { indicator = 'Merah (asam kuat)'; color = '#ef4444'; }
    if (ph > 7.8) { indicator = 'Merah muda/ungu (basa)'; color = '#ec4899'; }
    if (ph > 10.5) { indicator = 'Ungu (basa kuat)'; color = '#8b5cf6'; }
    return { ph: clamp(ph, 0, 14), vEq, indicator, color };
  }, [cAcid, vAcid, cBase, vAdded]);

  const curve = useMemo(() => {
    const points: Array<{ v: number; ph: number }> = [];
    const maxV = Math.max(50, data.vEq * 2);
    for (let v = 0; v <= maxV + 0.001; v += maxV / 80) {
      const Va = vAcid / 1000;
      const Vb = v / 1000;
      const nA = cAcid * Va;
      const nB = cBase * Vb;
      const Vt = Va + Vb;
      let ph = 7;
      if (Vt > 0) {
        if (nB < nA) ph = -Math.log10(Math.max((nA - nB) / Vt, 1e-14));
        else if (nB > nA) ph = 14 - (-Math.log10(Math.max((nB - nA) / Vt, 1e-14)));
      }
      points.push({ v, ph: clamp(ph, 0, 14) });
    }
    return points;
  }, [cAcid, vAcid, cBase, data.vEq]);

  const saveCheckpoint = () => {
    if (!userState || !onUpdateUserState) return;
    const left = clamp(50 - vAdded, 0, 50);
    onUpdateUserState({ ...userState, titration_checkpoint: { v_buret_left: Number(left.toFixed(1)) } });
  };

  const w = 520, h = 220, pad = 34;
  const maxV = Math.max(...curve.map((p) => p.v), 1);
  const sx = (v: number) => pad + (v / maxV) * (w - pad * 2);
  const sy = (ph: number) => h - pad - (ph / 14) * (h - pad * 2);
  const path = curve.map((p, i) => `${i === 0 ? 'M' : 'L'} ${sx(p.v).toFixed(2)} ${sy(p.ph).toFixed(2)}`).join(' ');

  return (
    <div className="lab-page">
      <div className="lab-page-inner">
        <button type="button" className="btn-back-home" onClick={onBackToHome}>← Kembali ke Beranda</button>
        <header className="lab-hero">
          <div className="section-title-badge" style={{ marginBottom: '0.75rem' }}><span>Alat Interaktif</span></div>
          <h1 className="lab-title">Laboratorium Titrasi</h1>
          <p className="lab-desc">Simulasi MVP titrasi asam kuat–basa kuat (25 °C): atur parameter, tambah titran, amati pH, indikator, dan kurva titrasi.</p>
        </header>

        <div className="lab-grid">
          <section className="lab-card">
            <h2 className="lab-card-title">Parameter &amp; Buret</h2>
            <label className="lab-label">[HCl] (M)</label>
            <input className="lab-input" type="number" step="0.01" min="0.001" value={cAcid} onChange={(e) => setCAcid(Number(e.target.value))} />
            <label className="lab-label">Volume analit (mL)</label>
            <input className="lab-input" type="number" step="1" min="1" value={vAcid} onChange={(e) => setVAcid(Number(e.target.value))} />
            <label className="lab-label">[NaOH] titran (M)</label>
            <input className="lab-input" type="number" step="0.01" min="0.001" value={cBase} onChange={(e) => setCBase(Number(e.target.value))} />
            <label className="lab-label" htmlFor="vadd">Volume titran ditambahkan: <strong>{vAdded.toFixed(1)} mL</strong></label>
            <input id="vadd" className="lab-range" type="range" min="0" max="50" step="0.1" value={vAdded} onChange={(e) => setVAdded(Number(e.target.value))} />
            <div className="lab-btn-row">
              <button type="button" className="btn btn-secondary" onClick={() => setVAdded((v) => clamp(Number((v - 0.5).toFixed(1)), 0, 50))}>− 0,5 mL</button>
              <button type="button" className="btn btn-secondary" onClick={() => setVAdded((v) => clamp(Number((v + 0.5).toFixed(1)), 0, 50))}>+ 0,5 mL</button>
              <button type="button" className="btn btn-secondary" onClick={saveCheckpoint}>Simpan checkpoint</button>
            </div>
          </section>

          <section className="lab-card">
            <h2 className="lab-card-title">Pengamatan</h2>
            <div className="titration-beaker">
              <div className="titration-liquid" style={{ background: data.color, boxShadow: `0 0 24px ${data.color}55` }} />
              <div className="titration-ph">pH {data.ph.toFixed(2)}</div>
            </div>
            <p><strong>Indikator (visual):</strong> {data.indicator}</p>
            <p><strong>Perkiraan titik ekuivalen:</strong> {data.vEq.toFixed(2)} mL NaOH</p>
            <div className="curve-wrap">
              <svg viewBox={`0 0 ${w} ${h}`} className="curve-svg" role="img" aria-label="Kurva titrasi pH terhadap volume titran">
                <rect x="0" y="0" width={w} height={h} fill="rgba(255,255,255,0.6)" rx="8" />
                {[0, 7, 14].map((ph) => (
                  <line key={ph} x1={pad} x2={w - pad} y1={sy(ph)} y2={sy(ph)} stroke="rgba(139,92,246,0.18)" />
                ))}
                <line x1={sx(data.vEq)} x2={sx(data.vEq)} y1={pad} y2={h - pad} stroke="rgba(236,72,153,0.45)" strokeDasharray="4 4" />
                <path d={path} fill="none" stroke="#8b5cf6" strokeWidth="2.5" />
                <circle cx={sx(vAdded)} cy={sy(data.ph)} r="5" fill="#ec4899" />
                <text x={pad} y={h - 8} fontSize="10" fill="#6b5572">V titran (mL)</text>
                <text x="8" y={pad} fontSize="10" fill="#6b5572">pH</text>
              </svg>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default TitrationLabPage;
