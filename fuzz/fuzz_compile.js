const Handlebars = require('../lib/index.js');

/**
 * @param {Buffer} data
 */
module.exports.fuzz = function (data) {
  try {
    const template = data.toString();
    const render = Handlebars.compile(template);
    const result = render({});

    // Check if we managed to access a prototype property that returns a function signature
    if (
      result.includes('[native code]') ||
      result.includes('function Object') ||
      result.includes('function Function') ||
      result.includes('function anonymous') ||
      (result.includes('function') && !template.includes('function'))
    ) {
      throw new Error('Prototype Access Detected: ' + result);
    }
  } catch (error) {
    if (
      error.message &&
      error.message.startsWith('Prototype Access Detected')
    ) {
      throw error;
    }
    // Ignore other errors
  }
};
