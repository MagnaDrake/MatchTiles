import GameOptions from "../Util/GameOptions";
import Tile from "../Object/Tile";

const scoreTextFormat = "Score: %1\n" + "Combo: %2\n" + "Cascade: %3\n";

const debugCaptionTextFormat = "Bombs: %1";

const SCORE_MULTIPLIER = 1.2;

const BASE_SCORE = 20;

export default class ScoreManager {
  private static instance: ScoreManager;
  private scoreText: Phaser.GameObjects.Text;
  private debugText: Phaser.GameObjects.Text;
  private matchCombo: number;
  private cascadeCombo: number;
  private lineCombo: number;

  private scoreHolder: number;

  private score: number;

  public static get Instance() {
    return this.instance || (this.instance = new ScoreManager());
  }

  public init(scene: Phaser.Scene) {
    console.log("yeehaw am score");

    this.matchCombo = 0;
    this.lineCombo = 0;
    this.cascadeCombo = 1;
    this.score = 0;
    this.scoreHolder = 0;

    this.scoreText = new Phaser.GameObjects.Text(
      scene,
      10,
      10,
      Phaser.Utils.String.Format(scoreTextFormat, [
        this.score,
        this.matchCombo,
        this.cascadeCombo,
      ]),
      {
        color: "white",
        fontSize: "28px",
      }
    );

    scene.add.existing(this.scoreText);
    this.scoreText.setOrigin(0);
    this.scoreText.setPosition(0, scene.cameras.main.height / 2 + 200);

    this.debugText = new Phaser.GameObjects.Text(
      scene,
      10,
      10,
      Phaser.Utils.String.Format(debugCaptionTextFormat, [0]),
      {
        color: "white",
        fontSize: "28px",
      }
    );

    scene.add.existing(this.debugText);
    this.debugText.setOrigin(0);
    this.debugText.setPosition(0, scene.cameras.main.height / 2 + 100);
  }

  public updateScore() {
    //console.log(this.scoreHolder);
    this.score += this.scoreHolder;
    //console.log(this.score);
    this.updateScoreText();
  }

  private updateScoreText() {
    this.scoreText.setText(
      Phaser.Utils.String.Format(scoreTextFormat, [
        this.score,
        this.matchCombo,
        this.cascadeCombo,
      ])
    );
  }

  public updateBombCount(bombs: number) {
    this.debugText.setText(
      Phaser.Utils.String.Format(debugCaptionTextFormat, [bombs])
    );
  }

  public addScore(tileAmount: number, fromBomb: boolean) {
    //this.cascadeCombo++;
    let baseGain = tileAmount * BASE_SCORE;
    if (!fromBomb) {
      baseGain = baseGain * this.cascadeCombo;
    }
    //let matchComboBonus = baseGain + (baseGain *)
    this.scoreHolder += baseGain;
    console.log(baseGain);
    console.log(this.scoreHolder);
  }

  public incrementCombo() {
    this.matchCombo++;
  }

  public resetCombo() {
    this.matchCombo = 0;
  }

  public incrementCascade() {
    this.cascadeCombo++;
  }

  public incrementLine() {
    this.lineCombo++;
  }

  public resetLine() {
    this.lineCombo = 0;
  }

  public resetParameters() {
    this.matchCombo = 0;
    this.scoreHolder = 0;
    this.cascadeCombo = 1;
    this.updateScoreText();
  }
}
