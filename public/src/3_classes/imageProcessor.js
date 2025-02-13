import Bitmask from "../2_utility/bitmask.js";

/** Processes images to get their patterns. Doesn't process images as periodic, and doesn't rotate or reflect patterns. */
export default class ImageProcessor {
	/** 
	 * Ex: [ pattern0, pattern1, ... ], where patterns are 2D NxN matrices.
	 * @type {number[][][]}
	*/
	patterns;

	/**
	 * Ex: [ pattern0Weight, pattern1Weight, ... ]
	 * @type {number[]}
	*/
	weights;

	/**
	 * A is to the {direction} of B. For example, if pattern 0 can be placed above patterns 1 and 3:
	 * ```
	 * adjacencies = [ pattern0Adjacencies, pattern1Adjacencies, ... ]
	 * pattern0Adjacencies = [ [upBitmask], [downBitmask], [leftBitmask], [rightBitmask] ]
	 * upBitmask = 001010101101
	 * ```
	 * @type {Bitmask[][]} an array (i = pattern index) of arrays (i = direction index) of adjacent patterns Bitmasks which store a pattern's adjacent patterns in a direction
	*/
	adjacencies;

	/**
	 * Populates this.patterns, this.adjacencies, and this.weights.
	 * @param {number[][]} images an array of 2D tile ID matrices each representing a layer of a tilemap
	 * @param {number} N the width of the resulting square patterns
	 */
	process(images, N) {
		this.resetVariables();
		this.getPatternsAndWeights(images, N);
		this.getAdjacencies();
	}

	resetVariables() {
		this.patterns = [];
		this.adjacencies = [];
		this.weights = [];
	}

	/**
	 * @param {number[][]} images an array of 2D tile ID matrices each representing a layer of a tilemap
	 * @param {number} N the width of the resulting square patterns
	 */
	getPatternsAndWeights(images, N) {
		/*
			Because this.patterns must only contain unique ones, we have to get patterns and weights together
			When we find duplicate patterns, throw them out and increment the original pattern's weight
			Use a map to filter out duplicates and know the index of the element in this.weights to increment
		*/
		const uniquePatterns = new Map();	// <pattern, index>
		
		for (const image of images) {
			for (let y = 0; y < image.length-N+1; y++) {		// length-N+1 because we're not processing image as periodic
				for (let x = 0; x < image[0].length-N+1; x++) {	// length-N+1 because we're not processing image as periodic

					const p = this.getPattern(image, N, y, x);
					const p_str = p.toString();	// need to convert to string because maps compare arrays using their pointers
					if (uniquePatterns.has(p_str)) {
						const i = uniquePatterns.get(p_str);
						this.weights[i]++;
					}
					else {
						this.patterns.push(p);
						this.weights.push(1);
						uniquePatterns.set(p_str, this.patterns.length-1);
					}
				}
			}
		}
		
	}

	/**
	 * @param {number[][]} image a 2D matrix of tile IDs representing a layer of a tilemap
	 * @param {number} N the width of the resulting square patterns
	 * @param {number} y the y position of the top left tile of the pattern in the image
	 * @param {number} x the x position of the top left tile of the pattern in the image
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
		for (let i = 0; i < this.patterns.length; i++) {
			this.adjacencies.push([
				new Bitmask(this.patterns.length),	// up
				new Bitmask(this.patterns.length),	// down
				new Bitmask(this.patterns.length),	// left
				new Bitmask(this.patterns.length)	// right
			]);
		}		

		const oppositeDirIndex = new Map([[0, 1], [1, 0], [2, 3], [3, 2]]);	// input direction index k to get opposite direction index o

		for (let i = 0; i < this.patterns.length; i++) {
			for (let j = i+1; j < this.patterns.length; j++) {
				for (let k = 0; k < DIRECTIONS.length; k++) {
					if (this.isAdjacent(i, j, k)) {
						const o = oppositeDirIndex.get(k);
						this.adjacencies[i][k].setBit(j);
						this.adjacencies[j][o].setBit(i);
					}
				}
			}
		}
	}

	/**
	 * Determines if p1 is to the {dir} of p2. The result also tells if p2 is to the {opposite dir} of p1.
	 * @param {number} i pattern 1 index
	 * @param {number} j pattern 2 index
	 * @param {number} k direction index
	 * @returns {boolean}
	 */
	isAdjacent(i, j, k) {
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
		const p1 = this.patterns[i];
		const p2 = this.patterns[j];
		const dir = DIRECTIONS[k];
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
				if (tile1 !== tile2) return false;
			}
		}
		return true;
	}
}