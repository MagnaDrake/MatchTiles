import * as Phaser from "phaser";
import Shopee from "../Object/Shopee";
import FpsText from "../Object/FpsText";
import GameOptions from "../Util/GameOptions";
import GridManager from "../Manager/GridManager";
import ScoreManager from "../Manager/ScoreManager";

export default class GameScene extends Phaser.Scene {
  private fpsText: FpsText;
  private gm: GridManager;
  private sm: ScoreManager;
  constructor() {
    super({ key: "GameScene" });
  }

  preload(): void {}

  create(): void {
    this.fpsText = new FpsText(this);
    //new Shopee(this, this.cameras.main.width / 2, this.cameras.main.height / 2);
    this.gm = GridManager.Instance;
    this.sm = ScoreManager.Instance;
    this.gm.drawGrid(this);
    this.sm.init(this);
    this.input.on("pointerdown", this.gm.tileSelect, this.gm);
    this.input.on("pointermove", this.gm.startSwipe, this.gm);
    this.input.on("pointerup", this.gm.stopSwipe, this.gm);
  }

  update(): void {
    this.fpsText.update();
  }
}
