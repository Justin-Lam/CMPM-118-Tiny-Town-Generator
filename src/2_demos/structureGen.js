// try generating map structures sepatrately
class structureGeneration extends Phaser.Scene {
    BROWN_WINDOWS = [
        [88, -1, -1, 88, -1],
        [-1, -1, -1, -1, -1],
        [-1, 88, -1, 88, -1],
        [-1, -1, -1, -1, -1],
        [-1, -1, 88, 88, -1],
    ]
    
    FOREST1 = [
        [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
        [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
        [-1, -1, -1, -1, 4, -1, 4, -1, -1, -1],
        [-1, 3, -1, 3, 16, 4, 16, -1, -1, -1],
        [-1, 15, 3, 15, -1, 16, -1, -1, -1, -1],
        [-1, 4, 15, -1, -1, -1, -1, -1, -1, 28],
        [-1, 16, -1, -1, -1, -1, 27, -1, 28, -1],
        [-1, -1, -1, -1, -1, -1, -1, 27, -1, -1],
        [-1, -1, 4, -1, 3, -1, -1, -1, -1, -1],
        [-1, -1, 16, -1, 15, -1, -1, -1, -1, -1],
        [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
        [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    ]

    constructor() {
        super("structureGen");
    }

    preload() {
        this.load.setPath("./assets/");                                 
        this.load.image("town", "tilemap_packed.png");      
    }

    init() {
        this.FENCE1 = {
            top: {
                left: 44,
                mid: 45,
                right: 46,
            },
            bottom: {
                left: 68,
                mid: 45,
                right: 70,
            },
            left: 56,
            right: 58,
            gate: 69
        }

        this.GREY_ROOF = {
            top: [
                {tile: 49, weight: 0.5},
                {tile: 51, weight: 0.2},
            ],
            bottom: [
                {tile: 61, weight: 0.5},
                {tile: 63, weight: 0.3},
            ],
            left: [
                {tile: 48},
                {tile: 60},
            ],
            right: [
                {tile: 50},
                {tile: 62},
            ]
        };

        this.BROWN_BODY = {
            left: [ {tile: 72} ],
            right: [ {tile: 75} ],
            fill: [ {tile: 73} ],
            windows: [ {tile: 84, weight: 0.1} ],
            doors: [ {tile: 85, weight: 0.1}, ],
        };

        this.FOREST_EDGE_BAN = { // bans tiles from edges
            top: [15, 16],
            bottom: [3, 4],
            left: [],
            right: []
        }

        this.structureCursor = 0;
        this.STRUCTURES = [
            {name: "house", fill: this.BROWN_BODY, special: this.GREY_ROOF},
            {name: "forest", special: this.FOREST_EDGE_BAN},
            {name: "fence", fill: this.FENCE1},             
            {name: "path", fill: []},        
        ];
    }

    create() {
        console.log("Scene loaded");
        
        this.structure = this.STRUCTURES[this.structureCursor];

	    this.ip = new ImageProcessor();
        this.cs = new ConstraintSolver_Justin();

        this.inputHandler();
    }

    inputHandler(){
        // set structure to be built
        this.changeStructure_Key = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
		this.changeStructure_Key.on("down", () => { this.structure = this.changeStructure(-1); })
        this.changeStructure_Key = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
		this.changeStructure_Key.on("down", () => { this.structure = this.changeStructure(1); })

        // generate structure
        this.generateStructure_Key = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TAB);
		this.generateStructure_Key.on("down", () => {
            let build = this.callFunction(
                this.structure.name + "Builder", {
                    fill: this.structure.fill,
                    special: this.structure.special,
                });
            if(build){ this.draw(build); }
            else{ console.log("ERROR -- structure generation failed"); }
		});
    }

    changeStructure(dI){
        let i = this.structureCursor;
        let max = this.STRUCTURES.length-1;

        if(i === 0 && dI === -1){ i = max; }
        else if(i === max && dI === 1){ i = 0; }
        else{ i += dI; }

        this.structureCursor = i;
        console.log(`Now generating: ${this.STRUCTURES[i].name}`)
        return this.STRUCTURES[i];
    }

    callFunction(fcnName, args){    // helper to call functions by name, with args
        return this[fcnName](args);
    }

    draw(grid){
        if(this.map){ this.map.destroy(); }

        this.map = this.make.tilemap({
            data: grid,
            tileWidth: 16,
            tileHeight: 16
        });

        if(!this.tiles){ this.tiles = this.map.addTilesetImage("town"); }

        this.map.createLayer(0, this.tiles, 0, 0);
    }

    randomize(arr, m){
        let multiplier = m || 1;
        let ind = Math.floor(Math.random() * arr.length);
        let pick = arr[ind];
        let r = Math.random();
        while(pick.weight * multiplier < r){
            ind = Math.floor(Math.random() * arr.length);
            pick = arr[ind];
            r = Math.random();
        }

        return pick.tile;
    }

    // TODO: generate roof and edges with wfc ??
    // takes roof tiles as "special" arg
    houseBuilder(args){
        let {fill, special: roof} = args;
        console.log(args)
        let w = Math.floor(Math.random() * 8 + 3);
        let h = Math.floor(Math.random() * 8 + 3);
        let house = [];
        for(let y = 0; y < h; y++){ house[y] = []; }

        //* SPECIAL == ROOF *//
        for(let x = 1; x < w-1; x++){ 
            house[0][x] = this.randomize(roof.top); 
            house[1][x] = this.randomize(roof.bottom);
        }

        // roof edges
        house[0][0] = roof.left[0].tile;    // left
        house[1][0] = roof.left[1].tile;
        house[0][w-1] = roof.right[0].tile; // right
        house[1][w-1] = roof.right[1].tile;   
        
        //* BODY *//
        for(let y = 2; y < h; y++){
            house[y][0] = fill.left[0].tile;
            house[y][w-1] = fill.right[0].tile;
        }        

        //* FILL *//
        for(let y = 2; y < h; y++){
            for(let x = 1; x < w-1; x++){ 
                house[y][x] = fill.fill[0].tile;
            }
        }

        // add windows with WFC (nice output than noise or RNG)
        this.ip.process(this.BROWN_WINDOWS, 2);
        let {patterns, weights, adjacencies} = this.ip;
        let result = this.cs.solve(patterns, weights, adjacencies, w - 2, h - 2);   // shrink w and h to prevent windows on edges  

        let houseFill = [];
        if(result){ houseFill = this.cs.output } // TODO: error catching, just in case
        console.log(houseFill)
        for(let y = 2; y < h; y++){
            for(let x = 1; x < w-1; x++){ 
                let fillTile = houseFill[y-2][x-1];
                if(fillTile > -1) house[y][x] = fillTile;   // don't overwrite background tiles with empty space
            }
        }

        // add door(s) 
        // TODO -- this is just RNG right now. wfc might give better looking output
        let numDoors = Math.floor(Math.random() * w/3 + 1);
        console.log(numDoors)
        for(let n = 0; n < numDoors; n++){
            let x = Math.floor(Math.random() * (w-1))
            console.log(x)
            house[h-1][x] = fill.doors[0].tile;     
        }

        return house;
    }

    // WFC forest with edge culling
    forestBuilder(args){
        this.ip.process(this.FOREST1, 2);
        let {patterns, weights, adjacencies} = this.ip;
        let w = Math.floor(Math.random() * 8 + 3);
        let h = Math.floor(Math.random() * 8 + 3);
        let result = this.cs.solve(patterns, weights, adjacencies, w, h);   // shrink w and h to prevent windows on edges  
        
        let forest = [];
        if(result){ forest = this.cs.output; }

        //* BANNED CULLING *//
        // prevent edges from having cutoff trees
        //      TODO: update WFC to handle this?
        let banned = args.special;
        // cull banned from top and bottom
        for(let x = 0; x < w; x++){
            if(banned.top.includes(forest[0][x])){ forest[0][x] = -1; } 
            if(banned.bottom.includes(forest[h-1][x])){ forest[h-1][x] = -1; } 
        }
        // cull banned from left and right
        for(let y = 0; y < h; y++){
            if(banned.left.includes(forest[y][0])){ forest[y][0] = -1; }
            if(banned.right.includes(forest[y][w-1])){ forest[y][w-1] = -1; }
        }
        
        return forest;
    }

    // note: doing classic RNG here because our constraint solver isn't equipped to guarantee 
    //      that a structure is fully contained in a w x h area (i.e. it generated with cutoff edges, which doesnt work for this structure)
    //      TODO: could add a fill here for objects inside fenced-in area!
    //      could also try to incorporate z3 solving but this works pretty much the same (just uglier)
    fenceBuilder(args){
        let fill = args.fill;
        let w = Math.floor(Math.random() * 8 + 3);
        let h = Math.floor(Math.random() * 8 + 3);
        
        // build fence outline
        let fence = [];
        for(let y = 0; y < h; y++){
            fence[y] = new Array(w);
            if(y === 0){ fence[y].fill(fill.top.mid); }
            else if(y === h-1){ fence[y].fill(fill.bottom.mid); }
            else{ fence[y].fill(-1); }

            for(let x = 0; x < w; x++){
                if(y === 0){ 
                    if(x === 0){ fence[y][x] = fill.top.left; }
                    else if(x === w-1){ fence[y][x] = fill.top.right; }
                } else if(y === h-1){
                    if(x === 0){ fence[y][x] = fill.bottom.left; }
                    else if(x === w-1){ fence[y][x] = fill.bottom.right; }
                } else if(x === 0){
                    fence[y][x] = fill.left;
                } else if (x === w-1){
                    fence[y][x] = fill.right;
                }
            }
        }

        // randomly place gates
        let side = Math.floor(Math.random() * 3);
        let amount = Math.floor(Math.random() * (w / 4) + 1);
        let placeAt = [];
        for(let n = 0; n < amount; n++){
            let randomX =  Phaser.Math.Between(1, (w-2)); // not on corners
            placeAt.push(randomX);
        }

        switch(side){
            case 0: // top
                for(let index of placeAt){
                    fence[0][index] = fill.gate;
                }
                break;
            case 1: // bottom
                for(let index of placeAt){
                    fence[h-1][index] = fill.gate;
                }
                break;
            case 2: // both
                for(let index of placeAt){
                    let coinflip = Math.random();
                    if(coinflip < 0.5){ fence[0][index] = fill.gate; }
                    else{ fence[h-1][index] = fill.gate; }
                }
                break;
        }

        return fence;
    }

    pathBuilder(args){
        console.log("TODO -- build paths");
        return null;
    }

}
