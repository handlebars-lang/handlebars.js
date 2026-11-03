import { extend } from '../utils.js';
import logger from '../logger.js';

const loggedProperties = Object.create(null);

export function createProtoAccessControl(runtimeOptions) {
  // Create an object with "null"-prototype to avoid truthy results on
  // prototype properties.
  const propertyWhiteList = Object.create(null);
  // eslint-disable-next-line no-proto
  propertyWhiteList['__proto__'] = false;
  extend(propertyWhiteList, runtimeOptions.allowedProtoProperties);

  const methodWhiteList = Object.create(null);
  methodWhiteList['constructor'] = false;
  methodWhiteList['__defineGetter__'] = false;
  methodWhiteList['__defineSetter__'] = false;
  methodWhiteList['__lookupGetter__'] = false;
  extend(methodWhiteList, runtimeOptions.allowedProtoMethods);

  return {
    properties: {
      whitelist: propertyWhiteList,
      defaultValue: runtimeOptions.allowProtoPropertiesByDefault,
    },
    methods: {
      whitelist: methodWhiteList,
      defaultValue: runtimeOptions.allowProtoMethodsByDefault,
    },
  };
}

export function resultIsAllowed(result, protoAccessControl, propertyName) {
  if (typeof result === 'function') {
    return checkWhiteList(protoAccessControl.methods, propertyName);
  } else {
    return checkWhiteList(protoAccessControl.properties, propertyName);
  }
}

/**
 * Whether either whitelist allows this NAME, decided without reading the
 * property. An inherited accessor's value cannot be inspected without running
 * it, so the only rule that keeps today's results is: deny only when neither
 * whitelist would allow the name — then any `typeof result` is denied too.
 */
export function mayAccessPropertyName(protoAccessControl, propertyName) {
  return (
    whitelistAllows(protoAccessControl.methods, propertyName) ||
    whitelistAllows(protoAccessControl.properties, propertyName)
  );
}

/** Whether the deny would have logged, given the same name-only decision. */
export function deniedAccessWouldLog(protoAccessControl, propertyName) {
  const silent = (acl) =>
    acl.whitelist[propertyName] !== undefined || acl.defaultValue !== undefined;
  return (
    !silent(protoAccessControl.methods) &&
    !silent(protoAccessControl.properties)
  );
}

export function logDeniedAccess(propertyName) {
  logUnexpectedPropertyAccessOnce(propertyName);
}

function whitelistAllows(protoAccessControlForType, propertyName) {
  if (protoAccessControlForType.whitelist[propertyName] !== undefined) {
    return protoAccessControlForType.whitelist[propertyName] === true;
  }
  return protoAccessControlForType.defaultValue === true;
}

function checkWhiteList(protoAccessControlForType, propertyName) {
  if (protoAccessControlForType.whitelist[propertyName] !== undefined) {
    return protoAccessControlForType.whitelist[propertyName] === true;
  }
  if (protoAccessControlForType.defaultValue !== undefined) {
    return protoAccessControlForType.defaultValue;
  }
  logUnexpectedPropertyAccessOnce(propertyName);
  return false;
}

function logUnexpectedPropertyAccessOnce(propertyName) {
  if (loggedProperties[propertyName] !== true) {
    loggedProperties[propertyName] = true;
    logger.log(
      'error',
      `Handlebars: Access has been denied to resolve the property "${propertyName}" because it is not an "own property" of its parent.\n` +
        `You can add a runtime option to disable the check or this warning:\n` +
        `See https://handlebarsjs.com/api-reference/runtime-options.html#options-to-control-prototype-access for details`
    );
  }
}

export function resetLoggedProperties() {
  Object.keys(loggedProperties).forEach((propertyName) => {
    delete loggedProperties[propertyName];
  });
}
