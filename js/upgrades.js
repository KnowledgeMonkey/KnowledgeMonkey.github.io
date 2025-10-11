// upgrades.js – Vollausbau Upgrades/Flags/Converter für 9 Epochen
// - Upgrades bleiben über Epochen kaufbar (Legacy-Rabatt)
// - Prestige-Multiplikator wirkt global
// - Viele IDs sind Flags/Converter, deren Output in resources.js berechnet wird

import { coreMultiplier } from './prestige.js';

const ERA_ORDER = [
  'Steinzeit','Bronzezeit','Mittelalter','Industriezeit','Moderne',
  'Digitalzeitalter','Raumfahrt','Sci-Fi','Alien'
];

// ============= UPGRADE-DEFINITIONS =============
// Typen:
//  - click: +addClick pro Kauf
//  - auto:  +addPerSec Stein/s pro Kauf
//  - flag:  Marker/Anzahl für Produktionen/Converter (Logik in resources.js)

const UPG = [
  // ---------- STEINZEIT ----------
  { id:'click_stone_1', era:'Steinzeit', name:'Schärferer Faustkeil', desc:'+1 pro Klick', type:'click', addClick:1, baseCost:50,  scale:1.25 },
  { id:'click_stone_2', era:'Steinzeit', name:'Steinpicke',           desc:'+3 pro Klick', type:'click', addClick:3, baseCost:150, scale:1.28 },
  { id:'click_stone_3', era:'Steinzeit', name:'Feingeschlagene Spitze', desc:'+6 pro Klick', type:'click', addClick:6, baseCost:420, scale:1.30 },

  { id:'auto_stone_1',  era:'Steinzeit', name:'Feuerstellen',          desc:'+0.2 Stein/s', type:'auto',  addPerSec:0.2, baseCost:120, scale:1.18 },
  { id:'auto_stone_2',  era:'Steinzeit', name:'Stammesbau',            desc:'+0.8 Stein/s', type:'auto',  addPerSec:0.8, baseCost:450, scale:1.20 },
  { id:'auto_stone_3',  era:'Steinzeit', name:'Transport-Schlitten',   desc:'+2.4 Stein/s', type:'auto',  addPerSec:2.4, baseCost:1600, scale:1.22 },

  // Ressourcen (Flags)
  { id:'gatherer',      era:'Steinzeit', name:'Sammler',               desc:'Holz (passiv)',       type:'flag', baseCost:100, scale:1.18 },
  { id:'hut_camp',      era:'Steinzeit', name:'Hüttendorf',            desc:'Mehr Holz (passiv)',  type:'flag', baseCost:320, scale:1.20 },
  { id:'stone_quarry_b',era:'Steinzeit', name:'Steinbruch (früh)',     desc:'Etwas Erz (passiv)',  type:'flag', baseCost:800, scale:1.22 },

  // ---------- BRONZEZEIT ----------
  { id:'click_bronze_1', era:'Bronzezeit', name:'Bronze-Werkzeuge',   desc:'+12 pro Klick', type:'click', addClick:12, baseCost:2500, scale:1.28 },
  { id:'click_bronze_2', era:'Bronzezeit', name:'Gezahnte Meißel',    desc:'+24 pro Klick', type:'click', addClick:24, baseCost:6200, scale:1.30 },

  { id:'auto_bronze_1',  era:'Bronzezeit', name:'Arbeitskolonnen',    desc:'+5 Stein/s',     type:'auto',  addPerSec:5,  baseCost:3800, scale:1.22 },
  { id:'auto_bronze_2',  era:'Bronzezeit', name:'Lasttierenetz',      desc:'+14 Stein/s',    type:'auto',  addPerSec:14, baseCost:15000, scale:1.24 },

  // Erz/Converter
  { id:'copper_mine',    era:'Bronzezeit', name:'Kupfermine',         desc:'Erz (passiv)',            type:'flag', baseCost:4200, scale:1.20 },
  { id:'tin_mine',       era:'Bronzezeit', name:'Zinnmine',           desc:'Erz (passiv)',            type:'flag', baseCost:4300, scale:1.20 },
  { id:'bronze_forge',   era:'Bronzezeit', name:'Bronzeschmiede',     desc:'Erz ➜ Bronze',           type:'flag', baseCost:5200, scale:1.22 },
  { id:'great_forge',    era:'Bronzezeit', name:'Großschmiede',       desc:'Erz ➜ Bronze effizient', type:'flag', baseCost:12000, scale:1.24 },

  // ---------- MITTELALTER ----------
  { id:'click_med_1', era:'Mittelalter', name:'Stahlwerkzeuge',       desc:'+60 pro Klick', type:'click', addClick:60, baseCost:180000, scale:1.30 },
  { id:'click_med_2', era:'Mittelalter', name:'Meisterliche Schmiede',desc:'+140 pro Klick',type:'click', addClick:140, baseCost:420000, scale:1.32 },

  { id:'auto_med_1',  era:'Mittelalter', name:'Zunftwesen',           desc:'+45 Stein/s',   type:'auto',  addPerSec:45, baseCost:210000, scale:1.25 },
  { id:'auto_med_2',  era:'Mittelalter', name:'Wasserrad',            desc:'+120 Stein/s',  type:'auto',  addPerSec:120, baseCost:760000, scale:1.27 },

  // ---------- INDUSTRIEZEIT ----------
  { id:'click_ind_1', era:'Industriezeit', name:'Gussstahlmeißel',     desc:'+500 pro Klick', type:'click', addClick:500, baseCost:3_000_000, scale:1.30 },
  { id:'click_ind_2', era:'Industriezeit', name:'Pneumatische Hämmer', desc:'+1300 pro Klick', type:'click', addClick:1300, baseCost:7_500_000, scale:1.32 },

  { id:'auto_ind_1',  era:'Industriezeit', name:'Fließband',           desc:'+800 Stein/s', type:'auto', addPerSec:800, baseCost:4_500_000, scale:1.25 },
  { id:'auto_ind_2',  era:'Industriezeit', name:'Dampfturbine',        desc:'+2400 Stein/s', type:'auto', addPerSec:2400, baseCost:12_000_000, scale:1.27 },

  // Rohstoff-Flags / Converter (Eisen+Kohle→Stahl)
  { id:'coal_ops',  era:'Industriezeit', name:'Zechenbetrieb',        desc:'Kohle (passiv)', type:'flag', baseCost:1_600_000, scale:1.21 },
  { id:'iron_ops',  era:'Industriezeit', name:'Erweiterte Eisenminen', desc:'Eisen (passiv)', type:'flag', baseCost:2_200_000, scale:1.22 },
  { id:'steel_foundry', era:'Industriezeit', name:'Stahlhütte',        desc:'Eisen+Kohle ➜ Stahl', type:'flag', baseCost:4_500_000, scale:1.24 },

  // ---------- MODERNE ----------
  { id:'click_mod_1', era:'Moderne', name:'Hydraulische Bohrer',   desc:'+3400 pro Klick', type:'click', addClick:3400, baseCost:28_000_000, scale:1.30 },
  { id:'click_mod_2', era:'Moderne', name:'CNC-Bearbeitung',       desc:'+8800 pro Klick', type:'click', addClick:8800, baseCost:65_000_000, scale:1.32 },

  { id:'auto_mod_1',  era:'Moderne', name:'Automatisierte Werke',  desc:'+7200 Stein/s', type:'auto', addPerSec:7200, baseCost:52_000_000, scale:1.26 },
  { id:'auto_mod_2',  era:'Moderne', name:'Hochspannungsnetz',     desc:'+21000 Stein/s', type:'auto', addPerSec:21000, baseCost:120_000_000, scale:1.28 },

  // Öl & Energie (Öl→Energie)
  { id:'oil_drill',   era:'Moderne', name:'Tiefbohrungen',        desc:'Öl (passiv)', type:'flag', baseCost:40_000_000, scale:1.24 },
  { id:'oil_refinery',era:'Moderne', name:'Raffinerie',           desc:'Öl ➜ Energie', type:'flag', baseCost:70_000_000, scale:1.26 },

  // ---------- DIGITAL ----------
  { id:'click_dig_1', era:'Digitalzeitalter', name:'Haptik-Optimierung',desc:'+24k pro Klick', type:'click', addClick:24000, baseCost:340_000_000, scale:1.30 },
  { id:'click_dig_2', era:'Digitalzeitalter', name:'Servo-Exos',       desc:'+60k pro Klick', type:'click', addClick:60000, baseCost:780_000_000, scale:1.32 },

  { id:'auto_dig_1',  era:'Digitalzeitalter', name:'Smart-Fabriken',   desc:'+120k Stein/s',  type:'auto', addPerSec:120000, baseCost:820_000_000, scale:1.27 },
  { id:'auto_dig_2',  era:'Digitalzeitalter', name:'KI-Planung',       desc:'+350k Stein/s',  type:'auto', addPerSec:350000, baseCost:1_600_000_000, scale:1.29 },

  // Silizium & Chips (Si+Energie→Chips)
  { id:'silicon_ops',   era:'Digitalzeitalter', name:'Siliziumreinigung', desc:'Silizium (passiv)', type:'flag', baseCost:340_000_000, scale:1.25 },
  { id:'chip_etcher',   era:'Digitalzeitalter', name:'Chip-Ätzanlagen',   desc:'Silizium+Energie ➜ Schaltkreise', type:'flag', baseCost:900_000_000, scale:1.28 },

  // ---------- RAUMFAHRT ----------
  { id:'click_spc_1', era:'Raumfahrt', name:'Reaktionsräder',      desc:'+220k pro Klick', type:'click', addClick:220000, baseCost:4_000_000_000, scale:1.30 },
  { id:'click_spc_2', era:'Raumfahrt', name:'Robot-Manipulatoren', desc:'+600k pro Klick', type:'click', addClick:600000, baseCost:9_000_000_000, scale:1.32 },

  { id:'auto_spc_1',  era:'Raumfahrt', name:'Orbitale Fabriken',   desc:'+1.2M Stein/s', type:'auto', addPerSec:1_200_000, baseCost:7_500_000_000, scale:1.28 },
  { id:'auto_spc_2',  era:'Raumfahrt', name:'Fusionshilfen',       desc:'+3.2M Stein/s', type:'auto', addPerSec:3_200_000, baseCost:16_000_000_000, scale:1.30 },

  // Titan & Treibstoff (Öl+Energie➜Treibstoff; Titan+Treibstoff➜Energie-Peak)
  { id:'titan_ops',  era:'Raumfahrt', name:'Asteroidenbergbau',  desc:'Titan (passiv)', type:'flag', baseCost:4_000_000_000, scale:1.27 },
  { id:'fuel_synth', era:'Raumfahrt', name:'Treibstoffsynthese', desc:'Öl+Energie ➜ Treibstoff', type:'flag', baseCost:7_500_000_000, scale:1.28 },
  { id:'reactor_boost', era:'Raumfahrt', name:'Orbitale Reaktoren', desc:'Titan+Treibstoff ➜ Energie', type:'flag', baseCost:10_000_000_000, scale:1.30 },

  // ---------- SCI-FI ----------
  { id:'click_scifi_1', era:'Sci-Fi', name:'Neuro-Reflexe', desc:'+1.8M pro Klick', type:'click', addClick:1_800_000, baseCost:22_000_000_000, scale:1.32 },
  { id:'click_scifi_2', era:'Sci-Fi', name:'Grav-Kollektor', desc:'+4.2M pro Klick', type:'click', addClick:4_200_000, baseCost:38_000_000_000, scale:1.34 },

  { id:'auto_scifi_1',  era:'Sci-Fi', name:'Replicatorlinien', desc:'+10M Stein/s', type:'auto', addPerSec:10_000_000, baseCost:28_000_000_000, scale:1.30 },
  { id:'auto_scifi_2',  era:'Sci-Fi', name:'Dunkelenergie-Anzapfung', desc:'+28M Stein/s', type:'auto', addPerSec:28_000_000, baseCost:45_000_000_000, scale:1.32 },

  // Plasma & Naniten (Plasma+Naniten ➜ Energie-Überfluss)
  { id:'plasma_array_flag', era:'Sci-Fi', name:'Plasmaextraktion', desc:'Plasma (passiv)', type:'flag', baseCost:22_000_000_000, scale:1.29 },
  { id:'nano_fab_flag',     era:'Sci-Fi', name:'Nano-Fabriken',    desc:'Naniten (passiv)', type:'flag', baseCost:38_000_000_000, scale:1.30 },
  { id:'plasma_core_conv',  era:'Sci-Fi', name:'Plasmakern',       desc:'Plasma+Naniten ➜ Energie', type:'flag', baseCost:52_000_000_000, scale:1.32 },

  // ---------- ALIEN ----------
  { id:'click_alien_1', era:'Alien', name:'Xeno-Synergie', desc:'+12M pro Klick', type:'click', addClick:12_000_000, baseCost:120_000_000_000, scale:1.34 },
  { id:'click_alien_2', era:'Alien', name:'Phasen-Resonanz', desc:'+28M pro Klick', type:'click', addClick:28_000_000, baseCost:180_000_000_000, scale:1.36 },

  { id:'auto_alien_1',  era:'Alien', name:'Singularitätsfarm', desc:'+90M Stein/s', type:'auto', addPerSec:90_000_000, baseCost:160_000_000_000, scale:1.34 },
  { id:'auto_alien_2',  era:'Alien', name:'Zeitkaskaden',     desc:'+240M Stein/s', type:'auto', addPerSec:240_000_000, baseCost:260_000_000_000, scale:1.36 },

  // Xeno (Xeno+Plasma ➜ Energie-Überfluss²)
  { id:'xeno_ops',        era:'Alien', name:'Xeno-Extraktoren', desc:'Xenokristalle (passiv)', type:'flag', baseCost:120_000_000_000, scale:1.33 },
  { id:'xeno_synth_conv', era:'Alien', name:'Xeno-Synthese',    desc:'Xeno+Plasma ➜ Energie',  type:'flag', baseCost:180_000_000_000, scale:1.35 },

  // ---------- HIDDEN BRIDGES (für alle Epochen nach Evolution) ----------
  { id:'bridge_bronze_click', era:'Bronzezeit',    name:'[Bridge] Bronze Click',    desc:'Hidden', type:'click', addClick:8,     baseCost:0, scale:1, hidden:true },
  { id:'bridge_bronze_auto',  era:'Bronzezeit',    name:'[Bridge] Bronze Auto',     desc:'Hidden', type:'auto',  addPerSec:2,    baseCost:0, scale:1, hidden:true },

  { id:'bridge_med_click',    era:'Mittelalter',   name:'[Bridge] Med Click',       desc:'Hidden', type:'click', addClick:50,    baseCost:0, scale:1, hidden:true },
  { id:'bridge_med_auto',     era:'Mittelalter',   name:'[Bridge] Med Auto',        desc:'Hidden', type:'auto',  addPerSec:25,   baseCost:0, scale:1, hidden:true },

  { id:'bridge_ind_click',    era:'Industriezeit', name:'[Bridge] Ind Click',       desc:'Hidden', type:'click', addClick:800,   baseCost:0, scale:1, hidden:true },
  { id:'bridge_ind_auto',     era:'Industriezeit', name:'[Bridge] Ind Auto',        desc:'Hidden', type:'auto',  addPerSec:2000, baseCost:0, scale:1, hidden:true },

  { id:'bridge_mod_click',    era:'Moderne',       name:'[Bridge] Mod Click',       desc:'Hidden', type:'click', addClick:6000,  baseCost:0, scale:1, hidden:true },
  { id:'bridge_mod_auto',     era:'Moderne',       name:'[Bridge] Mod Auto',        desc:'Hidden', type:'auto',  addPerSec:16000,baseCost:0, scale:1, hidden:true },

  { id:'bridge_dig_click',    era:'Digitalzeitalter', name:'[Bridge] Dig Click',    desc:'Hidden', type:'click', addClick:50000, baseCost:0, scale:1, hidden:true },
  { id:'bridge_dig_auto',     era:'Digitalzeitalter', name:'[Bridge] Dig Auto',     desc:'Hidden', type:'auto',  addPerSec:140000, baseCost:0, scale:1, hidden:true },

  { id:'bridge_spc_click',    era:'Raumfahrt',     name:'[Bridge] Spc Click',       desc:'Hidden', type:'click', addClick:500000, baseCost:0, scale:1, hidden:true },
  { id:'bridge_spc_auto',     era:'Raumfahrt',     name:'[Bridge] Spc Auto',        desc:'Hidden', type:'auto',  addPerSec:1_200_000, baseCost:0, scale:1, hidden:true },

  { id:'bridge_scifi_click',  era:'Sci-Fi',        name:'[Bridge] SciFi Click',     desc:'Hidden', type:'click', addClick:4_000_000, baseCost:0, scale:1, hidden:true },
  { id:'bridge_scifi_auto',   era:'Sci-Fi',        name:'[Bridge] SciFi Auto',      desc:'Hidden', type:'auto',  addPerSec:10_000_000, baseCost:0, scale:1, hidden:true },

  { id:'bridge_alien_click',  era:'Alien',         name:'[Bridge] Alien Click',     desc:'Hidden', type:'click', addClick:20_000_000, baseCost:0, scale:1, hidden:true },
  { id:'bridge_alien_auto',   era:'Alien',         name:'[Bridge] Alien Auto',      desc:'Hidden', type:'auto',  addPerSec:80_000_000, baseCost:0, scale:1, hidden:true },
];

