/*
	Did a lot of AI consulting (ChatGPT and Deepseek) to implement bitmasking for the ImageProcessor and ConstraintSolver
	The optimization idea and some of the code is credited to them
*/

/** Represents either
 * 	an adjacent patterns Bitmask for a pattern (which patterns are adjacent to a pattern in a direction),
 * 	or a possible patterns Bitmask for a cell (which patterns a cell can be).
*/
class Bitmask {
	/** Since a single int can only store up to 32 bits (or patterns), use an array of ints to represent a giant int with infinite size. */
	array;

	/** @param {number} numBits is equal to numPatterns */
	constructor(numBits) {
		const numInts = Math.ceil(numBits/32);
		this.array = new Uint32Array(numInts);
	}

	/**
	 * Ex: 4 (decimal) -> 1000 (binary).
	 * @param {number} i 
	 * @returns {number} 
	 */
	static indexToBitmask(i) {
		return 1 << i;
	}

	/**
	 * Returns whether b1 === b2;
	 * @param {Bitmask} b1 
	 * @param {Bitmask} b2 
	 * @returns {boolean}
	 */
	static EQUALS(b1, b2) {
		for (let i = 0; i < b1.array.length; i++) if (b1.array[i] !== b2.array[i]) return false;
		return true;
	}

	/**
	 * Creates and returns a new Bitmask that's the result of b1 AND b2.
	 * @param {Bitmask} b1 
	 * @param {Bitmask} b2 
	 * @returns {Bitmask}
	 */
	static AND(b1, b2) {
		const numBits = b1.array.length * 32;
		const result = new Bitmask(numBits);
		for (let i = 0; i < b1.array.length; i++) result.array[i] = b1.array[i] & b2.array[i];
		return result;
	}

	/**
	 * Creates and returns a new Bitmask with the same value as the source.
	 * @param {Bitmask} source 
	 * @returns {Bitmask}
	 */
	static createCopy(source) {
		const numBits = source.array.length * 32;
		const copy = new Bitmask(numBits)
		copy.array = source.array.slice();
		return copy;
	}

	/**
	 * Sets the bit at index i to 1.
	 * @param {number} i 
	 */
	setBit(i) {
		const arrayIndex = Math.floor(i/32);
		this.array[arrayIndex] |= Bitmask.indexToBitmask(i);
	}

	/** Sets all bits to 0. */
	clear() {
		this.array.fill(0);
	}

	/**
	 * Returns whether all bits are 0 or not.
	 * @returns {boolean}
	 */
	allBitsUnset() {
		for (const int of this.array) if (int !== 0) return false;
		return true;
	}

	/**
	 * Sets any unset bits in this Bitmask that are set in the other Bitmask.
	 * @param {Bitmask} other 
	 */
	combineWith(other) {
		for (let i = 0; i < this.array.length; i++) this.array[i] |= other.array[i];
	}

	/**
	 * Uses this Bitmask to create and return an array of set bit indices. Ex: 1010 (binary) -> [1, 3] (decimal).
	 * @returns {number[]}
	 */
	toArray() {
		// Extract all set bits from the Bitmask and push their indices into result
		const result = [];
		for (let i = 0; i < this.array.length; i++) {
			let subBitmask = this.array[i];	// make a copy so we don't alter the actual value
			while (subBitmask !== 0) {
				const lowestSetBit_Signed = subBitmask & -subBitmask;		// ex: 01100 (binary) -> 00100 (binary)
				const lowestSetBit_Unsigned = lowestSetBit_Signed >>> 0;	// necessary if index_Local === 31 (without this you'd get a negative index)
				const base = i*32;
				const index_Local = Math.log2(lowestSetBit_Unsigned)		// ex: 00100 (binary) -> 2 (decimal)
				const index_Final = base + index_Local;
				result.push(index_Final);
				subBitmask ^= lowestSetBit_Unsigned;	// clear the bit
			}
		}
		return result;
	}
}