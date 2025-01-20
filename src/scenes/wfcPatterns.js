class WfcPatterns extends Phaser.Scene
{
	constructor() {
		super("wfcPatternsScene");
	}

	preload() {
		this.load.setPath("./assets/");
		this.load.image("tilemap_tiles", "tilemap_packed.png");						// packed tilemap
		this.load.tilemapTiledJSON("three-farmhouses", "three-farmhouses.tmj");		// tilemap in JSON

		this.load.image("map pack", "mapPack_spritesheet.png");
	}

	create()
	{
		const ip = new ImageProcessor();
		ip.process(INPUT1, 2);
		console.log(ip);

		// Parameters
		const input = INPUT1;
		const N = 2;
	
		// logic
		const patterns = this.processImage(input, N)
		console.log(patterns);

		// input image preview
		const map = this.make.tilemap({
			data: input,
			tileWidth: TILE_WIDTH,
			tileHeight: TILE_WIDTH
		});
		const tileset = map.addTilesetImage("map pack");
		const layer = map.createLayer(0, tileset, 0, 0);

		// patterns and adjacencies preview
		let patternMap = null;
		let adjacenciesMap = null;
		let patternIndex = -1;
		this.debugKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);
		this.debugKey.on("down", (key, event) => {
			if (patternIndex+1 > patterns.length-1) {
				console.log("no more patterns to see");
				return;
			}
			patternIndex++;
			if (patternMap) {
				patternMap.destroy();
			}
			if (adjacenciesMap) {
				adjacenciesMap.destroy();
			}
			patternMap = this.make.tilemap({
				data: patterns[patternIndex].tiles,
				tileWidth: TILE_WIDTH,
				tileHeight: TILE_WIDTH
			});
			const patternLayer = patternMap.createLayer(0, tileset, TILE_WIDTH*(input[0].length+1), 0);
			const adjacenciesData = [];
			for (let i = 0; i < 4*N + 3; i++) {
				adjacenciesData[i] = [];
			}
			patterns[patternIndex].adjacencies.forEach(adjacency => {
				switch (adjacency.direction) {
					case UP:
						for (let i = 0; i < N; i++) {
							adjacenciesData[i].push(BLANK);
							for (let j = 0; j < N; j++) {
								adjacenciesData[i].push(patterns[adjacency.index].tiles[i][j]);
							}
						}
						break;
					case DOWN:
						for (let i = 0; i < N; i++) {
							adjacenciesData[i+N+1].push(BLANK);
							for (let j = 0; j < N; j++) {
								adjacenciesData[i+N+1].push(patterns[adjacency.index].tiles[i][j]);
							}
						}
						break;
					case LEFT:
						for (let i = 0; i < N; i++) {
							adjacenciesData[i+2*(N+1)].push(BLANK);
							for (let j = 0; j < N; j++) {
								adjacenciesData[i+2*(N+1)].push(patterns[adjacency.index].tiles[i][j]);
							}
						}
						break;
					case RIGHT:
						for (let i = 0; i < N; i++) {
							adjacenciesData[i+3*(N+1)].push(BLANK);
							for (let j = 0; j < N; j++) {
								adjacenciesData[i+3*(N+1)].push(patterns[adjacency.index].tiles[i][j]);
							}
						}
						break;
					default:
						throw new Error("Default switch case occurred.");
						break;
				}
			});
			adjacenciesMap = this.make.tilemap({
				data: adjacenciesData,
				tileWidth: TILE_WIDTH,
				tileHeight: TILE_WIDTH
			});
			const adjacenciesLayer = adjacenciesMap.createLayer(0, tileset, TILE_WIDTH*(input[0].length+1) + TILE_WIDTH*N, 0);
		});
	}

	/**
	 * Not periodic, not rotated
	 * @param {number[][]} image
	 * @param {number} N
	 * @returns {void}
	 */
	processImage(image, N)
	{
		this.validateInput(image, N);

		let patterns = createEmptyPatterns();
		getTiles(patterns);
		patterns = getWeights(patterns);	// getWeights() returns a new array without duplicate patterns so we need to reassign
		getAdjacencies(patterns);
		return patterns;

		/**
		 * Creates an array of empty pattern objects. The amount of patterns created is the same as the amount of tiles in the input image.
		 * @returns {{}[]} an array of pattern objects
		 */
		function createEmptyPatterns()
		{
			const patterns = [];
			for (let i = 0; i < image.length * image[0].length; i++) {
				patterns[i] = {
					tiles: [],
					adjacencies: [],
					weight: 1
				};
			}
			return patterns;
		}

		/**
		 * Populates the tiles attribute for each pattern in patterns.
		 * @param {{}[]} patterns  an array of pattern objects
		 */
		function getTiles(patterns)
		{
			// Loop over each tile in the input image because a pattern corresponds to each
			for (let y = 0; y < image.length; y++) {
				for (let x = 0; x < image[0].length; x++) {
					// Loop over each tile in the corresponding pattern
					// ny and nx refer to the 1st and 2nd N in NxN
					const tiles = [];
					for (let ny = 0; ny < N; ny++) {
						tiles[ny] = [];
						for (let nx = 0; nx < N; nx++) {
							// using modulo to loop around an array in order to avoid going out of bounds
							// relearned this pattern from https://banjocode.com/post/javascript/iterate-array-with-modulo
							tiles[ny][nx] = image[(y + ny) % image.length][(x + nx) % image[0].length];
						}
					}
					patterns[y * image[0].length + x].tiles = tiles;	// we're converting from 2D array position (y, x) to 1D array position (i) here
				}
			}
		}

		/**
		 * Checks if two patterns have the same tiles.
		 * @param {{}} pattern1 a pattern object
		 * @param {{}} pattern2 a pattern object
		 * @returns {boolean} true if the two patterns have the same tiles, and false if not
		 */
		function patternsHaveSameTiles(pattern1, pattern2)
		{
			return pattern1.tiles.every((row, y) => row.every((tile, x) => tile == pattern2.tiles[y][x]));
		}

		/**
		 * Populates the weight attribute for each unique pattern in patterns and removes their duplicates.
		 * @param {{}} patterns an array of pattern objects
		 * @returns {{}[]} an array of pattern objects
		 */
		function getWeights(patterns)
		{
			const uniquePatterns = [patterns[0]];
			for (let i = 1; i < patterns.length; i++) {
				const index = uniquePatterns.findIndex(uniquePattern => patternsHaveSameTiles(patterns[i], uniquePattern));
				if (index == -1) {
					uniquePatterns.push(patterns[i]);
				}
				else {
					uniquePatterns[index].weight++;
				}
			}
			return uniquePatterns;
		}

		/**
		 * Populates the adjacencies attribute for each pattern in patterns.
		 * @param {{}[]}} an array of pattern objects
		 */
		function getAdjacencies(patterns)
		{
			// Loop over each pattern
			for (let i = 0; i < patterns.length; i++) {
				// For each pattern, loop over each other pattern (patterns cannot be adjacent to themselves)
				for (let j = 0; j < patterns.length; j++) {
					if (i == j) {
						continue;
					}
					else {
						// For each other pattern, loop over each direction, checking for adjacency
						DIRECTIONS.forEach(dir => {
							if (isAdjacent(patterns[i], patterns[j], dir)) {
								patterns[i].adjacencies.push({
									index: j,
									direction: dir
								});
							}
						});
					}
				}
			}

			/**
			 * Checks if pattern2 is adjacent to pattern1 in a direction.
			 * @param {{}} pattern1 a pattern object
			 * @param {{}} pattern2 a pattern object
			 * @param {[number, number]} direction a 2D vector
			 * @returns {boolean} true if pattern2 is adjacent to pattern1 in the direction, and false if not
			 */
			function isAdjacent(pattern1, pattern2, direction)
			{
				switch (direction) {
					case UP:
						// Compare the overlap between everything but the bottom row of pattern1 with everything but the top row of pattern2
						for (let y = 0; y < N-1; y++) {
							for (let x = 0; x < N; x++) {
								if (pattern1.tiles[y][x] != pattern2.tiles[y+1][x]) {
									return false;
								}
							}
						}
						break;
					case DOWN:
						// Compare the overlap between everything but the top row of pattern1 with everything but the bottom row of pattern2
						for (let y = 1; y < N; y++) {
							for (let x = 0; x < N; x++) {
								if (pattern1.tiles[y][x] != pattern2.tiles[y-1][x]) {
									return false;
								}
							}
						}
						break;
					case LEFT:
						// Compare the overlap between everything but the right column of pattern1 with everything but the left column of pattern2
						for (let y = 0; y < N; y++) {
							for (let x = 0; x < N-1; x++) {
								if (pattern1.tiles[y][x] != pattern2.tiles[y][x+1]) {
									return false;
								}
							}
						}
						break;
					case RIGHT:
						// Compare the overlap between everything but left column of pattern1 with everything but the right column of pattern2
						for (let y = 0; y < N; y++) {
							for (let x = 1; x < N; x++) {
								if (pattern1.tiles[y][x] != pattern2.tiles[y][x-1]) {
									return false;
								}
							}
						}
						break;
					default:
						throw new Error("Default switch case occurred.");					
				}

				// If we're here then the overlap was the same meaning the two patterns are adjacent, so return true
				return true;
			}
		}
	}

	/**
	 * @param {number[][]} image 
	 * @param {number} N 
	 */
	validateInput(image, N)
	{
		if (image.length < 1) {
			throw new Error("Image height is less than 1.");
		}
		if (image[0].length < 1) {
			throw new Error("Image width is less than 1.");
		}
		if (N < 2) {
			throw new Error("N is less than 2.");
		}
		if (N > image.length) {
			throw new Error("N is greater than image height.");
		}
		if (N > image[0].length) {
			throw new Error("N is greater than image width.");
		}
	}
}