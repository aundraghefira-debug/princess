import {
  getThemePreference,
  setThemePreference,
  type ThemePreference,
} from './localStore';

export type { ThemePreference };

export type ResolvedTheme = 'light' | 'dark';

export function resolveTheme(pref: ThemePreference): ResolvedTheme {
  if (pref === 'light' || pref === 'dark') return pref;
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
}

export function applyTheme(resolved: ResolvedTheme): void {
  if (typeof document === 'undefined') return;
  document.documentElement.dataset.theme = resolved;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute('content', resolved === 'dark' ? '#1a1025' : '#fdf2f8');
  }
}

export function readStoredTheme(): ThemePreference {
  return getThemePreference().data;
}

export function persistTheme(pref: ThemePreference): void {
  setThemePreference(pref);
}

export function initTheme(): { preference: ThemePreference; resolved: ResolvedTheme } {
  const preference = readStoredTheme();
  const resolved = resolveTheme(preference);
  applyTheme(resolved);
  return { preference, resolved };
}

export function subscribeSystemTheme(onChange: (resolved: ResolvedTheme) => void): () => void {
  if (typeof window === 'undefined' || !window.matchMedia) return () => {};
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  const handler = (e: MediaQueryListEvent) => onChange(e.matches ? 'dark' : 'light');
  mq.addEventListener('change', handler);
  return () => mq.removeEventListener('change', handler);
}
