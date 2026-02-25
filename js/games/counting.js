import { audio } from '../audio.js';
import { addScore } from '../score.js';
import { confettiBurst } from '../ui.js';

// Object groups for counting — varied so kids don't get bored
const OBJECTS = [
  { emoji: '🍎', label: 'olma' },
  { emoji: '⭐', label: 'yulduz' },
  { emoji: '🐱', label: 'mushuk' },
  { emoji: '🌸', label: 'gul' },
  { emoji: '🍭', label: 'konfet' },
  { emoji: '🦀', label: 'qisqichbaqa' },
  { emoji: '🚗', label: 'mashina' },
  { emoji: '🎈', label: 'shar' },
  { emoji: '🦋', label: 'kapalak' },
  { emoji: '🍕', label: 'pizza' },
];

// Count range suitable for 3-6 year olds: 1-10
const MIN_COUNT = 1;
const MAX_COUNT = 10;
const TOTAL_ROUNDS = 10;

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickDistractorNumbers(correct, count = 3) {
  const pool = [];
  for (let n = MIN_COUNT; n <= MAX_COUNT; n++) {
    if (n !== correct) pool.push(n);
  }
  return shuffle(pool).slice(0, count);
}

function randomObj() {
  return OBJECTS[Math.floor(Math.random() * OBJECTS.length)];
}

function randomCount() {
  return Math.floor(Math.random() * (MAX_COUNT - MIN_COUNT + 1)) + MIN_COUNT;
}

export function initCountingGame(root) {
  root.innerHTML = `
    <div class="row" style="justify-content:space-between; align-items:flex-end">
      <div>
        <h2 style="margin:0">🔢 Hisoblash</h2>
        <p class="lead" style="margin:6px 0 0">Nechta? To'g'ri sonni bos!</p>
      </div>
      <button class="btn" id="cntNew" type="button">Yangi o'yin 🔁</button>
    </div>

    <div class="row" style="margin-top:12px">
      <div class="kpi" aria-live="polite"><span>🏁</span><b id="cntRound">1/${TOTAL_ROUNDS}</b></div>
      <div class="kpi" aria-live="polite"><span>✅</span><b id="cntCorrect">0</b></div>
      <div class="kpi" aria-live="polite"><span>⭐</span><b id="cntScore">0</b></div>
    </div>

    <div id="cntStatus" class="lead" aria-live="polite" style="margin-top:10px; min-height:28px"></div>

    <div class="cnt-stage" id="cntStage" aria-label="Nechta narsa?" style="margin-top:14px"></div>

    <div class="cnt-choices" id="cntChoices" style="margin-top:18px" aria-label="Son tanlang"></div>
  `;

  const roundEl = root.querySelector('#cntRound');
  const correctEl = root.querySelector('#cntCorrect');
  const scoreEl = root.querySelector('#cntScore');
  const statusEl = root.querySelector('#cntStatus');
  const stageEl = root.querySelector('#cntStage');
  const choicesEl = root.querySelector('#cntChoices');
  const newBtn = root.querySelector('#cntNew');

  let rounds = [];
  let currentIndex = 0;
  let correctCount = 0;
  let totalScore = 0;
  let startedAt = 0;
  let answered = false;

  function setStatus(msg, color = '') {
    if (statusEl) {
      statusEl.textContent = msg;
      statusEl.style.color = color;
    }
  }

  function updateKpi() {
    if (roundEl) roundEl.textContent = `${Math.min(currentIndex + 1, TOTAL_ROUNDS)}/${TOTAL_ROUNDS}`;
    if (correctEl) correctEl.textContent = String(correctCount);
    if (scoreEl) scoreEl.textContent = String(totalScore);
  }

  function scoreForAnswer(elapsedMs) {
    const base = 100;
    const penalty = Math.min(90, Math.floor(elapsedMs / 1000) * 10);
    return Math.max(10, base - penalty);
  }

  function showRound() {
    answered = false;
    const { obj, count } = rounds[currentIndex];
    const distractors = pickDistractorNumbers(count);
    const options = shuffle([count, ...distractors]);

    // Render the emoji grid
    if (stageEl) {
      stageEl.innerHTML = '';
      const grid = document.createElement('div');
      grid.className = 'cnt-emoji-grid';
      grid.setAttribute('aria-label', `${count} ta ${obj.label}`);
      for (let i = 0; i < count; i++) {
        const span = document.createElement('span');
        span.className = 'cnt-emoji-item';
        span.textContent = obj.emoji;
        span.setAttribute('aria-hidden', 'true');
        grid.appendChild(span);
      }
      stageEl.appendChild(grid);

      const question = document.createElement('div');
      question.className = 'cnt-question';
      question.textContent = 'Nechta?';
      stageEl.appendChild(question);
    }

    setStatus('');
    updateKpi();

    if (!choicesEl) return;
    choicesEl.innerHTML = '';
    startedAt = performance.now();

    for (const num of options) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'cnt-choice-btn';
      btn.textContent = String(num);
      btn.setAttribute('aria-label', `Son: ${num}`);

      btn.addEventListener('click', () => {
        if (answered) return;
        answered = true;
        const elapsed = performance.now() - startedAt;

        choicesEl.querySelectorAll('.cnt-choice-btn').forEach((b) => {
          /** @type {HTMLButtonElement} */ (b).disabled = true;
        });

        if (num === count) {
          const pts = scoreForAnswer(elapsed);
          totalScore += pts;
          correctCount++;
          btn.classList.add('abc-correct');
          setStatus(`To'g'ri! 🎉 +${pts} ball`, '#6df2c2');
          audio.playSfx('flip');
        } else {
          btn.classList.add('abc-wrong');
          choicesEl.querySelectorAll('.cnt-choice-btn').forEach((b) => {
            if (Number(b.textContent) === count) b.classList.add('abc-correct');
          });
          setStatus(`Noto'g'ri 😅 To'g'ri javob: ${count}`, '#ff8080');
        }

        updateKpi();
        setTimeout(() => nextRound(), 1100);
      });

      choicesEl.appendChild(btn);
    }
  }

  function nextRound() {
    currentIndex++;
    if (currentIndex >= TOTAL_ROUNDS) {
      finishGame();
    } else {
      showRound();
    }
  }

  function finishGame() {
    if (choicesEl) choicesEl.innerHTML = '';
    if (stageEl) {
      stageEl.innerHTML = `<div class="cnt-question" style="font-size:3rem">🏆</div>
        <div class="cnt-question">${correctCount}/${TOTAL_ROUNDS} to'g'ri!</div>`;
    }
    setStatus(`O'yin tugadi! Jami ball: ${totalScore}. Reytingga saqlandi. 🎊`, '#ffd166');
    confettiBurst({ count: 40 });
    audio.celebrate();
    addScore('counting', totalScore, { detail: `${correctCount}/${TOTAL_ROUNDS} to'g'ri` });
    if (roundEl) roundEl.textContent = `${TOTAL_ROUNDS}/${TOTAL_ROUNDS}`;
  }

  function newGame() {
    rounds = Array.from({ length: TOTAL_ROUNDS }, () => ({
      obj: randomObj(),
      count: randomCount(),
    }));
    currentIndex = 0;
    correctCount = 0;
    totalScore = 0;
    answered = false;
    showRound();
  }

  newBtn?.addEventListener('click', newGame);
  newGame();
}
