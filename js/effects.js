// effects.js – DOM-Effekte (Particles, Confetti, Shake, Parallax)

export const FX = {
  enabled: true,
  setEnabled(on){ this.enabled = !!on; },
};

export function particleBurst(x, y, count = 14){
  if (!FX.enabled) return;
  const colors = ['#ffd369','#7bd389','#60a5fa','#f472b6','#fca5a5'];
  for (let i=0;i<count;i++){
    const p = document.createElement('div');
    p.className = 'confetti ' + (i%4===1?'c2':i%4===2?'c3':i%4===3?'c4':'');
    p.style.left = x + 'px';
    p.style.top = y + 'px';
    p.style.width = (6 + Math.random()*6) + 'px';
    p.style.height = (10 + Math.random()*12) + 'px';
    p.style.background = colors[i % colors.length];
    p.style.transition = 'transform 1.1s';
    p.style.transform = `translate(${(Math.random()*2-1)*60}px, ${(Math.random()*-1)*30}px) rotate(${Math.random()*120}deg)`;
    document.body.appendChild(p);
    // trigger drop anim asynchronously
    requestAnimationFrame(() => {
      p.style.animationDelay = (Math.random()*0.2)+'s';
      p.style.transform = ''; // let keyframes take over
    });
    p.addEventListener('animationend', () => p.remove());
  }
}

export function confettiRain(centerX = window.innerWidth/2){
  if (!FX.enabled) return;
  const n = 60;
  for (let i=0;i<n;i++){
    const x = centerX + (Math.random()*2-1) * (window.innerWidth*0.35);
    const y = -20 - Math.random()*200;
    const p = document.createElement('div');
    p.className = 'confetti ' + (i%4===1?'c2':i%4===2?'c3':i%4===3?'c4':'');
    p.style.left = x + 'px';
    p.style.top = y + 'px';
    p.style.animationDuration = (0.9 + Math.random()*0.6) + 's';
    document.body.appendChild(p);
    p.addEventListener('animationend', () => p.remove());
  }
}

export function screenShake(){
  if (!FX.enabled) return;
  document.body.classList.add('shake');
  setTimeout(()=>document.body.classList.remove('shake'), 350);
}

// Subtle Parallax by mouse
let parallaxBound = false;
export function enableParallax(){
  if (parallaxBound) return;
  parallaxBound = true;
  const bg = document.querySelector('.bg-parallax');
  if (!bg) return;
  window.addEventListener('mousemove', (e)=>{
    const dx = (e.clientX / window.innerWidth - 0.5) * 8;
    const dy = (e.clientY / window.innerHeight - 0.5) * 8;
    bg.style.transform = `translate(${dx}px, ${dy}px)`;
  });
}
