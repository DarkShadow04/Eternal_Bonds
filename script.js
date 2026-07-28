const orb = document.querySelector('.cursor-orb');
let audioCtx, melodyTimer, playing = false;
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
    gain.gain.exponentialRampToValueAtTime(.06, audioCtx.currentTime + .03);
    gain.gain.exponentialRampToValueAtTime(.0001, audioCtx.currentTime + .42);
    osc.connect(gain).connect(audioCtx.destination); osc.start(); osc.stop(audioCtx.currentTime + .45);
  }, 620);
  updateMusicButton();
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
  if (effect === 'bloom') {
    firework(innerWidth * .5, innerHeight * .28, ['#ff7bb8', '#ffd1e6', '#ffffff']);
    setTimeout(() => flowerBloom(innerWidth * .5, innerHeight * .42), 240);
    setTimeout(() => firework(innerWidth * .68, innerHeight * .22, ['#ffc6dd', '#ff5da7', '#fff']), 420);
    return;
  }
  firework(innerWidth * .46, innerHeight * .25, ['#62e8ff', '#e9c46a', '#ffffff']);
  setTimeout(() => firework(innerWidth * .62, innerHeight * .2, ['#8f7cff', '#62e8ff', '#fff']), 260);
  setTimeout(() => firework(innerWidth * .36, innerHeight * .34, ['#e9c46a', '#ffffff', '#62e8ff']), 430);
}
function firework(cx, cy, colors) {
  const layer = document.querySelector('.sky-effects') || document.body;
  for (let i = 0; i < 34; i++) {
    const spark = document.createElement('span');
    const angle = (Math.PI * 2 * i) / 34;
    const distance = 70 + Math.random() * 120;
    spark.className = 'spark';
    spark.style.left = `${cx}px`; spark.style.top = `${cy}px`;
    spark.style.setProperty('--x', `${Math.cos(angle) * distance}px`);
    spark.style.setProperty('--y', `${Math.sin(angle) * distance}px`);
    spark.style.setProperty('--spark', colors[i % colors.length]);
    layer.appendChild(spark); setTimeout(() => spark.remove(), 1000);
  }
}
function flowerBloom(cx, cy) {
  const layer = document.querySelector('.sky-effects') || document.body;
  for (let i = 0; i < 28; i++) {
    const petal = document.createElement('span');
    const angle = (Math.PI * 2 * i) / 28;
    const distance = 42 + Math.random() * 112;
    petal.className = 'petal';
    petal.style.left = `${cx}px`; petal.style.top = `${cy}px`;
    petal.style.setProperty('--x', `${Math.cos(angle) * distance}px`);
    petal.style.setProperty('--y', `${Math.sin(angle) * distance}px`);
    petal.style.setProperty('--r', `${angle * 180 / Math.PI + 180}deg`);
    layer.appendChild(petal); setTimeout(() => petal.remove(), 1700);
  }
}
