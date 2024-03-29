/* eslint-disable no-undef */
/* super simple express server for testing */
const express = require('express');
const http = require('http');
const reload = require('reload');

const app = express();

// switch between testing src and dist
app.use(express.static('src'));
app.use(express.static('node_modules'));
app.use(express.static('manifest'));
// app.use(express.static('dist'))

// eslint-disable-next-line no-process-env
app.set('port', process.env.PORT || 8069);
const server = http.createServer(app);

// Reload code changes here
reload(app);

server.listen(app.get('port'), () => {
  console.log(`Web server at http://localhost:${app.get('port')}`);
});
