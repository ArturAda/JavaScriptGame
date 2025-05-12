import { switchTo, gameTracks, isMusicPlaying, setMusicPlaying } from './music.js';
import { key_control } from './control.js';

function show(id) {
    document.querySelectorAll('.screen')
        .forEach(s => s.classList.toggle('active', s.id === id));
}

(function spawnDollars() {
    const f = document.getElementById('dollar-field');
    const add = (n, s1, s2, t1, t2, r1, r2, big) => {
        for (let i = 0; i < n; i++) {
            const d = document.createElement('div');
            d.className = 'dollar' + (big ? ' big' : '');
            const size = s1 + Math.random() * (s2 - s1);
            d.style.width = d.style.height = `${size}vh`;
            d.style.left = `${Math.random() * 100}%`;
            d.style.setProperty('--t', `${t1 + Math.random() * (t2 - t1)}s`);
            d.style.setProperty('--r', `${r1 + Math.random() * (r2 - r1)}s`);
            f.appendChild(d);
        }
    };
    add(20, 4, 8, 15, 30, 6, 14, false);
    add(8, 10, 18, 25, 45, 12, 24, true);
})();

const musicBtn = document.querySelector('.sound-row button');

function refreshMusicBtn() {
    musicBtn.textContent = isMusicPlaying() ? '✕' : '';
}

musicBtn.addEventListener('click', () => {
    setMusicPlaying(!isMusicPlaying());
    refreshMusicBtn();
});

window.addEventListener('storage', e => {
    if (e.key === 'buttonSound') refreshMusicBtn();
});

document.getElementById('start-button').addEventListener('click', () => {
    switchTo(gameTracks[0]);
    show('screen-main');
});

document.getElementById('settings-button').addEventListener('click', () => {
    show('screen-settings');
    refreshMusicBtn();
});

document.getElementById('back-button').addEventListener('click', () => {
    show('screen-main');
});

key_control(document);
refreshMusicBtn();
