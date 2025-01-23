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
		// Run wfc on the ground matrix using the image processor and the constraint solver
			// Turn the outputted image into a new ground layer

		// Run wfc on the structures matrix using the image processor and the constraint solver
			// Turn the outputted image into a new structures layer
			
		// Run wfdm on the structures layer

		// Display the ground and structures layer and take a screenshot

		// Store the screenshot, ground and structures layer, and world facts database together
	}
}