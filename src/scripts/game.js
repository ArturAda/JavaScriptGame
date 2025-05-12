import { switchTo, gameTracks,
    isMusicPlaying, applyVolume } from './music.js';
import { key_control }          from './control.js';
import { playButtonSound }      from './button_sound.js';
import { loadLeaderboard } from './leaderboard.js';

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

document.getElementById('main-leader-btn')
    .addEventListener('click', () => showScreen('screen-leaderboard'));

document.getElementById('leader-back')
    .addEventListener('click', () => showScreen('screen-main'));


let startTime = 0;
const SPEED_ARROW = 180;
const BASE_SPEED  = 160;
const SMALL_K = 1;
const BIG_K   = 0.7;
const EVIL_VY = 60;
const VOL_PLAY  = 0.80;
const VOL_PAUSE = 0.05;
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
        endGame(false);
        document.getElementById('screen-main').classList.add('active');
    });
}

if (pauseSettings) {
    pauseSettings.addEventListener('click', () => {
        playButtonSound();
        endGame(false);
        document.getElementById('screen-settings').classList.add('active');
    });
}

[ pauseLeader, pauseAbout ].forEach(btn => {
    if (btn) btn.addEventListener('click', () => {
        playButtonSound();
        endGame(false);
        document.getElementById('screen-main').classList.add('active');
    });
});

document.getElementById('leader-back').addEventListener('click', () => {
    playButtonSound();
    showScreen('screen-main');
});

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
    if(e.key==='Escape'){ e.preventDefault(); togglePause(); return; }
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

const hit=(a,b)=>{const pa=a.w*HIT_SHRINK*.5,pb=b.w*HIT_SHRINK*.5;
    return a.x+pa<b.x+b.w-pb&&a.x+a.w-pa>b.x+pb&&a.y+pa<b.y+b.h-pb&&a.y+a.h-pa>b.y+pb;};

export let running=false,paused=false,raf=0,lastT=0,spawnT=0;
function loop(t){
    const dt=(t-lastT)/1000; lastT=t;
    update(dt); render();
    if(running) raf=requestAnimationFrame(loop);
}
function update(dt){
    const vy=SPEED_ARROW*dt; if(keys.up) player.y-=vy; if(keys.down) player.y+=vy;
    player.y=Math.max(0,Math.min(H-player.h,player.y));

    if(keys.right){
        rightDur+=dt; leftDur=idleDur=0;
        growth+=Math.min(10,rightDur/0.03)*dt;
        if(rightStage===0 && rightDur>=1){ envMul*=2; rightStage=1; }
        if(rightStage===1 && rightDur>=2){ envMul*=1.8; rightStage=2; }
        if(rightStage===2 && rightDur>=3){ envMul*=1.6; rightStage=3; }
        if(rightStage>=3){ right50Timer+=dt; if(right50Timer>=3){ envMul*=1.50; right50Timer=0; } }
        leftSlowTimer=0; slowDecayT=0;
    } else if(keys.left){
        leftDur+=dt; rightDur=idleDur=0; rightStage=0; right50Timer=0;
        growth-=Math.min(10,leftDur/0.03)*dt;
        leftSlowTimer+=dt;
        while(leftSlowTimer>=1 && envMul>1){ envMul=Math.max(1,envMul*0.9); leftSlowTimer-=1; }
        slowDecayT=0;
    } else {
        idleDur+=dt; rightDur=leftDur=0; rightStage=0; right50Timer=0;
        let drop=0; if(idleDur>=5)drop=2.5; else if(idleDur>=3)drop=1; else if(idleDur>=1.5)drop=.25; else if(idleDur>=1)drop=.5;
        growth-=drop*dt*2;
        if(envMul>1){ slowDecayT+=dt; if(slowDecayT>=2){ envMul=Math.max(1,envMul*0.9); slowDecayT-=2; } }
    }

    const elapsed = (performance.now() - startTime) / 1000;

    increase = c*growth / elapsed;
    summary  = inc0 + increase * b / elapsed + growth * a;
    if(summary<0){ endGame(); return; }

    survive+=dt; if(survive>=surgeAt){ wave(20); surgeAt+=10+2*Math.random(); }

    spawnT+=dt; if(spawnT>=nextWaveDelay){ spawnT=0; nextWaveDelay=2+Math.random(); wave(10); }

    bigCheck+=dt; if(bigCheck>=15){ bigCheck=0; if(Math.random()<0.5){ for(let i=0;i<25;i++) spawn('big'); } }

    edgeCheck+=dt; if(edgeCheck>=4){ edgeCheck=0;
        for(let i=0;i<4;i++){ const kind=Math.random()<0.5?'big':'evil'; spawn(kind,0); spawn(kind,H-96); }
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

document.getElementById('continue-btn').onclick = ()=>{ playButtonSound(); togglePause(); };
document.getElementById('pause-settings-btn').onclick = ()=>{ playButtonSound(); endGame(false); document.getElementById('screen-settings').classList.add('active'); };
['pause-leader-btn','pause-about-btn'].forEach(id=>{
    const b=document.getElementById(id); if(b) b.onclick=()=>{ playButtonSound(); endGame(false); document.getElementById('screen-main').classList.add('active'); };
});
document.getElementById('play-button').onclick=()=>{
    document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
    document.getElementById('screen-game').classList.add('active'); startGame();
};

export function startGame(){
    key_control(document);
    switchTo(gameTracks[2], true);
    applyVolume(gameTracks[2], VOL_PLAY);
    measure();
    player.x=(W-player.w)/2; player.y=(H-player.h)/2;
    reset(); wave(25); spawnT=0; nextWaveDelay=2+Math.random();
    growth=0; summary=0; running=true; paused=false; pauseLayer.classList.add('hidden');
    startTime = performance.now();
    lastT=performance.now(); raf=requestAnimationFrame(loop);
}

function showGameOverModal() {
    const modal = document.getElementById('gameover-modal');
    const input = document.getElementById('player-name-input');
    modal.classList.remove('hidden');
    input.value = '';
    input.focus();

    function onEnter(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            input.removeEventListener('keydown', onEnter);
            const name = input.value.trim() || 'Без имени';
            modal.classList.add('hidden');
            submitScore(name);
        }
    }
    input.addEventListener('keydown', onEnter);
}


async function submitScore(name) {
    try {
        await fetch('/api/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
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
    switchTo(gameTracks[1]);
    showScreen('screen-leaderboard');
    await loadLeaderboard();
}

document.getElementById('main-leader-btn').addEventListener('click', () => {
    playButtonSound();
    loadLeaderboard();
    showScreen('screen-leaderboard');
});

function endGame() {
    if (!running) return;
    running = false;
    cancelAnimationFrame(raf);
    reset();
    showGameOverModal();
}

function color(n){ return n>0?'#0f0':n<0?'#f55':'#ccc'; }