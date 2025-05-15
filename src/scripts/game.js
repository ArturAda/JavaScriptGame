import { switchTo, gameTracks,
    isMusicPlaying, applyVolume, setMusicPlaying } from './music.js';
import { key_control }          from './control.js';
import { playButtonSound }      from './button_sound.js';
import { loadLeaderboard } from './leaderboard.js';

let settingsFromPause = false;
let leaderboardFromPause = false;
let gameoverLeaderboard = false;
let aboutFromPause = false;
const backBtn = document.getElementById('back-button');
const leaderBack = document.getElementById('leader-back');
const mainLeaderBtn = document.getElementById('main-leader-btn');
const aboutBack = document.getElementById('about-back');
const mainAboutBtn = document.getElementById('main-about-btn');
const pauseRestartBtn = document.getElementById('pause-restart-btn');
const gameoverMenuBtn = document.getElementById('gameover-menu-btn');
const gameoverRestartBtn = document.getElementById('gameover-restart-btn');

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




function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

let startTime = 0;
const SPEED_ARROW = 400;
const BASE_SPEED  = 160;
const SMALL_K = 1;
const BIG_K   = 0.7;
const EVIL_VY = 60;
const VOL_PLAY  = 0.80;
const VOL_PAUSE = 0.15;
const HIT_SHRINK = 0.35;

const gameArea   = document.getElementById('game-area');
const playerEl   = document.getElementById('player');
const pauseLayer = document.getElementById('pause-overlay');
const hudG = document.getElementById('stat-growth');
const hudI = document.getElementById('stat-increase');
const hudS = document.getElementById('stat-summary');

const continueBtn= document.getElementById('continue-btn');
const pauseMainBtn= document.getElementById('pause-main-btn');
const pauseSettings= document.getElementById('pause-settings-btn');
const pauseLeader= document.getElementById('pause-leader-btn');
const pauseAbout= document.getElementById('pause-about-btn');

if (continueBtn) {
    continueBtn.addEventListener('click', () => {
        playButtonSound();
        togglePause();
    });
}

if (pauseMainBtn) {
    pauseMainBtn.addEventListener('click', () => {
        playButtonSound();
        paused = false;
        pauseLayer.classList.add('hidden');
        switchTo(gameTracks[0], true);
        showScreen('screen-main');
    });
}

if (pauseSettings) {
    pauseSettings.addEventListener('click', () => {
        playButtonSound();
        settingsFromPause = true;
        pauseLayer.classList.add('hidden');
        showScreen('screen-settings');
    });
}

if (pauseRestartBtn) {
    pauseRestartBtn.addEventListener('click', () => {
        playButtonSound();
        switchTo(null);
        switchTo(gameTracks[2], true);
        startGame();
    });
}

if (gameoverMenuBtn) {
    gameoverMenuBtn.addEventListener('click', () => {
        playButtonSound();
        document.getElementById('gameover-modal').classList.add('hidden');
        switchTo(gameTracks[0], true);
        showScreen('screen-main');
    });
}

if (gameoverRestartBtn) {
    gameoverRestartBtn.addEventListener('click', () => {
        playButtonSound();
        document.getElementById('gameover-modal').classList.add('hidden');
        switchTo(null);
        switchTo(gameTracks[2], true);
        startGame();
    });
}

[pauseLeader].forEach(btn => {
    if (btn) btn.addEventListener('click', () => {
        playButtonSound();
        leaderboardFromPause = true;
        pauseLayer.classList.remove('hidden');
        loadLeaderboard();
        showScreen('screen-leaderboard');
    });
});

if (backBtn) {
    backBtn.addEventListener('click', () => {
        playButtonSound();
        if (settingsFromPause) {
            showScreen('screen-game');
            pauseLayer.classList.remove('hidden');
            applyVolume(gameTracks[2], VOL_PAUSE);
        } else {
            switchTo(gameTracks[0], true);
            showScreen('screen-main');
        }
        settingsFromPause = false;
    });
}

