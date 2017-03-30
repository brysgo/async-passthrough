function detect(obj) {
  return obj && typeof obj.then === "function";
}

module.exports = { detect };
