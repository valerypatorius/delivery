import '../css/game.styl';

import Phaser from 'phaser';

import Config from './config';
import Colors from './colors';
import CollisionCategories from './collisionCategories';

import Player from './player';
import Ground from './ground';
import Backgrounds from './backgrounds';

import { isMobile } from './lib/check';
import Death from './death';

let GAME_OBJECTS = {
    backgrounds: null,
    ground: null,
    player: null,
    death: null
};

let COUNTER = null;
let CURSORS = null;
let KEYS = null;
let POINTER = null;

let LOCATION = 0;
let LOCATION_PROGRESS = 0;

let PROGRESS = null;
let SCORE = 0;

let STATE = {
    started: false,
    paused: false,
    stopped: false
};

class Main {
    constructor() {
        this.config = {
            type: Phaser.AUTO,
            width: Config.width,
            height: Config.height,
            // resolution: 0.5,
            physics: {
                default: 'matter',
                matter: {
                    gravity: {
                        x: 0,
                        y: 3
                    },
                    // debug: true,
                    debugBodyColor: 0xffffff
                }
            },
            scene: {
                preload,
                create,
                update
            }
        };
        this.game = new Phaser.Game(this.config);
    }
}

/**
 * Load assets, while showing progress bar
 */
function preload() {
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

    /** Death */
    this.load.spritesheet('death', `./assets/death.png`, {
        frameWidth: 355,
        frameHeight: 110
    });

    /** Global backgrounds */
    path = './assets/background/global';

    for (let i = 1; i <= 5; i++){
        this.load.image(`background_global_landscape_${i}`, `${path}/landscape/${i}.png`);
    }

    this.load.image(`background_global_cords_1`, `${path}/cords/1.png`);
    this.load.image(`background_global_ground_1`, `${path}/ground/1.png`);
    this.load.image(`background_global_grass_1`, `${path}/grass/1.png`);

    /** Wasteland backgrounds */
    path = './assets/background/wasteland';

    for (let i = 1; i <= 7; i++){
        this.load.image(`background_wasteland_back_${i}`, `${path}/back/${i}.png`);
    }

    for (let i = 1; i <= 8; i++){
        this.load.image(`background_wasteland_front_${i}`, `${path}/front/${i}.png`);
    }

    /** Forest backgrounds */
    path = './assets/background/forest';

    for (let i = 1; i <= 7; i++){
        this.load.image(`background_forest_back_${i}`, `${path}/back/${i}.png`);
    }

    for (let i = 1; i <= 8; i++){
        this.load.image(`background_forest_front_${i}`, `${path}/front/${i}.png`);
    }

    /** City backgrounds */
    path = './assets/background/city';

    for (let i = 1; i <= 5; i++){
        this.load.image(`background_city_back_${i}`, `${path}/back/${i}.png`);
    }

    for (let i = 1; i <= 5; i++){
        this.load.image(`background_city_front_${i}`, `${path}/front/${i}.png`);
    }

    /** Show load progress */
    let text = this.make.text({
        x: Config.width / 2,
        y: Config.height / 2,
        text: '0%',
        style: {
            font: '18px monospace',
            fill: Colors.white
        }
    }).setOrigin(0.5, 0.5);

    this.load.on('progress', value => {
        text.setText(parseInt(value * 100) + '%');
    });

    this.load.on('complete', () => {
        text.destroy();
    });
}

