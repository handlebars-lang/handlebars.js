var fs = require('fs');

module.exports = {
  context: {
    header: function () {
      return 'Colors';
    },
    hasItems: true, // To make things fairer in mustache land due to no `{{if}}` construct on arrays
    items: [
      { name: 'red', current: true, url: '#Red' },
      { name: 'green', current: false, url: '#Green' },
      { name: 'blue', current: false, url: '#Blue' },
    ],
  },

  handlebars: fs.readFileSync(__dirname + '/complex.handlebars').toString(),
  dust: fs.readFileSync(__dirname + '/complex.dust').toString(),
  mustache: fs.readFileSync(__dirname + '/complex.mustache').toString(),
};
