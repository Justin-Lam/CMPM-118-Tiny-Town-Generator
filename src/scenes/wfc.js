class WFC // extends Phaser.Scene
{
	constructor(ip, size) {
		//super("wfcScene");
		this.ip = ip;
		this.size = size;

		if(this.init()){
			console.log("WFC finished!");
			console.log(this.grid);
			console.log(this.patternAdjs);
			this.printGrid();	// print pattern choices in console
		}
	}

	init(){
		console.log("initializing WFC...");

		// initialize cell grid 
		// each cell of the grid represents an N x N subset
		this.patternOptions = Array.from({ length: this.ip.patterns.length }, (_, i) => i);
		this.grid = this.initGrid(this.size, this.patternOptions);

		// reorganize this.ip.adjacencies by pattern and direction
		//		makes something like:
		//		[ 0: {up: [...], down: [...] }, 1: { down: [...], right: [...] } ]
		this.patternAdjs = this.adbjByPattern(this.patternOptions);

		this.collapsed = this.initGrid(this.size);	// empty grid to track collapsed cells
		this.uncollapsed = [...this.grid];			// copy of this.grid to help with observe phase

		let cont = true;
		while(this.uncollapsed.length > 0){
			cont = this.run();
			if(!cont) this.init();
		}

		return true;
	}

	initGrid(size, options) {
		let result = [];

		for(let y = 0; y < size; y++){
			for(let x = 0; x < size; x++){
				let index = (y * size) + x;
				if(!options){ 
					result[index] = null;
				} else {
					result[index] = { 
						x: x, y: y,
						collapsed: false,
						visited: false,		// flag for propagation
						options: options,	// init every cell with all possible options
						neighbors: {		// indeces of neighboring cells
							up:		(y > 0) 		? ((y - 1) * size) + x : null,
							down:	(y < size - 1) 	? ((y + 1) * size) + x : null,
							left:	(x > 0) 		? (y * size) + (x - 1) : null,
							right:	(x < size - 1) 	? (y * size) + (x + 1) : null
						}
					};	
				}	
			}
		}

		return result;
	}

	run(){
		let observed = this.observe();

		// pick one option of cell's options
		let pick = this.randomIndex(observed.cell.options);
		observed.cell.options = [observed.cell.options[pick]];

		this.resetVisitFlag();
		return this.propagate(observed);
	}

	// TODO: get minimun entropy
	observe(){
		let pickIndex = this.randomIndex(this.uncollapsed);
		let cell = this.uncollapsed[pickIndex];
		cell.collapsed = true;								// collapse cell

		let originalIndex = (cell.y * this.size) + cell.x;	// get cell's original index
		this.grid[originalIndex].collapsed = true;			// update grid
		this.collapsed[originalIndex] = cell;				// move cell to collapses
		this.uncollapsed.splice(pickIndex, 1);				// remove cell from uncollapsed
		return {cell: cell, index: originalIndex };
	}

	// TODO: debug; propagate fails every time :(
	//		could try backtrack instead of restart
	//		or make sure that whatever choice the startCell had cannot be chosen again for that cell
	propagate(observed){
		let startCell = observed.cell;

		const stack = [startCell]; 
		while (stack.length > 0) {
			const cell = stack.pop();

			// update all of cell's neighbors
			for(let dir in cell.neighbors){
				let neighborAddress = cell.neighbors[dir];
				if(neighborAddress === null){ continue; }	// cell doesnt have a neighbor in this direction
				
				let neighbor = this.grid[neighborAddress]; 
				//if(neighbor.collapsed === true){ continue; }
				if(neighbor.visited === true){ continue; }
				neighbor.visited = true;

				// NEW VERSION: writes valid options to neighbor.options
				// issue -- outputting a grid with invalid adjacencies
				//		 - technically though the adjacencies would be valid with rotation
				// left neighbor's options == cell tile's left adjacencies, etc
				let valid = new Set();	// set to prevent duplication
				for(let cellOption of cell.options){
					let pAdj = this.patternAdjs[cellOption][dir];	// the adjacencies for this pattern (cellOption)
					if(!pAdj) continue;								// pattern has no adjacencies in this direction
					for(let adj of pAdj){	
						valid.add(adj);	
					}
				}
				// find which of neighbor's options are still valid
				// issue -- if i comment the following two lines out, it works but WFC outputs
				//				a grid with invalid adjacencies present
				//		 -- if i leave it, sometimes gets the error that there are too many recursions
				//		  - also still seems to output invalid adjs :(
				let newOptions = valid.intersection(new Set(neighbor.options));
				neighbor.options = [...newOptions];

				/*
				// OLD VERSION: deletes invalid options
				// cull invalid options from neighbor.options
				let cull = [];
				for(let cellOption of cell.options){
					let filterDir;
					switch(dir){
						// if neighbor is cell's up, then neighbor's options must all have
						//		cell as a valid down, etc...
						case "up": filterDir = "down"; break;
						case "down": filterDir = "up"; break;
						case "left": filterDir = "right"; break;
						case "right": filterDir = "left"; break;
					}
					//cull = cull.concat(this.cullOptions(cellOption, filterDir, neighbor));

				}
				*/

				/*
				// remove cull elements from neighbor.options
				let len = neighbor.options.length;
				for(let i = len - 1; i >= 0; i--){
					let neighborOption = neighbor.options[i];
					if(cull.includes(neighborOption)){
						neighbor.options.splice(i, 1);
					}
				}
				*/

				if(neighbor.options.length === 0){
					// deadlock -- start over
					// TODO: write backtrack or restart mechanism
					return false;
				}

				if(neighbor.options.length === 1){
					neighbor.collapsed = true;

					// add to collapsed array
					this.collapsed[(neighbor.y * this.size) + neighbor.x] = neighbor;

					// remove neighbor from this.uncollapsed
					for(let i = 0; i < this.uncollapsed.length; i++){
						if(this.uncollapsed[i].x === neighbor.x && this.uncollapsed[i].y === neighbor.y){
							this.uncollapsed.splice(i, 1);
							break;
						}
					}

					continue;
				}

				// IFF neighbor has less options than it started with, add it to stack
				//		for the changes to be propagated
				if(neighbor.options.length < this.patternOptions.length){
					stack.push(neighbor);
				} 
			}
		}
		
		console.log("propagated")
		this.printGrid();
		return true; // no deadlocks detected
	}
	
	randomIndex(arr){
		let max = arr.length;
		let pick = Math.floor(Math.random() * max);

		return pick;
	}

	// sorts ip adjacencies by pattern and direction
	adbjByPattern(patterns){
		let result = [];
		for(let p of patterns){
			let pAdj = {};
			for(let dir in DIRECTIONS){
				let dirOptions = [];
				let found = false;
				for(let adj of this.ip.adjacencies){	
					if(adj[0] === p && `${adj[2]}` === dir){
						dirOptions.push(adj[1]);
						found = true;
					}	
				}
				if(found) pAdj[this.dirStr(dir)] = dirOptions;
			}
			result.push(pAdj)
		}
		return result;
	}

	// dir = 0, 1, 2, 3	--> [ 0,    1,    2,     3]
	// const DIRECTIONS = 	[UP, DOWN, LEFT, RIGHT];
	// convert dir from int to string (mostly for easier debugging)
	dirStr(dir){
		switch(dir){
			case "0": return "up"	
			case "1": return "down"	
			case "2": return "left"	
			case "3": return "right"
		}
	}

	cullOptions(cellOption, dir, neighbor){
		let cull = [];
		// remove any neighbor option that doesnt have cell option as a lower
		for(let neighborOption of neighbor.options){
			let optAdj = this.patternAdjs[neighborOption];
			
			// if optAdj doesnt have a down option, cull neighborOption from neighbor.options
			if(!(dir in optAdj)){ 
				cull.push(neighborOption);
				continue;
			} else {
			// optAdj does have a down option, but cellOption isn't
			// 		one of them, cull neighborOption from neighbor.options
				if(!optAdj[dir].includes(cellOption)){
					cull.push(neighborOption);
					continue;
				}

			}
		}
		return cull;
	}


	// DEBUG HELPER
	printGrid(){
		let print = "";

		for(let y = 0; y < this.size; y++){
			for(let x = 0; x < this.size; x++){
				let index = (y * this.size) + x;
				let str = `${this.grid[index].options[0]}`;
				print += str.padEnd(4);		// a minor TODO: change 4 to a variable
			}
			print += `\n`
		}
		
		console.log(print)
	}

	resetVisitFlag(){
		for(let cell of this.grid){
			cell.visited = false;
		}
	}

}