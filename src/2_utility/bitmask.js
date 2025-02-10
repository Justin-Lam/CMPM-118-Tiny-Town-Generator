/*
	Did a lot of AI consulting (ChatGPT and Deepseek) to implement bitmasking for the ImageProcessor and ConstraintSolver
	The optimization idea and some of the code is credited to them
*/

/** Represents either
 * 	an adjacency bitmask (which patterns are adjacent to a pattern in a direction),
 * 	or a possible patterns bitmask (which patterns can a cell be).
*/
class Bitmask {
	value = 0n;	// BigInt

	/**
	 * Sets the bit at index i to 1.
	 * @param {number} i 
	 */
	setBit(i) {
		/*
			Convert i to a BigInt
			Then convert it from an index to a bitmask
			Then combine it wtih this Bitmask
		*/
		this.value |= (1n << BigInt(i));
	}

	/** Sets all bits to 0. */
	clear() {
		this.value = 0n;
	}

	/**
	 * Uses this Bitmask to create an array of set bit indices and returns it. Ex: 1010 (binary) -> [1, 3] (decimal).
	 * @returns {number[]}
	 */
	toArray() {
		const result = [];
		let bitmask = this.value;	// make a copy so we don't alter the actual value

		// Extract all set bits from the bitmask and push their indices into result
		while (bitmask !== 0n) {
			const lowestSetBit = bitmask & -bitmask;			// ex: 01100 (binary) -> 00100 (binary) = 4 (decimal)
			const index = lowestSetBit.toString(2).length - 1;	// ex: 4.toString(2) = "100", "100".length - 1 = 2;
			result.push(index);
			bitmask ^= lowestSetBit;	// clear the bit
		}
		
		return result;
	}
}