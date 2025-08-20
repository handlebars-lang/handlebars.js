import { Exception } from '@handlebars/parser';

export default function (instance) {
  instance.registerHelper('partialDefined', function (partialName, options) {
    if (arguments.length != 2) {
      throw new Exception('#partialDefined requires exactly one argument');
    }
    
    if (instance.partials[partialName] === undefined) {
        return false
    } else {
        return true
    }

  });
}
