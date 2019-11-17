/**
 * Create an object without Object.prototype methods like __defineGetter__, constructor,
 * __defineSetter__ and __proto__.
 *
 * Those methods should not be accessed from template code, because that can lead to
 * security leaks. This method should be used to create internal objects that.
 *
 * @private
 * @param {...object} sourceObjects
 * @returns {object}
 */
export function newObjectWithoutPrototypeProperties(...sourceObjects) {
  let result = Object.create(null);
  sourceObjects.forEach(sourceObject => {
    if (sourceObject != null) {
      Object.keys(sourceObject).forEach(key => {
        result[key] = sourceObject[key];
      });
    }
  });
  return result;
}

