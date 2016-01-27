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
            this.setTile(row, col, TWENTY48.CONSTS.EMPTY_TILE);
          }
        }

        // Place a few random tiles
        for (var n = 0; n < TWENTY48.CONSTS.STARTING_TILES; n++) {
          var randRow = Math.floor(Math.random() * TWENTY48.CONSTS.BOARD_SIZE);
          var randCol = Math.floor(Math.random() * TWENTY48.CONSTS.BOARD_SIZE);
          var oldTile = this.getTile(randRow, randCol);
          this.setTile(randRow, randCol, new TWENTY48.Tile(oldTile));
        }
      },

      // Compress a tile row or column by removing all empty tiles,
      // combining (adjacent, equal) tiles, and padding with empty
      // tiles to retain proper board size
      compressTiles(tileIter) {
        var curTile = tileIter.next().value;
        var nextIter = new TWENTY48.TileIterator(tileIter);
        var nextTile = nextIter.next().value;

        while (nextTile) {
          switch(curTile.empty << 1 | nextTile.empty) {

            // Next tile is empty, keep going
            case 1:
            case 3:
              break;

            // Only current tile is empty
            case 2:
              // Swap tiles
              tileIter.setTile(nextTile);
              nextIter.setTile(curTile);
              curTile = nextTile;
              break;

            // Neither tile is empty
            case 0:
              // If the tiles are the same, combine
              if (curTile.content == nextTile.content) {
                tileIter.setTile(new TWENTY48.Tile(curTile));
                nextIter.setTile(TWENTY48.CONSTS.EMPTY_TILE);
              }

              // We're done with the current tile
              curTile = tileIter.next().value;
              break;
          }

          nextTile = nextIter.next().value;
        }
      },

      update(direction) {
        // Determine from our input direction whether we are shifting
        // horizontally or vertically
        var vert = (direction == TWENTY48.CONSTS.DIR.UP ||
                    direction == TWENTY48.CONSTS.DIR.DOWN);

        // Compress each row or column in the given direction
        for (var n = 0; n < TWENTY48.CONSTS.BOARD_SIZE; n++) {
          this.compressTiles(new TWENTY48.TileIterator(this, vert ? {
            col: n,
            reverse: (direction == TWENTY48.CONSTS.DIR.DOWN)
          } : {
            row: n,
            reverse: (direction == TWENTY48.CONSTS.DIR.RIGHT)
          }));
        }

        // Count all of the empty tiles
        var totalTiles = TWENTY48.CONSTS.BOARD_SIZE * TWENTY48.CONSTS.BOARD_SIZE;
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
            this.tiles[n] = new TWENTY48.Tile(this.tiles[n]);
            break;
          }
        }
      },

      getTile(row, col) {
        if (row === undefined || col === undefined) {
          return;
        }

        return this.tiles[row * TWENTY48.CONSTS.BOARD_SIZE + col];
      },

      setTile(row, col, tile) {
        this.tiles[row * TWENTY48.CONSTS.BOARD_SIZE + col] = tile;
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

  Tile: function(tile) {
    var content, empty = false;

    if (tile === undefined) {
      // undefined means the Empty Tile
      empty = true;
    } else if(tile.empty) {
      // We're generating a completely new tile
      // TODO: Randomly select which tile content to use
      content = 2;
    } else {
      content = TWENTY48.CONSTS.GENERATION_RULES[tile.content];
    }

    return {
      empty: empty,
      content: content
    };
  },

  // We must call next() on the iterator to receive the first value
  TileIterator: function(board, options) {
    var BOARD_SIZE = TWENTY48.CONSTS.BOARD_SIZE;
    var iterStart;

    // Copy constructor
    if (board.options !== undefined) {
      iterStart = board._iter;
      options = board.options;
      board = board.board;
    }

    if (options.row === undefined &&
        options.col === undefined) {
      throw new RangeError("Either a row index or a column index is " +
                           "required to create a tile iterator.");
    }

    return {
      board: board,
      options: options,

      next: function() {
        this._iter = this._nextIter();
        return {
          value: this.board.getTile(this._row(), this._col()),
          done: this._nextIter() === undefined
        };
      },
      setTile: function(tile) {
        this.board.setTile(this._row(), this._col(), tile);
      },

      _row: function() {
        return this.options.row === undefined ? this._iter : this.options.row;
      },
      _col: function() {
        return this.options.col === undefined ? this._iter : this.options.col;
      },

      _iter: iterStart === undefined ? (options.reverse ? BOARD_SIZE : -1) : iterStart,
      _nextIter: function() {
        if (this.options.reverse) {
          return this._iter > 0 ? this._iter - 1 : undefined;
        }
        return this._iter < BOARD_SIZE - 1 ? this._iter + 1 : undefined;
      }
    };
  }
};
