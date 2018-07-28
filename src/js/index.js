import '../css/game.styl';

import Config from './base/config';

import Phaser from 'phaser';

import Main from './scenes/main';
import Pause from './scenes/pause';
import Ui from './scenes/ui';
import { preloadImages } from './lib/helper';

const GAME_CONFIG = {
    type: Phaser.AUTO,
    width: Config.width,
    height: Config.height,
    physics: {
        default: 'matter',
        matter: {
            gravity: {
                x: 0,
                y: Config.gravity
            },
            // debug: true,
        }
    },
    parent: 'game',
    scene: [Main, Pause, Ui]
};

/** Preload some UI images */
preloadImages([
    './assets/ui/pause_button.png'
]);

new Phaser.Game(GAME_CONFIG);