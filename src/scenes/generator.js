class Generator extends Phaser.Scene
{
	ip = new ImageProcessor();

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
		this.map = this.add.tilemap("three-farmhouses", 16, 16, 25, 40);

        // Add a tileset to the map
        this.tileset = this.map.addTilesetImage("kenney-tiny-town", "tilemap_tiles");

        // Create the layers
        this.groundLayer = this.map.createLayer("Ground-n-Walkways", this.tileset, 0, 0);
        this.treesLayer = this.map.createLayer("Trees-n-Bushes", this.tileset, 0, 0);
        this.housesLayer = this.map.createLayer("Houses-n-Fences", this.tileset, 0, 0);

		// Run wfc on the ground matrix using the image processor and the constraint solver
			// Turn the outputted image into a new ground layer
		this.ip.process(PATHFINDER_GROUND, this.N);
		const groundMap = this.make.tilemap({
			data: // ground tileid array
			tileWidth: 16,
			tileHeight: 16,
		});
		this.groundLayer = this.map.createLayer("Ground-n-Walkways", this.tileset, 0, 0);

		// Run wfc on the structures matrix using the image processor and the constraint solver
			// Turn the outputted image into a new structures layer
		this.ip.process(PATHFINDER_STRUCTURES, this.N);
		const structuresMap = this.make.tilemap({
			data: // structure tileid array
			tileWidth: 16,
			tileHeight: 16,
		});
		this.structuresLayer = this.map.createLayer("Structures", this.tileset, 0, 0);
			
		// Run wfdm on the structures layer (UNCOMMENT AND EDIT LINE BELOW WHEN STRUCTURES ARRAY IS IMPLEMENTED)
		// this.wm = new Wfdm(structuresArray, mapWidth, mapHeight, structRange);

		// Display the ground and structures layer and take a screenshot

		// generate stuff
		this.generateKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
		this.generateKey.on("down", () => {
			// generate stuff
			console.log("generating map");
		});
		// Store the screenshot, ground and structures layer, and world facts database together
	}
}