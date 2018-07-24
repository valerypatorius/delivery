import Config from './config';
import Colors from './colors';
import CollisionCategories from './collisionCategories';

import ImageTween from './imageTween';
import { getRandomNumber } from './lib/helper';

class Obstacles {
    constructor(game, backgrounds, player) {
        this.game = game;
        this.backgrounds = backgrounds;
        this.player = player;

        this.imagesToTween = [];    }

    spawn(params) {
        let depth = params.texture === 'obstacle_ghosts' ? -1 : 3;
        let image = this.game.add.image(params.x, params.y, params.texture).setOrigin(0, 1).setDepth(depth);
        let helperImage = null;

        let isActive = 0;

        this.game.tweens.add({
            targets: image,
            duration: 50 * 1000,
            x: {
                getEnd: () => {
                    return params.x - 6000;
                },
                getStart: () => {
                    return params.x;
                }
            },
            onComplete: () => {
                image.destroy();
            },
            onUpdate: () => {
                let imageLeftBound = image.getBottomLeft().x;
                let imageRightBound = image.getBottomRight().x;

                if (imageLeftBound < Config.width / 2 && isActive === 0) {
                    isActive = 1;

                    if (params.texture === 'obstacle_debree') {
                        this.game.cameras.main.shake(3800, 0.001);
                    } else if (params.texture === 'obstacle_ladder') {
                        this.game.matter.world.setGravity(0, 4);
                    } else {
                        this.game.matter.world.setGravity(0, 5);

                        this.game.time.addEvent({
                            repeat: 2,
                            delay: 1000,
                            callback: () => {
                                this.game.cameras.main.flash(2000, 0, 0, 0);
                            }
                        });
                    }

                }

                if (imageRightBound < Config.width / 2 && isActive === 1) {
                    isActive = -1;
                    this.game.matter.world.setGravity(0, 2);
                }
            }
        });

        if (params.texture === 'obstacle_ladder') {
            helperImage = this.game.add.image(params.x + 13, params.y + 112 - 11, params.texture + '_ground').setOrigin(0, 1).setDepth(2);
            helperImage.setTint(Colors[this.backgrounds.currentLocation].front);

            this.imagesToTween.push(helperImage);
        }

        if (helperImage) {
            this.game.tweens.add({
                targets: helperImage,
                duration: 50 * 1000,
                x: {
                    getEnd: () => {
                        return params.x - 6000;
                    },
                    getStart: () => {
                        return params.x + 13;
                    }
                },
                onComplete: () => {
                    helperImage.destroy();
                    this.imagesToTween = this.imagesToTween.filter(item => item !== helperImage);
                },
                onUpdate: () => {

                }
            });
        }
    }
}

export default Obstacles;