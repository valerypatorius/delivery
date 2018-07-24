import '../css/game.styl';

import Phaser from 'phaser';

import Config from './config';
import Colors from './colors';
import Intervals from './intervals';
import CollisionCategories from './collisionCategories';

import Player from './player';
import Ground from './ground';
import Backgrounds from './backgrounds';

import { isMobile } from './lib/check';
import Death from './death';
import Obstacles from './obstacle';
import { getRandomNumber } from './lib/helper';

let GAME_OBJECTS = {
    backgrounds: null,
    ground: null,
    player: null,
    death: null,
    obstacles: null
};

let STATE = {
    started: false,
    paused: false,
    stopped: false
};

// let INTERVAL = {
//     location: null,
//     obstacles: null,
//     counter: null
// };

let OBSTACLES = null;
let OBSTACLES_FREQUENCY = 5;

let COUNTER = null;
let CURSORS = null;
let KEYS = null;
let POINTER = null;

let LOCATION = 0;
let SCORE = 0;

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
                        y: 2
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

    /** Death hands */
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

    /** Obstacles */
    path = './assets/obstacles';

    this.load.image(`obstacle_debree`, `${path}/debree.png`);
    this.load.image(`obstacle_ladder`, `${path}/ladder.png`);
    this.load.image(`obstacle_ladder_ground`, `${path}/ladder_ground.png`);
    this.load.image('obstacle_ghosts', `${path}/ghosts.png`);

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

    /** Obstacles */
    GAME_OBJECTS.obstacles = new Obstacles(this, GAME_OBJECTS.backgrounds, GAME_OBJECTS.player);

    /** Prepare animations */
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
    });

    /** Controls */
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

    /** Fade camera in */
    this.cameras.main.fadeIn(1000);

    OBSTACLES = ['obstacle_debree', 'obstacle_ladder', 'obstacle_ghosts'];
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
                start(this);
            }
        } else if (CURSORS.left.isDown || KEYS.A.isDown) {
            GAME_OBJECTS.player.top.setVelocity(-1, -0.5);

            if (!STATE.started) {
                STATE.started = true;
                start(this);
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

        /** If fall angle is too large, drop player and end the game */
        let playerAngle = GAME_OBJECTS.player.top.angle;
        let isFallAngle = 0;

        if (playerAngle > Config.maxPlayerFallAngle) {
            isFallAngle = 1;
        } else if (playerAngle < -Config.maxPlayerFallAngle) {
            isFallAngle = -1;
        }

        if (isFallAngle !== 0) {
            STATE.stopped = true;

            for (let item in Intervals) {
                Intervals[item].remove(false);
            }

            this.cameras.main.resetFX();

            GAME_OBJECTS.player.legs.anims.stop('walking');
            GAME_OBJECTS.player.flashlight.anims.stop('flashlight');

            GAME_OBJECTS.player.bottom.setIgnoreGravity(false);

            GAME_OBJECTS.player.top.setDensity(100);
            GAME_OBJECTS.player.bottom.setDensity(350);

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
            }, 1200);
        }

        /** Update counter */
        if (Intervals.counter) {
            COUNTER.setText(SCORE + 'м');
        }
    }

    /** Pause game */
    // if (KEYS.ESC.isUp) {
    //     pause(this.scene, !STATE.paused);
    // }
}

function start(game) {
    GAME_OBJECTS.player.setStable(false);

    /** Update counter */
    Intervals.counter = game.time.addEvent({
        loop: true,
        delay: 1000,
        callback: () => {
            SCORE++;
        }
    });
    COUNTER.setVisible(true);

    /** Update location */
    Intervals.location = game.time.addEvent({
        loop: true,
        delay: 50 * 1000,
        callback: () => {
            LOCATION++;

            if (LOCATION > 2) {
                LOCATION = 0;
            }

            GAME_OBJECTS.backgrounds.changeLocation(LOCATION, GAME_OBJECTS.obstacles.imagesToTween);
        }
    });

    /** Spawn obstacles interval */
    addObstacles(game);
}

function addObstacles(game) {
    Intervals.obstacles = game.time.addEvent({
        delay: OBSTACLES_FREQUENCY * 1000,
        callback: () => {
            let texture = OBSTACLES[getRandomNumber(0, OBSTACLES.length - 1)];
            let bottomOffset = 0;

            switch (texture) {
                case 'obstacle_ladder':
                    bottomOffset = 102;
                    break;
                case 'obstacle_debree':
                    bottomOffset = 92;
                    break;
                default:
                    bottomOffset = 55;
                    break;
            }

            GAME_OBJECTS.obstacles.spawn({
                x: Config.width,
                y: Config.height - bottomOffset,
                texture
            });

            OBSTACLES_FREQUENCY = getRandomNumber(5, 15);

            addObstacles(game);
        }
    });
}

function pause(scene, isPaused) {
    if (isPaused) {
        scene.pause();
    } else {
        scene.resume();
    }

    STATE.paused = isPaused;
};

export default Main;