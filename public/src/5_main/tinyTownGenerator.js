import Phaser from "../../lib/phaser.module.js"
export class TinyTownGenerator extends Phaser.Scene {
	ip = new ImageProcessor();
	cs = new ConstraintSolver();

	mapIndex = 1;
	N = 2;
	outputWidth = 24;
	outputHeight = 15;
	tileSize = 16;

	maxAttempts = 10;
	numRuns = 3;	// for this.getAverageRuntime() and autoExport()

	constructor() {
		super("tinyTownGeneratorScene");
	}

	preload() {
		this.load.setPath("./assets/");
		this.load.image("tilemap", "tinyTown_Tilemap_Packed.png");
		this.load.tilemapTiledJSON("tinyTownMap", `map${this.mapIndex}.tmj`);
	}

	create()
	{
		this.showInputImage();
		this.setupControls();
	}

	showInputImage() {
		this.multiLayerMap = this.add.tilemap("tinyTownMap", this.tileSize, this,this.tileSize, 40, 25);
		this.tileset = this.multiLayerMap.addTilesetImage("kenney-tiny-town", "tilemap");

		if (this.mapIndex === 1) {
			this.groundLayer = this.multiLayerMap.createLayer("Ground-n-Walkways", this.tileset, 0, 0);
			this.treesLayer = this.multiLayerMap.createLayer("Trees-n-Bushes", this.tileset, 0, 0);
			this.housesLayer = this.multiLayerMap.createLayer("Houses-n-Fences", this.tileset, 0, 0);
			this.multiLayerMapLayers = [this.groundLayer, this.treesLayer, this.housesLayer];
		}
		else {
			this.groundLayer = this.multiLayerMap.createLayer("Ground", this.tileset, 0, 0);
			this.structuresLayer = this.multiLayerMap.createLayer("Structures", this.tileset, 0, 0);
			this.multiLayerMapLayers = [this.groundLayer, this.structuresLayer];
		}
	}

	setupControls() {
		this.key_Run = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
		this.key_Clear = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.C);
		this.key_AvgRuntime = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.T);
		this.key_Export = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

		this.key_Run.on("down", () => this.generateMap());
		this.key_Clear.on("down", () => this.clear());
		this.key_AvgRuntime.on("down", () => this.getAverageRuntime(this.numRuns));
		this.key_Export.on("down", () => autoExport(this)); 

		document.getElementById("description").innerHTML = `
			<h2>Controls</h2>
			Run Generator: R <br>
			Clear Output: C <br>
			Get average runtime over ${this.numRuns} runs: T <br>
			Export ${this.numRuns} runs as png files: E
		`;
	}

	generateMap(exportMode = false){
		let patterns;
		let weights;
		let adjacencies;
		let generationWasSuccessful;
		let groundImage;
		let structuresImage;

		console.log("Processing ground");
		this.ip.process(IMAGES_GROUND, this.N);
		patterns = this.ip.patterns;
		weights = this.ip.weights
		adjacencies = this.ip.adjacencies;
		generationWasSuccessful = this.cs.solve(patterns, weights, adjacencies, this.outputWidth, this.outputHeight, this.maxAttempts);
		if (!generationWasSuccessful) return;
		groundImage = this.cs.output;

		console.log("Structures");
		this.ip.process(IMAGES_STRUCTURES, this.N);
		patterns = this.ip.patterns;
		weights = this.ip.weights
		adjacencies = this.ip.adjacencies;
		generationWasSuccessful = this.cs.solve(patterns, weights, adjacencies, this.outputWidth, this.outputHeight, this.maxAttempts);
		if (!generationWasSuccessful) return;
		structuresImage = this.cs.output;

		this.showImages(groundImage, structuresImage);

		// enables autoexporter to export world facts database
		if(exportMode){
			let wf = new WorldFactsDatabaseMaker(structuresImage, this.outputWidth, this.outputHeight, 2);
			return { worldFacts: wf };
		}
	}

	/**
	 * @param {number[][]} groundImage 
	 * @param {number[][]} structuresImage 
	 */
	showImages(groundImage, structuresImage) {
		if (this.groundMap) this.groundMap.destroy();
		if (this.structuresMap) this.structuresMap.destroy();

		this.groundMap = this.make.tilemap({
			data: groundImage,
			tileWidth: this.tileSize,
			tileHeight: this.tileSize
		});
		this.structuresMap = this.make.tilemap({
			data: structuresImage,
			tileWidth: this.tileSize,
			tileHeight: this.tileSize
		});
		
		this.groundMap.createLayer(0, this.tileset, 0, 0);
		this.structuresMap.createLayer(0, this.tileset, 0, 0);

		for (const layer of this.multiLayerMapLayers) layer.setVisible(false);
	}

	clear() {
		for (const layer of this.multiLayerMapLayers) layer.setVisible(true);
		if (this.groundMap) this.groundMap.destroy();
		if (this.structuresMap) this.structuresMap.destroy();
	}

	getAverageRuntime(numRuns){
		let totalDuration = 0;

		for(let i = 1; i <= numRuns; i++){	// start i at 1 because we'll be console logging the run number
			const start = performance.now();

			this.generateMap();

			const end = performance.now();
			const duration = end - start;
			totalDuration += duration;

			console.log(`Generation #${i} took ${duration.toFixed(2)} ms`)
		}
		
		console.log(`Generating ${numRuns} maps took ${totalDuration.toFixed(2)} ms total for an average time of ${(totalDuration / numRuns).toFixed(2)} ms`)
	}
}
