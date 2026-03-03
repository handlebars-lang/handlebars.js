import { assertEquals } from './lib/assert';

import testTemplate from './test-template.handlebars';
assertEquals(testTemplate({ author: 'Yehuda' }).trim(), 'Author: Yehuda');

const testTemplateRequire = require('./test-template.handlebars');
assertEquals(
  testTemplateRequire({ author: 'Yehuda' }).trim(),
  'Author: Yehuda'
);
