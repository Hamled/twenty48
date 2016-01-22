var TWENTY48 = TWENTY48 || {

  CONSTS: {
    BOARD_SIZE: 4,
    EMPTY_TILE: new Tile(undefined),
    STARTING_TILES: 2
  },

  Board: function() {
    return {
      tiles: [],

      init() {
        for (var row=0; row < TWENTY48.CONSTS.BOARD_SIZE; ++row) {
          for (var col=0; col < TWENTY48.CONSTS.BOARD_SIZE; ++col) {
            this.placeTile(row, col, TWENTY48.CONSTS.EMPTY_TILE);
          }
        }

        // Place a few random tiles
        for (var n=0; n < TWENTY48.CONSTS.STARTING_TILES; ++n) {
          var randRow = Math.floor(Math.random() * TWENTY48.CONSTS.BOARD_SIZE);
          var randCol = Math.floor(Math.random() * TWENTY48.CONSTS.BOARD_SIZE);
          this.placeTile(randRow, randCol, TWENTY48.CONSTS.EMPTY_TILE);
        }
      },

      compressTileVector(tileVector) {
        // Logic to generate a new tile vector that has been compressed
        // The tile vector might be from a row or a column on the board
        // We assume compression always happens in the direction of
        // increasing indexes
        // The compressed tile vector is then padded with empty tiles up
        // to the dimension of the board

      },

      buildTileVector(index, isRow) {
        // Build a tile vector from the specified board row or column
      },

      placeTileVector(index, isRow, tileVector) {
        // Replace the specified board row or column with the given tile
        // vector
      },

      updateRow(row) {
        // Update the specified row by first building a tile vector from
        // it, then compressing that tile vector, and finally placing
        // that tile vector back in this row
      },

      updateColumn(column) {
        // Update the specified column by first building a tile vector
        // from it, then compressing that tile vector, and finally
        // placing that tile vector back in this column
      },

      generateNewTile() {

      },

      placeTile(row, column, tile) {
        this.tiles[row * TWENTY48.CONSTS.BOARD_SIZE + column] = tile;
      },

      updateBoard() {
        // Determine from our input direction whether we are shifting
        // horizontally or vertically
        // Update all rows if we are shifting horizontally
        // Update all columns if we are shifting vertically
        // Generate a new tile and place it on the board
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
