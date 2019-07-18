"use strict";

const http = require("http");
const url = require("url");
const router = require("../index");

const routes = require("./routes");
const PORT = process.env.PORT || 3000;

routes.forEach(path => {
  router.get(path, () => "Hello World!");
});

http
  .createServer(handleRequest)
  .listen(PORT)
  .on("clientError", (err, socket) => {
    socket.end("HTTP/1.1 400 Bad Request\r\n\r\n");
  });

function handleRequest(req, res) {
  const { pathname } = url.parse(req.url, true);
  const { handler } = router.find(req.method, pathname);
  if (!handler) return res.writeHead(404).end();
  const data = handler();
  res.writeHead(200, { "Content-Length": `${data.length}` });
  return res.end(data);
}
