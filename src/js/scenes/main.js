import Config from '../base/config';
import Colors from '../base/colors';
import States from '../base/states';
import Intervals from '../base/intervals';
import GameObjects from '../base/gameObjects';

import Player from '../gameObjects/player';
import Ground from '../gameObjects/ground';
import Backgrounds from '../gameObjects/backgrounds';
import Death from '../gameObjects/death';
import Obstacles from '../gameObjects/obstacles';

import Overlay from '../overlay';
import Steve from '../steve';

import * as Analytics from '../lib/analytics';

import {
    getRandomNumber
} from '../lib/helper';
import {
    isElementInDom, removeElement
} from '../lib/dom';

let ASSETS_PATH = window.__PATH;

let LOCATION = 0;
let LOCATIONS_INTERVAL = 30;

let AUDIO = {};

let CURSORS = null;
let KEYS = null;
let POINTER = null;

let OBSTACLES = [];
let OBSTACLES_FREQUENCY = 5;

let DEATH_TIMEOUT = null;

let disableDefault = event => {
    event.preventDefault();
};

class Main extends Phaser.Scene {
    constructor() {
        super({
            key: 'Main'
        });

        /**
         * Pressing ESC key somehow breaks preloading,
         * so disable keydown events until it finishes
         */
        document.addEventListener('keydown', disableDefault);
    }

    preload() {
        if (!States.loaded) {
            let progressBar = this.add.graphics();

            this.load.image('overlay_start', ASSETS_PATH + '/assets/start.jpg');
            this.load.image('overlay_start_button', ASSETS_PATH + '/assets/ui/start_button.png');
            this.load.image('overlay_pause_button', ASSETS_PATH + '/assets/ui/pause_button.png');
            this.load.image('overlay_restart_button', ASSETS_PATH + '/assets/ui/restart_button.png');
            this.load.image('overlay_fb_button', ASSETS_PATH + '/assets/ui/fb_button.png');
            this.load.image('overlay_vk_button', ASSETS_PATH + '/assets/ui/vk_button.png');
            this.load.image('overlay_twitter_button', ASSETS_PATH + '/assets/ui/twitter_button.png');
            this.load.image('overlay_result', ASSETS_PATH + '/assets/result.jpg');
            this.load.image('arrow_left', ASSETS_PATH + '/assets/ui/arrow_left.svg');

            this.load.image('login_button_vk', ASSETS_PATH + '/assets/ui/login/vk.png');
            this.load.image('login_button_fb', ASSETS_PATH + '/assets/ui/login/fb.png');
            this.load.image('login_button_twitter', ASSETS_PATH + '/assets/ui/login/twitter.png');
            this.load.image('login_button_google', ASSETS_PATH + '/assets/ui/login/google.png');

            this.load.image('pixel', ASSETS_PATH + '/assets/pixel.png');

            /** Player body parts */
            let path = ASSETS_PATH + '/assets/player';

            this.load.image('body', `${path}/body.png`);
            this.load.image('rightArm', `${path}/arm_right.png`);
            this.load.image('leftArm', `${path}/arm_left.png`);
            this.load.image('backpack', `${path}/backpack.png`);
            this.load.image('phantomLegs', `${path}/legs_phantom.png`);
            this.load.spritesheet('legs', `${path}/legs.png`, {
                frameWidth: 159,
                frameHeight: 184
            });
            this.load.spritesheet('flashlight', `${path}/flashlight.png`, {
                frameWidth: 125,
                frameHeight: 95
            });

            /** Death hands */
            this.load.spritesheet('death', ASSETS_PATH + '/assets/death.png', {
                frameWidth: 355,
                frameHeight: 110
            });

            /** Global backgrounds */
            path = ASSETS_PATH + '/assets/background/global';

            for (let i = 1; i <= 6; i++) {
                this.load.image(`background_global_landscape_${i}`, `${path}/landscape/${i}.png`);
            }

            this.load.image(`background_global_cords_1`, `${path}/cords/1.png`);
            this.load.image(`background_global_ground_1`, `${path}/ground/1.png`);
            this.load.image(`background_global_grass_1`, `${path}/grass/1.png`);

            /** Wasteland backgrounds */
            path = ASSETS_PATH + '/assets/background/wasteland';

            for (let i = 1; i <= 7; i++) {
                this.load.image(`background_wasteland_back_${i}`, `${path}/back/${i}.png`);
            }

            for (let i = 1; i <= 8; i++) {
                this.load.image(`background_wasteland_front_${i}`, `${path}/front/${i}.png`);
            }

            /** Forest backgrounds */
            path = ASSETS_PATH + '/assets/background/forest';

            for (let i = 1; i <= 7; i++) {
                this.load.image(`background_forest_back_${i}`, `${path}/back/${i}.png`);
            }

            for (let i = 1; i <= 8; i++) {
                this.load.image(`background_forest_front_${i}`, `${path}/front/${i}.png`);
            }

            /** City backgrounds */
            path = ASSETS_PATH + '/assets/background/city';

            for (let i = 1; i <= 5; i++) {
                this.load.image(`background_city_back_${i}`, `${path}/back/${i}.png`);
            }

            for (let i = 1; i <= 5; i++) {
                this.load.image(`background_city_front_${i}`, `${path}/front/${i}.png`);
            }

            /** Obstacles */
            path = ASSETS_PATH + '/assets/obstacles';

            this.load.image(`obstacle_ladder`, `${path}/ladder.png`);
            this.load.image(`obstacle_ladder_ground`, `${path}/ladder_ground.png`);

            for (let i = 1; i <= 3; i++) {
                this.load.image(`obstacle_debree_${i}`, `${path}/debree_${i}.png`);
            }

            for (let i = 1; i <= 3; i++) {
                this.load.image(`obstacle_ghosts_${i}`, `${path}/ghosts_${i}.png`);
            }

            /** Sounds */
            path = ASSETS_PATH + '/assets/audio';

            this.load.audio('intro', `${path}/intro.mp3`);
            this.load.audio('loop', `${path}/loop.mp3`);

            /** Ui */
            path = ASSETS_PATH + '/assets/ui';

            this.load.image('pause', `${path}/pause.png`);

            this.load.spritesheet('sound', `${path}/sound.png`, {
                frameWidth: 62,
                frameHeight: 52
            });

            this.load.image('balance_line', `${path}/balance_line.png`);
            this.load.image('balance_anchor', `${path}/balance_anchor.png`);

            this.load.image('arrows', `${path}/arrows.png`);
            this.load.image('tap_right', `${path}/tap_right.png`);

            /** Show load progress */
            let text = this.make.text({
                x: Config.width / 2,
                y: Config.height / 2 + 50,
                text: '0%',
                style: {
                    font: '700 22px Montserrat',
                    fill: Colors.hex.white
                },
                resolution: 1
            }).setOrigin(0.5, 0.5);

            this.load.on('progress', value => {
                progressBar.clear();
                progressBar.fillStyle(Colors.green, 1);
                progressBar.fillRect(50, Config.height /2, (Config.width - 100) * value, 2);

                text.setText(parseInt(value * 100) + '%');
            });

            this.load.on('complete', () => {
                progressBar.destroy();
                text.destroy();
            });

            States.loaded = true;
        }
    }

