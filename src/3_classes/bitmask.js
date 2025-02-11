/*
	Did a lot of AI consulting (ChatGPT and Deepseek) to implement bitmasking for the ImageProcessor and ConstraintSolver
	The optimization idea and some of the code is credited to them
*/

/** Represents either
 * 	an adjacent patterns Bitmask for a pattern (which patterns are adjacent to a pattern in a direction),
 * 	or a possible patterns Bitmask for a cell (which patterns a cell can be).
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
	 * Returns whether all bits are 0 or not.
	 * @returns {boolean}
	 */
	allBitsUnset() {
		return this.value === 0n;
	}

	/**
	 * Sets any unset bits in this Bitmask that are set in the other Bitmask.
	 * @param {Bitmask} other 
	 */
	combineWith(other) {
		this.value |= other.value;
	}

	/**
	 * Returns whether b1 === b2;
	 * @param {Bitmask} b1 
	 * @param {Bitmask} b2 
	 * @returns {boolean}
	 */
	static EQUALS(b1, b2) {
		return b1.value === b2.value;
	}

	/**
	 * Creates and returns a new Bitmask that's the result of b1 AND b2.
	 * @param {Bitmask} b1 
	 * @param {Bitmask} b2 
	 * @returns {Bitmask}
	 */
	static AND(b1, b2) {
		const result = new Bitmask();
		result.value = b1.value & b2.value;
		return result;
	}

	/**
	 * Uses this Bitmask to create and return an array of set bit indices. Ex: 1010 (binary) -> [1, 3] (decimal).
	 * @returns {number[]}
	 */
	toArray() {
		const result = [];
		let bitmask = this.value;	// make a copy so we don't alter the actual value

		// Extract all set bits from the bitmask and push their indices into result
		while (bitmask !== 0n) {
			const lowestSetBit = bitmask & -bitmask;			// ex: 01100 (binary) -> 00100 (binary)
			const index = log2_BigInt.get(lowestSetBit);		// ex: 00100 (binary) -> 2 (decimal)
			//const index = BigInt.prototype.toString.call(lowestSetBit, 2).length - 1;	// ex: 4.toString(2) = "100", "100".length - 1 = 2;
			result.push(index);
			bitmask ^= lowestSetBit;	// clear the bit
		}
		
		return result;
	}
}