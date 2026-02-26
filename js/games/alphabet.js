import { audio } from '../audio.js';
import { addScore } from '../score.js';
import { confettiBurst } from '../ui.js';

/**
 * Vocabulary Quiz — A2 → C1 darajali ingliz so'zlari.
 * 12–18 yoshlilar uchun  |  3 qiyinlik  |  streak multiplier  |  countdown timer
 */

const VOCAB = {
  easy: [
    { word: 'Ambiguous',   meaning: 'Ikki ma\'noli, noaniq',                    synonym: 'Vague' },
    { word: 'Brisk',       meaning: 'Tetik, jonli, tez',                         synonym: 'Lively' },
    { word: 'Candid',      meaning: 'Ochiq-oydin, samimiy, to\'g\'riso\'z',      synonym: 'Frank' },
    { word: 'Conceal',     meaning: 'Yashirmoq, berkitmoq',                      synonym: 'Hide' },
    { word: 'Diligent',    meaning: 'Tirishqoq, mehnatsevar',                    synonym: 'Hardworking' },
    { word: 'Earnest',     meaning: 'Jiddiy, samimiy, chin dildan',              synonym: 'Sincere' },
    { word: 'Elaborate',   meaning: 'Batafsil; murakkab tarzda ishlab chiqilgan', synonym: 'Detailed' },
    { word: 'Frugal',      meaning: 'Tejamkor, isrofgar bo\'lmagan',             synonym: 'Thrifty' },
    { word: 'Gloomy',      meaning: 'G\'amgin, tushkun, qorong\'u',              synonym: 'Bleak' },
    { word: 'Hasty',       meaning: 'Shoshqaloq, o\'ylamasdan qilingan',         synonym: 'Rash' },
    { word: 'Immense',     meaning: 'Ulkan, bepoyon, katta',                     synonym: 'Vast' },
    { word: 'Jovial',      meaning: 'Xushchaqchaq, shod-xurram',                synonym: 'Cheerful' },
    { word: 'Keen',        meaning: 'Kuchli qiziqish; o\'tkir, ziyrak',          synonym: 'Eager' },
    { word: 'Lenient',     meaning: 'Yumshoq munosabatdagi, bag\'rikeng',        synonym: 'Mild' },
    { word: 'Lofty',       meaning: 'Baland, ulug\'vor, mag\'rur',               synonym: 'Noble' },
    { word: 'Meticulous',  meaning: 'Nihoyatda ehtiyotkor, puxta',              synonym: 'Careful' },
    { word: 'Mundane',     meaning: 'Oddiy, kundalik, qiziqarli bo\'lmagan',     synonym: 'Ordinary' },
    { word: 'Novice',      meaning: 'Yangi boshlovchi, tajribasiz kishi',        synonym: 'Beginner' },
    { word: 'Obscure',     meaning: 'Noma\'lum, tushunarsiz, qorong\'u',         synonym: 'Unclear' },
    { word: 'Prudent',     meaning: 'Aqlli, ehtiyotkor, hushyor',               synonym: 'Wise' },
    { word: 'Resilient',   meaning: 'Bardoshli, qiyinchilikdan tez tiklanuvchi', synonym: 'Tough' },
    { word: 'Serene',      meaning: 'Tinch, sokin, xotirjam',                   synonym: 'Calm' },
    { word: 'Skeptical',   meaning: 'Shubhachi, ishonmaydigan',                 synonym: 'Doubtful' },
    { word: 'Tenacious',   meaning: 'Qat\'iyatli, maqsadiga erishishda qaysar', synonym: 'Persistent' },
    { word: 'Vivid',       meaning: 'Yorqin, ravshan, jonli tasvirli',           synonym: 'Bright' },
  ],
  medium: [
    { word: 'Aberration',  meaning: 'Odatdan chetlash; anomaliya',              synonym: 'Deviation' },
    { word: 'Astute',      meaning: 'Ziyrak, ayyorona aqlli, zukko',            synonym: 'Shrewd' },
    { word: 'Benevolent',  meaning: 'Xayrixoh, odamlarga yaxshilik istovchi',   synonym: 'Kind' },
    { word: 'Complacent',  meaning: 'O\'z-o\'zidan mamnun, beparvo',            synonym: 'Self-satisfied' },
    { word: 'Daunting',    meaning: 'Qo\'rqituvchi, ruhiy jihatdan bosuvchi',   synonym: 'Intimidating' },
    { word: 'Disparate',   meaning: 'Bir-biridan juda farqli, mos kelmaydigan', synonym: 'Dissimilar' },
    { word: 'Egregious',   meaning: 'Yaqqol ko\'rinadigan darajada yomon',      synonym: 'Flagrant' },
    { word: 'Exacerbate',  meaning: 'Yomonlashtirmoq, og\'irlashtirmoq',        synonym: 'Worsen' },
    { word: 'Fervent',     meaning: 'Qizg\'in, ishtiyoqli, yurakdan',           synonym: 'Passionate' },
    { word: 'Gratuitous',  meaning: 'Asossiz, kerak bo\'lmagan',                synonym: 'Unwarranted' },
    { word: 'Harbinger',   meaning: 'Biror voqeaning oldindan belgisi yoki xabarchisi', synonym: 'Omen' },
    { word: 'Indolent',    meaning: 'Dangasa, harakatsiz, befarq',              synonym: 'Lazy' },
    { word: 'Intrepid',    meaning: 'Jasur, qo\'rqmas, dadil',                  synonym: 'Fearless' },
    { word: 'Jeopardize',  meaning: 'Xavf ostiga qo\'ymoq',                     synonym: 'Endanger' },
    { word: 'Lament',      meaning: 'Qayg\'urmoq, motam tutmoq, nola qilmoq',  synonym: 'Mourn' },
    { word: 'Malevolent',  meaning: 'Yovuz niyatli, boshqalarga zarar istovchi', synonym: 'Sinister' },
    { word: 'Nefarious',   meaning: 'Jinoyatkor, yovuz, axloqsiz',              synonym: 'Wicked' },
    { word: 'Ominous',     meaning: 'Yomon alomatli, xavfni sezdiradigan',      synonym: 'Threatening' },
    { word: 'Pragmatic',   meaning: 'Amaliy, nazariyadan ko\'ra amaliyotga asoslanuvchi', synonym: 'Practical' },
    { word: 'Quandary',    meaning: 'Qiyin vaziyat, ikkilanish, chigallik',     synonym: 'Dilemma' },
    { word: 'Reclusive',   meaning: 'Yakkalanib, odamlardan uzoqda yashovchi',  synonym: 'Solitary' },
    { word: 'Sagacious',   meaning: 'Donishmand, chuqur tafakkurli, aqlli',    synonym: 'Wise' },
    { word: 'Spurious',    meaning: 'Soxta, yolg\'on, haqiqiy emas',            synonym: 'Fake' },
    { word: 'Tepid',       meaning: 'Iliq (hissiz); loqayd, unchalik qiziqmaslik', synonym: 'Lukewarm' },
    { word: 'Voluble',     meaning: 'Ko\'p va ravon gapiruvchi, so\'zamol',      synonym: 'Talkative' },
  ],
  hard: [
    { word: 'Acrimony',     meaning: 'Achchiq munosabat, nafrat, keskin dushmanlik', synonym: 'Bitterness' },
    { word: 'Belligerent',  meaning: 'Jangari, tajovuzkor, urushqoq',           synonym: 'Aggressive' },
    { word: 'Capricious',   meaning: 'Kayfiyati tez-tez o\'zgaruvchi, bema\'ni', synonym: 'Fickle' },
    { word: 'Deleterious',  meaning: 'Zararli, sog\'likka zarar yetkazuvchi',   synonym: 'Harmful' },
    { word: 'Ephemeral',    meaning: 'O\'tkinchi, qisqa umrli, tez yo\'qoluvchi', synonym: 'Transient' },
    { word: 'Fastidious',   meaning: 'Juda tanlovchan, mayda-chuyda narsalarga e\'tibor beruvchi', synonym: 'Picky' },
    { word: 'Garrulous',    meaning: 'Ko\'p va keraksiz gapiruvchi, bo\'sh gapiradigan', synonym: 'Loquacious' },
    { word: 'Hegemony',     meaning: 'Biror davlatning boshqalar ustidan hukmronligi', synonym: 'Dominance' },
    { word: 'Iconoclast',   meaning: 'An\'anaviy qarash va e\'tiqodlarni rad etuvchi shaxs', synonym: 'Rebel' },
    { word: 'Juxtapose',    meaning: 'Ikkita narsani taqqoslash uchun yon-yonga qo\'ymoq', synonym: 'Compare' },
    { word: 'Laconic',      meaning: 'Kam so\'zli, qisqa va lo\'nda gapiruvchi', synonym: 'Terse' },
    { word: 'Mendacious',   meaning: 'Yolg\'onchi, aldovchi',                   synonym: 'Dishonest' },
    { word: 'Obfuscate',    meaning: 'Biror narsani ataylab murakkablashtirish, chalg\'itmoq', synonym: 'Confuse' },
    { word: 'Pellucid',     meaning: 'Kristalday tiniq; juda aniq va tushunarli', synonym: 'Clear' },
    { word: 'Perfidious',   meaning: 'Xoinlik qiluvchi, sotqin, ishonchsiz',    synonym: 'Treacherous' },
    { word: 'Pernicious',   meaning: 'Asta-sekin katta zarar keltiradigan, halokatli', synonym: 'Destructive' },
    { word: 'Pugnacious',   meaning: 'Jangga moyil, mushtlashishni yoqtiruvchi', synonym: 'Combative' },
    { word: 'Querulous',    meaning: 'Doim noluvchi, shikoyatchi, g\'ijimsiq',  synonym: 'Whiny' },
    { word: 'Recalcitrant', meaning: 'Itoatsiz, qaysar, boshqarib bo\'lmaydigan', synonym: 'Defiant' },
    { word: 'Sycophant',    meaning: 'Xushomadgo\'y, manfaat uchun yolg\'on maqtovchi', synonym: 'Flatterer' },
    { word: 'Taciturn',     meaning: 'Jim, kam gapiradigan, so\'zsiz bo\'lishni yoqtiruvchi', synonym: 'Reserved' },
    { word: 'Umbrage',      meaning: 'Xafa bo\'lish, ranjish, g\'azab',          synonym: 'Offense' },
    { word: 'Vicarious',    meaning: 'Boshqa birovning tajribasi orqali his qilish', synonym: 'Indirect' },
    { word: 'Vociferous',   meaning: 'Baland ovozda e\'tiroz bildiradigan',      synonym: 'Clamorous' },
    { word: 'Whimsical',    meaning: 'Kayfiyatga qarab o\'zgaruvchan, g\'alati',  synonym: 'Fanciful' },
  ],
};

