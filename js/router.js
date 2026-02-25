/**
 * Lightweight helpers for multi-page navigation and game tabs.
 */

export function initNav() {
  const file = location.pathname.split('/').pop() || 'index.html';
  const key = file === 'index.html' || file === '' ? 'home' : file.replace('.html', '');

  document.querySelectorAll('[data-nav]').forEach((el) => {
    const k = el.getAttribute('data-nav');
    if (k === key) el.setAttribute('aria-current', 'page');
  });
}

export function initTabsFromHash() {
  const hash = (location.hash || '').replace('#', '').toLowerCase();
  if (!hash) return;

  const btn = document.querySelector(`[data-game-tab="${CSS.escape(hash)}"]`);
  if (btn instanceof HTMLButtonElement) {
    btn.click();
  }
}

export function setupTabs({ onTabChanged }) {
  const tabs = Array.from(document.querySelectorAll('[data-game-tab]'));
  const panels = new Map([
    ['puzzle', document.getElementById('panelPuzzle')],
    ['memory', document.getElementById('panelMemory')],
    ['jump', document.getElementById('panelJump')],
    ['maze', document.getElementById('panelMaze')],
    ['alphabet', document.getElementById('panelAlphabet')],
    ['counting', document.getElementById('panelCounting')],
  ]);

  function select(gameKey) {
    for (const t of tabs) {
      const isActive = t.getAttribute('data-game-tab') === gameKey;
      t.setAttribute('aria-selected', isActive ? 'true' : 'false');
    }
    for (const [k, panel] of panels.entries()) {
      if (!panel) continue;
      panel.hidden = k !== gameKey;
    }
    if (typeof onTabChanged === 'function') onTabChanged(gameKey);

    const url = new URL(location.href);
    url.hash = `#${gameKey}`;
    history.replaceState(null, '', url.toString());
  }

  for (const t of tabs) {
    t.addEventListener('click', () => {
      select(t.getAttribute('data-game-tab'));
    });
  }

  // Default
  const initial = (location.hash || '').replace('#', '') || 'puzzle';
  select(initial);
}
