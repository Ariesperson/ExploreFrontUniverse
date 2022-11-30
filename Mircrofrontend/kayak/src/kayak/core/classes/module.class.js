/**
 */
( function() {
	var Class, CONFIG, handle, CFG, _fn;

	// TODO: 图片懒加载的问题思考下
	handle = {
		// 实例id
		instanceId : null,
		// 页面中模块具体对应的jquery DOM
		jView : null,
		// config配置，对应模板装修页面配置项目
		configData : null,
		// 初始化方法
		init : function( jView, configData ) {
			configData = configData || {};
			if ( !jView ) {
				return null;
			}
			this.jView = jView;
			this.instanceId = jView.attr( CONFIG.INSTANCEID_ATTR );
			// 这里直接赋值configData会导致死循环,里面有个instance
			// this.configData = configData;
			this.configData = {};
			this.configData.data = configData.data;
		},
		// 重置配置信息
		setConfigData : function( configData ) {
			this.configData = $.extend( this.configData, configData );
		},
		isInView : function() {

		}
	};

	define( 'kayak/core/classes/module.class', function( require, exports, module ) {
		Class = require( 'kayak/core/classes/class' );
		CONFIG = require( 'kayak/core/config' );
		module.exports = Class.extend( handle );
	} );
} )();