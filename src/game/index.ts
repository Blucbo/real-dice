import * as Phaser from "phaser";

import { Dice } from "./dice";

const startXPos = window.innerWidth / 2 - 260;
const startYPos = 200;

const onScenePreload = (scene: Phaser.Scene) => {
  scene.load.spritesheet("dice", "assets/images/dice2.png", {
    frameWidth: 96,
    frameHeight: 96,
  });
  scene.load.image("background", "assets/images/background2.jpg");
  scene.load.image('shelf', 'assets/images/shelf.jpeg');
};

const onSceneCreate = (scene: Phaser.Scene) => {
  const platforms = scene.physics.add.staticGroup();
  const pl1 = platforms.create(window.innerWidth / 2 , 1000, 'shelf') as Phaser.GameObjects.Sprite;

  const dices = [
    new Dice(scene, startXPos, startYPos),
    new Dice(scene, startXPos + 100, startYPos),
    new Dice(scene, startXPos + 200, startYPos),
    new Dice(scene, startXPos + 300, startYPos),
    new Dice(scene, startXPos + 400, startYPos),
    new Dice(scene, startXPos + 500, startYPos),
  ];

  dices.forEach(dice => scene.physics.add.collider(dice.sprite, platforms))

  return dices;
};

export class FarkleGame {
  scene!: Phaser.Scene;
  dices: Dice[] = [];

  start(gameWindowId: string) {
    const that = this;

    new Phaser.Game({
      type: Phaser.AUTO,
      parent: gameWindowId,
      width: "100",
      height: "100",
      physics: {
        default: "arcade",
        arcade: {
          gravity: { y: 0 },
        },
      },
      scene: {
        preload: function () {
          onScenePreload(this);
        },
        create: function () {
          that.scene = this;
          that.dices.push(...onSceneCreate(this))
        },
      },
      transparent: true,
    });
  }

  throwDices(values: number[]) {
    this.dices.forEach((dice, i) => {
      dice.sprite.setY(startYPos);
      dice.throwDice(values[i]);
    });
    this.scene.physics.world.gravity.y = 900;
  }
}
