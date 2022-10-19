import * as Handlebars from 'handlebars/runtime';
import { assertEquals } from './lib/assert';

const template = Handlebars.template({
  compiler: [8, '>= 4.3.0'],
  main: function (container, depth0, helpers, partials, data) {
    var helper,
      lookupProperty =
        container.lookupProperty ||
        function (parent, propertyName) {
          if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
            return parent[propertyName];
          }
          return undefined;
        };

    return (
      'Author: ' +
      container.escapeExpression(
        ((helper =
          (helper =
            lookupProperty(helpers, 'author') ||
            (depth0 != null ? lookupProperty(depth0, 'author') : depth0)) !=
          null
            ? helper
            : container.hooks.helperMissing),
        typeof helper === 'function'
          ? helper.call(depth0 != null ? depth0 : container.nullContext || {}, {
              name: 'author',
              hash: {},
              data: data,
              loc: {
                start: { line: 1, column: 8 },
                end: { line: 1, column: 18 },
              },
            })
          : helper)
      )
    );
  },
  useData: true,
});
assertEquals(template({ author: 'Yehuda' }), 'Author: Yehuda');
