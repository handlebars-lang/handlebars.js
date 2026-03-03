import { Exception } from '@handlebars/parser';
import { createFrame, isArray, isFunction, isMap, isSet } from '../utils';

export default function (instance) {
  instance.registerHelper('each', function (context, options) {
    if (!options) {
      throw new Exception('Must pass iterator to #each');
    }

    let fn = options.fn,
      inverse = options.inverse,
      i = 0,
      ret = '',
      data;

    if (isFunction(context)) {
      context = context.call(this);
    }

    if (options.data) {
      data = createFrame(options.data);
    }

    function execIteration(field, value, index, last) {
      if (data) {
        data.key = field;
        data.index = index;
        data.first = index === 0;
        data.last = !!last;
      }

      ret =
        ret +
        fn(value, {
          data: data,
          blockParams: [context[field], field],
        });
    }

    if (context && typeof context === 'object') {
      if (isArray(context)) {
        for (let j = context.length; i < j; i++) {
          if (i in context) {
            execIteration(i, context[i], i, i === context.length - 1);
          }
        }
      } else if (isMap(context)) {
        const j = context.size;
        for (const [key, value] of context) {
          execIteration(key, value, i++, i === j);
        }
      } else if (isSet(context)) {
        const j = context.size;
        for (const value of context) {
          execIteration(i, value, i++, i === j);
        }
      } else if (typeof Symbol === 'function' && context[Symbol.iterator]) {
        const newContext = [];
        const iterator = context[Symbol.iterator]();
        for (let it = iterator.next(); !it.done; it = iterator.next()) {
          newContext.push(it.value);
        }
        context = newContext;
        for (let j = context.length; i < j; i++) {
          execIteration(i, context[i], i, i === context.length - 1);
        }
      } else {
        let priorKey;

        Object.keys(context).forEach((key) => {
          // We're running the iterations one step out of sync so we can detect
          // the last iteration without have to scan the object twice and create
          // an intermediate keys array.
          if (priorKey !== undefined) {
            execIteration(priorKey, context[priorKey], i - 1);
          }
          priorKey = key;
          i++;
        });
        if (priorKey !== undefined) {
          execIteration(priorKey, context[priorKey], i - 1, true);
        }
      }
    }

    if (i === 0) {
      ret = inverse(this);
    }

    return ret;
  });
}
