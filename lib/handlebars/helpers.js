import registerBlockHelperMissing from './helpers/block-helper-missing.js';
import registerEach from './helpers/each.js';
import registerHelperMissing from './helpers/helper-missing.js';
import registerIf from './helpers/if.js';
import registerLog from './helpers/log.js';
import registerLookup from './helpers/lookup.js';
import registerWith from './helpers/with.js';

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
      delete instance.helpers[helperName];
    }
  }
}
