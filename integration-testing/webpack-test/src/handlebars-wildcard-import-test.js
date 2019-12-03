import * as Handlebars from 'handlebars';
import { assertEquals } from './lib/assert';

const template = Handlebars.compile('Author: {{author}}');
assertEquals(template({ author: 'Yehuda' }), 'Author: Yehuda');
