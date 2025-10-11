// prestige.js – Kerne, Gain-Berechnung, Reset

export function ensurePrestige(state){
  if (!state.prestige)
    state.prestige = { cores: 0, corePower: 0.12, totalPrestiges: 0 };
  if (typeof state.stats?.lifetimeStone !== 'number'){
    if (!state.stats) state.stats = {};
    state.stats.lifetimeStone = 0;
  }
}

/** Multiplikator aus Kernen */
export function coreMultiplier(state){
  const p = state.prestige?.corePower ?? 0.12;
  const c = state.prestige?.cores ?? 0;
  return 1 + c * p;
}

/** Kerne, die man aktuell beim Reset bekäme (sqrt-Skalierung, fair & smooth) */
export function prestigeGain(state){
  const score = (state.stats?.lifetimeStone || 0);
  const gain = Math.floor(Math.pow(score / 1e6, 0.5)); // √(lifetime / 1e6)
  return Math.max(0, gain);
}

export function canPrestige(state){
  return prestigeGain(state) > 0;
}

/** Führt einen Prestige-Reset durch (Forschung bleibt, Punkte auf 0) */
export function doPrestige(state){
  const gain = prestigeGain(state);
  if (gain <= 0) return { ok:false, gain:0 };

  state.prestige.cores = (state.prestige.cores || 0) + gain;
  state.prestige.totalPrestiges = (state.prestige.totalPrestiges || 0) + 1;

  // Reset der Welt
  state.era = 'Steinzeit';
  state.resources = { stone:0, wood:0, ore:0, bronze:0 };
  state.upgrades = { owned:{} };
  state.buildings = { owned:{} };
  state.perClick = 1;
  state.perSec = 0;
  state.stats.runTotalStone = 0;
  // Forschung bleibt, aber Punkte gehen auf 0
  if (state.research) state.research.points = 0;

  return { ok:true, gain };
}
