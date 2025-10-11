// main.js – +Prestige (fix: buildingListEl entfernt)
import {
  updateEra, updateResource, updateRates, updateSaveStatus,
  clearUpgradeList, addUpgradeButton, setMilestone,
  spawnFloat, onFxToggle, onSfxToggle,
  renderResourceBadges, updateResourceBadges, format
} from './ui.js';
import { saveGame, loadGame, clearSave } from './storage.js';
import {
  initUpgradesState, listVisibleUpgrades, tryBuyUpgrade,
  nextCostFor, computeDerivedStats, canAfford as canAffordUpgrade
} from './upgrades.js';
import { milestoneProgress, evolveToNextEra } from './eras.js';
import { FX, particleBurst, confettiRain, screenShake, enableParallax } from './effects.js';
import { SFX, clickBleep, buyPing, evolveWoosh } from './sfx.js';
import { initAdmin } from './admin.js';
import { currentResDefs, resourcesTick, ensureResourceKeys } from './resources.js';
import {
  getEraBuildings, tryBuyBuilding, bulkCost, getOwned as getOwnedBuilding,
  canAfford as canAffordBuilding, buildingsTick, unitCost as unitCostBuilding
} from './buildings.js';
import {
  ensureResearch, researchTick, researchRatePerSec,
  visibleTechs, canResearch, buyResearch
} from './research.js';
import {
  ensurePrestige, prestigeGain, canPrestige, doPrestige, coreMultiplier
} from './prestige.js';

const mineBtn      = document.getElementById('mineBtn');
const resetBtn     = document.getElementById('resetBtn');
const tabs         = document.querySelectorAll('.tab');
const tabUpg       = document.getElementById('tab-upgrades');
const tabBld       = document.getElementById('tab-buildings');
const tabRes       = document.getElementById('tab-research');
const qtyBtns      = document.querySelectorAll('.qty-btn');
const buildingList = document.getElementById('buildingList'); // <— HIER nutzen wir "buildingList"
const researchList = document.getElementById('researchList');
const rpAmountEl   = document.getElementById('rpAmount');
const rpRateEl     = document.getElementById('rpRate');

// Prestige UI
const prestigeBox  = document.getElementById('prestigeBox');
const prestigeBtn  = document.getElementById('prestigeBtn');
const coreGainEl   = document.getElementById('coreGain');
const coreMultEl   = document.getElementById('coreMult');

let buyQty = 1;

const state = {
  era: 'Steinzeit',
  resources: { stone: 0, wood: 0, ore: 0, bronze: 0 },
  perClick: 1,
  perSec: 0,
  upgrades: { owned:{} },
  buildings: { owned: {} },
  research: { points: 0, owned: {} },
  prestige: { cores: 0, corePower: 0.12, totalPrestiges: 0 },
  bonus: { globalMult: 1, converterEff: 1, bronzeProdMult: 1 },
  stats: { runTotalStone: 0, totalEvolutions: 0, lifetimeStone: 0 },
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
  state.buildings = saved.buildings ?? state.buildings;
  state.research  = saved.research ?? state.research;
  state.prestige  = saved.prestige ?? state.prestige;
  state.bonus     = { ...state.bonus, ...(saved.bonus || {}) };
  state.stats     = { ...state.stats, ...(saved.stats || {}) };
}
initUpgradesState(state);
ensureResourceKeys(state);
ensureResearch(state);
ensurePrestige(state);
computeDerivedStats(state);

// UI init
updateEra(state.era);
updateResource(state.resources.stone);
updateRates(state.perClick, state.perSec);
renderResourceBadges(currentResDefs(state), state.resources);
updateSaveStatus('–');
renderShop();
renderBuildings();
renderResearch();
renderMilestone();
renderPrestigePanel();
enableParallax();
onFxToggle(v => FX.setEnabled(v));
onSfxToggle(v => SFX.setEnabled(v));

// Admin init
initAdmin({
  state,
  onAfterChange: () => {
    ensureResourceKeys(state);
    ensureResearch(state);
    ensurePrestige(state);
    computeDerivedStats(state);
    updateEra(state.era);
    updateResource(state.resources.stone);
    updateRates(state.perClick, state.perSec);
    renderResourceBadges(currentResDefs(state), state.resources);
    renderShop(); renderBuildings(); renderResearch(); renderMilestone(); renderPrestigePanel();
    doSave();
  }
});

// Tabs
tabs.forEach(t => t.addEventListener('click', () => {
  tabs.forEach(b => b.classList.remove('active'));
  t.classList.add('active');
  document.querySelectorAll('.tabpane').forEach(p => p.classList.remove('active'));
  const k = t.dataset.tab;
  if (k === 'upgrades')  tabUpg.classList.add('active');
  if (k === 'buildings') tabBld.classList.add('active');
  if (k === 'research')  tabRes.classList.add('active');
}));

