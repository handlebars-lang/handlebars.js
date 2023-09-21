import handlebars from './handlebars/index.js';
import { PrintVisitor, print } from '@handlebars/parser';

handlebars.PrintVisitor = PrintVisitor;
handlebars.print = print;

export default handlebars;
