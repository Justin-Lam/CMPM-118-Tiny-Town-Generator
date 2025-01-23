class Generator extends Phaser.Scene
{
	GRASSY_TILES = [1, 2, 3];
	INPUT_TILE_WIDTH = 16;
	INPUT_MAP_HEIGHT = 25;
	INPUT_MAP_WIDTH = 40;
	constructor() {
		super("generatorScene");
	}

	preload() {
		this.load.setPath("./assets/");
		this.load.image("tilemap_tiles", "tilemap_packed.png");						// packed tilemap
		this.load.tilemapTiledJSON("three-farmhouses", "three-farmhouses.tmj");		// tilemap in JSON
	}

	create()
	{
		this.getInputMap();
		/*
			1. Get the matrix for the "Ground-n-Walkways" layer
				Since this layer contains some tiles that aren't grassy (1s, 2s, or 3s), convert them into grassy tiles
			2. Get the matrix for the "Houses-n-Fences" + "Trees-n-Bushes" layers
				Move the tiles that weren't grassy from the Ground-n-Walkways" layer into here as well (such as paths)
		*/
		this.inputGroundMatrix;
		let nonGrassyTiles = this.getGroundMatrix();
		console.log(this.inputGroundMatrix);

		this.inputStructuresMatrix;
		this.getStructuresMatrix(nonGrassyTiles);
		console.log(this.inputStructuresMatrix);

		this.matrixVisualization();
		/*
			1. Get the matrix for the "Ground-n-Walkways" layer
				Since this layer contains some tiles that aren't grassy (1s, 2s, or 3s), convert them into grassy tiles
				
			2. Get the matrix for the "Houses-n-Fences" + "Trees-n-Bushes" layers
				Move the tiles that weren't grassy from the Ground-n-Walkways" layer into here as well (such as paths)

			3. Run wfc on the ground matrix using the image processor and the constraint solver
				Turn the outputted image into a new ground layer

			4. Run wfc on the structures matrix using the image processor and the constraint solver
				Turn the outputted image into a new structures layer
			
			5. Run wfdm on the structures layer

			6. Display the ground and structures layer and take a screenshot

			7. Store the screenshot, ground and structures layer, and world facts database together
		*/
	}

	// Making the Pathfinder map to feed into WFC
	getInputMap() {
		// Create a new tilemap which uses 16x16 tiles, and is 40 tiles wide and 25 tiles tall
		this.multiLayerMap = this.add.tilemap("three-farmhouses", this.INPUT_TILE_WIDTH, this.INPUT_TILE_WIDTH, this.INPUT_MAP_HEIGHT, this.INPUT_MAP_WIDTH);

		// Add a tileset to the map
		this.tileset = this.multiLayerMap.addTilesetImage("kenney-tiny-town", "tilemap_tiles");

		// Create the layers
		this.groundLayer = this.multiLayerMap.createLayer("Ground-n-Walkways", this.tileset, 0, 0);
		this.treesLayer = this.multiLayerMap.createLayer("Trees-n-Bushes", this.tileset, 0, 0);
		this.housesLayer = this.multiLayerMap.createLayer("Houses-n-Fences", this.tileset, 0, 0);

		// Hide the layers
		this.groundLayer.setVisible(false);
        this.treesLayer.setVisible(false);
        this.housesLayer.setVisible(false);
	}

	getGroundMatrix() {
		let matrix = [];
		let nonGrassyTiles = [];

		for (let y = 0; y < this.INPUT_MAP_HEIGHT; y++) {
			matrix[y] = [];
			nonGrassyTiles[y] = [];
			for (let x = 0; x < this.INPUT_MAP_WIDTH; x++) {
				let tileIndex = this.groundLayer.layer.data[y][x].index;
				if (this.GRASSY_TILES.includes(tileIndex)) {
					matrix[y][x] = tileIndex;
				}
				else {
					nonGrassyTiles[y][x] = tileIndex;
					matrix[y][x] = 1;
				}
			}
		}

		this.inputGroundMatrix = matrix;
		return nonGrassyTiles;
	}

	getStructuresMatrix(nonGrassyTiles) {
		let matrix = [];

		for (let y = 0; y < this.INPUT_MAP_HEIGHT; y++) {
			matrix[y] = [];
			for (let x = 0; x < this.INPUT_MAP_WIDTH; x++) {
				matrix[y][x] = 0; // 0 = blank

				if (this.treesLayer.layer.data[y][x].index > 0) {
					matrix[y][x] = this.treesLayer.layer.data[y][x].index;
				}

				if (this.housesLayer.layer.data[y][x].index > 0) {
					matrix[y][x] = this.housesLayer.layer.data[y][x].index;
				}

				if (nonGrassyTiles[y][x] > 0) {
					matrix[y][x] = nonGrassyTiles[y][x];
				}
			}
		}

		this.inputStructuresMatrix = matrix;
	}

	matrixVisualization() { // For testing the get matrices functions
		const groundMap = this.make.tilemap({
			data: this.inputGroundMatrix,
			tileWidth: this.INPUT_TILE_WIDTH,
			tileHeight: this.INPUT_TILE_WIDTH
		});
		this.groundMapLayer = groundMap.createLayer(0, this.tileset, 0, 0);

		const structuresMap = this.make.tilemap({
			data: this.inputStructuresMatrix,
			tileWidth: this.INPUT_TILE_WIDTH,
			tileHeight: this.INPUT_TILE_WIDTH
		});
		this.structuresMapLayer = structuresMap.createLayer(0, this.tileset, 0, 0);
	}
}