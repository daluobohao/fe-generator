const pkg = require('../package.json');

const { preview, online } = pkg.host;
const port = pkg.port.dev;

/* eslint-disable require-yield, generator-star-spacing */
module.exports = {
  summary: 'proxy to localhost',
  * beforeDealHttpsRequest(requestDetail) {
    const { host } = requestDetail;
    if (host === preview || host === online) {
      return true;
    }
    return false;
  },
  *beforeSendRequest(requestDetail) {
    const option = requestDetail.requestOptions;
    const { headers, hostname } = option;
    if ((preview === hostname || online === hostname) && !/application\/json/.test(headers.Accept)) {
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

