( function() {
	var handle,	CFG, _fn, utils, eventsClass;

	CFG = {
		LINK_CLASS : 'J_Link',
		DEFAULT_LINK_ATTR : 'data-defaultlink',
		DMALL_LINK_ATTR : 'data-dmalllink',
		// 直接对应router方法
		LINK_METHOD_ATTR : 'data-linkmethod'
	}

	handle = {
		eventTypes : ['click'],
		events : null,
		init : function() {
			if ( handle.inited ) { return; }

			handle.events = handle.events || new eventsClass( handle.eventTypes );
			_fn.bind();
			handle.inited = true;
		},

		on : function( eventType, callback ) {
			if ( !handle.events ){ return }
			handle.events.on( eventType, callback );
		},

		isAppLink : function( path ) {
			if ( path.indexOf( 'app:' ) == 0 || path.indexOf( 'rn:' ) == 0 ) {
				return true;
			}
			// 默认为浏览器
			return false;
		}
	}

	_fn = {
		bind : function( ) {
			// 路由跳转
			$( document.body ).on( 'click', '.' + CFG.LINK_CLASS, function( e ) {
				e.preventDefault();
				_fn.jump( $( this ) );
			} );
		},

		jump : function( jTarget ) {
			var defaultLink = jTarget.attr( CFG.DEFAULT_LINK_ATTR ) || jTarget.attr( 'href' ),
				method = jTarget.attr( CFG.LINK_METHOD_ATTR ) || 'go',
				events = handle.events;
			if( defaultLink === undefined || defaultLink === '' ){ //如果没有值 或者为空 就不执行跳转
				return;
			}
			if ( utils.isDmallApp() ) {
				defaultLink = jTarget.attr( CFG.DMALL_LINK_ATTR ) || defaultLink;
			}
			events.fire( 'click', { method : method, link : defaultLink } );
		}
	}

	define( 'kayak/core/link/link', function( require, exports, module ) {
		eventsClass = require( 'kayak/core/events' );
		utils = require( 'kayak/core/utils' );
		module.exports = handle;
	} );
} )();