import { switchTo, gameTracks } from './music.js';
import { key_control } from './control.js';
import { playButtonSound } from './button_sound.js';

const keys = { up: false, down: false, left: false, right: false, esc: false };
const playerEl = document.getElementById('player');
const hudGrowth = document.getElementById('stat-growth');
const hudInc = document.getElementById('stat-increase');
const hudSum = document.getElementById('stat-summary');
const pauseLayer = document.getElementById('pause-overlay');

const SPEED_BASE = 200;
const WORLD_W = 1280;
const WORLD_H = 720;

let gameRunning = false;
let paused = false;
let rafId = 0;

const capital_begin = Math.random() * 1000;
const a = Math.random() * 10;
const b = Math.random() * 10;
const c = Math.random() * 10;

let growth_rate = 0;
let increase_begin = Math.random() * 10;
let increase = 0;
let summary = 0;

const player = { x: 200, y: WORLD_H / 2, w: 40, h: 18 };

const dollars = [];
function spawnDollar(kind) {
    const y = Math.random() * (WORLD_H - 100) + 50;
    const speedBase = 80 + Math.random() * 40;
    if (kind === 'evil') {
        dollars.push({ kind, x: WORLD_W + 50, y, w: 48, h: 48, vy: 60, dir: 1, spd: speedBase });
    } else if (kind === 'small') {
        dollars.push({ kind, x: WORLD_W + 50, y, w: 24, h: 24, vy: 0, dir: 0, spd: speedBase * 1.8 });
    } else {
        dollars.push({ kind, x: WORLD_W + 50, y, w: 96, h: 96, vy: 0, dir: 0, spd: speedBase * 0.7 });
    }
}

function randSpawn(dt) {
    if (Math.random() < dt * 0.5) spawnDollar('evil');
    if (Math.random() < dt * 0.3) spawnDollar('small');
    if (Math.random() < dt * 0.1) spawnDollar('big');
}

function coll(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function syncKeyNames() {
    keys.upName = window.buttonUp;
    keys.downName = window.buttonDown;
    keys.leftName = window.buttonLeft;
    keys.rightName = window.buttonRight;
}
syncKeyNames();
window.addEventListener('storage', syncKeyNames);

document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        document.getElementById('pause-overlay')
            .classList.toggle('hidden');
    }
});

document.querySelectorAll('#pause-overlay .menu-button')
    .forEach(btn => {
        btn.addEventListener('click', () => {
            switch (btn.dataset.action) {
                case 'play':
                    document.getElementById('pause-overlay').classList.add('hidden');
                    break;
                case 'settings':
                    window.location.href = './settings.html';
                    break;
                case 'leaderboard':
                    window.location.href = './leaderboard.html';
                    break;
                case 'about':
                    window.location.href = './about.html';
                    break;
            }
        });
    });

window.addEventListener('keydown', e => {
    if (e.key === keys.upName) keys.up = true;
    if (e.key === keys.downName) keys.down = true;
    if (e.key === keys.leftName) keys.left = true;
    if (e.key === keys.rightName) keys.right = true;
    if (e.key === 'Escape') {
        e.preventDefault();
        togglePause();
    }
});
window.addEventListener('keyup', e => {
    if (e.key === keys.upName) keys.up = false;
    if (e.key === keys.downName) keys.down = false;
    if (e.key === keys.leftName) keys.left = false;
    if (e.key === keys.rightName) keys.right = false;
});

function togglePause() {
    if (!gameRunning) return;
    paused = !paused;
    pauseLayer.classList.toggle('hidden', !paused);
    if (gameTracks[2]) gameTracks[2].volume = paused ? 0.05 : 0.2;
    if (!paused) {
        lastT = performance.now();
        loop(lastT);
    } else {
        cancelAnimationFrame(rafId);
    }
}

document.getElementById('continue-btn').onclick = () => {
    playButtonSound();
    togglePause();
};
document.getElementById('pause-settings-btn').onclick = () => {
    playButtonSound();
    localStorage.setItem('musicTime', gameTracks[2].currentTime.toString());
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('screen-settings').classList.add('active');
};
['pause-leader-btn', 'pause-about-btn'].forEach(id => {
    document.getElementById(id).onclick = playButtonSound;
});

document.getElementById('play-button').addEventListener('click', () => {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('screen-game').classList.add('active');
    startGame();
});

let lastT = 0;
function startGame() {
    key_control(document);
    switchTo(gameTracks[2]);
    Object.assign(player, { x: 200, y: WORLD_H / 2 });
    dollars.length = 0;
    growth_rate = 0;
    increase_begin = 0;
    gameRunning = true;
    paused = false;
    pauseLayer.classList.add('hidden');
    lastT = performance.now();
    loop(lastT);
}

