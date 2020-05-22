import * as Phaser from "phaser";
import GameOptions from "../Util/GameOptions";
import Tile from "../Object/Tile";

const scoreTextFormat = "Score: %1\n" + "Combo: %2\n";

const debugCaptionTextFormat = "Bombs:  %1";

export default class ScoreManager {
  private static instance: ScoreManager;
  private scoreText: Phaser.GameObjects.Text;
  private debugText: Phaser.GameObjects.Text;

  public static get Instance() {
    return this.instance || (this.instance = new ScoreManager());
  }

  public init(scene: Phaser.Scene) {
    console.log("yeehaw am score");
    this.scoreText = new Phaser.GameObjects.Text(scene, 10, 10, " ", {
      color: "white",
      fontSize: "28px",
    });

    scene.add.existing(this.scoreText);
    this.scoreText.setOrigin(0);
    this.scoreText.setPosition(0, scene.cameras.main.height / 2);

    this.debugText = new Phaser.GameObjects.Text(scene, 10, 10, " ", {
      color: "white",
      fontSize: "28px",
    });

    scene.add.existing(this.debugText);
    this.debugText.setOrigin(0);
    this.debugText.setPosition(0, scene.cameras.main.height / 2);
  }

  public updateScore() {}

  public updateBombCount(bombs: number) {
    this.debugText.setText(
      Phaser.Utils.String.Format(debugCaptionTextFormat, [bombs])
    );
  }
}
