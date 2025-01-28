// debug with extreme prejudice
"use strict"

let config = {
	parent: 'phaser-game',
	type: Phaser.CANVAS,
	width: 1280,
	height: 800,
	zoom: 1,
	autoCenter: true,
	render: {
		pixelArt: true	// prevent pixel art from getting blurred when scaled
	},
	scene: [structureGeneration]
}

window.game = new Phaser.Game(config);