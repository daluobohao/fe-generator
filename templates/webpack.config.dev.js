const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const config = require('./webpack.config.common.js');
const pkg = require('./package.json');

const promisePath = 'core-js/fn/promise';
const fetchPath = 'whatwg-fetch';
const isHttps = process.env.PROTOCOL_ENV === 'https';
const hmrPath = `${isHttps ? 'https' : 'http'}://localhost:${isHttps ? pkg.port.https : pkg.port.http}/__webpack_hmr`;
const webpackHotClient = `webpack-hot-middleware/client?reload=true&quiet=true&path=${hmrPath}`;

Object.keys(config.entry).forEach((key) => {
  config.entry[key] = [promisePath, fetchPath, webpackHotClient].concat(config.entry[key]);
});

config.devtool = 'source-map';

config.plugins = [
  new webpack.DefinePlugin({
    'process.env': {
      NODE_ENV: JSON.stringify('dev'),
    },
  }),
  new ExtractTextPlugin({
    filename: 'css/[name].[hash:8].css',
    allChunks: true,
    ignoreOrder: true,
  }),
  new webpack.optimize.OccurrenceOrderPlugin(),
  new webpack.HotModuleReplacementPlugin(),
];

const views = Object.keys(config.entry); // 按照入口文件名字查找html文件

views.forEach((viewname) => {
  const conf = {
    template: `./views/${viewname}.html`,
    filename: `${viewname}.html`,
    inject: 'body',
    chunks: [`${viewname}`],
  };
  const htmlPlugin = new HtmlWebpackPlugin(conf);
  config.plugins.push(htmlPlugin);
});

module.exports = config;
