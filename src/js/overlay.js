import Svg from './svg';
import GameObjects from './base/gameObjects';
import { makeElement, removeElement, isElementInDom } from './lib/dom';
import * as Share from './lib/share';
import Config from './base/config';
import ResultsTable from './resultsTable';

let BUTTONS = null;

class Overlay {
    constructor(type, scene, params = {}) {
        this.type = type;
        this.scene = scene;
        this.params = params;
        this.el = null;
        this.content = null;

        if (GameObjects.activeOverlay && isElementInDom(GameObjects.activeOverlay)) {
            removeElement(GameObjects.activeOverlay);
            GameObjects.activeOverlay.destroy();
        }
        GameObjects.activeOverlay = null;

        this.init();
    }

    clickHandler(event) {
        let target = event.target;
        let action;

        while (target.parentNode && target !== event.currentTarget) {
            action = target.dataset.click;

            if (action) break;
            target = target.parentNode;
        }

        action = target.dataset.click;

        if (action && this[action]) {
            this[action](event.target, event);
        }
    }

    /**
     * Append overlay
     */
    init() {
        this.el = makeElement('div', ['overlay']);

        this.el.classList.add('overlay--' + this.type);

        this.makeContent();

        document.body.appendChild(this.el);

        this.el.addEventListener('click', e => this.clickHandler(e));
    }

    /**
     * Destroy active overlay
     */
    destroy() {
        if (isElementInDom(this.el)) {
            removeElement(this.el);
        }
        this.el = null;
        this.content = null;
        GameObjects.activeOverlay = null;

        BUTTONS = null;
    }

    /**
     * Make content block
     */
    makeContent() {
        switch (this.type) {
            case 'start':
                this.makeStart();
                break;

            case 'pause':
                this.makePause();
                break;

            case 'result':
                this.makeResult();
        }
    }

    /**
     * Start screen
     */
    makeStart() {
        this.content = makeElement('div', 'overlayContent');

        let start = makeElement('div', 'start');

        let logos = makeElement('div', 'start__logos');

        let logosList = [
            {
                href: 'https://dtf.ru',
                icon: Svg.dtf
            },
            {
                href: 'https://www.delivery-club.ru/',
                icon: Svg.delivery
            }
        ];

        logosList.forEach(logo => {
            let a = makeElement('a', [], {
                target: '_blank',
                href: logo.href,
                innerHTML: logo.icon
            });

            logos.appendChild(a);
        });

        start.appendChild(logos);

        let about = makeElement('div', 'start__about', {
            innerHTML: 'Пройди как можно дальше, удерживая баланс и&nbsp;не падая, чтобы занять одно из первых <strong>10&nbsp;мест</strong> в&nbsp;турнирной таблице. Если окажешься среди победителей&nbsp;— получишь промо-код в&nbsp;<strong>Delivery Club на 3000&nbsp;рублей</strong>.'
        });
        start.appendChild(about);

        let button = makeElement('button', 'start__button', {
            innerHTML: 'Вперёд',
            data: {
                click: 'startGame'
            }
        });
        start.appendChild(button);

        this.content.appendChild(start);
        this.el.appendChild(this.content);

        this.scene.input.keyboard.once('keydown_ENTER', () => this.startGame());
    }

    /**
     * Pause screen
     */
    makePause() {
        this.content = makeElement('div', 'overlayContent');

        let pause = makeElement('div', 'pause');

        let title = makeElement('div', 'pause__title', {
            textContent: 'Пауза'
        });
        pause.appendChild(title);

        BUTTONS = {
            resume: {
                text: 'Продолжить',
                action: 'resumeGame'
            },
            restart: {
                icon: Svg.restart,
                text: 'Начать заново',
                action: 'restartGame'
            },
            mute: {
                icon: Config.mute ? Svg.soundOff : Svg.soundOn,
                text: Config.mute ? 'Включить звук' : 'Выключить звук',
                action: 'muteSound'
            }
        };

        for (let name in BUTTONS) {
            let button = BUTTONS[name];

            let el = makeElement('button', 'pause__button', {
                type: 'button',
                innerHTML: (button.icon || '') + button.text,
                data: {
                    click: button.action
                }
            });

            button.el = el;

            pause.appendChild(el);

            if (name === 'resume') {
                setTimeout(() => {
                    el.focus();
                }, 30);
            }
        }

        this.content.appendChild(pause);
        this.el.appendChild(this.content);
    }

