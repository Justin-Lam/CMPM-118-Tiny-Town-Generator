class Wfc extends Phaser.Scene
{
	constructor() {
		super("wfcScene");
	}

	init(data) {
		this.ip = data.ip;
		this.tiles = [];
		this.grid = [];
		this.DIM = 10;
		this.drawn = Array(this.DIM * this.DIM).fill(null); // Initialize with nulls for all cells
		this.ready = false;
		this.brakes = false;
		this.done = false;
		//this.seed = 4532323321;
		this.choiceStack = [];
		this.rotationLog = [];
  
		this.landLayer = this.add.layer();
		this.layers = [this.landLayer];
	}
  
	create() {
		this.canvas = {width: config.width, height: config.height}
		this.w = this.canvas.width / this.DIM;
		this.h = this.canvas.height / this.DIM;
  
		//Reload key
		this.reload = this.input.keyboard.addKey('R');
  
		this.startTime = performance.now();
  
		//this.ready = this.makeTilesArray("map-test");
		// get unique tiles
		let tileSet = new Set();
		for(let i = 0; i < this.ip.patterns.length; i++){
			for(let j = 0; j < this.ip.patterns[i].length; j++){
				for(let tile of this.ip.patterns[i][j]){
					tileSet.add(tile);
				}
			}
		}
		this.tilesTemp = [...tileSet];

		// tiles adjacencies
		this.tiles = [];
		for(let i = 0; i < this.tilesTemp.length; i++){
			let index = this.tilesTemp[i];
			this.tiles.push(
				new Tile(index, this.parseAdjacencies(index))
			);
		}

		this.startOver();
		this.ready = true;
	}

	update() {
		if (this.ready) {
			this.WFC();

			// Check if WFC is completed
			if (!this.ready) {
				// End timing for WFC and print total time
				const endTime = performance.now();
				console.log(`WFC completed in ${(endTime - this.startTime).toFixed(2)} ms`);
			}
		}
		if(this.brakes) { this.stopWFC() }

		if (Phaser.Input.Keyboard.JustDown(this.reload)){
			this.clearGrid();
			this.startTime = performance.now();
		}

		// if this.done, then draw wfc() output
		if(this.done){ 
			this.drawOnLayer(this.landLayer, this.drawn, this.rotationLog); 
		}
	}

	// take adjacencies from this.ip to define u, d, l, r neighbors for tile at index
	parseAdjacencies(index){
		let ip = this.ip;
		let adjacencies = {
			up: [],
			down: [],
			left: [],
			right: []
		};
	
		for (let [tileA, tileB, direction] of ip.adjacencies) {
			//console.log(this.tilesTemp[tileA], index)
			if (this.tilesTemp[tileA] === index && this.tilesTemp[tileB]) {
				if (direction[0] === 0 && direction[1] === -1) {
					adjacencies.left.push(this.tilesTemp[tileB]);
				} else if (direction[0] === 0 && direction[1] === 1) {
					adjacencies.right.push(this.tilesTemp[tileB]);
				} else if (direction[0] === -1 && direction[1] === 0) {
					adjacencies.up.push(this.tilesTemp[tileB]);
				} else if (direction[0] === 1 && direction[1] === 0) {
					adjacencies.down.push(this.tilesTemp[tileB]);
				}
			}
		}

		for(let dir in adjacencies){
			if(adjacencies[dir].length === 0){
				adjacencies[dir] = null;
			}
		}
	
		return adjacencies;
	}	
	

	startOver() {
		// Create cell for each spot on the grid
		for (let i = 0; i < this.DIM * this.DIM; i++) {
			this.grid[i] = new Cell(i, this.tiles, this.tileWeights);
		}
	}

	// Linear Congruential Generator based on values from Knuth and H. W. Lewis  
	seededRandom(seed) {
		let m = 2 ** 32; 
		let a = 1664525; 
		let c = 1013904223; 
		seed = (a * seed + c) % m; // Update the seed
		return {
			seed: seed,
			value: seed / m 
		};
	}
  
	// Updated getRandomWithSeed to maintain seeding
	getRandomWithSeed(array, seed) {
		if (!seed) {
			seed = this.seed || Math.random() * 10133204323;
		}

		let { seed: newSeed, value: randomValue } = this.seededRandom(seed);

		// Update the seed for the next call
		this.seed = newSeed;

		const randomIndex = Math.floor(randomValue * array.length);
		return array[randomIndex];
	}
  
	checkValid(arr, valid) {
		//console.log(arr, valid);
		for (let i = arr.length - 1; i >= 0; i--) {
			// VALID: [BLANK, RIGHT]
			// ARR: [BLANK, UP, RIGHT, DOWN, LEFT]
			// result in removing UP, DOWN, LEFT
			let element = arr[i];
			// console.log(element, valid.includes(element));
			if (!valid.includes(element)) {
			arr.splice(i, 1);
			}
		}
	}
  
	stopWFC() {
		if (this.drawn) {
			for (let d of this.drawn) {
				if (d) d.destroy();
			}
		}
		this.tiles = [];
		this.grid = [];
		this.drawn = [];
		this.rotationLog = [];
		this.ready = false;
		this.brakes = false;
  
		this.layers.forEach(layer => layer.removeAll());
	}
  
	WFC() {
		// Draw only cells that need updating
		for (let j = 0; j < this.DIM; j++) {
			for (let i = 0; i < this.DIM; i++) {
				let xPos = i * this.w + this.w / 2;
				let yPos = j * this.h + this.h / 2;
				let cell = this.grid[i + j * this.DIM];
				if (cell && cell.collapsed && !this.drawn[i + j * this.DIM]) {
					let index = cell.options[0];
					if (this.tiles[index]) {
						this.drawn[i + j * this.DIM] = { x: xPos, y: yPos, img: this.tiles[index].img, isBlank: this.tiles[index].isBlank };
						this.rotationLog[i + j * this.DIM] = this.tiles[index].rotateFlag;
					}
				}
			}
		}
	
		// Get cells with the least entropy
		let minEntropy = Infinity;
		let minEntropyCells = [];
		for (let cell of this.grid) {
			if (!cell.collapsed) {
				const entropy = cell.options.length;
				if (entropy < minEntropy) {
					minEntropy = entropy;
					minEntropyCells = [cell];
				} else if (entropy === minEntropy) {
					minEntropyCells.push(cell);
				}
			}
		}
	
		// If all cells are collapsed, exit
		if (minEntropyCells.length === 0) {
			//this.handleRotation(); // found that it works best to do this after solving so we don't have to worry about backtracking
			this.ready = false;
			this.done = true;
			return;
		}
	
		// Collapse a random cell with minimum entropy
		const cell = this.getRandomWithSeed(minEntropyCells,this.seed);
		cell.collapsed = true;
  
		// Save state before choice for backtracking
		this.choiceStack.push({
			cellIndex: cell.index,
			remainingOptions: [...cell.options]
		});
		
		const pick = this.getRandomWithSeed(cell.options, this.seed);
		if (pick === undefined) {
			this.backtrack();
			return;
		}
		cell.options = [pick];
		//console.log(cell.options)
	
		// Update neighbors based on adjacency rules, checking for deadlocks
		if (!this.propagate(cell)) {
			this.backtrack();  // Trigger backtracking if neighbors have no options
		}
		if(minEntropy == Infinity){
		  this.brakes = true;
		}
	}
	
	// Update neighbors and validate adjacency constraints, returns false if stuck
	propagate(startCell) {
		const stack = [startCell]; // Use a stack to process cells needing updates
	
		while (stack.length > 0) {
			const cell = stack.pop();
	
			if (!cell || !cell.collapsed) continue; // skip non-collapsed cells
	
			const selectedTile = cell.options[0];
	
			const directions = {
				up: { dx: 0, dy: -1 },
				down: { dx: 0, dy: 1 },
				left: { dx: -1, dy: 0 },
				right: { dx: 1, dy: 0 }
			};
	
			// look in every direction
			for (const [direction, { dx, dy }] of Object.entries(directions)) {
				const neighborX = (cell.index % this.DIM) + dx;
				const neighborY = Math.floor(cell.index / this.DIM) + dy;
	
				// skip if neighbor is out of bounds
				if (neighborX < 0 || neighborX >= this.DIM || neighborY < 0 || neighborY >= this.DIM) continue;
	
				const neighborIndex = neighborX + neighborY * this.DIM;
				const neighbor = this.grid[neighborIndex];
	
				if (!neighbor || neighbor.collapsed) continue; // skip collapsed neighbors
	
				// get valid tiles for the neighbor based on current cell's tile
				const validNeighborOptions = selectedTile.neighbors[direction];
				if (!validNeighborOptions) continue; // no constraints in this direction
	
				// remove invalid options from the neighbor's options
				let originalOptions = [];
				for(let opt of neighbor.options){
					originalOptions.push(opt.index);
				}
				this.checkValid(neighbor.options, validNeighborOptions);
	
				// If the neighbor's options changed, push it onto the stack for further updates
				if (neighbor.options.length < originalOptions.length) {
					if (neighbor.options.length === 0) {
						return false; // Deadlock detected, trigger backtracking
					} else if (neighbor.options.length === 1) {
						neighbor.collapsed = true; // Collapse the neighbor if only one option remains
					}
					stack.push(neighbor);
				}
			}
		}
	
		return true; // No deadlocks detected
	}
	
	
	// Improved backtracking mechanism
	backtrack() {
		if (this.choiceStack.length === 0) {
			this.clearGrid();  // Restart if no choices left to backtrack
			this.seed *= 2;
			return;
		}
	
		// Pop the last choice from the stack and undo it
		const lastChoice = this.choiceStack.pop();
		const { cellIndex, remainingOptions } = lastChoice;
		const cell = this.grid[cellIndex];
	
		remainingOptions.splice(remainingOptions.indexOf(cell.options[0]), 1);
		if (remainingOptions.length > 0) {
			cell.options = remainingOptions;
			cell.collapsed = false;  // Reopen the cell for processing
			this.choiceStack.push({ cellIndex, remainingOptions });  // Push updated choice back to stack
			// Update neighbors recursively to avoid deadlocks after each backtrack
			if (!this.propagate(cell)) {
				this.backtrack();
			}
		} else {
			this.backtrack();  // If no options, backtrack further
		}
	}
	
	clearGrid() {
		// Reset grid, drawn cells, and other states
		for (let i = 0; i < this.DIM * this.DIM; i++) {
			this.grid[i] = new Cell(i, this.tiles, this.tileWeights);
		}
		//this.drawn.forEach(d => { if (d) d.destroy(); });
		this.drawn = Array(this.DIM * this.DIM).fill(null);
		this.layers.forEach(layer => layer.removeAll());
		this.ready = true;  // Reset ready state
	}

	// rotate tiles properly
	handleRotation(layer){
		for (let j = 0; j < this.DIM; j++) {
			for (let i = 0; i < this.DIM; i++) {
				let index = i + j * this.DIM;
				let r = this.rotationLog[index];
				if(r) layer.getAt(index).setRotation((Math.PI / 2) * r);
			}
		}
	}
  
	getWeightedRandom(options) {
		let totalWeight = options.reduce((sum, index) => sum + this.tiles[index].weight, 0);
		let random = this.seededRandom(this.seed).value * totalWeight;
	
		for (let i = 0; i < options.length; i++) {
			const optionIndex = options[i];
			const weight = this.tiles[optionIndex].weight;
			if (random < weight) {
				// Update the seed state
				let { seed: newSeed } = this.seededRandom(this.seed);
				this.seed = newSeed;
				return optionIndex;
			}
			random -= weight;
		}
	
		return undefined; // If no option matches, return undefined for backtracking
	}
  
	  drawOnLayer(layer, image, rotations){
		for (let j = 0; j < this.DIM; j++) {
			for (let i = 0; i < this.DIM; i++) {
				let r = this.rotationLog[i + j * this.DIM];
				let index = i + j * this.DIM;
				let imageSprite = this.add.sprite(
					image[index].x, 
					image[index].y, 
					image[index].img);
				imageSprite.setScale(this.w / imageSprite.width, this.h / imageSprite.height);
				imageSprite.isBlank = image[index].isBlank;
				layer.addAt(imageSprite, index);
			}
		}

		if(rotations) this.handleRotation(layer, rotations);
		this.done = false;
	}
}