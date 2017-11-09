module.exports = {
  "extends": "eslint:recommended",
  "globals": {
    "self": false
  },
  "env": {
    "node": true
  },
  "ecmaFeatures": {
    // Enabling features that can be implemented without polyfills. Want to avoid polyfills at this time.
    "arrowFunctions": true,
    "blockBindings": true,
    "defaultParams": true,
    "destructuring": true,
    "modules": true,
    "objectLiteralComputedProperties": true,
    "objectLiteralDuplicateProperties": true,
    "objectLiteralShorthandMethods": true,
    "objectLiteralShorthandProperties": true,
    "restParams": true,
    "spread": true,
    "templateStrings": true
  },
  "rules": {
    // overrides eslint:recommended defaults
    "no-sparse-arrays": "off",
    "no-func-assign": "off",
    "no-console": "warn",
    "no-debugger": "warn",
    "no-unreachable": "warn",

    // Possible Errors //
    //-----------------//
    "no-unsafe-negation": "error",


    // Best Practices //
    //----------------//
    "curly": "error",
    "default-case": "warn",
    "dot-notation": ["error", { "allowKeywords": false }],
    "guard-for-in": "warn",
    "no-alert": "error",
    "no-caller": "error",
    "no-div-regex": "warn",
    "no-eval": "error",
    "no-extend-native": "error",
    "no-extra-bind": "error",
    "no-floating-decimal": "error",
    "no-implied-eval": "error",
    "no-iterator": "error",
    "no-labels": "error",
    "no-lone-blocks": "error",
    "no-loop-func": "error",
    "no-multi-spaces": "error",
    "no-multi-str": "warn",
    "no-global-assign": "error",
    "no-new": "error",
    "no-new-func": "error",
    "no-new-wrappers": "error",
    "no-octal-escape": "error",
    "no-process-env": "error",
    "no-proto": "error",
    "no-return-assign": "error",
    "no-script-url": "error",
    "no-self-compare": "error",
    "no-sequences": "error",
    "no-throw-literal": "error",
    "no-unused-expressions": "error",
    "no-warning-comments": "warn",
    "no-with": "error",
    "radix": "error",
    "wrap-iife": "error",


    // Variables //
    //-----------//
    "no-catch-shadow": "error",
    "no-label-var": "error",
    "no-shadow-restricted-names": "error",
    "no-undef-init": "error",
    "no-use-before-define": ["error", "nofunc"],


    // Stylistic Issues //
    //------------------//
    "comma-dangle": ["error", "never"],
    "quote-props": ["error", "as-needed", { "keywords": true, "unnecessary": false }],
    "brace-style": ["error", "1tbs", { "allowSingleLine": true }],
    "camelcase": "error",
    "comma-spacing": ["error", { "before": false, "after": true }],
    "comma-style": ["error", "last"],
    "consistent-this": ["warn", "self"],
    "eol-last": "error",
    "func-style": ["error", "declaration"],
    "key-spacing": ["error", {
      "beforeColon": false,
      "afterColon": true
    }],
    "new-cap": "error",
    "new-parens": "error",
    "no-array-constructor": "error",
    "no-lonely-if": "error",
    "no-mixed-spaces-and-tabs": "error",
    "no-nested-ternary": "warn",
    "no-new-object": "error",
    "no-spaced-func": "error",
    "no-trailing-spaces": "error",
    "no-extra-parens": ["error", "functions"],
    "quotes": ["error", "single", "avoid-escape"],
    "semi": "error",
    "semi-spacing": ["error", { "before": false, "after": true }],
    "keyword-spacing": "error",
    "space-before-blocks": ["error", "always"],
    "space-before-function-paren": ["error", { "anonymous": "never", "named": "never" }],
    "space-in-parens": ["error", "never"],
    "space-infix-ops": "error",
    "space-unary-ops": "error",
    "spaced-comment": ["error", "always", { "markers": [","] }],
    "wrap-regex": "warn",

    // ECMAScript 6 //
    //--------------//
    "no-var": "warn"
  },
  "parserOptions": {
    "sourceType": "module"
  }
}
