import Phaser from "../../lib/phaser.module.js"
export class WaveFunctionCollapseDemo extends Phaser.Scene {
	// C = "center", BR = "bottom right", LM = "left middle", TL = "top left", etc.
	BLANK = 195;
	WATER = 56;

	GRASS_C = 40;
	GRASS_BR = 11;
	GRASS_BM = 25;
	GRASS_BL = 39;
	GRASS_TR = 41;
	GRASS_TM = 55;
	GRASS_TL = 69;
	GRASS_RM = 26;
	GRASS_LM = 54;

	SAND_C = 110;
	SAND_BR = 81;
	SAND_BM = 95;
	SAND_BL = 109;
	SAND_TR = 14;
	SAND_TM = 28;
	SAND_TL = 42;
	SAND_RM = 96;
	SAND_LM = 124;

	DIRT_C = 175;
	DIRT_BR = 146;
	DIRT_BM = 160;
	DIRT_BL = 174;
	DIRT_TR = 176;
	DIRT_TM = 190;
	DIRT_TL = 9;
	DIRT_RM = 161;
	DIRT_LM = 189;

	IMAGE1 = [
		[this.WATER,	this.WATER,		this.WATER,		this.WATER,		this.WATER,		this.WATER,		this.WATER,		this.WATER,		this.WATER,		this.WATER],
		[this.WATER,	this.WATER,		this.WATER,		this.WATER,		this.WATER,		this.WATER,		this.WATER,		this.WATER,		this.WATER,		this.WATER],
		[this.WATER,	this.WATER,		this.WATER,		this.WATER,		this.SAND_C,	this.SAND_C,	this.WATER,		this.WATER,		this.WATER,		this.WATER],
		[this.WATER,	this.WATER,		this.WATER,		this.WATER,		this.SAND_C,	this.SAND_C,	this.WATER,		this.WATER,		this.WATER,		this.WATER],
		[this.WATER,	this.WATER,		this.SAND_C,	this.SAND_C,	this.GRASS_C,	this.GRASS_C,	this.SAND_C,	this.SAND_C,	this.WATER,		this.WATER],
		[this.WATER,	this.WATER,		this.SAND_C,	this.SAND_C,	this.GRASS_C,	this.GRASS_C,	this.SAND_C,	this.SAND_C,	this.WATER,		this.WATER],
		[this.WATER,	this.WATER,		this.WATER,		this.WATER,		this.SAND_C,	this.SAND_C,	this.WATER,		this.WATER,		this.WATER,		this.WATER],
		[this.WATER,	this.WATER,		this.WATER,		this.WATER,		this.SAND_C,	this.SAND_C,	this.WATER,		this.WATER,		this.WATER,		this.WATER],
		[this.WATER,	this.WATER,		this.WATER,		this.WATER,		this.WATER,		this.WATER,		this.WATER,		this.WATER,		this.WATER,		this.WATER],
		[this.WATER,	this.WATER,		this.WATER,		this.WATER,		this.WATER,		this.WATER,		this.WATER,		this.WATER,		this.WATER,		this.WATER],
	];
	IMAGE2 = [
		[this.WATER,	this.WATER,		this.WATER,		this.WATER,		this.WATER,		this.WATER,		this.WATER,		this.WATER],
		[this.WATER,	this.WATER,		this.SAND_C,	this.SAND_C,	this.SAND_C,	this.SAND_C,	this.WATER,		this.WATER],
		[this.WATER,	this.SAND_C,	this.SAND_C,	this.GRASS_C,	this.GRASS_C,	this.SAND_C,	this.SAND_C,	this.WATER],
		[this.WATER,	this.SAND_C,	this.GRASS_C,	this.GRASS_C,	this.GRASS_C,	this.GRASS_C,	this.SAND_C,	this.WATER],
		[this.WATER,	this.SAND_C,	this.GRASS_C,	this.GRASS_C,	this.GRASS_C,	this.GRASS_C,	this.SAND_C,	this.WATER],
		[this.WATER,	this.SAND_C,	this.SAND_C,	this.GRASS_C,	this.GRASS_C,	this.SAND_C,	this.SAND_C,	this.WATER],
		[this.WATER,	this.WATER,		this.SAND_C,	this.SAND_C,	this.SAND_C,	this.SAND_C,	this.WATER,		this.WATER],
		[this.WATER,	this.WATER,		this.WATER,		this.WATER,		this.WATER,		this.WATER,		this.WATER,		this.WATER]
	];

