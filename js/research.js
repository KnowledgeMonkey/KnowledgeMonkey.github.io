// research.js – Forschungspunkte, Tech-Tree, Effekte (erweitert)

export function ensureResearch(state){
  if (!state.research) state.research = { points: 0, owned: {} };
  if (!state.bonus) state.bonus = {};
  state.bonus.converterEff   = state.bonus.converterEff   ?? 1;
  state.bonus.bronzeProdMult = state.bonus.bronzeProdMult ?? 1;
  state.bonus.globalMult     = state.bonus.globalMult     ?? 1;
}

export function researchRatePerSec(state){
  ensureResearch(state);
  const gm = state.bonus?.globalMult || 1;
  let base =
    state.era === 'Steinzeit'         ? 0.005 :
    state.era === 'Bronzezeit'        ? 0.02  :
    state.era === 'Mittelalter'       ? 0.05  :
    state.era === 'Industriezeit'     ? 0.08  :
    state.era === 'Moderne'           ? 0.12  :
    state.era === 'Digitalzeitalter'  ? 0.18  :
    state.era === 'Raumfahrt'         ? 0.26  :
    state.era === 'Sci-Fi'            ? 0.38  :
    /* Alien */                          0.55;

  if (state.research.owned.scribe) base *= 3;
  if (state.research.owned.org_knowledge) base *= 2;
  if (state.research.owned.alloy_theory) base += 0.01;

  if (state.research.owned.steam_science) base *= 1.5;
  if (state.research.owned.electrification) base *= 1.4;
  if (state.research.owned.semiconductor) base *= 1.4;
  if (state.research.owned.astro_methods) base *= 1.5;
  if (state.research.owned.quantum_calcs) base *= 1.6;

  return base * gm;
}

export function researchTick(state, dt){
  ensureResearch(state);
  state.research.points += researchRatePerSec(state) * dt;
}

