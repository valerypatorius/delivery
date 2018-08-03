import Config from '../base/config';
import Colors from '../base/colors';

import { makeElement, removeElement, isElementInDom } from '../lib/dom';

class Obstacles {
    constructor(game, backgrounds, player) {
        this.game = game;
        this.backgrounds = backgrounds;
        this.player = player;

        this.imagesToTween = [];

        this.isCssOverlaySupported = CSS.supports('mix-blend-mode', 'overlay') || false;
        this.noise = makeElement('div', 'noise');
    }

    spawn(params) {
        let depth = params.texture.match(/obstacle_ghosts/) ? -1 : 3;
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

                    if (params.texture.match(/obstacle_debree/)) {
                        this.game.cameras.main.shake(4000, 0.001);
                        this.game.matter.world.setGravity(0, Config.gravity + 1);
                    } else if (params.texture.match(/obstacle_ladder/)) {
                        this.game.matter.world.setGravity(0, Config.gravity + 2);
                    } else {
                        this.game.matter.world.setGravity(0, Config.gravity + 1.5);

                        if (this.isCssOverlaySupported) {
                            document.body.appendChild(this.noise);
                        } else {
                            this.game.time.addEvent({
                                repeat: 1,
                                delay: 2500,
                                callback: () => {
                                    this.game.cameras.main.flash(1750, 0, 0, 0);
                                }
                            });
                        }
                    }

                }

                if (imageRightBound < Config.width / 2 && isActive === 1) {
                    isActive = -1;
                    this.game.matter.world.setGravity(0, Config.gravity);

                    if (isElementInDom(this.noise)) {
                        removeElement(this.noise);
                    }
                }
            }
        });

        if (params.texture.match(/obstacle_ladder/)) {
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