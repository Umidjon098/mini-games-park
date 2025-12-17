import { audio } from '../audio.js';
import { addScore } from '../score.js';
import { confettiBurst } from '../ui.js';

const DIFFICULTIES = {
  easy: { label: 'Oson', n: 3 },
  medium: { label: "O‘rtacha", n: 4 },
  hard: { label: 'Qiyin', n: 5 },
};

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

function scoreFor({ n, elapsedMs, mistakes }) {
  // Simple kid-friendly scoring: bigger is better.
  const base = n * n * 600;
  const timePenalty = Math.round(msToSeconds(elapsedMs) * (n * 10));
  const mistakePenalty = mistakes * (n * 40);
  return Math.max(0, base - timePenalty - mistakePenalty);
}

function picsumUrl({ seed, size = 720 }) {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${size}/${size}`;
}

export function initPuzzleGame(root) {
  root.innerHTML = `
    <div class="row" style="justify-content:space-between; align-items:flex-end">
      <div>
        <h2 style="margin:0">🧩 Boshqotirma</h2>
        <p class="lead" style="margin:6px 0 0">Bo‘laklarni to‘g‘ri kataklarga sudrang.</p>
      </div>
      <div class="row" style="gap:10px">
        <div>
          <label for="puzzleDiff">Qiyinlik</label>
          <select id="puzzleDiff" aria-label="Boshqotirma qiyinligi">
            <option value="easy">Oson (3×3)</option>
            <option value="medium">O‘rtacha (4×4)</option>
            <option value="hard">Qiyin (5×5)</option>
          </select>
        </div>
        <button class="btn" id="puzzleNew" type="button">Yangi boshqotirma 🔁</button>
      </div>
    </div>

    <div class="row" style="margin-top:12px">
      <div class="kpi" aria-live="polite"><span>⏱️</span><b id="puzzleTime">0.0s</b></div>
      <div class="kpi" aria-live="polite"><span>❌</span><b id="puzzleMistakes">0</b></div>
      <div class="kpi" aria-live="polite"><span>⭐</span><b id="puzzleScore">0</b></div>
    </div>

    <div class="puzzle-wrap" style="margin-top:14px">
      <div>
        <div class="puzzle-board" id="puzzleBoard" aria-label="Boshqotirma maydoni" role="application"></div>
        <p class="lead" id="puzzleStatus" aria-live="polite" style="margin:10px 0 0"></p>
      </div>
      <div class="piece-tray">
        <div class="badge">Bo‘laklar</div>
        <div class="row" style="gap:10px; flex-wrap:wrap" id="puzzleTray" aria-label="Boshqotirma bo‘laklari"></div>
        <button class="btn secondary" id="puzzleHint" type="button">Rasmni ko‘rsat 👀</button>
        <div id="puzzlePreview" class="card" style="background:rgba(255,255,255,.04); display:none">
          <div class="card-inner">
            <img id="puzzlePreviewImg" alt="Rasm ko‘rinishi" style="width:100%; border-radius:14px" loading="lazy" />
          </div>
        </div>
      </div>
    </div>
  `;

  const board = root.querySelector('#puzzleBoard');
  const tray = root.querySelector('#puzzleTray');
  const status = root.querySelector('#puzzleStatus');
  const timeEl = root.querySelector('#puzzleTime');
  const mistakesEl = root.querySelector('#puzzleMistakes');
  const scoreEl = root.querySelector('#puzzleScore');
  const diffSel = root.querySelector('#puzzleDiff');
  const newBtn = root.querySelector('#puzzleNew');
  const hintBtn = root.querySelector('#puzzleHint');
  const preview = root.querySelector('#puzzlePreview');
  const previewImg = root.querySelector('#puzzlePreviewImg');

  if (!(board instanceof HTMLElement) || !(tray instanceof HTMLElement)) return;

  let timerId = 0;
  let startedAt = 0;
  let mistakes = 0;
  let placed = 0;
  let current = { key: 'easy', n: 3, seed: 'mgp-puzzle' };

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
    timerId = window.setInterval(() => {
      const elapsed = performance.now() - startedAt;
      if (timeEl) timeEl.textContent = `${msToSeconds(elapsed).toFixed(1)}s`;
      if (scoreEl) scoreEl.textContent = String(scoreFor({ n: current.n, elapsedMs: elapsed, mistakes }));
    }, 120);
  }

  function updateKPIs() {
    const elapsed = startedAt ? performance.now() - startedAt : 0;
    if (timeEl) timeEl.textContent = `${msToSeconds(elapsed).toFixed(1)}s`;
    if (mistakesEl) mistakesEl.textContent = String(mistakes);
    if (scoreEl) scoreEl.textContent = String(scoreFor({ n: current.n, elapsedMs: elapsed, mistakes }));
  }

  function pieceEl({ idx, imgUrl }) {
    const n = current.n;
    const row = Math.floor(idx / n);
    const col = idx % n;

    const el = document.createElement('div');
    el.className = 'piece';
    el.setAttribute('draggable', 'true');
    el.setAttribute('role', 'button');
    el.setAttribute('aria-label', `Boshqotirma bo‘lagi ${idx + 1}`);
    el.dataset.pieceId = `p${idx}`;
    el.dataset.correctIndex = String(idx);

    // Background cropping
    el.style.backgroundImage = `url(${imgUrl})`;
    el.style.backgroundRepeat = 'no-repeat';
    el.style.backgroundSize = `${n * 100}% ${n * 100}%`;
    el.style.backgroundPosition = `${(col * 100) / (n - 1)}% ${(row * 100) / (n - 1)}%`;

    el.addEventListener('dragstart', (e) => {
      startTimerIfNeeded();
      const dt = e.dataTransfer;
      if (!dt) return;
      dt.setData('text/plain', el.dataset.pieceId || '');
      dt.effectAllowed = 'move';
    });

    // Touch-friendly drag fallback: tap to pick / tap slot to place
    el.addEventListener('click', () => {
      startTimerIfNeeded();
      const already = tray.querySelector('[data-picked="true"]');
      if (already) already.removeAttribute('data-picked');
      el.setAttribute('data-picked', 'true');
      el.classList.add('glow');
      setTimeout(() => el.classList.remove('glow'), 350);
      setStatus('Tanlangan bo‘lakni joylash uchun katakka bosing.');
    });

    return el;
  }

  function slotEl(index) {
    const slot = document.createElement('div');
    slot.className = 'puzzle-slot';
    slot.dataset.index = String(index);
    slot.setAttribute('role', 'button');
    slot.setAttribute('aria-label', `Katak ${index + 1}`);
    slot.style.aspectRatio = '1 / 1';

    slot.addEventListener('dragover', (e) => {
      e.preventDefault();
      startTimerIfNeeded();
      if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
    });

    slot.addEventListener('drop', (e) => {
      e.preventDefault();
      startTimerIfNeeded();
      const dt = e.dataTransfer;
      const id = dt ? dt.getData('text/plain') : '';
      if (!id) return;
      const piece = tray.querySelector(`[data-piece-id="${CSS.escape(id)}"]`) || board.querySelector(`[data-piece-id="${CSS.escape(id)}"]`);
      if (!(piece instanceof HTMLElement)) return;
      tryPlacePiece({ piece, slot });
    });

    slot.addEventListener('click', () => {
      startTimerIfNeeded();
      const picked = tray.querySelector('[data-picked="true"]');
      if (!(picked instanceof HTMLElement)) return;
      picked.removeAttribute('data-picked');
      tryPlacePiece({ piece: picked, slot });
    });

    return slot;
  }

  function tryPlacePiece({ piece, slot }) {
    const correct = Number(piece.dataset.correctIndex);
    const idx = Number(slot.dataset.index);
    if (!Number.isFinite(correct) || !Number.isFinite(idx)) return;

    // prevent overwriting
    if (slot.querySelector('.piece')) {
      mistakes++;
      slot.classList.add('shake');
      setTimeout(() => slot.classList.remove('shake'), 420);
      updateKPIs();
      return;
    }

    if (correct !== idx) {
      mistakes++;
      slot.classList.add('shake');
      setTimeout(() => slot.classList.remove('shake'), 420);
      updateKPIs();
      return;
    }

    slot.classList.add('correct');
    piece.style.width = '100%';
    piece.style.height = '100%';
    piece.style.borderRadius = '12px';
    piece.style.cursor = 'default';
    piece.setAttribute('draggable', 'false');

    slot.appendChild(piece);
    placed++;
    audio.playSfx('place');
    updateKPIs();

    if (placed === current.n * current.n) finish();
  }

  function finish() {
    stopTimer();
    const elapsed = startedAt ? performance.now() - startedAt : 0;
    const score = scoreFor({ n: current.n, elapsedMs: elapsed, mistakes });

    confettiBurst({ count: 44 });
    audio.celebrate();

    const detail = `${DIFFICULTIES[current.key].label} • ${msToSeconds(elapsed).toFixed(1)}s • ${mistakes} xato`;
    addScore('puzzle', score, { detail });

    setStatus(`Bajarildi! 🎉 Ball: ${score}. Reytingga saqlandi.`);
  }

  function newGame() {
    stopTimer();
    startedAt = 0;
    mistakes = 0;
    placed = 0;

    const key = diffSel?.value || 'easy';
    const d = DIFFICULTIES[key] || DIFFICULTIES.easy;
    current = { key, n: d.n, seed: `mgp-puzzle-${key}-${Math.random().toString(16).slice(2)}` };

    const imgUrl = picsumUrl({ seed: current.seed, size: 720 });
    if (previewImg) previewImg.src = imgUrl;

    board.innerHTML = '';
    tray.innerHTML = '';

    board.style.gridTemplateColumns = `repeat(${current.n}, minmax(0, 1fr))`;
    board.style.maxWidth = '680px';

    // Build slots
    for (let i = 0; i < current.n * current.n; i++) {
      board.appendChild(slotEl(i));
    }

    // Build pieces (shuffled)
    const indices = shuffle([...Array(current.n * current.n)].map((_, i) => i));
    for (const idx of indices) {
      tray.appendChild(pieceEl({ idx, imgUrl }));
    }

    updateKPIs();
    setStatus('Bo‘lakni mos katakka sudrang.');
  }

  hintBtn?.addEventListener('click', () => {
    const showing = preview && preview.style.display !== 'none';
    if (!preview) return;
    preview.style.display = showing ? 'none' : 'block';
    hintBtn.textContent = showing ? 'Rasmni ko‘rsat 👀' : 'Rasmni yashir 🙈';
  });

  newBtn?.addEventListener('click', newGame);
  diffSel?.addEventListener('change', newGame);

  newGame();
}
