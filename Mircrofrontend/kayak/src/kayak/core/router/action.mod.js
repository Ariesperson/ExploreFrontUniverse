(function () {
	var handle, _fn, sRequire, CFG;

	CFG = {
		INDEX_DIR: '/main/main'
	}

	handle = {
		init: function (router) {
			handle.router = router;
		},

		getMain: function (path, callback) { // 为了避免当前hash不能替换，必须先加载一个配置文件的main函数
			var source = (path + '').split('/')[0],
				router = this.router,
				pathObj = {};
			if (!source) { // 没有hash值时可能会出现这种情况
				if (typeof callback == 'function') {
					callback();
				}
				return;
			}

			pathObj.path = path;
			pathObj.mainPath = source + CFG.INDEX_DIR;
			router.events.fire('parseMain', pathObj); // 这里容易出现多个parse的情况，要着重考虑下
			sRequire.async(pathObj.mainPath, function() {
        if (typeof callback === 'function') {
					callback([pathObj]);
				}
      });
		},

		getActions: function (fullPath, callback) {
			var router = handle.router, // router for routerouter
				events = router.events,
				sourceList,
				actions, sources;

			actions = _fn.parseActions(fullPath);
			var a = {
				actions: actions
			};
			events.fire('preLoad', a);
			sourceList = _fn.getSources(actions);

			if(sourceList.length) {
				_fn.fixCachedModuleStatus(); // 重置修复已缓存模块的状态
			}

			sRequire.async(sourceList, function () {

				_fn.setAction(actions, arguments);

				events.fire('loadComplete', {
					actions: actions
				});
				if (typeof callback == 'function') {
					callback(actions); // 有一个没有，资源肯定没有下载完全
				}
			});
		},

		getDifferent: function (oldActions, newActions) {
			var i, len, newA, oldA;

			for (i = 0, len = newActions.length; i < len; ++i) {
				newA = newActions[i] || {};
				oldA = oldActions[i] || {};
				if (newA.path != oldA.path) {
					break;
				}
			}
			return {
				newActions: newActions.slice(i),
				oldActions: oldActions.slice(i)
			};
		},

		// 默认的路由规则
		defaultActionRule: function (data) {
			var router = handle.router,
				path = data.path,
				pathMap = router.pathMap,
				mapVal = pathMap[path];

			// 处理映射，覆盖前面action
			if (typeof mapVal == 'string' || $.isArray(mapVal)) {
				data.actionPath = mapVal
			}
			if (typeof mapVal == 'function') {
				data.actionPath = mapVal();
			}

			// 最后一个必须为action
			if (data.path == data.fullPath && !data.actionPath) {
				data.actionPath = data.fullPath;
			}
		},

    setActionOptions: function (action, options) {
      if (!action || !options) {
        return;
      }

      Object.keys(options).forEach(function (key) {
        var value = options[key];

        if (key === 'container') {
          if (action.setContainer && value) {
            action.setContainer(value);
          }
          return;
        }

        action[key] = value;
      });
    },

		exit: function (actions) {

			var router = handle.router,
				events = router.events,
				i, a;

      if (!actions.length) {
        return;
      }

      events.fire('preExit', {
        actions: actions
      });

			for (i = 0; a = actions[i]; ++i) {
				if (a.action && typeof a.action.exit == 'function') {
          if (events.fire('preEachExit', { action: a }) === false) {
            continue;
          }

          a.action.exit();

					events.fire('eachExitComplete', {
						action: a
					});
				}
			}
			events.fire('exitComplete', {
				actions: actions
			});
		},

		enter: function (actions) {
			var router = handle.router,
				events = router.events,
				i, a;

			if (!actions.length) {
				return;
			}
			events.fire('preEnter', {
				actions: actions
			});
			//以前逻辑
      for (i = 0; a = actions[i]; ++i) {
        if (a.action && typeof a.action.enter == 'function') {
          events.fire('preEachEnter', {
            action: a
          });

          this.setActionOptions(a.action, a.actionOptions);

          a.action.enter();
        }
      }
      // for ( i = 0; a = actions[ i ]; ++i ) {
      //   if (a.action && typeof a.action.enter == 'function') {
      //     events.fire( 'preEachEnter', {
      //       action: a
      //     } );
      //     //kayak 多语言
      //     translate( a, function ( a ) {
      //       a.action.enter();
      //       events.fire( 'eachEnterComplete', {
      //         action: a
      //       } );
      //     } )
      //   }
      // }
			events.fire('enterComplete', {
				actions: actions
			});
		}
	}

	_fn = {
		// 路径转化
		parseActions: function (fullPath) {
			var router = handle.router,
				events = router.events,
				i, p, pathList = [],
				currentPath, pathData,
				result = [],
				path;

      path = fullPath.split('/');

			for (i = 0; p = path[i]; ++i) {
				pathList.push(p);
        currentPath = pathList.join('/');
        pathData = {
          fullPath: fullPath,
          path: currentPath,
          actionPath: null,
          action: null,
          actionOptions: null,
          rawUrl: router.currentUrl,
        };

				// 走配置映射
				// 一旦返回false阻止后面的解析
        if (events.fire('parseActions', pathData) === false) {
          break;
        }

				handle.defaultActionRule(pathData);
				if (pathData.actionPath && typeof pathData.actionPath == 'string') {
					result.push(pathData);
				}
			}
			return result;
		},

		setAction: function (actions, result) {
			var i, len = result.length;
			for (i = 0, len = result.length; i < len; ++i) {
				if (result[i]) {
					// TODO:这里是否有必要做路径缓存？
					actions[i].action = result[i];
				}
			}
		},

		getSources: function (actions) {
			var i, a, result = [];
			for (i = 0; a = actions[i]; ++i) {
				if (a.actionPath) {
					result.push(a.actionPath);
				}
			}
			return result;
		},
	  fixCachedModuleStatus: function() {
			if(!window.seajs || !window.seajs.cache){
				return;
			}
			var cachedMods = window.seajs.cache;
			for (var key in cachedMods) {
				if (Object.hasOwnProperty.call(cachedMods, key)) {
					var mod = cachedMods[key];
					// 如果一个模块状态为 3 说明没有完成初始 需要重置为 2
					if(mod.status === 3 && mod.id) {
						mod.status = 2;
					}
				}
			}
		}
	};

	define('kayak/core/router/action.mod', function (require, exports, module) {

		sRequire = require;
		module.exports = handle;
	});
})();
