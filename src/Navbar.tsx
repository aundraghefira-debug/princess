import { useState, useEffect } from 'react';
import type { FC } from 'react';
import { cloudTersedia, getAccess, logout, pantauLogin } from './lib/firebaseService';
import './NavbarAkun.css';

interface NavbarProps {
  onResetProgress?: () => void;
  activeSection?: string;
  onNavigate?: (
    page: 'beranda' | 'eksplorasi-ph' | 'kuis' | 'akun' | 'modul_1' | 'modul_2' | 'modul_3'
  ) => void;
  currentPage?: string;
}

/** Nama yang ditampilkan di bar atas saat sudah login. */
function namaDariAkun(displayName: string | null, email: string | null): string {
  if (displayName && displayName.trim()) return displayName.trim();
  if (email) return email.split('@')[0];
  return 'Akun';
}

export const Navbar: FC<NavbarProps> = ({
  onResetProgress,
  onNavigate,
  currentPage = 'beranda',
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [namaAkun, setNamaAkun] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Pantau status login supaya bar atas ikut berubah
  useEffect(() => {
    if (!cloudTersedia()) return;
    let aktif = true;
    const berhenti = pantauLogin((user) => {
      if (!user) {
        setNamaAkun(null);
        return;
      }
      setNamaAkun(namaDariAkun(user.displayName, user.email));
      // Alias dari daftar kelas diutamakan bila ada
      getAccess()
        .then((akses) => {
          if (aktif && akses.anggota && akses.anggota.alias) {
            setNamaAkun(akses.anggota.alias);
          }
        })
        .catch(() => {});
    });
    return () => {
      aktif = false;
      berhenti();
    };
  }, []);

  const handleNavClick = (id: string) => {
    setMobileMenuOpen(false);
    if (currentPage !== 'beranda' && onNavigate) {
      onNavigate('beranda');
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 80);
      return;
    }
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const bukaAkun = () => {
    setMobileMenuOpen(false);
    onNavigate?.('akun');
  };

  const keluar = async () => {
    setMobileMenuOpen(false);
    try {
      await logout();
      onNavigate?.('beranda');
    } catch {
      // Jika gagal keluar, status login tetap seperti semula
    }
  };

  return (
    <header className={`navbar-container ${scrolled ? 'navbar-scrolled' : ''}`}>
      <div className="navbar-content">
        {/* Logo & Identitas Media */}
        <a
          href="#root"
          className="navbar-brand"
          onClick={(e) => {
            e.preventDefault();
            handleNavClick('root');
          }}
        >
          <div className="brand-icon-wrapper">
            <span className="brand-flask-icon" aria-hidden="true">
              ⚗️
            </span>
            <div className="atom-orbital-ring"></div>
          </div>
          <div className="brand-text-block">
            <span className="brand-name">
              Chemi<span className="brand-highlight">Verse</span>
            </span>
            <span className="brand-tagline">Asam Basa Interactive Lab</span>
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="desktop-nav-links" aria-label="Navigasi Utama">
          <button
            type="button"
            id="nav-home"
            className={`nav-link ${currentPage === 'beranda' ? 'active' : ''}`}
            onClick={() => handleNavClick('hero')}
          >
            Beranda
          </button>
          <button
            type="button"
            id="nav-modules"
            className="nav-link"
            onClick={() => handleNavClick('modul-belajar')}
          >
            Modul Pembelajaran
          </button>
          <button
            type="button"
            id="nav-johnstone"
            className="nav-link"
            onClick={() => handleNavClick('johnstone-triplet')}
          >
            Tiga Tingkat Johnstone
          </button>
          <button
            type="button"
            id="nav-quiz"
            className={`nav-link ${currentPage === 'kuis' ? 'active' : ''}`}
            onClick={() => {
              setMobileMenuOpen(false);
              onNavigate?.('kuis');
            }}
          >
            Kuis
          </button>
          {!namaAkun && (
            <button
              type="button"
              id="nav-account"
              className={`nav-link nav-masuk ${currentPage === 'akun' ? 'active' : ''}`}
              onClick={bukaAkun}
            >
              Masuk
            </button>
          )}
        </nav>

        <div className="navbar-progress-section">
          {/* Chip akun (desktop) saat sudah login */}
          {namaAkun && (
            <div className="nav-user" id="nav-user">
              <button
                type="button"
                className="nav-user-profile"
                onClick={bukaAkun}
                aria-label={`Buka profil ${namaAkun}`}
              >
                <span className="nav-user-avatar" aria-hidden="true">
                  {namaAkun.charAt(0).toUpperCase()}
                </span>
                <span className="nav-user-name">{namaAkun}</span>
              </button>
              <button type="button" className="nav-user-logout" onClick={() => void keluar()}>
                Keluar
              </button>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            type="button"
            id="mobile-menu-btn"
            className={`mobile-menu-toggle ${mobileMenuOpen ? 'open' : ''}`}
            aria-label="Buka menu navigasi"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className="menu-bar"></span>
            <span className="menu-bar"></span>
            <span className="menu-bar"></span>
          </button>
        </div>
      </div>

      {/* Mobile Nav Dropdown */}
      {mobileMenuOpen && (
        <div className="mobile-nav-drawer">
          <nav className="mobile-nav-links">
            <button
              type="button"
              className="mobile-nav-link"
              onClick={() => handleNavClick('hero')}
            >
              🏠 Beranda
            </button>
            <button
              type="button"
              className="mobile-nav-link"
              onClick={() => handleNavClick('modul-belajar')}
            >
              🧪 Tiga Modul Interaktif
            </button>
            <button
              type="button"
              className="mobile-nav-link"
              onClick={() => handleNavClick('johnstone-triplet')}
            >
              📐 Tiga Tingkat Johnstone
            </button>
            <button
              type="button"
              className="mobile-nav-link"
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigate?.('kuis');
              }}
            >
              📝 Kuis
            </button>
            <button type="button" className="mobile-nav-link" onClick={bukaAkun}>
              {namaAkun ? `👤 ${namaAkun}` : '👤 Masuk / Daftar'}
            </button>
            {namaAkun && (
              <button type="button" className="mobile-nav-link" onClick={() => void keluar()}>
                🚪 Keluar
              </button>
            )}
            {onResetProgress && (
              <button
                type="button"
                className="mobile-nav-link text-dim"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onResetProgress();
                }}
              >
                🔄 Reset Progres Lokal
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;