	IMAGES = [
		this.IMAGE1,
		this.IMAGE2
	];

	ip = new ImageProcessor();
	currentImageIndex = 0;
	N = 2;

	cs = new ConstraintSolver();
	outputWidth = 10;
	outputHeight = 10;

	constructor() {
		super("waveFunctionCollapseDemoScene");
	}

	preload() {
		this.load.setPath("./assets/");
		this.load.image("map pack", "mapPack_spritesheet.png");
	}

	create()
	{
		this.setupControls();

		const image = this.IMAGES[this.currentImageIndex];
		this.ip.process(image, this.N);
		this.showImage(image);
		console.log(this.ip);
	}

	/** @param {number[][]} image */
	showImage(image) {
		if (this.imageMap) {
			this.imageMap.destroy();
		}
		this.imageMap = this.make.tilemap({
			data: image,
			tileWidth: 64,
			tileHeight: 64
		});
		if (!this.tileset) {
			this.tileset = this.imageMap.addTilesetImage("map pack");
		}
		this.imageMap.createLayer(0, this.tileset, 0, 0);
	}

	setupControls() {
		this.prevImage_Key = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
		this.nextImage_Key = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
		this.decreaseN_Key = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
		this.increaseN_Key = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
		this.runConstraintSolver_Key = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);

		this.prevImage_Key.on("down", () => this.changeImage(-1));
		this.nextImage_Key.on("down", () => this.changeImage(1));
		this.decreaseN_Key.on("down", () => this.changeN(-1));
		this.increaseN_Key.on("down", () => this.changeN(1));
		this.runConstraintSolver_Key.on("down", () => {
			const patterns = this.ip.patterns;
			const weights = this.ip.weights
			const adjacencies = this.ip.adjacencies;
			const result = this.cs.solve(patterns, weights, adjacencies, this.outputWidth, this.outputHeight);
			if (!result) {
				return;
			}
			const image = this.cs.output;
			this.showImage(image);
		});

		const controls = `
		<h2>Controls (open console recommended)</h2>
		Change Image: UP/DOWN <br>
		Change N: LEFT/RIGHT <br>
		Run Constraint Solver: R
		`;
		document.getElementById("description").innerHTML = controls;
	}

	/** @param {number} di delta index, must be -1 or 1 */
	changeImage(di) {
		const i = this.currentImageIndex;
		const len = this.IMAGES.length;
		this.currentImageIndex = (i + di + (di<0 ? len : 0)) % len;	// got formula from https://banjocode.com/post/javascript/iterate-array-with-modulo
		const reducedN = this.potentiallyReduceN();
		this.currentAdjacencyIndex = 0;

		const image = this.IMAGES[this.currentImageIndex];
		this.ip.process(image, this.N);
		this.showImage(image);

		console.log("Now viewing image " + (this.currentImageIndex + 1));	// didn't feel like doing 0 indexing
		if (reducedN) console.log("N has been reduced to " + this.N);
		console.log(this.ip);
	}

	/** @returns {boolean} whether N was reduced */
	potentiallyReduceN() {
		const image = this.IMAGES[this.currentImageIndex];
		const h = image.length;
		const w = image[0].length;
		if (h < this.N || w < this.N) {
			this.N = Math.max(h, w);
			return true;
		}
		return false;
	}

	/** @param {number} di delta index, must be -1 or 1 */
	changeN(di) {
		if (this.N + di < 2) {
			console.log("N cannot be less than 2");
			return;
		}

		const image = this.IMAGES[this.currentImageIndex];
		const h = image.length;
		const w = image[0].length;
		if (this.N + di > Math.max(h, w)) {
			console.log("N cannot exceed image size");
			return;
		}

		this.N += di;
		this.currentAdjacencyIndex = 0;

		this.ip.process(image, this.N);

		console.log("N = " + this.N);
		console.log(this.ip);
	}

	/** @param {number} di delta index, must be -1 or 1 */
	changeAdjacency(di) {
		if (this.ip.adjacencies.length === 0) {
			console.log("No adjacencies to view");
			return;
		}
		const i = this.currentAdjacencyIndex;
		const len = this.ip.adjacencies.length;
		this.currentAdjacencyIndex = (i + di + (di<0 ? len : 0)) % len;	// got formula from https://banjocode.com/post/javascript/iterate-array-with-modulo
		console.log("Now viewing adjacency " + (this.currentAdjacencyIndex + 1))	// didn't feel like doing 0 indexing
	}
}