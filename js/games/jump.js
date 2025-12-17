import { audio } from '../audio.js';
import { addScore } from '../score.js';
import { confettiBurst } from '../ui.js';

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

export function initJumpGame(root) {
  root.innerHTML = `
    <div class="row" style="justify-content:space-between; align-items:flex-end">
      <div>
        <h2 style="margin:0">🏃 Sakrash</h2>
        <p class="lead" style="margin:6px 0 0">To‘siqlardan sakrang. Space / Tap.</p>
      </div>
      <button class="btn" id="jumpRestart" type="button">Boshlash / Qayta boshlash ▶️</button>
    </div>

    <div class="row" style="margin-top:12px">
      <div class="kpi" aria-live="polite"><span>📏</span><b id="jumpScore">0</b></div>
      <div class="kpi" aria-live="polite"><span>⚡</span><b id="jumpSpeed">1.0x</b></div>
      <div class="badge" id="jumpHint" aria-live="polite">Sakrash uchun Space yoki Tap</div>
    </div>

    <div class="canvas-wrap" style="margin-top:12px">
      <canvas id="jumpCanvas" width="900" height="420" aria-label="Sakrash o‘yini kanvasi"></canvas>
    </div>
  `;

  const canvas = root.querySelector('#jumpCanvas');
  const restartBtn = root.querySelector('#jumpRestart');
  const scoreEl = root.querySelector('#jumpScore');
  const speedEl = root.querySelector('#jumpSpeed');
  const hintEl = root.querySelector('#jumpHint');

  if (!(canvas instanceof HTMLCanvasElement)) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let raf = 0;
  let running = false;

  // World units based on canvas width/height
  const W = canvas.width;
  const H = canvas.height;

  const groundY = H - 72;
  const player = {
    x: 120,
    y: groundY,
    w: 44,
    h: 54,
    vy: 0,
    onGround: true,
  };

  let obstacles = [];
  let speed = 360; // px/sec
  let tPrev = 0;
  let distance = 0;
  let best = 0;

  function reset() {
    obstacles = [];
    player.y = groundY;
    player.vy = 0;
    player.onGround = true;
    speed = 360;
    distance = 0;
    tPrev = 0;
    running = true;
    if (hintEl) hintEl.textContent = "Boshladik! To‘siqlardan sakrang.";
  }

  function jump() {
    if (!running) return;
    if (!player.onGround) return;
    player.vy = -720;
    player.onGround = false;
    audio.playSfx('jump');
  }

  function spawnObstacle() {
    const h = 34 + Math.random() * 40;
    const w = 26 + Math.random() * 26;
    obstacles.push({ x: W + 40, y: groundY + (player.h - h), w, h });
  }

  function rectsOverlap(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Sky gradient
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, 'rgba(123,183,255,.20)');
    g.addColorStop(1, 'rgba(109,242,194,.06)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    // Ground
    ctx.fillStyle = 'rgba(0,0,0,.28)';
    ctx.fillRect(0, groundY + player.h - 10, W, H - groundY);

    // Player (simple rounded rect)
    ctx.fillStyle = 'rgba(109,242,194,.95)';
    roundRect(ctx, player.x, player.y, player.w, player.h, 12);

    // Eyes
    ctx.fillStyle = 'rgba(8,16,28,.9)';
    ctx.beginPath();
    ctx.arc(player.x + 16, player.y + 18, 4, 0, Math.PI * 2);
    ctx.arc(player.x + 30, player.y + 18, 4, 0, Math.PI * 2);
    ctx.fill();

    // Obstacles
    for (const o of obstacles) {
      ctx.fillStyle = 'rgba(255,216,109,.92)';
      roundRect(ctx, o.x, o.y, o.w, o.h, 10);
      ctx.fillStyle = 'rgba(8,16,28,.28)';
      ctx.fillRect(o.x + 6, o.y + 10, Math.max(0, o.w - 12), 6);
    }

    // UI overlay
    ctx.fillStyle = 'rgba(8,16,28,.65)';
    ctx.font = '900 22px ui-rounded, system-ui, sans-serif';
    ctx.fillText('SAKRASH!', 18, 34);
  }

  function roundRect(ctx2d, x, y, w, h, r) {
    ctx2d.beginPath();
    ctx2d.moveTo(x + r, y);
    ctx2d.arcTo(x + w, y, x + w, y + h, r);
    ctx2d.arcTo(x + w, y + h, x, y + h, r);
    ctx2d.arcTo(x, y + h, x, y, r);
    ctx2d.arcTo(x, y, x + w, y, r);
    ctx2d.closePath();
    ctx2d.fill();
  }

  function finish() {
    running = false;
    cancelAnimationFrame(raf);

    const score = Math.round(distance);
    best = Math.max(best, score);
    confettiBurst({ count: 36 });
    audio.playSfx('hit');

    addScore('jump', score, { detail: `Masofa ${score}` });

    if (hintEl) hintEl.textContent = `O‘yin tugadi! Ball ${score} saqlandi.`;
  }

  function loop(ts) {
    if (!running) return;
    if (!tPrev) tPrev = ts;
    const dt = clamp((ts - tPrev) / 1000, 0, 0.033);
    tPrev = ts;

    // Difficulty increases over time
    speed += dt * 24;

    // Gravity
    player.vy += 1650 * dt;
    player.y += player.vy * dt;
    if (player.y >= groundY) {
      player.y = groundY;
      player.vy = 0;
      player.onGround = true;
    }

    // Spawn obstacles
    const spawnChance = dt * (0.7 + (speed - 360) / 900);
    if (Math.random() < spawnChance && obstacles.length < 5) {
      // Keep some spacing
      const last = obstacles[obstacles.length - 1];
      if (!last || last.x < W - 220) spawnObstacle();
    }

    // Move obstacles
    for (const o of obstacles) {
      o.x -= speed * dt;
    }
    obstacles = obstacles.filter((o) => o.x + o.w > -60);

    // Score is distance traveled
    distance += dt * (speed / 6);

    // Collision
    for (const o of obstacles) {
      if (rectsOverlap(player, o)) {
        finish();
        return;
      }
    }

    if (scoreEl) scoreEl.textContent = String(Math.round(distance));
    if (speedEl) speedEl.textContent = `${(speed / 360).toFixed(1)}x`;

    draw();
    raf = requestAnimationFrame(loop);
  }

  function start() {
    cancelAnimationFrame(raf);
    reset();
    draw();
    raf = requestAnimationFrame(loop);
  }

  restartBtn?.addEventListener('click', start);

  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'ArrowUp') {
      e.preventDefault();
      if (!running) start();
      jump();
    }
  });

  // Touch controls
  canvas.addEventListener('pointerdown', () => {
    if (!running) start();
    jump();
  });

  // Initial frame
  draw();
}
