"use strict";

const regexparam = require("regexparam");

const router = new Map();
const rxCollectionName = "rx";
const directCollectionName = "direct";

class Router {
  constructor() {
    this.get = this.add.bind(this, "GET");
    this.head = this.add.bind(this, "HEAD");
    this.patch = this.add.bind(this, "PATCH");
    this.options = this.add.bind(this, "OPTIONS");
    this.connect = this.add.bind(this, "CONNECT");
    this.delete = this.add.bind(this, "DELETE");
    this.trace = this.add.bind(this, "TRACE");
    this.post = this.add.bind(this, "POST");
    this.put = this.add.bind(this, "PUT");
  }

  add(method, path, handler) {
    const isRegExpInstance = path instanceof RegExp;
    const isValidPath = typeof path === "string" || isRegExpInstance;
    if (!isValidPath)
      return new Error("Invalid param! 'path' must be a String or RegExp");
    if (typeof handler !== "function")
      return new Error(`Invalid param! 'handler' must be a function`);

    const methodCollection =
      router.get(method) || (router.set(method, new Map()), router.get(method));

    // regexparam pathing operators
    const rx = /[\:\*\?\|\(\)]/;
    const isRegExp = isRegExpInstance || path.search(rx) !== -1;

    if (isRegExp) {
      const rxCollection = methodCollection.get(rxCollectionName);
      const { pattern, keys } = regexparam(path);
      const routeComponents = [pattern, handler, keys || []];

      rxCollection
        ? rxCollection.push(routeComponents)
        : (methodCollection.set(rxCollectionName, []),
          methodCollection.get(rxCollectionName).push(routeComponents));
    } else {
      const directCollection = methodCollection.get("direct");
      directCollection
        ? directCollection.set(path, handler)
        : (methodCollection.set(directCollectionName, new Map()),
          methodCollection.get(directCollectionName).set(path, handler));
    }
  }

  find(method, path) {
    const resultObj = { handler: undefined, params: {} };
    const mtd = router.get(method);
    if (!mtd) return resultObj;

    const directCollection = mtd.get(directCollectionName);
    const directHandler = directCollection
      ? directCollection.get(path)
      : undefined;
    if (directHandler) {
      resultObj.handler = directHandler;
      return resultObj;
    }

    const rxCollection = mtd.get(rxCollectionName);
    if (!rxCollection) return resultObj;

    // routeComponents: [pattern:RegExp, handler:Function, keys:Array]
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
