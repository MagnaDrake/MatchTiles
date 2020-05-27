import * as Phaser from "phaser";
import Shopee from "../Object/Shopee";
import FpsText from "../Object/FpsText";
import GameOptions from "../Util/GameOptions";
import ScoreManager from "../Manager/ScoreManager";

import Tile from "../Object/Tile";

export default class GridManager {
  private static instance: GridManager;
  private canPick: boolean;
  private isDragging: boolean;
  private selectedTile: Tile;

  private gridArray: Array<Array<Tile>>;

  private hintArray: Array<Tile>;

  private poolArray: Array<Tile>;

  private tileGroup: Phaser.GameObjects.Group;

  private swappingTiles: number;

  private scene: Phaser.Scene;

  //private removalMap: Array<Array<number>>;

  private removalMap: Array<
    Array<{ counter: number; exploded: boolean; turnToBomb: boolean }>
  >;

  public static get Instance() {
    return this.instance || (this.instance = new GridManager());
  }

  drawGrid(scene: Phaser.Scene): void {
    this.gridArray = new Array<Array<Tile>>();
    this.poolArray = new Array<Tile>();

    this.scene = scene;
    this.swappingTiles = 0;
    this.selectedTile = null;

    this.tileGroup = scene.add.group();

    this.hintArray = new Array<Tile>();

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

    //ScoreManager.Instance.updateBombCount(this.countBombs());
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

  public startSwipe(pointer: Phaser.Input.Pointer) {
    if (this.isDragging && this.selectedTile != null) {
      let deltaX: number = pointer.downX - pointer.x;
      let deltaY: number = pointer.downY - pointer.y;

      let deltaRow: number = 0;
      let deltaCol: number = 0;

      if (
        deltaX > GameOptions.OPTIONS.tileSize / 2 &&
        Math.abs(deltaY) < GameOptions.OPTIONS.tileSize / 4
      ) {
        deltaCol = -1;
      }

      if (
        deltaX < -GameOptions.OPTIONS.tileSize / 2 &&
        Math.abs(deltaY) < GameOptions.OPTIONS.tileSize / 4
      ) {
        deltaCol = 1;
      }

      if (
        deltaY > GameOptions.OPTIONS.tileSize / 2 &&
        Math.abs(deltaX) < GameOptions.OPTIONS.tileSize / 4
      ) {
        deltaRow = -1;
      }

      if (
        deltaY < -GameOptions.OPTIONS.tileSize / 2 &&
        Math.abs(deltaX) < GameOptions.OPTIONS.tileSize / 4
      ) {
        deltaRow = 1;
      }

      if (deltaRow + deltaCol != 0) {
        let pickedTile = this.tileAt(
          this.getTileRow(this.selectedTile) + deltaRow,
          this.getTileCol(this.selectedTile) + deltaCol
        );
        if (pickedTile != null) {
          this.selectedTile.setScale(1);
          this.swapTiles(this.selectedTile, pickedTile, true);
        }
      }
    }
  }

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

    //this.removalMap = new Array<Array<number>>();
    this.removalMap = new Array<
      Array<{ counter: number; exploded: boolean; turnToBomb: boolean }>
    >();

    console.log(this.removalMap);

    for (let i = 0; i < GameOptions.OPTIONS.fieldSize; i++) {
      //let arr = new Array<number>();
      let arr = new Array<{
        counter: number;
        exploded: boolean;
        turnToBomb: boolean;
      }>();
      this.removalMap.push(arr);
      for (let j = 0; j < GameOptions.OPTIONS.fieldSize; j++) {
        this.removalMap[i].push({
          counter: 0,
          exploded: false,
          turnToBomb: false,
        });
      }
    }
    //ScoreManager.Instance.resetLine();
    this.markMatches(GameOptions.HORIZONTAL);
    this.markMatches(GameOptions.VERTICAL);
    this.handleBombs();
    this.destroyTiles();
  }

