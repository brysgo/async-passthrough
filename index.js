const _promiseFactory = {
  detect(obj) {
    return obj && obj.isPromiseFactory;
  }
};
export const promiseFactory = {
  deferrableOrImmediate(obj, fn) {
    if (promiseFactory.detect(obj)) {
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
  },
  arrayOrDeferrable(arr) {
    debug("arrayOrDeferrable: ", arr, Array.isArray(arr));
    if (arr.some(obj => isPromise(obj) || isPromiseFactory(obj))) {
      const { resolve, promiseFactory } = newPromiseFactory();
      const remap = () =>
        Promise.all(
          arr.map(item => {
            if (isPromiseFactory(item)) {
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
      return arr;
    }
  }
};

export const _promise = {
  detect(obj) {
    return obj && typeof obj.then === "function";
  }
};
