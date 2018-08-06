import Config from '../base/config';
import Colors from '../base/colors';
import States from '../base/states';
import Intervals from '../base/intervals';
import { isMobile } from '../lib/check';

import Steve from '../steve';

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
        if (COUNTER && !States.paused) {
            let score = (SCORE / 1000).toFixed(2);

            COUNTER.setText(score + ' м');
        }
    }

    /**
     * Start progress counter
     */
    startCounter() {
        Steve.init();

        let start = Steve.now();

        Intervals.counter = this.time.addEvent({
            loop: true,
            delay: 0,
            callback: () => {
                let end = Steve.now();
                SCORE = SCORE + (end - start);
                start = end;
            }
        });

        Intervals.steve = this.time.addEvent({
            loop: true,
            delay: Steve.interval,
            callback: () => {
                Steve.formPackage(SCORE);
            }
        });

        COUNTER.setVisible(true);
    }

    getCounterValue() {
        return ((SCORE / 1000).toFixed(2) || 0) + '&nbsp;м';
    }

    /**
     * Update ui icons (e.g. when sound is muted)
     */
    updateIcons() {
        BUTTONS.sound.setFrame(Config.mute ? 1 : 0);
    }

    /**
     * Sync balance helper's angle with player's body
     * @param {Number} angle - current player's angle
     * @param {Number} gravity - current vertical gravity
     */
    updateBalanceHelper(angle, gravity) {
        if (BALANCE_HELPER.anchor) {
            let helperAngle = angle * 0.9;
            BALANCE_HELPER.anchor.setAngle(helperAngle);
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

            if (!isMobile()) {
                TIP.start = this.make.text({
                    x: x - 177,
                    y: y - 40,
                    text: 'Используй',
                    style: {
                        font: '500 26px Montserrat',
                        fill: Colors.hex.white
                    }
                }).setOrigin(0.5, 1);

                TIP.end = this.make.text({
                    x: x + 185,
                    y: y - 40,
                    text: ', чтобы держать равновесие',
                    style: {
                        font: '500 26px Montserrat',
                        fill: Colors.hex.white
                    }
                }).setOrigin(0.5, 1);

                TIP.icon = this.add.image(x - 55, y - 53, 'arrows');

                this.tweens.addCounter({
                    from: 0.8,
                    to: 1,
                    duration: 1200,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Quad.easeInOut',
                    onUpdate: (counter, value) => {
                        TIP.icon.setScale(value.value);
                    }
                });
            } else {
                TIP.text = this.make.text({
                    x: Config.width / 2,
                    y: y - 30,
                    text: 'Нажимай на экран, чтобы держать равновесие',
                    style: {
                        font: '500 26px Montserrat',
                        fill: Colors.hex.white,
                        align: 'center',
                        wordWrap: {
                            width: Config.width - 30,
                            useAdvancedWrap: true
                        }
                    }
                }).setOrigin(0.5, 1);

                TIP.iconRight = this.add.image(Config.width - 50, y - 200, 'tap_right');
                TIP.iconLeft = this.add.image(50, y - 200, 'tap_right').setFlipX(true);

                this.tweens.addCounter({
                    from: 0.6,
                    to: 1,
                    duration: 1200,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Quad.easeInOut',
                    onUpdate: (counter, value) => {
                        TIP.iconRight.setScale(value.value);
                        TIP.iconLeft.setScale(value.value);
                    }
                });
            }

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