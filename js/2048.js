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
          this.placeTile(randRow, randCol, TWENTY48.CONSTS.EMPTY_TILE);
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
            tileVector.removeAt(n);
          }
        }

        // Loop through the tile vector and combine all duplicates
        for (n = 0; n < tileVector.length - 1; n++) {
          var tile1 = tileVector[n];
          var tile2 = tileVector[n + 1];

          if (tile1.content == tile2.content) {
            // TODO: Push animation event into queue for combination
            tileVector.removeAt(n);
            tileVector[n] = newTile(tile1);
          }
        }

        // Pad the tile vector with empty tiles
        for (n = tileVector.length; n < TWENTY48.CONSTS.BOARD_SIZE; n++) {
          tileVector[n] = TWENTY48.CONSTS.BOARD_SIZE;
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
          tileVector[n] = getTile(row, col);
        }

        return tileVector;
      },

      placeTileVector(index, isRow, tileVector) {
        // Replace the specified board row or column with the given tile
        // vector
        for (var n = 0; n < TWENTY48.CONSTS.BOARD_SIZE; n++) {
          var row = isRow ? index : n;
          var col = isRow ? n : index;

          placeTile(row, col, tileVector[n]);
        }
      },

      updateRow(direction, row) {
        // Update the specified row by first building a tile vector from
        // it, then compressing that tile vector, and finally placing
        // that tile vector back in this row
        var tileVector = buildTileVector(row, true);

        var shouldReverse = (direction == TWENTY48.CONSTS.DIR.RIGHT);
        tileVector = compressTileVector(tileVector, shouldReverse);

        placeTileVector(row, true, tileVector);
      },

      updateCol(direction, col) {
        // Update the specified column by first building a tile vector
        // from it, then compressing that tile vector, and finally
        // placing that tile vector back in this column
        var tileVector = buildTileVector(col, false);

        var shouldReverse = (direction == TWENTY48.CONSTS.DIR.DOWN);
        tileVector = compressTileVector(tileVector, shouldReverse);

        placeTileVector(col, false, tileVector);
      },

      updateBoard(direction) {
        // Determine from our input direction whether we are shifting
        // horizontally or vertically
        var n;
        if (direction == TWENTY48.CONSTS.DIR.LEFT ||
            direction == TWENTY48.CONSTS.DIR.RIGHT  ) {
          // Update all rows if we are shifting horizontally
          for (n = 0; n < TWENTY48.CONSTS.BOARD_SIZE; n++) {
            updateRow(direction, n);
          }
        } else {
          // Update all columns if we are shifting vertically
          for (n = 0; n < TWENTY48.CONSTS.BOARD_SIZE; n++) {
            updateCol(direction, n);
          }
        }
        // TODO: Generate a new tile and place it on the board
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
