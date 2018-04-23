const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const glob = require('glob');
const projectConfig = require('./project.config.js');

const projectConfigReg = {};
Object.keys(projectConfig).forEach((key) => {
  projectConfigReg[key] = new RegExp(projectConfig[key].join('|'));
});
const config = {
  context: path.resolve(__dirname, 'src'),
  entry: {},
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'js/[name].[hash:8].js',
    chunkFilename: 'js/[name].[hash].[chunkhash:8].js',
    publicPath: '/',
  },
  resolve: {
    extensions: ['.js', '.jsx', '.json'],
  },
  module: {
    rules: [
      {
        test: /.jsx?/,
        loader: 'babel-loader',
      },
    ],
  },
  plugins: [
    new ExtractTextPlugin({
      filename: 'css/[name].css',
      allChunks: true,
      ignoreOrder: true,
    }),
  ],
};
/**
 * 增加img file rule
 */
const imgExcludeArr = [];
if (projectConfig.fileImg.length > 0) {
  imgExcludeArr.push(projectConfigReg.fileImg);
  config.module.rules.push({
    test: projectConfigReg.fileImg,
    loader: 'file-loader',
    options: {
      name: 'img/[name].[hash:8][ext]',
    },
  });
}
if (projectConfig.base64Img.length > 0) {
  imgExcludeArr.push(projectConfigReg.base64Img);
  config.module.rules.push({
    test: projectConfigReg.base64Img,
    loader: 'url-loader',
    options: {
      name: 'img/[name].[hash:8][ext]',
      limit: 0,
    },
  });
}
const imgRule = {
  test: /\.(png|jpe?g|gif|svg|woff|woff2|eot|ttf)$/,
  loader: 'url-loader',
  options: {
    name: 'img/[name].[hash:8].[ext]',
    limit: 10240,
  },
};
if (imgExcludeArr.length > 0) {
  imgRule.exclude = { and: imgExcludeArr };
}
config.module.rules.push(imgRule);
/**
 * 增加css file rule -----> 待扩展sass、less
 * css 作为最后一个rule，方便在dev config中对其进行修改
 */
const cssExcludeArr = [];
if (projectConfig.inlineCss.length > 0) {
  cssExcludeArr.push(projectConfigReg.inlineCss);
  config.module.rules.append({
    test: projectConfigReg.inlineCss,
    use: [
      {
        loader: 'style-loader',
      },
      {
        loader: 'css-loader',
      },
      {
        loader: 'postcss-loader',
      },
    ],
  });
}
const cssRule = {
  test: /.css$/,
  use: ExtractTextPlugin.extract({
    fallback: 'style-loader',
    use: ['css-loader', 'postcss-loader'],
  }),
};
if (cssExcludeArr.length > 0) {
  cssRule.exclude = { and: cssExcludeArr };
}
config.module.rules.push(cssRule);

const entries = projectConfig.specialEntry.concat(glob.sync('./src/js/page/*.*'));
entries.forEach((item) => {
  const chunkName = path.basename(item).split('.')[0];
  config.entry[chunkName] = [item.replace(/\/src/, '')];
});

module.exports = config;
