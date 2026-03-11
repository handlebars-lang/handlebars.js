import Handlebars from 'handlebars';
import { assertEquals } from './lib/assert';

Handlebars.registerHelper('loud', function (text) {
  return text.toUpperCase();
});

const template = Handlebars.compile('Author: {{loud author}}');
assertEquals(template({ author: 'Yehuda' }), 'Author: YEHUDA');
