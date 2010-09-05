function perfTest(name, test) {
  var timings = [];

  // run the test 1000 times so we can get a happy average
  for (var i = 0; i < 1000; i++) {
    var testStart = new Date().getTime();
    test();
    var testEnd = new Date().getTime();
    timings.push((testEnd - testStart)/1000);
  }
  
  return analyzeTimes(name, timings);
}

function analyzeTimes(name, timings) {
  var stats = {name: name, min: null, max: null, avg: 0, total: 0};
  var sum = 0;

  for (var i = 0; i < timings.length; i++) {
    stats.total += timings[i];

    if (i == 0) {
      stats.min = timings[i];
      stats.max = timings[i];
    }
    else {
      if (timings[i] > stats.max) {
        stats.max = timings[i];
      }
      if (timings[i] < stats.min) {
        stats.min = timings[i];
      }
    }
  }

  stats.avg = (stats.total / timings.length);

  return stats;
}

function perfCompare(name, tests) {
  var results = [];
  for (var i = 0; j = tests.length, i < j; i++) {
    results.push(perfTest(tests[i][0], tests[i][1]));
  }

  var content = '<h2>' + name + '</h2>';
  content += "<table>";
  content += "<tr><th>Test</th><th>Total</th><th>Average</th><th>Min</th><th>Max</th></tr>";
  for (var i = 0; j = results.length, i < j; i++) {
    var result = results[i];
    content += "<tr>"
    content += "<td>" + result.name + "</td>";
    content += "<td>" + result.total + "</td>";
    content += "<td>" + result.avg + "</td>";
    content += "<td>" + result.min + "</td>";
    content += "<td>" + result.max + "</td>";
  }
  content += "</table>";
  $('#main').append(content);
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

var fn = Handlebars.compile(tmpl);
var test1 = function() {
  fn(data, {partials: partials});
}
var test2 = function() {
  Mustache.to_html(tmpl, data, partials);
}
perfCompare("Mustache Compatibility", [["Handlebars", test1], ["Mustache", test2]]);
