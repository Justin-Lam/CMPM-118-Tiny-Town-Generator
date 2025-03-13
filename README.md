### Usage
Clone this repo onto your device.
In your terminal, run:
1. `npm install` to get all Node dependencies.
2. `npm run watch` to launch the server. 
	> This command runs the sever with live reload for code editing. You can also run `npm start` to run the server without live reloads. 
3. Follow the link provided in your terminal, or go to `http://localhost:3000/` to see the webpage.

#### Exports
When exporting, .png files will be saved in `./public/exports`
> NOTE: any files in the exports folder will be overwritten when the export key is pressed.




# Note to Raven
Feel completely free to take, edit, and reorder anything here to your liking for the final version of the documentation
I was just writing everything I thought might potentially be useful so if it's not then just remove it
Remember that basically the point of this documentation is for the future if anyone in this research class needs
	to boot this project back up and start using it or modifying it

# Assets
Tilesets sourced from Kenney Assets
	https://kenney.nl/assets/tiny-town
	https://kenney.nl/assets/map-pack
Map 1 (Pathfinder map) created by (I think) Professor Whitehead or his TA
	Has a problem of having too little houses so outputs purely made with this typically have few houses
Maps 2-4 created by Michelle by hand in Tiled
## Inputs
Our generator is interesting in that it can be improved by either improving it or by improving the input that goes into it
When creating inputs, you need to be mindful or creating something that looks nice and natural
	but also has a lot of diverse content in it so there can be diverse outputs
## Outputs
In general our outputs currently struggle with just paths and trees:
	Paths:
		Paths don't connect houses
		Too many random paths everywhere
	Trees:
		Trees aren't grouped togther making forests (right now everything's just one big forest)
		Too many random trees everywhere

# Libraries
Phaser created by whoever made Phaser

# WFC
## Overview
We've created a JS implementation of Gumin's overlapping model for Phaser tilemaps
The intended purpose was to make a dataset to train LLMs on so they can understand tilemap data
	We chose WFC so we could make natural looking outputs
Our implementation is comprised of two components: the image processor and the constraint solver
	These components are both classes (chose OOP for organization)
		In general there's a lot of OOP for organization and easy interfacing
	They are designed to have just one function that the caller needs to use
	They store the results of their computations in public attributes that the caller will then access
		I'm still personally conflicted on whether I should have made them return the results and store nothing
## Image Processor
Takes in an image (2D tile ID matrix of a tilemap layer) and an N and the patterns and their weights and adjacencies
Differs from some other overlapping model implementations in that it can take in multiple inputs
Patterns, weights, and adjacencies are all implemented as parallel arrays
	(eg. patterns[0], weights[0], and adjacencies[0] all refer to pattern 0)
Get patterns and weights first
	The two have to be gathered together because if we're getting rid of duplicate patterns then we need to increase the weight
Then adjacencies are computed
	Has to be after all unique patterns are found because we need to compare each pattern to every other one (in all 4 directions)
	Adjacencies are stored as Bitmasks because the constraint solver likes that
## Constraint Solver
