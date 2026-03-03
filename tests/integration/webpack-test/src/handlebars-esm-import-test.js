import Handlebars from 'handlebars/lib/handlebars';
import { assertEquals } from './lib/assert';

const template = Handlebars.compile('Author: {{author}}');
assertEquals(template({ author: 'Yehuda' }), 'Author: Yehuda');
