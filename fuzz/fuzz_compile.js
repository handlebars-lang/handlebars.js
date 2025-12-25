const Handlebars = require('../lib/index.js');

/**
 * @param {Buffer} data
 */
module.exports.fuzz = function (data) {
  try {
    const template = data.toString();
    Handlebars.compile(template);
  } catch (error) {
    // Ignore compilation errors as they are expected for invalid templates
  }
};
