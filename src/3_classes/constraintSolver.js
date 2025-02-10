class ConstraintSolver {
	/**
	 * The output image as a 2D matrix of tile IDs.
	 * @type {number[][]}
	 */
	output;

	/**
	 * Attempts to populate this.output.
	 * @param {number[][][]} patterns
	 * @param {number[]} weights 
	 * @param {Uint32Array[][]} adjacencies
	 * @param {number} outputWidth
	 * @param {number} outputHeight
	 * @returns {boolean} whether the constraint solver was successful or not
	 */
	solve(patterns, weights, adjacencies, outputWidth, outputHeight, maxAttempts) {
		console.log("starting");

		let start = 0;
		let duration = 0;
		let createWaveMatrix_TotalDuration = 0;
		let createWaveMatrix_NumCalls = 0;
		let getLeastEntropyUnsolvedCellPosition_TotalDuration = 0;
		let getLeastEntropyUnsolvedCellPosition_NumCalls = 0;
		let observe_TotalDuration = 0;
		let observe_NumCalls = 0;
		let propagate_TotalDuration = 0;
		let propagate_NumCalls = 0;
		let waveMatrixToImage_TotalDuration = 0;
		let waveMatrixToImage_NumCalls = 0;

		start = performance.now();
		let waveMatrix = this.createWaveMatrix(patterns.length, outputWidth, outputHeight);
		duration = performance.now() - start;
		createWaveMatrix_TotalDuration += duration;
		createWaveMatrix_NumCalls++;
		let numAttempts = 1;

		/*
			Since the very first cell to observe and propagate will always be a random one
			We can just choose a random cell instead of using getLeastEntropyUnsolvedCellPosition() to get one
			This means we get to skip a getLeastEntropyUnsolvedCellPosition() call
			Which is nice because calling that function on an initialized wave matrix (every cell has all patterns possible) gives it worst case runtime
		*/
		let y = Math.floor(Math.random() * outputHeight);	// random in range [0, outputHeight-1]
		let x = Math.floor(Math.random() * outputWidth);	// random in range [0, outputWidth-1]

		while (numAttempts <= maxAttempts) {	// use <= so maxAttempts can be 1
			start = performance.now();
			this.observe(waveMatrix, y, x, weights);
			duration = performance.now() - start;
			observe_TotalDuration += duration;
			observe_NumCalls++;

			console.log("propagating...");
			start = performance.now();
			const contradictionCreated = this.propagate(waveMatrix, y, x, adjacencies);
			duration = performance.now() - start;
			propagate_TotalDuration += duration;
			propagate_NumCalls++;
			if (contradictionCreated) {
				console.log("restarting");
				start = performance.now();
				waveMatrix = this.createWaveMatrix(patterns.length, outputWidth, outputHeight);
				duration = performance.now() - start;
				createWaveMatrix_TotalDuration += duration;
				createWaveMatrix_NumCalls++;
				y = Math.floor(Math.random() * outputHeight);	// random in range [0, outputHeight-1]
				x = Math.floor(Math.random() * outputWidth);	// random in range [0, outputWidth-1]
				numAttempts++;
				continue;
			}

			start = performance.now();
			[y, x] = this.getLeastEntropyUnsolvedCellPosition(waveMatrix, weights);
			duration = performance.now() - start;
			getLeastEntropyUnsolvedCellPosition_TotalDuration += duration;
			getLeastEntropyUnsolvedCellPosition_NumCalls++;
			if (y === -1 && x === -1) {
				console.log("solved!");
				start = performance.now();
				this.output = this.waveMatrixToImage(waveMatrix, patterns);
				duration = performance.now() - start;
				waveMatrixToImage_TotalDuration += duration;
				waveMatrixToImage_NumCalls++;
				break;
			}
		}

		console.log(`
createWaveMatrix():
	total duration: ${createWaveMatrix_TotalDuration} ms
	num calls: ${createWaveMatrix_NumCalls}
	average duration: ${(createWaveMatrix_TotalDuration / createWaveMatrix_NumCalls).toFixed(3)} ms

getLeastEntropyUnsolvedCellPosition():
	total duration: ${getLeastEntropyUnsolvedCellPosition_TotalDuration} ms
	num calls: ${getLeastEntropyUnsolvedCellPosition_NumCalls}
	average duration: ${(getLeastEntropyUnsolvedCellPosition_TotalDuration / getLeastEntropyUnsolvedCellPosition_NumCalls).toFixed(3)} ms

observe():
	total duration: ${observe_TotalDuration} ms
	num calls: ${observe_NumCalls}
	average duration: ${(observe_TotalDuration / observe_NumCalls).toFixed(3)} ms

propagate():
	total duration: ${propagate_TotalDuration} ms
	num calls: ${propagate_NumCalls}
	average duration: ${(propagate_TotalDuration / propagate_NumCalls).toFixed(3)} ms

waveMatrixToImage():
	total duration: ${waveMatrixToImage_TotalDuration} ms
	num calls: ${waveMatrixToImage_NumCalls}
	average duration: ${(waveMatrixToImage_TotalDuration / waveMatrixToImage_NumCalls).toFixed(3)} ms
		`);

		if (numAttempts > maxAttempts) {
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
	 * @returns {Uint32Array[][]} 2D matrix of Uint32Arrays representing a cell's possbile patterns as an array of bitmasks
	 */
	createWaveMatrix(numPatterns, outputWidth, outputHeight) {
		const allPatternsPossible = new Bitmask();
		for (let i = 0; i < numPatterns; i++) bitmask.setBit(i);

		const waveMatrix = [];
		for (let y = 0; y < outputHeight; y++) {
			waveMatrix[y] = [];
			for (let x = 0; x < outputWidth; x++) {
				const bitmask = new Bitmask();
				bitmask.value = allPatternsPossible.value;
				waveMatrix[y][x] = bitmask;
			}
		}
		return waveMatrix;
	}

	/**
	 * Picks a pattern for a cell to become using weighted random.
	 * @param {Uint32Array[][]} waveMatrix 2D matrix of Uint32Arrays representing a cell's possbile patterns as an array of bitmasks
	 * @param {number} y 
	 * @param {number} x 
	 * @param {number[]} weights 
	 */
	observe(waveMatrix, y, x, weights) {
		// used https://dev.to/jacktt/understanding-the-weighted-random-algorithm-581p
		const possiblePatterns = bitmaskArrayToPatternIndexArray(waveMatrix[y][x]);
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

				waveMatrix[y][x].fill(0);	// set all bits to 0
				const bitmaskArrayIndex = Math.floor(chosenPattern/32);
				const bitmask = 1 << chosenPattern;	// pattern to bitmask
				waveMatrix[y][x][bitmaskArrayIndex] |= bitmask;

				return;
			}
		}
		throw new Error("A pattern wasn't chosen within the for loop");
	}

	/**
	 * Adjusts all cells' possible patterns if they need to be adjusted due to the observation of a cell.
	 * @param {Uint32Array[][]} waveMatrix 2D matrix of Uint32Arrays representing a cell's possbile patterns as an array of bitmasks
	 * @param {number} y 
	 * @param {number} x
	 * @param {Uint32Array[][]} adjacencies
	 * @returns {boolean} whether a contradiction was created or not
	 */
	propagate(waveMatrix, y, x, adjacencies) {
		const queue = new Queue();
		queue.enqueue([y, x]);

		while (queue.length > 0) {
			const [y1, x1] = queue.dequeue();
			const cell1_PossiblePatterns = bitmaskArrayToPatternIndexArray(waveMatrix[y1][x1]);
			
			for (let k = 0; k < DIRECTIONS.length; k++) {	// using k because k is associated with iterating over DIRECTIONS in the ImageProcessor class
				/*
					Given two adjacent cells: cell1 at (y1, x1) and cell2 at (y2, x2)

					Get cell2's currernt possible patterns
					Use the adjacency data of cell1's possible patterns to build a set of all possible patterns cell2 can be
					Create an array for cell2's new possible patterns by taking the shared elements between the two aforementioned data structures 

					If cell2's new possible patterns is the same size as its current: there were no changes - do nothing
					If cell2's new possible patterns is empty: there are no possible patterns cell2 can be - return contradiction
					If cell2's new possible patterns is smaller than its current: there were changes - enqueue cell2 so its adjacent cells can also be adjusted
				*/
				const dir = DIRECTIONS[k];
				const dy = -dir[0];	// need to reverse direction or else output will be upside down
				const dx = -dir[1];	// need to reverse direction or else output will be upside down
				const y2 = y1+dy;
				const x2 = x1+dx;

				// Don't go out of bounds
				if (y2 < 0 || y2 > waveMatrix.length-1) continue;
				if (x2 < 0 || x2 > waveMatrix[0].length-1) continue;

				const cell2_PossiblePatterns = waveMatrix[y2][x2];

				const numInts = Math.ceil(adjacencies.length/32);
				const cell1_AdjacentPatterns = new Uint32Array(numInts)
				for (const patternIndex of cell1_PossiblePatterns) {
					const bitmaskArray = adjacencies[patternIndex][k];
					for (let i = 0; i < bitmaskArray.length; i++) {
						cell1_AdjacentPatterns[i] |= bitmaskArray[i];
					}
				}

				const cell2_NewPossiblePatterns = new Uint32Array(numInts);
				for (let i = 0; i < cell2_NewPossiblePatterns.length; i++) {
					cell2_NewPossiblePatterns[i] = cell2_PossiblePatterns[i] & cell1_AdjacentPatterns[i];
				}

				let contradictionCreated = true;
				for (const bitmask of cell2_NewPossiblePatterns) {
					if (bitmask !== 0) {
						contradictionCreated = false;
						break;
					}
				}
				if (contradictionCreated) return true;
				
				let cell2Changed = false;
				for (let i = 0; i < cell2_NewPossiblePatterns.length; i++) {
					if (cell2_NewPossiblePatterns[i] !== cell2_PossiblePatterns[i]) {
						cell2Changed = true;
						break;
					}
				}
				if (cell2Changed) {
					waveMatrix[y2][x2] = cell2_NewPossiblePatterns;
					queue.enqueue([y2, x2]);
				}
			}
		}
		return false;	// no contradiction created
	}

	/**
	 * Get the position of the cell with the least entropy that's not 0. If all cells are solved, returns [-1, -1].
	 * @param {Uint32Array[][]} waveMatrix 2D matrix of Uint32Arrays representing a cell's possbile patterns as an array of bitmasks
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
			return leastEntropyCellPositions[Math.floor(Math.random() * len)];	// random element (cell position)
		}
		else {
			return [-1, -1];
		}
	}

	/**
	 * Gets the Shannon Entropy of a cell using its possible patterns and those patterns' weights.
	 * @param {Uint32Array} possiblePatterns 
	 * @param {number[]} weights 
	 * @returns {number}
	 */
	getShannonEntropy(possiblePatterns, weights) {
		const possiblePatterns_PatternIndexArray = bitmaskArrayToPatternIndexArray(possiblePatterns);
		
		if (possiblePatterns_PatternIndexArray.length === 0) throw new Error("Contradiction found.");
		if (possiblePatterns_PatternIndexArray.length === 1) return 0;	// what the calculated result would be

		let sumOfWeights = 0;
		let sumOfWeightLogWeights = 0;
		for (const patternIndex of possiblePatterns_PatternIndexArray) {
			const weight = weights[patternIndex];
			sumOfWeights += weight;
			sumOfWeightLogWeights += weight * Math.log(weight);
		}
		return Math.log(sumOfWeights) - sumOfWeightLogWeights/sumOfWeights;
	}

	/**
	 * Build a 2D image matrix using the top left tile of each cell's pattern.
	 * @param {Uint32Array[][]} waveMatrix 2D matrix of Uint32Arrays representing a cell's possbile patterns as an array of bitmasks
	 * @param {number[][][]} patterns 
	 * @returns {number[][]}
	 */
	waveMatrixToImage(waveMatrix, patterns) {
		const image = [];
		for (let y = 0; y < waveMatrix.length; y++) {
			image[y] = [];
			for (let x = 0; x < waveMatrix[0].length; x++) {
				const patternIndexArray = bitmaskArrayToPatternIndexArray(waveMatrix[y][x]);
				const patternIndex = patternIndexArray[0];
				const tileID = patterns[patternIndex][0][0];
				image[y][x] = tileID;
			}
		}
		return image;
	}
}