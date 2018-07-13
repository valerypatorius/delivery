import '../css/game.styl';

const COLOR = {
    ball: '#4B77BE',
    paddle: '#F4D03F',
    brick: '#F4D03F',
    status: '#F4D03F',
    fail: '#E74C3C',
    win: '#F7CA18',
    overlay: 'rgba(34, 34, 34, 0.8)'
};

const CANVAS = document.getElementById('game');
const CTX = CANVAS.getContext('2d');

class Game {
    constructor() {
        this.score = 0;
        this.lives = 3;

        this.isStopped = false;
        this.animationFrame = null;

        this.paddle = new Paddle();
        this.ball = new Ball(this);
        this.bricks = new Bricks(this);
        this.status = new Status(this);

        this.init();
    }

    init() {
        this.paddle.draw();
        this.ball.draw();
        this.bricks.draw();
        this.status.draw();

        this.start();
    }

    start() {
        this.updateView();
    }

    stop() {
        this.isStopped = true;
    }

    updateView() {
        CTX.clearRect(0, 0, CANVAS.width, CANVAS.height);

        this.ball.update();
        this.paddle.update();
        this.bricks.update();
        this.status.update();

        if (!this.isStopped) {
            requestAnimationFrame(() => this.updateView());
        }
    }

    showMessage(text, color = COLOR.fail) {
        setTimeout(() => {
            let alert = new Alert(text, color);
            alert.draw();
        });
    }
}

class Ball {
    constructor(game) {
        this.game = game;

        this.radius = 10;
        this.x = CANVAS.width / 2;
        this.y = CANVAS.height - this.game.paddle.height - this.radius;

        this.dx = 2;
        this.dy = -2;
    }

    draw() {
        CTX.beginPath();
        CTX.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        CTX.fillStyle = COLOR.ball;
        CTX.fill();
        CTX.closePath();
    }

    update() {
        this.draw();

        if (this.x + this.dx < this.radius || this.x + this.dx > CANVAS.width - this.radius) {
            this.dx = -this.dx;
        }

        if (this.y + this.dy < this.radius) {
            this.dy = -this.dy;
        } else if (this.y + this.dy > CANVAS.height - this.radius) {

            if (this.x > this.game.paddle.x && this.x < this.game.paddle.x + this.game.paddle.width) {
                this.dy = -this.dy;
            } else {
                this.game.lives--;

                if (this.game.lives <= 0) {
                    this.game.stop();
                    this.game.showMessage('Game over');
                } else {
                    this.x = CANVAS.width / 2;
                    this.y = CANVAS.height - this.game.paddle.height - this.radius;

                    this.dx = 2;
                    this.dy = -2;

                    this.game.paddle.x = (CANVAS.width - this.game.paddle.width) / 2;
                }

            }

        }

        this.x += this.dx;
        this.y += this.dy;
    }
}

class Paddle {
    constructor() {
        this.width = 75;
        this.height = 10;

        this.x = (CANVAS.width - this.width) / 2;
        this.y = CANVAS.height - this.height;

        this.step = 7;

        this.controls = new Controls(this);
    }

    draw() {
        CTX.beginPath();
        CTX.rect(this.x, this.y, this.width, this.height);
        CTX.fillStyle = COLOR.paddle;
        CTX.fill();
        CTX.closePath();
    }

    update() {
        this.draw();

        if (this.controls) {
            this.updatePosition();
        }
    }

    updatePosition() {
        if (this.controls.isPressed.right && this.x < CANVAS.width - this.width) {
            this.x += this.step;
        } else if (this.controls.isPressed.left && this.x > 0) {
            this.x -= this.step;
        }
    }
}

class Controls {
    constructor(paddle) {
        this.paddle = paddle;

        this.isPressed = {
            right: false,
            left: false
        };

        this.keys = {
            right: 39,
            left: 37
        };

        this.addListeners();
    }

