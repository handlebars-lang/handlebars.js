function perfTest(test) {
  var testStart = new Date().getTime();

  // run the test 1000 times so we can get a happy average
  for (var i = 0; i < 1000; i++) {
    test();
  }

  var testEnd = new Date().getTime();
  return (testEnd-testStart)/1000;
}

function perfCompare(test1, test2) {
  var result1 = perfTest(test1);
  var result2 = perfTest(test2);

  console.log("Result 1: " + result1 + ", Result 2: " + result2 + ", Difference: " +
       (result1 - result2));
}


// set up the templates
var tmpl = "This is the story of guys who work on a project\n" +
  "called {{project}}. Their names were {{#people}}{{firstName}} and {{/people}}\n" +
  "they both enjoyed working on {{project}}.\n\n" +
  "{{#people}}\n" + 
  "{{>personPet}}\n" +
  "{{/people}}";
var partials = {
  personPet: "{{firstName}} {{lastName}} {{#pet}} owned a {{species}}. Its name was {{name}}.{{/pet}}{{^pet}}didn't own a pet.{{/pet}}"
};
var data = {
  project: "Handlebars",
  people: [
    { firstName: "Yehuda", lastName: "Katz" },
    { firstName: "Alan", lastName: "Johnson", pet: { species: "cat", name: "Luke" } }
  ]
}

var test1 = function() {
  Handlebars.compile(tmpl)(data, {partials: partials});
}
var test2 = function() {
  Mustache.to_html(tmpl, data, partials);
}
perfCompare(test1, test2);
