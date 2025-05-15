import { playButtonSound } from './button_sound.js';
import { gameTracks, switchTo } from './music.js';

let currentSort = { key: 'summary', asc: false };

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s =>
        s.classList.toggle('active', s.id === id)
    );
}

export async function submitScoreToServer(score) {
    await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(score)
    });
}

export async function loadLeaderboard() {
    const res = await fetch('/api/leaderboard', {
        headers: { 'X-API-Key': 'Dragon_Bobik' }
    });
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    data.sort((a, b) => {
        if (currentSort.key === 'name') {
            return currentSort.asc
                ? a.name.localeCompare(b.name)
                : b.name.localeCompare(a.name);
        }
        if (currentSort.key === 'ts') {
            return currentSort.asc ? a.ts - b.ts : b.ts - a.ts;
        }
        return currentSort.asc
            ? a[currentSort.key] - b[currentSort.key]
            : b[currentSort.key] - a[currentSort.key];
    });

    const tbody = document.querySelector('#leaderboard tbody');
    tbody.innerHTML = '';
    for (const e of data) {
        const tr = document.createElement('tr');
        tr.innerHTML = `
      <td>${e.name}</td>
      <td>${e.summary.toFixed(2)}</td>
      <td>${e.growth_rate.toFixed(2)}</td>
      <td>${e.increase.toFixed(2)}</td>
    `;
        tbody.appendChild(tr);
    }
}

window.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('#leaderboard th').forEach(th => {
        th.addEventListener('click', () => {
            const key = th.dataset.key;
            if (currentSort.key === key) currentSort.asc = !currentSort.asc;
            else {
                currentSort.key = key;
                currentSort.asc = true;
            }
            loadLeaderboard();
        });
    });
});
