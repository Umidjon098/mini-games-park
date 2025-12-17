import { audio } from '../audio.js';
import { addScore } from '../score.js';
import { confettiBurst } from '../ui.js';

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function msToSeconds(ms) {
  return Math.max(0, Math.round(ms / 100) / 10);
}

function scoreFor({ elapsedMs, steps }) {
  const base = 9000;
  const timePenalty = Math.round(msToSeconds(elapsedMs) * 55);
  const stepPenalty = Math.max(0, steps - 20) * 8;
  return Math.max(0, base - timePenalty - stepPenalty);
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function carveMaze(cols, rows) {
  // Depth-first backtracker.
  // Cell stores walls: top/right/bottom/left booleans.
  const grid = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({ t: true, r: true, b: true, l: true, v: false }))
  );

  const stack = [];
  let cx = 0;
  let cy = 0;
  grid[cy][cx].v = true;

  const dirs = [
    { dx: 0, dy: -1, a: 't', b: 'b' },
    { dx: 1, dy: 0, a: 'r', b: 'l' },
    { dx: 0, dy: 1, a: 'b', b: 't' },
    { dx: -1, dy: 0, a: 'l', b: 'r' },
  ];

  while (true) {
    const neighbors = [];
    for (const d of dirs) {
      const nx = cx + d.dx;
      const ny = cy + d.dy;
      if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) continue;
      if (!grid[ny][nx].v) neighbors.push({ nx, ny, d });
    }

    if (neighbors.length === 0) {
      const prev = stack.pop();
      if (!prev) break;
      cx = prev.x;
      cy = prev.y;
      continue;
    }

    const pick = shuffle(neighbors)[0];
    const { nx, ny, d } = pick;

    grid[cy][cx][d.a] = false;
    grid[ny][nx][d.b] = false;

    stack.push({ x: cx, y: cy });
    cx = nx;
    cy = ny;
    grid[cy][cx].v = true;
  }

  // Clear visit flags
  for (const row of grid) for (const c of row) delete c.v;
  return grid;
}

