const express = require('express');
const path = require('path');

var livereload = require("livereload");
var connectLiveReload = require("connect-livereload");

// reload webpage on code changes
// see Cássio Lacerda blog in README.md for more info!
const liveReloadServer = livereload.createServer();
liveReloadServer.server.once("connection", () => {
  setTimeout(() => {
    liveReloadServer.refresh("/");
  }, 100);
});

const app = express();

// reload
app.use(connectLiveReload());

// Debugging: Log requests 
app.use((req, res, next) => {
  console.log(`Request received: ${req.method} ${req.url}`);
  next();
});

// static files
app.use(express.static(path.join(__dirname), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    }
  }
}));

// serve index.html on root request
app.get('/', (req, res) => {
  res.sendFile(path.join('index.html'));
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});

// downloading
const fs = require('fs');
const exportFolder = "exports";

// exports
app.use(express.json({ limit: '50mb' })); // Allows large Base64 images
app.post(`/${exportFolder}`, (req, res) => {
  const images = req.body.images; // Array of base64 images

  if (!images || images.length === 0) {
      return res.status(400).json({ error: 'No images received' });
  }
  images.forEach((base64String, index) => {
      // Remove the Base64 prefix
      const base64Data = base64String.replace(/^data:image\/png;base64,/, "");

      // Save as a PNG file
      const filePath = path.join(__dirname, `/${exportFolder}`, `map_${index}.png`);
      fs.writeFileSync(filePath, base64Data, 'base64');
  });

  const descriptions = req.body.descriptions;
  descriptions.forEach((text, index) => {
    const formattedParagraph = text.split(`. `).join(`.\n`);

    // Save as a TXT file
    const filePath = path.join(__dirname, `/${exportFolder}`, `map_${index}.txt`);
    fs.writeFile(filePath, formattedParagraph, (err) => {
      if(err) console.error(`Error writing to ${filePath}`)
    });
  });

  res.json({ message: 'Images received and saved!' });
});
