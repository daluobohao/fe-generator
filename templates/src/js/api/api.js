const TIMEOUTMS = 15000;

const timeoutWrap = (ms, promise) => new Promise((resolve, reject) => {
  setTimeout(() => {
    const err = new Error('网络超时，请稍后重试');
    err.name = 'timeout';
    reject(err);
  }, ms);
  promise.then(resolve, reject);
});
/* eslint-disable max-len, no-console */
export const fetchWithErrorHandle = errorHandler => (url, option, timeout = TIMEOUTMS) => timeoutWrap(timeout, fetch(url, option))
  .then((response) => {
    const { status } = response;
    if (status >= 200 && status <= 300) {
      return response.json();
    }
    const err = new Error('服务器错误，请稍后重试');
    err.name = 'fail';
    throw err;
  }, (err) => {
    if (err.name === 'timeout') {
      throw err;
    }
    const newErr = new Error('无网络，请确认网络连接后重试');
    newErr.name = 'offline';
    throw newErr;
  }).catch((err) => {
    console.error(err.name, err.message);
    if (typeof errorHandler === 'function') {
      errorHandler(err);
    }
    throw err;
  });
/* eslint-enable max-len, no-console */

export const getPostBody = params => Object.keys(params || {}).map(key => `${key}=${params[key]}`).join('&');

export const getQueryUrl = (url, params) => `${url}?${getPostBody(params)}`;

export const getFormDataBody = (params) => {
  if (params instanceof FormData) {
    return params;
  }
  const data = new FormData();
  Object.keys(params).forEach((key) => {
    data.append(key, params[key]);
  });
  return data;
};

const defaultOption = {
  method: 'GET',
  headers: {
    Accept: 'application/json',
  },
  credentials: 'include',
};


export const teleFetch = url => ({
  contentType: 'form',
  customOption: {},
  errorHandler: null,
  get(params) {
    return fetchWithErrorHandle(this.errorHandler)(getQueryUrl(url, params), defaultOption);
  },
  post(params) {
    const option = Object.assign({}, defaultOption, this.customOption);
    option.method = 'POST';
    if (this.contentType === 'form') {
      option.body = getPostBody(params);
      option.headers['Content-Type'] = 'application/x-www-form-urlencoded';
    }
    if (this.contentType === 'file') {
      option.body = getFormDataBody(params);
    }
    return fetchWithErrorHandle(this.errorHandler)(url, option);
  },
  type(arg) {
    this.contentType = arg;
    return this;
  },
  option(opt) {
    this.customOption = Object.assign({}, opt);
    return this;
  },
  onError(handler) {
    this.errorHandler = handler;
    return this;
  },
});

// post
export const testPost = params => teleFetch('test').post(params);
// get
export const testGet = params => teleFetch('test').get(params);
// post file
export const testFileUpload = params => teleFetch('upload').type('file').post(params);
