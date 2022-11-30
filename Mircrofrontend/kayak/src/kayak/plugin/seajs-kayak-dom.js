/**
 * seajs-kayak-dom | jun.li@dmall.com
 * 依赖于jquery创建DOM资源
 * dom加载必须模块化否则不能分辨是否加载过
 */
(function () {
  var global = window,
    POOL = $('<pool id="kayak-pool"></pool>'),
    handle,
    defaultConfig,
    _fn;

  defaultConfig = {
    fileType: ['.tpl']
  }

  handle = {
    init: function () {
      seajs.on('resolve', _fn.setUri);
      seajs.on('request', _fn.setRequest);
    }
  }

  _fn = {
    setUri: function (data) {
      var uri;

      if (!_fn.isFile(data.id)) {
        return;
      }
      uri = seajs.resolve(data.id, data.refUri);
      data.uri = uri.replace('.js', '');
    },

    setRequest: function (data) {
      var requestUri = data.requestUri;
      if (!_fn.isFile(requestUri)) {
        return;
      }
      // 判断外部是否需要修改tpl的URI
      if (seajs.data && seajs.data.kayak && seajs.data.kayak.getTplUri && typeof seajs.data.kayak.getTplUri == 'function') {
        var modifyUri = seajs.data.kayak.getTplUri(requestUri);
        requestUri = modifyUri ? modifyUri : requestUri;
      }

      _fn.xhr(requestUri, function (text) {
        _fn.createWrapper(data.uri, text);
        data.onRequest(); // 执行回调
      });
      data.requested = true;
    },

    isFile: function (uri) {
      var macth,
        config = defaultConfig;

      uri = uri + '';
      match = uri.match(/[^?]+(\.\w+)(?:\?|#|$)/);
      if (!match || !match[1] || config.fileType.indexOf(match[1]) == -1) {
        return false;
      }
      return true;
    },

    xhr: function (url, callback) {
      var r = global.XMLHttpRequest ?
        new global.XMLHttpRequest() :
        new global.ActiveXObject("Microsoft.XMLHTTP")

      //      r.withCredentials=true;//支持tpl请求带cookie
      r.open("GET", url, true)

      r.onreadystatechange = function () {
        if (r.readyState === 4) {
          // Support local file
          if (r.status > 399 && r.status < 600) {
            throw new Error("Could not load: " + url + ", status = " + r.status)
          } else {
            callback(r.responseText)
          }
        }
      }

      return r.send(null)
    },

    createWrapper: function (uri, content) {
      var code = [
				"define( '" + uri + "', function( require, exports, module ) {",
				"	var domString = '" + _fn.jsEscape(content) + "';",
				"	kayak.POOL.append( domString );",
				"	module.exports = domString;",
				"} );	"
			].join('\n');
      _fn.globalEval(code);
    },

    globalEval: function (content) {
      if (content && /\S/.test(content)) {
        (global.execScript || function (content) {
          (global.eval || eval).call(global, content)
        })(content)
      }
    },

    jsEscape: function (content) {
      return content.replace(/(["\\])/g, "\\$1")
        .replace(/[\f]/g, "\\f")
        .replace(/[\b]/g, "\\b")
        .replace(/[\n]/g, "\\n")
        .replace(/[\t]/g, "\\t")
        .replace(/[\r]/g, "\\r")
        .replace(/[\u2028]/g, "\\u2028")
        .replace(/[\u2029]/g, "\\u2029")
        .replace(/\'/g, "\\\'");
    }
  }


  window.kayak = window.kayak || {};
  window.kayak.POOL = POOL;
  handle.init();
})();
