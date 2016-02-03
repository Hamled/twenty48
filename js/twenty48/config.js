var TWENTY48 = $.extend(TWENTY48, {
  CONSTS: {
    BOARD_SIZE: 4,
    STARTING_TILES: 2,
    NEW_TILE_DELAY: 350, // milliseconds
    GENERATION_RULES: {
      undefined: 2,
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
    },
    EVENT_TYPES: {
      MOVE: 0,
      COMBINE: 1
    }
  }
});
