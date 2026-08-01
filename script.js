const canvas = document.querySelector('#ambience');
const ctx = canvas.getContext('2d');
const page = document.body.dataset.page;
const spotlight = document.querySelector('.spotlight');
const toast = document.querySelector('.toast');
const audio = document.querySelector('.site-audio');
let particles = [];
let bursts = [];
let floatNotes = [];
let tunePlaying = true;
let userPausedTune = false;

const backgroundWords = {
  home: ['smile', 'forever', 'joy', 'warmth', 'spark', 'kindness'],
  friendship: ['laugh', 'trust', 'memories', 'besties', 'home', 'together'],
  girlfriend: ['cuteness', 'blush', 'care', 'dream', 'sweet', 'forever']
};

const eggData = {
  friendship: [
    ['⭐', 'Real friends stay even after the conversation ends.'],
    ['🦋', 'Distance changes places, never hearts.'],
    ['🏮', 'Some friendships quietly become home.'],
    ['🌙', "The best friendships don't need perfect words."]
  ],
  girlfriend: [
    ['🌙', "You are someone's favourite chapter."],
    ['🌹', 'Love grows quietly.'],
    ['✨', "Forever begins with today's little moments."],
    ['🦋', 'Home is wherever your heart feels safe.']
  ]
};

function resize() {
  canvas.width = innerWidth * devicePixelRatio;
  canvas.height = innerHeight * devicePixelRatio;
  ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
}
resize();
addEventListener('resize', resize);

function seed() {
  particles = Array.from({ length: page === 'home' ? 90 : 70 }, () => ({
    x: Math.random() * innerWidth,
    y: Math.random() * innerHeight,
    vx: (Math.random() - 0.5) * 0.35,
    vy: (Math.random() - 0.5) * 0.35,
    size: 1 + Math.random() * 2.7,
    phase: Math.random() * Math.PI * 2
  }));
  const words = backgroundWords[page] || backgroundWords.home;
  floatNotes = Array.from({ length: 16 }, () => ({
    text: words[Math.floor(Math.random() * words.length)],
    x: Math.random() * innerWidth,
    y: Math.random() * innerHeight,
    speed: 0.18 + Math.random() * 0.28,
    size: 14 + Math.random() * 16,
    alpha: 0.1 + Math.random() * 0.08
  }));
}
seed();
requestAnimationFrame(draw);

function draw() {
  ctx.clearRect(0, 0, innerWidth, innerHeight);
  drawParticles();
  drawFloatingNotes();
  drawBursts();
  requestAnimationFrame(draw);
}

function drawParticles() {
  for (const p of particles) {
    p.x += p.vx;
    p.y += page === 'girlfriend' ? p.vy + 0.45 : p.vy;
    p.phase += 0.03;
    if (p.x < -20) p.x = innerWidth + 20;
    if (p.x > innerWidth + 20) p.x = -20;
    if (p.y < -20) p.y = innerHeight + 20;
    if (p.y > innerHeight + 20) p.y = -20;
    ctx.save();
    ctx.globalAlpha = page === 'home' ? 0.62 : 0.48;
    ctx.fillStyle = page === 'friendship' ? '#ffd36e' : page === 'girlfriend' ? '#ff8bc6' : '#9df5ff';
    ctx.shadowColor = ctx.fillStyle;
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.arc(p.x + Math.sin(p.phase) * 5, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function drawFloatingNotes() {
  const tint = page === 'friendship' ? '255, 211, 110' : page === 'girlfriend' ? '255, 139, 198' : '157, 245, 255';
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (const note of floatNotes) {
    note.y -= note.speed;
    if (note.y < -40) {
      note.y = innerHeight + 40;
      note.x = Math.random() * innerWidth;
    }
    ctx.globalAlpha = note.alpha;
    ctx.fillStyle = `rgba(${tint}, 1)`;
    ctx.font = `800 ${note.size}px Manrope, sans-serif`;
    ctx.fillText(note.text, note.x, note.y);
  }
  ctx.restore();
}

function addBurst(mode) {
  const colors = mode === 'girlfriend' ? ['#ff8bc6', '#fff', '#ffd5e9'] : ['#ffd36e', '#9df5ff', '#fff'];
  const shapes = mode === 'girlfriend' ? ['heart', 'petal', 'circle'] : ['star', 'circle', 'band'];
  [0.36, 0.5, 0.64].forEach((xRatio, group) => {
    setTimeout(() => {
      const x = innerWidth * xRatio;
      const y = innerHeight * (0.24 + Math.random() * 0.16);
      for (let i = 0; i < 70; i++) {
        const angle = Math.PI * 2 * i / 70;
        const speed = 2 + Math.random() * 4.6;
        bursts.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, age: 0, life: 65 + Math.random() * 35, color: colors[i % colors.length], shape: shapes[i % shapes.length], size: 2 + Math.random() * 3.8 });
      }
    }, group * 180);
  });
}

function drawBursts() {
  bursts = bursts.filter(b => b.age < b.life);
  for (const b of bursts) {
    b.age++;
    b.x += b.vx;
    b.y += b.vy;
    b.vy += 0.035;
    const alpha = 1 - b.age / b.life;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(b.x, b.y);
    ctx.rotate(b.age * 0.08);
    ctx.fillStyle = b.color;
    ctx.strokeStyle = b.color;
    ctx.shadowColor = b.color;
    ctx.shadowBlur = 18;
    if (b.shape === 'heart') drawHeart(b.size);
    else if (b.shape === 'star') drawStar(b.size);
    else if (b.shape === 'petal') { ctx.scale(0.8, 1.45); ctx.beginPath(); ctx.ellipse(0, 0, b.size, b.size * 1.8, 0, 0, Math.PI * 2); ctx.fill(); }
    else if (b.shape === 'band') { ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(0, 0, b.size * 2.2, b.size, 0, 0, Math.PI * 2); ctx.stroke(); }
    else { ctx.beginPath(); ctx.arc(0, 0, b.size, 0, Math.PI * 2); ctx.fill(); }
    ctx.restore();
  }
}

function drawHeart(size) {
  ctx.beginPath();
  ctx.moveTo(0, size);
  ctx.bezierCurveTo(-size * 2, -size, -size, -size * 2.2, 0, -size * 0.7);
  ctx.bezierCurveTo(size, -size * 2.2, size * 2, -size, 0, size);
  ctx.fill();
}
function drawStar(size) {
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const a = i * Math.PI * 0.4;
    ctx.lineTo(Math.cos(a) * size * 2.2, Math.sin(a) * size * 2.2);
    ctx.lineTo(Math.cos(a + 0.22) * size, Math.sin(a + 0.22) * size);
  }
  ctx.closePath();
  ctx.fill();
}

