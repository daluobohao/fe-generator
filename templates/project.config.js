/**
 * 用于配置一些输入webpack config的常量
 */
const config = {
  fileImg: [], // 指定需要打包成文件的图片数组 -----> 默认执行webpack中的limit配置
  base64Img: [], // 指定需要打包成base64的图片数组 -----> 默认执行webpack中的limit配置
  inlineCss: [], // 指定需要打包进js的css文件 -----> 默认extract
  specialEntry: [], // 指定特定入口 ----> 默认情况下入口为page下的所有js文件
};

module.exports = config;
