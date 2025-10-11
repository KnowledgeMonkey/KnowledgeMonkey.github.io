// resources.js – Produktionen & Converter-Ketten für alle 9 Epochen
// - Flags aus upgrades.js treiben passive Produktion & Converter
// - Ressourcenspezifische Multiplikatoren aus research.js (z. B. steelMult)
// - Energie ("power") ist Quasi-Universal-Output in späteren Ketten

export const ERA_RESOURCES = {
  'Steinzeit': [
    { id:'stone',  name:'Stein',  icon:'./assets/icons/stone.svg',  color:'#c8b79a' },
    { id:'wood',   name:'Holz',   icon:'./assets/icons/wood.svg',   color:'#b38b5e' },
  ],
  'Bronzezeit': [
    { id:'stone',  name:'Stein',  icon:'./assets/icons/stone.svg',  color:'#c8b79a' },
    { id:'wood',   name:'Holz',   icon:'./assets/icons/wood.svg',   color:'#b38b5e' },
    { id:'ore',    name:'Erz',    icon:'./assets/icons/ore.svg',    color:'#9aa6b2' },
    { id:'bronze', name:'Bronze', icon:'./assets/icons/bronze.svg', color:'#cc8f56' },
  ],
  'Mittelalter': [
    { id:'stone',  name:'Stein',  icon:'./assets/icons/stone.svg',  color:'#c8b79a' },
    { id:'wood',   name:'Holz',   icon:'./assets/icons/wood.svg',   color:'#b38b5e' },
    { id:'ore',    name:'Erz',    icon:'./assets/icons/ore.svg',    color:'#9aa6b2' },
    { id:'bronze', name:'Bronze', icon:'./assets/icons/bronze.svg', color:'#cc8f56' },
  ],
  'Industriezeit': [
    { id:'coal',   name:'Kohle',     icon:'./assets/icons/coal.svg',    color:'#333' },
    { id:'iron',   name:'Eisen',     icon:'./assets/icons/iron.svg',    color:'#9aa6b2' },
    { id:'steel',  name:'Stahl',     icon:'./assets/icons/steel.svg',   color:'#8c9299' },
  ],
  'Moderne': [
    { id:'oil',    name:'Öl',        icon:'./assets/icons/oil.svg',     color:'#222' },
    { id:'power',  name:'Energie',   icon:'./assets/icons/power.svg',   color:'#ffd369' },
    { id:'steel',  name:'Stahl',     icon:'./assets/icons/steel.svg',   color:'#8c9299' },
  ],
  'Digitalzeitalter': [
    { id:'silicon',  name:'Silizium',     icon:'./assets/icons/silicon.svg',  color:'#cfd8dc' },
    { id:'circuits', name:'Schaltkreise', icon:'./assets/icons/circuits.svg', color:'#90caf9'},
    { id:'power',    name:'Energie',      icon:'./assets/icons/power.svg',    color:'#ffd369' },
  ],
  'Raumfahrt': [
    { id:'titanium', name:'Titan',        icon:'./assets/icons/titanium.svg', color:'#b0bec5' },
    { id:'fuel',     name:'Treibstoff',   icon:'./assets/icons/fuel.svg',     color:'#ef9a9a' },
    { id:'power',    name:'Energie',      icon:'./assets/icons/power.svg',    color:'#ffd369' },
  ],
  'Sci-Fi': [
    { id:'plasma',   name:'Plasma',       icon:'./assets/icons/plasma.svg',   color:'#a78bfa' },
    { id:'nanites',  name:'Naniten',      icon:'./assets/icons/nanites.svg',  color:'#80cbc4' },
    { id:'power',    name:'Energie',      icon:'./assets/icons/power.svg',    color:'#ffd369' },
  ],
  'Alien': [
    { id:'xeno',     name:'Xenokristalle', icon:'./assets/icons/xeno.svg',    color:'#ef80ff' },
    { id:'plasma',   name:'Plasma',        icon:'./assets/icons/plasma.svg',  color:'#a78bfa' },
    { id:'power',    name:'Energie',       icon:'./assets/icons/power.svg',   color:'#ffd369' },
  ],
};

// ===== Passive Produktionen (pro Flag-Einheit) =====
const UPG_TO_PROD = {
  // Früh
  'gatherer':        { res:'wood',  perSec: 0.10 },
  'hut_camp':        { res:'wood',  perSec: 0.50 },
  'stone_quarry_b':  { res:'ore',   perSec: 0.25 },
  'copper_mine':     { res:'ore',   perSec: 1.00 },
  'tin_mine':        { res:'ore',   perSec: 1.00 },

  // Industriezeit
  'coal_ops':        { res:'coal',  perSec: 8.0 },
  'iron_ops':        { res:'iron',  perSec: 5.5 },

  // Moderne
  'oil_drill':       { res:'oil',   perSec: 7.5 },

  // Digital
  'silicon_ops':     { res:'silicon', perSec: 3.7 },

  // Raumfahrt
  'titan_ops':       { res:'titanium', perSec: 2.2 },

  // Sci-Fi
  'plasma_array_flag': { res:'plasma', perSec: 1.1 },
  'nano_fab_flag':     { res:'nanites', perSec: 0.65 },

  // Alien
  'xeno_ops':          { res:'xeno', perSec: 0.35 },
};