const DIFFICULTY_CONFIG = {
  easy:   { label: 'Oson (A2)',      timeLimit: 20, baseScore: 100 },
  medium: { label: 'O\'rtacha (B2)', timeLimit: 15, baseScore: 150 },
  hard:   { label: 'Qiyin (C1)',     timeLimit: 12, baseScore: 200 },
};

const TOTAL_ROUNDS = 15;

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function streakMultiplier(streak) {
  if (streak >= 7) return 3.0;
  if (streak >= 5) return 2.0;
  if (streak >= 3) return 1.5;
  return 1.0;
}

/**
 * Build one question object based on difficulty.
 *  easy   → English word → choose Uzbek meaning
 *  medium → alternates direction each round
 *  hard   → synonym matching only
 */
function buildQuestion(pool, diffKey, index) {
  const correct = pool[index % pool.length];
  const others  = shuffle(pool.filter(w => w.word !== correct.word)).slice(0, 3);

  if (diffKey === 'hard') {
    return {
      questionText:  `"${correct.word}" so'zining yaqin ma'nodoshi (sinonim) qaysi?`,
      options:        shuffle([correct.synonym, ...others.map(o => o.synonym)]),
      correctAnswer:  correct.synonym,
      word:           correct.word,
      meaning:        correct.meaning,
      type:           'Sinonim toping',
    };
  }

  if (diffKey === 'medium' && index % 2 === 1) {
    return {
      questionText:  `Ta'rif: "${correct.meaning}"`,
      options:        shuffle([correct.word, ...others.map(o => o.word)]),
      correctAnswer:  correct.word,
      word:           correct.word,
      meaning:        correct.meaning,
      type:           'Ta\'rifdan so\'zni toping',
    };
  }

  return {
    questionText:  `"${correct.word}" so'zining o'zbekcha ma'nosi?`,
    options:        shuffle([correct.meaning, ...others.map(o => o.meaning)]),
    correctAnswer:  correct.meaning,
    word:           correct.word,
    meaning:        correct.meaning,
    type:           'Ma\'nosini toping',
  };
}

