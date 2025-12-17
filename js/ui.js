/** UI helpers (small, dependency-free). */

export function confettiBurst({ count = 32 } = {}) {
  const root = document.createElement('div');
  root.className = 'confetti';
  const colors = ['#6df2c2', '#7bb7ff', '#ffd86d', '#ff6b8b', '#b79cff'];

  for (let i = 0; i < count; i++) {
    const piece = document.createElement('i');
    const left = Math.random() * 100;
    const delay = Math.random() * 140;
    const duration = 900 + Math.random() * 700;
    piece.style.left = `${left}vw`;
    piece.style.background = colors[i % colors.length];
    piece.style.animationDelay = `${delay}ms`;
    piece.style.animationDuration = `${duration}ms`;
    root.appendChild(piece);
  }

  document.body.appendChild(root);
  setTimeout(() => root.remove(), 1800);
}

export function formatDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' });
  } catch {
    return '';
  }
}
