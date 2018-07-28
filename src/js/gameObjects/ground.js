import CollisionCategories from '../base/collisionCategories';

class Ground {
    constructor(game, params) {
        this.game = game;
        this.matter = this.game.matter;

        this.instance = this.matter.add.rectangle(params.x, params.y, params.width, params.height, {
            isStatic: true,
            collisionFilter: {
                category: CollisionCategories.default,
                mask: CollisionCategories.player
            }
        });
    }
}

export default Ground;