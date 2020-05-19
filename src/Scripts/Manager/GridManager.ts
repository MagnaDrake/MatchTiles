import * as Phaser from "phaser";
import Shopee from "../Object/Shopee";
import FpsText from "../Object/FpsText";
import GameOptions from "../Util/GameOptions";

import Tile from "../Object/Tile";
import { Grid } from "matter";

export default class GridManager {
  private static instance: GridManager;
  private canPick: boolean;
  private isDragging: boolean;
  private selectedTile: Tile;

  private gridArray: Array<Array<Tile>>;
  private poolArray: Array<Tile>;

  private tileGroup: Phaser.GameObjects.Group;

  private swappingTiles: number;

  private scene: Phaser.Scene;

  private removalMap: Array<Array<number>>;

  public static get Instance() {
    return this.instance || (this.instance = new GridManager());
  }

  drawGrid2(scene: Phaser.Scene) {
    console.log("yeehaw");
    let tile: Tile = new Tile(
      scene,
      GameOptions.OPTIONS.tileSize * 0 + GameOptions.OPTIONS.tileSize / 2,
      GameOptions.OPTIONS.tileSize * 0 + GameOptions.OPTIONS.tileSize / 2,
      "tiles"
    );
  }
  drawGrid(scene: Phaser.Scene): void {
    this.gridArray = new Array<Array<Tile>>();
    this.poolArray = new Array<Tile>();

    this.scene = scene;
    this.swappingTiles = 0;
    this.selectedTile = null;

    this.tileGroup = scene.add.group();

    this.canPick = true;

    for (let i: number = 0; i < GameOptions.OPTIONS.fieldSize; i++) {
      this.gridArray.push(new Array<Tile>());
      for (let j: number = 0; j < GameOptions.OPTIONS.fieldSize; j++) {
        let tile: Tile = new Tile(
          scene,
          GameOptions.OPTIONS.tileSize * j + GameOptions.OPTIONS.tileSize / 2,
          GameOptions.OPTIONS.tileSize * i + GameOptions.OPTIONS.tileSize / 2,
          "tiles"
        );
        this.tileGroup.add(tile);
        let count = 0;
        do {
          //console.log("init cycle: " + count);
          let randomColor = Phaser.Math.Between(
            0,
            GameOptions.OPTIONS.tileColors - 1
          );
          tile.setColor(randomColor);
          this.gridArray[i][j] = tile;
          count++;
          //console.log(this.gridArray[i][j]);
        } while (this.isMatch(i, j));
      }
    }
  }
  isMatch(row: number, col: number): boolean {
    return this.isHorizontalMatch(row, col) || this.isVerticalMatch(row, col);
  }

  isHorizontalMatch(row: number, col: number): boolean {
    return (
      this.compareColors(this.tileAt(row, col), this.tileAt(row, col - 1)) &&
      this.compareColors(this.tileAt(row, col), this.tileAt(row, col - 2))
    );
  }

  isVerticalMatch(row: number, col: number): boolean {
    return (
      this.compareColors(this.tileAt(row, col), this.tileAt(row - 1, col)) &&
      this.compareColors(this.tileAt(row, col), this.tileAt(row - 2, col))
    );
  }

  tileAt(row: number, col: number): Tile {
    if (
      row < 0 ||
      row >= GameOptions.OPTIONS.fieldSize ||
      col < 0 ||
      col >= GameOptions.OPTIONS.fieldSize
    ) {
      //console.log("es null");
      return null;
    }
    return this.gridArray[row][col];
  }

  compareColors(tile1: Tile, tile2: Tile) {
    if (tile1 == null || tile2 == null) {
      return false;
    }
    return tile1.color == tile2.color;
  }

