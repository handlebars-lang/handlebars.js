/* global define, require */
import { isArray } from '../utils';

// Matches any character that quotedString may have to escape: quotes,
// backslashes, control characters, line separators, surrogates and "<". Most
// strings, e.g. lookup names, contain none of them and can skip the escaping.
// eslint-disable-next-line no-control-regex
const NEEDS_ESCAPING = /[\x00-\x1f\\"\u2028\u2029<\ud800-\udfff]/;

// Per HTML "Restrictions for contents of script elements": "<!--", "<script"
// and "</script" can end or change the parsing of an enclosing <script>
// element.
const SCRIPT_DELIMITERS = /<(?=!--|\/?script)/gi;

/**
 * Escape the "<" of every sequence that could end or change the parsing of
 * an enclosing <script> element.
 *
 * Only pass JavaScript or JSON code in which "<" can only occur inside string
 * literals, where "\u003C" has the same value.
 *
 * @param {string} code the code to escape
 * @returns {string} the escaped code
 */
function escapeScriptDelimiters(code) {
  return code.replace(SCRIPT_DELIMITERS, '\\u003C');
}

/**
 * Escape a UTF-16 surrogate code unit as a "\uXXXX" escape sequence.
 *
 * @param {string} surrogate a single surrogate code unit
 * @returns {string} the escape sequence
 */
function escapeSurrogate(surrogate) {
  return '\\u' + surrogate.charCodeAt(0).toString(16);
}

/**
 * Convert a value to a JSON literal that is safe to write into generated
 * code: valid in ES5, where line and paragraph separators end string literals,
 * encodable as UTF-8 on every engine, and safe inside an enclosing <script>
 * element.
 *
 * @param {*} value the value to convert
 * @returns {string} the JavaScript literal
 */
export function safeJsonLiteral(value) {
  return escapeScriptDelimiters(
    JSON.stringify(value)
      .replace(/\u2028/g, '\\u2028')
      .replace(/\u2029/g, '\\u2029')
      // Engines before ES2019 leave lone surrogates unescaped, and those cannot
      // be encoded as UTF-8. Escaping paired ones as well keeps the value.
      .replace(/[\ud800-\udfff]/g, escapeSurrogate)
  );
}

let SourceNode;

try {
  /* istanbul ignore next */
  if (typeof define !== 'function' || !define.amd) {
    // We don't support this in AMD environments. For these environments, we assume that
    // they are running on the browser and thus have no need for the source-map library.
    let SourceMap = require('source-map');
    SourceNode = SourceMap.SourceNode;
  }
} catch (err) {
  /* NOP */
}

/* istanbul ignore if: tested but not covered in istanbul due to dist build  */
if (!SourceNode) {
  SourceNode = function(line, column, srcFile, chunks) {
    this.src = '';
    if (chunks) {
      this.add(chunks);
    }
  };
  /* istanbul ignore next */
  SourceNode.prototype = {
    add: function(chunks) {
      if (isArray(chunks)) {
        chunks = chunks.join('');
      }
      this.src += chunks;
    },
    prepend: function(chunks) {
      if (isArray(chunks)) {
        chunks = chunks.join('');
      }
      this.src = chunks + this.src;
    },
    toStringWithSourceMap: function() {
      return { code: this.toString() };
    },
    toString: function() {
      return this.src;
    }
  };
}

function castChunk(chunk, codeGen, loc) {
  if (isArray(chunk)) {
    let ret = [];

    for (let i = 0, len = chunk.length; i < len; i++) {
      ret.push(codeGen.wrap(chunk[i], loc));
    }
    return ret;
  } else if (typeof chunk === 'boolean' || typeof chunk === 'number') {
    // Handle primitives that the SourceNode will throw up on
    return chunk + '';
  }
  return chunk;
}

function CodeGen(srcFile) {
  this.srcFile = srcFile;
  this.source = [];
}

CodeGen.prototype = {
  isEmpty() {
    return !this.source.length;
  },
  prepend: function(source, loc) {
    this.source.unshift(this.wrap(source, loc));
  },
  push: function(source, loc) {
    this.source.push(this.wrap(source, loc));
  },

  merge: function() {
    let source = this.empty();
    this.each(function(line) {
      source.add(['  ', line, '\n']);
    });
    return source;
  },

  each: function(iter) {
    for (let i = 0, len = this.source.length; i < len; i++) {
      iter(this.source[i]);
    }
  },

  empty: function() {
    let loc = this.currentLocation || { start: {} };
    return new SourceNode(loc.start.line, loc.start.column, this.srcFile);
  },
  wrap: function(chunk, loc = this.currentLocation || { start: {} }) {
    if (chunk instanceof SourceNode) {
      return chunk;
    }

    chunk = castChunk(chunk, this, loc);

    return new SourceNode(
      loc.start.line,
      loc.start.column,
      this.srcFile,
      chunk
    );
  },

  functionCall: function(fn, type, params) {
    params = this.generateList(params);
    return this.wrap([fn, type ? '.' + type + '(' : '(', params, ')']);
  },

  quotedString: function(str) {
    str = str + '';
    // Fast path: quotedString runs for every lookup name and content string,
    // and the chain of replacements below is much slower than a single test.
    if (!NEEDS_ESCAPING.test(str)) {
      return '"' + str + '"';
    }

    // JSON.stringify escapes quotes, backslashes and control characters;
    // safeJsonLiteral adds line separators, surrogates and script delimiters.
    return safeJsonLiteral(str);
  },

  objectLiteral: function(obj) {
    let pairs = [];

    Object.keys(obj).forEach(key => {
      let value = castChunk(obj[key], this);
      if (value !== 'undefined') {
        pairs.push([this.quotedString(key), ':', value]);
      }
    });

    let ret = this.generateList(pairs);
    ret.prepend('{');
    ret.add('}');
    return ret;
  },

  generateList: function(entries) {
    let ret = this.empty();

    for (let i = 0, len = entries.length; i < len; i++) {
      if (i) {
        ret.add(',');
      }

      ret.add(castChunk(entries[i], this));
    }

    return ret;
  },

  generateArray: function(entries) {
    let ret = this.generateList(entries);
    ret.prepend('[');
    ret.add(']');

    return ret;
  }
};

export default CodeGen;
