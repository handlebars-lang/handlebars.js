export default function (Handlebars) {
  let $Handlebars = globalThis.Handlebars;

  /* v8 ignore next */
  Handlebars.noConflict = function () {
    if (globalThis.Handlebars === Handlebars) {
      globalThis.Handlebars = $Handlebars;
    }
    return Handlebars;
  };
}