export function initAlphabetGame(root) {
  root.innerHTML = `
    <div class="row" style="justify-content:space-between;align-items:flex-end;flex-wrap:wrap;gap:8px">
      <div>
        <h2 style="margin:0">📚 Ingliz Lug'ati</h2>
        <p class="lead" style="margin:6px 0 0">So'z ma'nosi va sinonimlari. Tez javob = ko'proq ball!</p>
      </div>
      <div class="row" style="gap:8px;flex-wrap:wrap">
        <select id="abcDiff" aria-label="Qiyinlik darajasi" style="min-width:160px">
          <option value="easy" style="color:black">Oson (A2)</option>
          <option value="medium" style="color:black" selected>O'rtacha (B2)</option>
          <option value="hard" style="color:black">Qiyin (C1)</option>
        </select>
        <button class="btn secondary" id="abcNew" type="button">🔁 Yangi o'yin</button>
      </div>
    </div>

    <div class="row" style="margin-top:12px;flex-wrap:wrap;gap:8px">
      <div class="kpi" aria-live="polite"><span>🏁</span><b id="abcRound">–/${TOTAL_ROUNDS}</b></div>
      <div class="kpi" aria-live="polite"><span>✅</span><b id="abcCorrect">0</b></div>
      <div class="kpi" aria-live="polite"><span>🔥</span><b id="abcStreak">0</b></div>
      <div class="kpi" aria-live="polite"><span>⭐</span><b id="abcScore">0</b></div>
    </div>

    <div class="quiz-timer-wrap" style="margin-top:10px">
      <div class="quiz-timer-bar"><div class="quiz-timer-fill" id="abcTimerFill" style="background:rgba(255,255,255,0.12)"></div></div>
      <span class="quiz-timer-num" id="abcTimerNum">–</span>
    </div>

    <div class="quiz-controls row" id="abcControls" style="margin-top:12px;gap:8px">
      <button class="btn" id="abcPlayBtn" type="button">▶ Boshlash</button>
      <button class="btn secondary" id="abcPauseBtn" type="button" style="display:none">⏸ Pauza</button>
      <button class="btn secondary" id="abcEndBtn"   type="button" style="display:none">⏹ Yakunlash</button>
    </div>

    <div id="abcStatus" class="lead" aria-live="polite" style="margin-top:8px;min-height:26px"></div>

    <div class="quiz-card" style="margin-top:12px">
      <div class="quiz-type-badge" id="abcQTypeBadge">📚 Ingliz Lug'ati</div>
      <div class="quiz-main-text" id="abcMainText">O'yinni boshlash uchun ▶ Boshlash tugmasini bosing.</div>
    </div>

    <div class="abc-choices" id="abcChoices" style="margin-top:16px" aria-label="Javob tanlang"></div>

    <div id="abcExplain" class="quiz-explain" style="display:none;margin-top:12px"></div>
  `;

  const roundEl     = root.querySelector('#abcRound');
  const correctEl   = root.querySelector('#abcCorrect');
  const streakEl    = root.querySelector('#abcStreak');
  const scoreEl     = root.querySelector('#abcScore');
  const statusEl    = root.querySelector('#abcStatus');
  const mainTextEl  = root.querySelector('#abcMainText');
  const qTypeBadge  = root.querySelector('#abcQTypeBadge');
  const choicesEl   = root.querySelector('#abcChoices');
  const explainEl   = root.querySelector('#abcExplain');
  const timerFillEl = root.querySelector('#abcTimerFill');
  const timerNumEl  = root.querySelector('#abcTimerNum');
  const newBtn      = root.querySelector('#abcNew');
  const diffSelect  = root.querySelector('#abcDiff');
  const playBtn     = root.querySelector('#abcPlayBtn');
  const pauseBtn    = root.querySelector('#abcPauseBtn');
  const endBtn      = root.querySelector('#abcEndBtn');

  /** @type {'idle'|'playing'|'paused'|'finished'} */
  let gameState      = 'idle';
  let pool           = [];
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

  // ── helpers ───────────────────────────────────────────────────────────────

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
    pool           = [];
    currentIndex   = 0;
    correctCount   = 0;
    totalScore     = 0;
    streak         = 0;
    answered       = false;
    pendingExpire  = null;
    timerRemaining = 0;
    if (timerFillEl) { timerFillEl.style.width = '0%'; timerFillEl.style.background = 'rgba(255,255,255,0.12)'; }
    if (timerNumEl)  timerNumEl.textContent  = '–';
    if (roundEl)     roundEl.textContent     = `–/${TOTAL_ROUNDS}`;
    if (correctEl)   correctEl.textContent   = '0';
    if (streakEl)    streakEl.textContent     = '0';
    if (scoreEl)     scoreEl.textContent     = '0';
    if (choicesEl)   choicesEl.innerHTML     = '';
    if (explainEl)   explainEl.style.display = 'none';
    if (qTypeBadge)  qTypeBadge.textContent  = '📚 Ingliz Lug\'ati';
    if (mainTextEl)  mainTextEl.textContent  = 'O\'yinni boshlash uchun ▶ Boshlash tugmasini bosing.';
    setStatus('');
    updateControls();
  }

  function startFreshGame() {
    stopTimer();
    clearTimeout(nextRoundTimer); nextRoundTimer = 0;
    const diffKey  = diffSelect?.value || 'medium';
    pool           = shuffle([...VOCAB[diffKey]]);
    currentIndex   = 0;
    correctCount   = 0;
    totalScore     = 0;
    streak         = 0;
    answered       = false;
    pendingExpire  = null;
    gameState      = 'playing';
    updateControls();
    showRound();
  }

  // ── round logic ───────────────────────────────────────────────────────────

  function handleAnswer(opt, q, diffKey) {
    if (answered || gameState !== 'playing') return;
    answered = true;
    stopTimer();
    const elapsed  = (performance.now() - timerStart) / 1000;
    const usedTime = Math.min(elapsed, timeLimit);

    choicesEl?.querySelectorAll('.abc-choice-btn').forEach((b) => {
      /** @type {HTMLButtonElement} */ (b).disabled = true;
      if (b.textContent === q.correctAnswer) b.classList.add('abc-correct');
    });

    if (opt === q.correctAnswer) {
      const mult    = streakMultiplier(streak);
      const basePts = DIFFICULTY_CONFIG[diffKey].baseScore;
      const timePts = Math.round(Math.max(0, (timeLimit - usedTime) / timeLimit) * basePts * 0.6);
      const pts     = Math.round((basePts * 0.4 + timePts) * mult);
      totalScore   += pts;
      correctCount++;
      streak++;
      choicesEl?.querySelector(`[data-opt="${CSS.escape(opt)}"]`)?.classList.add('abc-correct');
      const tag = mult > 1 ? ` (×${mult} streak bonus!)` : '';
      setStatus(`To'g'ri! 🎉  +${pts} ball${tag}`, '#6df2c2');
      audio.playSfx('flip');
    } else {
      choicesEl?.querySelector(`[data-opt="${CSS.escape(opt)}"]`)?.classList.add('abc-wrong');
      streak = 0;
      setStatus(`Noto'g'ri 😔   To'g'ri javob: "${q.correctAnswer}"`, '#ff8080');
    }

    if (explainEl) {
      explainEl.textContent   = `📖 ${q.word}  —  ${q.meaning}`;
      explainEl.style.display = 'block';
    }
    updateKpi();
    scheduleNextRound(1500);
  }

  function showRound() {
    if (gameState !== 'playing') return;
    answered = false;
    stopTimer();
    if (explainEl) explainEl.style.display = 'none';

    const diffKey = diffSelect?.value || 'medium';
    timeLimit = DIFFICULTY_CONFIG[diffKey].timeLimit;
    const q   = buildQuestion(pool, diffKey, currentIndex);

    if (qTypeBadge) qTypeBadge.textContent = q.type;
    if (mainTextEl) mainTextEl.textContent  = q.questionText;
    setStatus('');
    updateKpi();

    if (!choicesEl) return;
    choicesEl.innerHTML = '';

    for (const opt of q.options) {
      const btn = document.createElement('button');
      btn.type           = 'button';
      btn.className      = 'abc-choice-btn wide';
      btn.textContent    = opt;
      btn.dataset.opt    = opt;
      btn.setAttribute('aria-label', opt);
      btn.addEventListener('click', () => handleAnswer(opt, q, diffKey));
      choicesEl.appendChild(btn);
    }

    startTimerFrom(timeLimit, () => {
      if (answered || gameState !== 'playing') return;
      answered = true;
      streak = 0;
      choicesEl.querySelectorAll('.abc-choice-btn').forEach((b) => {
        /** @type {HTMLButtonElement} */ (b).disabled = true;
        if (b.textContent === q.correctAnswer) b.classList.add('abc-correct');
      });
      if (timerFillEl) timerFillEl.style.width = '0%';
      if (timerNumEl)  timerNumEl.textContent  = '0.0s';
      setStatus(`⏱️ Vaqt tugadi!  To'g'ri: "${q.correctAnswer}"`, '#ffd166');
      if (explainEl) { explainEl.textContent = `📖 ${q.word}  —  ${q.meaning}`; explainEl.style.display = 'block'; }
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
    if (explainEl)   explainEl.style.display = 'none';
    if (mainTextEl)  mainTextEl.textContent  = `${correctCount} / ${TOTAL_ROUNDS} to'g'ri javob`;
    if (qTypeBadge)  qTypeBadge.textContent  = '🏆 O\'yin tugadi';
    if (roundEl)     roundEl.textContent     = `${TOTAL_ROUNDS}/${TOTAL_ROUNDS}`;

    const pct   = (correctCount / TOTAL_ROUNDS) * 100;
    const grade = pct >= 87 ? 'A+' : pct >= 73 ? 'A' : pct >= 60 ? 'B' : pct >= 47 ? 'C' : 'D';
    setStatus(`Bahoyingiz: ${grade}  |  Jami ball: ${totalScore}.  Reytingga saqlandi! 🎊`, '#ffd166');
    confettiBurst({ count: correctCount >= 10 ? 60 : 30 });
    if (correctCount >= 10) audio.celebrate();
    addScore('alphabet', totalScore, { detail: `${correctCount}/${TOTAL_ROUNDS} • ${diffSelect?.value || 'medium'}` });
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
