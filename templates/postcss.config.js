const px2remOpts = {
  rootValue: 150, // 设计稿给的是1080的，组内公用的rem的计算最大屏幕宽度为720，当720时font-size为100px, 因此等比放大的font-size为150px
  unitPrecision: 5,
  propWhiteList: [],
  propBlackList: ['border-raidus', 'box-shadow', 'font-size'],
  selectorBlackList: [/cx\-toast/, /region\-dialog\-com/, /img\-upload\-com/],
  ignoreIdentifier: false,
  replace: true,
  mediaQuery: false,
  minPixelValue: 0,
};

module.exports = {
  plugins: [
    require('postcss-plugin-px2rem')(px2remOpts),
    require('autoprefixer'),
  ],
};
