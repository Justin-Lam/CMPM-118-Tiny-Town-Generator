/**
 * Not periodic, doesn't do reflections
 */
class ImageProcessor {
	/** 
	 * [pattern0, pattern1, ...]
	 * @type {number[][][]}
	*/
	patterns;

	/**
	 * [[pattern1, pattern3, UP], [pattern2, pattern3, RIGHT], ...]
	 * @type {number[][]}
	*/
	adjacencies;

	/**
	 * [pattern1Weight, pattern2Weight, ...]
	 * @type {number[]}
	*/
	weights;

	/**
	 * Populates this instance's patterns, adjacencies, and weights variables.
	 * @param {number[][]} image 
	 * @param {number} N 
	 */
	process(image, N) {
		this.validateInput(image, N);
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
	getPatterns(image, N) {
		for (let y = 0; y < image.length-(N-1); y++) {
			for (let x = 0; x < image[0].length-(N-1); x++) {
				
			}
		}
	}
}