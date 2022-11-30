/**
 * Created by k186 on 2019/9/19.
 * Name:
 * GitHub:
 * Email: k1868548@gmail.com
 */
(function () {
  var handle, sRequire, DI18n, _fn;

  handle = {
    //翻译tpl
    local: function (tpl, languageConfig, Locale) {
      var message = {};
      var locale = Locale || handle.getLocale()["dmall-locale"];
      message[[locale]] = languageConfig;
      DI18n = DI18n || window.DI18n;
      var di18n = new DI18n({
        locale: locale, // 语言环境
        isReplace: false, // 是否开启运行时功能(适用于没有使用任何构建工具开发流程)
        messages: message
      });
      return {
        tpl: di18n.$html(tpl),
        di18n: di18n
      }
    },
    //异步拉取语言包
    translate: function (a) {
      return new Promise(function (res) {
        handle.setTranslate(a, function (action) {
          res(action)
        })
      })
    },
    //异步挂载语言包
    setTranslate: function (action, callback) {
      var i, v, LOCALE = handle.getLocale()['dmall-locale'],
        POOL = kayak.POOL;
      //var tplPath = a.fullPath;
      var result = [];
      if (action.kayakLocale && LOCALE) {
        if (!Array.isArray(action.kayakLocale)) {
          console.warn('page kayakLocale 配置为数组');
        }
        var locale = action.kayakLocale;
        //循环加载包
        for ( i = 0; v = locale[ i ]; ++i ) {
          var localUrl = v + '/' + LOCALE;
          result = result.concat( localUrl )
        }
        //TODO 这里考虑 走默认js的tpl 免去nodeClass ，但也有可能 不需要TPL
        //result.push( ( tplPath + '.tpl' ) );
        sRequire.async( result, function () {
          var languagePackage = {};
          if(arguments.length==0){
            console.warn('当挂载语言包为空,请检查语言包配置名！')
          }
          //循环拼装
          for ( i = 0; v = arguments[ i ]; ++i ) {
            if(Object.keys(v).length==0||!v){
              console.warn(result[i]+':语言包配置为空，请检查');
            }
            languagePackage = $.extend( true, languagePackage, v )
          }
          //todo 这里有可能没有语言包！！！！
          //var tpl = arguments[ arguments.length - 1 ];
          //通过nodeClass 翻译 kayakPool
          var classSelector = action.nodeClass || action.el;
          var di18n = handle.updatePool( classSelector, languagePackage );
          //挂载语言包到对象
          action[ 'dLocale' ] = languagePackage;
          action[ '$d' ] = function () {
            return di18n.$t( arguments[ 0 ], arguments[ 1 ] )
          };
          callback && callback( action );
        } );
      } else {
        callback && callback( action );
      }
    },
    //设置前端语言环境,仅在h5环境可用
    setLocale: function ( localeData, reload ) {
      window.kayak.LOCALE = localeData.locale || 'zh_CN';
      window.kayak.ZONE = localeData.zone || null;
      var locale = window.kayak.LOCALE;
      var zone = window.kayak.ZONE;
      var domain =localeData.domain;
      _fn.setCookie( 'dmall-locale', locale, 7,null, domain );
      _fn.setCookie( 'dmall-zone', zone, 7,null, domain );
      if (reload) {
        window.location.reload()
      } else {
        return {
          'dmall-locale': locale,
          'dmall-zone': zone
        }
      }
    },
    getLocale: function () {
      //临时支持RTA OS HN环境国际化，_dm.getAppLocaleSync为RTA OS APP提供，后续会替换。
      var isHn=/HNContainer/g.test(window.navigator.userAgent) && window._dm !== undefined;
      var isSkeleton = /cabinx_skeleton_simulator/g.test(window.navigator.userAgent);//骨架屏
      var isAndroid = /android/g.test(navigator.userAgent.toLowerCase());

      var getDeviceInfoSync=function(){
        if(window._dm &&
          window._dm.getDeviceInfoSync &&
          typeof window._dm.getDeviceInfoSync == 'function'){
          return window._dm.getDeviceInfoSync();
        }else{//版本不支持
          return false;
        }
      }
      var compareVersion=function(verA,verB){
        var verAArr = verA.split('.');
        var verBArr = verB.split('.');
        if(verAArr.length != 3 || verBArr.length != 3){
          return false;
        }
        for(var i = 0 ; i < 2 ; i++){
          if(verAArr[i] < verBArr[i]){
            return -1//小于
          }else if(verAArr[i] > verBArr[i]){
            return 1//大于
          }
        }
        return 0//相等
      }
      var isVersionMatch=function(version){
        var deviceInfo = getDeviceInfoSync();
        if(deviceInfo === false){
          return false
        }
        var leastVer = version;
        // console.log(534534,deviceInfo,typeof deviceInfo);
        return compareVersion(deviceInfo.appVersion,leastVer)!=-1;
      }

      var getAppLocaleSync=function() {
        var locale='zh_CN';
        var methodsMap = window._dm && window._dm._sendMessageSync && window._dm._sendMessageSync({
          method:'_methodList'
        });

        if(!methodsMap||!methodsMap[0]||(!methodsMap[0].methods && !methodsMap[0].syncMethods)){
          return locale;
        }

        var methods = methodsMap[0].methods,
            syncMethods = methodsMap[0].syncMethods;

        var lists = methods && methods.filter(function (item) {
          return item && item.trim()==='getAppLocaleSync';
        });

        var syncLists = syncMethods && syncMethods.filter(function (item) {
          return item && item.trim()==='getAppLocaleSync';
        });


        if(lists.length || syncLists.length){

          var domain = methodsMap[0].domain || '';
          var funName = domain ? domain + '.getAppLocaleSync' : 'getAppLocaleSync';

          locale = window._dm && window._dm._sendMessageSync ? window._dm._sendMessageSync({"method":funName}) : null;
        }

        return locale;

        // if(!isVersionMatch('1.9.0')){
        //   return 'zh_CN';
        // }
        //
        // var locale = isAndroid ? (window._dm && window._dm._sendMessageSync ? window._dm._sendMessageSync({"method":"getAppLocaleSync"}) : null) : (window._dm && window._dm.getAppLocaleSync ? window._dm.getAppLocaleSync() : null);
        // return locale ||'zh_CN';
      }

      var getSkeletonLocale=function() {
        var ua = window.navigator.userAgent;
        var locale;
        if(/di18n=/g.test(ua)){
          var str=ua.split('di18n=')[1]||'';
          locale = str.split(' ')[0];
        }
        return locale;
      }

      var locale = !isHn&&!isSkeleton ? _fn.getCookie('dmall-locale') : (isSkeleton ? getSkeletonLocale() : getAppLocaleSync());
      var zone = !isHn&&!isSkeleton ? _fn.getCookie('dmall-zone') : null;
      if (!locale) {
        locale='zh_CN';
        //考虑默认设置和系统想要指定的域不一致，建议不要内部设置。
        // locale = handle.setLocale({
        //   locale: 'zh_CN',
        //   zone: zone
        // })['dmall-locale']
      }
      // if (!zone) {
      //   handle.setLocale( {locale: locale, zone: zone} )
      // }
      return {
        'dmall-locale': locale,
        'dmall-zone': zone
      }

      /*header  cookie  dmall-locale=en_US ;dmall-zone=+8*/
    },
    updatePool: function (classSelector, languagePackage) {
      if (classSelector) { //有nodeClass 才做 tpl翻译
        classSelector = classSelector.charAt(0) == '.' ? classSelector : ('.' + classSelector);
        var tpl = kayak.POOL.children(classSelector).prop('outerHTML');
        if (tpl != 'undefined') {
          var locale = handle.local(tpl, languagePackage);
          tpl = locale.tpl;
          //替换kayakPool
          kayak.POOL.children(classSelector).remove();
          kayak.POOL.eq(0).append(tpl);
          return locale.di18n
        }
      } else {
        //tpl = handle.local( tpl, languagePackage );
      }
    }
  };
  _fn = {
    /**
     * 获取当前 URL 二级域名
     * 如果当前是 IP 地址和其他情况均返回document.domain
     */
    getSubdomain: function () {
      var defalutDomain = document.domain;

      try {
        var domain = location.host;
        var subdomain = '';
        var key = 'dmall_' + Math.random();
        var expiredDate = new Date(0);
        var domainList = domain.split('.');

        var reg = new RegExp('(^|;)\\s*' + key + '=12345');
        var ipAddressReg = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/;

        // 若为 IP 地址、localhost，则直接返回
        if (ipAddressReg.test(domain) || domain === 'localhost') {
          return defalutDomain;
        }

        var urlItems = [];
        urlItems.unshift(domainList.pop());

        while (domainList.length) {
          urlItems.unshift(domainList.pop());
          subdomain = urlItems.join('.');

          var cookie = key + '=12345;domain=.' + subdomain;
          document.cookie = cookie;

          if (reg.test(document.cookie)) {
            document.cookie = cookie + ';expires=' + expiredDate;
            break;
          }
        }
        return subdomain || defalutDomain;
      } catch (e) {
        return defalutDomain;
      }
    },
    getCookie: function (name) {
      var arr;
      var reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
      if (arr = document.cookie.match(reg))
        return unescape(arr[2]);
      else
        return null;
    },
    setCookie: function (sName, sValue, day, path, domain) {
      var expireDate = new Date(),
        defaultDay = 30,
        daytime;

      // 微信失效时间为30天，浏览器失效时间为1天
      daytime = day || defaultDay;
      expireDate.setDate(expireDate.getDate() + daytime);
      path = path || '/';
      // domain = location.host.indexOf('.dmall.com.hk') > 0 ? 'dmall.com.hk' : (location.host.indexOf('.dmall.com') > 0 ? 'dmall.com' : document.domain);
      domain = domain || this.getSubdomain();

      function appendSecure(value) {
        if (location.protocol !== 'https:') {
          return value;
        }

        return value.concat(';secure');
      }

      //设置失效时间
      if (day + '' == '0') {
        var isIE = !!window.ActiveXObject || "ActiveXObject" in window; //判断是否是ie核心浏览器
        if (isIE) {
          document.cookie = appendSecure(escape(sName) + '=' + escape(sValue) + ';expires=At the end of the Session;path=' + path + ';domain=' + domain);
        } else {
          document.cookie = appendSecure(escape(sName) + '=' + escape(sValue) + ';expires=Session;path=' + path + ';domain=' + domain);
        }
        return;
      }

      document.cookie = appendSecure(escape(sName) + '=' + escape(sValue) + ';expires=' + expireDate.toGMTString() + ';path=' + path + ';domain=' + domain);
      //escape()汉字转成unicode编码,toGMTString() 把日期对象转成字符串
    }
  }

  define('kayak/core/translate/translate', function (require, exports, module) {
    sRequire = require;
    DI18n = require('kayak/common/di18n/di18n.js');
    module.exports = handle;
  });
})();
