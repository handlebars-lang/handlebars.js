const path = require('path');
const webpack = require('webpack');
const assert = require('assert');

module.exports = [
    createBuild({
        name: 'umd-compiler-runtime',
        entry: './lib/handlebars.js',
        output: buildUmdOutput('handlebars.js'),
        shouldHandlebarsSupportSourceMaps: false,
        minimize: false
    }),
    createBuild({
        name: 'umd-compiler-runtime-min',
        entry: './lib/handlebars.js',
        output: buildUmdOutput('handlebars.min.js'),
        shouldHandlebarsSupportSourceMaps: false,
        minimize: true
    }),
    createBuild({
        name: 'umd-runtime',
        entry: './lib/handlebars.runtime.js',
        output: buildUmdOutput('handlebars.runtime.js'),
        shouldHandlebarsSupportSourceMaps: false,
        minimize: false
    }),
    createBuild({
        name: 'umd-runtime',
        entry: './lib/handlebars.runtime.js',
        output: buildUmdOutput('handlebars.runtime.min.js'),
        shouldHandlebarsSupportSourceMaps: false,
        minimize: true
    }),

    createBuild({
        name: 'amd-compiler-runtime',
        entry: './lib/handlebars.js',
        output: buildAmdOutput('handlebars.amd.js', 'handlebars'),
        shouldHandlebarsSupportSourceMaps: false,
        minimize: false
    }),
    createBuild({
        name: 'amd-compiler-runtime-min',
        entry: './lib/handlebars.js',
        output: buildAmdOutput('handlebars.amd.min.js', 'handlebars'),
        shouldHandlebarsSupportSourceMaps: false,
        minimize: true
    }),
    createBuild({
        name: 'amd-runtime',
        entry: './lib/handlebars.runtime.js',
        output: buildAmdOutput('handlebars.runtime.amd.js', 'handlebars.runtime'),
        shouldHandlebarsSupportSourceMaps: false,
        minimize: false
    }),
    createBuild({
        name: 'amd-runtime-min',
        entry: './lib/handlebars.runtime.js',
        output: buildAmdOutput('handlebars.runtime.amd.min.js', 'handlebars.runtime'),
        shouldHandlebarsSupportSourceMaps: false,
        minimize: true
    })
];

function createBuild({name, entry, shouldHandlebarsSupportSourceMaps, output, minimize}) {
    assert(output != null);
    assert(name != null);
    assert(entry != null);
    assert(shouldHandlebarsSupportSourceMaps != null);
    assert(minimize != null);
    return {
        name,
        module: {
            rules: [
                {
                    test: /\.m?js$/,
                    exclude: /node_modules/,
                    use: {
                        loader: 'babel-loader'
                    }
                }
            ]
        },
        plugins: buildPluginConfig(shouldHandlebarsSupportSourceMaps),
        mode: 'production',
        devtool: false,
        optimization: {
            minimize
        },
        entry,
        output
    };
}

function buildPluginConfig(shouldHandlebarsSupportSourceMaps) {
    const plugins = [];
    if (!shouldHandlebarsSupportSourceMaps) {
        plugins.push(
            new webpack.IgnorePlugin({
                resourceRegExp: /source-map/
            })
        );
    }
    return plugins;
}

function buildAmdOutput(outputFile, targetModuleName) {
    return {
        path: path.resolve(__dirname, 'dist'),
            library: targetModuleName,
            libraryTarget: 'amd',
            filename: outputFile,
            globalObject: 'this',
            sourceMapFilename: '[file].map',
            libraryExport: 'default'

    };
}

function buildUmdOutput(outputFile) {
    return {
        path: path.resolve(__dirname, 'dist'),
            library: 'Handlebars',
            libraryTarget: 'umd',
            filename: outputFile,
            globalObject: 'this',
            sourceMapFilename: '[file].map',
            libraryExport: 'default'

    };
}



