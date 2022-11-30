;(function () {
	var kayak, kDom, ROUTER, handle, CFG, _fn;

	CFG = {
		SHOWTIME : 2000
	}

	handle = {
		className : 'kayak-widgets-tips-tips',
		jView : null,
		initView: false,
		timmer : null,
		show : function( text, time ) {
			_fn.initView();
			handle.jView.kInsert();
			var jView = handle.jView,
				time = time || CFG.SHOWTIME;

			clearTimeout( handle.timmer );
			jView.show().animate( { opacity : 1 }, 400 ).find( 'span' ).html( text );

			handle.timmer = setTimeout(function() {
				handle.hide();
			}, time);
		},

		hide : function() {
			var jView = handle.jView;

			if ( jView ) {
				jView.animate( { opacity : 0 }, {
					duration : 400,
					complete : function() {
						_fn.exit();
					}
				} );
			}
		}
	}
	_fn = {
		initView : function() {
            if( handle.initView ){
                return;
            }
            handle.jView = kDom.get(handle.className, kayak.jBody);
            handle.initView = true;
        },
        exit : function() {
            var jView = handle.jView;
            jView.hide();
            jView.kRemove();
        }
	}

	define( 'kayak/widgets/tips/tips', function( require, exports, module ) {
		require('kayak/widgets/tips/tips.tpl');
        require('kayak/widgets/tips/tips.css');

		kayak = require('kayak/core/kayak');
		kDom =  kayak.dom;

		module.exports = handle;
	});
})();
