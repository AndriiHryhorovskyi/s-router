const assert = require("assert").strict;
const router = require("./index");

router.get("/users", () => "list of users");
router.get("/users/:id/:s?", () => "some user");
router.get(/^\/$/, () => "index.html");
router.patch(
  /^[/]users[/](?<id>\d+)[/]books[/](?<title>[^/]+)[/]?$/,
  () => "patched",
);

const tests = [
  {
    args: ["GET", "/users"],
    expected: { result: "list of users", params: {} },
    name: "direct path",
  },
  {
    args: ["GET", "/users/1"],
    expected: { result: "some user", params: { id: 1 } },
    name: "path with unused optional paramater",
  },
  {
    args: ["GET", "/users/1/a"],
    expected: { result: "some user", params: { id: 1, s: "a" } },
    name: "path with optional parameter",
  },
  {
    args: ["GET", "/"],
    expected: { result: "index.html", params: {} },
    name: "RegExp path",
  },
  {
    args: ["PATCH", "/users/456/books/1"],
    expected: { result: "patched", params: { id: 456, title: 1 } },
    name: "RegExp path with parameters",
  },
];

for (const test of tests) {
  const { args, expected, name } = test;
  const { handler, params } = router.find(...args);
  const result = handler();
  const errorMsg = `Error in test '${name}'`;

  try {
    assert.strictEqual(result, expected.result, errorMsg);
    assert.deepStrictEqual(params, expected.params, errorMsg);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
