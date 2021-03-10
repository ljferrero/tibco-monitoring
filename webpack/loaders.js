var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = [
    {test: /\.ts(x?)$/, loader: 'ts-loader'},
    {
        test: /\.less$/,
       loader: ExtractTextPlugin.extract(['css','less']) 
    }, 
    {
        test: /\.css$/,
       loader: ExtractTextPlugin.extract(['css']) 
    }, {
        test: /\.html$/,
        exclude: /node_modules/,
        loader: 'raw'
    }, {
        test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: 'url-loader?limit=10000&mimetype=application/font-woff'
    }, {
        test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: 'file-loader'
    }, {
        test: '\.jpg$',
        exclude: /node_modules/,
        loader: 'file'
    }, {
        test: '\.png$',
        exclude: /node_modules/,
        loader: 'url'
    },
    {
        test: /\.json$/,
        loader: "json-loader",
        include: "/configs/"
    }
];
