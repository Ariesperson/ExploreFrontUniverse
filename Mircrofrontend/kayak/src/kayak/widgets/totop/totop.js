;(function () {
	var kayak, kDom, ROUTER, handle, CFG, _fn;

    CFG = {
        TOP_CLS : 'J_Top'
    }

    handle = {
        className : 'kayak-widgets-totop-totop',
        jView : null,
        jTop : null,
        initView: false,
        viewInfos : {},
        show : function(){
            _fn.initView();
            var jView = handle.jView,
                jTop =  handle.jTop;

            jView.kInsert();
            jView.show();

            if(!jTop.hasClass('show')){
                jTop.addClass('show')
            }
        },
        hide : function(){
            _fn.exit();
        },
        toTop : function(dom){
            _fn.toTop( dom );
        },

        /**
         * 注册需要滚动的view和滚动的div，区域
         */
        addViewContainer : function(obj){
            var viewKey = obj.view,
                containerKey = obj.container;
            handle.viewInfos[viewKey] = containerKey;
        }
    };

    _fn = {
        initView : function() {
            if( handle.initView ){
                return;
            }
            handle.jView = kDom.get(handle.className, kayak.jBody);
            handle.jTop = handle.jView.find( '.' + CFG.TOP_CLS );
            _fn.bind();
            handle.initView = true;
        },
        exit : function() {
			var jView = handle.jView,
				jTop = handle.jTop;
            if( jTop && jTop.hasClass('show')) {
                jTop.removeClass('show')
            }
			if( jView ){
				jView.hide().kRemove();
			}
        },
        bind : function(){
            var jView = handle.jView;

            jView.on('click',function(){
                _fn.toTopByViews();
            });
        },
        toTop   :   function(dom){
           // $(dom).animate({scrollTop:0},"slow");
           $(dom).scrollTop( 0 );
        },
        /*与addViewContainer方法有关系
         * 用户触发该方法后，先判断当前view是否被注册过（通过addViewContainer方法注册到viewInfos变量中）
         * 如果有，则查找该view注册的需要做滚动的div，并将该div滚动到头部
         */
        toTopByViews    :   function(){
			console.log( ROUTER  );
			var actions = ROUTER.currentActions,
				cHandle = actions[actions.length-1].action,
				viewKey = cHandle.className,
                containerKey = handle.viewInfos[viewKey];

            if(!containerKey){
                console.log(viewKey+" is not regist")
            }else{
                _fn.toTop( $( '.' + viewKey ).find( '.' + containerKey ) );
            }
        }
    }

    define('kayak/widgets/totop/totop', function (require, exports, module) {
        require('kayak/widgets/totop/totop.tpl');
        require('kayak/widgets/totop/totop.css');

		kayak = require('kayak/core/kayak');
		kDom =  kayak.dom;
		ROUTER =  kayak.router;

		module.exports = handle;
	});
})();