if (leaderBack) {
    leaderBack.addEventListener('click', e => {
        playButtonSound();
        if (gameoverLeaderboard) {
            switchTo(gameTracks[0], true);
            showScreen('screen-main');
        }
        else if (leaderboardFromPause) {
            showScreen('screen-game');
            pauseLayer.classList.remove('hidden');
            applyVolume(gameTracks[2], VOL_PAUSE);
        }
        else {
            switchTo(gameTracks[0], true);
            showScreen('screen-main');
        }
        gameoverLeaderboard = false;
        leaderboardFromPause = false;
    });
}

if (aboutBack) {
    aboutBack.addEventListener('click', e => {
        playButtonSound();
        if (aboutFromPause) {
            showScreen('screen-game');
            pauseLayer.classList.remove('hidden');
            applyVolume(gameTracks[2], VOL_PAUSE);
        } else {
            switchTo(gameTracks[0], true);
            showScreen('screen-main');
        }
        aboutFromPause = false;
    });
}

if (mainLeaderBtn) {
    mainLeaderBtn.addEventListener('click', () => {
        playButtonSound();
        loadLeaderboard();
        switchTo(gameTracks[1], true);
        showScreen('screen-leaderboard');
        leaderboardFromPause = false;
    });
}

if (mainAboutBtn) {
    mainAboutBtn.addEventListener('click', () => {
        playButtonSound();
        switchTo(gameTracks[1], true);
        showScreen('screen-about');
        aboutFromPause = false;
    });
}

if (pauseAbout) {
    pauseAbout.addEventListener('click', () => {
        playButtonSound();
        aboutFromPause = true;
        pauseLayer.classList.add('hidden');
        showScreen('screen-about');
    });
}

let W=0,H=0; function measure(){ W=gameArea.clientWidth||innerWidth; H=gameArea.clientHeight||innerHeight; }
measure(); addEventListener('resize',measure);

const player={w:40,h:18,x:0,y:0};
const keys={up:false,down:false,left:false,right:false};
function syncNames(){
    keys.upName    = window.buttonUp    || 'ArrowUp';
    keys.downName  = window.buttonDown  || 'ArrowDown';
    keys.leftName  = window.buttonLeft  || 'ArrowLeft';
    keys.rightName = window.buttonRight || 'ArrowRight';
}
syncNames();
document.addEventListener('controlsChanged',syncNames);

addEventListener('keydown',e=>{
    if(!running) return;
    if(e.key==='Escape'){
        const active = document.querySelector('.screen.active')?.id;
        if (active === 'screen-game') {
            e.preventDefault();
            togglePause();
        }
        return;
    }
    if(e.key===keys.upName)   keys.up=true;
    if(e.key===keys.downName) keys.down=true;
    if(e.key===keys.leftName) keys.left=true;
    if(e.key===keys.rightName)keys.right=true;
});
addEventListener('keyup',e=>{
    if(!running) return;
    if(e.key===keys.upName)   keys.up=false;
    if(e.key===keys.downName) keys.down=false;
    if(e.key===keys.leftName) keys.left=false;
    if(e.key===keys.rightName)keys.right=false;
});

const capital0=Math.random()*1000;
let a=Math.random()*10,b=Math.random()*10,c=Math.random()*3;
let growth=0, inc0=Math.random()*30, increase=0, summary=0;

let envMul=1;
let rightDur=0, leftDur=0, idleDur=0;
let rightStage=0, right50Timer=0;
let leftSlowTimer=0;
let nextWaveDelay = 2+Math.random();
let survive=0, surgeAt=10+2*Math.random();
let bigCheck=0, edgeCheck=0, slowDecayT=0;

