// ui.js – DOM-Updates & Effekte-Helfer (stabile Zahlendarstellung)

const el = {
  eraName: document.getElementById('eraName'),
  amount: document.getElementById('resourceAmount'),
  perClick: document.getElementById('perClick'),
  perSec: document.getElementById('perSec'),
  saveStatus: document.getElementById('saveStatus'),
  milestoneBox: document.getElementById('milestoneBox'),
  milestoneText: document.getElementById('milestoneText'),
  milestoneProgress: document.getElementById('milestoneProgress'),
  evolveBtn: document.getElementById('evolveBtn'),
  upgradeList: document.getElementById('upgradeList'),
  fxToggle: document.getElementById('fxToggle'),
  sfxToggle: document.getElementById('sfxToggle'),
};

export function updateEra(name){ el.eraName.textContent = name; }

/**
 * Stabile, sofortige Anzeige ohne Ticker (vermeidet Glitches bei hoher Update-Frequenz).
 * Kleiner „Bump“-Effekt bleibt für Feedback.
 */
export function updateResource(amount){
  el.amount.textContent = format(amount);
  el.amount.classList.remove('bump'); void el.amount.offsetWidth; el.amount.classList.add('bump');
}

export function updateRates(pc, ps){
  el.perClick.textContent = `+${format(pc)}/Klick`;
  el.perSec.textContent = `${format(ps)}/Sek`;
}

export function updateSaveStatus(text){ el.saveStatus.textContent = text; }

export function setMilestone({ visible, text, progress, canEvolve, onEvolve }){
  el.milestoneBox.hidden = !visible;
  if (text) el.milestoneText.textContent = text;
  if (typeof progress === 'number'){
    el.milestoneProgress.value = Math.min(Math.max(progress, 0), 1);
    if (progress >= 1) el.milestoneBox.classList.add('ready'); else el.milestoneBox.classList.remove('ready');
  }
  if (typeof canEvolve === 'boolean'){ el.evolveBtn.disabled = !canEvolve; }
  el.evolveBtn.onclick = null; if (typeof onEvolve === 'function'){ el.evolveBtn.onclick = onEvolve; }
}

export function clearUpgradeList(){ el.upgradeList.innerHTML = ''; }

export function addUpgradeButton({id, name, desc, cost, affordable, onClick}){
  const btn = document.createElement('button');
  btn.className = 'upgrade-btn';
  btn.style.cssText = `
    display:flex; flex-direction:column; align-items:flex-start;
    background:#14161c; color:#e6e6ea; border:2px solid #2a2d36; border-radius:12px; padding:12px; text-align:left;
    opacity:${affordable ? 1 : 0.55};
  `;
  btn.innerHTML = `<strong>${name}</strong>
  <span style="color:#9ca3af; font-size:0.9em;">${desc}</span>
  <span style="margin-top:6px;">Kosten: ${format(cost)}</span>`;
  btn.disabled = !affordable;
  btn.addEventListener('click', onClick);
  el.upgradeList.appendChild(btn);
}

/** Kompakte Zahlformatierung mit großen Suffixen */
export function format(n){
  const x = Number(n)||0;
  if (x >= 1e21) return (x/1e21).toFixed(2)+'Sx';
  if (x >= 1e18) return (x/1e18).toFixed(2)+'Ex';
  if (x >= 1e15) return (x/1e15).toFixed(2)+'Q';
  if (x >= 1e12) return (x/1e12).toFixed(2)+'T';
  if (x >= 1e9)  return (x/1e9).toFixed(2)+'B';
  if (x >= 1e6)  return (x/1e6).toFixed(2)+'M';
  if (x >= 1e3)  return (x/1e3).toFixed(2)+'K';
  // kleine Zahlen: zwei Nachkommastellen maximal
  return Math.abs(x - Math.round(x)) < 1e-9 ? Math.round(x).toString() : (Math.floor(x*100)/100).toString();
}

// Floater
export function spawnFloat(x, y, text, cls=''){
  const d = document.createElement('div');
  d.className = 'float' + (cls ? ' '+cls : '');
  d.style.left = x + 'px'; d.style.top = y + 'px';
  d.textContent = text;
  document.body.appendChild(d);
  d.addEventListener('animationend', () => d.remove());
}

// Toggles
export function onFxToggle(cb){ el.fxToggle?.addEventListener('change', e=>cb(!!e.target.checked)); }
export function onSfxToggle(cb){ el.sfxToggle?.addEventListener('change', e=>cb(!!e.target.checked)); }
