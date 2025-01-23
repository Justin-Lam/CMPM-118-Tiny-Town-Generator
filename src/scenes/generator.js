class Generator extends Phaser.Scene
{
	ip = new ImageProcessor();
	outputSize = 5;
	N = 2;
	structRange = 2;

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
		this.multiLayerMap = this.add.tilemap("three-farmhouses", 16, 16, 25, 40);

		// generate stuff
		this.generateKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
		this.generateKey.on("down", () => {
			// generate stuff
			console.log("generating map");

			// Run wfc on the ground matrix using the image processor and the constraint solver
			// Turn the outputted image into a new ground layer
			//this.ip.process(PATHFINDER_GROUND, this.N); // img processor
			//console.log(this.ip);
			//this.groundLayer = new WFC(this.ip, this.outputSize).generated;
			//this.showImage(this.groundLayer);

			// Run wfc on the structures matrix using the image processor and the constraint solver
			// Turn the outputted image into a new structures layer
			this.ip.process(PATHFINDER_STRUCTURES, this.N); // img processor
			console.log(this.ip);
			this.structuresLayer = new WFC(this.ip, this.outputSize).generated;
			this.showImage(this.structuresLayer);

			// Run wfdm on the structures layer (UNCOMMENT AND EDIT LINE BELOW WHEN STRUCTURES ARRAY IS IMPLEMENTED)
			this.wm = new Wfdm(this.structuresLayer, 5, 5, this.structRange);
			this.wm.printWorldFacts();
			this.paragraphDescription = this.wm.getDescriptionParagraph();
			console.log(this.paragraphDescription);
		});
		// Display the ground and structures layer and take a screenshot

		// Store the screenshot, ground and structures layer, and world facts database together
	}

	showImage(image) {
		if (this.imageMap) {
			this.imageMap.destroy();
		}
		this.imageMap = this.make.tilemap({
			data: image,
			tileWidth: 16,
			tileHeight: 16
		});
		if (!this.tileset) {
			this.tileset = this.multiLayerMap.addTilesetImage("kenney-tiny-town", "tilemap_tiles");
		}
		this.imageMap.createLayer(0, this.tileset, 0, 0);
	}
}