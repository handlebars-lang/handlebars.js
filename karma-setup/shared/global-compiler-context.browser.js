window.CompilerContext = {
  compile: function(template, options) {
    var templateSpec = handlebarsEnv.precompile(template, options);
    return handlebarsEnv.template(safeEval(templateSpec));
  },
  compileWithPartial: function(template, options) {
    return handlebarsEnv.compile(template, options);
  }
};

function safeEval(templateSpec) {
  try {
    var ret;
    // eslint-disable-next-line no-eval
    eval('ret = ' + templateSpec);
    return ret;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(templateSpec);
    throw err;
  }
}
