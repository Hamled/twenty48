var TWENTY48 = $.extend(TWENTY48, {
  Board: function() {
    return {
      tiles: [], // ROW MAJOR

      init: function() {
        this._eachTile(function(tile, loc) {
          this._setTile(loc, new TWENTY48.Tile());
        });

        // Place a few random tiles
        for (var n = 0; n < TWENTY48.CONSTS.STARTING_TILES; n++) {
          var randRow = Math.floor(Math.random() * TWENTY48.CONSTS.BOARD_SIZE);
          var randCol = Math.floor(Math.random() * TWENTY48.CONSTS.BOARD_SIZE);
          var randLoc = { row: randRow, col: randCol };

          this._setTile(randLoc, this.getTile(randLoc).next());
        }
      },

      // Compress a tile row or column by moving all non-empty tiles to
      // the highest indexes and combining duplicate tiles into one tile
      // of the next grade
      compressTiles: function(firstTile) {
        // The front tile is always ahead of the back tile
        var backTile = firstTile;
        var frontTile = backTile.next();

        while (frontTile) {
          // We can't do anything if the front tile is empty
          // so we advance past it
          if (frontTile.empty()) {
            frontTile = frontTile.next();
            continue;
          }

          // If the back tile is empty, swap it for the front tile
          // and advance the front tile
          if (backTile.empty()) {
            backTile.swap(frontTile);
            frontTile = frontTile.next();
            continue;
          }

          // If both tiles are the same, combine them
          // and advance both tiles
          if (backTile.content() === frontTile.content()) {
            backTile.combine(frontTile);
            backTile = backTile.next();
            frontTile = frontTile.next();
          } else {
            // Otherwise we're done with the back tile
            backTile = backTile.next();
            // Next we should swap the front tile with the new back tile
            // This may end up swapping a tile with itself which is fine
            backTile.swap(frontTile);
            // And finally, advance the front tile as well
            frontTile = frontTile.next();
          }
        }
      },

      update: function(direction) {
        // Determine from our input direction whether we are shifting
        // horizontally or vertically
        var vert = (direction === TWENTY48.CONSTS.DIR.UP ||
                    direction === TWENTY48.CONSTS.DIR.DOWN);
        // We need to iterate in reverse order if the movement direction
        // is opposite to the natural axis directions of our board
        var reverse = (direction === TWENTY48.CONSTS.DIR.DOWN ||
                       direction === TWENTY48.CONSTS.DIR.RIGHT);

        // Build a log of all board change events, used when rendering
        // the display, and determining if we actually moved
        var events = [];

        // Compress each row or column in the given direction
        for (var n = 0; n < TWENTY48.CONSTS.BOARD_SIZE; n++) {
          var options = {
            row: !vert && n,
            col: vert && n,
            reverse: reverse,
            events: events
          };

          this.compressTiles(new TWENTY48.TileIterator(this, options));
        }

        // Give back any change events for the controller to handle
        return events;
      },

      getTile: function(loc) {
        var inArray = (this._locIndex(loc) < this.tiles.length);
        if (!inArray || !this._locValid(loc)) {
          return;
        }

        return this.tiles[this._locIndex(loc)];
      },

      swapTiles: function(firstLoc, secondLoc) {
        var first = this.getTile(firstLoc);
        var second = this.getTile(secondLoc);

        this._setTile(firstLoc, second);
        this._setTile(secondLoc, first);
      },

      combineTiles: function(firstLoc, secondLoc) {
        var newTile = this.getTile(firstLoc).next();

        this._setTile(firstLoc, newTile);
        this._setTile(secondLoc, new TWENTY48.Tile());
      },

      print: function() {
        var board = "";
        this._eachTile(function(tile, loc) {
          board += tile.content || ".";
          if (loc.col === TWENTY48.CONSTS.BOARD_SIZE - 1) {
            board += "\n";
          }
        });

        console.log(board + "\n");
      },

      /*   PRIVATE FUNCTIONS   */
      _setTile: function(loc, tile) {
        if (!this._locValid(loc)) {
          return;
        }

        this.tiles[this._locIndex(loc)] = tile;
      },

      _placeNewTile: function() {
        // Count all of the empty tiles
        var emptyTiles = 0;
        this._eachTile(function(tile) {
          if (tile.empty) {
            emptyTiles++;
          }
        });

        // Select a random empty tile and replace it with a new tile
        var newTileLoc = Math.floor(Math.random() * emptyTiles);
        var newTile = new TWENTY48.Tile(Math.random() < 0.4 ? 4 : 2);
        var finished = false;

        this._eachTile(function(tile, loc) {
          if (!finished && tile.empty && --newTileLoc < 0) {
            this._setTile(loc, newTile);
            finished = true;
          }
        });
      },

      _locIndex: function(loc) {
        var index = loc.row * TWENTY48.CONSTS.BOARD_SIZE + loc.col;
        return index;
      },

      _locValid: function(loc) {
        var inRange = function(i) {
          return Number.isInteger(i) &&
                 i >= 0 &&
                 i < TWENTY48.CONSTS.BOARD_SIZE;
        };

        return inRange(loc.row) && inRange(loc.col);
      },

      // Call the given method for each tile on the board
      _eachTile: function(func) {
        for (var row = 0; row < TWENTY48.CONSTS.BOARD_SIZE; row++) {
          for (var col = 0; col < TWENTY48.CONSTS.BOARD_SIZE; col++) {
            var loc = { row: row, col: col };
            func.call(this, this.getTile(loc), loc);
          }
        }
      }
    };
  },

  Tile: function(content) {
    return {
      empty: content === undefined,
      content: content,
      next: function() {
        return new TWENTY48.Tile(TWENTY48.CONSTS.GENERATION_RULES[content]);
      }
    };
  },

  TileIterator: function(board, options) {
    var BOARD_SIZE = TWENTY48.CONSTS.BOARD_SIZE;

    if (!Number.isInteger(options.row) && !Number.isInteger(options.col)) {
      throw new RangeError("Either a row index or a column index is " +
                           "required to create a tile iterator.");
    }

    var iter = options.reverse ? BOARD_SIZE - 1: 0;
    if (options.hasOwnProperty("iter")) {
      iter = options.iter;
    }

    return {
      next: function() {
        var nextIter = this._nextIter();

        if (Number.isInteger(nextIter)) {
          return new TWENTY48.TileIterator(board, {
            row: options.row,
            col: options.col,
            reverse: options.reverse,
            events: options.events,
            iter: nextIter
          });
        }
      },
      swap: function(other) {
        var thisLoc = this._loc(),
            otherLoc = other._loc();
        var sameLoc = (thisLoc.row === otherLoc.row &&
                       thisLoc.col === otherLoc.col);

        board.swapTiles(thisLoc, otherLoc);
        if (options.events && !sameLoc) {
          options.events.push({
            type: TWENTY48.CONSTS.EVENT_TYPES.MOVE,
            source: otherLoc,
            destination: thisLoc
          });
        }
      },
      combine: function(other) {
        var thisLoc = this._loc(),
            otherLoc = other._loc();
        board.combineTiles(thisLoc, otherLoc);

        if (options.events) {
          options.events.push({
            type: TWENTY48.CONSTS.EVENT_TYPES.COMBINE,
            source: otherLoc,
            destination: thisLoc,
            newValue: this.content()
          });
        }
      },
      content: function() {
        return board.getTile(this._loc()).content;
      },
      empty: function() {
        return board.getTile(this._loc()).empty;
      },

      /*   PRIVATE FUNCTIONS   */
      _row: function() {
        return Number.isInteger(options.row) ? options.row : this._iter;
      },
      _col: function() {
        return Number.isInteger(options.col) ? options.col : this._iter;
      },
      _loc: function() {
        return {
          row: this._row(),
          col: this._col()
        };
      },

      _iter: iter,
      _nextIter: function() {
        if (options.reverse && this._iter > 0) {
          return this._iter - 1;
        }

        if (!options.reverse && this._iter < BOARD_SIZE - 1) {
          return this._iter + 1;
        }
      },

      _events: options.events
    };
  }
});
