export const dangerousPropertyRegex = /^(constructor|__defineGetter__|__defineSetter__|__lookupGetter__|__proto__)$/;

export default function(instance) {
  instance.registerHelper('lookup', function(obj, field) {
    if (!obj) {
      return obj;
    }
    if (dangerousPropertyRegex.test(String(field)) && !Object.prototype.propertyIsEnumerable.call(obj, field)) {
      return undefined;
    }
    return obj[field];
  });
}
