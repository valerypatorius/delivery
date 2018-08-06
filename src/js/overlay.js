import Svg from './svg';
import GameObjects from './base/gameObjects';
import { makeElement, removeElement, isElementInDom } from './lib/dom';
import * as Share from './lib/share';
import Config from './base/config';
import ResultsTable from './resultsTable';
import Request from './lib/request';
import { preloadImages } from './lib/helper';

let BUTTONS = null;

class Overlay {
    constructor(type, scene, params = {}) {
        this.type = type;
        this.scene = scene;
        this.params = params;
        this.el = null;
        this.content = null;
        this.resultsTable = null;

        this.sessionId = window.__sessionId || null;
        this.isLogined = window.__isLogined || false;

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

    storageEventHandler() {
        if (parseInt(localStorage.logged_in) === 1) {
            localStorage.removeItem('logged_in');

            this.checkAuth(isLogined => {
                if (isLogined) {
                    let button = document.querySelector('[data-click="showAuthWindow"]');

                    if (button) {
                        button.dataset.click = 'showResultsTable';
                    }

                    this.hideAuthWindow();
                    this.showResultsTable();
                }
            });
        }

        if (localStorage.auth_error) {
            console.log('Auth error', localStorage.auth_error);
            localStorage.removeItem('auth_error');
        }
    };

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

        if (GameObjects.resultsTable) {
            GameObjects.resultsTable.destroy();
            GameObjects.resultsTable = null;
        }
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
                href: 'https://dclub.app.link/pGeHHzgW9O',
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

        let rules = makeElement('a', 'start__rules', {
            href: '/special/genius/terms',
            target: '_blank',
            textContent: 'Правила конкурса'
        });
        start.appendChild(rules);

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
            innerHTML: 'Ты прошёл<br>' + Ui.getCounterValue()
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
            innerHTML: Svg.cup + 'Найти результат в&nbsp;'
        });
        resultPromo.appendChild(resultPromoTable);

        let resultPromoTableButton = makeElement('span', [], {
            textContent: 'турнирной таблице'
        });
        resultPromoTable.appendChild(resultPromoTableButton);

        if (this.isLogined) {
            resultPromoTableButton.dataset.click = 'showResultsTable';
        } else {
            resultPromoTableButton.dataset.click = 'showAuthWindow';
            window.addEventListener('storage', () => this.storageEventHandler());
        }

        let resultPromoText = makeElement('div', 'resultPromo__text', {
            innerHTML: 'Курьеры Delivery Express не застревают на ровном месте, слушают только весёлую музыку и&nbsp;используют велосипеды и мопеды, чтобы доставить обед максимально быстро.'
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
            href: 'https://dclub.app.link/pGeHHzgW9O',
            target: '_blank',
            innerHTML: 'Сделать заказ <span>&nbsp;в Delivery Club</span>'
        });
        resultPromo.appendChild(resultPromoLink);

        this.makeResultsTable();

        preloadImages([
            window.__PATH + '/assets/ui/login/fb.png',
            window.__PATH + '/assets/ui/login/vk.png',
            window.__PATH + '/assets/ui/login/twitter.png',
            window.__PATH + '/assets/ui/login/google.png'
        ]);
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

        this.resultsTable = makeElement('div', 'resultTable__table');
        container.appendChild(this.resultsTable);

        this.content.appendChild(container);
    }

    showResultsTable() {
        this.content.children[0].classList.add('state--hidden');
        this.content.children[1].classList.remove('state--hidden');

        if (!GameObjects.resultsTable) {
            GameObjects.resultsTable = new ResultsTable(this.resultsTable);
        }
        GameObjects.resultsTable.load();
    }

    hideResultsTable() {
        this.content.children[0].classList.remove('state--hidden');
        this.content.children[1].classList.add('state--hidden');
    }

    showAuthWindow() {
        this.authWindow = makeElement('div', 'auth');

        let title = makeElement('div', 'auth__title', {
            textContent: 'Авторизуйтесь, чтобы посмотреть результат'
        });
        this.authWindow.appendChild(title);

        let close = makeElement('div', 'auth__close', {
            innerHTML: Svg.close,
            data: {
                click: 'hideAuthWindow'
            }
        });
        this.authWindow.appendChild(close);

        let buttons = makeElement('div', 'auth__buttons');
        this.authWindow.appendChild(buttons);

        let socials = {
            vk: {
                url: '/auth/vk',
                text: 'Вконтакте'
            },
            fb: {
                url: '/auth/facebook',
                text: 'Facebook'
            },
            twitter: {
                url: '/auth/twitter',
                text: 'Twitter'
            },
            google: {
                url: '/auth/googleplus',
                text: 'Google'
            }
        };

        for (let name in socials) {
            let button = makeElement('button', ['auth__button', 'auth__button--' + name], {
                textContent: socials[name].text,
                data: {
                    click: 'auth',
                    url: socials[name].url
                }
            });

            buttons.appendChild(button);
        }

        let rules = makeElement('div', 'auth__rules', {
            innerHTML: '*Авторизуясь, вы соглашаетесь с&nbsp;<a href="/terms" target="_blank">правилами</a> пользования сайтом и&nbsp;даёте согласие на обработку <a href="/agreement" target="_blank">персональных данных</a>.'
        });
        this.authWindow.appendChild(rules);

        this.content.classList.add('state--darken');
        this.content.appendChild(this.authWindow);
    }

    hideAuthWindow() {
        if (isElementInDom(this.authWindow)) {
            removeElement(this.authWindow);
        }

        this.content.classList.remove('state--darken');
    }

    checkAuth(callback) {
        let data = {
            sessionId: this.sessionId
        };

        Request('/special/genius/checkAuth', 'POST', data).then(() => {
            window.__isLogined = this.isLogined = true;
            callback(true);
        }).catch(() => {
            callback(false);
        });
    }

    auth(button) {
        let url = button.dataset.url;
        let left = (screen.width / 2) - (800 / 2);
        let top = (screen.height / 2) - (570 / 2);
        let authWindow;

        localStorage.removeItem('logged_in');
        authWindow = window.open(url, 'displayWindow', `width=720,height=440,left=${left},top=${top},location=no,directories=no,status=no,toolbar=no,menubar=no`);
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