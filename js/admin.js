// admin.js – Soft-geschütztes Admin/Debug Panel (Client-only, kein echter Schutz)
//
// Schutzmechanismen:
//  - Panel ist unsichtbar bis "unlock"
//  - Unlock via Hotkey (Ctrl+Shift+D) oder URL-Flag (?admin=1 oder #admin)
//  - Passphrase-Abfrage; Vergleich gegen SHA-256-Hash (kein Klartext im Code)
//  - Freischaltung nur in sessionStorage (nach Reload wieder zu)
//  - Optionaler "dev only": Panel erscheint nur auf bestimmten Hosts
//
// WICHTIG: Das verhindert Neugierige, aber NICHT entschlossene Leute mit DevTools.
// Für echte Sicherheit brauchst du einen Serverless-Check (siehe unten).

import { updateResource, } from './ui.js';
import { computeDerivedStats } from './upgrades.js';
import { milestoneProgress, evolveToNextEra } from './eras.js';

// === KONFIGURATION ===
// SHA-256 Hash deiner Passphrase in hex (z.B. von "mySecret123!")
// Erzeuge ihn im Browser in der Konsole:
//   const enc = new TextEncoder().encode('mySecret123!');
//   crypto.subtle.digest('SHA-256', enc).then(b=>console.log([...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')));
const ADMIN_PASS_HASH_HEX = '60fe74406e7f353ed979f350f2fbb6a2e8690a5fa7d1b0c32983d1d8b3f95f67'; // <— ERSETZEN!

// Optional: auf Prod-Host verstecken, z.B. deine Userpage
const DEV_ONLY = false;               // true = nur auf localhost/127.0.0.1
const ALLOWED_HOSTS = ['localhost','127.0.0.1'];

// URL-Flags die das Unlock UI erlauben
function hasAdminFlag(){
  return /\badmin=1\b/i.test(location.search) || /#admin\b/i.test(location.hash);
}

// SHA-256 Hex
async function sha256Hex(str){
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return [...new Uint8Array(buf)].map(b=>b.toString(16).padStart(2,'0')).join('');
}

function canShowEntry(){
  if (DEV_ONLY && !ALLOWED_HOSTS.includes(location.hostname)) return false;
  return true;
}

function isUnlocked(){
  return sessionStorage.getItem('adminUnlocked') === '1';
}
function setUnlocked(v){ sessionStorage.setItem('adminUnlocked', v ? '1' : '0'); }

