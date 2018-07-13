import '../css/game.styl';

import Phaser from 'phaser';

const WIDTH = 960;
const HEIGHT = 600;

const MATTER = Phaser.Physics.Matter.Matter;

const COLLISION_CATEGORIES = {
    default: 0x0001,
    body: 0x0002,
    backgrounds: [
        0x0004,
        0x0008,
        0x0016
    ]
};

const WORLD_X = 1;
const MAX_FALL_ANGLE = 75;

let backgrounds;
let ground;
let player;
let cursors;

class Game {
    constructor() {
        this.config = {
            type: Phaser.AUTO,
            width: WIDTH,
            height: HEIGHT,
            physics: {
                default: 'matter',
                matter: {
                    // debug: true,
                    // debugBodyColor: 0xffffff
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
    constructor(game, x, y) {
        this.game = game;
        this.matter = this.game.matter;

        this.isStatic = false;
        this.constraints = {};
        this.distanceX = 0;

        this.sizes = {
            top: {
                width: 100,
                height: 200
            },
            bottom: {
                width: 100,
                height: 120
            },
            axisoffset: 40,
            springLength: 210
        };

        // this.top = MATTER.Bodies.rectangle(x, y - this.sizes.top.height / 2, this.sizes.top.width, this.sizes.top.height, {
        //     collisionFilter: {
        //         mask: COLLISION_CATEGORIES.default
        //     }
        // });

        this.top = this.matter.add.image(x, y - this.sizes.top.height / 2, 'body_top', null, {
            density: 0.0005,
            collisionFilter: {
                mask: COLLISION_CATEGORIES.default
            }
        });

        // this.bottom = MATTER.Bodies.rectangle(x, y, this.sizes.bottom.width, this.sizes.bottom.height, {
        //     density: 10,
        //     collisionFilter: {
        //         category: COLLISION_CATEGORIES.body,
        //         mask: COLLISION_CATEGORIES.default
        //     }
        // });

        this.bottom = this.matter.add.image(x, y, 'body_bottom', null, {
            density: 10,
            collisionFilter: {
                category: COLLISION_CATEGORIES.body,
                mask: COLLISION_CATEGORIES.default
            }
        });

        this.connectBodyParts();
    }

    connectBodyParts() {
        // this.constraints.topBottom = MATTER.Constraint.create({
        //     bodyA: this.bottom,
        //     pointA: {
        //         x: 0,
        //         y: -this.sizes.axisoffset
        //     },
        //     bodyB: this.top,
        //     pointB: {
        //         x: 0,
        //         y: this.sizes.axisoffset
        //     },
        //     length: 0,
        //     stiffness: 0
        // });
        // this.matter.world.add(this.constraints.topBottom);

        this.constraints.topBottom = this.matter.add.constraint(this.bottom, this.top, 0, 0, {
            pointA: {
                x: 0,
                y: -this.sizes.axisoffset
            },
            pointB: {
                x: 0,
                y: this.sizes.axisoffset
            }
        });

        // this.constraints.bottomLeft = MATTER.Constraint.create({
        //     bodyA: this.bottom,
        //     pointA: {
        //         x: this.sizes.bottom.width / 2,
        //         y: this.sizes.bottom.height / 2
        //     },
        //     bodyB: this.top,
        //     pointB: {
        //         x: -this.sizes.top.width / 2,
        //         y: -this.sizes.top.height / 2
        //     },
        //     length: this.sizes.springLength,
        //     stiffness: 0.001
        // });

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

        // this.constraints.bottomRight = MATTER.Constraint.create({
        //     bodyA: this.bottom,
        //     pointA: {
        //         x: -this.sizes.bottom.width / 2,
        //         y: this.sizes.bottom.height / 2
        //     },
        //     bodyB: this.top,
        //     pointB: {
        //         x: this.sizes.top.width / 2,
        //         y: -this.sizes.top.height / 2
        //     },
        //     length: this.sizes.springLength,
        //     stiffness: 0.001
        // });

        this.constraints.bottomLeft = this.matter.add.constraint(this.bottom, this.top, this.sizes.springLength, 0.001, {
            pointA: {
                x: -this.sizes.bottom.width / 2,
                y: this.sizes.bottom.height / 2
            },
            pointB: {
                x: this.sizes.top.width / 2,
                y: -this.sizes.top.height / 2
            }
        });

        // this.body = MATTER.Composite.create({
        //     bodies: [this.top, this.bottom],
        //     constraints: [this.constraints.topBottom, this.constraints.bottomLeft, this.constraints.bottomRight]
        // });

        // this.matter.world.add(this.body);
    }

    stop() {
        // MATTER.Body.setStatic(this.top, true);
        // MATTER.Body.setStatic(this.bottom, true);
        this.top.setStatic(true);
        this.bottom.setStatic(true);
        this.isStatic = true;
    }

    play() {
        // MATTER.Body.setStatic(this.top, false);
        // MATTER.Body.setStatic(this.bottom, false);
        this.top.setStatic(false);
        this.bottom.setStatic(false);
        this.isStatic = false;
    }
}

class Ground {
    constructor(game, x, y) {
        this.game = game;
        this.matter = this.game.matter;

        this.ground = MATTER.Bodies.rectangle(x, y, WIDTH * WORLD_X, 90, {
            isStatic: true,
            collisionFilter: {
                mask: COLLISION_CATEGORIES.body
            },
        });
        this.matter.world.add(this.ground);
    }
}

class Backgrounds {
    constructor(game, list) {
        this.game = game;
        this.matter = this.game.matter;

        this.backgrounds = list;

        this.backgrounds.forEach((item, index) => {
            this.create(item);
        });
    }

    create(item, index) {
        item.instance = this.matter.add.image(item.x, item.y, item.texture, null, {
            collisionFilter: {
                category: COLLISION_CATEGORIES.backgrounds[index]
            }
        }).setIgnoreGravity(true).setOrigin(0, 0);
    }

    updatePosition() {
        this.backgrounds.forEach(item => {
            item.instance.setVelocityX(item.velocity);

            if (item.instance.x < -Math.abs(item.x + WIDTH*2)) {
                item.instance.setPosition(item.x, item.y);
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

    this.load.image('body_top', './assets/body_top.png');
    this.load.image('body_bottom', './assets/body_bottom.png');

    let text = this.make.text({
        x: WIDTH / 2,
        y: HEIGHT / 2,
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

    let worldCenter = (WIDTH * WORLD_X) / 2;
    let worldMiddle = HEIGHT / 2;

    /** World bounds */
    // this.matter.world.setBounds(0, 0, WIDTH * WORLD_X, HEIGHT);

    /** Background */
    backgrounds = new Backgrounds(this, [
        {
            x: 0,
            y: 0,
            texture: 'background_back',
            velocity: -0.5
        },
        {
            x: 0,
            y: 0,
            texture: 'background_front',
            velocity: -1
        },
        {
            x: 0,
            y: 0,
            texture: 'background_ground',
            velocity: -2
        }
    ]);

    /** Ground */
    ground = new Ground(this, worldCenter, HEIGHT - 40);

    /** Player */
    player = new Player(this, worldCenter/2, HEIGHT - 160);

    /** Cursors */
    cursors = this.input.keyboard.createCursorKeys();
}

function update() {

    if (!player.isStatic) {

        /** Control balance */
        if (cursors.right.isDown) {
            // if (!player.isStatic) MATTER.Body.setVelocity(player.top, {
            //     x: 2,
            //     y: 0
            // });

            player.top.setVelocityX(2);

        } else if (cursors.left.isDown) {
            // if (!player.isStatic) MATTER.Body.setVelocity(player.top, {
            //     x: -2,
            //     y: 0
            // });

            player.top.setVelocityX(-2);
        }

        /** If angle is too large */
        if (player.top.angle > MAX_FALL_ANGLE) {
            player.stop();
        } else if (player.top.angle < -MAX_FALL_ANGLE) {
            player.stop();
        } else {}
    }

    backgrounds.updatePosition();

}

export default Game;