// TODO:
// 			- replace recursion with iteration
//			- backtracking ?

// this class handles all of the heavy lifting for generating a WFC grid
// the only parameter available outside of the class is the resulting grid
class ConstraintSolver {
	// private properties
	#ip;
	#size;
	#grid;
	#patternOptions;
	#uncollapsed;
	#attemptsRemaining;

	constructor(ip, size) {
		this.#attemptsRemaining = 8000;

		this.#ip = ip;
		this.#size = size;
		this.#patternOptions = Array.from({ length: this.#ip.patterns.length }, (_, i) => i);

		this.#grid = this.#initGrid(this.#size, this.#patternOptions);
		this.#uncollapsed = Array.from({ length: this.#grid.length }, (_, i) => i);
		if(this.#run()){
			if(this.#attemptsRemaining > 0){ 
				console.log("WFC finished!");

				this.#printGrid();

				// output accesible outside of class
				this.generated = this.#patternsToTiles();	// converts grid from pattern to tiles
			}
			else{ 
				console.log(`WFC failed -- attempts exceeded max allowed`); 
				this.generated = null;
			}
		}
	}

	/*** MAIN WFC FUNCTIONS ***/

	// run() is the command center of the WFC algorithm
	#run() {
		console.log("initializing WFC...");
		while (this.#uncollapsed.length > 0) {
			this.#attemptsRemaining--;
			if(this.#attemptsRemaining <= 0) { return false; }
	
			const cell = this.#observe();
			const pick = this.#randomIndex(cell.options);
	
			cell.options = [cell.options[pick]];
			this.#resetVisitFlag();
	
			const success = this.#propagate(cell);
			if (!success) {
				console.log("Gridlock detected, restarting...");
				this.#grid = this.#initGrid(this.#size, this.#patternOptions);
				this.#uncollapsed = Array.from({ length: this.#grid.length }, (_, i) => i);
			}
		}
	
		return this.#uncollapsed.length === 0;
	}
	

	// observe phase -- picks a random uncollapsed cell
	//		TODO: add functionality to get minimun entropy
	#observe(){
		// get the index of an uncollapsed cell
		let uncollapsedIndex = this.#randomIndex(this.#uncollapsed);	

		let pickIndex = this.#uncollapsed[uncollapsedIndex];				
		let cell = this.#grid[pickIndex];
		cell.collapsed = true;								// collapse cell

		this.#uncollapsed.splice(uncollapsedIndex, 1);		// remove index from uncollapsed

