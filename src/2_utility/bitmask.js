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

	clearBit(i) {

	}
}

function bitmaskArrayToPatternIndexArray(bitmaskArray) {
	const result = [];
	for (let i = 0; i < bitmaskArray.length; i++) {
		let bitmask = bitmaskArray[i];
		while (bitmask !== 0) {
			let lowestSetBit = bitmask & -bitmask;	// lowest bit that's a 1
			lowestSetBit >>>= 0;	// convert from signed to unsigned
			const patternIndex = i*32 + Math.log2(lowestSetBit);
			result.push(patternIndex);
			bitmask ^= lowestSetBit;	// remove the bit
		}
	}
	return result;
}