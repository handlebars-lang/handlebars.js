import * as HandlebarsViaImport from 'handlebars';
const HandlebarsViaRequire = require('handlebars');
import { assertEquals } from './lib/assert';

HandlebarsViaImport.registerHelper('loud', function (text) {
  return text.toUpperCase();
});

const template = HandlebarsViaRequire.compile('Author: {{loud author}}');
assertEquals(template({ author: 'Yehuda' }), 'Author: YEHUDA');
