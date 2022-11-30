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
		URI_MAP = {},
		URI_CASH = {},
		CFG;

	CFG = {
		defaultProjectName : 'default'
	}

	defaultConfig = {
		maxCombo : 30,		// 每条链接最大合并数量
		distDir : 'dist',
		debugDir : 'src',
		debugPrev : 'debug-',
		version : '',
	}

	handle = {
		init : function() {
			seajs.on('config', _fn.setProjectMap );
			seajs.on('load', _fn.setComboHash )
			seajs.on('fetch', _fn.setRequestUri )
		}
	}

	_fn = {
		// 设置commbo事件
		setComboHash : function( uris ) {
			var i = 0, config = _fn.getConfig(),
				u, map = {}, uriObj, key, fileGroup,
				cacheUri, requestUri;

			// 这里需要判断uri是否在获取
			if ( !uris || uris.length == 0 ) {
				return;
			}
			// 每次分析后进行清空，对已分析的uri进行去重
			URI_MAP = {};
			_fn.setProjectMap();
			for ( i = 0; u = uris[i]; ++i ) {
				if ( u == 0 ) {
					return;
				}
				uriObj = _fn.getUriObj( u );
				if ( !uriObj || URI_CASH[u] ) {
					continue;
				}
				// 如果缓存中有则不加载，不放置到commbo链接中
				requestUri = u.replace( uriObj.projectName + '/' + uriObj.dirName + '/' + uriObj.projectName, uriObj.projectName );
				if ( seajs.cache[requestUri] ) {
					continue;
				}
				_fn.appendSource( uriObj );
			}
			console.log( URI_MAP );
		},

		// 设置请求链接
		setRequestUri : function( m ) {
			//_fn.mergeProject(); 这个代码貌似可以不用了
			var uriObj = _fn.getUriObj( m.uri ),
				config = _fn.getConfig(),
				maxCombo = config.maxCombo,
				fileGroup, fileType, list, index,
				start, sourceList, base;

			// 将多个请求赋值在这里，可以实现combo上限拆分
			if ( !uriObj ) {
				return;
			}

			//console.log(m);
			fileGroup = uriObj.fileGroup;
			fileType = _fn.getFileType( uriObj.file );
			list = URI_MAP[fileGroup] || URI_MAP[CFG.defaultProjectName] || {};
			list = list[fileType];
			index = list.indexOf( uriObj.file );
			start = Math.floor( index / maxCombo );
			sourceList = list.slice( start * maxCombo, ( start + 1 ) * maxCombo );
			// css按项目合并，保证图片相对路径
			m.requestUri = URI_MAP[fileGroup].base + '??' + ( sourceList.join( ',' ) || m.uri );
			m.requestUri = config.version ? m.requestUri + '?t=' + config.version : m.requestUri;
			//console.log( m.requestUri );
			URI_CASH[m.uri] = m.requestUri;
		},

		// 这两个方法要考虑性能问题，这个是老方法要考虑的问题
		mergeProject : function( ) {
			if ( URI_MAP.isMerged ) { return; }
			var p, base = seajs.data.base,
				projectKeys = [];

			// 找出需要处理的项目
			for ( p in URI_MAP ) {
				if ( URI_MAP[p] && URI_MAP[p].base && URI_MAP[p].base.indexOf( base ) == 0 ) {
					projectKeys.push( p );
				}
			}
			// 有多个项目才进行处理
			//if ( projectKeys.length > 1 ) {
			//	_fn.mergeSource( projectKeys );
			//}
			URI_MAP.isMerged = true;
		},

		// 这两个方法要考虑性能问题
		mergeSource : function( projectKeys ) {
			var i, p, project, alljs = [], allcss = [], alltpl = [];

			for ( i = 0; p = projectKeys[i]; ++i ) {
				project = URI_MAP[p];
				if ( project.js && project.js.length ) {
					alljs = alljs.concat( ( projectKeys + '/' + ( project.js.join( ',' + projectKeys + '/' ) ) ).split( ',' ) );
				}
			}
			//console.log( alljs );
		},

		// 设置调试模式映射规则
		setProjectMap : function() {
			if ( handle.hasSetMap ) {
				return;
			}
			console.log( '设置映射' );
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
				if ( _fn.isDmallLoction( param[1] ) ) {
					for ( j = 0; n = itemList[j]; ++j ) {
						config.projectMap[n] = param[1];
					}
				}
			}
			handle.hasSetMap = true;
		},

		isDmallLoction : function( link ){
			var dmallDomain = '.dmall.com';
			link = link + '';
			link = link.split( '//' )[1] + '';
			link = link.split( '/' )[0];
			return ( link.length - dmallDomain.length ) == link.lastIndexOf( dmallDomain );
		},

		appendSource : function( uriObj ) {
			if ( !uriObj ) {
				return;
			}
			var fileType = _fn.getFileType( uriObj.file ),
				fileGroup = uriObj.fileGroup,
				file = uriObj.file,
				config = _fn.getConfig();

			URI_MAP[fileGroup] = URI_MAP[fileGroup] || {};
			URI_MAP[fileGroup].base = URI_MAP[fileGroup].base || uriObj.base;
			// debug模式替换，在getUrlObj时已经做了
/*			if ( config.projectMap && config.projectMap[fileGroup] ) {
				URI_MAP[fileGroup].base = URI_MAP[fileGroup].base || config.projectMap[fileGroup];
			} else if ( fileGroup == CFG.defaultProjectName ) {
				URI_MAP[fileGroup].base = uriObj.base;
			} else {
				URI_MAP[fileGroup].base = seajs.data.base + fileGroup + '/' + config.distDir + '/';
			}*/
			if ( URI_MAP[fileGroup].base[URI_MAP[fileGroup].base.length -1 ] != '/' ) {
				URI_MAP[fileGroup].base += '/';
			}
			URI_MAP[fileGroup][fileType] = URI_MAP[fileGroup][fileType] || [];
			if ( URI_MAP[fileGroup][fileType].indexOf( uriObj.file ) == -1 ) {
				URI_MAP[fileGroup][fileType].push( file );
			}
		},

		getFileType : function( file ) {
			var type = file.split( '/' );
			type = type.pop();
			type = type.split( '.' );
			return type.pop();
		},

		getUriObj : function( uri ) {
			var result = {},
				base = seajs.data.base,
				config = _fn.getConfig(),
				match,
				reg;

			base = base[base.length - 1] == '/' ? base : base + '/';
			reg = new RegExp( base + '([^\/]*)\/' );
			match = uri.match( reg );
			if ( !match || !match[0] || !match[1] || !match.input ) {
				return null;
			}
			// 如果有调试模式按调试模式来
			if ( config.projectMap && config.projectMap[match[1]] ) {
				result.base = config.projectMap[match[1]];
				result.fileGroup = match[1];
				result.file = match[1] + '/' + config.debugDir + '/' + match[1] + '/' + match.input.replace( match[0], '' );
				result.projectName = match[1];
				result.dirName = config.debugDir;
			// 按最大路径定位，合并最大请求
			} else if ( base.indexOf( seajs.data.base ) == 0 ) {
				result.base = seajs.data.base;
				result.fileGroup = CFG.defaultProjectName;
				result.file = match[1] + '/' + config.distDir + '/' + match[1] + '/' + match.input.replace( match[0], '' );
				result.projectName = match[1];
				result.dirName = config.distDir;
			// 其余按项目替换路径处理，这里会有相对路径bug问题
			} else {
				result.base = base;
				result.fileGroup = match[1];
				result.file = match[1] + '/' + config.distDir + '/' + match[1] + '/' + match.input.replace( match[0], '' );
				result.projectName = match[1];
				result.dirName = config.distDir;
			}
			return result;
		},

		getConfig : function() {
			var data;

			data = seajs || {};
			data = seajs.data || {};
			handle.config = handle.config || _fn.mix( defaultConfig, data.kayak );
			return handle.config;
		},

		// 简单拷贝
		mix : function( r, s ) {
			s = s || {};
			var p;
			for ( p in s ) {
				r[p] = s[p]
			}
			return r;
		}
	}	

	if ( seajs ) {
		handle.init();
	}
} )();