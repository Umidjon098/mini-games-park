import { getTop } from './score.js';
import { formatDate } from './ui.js';

function gameLabel(game) {
  return ({ puzzle: "Boshqotirma", memory: 'Xotira', jump: 'Sakrash', maze: 'Labirint', alphabet: 'Alifbo', counting: 'Hisoblash' }[game] || game);
}

function renderTable(rows) {
  if (!rows.length) {
    return `<p class="lead">Hali natijalar yo‘q. Avval o‘yin o‘ynang!</p>`;
  }

  const lines = rows
    .map((r, idx) => {
      const meta = r.meta?.detail ? ` • ${String(r.meta.detail)}` : '';
      return `
        <tr>
          <td style="padding:10px 8px; font-weight:900">${idx + 1}</td>
          <td style="padding:10px 8px"><span class="badge">${gameLabel(r.game)}</span></td>
          <td style="padding:10px 8px; font-weight:900">${Math.round(r.score)}</td>
          <td style="padding:10px 8px; color:var(--muted); font-weight:800">${formatDate(r.date)}${meta}</td>
        </tr>`;
    })
    .join('');

  return `
    <div style="overflow:auto">
      <table style="width:100%; border-collapse:collapse">
        <thead>
          <tr style="text-align:left; color:var(--muted)">
            <th style="padding:10px 8px">#</th>
            <th style="padding:10px 8px">O‘yin</th>
            <th style="padding:10px 8px">Ball</th>
            <th style="padding:10px 8px">Sana</th>
          </tr>
        </thead>
        <tbody>${lines}</tbody>
      </table>
    </div>`;
}

export function initLeaderboardPage() {
  const filter = document.getElementById('gameFilter');
  const root = document.getElementById('leaderboardTable');
  if (!filter || !root) return;

  const paint = () => {
    const game = filter.value;
    const rows = getTop(game);
    root.innerHTML = renderTable(rows);
  };

  filter.addEventListener('change', paint);
  paint();
}
