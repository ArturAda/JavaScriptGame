import { key_control } from './control.js';
import { playButtonSound } from './button_sound.js';
import { running } from './game.js';

let currentSort = { key: 'summary', asc: false };

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s =>
        s.classList.toggle('active', s.id === id)
    );
}

async function loadLeaderboard() {
    const res = await fetch('/api/leaderboard');
    const data = await res.json();
    data.sort((a, b) => {
        let v = a[currentSort.key] - b[currentSort.key];
        if (currentSort.key === 'name') {
            v = a.name.localeCompare(b.name);
        }
        if (currentSort.key === 'ts') {
            v = a.ts - b.ts;
        }
        return currentSort.asc ? v : -v;
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
      <td>${new Date(e.ts).toLocaleString()}</td>
    `;
        tbody.appendChild(tr);
    }
}

document.querySelectorAll('#leaderboard th').forEach(th => {
    th.addEventListener('click', () => {
        const key = th.dataset.key;
        if (currentSort.key === key) currentSort.asc = !currentSort.asc;
        else { currentSort.key = key; currentSort.asc = true; }
        loadLeaderboard();
    });
});

document.getElementById('leader-back').addEventListener('click', () => {
    playButtonSound();
    showScreen('screen-main');
});

function endGame(msg = true) {
    if (!running) return;
    running = false;
    cancelAnimationFrame(raf);
    reset();
    if (msg) {
        alert(`Game over!\n\ngrowth_rate: ${growth.toFixed(2)}\nincrease: ${increase.toFixed(2)}\nsummary: ${summary.toFixed(2)}`);
    }
    const name = prompt('Введите ваше имя для таблицы рекордов:', '');
    if (name && name.trim()) {
        fetch('/api/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: name.trim(),
                summary,
                growth_rate: growth,
                increase
            })
        }).then(() => {
            loadLeaderboard();
            showScreen('screen-leaderboard');
        }).catch(console.error);
    } else {
        loadLeaderboard();
        showScreen('screen-leaderboard');
    }
}
