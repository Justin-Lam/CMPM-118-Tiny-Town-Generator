// S to screenshot

async function takeScreenshot() {
	// Create a file handle in the chosen directory
	const fileHandle = await window.showSaveFilePicker({
		suggestedName: "screenshot.png",
		types: [{
			description: "PNG image",
			accept: { "image/png": [".png"] }
		}]
	});

	// Create a writable stream to write to the file
	const writableStream = await fileHandle.createWritable();

	// Convert the base64 image data to a blob
	const response = await fetch(game.canvas.toDataURL());
	const blob = await response.blob();

	// Write the blob data to the file
	await writableStream.write(blob);
	
	// Close the stream after writing
	await writableStream.close();

	console.log('Screenshot saved!');
}

document.addEventListener('keydown', (e) => {
	if (e.key === 's') {
		takeScreenshot();
	}
});
