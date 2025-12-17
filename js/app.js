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

  const path = location.pathname.split('/').pop() || 'index.html';

  // Pages by filename (keeps it simple; no SPA routing needed)
  if (path === 'index.html' || path === '') {
    initHomePage();
  }
  if (path === 'games.html') {
    initTabsFromHash();
    initGamesPage();
  }
  if (path === 'leaderboard.html') {
    initLeaderboardPage();
  }
  if (path === 'settings.html') {
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