// Bulk
qtyBtns.forEach(b => b.addEventListener('click', () => {
  qtyBtns.forEach(x => x.classList.remove('active'));
  b.classList.add('active');
  buyQty = Number(b.dataset.qty) || 1;
  renderBuildings();
}));

// Interactions
mineBtn.addEventListener('click', (e) => {
  let gain = state.perClick;
  const isCrit = Math.random() < state.crit.chance;
  if (isCrit) gain *= state.crit.mult;

  state.resources.stone += gain;
  state.stats.runTotalStone += gain;
  state.stats.lifetimeStone += gain; // Lifetime
  updateResource(state.resources.stone);
  updateResourceBadges(state.resources);
  maybeRerenderShop();
  maybeRerenderBuildings();
  milestoneTick(); renderPrestigePanel();

  addRipple(e.currentTarget, e);
  spawnFloat(e.clientX, e.clientY, `+${format(gain)}`, isCrit ? 'crit' : '');
  if (isCrit) particleBurst(e.clientX, e.clientY, 18);
  else particleBurst(e.clientX, e.clientY, 8);
  clickBleep();
});

resetBtn.addEventListener('click', () => {
  if (confirm('Wirklich zurücksetzen? Dein Spielstand wird gelöscht.')) {
    clearSave(); location.reload();
  }
});

// === Upgrades ===
function renderShop(){
  clearUpgradeList();
  const ups = listVisibleUpgrades(state);
  for (const u of ups){
    const cost = nextCostFor(state, u.id);
    addUpgradeButton({
      id: u.id, name: u.name, desc: u.desc, cost,
      affordable: canAffordUpgrade(state, cost),
      onClick: () => {
        const res = tryBuyUpgrade(state, u.id);
        if (res.ok){
          updateResource(state.resources.stone);
          updateRates(state.perClick, state.perSec);
          renderShop();
          milestoneTick(); renderPrestigePanel();
          updateResourceBadges(state.resources);
          buyPing();
        }
      }
    });
  }
}
let shopNeedsRender = false;
function maybeRerenderShop(){ shopNeedsRender = true; }

// === Gebäude ===
function renderBuildings(){
  buildingList.innerHTML = '';
  const defs = getEraBuildings(state.era);
  const gm = (state.bonus?.globalMult || 1) * coreMultiplier(state);

  for (const def of defs){
    const owned = getOwnedBuilding(state, def.id);
    const cost = Math.round(bulkCost(def, owned, buyQty) * 100) / 100;
    const producesLines = def.produces
      ? Object.entries(def.produces)
          .map(([r,v]) => `+${format(v * buyQty * gm)}/s ${nameOf(r)}`)
          .join(' • ')
      : '';

    const card = document.createElement('div');
    card.className = 'upgrade-btn';
    card.title = `Stückkosten: ${format(unitCostBuilding(def, owned))} • Skalierung: ${def.scale}`;
    card.innerHTML = `
      <div class="build-card">
        <div class="build-meta">
          <span class="build-name">${def.name}</span>
          <span class="build-desc">${def.desc}</span>
          <span class="build-owns">Besitz: ${owned}</span>
          ${producesLines ? `<span class="build-prod">Mit x${buyQty}: ${producesLines}</span>` : ''}
        </div>
        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px;">
          <span class="build-cost">Kosten: ${format(cost)}</span>
          <button class="build-buy">Kaufen x${buyQty}</button>
        </div>
      </div>
    `;
    const btn = card.querySelector('.build-buy');
    btn.disabled = !canAffordBuilding(state, cost);
    btn.addEventListener('click', () => {
      const res = tryBuyBuilding(state, def, buyQty);
      if (res.ok){
        updateResource(state.resources.stone);
        updateResourceBadges(state.resources);
        renderBuildings();
        milestoneTick(); renderPrestigePanel();
        buyPing();
      }
    });
    buildingList.appendChild(card);
  }
}
let buildingsNeedRender = false;
function maybeRerenderBuildings(){ buildingsNeedRender = true; }

function nameOf(res){
  switch(res){
    case 'stone': return 'Stein';
    case 'wood': return 'Holz';
    case 'ore': return 'Erz';
    case 'bronze': return 'Bronze';
    default: return res;
  }
}

