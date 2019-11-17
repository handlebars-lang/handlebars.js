import {newObjectWithoutPrototypeProperties} from './newObjectWithoutPrototypeProperties';

const dangerousProperties = newObjectWithoutPrototypeProperties();

getFunctionPropertiesOf(Object.prototype).forEach(propertyName => {
  dangerousProperties[propertyName] = true;
});
getFunctionPropertiesOf(Array.prototype).forEach(propertyName => {
  dangerousProperties[propertyName] = true;
});
getFunctionPropertiesOf(Function.prototype).forEach(propertyName => {
  dangerousProperties[propertyName] = true;
});
getFunctionPropertiesOf(String.prototype).forEach(propertyName => {
  dangerousProperties[propertyName] = true;
});

// eslint-disable-next-line no-proto
dangerousProperties.__proto__ = true;
dangerousProperties.__defineGetter__ = true;
dangerousProperties.__defineSetter__ = true;

// Following properties are not _that_ dangerous
delete dangerousProperties.toString;
delete dangerousProperties.includes;
delete dangerousProperties.slice;
delete dangerousProperties.isPrototypeOf;
delete dangerousProperties.propertyIsEnumerable;
delete dangerousProperties.indexOf;
delete dangerousProperties.keys;
delete dangerousProperties.lastIndexOf;

function getFunctionPropertiesOf(obj) {
  return Object.getOwnPropertyNames(obj)
      .filter(propertyName => {
        try {
          return typeof obj[propertyName] === 'function';
        } catch (error) {
          // TypeError happens here when accessing 'caller', 'callee', 'arguments' on Function
          return true;
        }
      });
}

/**
 * Checks if a property can be harmful and should only processed when it is enumerable on its parent.
 *
 * This is necessary because of various "arbitrary-code-execution" issues that Handlebars has faced in the past.
 *
 * @param propertyName
 * @returns {boolean}
 */
export function propertyMustBeEnumerable(propertyName) {
  return dangerousProperties[propertyName];
}

export function getAllDangerousProperties() {
  return dangerousProperties;
}
