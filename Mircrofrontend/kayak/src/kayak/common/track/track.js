(function () {
    var kayak, ROUTER, COOKIE, EVT, bigData, collect,baidu, handle, _fn, CFG;

    CFG = {
        TRACE_EVENT_DATA: 'data-traceevent',
        BACK_CLS: 'J_ToolBarBack',
        LINK_CLS: 'J_Link',
        CLICK_TRACE_CLS: 'J_ClickTrace',
        TIMEOUT: 20000
    }

    handle = {
		init : function() {
            //百度上报
            baidu.init();
			// 大数据上报
			bigData.init();
			// 架构师的上报
			collect.init();

		},
        trackPage : function (p) {
            // 上报页面访问量数据
            collect.trackPage(p);
            bigData.trackPage(p);
            baidu.trackPage(p);
        },

		// 上报点击事件
		trackClick : function() {
			// 兼容老上报
			if ( arguments.length == 1 ) {
				bigData.trackClick( arguments[0] );
			}

			// 架构师新上报 百度点击上报
			if ( arguments.length == 2 || arguments.length == 3 ) {
				collect.trackClick( arguments[0], arguments[1], arguments[2] );
				baidu.trackClick( arguments[0], arguments[1], arguments[2] );
			}

		},
        // 添加购物车上报，目前只上报大数据
        // p = { venderid : '', storeid : '', sku_id : ''};
        trackAddShoppingCart : function( p ) {
            bigData.trackAddShoppingCart( p );
        },
        trackRegister : function( p ) {
            bigData.trackRegister( p );
        },
        trackOrderClick : function( p ) {
            bigData.trackOrderClick( p );
        }
	}

    define('kayak/common/track/track', function (require, exports, module) {
        baidu = require( 'kayak/common/track/baidu' );
        bigData = require( 'kayak/common/track/bigdata' );
        collect = require( 'kayak/common/track/collect' );

        kayak = require('kayak/core/kayak');
        ROUTER = kayak.router;
        EVT = kayak.EVT;
        module.exports = handle;
    });
})();
