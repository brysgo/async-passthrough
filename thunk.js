const Debug = require("debug");

const debug = Debug("async-passthrough/thunk");

function deferrableOrImmediate(obj, fn) {
  if (detect(obj)) {
    return obj(function(result) {
      fn(result);
    });
  } else {
    return fn(obj);
  }
}

function arrayOrDeferrable(arr) {
  if (arr.some(detect)) {
    return function(cb) {
      const newArr = Array.from(arr);
      let count = arr.length;
      arr.forEach((a, i) => {
        if (detect(a)) {
          a(function(val) {
            newArr[i] = val;
            count--;
            if (count <= 0) cb(newArr);
          });
        } else {
          newArr[i] = a;
        }
      });
    };
  } else {
    return arr;
  }
}

module.exports = {
  deferrableOrImmediate,
  arrayOrDeferrable
};

function detect(item) {
  return typeof item === "function";
}
