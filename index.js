"use strict";

const regexparam = require("regexparam");

const rxCollectionName = "rx";
const directCollectionName = "direct";
const methods = [
  "GET",
  "HEAD",
  "PATCH",
  "OPTIONS",
  "CONNECT",
  "DELETE",
  "TRACE",
  "POST",
  "PUT",
];

class Router {
  #router = new Map();
  constructor() {
    methods.forEach(
      method => (this[method.toLowerCase()] = this.add.bind(this, method)),
    );
  }

  add(method, path, handler) {
    const isRegExpInstance = path instanceof RegExp;
    const isValidPath = typeof path === "string" || isRegExpInstance;
    if (!isValidPath)
      return new Error("Invalid param! 'path' must be a String or RegExp");
    if (typeof handler !== "function")
      return new Error(`Invalid param! 'handler' must be a function`);

    const methodCollection =
      this.#router.get(method) ||
      (this.#router.set(method, new Map()), this.#router.get(method));

    // regexparam pathing operators
    const rx = /[\:\*\?\|\(\)]/;
    const isRegExp = isRegExpInstance || path.search(rx) !== -1;

    if (isRegExp) {
      const rxCollection =
        methodCollection.get(rxCollectionName) ||
        (methodCollection.set(rxCollectionName, []),
        methodCollection.get(rxCollectionName));
      const { pattern, keys } = regexparam(path);
      const routeComponents = [pattern, handler, keys || []];

      rxCollection.push(routeComponents);
    } else {
      const directPath =
        path.endsWith("/") && path.lenght > 1 ? path.slice(0, -1) : path;
      const directCollection =
        methodCollection.get(directCollectionName) ||
        (methodCollection.set(directCollectionName, new Map()),
        methodCollection.get(directCollectionName));

      directCollection.set(directPath, handler);
    }
  }

  find(method, path) {
    if (path.endsWith("/") && path.length > 1) path = path.slice(0, -1);
    const resultObj = { handler: null, params: {} };
    const mtd = this.#router.get(method);
    if (!mtd) return resultObj;

    const directCollection = mtd.get(directCollectionName);
    const directHandler = directCollection ? directCollection.get(path) : null;
    if (directHandler) {
      resultObj.handler = directHandler;
      return resultObj;
    }

    const rxCollection = mtd.get(rxCollectionName);
    if (!rxCollection) return resultObj;

    // routeComponents: [pattern::RegExp, handler::Function, keys::Array]
    for (let routeComponents of rxCollection) {
      let matches = path.match(routeComponents[0]);

      if (matches) {
        if (!routeComponents[2].length)
          for (let key in matches.groups) routeComponents[2].push(key);

        resultObj.handler = routeComponents[1];
        for (let i = 0; i < routeComponents[2].length; i++) {
          const index = i + 1;
          const item = parseFloat(matches[index]) || matches[index];
          if (item) resultObj.params[routeComponents[2][i]] = item;
        }
        return resultObj;
      }
    }
    return resultObj;
  }
}

module.exports = new Router();