  markMatches(direction: number) {
    for (let i = 0; i < GameOptions.OPTIONS.fieldSize; i++) {
      let colorStreak = 1;
      let currentColor = -1;
      let startStreak = 0;
      let colorToWatch = 0;

      for (let j = 0; j < GameOptions.OPTIONS.fieldSize; j++) {
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
            let placedBomb: boolean = false;
            for (let k = 0; k < colorStreak; k++) {
              if (direction == GameOptions.HORIZONTAL) {
                if (colorStreak > 3 && !placedBomb) {
                  console.log("ay bomb");
                  //this.removalMap[i][startStreak + k].counter++;
                  this.removalMap[i][startStreak + k].turnToBomb = true;
                  placedBomb = true;
                }
                this.removalMap[i][startStreak + k].counter++;
              } else {
                if (colorStreak > 3 && !placedBomb) {
                  console.log("ay bomb");

                  //this.removalMap[startStreak + k][i].counter++;
                  this.removalMap[startStreak + k][i].turnToBomb = true;

                  placedBomb = true;
                }
                this.removalMap[startStreak + k][i].counter++;
              }
            }
            //ScoreManager.Instance.incrementLine();
            ScoreManager.Instance.addScore(colorStreak, false);
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

  handleBombs() {
    let i = 0;
    let j = 0;

    //let scoreGain = 0;
    //iterate all
    while (i < GameOptions.OPTIONS.fieldSize) {
      j = 0;
      while (j < GameOptions.OPTIONS.fieldSize) {
        //check if a tile to be removed is a bomb or not
        //if yes explode and mark a 3x3 area around the tile
        //then reset the counter to check the whole grid from start
        //console.log(i + " " + j);
        //console.log(this.removalMap[i][j] + " " + this.gridArray[i][j].isBomb);

        if (
          this.removalMap[i][j].counter > 0 &&
          !this.removalMap[i][j].exploded &&
          this.gridArray[i][j].isBomb
        ) {
          this.removalMap[i][j].exploded = true;
          this.explodeTiles(i, j);
          console.log("yappari");
          i = 0;
          j = 0;
        } else {
          //console.log("something wong");
          j++;
        }
      }
      i++;
    }
  }

  explodeTiles(x: number, y: number) {
    //console.log(x + " " + y);

    let scoreGain = 0;
    for (let i = x - 1; i <= x + 1; i++) {
      for (let j = y - 1; j <= y + 1; j++) {
        if (
          i < 0 ||
          i >= GameOptions.OPTIONS.fieldSize ||
          j < 0 ||
          j >= GameOptions.OPTIONS.fieldSize
        ) {
          continue;
        } else if (!(i == x && j == y)) {
          this.removalMap[i][j].counter++;
          scoreGain++;
        }
      }
    }

    ScoreManager.Instance.addScore(scoreGain, true);
  }

  destroyTiles() {
    let destroyed = 0;
    //console.log(this.removalMap);
    //console.log("la destroya");
    for (let i = 0; i < GameOptions.OPTIONS.fieldSize; i++) {
      for (let j = 0; j < GameOptions.OPTIONS.fieldSize; j++) {
        let marker: number = this.removalMap[i][j].counter;
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
              if (!this.removalMap[i][j].turnToBomb) {
                this.poolArray.push(targetTile);
                targetTile.setVisible(false);
                targetTile.isBomb = false;
              } else {
                this.addBombOnGrid(i, j, targetTile);
                this.removalMap[i][j].turnToBomb = false;
              }
              //console.log(targetTile);
              //console.log(marker);
              if (destroyed <= 0) {
                this.dropTiles();
                this.replenishGrid();
              }
            },
          });
          if (!this.removalMap[i][j].turnToBomb) {
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
    this.gridArray[i][j].setBomb();
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
          this.gridArray[i][j].isBomb = false;
          this.gridArray[i][j].setScale(1);
          //console.log(this.gridArray[i][j]);
          this.gridArray[i][j].setColor(randomColor);
          this.gridArray[i][j].setVisible(true);
          this.gridArray[i][j].x =
            GameOptions.OPTIONS.tileSize * j + GameOptions.OPTIONS.tileSize / 2;
          this.gridArray[i][j].y =
            GameOptions.OPTIONS.tileSize / 2 -
            (emptySpots - i) * GameOptions.OPTIONS.tileSize;
          this.gridArray[i][j].alpha = 1;
          //console.log(this);
          ScoreManager.Instance.updateBombCount(this.countBombs());
          ScoreManager.Instance.updateScore();

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
              //ScoreManager.Instance.updateScore();
              //console.log("callback rep: " + rep);
              if (rep == 0) {
                if (this.matchInGrid()) {
                  ScoreManager.Instance.incrementCascade();
                  //console.log("aug");
                  //console.log(this);
                  this.scene.time.addEvent({
                    delay: 250,
                    callback: () => {
                      this.handleMatches();
                    },
                  });
                } else {
                  ScoreManager.Instance.resetParameters();
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

  countBombs(): number {
    let bombs: number = 0;

    for (let i = 0; i < GameOptions.OPTIONS.fieldSize; i++) {
      for (let j = 0; j < GameOptions.OPTIONS.fieldSize; j++) {
        if (this.gridArray[i][j] != null) {
          if (this.gridArray[i][j].isBomb) {
            bombs++;
          }
        }
      }
    }
    return bombs;
  }

  //hint system
  //the entirety of this function is ugly and i have not found
  //a simpler way
  //it basically bruteforces through the tiles from top left
  //and swaps the tile position within the array
  //trying all possible moves (4 directions)
  //it stops at the first encounter of a possible move
  //then swaps the tile back to its original position
  //it then stores the tiles in an array

  //my research is that most match 3 games uses this approach because
  //as long as N is < 1000 (which match 3 usually stays well under, max 9x9 grid)
  //the efficiency is trivial
  //however this code is very unruly and kind of hard to read
  //and involves A LOT of nested loops within nested loops
  //moreover this code does a lot of the same thing that the actual swap and findmatch code
  //that concerncs the main gameplay
  //this code just doesnt manipulate the sprites rendered in screen

  //if there is no better way then it might be worth to combine the two functions into one

  public findHints() {
    let foundHint: boolean = false;
    console.log("hints please");
    for (let i = 0; i < GameOptions.OPTIONS.fieldSize; i++) {
      for (let j = 0; j < GameOptions.OPTIONS.fieldSize; j++) {
        for (let k = 0; k < 4; k++) {
          this.swapReference(i, j, k);
          if (this.matchInGrid()) {
            console.log("found match ya");
            this.hintArray = new Array<Tile>();
            this.markHints(GameOptions.HORIZONTAL);
            this.markHints(GameOptions.VERTICAL);
            this.swapReference(i, j, k);
            this.printHint();
            return;
          }
          this.swapReference(i, j, k);
        }
      }
    }
    console.log("no valid moves left");
  }

  swapReference(row: number, col: number, dir: Direction) {
    let currentTile = this.tileAt(row, col);
    console.log("call for swap");
    console.log(dir);
    switch (dir) {
      case Direction.Up:
        console.log("enter up");
        if (row > 0) {
          console.log("switch tile " + row + " " + col + " up");
          this.gridArray[row][col] = this.gridArray[row - 1][col];
          this.gridArray[row - 1][col] = currentTile;
        }
        break;
      case Direction.Right:
        console.log("enter right");

        if (col < GameOptions.OPTIONS.fieldSize - 1) {
          console.log("switch tile " + row + " " + col + " right");

          this.gridArray[row][col] = this.gridArray[row][col + 1];
          this.gridArray[row][col + 1] = currentTile;
        }
        break;
      case Direction.Down:
        console.log("enter down");

        if (row < GameOptions.OPTIONS.fieldSize - 1) {
          console.log("switch tile " + row + " " + col + " down");

          this.gridArray[row][col] = this.gridArray[row + 1][col];
          this.gridArray[row + 1][col] = currentTile;
        }
        break;
      case Direction.Left:
        console.log("enter left");

        if (col > 0) {
          console.log("switch tile " + row + " " + col + " left");

          this.gridArray[row][col] = this.gridArray[row][col - 1];
          this.gridArray[row][col - 1] = currentTile;
        }
        break;
    }
  }

  markHints(direction: number) {
    console.log("am mark hint");
    for (let i = 0; i < GameOptions.OPTIONS.fieldSize; i++) {
      let colorStreak = 1;
      let currentColor = -1;
      let startStreak = 0;
      let colorToWatch = 0;

      for (let j = 0; j < GameOptions.OPTIONS.fieldSize; j++) {
        //console.log(isBomb);
        //console.log("i: " + i + " | j: " + j);

        if (direction == GameOptions.HORIZONTAL) {
          colorToWatch = this.tileAt(i, j).color;
        } else {
          colorToWatch = this.tileAt(j, i).color;
        }
        //console.log(colorToWatch);

        if (colorToWatch == currentColor) {
          //console.log("found streak");
          colorStreak++;
          //console.log(colorToWatch + " " + colorStreak);
        }
        //console.log(colorStreak);
        if (
          colorToWatch != currentColor ||
          j == GameOptions.OPTIONS.fieldSize - 1
        ) {
          if (colorStreak >= 3) {
            for (let k = 0; k < colorStreak; k++) {
              if (direction == GameOptions.HORIZONTAL) {
                //console.log(this.tileAt(i, startStreak + k));
                this.hintArray.push(this.tileAt(i, startStreak + k));
              } else {
                //console.log(this.tileAt(i, startStreak + k));

                this.hintArray.push(this.tileAt(startStreak + k, i));
              }
            }
            return;
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

  printHint() {
    console.log("please print hint");
    console.log(this.hintArray);
    this.hintArray.forEach((element) => {
      console.log(element);
      element.setDepth(1);
      element.setScale(1.2);
    });
  }
}

enum Direction {
  Up,
  Down,
  Left,
  Right,
}
