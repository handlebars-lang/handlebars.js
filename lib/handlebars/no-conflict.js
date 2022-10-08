export default function(Handlebars) {
  /* istanbul ignore next */

  function getRoot() {
    if (typeof global !== 'undefined') {
      // eslint-disable-next-line no-undef
      return global;
    } else if (typeof window !== 'undefined') {
      return window;
    }

    return null;
  }

  const root = getRoot();

  if (root !== null) {
    root.$Handlebars = root.Handlebars;

    /* istanbul ignore next */
    Handlebars.noConflict = function() {
      if (root.Handlebars === Handlebars) {
        root.Handlebars = root.$Handlebars;
      }
      return Handlebars;
    };
  } else {
    Handlebars.noConflict = function() {
      console.log('Handlebars.noConflict not supported in this environment');
    };
  }
}