  public tileSelect(pointer: Phaser.Input.Pointer) {
    if (this.canPick) {
      this.isDragging = true;
      let row = Math.floor(pointer.y / GameOptions.OPTIONS.tileSize);
      let col = Math.floor(pointer.x / GameOptions.OPTIONS.tileSize);
      let pickedTile = this.tileAt(row, col);

      if (pickedTile != null) {
        if (this.selectedTile == null) {
          console.log("isbomb: " + pickedTile.isBomb);
          pickedTile.setScale(1.2);
          pickedTile.setDepth(1);
          this.selectedTile = pickedTile;
        } else {
          //console.log("i hab tile");
          if (this.areTheSame(pickedTile, this.selectedTile)) {
            //console.log("is same");

            this.selectedTile.setScale(1);
            this.selectedTile = null;
          } else {
            if (this.areNext(pickedTile, this.selectedTile)) {
              //console.log("swap");

              this.selectedTile.setScale(1);
              this.swapTiles(this.selectedTile, pickedTile, true);
            } else {
              //console.log("nein");

              this.selectedTile.setScale(1);
              pickedTile.setScale(1.2);
              this.selectedTile = pickedTile;
            }
          }
        }
      }
    }
  }

  public startSwipe() {}

  public stopSwipe() {
    this.isDragging = false;
  }

  areTheSame(tile1: Tile, tile2: Tile): boolean {
    return (
      this.getTileRow(tile1) == this.getTileRow(tile2) &&
      this.getTileCol(tile1) == this.getTileCol(tile2)
    );
  }

  getTileRow(tile: Tile): number {
    return Math.floor(tile.y / GameOptions.OPTIONS.tileSize);
  }

  getTileCol(tile: Tile): number {
    return Math.floor(tile.x / GameOptions.OPTIONS.tileSize);
  }

  areNext(tile1: Tile, tile2: Tile): boolean {
    return (
      Math.abs(this.getTileRow(tile1) - this.getTileRow(tile2)) +
        Math.abs(this.getTileCol(tile1) - this.getTileCol(tile2)) ==
      1
    );
  }

  swapTiles(tile1: Tile, tile2: Tile, swapBack: boolean) {
    this.swappingTiles = 2;
    this.canPick = false;
    this.isDragging = false;
    //let tempTile: Tile = tile1;

    let tile1Row = this.getTileRow(tile1);
    let tile1Col = this.getTileCol(tile1);

    let tile2Row = this.getTileRow(tile2);
    let tile2Col = this.getTileCol(tile2);

    this.gridArray[tile1Row][tile1Col] = tile2;
    this.gridArray[tile2Row][tile2Col] = tile1;

    this.tweenTile(tile1, tile2, swapBack);
    this.tweenTile(tile2, tile1, swapBack);
  }

  tweenTile(tile1: Tile, tile2: Tile, swapBack: boolean) {
    let row = this.getTileRow(tile1);
    let col = this.getTileCol(tile1);

    this.scene.tweens.add({
      targets: this.gridArray[row][col],
      x: col * GameOptions.OPTIONS.tileSize + GameOptions.OPTIONS.tileSize / 2,
      y: row * GameOptions.OPTIONS.tileSize + GameOptions.OPTIONS.tileSize / 2,
      duration: GameOptions.OPTIONS.swapSpeed,
      callbackScope: this,
      onComplete: () => {
        //console.log(this);
        this.swappingTiles--;
        if (this.swappingTiles == 0) {
          if (!this.matchInGrid() && swapBack) {
            this.swapTiles(tile1, tile2, false);
          } else {
            if (this.matchInGrid()) {
              //console.log("tween tile");
              //console.log(this);
              this.handleMatches();
            } else {
              this.canPick = true;
              this.selectedTile = null;
            }
          }
        }
      },
    });
  }

  matchInGrid(): boolean {
    for (let i = 0; i < GameOptions.OPTIONS.fieldSize; i++) {
      for (let j = 0; j < GameOptions.OPTIONS.fieldSize; j++) {
        if (this.isMatch(i, j)) {
          return true;
        }
      }
    }
    return false;
  }

