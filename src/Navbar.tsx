import { useState, useEffect } from 'react';

interface NavbarProps {
  onResetProgress?: () => void;
  activeSection?: string;
  onNavigate?: (page: 'beranda' | 'eksplorasi-ph' | 'modul_1' | 'modul_2' | 'modul_3') => void;
  currentPage?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onResetProgress, onNavigate, currentPage = 'beranda' }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
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

        {/* Progress Tracker (F8: disembunyikan sampai fitur selesai) */}
        <div className="navbar-progress-section">
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
