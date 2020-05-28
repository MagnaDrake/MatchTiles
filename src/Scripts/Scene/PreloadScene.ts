import GameOptions from "../Util/GameOptions";
import FpsText from "../Object/FpsText";

import shopeeImg from "../../Assets/shopee.png";
import panelImg from "../../Assets/panel.png";
import replayImg from "../../Assets/Replay.png";
import bubbleImg from "../../Assets/bubblesprite.png";
import tilesImg from "../../Assets/gems.png";
import bombImg from "../../Assets/bomb.png";

export default class PreloadScene extends Phaser.Scene {
  private graphics?: Phaser.GameObjects.Graphics;
  private newGraphics?: Phaser.GameObjects.Graphics;
  private loadingText?: Phaser.GameObjects.Text;
  constructor() {
    super({ key: "PreloadScene" });
  }

  preload(): void {
    //this.load.path = "src/Assets/";
    this.load.image("shopee", shopeeImg);

    this.load.image("panel", panelImg);
    this.load.image("replayButton", replayImg);
    this.load.spritesheet("bubble", bubbleImg, {
      frameWidth: 180,
      frameHeight: 180,
      endFrame: 6,
      startFrame: 0,
    });
    //this.load.audio("bubblePopAudio", "Audio/Blop.mp3");
    //this.load.audio("bubbleDropAudio", "Audio/highDown.ogg");

    this.load.spritesheet("tiles", tilesImg, {
      frameWidth: GameOptions.OPTIONS.tileSize,
      frameHeight: GameOptions.OPTIONS.tileSize,
    });

    this.load.spritesheet("bombs", bombImg, {
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

  updateBar(percentage: number) {
    this.newGraphics?.clear();
    this.newGraphics?.fillStyle(0x3587e2, 1);
    this.newGraphics?.fillRectShape(
      new Phaser.Geom.Rectangle(205, 205, percentage * 390, 40)
    );

    percentage = percentage * 100;
    this.loadingText?.setText("Loading: " + percentage.toFixed(2) + "%");
    console.log("P:" + percentage);
  }

  complete() {
    this.scene.start("GameScene");
  }
}
