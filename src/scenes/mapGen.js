class MapGen extends Phaser.Scene
{
	constructor() {
		super("mapGenScene");
	}

	preload()
	{
		this.load.path = './assets/';
		this.load.image("map pack", "mapPack_spritesheet.png");
	}

	create()
	{
		const inputImageMatrix = [
			[110, 40, 110, 110, 110, 110, 56, 56, 56, 56],
			[110, 40, 110, 56, 56, 56, 56, 56, 56, 56],
			[110, 40, 110, 110, 56, 56, 56, 56, 56, 56],
			[40, 40, 40, 110, 56, 56, 56, 56, 56, 56],
			[40, 40, 40, 110, 56, 56, 56, 56, 56, 56],
			[40, 40, 110, 56, 56, 56, 56, 56, 56, 56],
			[40, 40, 110, 56, 56, 110, 56, 56, 56, 56],
			[110, 110, 110, 110, 56, 56, 56, 56, 56, 56],
			[56, 110, 40, 110, 56, 56, 56, 56, 56, 56],
			[56, 110, 40, 110, 56, 56, 56, 56, 56, 56]
		];
		const N = 2;

		this.debugKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
		this.debugKey.on("down", (key, event) => {
			this.scene.restart();
		});

		this.generateMap(inputImageMatrix, N);
	}

	generateMap(inputImageMatrix, patternWidth)
	{
		const patterns = this.getPatterns(inputImageMatrix, patternWidth);
		const waveMatrix = this.getWaveMatrix(patterns);
		this.display(waveMatrix, patterns);
		this.addDecor(this.outputData);
	}
	
	/**
	 * Processes the input image to get its patterns.
	 * @param {number[][]} inputImageMatrix the data representation of the input image as a 2D array of tile IDs
	 * @param {number} patternWidth N (as in NxN)
	 * @returns {{ tiles: number[][], adjacencies: [{ index: number, direction: [number, number] }], weight: number }[]} an array of patterns
	 */
	getPatterns(inputImageMatrix, patternWidth)
	{
		ensureValidInput();
		let patterns = createEmptyPatterns();
		getTiles(patterns);
		patterns = getWeights(patterns);	// getWeights() returns a new array without duplicate patterns so we need to reassign
		getAdjacencies(patterns);
		return patterns;


		/** Ensures that the input to getPatterns() is valid. */
		function ensureValidInput()
		{
			if (inputImageMatrix.length < 1) {
				throw new Error("Input image height is less than 1.");
			}
			if (inputImageMatrix[0].length < 1) {
				throw new Error("Input image width is less than 1.");
			}
			if (patternWidth < 2) {
				throw new Error("Pattern width is less than 2.");
			}
			if (patternWidth > inputImageMatrix.length) {
				throw new Error("Pattern width exceeds input image height.");
			}
			if (patternWidth > inputImageMatrix[0].length) {
				throw new Error("Pattern width exceeds input image width.");
			}
		}

		/**
		 * Creates an array of empty pattern objects. The amount of patterns created is the same as the amount of tiles in the input image.
		 * @returns {{}[]} an array of pattern objects
		 */
		function createEmptyPatterns()
		{
			const patterns = [];
			for (let i = 0; i < inputImageMatrix.length * inputImageMatrix[0].length; i++) {
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
			for (let y = 0; y < inputImageMatrix.length; y++) {
				for (let x = 0; x < inputImageMatrix[0].length; x++) {
					// Loop over each tile in the corresponding pattern
					// ny and nx refer to the 1st and 2nd N in NxN
					const tiles = [];
					for (let ny = 0; ny < patternWidth; ny++) {
						tiles[ny] = [];
						for (let nx = 0; nx < patternWidth; nx++) {
							// using modulo to loop around an array in order to avoid going out of bounds
							// relearned this pattern from https://banjocode.com/post/javascript/iterate-array-with-modulo
							tiles[ny][nx] = inputImageMatrix[(y + ny) % inputImageMatrix.length][(x + nx) % inputImageMatrix[0].length];
						}
					}
					patterns[y * inputImageMatrix[0].length + x].tiles = tiles;	// we're converting from 2D array position (y, x) to 1D array position (i) here
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
						for (let y = 0; y < patternWidth-1; y++) {
							for (let x = 0; x < patternWidth; x++) {
								if (pattern1.tiles[y][x] != pattern2.tiles[y+1][x]) {
									return false;
								}
							}
						}
						break;
					case DOWN:
						// Compare the overlap between everything but the top row of pattern1 with everything but the bottom row of pattern2
						for (let y = 1; y < patternWidth; y++) {
							for (let x = 0; x < patternWidth; x++) {
								if (pattern1.tiles[y][x] != pattern2.tiles[y-1][x]) {
									return false;
								}
							}
						}
						break;
					case LEFT:
						// Compare the overlap between everything but the right column of pattern1 with everything but the left column of pattern2
						for (let y = 0; y < patternWidth; y++) {
							for (let x = 0; x < patternWidth-1; x++) {
								if (pattern1.tiles[y][x] != pattern2.tiles[y][x+1]) {
									return false;
								}
							}
						}
						break;
					case RIGHT:
						// Compare the overlap between everything but left column of pattern1 with everything but the right column of pattern2
						for (let y = 0; y < patternWidth; y++) {
							for (let x = 1; x < patternWidth; x++) {
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
	 * Uses the patterns to create, solve, and return a wave matrix.
	 * @param {{}[]} patterns an array of pattern objects
	 * @returns {{ patternPossibilities: number[], y: number, x: number }[][]} a 2D array of cell objects
	 */
	getWaveMatrix(patterns)
	{
		const waveMatrix = createInitialWaveMatrix();
		solveWaveMatrix(waveMatrix);
		return waveMatrix;


		/**
		 * Creates a 2D array of initialized cell objects.
		 * The 2D array has the same dimensions as the output image.
		 * Initialized cell objects have their patternPossibilities all set to true.
		 * @returns {{}[][]} a 2D array of cell objects
		 */
		function createInitialWaveMatrix()
		{
			const waveMatrix = [];
			for (let y = 0; y < OUTPUT_MAP_HEIGHT; y++) {
				waveMatrix[y] = [];
				for (let x = 0; x < OUTPUT_MAP_WIDTH; x++) {
					const cell = {
						patternPossibilities: [],
						y: y,
						x: x
					};
					for (let i = 0; i < patterns.length; i++) {
						cell.patternPossibilities[i] = true;
					}
					waveMatrix[y][x] = cell;
				}
			}
			return waveMatrix;
		}

		function solveWaveMatrix(waveMatrix)
		{
			let numTries = 0;
			while (numTries < MAX_ATTEMPTS) {
				let cell = getLeastEntropyUnsolvedCell();
				observe(cell);
				propagate(cell);
				const state = getState();
				if (state == "Contradiction") {
					numTries++;
					waveMatrix = createInitialWaveMatrix();
				}
				else if (state == "Solved") {
					return;
				}
				// else state must be unsolved so go again
			}

			function getLeastEntropyUnsolvedCell()
			{
				let leastEntropy = Number.MAX_SAFE_INTEGER;
				let leastEntropyCell = waveMatrix[0][0];
				for (let y = 0; y < waveMatrix.length; y++) {
					for (let x = 0; x < waveMatrix[0].length; x++) {
						const cell = waveMatrix[y][x];
						const entropy = getEntropy(cell);
						if (entropy < leastEntropy && entropy != 0) {
							leastEntropy = entropy;
							leastEntropyCell = cell;
						}
					}
				}
				return leastEntropyCell;


				// Shannon Entropy
				function getEntropy(cell)
				{
					let sumOfWeights = 0;
					let sumOfWeightLogWeights = 0;
					for (let i = 0; i < cell.patternPossibilities.length; i++) {
						if (cell.patternPossibilities[i]) {
							sumOfWeights += patterns[i].weight;
							sumOfWeightLogWeights += patterns[i].weight * Math.log(patterns[i].weight);
						}
					}
					return Math.log(sumOfWeights) - (sumOfWeightLogWeights / sumOfWeights);
				}
			}

			function observe(cell)
			{
				const chosenPatternIndex = getChosenPatternIndex();
				setOtherIndicesFalse(cell, chosenPatternIndex);
				

				function getChosenPatternIndex()
				{
					// Get an array of all the possible pattern indices (pattern is true)
					const possiblePatternIndices = [];
					for (let i = 0; i < cell.patternPossibilities.length; i++) {
						if (cell.patternPossibilities[i]) {
							possiblePatternIndices.push(i);
						}
					}
	
					// Get the total weight of the possible patterns
					let totalWeightOfPossiblePatterns = 0;
					possiblePatternIndices.forEach(index => {
						totalWeightOfPossiblePatterns += patterns[index].weight;
					});			
					
					// Generate a random number that's within the range of the total weight of the possible patterns
					const randomNum = Math.ceil(Math.random() * totalWeightOfPossiblePatterns);
					
					// Get the chosen pattern index using the random number
					let cursor = 0;
					for (let i = 0; i < possiblePatternIndices.length; i++) {
						cursor += patterns[possiblePatternIndices[i]].weight;
						if (cursor >= randomNum) {
							return possiblePatternIndices[i];
						}
					}
				}
			}
			
			function setOtherIndicesFalse(cell, index)
			{
				for (let i = 0; i < cell.patternPossibilities.length; i++) {
					if (i == index) {
						continue;
					}
					cell.patternPossibilities[i] = false;
				}
			}

			function propagate(cell)
			{
				// Create the stack of cells to be propagated
				const stack = [cell];

				// Propagate all the cells in the stack
				while (stack.length > 0) {
					// Get the cell to propagate
					const cell = stack.pop();

					// Get an array of all the possible pattern indices (pattern is true)
					const possiblePatternIndices = [];
					for (let i = 0; i < cell.patternPossibilities.length; i++) {
						if (cell.patternPossibilities[i]) {
							possiblePatternIndices.push(i);
						}
					}
	
					// For each adjacent cell to the cell being propagated, adjust their pattern possibilities
					DIRECTIONS.forEach(direction => {
						
						// Don't go out of bounds of the wave matrix
						if (cell.y + direction[1] < 0 || cell.y + direction[1] > waveMatrix.length-1) {
							return;
						}
						if (cell.x + direction[0] < 0 || cell.x + direction[0] > waveMatrix[0].length-1) {
							return;
						}
						
						// Get the adjacent cell
						const adjCell = waveMatrix[cell.y + direction[1]][cell.x + direction[0]];


						// Adjust the adjacent cell's pattern possibilities
						// using the cell being propagated's adjacencies and the direction that the adjacent cell is from the cell being propagated
						// Loop over the adjacent cell's pattern possibilities, finding the ones that are possible (true)
						let wasAdjusted = false;
						for (let i = 0; i < adjCell.patternPossibilities.length; i++) {
							if (adjCell.patternPossibilities[i]) {

								// Assume this possible pattern for the adjacent cell isn't adjacent to any of the possible patterns for the cell being propagated
								// we will be looking for proof of any adjacencies
								let isAdjacent = false;

								// Look through the possible pattern indices of the cell being propagated
								possiblePatternIndices.forEach(index => {

									// For each possible pattern, look through the adjacencies
									patterns[index].adjacencies.forEach(adjacency => {

										// This possible pattern for the adjacent cell is adjacent to this possible pattern for the cell being propagated
										// if their indices and direction are the same
										if (adjacency.index == i && adjacency.direction == direction) {
											isAdjacent = true;
										}
									});
								});

								// Adjust the adjacent cell's pattern possibility if it's no longer possible
								if (!isAdjacent) {
									adjCell.patternPossibilities[i] = false;
									wasAdjusted = true;
								}
							}
						}
						if (wasAdjusted) {
							stack.push(adjCell);
						}
					});
				}
			}

			function getState()
			{
				for (let y = 0; y < waveMatrix.length; y++) {
					for (let x = 0; x < waveMatrix[0].length; x++) {
						const cell = waveMatrix[y][x];
						let numTrues = 0;
						for (let i = 0; i < cell.patternPossibilities.length; i++) {
							if (cell.patternPossibilities[i]) {
								numTrues++;
							}
						}
						if (numTrues == 0) {
							return "Contradiction";
						}
						else if (numTrues > 1) {
							return "Unsolved";
						}
					}
				}
				return "Solved";
			}
		}
	}

	display(waveMatrix, patterns)
	{
		if (!waveMatrix) {
			return;
		}

		this.outputData = [];
		for (let y = 0; y < waveMatrix.length; y++) {
			this.outputData[y] = [];
			for (let x = 0; x < waveMatrix[0].length; x++) {
				let firstValidPatternID = 0;
				for (let i = 0; i < waveMatrix[y][x].patternPossibilities.length; i++) {
					if (waveMatrix[y][x].patternPossibilities[i]) {
						firstValidPatternID = i;
						break;
					}
				}
				this.outputData[y][x] = patterns[firstValidPatternID].tiles[0][0];
			}
		}
		this.createBG(this.outputData);
		this.addTransitions(this.outputData);
		if (this.map) {
			this.map.destroy();
		}
		this.map = this.make.tilemap({
			data: this.outputData,
			tileWidth: TILE_WIDTH,
			tileHeight: TILE_WIDTH
		});
		const tileset = this.map.addTilesetImage("map pack");
		const layer = this.map.createLayer(0, tileset, 0, 0);
	}

	createBG(mapArray){
		let waterArray = Array.from({ length: mapArray.length }, () => Array(mapArray.length).fill(0));
        for (var x = 0; x < mapArray.length; x++) {
            for (var y = 0; y < mapArray[x].length; y++) {
                waterArray[x][y] = WATER;
            }
        }
        const water = this.make.tilemap({
            data: waterArray,
            tileWidth: TILE_WIDTH,
            tileHeight: TILE_WIDTH
        })
        const water_tilesheet = water.addTilesetImage("map pack")
        const water_layer = water.createLayer(0, water_tilesheet, 0, 0);
	}

	addDecor(mapArray){
		let grassTiles = [GRASS_C, GRASS_BR, GRASS_BM, GRASS_BL, GRASS_TR, GRASS_TM, GRASS_TL, GRASS_RM, GRASS_LM];
		let badTiles = [WATER, SAND_BL, SAND_BM, SAND_BR];
        let decorArray = Array.from({ length: mapArray.length }, () => Array(mapArray.length).fill(0));
        for (var x = 0; x < mapArray.length; x++) {
            for (var y = 0; y < mapArray[x].length; y++) {
                if (!badTiles.includes(mapArray[x][y]) && Phaser.Math.FloatBetween(0, 100) < 10){
                    decorArray[x][y] = 62; //mushrooms
                }
				else if (grassTiles.includes(mapArray[x][y]) && Phaser.Math.FloatBetween(0, 100) < 55) {
					decorArray[x][y] = 177; //tiny grass
				}
                else{
                    decorArray[x][y] = 195; //transparent
                }
            }
        }
        const decor = this.make.tilemap({
            data: decorArray,
            tileWidth: TILE_WIDTH,
            tileHeight: TILE_WIDTH
        })
        const decor_tilesheet = decor.addTilesetImage("map pack")
        const decor_layer = decor.createLayer(0, decor_tilesheet, 0, 0);
    }

	addTransitions(mapArray){
		let sandTiles = [SAND_BR, SAND_BM, SAND_BL];
        //TRANSITION TILES
        for (var x = 0; x < mapArray.length; x++) {
            for (var y = 0; y < mapArray[x].length; y++) {
				// GRASS
				// if sand tile has water tile underneath
                if (x < mapArray.length - 1){
                    if (mapArray[x][y] == GRASS_C && mapArray[x+1][y] == WATER){
                        mapArray[x][y] = GRASS_BM;
                    }
                }
                // if sand tile has water tile above
                if (x > 0){
                    if (mapArray[x][y] == GRASS_C && mapArray[x-1][y] == WATER){
                        mapArray[x][y] = GRASS_TM;
                    }
                }
                // if sand tile has water tile to the right
                if (y < mapArray[x].length - 1){
                    if (mapArray[x][y] == GRASS_C && mapArray[x][y+1] == WATER){
                        mapArray[x][y] = GRASS_RM;
                    }
                }
                // if sand tile has water tile to the left
                if (y > 0){
                    if (mapArray[x][y] == GRASS_C && mapArray[x][y-1] == WATER){
                        mapArray[x][y] = GRASS_LM;
                    }
                }
				//SAND
				// if sand tile has water tile underneath
                if (x < mapArray.length - 1){
                    if (mapArray[x][y] == SAND_C && mapArray[x+1][y] == WATER){
                        mapArray[x][y] = SAND_BM;
                    }
                }
                // if sand tile has water tile above
                if (x > 0){
                    if (mapArray[x][y] == SAND_C && mapArray[x-1][y] == WATER){
                        mapArray[x][y] = SAND_TM;
                    }
                }
                // if sand tile has water tile to the right
                if (y < mapArray[x].length - 1){
                    if (mapArray[x][y] == SAND_C && mapArray[x][y+1] == WATER){
                        mapArray[x][y] = SAND_RM;
                    }
                }
                // if sand tile has water tile to the left
                if (y > 0){
                    if (mapArray[x][y] == SAND_C && mapArray[x][y-1] == WATER){
                        mapArray[x][y] = SAND_LM;
                    }
                }
            }
        }
		// CORNER TILES
        for (var x = 0; x < mapArray.length; x++) {
            for (var y = 0; y < mapArray[x].length; y++) {
				// GRASS
                // bottom left corner
                if (x < mapArray.length - 1 && y > 0){
                    if (mapArray[x][y] == GRASS_BM && mapArray[x][y-1] == WATER && mapArray[x+1][y] == WATER){
                        mapArray[x][y] = GRASS_BL;
                    }
                }
                // bottom right corner
                if (x < mapArray.length - 1 && y < mapArray[x].length - 1){
                    if (mapArray[x][y] == GRASS_BM && mapArray[x][y+1] == WATER && mapArray[x+1][y] == WATER){
                        mapArray[x][y] = GRASS_BR;
                    }
                }
                // top left corner
                if (x > 0 && y > 0){
                    if (mapArray[x][y] == GRASS_TM && mapArray[x][y-1] == WATER && mapArray[x-1][y] == WATER){
                        mapArray[x][y] = GRASS_TL;
                    }
                }
                // top right corner
                if (x > 0 && y < mapArray[x].length - 1){
                    if (mapArray[x][y] == GRASS_TM && mapArray[x][y+1] == WATER && mapArray[x-1][y] == WATER){
                        mapArray[x][y] = GRASS_TR;
                    }
                }
				// SAND
                // bottom left corner
                if (x < mapArray.length - 1 && y > 0){
                    if (mapArray[x][y] == SAND_BM && mapArray[x][y-1] == WATER && mapArray[x+1][y] == WATER){
                        mapArray[x][y] = SAND_BL;
                    }
                }
                // bottom right corner
                if (x < mapArray.length - 1 && y < mapArray[x].length - 1){
                    if (mapArray[x][y] == SAND_BM && mapArray[x][y+1] == WATER && mapArray[x+1][y] == WATER){
                        mapArray[x][y] = SAND_BR;
                    }
                }
                // top left corner
                if (x > 0 && y > 0){
                    if (mapArray[x][y] == SAND_TM && mapArray[x][y-1] == WATER && mapArray[x-1][y] == WATER){
                        mapArray[x][y] = SAND_TL;
                    }
                }
                // top right corner
                if (x > 0 && y < mapArray[x].length - 1){
                    if (mapArray[x][y] == SAND_TM && mapArray[x][y+1] == WATER && mapArray[x-1][y] == WATER){
                        mapArray[x][y] = SAND_TR;
                    }
                }
            }
        }
	}
}