  handleMatches() {
    //console.log(this);

    this.removalMap = new Array<Array<number>>();
    for (let i = 0; i < GameOptions.OPTIONS.fieldSize; i++) {
      let arr = new Array<number>();
      this.removalMap.push(arr);
      for (let j = 0; j < GameOptions.OPTIONS.fieldSize; j++) {
        this.removalMap[i].push(0);
      }
    }

    this.markMatches(GameOptions.HORIZONTAL);
    this.markMatches(GameOptions.VERTICAL);
    this.destroyTiles();
  }

  markMatches(direction: number) {
    for (let i = 0; i < GameOptions.OPTIONS.fieldSize; i++) {
      let colorStreak = 1;
      let currentColor = -1;
      let startStreak = 0;
      let colorToWatch = 0;
      let isBomb = false;
      let bombed = false;
      let bombCoord = [];
      for (let j = 0; j < GameOptions.OPTIONS.fieldSize; j++) {
        if (!isBomb) {
          isBomb = this.tileAt(i, j).isBomb;
          console.log("update bomb: " + isBomb);
          if (isBomb) {
            bombCoord[0] = i;
            bombCoord[1] = j;
            console.log(bombCoord);
          }
        }
        //console.log(isBomb);

        if (direction == GameOptions.HORIZONTAL) {
          colorToWatch = this.tileAt(i, j).color;
        } else {
          colorToWatch = this.tileAt(j, i).color;
        }

        if (colorToWatch == currentColor) {
          //console.log("found streak");
          colorStreak++;
          //console.log(colorToWatch + " " + colorStreak);
        }

        if (
          colorToWatch != currentColor ||
          j == GameOptions.OPTIONS.fieldSize - 1
        ) {
          if (colorStreak >= 3) {
            console.log("i haz bomb: " + isBomb);

            let placedBomb: boolean = false;
            for (let k = 0; k < colorStreak; k++) {
              if (isBomb && !bombed) {
                console.log("IS BOMB");
                for (let o = bombCoord[0] - 1; o <= bombCoord[0] + 1; o++) {
                  for (let p = bombCoord[1] - 1; p <= bombCoord[1] + 1; p++) {
                    console.log(o + " " + p);
                    if (
                      o >= 0 &&
                      o < GameOptions.OPTIONS.fieldSize &&
                      p >= 0 &&
                      p < GameOptions.OPTIONS.fieldSize
                    ) {
                      console.log("I AM BOMBING");
                      this.removalMap[o][p]++;
                    }
                  }
                }
              }

              if (direction == GameOptions.HORIZONTAL) {
                if (colorStreak > 3 && !placedBomb) {
                  console.log("ay bomb");
                  this.removalMap[i][startStreak + k]++;
                  placedBomb = true;
                }
                this.removalMap[i][startStreak + k]++;
              } else {
                if (colorStreak > 3 && !placedBomb) {
                  console.log("ay bomb");

                  this.removalMap[startStreak + k][i]++;
                  placedBomb = true;
                }
                this.removalMap[startStreak + k][i]++;
              }
            }
          }
          startStreak = j;
          colorStreak = 1;
          currentColor = colorToWatch;
          //isBomb = false;
          //bombed = false;
        }
      }
    }
  }

  destroyTiles() {
    let destroyed = 0;
    //console.log(this.removalMap);
    //console.log("la destroya");
    for (let i = 0; i < GameOptions.OPTIONS.fieldSize; i++) {
      for (let j = 0; j < GameOptions.OPTIONS.fieldSize; j++) {
        let marker: number = this.removalMap[i][j];
        //console.log("hey " + marker);
        if (marker > 0) {
          destroyed++;
          let targetTile = this.gridArray[i][j];
          //console.log(marker);

          this.scene.tweens.add({
            targets: targetTile,
            alpha: 0.5,
            duration: GameOptions.OPTIONS.destroySpeed,
            callbackScope: this,
            onComplete: () => {
              destroyed--;
              if (marker <= 1) {
                this.poolArray.push(targetTile);
                targetTile.setVisible(false);
                targetTile.isBomb = false;
              } else {
                this.addBombOnGrid(i, j, targetTile);
              }
              //console.log(targetTile);
              //console.log(marker);
              if (destroyed <= 0) {
                this.dropTiles();
                this.replenishGrid();
              }
            },
          });
          if (marker <= 1) {
            this.gridArray[i][j] = null;
          }
        }
      }
    }
  }

