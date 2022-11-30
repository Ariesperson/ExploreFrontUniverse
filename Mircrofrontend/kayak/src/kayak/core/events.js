// 路由生命周期，考虑封装到router里

( function(){
		//callbacks = {},
		// 页面生命周期
		// events = [ 'loading', 'loaded', 'beforeShow', 'endShow', 'beforeHide', 'endHide' ],
	var handle;

	// 去哪儿页面生命周期
	// loadStart loadEnd rendered loaded ready completed beforeShow show actived|deactived beforeHide hide destroy

	handle = function( events ){ 
		events = events || [];
		this.events = events;
		this.callbacks = {};
	}

	handle.prototype = {
		addEventType : function( eventType ) {
			var events = this.events;
			if ( events.indexOf( eventType ) == -1 ) {
				events.push( eventType );
			}
		},

		on : function( eventType, callback ) {
			var events = this.events,
				callbacks = this.callbacks;
			// 非注册事件不予处理
			if ( events.indexOf( eventType ) == -1 ) {
				return;
			}
			callbacks[eventType] = callbacks[eventType] || [];
			callbacks[eventType].push( callback );			
		},

		fire : function( eventType, param ) {
			var events = this.events,
				callbacks = this.callbacks,
				i, callback;
			if ( events.indexOf( eventType ) == -1 ) {
				return;
			}
			if ( callbacks[eventType] ) {
				for ( i = 0; callback = callbacks[eventType][i]; ++i ) {
					// 返回false后直接退出
					if ( typeof callback === 'function' && callback.call( window, param ) === false ) {
						return false;
					}
				}
			}
		}
	}

	define( 'kayak/core/events', function( require, exports, module ) {
		module.exports = handle;
	} );

} )();