(function () {
    var kayak, ROUTER, COOKIE, EVT, handle, _fn, CFG;

    CFG = {
        LOC_HREF: window.location.href,
        DM_COLLECT_URL: 'lg.dmall.com/opDataPush/opDataPushWeb',
        TRACE_EVENT_DATA: 'data-traceevent',
        BACK_CLS: 'J_ToolBarBack',
        LINK_CLS: 'J_Link',
        CLICK_TRACE_CLS: 'J_ClickTrace',
        TIMEOUT: 20000
    }

    handle = {
        init: function () {
            _fn.initBeianTrack();
            _fn.initBaidu();
            _fn.bind();
        },
        // 上报自己监控
        trackDmall: function (param) {
            return;
            param = param || {};
            var list = [],
                url, img, p;

            param.prevPage = param.prevPage || encodeURIComponent(ROUTER.prevUrl) || encodeURIComponent(document.referrer);
            param.currentUrl = param.currentUrl || encodeURIComponent(CFG.LOC_HREF);
            param.timestamp = (new Date).getTime();
            for (p in param) {
                if (p && param[p]) {
                    list.push(p + '=' + param[p]);
                }
            }
            var dmCollectUrl = EVT + CFG.DM_COLLECT_URL;
            url = list.length > 0 ? dmCollectUrl + '?' + list.join('&') : dmCollectUrl;
            img = new Image();
            img.src = url;
        },
        trackPage: function () {
            _fn.trackPageBaidu();
            _fn.trackPageDmall();
        },
        trackRegister: function (options) {
            _fn.trackRegister(options);
        },
        trackOrderClick: function (options) {
            _fn.trackOrderClick(options);
        },
        trackPageDmall: function () {
            _fn.trackPageDmall();
        },
        trackClick: function (jTarget, act) {
            _fn.trackClickBaidu(jTarget, act);
        },

        trackClickAct: function (category, action) {
            // 百度点击事件上报
            _hmt.push(['_trackEvent', category, category + ' ' + action]);
        }
    }

    _fn = {
        bind: function () {
            var jBody = $(document.body);
            jBody.on('click', function (e) {
                var jTarget = $(e.target),
                    jClickTarget = jTarget.hasClass(CFG.CLICK_TRACE_CLS) ? jTarget : jTarget.parents('.' + CFG.CLICK_TRACE_CLS);

                // 点击上报
                handle.trackClick(jClickTarget);
                switch (true) {
                    // 全局返回
                    case jTarget.hasClass(CFG.BACK_CLS) || jTarget.parents('.' + CFG.BACK_CLS).length > 0:
                        handle.trackClick(null, '点击返回');
                        break;
                }
            });
        },
        //初始百度统计 引用js
        initBaidu : function () {
            var hm = document.createElement("script");
            hm.src = "//hm.baidu.com/hm.js?3c760cfd485a098a377d76ceec857d7d";
            var s = document.getElementsByTagName("script")[0];
            s.parentNode.insertBefore(hm, s);
        },
        // 百度统计上报
        trackPageBaidu: function () {
            var href = CFG.LOC_HREF;
            href = href.split('dmall.com');
            href.shift();
            href = href.join('/');
            href = href.replace('#', '?');
            _hmt.push(['_trackPageview', href]);
        },

        // 大数据上报
        trackPageDmall: function () {
            var href = CFG.LOC_HREF,
                currentPath = ROUTER.currentPath,
                requestParam = ROUTER.requestParam || {},
                id = requestParam.id || '',
                param;

            if (!window.DmallAnalysis) {
                return;
            }
            param = _fn.getDmallParam();
            param['refer_url'] = ROUTER.prevUrl || document.referrer || '';
            if (currentPath && currentPath == 'wxdmall/view/minisite/minisite') { //minisite 页面
                id = id.split('-');
                param.venderid = id[1];
                param.storeid = id[2];
            }
            if (currentPath && currentPath == 'item/view/item/item') { //商详页面
                id = id.split('-');
                param.venderid = id[0];
                param.storeid = id[1];
            }

            // console.log( params );
            window.DmallAnalysis.digger.setOverrideParams(param);
            window.DmallAnalysis.digger.sendPageViewTracker();
        },
        trackOrderClick: function (options) {
            var param, params,
                url = EVT + 'collect.dmall.com/mweb/order_click',
                cookie_id = COOKIE.get('cookie_id') || '';

            if (!window.DmallAnalysis) {
                return;
            }
            param = _fn.getDmallParam() || {};
            params = $.extend(param, options || {});

            var finalParam = {
                client_flag: 'WeChat',
                cookie_id: cookie_id,
                user_id: params.user_id,
                pvid: '',
                channel_id: params.channel_id,
                venderid: params.venderid,
                storeid: params.storeid,
                order_id: params.order_id || '',
                status_code: params.status_code || ''
            };
            _fn.insertImgToPage(url, finalParam);
        },
        trackRegister: function (options) {
            var href = CFG.LOC_HREF,
                param, params,
                url = EVT + 'collect.dmall.com/mweb/m_register',
                cookie_id = COOKIE.get('cookie_id') || '';

            if (!window.DmallAnalysis) {
                return;
            }
            param = _fn.getDmallParam() || {};
            params = $.extend(param, options || {});

            var finalParam = {
                client_flag: 'WeChat',
                cookie_id: cookie_id,
                user_id: params.user_id,
                pvid: '',
                channel_id: params.channel_id,
                venderid: params.venderid,
                storeid: params.storeid,
                url: href,
                refer_url: ROUTER.prevUrl || document.referrer || '',
                latitude: params.latitude,
                longitude: params.longitude,
                ext: '',
                phone: options.phone || '',
                flag: params.flag
            };
            _fn.insertImgToPage(url, finalParam);
        },
        insertImgToPage: function (url, finalParam) {
            // console.log( finalParam );
            var finalParam = finalParam || {},
                img;
            url = url + '?' + _fn.parseParam(finalParam);
            img = new Image();
            img.src = url;
            // s.insertBefore( g, s.childNodes[0] );
            // //自动清除img 标签
            // setTimeout( function() {
            // 	s.removeChild( d.getElementById('id_'+ cookie_id) );
            // } ,10 );
        },
        parseParam: function (obj) {
            var paramStr = [],
                param = obj || {},
                p;
            for (p in param) {
                (p == 'url' || p == 'refer_url') ? paramStr.push(p + '=' + encodeURIComponent(param[p])): paramStr.push(p + '=' + param[p]);
            }
            return paramStr.join('&');
        },
        trackClickBaidu: function (jTarget, act) {
            jTarget = $(jTarget);
            var action = jTarget.attr(CFG.TRACE_EVENT_DATA),
                category = ROUTER.currentPath || '';

            action = action || act;
            if (!action) {
                return;
            }
            action = category + ' ' + action;
            var requestParam = ROUTER.requestParam,
                sourceId = requestParam.source_id || '',
                sourceLabel = action + ' ' + sourceId;

            _hmt.push(['_trackEvent', category, action, sourceLabel]);
        },
        // 初始化大数据埋点
        initBeianTrack: function () {
            window._digger_ = {
                disablePageViewTrack: true,
                trackerUrlMap: {
                    pageView: ['//collect.dmall.com/mweb/m_pv']
                },
                cookieDomain: '.dmall.com',
                strictMode: {
                    paramOrder: {
                        '//collect.dmall.com/mweb/m_pv': ['client_flag', 'cookie_id', 'user_id', 'pvid', 'channel_id', 'venderid', 'storeid', 'url', 'refer_url', 'latitude', 'longitude', 'ext']
                    },
                    disableDefaultParams: true
                },
                extendParams: {
                    client_flag: 'WeChat',
                    ext: '',
                    pvid: '',
                    channel_id: ''
                },
                trackCookieKeys: {
                    storeid: 'store_id',
                    user_id: 'ticketLoginId',
                    venderid: 'vender_id'
                },
                trackLocalStorageKeys: {
                    latitude: 'location.latitude',
                    longitude: 'location.longitude'
                }
            }

            // var u = 'http://m.dmall.com/assets/extenal_resource/';
            //临时存放大数据digger.js
            var u = EVT + 'static.dmall.com/lib/wx-dmall/bigdata/';
            var d = document,
                g = d.createElement('script'),
                s = d.getElementsByTagName('script')[0];
            var param;
            g.type = 'text/javascript';
            g.async = true;
            g.defer = true;
            g.src = u + 'digger.js';
            s.parentNode.insertBefore(g, s);
        },

        getDmallParam: function () {
            var result = {},
                loc = COOKIE.get('wxLoc') || '',
                shops = COOKIE.get('wxShops'),
                venderId = [],
                storeId = [],
                lng, lat, i, shop;

            shops = shops.split(',');
            loc = loc.split(',');
            lng = loc[0] || '';
            lat = loc[1] || '';
            for (i = 0; shop = shops[i]; ++i) {
                shop = shop.split('-');
                venderId.push(shop[0] || '');
                storeId.push(shop[2] || '');
            }
            result = {
                user_id: COOKIE.get('ticketLoginId') || '',
                venderid: venderId.join(','),
                storeid: storeId.join(','),
                latitude: lat,
                longitude: lng
            }
            return result;
        }
    }
    define('kayak/common/track/track', function (require, exports, module) {
        kayak = require('kayak/core/kayak');
        COOKIE = require('kayak/common/cookie/cookie');
        ROUTER = kayak.router;
        EVT = kayak.EVT;
        module.exports = handle;
    });
})();
