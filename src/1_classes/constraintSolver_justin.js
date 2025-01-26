class ConstraintSolver_Justin {
	/**
	 * The output image as a 2D matrix of tile IDs.
	 * @type {number[][]}
	 */
	output;
	
	// Parameter
	maxAttempts = 100;

	/**
	 * 
	 * @param {number[][][]} patterns
	 * @param {number[]} weights 
	 * @param {number[][][]} adjacencies 
	 * @param {number} width output width
	 * @param {number} height output height
	 */
	solve(patterns, weights, adjacencies, width, height) {
		const waveMatrix = this.createWaveMatrix(patterns.length, width, height);

		const [y, x] = this.getLeastEntropyCellPosition(waveMatrix, weights);
		this.observe(waveMatrix, y, x, weights);
		this.propagate(waveMatrix, y, x, adjacencies);
	}

	/**
	 * 
	 * @param {number} numPatterns 
	 * @param {number} width output width
	 * @param {number} height output height
	 * @returns {number[][][]} 2D matrix of number arrays
	 */
	createWaveMatrix(numPatterns, width, height) {
		const waveMatrix = [];
		const possiblePatterns = [];
		for (let i = 0; i < numPatterns; i++) {
			possiblePatterns.push(i);
		}

		for (let y = 0; y < height; y++) {
			waveMatrix[y] = [];
			for (let x = 0; x < width; x++) {
				waveMatrix[y][x] = possiblePatterns.slice();	// make a copy
			}
		}
		return waveMatrix;
	}

	/**
	 * Uses Shannon Entropy
	 * @param {number[][][]} waveMatrix 2D matrix of number arrays
	 * @param {number[]} weights
	 * @returns {[y, x]}
	 */
	getLeastEntropyCellPosition(waveMatrix, weights) {
		/*
			Build an array containing the positions of all cells tied with the least entropy
			Return a random position from that array
		*/
		let leastEntropy = Infinity;
		let leastEntropyCells = [];

		for (let y = 0; y < waveMatrix.length; y++) {
			for (let x = 0; x < waveMatrix[0].length; x++) {
				const possiblePatterns = waveMatrix[y][x];
				const entropy = this.getEntropy(possiblePatterns, weights);
				if (entropy < leastEntropy) {
					leastEntropy = entropy;
					leastEntropyCells = [[y, x]];
				}
				else if (entropy === leastEntropy) {
					leastEntropyCells.push([y, x]);
				}
			}
		}

		const len = leastEntropyCells.length;
		return leastEntropyCells[Math.floor(Math.random() * len)];
	}

	/**
	 * Returns a num greater than 0 if pp.len > 0, 0 if pp.len is 1, NaN if pp.len is 0
	 * @param {number[]} possiblePatterns 
	 * @param {number[]} weights 
	 * @returns {number}
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
	 * 
	 * @param {number[][][]} waveMatrix 2D matrix of number arrays
	 * @param {number} y 
	 * @param {number} x 
	 * @param {number[]} weights 
	 */
	observe(waveMatrix, y, x, weights) {
		/*
			Pick a pattern for the cell to become via weighted random
			// used https://dev.to/jacktt/understanding-the-weighted-random-algorithm-581p
		*/
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
		throw new Error("Math did not check out");
	}

	propagate(waveMatrix, y, x, adjacencies) {
		const stack = [[y, x]];
		const visitedCells = [];
		for (let y = 0; y < waveMatrix.length; y++) {
			visitedCells[y] = [];
			for (let x = 0; x < waveMatrix[0].length; x++) {
				visitedCells[y][x] = false;
			}
		}

		while (stack.length > 0) {
			const [y, x] = stack.pop();	// this position is different from the one passed in as an argument
			if (visitedCells[y][x]) {
				continue;
			}
			const cellPossiblePatterns = waveMatrix[y][x];

			for (let k = 0; k < DIRECTIONS.length; k++) {	// using k because k is associated with iterating over DIRECTIONS in the ImageProcessor class
				const dir = DIRECTIONS[k];
				const dy = dir[0];
				const dx = dir[1];

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

				if (adjCellNewPossiblePatterns.size !== adjCellPossiblePatterns.size) {
					waveMatrix[y+dy][x+dx] = Array.from(adjCellNewPossiblePatterns);
					stack.push([y+dy, x+dx]);
				}

				visitedCells[y][x] = true;
			}
		}
	}
}