function create() {
    let worldCenter = Config.width / 2;
    let worldMiddle = Config.height / 2;

    /** Background */
    GAME_OBJECTS.backgrounds = new Backgrounds(this);

    /** Ground */
    GAME_OBJECTS.ground = new Ground(this, {
        x: worldCenter,
        y: Config.height - 47,
        width: Config.width,
        height: 113
    });

    /** Player */
    GAME_OBJECTS.player = new Player(this, {
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

    /** Prepare walking animation */
    this.anims.create({
        key: 'walking',
        frames: this.anims.generateFrameNumbers('legs', { start: 0, end: 120 }),
        frameRate: 60,
        repeat: -1
    });

    this.anims.create({
        key: 'fall',
        frames: [ { key: 'legs', frame: 42 } ],
        frameRate: 60
    });

    this.anims.create({
        key: 'flashlight',
        frames: this.anims.generateFrameNumbers('flashlight', { start: 0, end: 30 }),
        frameRate: 60,
        repeat: -1
    });

    this.anims.create({
        key: 'death',
        frames: this.anims.generateFrameNumbers('death', { start: 0, end: 156 }),
        frameRate: 60,
        // repeat: -1
    });

    /** Cursors */
    CURSORS = this.input.keyboard.createCursorKeys();
    POINTER = this.input.pointer1;
    KEYS = {
        A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
        D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
        ESC: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC),
    };

    /** Counter */
    COUNTER = this.make.text({
        x: Config.width,
        y: 0,
        padding: 20,
        text: '0м',
        style: {
            font: '700 32px Montserrat',
            fill: Colors.hex.white
        }
    }).setOrigin(1, 0).setVisible(false);

    this.cameras.main.fadeIn(1000);
}

function update() {
    let worldCenter = Config.width / 2;
    let worldMiddle = Config.height / 2;

    if (!STATE.stopped) {

        /** PLay walking animation */
        GAME_OBJECTS.player.legs.anims.play('walking', true);
        GAME_OBJECTS.player.flashlight.anims.play('flashlight', true);

        /** Control balance with keyboard */
        if (CURSORS.right.isDown || KEYS.D.isDown) {
            GAME_OBJECTS.player.top.setVelocity(1.25, 2);

            if (!STATE.started) {
                STATE.started = true;
                start(this.time);
            }
        } else if (CURSORS.left.isDown || KEYS.A.isDown) {
            GAME_OBJECTS.player.top.setVelocity(-1, -0.5);

            if (!STATE.started) {
                STATE.started = true;
                start(this.time);
            }
        }

        /** Control balance with touch */
        if (POINTER.isDown) {
            if (POINTER.worldX < Config.width / 2) {
                GAME_OBJECTS.player.top.setVelocity(-1.25, -2);
            } else if (POINTER.worldX >= Config.width / 2) {
                GAME_OBJECTS.player.top.setVelocity(1.25, 2);
            }
        }

        /** If fall angle is too large, stop game */
        let playerAngle = GAME_OBJECTS.player.top.angle;
        let isFallAngle = 0;

        if (playerAngle > Config.maxPlayerFallAngle) {
            isFallAngle = 1;
        } else if (playerAngle < -Config.maxPlayerFallAngle) {
            isFallAngle = -1;
        }

        if (isFallAngle !== 0) {
            STATE.stopped = true;

            GAME_OBJECTS.player.legs.anims.stop('walking');
            GAME_OBJECTS.player.flashlight.anims.stop('flashlight');

            GAME_OBJECTS.player.bottom.setIgnoreGravity(false);

            GAME_OBJECTS.player.top.setDensity(100);
            GAME_OBJECTS.player.bottom.setDensity(100);

            GAME_OBJECTS.player.top.setFriction(1);
            GAME_OBJECTS.player.bottom.setFriction(1);

            GAME_OBJECTS.player.rightHand.setFrictionAir(1);
            GAME_OBJECTS.player.leftHand.setFrictionAir(1);

            GAME_OBJECTS.player.addFallConstraint(isFallAngle);

            setTimeout(() => {
                GAME_OBJECTS.player.stop();

                this.tweens.pauseAll();

                GAME_OBJECTS.death = new Death(this, {
                    x: worldCenter + 110 * isFallAngle,
                    y: Config.height - 90,
                    texture: 'death'
                })

                GAME_OBJECTS.death.instance.anims.play('death');

                this.tweens.add({
                    targets: GAME_OBJECTS.player.bodyParts,
                    y: '+=300',
                    duration: 1500,
                    delay: 1300,
                    onComplete: () => {
                        this.make.text({
                            x: worldCenter,
                            y: worldMiddle,
                            text: 'YOU DIED',
                            style: {
                                font: '700 72px Montserrat',
                                fill: Colors.hex.white
                            }
                        }).setOrigin(0.5, 0.5);

                        this.scene.pause();
                    }
                });
            }, 800);

            // GAME_OBJECTS.player.bottom.setAngle(60 * isFallAngle);

            // GAME_OBJECTS.player.top.setStatic(true);
            // GAME_OBJECTS.player.bottom.setStatic(true);

            // GAME_OBJECTS.player.top.setCollidesWith(null);
            // GAME_OBJECTS.player.bottom.setCollidesWith(null);

            // this.tweens.add({
            //     targets: [GAME_OBJECTS.player.bottom, GAME_OBJECTS.player.top],
            //     y: '+=500',
            //     duration: 1000,
            //     onComplete: () => {

            //     }
            // });

            // GAME_OBJECTS.player.top.setCollidesWith(null);
            // GAME_OBJECTS.player.bottom.setCollidesWith(null);

            // GAME_OBJECTS.backgrounds.groups.global.ground.instance.setDepth(10);
            // GAME_OBJECTS.backgrounds.groups.global.ground.depth = 10;

            // this.matter.world.removeConstraint(GAME_OBJECTS.player.constraints.bottomLeft);
            // this.matter.world.removeConstraint(GAME_OBJECTS.player.constraints.bottomRight);
        }

        /** Update counter */
        if (PROGRESS) {
            COUNTER.setText(SCORE + 'м');
        }
    }

    /** Pause game */
    // if (KEYS.ESC.isDown) {
    //     pause(!IS_PAUSED);
    // }
}

function start(time) {
    GAME_OBJECTS.player.setStable(false);

    /** Update counter */
    PROGRESS = time.addEvent({
        loop: true,
        delay: 1000,
        callback: () => {
            SCORE++;
        }
    });
    COUNTER.setVisible(true);

    /** Update location */
    LOCATION_PROGRESS = time.addEvent({
        loop: true,
        delay: 50 * 1000,
        callback: () => {
            LOCATION++;

            if (LOCATION > 2) {
                LOCATION = 0;
            }

            GAME_OBJECTS.backgrounds.changeLocation(LOCATION);
        }
    });
}

// let pause = (isPaused) => {
//     if (isPaused) {
//         GAME_OBJECTS.player.stop();
//         GAME_OBJECTS.backgrounds.stop();
//         GAME_OBJECTS.player.bottom.anims.pause();
//     } else {
//         GAME_OBJECTS.player.play();
//         GAME_OBJECTS.backgrounds.play();
//         GAME_OBJECTS.player.bottom.anims.resume();
//     }

//     IS_PAUSED = isPaused;
// };

export default Main;