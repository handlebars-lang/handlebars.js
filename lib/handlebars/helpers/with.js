import {isEmpty, isFunction} from '../utils';

export default function(instance) {
  instance.registerHelper('with', function(context, options) {
    let async;
    if (isFunction(context) && context.length) {
      async = context;
    } else {
      if (isFunction(context)) { context = context.call(this); }
      async = function(fn) {
        return fn(context);
      };
    }

    return async.call(this, function(context) {
      let fn = options.fn;

      if (!isEmpty(context)) {
        let data = options.data;

        return fn(context, {
          data: data,
          blockParams: [context]
        });
      } else {
        return options.inverse(this);
      }
    }, options.hash);
  });
}
