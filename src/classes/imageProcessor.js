/**
 * Not periodic, doesn't do reflections
 */
class ImageProcessor {
	/** 
	 * [pattern0, pattern1, ...], where patterns are 2D arrays.
	 * @type {number[][][]}
	*/
	patterns = [];

	/**
	 * [[pattern1, pattern3, UP], [pattern2, pattern3, RIGHT], ...], means that pattern A is to the {direction} of pattern B.
	 * @type {number[][]}
	*/
	adjacencies = [];

	/**
	 * [pattern1Weight, pattern2Weight, ...]
	 * @type {number[]}
	*/
	weights = [];

	/**
	 * Populates this.patterns, this.adjacencies, and this.weights.
	 * @param {number[][]} image 
	 * @param {number} N 
	 */
	process(image, N) {
		this.validateInput(image, N);
		this.getPatternsAndWeights(image, N);
		this.getAdjacencies();
	}

	/**
	 * @param {number[][]} image 
	 * @param {number} N 
	 */
	validateInput(image, N) {
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

	/**
	 * @param {number[][]} image 
	 * @param {number} N 
	 */
	getPatternsAndWeights(image, N) {
		/*
			Have to get patterns and weights together because we want this.patterns to only have unique ones
			When we find duplicates, we need to throw them out and increment the original pattern's weight
			Using a map will let us filter out duplicates and know which index in this.weights to increment
		*/
		const uniquePatterns = new Map();	// <pattern, index>
		for (let y = 0; y < image.length-N+1; y++) {
			for (let x = 0; x < image[0].length-N+1; x++) {
				const pattern = this.getPattern(image, N, y, x);
				const patternStr = pattern.toString();	// need to convert to string because maps compare arrays using their pointers
				if (uniquePatterns.has(patternStr)) {
					this.weights[uniquePatterns.get(patternStr)]++;
				}
				else {
					uniquePatterns.set(patternStr, this.patterns.length);
					this.patterns.push(pattern);
					this.weights.push(1);
				}
			}
		}
	}

	/**
	 * @param {number[][]} image 
	 * @param {number} N 
	 * @param {number} y
	 * @param {number} x
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
			Because pattern adjacency is commutative (A is adjacent to B means B is adjacent to A)
			We don't need to check combos that we've already done
			Hence why j starts at i+1 instead of 0
		*/
		for (let i = 0; i < this.patterns.length; i++) {
			for (let j = i+1; j < this.patterns.length; j++) {
				for (const dir of DIRECTIONS) {
					const p1 = this.patterns[i];
					const p2 = this.patterns[j];
					if (this.isAdjacent(p1, p2, dir)) {
						const oppositeDir = dir.map((n) => -n);
						this.adjacencies.push([i, j, dir]);
						this.adjacencies.push([j, i, oppositeDir]);
					}
				}
			}
		}
	}

	/**
	 * If p1 is to the {dir} of p2. Also means if p2 is to the {-dir} of p1.
	 * @param {number[][]} p1 pattern 1
	 * @param {number[][]} p2 pattern 2
	 * @param {number[]} dir direction
	 * @returns {boolean}
	 */
	isAdjacent(p1, p2, dir) {
		/*
			Example of how this function works:
			Suppose dir is UP ([-1, 0])

				p1
			X	X	X			p2
			O	O	O		O	O	O
			O	O	O		O	O	O
							X	X	X

			If every O in p1 matches with its corresponding O in p2, p1 is to the top of p2
		*/
		
		const dy = dir[0];
		const dx = dir[1];
		const startY = 0 ** (dy+1);				// map -1 to 1, 1 to 0, 0 to 0
		const startX = 0 ** (dx+1);				// map -1 to 1, 1 to 0, 0 to 0
		const endY = p1.length + -(dy+1)/2;		// map -1 to 0, 1 to -1; then add to length
		const endX = p1[0].length + -(dx+1)/2;	// map -1 to 0, 1 to -1; then add to length

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