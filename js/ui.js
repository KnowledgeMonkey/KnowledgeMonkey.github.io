// ui.js – DOM-Updates & Effekte-Helfer (Mehr-Ressourcen)

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
  multiRes: document.getElementById('multiRes'),
  fxToggle: document.getElementById('fxToggle'),
  sfxToggle: document.getElementById('sfxToggle'),
};

export function updateEra(name){ el.eraName.textContent = name; }

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

/* ===== Multi-Resource-Bar ===== */
export function renderResourceBadges(defs, values){
  if (!el.multiRes) return;
  el.multiRes.innerHTML = '';
  for (const d of defs){
    const box = document.createElement('div');
    box.className = 'res-badge';
    box.innerHTML = `
      <img alt="${d.name}" src="${d.icon}"/>
      <span class="rname">${d.name}</span>
      <span class="rval" data-res="${d.id}">${format(values[d.id] || 0)}</span>
    `;
    el.multiRes.appendChild(box);
  }
}
export function updateResourceBadges(values){
  if (!el.multiRes) return;
  el.multiRes.querySelectorAll('.rval').forEach(node => {
    const id = node.getAttribute('data-res');
    node.textContent = format(values[id] || 0);
  });
}

/* ===== Helpers ===== */
export function format(n){
  const x = Number(n)||0;
  if (x >= 1e21) return (x/1e21).toFixed(2)+'Sx';
  if (x >= 1e18) return (x/1e18).toFixed(2)+'Ex';
  if (x >= 1e15) return (x/1e15).toFixed(2)+'Q';
  if (x >= 1e12) return (x/1e12).toFixed(2)+'T';
  if (x >= 1e9)  return (x/1e9).toFixed(2)+'B';
  if (x >= 1e6)  return (x/1e6).toFixed(2)+'M';
  if (x >= 1e3)  return (x/1e3).toFixed(2)+'K';
  return Math.abs(x - Math.round(x)) < 1e-9 ? Math.round(x).toString() : (Math.floor(x*100)/100).toString();
}

export function spawnFloat(x, y, text, cls=''){
  const d = document.createElement('div');
  d.className = 'float' + (cls ? ' '+cls : '');
  d.style.left = x + 'px'; d.style.top = y + 'px';
  d.textContent = text;
  document.body.appendChild(d);
  d.addEventListener('animationend', () => d.remove());
}

export function onFxToggle(cb){ document.getElementById('fxToggle')?.addEventListener('change', e=>cb(!!e.target.checked)); }
export function onSfxToggle(cb){ document.getElementById('sfxToggle')?.addEventListener('change', e=>cb(!!e.target.checked)); }
