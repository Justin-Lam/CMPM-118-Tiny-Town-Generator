/* TODO: 
    * clean up code and make more, bigger maps. 
    * code should allow multiple runs. 
    * maybe get an average runtime over a bunch of map sizes.
*/
import Phaser from "../../lib/phaser.module.js"
export class wfdbBenchmarks extends Phaser.Scene {
    constructor() {
        super("wfdbBenchmarksScene");
    }
    tileSize = 16;

    preload() {
        this.load.setPath("./assets/");
        this.load.image("tilemap", "tinyTown_Tilemap_Packed.png");
        this.load.tilemapTiledJSON("bigTownMap", "bigTown.tmj");
    }

    create() {
        let w = 80
        let h = 80

        this.showMap("bigTownMap", w, h);
        this.createSingleLayerMap(w, h)

        const start = performance.now();
        this.generateWFDB(w,h);
        const end = performance.now();
        const duration = end - start;

        console.log(`Generating a(n) (${w}, ${h}) WFDB took ${duration.toFixed(2)} ms`)
    }

    showMap(map_key, w, h){
        let w_scale = window.game.canvas.width / (this.tileSize * w);
        let h_scale = window.game.canvas.height / (this.tileSize * h);

        this.multiLayerMap = this.add.tilemap(map_key, this.tileSize, this, this.tileSize, w, h);
		this.tileset = this.multiLayerMap.addTilesetImage("kenney-tiny-town", "tilemap");

        let groundLayer = this.multiLayerMap.createLayer("ground", this.tileset, 0, 0);
        let treesLayer = this.multiLayerMap.createLayer("trees", this.tileset, 0, 0);
        let structuresLayer = this.multiLayerMap.createLayer("structures", this.tileset, 0, 0);
        let pathsLayer = this.multiLayerMap.createLayer("paths", this.tileset, 0, 0);

        this.multiLayerMapLayers = [ groundLayer, treesLayer, structuresLayer, pathsLayer ];

        // resize map to fit in view port
        for(let layer of this.multiLayerMapLayers){
            layer.setScale(w_scale, h_scale)
        }
    }

    // yoinked from WFDB Maker demo
    createSingleLayerMap(w, h) {
        let w_scale = window.game.canvas.width / (this.tileSize * w);
        let h_scale = window.game.canvas.height / (this.tileSize * h);
        
        // Initialize data
		this.singleLayerMapData = [];
		for (let y = 0; y < h; y++) {
			this.singleLayerMapData[y] = [];
		}

		// Populate data
		for (let y = 0; y < h; y++) {
			for (let x = 0; x < w; x++) {
				for(let L of this.multiLayerMapLayers){
                    let index = L.layer.data[y][x].index;
                    if(index > 0) this.singleLayerMapData[y][x] = L.layer.data[y][x].index;
                }
			}
		}

		this.singleLayerMap = this.make.tilemap({
			data: this.singleLayerMapData,
			tileWidth: this.TILE_SIZE,
			tileHeight: this.TILE_SIZE
		});
		this.combinedLayer = this.singleLayerMap.createLayer(0, this.tileset).setVisible(false);
        this.combinedLayer.setScale(w_scale, h_scale);
    }

    generateWFDB(w, h){
        let wf = new WorldFactsDatabaseMaker(this.singleLayerMapData, w, h, 2);
		wf.getWorldFacts();
		let description = wf.getDescriptionParagraph();
		//console.log(description);
        wf.printWorldFacts();
    }
}