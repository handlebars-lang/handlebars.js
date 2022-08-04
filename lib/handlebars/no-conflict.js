export default function(Handlebars) {
  /* istanbul ignore next */
  let root;
  if (typeof self !== 'undefined') {
    root = self; // eslint-disable-line no-undef
  } else if (typeof window !== 'undefined') {
    root = window;
  } else if (typeof global !== 'undefined') {
    root = global;
  } else {
    throw new Error('unable to locate global object');
  }
  let $Handlebars = root.Handlebars;
  /* istanbul ignore next */
  Handlebars.noConflict = function() {
    if (root.Handlebars === Handlebars) {
      root.Handlebars = $Handlebars;
    }
    return Handlebars;
  };
}
