// eras.js – Epochen/Meilensteine & Evolution

export const ERA_ORDER = [
  'Steinzeit',
  'Bronzezeit',
  'Mittelalter',
  'Industrialisierung',
  'Moderne',
  'Zukunft',
  'Sci-Fi',
  'Alien'
];

// Anforderungen = kumulative Gesamtproduktion im aktuellen Run (runTotalStone)
const ERA_REQUIREMENTS = {
  'Steinzeit':            { needTotalStone: 10_000,            next: 'Bronzezeit' },
  'Bronzezeit':           { needTotalStone: 250_000,           next: 'Mittelalter' },
  'Mittelalter':          { needTotalStone: 5_000_000,         next: 'Industrialisierung' },
  'Industrialisierung':   { needTotalStone: 100_000_000,       next: 'Moderne' },
  'Moderne':              { needTotalStone: 2_000_000_000,     next: 'Zukunft' },
  'Zukunft':              { needTotalStone: 50_000_000_000,    next: 'Sci-Fi' },
  'Sci-Fi':               { needTotalStone: 1_000_000_000_000, next: 'Alien' },
  'Alien':                { needTotalStone: Infinity,           next: null }
};

export function getNextEraName(current){
  return ERA_REQUIREMENTS[current]?.next ?? null;
}

export function getRequirement(current){
  return ERA_REQUIREMENTS[current] ?? { needTotalStone: Infinity, next: null };
}

export function milestoneProgress(state){
  const req = getRequirement(state.era);
  const need = req.needTotalStone;
  const have = Math.max(0, state.stats?.runTotalStone || 0);

  const progress = !isFinite(need) ? 1 : Math.min(1, have / need);
  const next = req.next;
  const text = next
    ? `Sammle ${fmt(need)} Stein gesamt (Run), um die ${next} freizuschalten.`
    : `Endgame erreicht.`;

  return { progress, text, canEvolve: !!next && have >= need, nextEra: next };
}

function fmt(n){
  if (!isFinite(n)) return '∞';
  if (n >= 1e15) return (n/1e15).toFixed(2)+'Q';
  if (n >= 1e12) return (n/1e12).toFixed(2)+'T';
  if (n >= 1e9)  return (n/1e9).toFixed(2)+'B';
  if (n >= 1e6)  return (n/1e6).toFixed(2)+'M';
  if (n >= 1e3)  return (n/1e3).toFixed(2)+'K';
  return Math.floor(n).toString();
}

export function evolveToNextEra(state){
  const { canEvolve, nextEra } = milestoneProgress(state);
  if (!canEvolve || !nextEra) return false;

  // Permanenter Boost: +50% pro Evolution (später feintunen)
  const boostGain = 1.5;

  state.era = nextEra;
  state.bonus = state.bonus || { globalMult: 1 };
  state.bonus.globalMult *= boostGain;

  // Reset Ressourcen & Upgrades
  state.resources = { stone: 0 };
  state.upgrades = { owned: {} };

  // Run-Stats zurücksetzen, Meta-Stats hochzählen
  state.stats = state.stats || {};
  state.stats.runTotalStone = 0;
  state.stats.totalEvolutions = (state.stats.totalEvolutions || 0) + 1;

  return true;
}
