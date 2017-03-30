const Debug = require("debug");
const { detect: isPromise } = require("./promise");
const co = require("co");

const debug = Debug("async-passthrough/promiseFactory");

function deferrableOrImmediate(obj, fn) {
  if (detect(obj)) {
    const { resolve, promiseFactory } = newPromiseFactory();
    promiseFactoryCallback(obj, result => {
      debug("deferrableOrImmediate", result);
      resolve(result);
    });
    return promiseFactory;
  } else if (isPromise(obj)) {
    return obj.then(fn);
  } else {
    return fn(obj);
  }
}

function arrayOrDeferrable(arr) {
  debug("arrayOrDeferrable: ", arr, Array.isArray(arr));
  if (arr.some(isPromise)) {
    if (arr.some(detect)) {
      const { resolve, promiseFactory } = newPromiseFactory();
      const remap = () =>
        Promise.all(
          arr.map(item => {
            if (detect(item)) {
              return item.next().then(pipe => {
                remap();
                return pipe;
              });
            } else {
              return item;
            }
          })
        ).then(resolve);
      remap();
      return promiseFactory;
    } else {
      return Promise.all(arr);
    }
  } else {
    return arr;
  }
}

function detect(obj) {
  return obj && obj.isPromiseFactory;
}

function newPromiseFactory() {
  let resolve;
  const firstPromise = new Promise(res => resolve = res);
  const promiseFactory = co.wrap(
    function*() {
      yield firstPromise;
      while (true) {
        yield new Promise(res => resolve = res);
      }
    })
  ;
  promiseFactory.isPromiseFactory = true;
  debug({ promiseFactory });
  return { resolve, promiseFactory };
}

function promiseFactoryCallback(promiseFactory, cb) {
  let lastArgs = [];
  const watcher = arg => {
    const repeats = lastArgs.reduce(
      (acc, cur) => {
        if (acc[0] === cur) {
          acc[1]++;
        } else {
          acc = [cur, 0];
        }
        return acc;
      },
      [arg, 1]
    );
    if (repeats[1] > 3) {
      debug(`***infinite loop***: ${repeats[0]} repeated ${repeats[1]} times!`);
      throw new Error("***infinite loop***");
    }
    cb(arg);
    lastArgs.push(arg);
    promiseFactory().then(watcher);
  };
  promiseFactory().then(watcher);
  debug("watcher started");
}

module.exports = {
  deferrableOrImmediate,
  arrayOrDeferrable,
  detect,
  internal: {
    newPromiseFactory,
    promiseFactoryCallback
  }
};
