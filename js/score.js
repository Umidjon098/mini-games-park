/**
 * Score & leaderboard management.
 * Stores Top 10 per game in localStorage.
 */

const KEY = 'mgp_scores_v1';

export const GAMES = /** @type {const} */ (['puzzle', 'memory', 'jump', 'maze']);

function nowIso() {
  return new Date().toISOString();
}

function safeParse(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function loadAll() {
  const raw = localStorage.getItem(KEY);
  const parsed = raw ? safeParse(raw) : null;
  const base = { puzzle: [], memory: [], jump: [], maze: [] };
  if (!parsed || typeof parsed !== 'object') return base;
  for (const g of GAMES) {
    if (Array.isArray(parsed[g])) base[g] = parsed[g];
  }
  return base;
}

function saveAll(state) {
  localStorage.setItem(KEY, JSON.stringify(state));
}

/**
 * @typedef {{score:number, date:string, meta?:Record<string, any>}} Entry
 */

export function addScore(game, score, meta = {}) {
  if (!GAMES.includes(game)) throw new Error(`Unknown game: ${game}`);
  const value = Number(score);
  if (!Number.isFinite(value)) return;

  const state = loadAll();
  /** @type {Entry[]} */
  const list = state[game] || [];

  list.push({ score: value, date: nowIso(), meta });
  list.sort((a, b) => b.score - a.score);
  state[game] = list.slice(0, 10);
  saveAll(state);
}

export function getTop(game) {
  const state = loadAll();
  if (game === 'all') {
    const rows = [];
    for (const g of GAMES) {
      for (const e of state[g]) rows.push({ game: g, ...e });
    }
    rows.sort((a, b) => b.score - a.score);
    return rows.slice(0, 10);
  }
  if (!GAMES.includes(game)) throw new Error(`Unknown game: ${game}`);
  return (state[game] || []).map((e) => ({ game, ...e }));
}

export function resetScores() {
  localStorage.removeItem(KEY);
}
