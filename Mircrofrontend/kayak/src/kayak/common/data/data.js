/*
	依赖jquery 或 zepto
	jun.li@dmall.com 2015-11-16
*/

/*
{
	param :  {},
	_token : '',
	source : 'wechat/other',	1:微信 2:非微信（浏览器）
	tempid : ''
}
*/
;(function () {
  var COOKIE, globalParam = {}, _fn, handle, DATA = {}, CFG;

  CFG = {
    TIMEOUT: 20000, // 超时10秒
    //手动维护需要下传到后台的参数 列表
    pubParamList: ['utmSource', 'didiOpenId'], //didi对接
    ticketWeChat: 'ticketWeChat',
    tempId: 'tempid',
    token: 'token',
    cookieSource: '_utm_source',
    cookieOpenid: '_didi_openid'
  }

  handle = {
    setGlobalParam: function (param) {
      globalParam = $.extend(globalParam, param);
    },
    query: function () {
      var url,
        param,
        type,
        callback,
        cache = false;
      if (arguments.length == 3) {
        url = arguments[0];
        type = 'json';
        param = arguments[1];
        callback = arguments[2];
      } else if (arguments.length == 4) {
        url = arguments[0];
        type = arguments[1];
        param = arguments[2];
        callback = arguments[3];
      } else if (arguments.length == 5) {
        url = arguments[0];
        type = arguments[1];
        param = arguments[2];
        callback = arguments[3];
        cache = arguments[4];
      } else {
        return;
      }

      param = param || {};
      param = _fn.decorateParam(param);
      //alert( JSON.stringify( param ) );
      $.ajax({
        url: url,
        dataType: type || 'json',
        data: param,
        xhrFields: {
          withCredentials: true
        },
        type: 'GET',
        cache: cache,
        timeout: CFG.TIMEOUT,
        success: function (data) {
          if (typeof callback == 'function') {
            _fn.callbackProxy(data, callback);
          }
        },
        error: function () {
          var data = {errCode: '-1', errMsg: '加载数据失败', data: {}};
          if (typeof callback == 'function') {
            _fn.callbackProxy(data, callback);
          }
        }
      });
    },

    post: function () {
      var url,
        param,
        type,
        callback;
      if (arguments.length == 3) {
        url = arguments[0];
        type = 'json';
        param = arguments[1];
        callback = arguments[2];
      } else {
        return;
      }
      param = param || {};
      param = _fn.decorateParam(param);
      $.ajax({
        url: url,
        dataType: 'json',
        data: param,
        xhrFields: {
          withCredentials: true
        },
        type: 'POST',
        cache: false,
        timeout: CFG.TIMEOUT,
        success: function (data) {
          if (typeof callback == 'function') {
            _fn.callbackProxy(data, callback);
          }
        },
        error: function () {
          var data = {errCode: '-1', errMsg: '加载数据失败', data: {}};
          if (typeof callback == 'function') {
            _fn.callbackProxy(data, callback);
          }
        }
      });
    },
    // 支持数组和单个key值
    get: function (key) {
      var result = {}, i, k;

      if (typeof key == 'string') {
        return DATA[key];
      }

      for (i = 0; k = key[i]; ++i) {
        result[k] = DATA[k];
      }

      return result;
    },

    // 支持key value 或者 { key1 ：value1, key2 : value2 }
    // 这里不是深拷贝，调用的用户一定要注意
    set: function () {
      var p, obj;
      // 两个参数
      if (arguments.length == 2) {
        DATA[arguments[0]] = arguments[1];
        return;
      }

      // 对象类型
      if (arguments.length == 1 && typeof arguments[0] == 'object') {
        obj = arguments[0];
        for (p in obj) {
          DATA[p] = obj[p];
        }
        return;
      }
    }
  }

  _fn = {
    // 统一回调方案
    callbackProxy: function (d, callback) {
      d = d || {};
      d.cookie = d.cookie || {};
      COOKIE.writeByObject(d.cookie.set);
      COOKIE.deleteByList(d.cookie.del);
      // 这里可以做统一拦截方案
      if (typeof callback == 'function') {
        callback(d);
      }
    },
    decorateParam: function (param) {
      // var key = _fn.isWxAgent() ? CFG.ticketWeChat : CFG.token;
      param.token = COOKIE.get(CFG.ticketWeChat);
      param.source = _fn.isWxAgent() ? 1 : 2; // 1代表微信，2代表其他
      param.tempid = COOKIE.get(CFG.tempId);
      //alert( param.source );
      //alert( param.tempid );
      param.pubParam = JSON.stringify(_fn.extPubParam());
      if (window.DmallTracker && DmallTracker) param.d_track_data = JSON.stringify(DmallTracker.getDTrackData());
      return param;
    },
    extPubParam: function () {
      //对接 滴滴 联调传source_id=didi;
      var source = COOKIE.get(CFG.cookieSource),
        openid = COOKIE.get(CFG.cookieOpenid),
        allUrlParam = _fn.getUrlAllParam(),
        pubParamList = CFG.pubParamList,
        pubParam = {},
        allParam = $.extend({
          'utmSource': source,
          'didiOpenId': openid
        }, allUrlParam);

      for (var key in allParam) {
        if (pubParamList.indexOf(key) >= 0 && allParam[key]) {
          pubParam[key] = allParam[key];
        }
      }
      return pubParam;
    },
    getUrlAllParam: function (parmUrl) {
      parmUrl = parmUrl || window.location.href;
      var loc = parmUrl.split('?'),
        search = loc[1] || '',
        url = '',
        result = {}, i, s;

      search = search.split('#')[0] || '';
      search = search.split('&');

      for (i = 0; s = search[i]; ++i) {
        s = s.split('=');
        if (s.length == 2) {
          result[s[0]] = decodeURIComponent(s[1]);
        }

      }
      return result;
    },
    isWxAgent: function () {
      return window.navigator.userAgent.toLowerCase().match(/MicroMessenger/i) == 'micromessenger' && window.navigator.userAgent.match(/wxwork/i) != "wxwork" && COOKIE.get('platform') != 'miniprogram';
    }
  }

  define('kayak/common/data/data', function (require, exports, module) {
    COOKIE = require('kayak/common/cookie/cookie');
    module.exports = handle;
  });
})();
