const thunks = require("thunks");
const Debug = require("debug");

const thunk = thunks();

const debug = Debug("async-passthrough/thunk");

function deferrableOrImmediate(obj, fn) {
  if (detect(obj)) {
    debug({ obj });
    return obj(function(err, result) {
      debug({ err, result });
      fn(result);
    });
  } else {
    return fn(obj);
  }
}

function arrayOrDeferrable(arr) {}

module.exports = {
  deferrableOrImmediate,
  arrayOrDeferrable
};

function detect(item) {
  return thunks.isThunkableFn(item);
}
