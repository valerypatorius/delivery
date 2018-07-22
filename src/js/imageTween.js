class ImageTween {
    constructor(game, image) {
        this.game = game;
        this.image = image;

        this.tween = null;
        this.fromColors = null;
        this.toColors = null;

        this.duration = 2000;
    }

    init(startColors, endColors, callback = null) {
        this.fromColors = this.toColors || this.formatColor(startColors);
        this.toColors = this.formatColor(endColors);

        this.tintTween(callback);
    }

    tintTween(callback) {
        this.tween = this.game.tweens.addCounter({
            from: 0,
            to: 100,
            duration: this.duration,
            onUpdate: () => {
                this.image.setTint(
                    this.getTintColor('topLeft'),
                    this.getTintColor('topRight'),
                    this.getTintColor('bottomLeft'),
                    this.getTintColor('topRight')
                );
            },
            onComplete: () => {
                if (typeof callback === 'function') {
                    callback();
                }
            }
        });
    }

    getTintColor(vertex) {
        let tint = Phaser.Display.Color.Interpolate.ColorWithColor(
            this.fromColors[vertex],
            this.toColors[vertex],
            100,
            this.tween.getValue()
        );

        return Phaser.Display.Color.ObjectToColor(tint).color;
    }

    formatColor(color) {
        let isArray = (typeof color === 'object') ? true : false;

        return {
            topLeft: Phaser.Display.Color.ValueToColor(isArray ? color[0] : color),
            topRight: Phaser.Display.Color.ValueToColor(isArray ? color[1] : color),
            bottomLeft: Phaser.Display.Color.ValueToColor(isArray ? color[2] : color),
            bottomRight: Phaser.Display.Color.ValueToColor(isArray ? color[3] : color)
        };
    }
}

export default ImageTween;