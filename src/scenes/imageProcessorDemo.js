class WfcPatterns extends Phaser.Scene
{
	IMAGE1 = [
		[WATER,		WATER,		WATER],
		[SAND_C,	SAND_C,		WATER],
		[GRASS_C,	GRASS_C,	SAND_C]
	];
	IMAGE2 = [
		[WATER,		WATER,		WATER,		WATER],
		[SAND_C,	SAND_C,		WATER,		WATER],
		[GRASS_C,	GRASS_C,	SAND_C,		WATER],
		[GRASS_C,	GRASS_C,	SAND_C,		WATER]
	];

	IMAGES = [
		this.IMAGE1,
		this.IMAGE2
	];
	currentImageIndex = 0;
	N = 2;

	constructor() {
		super("wfcPatternsScene");
	}

	preload() {
		this.load.setPath("./assets/");
		this.load.image("tilemap_tiles", "tilemap_packed.png");						// packed tilemap
		this.load.tilemapTiledJSON("three-farmhouses", "three-farmhouses.tmj");		// tilemap in JSON
		this.load.image("map pack", "mapPack_spritesheet.png");
	}

	create()
	{
		const ip = new ImageProcessor();
		this.setupInput();
		const image = this.IMAGES[this.currentImageIndex];
		ip.process(image, this.N);
		console.log(ip);
		this.showImage(image);
	}

	setupInput() {
		this.prevImage_Key = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
		this.nextImage_Key = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
		this.decreaseN_Key = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
		this.increaseN_Key = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
		this.prevPattern_Key = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
		this.nextPattern_Key = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);

		this.prevImage_Key.on("down", () => this.changeImage(-1));
		this.nextImage_Key.on("down", () => this.changeImage(1));
		this.decreaseN_Key.on("down", () => this.changeN(-1));
		this.increaseN_Key.on("down", () => this.changeN(1));

		const controls = `
		<h2>Controls (open console recommended)</h2>
		Change Image: UP/DOWN <br>
		Change N: LEFT/RIGHT <br>
		Change Pattern: W/S
		`;
		document.getElementById("description").innerHTML = controls;
	}

	/** @param {number} d delta */
	changeImage(d) {
		const i = this.currentImageIndex;
		const len = this.IMAGES.length;
		const offset = len * (0 ** (d+1));	// map -1 to 1*len, 0 to 0
		this.currentImageIndex = (i + d + offset) % len;					// got formula from https://banjocode.com/post/javascript/iterate-array-with-modulo
		const image = this.IMAGES[this.currentImageIndex];
		this.showImage(image);
		console.log("Now viewing image " + (this.currentImageIndex + 1));	// didn't feel like doing 0 indexing
		this.potentiallyReduceN();
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
		const tileset = this.imageMap.addTilesetImage("map pack");
		this.imageMap.createLayer(0, tileset, 0, 0);
	}

	potentiallyReduceN() {
		const image = this.IMAGES[this.currentImageIndex];
		const h = image.length;
		const w = image[0].length;
		if (h < this.N || w < this.N) {
			this.N = Math.max(h, w);
			console.log("N has been reduced to " + this.N);
		}
	}

	/** @param {number} d delta */
	changeN(d) {
		if (this.N + d < 2) {
			console.log("N cannot be less than 2");
			return;
		}
		const image = this.IMAGES[this.currentImageIndex];
		if (this.N + d > Math.max(image.length, image[0].length)) {
			console.log("N cannot exceed image size");
			return;
		}
		this.N += d;
		console.log("N = " + this.N);
	}
}