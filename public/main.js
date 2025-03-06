import Phaser from "./lib/phaser.module.js";
import { TinyTownGenerator } from "./src/5_main/tinyTownGenerator.js";
import { wfdbBenchmarks } from "./src/4_demos/wfdbBenchmarks.js"

// debug with extreme prejudice
"use strict"

let config = {
	parent: 'phaser-game',
	type: Phaser.CANVAS,
	width: 640,
	height: 640,
	zoom: 1,
	autoCenter: true,
	render: {
		pixelArt: true	// prevent pixel art from getting blurred when scaled
	},
	scene: [wfdbBenchmarks]
}

window.game = new Phaser.Game(config);