( function() {
	var moduleClass,
		eventsClass,
		CONFIG,
		eventsTypes = [ 'init', 'beforeInit', 'beforeModuleRender' ,'loadComplete','allRenderFinish'],
		handle,
		defaultConfig,
		sRequire,
		_fn,
		callbacks = {};

	defaultConfig = {
		projectName : '',
		// 模板项目目录
		moduleDir : '',
		// 模板公共目录名
		moduleCommonDir : '',
		// 预加载的资源
		preLoad : {
			js : [],
			css : [],
			tpl : []
		},
		// 模块对应资源
		moduleSource : {
			// js : [],		// 这里是否要考虑复写的情况
			// js : [],
			// css : []
		},
		// 模块列表结构
		moduleList : {}
	}

	handle = function( jContainer, config ) {
		var self = this;

		self.destroyed = false;
		_fn.checkConfig.apply( this, [config] );
		self.jContainer = jContainer || kayak.jBody;
		config.preLoad = $.extend({}, defaultConfig.preLoad, config.preLoad );
		self.config = $.extend({}, defaultConfig, config );
		self.classes = {};
		self.events = new eventsClass( eventsTypes );
		// self.callbacks = $.Callbacks(); 用时才初始化
	}

	handle.prototype = {
		// 切换配置项目
		config : function( config ) {
			config = config || {};
			this.config = $.extend( this.config, config	 );
		},
		render : function( callback ) {
			var source,
				self = this;
			// 根据模块分析所需资源
			_fn.analyseSource.apply( self );
			source = _fn.mergeSource.apply( self );
			// 加载资源
			sRequire.async( source, function() {
				// 循环执行模块render方法
				self.events.fire('loadComplete');
				_fn.renderQueue.apply( self, [0, callback] );
			} );
			// 渲染模块
		},
		destroy : function() {
			var moduleList = this.config.moduleList || [], 
				i, m;

			for ( i = 0; m = moduleList[i]; ++i ) {
				if ( m.instance && m.instance.jView ) {
					m.instance.jView.remove();
					m.instance = null;
					m.inted = false;
				}
			}
			this.destroyed = true;
		},
		// 重新加载模板等资源
		reload : function() {
		},
		// 重新调用render方法
		refresh : function( option,callback )  {
			var self = this;
			var module = option.module;
			_fn.renderModlueInstance.apply( self, [module ] );
			if(typeof callback === 'function'){
				callback();
			}
		},
		// 事件监听
		on : function( eventType, callback ) {
			this.events.on( eventType, callback );
		},
		exchange:function(fromIdx,toIdx,callback){
			var fromModule = this.config.moduleList[fromIdx];
			var toModule = this.config.moduleList[toIdx];
			if(fromModule && toModule){
				var fromTargetView = fromModule.instance.jView;
				var toTargetView = toModule.instance.jView;

				var newFromTargetView = toTargetView.clone(true);
				var newToTargetView = fromTargetView.clone(true);

				fromTargetView.replaceWith(newFromTargetView);
				toTargetView.replaceWith(newToTargetView);

				fromModule.instance.jView = newToTargetView;
				toModule.instance.jView = newFromTargetView;

				var moduleTemp = $.extend(true,{},fromModule);
				this.config.moduleList[fromIdx] = toModule;
				this.config.moduleList[toIdx] = moduleTemp;
			}
			if(typeof callback === 'function'){
				callback();
			}

		},
		remove:function(module,callback){
			var self = this;
			self.events.fire('beforeRemove');
			var targetDom = module.instance.jView;
			targetDom.remove();
			var Idx = self.config.moduleList.indexOf(module);
			self.config.moduleList.splice(Idx,1);
			if(typeof callback === 'function'){
				callback();
			}
		},
		update:function(module,callback){
			var self = this;
			var moduleDir = self.config.moduleDir;
			var resouce = _fn.getResourcePath(moduleDir,module);
			var sourceList = [].concat(resouce.js).concat(resouce.css).concat(resouce.tpl);
			var moduleList = self.config.moduleList;
			debugger
			sRequire.async(sourceList,function(){
				self.events.fire('beforeUpdate');
				_fn.getModuleInstance({
					projectName:self.config.projectName,
					moduleDir:moduleDir,
					tplName:module.tplName,
					moduleName:module.moduleName,
					modulePath:resouce.js,
					module:module,
					callback:function(moduleInfo){
						debugger
						if(!moduleInfo){
							callback();
						}
						var moduleCls=moduleInfo.moduleCls;
						var moduleDom = moduleInfo.moduleDom;

						var targetDom = module.instance.jView;
						targetDom.replaceWith(moduleDom);
						// moduleDom.insertAfter(targetDom);
						// targetDom.remove();

						classes = self.classes;
						classes[module.tplName] = classes[module.tplName]  || moduleCls;

						var instance = new classes[module.tplName]( moduleDom, module );
						module.instance = instance;
						// self.config.moduleList.splice(index,1,module);
						_fn.renderModlueInstance.apply( self, [module ] );
						if(typeof callback === 'function'){
							callback();
						}
					}
				});
			});
			// _fn.renderModlueInstance.apply( self, [ module ] );
		},
		// add:function(module,target,index,callback){
		add:function(option,callback){
			var module = option.module;
			module.instanceId = module.instanceId || new Date().getTime();
			var index = option.index;
			var addDom = option.addDom;
			var callback = option.callback;

			var self = this;
			var moduleDir = self.config.moduleDir;
			var resouce = _fn.getResourcePath(moduleDir,module);
			var sourceList = [].concat(resouce.js).concat(resouce.css).concat(resouce.tpl);
			var moduleList = self.config.moduleList;
			sRequire.async(sourceList,function(){
				self.events.fire('beforeAdd');
				_fn.getModuleInstance({
					projectName:self.config.projectName,
					moduleDir:moduleDir,
					tplName:module.tplName,
					moduleName:module.moduleName,
					modulePath:resouce.js,
					module:module,
					callback:function(moduleInfo){
						if(!moduleInfo){
							callback();
						}
						var moduleCls=moduleInfo.moduleCls;
						var moduleDom = moduleInfo.moduleDom;

						// if(index<0){
						// 	self.jContainer.append(moduleDom);
						// }else{
						// 	var targetDom = self.jContainer.find("."+self.config.projectName)[index];
						// 	if(targetDom){
						// 		moduleDom.insertAfter(targetDom);
						// 		// targetDom.after(moduleDom);
						// 	}else{
						// 		self.jContainer.append(moduleDom);
						// 	}
						// }
						console.log(new Date());
						if(typeof addDom === 'function'){
							addDom(moduleDom);
						}else{
							self.jContainer.append(moduleDom);
						}

						classes = self.classes;
						classes[module.tplName] = classes[module.tplName]  || moduleCls;
						var instance = new classes[module.tplName]( moduleDom, module );
						module.instance = instance;
						index = typeof index === 'number'&&index>=0 ? index:self.config.moduleList.length-1;
						self.config.moduleList.splice(index+1,0,module);
						_fn.renderModlueInstance.apply( self, [ self.config.moduleList[index+1] ] );
						if(typeof callback === 'function'){
							callback();
						}

					}
				});
			});
		},
	};

	_fn = {
		checkConfig : function( config ) {
			if ( !config.projectName ) {
				console.log( '请填写项目名称projectName' );
				return false;
			}
			return true;
		},
		getResourcePath:function(moduleDir,module){
			var moduleName = module.moduleName;
			var tplName = module.tplName;
			var mId = moduleDir + moduleName + '/' + tplName + '/' + tplName;
			return {
				js:[mId],
				css:[mId+'.css'],
				tpl:[mId+'.tpl']
			}
		},
		getModuleInstance:function(option){
			var projectName = option.projectName;
			var moduleDir = option.moduleDir;
			var tplName = option.tplName;
			var moduleName = option.moduleName;
			var modulePath = option.modulePath;
			var callback = option.callback;
			var module= option.module;

			seajs.use( modulePath, function( tplClass ) {
				var moduleCls = moduleClass.extend( tplClass );
				domClone = kayak.dom.get( projectName + '.' + tplName).clone();
				domClone.attr( CONFIG.INSTANCEID_ATTR , module.instanceId );
				domClone.attr( CONFIG.TEMPLATENAME_ATTR, module.tplName );
				domClone.attr( CONFIG.MODULENAME_ATTR, module.moduleName );
				if(typeof callback === 'function'){
					callback({
						moduleCls:moduleCls,
						moduleDom : domClone
					});
				}
			});

		},
		// 分析模块中的依赖，形成请求包
		analyseSource : function() {
			var self = this,
				config = self.config,
				moduleList = config.moduleList,
				moduleSource = config.moduleSource,
				moduleDir = config.moduleDir,
				i, m, mId;

			// 对moduleDir进格式化
			moduleSource.js = moduleSource.js || [];
			moduleSource.css = moduleSource.css || [];
			moduleSource.tpl = moduleSource.tpl || [];
			for ( i = 0; m = moduleList[i]; ++i ) {
				// js不必拼接后缀，保持id名称一样
				if ( !m || !m.moduleName || !m.tplName ) {
					continue;
				}
				mId = moduleDir + m.moduleName + '/' + m.tplName + '/' + m.tplName;
				// 去重
				if ( moduleSource.js.indexOf( mId ) != -1 ) {
					continue;
				}
				// 设置common目录才加载
				if ( config.moduleCommonDir ) {
					mCommon = moduleDir + m.moduleName + '/' + config.moduleCommonDir + '/' + config.moduleCommonDir;
					moduleSource.js.push( mCommon );
					moduleSource.css.push( mCommon + '.css' );
					moduleSource.tpl.push( mCommon + '.tpl' );
				}
				moduleSource.js.push( mId );
				moduleSource.css.push( mId + '.css' );
				moduleSource.tpl.push( mId + '.tpl' );
			}
		},
		mergeSource : function() {
			var self = this,
				config = self.config,
				preLoad = config.preLoad,
				moduleSource = config.moduleSource,
				result = [];

			result = result.concat( preLoad.js ).concat( preLoad.css ).concat( preLoad.tpl );
			result = result.concat( moduleSource.js ).concat( moduleSource.css ).concat( moduleSource.tpl );
			return result;
		},
		renderQueue : function( index, callback ) {
			index = index || 0;
			var self = this,
				config = self.config,
				classes = self.classes,
				moduleList = config.moduleList,
				jContainer = self.jContainer,
				className, m, domClone;

			if ( self.destroyed ) {
				return;
			}

			if ( index == moduleList.length ) {
				self.events.fire('allRenderFinish');
				if ( typeof callback == 'function' ) {
					callback();
				}
				return;
			}

			m = moduleList[index];
			m.instanceId = m.instanceId || ( new Date() ).getTime();
			className = config.moduleDir
						+ m.moduleName
						+ '/' + m.tplName
						+ '/' + m.tplName;

			// 获取页面
			seajs.use( className, function( tplClass ) {
				// 这里考虑是否要对tplClass做拷贝，因为模板render过程中，开发者有
				//var cleanTplClass = $.extend( true, {}, tplClass );
				classes[m.tplName] = classes[m.tplName] || moduleClass.extend( tplClass );
				// jquery的clone是个干净的clone，需要重新装饰对象模型
				domClone = kayak.dom.get( config.projectName + '.' + m.tplName, jContainer ).clone();
				// domClone = kayak.dom.decorate( domClone );
				domClone.attr( CONFIG.INSTANCEID_ATTR , m.instanceId );
				domClone.attr( CONFIG.TEMPLATENAME_ATTR, m.tplName );
				domClone.attr( CONFIG.MODULENAME_ATTR, m.moduleName );
				jContainer.append( domClone );
				moduleList[index].instance = new classes[m.tplName]( domClone, m );
				moduleList[index].instance.kLoader = self;	// 将当前loader注入进去
				// domClone.show( kayak.jBody );
				//console.log(  moduleList );
				_fn.renderModlueInstance.apply( self, [ moduleList[index] ] );
				// 这里肯定能保证每个模块拥有唯一id的
				setTimeout( function() {
					_fn.renderQueue.apply( self, [++index, callback] );
				}, 1 );
			} );
		},
		renderModlueInstance : function( module ) {
			var events = this.events;
			//beforeShowCallbacks.fire( module );
			events.fire( 'beforeModuleRender', module );
			module.instance.render();

		}
		
	}
	
	define( 'kayak/core/moduleloader/moduleloader', function( require, exports, module ){ 
		moduleClass = require( 'kayak/core/classes/module.class' );
		eventsClass = require( 'kayak/core/events' );
		CONFIG = require( 'kayak/core/config' );
		sRequire = require;
		module.exports = function( jContainer, config ) {
			return new handle( jContainer, config );
		};
	} );
} )();