// ============= CORE =============
const LEGACY_DISCOUNT = 0.35; // 65% Rabatt je Epoche Abstand

function eraIndex(era){ return Math.max(0, ERA_ORDER.indexOf(era)); }
function legacyFactor(upEra, curEra){
  const d = eraIndex(curEra) - eraIndex(upEra);
  if (d <= 0) return 1;
  let f = 1; for (let i=0;i<d;i++) f *= LEGACY_DISCOUNT;
  return f;
}

export function initUpgradesState(state){
  if (!state.upgrades) state.upgrades = { owned:{} };
  if (!state.upgrades.owned) state.upgrades.owned = {};
}

export function listVisibleUpgrades(state){
  const curIdx = eraIndex(state.era);
  return UPG.filter(u => !u.hidden && eraIndex(u.era) <= curIdx);
}

export function nextCostFor(state, upId){
  const u = UPG.find(x => x.id === upId); if (!u) return Infinity;
  const owned = state.upgrades.owned[upId] || 0;
  const base = u.baseCost * Math.pow(u.scale, owned);
  const factor = legacyFactor(u.era, state.era);
  return Math.round(base * factor * 100) / 100;
}

export function canAfford(state, cost){ return (state.resources.stone || 0) >= cost; }

export function tryBuyUpgrade(state, upId){
  const u = UPG.find(x => x.id === upId); if (!u) return { ok:false, reason:'unknown' };
  const owned = state.upgrades.owned[upId] || 0;
  const cost = nextCostFor(state, upId);
  if (!canAfford(state, cost)) return { ok:false, reason:'cost', cost };
  state.resources.stone -= cost;
  state.upgrades.owned[upId] = owned + 1;
  computeDerivedStats(state);
  return { ok:true, cost, newOwned: state.upgrades.owned[upId] };
}

export function computeDerivedStats(state){
  let perClick = 1;
  let perSec   = 0;
  const owned = state.upgrades?.owned || {};
  for (const u of UPG){
    const n = owned[u.id] || 0;
    if (!n) continue;
    if (u.type === 'click' && u.addClick) perClick += u.addClick * n;
    if (u.type === 'auto'  && u.addPerSec) perSec   += u.addPerSec * n;
  }
  const global = state.bonus?.globalMult || 1;
  const coreM  = coreMultiplier(state);
  state.perClick = perClick * global * coreM;
  state.perSec   = perSec   * global * coreM;
}

export function getUpgradeDef(id){ return UPG.find(u => u.id === id); }
export function grantHidden(state, id){
  initUpgradesState(state);
  state.upgrades.owned[id] = (state.upgrades.owned[id] || 0) + 1;
  computeDerivedStats(state);
}
