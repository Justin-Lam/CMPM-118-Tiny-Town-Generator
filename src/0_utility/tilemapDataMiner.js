/*
	Used to extract the tileID matrices from a tilemap's layers
*/
class TilemapDataMiner extends Phaser.Scene
{
	GRASSY_TILES = [1, 2, 3];
	INPUT_TILE_WIDTH = 16;
	INPUT_MAP_HEIGHT = 25;
	INPUT_MAP_WIDTH = 40;

	constructor() {
		super("tilemapDataMinerScene");
	}

	preload() {
		this.load.setPath("./assets/");
		this.load.image("tilemap_tiles", "tilemap_packed.png");
		this.load.tilemapTiledJSON("three-farmhouses", "three-farmhouses.tmj");
	}

	create()
	{
		// ENTER DATA HERE
		const key = "three-farmhouses";
		const width = 40;
		const height = 25;
		const layerNames = [
			"Ground-n-Walkways",
			"Trees-n-Bushes",
			"Houses-n-Fences"
		];

		this.createTilemap(key, width, height, layerNames);
		// getGroundAndStructuresData
		// printMatrix(this.groundData);
		// printMatrix(this.structuresData);

		/*
		this.inputGroundMatrix;
		let nonGrassyTiles = this.getGroundMatrix();
		console.log(this.inputGroundMatrix);

		this.inputStructuresMatrix;
		this.getStructuresMatrix(nonGrassyTiles);
		console.log(this.inputStructuresMatrix);

		this.matrixVisualization();
		this.printMatrix(this.inputGroundMatrix);
		this.printMatrix(this.inputStructuresMatrix);
		*/
	}

	/**
	 * @param {string} key 
	 * @param {number} width 
	 * @param {number} height
	 * @param {string[]} layerNames
	 */
	createTilemap(key, width, height, layerNames) {
		this.tilemap = this.add.tilemap(key, 16, 16, width, height);
		this.tileset = this.tilemap.addTilesetImage("tinyTown", "tilemap_tiles");
		this.layers = [];
		for (const name of layerNames) {
			this.layers.push(this.tilemap.createLayer(name, this.tileset, 0, 0));
		}
	}

	/*
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

	printMatrix(matrix) {
		let matrixString = "[\n";
		for (let y = 0; y < this.INPUT_MAP_HEIGHT; y++) {
			matrixString += "["
			for (let x = 0; x < this.INPUT_MAP_WIDTH; x++) {
				matrixString = matrixString + matrix[y][x] + ","
			}
			matrixString += "],\n"
		}
		matrixString += "]"
		console.log(matrixString);
	}
	*/
}