export function initMazeGame(root) {
  root.innerHTML = `
    <div class="row" style="justify-content:space-between; align-items:flex-end">
      <div>
        <h2 style="margin:0">🧭 Labirint</h2>
        <p class="lead" style="margin:6px 0 0">Chiqishga yeting. Strelkalar yoki swipe.</p>
      </div>
      <button class="btn" id="mazeNew" type="button">Yangi labirint 🔁</button>
    </div>

    <div class="row" style="margin-top:12px">
      <div class="kpi" aria-live="polite"><span>⏱️</span><b id="mazeTime">0.0s</b></div>
      <div class="kpi" aria-live="polite"><span>👣</span><b id="mazeSteps">0</b></div>
      <div class="kpi" aria-live="polite"><span>⭐</span><b id="mazeScore">0</b></div>
      <div class="badge" id="mazeHint" aria-live="polite">Harakat uchun swipe qiling</div>
    </div>

    <div class="maze-wrap" style="margin-top:12px">
      <canvas id="mazeCanvas" width="900" height="520" aria-label="Labirint o‘yini kanvasi"></canvas>
      <div id="mazeStatus" class="lead" aria-live="polite"></div>
    </div>
  `;

  const canvas = root.querySelector('#mazeCanvas');
  const newBtn = root.querySelector('#mazeNew');
  const timeEl = root.querySelector('#mazeTime');
  const stepsEl = root.querySelector('#mazeSteps');
  const scoreEl = root.querySelector('#mazeScore');
  const status = root.querySelector('#mazeStatus');

  if (!(canvas instanceof HTMLCanvasElement)) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Mobile: allow reliable swipe without the browser stealing the gesture for scrolling.
  // (Pointer events + touch scrolling can cancel pointerup on some devices.)
  canvas.style.touchAction = 'none';

  const cols = 14;
  const rows = 10;

  let grid = carveMaze(cols, rows);
  let px = 0;
  let py = 0;
  let ex = cols - 1;
  let ey = rows - 1;

  let startedAt = 0;
  let timerId = 0;
  let steps = 0;
  let finished = false;

  function setStatus(msg) {
    if (status) status.textContent = msg;
  }

  function stopTimer() {
    if (timerId) window.clearInterval(timerId);
    timerId = 0;
  }

  function startTimerIfNeeded() {
    if (startedAt) return;
    startedAt = performance.now();
    stopTimer();
    timerId = window.setInterval(paintHud, 120);
  }

  function paintHud() {
    const elapsed = startedAt ? performance.now() - startedAt : 0;
    const score = scoreFor({ elapsedMs: elapsed, steps });
    if (timeEl) timeEl.textContent = `${msToSeconds(elapsed).toFixed(1)}s`;
    if (stepsEl) stepsEl.textContent = String(steps);
    if (scoreEl) scoreEl.textContent = String(score);
  }

  function cellSize() {
    // Keep maze centered with padding.
    const pad = 36;
    const w = canvas.width - pad * 2;
    const h = canvas.height - pad * 2;
    const cs = Math.floor(Math.min(w / cols, h / rows));
    return { pad, cs };
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const { pad, cs } = cellSize();

    // Background
    const bg = ctx.createLinearGradient(0, 0, 0, canvas.height);
    bg.addColorStop(0, 'rgba(123,183,255,.14)');
    bg.addColorStop(1, 'rgba(109,242,194,.05)');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Maze walls
    ctx.strokeStyle = 'rgba(255,255,255,.78)';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const c = grid[y][x];
        const x0 = pad + x * cs;
        const y0 = pad + y * cs;
        const x1 = x0 + cs;
        const y1 = y0 + cs;

        ctx.beginPath();
        if (c.t) {
          ctx.moveTo(x0, y0);
          ctx.lineTo(x1, y0);
        }
        if (c.r) {
          ctx.moveTo(x1, y0);
          ctx.lineTo(x1, y1);
        }
        if (c.b) {
          ctx.moveTo(x0, y1);
          ctx.lineTo(x1, y1);
        }
        if (c.l) {
          ctx.moveTo(x0, y0);
          ctx.lineTo(x0, y1);
        }
        ctx.stroke();
      }
    }

    // Exit
    ctx.fillStyle = 'rgba(255,216,109,.95)';
    roundRect(ctx, pad + ex * cs + 10, pad + ey * cs + 10, cs - 20, cs - 20, 12);

    // Player
    ctx.fillStyle = 'rgba(109,242,194,.98)';
    roundRect(ctx, pad + px * cs + 12, pad + py * cs + 12, cs - 24, cs - 24, 14);

    // Small hint text
    ctx.fillStyle = 'rgba(8,16,28,.65)';
    ctx.font = '900 22px ui-rounded, system-ui, sans-serif';
    ctx.fillText('LABIRINT', 18, 34);
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

  function canMove(dx, dy) {
    const c = grid[py][px];
    if (dx === 1 && c.r) return false;
    if (dx === -1 && c.l) return false;
    if (dy === 1 && c.b) return false;
    if (dy === -1 && c.t) return false;

    const nx = px + dx;
    const ny = py + dy;
    if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) return false;
    return true;
  }

  function tryMove(dx, dy) {
    if (finished) return;
    startTimerIfNeeded();

    if (!canMove(dx, dy)) {
      audio.playSfx('hit');
      setStatus('Devorga urildingiz 😅');
      return;
    }

    px += dx;
    py += dy;
    steps++;
    setStatus('');
    paintHud();
    draw();

    if (px === ex && py === ey) finish();
  }

  function finish() {
    finished = true;
    stopTimer();

    const elapsed = startedAt ? performance.now() - startedAt : 0;
    const score = scoreFor({ elapsedMs: elapsed, steps });
    confettiBurst({ count: 40 });
    audio.celebrate();
    addScore('maze', score, { detail: `${msToSeconds(elapsed).toFixed(1)}s • ${steps} qadam` });
    setStatus(`Chiqdingiz! 🎉 Ball ${score} saqlandi.`);
  }

  function newMaze() {
    stopTimer();
    startedAt = 0;
    steps = 0;
    finished = false;

    grid = carveMaze(cols, rows);
    px = 0;
    py = 0;
    ex = cols - 1;
    ey = rows - 1;

    paintHud();
    setStatus('Strelkalar yoki swipe yordamida yuring.');
    draw();
  }

  function onKey(e) {
    const k = e.key;
    if (k === 'ArrowUp') {
      e.preventDefault();
      tryMove(0, -1);
    }
    if (k === 'ArrowDown') {
      e.preventDefault();
      tryMove(0, 1);
    }
    if (k === 'ArrowLeft') {
      e.preventDefault();
      tryMove(-1, 0);
    }
    if (k === 'ArrowRight') {
      e.preventDefault();
      tryMove(1, 0);
    }
  }

  // Swipe detection
  let swipeStart = null;
  let activePointerId = null;

  function onPointerDown(e) {
    // Prevent page scroll on touch devices.
    e.preventDefault();
    activePointerId = e.pointerId;
    swipeStart = { x: e.clientX, y: e.clientY };
    try {
      canvas.setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  }

  function onPointerUp(e) {
    if (activePointerId !== e.pointerId) return;
    e.preventDefault();

    const start = swipeStart;
    swipeStart = null;
    activePointerId = null;

    if (!start) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;

    const ax = Math.abs(dx);
    const ay = Math.abs(dy);
    if (Math.max(ax, ay) < 24) return;

    if (ax > ay) {
      tryMove(dx > 0 ? 1 : -1, 0);
    } else {
      tryMove(0, dy > 0 ? 1 : -1);
    }
  }

  function onPointerCancel(e) {
    if (activePointerId !== e.pointerId) return;
    swipeStart = null;
    activePointerId = null;
  }

  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointercancel', onPointerCancel);

  newBtn?.addEventListener('click', newMaze);
  window.addEventListener('keydown', onKey);

  newMaze();
}
