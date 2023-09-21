import { isArray } from '../utils.js';

/* istanbul ignore if: tested but not covered in istanbul due to dist build  */
const SourceNode = function (line, column, srcFile, chunks) {
  this.src = '';
  if (chunks) {
    this.add(chunks);
  }
};
/* istanbul ignore next */
SourceNode.prototype = {
  add: function (chunks) {
    if (isArray(chunks)) {
      chunks = chunks.join('');
    }
    this.src += chunks;
  },
  prepend: function (chunks) {
    if (isArray(chunks)) {
      chunks = chunks.join('');
    }
    this.src = chunks + this.src;
  },
  toStringWithSourceMap: function () {
    return { code: this.toString() };
  },
  toString: function () {
    return this.src;
  },
};

export { SourceNode };
