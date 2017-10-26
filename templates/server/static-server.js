const express = require('express');
const bodyParser = require('body-parser');
const webpack = require('webpack');
const devMiddleware = require('webpack-dev-middleware');
const hotMiddleware = require('webpack-hot-middleware');
const proxy = require('http-proxy-middleware');
const webpackConfig = require('../webpack.config.dev.js');
const pkg = require('../package.json');

const compiler = webpack(webpackConfig);
const apiServer = `http://localhost:${pkg.port.api}`;
const filter = (pathname, req) => req.headers.accept.indexOf('html') === -1;
const apiProxy = proxy(filter, { target: apiServer });
const app = express();
const devMiddlewareInstance = devMiddleware(compiler, {
  noInfo: true,
  // quiet: true,
  stats: {
    colors: true,
  },
  publicPath: webpackConfig.output.publicPath,
});
app.use(devMiddlewareInstance);
app.use(hotMiddleware(compiler));
app.use((req, res, next) => {
  if (['localhost', '127.0.0.1'].indexOf(req.hostname) !== -1) {
    res.cookie('userId', 123);
    res.cookie('serviceToken', 'token');
  }
  next();
});
app.get('/pay', (req, res) => {
  const htmlBuffer = devMiddlewareInstance.fileSystem.readFileSync(`${webpackConfig.output.path}/index.html`);
  res.cookie('userId', 123123);
  res.send(htmlBuffer.toString());
});
app.post('/pay', (req, res) => {
  res.redirect('https://m.baidu.com/?from=844b&vit=fps');
});
app.use('/', apiProxy);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/:name', (req, res) => {
  console.log(req.params.name);
  const htmlBuffer = devMiddlewareInstance.fileSystem.readFileSync(`${webpackConfig.output.path}/${req.params.name}.html`);
  res.cookie('userId', 123123);
  res.send(htmlBuffer.toString());
});


app.listen(pkg.port.dev, (error) => {
  if (error) {
    console.error(error);
  } else {
    console.log('static server listening on http://localhost:%s/', pkg.port.dev);
  }
});
