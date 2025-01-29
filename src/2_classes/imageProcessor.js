/** Processes images to get their patterns. Doesn't process images as periodic, and doesn't rotate or reflect patterns. */
class ImageProcessor {
	/** 
	 * Example: [ pattern0, pattern1, ... ], where patterns are 2D NxN matrices.
	 * @type {number[][][]}
	*/
	patterns;

	/**
	 * Example: [ pattern0Weight, pattern1Weight, ... ]
	 * @type {number[]}
	*/
	weights;

	/**
	 * A is to the {direction} of B. For example, if pattern 0 can be placed above patterns 1 and 3:
	 * ```
	 * adjacencies = [ pattern0Adjacencies, pattern2Adjacencies, ... ]
	 * pattern0Adjacencies = [ [upAdjacencies], [downAdjacencies], [leftAdjacencies], [rightAdjacencies] ]
	 * upAdjacencies = [ 1, 3, ... ]
	 * ```
	 * @type {number[][][]}
	*/
	adjacencies;

	/**
	 * Populates this.patterns, this.adjacencies, and this.weights.
	 * @param {number[][]} image a 2D matrix of tile IDs representing the layer of a tilemap
	 * @param {number} N the desired width of the resulting square patterns
	 */
	process(image, N) {
		this.validateInput(image, N);
		this.resetVariables();
		this.getPatternsAndWeights(image, N);
		this.getAdjacencies();
	}

	/**
	 * @param {number[][]} image a 2D matrix of tile IDs representing the layer of a tilemap
	 * @param {number} N the desired width of the resulting square patterns
	 */
	validateInput(image, N) {
		if (!image) {
			throw new Error("Image is undefined");
		}
		if (image.length < 1) {
			throw new Error("Image height is less than 1.");
		}
		if (image[0].length < 1) {
			throw new Error("Image width is less than 1.");
		}
		if (!N) {
			throw new Error("N is undefined");
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

	resetVariables() {
		this.patterns = [];
		this.adjacencies = [];
		this.weights = [];
	}

	/**
	 * @param {number[][]} image a 2D matrix of tile IDs representing the layer of a tilemap
	 * @param {number} N the desired width of the resulting square patterns
	 */
	getPatternsAndWeights(image, N) {
		/*
			Have to get patterns and weights together because we want this.patterns to only have unique ones
			When we find duplicates, we need to throw them out and increment the original pattern's weight
			Using a map will let us filter out duplicates and know which index in this.weights to increment
		*/
		const uniquePatterns = new Map();	// <pattern, index>
		for (let y = 0; y < image.length-N+1; y++) {		// length-N+1 because we're not processing image as periodic
			for (let x = 0; x < image[0].length-N+1; x++) {	// length-N+1 because we're not processing image as periodic
				const pattern = this.getPattern(image, N, y, x);
				const patternStr = pattern.toString();		// need to convert to string because maps compare arrays using their pointers
				if (uniquePatterns.has(patternStr)) {
					this.weights[uniquePatterns.get(patternStr)]++;
				}
				else {
					this.patterns.push(pattern);
					this.weights.push(1);
					uniquePatterns.set(patternStr, this.patterns.length-1);
				}
			}
		}
	}

	/**
	 * @param {number[][]} image a 2D matrix of tile IDs representing the layer of a tilemap
	 * @param {number} N the desired width of the resulting square patterns
	 * @param {number} y the y position in the image of the top left tile of the pattern
	 * @param {number} x the x position in the image of the top left tile of the pattern
	 * @returns {number[][]}
	 */
	getPattern(image, N, y, x) {
		const pattern = [];
		for (let ny = 0; ny < N; ny++) {
			pattern[ny] = [];
			for (let nx = 0; nx < N; nx++) {
				pattern[ny][nx] = image[y+ny][x+nx];
			}
		}
		return pattern;
	}

	getAdjacencies() {
		/*
			Check each pattern against every other pattern in every direction
			Because pattern adjacency is commutative (A is adjacent to B means B is adjacent to A)
			We don't need to check combos that we've already done
			Hence why j starts at i+1
		*/
		for (const pattern of this.patterns) {
			this.adjacencies.push([ [], [], [], [] ]);
		}
		const oppositeDirIndex = new Map([[0, 1], [1, 0], [2, 3], [3, 2]]);
		for (let i = 0; i < this.patterns.length; i++) {
			for (let j = i+1; j < this.patterns.length; j++) {
				for (let k = 0; k < DIRECTIONS.length; k++) {
					const p1 = this.patterns[i];
					const p2 = this.patterns[j];
					const dir = DIRECTIONS[k];
					if (this.isAdjacent(p1, p2, dir)) {
						const o = oppositeDirIndex.get(k);
						this.adjacencies[i][k].push(j);
						this.adjacencies[j][o].push(i);
					}
				}
			}
		}
	}

	/**
	 * Returns whether p1 is to the {dir} of p2. The result also tells whether p2 is to the {opposite dir} of p1.
	 * @param {number[][]} p1 pattern 1
	 * @param {number[][]} p2 pattern 2
	 * @param {number[]} dir direction
	 * @returns {boolean}
	 */
	isAdjacent(p1, p2, dir) {
		/*
			Check if the patterns overlap, for example:
			Suppose dir is UP ([-1, 0])

				p1
			X	X	X			p2
			1	2	3		1	2	3
			4	5	6		4	5	6
							X	X	X

			If every number in p1 matches with its corresponding number in p2, then p1 is to the top of p2
		*/
		const start = new Map([[-1, 1], [1, 0], [0, 0]]);
		const end = new Map([[-1, 0], [1, -1], [0, 0]]);
		const dy = dir[0];
		const dx = dir[1];
		const startY = start.get(dy);
		const startX = start.get(dx);
		const endY = p1.length + end.get(dy);
		const endX = p1[0].length + end.get(dx);

		for (let y = startY; y < endY; y++) {
			for (let x = startX; x < endX; x++) {
				const tile1 = p1[y][x];
				const tile2 = p2[y+dy][x+dx];	// apply offsets
				if (tile1 !== tile2) {
					return false;
				}
			}
		}
		return true;
	}
}