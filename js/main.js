// main.js – Gameplay + Effekte + Admin
import {
  updateEra, updateResource, updateRates, updateSaveStatus,
  clearUpgradeList, addUpgradeButton, setMilestone, spawnFloat,
  onFxToggle, onSfxToggle
} from './ui.js';
import { saveGame, loadGame, clearSave } from './storage.js';
import {
  initUpgradesState, listVisibleUpgrades, tryBuyUpgrade,
  nextCostFor, computeDerivedStats, canAfford
} from './upgrades.js';
import { milestoneProgress, evolveToNextEra } from './eras.js';
import { FX, particleBurst, confettiRain, screenShake, enableParallax } from './effects.js';
import { SFX, clickBleep, buyPing, evolveWoosh } from './sfx.js';
import { initAdmin } from './admin.js';

const mineBtn  = document.getElementById('mineBtn');
const resetBtn = document.getElementById('resetBtn');

const state = {
  era: 'Steinzeit',
  resources: { stone: 0 },
  perClick: 1,
  perSec: 0,
  upgrades: undefined,
  bonus: { globalMult: 1 },
  stats: { runTotalStone: 0, totalEvolutions: 0 },
  lastTick: Date.now(),
  crit: { chance: 0.05, mult: 10 }
};

// Load
const saved = loadGame();
if (saved) {
  state.era       = saved.era ?? state.era;
  state.resources = { ...state.resources, ...(saved.resources || {}) };
  state.perClick  = saved.perClick ?? state.perClick;
  state.perSec    = saved.perSec ?? state.perSec;
  state.upgrades  = saved.upgrades ?? state.upgrades;
  state.bonus     = saved.bonus ?? state.bonus;
  state.stats     = { ...state.stats, ...(saved.stats || {}) };
}
initUpgradesState(state);
computeDerivedStats(state);

// UI init
updateEra(state.era);
updateResource(state.resources.stone);
updateRates(state.perClick, state.perSec);
updateSaveStatus('–');
renderShop();
renderMilestone();
enableParallax();
onFxToggle(v => FX.setEnabled(v));
onSfxToggle(v => SFX.setEnabled(v));

// Admin init (Soft-Lock). onAfterChange refresht UI & speichert.
initAdmin({
  state,
  onAfterChange: () => {
    updateEra(state.era);
    updateResource(state.resources.stone);
    updateRates(state.perClick, state.perSec);
    renderShop();
    renderMilestone();
    doSave();
  }
});

// Interactions
mineBtn.addEventListener('click', (e) => {
  let gain = state.perClick;
  const isCrit = Math.random() < state.crit.chance;
  if (isCrit) gain *= state.crit.mult;

  state.resources.stone += gain;
  state.stats.runTotalStone += gain;
  updateResource(state.resources.stone);
  maybeRerenderShop();
  milestoneTick();

  addRipple(e.currentTarget, e);
  spawnFloat(e.clientX, e.clientY, `+${short(gain)}`, isCrit ? 'crit' : '');
  if (isCrit) particleBurst(e.clientX, e.clientY, 18);
  else if (FX.enabled) particleBurst(e.clientX, e.clientY, 8);
  clickBleep();
});

resetBtn.addEventListener('click', () => {
  if (confirm('Wirklich zurücksetzen? Dein Spielstand wird gelöscht.')) {
    clearSave();
    location.reload();
  }
});

window.addEventListener('keydown', (ev) => {
  const t = ev.target;
  if (t && (t.tagName==='INPUT' || t.tagName==='TEXTAREA' || t.isContentEditable)) return;
  if (ev.code === 'Space'){ ev.preventDefault(); mineBtn.click(); }
});

// Shop
function renderShop(){
  clearUpgradeList();
  const ups = listVisibleUpgrades(state);
  for (const u of ups){
    const cost = nextCostFor(state, u.id);
    addUpgradeButton({
      id: u.id, name: u.name, desc: u.desc, cost,
      affordable: canAfford(state, cost),
      onClick: () => {
        const res = tryBuyUpgrade(state, u.id);
        if (res.ok){
          updateResource(state.resources.stone);
          updateRates(state.perClick, state.perSec);
          renderShop();
          milestoneTick();
          buyPing();
        }
      }
    });
  }
}
let shopNeedsRender = false;
function maybeRerenderShop(){ shopNeedsRender = true; }

// Milestone
function renderMilestone(){
  const ms = milestoneProgress(state);
  setMilestone({
    visible: true,
    text: ms.text,
    progress: ms.progress,
    canEvolve: !!ms.canEvolve,
    onEvolve: () => {
      const fresh = milestoneProgress(state);
      if (!fresh.canEvolve) return;
      const ok = evolveToNextEra(state);
      if (ok){
        computeDerivedStats(state);
        updateEra(state.era);
        updateResource(state.resources.stone);
        updateRates(state.perClick, state.perSec);
        renderShop();
        renderMilestone();
        doSave();

        document.body.classList.add('celebrate');
        setTimeout(()=>document.body.classList.remove('celebrate'), 900);
        screenShake();
        confettiRain();
        evolveWoosh();
      }
    }
  });
}
function milestoneTick(){ renderMilestone(); }

// Loop
let saveTimer = 0, shopTimer = 0;
function loop(){
  const now = Date.now();
  const dt = Math.max((now - state.lastTick)/1000, 0);
  state.lastTick = now;

  if (state.perSec > 0){
    const delta = state.perSec * dt;
    if (delta !== 0){
      state.resources.stone += delta;
      state.stats.runTotalStone += delta;
      updateResource(state.resources.stone);
    }
  }

  saveTimer += dt; if (saveTimer >= 10){ saveTimer = 0; doSave(); }
  shopTimer += dt; if (shopNeedsRender || shopTimer >= 0.5){ shopTimer = 0; shopNeedsRender = false; renderShop(); }

  milestoneTick();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

function doSave(){
  const ok = saveGame({
    era: state.era, resources: state.resources, perClick: state.perClick, perSec: state.perSec,
    upgrades: state.upgrades, bonus: state.bonus, stats: state.stats
  });
  if (ok){ updateSaveStatus(new Date().toLocaleTimeString()); }
}

// Ripple helper
function addRipple(btn, ev){
  const r = document.createElement('span');
  r.className = 'ripple';
  const rect = btn.getBoundingClientRect();
  r.style.left = (ev.clientX - rect.left) + 'px';
  r.style.top  = (ev.clientY - rect.top) + 'px';
  btn.appendChild(r);
  r.addEventListener('animationend', () => r.remove());
}

function short(n){
  const x = Number(n)||0;
  if (x >= 1e21) return (x/1e21).toFixed(2)+'Sx';
  if (x >= 1e18) return (x/1e18).toFixed(2)+'Ex';
  if (x >= 1e15) return (x/1e15).toFixed(2)+'Q';
  if (x >= 1e12) return (x/1e12).toFixed(2)+'T';
  if (x >= 1e9)  return (x/1e9).toFixed(2)+'B';
  if (x >= 1e6)  return (x/1e6).toFixed(2)+'M';
  if (x >= 1e3)  return (x/1e3).toFixed(2)+'K';
  return Math.floor(x).toString();
}
