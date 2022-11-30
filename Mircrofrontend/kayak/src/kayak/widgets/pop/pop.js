;(function () {
	var kayak, kDom, handle, CFG, UTILS, currentConfig, _TOUCH, _fn;

	CFG = {
		POP_CONT_CLS : 'J_PopCont',
		POP_TEMP_CLS : 'J_PopTemp',
		MASK_CLS : 'J_PopMask',
		EVENT_ATTR : 'data-type'
	}

	/*
	popConfig = {
		title : '提示信息',
		msg : '提示文案',
		html : '<div class="sample">这是一个html结构</div>'
		btns : {
			'ok' : {
				text : '确认',
				click : function() {

				}
			}
		},
		onClickMask : function() {

		}
	}*/

	handle = {
		className: 'kayak-widgets-pop-pop',
        jView: null,
        initView: false,
        inited: false,
		jPop : null,
		jMask : null,
		hideCallback:null,
		show : function( config ) {
			if ( !config || !config.btns ) {
				return;
			}
			currentConfig = config;
			_fn.initView();
			handle.jView.kInsert();

			var jView = handle.jView,
				jPop = handle.jPop,
				screenHeight = $( window ).height();

			// 设置模板
      var btnLen = UTILS.getObjLength( config.btns );
			var btnWidth = ( 100 /btnLen ) + '%';
      //处理 如果 只有一个按钮时 样式优化 不显示 左边框
			config.styles = btnLen == 1 ? ('border-left:none;width:' + btnWidth) :('width:' + btnWidth);
			var temp = UTILS.getTemp( CFG.POP_TEMP_CLS );
			jPop.html( temp(config) );
			// 计算pop高度
			jView.show();
			jView.css( 'opacity', '0' );
			_fn.resetPop();
			jView.animate( { opacity : 1 }, 200 );
			//没有标题时，设置内容区域高度
			var head = handle.jView.find('.head'),
				content = handle.jView.find('.content');
			if( head.length == 0){
				head.css( 'display', 'none' );
				content.css( 'padding','24px 10px 20px 10px' );
			}
			if(config.pophide && typeof config.pophide==='function'){
				handle.hideCallback = config.pophide;
			}
		},

		/**
	    	pop.alert( {
	    		titie : '小提示',
	    		context : 'asdf',
	    		sure : function() {},
	    	} );
		 */
		alert : function( option ) {

		},

		/**
	    	pop.alert( {
	    		titie : '小提示',
	    		context : 'asdf',
	    		sure : function() {},
	    		cancel : function() {}
	    	} );
		 */
		confirm : function( option ){

		},

		hide : function() {
			_fn.exit();
		}

	}

	_fn = {
		initView : function() {
            if( handle.initView ){
                return;
            }
            handle.jView = kDom.get(handle.className, kayak.jBody);
			_fn.initPop();
            handle.initView = true;
        },
        exit : function() {
            var jView = handle.jView || '';
			if(!jView){
				return;
			}
            jView.hide();
            jView.kRemove();
            if(handle.hideCallback && typeof handle.hideCallback === 'function'){
            	handle.hideCallback();
            }
        },
		initPop : function() {
			handle.jPop = handle.jView.find( '.' + CFG.POP_CONT_CLS );
			handle.jMask = handle.jView.find( '.' + CFG.MASK_CLS );
			_fn.bind();
		},
		bind : function() {
			var jMask = handle.jMask,
				jPop = handle.jPop,
				jView = handle.jView;

			// 页面
			jPop.on( _TOUCH, function( e ) {
				// e.preventDefault();
				var jTarget = $( e.target ),
					event = jTarget.attr( CFG.EVENT_ATTR ),
					btns = currentConfig.btns;


				if ( btns[event] ) {
					jView.hide();
				}

				if ( btns[event] && typeof btns[event].click == 'function' ) {
					btns[event].click( e );
				}
				// 出发button
				//jView.hide();

			} );

			// 一接触就关闭
			jMask.on( _TOUCH, function( e ) {
				e.preventDefault();
				jView.hide();
				if ( typeof currentConfig.onClickMask == 'function' ) {
					currentConfig.onClickMask();
				}
			} );

			$( window ).resize( function() {
				_fn.resetPop();
			} );
		},
		resetPop : function() {
			var jPop = handle.jPop;

			jPop.css( {
				marginTop : -( jPop.height() / 2 + 60 ),
				marginLeft : -( jPop.width() / 2 )
			} );
		}

	}
	define( 'kayak/widgets/pop/pop', function( require, exports, module ) {
		require('kayak/widgets/pop/pop.tpl');
        require('kayak/widgets/pop/pop.css');

		currentConfig = null;
		// _TOUCH = ( 'ontouchend' in document ) ? 'touchstart' : 'click';
		//修复点穿问题
		_TOUCH = 'click';
		UTILS = require('kayak/common/utils/utils');
		kayak = require('kayak/core/kayak');
		kDom =  kayak.dom;

		module.exports = handle;
	});
})();
