document.addEventListener('DOMContentLoaded', () => {
    const arrow = document.querySelector('.arrow');

    document.addEventListener('keydown', event => {
        if (event.key === window.buttonUp) {
            arrow.classList.add('up');
            arrow.classList.remove('down');
        } else if (event.key === window.buttonDown) {
            arrow.classList.add('down');
            arrow.classList.remove('down');
        }
    });

    document.addEventListener('keyup', event => {
        if (event.key === window.buttonUp || event.key === window.buttonDown) {
            arrow.classList.remove('up', 'down');
        }
    });
});