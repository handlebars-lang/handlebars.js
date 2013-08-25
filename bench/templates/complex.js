var fs = require('fs');

module.exports = {
  context: {
    header: function() {
      return "Colors";
    },
    items: [
      {name: "red", current: true, url: "#Red"},
      {name: "green", current: false, url: "#Green"},
      {name: "blue", current: false, url: "#Blue"}
    ]
  },

  handlebars: fs.readFileSync(__dirname + '/complex.handlebars').toString(),
  dust:       "<h1>{header}</h1>\n"                             +
              "{?items}\n"                                      +
              "  <ul>\n"                                        +
              "    {#items}\n"                                  +
              "      {#current}\n"                              +
              "        <li><strong>{name}</strong></li>\n"      +
              "      {:else}\n"                                 +
              "        <li><a href=\"{url}\">{name}</a></li>\n" +
              "      {/current}\n"                              +
              "    {/items}\n"                                  +
              "  </ul>\n"                                       +
              "{:else}\n"                                       +
              "  <p>The list is empty.</p>\n"                   +
              "{/items}"
};
