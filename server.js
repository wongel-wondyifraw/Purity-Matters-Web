const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const rawPort = process.env.PORT || '3000';
const port = !isNaN(Number(rawPort)) ? parseInt(rawPort, 10) : rawPort;
const isPassenger = typeof PhusionPassenger !== 'undefined';
const listenTarget = isPassenger ? 'passenger' : port;

const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(listenTarget, (err) => {
    if (err) throw err;
    console.log(`> Web Console ready on ${isPassenger ? 'Passenger' : port}`);
  });
});