    create() {
        /** Start overlay */
        if (!States.created) {
            this.cameras.main.alpha = 0;
            GameObjects.activeOverlay = new Overlay('start', this);
        } else {
            this.start();
        }

        let worldCenter = Config.width / 2;
        let worldMiddle = Config.height / 2;

        /** Background */
        GameObjects.backgrounds = new Backgrounds(this);

        /** Ground */
        GameObjects.ground = new Ground(this, {
            x: worldCenter,
            y: Config.height - 47,
            width: Config.width,
            height: 113
        });

        /** Player */
        GameObjects.player = new Player(this, {
            x: worldCenter,
            y: Config.height - 104,
            textures: {
                top: 'body',
                bottom: 'legs',
                hands: {
                    left: 'leftArm',
                    right: 'rightArm'
                },
                backpack: 'backpack',
                phantomLegs: 'phantomLegs',
                flashlight: 'flashlight'
            }
        });

        /** Obstacles */
        GameObjects.obstacles = new Obstacles(this, GameObjects.backgrounds, GameObjects.player);

        /** Prepare animations */
        if (!States.created) {
            this.anims.create({
                key: 'walking',
                frames: this.anims.generateFrameNumbers('legs', {
                    start: 0,
                    end: 120
                }),
                frameRate: 60,
                repeat: -1
            });

            this.anims.create({
                key: 'fall',
                frames: [{
                    key: 'legs',
                    frame: 42
                }],
                frameRate: 60
            });

            this.anims.create({
                key: 'flashlight',
                frames: this.anims.generateFrameNumbers('flashlight', {
                    start: 0,
                    end: 30
                }),
                frameRate: 60,
                repeat: -1
            });

            this.anims.create({
                key: 'death',
                frames: this.anims.generateFrameNumbers('death', {
                    start: 0,
                    end: 156
                }),
                frameRate: 60,
            });
        }

        /** Obstacles list (ladder x3 to increase spawn chance) */
        OBSTACLES = [
            'obstacle_ladder', 'obstacle_ladder', 'obstacle_ladder',
            'obstacle_ghosts_1', 'obstacle_ghosts_2', 'obstacle_ghosts_3',
            'obstacle_debree_1', 'obstacle_debree_2', 'obstacle_debree_3'
        ];

        /** Re-enable keyboard */
        document.removeEventListener('keydown', disableDefault);

        // this.input.keyboard.on('keyup_RIGHT', () => {
        //     PRESS_DURATION = 0;
        // });
        // this.input.keyboard.on('keyup_LEFT', () => {
        //     PRESS_DURATION = 0;
        // });
        // this.input.keyboard.on('keyup_A', () => {
        //     PRESS_DURATION = 0;
        // });
        // this.input.keyboard.on('keyup_D', () => {
        //     PRESS_DURATION = 0;
        // });

        // this.input.addUpCallback(() => {
        //     PRESS_DURATION = 0;
        // }, false);
    }

