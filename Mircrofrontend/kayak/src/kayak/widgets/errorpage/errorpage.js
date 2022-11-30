; (function () {
	var kayak, kDom, ROUTER, handle, CFG, _fn;

	CFG = {
		REFRESH_CLS: 'J_Refresh',
		CHANGEADDR_CLS: 'J_ChangAddress',
		REFRESH_PANNEL_CLS: 'J_RefreshPannel',
		NOSERVICE_PANNEL_CLS: 'J_Noservice'
	}

	handle = {
		className: 'kayak-widgets-errorpage-errorpage',
		jView: null,
		initView: null,
		options: {},
		// 显示刷新页面
		showRefresh: function (options) {
			handle.options = options || {};
			_fn.showPannel(CFG.REFRESH_PANNEL_CLS, options);
		},

		// 显示不在服务
		showNoService: function (options) {
			_fn.showPannel(CFG.NOSERVICE_PANNEL_CLS, options);
		},

		hide: function () {
			_fn.exit();
		}
	}

	_fn = {
		initView: function () {
			if (handle.initView) {
				return;
			}
			handle.jView = kDom.get(handle.className, kayak.jBody);
			_fn.bind();
			handle.initView = true;
		},
		exit: function () {
			var jView = handle.jView;
			if (!jView) {
				return
			};
			jView.hide();
			jView.kRemove();
		},
		bind: function () {
			var jView = handle.jView;

			jView.on('click', function (e) {
				var jTarget = $(e.target);

				switch (true) {
					//重新加载
					case _fn.isIn(jTarget, CFG.REFRESH_CLS):
						if (handle.options && handle.options.callback) {
							handle.options.callback();
						} else {
							//目前android 微信里 window.location.reload 有问题
							ROUTER.refresh();
						}
						_fn.exit();
						break;
					//切换地址
					case _fn.isIn(jTarget, CFG.CHANGEADDR_CLS):
						ROUTER.go('#address/view/address/address');
						break;
				}
			});
		},

		showPannel: function (name, options) {
			options = options || {};
			_fn.initView();
			handle.jView.kInsert();

			var jView = handle.jView;
			var h = options.noToolBar ? 0 : 45;
			jView.children().hide();
			_fn.setStyle(h);
			jView.show();
			jView.find('.' + name).show();
		},

		setStyle: function (h) {
			var jView = handle.jView,
				jWindow = $(window);

			jView.css({
				'height': jWindow.height() - h * 1 + 'px',
				'top': h + 'px'
			});
		},

		isIn: function (jTarget, cls) {
			if (jTarget.hasClass(cls) || jTarget.parents('.' + cls).length > 0) {
				return true;
			}
			return false;
		}
	}

	define('kayak/widgets/errorpage/errorpage', function (require, exports, module) {
		require('kayak/widgets/errorpage/errorpage.tpl');
		require('kayak/widgets/errorpage/errorpage.css');

		kayak = require('kayak/core/kayak');
		kDom = kayak.dom;
		ROUTER = kayak.router;

		module.exports = handle;
	});
})();
