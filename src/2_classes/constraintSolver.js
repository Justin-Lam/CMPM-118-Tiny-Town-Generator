class ConstraintSolver {
	/**
	 * The output image as a 2D matrix of tile IDs.
	 * @type {number[][]}
	 */
	output;
	
	// Parameter
	maxAttempts = 10;

	/**
	 * Attempts to populate this.output.
	 * @param {number[][][]} patterns
	 * @param {number[]} weights 
	 * @param {number[][][]} adjacencies 
	 * @param {number} outputWidth
	 * @param {number} outputHeight
	 * @returns {boolean} whether the constraint solver was successful or not
	 */
	solve(patterns, weights, adjacencies, outputWidth, outputHeight) {
		console.log("STARTING");

		let waveMatrix = this.createWaveMatrix(patterns.length, outputWidth, outputHeight);
		let attempts = 1;

		while (attempts <= this.maxAttempts) {	// use <= so this.maxAttempts can be 1
			const [y, x] = this.getLeastEntropyUnsolvedCellPosition(waveMatrix, weights);
			if (y === -1 && x === -1) {
				this.output = this.waveMatrixToImage(waveMatrix, patterns);
				console.log("solved!");
				break;
			}

			this.observe(waveMatrix, y, x, weights);

			const contradictionCreated = this.propagate(waveMatrix, y, x, adjacencies);
			if (contradictionCreated) {
				console.log("restarting");
				waveMatrix = this.createWaveMatrix(patterns.length, outputWidth, outputHeight);
				attempts++;
			}
		}

		if (attempts > this.maxAttempts) {
			console.log("max attempts reached");
			return false;
		}
		else {
			console.log("took " + attempts + " attempt(s)");
			return true;
		}
	}

	/**
	 * Creates a 2D matrix of cells whose possible patterns are initialized to every pattern.
	 * @description Because the only data a cell contains is an array of its possible patterns, the wave matrix is actually just a matrix of those arrays.
	 * @param {number} numPatterns 
	 * @param {number} outputWidth
	 * @param {number} outputHeight
	 * @returns {number[][][]} 2D matrix of cells (number arrays)
	 */
	createWaveMatrix(numPatterns, outputWidth, outputHeight) {
		const waveMatrix = [];
		const possiblePatterns = [];
		for (let i = 0; i < numPatterns; i++) {
			possiblePatterns.push(i);
		}

		for (let y = 0; y < outputHeight; y++) {
			waveMatrix[y] = [];
			for (let x = 0; x < outputWidth; x++) {
				waveMatrix[y][x] = possiblePatterns.slice();	// make a copy
			}
		}
		return waveMatrix;
	}

	/**
	 * Get the position of the cell with the least Shannon Entropy but whose entropy is not 0. If all cells are solved, returns [-1, -1].
	 * @param {number[][][]} waveMatrix
	 * @param {number[]} weights
	 * @returns {number[]} [y, x] if there's an unsolved cell or [-1, -1] if there aren't any
	 */
	getLeastEntropyUnsolvedCellPosition(waveMatrix, weights) {
		/*
			Build an array containing the positions of all cells tied with the least entropy
			Return a random position from that array
		*/
		let leastEntropy = Infinity;
		let leastEntropyCellPositions = [];

		for (let y = 0; y < waveMatrix.length; y++) {
			for (let x = 0; x < waveMatrix[0].length; x++) {
				const possiblePatterns = waveMatrix[y][x];
				const entropy = this.getEntropy(possiblePatterns, weights);
				if (entropy < leastEntropy && entropy > 0) {
					leastEntropy = entropy;
					leastEntropyCellPositions = [[y, x]];
				}
				else if (entropy === leastEntropy) {
					leastEntropyCellPositions.push([y, x]);
				}
			}
		}

		const len = leastEntropyCellPositions.length;
		if (len > 0) {
			return leastEntropyCellPositions[Math.floor(Math.random() * len)];
		}
		else {
			return [-1, -1];
		}
	}

	/**
	 * Gets the Shannon Entropy of a cell using its possible patterns and those patterns' weights.
	 * @param {number[]} possiblePatterns 
	 * @param {number[]} weights 
	 * @returns {number} a number greater than 0 if possiblePatterns.length > 1, 0 if possiblePatterns.length is 1, and NaN if possiblePatterns.length is 0
	 */
	getEntropy(possiblePatterns, weights) {
		let sumOfWeights = 0;
		let sumOfWeightLogWeights = 0;
		for (const patternIndex of possiblePatterns) {
			const weight = weights[patternIndex];
			sumOfWeights += weight;
			sumOfWeightLogWeights += weight * Math.log(weight);
		}
		return Math.log(sumOfWeights) - sumOfWeightLogWeights/sumOfWeights;
	}

	/**
	 * Picks a pattern for a cell to become using weighted random.
	 * @param {number[][][]} waveMatrix
	 * @param {number} y 
	 * @param {number} x 
	 * @param {number[]} weights 
	 */
	observe(waveMatrix, y, x, weights) {
		// used https://dev.to/jacktt/understanding-the-weighted-random-algorithm-581p
		const possiblePatterns = waveMatrix[y][x];
		const possiblePatternWeights = [];
		let totalWeight = 0;
		for (const patternIndex of possiblePatterns) {
			const weight = weights[patternIndex];
			possiblePatternWeights.push(weight);
			totalWeight += weight;
		}

		const random = Math.random() * totalWeight;

		let cursor = 0;
		for (let i = 0; i < possiblePatternWeights.length; i++) {
			cursor += possiblePatternWeights[i];
			if (cursor >= random) {
				const chosenPattern = possiblePatterns[i];
				waveMatrix[y][x] = [chosenPattern];
				return;
			}
		}
		throw new Error("A pattern wasn't chosen within the for loop");
	}

	/**
	 * Adjusts all cells' possible patterns if they need to be adjusted due to the observation of a cell.
	 * @param {number[][][]} waveMatrix
	 * @param {number} y 
	 * @param {number} x
	 * @param {number[][][]} adjacencies
	 * @returns {boolean} whether a contradiction was created or not
	 */
	propagate(waveMatrix, y, x, adjacencies) {
		let contraditionCreated = false;
		const queue = [[y, x]];

		while (queue.length > 0) {
			const [y, x] = queue.shift();
			const cellPossiblePatterns = waveMatrix[y][x];
			console.log("shift");

			for (let k = 0; k < DIRECTIONS.length; k++) {	// using k because k is associated with iterating over DIRECTIONS in the ImageProcessor class
				/*
					Given cell1 which is at (y, x) and cell2 which is at (y+dy, x+dx)
					Build a set of all new possible patterns cell2 can be using the adjacency data of cell1's possible patterns
					Compare the new set for cell2 with cell2's current set of possible patterns
					Get a final new set that's the intersection of the two (set of possible patterns that are both in the new and current one)

					If the final new set is empty, there are no possible patterns cell2 can be - return contradiction
					If the final new set is the same size as the current set, there are no changes - do nothing
					If the final new set is smaller than the current set, there were changes - add cell2 to the queue
				*/
				const dir = DIRECTIONS[k];
				const dy = -dir[0];	// need to reverse direction or else output will be upside down
				const dx = -dir[1];	// need to reverse direction or else output will be upside down

				// Don't go out of bounds
				if (y+dy < 0 || y+dy > waveMatrix.length-1) {
					continue;
				}
				if (x+dx < 0 || x+dx > waveMatrix[0].length-1) {
					continue;
				}

				const cellAdjPatterns = new Set();
				for (const patternIndex of cellPossiblePatterns) {
					const adjPatterns = adjacencies[patternIndex][k];
					for (const patternIndex of adjPatterns) {
						cellAdjPatterns.add(patternIndex);
					}
				}

				const adjCellPossiblePatterns = new Set(waveMatrix[y+dy][x+dx]);
				const adjCellNewPossiblePatterns = cellAdjPatterns.intersection(adjCellPossiblePatterns);

				if (adjCellNewPossiblePatterns.size === 0) {
					contraditionCreated = true;
					break;
				}
				if (adjCellNewPossiblePatterns.size < adjCellPossiblePatterns.size) {
					waveMatrix[y+dy][x+dx] = Array.from(adjCellNewPossiblePatterns);
					queue.push([y+dy, x+dx]);
				}
			}
			if (contraditionCreated) {
				break;
			}
		}
		return contraditionCreated;
	}

	/** Build a 2D image matrix using the top left tile of each cell's pattern. */
	waveMatrixToImage(waveMatrix, patterns) {
		const result = [];
		for (let y = 0; y < waveMatrix.length; y++) {
			result[y] = [];
			for (let x = 0; x < waveMatrix[0].length; x++) {
				const i = waveMatrix[y][x][0];
				const tileID = patterns[i][0][0];
				result[y][x] = tileID;
			}
		}
		return result;
	}
}