    update() {
        let worldCenter = Config.width / 2;
        let worldMiddle = Config.height / 2;

        if (!States.stopped && !States.paused && States.created) {

            let playerAngle = GameObjects.player.top.angle;

            /** PLay walking animation */
            GameObjects.player.legs.anims.play('walking', true);
            GameObjects.player.flashlight.anims.play('flashlight', true);

            /** Control balance with keyboard */
            // let deltaY = 0;
            let deltaY = Math.abs(Math.round(playerAngle / 500));
            let velocityY = (deltaY !== 0 ? deltaY : 2);

            let velocities = [0.5, 1, 1.5, 2, 2.25];
            let velocityX = velocities[getRandomNumber(0, velocities.length - 1)];

            if (CURSORS.right.isDown || KEYS.D.isDown) {
                GameObjects.player.top.setVelocity(velocityX, playerAngle > 0 ? 1 / velocityY : -velocityY);

                this.playGame();
                Steve.rememberKeyPress('r');

            } else if (CURSORS.left.isDown || KEYS.A.isDown) {
                GameObjects.player.top.setVelocity(-velocityX, playerAngle < 0 ? 1 / velocityY : -velocityY);

                this.playGame();
                Steve.rememberKeyPress('l');
            }

            /** Control balance with touch */
            if (POINTER.isDown && POINTER.worldY > 150) {
                if (POINTER.worldX < Config.width / 2) {
                    GameObjects.player.top.setVelocity(-velocityX, playerAngle < 0 ? 1 / velocityY : -velocityY);

                    Steve.rememberKeyPress('l');

                } else if (POINTER.worldX >= Config.width / 2) {
                    GameObjects.player.top.setVelocity(velocityX, playerAngle > 0 ? 1 / velocityY : -velocityY);

                    Steve.rememberKeyPress('r');
                }

                this.playGame();
            }

            /** Update ui anchor angle */
            let UiScene = this.scene.get('Ui');
            UiScene.updateBalanceHelper(playerAngle, this.matter.world.localWorld.gravity.y);

            /** If fall angle is too large, drop player and end the game */
            let isFallAngle = 0;

            if (playerAngle > Config.maxPlayerFallAngle) {
                isFallAngle = 1;
            } else if (playerAngle < -Config.maxPlayerFallAngle) {
                isFallAngle = -1;
            }

            if (isFallAngle !== 0) {
                States.stopped = true;

                /** Hide balance helper */
                UiScene.setBalanceHelperVisible(false);

                /** Stop all counters */
                Intervals.location.remove(false);
                Intervals.obstacles.remove(false);
                Intervals.music.remove(false);

                Intervals.counter.remove(true);
                Intervals.steve.remove(true);

                /** Disable all active camera effects */
                this.cameras.main.resetFX();

                /** Disable noise overlay, if it exists */
                if (isElementInDom(GameObjects.obstacles.noise)) {
                    removeElement(GameObjects.obstacles.noise);
                }

                /** Stop player sprite animations */
                GameObjects.player.legs.anims.stop('walking');
                GameObjects.player.flashlight.anims.stop('flashlight');

                /** Drop bottom part */
                GameObjects.player.bottom.setIgnoreGravity(false);

                /** Increase player's body density to drop it quickly */
                GameObjects.player.top.setDensity(200);
                GameObjects.player.bottom.setDensity(350);

                /** Remove friction from the body */
                GameObjects.player.top.setFriction(1);
                GameObjects.player.bottom.setFriction(1);

                /** Remove friction from arms (just in case) */
                GameObjects.player.rightHand.setFrictionAir(1);
                GameObjects.player.leftHand.setFrictionAir(1);

                /** Add so-called spine to prevent body folding */
                GameObjects.player.addFallConstraint(isFallAngle);

                /** Finish game completely, when body touches the ground  */
                this.matter.world.on('collisionstart', (event, bodyA, bodyB) => {

                    let isTouchedGround = bodyA.id === GameObjects.ground.instance.id;

                    if (isTouchedGround && !States.dropped) {
                        States.dropped = true;

                        this.tweens.pauseAll();

                        DEATH_TIMEOUT = setTimeout(() => {

                            /** Freeze player's body */
                            GameObjects.player.stop();

                            /** Fade music */
                            this.tweens.addCounter({
                                from: 1,
                                to: 0,
                                duration: 2000,
                                onUpdate: counter => {
                                    let value = parseFloat(counter.getValue().toFixed(1));
                                    this.sound.setVolume(value);
                                },
                                onComplete: () => {
                                    this.sound.stopAll();
                                }
                            });

                            /** Add death object */
                            GameObjects.death = new Death(this, {
                                x: worldCenter + 110 * isFallAngle,
                                y: Config.height - 90,
                                texture: 'death'
                            });

                            /** Play death animation */
                            GameObjects.death.instance.anims.play('death');

                            this.tweens.add({
                                targets: GameObjects.player.bodyParts,
                                y: '+=300',
                                duration: 1500,
                                delay: 1300,
                                onComplete: () => {
                                    this.finish();
                                }
                            });
                        }, 500);
                    }

                });
            }
        }
    }

