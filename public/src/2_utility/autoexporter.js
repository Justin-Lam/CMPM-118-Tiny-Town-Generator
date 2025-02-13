/** Gets a batch of pngs generated in scene and sends the base64 png data to server for saving. */
export async function autoExport(numRuns, scene){
	console.log("Generating batch...");

	// Temporarily shrink canvas to output size
	const startWidth = window.game.canvas.width;
	const startHeight = window.game.canvas.height;
	window.game.canvas.width = scene.outputWidth * scene.tileSize;
	window.game.canvas.height = scene.outputHeight * scene.tileSize;
	console.log(window.game.canvas.width, window.game.canvas.height);
	
	// Generate maps and send b64/png data to server to be saved
	const images = [];
	for(let i = 0; i < numRuns; i++){
		scene.generateMap();
		await forceRenderUpdate(scene); 
		const img = window.game.canvas.toDataURL("image/png"); 
		images.push(img);
	}
	console.log(`Batch of ${images.length} PNGs ready for export!`)

	// Send images to the server
	fetch('http://localhost:3000/exports', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({images: images})
	})
	.then(response => response.json())
	.then(data => console.log('Server Response:', data))
	.catch(error => console.error('Error:', error));

	// Restore canvas to orginal size
	window.game.canvas.width = startWidth;
	window.game.canvas.height = startHeight;
}

/** Ensures Phaser fully updates the canvas. */		
function forceRenderUpdate(scene) {
	return new Promise(resolve => {
		scene.time.delayedCall(100, () => {
			scene.game.renderer.snapshot(() => { // force Phaser to take a full render snapshot
				resolve();
			});
		});
	});
}