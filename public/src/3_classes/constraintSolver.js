import Bitmask from "../2_utility/bitmask.js";

export default class ConstraintSolver {
	/**
	 * The output image as a 2D matrix of tile IDs.
	 * @type {number[][]}
	 */
	output;

	start;
	duration;
	createWaveMatrix_TotalDuration;
	createWaveMatrix_NumCalls;
	getLeastEntropyUnsolvedCellPosition_TotalDuration;
	getLeastEntropyUnsolvedCellPosition_NumCalls;
	getShannonEntropy_TotalDuration;
	getShannonEntropy_NumCalls;
	observe_TotalDuration;
	observe_NumCalls;
	propagate_TotalDuration;
	propagate_NumCalls;
	waveMatrixToImage_TotalDuration;
	waveMatrixToImage_NumCalls;
	toArray_TotalDuration;
	toArray_NumCalls;

	/**
	 * Attempts to populate this.output.
	 * @param {number[][][]} patterns
	 * @param {number[]} weights 
	 * @param {Bitmask[][]} adjacencies
	 * @param {number} outputWidth
	 * @param {number} outputHeight
	 * @returns {boolean} whether the constraint solver was successful or not
	 */
	solve(patterns, weights, adjacencies, outputWidth, outputHeight, maxAttempts) {
		this.start = 0;
		this.duration = 0;
		this.createWaveMatrix_TotalDuration = 0;
		this.createWaveMatrix_NumCalls = 0;
		this.getLeastEntropyUnsolvedCellPosition_TotalDuration = 0;
		this.getLeastEntropyUnsolvedCellPosition_NumCalls = 0;
		this.getShannonEntropy_TotalDuration = 0;
		this.getShannonEntropy_NumCalls = 0;
		this.observe_TotalDuration = 0;
		this.observe_NumCalls = 0;
		this.propagate_TotalDuration = 0;
		this.propagate_NumCalls = 0;
		this.waveMatrixToImage_TotalDuration = 0;
		this.waveMatrixToImage_NumCalls = 0;
		this.toArray_TotalDuration = 0;
		this.toArray_NumCalls = 0;

		console.log("starting");

		this.start = performance.now();
		let waveMatrix = this.createWaveMatrix(patterns.length, outputWidth, outputHeight);
		this.duration = performance.now() - this.start;
		this.createWaveMatrix_TotalDuration += this.duration;
		this.createWaveMatrix_NumCalls++;
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
			this.start = performance.now();
			this.observe(waveMatrix, y, x, weights);
			this.duration = performance.now() - this.start;
			this.observe_TotalDuration += this.duration;
			this.observe_NumCalls++;

			console.log("propagating...");
			this.start = performance.now();
			const contradictionCreated = this.propagate(waveMatrix, y, x, adjacencies);
			this.duration = performance.now() - this.start;
			this.propagate_TotalDuration += this.duration;
			this.propagate_NumCalls++;
			if (contradictionCreated) {
				console.log("restarting");
				this.start = performance.now();
				waveMatrix = this.createWaveMatrix(patterns.length, outputWidth, outputHeight);
				this.duration = performance.now() - this.start;
				this.createWaveMatrix_TotalDuration += this.duration;
				this.createWaveMatrix_NumCalls++;
				y = Math.floor(Math.random() * outputHeight);	// random in range [0, outputHeight-1]
				x = Math.floor(Math.random() * outputWidth);	// random in range [0, outputWidth-1]
				numAttempts++;
				continue;
			}

			this.start = performance.now();
			[y, x] = this.getLeastEntropyUnsolvedCellPosition(waveMatrix, weights);
			this.duration = performance.now() - this.start;
			this.getLeastEntropyUnsolvedCellPosition_TotalDuration += this.duration;
			this.getLeastEntropyUnsolvedCellPosition_NumCalls++;
			if (y === -1 && x === -1) {
				console.log("solved!");
				this.start = performance.now();
				this.output = this.waveMatrixToImage(waveMatrix, patterns);
				this.duration = performance.now() - this.start;
				this.waveMatrixToImage_TotalDuration += this.duration;
				this.waveMatrixToImage_NumCalls++;
				break;
			}
		}

