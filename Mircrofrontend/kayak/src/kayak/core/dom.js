(function () {
  var POOL = kayak.POOL,
    handle, _fn, CFG, CACHE = {},
    translate;

  CFG = {
    POOL_ID: 'kayak-pool'
  }

  handle = {
    get: function (classSelector, jCont, a) {
      if (!classSelector || $.trim(classSelector) == '') {
        return;
      }
      classSelector = _fn.formatClass(classSelector);
      if (CACHE[classSelector]&&!a) {
        return CACHE[classSelector];
      }
      if (CACHE[classSelector]&&a) {
        return new Promise(function(res){
          res()
        }).then(function(res){
          return CACHE[classSelector];
        })
      }
      // 异步翻译
      if (a) {
        //todo:给jq添加$$d方法，在translate之后
        return translate(a).then(function (res) {
          var jDom = POOL.children(classSelector);
          if (!jDom[0] && jCont && jCont[0]) {
            jDom = jDom[0] ? jDom : jCont.children(classSelector);
          }
          CACHE[classSelector] = handle.decorate(jDom, {
            jCont: jCont
          });
          return CACHE[classSelector];
        });
      } else {
        var jDom = POOL.children(classSelector);
        if (!jDom[0] && jCont && jCont[0]) {
          jDom = jDom[0] ? jDom : jCont.children(classSelector);
        }
        CACHE[classSelector] = handle.decorate(jDom, {
          jCont: jCont
        });
        return CACHE[classSelector];
      }
    },
    decorate: function (jDom, config) {
      jDom.kInsert = _fn.show;
      jDom.kRemove = _fn.hide;
      jDom.kData = $.extend({}, config);
      return jDom;
    }
  }

  _fn = {
    show: function (jCont) {
      var kData = this.kData;

      jCont = jCont || kData.jCont;
      if (!jCont || !jCont[0]) {
        return;
      }
      this.appendTo(jCont);
    },

    hide: function () {
      this.appendTo(POOL);
    },

    formatClass: function (classSelector) {
      return classSelector.charAt(0) == '.' ? classSelector : '.' + classSelector;
    }
  }

  define('kayak/core/dom', function (require, exports, module) {
    translate = kayak.getLocaleFile
    module.exports = handle;
  });
})();
