const superagent = require('superagent');

const initRequest = (method, url, params, type) => {
  let request = superagent;
  if (method.toUpperCase() === 'GET') {
    request = superagent
      .get(url)
      .query(params);
  } else {
    request = superagent.post(url);
    request = type ? request.type(type) : request;
    request = request.send(params);
  }
  return request;
};

const httpRequest = request => new Promise((resove, reject) => {
  request
    .timeout(15000)
    .end((err, res) => {
      if (err) {
        reject(err);
      } else {
        resove(res.body);
      }
    });
});

export const handleRejectError = callback => (err) => {
  console.error(err);
  let msg = '发生错误，请刷新重试';
  if (err.status) { // server 4XX and 5XX
    msg = '服务器异常，请稍后重试';
  } else { // 无网络，网络超时
    msg = '无网络，请确认网络连接！';
  }
  if (typeof callback === 'function') {
    callback(msg);
  }
};

export const handleDataError = callback => (err) => {
  console.error(err);
  const msg = '数据异常，请稍后重试';
  if (typeof callback === 'function') {
    callback(msg);
  }
};

export const testServer = params => httpRequest(initRequest('get', '/product/getProductSubscriptions', params));
// export const testServer = params => httpRequest(initRequest('get', '/test', params));
