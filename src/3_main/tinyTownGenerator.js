class TinyTownGenerator extends Phaser.Scene {
	ip = new ImageProcessor();
	N = 2;

	cs = new ConstraintSolver_Justin();
	outputWidth = 20;
	outputHeight = 15;

	constructor() {
		super("tinyTownGeneratorScene");
	}

	preload() {
		this.load.setPath("./assets/");
		this.load.image("tilemap_tiles", "tilemap_packed.png");
		this.load.tilemapTiledJSON("tinyTownMap", "tinyTownMap2.tmj");
	}

	create()
	{
		this.setupControls();
		this.showInputImage();

		this.ip.process(MAP1_GROUND, 2);
		console.log(this.ip);
	}

	showInputImage() {
		this.multiLayerMap = this.add.tilemap("tinyTownMap", 16, 16, 40, 25);
		this.tileset = this.multiLayerMap.addTilesetImage("kenney-tiny-town", "tilemap_tiles");
		this.groundLayer = this.multiLayerMap.createLayer("Ground", this.tileset, 0, 0);
		this.structuresLayer = this.multiLayerMap.createLayer("Structures", this.tileset, 0, 0);
		//this.housesLayer = this.multiLayerMap.createLayer("Houses-n-Fences", this.tileset, 0, 0);
		this.multiLayerMapLayers = [this.groundLayer, this.structuresLayer, /*this.housesLayer*/];
	}

	setupControls() {
		this.runWFC_Key = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
		this.clear_Key = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.C);

		this.runWFC_Key.on("down", () => {
			let patterns;
			let weights;
			let adjacencies;
			let result;

			this.ip.process(MAP1_GROUND, this.N);
			console.log("Ground");
			console.log(this.ip);
			patterns = this.ip.patterns;
			weights = this.ip.weights
			adjacencies = this.ip.adjacencies;
			result = this.cs.solve(patterns, weights, adjacencies, this.outputWidth, this.outputHeight);
			if (!result) {
				return;
			}
			let groundImage = this.cs.output;

			this.ip.process(MAP3_STRUCTURES, this.N);
			console.log("Structures");
			console.log(this.ip);
			patterns = this.ip.patterns;
			weights = this.ip.weights
			adjacencies = this.ip.adjacencies;
			result = this.cs.solve(patterns, weights, adjacencies, this.outputWidth, this.outputHeight);
			if (!result) {
				return;
			}
			let structuresImage = this.cs.output;

			this.showImages(groundImage, structuresImage);
		});

		this.clear_Key.on("down", () => {
			for (const layer of this.multiLayerMapLayers) {
				layer.setVisible(true);
			}
			if (this.groundMap) {
				this.groundMap.destroy();
			}
			if (this.structuresMap) {
				this.structuresMap.destroy();
			}
		});

		const controls = `
		<h2>Controls (open console recommended)</h2>
		Run WFC: R <br>
		Clear Output: C
		`;
		document.getElementById("description").innerHTML = controls;
	}

	/**
	 * @param {number[][]} groundImage 
	 * @param {number[][]} structuresImage 
	 */
	showImages(groundImage, structuresImage) {
		if (this.groundMap) {
			this.groundMap.destroy();
		}
		if (this.structuresMap) {
			this.structuresMap.destroy();
		}

		this.groundMap = this.make.tilemap({
			data: groundImage,
			tileWidth: 16,
			tileHeight: 16
		});
		this.structuresMap = this.make.tilemap({
			data: structuresImage,
			tileWidth: 16,
			tileHeight: 16
		});


		for (const layer of this.multiLayerMapLayers) {
			layer.setVisible(false);
		}

		this.groundMap.createLayer(0, this.tileset, 0, 0);
		this.structuresMap.createLayer(0, this.tileset, 0, 0);
	}
}