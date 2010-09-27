Handlebars.js
=============

Handlebars.js is an extension to the [Mustache templating language](http://mustache.github.com/) created by Chris Wanstrath. Handlebars.js and Mustache are both logicless templating languages that keep the view and the code separated like we all know they should be.

Installing
----------
Installing Handlebars is easy. Simply [download the package from GitHub](https://github.com/wycats/handlebars.js/zipball/master) and add lib/handlebars.js to your web pages. 

Usage
-----
In general, the syntax of Handlebars.js templates is identical to Mustache templates. For basic syntax, check out the [Mustache manpage](http://mustache.github.com/mustache.5.html).

Once you have a template, use the Handlebars.compile method to compile the template into a function. The generated function takes two arguments, a hash of data to apply to the template and an option hash of functions to use as helpers. Here's an example:

    var source = "<p>Hello, my name is {{name}}. I am from {{hometown}}. I have " + 
        "{{kids/length}} kids:</p>" +
        "<ul>{{#kids}}<li>{{name}} is {{age}}</li>{{/kids}}</ul>";
    var template = Handlebars.compile(source);
    
    var data = { "name": "Alan", "hometown": "Somewhere, TX",
                  "kids": [{"name": "Jimmy", "age": "12"}, {"name": "Sally", "age": "4"}]};
    var result = template(data);

    // Would render:
    // <p>Hello, my name is Alan. I am from Somewhere, TX. I have 2 kids:</p>
    // <ul>
    //   <li>Jimmy is 12</li>
    //   <li>Sally is 4</li>
    // </ul>

Differences Between Handlebars.js and Mustache
-------------------------
Handlebars.js adds a couple of additional features to make writing templates easier and also changes a tiny detail of how partials work. 

### Paths

Handlebars.js supports an extended expression syntax that we call paths. Paths are made up of typical expressions and / characters. Expressions allow you to not only display data from the current context, but to display data from contexts that are descendents and ancestors of the current context.

To display data from descendent contexts, use the `/` character. So, for example, if your data were structured like:

    var data = {"person": { "name": "Alan" }, company: {"name": "Rad, Inc." } };

you could display the person's name from the top-level context with the following expression:

    {{person/name}}

Similarly, if already traversed into the person object you could still display the company's name with an expression like `{{../company/name}}`, so:

    {{#person}}{{name}} - {{../company/name}}{{/person}}

would render:

    Alan - Rad, Inc.

### Block Helpers

Handlebars.js also adds the ability to define block helpers. Block helpers are functions that can be called from anywhere in the template. Here's an example:

    var source = "<ul>{{#people}}<li>{{#link}}{{name}}{{/link}}</li>{{/people}}</ul>";
    var link = function(context, fn) {
      return '<a href="/people/' + this.__get__("id") + '">' + fn(this) + '</a>';
    };
    var template = Handlebars.compile(source);

    var data = { "people": [
        { "name": "Alan", "id": 1 },
        { "name": "Yehuda", "id": 2 }
      ]};
    template(data, { "link": link });

    // Should render:
    // <ul>
    //   <li><a href="/people/1">Alan</a></li>
    //   <li><a href="/people/2">Yehuda</a></li>
    // </ul>

Whenever the block helper is called it is given two parameters, the argument that is passed to the helper, or the current context if no argument is passed and the compiled contents of the block. Inside of the block helper the value of `this` is the current context, wrapped to include a method named `__get__` that helps translate paths into values within the helpers.

### Partials

To specify the set of available partials when rendering a template, set them to the partials key of the blocks hash. Partials can be either the string value of the partial source or a precompiled partial function. Here's an example:

    var source = "<ul>{{#people}}<li>{{> link}}</li>{{/people}}</ul>";
    var partials = { "link": '<a href="/people/{{id}}">{{name}}</a>' };
    var template = Handlebars.compile(source);
    
    var data = { "people": [
        { "name": "Alan", "id": 1 },
        { "name": "Yehuda", "id": 2 }
      ]};
    template(data, { "partials": partials });

    // Should render:
    // <ul>
    //   <li><a href="/people/1">Alan</a></li>
    //   <li><a href="/people/2">Yehuda</a></li>
    // </ul>

Precompiling Templates
----------------------

A node.js compatible command-line tool is included in the lib folder. compiler.js takes arguments of the form MethodName=source.hbs and generates a source file with source templates compiled into methods with the given names.

    node lib/compiler.js Template=templates/template.hbs Partial=templates/partial.hbs

Performance
-----------
In a rough performance test, precompiled Handlebars.js templates rendered in about half the time of Mustache templates. It would be a shame if it were any other way, since they were precompiled, but the difference in architecture does have some big performance advantages. Justin Marney, a.k.a. [gotascii](http://github.com/gotascii), confirmed that with an [independent test](http://sorescode.com/2010/09/12/benchmarks.html).

Known Issues
------------
* Handlebars.js can be a bit cryptic when there's an error during compilation, and it can be even more cryptic when there's an error while rendering.

Handlebars in the Wild
-----------------
* Don Park wrote an Express.js view engine adapter for Handlebars.js called [hbs](http://github.com/donpark/hbs)
* [sammy.js](http://github.com/quirkey/sammy) by Aaron Quint, a.k.a. quirkey, supports Handlebars.js as one of its template plugins.

Helping Out
-----------
If you notice any problems, please report them to the GitHub issue tracker at [http://github.com/wycats/handlebars.js/issues](http://github.com/wycats/handlebars.js/issues). Feel free to contact commondream or wycats through GitHub with any other questions or feature requests. To submit changes fork the project and send a pull request.

License
-------
Handlebars.js is released under the MIT license.
