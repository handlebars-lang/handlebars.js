describe('javascript-compiler api', function () {
  if (!Handlebars.JavaScriptCompiler) {
    return;
  }

  describe('#nameLookup', function () {
    var $superName;
    beforeEach(function () {
      $superName = handlebarsEnv.JavaScriptCompiler.prototype.nameLookup;
    });
    afterEach(function () {
      handlebarsEnv.JavaScriptCompiler.prototype.nameLookup = $superName;
    });

    it('should allow override', function () {
      handlebarsEnv.JavaScriptCompiler.prototype.nameLookup = function (
        parent,
        name
      ) {
        return parent + '.bar_' + name;
      };
      /* eslint-disable camelcase */
      expectTemplate('{{foo}}')
        .withInput({ bar_foo: 'food' })
        .toCompileTo('food');
      /* eslint-enable camelcase */
    });

    // Tests nameLookup dot vs. bracket behavior.  Bracket is required in certain cases
    // to avoid errors in older browsers.
    it('should handle reserved words', function () {
      expectTemplate('{{foo}} {{~null~}}')
        .withInput({ foo: 'food' })
        .toCompileTo('food');
    });
  });
  describe('#compilerInfo', function () {
    var $superCheck, $superInfo;
    beforeEach(function () {
      $superCheck = handlebarsEnv.VM.checkRevision;
      $superInfo = handlebarsEnv.JavaScriptCompiler.prototype.compilerInfo;
    });
    afterEach(function () {
      handlebarsEnv.VM.checkRevision = $superCheck;
      handlebarsEnv.JavaScriptCompiler.prototype.compilerInfo = $superInfo;
    });
    it('should allow compilerInfo override', function () {
      handlebarsEnv.JavaScriptCompiler.prototype.compilerInfo = function () {
        return 'crazy';
      };
      handlebarsEnv.VM.checkRevision = function (compilerInfo) {
        if (compilerInfo !== 'crazy') {
          throw new Error("It didn't work");
        }
      };
      expectTemplate('{{foo}} ')
        .withInput({ foo: 'food' })
        .toCompileTo('food ');
    });
  });
  describe('buffer', function () {
    var $superAppend, $superCreate;
    beforeEach(function () {
      handlebarsEnv.JavaScriptCompiler.prototype.forceBuffer = true;
      $superAppend = handlebarsEnv.JavaScriptCompiler.prototype.appendToBuffer;
      $superCreate =
        handlebarsEnv.JavaScriptCompiler.prototype.initializeBuffer;
    });
    afterEach(function () {
      handlebarsEnv.JavaScriptCompiler.prototype.forceBuffer = false;
      handlebarsEnv.JavaScriptCompiler.prototype.appendToBuffer = $superAppend;
      handlebarsEnv.JavaScriptCompiler.prototype.initializeBuffer =
        $superCreate;
    });

    it('should allow init buffer override', function () {
      handlebarsEnv.JavaScriptCompiler.prototype.initializeBuffer =
        function () {
          return this.quotedString('foo_');
        };
      expectTemplate('{{foo}} ')
        .withInput({ foo: 'food' })
        .toCompileTo('foo_food ');
    });
    it('should allow append buffer override', function () {
      handlebarsEnv.JavaScriptCompiler.prototype.appendToBuffer = function (
        string
      ) {
        return $superAppend.call(this, [string, ' + "_foo"']);
      };
      expectTemplate('{{foo}}')
        .withInput({ foo: 'food' })
        .toCompileTo('food_foo');
    });
  });

  describe('#isValidJavaScriptVariableName', function () {
    // It is there and accessible and could be used by someone. That's why we don't remove it
    // it 4.x. But if we keep it, we add a test
    // This test should not encourage you to use the function. It is not needed any more
    // and might be removed in 5.0
    ['test', 'abc123', 'abc_123'].forEach(function (validVariableName) {
      it("should return true for '" + validVariableName + "'", function () {
        expect(
          handlebarsEnv.JavaScriptCompiler.isValidJavaScriptVariableName(
            validVariableName
          )
        ).to.be.true();
      });
    });
    [('123test', 'abc()', 'abc.cde')].forEach(function (invalidVariableName) {
      it("should return true for '" + invalidVariableName + "'", function () {
        expect(
          handlebarsEnv.JavaScriptCompiler.isValidJavaScriptVariableName(
            invalidVariableName
          )
        ).to.be.false();
      });
    });
  });
});
