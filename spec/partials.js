/*global CompilerContext, shouldCompileTo, shouldCompileToWithPartials */
describe('partials', function() {
  it("basic partials", function() {
    var string = "Dudes: {{#dudes}}{{> dude}}{{/dudes}}";
    var partial = "{{name}} ({{url}}) ";
    var hash = {dudes: [{name: "Yehuda", url: "http://yehuda"}, {name: "Alan", url: "http://alan"}]};
    shouldCompileToWithPartials(string, [hash, {}, {dude: partial}], true, "Dudes: Yehuda (http://yehuda) Alan (http://alan) ",
                    "Basic partials output based on current context.");
  });

  it("partials with context", function() {
    var string = "Dudes: {{>dude dudes}}";
    var partial = "{{#this}}{{name}} ({{url}}) {{/this}}";
    var hash = {dudes: [{name: "Yehuda", url: "http://yehuda"}, {name: "Alan", url: "http://alan"}]};
    shouldCompileToWithPartials(string, [hash, {}, {dude: partial}], true, "Dudes: Yehuda (http://yehuda) Alan (http://alan) ",
                    "Partials can be passed a context");
  });

  it("partials with undefined context", function() {
    var string = "Dudes: {{>dude dudes}}";
    var partial = "{{foo}} Empty";
    var hash = {};
    shouldCompileToWithPartials(string, [hash, {}, {dude: partial}], true, "Dudes:  Empty");
  });

  it("partial in a partial", function() {
    var string = "Dudes: {{#dudes}}{{>dude}}{{/dudes}}";
    var dude = "{{name}} {{> url}} ";
    var url = "<a href='{{url}}'>{{url}}</a>";
    var hash = {dudes: [{name: "Yehuda", url: "http://yehuda"}, {name: "Alan", url: "http://alan"}]};
    shouldCompileToWithPartials(string, [hash, {}, {dude: dude, url: url}], true, "Dudes: Yehuda <a href='http://yehuda'>http://yehuda</a> Alan <a href='http://alan'>http://alan</a> ", "Partials are rendered inside of other partials");
  });

  it("rendering undefined partial throws an exception", function() {
    shouldThrow(function() {
        var template = CompilerContext.compile("{{> whatever}}");
        template();
    }, Handlebars.Exception, 'The partial whatever could not be found');
  });

  it("rendering template partial in vm mode throws an exception", function() {
    shouldThrow(function() {
      var template = CompilerContext.compile("{{> whatever}}");
      template();
    }, Handlebars.Exception, 'The partial whatever could not be found');
  });

  it("rendering function partial in vm mode", function() {
    var string = "Dudes: {{#dudes}}{{> dude}}{{/dudes}}";
    var partial = function(context) {
      return context.name + ' (' + context.url + ') ';
    };
    var hash = {dudes: [{name: "Yehuda", url: "http://yehuda"}, {name: "Alan", url: "http://alan"}]};
    shouldCompileTo(string, [hash, {}, {dude: partial}], "Dudes: Yehuda (http://yehuda) Alan (http://alan) ",
                    "Function partials output based in VM.");
  });

  it("GH-14: a partial preceding a selector", function() {
     var string = "Dudes: {{>dude}} {{another_dude}}";
     var dude = "{{name}}";
     var hash = {name:"Jeepers", another_dude:"Creepers"};
     shouldCompileToWithPartials(string, [hash, {}, {dude:dude}], true, "Dudes: Jeepers Creepers", "Regular selectors can follow a partial");
  });

  it("Partials with slash paths", function() {
    var string = "Dudes: {{> shared/dude}}";
    var dude = "{{name}}";
    var hash = {name:"Jeepers", another_dude:"Creepers"};
    shouldCompileToWithPartials(string, [hash, {}, {'shared/dude':dude}], true, "Dudes: Jeepers", "Partials can use literal paths");
  });

  it("Partials with slash and point paths", function() {
    var string = "Dudes: {{> shared/dude.thing}}";
    var dude = "{{name}}";
    var hash = {name:"Jeepers", another_dude:"Creepers"};
    shouldCompileToWithPartials(string, [hash, {}, {'shared/dude.thing':dude}], true, "Dudes: Jeepers", "Partials can use literal with points in paths");
  });

  it("Global Partials", function() {
    handlebarsEnv.registerPartial('global_test', '{{another_dude}}');

    var string = "Dudes: {{> shared/dude}} {{> global_test}}";
    var dude = "{{name}}";
    var hash = {name:"Jeepers", another_dude:"Creepers"};
    shouldCompileToWithPartials(string, [hash, {}, {'shared/dude':dude}], true, "Dudes: Jeepers Creepers", "Partials can use globals or passed");
  });

  it("Multiple partial registration", function() {
    handlebarsEnv.registerPartial({
      'shared/dude': '{{name}}',
      global_test: '{{another_dude}}'
    });

    var string = "Dudes: {{> shared/dude}} {{> global_test}}";
    var hash = {name:"Jeepers", another_dude:"Creepers"};
    shouldCompileToWithPartials(string, [hash], true, "Dudes: Jeepers Creepers", "Partials can use globals or passed");
  });

  it("Partials with integer path", function() {
    var string = "Dudes: {{> 404}}";
    var dude = "{{name}}";
    var hash = {name:"Jeepers", another_dude:"Creepers"};
    shouldCompileToWithPartials(string, [hash, {}, {404:dude}], true, "Dudes: Jeepers", "Partials can use literal paths");
  });

  it("Partials with complex path", function() {
    var string = "Dudes: {{> 404/asdf?.bar}}";
    var dude = "{{name}}";
    var hash = {name:"Jeepers", another_dude:"Creepers"};
    shouldCompileToWithPartials(string, [hash, {}, {'404/asdf?.bar':dude}], true, "Dudes: Jeepers", "Partials can use literal paths");
  });

  it("Partials with escaped", function() {
    var string = "Dudes: {{> [+404/asdf?.bar]}}";
    var dude = "{{name}}";
    var hash = {name:"Jeepers", another_dude:"Creepers"};
    shouldCompileToWithPartials(string, [hash, {}, {'+404/asdf?.bar':dude}], true, "Dudes: Jeepers", "Partials can use literal paths");
  });

  it("Partials with string", function() {
    var string = "Dudes: {{> \"+404/asdf?.bar\"}}";
    var dude = "{{name}}";
    var hash = {name:"Jeepers", another_dude:"Creepers"};
    shouldCompileToWithPartials(string, [hash, {}, {'+404/asdf?.bar':dude}], true, "Dudes: Jeepers", "Partials can use literal paths");
  });

  it('should handle empty partial', function() {
    var string = "Dudes: {{#dudes}}{{> dude}}{{/dudes}}";
    var partial = "";
    var hash = {dudes: [{name: "Yehuda", url: "http://yehuda"}, {name: "Alan", url: "http://alan"}]};
    shouldCompileToWithPartials(string, [hash, {}, {dude: partial}], true, "Dudes: ");  });
});
