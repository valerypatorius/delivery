import Config from '../base/config';
import Colors from '../base/colors';
import Intervals from '../base/intervals';

let BUTTONS = {
    pause: null,
    sound: null
};

let COUNTER = null;
let SCORE = null;

let BALANCE_HELPER = {};
let TIP = {};

class Ui extends Phaser.Scene {
    constructor() {
        super({
            key: 'Ui'
        });
    }

    create() {
        let worldCenter = Config.width / 2;
        let worldMiddle = Config.height / 2;

        let MainScene = this.scene.get('Main');

        /** Pause button */
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

        /** Sound button */
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
            MainScene.sound.setMute(Config.mute);

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

        /** Listen for keys pressings */
        this.input.keyboard.on('keydown_ESC', () => MainScene.pause());
        this.input.keyboard.on('keydown_M', () => {
            Config.mute = !Config.mute;
            MainScene.sound.setMute(Config.mute);
            this.updateIcons();
        });
    }

    update() {
        if (COUNTER) {
            if (Intervals.counter) {
                SCORE = Intervals.counter.getElapsedSeconds().toFixed(2);
            }

            COUNTER.setText(SCORE + 'м');
        }
    }

    /**
     * Start progress counter
     */
    startCounter() {
        if (COUNTER) {
            Intervals.counter = this.time.addEvent({
                loop: true
            });
            COUNTER.setVisible(true);
        }
    }

    /**
     * Update ui icons (e.g. when sound is muted)
     */
    updateIcons() {
        BUTTONS.sound.setFrame(Config.mute ? 1 : 0);
    }

    /**
     * Sync balance helper's angle with player's body
     * @param {Number} angle
     */
    updateBalanceHelper(angle) {
        if (BALANCE_HELPER.anchor) {
            BALANCE_HELPER.anchor.setAngle(angle*0.799);
        }
    }

    /**
     * Show or hide balance helper
     * @param {Boolean} isVisible
     */
    setBalanceHelperVisible(isVisible = true) {
        BALANCE_HELPER.line.setVisible(isVisible);
        BALANCE_HELPER.anchor.setVisible(isVisible);
    }

    /**
     * Add tip on screen (1 max)
     * @param {String} type
     */
    addTip(type) {
        let x = Config.width / 2 - 60;
        let y = Config.height;

        if (type === 'start') {
            TIP.start = this.make.text({
                x: x - 175,
                y: y - 40,
                text: 'Используй',
                style: {
                    font: '500 26px Montserrat',
                    fill: Colors.hex.white
                }
            }).setOrigin(0.5, 1);

            TIP.end = this.make.text({
                x: x + 180,
                y: y - 40,
                text: ', чтобы держать равновесие',
                style: {
                    font: '500 26px Montserrat',
                    fill: Colors.hex.white
                }
            }).setOrigin(0.5, 1);

            TIP.icon = this.add.image(x - 55, y - 53, 'arrows');
        }
    }

    /**
     * Remove active tip
     */
    removeTip() {
        for (let object in TIP) {
            TIP[object].destroy();
        }
    }
}

export default Ui;