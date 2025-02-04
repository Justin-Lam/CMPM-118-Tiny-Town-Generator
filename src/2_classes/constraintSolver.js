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
		let numAttempts = 1;

		while (numAttempts <= this.maxAttempts) {	// use <= so this.maxAttempts can be 1
			const [y, x] = this.getLeastEntropyUnsolvedCellPosition(waveMatrix, weights);
			if (y === -1 && x === -1) {
				console.log("solved!");
				this.output = this.waveMatrixToImage(waveMatrix, patterns);
				break;
			}

			this.observe(waveMatrix, y, x, weights);

			const contradictionCreated = this.propagate(waveMatrix, y, x, adjacencies);
			if (contradictionCreated) {
				console.log("restarting");
				waveMatrix = this.createWaveMatrix(patterns.length, outputWidth, outputHeight);
				numAttempts++;
			}
		}

		if (numAttempts > this.maxAttempts) {
			console.log("max attempts reached");
			return false;
		}
		else {
			console.log("took " + numAttempts + " attempt(s)");
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
		for (let y = 0; y < outputHeight; y++) {
			waveMatrix[y] = [];
		}
		const possiblePatterns = [];
		for (let i = 0; i < numPatterns; i++) {
			possiblePatterns.push(i);
		}

		for (let y = 0; y < outputHeight; y++) {
			for (let x = 0; x < outputWidth; x++) {
				waveMatrix[y][x] = possiblePatterns.slice();	// make a copy
			}
		}
		return waveMatrix;
	}

	/**
	 * Get the position of the cell with the least entropy that's not 0. If all cells are solved, returns [-1, -1].
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

				const entropy = this.getShannonEntropy(waveMatrix[y][x], weights);
				if (isNaN(entropy)) {
					throw new Error("Contradiction found while searching for least entropy cell position");
				}
				else if (entropy < leastEntropy && entropy > 0) {
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
			return leastEntropyCellPositions[Math.floor(Math.random() * len)];	// random element (cell position)
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
	getShannonEntropy(possiblePatterns, weights) {
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
		const possiblePatternWeights = [];	// parallel with possiblePatterns
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
			console.log("dequeing");
			const [y1, x1] = queue.shift();
			const cell1_PossiblePatterns = waveMatrix[y1][x1];

			for (let k = 0; k < DIRECTIONS.length; k++) {	// using k because k is associated with iterating over DIRECTIONS in the ImageProcessor class
				/*
					Given cell1 which is at (y1, x1) and is adjacent to cell2 which is at (y2, x2)
					Use the adjacency data of cell1's possible patterns to build a new set of all possible patterns cell2 can be
					Compare the new set for cell2 against cell2's current set of possible patterns
					Get a final new set that's the intersection of the two (set of possible patterns that are both in the new and current one)

					If the final new set is the same size as the current set: there were no changes - do nothing
					If the final new set is empty: there are no possible patterns cell2 can be - return contradiction
					If the final new set is smaller than the current set: there were changes - add cell2 to the queue to be propagated
				*/
				const dir = DIRECTIONS[k];
				const dy = -dir[0];	// need to reverse direction or else output will be upside down
				const dx = -dir[1];	// need to reverse direction or else output will be upside down
				const y2 = y1+dy;
				const x2 = x1+dx;

				// Don't go out of bounds
				if (y2 < 0 || y2 > waveMatrix.length-1) {
					continue;
				}
				if (x2 < 0 || x2 > waveMatrix[0].length-1) {
					continue;
				}

				const cell2_PossiblePatterns = new Set(waveMatrix[y1+dy][x1+dx]);

				const cell2_NewPossiblePatterns = new Set();
				for (const patternIndex of cell1_PossiblePatterns) {
					const adjacentPatterns = adjacencies[patternIndex][k];
					for (const patternIndex of adjacentPatterns) {
						cell2_NewPossiblePatterns.add(patternIndex);
					}
				}

				const cell2_FinalNewPossiblePatterns = cell2_PossiblePatterns.intersection(cell2_NewPossiblePatterns);

				if (cell2_FinalNewPossiblePatterns.size === 0) {
					contraditionCreated = true;
					break;
				}
				else if (cell2_FinalNewPossiblePatterns.size < cell2_PossiblePatterns.size) {
					waveMatrix[y2][x2] = Array.from(cell2_FinalNewPossiblePatterns);
					queue.push([y2, x2]);
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
		const image = [];
		for (let y = 0; y < waveMatrix.length; y++) {
			image[y] = [];
			for (let x = 0; x < waveMatrix[0].length; x++) {
				const patternIndex = waveMatrix[y][x][0];
				const tileID = patterns[patternIndex][0][0];
				image[y][x] = tileID;
			}
		}
		return image;
	}
}