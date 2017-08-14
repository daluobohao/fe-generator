const Express = require('express');
const bodyParser = require('body-parser');
const routes = require('./api-router.js');
const pkg = require('../package.json');

const app = new Express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/', routes);
app.listen(pkg.port.api, (error) => {
  if (error) {
    console.error(error);
  } else {
    console.log('api server listening on http://localhost:%s/', pkg.port.api);
  }
});
