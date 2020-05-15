import * as Phaser from "phaser";

export default class Tile extends Phaser.GameObjects.Sprite {
  public color: number;
  public markedForRemoval: boolean;
  constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
    super(scene, x, y, texture);

    this.scene.add.existing(this);

    //scene.physics.add.existing(this);
    this.markedForRemoval = false;
    this.setInteractive();
  }

  public setColor(colorCode: number): void {
    this.color = colorCode;
    this.setFrame(colorCode);
  }
}
