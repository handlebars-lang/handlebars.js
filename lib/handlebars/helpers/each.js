import {
  appendContextPath,
  blockParams,
  createFrame,
  isArray,
  isFunction
} from '../utils';
import Exception from '../exception';

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
  } catch (closeError) {
    // NOP
  }
}

export default function(instance) {
  instance.registerHelper('each', function(context, options) {
    if (!options) {
      throw new Exception('Must pass iterator to #each');
    }

    let fn = options.fn,
      inverse = options.inverse,
      i = 0,
      ret = '',
      data,
      contextPath;

    if (options.data && options.ids) {
      contextPath =
        appendContextPath(options.data.contextPath, options.ids[0]) + '.';
    }

    if (isFunction(context)) {
      context = context.call(this);
    }

    if (options.data) {
      data = createFrame(options.data);
    }

    function execIteration(field, index, last, value) {
      if (data) {
        data.key = field;
        data.index = index;
        data.first = index === 0;
        data.last = !!last;

        if (contextPath) {
          data.contextPath = contextPath + field;
        }
      }

      ret =
        ret +
        fn(value, {
          data: data,
          blockParams: blockParams([value, field], [contextPath + field, null])
        });
    }

    if (context && typeof context === 'object') {
      if (isArray(context)) {
        for (let j = context.length; i < j; i++) {
          if (i in context) {
            execIteration(i, i, i === context.length - 1, context[i]);
          }
        }
      } else if (typeof Symbol === 'function' && context[Symbol.iterator]) {
        const iterator = context[Symbol.iterator]();
        let current = iterator.next();
        while (!current.done) {
          let next = iterator.next();
          try {
            execIteration(i, i, next.done, current.value);
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

        Object.keys(context).forEach(key => {
          // We're running the iterations one step out of sync so we can detect
          // the last iteration without have to scan the object twice and create
          // an itermediate keys array.
          if (priorKey !== undefined) {
            execIteration(priorKey, i - 1, false, context[priorKey]);
          }
          priorKey = key;
          i++;
        });
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
