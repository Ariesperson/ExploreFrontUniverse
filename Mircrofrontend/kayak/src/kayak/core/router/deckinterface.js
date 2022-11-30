( function() {
	var Navigator, Storage, localStorage = window.localStorage;

	Navigator = {
		currentUrl : null,
		currentPos : -1,
		prevUrl : null,
		prevPos : -1,
		forward : null,
		backward : function() {},
		// pushFlow : function() {}	web不考虑实现
		popFlow : function () {},
		pushState : function () {},
		popState : function() {},
		replaceState : function() {},
		getHistoryList : function() {}
	}


	Storage = {
		// 浏览器存localstorage，app存穿透库
		set : function( key, value ) {
			localStorage.setItem( key, value );
		},
		get : function( key ) {
			return localStorage.getItem( key );
		},
		remove : function( key ) {
			localStorage.removeItem( key );
		},
		getContext : null,	// 留给Galleon实现
		setContext : null
	}

	define( 'kayak/core/router/deckinterface', function( require, exports, module ) {
		var galleon = {
			Navigator : Navigator,
			Storage : Storage
		};

		if ( window.galleon ) {
			galleon = $.extend( true, galleon, window.galleon );
			window.galleon = galleon;
		}

		module.exports = galleon;
	} );
} )();