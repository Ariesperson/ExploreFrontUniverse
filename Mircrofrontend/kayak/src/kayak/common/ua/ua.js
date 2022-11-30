/*
 * @Descripttion: 
 * @version: 
 * @Author: dong.luo@dmall.com
 * @Date: 2019-08-15 20:34:07
 * @LastEditors: dong.luo@dmall.com
 * @LastEditTime: 2019-11-18 14:33:45
 */
; (function () {
    var handle,
        COOKIE,
        UA = window.navigator.userAgent;

    handle = {
        // 判断是否是app
        isDmallApp: function () {
            // 和杨涵联调测试代码
            //return UA.match( /iphone/i );
            return UA.match(/dmall/i);
        },
        //移动设备
        isMobileDevice: function () {
            return /Mobile|iP(hone|od)|Android|BlackBerry|IEMobile/.test(UA);
        },
        isAndroid: function () {
            return UA.match(/Android/i);
        },
        isIOS: function () {
            return UA.match(/iphone|ipad|ipod/i);
        },
        //要确认是否是QQ内置浏览器
        isQQwebview: function () {
            if (handle.isMobileDevice() && (UA.match(/QQ\//i) == 'QQ/')) {
                return true;
            } else {
                return false;
            }
        },
        //微信环境
        isWxAgent: function () {
            return UA.toLowerCase().match(/MicroMessenger/i) == 'micromessenger' && COOKIE.get('platform') != 'miniprogram';
        },

        isMiniprogram: function () {
            return COOKIE.get('platform') == 'miniprogram';
        },
        isSuperApp: function () {
            return UA.match(/super/i);
        },
        isPopApp: function () { //地推
            return UA.match(/pop/i);
        },
        //荔枝FM app
        isLizhiFM: function () {
            return UA.toLowerCase().match(/LizhiFM/i) == 'lizhifm';
        },
        wakeupApp: function (protocol) {
            var schemeHead = 'dmall://dmall/';
            //目前考虑如果 是手机浏览器
            //且 不在微信内
            //且 不dmall app 内
            //就唤起
            if (
                handle.isMobileDevice() &&
                !handle.isWxAgent() &&
                !handle.isDmallApp()
            ) {
                setTimeout(function () {
                    window.location = schemeHead + protocol;
                }, 300);
                // $(document.body).append('<iframe src="dmall://dmall/app://DMWareDetailPage?sku='+ sku +'" style="display:none" target="" ></iframe>');
            }
        }
    }

    define('kayak/common/ua/ua', function (require, exports, module) {
        COOKIE = require('kayak/common/cookie/cookie');
        module.exports = handle;
    });
})();
