import * as base from './handlebars/base';

// Each of these augment the Handlebars object. No need to setup here.
// (This is done to easily share code between commonjs and browse envs)
import SafeString from './handlebars/safe-string';
import Exception from './handlebars/exception';
import {
  extend,
  toString,
  isFunction,
  isArray,
  indexOf,
  escapeExpression,
  isEmpty,
  createFrame,
  blockParams,
  appendContextPath
} from './handlebars/utils';
import {checkRevision, template, wrapProgram, resolvePartial, invokePartial, noop} from './handlebars/runtime';

import noConflict from './handlebars/no-conflict';

// For compatibility and usage outside of module systems, make the Handlebars object a namespace
export function create() {
  let hb = new base.HandlebarsEnvironment();

  extend(hb, base);
  hb.SafeString = SafeString;
  hb.Exception = Exception;
  hb.Utils = {
    extend,
    toString,
    isFunction,
    isArray,
    indexOf,
    escapeExpression,
    isEmpty,
    createFrame,
    blockParams,
    appendContextPath
  };
  hb.escapeExpression = escapeExpression;
  hb.create = create;
  hb.VM = {checkRevision, template, wrapProgram, resolvePartial, invokePartial, noop};
  hb.template = function(spec) {
    return template(spec, hb);
  };

  return hb;
}

let inst = create();

noConflict(inst);

inst['default'] = inst;

export default inst;
