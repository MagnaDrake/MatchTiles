import * as Phaser from "phaser";
import GameOptions from "../Util/GameOptions";
import FpsText from "../Object/FpsText";

export default class PreloadScene extends Phaser.Scene {
  private graphics;
  private newGraphics;
  private loadingText;
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

    //loading screen
    this.graphics = this.add.graphics();
    this.newGraphics = this.add.graphics();
    let progressBar = new Phaser.Geom.Rectangle(200, 200, 400, 50);
    let progressBarFill = new Phaser.Geom.Rectangle(205, 205, 290, 40);

    this.graphics.fillStyle(0xffffff, 1);
    this.graphics.fillRectShape(progressBar);

    this.newGraphics.fillStyle(0x3587e2, 1);
    this.newGraphics.fillRectShape(progressBarFill);

    this.loadingText = this.add.text(250, 260, "Loading: ", {
      fontSize: "32px",
      fill: "#FFF",
    });

    this.load.on("progress", this.updateBar, {
      newGraphics: this.newGraphics,
      loadingText: this.loadingText,
    });
    this.load.on("complete", this.complete, { scene: this.scene });
  }

  create(): void {
    //his.scene.start("GameScene");
  }

  updateBar(percentage) {
    this.newGraphics.clear();
    this.newGraphics.fillStyle(0x3587e2, 1);
    this.newGraphics.fillRectShape(
      new Phaser.Geom.Rectangle(205, 205, percentage * 390, 40)
    );

    percentage = percentage * 100;
    this.loadingText.setText("Loading: " + percentage.toFixed(2) + "%");
    console.log("P:" + percentage);
  }

  complete() {
    this.scene.start("GameScene");
  }
}
