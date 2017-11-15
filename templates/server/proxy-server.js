const pkg = require('../package.json');

const { preview, online } = pkg.host;
// 代理到本地的route
const localRoute = [
  // example
  // 'get:/id_confirm/need_confirm',
];
// 代理到线上的route
const onlineRoute = [
  // example
  // 'get:/auth'
];

/* eslint-disable require-yield, generator-star-spacing */
module.exports = {
  summary: 'proxy to localhost',
  * beforeDealHttpsRequest(requestDetail) {
    const { host } = requestDetail;
    const hostname = host.split(':')[0];
    if (hostname === preview || hostname === online) {
      return true;
    }
    return false;
  },
  *beforeSendRequest(requestDetail) {
    const option = requestDetail.requestOptions;
    const { headers, hostname, path, method } = option;
    const noSearchPath = path.split('?')[0];
    const isProjectHost = preview === hostname || online === hostname;
    const isJsonRequest = /application\/json/.test(headers.Accept || headers.accept);
    const isLocalRoute = localRoute.indexOf(`${method.toLowerCase()}:${noSearchPath}`) !== -1;
    const isOnlineRoute = onlineRoute.indexOf(`${method.toLowerCase()}:${noSearchPath}`) !== -1;
    if (isProjectHost && (!isJsonRequest || isLocalRoute) && !isOnlineRoute) {
      return {
        requestOptions: Object.assign({}, option, {
          port: process.env.PROTOCOL_ENV === 'https' ? pkg.port.https : pkg.port.http,
          hostname: 'localhost',
        }),
        protocol: process.env.PROTOCOL_ENV || 'http',
      };
    }
    return null;
  },
};