// === Forschung ===
function renderResearch(){
  researchList.innerHTML = '';
  const techs = visibleTechs(state);

  rpAmountEl.textContent = format(state.research.points || 0);
  rpRateEl.textContent   = `${format(researchRatePerSec(state))}/s`;

  for (const t of techs){
    const owned = !!state.research.owned[t.id];
    const reqOk = (t.requires||[]).every(r => state.research.owned[r]);
    const affordable = (state.research.points || 0) >= t.cost && reqOk && !owned;

    const card = document.createElement('div');
    card.className = 'upgrade-btn';
    card.style.opacity = owned ? 0.6 : (affordable ? 1 : 0.8);
    card.innerHTML = `
      <strong>${owned ? '✅ ' : ''}${t.name}</strong>
      <span>${t.desc}</span>
      <span>Kosten: ${t.cost} FP ${!reqOk ? ' • (Voraussetzung fehlt)' : ''}</span>
    `;
    card.addEventListener('click', () => {
      if (owned) return;
      const res = buyResearch(state, t.id);
      if (res.ok){
        computeDerivedStats(state);
        renderResearch();
        renderBuildings();
        updateRates(state.perClick, state.perSec);
        updateResourceBadges(state.resources);
        renderPrestigePanel();
        doSave();
      }
    });
    researchList.appendChild(card);
  }
}

// === Milestone ===
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
        ensureResourceKeys(state);
        ensureResearch(state);
        ensurePrestige(state);
        computeDerivedStats(state);
        updateEra(state.era);
        updateResource(state.resources.stone);
        updateRates(state.perClick, state.perSec);
        renderResourceBadges(currentResDefs(state), state.resources);
        renderShop(); renderBuildings(); renderResearch(); renderMilestone(); renderPrestigePanel();
        doSave();
        document.body.classList.add('celebrate');
        setTimeout(()=>document.body.classList.remove('celebrate'), 900);
        screenShake(); confettiRain(); evolveWoosh();
      }
    }
  });
}
function milestoneTick(){ renderMilestone(); }

// === Prestige Panel ===
function renderPrestigePanel(){
  const gain = prestigeGain(state);
  const mult = coreMultiplier(state);
  coreGainEl.textContent = `${gain}`;
  coreMultEl.textContent = `x${mult.toFixed(2)}`;
  const visible = gain > 0;
  prestigeBox.hidden = !visible;
  prestigeBtn.disabled = !visible;
}
prestigeBtn?.addEventListener('click', () => {
  const gain = prestigeGain(state);
  if (gain <= 0) return;
  if (!confirm(`Rebirth durchführen und ${gain} Kerne erhalten?`)) return;
  const res = doPrestige(state);
  if (res.ok){
    ensureResourceKeys(state);
    ensureResearch(state);
    ensurePrestige(state);
    computeDerivedStats(state);

    updateEra(state.era);
    updateResource(state.resources.stone);
    updateRates(state.perClick, state.perSec);
    renderResourceBadges(currentResDefs(state), state.resources);
    renderShop(); renderBuildings(); renderResearch(); renderMilestone(); renderPrestigePanel();
    doSave();

    document.body.classList.add('celebrate');
    setTimeout(()=>document.body.classList.remove('celebrate'), 900);
    confettiRain(); screenShake();
  }
});

// === Loop ===
let saveTimer = 0, shopTimer = 0, bldTimer = 0, resTimer = 0;
function loop(){
  const now = Date.now();
  const dt = Math.max((now - state.lastTick)/1000, 0);
  state.lastTick = now;

  const prevStone = state.resources.stone;

  if (state.perSec > 0){
    const delta = state.perSec * dt;
    state.resources.stone += delta;
    state.stats.runTotalStone += delta;
  }

  buildingsTick(state, dt);
  resourcesTick(state, dt);
  researchTick(state, dt);

  const inc = state.resources.stone - prevStone;
  if (inc > 0) state.stats.lifetimeStone += inc;

  updateResource(state.resources.stone);
  updateResourceBadges(state.resources);

  saveTimer += dt; if (saveTimer >= 10){ saveTimer = 0; doSave(); }
  shopTimer += dt; if (shopNeedsRender || shopTimer >= 0.5){ shopTimer = 0; shopNeedsRender = false; renderShop(); }
  bldTimer  += dt; if (buildingsNeedRender || bldTimer  >= 0.6){ bldTimer = 0; buildingsNeedRender = false; renderBuildings(); }
  resTimer  += dt; if (resTimer >= 0.5){ resTimer = 0; renderResearch(); }

  renderPrestigePanel();
  milestoneTick();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

// Save
function doSave(){
  const ok = saveGame({
    era: state.era, resources: state.resources, perClick: state.perClick, perSec: state.perSec,
    upgrades: state.upgrades, buildings: state.buildings, research: state.research,
    prestige: state.prestige, bonus: state.bonus, stats: state.stats
  });
  if (ok){ updateSaveStatus(new Date().toLocaleTimeString()); }
}

// Helpers
function addRipple(btn, ev){
  const r = document.createElement('span');
  r.className = 'ripple';
  const rect = btn.getBoundingClientRect();
  r.style.left = (ev.clientX - rect.left) + 'px';
  r.style.top  = (ev.clientY - rect.top) + 'px';
  btn.appendChild(r);
  r.addEventListener('animationend', () => r.remove());
}
