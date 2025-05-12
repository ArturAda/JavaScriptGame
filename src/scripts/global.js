import { switchTo, gameTracks } from './music.js';
import { key_control } from './control.js';

function show(id){
    document.querySelectorAll('.screen').forEach(sec => sec.classList.toggle('active', sec.id === id));
}

(function spawnDollars(){
    const field = document.getElementById('dollar-field');
    function addPack(count, sizeMin, sizeMax, tMin, tMax, rMin, rMax, big=false){
        for(let i= 0; i < count; ++i){
            const d = document.createElement('div');
            d.className = 'dollar' + (big ? ' big' : '');
            const size = sizeMin + Math.random()*(sizeMax-sizeMin);
            d.style.width  = d.style.height = `${size}vh`;
            d.style.left   = `${Math.random()*100}%`;
            d.style.setProperty('--t', `${tMin + Math.random()*(tMax-tMin)}s`);
            d.style.setProperty('--r', `${rMin + Math.random()*(rMax-rMin)}s`);
            field.appendChild(d);
        }
    }
    addPack(20, 4, 8, 15, 30, 6, 14, false);
    addPack(8, 10, 18, 25, 45, 12, 24, true);
})();

document.getElementById('start-button').addEventListener('click', () => {
    switchTo(gameTracks[0]);
    show('screen-main');
});

document.getElementById('settings-button').addEventListener('click', () => {
    localStorage.setItem('musicTime', gameTracks[0].currentTime.toString());
    show('screen-settings');
});

key_control(document);

document.getElementById('back-button').addEventListener('click', () => {
    localStorage.setItem('musicTime', gameTracks[0].currentTime.toString());
    show('screen-main');
});