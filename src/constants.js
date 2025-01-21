// Map:
const OUTPUT_MAP_WIDTH = 20;        // in tiles
const OUTPUT_MAP_HEIGHT = 20;       // in tiles
const TILE_WIDTH = 64;				// in pixels
const MAX_ATTEMPTS = 100;

// Directions:
// [y, x]
const UP = [-1, 0];
const DOWN = [1, 0];
const LEFT = [0, -1];
const RIGHT = [0, 1];
const DIRECTIONS = [UP, DOWN, LEFT, RIGHT];

// Tile IDs:
// C = "center", BR = "bottom right", LM = "left middle", TL = "top left", etc.
const BLANK = 195;
const WATER = 56;

const GRASS_C = 40;
const GRASS_BR = 11;
const GRASS_BM = 25;
const GRASS_BL = 39;
const GRASS_TR = 41;
const GRASS_TM = 55;
const GRASS_TL = 69;
const GRASS_RM = 26;
const GRASS_LM = 54;

const SAND_C = 110;
const SAND_BR = 81;
const SAND_BM = 95;
const SAND_BL = 109;
const SAND_TR = 14;
const SAND_TM = 28;
const SAND_TL = 42;
const SAND_RM = 96;
const SAND_LM = 124;

const DIRT_C = 175;
const DIRT_BR = 146;
const DIRT_BM = 160;
const DIRT_BL = 174;
const DIRT_TR = 176;
const DIRT_TM = 190;
const DIRT_TL = 9;
const DIRT_RM = 161;
const DIRT_LM = 189;