    addListeners() {
        document.addEventListener('keydown', e => this.onKeyPress(e));
        document.addEventListener('keyup', e => this.onKeyRelease(e));

        document.addEventListener('mousemove', e => this.onMouseMove(e));
    }

    onKeyPress(e) {
        if (e.keyCode === this.keys.right) {
            this.isPressed.right = true;
        } else if (e.keyCode === this.keys.left) {
            this.isPressed.left = true;
        }
    }

    onKeyRelease(e) {
        if (e.keyCode === this.keys.right) {
            this.isPressed.right = false;
        } else if (e.keyCode === this.keys.left) {
            this.isPressed.left = false;
        }
    }

    onMouseMove(e) {
        let x = e.clientX - CANVAS.offsetLeft;

        if (x > 0 && x < CANVAS.width) {
            this.paddle.x = x - this.paddle.width / 2;
        }
    }

}

class Bricks {
    constructor(game) {
        this.game = game;

        this.rows = 3;
        this.cols = 5;
        this.width = 75;
        this.height = 20;
        this.padding = 10;
        this.offset = {
            top: 50,
            left: 30
        };

        this.bricks = [];
        this.prepare();
    }

    prepare() {
        for (let c = 0; c < this.cols; c++) {
            this.bricks[c] = [];

            for (let r = 0; r < this.rows; r++) {
                this.bricks[c][r] = {
                    x: 0,
                    y: 0,
                    status: 1
                };
            }
        }
    }

    draw() {
        for (let c = 0; c < this.cols; c++) {
            for (let r = 0; r < this.rows; r++) {
                if (this.bricks[c][r].status === 1) {
                    let x = c * (this.width + this.padding) + this.offset.left;
                    let y = r * (this.height + this.padding) + this.offset.top;

                    this.bricks[c][r].x = x;
                    this.bricks[c][r].y = y;

                    CTX.beginPath();
                    CTX.rect(x, y, this.width, this.height);
                    CTX.fillStyle = COLOR.brick;
                    CTX.fill();
                    CTX.closePath();
                }
            }
        }
    }

    update() {
        this.draw();
        this.detectCollision();
    }

    detectCollision() {
        for (let c = 0; c < this.cols; c++) {
            for (let r = 0; r < this.rows; r++) {
                let brick = this.bricks[c][r];

                if (brick.status === 1) {
                    let isX = this.game.ball.x > brick.x && this.game.ball.x < brick.x + this.width;
                    let isY = this.game.ball.y > brick.y && this.game.ball.y < brick.y + this.height;

                    if (isX && isY) {
                        this.game.ball.dy = -this.game.ball.dy;
                        brick.status = 0;

                        this.game.score++;

                        if (this.game.score >= this.rows * this.cols) {
                            this.game.stop();
                            this.game.showMessage('Winner-winner!', COLOR.win);
                        }
                    }
                }
            }
        }
    }
}

class Status {
    constructor(game) {
        this.game = game;
    }

    draw() {
        CTX.font = '900 16px Roboto';
        CTX.fillStyle = COLOR.status;
        CTX.textAlign = 'left';
        CTX.fillText('Score: ' + this.game.score, 30, 30);

        CTX.font = '900 16px Roboto';
        CTX.fillStyle = COLOR.status;
        CTX.textAlign = 'right';
        CTX.fillText('Lives: ' + this.game.lives, CANVAS.width - 30, 30);
    }

    update() {
        this.draw();
    }
}

class Alert {
    constructor(text, color = COLOR.win) {
        this.text = text;
        this.color = color;
    }

    draw() {
        CTX.beginPath();
        CTX.rect(0, 0, CANVAS.width, CANVAS.height);
        CTX.fillStyle = COLOR.overlay;
        CTX.fill();
        CTX.closePath();

        CTX.font = '900 22px Roboto';
        CTX.fillStyle = this.color;
        CTX.textAlign = 'center';
        CTX.textBaseline = 'middle';
        CTX.fillText(this.text.toUpperCase(), CANVAS.width / 2, CANVAS.height / 2);
    }
}

export default Game;