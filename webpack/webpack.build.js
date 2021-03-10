var ExtractTextPlugin = require('extract-text-webpack-plugin');
var loaders = require("./loaders");
var preloaders = require("./preloaders");
var HtmlWebpackPlugin = require('html-webpack-plugin');
var webpack = require('webpack');
var CopyWebpackPlugin = require('copy-webpack-plugin');
module.exports = {
    entry: ['./src/index.ts'],
    output: {
        filename: 'build.min.js',
        path: 'dist'
    },
    devtool: 'source-map',
    resolve: {
        root: __dirname,
        extensions: ['', '.ts', '.js', '.json']
    },
    resolveLoader: {
        modulesDirectories: ["node_modules"]
    },
    plugins: [
        new webpack.optimize.UglifyJsPlugin(
            {
                warning: false,
                mangle: true,
                comments: false,
                minimize: true,
                compress: {
                    screw_ie8: true
                } 

            }
        ),
        new webpack.optimize.AggressiveMergingPlugin(),
        new HtmlWebpackPlugin({
            template: './src/index.html',
            inject: 'body',
            hash: true
        }),
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
            'window.jQuery': 'jquery',
            'window.jquery': 'jquery'
        }),
        new CopyWebpackPlugin([
            { from: './src/images', to: './images/' }]),
        new ExtractTextPlugin('/styles.css')
            
    ],
    module: {
        preLoaders: preloaders,
        loaders: loaders
    },
    tslint: {
        emitErrors: true,
        failOnHint: true
  }
};