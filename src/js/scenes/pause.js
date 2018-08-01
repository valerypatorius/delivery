import GameObjects from '../base/gameObjects';

class Pause extends Phaser.Scene {
    constructor() {
        super({ key: 'Pause' });
    }

    create() {
        this.input.keyboard.on('keydown_ESC', () => this.resume());

        /** Navigate pause menu with keyboard */
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

    /**
     * Resume main scene
     */
    resume() {
        let MainScene = this.scene.get('Main');
        MainScene.resume();
    }
}

export default Pause;