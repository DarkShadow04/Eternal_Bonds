const canvas = document.querySelector('.fx-canvas');
const ctx = canvas?.getContext('2d');
let audioCtx, melodyTimer, playing = false;
let bursts = [];
let tiltFrame = 0;
let particleFrame = 0;
const moods = {
  friendship: {
    notes: [392, 440, 523, 587, 659, 587, 523, 440],
    symbols: ['🎁','⭐','🪁','☕','🌍','🤝'],
    lines: [
      'You found loyalty: the quiet promise of “I am here.”',
      'Secret wish: may your group chats never run out of laughter.',
      'Hidden quote: real friends turn distance into just another small detail.',
      'Tiny blessing: may every reunion feel like sunlight after rain.',
      'Friendship badge unlocked: memories are better when shared.',
      'Real friends make heavy days easier to carry.',
      'May your circle always feel honest, safe, and joyful.'
    ],
    quotes: [
      ['🌍', 'Friendship is the language that turns different worlds into one warm home.'],
      ['🪁', 'May your friends be the wind behind your courage and the laughter inside ordinary days.'],
      ['☕', 'Good friends make small moments feel like stories you will tell forever.'],
      ['🧭', 'A true friend helps you remember who you are when life feels noisy.'],
      ['🌈', 'Friendship is happiness multiplied by sharing and sadness divided by care.']
    ]
  },
  girlfriend: {
    notes: [330, 392, 494, 523, 659, 587, 494, 392],
    symbols: ['💖','🌹','✨','💌','🌙','🦋'],
    lines: [
      'Secret note: you are loved in details, not just grand gestures.',
      'Hidden wish: may her day feel soft, safe, and beautifully special.',
      'Tiny quote: love is choosing kindness again and again.',
      'Rose unlocked: your smile is someone’s favorite notification.',
      'Sparkle found: may affection always feel respectful and real.',
      'May every promise feel gentle, steady, and true.',
      'You deserve love that feels peaceful, proud, and present.'
    ],
    quotes: [
      ['💌', 'May today remind you how deeply you are cherished, admired, respected, and loved.'],
      ['🌙', 'With you, even silence feels like music and every ordinary road becomes a memory lane.'],
      ['🌹', 'Happy Girlfriend Day to the heart that makes my life kinder, brighter, and beautifully real.'],
      ['✨', 'Love feels magical when it is patient, playful, loyal, and honest.'],
      ['🦋', 'You bring softness to my days and courage to my tomorrows.']
    ]
  }
};

document.addEventListener('pointermove', (event) => {
  drawAsteroidTrail(event.clientX, event.clientY);
  if (!tiltFrame) {
    tiltFrame = requestAnimationFrame(() => {
      document.querySelectorAll('.tilt-card').forEach(card => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - .5;
        const y = (event.clientY - rect.top) / rect.height - .5;
        card.style.transform = `rotateY(${x * 4}deg) rotateX(${-y * 4}deg)`;
      });
      tiltFrame = 0;
    });
  }
});

function drawAsteroidTrail(x, y) {
  if (particleFrame) return;
  particleFrame = requestAnimationFrame(() => {
    const particle = document.createElement('span');
    particle.className = 'asteroid-particle';
    particle.style.left = `${x + (Math.random() - .5) * 10}px`;
    particle.style.top = `${y + (Math.random() - .5) * 10}px`;
    particle.style.setProperty('--dx', `${(Math.random() - .5) * 44}px`);
    particle.style.setProperty('--dy', `${18 + Math.random() * 34}px`);
    document.body.appendChild(particle);
    setTimeout(() => particle.remove(), 700);
    particleFrame = 0;
  });
}

document.querySelectorAll('.portal, .wish-button').forEach(item => {
  item.addEventListener('pointerenter', () => sparkle(item.getBoundingClientRect()));
});

