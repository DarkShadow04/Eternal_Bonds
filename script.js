const canvas = document.querySelector('#world');
const ctx = canvas.getContext('2d');
const mouseLight = document.querySelector('.mouse-light');
const toast = document.querySelector('.toast');
const scenes = [...document.querySelectorAll('.scene')];
let particles = [];
let bursts = [];
let currentScene = 'galaxy';
let audioCtx;
let musicTimer;
let playing = false;
let volume = Number(document.querySelector('.volume')?.value || 0.08);

const scores = {
  ambient: [261.63, 329.63, 392, 493.88, 440, 392],
  friendship: [293.66, 369.99, 440, 554.37, 493.88, 440],
  girlfriend: [220, 277.18, 329.63, 392, 369.99, 329.63]
};

const eggs = {
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

function seedParticles() {
  particles = Array.from({ length: 120 }, () => ({
    x: Math.random() * innerWidth,
    y: Math.random() * innerHeight,
    vx: (Math.random() - 0.5) * 0.35,
    vy: (Math.random() - 0.5) * 0.35,
    size: 0.8 + Math.random() * 2.8,
    hue: Math.random() * 360,
    phase: Math.random() * Math.PI * 2
  }));
}
seedParticles();

function animate() {
  ctx.clearRect(0, 0, innerWidth, innerHeight);
  drawAmbient();
  drawBursts();
  requestAnimationFrame(animate);
}
animate();

function drawAmbient() {
  for (const p of particles) {
    p.x += p.vx;
    p.y += currentScene === 'girlfriend' ? p.vy + 0.65 : p.vy;
    p.phase += 0.03;
    if (p.x < -20) p.x = innerWidth + 20;
    if (p.x > innerWidth + 20) p.x = -20;
    if (p.y < -20) p.y = innerHeight + 20;
    if (p.y > innerHeight + 20) p.y = -20;

    ctx.save();
    ctx.globalAlpha = currentScene === 'galaxy' ? 0.7 : 0.5;
    if (currentScene === 'friendship') {
      ctx.fillStyle = `hsla(${38 + p.hue % 40}, 100%, 68%, .85)`;
      ctx.shadowColor = '#ffd36e';
    } else if (currentScene === 'girlfriend') {
      ctx.fillStyle = `hsla(${330 + p.hue % 40}, 100%, 76%, .85)`;
      ctx.shadowColor = '#ff7abf';
    } else {
      ctx.fillStyle = `hsla(${190 + p.hue % 80}, 100%, 76%, .85)`;
      ctx.shadowColor = '#72f6ff';
    }
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.arc(p.x + Math.sin(p.phase) * 6, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function addBurst(x, y, mode) {
  const palette = mode === 'girlfriend' ? ['#ff7abf', '#ffd1e8', '#ffffff', '#ff3d9a'] : ['#ffd36e', '#72f6ff', '#ffffff', '#9d8cff'];
  const shapes = mode === 'girlfriend' ? ['heart', 'petal', 'circle'] : ['star', 'band', 'circle'];
  for (let i = 0; i < 110; i++) {
    const angle = Math.PI * 2 * i / 110;
    const speed = 2.5 + Math.random() * 5.6;
    bursts.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      age: 0,
      life: 72 + Math.random() * 45,
      color: palette[i % palette.length],
      shape: shapes[i % shapes.length],
      size: 2.5 + Math.random() * 4
    });
  }
}

function drawBursts() {
  bursts = bursts.filter(b => b.age < b.life);
  for (const b of bursts) {
    b.age += 1;
    b.x += b.vx;
    b.y += b.vy;
    b.vy += 0.035;
    const alpha = 1 - b.age / b.life;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(b.x, b.y);
    ctx.rotate(b.age * 0.08);
    ctx.fillStyle = b.color;
    ctx.shadowColor = b.color;
    ctx.shadowBlur = 18;
    drawShape(b);
    ctx.restore();
  }
}

function drawShape(b) {
  if (b.shape === 'heart') {
    ctx.beginPath();
    ctx.moveTo(0, b.size);
    ctx.bezierCurveTo(-b.size * 2, -b.size, -b.size, -b.size * 2.2, 0, -b.size * 0.7);
    ctx.bezierCurveTo(b.size, -b.size * 2.2, b.size * 2, -b.size, 0, b.size);
    ctx.fill();
  } else if (b.shape === 'star') {
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const a = i * Math.PI * 0.4;
      ctx.lineTo(Math.cos(a) * b.size * 2.3, Math.sin(a) * b.size * 2.3);
      ctx.lineTo(Math.cos(a + 0.22) * b.size, Math.sin(a + 0.22) * b.size);
    }
    ctx.closePath();
    ctx.fill();
  } else if (b.shape === 'petal') {
    ctx.scale(0.8, 1.5);
    ctx.beginPath();
    ctx.ellipse(0, 0, b.size, b.size * 1.8, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (b.shape === 'band') {
    ctx.strokeStyle = b.color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, 0, b.size * 2.2, b.size, 0, 0, Math.PI * 2);
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.arc(0, 0, b.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

document.addEventListener('pointermove', event => {
  mouseLight.style.setProperty('--mx', `${event.clientX}px`);
  mouseLight.style.setProperty('--my', `${event.clientY}px`);
  if (Math.random() > 0.72) addTrail(event.clientX, event.clientY);
});

function addTrail(x, y) {
  const dot = document.createElement('span');
  dot.className = 'spark-trail';
  dot.style.cssText = `left:${x}px;top:${y}px;--dx:${(Math.random() - 0.5) * 42}px;--dy:${20 + Math.random() * 36}px`;
  document.body.appendChild(dot);
  setTimeout(() => dot.remove(), 650);
}

const observer = new IntersectionObserver(entries => {
  for (const entry of entries) {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  }
}, { threshold: 0.18 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

const sceneObserver = new IntersectionObserver(entries => {
  const visible = entries.filter(e => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
  if (visible) {
    currentScene = visible.target.dataset.scene;
    if (currentScene === 'friendship') document.querySelector('.music-select').value = 'friendship';
    if (currentScene === 'girlfriend') document.querySelector('.music-select').value = 'girlfriend';
  }
}, { threshold: [0.45, 0.65] });
scenes.forEach(scene => sceneObserver.observe(scene));

function buildEggs() {
  document.querySelectorAll('.egg-zone').forEach(zone => {
    const kind = zone.dataset.kind;
    const container = zone.querySelector('.eggs');
    const found = new Set();
    eggs[kind].forEach(([icon, message], index) => {
      const button = document.createElement('button');
      button.className = 'egg';
      button.type = 'button';
      button.textContent = icon;
      button.addEventListener('click', () => {
        button.classList.add('found');
        found.add(index);
        showToast(message);
        if (found.size === eggs[kind].length) zone.querySelector('.unlock-message').hidden = false;
      });
      container.appendChild(button);
    });
  });
}
buildEggs();

document.querySelector('.moon')?.addEventListener('click', event => showToast(event.currentTarget.dataset.egg));
document.querySelector('.moon')?.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') showToast(event.currentTarget.dataset.egg); });

document.querySelectorAll('.wish-button').forEach(button => {
  button.addEventListener('click', () => {
    const mode = button.dataset.burst === 'girlfriend' ? 'girlfriend' : 'friendship';
    showToast(mode === 'girlfriend' ? 'A love wish is blooming across the sky.' : 'A friendship wish is lighting the sky.');
    addBurst(innerWidth * 0.5, innerHeight * 0.25, mode);
    setTimeout(() => addBurst(innerWidth * 0.35, innerHeight * 0.34, mode), 220);
    setTimeout(() => addBurst(innerWidth * 0.68, innerHeight * 0.3, mode), 420);
  });
});

document.querySelector('.envelope')?.addEventListener('click', event => {
  const letter = document.querySelector('.letter-text');
  const open = letter.hidden;
  letter.hidden = !open;
  event.currentTarget.setAttribute('aria-expanded', String(open));
});

document.querySelector('.theme-toggle').addEventListener('click', event => {
  const next = document.body.dataset.theme === 'night' ? 'day' : 'night';
  document.body.dataset.theme = next;
  event.currentTarget.textContent = next === 'night' ? '☀️ Day' : '🌙 Night';
});

function ensureAudio() {
  audioCtx ||= new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
}
function startMusic() {
  ensureAudio();
  stopMusic(false);
  playing = true;
  document.querySelector('.play-toggle').textContent = '⏸ Pause';
  let i = 0;
  musicTimer = setInterval(() => {
    const mode = document.querySelector('.music-select').value;
    const note = scores[mode][i++ % scores[mode].length];
    tone(note, volume, 0.72, 'sine');
    setTimeout(() => tone(note * 1.5, volume * 0.48, 0.55, 'triangle'), 120);
    setTimeout(() => tone(note * 2, volume * 0.28, 0.42, 'sine'), 260);
    if (mode === 'girlfriend') setTimeout(() => tone(note / 2, volume * 0.16, 0.9, 'sine'), 40);
  }, 760);
}
function stopMusic(update = true) {
  clearInterval(musicTimer);
  playing = false;
  if (update) document.querySelector('.play-toggle').textContent = '▶ Play';
}
function tone(freq, gainValue, duration, type) {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.0001, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, gainValue), audioCtx.currentTime + 0.04);
  gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
  osc.connect(gain).connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + duration + 0.05);
}

document.querySelector('.play-toggle').addEventListener('click', () => playing ? stopMusic() : startMusic());
document.querySelector('.volume').addEventListener('input', event => { volume = Number(event.target.value); });
document.querySelector('.music-select').addEventListener('change', () => { if (playing) startMusic(); });
document.addEventListener('click', () => { if (!playing) startMusic(); }, { once: true });

document.querySelector('.fullscreen').addEventListener('click', () => {
  if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
  else document.exitFullscreen?.();
});
document.querySelector('.share').addEventListener('click', async () => {
  const data = { title: 'Eternal Bonds', text: 'A cinematic Friendship and Girlfriend Day greeting experience.', url: location.href };
  if (navigator.share) await navigator.share(data);
  else {
    await navigator.clipboard?.writeText(location.href);
    showToast('Link copied to clipboard.');
  }
});

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('show'), 3600);
}
