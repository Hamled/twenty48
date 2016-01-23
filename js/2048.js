var TWENTY48 = TWENTY48 || {

  CONSTS: {
    BOARD_SIZE: 4,
    EMPTY_TILE: undefined,
    STARTING_TILES: 2,
    GENERATION_RULES: {
      2: 4,
      4: 8,
      8: 16,
      16: 32,
      32: 64,
      64: 128,
      128: 256,
      256: 512,
      512: 1024,
      1024: 2048
    },
    DIR: {
      LEFT: 0,
      RIGHT: 1,
      UP: 2,
      DOWN: 3
    }
  },

  Board: function() {
    return {
      tiles: [], // ROW MAJOR

      init() {
        // HACK: I don't yet know how I can elegantly have this set in
        // the CONSTS object directly. Currently it seems to fail
        // because the Tile constructor is not yet referenceable
        // through that identifier.
        TWENTY48.CONSTS.EMPTY_TILE = new TWENTY48.Tile(undefined);

        for (var row = 0; row < TWENTY48.CONSTS.BOARD_SIZE; row++) {
          for (var col = 0; col < TWENTY48.CONSTS.BOARD_SIZE; col++) {
            this.placeTile(row, col, TWENTY48.CONSTS.EMPTY_TILE);
          }
        }

        // Place a few random tiles
        for (var n = 0; n < TWENTY48.CONSTS.STARTING_TILES; n++) {
          var randRow = Math.floor(Math.random() * TWENTY48.CONSTS.BOARD_SIZE);
          var randCol = Math.floor(Math.random() * TWENTY48.CONSTS.BOARD_SIZE);
          this.placeTile(randRow, randCol, this.newTile(TWENTY48.CONSTS.EMPTY_TILE));
        }
      },

      compressTileVector(tileVector, shouldReverse) {
        // Logic to generate a new tile vector that has been compressed
        // The tile vector might be from a row or a column on the board
        // We assume compression always happens in the direction of
        // decreasing indexes
        // The compressed tile vector is then padded with empty tiles up
        // to the dimension of the board

        // If necessary, reverse the vector before and after compressing
        if (shouldReverse) {
          tileVector.reverse();
        }

        // Loop through the tile vector and remove all empty tiles
        for (var n = tileVector.length - 1; n >= 0; n--) {
          if (tileVector[n].empty) {
            tileVector.splice(n, 1);
          }
        }

        // Loop through the tile vector and combine all duplicates
        for (n = 0; n < tileVector.length - 1; n++) {
          var tile1 = tileVector[n];
          var tile2 = tileVector[n + 1];

          if (tile1.content == tile2.content) {
            // TODO: Push animation event into queue for combination
            tileVector.splice(n, 1);
            tileVector[n] = this.newTile(tile1);
          }
        }

        // Pad the tile vector with empty tiles
        for (n = tileVector.length; n < TWENTY48.CONSTS.BOARD_SIZE; n++) {
          tileVector[n] = TWENTY48.CONSTS.EMPTY_TILE;
        }

        if (shouldReverse) {
          tileVector.reverse();
        }

        return tileVector;
      },

      buildTileVector(index, isRow) {
        // Build a tile vector from the specified board row or column
        var tileVector = [];
        for (var n = 0; n < TWENTY48.CONSTS.BOARD_SIZE; n++) {
          var row = isRow ? index : n;
          var col = isRow ? n : index;
          tileVector[n] = this.getTile(row, col);
        }

        return tileVector;
      },

      placeTileVector(index, isRow, tileVector) {
        // Replace the specified board row or column with the given tile
        // vector
        for (var n = 0; n < TWENTY48.CONSTS.BOARD_SIZE; n++) {
          var row = isRow ? index : n;
          var col = isRow ? n : index;

          this.placeTile(row, col, tileVector[n]);
        }
      },

      updateRow(direction, row) {
        // Update the specified row by first building a tile vector from
        // it, then compressing that tile vector, and finally placing
        // that tile vector back in this row
        var tileVector = this.buildTileVector(row, true);

        var shouldReverse = (direction == TWENTY48.CONSTS.DIR.RIGHT);
        tileVector = this.compressTileVector(tileVector, shouldReverse);

        this.placeTileVector(row, true, tileVector);
      },

      updateCol(direction, col) {
        // Update the specified column by first building a tile vector
        // from it, then compressing that tile vector, and finally
        // placing that tile vector back in this column
        var tileVector = this.buildTileVector(col, false);

        var shouldReverse = (direction == TWENTY48.CONSTS.DIR.DOWN);
        tileVector = this.compressTileVector(tileVector, shouldReverse);

        this.placeTileVector(col, false, tileVector);
      },

      update(direction) {
        // Determine from our input direction whether we are shifting
        // horizontally or vertically
        var n;
        if (direction == TWENTY48.CONSTS.DIR.LEFT ||
            direction == TWENTY48.CONSTS.DIR.RIGHT  ) {
          // Update all rows if we are shifting horizontally
          for (n = 0; n < TWENTY48.CONSTS.BOARD_SIZE; n++) {
            this.updateRow(direction, n);
          }
        } else {
          // Update all columns if we are shifting vertically
          for (n = 0; n < TWENTY48.CONSTS.BOARD_SIZE; n++) {
            this.updateCol(direction, n);
          }
        }

        // Count all of the empty tiles
        const totalTiles = TWENTY48.CONSTS.BOARD_SIZE * TWENTY48.CONSTS.BOARD_SIZE;
        var emptyTiles = 0;
        for (n = 0; n < totalTiles; n++) {
          if (this.tiles[n].empty) {
            emptyTiles++;
          }
        }

        // Select a random empty tile and replace it with a new tile
        var newTileLoc = Math.floor(Math.random() * emptyTiles);
        for (n = 0; n < totalTiles; n++) {
          if (this.tiles[n].empty && --newTileLoc < 0) {
            this.tiles[n] = this.newTile(TWENTY48.CONSTS.EMPTY_TILE);
            break;
          }
        }
      },

      getTile(row, column) {
        return this.tiles[row * TWENTY48.CONSTS.BOARD_SIZE + column];
      },

      placeTile(row, column, tile) {
        this.tiles[row * TWENTY48.CONSTS.BOARD_SIZE + column] = tile;
      },

      newTile(currentTile) {
        var tileContent;

        if (currentTile === undefined || currentTile.empty) {
          // We're generating a completely new tile
          // TODO: Randomly select which tile content to use
          tileContent = 2;
        } else {
          tileContent = TWENTY48.CONSTS.GENERATION_RULES[currentTile.content];
        }

        return new TWENTY48.Tile(tileContent);
      },

      print() {
        var board = "";
        for (var row = 0; row < TWENTY48.CONSTS.BOARD_SIZE; row++) {
          for (var col = 0; col < TWENTY48.CONSTS.BOARD_SIZE; col++) {
            board += this.getTile(row, col).content || ".";
          }
          board += "\n";
        }

        console.log(board + "\n");
      }
    };
  },

  Tile: function(content) {
    if(content === undefined) {
      // undefined means the Empty Tile
      return {
        empty: true,
        content: undefined
      };
    }

    // Otherwise... generate a new tile
    // This tile should map to something in the view layer to allow for
    // animating the tile's movement
    return {
      empty: false,
      content: content
    };
  }
};