const img={evil:'../images/evil_dollar.png',small:'../images/small_dollar.png',big:'../images/big_dollar.png'};
const dollars=[];
function make(k,w,h){
    const el=document.createElement('div');
    Object.assign(el.style,{position:'absolute',width:`${w}px`,height:`${h}px`,background:`url(${img[k]}) center/contain no-repeat`,willChange:'transform', zIndex: '0'});
    gameArea.appendChild(el);
    return el;
}
function spawn(k,yFixed=null){
    const y=yFixed!==null ? yFixed : Math.random()*(H-100)+50;
    const base=BASE_SPEED+Math.random()*20, factor=k==='small'?SMALL_K:k==='big'?BIG_K:1;
    const size=k==='small'?24:k==='evil'?48:96;
    const el=make(k,size,size);
    dollars.push({k,x:W+50,y,w:size,h:size,spd:-(base*factor),vy:k==='evil'?EVIL_VY:0,dir:1,el});
}
function wave(n){ for(let i=0;i<n;i++){ const r=Math.random(); r<.4?spawn('evil'):r<.7?spawn('small'):spawn('big'); } }

const hit=(a,b)=>{
    const pa = a.w * HIT_SHRINK * .5;
    const shrinkB = b.k === 'big'
        ? b.w * (HIT_SHRINK * 0.5) * .5
        : b.w * HIT_SHRINK * .5;
    return a.x + pa            < b.x + b.w - shrinkB &&
        a.x + a.w - pa     > b.x + shrinkB &&
        a.y + pa            < b.y + b.h - shrinkB &&
        a.y + a.h - pa     > b.y + shrinkB;};

export let running=false,paused=false,raf=0,lastT=0,spawnT=0;
function loop(t){
    const dt=(t-lastT)/1000; lastT=t;
    update(dt); render();
    if(running) raf=requestAnimationFrame(loop);
}

const DEFAULT_PERCENT_TICK_RIGHT = 0.004;
const DEFAULT_PERCENT_TICK_LEFT  = 0.004;
const IDLE_PERCENT_TICK = 0.0005;
const IDLE_TICK_INTERVAL = 0.1;
let specialTimer = 0;
let idleTickTimer = 0;
let percentTickRight = DEFAULT_PERCENT_TICK_RIGHT;
let percentTickLeft  = DEFAULT_PERCENT_TICK_LEFT;
let rightTickTimer   = 0;
let rightSecondTimer = 0;
let leftTickTimer= 0;
let leftSecondTimer  = 0;

