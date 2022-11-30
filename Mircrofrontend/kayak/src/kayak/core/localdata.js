/**
	根据localdata封装data属性
	可以考虑实现a.b.c这类读写方式
 */
( function() {
	var handle,
		Storage,
		deck;

	handle = {
		set : function( key, value ) {
			var key = key.split( '.' ),
				data, i, len, o;			

			if ( key.length <= 0 ) {
				return;
			}
			data = Storage.get( key[0] ) || '{}';
			data = JSON.parse( data );
			o = data;
			for ( i = 1, len = key.length; i < len; ++i ) {
				o[key[i]] = i == len - 1 ? value : ( o[key[i]] || {} );
				o = o[key[i]];
			}
			Storage.set( key[0], JSON.stringify( data ) );
		},

		remove : function( key ) {
			var key = key.split( '.' ),
				data, i, len, o;			

			if ( key.length <= 0 ) {
				return;
			}
			data = Storage.get( key[0] ) || '{}';
			data = JSON.parse( data );
			o = data;
			for ( i = 1, len = key.length; i < len; ++i ) {
				if ( i == len - 1 ) {
					delete o[key[i]]
				}
			}	
			Storage.set( key[0], JSON.stringify( data ) );		
		},

		get : function( key ) {
			var key = key.split( '.' ),
				data, i, len, o, result;			

			if ( key.length <= 0 ) {
				return;
			}
			data = Storage.get( key[0] ) || '{}';
			data = JSON.parse( data );
			o = data;
			for ( i = 1, len = key.length; i < len; ++i ) {
				o = o[key[i]];
				if ( typeof o === 'undefined' ) {
					break;
				}
			}	
			return typeof o === 'string' ? JSON.parse( o ) : o;
		}
	}

	define( 'kayak/core/localdata', function( require, exports, module ) {
		deck = require( 'kayak/core/router/deckinterface' );
		Storage = deck.Storage;
		module.exports = handle;
	} );
} )();