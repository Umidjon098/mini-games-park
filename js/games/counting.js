import { audio } from '../audio.js';
import { addScore } from '../score.js';
import { confettiBurst } from '../ui.js';

/**
 * Matematik Musobaqa — arifmetikadan tenglamalargacha.
 * 12–18 yoshlilar uchun  |  3 qiyinlik  |  countdown timer  |  streak multiplier
 */

const DIFFICULTY_CONFIG = {
  easy:   { label: 'Oson',      timeLimit: 20, baseScore: 100 },
  medium: { label: 'O\'rtacha', timeLimit: 15, baseScore: 150 },
  hard:   { label: 'Qiyin',     timeLimit: 12, baseScore: 200 },
};

const TOTAL_ROUNDS = 15;

// ── utilities ─────────────────────────────────────────────────────────────────

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Random integer in [min, max] inclusive */
function rnd(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function gcd(a, b) { return b === 0 ? Math.abs(a) : gcd(b, a % b); }

function streakMultiplier(streak) {
  if (streak >= 7) return 3.0;
  if (streak >= 5) return 2.0;
  if (streak >= 3) return 1.5;
  return 1.0;
}

// ── Question generators ───────────────────────────────────────────────────────

/**
 * Easy: 2-3 digit arithmetic — +, −, ×, ÷
 * @returns {{ question:string, answer:number, category:string }}
 */
function genEasy() {
  const type = rnd(0, 3);
  if (type === 0) {
    const a = rnd(50, 999), b = rnd(50, 999);
    return { question: `${a} + ${b} = ?`, answer: a + b, category: 'Qo\'shish' };
  }
  if (type === 1) {
    const a = rnd(100, 999), b = rnd(10, a);
    return { question: `${a} − ${b} = ?`, answer: a - b, category: 'Ayirish' };
  }
  if (type === 2) {
    const a = rnd(2, 12), b = rnd(11, 99);
    return { question: `${a} × ${b} = ?`, answer: a * b, category: 'Ko\'paytirish' };
  }
  // Integer division
  const b = rnd(2, 12), q = rnd(11, 99);
  return { question: `${b * q} ÷ ${b} = ?`, answer: q, category: 'Bo\'lish' };
}

/**
 * Medium: multi-step ops, percentages, powers, fraction addition, order of ops.
 * @returns {{ question:string, answer:number|string, category:string, isText?:boolean, answerNum?:number }}
 */
function genMedium() {
  const type = rnd(0, 4);

  if (type === 0) {
    // (a + b) × c  or  a × b + c × d
    if (Math.random() < 0.5) {
      const a = rnd(10, 50), b = rnd(10, 50), c = rnd(2, 9);
      return { question: `(${a} + ${b}) × ${c} = ?`, answer: (a + b) * c, category: 'Aralash amallar' };
    }
    const a = rnd(2, 12), b = rnd(2, 12), c = rnd(2, 8), d = rnd(2, 8);
    return { question: `${a} × ${b} + ${c} × ${d} = ?`, answer: a * b + c * d, category: 'Amallar tartibi' };
  }

  if (type === 1) {
    const pList = [10, 15, 20, 25, 30, 40, 50];
    const perc  = pList[rnd(0, pList.length - 1)];
    const y     = rnd(2, 20) * 10;
    return { question: `${y} ning ${perc}% i = ?`, answer: (y * perc) / 100, category: 'Foizlar' };
  }

  if (type === 2) {
    if (Math.random() < 0.5) {
      const n = rnd(5, 20);
      return { question: `${n}² = ?`, answer: n * n, category: 'Daraja' };
    }
    const n = rnd(2, 8);
    return { question: `${n}³ = ?`, answer: n * n * n, category: 'Daraja' };
  }

  if (type === 3) {
    // Fraction addition with same denominator
    const denom = rnd(2, 12);
    const a = rnd(1, denom - 1), b = rnd(1, denom - 1);
    const num = a + b;
    const g   = gcd(num, denom);
    const rn  = num / g, rd = denom / g;
    const ansStr = rd === 1 ? `${rn}` : `${rn}/${rd}`;
    return { question: `${a}/${denom} + ${b}/${denom} = ?`, answer: ansStr, answerNum: num / denom, category: 'Kasrlar', isText: true };
  }

  // Order of ops: a + b × c − d
  const a = rnd(5, 30), b = rnd(2, 10), c = rnd(2, 12), d = rnd(1, 20);
  return { question: `${a} + ${b} × ${c} − ${d} = ?`, answer: a + b * c - d, category: 'Amallar tartibi' };
}

/**
 * Hard: linear equations, quadratics, compound %, systems, arithmetic sequences.
 * @returns {{ question:string, answer:number|string, category:string, isText?:boolean }}
 */
function genHard() {
  const type = rnd(0, 4);

  if (type === 0) {
    // ax + b = c  →  x = ?
    const a = rnd(2, 9), x = rnd(-15, 15), b = rnd(-20, 20);
    const c = a * x + b;
    const bStr = b === 0 ? '' : b > 0 ? ` + ${b}` : ` − ${Math.abs(b)}`;
    return { question: `${a}x${bStr} = ${c}\nx = ?`, answer: x, category: 'Chiziqli tenglama' };
  }

  if (type === 1) {
    // (x − p)(x − q) = 0  expanded
    const p = rnd(-7, 7), q = rnd(-7, 7);
    const B = -(p + q), C = p * q;
    const bStr = B === 0 ? '' : B > 0 ? ` + ${B}x` : ` − ${Math.abs(B)}x`;
    const cStr = C === 0 ? '' : C > 0 ? ` + ${C}` : ` − ${Math.abs(C)}`;
    const roots   = [...new Set([p, q])].sort((a, b) => a - b);
    const ansStr  = roots.join(' va ');
    return { question: `x²${bStr}${cStr} = 0\nx = ?`, answer: ansStr, category: 'Kvadrat tenglama', isText: true };
  }

  if (type === 2) {
    // Percentage change
    const principal = rnd(1, 20) * 100;
    const rate  = [5, 10, 15, 20, 25][rnd(0, 4)];
    const isUp  = Math.random() < 0.5;
    const result = Math.round(principal * (isUp ? (1 + rate / 100) : (1 - rate / 100)));
    return {
      question: `${principal} so'm ${rate}% ${isUp ? 'oshirildi' : 'kamaytirildi'}.\nNatija = ?`,
      answer: result,
      category: 'Foizli o\'zgarish',
    };
  }

  if (type === 3) {
    // 2×2 system: x + y = S, x − y = D  →  x = ?
    const x = rnd(-10, 10), y = rnd(-10, 10);
    return {
      question: `x + y = ${x + y}\nx − y = ${x - y}\nx = ?`,
      answer: x,
      category: 'Tenglamalar sistemasi',
    };
  }

  // Arithmetic sequence nth term
  const a0 = rnd(-5, 20), d = rnd(1, 9) * (Math.random() < 0.5 ? 1 : -1);
  const n   = rnd(6, 12);
  const seq = Array.from({ length: 4 }, (_, i) => a0 + i * d);
  return {
    question: `Ketma-ketlik: ${seq.join(', ')}, ...\n${n}-had = ?`,
    answer: a0 + (n - 1) * d,
    category: 'Arifmetik ketma-ketlik',
  };
}

function generateQuestion(diffKey) {
  if (diffKey === 'easy')   return genEasy();
  if (diffKey === 'medium') return genMedium();
  return genHard();
}

// ── Distractor builder ────────────────────────────────────────────────────────

/**
 * Build 3 plausible wrong numeric answers near `answer`.
 */
function buildDistractors(answer, diffKey) {
  const spread = diffKey === 'easy' ? rnd(1, 8) : diffKey === 'medium' ? rnd(1, 15) : rnd(1, 10);
  const used   = new Set([answer]);
  const result = [];
  const offsets = [spread, -spread, spread * 2, -spread * 2, spread * 3, -spread * 3, 1, -1, 2, -2];

  for (const off of offsets) {
    if (result.length >= 3) break;
    const v = answer + off;
    if (!used.has(v)) { used.add(v); result.push(v); }
  }
  while (result.length < 3) {
    const v = answer + rnd(1, spread * 2) * (Math.random() < 0.5 ? 1 : -1);
    if (!used.has(v)) { used.add(v); result.push(v); }
  }
  return result;
}

/**
 * Build text-answer distractors for fraction / quadratic results.
 */
function buildTextDistractors(q) {
  const correctStr = String(q.answer);

  if (q.category === 'Kasrlar' && typeof q.answerNum === 'number') {
    const an = q.answerNum;
    const dStr  = correctStr.includes('/') ? correctStr.split('/')[1] : '1';
    const denom = parseInt(dStr, 10) || 1;
    const alts  = [];
    for (const off of [-1, 1, 2, -2]) {
      const num2 = Math.round((an + off / denom) * denom);
      if (num2 <= 0) continue;
      const g2 = gcd(num2, denom);
      const s  = g2 === denom ? `${num2 / g2}` : `${num2 / g2}/${denom / g2}`;
      if (s !== correctStr) alts.push(s);
    }
    return alts.slice(0, 3);
  }

  // Quadratic roots: shift each root by ±1
  const parts = correctStr.split(' va ');
  const alts  = [
    parts.map(p => String(parseInt(p) + 1)).join(' va '),
    parts.map(p => String(parseInt(p) - 1)).join(' va '),
    [...parts].reverse().join(' va '),
  ].filter((s, i, arr) => arr.indexOf(s) === i && s !== correctStr);
  return alts.slice(0, 3);
}

// ── Main init ─────────────────────────────────────────────────────────────────

export function initCountingGame(root) {
  root.innerHTML = `
    <div class="row" style="justify-content:space-between;align-items:flex-end;flex-wrap:wrap;gap:8px">
      <div>
        <h2 style="margin:0">🧮 Matematik Musobaqa</h2>
        <p class="lead" style="margin:6px 0 0">Misolni yeching. Tez va to'g'ri javob = ko'proq ball!</p>
      </div>
      <div class="row" style="gap:8px;flex-wrap:wrap">
        <select id="cntDiff" aria-label="Qiyinlik darajasi" style="min-width:160px">
          <option value="easy" style="color:black">Oson</option>
          <option value="medium" style="color:black" selected>O'rtacha</option>
          <option value="hard" style="color:black">Qiyin</option>
        </select>
        <button class="btn secondary" id="cntNew" type="button">🔁 Yangi o'yin</button>
      </div>
    </div>

    <div class="row" style="margin-top:12px;flex-wrap:wrap;gap:8px">
      <div class="kpi" aria-live="polite"><span>🏁</span><b id="cntRound">–/${TOTAL_ROUNDS}</b></div>
      <div class="kpi" aria-live="polite"><span>✅</span><b id="cntCorrect">0</b></div>
      <div class="kpi" aria-live="polite"><span>🔥</span><b id="cntStreak">0</b></div>
      <div class="kpi" aria-live="polite"><span>⭐</span><b id="cntScore">0</b></div>
    </div>

    <div class="quiz-timer-wrap" style="margin-top:10px">
      <div class="quiz-timer-bar"><div class="quiz-timer-fill" id="cntTimerFill" style="background:rgba(255,255,255,0.12)"></div></div>
      <span class="quiz-timer-num" id="cntTimerNum">–</span>
    </div>

    <div class="quiz-controls row" id="cntControls" style="margin-top:12px;gap:8px">
      <button class="btn" id="cntPlayBtn" type="button">▶ Boshlash</button>
      <button class="btn secondary" id="cntPauseBtn" type="button" style="display:none">⏸ Pauza</button>
      <button class="btn secondary" id="cntEndBtn"   type="button" style="display:none">⏹ Yakunlash</button>
    </div>

    <div id="cntStatus" class="lead" aria-live="polite" style="margin-top:8px;min-height:26px"></div>

    <div class="quiz-card cnt-math-card" style="margin-top:12px">
      <div class="quiz-type-badge" id="cntCategoryBadge">🧮 Matematik Musobaqa</div>
      <div class="cnt-math-expr" id="cntMathExpr">O'yinni boshlash uchun ▶ Boshlash tugmasini bosing.</div>
    </div>

    <div class="cnt-choices" id="cntChoices" style="margin-top:16px" aria-label="Javob tanlang"></div>
  `;

  const roundEl     = root.querySelector('#cntRound');
  const correctEl   = root.querySelector('#cntCorrect');
  const streakEl    = root.querySelector('#cntStreak');
  const scoreEl     = root.querySelector('#cntScore');
  const statusEl    = root.querySelector('#cntStatus');
  const exprEl      = root.querySelector('#cntMathExpr');
  const badgeEl     = root.querySelector('#cntCategoryBadge');
  const choicesEl   = root.querySelector('#cntChoices');
  const timerFillEl = root.querySelector('#cntTimerFill');
  const timerNumEl  = root.querySelector('#cntTimerNum');
  const newBtn      = root.querySelector('#cntNew');
  const diffSelect  = root.querySelector('#cntDiff');
  const playBtn     = root.querySelector('#cntPlayBtn');
  const pauseBtn    = root.querySelector('#cntPauseBtn');
  const endBtn      = root.querySelector('#cntEndBtn');

  /** @type {'idle'|'playing'|'paused'|'finished'} */
  let gameState      = 'idle';
  let currentIndex   = 0;
  let correctCount   = 0;
  let totalScore     = 0;
  let streak         = 0;
  let answered       = false;
  let timerRaf       = 0;
  let timerStart     = 0;
  let timerRemaining = 0;
  let pendingExpire  = null;
  let nextRoundTimer = 0;
  let timeLimit      = 15;
  let currentQ       = null;

  // ── helpers ─────────────────────────────────────────────────────────────────

  function setStatus(msg, color = '') {
    if (statusEl) { statusEl.textContent = msg; statusEl.style.color = color; }
  }

  function updateKpi() {
    if (roundEl)   roundEl.textContent   = `${Math.min(currentIndex + 1, TOTAL_ROUNDS)}/${TOTAL_ROUNDS}`;
    if (correctEl) correctEl.textContent = String(correctCount);
    if (streakEl)  streakEl.textContent  = streak >= 3 ? `${streak} 🔥` : String(streak);
    if (scoreEl)   scoreEl.textContent   = String(totalScore);
  }

  function updateControls() {
    if (!playBtn || !pauseBtn || !endBtn) return;
    if (gameState === 'idle') {
      playBtn.textContent    = '▶ Boshlash';
      playBtn.style.display  = '';
      pauseBtn.style.display = 'none';
      endBtn.style.display   = 'none';
    } else if (gameState === 'playing') {
      playBtn.style.display  = 'none';
      pauseBtn.style.display = '';
      endBtn.style.display   = '';
    } else if (gameState === 'paused') {
      playBtn.textContent    = '▶ Davom ettirish';
      playBtn.style.display  = '';
      pauseBtn.style.display = 'none';
      endBtn.style.display   = '';
    } else { // finished
      playBtn.textContent    = '▶ Qayta o\'ynash';
      playBtn.style.display  = '';
      pauseBtn.style.display = 'none';
      endBtn.style.display   = 'none';
    }
  }

  function stopTimer() {
    if (timerRaf) { cancelAnimationFrame(timerRaf); timerRaf = 0; }
  }

  function startTimerFrom(remaining, onExpire) {
    pendingExpire  = onExpire;
    timerStart     = performance.now();
    timerRemaining = remaining;
    function tick() {
      const elapsed = (performance.now() - timerStart) / 1000;
      const left    = Math.max(0, remaining - elapsed);
      const pct     = (left / timeLimit) * 100;
      if (timerFillEl) {
        timerFillEl.style.width      = `${pct}%`;
        timerFillEl.style.background = pct > 50 ? '#6df2c2' : pct > 25 ? '#ffd166' : '#ff6464';
      }
      if (timerNumEl) timerNumEl.textContent = left.toFixed(1) + 's';
      if (left <= 0) { pendingExpire = null; onExpire(); return; }
      timerRaf = requestAnimationFrame(tick);
    }
    timerRaf = requestAnimationFrame(tick);
  }

  function scheduleNextRound(delay) {
    nextRoundTimer = setTimeout(() => { nextRoundTimer = 0; nextRound(); }, delay);
  }

  // ── state transitions ─────────────────────────────────────────────────────

  function pauseGame() {
    if (gameState !== 'playing') return;
    gameState = 'paused';
    const elapsed  = (performance.now() - timerStart) / 1000;
    timerRemaining = Math.max(0, timeLimit - elapsed);
    stopTimer();
    clearTimeout(nextRoundTimer); nextRoundTimer = 0;
    updateControls();
    setStatus('⏸ Pauza.  Davom ettirish uchun ▶ tugmasini bosing.', '#ffd166');
  }

  function resumeGame() {
    if (gameState !== 'paused') return;
    gameState = 'playing';
    updateControls();
    setStatus('');
    if (!answered && pendingExpire) {
      startTimerFrom(timerRemaining, pendingExpire);
    } else if (answered) {
      scheduleNextRound(800);
    }
  }

  function endGame() {
    if (gameState === 'idle' || gameState === 'finished') return;
    stopTimer();
    clearTimeout(nextRoundTimer); nextRoundTimer = 0;
    gameState = 'finished';
    finishGame();
  }

  function resetToIdle() {
    stopTimer();
    clearTimeout(nextRoundTimer); nextRoundTimer = 0;
    gameState      = 'idle';
    currentIndex   = 0;
    correctCount   = 0;
    totalScore     = 0;
    streak         = 0;
    answered       = false;
    pendingExpire  = null;
    timerRemaining = 0;
    currentQ       = null;
    if (timerFillEl) { timerFillEl.style.width = '0%'; timerFillEl.style.background = 'rgba(255,255,255,0.12)'; }
    if (timerNumEl)  timerNumEl.textContent  = '–';
    if (roundEl)     roundEl.textContent     = `–/${TOTAL_ROUNDS}`;
    if (correctEl)   correctEl.textContent   = '0';
    if (streakEl)    streakEl.textContent     = '0';
    if (scoreEl)     scoreEl.textContent     = '0';
    if (choicesEl)   choicesEl.innerHTML     = '';
    if (badgeEl)     badgeEl.textContent     = '🧮 Matematik Musobaqa';
    if (exprEl)      exprEl.textContent      = 'O\'yinni boshlash uchun ▶ Boshlash tugmasini bosing.';
    setStatus('');
    updateControls();
  }

  function startFreshGame() {
    stopTimer();
    clearTimeout(nextRoundTimer); nextRoundTimer = 0;
    currentIndex   = 0;
    correctCount   = 0;
    totalScore     = 0;
    streak         = 0;
    answered       = false;
    pendingExpire  = null;
    currentQ       = null;
    gameState      = 'playing';
    updateControls();
    showRound();
  }

  // ── round logic ──────────────────────────────────────────────────────────────

  function handleAnswer(opt, q, diffKey) {
    if (answered || gameState !== 'playing') return;
    answered = true;
    stopTimer();
    const elapsed    = (performance.now() - timerStart) / 1000;
    const usedTime   = Math.min(elapsed, timeLimit);
    const correctStr = String(q.answer);

    choicesEl?.querySelectorAll('.cnt-choice-btn').forEach((b) => {
      /** @type {HTMLButtonElement} */ (b).disabled = true;
      if (b.textContent === correctStr) b.classList.add('abc-correct');
    });

    if (String(opt) === correctStr) {
      const mult    = streakMultiplier(streak);
      const basePts = DIFFICULTY_CONFIG[diffKey].baseScore;
      const timePts = Math.round(Math.max(0, (timeLimit - usedTime) / timeLimit) * basePts * 0.6);
      const pts     = Math.round((basePts * 0.4 + timePts) * mult);
      totalScore   += pts;
      correctCount++;
      streak++;
      choicesEl?.querySelector(`[data-opt="${CSS.escape(String(opt))}"]`)?.classList.add('abc-correct');
      const tag = mult > 1 ? ` (×${mult} streak bonus!)` : '';
      setStatus(`To'g'ri! 🎉  +${pts} ball${tag}`, '#6df2c2');
      audio.playSfx('flip');
    } else {
      choicesEl?.querySelector(`[data-opt="${CSS.escape(String(opt))}"]`)?.classList.add('abc-wrong');
      streak = 0;
      setStatus(`Noto'g'ri 😔   To'g'ri javob: ${correctStr}`, '#ff8080');
    }

    updateKpi();
    scheduleNextRound(1400);
  }

  function showRound() {
    if (gameState !== 'playing') return;
    answered = false;
    stopTimer();

    const diffKey = diffSelect?.value || 'medium';
    timeLimit = DIFFICULTY_CONFIG[diffKey].timeLimit;
    currentQ  = generateQuestion(diffKey);
    const q   = currentQ;

    if (exprEl)  exprEl.textContent  = q.question;
    if (badgeEl) badgeEl.textContent = q.category;
    setStatus('');
    updateKpi();

    if (!choicesEl) return;
    choicesEl.innerHTML = '';

    const correctStr = String(q.answer);
    let   options;

    if (q.isText) {
      const alts = buildTextDistractors(q);
      while (alts.length < 3) alts.push(alts[0] ?? '?');
      options = shuffle([correctStr, ...alts.slice(0, 3)]);
    } else {
      const distractors = buildDistractors(/** @type {number} */(q.answer), diffKey);
      options = shuffle([correctStr, ...distractors.map(String)]);
    }

    for (const opt of options) {
      const btn = document.createElement('button');
      btn.type        = 'button';
      btn.className   = 'cnt-choice-btn large';
      btn.textContent = opt;
      btn.dataset.opt = opt;
      btn.setAttribute('aria-label', `Javob: ${opt}`);
      btn.addEventListener('click', () => handleAnswer(opt, q, diffKey));
      choicesEl.appendChild(btn);
    }

    startTimerFrom(timeLimit, () => {
      if (answered || gameState !== 'playing') return;
      answered = true;
      streak = 0;
      choicesEl.querySelectorAll('.cnt-choice-btn').forEach((b) => {
        /** @type {HTMLButtonElement} */ (b).disabled = true;
        if (b.textContent === correctStr) b.classList.add('abc-correct');
      });
      if (timerFillEl) timerFillEl.style.width = '0%';
      if (timerNumEl)  timerNumEl.textContent  = '0.0s';
      setStatus(`⏱️ Vaqt tugadi!  To'g'ri: ${correctStr}`, '#ffd166');
      updateKpi();
      scheduleNextRound(1600);
    });
  }

  function nextRound() {
    if (gameState !== 'playing') return;
    currentIndex++;
    if (currentIndex >= TOTAL_ROUNDS) finishGame();
    else showRound();
  }

  function finishGame() {
    stopTimer();
    gameState = 'finished';
    if (choicesEl)   choicesEl.innerHTML     = '';
    if (timerFillEl) timerFillEl.style.width = '0%';
    if (timerNumEl)  timerNumEl.textContent  = '–';
    if (exprEl)      exprEl.textContent      = `${correctCount} / ${TOTAL_ROUNDS} to'g'ri javob`;
    if (badgeEl)     badgeEl.textContent     = '🏆 O\'yin tugadi';
    if (roundEl)     roundEl.textContent     = `${TOTAL_ROUNDS}/${TOTAL_ROUNDS}`;

    const pct   = (correctCount / TOTAL_ROUNDS) * 100;
    const grade = pct >= 87 ? 'A+' : pct >= 73 ? 'A' : pct >= 60 ? 'B' : pct >= 47 ? 'C' : 'D';
    setStatus(`Bahoyingiz: ${grade}  |  Jami ball: ${totalScore}.  Reytingga saqlandi! 🎊`, '#ffd166');
    confettiBurst({ count: correctCount >= 10 ? 60 : 30 });
    if (correctCount >= 10) audio.celebrate();
    addScore('counting', totalScore, { detail: `${correctCount}/${TOTAL_ROUNDS} • ${diffSelect?.value || 'medium'}` });
    updateControls();
  }

  // ── event wiring ──────────────────────────────────────────────────────────

  playBtn?.addEventListener('click', () => {
    if (gameState === 'paused') resumeGame();
    else startFreshGame();
  });
  pauseBtn?.addEventListener('click', pauseGame);
  endBtn?.addEventListener('click', endGame);
  diffSelect?.addEventListener('change', resetToIdle);
  newBtn?.addEventListener('click', resetToIdle);

  // Start in idle — show controls only
  updateControls();
}