function resizeCanvas() {
  if (!canvas) return;
  canvas.width = innerWidth * devicePixelRatio;
  canvas.height = innerHeight * devicePixelRatio;
  ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
}
resizeCanvas();
addEventListener('resize', resizeCanvas);

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
    const root = notes[i++ % notes.length];
    playTone(root, .05, .48, 'sine');
    setTimeout(() => playTone(root * 1.5, .025, .34, 'triangle'), 90);
    setTimeout(() => playTone(root * 2, .018, .28, 'sine'), 180);
  }, 620);
  updateMusicButton();
}
function playTone(freq, volume, length, type) {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type; osc.frequency.value = freq;
  gain.gain.setValueAtTime(.0001, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(volume, audioCtx.currentTime + .035);
  gain.gain.exponentialRampToValueAtTime(.0001, audioCtx.currentTime + length);
  osc.connect(gain).connect(audioCtx.destination); osc.start(); osc.stop(audioCtx.currentTime + length + .03);
}
function stopMusic(update = true) { clearInterval(melodyTimer); playing = false; if (update) updateMusicButton(); }
function updateMusicButton() { const b = document.querySelector('.music-toggle'); if (b) b.textContent = playing ? '⏸ Pause music' : '▶ Play music'; }

document.querySelector('.music-toggle')?.addEventListener('click', () => playing ? stopMusic() : startMusic());
document.addEventListener('click', () => { if (!playing && document.body.dataset.mood) startMusic(); }, { once: true });
window.addEventListener('load', () => { randomizeQuotes(); createSecrets(); });

document.querySelector('.wish-button')?.addEventListener('click', () => {
  const mood = document.body.dataset.mood;
  showFadingQuote(randomLine(moods[mood].lines));
  launchCelebration(document.querySelector('.wish-button')?.dataset.effect || mood);
});

function randomizeQuotes() {
  const mood = document.body.dataset.mood;
  if (!mood) return;
  const cards = [...document.querySelectorAll('.quote-card')];
  const selected = [...moods[mood].quotes].sort(() => Math.random() - .5).slice(0, cards.length);
  cards.forEach((card, index) => {
    const [icon, quote] = selected[index];
    card.innerHTML = `<span>${icon}</span><p>${quote}</p>`;
  });
}
function createSecrets() {
  const mood = document.body.dataset.mood;
  const field = document.querySelector('.secret-field');
  if (!mood || !field) return;
  const pack = moods[mood];
  field.innerHTML = '';
  for (let i = 0; i < 8; i++) {
    const secret = document.createElement('button');
    secret.className = 'secret'; secret.type = 'button'; secret.textContent = pack.symbols[i % pack.symbols.length];
    secret.addEventListener('click', () => showFadingQuote(randomLine(pack.lines)));
    field.appendChild(secret);
  }
}
function showFadingQuote(message) {
  const field = document.querySelector('.secret-field');
  const note = document.createElement('div');
  note.className = 'fading-quote';
  note.textContent = message;
  (field || document.body).appendChild(note);
  setTimeout(() => note.remove(), 3600);
}
function randomLine(lines) { return lines[Math.floor(Math.random() * lines.length)]; }
function sparkle(rect) {
  const dot = document.createElement('span');
  dot.className = 'sparkle'; dot.textContent = '✦'; dot.style.left = `${rect.left + rect.width/2 + (Math.random() - .5) * 120}px`; dot.style.top = `${rect.top + rect.height/2 + (Math.random() - .5) * 90}px`;
  document.body.appendChild(dot); setTimeout(() => dot.remove(), 900);
}
function launchCelebration(effect) {
  if (!ctx) return;
  if (effect === 'bloom') {
    addFirework(innerWidth * .5, innerHeight * .28, ['#ff7bb8', '#ffd1e6', '#ffffff'], 'petal');
    setTimeout(() => addFirework(innerWidth * .68, innerHeight * .23, ['#ffc6dd', '#ff5da7', '#fff'], 'heart'), 260);
    return;
  }
  addFirework(innerWidth * .46, innerHeight * .25, ['#62e8ff', '#e9c46a', '#ffffff'], 'star');
  setTimeout(() => addFirework(innerWidth * .63, innerHeight * .22, ['#8f7cff', '#62e8ff', '#fff'], 'diamond'), 250);
  setTimeout(() => addFirework(innerWidth * .36, innerHeight * .34, ['#e9c46a', '#ffffff', '#62e8ff'], 'circle'), 420);
}
function addFirework(x, y, colors, shape) {
  for (let i = 0; i < 86; i++) {
    const angle = Math.PI * 2 * (i / 86);
    const speed = 2.2 + Math.random() * 4.2;
    bursts.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: 70 + Math.random() * 30, age: 0, color: colors[i % colors.length], shape, size: 2 + Math.random() * 3 });
  }
  animateBursts();
}
let animatingBursts = false;
function animateBursts() {
  if (animatingBursts || !ctx) return;
  animatingBursts = true;
  const frame = () => {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    bursts = bursts.filter(p => p.age < p.life);
    for (const p of bursts) {
      p.age++; p.x += p.vx; p.y += p.vy; p.vy += 0.035;
      const alpha = Math.max(0, 1 - p.age / p.life);
      ctx.globalAlpha = alpha; ctx.fillStyle = p.color; ctx.shadowColor = p.color; ctx.shadowBlur = 16;
      drawShape(p);
    }
    ctx.globalAlpha = 1; ctx.shadowBlur = 0;
    if (bursts.length) requestAnimationFrame(frame); else animatingBursts = false;
  };
  requestAnimationFrame(frame);
}
function drawShape(p) {
  ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.age * .08);
  if (p.shape === 'petal') { ctx.scale(1, 1.45); }
  if (p.shape === 'diamond') { ctx.rotate(Math.PI / 4); ctx.fillRect(-p.size, -p.size, p.size * 2, p.size * 2); }
  else if (p.shape === 'star') { ctx.beginPath(); for (let i = 0; i < 5; i++) { const a = i * Math.PI * .4; ctx.lineTo(Math.cos(a) * p.size * 2.2, Math.sin(a) * p.size * 2.2); ctx.lineTo(Math.cos(a + .22) * p.size, Math.sin(a + .22) * p.size); } ctx.closePath(); ctx.fill(); }
  else if (p.shape === 'heart') { ctx.beginPath(); ctx.moveTo(0, p.size); ctx.bezierCurveTo(-p.size*2, -p.size, -p.size, -p.size*2.2, 0, -p.size*.7); ctx.bezierCurveTo(p.size, -p.size*2.2, p.size*2, -p.size, 0, p.size); ctx.fill(); }
  else { ctx.beginPath(); ctx.arc(0, 0, p.size, 0, Math.PI * 2); ctx.fill(); }
  ctx.restore();
}
