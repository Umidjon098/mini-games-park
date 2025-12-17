import { audio } from './audio.js';
import { resetScores } from './score.js';

export function initSettingsPage() {
  const toggleBtn = document.getElementById('toggleMuteBtn');
  const status = document.getElementById('soundStatus');
  const resetBtn = document.getElementById('resetBtn');
  const resetNote = document.getElementById('resetNote');

  const paint = () => {
    const muted = audio.isMuted();
    if (toggleBtn) toggleBtn.textContent = muted ? 'Ovozni yoqish 🔊' : 'Ovozni o‘chirish 🔇';
    if (status) status.textContent = muted ? "Ovoz O‘CHIQ" : 'Ovoz YOQIQ';
  };

  toggleBtn?.addEventListener('click', () => {
    audio.toggleMute();
    paint();
  });

  resetBtn?.addEventListener('click', () => {
    resetScores();
    if (resetNote) {
      resetNote.textContent = 'Ballar tozalandi ✅';
      resetNote.classList.add('pop');
      setTimeout(() => resetNote.classList.remove('pop'), 500);
    }
  });

  paint();
}
