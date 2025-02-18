/*
	function* indicates that a function is a generator function
	Generator functions can pause their execution and resume later
	They return iterator objects named "generator objects"
	Generator objects work really well in for...of loops, for example:

	const matrix = [
		['a', 'b', 'c'],
		['d', 'e', 'f'],
		['g', 'h', 'i']
	];

	for (const letter of iterateMatrix(matrix)) console.log(letter);
	--> a b c d e f g h i

	for (const [letter, y, x] of iterateMatrixYX(matrix)) console.log('[', letter, y, x, ']');
	--> [ a 0 0 ] [ b 0 1 ] [ c 0 2 ] [d 1 0] [ e 1 1 ] [ f 1 2 ] [ g 2 0 ] [ h 2 1 ] [ i 2 2 ]
*/

/**
 * Iterates over a 2D matrix row by row, column by column, yielding the matrix's elements.
 * @param {any[][]} matrix
 * @yields {any} an element of the matrix
 */
function* iterateMatrix(matrix) {
	for (let y = 0; y < matrix.length; y++) {
	for (let x = 0; x < matrix[y].length; x++) {
		yield matrix[y][x];
	}}
}

/**
 * Iterates over a 2D matrix row by row, column by column, yielding the matrix's elements and their yx indices.
 * @param {any[][]} matrix
 * @yields {[element, y, x]} an array containing an element, its y, and its x
 */
function* iterateMatrixYX(matrix) {
	for (let y = 0; y < matrix.length; y++) {
	for (let x = 0; x < matrix[y].length; x++) {
		yield [matrix[y][x], y, x];
	}}
}