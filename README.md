# Overview
This repository contains everything necessary to generate tilemaps for a Phaser scene. It has two main components: 
1. tilemap generator that uses [Wave Function Collapse](https://github.com/mxgmn/WaveFunctionCollapse?tab=readme-ov-file)
2. a knowledgebase generator (called the World Facts Database Maker) that parses generated tilemaps and provides descriptive information about them.

This tool was created with the intention of using the generated tilemaps and their associated knowledgebases to create datasets for training LLMs to better understand tilemaps.

## Usage
Clone this repo onto your device.
In your terminal, run:
1. `npm install` to get all Node dependencies.
2. `npm run watch` to launch the server. 
	> This command runs the sever with live reload for code editing. You can also run `npm start` to run the server without live reloads. 
3. Follow the link provided in your terminal, or go to `http://localhost:3000/` to see the webpage.

#### Exports
When exporting, .png and .txt files will be saved in `./public/exports`
> NOTE: any files in the exports folder will be overwritten when the export key is pressed.


## Assets
Tilesets sourced from Kenney Assets packs, [Tiny Town](https://kenney.nl/assets/tiny-town) and [Map Pack](https://kenney.nl/assets/map-pack)
	
### Input Maps
Map 1 ([Pathfinder map](https://github.com/JimWhiteheadUCSC/Pathfinder))
> When using this map as the sole input, outputs typically have fewer houses

Maps 2-4 created by Michelle by hand in Tiled
> Included for increased output variety

## Libraries
[Phaser](https://phaser.io/)

# WFC
## Overview
We've created a JavaScript implementation of Gumin's overlapping model, for generating Phaser tilemaps. We chose WFC as our method of tilemap generation so we could make natural-looking outputs.
\
\
Our implementation is made of two components:
1. the **image processor**, `imageProcessor.js`
2. the **constraint solver**, `constraintSolver.js`

These components are both classes with just one function that the caller needs to use. Each class then stores the results of their computations in public attributes.

There's a decent amount of documentation in the WFC code itself, so if you want more granular descriptions of the classes described below, you will probably find it in `constraintSolver.js` and `imageProcessor.js`.

#### Inputs
The diversity of content included in each input map has a direct impact on the diversity of outputs. If you want outputs to look balanced and natural, then be mindful of creating input maps that look balanced and natural (this is best achieved by including diverse content representations on each map, with a lot of different items and structures).
> NOTE: The WFC generator can learn from multiple inputs, more on this later.

#### Outputs
In general, our outputs currently struggle with paths and trees:
- Paths:
	- don't connect structures
	- over-represented

- Trees:
	- not grouped well; instead of condensed forests, trees are scattered loosely across the map

## Image Processor
Computes a tilemap layer's patterns and those patterns' weights and adjacencies. Differs from other overlapping model implementations in that it can take in (or learn from) multiple inputs.

### Notes
- Patterns, weights, and adjacencies are all implemented as parallel arrays
> (eg. patterns[0], weights[0], and adjacencies[0] all refer to pattern 0)
- Gets patterns and weights first
> *The two have to be gathered together because remove duplicate patterns, increasing the pattern's weight with every deletion*
- Then adjacencies are computed
> *Has to be after all unique patterns are found because we need to compare each pattern to every other one (in all 4 directions)*
- Adjacencies are stored as bitmasks because the constraint solver wants bitmasks. More on this later.

## Constraint Solver
Uses the information computed by the Image Processor to generate a tilemap layer of a specified size
> NOTE: Right now this class has low readability due to all of the code related to performance benchmarking. It would likely become more readable if we removed the benchmarking code, but as this generator is still in-development, these inclusions are necessary for debugging performance issues.

### Notes
- Restarts if a contradiction is found
- Uses Shannon Entropy
- Uses a queue to progagate 
 > *We found that queues worked faster than stacks, which are used in many WFC implementations*
- By far the slowest part of the constraint solver is the propagate() function
    - We use bitmasking to store and process each cell's possible patterns to try to increase performance
    > *Bitmasking is the best optimization we found to speed this thing up*
    - Because usually there will be more than 32 patterns (and we need 1 bit per pattern), we use a custom Bitmask class
        - Has a lot of nice methods that you use to interface with the class in order to abstract the actual bit operations.
        - Uses an array of 32 bit integers to represent a single integer that can be as many bits large as needed. 

# World Facts Database Maker (Knowledgebase Generator)
Can parse over a tilemap's layer (represented as a 2D matrix) and provide descriptive information about the different structures in that layer
- Structures:
    - Houses
    - Fences
    - Forests
- Info provided, per structure:
	- Global positions
	- Relative (to other structures) positions
	- Color
	- Features
	- Substructures