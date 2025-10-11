// buildings.js – Gebäude, Bulk-Kauf & Produktion (bis Alien)

const ERA = {
  STONE:'Steinzeit', BRONZE:'Bronzezeit', MEDIEVAL:'Mittelalter',
  INDUSTRIAL:'Industriezeit', MODERN:'Moderne', DIGITAL:'Digitalzeitalter',
  SPACE:'Raumfahrt', SCIFI:'Sci-Fi', ALIEN:'Alien'
};

export const BUILDINGS = {
  [ERA.STONE]: [
    { id:'pit',        name:'Kiesgrube',  desc:'Fördert Stein.', baseCost:120,   scale:1.15, produces:{ stone:0.6 } },
    { id:'wood_lodge', name:'Holzlager',  desc:'Sammelt Holz.',  baseCost:180,   scale:1.16, produces:{ wood:0.3 } },
    { id:'quarry',     name:'Steinbruch', desc:'Mehr Stein.',    baseCost:600,   scale:1.17, produces:{ stone:2.5 } },
  ],
  [ERA.BRONZE]: [
    { id:'ore_mine',  name:'Erzmine',    desc:'Fördert Erz.',    baseCost:8000,  scale:1.18, produces:{ ore:6 } },
    { id:'smelter',   name:'Schmelzofen',desc:'Etwas Bronze.',   baseCost:16000, scale:1.19, produces:{ bronze:0.5 } },
  ],
  [ERA.MEDIEVAL]: [
    { id:'royal_quarry', name:'Königlicher Steinbruch', desc:'Viel Stein.', baseCost:300000, scale:1.20, produces:{ stone:35 } },
  ],
  [ERA.INDUSTRIAL]: [
    { id:'coal_mine', name:'Kohlenzeche',   desc:'Kohle.',     baseCost:1_600_000, scale:1.21, produces:{ coal:60 } },
    { id:'iron_mine', name:'Eisenmine',     desc:'Eisen.',     baseCost:2_200_000, scale:1.22, produces:{ iron:40 } },
    { id:'steel_mill',name:'Stahlwerk',     desc:'Stahl.',     baseCost:4_500_000, scale:1.23, produces:{ steel:25 } },
  ],
  [ERA.MODERN]: [
    { id:'oil_rig',   name:'Ölplattform',   desc:'Öl.',        baseCost:28_000_000, scale:1.23, produces:{ oil:120 } },
    { id:'power_plant',name:'Kraftwerk',    desc:'Energie.',    baseCost:52_000_000, scale:1.24, produces:{ power:400 } },
  ],
  [ERA.DIGITAL]: [
    { id:'silicon_fab',name:'Silizium-Fab', desc:'Silizium.',   baseCost:340_000_000, scale:1.25, produces:{ silicon:220 } },
    { id:'circuit_plant',name:'Chipfabrik', desc:'Schaltkreise.', baseCost:680_000_000, scale:1.26, produces:{ circuits:90 } },
    { id:'data_center',name:'Rechenzentrum', desc:'Energieverbrauch… aber hier „Energie“ generiert fürs Game.', baseCost:820_000_000, scale:1.27, produces:{ power:1200 } },
  ],
  [ERA.SPACE]: [
    { id:'titan_mine', name:'Titan-Mine',   desc:'Titan.',      baseCost:4_000_000_000, scale:1.27, produces:{ titanium:180 } },
    { id:'fuel_refinery', name:'Treibstoffraffinerie', desc:'Treibstoff.', baseCost:7_500_000_000, scale:1.28, produces:{ fuel:160 } },
  ],
  [ERA.SCIFI]: [
    { id:'plasma_array', name:'Plasma-Array', desc:'Plasma.',   baseCost:22_000_000_000, scale:1.29, produces:{ plasma:75 } },
    { id:'nano_forge',   name:'Nanofabrik',   desc:'Naniten.',  baseCost:38_000_000_000, scale:1.30, produces:{ nanites:42 } },
  ],
  [ERA.ALIEN]: [
    { id:'xeno_harvester', name:'Xeno-Ernter', desc:'Xenokristalle.', baseCost:120_000_000_000, scale:1.31, produces:{ xeno:20 } },
    { id:'plasma_core',    name:'Plasmakern',  desc:'Viel Energie.',  baseCost:160_000_000_000, scale:1.32, produces:{ power:6000 } },
  ],
};

export function getEraBuildings(era){ return BUILDINGS[era] || []; }
export function getOwned(state, id){ return (state.buildings?.owned?.[id] ?? 0); }
export function unitCost(def, owned){ return def.baseCost * Math.pow(def.scale, owned); }

export function bulkCost(def, owned, qty){
  if (qty <= 0) return 0;
  const r = def.scale, a0 = unitCost(def, owned);
  if (r === 1) return a0 * qty;
  return a0 * (Math.pow(r, qty) - 1) / (r - 1);
}

export function canAfford(state, cost){ return (state.resources.stone || 0) >= cost; }

export function tryBuyBuilding(state, def, qty){
  const owned = getOwned(state, def.id);
  const cost = Math.round(bulkCost(def, owned, qty) * 100) / 100;
  if (!canAfford(state, cost)) return { ok:false, cost };
  state.resources.stone -= cost;
  if (!state.buildings) state.buildings = { owned: {} };
  state.buildings.owned[def.id] = owned + qty;
  return { ok:true, cost, newOwned: state.buildings.owned[def.id] };
}

export function buildingsTick(state, dt){
  const eraDefs = getEraBuildings(state.era);
  if (!state.buildings) return;
  const owned = state.buildings.owned || {};
  const gm = state.bonus?.globalMult || 1;
  const bronzeMult = state.bonus?.bronzeProdMult || 1;

  for (const def of eraDefs){
    const n = owned[def.id] || 0; if (!n) continue;
    const mult = n * gm * dt;
    if (def.produces){
      for (const [res, perSec] of Object.entries(def.produces)){
        const extra = (res === 'bronze') ? bronzeMult : 1;
        state.resources[res] = (state.resources[res] || 0) + perSec * mult * extra;
      }
    }
  }
}
