import Config from './config';
import CollisionCategories from './collisionCategories';

class Ground {
    constructor(game, params) {
        this.game = game;
        this.matter = this.game.matter;

        this.ground = this.matter.add.rectangle(params.x, params.y, params.width, params.height, {
            isStatic: true,
            collisionFilter: {
                mask: CollisionCategories.player
            }
        });
    }
}

export default Ground;