    /**
     * Result screen
     */
    makeResult() {
        let Ui = this.scene.scene.get('Ui');

        this.content = makeElement('div', 'overlayContent');
        this.el.appendChild(this.content);

        let result = makeElement('div', 'result');
        this.content.appendChild(result);

        let resultHeader = makeElement('div', 'resultHeader');
        result.appendChild(resultHeader);

        let title = makeElement('div', 'resultHeader__title', {
            innerHTML: 'Ты прошёл ' + Ui.getCounterValue()
        });
        resultHeader.appendChild(title);

        let actions = makeElement('div', 'resultHeader__actions');
        resultHeader.appendChild(actions);

        Share.make(actions);

        let restartButton = makeElement('button', 'resultHeader__restart', {
            innerHTML: Svg.restart + 'Ещё раз',
            data: {
                click: 'restartGame'
            }
        });
        actions.appendChild(restartButton);

        setTimeout(() => {
            Share.init();
        }, 0);

        let resultPromo = makeElement('div', 'resultPromo');
        result.appendChild(resultPromo);

        let resultPromoTable = makeElement('div', 'resultPromo__table', {
            innerHTML: Svg.cup + 'Найти результат в&nbsp;<span data-click="showResultsTable">турнирной таблице</span>.'
        });
        resultPromo.appendChild(resultPromoTable);

        let resultPromoText = makeElement('div', 'resultPromo__text', {
            innerHTML: 'Хорошо, что в&nbsp;реальности всё иначе, чем в&nbsp;играх. Курьеры Delivery Express не застревают на ровном месте, слушают только весёлую музыку и&nbsp;используют велосипеды и мопеды, чтобы доставить вам обед максимально быстро.'
        });
        resultPromo.appendChild(resultPromoText);

        let resultPromoCode = makeElement('div', 'resultPromo__code', {
            innerHTML: 'Попробуйте сами: промокод <span class="highlight">GENIUS</span> даст вам скидку в&nbsp;500₽*.'
        });
        resultPromo.appendChild(resultPromoCode);

        let resultPromoCodeNode = makeElement('div', 'resultPromo__note', {
            innerHTML: '*Промокод действует на первый заказ и&nbsp;при оплате картой онлайн. Минимальная сумма заказа 1300₽.'
        });
        resultPromo.appendChild(resultPromoCodeNode);

        let resultPromoLink = makeElement('a', 'resultPromo__link', {
            href: 'https://www.delivery-club.ru/',
            target: '_blank',
            innerHTML: 'Сделать заказ <span>&nbsp;в Delivery Club</span>'
        });
        resultPromo.appendChild(resultPromoLink);

        this.makeResultsTable();
    }

    makeResultsTable() {
        let container = makeElement('div', ['resultTable', 'state--hidden']);

        let title = makeElement('div', 'resultTable__title', {
            textContent: 'Турнирная таблица'
        });
        container.appendChild(title);

        let backButton = makeElement('button', 'resultTable__back', {
            innerHTML: Svg.back + 'Вернуться',
            data: {
                click: 'hideResultsTable'
            }
        });
        title.appendChild(backButton);

        let table = new ResultsTable();

        container.appendChild(table.getTable());
        container.appendChild(table.getPagination());

        this.content.appendChild(container);
    }

    showResultsTable() {
        this.content.children[0].classList.add('state--hidden');
        this.content.children[1].classList.remove('state--hidden');
    }

    hideResultsTable() {
        this.content.children[0].classList.remove('state--hidden');
        this.content.children[1].classList.add('state--hidden');
    }

    /**
     * Start main scene
     */
    startGame() {
        this.scene.start();
    }

    /**
     * Resume main scene
     */
    resumeGame() {
        this.scene.resume();
    }

    /**
     * Restart main scene
     */
    restartGame() {
        this.scene.restart();
    }

    /**
     * Mute sound on ui button click
     * @param {Object} button
     */
    muteSound(button) {
        let MainScene = this.scene.scene.get('Main');

        Config.mute = !Config.mute;
        MainScene.sound.setMute(Config.mute);

        button.innerHTML = Config.mute ? (Svg.soundOff + 'Включить звук') : (Svg.soundOn + 'Выключить звук');

        let Ui = this.scene.scene.get('Ui');

        Ui.updateIcons();
    }

    /**
     * Navigate buttons on pouse screen
     * @param {Number} sign - 1 or -1
     */
    focusButton(sign) {
        let Buttons = Object.values(BUTTONS);
        let activeButton = {};

        Buttons.forEach((button, i) => {
            if (button.el === document.activeElement) {
                activeButton.el = button;
                activeButton.index = i;
            }
        });

        if (activeButton.el) {
            /** Down button */
            if (sign > 0) {
                let nextButton = Buttons[activeButton.index + 1] ? Buttons[activeButton.index + 1].el : null;

                if (nextButton) {
                    nextButton.focus();
                } else {
                    Buttons[0].el.focus();
                }
            /** Up button */
            } else {
                let prevButton = Buttons[activeButton.index - 1] ? Buttons[activeButton.index - 1].el : null;

                if (prevButton) {
                    prevButton.focus();
                } else {
                    Buttons[Buttons.length - 1].el.focus();
                }
            }
        } else {
            Buttons[0].el.focus();
        }
    }
}

export default Overlay;