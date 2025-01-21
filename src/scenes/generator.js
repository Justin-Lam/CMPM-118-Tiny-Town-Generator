class Generator extends Phaser.Scene
{
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
				Maybe consider running it on the ground layer too? It's just going to be various grasses though

			6. Display the ground and structures layer and take a screenshot

			7. Store the screenshot, ground and structures layer, and world facts database together
		*/
	}
}