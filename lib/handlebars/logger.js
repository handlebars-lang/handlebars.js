import { indexOf } from './utils';

let logger = {
  methodMap: ['debug', 'info', 'warn', 'error'],
  level: 'info',
  depth: 2,

  // Maps a given level value to the `methodMap` indexes above.
  lookupLevel: function (level) {
    if (typeof level === 'string') {
      let levelMap = indexOf(logger.methodMap, level.toLowerCase());
      if (levelMap >= 0) {
        level = levelMap;
      } else {
        level = parseInt(level, 10);
      }
    }

    return level;
  },

  convertDepth: function (depth) {
    depth = parseInt(depth, 10);
    if (isNaN(depth) || depth < 0) {
      depth = logger.depth;
    }

    return depth;
  },

  // Can be overridden in the host environment
  log: function (level, depth, ...message) {
    level = logger.lookupLevel(level);
    depth = logger.convertDepth(depth);

    if (
      typeof console !== 'undefined' &&
      logger.lookupLevel(logger.level) <= level
    ) {
      let method = logger.methodMap[level];
      // eslint-disable-next-line no-console
      if (!console[method]) {
        method = 'log';
      }

      const isNodeEnvironment =
        typeof process !== 'undefined' &&
        process.versions && // eslint-disable-line no-undef
        process.versions.node; // eslint-disable-line no-undef
      if (isNodeEnvironment && depth !== 2) {
        const { inspect } = import('util');
        message = message.map((msg) => {
          return inspect(msg, {
            depth: depth,
            colors: true,
          });
        });
      }

      console[method](...message); // eslint-disable-line no-console
    }
  },
};

export default logger;
