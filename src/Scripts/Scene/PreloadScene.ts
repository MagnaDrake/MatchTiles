import * as Phaser from "phaser";
import GameOptions from "../Util/GameOptions";
import FpsText from "../Object/FpsText";

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: "PreloadScene" });
  }

  preload(): void {
    this.load.path = "src/Assets/";
    this.load.image("shopee", "shopee.png");

    this.load.image("panel", "Panel.png");
    this.load.image("replayButton", "Replay.png");
    this.load.spritesheet("bubble", "bubblesprite.png", {
      frameWidth: 180,
      frameHeight: 180,
      endFrame: 6,
      startFrame: 0,
    });
    this.load.audio("bubblePopAudio", "Audio/Blop.mp3");
    this.load.audio("bubbleDropAudio", "Audio/highDown.ogg");

    this.load.spritesheet("tiles", "gems.png", {
      frameWidth: GameOptions.OPTIONS.tileSize,
      frameHeight: GameOptions.OPTIONS.tileSize,
    });

    this.load.spritesheet("bombs", "bomb.png", {
      frameWidth: GameOptions.OPTIONS.tileSize,
      frameHeight: GameOptions.OPTIONS.tileSize,
    });
  }

  create(): void {
    this.scene.start("GameScene");
  }
}