		this.getLeastEntropyUnsolvedCellPosition_TotalDuration -= this.getShannonEntropy_TotalDuration;
		const completeTotalDuration = (
			this.createWaveMatrix_TotalDuration
			+
			this.observe_TotalDuration
			+
			this.propagate_TotalDuration
			+
			this.getLeastEntropyUnsolvedCellPosition_TotalDuration
			+
			this.getShannonEntropy_TotalDuration
			+
			this.waveMatrixToImage_TotalDuration
		);
		console.log(`
createWaveMatrix():
	total duration: ${this.createWaveMatrix_TotalDuration} ms
	num calls: ${this.createWaveMatrix_NumCalls}
	average duration: ${(this.createWaveMatrix_TotalDuration / this.createWaveMatrix_NumCalls).toFixed(3)} ms

getLeastEntropyUnsolvedCellPosition():
	total duration: ${this.getLeastEntropyUnsolvedCellPosition_TotalDuration} ms
	num calls: ${this.getLeastEntropyUnsolvedCellPosition_NumCalls}
	average duration: ${(this.getLeastEntropyUnsolvedCellPosition_TotalDuration / this.getLeastEntropyUnsolvedCellPosition_NumCalls).toFixed(3)} ms

getShannonEntropy():
	total duration: ${this.getShannonEntropy_TotalDuration} ms
	num calls: ${this.getShannonEntropy_NumCalls}
	average duration: ${(this.getShannonEntropy_TotalDuration / this.getShannonEntropy_NumCalls).toFixed(3)} ms

observe():
	total duration: ${this.observe_TotalDuration} ms
	num calls: ${this.observe_NumCalls}
	average duration: ${(this.observe_TotalDuration / this.observe_NumCalls).toFixed(3)} ms

propagate():
	total duration: ${this.propagate_TotalDuration} ms
	num calls: ${this.propagate_NumCalls}
	average duration: ${(this.propagate_TotalDuration / this.propagate_NumCalls).toFixed(3)} ms

waveMatrixToImage():
	total duration: ${this.waveMatrixToImage_TotalDuration} ms
	num calls: ${this.waveMatrixToImage_NumCalls}
	average duration: ${(this.waveMatrixToImage_TotalDuration / this.waveMatrixToImage_NumCalls).toFixed(3)} ms

toArray():
	total duration: ${this.toArray_TotalDuration} ms
	num calls: ${this.toArray_NumCalls}
	average duration: ${(this.toArray_TotalDuration / this.toArray_NumCalls).toFixed(3)} ms

complete total duration: ${completeTotalDuration} ms
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
	 * @returns {Bitmask[][]} 2D matrix of cells, which are actually just their possible pattern Bitmasks
	 */
	createWaveMatrix(numPatterns, outputWidth, outputHeight) {
		const allPatternsPossible = new Bitmask(numPatterns);
		for (let i = 0; i < numPatterns; i++) allPatternsPossible.setBit(i);

		const waveMatrix = [];
		for (let y = 0; y < outputHeight; y++) {
			waveMatrix[y] = [];
			for (let x = 0; x < outputWidth; x++) {
				waveMatrix[y][x] = Bitmask.createCopy(allPatternsPossible);
			}
		}
		return waveMatrix;
	}

	/**
	 * Picks a pattern for a cell to become using weighted random.
	 * @param {Bitmask[][]} waveMatrix 2D matrix of cells, which are actually just their possible pattern Bitmasks
	 * @param {number} y 
	 * @param {number} x 
	 * @param {number[]} weights 
	 */
	observe(waveMatrix, y, x, weights) {
		// used https://dev.to/jacktt/understanding-the-weighted-random-algorithm-581p

		const start = performance.now();
		const possiblePatterns = waveMatrix[y][x].toArray();
		const duration = performance.now() - start;
		this.toArray_TotalDuration += duration;
		this.toArray_NumCalls++;

		const possiblePatternWeights = [];	// is parallel with possiblePatterns
		let totalWeight = 0;
		for (const i of possiblePatterns) {
			const w = weights[i];
			possiblePatternWeights.push(w);
			totalWeight += w;
		}

		const random = Math.random() * totalWeight;

		let cursor = 0;
		for (let i = 0; i < possiblePatternWeights.length; i++) {
			cursor += possiblePatternWeights[i];
			if (cursor >= random) {
				waveMatrix[y][x].clear();
				waveMatrix[y][x].setBit(possiblePatterns[i]);
				return;
			}
		}

		throw new Error("A pattern wasn't chosen within the for loop");
	}

	/**
	 * Adjusts all cells' possible patterns if they need to be adjusted due to the observation of a cell.
	 * @param {Bitmask[][]} waveMatrix 2D matrix of cells, which are actually just their possible pattern Bitmasks
	 * @param {number} y 
	 * @param {number} x
	 * @param {Bitmask[][]} adjacencies
	 * @returns {boolean} whether a contradiction was created or not
	 */
	propagate(waveMatrix, y, x, adjacencies) {
		const queue = new Queue();
		queue.enqueue([y, x]);

		while (queue.length > 0) {
			const [y1, x1] = queue.dequeue();

			const start = performance.now();
			const cell1_PossiblePatterns_Array = waveMatrix[y1][x1].toArray();
			const duration = performance.now() - start;
			this.toArray_TotalDuration += duration;
			this.toArray_NumCalls++;

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

				const cell2_PossiblePatterns_Bitmask = waveMatrix[y2][x2];

				const cell1_PossibleAdjacentPatterns_Bitmask = new Bitmask(adjacencies.length);
				for (const i of cell1_PossiblePatterns_Array) {
					const i_AdjacentPatterns_Bitmask = adjacencies[i][k];
					cell1_PossibleAdjacentPatterns_Bitmask.combineWith(i_AdjacentPatterns_Bitmask);
				}

				const cell2_NewPossiblePatterns_Bitmask = Bitmask.AND(cell2_PossiblePatterns_Bitmask, cell1_PossibleAdjacentPatterns_Bitmask);

				const contradictionCreated = cell2_NewPossiblePatterns_Bitmask.isEmpty();
				if (contradictionCreated) return true;
				
				const cell2Changed = !(Bitmask.EQUALS(cell2_PossiblePatterns_Bitmask, cell2_NewPossiblePatterns_Bitmask));
				if (cell2Changed) {
					waveMatrix[y2][x2] = cell2_NewPossiblePatterns_Bitmask;
					queue.enqueue([y2, x2]);
				}
			}
		}
		return false;	// no contradiction created
	}

	/**
	 * Get the position of the cell with the least entropy that's not 0. If all cells are solved, returns [-1, -1].
	 * @param {Bitmask[][]} waveMatrix 2D matrix of cells, which are actually just their possible pattern Bitmasks
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

				const start = performance.now();
				const entropy = this.getShannonEntropy(waveMatrix[y][x], weights);
				const duration = performance.now() - start;
				this.getShannonEntropy_TotalDuration += duration;
				this.getShannonEntropy_NumCalls++;

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
	 * @param {Bitmask} possiblePatterns_Bitmask 
	 * @param {number[]} weights 
	 * @returns {number}
	 */
	getShannonEntropy(possiblePatterns_Bitmask, weights) {
		const start = performance.now();
		const possiblePatterns_Array = possiblePatterns_Bitmask.toArray();
		const duration = performance.now() - start;
		this.toArray_TotalDuration += duration;
		this.toArray_NumCalls++;

		if (possiblePatterns_Array.length === 0) throw new Error("Contradiction found.");
		if (possiblePatterns_Array.length === 1) return 0;	// what the calculated result would have been

		let sumOfWeights = 0;
		let sumOfWeightLogWeights = 0;
		for (const i of possiblePatterns_Array) {
			const w = weights[i];
			sumOfWeights += w;
			sumOfWeightLogWeights += w * Math.log(w);
		}
		return Math.log(sumOfWeights) - sumOfWeightLogWeights/sumOfWeights;
	}

	/**
	 * Build a 2D image matrix using the top left tile of each cell's pattern.
	 * @param {Bitmask[][]} waveMatrix 2D matrix of cells, which are actually just their possible pattern Bitmasks
	 * @param {number[][][]} patterns 
	 * @returns {number[][]}
	 */
	waveMatrixToImage(waveMatrix, patterns) {
		const image = [];
		for (let y = 0; y < waveMatrix.length; y++) {
			image[y] = [];
			for (let x = 0; x < waveMatrix[0].length; x++) {
				const start = performance.now();
				const possiblePatterns_Array = waveMatrix[y][x].toArray();
				const duration = performance.now() - start;
				this.toArray_TotalDuration += duration;
				this.toArray_NumCalls++;

				const i = possiblePatterns_Array[0];	// should be guaranteed to only have 1 possible pattern
				const tileID = patterns[i][0][0];
				image[y][x] = tileID;
			}
		}
		return image;
	}
}