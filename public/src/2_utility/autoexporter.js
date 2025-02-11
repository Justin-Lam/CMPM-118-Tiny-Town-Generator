// gets a batch of pngs generated in scene and sends the base64 png data to server for saving
export async function autoExport(numRuns, scene){
    console.log("Generating batch...");

    // temporarily shrinking canvas to output size
    let startWidth = window.game.canvas.width;
    let startHeight = window.game.canvas.width;
    window.game.canvas.width = scene.outputWidth * scene.tileSize;
    window.game.canvas.height = scene.outputHeight * scene.tileSize;
    console.log(window.game.canvas.width, window.game.canvas.height);
    
    // generate maps and send b64/png data to server to be saved
    let images = [];
    for(let i = 1; i <= numRuns; i++){
        scene.generateMap();
        
        await forceRenderUpdate(scene); 

        let img = window.game.canvas.toDataURL("image/png"); 
        images.push(img);
    }
    //console.log(exports)
    console.log(`Batch of ${images.length} PNGs ready for export!`)

    // Send images to the server
    fetch('http://localhost:3000/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({images: images})
    })
    .then(response => response.json())
    .then(data => console.log('Server Response:', data))
    .catch(error => console.error('Error:', error));

    // restore canvas to orginal size
    window.game.canvas.width = startWidth;
    window.game.canvas.height = startHeight;
}

// Ensure Phaser fully updates the canvas			
function forceRenderUpdate(scene) {
    return new Promise(resolve => {
        scene.time.delayedCall(100, () => {
            scene.game.renderer.snapshot(() => { // force Phaser to take a full render snapshot
                resolve();
            });
        });
    });
}