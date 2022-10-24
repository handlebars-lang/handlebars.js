import Handlebars from 'handlebars/lib/handlebars';

const template = Handlebars.compile('Author: {{author}}');
const result = template({ author: 'Yehuda' });

if (result !== 'Author: Yehuda') {
  throw Error('Assertion failed');
}
