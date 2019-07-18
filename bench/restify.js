const restify = require("restify");

const routes = require("./routes");
const PORT = process.env.PORT || 3000;

const server = restify.createServer();

routes.forEach(path =>
  server.get(path, (req, res, next) => res.send("Hello World!"))
);

server.listen(PORT);
