import * as Phaser from "phaser";

const random = new Phaser.Math.RandomDataGenerator();

export class Dice {
    sprite: Phaser.Physics.Arcade.Sprite;

    constructor(scene: Phaser.Scene, x: number, y: number, onClick: Function) {
        this.sprite = scene.physics.add.sprite(x, y, "dice");
        this.sprite.setInteractive(new Phaser.Geom.Rectangle(0, 0, 96, 96), Phaser.Geom.Rectangle.Contains);
        this.sprite.setCollideWorldBounds(true);
        this.sprite.on('pointerdown', () => {
            onClick();
            this.sprite.alpha = this.sprite.alpha === 1 ? 0.5 : 1;
        });
    }

    throwDice(n: number) {
        const randomArr = random.shuffle([0, 1, 2, 3, 4, 5, 0, 1, 2, 3, 4, 5, 0, 1, 2, 3, 4]);
        randomArr.push(n - 1);

        this.sprite.anims.remove("roll");
        this.sprite.anims.create({
            key: "roll",
            frames: this.sprite.anims.generateFrameNumbers("dice", {
                start: 0,
                end: 5,
                frames: randomArr,
            }),
            frameRate: 15,
        });

        this.sprite.play("roll");
    }
}