// ===== Converter (Input -> Output) pro Flag-Einheit (pro Sekunde) =====
// Nutzung: Summe aller aktiven Converter wird durch verfügbaren Input limitiert (ratio)
const UPG_TO_CONVERTER = {
  // Bronze
  'bronze_forge':  { in:{ ore:2 },              out:{ bronze:1 } },
  'great_forge':   { in:{ ore:8 },              out:{ bronze:5 } },

  // Industrie: Eisen+Kohle->Stahl
  'steel_foundry': { in:{ iron:3, coal:4 },     out:{ steel:2 } },

  // Moderne: Öl->Energie
  'oil_refinery':  { in:{ oil:2 },              out:{ power:12 } },

  // Digital: Silizium+Energie->Schaltkreise
  'chip_etcher':   { in:{ silicon:2, power:8 }, out:{ circuits:3 } },

  // Raumfahrt: Öl+Energie->Treibstoff; Titan+Treibstoff->Energie
  'fuel_synth':    { in:{ oil:3, power:10 },    out:{ fuel:2 } },
  'reactor_boost': { in:{ titanium:2, fuel:1 }, out:{ power:18 } },

  // Sci-Fi: Plasma+Naniten->Energie
  'plasma_core_conv': { in:{ plasma:1, nanites:1 }, out:{ power:24 } },

  // Alien: Xeno+Plasma->Energie
  'xeno_synth_conv':  { in:{ xeno:1, plasma:1 }, out:{ power:42 } },
};

export function ensureResourceKeys(state){
  const r = state.resources;
  const ids = [
    'stone','wood','ore','bronze',
    'coal','iron','steel',
    'oil','power',
    'silicon','circuits',
    'titanium','fuel',
    'plasma','nanites','xeno'
  ];
  for (const k of ids) if (!(k in r)) r[k] = r[k] ?? 0;
}

export function currentResDefs(state){
  return ERA_RESOURCES[state.era] ?? [{id:'stone',name:'Stein',icon:'./assets/icons/stone.svg',color:'#c8b79a'}];
}

export function resourcesTick(state, dt){
  ensureResourceKeys(state);

  const gm      = state.bonus?.globalMult || 1;
  const convEff = state.bonus?.converterEff || 1;

  // Ressourcen-spezifische Multiplikatoren (aus Research)
  const multOf = (res) => {
    const m = state.bonus?.[res + 'Mult'];
    return (typeof m === 'number' && m > 0 ? m : 1);
  };

  const owned = state.upgrades?.owned || {};

  // --- 1) Passive Produktionen aus Flags
  for (const [upgId, cfg] of Object.entries(UPG_TO_PROD)){
    const count = owned[upgId] || 0;
    if (!count) continue;
    const add = cfg.perSec * count * dt * gm * multOf(cfg.res);
    state.resources[cfg.res] = (state.resources[cfg.res] || 0) + add;
  }

  // --- 2) Converter: Bedarf & Output aufsummieren
  const need = {}, give = {};
  for (const [upgId, conv] of Object.entries(UPG_TO_CONVERTER)){
    const count = owned[upgId] || 0; if (!count) continue;
    // Bedarf
    for (const [res, v] of Object.entries(conv.in)){
      need[res] = (need[res] || 0) + v * count;
    }
    // Output
    for (const [res, v] of Object.entries(conv.out)){
      give[res] = (give[res] || 0) + v * count;
    }
  }

  // --- 3) Limiting durch vorhandene Inputs
  let limit = 1;
  for (const [res, perSecIn] of Object.entries(need)){
    const required = perSecIn * dt * gm;
    const have = state.resources[res] || 0;
    if (required > 0){
      const possible = have / required;
      if (possible < limit) limit = possible;
    }
  }
  if (!isFinite(limit) || limit < 1e-9) limit = 0;

  // --- 4) Anwenden: Inputs abziehen, Outputs addieren (mit Effizienz & Res-Mults)
  if (limit > 0){
    // Inputs
    for (const [res, perSecIn] of Object.entries(need)){
      state.resources[res] -= perSecIn * dt * gm * limit;
    }
    // Outputs
    for (const [res, perSecOut] of Object.entries(give)){
      // Converter-Effizienz wirkt primär auf Metall/Hightech (wirkt auf alles hier, du kannst es einschränken)
      const outMult = convEff * gm * multOf(res);
      state.resources[res] = (state.resources[res] || 0) + perSecOut * dt * limit * outMult;
    }
  }
}
