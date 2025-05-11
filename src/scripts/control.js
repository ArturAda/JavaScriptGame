import { setMusicPlaying, isMusicPlaying } from './music.js';

export function key_control(root = document) {
    window.buttonUp = localStorage.getItem('buttonUp') || 'ArrowUp';
    window.buttonLeft = localStorage.getItem('buttonLeft') || 'ArrowLeft';
    window.buttonDown = localStorage.getItem('buttonDown') || 'ArrowDown';
    window.buttonRight = localStorage.getItem('buttonRight') || 'ArrowRight';
    window.buttonSound = isMusicPlaying();

    const setButtonUp = root.querySelector('.up-row');
    const setButtonLeft = root.querySelector('.left-row');
    const setButtonDown = root.querySelector('.down-row');
    const setButtonRight = root.querySelector('.right-row');
    const setButtonSound = root.querySelector('.sound-row');

    const upBtn = setButtonUp.querySelector('button');
    const leftBtn = setButtonLeft.querySelector('button');
    const downBtn = setButtonDown.querySelector('button');
    const rightBtn = setButtonRight.querySelector('button');
    const soundBtn = setButtonSound.querySelector('button');

    let number_button = 0;
    setButtonUp.querySelector('label').textContent = 'Вверх';
    setButtonLeft.querySelector('label').textContent = 'Влево';
    setButtonDown.querySelector('label').textContent = 'Вниз';
    setButtonRight.querySelector('label').textContent = 'Вправо';
    setButtonSound.querySelector('label').textContent = 'Включить музыку в игре';

    upBtn.textContent = window.buttonUp;
    leftBtn.textContent = window.buttonLeft;
    downBtn.textContent = window.buttonDown;
    rightBtn.textContent = window.buttonRight;
    soundBtn.textContent = isMusicPlaying() ? '✕' : '';

    function change_button(new_button) {
        const new_value = new_button.key;
        switch (number_button) {
            case 1:
                window.buttonUp = new_value;
                upBtn.textContent = new_value;
                localStorage.setItem('buttonUp', window.buttonUp);
                break;
            case 2:
                window.buttonLeft = new_value;
                leftBtn.textContent = new_value;
                localStorage.setItem('buttonLeft', window.buttonLeft);
                break;
            case 3:
                window.buttonDown = new_value;
                downBtn.textContent = new_value;
                localStorage.setItem('buttonDown', window.buttonDown);
                break;
            case 4:
                window.buttonRight = new_value;
                rightBtn.textContent = new_value;
                localStorage.setItem('buttonRight', window.buttonRight);
                break;
        }
        number_button = 0;
        document.removeEventListener('keydown', change_button);
    }

    setButtonUp.addEventListener('click', () => {
        number_button = 1;
        upBtn.textContent = 'Нажмите на любую клавишу';
        document.addEventListener('keydown', change_button);
    });

    setButtonLeft.addEventListener('click', () => {
        number_button = 2;
        leftBtn.textContent = 'Нажмите на любую клавишу';
        document.addEventListener('keydown', change_button);
    });

    setButtonDown.addEventListener('click', () => {
        number_button = 3;
        downBtn.textContent = 'Нажмите на любую клавишу';
        document.addEventListener('keydown', change_button);
    });

    setButtonRight.addEventListener('click', () => {
        number_button = 4;
        rightBtn.textContent = 'Нажмите на любую клавишу';
        document.addEventListener('keydown', change_button);
    });

    setButtonSound.addEventListener('click', () => {
        window.buttonSound = !isMusicPlaying();
        setMusicPlaying(window.buttonSound);
        soundBtn.textContent = window.buttonSound ? '✕' : '';

    });

    window.addEventListener('storage', ({ key: k, newValue }) => {
        if (k === 'buttonUp') {
            window.buttonUp = newValue;
            upBtn.textContent = newValue;
        } else if (k === 'buttonLeft') {
            window.buttonLeft = newValue;
            leftBtn.textContent = newValue;
        } else if (k === 'buttonDown') {
            window.buttonDown = newValue;
            downBtn.textContent = newValue;
        } else if (k === 'buttonRight') {
            window.buttonRight = newValue;
            rightBtn.textContent = newValue;
        } else if (k === 'buttonSound') {
            const on = JSON.parse(newValue);
            window.buttonSound = on;
            soundBtn.textContent = on ? '✕' : '';
        }
    });
}