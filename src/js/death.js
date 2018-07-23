import Config from './config';
import CollisionCategories from './collisionCategories';

class Death {
    constructor(game, params) {
        this.game = game;
        this.matter = this.game.matter;

        this.instance = this.game.add.sprite(params.x, params.y, params.texture).setOrigin(0.5, 1).setDepth(2);
    }
}

export default Death;