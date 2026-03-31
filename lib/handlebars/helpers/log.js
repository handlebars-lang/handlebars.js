export default function (instance) {
  instance.registerHelper('log', function (/* message, options */) {
    let args = [undefined],
      options = arguments[arguments.length - 1];
    for (let i = 0; i < arguments.length - 1; i++) {
      args.push(arguments[i]);
    }

    let level = 1;
    if (options.hash.level != null) {
      level = options.hash.level;
    } else if (options.data && options.data.level != null) {
      level = options.data.level;
    }
    args[0] = level;

    // Only add depth to args if it's explicitly provided via hash
    // (not from options.data.depth, which is reserved for template nesting depth)
    let depth;
    if (options.hash.depth != null) {
      depth = options.hash.depth;
    }
    if (depth != null) {
      // Normalize depth to a number to avoid type/ordering ambiguity in logger
      let numericDepth = typeof depth === 'number' ? depth : Number(depth);
      if (!Number.isNaN(numericDepth)) {
        // Use a sentinel object to pass depth to avoid ambiguity with numeric messages
        args.splice(1, 0, { __handlebarsLoggerDepth: numericDepth });
      }
    }

    instance.log(...args);
  });
}
