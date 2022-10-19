describe('ast', function () {
  if (!Handlebars.AST) {
    return;
  }

  var AST = Handlebars.AST;

  describe('BlockStatement', function () {
    it('should throw on mustache mismatch', function () {
      shouldThrow(
        function () {
          handlebarsEnv.parse('\n  {{#foo}}{{/bar}}');
        },
        Handlebars.Exception,
        "foo doesn't match bar - 2:5"
      );
    });
  });

  describe('helpers', function () {
    describe('#helperExpression', function () {
      it('should handle mustache statements', function () {
        equals(
          AST.helpers.helperExpression({
            type: 'MustacheStatement',
            params: [],
            hash: undefined,
          }),
          false
        );
        equals(
          AST.helpers.helperExpression({
            type: 'MustacheStatement',
            params: [1],
            hash: undefined,
          }),
          true
        );
        equals(
          AST.helpers.helperExpression({
            type: 'MustacheStatement',
            params: [],
            hash: {},
          }),
          true
        );
      });
      it('should handle block statements', function () {
        equals(
          AST.helpers.helperExpression({
            type: 'BlockStatement',
            params: [],
            hash: undefined,
          }),
          false
        );
        equals(
          AST.helpers.helperExpression({
            type: 'BlockStatement',
            params: [1],
            hash: undefined,
          }),
          true
        );
        equals(
          AST.helpers.helperExpression({
            type: 'BlockStatement',
            params: [],
            hash: {},
          }),
          true
        );
      });
      it('should handle subexpressions', function () {
        equals(AST.helpers.helperExpression({ type: 'SubExpression' }), true);
      });
      it('should work with non-helper nodes', function () {
        equals(AST.helpers.helperExpression({ type: 'Program' }), false);

        equals(
          AST.helpers.helperExpression({ type: 'PartialStatement' }),
          false
        );
        equals(
          AST.helpers.helperExpression({ type: 'ContentStatement' }),
          false
        );
        equals(
          AST.helpers.helperExpression({ type: 'CommentStatement' }),
          false
        );

        equals(AST.helpers.helperExpression({ type: 'PathExpression' }), false);

        equals(AST.helpers.helperExpression({ type: 'StringLiteral' }), false);
        equals(AST.helpers.helperExpression({ type: 'NumberLiteral' }), false);
        equals(AST.helpers.helperExpression({ type: 'BooleanLiteral' }), false);
        equals(
          AST.helpers.helperExpression({ type: 'UndefinedLiteral' }),
          false
        );
        equals(AST.helpers.helperExpression({ type: 'NullLiteral' }), false);

        equals(AST.helpers.helperExpression({ type: 'Hash' }), false);
        equals(AST.helpers.helperExpression({ type: 'HashPair' }), false);
      });
    });
  });

  describe('Line Numbers', function () {
    var ast, body;

    function testColumns(node, firstLine, lastLine, firstColumn, lastColumn) {
      equals(node.loc.start.line, firstLine);
      equals(node.loc.start.column, firstColumn);
      equals(node.loc.end.line, lastLine);
      equals(node.loc.end.column, lastColumn);
    }

    /* eslint-disable no-multi-spaces */
    ast = Handlebars.parse(
      'line 1 {{line1Token}}\n' + // 1
        ' line 2 {{line2token}}\n' + // 2
        ' line 3 {{#blockHelperOnLine3}}\n' + // 3
        'line 4{{line4token}}\n' + // 4
        'line5{{else}}\n' + // 5
        '{{line6Token}}\n' + // 6
        '{{/blockHelperOnLine3}}\n' + // 7
        '{{#open}}\n' + // 8
        '{{else inverse}}\n' + // 9
        '{{else}}\n' + // 10
        '{{/open}}'
    ); // 11
    /* eslint-enable no-multi-spaces */
    body = ast.body;

    it('gets ContentNode line numbers', function () {
      var contentNode = body[0];
      testColumns(contentNode, 1, 1, 0, 7);
    });

    it('gets MustacheStatement line numbers', function () {
      var mustacheNode = body[1];
      testColumns(mustacheNode, 1, 1, 7, 21);
    });

    it('gets line numbers correct when newlines appear', function () {
      testColumns(body[2], 1, 2, 21, 8);
    });

    it('gets MustacheStatement line numbers correct across newlines', function () {
      var secondMustacheStatement = body[3];
      testColumns(secondMustacheStatement, 2, 2, 8, 22);
    });

    it('gets the block helper information correct', function () {
      var blockHelperNode = body[5];
      testColumns(blockHelperNode, 3, 7, 8, 23);
    });

    it('correctly records the line numbers the program of a block helper', function () {
      var blockHelperNode = body[5],
        program = blockHelperNode.program;

      testColumns(program, 3, 5, 31, 5);
    });

    it('correctly records the line numbers of an inverse of a block helper', function () {
      var blockHelperNode = body[5],
        inverse = blockHelperNode.inverse;

      testColumns(inverse, 5, 7, 13, 0);
    });

    it('correctly records the line number of chained inverses', function () {
      var chainInverseNode = body[7];

      testColumns(chainInverseNode.program, 8, 9, 9, 0);
      testColumns(chainInverseNode.inverse, 9, 10, 16, 0);
      testColumns(chainInverseNode.inverse.body[0].program, 9, 10, 16, 0);
      testColumns(chainInverseNode.inverse.body[0].inverse, 10, 11, 8, 0);
    });
  });
});
