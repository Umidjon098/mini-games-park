import { audio } from '../audio.js';
import { addScore } from '../score.js';
import { confettiBurst } from '../ui.js';

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function msToSeconds(ms) {
  return Math.max(0, Math.round(ms / 100) / 10);
}

function scoreFor({ elapsedMs, moves, pairs }) {
  const base = pairs * 900;
  const timePenalty = Math.round(msToSeconds(elapsedMs) * 18);
  const movePenalty = Math.max(0, moves - pairs) * 40;
  return Math.max(0, base - timePenalty - movePenalty);
}

function dicebear(seed) {
  // Allowed image source per spec.
  return `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${encodeURIComponent(seed)}`;
}

export function initMemoryGame(root) {
  root.innerHTML = `
    <div class="row" style="justify-content:space-between; align-items:flex-end">
      <div>
        <h2 style="margin:0">🧠 Xotira</h2>
        <p class="lead" style="margin:6px 0 0">Kartalarni ochib, mos juftlarni toping.</p>
      </div>
      <button class="btn" id="memNew" type="button">Yangi o‘yin 🔁</button>
    </div>

    <div class="row" style="margin-top:12px">
      <div class="kpi" aria-live="polite"><span>⏱️</span><b id="memTime">0.0s</b></div>
      <div class="kpi" aria-live="polite"><span>🪄</span><b id="memMoves">0</b></div>
      <div class="kpi" aria-live="polite"><span>⭐</span><b id="memScore">0</b></div>
      <div class="kpi" aria-live="polite"><span>✅</span><b id="memFound">0/8</b></div>
    </div>

    <div id="memStatus" class="lead" aria-live="polite" style="margin-top:10px"></div>

    <div class="memory-grid" id="memGrid" style="margin-top:12px" aria-label="Xotira kartalari"></div>
  `;

  const grid = root.querySelector('#memGrid');
  const timeEl = root.querySelector('#memTime');
  const movesEl = root.querySelector('#memMoves');
  const scoreEl = root.querySelector('#memScore');
  const foundEl = root.querySelector('#memFound');
  const status = root.querySelector('#memStatus');
  const newBtn = root.querySelector('#memNew');

  if (!(grid instanceof HTMLElement)) return;

  let timerId = 0;
  let startedAt = 0;
  let moves = 0;
  let foundPairs = 0;
  let lock = false;
  let first = null;

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
    timerId = window.setInterval(() => paint(), 120);
  }

  function paint() {
    const elapsed = startedAt ? performance.now() - startedAt : 0;
    const score = scoreFor({ elapsedMs: elapsed, moves, pairs: 8 });
    if (timeEl) timeEl.textContent = `${msToSeconds(elapsed).toFixed(1)}s`;
    if (movesEl) movesEl.textContent = String(moves);
    if (scoreEl) scoreEl.textContent = String(score);
    if (foundEl) foundEl.textContent = `${foundPairs}/8`;
  }

  function finish() {
    stopTimer();
    const elapsed = startedAt ? performance.now() - startedAt : 0;
    const score = scoreFor({ elapsedMs: elapsed, moves, pairs: 8 });
    confettiBurst({ count: 42 });
    audio.celebrate();
    addScore('memory', score, { detail: `${msToSeconds(elapsed).toFixed(1)}s • ${moves} yurish` });
    setStatus(`Ajoyib! 🎉 Ball: ${score}. Reytingga saqlandi.`);
  }

  function cardEl({ id, faceUrl }) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'mem-card';
    btn.setAttribute('aria-pressed', 'false');
    btn.setAttribute('aria-label', 'Xotira kartasi');
    btn.dataset.cardId = id;
    btn.dataset.faceUrl = faceUrl;

    btn.innerHTML = `
      <div class="mem-inner">
        <div class="mem-face mem-front">
          <span style="font-size:30px" aria-hidden="true">❓</span>
        </div>
        <div class="mem-face mem-back">
          <img alt="Card" loading="lazy" src="${faceUrl}" />
        </div>
      </div>
    `;

    btn.addEventListener('click', () => {
      if (lock) return;
      if (btn.dataset.matched === 'true') return;

      startTimerIfNeeded();

      const pressed = btn.getAttribute('aria-pressed') === 'true';
      if (pressed) return;

      btn.setAttribute('aria-pressed', 'true');
      audio.playSfx('flip');

      if (!first) {
        first = btn;
        return;
      }

      moves++;
      paint();

      const a = first;
      const b = btn;
      first = null;

      if (a.dataset.cardId === b.dataset.cardId) {
        a.dataset.matched = 'true';
        b.dataset.matched = 'true';
        foundPairs++;
        setStatus('Mos keldi! ✅');
        paint();
        if (foundPairs === 8) finish();
        return;
      }

      lock = true;
      setStatus('Yana urinib ko‘ring!');
      setTimeout(() => {
        a.setAttribute('aria-pressed', 'false');
        b.setAttribute('aria-pressed', 'false');
        lock = false;
      }, 550);
    });

    return btn;
  }

  function newGame() {
    stopTimer();
    startedAt = 0;
    moves = 0;
    foundPairs = 0;
    lock = false;
    first = null;
    grid.innerHTML = '';

    const seeds = ['Sun', 'Moon', 'Star', 'Cloud', 'Candy', 'Balloon', 'Rocket', 'Turtle'];
    const faces = seeds.map((s) => ({ id: s, url: dicebear(s) }));

    const deck = shuffle(
      faces
        .flatMap((f) => [
          { id: f.id, faceUrl: f.url },
          { id: f.id, faceUrl: f.url },
        ])
        .map((c, i) => ({ ...c, key: `${c.id}-${i}` }))
    );

    for (const c of deck) {
      grid.appendChild(cardEl({ id: c.id, faceUrl: c.faceUrl }));
    }

    setStatus('Boshlash uchun 2 ta kartani oching.');
    paint();
  }

  newBtn?.addEventListener('click', newGame);
  newGame();
}
