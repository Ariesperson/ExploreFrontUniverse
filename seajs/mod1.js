define(function(require, exports, module){
    var mod2 = require('./mod2.js')
    exports.value = '我是模块一，引用了' + mod2.value
  })