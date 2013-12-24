/*global Handlebars, beforeEach, handlebarsEnv, shouldCompileTo */
describe('javascript-compiler api', function() {
  if (!Handlebars.JavaScriptCompiler) {
    return;
  }

  describe('#nameLookup', function() {
    var $superName;
    beforeEach(function() {
      $superName = handlebarsEnv.JavaScriptCompiler.prototype.nameLookup;
    });
    afterEach(function() {
      handlebarsEnv.JavaScriptCompiler.prototype.nameLookup = $superName;
    });

    it('should allow override', function() {
      handlebarsEnv.JavaScriptCompiler.prototype.nameLookup = function(parent, name) {
        return parent + '.bar_' + name;
      };
      shouldCompileTo("{{foo}}", { bar_foo: "food" }, "food");
    });
  });
  describe('buffer', function() {
    var $superAppend, $superCreate;
    beforeEach(function() {
      $superAppend = handlebarsEnv.JavaScriptCompiler.prototype.appendToBuffer;
      $superCreate = handlebarsEnv.JavaScriptCompiler.prototype.initializeBuffer;
    });
    afterEach(function() {
      handlebarsEnv.JavaScriptCompiler.prototype.appendToBuffer = $superAppend;
      handlebarsEnv.JavaScriptCompiler.prototype.initializeBuffer = $superCreate;
    });

    it('should allow init buffer override', function() {
      handlebarsEnv.JavaScriptCompiler.prototype.initializeBuffer = function() {
        return this.quotedString('foo_');
      };
      shouldCompileTo("{{foo}} ", { foo: "food" }, "foo_food ");
    });
    it('should allow append buffer override', function() {
      handlebarsEnv.JavaScriptCompiler.prototype.appendToBuffer = function(string) {
        return $superAppend.call(this, string + ' + "_foo"');
      };
      shouldCompileTo("{{foo}}", { foo: "food" }, "food_foo");
    });
  });
});
