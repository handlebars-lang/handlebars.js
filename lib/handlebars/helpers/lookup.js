import {propertyMustBeEnumerable} from '../internal/propertyMustBeEnumerable';

export default function(instance) {
  instance.registerHelper('lookup', function(obj, field) {
    if (!obj) {
      return obj;
    }
    if (propertyMustBeEnumerable(field) && !obj.propertyIsEnumerable(field)) {
      return undefined;
    }
    return obj[field];
  });
}
