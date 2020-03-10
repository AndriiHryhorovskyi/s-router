const router = require("./index");

describe("router", () => {
  beforeAll(() => {
    router.get("/users", () => "list of users");
    router.get("/users/:id/:s?", () => "some user");
    router.get(/^\/$/, () => "index.html");
    router.patch(
      /^[/]users[/](?<id>\d+)[/]books[/](?<title>[^/]+)[/]?$/,
      () => "patched"
    );
  });

  test("should return 'list of users' params and handler", () => {
    const { handler, params } = router.find("GET", "/users");
    expect(handler()).toBe("list of users");

    expect(params).toBeInstanceOf(Object);
    expect(Object.keys(params).length).toBe(0);
  });

  test(`should return 'some user'`, () => {
    const { handler, params } = router.find("GET", "/users/1");
    expect(handler()).toBe("some user");

    expect(params).toEqual({
      id: 1
    });
  });

  test("should return index.html params and handler", () => {
    const { handler, params } = router.find("GET", "/");
    expect(handler()).toBe("index.html");

    expect(params).toBeInstanceOf(Object);
    expect(Object.keys(params).length).toBe(0);
  });

  test("custom RegExp should work fine", () => {
    const { handler, params } = router.find("PATCH", "/users/456/books/1");
    expect(handler()).toBe("patched");

    expect(params).toBeInstanceOf(Object);
    expect(params).toEqual({ id: 456, title: 1 });
  });

  test("should return undefined handler and empty params object", () => {
    const result = router.find("GET", "/test/path");

    expect(result).toEqual({
      handler: null,
      params: {}
    });
  });
});
