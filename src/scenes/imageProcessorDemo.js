class ImageProcessorDemo extends Phaser.Scene
{
	// Tile IDs
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
		[this.WATER,	this.WATER,		this.WATER],
		[this.SAND_C,	this.SAND_C,	this.WATER],
		[this.GRASS_C,	this.GRASS_C,	this.SAND_C]
	];

	IMAGE2 = [
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
	IMAGE3 = [
		[this.WATER,	this.WATER,		this.WATER,		this.WATER,		this.WATER,		this.WATER,		this.WATER,		this.WATER],
		[this.WATER,	this.WATER,		this.SAND_C,	this.SAND_C,	this.SAND_C,	this.SAND_C,	this.WATER,		this.WATER],
		[this.WATER,	this.SAND_C,	this.SAND_C,	this.GRASS_C,	this.GRASS_C,	this.SAND_C,	this.SAND_C,	this.WATER],
		[this.WATER,	this.SAND_C,	this.GRASS_C,	this.GRASS_C,	this.GRASS_C,	this.GRASS_C,	this.SAND_C,	this.WATER],
		[this.WATER,	this.SAND_C,	this.GRASS_C,	this.GRASS_C,	this.GRASS_C,	this.GRASS_C,	this.SAND_C,	this.WATER],
		[this.WATER,	this.SAND_C,	this.SAND_C,	this.GRASS_C,	this.GRASS_C,	this.SAND_C,	this.SAND_C,	this.WATER],
		[this.WATER,	this.WATER,		this.SAND_C,	this.SAND_C,	this.SAND_C,	this.SAND_C,	this.WATER,		this.WATER],
		[this.WATER,	this.WATER,		this.WATER,		this.WATER,		this.WATER,		this.WATER,		this.WATER,		this.WATER]
	];
	IMAGE3 = [
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
		this.IMAGE2,
		this.IMAGE3
	];

	TILES = [
		this.WATER,		this.SAND_C,		this.GRASS_C
	]
	ZOOM = 0.5;

	ip = new ImageProcessor();
	currentImageIndex = 0;
	N = 2;
	currentAdjacencyIndex = 0;
	outputSize = 5;	// this should be a multiple of N

	constructor() {
		super("imageProcessorDemoScene");
	}

	preload() {
		this.load.setPath("./assets/");
		this.load.image("map pack", "mapPack_spritesheet.png");
	}

	create()
	{
		this.setupInput();

		const image = this.IMAGES[this.currentImageIndex];
		this.ip.process(image, this.N);
		this.showImage(image);
		this.showAdjacency();
		console.log(this.ip);

		this.cameras.main.setZoom(this.ZOOM);
		this.cameras.main.setBounds(0, 0, 1280, 800);
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

	showAdjacency() {
		if (this.ip.adjacencies.length === 0) {
			if (this.pattern1Map) {
				this.pattern1Map.destroy();
			}
			if (this.pattern2Map) {
				this.pattern2Map.destroy();
			}
			return;
		}

		const adjacency = this.ip.adjacencies[this.currentAdjacencyIndex];
		const pattern1Index = adjacency[0];
		const pattern2Index = adjacency[1];
		const directionIndex = adjacency[2];
		const pattern1 = this.ip.patterns[pattern1Index];
		const pattern2 = this.ip.patterns[pattern2Index];
		const dir = DIRECTIONS[directionIndex];
		const dy = dir[0] * 200;
		const dx = dir[1] * 200;

		if (this.pattern2Map) {
			this.pattern2Map.destroy();
		}
		this.pattern2Map = this.make.tilemap({
			data: pattern2,
			tileWidth: 64,
			tileHeight: 64
		});
		this.pattern2Map.createLayer(0, this.tileset, 800, 300);

		if (this.pattern1Map) {
			this.pattern1Map.destroy();
		}
		this.pattern1Map = this.make.tilemap({
			data: pattern1,
			tileWidth: 64,
			tileHeight: 64
		});
		this.pattern1Map.createLayer(0, this.tileset, 800 + dx, 300 + dy);
	}

	setupInput() {
		this.prevImage_Key = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
		this.nextImage_Key = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
		this.decreaseN_Key = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
		this.increaseN_Key = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
		this.prevAdjacency_Key = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
		this.nextAdjacency_Key = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);

		this.prevImage_Key.on("down", () => this.changeImage(-1));
		this.nextImage_Key.on("down", () => this.changeImage(1));
		this.decreaseN_Key.on("down", () => this.changeN(-1));
		this.increaseN_Key.on("down", () => this.changeN(1));
		this.prevAdjacency_Key.on("down", () => this.changeAdjacency(-1));
		this.nextAdjacency_Key.on("down", () => this.changeAdjacency(1));

		this.wfc_Key = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TAB);
		this.wfc_Key.on("down", () => {
			new WFC(this.ip, this.outputSize)
		});

		const controls = `
		<h2>Controls (open console recommended)</h2>
		Change Image: UP/DOWN <br>
		Change N: LEFT/RIGHT <br>
		Change Adjacency: W/S
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
		this.showAdjacency();

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
		this.showAdjacency();

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
		this.showAdjacency();
		console.log("Now viewing adjacency " + (this.currentAdjacencyIndex + 1))	// didn't feel like doing 0 indexing
	}
}