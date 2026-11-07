import { useState, useEffect, useRef } from 'react';

import type { Halaman } from './App';
import type { ThemePreference } from './lib/theme';

interface NavbarProps {
  onResetProgress?: () => void;
  activeSection?: string;
  onNavigate?: (page: Halaman) => void;
  currentPage?: string;
  themePreference?: ThemePreference;
  onThemeChange?: (pref: ThemePreference) => void;
}

interface NavDropdownProps {
  id: string;
  label: string;
  open: boolean;
  onToggle: () => void;
  active?: boolean;
  children: React.ReactNode;
}

const NavDropdown: React.FC<NavDropdownProps> = ({
  id,
  label,
  open,
  onToggle,
  active = false,
  children,
}) => {
  const menuId = `${id}-menu`;

  return (
    <div className={`nav-dropdown ${open ? 'open' : ''}`}>
      <button
        type="button"
        id={`${id}-trigger`}
        className={`nav-link nav-dropdown-trigger ${active ? 'active' : ''}`}
        aria-haspopup={open ? 'true' : undefined}
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={onToggle}
      >
        {label}
        <svg className="nav-dropdown-chevron" viewBox="0 0 20 20" width="12" height="12" aria-hidden="true" fill="none">
          <path d="M5.5 7.5 10 12l4.5-4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div className="nav-dropdown-menu" id={menuId} role="menu">
          {children}
        </div>
      )}
    </div>
  );
};

export const Navbar: React.FC<NavbarProps> = ({
  onResetProgress,
  onNavigate,
  currentPage = 'beranda',
  themePreference = 'system',
  onThemeChange,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openMenu, setOpenMenu] = useState<'beranda' | 'alat' | null>(null);
  const navRootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Tutup dropdown saat klik di luar atau tekan Escape
  useEffect(() => {
    if (openMenu === null) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (navRootRef.current && !navRootRef.current.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpenMenu(null);
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [openMenu]);

  const goHome = () => {
    setMobileMenuOpen(false);
    if (onNavigate) onNavigate('beranda');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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

  const isHome = currentPage === 'beranda';
  const isModulAktif =
    currentPage === 'modul_1' || currentPage === 'modul_2' || currentPage === 'modul_3';
  const isAlatAktif =
    currentPage === 'kuis' ||
    currentPage === 'kalkulator-ph' ||
    currentPage === 'laboratorium-titrasi' ||
    currentPage === 'eksplorasi-ph';

  const isBerandaGroupActive = isHome || isModulAktif;
  const isAlatGroupActive = isAlatAktif;

  const closeDropdown = () => setOpenMenu(null);

  const handleBerandaSelect = (action: () => void) => {
    setMobileMenuOpen(false);
    action();
    closeDropdown();
  };

  const handleAlatSelect = (page: Halaman) => {
    setMobileMenuOpen(false);
    onNavigate?.(page);
    closeDropdown();
  };

  return (
    <header className={`navbar-container ${scrolled ? 'navbar-scrolled' : ''}`}>
      <div className="navbar-content">
        {/* Logo & Identitas Media */}
        <a href="#root" className="navbar-brand" onClick={(e) => { e.preventDefault(); goHome(); }}>
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
          <div ref={navRootRef} className="nav-dropdowns-group">
          <NavDropdown
            id="nav-beranda"
            label="Beranda"
            open={openMenu === 'beranda'}
            onToggle={() => setOpenMenu((current) => (current === 'beranda' ? null : 'beranda'))}
            active={isBerandaGroupActive}
          >
            <button
              type="button"
              role="menuitem"
              className={`nav-dropdown-item ${isHome ? 'active' : ''}`}
              onClick={() => handleBerandaSelect(() => goHome())}
            >
              Halaman Utama
            </button>
            <button
              type="button"
              role="menuitem"
              className={`nav-dropdown-item ${isModulAktif ? 'active' : ''}`}
              onClick={() => handleBerandaSelect(() => handleNavClick('modul-belajar'))}
            >
              Modul Pembelajaran
            </button>
            <button
              type="button"
              role="menuitem"
              className="nav-dropdown-item"
              onClick={() => handleBerandaSelect(() => handleNavClick('johnstone-triplet'))}
            >
              Tiga Tingkat Johnstone
            </button>
          </NavDropdown>

          {onNavigate && (
            <NavDropdown
              id="nav-alat"
              label="Alat & Kuis"
              open={openMenu === 'alat'}
              onToggle={() => setOpenMenu((current) => (current === 'alat' ? null : 'alat'))}
              active={isAlatGroupActive}
            >
              <button type="button" role="menuitem" className="nav-dropdown-item" onClick={() => handleAlatSelect('kuis')}>
                Kuis
              </button>
              <button type="button" role="menuitem" className="nav-dropdown-item" onClick={() => handleAlatSelect('kalkulator-ph')}>
                Kalkulator pH
              </button>
              <button type="button" role="menuitem" className="nav-dropdown-item" onClick={() => handleAlatSelect('laboratorium-titrasi')}>
                Lab Titrasi
              </button>
              <button type="button" role="menuitem" className="nav-dropdown-item" onClick={() => handleAlatSelect('eksplorasi-ph')}>
                Eksplorasi pH
              </button>
            </NavDropdown>
          )}
          </div>
        </nav>

        {/* Theme + Mobile Menu */}
        <div className="navbar-progress-section">
          {onThemeChange && (
            <div className="theme-switch" role="group" aria-label="Pilih tema tampilan">
              {([
                ['light', 'Terang'],
                ['dark', 'Gelap'],
                ['system', 'Sistem'],
              ] as const).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  className={`theme-switch-btn ${themePreference === value ? 'active' : ''}`}
                  aria-pressed={themePreference === value}
                  onClick={() => onThemeChange(value)}
                  title={label}
                >
                  {label}
                </button>
              ))}
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
            <div className="mobile-nav-group-label">Beranda</div>
            <button type="button" className="mobile-nav-link" onClick={goHome}>
              Halaman Utama
            </button>
            <button type="button" className="mobile-nav-link" onClick={() => handleNavClick('modul-belajar')}>
              Modul Pembelajaran
            </button>
            <button type="button" className="mobile-nav-link" onClick={() => handleNavClick('johnstone-triplet')}>
              Tiga Tingkat Johnstone
            </button>
            <div className="mobile-nav-group-label">Alat &amp; Kuis</div>
            {onNavigate && (
              <>
                <button type="button" className="mobile-nav-link" onClick={() => { setMobileMenuOpen(false); onNavigate('kuis'); }}>Kuis</button>
                <button type="button" className="mobile-nav-link" onClick={() => { setMobileMenuOpen(false); onNavigate('kalkulator-ph'); }}>Kalkulator pH</button>
                <button type="button" className="mobile-nav-link" onClick={() => { setMobileMenuOpen(false); onNavigate('laboratorium-titrasi'); }}>Lab Titrasi</button>
                <button type="button" className="mobile-nav-link" onClick={() => { setMobileMenuOpen(false); onNavigate('eksplorasi-ph'); }}>Eksplorasi pH</button>
              </>
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
                Reset Progres Lokal
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