function update(dt){
    const vy=SPEED_ARROW*dt; if(keys.up) player.y-=vy; if(keys.down) player.y+=vy;
    player.y=Math.max(0,Math.min(H-player.h,player.y));

    if(keys.right){
        if (rightDur <= dt) {
            percentTickRight = DEFAULT_PERCENT_TICK_RIGHT;
            rightTickTimer = 0;
            rightSecondTimer = 0;
        }
        if (rightDur <= dt) {
            percentTickRight = DEFAULT_PERCENT_TICK_RIGHT;
            percentTickLeft  = DEFAULT_PERCENT_TICK_LEFT;
            rightTickTimer   = rightSecondTimer = 0;
            leftTickTimer    = leftSecondTimer  = 0;
        }
        percentTickLeft = DEFAULT_PERCENT_TICK_LEFT;
        leftTickTimer = 0;
        leftSecondTimer = 0;
        rightDur += dt;
        leftDur = idleDur = 0;
        growth  += Math.min(10, rightDur / 0.03) * dt;
        if (rightStage === 0 && rightDur >= 1) {
            envMul *= 2;
            rightStage = 1;
        }
        if (rightTickTimer === 0 && rightSecondTimer === 0 && rightDur <= dt) {
            envMul *= 1 + percentTickRight;
        }
        rightTickTimer += dt;
        while (rightTickTimer >= 0.1) {
            envMul *= 1 + percentTickRight;
            rightTickTimer -= 0.1;
        }
        rightSecondTimer += dt;
        if (rightSecondTimer >= 1) {
            const randPct = (Math.random() * (0.1 - 0.05) + 0.05) / 100;
            percentTickRight += randPct;
            rightSecondTimer -= 1;
        }
        leftTickTimer = leftSecondTimer = 0;
    } else if(keys.left){
        if (leftDur <= dt) {
            percentTickLeft = DEFAULT_PERCENT_TICK_LEFT;
            leftTickTimer   = 0;
            leftSecondTimer = 0;
        }
        if (leftDur <= dt) {
            percentTickLeft  = DEFAULT_PERCENT_TICK_LEFT;
            percentTickRight = DEFAULT_PERCENT_TICK_RIGHT;
            leftTickTimer    = leftSecondTimer  = 0;
            rightTickTimer   = rightSecondTimer = 0;
        }
        percentTickRight = DEFAULT_PERCENT_TICK_RIGHT;
        rightTickTimer   = 0;
        rightSecondTimer = 0;
        leftDur += dt;
        rightDur = idleDur = 0;
        rightStage = 0;
        right50Timer = 0;
        growth  -= Math.min(3, leftDur / 0.03) * dt;
        if (leftTickTimer === 0 && leftSecondTimer === 0 && leftDur <= dt) {
            envMul *= 1 - percentTickLeft;
        }
        leftTickTimer += dt;
        while (leftTickTimer >= 0.1) {
            envMul *= 1 - percentTickLeft;
            leftTickTimer -= 0.1;
        }
        leftSecondTimer += dt;
        if (leftSecondTimer >= 1) {
            const randPct = (Math.random() * (0.09 - 0.05) + 0.05) / 100;
            percentTickLeft += randPct;
            leftSecondTimer -= 1;
        }
        rightTickTimer = rightSecondTimer = 0;
        if (envMul < 1) envMul = 1;
    } else {
        percentTickLeft = DEFAULT_PERCENT_TICK_LEFT;
        leftTickTimer = 0;
        leftSecondTimer = 0;
        percentTickRight = DEFAULT_PERCENT_TICK_RIGHT;
        rightTickTimer   = 0;
        rightSecondTimer = 0;
        rightTickTimer = rightSecondTimer = leftTickTimer = leftSecondTimer = 0;
        idleTickTimer += dt;
        while (idleTickTimer >= IDLE_TICK_INTERVAL) {
            envMul = Math.max(1, envMul * (1 - IDLE_PERCENT_TICK));
            idleTickTimer -= IDLE_TICK_INTERVAL;
        }
        idleDur += dt;
        rightDur = leftDur = 0;
        rightStage = 0;
        right50Timer = 0;
        let drop = 0;
        if (idleDur >= 5)         drop = 2.5;
        else if (idleDur >= 2.5)  drop = 1;
        growth -= drop * dt * 3.5;
    }

    const elapsed = (performance.now() - startTime) / 1000;

    increase = c*growth / elapsed;
    summary  = inc0 + increase * b * elapsed + growth * a / elapsed;
    if(summary<0){ endGame(); return; }

    survive+=dt; if(survive>=surgeAt){ wave(25); surgeAt+=10+2*Math.random(); }

    spawnT+=dt; if(spawnT>=nextWaveDelay){ spawnT=0; nextWaveDelay=2+Math.random(); wave(10); }

    bigCheck+=dt; if(bigCheck>=15){ bigCheck=0; if(Math.random()<0.5){ for(let i=0;i<15;i++) spawn('big'); } }

    edgeCheck+=dt; if(edgeCheck>=4){ edgeCheck=0;
        for(let i=0;i<8;i++){ const kind=Math.random()<0.5?'big':'evil'; spawn(kind, 0); spawn(kind,H-96); }
    }

    specialTimer += dt;
    if (survive >= 15 && specialTimer >= 5) {
        specialTimer -= 5;
        if (Math.random() < 0.5) {
            for (let i = 0; i < 10; i++) {
                const kind = Math.random() < 0.5 ? 'evil' : 'small';
                if (i < 3) {
                    spawn(kind, 0);
                } else {
                    spawn(kind);
                }
            }
        }
    }

    dollars.forEach(d=>{
        d.x += d.spd*envMul*dt;
        if(d.k==='evil'){ d.y+=d.vy*dt*d.dir; if(d.y<0||d.y+d.h>H) d.dir*=-1; }
        else if(d.k==='small'){ if(Math.random()<dt*0.3) d.spd*=-0.5; }
    });
    for(let i=dollars.length-1;i>=0;--i)
        if(dollars[i].x+dollars[i].w<0){ gameArea.removeChild(dollars[i].el); dollars.splice(i,1); }

    for(const d of dollars) if(hit(player,d)){ endGame(); return; }
}
function render(){
    hudG.textContent=`growth rate: ${growth.toFixed(2)}`;
    hudI.textContent=`increase: ${increase.toFixed(2)}`;
    hudS.textContent=`summary: ${summary.toFixed(2)}`;
    hudG.style.color=color(growth); hudI.style.color=color(increase); hudS.style.color=color(summary);
    playerEl.style.background=color(increase);
    playerEl.style.transform=`translate(${player.x}px,${player.y}px)`;
    dollars.forEach(d=>d.el.style.transform=`translate(${d.x}px,${d.y}px)`);
}

