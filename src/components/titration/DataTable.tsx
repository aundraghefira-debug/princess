import React from 'react';
import './TitrationLab.css';

export interface TitikPengamatan {
  id: string;
  volume: number; // mL
  pH: number;
  warna: string;
  keterangan: string;
  waktu: string;
  isTE?: boolean;
}

export interface DataTableProps {
  /** Daftar titik pengamatan yang dicatat */
  dataPengamatan: TitikPengamatan[];
  /** Volume ekuivalen teoretis sebagai pembanding */
  volumeEkuivalen: number;
  /** pH ekuivalen teoretis sebagai pembanding */
  phEkuivalen: number;
  /** Volume titran saat ini */
  volumeSaatIni: number;
  /** pH saat ini */
  phSaatIni: number;
  /** Handler untuk mencatat titik saat ini ke dalam tabel */
  onCatatTitik: () => void;
  /** Handler untuk membersihkan riwayat pengamatan */
  onBersihkanTabel: () => void;
  /** Apakah tombol catat aktif */
  disabled?: boolean;
}

export const DataTable: React.FC<DataTableProps> = ({
  dataPengamatan,
  volumeEkuivalen,
  phEkuivalen,
  volumeSaatIni,
  phSaatIni,
  onCatatTitik,
  onBersihkanTabel,
  disabled = false,
}) => {
  return (
    <div className="titration-table-card">
      <div className="table-header-row">
        <div>
          <h4 className="table-title">Tabel Data Pengamatan Titrasi</h4>
          <p className="table-desc">
            Catatan volume buret dan nilai pH aktual dari sensor digital selama praktikum virtual berlangsung.
          </p>
        </div>

        <div className="table-actions">
          <button
            type="button"
            className="btn-table-action btn-record-point"
            onClick={onCatatTitik}
            disabled={disabled}
            title="Catat data buret dan pH saat ini ke tabel pengamatan"
          >
            <span>📌</span>
            <span>Catat Titik Saat Ini</span>
          </button>
          {dataPengamatan.length > 0 && (
            <button
              type="button"
              className="btn-table-action btn-clear-table"
              onClick={onBersihkanTabel}
              title="Kosongkan riwayat tabel pengamatan"
            >
              <span>🗑️</span>
              <span>Hapus Data</span>
            </button>
          )}
        </div>
      </div>

      {/* Info Pembanding Titik Ekuivalen Teoretis */}
      <div className="table-benchmark-banner">
        <span className="benchmark-icon">🎯</span>
        <div className="benchmark-text">
          <strong>Pembanding Stoikiometri Teoretis:</strong> Titik Ekuivalen tercapai saat volume titran{' '}
          <span className="font-mono text-highlight">{volumeEkuivalen.toFixed(2).replace('.', ',')} mL</span> dengan pH{' '}
          <span className="font-mono text-highlight">{phEkuivalen.toFixed(2).replace('.', ',')}</span>.
        </div>
      </div>

      {/* Tabel Data Responsif */}
      <div className="table-responsive-wrapper">
        <table className="titration-data-table">
          <thead>
            <tr>
              <th style={{ width: '45px' }}>No</th>
              <th>Volume Titran (mL)</th>
              <th>pH Terukur</th>
              <th>Warna Larutan</th>
              <th>Kondisi / Status</th>
              <th>Waktu</th>
            </tr>
          </thead>
          <tbody>
            {dataPengamatan.length === 0 ? (
              <tr>
                <td colSpan={6} className="table-empty-row">
                  <span className="empty-icon">📝</span>
                  <p>Belum ada titik pengamatan yang dicatat. Teteskan titran lalu klik tombol <strong>"Catat Titik Saat Ini"</strong>.</p>
                </td>
              </tr>
            ) : (
              dataPengamatan.map((item, idx) => (
                <tr key={item.id} className={item.isTE ? 'row-highlight-te' : ''}>
                  <td className="font-mono text-center">{idx + 1}</td>
                  <td className="font-mono font-bold">
                    {item.volume.toFixed(2).replace('.', ',')} mL
                  </td>
                  <td className="font-mono font-bold ph-cell">
                    {item.pH.toFixed(2).replace('.', ',')}
                  </td>
                  <td>
                    <div className="color-indicator-cell">
                      <span
                        className="color-dot"
                        style={{ backgroundColor: item.warna }}
                      />
                      <span className="color-text">{item.warna}</span>
                    </div>
                  </td>
                  <td>
                    <span
                      className={`status-pill ${
                        item.isTE
                          ? 'status-te'
                          : item.volume < volumeEkuivalen
                          ? 'status-pre-te'
                          : 'status-post-te'
                      }`}
                    >
                      {item.keterangan}
                    </span>
                  </td>
                  <td className="font-mono text-muted-sm">{item.waktu}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Info Pembacaan Terkini */}
      <div className="table-footer-status">
        <span>Posisi Buret Terkini: <strong className="font-mono">{volumeSaatIni.toFixed(2).replace('.', ',')} mL</strong></span>
        <span>·</span>
        <span>pH Sensor: <strong className="font-mono">{phSaatIni.toFixed(2).replace('.', ',')}</strong></span>
        <span>·</span>
        <span>Total Terdata: <strong className="font-mono">{dataPengamatan.length} titik</strong></span>
      </div>
    </div>
  );
};

export default DataTable;

