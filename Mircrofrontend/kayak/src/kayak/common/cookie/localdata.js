;(function () {
    var handle,CFG,_fn;

    handle = {
        canUselocalStorage: true, //默认可用localStorage
        init: function () {
            //检查localStorage是否可用
            handle.canUselocalStorage = handle.check();
        },
        check: function () {
            // Safari, in Private Browsing Mode, looks like it supports localStorage but all calls to setItem
            // throw QuotaExceededError. We're going to detect this and just silently drop any calls to setItem
            // to avoid the entire page breaking, without having to do a check at each usage of Storage.
            var stor = window.localStorage,
                result = true;
            if (typeof stor === 'object') {
                try {
                    stor.setItem('localStorage', 1);
                    stor.removeItem('localStorage');
                } catch (e) {
                    result = false;
                    // console.log('Your web browser does not support storing settings locally. In Safari, the most common cause of this is using "Private Browsing Mode". Some settings may not save or some features may not work properly for you.');
                }
            }

            return result
        },
        get: function (key) {
            var stor = window.localStorage;

            if (!stor) {
                return;
            }

            return stor.getItem(key);
        },

        // paramType1 : key, value
        // paramType2 : { key1 : value, key2 : value }
        set: function () {
            var stor = window.localStorage,
                canUse = handle.canUselocalStorage,
                k, obj;

            if (!stor || !canUse) {
                return;
            }
            // 单个存储
            if (arguments.length == 2) {
                stor.setItem(arguments[0], arguments[1]);
                return;
            }

            // 多个存储
            if (arguments.length == 1 && typeof arguments == 'object') {
                obj = arguments[0];
                for (k in arguments[0]) {
                    stor.setItem(k, arguments[0]);
                }
            }
        },

        del: function () {
            var stor = window.localStorage,
                canUse = handle.canUselocalStorage,
                obj, i, k;

            if (!stor || !canUse) {
                return;
            }

            obj = arguments[0];
            // 单字符
            if (typeof obj === 'string') {
                stor.removeItem(obj);
                return;
            }

            if (typeof obj === 'object') {
                for (i = 0; k = obj[i]; ++i) {
                    stor.removeItem(k);
                }
            }
        },

        clearAll: function () {
            var stor = window.localStorage,
                canUse = handle.canUselocalStorage;
            if (!stor || !canUse) {
                return;
            }

            stor.clear();
        }
    }
    define('kayak/common/cookie/localdata', function (require, exports, module) {
        handle.init();
        module.exports = handle;
    });

})();
