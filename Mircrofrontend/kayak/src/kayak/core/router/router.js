/**
 *  与deck对接的router实现
 *  creator jun.li@dmall.com
 */
(function () {
  var handle, CFG, _fn,
    eventsClass,
    kayak,
    utils,
    link,
    deck,
    localdata,
    actionMod,
    sRequire,
    isReplace = false,
    backStep = 0;

  CFG = {
    hashFix: '#',
    paramSplit: ':',
    DMALL_KAY: 'dmalllink',
    WEB_KEY: 'web'
  }

  handle = {
    config: {
      multiInstanceAsDiffParam: false, // path相同参数不同，是否对应不同实例
    }, // 默认配置项

    eventTypes: ['preJump', 'parseMain', 'parseActions', 'preLoad', 'loadComplete', 'preEnter', 'preEachEnter', 'enterComplete', 'enterEachComplete', 'preExit', 'preEachExit', 'exitComplete', 'exitEachComplete'], // 可注册的事件
    currentUrl: null, // 当前url，主要为了避免referrer会忽略hash的情况
    currentPath: null, // 当前action路径
    currentActions: [], // 当前view列表
    currentContainer: null, // 当前节点容器,便于实现动画
    currentPos: -1, // 当前位置

    prevUrl: null, // 之前url，为
    prevPath: null, // 上一个路径
    prevActions: [], //
    prevContainer: null, // 上一个节点容器,便于实现动画
    prevPos: -1, // 上一个压栈位置

    context: null, // 执行上下文
    requestParam: null, // 解析后的请求参数对象
    backStep: 0, // 处理级联回退的跳转,hack一些浏览器bug
    isRunning: false, // 是否在监听
    isJumping: false, // 正在执行跳转中
    pathMap: {}, // 当前路径映射规则

    /*==============	事件相关	==============*/
    go: function (path, context) {
      var events = handle.events,
        Storage = deck.Storage,
        pathData, p, data;

      context = context || {};
      pathData = _fn.resolvePath(path);
      data = {
        pathData: pathData,
        type: 'go',
        context: context
      };
      if (events.fire('preJump', data) === false) {
        return;
      }
      _fn.setContext(data.context);
      //localdata.set( 'kayak.context', JSON.stringify( data.context ) );
      p = data.pathData[_fn.getPathType()] || '';
      if (isNaN(p * 1)) { // 文字类型
        _fn.forward(p, context);
        return;
      }

      p = p * 1;
      switch (true) {
        case p < 0: // 后退命中率大方第一个
          _fn.back(p, context);
          break;
        case p == 0:
          handle.refresh();
          break;
        case p > 0:
          console.log('暂不考虑前进');
          break;
      }
    },

    replace: function (path, context) {
      var pathData = _fn.resolvePath(path),
        events = handle.events, config,
        data, p;
      context = context || {};
      pathData = _fn.resolvePath(path);
      data = {
        pathData: pathData,
        type: 'replace',
        context: context
      };
      events.fire('preJump', data);
      _fn.setContext(data.context);
      handle.context = context;
      config = handle.config;
      //localdata.set( 'kayak.context', JSON.stringify( data.context ) );
      p = data.pathData[_fn.getPathType()] || '';
      if (!config.disableGalleonRouter &&utils.has('galleon.Navigator.replace')) {
        galleon.Navigator.replace(p, context);
        return;
      }

      if (path == handle.currentUrl) {
        //alert( 'a 重新执行enter方法' );
        actionMod.enter(handle.currentActions);
        // 从新进入enter方法 handle.refresh
      } else {
        isReplace = true;
        location.replace(path);
      }
    },

    refresh: function (context) {
      var path = window.location.href,
        currentUrl = handle.currentUrl,
        events = handle.events,
        data;

      context = context || {};
      pathData = _fn.resolvePath(path);
      data = {
        pathData: pathData,
        type: 'refresh',
        context: context
      };
      events.fire('preJump', data);
      _fn.setContext(data.context);
      handle.context = context;
      // localdata.set( 'kayak.context', JSON.stringify( data.context ) );
      if (currentUrl != data.pathData.web) { // 判断当前url是否相同，如果是hash不同则直接解析hash
        path.split('#')[0] == currentUrl.split('#')[0] ? _fn.parsePath() : window.location.reload();
        return;
      }
      actionMod.enter(handle.currentActions); // url没有变化，直接触发enter方法
    },

    redirect: function (path, context) {
      var pathData, p,
        events = handle.events,
        data;

      context = context || {};
      pathData = _fn.resolvePath(path);
      data = {
        pathData: pathData,
        type: 'redirect',
        context: context
      };
      events.fire('preJump', data);
      _fn.setContext(data.context);
      handle.context = context;
      // localdata.set( 'kayak.context', JSON.stringify( data.context ) );
      p = data.pathData[_fn.getPathType()] || '';
      _fn.parsePath(p);
    },

    /*==============	映射相关	==============*/
    map: function (map) {
      if (!$.isPlainObject(map)) {
        return;
      }
      $.extend(handle.pathMap, map);
    },
    on: function (eventType, callback) {
      if (!handle.events) {
        return
      }
      handle.events.on(eventType, callback);
    },


    /*==============	功能相关	==============*/
    start: function ( config ) {
      config = config || {}
      var events = handle.events,
        data, path, pathData, p, context;

      if (handle.isRunning) {
        return;
      }
      // 这里暂时没有默认配置
      this.config = _fn.mix( this.config, config );
      
      window.addEventListener('hashchange', _fn.hashChange);
      path = window.location.hash;
      pathData = _fn.resolvePath(path);
      context = _fn.getContext();
      //context = localdata.get( 'kayak.context' );	// 保留执行上下文
      data = {
        pathData: pathData,
        type: 'start',
        context: context,
        currentData: {
          url: handle.currentUrl,
          path: handle.currentPath,
          actions: handle.currentActions
        },
      };
      events.fire('preJump', data);
      _fn.setContext(data.context);
      //localdata.set( 'kayak.context', JSON.stringify( data.context ) );
      p = data.pathData[_fn.getPathType()] || '';
      _fn.parsePath(p);
      handle.isRunning = true;
    },
    stop: function () {
      if (!handle.isRunning) {
        return;
      }
      window.removeEventListener('hashchange', _fn.hashChange);
      handle.isRunning = false;
    },
    getDirection: function () { // 判断前进还是后退还是刷新，-1后退，1前进，0刷新 基本忽略刷新操作
      var kPrevPos = handle.prevPos,
        kCurrentPos = handle.currentPos,
        dPrevPos,
        dCurentPos,
        result;

      if (utils.has('galleon.Navigator')) {
        dPrevPos = galleon.Navigator.prevPos || -1;
        dCurentPos = galleon.Navigator.currentPos || -1;
      }

      if (kPrevPos != -1) { // 走kayak router
        switch (true) {
          case kCurrentPos > kPrevPos: // 前进
            result = 1;
            break;
          case kCurrentPos == kPrevPos: // 刷新
            result = 0;
            break;
          case kCurrentPos < kPrevPos: // 后退
            result = -1;
            break;
        }
      }

      if (kPrevPos == -1) { // 走galleon router
        switch (true) {
          case dPrevPos == -1 && dCurentPos == -1: // 没有实例的切换，前进
            result = 1;
            break;
          case dCurentPos > dPrevPos: // 前进
            result = 1;
            break;
          case dCurentPos == dPrevPos && dCurentPos != -1: // 刷新
            result = 0;
            break;
          case dCurentPos < dPrevPos: // 后退
            result = -1;
            break;
        }
      }

      return result;
    },


    /*==============	state相关	state统一先封装便于以后替换		==============*/
    getState: function () {
      // 因为state是和galleon对齐的，所以可以直接取state属性
      return window.history.state || {};
    },
    pushState: function (param, title, path) {
      param = param || {};
      title = title || '';
      param = $.extend(param, window.history.state);
      window.history.pushState(param, title, path);
    },
    replaceState: function (param, title, path) {
      param = param || {};
      title = title || '';
      param = $.extend(param, window.history.state);
      if (typeof window.history.replaceState == 'function') {
        window.history.replaceState(param, title, path);
      }
    }
  }

  _fn = {
    startTime: 0,
    init: function () {
      var handle = this;
      handle.events = handle.events || new eventsClass(handle.eventTypes);
      actionMod.init(handle);
      _fn.startTime = Date.now();
    },
    forward: function (path, context) {
      var config = handle.config;
      //console.log( !config.disableGalleonRouter );
      if ( !config.disableGalleonRouter && utils.has('galleon.Navigator.forward')) {
        galleon.Navigator.forward(path, context);
        return;
      }

      window.location.href = path;
    },

    back: function (step, context) {
      var self = this, config,
        pageState = window.history.state || {},
        events = handle.events;
      step = step / 1 || -1;

      config = handle.config;
      if ( !config.disableGalleonRouter && utils.has('galleon.Navigator.backward') && pageState && (step - 1 + pageState.currentPos) < 0) {
        galleon.Navigator.backward(Math.abs(step - 1 + pageState.currentPos), '', context);
        return;
      }
      history.go(-1);
      backStep = step + 1; // 这个逻辑需要整理下，在百度等浏览器中的级联回退问题
    },
    hashChange: function () {
      if (backStep < 0) { // hack 百度浏览器级联回退的bug
        _fn.back(-1, _fn.getContext());
        return;
      }
      _fn.parsePath();
    },

    parsePath: function (path) {
      var originPath = '';
      var config = handle.config;
      var args = {};

      path = typeof path == 'string' ? path : location.hash;
      originPath = path.indexOf('#') > -1 ? path.split('#')[1] : path;
      path = originPath.split(CFG.paramSplit);
      args = utils.parseParam(path.slice(1).join(':'));

      if (config.multiInstanceAsDiffParam) {
        _fn.changeView(originPath, args);
      } else {
        _fn.changeView(path[0], args);
      }
    },

    changeView: function (path, param) {
      var events = handle.events,
        pageState, wHistory = window.history;

      handle.requestParam = param;
      handle.prevPath = handle.currentPath;
      handle.prevActions = handle.currentActions;
      handle.prevUrl = handle.currentUrl

      handle.currentPath = path;
      handle.currentUrl = window.location.href;

      pageState = handle.getState();
      if (isReplace) {
        pageState.currentPos = handle.currentPos;
        handle.replaceState(pageState, '', handle.currentUrl);
        isReplace = false;
      } else if (!pageState.currentPos || wHistory.length <= pageState.currentPos) {
        pageState.currentPos = wHistory.length;
        handle.replaceState(pageState, '', handle.currentUrl);
      }
      handle.prevPos = handle.currentPos;
      handle.currentPos = pageState.currentPos || 0;

      actionMod.getMain(path, function (mainActions) {
        if (mainActions.length && mainActions[mainActions.length - 1].path != handle.currentPath) {
          return;
        }
        actionMod.getActions(path, function (actions) {
          if (actions.length && actions[actions.length - 1].fullPath != handle.currentPath) {
            return;
          }
          var differentActions;
          handle.currentActions = actions;
          differentActions = actionMod.getDifferent(handle.prevActions, handle.currentActions);
          differentActions.newActions = differentActions.newActions.length == 0 ? handle.currentActions : differentActions.newActions;
          actionMod.exit(differentActions.oldActions);
          handle.context = _fn.getContext();
          //handle.context = localdata.get( 'kayak.context' ) || {};
          actionMod.enter(differentActions.newActions);
          handle.crossAppLink = false;
        });
      });

      return;
    },

    isCurrentPath: function (path) {
      var currentActionPath = handle.currentActionPath;
      currentActionPath += '';
      if (path.indexOf('#') == 0) {
        return path == currentActionPath.split('#')[1];
      }
      return path == currentActionPath;
    },

    getPathType: function () {
      var result = '';
      // 以后端进行多个适配
      switch (true) {
        case !!utils.isDmallApp():
          result = CFG.DMALL_KAY;
          break;
        default:
          result = CFG.WEB_KEY;
          break;
      }
      return result;
    },

    resolvePath: function (path) {
      var result = {};

      if (typeof path == 'object') {
        result.web = _fn.fixPath(path.web) || '';
        result.dmalllink = _fn.fixPath(path.dmalllink) || '';
        return result;
      }

      result.web = _fn.fixPath(path);
      result.dmalllink = result.web;
      return result;
    },

    fixPath: function (path) {
      //检查是否是dshopurl，并且将其转成单页面hash st
      // var dshopHash = _fn.getDshopWxHash(path);
      // if(dshopHash){
      //     path = dshopHash;
      // }
      //检查是否是dshopurl，并且将其转成单页面hash ed
      if (typeof path == 'string' && path.charAt(0) == '#') {
        path = window.location.href.split('#')[0] + path;
      }
      return path;
    },

    // getDshopWxHash:function(path){
    //     //app环境使用a.dmall.com跳转，不做转换
    //     //微信，浏览器环境下，如果用户当前页面是a.dmall.com || da.dmall.com 直接跳转，不做转换
    //     //环境必须一致
    //     var retPath = ""
    //     var dshopReg =  /^\s*(http:\/\/|https:\/\/|\/\/)\w*a.dmall.com\/act\/\w*\.html/;//dshop url 正则
    //     var testEvtReg = /^\s*(http:\/\/|https:\/\/|\/\/)test/;//测试环境正则
    //     // debugger
    //     var pathEvt
    //     if( testEvtReg.test(path) ){
    //         pathEvt = '//test'
    //     }else{
    //         pathEvt = '//'
    //     }
    //     if(!utils.isDmallApp()&&//非app环境
    //         pathEvt === window.kayak.EVT && //环境必须一致
    //         location.host.indexOf('a.dmall.com')<0 && //非dshop入口
    //         location.host.indexOf('da.dmall.com')<0 &&//非dshop入口
    //         typeof path == 'string' &&  dshopReg.test(path) ){
    //             var regRes = path.match(dshopReg)
    //             var dshopUrl;
    //             if(regRes.length>0){
    //                 dshopUrl = regRes[regRes.index]
    //             }

    //             if(dshopUrl){
    //                 var dshopUrlArr = dshopUrl.split('\/');
    //                 if(dshopUrlArr.length>0 && dshopUrlArr[dshopUrlArr.length-1].indexOf('.html')>0){
    //                     var dshopCode = dshopUrlArr[dshopUrlArr.length-1].split('.html')[0];
    //                     retPath = '#' + 'dshopmodules/view/weixin/weixin:code='+dshopCode
    //                 }
    //                 if(path.split('?').length/1===2){
    //                     retPath = retPath +'&'+ path.split('?')[1];
    //                 }
    //             }
    //         }
    //         //在非app环境中 需要将dshop页面需要将url转成单页面ed bs
    //     return retPath;
    // },

    getContext: function () {
      var result,
        index;

      if (utils.has('galleon.Navigator.getContext')) {
        result = galleon.Navigator.getContext() || '{}'
        index = result.indexOf('{');
        // hack Android取值错误，但这个问题一定要查明
        result = result.substring(index, result.length);
      } else {
        result = localdata.get('kayak.context');
      }
      // alert( result.indexOf( "\"" ) );
      // alert( result );
      return typeof result == 'string' ? _fn.parseJSON(result) : result;
    },

    parseJSON: function (str) {
      try {
        return JSON.parse(str);
      } catch (e) {
        return {};
      }
    },

    setContext: function (obj) {
      if (!obj || !$.isPlainObject(obj)) {
        obj = {};
      }
      if (utils.has('galleon.Navigator.getContext')) {
        galleon.Navigator.setContext(obj);
        return;
      }
      localdata.set('kayak.context', obj);
    },
    mix : function( r, s ) {
      s = s || {};
      var p;
      for ( p in s ) {
        r[p] = s[p]
      }
      return r;
    }
  }

  define('kayak/core/router/router', function (require, exports, module) {
    kayak = require('kayak/core/kayak');
    link = require('kayak/core/link/link');
    utils = require('kayak/core/utils');
    eventsClass = require('kayak/core/events');
    actionMod = require('kayak/core/router/action.mod');
    deck = require('kayak/core/router/deckinterface');
    localdata = require('kayak/core/localdata');
    sRequire = require;
    _fn.init.apply(handle);
    module.exports = handle;
  });
})();
