"use strict";

const express = require("express");
const app = express();

const PORT = process.env.PORT || 3000;
const routes = require("./routes");

routes.forEach(path => {
  app.get(path, (req, res) => res.send("Hello World!"));
});

app.listen(PORT);
