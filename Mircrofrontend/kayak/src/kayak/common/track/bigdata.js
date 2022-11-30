(function() {
    var kayak, ROUTER, COOKIE, EVT, COOKIE, handle, sourceLoaded = $.Callbacks(),
        _fn;

    handle = {
        init: function() {
            return; //先关闭 目前这个已经没有接入上报了 后面考虑移除
            _fn.initDigger();
            _fn.injectDiggerJs();
        },
        // 页面pv、uv上报
        trackPage: function() {
            if ( sourceLoaded.fired() ) {
                _fn.trackPage();
                return;
            }
            sourceLoaded.add(_fn.trackPage);
        },
        trackClick: function(options) {
            var param, key, params, finalParam, arr = [];

            param = _fn.getDmallParam() || {};
            params = $.extend(param, options || {});

            finalParam = {
                client_flag: 'WeChat',
                cookie_id: COOKIE.get('cookie_id') || '',
                user_id: params.user_id,
                pvid: '',
                channel_id: params.channel_id || '',
                venderid: params.venderid,
                storeid: params.storeid,
                event_flag: params.event_flag || ''
            };

            for (key in finalParam) {
                arr.push(key + '=' + finalParam[key]);
            }
            _fn.createImg('http://collect.dmall.com/mweb/m_event_click', arr.join('&'));
        },
        //订单
        trackOrderClick: function(options) {
            var param, key, params, finalParam, arr = [];

            if (!window.DmallAnalysis) {
                return;
            }
            param = _fn.getDmallParam() || {};
            params = $.extend(param, options || {});

            finalParam = {
                client_flag: 'WeChat',
                cookie_id: COOKIE.get('cookie_id') || '',
                user_id: params.user_id,
                pvid: '',
                channel_id: params.channel_id || '',
                venderid: params.venderid,
                storeid: params.storeid,
                order_id: params.order_id || '',
                status_code: params.status_code || ''
            };
            for (key in finalParam) {
                arr.push(key + '=' + finalParam[key]);
            }
            _fn.createImg('http://collect.dmall.com/mweb/order_click', arr.join('&'));
        },
        //注册登录
        trackRegister: function(options) {
            var param, key, params, finalParam, arr = [];

            if (!window.DmallAnalysis) {
                return;
            }
            param = _fn.getDmallParam() || {};
            params = $.extend(param, options || {});
            finalParam = {
                client_flag: 'WeChat',
                cookie_id: COOKIE.get('cookie_id') || '',
                user_id: params.user_id,
                pvid: '',
                channel_id: params.channel_id || '',
                venderid: params.venderid,
                storeid: params.storeid,
                url: encodeURIComponent(window.location.href),
                refer_url: encodeURIComponent(ROUTER.prevUrl || document.referrer || ''),
                latitude: params.latitude,
                longitude: params.longitude,
                ext: '',
                phone: options.phone || '',
                flag: params.flag
            };
            console.log( finalParam );
            for (key in finalParam) {
                arr.push(key + '=' + finalParam[key]);
            }
            _fn.createImg('http://collect.dmall.com/mweb/m_register', arr.join('&'));
        },
        trackAddShoppingCart: function(p) {
            var urlParam = window.location.href,
                param, key, arr = [],
                url;

            url = 'http://collect.dmall.com/mweb/add_cart_click?client_flag=WeChat&cookie_id=' + (COOKIE.get('cookie_id') || '') + '&user_id=' + (COOKIE.get('ticketLoginId') || '') + '&pvid=&channel_id=&venderid=' + p.venderid + '&storeid=' + p.storeid + '&ware_id=&sku_id=' + p.sku_id + '&page_type=6&page_name=' + encodeURIComponent(urlParam);
            _fn.createImg(url, '');
        }
    }

    _fn = {
        getClientFlag: function() {
            var clientInfo = utils.getClientType();
            var clientFlag = "";
            if (clientInfo.clientName == 'app') {
                if (clientInfo.clientNameArr.indexOf("android") > -1) {
                    clientFlag = "android"
                } else {
                    clientFlag = "iphone"
                }
            } else {
                if (clientInfo.clientNameArr.indexOf("browser") > -1) {
                    clientFlag = "mweb"
                } else {
                    clientFlag = "wechat"
                }
            }
            return clientFlag;
        },
        initDigger: function() {
            window._digger_ = {
                disablePageViewTrack: true,
                disableAutoReport: true,
                trackerUrlMap: {
                    pageView: ['http://collect.dmall.com/mweb/m_pv']
                },
                cookieDomain: '.dmall.com',
                strictMode: {
                    paramOrder: {
                        'http://collect.dmall.com/mweb/m_pv': ['client_flag', 'cookie_id', 'user_id', 'pvid', 'channel_id', 'venderid', 'storeid', 'url', 'refer_url', 'latitude', 'longitude', 'ext']
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
        },
        injectDiggerJs: function(callback) {
            var url = '//static.dmall.com/lib/wx-dmall/bigdata/digger.js';

            $.getScript(url, function() {
                sourceLoaded.fire();
            });
            /*		    var u = '//m.dmall.com/assets/extenal_resource/';
            		    var d = document, g = d.createElement('script'), s = d.getElementsByTagName('script')[0];
            		    var param;
            		    g.type = 'text/javascript';
            		    g.async = true;
            		    g.defer = true;
            		    g.src = u + 'digger.js';
            		    s.parentNode.insertBefore(g, s);		*/
        },

        trackPage: function() {
            var currentPath = ROUTER.currentPath,
                requestParam = ROUTER.requestParam || {},
                id = requestParam.id || '',
                param;

            if (!window.DmallAnalysis) {
                return;
            }
            param = _fn.getDmallParam();
            param['refer_url'] = encodeURIComponent(ROUTER.prevUrl || document.referrer || '');
            if (currentPath && currentPath == 'wxdmall/view/sorts/sorts') { //minisite 页面
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
        getDmallParam: function() {
            var result = {},
                loc = COOKIE.get('wxLoc') || '',
                shops = COOKIE.get('wxShops'),
                venderId = [],
                storeId = [],
                lng, lat, i, shop;

            shops = shops.split(',');
            loc = loc.split(',');
            for (i = 0; shop = shops[i]; ++i) {
                shop = shop.split('-');
                venderId.push(shop[0] || '');
                storeId.push(shop[2] || '');
            }
            result = {
                user_id: COOKIE.get('ticketLoginId') || '',
                venderid: venderId.join(','),
                storeid: storeId.join(','),
                latitude: loc[1] || '',
                longitude: loc[0] || ''
            }
            return result;
        },
        createImg: function(url, params, callback) {
            var image = new Image(1, 1);
            image.onload = function() {
                iterator = 0; // To avoid JSLint warning of empty block
                if (typeof callback === 'function') {
                    callback();
                }
            };
            console.log( params );
            console.log( url + (url.indexOf('?') < 0 ? '?' : '') + params );
            image.src = url + (url.indexOf('?') < 0 ? '?' : '') + params;
        }
    }
    define('kayak/common/track/bigdata', function(require, exports, module) {
        kayak = require('kayak/core/kayak');
        COOKIE = require('kayak/common/cookie/cookie');
        ROUTER = kayak.router;
        EVT = 'http://';
        module.exports = handle;
    });
})();
