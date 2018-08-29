import Config from '../base/config';
import Colors from '../base/colors';
import Intervals from '../base/intervals';

import ImageTween from '../imageTween';

class Backgrounds {

    /**
     * Animated backgrounds constructor
     * @param {Object} game - game instance
     */
    constructor(game) {
        this.game = game;
        this.matter = this.game.matter;

        this.locations = ['wasteland', 'forest', 'city'];
        this.currentLocation = this.locations[0];

        this.groups = {
            global: {
                landscape: {
                    label: 'landscape',
                    name: 'background_global_landscape_',
                    instance: this.game.add.group(),
                    lastImage: null,
                    allowNext: false,
                    length: 7,
                    last: 1,
                    offsetBetween: 100,
                    offsetBottom: 100,
                    duration: 80,
                    depth: -6,
                    isActive: true,
                    hasExtra: true
                },
                cords: {
                    label: 'cords',
                    name: 'background_global_cords_',
                    instance: this.game.add.group(),
                    lastImage: null,
                    allowNext: false,
                    length: 1,
                    last: 1,
                    offsetBetween: 100,
                    offsetBottom: 40,
                    duration: 65,
                    depth: -4,
                    isActive: true,
                },
                ground: {
                    label: 'ground',
                    name: 'background_global_ground_',
                    instance: this.game.add.group(),
                    lastImage: null,
                    allowNext: false,
                    length: 1,
                    last: 1,
                    offsetBetween: 0,
                    offsetBottom: 0,
                    duration: 50,
                    depth: 1,
                    isActive: true
                }
            },
            grass: {
                label: 'grass',
                name: 'background_global_grass_',
                instance: this.game.add.group(),
                lastImage: null,
                allowNext: false,
                length: 1,
                last: 1,
                offsetBetween: -50,
                offsetBottom: 100,
                duration: 55,
                depth: -3,
                isActive: false
            },
            wasteland: {
                back: {
                    label: 'back',
                    name: 'background_wasteland_back_',
                    instance: this.game.add.group(),
                    lastImage: null,
                    allowNext: false,
                    length: 7,
                    last: 1,
                    offsetBetween: -120,
                    offsetBottom: 100,
                    duration: 70,
                    depth: -5,
                    isActive: true
                },
                front: {
                    label: 'front',
                    name: 'background_wasteland_front_',
                    instance: this.game.add.group(),
                    lastImage: null,
                    allowNext: false,
                    length: 8,
                    last: 1,
                    offsetBetween: -80,
                    offsetBottom: 100,
                    duration: 55,
                    depth: -3,
                    isActive: true
                }
            },
            forest: {
                back: {
                    label: 'back',
                    name: 'background_forest_back_',
                    instance: this.game.add.group(),
                    lastImage: null,
                    allowNext: false,
                    length: 7,
                    last: 1,
                    offsetBetween: 80,
                    offsetBottom: 100,
                    duration: 70,
                    depth: -5,
                    isActive: false
                },
                front: {
                    label: 'front',
                    name: 'background_forest_front_',
                    instance: this.game.add.group(),
                    lastImage: null,
                    allowNext: false,
                    length: 9,
                    last: 1,
                    offsetBetween: 120,
                    offsetBottom: 100,
                    duration: 55,
                    depth: -3,
                    isActive: false,
                    hasExtra: true
                }
            },
            city: {
                back: {
                    label: 'back',
                    name: 'background_city_back_',
                    instance: this.game.add.group(),
                    lastImage: null,
                    allowNext: false,
                    length: 5,
                    last: 1,
                    offsetBetween: 80,
                    offsetBottom: 100,
                    duration: 70,
                    depth: -5,
                    isActive: false
                },
                front: {
                    label: 'front',
                    name: 'background_city_front_',
                    instance: this.game.add.group(),
                    lastImage: null,
                    allowNext: false,
                    length: 5,
                    last: 1,
                    offsetBetween: 120,
                    offsetBottom: 100,
                    duration: 55,
                    depth: -3,
                    isActive: false
                }
            }
        };

        this.images = {
            landscape: [],
            cords: [],
            ground: [],
            grass: [],
            back: [],
            front: []
        };

        this.main = this.game.add.image(0, 0, 'pixel').setOrigin(0, 0).setScale(Config.width, Config.height).setDepth(-6);
        this.main.setTint(Colors.default.main[0], Colors.default.main[1], Colors.default.main[2], Colors.default.main[3]);

        for (let name in this.groups.global) {
            this.generateSequence(this.groups.global[name], 0);
        }

        for (let name in this.groups[this.currentLocation]) {
            this.generateSequence(this.groups[this.currentLocation][name], 0);
        }

        this.overlay = this.game.add.image(0, 0, 'pixel').setOrigin(0, 0).setScale(Config.width, Config.height).setDepth(-1);
        this.overlay.setTint(Colors[this.currentLocation].overlay).setBlendMode(Phaser.BlendModes.MULTIPLY);
    }

