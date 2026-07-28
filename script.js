const orb = document.querySelector('.cursor-orb');
let audioCtx, melodyTimer, playing = false;
let tiltFrame = 0;
const moods = {
  friendship: { notes: [392, 494, 587, 659, 587, 494], symbols: ['🎁','⭐','🪁','☕','🌍','🤝'], lines: [
    'You found loyalty: the quiet promise of “I am here.”',
    'Secret wish: may your group chats never run out of laughter.',
    'Hidden quote: real friends turn distance into just another small detail.',
    'Tiny blessing: may every reunion feel like sunlight after rain.',
    'Friendship badge unlocked: memories are better when shared.'
  ] },
  girlfriend: { notes: [523, 659, 784, 880, 784, 659], symbols: ['💖','🌹','✨','💌','🌙','🦋'], lines: [
    'Secret note: you are loved in details, not just grand gestures.',
    'Hidden wish: may her day feel soft, safe, and beautifully special.',
    'Tiny quote: love is choosing kindness again and again.',
    'Rose unlocked: your smile is someone’s favorite notification.',
    'Sparkle found: may affection always feel respectful and real.'
  ] }
};

document.addEventListener('pointermove', (event) => {
  if (!orb) return;
  orb.style.transform = `translate3d(${event.clientX - 7}px, ${event.clientY - 7}px, 0)`;
  if (tiltFrame) return;
  tiltFrame = requestAnimationFrame(() => {
    document.querySelectorAll('.tilt-card').forEach(card => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - .5;
      const y = (event.clientY - rect.top) / rect.height - .5;
      card.style.transform = `rotateY(${x * 5}deg) rotateX(${-y * 5}deg)`;
    });
    tiltFrame = 0;
  });
});

document.querySelectorAll('.portal, .wish-button').forEach(item => {
  item.addEventListener('pointerenter', () => sparkle(item.getBoundingClientRect()));
});

function ensureAudio() {
  audioCtx ||= new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
}
function startMusic() {
  ensureAudio();
  const mood = document.body.dataset.mood || 'friendship';
  const notes = moods[mood].notes;
  let i = 0;
  stopMusic(false);
  playing = true;
  melodyTimer = setInterval(() => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine'; osc.frequency.value = notes[i++ % notes.length];
    gain.gain.setValueAtTime(.0001, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(.08, audioCtx.currentTime + .03);
    gain.gain.exponentialRampToValueAtTime(.0001, audioCtx.currentTime + .48);
    osc.connect(gain).connect(audioCtx.destination); osc.start(); osc.stop(audioCtx.currentTime + .5);
  }, 560);
  updateMusicButton();
}
function stopMusic(update = true) { clearInterval(melodyTimer); playing = false; if (update) updateMusicButton(); }
function updateMusicButton() { const b = document.querySelector('.music-toggle'); if (b) b.textContent = playing ? '⏸ Pause music' : '▶ Play music'; }

document.querySelector('.music-toggle')?.addEventListener('click', () => playing ? stopMusic() : startMusic());
document.addEventListener('click', () => { if (!playing && document.body.dataset.mood) startMusic(); }, { once: true });
window.addEventListener('load', createSecrets);

document.querySelector('.wish-button')?.addEventListener('click', () => {
  const mood = document.body.dataset.mood;
  toast(moods[mood].lines[Math.floor(Math.random() * moods[mood].lines.length)]);
  for (let i = 0; i < 7; i++) setTimeout(() => sparkle({ left: innerWidth/2, top: innerHeight/2, width: 0, height: 0 }), i * 55);
});

function createSecrets() {
  const mood = document.body.dataset.mood;
  if (!mood) return;
  const pack = moods[mood];
  for (let i = 0; i < 8; i++) {
    const secret = document.createElement('button');
    secret.className = 'secret'; secret.type = 'button'; secret.textContent = pack.symbols[i % pack.symbols.length];
    secret.style.left = `${8 + Math.random() * 78}vw`; secret.style.top = `${16 + Math.random() * 68}vh`; secret.style.animationDelay = `${-Math.random() * 5}s`;
    secret.addEventListener('click', () => { secret.classList.add('revealed'); secret.textContent = pack.lines[i % pack.lines.length]; toast('Easter egg found!'); });
    document.body.appendChild(secret);
  }
}
function sparkle(rect) {
  const dot = document.createElement('span');
  dot.className = 'secret'; dot.textContent = '✦'; dot.style.pointerEvents = 'none'; dot.style.left = `${rect.left + rect.width/2 + (Math.random() - .5) * 160}px`; dot.style.top = `${rect.top + rect.height/2 + (Math.random() - .5) * 120}px`; dot.style.width = '24px'; dot.style.height = '24px';
  document.body.appendChild(dot); setTimeout(() => dot.remove(), 1000);
}
function toast(message) {
  const t = document.createElement('div'); t.className = 'toast'; t.textContent = message; document.body.appendChild(t); setTimeout(() => t.remove(), 3000);
}
