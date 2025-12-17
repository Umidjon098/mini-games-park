import { initNav, initTabsFromHash } from './router.js';
import { audio } from './audio.js';
import { initLeaderboardPage } from './leaderboardPage.js';
import { initSettingsPage } from './settingsPage.js';
import { initGamesPage } from './gamesPage.js';
import { initHomePage } from './homePage.js';

/**
 * App entrypoint for all pages.
 * Uses ES modules, fully client-side.
 */

function onReady(fn) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fn, { once: true });
  } else {
    fn();
  }
}

onReady(() => {
  initNav();
  audio.init();

  const raw = location.pathname.split('/').filter(Boolean).pop() || 'index.html';
  const page = raw.toLowerCase();

  // Pages by filename OR pretty URL (Netlify rewrites keep the URL).
  if (page === 'index.html' || page === 'index' || page === '') {
    initHomePage();
  }
  if (page === 'games.html' || page === 'games') {
    initTabsFromHash();
    initGamesPage();
  }
  if (page === 'leaderboard.html' || page === 'leaderboard') {
    initLeaderboardPage();
  }
  if (page === 'settings.html' || page === 'settings') {
    initSettingsPage();
  }

  // Update small sound labels if present
  const muteBadge = document.getElementById('muteBadge');
  if (muteBadge) {
    muteBadge.textContent = audio.isMuted() ? "Ovoz: O‘chiq" : 'Ovoz: Yoqiq';
  }
  const soundState = document.getElementById('soundState');
  if (soundState) {
    soundState.textContent = audio.isMuted() ? "O‘chiq" : 'Yoqiq';
  }
});
