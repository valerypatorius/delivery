import States from '../base/states';
import GameObjects from '../base/gameObjects';

import Overlay from '../overlay';
import { isElementInDom } from '../lib/dom';

class Pause extends Phaser.Scene {
    constructor() {
        super({ key: 'Pause' });
    }

    create() {
        this.input.keyboard.on('keydown_ESC', () => this.resume());

        this.input.keyboard.on('keydown_DOWN', () => {
            GameObjects.activeOverlay.focusButton(1);
        });

        this.input.keyboard.on('keydown_S', () => {
            GameObjects.activeOverlay.focusButton(1);
        });

        this.input.keyboard.on('keydown_UP', () => {
            GameObjects.activeOverlay.focusButton(-1);
        });

        this.input.keyboard.on('keydown_W', () => {
            GameObjects.activeOverlay.focusButton(-1);
        });
    }

    resume() {
        let MainScene = this.scene.get('Main');

        MainScene.resume();
    }
}

export default Pause;