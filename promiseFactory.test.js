const {
  deferrableOrImmediate,
  arrayOrDeferrable,
  internal
} = require("./promiseFactory");
const co = require("co");
const { newPromiseFactory } = internal;

describe("promiseFactory", () => {
  it("passes through if synchronous", function() {
    let fn = jest.fn();

    deferrableOrImmediate("testing", fn);
    expect(fn).toHaveBeenCalledWith("testing");

    expect(arrayOrDeferrable(["ok", "go"])).toEqual(["ok", "go"]);

    fn = jest.fn();

    deferrableOrImmediate(arrayOrDeferrable(["test", "123"]), fn);

    expect(fn).toHaveBeenCalledWith(["test", "123"]);
  });

  describe("resolving once with promise", function() {
    it("works with one deferrable", function(done) {
      deferrableOrImmediate(Promise.resolve("test promise"), function(result) {
        expect(result).toEqual("test promise");
        done();
      });
    });

    it("works with array of deferrables", function(done) {
      deferrableOrImmediate(
        arrayOrDeferrable([Promise.resolve("test promise in array")]),
        function(result) {
          expect(result).toEqual(["test promise in array"]);
          done();
        }
      );
    });
  });

  describe("resolving many with promise factories", function() {
    it("works with one deferrable", function(done) {
      const input = [
        Promise.resolve("one fish"),
        Promise.resolve("two fish"),
        Promise.resolve("red fish"),
        Promise.resolve("blue fish")
      ];
      const iter = input[Symbol.iterator]();
      const promiseFactory = co.wrap(input[Symbol.iterator]);
      promiseFactory.isPromiseFactory = true;
      deferrableOrImmediate(promiseFactory, function(result) {
        debug("doi: ", result);
        const res = iter.next();
        expect(result).toEqual(res.value);
        if (res.value == "blue fish") {
          console.log("bluefish!!");
          done();
        }
      });
    });
  });
});
