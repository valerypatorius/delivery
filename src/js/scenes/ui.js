import Config from '../base/config';
import Colors from '../base/colors';
import Audio from '../base/audio';
import Intervals from '../base/intervals';

let BUTTONS = {
    pause: null,
    sound: null
};

let COUNTER = null;
let SCORE = null;

let BALANCE_HELPER = {};

class Ui extends Phaser.Scene {
    constructor() {
        super({
            key: 'Ui'
        });
    }

    preload() {
        this.load.image('pause', './assets/ui/pause.png');

        this.load.spritesheet('sound', './assets/ui/sound.png', {
            frameWidth: 62,
            frameHeight: 52
        });

        this.load.image('balance_line', './assets/ui/balance_line.png');
        this.load.image('balance_anchor', './assets/ui/balance_anchor.png');
    }

    create() {
        let worldCenter = Config.width / 2;
        let worldMiddle = Config.height / 2;

        let MainScene = this.scene.get('Main');

        /** Pause */
        BUTTONS.pause = this.add.image(40, 40, 'pause').setOrigin(0, 0).setInteractive({
            cursor: 'pointer'
        });
        this.make.text({
            x: 48,
            y: 100,
            text: 'Esc',
            style: {
                font: '700 15px Montserrat',
                fill: Colors.hex.white
            }
        }).setOrigin(0, 0).setAlpha(0.5);

        BUTTONS.pause.on('pointerdown', () => MainScene.pause());

        /** Sound */
        BUTTONS.sound = this.add.sprite(185, 36, 'sound').setOrigin(1, 0).setInteractive({
            cursor: 'pointer'
        }).setFrame(Config.mute ? 1 : 0);
        this.make.text({
            x: 147,
            y: 100,
            text: 'M',
            style: {
                font: '700 15px Montserrat',
                fill: Colors.hex.white
            }
        }).setOrigin(0, 0).setAlpha(0.5);

        BUTTONS.sound.on('pointerdown', () => {
            Config.mute = !Config.mute;
            Audio.theme.setMute(Config.mute);

            BUTTONS.sound.setFrame(Config.mute ? 1 : 0);
        });

        for (let name in BUTTONS) {
            BUTTONS[name].on('pointerover', function() {
                this.setTint(Colors.green);
            });

            BUTTONS[name].on('pointerout', function() {
                this.clearTint();
            });
        }

        /** Score counter */
        SCORE = 0;

        COUNTER = this.make.text({
            x: Config.width,
            y: 0,
            padding: 30,
            text: '0м',
            style: {
                font: '700 42px Montserrat',
                fill: Colors.hex.white
            }
        }).setOrigin(1, 0).setVisible(false);

        /** Balance helper */
        BALANCE_HELPER.line = this.add.image(worldCenter, Config.height - 400, 'balance_line').setOrigin(0.5, 1);
        BALANCE_HELPER.anchor = this.add.image(worldCenter, Config.height - 365, 'balance_anchor').setOrigin(0.5, 1);
    }

    update() {
        if (COUNTER) {
            if (Intervals.counter) {
                SCORE = Intervals.counter.getElapsedSeconds().toFixed(2);
            }

            COUNTER.setText(SCORE + 'м');
        }
    }

    startCounter() {
        if (COUNTER) {
            Intervals.counter = this.time.addEvent({
                loop: true
            });
            COUNTER.setVisible(true);
        }
    }

    updateIcons() {
        BUTTONS.sound.setFrame(Config.mute ? 1 : 0);
    }

    updateAnchor(angle) {
        if (BALANCE_HELPER.anchor) {
            BALANCE_HELPER.anchor.setAngle(angle*0.799);
        }
    }

    setAnchorVisible(isVisible = true) {
        BALANCE_HELPER.line.setVisible(isVisible);
        BALANCE_HELPER.anchor.setVisible(isVisible);
    }
}

export default Ui;