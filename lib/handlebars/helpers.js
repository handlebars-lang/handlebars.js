import registerBlockHelperMissing from './helpers/block-helper-missing';
import registerEach from './helpers/each';
import registerHelperMissing from './helpers/helper-missing';
import registerIf from './helpers/if';
import registerLog from './helpers/log';
import registerLookup from './helpers/lookup';
import registerWith from './helpers/with';

export function registerDefaultHelpers(instance) {
  registerBlockHelperMissing(instance);
  registerEach(instance);
  registerHelperMissing(instance);
  registerIf(instance);
  registerLog(instance);
  registerLookup(instance);
  registerWith(instance);
}

export function moveHelperToHooks(instance, helperName, keepHelper) {
  if (instance.helpers[helperName]) {
    instance.hooks[helperName] = instance.helpers[helperName];
    if (!keepHelper) {
      // Using delete is slow
      instance.helpers[helperName] = undefined;
    }
  }
}

export function mergeHelpers(env, options, container) {
  const mergedHelpers = {};
  addHelpers(mergedHelpers, env.helpers, container);
  addHelpers(mergedHelpers, options.helpers, container);
  return mergedHelpers;
}

function addHelpers(mergedHelpers, helpers, container) {
  if (!helpers) return;
  Object.keys(helpers).forEach(helperName => {
    const helper = helpers[helperName];
    mergedHelpers[helperName] = passLookupPropertyOption(helper, container);
  });
}

function passLookupPropertyOption(helper, container) {
  if (typeof helper !== 'function') {
    // This should not happen, but apparently it does in https://github.com/wycats/handlebars.js/issues/1639
    // We try to make the wrapper least-invasive by not wrapping it, if the helper is not a function.
    return helper;
  }
  const lookupProperty = container.lookupProperty;
  return function invokeHelper(/* dynamic arguments */) {
    const options = arguments[arguments.length - 1];
    options.lookupProperty = lookupProperty;
    return helper.apply(this, arguments);
  };
}
