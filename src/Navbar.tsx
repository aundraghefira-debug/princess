import { useState, useEffect } from 'react';
import { loadUserState, type ChemiVerseState } from './types';

interface NavbarProps {
  onResetProgress?: () => void;
  activeSection?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onResetProgress }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userState, setUserState] = useState<ChemiVerseState>(loadUserState());
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    const handleStorageChange = () => {
      setUserState(loadUserState());
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('storage', handleStorageChange);

    // Interval sync for local state updates
    const interval = setInterval(() => {
      setUserState(loadUserState());
    }, 1500);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const completedCount = userState.completed_modules.length;
  const progressPercent = Math.min(100, Math.round((completedCount / 3) * 100));

  const handleNavClick = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className={`navbar-container ${scrolled ? 'navbar-scrolled' : ''}`}>
      <div className="navbar-content">
        {/* Logo & Identitas Media */}
        <a href="#root" className="navbar-brand" onClick={(e) => { e.preventDefault(); handleNavClick('root'); }}>
          <div className="brand-icon-wrapper">
            <span className="brand-flask-icon" aria-hidden="true">⚗️</span>
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
            className="nav-link active"
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
        </nav>

        {/* Progress Tracker (Zero-Login LocalStorage) */}
        <div className="navbar-progress-section">
          <div className="progress-badge" title="Status progres belajar tersimpan aman secara lokal di peramban Anda">
            <div className="progress-info">
              <span className="progress-label">Progres Belajar:</span>
              <span className="progress-value">{completedCount}/3 Modul</span>
            </div>
            <div className="progress-bar-track">
              <div
                className="progress-bar-fill"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>

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
