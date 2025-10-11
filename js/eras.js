// eras.js – Meilensteine & Evolution mit Bridge-Boni (9 Epochen)

import { grantHidden } from './upgrades.js';

export const ERAS = [
  'Steinzeit',
  'Bronzezeit',
  'Mittelalter',
  'Industriezeit',
  'Moderne',
  'Digitalzeitalter',
  'Raumfahrt',
  'Sci-Fi',
  'Alien'
];

// Meilensteine (Run-Stein) → nächste Ära
const MILESTONES = {
  'Steinzeit':        { target: 1_500,        next: 'Bronzezeit' },
  'Bronzezeit':       { target: 75_000,       next: 'Mittelalter' },
  'Mittelalter':      { target: 1_500_000,    next: 'Industriezeit' },
  'Industriezeit':    { target: 30_000_000,   next: 'Moderne' },
  'Moderne':          { target: 600_000_000,  next: 'Digitalzeitalter' },
  'Digitalzeitalter': { target: 12_000_000_000, next: 'Raumfahrt' },
  'Raumfahrt':        { target: 240_000_000_000, next: 'Sci-Fi' },
  'Sci-Fi':           { target: 4_800_000_000_000, next: 'Alien' },
  'Alien':            { target: 0, next: null }
};

export function milestoneProgress(state){
  const cfg = MILESTONES[state.era];
  if (!cfg) return { text:'', progress:0, canEvolve:false };
  const have = state.stats?.runTotalStone || 0;
  const prog = cfg.target > 0 ? Math.min(1, have / cfg.target) : 1;
  const nextName = cfg.next ? cfg.next : '—';
  const text = cfg.target > 0
    ? `Sammle ${fmt(cfg.target)} Stein (Run: ${fmt(have)}) → ${nextName}`
    : `Maximale Ära erreicht`;
  return { text, progress: prog, canEvolve: prog >= 1 && !!cfg.next };
}

export function evolveToNextEra(state){
  const cfg = MILESTONES[state.era];
  if (!cfg || !cfg.next) return false;

  state.era = cfg.next;
  state.stats.totalEvolutions = (state.stats.totalEvolutions || 0) + 1;

  // Bridge-Boni – sanfter Start je neuer Ära
  switch (state.era){
    case 'Bronzezeit':
      grantHidden(state, 'bridge_bronze_click');
      grantHidden(state, 'bridge_bronze_auto');
      break;
    case 'Mittelalter':
      grantHidden(state, 'bridge_med_click');
      grantHidden(state, 'bridge_med_auto');
      break;
    case 'Industriezeit':
      grantHidden(state, 'bridge_ind_click');
      grantHidden(state, 'bridge_ind_auto');
      break;
    case 'Moderne':
      grantHidden(state, 'bridge_mod_click');
      grantHidden(state, 'bridge_mod_auto');
      break;
    case 'Digitalzeitalter':
      grantHidden(state, 'bridge_dig_click');
      grantHidden(state, 'bridge_dig_auto');
      break;
    case 'Raumfahrt':
      grantHidden(state, 'bridge_spc_click');
      grantHidden(state, 'bridge_spc_auto');
      break;
    case 'Sci-Fi':
      grantHidden(state, 'bridge_scifi_click');
      grantHidden(state, 'bridge_scifi_auto');
      break;
    case 'Alien':
      grantHidden(state, 'bridge_alien_click');
      grantHidden(state, 'bridge_alien_auto');
      break;
  }

  state.stats.runTotalStone = 0;
  return true;
}

function fmt(n){
  const x = Number(n)||0;
  if (x >= 1e15) return (x/1e15).toFixed(2)+'Q';
  if (x >= 1e12) return (x/1e12).toFixed(2)+'T';
  if (x >= 1e9)  return (x/1e9).toFixed(2)+'B';
  if (x >= 1e6)  return (x/1e6).toFixed(2)+'M';
  if (x >= 1e3)  return (x/1e3).toFixed(2)+'K';
  return Math.floor(x).toString();
}
