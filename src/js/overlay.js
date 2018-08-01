import Svg from './svg';
import GameObjects from './base/gameObjects';
import { makeElement, removeElement, isElementInDom } from './lib/dom';
import Config from './base/config';

let BUTTONS = null;

let clickHandler = function (event) {
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
};

class Overlay {
    constructor(type, scene, params = {}) {
        this.type = type;
        this.scene = scene;
        this.params = params;
        this.el = null;
        this.content = null;

        if (GameObjects.activeOverlay && isElementInDom(GameObjects.activeOverlay)) {
            removeElement(GameObjects.activeOverlay);
        }
        GameObjects.activeOverlay = null;

        this.init();
    }

    /**
     * Append overlay
     */
    init() {
        this.el = makeElement('div', 'overlay');

        this.makeContent();

        document.body.appendChild(this.el);

        clickHandler = clickHandler.bind(this);
        this.el.addEventListener('click', clickHandler);
    }

    /**
     * Destroy active overlay
     */
    destroy() {
        this.el.removeEventListener('click', clickHandler);

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
            case 'pause':
                this.makePause();
        }
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