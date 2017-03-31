const {
  deferrableOrImmediate,
  arrayOrDeferrable
} = require("./thunk");

describe("thunk", () => {
  it("passes through if synchronous", function() {
    let fn = jest.fn();

    deferrableOrImmediate("testing", fn);
    expect(fn).toHaveBeenCalledWith("testing");

    expect(arrayOrDeferrable(["ok", "go"])).toEqual(["ok", "go"]);

    fn = jest.fn();

    deferrableOrImmediate(arrayOrDeferrable(["test", "123"]), fn);

    expect(fn).toHaveBeenCalledWith(["test", "123"]);
  });

  it("recieves each time the callback is called", function(done) {
    const input = ["one fish", "two fish", "red fish", "blue fish"];
    let callback;
    const t = function(cb) {
      callback = cb;
    };
    let i = 0;
    deferrableOrImmediate(t, function(result) {
      expect(result).toEqual(input[i]);
      i++;
      if (i >= input.length) {
        done();
      }
    });
    input.forEach(x => callback(x));
  });

  it("works with array of thunks", function(done) {
    let callback;
    deferrableOrImmediate(
      arrayOrDeferrable([cb => callback = cb]),
      function(result) {
        expect(result).toEqual(["test thunk in array"]);
        done();
      }
    );
    callback("test thunk in array");
  });
});