export function initAdmin(env){
  // env: { state, onAfterChange() } – onAfterChange soll UI/Save refreshen
  const { state, onAfterChange } = env;

  // Create toggle (immer da, aber unsichtbar bis unlock)
  const toggleBtn = document.createElement('button');
  toggleBtn.id = 'adminToggle';
  toggleBtn.textContent = '🛠️';
  toggleBtn.title = 'Admin/Debug (Ctrl+Shift+D)';
  toggleBtn.style.cssText = `
    position: fixed; right: 16px; bottom: 16px; z-index: 9998;
    width: 42px; height: 42px; border-radius: 50%;
    border: 2px solid #2a2d36; background:#ffd369; color:#111; font-weight:900; cursor:pointer;
    box-shadow: 0 6px 18px rgba(0,0,0,0.5); display:none;
  `;
  document.body.appendChild(toggleBtn);

  // Panel
  const panel = document.createElement('div');
  panel.id = 'adminPanel';
  panel.style.cssText = `
    position: fixed; right: 16px; bottom: 16px; z-index: 9999;
    width: 320px; max-width: 90vw; background: #0f1220; color: #eaeaf0;
    border: 2px solid #2a2d36; border-radius: 12px; box-shadow: 0 6px 18px rgba(0,0,0,0.6);
    display:none; font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
  `;
  panel.innerHTML = `
    <div style="display:flex; align-items:center; justify-content:space-between; padding:10px 12px; border-bottom:1px solid #2a2d36;">
      <strong>🛠️ Admin / Debug</strong>
      <div>
        <button id="adminMin" title="Minimieren" style="background:none;border:none;color:#9ca3af;cursor:pointer;font-size:16px;">—</button>
        <button id="adminClose" title="Schließen" style="background:none;border:none;color:#ff6b6b;cursor:pointer;font-size:16px;">✕</button>
      </div>
    </div>
    <div id="adminBody" style="padding:12px; display:grid; gap:10px;">
      <div style="font-size:12px; color:#9ca3af;">
        Era: <span id="adminEra">-</span> • Global x<span id="adminGM">1</span> • Evolutions: <span id="adminEvos">0</span>
      </div>

      <fieldset style="border:1px solid #2a2d36; border-radius:8px; padding:10px;">
        <legend style="padding:0 6px; color:#ffd369;">Stein hinzufügen</legend>
        <div style="display:grid; grid-template-columns: 1fr auto; gap:8px; align-items:center;">
          <input id="adminAddInput" type="number" min="0" step="1" value="1000" style="width:100%; padding:8px; border-radius:8px; border:1px solid #2a2d36; background:#121528; color:#eaeaf0;">
          <button id="adminAddBtn" style="padding:8px 10px; border-radius:8px; border:none; background:#ffd369; color:#111; font-weight:700; cursor:pointer;">+ Stein</button>
        </div>
        <div style="display:flex; gap:8px; margin-top:8px;">
          <button data-quick="10000"  class="adminQuick">+10K</button>
          <button data-quick="1000000" class="adminQuick">+1M</button>
          <button data-quick="1000000000" class="adminQuick">+1B</button>
        </div>
      </fieldset>

      <fieldset style="border:1px solid #2a2d36; border-radius:8px; padding:10px;">
        <legend style="padding:0 6px; color:#ffd369;">Meta</legend>
        <div style="display:grid; gap:8px;">
          <div style="display:grid; grid-template-columns: 1fr auto; gap:8px; align-items:center;">
            <input id="adminGMInput" type="number" min="0.1" step="0.1" value="1" style="width:100%; padding:8px; border-radius:8px; border:1px solid #2a2d36; background:#121528; color:#eaeaf0;">
            <button id="adminGMSet" style="padding:8px 10px; border-radius:8px; border:none; background:#ffd369; color:#111; font-weight:700; cursor:pointer;">Set Global Mult</button>
          </div>
          <button id="adminEvolve" style="padding:8px 10px; border-radius:8px; border:none; background:#7bd389; color:#111; font-weight:700; cursor:pointer;">Force Weiterentwickeln</button>
        </div>
      </fieldset>
    </div>
  `;
  document.body.appendChild(panel);

  // Style Quick buttons
  panel.querySelectorAll('.adminQuick').forEach(btn => {
    btn.style.cssText = `padding:8px 10px; border-radius:8px; border:none; background:#23273a; color:#eaeaf0; cursor:pointer;`;
  });

  // Helpers
  const $ = sel => panel.querySelector(sel);
  function adminStateSync(){
    $('#adminEra').textContent = state.era;
    $('#adminGM').textContent = (state.bonus?.globalMult ?? 1).toFixed(2);
    $('#adminEvos').textContent = (state.stats?.totalEvolutions ?? 0);
    $('#adminGMInput').value = (state.bonus?.globalMult ?? 1).toFixed(2);
  }
  function openPanel(){ panel.style.display = 'block'; adminStateSync(); }
  function closePanel(){ panel.style.display = 'none'; }
  function togglePanel(){ panel.style.display = (panel.style.display==='none'||!panel.style.display)?'block':'none'; adminStateSync(); }

  // Events
  toggleBtn.addEventListener('click', togglePanel);
  $('#adminClose').addEventListener('click', closePanel);
  $('#adminMin').addEventListener('click', () => {
    const body = $('#adminBody');
    body.style.display = (body.style.display === 'none') ? 'grid' : 'none';
  });

  function toast(msg, isErr=false){
    const t = document.createElement('div');
    t.textContent = msg;
    t.style.cssText = `
      position: fixed; right: 16px; bottom: 72px;
      background: ${isErr ? '#ff6b6b' : '#1f2330'}; color: #fff; padding: 10px 12px; border-radius: 8px;
      border: 1px solid #2a2d36; z-index: 9999; opacity: 0; transform: translateY(10px);
      transition: opacity .15s ease, transform .15s ease;
    `;
    document.body.appendChild(t);
    requestAnimationFrame(()=>{ t.style.opacity='1'; t.style.transform='translateY(0)'; });
    setTimeout(()=>{ t.style.opacity='0'; t.style.transform='translateY(10px)'; setTimeout(()=>t.remove(),200); }, 1400);
  }

  // Core admin actions (nur wenn unlocked)
  function requireUnlocked(){ return isUnlocked(); }

  function addStone(amount){
    if (!requireUnlocked()) return toast('Admin gesperrt', true);
    const a = Number(amount)||0; if (a<=0) return;
    state.resources.stone += a;
    state.stats.runTotalStone += a;
    updateResource(state.resources.stone);
    computeDerivedStats(state);
    onAfterChange?.();
    toast(`+${short(a)} Stein`);
  }

  $('#adminAddBtn').addEventListener('click', () => addStone($('#adminAddInput').value));
  panel.querySelectorAll('.adminQuick').forEach(btn => btn.addEventListener('click', e => addStone(e.currentTarget.dataset.quick)));

  $('#adminGMSet').addEventListener('click', () => {
    if (!requireUnlocked()) return toast('Admin gesperrt', true);
    const val = Number($('#adminGMInput').value); if (!isFinite(val)||val<=0) return;
    state.bonus.globalMult = val;
    computeDerivedStats(state);
    onAfterChange?.();
    adminStateSync();
    toast(`Global Mult x${val.toFixed(2)}`);
  });

  $('#adminEvolve').addEventListener('click', () => {
    if (!requireUnlocked()) return toast('Admin gesperrt', true);
    const backup = state.stats.runTotalStone;
    state.stats.runTotalStone = Number.MAX_SAFE_INTEGER;
    const did = evolveToNextEra(state);
    if (!did){ state.stats.runTotalStone = backup; return toast('Force Evolution fehlgeschlagen', true); }
    computeDerivedStats(state);
    onAfterChange?.();
    adminStateSync();
    toast('Force Evolution ✅');
  });

  // ==== UNLOCK FLOW ====
  async function tryUnlock(){
    if (!canShowEntry()) return alert('Admin ist auf diesem Host deaktiviert.');
    const pass = prompt('Admin-Passphrase:');
    if (!pass) return;
    try{
      const hex = await sha256Hex(pass);
      if (hex === ADMIN_PASS_HASH_HEX.toLowerCase()){
        setUnlocked(true);
        toggleBtn.style.display = 'block';
        // Optional: direkt öffnen
        openPanel();
      } else {
        alert('Falsche Passphrase.');
      }
    } catch(e){ console.error(e); alert('Konnte Hash nicht prüfen.'); }
  }

  // Einblenden erlauben, wenn bereits unlocked ODER Flag vorhanden
  if (isUnlocked() || hasAdminFlag()){
    // Wenn Flag gesetzt, trotzdem Passphrase verlangen (Soft-Lock Stufe 2)
    if (!isUnlocked()) {
      tryUnlock();
    } else {
      toggleBtn.style.display = 'block';
    }
  }

  // Hotkey: Ctrl+Shift+D → Unlock-Dialog
  window.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && (e.key.toLowerCase() === 'd')){
      e.preventDefault();
      if (isUnlocked()) {
        // bereits frei → Panel togglen
        toggleBtn.style.display = 'block';
        togglePanel();
      } else {
        tryUnlock();
      }
    }
  });
}

// number shortener (local copy)
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
