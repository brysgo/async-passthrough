function deferrableOrImmediate(obj, fn) {
  if (detect(obj)) {
    return obj.then(fn);
  } else {
    return fn(obj);
  }
}

function arrayOrDeferrable(arr) {
  if (arr.some(detect)) {
    return Promise.all(arr);
  } else {
    return arr;
  }
}

module.exports = { deferrableOrImmediate, arrayOrDeferrable };

function detect(obj) {
  return obj && typeof obj === "object" && typeof obj.then === "function";
}