function loop(t) {
    const dt = (t - lastT) / 1000;
    lastT = t;
    update(dt);
    render();
    rafId = requestAnimationFrame(loop);
}

const holdClock = { right: 0, left: 0, noRight: 0 };
function update(dt) {
    const speed = SPEED_BASE * dt;
    if (keys.up) player.y -= speed;
    if (keys.down) player.y += speed;
    if (keys.left) player.x -= speed;
    if (keys.right) player.x += speed;
    player.x = Math.max(0, Math.min(WORLD_W - player.w, player.x));
    player.y = Math.max(0, Math.min(WORLD_H - player.h, player.y));

    if (keys.right) {
        holdClock.right += dt;
        holdClock.left = 0;
        holdClock.noRight = 0;
        const accel = Math.min(10, holdClock.right / 0.03);
        growth_rate += accel * dt;
    } else if (keys.left) {
        holdClock.left += dt;
        holdClock.right = 0;
        holdClock.noRight = 0;
        const decel = Math.min(10, holdClock.left / 0.03);
        growth_rate -= decel * dt;
    } else {
        holdClock.noRight += dt;
        holdClock.right = 0;
        holdClock.left = 0;
        let drop = 0;
        if (holdClock.noRight >= 5) drop = 2.5;
        else if (holdClock.noRight >= 3) drop = 1;
        else if (holdClock.noRight >= 1.5) drop = 0.25;
        else if (holdClock.noRight >= 1) drop = 0.5;
        growth_rate -= drop * dt * 2;
    }

    increase = increase_begin + c * growth_rate;
    summary = capital_begin + increase * b + growth_rate * a;

    randSpawn(dt);
    dollars.forEach(d => {
        d.x -= d.spd * dt;
        if (d.kind === 'evil') {
            d.y += d.vy * dt * d.dir;
            if (d.y < 0 || d.y + d.h > WORLD_H) d.dir *= -1;
        } else if (d.kind === 'small') {
            if (Math.random() < dt * 0.5) d.spd *= -1;
        }
    });
    for (let i = dollars.length - 1; i >= 0; --i) {
        if (dollars[i].x + dollars[i].w < 0) dollars.splice(i, 1);
    }
    dollars.forEach(d => {
        if (coll(player, d)) gameOver();
    });
}

function gameOver() {
    cancelAnimationFrame(rafId);
    gameRunning = false;
    alert(
        `Game over!\n\ngrowth_rate: ${growth_rate.toFixed(
            2,
        )}\nincrease: ${increase.toFixed(2)}\nsummary: ${summary.toFixed(2)}`,
    );
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('screen-main').classList.add('active');
}

function colorFor(n) {
    return n > 0 ? '#0f0' : n < 0 ? '#f55' : '#ccc';
}

const ctxEl = document.createElement('canvas');
ctxEl.width = 32;
ctxEl.height = 32;
const ctx = ctxEl.getContext('2d');
ctx.fillStyle = '#0a0';
ctx.fillRect(0, 0, 32, 32);
ctx.fillStyle = '#000';
ctx.fillRect(4, 4, 24, 24);
const dollarURL = ctxEl.toDataURL();

function render() {
    hudGrowth.textContent = `growth rate: ${growth_rate.toFixed(2)}`;
    hudInc.textContent = `increase: ${increase.toFixed(2)}`;
    hudSum.textContent = `summary: ${summary.toFixed(2)}`;
    hudGrowth.style.color = colorFor(growth_rate);
    hudInc.style.color = colorFor(increase);
    hudSum.style.color = colorFor(summary);
    playerEl.style.background = colorFor(increase);
    playerEl.style.transform = `translate(${player.x}px,${player.y}px)`;
    const area = document.getElementById('game-area');
    area.querySelectorAll('.dollar').forEach(e => e.remove());
    dollars.forEach(d => {
        const el = document.createElement('div');
        el.className = 'dollar';
        el.style.position = 'absolute';
        el.style.left = d.x + 'px';
        el.style.top = d.y + 'px';
        el.style.width = d.w + 'px';
        el.style.height = d.h + 'px';
        el.style.background = `url(${dollarURL}) center/contain no-repeat`;
        if (d.kind === 'evil') el.style.filter = 'hue-rotate(-90deg)';
        else if (d.kind === 'big') el.style.transform = 'scale(2)';
        area.appendChild(el);
    });
}