  addBombOnGrid(i: number, j: number, targetTile: Tile) {
    console.log(targetTile.color);
    this.gridArray[i][j] = targetTile;

    //this.gridArray[i][j].setVisible(true);
    this.gridArray[i][j].alpha = 1;
    this.gridArray[i][j].isBomb = true;
  }

  dropTiles() {
    for (let i = GameOptions.OPTIONS.fieldSize - 2; i >= 0; i--) {
      for (let j = 0; j < GameOptions.OPTIONS.fieldSize; j++) {
        if (this.gridArray[i][j] != null) {
          let fallTiles = this.holesBelow(i, j);
          if (fallTiles > 0) {
            this.scene.tweens.add({
              targets: this.gridArray[i][j],
              y:
                this.gridArray[i][j].y +
                fallTiles * GameOptions.OPTIONS.tileSize,
              duration: GameOptions.OPTIONS.fallSpeed * fallTiles,
            });
            this.gridArray[i + fallTiles][j] = this.gridArray[i][j];
            this.gridArray[i][j] = null;
          }
        }
      }
    }
  }

  holesBelow(row: number, col: number): number {
    let res = 0;
    for (let i = row + 1; i < GameOptions.OPTIONS.fieldSize; i++) {
      if (this.gridArray[i][col] == null) {
        res++;
      }
    }
    return res;
  }

  replenishGrid() {
    let rep = 0;
    for (let j = 0; j < GameOptions.OPTIONS.fieldSize; j++) {
      let emptySpots = this.holesInCol(j);
      if (emptySpots > 0) {
        for (let i = 0; i < emptySpots; i++) {
          //console.log(emptySpots);
          //console.log(i);
          rep++;
          //console.log("replenish counter: " + rep);
          let randomColor = Phaser.Math.Between(
            0,
            GameOptions.OPTIONS.tileColors - 1
          );
          //console.log(this.poolArray);
          this.gridArray[i][j] = this.poolArray.pop();
          //console.log(this.gridArray[i][j]);
          this.gridArray[i][j].setColor(randomColor);
          this.gridArray[i][j].setVisible(true);
          this.gridArray[i][j].x =
            GameOptions.OPTIONS.tileSize * j + GameOptions.OPTIONS.tileSize / 2;
          this.gridArray[i][j].y =
            GameOptions.OPTIONS.tileSize / 2 -
            (emptySpots - i) * GameOptions.OPTIONS.tileSize;
          this.gridArray[i][j].alpha = 1;
          this.scene.tweens.add({
            targets: this.gridArray[i][j],
            y:
              GameOptions.OPTIONS.tileSize * i +
              GameOptions.OPTIONS.tileSize / 2,
            duration: GameOptions.OPTIONS.fallSpeed * emptySpots,
            callbackScope: this,
            onComplete: () => {
              rep--;
              //console.log("oncomplete inside replenish: " + this);

              //console.log("callback rep: " + rep);
              if (rep == 0) {
                if (this.matchInGrid()) {
                  //console.log("aug");
                  //console.log(this);
                  this.scene.time.addEvent({
                    delay: 250,
                    callback: () => {
                      this.handleMatches();
                    },
                  });
                } else {
                  this.canPick = true;
                  this.selectedTile = null;
                }
              }
            },
          });
        }
      }
    }
  }

  holesInCol(col: number) {
    let res = 0;
    for (let i = 0; i < GameOptions.OPTIONS.fieldSize; i++) {
      if (this.gridArray[i][col] == null) {
        res++;
      }
    }
    return res;
  }
}
