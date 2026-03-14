export const templates = {
  // --- Small templates ---
  'static string (no expressions)': {
    template: 'Hello world',
    context: {},
  },
  'simple variables': {
    template: 'Hello {{name}}! You have {{count}} new messages.',
    context: { name: 'Mick', count: 30 },
  },
  'dot paths': {
    template:
      '{{person.name.bar.baz}}{{person.age}}{{person.foo}}{{animal.age}}',
    context: { person: { name: { bar: { baz: 'Larry' } }, age: 45 } },
  },
  'with helper': {
    template: '{{#with person}}{{name}}{{age}}{{/with}}',
    context: { person: { name: 'Larry', age: 45 } },
  },

  // --- Arguments & mustache-style ---
  'arguments (positional + hash)': {
    template:
      '{{foo person "person" 1 true foo=bar foo="person" foo=1 foo=true}}',
    context: { bar: true },
    helpers: { foo: () => '' },
  },
  'depth-1 (../)': {
    template: '{{#each names}}{{../foo}}{{/each}}',
    context: {
      names: [
        { name: 'Moe' },
        { name: 'Larry' },
        { name: 'Curly' },
        { name: 'Shemp' },
      ],
      foo: 'bar',
    },
  },
  'mustache-style section (array)': {
    template: '{{#names}}{{name}}{{/names}}',
    context: {
      names: [
        { name: 'Moe' },
        { name: 'Larry' },
        { name: 'Curly' },
        { name: 'Shemp' },
      ],
    },
  },
  'mustache-style section (object)': {
    template: '{{#person}}{{name}}{{age}}{{/person}}',
    context: { person: { name: 'Larry', age: 45 } },
  },

  // --- Medium templates ---
  'each (small array, 4 items)': {
    template: '{{#each names}}{{name}}{{/each}}',
    context: {
      names: [
        { name: 'Moe' },
        { name: 'Larry' },
        { name: 'Curly' },
        { name: 'Shemp' },
      ],
    },
  },
  'each with @index/@key': {
    template: '{{#each names}}{{@index}}:{{name}} {{/each}}',
    context: {
      names: [
        { name: 'Moe' },
        { name: 'Larry' },
        { name: 'Curly' },
        { name: 'Shemp' },
      ],
    },
  },
  'if/else conditional': {
    template:
      '{{#if active}}<span class="active">{{name}}</span>{{else}}<span>{{name}}</span>{{/if}}',
    context: { active: true, name: 'Widget' },
  },
  'partial (each + partial)': {
    template: '{{#each peeps}}{{>variables}}{{/each}}',
    context: {
      peeps: [
        { name: 'Moe', count: 15 },
        { name: 'Larry', count: 5 },
        { name: 'Curly', count: 1 },
      ],
    },
    partials: {
      variables: 'Hello {{name}}! You have {{count}} new messages.',
    },
  },
  'nested depth (../../)': {
    template:
      '{{#each names}}{{#each name}}{{../bat}}{{../../foo}}{{/each}}{{/each}}',
    context: {
      names: [
        { bat: 'foo', name: ['Moe'] },
        { bat: 'foo', name: ['Larry'] },
        { bat: 'foo', name: ['Curly'] },
        { bat: 'foo', name: ['Shemp'] },
      ],
      foo: 'bar',
    },
  },
  subexpressions: {
    template: '{{echo (header)}}',
    context: { echo: () => {}, header: () => {} },
    helpers: {
      echo: (value) => 'foo ' + value,
      header: () => 'Colors',
    },
  },

  // --- Complex template ---
  'complex (if/each/helpers)': {
    template: `<h1>{{header}}</h1>
{{#if items}}
  <ul>
    {{#each items}}
      {{#if current}}
        <li><strong>{{name}}</strong></li>
      {{^}}
        <li><a href="{{url}}">{{name}}</a></li>
      {{/if}}
    {{/each}}
  </ul>
{{^}}
  <p>The list is empty.</p>
{{/if}}`,
    context: {
      header() {
        return 'Colors';
      },
      hasItems: true,
      items: [
        { name: 'red', current: true, url: '#Red' },
        { name: 'green', current: false, url: '#Green' },
        { name: 'blue', current: false, url: '#Blue' },
      ],
    },
  },
  'recursive partials': {
    template: '{{name}}{{#each kids}}{{>recursion}}{{/each}}',
    context: {
      name: '1',
      kids: [{ name: '1.1', kids: [{ name: '1.1.1', kids: [] }] }],
    },
    partials: {
      recursion: '{{name}}{{#each kids}}{{>recursion}}{{/each}}',
    },
  },

  // --- Large/stress templates ---
  'each (large array, 100 items)': {
    template:
      '{{#each items}}<div class="item"><h3>{{title}}</h3><p>{{description}}</p><span>{{price}}</span></div>{{/each}}',
    context: {
      items: Array.from({ length: 100 }, (_, i) => ({
        title: `Item ${i}`,
        description: `Description for item ${i} with some longer text to simulate real content`,
        price: `$${(i * 9.99).toFixed(2)}`,
      })),
    },
  },
  'each (large array, 1000 items)': {
    template: '{{#each items}}{{name}} {{/each}}',
    context: {
      items: Array.from({ length: 1000 }, (_, i) => ({ name: `item-${i}` })),
    },
  },
  'deeply nested context (4 levels)': {
    template: `{{#with level1}}
  {{#with level2}}
    {{#each items}}
      {{#if active}}
        {{../../title}}: {{name}} ({{../label}})
      {{/if}}
    {{/each}}
  {{/with}}
{{/with}}`,
    context: {
      level1: {
        title: 'Root',
        level2: {
          label: 'Section',
          items: Array.from({ length: 20 }, (_, i) => ({
            name: `item-${i}`,
            active: i % 2 === 0,
          })),
        },
      },
    },
  },
  'many partials (10 partials)': {
    template: Array.from({ length: 10 }, (_, i) => `{{>partial${i}}}`).join(
      '\n'
    ),
    context: { name: 'World', count: 42 },
    partials: Object.fromEntries(
      Array.from({ length: 10 }, (_, i) => [
        `partial${i}`,
        `<section><h2>Section {{name}} #${i}</h2><p>Count: {{count}}</p></section>`,
      ])
    ),
  },
  'page template (mixed features)': {
    template: `<!DOCTYPE html>
<html>
<head><title>{{title}}</title></head>
<body>
  <header>{{>header}}</header>
  <nav>
    <ul>
      {{#each nav}}
        <li{{#if active}} class="active"{{/if}}><a href="{{url}}">{{label}}</a></li>
      {{/each}}
    </ul>
  </nav>
  <main>
    {{#if showBanner}}<div class="banner">{{bannerText}}</div>{{/if}}
    {{#each sections}}
      <section>
        <h2>{{title}}</h2>
        {{#each items}}
          <div class="card">
            <h3>{{name}}</h3>
            <p>{{description}}</p>
            {{#if featured}}<span class="badge">Featured</span>{{/if}}
          </div>
        {{/each}}
      </section>
    {{/each}}
  </main>
  <footer>{{>footer}}</footer>
</body>
</html>`,
    context: {
      title: 'My Page',
      showBanner: true,
      bannerText: 'Welcome!',
      nav: [
        { label: 'Home', url: '/', active: true },
        { label: 'About', url: '/about', active: false },
        { label: 'Contact', url: '/contact', active: false },
      ],
      sections: Array.from({ length: 5 }, (_, si) => ({
        title: `Section ${si + 1}`,
        items: Array.from({ length: 8 }, (_, ii) => ({
          name: `Card ${si * 8 + ii + 1}`,
          description: `Description for card ${si * 8 + ii + 1}`,
          featured: ii === 0,
        })),
      })),
    },
    partials: {
      header: '<h1>{{title}}</h1>',
      footer: '<p>&copy; 2026 {{title}}</p>',
    },
  },
};
