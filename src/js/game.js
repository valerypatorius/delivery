import '../css/game.styl';

import Phaser from 'phaser';

// const Matter = Phaser.Physics.Matter.Matter;

const CONFIG = {
    width: 960,
    height: 600,
    maxPlayerFallAngle: 75
};

const COLLISION_CATEGORIES = {
    default: 0x0001,
    player: 0x0002,
    rightHand: 0x0004,
    leftHand: 0x0008,
    backpack: 0x0016
};

let GAME_OBJECTS = {
    backgrounds: null,
    ground: null,
    player: null
};

let COUNTER = null;
let CURSORS = null;

let PROGRESS = null;

class Main {
    constructor() {
        this.config = {
            type: Phaser.AUTO,
            width: CONFIG.width,
            height: CONFIG.height,
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

class Player {
    constructor(game, params) {
        this.game = game;
        this.matter = this.game.matter;

        this.isStatic = false;
        this.constraints = {};

        this.sizes = {
            top: {
                width: 84,
                height: 139
            },
            bottom: {
                width: 159,
                height: 184
            },
            hand: {
                width: 79,
                height: 205
            },
            axisoffsetX: -5,
            axisoffsetY: 80,
            springLength: 250
        };

        this.backpack = this.matter.add.image(params.x, params.y - this.sizes.bottom.height - 40, params.textures.backpack, null, {
            density: 0.0001,
            collisionFilter: {
                category: COLLISION_CATEGORIES.backpack,
                mask: null
            }
        });

        this.rightHand = this.matter.add.image(params.x + this.sizes.top.width / 2, params.y - this.sizes.bottom.height + 42, params.textures.hands.right, null, {
            density: 0.0001,
            collisionFilter: {
                category: COLLISION_CATEGORIES.rightHand,
                mask: null
            }
        });

        this.bottom = this.matter.add.sprite(params.x, params.y - this.sizes.bottom.height / 2, params.textures.bottom, 0, {
            density: 10,
            collisionFilter: {
                category: COLLISION_CATEGORIES.player,
                mask: COLLISION_CATEGORIES.default
            }
        });

        this.top = this.matter.add.image(this.bottom.x - 10, this.bottom.y - 130, params.textures.top, null, {
            density: 0.001,
            collisionFilter: {
                mask: COLLISION_CATEGORIES.default
            }
        });

        this.leftHand = this.matter.add.image(params.x - this.sizes.top.width / 2 - 4, params.y - this.sizes.bottom.height + 42, params.textures.hands.left, null, {
            density: 0.0001,
            collisionFilter: {
                category: COLLISION_CATEGORIES.leftHand,
                mask: null
            }
        });

        this.addConstraints();

        // this.stop();
    }

    addConstraints() {
        this.constraints.topBottom = this.matter.add.constraint(this.bottom, this.top, 0, 0, {
            pointA: {
                x: -10,
                y: -75
            },
            pointB: {
                x: 0,
                y: 55
            }
        });

        this.constraints.rightHand = this.matter.add.constraint(this.top, this.rightHand, 0, 0, {
            pointA: {
                x: this.sizes.top.width/2 - 5,
                y: -this.sizes.top.height/2 + 52
            },
            pointB: {
                x: -10,
                y: -this.sizes.hand.height/2 + 5
            }
        });

        this.constraints.leftHand = this.matter.add.constraint(this.top, this.leftHand, 0, 0, {
            pointA: {
                x: -this.sizes.top.width/2 + 8,
                y: -this.sizes.top.height/2 + 52
            },
            pointB: {
                x: 3,
                y: -this.sizes.hand.height/2 + 5
            }
        });

        this.constraints.backpackTop = this.matter.add.constraint(this.top, this.backpack, 0, 0, {
            pointA: {
                x: 0,
                y: 0
            },
            pointB: {
                x: 0,
                y: 0
            }
        });

        this.constraints.backpackBottom = this.matter.add.constraint(this.top, this.backpack, 0, 0, {
            pointA: {
                x: 0,
                y: 50
            },
            pointB: {
                x: 0,
                y: 50
            }
        });

        this.constraints.bottomLeft = this.matter.add.constraint(this.bottom, this.top, this.sizes.springLength, 0.001, {
            pointA: {
                x: this.sizes.bottom.width / 2,
                y: this.sizes.bottom.height / 2
            },
            pointB: {
                x: -this.sizes.top.width / 2,
                y: -this.sizes.top.height / 2
            }
        });

        this.constraints.bottomRight = this.matter.add.constraint(this.bottom, this.top, this.sizes.springLength, 0.001, {
            pointA: {
                x: -this.sizes.bottom.width / 2,
                y: this.sizes.bottom.height / 2
            },
            pointB: {
                x: this.sizes.top.width / 2,
                y: -this.sizes.top.height / 2
            }
        });
    }

    stop() {
        this.top.setStatic(true);
        this.bottom.setStatic(true);
        this.leftHand.setStatic(true);
        this.rightHand.setStatic(true);
        this.backpack.setStatic(true);
        this.isStatic = true;
    }

    play() {
        this.top.setStatic(false);
        this.bottom.setStatic(false);
        this.leftHand.setStatic(false);
        this.rightHand.setStatic(false);
        this.backpack.setStatic(false);
        this.isStatic = false;
    }
}

class Ground {
    constructor(game, params) {
        this.game = game;
        this.matter = this.game.matter;

        this.ground = this.matter.add.rectangle(params.x, params.y, params.width, params.height, {
            isStatic: true,
            collisionFilter: {
                mask: COLLISION_CATEGORIES.player
            }
        });
    }
}

class Backgrounds {
    constructor(game, list) {
        this.game = game;
        this.matter = this.game.matter;

        this.backgrounds = list;

        this.backgrounds.forEach(item => {
            this.create(item);
        });
    }

    create(item) {
        item.instance = this.matter.add.image(0, 0, item.texture, null, {
            collisionFilter: {
                category: null
            }
        }).setIgnoreGravity(true).setOrigin(0, 0);
    }

    updatePosition() {
        this.backgrounds.forEach(item => {
            item.instance.setVelocityX(item.velocity);

            if (item.instance.x < -CONFIG.width*2) {
                item.instance.setPosition(0, 0);
            }
        });
    }

    stop() {
        this.backgrounds.forEach(item => {
            item.instance.setStatic(true);
        });
    }
}

function preload() {
    this.load.image('background_back', './assets/background_back.png');
    this.load.image('background_front', './assets/background_front.png');
    this.load.image('background_ground', './assets/background_ground.png');

    this.load.image('body', './assets/player/body.png');
    this.load.image('rightArm', './assets/player/arm_right.png');
    this.load.image('leftArm', './assets/player/arm_left.png');
    this.load.image('backpack', './assets/player/backpack.png');

    this.load.spritesheet('legs', './assets/player/legs.png', {
        frameWidth: 159,
        frameHeight: 184
    });

    let text = this.make.text({
        x: CONFIG.width / 2,
        y: CONFIG.height / 2,
        text: '0%',
        style: {
            font: '18px monospace',
            fill: '#ffffff'
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

    let worldCenter = CONFIG.width / 2;
    let worldMiddle = CONFIG.height / 2;

    /** Background */
    GAME_OBJECTS.backgrounds = new Backgrounds(this, [
        {
            texture: 'background_back',
            velocity: -0.5
        },
        {
            texture: 'background_front',
            velocity: -1
        },
        {
            texture: 'background_ground',
            velocity: -2
        }
    ]);

    /** Ground */
    GAME_OBJECTS.ground = new Ground(this, {
        x: worldCenter,
        y: CONFIG.height - 25,
        width: CONFIG.width,
        height: 50
    });

    /** Player */
    GAME_OBJECTS.player = new Player(this, {
        x: worldCenter/2,
        y: CONFIG.height - 50,
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

    /** Counter */
    PROGRESS = this.time.addEvent({ loop: true });
    COUNTER = this.make.text({
        x: CONFIG.width,
        y: 0,
        padding: 20,
        text: '0м',
        style: {
            font: '32px monospace',
            fill: '#ffffff'
        }
    }).setOrigin(1, 0);
}

function update() {
    if (!GAME_OBJECTS.player.isStatic) {

        /** PLay walking animation */
        GAME_OBJECTS.player.bottom.anims.play('walking', true);

        /** Control balance */
        if (CURSORS.right.isDown) {
            GAME_OBJECTS.player.top.setVelocity(1.25, 2);
        } else if (CURSORS.left.isDown) {
            GAME_OBJECTS.player.top.setVelocity(-1.25, -2);
        }

        /** If fall angle is too large, stop game */
        let playerAngle = GAME_OBJECTS.player.top.angle;
        let isFallAngle = playerAngle > CONFIG.maxPlayerFallAngle || playerAngle < -CONFIG.maxPlayerFallAngle;

        if (isFallAngle) {
            GAME_OBJECTS.player.stop();
            GAME_OBJECTS.backgrounds.stop();
            GAME_OBJECTS.player.bottom.anims.stop('walking', true);
        }

        /** Update backgrounds position */
        GAME_OBJECTS.backgrounds.updatePosition();

        /** Update counter */
        let walkedDistance = Math.floor(PROGRESS.getElapsedSeconds());
        COUNTER.setText(walkedDistance + 'м');
    }
}

export default Main;