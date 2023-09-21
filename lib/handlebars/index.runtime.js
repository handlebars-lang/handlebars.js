import * as parser from '@handlebars/parser';
import * as base from './base.js';

// Each of these augment the Handlebars object. No need to setup here.
// (This is done to easily share code between commonjs and browse envs)
import SafeString from './safe-string.js';
import * as Utils from './utils.js';
import * as runtime from './runtime.js';

import noConflict from './no-conflict.js';

const Exception = parser.Exception ?? parser.default.Exception;

const vm = Utils.extend({}, runtime);

// For compatibility and usage outside of module systems, make the Handlebars object a namespace
function create() {
  let hb = new base.HandlebarsEnvironment();

  Utils.extend(hb, base);
  hb.SafeString = SafeString;
  hb.Exception = Exception;
  hb.Utils = Utils;
  hb.escapeExpression = Utils.escapeExpression;

  hb.VM = vm;
  hb.template = function (spec) {
    return runtime.template(spec, hb);
  };

  return hb;
}

let inst = create();
inst.create = create;

noConflict(inst);

inst['default'] = inst;

export default inst;
