/**
 * @Desc：新版本埋点SDK调用封装
 * @Usage:
 * @Notify：
 * @Depend：
 *
 *
 * Created by K.L.Qiang on 2019/4/27
 */
(function () {
  var kayak, ROUTER, localData, COOKIE, EVT, COOKIE, handle, _fn, CFG;

  CFG = {
    SCE: 'mweb',
    TRACE_DATA_STR: 'data-tracedata',
    TRACE_EVENT_DATA: 'data-viewname',
    BACK_CLS: 'J_ToolBarBack',
    LINK_CLS: 'J_Link',
    CLICK_TRACE_CLS: 'J_ClickTrace',
    TRACKER_DATA_VERSION: "1.0",
    TIMEOUT: 20000,
  };

  handle = {
    init: function () {
      if (!window.DmallTracker) {
        return;
      }
      var paramObj = _fn.getRequest() || {};
      if (paramObj['lgdebug'] === 'true') {
        DmallTracker.enableLog();
      }
      _fn.setGlobalData();
      _fn.bind();
    },
    trackPage: function (p) {
      var collectTime = window.collectTime || {};
      if (!window.DmallTracker) {
        return;
      }
      // var sce = CFG.SCE + '_' + (p.vName || '');
      var data = p.d || {};
      data.ref = ROUTER.prevUrl || document.referrer || '';
      DmallTracker.track(p.evt, CFG.TRACKER_DATA_VERSION, data);
    },
    trackClick: function (event, data, jTarget) {
      if (!window.DmallTracker) {
        return;
      }
      data = data || jTarget && jTarget.attr(CFG.TRACE_DATA_STR) || '';
      event = event || jTarget && jTarget.attr(CFG.TRACE_EVENT_DATA) || '';
      if (!data || !event) {
        return;
      }
      var loginId = COOKIE.get('ticketLoginId') || COOKIE.get('loginId') || COOKIE.get('ticketName');
      data.login = loginId; // 登录信息
      data.ref = ROUTER.prevUrl || document.referrer || '';
      DmallTracker.track(event, CFG.TRACKER_DATA_VERSION, data);
    }
  };

  _fn = {
    bind: function () {
      return;
      $(document.body).on('click', '.' + CFG.CLICK_TRACE_CLS, function (e) {
        var jTarget = $(this),
          data = jTarget.attr(CFG.TRACE_DATA_STR) || '{}';

        data = JSON.parse(data);
        /*data.module_id = jModule.attr( CFG.INSTANCEID_ATTR );
        data.module_type = jModule.attr( CFG.MODULENAME_ATTR );
        data.template_id = jModule.attr( CFG.TEMPLATENAME_ATTR );*/
        handle.trackClick(jTarget.attr(CFG.TRACE_EVENT_DATA), data, jTarget);
      });
    },

    // 设置全局通用数据
    setGlobalData: function () {
      if (!window.DmallTracker) {
        return;
      }
      var stor = window.localStorage,
        hitStore = stor.getItem('wxHitStore'),
        loginId = COOKIE.get('ticketLoginId') || COOKIE.get('loginId') || COOKIE.get('ticketName');
      hitStore = JSON.parse(hitStore || '{}');
      DmallTracker.setAttr({
        login: loginId, // 登录信息
        vender_id: hitStore.venderId || '',
        store_id: hitStore.storeId || '',
        // curpgtab: hitStore.bizType || ''
        // bid: hitStore.brandId || '',

        // act: actStoreInfos.actId,
        // pgflg: actStoreInfos.pageId,


        //act_app : '',	// 封装到urlparam
        //active_app_status : '', // 封装到urlparam

        // module_id : '', // 模块ID
        // module_type : '', // 模块名称
        // template_id : '' // 模板名称
      });
    },
    getRequest: function (link) {
      var search = link || window.location.href.split('?')[1] || '',
        result = {}, i, s;

      search = search.split('#')[0] || '';
      search = search.split('&');
      for (i = 0; s = search[i]; ++i) {
        s = s.split('=');
        if (s.length == 2) {
          result[s[0]] = s[1];
        }
      }
      return result;
    }
  };

  define('kayak/common/track/collectv2', function (require, exports, module) {
    kayak = require('kayak/core/kayak');
    COOKIE = require('kayak/common/cookie/cookie');
    // localData = require('kayak/common/cookie/localdata');
    ROUTER = kayak.router;
    EVT = kayak.EVT;
    module.exports = handle;
  });
})();
