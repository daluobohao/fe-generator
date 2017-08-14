const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const config = require('./webpack.config.common.js');

config.output.publicPath = '/';

config.plugins = [
  new webpack.DefinePlugin({
    'process.env': {
      NODE_ENV: JSON.stringify('production'),
    },
  }),
  new ExtractTextPlugin({
    filename: 'css/[name].[hash:8].css',
    allChunks: true,
    ignoreOrder: true,
  }),
  new webpack.optimize.OccurrenceOrderPlugin(),
  new webpack.optimize.UglifyJsPlugin({
    compress: { warnings: false },
    output: { comments: false },
  }),
  new CleanWebpackPlugin(['dist']),
];

const views = Object.keys(config.entry); // 按照入口文件名字查找html文件

views.forEach((viewname) => {
  const conf = {
    template: `./views/${viewname}.html`,
    filename: `../html/${viewname}.html`,
    inject: 'body',
    chunks: [`${viewname}`],
  };
  const htmlPlugin = new HtmlWebpackPlugin(conf);
  config.plugins.push(htmlPlugin);
});


module.exports = config;
