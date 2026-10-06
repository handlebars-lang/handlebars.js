import { Exception } from '@handlebars/parser';
import { createFrame, isArray, isFunction, isMap, isSet } from '../utils.js';

/**
 * Close an unfinished iterator after the block body threw, like for...of does,
 * so that generators can run their cleanup code.
 *
 * Errors thrown while closing, including by a `return` getter, are ignored:
 * the block's error is the cause and is the one the caller must see.
 *
 * @param {Iterator} iterator the iterator that was being consumed
 */
function closeIterator(iterator) {
  try {
    let close = iterator.return;
    if (isFunction(close)) {
      close.call(iterator);
    }
    // oxlint-disable-next-line no-unused-vars -- Babel 5 requires named catch param
  } catch (closeError) {
    // NOP
  }
}

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
          blockParams: [value, field],
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
        const iterator = context[Symbol.iterator]();
        let current = iterator.next();
        while (!current.done) {
          let next = iterator.next();
          try {
            execIteration(i, current.value, i, next.done);
          } catch (e) {
            if (!next.done) {
              closeIterator(iterator);
            }
            throw e;
          }
          current = next;
          i++;
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
