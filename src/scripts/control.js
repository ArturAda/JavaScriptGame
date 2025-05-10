export function key_control(root = document) {
    window.buttonUp = localStorage.getItem('buttonUp') || 'ArrowUp';
    window.buttonLeft = localStorage.getItem('buttonLeft') || 'ArrowLeft';
    window.buttonDown = localStorage.getItem('buttonDown') || 'ArrowDown';
    window.buttonRight = localStorage.getItem('buttonRight') || 'ArrowRight';
    const setButtonUp = root.querySelector('.button-up');
    const setButtonLeft = root.querySelector('.button-left');
    const setButtonDown = root.querySelector('.button-down');
    const setButtonRight = root.querySelector('.button-right');
    let number_button = 0;
    setButtonUp.textContent = `Вверх: ${window.buttonUp}`;
    setButtonLeft.textContent = `Влево: ${window.buttonLeft}`;
    setButtonDown.textContent = `Вниз: ${window.buttonDown}`;
    setButtonRight.textContent = `Вправо: ${window.buttonRight}`;

    function change_button(new_button) {
        if (number_button === 1) {
            window.buttonUp = new_button.key;
            localStorage.setItem('buttonUp', window.buttonUp);
            setButtonUp.textContent = `Вверх: ${window.buttonUp}`;
        } else if (number_button === 2) {
            window.buttonLeft = new_button.key;
            localStorage.setItem('buttonLeft', window.buttonLeft);
            setButtonLeft.textContent = `Влево: ${window.buttonLeft}`;
        } else if (number_button === 3) {
            window.buttonRight = new_button.key;
            localStorage.setItem('buttonRight', window.buttonRight);
            setButtonRight.textContent = `Вправо: ${window.buttonRight}`;
        } else if (number_button === 4) {
            window.buttonDown = new_button.key;
            localStorage.setItem('buttonDown', window.buttonDown);
            setButtonDown.textContent = `Вниз: ${window.buttonDown}`;
        }
        number_button = 0;
        document.removeEventListener('keydown', change_button);
    }

    setButtonUp.addEventListener('click', () => {
        number_button = 1;
        setButtonUp.textContent = `Нажмите на любую клавишу, чтобы привязать ее к "Вверх"`;
        document.addEventListener('keydown', change_button);
    });

    setButtonLeft.addEventListener('click', () => {
        number_button = 2;
        setButtonLeft.textContent = `Нажмите на любую клавишу, чтобы привязать ее к "Влево"`;
        document.addEventListener('keydown', change_button);
    });

    setButtonDown.addEventListener('click', () => {
        number_button = 3;
        setButtonDown.textContent = `Нажмите на любую клавишу, чтобы привязать ее к "Вниз"`;
        document.addEventListener('keydown', change_button);
    });

    setButtonRight.addEventListener('click', () => {
        number_button = 4;
        setButtonRight.textContent = `Нажмите на любую клавишу, чтобы привязать ее к "Вправо"`;
        document.addEventListener('keydown', change_button);
    });
}