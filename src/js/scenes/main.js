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

import {
    getRandomNumber
} from '../lib/helper';
import {
    isElementInDom, removeElement
} from '../lib/dom';

let LOCATION = 0;

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
            this.load.image('pixel', './assets/pixel.png');

            /** Player body parts */
            let path = './assets/player';

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
            this.load.spritesheet('death', `./assets/death.png`, {
                frameWidth: 355,
                frameHeight: 110
            });

            /** Global backgrounds */
            path = './assets/background/global';

            for (let i = 1; i <= 6; i++) {
                this.load.image(`background_global_landscape_${i}`, `${path}/landscape/${i}.png`);
            }

            this.load.image(`background_global_cords_1`, `${path}/cords/1.png`);
            this.load.image(`background_global_ground_1`, `${path}/ground/1.png`);
            this.load.image(`background_global_grass_1`, `${path}/grass/1.png`);

            /** Wasteland backgrounds */
            path = './assets/background/wasteland';

            for (let i = 1; i <= 7; i++) {
                this.load.image(`background_wasteland_back_${i}`, `${path}/back/${i}.png`);
            }

            for (let i = 1; i <= 8; i++) {
                this.load.image(`background_wasteland_front_${i}`, `${path}/front/${i}.png`);
            }

            /** Forest backgrounds */
            path = './assets/background/forest';

            for (let i = 1; i <= 7; i++) {
                this.load.image(`background_forest_back_${i}`, `${path}/back/${i}.png`);
            }

            for (let i = 1; i <= 8; i++) {
                this.load.image(`background_forest_front_${i}`, `${path}/front/${i}.png`);
            }

            /** City backgrounds */
            path = './assets/background/city';

            for (let i = 1; i <= 5; i++) {
                this.load.image(`background_city_back_${i}`, `${path}/back/${i}.png`);
            }

            for (let i = 1; i <= 5; i++) {
                this.load.image(`background_city_front_${i}`, `${path}/front/${i}.png`);
            }

            /** Obstacles */
            path = './assets/obstacles';

            this.load.image(`obstacle_ladder`, `${path}/ladder.png`);
            this.load.image(`obstacle_ladder_ground`, `${path}/ladder_ground.png`);

            for (let i = 1; i <= 3; i++) {
                this.load.image(`obstacle_debree_${i}`, `${path}/debree_${i}.png`);
            }

            for (let i = 1; i <= 3; i++) {
                this.load.image(`obstacle_ghosts_${i}`, `${path}/ghosts_${i}.png`);
            }

            /** Sounds */
            this.load.audio('intro', [
                './assets/audio/intro.mp3'
            ]);

            this.load.audio('loop', [
                './assets/audio/loop.mp3'
            ]);

            /** Show load progress */
            let text = this.make.text({
                x: Config.width / 2,
                y: Config.height / 2,
                text: '0%',
                style: {
                    font: '700 18px Montserrat',
                    fill: Colors.hex.white
                }
            }).setOrigin(0.5, 0.5);

            this.load.on('progress', value => {
                text.setText(parseInt(value * 100) + '%');
            });

            this.load.on('complete', () => {
                text.destroy();
            });

            States.loaded = true;
        }
    }

    create() {
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

        /** Controls */
        CURSORS = this.input.keyboard.createCursorKeys();
        POINTER = this.input.pointer1;
        KEYS = {
            A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
        };

        // this.input.keyboard.on('keydown_ESC', () => this.pause());
        // this.input.keyboard.on('keydown_M', () => {
        //     Config.mute = !Config.mute;

        //     this.sound.setMute(Config.mute);

        //     let Ui = this.scene.get('Ui');
        //     Ui.updateIcons();
        // });

        /** Fade camera in */
        this.cameras.main.fadeIn(1000);

        /** Obstacles list (ladder x3 to increase spawn chance) */
        OBSTACLES = [
            'obstacle_ladder', 'obstacle_ladder', 'obstacle_ladder',
            'obstacle_ghosts_1', 'obstacle_ghosts_2', 'obstacle_ghosts_3',
            'obstacle_debree_1', 'obstacle_debree_2', 'obstacle_debree_3'
        ];

        /** Play sounds */
        AUDIO.intro = this.sound.add('intro', {
            loop: false
        });

        AUDIO.loop = this.sound.add('loop', {
            loop: true
        });

        this.sound.setMute(Config.mute);

        AUDIO.intro.play();

        AUDIO.loop.play({
            delay: AUDIO.intro.duration
        });

        this.tweens.addCounter({
            duration: 2000,
            onUpdate: counter => {
                let value = parseFloat(counter.getValue().toFixed(1));
                this.sound.setVolume(value);
            }
        });

        /** Launch ui */
        if (!States.created) {
            this.scene.launch('Ui');
        }

        States.created = true;

        /** Re-enable keyboard */
        document.removeEventListener('keydown', disableDefault);
    }

    update() {
        let worldCenter = Config.width / 2;
        let worldMiddle = Config.height / 2;

        if (!States.stopped && !States.paused) {

            let playerAngle = GameObjects.player.top.angle;

            /** PLay walking animation */
            GameObjects.player.legs.anims.play('walking', true);
            GameObjects.player.flashlight.anims.play('flashlight', true);

            /** Control balance with keyboard */
            let deltaY = Math.abs(Math.round(playerAngle / 10));
            let velocityY = 1.5 / (deltaY !== 0 ? deltaY : 2);

            if (CURSORS.right.isDown || KEYS.D.isDown) {
                GameObjects.player.top.setVelocity(1, playerAngle > 0 ? -velocityY : velocityY);

                this.start();
            } else if (CURSORS.left.isDown || KEYS.A.isDown) {
                GameObjects.player.top.setVelocity(-1.5, playerAngle > 0 ? velocityY : -velocityY);

                this.start();
            }

            /** Control balance with touch */
            if (POINTER.isDown) {
                if (POINTER.worldX < Config.width / 2) {
                    GameObjects.player.top.setVelocity(-1.5, playerAngle > 0 ? velocityY : -velocityY);
                } else if (POINTER.worldX >= Config.width / 2) {
                    GameObjects.player.top.setVelocity(1, playerAngle > 0 ? -velocityY : velocityY);
                }

                this.start();
            }

            /** Update ui anchor angle */
            let UiScene = this.scene.get('Ui');
            UiScene.updateBalanceHelper(playerAngle);

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
                for (let item in Intervals) {
                    if (Intervals[item]) {
                        if (item === 'counter') {
                            Intervals[item].paused = true;
                        } else {
                            Intervals[item].remove(false);
                        }
                    }
                }

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

                    if (isTouchedGround) {
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
                                    // TODO: SHOW FINAL OVERLAY
                                }
                            });
                        }, 500);
                    }

                });
            }
        }
    }

    /**
     * Start game
     */
    start() {
        let Ui = this.scene.get('Ui');

        if (!States.started) {
            States.started = true;

            GameObjects.player.setStable(false);

            /** Start counter */
            Ui.startCounter();

            /** Remove welcome tip */
            Ui.removeTip();

            /** Update location */
            Intervals.location = this.time.addEvent({
                loop: true,
                delay: 50 * 1000,
                callback: () => {
                    LOCATION++;

                    if (LOCATION > 2) {
                        LOCATION = 0;
                        Config.gravity++;
                    }

                    GameObjects.backgrounds.changeLocation(LOCATION, GameObjects.obstacles.imagesToTween);
                }
            });

            /** Spawn obstacles */
            this.addObstacles();
        }
    }

    /**
     * Pause game
     */
    pause() {
        if (States.created) {
            this.scene.pause('Main');
            this.scene.pause('Ui');
            this.scene.setVisible(false, 'Ui');

            if (this.scene.get('Pause').scene.isSleeping()) {
                this.scene.wake('Pause');
            } else {
                this.scene.launch('Pause');
            }

            this.sound.pauseAll();

            States.paused = false;

            GameObjects.activeOverlay = new Overlay('pause', this);
        }
    }

    /**
     * Resume game from pause menu
     */
    resume() {
        if (States.created) {
            this.scene.resume('Main');
            this.scene.resume('Ui');

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
            let UiScene = this.scene.get('Ui');

            UiScene.setBalanceHelperVisible(true);

            for (let item in Intervals) {
                if (Intervals[item]) {
                    Intervals[item].remove(false);
                }
            }

            if (isElementInDom(GameObjects.obstacles.noise)) {
                removeElement(GameObjects.obstacles.noise);
            }

            this.scene.restart();
            UiScene.scene.restart();

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

            if (DEATH_TIMEOUT) {
                clearTimeout(DEATH_TIMEOUT);
            }

            DEATH_TIMEOUT = null;

            States.paused = false;
            States.started = false;
            States.stopped = false;

            if (GameObjects.activeOverlay){
                GameObjects.activeOverlay.destroy();
            }

            this.scene.setVisible(true, 'Ui');
        }
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