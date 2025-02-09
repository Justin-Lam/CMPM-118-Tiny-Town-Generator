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