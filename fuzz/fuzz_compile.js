const Handlebars = require('../lib/index.js');

/**
 * @param {Buffer} data
 */
module.exports.fuzz = function (data) {
  try {
    if (data.length < 1) return;
    const flags = data[0];
    const template = data.slice(1).toString();

    // Use the first byte to fuzz runtime options
    const runtimeOptions = {
      allowProtoPropertiesByDefault: !!(flags & 1),
      allowProtoMethodsByDefault: !!(flags & 2),
    };

    // Defaults blacklist constructor. "allowProtoMethodsByDefault" should NOT unblock constructor unless "allowedProtoMethods" explicitly allows it.
    // Let's stick to fuzzing the ByDefault options first.

    const render = Handlebars.compile(template);
    const result = render({}, runtimeOptions);

    // Check if we managed to access a prototype property that returns a function signature or an object
    if (
      result.includes('[native code]') ||
      result.includes('function Object') ||
      result.includes('function Function') ||
      result.includes('function anonymous') ||
      (result.includes('function') && !template.includes('function')) ||
      (result.includes('[object Object]') &&
        !template.includes('[object Object]'))
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
    // Only ignore expected template compilation/rendering errors (Handlebars.Exception).
    if (
      error.name === 'Error' ||
      error.name === 'Handlebars.Exception' ||
      error instanceof Handlebars.Exception
    ) {
      return;
    }
    // Rethrow unexpected crashes (e.g., TypeError, RangeError) so Jazzer flags them
    throw error;
  }
};
