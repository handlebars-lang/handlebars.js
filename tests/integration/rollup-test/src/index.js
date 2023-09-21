import Handlebars from 'handlebars';

const template = Handlebars.compile('Author: {{author}}');
const result = template({ author: 'Yehuda' });

if (result !== 'Author: Yehuda') {
  throw Error('Assertion failed');
}
