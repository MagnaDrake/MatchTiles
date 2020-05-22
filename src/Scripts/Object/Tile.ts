import * as Phaser from "phaser";

export default class Tile extends Phaser.GameObjects.Sprite {
  public color: number;
  public markedForRemoval: boolean;
  public isBomb: boolean;
  constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
    super(scene, x, y, texture);

    this.scene.add.existing(this);
    this.isBomb = false;

    //scene.physics.add.existing(this);
    this.markedForRemoval = false;
    this.setInteractive();
  }

  public setColor(colorCode: number): void {
    this.setTexture("tiles");
    this.color = colorCode;
    this.setFrame(colorCode);
  }

  public setBomb() {
    console.log("i am now a bomb");
    this.setTexture("bombs");
    this.setFrame(this.color);
  }
}
