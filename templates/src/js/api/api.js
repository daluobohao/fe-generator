import { teleFetch, postAndJump } from '@mi/telecom-fetch';

// 业务相关api请求

// post
export const testPost = params => teleFetch('test').post(params);
// get
export const testGet = params => teleFetch('test').get(params);
// post file
export const testFileUpload = params => teleFetch('upload').type('file').post(params);
// post and jump
export const testPostAndJump = params => postAndJump('pay', params);
