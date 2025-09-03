// load the built-in http module
const http = require('http');

// create a server
const server = http.createServer((req, res) => {
  res.statusCode = 200;               // HTTP status
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello, World!\n');         // response body
});

// start listening on port 4000
server.listen(4000, () => {
  console.log('Server running at http://localhost:4000/');
});