export const TECHS = [
  // Früh
  { id:'scribe', era:'Steinzeit', name:'Schriftkunde', cost:5, desc:'+200% FP-Rate, +5% global.', requires:[], apply(s){ s.bonus.globalMult *= 1.05; } },
  { id:'stone_tools', era:'Steinzeit', name:'Verbesserte Steingeräte', cost:8, desc:'+10% Klick-Power.', requires:[], apply(s){ s.perClick *= 1.10; } },
  { id:'org_knowledge', era:'Steinzeit', name:'Wissensorganisation', cost:12, desc:'+100% FP-Rate.', requires:['scribe'], apply(s){} },

  { id:'bronze_working', era:'Bronzezeit', name:'Bronzeverarbeitung', cost:25, desc:'+25% Converter-Effizienz.', requires:['scribe'], apply(s){ s.bonus.converterEff *= 1.25; } },
  { id:'bellows', era:'Bronzezeit', name:'Blasebälge', cost:35, desc:'+50% Bronzeproduktion aus Gebäuden.', requires:['bronze_working'], apply(s){ s.bonus.bronzeProdMult *= 1.5; } },
  { id:'mathematics', era:'Bronzezeit', name:'Mathematik', cost:45, desc:'+10% global.', requires:['scribe'], apply(s){ s.bonus.globalMult *= 1.10; } },

  { id:'alloy_theory', era:'Mittelalter', name:'Legierungstheorie', cost:120, desc:'+0.01 FP/s zusätzlich.', requires:['mathematics'], apply(s){} },

  // Industrie
  { id:'steam_science', era:'Industriezeit', name:'Dampf-Wissenschaft', cost:260, desc:'+50% FP-Rate, +10% global.', requires:['alloy_theory'], apply(s){ s.bonus.globalMult *= 1.10; } },
  { id:'steel_process', era:'Industriezeit', name:'Bessemer-Prozess', cost:340, desc:'+25% Stahl-Produktion.', requires:['steam_science'], apply(s){ s.bonus.steelMult = (s.bonus.steelMult||1)*1.25; } },

  // Moderne
  { id:'electrification', era:'Moderne', name:'Elektrifizierung', cost:520, desc:'+40% FP-Rate, +20% Energie-Prod.', requires:['steel_process'], apply(s){ s.bonus.powerMult = (s.bonus.powerMult||1)*1.2; } },
  { id:'petrochem', era:'Moderne', name:'Petrochemie', cost:680, desc:'+20% Öl-Prod.', requires:['electrification'], apply(s){ s.bonus.oilMult = (s.bonus.oilMult||1)*1.2; } },

  // Digital
  { id:'semiconductor', era:'Digitalzeitalter', name:'Halbleiter', cost:900, desc:'+40% FP-Rate, +25% Chips.', requires:['electrification'], apply(s){ s.bonus.circuitsMult = (s.bonus.circuitsMult||1)*1.25; } },
  { id:'datacenter_cooling', era:'Digitalzeitalter', name:'DC-Kühlung', cost:1100, desc:'+20% Energie.', requires:['semiconductor'], apply(s){ s.bonus.powerMult = (s.bonus.powerMult||1)*1.2; } },

  // Raumfahrt
  { id:'astro_methods', era:'Raumfahrt', name:'Astro-Methoden', cost:1600, desc:'+50% FP-Rate, +20% Titan.', requires:['datacenter_cooling'], apply(s){ s.bonus.titaniumMult = (s.bonus.titaniumMult||1)*1.2; } },
  { id:'efficient_prop', era:'Raumfahrt', name:'Effizienter Antrieb', cost:2100, desc:'+25% Treibstoff.', requires:['astro_methods'], apply(s){ s.bonus.fuelMult = (s.bonus.fuelMult||1)*1.25; } },

  // Sci-Fi
  { id:'quantum_calcs', era:'Sci-Fi', name:'Quantenberechnungen', cost:2800, desc:'+60% FP-Rate, +10% global.', requires:['efficient_prop'], apply(s){ s.bonus.globalMult *= 1.10; } },
  { id:'nano_materials', era:'Sci-Fi', name:'Nanomaterialien', cost:3200, desc:'+25% Naniten.', requires:['quantum_calcs'], apply(s){ s.bonus.nanitesMult = (s.bonus.nanitesMult||1)*1.25; } },

  // Alien
  { id:'xeno_harmonics', era:'Alien', name:'Xeno-Harmonien', cost:4200, desc:'+20% Plasma & Energie.', requires:['nano_materials'], apply(s){ s.bonus.plasmaMult = (s.bonus.plasmaMult||1)*1.2; s.bonus.powerMult = (s.bonus.powerMult||1)*1.2; } },
];

export function visibleTechs(state){
  const order = ['Steinzeit','Bronzezeit','Mittelalter','Industriezeit','Moderne','Digitalzeitalter','Raumfahrt','Sci-Fi','Alien'];
  const idx = order.indexOf(state.era);
  return TECHS.filter(t => order.indexOf(t.era) <= idx);
}

export function canResearch(state, tech){
  ensureResearch(state);
  if (state.research.owned[tech.id]) return false;
  for (const r of (tech.requires||[])){ if (!state.research.owned[r]) return false; }
  return (state.research.points || 0) >= tech.cost;
}

export function buyResearch(state, techId){
  ensureResearch(state);
  const tech = TECHS.find(t => t.id === techId);
  if (!tech) return { ok:false, reason:'unknown' };
  if (state.research.owned[tech.id]) return { ok:false, reason:'owned' };
  for (const r of (tech.requires||[])) if (!state.research.owned[r]) return { ok:false, reason:'requires' };
  if ((state.research.points||0) < tech.cost) return { ok:false, reason:'cost' };
  state.research.points -= tech.cost;
  state.research.owned[tech.id] = 1;
  tech.apply?.(state);
  return { ok:true };
}
