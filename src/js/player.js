import Config from './config';
import CollisionCategories from './collisionCategories';

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

        this.rightHand = this.matter.add.image(params.x + this.sizes.top.width / 2, params.y - this.sizes.bottom.height + 42, params.textures.hands.right, null, {
            density: 0.0001,
            collisionFilter: {
                category: CollisionCategories.rightHand,
                mask: null
            }
        });

        this.backpack = this.matter.add.image(params.x, params.y - this.sizes.bottom.height - 40, params.textures.backpack, null, {
            density: 0.0001,
            collisionFilter: {
                category: CollisionCategories.backpack,
                mask: null
            }
        });

        this.bottom = this.matter.add.sprite(params.x, params.y - this.sizes.bottom.height / 2, params.textures.bottom, 0, {
            density: 10,
            collisionFilter: {
                category: CollisionCategories.player,
                mask: CollisionCategories.default
            }
        });

        this.top = this.matter.add.image(this.bottom.x - 10, this.bottom.y - 130, params.textures.top, null, {
            density: 0.001,
            collisionFilter: {
                mask: CollisionCategories.default
            }
        });

        this.leftHand = this.matter.add.image(params.x - this.sizes.top.width / 2 - 4, params.y - this.sizes.bottom.height + 42, params.textures.hands.left, null, {
            density: 0.0001,
            collisionFilter: {
                category: CollisionCategories.leftHand,
                mask: null
            }
        });

        this.addConstraints();

        this.setStable(true);
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

    setStable(isStable = true) {
        this.top.setStatic(isStable);
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

export default Player;