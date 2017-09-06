const pkg = require('../package.json');

const host = pkg.host;
const port = pkg.port.dev;

/* eslint-disable require-yield, generator-star-spacing */
module.exports = {
  summary: 'proxy to localhost',
  *beforeSendRequest(requestDetail) {
    const option = requestDetail.requestOptions;
    const { headers, hostname } = option;
    if (host === hostname && !/application\/json/.test(headers.Accept)) {
      return {
        requestOptions: Object.assign({}, option, {
          port,
          hostname: 'localhost',
        }),
        protocol: 'http',
      };
    }
    return null;
  },
};

