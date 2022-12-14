define('kayak/common/di18n/di18n', function (require, exports, module) {
  var factory = function () {
    return /******/ (function (modules) { // webpackBootstrap
      /******/ 	// The module cache
      /******/
      var installedModules = {};

      /******/ 	// The require function
      /******/
      function __webpack_require__(moduleId) {

        /******/ 		// Check if module is in cache
        /******/
        if (installedModules[moduleId])
        /******/      return installedModules[moduleId].exports;

        /******/ 		// Create a new module (and put it into the cache)
        /******/
        var module = installedModules[moduleId] = {
          /******/      exports: {},
          /******/      id: moduleId,
          /******/      loaded: false
          /******/
        };

        /******/ 		// Execute the module function
        /******/
        modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

        /******/ 		// Flag the module as loaded
        /******/
        module.loaded = true;

        /******/ 		// Return the exports of the module
        /******/
        return module.exports;
        /******/
      }


      /******/ 	// expose the modules object (__webpack_modules__)
      /******/
      __webpack_require__.m = modules;

      /******/ 	// expose the module cache
      /******/
      __webpack_require__.c = installedModules;

      /******/ 	// __webpack_public_path__
      /******/
      __webpack_require__.p = "";

      /******/ 	// Load entry module and return exports
      /******/
      return __webpack_require__(0);
      /******/
    })
    /************************************************************************/
    /******/([
      /* 0 */
      /***/ (function (module, exports, __webpack_require__) {

        'use strict';

        var _di18n = __webpack_require__(1);

        _di18n.DI18n.Version = ("0.0.7");

        module.exports = _di18n.DI18n;

        /***/
      }),
      /* 1 */
      /***/ (function (module, exports, __webpack_require__) {

        'use strict';

        Object.defineProperty(exports, "__esModule", {
          value: true
        });
        exports.DI18n = undefined;

        var _createClass = function () {
          function defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
              var descriptor = props[i];
              descriptor.enumerable = descriptor.enumerable || false;
              descriptor.configurable = true;
              if ("value" in descriptor) descriptor.writable = true;
              Object.defineProperty(target, descriptor.key, descriptor);
            }
          }

          return function (Constructor, protoProps, staticProps) {
            if (protoProps) defineProperties(Constructor.prototype, protoProps);
            if (staticProps) defineProperties(Constructor, staticProps);
            return Constructor;
          };
        }();

        var _translate = __webpack_require__(2);

        var _translate2 = _interopRequireDefault(_translate);

        var _util = __webpack_require__(3);

        function _interopRequireDefault(obj) {
          return obj && obj.__esModule ? obj : {default: obj};
        }

        function _classCallCheck(instance, Constructor) {
          if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
          }
        }

        function _possibleConstructorReturn(self, call) {
          if (!self) {
            throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
          }
          return call && (typeof call === "object" || typeof call === "function") ? call : self;
        }

        function _inherits(subClass, superClass) {
          if (typeof superClass !== "function" && superClass !== null) {
            throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
          }
          subClass.prototype = Object.create(superClass && superClass.prototype, {
            constructor: {
              value: subClass,
              enumerable: false,
              writable: true,
              configurable: true
            }
          });
          if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
        }

        var CLASS_ATTRIBUTE = 'i18n-class';
        var IMG_ATTRIBUTE = 'i18n-img';
        var CONTENT_ATTRIBUTE = 'i18n-content';
        var PLACEHOLDER_ATTRIBUTE = 'i18n-placeholder';
        var LOCALE_PATTERN = /\$\{locale}/g;
        var noop = function noop() {
        };

        var DI18n = exports.DI18n = function (_T) {
          _inherits(DI18n, _T);

          function DI18n() {
            var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

            _classCallCheck(this, DI18n);

            var _this = _possibleConstructorReturn(this, (DI18n.__proto__ || Object.getPrototypeOf(DI18n)).call(this, options));

            _this.locale = options.locale || 'en';
            _this.messages = options.messages || {};
            _this.isReplace = options.isReplace || false;
            _this.currMessage = _this.messages[_this.locale];
            _this.doms = {};

            if (_this.isReplace) {
              _this.getDoms();

              _this.fresh();
            }
            return _this;
          }

          _createClass(DI18n, [{
            key: 'getDoms',
            value: function getDoms() {
              this.doms = {
                classDoms: document.querySelectorAll('[' + CLASS_ATTRIBUTE + ']'),
                imgDoms: document.querySelectorAll('[' + IMG_ATTRIBUTE + ']'),
                contentDoms: document.querySelectorAll('[' + CONTENT_ATTRIBUTE + ']'),
                inputDoms: document.querySelectorAll('[' + PLACEHOLDER_ATTRIBUTE + ']')
              };
            }
          }, {
            key: 'handlerClass',
            value: function handlerClass() {
              debugger
              if (this.doms.classDoms && this.doms.classDoms.length) {
                for (var i = 0; i < this.doms.classDoms.length; i++) {
                  var dom = this.doms.classDoms[i];
                  (0, _util.addClass)(dom, dom.getAttribute(CLASS_ATTRIBUTE));
                }
              }
            }
          }, {
            key: 'handlerImg',
            value: function handlerImg() {
              if (this.doms.imgDoms && this.doms.imgDoms.length) {
                for (var i = 0; i < this.doms.imgDoms.length; i++) {
                  var dom = this.doms.imgDoms[i];
                  var src = dom.getAttribute(IMG_ATTRIBUTE).replace(LOCALE_PATTERN, this.locale);
                  dom.src = src;
                }
              }
            }
          }, {
            key: 'handlerContent',
            value: function handlerContent() {
              if (this.doms.contentDoms && this.doms.contentDoms.length) {
                for (var i = 0; i < this.doms.contentDoms.length; i++) {
                  var dom = this.doms.contentDoms[i];
                  var content = dom.getAttribute(CONTENT_ATTRIBUTE);
                  console.log(content);
                  dom.innerHTML = this.messages[this.locale][content];
                }
              }
            }
          }, {
            key: 'handlerInput',
            value: function handlerInput() {
              if (this.doms.inputDoms && this.doms.inputDoms.length) {
                for (var i = 0; i < this.doms.inputDoms.length; i++) {
                  var dom = this.doms.inputDoms[i];
                  var placeHolderKey = dom.getAttribute(PLACEHOLDER_ATTRIBUTE);
                  dom.setAttribute('placeholder', this.currMessage[placeHolderKey]);
                }
              }
            }
          }, {
            key: 'fresh',
            value: function fresh() {
              this.handlerClass();
              this.handlerImg();
              this.handlerContent();
              this.handlerInput();
            }
          }, {
            key: 'setLocale',
            value: function setLocale(locale) {
              var cb = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : noop;

              this.locale = locale;
              this.currMessage = this.messages[this.locale];
              this.fresh();
              cb();
            }
          }, {
            key: 'loadJs',
            value: function loadJs(src, cb) {
              var script = document.createElement('script');
              script.src = src;

              script.onload = script.onreadystatechange = function () {
                if (script.readyState === 'loaded' || script.readyState === 'complete') {
                  cb && cb();
                }
              };

              document.getElementsByTagName[head][0].appendChild(script);
            }
          }, {
            key: 'setMessages',
            value: function setMessages(obj) {
              this.messages = obj;
            }
          }]);

          return DI18n;
        }(_translate2.default);

        /***/
      }),
      /* 2 */
      /***/ (function (module, exports, __webpack_require__) {

        'use strict';

        Object.defineProperty(exports, "__esModule", {
          value: true
        });

        var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
          return typeof obj;
        } : function (obj) {
          return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
        };

        var _createClass = function () {
          function defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
              var descriptor = props[i];
              descriptor.enumerable = descriptor.enumerable || false;
              descriptor.configurable = true;
              if ("value" in descriptor) descriptor.writable = true;
              Object.defineProperty(target, descriptor.key, descriptor);
            }
          }

          return function (Constructor, protoProps, staticProps) {
            if (protoProps) defineProperties(Constructor.prototype, protoProps);
            if (staticProps) defineProperties(Constructor, staticProps);
            return Constructor;
          };
        }();

        var _util = __webpack_require__(3);

        function _classCallCheck(instance, Constructor) {
          if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
          }
        }

        var T = function () {
          function T(options) {
            _classCallCheck(this, T);

            this.locale = options.locale || 'zh_CN';
            this.messages = options.messages || {};
          }

          _createClass(T, [{
            key: '$t',
            value: function $t(key) {
              for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                args[_key - 1] = arguments[_key];
              }

              var str = (0, _util.getValueByPath)(this.messages[this.locale], key);

              if (args.length === 1 && _typeof(args[0]) === 'object') {
                args = args[0];
              } else {
                args = {};
              }

              if (!args || !args.hasOwnProperty) {
                args = {};
              }

              var RE_NARGS = /(%|)\{([0-9a-zA-Z_]+)\}/g;
              return str.replace(RE_NARGS, function (match, prefix, i, index) {
                var result = '';
                if (str[index - 1] === '{' && str[index + match.length] === '}') {
                  return i;
                } else {
                  result = args.hasOwnProperty(i) ? args[i] : match;
                  if (!result) {
                    return '';
                  }

                  return result;
                }
              });
            }
          }, {
            key: '$html',
            value: function $html(content) {
              var _this = this;

              content = String(content);
              var RE_NARGS = /\$\{locale\}|\$t\(['"]([\s\S]+?)['"]\)/g;
              return content.replace(RE_NARGS, function (match, prefix, i, index) {
                if (match === '${locale}') {
                  return _this.locale;
                } else {
                  return (0, _util.getValueByPath)(_this.messages[_this.locale], prefix) || prefix;
                }
              });
            }
          }]);

          return T;
        }();

        exports.default = T;

        /***/
      }),
      /* 3 */
      /***/ (function (module, exports) {

        'use strict';

        Object.defineProperty(exports, "__esModule", {
          value: true
        });
        exports.hasClass = hasClass;
        exports.addClass = addClass;
        exports.removeClass = removeClass;
        exports.getValueByPath = getValueByPath;

        function hasClass(ele, cls) {
          return new RegExp(cls).test(ele.className || '');
        }

        function addClass(ele, cls) {
          var _pattern = new RegExp(cls);
          if (!_pattern.test(ele.className)) ele.className += ' ' + cls;
          return ele;
        }

        function removeClass(ele, cls) {
          if (!ele || ele.nodeType !== 1) return;
          var _pattern = new RegExp(cls);
          if (_pattern.test(ele.className || '')) ele.className = ele.className.replace(_pattern, '');
          return ele;
        }

        function getValueByPath(obj, path) {
          var tempObj = obj;
          path = path.replace(/\[(\w+)\]/g, '.$1');
          path = path.replace(/^\./, '');

          var keyArr = path.split('.');
          var i = 0;
          var flag = true;
          for (var len = keyArr.length; i < len - 1; ++i) {
            var key = keyArr[i];
            if (key in tempObj) {
              tempObj = tempObj[key];
            } else {
              flag = false;
            }
          }
          if (flag) {
            return tempObj[keyArr[i]];
          } else {
            return undefined;
          }
        }

        /***/
      })
      /******/])
  };
  module.exports = factory();
});
