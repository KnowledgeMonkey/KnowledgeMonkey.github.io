// sfx.js – simple WebAudio bleeps, no external files

let audioCtx;
function ctx(){ return audioCtx || (audioCtx = new (window.AudioContext||window.webkitAudioContext)()); }

export const SFX = {
  enabled: true,
  setEnabled(on){ this.enabled = !!on; },
};

export function clickBleep(){
  if (!SFX.enabled) return;
  const c = ctx();
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = 'square';
  o.frequency.value = 240 + Math.random()*40;
  g.gain.value = 0.08;
  o.connect(g); g.connect(c.destination);
  o.start();
  o.frequency.exponentialRampToValueAtTime(120, c.currentTime + 0.08);
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.09);
  o.stop(c.currentTime + 0.1);
}

export function buyPing(){
  if (!SFX.enabled) return;
  const c = ctx();
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = 'triangle'; o.frequency.value = 880;
  g.gain.value = 0.06; o.connect(g); g.connect(c.destination);
  o.start();
  o.frequency.exponentialRampToValueAtTime(1760, c.currentTime + 0.07);
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.08);
  o.stop(c.currentTime + 0.09);
}

export function evolveWoosh(){
  if (!SFX.enabled) return;
  const c = ctx();
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = 'sawtooth'; o.frequency.value = 180;
  g.gain.value = 0.05; o.connect(g); g.connect(c.destination);
  o.start();
  o.frequency.exponentialRampToValueAtTime(40, c.currentTime + 0.35);
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.38);
  o.stop(c.currentTime + 0.4);
}
