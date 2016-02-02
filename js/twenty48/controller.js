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

        // Configure the controller
        $('body').keyup(function(event) {
          var direction = game.keyboardMap[event.which];
          if (direction !== undefined) {
            game.handleInput(direction);
          }
        });
      },

      handleInput: function(direction) {
        // Update the board based on our input
        this.board.update(direction);
      }
    };
  }
});

$(function() {
  var game = new TWENTY48.Game();
  game.init();
});
