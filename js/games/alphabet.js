import { audio } from '../audio.js';
import { addScore } from '../score.js';
import { confettiBurst } from '../ui.js';

// A-Z word + emoji pairs for kids aged 3-6
const ALPHABET_DATA = [
  { letter: 'A', word: 'Apple', emoji: '🍎' },
  { letter: 'B', word: 'Ball', emoji: '⚽' },
  { letter: 'C', word: 'Cat', emoji: '🐱' },
  { letter: 'D', word: 'Dog', emoji: '🐶' },
  { letter: 'E', word: 'Egg', emoji: '🥚' },
  { letter: 'F', word: 'Fish', emoji: '🐟' },
  { letter: 'G', word: 'Grape', emoji: '🍇' },
  { letter: 'H', word: 'Hat', emoji: '🎩' },
  { letter: 'I', word: 'Ice cream', emoji: '🍦' },
  { letter: 'J', word: 'Jam', emoji: '🫙' },
  { letter: 'K', word: 'Kite', emoji: '🪁' },
  { letter: 'L', word: 'Lion', emoji: '🦁' },
  { letter: 'M', word: 'Moon', emoji: '🌙' },
  { letter: 'N', word: 'Nest', emoji: '🪺' },
  { letter: 'O', word: 'Orange', emoji: '🍊' },
  { letter: 'P', word: 'Pear', emoji: '🍐' },
  { letter: 'Q', word: 'Queen', emoji: '👸' },
  { letter: 'R', word: 'Rainbow', emoji: '🌈' },
  { letter: 'S', word: 'Star', emoji: '⭐' },
  { letter: 'T', word: 'Tree', emoji: '🌳' },
  { letter: 'U', word: 'Umbrella', emoji: '☂️' },
  { letter: 'V', word: 'Violin', emoji: '🎻' },
  { letter: 'W', word: 'Whale', emoji: '🐋' },
  { letter: 'X', word: 'Xylophone', emoji: '🎵' },
  { letter: 'Y', word: 'Yacht', emoji: '⛵' },
  { letter: 'Z', word: 'Zebra', emoji: '🦓' },
];

const TOTAL_ROUNDS = 10;

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickDistractors(correct, count = 3) {
  const others = ALPHABET_DATA.filter((d) => d.letter !== correct.letter);
  return shuffle(others).slice(0, count);
}

export function initAlphabetGame(root) {
  root.innerHTML = `
    <div class="row" style="justify-content:space-between; align-items:flex-end">
      <div>
        <h2 style="margin:0">🔤 Ingliz Alifbosi</h2>
        <p class="lead" style="margin:6px 0 0">Rasmga to'g'ri harfni bos!</p>
      </div>
      <button class="btn" id="abcNew" type="button">Yangi o'yin 🔁</button>
    </div>

    <div class="row" style="margin-top:12px">
      <div class="kpi" aria-live="polite"><span>🏁</span><b id="abcRound">1/${TOTAL_ROUNDS}</b></div>
      <div class="kpi" aria-live="polite"><span>✅</span><b id="abcCorrect">0</b></div>
      <div class="kpi" aria-live="polite"><span>⭐</span><b id="abcScore">0</b></div>
    </div>

    <div id="abcStatus" class="lead" aria-live="polite" style="margin-top:10px; min-height:28px"></div>

    <div id="abcCard" class="abc-card" style="margin-top:14px">
      <div class="abc-emoji" id="abcEmoji" aria-hidden="true"></div>
      <div class="abc-word" id="abcWord"></div>
    </div>

    <div class="abc-choices" id="abcChoices" style="margin-top:18px" aria-label="Harf tanlang"></div>
  `;

  const roundEl = root.querySelector('#abcRound');
  const correctEl = root.querySelector('#abcCorrect');
  const scoreEl = root.querySelector('#abcScore');
  const statusEl = root.querySelector('#abcStatus');
  const emojiEl = root.querySelector('#abcEmoji');
  const wordEl = root.querySelector('#abcWord');
  const choicesEl = root.querySelector('#abcChoices');
  const newBtn = root.querySelector('#abcNew');

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
    const item = rounds[currentIndex];
    const distractors = pickDistractors(item);
    const options = shuffle([item, ...distractors]);

    if (emojiEl) emojiEl.textContent = item.emoji;
    if (wordEl) wordEl.textContent = item.word;
    setStatus('');
    updateKpi();

    if (!choicesEl) return;
    choicesEl.innerHTML = '';
    startedAt = performance.now();

    for (const opt of options) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'abc-choice-btn';
      btn.textContent = opt.letter;
      btn.setAttribute('aria-label', `Harf: ${opt.letter}`);

      btn.addEventListener('click', () => {
        if (answered) return;
        answered = true;
        const elapsed = performance.now() - startedAt;

        // Disable all buttons
        choicesEl.querySelectorAll('.abc-choice-btn').forEach((b) => {
          /** @type {HTMLButtonElement} */ (b).disabled = true;
        });

        if (opt.letter === item.letter) {
          const pts = scoreForAnswer(elapsed);
          totalScore += pts;
          correctCount++;
          btn.classList.add('abc-correct');
          setStatus(`To'g'ri! 🎉 +${pts} ball`, '#6df2c2');
          audio.playSfx('flip');
        } else {
          btn.classList.add('abc-wrong');
          // Show the correct one
          choicesEl.querySelectorAll('.abc-choice-btn').forEach((b) => {
            if (b.textContent === item.letter) b.classList.add('abc-correct');
          });
          setStatus(`Noto'g'ri 😅 To'g'ri javob: "${item.letter}"`, '#ff8080');
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
    if (emojiEl) emojiEl.textContent = '🏆';
    if (wordEl) wordEl.textContent = `${correctCount}/${TOTAL_ROUNDS} to'g'ri!`;
    setStatus(`O'yin tugadi! Jami ball: ${totalScore}. Reytingga saqlandi. 🎊`, '#ffd166');
    confettiBurst({ count: 40 });
    audio.celebrate();
    addScore('alphabet', totalScore, { detail: `${correctCount}/${TOTAL_ROUNDS} to'g'ri` });
    if (roundEl) roundEl.textContent = `${TOTAL_ROUNDS}/${TOTAL_ROUNDS}`;
  }

  function newGame() {
    rounds = shuffle(ALPHABET_DATA).slice(0, TOTAL_ROUNDS);
    currentIndex = 0;
    correctCount = 0;
    totalScore = 0;
    answered = false;
    showRound();
  }

  newBtn?.addEventListener('click', newGame);
  newGame();
}
