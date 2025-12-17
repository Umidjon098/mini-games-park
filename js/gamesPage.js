import { setupTabs } from './router.js';
import { audio } from './audio.js';
import { initPuzzleGame } from './games/puzzle.js';
import { initMemoryGame } from './games/memory.js';
import { initJumpGame } from './games/jump.js';
import { initMazeGame } from './games/maze.js';

export function initGamesPage() {
  const puzzleRoot = document.getElementById('puzzleRoot');
  const memoryRoot = document.getElementById('memoryRoot');
  const jumpRoot = document.getElementById('jumpRoot');
  const mazeRoot = document.getElementById('mazeRoot');

  const started = new Set();

  function start(gameKey) {
    if (started.has(gameKey)) return;
    started.add(gameKey);

    if (gameKey === 'puzzle' && puzzleRoot) initPuzzleGame(puzzleRoot);
    if (gameKey === 'memory' && memoryRoot) initMemoryGame(memoryRoot);
    if (gameKey === 'jump' && jumpRoot) initJumpGame(jumpRoot);
    if (gameKey === 'maze' && mazeRoot) initMazeGame(mazeRoot);
  }

  setupTabs({
    onTabChanged: (gameKey) => {
      start(gameKey);
      const soundState = document.getElementById('soundState');
      if (soundState) soundState.textContent = audio.isMuted() ? "O‘chiq" : 'Yoqiq';
    },
  });
}
