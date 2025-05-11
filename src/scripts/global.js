import { switchTo, gameTracks } from './music.js';
import { key_control } from './control.js';

function show(id){
    document.querySelectorAll('.screen').forEach(sec => sec.classList.toggle('active', sec.id === id));
}

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