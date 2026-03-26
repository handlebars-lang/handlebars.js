import Exception from '../exception';
import { indexOf } from '../utils';
import { NODE_TYPES } from './node-types';

function Visitor() {
  this.parents = [];
}

/**
 * Whether a visitor may dispatch on a node type.
 *
 * A type is dispatchable if the parser produces it, or if the visitor
 * (typically a subclass) defines a handler for it that is not a method of
 * Visitor itself. `in` is used for the latter so that accept, acceptKey and
 * everything inherited from Object.prototype (constructor, __proto__, ...)
 * can never be reached through a crafted `type`.
 *
 * Subclasses that visit untrusted ASTs, such as WhitespaceControl, must
 * therefore define nothing but node handlers as function properties.
 *
 * @param {Visitor} visitor the visitor that would handle the node
 * @param {*} type the untrusted `type` of the node
 * @returns {boolean} true if the visitor may call its `type` method
 */
function isDispatchable(visitor, type) {
  return (
    indexOf(NODE_TYPES, type) !== -1 ||
    (!(type in Visitor.prototype) && typeof visitor[type] === 'function')
  );
}

Visitor.prototype = {
  constructor: Visitor,
  mutating: false,

  // Visits a given value. If mutating, will replace the value if necessary.
  acceptKey: function(node, name) {
    let value = this.accept(node[name]);
    if (this.mutating) {
      if (value && !isDispatchable(this, value.type)) {
        throw new Exception(
          'Unexpected node type "' +
            value.type +
            '" found when accepting ' +
            name +
            ' on ' +
            node.type
        );
      }
      node[name] = value;
    }
  },

  // Performs an accept operation with added sanity check to ensure
  // required keys are not removed.
  acceptRequired: function(node, name) {
    this.acceptKey(node, name);

    if (!node[name]) {
      throw new Exception(node.type + ' requires ' + name);
    }
  },

  // Traverses a given array. If mutating, empty respnses will be removed
  // for child elements.
  acceptArray: function(array) {
    for (let i = 0, l = array.length; i < l; i++) {
      this.acceptKey(array, i);

      if (!array[i]) {
        array.splice(i, 1);
        i--;
        l--;
      }
    }
  },

  accept: function(object) {
    if (!object) {
      return;
    }

    // Dispatching on an unknown type could call an arbitrary method of the
    // visitor (e.g. `accept` itself) with an untrusted AST node.
    if (!isDispatchable(this, object.type) || !this[object.type]) {
      throw new Exception('Unknown type: ' + object.type, object);
    }

    if (this.current) {
      this.parents.unshift(this.current);
    }
    this.current = object;

    let ret = this[object.type](object);

    this.current = this.parents.shift();

    if (!this.mutating || ret) {
      return ret;
    } else if (ret !== false) {
      return object;
    }
  },

  Program: function(program) {
    this.acceptArray(program.body);
  },

  MustacheStatement: visitSubExpression,
  Decorator: visitSubExpression,

  BlockStatement: visitBlock,
  DecoratorBlock: visitBlock,

  PartialStatement: visitPartial,
  PartialBlockStatement: function(partial) {
    visitPartial.call(this, partial);

    this.acceptKey(partial, 'program');
  },

  ContentStatement: function(/* content */) {},
  CommentStatement: function(/* comment */) {},

  SubExpression: visitSubExpression,

  PathExpression: function(/* path */) {},

  StringLiteral: function(/* string */) {},
  NumberLiteral: function(/* number */) {},
  BooleanLiteral: function(/* bool */) {},
  UndefinedLiteral: function(/* literal */) {},
  NullLiteral: function(/* literal */) {},

  Hash: function(hash) {
    this.acceptArray(hash.pairs);
  },
  HashPair: function(pair) {
    this.acceptRequired(pair, 'value');
  }
};

function visitSubExpression(mustache) {
  this.acceptRequired(mustache, 'path');
  this.acceptArray(mustache.params);
  this.acceptKey(mustache, 'hash');
}
function visitBlock(block) {
  visitSubExpression.call(this, block);

  this.acceptKey(block, 'program');
  this.acceptKey(block, 'inverse');
}
function visitPartial(partial) {
  this.acceptRequired(partial, 'name');
  this.acceptArray(partial.params);
  this.acceptKey(partial, 'hash');
}

export default Visitor;