function togglePause(){
    if(!running) return;
    paused=!paused; pauseLayer.classList.toggle('hidden',!paused);
    applyVolume(gameTracks[2], paused ? VOL_PAUSE : VOL_PLAY);
    if(paused) cancelAnimationFrame(raf); else{ lastT=performance.now(); raf=requestAnimationFrame(loop); }
}
function reset(){
    dollars.forEach(d=>gameArea.removeChild(d.el)); dollars.length=0;
    Object.assign(keys,{up:false,down:false,left:false,right:false});
    rightDur=leftDur=idleDur=0; rightStage=0; right50Timer=0; leftSlowTimer=0;
    envMul=1; survive=0; surgeAt=10+2*Math.random();
    bigCheck=0; edgeCheck=0; slowDecayT=0;
}

document.getElementById('play-button').onclick=()=>{
    document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
    document.getElementById('screen-game').classList.add('active'); startGame();
};

export function startGame(){
    key_control(document);
    switchTo(gameTracks[2], true);
    applyVolume(gameTracks[2], VOL_PLAY);
    measure();
    player.x = W / 4;
    player.y = (H - player.h) / 2;
    reset(); wave(25); spawnT=0; nextWaveDelay=2+Math.random();
    growth=0; summary=0; running=true; paused=false; pauseLayer.classList.add('hidden');
    startTime = performance.now();
    lastT=performance.now(); raf=requestAnimationFrame(loop);
}

function showGameOverModal() {
    const modal = document.getElementById('gameover-modal');
    const oldInput = document.getElementById('player-name-input');
    const newInput = oldInput.cloneNode(true);
    oldInput.parentNode.replaceChild(newInput, oldInput);
    const oldSubmit = document.getElementById('gameover-submit-btn');
    const newSubmit = oldSubmit.cloneNode(true);
    oldSubmit.parentNode.replaceChild(newSubmit, oldSubmit);
    const input     = newInput;
    const submitBtn = newSubmit;
    modal.classList.remove('hidden');
    input.value = '';
    input.focus();
    let isSubmitting = false;

    function doSubmit() {
        if (isSubmitting) return;
        isSubmitting = true;
        modal.classList.add('hidden');
        const name = input.value.trim() || 'Без имени';
        submitScore(name);
    }

    const onEnter = e => {
        if (e.key === 'Enter') {
            e.preventDefault();
            doSubmit();
        }
    };
    input.addEventListener('keydown', onEnter);
    submitBtn.addEventListener('click', doSubmit, { once: true });
}


async function submitScore(name) {
    try {
        await fetch('/api/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'},
            body: JSON.stringify({
                name,
                summary,
                growth_rate: growth,
                increase
            })
        });
    } catch(err) {
        console.error(err);
    }
    gameoverLeaderboard = true;
    switchTo(gameTracks[1]);
    showScreen('screen-leaderboard');
    await loadLeaderboard();
}
function endGame(showResults = true) {
    if (!running) return;
    running = false;
    cancelAnimationFrame(raf);
    reset();
    if (showResults) {
        showGameOverModal();
    }
}
function color(n){ return n>0?'#0f0':n<0?'#f55':'#ccc'; }