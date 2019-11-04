/**
 * Create a new object with `null`-constructor containing all enumerable properties of all source objects.
 *
 * Intention: omit potentially malicious prototype properties
 *
 * @private
 * @param {...object} sourceObjects
 * @returns {object}
 */
export function newMapObject(...sourceObjects) {
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
