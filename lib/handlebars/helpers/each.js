import {createFrame, isArray, isFunction} from '../utils';
import Exception from '../exception';

export default function(instance) {
  instance.registerHelper('each', function(context, options) {
    if (!options) {
      throw new Exception('Must pass iterator to #each');
    }

    let fn = options.fn,
        inverse = options.inverse,
        i = 0,
        ret = '',
        data;

    if (isFunction(context)) { context = context.call(this); }

    if (options.data) {
      data = createFrame(options.data);
    }

    function execIteration(field, index, last, value) {
      if (data) {
        data.key = field;
        data.index = index;
        data.first = index === 0;
        data.last = !!last;
        data.value = value;
      }

      ret = ret + fn(context[field], {
        data: data,
        blockParams: [context[field], field]
      });
    }

    if (context && typeof context === 'object') {
      if (isArray(context)) {
        for (let j = context.length; i < j; i++) {
          if (i in context) {
            execIteration(i, i, i === context.length - 1, context[i]);
          }
        }
      } else {
        let priorKey;

        for (let key in context) {
          if (context.hasOwnProperty(key)) {
            // We're running the iterations one step out of sync so we can detect
            // the last iteration without have to scan the object twice and create
            // an itermediate keys array.
            if (priorKey !== undefined) {
              execIteration(priorKey, i - 1, false, context[priorKey]);
            }
            priorKey = key;
            i++;
          }
        }
        if (priorKey !== undefined) {
          execIteration(priorKey, i - 1, true, context[priorKey]);
        }
      }
    }

    if (i === 0) {
      ret = inverse(this);
    }

    return ret;
  });
}
