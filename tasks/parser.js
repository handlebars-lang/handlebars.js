const { execFileWithInheritedOutput } = require('./util/exec-file');
const { createRegisterAsyncTaskFn } = require('./util/async-grunt-task');

const OUTPUT_FILE = 'lib/handlebars/compiler/parser.js';

module.exports = function(grunt) {
  const registerAsyncTask = createRegisterAsyncTaskFn(grunt);

  registerAsyncTask('parser', async () => {
    await runJison();
    combineWithPrefixAndSuffix();
    grunt.log.writeln(`Parser "${OUTPUT_FILE}" created.`);
  });

  async function runJison() {
    await execFileWithInheritedOutput('jison', [
      '-m',
      'js',
      'src/handlebars.yy',
      'src/handlebars.l'
    ]);
  }

  function combineWithPrefixAndSuffix() {
    const combinedParserSourceCode =
      grunt.file.read('src/parser-prefix.js') +
      grunt.file.read('handlebars.js') +
      grunt.file.read('src/parser-suffix.js');

    grunt.file.write(OUTPUT_FILE, combinedParserSourceCode);
    grunt.file.delete('handlebars.js');
  }
};