    /**
     * Create new image
     * @param {String} name - image name
     * @param {Object} group - group object
     * @param {Number} positionX - horizonatal position of new image
     */
    spawn(name, group, positionX) {
        let image = group.instance.create(positionX, Config.height - group.offsetBottom, name).setOrigin(0, 1).setDepth(group.depth);
        this.images[group.label].push(image);

        return image;
    }

    /**
     * Generate new images in group
     * @param {Object} group - group object
     * @param {sequenceStartX} number - start position (left screen edge by default)
     */
    generateSequence(group, sequenceStartX = 0) {
        let spawnPositionX = group.lastImage ? group.lastImage.getBottomRight().x : sequenceStartX;

        /**
         * Negate additional 10 pixels
         * because of gaps between images, caused by late render
         */
        let tweenPositionX = spawnPositionX - 10 + group.offsetBetween;
        let image = this.spawn(group.name + group.last, group, tweenPositionX);

        // image.setTint(Colors[this.currentLocation][group.label]);
        image.setTint(Colors.default[group.label]);

        this.game.tweens.add({
            targets: image,
            duration: group.duration * 1000,
            x: {
                getEnd: () => {
                    return tweenPositionX - 6000;
                },
                getStart: () => {
                    return tweenPositionX;
                }
            },
            onComplete: () => {
                image.destroy();
                this.images[group.label] = this.images[group.label].filter(item => item !== image);
            },
            onUpdate: () => {
                let rightBound = group.lastImage ? group.lastImage.getBottomRight().x : Config.width;

                /**
                 * Additional check for negative offsets,
                 * because images appeared on screen too late
                 */
                let isNegativeOffset = group.offsetBetween < 0;
                let isImageOnScreen = rightBound <= Config.width + (isNegativeOffset ? Math.abs(group.offsetBetween) : 0);

                if (isImageOnScreen && !group.allowNext && group.isActive) {
                    group.allowNext = true;

                    if (group.last >= group.length) {
                        group.last = 1;

                        /** Show extra image only once */
                        if (group.hasExtra) {
                            group.length -= 1;
                            group.hasExtra = false;
                        }
                    } else {
                        group.last++;
                    }

                    this.generateSequence(group, rightBound);

                    group.allowNext = false;
                }
            }
        });

        group.lastImage = image;
    }

    /**
     * Change current location with tint tweening
     * @param {Number} index - location index
     * @param {Array} obstacles - existing obstacles to tween
     */
    changeLocation(index, obstacles) {
        let prevLocation = this.groups[this.currentLocation];
        let startColors = Colors[this.currentLocation];

        if (Intervals.obstacles) {
            Intervals.obstacles.paused = true;
        }

        prevLocation.back.isActive = false;
        prevLocation.front.isActive = false;

        /** Set new location */
        this.currentLocation = this.locations[index];

        let newLocation = this.groups[this.currentLocation];
        let endColors = Colors[this.currentLocation];

        for (let name in newLocation) {
            let group = newLocation[name];

            group.isActive = true;
            group.lastImage = null;
            group.last = 1;

            this.generateSequence(group, prevLocation[name].lastImage.getBottomRight().x);
        }

        /** Generate grass images in forest location */
        if (this.currentLocation === 'forest') {
            this.generateGrassSequence();
        } else {
            this.groups.grass.isActive = false;
            this.groups.grass.lastImage = null;
            this.groups.grass.last = 1;
        }

        /** Tween overlay */
        let tweenDelay = 5000 + Config.width * 2;

        setTimeout(() => {
            let tween = new ImageTween(this.game, this.overlay);
            tween.init(startColors.overlay, endColors.overlay, () => {
                if (Intervals.obstacles) {
                    Intervals.obstacles.paused = false;
                }
            });

            /** Tween obstacles */
            obstacles.forEach(item => {
                let tween = new ImageTween(this.game, item);
                tween.init(startColors.front, endColors.front);
            });

        }, tweenDelay);
    }

    /**
     * Add grass layer
     */
    generateGrassSequence() {
        let group = this.groups.grass;
        let startPositionX = this.groups.forest.front.lastImage ? this.groups.forest.front.lastImage.getBottomLeft().x : 0;

        group.isActive = true;
        group.lastImage = null;
        group.last = 1;

        this.generateSequence(group, startPositionX);
    }
}

export default Backgrounds;