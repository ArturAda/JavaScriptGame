# JavaScriptGame
## Правила игры «Stocks Nightmare»

### Цель игры:

Управляя стрелкой, избегать столкновений с различными долларами и набрать максимально возможный итоговый счет (Summary).

### Управление:

* **Вверх / Вниз**: Двигать стрелку вверх и вниз.
* **Вправо**: Увеличивает показатель Growth Rate и ускоряет игру.
* **Влево**: Уменьшает показатель Growth Rate и замедляет игру.

### Игровые показатели:

В левом верхнем углу отображаются:

* **Growth Rate** (темп роста)
* **Increase** (прирост)
* **Summary** (итог)

Цвет показателей:

* **Зеленый** — значение больше 0.
* **Красный** — значение меньше 0.
* **Серый** — значение равно 0.

Эти показатели меняются по волшебной формуле в зависимости от действий игрока.

### Особенности игры:

* Чем дольше удерживается кнопка вправо, тем быстрее увеличивается Growth Rate.
* При долгом бездействии (не удерживании кнопки вправо) показатель Growth Rate начнёт снижаться.
* Чем выше показатель Increase, тем быстрее двигаются доллары.
* Стрелка меняет цвет:

    * **Зеленая**, если Increase > 0
    * **Красная**, если Increase < 0
    * **Серая**, если Increase = 0

### Враги (Доллары):

Игрок должен избегать столкновений с тремя типами долларов, движущимися справа налево:

* **Злой Доллар**:

    * Имеет красную повязку.
    * Двигается вертикально вверх и вниз, а также движется влево.

* **Маленький Доллар**:

    * Маленького размера.
    * Быстро перемещается по горизонтали вправо и влево.

* **Большой Доллар**:

    * Очень крупный.
    * Двигается медленнее чем другие доллары, занимает значительное пространство.
    * Носит черные солнечные очки.

### Конец игры:

Игра завершается при первом столкновении стрелки с любым долларом. По завершении отображаются итоговые показатели:

* **Growth Rate**
* **Increase**
* **Summary**

### Победа:

Набрать максимально высокий итоговый счет (Summary). Чем выше итог, тем лучше!
