export function wrapHelper(helper, transformOptionsFn) {
  let wrapper = function(/* dynamic arguments */) {
    const options = arguments[arguments.length - 1];
    arguments[arguments.length - 1] = transformOptionsFn(options);
    return helper.apply(this, arguments);
  };
  return wrapper;
}
