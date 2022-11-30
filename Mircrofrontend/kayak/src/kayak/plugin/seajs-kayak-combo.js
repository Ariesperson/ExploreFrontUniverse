/* kayak combo组件 */
/**
	考虑按命名处理项目路径，解决dshop问题
	css最好不需要和项目有关，??位置需要调整.
	js可以和项目有关，因为替换也只替换一次
 */
( function() {
	var handle,
		_fn,
		defaultConfig,
		URI_CASH = {},
		CFG;

	CFG = {
		defaultProjectName : 'default'
	}

	defaultConfig = {
		maxCombo : 50,		// 每条链接最大合并数量
		distDir : 'dist',
		debugDir : 'src',
		debugPrev : 'debug-',
		// kayak项目路径
		base : seajs.data.base || '',
		cellular : false,
		version : ''/*,
		debug模式示例
		projectMap : {
			address : 'http://local.dmall.com/kayak-project/'
		}
*/	}

	handle = {
		hasSetMap : false,	// 是否设置项目路径映射
		init : function() {
			// 设置映射，可能是config中的配置
			seajs.on( 'config', handle.setProjectMap );
			// 分析combo路径
			seajs.on('load', handle.setComboHash )
			// 设置请求，并进替换
			seajs.on('fetch', handle.setRequestUri )
			seajs.on('define', handle.setDefine );
		},
		setDefine : function( module ) {
			var config = _fn.getConfig();
			if ( !config.updateVersion ) {
				return;
			}
			// 默认关闭，兼容老项目
			if ( ( module.id + '' ).indexOf( 'main/main' ) < 0 ) {
				return;
			}
			var config = _fn.parseConfig( module.factory + '' );

		},
		setComboHash : function( uris ) {
			var i = 0, u, requestUri, uriObj, uriMap = {}, p;

			handle.setProjectMap();
			// 第一次遍历设置combo列表
			for ( i = 0; u = uris[i]; ++i ) {
				if ( u == 0 ) {
					continue;
				}
				uriObj = _fn.uriToObj( u );
				if ( !uriObj || URI_CASH[u] ) {
					continue;
				}
				requestUri = u.replace( uriObj.projectName + '/' + uriObj.dirName + '/' + uriObj.projectName, uriObj.projectName );
				if ( seajs.cache[requestUri] ) {
					continue;
				}
				uriMap = _fn.appendSource( uriMap, uriObj );
			}

			// 再次遍历设置链接映射
			for ( i = 0; u = uris[i]; ++i ) {
				if ( u == 0 ) {
					continue;
				}
				uriObj = _fn.uriToObj( u );
				if ( !uriObj || URI_CASH[u] ) {
					continue;
				}
				requestUri = u.replace( uriObj.projectName + '/' + uriObj.dirName + '/' + uriObj.projectName, uriObj.projectName );
				if ( seajs.cache[requestUri] ) {
					continue;
				}
				URI_CASH[u] = _fn.getCombo( uriObj, uriMap );
			}
		},
		setRequestUri : function( m ) {
			m.requestUri = URI_CASH[m.uri] || m.uri;
		},
		// 根据URL或config配置map映射
		setProjectMap : function() {
			if ( handle.hasSetMap ) {
				return;
			}
			var link = window.location.href,
				config = _fn.getConfig(),
				i, p, param, itemList, j, n;

			link = link.split( '?' )[1] || '';
			link = link.split( '#' )[0];
			link = link.split( '&' );
			if ( !link.length ) {
				return;
			}
			for ( i = 0; p = link[i]; ++i ) {
				param = p.split( '=' );
				if ( param.length != 2 || param[0].indexOf( config.debugPrev ) != 0 ) {
					continue;
				}
				config.projectMap = config.projectMap || {};
				itemList = param[0].replace( config.debugPrev, '' ).split( '-' );

				// 调试地址是dmall才进行调试
				var link = decodeURIComponent(param[1]);
				if ( _fn.isDmallLoction( link ) ) {
					for ( j = 0; n = itemList[j]; ++j ) {
						config.projectMap[n] = {
							base : link,
							dir : config.debugDir || 'src'
						};
					}
				}
			}
			handle.hasSetMap = true;
		}
	};

	_fn = {
		config : function( config ) {
			if ( !config ) {
				return handle.config;
			}
			handle.options = _fn.mix( defaultConfig, config );
		},
		uriToObj : function( uri ) {
			var config = _fn.getConfig(), result = {},
				base = config.base, reg, match, projectMap = config.projectMap || {},
				projectMapObj;


			base = base[base.length - 1] == '/' ? base : base + '/';
			reg = new RegExp( base + '([^\/]*)\/' );
			match = uri.match( reg );
			if ( !match || !match[0] || !match[1] || !match.input ) {
				return null;
			}

			projectMapObj = projectMap[match[1]];
			if ( typeof projectMapObj == 'string' ) {
				projectMapObj = {
					base : projectMapObj,
					dir : 'dist'
				};
			}
			if ( projectMapObj ) {
				projectMapObj.dir = projectMapObj.dir || config.distDir;
			}

			// 调试模式
			if ( projectMapObj ) {
				result.base = projectMapObj.base;
				result.fileGroup = match[1];
				result.file = match[1] + '/' + projectMapObj.dir + '/' + match[1] + '/' + match.input.replace( match[0], '' );
				result.projectName = match[1];
				result.dirName = config.debugDir;
				result.originUri = uri;
			// 发布模式
			} else {
				result.base = base;
				//result.fileGroup = CFG.defaultProjectName;
				result.fileGroup = config.cellular ? match[1] : CFG.defaultProjectName; // 修改为按项目划分
				result.file = match[1] + '/' + config.distDir + '/' + match[1] + '/' + match.input.replace( match[0], '' );
				result.projectName = match[1];
				result.dirName = config.distDir;
				result.originUri = uri;
			}
			return result;
		},

		getCombo : function( uriObj, uriMap ) {
			//_fn.mergeProject(); 这个代码貌似可以不用了
			var config = _fn.getConfig(),
				maxCombo = config.maxCombo,
				fileGroup, fileType, list, index,
				start, sourceList, base, result = '', version = config.version;

			// 将多个请求赋值在这里，可以实现combo上限拆分
			if ( !uriObj ) {
				return;
			}

			fileGroup = uriObj.fileGroup;
			fileType = _fn.getFileType( uriObj.file );
			list = uriMap[fileGroup] || uriMap[CFG.defaultProjectName] || {};
			list = list[fileType];
			index = list.indexOf( uriObj.file );
			start = Math.floor( index / maxCombo );
			sourceList = list.slice( start * maxCombo, ( start + 1 ) * maxCombo );
			// css按项目合并，保证图片相对路径
			result = sourceList.join( ',' );

			if ( ( config.cache && config.cache.main === false ) && result.indexOf( '/main/main.js' ) > 0 ) {
				version = new Date().getTime();

        //add by xiaoying.yang：添加 getMainUri配置支持用户在main.js链接上添加自定义参数
        if (config.getMainUri && typeof config.getMainUri == 'function') {
          result = config.getMainUri(result);
        }
			}

			var host=window.location.host.split('.')[0];
			if ( version ) {
        var $resultList=result.split(',');

				result += $resultList[$resultList.length-1].indexOf( '?' ) > 0 ? '&' : '?';
				result += 't=' + host + version.toString().replace(host,'');
			}

			// TODO:这里可以考虑按字段长度进行二次拆分

			result = uriMap[fileGroup].base + '??' + result;
			return result;
		},

		appendSource : function( map, uriObj ) {
			if ( !uriObj ) {
				return;
			}
			var fileType = _fn.getFileType( uriObj.file ),
				fileGroup = uriObj.fileGroup,
				file = uriObj.file,
				config = _fn.getConfig();

			map[fileGroup] = map[fileGroup] || {};
			map[fileGroup].base = map[fileGroup].base || uriObj.base;
			// debug模式替换，在getUrlObj时已经做了
			if ( map[fileGroup].base[map[fileGroup].base.length -1 ] != '/' ) {
				map[fileGroup].base += '/';
			}
			map[fileGroup][fileType] = map[fileGroup][fileType] || [];
			if ( map[fileGroup][fileType].indexOf( uriObj.file ) == -1 ) {
				map[fileGroup][fileType].push( file );
			}
			return map;
		},

		getFileType : function( file ) {
			var type = file.split( '/' );
			type = type.pop();
			type = type.split( '.' );
			return type.pop();
		},

		getConfig : function() {
			var data;

			data = seajs || {};
			data = seajs.data || {};
			handle.config = handle.config ? _fn.mix( handle.config, data.kayak ) : _fn.mix( defaultConfig, data.kayak );
			//handle.config = _fn.mix( defaultConfig, data.kayak );
			return handle.config;
		},

		parseConfig : function( factoryStr ) {
			var res = [],
  				commentRegExp = /(\/\*([\s\S]*?)\*\/|([^:]|^)\/\/(.*)$)/mg,
      			cjsRequireRegExp = /[^.]\s*kayak-version\s*\s*([^'"\s]+)\s*/g,
      			jsSuffixRegExp = /\.js$/,
      			newVersion;


  			factoryStr.replace(commentRegExp, '').replace(cjsRequireRegExp, function (match, dep) {
  				res.push(dep);
  			});

  			var version = res.pop() || 0; // 项目version
  			var lastVersion= handle.config.version.toString(); // 上次请求的version
  			lastVersion = lastVersion.split( '-' )[0];
        	var host = window.location.host.split('.')[0];
        	var kayakVersion = (seajs.data.kayak.version.toString()||'').replace(host,''); // 最后结果的version
        	kayakVersion = kayakVersion.split( '-' );
        	kayakVersion = kayakVersion.length == 1 ? kayakVersion[0] : kayakVersion[1];
        	var nowVersion='';
        	lastVersion = lastVersion.replace(host, '');
  			if ( version == 'time' ) {
          		nowVersion = new Date().getTime();
  				//handle.config.version = new Date().getTime();
        	} else if (version * 1 >= lastVersion * 1) {
          		nowVersion = version * 1 + '-' + kayakVersion * 1;
  				//handle.config.version = version;
  			} else {
  				nowVersion = lastVersion * 1 + '-' + kayakVersion * 1;
  			}
        	nowVersion = host + nowVersion.toString();
        	seajs.data.kayak.version = nowVersion;

  			//return res;
		},

		isDmallLoction : function( link ){
			var dmallDomain = '.dmall.com';
			link = link + '';
			link = link.split( '//' )[1] + '';
			link = link.split( '/' )[0];
			link = link.split( ':' );

			if ( link[0]
          && ( ( link[0] + '' ).indexOf( dmallDomain ) > 0
          ||  ( link[0] + '' ).indexOf( 'localhost' ) >= 0 )
          && ( !link[1] || [80,443,3000,40100,40101,40102,40103,40104,40105].indexOf(link[1] * 1)>=0 ) ) {
				return true;
			} else {
				console.log( 1 );
				return false;
			}
		},

		mix : function( r, s ) {
			s = s || {};
			var p;
			for ( p in s ) {
				r[p] = s[p]
			}
			return r;
		}
	}

	window.kayak = window.kayak || {};
	window.kayak.config = _fn.config;
	//window.kayak.setVersion = function() {};

	if ( seajs ) {
		handle.init();
	}
} )();