    start() {
        if (GameObjects.activeOverlay) {
            GameObjects.activeOverlay.destroy();
        }

        this.cameras.main.alpha = 1;

        /** Launch ui */
        if (!States.created) {
            let Ui = this.scene.get('Ui');
            this.scene.launch('Ui');

            Ui.addTip('start');
        }

        /** Fade camera in */
        this.cameras.main.fadeIn(1000);

        /** Play sounds */
        AUDIO.intro = this.sound.add('intro');
        AUDIO.loop_1 = this.sound.add('loop');
        AUDIO.loop_2 = this.sound.add('loop');

        this.sound.setMute(Config.mute);

        AUDIO.intro.on('play', () => {
            if (Intervals.music) {
                Intervals.music.remove();
            }

            Intervals.music = this.time.addEvent({
                delay: (AUDIO.intro.duration - 6) * 1000,
                callback: () => {
                    AUDIO.loop_1.play();
                }
            });
        });

        AUDIO.intro.play();

        AUDIO.loop_1.on('play', () => {
            if (Intervals.music) {
                Intervals.music.remove();
            }

            Intervals.music = this.time.addEvent({
                delay: (AUDIO.loop_1.duration - 6) * 1000,
                callback: () => {
                    AUDIO.loop_2.play();
                }
            });
        });

        AUDIO.loop_2.on('play', () => {
            if (Intervals.music) {
                Intervals.music.remove();
            }

            Intervals.music = this.time.addEvent({
                delay: (AUDIO.loop_2.duration - 6) * 1000,
                callback: () => {
                    AUDIO.loop_1.play();
                }
            });
        });

        /** Fade sound on start */
        this.tweens.addCounter({
            duration: 2000,
            onUpdate: counter => {
                let value = parseFloat(counter.getValue().toFixed(1));
                this.sound.setVolume(value);
            }
        });

        /** Enable controls */
        CURSORS = this.input.keyboard.createCursorKeys();
        POINTER = this.input.pointer1;
        KEYS = {
            A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
        };

        if (!States.created) {
            Analytics.sendEvent('Start', 'Click');
        }

        States.created = true;
    }

