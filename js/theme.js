// theme.js – Theme-Select & Accent-Picker (persistiert in localStorage)
const root = document.documentElement;
const themeSelect = document.getElementById('themeSelect');
const accentInput = document.getElementById('accentInput');
const swatch = document.querySelector('.accent-picker .swatch');

const LS_KEY_THEME = 'em_theme';
const LS_KEY_ACCENT = 'em_accent';

function applyTheme(t){
  if (!t) return;
  document.documentElement.setAttribute('data-theme', t);
  localStorage.setItem(LS_KEY_THEME, t);
  themeSelect.value = t;
}
function applyAccent(hex){
  if (!hex) return;
  root.style.setProperty('--accent', hex);
  root.style.setProperty('--accent-2', hex);
  swatch && (swatch.style.background = hex);
  localStorage.setItem(LS_KEY_ACCENT, hex);
}

function load(){
  const savedT = localStorage.getItem(LS_KEY_THEME);
  const savedA = localStorage.getItem(LS_KEY_ACCENT);

  // Fallback: system prefers dark -> "dark"
  applyTheme(savedT || 'dark');
  applyAccent(savedA || getComputedStyle(root).getPropertyValue('--accent').trim());
}

themeSelect?.addEventListener('change', e => applyTheme(e.target.value));
accentInput?.addEventListener('input', e => applyAccent(e.target.value));

load();