document.addEventListener('pointermove', event => {
  spotlight.style.setProperty('--mx', `${event.clientX}px`);
  spotlight.style.setProperty('--my', `${event.clientY}px`);
});

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('visible'); });
}, { threshold: 0.16 });
document.querySelectorAll('.reveal').forEach(node => revealObserver.observe(node));

document.querySelector('.theme-toggle')?.addEventListener('click', event => {
  const next = document.body.dataset.theme === 'night' ? 'day' : 'night';
  document.body.dataset.theme = next;
  event.currentTarget.textContent = next === 'night' ? '☀️ Day' : '🌙 Night';
});

document.querySelectorAll('.wish-button').forEach(button => {
  button.addEventListener('click', () => {
    const mode = button.dataset.burst;
    addBurst(mode);
    showToast(mode === 'girlfriend' ? 'A love wish is blooming.' : 'A friendship wish is sparkling.');
  });
});

document.querySelector('.envelope')?.addEventListener('click', () => {
  const letter = document.querySelector('.letter-text');
  letter.hidden = !letter.hidden;
});

function buildEggs() {
  const zone = document.querySelector('.egg-zone');
  if (!zone) return;
  const kind = zone.dataset.kind;
  const found = new Set();
  const container = zone.querySelector('.eggs');
  eggData[kind].forEach(([icon, quote], index) => {
    const button = document.createElement('button');
    button.className = 'egg';
    button.type = 'button';
    button.textContent = icon;
    button.addEventListener('click', () => {
      found.add(index);
      button.classList.add('found');
      showToast(quote);
      if (found.size === eggData[kind].length) zone.querySelector('.unlock-message').hidden = false;
    });
    container.appendChild(button);
  });
}
buildEggs();

function setMusicButton() {
  const button = document.querySelector('.music-control');
  if (!button || !audio) return;
  tunePlaying = !audio.paused;
  button.textContent = tunePlaying ? '⏸ Pause tune' : '▶ Play tune';
  button.setAttribute('aria-pressed', String(tunePlaying));
}
async function tryPlayAudio() {
  if (!audio || userPausedTune) return;
  try {
    await audio.play();
  } catch {
    tunePlaying = false;
  }
  setMusicButton();
}
addEventListener('load', () => setTimeout(tryPlayAudio, 500));
document.addEventListener('click', () => {
  if (!userPausedTune && audio?.paused) tryPlayAudio();
}, { once: true });
audio?.addEventListener('play', setMusicButton);
audio?.addEventListener('pause', setMusicButton);
document.querySelector('.music-control')?.addEventListener('click', async () => {
  if (!audio) return;
  if (audio.paused) {
    userPausedTune = false;
    await tryPlayAudio();
  } else {
    userPausedTune = true;
    audio.pause();
    setMusicButton();
  }
});

function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('show'), 3200);
}
