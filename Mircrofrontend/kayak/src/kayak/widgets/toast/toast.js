;(function() {
    /**
     创建微信商城 消息提示
     描述：可以监听自定义事件 1). toast:show 动画开始
                         2). toast:hide 动画完成
     @param  设置参数
     {
         content : '温馨提示内容', （ 提示内容 [支持HTML结构] ）
         stayTime : 2000,（ 消息驻留时间 [可选] ）
         type : 'success',（ 自定样式class控制 [可选] ）
         bottomPercent: 0.3,（ 消息显示位置 距离可视窗口底部 百分比小数 [可选] ）
         zIndex : 999,（可选）（ z-index  [可选] ）
     }
     @return 当前消息提示对象

     例:
        var el = toast.show({
                content : '温馨提示内容',
                stayTime : 2000,
                type : 'success',
                bottomPercent: 0.3,
                zIndex : 999,
            });
        //自定事件监听
        el.on( 'toast:show', function(){
            console.log('动画显示开始');
        });
        el.on( 'toast:hide', function(){
            console.log('动画隐藏执行毕');
        });
    */

    var kayak,ROUTER,kDom,handle, _fn, timmer, CFG;
    var trackCallBack = $.Callbacks ? $.Callbacks() : null;

    CFG = {
        ING_CLS: "showing",
        TYPE: "info",
        CSS_ANIM_TIME: 100,
        TIME: 1500,
        Z_INDEX: 9999
    }

    function toast(option) {
        var self = this,
            css = "",
            cssAnimTime = 1,
            className = "";

        self.defaults = {
            content: "",
            stayTime: CFG.TIME,
            type: CFG.TYPE,
            zIndex: CFG.Z_INDEX
        };
        setTimeout(function() {
            self.option = $.extend(self.defaults, option);
            self.option.contStyle = !self.option.type ? 'padding:10px 15px 10px' : '';
            self._isFromTpl = '<div class="ui-poptips-cont" style="'+ self.option.contStyle +'">' + self.option.content + "</div>";
            self.el = handle.jView;
            css = "position: fixed;margin-bottom:-30px;left: 0;bottom: 50%;z-index: " + self.option.zIndex + ";";
            className = ("ui-poptips ui-poptips-" + self.option.type);
            switch (true) {
                case self.option.type == "info":
                    self.el.removeClass("ui-poptips-warn");
                    self.el.removeClass("ui-poptips-normal");
                    break;
                case self.option.type == "warn":
                    self.el.removeClass("ui-poptips-info");
                    self.el.removeClass("ui-poptips-normal");
                    break;
                case self.option.type == "normal":
                    self.el.removeClass("ui-poptips-info");
                    self.el.removeClass("ui-poptips-warn");
                    break;
            }
            self.el.attr("style", css).addClass(className).html(self._isFromTpl);
            self.show();
        }, cssAnimTime)
    }

    toast.prototype = {
        show: function() {
            var self = this,
                $el = self.el;
            $el.trigger("toast:show");
            if ($el.hasClass(CFG.ING_CLS)) {
                clearTimeout(timmer);
                self.timeOutFunc();
                return;
            }
            $el.addClass(CFG.ING_CLS);
            self.timeOutFunc();
        },
        timeOutFunc: function() {
            var self = this;
            if (self.option.stayTime > 0) {
                timmer = setTimeout(function() {
                    self.hide();
                }, self.option.stayTime)
            }
        },
        hide: function() {
            var self = this,
                $el = self.el;
            $el.trigger("toast:hide");
            $el.removeClass(CFG.ING_CLS);
            setTimeout(function() {
                $el.css("left", "-100%");
                if( typeof self.option.complete === 'function' ){
                    self.option.complete();
                }
            }, CFG.CSS_ANIM_TIME );
        }
    }

    handle = {
        className: 'kayak-widgets-toast-toast',
        jView : null,
        initView: false,
        inited: false,
        show: function(options) {
          var jBody = options.jBody || kayak.jBody;
            _fn.initView(jBody);
            handle.jView.kInsert(jBody);
            return (new toast(options)).el;
        },
        distory : function () {
            _fn.exit();
        },
        exit : function () {
            _fn.exit();
        }
    }
    _fn = {
        initView : function(jBody) {
            if( handle.initView ){
                return;
            }
            handle.jView = kDom.get(handle.className, jBody);
            // _fn.bind();
            handle.initView = true;
        },
        exit : function() {
      			var jView = handle.jView;
      			if( !jView ){
                      return;
      			}
            jView.kRemove();
        }

    }
    define('kayak/widgets/toast/toast', function(require, exports, module) {

        require('kayak/widgets/toast/toast.tpl');
        require('kayak/widgets/toast/toast.css');

        kayak = require('kayak/core/kayak');
        kDom = kayak.dom;
        ROUTER = kayak.router;

        module.exports = handle;
    });
})();
