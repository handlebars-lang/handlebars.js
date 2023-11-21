const Handlebars = require('../dist/cjs/handlebars')['default'];

const ignored = [
  'Parse error',
  'Lexical error',
  `doesn't match`,
  'Invalid path',
  'Unsupported number of partial arguments',
];

function ignoredError(error) {
  return !!ignored.some((message) => error.message.includes(message));
}

/**
 * @param {Buffer} data
 */
module.exports.fuzz = function (data) {
  try {
    const ast = Handlebars.parse(data.toString());
    Handlebars.compile(ast, {});
  } catch (error) {
    if (error.message && !ignoredError(error)) {
      throw error;
    }
  }
};
