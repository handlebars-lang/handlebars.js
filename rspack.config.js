const { rspack } = require('@rspack/core');
const path = require('path');
const fs = require('fs');

const pkg = require('./package.json');
const license = fs.readFileSync(path.resolve(__dirname, 'LICENSE'), 'utf8');
const banner = `/*!

 @license magnet:?xt=urn:btih:d3d9a9a6595521f9666a5e94cc830dab83b65699&dn=expat.txt Expat
 ${pkg.name} v${pkg.version}

${license}
*/`;

function createConfig(entry, filename, minimize) {
  const plugins = [];

  if (!minimize) {
    // For non-minified builds, use BannerPlugin to add the license header
    plugins.push(new rspack.BannerPlugin({ banner, raw: true }));
  }

  return {
    mode: minimize ? 'production' : 'none',
    context: __dirname,
    entry,
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename,
      library: {
        name: 'Handlebars',
        type: 'umd',
        export: 'default',
      },
      globalObject: 'this',
      clean: false,
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'builtin:swc-loader',
            options: {
              jsc: {
                parser: { syntax: 'ecmascript' },
              },
            },
          },
        },
      ],
    },
    optimization: {
      minimize,
      minimizer: minimize
        ? [
            new rspack.SwcJsMinimizerRspackPlugin({
              extractComments: false,
              minimizerOptions: {
                compress: { passes: 2 },
                mangle: true,
                format: {
                  comments: false,
                  // Prepend the license banner in the minified output
                  preamble: banner,
                },
              },
            }),
          ]
        : [],
    },
    plugins,
    target: ['web', 'browserslist'],
    devtool: false,
  };
}

module.exports = [
  createConfig('./lib/handlebars.js', 'handlebars.js', false),
  createConfig('./lib/handlebars.runtime.js', 'handlebars.runtime.js', false),
  createConfig('./lib/handlebars.js', 'handlebars.min.js', true),
  createConfig(
    './lib/handlebars.runtime.js',
    'handlebars.runtime.min.js',
    true
  ),
];
