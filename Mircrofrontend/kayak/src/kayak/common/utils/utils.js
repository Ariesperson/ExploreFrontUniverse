/*
 * 依赖 JQuery 或 zepto
 * 工具方法
 */
; (function () {
  var handle, temps = {}, CFG;

  handle = {
    //获取url传过来的参数
    getQueryString: function (name, url) {
      url = url || window.location.href;
      var search = url.split('?')[1] || '',
        reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i'),
        r = search.match(reg),
        type = r ? decodeURIComponent(r[2]) : '',
        result = type.split('#')[0] || '';

      return result;
    },
    /**
     获取url里的所有参数
     @param url （如果为空 默认为当前页面的url）
     @param name （要获取url里的参数key值 为空 就是所有key）
     @return Object    url的所有参数以对象的形式返回

     */
    getUrlParam: function (parmUrl, name) {
      parmUrl = parmUrl || window.location.href;
      name = name || '';
      var loc = parmUrl.split('?'),
        search = loc[1] || '',
        url = '',
        result, i, s;

      search = search.split('#')[0] || '';
      search = search.split('&');
      if (name) {
        var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i'),
          r = (loc[1] || '').match(reg),
          type = r ? decodeURIComponent(r[2]) : '';
        result = type.split('#')[0] || '';
      } else {
        result = {};
        for (i = 0; s = search[i]; ++i) {
          s = s.split('=');
          if (s.length == 2) {
            result[s[0]] = s[1];
          }

        }
      }
      return result;
    },
    //获取第三方活动特殊标识（不走的定位的活动）
    isSpecialActivity: function () {
      var result = false,
        venderId = handle.getQueryString('venderId'),
        brandId = handle.getQueryString('brandId'),
        erpStoreId = handle.getQueryString('erpStoreId');
      // 如果url里带有erpStoreId venderId brandId 且是商品详情和购物车 就不走定位
      if (venderId != '' && erpStoreId != '' && brandId != '') {
        result = true;
      }
      return result;
    },
    parseParam: function (param, concatChar) {
      param = param || [];
      concatChar = concatChar || ':';
      var paramStr = [], key;
      for (key in param) {
        paramStr.push(key + '=' + encodeURIComponent(param[key]));
        // paramStr.push( key + '=' + encodeURIComponent(param[key]) );
        // paramStr.push( key + '=' + param[key] );
      }

      paramStr = paramStr.join('&');
      return paramStr == '' ? '' : concatChar + paramStr;
    },
    rightTimeNearby: function (startTime, endTime) {
      startTime = startTime || 0;
      var result = false;
      if (!isNaN(startTime)
        && endTime
        && !isNaN(endTime)
      ) {
        //超过6小时重新nearBy
        result = (endTime * 1 - startTime * 1) / (1000 * 60 * 60) > 6 ? true : false;
      }
      console.log(result);
      return result;
    },
    getDate: function (time) {
      var date = new Date(),
        result = '';

      if (time) {
        date.setTime(time);
      }
      result += date.getFullYear();
      result += (date.getMonth() + 1);
      result += date.getDate();
      return result;
    },
    ramdomIntGenerator: function (from, to) { //随机整数生成器
      if (!from) { //默认从0-10
        from = 0;
      }
      if (!to) { //默认比from值大10
        to = from + 10;
      }
      var more = to - from;
      var num = Math.random() * more + from;
      return parseInt(num);

    },
    getObjLength: function (obj) {
      var len = 0, key;
      for (key in obj) {
        ++len;
      }
      return len;
    },
    //获取浏览器state
    getState: function () {
      return window.history.state || {};
    },
    //编译temp
    getTemp: function (tempClass, jView) {
      jView = jView || $(document.body);
      temps[tempClass] = template.compile(jView.find('.' + tempClass).text());
      return temps[tempClass];
    },
    setHtmlTitle: function (title, jView, favUrl) {
      var UA = window.navigator.userAgent;
      if (
        !!UA.match(/dmall/i) && window.DMWebBridge && typeof window.DMWebBridge.getPageConfig === 'function'
      ) { //app端
        try {
          var x = JSON.parse(window.DMWebBridge.getPageConfig());
          x.titleBar.title.text = title;
          setTimeout(function () {
            window.DMWebBridge.setPageConfig(JSON.stringify(x));
          }, 0);
          return;
        } catch (error) {
          console.warn(error);
        }
      }
      jView = jView || $(document.body);
      document.title = title === undefined ? '逛超市 用多点' : title;
      var evt = kayak && kayak.EVT || '//';
      var isDmallAndroidApp = UA.match(/Android/i) && UA.match(/dmall/i),
        isIOS = UA.match(/iphone|ipad|ipod/i);

      if (isIOS || isDmallAndroidApp) {
        //兼容 Refused to display 'https://i.dmall.com/favicon.ico' in a frame because it set 'X-Frame-Options' to 'sameorigin'.
        favUrl = favUrl || (window.location.origin + '/favicon.ico');
        // hack在微信等webview中无法修改document.title的情况
        var $iframe = $('<iframe src="' + favUrl + '" style="display:none;"></iframe>');
        $iframe.on('load', function () {
          setTimeout(function () {
            $iframe.off('load').remove();
          }, 0);
        }).appendTo(jView);
      }
    },
    //获取当前的网络环境
    getNetWorkType: function () {
      var appVersion = navigator.appVersion;
      if (appVersion.indexOf('WIFI') > 0) {
        return "WIFI";
      } else {
        return "DATA";
      }
    },
    //判断是否是当前的cls dom节点
    isIn: function (jEl, cls) {
      if (jEl.hasClass(cls) || jEl.parents('.' + cls).length > 0) {
        return true;
      }
      return false;
    }
  };

  define('kayak/common/utils/utils', function (require, exports, module) {
    module.exports = handle;
  });
})();
