var TWENTY48 = $.extend(TWENTY48, {
  Game: function() {
    return {
      keyboardMap: {
        37: TWENTY48.CONSTS.DIR.LEFT,
        38: TWENTY48.CONSTS.DIR.UP,
        39: TWENTY48.CONSTS.DIR.RIGHT,
        40: TWENTY48.CONSTS.DIR.DOWN
      },

      init: function() {
        var game = this;
        // Setup our game board
        game.board = new TWENTY48.Board();
        game.board.init();

        game.display = new TWENTY48.Display();

        // Configure the controller
        $('body').keyup(function(event) {
          var direction = game.keyboardMap[event.which];
          if (direction !== undefined) {
            // Update the board based on our input
            var events = game.board.update(direction);

            // If we actually moved tiles, update the display
            // and place a new tile
            if (events.length > 0) {
              game.display.update(events);
              game._placeNewTile();
            }
          }
        });
      },

      _placeNewTile: function() {
        var loc = this.board.placeNewTile();
        var value = this.board.getTile(loc).content;

        this.display.placeNewTile(loc, value);
      }
    };
  }
});

$(function() {
  var game = new TWENTY48.Game();
  game.init();
});