    /**
     * Play game
     */
    playGame() {
        let Ui = this.scene.get('Ui');

        if (!States.started) {
            States.started = true;

            GameObjects.player.setStable(false);

            /** Start counter */
            Ui.startCounter();

            /** Remove sound tip */
            Ui.removeSoundTip();

            /** Remove welcome tip */
            Ui.removeTip();

            /** Update location */
            Intervals.location = this.time.addEvent({
                loop: true,
                delay: LOCATIONS_INTERVAL * 1000,
                callback: () => {
                    LOCATION++;

                    if (LOCATION > 2) {
                        LOCATION = 0;
                    }

                    GameObjects.backgrounds.changeLocation(LOCATION, GameObjects.obstacles.imagesToTween);
                }
            });

            /** Spawn obstacles */
            this.addObstacles();

            Analytics.sendEvent('Play', 'Start');
        }
    }

    /**
     * Pause game
     */
    pause() {
        if (States.created && !GameObjects.activeOverlay) {

            if (Intervals.counter) {
                Intervals.counter.remove(true);
            }
            if (Intervals.steve) {
                Intervals.steve.remove(true);
            }

            this.scene.pause('Main');
            // this.scene.pause('Ui');

            this.scene.setVisible(false, 'Ui');

            if (this.scene.get('Pause').scene.isSleeping()) {
                this.scene.wake('Pause');
            } else {
                this.scene.launch('Pause');
            }

            this.sound.pauseAll();

            States.paused = true;

            GameObjects.activeOverlay = new Overlay('pause', this);
        }
    }

    /**
     * Resume game from pause menu
     */
    resume() {
        if (States.created) {
            let Ui = this.scene.get('Ui');

            this.scene.resume('Main');
            // this.scene.resume('Ui');

            if (States.started && !States.stopped) {
                Ui.startCounter();
            }

            this.scene.sleep('Pause');

            States.paused = false;

            this.sound.resumeAll();

            if (GameObjects.activeOverlay) {
                GameObjects.activeOverlay.destroy();
            }

            this.scene.setVisible(true, 'Ui');
        }
    }

    /**
     * Restart game
     */
    restart() {
        if (States.created) {
            let Ui = this.scene.get('Ui');

            Ui.setBalanceHelperVisible(true);

            if (Intervals.location) {
                Intervals.location.remove(false);
            }

            if (Intervals.obstacles) {
                Intervals.obstacles.remove(false);
            }

            Intervals.music.remove(false);

            if (Intervals.counter) {
                Intervals.counter.remove(true);
            }

            if (Intervals.steve) {
                Intervals.steve.remove(true);
            }

            if (isElementInDom(GameObjects.obstacles.noise)) {
                removeElement(GameObjects.obstacles.noise);
            }

            Steve.reset();

            this.scene.restart();
            Ui.scene.restart();

            this.scene.sleep('Pause');

            for (let name in CURSORS) {
                CURSORS[name].reset();
            }

            for (let name in KEYS) {
                KEYS[name].reset();
            }

            CURSORS = null;
            KEYS = null;
            POINTER = null;

            OBSTACLES = [];
            OBSTACLES_FREQUENCY = 5;

            LOCATION = 0;

            if (DEATH_TIMEOUT) {
                clearTimeout(DEATH_TIMEOUT);
            }

            DEATH_TIMEOUT = null;

            States.paused = false;
            States.started = false;
            States.stopped = false;
            States.dropped = false;

            if (GameObjects.activeOverlay){
                GameObjects.activeOverlay.destroy();
            }

            this.scene.setVisible(true, 'Ui');

            Analytics.sendEvent('Restart', 'Click');
        }
    }

    finish() {
        this.scene.setVisible(false, 'Ui');

        GameObjects.activeOverlay = new Overlay('result', this);

        Analytics.sendEvent('Result', 'Hit');
    }

    /**
     * Start spawning obstacles
     */
    addObstacles() {
        Intervals.obstacles = this.time.addEvent({
            delay: OBSTACLES_FREQUENCY * 1000,
            callback: () => {
                let texture = OBSTACLES[getRandomNumber(0, OBSTACLES.length - 1)];
                let bottomOffset = 0;

                if (texture.match(/obstacle_ladder/)) {
                    bottomOffset = 102;
                } else if (texture.match(/obstacle_debree/)) {
                    bottomOffset = 92;
                } else {
                    bottomOffset = -25;
                }

                GameObjects.obstacles.spawn({
                    x: Config.width,
                    y: Config.height - bottomOffset,
                    texture
                });

                OBSTACLES_FREQUENCY = getRandomNumber(8, 15);

                this.addObstacles();
            }
        });
    }
}

export default Main;