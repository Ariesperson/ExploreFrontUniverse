( function() {
	var handle;

	handle = {
		parseParam : function( path ) {
			var i, str, obj, len,
				result = {};
			path = path || '';
			path = path.split( '&' );
			for ( i = 0, len = path.length; i < len; ++i ) {
                str = path[i]
                if ( !str ) {
                    continue;
                }
				obj = str.split( '=' );
				if ( obj.length != 2 ) {
					continue;
				}
				result[obj[0]] = obj[1];
			}
			return result;
		},

		isDmallApp: function () {
            return window.navigator.userAgent.match(/dmall/i);
        },

        has : function( str ) {
        	return new Function( 'try { return ' + str + ' ? true : false; } catch( e ) { return false; }' )();
        }
	}
	define( 'kayak/core/utils', function( require, exports, module ) {
		module.exports = handle;
	} );
} )();