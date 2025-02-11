import Phaser from "../../lib/phaser.module.js"
import ImageProcessor from "../3_classes/imageProcessor.js"
import ConstraintSolver from "../3_classes/constraintSolver.js"

export class TinyTownGenerator extends Phaser.Scene {
	ip = new ImageProcessor();
	cs = new ConstraintSolver();
	mapIndex = 1;
	N = 2;
	outputWidth = 24;
	outputHeight = 15;
	numRuns = 3;	// for this.getAverageRuntime() and this.getBatch()

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
		this.setupControls();
		this.showInputImage();
	}

	showInputImage() {
		this.multiLayerMap = this.add.tilemap("tinyTownMap", 16, 16, 40, 25);
		this.tileset = this.multiLayerMap.addTilesetImage("kenney-tiny-town", "tilemap");

		// Use the following for map2+:
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
		this.runWFC_Key = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
		this.clear_Key = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.C);
		this.timedRuns_Key = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.T);
		this.getBatch_Key = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.B);

		this.runWFC_Key.on("down", () => this.generateMap());
		this.timedRuns_Key.on("down", () => this.getAverageRuntime(this.numRuns));
		this.getBatch_Key.on("down", () => this.getBatch(this.numRuns));
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
		Clear Output: C <br>
		Get average runtime over ${this.numRuns} runs: T
		Import a batch of ${this.numRuns} runs: B
		`;
		document.getElementById("description").innerHTML = controls;
	}

	generateMap(){
		let patterns;
		let weights;
		let adjacencies;
		let generationWasSuccessful;

		console.log("Processing ground");
		this.ip.process(IMAGES_GROUND, this.N);
		patterns = this.ip.patterns;
		weights = this.ip.weights
		adjacencies = this.ip.adjacencies;
		generationWasSuccessful = this.cs.solve(patterns, weights, adjacencies, this.outputWidth, this.outputHeight);
		if (!generationWasSuccessful) return;
		const groundImage = this.cs.output;

		console.log("Structures");
		this.ip.process(IMAGES_STRUCTURES, this.N);
		patterns = this.ip.patterns;
		weights = this.ip.weights
		adjacencies = this.ip.adjacencies;
		generationWasSuccessful = this.cs.solve(patterns, weights, adjacencies, this.outputWidth, this.outputHeight);
		if (!generationWasSuccessful) return;
		const structuresImage = this.cs.output;

		this.showImages(groundImage, structuresImage);
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
		
		this.groundMap.createLayer(0, this.tileset, 0, 0);
		this.structuresMap.createLayer(0, this.tileset, 0, 0);

		for (const layer of this.multiLayerMapLayers) {
			layer.setVisible(false);
		}
	}	

	getAverageRuntime(numRuns){
		let timeStart = performance.now();
		let timeTotal = 0;
		for(let i = 1; i <= numRuns; i++){
			this.generateMap();

			let timeEnd = performance.now();
			let timeElapsed = timeEnd - timeStart;
			timeTotal += timeElapsed;

			console.log(`Generation #${i} took ${timeElapsed.toFixed(2)} ms`)

			timeStart = performance.now();
		}
		console.log(`Generating ${numRuns} maps took ${timeTotal.toFixed(2)} ms total for an average time of ${(timeTotal / numRuns).toFixed(2)} ms`)
	}

	async getBatch(numRuns){
		console.log("Generating batch...");

		let exports = [];
		for(let i = 1; i <= numRuns; i++){
			this.generateMap();

			let img = await fetch(window.game.canvas.toDataURL());
			exports.push(img.url);
		}
		console.log(exports)
		console.log("Batch ready for export!")
	}
}
