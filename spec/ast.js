describe('ast', function () {
  if (!Handlebars.AST) {
    return;
  }

  var AST = Handlebars.AST;

  describe('BlockStatement', function () {
    it('should throw on mustache mismatch', function () {
      expect(function () {
        handlebarsEnv.parse('\n  {{#foo}}{{/bar}}');
      }).toThrow("foo doesn't match bar - 2:5");
    });
  });

  describe('helpers', function () {
    describe('#helperExpression', function () {
      it('should handle mustache statements', function () {
        expect(
          AST.helpers.helperExpression({
            type: 'MustacheStatement',
            params: [],
            hash: undefined,
          })
        ).toBe(false);
        expect(
          AST.helpers.helperExpression({
            type: 'MustacheStatement',
            params: [1],
            hash: undefined,
          })
        ).toBe(true);
        expect(
          AST.helpers.helperExpression({
            type: 'MustacheStatement',
            params: [],
            hash: {},
          })
        ).toBe(true);
      });
      it('should handle block statements', function () {
        expect(
          AST.helpers.helperExpression({
            type: 'BlockStatement',
            params: [],
            hash: undefined,
          })
        ).toBe(false);
        expect(
          AST.helpers.helperExpression({
            type: 'BlockStatement',
            params: [1],
            hash: undefined,
          })
        ).toBe(true);
        expect(
          AST.helpers.helperExpression({
            type: 'BlockStatement',
            params: [],
            hash: {},
          })
        ).toBe(true);
      });
      it('should handle subexpressions', function () {
        expect(AST.helpers.helperExpression({ type: 'SubExpression' })).toBe(
          true
        );
      });
      it('should work with non-helper nodes', function () {
        expect(AST.helpers.helperExpression({ type: 'Program' })).toBe(false);

        expect(AST.helpers.helperExpression({ type: 'PartialStatement' })).toBe(
          false
        );
        expect(AST.helpers.helperExpression({ type: 'ContentStatement' })).toBe(
          false
        );
        expect(AST.helpers.helperExpression({ type: 'CommentStatement' })).toBe(
          false
        );

        expect(AST.helpers.helperExpression({ type: 'PathExpression' })).toBe(
          false
        );

        expect(AST.helpers.helperExpression({ type: 'StringLiteral' })).toBe(
          false
        );
        expect(AST.helpers.helperExpression({ type: 'NumberLiteral' })).toBe(
          false
        );
        expect(AST.helpers.helperExpression({ type: 'BooleanLiteral' })).toBe(
          false
        );
        expect(AST.helpers.helperExpression({ type: 'UndefinedLiteral' })).toBe(
          false
        );
        expect(AST.helpers.helperExpression({ type: 'NullLiteral' })).toBe(
          false
        );

        expect(AST.helpers.helperExpression({ type: 'Hash' })).toBe(false);
        expect(AST.helpers.helperExpression({ type: 'HashPair' })).toBe(false);
      });
    });
  });

  describe('Line Numbers', function () {
    var ast, body;

    function testColumns(node, firstLine, lastLine, firstColumn, lastColumn) {
      expect(node.loc.start.line).toBe(firstLine);
      expect(node.loc.start.column).toBe(firstColumn);
      expect(node.loc.end.line).toBe(lastLine);
      expect(node.loc.end.column).toBe(lastColumn);
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
