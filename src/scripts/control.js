export function key_control(root = document) {
    window.buttonUp    = localStorage.getItem('buttonUp') || 'ArrowUp';
    window.buttonLeft  = localStorage.getItem('buttonLeft') || 'ArrowLeft';
    window.buttonDown  = localStorage.getItem('buttonDown') || 'ArrowDown';
    window.buttonRight = localStorage.getItem('buttonRight') || 'ArrowRight';

    const rowUp    = root.querySelector('.up-row');
    const rowLeft  = root.querySelector('.left-row');
    const rowDown  = root.querySelector('.down-row');
    const rowRight = root.querySelector('.right-row');

    const btnUp    = rowUp.querySelector('button');
    const btnLeft  = rowLeft.querySelector('button');
    const btnDown  = rowDown.querySelector('button');
    const btnRight = rowRight.querySelector('button');

    btnUp.textContent    = window.buttonUp;
    btnLeft.textContent  = window.buttonLeft;
    btnDown.textContent  = window.buttonDown;
    btnRight.textContent = window.buttonRight;

    let waiting = 0;

    function assign(e) {
        const key = e.key;
        if (waiting === 1) { window.buttonUp    = key; btnUp.textContent    = key; localStorage.setItem('buttonUp',    key); }
        if (waiting === 2) { window.buttonLeft  = key; btnLeft.textContent  = key; localStorage.setItem('buttonLeft',  key); }
        if (waiting === 3) { window.buttonDown  = key; btnDown.textContent  = key; localStorage.setItem('buttonDown',  key); }
        if (waiting === 4) { window.buttonRight = key; btnRight.textContent = key; localStorage.setItem('buttonRight', key); }
        document.dispatchEvent(new Event('controlsChanged'));
        waiting = 0;
        document.removeEventListener('keydown', assign);
    }

    [btnUp, btnLeft, btnDown, btnRight].forEach((btn, idx) => {
        btn.addEventListener('click', () => {
            waiting = idx + 1;
            btn.textContent = 'Нажмите клавишу';
            document.addEventListener('keydown', assign);
        });
    });

    window.addEventListener('storage', e => {
        const v = e.newValue;
        if (e.key === 'buttonUp')    { window.buttonUp    = v; btnUp.textContent    = v; }
        if (e.key === 'buttonLeft')  { window.buttonLeft  = v; btnLeft.textContent  = v; }
        if (e.key === 'buttonDown')  { window.buttonDown  = v; btnDown.textContent  = v; }
        if (e.key === 'buttonRight') { window.buttonRight = v; btnRight.textContent = v; }
    });
}