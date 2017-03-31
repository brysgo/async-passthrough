const {
  deferrableOrImmediate,
  arrayOrDeferrable
} = require("./thunk");
const thunks = require("thunks");
const thunk = thunks({
  onstop: function(sig) {
    console.log(sig);
  },
  onerror: function(error) {
    console.error(error);
  },
  debug: function() {
    console.log.apply(console, arguments);
  }
});

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

  it("calls the callback", function(done) {
    const input = ["one fish", "two fish", "red fish", "blue fish"];
    let callback;
    const t = thunk(function(cb) {
      callback = cb;
    });
    let i = 0;
    deferrableOrImmediate(t, function(result) {
      expect(result).toEqual(input[i]);
      i++;
      if (i >= input.length) {
        done();
      }
    });
    input.forEach(x => callback(null, x));
  });
});
