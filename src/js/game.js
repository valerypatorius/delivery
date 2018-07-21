import '../css/game.styl';

import Phaser from 'phaser';

import Config from './config';
import Colors from './colors';
import CollisionCategories from './collisionCategories';

import Player from './player';
import Ground from './ground';
import Backgrounds from './backgrounds';

import { isMobile } from './lib/check';

let GAME_OBJECTS = {
    backgrounds: null,
    ground: null,
    player: null
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
    this.load.spritesheet('legs', `${path}/legs.png`, {
        frameWidth: 159,
        frameHeight: 184
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
    });
    text.setOrigin(0.5, 0.5);

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
        x: isMobile() ? worldCenter : worldCenter/2,
        y: Config.height - 103,
        textures: {
            top: 'body',
            bottom: 'legs',
            hands: {
                left: 'leftArm',
                right: 'rightArm'
            },
            backpack: 'backpack'
        }
    });

    /** Prepare walking animation */
    this.anims.create({
        key: 'walking',
        frames: this.anims.generateFrameNumbers('legs', { start: 0, end: 120 }),
        frameRate: 60,
        repeat: -1
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
    if (!STATE.stopped) {

        /** PLay walking animation */
        GAME_OBJECTS.player.bottom.anims.play('walking', true);

        /** Control balance with keyboard */
        if (CURSORS.right.isDown || KEYS.D.isDown) {
            GAME_OBJECTS.player.top.setVelocity(1.25, 2);

            if (!STATE.started) {
                STATE.started = true;
                start(this.time);
            }
        } else if (CURSORS.left.isDown || KEYS.A.isDown) {
            GAME_OBJECTS.player.top.setVelocity(-1.25, -2);

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
        let isFallAngle = playerAngle > Config.maxPlayerFallAngle || playerAngle < -Config.maxPlayerFallAngle;

        if (isFallAngle) {
            // GAME_OBJECTS.player.stop();
            // GAME_OBJECTS.backgrounds.stop();
            // GAME_OBJECTS.player.bottom.anims.stop('walking');

            this.scene.pause();

            STATE.stopped = true;
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