		return cell;
	}

	// propagate startCell's option choice to all other cells
	#propagate(startCell){
		const stack = [startCell]; 		// use a stack to track which cells' options need to be propagated
		while (stack.length > 0) {
			const cell = stack.pop();

			// update all of cell's neighbors
			for(let dir in cell.neighbors){
				let neighborAddress = cell.neighbors[dir];
				if(neighborAddress === null){ continue; }			// cell doesnt have a neighbor in this direction
				
				let neighbor = this.#grid[neighborAddress]; 
				if(neighbor.visited === true){ continue; }			// cell has already been visited in this propagation
				
				neighbor.visited = true;

				let prevOptionCount = neighbor.options.length;

				// find valid options for this neighbor by looking at each pattern in cell's options
				//		and finding which adjacencies are valid for that neighbor
				let valid = [];

				// TODO: maybe try to get rid of this for loop? idk how much that would help tho tbh
				//	cell.options.length can get pretty long so i think it may help a little!
				let patternAdjs = this.#ip.adjacencies;
				for (let i = 0; i < cell.options.length; i++) {					
					// left neighbor's options == cell tile's left adjacencies, etc
					let cellOption = cell.options[i];
					let pAdj = patternAdjs[cellOption][dir];	// the adjacencies for this pattern (cellOption)
					if(pAdj) valid.push(...pAdj);
				}

				// update neighbor's options to be whichever are options are in valid[]
				let validSet = new Set(valid);							// using sets to prevent duplicates
				let neighborSet = new Set(neighbor.options);
				let newOptions = validSet.intersection(neighborSet);
				neighbor.options = [...newOptions];

				if(neighbor.options.length === 0){	// gridlock :(
					return false;					// will trigger a restart
				}

				if(neighbor.options.length === 1){	// this neighbor is collapsed!
					neighbor.collapsed = true;

					// if neighbor not already collapsed, remove its index from uncollapsed array
					let ind = this.#uncollapsed.indexOf((neighbor.y * this.#size) + neighbor.x);
					if(ind !== -1) this.#uncollapsed.splice(ind, 1);

				}

				// add neighbor to propagation stack
				if(neighbor.options.length < prevOptionCount){//this.#patternOptions.length){
					stack.push(neighbor);
				} 
			}
		}
		
		return true; // no deadlocks detected, done with this propagation
	}

	// conversion function to get the top left tile of every pattern
	#patternsToTiles(){
		let result = []
		for(let y = 0; y < this.#size; y++){
			let row = [];
			for(let x = 0; x < this.#size; x++){
				let index = (y * this.#size) + x;
				let cell = this.#grid[index];
							
				let patternIndex = cell.options[0];
				let pattern = this.#ip.patterns[patternIndex];
				let tile = pattern[0][0];		// top left tile of pattern
			
				row.push(tile);		
			}
			result.push(row);
		}

		return result;
	}

	/*** HELPER FUNCTIONS ***/

	// makes a ( size x size ) grid, initializing each cell with:
	// 		- (x, y) address
	//		- collapsed flag set to false
	//		- visit flag set to false
	//		- options populated with all patterns
	//		- neighbors' addresses
	#initGrid(size, options) {
		let result = [];

		for(let y = 0; y < size; y++){
			for(let x = 0; x < size; x++){
				let index = (y * size) + x;
				result[index] = { 
					x: x, y: y,
					collapsed: false,
					visited: false,		// flag for propagation
					options: options,	// init every cell with all possible options
					neighbors: {		// indeces of neighboring cells
						/* up	 */ 0:	(y < size - 1) 	? ((y + 1) * size) + x : null,
						/* down	 */	1:	(y > 0) 		? ((y - 1) * size) + x : null,
						/* left  */	2:	(x < size - 1) 	? (y * size) + (x + 1) : null,
						/* right */	3:	(x > 0) 		? (y * size) + (x - 1) : null,
					}
				};	
			}
		}

		return result;
	}
	
	// returns a random index from the given array
	#randomIndex(arr){
		let max = arr.length;
		let pick = Math.floor(Math.random() * max);

		return pick;
	}

	// sorts ip adjacencies by pattern and direction
	//		makes something like:
	//		[ 0: {up: [...], down: [...] }, 1: { down: [...], right: [...] } ]
	#adjByPattern(patterns){
		let result = [];
		for(let p of patterns){
			let pAdj = {};
			for(let dir in DIRECTIONS){
				let dirOptions = [];
				let found = false;
				for(let adj of this.#ip.adjacencies){	
					if(adj[0] === p && `${adj[2]}` === dir){
						dirOptions.push(adj[1]);
						found = true;
					}	
				}
				if(found) pAdj[this.#dirStr(dir)] = dirOptions;
			}
			result.push(pAdj)
		}
		return result;
	}

	// convert dir from int to string 
	// 		dir = 0, 1, 2, 3	--> [ 0,    1,    2,     3]
	// 		const DIRECTIONS = 		[UP, DOWN, LEFT, RIGHT];
	#dirStr(dir){
		switch(dir){
			case "0": return "up"	
			case "1": return "down"	
			case "2": return "left"	
			case "3": return "right"
		}
	}

	// (debug help) prints the collapse options of grid
	#printGrid(){
		let print = "";

		for(let y = 0; y < this.#size; y++){
			for(let x = 0; x < this.#size; x++){
				let index = (y * this.#size) + x;
				let str = `${this.#grid[index].options[0]}`;
				print += str.padEnd(4);		// a minor TODO: change 4 to a variable
			}
			print += `\n`
		}
		
		console.log(print)
	}

	// sets visit flag to false for every cell in grid
	#resetVisitFlag(){
		for(let cell of this.#grid){
			cell.visited = false;
		}
	}
}