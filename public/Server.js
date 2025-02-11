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

/*
// Debugging: Log requests 
app.use((req, res, next) => {
  console.log(`Request received: ${req.method} ${req.url}`);
  next();
});
*/

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