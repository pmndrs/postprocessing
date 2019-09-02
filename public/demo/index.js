(function (three) {
  'use strict';

  var three__default = 'default' in three ? three['default'] : three;

  function _typeof(obj) {
    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function");
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        writable: true,
        configurable: true
      }
    });
    if (superClass) _setPrototypeOf(subClass, superClass);
  }

  function _getPrototypeOf(o) {
    _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
      return o.__proto__ || Object.getPrototypeOf(o);
    };
    return _getPrototypeOf(o);
  }

  function _setPrototypeOf(o, p) {
    _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
      o.__proto__ = p;
      return o;
    };

    return _setPrototypeOf(o, p);
  }

  function isNativeReflectConstruct() {
    if (typeof Reflect === "undefined" || !Reflect.construct) return false;
    if (Reflect.construct.sham) return false;
    if (typeof Proxy === "function") return true;

    try {
      Date.prototype.toString.call(Reflect.construct(Date, [], function () {}));
      return true;
    } catch (e) {
      return false;
    }
  }

  function _construct(Parent, args, Class) {
    if (isNativeReflectConstruct()) {
      _construct = Reflect.construct;
    } else {
      _construct = function _construct(Parent, args, Class) {
        var a = [null];
        a.push.apply(a, args);
        var Constructor = Function.bind.apply(Parent, a);
        var instance = new Constructor();
        if (Class) _setPrototypeOf(instance, Class.prototype);
        return instance;
      };
    }

    return _construct.apply(null, arguments);
  }

  function _assertThisInitialized(self) {
    if (self === void 0) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return self;
  }

  function _possibleConstructorReturn(self, call) {
    if (call && (typeof call === "object" || typeof call === "function")) {
      return call;
    }

    return _assertThisInitialized(self);
  }

  function _superPropBase(object, property) {
    while (!Object.prototype.hasOwnProperty.call(object, property)) {
      object = _getPrototypeOf(object);
      if (object === null) break;
    }

    return object;
  }

  function _get(target, property, receiver) {
    if (typeof Reflect !== "undefined" && Reflect.get) {
      _get = Reflect.get;
    } else {
      _get = function _get(target, property, receiver) {
        var base = _superPropBase(target, property);

        if (!base) return;
        var desc = Object.getOwnPropertyDescriptor(base, property);

        if (desc.get) {
          return desc.get.call(receiver);
        }

        return desc.value;
      };
    }

    return _get(target, property, receiver || target);
  }

  function _toConsumableArray(arr) {
    return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread();
  }

  function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) {
      for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

      return arr2;
    }
  }

  function _iterableToArray(iter) {
    if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter);
  }

  function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance");
  }

  var Demo = function () {
    function Demo() {
      var id = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "demo";

      _classCallCheck(this, Demo);

      this.id = id;
      this.renderer = null;
      this.loadingManager = new three.LoadingManager();
      this.assets = new Map();
      this.scene = new three.Scene();
      this.camera = null;
      this.controls = null;
      this.ready = false;
    }

    _createClass(Demo, [{
      key: "setRenderer",
      value: function setRenderer(renderer) {
        this.renderer = renderer;
        return this;
      }
    }, {
      key: "load",
      value: function load() {
        return Promise.resolve();
      }
    }, {
      key: "initialize",
      value: function initialize() {}
    }, {
      key: "render",
      value: function render(delta) {
        this.renderer.render(this.scene, this.camera);
      }
    }, {
      key: "registerOptions",
      value: function registerOptions(menu) {}
    }, {
      key: "reset",
      value: function reset() {
        var fog = this.scene.fog;
        this.scene = new three.Scene();
        this.scene.fog = fog;
        this.camera = null;

        if (this.controls !== null) {
          this.controls.dispose();
          this.controls = null;
        }

        this.ready = false;
        return this;
      }
    }]);

    return Demo;
  }();

  var Event = function Event(type) {
    _classCallCheck(this, Event);

    this.type = type;
    this.target = null;
  };

  var EventTarget = function () {
    function EventTarget() {
      _classCallCheck(this, EventTarget);

      this.listenerFunctions = new Map();
      this.listenerObjects = new Map();
    }

    _createClass(EventTarget, [{
      key: "addEventListener",
      value: function addEventListener(type, listener) {
        var m = typeof listener === "function" ? this.listenerFunctions : this.listenerObjects;

        if (m.has(type)) {
          m.get(type).add(listener);
        } else {
          m.set(type, new Set([listener]));
        }
      }
    }, {
      key: "removeEventListener",
      value: function removeEventListener(type, listener) {
        var m = typeof listener === "function" ? this.listenerFunctions : this.listenerObjects;

        if (m.has(type)) {
          var listeners = m.get(type);
          listeners["delete"](listener);

          if (listeners.size === 0) {
            m["delete"](type);
          }
        }
      }
    }, {
      key: "dispatchEvent",
      value: function dispatchEvent(event) {
        var target = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this;
        var listenerFunctions = target.listenerFunctions;
        var listenerObjects = target.listenerObjects;
        var listeners, listener;
        event.target = target;

        if (listenerFunctions.has(event.type)) {
          listeners = listenerFunctions.get(event.type);
          var _iteratorNormalCompletion = true;
          var _didIteratorError = false;
          var _iteratorError = undefined;

          try {
            for (var _iterator = listeners[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              listener = _step.value;
              listener.call(target, event);
            }
          } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion && _iterator["return"] != null) {
                _iterator["return"]();
              }
            } finally {
              if (_didIteratorError) {
                throw _iteratorError;
              }
            }
          }
        }

        if (listenerObjects.has(event.type)) {
          listeners = listenerObjects.get(event.type);
          var _iteratorNormalCompletion2 = true;
          var _didIteratorError2 = false;
          var _iteratorError2 = undefined;

          try {
            for (var _iterator2 = listeners[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
              listener = _step2.value;
              listener.handleEvent(event);
            }
          } catch (err) {
            _didIteratorError2 = true;
            _iteratorError2 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion2 && _iterator2["return"] != null) {
                _iterator2["return"]();
              }
            } finally {
              if (_didIteratorError2) {
                throw _iteratorError2;
              }
            }
          }
        }
      }
    }]);

    return EventTarget;
  }();

  function ___$insertStyle(css) {
    if (!css) {
      return;
    }

    if (typeof window === 'undefined') {
      return;
    }

    var style = document.createElement('style');
    style.setAttribute('type', 'text/css');
    style.innerHTML = css;
    document.head.appendChild(style);
    return css;
  }

  function colorToString(color, forceCSSHex) {
    var colorFormat = color.__state.conversionName.toString();

    var r = Math.round(color.r);
    var g = Math.round(color.g);
    var b = Math.round(color.b);
    var a = color.a;
    var h = Math.round(color.h);
    var s = color.s.toFixed(1);
    var v = color.v.toFixed(1);

    if (forceCSSHex || colorFormat === 'THREE_CHAR_HEX' || colorFormat === 'SIX_CHAR_HEX') {
      var str = color.hex.toString(16);

      while (str.length < 6) {
        str = '0' + str;
      }

      return '#' + str;
    } else if (colorFormat === 'CSS_RGB') {
      return 'rgb(' + r + ',' + g + ',' + b + ')';
    } else if (colorFormat === 'CSS_RGBA') {
      return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
    } else if (colorFormat === 'HEX') {
      return '0x' + color.hex.toString(16);
    } else if (colorFormat === 'RGB_ARRAY') {
      return '[' + r + ',' + g + ',' + b + ']';
    } else if (colorFormat === 'RGBA_ARRAY') {
      return '[' + r + ',' + g + ',' + b + ',' + a + ']';
    } else if (colorFormat === 'RGB_OBJ') {
      return '{r:' + r + ',g:' + g + ',b:' + b + '}';
    } else if (colorFormat === 'RGBA_OBJ') {
      return '{r:' + r + ',g:' + g + ',b:' + b + ',a:' + a + '}';
    } else if (colorFormat === 'HSV_OBJ') {
      return '{h:' + h + ',s:' + s + ',v:' + v + '}';
    } else if (colorFormat === 'HSVA_OBJ') {
      return '{h:' + h + ',s:' + s + ',v:' + v + ',a:' + a + '}';
    }

    return 'unknown format';
  }

  var ARR_EACH = Array.prototype.forEach;
  var ARR_SLICE = Array.prototype.slice;
  var Common = {
    BREAK: {},
    extend: function extend(target) {
      this.each(ARR_SLICE.call(arguments, 1), function (obj) {
        var keys = this.isObject(obj) ? Object.keys(obj) : [];
        keys.forEach(function (key) {
          if (!this.isUndefined(obj[key])) {
            target[key] = obj[key];
          }
        }.bind(this));
      }, this);
      return target;
    },
    defaults: function defaults(target) {
      this.each(ARR_SLICE.call(arguments, 1), function (obj) {
        var keys = this.isObject(obj) ? Object.keys(obj) : [];
        keys.forEach(function (key) {
          if (this.isUndefined(target[key])) {
            target[key] = obj[key];
          }
        }.bind(this));
      }, this);
      return target;
    },
    compose: function compose() {
      var toCall = ARR_SLICE.call(arguments);
      return function () {
        var args = ARR_SLICE.call(arguments);

        for (var i = toCall.length - 1; i >= 0; i--) {
          args = [toCall[i].apply(this, args)];
        }

        return args[0];
      };
    },
    each: function each(obj, itr, scope) {
      if (!obj) {
        return;
      }

      if (ARR_EACH && obj.forEach && obj.forEach === ARR_EACH) {
        obj.forEach(itr, scope);
      } else if (obj.length === obj.length + 0) {
        var key = void 0;
        var l = void 0;

        for (key = 0, l = obj.length; key < l; key++) {
          if (key in obj && itr.call(scope, obj[key], key) === this.BREAK) {
            return;
          }
        }
      } else {
        for (var _key in obj) {
          if (itr.call(scope, obj[_key], _key) === this.BREAK) {
            return;
          }
        }
      }
    },
    defer: function defer(fnc) {
      setTimeout(fnc, 0);
    },
    debounce: function debounce(func, threshold, callImmediately) {
      var timeout = void 0;
      return function () {
        var obj = this;
        var args = arguments;

        function delayed() {
          timeout = null;
          if (!callImmediately) func.apply(obj, args);
        }

        var callNow = callImmediately || !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(delayed, threshold);

        if (callNow) {
          func.apply(obj, args);
        }
      };
    },
    toArray: function toArray(obj) {
      if (obj.toArray) return obj.toArray();
      return ARR_SLICE.call(obj);
    },
    isUndefined: function isUndefined(obj) {
      return obj === undefined;
    },
    isNull: function isNull(obj) {
      return obj === null;
    },
    isNaN: function (_isNaN) {
      function isNaN(_x) {
        return _isNaN.apply(this, arguments);
      }

      isNaN.toString = function () {
        return _isNaN.toString();
      };

      return isNaN;
    }(function (obj) {
      return isNaN(obj);
    }),
    isArray: Array.isArray || function (obj) {
      return obj.constructor === Array;
    },
    isObject: function isObject(obj) {
      return obj === Object(obj);
    },
    isNumber: function isNumber(obj) {
      return obj === obj + 0;
    },
    isString: function isString(obj) {
      return obj === obj + '';
    },
    isBoolean: function isBoolean(obj) {
      return obj === false || obj === true;
    },
    isFunction: function isFunction(obj) {
      return Object.prototype.toString.call(obj) === '[object Function]';
    }
  };
  var INTERPRETATIONS = [{
    litmus: Common.isString,
    conversions: {
      THREE_CHAR_HEX: {
        read: function read(original) {
          var test = original.match(/^#([A-F0-9])([A-F0-9])([A-F0-9])$/i);

          if (test === null) {
            return false;
          }

          return {
            space: 'HEX',
            hex: parseInt('0x' + test[1].toString() + test[1].toString() + test[2].toString() + test[2].toString() + test[3].toString() + test[3].toString(), 0)
          };
        },
        write: colorToString
      },
      SIX_CHAR_HEX: {
        read: function read(original) {
          var test = original.match(/^#([A-F0-9]{6})$/i);

          if (test === null) {
            return false;
          }

          return {
            space: 'HEX',
            hex: parseInt('0x' + test[1].toString(), 0)
          };
        },
        write: colorToString
      },
      CSS_RGB: {
        read: function read(original) {
          var test = original.match(/^rgb\(\s*(.+)\s*,\s*(.+)\s*,\s*(.+)\s*\)/);

          if (test === null) {
            return false;
          }

          return {
            space: 'RGB',
            r: parseFloat(test[1]),
            g: parseFloat(test[2]),
            b: parseFloat(test[3])
          };
        },
        write: colorToString
      },
      CSS_RGBA: {
        read: function read(original) {
          var test = original.match(/^rgba\(\s*(.+)\s*,\s*(.+)\s*,\s*(.+)\s*,\s*(.+)\s*\)/);

          if (test === null) {
            return false;
          }

          return {
            space: 'RGB',
            r: parseFloat(test[1]),
            g: parseFloat(test[2]),
            b: parseFloat(test[3]),
            a: parseFloat(test[4])
          };
        },
        write: colorToString
      }
    }
  }, {
    litmus: Common.isNumber,
    conversions: {
      HEX: {
        read: function read(original) {
          return {
            space: 'HEX',
            hex: original,
            conversionName: 'HEX'
          };
        },
        write: function write(color) {
          return color.hex;
        }
      }
    }
  }, {
    litmus: Common.isArray,
    conversions: {
      RGB_ARRAY: {
        read: function read(original) {
          if (original.length !== 3) {
            return false;
          }

          return {
            space: 'RGB',
            r: original[0],
            g: original[1],
            b: original[2]
          };
        },
        write: function write(color) {
          return [color.r, color.g, color.b];
        }
      },
      RGBA_ARRAY: {
        read: function read(original) {
          if (original.length !== 4) return false;
          return {
            space: 'RGB',
            r: original[0],
            g: original[1],
            b: original[2],
            a: original[3]
          };
        },
        write: function write(color) {
          return [color.r, color.g, color.b, color.a];
        }
      }
    }
  }, {
    litmus: Common.isObject,
    conversions: {
      RGBA_OBJ: {
        read: function read(original) {
          if (Common.isNumber(original.r) && Common.isNumber(original.g) && Common.isNumber(original.b) && Common.isNumber(original.a)) {
            return {
              space: 'RGB',
              r: original.r,
              g: original.g,
              b: original.b,
              a: original.a
            };
          }

          return false;
        },
        write: function write(color) {
          return {
            r: color.r,
            g: color.g,
            b: color.b,
            a: color.a
          };
        }
      },
      RGB_OBJ: {
        read: function read(original) {
          if (Common.isNumber(original.r) && Common.isNumber(original.g) && Common.isNumber(original.b)) {
            return {
              space: 'RGB',
              r: original.r,
              g: original.g,
              b: original.b
            };
          }

          return false;
        },
        write: function write(color) {
          return {
            r: color.r,
            g: color.g,
            b: color.b
          };
        }
      },
      HSVA_OBJ: {
        read: function read(original) {
          if (Common.isNumber(original.h) && Common.isNumber(original.s) && Common.isNumber(original.v) && Common.isNumber(original.a)) {
            return {
              space: 'HSV',
              h: original.h,
              s: original.s,
              v: original.v,
              a: original.a
            };
          }

          return false;
        },
        write: function write(color) {
          return {
            h: color.h,
            s: color.s,
            v: color.v,
            a: color.a
          };
        }
      },
      HSV_OBJ: {
        read: function read(original) {
          if (Common.isNumber(original.h) && Common.isNumber(original.s) && Common.isNumber(original.v)) {
            return {
              space: 'HSV',
              h: original.h,
              s: original.s,
              v: original.v
            };
          }

          return false;
        },
        write: function write(color) {
          return {
            h: color.h,
            s: color.s,
            v: color.v
          };
        }
      }
    }
  }];
  var result = void 0;
  var toReturn = void 0;

  var interpret = function interpret() {
    toReturn = false;
    var original = arguments.length > 1 ? Common.toArray(arguments) : arguments[0];
    Common.each(INTERPRETATIONS, function (family) {
      if (family.litmus(original)) {
        Common.each(family.conversions, function (conversion, conversionName) {
          result = conversion.read(original);

          if (toReturn === false && result !== false) {
            toReturn = result;
            result.conversionName = conversionName;
            result.conversion = conversion;
            return Common.BREAK;
          }
        });
        return Common.BREAK;
      }
    });
    return toReturn;
  };

  var tmpComponent = void 0;
  var ColorMath = {
    hsv_to_rgb: function hsv_to_rgb(h, s, v) {
      var hi = Math.floor(h / 60) % 6;
      var f = h / 60 - Math.floor(h / 60);
      var p = v * (1.0 - s);
      var q = v * (1.0 - f * s);
      var t = v * (1.0 - (1.0 - f) * s);
      var c = [[v, t, p], [q, v, p], [p, v, t], [p, q, v], [t, p, v], [v, p, q]][hi];
      return {
        r: c[0] * 255,
        g: c[1] * 255,
        b: c[2] * 255
      };
    },
    rgb_to_hsv: function rgb_to_hsv(r, g, b) {
      var min = Math.min(r, g, b);
      var max = Math.max(r, g, b);
      var delta = max - min;
      var h = void 0;
      var s = void 0;

      if (max !== 0) {
        s = delta / max;
      } else {
        return {
          h: NaN,
          s: 0,
          v: 0
        };
      }

      if (r === max) {
        h = (g - b) / delta;
      } else if (g === max) {
        h = 2 + (b - r) / delta;
      } else {
        h = 4 + (r - g) / delta;
      }

      h /= 6;

      if (h < 0) {
        h += 1;
      }

      return {
        h: h * 360,
        s: s,
        v: max / 255
      };
    },
    rgb_to_hex: function rgb_to_hex(r, g, b) {
      var hex = this.hex_with_component(0, 2, r);
      hex = this.hex_with_component(hex, 1, g);
      hex = this.hex_with_component(hex, 0, b);
      return hex;
    },
    component_from_hex: function component_from_hex(hex, componentIndex) {
      return hex >> componentIndex * 8 & 0xFF;
    },
    hex_with_component: function hex_with_component(hex, componentIndex, value) {
      return value << (tmpComponent = componentIndex * 8) | hex & ~(0xFF << tmpComponent);
    }
  };

  var _typeof$1 = typeof Symbol === "function" && _typeof(Symbol.iterator) === "symbol" ? function (obj) {
    return _typeof(obj);
  } : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : _typeof(obj);
  };

  var classCallCheck = function classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  };

  var createClass = function () {
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

  var get = function get(object, property, receiver) {
    if (object === null) object = Function.prototype;
    var desc = Object.getOwnPropertyDescriptor(object, property);

    if (desc === undefined) {
      var parent = Object.getPrototypeOf(object);

      if (parent === null) {
        return undefined;
      } else {
        return get(parent, property, receiver);
      }
    } else if ("value" in desc) {
      return desc.value;
    } else {
      var getter = desc.get;

      if (getter === undefined) {
        return undefined;
      }

      return getter.call(receiver);
    }
  };

  var inherits = function inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + _typeof(superClass));
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
  };

  var possibleConstructorReturn = function possibleConstructorReturn(self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return call && (_typeof(call) === "object" || typeof call === "function") ? call : self;
  };

  var Color = function () {
    function Color() {
      classCallCheck(this, Color);
      this.__state = interpret.apply(this, arguments);

      if (this.__state === false) {
        throw new Error('Failed to interpret color arguments');
      }

      this.__state.a = this.__state.a || 1;
    }

    createClass(Color, [{
      key: 'toString',
      value: function toString() {
        return colorToString(this);
      }
    }, {
      key: 'toHexString',
      value: function toHexString() {
        return colorToString(this, true);
      }
    }, {
      key: 'toOriginal',
      value: function toOriginal() {
        return this.__state.conversion.write(this);
      }
    }]);
    return Color;
  }();

  function defineRGBComponent(target, component, componentHexIndex) {
    Object.defineProperty(target, component, {
      get: function get$$1() {
        if (this.__state.space === 'RGB') {
          return this.__state[component];
        }

        Color.recalculateRGB(this, component, componentHexIndex);
        return this.__state[component];
      },
      set: function set$$1(v) {
        if (this.__state.space !== 'RGB') {
          Color.recalculateRGB(this, component, componentHexIndex);
          this.__state.space = 'RGB';
        }

        this.__state[component] = v;
      }
    });
  }

  function defineHSVComponent(target, component) {
    Object.defineProperty(target, component, {
      get: function get$$1() {
        if (this.__state.space === 'HSV') {
          return this.__state[component];
        }

        Color.recalculateHSV(this);
        return this.__state[component];
      },
      set: function set$$1(v) {
        if (this.__state.space !== 'HSV') {
          Color.recalculateHSV(this);
          this.__state.space = 'HSV';
        }

        this.__state[component] = v;
      }
    });
  }

  Color.recalculateRGB = function (color, component, componentHexIndex) {
    if (color.__state.space === 'HEX') {
      color.__state[component] = ColorMath.component_from_hex(color.__state.hex, componentHexIndex);
    } else if (color.__state.space === 'HSV') {
      Common.extend(color.__state, ColorMath.hsv_to_rgb(color.__state.h, color.__state.s, color.__state.v));
    } else {
      throw new Error('Corrupted color state');
    }
  };

  Color.recalculateHSV = function (color) {
    var result = ColorMath.rgb_to_hsv(color.r, color.g, color.b);
    Common.extend(color.__state, {
      s: result.s,
      v: result.v
    });

    if (!Common.isNaN(result.h)) {
      color.__state.h = result.h;
    } else if (Common.isUndefined(color.__state.h)) {
      color.__state.h = 0;
    }
  };

  Color.COMPONENTS = ['r', 'g', 'b', 'h', 's', 'v', 'hex', 'a'];
  defineRGBComponent(Color.prototype, 'r', 2);
  defineRGBComponent(Color.prototype, 'g', 1);
  defineRGBComponent(Color.prototype, 'b', 0);
  defineHSVComponent(Color.prototype, 'h');
  defineHSVComponent(Color.prototype, 's');
  defineHSVComponent(Color.prototype, 'v');
  Object.defineProperty(Color.prototype, 'a', {
    get: function get$$1() {
      return this.__state.a;
    },
    set: function set$$1(v) {
      this.__state.a = v;
    }
  });
  Object.defineProperty(Color.prototype, 'hex', {
    get: function get$$1() {
      if (!this.__state.space !== 'HEX') {
        this.__state.hex = ColorMath.rgb_to_hex(this.r, this.g, this.b);
      }

      return this.__state.hex;
    },
    set: function set$$1(v) {
      this.__state.space = 'HEX';
      this.__state.hex = v;
    }
  });

  var Controller = function () {
    function Controller(object, property) {
      classCallCheck(this, Controller);
      this.initialValue = object[property];
      this.domElement = document.createElement('div');
      this.object = object;
      this.property = property;
      this.__onChange = undefined;
      this.__onFinishChange = undefined;
    }

    createClass(Controller, [{
      key: 'onChange',
      value: function onChange(fnc) {
        this.__onChange = fnc;
        return this;
      }
    }, {
      key: 'onFinishChange',
      value: function onFinishChange(fnc) {
        this.__onFinishChange = fnc;
        return this;
      }
    }, {
      key: 'setValue',
      value: function setValue(newValue) {
        this.object[this.property] = newValue;

        if (this.__onChange) {
          this.__onChange.call(this, newValue);
        }

        this.updateDisplay();
        return this;
      }
    }, {
      key: 'getValue',
      value: function getValue() {
        return this.object[this.property];
      }
    }, {
      key: 'updateDisplay',
      value: function updateDisplay() {
        return this;
      }
    }, {
      key: 'isModified',
      value: function isModified() {
        return this.initialValue !== this.getValue();
      }
    }]);
    return Controller;
  }();

  var EVENT_MAP = {
    HTMLEvents: ['change'],
    MouseEvents: ['click', 'mousemove', 'mousedown', 'mouseup', 'mouseover'],
    KeyboardEvents: ['keydown']
  };
  var EVENT_MAP_INV = {};
  Common.each(EVENT_MAP, function (v, k) {
    Common.each(v, function (e) {
      EVENT_MAP_INV[e] = k;
    });
  });
  var CSS_VALUE_PIXELS = /(\d+(\.\d+)?)px/;

  function cssValueToPixels(val) {
    if (val === '0' || Common.isUndefined(val)) {
      return 0;
    }

    var match = val.match(CSS_VALUE_PIXELS);

    if (!Common.isNull(match)) {
      return parseFloat(match[1]);
    }

    return 0;
  }

  var dom = {
    makeSelectable: function makeSelectable(elem, selectable) {
      if (elem === undefined || elem.style === undefined) return;
      elem.onselectstart = selectable ? function () {
        return false;
      } : function () {};
      elem.style.MozUserSelect = selectable ? 'auto' : 'none';
      elem.style.KhtmlUserSelect = selectable ? 'auto' : 'none';
      elem.unselectable = selectable ? 'on' : 'off';
    },
    makeFullscreen: function makeFullscreen(elem, hor, vert) {
      var vertical = vert;
      var horizontal = hor;

      if (Common.isUndefined(horizontal)) {
        horizontal = true;
      }

      if (Common.isUndefined(vertical)) {
        vertical = true;
      }

      elem.style.position = 'absolute';

      if (horizontal) {
        elem.style.left = 0;
        elem.style.right = 0;
      }

      if (vertical) {
        elem.style.top = 0;
        elem.style.bottom = 0;
      }
    },
    fakeEvent: function fakeEvent(elem, eventType, pars, aux) {
      var params = pars || {};
      var className = EVENT_MAP_INV[eventType];

      if (!className) {
        throw new Error('Event type ' + eventType + ' not supported.');
      }

      var evt = document.createEvent(className);

      switch (className) {
        case 'MouseEvents':
          {
            var clientX = params.x || params.clientX || 0;
            var clientY = params.y || params.clientY || 0;
            evt.initMouseEvent(eventType, params.bubbles || false, params.cancelable || true, window, params.clickCount || 1, 0, 0, clientX, clientY, false, false, false, false, 0, null);
            break;
          }

        case 'KeyboardEvents':
          {
            var init = evt.initKeyboardEvent || evt.initKeyEvent;
            Common.defaults(params, {
              cancelable: true,
              ctrlKey: false,
              altKey: false,
              shiftKey: false,
              metaKey: false,
              keyCode: undefined,
              charCode: undefined
            });
            init(eventType, params.bubbles || false, params.cancelable, window, params.ctrlKey, params.altKey, params.shiftKey, params.metaKey, params.keyCode, params.charCode);
            break;
          }

        default:
          {
            evt.initEvent(eventType, params.bubbles || false, params.cancelable || true);
            break;
          }
      }

      Common.defaults(evt, aux);
      elem.dispatchEvent(evt);
    },
    bind: function bind(elem, event, func, newBool) {
      var bool = newBool || false;

      if (elem.addEventListener) {
        elem.addEventListener(event, func, bool);
      } else if (elem.attachEvent) {
        elem.attachEvent('on' + event, func);
      }

      return dom;
    },
    unbind: function unbind(elem, event, func, newBool) {
      var bool = newBool || false;

      if (elem.removeEventListener) {
        elem.removeEventListener(event, func, bool);
      } else if (elem.detachEvent) {
        elem.detachEvent('on' + event, func);
      }

      return dom;
    },
    addClass: function addClass(elem, className) {
      if (elem.className === undefined) {
        elem.className = className;
      } else if (elem.className !== className) {
        var classes = elem.className.split(/ +/);

        if (classes.indexOf(className) === -1) {
          classes.push(className);
          elem.className = classes.join(' ').replace(/^\s+/, '').replace(/\s+$/, '');
        }
      }

      return dom;
    },
    removeClass: function removeClass(elem, className) {
      if (className) {
        if (elem.className === className) {
          elem.removeAttribute('class');
        } else {
          var classes = elem.className.split(/ +/);
          var index = classes.indexOf(className);

          if (index !== -1) {
            classes.splice(index, 1);
            elem.className = classes.join(' ');
          }
        }
      } else {
        elem.className = undefined;
      }

      return dom;
    },
    hasClass: function hasClass(elem, className) {
      return new RegExp('(?:^|\\s+)' + className + '(?:\\s+|$)').test(elem.className) || false;
    },
    getWidth: function getWidth(elem) {
      var style = getComputedStyle(elem);
      return cssValueToPixels(style['border-left-width']) + cssValueToPixels(style['border-right-width']) + cssValueToPixels(style['padding-left']) + cssValueToPixels(style['padding-right']) + cssValueToPixels(style.width);
    },
    getHeight: function getHeight(elem) {
      var style = getComputedStyle(elem);
      return cssValueToPixels(style['border-top-width']) + cssValueToPixels(style['border-bottom-width']) + cssValueToPixels(style['padding-top']) + cssValueToPixels(style['padding-bottom']) + cssValueToPixels(style.height);
    },
    getOffset: function getOffset(el) {
      var elem = el;
      var offset = {
        left: 0,
        top: 0
      };

      if (elem.offsetParent) {
        do {
          offset.left += elem.offsetLeft;
          offset.top += elem.offsetTop;
          elem = elem.offsetParent;
        } while (elem);
      }

      return offset;
    },
    isActive: function isActive(elem) {
      return elem === document.activeElement && (elem.type || elem.href);
    }
  };

  var BooleanController = function (_Controller) {
    inherits(BooleanController, _Controller);

    function BooleanController(object, property) {
      classCallCheck(this, BooleanController);

      var _this2 = possibleConstructorReturn(this, (BooleanController.__proto__ || Object.getPrototypeOf(BooleanController)).call(this, object, property));

      var _this = _this2;
      _this2.__prev = _this2.getValue();
      _this2.__checkbox = document.createElement('input');

      _this2.__checkbox.setAttribute('type', 'checkbox');

      function onChange() {
        _this.setValue(!_this.__prev);
      }

      dom.bind(_this2.__checkbox, 'change', onChange, false);

      _this2.domElement.appendChild(_this2.__checkbox);

      _this2.updateDisplay();

      return _this2;
    }

    createClass(BooleanController, [{
      key: 'setValue',
      value: function setValue(v) {
        var toReturn = get(BooleanController.prototype.__proto__ || Object.getPrototypeOf(BooleanController.prototype), 'setValue', this).call(this, v);

        if (this.__onFinishChange) {
          this.__onFinishChange.call(this, this.getValue());
        }

        this.__prev = this.getValue();
        return toReturn;
      }
    }, {
      key: 'updateDisplay',
      value: function updateDisplay() {
        if (this.getValue() === true) {
          this.__checkbox.setAttribute('checked', 'checked');

          this.__checkbox.checked = true;
          this.__prev = true;
        } else {
          this.__checkbox.checked = false;
          this.__prev = false;
        }

        return get(BooleanController.prototype.__proto__ || Object.getPrototypeOf(BooleanController.prototype), 'updateDisplay', this).call(this);
      }
    }]);
    return BooleanController;
  }(Controller);

  var OptionController = function (_Controller) {
    inherits(OptionController, _Controller);

    function OptionController(object, property, opts) {
      classCallCheck(this, OptionController);

      var _this2 = possibleConstructorReturn(this, (OptionController.__proto__ || Object.getPrototypeOf(OptionController)).call(this, object, property));

      var options = opts;
      var _this = _this2;
      _this2.__select = document.createElement('select');

      if (Common.isArray(options)) {
        var map = {};
        Common.each(options, function (element) {
          map[element] = element;
        });
        options = map;
      }

      Common.each(options, function (value, key) {
        var opt = document.createElement('option');
        opt.innerHTML = key;
        opt.setAttribute('value', value);

        _this.__select.appendChild(opt);
      });

      _this2.updateDisplay();

      dom.bind(_this2.__select, 'change', function () {
        var desiredValue = this.options[this.selectedIndex].value;

        _this.setValue(desiredValue);
      });

      _this2.domElement.appendChild(_this2.__select);

      return _this2;
    }

    createClass(OptionController, [{
      key: 'setValue',
      value: function setValue(v) {
        var toReturn = get(OptionController.prototype.__proto__ || Object.getPrototypeOf(OptionController.prototype), 'setValue', this).call(this, v);

        if (this.__onFinishChange) {
          this.__onFinishChange.call(this, this.getValue());
        }

        return toReturn;
      }
    }, {
      key: 'updateDisplay',
      value: function updateDisplay() {
        if (dom.isActive(this.__select)) return this;
        this.__select.value = this.getValue();
        return get(OptionController.prototype.__proto__ || Object.getPrototypeOf(OptionController.prototype), 'updateDisplay', this).call(this);
      }
    }]);
    return OptionController;
  }(Controller);

  var StringController = function (_Controller) {
    inherits(StringController, _Controller);

    function StringController(object, property) {
      classCallCheck(this, StringController);

      var _this2 = possibleConstructorReturn(this, (StringController.__proto__ || Object.getPrototypeOf(StringController)).call(this, object, property));

      var _this = _this2;

      function onChange() {
        _this.setValue(_this.__input.value);
      }

      function onBlur() {
        if (_this.__onFinishChange) {
          _this.__onFinishChange.call(_this, _this.getValue());
        }
      }

      _this2.__input = document.createElement('input');

      _this2.__input.setAttribute('type', 'text');

      dom.bind(_this2.__input, 'keyup', onChange);
      dom.bind(_this2.__input, 'change', onChange);
      dom.bind(_this2.__input, 'blur', onBlur);
      dom.bind(_this2.__input, 'keydown', function (e) {
        if (e.keyCode === 13) {
          this.blur();
        }
      });

      _this2.updateDisplay();

      _this2.domElement.appendChild(_this2.__input);

      return _this2;
    }

    createClass(StringController, [{
      key: 'updateDisplay',
      value: function updateDisplay() {
        if (!dom.isActive(this.__input)) {
          this.__input.value = this.getValue();
        }

        return get(StringController.prototype.__proto__ || Object.getPrototypeOf(StringController.prototype), 'updateDisplay', this).call(this);
      }
    }]);
    return StringController;
  }(Controller);

  function numDecimals(x) {
    var _x = x.toString();

    if (_x.indexOf('.') > -1) {
      return _x.length - _x.indexOf('.') - 1;
    }

    return 0;
  }

  var NumberController = function (_Controller) {
    inherits(NumberController, _Controller);

    function NumberController(object, property, params) {
      classCallCheck(this, NumberController);

      var _this = possibleConstructorReturn(this, (NumberController.__proto__ || Object.getPrototypeOf(NumberController)).call(this, object, property));

      var _params = params || {};

      _this.__min = _params.min;
      _this.__max = _params.max;
      _this.__step = _params.step;

      if (Common.isUndefined(_this.__step)) {
        if (_this.initialValue === 0) {
          _this.__impliedStep = 1;
        } else {
          _this.__impliedStep = Math.pow(10, Math.floor(Math.log(Math.abs(_this.initialValue)) / Math.LN10)) / 10;
        }
      } else {
        _this.__impliedStep = _this.__step;
      }

      _this.__precision = numDecimals(_this.__impliedStep);
      return _this;
    }

    createClass(NumberController, [{
      key: 'setValue',
      value: function setValue(v) {
        var _v = v;

        if (this.__min !== undefined && _v < this.__min) {
          _v = this.__min;
        } else if (this.__max !== undefined && _v > this.__max) {
          _v = this.__max;
        }

        if (this.__step !== undefined && _v % this.__step !== 0) {
          _v = Math.round(_v / this.__step) * this.__step;
        }

        return get(NumberController.prototype.__proto__ || Object.getPrototypeOf(NumberController.prototype), 'setValue', this).call(this, _v);
      }
    }, {
      key: 'min',
      value: function min(minValue) {
        this.__min = minValue;
        return this;
      }
    }, {
      key: 'max',
      value: function max(maxValue) {
        this.__max = maxValue;
        return this;
      }
    }, {
      key: 'step',
      value: function step(stepValue) {
        this.__step = stepValue;
        this.__impliedStep = stepValue;
        this.__precision = numDecimals(stepValue);
        return this;
      }
    }]);
    return NumberController;
  }(Controller);

  function roundToDecimal(value, decimals) {
    var tenTo = Math.pow(10, decimals);
    return Math.round(value * tenTo) / tenTo;
  }

  var NumberControllerBox = function (_NumberController) {
    inherits(NumberControllerBox, _NumberController);

    function NumberControllerBox(object, property, params) {
      classCallCheck(this, NumberControllerBox);

      var _this2 = possibleConstructorReturn(this, (NumberControllerBox.__proto__ || Object.getPrototypeOf(NumberControllerBox)).call(this, object, property, params));

      _this2.__truncationSuspended = false;
      var _this = _this2;
      var prevY = void 0;

      function onChange() {
        var attempted = parseFloat(_this.__input.value);

        if (!Common.isNaN(attempted)) {
          _this.setValue(attempted);
        }
      }

      function onFinish() {
        if (_this.__onFinishChange) {
          _this.__onFinishChange.call(_this, _this.getValue());
        }
      }

      function onBlur() {
        onFinish();
      }

      function onMouseDrag(e) {
        var diff = prevY - e.clientY;

        _this.setValue(_this.getValue() + diff * _this.__impliedStep);

        prevY = e.clientY;
      }

      function onMouseUp() {
        dom.unbind(window, 'mousemove', onMouseDrag);
        dom.unbind(window, 'mouseup', onMouseUp);
        onFinish();
      }

      function onMouseDown(e) {
        dom.bind(window, 'mousemove', onMouseDrag);
        dom.bind(window, 'mouseup', onMouseUp);
        prevY = e.clientY;
      }

      _this2.__input = document.createElement('input');

      _this2.__input.setAttribute('type', 'text');

      dom.bind(_this2.__input, 'change', onChange);
      dom.bind(_this2.__input, 'blur', onBlur);
      dom.bind(_this2.__input, 'mousedown', onMouseDown);
      dom.bind(_this2.__input, 'keydown', function (e) {
        if (e.keyCode === 13) {
          _this.__truncationSuspended = true;
          this.blur();
          _this.__truncationSuspended = false;
          onFinish();
        }
      });

      _this2.updateDisplay();

      _this2.domElement.appendChild(_this2.__input);

      return _this2;
    }

    createClass(NumberControllerBox, [{
      key: 'updateDisplay',
      value: function updateDisplay() {
        this.__input.value = this.__truncationSuspended ? this.getValue() : roundToDecimal(this.getValue(), this.__precision);
        return get(NumberControllerBox.prototype.__proto__ || Object.getPrototypeOf(NumberControllerBox.prototype), 'updateDisplay', this).call(this);
      }
    }]);
    return NumberControllerBox;
  }(NumberController);

  function map(v, i1, i2, o1, o2) {
    return o1 + (o2 - o1) * ((v - i1) / (i2 - i1));
  }

  var NumberControllerSlider = function (_NumberController) {
    inherits(NumberControllerSlider, _NumberController);

    function NumberControllerSlider(object, property, min, max, step) {
      classCallCheck(this, NumberControllerSlider);

      var _this2 = possibleConstructorReturn(this, (NumberControllerSlider.__proto__ || Object.getPrototypeOf(NumberControllerSlider)).call(this, object, property, {
        min: min,
        max: max,
        step: step
      }));

      var _this = _this2;
      _this2.__background = document.createElement('div');
      _this2.__foreground = document.createElement('div');
      dom.bind(_this2.__background, 'mousedown', onMouseDown);
      dom.bind(_this2.__background, 'touchstart', onTouchStart);
      dom.addClass(_this2.__background, 'slider');
      dom.addClass(_this2.__foreground, 'slider-fg');

      function onMouseDown(e) {
        document.activeElement.blur();
        dom.bind(window, 'mousemove', onMouseDrag);
        dom.bind(window, 'mouseup', onMouseUp);
        onMouseDrag(e);
      }

      function onMouseDrag(e) {
        e.preventDefault();

        var bgRect = _this.__background.getBoundingClientRect();

        _this.setValue(map(e.clientX, bgRect.left, bgRect.right, _this.__min, _this.__max));

        return false;
      }

      function onMouseUp() {
        dom.unbind(window, 'mousemove', onMouseDrag);
        dom.unbind(window, 'mouseup', onMouseUp);

        if (_this.__onFinishChange) {
          _this.__onFinishChange.call(_this, _this.getValue());
        }
      }

      function onTouchStart(e) {
        if (e.touches.length !== 1) {
          return;
        }

        dom.bind(window, 'touchmove', onTouchMove);
        dom.bind(window, 'touchend', onTouchEnd);
        onTouchMove(e);
      }

      function onTouchMove(e) {
        var clientX = e.touches[0].clientX;

        var bgRect = _this.__background.getBoundingClientRect();

        _this.setValue(map(clientX, bgRect.left, bgRect.right, _this.__min, _this.__max));
      }

      function onTouchEnd() {
        dom.unbind(window, 'touchmove', onTouchMove);
        dom.unbind(window, 'touchend', onTouchEnd);

        if (_this.__onFinishChange) {
          _this.__onFinishChange.call(_this, _this.getValue());
        }
      }

      _this2.updateDisplay();

      _this2.__background.appendChild(_this2.__foreground);

      _this2.domElement.appendChild(_this2.__background);

      return _this2;
    }

    createClass(NumberControllerSlider, [{
      key: 'updateDisplay',
      value: function updateDisplay() {
        var pct = (this.getValue() - this.__min) / (this.__max - this.__min);

        this.__foreground.style.width = pct * 100 + '%';
        return get(NumberControllerSlider.prototype.__proto__ || Object.getPrototypeOf(NumberControllerSlider.prototype), 'updateDisplay', this).call(this);
      }
    }]);
    return NumberControllerSlider;
  }(NumberController);

  var FunctionController = function (_Controller) {
    inherits(FunctionController, _Controller);

    function FunctionController(object, property, text) {
      classCallCheck(this, FunctionController);

      var _this2 = possibleConstructorReturn(this, (FunctionController.__proto__ || Object.getPrototypeOf(FunctionController)).call(this, object, property));

      var _this = _this2;
      _this2.__button = document.createElement('div');
      _this2.__button.innerHTML = text === undefined ? 'Fire' : text;
      dom.bind(_this2.__button, 'click', function (e) {
        e.preventDefault();

        _this.fire();

        return false;
      });
      dom.addClass(_this2.__button, 'button');

      _this2.domElement.appendChild(_this2.__button);

      return _this2;
    }

    createClass(FunctionController, [{
      key: 'fire',
      value: function fire() {
        if (this.__onChange) {
          this.__onChange.call(this);
        }

        this.getValue().call(this.object);

        if (this.__onFinishChange) {
          this.__onFinishChange.call(this, this.getValue());
        }
      }
    }]);
    return FunctionController;
  }(Controller);

  var ColorController = function (_Controller) {
    inherits(ColorController, _Controller);

    function ColorController(object, property) {
      classCallCheck(this, ColorController);

      var _this2 = possibleConstructorReturn(this, (ColorController.__proto__ || Object.getPrototypeOf(ColorController)).call(this, object, property));

      _this2.__color = new Color(_this2.getValue());
      _this2.__temp = new Color(0);
      var _this = _this2;
      _this2.domElement = document.createElement('div');
      dom.makeSelectable(_this2.domElement, false);
      _this2.__selector = document.createElement('div');
      _this2.__selector.className = 'selector';
      _this2.__saturation_field = document.createElement('div');
      _this2.__saturation_field.className = 'saturation-field';
      _this2.__field_knob = document.createElement('div');
      _this2.__field_knob.className = 'field-knob';
      _this2.__field_knob_border = '2px solid ';
      _this2.__hue_knob = document.createElement('div');
      _this2.__hue_knob.className = 'hue-knob';
      _this2.__hue_field = document.createElement('div');
      _this2.__hue_field.className = 'hue-field';
      _this2.__input = document.createElement('input');
      _this2.__input.type = 'text';
      _this2.__input_textShadow = '0 1px 1px ';
      dom.bind(_this2.__input, 'keydown', function (e) {
        if (e.keyCode === 13) {
          onBlur.call(this);
        }
      });
      dom.bind(_this2.__input, 'blur', onBlur);
      dom.bind(_this2.__selector, 'mousedown', function () {
        dom.addClass(this, 'drag').bind(window, 'mouseup', function () {
          dom.removeClass(_this.__selector, 'drag');
        });
      });
      dom.bind(_this2.__selector, 'touchstart', function () {
        dom.addClass(this, 'drag').bind(window, 'touchend', function () {
          dom.removeClass(_this.__selector, 'drag');
        });
      });
      var valueField = document.createElement('div');
      Common.extend(_this2.__selector.style, {
        width: '122px',
        height: '102px',
        padding: '3px',
        backgroundColor: '#222',
        boxShadow: '0px 1px 3px rgba(0,0,0,0.3)'
      });
      Common.extend(_this2.__field_knob.style, {
        position: 'absolute',
        width: '12px',
        height: '12px',
        border: _this2.__field_knob_border + (_this2.__color.v < 0.5 ? '#fff' : '#000'),
        boxShadow: '0px 1px 3px rgba(0,0,0,0.5)',
        borderRadius: '12px',
        zIndex: 1
      });
      Common.extend(_this2.__hue_knob.style, {
        position: 'absolute',
        width: '15px',
        height: '2px',
        borderRight: '4px solid #fff',
        zIndex: 1
      });
      Common.extend(_this2.__saturation_field.style, {
        width: '100px',
        height: '100px',
        border: '1px solid #555',
        marginRight: '3px',
        display: 'inline-block',
        cursor: 'pointer'
      });
      Common.extend(valueField.style, {
        width: '100%',
        height: '100%',
        background: 'none'
      });
      linearGradient(valueField, 'top', 'rgba(0,0,0,0)', '#000');
      Common.extend(_this2.__hue_field.style, {
        width: '15px',
        height: '100px',
        border: '1px solid #555',
        cursor: 'ns-resize',
        position: 'absolute',
        top: '3px',
        right: '3px'
      });
      hueGradient(_this2.__hue_field);
      Common.extend(_this2.__input.style, {
        outline: 'none',
        textAlign: 'center',
        color: '#fff',
        border: 0,
        fontWeight: 'bold',
        textShadow: _this2.__input_textShadow + 'rgba(0,0,0,0.7)'
      });
      dom.bind(_this2.__saturation_field, 'mousedown', fieldDown);
      dom.bind(_this2.__saturation_field, 'touchstart', fieldDown);
      dom.bind(_this2.__field_knob, 'mousedown', fieldDown);
      dom.bind(_this2.__field_knob, 'touchstart', fieldDown);
      dom.bind(_this2.__hue_field, 'mousedown', fieldDownH);
      dom.bind(_this2.__hue_field, 'touchstart', fieldDownH);

      function fieldDown(e) {
        setSV(e);
        dom.bind(window, 'mousemove', setSV);
        dom.bind(window, 'touchmove', setSV);
        dom.bind(window, 'mouseup', fieldUpSV);
        dom.bind(window, 'touchend', fieldUpSV);
      }

      function fieldDownH(e) {
        setH(e);
        dom.bind(window, 'mousemove', setH);
        dom.bind(window, 'touchmove', setH);
        dom.bind(window, 'mouseup', fieldUpH);
        dom.bind(window, 'touchend', fieldUpH);
      }

      function fieldUpSV() {
        dom.unbind(window, 'mousemove', setSV);
        dom.unbind(window, 'touchmove', setSV);
        dom.unbind(window, 'mouseup', fieldUpSV);
        dom.unbind(window, 'touchend', fieldUpSV);
        onFinish();
      }

      function fieldUpH() {
        dom.unbind(window, 'mousemove', setH);
        dom.unbind(window, 'touchmove', setH);
        dom.unbind(window, 'mouseup', fieldUpH);
        dom.unbind(window, 'touchend', fieldUpH);
        onFinish();
      }

      function onBlur() {
        var i = interpret(this.value);

        if (i !== false) {
          _this.__color.__state = i;

          _this.setValue(_this.__color.toOriginal());
        } else {
          this.value = _this.__color.toString();
        }
      }

      function onFinish() {
        if (_this.__onFinishChange) {
          _this.__onFinishChange.call(_this, _this.__color.toOriginal());
        }
      }

      _this2.__saturation_field.appendChild(valueField);

      _this2.__selector.appendChild(_this2.__field_knob);

      _this2.__selector.appendChild(_this2.__saturation_field);

      _this2.__selector.appendChild(_this2.__hue_field);

      _this2.__hue_field.appendChild(_this2.__hue_knob);

      _this2.domElement.appendChild(_this2.__input);

      _this2.domElement.appendChild(_this2.__selector);

      _this2.updateDisplay();

      function setSV(e) {
        if (e.type.indexOf('touch') === -1) {
          e.preventDefault();
        }

        var fieldRect = _this.__saturation_field.getBoundingClientRect();

        var _ref = e.touches && e.touches[0] || e,
            clientX = _ref.clientX,
            clientY = _ref.clientY;

        var s = (clientX - fieldRect.left) / (fieldRect.right - fieldRect.left);
        var v = 1 - (clientY - fieldRect.top) / (fieldRect.bottom - fieldRect.top);

        if (v > 1) {
          v = 1;
        } else if (v < 0) {
          v = 0;
        }

        if (s > 1) {
          s = 1;
        } else if (s < 0) {
          s = 0;
        }

        _this.__color.v = v;
        _this.__color.s = s;

        _this.setValue(_this.__color.toOriginal());

        return false;
      }

      function setH(e) {
        if (e.type.indexOf('touch') === -1) {
          e.preventDefault();
        }

        var fieldRect = _this.__hue_field.getBoundingClientRect();

        var _ref2 = e.touches && e.touches[0] || e,
            clientY = _ref2.clientY;

        var h = 1 - (clientY - fieldRect.top) / (fieldRect.bottom - fieldRect.top);

        if (h > 1) {
          h = 1;
        } else if (h < 0) {
          h = 0;
        }

        _this.__color.h = h * 360;

        _this.setValue(_this.__color.toOriginal());

        return false;
      }

      return _this2;
    }

    createClass(ColorController, [{
      key: 'updateDisplay',
      value: function updateDisplay() {
        var i = interpret(this.getValue());

        if (i !== false) {
          var mismatch = false;
          Common.each(Color.COMPONENTS, function (component) {
            if (!Common.isUndefined(i[component]) && !Common.isUndefined(this.__color.__state[component]) && i[component] !== this.__color.__state[component]) {
              mismatch = true;
              return {};
            }
          }, this);

          if (mismatch) {
            Common.extend(this.__color.__state, i);
          }
        }

        Common.extend(this.__temp.__state, this.__color.__state);
        this.__temp.a = 1;
        var flip = this.__color.v < 0.5 || this.__color.s > 0.5 ? 255 : 0;

        var _flip = 255 - flip;

        Common.extend(this.__field_knob.style, {
          marginLeft: 100 * this.__color.s - 7 + 'px',
          marginTop: 100 * (1 - this.__color.v) - 7 + 'px',
          backgroundColor: this.__temp.toHexString(),
          border: this.__field_knob_border + 'rgb(' + flip + ',' + flip + ',' + flip + ')'
        });
        this.__hue_knob.style.marginTop = (1 - this.__color.h / 360) * 100 + 'px';
        this.__temp.s = 1;
        this.__temp.v = 1;
        linearGradient(this.__saturation_field, 'left', '#fff', this.__temp.toHexString());
        this.__input.value = this.__color.toString();
        Common.extend(this.__input.style, {
          backgroundColor: this.__color.toHexString(),
          color: 'rgb(' + flip + ',' + flip + ',' + flip + ')',
          textShadow: this.__input_textShadow + 'rgba(' + _flip + ',' + _flip + ',' + _flip + ',.7)'
        });
      }
    }]);
    return ColorController;
  }(Controller);

  var vendors = ['-moz-', '-o-', '-webkit-', '-ms-', ''];

  function linearGradient(elem, x, a, b) {
    elem.style.background = '';
    Common.each(vendors, function (vendor) {
      elem.style.cssText += 'background: ' + vendor + 'linear-gradient(' + x + ', ' + a + ' 0%, ' + b + ' 100%); ';
    });
  }

  function hueGradient(elem) {
    elem.style.background = '';
    elem.style.cssText += 'background: -moz-linear-gradient(top,  #ff0000 0%, #ff00ff 17%, #0000ff 34%, #00ffff 50%, #00ff00 67%, #ffff00 84%, #ff0000 100%);';
    elem.style.cssText += 'background: -webkit-linear-gradient(top,  #ff0000 0%,#ff00ff 17%,#0000ff 34%,#00ffff 50%,#00ff00 67%,#ffff00 84%,#ff0000 100%);';
    elem.style.cssText += 'background: -o-linear-gradient(top,  #ff0000 0%,#ff00ff 17%,#0000ff 34%,#00ffff 50%,#00ff00 67%,#ffff00 84%,#ff0000 100%);';
    elem.style.cssText += 'background: -ms-linear-gradient(top,  #ff0000 0%,#ff00ff 17%,#0000ff 34%,#00ffff 50%,#00ff00 67%,#ffff00 84%,#ff0000 100%);';
    elem.style.cssText += 'background: linear-gradient(top,  #ff0000 0%,#ff00ff 17%,#0000ff 34%,#00ffff 50%,#00ff00 67%,#ffff00 84%,#ff0000 100%);';
  }

  var css = {
    load: function load(url, indoc) {
      var doc = indoc || document;
      var link = doc.createElement('link');
      link.type = 'text/css';
      link.rel = 'stylesheet';
      link.href = url;
      doc.getElementsByTagName('head')[0].appendChild(link);
    },
    inject: function inject(cssContent, indoc) {
      var doc = indoc || document;
      var injected = document.createElement('style');
      injected.type = 'text/css';
      injected.innerHTML = cssContent;
      var head = doc.getElementsByTagName('head')[0];

      try {
        head.appendChild(injected);
      } catch (e) {}
    }
  };
  var saveDialogContents = "<div id=\"dg-save\" class=\"dg dialogue\">\n\n  Here's the new load parameter for your <code>GUI</code>'s constructor:\n\n  <textarea id=\"dg-new-constructor\"></textarea>\n\n  <div id=\"dg-save-locally\">\n\n    <input id=\"dg-local-storage\" type=\"checkbox\"/> Automatically save\n    values to <code>localStorage</code> on exit.\n\n    <div id=\"dg-local-explain\">The values saved to <code>localStorage</code> will\n      override those passed to <code>dat.GUI</code>'s constructor. This makes it\n      easier to work incrementally, but <code>localStorage</code> is fragile,\n      and your friends may not see the same values you do.\n\n    </div>\n\n  </div>\n\n</div>";

  var ControllerFactory = function ControllerFactory(object, property) {
    var initialValue = object[property];

    if (Common.isArray(arguments[2]) || Common.isObject(arguments[2])) {
      return new OptionController(object, property, arguments[2]);
    }

    if (Common.isNumber(initialValue)) {
      if (Common.isNumber(arguments[2]) && Common.isNumber(arguments[3])) {
        if (Common.isNumber(arguments[4])) {
          return new NumberControllerSlider(object, property, arguments[2], arguments[3], arguments[4]);
        }

        return new NumberControllerSlider(object, property, arguments[2], arguments[3]);
      }

      if (Common.isNumber(arguments[4])) {
        return new NumberControllerBox(object, property, {
          min: arguments[2],
          max: arguments[3],
          step: arguments[4]
        });
      }

      return new NumberControllerBox(object, property, {
        min: arguments[2],
        max: arguments[3]
      });
    }

    if (Common.isString(initialValue)) {
      return new StringController(object, property);
    }

    if (Common.isFunction(initialValue)) {
      return new FunctionController(object, property, '');
    }

    if (Common.isBoolean(initialValue)) {
      return new BooleanController(object, property);
    }

    return null;
  };

  function requestAnimationFrame$1(callback) {
    setTimeout(callback, 1000 / 60);
  }

  var requestAnimationFrame$1$1 = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || requestAnimationFrame$1;

  var CenteredDiv = function () {
    function CenteredDiv() {
      classCallCheck(this, CenteredDiv);
      this.backgroundElement = document.createElement('div');
      Common.extend(this.backgroundElement.style, {
        backgroundColor: 'rgba(0,0,0,0.8)',
        top: 0,
        left: 0,
        display: 'none',
        zIndex: '1000',
        opacity: 0,
        WebkitTransition: 'opacity 0.2s linear',
        transition: 'opacity 0.2s linear'
      });
      dom.makeFullscreen(this.backgroundElement);
      this.backgroundElement.style.position = 'fixed';
      this.domElement = document.createElement('div');
      Common.extend(this.domElement.style, {
        position: 'fixed',
        display: 'none',
        zIndex: '1001',
        opacity: 0,
        WebkitTransition: '-webkit-transform 0.2s ease-out, opacity 0.2s linear',
        transition: 'transform 0.2s ease-out, opacity 0.2s linear'
      });
      document.body.appendChild(this.backgroundElement);
      document.body.appendChild(this.domElement);

      var _this = this;

      dom.bind(this.backgroundElement, 'click', function () {
        _this.hide();
      });
    }

    createClass(CenteredDiv, [{
      key: 'show',
      value: function show() {
        var _this = this;

        this.backgroundElement.style.display = 'block';
        this.domElement.style.display = 'block';
        this.domElement.style.opacity = 0;
        this.domElement.style.webkitTransform = 'scale(1.1)';
        this.layout();
        Common.defer(function () {
          _this.backgroundElement.style.opacity = 1;
          _this.domElement.style.opacity = 1;
          _this.domElement.style.webkitTransform = 'scale(1)';
        });
      }
    }, {
      key: 'hide',
      value: function hide() {
        var _this = this;

        var hide = function hide() {
          _this.domElement.style.display = 'none';
          _this.backgroundElement.style.display = 'none';
          dom.unbind(_this.domElement, 'webkitTransitionEnd', hide);
          dom.unbind(_this.domElement, 'transitionend', hide);
          dom.unbind(_this.domElement, 'oTransitionEnd', hide);
        };

        dom.bind(this.domElement, 'webkitTransitionEnd', hide);
        dom.bind(this.domElement, 'transitionend', hide);
        dom.bind(this.domElement, 'oTransitionEnd', hide);
        this.backgroundElement.style.opacity = 0;
        this.domElement.style.opacity = 0;
        this.domElement.style.webkitTransform = 'scale(1.1)';
      }
    }, {
      key: 'layout',
      value: function layout() {
        this.domElement.style.left = window.innerWidth / 2 - dom.getWidth(this.domElement) / 2 + 'px';
        this.domElement.style.top = window.innerHeight / 2 - dom.getHeight(this.domElement) / 2 + 'px';
      }
    }]);
    return CenteredDiv;
  }();

  var styleSheet = ___$insertStyle(".dg ul{list-style:none;margin:0;padding:0;width:100%;clear:both}.dg.ac{position:fixed;top:0;left:0;right:0;height:0;z-index:0}.dg:not(.ac) .main{overflow:hidden}.dg.main{-webkit-transition:opacity .1s linear;-o-transition:opacity .1s linear;-moz-transition:opacity .1s linear;transition:opacity .1s linear}.dg.main.taller-than-window{overflow-y:auto}.dg.main.taller-than-window .close-button{opacity:1;margin-top:-1px;border-top:1px solid #2c2c2c}.dg.main ul.closed .close-button{opacity:1 !important}.dg.main:hover .close-button,.dg.main .close-button.drag{opacity:1}.dg.main .close-button{-webkit-transition:opacity .1s linear;-o-transition:opacity .1s linear;-moz-transition:opacity .1s linear;transition:opacity .1s linear;border:0;line-height:19px;height:20px;cursor:pointer;text-align:center;background-color:#000}.dg.main .close-button.close-top{position:relative}.dg.main .close-button.close-bottom{position:absolute}.dg.main .close-button:hover{background-color:#111}.dg.a{float:right;margin-right:15px;overflow-y:visible}.dg.a.has-save>ul.close-top{margin-top:0}.dg.a.has-save>ul.close-bottom{margin-top:27px}.dg.a.has-save>ul.closed{margin-top:0}.dg.a .save-row{top:0;z-index:1002}.dg.a .save-row.close-top{position:relative}.dg.a .save-row.close-bottom{position:fixed}.dg li{-webkit-transition:height .1s ease-out;-o-transition:height .1s ease-out;-moz-transition:height .1s ease-out;transition:height .1s ease-out;-webkit-transition:overflow .1s linear;-o-transition:overflow .1s linear;-moz-transition:overflow .1s linear;transition:overflow .1s linear}.dg li:not(.folder){cursor:auto;height:27px;line-height:27px;padding:0 4px 0 5px}.dg li.folder{padding:0;border-left:4px solid rgba(0,0,0,0)}.dg li.title{cursor:pointer;margin-left:-4px}.dg .closed li:not(.title),.dg .closed ul li,.dg .closed ul li>*{height:0;overflow:hidden;border:0}.dg .cr{clear:both;padding-left:3px;height:27px;overflow:hidden}.dg .property-name{cursor:default;float:left;clear:left;width:40%;overflow:hidden;text-overflow:ellipsis}.dg .c{float:left;width:60%;position:relative}.dg .c input[type=text]{border:0;margin-top:4px;padding:3px;width:100%;float:right}.dg .has-slider input[type=text]{width:30%;margin-left:0}.dg .slider{float:left;width:66%;margin-left:-5px;margin-right:0;height:19px;margin-top:4px}.dg .slider-fg{height:100%}.dg .c input[type=checkbox]{margin-top:7px}.dg .c select{margin-top:5px}.dg .cr.function,.dg .cr.function .property-name,.dg .cr.function *,.dg .cr.boolean,.dg .cr.boolean *{cursor:pointer}.dg .cr.color{overflow:visible}.dg .selector{display:none;position:absolute;margin-left:-9px;margin-top:23px;z-index:10}.dg .c:hover .selector,.dg .selector.drag{display:block}.dg li.save-row{padding:0}.dg li.save-row .button{display:inline-block;padding:0px 6px}.dg.dialogue{background-color:#222;width:460px;padding:15px;font-size:13px;line-height:15px}#dg-new-constructor{padding:10px;color:#222;font-family:Monaco, monospace;font-size:10px;border:0;resize:none;box-shadow:inset 1px 1px 1px #888;word-wrap:break-word;margin:12px 0;display:block;width:440px;overflow-y:scroll;height:100px;position:relative}#dg-local-explain{display:none;font-size:11px;line-height:17px;border-radius:3px;background-color:#333;padding:8px;margin-top:10px}#dg-local-explain code{font-size:10px}#dat-gui-save-locally{display:none}.dg{color:#eee;font:11px 'Lucida Grande', sans-serif;text-shadow:0 -1px 0 #111}.dg.main::-webkit-scrollbar{width:5px;background:#1a1a1a}.dg.main::-webkit-scrollbar-corner{height:0;display:none}.dg.main::-webkit-scrollbar-thumb{border-radius:5px;background:#676767}.dg li:not(.folder){background:#1a1a1a;border-bottom:1px solid #2c2c2c}.dg li.save-row{line-height:25px;background:#dad5cb;border:0}.dg li.save-row select{margin-left:5px;width:108px}.dg li.save-row .button{margin-left:5px;margin-top:1px;border-radius:2px;font-size:9px;line-height:7px;padding:4px 4px 5px 4px;background:#c5bdad;color:#fff;text-shadow:0 1px 0 #b0a58f;box-shadow:0 -1px 0 #b0a58f;cursor:pointer}.dg li.save-row .button.gears{background:#c5bdad url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAsAAAANCAYAAAB/9ZQ7AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAQJJREFUeNpiYKAU/P//PwGIC/ApCABiBSAW+I8AClAcgKxQ4T9hoMAEUrxx2QSGN6+egDX+/vWT4e7N82AMYoPAx/evwWoYoSYbACX2s7KxCxzcsezDh3evFoDEBYTEEqycggWAzA9AuUSQQgeYPa9fPv6/YWm/Acx5IPb7ty/fw+QZblw67vDs8R0YHyQhgObx+yAJkBqmG5dPPDh1aPOGR/eugW0G4vlIoTIfyFcA+QekhhHJhPdQxbiAIguMBTQZrPD7108M6roWYDFQiIAAv6Aow/1bFwXgis+f2LUAynwoIaNcz8XNx3Dl7MEJUDGQpx9gtQ8YCueB+D26OECAAQDadt7e46D42QAAAABJRU5ErkJggg==) 2px 1px no-repeat;height:7px;width:8px}.dg li.save-row .button:hover{background-color:#bab19e;box-shadow:0 -1px 0 #b0a58f}.dg li.folder{border-bottom:0}.dg li.title{padding-left:16px;background:#000 url(data:image/gif;base64,R0lGODlhBQAFAJEAAP////Pz8////////yH5BAEAAAIALAAAAAAFAAUAAAIIlI+hKgFxoCgAOw==) 6px 10px no-repeat;cursor:pointer;border-bottom:1px solid rgba(255,255,255,0.2)}.dg .closed li.title{background-image:url(data:image/gif;base64,R0lGODlhBQAFAJEAAP////Pz8////////yH5BAEAAAIALAAAAAAFAAUAAAIIlGIWqMCbWAEAOw==)}.dg .cr.boolean{border-left:3px solid #806787}.dg .cr.color{border-left:3px solid}.dg .cr.function{border-left:3px solid #e61d5f}.dg .cr.number{border-left:3px solid #2FA1D6}.dg .cr.number input[type=text]{color:#2FA1D6}.dg .cr.string{border-left:3px solid #1ed36f}.dg .cr.string input[type=text]{color:#1ed36f}.dg .cr.function:hover,.dg .cr.boolean:hover{background:#111}.dg .c input[type=text]{background:#303030;outline:none}.dg .c input[type=text]:hover{background:#3c3c3c}.dg .c input[type=text]:focus{background:#494949;color:#fff}.dg .c .slider{background:#303030;cursor:ew-resize}.dg .c .slider-fg{background:#2FA1D6;max-width:100%}.dg .c .slider:hover{background:#3c3c3c}.dg .c .slider:hover .slider-fg{background:#44abda}\n");

  css.inject(styleSheet);
  var CSS_NAMESPACE = 'dg';
  var HIDE_KEY_CODE = 72;
  var CLOSE_BUTTON_HEIGHT = 20;
  var DEFAULT_DEFAULT_PRESET_NAME = 'Default';

  var SUPPORTS_LOCAL_STORAGE = function () {
    try {
      return !!window.localStorage;
    } catch (e) {
      return false;
    }
  }();

  var SAVE_DIALOGUE = void 0;
  var autoPlaceVirgin = true;
  var autoPlaceContainer = void 0;
  var hide = false;
  var hideableGuis = [];

  var GUI = function GUI(pars) {
    var _this = this;

    var params = pars || {};
    this.domElement = document.createElement('div');
    this.__ul = document.createElement('ul');
    this.domElement.appendChild(this.__ul);
    dom.addClass(this.domElement, CSS_NAMESPACE);
    this.__folders = {};
    this.__controllers = [];
    this.__rememberedObjects = [];
    this.__rememberedObjectIndecesToControllers = [];
    this.__listening = [];
    params = Common.defaults(params, {
      closeOnTop: false,
      autoPlace: true,
      width: GUI.DEFAULT_WIDTH
    });
    params = Common.defaults(params, {
      resizable: params.autoPlace,
      hideable: params.autoPlace
    });

    if (!Common.isUndefined(params.load)) {
      if (params.preset) {
        params.load.preset = params.preset;
      }
    } else {
      params.load = {
        preset: DEFAULT_DEFAULT_PRESET_NAME
      };
    }

    if (Common.isUndefined(params.parent) && params.hideable) {
      hideableGuis.push(this);
    }

    params.resizable = Common.isUndefined(params.parent) && params.resizable;

    if (params.autoPlace && Common.isUndefined(params.scrollable)) {
      params.scrollable = true;
    }

    var useLocalStorage = SUPPORTS_LOCAL_STORAGE && localStorage.getItem(getLocalStorageHash(this, 'isLocal')) === 'true';
    var saveToLocalStorage = void 0;
    var titleRow = void 0;
    Object.defineProperties(this, {
      parent: {
        get: function get$$1() {
          return params.parent;
        }
      },
      scrollable: {
        get: function get$$1() {
          return params.scrollable;
        }
      },
      autoPlace: {
        get: function get$$1() {
          return params.autoPlace;
        }
      },
      closeOnTop: {
        get: function get$$1() {
          return params.closeOnTop;
        }
      },
      preset: {
        get: function get$$1() {
          if (_this.parent) {
            return _this.getRoot().preset;
          }

          return params.load.preset;
        },
        set: function set$$1(v) {
          if (_this.parent) {
            _this.getRoot().preset = v;
          } else {
            params.load.preset = v;
          }

          setPresetSelectIndex(this);

          _this.revert();
        }
      },
      width: {
        get: function get$$1() {
          return params.width;
        },
        set: function set$$1(v) {
          params.width = v;
          setWidth(_this, v);
        }
      },
      name: {
        get: function get$$1() {
          return params.name;
        },
        set: function set$$1(v) {
          params.name = v;

          if (titleRow) {
            titleRow.innerHTML = params.name;
          }
        }
      },
      closed: {
        get: function get$$1() {
          return params.closed;
        },
        set: function set$$1(v) {
          params.closed = v;

          if (params.closed) {
            dom.addClass(_this.__ul, GUI.CLASS_CLOSED);
          } else {
            dom.removeClass(_this.__ul, GUI.CLASS_CLOSED);
          }

          this.onResize();

          if (_this.__closeButton) {
            _this.__closeButton.innerHTML = v ? GUI.TEXT_OPEN : GUI.TEXT_CLOSED;
          }
        }
      },
      load: {
        get: function get$$1() {
          return params.load;
        }
      },
      useLocalStorage: {
        get: function get$$1() {
          return useLocalStorage;
        },
        set: function set$$1(bool) {
          if (SUPPORTS_LOCAL_STORAGE) {
            useLocalStorage = bool;

            if (bool) {
              dom.bind(window, 'unload', saveToLocalStorage);
            } else {
              dom.unbind(window, 'unload', saveToLocalStorage);
            }

            localStorage.setItem(getLocalStorageHash(_this, 'isLocal'), bool);
          }
        }
      }
    });

    if (Common.isUndefined(params.parent)) {
      this.closed = params.closed || false;
      dom.addClass(this.domElement, GUI.CLASS_MAIN);
      dom.makeSelectable(this.domElement, false);

      if (SUPPORTS_LOCAL_STORAGE) {
        if (useLocalStorage) {
          _this.useLocalStorage = true;
          var savedGui = localStorage.getItem(getLocalStorageHash(this, 'gui'));

          if (savedGui) {
            params.load = JSON.parse(savedGui);
          }
        }
      }

      this.__closeButton = document.createElement('div');
      this.__closeButton.innerHTML = GUI.TEXT_CLOSED;
      dom.addClass(this.__closeButton, GUI.CLASS_CLOSE_BUTTON);

      if (params.closeOnTop) {
        dom.addClass(this.__closeButton, GUI.CLASS_CLOSE_TOP);
        this.domElement.insertBefore(this.__closeButton, this.domElement.childNodes[0]);
      } else {
        dom.addClass(this.__closeButton, GUI.CLASS_CLOSE_BOTTOM);
        this.domElement.appendChild(this.__closeButton);
      }

      dom.bind(this.__closeButton, 'click', function () {
        _this.closed = !_this.closed;
      });
    } else {
      if (params.closed === undefined) {
        params.closed = true;
      }

      var titleRowName = document.createTextNode(params.name);
      dom.addClass(titleRowName, 'controller-name');
      titleRow = addRow(_this, titleRowName);

      var onClickTitle = function onClickTitle(e) {
        e.preventDefault();
        _this.closed = !_this.closed;
        return false;
      };

      dom.addClass(this.__ul, GUI.CLASS_CLOSED);
      dom.addClass(titleRow, 'title');
      dom.bind(titleRow, 'click', onClickTitle);

      if (!params.closed) {
        this.closed = false;
      }
    }

    if (params.autoPlace) {
      if (Common.isUndefined(params.parent)) {
        if (autoPlaceVirgin) {
          autoPlaceContainer = document.createElement('div');
          dom.addClass(autoPlaceContainer, CSS_NAMESPACE);
          dom.addClass(autoPlaceContainer, GUI.CLASS_AUTO_PLACE_CONTAINER);
          document.body.appendChild(autoPlaceContainer);
          autoPlaceVirgin = false;
        }

        autoPlaceContainer.appendChild(this.domElement);
        dom.addClass(this.domElement, GUI.CLASS_AUTO_PLACE);
      }

      if (!this.parent) {
        setWidth(_this, params.width);
      }
    }

    this.__resizeHandler = function () {
      _this.onResizeDebounced();
    };

    dom.bind(window, 'resize', this.__resizeHandler);
    dom.bind(this.__ul, 'webkitTransitionEnd', this.__resizeHandler);
    dom.bind(this.__ul, 'transitionend', this.__resizeHandler);
    dom.bind(this.__ul, 'oTransitionEnd', this.__resizeHandler);
    this.onResize();

    if (params.resizable) {
      addResizeHandle(this);
    }

    saveToLocalStorage = function saveToLocalStorage() {
      if (SUPPORTS_LOCAL_STORAGE && localStorage.getItem(getLocalStorageHash(_this, 'isLocal')) === 'true') {
        localStorage.setItem(getLocalStorageHash(_this, 'gui'), JSON.stringify(_this.getSaveObject()));
      }
    };

    this.saveToLocalStorageIfPossible = saveToLocalStorage;

    function resetWidth() {
      var root = _this.getRoot();

      root.width += 1;
      Common.defer(function () {
        root.width -= 1;
      });
    }

    if (!params.parent) {
      resetWidth();
    }
  };

  GUI.toggleHide = function () {
    hide = !hide;
    Common.each(hideableGuis, function (gui) {
      gui.domElement.style.display = hide ? 'none' : '';
    });
  };

  GUI.CLASS_AUTO_PLACE = 'a';
  GUI.CLASS_AUTO_PLACE_CONTAINER = 'ac';
  GUI.CLASS_MAIN = 'main';
  GUI.CLASS_CONTROLLER_ROW = 'cr';
  GUI.CLASS_TOO_TALL = 'taller-than-window';
  GUI.CLASS_CLOSED = 'closed';
  GUI.CLASS_CLOSE_BUTTON = 'close-button';
  GUI.CLASS_CLOSE_TOP = 'close-top';
  GUI.CLASS_CLOSE_BOTTOM = 'close-bottom';
  GUI.CLASS_DRAG = 'drag';
  GUI.DEFAULT_WIDTH = 245;
  GUI.TEXT_CLOSED = 'Close Controls';
  GUI.TEXT_OPEN = 'Open Controls';

  GUI._keydownHandler = function (e) {
    if (document.activeElement.type !== 'text' && (e.which === HIDE_KEY_CODE || e.keyCode === HIDE_KEY_CODE)) {
      GUI.toggleHide();
    }
  };

  dom.bind(window, 'keydown', GUI._keydownHandler, false);
  Common.extend(GUI.prototype, {
    add: function add(object, property) {
      return _add(this, object, property, {
        factoryArgs: Array.prototype.slice.call(arguments, 2)
      });
    },
    addColor: function addColor(object, property) {
      return _add(this, object, property, {
        color: true
      });
    },
    remove: function remove(controller) {
      this.__ul.removeChild(controller.__li);

      this.__controllers.splice(this.__controllers.indexOf(controller), 1);

      var _this = this;

      Common.defer(function () {
        _this.onResize();
      });
    },
    destroy: function destroy() {
      if (this.parent) {
        throw new Error('Only the root GUI should be removed with .destroy(). ' + 'For subfolders, use gui.removeFolder(folder) instead.');
      }

      if (this.autoPlace) {
        autoPlaceContainer.removeChild(this.domElement);
      }

      var _this = this;

      Common.each(this.__folders, function (subfolder) {
        _this.removeFolder(subfolder);
      });
      dom.unbind(window, 'keydown', GUI._keydownHandler, false);
      removeListeners(this);
    },
    addFolder: function addFolder(name) {
      if (this.__folders[name] !== undefined) {
        throw new Error('You already have a folder in this GUI by the' + ' name "' + name + '"');
      }

      var newGuiParams = {
        name: name,
        parent: this
      };
      newGuiParams.autoPlace = this.autoPlace;

      if (this.load && this.load.folders && this.load.folders[name]) {
        newGuiParams.closed = this.load.folders[name].closed;
        newGuiParams.load = this.load.folders[name];
      }

      var gui = new GUI(newGuiParams);
      this.__folders[name] = gui;
      var li = addRow(this, gui.domElement);
      dom.addClass(li, 'folder');
      return gui;
    },
    removeFolder: function removeFolder(folder) {
      this.__ul.removeChild(folder.domElement.parentElement);

      delete this.__folders[folder.name];

      if (this.load && this.load.folders && this.load.folders[folder.name]) {
        delete this.load.folders[folder.name];
      }

      removeListeners(folder);

      var _this = this;

      Common.each(folder.__folders, function (subfolder) {
        folder.removeFolder(subfolder);
      });
      Common.defer(function () {
        _this.onResize();
      });
    },
    open: function open() {
      this.closed = false;
    },
    close: function close() {
      this.closed = true;
    },
    hide: function hide() {
      this.domElement.style.display = 'none';
    },
    show: function show() {
      this.domElement.style.display = '';
    },
    onResize: function onResize() {
      var root = this.getRoot();

      if (root.scrollable) {
        var top = dom.getOffset(root.__ul).top;
        var h = 0;
        Common.each(root.__ul.childNodes, function (node) {
          if (!(root.autoPlace && node === root.__save_row)) {
            h += dom.getHeight(node);
          }
        });

        if (window.innerHeight - top - CLOSE_BUTTON_HEIGHT < h) {
          dom.addClass(root.domElement, GUI.CLASS_TOO_TALL);
          root.__ul.style.height = window.innerHeight - top - CLOSE_BUTTON_HEIGHT + 'px';
        } else {
          dom.removeClass(root.domElement, GUI.CLASS_TOO_TALL);
          root.__ul.style.height = 'auto';
        }
      }

      if (root.__resize_handle) {
        Common.defer(function () {
          root.__resize_handle.style.height = root.__ul.offsetHeight + 'px';
        });
      }

      if (root.__closeButton) {
        root.__closeButton.style.width = root.width + 'px';
      }
    },
    onResizeDebounced: Common.debounce(function () {
      this.onResize();
    }, 50),
    remember: function remember() {
      if (Common.isUndefined(SAVE_DIALOGUE)) {
        SAVE_DIALOGUE = new CenteredDiv();
        SAVE_DIALOGUE.domElement.innerHTML = saveDialogContents;
      }

      if (this.parent) {
        throw new Error('You can only call remember on a top level GUI.');
      }

      var _this = this;

      Common.each(Array.prototype.slice.call(arguments), function (object) {
        if (_this.__rememberedObjects.length === 0) {
          addSaveMenu(_this);
        }

        if (_this.__rememberedObjects.indexOf(object) === -1) {
          _this.__rememberedObjects.push(object);
        }
      });

      if (this.autoPlace) {
        setWidth(this, this.width);
      }
    },
    getRoot: function getRoot() {
      var gui = this;

      while (gui.parent) {
        gui = gui.parent;
      }

      return gui;
    },
    getSaveObject: function getSaveObject() {
      var toReturn = this.load;
      toReturn.closed = this.closed;

      if (this.__rememberedObjects.length > 0) {
        toReturn.preset = this.preset;

        if (!toReturn.remembered) {
          toReturn.remembered = {};
        }

        toReturn.remembered[this.preset] = getCurrentPreset(this);
      }

      toReturn.folders = {};
      Common.each(this.__folders, function (element, key) {
        toReturn.folders[key] = element.getSaveObject();
      });
      return toReturn;
    },
    save: function save() {
      if (!this.load.remembered) {
        this.load.remembered = {};
      }

      this.load.remembered[this.preset] = getCurrentPreset(this);
      markPresetModified(this, false);
      this.saveToLocalStorageIfPossible();
    },
    saveAs: function saveAs(presetName) {
      if (!this.load.remembered) {
        this.load.remembered = {};
        this.load.remembered[DEFAULT_DEFAULT_PRESET_NAME] = getCurrentPreset(this, true);
      }

      this.load.remembered[presetName] = getCurrentPreset(this);
      this.preset = presetName;
      addPresetOption(this, presetName, true);
      this.saveToLocalStorageIfPossible();
    },
    revert: function revert(gui) {
      Common.each(this.__controllers, function (controller) {
        if (!this.getRoot().load.remembered) {
          controller.setValue(controller.initialValue);
        } else {
          recallSavedValue(gui || this.getRoot(), controller);
        }

        if (controller.__onFinishChange) {
          controller.__onFinishChange.call(controller, controller.getValue());
        }
      }, this);
      Common.each(this.__folders, function (folder) {
        folder.revert(folder);
      });

      if (!gui) {
        markPresetModified(this.getRoot(), false);
      }
    },
    listen: function listen(controller) {
      var init = this.__listening.length === 0;

      this.__listening.push(controller);

      if (init) {
        updateDisplays(this.__listening);
      }
    },
    updateDisplay: function updateDisplay() {
      Common.each(this.__controllers, function (controller) {
        controller.updateDisplay();
      });
      Common.each(this.__folders, function (folder) {
        folder.updateDisplay();
      });
    }
  });

  function addRow(gui, newDom, liBefore) {
    var li = document.createElement('li');

    if (newDom) {
      li.appendChild(newDom);
    }

    if (liBefore) {
      gui.__ul.insertBefore(li, liBefore);
    } else {
      gui.__ul.appendChild(li);
    }

    gui.onResize();
    return li;
  }

  function removeListeners(gui) {
    dom.unbind(window, 'resize', gui.__resizeHandler);

    if (gui.saveToLocalStorageIfPossible) {
      dom.unbind(window, 'unload', gui.saveToLocalStorageIfPossible);
    }
  }

  function markPresetModified(gui, modified) {
    var opt = gui.__preset_select[gui.__preset_select.selectedIndex];

    if (modified) {
      opt.innerHTML = opt.value + '*';
    } else {
      opt.innerHTML = opt.value;
    }
  }

  function augmentController(gui, li, controller) {
    controller.__li = li;
    controller.__gui = gui;
    Common.extend(controller, {
      options: function options(_options) {
        if (arguments.length > 1) {
          var nextSibling = controller.__li.nextElementSibling;
          controller.remove();
          return _add(gui, controller.object, controller.property, {
            before: nextSibling,
            factoryArgs: [Common.toArray(arguments)]
          });
        }

        if (Common.isArray(_options) || Common.isObject(_options)) {
          var _nextSibling = controller.__li.nextElementSibling;
          controller.remove();
          return _add(gui, controller.object, controller.property, {
            before: _nextSibling,
            factoryArgs: [_options]
          });
        }
      },
      name: function name(_name) {
        controller.__li.firstElementChild.firstElementChild.innerHTML = _name;
        return controller;
      },
      listen: function listen() {
        controller.__gui.listen(controller);

        return controller;
      },
      remove: function remove() {
        controller.__gui.remove(controller);

        return controller;
      }
    });

    if (controller instanceof NumberControllerSlider) {
      var box = new NumberControllerBox(controller.object, controller.property, {
        min: controller.__min,
        max: controller.__max,
        step: controller.__step
      });
      Common.each(['updateDisplay', 'onChange', 'onFinishChange', 'step', 'min', 'max'], function (method) {
        var pc = controller[method];
        var pb = box[method];

        controller[method] = box[method] = function () {
          var args = Array.prototype.slice.call(arguments);
          pb.apply(box, args);
          return pc.apply(controller, args);
        };
      });
      dom.addClass(li, 'has-slider');
      controller.domElement.insertBefore(box.domElement, controller.domElement.firstElementChild);
    } else if (controller instanceof NumberControllerBox) {
      var r = function r(returned) {
        if (Common.isNumber(controller.__min) && Common.isNumber(controller.__max)) {
          var oldName = controller.__li.firstElementChild.firstElementChild.innerHTML;
          var wasListening = controller.__gui.__listening.indexOf(controller) > -1;
          controller.remove();

          var newController = _add(gui, controller.object, controller.property, {
            before: controller.__li.nextElementSibling,
            factoryArgs: [controller.__min, controller.__max, controller.__step]
          });

          newController.name(oldName);
          if (wasListening) newController.listen();
          return newController;
        }

        return returned;
      };

      controller.min = Common.compose(r, controller.min);
      controller.max = Common.compose(r, controller.max);
    } else if (controller instanceof BooleanController) {
      dom.bind(li, 'click', function () {
        dom.fakeEvent(controller.__checkbox, 'click');
      });
      dom.bind(controller.__checkbox, 'click', function (e) {
        e.stopPropagation();
      });
    } else if (controller instanceof FunctionController) {
      dom.bind(li, 'click', function () {
        dom.fakeEvent(controller.__button, 'click');
      });
      dom.bind(li, 'mouseover', function () {
        dom.addClass(controller.__button, 'hover');
      });
      dom.bind(li, 'mouseout', function () {
        dom.removeClass(controller.__button, 'hover');
      });
    } else if (controller instanceof ColorController) {
      dom.addClass(li, 'color');
      controller.updateDisplay = Common.compose(function (val) {
        li.style.borderLeftColor = controller.__color.toString();
        return val;
      }, controller.updateDisplay);
      controller.updateDisplay();
    }

    controller.setValue = Common.compose(function (val) {
      if (gui.getRoot().__preset_select && controller.isModified()) {
        markPresetModified(gui.getRoot(), true);
      }

      return val;
    }, controller.setValue);
  }

  function recallSavedValue(gui, controller) {
    var root = gui.getRoot();

    var matchedIndex = root.__rememberedObjects.indexOf(controller.object);

    if (matchedIndex !== -1) {
      var controllerMap = root.__rememberedObjectIndecesToControllers[matchedIndex];

      if (controllerMap === undefined) {
        controllerMap = {};
        root.__rememberedObjectIndecesToControllers[matchedIndex] = controllerMap;
      }

      controllerMap[controller.property] = controller;

      if (root.load && root.load.remembered) {
        var presetMap = root.load.remembered;
        var preset = void 0;

        if (presetMap[gui.preset]) {
          preset = presetMap[gui.preset];
        } else if (presetMap[DEFAULT_DEFAULT_PRESET_NAME]) {
          preset = presetMap[DEFAULT_DEFAULT_PRESET_NAME];
        } else {
          return;
        }

        if (preset[matchedIndex] && preset[matchedIndex][controller.property] !== undefined) {
          var value = preset[matchedIndex][controller.property];
          controller.initialValue = value;
          controller.setValue(value);
        }
      }
    }
  }

  function _add(gui, object, property, params) {
    if (object[property] === undefined) {
      throw new Error('Object "' + object + '" has no property "' + property + '"');
    }

    var controller = void 0;

    if (params.color) {
      controller = new ColorController(object, property);
    } else {
      var factoryArgs = [object, property].concat(params.factoryArgs);
      controller = ControllerFactory.apply(gui, factoryArgs);
    }

    if (params.before instanceof Controller) {
      params.before = params.before.__li;
    }

    recallSavedValue(gui, controller);
    dom.addClass(controller.domElement, 'c');
    var name = document.createElement('span');
    dom.addClass(name, 'property-name');
    name.innerHTML = controller.property;
    var container = document.createElement('div');
    container.appendChild(name);
    container.appendChild(controller.domElement);
    var li = addRow(gui, container, params.before);
    dom.addClass(li, GUI.CLASS_CONTROLLER_ROW);

    if (controller instanceof ColorController) {
      dom.addClass(li, 'color');
    } else {
      dom.addClass(li, _typeof$1(controller.getValue()));
    }

    augmentController(gui, li, controller);

    gui.__controllers.push(controller);

    return controller;
  }

  function getLocalStorageHash(gui, key) {
    return document.location.href + '.' + key;
  }

  function addPresetOption(gui, name, setSelected) {
    var opt = document.createElement('option');
    opt.innerHTML = name;
    opt.value = name;

    gui.__preset_select.appendChild(opt);

    if (setSelected) {
      gui.__preset_select.selectedIndex = gui.__preset_select.length - 1;
    }
  }

  function showHideExplain(gui, explain) {
    explain.style.display = gui.useLocalStorage ? 'block' : 'none';
  }

  function addSaveMenu(gui) {
    var div = gui.__save_row = document.createElement('li');
    dom.addClass(gui.domElement, 'has-save');

    gui.__ul.insertBefore(div, gui.__ul.firstChild);

    dom.addClass(div, 'save-row');
    var gears = document.createElement('span');
    gears.innerHTML = '&nbsp;';
    dom.addClass(gears, 'button gears');
    var button = document.createElement('span');
    button.innerHTML = 'Save';
    dom.addClass(button, 'button');
    dom.addClass(button, 'save');
    var button2 = document.createElement('span');
    button2.innerHTML = 'New';
    dom.addClass(button2, 'button');
    dom.addClass(button2, 'save-as');
    var button3 = document.createElement('span');
    button3.innerHTML = 'Revert';
    dom.addClass(button3, 'button');
    dom.addClass(button3, 'revert');
    var select = gui.__preset_select = document.createElement('select');

    if (gui.load && gui.load.remembered) {
      Common.each(gui.load.remembered, function (value, key) {
        addPresetOption(gui, key, key === gui.preset);
      });
    } else {
      addPresetOption(gui, DEFAULT_DEFAULT_PRESET_NAME, false);
    }

    dom.bind(select, 'change', function () {
      for (var index = 0; index < gui.__preset_select.length; index++) {
        gui.__preset_select[index].innerHTML = gui.__preset_select[index].value;
      }

      gui.preset = this.value;
    });
    div.appendChild(select);
    div.appendChild(gears);
    div.appendChild(button);
    div.appendChild(button2);
    div.appendChild(button3);

    if (SUPPORTS_LOCAL_STORAGE) {
      var explain = document.getElementById('dg-local-explain');
      var localStorageCheckBox = document.getElementById('dg-local-storage');
      var saveLocally = document.getElementById('dg-save-locally');
      saveLocally.style.display = 'block';

      if (localStorage.getItem(getLocalStorageHash(gui, 'isLocal')) === 'true') {
        localStorageCheckBox.setAttribute('checked', 'checked');
      }

      showHideExplain(gui, explain);
      dom.bind(localStorageCheckBox, 'change', function () {
        gui.useLocalStorage = !gui.useLocalStorage;
        showHideExplain(gui, explain);
      });
    }

    var newConstructorTextArea = document.getElementById('dg-new-constructor');
    dom.bind(newConstructorTextArea, 'keydown', function (e) {
      if (e.metaKey && (e.which === 67 || e.keyCode === 67)) {
        SAVE_DIALOGUE.hide();
      }
    });
    dom.bind(gears, 'click', function () {
      newConstructorTextArea.innerHTML = JSON.stringify(gui.getSaveObject(), undefined, 2);
      SAVE_DIALOGUE.show();
      newConstructorTextArea.focus();
      newConstructorTextArea.select();
    });
    dom.bind(button, 'click', function () {
      gui.save();
    });
    dom.bind(button2, 'click', function () {
      var presetName = prompt('Enter a new preset name.');

      if (presetName) {
        gui.saveAs(presetName);
      }
    });
    dom.bind(button3, 'click', function () {
      gui.revert();
    });
  }

  function addResizeHandle(gui) {
    var pmouseX = void 0;
    gui.__resize_handle = document.createElement('div');
    Common.extend(gui.__resize_handle.style, {
      width: '6px',
      marginLeft: '-3px',
      height: '200px',
      cursor: 'ew-resize',
      position: 'absolute'
    });

    function drag(e) {
      e.preventDefault();
      gui.width += pmouseX - e.clientX;
      gui.onResize();
      pmouseX = e.clientX;
      return false;
    }

    function dragStop() {
      dom.removeClass(gui.__closeButton, GUI.CLASS_DRAG);
      dom.unbind(window, 'mousemove', drag);
      dom.unbind(window, 'mouseup', dragStop);
    }

    function dragStart(e) {
      e.preventDefault();
      pmouseX = e.clientX;
      dom.addClass(gui.__closeButton, GUI.CLASS_DRAG);
      dom.bind(window, 'mousemove', drag);
      dom.bind(window, 'mouseup', dragStop);
      return false;
    }

    dom.bind(gui.__resize_handle, 'mousedown', dragStart);
    dom.bind(gui.__closeButton, 'mousedown', dragStart);
    gui.domElement.insertBefore(gui.__resize_handle, gui.domElement.firstElementChild);
  }

  function setWidth(gui, w) {
    gui.domElement.style.width = w + 'px';

    if (gui.__save_row && gui.autoPlace) {
      gui.__save_row.style.width = w + 'px';
    }

    if (gui.__closeButton) {
      gui.__closeButton.style.width = w + 'px';
    }
  }

  function getCurrentPreset(gui, useInitialValues) {
    var toReturn = {};
    Common.each(gui.__rememberedObjects, function (val, index) {
      var savedValues = {};
      var controllerMap = gui.__rememberedObjectIndecesToControllers[index];
      Common.each(controllerMap, function (controller, property) {
        savedValues[property] = useInitialValues ? controller.initialValue : controller.getValue();
      });
      toReturn[index] = savedValues;
    });
    return toReturn;
  }

  function setPresetSelectIndex(gui) {
    for (var index = 0; index < gui.__preset_select.length; index++) {
      if (gui.__preset_select[index].value === gui.preset) {
        gui.__preset_select.selectedIndex = index;
      }
    }
  }

  function updateDisplays(controllerArray) {
    if (controllerArray.length !== 0) {
      requestAnimationFrame$1$1.call(window, function () {
        updateDisplays(controllerArray);
      });
    }

    Common.each(controllerArray, function (c) {
      c.updateDisplay();
    });
  }

  var GUI$1 = GUI;

  var DemoManagerEvent = function (_Event) {
    _inherits(DemoManagerEvent, _Event);

    function DemoManagerEvent(type) {
      var _this3;

      _classCallCheck(this, DemoManagerEvent);

      _this3 = _possibleConstructorReturn(this, _getPrototypeOf(DemoManagerEvent).call(this, type));
      _this3.previousDemo = null;
      _this3.demo = null;
      return _this3;
    }

    return DemoManagerEvent;
  }(Event);

  var change = new DemoManagerEvent("change");
  var load = new DemoManagerEvent("load");

  var DemoManager = function (_EventTarget) {
    _inherits(DemoManager, _EventTarget);

    function DemoManager(viewport) {
      var _this4;

      var _ref3 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
          _ref3$aside = _ref3.aside,
          aside = _ref3$aside === void 0 ? viewport : _ref3$aside,
          renderer = _ref3.renderer;

      _classCallCheck(this, DemoManager);

      _this4 = _possibleConstructorReturn(this, _getPrototypeOf(DemoManager).call(this));
      _this4.renderer = renderer !== undefined ? renderer : function () {
        var renderer = new three.WebGLRenderer();
        renderer.setSize(viewport.clientWidth, viewport.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        return renderer;
      }();
      viewport.appendChild(_this4.renderer.domElement);
      _this4.clock = new three.Clock();
      _this4.menu = new GUI$1({
        autoPlace: false
      });
      aside.appendChild(_this4.menu.domElement);
      _this4.demos = new Map();
      _this4.demo = null;
      _this4.currentDemo = null;
      return _this4;
    }

    _createClass(DemoManager, [{
      key: "resetMenu",
      value: function resetMenu() {
        var _this5 = this;

        var node = this.menu.domElement.parentNode;
        var menu = new GUI$1({
          autoPlace: false
        });

        if (this.demos.size > 1) {
          var selection = menu.add(this, "demo", Array.from(this.demos.keys()));
          selection.onChange(function () {
            return _this5.loadDemo();
          });
        }

        node.removeChild(this.menu.domElement);
        node.appendChild(menu.domElement);
        this.menu.destroy();
        this.menu = menu;
        return menu;
      }
    }, {
      key: "startDemo",
      value: function startDemo(demo) {
        if (demo.id === this.demo) {
          demo.initialize();
          demo.registerOptions(this.resetMenu());
          demo.ready = true;
          load.demo = demo;
          this.dispatchEvent(load);
        }
      }
    }, {
      key: "loadDemo",
      value: function loadDemo() {
        var _this6 = this;

        var nextDemo = this.demos.get(this.demo);
        var currentDemo = this.currentDemo;
        var renderer = this.renderer;
        window.location.hash = nextDemo.id;

        if (currentDemo !== null) {
          currentDemo.reset();
        }

        this.menu.domElement.style.display = "none";
        change.previousDemo = currentDemo;
        change.demo = nextDemo;
        this.currentDemo = nextDemo;
        this.dispatchEvent(change);
        renderer.clear();
        nextDemo.load().then(function () {
          return _this6.startDemo(nextDemo);
        })["catch"](console.error);
      }
    }, {
      key: "addDemo",
      value: function addDemo(demo) {
        var hash = window.location.hash.slice(1);
        var currentDemo = this.currentDemo;
        this.demos.set(demo.id, demo.setRenderer(this.renderer));

        if (this.demo === null && hash.length === 0 || demo.id === hash) {
          this.demo = demo.id;
          this.loadDemo();
        }

        this.resetMenu();

        if (currentDemo !== null && currentDemo.ready) {
          currentDemo.registerOptions(this.menu);
        }

        return this;
      }
    }, {
      key: "removeDemo",
      value: function removeDemo(id) {
        var demos = this.demos;
        var firstEntry;

        if (demos.has(id)) {
          demos["delete"](id);

          if (this.demo === id && demos.size > 0) {
            firstEntry = demos.entries().next().value;
            this.demo = firstEntry[0];
            this.currentDemo = firstEntry[1];
            this.loadDemo();
          } else {
            this.demo = null;
            this.currentDemo = null;
            this.renderer.clear();
          }
        }

        return this;
      }
    }, {
      key: "setSize",
      value: function setSize(width, height) {
        var demo = this.currentDemo;
        this.renderer.setSize(width, height);

        if (demo !== null && demo.camera !== null) {
          var camera = demo.camera;

          if (camera instanceof three.OrthographicCamera) {
            camera.left = width / -2.0;
            camera.right = width / 2.0;
            camera.top = height / 2.0;
            camera.bottom = height / -2.0;
            camera.updateProjectionMatrix();
          } else if (!(camera instanceof three.CubeCamera)) {
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
          }
        }
      }
    }, {
      key: "render",
      value: function render(now) {
        var demo = this.currentDemo;
        var delta = this.clock.getDelta();

        if (demo !== null && demo.ready) {
          demo.render(delta);
        }
      }
    }]);

    return DemoManager;
  }(EventTarget);

  var fragmentShader = "uniform sampler2D previousLuminanceBuffer;uniform sampler2D currentLuminanceBuffer;uniform float minLuminance;uniform float deltaTime;uniform float tau;varying vec2 vUv;void main(){float previousLuminance=texture2D(previousLuminanceBuffer,vUv,MIP_LEVEL_1X1).r;float currentLuminance=texture2D(currentLuminanceBuffer,vUv,MIP_LEVEL_1X1).r;previousLuminance=max(minLuminance,previousLuminance);currentLuminance=max(minLuminance,currentLuminance);float adaptedLum=previousLuminance+(currentLuminance-previousLuminance)*(1.0-exp(-deltaTime*tau));gl_FragColor.r=adaptedLum;}";
  var vertexShader = "varying vec2 vUv;void main(){vUv=position.xy*0.5+0.5;gl_Position=vec4(position.xy,1.0,1.0);}";

  var AdaptiveLuminanceMaterial = function (_ShaderMaterial) {
    _inherits(AdaptiveLuminanceMaterial, _ShaderMaterial);

    function AdaptiveLuminanceMaterial() {
      _classCallCheck(this, AdaptiveLuminanceMaterial);

      return _possibleConstructorReturn(this, _getPrototypeOf(AdaptiveLuminanceMaterial).call(this, {
        type: "AdaptiveLuminanceMaterial",
        defines: {
          MIP_LEVEL_1X1: "0.0"
        },
        uniforms: {
          previousLuminanceBuffer: new three.Uniform(null),
          currentLuminanceBuffer: new three.Uniform(null),
          minLuminance: new three.Uniform(0.01),
          deltaTime: new three.Uniform(0.0),
          tau: new three.Uniform(1.0)
        },
        fragmentShader: fragmentShader,
        vertexShader: vertexShader,
        depthWrite: false,
        depthTest: false
      }));
    }

    return AdaptiveLuminanceMaterial;
  }(three.ShaderMaterial);

  var fragmentShader$1 = "uniform sampler2D inputBuffer;varying vec2 vUv;varying vec2 vUv0;varying vec2 vUv1;varying vec2 vUv2;varying vec2 vUv3;varying vec2 vUv4;varying vec2 vUv5;void main(){const vec2 threshold=vec2(EDGE_THRESHOLD);vec4 delta;vec3 c=texture2D(inputBuffer,vUv).rgb;vec3 cLeft=texture2D(inputBuffer,vUv0).rgb;vec3 t=abs(c-cLeft);delta.x=max(max(t.r,t.g),t.b);vec3 cTop=texture2D(inputBuffer,vUv1).rgb;t=abs(c-cTop);delta.y=max(max(t.r,t.g),t.b);vec2 edges=step(threshold,delta.xy);if(dot(edges,vec2(1.0))==0.0){discard;}vec3 cRight=texture2D(inputBuffer,vUv2).rgb;t=abs(c-cRight);delta.z=max(max(t.r,t.g),t.b);vec3 cBottom=texture2D(inputBuffer,vUv3).rgb;t=abs(c-cBottom);delta.w=max(max(t.r,t.g),t.b);float maxDelta=max(max(max(delta.x,delta.y),delta.z),delta.w);vec3 cLeftLeft=texture2D(inputBuffer,vUv4).rgb;t=abs(c-cLeftLeft);delta.z=max(max(t.r,t.g),t.b);vec3 cTopTop=texture2D(inputBuffer,vUv5).rgb;t=abs(c-cTopTop);delta.w=max(max(t.r,t.g),t.b);maxDelta=max(max(maxDelta,delta.z),delta.w);edges*=step(maxDelta,LOCAL_CONTRAST_ADAPTATION_FACTOR*delta.xy);gl_FragColor=vec4(edges,0.0,1.0);}";
  var vertexShader$1 = "uniform vec2 texelSize;varying vec2 vUv;varying vec2 vUv0;varying vec2 vUv1;varying vec2 vUv2;varying vec2 vUv3;varying vec2 vUv4;varying vec2 vUv5;void main(){vUv=position.xy*0.5+0.5;vUv0=vUv+texelSize*vec2(-1.0,0.0);vUv1=vUv+texelSize*vec2(0.0,-1.0);vUv2=vUv+texelSize*vec2(1.0,0.0);vUv3=vUv+texelSize*vec2(0.0,1.0);vUv4=vUv+texelSize*vec2(-2.0,0.0);vUv5=vUv+texelSize*vec2(0.0,-2.0);gl_Position=vec4(position.xy,1.0,1.0);}";

  var ColorEdgesMaterial = function (_ShaderMaterial2) {
    _inherits(ColorEdgesMaterial, _ShaderMaterial2);

    function ColorEdgesMaterial() {
      var texelSize = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : new three.Vector2();

      _classCallCheck(this, ColorEdgesMaterial);

      return _possibleConstructorReturn(this, _getPrototypeOf(ColorEdgesMaterial).call(this, {
        type: "ColorEdgesMaterial",
        defines: {
          LOCAL_CONTRAST_ADAPTATION_FACTOR: "2.0",
          EDGE_THRESHOLD: "0.1"
        },
        uniforms: {
          inputBuffer: new three.Uniform(null),
          texelSize: new three.Uniform(texelSize)
        },
        fragmentShader: fragmentShader$1,
        vertexShader: vertexShader$1,
        depthWrite: false,
        depthTest: false
      }));
    }

    _createClass(ColorEdgesMaterial, [{
      key: "setLocalContrastAdaptationFactor",
      value: function setLocalContrastAdaptationFactor(factor) {
        this.defines.LOCAL_CONTRAST_ADAPTATION_FACTOR = factor.toFixed("2");
        this.needsUpdate = true;
      }
    }, {
      key: "setEdgeDetectionThreshold",
      value: function setEdgeDetectionThreshold(threshold) {
        threshold = Math.min(Math.max(threshold, 0.05), 0.5);
        this.defines.EDGE_THRESHOLD = threshold.toFixed("2");
        this.needsUpdate = true;
      }
    }]);

    return ColorEdgesMaterial;
  }(three.ShaderMaterial);

  var fragmentShader$2 = "#include <common>\n#include <dithering_pars_fragment>\nuniform sampler2D inputBuffer;varying vec2 vUv0;varying vec2 vUv1;varying vec2 vUv2;varying vec2 vUv3;void main(){vec4 sum=texture2D(inputBuffer,vUv0);sum+=texture2D(inputBuffer,vUv1);sum+=texture2D(inputBuffer,vUv2);sum+=texture2D(inputBuffer,vUv3);gl_FragColor=sum*0.25;\n#include <dithering_fragment>\n}";
  var vertexShader$2 = "uniform vec2 texelSize;uniform vec2 halfTexelSize;uniform float kernel;uniform float scale;/*Packing multiple texture coordinates into one varying and using a swizzle toextract them in the fragment shader still causes a dependent texture read.*/varying vec2 vUv0;varying vec2 vUv1;varying vec2 vUv2;varying vec2 vUv3;void main(){vec2 uv=position.xy*0.5+0.5;vec2 dUv=(texelSize*vec2(kernel)+halfTexelSize)*scale;vUv0=vec2(uv.x-dUv.x,uv.y+dUv.y);vUv1=vec2(uv.x+dUv.x,uv.y+dUv.y);vUv2=vec2(uv.x+dUv.x,uv.y-dUv.y);vUv3=vec2(uv.x-dUv.x,uv.y-dUv.y);gl_Position=vec4(position.xy,1.0,1.0);}";

  var ConvolutionMaterial = function (_ShaderMaterial3) {
    _inherits(ConvolutionMaterial, _ShaderMaterial3);

    function ConvolutionMaterial() {
      var _this7;

      var texelSize = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : new three.Vector2();

      _classCallCheck(this, ConvolutionMaterial);

      _this7 = _possibleConstructorReturn(this, _getPrototypeOf(ConvolutionMaterial).call(this, {
        type: "ConvolutionMaterial",
        uniforms: {
          inputBuffer: new three.Uniform(null),
          texelSize: new three.Uniform(new three.Vector2()),
          halfTexelSize: new three.Uniform(new three.Vector2()),
          kernel: new three.Uniform(0.0),
          scale: new three.Uniform(1.0)
        },
        fragmentShader: fragmentShader$2,
        vertexShader: vertexShader$2,
        depthWrite: false,
        depthTest: false
      }));

      _this7.setTexelSize(texelSize.x, texelSize.y);

      _this7.kernelSize = KernelSize.LARGE;
      return _this7;
    }

    _createClass(ConvolutionMaterial, [{
      key: "getKernel",
      value: function getKernel() {
        return kernelPresets[this.kernelSize];
      }
    }, {
      key: "setTexelSize",
      value: function setTexelSize(x, y) {
        this.uniforms.texelSize.value.set(x, y);
        this.uniforms.halfTexelSize.value.set(x, y).multiplyScalar(0.5);
      }
    }]);

    return ConvolutionMaterial;
  }(three.ShaderMaterial);

  var kernelPresets = [new Float32Array([0.0, 0.0]), new Float32Array([0.0, 1.0, 1.0]), new Float32Array([0.0, 1.0, 1.0, 2.0]), new Float32Array([0.0, 1.0, 2.0, 2.0, 3.0]), new Float32Array([0.0, 1.0, 2.0, 3.0, 4.0, 4.0, 5.0]), new Float32Array([0.0, 1.0, 2.0, 3.0, 4.0, 5.0, 7.0, 8.0, 9.0, 10.0])];
  var KernelSize = {
    VERY_SMALL: 0,
    SMALL: 1,
    MEDIUM: 2,
    LARGE: 3,
    VERY_LARGE: 4,
    HUGE: 5
  };
  var fragmentShader$3 = "uniform sampler2D inputBuffer;uniform float opacity;varying vec2 vUv;void main(){vec4 texel=texture2D(inputBuffer,vUv);gl_FragColor=opacity*texel;}";

  var CopyMaterial = function (_ShaderMaterial4) {
    _inherits(CopyMaterial, _ShaderMaterial4);

    function CopyMaterial() {
      _classCallCheck(this, CopyMaterial);

      return _possibleConstructorReturn(this, _getPrototypeOf(CopyMaterial).call(this, {
        type: "CopyMaterial",
        uniforms: {
          inputBuffer: new three.Uniform(null),
          opacity: new three.Uniform(1.0)
        },
        fragmentShader: fragmentShader$3,
        vertexShader: vertexShader,
        depthWrite: false,
        depthTest: false
      }));
    }

    return CopyMaterial;
  }(three.ShaderMaterial);

  var fragmentShader$4 = "#include <packing>\n#include <clipping_planes_pars_fragment>\nuniform sampler2D depthBuffer;uniform float cameraNear;uniform float cameraFar;varying float vViewZ;varying vec4 vProjTexCoord;void main(){\n#include <clipping_planes_fragment>\nvec2 projTexCoord=(vProjTexCoord.xy/vProjTexCoord.w)*0.5+0.5;projTexCoord=clamp(projTexCoord,0.002,0.998);float fragCoordZ=unpackRGBAToDepth(texture2D(depthBuffer,projTexCoord));\n#ifdef PERSPECTIVE_CAMERA\nfloat viewZ=perspectiveDepthToViewZ(fragCoordZ,cameraNear,cameraFar);\n#else\nfloat viewZ=orthographicDepthToViewZ(fragCoordZ,cameraNear,cameraFar);\n#endif\nfloat depthTest=(-vViewZ>-viewZ)? 1.0 : 0.0;gl_FragColor.rg=vec2(0.0,depthTest);}";
  var vertexShader$3 = "#include <common>\n#include <morphtarget_pars_vertex>\n#include <skinning_pars_vertex>\n#include <clipping_planes_pars_vertex>\nvarying float vViewZ;varying vec4 vProjTexCoord;void main(){\n#include <skinbase_vertex>\n#include <begin_vertex>\n#include <morphtarget_vertex>\n#include <skinning_vertex>\n#include <project_vertex>\nvViewZ=mvPosition.z;vProjTexCoord=gl_Position;\n#include <clipping_planes_vertex>\n}";

  var DepthComparisonMaterial = function (_ShaderMaterial5) {
    _inherits(DepthComparisonMaterial, _ShaderMaterial5);

    function DepthComparisonMaterial() {
      var _this8;

      var depthTexture = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      var camera = arguments.length > 1 ? arguments[1] : undefined;

      _classCallCheck(this, DepthComparisonMaterial);

      _this8 = _possibleConstructorReturn(this, _getPrototypeOf(DepthComparisonMaterial).call(this, {
        type: "DepthComparisonMaterial",
        uniforms: {
          depthBuffer: new three.Uniform(depthTexture),
          cameraNear: new three.Uniform(0.3),
          cameraFar: new three.Uniform(1000)
        },
        fragmentShader: fragmentShader$4,
        vertexShader: vertexShader$3,
        depthWrite: false,
        depthTest: false,
        morphTargets: true,
        skinning: true
      }));

      _this8.adoptCameraSettings(camera);

      return _this8;
    }

    _createClass(DepthComparisonMaterial, [{
      key: "adoptCameraSettings",
      value: function adoptCameraSettings() {
        var camera = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

        if (camera !== null) {
          this.uniforms.cameraNear.value = camera.near;
          this.uniforms.cameraFar.value = camera.far;

          if (camera instanceof three.PerspectiveCamera) {
            this.defines.PERSPECTIVE_CAMERA = "1";
          } else {
            delete this.defines.PERSPECTIVE_CAMERA;
          }
        }
      }
    }]);

    return DepthComparisonMaterial;
  }(three.ShaderMaterial);

  var fragmentShader$5 = "uniform sampler2D depthBuffer0;uniform sampler2D depthBuffer1;uniform sampler2D inputBuffer;varying vec2 vUv;void main(){float d0=texture2D(depthBuffer0,vUv).r;float d1=texture2D(depthBuffer1,vUv).r;if(d0<d1){discard;}gl_FragColor=texture2D(inputBuffer,vUv);}";

  var DepthMaskMaterial = function (_ShaderMaterial6) {
    _inherits(DepthMaskMaterial, _ShaderMaterial6);

    function DepthMaskMaterial() {
      _classCallCheck(this, DepthMaskMaterial);

      return _possibleConstructorReturn(this, _getPrototypeOf(DepthMaskMaterial).call(this, {
        type: "DepthMaskMaterial",
        uniforms: {
          depthBuffer0: new three.Uniform(null),
          depthBuffer1: new three.Uniform(null),
          inputBuffer: new three.Uniform(null)
        },
        fragmentShader: fragmentShader$5,
        vertexShader: vertexShader,
        depthWrite: false,
        depthTest: false
      }));
    }

    return DepthMaskMaterial;
  }(three.ShaderMaterial);

  var fragmentTemplate = "#include <common>\n#include <packing>\n#include <dithering_pars_fragment>\nuniform sampler2D inputBuffer;uniform sampler2D depthBuffer;uniform vec2 resolution;uniform vec2 texelSize;uniform float cameraNear;uniform float cameraFar;uniform float aspect;uniform float time;varying vec2 vUv;float readDepth(const in vec2 uv){\n#if DEPTH_PACKING == 3201\nreturn unpackRGBAToDepth(texture2D(depthBuffer,uv));\n#else\nreturn texture2D(depthBuffer,uv).r;\n#endif\n}FRAGMENT_HEADvoid main(){FRAGMENT_MAIN_UVvec4 color0=texture2D(inputBuffer,UV);vec4 color1=vec4(0.0);FRAGMENT_MAIN_IMAGEgl_FragColor=color0;\n#include <dithering_fragment>\n}";
  var vertexTemplate = "uniform vec2 resolution;uniform vec2 texelSize;uniform float cameraNear;uniform float cameraFar;uniform float aspect;uniform float time;varying vec2 vUv;VERTEX_HEADvoid main(){vUv=position.xy*0.5+0.5;VERTEX_MAIN_SUPPORTgl_Position=vec4(position.xy,1.0,1.0);}";

  var EffectMaterial = function (_ShaderMaterial7) {
    _inherits(EffectMaterial, _ShaderMaterial7);

    function EffectMaterial(shaderParts, defines, uniforms) {
      var _this9;

      var camera = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
      var dithering = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;

      _classCallCheck(this, EffectMaterial);

      _this9 = _possibleConstructorReturn(this, _getPrototypeOf(EffectMaterial).call(this, {
        type: "EffectMaterial",
        defines: {
          DEPTH_PACKING: "0"
        },
        uniforms: {
          inputBuffer: new three.Uniform(null),
          depthBuffer: new three.Uniform(null),
          resolution: new three.Uniform(new three.Vector2()),
          texelSize: new three.Uniform(new three.Vector2()),
          cameraNear: new three.Uniform(0.3),
          cameraFar: new three.Uniform(1000.0),
          aspect: new three.Uniform(1.0),
          time: new three.Uniform(0.0)
        },
        fragmentShader: fragmentTemplate.replace(Section.FRAGMENT_HEAD, shaderParts.get(Section.FRAGMENT_HEAD)).replace(Section.FRAGMENT_MAIN_UV, shaderParts.get(Section.FRAGMENT_MAIN_UV)).replace(Section.FRAGMENT_MAIN_IMAGE, shaderParts.get(Section.FRAGMENT_MAIN_IMAGE)),
        vertexShader: vertexTemplate.replace(Section.VERTEX_HEAD, shaderParts.get(Section.VERTEX_HEAD)).replace(Section.VERTEX_MAIN_SUPPORT, shaderParts.get(Section.VERTEX_MAIN_SUPPORT)),
        dithering: dithering,
        depthWrite: false,
        depthTest: false
      }));

      if (defines !== null) {
        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
          for (var _iterator3 = defines.entries()[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            var entry = _step3.value;
            _this9.defines[entry[0]] = entry[1];
          }
        } catch (err) {
          _didIteratorError3 = true;
          _iteratorError3 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion3 && _iterator3["return"] != null) {
              _iterator3["return"]();
            }
          } finally {
            if (_didIteratorError3) {
              throw _iteratorError3;
            }
          }
        }
      }

      if (uniforms !== null) {
        var _iteratorNormalCompletion4 = true;
        var _didIteratorError4 = false;
        var _iteratorError4 = undefined;

        try {
          for (var _iterator4 = uniforms.entries()[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
            var _entry = _step4.value;
            _this9.uniforms[_entry[0]] = _entry[1];
          }
        } catch (err) {
          _didIteratorError4 = true;
          _iteratorError4 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion4 && _iterator4["return"] != null) {
              _iterator4["return"]();
            }
          } finally {
            if (_didIteratorError4) {
              throw _iteratorError4;
            }
          }
        }
      }

      _this9.adoptCameraSettings(camera);

      return _this9;
    }

    _createClass(EffectMaterial, [{
      key: "setSize",
      value: function setSize(width, height) {
        width = Math.max(width, 1.0);
        height = Math.max(height, 1.0);
        this.uniforms.resolution.value.set(width, height);
        this.uniforms.texelSize.value.set(1.0 / width, 1.0 / height);
        this.uniforms.aspect.value = width / height;
      }
    }, {
      key: "adoptCameraSettings",
      value: function adoptCameraSettings() {
        var camera = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

        if (camera !== null) {
          this.uniforms.cameraNear.value = camera.near;
          this.uniforms.cameraFar.value = camera.far;

          if (camera instanceof three.PerspectiveCamera) {
            this.defines.PERSPECTIVE_CAMERA = "1";
          } else {
            delete this.defines.PERSPECTIVE_CAMERA;
          }
        }
      }
    }, {
      key: "depthPacking",
      get: function get() {
        return Number.parseInt(this.defines.DEPTH_PACKING);
      },
      set: function set(value) {
        this.defines.DEPTH_PACKING = value.toFixed(0);
      }
    }]);

    return EffectMaterial;
  }(three.ShaderMaterial);

  var Section = {
    FRAGMENT_HEAD: "FRAGMENT_HEAD",
    FRAGMENT_MAIN_UV: "FRAGMENT_MAIN_UV",
    FRAGMENT_MAIN_IMAGE: "FRAGMENT_MAIN_IMAGE",
    VERTEX_HEAD: "VERTEX_HEAD",
    VERTEX_MAIN_SUPPORT: "VERTEX_MAIN_SUPPORT"
  };
  var fragmentShader$6 = "#include <common>\n#include <dithering_pars_fragment>\nuniform sampler2D inputBuffer;uniform vec2 lightPosition;uniform float exposure;uniform float decay;uniform float density;uniform float weight;uniform float clampMax;varying vec2 vUv;void main(){vec2 coord=vUv;vec2 delta=coord-lightPosition;delta*=1.0/SAMPLES_FLOAT*density;float illuminationDecay=1.0;vec4 texel;vec4 color=vec4(0.0);/*Estimate the probability of occlusion at each pixel by summing samplesalong a ray to the light position.*/for(int i=0;i<SAMPLES_INT;++i){coord-=delta;texel=texture2D(inputBuffer,coord);texel*=illuminationDecay*weight;color+=texel;illuminationDecay*=decay;}gl_FragColor=clamp(color*exposure,0.0,clampMax);\n#include <dithering_fragment>\n}";

  var GodRaysMaterial = function (_ShaderMaterial8) {
    _inherits(GodRaysMaterial, _ShaderMaterial8);

    function GodRaysMaterial(lightPosition) {
      _classCallCheck(this, GodRaysMaterial);

      return _possibleConstructorReturn(this, _getPrototypeOf(GodRaysMaterial).call(this, {
        type: "GodRaysMaterial",
        defines: {
          SAMPLES_INT: "60",
          SAMPLES_FLOAT: "60.0"
        },
        uniforms: {
          inputBuffer: new three.Uniform(null),
          lightPosition: new three.Uniform(lightPosition),
          density: new three.Uniform(1.0),
          decay: new three.Uniform(1.0),
          weight: new three.Uniform(1.0),
          exposure: new three.Uniform(1.0),
          clampMax: new three.Uniform(1.0)
        },
        fragmentShader: fragmentShader$6,
        vertexShader: vertexShader,
        depthWrite: false,
        depthTest: false
      }));
    }

    _createClass(GodRaysMaterial, [{
      key: "samples",
      get: function get() {
        return Number.parseInt(this.defines.SAMPLES_INT);
      },
      set: function set(value) {
        value = Math.floor(value);
        this.defines.SAMPLES_INT = value.toFixed(0);
        this.defines.SAMPLES_FLOAT = value.toFixed(1);
        this.needsUpdate = true;
      }
    }]);

    return GodRaysMaterial;
  }(three.ShaderMaterial);

  var fragmentShader$7 = "#include <common>\nuniform sampler2D inputBuffer;\n#ifdef RANGE\nuniform vec2 range;\n#elif defined(THRESHOLD)\nuniform float threshold;uniform float smoothing;\n#endif\nvarying vec2 vUv;void main(){vec4 texel=texture2D(inputBuffer,vUv);float l=linearToRelativeLuminance(texel.rgb);\n#ifdef RANGE\nfloat low=step(range.x,l);float high=step(l,range.y);l*=low*high;\n#elif defined(THRESHOLD)\nl=smoothstep(threshold,threshold+smoothing,l);\n#endif\n#ifdef COLOR\ngl_FragColor=vec4(texel.rgb*l,l);\n#else\ngl_FragColor=vec4(l);\n#endif\n}";

  var LuminanceMaterial = function (_ShaderMaterial9) {
    _inherits(LuminanceMaterial, _ShaderMaterial9);

    function LuminanceMaterial() {
      var _this10;

      var colorOutput = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
      var luminanceRange = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

      _classCallCheck(this, LuminanceMaterial);

      var useRange = luminanceRange !== null;
      _this10 = _possibleConstructorReturn(this, _getPrototypeOf(LuminanceMaterial).call(this, {
        type: "LuminanceMaterial",
        uniforms: {
          inputBuffer: new three.Uniform(null),
          threshold: new three.Uniform(0.0),
          smoothing: new three.Uniform(1.0),
          range: new three.Uniform(useRange ? luminanceRange : new three.Vector2())
        },
        fragmentShader: fragmentShader$7,
        vertexShader: vertexShader,
        depthWrite: false,
        depthTest: false
      }));
      _this10.colorOutput = colorOutput;
      _this10.useThreshold = true;
      _this10.useRange = useRange;
      return _this10;
    }

    _createClass(LuminanceMaterial, [{
      key: "setColorOutputEnabled",
      value: function setColorOutputEnabled(enabled) {
        enabled ? this.defines.COLOR = "1" : delete this.defines.COLOR;
        this.needsUpdate = true;
      }
    }, {
      key: "setLuminanceRangeEnabled",
      value: function setLuminanceRangeEnabled(enabled) {
        enabled ? this.defines.RANGE = "1" : delete this.defines.RANGE;
        this.needsUpdate = true;
      }
    }, {
      key: "threshold",
      get: function get() {
        return this.uniforms.threshold.value;
      },
      set: function set(value) {
        this.uniforms.threshold.value = value;
      }
    }, {
      key: "smoothing",
      get: function get() {
        return this.uniforms.smoothing.value;
      },
      set: function set(value) {
        this.uniforms.smoothing.value = value;
      }
    }, {
      key: "useThreshold",
      get: function get() {
        return this.defines.THRESHOLD !== undefined;
      },
      set: function set(value) {
        value ? this.defines.THRESHOLD = "1" : delete this.defines.THRESHOLD;
        this.needsUpdate = true;
      }
    }, {
      key: "colorOutput",
      get: function get() {
        return this.defines.COLOR !== undefined;
      },
      set: function set(value) {
        value ? this.defines.COLOR = "1" : delete this.defines.COLOR;
        this.needsUpdate = true;
      }
    }, {
      key: "useRange",
      get: function get() {
        return this.defines.RANGE !== undefined;
      },
      set: function set(value) {
        value ? this.defines.RANGE = "1" : delete this.defines.RANGE;
        this.needsUpdate = true;
      }
    }, {
      key: "luminanceRange",
      get: function get() {
        return this.defines.RANGE !== undefined;
      },
      set: function set(value) {
        value ? this.defines.RANGE = "1" : delete this.defines.RANGE;
        this.needsUpdate = true;
      }
    }]);

    return LuminanceMaterial;
  }(three.ShaderMaterial);

  var fragmentShader$8 = "uniform sampler2D maskTexture;varying vec2 vUv0;varying vec2 vUv1;varying vec2 vUv2;varying vec2 vUv3;void main(){vec2 c0=texture2D(maskTexture,vUv0).rg;vec2 c1=texture2D(maskTexture,vUv1).rg;vec2 c2=texture2D(maskTexture,vUv2).rg;vec2 c3=texture2D(maskTexture,vUv3).rg;float d0=(c0.x-c1.x)*0.5;float d1=(c2.x-c3.x)*0.5;float d=length(vec2(d0,d1));float a0=min(c0.y,c1.y);float a1=min(c2.y,c3.y);float visibilityFactor=min(a0,a1);gl_FragColor.rg=(1.0-visibilityFactor>0.001)? vec2(d,0.0): vec2(0.0,d);}";
  var vertexShader$4 = "uniform vec2 texelSize;varying vec2 vUv0;varying vec2 vUv1;varying vec2 vUv2;varying vec2 vUv3;void main(){vec2 uv=position.xy*0.5+0.5;vUv0=vec2(uv.x+texelSize.x,uv.y);vUv1=vec2(uv.x-texelSize.x,uv.y);vUv2=vec2(uv.x,uv.y+texelSize.y);vUv3=vec2(uv.x,uv.y-texelSize.y);gl_Position=vec4(position.xy,1.0,1.0);}";

  var OutlineEdgesMaterial = function (_ShaderMaterial10) {
    _inherits(OutlineEdgesMaterial, _ShaderMaterial10);

    function OutlineEdgesMaterial() {
      var _this11;

      var texelSize = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : new three.Vector2();

      _classCallCheck(this, OutlineEdgesMaterial);

      _this11 = _possibleConstructorReturn(this, _getPrototypeOf(OutlineEdgesMaterial).call(this, {
        type: "OutlineEdgesMaterial",
        uniforms: {
          maskTexture: new three.Uniform(null),
          texelSize: new three.Uniform(new three.Vector2())
        },
        fragmentShader: fragmentShader$8,
        vertexShader: vertexShader$4,
        depthWrite: false,
        depthTest: false
      }));

      _this11.setTexelSize(texelSize.x, texelSize.y);

      return _this11;
    }

    _createClass(OutlineEdgesMaterial, [{
      key: "setTexelSize",
      value: function setTexelSize(x, y) {
        this.uniforms.texelSize.value.set(x, y);
      }
    }]);

    return OutlineEdgesMaterial;
  }(three.ShaderMaterial);

  var fragmentShader$9 = "#define sampleLevelZeroOffset(t, coord, offset) texture2D(t, coord + offset * texelSize)\n#if __VERSION__ < 300\n#define round(v) floor(v + 0.5)\n#endif\nuniform sampler2D inputBuffer;uniform sampler2D areaTexture;uniform sampler2D searchTexture;uniform vec2 texelSize;uniform vec2 resolution;varying vec2 vUv;varying vec4 vOffset[3];varying vec2 vPixCoord;/***Moves values to a target vector based on a given conditional vector.*/void movec(const in bvec2 c,inout vec2 variable,const in vec2 value){if(c.x){variable.x=value.x;}if(c.y){variable.y=value.y;}}void movec(const in bvec4 c,inout vec4 variable,const in vec4 value){movec(c.xy,variable.xy,value.xy);movec(c.zw,variable.zw,value.zw);}/***Allows to decode two binary values from a bilinear-filtered access.**Bilinear access for fetching 'e' have a 0.25 offset,and we are interested*in the R and G edges:**+---G---+-------+*|x o R   x|*+-------+-------+**Then,if one of these edge is enabled:*Red:(0.75*X+0.25*1)=>0.25 or 1.0*Green:(0.75*1+0.25*X)=>0.75 or 1.0**This function will unpack the values(mad+mul+round):*wolframalpha.com: round(x*abs(5*x-5*0.75))plot 0 to 1*/vec2 decodeDiagBilinearAccess(in vec2 e){e.r=e.r*abs(5.0*e.r-5.0*0.75);return round(e);}vec4 decodeDiagBilinearAccess(in vec4 e){e.rb=e.rb*abs(5.0*e.rb-5.0*0.75);return round(e);}/***Diagonal pattern searches.*/vec2 searchDiag1(const in vec2 texCoord,const in vec2 dir,out vec2 e){vec4 coord=vec4(texCoord,-1.0,1.0);vec3 t=vec3(texelSize,1.0);for(int i=0;i<MAX_SEARCH_STEPS_INT;++i){if(!(coord.z<float(MAX_SEARCH_STEPS_DIAG_INT-1)&&coord.w>0.9)){break;}coord.xyz=t*vec3(dir,1.0)+coord.xyz;e=texture2D(inputBuffer,coord.xy).rg;coord.w=dot(e,vec2(0.5));}return coord.zw;}vec2 searchDiag2(const in vec2 texCoord,const in vec2 dir,out vec2 e){vec4 coord=vec4(texCoord,-1.0,1.0);coord.x+=0.25*texelSize.x;vec3 t=vec3(texelSize,1.0);for(int i=0;i<MAX_SEARCH_STEPS_INT;++i){if(!(coord.z<float(MAX_SEARCH_STEPS_DIAG_INT-1)&&coord.w>0.9)){break;}coord.xyz=t*vec3(dir,1.0)+coord.xyz;e=texture2D(inputBuffer,coord.xy).rg;e=decodeDiagBilinearAccess(e);coord.w=dot(e,vec2(0.5));}return coord.zw;}/***Calculates the area corresponding to a certain diagonal distance and crossing*edges 'e'.*/vec2 areaDiag(const in vec2 dist,const in vec2 e,const in float offset){vec2 texCoord=vec2(AREATEX_MAX_DISTANCE_DIAG,AREATEX_MAX_DISTANCE_DIAG)*e+dist;texCoord=AREATEX_PIXEL_SIZE*texCoord+0.5*AREATEX_PIXEL_SIZE;texCoord.x+=0.5;texCoord.y+=AREATEX_SUBTEX_SIZE*offset;return texture2D(areaTexture,texCoord).rg;}/***Searches for diagonal patterns and returns the corresponding weights.*/vec2 calculateDiagWeights(const in vec2 texCoord,const in vec2 e,const in vec4 subsampleIndices){vec2 weights=vec2(0.0);vec4 d;vec2 end;if(e.r>0.0){d.xz=searchDiag1(texCoord,vec2(-1.0,1.0),end);d.x+=float(end.y>0.9);}else{d.xz=vec2(0.0);}d.yw=searchDiag1(texCoord,vec2(1.0,-1.0),end);if(d.x+d.y>2.0){vec4 coords=vec4(-d.x+0.25,d.x,d.y,-d.y-0.25)*texelSize.xyxy+texCoord.xyxy;vec4 c;c.xy=sampleLevelZeroOffset(inputBuffer,coords.xy,vec2(-1,0)).rg;c.zw=sampleLevelZeroOffset(inputBuffer,coords.zw,vec2(1,0)).rg;c.yxwz=decodeDiagBilinearAccess(c.xyzw);vec2 cc=vec2(2.0)*c.xz+c.yw;movec(bvec2(step(0.9,d.zw)),cc,vec2(0.0));weights+=areaDiag(d.xy,cc,subsampleIndices.z);}d.xz=searchDiag2(texCoord,vec2(-1.0,-1.0),end);if(sampleLevelZeroOffset(inputBuffer,texCoord,vec2(1,0)).r>0.0){d.yw=searchDiag2(texCoord,vec2(1.0),end);d.y+=float(end.y>0.9);}else{d.yw=vec2(0.0);}if(d.x+d.y>2.0){vec4 coords=vec4(-d.x,-d.x,d.y,d.y)*texelSize.xyxy+texCoord.xyxy;vec4 c;c.x=sampleLevelZeroOffset(inputBuffer,coords.xy,vec2(-1,0)).g;c.y=sampleLevelZeroOffset(inputBuffer,coords.xy,vec2(0,-1)).r;c.zw=sampleLevelZeroOffset(inputBuffer,coords.zw,vec2(1,0)).gr;vec2 cc=vec2(2.0)*c.xz+c.yw;movec(bvec2(step(0.9,d.zw)),cc,vec2(0.0));weights+=areaDiag(d.xy,cc,subsampleIndices.w).gr;}return weights;}/***Determines how much length should be added in the last step of the searches.**Takes the bilinearly interpolated edge(see @PSEUDO_GATHER4),and adds 0,1*or 2 depending on which edges and crossing edges are active.*/float searchLength(const in vec2 e,const in float offset){/*The texture is flipped vertically,with left and right cases taking halfof the space horizontally.*/vec2 scale=SEARCHTEX_SIZE*vec2(0.5,-1.0);vec2 bias=SEARCHTEX_SIZE*vec2(offset,1.0);scale+=vec2(-1.0,1.0);bias+=vec2(0.5,-0.5);scale*=1.0/SEARCHTEX_PACKED_SIZE;bias*=1.0/SEARCHTEX_PACKED_SIZE;return texture2D(searchTexture,scale*e+bias).r;}/***Horizontal search for the second pass.*/float searchXLeft(in vec2 texCoord,const in float end){/*@PSEUDO_GATHER4This texCoord has been offset by(-0.25,-0.125)in the vertex shader tosample between edges,thus fetching four edges in a row.Sampling with different offsets in each direction allows to disambiguatewhich edges are active from the four fetched ones.*/vec2 e=vec2(0.0,1.0);for(int i=0;i<MAX_SEARCH_STEPS_INT;++i){if(!(texCoord.x>end&&e.g>0.8281&&e.r==0.0)){break;}e=texture2D(inputBuffer,texCoord).rg;texCoord=vec2(-2.0,0.0)*texelSize+texCoord;}float offset=-(255.0/127.0)*searchLength(e,0.0)+3.25;return texelSize.x*offset+texCoord.x;}float searchXRight(vec2 texCoord,const in float end){vec2 e=vec2(0.0,1.0);for(int i=0;i<MAX_SEARCH_STEPS_INT;++i){if(!(texCoord.x<end&&e.g>0.8281&&e.r==0.0)){break;}e=texture2D(inputBuffer,texCoord).rg;texCoord=vec2(2.0,0.0)*texelSize.xy+texCoord;}float offset=-(255.0/127.0)*searchLength(e,0.5)+3.25;return-texelSize.x*offset+texCoord.x;}/***Vertical search for the second pass.*/float searchYUp(vec2 texCoord,const in float end){vec2 e=vec2(1.0,0.0);for(int i=0;i<MAX_SEARCH_STEPS_INT;++i){if(!(texCoord.y>end&&e.r>0.8281&&e.g==0.0)){break;}e=texture2D(inputBuffer,texCoord).rg;texCoord=-vec2(0.0,2.0)*texelSize.xy+texCoord;}float offset=-(255.0/127.0)*searchLength(e.gr,0.0)+3.25;return texelSize.y*offset+texCoord.y;}float searchYDown(vec2 texCoord,const in float end){vec2 e=vec2(1.0,0.0);for(int i=0;i<MAX_SEARCH_STEPS_INT;i++){if(!(texCoord.y<end&&e.r>0.8281&&e.g==0.0)){break;}e=texture2D(inputBuffer,texCoord).rg;texCoord=vec2(0.0,2.0)*texelSize.xy+texCoord;}float offset=-(255.0/127.0)*searchLength(e.gr,0.5)+3.25;return-texelSize.y*offset+texCoord.y;}/***Determines the areas at each side of the current edge.*/vec2 area(const in vec2 dist,const in float e1,const in float e2,const in float offset){vec2 texCoord=vec2(AREATEX_MAX_DISTANCE)*round(4.0*vec2(e1,e2))+dist;texCoord=AREATEX_PIXEL_SIZE*texCoord+0.5*AREATEX_PIXEL_SIZE;texCoord.y=AREATEX_SUBTEX_SIZE*offset+texCoord.y;return texture2D(areaTexture,texCoord).rg;}/***Corner detection.*/void detectHorizontalCornerPattern(inout vec2 weights,const in vec4 texCoord,const in vec2 d){\n#if !defined(DISABLE_CORNER_DETECTION)\nvec2 leftRight=step(d.xy,d.yx);vec2 rounding=(1.0-CORNER_ROUNDING_NORM)*leftRight;rounding/=leftRight.x+leftRight.y;vec2 factor=vec2(1.0);factor.x-=rounding.x*sampleLevelZeroOffset(inputBuffer,texCoord.xy,vec2(0,1)).r;factor.x-=rounding.y*sampleLevelZeroOffset(inputBuffer,texCoord.zw,vec2(1,1)).r;factor.y-=rounding.x*sampleLevelZeroOffset(inputBuffer,texCoord.xy,vec2(0,-2)).r;factor.y-=rounding.y*sampleLevelZeroOffset(inputBuffer,texCoord.zw,vec2(1,-2)).r;weights*=saturate(factor);\n#endif\n}void detectVerticalCornerPattern(inout vec2 weights,const in vec4 texCoord,const in vec2 d){\n#if !defined(DISABLE_CORNER_DETECTION)\nvec2 leftRight=step(d.xy,d.yx);vec2 rounding=(1.0-CORNER_ROUNDING_NORM)*leftRight;rounding/=leftRight.x+leftRight.y;vec2 factor=vec2(1.0);factor.x-=rounding.x*sampleLevelZeroOffset(inputBuffer,texCoord.xy,vec2(1,0)).g;factor.x-=rounding.y*sampleLevelZeroOffset(inputBuffer,texCoord.zw,vec2(1,1)).g;factor.y-=rounding.x*sampleLevelZeroOffset(inputBuffer,texCoord.xy,vec2(-2,0)).g;factor.y-=rounding.y*sampleLevelZeroOffset(inputBuffer,texCoord.zw,vec2(-2,1)).g;weights*=saturate(factor);\n#endif\n}void main(){vec4 weights=vec4(0.0);vec4 subsampleIndices=vec4(0.0);vec2 e=texture2D(inputBuffer,vUv).rg;if(e.g>0.0){\n#if !defined(DISABLE_DIAG_DETECTION)\n/*Diagonals have both north and west edges,so searching for them in one ofthe boundaries is enough.*/weights.rg=calculateDiagWeights(vUv,e,subsampleIndices);if(weights.r==-weights.g){\n#endif\nvec2 d;vec3 coords;coords.x=searchXLeft(vOffset[0].xy,vOffset[2].x);coords.y=vOffset[1].y;d.x=coords.x;/*Now fetch the left crossing edges,two at a time using bilinearfiltering. Sampling at-0.25(see @CROSSING_OFFSET)enables to discern whatvalue each edge has.*/float e1=texture2D(inputBuffer,coords.xy).r;coords.z=searchXRight(vOffset[0].zw,vOffset[2].y);d.y=coords.z;/*Translate distances to pixel units for better interleave arithmetic andmemory accesses.*/d=round(resolution.xx*d+-vPixCoord.xx);vec2 sqrtD=sqrt(abs(d));float e2=sampleLevelZeroOffset(inputBuffer,coords.zy,vec2(1,0)).r;weights.rg=area(sqrtD,e1,e2,subsampleIndices.y);coords.y=vUv.y;detectHorizontalCornerPattern(weights.rg,coords.xyzy,d);\n#if !defined(DISABLE_DIAG_DETECTION)\n}else{e.r=0.0;}\n#endif\n}if(e.r>0.0){vec2 d;vec3 coords;coords.y=searchYUp(vOffset[1].xy,vOffset[2].z);coords.x=vOffset[0].x;d.x=coords.y;float e1=texture2D(inputBuffer,coords.xy).g;coords.z=searchYDown(vOffset[1].zw,vOffset[2].w);d.y=coords.z;d=round(resolution.yy*d-vPixCoord.yy);vec2 sqrtD=sqrt(abs(d));float e2=sampleLevelZeroOffset(inputBuffer,coords.xz,vec2(0,1)).g;weights.ba=area(sqrtD,e1,e2,subsampleIndices.x);coords.x=vUv.x;detectVerticalCornerPattern(weights.ba,coords.xyxz,d);}gl_FragColor=weights;}";
  var vertexShader$5 = "uniform vec2 texelSize;uniform vec2 resolution;varying vec2 vUv;varying vec4 vOffset[3];varying vec2 vPixCoord;void main(){vUv=position.xy*0.5+0.5;vPixCoord=vUv*resolution;vOffset[0]=vUv.xyxy+texelSize.xyxy*vec4(-0.25,-0.125,1.25,-0.125);vOffset[1]=vUv.xyxy+texelSize.xyxy*vec4(-0.125,-0.25,-0.125,1.25);vOffset[2]=vec4(vOffset[0].xz,vOffset[1].yw)+vec4(-2.0,2.0,-2.0,2.0)*texelSize.xxyy*MAX_SEARCH_STEPS_FLOAT;gl_Position=vec4(position.xy,1.0,1.0);}";

  var SMAAWeightsMaterial = function (_ShaderMaterial11) {
    _inherits(SMAAWeightsMaterial, _ShaderMaterial11);

    function SMAAWeightsMaterial() {
      var texelSize = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : new three.Vector2();
      var resolution = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : new three.Vector2();

      _classCallCheck(this, SMAAWeightsMaterial);

      return _possibleConstructorReturn(this, _getPrototypeOf(SMAAWeightsMaterial).call(this, {
        type: "SMAAWeightsMaterial",
        defines: {
          MAX_SEARCH_STEPS_INT: "16",
          MAX_SEARCH_STEPS_FLOAT: "16.0",
          MAX_SEARCH_STEPS_DIAG_INT: "8",
          MAX_SEARCH_STEPS_DIAG_FLOAT: "8.0",
          CORNER_ROUNDING: "25",
          CORNER_ROUNDING_NORM: "0.25",
          AREATEX_MAX_DISTANCE: "16.0",
          AREATEX_MAX_DISTANCE_DIAG: "20.0",
          AREATEX_PIXEL_SIZE: "(1.0 / vec2(160.0, 560.0))",
          AREATEX_SUBTEX_SIZE: "(1.0 / 7.0)",
          SEARCHTEX_SIZE: "vec2(66.0, 33.0)",
          SEARCHTEX_PACKED_SIZE: "vec2(64.0, 16.0)"
        },
        uniforms: {
          inputBuffer: new three.Uniform(null),
          areaTexture: new three.Uniform(null),
          searchTexture: new three.Uniform(null),
          texelSize: new three.Uniform(texelSize),
          resolution: new three.Uniform(resolution)
        },
        fragmentShader: fragmentShader$9,
        vertexShader: vertexShader$5,
        depthWrite: false,
        depthTest: false
      }));
    }

    _createClass(SMAAWeightsMaterial, [{
      key: "setOrthogonalSearchSteps",
      value: function setOrthogonalSearchSteps(steps) {
        steps = Math.min(Math.max(steps, 0), 112);
        this.defines.MAX_SEARCH_STEPS_INT = steps.toFixed("0");
        this.defines.MAX_SEARCH_STEPS_FLOAT = steps.toFixed("1");
        this.needsUpdate = true;
      }
    }, {
      key: "setDiagonalSearchSteps",
      value: function setDiagonalSearchSteps(steps) {
        steps = Math.min(Math.max(steps, 0), 20);
        this.defines.MAX_SEARCH_STEPS_DIAG_INT = steps.toFixed("0");
        this.defines.MAX_SEARCH_STEPS_DIAG_FLOAT = steps.toFixed("1");
        this.needsUpdate = true;
      }
    }, {
      key: "setCornerRounding",
      value: function setCornerRounding(rounding) {
        rounding = Math.min(Math.max(rounding, 0), 100);
        this.defines.CORNER_ROUNDING = rounding.toFixed("4");
        this.defines.CORNER_ROUNDING_NORM = (rounding / 100.0).toFixed("4");
        this.needsUpdate = true;
      }
    }, {
      key: "diagonalDetection",
      get: function get() {
        return this.defines.DISABLE_DIAG_DETECTION === undefined;
      },
      set: function set(value) {
        value ? delete this.defines.DISABLE_DIAG_DETECTION : this.defines.DISABLE_DIAG_DETECTION = "1";
        this.needsUpdate = true;
      }
    }, {
      key: "cornerRounding",
      get: function get() {
        return this.defines.DISABLE_CORNER_DETECTION === undefined;
      },
      set: function set(value) {
        value ? delete this.defines.DISABLE_CORNER_DETECTION : this.defines.DISABLE_CORNER_DETECTION = "1";
        this.needsUpdate = true;
      }
    }]);

    return SMAAWeightsMaterial;
  }(three.ShaderMaterial);

  var geometry = null;

  function getFullscreenTriangle() {
    if (geometry === null) {
      var vertices = new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]);
      var uvs = new Float32Array([0, 0, 2, 0, 0, 2]);
      geometry = new three.BufferGeometry();
      geometry.addAttribute("position", new three.BufferAttribute(vertices, 3));
      geometry.addAttribute("uv", new three.BufferAttribute(uvs, 2));
    }

    return geometry;
  }

  var Pass = function () {
    function Pass() {
      var name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "Pass";
      var scene = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : new three.Scene();
      var camera = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : new three.OrthographicCamera(-1, 1, 1, -1, 0, 1);

      _classCallCheck(this, Pass);

      this.name = name;
      this.scene = scene;
      this.camera = camera;
      this.screen = null;
      this.needsSwap = true;
      this.needsDepthTexture = false;
      this.renderToScreen = false;
      this.enabled = true;
    }

    _createClass(Pass, [{
      key: "getFullscreenMaterial",
      value: function getFullscreenMaterial() {
        return this.screen !== null ? this.screen.material : null;
      }
    }, {
      key: "setFullscreenMaterial",
      value: function setFullscreenMaterial(material) {
        var screen = this.screen;

        if (screen !== null) {
          screen.material = material;
        } else {
          screen = new three.Mesh(getFullscreenTriangle(), material);
          screen.frustumCulled = false;

          if (this.scene === null) {
            this.scene = new three.Scene();
          }

          this.scene.add(screen);
          this.screen = screen;
        }
      }
    }, {
      key: "getDepthTexture",
      value: function getDepthTexture() {
        return null;
      }
    }, {
      key: "setDepthTexture",
      value: function setDepthTexture(depthTexture) {
      }
    }, {
      key: "render",
      value: function render(renderer, inputBuffer, outputBuffer, deltaTime, stencilTest) {
        throw new Error("Render method not implemented!");
      }
    }, {
      key: "setSize",
      value: function setSize(width, height) {}
    }, {
      key: "initialize",
      value: function initialize(renderer, alpha) {}
    }, {
      key: "dispose",
      value: function dispose() {
        var material = this.getFullscreenMaterial();

        if (material !== null) {
          material.dispose();
        }

        for (var _i = 0, _Object$keys = Object.keys(this); _i < _Object$keys.length; _i++) {
          var key = _Object$keys[_i];

          if (this[key] !== null && typeof this[key].dispose === "function") {
            this[key].dispose();
          }
        }
      }
    }]);

    return Pass;
  }();

  var AUTO_SIZE = -1;

  var BlurPass = function (_Pass) {
    _inherits(BlurPass, _Pass);

    function BlurPass() {
      var _this12;

      var _ref4 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          _ref4$resolutionScale = _ref4.resolutionScale,
          resolutionScale = _ref4$resolutionScale === void 0 ? 0.5 : _ref4$resolutionScale,
          _ref4$width = _ref4.width,
          width = _ref4$width === void 0 ? AUTO_SIZE : _ref4$width,
          _ref4$height = _ref4.height,
          height = _ref4$height === void 0 ? AUTO_SIZE : _ref4$height,
          _ref4$kernelSize = _ref4.kernelSize,
          kernelSize = _ref4$kernelSize === void 0 ? KernelSize.LARGE : _ref4$kernelSize;

      _classCallCheck(this, BlurPass);

      _this12 = _possibleConstructorReturn(this, _getPrototypeOf(BlurPass).call(this, "BlurPass"));
      _this12.renderTargetX = new three.WebGLRenderTarget(1, 1, {
        minFilter: three.LinearFilter,
        magFilter: three.LinearFilter,
        stencilBuffer: false,
        depthBuffer: false
      });
      _this12.renderTargetX.texture.name = "Blur.TargetX";
      _this12.renderTargetY = _this12.renderTargetX.clone();
      _this12.renderTargetY.texture.name = "Blur.TargetY";
      _this12.originalSize = new three.Vector2();
      _this12.resolution = new three.Vector2(width, height);
      _this12.resolutionScale = resolutionScale;
      _this12.convolutionMaterial = new ConvolutionMaterial();
      _this12.ditheredConvolutionMaterial = new ConvolutionMaterial();
      _this12.ditheredConvolutionMaterial.dithering = true;
      _this12.dithering = false;
      _this12.kernelSize = kernelSize;
      return _this12;
    }

    _createClass(BlurPass, [{
      key: "getOriginalSize",
      value: function getOriginalSize() {
        return this.originalSize;
      }
    }, {
      key: "getResolutionScale",
      value: function getResolutionScale() {
        return this.resolutionScale;
      }
    }, {
      key: "setResolutionScale",
      value: function setResolutionScale(scale) {
        this.resolutionScale = scale;
        this.setSize(this.originalSize.x, this.originalSize.y);
      }
    }, {
      key: "render",
      value: function render(renderer, inputBuffer, outputBuffer, deltaTime, stencilTest) {
        var scene = this.scene;
        var camera = this.camera;
        var renderTargetX = this.renderTargetX;
        var renderTargetY = this.renderTargetY;
        var material = this.convolutionMaterial;
        var uniforms = material.uniforms;
        var kernel = material.getKernel();
        var lastRT = inputBuffer;
        var destRT;
        var i, l;
        this.setFullscreenMaterial(material);

        for (i = 0, l = kernel.length - 1; i < l; ++i) {
          destRT = i % 2 === 0 ? renderTargetX : renderTargetY;
          uniforms.kernel.value = kernel[i];
          uniforms.inputBuffer.value = lastRT.texture;
          renderer.setRenderTarget(destRT);
          renderer.render(scene, camera);
          lastRT = destRT;
        }

        if (this.dithering) {
          material = this.ditheredConvolutionMaterial;
          uniforms = material.uniforms;
          this.setFullscreenMaterial(material);
        }

        uniforms.kernel.value = kernel[i];
        uniforms.inputBuffer.value = lastRT.texture;
        renderer.setRenderTarget(this.renderToScreen ? null : outputBuffer);
        renderer.render(scene, camera);
      }
    }, {
      key: "setSize",
      value: function setSize(width, height) {
        var resolution = this.resolution;
        var aspect = width / height;
        this.originalSize.set(width, height);

        if (resolution.x !== AUTO_SIZE && resolution.y !== AUTO_SIZE) {
          width = Math.max(1, resolution.x);
          height = Math.max(1, resolution.y);
        } else if (resolution.x !== AUTO_SIZE) {
          width = Math.max(1, resolution.x);
          height = Math.round(Math.max(1, resolution.y) / aspect);
        } else if (resolution.y !== AUTO_SIZE) {
          width = Math.round(Math.max(1, resolution.y) * aspect);
          height = Math.max(1, resolution.y);
        } else {
          width = Math.max(1, Math.round(width * this.resolutionScale));
          height = Math.max(1, Math.round(height * this.resolutionScale));
        }

        this.renderTargetX.setSize(width, height);
        this.renderTargetY.setSize(width, height);
        this.convolutionMaterial.setTexelSize(1.0 / width, 1.0 / height);
        this.ditheredConvolutionMaterial.setTexelSize(1.0 / width, 1.0 / height);
      }
    }, {
      key: "initialize",
      value: function initialize(renderer, alpha) {
        if (!alpha) {
          this.renderTargetX.texture.format = three.RGBFormat;
          this.renderTargetY.texture.format = three.RGBFormat;
        }
      }
    }, {
      key: "width",
      get: function get() {
        return this.renderTargetX.width;
      },
      set: function set(value) {
        this.resolution.x = value;
        this.setSize(this.originalSize.x, this.originalSize.y);
      }
    }, {
      key: "height",
      get: function get() {
        return this.renderTargetX.height;
      },
      set: function set(value) {
        this.resolution.y = value;
        this.setSize(this.originalSize.x, this.originalSize.y);
      }
    }, {
      key: "scale",
      get: function get() {
        return this.convolutionMaterial.uniforms.scale.value;
      },
      set: function set(value) {
        this.convolutionMaterial.uniforms.scale.value = value;
        this.ditheredConvolutionMaterial.uniforms.scale.value = value;
      }
    }, {
      key: "kernelSize",
      get: function get() {
        return this.convolutionMaterial.kernelSize;
      },
      set: function set(value) {
        this.convolutionMaterial.kernelSize = value;
        this.ditheredConvolutionMaterial.kernelSize = value;
      }
    }], [{
      key: "AUTO_SIZE",
      get: function get() {
        return AUTO_SIZE;
      }
    }]);

    return BlurPass;
  }(Pass);

  var ClearMaskPass = function (_Pass2) {
    _inherits(ClearMaskPass, _Pass2);

    function ClearMaskPass() {
      var _this13;

      _classCallCheck(this, ClearMaskPass);

      _this13 = _possibleConstructorReturn(this, _getPrototypeOf(ClearMaskPass).call(this, "ClearMaskPass", null, null));
      _this13.needsSwap = false;
      return _this13;
    }

    _createClass(ClearMaskPass, [{
      key: "render",
      value: function render(renderer, inputBuffer, outputBuffer, deltaTime, stencilTest) {
        var stencil = renderer.state.buffers.stencil;
        stencil.setLocked(false);
        stencil.setTest(false);
      }
    }]);

    return ClearMaskPass;
  }(Pass);

  var color = new three.Color();

  var ClearPass = function (_Pass3) {
    _inherits(ClearPass, _Pass3);

    function ClearPass() {
      var _this14;

      var color = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
      var depth = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
      var stencil = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

      _classCallCheck(this, ClearPass);

      _this14 = _possibleConstructorReturn(this, _getPrototypeOf(ClearPass).call(this, "ClearPass", null, null));
      _this14.needsSwap = false;
      _this14.color = color;
      _this14.depth = depth;
      _this14.stencil = stencil;
      _this14.overrideClearColor = null;
      _this14.overrideClearAlpha = -1.0;
      return _this14;
    }

    _createClass(ClearPass, [{
      key: "render",
      value: function render(renderer, inputBuffer, outputBuffer, deltaTime, stencilTest) {
        var overrideClearColor = this.overrideClearColor;
        var overrideClearAlpha = this.overrideClearAlpha;
        var clearAlpha = renderer.getClearAlpha();
        var hasOverrideClearColor = overrideClearColor !== null;
        var hasOverrideClearAlpha = overrideClearAlpha >= 0.0;

        if (hasOverrideClearColor) {
          color.copy(renderer.getClearColor());
          renderer.setClearColor(overrideClearColor, hasOverrideClearAlpha ? overrideClearAlpha : clearAlpha);
        } else if (hasOverrideClearAlpha) {
          renderer.setClearAlpha(overrideClearAlpha);
        }

        renderer.setRenderTarget(this.renderToScreen ? null : inputBuffer);
        renderer.clear(this.color, this.depth, this.stencil);

        if (hasOverrideClearColor) {
          renderer.setClearColor(color, clearAlpha);
        } else if (hasOverrideClearAlpha) {
          renderer.setClearAlpha(clearAlpha);
        }
      }
    }]);

    return ClearPass;
  }(Pass);

  var RenderPass = function (_Pass4) {
    _inherits(RenderPass, _Pass4);

    function RenderPass(scene, camera) {
      var _this15;

      var overrideMaterial = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

      _classCallCheck(this, RenderPass);

      _this15 = _possibleConstructorReturn(this, _getPrototypeOf(RenderPass).call(this, "RenderPass", scene, camera));
      _this15.needsSwap = false;
      _this15.overrideMaterial = overrideMaterial;
      _this15.clearPass = new ClearPass();
      _this15.depthTexture = null;
      return _this15;
    }

    _createClass(RenderPass, [{
      key: "getClearPass",
      value: function getClearPass() {
        return this.clearPass;
      }
    }, {
      key: "getDepthTexture",
      value: function getDepthTexture() {
        return this.depthTexture;
      }
    }, {
      key: "setDepthTexture",
      value: function setDepthTexture(depthTexture) {
        this.depthTexture = depthTexture;
      }
    }, {
      key: "render",
      value: function render(renderer, inputBuffer, outputBuffer, deltaTime, stencilTest) {
        var scene = this.scene;
        var renderTarget = this.renderToScreen ? null : inputBuffer;
        var overrideMaterial = scene.overrideMaterial;

        if (this.depthTexture !== null && !this.renderToScreen) {
          inputBuffer.depthTexture = this.depthTexture;
          outputBuffer.depthTexture = null;
        }

        if (this.clear) {
          this.clearPass.renderToScreen = this.renderToScreen;
          this.clearPass.render(renderer, inputBuffer);
        }

        scene.overrideMaterial = this.overrideMaterial;
        renderer.setRenderTarget(renderTarget);
        renderer.render(scene, this.camera);
        scene.overrideMaterial = overrideMaterial;
      }
    }, {
      key: "clear",
      get: function get() {
        return this.clearPass.enabled;
      },
      set: function set(value) {
        this.clearPass.enabled = value;
      }
    }]);

    return RenderPass;
  }(Pass);

  var DepthPass = function (_Pass5) {
    _inherits(DepthPass, _Pass5);

    function DepthPass(scene, camera) {
      var _this16;

      var _ref5 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
          _ref5$resolutionScale = _ref5.resolutionScale,
          resolutionScale = _ref5$resolutionScale === void 0 ? 1.0 : _ref5$resolutionScale,
          renderTarget = _ref5.renderTarget;

      _classCallCheck(this, DepthPass);

      _this16 = _possibleConstructorReturn(this, _getPrototypeOf(DepthPass).call(this, "DepthPass"));
      _this16.needsSwap = false;
      _this16.renderPass = new RenderPass(scene, camera, new three.MeshDepthMaterial({
        depthPacking: three.RGBADepthPacking,
        morphTargets: true,
        skinning: true
      }));

      var clearPass = _this16.renderPass.getClearPass();

      clearPass.overrideClearColor = new three.Color(0xffffff);
      clearPass.overrideClearAlpha = 1.0;
      _this16.renderTarget = renderTarget;

      if (_this16.renderTarget === undefined) {
        _this16.renderTarget = new three.WebGLRenderTarget(1, 1, {
          minFilter: three.LinearFilter,
          magFilter: three.LinearFilter,
          stencilBuffer: false
        });
        _this16.renderTarget.texture.name = "DepthPass.Target";
      }

      _this16.resolutionScale = resolutionScale;
      _this16.originalSize = new three.Vector2();
      return _this16;
    }

    _createClass(DepthPass, [{
      key: "getResolutionScale",
      value: function getResolutionScale() {
        return this.resolutionScale;
      }
    }, {
      key: "setResolutionScale",
      value: function setResolutionScale(scale) {
        this.resolutionScale = scale;
        this.setSize(this.originalSize.x, this.originalSize.y);
      }
    }, {
      key: "render",
      value: function render(renderer, inputBuffer, outputBuffer, deltaTime, stencilTest) {
        var renderTarget = this.renderToScreen ? null : this.renderTarget;
        this.renderPass.render(renderer, renderTarget);
      }
    }, {
      key: "setSize",
      value: function setSize(width, height) {
        this.originalSize.set(width, height);
        this.renderTarget.setSize(Math.max(1, Math.round(width * this.resolutionScale)), Math.max(1, Math.round(height * this.resolutionScale)));
      }
    }]);

    return DepthPass;
  }(Pass);

  var BlendFunction = {
    SKIP: 0,
    ADD: 1,
    ALPHA: 2,
    AVERAGE: 3,
    COLOR_BURN: 4,
    COLOR_DODGE: 5,
    DARKEN: 6,
    DIFFERENCE: 7,
    EXCLUSION: 8,
    LIGHTEN: 9,
    MULTIPLY: 10,
    DIVIDE: 11,
    NEGATION: 12,
    NORMAL: 13,
    OVERLAY: 14,
    REFLECT: 15,
    SCREEN: 16,
    SOFT_LIGHT: 17,
    SUBTRACT: 18
  };
  var addBlendFunction = "vec4 blend(const in vec4 x,const in vec4 y,const in float opacity){return min(x+y,1.0)*opacity+x*(1.0-opacity);}";
  var alphaBlendFunction = "vec3 blend(const in vec3 x,const in vec3 y,const in float opacity){return y*opacity+x*(1.0-opacity);}vec4 blend(const in vec4 x,const in vec4 y,const in float opacity){float a=min(y.a,opacity);return vec4(blend(x.rgb,y.rgb,a),max(x.a,a));}";
  var averageBlendFunction = "vec4 blend(const in vec4 x,const in vec4 y,const in float opacity){return(x+y)*0.5*opacity+x*(1.0-opacity);}";
  var colorBurnBlendFunction = "float blend(const in float x,const in float y){return(y==0.0)? y : max(1.0-(1.0-x)/y,0.0);}vec4 blend(const in vec4 x,const in vec4 y,const in float opacity){vec4 z=vec4(blend(x.r,y.r),blend(x.g,y.g),blend(x.b,y.b),blend(x.a,y.a));return z*opacity+x*(1.0-opacity);}";
  var colorDodgeBlendFunction = "float blend(const in float x,const in float y){return(y==1.0)? y : min(x/(1.0-y),1.0);}vec4 blend(const in vec4 x,const in vec4 y,const in float opacity){vec4 z=vec4(blend(x.r,y.r),blend(x.g,y.g),blend(x.b,y.b),blend(x.a,y.a));return z*opacity+x*(1.0-opacity);}";
  var darkenBlendFunction = "vec4 blend(const in vec4 x,const in vec4 y,const in float opacity){return min(x,y)*opacity+x*(1.0-opacity);}";
  var differenceBlendFunction = "vec4 blend(const in vec4 x,const in vec4 y,const in float opacity){return abs(x-y)*opacity+x*(1.0-opacity);}";
  var exclusionBlendFunction = "vec4 blend(const in vec4 x,const in vec4 y,const in float opacity){return(x+y-2.0*x*y)*opacity+x*(1.0-opacity);}";
  var lightenBlendFunction = "vec4 blend(const in vec4 x,const in vec4 y,const in float opacity){return max(x,y)*opacity+x*(1.0-opacity);}";
  var multiplyBlendFunction = "vec4 blend(const in vec4 x,const in vec4 y,const in float opacity){return x*y*opacity+x*(1.0-opacity);}";
  var divideBlendFunction = "float blend(const in float x,const in float y){return(y>0.0)? min(x/y,1.0): 1.0;}vec4 blend(const in vec4 x,const in vec4 y,const in float opacity){vec4 z=vec4(blend(x.r,y.r),blend(x.g,y.g),blend(x.b,y.b),blend(x.a,y.a));return z*opacity+x*(1.0-opacity);}";
  var negationBlendFunction = "vec4 blend(const in vec4 x,const in vec4 y,const in float opacity){return(1.0-abs(1.0-x-y))*opacity+x*(1.0-opacity);}";
  var normalBlendFunction = "vec4 blend(const in vec4 x,const in vec4 y,const in float opacity){return y*opacity+x*(1.0-opacity);}";
  var overlayBlendFunction = "float blend(const in float x,const in float y){return(x<0.5)?(2.0*x*y):(1.0-2.0*(1.0-x)*(1.0-y));}vec4 blend(const in vec4 x,const in vec4 y,const in float opacity){vec4 z=vec4(blend(x.r,y.r),blend(x.g,y.g),blend(x.b,y.b),blend(x.a,y.a));return z*opacity+x*(1.0-opacity);}";
  var reflectBlendFunction = "float blend(const in float x,const in float y){return(y==1.0)? y : min(x*x/(1.0-y),1.0);}vec4 blend(const in vec4 x,const in vec4 y,const in float opacity){vec4 z=vec4(blend(x.r,y.r),blend(x.g,y.g),blend(x.b,y.b),blend(x.a,y.a));return z*opacity+x*(1.0-opacity);}";
  var screenBlendFunction = "vec4 blend(const in vec4 x,const in vec4 y,const in float opacity){return(1.0-(1.0-x)*(1.0-y))*opacity+x*(1.0-opacity);}";
  var softLightBlendFunction = "float blend(const in float x,const in float y){return(y<0.5)?(2.0*x*y+x*x*(1.0-2.0*y)):(sqrt(x)*(2.0*y-1.0)+2.0*x*(1.0-y));}vec4 blend(const in vec4 x,const in vec4 y,const in float opacity){vec4 z=vec4(blend(x.r,y.r),blend(x.g,y.g),blend(x.b,y.b),blend(x.a,y.a));return z*opacity+x*(1.0-opacity);}";
  var subtractBlendFunction = "vec4 blend(const in vec4 x,const in vec4 y,const in float opacity){return max(x+y-1.0,0.0)*opacity+x*(1.0-opacity);}";
  var blendFunctions = new Map([[BlendFunction.SKIP, null], [BlendFunction.ADD, addBlendFunction], [BlendFunction.ALPHA, alphaBlendFunction], [BlendFunction.AVERAGE, averageBlendFunction], [BlendFunction.COLOR_BURN, colorBurnBlendFunction], [BlendFunction.COLOR_DODGE, colorDodgeBlendFunction], [BlendFunction.DARKEN, darkenBlendFunction], [BlendFunction.DIFFERENCE, differenceBlendFunction], [BlendFunction.EXCLUSION, exclusionBlendFunction], [BlendFunction.LIGHTEN, lightenBlendFunction], [BlendFunction.MULTIPLY, multiplyBlendFunction], [BlendFunction.DIVIDE, divideBlendFunction], [BlendFunction.NEGATION, negationBlendFunction], [BlendFunction.NORMAL, normalBlendFunction], [BlendFunction.OVERLAY, overlayBlendFunction], [BlendFunction.REFLECT, reflectBlendFunction], [BlendFunction.SCREEN, screenBlendFunction], [BlendFunction.SOFT_LIGHT, softLightBlendFunction], [BlendFunction.SUBTRACT, subtractBlendFunction]]);

  var BlendMode = function () {
    function BlendMode(blendFunction) {
      var opacity = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1.0;

      _classCallCheck(this, BlendMode);

      this.blendFunction = blendFunction;
      this.opacity = new three.Uniform(opacity);
    }

    _createClass(BlendMode, [{
      key: "getShaderCode",
      value: function getShaderCode() {
        return blendFunctions.get(this.blendFunction);
      }
    }]);

    return BlendMode;
  }();

  var Effect = function () {
    function Effect(name, fragmentShader) {
      var _ref6 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
          _ref6$attributes = _ref6.attributes,
          attributes = _ref6$attributes === void 0 ? EffectAttribute.NONE : _ref6$attributes,
          _ref6$blendFunction = _ref6.blendFunction,
          blendFunction = _ref6$blendFunction === void 0 ? BlendFunction.SCREEN : _ref6$blendFunction,
          _ref6$defines = _ref6.defines,
          defines = _ref6$defines === void 0 ? new Map() : _ref6$defines,
          _ref6$uniforms = _ref6.uniforms,
          uniforms = _ref6$uniforms === void 0 ? new Map() : _ref6$uniforms,
          _ref6$extensions = _ref6.extensions,
          extensions = _ref6$extensions === void 0 ? null : _ref6$extensions,
          _ref6$vertexShader = _ref6.vertexShader,
          vertexShader = _ref6$vertexShader === void 0 ? null : _ref6$vertexShader;

      _classCallCheck(this, Effect);

      this.name = name;
      this.attributes = attributes;
      this.fragmentShader = fragmentShader;
      this.vertexShader = vertexShader;
      this.defines = defines;
      this.uniforms = uniforms;
      this.extensions = extensions;
      this.blendMode = new BlendMode(blendFunction);
    }

    _createClass(Effect, [{
      key: "setDepthTexture",
      value: function setDepthTexture(depthTexture) {
      }
    }, {
      key: "update",
      value: function update(renderer, inputBuffer, deltaTime) {}
    }, {
      key: "setSize",
      value: function setSize(width, height) {}
    }, {
      key: "initialize",
      value: function initialize(renderer, alpha) {}
    }, {
      key: "dispose",
      value: function dispose() {
        for (var _i2 = 0, _Object$keys2 = Object.keys(this); _i2 < _Object$keys2.length; _i2++) {
          var key = _Object$keys2[_i2];

          if (this[key] !== null && typeof this[key].dispose === "function") {
            this[key].dispose();
          }
        }
      }
    }]);

    return Effect;
  }();

  var EffectAttribute = {
    CONVOLUTION: 2,
    DEPTH: 1,
    NONE: 0
  };

  function findSubstrings(regExp, string) {
    var substrings = [];
    var result;

    while ((result = regExp.exec(string)) !== null) {
      substrings.push(result[1]);
    }

    return substrings;
  }

  function prefixSubstrings(prefix, substrings, strings) {
    var prefixed, regExp;
    var _iteratorNormalCompletion5 = true;
    var _didIteratorError5 = false;
    var _iteratorError5 = undefined;

    try {
      for (var _iterator5 = substrings[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
        var substring = _step5.value;
        prefixed = "$1" + prefix + substring.charAt(0).toUpperCase() + substring.slice(1);
        regExp = new RegExp("([^\\.])(\\b" + substring + "\\b)", "g");
        var _iteratorNormalCompletion6 = true;
        var _didIteratorError6 = false;
        var _iteratorError6 = undefined;

        try {
          for (var _iterator6 = strings.entries()[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
            var entry = _step6.value;

            if (entry[1] !== null) {
              strings.set(entry[0], entry[1].replace(regExp, prefixed));
            }
          }
        } catch (err) {
          _didIteratorError6 = true;
          _iteratorError6 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion6 && _iterator6["return"] != null) {
              _iterator6["return"]();
            }
          } finally {
            if (_didIteratorError6) {
              throw _iteratorError6;
            }
          }
        }
      }
    } catch (err) {
      _didIteratorError5 = true;
      _iteratorError5 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion5 && _iterator5["return"] != null) {
          _iterator5["return"]();
        }
      } finally {
        if (_didIteratorError5) {
          throw _iteratorError5;
        }
      }
    }
  }

  function integrateEffect(prefix, effect, shaderParts, blendModes, defines, uniforms, attributes) {
    var functionRegExp = /(?:\w+\s+(\w+)\([\w\s,]*\)\s*{[^}]+})/g;
    var varyingRegExp = /(?:varying\s+\w+\s+(\w*))/g;
    var blendMode = effect.blendMode;
    var shaders = new Map([["fragment", effect.fragmentShader], ["vertex", effect.vertexShader]]);
    var mainImageExists = shaders.get("fragment") !== undefined && shaders.get("fragment").indexOf("mainImage") >= 0;
    var mainUvExists = shaders.get("fragment") !== undefined && shaders.get("fragment").indexOf("mainUv") >= 0;
    var varyings = [],
        names = [];
    var transformedUv = false;
    var readDepth = false;

    if (shaders.get("fragment") === undefined) {
      console.error("Missing fragment shader", effect);
    } else if (mainUvExists && (attributes & EffectAttribute.CONVOLUTION) !== 0) {
      console.error("Effects that transform UV coordinates are incompatible with convolution effects", effect);
    } else if (!mainImageExists && !mainUvExists) {
      console.error("The fragment shader contains neither a mainImage nor a mainUv function", effect);
    } else {
      if (mainUvExists) {
        shaderParts.set(Section.FRAGMENT_MAIN_UV, shaderParts.get(Section.FRAGMENT_MAIN_UV) + "\t" + prefix + "MainUv(UV);\n");
        transformedUv = true;
      }

      if (shaders.get("vertex") !== null && shaders.get("vertex").indexOf("mainSupport") >= 0) {
        var string = "\t" + prefix + "MainSupport(";

        if (shaders.get("vertex").indexOf("uv") >= 0) {
          string += "vUv";
        }

        string += ");\n";
        shaderParts.set(Section.VERTEX_MAIN_SUPPORT, shaderParts.get(Section.VERTEX_MAIN_SUPPORT) + string);
        varyings = varyings.concat(findSubstrings(varyingRegExp, shaders.get("vertex")));
        names = names.concat(varyings).concat(findSubstrings(functionRegExp, shaders.get("vertex")));
      }

      names = names.concat(findSubstrings(functionRegExp, shaders.get("fragment"))).concat(Array.from(effect.uniforms.keys())).concat(Array.from(effect.defines.keys()));
      effect.uniforms.forEach(function (value, key) {
        return uniforms.set(prefix + key.charAt(0).toUpperCase() + key.slice(1), value);
      });
      effect.defines.forEach(function (value, key) {
        return defines.set(prefix + key.charAt(0).toUpperCase() + key.slice(1), value);
      });
      prefixSubstrings(prefix, names, defines);
      prefixSubstrings(prefix, names, shaders);
      blendModes.set(blendMode.blendFunction, blendMode);

      if (mainImageExists) {
        var _string = prefix + "MainImage(color0, UV, ";

        if ((attributes & EffectAttribute.DEPTH) !== 0 && shaders.get("fragment").indexOf("depth") >= 0) {
          _string += "depth, ";
          readDepth = true;
        }

        _string += "color1);\n\t";
        var blendOpacity = prefix + "BlendOpacity";
        uniforms.set(blendOpacity, blendMode.opacity);
        _string += "color0 = blend" + blendMode.blendFunction + "(color0, color1, " + blendOpacity + ");\n\n\t";
        shaderParts.set(Section.FRAGMENT_MAIN_IMAGE, shaderParts.get(Section.FRAGMENT_MAIN_IMAGE) + _string);
        shaderParts.set(Section.FRAGMENT_HEAD, shaderParts.get(Section.FRAGMENT_HEAD) + "uniform float " + blendOpacity + ";\n\n");
      }

      shaderParts.set(Section.FRAGMENT_HEAD, shaderParts.get(Section.FRAGMENT_HEAD) + shaders.get("fragment") + "\n");

      if (shaders.get("vertex") !== null) {
        shaderParts.set(Section.VERTEX_HEAD, shaderParts.get(Section.VERTEX_HEAD) + shaders.get("vertex") + "\n");
      }
    }

    return {
      varyings: varyings,
      transformedUv: transformedUv,
      readDepth: readDepth
    };
  }

  var EffectPass = function (_Pass6) {
    _inherits(EffectPass, _Pass6);

    function EffectPass(camera) {
      var _this17;

      _classCallCheck(this, EffectPass);

      _this17 = _possibleConstructorReturn(this, _getPrototypeOf(EffectPass).call(this, "EffectPass"));
      _this17.mainCamera = camera;

      for (var _len = arguments.length, effects = new Array(_len > 1 ? _len - 1 : 0), _key2 = 1; _key2 < _len; _key2++) {
        effects[_key2 - 1] = arguments[_key2];
      }

      _this17.effects = effects.sort(function (a, b) {
        return b.attributes - a.attributes;
      });
      _this17.skipRendering = false;
      _this17.quantize = false;
      _this17.uniforms = 0;
      _this17.varyings = 0;
      _this17.minTime = 1.0;
      _this17.maxTime = 1e3;

      _this17.setFullscreenMaterial(_this17.createMaterial());

      return _this17;
    }

    _createClass(EffectPass, [{
      key: "createMaterial",
      value: function createMaterial() {
        var blendRegExp = /\bblend\b/g;
        var shaderParts = new Map([[Section.FRAGMENT_HEAD, ""], [Section.FRAGMENT_MAIN_UV, ""], [Section.FRAGMENT_MAIN_IMAGE, ""], [Section.VERTEX_HEAD, ""], [Section.VERTEX_MAIN_SUPPORT, ""]]);
        var blendModes = new Map();
        var defines = new Map();
        var uniforms = new Map();
        var extensions = new Set();
        var id = 0,
            varyings = 0,
            attributes = 0;
        var transformedUv = false;
        var readDepth = false;
        var result;
        var _iteratorNormalCompletion7 = true;
        var _didIteratorError7 = false;
        var _iteratorError7 = undefined;

        try {
          for (var _iterator7 = this.effects[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
            var effect = _step7.value;

            if (effect.blendMode.blendFunction === BlendFunction.SKIP) {
              attributes |= effect.attributes & EffectAttribute.DEPTH;
            } else if ((attributes & EffectAttribute.CONVOLUTION) !== 0 && (effect.attributes & EffectAttribute.CONVOLUTION) !== 0) {
              console.error("Convolution effects cannot be merged", effect);
            } else {
              attributes |= effect.attributes;
              result = integrateEffect("e" + id++, effect, shaderParts, blendModes, defines, uniforms, attributes);
              varyings += result.varyings.length;
              transformedUv = transformedUv || result.transformedUv;
              readDepth = readDepth || result.readDepth;

              if (effect.extensions !== null) {
                var _iteratorNormalCompletion10 = true;
                var _didIteratorError10 = false;
                var _iteratorError10 = undefined;

                try {
                  for (var _iterator10 = effect.extensions[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
                    var _extension = _step10.value;
                    extensions.add(_extension);
                  }
                } catch (err) {
                  _didIteratorError10 = true;
                  _iteratorError10 = err;
                } finally {
                  try {
                    if (!_iteratorNormalCompletion10 && _iterator10["return"] != null) {
                      _iterator10["return"]();
                    }
                  } finally {
                    if (_didIteratorError10) {
                      throw _iteratorError10;
                    }
                  }
                }
              }
            }
          }
        } catch (err) {
          _didIteratorError7 = true;
          _iteratorError7 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion7 && _iterator7["return"] != null) {
              _iterator7["return"]();
            }
          } finally {
            if (_didIteratorError7) {
              throw _iteratorError7;
            }
          }
        }

        var _iteratorNormalCompletion8 = true;
        var _didIteratorError8 = false;
        var _iteratorError8 = undefined;

        try {
          for (var _iterator8 = blendModes.values()[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
            var blendMode = _step8.value;
            shaderParts.set(Section.FRAGMENT_HEAD, shaderParts.get(Section.FRAGMENT_HEAD) + blendMode.getShaderCode().replace(blendRegExp, "blend" + blendMode.blendFunction) + "\n");
          }
        } catch (err) {
          _didIteratorError8 = true;
          _iteratorError8 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion8 && _iterator8["return"] != null) {
              _iterator8["return"]();
            }
          } finally {
            if (_didIteratorError8) {
              throw _iteratorError8;
            }
          }
        }

        if ((attributes & EffectAttribute.DEPTH) !== 0) {
          if (readDepth) {
            shaderParts.set(Section.FRAGMENT_MAIN_IMAGE, "float depth = readDepth(UV);\n\n\t" + shaderParts.get(Section.FRAGMENT_MAIN_IMAGE));
          }

          this.needsDepthTexture = true;
        }

        if (transformedUv) {
          shaderParts.set(Section.FRAGMENT_MAIN_UV, "vec2 transformedUv = vUv;\n" + shaderParts.get(Section.FRAGMENT_MAIN_UV));
          defines.set("UV", "transformedUv");
        } else {
          defines.set("UV", "vUv");
        }

        shaderParts.forEach(function (value, key, map) {
          return map.set(key, value.trim());
        });
        this.uniforms = uniforms.size;
        this.varyings = varyings;
        this.skipRendering = id === 0;
        this.needsSwap = !this.skipRendering;
        var material = new EffectMaterial(shaderParts, defines, uniforms, this.mainCamera, this.dithering);

        if (extensions.size > 0) {
          var _iteratorNormalCompletion9 = true;
          var _didIteratorError9 = false;
          var _iteratorError9 = undefined;

          try {
            for (var _iterator9 = extensions[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
              var extension = _step9.value;
              material.extensions[extension] = true;
            }
          } catch (err) {
            _didIteratorError9 = true;
            _iteratorError9 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion9 && _iterator9["return"] != null) {
                _iterator9["return"]();
              }
            } finally {
              if (_didIteratorError9) {
                throw _iteratorError9;
              }
            }
          }
        }

        return material;
      }
    }, {
      key: "recompile",
      value: function recompile() {
        var material = this.getFullscreenMaterial();
        var width = 0,
            height = 0;
        var depthTexture = null;
        var depthPacking = 0;

        if (material !== null) {
          var resolution = material.uniforms.resolution.value;
          width = resolution.x;
          height = resolution.y;
          depthTexture = material.uniforms.depthBuffer.value;
          depthPacking = material.depthPacking;
          material.dispose();
          this.uniforms = 0;
          this.varyings = 0;
        }

        material = this.createMaterial();
        material.setSize(width, height);
        this.setFullscreenMaterial(material);
        this.setDepthTexture(depthTexture, depthPacking);
      }
    }, {
      key: "getDepthTexture",
      value: function getDepthTexture() {
        var material = this.getFullscreenMaterial();
        return material !== null ? material.uniforms.depthBuffer.value : null;
      }
    }, {
      key: "setDepthTexture",
      value: function setDepthTexture(depthTexture) {
        var depthPacking = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
        var material = this.getFullscreenMaterial();
        material.uniforms.depthBuffer.value = depthTexture;
        material.depthPacking = depthPacking;
        material.needsUpdate = true;
        var _iteratorNormalCompletion11 = true;
        var _didIteratorError11 = false;
        var _iteratorError11 = undefined;

        try {
          for (var _iterator11 = this.effects[Symbol.iterator](), _step11; !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
            var effect = _step11.value;
            effect.setDepthTexture(depthTexture, depthPacking);
          }
        } catch (err) {
          _didIteratorError11 = true;
          _iteratorError11 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion11 && _iterator11["return"] != null) {
              _iterator11["return"]();
            }
          } finally {
            if (_didIteratorError11) {
              throw _iteratorError11;
            }
          }
        }
      }
    }, {
      key: "render",
      value: function render(renderer, inputBuffer, outputBuffer, deltaTime, stencilTest) {
        var material = this.getFullscreenMaterial();
        var time = material.uniforms.time.value + deltaTime;
        var _iteratorNormalCompletion12 = true;
        var _didIteratorError12 = false;
        var _iteratorError12 = undefined;

        try {
          for (var _iterator12 = this.effects[Symbol.iterator](), _step12; !(_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done); _iteratorNormalCompletion12 = true) {
            var effect = _step12.value;
            effect.update(renderer, inputBuffer, deltaTime);
          }
        } catch (err) {
          _didIteratorError12 = true;
          _iteratorError12 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion12 && _iterator12["return"] != null) {
              _iterator12["return"]();
            }
          } finally {
            if (_didIteratorError12) {
              throw _iteratorError12;
            }
          }
        }

        if (!this.skipRendering || this.renderToScreen) {
          material.uniforms.inputBuffer.value = inputBuffer.texture;
          material.uniforms.time.value = time <= this.maxTime ? time : this.minTime;
          renderer.setRenderTarget(this.renderToScreen ? null : outputBuffer);
          renderer.render(this.scene, this.camera);
        }
      }
    }, {
      key: "setSize",
      value: function setSize(width, height) {
        this.getFullscreenMaterial().setSize(width, height);
        var _iteratorNormalCompletion13 = true;
        var _didIteratorError13 = false;
        var _iteratorError13 = undefined;

        try {
          for (var _iterator13 = this.effects[Symbol.iterator](), _step13; !(_iteratorNormalCompletion13 = (_step13 = _iterator13.next()).done); _iteratorNormalCompletion13 = true) {
            var effect = _step13.value;
            effect.setSize(width, height);
          }
        } catch (err) {
          _didIteratorError13 = true;
          _iteratorError13 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion13 && _iterator13["return"] != null) {
              _iterator13["return"]();
            }
          } finally {
            if (_didIteratorError13) {
              throw _iteratorError13;
            }
          }
        }
      }
    }, {
      key: "initialize",
      value: function initialize(renderer, alpha) {
        var capabilities = renderer.capabilities;
        var max = Math.min(capabilities.maxFragmentUniforms, capabilities.maxVertexUniforms);

        if (this.uniforms > max) {
          console.warn("The current rendering context doesn't support more than " + max + " uniforms, but " + this.uniforms + " were defined");
        }

        max = capabilities.maxVaryings;

        if (this.varyings > max) {
          console.warn("The current rendering context doesn't support more than " + max + " varyings, but " + this.varyings + " were defined");
        }

        var _iteratorNormalCompletion14 = true;
        var _didIteratorError14 = false;
        var _iteratorError14 = undefined;

        try {
          for (var _iterator14 = this.effects[Symbol.iterator](), _step14; !(_iteratorNormalCompletion14 = (_step14 = _iterator14.next()).done); _iteratorNormalCompletion14 = true) {
            var effect = _step14.value;
            effect.initialize(renderer, alpha);
          }
        } catch (err) {
          _didIteratorError14 = true;
          _iteratorError14 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion14 && _iterator14["return"] != null) {
              _iterator14["return"]();
            }
          } finally {
            if (_didIteratorError14) {
              throw _iteratorError14;
            }
          }
        }
      }
    }, {
      key: "dispose",
      value: function dispose() {
        _get(_getPrototypeOf(EffectPass.prototype), "dispose", this).call(this);

        var _iteratorNormalCompletion15 = true;
        var _didIteratorError15 = false;
        var _iteratorError15 = undefined;

        try {
          for (var _iterator15 = this.effects[Symbol.iterator](), _step15; !(_iteratorNormalCompletion15 = (_step15 = _iterator15.next()).done); _iteratorNormalCompletion15 = true) {
            var effect = _step15.value;
            effect.dispose();
          }
        } catch (err) {
          _didIteratorError15 = true;
          _iteratorError15 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion15 && _iterator15["return"] != null) {
              _iterator15["return"]();
            }
          } finally {
            if (_didIteratorError15) {
              throw _iteratorError15;
            }
          }
        }
      }
    }, {
      key: "dithering",
      get: function get() {
        return this.quantize;
      },
      set: function set(value) {
        if (this.quantize !== value) {
          var material = this.getFullscreenMaterial();

          if (material !== null) {
            material.dithering = value;
            material.needsUpdate = true;
          }

          this.quantize = value;
        }
      }
    }]);

    return EffectPass;
  }(Pass);

  var MaskPass = function (_Pass7) {
    _inherits(MaskPass, _Pass7);

    function MaskPass(scene, camera) {
      var _this18;

      _classCallCheck(this, MaskPass);

      _this18 = _possibleConstructorReturn(this, _getPrototypeOf(MaskPass).call(this, "MaskPass", scene, camera));
      _this18.needsSwap = false;
      _this18.clearPass = new ClearPass(false, false, true);
      _this18.inverse = false;
      return _this18;
    }

    _createClass(MaskPass, [{
      key: "render",
      value: function render(renderer, inputBuffer, outputBuffer, deltaTime, stencilTest) {
        var context = renderer.getContext();
        var buffers = renderer.state.buffers;
        var scene = this.scene;
        var camera = this.camera;
        var clearPass = this.clearPass;
        var writeValue = this.inverse ? 0 : 1;
        var clearValue = 1 - writeValue;
        buffers.color.setMask(false);
        buffers.depth.setMask(false);
        buffers.color.setLocked(true);
        buffers.depth.setLocked(true);
        buffers.stencil.setTest(true);
        buffers.stencil.setOp(context.REPLACE, context.REPLACE, context.REPLACE);
        buffers.stencil.setFunc(context.ALWAYS, writeValue, 0xffffffff);
        buffers.stencil.setClear(clearValue);
        buffers.stencil.setLocked(true);

        if (this.clear) {
          if (this.renderToScreen) {
            clearPass.render(renderer, null);
          } else {
            clearPass.render(renderer, inputBuffer);
            clearPass.render(renderer, outputBuffer);
          }
        }

        if (this.renderToScreen) {
          renderer.setRenderTarget(null);
          renderer.render(scene, camera);
        } else {
          renderer.setRenderTarget(inputBuffer);
          renderer.render(scene, camera);
          renderer.setRenderTarget(outputBuffer);
          renderer.render(scene, camera);
        }

        buffers.color.setLocked(false);
        buffers.depth.setLocked(false);
        buffers.stencil.setLocked(false);
        buffers.stencil.setFunc(context.EQUAL, 1, 0xffffffff);
        buffers.stencil.setOp(context.KEEP, context.KEEP, context.KEEP);
        buffers.stencil.setLocked(true);
      }
    }, {
      key: "clear",
      get: function get() {
        return this.clearPass.enabled;
      },
      set: function set(value) {
        this.clearPass.enabled = value;
      }
    }]);

    return MaskPass;
  }(Pass);

  var NormalPass = function (_Pass8) {
    _inherits(NormalPass, _Pass8);

    function NormalPass(scene, camera) {
      var _this19;

      var _ref7 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
          _ref7$resolutionScale = _ref7.resolutionScale,
          resolutionScale = _ref7$resolutionScale === void 0 ? 1.0 : _ref7$resolutionScale,
          renderTarget = _ref7.renderTarget;

      _classCallCheck(this, NormalPass);

      _this19 = _possibleConstructorReturn(this, _getPrototypeOf(NormalPass).call(this, "NormalPass"));
      _this19.needsSwap = false;
      _this19.renderPass = new RenderPass(scene, camera, new three.MeshNormalMaterial({
        morphTargets: true,
        skinning: true
      }));

      var clearPass = _this19.renderPass.getClearPass();

      clearPass.overrideClearColor = new three.Color(0x7777ff);
      clearPass.overrideClearAlpha = 1.0;
      _this19.renderTarget = renderTarget;

      if (_this19.renderTarget === undefined) {
        _this19.renderTarget = new three.WebGLRenderTarget(1, 1, {
          minFilter: three.LinearFilter,
          magFilter: three.LinearFilter,
          format: three.RGBFormat,
          stencilBuffer: false
        });
        _this19.renderTarget.texture.name = "NormalPass.Target";
      }

      _this19.resolutionScale = resolutionScale;
      _this19.originalSize = new three.Vector2();
      return _this19;
    }

    _createClass(NormalPass, [{
      key: "getResolutionScale",
      value: function getResolutionScale() {
        return this.resolutionScale;
      }
    }, {
      key: "setResolutionScale",
      value: function setResolutionScale(scale) {
        this.resolutionScale = scale;
        this.setSize(this.originalSize.x, this.originalSize.y);
      }
    }, {
      key: "render",
      value: function render(renderer, inputBuffer, outputBuffer, deltaTime, stencilTest) {
        var renderTarget = this.renderToScreen ? null : this.renderTarget;
        this.renderPass.render(renderer, renderTarget, renderTarget);
      }
    }, {
      key: "setSize",
      value: function setSize(width, height) {
        this.originalSize.set(width, height);
        this.renderTarget.setSize(Math.max(1, Math.round(width * this.resolutionScale)), Math.max(1, Math.round(height * this.resolutionScale)));
      }
    }]);

    return NormalPass;
  }(Pass);

  var SavePass = function (_Pass9) {
    _inherits(SavePass, _Pass9);

    function SavePass(renderTarget) {
      var _this20;

      var resize = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

      _classCallCheck(this, SavePass);

      _this20 = _possibleConstructorReturn(this, _getPrototypeOf(SavePass).call(this, "SavePass"));

      _this20.setFullscreenMaterial(new CopyMaterial());

      _this20.needsSwap = false;
      _this20.renderTarget = renderTarget;

      if (renderTarget === undefined) {
        _this20.renderTarget = new three.WebGLRenderTarget(1, 1, {
          minFilter: three.LinearFilter,
          magFilter: three.LinearFilter,
          stencilBuffer: false,
          depthBuffer: false
        });
        _this20.renderTarget.texture.name = "SavePass.Target";
      }

      _this20.resize = resize;
      return _this20;
    }

    _createClass(SavePass, [{
      key: "render",
      value: function render(renderer, inputBuffer, outputBuffer, deltaTime, stencilTest) {
        this.getFullscreenMaterial().uniforms.inputBuffer.value = inputBuffer.texture;
        renderer.setRenderTarget(this.renderToScreen ? null : this.renderTarget);
        renderer.render(this.scene, this.camera);
      }
    }, {
      key: "setSize",
      value: function setSize(width, height) {
        if (this.resize) {
          width = Math.max(1, width);
          height = Math.max(1, height);
          this.renderTarget.setSize(width, height);
        }
      }
    }]);

    return SavePass;
  }(Pass);

  var ShaderPass = function (_Pass10) {
    _inherits(ShaderPass, _Pass10);

    function ShaderPass(material) {
      var _this21;

      var input = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "inputBuffer";

      _classCallCheck(this, ShaderPass);

      _this21 = _possibleConstructorReturn(this, _getPrototypeOf(ShaderPass).call(this, "ShaderPass"));

      _this21.setFullscreenMaterial(material);

      _this21.uniform = null;

      _this21.setInput(input);

      return _this21;
    }

    _createClass(ShaderPass, [{
      key: "setInput",
      value: function setInput(input) {
        var material = this.getFullscreenMaterial();
        this.uniform = null;

        if (material !== null) {
          var uniforms = material.uniforms;

          if (uniforms !== undefined && uniforms[input] !== undefined) {
            this.uniform = uniforms[input];
          }
        }
      }
    }, {
      key: "render",
      value: function render(renderer, inputBuffer, outputBuffer, deltaTime, stencilTest) {
        if (this.uniform !== null) {
          this.uniform.value = inputBuffer.texture;
        }

        renderer.setRenderTarget(this.renderToScreen ? null : outputBuffer);
        renderer.render(this.scene, this.camera);
      }
    }]);

    return ShaderPass;
  }(Pass);

  var EffectComposer = function () {
    function EffectComposer() {
      var renderer = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

      var _ref8 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
          _ref8$depthBuffer = _ref8.depthBuffer,
          depthBuffer = _ref8$depthBuffer === void 0 ? true : _ref8$depthBuffer,
          _ref8$stencilBuffer = _ref8.stencilBuffer,
          stencilBuffer = _ref8$stencilBuffer === void 0 ? false : _ref8$stencilBuffer;

      _classCallCheck(this, EffectComposer);

      this.renderer = renderer;
      this.inputBuffer = null;
      this.outputBuffer = null;

      if (this.renderer !== null) {
        this.renderer.autoClear = false;
        this.inputBuffer = this.createBuffer(depthBuffer, stencilBuffer);
        this.outputBuffer = this.inputBuffer.clone();
      }

      this.copyPass = new ShaderPass(new CopyMaterial());
      this.depthTexture = null;
      this.passes = [];
    }

    _createClass(EffectComposer, [{
      key: "getRenderer",
      value: function getRenderer() {
        return this.renderer;
      }
    }, {
      key: "replaceRenderer",
      value: function replaceRenderer(renderer) {
        var updateDOM = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
        var oldRenderer = this.renderer;

        if (oldRenderer !== null && oldRenderer !== renderer) {
          var oldSize = oldRenderer.getSize(new three.Vector2());
          var newSize = renderer.getSize(new three.Vector2());
          var parent = oldRenderer.domElement.parentNode;
          this.renderer = renderer;
          this.renderer.autoClear = false;

          if (!oldSize.equals(newSize)) {
            this.setSize();
          }

          if (updateDOM && parent !== null) {
            parent.removeChild(oldRenderer.domElement);
            parent.appendChild(renderer.domElement);
          }
        }

        return oldRenderer;
      }
    }, {
      key: "createDepthTexture",
      value: function createDepthTexture() {
        var depthTexture = this.depthTexture = new three.DepthTexture();

        if (this.inputBuffer.stencilBuffer) {
          depthTexture.format = three.DepthStencilFormat;
          depthTexture.type = three.UnsignedInt248Type;
        }

        return depthTexture;
      }
    }, {
      key: "createBuffer",
      value: function createBuffer(depthBuffer, stencilBuffer) {
        var drawingBufferSize = this.renderer.getDrawingBufferSize(new three.Vector2());
        var alpha = this.renderer.getContext().getContextAttributes().alpha;
        var renderTarget = new three.WebGLRenderTarget(drawingBufferSize.width, drawingBufferSize.height, {
          minFilter: three.LinearFilter,
          magFilter: three.LinearFilter,
          format: alpha ? three.RGBAFormat : three.RGBFormat,
          depthBuffer: depthBuffer,
          stencilBuffer: stencilBuffer
        });
        renderTarget.texture.name = "EffectComposer.Buffer";
        renderTarget.texture.generateMipmaps = false;
        return renderTarget;
      }
    }, {
      key: "addPass",
      value: function addPass(pass, index) {
        var passes = this.passes;
        var renderer = this.renderer;
        var drawingBufferSize = renderer.getDrawingBufferSize(new three.Vector2());
        pass.setSize(drawingBufferSize.width, drawingBufferSize.height);
        pass.initialize(renderer, renderer.getContext().getContextAttributes().alpha);

        if (index !== undefined) {
          passes.splice(index, 0, pass);
        } else {
          passes.push(pass);
        }

        if (pass.needsDepthTexture || this.depthTexture !== null) {
          if (this.depthTexture === null) {
            var depthTexture = this.createDepthTexture();
            var _iteratorNormalCompletion16 = true;
            var _didIteratorError16 = false;
            var _iteratorError16 = undefined;

            try {
              for (var _iterator16 = passes[Symbol.iterator](), _step16; !(_iteratorNormalCompletion16 = (_step16 = _iterator16.next()).done); _iteratorNormalCompletion16 = true) {
                pass = _step16.value;
                pass.setDepthTexture(depthTexture);
              }
            } catch (err) {
              _didIteratorError16 = true;
              _iteratorError16 = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion16 && _iterator16["return"] != null) {
                  _iterator16["return"]();
                }
              } finally {
                if (_didIteratorError16) {
                  throw _iteratorError16;
                }
              }
            }
          } else {
            pass.setDepthTexture(this.depthTexture);
          }
        }
      }
    }, {
      key: "removePass",
      value: function removePass(pass) {
        var passes = this.passes;
        var removed = passes.splice(passes.indexOf(pass), 1).length > 0;

        if (removed && this.depthTexture !== null) {
          var reducer = function reducer(a, b) {
            return a || b.needsDepthTexture;
          };

          var depthTextureRequired = passes.reduce(reducer, false);

          if (!depthTextureRequired) {
            this.depthTexture.dispose();
            this.depthTexture = null;
            this.inputBuffer.depthTexture = null;
            this.outputBuffer.depthTexture = null;
            var _iteratorNormalCompletion17 = true;
            var _didIteratorError17 = false;
            var _iteratorError17 = undefined;

            try {
              for (var _iterator17 = passes[Symbol.iterator](), _step17; !(_iteratorNormalCompletion17 = (_step17 = _iterator17.next()).done); _iteratorNormalCompletion17 = true) {
                pass = _step17.value;
                pass.setDepthTexture(null);
              }
            } catch (err) {
              _didIteratorError17 = true;
              _iteratorError17 = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion17 && _iterator17["return"] != null) {
                  _iterator17["return"]();
                }
              } finally {
                if (_didIteratorError17) {
                  throw _iteratorError17;
                }
              }
            }
          }
        }
      }
    }, {
      key: "render",
      value: function render(deltaTime) {
        var renderer = this.renderer;
        var copyPass = this.copyPass;
        var inputBuffer = this.inputBuffer;
        var outputBuffer = this.outputBuffer;
        var stencilTest = false;
        var context, stencil, buffer;
        var _iteratorNormalCompletion18 = true;
        var _didIteratorError18 = false;
        var _iteratorError18 = undefined;

        try {
          for (var _iterator18 = this.passes[Symbol.iterator](), _step18; !(_iteratorNormalCompletion18 = (_step18 = _iterator18.next()).done); _iteratorNormalCompletion18 = true) {
            var pass = _step18.value;

            if (pass.enabled) {
              pass.render(renderer, inputBuffer, outputBuffer, deltaTime, stencilTest);

              if (pass.needsSwap) {
                if (stencilTest) {
                  copyPass.renderToScreen = pass.renderToScreen;
                  context = renderer.getContext();
                  stencil = renderer.state.buffers.stencil;
                  stencil.setFunc(context.NOTEQUAL, 1, 0xffffffff);
                  copyPass.render(renderer, inputBuffer, outputBuffer, deltaTime, stencilTest);
                  stencil.setFunc(context.EQUAL, 1, 0xffffffff);
                }

                buffer = inputBuffer;
                inputBuffer = outputBuffer;
                outputBuffer = buffer;
              }

              if (pass instanceof MaskPass) {
                stencilTest = true;
              } else if (pass instanceof ClearMaskPass) {
                stencilTest = false;
              }
            }
          }
        } catch (err) {
          _didIteratorError18 = true;
          _iteratorError18 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion18 && _iterator18["return"] != null) {
              _iterator18["return"]();
            }
          } finally {
            if (_didIteratorError18) {
              throw _iteratorError18;
            }
          }
        }
      }
    }, {
      key: "setSize",
      value: function setSize(width, height) {
        var renderer = this.renderer;

        if (width === undefined || height === undefined) {
          var size = renderer.getSize(new three.Vector2());
          width = size.width;
          height = size.height;
        }

        renderer.setSize(width, height);
        var drawingBufferSize = renderer.getDrawingBufferSize(new three.Vector2());
        this.inputBuffer.setSize(drawingBufferSize.width, drawingBufferSize.height);
        this.outputBuffer.setSize(drawingBufferSize.width, drawingBufferSize.height);
        var _iteratorNormalCompletion19 = true;
        var _didIteratorError19 = false;
        var _iteratorError19 = undefined;

        try {
          for (var _iterator19 = this.passes[Symbol.iterator](), _step19; !(_iteratorNormalCompletion19 = (_step19 = _iterator19.next()).done); _iteratorNormalCompletion19 = true) {
            var pass = _step19.value;
            pass.setSize(drawingBufferSize.width, drawingBufferSize.height);
          }
        } catch (err) {
          _didIteratorError19 = true;
          _iteratorError19 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion19 && _iterator19["return"] != null) {
              _iterator19["return"]();
            }
          } finally {
            if (_didIteratorError19) {
              throw _iteratorError19;
            }
          }
        }
      }
    }, {
      key: "reset",
      value: function reset() {
        var renderTarget = this.createBuffer(this.inputBuffer.depthBuffer, this.inputBuffer.stencilBuffer);
        this.dispose();
        this.inputBuffer = renderTarget;
        this.outputBuffer = renderTarget.clone();
        this.depthTexture = null;
        this.copyPass = new ShaderPass(new CopyMaterial());
      }
    }, {
      key: "dispose",
      value: function dispose() {
        var _iteratorNormalCompletion20 = true;
        var _didIteratorError20 = false;
        var _iteratorError20 = undefined;

        try {
          for (var _iterator20 = this.passes[Symbol.iterator](), _step20; !(_iteratorNormalCompletion20 = (_step20 = _iterator20.next()).done); _iteratorNormalCompletion20 = true) {
            var pass = _step20.value;
            pass.dispose();
          }
        } catch (err) {
          _didIteratorError20 = true;
          _iteratorError20 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion20 && _iterator20["return"] != null) {
              _iterator20["return"]();
            }
          } finally {
            if (_didIteratorError20) {
              throw _iteratorError20;
            }
          }
        }

        this.passes = [];

        if (this.inputBuffer !== null) {
          this.inputBuffer.dispose();
          this.inputBuffer = null;
        }

        if (this.outputBuffer !== null) {
          this.outputBuffer.dispose();
          this.outputBuffer = null;
        }

        if (this.depthTexture !== null) {
          this.depthTexture.dispose();
        }

        this.copyPass.dispose();
      }
    }]);

    return EffectComposer;
  }();

  var fragmentShader$a = "uniform sampler2D texture;\n#ifdef ASPECT_CORRECTION\nvarying vec2 vUv2;\n#endif\nvoid mainImage(const in vec4 inputColor,const in vec2 uv,out vec4 outputColor){\n#ifdef ASPECT_CORRECTION\noutputColor=texture2D(texture,vUv2);\n#else\noutputColor=texture2D(texture,uv);\n#endif\n}";

  var BloomEffect = function (_Effect) {
    _inherits(BloomEffect, _Effect);

    function BloomEffect() {
      var _this22;

      var _ref9 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          _ref9$blendFunction = _ref9.blendFunction,
          blendFunction = _ref9$blendFunction === void 0 ? BlendFunction.SCREEN : _ref9$blendFunction,
          _ref9$luminanceThresh = _ref9.luminanceThreshold,
          luminanceThreshold = _ref9$luminanceThresh === void 0 ? 0.9 : _ref9$luminanceThresh,
          _ref9$luminanceSmooth = _ref9.luminanceSmoothing,
          luminanceSmoothing = _ref9$luminanceSmooth === void 0 ? 0.025 : _ref9$luminanceSmooth,
          _ref9$resolutionScale = _ref9.resolutionScale,
          resolutionScale = _ref9$resolutionScale === void 0 ? 0.5 : _ref9$resolutionScale,
          _ref9$width = _ref9.width,
          width = _ref9$width === void 0 ? BlurPass.AUTO_SIZE : _ref9$width,
          _ref9$height = _ref9.height,
          height = _ref9$height === void 0 ? BlurPass.AUTO_SIZE : _ref9$height,
          _ref9$kernelSize = _ref9.kernelSize,
          kernelSize = _ref9$kernelSize === void 0 ? KernelSize.LARGE : _ref9$kernelSize;

      _classCallCheck(this, BloomEffect);

      _this22 = _possibleConstructorReturn(this, _getPrototypeOf(BloomEffect).call(this, "BloomEffect", fragmentShader$a, {
        blendFunction: blendFunction,
        uniforms: new Map([["texture", new three.Uniform(null)]])
      }));
      _this22.renderTarget = new three.WebGLRenderTarget(1, 1, {
        minFilter: three.LinearFilter,
        magFilter: three.LinearFilter,
        stencilBuffer: false,
        depthBuffer: false
      });
      _this22.renderTarget.texture.name = "Bloom.Target";
      _this22.renderTarget.texture.generateMipmaps = false;
      _this22.uniforms.get("texture").value = _this22.renderTarget.texture;
      _this22.blurPass = new BlurPass({
        resolutionScale: resolutionScale,
        width: width,
        height: height,
        kernelSize: kernelSize
      });
      _this22.luminancePass = new ShaderPass(new LuminanceMaterial(true));
      _this22.luminanceMaterial.threshold = luminanceThreshold;
      _this22.luminanceMaterial.smoothing = luminanceSmoothing;
      return _this22;
    }

    _createClass(BloomEffect, [{
      key: "getResolutionScale",
      value: function getResolutionScale() {
        return this.blurPass.getResolutionScale();
      }
    }, {
      key: "setResolutionScale",
      value: function setResolutionScale(scale) {
        var blurPass = this.blurPass;
        blurPass.setResolutionScale(scale);
        this.renderTarget.setSize(blurPass.width, blurPass.height);
      }
    }, {
      key: "update",
      value: function update(renderer, inputBuffer, deltaTime) {
        var renderTarget = this.renderTarget;
        this.luminancePass.render(renderer, inputBuffer, renderTarget);
        this.blurPass.render(renderer, renderTarget, renderTarget);
      }
    }, {
      key: "setSize",
      value: function setSize(width, height) {
        var blurPass = this.blurPass;
        blurPass.setSize(width, height);
        this.renderTarget.setSize(blurPass.width, blurPass.height);
      }
    }, {
      key: "initialize",
      value: function initialize(renderer, alpha) {
        this.blurPass.initialize(renderer, alpha);

        if (!alpha) {
          this.renderTarget.texture.format = three.RGBFormat;
        }
      }
    }, {
      key: "texture",
      get: function get() {
        return this.renderTarget.texture;
      }
    }, {
      key: "luminanceMaterial",
      get: function get() {
        return this.luminancePass.getFullscreenMaterial();
      }
    }, {
      key: "width",
      get: function get() {
        return this.blurPass.width;
      },
      set: function set(value) {
        var blurPass = this.blurPass;
        blurPass.width = value;
        this.renderTarget.setSize(blurPass.width, blurPass.height);
      }
    }, {
      key: "height",
      get: function get() {
        return this.blurPass.height;
      },
      set: function set(value) {
        var blurPass = this.blurPass;
        blurPass.height = value;
        this.renderTarget.setSize(blurPass.width, blurPass.height);
      }
    }, {
      key: "dithering",
      get: function get() {
        return this.blurPass.dithering;
      },
      set: function set(value) {
        this.blurPass.dithering = value;
      }
    }, {
      key: "kernelSize",
      get: function get() {
        return this.blurPass.kernelSize;
      },
      set: function set(value) {
        this.blurPass.kernelSize = value;
      }
    }, {
      key: "distinction",
      get: function get() {
        console.warn(this.name, "The distinction field has been removed, use luminanceMaterial.threshold and luminanceMaterial.smoothing instead.");
        return 1.0;
      },
      set: function set(value) {
        console.warn(this.name, "The distinction field has been removed, use luminanceMaterial.threshold and luminanceMaterial.smoothing instead.");
      }
    }]);

    return BloomEffect;
  }(Effect);

  var fragmentShader$b = "uniform float focus;uniform float dof;uniform float aperture;uniform float maxBlur;void mainImage(const in vec4 inputColor,const in vec2 uv,const in float depth,out vec4 outputColor){vec2 aspectCorrection=vec2(1.0,aspect);float focusNear=clamp(focus-dof,0.0,1.0);float focusFar=clamp(focus+dof,0.0,1.0);float low=step(depth,focusNear);float high=step(focusFar,depth);float factor=(depth-focusNear)*low+(depth-focusFar)*high;vec2 dofBlur=vec2(clamp(factor*aperture,-maxBlur,maxBlur));vec2 dofblur9=dofBlur*0.9;vec2 dofblur7=dofBlur*0.7;vec2 dofblur4=dofBlur*0.4;vec4 color=inputColor;color+=texture2D(inputBuffer,uv+(vec2(0.0,0.4)*aspectCorrection)*dofBlur);color+=texture2D(inputBuffer,uv+(vec2(0.15,0.37)*aspectCorrection)*dofBlur);color+=texture2D(inputBuffer,uv+(vec2(0.29,0.29)*aspectCorrection)*dofBlur);color+=texture2D(inputBuffer,uv+(vec2(-0.37,0.15)*aspectCorrection)*dofBlur);color+=texture2D(inputBuffer,uv+(vec2(0.40,0.0)*aspectCorrection)*dofBlur);color+=texture2D(inputBuffer,uv+(vec2(0.37,-0.15)*aspectCorrection)*dofBlur);color+=texture2D(inputBuffer,uv+(vec2(0.29,-0.29)*aspectCorrection)*dofBlur);color+=texture2D(inputBuffer,uv+(vec2(-0.15,-0.37)*aspectCorrection)*dofBlur);color+=texture2D(inputBuffer,uv+(vec2(0.0,-0.4)*aspectCorrection)*dofBlur);color+=texture2D(inputBuffer,uv+(vec2(-0.15,0.37)*aspectCorrection)*dofBlur);color+=texture2D(inputBuffer,uv+(vec2(-0.29,0.29)*aspectCorrection)*dofBlur);color+=texture2D(inputBuffer,uv+(vec2(0.37,0.15)*aspectCorrection)*dofBlur);color+=texture2D(inputBuffer,uv+(vec2(-0.4,0.0)*aspectCorrection)*dofBlur);color+=texture2D(inputBuffer,uv+(vec2(-0.37,-0.15)*aspectCorrection)*dofBlur);color+=texture2D(inputBuffer,uv+(vec2(-0.29,-0.29)*aspectCorrection)*dofBlur);color+=texture2D(inputBuffer,uv+(vec2(0.15,-0.37)*aspectCorrection)*dofBlur);color+=texture2D(inputBuffer,uv+(vec2(0.15,0.37)*aspectCorrection)*dofblur9);color+=texture2D(inputBuffer,uv+(vec2(-0.37,0.15)*aspectCorrection)*dofblur9);color+=texture2D(inputBuffer,uv+(vec2(0.37,-0.15)*aspectCorrection)*dofblur9);color+=texture2D(inputBuffer,uv+(vec2(-0.15,-0.37)*aspectCorrection)*dofblur9);color+=texture2D(inputBuffer,uv+(vec2(-0.15,0.37)*aspectCorrection)*dofblur9);color+=texture2D(inputBuffer,uv+(vec2(0.37,0.15)*aspectCorrection)*dofblur9);color+=texture2D(inputBuffer,uv+(vec2(-0.37,-0.15)*aspectCorrection)*dofblur9);color+=texture2D(inputBuffer,uv+(vec2(0.15,-0.37)*aspectCorrection)*dofblur9);color+=texture2D(inputBuffer,uv+(vec2(0.29,0.29)*aspectCorrection)*dofblur7);color+=texture2D(inputBuffer,uv+(vec2(0.40,0.0)*aspectCorrection)*dofblur7);color+=texture2D(inputBuffer,uv+(vec2(0.29,-0.29)*aspectCorrection)*dofblur7);color+=texture2D(inputBuffer,uv+(vec2(0.0,-0.4)*aspectCorrection)*dofblur7);color+=texture2D(inputBuffer,uv+(vec2(-0.29,0.29)*aspectCorrection)*dofblur7);color+=texture2D(inputBuffer,uv+(vec2(-0.4,0.0)*aspectCorrection)*dofblur7);color+=texture2D(inputBuffer,uv+(vec2(-0.29,-0.29)*aspectCorrection)*dofblur7);color+=texture2D(inputBuffer,uv+(vec2(0.0,0.4)*aspectCorrection)*dofblur7);color+=texture2D(inputBuffer,uv+(vec2(0.29,0.29)*aspectCorrection)*dofblur4);color+=texture2D(inputBuffer,uv+(vec2(0.4,0.0)*aspectCorrection)*dofblur4);color+=texture2D(inputBuffer,uv+(vec2(0.29,-0.29)*aspectCorrection)*dofblur4);color+=texture2D(inputBuffer,uv+(vec2(0.0,-0.4)*aspectCorrection)*dofblur4);color+=texture2D(inputBuffer,uv+(vec2(-0.29,0.29)*aspectCorrection)*dofblur4);color+=texture2D(inputBuffer,uv+(vec2(-0.4,0.0)*aspectCorrection)*dofblur4);color+=texture2D(inputBuffer,uv+(vec2(-0.29,-0.29)*aspectCorrection)*dofblur4);color+=texture2D(inputBuffer,uv+(vec2(0.0,0.4)*aspectCorrection)*dofblur4);outputColor=color/41.0;}";

  var BokehEffect = function (_Effect2) {
    _inherits(BokehEffect, _Effect2);

    function BokehEffect() {
      var _ref10 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          _ref10$blendFunction = _ref10.blendFunction,
          blendFunction = _ref10$blendFunction === void 0 ? BlendFunction.NORMAL : _ref10$blendFunction,
          _ref10$focus = _ref10.focus,
          focus = _ref10$focus === void 0 ? 0.5 : _ref10$focus,
          _ref10$dof = _ref10.dof,
          dof = _ref10$dof === void 0 ? 0.02 : _ref10$dof,
          _ref10$aperture = _ref10.aperture,
          aperture = _ref10$aperture === void 0 ? 0.015 : _ref10$aperture,
          _ref10$maxBlur = _ref10.maxBlur,
          maxBlur = _ref10$maxBlur === void 0 ? 1.0 : _ref10$maxBlur;

      _classCallCheck(this, BokehEffect);

      return _possibleConstructorReturn(this, _getPrototypeOf(BokehEffect).call(this, "BokehEffect", fragmentShader$b, {
        blendFunction: blendFunction,
        attributes: EffectAttribute.CONVOLUTION | EffectAttribute.DEPTH,
        uniforms: new Map([["focus", new three.Uniform(focus)], ["dof", new three.Uniform(dof)], ["aperture", new three.Uniform(aperture)], ["maxBlur", new three.Uniform(maxBlur)]])
      }));
    }

    return BokehEffect;
  }(Effect);

  var fragmentShader$c = "uniform float brightness;uniform float contrast;void mainImage(const in vec4 inputColor,const in vec2 uv,out vec4 outputColor){vec3 color=inputColor.rgb+vec3(brightness-0.5);if(contrast>0.0){color/=vec3(1.0-contrast);}else{color*=vec3(1.0+contrast);}outputColor=vec4(min(color+vec3(0.5),1.0),inputColor.a);}";

  var BrightnessContrastEffect = function (_Effect3) {
    _inherits(BrightnessContrastEffect, _Effect3);

    function BrightnessContrastEffect() {
      var _ref11 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          _ref11$blendFunction = _ref11.blendFunction,
          blendFunction = _ref11$blendFunction === void 0 ? BlendFunction.NORMAL : _ref11$blendFunction,
          _ref11$brightness = _ref11.brightness,
          brightness = _ref11$brightness === void 0 ? 0.0 : _ref11$brightness,
          _ref11$contrast = _ref11.contrast,
          contrast = _ref11$contrast === void 0 ? 0.0 : _ref11$contrast;

      _classCallCheck(this, BrightnessContrastEffect);

      return _possibleConstructorReturn(this, _getPrototypeOf(BrightnessContrastEffect).call(this, "BrightnessContrastEffect", fragmentShader$c, {
        blendFunction: blendFunction,
        uniforms: new Map([["brightness", new three.Uniform(brightness)], ["contrast", new three.Uniform(contrast)]])
      }));
    }

    return BrightnessContrastEffect;
  }(Effect);

  var fragmentShader$d = "void mainImage(const in vec4 inputColor,const in vec2 uv,out vec4 outputColor){float sum=inputColor.r+inputColor.g+inputColor.b;outputColor=vec4(vec3(sum/3.0),inputColor.a);}";

  var ColorAverageEffect = function (_Effect4) {
    _inherits(ColorAverageEffect, _Effect4);

    function ColorAverageEffect() {
      var blendFunction = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : BlendFunction.NORMAL;

      _classCallCheck(this, ColorAverageEffect);

      return _possibleConstructorReturn(this, _getPrototypeOf(ColorAverageEffect).call(this, "ColorAverageEffect", fragmentShader$d, {
        blendFunction: blendFunction
      }));
    }

    return ColorAverageEffect;
  }(Effect);

  var fragmentShader$e = "uniform float factor;void mainImage(const in vec4 inputColor,const in vec2 uv,out vec4 outputColor){outputColor=vec4(floor(inputColor.rgb*factor+0.5)/factor,inputColor.a);}";

  var ColorDepthEffect = function (_Effect5) {
    _inherits(ColorDepthEffect, _Effect5);

    function ColorDepthEffect() {
      var _this23;

      var _ref12 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          _ref12$blendFunction = _ref12.blendFunction,
          blendFunction = _ref12$blendFunction === void 0 ? BlendFunction.NORMAL : _ref12$blendFunction,
          _ref12$bits = _ref12.bits,
          bits = _ref12$bits === void 0 ? 16 : _ref12$bits;

      _classCallCheck(this, ColorDepthEffect);

      _this23 = _possibleConstructorReturn(this, _getPrototypeOf(ColorDepthEffect).call(this, "ColorDepthEffect", fragmentShader$e, {
        blendFunction: blendFunction,
        uniforms: new Map([["factor", new three.Uniform(1.0)]])
      }));
      _this23.bits = 0;

      _this23.setBitDepth(bits);

      return _this23;
    }

    _createClass(ColorDepthEffect, [{
      key: "getBitDepth",
      value: function getBitDepth() {
        return this.bits;
      }
    }, {
      key: "setBitDepth",
      value: function setBitDepth(bits) {
        this.bits = bits;
        this.uniforms.get("factor").value = Math.pow(2.0, bits / 3.0);
      }
    }]);

    return ColorDepthEffect;
  }(Effect);

  var fragmentShader$f = "varying vec2 vUvR;varying vec2 vUvB;void mainImage(const in vec4 inputColor,const in vec2 uv,out vec4 outputColor){vec4 color=inputColor;color.r=texture2D(inputBuffer,vUvR).r;color.b=texture2D(inputBuffer,vUvB).b;outputColor=color;}";
  var vertexShader$6 = "uniform vec2 offset;varying vec2 vUvR;varying vec2 vUvB;void mainSupport(const in vec2 uv){vUvR=uv+offset;vUvB=uv-offset;}";

  var ChromaticAberrationEffect = function (_Effect6) {
    _inherits(ChromaticAberrationEffect, _Effect6);

    function ChromaticAberrationEffect() {
      var _ref13 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          _ref13$blendFunction = _ref13.blendFunction,
          blendFunction = _ref13$blendFunction === void 0 ? BlendFunction.NORMAL : _ref13$blendFunction,
          _ref13$offset = _ref13.offset,
          offset = _ref13$offset === void 0 ? new three.Vector2(0.001, 0.0005) : _ref13$offset;

      _classCallCheck(this, ChromaticAberrationEffect);

      return _possibleConstructorReturn(this, _getPrototypeOf(ChromaticAberrationEffect).call(this, "ChromaticAberrationEffect", fragmentShader$f, {
        vertexShader: vertexShader$6,
        blendFunction: blendFunction,
        attributes: EffectAttribute.CONVOLUTION,
        uniforms: new Map([["offset", new three.Uniform(offset)]])
      }));
    }

    _createClass(ChromaticAberrationEffect, [{
      key: "offset",
      get: function get() {
        return this.uniforms.get("offset").value;
      },
      set: function set(value) {
        this.uniforms.get("offset").value = value;
      }
    }]);

    return ChromaticAberrationEffect;
  }(Effect);

  var fragmentShader$g = "void mainImage(const in vec4 inputColor,const in vec2 uv,const in float depth,out vec4 outputColor){\n#ifdef INVERTED\nvec3 color=vec3(1.0-depth);\n#else\nvec3 color=vec3(depth);\n#endif\noutputColor=vec4(color,inputColor.a);}";

  var DepthEffect = function (_Effect7) {
    _inherits(DepthEffect, _Effect7);

    function DepthEffect() {
      var _this24;

      var _ref14 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          _ref14$blendFunction = _ref14.blendFunction,
          blendFunction = _ref14$blendFunction === void 0 ? BlendFunction.NORMAL : _ref14$blendFunction,
          _ref14$inverted = _ref14.inverted,
          inverted = _ref14$inverted === void 0 ? false : _ref14$inverted;

      _classCallCheck(this, DepthEffect);

      _this24 = _possibleConstructorReturn(this, _getPrototypeOf(DepthEffect).call(this, "DepthEffect", fragmentShader$g, {
        blendFunction: blendFunction,
        attributes: EffectAttribute.DEPTH
      }));
      _this24.inverted = inverted;
      return _this24;
    }

    _createClass(DepthEffect, [{
      key: "inverted",
      get: function get() {
        return this.defines.has("INVERTED");
      },
      set: function set(value) {
        value ? this.defines.set("INVERTED", "1") : this.defines["delete"]("INVERTED");
      }
    }]);

    return DepthEffect;
  }(Effect);

  var fragmentShader$h = "uniform vec2 angle;uniform float scale;float pattern(const in vec2 uv){vec2 point=scale*vec2(dot(angle.yx,vec2(uv.x,-uv.y)),dot(angle,uv));return(sin(point.x)*sin(point.y))*4.0;}void mainImage(const in vec4 inputColor,const in vec2 uv,out vec4 outputColor){vec3 color=vec3(inputColor.rgb*10.0-5.0+pattern(uv*resolution));outputColor=vec4(color,inputColor.a);}";

  var DotScreenEffect = function (_Effect8) {
    _inherits(DotScreenEffect, _Effect8);

    function DotScreenEffect() {
      var _this25;

      var _ref15 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          _ref15$blendFunction = _ref15.blendFunction,
          blendFunction = _ref15$blendFunction === void 0 ? BlendFunction.NORMAL : _ref15$blendFunction,
          _ref15$angle = _ref15.angle,
          angle = _ref15$angle === void 0 ? Math.PI * 0.5 : _ref15$angle,
          _ref15$scale = _ref15.scale,
          scale = _ref15$scale === void 0 ? 1.0 : _ref15$scale;

      _classCallCheck(this, DotScreenEffect);

      _this25 = _possibleConstructorReturn(this, _getPrototypeOf(DotScreenEffect).call(this, "DotScreenEffect", fragmentShader$h, {
        blendFunction: blendFunction,
        uniforms: new Map([["angle", new three.Uniform(new three.Vector2())], ["scale", new three.Uniform(scale)]])
      }));

      _this25.setAngle(angle);

      return _this25;
    }

    _createClass(DotScreenEffect, [{
      key: "setAngle",
      value: function setAngle(angle) {
        this.uniforms.get("angle").value.set(Math.sin(angle), Math.cos(angle));
      }
    }]);

    return DotScreenEffect;
  }(Effect);

  var fragmentShader$i = "uniform float gamma;void mainImage(const in vec4 inputColor,const in vec2 uv,out vec4 outputColor){outputColor=LinearToGamma(max(inputColor,0.0),gamma);}";

  var GammaCorrectionEffect = function (_Effect9) {
    _inherits(GammaCorrectionEffect, _Effect9);

    function GammaCorrectionEffect() {
      var _ref16 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          _ref16$blendFunction = _ref16.blendFunction,
          blendFunction = _ref16$blendFunction === void 0 ? BlendFunction.NORMAL : _ref16$blendFunction,
          _ref16$gamma = _ref16.gamma,
          gamma = _ref16$gamma === void 0 ? 2.0 : _ref16$gamma;

      _classCallCheck(this, GammaCorrectionEffect);

      return _possibleConstructorReturn(this, _getPrototypeOf(GammaCorrectionEffect).call(this, "GammaCorrectionEffect", fragmentShader$i, {
        blendFunction: blendFunction,
        uniforms: new Map([["gamma", new three.Uniform(gamma)]])
      }));
    }

    return GammaCorrectionEffect;
  }(Effect);

  var fragmentShader$j = "uniform sampler2D perturbationMap;uniform bool active;uniform float columns;uniform float random;uniform vec2 seed;uniform vec2 distortion;void mainUv(inout vec2 uv){if(active){vec4 normal=texture2D(perturbationMap,uv*random*random);if(uv.y<distortion.x+columns&&uv.y>distortion.x-columns*random){float sx=clamp(ceil(seed.x),0.0,1.0);uv.y=sx*(1.0-(uv.y+distortion.y))+(1.0-sx)*distortion.y;}if(uv.x<distortion.y+columns&&uv.x>distortion.y-columns*random){float sy=clamp(ceil(seed.y),0.0,1.0);uv.x=sy*distortion.x+(1.0-sy)*(1.0-(uv.x+distortion.x));}uv.x+=normal.x*seed.x*(random*0.2);uv.y+=normal.y*seed.y*(random*0.2);}}";
  var generatedTexture = "Glitch.Generated";

  function randomFloat(low, high) {
    return low + Math.random() * (high - low);
  }

  var GlitchEffect = function (_Effect10) {
    _inherits(GlitchEffect, _Effect10);

    function GlitchEffect() {
      var _this26;

      var _ref17 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          _ref17$blendFunction = _ref17.blendFunction,
          blendFunction = _ref17$blendFunction === void 0 ? BlendFunction.NORMAL : _ref17$blendFunction,
          _ref17$chromaticAberr = _ref17.chromaticAberrationOffset,
          chromaticAberrationOffset = _ref17$chromaticAberr === void 0 ? null : _ref17$chromaticAberr,
          _ref17$delay = _ref17.delay,
          delay = _ref17$delay === void 0 ? new three.Vector2(1.5, 3.5) : _ref17$delay,
          _ref17$duration = _ref17.duration,
          duration = _ref17$duration === void 0 ? new three.Vector2(0.6, 1.0) : _ref17$duration,
          _ref17$strength = _ref17.strength,
          strength = _ref17$strength === void 0 ? new three.Vector2(0.3, 1.0) : _ref17$strength,
          _ref17$columns = _ref17.columns,
          columns = _ref17$columns === void 0 ? 0.05 : _ref17$columns,
          _ref17$ratio = _ref17.ratio,
          ratio = _ref17$ratio === void 0 ? 0.85 : _ref17$ratio,
          _ref17$perturbationMa = _ref17.perturbationMap,
          perturbationMap = _ref17$perturbationMa === void 0 ? null : _ref17$perturbationMa,
          _ref17$dtSize = _ref17.dtSize,
          dtSize = _ref17$dtSize === void 0 ? 64 : _ref17$dtSize;

      _classCallCheck(this, GlitchEffect);

      _this26 = _possibleConstructorReturn(this, _getPrototypeOf(GlitchEffect).call(this, "GlitchEffect", fragmentShader$j, {
        blendFunction: blendFunction,
        uniforms: new Map([["perturbationMap", new three.Uniform(null)], ["columns", new three.Uniform(columns)], ["active", new three.Uniform(false)], ["random", new three.Uniform(0.02)], ["seed", new three.Uniform(new three.Vector2())], ["distortion", new three.Uniform(new three.Vector2())]])
      }));
      _this26.perturbationMap = null;

      _this26.setPerturbationMap(perturbationMap === null ? _this26.generatePerturbationMap(dtSize) : perturbationMap);

      _this26.perturbationMap.generateMipmaps = false;
      _this26.delay = delay;
      _this26.duration = duration;
      _this26.breakPoint = new three.Vector2(randomFloat(_this26.delay.x, _this26.delay.y), randomFloat(_this26.duration.x, _this26.duration.y));
      _this26.time = 0;
      _this26.seed = _this26.uniforms.get("seed").value;
      _this26.distortion = _this26.uniforms.get("distortion").value;
      _this26.mode = GlitchMode.SPORADIC;
      _this26.strength = strength;
      _this26.ratio = ratio;
      _this26.chromaticAberrationOffset = chromaticAberrationOffset;
      return _this26;
    }

    _createClass(GlitchEffect, [{
      key: "getPerturbationMap",
      value: function getPerturbationMap() {
        return this.perturbationMap;
      }
    }, {
      key: "setPerturbationMap",
      value: function setPerturbationMap(perturbationMap) {
        if (this.perturbationMap !== null && this.perturbationMap.name === generatedTexture) {
          this.perturbationMap.dispose();
        }

        perturbationMap.wrapS = perturbationMap.wrapT = three.RepeatWrapping;
        perturbationMap.magFilter = perturbationMap.minFilter = three.NearestFilter;
        this.perturbationMap = perturbationMap;
        this.uniforms.get("perturbationMap").value = perturbationMap;
      }
    }, {
      key: "generatePerturbationMap",
      value: function generatePerturbationMap() {
        var size = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 64;
        var pixels = size * size;
        var data = new Float32Array(pixels * 3);
        var i, x;

        for (i = 0; i < pixels; ++i) {
          x = Math.random();
          data[i * 3] = x;
          data[i * 3 + 1] = x;
          data[i * 3 + 2] = x;
        }

        var map = new three.DataTexture(data, size, size, three.RGBFormat, three.FloatType);
        map.name = generatedTexture;
        map.needsUpdate = true;
        return map;
      }
    }, {
      key: "update",
      value: function update(renderer, inputBuffer, deltaTime) {
        var mode = this.mode;
        var breakPoint = this.breakPoint;
        var offset = this.chromaticAberrationOffset;
        var s = this.strength;
        var time = this.time;
        var active = false;
        var r = 0.0,
            a = 0.0;
        var trigger;

        if (mode !== GlitchMode.DISABLED) {
          if (mode === GlitchMode.SPORADIC) {
            time += deltaTime;
            trigger = time > breakPoint.x;

            if (time >= breakPoint.x + breakPoint.y) {
              breakPoint.set(randomFloat(this.delay.x, this.delay.y), randomFloat(this.duration.x, this.duration.y));
              time = 0;
            }
          }

          r = Math.random();
          this.uniforms.get("random").value = r;

          if (trigger && r > this.ratio || mode === GlitchMode.CONSTANT_WILD) {
            active = true;
            r *= s.y * 0.03;
            a = randomFloat(-Math.PI, Math.PI);
            this.seed.set(randomFloat(-s.y, s.y), randomFloat(-s.y, s.y));
            this.distortion.set(randomFloat(0.0, 1.0), randomFloat(0.0, 1.0));
          } else if (trigger || mode === GlitchMode.CONSTANT_MILD) {
            active = true;
            r *= s.x * 0.03;
            a = randomFloat(-Math.PI, Math.PI);
            this.seed.set(randomFloat(-s.x, s.x), randomFloat(-s.x, s.x));
            this.distortion.set(randomFloat(0.0, 1.0), randomFloat(0.0, 1.0));
          }

          this.time = time;
        }

        if (offset !== null) {
          if (active) {
            offset.set(Math.cos(a), Math.sin(a)).multiplyScalar(r);
          } else {
            offset.set(0.0, 0.0);
          }
        }

        this.uniforms.get("active").value = active;
      }
    }, {
      key: "active",
      get: function get() {
        return this.uniforms.get("active").value;
      }
    }]);

    return GlitchEffect;
  }(Effect);

  var GlitchMode = {
    DISABLED: 0,
    SPORADIC: 1,
    CONSTANT_MILD: 2,
    CONSTANT_WILD: 3
  };
  var v = new three.Vector3();
  var m = new three.Matrix4();

  var GodRaysEffect = function (_Effect11) {
    _inherits(GodRaysEffect, _Effect11);

    function GodRaysEffect(camera, lightSource) {
      var _this27;

      var _ref18 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
          _ref18$blendFunction = _ref18.blendFunction,
          blendFunction = _ref18$blendFunction === void 0 ? BlendFunction.SCREEN : _ref18$blendFunction,
          _ref18$samples = _ref18.samples,
          samples = _ref18$samples === void 0 ? 60.0 : _ref18$samples,
          _ref18$density = _ref18.density,
          density = _ref18$density === void 0 ? 0.96 : _ref18$density,
          _ref18$decay = _ref18.decay,
          decay = _ref18$decay === void 0 ? 0.9 : _ref18$decay,
          _ref18$weight = _ref18.weight,
          weight = _ref18$weight === void 0 ? 0.4 : _ref18$weight,
          _ref18$exposure = _ref18.exposure,
          exposure = _ref18$exposure === void 0 ? 0.6 : _ref18$exposure,
          _ref18$clampMax = _ref18.clampMax,
          clampMax = _ref18$clampMax === void 0 ? 1.0 : _ref18$clampMax,
          _ref18$resolutionScal = _ref18.resolutionScale,
          resolutionScale = _ref18$resolutionScal === void 0 ? 0.5 : _ref18$resolutionScal,
          _ref18$width = _ref18.width,
          width = _ref18$width === void 0 ? BlurPass.AUTO_SIZE : _ref18$width,
          _ref18$height = _ref18.height,
          height = _ref18$height === void 0 ? BlurPass.AUTO_SIZE : _ref18$height,
          _ref18$kernelSize = _ref18.kernelSize,
          kernelSize = _ref18$kernelSize === void 0 ? KernelSize.SMALL : _ref18$kernelSize,
          _ref18$blur = _ref18.blur,
          blur = _ref18$blur === void 0 ? true : _ref18$blur;

      _classCallCheck(this, GodRaysEffect);

      _this27 = _possibleConstructorReturn(this, _getPrototypeOf(GodRaysEffect).call(this, "GodRaysEffect", fragmentShader$a, {
        blendFunction: blendFunction,
        attributes: EffectAttribute.DEPTH,
        uniforms: new Map([["texture", new three.Uniform(null)]])
      }));
      _this27.camera = camera;
      _this27.lightSource = lightSource;
      _this27.lightSource.material.depthWrite = false;
      _this27.lightSource.material.transparent = true;
      _this27.lightScene = new three.Scene();
      _this27.screenPosition = new three.Vector2();
      _this27.renderTargetX = new three.WebGLRenderTarget(1, 1, {
        minFilter: three.LinearFilter,
        magFilter: three.LinearFilter,
        stencilBuffer: false,
        depthBuffer: false
      });
      _this27.renderTargetX.texture.name = "GodRays.TargetX";
      _this27.renderTargetY = _this27.renderTargetX.clone();
      _this27.renderTargetY.texture.name = "GodRays.TargetY";
      _this27.uniforms.get("texture").value = _this27.renderTargetY.texture;
      _this27.renderTargetLight = _this27.renderTargetX.clone();
      _this27.renderTargetLight.texture.name = "GodRays.Light";
      _this27.renderTargetLight.depthBuffer = true;
      _this27.renderTargetLight.depthTexture = new three.DepthTexture();
      _this27.renderPassLight = new RenderPass(_this27.lightScene, camera);
      _this27.renderPassLight.getClearPass().overrideClearColor = new three.Color(0x000000);
      _this27.clearPass = new ClearPass(true, false, false);
      _this27.blurPass = new BlurPass({
        resolutionScale: resolutionScale,
        width: width,
        height: height,
        kernelSize: kernelSize
      });
      _this27.depthMaskPass = new ShaderPass(new DepthMaskMaterial());
      _this27.godRaysPass = new ShaderPass(function () {
        var material = new GodRaysMaterial(_this27.screenPosition);
        material.uniforms.density.value = density;
        material.uniforms.decay.value = decay;
        material.uniforms.weight.value = weight;
        material.uniforms.exposure.value = exposure;
        material.uniforms.clampMax.value = clampMax;
        return material;
      }());
      _this27.samples = samples;
      _this27.blur = blur;
      return _this27;
    }

    _createClass(GodRaysEffect, [{
      key: "getResolutionScale",
      value: function getResolutionScale() {
        return this.blurPass.getResolutionScale();
      }
    }, {
      key: "setResolutionScale",
      value: function setResolutionScale(scale) {
        var originalSize = this.blurPass.getOriginalSize();
        this.blurPass.setResolutionScale(scale);
        this.setSize(originalSize.x, originalSize.y);
      }
    }, {
      key: "setDepthTexture",
      value: function setDepthTexture(depthTexture) {
        var material = this.depthMaskPass.getFullscreenMaterial();
        material.uniforms.depthBuffer0.value = depthTexture;
        material.uniforms.depthBuffer1.value = this.renderTargetLight.depthTexture;
      }
    }, {
      key: "update",
      value: function update(renderer, inputBuffer, deltaTime) {
        var lightSource = this.lightSource;
        var parent = lightSource.parent;
        var matrixAutoUpdate = lightSource.matrixAutoUpdate;
        var renderTargetX = this.renderTargetX;
        var renderTargetLight = this.renderTargetLight;

        if (!matrixAutoUpdate) {
          m.copy(lightSource.matrix);
        }

        lightSource.material.depthWrite = true;
        lightSource.matrixAutoUpdate = false;
        lightSource.updateWorldMatrix(true, false);
        lightSource.matrix.copy(lightSource.matrixWorld);
        this.lightScene.add(lightSource);
        this.renderPassLight.render(renderer, renderTargetLight);
        this.clearPass.render(renderer, renderTargetX);
        this.depthMaskPass.render(renderer, renderTargetLight, renderTargetX);
        lightSource.material.depthWrite = false;
        lightSource.matrixAutoUpdate = matrixAutoUpdate;

        if (!matrixAutoUpdate) {
          lightSource.matrix.copy(m);
        }

        if (parent !== null) {
          parent.add(lightSource);
        }

        v.setFromMatrixPosition(lightSource.matrixWorld).project(this.camera);
        this.screenPosition.set(Math.max(0.0, Math.min(1.0, (v.x + 1.0) * 0.5)), Math.max(0.0, Math.min(1.0, (v.y + 1.0) * 0.5)));

        if (this.blur) {
          this.blurPass.render(renderer, renderTargetX, renderTargetX);
        }

        this.godRaysPass.render(renderer, renderTargetX, this.renderTargetY);
      }
    }, {
      key: "setSize",
      value: function setSize(width, height) {
        this.blurPass.setSize(width, height);
        this.renderPassLight.setSize(width, height);
        this.depthMaskPass.setSize(width, height);
        this.godRaysPass.setSize(width, height);
        width = this.blurPass.width;
        height = this.blurPass.height;
        this.renderTargetX.setSize(width, height);
        this.renderTargetY.setSize(width, height);
        this.renderTargetLight.setSize(width, height);
      }
    }, {
      key: "initialize",
      value: function initialize(renderer, alpha) {
        this.blurPass.initialize(renderer, alpha);
        this.renderPassLight.initialize(renderer, alpha);
        this.depthMaskPass.initialize(renderer, alpha);
        this.godRaysPass.initialize(renderer, alpha);

        if (!alpha) {
          this.renderTargetX.texture.format = three.RGBFormat;
          this.renderTargetY.texture.format = three.RGBFormat;
          this.renderTargetLight.texture.format = three.RGBFormat;
        }
      }
    }, {
      key: "texture",
      get: function get() {
        return this.renderTargetY.texture;
      }
    }, {
      key: "godRaysMaterial",
      get: function get() {
        return this.godRaysPass.getFullscreenMaterial();
      }
    }, {
      key: "width",
      get: function get() {
        return this.blurPass.width;
      },
      set: function set(value) {
        var blurPass = this.blurPass;
        blurPass.width = value;
        this.renderTargetX.setSize(blurPass.width, blurPass.height);
        this.renderTargetY.setSize(blurPass.width, blurPass.height);
        this.renderTargetLight.setSize(blurPass.width, blurPass.height);
      }
    }, {
      key: "height",
      get: function get() {
        return this.blurPass.height;
      },
      set: function set(value) {
        var blurPass = this.blurPass;
        blurPass.height = value;
        this.renderTargetX.setSize(blurPass.width, blurPass.height);
        this.renderTargetY.setSize(blurPass.width, blurPass.height);
        this.renderTargetLight.setSize(blurPass.width, blurPass.height);
      }
    }, {
      key: "dithering",
      get: function get() {
        return this.godRaysMaterial.dithering;
      },
      set: function set(value) {
        var material = this.godRaysMaterial;
        material.dithering = value;
        material.needsUpdate = true;
      }
    }, {
      key: "blur",
      get: function get() {
        return this.blurPass.enabled;
      },
      set: function set(value) {
        this.blurPass.enabled = value;
      }
    }, {
      key: "kernelSize",
      get: function get() {
        return this.blurPass.kernelSize;
      },
      set: function set(value) {
        this.blurPass.kernelSize = value;
      }
    }, {
      key: "samples",
      get: function get() {
        return this.godRaysMaterial.samples;
      },
      set: function set(value) {
        this.godRaysMaterial.samples = value;
      }
    }]);

    return GodRaysEffect;
  }(Effect);

  var fragmentShader$k = "uniform vec2 scale;uniform float lineWidth;void mainImage(const in vec4 inputColor,const in vec2 uv,out vec4 outputColor){float grid=0.5-max(abs(mod(uv.x*scale.x,1.0)-0.5),abs(mod(uv.y*scale.y,1.0)-0.5));outputColor=vec4(vec3(smoothstep(0.0,lineWidth,grid)),inputColor.a);}";

  var GridEffect = function (_Effect12) {
    _inherits(GridEffect, _Effect12);

    function GridEffect() {
      var _this28;

      var _ref19 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          _ref19$blendFunction = _ref19.blendFunction,
          blendFunction = _ref19$blendFunction === void 0 ? BlendFunction.OVERLAY : _ref19$blendFunction,
          _ref19$scale = _ref19.scale,
          scale = _ref19$scale === void 0 ? 1.0 : _ref19$scale,
          _ref19$lineWidth = _ref19.lineWidth,
          lineWidth = _ref19$lineWidth === void 0 ? 0.0 : _ref19$lineWidth;

      _classCallCheck(this, GridEffect);

      _this28 = _possibleConstructorReturn(this, _getPrototypeOf(GridEffect).call(this, "GridEffect", fragmentShader$k, {
        blendFunction: blendFunction,
        uniforms: new Map([["scale", new three.Uniform(new three.Vector2())], ["lineWidth", new three.Uniform(lineWidth)]])
      }));
      _this28.resolution = new three.Vector2();
      _this28.scale = Math.max(scale, 1e-6);
      _this28.lineWidth = Math.max(lineWidth, 0.0);
      return _this28;
    }

    _createClass(GridEffect, [{
      key: "getScale",
      value: function getScale() {
        return this.scale;
      }
    }, {
      key: "setScale",
      value: function setScale(scale) {
        this.scale = scale;
        this.setSize(this.resolution.x, this.resolution.y);
      }
    }, {
      key: "getLineWidth",
      value: function getLineWidth() {
        return this.lineWidth;
      }
    }, {
      key: "setLineWidth",
      value: function setLineWidth(lineWidth) {
        this.lineWidth = lineWidth;
        this.setSize(this.resolution.x, this.resolution.y);
      }
    }, {
      key: "setSize",
      value: function setSize(width, height) {
        this.resolution.set(width, height);
        var aspect = width / height;
        var scale = this.scale * (height * 0.125);
        this.uniforms.get("scale").value.set(aspect * scale, scale);
        this.uniforms.get("lineWidth").value = scale / height + this.lineWidth;
      }
    }]);

    return GridEffect;
  }(Effect);

  var fragmentShader$l = "uniform vec3 hue;uniform float saturation;void mainImage(const in vec4 inputColor,const in vec2 uv,out vec4 outputColor){vec3 color=vec3(dot(inputColor.rgb,hue.xyz),dot(inputColor.rgb,hue.zxy),dot(inputColor.rgb,hue.yzx));float average=(color.r+color.g+color.b)/3.0;vec3 diff=average-color;if(saturation>0.0){color+=diff*(1.0-1.0/(1.001-saturation));}else{color+=diff*-saturation;}outputColor=vec4(min(color,1.0),inputColor.a);}";

  var HueSaturationEffect = function (_Effect13) {
    _inherits(HueSaturationEffect, _Effect13);

    function HueSaturationEffect() {
      var _this29;

      var _ref20 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          _ref20$blendFunction = _ref20.blendFunction,
          blendFunction = _ref20$blendFunction === void 0 ? BlendFunction.NORMAL : _ref20$blendFunction,
          _ref20$hue = _ref20.hue,
          hue = _ref20$hue === void 0 ? 0.0 : _ref20$hue,
          _ref20$saturation = _ref20.saturation,
          saturation = _ref20$saturation === void 0 ? 0.0 : _ref20$saturation;

      _classCallCheck(this, HueSaturationEffect);

      _this29 = _possibleConstructorReturn(this, _getPrototypeOf(HueSaturationEffect).call(this, "HueSaturationEffect", fragmentShader$l, {
        blendFunction: blendFunction,
        uniforms: new Map([["hue", new three.Uniform(new three.Vector3())], ["saturation", new three.Uniform(saturation)]])
      }));

      _this29.setHue(hue);

      return _this29;
    }

    _createClass(HueSaturationEffect, [{
      key: "setHue",
      value: function setHue(hue) {
        var s = Math.sin(hue),
            c = Math.cos(hue);
        this.uniforms.get("hue").value.set(2.0 * c, -Math.sqrt(3.0) * s - c, Math.sqrt(3.0) * s - c).addScalar(1.0).divideScalar(3.0);
      }
    }]);

    return HueSaturationEffect;
  }(Effect);

  var fragmentShader$m = "void mainImage(const in vec4 inputColor,const in vec2 uv,out vec4 outputColor){vec3 noise=vec3(rand(uv*time));\n#ifdef PREMULTIPLY\noutputColor=vec4(inputColor.rgb*noise,inputColor.a);\n#else\noutputColor=vec4(noise,inputColor.a);\n#endif\n}";

  var NoiseEffect = function (_Effect14) {
    _inherits(NoiseEffect, _Effect14);

    function NoiseEffect() {
      var _this30;

      var _ref21 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          _ref21$blendFunction = _ref21.blendFunction,
          blendFunction = _ref21$blendFunction === void 0 ? BlendFunction.SCREEN : _ref21$blendFunction,
          _ref21$premultiply = _ref21.premultiply,
          premultiply = _ref21$premultiply === void 0 ? false : _ref21$premultiply;

      _classCallCheck(this, NoiseEffect);

      _this30 = _possibleConstructorReturn(this, _getPrototypeOf(NoiseEffect).call(this, "NoiseEffect", fragmentShader$m, {
        blendFunction: blendFunction
      }));
      _this30.premultiply = premultiply;
      return _this30;
    }

    _createClass(NoiseEffect, [{
      key: "premultiply",
      get: function get() {
        return this.defines.has("PREMULTIPLY");
      },
      set: function set(value) {
        value ? this.defines.set("PREMULTIPLY", "1") : this.defines["delete"]("PREMULTIPLY");
      }
    }]);

    return NoiseEffect;
  }(Effect);

  var fragmentShader$n = "uniform sampler2D edgeTexture;uniform sampler2D maskTexture;uniform vec3 visibleEdgeColor;uniform vec3 hiddenEdgeColor;uniform float pulse;uniform float edgeStrength;\n#ifdef USE_PATTERN\nuniform sampler2D patternTexture;varying vec2 vUvPattern;\n#endif\nvoid mainImage(const in vec4 inputColor,const in vec2 uv,out vec4 outputColor){vec2 edge=texture2D(edgeTexture,uv).rg;vec2 mask=texture2D(maskTexture,uv).rg;\n#ifndef X_RAY\nedge.y=0.0;\n#endif\nedge*=(edgeStrength*mask.x*pulse);vec3 color=edge.x*visibleEdgeColor+edge.y*hiddenEdgeColor;float visibilityFactor=0.0;\n#ifdef USE_PATTERN\nvec4 patternColor=texture2D(patternTexture,vUvPattern);\n#ifdef X_RAY\nfloat hiddenFactor=0.5;\n#else\nfloat hiddenFactor=0.0;\n#endif\nvisibilityFactor=(1.0-mask.y>0.0)? 1.0 : hiddenFactor;visibilityFactor*=(1.0-mask.x)*patternColor.a;color+=visibilityFactor*patternColor.rgb;\n#endif\nfloat alpha=max(max(edge.x,edge.y),visibilityFactor);\n#ifdef ALPHA\noutputColor=vec4(color,alpha);\n#else\noutputColor=vec4(color,max(alpha,inputColor.a));\n#endif\n}";
  var vertexShader$7 = "uniform float patternScale;varying vec2 vUvPattern;void mainSupport(const in vec2 uv){vUvPattern=uv*vec2(aspect,1.0)*patternScale;}";

  var OutlineEffect = function (_Effect15) {
    _inherits(OutlineEffect, _Effect15);

    function OutlineEffect(scene, camera) {
      var _this31;

      var _ref22 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
          _ref22$blendFunction = _ref22.blendFunction,
          blendFunction = _ref22$blendFunction === void 0 ? BlendFunction.SCREEN : _ref22$blendFunction,
          _ref22$patternTexture = _ref22.patternTexture,
          patternTexture = _ref22$patternTexture === void 0 ? null : _ref22$patternTexture,
          _ref22$edgeStrength = _ref22.edgeStrength,
          edgeStrength = _ref22$edgeStrength === void 0 ? 1.0 : _ref22$edgeStrength,
          _ref22$pulseSpeed = _ref22.pulseSpeed,
          pulseSpeed = _ref22$pulseSpeed === void 0 ? 0.0 : _ref22$pulseSpeed,
          _ref22$visibleEdgeCol = _ref22.visibleEdgeColor,
          visibleEdgeColor = _ref22$visibleEdgeCol === void 0 ? 0xffffff : _ref22$visibleEdgeCol,
          _ref22$hiddenEdgeColo = _ref22.hiddenEdgeColor,
          hiddenEdgeColor = _ref22$hiddenEdgeColo === void 0 ? 0x22090a : _ref22$hiddenEdgeColo,
          _ref22$resolutionScal = _ref22.resolutionScale,
          resolutionScale = _ref22$resolutionScal === void 0 ? 0.5 : _ref22$resolutionScal,
          _ref22$width = _ref22.width,
          width = _ref22$width === void 0 ? BlurPass.AUTO_SIZE : _ref22$width,
          _ref22$height = _ref22.height,
          height = _ref22$height === void 0 ? BlurPass.AUTO_SIZE : _ref22$height,
          _ref22$kernelSize = _ref22.kernelSize,
          kernelSize = _ref22$kernelSize === void 0 ? KernelSize.VERY_SMALL : _ref22$kernelSize,
          _ref22$blur = _ref22.blur,
          blur = _ref22$blur === void 0 ? false : _ref22$blur,
          _ref22$xRay = _ref22.xRay,
          xRay = _ref22$xRay === void 0 ? true : _ref22$xRay;

      _classCallCheck(this, OutlineEffect);

      _this31 = _possibleConstructorReturn(this, _getPrototypeOf(OutlineEffect).call(this, "OutlineEffect", fragmentShader$n, {
        uniforms: new Map([["maskTexture", new three.Uniform(null)], ["edgeTexture", new three.Uniform(null)], ["edgeStrength", new three.Uniform(edgeStrength)], ["visibleEdgeColor", new three.Uniform(new three.Color(visibleEdgeColor))], ["hiddenEdgeColor", new three.Uniform(new three.Color(hiddenEdgeColor))], ["pulse", new three.Uniform(1.0)]])
      }));

      _this31.blendMode = function (defines) {
        return new Proxy(_this31.blendMode, {
          set: function set(target, name, value) {
            if (value === BlendFunction.ALPHA) {
              defines.set("ALPHA", "1");
            } else {
              defines["delete"]("ALPHA");
            }

            target[name] = value;
            return true;
          }
        });
      }(_this31.defines);

      _this31.blendMode.blendFunction = blendFunction;

      _this31.setPatternTexture(patternTexture);

      _this31.xRay = xRay;
      _this31.scene = scene;
      _this31.camera = camera;
      _this31.renderTargetMask = new three.WebGLRenderTarget(1, 1, {
        minFilter: three.LinearFilter,
        magFilter: three.LinearFilter,
        stencilBuffer: false,
        format: three.RGBFormat
      });
      _this31.renderTargetMask.texture.name = "Outline.Mask";
      _this31.uniforms.get("maskTexture").value = _this31.renderTargetMask.texture;
      _this31.renderTargetEdges = _this31.renderTargetMask.clone();
      _this31.renderTargetEdges.texture.name = "Outline.Edges";
      _this31.renderTargetEdges.depthBuffer = false;
      _this31.renderTargetBlurredEdges = _this31.renderTargetEdges.clone();
      _this31.renderTargetBlurredEdges.texture.name = "Outline.BlurredEdges";
      _this31.clearPass = new ClearPass();
      _this31.clearPass.overrideClearColor = new three.Color(0x000000);
      _this31.clearPass.overrideClearAlpha = 1.0;
      _this31.depthPass = new DepthPass(scene, camera);
      _this31.maskPass = new RenderPass(scene, camera, new DepthComparisonMaterial(_this31.depthPass.renderTarget.texture, camera));

      var clearPass = _this31.maskPass.getClearPass();

      clearPass.overrideClearColor = new three.Color(0xffffff);
      clearPass.overrideClearAlpha = 1.0;
      _this31.blurPass = new BlurPass({
        resolutionScale: resolutionScale,
        width: width,
        height: height,
        kernelSize: kernelSize
      });
      _this31.blur = blur;
      _this31.outlineEdgesPass = new ShaderPass(new OutlineEdgesMaterial());
      _this31.outlineEdgesPass.getFullscreenMaterial().uniforms.maskTexture.value = _this31.renderTargetMask.texture;
      _this31.selection = [];
      _this31.time = 0.0;
      _this31.pulseSpeed = pulseSpeed;
      _this31.selectionLayer = 10;
      _this31.clear = false;
      return _this31;
    }

    _createClass(OutlineEffect, [{
      key: "setPatternTexture",
      value: function setPatternTexture(texture) {
        if (texture !== null) {
          texture.wrapS = texture.wrapT = three.RepeatWrapping;
          this.defines.set("USE_PATTERN", "1");
          this.uniforms.set("patternScale", new three.Uniform(1.0));
          this.uniforms.set("patternTexture", new three.Uniform(texture));
          this.vertexShader = vertexShader$7;
        } else {
          this.defines["delete"]("USE_PATTERN");
          this.uniforms["delete"]("patternScale");
          this.uniforms["delete"]("patternTexture");
          this.vertexShader = null;
        }
      }
    }, {
      key: "getResolutionScale",
      value: function getResolutionScale() {
        return this.blurPass.getResolutionScale();
      }
    }, {
      key: "setResolutionScale",
      value: function setResolutionScale(scale) {
        var originalSize = this.blurPass.getOriginalSize();
        this.blurPass.setResolutionScale(scale);
        this.depthPass.setResolutionScale(scale);
        this.setSize(originalSize.x, originalSize.y);
      }
    }, {
      key: "setSelection",
      value: function setSelection(objects) {
        var selection = objects.slice(0);
        var selectionLayer = this.selectionLayer;
        var i, l;
        this.clearSelection();

        for (i = 0, l = selection.length; i < l; ++i) {
          selection[i].layers.enable(selectionLayer);
        }

        this.selection = selection;
        return this;
      }
    }, {
      key: "clearSelection",
      value: function clearSelection() {
        var selection = this.selection;
        var selectionLayer = this.selectionLayer;
        var i, l;

        for (i = 0, l = selection.length; i < l; ++i) {
          selection[i].layers.disable(selectionLayer);
        }

        this.selection = [];
        this.time = 0.0;
        this.clear = true;
        return this;
      }
    }, {
      key: "selectObject",
      value: function selectObject(object) {
        object.layers.enable(this.selectionLayer);
        this.selection.push(object);
        return this;
      }
    }, {
      key: "deselectObject",
      value: function deselectObject(object) {
        var selection = this.selection;
        var index = selection.indexOf(object);

        if (index >= 0) {
          selection[index].layers.disable(this.selectionLayer);
          selection.splice(index, 1);

          if (selection.length === 0) {
            this.time = 0.0;
            this.clear = true;
          }
        }

        return this;
      }
    }, {
      key: "setSelectionVisible",
      value: function setSelectionVisible(visible) {
        var selection = this.selection;
        var i, l;

        for (i = 0, l = selection.length; i < l; ++i) {
          if (visible) {
            selection[i].layers.enable(0);
          } else {
            selection[i].layers.disable(0);
          }
        }
      }
    }, {
      key: "update",
      value: function update(renderer, inputBuffer, deltaTime) {
        var scene = this.scene;
        var camera = this.camera;
        var pulse = this.uniforms.get("pulse");
        var background = scene.background;
        var mask = camera.layers.mask;

        if (this.selection.length > 0) {
          scene.background = null;
          pulse.value = 1.0;

          if (this.pulseSpeed > 0.0) {
            pulse.value = 0.625 + Math.cos(this.time * this.pulseSpeed * 10.0) * 0.375;
            this.time += deltaTime;
          }

          this.setSelectionVisible(false);
          this.depthPass.render(renderer);
          this.setSelectionVisible(true);
          camera.layers.mask = 1 << this.selectionLayer;
          this.maskPass.render(renderer, this.renderTargetMask);
          camera.layers.mask = mask;
          scene.background = background;
          this.outlineEdgesPass.render(renderer, null, this.renderTargetEdges);

          if (this.blur) {
            this.blurPass.render(renderer, this.renderTargetEdges, this.renderTargetBlurredEdges);
          }
        } else if (this.clear) {
          this.clearPass.render(renderer, this.renderTargetMask);
          this.clear = false;
        }
      }
    }, {
      key: "setSize",
      value: function setSize(width, height) {
        this.renderTargetMask.setSize(width, height);
        this.depthPass.setSize(width, height);
        this.blurPass.setSize(width, height);
        width = this.blurPass.width;
        height = this.blurPass.height;
        this.renderTargetEdges.setSize(width, height);
        this.renderTargetBlurredEdges.setSize(width, height);
        this.outlineEdgesPass.getFullscreenMaterial().setTexelSize(1.0 / width, 1.0 / height);
      }
    }, {
      key: "initialize",
      value: function initialize(renderer, alpha) {
        this.blurPass.initialize(renderer, alpha);
        this.depthPass.initialize(renderer, alpha);
        this.maskPass.initialize(renderer, alpha);
      }
    }, {
      key: "width",
      get: function get() {
        return this.blurPass.width;
      },
      set: function set(value) {
        var blurPass = this.blurPass;
        blurPass.width = value;
        this.renderTargetEdges.setSize(blurPass.width, blurPass.height);
        this.renderTargetBlurredEdges.setSize(blurPass.width, blurPass.height);
        this.outlineEdgesPass.getFullscreenMaterial().setTexelSize(1.0 / blurPass.width, 1.0 / blurPass.height);
      }
    }, {
      key: "height",
      get: function get() {
        return this.blurPass.height;
      },
      set: function set(value) {
        var blurPass = this.blurPass;
        blurPass.height = value;
        this.renderTargetEdges.setSize(blurPass.width, blurPass.height);
        this.renderTargetBlurredEdges.setSize(blurPass.width, blurPass.height);
        this.outlineEdgesPass.getFullscreenMaterial().setTexelSize(1.0 / blurPass.width, 1.0 / blurPass.height);
      }
    }, {
      key: "dithering",
      get: function get() {
        return this.blurPass.dithering;
      },
      set: function set(value) {
        this.blurPass.dithering = value;
      }
    }, {
      key: "kernelSize",
      get: function get() {
        return this.blurPass.kernelSize;
      },
      set: function set(value) {
        this.blurPass.kernelSize = value;
      }
    }, {
      key: "blur",
      get: function get() {
        return this.blurPass.enabled;
      },
      set: function set(value) {
        this.blurPass.enabled = value;
        this.uniforms.get("edgeTexture").value = value ? this.renderTargetBlurredEdges.texture : this.renderTargetEdges.texture;
      }
    }, {
      key: "xRay",
      get: function get() {
        return this.defines.has("X_RAY");
      },
      set: function set(value) {
        value ? this.defines.set("X_RAY", "1") : this.defines["delete"]("X_RAY");
      }
    }]);

    return OutlineEffect;
  }(Effect);

  var fragmentShader$o = "uniform bool active;uniform vec2 d;void mainUv(inout vec2 uv){if(active){uv=vec2(d.x*(floor(uv.x/d.x)+0.5),d.y*(floor(uv.y/d.y)+0.5));}}";

  var PixelationEffect = function (_Effect16) {
    _inherits(PixelationEffect, _Effect16);

    function PixelationEffect() {
      var _this32;

      var granularity = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 30.0;

      _classCallCheck(this, PixelationEffect);

      _this32 = _possibleConstructorReturn(this, _getPrototypeOf(PixelationEffect).call(this, "PixelationEffect", fragmentShader$o, {
        uniforms: new Map([["active", new three.Uniform(false)], ["d", new three.Uniform(new three.Vector2())]])
      }));
      _this32.resolution = new three.Vector2();
      _this32.granularity = granularity;
      return _this32;
    }

    _createClass(PixelationEffect, [{
      key: "getGranularity",
      value: function getGranularity() {
        return this.granularity;
      }
    }, {
      key: "setGranularity",
      value: function setGranularity(granularity) {
        granularity = Math.floor(granularity);

        if (granularity % 2 > 0) {
          granularity += 1;
        }

        var uniforms = this.uniforms;
        uniforms.get("active").value = granularity > 0.0;
        uniforms.get("d").value.set(granularity, granularity).divide(this.resolution);
        this.granularity = granularity;
      }
    }, {
      key: "setSize",
      value: function setSize(width, height) {
        this.resolution.set(width, height);
        this.setGranularity(this.granularity);
      }
    }]);

    return PixelationEffect;
  }(Effect);

  var fragmentShader$p = "uniform float focus;uniform float focalLength;uniform float maxBlur;uniform float luminanceThreshold;uniform float luminanceGain;uniform float bias;uniform float fringe;\n#ifdef MANUAL_DOF\nuniform vec4 dof;\n#endif\n#ifdef PENTAGON\nfloat pentagon(const in vec2 coords){const vec4 HS0=vec4(1.0,0.0,0.0,1.0);const vec4 HS1=vec4(0.309016994,0.951056516,0.0,1.0);const vec4 HS2=vec4(-0.809016994,0.587785252,0.0,1.0);const vec4 HS3=vec4(-0.809016994,-0.587785252,0.0,1.0);const vec4 HS4=vec4(0.309016994,-0.951056516,0.0,1.0);const vec4 HS5=vec4(0.0,0.0,1.0,1.0);const vec4 ONE=vec4(1.0);const float P_FEATHER=0.4;const float N_FEATHER=-P_FEATHER;float inOrOut=-4.0;vec4 P=vec4(coords,vec2(RINGS_FLOAT-1.3));vec4 dist=vec4(dot(P,HS0),dot(P,HS1),dot(P,HS2),dot(P,HS3));dist=smoothstep(N_FEATHER,P_FEATHER,dist);inOrOut+=dot(dist,ONE);dist.x=dot(P,HS4);dist.y=HS5.w-abs(P.z);dist=smoothstep(N_FEATHER,P_FEATHER,dist);inOrOut+=dist.x;return clamp(inOrOut,0.0,1.0);}\n#endif\nvec3 processTexel(const in vec2 coords,const in float blur){vec2 scale=texelSize*fringe*blur;vec3 c=vec3(texture2D(inputBuffer,coords+vec2(0.0,1.0)*scale).r,texture2D(inputBuffer,coords+vec2(-0.866,-0.5)*scale).g,texture2D(inputBuffer,coords+vec2(0.866,-0.5)*scale).b);float luminance=linearToRelativeLuminance(c);float threshold=max((luminance-luminanceThreshold)*luminanceGain,0.0);return c+mix(vec3(0.0),c,threshold*blur);}float gather(const in float i,const in float j,const in float ringSamples,const in vec2 uv,const in vec2 blurFactor,const in float blur,inout vec3 color){float step=PI2/ringSamples;vec2 wh=vec2(cos(j*step)*i,sin(j*step)*i);\n#ifdef PENTAGON\nfloat p=pentagon(wh);\n#else\nfloat p=1.0;\n#endif\ncolor+=processTexel(wh*blurFactor+uv,blur)*mix(1.0,i/RINGS_FLOAT,bias)*p;return mix(1.0,i/RINGS_FLOAT,bias)*p;}void mainImage(const in vec4 inputColor,const in vec2 uv,const in float depth,out vec4 outputColor){float linearDepth=(-cameraFar*cameraNear/(depth*(cameraFar-cameraNear)-cameraFar));\n#ifdef MANUAL_DOF\nfloat focalPlane=linearDepth-focus;float farDoF=(focalPlane-dof.z)/dof.w;float nearDoF=(-focalPlane-dof.x)/dof.y;float blur=(focalPlane>0.0)? farDoF : nearDoF;\n#else\nconst float CIRCLE_OF_CONFUSION=0.03;float focalPlaneMM=focus*1000.0;float depthMM=linearDepth*1000.0;float focalPlane=(depthMM*focalLength)/(depthMM-focalLength);float farDoF=(focalPlaneMM*focalLength)/(focalPlaneMM-focalLength);float nearDoF=(focalPlaneMM-focalLength)/(focalPlaneMM*focus*CIRCLE_OF_CONFUSION);float blur=abs(focalPlane-farDoF)*nearDoF;\n#endif\nconst int MAX_RING_SAMPLES=RINGS_INT*SAMPLES_INT;blur=clamp(blur,0.0,1.0);vec3 color=inputColor.rgb;if(blur>=0.05){vec2 blurFactor=blur*maxBlur*texelSize;float s=1.0;int ringSamples;for(int i=1;i<=RINGS_INT;i++){ringSamples=i*SAMPLES_INT;for(int j=0;j<MAX_RING_SAMPLES;j++){if(j>=ringSamples){break;}s+=gather(float(i),float(j),float(ringSamples),uv,blurFactor,blur,color);}}color/=s;}\n#ifdef SHOW_FOCUS\nfloat edge=0.002*linearDepth;float m=clamp(smoothstep(0.0,edge,blur),0.0,1.0);float e=clamp(smoothstep(1.0-edge,1.0,blur),0.0,1.0);color=mix(color,vec3(1.0,0.5,0.0),(1.0-m)*0.6);color=mix(color,vec3(0.0,0.5,1.0),((1.0-e)-(1.0-m))*0.2);\n#endif\noutputColor=vec4(color,inputColor.a);}";

  var RealisticBokehEffect = function (_Effect17) {
    _inherits(RealisticBokehEffect, _Effect17);

    function RealisticBokehEffect() {
      var _this33;

      var _ref23 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          _ref23$blendFunction = _ref23.blendFunction,
          blendFunction = _ref23$blendFunction === void 0 ? BlendFunction.NORMAL : _ref23$blendFunction,
          _ref23$focus = _ref23.focus,
          focus = _ref23$focus === void 0 ? 1.0 : _ref23$focus,
          _ref23$focalLength = _ref23.focalLength,
          focalLength = _ref23$focalLength === void 0 ? 24.0 : _ref23$focalLength,
          _ref23$luminanceThres = _ref23.luminanceThreshold,
          luminanceThreshold = _ref23$luminanceThres === void 0 ? 0.5 : _ref23$luminanceThres,
          _ref23$luminanceGain = _ref23.luminanceGain,
          luminanceGain = _ref23$luminanceGain === void 0 ? 2.0 : _ref23$luminanceGain,
          _ref23$bias = _ref23.bias,
          bias = _ref23$bias === void 0 ? 0.5 : _ref23$bias,
          _ref23$fringe = _ref23.fringe,
          fringe = _ref23$fringe === void 0 ? 0.7 : _ref23$fringe,
          _ref23$maxBlur = _ref23.maxBlur,
          maxBlur = _ref23$maxBlur === void 0 ? 1.0 : _ref23$maxBlur,
          _ref23$rings = _ref23.rings,
          rings = _ref23$rings === void 0 ? 3 : _ref23$rings,
          _ref23$samples = _ref23.samples,
          samples = _ref23$samples === void 0 ? 2 : _ref23$samples,
          _ref23$showFocus = _ref23.showFocus,
          showFocus = _ref23$showFocus === void 0 ? false : _ref23$showFocus,
          _ref23$manualDoF = _ref23.manualDoF,
          manualDoF = _ref23$manualDoF === void 0 ? false : _ref23$manualDoF,
          _ref23$pentagon = _ref23.pentagon,
          pentagon = _ref23$pentagon === void 0 ? false : _ref23$pentagon;

      _classCallCheck(this, RealisticBokehEffect);

      _this33 = _possibleConstructorReturn(this, _getPrototypeOf(RealisticBokehEffect).call(this, "RealisticBokehEffect", fragmentShader$p, {
        blendFunction: blendFunction,
        attributes: EffectAttribute.CONVOLUTION | EffectAttribute.DEPTH,
        uniforms: new Map([["focus", new three.Uniform(focus)], ["focalLength", new three.Uniform(focalLength)], ["luminanceThreshold", new three.Uniform(luminanceThreshold)], ["luminanceGain", new three.Uniform(luminanceGain)], ["bias", new three.Uniform(bias)], ["fringe", new three.Uniform(fringe)], ["maxBlur", new three.Uniform(maxBlur)]])
      }));
      _this33.rings = rings;
      _this33.samples = samples;
      _this33.showFocus = showFocus;
      _this33.manualDoF = manualDoF;
      _this33.pentagon = pentagon;
      return _this33;
    }

    _createClass(RealisticBokehEffect, [{
      key: "rings",
      get: function get() {
        return Number.parseInt(this.defines.get("RINGS_INT"));
      },
      set: function set(value) {
        value = Math.floor(value);
        this.defines.set("RINGS_INT", value.toFixed(0));
        this.defines.set("RINGS_FLOAT", value.toFixed(1));
      }
    }, {
      key: "samples",
      get: function get() {
        return Number.parseInt(this.defines.get("SAMPLES_INT"));
      },
      set: function set(value) {
        value = Math.floor(value);
        this.defines.set("SAMPLES_INT", value.toFixed(0));
        this.defines.set("SAMPLES_FLOAT", value.toFixed(1));
      }
    }, {
      key: "showFocus",
      get: function get() {
        return this.defines.has("SHOW_FOCUS");
      },
      set: function set(value) {
        value ? this.defines.set("SHOW_FOCUS", "1") : this.defines["delete"]("SHOW_FOCUS");
      }
    }, {
      key: "manualDoF",
      get: function get() {
        return this.defines.has("MANUAL_DOF");
      },
      set: function set(value) {
        if (value) {
          this.defines.set("MANUAL_DOF", "1");
          this.uniforms.set("dof", new three.Uniform(new three.Vector4(0.2, 1.0, 0.2, 2.0)));
        } else {
          this.defines["delete"]("MANUAL_DOF");
          this.uniforms["delete"]("dof");
        }
      }
    }, {
      key: "pentagon",
      get: function get() {
        return this.defines.has("PENTAGON");
      },
      set: function set(value) {
        value ? this.defines.set("PENTAGON", "1") : this.defines["delete"]("PENTAGON");
      }
    }]);

    return RealisticBokehEffect;
  }(Effect);

  var fragmentShader$q = "uniform float count;void mainImage(const in vec4 inputColor,const in vec2 uv,out vec4 outputColor){vec2 sl=vec2(sin(uv.y*count),cos(uv.y*count));vec3 scanlines=vec3(sl.x,sl.y,sl.x);outputColor=vec4(scanlines,inputColor.a);}";

  var ScanlineEffect = function (_Effect18) {
    _inherits(ScanlineEffect, _Effect18);

    function ScanlineEffect() {
      var _this34;

      var _ref24 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          _ref24$blendFunction = _ref24.blendFunction,
          blendFunction = _ref24$blendFunction === void 0 ? BlendFunction.OVERLAY : _ref24$blendFunction,
          _ref24$density = _ref24.density,
          density = _ref24$density === void 0 ? 1.25 : _ref24$density;

      _classCallCheck(this, ScanlineEffect);

      _this34 = _possibleConstructorReturn(this, _getPrototypeOf(ScanlineEffect).call(this, "ScanlineEffect", fragmentShader$q, {
        blendFunction: blendFunction,
        uniforms: new Map([["count", new three.Uniform(0.0)]])
      }));
      _this34.resolution = new three.Vector2();
      _this34.density = density;
      return _this34;
    }

    _createClass(ScanlineEffect, [{
      key: "getDensity",
      value: function getDensity() {
        return this.density;
      }
    }, {
      key: "setDensity",
      value: function setDensity(density) {
        this.density = density;
        this.setSize(this.resolution.x, this.resolution.y);
      }
    }, {
      key: "setSize",
      value: function setSize(width, height) {
        this.resolution.set(width, height);
        this.uniforms.get("count").value = Math.round(height * this.density);
      }
    }]);

    return ScanlineEffect;
  }(Effect);

  var fragmentShader$r = "uniform bool active;uniform vec2 center;uniform float waveSize;uniform float radius;uniform float maxRadius;uniform float amplitude;varying float vSize;void mainUv(inout vec2 uv){if(active){vec2 aspectCorrection=vec2(aspect,1.0);vec2 difference=uv*aspectCorrection-center*aspectCorrection;float distance=sqrt(dot(difference,difference))*vSize;if(distance>radius){if(distance<radius+waveSize){float angle=(distance-radius)*PI2/waveSize;float cosSin=(1.0-cos(angle))*0.5;float extent=maxRadius+waveSize;float decay=max(extent-distance*distance,0.0)/extent;uv-=((cosSin*amplitude*difference)/distance)*decay;}}}}";
  var vertexShader$8 = "uniform float size;uniform float cameraDistance;varying float vSize;void mainSupport(){vSize=(0.1*cameraDistance)/size;}";
  var HALF_PI = Math.PI * 0.5;
  var v$1 = new three.Vector3();
  var ab = new three.Vector3();

  var ShockWaveEffect = function (_Effect19) {
    _inherits(ShockWaveEffect, _Effect19);

    function ShockWaveEffect(camera) {
      var _this35;

      var epicenter = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : new three.Vector3();

      var _ref25 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
          _ref25$speed = _ref25.speed,
          speed = _ref25$speed === void 0 ? 2.0 : _ref25$speed,
          _ref25$maxRadius = _ref25.maxRadius,
          maxRadius = _ref25$maxRadius === void 0 ? 1.0 : _ref25$maxRadius,
          _ref25$waveSize = _ref25.waveSize,
          waveSize = _ref25$waveSize === void 0 ? 0.2 : _ref25$waveSize,
          _ref25$amplitude = _ref25.amplitude,
          amplitude = _ref25$amplitude === void 0 ? 0.05 : _ref25$amplitude;

      _classCallCheck(this, ShockWaveEffect);

      _this35 = _possibleConstructorReturn(this, _getPrototypeOf(ShockWaveEffect).call(this, "ShockWaveEffect", fragmentShader$r, {
        vertexShader: vertexShader$8,
        uniforms: new Map([["active", new three.Uniform(false)], ["center", new three.Uniform(new three.Vector2(0.5, 0.5))], ["cameraDistance", new three.Uniform(1.0)], ["size", new three.Uniform(1.0)], ["radius", new three.Uniform(-waveSize)], ["maxRadius", new three.Uniform(maxRadius)], ["waveSize", new three.Uniform(waveSize)], ["amplitude", new three.Uniform(amplitude)]])
      }));
      _this35.camera = camera;
      _this35.epicenter = epicenter;
      _this35.screenPosition = _this35.uniforms.get("center").value;
      _this35.speed = speed;
      _this35.time = 0.0;
      _this35.active = false;
      return _this35;
    }

    _createClass(ShockWaveEffect, [{
      key: "explode",
      value: function explode() {
        this.time = 0.0;
        this.active = true;
        this.uniforms.get("active").value = true;
      }
    }, {
      key: "update",
      value: function update(renderer, inputBuffer, delta) {
        var epicenter = this.epicenter;
        var camera = this.camera;
        var uniforms = this.uniforms;
        var radius;

        if (this.active) {
          var waveSize = uniforms.get("waveSize").value;
          camera.getWorldDirection(v$1);
          ab.copy(camera.position).sub(epicenter);

          if (v$1.angleTo(ab) > HALF_PI) {
            uniforms.get("cameraDistance").value = camera.position.distanceTo(epicenter);
            v$1.copy(epicenter).project(camera);
            this.screenPosition.set((v$1.x + 1.0) * 0.5, (v$1.y + 1.0) * 0.5);
          }

          this.time += delta * this.speed;
          radius = this.time - waveSize;
          uniforms.get("radius").value = radius;

          if (radius >= (uniforms.get("maxRadius").value + waveSize) * 2.0) {
            this.active = false;
            uniforms.get("active").value = false;
          }
        }
      }
    }]);

    return ShockWaveEffect;
  }(Effect);

  var fragmentShader$s = "uniform float intensity;void mainImage(const in vec4 inputColor,const in vec2 uv,out vec4 outputColor){vec3 color=vec3(dot(inputColor.rgb,vec3(1.0-0.607*intensity,0.769*intensity,0.189*intensity)),dot(inputColor.rgb,vec3(0.349*intensity,1.0-0.314*intensity,0.168*intensity)),dot(inputColor.rgb,vec3(0.272*intensity,0.534*intensity,1.0-0.869*intensity)));outputColor=vec4(color,inputColor.a);}";

  var SepiaEffect = function (_Effect20) {
    _inherits(SepiaEffect, _Effect20);

    function SepiaEffect() {
      var _ref26 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          _ref26$blendFunction = _ref26.blendFunction,
          blendFunction = _ref26$blendFunction === void 0 ? BlendFunction.NORMAL : _ref26$blendFunction,
          _ref26$intensity = _ref26.intensity,
          intensity = _ref26$intensity === void 0 ? 1.0 : _ref26$intensity;

      _classCallCheck(this, SepiaEffect);

      return _possibleConstructorReturn(this, _getPrototypeOf(SepiaEffect).call(this, "SepiaEffect", fragmentShader$s, {
        blendFunction: blendFunction,
        uniforms: new Map([["intensity", new three.Uniform(intensity)]])
      }));
    }

    return SepiaEffect;
  }(Effect);

  var searchImageDataURL = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAAAQCAYAAACm53kpAAAAeElEQVRYR+2XSwqAMAxEJ168ePEqwRSKhIIiuHjJqiU0gWE+1CQdApcVAMUAuARaMGCX1MIL/Ow13++9lW2s3mW9MWvsnWc/2fvGygwPAN4E8QzAA4CXAB6AHjG4JTHYI1ey3pcx6FHnEfhLDOIBKAmUBK6/ANUDTlROXAHd9EC1AAAAAElFTkSuQmCC";
  var areaImageDataURL = "data:image/png;base64,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";
  var fragmentShader$t = "uniform sampler2D weightMap;varying vec2 vOffset0;varying vec2 vOffset1;/***Moves values to a target vector based on a given conditional vector.*/void movec(const in bvec2 c,inout vec2 variable,const in vec2 value){if(c.x){variable.x=value.x;}if(c.y){variable.y=value.y;}}void movec(const in bvec4 c,inout vec4 variable,const in vec4 value){movec(c.xy,variable.xy,value.xy);movec(c.zw,variable.zw,value.zw);}void mainImage(const in vec4 inputColor,const in vec2 uv,out vec4 outputColor){vec4 a;a.x=texture2D(weightMap,vOffset0).a;a.y=texture2D(weightMap,vOffset1).g;a.wz=texture2D(weightMap,uv).rb;vec4 color=inputColor;if(dot(a,vec4(1.0))>=1e-5){bool h=max(a.x,a.z)>max(a.y,a.w);vec4 blendingOffset=vec4(0.0,a.y,0.0,a.w);vec2 blendingWeight=a.yw;movec(bvec4(h),blendingOffset,vec4(a.x,0.0,a.z,0.0));movec(bvec2(h),blendingWeight,a.xz);blendingWeight/=dot(blendingWeight,vec2(1.0));vec4 blendingCoord=blendingOffset*vec4(texelSize,-texelSize)+uv.xyxy;color=blendingWeight.x*texture2D(inputBuffer,blendingCoord.xy);color+=blendingWeight.y*texture2D(inputBuffer,blendingCoord.zw);}outputColor=color;}";
  var vertexShader$9 = "varying vec2 vOffset0;varying vec2 vOffset1;void mainSupport(const in vec2 uv){vOffset0=uv+texelSize*vec2(1.0,0.0);vOffset1=uv+texelSize*vec2(0.0,1.0);}";

  var SMAAEffect = function (_Effect21) {
    _inherits(SMAAEffect, _Effect21);

    function SMAAEffect(searchImage, areaImage) {
      var _this36;

      var preset = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : SMAAPreset.HIGH;

      _classCallCheck(this, SMAAEffect);

      _this36 = _possibleConstructorReturn(this, _getPrototypeOf(SMAAEffect).call(this, "SMAAEffect", fragmentShader$t, {
        vertexShader: vertexShader$9,
        blendFunction: BlendFunction.NORMAL,
        attributes: EffectAttribute.CONVOLUTION,
        uniforms: new Map([["weightMap", new three.Uniform(null)]])
      }));
      _this36.renderTargetColorEdges = new three.WebGLRenderTarget(1, 1, {
        minFilter: three.LinearFilter,
        stencilBuffer: false,
        depthBuffer: false,
        format: three.RGBFormat
      });
      _this36.renderTargetColorEdges.texture.name = "SMAA.ColorEdges";
      _this36.renderTargetWeights = _this36.renderTargetColorEdges.clone();
      _this36.renderTargetWeights.texture.name = "SMAA.Weights";
      _this36.renderTargetWeights.texture.format = three.RGBAFormat;
      _this36.uniforms.get("weightMap").value = _this36.renderTargetWeights.texture;
      _this36.clearPass = new ClearPass(true, false, false);
      _this36.clearPass.overrideClearColor = new three.Color(0x000000);
      _this36.clearPass.overrideClearAlpha = 1.0;
      _this36.colorEdgesPass = new ShaderPass(new ColorEdgesMaterial());
      _this36.weightsPass = new ShaderPass(new SMAAWeightsMaterial());

      _this36.weightsPass.getFullscreenMaterial().uniforms.searchTexture.value = function () {
        var searchTexture = new three.Texture(searchImage);
        searchTexture.name = "SMAA.Search";
        searchTexture.magFilter = three.NearestFilter;
        searchTexture.minFilter = three.NearestFilter;
        searchTexture.format = three.RGBAFormat;
        searchTexture.generateMipmaps = false;
        searchTexture.needsUpdate = true;
        searchTexture.flipY = true;
        return searchTexture;
      }();

      _this36.weightsPass.getFullscreenMaterial().uniforms.areaTexture.value = function () {
        var areaTexture = new three.Texture(areaImage);
        areaTexture.name = "SMAA.Area";
        areaTexture.minFilter = three.LinearFilter;
        areaTexture.format = three.RGBAFormat;
        areaTexture.generateMipmaps = false;
        areaTexture.needsUpdate = true;
        areaTexture.flipY = false;
        return areaTexture;
      }();

      _this36.applyPreset(preset);

      return _this36;
    }

    _createClass(SMAAEffect, [{
      key: "setEdgeDetectionThreshold",
      value: function setEdgeDetectionThreshold(threshold) {
        this.colorEdgesPass.getFullscreenMaterial().setEdgeDetectionThreshold(threshold);
      }
    }, {
      key: "setOrthogonalSearchSteps",
      value: function setOrthogonalSearchSteps(steps) {
        this.weightsPass.getFullscreenMaterial().setOrthogonalSearchSteps(steps);
      }
    }, {
      key: "applyPreset",
      value: function applyPreset(preset) {
        var colorEdgesMaterial = this.colorEdgesMaterial;
        var weightsMaterial = this.weightsMaterial;

        switch (preset) {
          case SMAAPreset.LOW:
            colorEdgesMaterial.setEdgeDetectionThreshold(0.15);
            weightsMaterial.setOrthogonalSearchSteps(4);
            weightsMaterial.diagonalDetection = false;
            weightsMaterial.cornerRounding = false;
            break;

          case SMAAPreset.MEDIUM:
            colorEdgesMaterial.setEdgeDetectionThreshold(0.1);
            weightsMaterial.setOrthogonalSearchSteps(8);
            weightsMaterial.diagonalDetection = false;
            weightsMaterial.cornerRounding = false;
            break;

          case SMAAPreset.HIGH:
            colorEdgesMaterial.setEdgeDetectionThreshold(0.1);
            weightsMaterial.setOrthogonalSearchSteps(16);
            weightsMaterial.setDiagonalSearchSteps(8);
            weightsMaterial.setCornerRounding(25);
            weightsMaterial.diagonalDetection = true;
            weightsMaterial.cornerRounding = true;
            break;

          case SMAAPreset.ULTRA:
            colorEdgesMaterial.setEdgeDetectionThreshold(0.05);
            weightsMaterial.setOrthogonalSearchSteps(32);
            weightsMaterial.setDiagonalSearchSteps(16);
            weightsMaterial.setCornerRounding(25);
            weightsMaterial.diagonalDetection = true;
            weightsMaterial.cornerRounding = true;
            break;
        }
      }
    }, {
      key: "update",
      value: function update(renderer, inputBuffer, deltaTime) {
        this.clearPass.render(renderer, this.renderTargetColorEdges);
        this.colorEdgesPass.render(renderer, inputBuffer, this.renderTargetColorEdges);
        this.weightsPass.render(renderer, this.renderTargetColorEdges, this.renderTargetWeights);
      }
    }, {
      key: "setSize",
      value: function setSize(width, height) {
        var colorEdgesMaterial = this.colorEdgesPass.getFullscreenMaterial();
        var weightsMaterial = this.weightsPass.getFullscreenMaterial();
        this.renderTargetColorEdges.setSize(width, height);
        this.renderTargetWeights.setSize(width, height);
        weightsMaterial.uniforms.resolution.value.set(width, height);
        weightsMaterial.uniforms.texelSize.value.set(1.0 / width, 1.0 / height);
        colorEdgesMaterial.uniforms.texelSize.value.copy(weightsMaterial.uniforms.texelSize.value);
      }
    }, {
      key: "colorEdgesMaterial",
      get: function get() {
        return this.colorEdgesPass.getFullscreenMaterial();
      }
    }, {
      key: "weightsMaterial",
      get: function get() {
        return this.weightsPass.getFullscreenMaterial();
      }
    }], [{
      key: "searchImageDataURL",
      get: function get() {
        return searchImageDataURL;
      }
    }, {
      key: "areaImageDataURL",
      get: function get() {
        return areaImageDataURL;
      }
    }]);

    return SMAAEffect;
  }(Effect);

  var SMAAPreset = {
    LOW: 0,
    MEDIUM: 1,
    HIGH: 2,
    ULTRA: 3
  };
  var fragmentShader$u = "uniform sampler2D normalBuffer;uniform mat4 cameraProjectionMatrix;uniform mat4 cameraInverseProjectionMatrix;uniform vec2 radiusStep;uniform vec2 distanceCutoff;uniform vec2 proximityCutoff;uniform float seed;uniform float luminanceInfluence;uniform float scale;uniform float bias;float getViewZ(const in float depth){\n#ifdef PERSPECTIVE_CAMERA\nreturn perspectiveDepthToViewZ(depth,cameraNear,cameraFar);\n#else\nreturn orthographicDepthToViewZ(depth,cameraNear,cameraFar);\n#endif\n}vec3 getViewPosition(const in vec2 screenPosition,const in float depth,const in float viewZ){float clipW=cameraProjectionMatrix[2][3]*viewZ+cameraProjectionMatrix[3][3];vec4 clipPosition=vec4((vec3(screenPosition,depth)-0.5)*2.0,1.0);clipPosition*=clipW;return(cameraInverseProjectionMatrix*clipPosition).xyz;}float getOcclusion(const in vec3 p,const in vec3 n,const in vec3 sampleViewPosition){vec3 viewDelta=sampleViewPosition-p;float d=length(viewDelta)*scale;return max(0.0,dot(n,viewDelta)/d-bias)/(1.0+pow2(d));}float getAmbientOcclusion(const in vec3 p,const in vec3 n,const in float depth,const in vec2 uv){vec2 radius=radiusStep;float angle=rand(uv+seed)*PI2;float occlusionSum=0.0;for(int i=0;i<SAMPLES_INT;++i){vec2 coord=uv+vec2(cos(angle),sin(angle))*radius;radius+=radiusStep;angle+=ANGLE_STEP;float sampleDepth=readDepth(coord);float proximity=abs(depth-sampleDepth);if(sampleDepth<distanceCutoff.y&&proximity<proximityCutoff.y){float falloff=1.0-smoothstep(proximityCutoff.x,proximityCutoff.y,proximity);vec3 sampleViewPosition=getViewPosition(coord,sampleDepth,getViewZ(sampleDepth));occlusionSum+=getOcclusion(p,n,sampleViewPosition)*falloff;}}return occlusionSum/SAMPLES_FLOAT;}void mainImage(const in vec4 inputColor,const in vec2 uv,const in float depth,out vec4 outputColor){float ao=1.0;if(depth<distanceCutoff.y){vec3 viewPosition=getViewPosition(uv,depth,getViewZ(depth));vec3 viewNormal=unpackRGBToNormal(texture2D(normalBuffer,uv).xyz);ao-=getAmbientOcclusion(viewPosition,viewNormal,depth,uv);float l=linearToRelativeLuminance(inputColor.rgb);ao=mix(ao,1.0,max(l*luminanceInfluence,smoothstep(distanceCutoff.x,distanceCutoff.y,depth)));}outputColor=vec4(vec3(ao),inputColor.a);}";

  var SSAOEffect = function (_Effect22) {
    _inherits(SSAOEffect, _Effect22);

    function SSAOEffect(camera, normalBuffer) {
      var _this37;

      var _ref27 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
          _ref27$blendFunction = _ref27.blendFunction,
          blendFunction = _ref27$blendFunction === void 0 ? BlendFunction.MULTIPLY : _ref27$blendFunction,
          _ref27$samples = _ref27.samples,
          samples = _ref27$samples === void 0 ? 11 : _ref27$samples,
          _ref27$rings = _ref27.rings,
          rings = _ref27$rings === void 0 ? 4 : _ref27$rings,
          _ref27$distanceThresh = _ref27.distanceThreshold,
          distanceThreshold = _ref27$distanceThresh === void 0 ? 0.65 : _ref27$distanceThresh,
          _ref27$distanceFallof = _ref27.distanceFalloff,
          distanceFalloff = _ref27$distanceFallof === void 0 ? 0.1 : _ref27$distanceFallof,
          _ref27$rangeThreshold = _ref27.rangeThreshold,
          rangeThreshold = _ref27$rangeThreshold === void 0 ? 0.0015 : _ref27$rangeThreshold,
          _ref27$rangeFalloff = _ref27.rangeFalloff,
          rangeFalloff = _ref27$rangeFalloff === void 0 ? 0.01 : _ref27$rangeFalloff,
          _ref27$luminanceInflu = _ref27.luminanceInfluence,
          luminanceInfluence = _ref27$luminanceInflu === void 0 ? 0.7 : _ref27$luminanceInflu,
          _ref27$radius = _ref27.radius,
          radius = _ref27$radius === void 0 ? 18.25 : _ref27$radius,
          _ref27$scale = _ref27.scale,
          scale = _ref27$scale === void 0 ? 1.0 : _ref27$scale,
          _ref27$bias = _ref27.bias,
          bias = _ref27$bias === void 0 ? 0.5 : _ref27$bias;

      _classCallCheck(this, SSAOEffect);

      _this37 = _possibleConstructorReturn(this, _getPrototypeOf(SSAOEffect).call(this, "SSAOEffect", fragmentShader$u, {
        blendFunction: blendFunction,
        attributes: EffectAttribute.DEPTH,
        defines: new Map([["RINGS_INT", "0"], ["SAMPLES_INT", "0"], ["SAMPLES_FLOAT", "0.0"]]),
        uniforms: new Map([["normalBuffer", new three.Uniform(normalBuffer)], ["cameraInverseProjectionMatrix", new three.Uniform(new three.Matrix4())], ["cameraProjectionMatrix", new three.Uniform(new three.Matrix4())], ["radiusStep", new three.Uniform(new three.Vector2())], ["distanceCutoff", new three.Uniform(new three.Vector2())], ["proximityCutoff", new three.Uniform(new three.Vector2())], ["seed", new three.Uniform(Math.random())], ["luminanceInfluence", new three.Uniform(luminanceInfluence)], ["scale", new three.Uniform(scale)], ["bias", new three.Uniform(bias)]])
      }));
      _this37.r = 0.0;
      _this37.resolution = new three.Vector2(1, 1);
      _this37.camera = camera;
      _this37.samples = samples;
      _this37.rings = rings;
      _this37.radius = radius;

      _this37.setDistanceCutoff(distanceThreshold, distanceFalloff);

      _this37.setProximityCutoff(rangeThreshold, rangeFalloff);

      return _this37;
    }

    _createClass(SSAOEffect, [{
      key: "updateAngleStep",
      value: function updateAngleStep() {
        this.defines.set("ANGLE_STEP", (Math.PI * 2.0 * this.rings / this.samples).toFixed(11));
      }
    }, {
      key: "updateRadiusStep",
      value: function updateRadiusStep() {
        var r = this.r / this.samples;
        this.uniforms.get("radiusStep").value.set(r, r).divide(this.resolution);
      }
    }, {
      key: "setDistanceCutoff",
      value: function setDistanceCutoff(threshold, falloff) {
        this.uniforms.get("distanceCutoff").value.set(threshold, Math.min(threshold + falloff, 1.0 - 1e-6));
      }
    }, {
      key: "setProximityCutoff",
      value: function setProximityCutoff(threshold, falloff) {
        this.uniforms.get("proximityCutoff").value.set(threshold, Math.min(threshold + falloff, 1.0 - 1e-6));
      }
    }, {
      key: "setSize",
      value: function setSize(width, height) {
        this.resolution.set(width, height);
        this.updateRadiusStep();
        this.uniforms.get("cameraInverseProjectionMatrix").value.getInverse(this.camera.projectionMatrix);
        this.uniforms.get("cameraProjectionMatrix").value.copy(this.camera.projectionMatrix);
      }
    }, {
      key: "samples",
      get: function get() {
        return Number.parseInt(this.defines.get("SAMPLES_INT"));
      },
      set: function set(value) {
        value = Math.floor(value);
        this.defines.set("SAMPLES_INT", value.toFixed(0));
        this.defines.set("SAMPLES_FLOAT", value.toFixed(1));
        this.updateAngleStep();
        this.updateRadiusStep();
      }
    }, {
      key: "rings",
      get: function get() {
        return Number.parseInt(this.defines.get("RINGS_INT"));
      },
      set: function set(value) {
        value = Math.floor(value);
        this.defines.set("RINGS_INT", value.toFixed(0));
        this.updateAngleStep();
      }
    }, {
      key: "radius",
      get: function get() {
        return this.r;
      },
      set: function set(value) {
        this.r = value;
        this.updateRadiusStep();
      }
    }]);

    return SSAOEffect;
  }(Effect);

  var vertexShader$a = "uniform float scale;varying vec2 vUv2;void mainSupport(const in vec2 uv){vUv2=uv*vec2(aspect,1.0)*scale;}";

  var TextureEffect = function (_Effect23) {
    _inherits(TextureEffect, _Effect23);

    function TextureEffect() {
      var _this38;

      var _ref28 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          _ref28$blendFunction = _ref28.blendFunction,
          blendFunction = _ref28$blendFunction === void 0 ? BlendFunction.NORMAL : _ref28$blendFunction,
          _ref28$texture = _ref28.texture,
          texture = _ref28$texture === void 0 ? null : _ref28$texture,
          _ref28$aspectCorrecti = _ref28.aspectCorrection,
          aspectCorrection = _ref28$aspectCorrecti === void 0 ? false : _ref28$aspectCorrecti;

      _classCallCheck(this, TextureEffect);

      _this38 = _possibleConstructorReturn(this, _getPrototypeOf(TextureEffect).call(this, "TextureEffect", fragmentShader$a, {
        blendFunction: blendFunction,
        uniforms: new Map([["texture", new three.Uniform(texture)]])
      }));
      _this38.aspectCorrection = aspectCorrection;
      return _this38;
    }

    _createClass(TextureEffect, [{
      key: "aspectCorrection",
      get: function get() {
        return this.defines.has("ASPECT_CORRECTION");
      },
      set: function set(value) {
        if (value) {
          this.defines.set("ASPECT_CORRECTION", "1");
          this.uniforms.set("scale", new three.Uniform(1.0));
          this.vertexShader = vertexShader$a;
        } else {
          this.defines["delete"]("ASPECT_CORRECTION");
          this.uniforms["delete"]("scale");
          this.vertexShader = null;
        }
      }
    }]);

    return TextureEffect;
  }(Effect);

  var fragmentShader$v = "uniform sampler2D luminanceMap;uniform float middleGrey;uniform float maxLuminance;uniform float averageLuminance;vec3 toneMap(vec3 c){\n#ifdef ADAPTED_LUMINANCE\nfloat lumAvg=texture2D(luminanceMap,vec2(0.5)).r;\n#else\nfloat lumAvg=averageLuminance;\n#endif\nfloat lumPixel=linearToRelativeLuminance(c);float lumScaled=(lumPixel*middleGrey)/lumAvg;float lumCompressed=(lumScaled*(1.0+(lumScaled/(maxLuminance*maxLuminance))))/(1.0+lumScaled);return lumCompressed*c;}void mainImage(const in vec4 inputColor,const in vec2 uv,out vec4 outputColor){outputColor=vec4(toneMap(inputColor.rgb),inputColor.a);}";

  var ToneMappingEffect = function (_Effect24) {
    _inherits(ToneMappingEffect, _Effect24);

    function ToneMappingEffect() {
      var _this39;

      var _ref29 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          _ref29$blendFunction = _ref29.blendFunction,
          blendFunction = _ref29$blendFunction === void 0 ? BlendFunction.NORMAL : _ref29$blendFunction,
          _ref29$adaptive = _ref29.adaptive,
          adaptive = _ref29$adaptive === void 0 ? true : _ref29$adaptive,
          _ref29$resolution = _ref29.resolution,
          resolution = _ref29$resolution === void 0 ? 256 : _ref29$resolution,
          _ref29$middleGrey = _ref29.middleGrey,
          middleGrey = _ref29$middleGrey === void 0 ? 0.6 : _ref29$middleGrey,
          _ref29$maxLuminance = _ref29.maxLuminance,
          maxLuminance = _ref29$maxLuminance === void 0 ? 16.0 : _ref29$maxLuminance,
          _ref29$averageLuminan = _ref29.averageLuminance,
          averageLuminance = _ref29$averageLuminan === void 0 ? 1.0 : _ref29$averageLuminan,
          _ref29$adaptationRate = _ref29.adaptationRate,
          adaptationRate = _ref29$adaptationRate === void 0 ? 2.0 : _ref29$adaptationRate;

      _classCallCheck(this, ToneMappingEffect);

      _this39 = _possibleConstructorReturn(this, _getPrototypeOf(ToneMappingEffect).call(this, "ToneMappingEffect", fragmentShader$v, {
        blendFunction: blendFunction,
        uniforms: new Map([["luminanceMap", new three.Uniform(null)], ["middleGrey", new three.Uniform(middleGrey)], ["maxLuminance", new three.Uniform(maxLuminance)], ["averageLuminance", new three.Uniform(averageLuminance)]])
      }));
      _this39.renderTargetLuminance = new three.WebGLRenderTarget(1, 1, {
        minFilter: three.LinearMipmapLinearFilter !== undefined ? three.LinearMipmapLinearFilter : three.LinearMipMapLinearFilter,
        magFilter: three.LinearFilter,
        stencilBuffer: false,
        depthBuffer: false,
        format: three.RGBFormat
      });
      _this39.renderTargetLuminance.texture.name = "ToneMapping.Luminance";
      _this39.renderTargetLuminance.texture.generateMipmaps = true;
      _this39.renderTargetAdapted = _this39.renderTargetLuminance.clone();
      _this39.renderTargetAdapted.texture.name = "ToneMapping.AdaptedLuminance";
      _this39.renderTargetAdapted.texture.generateMipmaps = false;
      _this39.renderTargetAdapted.texture.minFilter = three.LinearFilter;
      _this39.renderTargetPrevious = _this39.renderTargetAdapted.clone();
      _this39.renderTargetPrevious.texture.name = "ToneMapping.PreviousLuminance";
      _this39.savePass = new SavePass(_this39.renderTargetPrevious, false);
      _this39.luminancePass = new ShaderPass(new LuminanceMaterial());

      var luminanceMaterial = _this39.luminancePass.getFullscreenMaterial();

      luminanceMaterial.useThreshold = false;
      _this39.adaptiveLuminancePass = new ShaderPass(new AdaptiveLuminanceMaterial());
      _this39.adaptationRate = adaptationRate;
      _this39.resolution = resolution;
      _this39.adaptive = adaptive;
      return _this39;
    }

    _createClass(ToneMappingEffect, [{
      key: "update",
      value: function update(renderer, inputBuffer, deltaTime) {
        if (this.adaptive) {
          this.luminancePass.render(renderer, inputBuffer, this.renderTargetLuminance);
          var uniforms = this.adaptiveLuminancePass.getFullscreenMaterial().uniforms;
          uniforms.previousLuminanceBuffer.value = this.renderTargetPrevious.texture;
          uniforms.currentLuminanceBuffer.value = this.renderTargetLuminance.texture;
          uniforms.deltaTime.value = deltaTime;
          this.adaptiveLuminancePass.render(renderer, null, this.renderTargetAdapted);
          this.savePass.render(renderer, this.renderTargetAdapted);
        }
      }
    }, {
      key: "setSize",
      value: function setSize(width, height) {
        this.savePass.setSize(width, height);
      }
    }, {
      key: "initialize",
      value: function initialize(renderer, alpha) {
        var clearPass = new ClearPass(true, false, false);
        clearPass.overrideClearColor = new three.Color(0x7fffff);
        clearPass.render(renderer, this.renderTargetPrevious);
        clearPass.dispose();
      }
    }, {
      key: "resolution",
      get: function get() {
        return this.renderTargetLuminance.width;
      },
      set: function set(value) {
        var exponent = Math.max(0, Math.ceil(Math.log2(value)));
        value = Math.pow(2, exponent);
        this.renderTargetLuminance.setSize(value, value);
        this.renderTargetPrevious.setSize(value, value);
        this.renderTargetAdapted.setSize(value, value);
        this.adaptiveLuminancePass.getFullscreenMaterial().defines.MIP_LEVEL_1X1 = exponent.toFixed(1);
      }
    }, {
      key: "adaptive",
      get: function get() {
        return this.defines.has("ADAPTED_LUMINANCE");
      },
      set: function set(value) {
        if (value) {
          this.defines.set("ADAPTED_LUMINANCE", "1");
          this.uniforms.get("luminanceMap").value = this.renderTargetAdapted.texture;
        } else {
          this.defines["delete"]("ADAPTED_LUMINANCE");
          this.uniforms.get("luminanceMap").value = null;
        }
      }
    }, {
      key: "adaptationRate",
      get: function get() {
        return this.adaptiveLuminancePass.getFullscreenMaterial().uniforms.tau.value;
      },
      set: function set(value) {
        this.adaptiveLuminancePass.getFullscreenMaterial().uniforms.tau.value = value;
      }
    }, {
      key: "distinction",
      get: function get() {
        console.warn(this.name, "The distinction field has been removed.");
        return 1.0;
      },
      set: function set(value) {
        console.warn(this.name, "The distinction field has been removed.");
      }
    }]);

    return ToneMappingEffect;
  }(Effect);

  var fragmentShader$w = "uniform float offset;uniform float darkness;void mainImage(const in vec4 inputColor,const in vec2 uv,out vec4 outputColor){const vec2 center=vec2(0.5);vec3 color=inputColor.rgb;\n#ifdef ESKIL\nvec2 coord=(uv-center)*vec2(offset);color=mix(color,vec3(1.0-darkness),dot(coord,coord));\n#else\nfloat d=distance(uv,center);color*=smoothstep(0.8,offset*0.799,d*(darkness+offset));\n#endif\noutputColor=vec4(color,inputColor.a);}";

  var VignetteEffect = function (_Effect25) {
    _inherits(VignetteEffect, _Effect25);

    function VignetteEffect() {
      var _this40;

      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      _classCallCheck(this, VignetteEffect);

      var settings = Object.assign({
        blendFunction: BlendFunction.NORMAL,
        eskil: false,
        offset: 0.5,
        darkness: 0.5
      }, options);
      _this40 = _possibleConstructorReturn(this, _getPrototypeOf(VignetteEffect).call(this, "VignetteEffect", fragmentShader$w, {
        blendFunction: settings.blendFunction,
        uniforms: new Map([["offset", new three.Uniform(settings.offset)], ["darkness", new three.Uniform(settings.darkness)]])
      }));
      _this40.eskil = settings.eskil;
      return _this40;
    }

    _createClass(VignetteEffect, [{
      key: "eskil",
      get: function get() {
        return this.defines.has("ESKIL");
      },
      set: function set(value) {
        value ? this.defines.set("ESKIL", "1") : this.defines["delete"]("ESKIL");
      }
    }]);

    return VignetteEffect;
  }(Effect);

  var Action = {
    MOVE_FORWARD: 0,
    MOVE_LEFT: 1,
    MOVE_BACKWARD: 2,
    MOVE_RIGHT: 3,
    MOVE_DOWN: 4,
    MOVE_UP: 5,
    ZOOM_OUT: 6,
    ZOOM_IN: 7
  };

  var Vector3 = function () {
    function Vector3() {
      var x = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
      var y = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      var z = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

      _classCallCheck(this, Vector3);

      this.x = x;
      this.y = y;
      this.z = z;
    }

    _createClass(Vector3, [{
      key: "set",
      value: function set(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
        return this;
      }
    }, {
      key: "copy",
      value: function copy(v) {
        this.x = v.x;
        this.y = v.y;
        this.z = v.z;
        return this;
      }
    }, {
      key: "clone",
      value: function clone() {
        return new this.constructor(this.x, this.y, this.z);
      }
    }, {
      key: "fromArray",
      value: function fromArray(array) {
        var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
        this.x = array[offset];
        this.y = array[offset + 1];
        this.z = array[offset + 2];
        return this;
      }
    }, {
      key: "toArray",
      value: function toArray() {
        var array = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
        var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
        array[offset] = this.x;
        array[offset + 1] = this.y;
        array[offset + 2] = this.z;
        return array;
      }
    }, {
      key: "setFromSpherical",
      value: function setFromSpherical(s) {
        this.setFromSphericalCoords(s.radius, s.phi, s.theta);
      }
    }, {
      key: "setFromSphericalCoords",
      value: function setFromSphericalCoords(radius, phi, theta) {
        var sinPhiRadius = Math.sin(phi) * radius;
        this.x = sinPhiRadius * Math.sin(theta);
        this.y = Math.cos(phi) * radius;
        this.z = sinPhiRadius * Math.cos(theta);
        return this;
      }
    }, {
      key: "setFromCylindrical",
      value: function setFromCylindrical(c) {
        this.setFromCylindricalCoords(c.radius, c.theta, c.y);
      }
    }, {
      key: "setFromCylindricalCoords",
      value: function setFromCylindricalCoords(radius, theta, y) {
        this.x = radius * Math.sin(theta);
        this.y = y;
        this.z = radius * Math.cos(theta);
        return this;
      }
    }, {
      key: "setFromMatrixColumn",
      value: function setFromMatrixColumn(m, index) {
        return this.fromArray(m.elements, index * 4);
      }
    }, {
      key: "setFromMatrixPosition",
      value: function setFromMatrixPosition(m) {
        var me = m.elements;
        this.x = me[12];
        this.y = me[13];
        this.z = me[14];
        return this;
      }
    }, {
      key: "setFromMatrixScale",
      value: function setFromMatrixScale(m) {
        var sx = this.setFromMatrixColumn(m, 0).length();
        var sy = this.setFromMatrixColumn(m, 1).length();
        var sz = this.setFromMatrixColumn(m, 2).length();
        this.x = sx;
        this.y = sy;
        this.z = sz;
        return this;
      }
    }, {
      key: "add",
      value: function add(v) {
        this.x += v.x;
        this.y += v.y;
        this.z += v.z;
        return this;
      }
    }, {
      key: "addScalar",
      value: function addScalar(s) {
        this.x += s;
        this.y += s;
        this.z += s;
        return this;
      }
    }, {
      key: "addVectors",
      value: function addVectors(a, b) {
        this.x = a.x + b.x;
        this.y = a.y + b.y;
        this.z = a.z + b.z;
        return this;
      }
    }, {
      key: "addScaledVector",
      value: function addScaledVector(v, s) {
        this.x += v.x * s;
        this.y += v.y * s;
        this.z += v.z * s;
        return this;
      }
    }, {
      key: "sub",
      value: function sub(v) {
        this.x -= v.x;
        this.y -= v.y;
        this.z -= v.z;
        return this;
      }
    }, {
      key: "subScalar",
      value: function subScalar(s) {
        this.x -= s;
        this.y -= s;
        this.z -= s;
        return this;
      }
    }, {
      key: "subVectors",
      value: function subVectors(a, b) {
        this.x = a.x - b.x;
        this.y = a.y - b.y;
        this.z = a.z - b.z;
        return this;
      }
    }, {
      key: "multiply",
      value: function multiply(v) {
        this.x *= v.x;
        this.y *= v.y;
        this.z *= v.z;
        return this;
      }
    }, {
      key: "multiplyScalar",
      value: function multiplyScalar(s) {
        this.x *= s;
        this.y *= s;
        this.z *= s;
        return this;
      }
    }, {
      key: "multiplyVectors",
      value: function multiplyVectors(a, b) {
        this.x = a.x * b.x;
        this.y = a.y * b.y;
        this.z = a.z * b.z;
        return this;
      }
    }, {
      key: "divide",
      value: function divide(v) {
        this.x /= v.x;
        this.y /= v.y;
        this.z /= v.z;
        return this;
      }
    }, {
      key: "divideScalar",
      value: function divideScalar(s) {
        this.x /= s;
        this.y /= s;
        this.z /= s;
        return this;
      }
    }, {
      key: "crossVectors",
      value: function crossVectors(a, b) {
        var ax = a.x,
            ay = a.y,
            az = a.z;
        var bx = b.x,
            by = b.y,
            bz = b.z;
        this.x = ay * bz - az * by;
        this.y = az * bx - ax * bz;
        this.z = ax * by - ay * bx;
        return this;
      }
    }, {
      key: "cross",
      value: function cross(v) {
        return this.crossVectors(this, v);
      }
    }, {
      key: "transformDirection",
      value: function transformDirection(m) {
        var x = this.x,
            y = this.y,
            z = this.z;
        var e = m.elements;
        this.x = e[0] * x + e[4] * y + e[8] * z;
        this.y = e[1] * x + e[5] * y + e[9] * z;
        this.z = e[2] * x + e[6] * y + e[10] * z;
        return this.normalize();
      }
    }, {
      key: "applyMatrix3",
      value: function applyMatrix3(m) {
        var x = this.x,
            y = this.y,
            z = this.z;
        var e = m.elements;
        this.x = e[0] * x + e[3] * y + e[6] * z;
        this.y = e[1] * x + e[4] * y + e[7] * z;
        this.z = e[2] * x + e[5] * y + e[8] * z;
        return this;
      }
    }, {
      key: "applyMatrix4",
      value: function applyMatrix4(m) {
        var x = this.x,
            y = this.y,
            z = this.z;
        var e = m.elements;
        this.x = e[0] * x + e[4] * y + e[8] * z + e[12];
        this.y = e[1] * x + e[5] * y + e[9] * z + e[13];
        this.z = e[2] * x + e[6] * y + e[10] * z + e[14];
        return this;
      }
    }, {
      key: "applyQuaternion",
      value: function applyQuaternion(q) {
        var x = this.x,
            y = this.y,
            z = this.z;
        var qx = q.x,
            qy = q.y,
            qz = q.z,
            qw = q.w;
        var ix = qw * x + qy * z - qz * y;
        var iy = qw * y + qz * x - qx * z;
        var iz = qw * z + qx * y - qy * x;
        var iw = -qx * x - qy * y - qz * z;
        this.x = ix * qw + iw * -qx + iy * -qz - iz * -qy;
        this.y = iy * qw + iw * -qy + iz * -qx - ix * -qz;
        this.z = iz * qw + iw * -qz + ix * -qy - iy * -qx;
        return this;
      }
    }, {
      key: "negate",
      value: function negate() {
        this.x = -this.x;
        this.y = -this.y;
        this.z = -this.z;
        return this;
      }
    }, {
      key: "dot",
      value: function dot(v) {
        return this.x * v.x + this.y * v.y + this.z * v.z;
      }
    }, {
      key: "reflect",
      value: function reflect(n) {
        var nx = n.x;
        var ny = n.y;
        var nz = n.z;
        this.sub(n.multiplyScalar(2 * this.dot(n)));
        n.set(nx, ny, nz);
        return this;
      }
    }, {
      key: "angleTo",
      value: function angleTo(v) {
        var theta = this.dot(v) / Math.sqrt(this.lengthSquared() * v.lengthSquared());
        return Math.acos(Math.min(Math.max(theta, -1), 1));
      }
    }, {
      key: "manhattanLength",
      value: function manhattanLength() {
        return Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z);
      }
    }, {
      key: "lengthSquared",
      value: function lengthSquared() {
        return this.x * this.x + this.y * this.y + this.z * this.z;
      }
    }, {
      key: "length",
      value: function length() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
      }
    }, {
      key: "manhattanDistanceTo",
      value: function manhattanDistanceTo(v) {
        return Math.abs(this.x - v.x) + Math.abs(this.y - v.y) + Math.abs(this.z - v.z);
      }
    }, {
      key: "distanceToSquared",
      value: function distanceToSquared(v) {
        var dx = this.x - v.x;
        var dy = this.y - v.y;
        var dz = this.z - v.z;
        return dx * dx + dy * dy + dz * dz;
      }
    }, {
      key: "distanceTo",
      value: function distanceTo(v) {
        return Math.sqrt(this.distanceToSquared(v));
      }
    }, {
      key: "normalize",
      value: function normalize() {
        return this.divideScalar(this.length());
      }
    }, {
      key: "setLength",
      value: function setLength(length) {
        return this.normalize().multiplyScalar(length);
      }
    }, {
      key: "min",
      value: function min(v) {
        this.x = Math.min(this.x, v.x);
        this.y = Math.min(this.y, v.y);
        this.z = Math.min(this.z, v.z);
        return this;
      }
    }, {
      key: "max",
      value: function max(v) {
        this.x = Math.max(this.x, v.x);
        this.y = Math.max(this.y, v.y);
        this.z = Math.max(this.z, v.z);
        return this;
      }
    }, {
      key: "clamp",
      value: function clamp(min, max) {
        this.x = Math.max(min.x, Math.min(max.x, this.x));
        this.y = Math.max(min.y, Math.min(max.y, this.y));
        this.z = Math.max(min.z, Math.min(max.z, this.z));
        return this;
      }
    }, {
      key: "floor",
      value: function floor() {
        this.x = Math.floor(this.x);
        this.y = Math.floor(this.y);
        this.z = Math.floor(this.z);
        return this;
      }
    }, {
      key: "ceil",
      value: function ceil() {
        this.x = Math.ceil(this.x);
        this.y = Math.ceil(this.y);
        this.z = Math.ceil(this.z);
        return this;
      }
    }, {
      key: "round",
      value: function round() {
        this.x = Math.round(this.x);
        this.y = Math.round(this.y);
        this.z = Math.round(this.z);
        return this;
      }
    }, {
      key: "lerp",
      value: function lerp(v, alpha) {
        this.x += (v.x - this.x) * alpha;
        this.y += (v.y - this.y) * alpha;
        this.z += (v.z - this.z) * alpha;
        return this;
      }
    }, {
      key: "lerpVectors",
      value: function lerpVectors(v1, v2, alpha) {
        return this.subVectors(v2, v1).multiplyScalar(alpha).add(v1);
      }
    }, {
      key: "equals",
      value: function equals(v) {
        return v.x === this.x && v.y === this.y && v.z === this.z;
      }
    }]);

    return Vector3;
  }();

  var Vector2 = function () {
    function Vector2() {
      var x = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
      var y = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

      _classCallCheck(this, Vector2);

      this.x = x;
      this.y = y;
    }

    _createClass(Vector2, [{
      key: "set",
      value: function set(x, y) {
        this.x = x;
        this.y = y;
        return this;
      }
    }, {
      key: "copy",
      value: function copy(v) {
        this.x = v.x;
        this.y = v.y;
        return this;
      }
    }, {
      key: "clone",
      value: function clone() {
        return new this.constructor(this.x, this.y);
      }
    }, {
      key: "fromArray",
      value: function fromArray(array) {
        var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
        this.x = array[offset];
        this.y = array[offset + 1];
        return this;
      }
    }, {
      key: "toArray",
      value: function toArray() {
        var array = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
        var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
        array[offset] = this.x;
        array[offset + 1] = this.y;
        return array;
      }
    }, {
      key: "add",
      value: function add(v) {
        this.x += v.x;
        this.y += v.y;
        return this;
      }
    }, {
      key: "addScalar",
      value: function addScalar(s) {
        this.x += s;
        this.y += s;
        return this;
      }
    }, {
      key: "addVectors",
      value: function addVectors(a, b) {
        this.x = a.x + b.x;
        this.y = a.y + b.y;
        return this;
      }
    }, {
      key: "addScaledVector",
      value: function addScaledVector(v, s) {
        this.x += v.x * s;
        this.y += v.y * s;
        return this;
      }
    }, {
      key: "sub",
      value: function sub(v) {
        this.x -= v.x;
        this.y -= v.y;
        return this;
      }
    }, {
      key: "subScalar",
      value: function subScalar(s) {
        this.x -= s;
        this.y -= s;
        return this;
      }
    }, {
      key: "subVectors",
      value: function subVectors(a, b) {
        this.x = a.x - b.x;
        this.y = a.y - b.y;
        return this;
      }
    }, {
      key: "multiply",
      value: function multiply(v) {
        this.x *= v.x;
        this.y *= v.y;
        return this;
      }
    }, {
      key: "multiplyScalar",
      value: function multiplyScalar(s) {
        this.x *= s;
        this.y *= s;
        return this;
      }
    }, {
      key: "divide",
      value: function divide(v) {
        this.x /= v.x;
        this.y /= v.y;
        return this;
      }
    }, {
      key: "divideScalar",
      value: function divideScalar(s) {
        this.x /= s;
        this.y /= s;
        return this;
      }
    }, {
      key: "applyMatrix3",
      value: function applyMatrix3(m) {
        var x = this.x,
            y = this.y;
        var e = m.elements;
        this.x = e[0] * x + e[3] * y + e[6];
        this.y = e[1] * x + e[4] * y + e[7];
        return this;
      }
    }, {
      key: "dot",
      value: function dot(v) {
        return this.x * v.x + this.y * v.y;
      }
    }, {
      key: "cross",
      value: function cross(v) {
        return this.x * v.y - this.y * v.x;
      }
    }, {
      key: "manhattanLength",
      value: function manhattanLength() {
        return Math.abs(this.x) + Math.abs(this.y);
      }
    }, {
      key: "lengthSquared",
      value: function lengthSquared() {
        return this.x * this.x + this.y * this.y;
      }
    }, {
      key: "length",
      value: function length() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
      }
    }, {
      key: "manhattanDistanceTo",
      value: function manhattanDistanceTo(v) {
        return Math.abs(this.x - v.x) + Math.abs(this.y - v.y);
      }
    }, {
      key: "distanceToSquared",
      value: function distanceToSquared(v) {
        var dx = this.x - v.x;
        var dy = this.y - v.y;
        return dx * dx + dy * dy;
      }
    }, {
      key: "distanceTo",
      value: function distanceTo(v) {
        return Math.sqrt(this.distanceToSquared(v));
      }
    }, {
      key: "normalize",
      value: function normalize() {
        return this.divideScalar(this.length());
      }
    }, {
      key: "setLength",
      value: function setLength(length) {
        return this.normalize().multiplyScalar(length);
      }
    }, {
      key: "min",
      value: function min(v) {
        this.x = Math.min(this.x, v.x);
        this.y = Math.min(this.y, v.y);
        return this;
      }
    }, {
      key: "max",
      value: function max(v) {
        this.x = Math.max(this.x, v.x);
        this.y = Math.max(this.y, v.y);
        return this;
      }
    }, {
      key: "clamp",
      value: function clamp(min, max) {
        this.x = Math.max(min.x, Math.min(max.x, this.x));
        this.y = Math.max(min.y, Math.min(max.y, this.y));
        return this;
      }
    }, {
      key: "floor",
      value: function floor() {
        this.x = Math.floor(this.x);
        this.y = Math.floor(this.y);
        return this;
      }
    }, {
      key: "ceil",
      value: function ceil() {
        this.x = Math.ceil(this.x);
        this.y = Math.ceil(this.y);
        return this;
      }
    }, {
      key: "round",
      value: function round() {
        this.x = Math.round(this.x);
        this.y = Math.round(this.y);
        return this;
      }
    }, {
      key: "negate",
      value: function negate() {
        this.x = -this.x;
        this.y = -this.y;
        return this;
      }
    }, {
      key: "angle",
      value: function angle() {
        var angle = Math.atan2(this.y, this.x);

        if (angle < 0) {
          angle += 2 * Math.PI;
        }

        return angle;
      }
    }, {
      key: "lerp",
      value: function lerp(v, alpha) {
        this.x += (v.x - this.x) * alpha;
        this.y += (v.y - this.y) * alpha;
        return this;
      }
    }, {
      key: "lerpVectors",
      value: function lerpVectors(v1, v2, alpha) {
        return this.subVectors(v2, v1).multiplyScalar(alpha).add(v1);
      }
    }, {
      key: "rotateAround",
      value: function rotateAround(center, angle) {
        var c = Math.cos(angle),
            s = Math.sin(angle);
        var x = this.x - center.x;
        var y = this.y - center.y;
        this.x = x * c - y * s + center.x;
        this.y = x * s + y * c + center.y;
        return this;
      }
    }, {
      key: "equals",
      value: function equals(v) {
        return v.x === this.x && v.y === this.y;
      }
    }, {
      key: "width",
      get: function get() {
        return this.x;
      },
      set: function set(value) {
        return this.x = value;
      }
    }, {
      key: "height",
      get: function get() {
        return this.y;
      },
      set: function set(value) {
        return this.y = value;
      }
    }]);

    return Vector2;
  }();

  var RotationOrder = {
    XYZ: "XYZ",
    YZX: "YZX",
    ZXY: "ZXY",
    XZY: "XZY",
    YXZ: "YXZ",
    ZYX: "ZYX"
  };
  var a$2 = new Vector3();
  var b$2 = new Vector3();
  var c = new Vector3();

  var Matrix4 = function () {
    function Matrix4() {
      _classCallCheck(this, Matrix4);

      this.elements = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
    }

    _createClass(Matrix4, [{
      key: "set",
      value: function set(n00, n01, n02, n03, n10, n11, n12, n13, n20, n21, n22, n23, n30, n31, n32, n33) {
        var te = this.elements;
        te[0] = n00;
        te[4] = n01;
        te[8] = n02;
        te[12] = n03;
        te[1] = n10;
        te[5] = n11;
        te[9] = n12;
        te[13] = n13;
        te[2] = n20;
        te[6] = n21;
        te[10] = n22;
        te[14] = n23;
        te[3] = n30;
        te[7] = n31;
        te[11] = n32;
        te[15] = n33;
        return this;
      }
    }, {
      key: "identity",
      value: function identity() {
        this.set(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
        return this;
      }
    }, {
      key: "copy",
      value: function copy(matrix) {
        var me = matrix.elements;
        var te = this.elements;
        te[0] = me[0];
        te[1] = me[1];
        te[2] = me[2];
        te[3] = me[3];
        te[4] = me[4];
        te[5] = me[5];
        te[6] = me[6];
        te[7] = me[7];
        te[8] = me[8];
        te[9] = me[9];
        te[10] = me[10];
        te[11] = me[11];
        te[12] = me[12];
        te[13] = me[13];
        te[14] = me[14];
        te[15] = me[15];
        return this;
      }
    }, {
      key: "clone",
      value: function clone() {
        return new this.constructor().fromArray(this.elements);
      }
    }, {
      key: "fromArray",
      value: function fromArray(array) {
        var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
        var te = this.elements;
        var i;

        for (i = 0; i < 16; ++i) {
          te[i] = array[i + offset];
        }

        return this;
      }
    }, {
      key: "toArray",
      value: function toArray() {
        var array = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
        var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
        var te = this.elements;
        var i;

        for (i = 0; i < 16; ++i) {
          array[i + offset] = te[i];
        }

        return array;
      }
    }, {
      key: "getMaxScaleOnAxis",
      value: function getMaxScaleOnAxis() {
        var te = this.elements;
        var scaleXSq = te[0] * te[0] + te[1] * te[1] + te[2] * te[2];
        var scaleYSq = te[4] * te[4] + te[5] * te[5] + te[6] * te[6];
        var scaleZSq = te[8] * te[8] + te[9] * te[9] + te[10] * te[10];
        return Math.sqrt(Math.max(scaleXSq, scaleYSq, scaleZSq));
      }
    }, {
      key: "copyPosition",
      value: function copyPosition(matrix) {
        var te = this.elements;
        var me = matrix.elements;
        te[12] = me[12];
        te[13] = me[13];
        te[14] = me[14];
        return this;
      }
    }, {
      key: "setPosition",
      value: function setPosition(p) {
        var te = this.elements;
        te[12] = p.x;
        te[13] = p.y;
        te[14] = p.z;
        return this;
      }
    }, {
      key: "extractBasis",
      value: function extractBasis(xAxis, yAxis, zAxis) {
        xAxis.setFromMatrixColumn(this, 0);
        yAxis.setFromMatrixColumn(this, 1);
        zAxis.setFromMatrixColumn(this, 2);
        return this;
      }
    }, {
      key: "makeBasis",
      value: function makeBasis(xAxis, yAxis, zAxis) {
        this.set(xAxis.x, yAxis.x, zAxis.x, 0, xAxis.y, yAxis.y, zAxis.y, 0, xAxis.z, yAxis.z, zAxis.z, 0, 0, 0, 0, 1);
        return this;
      }
    }, {
      key: "extractRotation",
      value: function extractRotation(m) {
        var te = this.elements;
        var me = m.elements;
        var scaleX = 1.0 / a$2.setFromMatrixColumn(m, 0).length();
        var scaleY = 1.0 / a$2.setFromMatrixColumn(m, 1).length();
        var scaleZ = 1.0 / a$2.setFromMatrixColumn(m, 2).length();
        te[0] = me[0] * scaleX;
        te[1] = me[1] * scaleX;
        te[2] = me[2] * scaleX;
        te[3] = 0;
        te[4] = me[4] * scaleY;
        te[5] = me[5] * scaleY;
        te[6] = me[6] * scaleY;
        te[7] = 0;
        te[8] = me[8] * scaleZ;
        te[9] = me[9] * scaleZ;
        te[10] = me[10] * scaleZ;
        te[11] = 0;
        te[12] = 0;
        te[13] = 0;
        te[14] = 0;
        te[15] = 1;
        return this;
      }
    }, {
      key: "makeRotationFromEuler",
      value: function makeRotationFromEuler(euler) {
        var te = this.elements;
        var x = euler.x;
        var y = euler.y;
        var z = euler.z;
        var a = Math.cos(x),
            b = Math.sin(x);
        var c = Math.cos(y),
            d = Math.sin(y);
        var e = Math.cos(z),
            f = Math.sin(z);
        var ae, af, be, bf;
        var ce, cf, de, df;
        var ac, ad, bc, bd;

        switch (euler.order) {
          case RotationOrder.XYZ:
            {
              ae = a * e, af = a * f, be = b * e, bf = b * f;
              te[0] = c * e;
              te[4] = -c * f;
              te[8] = d;
              te[1] = af + be * d;
              te[5] = ae - bf * d;
              te[9] = -b * c;
              te[2] = bf - ae * d;
              te[6] = be + af * d;
              te[10] = a * c;
              break;
            }

          case RotationOrder.YXZ:
            {
              ce = c * e, cf = c * f, de = d * e, df = d * f;
              te[0] = ce + df * b;
              te[4] = de * b - cf;
              te[8] = a * d;
              te[1] = a * f;
              te[5] = a * e;
              te[9] = -b;
              te[2] = cf * b - de;
              te[6] = df + ce * b;
              te[10] = a * c;
              break;
            }

          case RotationOrder.ZXY:
            {
              ce = c * e, cf = c * f, de = d * e, df = d * f;
              te[0] = ce - df * b;
              te[4] = -a * f;
              te[8] = de + cf * b;
              te[1] = cf + de * b;
              te[5] = a * e;
              te[9] = df - ce * b;
              te[2] = -a * d;
              te[6] = b;
              te[10] = a * c;
              break;
            }

          case RotationOrder.ZYX:
            {
              ae = a * e, af = a * f, be = b * e, bf = b * f;
              te[0] = c * e;
              te[4] = be * d - af;
              te[8] = ae * d + bf;
              te[1] = c * f;
              te[5] = bf * d + ae;
              te[9] = af * d - be;
              te[2] = -d;
              te[6] = b * c;
              te[10] = a * c;
              break;
            }

          case RotationOrder.YZX:
            {
              ac = a * c, ad = a * d, bc = b * c, bd = b * d;
              te[0] = c * e;
              te[4] = bd - ac * f;
              te[8] = bc * f + ad;
              te[1] = f;
              te[5] = a * e;
              te[9] = -b * e;
              te[2] = -d * e;
              te[6] = ad * f + bc;
              te[10] = ac - bd * f;
              break;
            }

          case RotationOrder.XZY:
            {
              ac = a * c, ad = a * d, bc = b * c, bd = b * d;
              te[0] = c * e;
              te[4] = -f;
              te[8] = d * e;
              te[1] = ac * f + bd;
              te[5] = a * e;
              te[9] = ad * f - bc;
              te[2] = bc * f - ad;
              te[6] = b * e;
              te[10] = bd * f + ac;
              break;
            }
        }

        te[3] = 0;
        te[7] = 0;
        te[11] = 0;
        te[12] = 0;
        te[13] = 0;
        te[14] = 0;
        te[15] = 1;
        return this;
      }
    }, {
      key: "makeRotationFromQuaternion",
      value: function makeRotationFromQuaternion(q) {
        return this.compose(a$2.set(0, 0, 0), q, b$2.set(1, 1, 1));
      }
    }, {
      key: "lookAt",
      value: function lookAt(eye, target, up) {
        var te = this.elements;
        var x = a$2,
            y = b$2,
            z = c;
        z.subVectors(eye, target);

        if (z.lengthSquared() === 0) {
          z.z = 1;
        }

        z.normalize();
        x.crossVectors(up, z);

        if (x.lengthSquared() === 0) {
          if (Math.abs(up.z) === 1) {
            z.x += 1e-4;
          } else {
            z.z += 1e-4;
          }

          z.normalize();
          x.crossVectors(up, z);
        }

        x.normalize();
        y.crossVectors(z, x);
        te[0] = x.x;
        te[4] = y.x;
        te[8] = z.x;
        te[1] = x.y;
        te[5] = y.y;
        te[9] = z.y;
        te[2] = x.z;
        te[6] = y.z;
        te[10] = z.z;
        return this;
      }
    }, {
      key: "multiplyMatrices",
      value: function multiplyMatrices(a, b) {
        var te = this.elements;
        var ae = a.elements;
        var be = b.elements;
        var a00 = ae[0],
            a01 = ae[4],
            a02 = ae[8],
            a03 = ae[12];
        var a10 = ae[1],
            a11 = ae[5],
            a12 = ae[9],
            a13 = ae[13];
        var a20 = ae[2],
            a21 = ae[6],
            a22 = ae[10],
            a23 = ae[14];
        var a30 = ae[3],
            a31 = ae[7],
            a32 = ae[11],
            a33 = ae[15];
        var b00 = be[0],
            b01 = be[4],
            b02 = be[8],
            b03 = be[12];
        var b10 = be[1],
            b11 = be[5],
            b12 = be[9],
            b13 = be[13];
        var b20 = be[2],
            b21 = be[6],
            b22 = be[10],
            b23 = be[14];
        var b30 = be[3],
            b31 = be[7],
            b32 = be[11],
            b33 = be[15];
        te[0] = a00 * b00 + a01 * b10 + a02 * b20 + a03 * b30;
        te[4] = a00 * b01 + a01 * b11 + a02 * b21 + a03 * b31;
        te[8] = a00 * b02 + a01 * b12 + a02 * b22 + a03 * b32;
        te[12] = a00 * b03 + a01 * b13 + a02 * b23 + a03 * b33;
        te[1] = a10 * b00 + a11 * b10 + a12 * b20 + a13 * b30;
        te[5] = a10 * b01 + a11 * b11 + a12 * b21 + a13 * b31;
        te[9] = a10 * b02 + a11 * b12 + a12 * b22 + a13 * b32;
        te[13] = a10 * b03 + a11 * b13 + a12 * b23 + a13 * b33;
        te[2] = a20 * b00 + a21 * b10 + a22 * b20 + a23 * b30;
        te[6] = a20 * b01 + a21 * b11 + a22 * b21 + a23 * b31;
        te[10] = a20 * b02 + a21 * b12 + a22 * b22 + a23 * b32;
        te[14] = a20 * b03 + a21 * b13 + a22 * b23 + a23 * b33;
        te[3] = a30 * b00 + a31 * b10 + a32 * b20 + a33 * b30;
        te[7] = a30 * b01 + a31 * b11 + a32 * b21 + a33 * b31;
        te[11] = a30 * b02 + a31 * b12 + a32 * b22 + a33 * b32;
        te[15] = a30 * b03 + a31 * b13 + a32 * b23 + a33 * b33;
        return this;
      }
    }, {
      key: "multiply",
      value: function multiply(m) {
        return this.multiplyMatrices(this, m);
      }
    }, {
      key: "premultiply",
      value: function premultiply(m) {
        return this.multiplyMatrices(m, this);
      }
    }, {
      key: "multiplyScalar",
      value: function multiplyScalar(s) {
        var te = this.elements;
        te[0] *= s;
        te[4] *= s;
        te[8] *= s;
        te[12] *= s;
        te[1] *= s;
        te[5] *= s;
        te[9] *= s;
        te[13] *= s;
        te[2] *= s;
        te[6] *= s;
        te[10] *= s;
        te[14] *= s;
        te[3] *= s;
        te[7] *= s;
        te[11] *= s;
        te[15] *= s;
        return this;
      }
    }, {
      key: "determinant",
      value: function determinant() {
        var te = this.elements;
        var n00 = te[0],
            n01 = te[4],
            n02 = te[8],
            n03 = te[12];
        var n10 = te[1],
            n11 = te[5],
            n12 = te[9],
            n13 = te[13];
        var n20 = te[2],
            n21 = te[6],
            n22 = te[10],
            n23 = te[14];
        var n30 = te[3],
            n31 = te[7],
            n32 = te[11],
            n33 = te[15];
        var n00n11 = n00 * n11,
            n00n12 = n00 * n12,
            n00n13 = n00 * n13;
        var n01n10 = n01 * n10,
            n01n12 = n01 * n12,
            n01n13 = n01 * n13;
        var n02n10 = n02 * n10,
            n02n11 = n02 * n11,
            n02n13 = n02 * n13;
        var n03n10 = n03 * n10,
            n03n11 = n03 * n11,
            n03n12 = n03 * n12;
        return n30 * (n03n12 * n21 - n02n13 * n21 - n03n11 * n22 + n01n13 * n22 + n02n11 * n23 - n01n12 * n23) + n31 * (n00n12 * n23 - n00n13 * n22 + n03n10 * n22 - n02n10 * n23 + n02n13 * n20 - n03n12 * n20) + n32 * (n00n13 * n21 - n00n11 * n23 - n03n10 * n21 + n01n10 * n23 + n03n11 * n20 - n01n13 * n20) + n33 * (-n02n11 * n20 - n00n12 * n21 + n00n11 * n22 + n02n10 * n21 - n01n10 * n22 + n01n12 * n20);
      }
    }, {
      key: "getInverse",
      value: function getInverse(matrix) {
        var te = this.elements;
        var me = matrix.elements;
        var n00 = me[0],
            n10 = me[1],
            n20 = me[2],
            n30 = me[3];
        var n01 = me[4],
            n11 = me[5],
            n21 = me[6],
            n31 = me[7];
        var n02 = me[8],
            n12 = me[9],
            n22 = me[10],
            n32 = me[11];
        var n03 = me[12],
            n13 = me[13],
            n23 = me[14],
            n33 = me[15];
        var t00 = n12 * n23 * n31 - n13 * n22 * n31 + n13 * n21 * n32 - n11 * n23 * n32 - n12 * n21 * n33 + n11 * n22 * n33;
        var t01 = n03 * n22 * n31 - n02 * n23 * n31 - n03 * n21 * n32 + n01 * n23 * n32 + n02 * n21 * n33 - n01 * n22 * n33;
        var t02 = n02 * n13 * n31 - n03 * n12 * n31 + n03 * n11 * n32 - n01 * n13 * n32 - n02 * n11 * n33 + n01 * n12 * n33;
        var t03 = n03 * n12 * n21 - n02 * n13 * n21 - n03 * n11 * n22 + n01 * n13 * n22 + n02 * n11 * n23 - n01 * n12 * n23;
        var det = n00 * t00 + n10 * t01 + n20 * t02 + n30 * t03;
        var invDet;

        if (det !== 0) {
          invDet = 1.0 / det;
          te[0] = t00 * invDet;
          te[1] = (n13 * n22 * n30 - n12 * n23 * n30 - n13 * n20 * n32 + n10 * n23 * n32 + n12 * n20 * n33 - n10 * n22 * n33) * invDet;
          te[2] = (n11 * n23 * n30 - n13 * n21 * n30 + n13 * n20 * n31 - n10 * n23 * n31 - n11 * n20 * n33 + n10 * n21 * n33) * invDet;
          te[3] = (n12 * n21 * n30 - n11 * n22 * n30 - n12 * n20 * n31 + n10 * n22 * n31 + n11 * n20 * n32 - n10 * n21 * n32) * invDet;
          te[4] = t01 * invDet;
          te[5] = (n02 * n23 * n30 - n03 * n22 * n30 + n03 * n20 * n32 - n00 * n23 * n32 - n02 * n20 * n33 + n00 * n22 * n33) * invDet;
          te[6] = (n03 * n21 * n30 - n01 * n23 * n30 - n03 * n20 * n31 + n00 * n23 * n31 + n01 * n20 * n33 - n00 * n21 * n33) * invDet;
          te[7] = (n01 * n22 * n30 - n02 * n21 * n30 + n02 * n20 * n31 - n00 * n22 * n31 - n01 * n20 * n32 + n00 * n21 * n32) * invDet;
          te[8] = t02 * invDet;
          te[9] = (n03 * n12 * n30 - n02 * n13 * n30 - n03 * n10 * n32 + n00 * n13 * n32 + n02 * n10 * n33 - n00 * n12 * n33) * invDet;
          te[10] = (n01 * n13 * n30 - n03 * n11 * n30 + n03 * n10 * n31 - n00 * n13 * n31 - n01 * n10 * n33 + n00 * n11 * n33) * invDet;
          te[11] = (n02 * n11 * n30 - n01 * n12 * n30 - n02 * n10 * n31 + n00 * n12 * n31 + n01 * n10 * n32 - n00 * n11 * n32) * invDet;
          te[12] = t03 * invDet;
          te[13] = (n02 * n13 * n20 - n03 * n12 * n20 + n03 * n10 * n22 - n00 * n13 * n22 - n02 * n10 * n23 + n00 * n12 * n23) * invDet;
          te[14] = (n03 * n11 * n20 - n01 * n13 * n20 - n03 * n10 * n21 + n00 * n13 * n21 + n01 * n10 * n23 - n00 * n11 * n23) * invDet;
          te[15] = (n01 * n12 * n20 - n02 * n11 * n20 + n02 * n10 * n21 - n00 * n12 * n21 - n01 * n10 * n22 + n00 * n11 * n22) * invDet;
        } else {
          console.error("Can't invert matrix, determinant is zero", matrix);
          this.identity();
        }

        return this;
      }
    }, {
      key: "transpose",
      value: function transpose() {
        var te = this.elements;
        var t;
        t = te[1];
        te[1] = te[4];
        te[4] = t;
        t = te[2];
        te[2] = te[8];
        te[8] = t;
        t = te[6];
        te[6] = te[9];
        te[9] = t;
        t = te[3];
        te[3] = te[12];
        te[12] = t;
        t = te[7];
        te[7] = te[13];
        te[13] = t;
        t = te[11];
        te[11] = te[14];
        te[14] = t;
        return this;
      }
    }, {
      key: "scale",
      value: function scale(sx, sy, sz) {
        var te = this.elements;
        te[0] *= sx;
        te[4] *= sy;
        te[8] *= sz;
        te[1] *= sx;
        te[5] *= sy;
        te[9] *= sz;
        te[2] *= sx;
        te[6] *= sy;
        te[10] *= sz;
        te[3] *= sx;
        te[7] *= sy;
        te[11] *= sz;
        return this;
      }
    }, {
      key: "makeScale",
      value: function makeScale(x, y, z) {
        this.set(x, 0, 0, 0, 0, y, 0, 0, 0, 0, z, 0, 0, 0, 0, 1);
        return this;
      }
    }, {
      key: "makeTranslation",
      value: function makeTranslation(x, y, z) {
        this.set(1, 0, 0, x, 0, 1, 0, y, 0, 0, 1, z, 0, 0, 0, 1);
        return this;
      }
    }, {
      key: "makeRotationX",
      value: function makeRotationX(theta) {
        var c = Math.cos(theta),
            s = Math.sin(theta);
        this.set(1, 0, 0, 0, 0, c, -s, 0, 0, s, c, 0, 0, 0, 0, 1);
        return this;
      }
    }, {
      key: "makeRotationY",
      value: function makeRotationY(theta) {
        var c = Math.cos(theta),
            s = Math.sin(theta);
        this.set(c, 0, s, 0, 0, 1, 0, 0, -s, 0, c, 0, 0, 0, 0, 1);
        return this;
      }
    }, {
      key: "makeRotationZ",
      value: function makeRotationZ(theta) {
        var c = Math.cos(theta),
            s = Math.sin(theta);
        this.set(c, -s, 0, 0, s, c, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
        return this;
      }
    }, {
      key: "makeRotationAxis",
      value: function makeRotationAxis(axis, angle) {
        var c = Math.cos(angle);
        var s = Math.sin(angle);
        var t = 1.0 - c;
        var x = axis.x,
            y = axis.y,
            z = axis.z;
        var tx = t * x,
            ty = t * y;
        this.set(tx * x + c, tx * y - s * z, tx * z + s * y, 0, tx * y + s * z, ty * y + c, ty * z - s * x, 0, tx * z - s * y, ty * z + s * x, t * z * z + c, 0, 0, 0, 0, 1);
        return this;
      }
    }, {
      key: "makeShear",
      value: function makeShear(x, y, z) {
        this.set(1, y, z, 0, x, 1, z, 0, x, y, 1, 0, 0, 0, 0, 1);
        return this;
      }
    }, {
      key: "compose",
      value: function compose(position, quaternion, scale) {
        var te = this.elements;
        var x = quaternion.x,
            y = quaternion.y,
            z = quaternion.z,
            w = quaternion.w;
        var x2 = x + x,
            y2 = y + y,
            z2 = z + z;
        var xx = x * x2,
            xy = x * y2,
            xz = x * z2;
        var yy = y * y2,
            yz = y * z2,
            zz = z * z2;
        var wx = w * x2,
            wy = w * y2,
            wz = w * z2;
        var sx = scale.x,
            sy = scale.y,
            sz = scale.z;
        te[0] = (1 - (yy + zz)) * sx;
        te[1] = (xy + wz) * sx;
        te[2] = (xz - wy) * sx;
        te[3] = 0;
        te[4] = (xy - wz) * sy;
        te[5] = (1 - (xx + zz)) * sy;
        te[6] = (yz + wx) * sy;
        te[7] = 0;
        te[8] = (xz + wy) * sz;
        te[9] = (yz - wx) * sz;
        te[10] = (1 - (xx + yy)) * sz;
        te[11] = 0;
        te[12] = position.x;
        te[13] = position.y;
        te[14] = position.z;
        te[15] = 1;
        return this;
      }
    }, {
      key: "decompose",
      value: function decompose(position, quaternion, scale) {
        var te = this.elements;
        var n00 = te[0],
            n10 = te[1],
            n20 = te[2];
        var n01 = te[4],
            n11 = te[5],
            n21 = te[6];
        var n02 = te[8],
            n12 = te[9],
            n22 = te[10];
        var det = this.determinant();
        var sx = a$2.set(n00, n10, n20).length() * (det < 0 ? -1 : 1);
        var sy = a$2.set(n01, n11, n21).length();
        var sz = a$2.set(n02, n12, n22).length();
        var invSX = 1.0 / sx;
        var invSY = 1.0 / sy;
        var invSZ = 1.0 / sz;
        position.x = te[12];
        position.y = te[13];
        position.z = te[14];
        te[0] *= invSX;
        te[1] *= invSX;
        te[2] *= invSX;
        te[4] *= invSY;
        te[5] *= invSY;
        te[6] *= invSY;
        te[8] *= invSZ;
        te[9] *= invSZ;
        te[10] *= invSZ;
        quaternion.setFromRotationMatrix(this);
        te[0] = n00;
        te[1] = n10;
        te[2] = n20;
        te[4] = n01;
        te[5] = n11;
        te[6] = n21;
        te[8] = n02;
        te[9] = n12;
        te[10] = n22;
        scale.x = sx;
        scale.y = sy;
        scale.z = sz;
        return this;
      }
    }, {
      key: "makePerspective",
      value: function makePerspective(left, right, top, bottom, near, far) {
        var te = this.elements;
        var x = 2 * near / (right - left);
        var y = 2 * near / (top - bottom);
        var a = (right + left) / (right - left);
        var b = (top + bottom) / (top - bottom);
        var c = -(far + near) / (far - near);
        var d = -2 * far * near / (far - near);
        te[0] = x;
        te[4] = 0;
        te[8] = a;
        te[12] = 0;
        te[1] = 0;
        te[5] = y;
        te[9] = b;
        te[13] = 0;
        te[2] = 0;
        te[6] = 0;
        te[10] = c;
        te[14] = d;
        te[3] = 0;
        te[7] = 0;
        te[11] = -1;
        te[15] = 0;
        return this;
      }
    }, {
      key: "makeOrthographic",
      value: function makeOrthographic(left, right, top, bottom, near, far) {
        var te = this.elements;
        var w = 1.0 / (right - left);
        var h = 1.0 / (top - bottom);
        var p = 1.0 / (far - near);
        var x = (right + left) * w;
        var y = (top + bottom) * h;
        var z = (far + near) * p;
        te[0] = 2 * w;
        te[4] = 0;
        te[8] = 0;
        te[12] = -x;
        te[1] = 0;
        te[5] = 2 * h;
        te[9] = 0;
        te[13] = -y;
        te[2] = 0;
        te[6] = 0;
        te[10] = -2 * p;
        te[14] = -z;
        te[3] = 0;
        te[7] = 0;
        te[11] = 0;
        te[15] = 1;
        return this;
      }
    }, {
      key: "equals",
      value: function equals(m) {
        var te = this.elements;
        var me = m.elements;
        var result = true;
        var i;

        for (i = 0; result && i < 16; ++i) {
          if (te[i] !== me[i]) {
            result = false;
          }
        }

        return result;
      }
    }]);

    return Matrix4;
  }();

  var Spherical = function () {
    function Spherical() {
      var radius = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
      var phi = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      var theta = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

      _classCallCheck(this, Spherical);

      this.radius = radius;
      this.phi = phi;
      this.theta = theta;
    }

    _createClass(Spherical, [{
      key: "set",
      value: function set(radius, phi, theta) {
        this.radius = radius;
        this.phi = phi;
        this.theta = theta;
        return this;
      }
    }, {
      key: "copy",
      value: function copy(s) {
        this.radius = s.radius;
        this.phi = s.phi;
        this.theta = s.theta;
        return this;
      }
    }, {
      key: "clone",
      value: function clone() {
        return new this.constructor().copy(this);
      }
    }, {
      key: "makeSafe",
      value: function makeSafe() {
        this.phi = Math.max(1e-6, Math.min(Math.PI - 1e-6, this.phi));
        return this;
      }
    }, {
      key: "setFromVector3",
      value: function setFromVector3(v) {
        return this.setFromCartesianCoords(v.x, v.y, v.z);
      }
    }, {
      key: "setFromCartesianCoords",
      value: function setFromCartesianCoords(x, y, z) {
        this.radius = Math.sqrt(x * x + y * y + z * z);

        if (this.radius === 0) {
          this.theta = 0;
          this.phi = 0;
        } else {
          this.theta = Math.atan2(x, z);
          this.phi = Math.acos(Math.min(Math.max(y / this.radius, -1), 1));
        }

        return this;
      }
    }]);

    return Spherical;
  }();

  var PointerButton = {
    MAIN: 0,
    AUXILIARY: 1,
    SECONDARY: 2
  };
  var TWO_PI = Math.PI * 2;
  var v$2 = new Vector3();
  var m$1 = new Matrix4();

  var RotationManager = function () {
    function RotationManager(position, quaternion, target, settings) {
      _classCallCheck(this, RotationManager);

      this.position = position;
      this.quaternion = quaternion;
      this.target = target;
      this.settings = settings;
      this.spherical = new Spherical();
    }

    _createClass(RotationManager, [{
      key: "setPosition",
      value: function setPosition(position) {
        this.position = position;
        return this;
      }
    }, {
      key: "setQuaternion",
      value: function setQuaternion(quaternion) {
        this.quaternion = quaternion;
        return this;
      }
    }, {
      key: "setTarget",
      value: function setTarget(target) {
        this.target = target;
        return this;
      }
    }, {
      key: "updateQuaternion",
      value: function updateQuaternion() {
        var settings = this.settings;
        var rotation = settings.rotation;

        if (settings.general.orbit) {
          m$1.lookAt(v$2.subVectors(this.position, this.target), rotation.pivotOffset, rotation.up);
        } else {
          m$1.lookAt(v$2.set(0, 0, 0), this.target.setFromSpherical(this.spherical), rotation.up);
        }

        this.quaternion.setFromRotationMatrix(m$1);
        return this;
      }
    }, {
      key: "adjustSpherical",
      value: function adjustSpherical(theta, phi) {
        var settings = this.settings;
        var orbit = settings.general.orbit;
        var rotation = settings.rotation;
        var s = this.spherical;
        s.theta = !rotation.invertX ? s.theta - theta : s.theta + theta;
        s.phi = (orbit || rotation.invertY) && !(orbit && rotation.invertY) ? s.phi - phi : s.phi + phi;
        s.theta = Math.min(Math.max(s.theta, rotation.minAzimuthalAngle), rotation.maxAzimuthalAngle);
        s.phi = Math.min(Math.max(s.phi, rotation.minPolarAngle), rotation.maxPolarAngle);
        s.theta %= TWO_PI;
        s.makeSafe();

        if (orbit) {
          this.position.setFromSpherical(s).add(this.target);
        }

        return this;
      }
    }, {
      key: "zoom",
      value: function zoom(sign) {
        var settings = this.settings;
        var general = settings.general;
        var sensitivity = settings.sensitivity;
        var zoom = settings.zoom;
        var s = this.spherical;
        var amount, min, max;

        if (general.orbit && zoom.enabled) {
          amount = sign * sensitivity.zoom;

          if (zoom.invert) {
            amount = -amount;
          }

          min = Math.max(zoom.minDistance, 1e-6);
          max = Math.min(zoom.maxDistance, Infinity);
          s.radius = Math.min(Math.max(s.radius + amount, min), max);
          this.position.setFromSpherical(s).add(this.target);
        }

        return this;
      }
    }, {
      key: "update",
      value: function update(delta) {}
    }, {
      key: "lookAt",
      value: function lookAt(point) {
        var spherical = this.spherical;
        var position = this.position;
        var target = this.target;
        target.copy(point);

        if (this.settings.general.orbit) {
          v$2.subVectors(position, target);
        } else {
          v$2.subVectors(target, position).normalize();
        }

        spherical.setFromVector3(v$2);
        spherical.radius = Math.max(spherical.radius, 1e-6);
        this.updateQuaternion();
        return this;
      }
    }, {
      key: "getViewDirection",
      value: function getViewDirection() {
        var view = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : new Vector3();
        view.setFromSpherical(this.spherical).normalize();

        if (this.settings.general.orbit) {
          view.negate();
        }

        return view;
      }
    }]);

    return RotationManager;
  }();

  var MovementState = function () {
    function MovementState() {
      _classCallCheck(this, MovementState);

      this.left = false;
      this.right = false;
      this.forward = false;
      this.backward = false;
      this.up = false;
      this.down = false;
    }

    _createClass(MovementState, [{
      key: "reset",
      value: function reset() {
        this.left = false;
        this.right = false;
        this.forward = false;
        this.backward = false;
        this.up = false;
        this.down = false;
        return this;
      }
    }]);

    return MovementState;
  }();

  var x = new Vector3(1, 0, 0);
  var y = new Vector3(0, 1, 0);
  var z = new Vector3(0, 0, 1);
  var v$3 = new Vector3();

  var TranslationManager = function () {
    function TranslationManager(position, quaternion, target, settings) {
      _classCallCheck(this, TranslationManager);

      this.position = position;
      this.quaternion = quaternion;
      this.target = target;
      this.settings = settings;
      this.movementState = new MovementState();
    }

    _createClass(TranslationManager, [{
      key: "setPosition",
      value: function setPosition(position) {
        this.position = position;
        return this;
      }
    }, {
      key: "setQuaternion",
      value: function setQuaternion(quaternion) {
        this.quaternion = quaternion;
        return this;
      }
    }, {
      key: "setTarget",
      value: function setTarget(target) {
        this.target = target;
        return this;
      }
    }, {
      key: "translateOnAxis",
      value: function translateOnAxis(axis, distance) {
        v$3.copy(axis).applyQuaternion(this.quaternion).multiplyScalar(distance);
        this.position.add(v$3);

        if (this.settings.general.orbit) {
          this.target.add(v$3);
        }
      }
    }, {
      key: "translate",
      value: function translate(delta) {
        var sensitivity = this.settings.sensitivity;
        var state = this.movementState;
        var step = delta * sensitivity.translation;

        if (state.backward) {
          this.translateOnAxis(z, step);
        } else if (state.forward) {
          this.translateOnAxis(z, -step);
        }

        if (state.right) {
          this.translateOnAxis(x, step);
        } else if (state.left) {
          this.translateOnAxis(x, -step);
        }

        if (state.up) {
          this.translateOnAxis(y, step);
        } else if (state.down) {
          this.translateOnAxis(y, -step);
        }
      }
    }, {
      key: "update",
      value: function update(delta) {
        if (this.settings.translation.enabled) {
          this.translate(delta);
        }
      }
    }, {
      key: "moveTo",
      value: function moveTo(position) {
        if (this.settings.general.orbit) {
          this.target.copy(position);
        } else {
          this.position.copy(position);
        }

        return this;
      }
    }]);

    return TranslationManager;
  }();

  var KeyCodeHandler = {
    get: function get(target, name) {
      return name in target ? target[name] : name.length === 1 ? name.toUpperCase().charCodeAt(0) : undefined;
    }
  };
  var KeyCode = new Proxy({
    BACKSPACE: 8,
    TAB: 9,
    ENTER: 13,
    SHIFT: 16,
    CTRL: 17,
    ALT: 18,
    PAUSE: 19,
    CAPS_LOCK: 20,
    ESCAPE: 27,
    SPACE: 32,
    PAGE_UP: 33,
    PAGE_DOWN: 34,
    END: 35,
    HOME: 36,
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
    INSERT: 45,
    DELETE: 46,
    META_LEFT: 91,
    META_RIGHT: 92,
    SELECT: 93,
    NUMPAD_0: 96,
    NUMPAD_1: 97,
    NUMPAD_2: 98,
    NUMPAD_3: 99,
    NUMPAD_4: 100,
    NUMPAD_5: 101,
    NUMPAD_6: 102,
    NUMPAD_7: 103,
    NUMPAD_8: 104,
    NUMPAD_9: 105,
    MULTIPLY: 106,
    ADD: 107,
    SUBTRACT: 109,
    DECIMAL_POINT: 110,
    DIVIDE: 111,
    F1: 112,
    F2: 113,
    F3: 114,
    F4: 115,
    F5: 116,
    F6: 117,
    F7: 118,
    F8: 119,
    F9: 120,
    F10: 121,
    F11: 122,
    F12: 123,
    NUM_LOCK: 144,
    SCROLL_LOCK: 145,
    SEMICOLON: 186,
    EQUAL_SIGN: 187,
    COMMA: 188,
    DASH: 189,
    PERIOD: 190,
    FORWARD_SLASH: 191,
    GRAVE_ACCENT: 192,
    OPEN_BRACKET: 219,
    BACK_SLASH: 220,
    CLOSE_BRACKET: 221,
    SINGLE_QUOTE: 222
  }, KeyCodeHandler);

  var GeneralSettings = function () {
    function GeneralSettings() {
      _classCallCheck(this, GeneralSettings);

      this.orbit = true;
    }

    _createClass(GeneralSettings, [{
      key: "copy",
      value: function copy(settings) {
        this.orbit = settings.orbit;
        return this;
      }
    }, {
      key: "clone",
      value: function clone() {
        return new this.constructor().copy(this);
      }
    }]);

    return GeneralSettings;
  }();

  var KeyBindings = function () {
    function KeyBindings() {
      _classCallCheck(this, KeyBindings);

      this.defaultActions = new Map();
      this.actions = new Map();
    }

    _createClass(KeyBindings, [{
      key: "reset",
      value: function reset() {
        this.actions = new Map(this.defaultActions);
        return this;
      }
    }, {
      key: "setDefault",
      value: function setDefault(actions) {
        this.defaultActions = actions;
        return this.reset();
      }
    }, {
      key: "copy",
      value: function copy(keyBindings) {
        this.defaultActions = new Map(keyBindings.defaultActions);
        this.actions = new Map(keyBindings.actions);
        return this;
      }
    }, {
      key: "clearDefault",
      value: function clearDefault() {
        this.defaultActions.clear();
        return this;
      }
    }, {
      key: "clear",
      value: function clear() {
        this.actions.clear();
        return this;
      }
    }, {
      key: "clone",
      value: function clone() {
        return new this.constructor().copy(this);
      }
    }, {
      key: "has",
      value: function has(keyCode) {
        return this.actions.has(keyCode);
      }
    }, {
      key: "get",
      value: function get(keyCode) {
        return this.actions.get(keyCode);
      }
    }, {
      key: "set",
      value: function set(keyCode, action) {
        this.actions.set(keyCode, action);
        return this;
      }
    }, {
      key: "delete",
      value: function _delete(keyCode) {
        return this.actions["delete"](keyCode);
      }
    }, {
      key: "toJSON",
      value: function toJSON() {
        return {
          defaultActions: _toConsumableArray(this.defaultActions),
          actions: _toConsumableArray(this.actions)
        };
      }
    }]);

    return KeyBindings;
  }();

  var PointerSettings = function () {
    function PointerSettings() {
      _classCallCheck(this, PointerSettings);

      this.hold = false;
      this.lock = true;
    }

    _createClass(PointerSettings, [{
      key: "copy",
      value: function copy(settings) {
        this.hold = settings.hold;
        this.lock = settings.lock;
        return this;
      }
    }, {
      key: "clone",
      value: function clone() {
        return new this.constructor().copy(this);
      }
    }]);

    return PointerSettings;
  }();

  var RotationSettings = function () {
    function RotationSettings() {
      _classCallCheck(this, RotationSettings);

      this.up = new Vector3();
      this.up.copy(y);
      this.pivotOffset = new Vector3();
      this.minAzimuthalAngle = -Infinity;
      this.maxAzimuthalAngle = Infinity;
      this.minPolarAngle = 0.0;
      this.maxPolarAngle = Math.PI;
      this.invertX = false;
      this.invertY = false;
    }

    _createClass(RotationSettings, [{
      key: "copy",
      value: function copy(settings) {
        this.up.copy(settings.up);
        this.pivotOffset.copy(settings.pivotOffset);
        this.minAzimuthalAngle = settings.minAzimuthalAngle !== null ? settings.minAzimuthalAngle : -Infinity;
        this.maxAzimuthalAngle = settings.maxAzimuthalAngle !== null ? settings.maxAzimuthalAngle : Infinity;
        this.minPolarAngle = settings.minPolarAngle;
        this.maxPolarAngle = settings.maxPolarAngle;
        this.invertX = settings.invertX;
        this.invertY = settings.invertY;
        return this;
      }
    }, {
      key: "clone",
      value: function clone() {
        return new this.constructor().copy(this);
      }
    }]);

    return RotationSettings;
  }();

  var SensitivitySettings = function () {
    function SensitivitySettings() {
      _classCallCheck(this, SensitivitySettings);

      this.rotation = 0.0025;
      this.translation = 1.0;
      this.zoom = 0.1;
    }

    _createClass(SensitivitySettings, [{
      key: "copy",
      value: function copy(settings) {
        this.rotation = settings.rotation;
        this.translation = settings.translation;
        this.zoom = settings.zoom;
        return this;
      }
    }, {
      key: "clone",
      value: function clone() {
        return new this.constructor().copy(this);
      }
    }]);

    return SensitivitySettings;
  }();

  var TranslationSettings = function () {
    function TranslationSettings() {
      _classCallCheck(this, TranslationSettings);

      this.enabled = true;
    }

    _createClass(TranslationSettings, [{
      key: "copy",
      value: function copy(settings) {
        this.enabled = settings.enabled;
        return this;
      }
    }, {
      key: "clone",
      value: function clone() {
        return new this.constructor().copy(this);
      }
    }]);

    return TranslationSettings;
  }();

  var ZoomSettings = function () {
    function ZoomSettings() {
      _classCallCheck(this, ZoomSettings);

      this.enabled = true;
      this.invert = false;
      this.minDistance = 1e-6;
      this.maxDistance = Infinity;
    }

    _createClass(ZoomSettings, [{
      key: "copy",
      value: function copy(settings) {
        this.enabled = settings.enabled;
        this.invert = settings.invert;
        this.minDistance = settings.minDistance;
        this.maxDistance = settings.maxDistance;
        return this;
      }
    }, {
      key: "clone",
      value: function clone() {
        return new this.constructor().copy(this);
      }
    }]);

    return ZoomSettings;
  }();

  var Settings = function () {
    function Settings() {
      _classCallCheck(this, Settings);

      this.general = new GeneralSettings();
      this.keyBindings = new KeyBindings();
      this.keyBindings.setDefault(new Map([[KeyCode.W, Action.MOVE_FORWARD], [KeyCode.UP, Action.MOVE_FORWARD], [KeyCode.A, Action.MOVE_LEFT], [KeyCode.LEFT, Action.MOVE_LEFT], [KeyCode.S, Action.MOVE_BACKWARD], [KeyCode.DOWN, Action.MOVE_BACKWARD], [KeyCode.D, Action.MOVE_RIGHT], [KeyCode.RIGHT, Action.MOVE_RIGHT], [KeyCode.X, Action.MOVE_DOWN], [KeyCode.SPACE, Action.MOVE_UP], [KeyCode.PAGE_DOWN, Action.ZOOM_OUT], [KeyCode.PAGE_UP, Action.ZOOM_IN]]));
      this.pointer = new PointerSettings();
      this.rotation = new RotationSettings();
      this.sensitivity = new SensitivitySettings();
      this.translation = new TranslationSettings();
      this.zoom = new ZoomSettings();
    }

    _createClass(Settings, [{
      key: "copy",
      value: function copy(settings) {
        this.general.copy(settings.general);
        this.keyBindings.copy(settings.keyBindings);
        this.pointer.copy(settings.pointer);
        this.rotation.copy(settings.rotation);
        this.sensitivity.copy(settings.sensitivity);
        this.translation.copy(settings.translation);
        this.zoom.copy(settings.zoom);
        return this;
      }
    }, {
      key: "clone",
      value: function clone() {
        return new this.constructor().copy(this);
      }
    }, {
      key: "toDataURL",
      value: function toDataURL() {
        return URL.createObjectURL(new Blob([JSON.stringify(this)], {
          type: "text/json"
        }));
      }
    }]);

    return Settings;
  }();

  var Strategy = function () {
    function Strategy() {
      _classCallCheck(this, Strategy);
    }

    _createClass(Strategy, [{
      key: "execute",
      value: function execute(flag) {
        throw new Error("Strategy#execute method not implemented!");
      }
    }]);

    return Strategy;
  }();

  var MovementStrategy = function (_Strategy) {
    _inherits(MovementStrategy, _Strategy);

    function MovementStrategy(movementState, direction) {
      var _this41;

      _classCallCheck(this, MovementStrategy);

      _this41 = _possibleConstructorReturn(this, _getPrototypeOf(MovementStrategy).call(this));
      _this41.movementState = movementState;
      _this41.direction = direction;
      return _this41;
    }

    _createClass(MovementStrategy, [{
      key: "execute",
      value: function execute(flag) {
        var state = this.movementState;

        switch (this.direction) {
          case Direction.FORWARD:
            state.forward = flag;
            break;

          case Direction.LEFT:
            state.left = flag;
            break;

          case Direction.BACKWARD:
            state.backward = flag;
            break;

          case Direction.RIGHT:
            state.right = flag;
            break;

          case Direction.DOWN:
            state.down = flag;
            break;

          case Direction.UP:
            state.up = flag;
            break;
        }
      }
    }]);

    return MovementStrategy;
  }(Strategy);

  var Direction = {
    FORWARD: 0,
    LEFT: 1,
    BACKWARD: 2,
    RIGHT: 3,
    DOWN: 4,
    UP: 5
  };

  var ZoomStrategy = function (_Strategy2) {
    _inherits(ZoomStrategy, _Strategy2);

    function ZoomStrategy(rotationManager, zoomIn) {
      var _this42;

      _classCallCheck(this, ZoomStrategy);

      _this42 = _possibleConstructorReturn(this, _getPrototypeOf(ZoomStrategy).call(this));
      _this42.rotationManager = rotationManager;
      _this42.zoomIn = zoomIn;
      return _this42;
    }

    _createClass(ZoomStrategy, [{
      key: "execute",
      value: function execute(flag) {
        if (flag) {
          this.rotationManager.zoom(this.zoomIn ? -1 : 1);
        }
      }
    }]);

    return ZoomStrategy;
  }(Strategy);

  var DeltaControls = function () {
    function DeltaControls() {
      var position = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      var quaternion = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      var dom = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : document.body;

      _classCallCheck(this, DeltaControls);

      this.dom = dom;
      this.position = position;
      this.quaternion = quaternion;
      this.target = new Vector3();
      this.settings = new Settings();
      this.rotationManager = new RotationManager(position, quaternion, this.target, this.settings);
      this.translationManager = new TranslationManager(position, quaternion, this.target, this.settings);

      this.strategies = function (rotationManager, translationManager) {
        var state = translationManager.movementState;
        return new Map([[Action.MOVE_FORWARD, new MovementStrategy(state, Direction.FORWARD)], [Action.MOVE_LEFT, new MovementStrategy(state, Direction.LEFT)], [Action.MOVE_BACKWARD, new MovementStrategy(state, Direction.BACKWARD)], [Action.MOVE_RIGHT, new MovementStrategy(state, Direction.RIGHT)], [Action.MOVE_DOWN, new MovementStrategy(state, Direction.DOWN)], [Action.MOVE_UP, new MovementStrategy(state, Direction.UP)], [Action.ZOOM_OUT, new ZoomStrategy(rotationManager, false)], [Action.ZOOM_IN, new ZoomStrategy(rotationManager, true)]]);
      }(this.rotationManager, this.translationManager);

      this.lastScreenPosition = new Vector2();
      this.dragging = false;
      this.enabled = false;

      if (position !== null && quaternion !== null) {
        this.lookAt(this.target);

        if (dom !== null) {
          this.setEnabled();
        }
      }
    }

    _createClass(DeltaControls, [{
      key: "getDom",
      value: function getDom() {
        return this.dom;
      }
    }, {
      key: "getPosition",
      value: function getPosition() {
        return this.position;
      }
    }, {
      key: "getQuaternion",
      value: function getQuaternion() {
        return this.quaternion;
      }
    }, {
      key: "getTarget",
      value: function getTarget() {
        var target = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : new Vector3();
        target.copy(this.target);

        if (!this.settings.general.orbit) {
          target.add(this.position);
        }

        return target;
      }
    }, {
      key: "getViewDirection",
      value: function getViewDirection() {
        var view = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : new Vector3();
        return this.rotationManager.getViewDirection(view);
      }
    }, {
      key: "setDom",
      value: function setDom(dom) {
        var enabled = this.enabled;

        if (dom !== null) {
          if (enabled) {
            this.setEnabled(false);
          }

          this.dom = dom;
          this.setEnabled(enabled);
        }

        return this;
      }
    }, {
      key: "setPosition",
      value: function setPosition(position) {
        this.position = position;
        this.rotationManager.setPosition(position);
        this.translationManager.setPosition(position);
        return this.lookAt(this.target);
      }
    }, {
      key: "setQuaternion",
      value: function setQuaternion(quaternion) {
        this.quaternion = quaternion;
        this.rotationManager.setQuaternion(quaternion);
        this.translationManager.setQuaternion(quaternion);
        return this.lookAt(this.target);
      }
    }, {
      key: "setTarget",
      value: function setTarget(target) {
        this.target = target;
        this.rotationManager.setTarget(target);
        this.translationManager.setTarget(target);
        return this.lookAt(this.target);
      }
    }, {
      key: "setOrbitEnabled",
      value: function setOrbitEnabled(orbit) {
        var general = this.settings.general;

        if (general.orbit !== orbit) {
          this.getTarget(this.target);
          general.orbit = orbit;
          this.lookAt(this.target);
        }

        return this;
      }
    }, {
      key: "copy",
      value: function copy(controls) {
        this.dom = controls.getDom();
        this.position = controls.getPosition();
        this.quaternion = controls.getQuaternion();
        this.target = controls.getTarget();
        this.settings.copy(controls.settings);
        this.rotationManager.setPosition(this.position).setQuaternion(this.quaternion).setTarget(this.target);
        this.translationManager.setPosition(this.position).setQuaternion(this.quaternion).setTarget(this.target);
        return this.lookAt(this.target);
      }
    }, {
      key: "clone",
      value: function clone() {
        return new this.constructor().copy(this);
      }
    }, {
      key: "handlePointerMoveEvent",
      value: function handlePointerMoveEvent(event) {
        var settings = this.settings;
        var pointer = settings.pointer;
        var sensitivity = settings.sensitivity;
        var rotationManager = this.rotationManager;
        var lastScreenPosition = this.lastScreenPosition;
        var movementX, movementY;

        if (document.pointerLockElement === this.dom) {
          if (!pointer.hold || this.dragging) {
            rotationManager.adjustSpherical(event.movementX * sensitivity.rotation, event.movementY * sensitivity.rotation).updateQuaternion();
          }
        } else {
          movementX = event.screenX - lastScreenPosition.x;
          movementY = event.screenY - lastScreenPosition.y;
          lastScreenPosition.set(event.screenX, event.screenY);
          rotationManager.adjustSpherical(movementX * sensitivity.rotation, movementY * sensitivity.rotation).updateQuaternion();
        }
      }
    }, {
      key: "handleTouchMoveEvent",
      value: function handleTouchMoveEvent(event) {
        var sensitivity = this.settings.sensitivity;
        var rotationManager = this.rotationManager;
        var lastScreenPosition = this.lastScreenPosition;
        var touch = event.touches[0];
        var movementX = touch.screenX - lastScreenPosition.x;
        var movementY = touch.screenY - lastScreenPosition.y;
        lastScreenPosition.set(touch.screenX, touch.screenY);
        event.preventDefault();
        rotationManager.adjustSpherical(movementX * sensitivity.rotation, movementY * sensitivity.rotation).updateQuaternion();
      }
    }, {
      key: "handleMainPointerButton",
      value: function handleMainPointerButton(event, pressed) {
        this.dragging = pressed;

        if (this.settings.pointer.lock) {
          this.setPointerLocked();
        } else {
          if (pressed) {
            this.lastScreenPosition.set(event.screenX, event.screenY);
            this.dom.addEventListener("mousemove", this);
          } else {
            this.dom.removeEventListener("mousemove", this);
          }
        }
      }
    }, {
      key: "handleAuxiliaryPointerButton",
      value: function handleAuxiliaryPointerButton(event, pressed) {}
    }, {
      key: "handleSecondaryPointerButton",
      value: function handleSecondaryPointerButton(event, pressed) {}
    }, {
      key: "handlePointerButtonEvent",
      value: function handlePointerButtonEvent(event, pressed) {
        event.preventDefault();

        switch (event.button) {
          case PointerButton.MAIN:
            this.handleMainPointerButton(event, pressed);
            break;

          case PointerButton.AUXILIARY:
            this.handleAuxiliaryPointerButton(event, pressed);
            break;

          case PointerButton.SECONDARY:
            this.handleSecondaryPointerButton(event, pressed);
            break;
        }
      }
    }, {
      key: "handleTouchEvent",
      value: function handleTouchEvent(event, start) {
        var touch = event.touches[0];
        event.preventDefault();

        if (start) {
          this.lastScreenPosition.set(touch.screenX, touch.screenY);
          this.dom.addEventListener("touchmove", this);
        } else {
          this.dom.removeEventListener("touchmove", this);
        }
      }
    }, {
      key: "handleKeyboardEvent",
      value: function handleKeyboardEvent(event, pressed) {
        var keyBindings = this.settings.keyBindings;

        if (keyBindings.has(event.keyCode)) {
          event.preventDefault();
          this.strategies.get(keyBindings.get(event.keyCode)).execute(pressed);
        }
      }
    }, {
      key: "handleWheelEvent",
      value: function handleWheelEvent(event) {
        this.rotationManager.zoom(Math.sign(event.deltaY));
      }
    }, {
      key: "handlePointerLockEvent",
      value: function handlePointerLockEvent() {
        if (document.pointerLockElement === this.dom) {
          this.dom.addEventListener("mousemove", this);
        } else {
          this.dom.removeEventListener("mousemove", this);
        }
      }
    }, {
      key: "handleEvent",
      value: function handleEvent(event) {
        switch (event.type) {
          case "mousemove":
            this.handlePointerMoveEvent(event);
            break;

          case "touchmove":
            this.handleTouchMoveEvent(event);
            break;

          case "mousedown":
            this.handlePointerButtonEvent(event, true);
            break;

          case "mouseup":
            this.handlePointerButtonEvent(event, false);
            break;

          case "touchstart":
            this.handleTouchEvent(event, true);
            break;

          case "touchend":
            this.handleTouchEvent(event, false);
            break;

          case "keydown":
            this.handleKeyboardEvent(event, true);
            break;

          case "keyup":
            this.handleKeyboardEvent(event, false);
            break;

          case "wheel":
            this.handleWheelEvent(event);
            break;

          case "pointerlockchange":
            this.handlePointerLockEvent();
            break;
        }
      }
    }, {
      key: "update",
      value: function update(delta) {
        this.rotationManager.update(delta);
        this.translationManager.update(delta);
      }
    }, {
      key: "moveTo",
      value: function moveTo(position) {
        this.rotationManager.moveTo(position);
        return this;
      }
    }, {
      key: "lookAt",
      value: function lookAt(point) {
        this.rotationManager.lookAt(point);
        return this;
      }
    }, {
      key: "setPointerLocked",
      value: function setPointerLocked() {
        var locked = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

        if (locked) {
          if (document.pointerLockElement !== this.dom && this.dom.requestPointerLock !== undefined) {
            this.dom.requestPointerLock();
          }
        } else if (document.exitPointerLock !== undefined) {
          document.exitPointerLock();
        }
      }
    }, {
      key: "setEnabled",
      value: function setEnabled() {
        var enabled = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
        var dom = this.dom;
        this.translationManager.movementState.reset();

        if (enabled && !this.enabled) {
          document.addEventListener("pointerlockchange", this);
          document.body.addEventListener("keyup", this);
          document.body.addEventListener("keydown", this);
          dom.addEventListener("mousedown", this);
          dom.addEventListener("mouseup", this);
          dom.addEventListener("touchstart", this);
          dom.addEventListener("touchend", this);
          dom.addEventListener("wheel", this);
        } else if (!enabled && this.enabled) {
          document.removeEventListener("pointerlockchange", this);
          document.body.removeEventListener("keyup", this);
          document.body.removeEventListener("keydown", this);
          dom.removeEventListener("mousedown", this);
          dom.removeEventListener("mouseup", this);
          dom.removeEventListener("touchstart", this);
          dom.removeEventListener("touchend", this);
          dom.removeEventListener("wheel", this);
          dom.removeEventListener("mousemove", this);
          dom.removeEventListener("touchmove", this);
        }

        this.setPointerLocked(false);
        this.enabled = enabled;
        return this;
      }
    }, {
      key: "dispose",
      value: function dispose() {
        this.setEnabled(false);
      }
    }]);

    return DeltaControls;
  }();

  var PostProcessingDemo = function (_Demo) {
    _inherits(PostProcessingDemo, _Demo);

    function PostProcessingDemo(id, composer) {
      var _this43;

      _classCallCheck(this, PostProcessingDemo);

      _this43 = _possibleConstructorReturn(this, _getPrototypeOf(PostProcessingDemo).call(this, id));
      _this43.composer = composer;
      _this43.renderPass = new RenderPass(_this43.scene, null);
      _this43.renderPass.renderToScreen = true;
      return _this43;
    }

    _createClass(PostProcessingDemo, [{
      key: "loadSMAAImages",
      value: function loadSMAAImages() {
        var assets = this.assets;
        var loadingManager = this.loadingManager;
        var searchImage = new Image();
        var areaImage = new Image();
        searchImage.addEventListener("load", function () {
          assets.set("smaa-search", this);
          loadingManager.itemEnd("smaa-search");
        });
        areaImage.addEventListener("load", function () {
          assets.set("smaa-area", this);
          loadingManager.itemEnd("smaa-area");
        });
        loadingManager.itemStart("smaa-search");
        loadingManager.itemStart("smaa-area");
        searchImage.src = SMAAEffect.searchImageDataURL;
        areaImage.src = SMAAEffect.areaImageDataURL;
      }
    }, {
      key: "render",
      value: function render(delta) {
        this.composer.render(delta);
      }
    }, {
      key: "reset",
      value: function reset() {
        _get(_getPrototypeOf(PostProcessingDemo.prototype), "reset", this).call(this);

        var renderPass = new RenderPass(this.scene, null);
        renderPass.enabled = this.renderPass.enabled;
        renderPass.renderToScreen = true;
        this.renderPass = renderPass;
        return this;
      }
    }]);

    return PostProcessingDemo;
  }(Demo);

  var BloomDemo = function (_PostProcessingDemo) {
    _inherits(BloomDemo, _PostProcessingDemo);

    function BloomDemo(composer) {
      var _this44;

      _classCallCheck(this, BloomDemo);

      _this44 = _possibleConstructorReturn(this, _getPrototypeOf(BloomDemo).call(this, "bloom", composer));
      _this44.effect = null;
      _this44.pass = null;
      _this44.object = null;
      return _this44;
    }

    _createClass(BloomDemo, [{
      key: "load",
      value: function load() {
        var _this45 = this;

        var assets = this.assets;
        var loadingManager = this.loadingManager;
        var cubeTextureLoader = new three.CubeTextureLoader(loadingManager);
        var path = "textures/skies/space2/";
        var format = ".jpg";
        var urls = [path + "px" + format, path + "nx" + format, path + "py" + format, path + "ny" + format, path + "pz" + format, path + "nz" + format];
        return new Promise(function (resolve, reject) {
          if (assets.size === 0) {
            loadingManager.onError = reject;

            loadingManager.onProgress = function (item, loaded, total) {
              if (loaded === total) {
                resolve();
              }
            };

            cubeTextureLoader.load(urls, function (textureCube) {
              assets.set("sky", textureCube);
            });

            _this45.loadSMAAImages();
          } else {
            resolve();
          }
        });
      }
    }, {
      key: "initialize",
      value: function initialize() {
        var scene = this.scene;
        var assets = this.assets;
        var composer = this.composer;
        var renderer = composer.renderer;
        var camera = new three.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.01, 2000);
        camera.position.set(-10, 6, 15);
        camera.lookAt(scene.position);
        this.camera = camera;
        var controls = new DeltaControls(camera.position, camera.quaternion, renderer.domElement);
        controls.settings.pointer.lock = false;
        controls.settings.translation.enabled = false;
        controls.settings.sensitivity.zoom = 1.0;
        controls.lookAt(scene.position);
        this.controls = controls;
        scene.fog = new three.FogExp2(0x000000, 0.0025);
        renderer.setClearColor(scene.fog.color);
        scene.background = assets.get("sky");
        var ambientLight = new three.AmbientLight(0x666666);
        var directionalLight = new three.DirectionalLight(0xffbbaa);
        directionalLight.position.set(-1, 1, 1);
        directionalLight.target.position.copy(scene.position);
        scene.add(directionalLight);
        scene.add(ambientLight);
        var object = new three.Object3D();
        var geometry = new three.SphereBufferGeometry(1, 4, 4);
        var material;
        var i, mesh;

        for (i = 0; i < 100; ++i) {
          material = new three.MeshPhongMaterial({
            color: 0xffffff * Math.random(),
            flatShading: true
          });
          mesh = new three.Mesh(geometry, material);
          mesh.position.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
          mesh.position.multiplyScalar(Math.random() * 4);
          mesh.rotation.set(Math.random() * 2, Math.random() * 2, Math.random() * 2);
          mesh.scale.multiplyScalar(Math.random() * 0.5);
          object.add(mesh);
        }

        this.object = object;
        scene.add(object);
        mesh = new three.Mesh(new three.BoxBufferGeometry(0.25, 8.25, 0.25), new three.MeshLambertMaterial({
          color: 0x0b0b0b
        }));
        object = new three.Object3D();
        var o0, o1, o2;
        o0 = object.clone();
        var clone = mesh.clone();
        clone.position.set(-4, 0, 4);
        o0.add(clone);
        clone = mesh.clone();
        clone.position.set(4, 0, 4);
        o0.add(clone);
        clone = mesh.clone();
        clone.position.set(-4, 0, -4);
        o0.add(clone);
        clone = mesh.clone();
        clone.position.set(4, 0, -4);
        o0.add(clone);
        o1 = o0.clone();
        o1.rotation.set(Math.PI / 2, 0, 0);
        o2 = o0.clone();
        o2.rotation.set(0, 0, Math.PI / 2);
        object.add(o0);
        object.add(o1);
        object.add(o2);
        scene.add(object);
        var smaaEffect = new SMAAEffect(assets.get("smaa-search"), assets.get("smaa-area"));
        smaaEffect.colorEdgesMaterial.setEdgeDetectionThreshold(0.05);
        var bloomEffect = new BloomEffect({
          blendFunction: BlendFunction.SCREEN,
          kernelSize: KernelSize.MEDIUM,
          useLuminanceFilter: true,
          luminanceThreshold: 0.825,
          luminanceSmoothing: 0.075,
          height: 480
        });
        bloomEffect.blendMode.opacity.value = 2.3;
        this.effect = bloomEffect;
        var pass = new EffectPass(camera, smaaEffect, bloomEffect);
        this.pass = pass;
        this.renderPass.renderToScreen = false;
        pass.renderToScreen = true;
        composer.addPass(pass);
      }
    }, {
      key: "render",
      value: function render(delta) {
        var object = this.object;
        var twoPI = 2.0 * Math.PI;
        object.rotation.x += 0.001;
        object.rotation.y += 0.005;

        if (object.rotation.x >= twoPI) {
          object.rotation.x -= twoPI;
        }

        if (object.rotation.y >= twoPI) {
          object.rotation.y -= twoPI;
        }

        _get(_getPrototypeOf(BloomDemo.prototype), "render", this).call(this, delta);
      }
    }, {
      key: "registerOptions",
      value: function registerOptions(menu) {
        var pass = this.pass;
        var effect = this.effect;
        var blendMode = effect.blendMode;
        var params = {
          "resolution": effect.height,
          "kernel size": effect.blurPass.kernelSize,
          "scale": effect.blurPass.scale,
          "luminance": {
            "threshold": effect.luminanceMaterial.threshold,
            "smoothing": effect.luminanceMaterial.smoothing
          },
          "opacity": blendMode.opacity.value,
          "blend mode": blendMode.blendFunction
        };
        menu.add(params, "resolution", [240, 360, 480, 720, 1080]).onChange(function () {
          effect.height = Number.parseInt(params.resolution);
        });
        menu.add(params, "kernel size", KernelSize).onChange(function () {
          effect.blurPass.kernelSize = Number.parseInt(params["kernel size"]);
        });
        menu.add(params, "scale").min(0.0).max(1.0).step(0.01).onChange(function () {
          effect.blurPass.scale = Number.parseFloat(params.scale);
        });
        var folder = menu.addFolder("Luminance");
        folder.add(params.luminance, "threshold").min(0.0).max(1.0).step(0.001).onChange(function () {
          effect.luminanceMaterial.threshold = Number.parseFloat(params.luminance.threshold);
        });
        folder.add(params.luminance, "smoothing").min(0.0).max(1.0).step(0.001).onChange(function () {
          effect.luminanceMaterial.smoothing = Number.parseFloat(params.luminance.smoothing);
        });
        folder.open();
        menu.add(params, "opacity").min(0.0).max(4.0).step(0.01).onChange(function () {
          blendMode.opacity.value = params.opacity;
        });
        menu.add(params, "blend mode", BlendFunction).onChange(function () {
          blendMode.blendFunction = Number.parseInt(params["blend mode"]);
          pass.recompile();
        });
        menu.add(effect, "dithering");
      }
    }]);

    return BloomDemo;
  }(PostProcessingDemo);

  var BlurDemo = function (_PostProcessingDemo2) {
    _inherits(BlurDemo, _PostProcessingDemo2);

    function BlurDemo(composer) {
      var _this46;

      _classCallCheck(this, BlurDemo);

      _this46 = _possibleConstructorReturn(this, _getPrototypeOf(BlurDemo).call(this, "blur", composer));
      _this46.blurPass = null;
      _this46.texturePass = null;
      _this46.effect = null;
      _this46.object = null;
      return _this46;
    }

    _createClass(BlurDemo, [{
      key: "load",
      value: function load() {
        var _this47 = this;

        var assets = this.assets;
        var loadingManager = this.loadingManager;
        var cubeTextureLoader = new three.CubeTextureLoader(loadingManager);
        var path = "textures/skies/sunset/";
        var format = ".png";
        var urls = [path + "px" + format, path + "nx" + format, path + "py" + format, path + "ny" + format, path + "pz" + format, path + "nz" + format];
        return new Promise(function (resolve, reject) {
          if (assets.size === 0) {
            loadingManager.onError = reject;

            loadingManager.onProgress = function (item, loaded, total) {
              if (loaded === total) {
                resolve();
              }
            };

            cubeTextureLoader.load(urls, function (textureCube) {
              assets.set("sky", textureCube);
            });

            _this47.loadSMAAImages();
          } else {
            resolve();
          }
        });
      }
    }, {
      key: "initialize",
      value: function initialize() {
        var scene = this.scene;
        var assets = this.assets;
        var composer = this.composer;
        var renderer = composer.renderer;
        var camera = new three.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 2000);
        camera.position.set(-15, 0, -15);
        camera.lookAt(scene.position);
        this.camera = camera;
        var controls = new DeltaControls(camera.position, camera.quaternion, renderer.domElement);
        controls.settings.pointer.lock = false;
        controls.settings.translation.enabled = false;
        controls.settings.sensitivity.zoom = 1.0;
        controls.lookAt(scene.position);
        this.controls = controls;
        scene.fog = new three.FogExp2(0x000000, 0.0025);
        renderer.setClearColor(scene.fog.color);
        scene.background = assets.get("sky");
        var ambientLight = new three.AmbientLight(0x666666);
        var directionalLight = new three.DirectionalLight(0xffbbaa);
        directionalLight.position.set(1440, 200, 2000);
        directionalLight.target.position.copy(scene.position);
        scene.add(directionalLight);
        scene.add(ambientLight);
        var object = new three.Object3D();
        var geometry = new three.SphereBufferGeometry(1, 4, 4);
        var material;
        var i, mesh;

        for (i = 0; i < 100; ++i) {
          material = new three.MeshPhongMaterial({
            color: 0xffffff * Math.random(),
            flatShading: true
          });
          mesh = new three.Mesh(geometry, material);
          mesh.position.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
          mesh.position.multiplyScalar(Math.random() * 10);
          mesh.rotation.set(Math.random() * 2, Math.random() * 2, Math.random() * 2);
          mesh.scale.multiplyScalar(Math.random());
          object.add(mesh);
        }

        this.object = object;
        scene.add(object);
        var savePass = new SavePass();
        var blurPass = new BlurPass({
          height: 480
        });
        var smaaEffect = new SMAAEffect(assets.get("smaa-search"), assets.get("smaa-area"));
        var textureEffect = new TextureEffect({
          texture: savePass.renderTarget.texture
        });
        var smaaPass = new EffectPass(camera, smaaEffect);
        var texturePass = new EffectPass(camera, textureEffect);
        textureEffect.blendMode.opacity.value = 0.0;
        this.renderPass.renderToScreen = false;
        texturePass.renderToScreen = true;
        this.blurPass = blurPass;
        this.texturePass = texturePass;
        this.effect = textureEffect;
        composer.addPass(smaaPass);
        composer.addPass(savePass);
        composer.addPass(blurPass);
        composer.addPass(texturePass);
      }
    }, {
      key: "render",
      value: function render(delta) {
        var object = this.object;
        var twoPI = 2.0 * Math.PI;
        object.rotation.x += 0.001;
        object.rotation.y += 0.005;

        if (object.rotation.x >= twoPI) {
          object.rotation.x -= twoPI;
        }

        if (object.rotation.y >= twoPI) {
          object.rotation.y -= twoPI;
        }

        _get(_getPrototypeOf(BlurDemo.prototype), "render", this).call(this, delta);
      }
    }, {
      key: "registerOptions",
      value: function registerOptions(menu) {
        var effect = this.effect;
        var pass = this.texturePass;
        var blurPass = this.blurPass;
        var blendMode = effect.blendMode;
        var params = {
          "enabled": blurPass.enabled,
          "resolution": blurPass.height,
          "kernel size": blurPass.kernelSize,
          "scale": blurPass.scale,
          "opacity": 1.0 - blendMode.opacity.value,
          "blend mode": blendMode.blendFunction
        };
        menu.add(params, "resolution", [240, 360, 480, 720, 1080]).onChange(function () {
          blurPass.height = Number.parseInt(params.resolution);
        });
        menu.add(params, "kernel size", KernelSize).onChange(function () {
          blurPass.kernelSize = Number.parseInt(params["kernel size"]);
        });
        menu.add(params, "scale").min(0.0).max(1.0).step(0.01).onChange(function () {
          blurPass.scale = Number.parseFloat(params.scale);
        });
        menu.add(blurPass, "dithering");
        menu.add(blurPass, "enabled");
        menu.add(params, "opacity").min(0.0).max(1.0).step(0.01).onChange(function () {
          blendMode.opacity.value = 1.0 - params.opacity;
        });
        menu.add(params, "blend mode", BlendFunction).onChange(function () {
          blendMode.blendFunction = Number.parseInt(params["blend mode"]);
          pass.recompile();
        });
      }
    }]);

    return BlurDemo;
  }(PostProcessingDemo);

  var BokehDemo = function (_PostProcessingDemo3) {
    _inherits(BokehDemo, _PostProcessingDemo3);

    function BokehDemo(composer) {
      var _this48;

      _classCallCheck(this, BokehDemo);

      _this48 = _possibleConstructorReturn(this, _getPrototypeOf(BokehDemo).call(this, "bokeh", composer));
      _this48.effect = null;
      _this48.bokehPass = null;
      _this48.depthPass = null;
      return _this48;
    }

    _createClass(BokehDemo, [{
      key: "load",
      value: function load() {
        var _this49 = this;

        var assets = this.assets;
        var loadingManager = this.loadingManager;
        var cubeTextureLoader = new three.CubeTextureLoader(loadingManager);
        var path = "textures/skies/space3/";
        var format = ".jpg";
        var urls = [path + "px" + format, path + "nx" + format, path + "py" + format, path + "ny" + format, path + "pz" + format, path + "nz" + format];
        return new Promise(function (resolve, reject) {
          if (assets.size === 0) {
            loadingManager.onError = reject;

            loadingManager.onProgress = function (item, loaded, total) {
              if (loaded === total) {
                resolve();
              }
            };

            cubeTextureLoader.load(urls, function (textureCube) {
              assets.set("sky", textureCube);
            });

            _this49.loadSMAAImages();
          } else {
            resolve();
          }
        });
      }
    }, {
      key: "initialize",
      value: function initialize() {
        var scene = this.scene;
        var assets = this.assets;
        var composer = this.composer;
        var renderer = composer.renderer;
        var camera = new three.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 50);
        camera.position.set(12.5, -0.3, 1.7);
        this.camera = camera;
        var controls = new DeltaControls(camera.position, camera.quaternion, renderer.domElement);
        controls.settings.pointer.lock = false;
        controls.settings.translation.enabled = false;
        controls.settings.sensitivity.rotation = 0.000425;
        controls.settings.sensitivity.zoom = 0.15;
        controls.settings.zoom.minDistance = 11.5;
        controls.settings.zoom.maxDistance = 40.0;
        controls.lookAt(scene.position);
        this.controls = controls;
        scene.fog = new three.FogExp2(0x000000, 0.0025);
        renderer.setClearColor(scene.fog.color);
        scene.background = assets.get("sky");
        var ambientLight = new three.AmbientLight(0x404040);
        var directionalLight = new three.DirectionalLight(0xffbbaa);
        directionalLight.position.set(-1, 1, 1);
        directionalLight.target.position.copy(scene.position);
        scene.add(directionalLight);
        scene.add(ambientLight);
        var geometry = new three.CylinderBufferGeometry(1, 1, 20, 6);
        var material = new three.MeshPhongMaterial({
          color: 0xffaaaa,
          flatShading: true,
          envMap: assets.get("sky")
        });
        var mesh = new three.Mesh(geometry, material);
        mesh.rotation.set(0, 0, Math.PI / 2);
        scene.add(mesh);
        var smaaEffect = new SMAAEffect(assets.get("smaa-search"), assets.get("smaa-area"));
        smaaEffect.colorEdgesMaterial.setEdgeDetectionThreshold(0.05);
        var bokehEffect = new BokehEffect({
          focus: 0.32,
          dof: 0.02,
          aperture: 0.015,
          maxBlur: 0.0125
        });
        var smaaPass = new EffectPass(camera, smaaEffect);
        var bokehPass = new EffectPass(camera, bokehEffect, new VignetteEffect());
        var depthPass = new EffectPass(camera, new DepthEffect());
        this.renderPass.renderToScreen = false;
        smaaPass.renderToScreen = true;
        depthPass.enabled = false;
        this.effect = bokehEffect;
        this.bokehPass = bokehPass;
        this.depthPass = depthPass;
        composer.addPass(bokehPass);
        composer.addPass(depthPass);
        composer.addPass(smaaPass);
      }
    }, {
      key: "registerOptions",
      value: function registerOptions(menu) {
        var bokehPass = this.bokehPass;
        var depthPass = this.depthPass;
        var effect = this.effect;
        var uniforms = effect.uniforms;
        var blendMode = effect.blendMode;
        var params = {
          "focus": uniforms.get("focus").value,
          "dof": uniforms.get("dof").value,
          "aperture": uniforms.get("aperture").value,
          "blur": uniforms.get("maxBlur").value,
          "show depth": depthPass.enabled,
          "opacity": blendMode.opacity.value,
          "blend mode": blendMode.blendFunction
        };
        menu.add(params, "focus").min(0.0).max(1.0).step(0.001).onChange(function () {
          uniforms.get("focus").value = params.focus;
        });
        menu.add(params, "dof").min(0.0).max(1.0).step(0.001).onChange(function () {
          uniforms.get("dof").value = params.dof;
        });
        menu.add(params, "aperture").min(0.0).max(0.05).step(0.0001).onChange(function () {
          uniforms.get("aperture").value = params.aperture;
        });
        menu.add(params, "blur").min(0.0).max(0.1).step(0.001).onChange(function () {
          uniforms.get("maxBlur").value = params.blur;
        });
        menu.add(params, "opacity").min(0.0).max(1.0).step(0.01).onChange(function () {
          blendMode.opacity.value = params.opacity;
        });
        menu.add(params, "blend mode", BlendFunction).onChange(function () {
          blendMode.blendFunction = Number.parseInt(params["blend mode"]);
          bokehPass.recompile();
        });
        menu.add(params, "show depth").onChange(function () {
          bokehPass.enabled = !params["show depth"];
          depthPass.enabled = params["show depth"];
        });
      }
    }]);

    return BokehDemo;
  }(PostProcessingDemo);

  var RealisticBokehDemo = function (_PostProcessingDemo4) {
    _inherits(RealisticBokehDemo, _PostProcessingDemo4);

    function RealisticBokehDemo(composer) {
      var _this50;

      _classCallCheck(this, RealisticBokehDemo);

      _this50 = _possibleConstructorReturn(this, _getPrototypeOf(RealisticBokehDemo).call(this, "realistic-bokeh", composer));
      _this50.effect = null;
      _this50.pass = null;
      return _this50;
    }

    _createClass(RealisticBokehDemo, [{
      key: "load",
      value: function load() {
        var _this51 = this;

        var assets = this.assets;
        var loadingManager = this.loadingManager;
        var cubeTextureLoader = new three.CubeTextureLoader(loadingManager);
        var path = "textures/skies/space3/";
        var format = ".jpg";
        var urls = [path + "px" + format, path + "nx" + format, path + "py" + format, path + "ny" + format, path + "pz" + format, path + "nz" + format];
        return new Promise(function (resolve, reject) {
          if (assets.size === 0) {
            loadingManager.onError = reject;

            loadingManager.onProgress = function (item, loaded, total) {
              if (loaded === total) {
                resolve();
              }
            };

            cubeTextureLoader.load(urls, function (textureCube) {
              assets.set("sky", textureCube);
            });

            _this51.loadSMAAImages();
          } else {
            resolve();
          }
        });
      }
    }, {
      key: "initialize",
      value: function initialize() {
        var scene = this.scene;
        var assets = this.assets;
        var composer = this.composer;
        var renderer = composer.renderer;
        var camera = new three.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 50);
        camera.position.set(12.5, -0.3, 1.7);
        this.camera = camera;
        var controls = new DeltaControls(camera.position, camera.quaternion, renderer.domElement);
        controls.settings.pointer.lock = false;
        controls.settings.translation.enabled = false;
        controls.settings.sensitivity.rotation = 0.000425;
        controls.settings.sensitivity.zoom = 0.15;
        controls.settings.zoom.minDistance = 11.5;
        controls.settings.zoom.maxDistance = 40.0;
        controls.lookAt(scene.position);
        this.controls = controls;
        scene.fog = new three.FogExp2(0x000000, 0.0025);
        renderer.setClearColor(scene.fog.color);
        scene.background = assets.get("sky");
        var ambientLight = new three.AmbientLight(0x404040);
        var directionalLight = new three.DirectionalLight(0xffbbaa);
        directionalLight.position.set(-1, 1, 1);
        directionalLight.target.position.copy(scene.position);
        scene.add(directionalLight);
        scene.add(ambientLight);
        var geometry = new three.CylinderBufferGeometry(1, 1, 20, 6);
        var material = new three.MeshPhongMaterial({
          color: 0xffaaaa,
          flatShading: true,
          envMap: assets.get("sky")
        });
        var mesh = new three.Mesh(geometry, material);
        mesh.rotation.set(0, 0, Math.PI / 2);
        scene.add(mesh);
        var smaaEffect = new SMAAEffect(assets.get("smaa-search"), assets.get("smaa-area"));
        smaaEffect.colorEdgesMaterial.setEdgeDetectionThreshold(0.05);
        var bokehEffect = new RealisticBokehEffect({
          focus: 1.55,
          focalLength: camera.getFocalLength(),
          luminanceThreshold: 0.325,
          luminanceGain: 2.0,
          bias: -0.35,
          fringe: 0.7,
          maxBlur: 2.5,
          rings: 5,
          samples: 5,
          showFocus: false,
          manualDoF: false,
          pentagon: true
        });
        var smaaPass = new EffectPass(camera, smaaEffect);
        var bokehPass = new EffectPass(camera, bokehEffect, new VignetteEffect());
        this.renderPass.renderToScreen = false;
        smaaPass.renderToScreen = true;
        this.effect = bokehEffect;
        this.pass = bokehPass;
        composer.addPass(bokehPass);
        composer.addPass(smaaPass);
      }
    }, {
      key: "registerOptions",
      value: function registerOptions(menu) {
        var pass = this.pass;
        var effect = this.effect;
        var uniforms = effect.uniforms;
        var blendMode = effect.blendMode;
        var params = {
          "focus": uniforms.get("focus").value,
          "focal length": uniforms.get("focalLength").value,
          "threshold": uniforms.get("luminanceThreshold").value,
          "gain": uniforms.get("luminanceGain").value,
          "bias": uniforms.get("bias").value,
          "fringe": uniforms.get("fringe").value,
          "max": uniforms.get("maxBlur").value,
          "near start": 0.2,
          "near dist": 1.0,
          "far start": 0.2,
          "far dist": 2.0,
          "opacity": blendMode.opacity.value,
          "blend mode": blendMode.blendFunction
        };
        menu.add(params, "focus").min(this.camera.near).max(20.0).step(0.01).onChange(function () {
          uniforms.get("focus").value = params.focus;
        });
        menu.add(params, "focal length").min(0.1).max(35.0).step(0.01).onChange(function () {
          uniforms.get("focalLength").value = params["focal length"];
        });
        menu.add(effect, "showFocus").onChange(function () {
          return pass.recompile();
        });
        var folder = menu.addFolder("Depth of Field");
        folder.add(effect, "manualDoF").onChange(function () {
          return pass.recompile();
        });
        folder.add(params, "near start").min(0.0).max(1.0).step(0.001).onChange(function () {
          if (uniforms.has("dof")) {
            uniforms.get("dof").value.x = params["near start"];
          }
        });
        folder.add(params, "near dist").min(0.0).max(2.0).step(0.001).onChange(function () {
          if (uniforms.has("dof")) {
            uniforms.get("dof").value.y = params["near dist"];
          }
        });
        folder.add(params, "far start").min(0.0).max(1.0).step(0.001).onChange(function () {
          if (uniforms.has("dof")) {
            uniforms.get("dof").value.z = params["far start"];
          }
        });
        folder.add(params, "far dist").min(0.0).max(3.0).step(0.001).onChange(function () {
          if (uniforms.has("dof")) {
            uniforms.get("dof").value.w = params["far dist"];
          }
        });
        folder = menu.addFolder("Blur");
        folder.add(params, "max").min(0.0).max(5.0).step(0.001).onChange(function () {
          uniforms.get("maxBlur").value = params.max;
        });
        folder.add(params, "bias").min(-1.0).max(1.0).step(0.001).onChange(function () {
          uniforms.get("bias").value = params.bias;
        });
        folder.add(params, "fringe").min(0.0).max(5.0).step(0.001).onChange(function () {
          uniforms.get("fringe").value = params.fringe;
        });
        folder.add(effect, "rings").min(1).max(8).step(1).onChange(function () {
          return pass.recompile();
        });
        folder.add(effect, "samples").min(1).max(8).step(1).onChange(function () {
          return pass.recompile();
        });
        folder.add(effect, "pentagon").onChange(function () {
          return pass.recompile();
        });
        folder = menu.addFolder("Luminance");
        folder.add(params, "threshold").min(0.0).max(1.0).step(0.01).onChange(function () {
          uniforms.get("luminanceThreshold").value = params.threshold;
        });
        folder.add(params, "gain").min(0.0).max(4.0).step(0.01).onChange(function () {
          uniforms.get("luminanceGain").value = params.gain;
        });
        menu.add(params, "opacity").min(0.0).max(1.0).step(0.01).onChange(function () {
          blendMode.opacity.value = params.opacity;
        });
        menu.add(params, "blend mode", BlendFunction).onChange(function () {
          blendMode.blendFunction = Number.parseInt(params["blend mode"]);
          pass.recompile();
        });
        menu.add(pass, "dithering");
      }
    }]);

    return RealisticBokehDemo;
  }(PostProcessingDemo);

  var ColorDepthDemo = function (_PostProcessingDemo5) {
    _inherits(ColorDepthDemo, _PostProcessingDemo5);

    function ColorDepthDemo(composer) {
      var _this52;

      _classCallCheck(this, ColorDepthDemo);

      _this52 = _possibleConstructorReturn(this, _getPrototypeOf(ColorDepthDemo).call(this, "color-depth", composer));
      _this52.effect = null;
      _this52.pass = null;
      return _this52;
    }

    _createClass(ColorDepthDemo, [{
      key: "load",
      value: function load() {
        var _this53 = this;

        var assets = this.assets;
        var loadingManager = this.loadingManager;
        var cubeTextureLoader = new three.CubeTextureLoader(loadingManager);
        var path = "textures/skies/space3/";
        var format = ".jpg";
        var urls = [path + "px" + format, path + "nx" + format, path + "py" + format, path + "ny" + format, path + "pz" + format, path + "nz" + format];
        return new Promise(function (resolve, reject) {
          if (assets.size === 0) {
            loadingManager.onError = reject;

            loadingManager.onProgress = function (item, loaded, total) {
              if (loaded === total) {
                resolve();
              }
            };

            cubeTextureLoader.load(urls, function (textureCube) {
              assets.set("sky", textureCube);
            });

            _this53.loadSMAAImages();
          } else {
            resolve();
          }
        });
      }
    }, {
      key: "initialize",
      value: function initialize() {
        var scene = this.scene;
        var assets = this.assets;
        var composer = this.composer;
        var renderer = composer.renderer;
        var camera = new three.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 2000);
        camera.position.set(10, 1, 10);
        camera.lookAt(scene.position);
        this.camera = camera;
        var controls = new DeltaControls(camera.position, camera.quaternion, renderer.domElement);
        controls.settings.pointer.lock = false;
        controls.settings.translation.enabled = false;
        controls.settings.sensitivity.zoom = 1.0;
        controls.lookAt(scene.position);
        this.controls = controls;
        scene.fog = new three.FogExp2(0x000000, 0.0025);
        renderer.setClearColor(scene.fog.color);
        scene.background = assets.get("sky");
        var smaaEffect = new SMAAEffect(assets.get("smaa-search"), assets.get("smaa-area"));
        var colorDepthEffect = new ColorDepthEffect({
          bits: 12
        });
        var pass = new EffectPass(camera, smaaEffect, colorDepthEffect);
        this.renderPass.renderToScreen = false;
        pass.renderToScreen = true;
        this.effect = colorDepthEffect;
        this.pass = pass;
        composer.addPass(pass);
      }
    }, {
      key: "registerOptions",
      value: function registerOptions(menu) {
        var pass = this.pass;
        var effect = this.effect;
        var blendMode = effect.blendMode;
        var params = {
          "bits": effect.getBitDepth(),
          "opacity": blendMode.opacity.value,
          "blend mode": blendMode.blendFunction
        };
        menu.add(params, "bits").min(1).max(24).step(1).onChange(function () {
          effect.setBitDepth(params.bits);
        });
        menu.add(params, "opacity").min(0.0).max(1.0).step(0.01).onChange(function () {
          blendMode.opacity.value = params.opacity;
        });
        menu.add(params, "blend mode", BlendFunction).onChange(function () {
          blendMode.blendFunction = Number.parseInt(params["blend mode"]);
          pass.recompile();
        });
      }
    }]);

    return ColorDepthDemo;
  }(PostProcessingDemo);

  var ColorGradingDemo = function (_PostProcessingDemo6) {
    _inherits(ColorGradingDemo, _PostProcessingDemo6);

    function ColorGradingDemo(composer) {
      var _this54;

      _classCallCheck(this, ColorGradingDemo);

      _this54 = _possibleConstructorReturn(this, _getPrototypeOf(ColorGradingDemo).call(this, "color-grading", composer));
      _this54.brightnessContrastEffect = null;
      _this54.colorAverageEffect = null;
      _this54.gammaCorrectionEffect = null;
      _this54.hueSaturationEffect = null;
      _this54.sepiaEffect = null;
      _this54.pass = null;
      return _this54;
    }

    _createClass(ColorGradingDemo, [{
      key: "load",
      value: function load() {
        var _this55 = this;

        var assets = this.assets;
        var loadingManager = this.loadingManager;
        var cubeTextureLoader = new three.CubeTextureLoader(loadingManager);
        var path = "textures/skies/sunset/";
        var format = ".png";
        var urls = [path + "px" + format, path + "nx" + format, path + "py" + format, path + "ny" + format, path + "pz" + format, path + "nz" + format];
        return new Promise(function (resolve, reject) {
          if (assets.size === 0) {
            loadingManager.onError = reject;

            loadingManager.onProgress = function (item, loaded, total) {
              if (loaded === total) {
                resolve();
              }
            };

            cubeTextureLoader.load(urls, function (textureCube) {
              assets.set("sky", textureCube);
            });

            _this55.loadSMAAImages();
          } else {
            resolve();
          }
        });
      }
    }, {
      key: "initialize",
      value: function initialize() {
        var scene = this.scene;
        var assets = this.assets;
        var composer = this.composer;
        var renderer = composer.renderer;
        var camera = new three.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 2000);
        camera.position.set(-0.75, -0.1, -1);
        camera.lookAt(scene.position);
        this.camera = camera;
        var controls = new DeltaControls(camera.position, camera.quaternion, renderer.domElement);
        controls.settings.pointer.lock = false;
        controls.settings.translation.enabled = false;
        controls.settings.sensitivity.zoom = 1.0;
        controls.lookAt(scene.position);
        this.controls = controls;
        scene.background = assets.get("sky");
        var smaaEffect = new SMAAEffect(assets.get("smaa-search"), assets.get("smaa-area"));
        var colorAverageEffect = new ColorAverageEffect(BlendFunction.SKIP);
        var sepiaEffect = new SepiaEffect({
          blendFunction: BlendFunction.SKIP
        });
        var brightnessContrastEffect = new BrightnessContrastEffect({
          contrast: 0.25
        });
        var gammaCorrectionEffect = new GammaCorrectionEffect({
          gamma: 0.65
        });
        var hueSaturationEffect = new HueSaturationEffect({
          saturation: -0.375
        });
        var pass = new EffectPass(camera, smaaEffect, colorAverageEffect, sepiaEffect, brightnessContrastEffect, gammaCorrectionEffect, hueSaturationEffect);
        this.renderPass.renderToScreen = false;
        pass.renderToScreen = true;
        pass.dithering = true;
        this.brightnessContrastEffect = brightnessContrastEffect;
        this.colorAverageEffect = colorAverageEffect;
        this.gammaCorrectionEffect = gammaCorrectionEffect;
        this.hueSaturationEffect = hueSaturationEffect;
        this.sepiaEffect = sepiaEffect;
        this.pass = pass;
        composer.addPass(pass);
      }
    }, {
      key: "registerOptions",
      value: function registerOptions(menu) {
        var pass = this.pass;
        var brightnessContrastEffect = this.brightnessContrastEffect;
        var colorAverageEffect = this.colorAverageEffect;
        var gammaCorrectionEffect = this.gammaCorrectionEffect;
        var hueSaturationEffect = this.hueSaturationEffect;
        var sepiaEffect = this.sepiaEffect;
        var params = {
          colorAverage: {
            "opacity": colorAverageEffect.blendMode.opacity.value,
            "blend mode": colorAverageEffect.blendMode.blendFunction
          },
          sepia: {
            "intensity": sepiaEffect.uniforms.get("intensity").value,
            "opacity": sepiaEffect.blendMode.opacity.value,
            "blend mode": sepiaEffect.blendMode.blendFunction
          },
          brightnessContrast: {
            "brightness": brightnessContrastEffect.uniforms.get("brightness").value,
            "contrast": brightnessContrastEffect.uniforms.get("contrast").value,
            "opacity": brightnessContrastEffect.blendMode.opacity.value,
            "blend mode": brightnessContrastEffect.blendMode.blendFunction
          },
          gammaCorrection: {
            "gamma": gammaCorrectionEffect.uniforms.get("gamma").value,
            "opacity": gammaCorrectionEffect.blendMode.opacity.value,
            "blend mode": gammaCorrectionEffect.blendMode.blendFunction
          },
          hueSaturation: {
            "hue": 0.0,
            "saturation": hueSaturationEffect.uniforms.get("saturation").value,
            "opacity": hueSaturationEffect.blendMode.opacity.value,
            "blend mode": hueSaturationEffect.blendMode.blendFunction
          }
        };
        var folder = menu.addFolder("Color Average");
        folder.add(params.colorAverage, "opacity").min(0.0).max(1.0).step(0.01).onChange(function () {
          colorAverageEffect.blendMode.opacity.value = params.colorAverage.opacity;
        });
        folder.add(params.colorAverage, "blend mode", BlendFunction).onChange(function () {
          colorAverageEffect.blendMode.blendFunction = Number.parseInt(params.colorAverage["blend mode"]);
          pass.recompile();
        });
        folder = menu.addFolder("Sepia");
        folder.add(params.sepia, "intensity").min(0.0).max(4.0).step(0.001).onChange(function () {
          sepiaEffect.uniforms.get("intensity").value = params.sepia.intensity;
        });
        folder.add(params.sepia, "opacity").min(0.0).max(1.0).step(0.01).onChange(function () {
          sepiaEffect.blendMode.opacity.value = params.sepia.opacity;
        });
        folder.add(params.sepia, "blend mode", BlendFunction).onChange(function () {
          sepiaEffect.blendMode.blendFunction = Number.parseInt(params.sepia["blend mode"]);
          pass.recompile();
        });
        folder = menu.addFolder("Brightness & Contrast");
        folder.add(params.brightnessContrast, "brightness").min(-1.0).max(1.0).step(0.001).onChange(function () {
          brightnessContrastEffect.uniforms.get("brightness").value = params.brightnessContrast.brightness;
        });
        folder.add(params.brightnessContrast, "contrast").min(-1.0).max(1.0).step(0.001).onChange(function () {
          brightnessContrastEffect.uniforms.get("contrast").value = params.brightnessContrast.contrast;
        });
        folder.add(params.brightnessContrast, "opacity").min(0.0).max(1.0).step(0.01).onChange(function () {
          brightnessContrastEffect.blendMode.opacity.value = params.brightnessContrast.opacity;
        });
        folder.add(params.brightnessContrast, "blend mode", BlendFunction).onChange(function () {
          brightnessContrastEffect.blendMode.blendFunction = Number.parseInt(params.brightnessContrast["blend mode"]);
          pass.recompile();
        });
        folder.open();
        folder = menu.addFolder("Gamma Correction");
        folder.add(params.gammaCorrection, "gamma").min(0.01).max(1.5).step(0.001).onChange(function () {
          gammaCorrectionEffect.uniforms.get("gamma").value = params.gammaCorrection.gamma;
        });
        folder.add(params.gammaCorrection, "opacity").min(0.0).max(1.0).step(0.01).onChange(function () {
          gammaCorrectionEffect.blendMode.opacity.value = params.gammaCorrection.opacity;
        });
        folder.add(params.gammaCorrection, "blend mode", BlendFunction).onChange(function () {
          gammaCorrectionEffect.blendMode.blendFunction = Number.parseInt(params.gammaCorrection["blend mode"]);
          pass.recompile();
        });
        folder.open();
        folder = menu.addFolder("Hue & Saturation");
        folder.add(params.hueSaturation, "hue").min(-Math.PI).max(Math.PI).step(0.001).onChange(function () {
          hueSaturationEffect.setHue(params.hueSaturation.hue);
        });
        folder.add(params.hueSaturation, "saturation").min(-1.0).max(1.0).step(0.001).onChange(function () {
          hueSaturationEffect.uniforms.get("saturation").value = params.hueSaturation.saturation;
        });
        folder.add(params.hueSaturation, "opacity").min(0.0).max(1.0).step(0.01).onChange(function () {
          hueSaturationEffect.blendMode.opacity.value = params.hueSaturation.opacity;
        });
        folder.add(params.hueSaturation, "blend mode", BlendFunction).onChange(function () {
          hueSaturationEffect.blendMode.blendFunction = Number.parseInt(params.hueSaturation["blend mode"]);
          pass.recompile();
        });
        folder.open();
        menu.add(pass, "dithering");
      }
    }]);

    return ColorGradingDemo;
  }(PostProcessingDemo);

  var GlitchDemo = function (_PostProcessingDemo7) {
    _inherits(GlitchDemo, _PostProcessingDemo7);

    function GlitchDemo(composer) {
      var _this56;

      _classCallCheck(this, GlitchDemo);

      _this56 = _possibleConstructorReturn(this, _getPrototypeOf(GlitchDemo).call(this, "glitch", composer));
      _this56.effect = null;
      _this56.pass = null;
      _this56.object = null;
      return _this56;
    }

    _createClass(GlitchDemo, [{
      key: "load",
      value: function load() {
        var _this57 = this;

        var assets = this.assets;
        var loadingManager = this.loadingManager;
        var textureLoader = new three.TextureLoader(loadingManager);
        var cubeTextureLoader = new three.CubeTextureLoader(loadingManager);
        var path = "textures/skies/space4/";
        var format = ".jpg";
        var urls = [path + "px" + format, path + "nx" + format, path + "py" + format, path + "ny" + format, path + "pz" + format, path + "nz" + format];
        return new Promise(function (resolve, reject) {
          if (assets.size === 0) {
            loadingManager.onError = reject;

            loadingManager.onProgress = function (item, loaded, total) {
              if (loaded === total) {
                resolve();
              }
            };

            cubeTextureLoader.load(urls, function (textureCube) {
              assets.set("sky", textureCube);
            });
            textureLoader.load("textures/perturb.jpg", function (texture) {
              assets.set("perturbation-map", texture);
            });

            _this57.loadSMAAImages();
          } else {
            resolve();
          }
        });
      }
    }, {
      key: "initialize",
      value: function initialize() {
        var scene = this.scene;
        var assets = this.assets;
        var composer = this.composer;
        var renderer = composer.renderer;
        var camera = new three.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 2000);
        camera.position.set(6, 1, 6);
        camera.lookAt(scene.position);
        this.camera = camera;
        var controls = new DeltaControls(camera.position, camera.quaternion, renderer.domElement);
        controls.settings.pointer.lock = false;
        controls.settings.translation.enabled = false;
        controls.settings.sensitivity.zoom = 1.0;
        controls.lookAt(scene.position);
        this.controls = controls;
        scene.fog = new three.FogExp2(0x000000, 0.0025);
        renderer.setClearColor(scene.fog.color);
        scene.background = assets.get("sky");
        var ambientLight = new three.AmbientLight(0x666666);
        var directionalLight = new three.DirectionalLight(0xffbbaa);
        directionalLight.position.set(-1, 1, 1);
        directionalLight.target.position.copy(scene.position);
        scene.add(directionalLight);
        scene.add(ambientLight);
        var object = new three.Object3D();
        var geometry = new three.SphereBufferGeometry(1, 4, 4);
        var material, mesh;
        var i;

        for (i = 0; i < 100; ++i) {
          material = new three.MeshPhongMaterial({
            color: 0xffffff * Math.random(),
            flatShading: true
          });
          mesh = new three.Mesh(geometry, material);
          mesh.position.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
          mesh.position.multiplyScalar(Math.random() * 10);
          mesh.rotation.set(Math.random() * 2, Math.random() * 2, Math.random() * 2);
          mesh.scale.multiplyScalar(Math.random());
          object.add(mesh);
        }

        this.object = object;
        scene.add(object);
        var smaaEffect = new SMAAEffect(assets.get("smaa-search"), assets.get("smaa-area"));
        smaaEffect.setEdgeDetectionThreshold(0.08);
        var chromaticAberrationEffect = new ChromaticAberrationEffect();
        var glitchEffect = new GlitchEffect({
          perturbationMap: assets.get("perturbation-map"),
          chromaticAberrationOffset: chromaticAberrationEffect.offset
        });
        var noiseEffect = new NoiseEffect({
          blendFunction: BlendFunction.COLOR_DODGE
        });
        noiseEffect.blendMode.opacity.value = 0.15;
        var smaaPass = new EffectPass(camera, smaaEffect);
        var glitchPass = new EffectPass(camera, glitchEffect, noiseEffect);
        var chromaticAberrationPass = new EffectPass(camera, chromaticAberrationEffect);
        this.renderPass.renderToScreen = false;
        chromaticAberrationPass.renderToScreen = true;
        this.effect = glitchEffect;
        composer.addPass(smaaPass);
        composer.addPass(glitchPass);
        composer.addPass(chromaticAberrationPass);
      }
    }, {
      key: "render",
      value: function render(delta) {
        var object = this.object;
        var twoPI = 2.0 * Math.PI;
        object.rotation.x += 0.001;
        object.rotation.y += 0.005;

        if (object.rotation.x >= twoPI) {
          object.rotation.x -= twoPI;
        }

        if (object.rotation.y >= twoPI) {
          object.rotation.y -= twoPI;
        }

        _get(_getPrototypeOf(GlitchDemo.prototype), "render", this).call(this, delta);
      }
    }, {
      key: "registerOptions",
      value: function registerOptions(menu) {
        var effect = this.effect;
        var perturbationMap = effect.getPerturbationMap();
        var uniforms = effect.uniforms;
        var delay = effect.delay;
        var duration = effect.duration;
        var strength = effect.strength;
        var params = {
          "glitch mode": effect.mode,
          "custom pattern": true,
          "min delay": delay.x,
          "max delay": delay.y,
          "min duration": duration.x,
          "max duration": duration.y,
          "weak glitches": strength.x,
          "strong glitches": strength.y,
          "glitch ratio": effect.ratio,
          "columns": uniforms.get("columns").value
        };
        menu.add(params, "glitch mode", GlitchMode).onChange(function () {
          effect.mode = Number.parseInt(params["glitch mode"]);
        });
        menu.add(params, "custom pattern").onChange(function () {
          if (params["custom pattern"]) {
            effect.setPerturbationMap(perturbationMap);
          } else {
            effect.setPerturbationMap(effect.generatePerturbationMap(64));
          }
        });
        menu.add(params, "min delay").min(0.0).max(2.0).step(0.001).onChange(function () {
          delay.x = params["min delay"];
        });
        menu.add(params, "max delay").min(2.0).max(4.0).step(0.001).onChange(function () {
          delay.y = params["max delay"];
        });
        menu.add(params, "min duration").min(0.0).max(0.6).step(0.001).onChange(function () {
          duration.x = params["min duration"];
        });
        menu.add(params, "max duration").min(0.6).max(1.8).step(0.001).onChange(function () {
          duration.y = params["max duration"];
        });
        menu.add(params, "weak glitches").min(0.0).max(1.0).step(0.001).onChange(function () {
          strength.x = params["weak glitches"];
        });
        menu.add(params, "strong glitches").min(0.0).max(1.0).step(0.001).onChange(function () {
          strength.y = params["strong glitches"];
        });
        menu.add(params, "glitch ratio").min(0.0).max(1.0).step(0.001).onChange(function () {
          effect.ratio = Number.parseFloat(params["glitch ratio"]);
        });
        menu.add(params, "columns").min(0.0).max(0.5).step(0.001).onChange(function () {
          uniforms.get("columns").value = params.columns;
        });
      }
    }]);

    return GlitchDemo;
  }(PostProcessingDemo);

  var _GLTFLoader = function () {
    function GLTFLoader(manager) {
      this.manager = manager !== undefined ? manager : three__default.DefaultLoadingManager;
      this.dracoLoader = null;
      this.ddsLoader = null;
    }

    GLTFLoader.prototype = {
      constructor: GLTFLoader,
      crossOrigin: 'anonymous',
      load: function load(url, onLoad, onProgress, onError) {
        var scope = this;
        var resourcePath;

        if (this.resourcePath !== undefined) {
          resourcePath = this.resourcePath;
        } else if (this.path !== undefined) {
          resourcePath = this.path;
        } else {
          resourcePath = three__default.LoaderUtils.extractUrlBase(url);
        }

        scope.manager.itemStart(url);

        var _onError = function _onError(e) {
          if (onError) {
            onError(e);
          } else {
            console.error(e);
          }

          scope.manager.itemError(url);
          scope.manager.itemEnd(url);
        };

        var loader = new three__default.FileLoader(scope.manager);
        loader.setPath(this.path);
        loader.setResponseType('arraybuffer');

        if (scope.crossOrigin === 'use-credentials') {
          loader.setWithCredentials(true);
        }

        loader.load(url, function (data) {
          try {
            scope.parse(data, resourcePath, function (gltf) {
              onLoad(gltf);
              scope.manager.itemEnd(url);
            }, _onError);
          } catch (e) {
            _onError(e);
          }
        }, onProgress, _onError);
      },
      setCrossOrigin: function setCrossOrigin(value) {
        this.crossOrigin = value;
        return this;
      },
      setPath: function setPath(value) {
        this.path = value;
        return this;
      },
      setResourcePath: function setResourcePath(value) {
        this.resourcePath = value;
        return this;
      },
      setDRACOLoader: function setDRACOLoader(dracoLoader) {
        this.dracoLoader = dracoLoader;
        return this;
      },
      setDDSLoader: function setDDSLoader(ddsLoader) {
        this.ddsLoader = ddsLoader;
        return this;
      },
      parse: function parse(data, path, onLoad, onError) {
        var content;
        var extensions = {};

        if (typeof data === 'string') {
          content = data;
        } else {
          var magic = three__default.LoaderUtils.decodeText(new Uint8Array(data, 0, 4));

          if (magic === BINARY_EXTENSION_HEADER_MAGIC) {
            try {
              extensions[EXTENSIONS.KHR_BINARY_GLTF] = new GLTFBinaryExtension(data);
            } catch (error) {
              if (onError) onError(error);
              return;
            }

            content = extensions[EXTENSIONS.KHR_BINARY_GLTF].content;
          } else {
            content = three__default.LoaderUtils.decodeText(new Uint8Array(data));
          }
        }

        var json = JSON.parse(content);

        if (json.asset === undefined || json.asset.version[0] < 2) {
          if (onError) onError(new Error('THREE.GLTFLoader: Unsupported asset. glTF versions >=2.0 are supported. Use LegacyGLTFLoader instead.'));
          return;
        }

        if (json.extensionsUsed) {
          for (var i = 0; i < json.extensionsUsed.length; ++i) {
            var extensionName = json.extensionsUsed[i];
            var extensionsRequired = json.extensionsRequired || [];

            switch (extensionName) {
              case EXTENSIONS.KHR_LIGHTS_PUNCTUAL:
                extensions[extensionName] = new GLTFLightsExtension(json);
                break;

              case EXTENSIONS.KHR_MATERIALS_UNLIT:
                extensions[extensionName] = new GLTFMaterialsUnlitExtension();
                break;

              case EXTENSIONS.KHR_MATERIALS_PBR_SPECULAR_GLOSSINESS:
                extensions[extensionName] = new GLTFMaterialsPbrSpecularGlossinessExtension();
                break;

              case EXTENSIONS.KHR_DRACO_MESH_COMPRESSION:
                extensions[extensionName] = new GLTFDracoMeshCompressionExtension(json, this.dracoLoader);
                break;

              case EXTENSIONS.MSFT_TEXTURE_DDS:
                extensions[EXTENSIONS.MSFT_TEXTURE_DDS] = new GLTFTextureDDSExtension(this.ddsLoader);
                break;

              case EXTENSIONS.KHR_TEXTURE_TRANSFORM:
                extensions[EXTENSIONS.KHR_TEXTURE_TRANSFORM] = new GLTFTextureTransformExtension();
                break;

              default:
                if (extensionsRequired.indexOf(extensionName) >= 0) {
                  console.warn('THREE.GLTFLoader: Unknown extension "' + extensionName + '".');
                }

            }
          }
        }

        var parser = new GLTFParser(json, extensions, {
          path: path || this.resourcePath || '',
          crossOrigin: this.crossOrigin,
          manager: this.manager
        });
        parser.parse(onLoad, onError);
      }
    };

    function GLTFRegistry() {
      var objects = {};
      return {
        get: function get(key) {
          return objects[key];
        },
        add: function add(key, object) {
          objects[key] = object;
        },
        remove: function remove(key) {
          delete objects[key];
        },
        removeAll: function removeAll() {
          objects = {};
        }
      };
    }

    var EXTENSIONS = {
      KHR_BINARY_GLTF: 'KHR_binary_glTF',
      KHR_DRACO_MESH_COMPRESSION: 'KHR_draco_mesh_compression',
      KHR_LIGHTS_PUNCTUAL: 'KHR_lights_punctual',
      KHR_MATERIALS_PBR_SPECULAR_GLOSSINESS: 'KHR_materials_pbrSpecularGlossiness',
      KHR_MATERIALS_UNLIT: 'KHR_materials_unlit',
      KHR_TEXTURE_TRANSFORM: 'KHR_texture_transform',
      MSFT_TEXTURE_DDS: 'MSFT_texture_dds'
    };

    function GLTFTextureDDSExtension(ddsLoader) {
      if (!ddsLoader) {
        throw new Error('THREE.GLTFLoader: Attempting to load .dds texture without importing THREE.DDSLoader');
      }

      this.name = EXTENSIONS.MSFT_TEXTURE_DDS;
      this.ddsLoader = ddsLoader;
    }

    function GLTFLightsExtension(json) {
      this.name = EXTENSIONS.KHR_LIGHTS_PUNCTUAL;
      var extension = json.extensions && json.extensions[EXTENSIONS.KHR_LIGHTS_PUNCTUAL] || {};
      this.lightDefs = extension.lights || [];
    }

    GLTFLightsExtension.prototype.loadLight = function (lightIndex) {
      var lightDef = this.lightDefs[lightIndex];
      var lightNode;
      var color = new three__default.Color(0xffffff);
      if (lightDef.color !== undefined) color.fromArray(lightDef.color);
      var range = lightDef.range !== undefined ? lightDef.range : 0;

      switch (lightDef.type) {
        case 'directional':
          lightNode = new three__default.DirectionalLight(color);
          lightNode.target.position.set(0, 0, -1);
          lightNode.add(lightNode.target);
          break;

        case 'point':
          lightNode = new three__default.PointLight(color);
          lightNode.distance = range;
          break;

        case 'spot':
          lightNode = new three__default.SpotLight(color);
          lightNode.distance = range;
          lightDef.spot = lightDef.spot || {};
          lightDef.spot.innerConeAngle = lightDef.spot.innerConeAngle !== undefined ? lightDef.spot.innerConeAngle : 0;
          lightDef.spot.outerConeAngle = lightDef.spot.outerConeAngle !== undefined ? lightDef.spot.outerConeAngle : Math.PI / 4.0;
          lightNode.angle = lightDef.spot.outerConeAngle;
          lightNode.penumbra = 1.0 - lightDef.spot.innerConeAngle / lightDef.spot.outerConeAngle;
          lightNode.target.position.set(0, 0, -1);
          lightNode.add(lightNode.target);
          break;

        default:
          throw new Error('THREE.GLTFLoader: Unexpected light type, "' + lightDef.type + '".');
      }

      lightNode.position.set(0, 0, 0);
      lightNode.decay = 2;
      if (lightDef.intensity !== undefined) lightNode.intensity = lightDef.intensity;
      lightNode.name = lightDef.name || 'light_' + lightIndex;
      return Promise.resolve(lightNode);
    };

    function GLTFMaterialsUnlitExtension() {
      this.name = EXTENSIONS.KHR_MATERIALS_UNLIT;
    }

    GLTFMaterialsUnlitExtension.prototype.getMaterialType = function () {
      return three__default.MeshBasicMaterial;
    };

    GLTFMaterialsUnlitExtension.prototype.extendParams = function (materialParams, materialDef, parser) {
      var pending = [];
      materialParams.color = new three__default.Color(1.0, 1.0, 1.0);
      materialParams.opacity = 1.0;
      var metallicRoughness = materialDef.pbrMetallicRoughness;

      if (metallicRoughness) {
        if (Array.isArray(metallicRoughness.baseColorFactor)) {
          var array = metallicRoughness.baseColorFactor;
          materialParams.color.fromArray(array);
          materialParams.opacity = array[3];
        }

        if (metallicRoughness.baseColorTexture !== undefined) {
          pending.push(parser.assignTexture(materialParams, 'map', metallicRoughness.baseColorTexture));
        }
      }

      return Promise.all(pending);
    };

    var BINARY_EXTENSION_HEADER_MAGIC = 'glTF';
    var BINARY_EXTENSION_HEADER_LENGTH = 12;
    var BINARY_EXTENSION_CHUNK_TYPES = {
      JSON: 0x4E4F534A,
      BIN: 0x004E4942
    };

    function GLTFBinaryExtension(data) {
      this.name = EXTENSIONS.KHR_BINARY_GLTF;
      this.content = null;
      this.body = null;
      var headerView = new DataView(data, 0, BINARY_EXTENSION_HEADER_LENGTH);
      this.header = {
        magic: three__default.LoaderUtils.decodeText(new Uint8Array(data.slice(0, 4))),
        version: headerView.getUint32(4, true),
        length: headerView.getUint32(8, true)
      };

      if (this.header.magic !== BINARY_EXTENSION_HEADER_MAGIC) {
        throw new Error('THREE.GLTFLoader: Unsupported glTF-Binary header.');
      } else if (this.header.version < 2.0) {
        throw new Error('THREE.GLTFLoader: Legacy binary file detected. Use LegacyGLTFLoader instead.');
      }

      var chunkView = new DataView(data, BINARY_EXTENSION_HEADER_LENGTH);
      var chunkIndex = 0;

      while (chunkIndex < chunkView.byteLength) {
        var chunkLength = chunkView.getUint32(chunkIndex, true);
        chunkIndex += 4;
        var chunkType = chunkView.getUint32(chunkIndex, true);
        chunkIndex += 4;

        if (chunkType === BINARY_EXTENSION_CHUNK_TYPES.JSON) {
          var contentArray = new Uint8Array(data, BINARY_EXTENSION_HEADER_LENGTH + chunkIndex, chunkLength);
          this.content = three__default.LoaderUtils.decodeText(contentArray);
        } else if (chunkType === BINARY_EXTENSION_CHUNK_TYPES.BIN) {
          var byteOffset = BINARY_EXTENSION_HEADER_LENGTH + chunkIndex;
          this.body = data.slice(byteOffset, byteOffset + chunkLength);
        }

        chunkIndex += chunkLength;
      }

      if (this.content === null) {
        throw new Error('THREE.GLTFLoader: JSON content not found.');
      }
    }

    function GLTFDracoMeshCompressionExtension(json, dracoLoader) {
      if (!dracoLoader) {
        throw new Error('THREE.GLTFLoader: No DRACOLoader instance provided.');
      }

      this.name = EXTENSIONS.KHR_DRACO_MESH_COMPRESSION;
      this.json = json;
      this.dracoLoader = dracoLoader;
    }

    GLTFDracoMeshCompressionExtension.prototype.decodePrimitive = function (primitive, parser) {
      var json = this.json;
      var dracoLoader = this.dracoLoader;
      var bufferViewIndex = primitive.extensions[this.name].bufferView;
      var gltfAttributeMap = primitive.extensions[this.name].attributes;
      var threeAttributeMap = {};
      var attributeNormalizedMap = {};
      var attributeTypeMap = {};

      for (var attributeName in gltfAttributeMap) {
        var threeAttributeName = ATTRIBUTES[attributeName] || attributeName.toLowerCase();
        threeAttributeMap[threeAttributeName] = gltfAttributeMap[attributeName];
      }

      for (attributeName in primitive.attributes) {
        var threeAttributeName = ATTRIBUTES[attributeName] || attributeName.toLowerCase();

        if (gltfAttributeMap[attributeName] !== undefined) {
          var accessorDef = json.accessors[primitive.attributes[attributeName]];
          var componentType = WEBGL_COMPONENT_TYPES[accessorDef.componentType];
          attributeTypeMap[threeAttributeName] = componentType;
          attributeNormalizedMap[threeAttributeName] = accessorDef.normalized === true;
        }
      }

      return parser.getDependency('bufferView', bufferViewIndex).then(function (bufferView) {
        return new Promise(function (resolve) {
          dracoLoader.decodeDracoFile(bufferView, function (geometry) {
            for (var attributeName in geometry.attributes) {
              var attribute = geometry.attributes[attributeName];
              var normalized = attributeNormalizedMap[attributeName];
              if (normalized !== undefined) attribute.normalized = normalized;
            }

            resolve(geometry);
          }, threeAttributeMap, attributeTypeMap);
        });
      });
    };

    function GLTFTextureTransformExtension() {
      this.name = EXTENSIONS.KHR_TEXTURE_TRANSFORM;
    }

    GLTFTextureTransformExtension.prototype.extendTexture = function (texture, transform) {
      texture = texture.clone();

      if (transform.offset !== undefined) {
        texture.offset.fromArray(transform.offset);
      }

      if (transform.rotation !== undefined) {
        texture.rotation = transform.rotation;
      }

      if (transform.scale !== undefined) {
        texture.repeat.fromArray(transform.scale);
      }

      if (transform.texCoord !== undefined) {
        console.warn('THREE.GLTFLoader: Custom UV sets in "' + this.name + '" extension not yet supported.');
      }

      texture.needsUpdate = true;
      return texture;
    };

    function GLTFMaterialsPbrSpecularGlossinessExtension() {
      return {
        name: EXTENSIONS.KHR_MATERIALS_PBR_SPECULAR_GLOSSINESS,
        specularGlossinessParams: ['color', 'map', 'lightMap', 'lightMapIntensity', 'aoMap', 'aoMapIntensity', 'emissive', 'emissiveIntensity', 'emissiveMap', 'bumpMap', 'bumpScale', 'normalMap', 'displacementMap', 'displacementScale', 'displacementBias', 'specularMap', 'specular', 'glossinessMap', 'glossiness', 'alphaMap', 'envMap', 'envMapIntensity', 'refractionRatio'],
        getMaterialType: function getMaterialType() {
          return three__default.ShaderMaterial;
        },
        extendParams: function extendParams(materialParams, materialDef, parser) {
          var pbrSpecularGlossiness = materialDef.extensions[this.name];
          var shader = three__default.ShaderLib['standard'];
          var uniforms = three__default.UniformsUtils.clone(shader.uniforms);
          var specularMapParsFragmentChunk = ['#ifdef USE_SPECULARMAP', '	uniform sampler2D specularMap;', '#endif'].join('\n');
          var glossinessMapParsFragmentChunk = ['#ifdef USE_GLOSSINESSMAP', '	uniform sampler2D glossinessMap;', '#endif'].join('\n');
          var specularMapFragmentChunk = ['vec3 specularFactor = specular;', '#ifdef USE_SPECULARMAP', '	vec4 texelSpecular = texture2D( specularMap, vUv );', '	texelSpecular = sRGBToLinear( texelSpecular );', '	// reads channel RGB, compatible with a glTF Specular-Glossiness (RGBA) texture', '	specularFactor *= texelSpecular.rgb;', '#endif'].join('\n');
          var glossinessMapFragmentChunk = ['float glossinessFactor = glossiness;', '#ifdef USE_GLOSSINESSMAP', '	vec4 texelGlossiness = texture2D( glossinessMap, vUv );', '	// reads channel A, compatible with a glTF Specular-Glossiness (RGBA) texture', '	glossinessFactor *= texelGlossiness.a;', '#endif'].join('\n');
          var lightPhysicalFragmentChunk = ['PhysicalMaterial material;', 'material.diffuseColor = diffuseColor.rgb;', 'material.specularRoughness = clamp( 1.0 - glossinessFactor, 0.04, 1.0 );', 'material.specularColor = specularFactor.rgb;'].join('\n');
          var fragmentShader = shader.fragmentShader.replace('uniform float roughness;', 'uniform vec3 specular;').replace('uniform float metalness;', 'uniform float glossiness;').replace('#include <roughnessmap_pars_fragment>', specularMapParsFragmentChunk).replace('#include <metalnessmap_pars_fragment>', glossinessMapParsFragmentChunk).replace('#include <roughnessmap_fragment>', specularMapFragmentChunk).replace('#include <metalnessmap_fragment>', glossinessMapFragmentChunk).replace('#include <lights_physical_fragment>', lightPhysicalFragmentChunk);
          delete uniforms.roughness;
          delete uniforms.metalness;
          delete uniforms.roughnessMap;
          delete uniforms.metalnessMap;
          uniforms.specular = {
            value: new three__default.Color().setHex(0x111111)
          };
          uniforms.glossiness = {
            value: 0.5
          };
          uniforms.specularMap = {
            value: null
          };
          uniforms.glossinessMap = {
            value: null
          };
          materialParams.vertexShader = shader.vertexShader;
          materialParams.fragmentShader = fragmentShader;
          materialParams.uniforms = uniforms;
          materialParams.defines = {
            'STANDARD': ''
          };
          materialParams.color = new three__default.Color(1.0, 1.0, 1.0);
          materialParams.opacity = 1.0;
          var pending = [];

          if (Array.isArray(pbrSpecularGlossiness.diffuseFactor)) {
            var array = pbrSpecularGlossiness.diffuseFactor;
            materialParams.color.fromArray(array);
            materialParams.opacity = array[3];
          }

          if (pbrSpecularGlossiness.diffuseTexture !== undefined) {
            pending.push(parser.assignTexture(materialParams, 'map', pbrSpecularGlossiness.diffuseTexture));
          }

          materialParams.emissive = new three__default.Color(0.0, 0.0, 0.0);
          materialParams.glossiness = pbrSpecularGlossiness.glossinessFactor !== undefined ? pbrSpecularGlossiness.glossinessFactor : 1.0;
          materialParams.specular = new three__default.Color(1.0, 1.0, 1.0);

          if (Array.isArray(pbrSpecularGlossiness.specularFactor)) {
            materialParams.specular.fromArray(pbrSpecularGlossiness.specularFactor);
          }

          if (pbrSpecularGlossiness.specularGlossinessTexture !== undefined) {
            var specGlossMapDef = pbrSpecularGlossiness.specularGlossinessTexture;
            pending.push(parser.assignTexture(materialParams, 'glossinessMap', specGlossMapDef));
            pending.push(parser.assignTexture(materialParams, 'specularMap', specGlossMapDef));
          }

          return Promise.all(pending);
        },
        createMaterial: function createMaterial(params) {
          var material = new three__default.ShaderMaterial({
            defines: params.defines,
            vertexShader: params.vertexShader,
            fragmentShader: params.fragmentShader,
            uniforms: params.uniforms,
            fog: true,
            lights: true,
            opacity: params.opacity,
            transparent: params.transparent
          });
          material.isGLTFSpecularGlossinessMaterial = true;
          material.color = params.color;
          material.map = params.map === undefined ? null : params.map;
          material.lightMap = null;
          material.lightMapIntensity = 1.0;
          material.aoMap = params.aoMap === undefined ? null : params.aoMap;
          material.aoMapIntensity = 1.0;
          material.emissive = params.emissive;
          material.emissiveIntensity = 1.0;
          material.emissiveMap = params.emissiveMap === undefined ? null : params.emissiveMap;
          material.bumpMap = params.bumpMap === undefined ? null : params.bumpMap;
          material.bumpScale = 1;
          material.normalMap = params.normalMap === undefined ? null : params.normalMap;
          if (params.normalScale) material.normalScale = params.normalScale;
          material.displacementMap = null;
          material.displacementScale = 1;
          material.displacementBias = 0;
          material.specularMap = params.specularMap === undefined ? null : params.specularMap;
          material.specular = params.specular;
          material.glossinessMap = params.glossinessMap === undefined ? null : params.glossinessMap;
          material.glossiness = params.glossiness;
          material.alphaMap = null;
          material.envMap = params.envMap === undefined ? null : params.envMap;
          material.envMapIntensity = 1.0;
          material.refractionRatio = 0.98;
          material.extensions.derivatives = true;
          return material;
        },
        cloneMaterial: function cloneMaterial(source) {
          var target = source.clone();
          target.isGLTFSpecularGlossinessMaterial = true;
          var params = this.specularGlossinessParams;

          for (var i = 0, il = params.length; i < il; i++) {
            var value = source[params[i]];
            target[params[i]] = value && value.isColor ? value.clone() : value;
          }

          return target;
        },
        refreshUniforms: function refreshUniforms(renderer, scene, camera, geometry, material) {
          if (material.isGLTFSpecularGlossinessMaterial !== true) {
            return;
          }

          var uniforms = material.uniforms;
          var defines = material.defines;
          uniforms.opacity.value = material.opacity;
          uniforms.diffuse.value.copy(material.color);
          uniforms.emissive.value.copy(material.emissive).multiplyScalar(material.emissiveIntensity);
          uniforms.map.value = material.map;
          uniforms.specularMap.value = material.specularMap;
          uniforms.alphaMap.value = material.alphaMap;
          uniforms.lightMap.value = material.lightMap;
          uniforms.lightMapIntensity.value = material.lightMapIntensity;
          uniforms.aoMap.value = material.aoMap;
          uniforms.aoMapIntensity.value = material.aoMapIntensity;
          var uvScaleMap;

          if (material.map) {
            uvScaleMap = material.map;
          } else if (material.specularMap) {
            uvScaleMap = material.specularMap;
          } else if (material.displacementMap) {
            uvScaleMap = material.displacementMap;
          } else if (material.normalMap) {
            uvScaleMap = material.normalMap;
          } else if (material.bumpMap) {
            uvScaleMap = material.bumpMap;
          } else if (material.glossinessMap) {
            uvScaleMap = material.glossinessMap;
          } else if (material.alphaMap) {
            uvScaleMap = material.alphaMap;
          } else if (material.emissiveMap) {
            uvScaleMap = material.emissiveMap;
          }

          if (uvScaleMap !== undefined) {
            if (uvScaleMap.isWebGLRenderTarget) {
              uvScaleMap = uvScaleMap.texture;
            }

            if (uvScaleMap.matrixAutoUpdate === true) {
              uvScaleMap.updateMatrix();
            }

            uniforms.uvTransform.value.copy(uvScaleMap.matrix);
          }

          if (material.envMap) {
            uniforms.envMap.value = material.envMap;
            uniforms.envMapIntensity.value = material.envMapIntensity;
            uniforms.flipEnvMap.value = material.envMap.isCubeTexture ? -1 : 1;
            uniforms.reflectivity.value = material.reflectivity;
            uniforms.refractionRatio.value = material.refractionRatio;
            uniforms.maxMipLevel.value = renderer.properties.get(material.envMap).__maxMipLevel;
          }

          uniforms.specular.value.copy(material.specular);
          uniforms.glossiness.value = material.glossiness;
          uniforms.glossinessMap.value = material.glossinessMap;
          uniforms.emissiveMap.value = material.emissiveMap;
          uniforms.bumpMap.value = material.bumpMap;
          uniforms.normalMap.value = material.normalMap;
          uniforms.displacementMap.value = material.displacementMap;
          uniforms.displacementScale.value = material.displacementScale;
          uniforms.displacementBias.value = material.displacementBias;

          if (uniforms.glossinessMap.value !== null && defines.USE_GLOSSINESSMAP === undefined) {
            defines.USE_GLOSSINESSMAP = '';
            defines.USE_ROUGHNESSMAP = '';
          }

          if (uniforms.glossinessMap.value === null && defines.USE_GLOSSINESSMAP !== undefined) {
            delete defines.USE_GLOSSINESSMAP;
            delete defines.USE_ROUGHNESSMAP;
          }
        }
      };
    }

    function GLTFCubicSplineInterpolant(parameterPositions, sampleValues, sampleSize, resultBuffer) {
      three__default.Interpolant.call(this, parameterPositions, sampleValues, sampleSize, resultBuffer);
    }

    GLTFCubicSplineInterpolant.prototype = Object.create(three__default.Interpolant.prototype);
    GLTFCubicSplineInterpolant.prototype.constructor = GLTFCubicSplineInterpolant;

    GLTFCubicSplineInterpolant.prototype.copySampleValue_ = function (index) {
      var result = this.resultBuffer,
          values = this.sampleValues,
          valueSize = this.valueSize,
          offset = index * valueSize * 3 + valueSize;

      for (var i = 0; i !== valueSize; i++) {
        result[i] = values[offset + i];
      }

      return result;
    };

    GLTFCubicSplineInterpolant.prototype.beforeStart_ = GLTFCubicSplineInterpolant.prototype.copySampleValue_;
    GLTFCubicSplineInterpolant.prototype.afterEnd_ = GLTFCubicSplineInterpolant.prototype.copySampleValue_;

    GLTFCubicSplineInterpolant.prototype.interpolate_ = function (i1, t0, t, t1) {
      var result = this.resultBuffer;
      var values = this.sampleValues;
      var stride = this.valueSize;
      var stride2 = stride * 2;
      var stride3 = stride * 3;
      var td = t1 - t0;
      var p = (t - t0) / td;
      var pp = p * p;
      var ppp = pp * p;
      var offset1 = i1 * stride3;
      var offset0 = offset1 - stride3;
      var s2 = -2 * ppp + 3 * pp;
      var s3 = ppp - pp;
      var s0 = 1 - s2;
      var s1 = s3 - pp + p;

      for (var i = 0; i !== stride; i++) {
        var p0 = values[offset0 + i + stride];
        var m0 = values[offset0 + i + stride2] * td;
        var p1 = values[offset1 + i + stride];
        var m1 = values[offset1 + i] * td;
        result[i] = s0 * p0 + s1 * m0 + s2 * p1 + s3 * m1;
      }

      return result;
    };

    var WEBGL_CONSTANTS = {
      FLOAT: 5126,
      FLOAT_MAT3: 35675,
      FLOAT_MAT4: 35676,
      FLOAT_VEC2: 35664,
      FLOAT_VEC3: 35665,
      FLOAT_VEC4: 35666,
      LINEAR: 9729,
      REPEAT: 10497,
      SAMPLER_2D: 35678,
      POINTS: 0,
      LINES: 1,
      LINE_LOOP: 2,
      LINE_STRIP: 3,
      TRIANGLES: 4,
      TRIANGLE_STRIP: 5,
      TRIANGLE_FAN: 6,
      UNSIGNED_BYTE: 5121,
      UNSIGNED_SHORT: 5123
    };
    var WEBGL_COMPONENT_TYPES = {
      5120: Int8Array,
      5121: Uint8Array,
      5122: Int16Array,
      5123: Uint16Array,
      5125: Uint32Array,
      5126: Float32Array
    };
    var WEBGL_FILTERS = {
      9728: three__default.NearestFilter,
      9729: three__default.LinearFilter,
      9984: three__default.NearestMipmapNearestFilter,
      9985: three__default.LinearMipmapNearestFilter,
      9986: three__default.NearestMipmapLinearFilter,
      9987: three__default.LinearMipmapLinearFilter
    };
    var WEBGL_WRAPPINGS = {
      33071: three__default.ClampToEdgeWrapping,
      33648: three__default.MirroredRepeatWrapping,
      10497: three__default.RepeatWrapping
    };
    var WEBGL_TYPE_SIZES = {
      'SCALAR': 1,
      'VEC2': 2,
      'VEC3': 3,
      'VEC4': 4,
      'MAT2': 4,
      'MAT3': 9,
      'MAT4': 16
    };
    var ATTRIBUTES = {
      POSITION: 'position',
      NORMAL: 'normal',
      TANGENT: 'tangent',
      TEXCOORD_0: 'uv',
      TEXCOORD_1: 'uv2',
      COLOR_0: 'color',
      WEIGHTS_0: 'skinWeight',
      JOINTS_0: 'skinIndex'
    };
    var PATH_PROPERTIES = {
      scale: 'scale',
      translation: 'position',
      rotation: 'quaternion',
      weights: 'morphTargetInfluences'
    };
    var INTERPOLATION = {
      CUBICSPLINE: undefined,
      LINEAR: three__default.InterpolateLinear,
      STEP: three__default.InterpolateDiscrete
    };
    var ALPHA_MODES = {
      OPAQUE: 'OPAQUE',
      MASK: 'MASK',
      BLEND: 'BLEND'
    };
    var MIME_TYPE_FORMATS = {
      'image/png': three__default.RGBAFormat,
      'image/jpeg': three__default.RGBFormat
    };

    function resolveURL(url, path) {
      if (typeof url !== 'string' || url === '') return '';

      if (/^https?:\/\//i.test(path) && /^\//.test(url)) {
        path = path.replace(/(^https?:\/\/[^\/]+).*/i, '$1');
      }

      if (/^(https?:)?\/\//i.test(url)) return url;
      if (/^data:.*,.*$/i.test(url)) return url;
      if (/^blob:.*$/i.test(url)) return url;
      return path + url;
    }

    var defaultMaterial;

    function createDefaultMaterial() {
      defaultMaterial = defaultMaterial || new three__default.MeshStandardMaterial({
        color: 0xFFFFFF,
        emissive: 0x000000,
        metalness: 1,
        roughness: 1,
        transparent: false,
        depthTest: true,
        side: three__default.FrontSide
      });
      return defaultMaterial;
    }

    function addUnknownExtensionsToUserData(knownExtensions, object, objectDef) {
      for (var name in objectDef.extensions) {
        if (knownExtensions[name] === undefined) {
          object.userData.gltfExtensions = object.userData.gltfExtensions || {};
          object.userData.gltfExtensions[name] = objectDef.extensions[name];
        }
      }
    }

    function assignExtrasToUserData(object, gltfDef) {
      if (gltfDef.extras !== undefined) {
        if (_typeof(gltfDef.extras) === 'object') {
          Object.assign(object.userData, gltfDef.extras);
        } else {
          console.warn('THREE.GLTFLoader: Ignoring primitive type .extras, ' + gltfDef.extras);
        }
      }
    }

    function addMorphTargets(geometry, targets, parser) {
      var hasMorphPosition = false;
      var hasMorphNormal = false;

      for (var i = 0, il = targets.length; i < il; i++) {
        var target = targets[i];
        if (target.POSITION !== undefined) hasMorphPosition = true;
        if (target.NORMAL !== undefined) hasMorphNormal = true;
        if (hasMorphPosition && hasMorphNormal) break;
      }

      if (!hasMorphPosition && !hasMorphNormal) return Promise.resolve(geometry);
      var pendingPositionAccessors = [];
      var pendingNormalAccessors = [];

      for (var i = 0, il = targets.length; i < il; i++) {
        var target = targets[i];

        if (hasMorphPosition) {
          var pendingAccessor = target.POSITION !== undefined ? parser.getDependency('accessor', target.POSITION) : geometry.attributes.position;
          pendingPositionAccessors.push(pendingAccessor);
        }

        if (hasMorphNormal) {
          var pendingAccessor = target.NORMAL !== undefined ? parser.getDependency('accessor', target.NORMAL) : geometry.attributes.normal;
          pendingNormalAccessors.push(pendingAccessor);
        }
      }

      return Promise.all([Promise.all(pendingPositionAccessors), Promise.all(pendingNormalAccessors)]).then(function (accessors) {
        var morphPositions = accessors[0];
        var morphNormals = accessors[1];

        for (var i = 0, il = morphPositions.length; i < il; i++) {
          if (geometry.attributes.position === morphPositions[i]) continue;
          morphPositions[i] = cloneBufferAttribute(morphPositions[i]);
        }

        for (var i = 0, il = morphNormals.length; i < il; i++) {
          if (geometry.attributes.normal === morphNormals[i]) continue;
          morphNormals[i] = cloneBufferAttribute(morphNormals[i]);
        }

        for (var i = 0, il = targets.length; i < il; i++) {
          var target = targets[i];
          var attributeName = 'morphTarget' + i;

          if (hasMorphPosition) {
            if (target.POSITION !== undefined) {
              var positionAttribute = morphPositions[i];
              positionAttribute.name = attributeName;
              var position = geometry.attributes.position;

              for (var j = 0, jl = positionAttribute.count; j < jl; j++) {
                positionAttribute.setXYZ(j, positionAttribute.getX(j) + position.getX(j), positionAttribute.getY(j) + position.getY(j), positionAttribute.getZ(j) + position.getZ(j));
              }
            }
          }

          if (hasMorphNormal) {
            if (target.NORMAL !== undefined) {
              var normalAttribute = morphNormals[i];
              normalAttribute.name = attributeName;
              var normal = geometry.attributes.normal;

              for (var j = 0, jl = normalAttribute.count; j < jl; j++) {
                normalAttribute.setXYZ(j, normalAttribute.getX(j) + normal.getX(j), normalAttribute.getY(j) + normal.getY(j), normalAttribute.getZ(j) + normal.getZ(j));
              }
            }
          }
        }

        if (hasMorphPosition) geometry.morphAttributes.position = morphPositions;
        if (hasMorphNormal) geometry.morphAttributes.normal = morphNormals;
        return geometry;
      });
    }

    function updateMorphTargets(mesh, meshDef) {
      mesh.updateMorphTargets();

      if (meshDef.weights !== undefined) {
        for (var i = 0, il = meshDef.weights.length; i < il; i++) {
          mesh.morphTargetInfluences[i] = meshDef.weights[i];
        }
      }

      if (meshDef.extras && Array.isArray(meshDef.extras.targetNames)) {
        var targetNames = meshDef.extras.targetNames;

        if (mesh.morphTargetInfluences.length === targetNames.length) {
          mesh.morphTargetDictionary = {};

          for (var i = 0, il = targetNames.length; i < il; i++) {
            mesh.morphTargetDictionary[targetNames[i]] = i;
          }
        } else {
          console.warn('THREE.GLTFLoader: Invalid extras.targetNames length. Ignoring names.');
        }
      }
    }

    function createPrimitiveKey(primitiveDef) {
      var dracoExtension = primitiveDef.extensions && primitiveDef.extensions[EXTENSIONS.KHR_DRACO_MESH_COMPRESSION];
      var geometryKey;

      if (dracoExtension) {
        geometryKey = 'draco:' + dracoExtension.bufferView + ':' + dracoExtension.indices + ':' + createAttributesKey(dracoExtension.attributes);
      } else {
        geometryKey = primitiveDef.indices + ':' + createAttributesKey(primitiveDef.attributes) + ':' + primitiveDef.mode;
      }

      return geometryKey;
    }

    function createAttributesKey(attributes) {
      var attributesKey = '';
      var keys = Object.keys(attributes).sort();

      for (var i = 0, il = keys.length; i < il; i++) {
        attributesKey += keys[i] + ':' + attributes[keys[i]] + ';';
      }

      return attributesKey;
    }

    function cloneBufferAttribute(attribute) {
      if (attribute.isInterleavedBufferAttribute) {
        var count = attribute.count;
        var itemSize = attribute.itemSize;
        var array = attribute.array.slice(0, count * itemSize);

        for (var i = 0, j = 0; i < count; ++i) {
          array[j++] = attribute.getX(i);
          if (itemSize >= 2) array[j++] = attribute.getY(i);
          if (itemSize >= 3) array[j++] = attribute.getZ(i);
          if (itemSize >= 4) array[j++] = attribute.getW(i);
        }

        return new three__default.BufferAttribute(array, itemSize, attribute.normalized);
      }

      return attribute.clone();
    }

    function GLTFParser(json, extensions, options) {
      this.json = json || {};
      this.extensions = extensions || {};
      this.options = options || {};
      this.cache = new GLTFRegistry();
      this.primitiveCache = {};
      this.textureLoader = new three__default.TextureLoader(this.options.manager);
      this.textureLoader.setCrossOrigin(this.options.crossOrigin);
      this.fileLoader = new three__default.FileLoader(this.options.manager);
      this.fileLoader.setResponseType('arraybuffer');

      if (this.options.crossOrigin === 'use-credentials') {
        this.fileLoader.setWithCredentials(true);
      }
    }

    GLTFParser.prototype.parse = function (onLoad, onError) {
      var parser = this;
      var json = this.json;
      var extensions = this.extensions;
      this.cache.removeAll();
      this.markDefs();
      Promise.all([this.getDependencies('scene'), this.getDependencies('animation'), this.getDependencies('camera')]).then(function (dependencies) {
        var result = {
          scene: dependencies[0][json.scene || 0],
          scenes: dependencies[0],
          animations: dependencies[1],
          cameras: dependencies[2],
          asset: json.asset,
          parser: parser,
          userData: {}
        };
        addUnknownExtensionsToUserData(extensions, result, json);
        assignExtrasToUserData(result, json);
        onLoad(result);
      })["catch"](onError);
    };

    GLTFParser.prototype.markDefs = function () {
      var nodeDefs = this.json.nodes || [];
      var skinDefs = this.json.skins || [];
      var meshDefs = this.json.meshes || [];
      var meshReferences = {};
      var meshUses = {};

      for (var skinIndex = 0, skinLength = skinDefs.length; skinIndex < skinLength; skinIndex++) {
        var joints = skinDefs[skinIndex].joints;

        for (var i = 0, il = joints.length; i < il; i++) {
          nodeDefs[joints[i]].isBone = true;
        }
      }

      for (var nodeIndex = 0, nodeLength = nodeDefs.length; nodeIndex < nodeLength; nodeIndex++) {
        var nodeDef = nodeDefs[nodeIndex];

        if (nodeDef.mesh !== undefined) {
          if (meshReferences[nodeDef.mesh] === undefined) {
            meshReferences[nodeDef.mesh] = meshUses[nodeDef.mesh] = 0;
          }

          meshReferences[nodeDef.mesh]++;

          if (nodeDef.skin !== undefined) {
            meshDefs[nodeDef.mesh].isSkinnedMesh = true;
          }
        }
      }

      this.json.meshReferences = meshReferences;
      this.json.meshUses = meshUses;
    };

    GLTFParser.prototype.getDependency = function (type, index) {
      var cacheKey = type + ':' + index;
      var dependency = this.cache.get(cacheKey);

      if (!dependency) {
        switch (type) {
          case 'scene':
            dependency = this.loadScene(index);
            break;

          case 'node':
            dependency = this.loadNode(index);
            break;

          case 'mesh':
            dependency = this.loadMesh(index);
            break;

          case 'accessor':
            dependency = this.loadAccessor(index);
            break;

          case 'bufferView':
            dependency = this.loadBufferView(index);
            break;

          case 'buffer':
            dependency = this.loadBuffer(index);
            break;

          case 'material':
            dependency = this.loadMaterial(index);
            break;

          case 'texture':
            dependency = this.loadTexture(index);
            break;

          case 'skin':
            dependency = this.loadSkin(index);
            break;

          case 'animation':
            dependency = this.loadAnimation(index);
            break;

          case 'camera':
            dependency = this.loadCamera(index);
            break;

          case 'light':
            dependency = this.extensions[EXTENSIONS.KHR_LIGHTS_PUNCTUAL].loadLight(index);
            break;

          default:
            throw new Error('Unknown type: ' + type);
        }

        this.cache.add(cacheKey, dependency);
      }

      return dependency;
    };

    GLTFParser.prototype.getDependencies = function (type) {
      var dependencies = this.cache.get(type);

      if (!dependencies) {
        var parser = this;
        var defs = this.json[type + (type === 'mesh' ? 'es' : 's')] || [];
        dependencies = Promise.all(defs.map(function (def, index) {
          return parser.getDependency(type, index);
        }));
        this.cache.add(type, dependencies);
      }

      return dependencies;
    };

    GLTFParser.prototype.loadBuffer = function (bufferIndex) {
      var bufferDef = this.json.buffers[bufferIndex];
      var loader = this.fileLoader;

      if (bufferDef.type && bufferDef.type !== 'arraybuffer') {
        throw new Error('THREE.GLTFLoader: ' + bufferDef.type + ' buffer type is not supported.');
      }

      if (bufferDef.uri === undefined && bufferIndex === 0) {
        return Promise.resolve(this.extensions[EXTENSIONS.KHR_BINARY_GLTF].body);
      }

      var options = this.options;
      return new Promise(function (resolve, reject) {
        loader.load(resolveURL(bufferDef.uri, options.path), resolve, undefined, function () {
          reject(new Error('THREE.GLTFLoader: Failed to load buffer "' + bufferDef.uri + '".'));
        });
      });
    };

    GLTFParser.prototype.loadBufferView = function (bufferViewIndex) {
      var bufferViewDef = this.json.bufferViews[bufferViewIndex];
      return this.getDependency('buffer', bufferViewDef.buffer).then(function (buffer) {
        var byteLength = bufferViewDef.byteLength || 0;
        var byteOffset = bufferViewDef.byteOffset || 0;
        return buffer.slice(byteOffset, byteOffset + byteLength);
      });
    };

    GLTFParser.prototype.loadAccessor = function (accessorIndex) {
      var parser = this;
      var json = this.json;
      var accessorDef = this.json.accessors[accessorIndex];

      if (accessorDef.bufferView === undefined && accessorDef.sparse === undefined) {
        return Promise.resolve(null);
      }

      var pendingBufferViews = [];

      if (accessorDef.bufferView !== undefined) {
        pendingBufferViews.push(this.getDependency('bufferView', accessorDef.bufferView));
      } else {
        pendingBufferViews.push(null);
      }

      if (accessorDef.sparse !== undefined) {
        pendingBufferViews.push(this.getDependency('bufferView', accessorDef.sparse.indices.bufferView));
        pendingBufferViews.push(this.getDependency('bufferView', accessorDef.sparse.values.bufferView));
      }

      return Promise.all(pendingBufferViews).then(function (bufferViews) {
        var bufferView = bufferViews[0];
        var itemSize = WEBGL_TYPE_SIZES[accessorDef.type];
        var TypedArray = WEBGL_COMPONENT_TYPES[accessorDef.componentType];
        var elementBytes = TypedArray.BYTES_PER_ELEMENT;
        var itemBytes = elementBytes * itemSize;
        var byteOffset = accessorDef.byteOffset || 0;
        var byteStride = accessorDef.bufferView !== undefined ? json.bufferViews[accessorDef.bufferView].byteStride : undefined;
        var normalized = accessorDef.normalized === true;
        var array, bufferAttribute;

        if (byteStride && byteStride !== itemBytes) {
          var ibSlice = Math.floor(byteOffset / byteStride);
          var ibCacheKey = 'InterleavedBuffer:' + accessorDef.bufferView + ':' + accessorDef.componentType + ':' + ibSlice + ':' + accessorDef.count;
          var ib = parser.cache.get(ibCacheKey);

          if (!ib) {
            array = new TypedArray(bufferView, ibSlice * byteStride, accessorDef.count * byteStride / elementBytes);
            ib = new three__default.InterleavedBuffer(array, byteStride / elementBytes);
            parser.cache.add(ibCacheKey, ib);
          }

          bufferAttribute = new three__default.InterleavedBufferAttribute(ib, itemSize, byteOffset % byteStride / elementBytes, normalized);
        } else {
          if (bufferView === null) {
            array = new TypedArray(accessorDef.count * itemSize);
          } else {
            array = new TypedArray(bufferView, byteOffset, accessorDef.count * itemSize);
          }

          bufferAttribute = new three__default.BufferAttribute(array, itemSize, normalized);
        }

        if (accessorDef.sparse !== undefined) {
          var itemSizeIndices = WEBGL_TYPE_SIZES.SCALAR;
          var TypedArrayIndices = WEBGL_COMPONENT_TYPES[accessorDef.sparse.indices.componentType];
          var byteOffsetIndices = accessorDef.sparse.indices.byteOffset || 0;
          var byteOffsetValues = accessorDef.sparse.values.byteOffset || 0;
          var sparseIndices = new TypedArrayIndices(bufferViews[1], byteOffsetIndices, accessorDef.sparse.count * itemSizeIndices);
          var sparseValues = new TypedArray(bufferViews[2], byteOffsetValues, accessorDef.sparse.count * itemSize);

          if (bufferView !== null) {
            bufferAttribute.setArray(bufferAttribute.array.slice());
          }

          for (var i = 0, il = sparseIndices.length; i < il; i++) {
            var index = sparseIndices[i];
            bufferAttribute.setX(index, sparseValues[i * itemSize]);
            if (itemSize >= 2) bufferAttribute.setY(index, sparseValues[i * itemSize + 1]);
            if (itemSize >= 3) bufferAttribute.setZ(index, sparseValues[i * itemSize + 2]);
            if (itemSize >= 4) bufferAttribute.setW(index, sparseValues[i * itemSize + 3]);
            if (itemSize >= 5) throw new Error('THREE.GLTFLoader: Unsupported itemSize in sparse BufferAttribute.');
          }
        }

        return bufferAttribute;
      });
    };

    GLTFParser.prototype.loadTexture = function (textureIndex) {
      var parser = this;
      var json = this.json;
      var options = this.options;
      var textureLoader = this.textureLoader;
      var URL = window.URL || window.webkitURL;
      var textureDef = json.textures[textureIndex];
      var textureExtensions = textureDef.extensions || {};
      var source;

      if (textureExtensions[EXTENSIONS.MSFT_TEXTURE_DDS]) {
        source = json.images[textureExtensions[EXTENSIONS.MSFT_TEXTURE_DDS].source];
      } else {
        source = json.images[textureDef.source];
      }

      var sourceURI = source.uri;
      var isObjectURL = false;

      if (source.bufferView !== undefined) {
        sourceURI = parser.getDependency('bufferView', source.bufferView).then(function (bufferView) {
          isObjectURL = true;
          var blob = new Blob([bufferView], {
            type: source.mimeType
          });
          sourceURI = URL.createObjectURL(blob);
          return sourceURI;
        });
      }

      return Promise.resolve(sourceURI).then(function (sourceURI) {
        var loader = three__default.Loader.Handlers.get(sourceURI);

        if (!loader) {
          loader = textureExtensions[EXTENSIONS.MSFT_TEXTURE_DDS] ? parser.extensions[EXTENSIONS.MSFT_TEXTURE_DDS].ddsLoader : textureLoader;
        }

        return new Promise(function (resolve, reject) {
          loader.load(resolveURL(sourceURI, options.path), resolve, undefined, reject);
        });
      }).then(function (texture) {
        if (isObjectURL === true) {
          URL.revokeObjectURL(sourceURI);
        }

        texture.flipY = false;
        if (textureDef.name !== undefined) texture.name = textureDef.name;

        if (source.mimeType in MIME_TYPE_FORMATS) {
          texture.format = MIME_TYPE_FORMATS[source.mimeType];
        }

        var samplers = json.samplers || {};
        var sampler = samplers[textureDef.sampler] || {};
        texture.magFilter = WEBGL_FILTERS[sampler.magFilter] || three__default.LinearFilter;
        texture.minFilter = WEBGL_FILTERS[sampler.minFilter] || three__default.LinearMipmapLinearFilter;
        texture.wrapS = WEBGL_WRAPPINGS[sampler.wrapS] || three__default.RepeatWrapping;
        texture.wrapT = WEBGL_WRAPPINGS[sampler.wrapT] || three__default.RepeatWrapping;
        return texture;
      });
    };

    GLTFParser.prototype.assignTexture = function (materialParams, mapName, mapDef) {
      var parser = this;
      return this.getDependency('texture', mapDef.index).then(function (texture) {
        if (!texture.isCompressedTexture) {
          switch (mapName) {
            case 'aoMap':
            case 'emissiveMap':
            case 'metalnessMap':
            case 'normalMap':
            case 'roughnessMap':
              texture.format = three__default.RGBFormat;
              break;
          }
        }

        if (parser.extensions[EXTENSIONS.KHR_TEXTURE_TRANSFORM]) {
          var transform = mapDef.extensions !== undefined ? mapDef.extensions[EXTENSIONS.KHR_TEXTURE_TRANSFORM] : undefined;

          if (transform) {
            texture = parser.extensions[EXTENSIONS.KHR_TEXTURE_TRANSFORM].extendTexture(texture, transform);
          }
        }

        materialParams[mapName] = texture;
      });
    };

    GLTFParser.prototype.assignFinalMaterial = function (mesh) {
      var geometry = mesh.geometry;
      var material = mesh.material;
      var extensions = this.extensions;
      var useVertexTangents = geometry.attributes.tangent !== undefined;
      var useVertexColors = geometry.attributes.color !== undefined;
      var useFlatShading = geometry.attributes.normal === undefined;
      var useSkinning = mesh.isSkinnedMesh === true;
      var useMorphTargets = Object.keys(geometry.morphAttributes).length > 0;
      var useMorphNormals = useMorphTargets && geometry.morphAttributes.normal !== undefined;

      if (mesh.isPoints) {
        var cacheKey = 'PointsMaterial:' + material.uuid;
        var pointsMaterial = this.cache.get(cacheKey);

        if (!pointsMaterial) {
          pointsMaterial = new three__default.PointsMaterial();
          three__default.Material.prototype.copy.call(pointsMaterial, material);
          pointsMaterial.color.copy(material.color);
          pointsMaterial.map = material.map;
          pointsMaterial.lights = false;
          pointsMaterial.sizeAttenuation = false;
          this.cache.add(cacheKey, pointsMaterial);
        }

        material = pointsMaterial;
      } else if (mesh.isLine) {
        var cacheKey = 'LineBasicMaterial:' + material.uuid;
        var lineMaterial = this.cache.get(cacheKey);

        if (!lineMaterial) {
          lineMaterial = new three__default.LineBasicMaterial();
          three__default.Material.prototype.copy.call(lineMaterial, material);
          lineMaterial.color.copy(material.color);
          lineMaterial.lights = false;
          this.cache.add(cacheKey, lineMaterial);
        }

        material = lineMaterial;
      }

      if (useVertexTangents || useVertexColors || useFlatShading || useSkinning || useMorphTargets) {
        var cacheKey = 'ClonedMaterial:' + material.uuid + ':';
        if (material.isGLTFSpecularGlossinessMaterial) cacheKey += 'specular-glossiness:';
        if (useSkinning) cacheKey += 'skinning:';
        if (useVertexTangents) cacheKey += 'vertex-tangents:';
        if (useVertexColors) cacheKey += 'vertex-colors:';
        if (useFlatShading) cacheKey += 'flat-shading:';
        if (useMorphTargets) cacheKey += 'morph-targets:';
        if (useMorphNormals) cacheKey += 'morph-normals:';
        var cachedMaterial = this.cache.get(cacheKey);

        if (!cachedMaterial) {
          cachedMaterial = material.isGLTFSpecularGlossinessMaterial ? extensions[EXTENSIONS.KHR_MATERIALS_PBR_SPECULAR_GLOSSINESS].cloneMaterial(material) : material.clone();
          if (useSkinning) cachedMaterial.skinning = true;
          if (useVertexTangents) cachedMaterial.vertexTangents = true;
          if (useVertexColors) cachedMaterial.vertexColors = three__default.VertexColors;
          if (useFlatShading) cachedMaterial.flatShading = true;
          if (useMorphTargets) cachedMaterial.morphTargets = true;
          if (useMorphNormals) cachedMaterial.morphNormals = true;
          this.cache.add(cacheKey, cachedMaterial);
        }

        material = cachedMaterial;
      }

      if (material.aoMap && geometry.attributes.uv2 === undefined && geometry.attributes.uv !== undefined) {
        console.log('THREE.GLTFLoader: Duplicating UVs to support aoMap.');
        geometry.addAttribute('uv2', new three__default.BufferAttribute(geometry.attributes.uv.array, 2));
      }

      if (material.isGLTFSpecularGlossinessMaterial) {
        mesh.onBeforeRender = extensions[EXTENSIONS.KHR_MATERIALS_PBR_SPECULAR_GLOSSINESS].refreshUniforms;
      }

      mesh.material = material;
    };

    GLTFParser.prototype.loadMaterial = function (materialIndex) {
      var parser = this;
      var json = this.json;
      var extensions = this.extensions;
      var materialDef = json.materials[materialIndex];
      var materialType;
      var materialParams = {};
      var materialExtensions = materialDef.extensions || {};
      var pending = [];

      if (materialExtensions[EXTENSIONS.KHR_MATERIALS_PBR_SPECULAR_GLOSSINESS]) {
        var sgExtension = extensions[EXTENSIONS.KHR_MATERIALS_PBR_SPECULAR_GLOSSINESS];
        materialType = sgExtension.getMaterialType();
        pending.push(sgExtension.extendParams(materialParams, materialDef, parser));
      } else if (materialExtensions[EXTENSIONS.KHR_MATERIALS_UNLIT]) {
        var kmuExtension = extensions[EXTENSIONS.KHR_MATERIALS_UNLIT];
        materialType = kmuExtension.getMaterialType();
        pending.push(kmuExtension.extendParams(materialParams, materialDef, parser));
      } else {
        materialType = three__default.MeshStandardMaterial;
        var metallicRoughness = materialDef.pbrMetallicRoughness || {};
        materialParams.color = new three__default.Color(1.0, 1.0, 1.0);
        materialParams.opacity = 1.0;

        if (Array.isArray(metallicRoughness.baseColorFactor)) {
          var array = metallicRoughness.baseColorFactor;
          materialParams.color.fromArray(array);
          materialParams.opacity = array[3];
        }

        if (metallicRoughness.baseColorTexture !== undefined) {
          pending.push(parser.assignTexture(materialParams, 'map', metallicRoughness.baseColorTexture));
        }

        materialParams.metalness = metallicRoughness.metallicFactor !== undefined ? metallicRoughness.metallicFactor : 1.0;
        materialParams.roughness = metallicRoughness.roughnessFactor !== undefined ? metallicRoughness.roughnessFactor : 1.0;

        if (metallicRoughness.metallicRoughnessTexture !== undefined) {
          pending.push(parser.assignTexture(materialParams, 'metalnessMap', metallicRoughness.metallicRoughnessTexture));
          pending.push(parser.assignTexture(materialParams, 'roughnessMap', metallicRoughness.metallicRoughnessTexture));
        }
      }

      if (materialDef.doubleSided === true) {
        materialParams.side = three__default.DoubleSide;
      }

      var alphaMode = materialDef.alphaMode || ALPHA_MODES.OPAQUE;

      if (alphaMode === ALPHA_MODES.BLEND) {
        materialParams.transparent = true;
      } else {
        materialParams.transparent = false;

        if (alphaMode === ALPHA_MODES.MASK) {
          materialParams.alphaTest = materialDef.alphaCutoff !== undefined ? materialDef.alphaCutoff : 0.5;
        }
      }

      if (materialDef.normalTexture !== undefined && materialType !== three__default.MeshBasicMaterial) {
        pending.push(parser.assignTexture(materialParams, 'normalMap', materialDef.normalTexture));
        materialParams.normalScale = new three__default.Vector2(1, 1);

        if (materialDef.normalTexture.scale !== undefined) {
          materialParams.normalScale.set(materialDef.normalTexture.scale, materialDef.normalTexture.scale);
        }
      }

      if (materialDef.occlusionTexture !== undefined && materialType !== three__default.MeshBasicMaterial) {
        pending.push(parser.assignTexture(materialParams, 'aoMap', materialDef.occlusionTexture));

        if (materialDef.occlusionTexture.strength !== undefined) {
          materialParams.aoMapIntensity = materialDef.occlusionTexture.strength;
        }
      }

      if (materialDef.emissiveFactor !== undefined && materialType !== three__default.MeshBasicMaterial) {
        materialParams.emissive = new three__default.Color().fromArray(materialDef.emissiveFactor);
      }

      if (materialDef.emissiveTexture !== undefined && materialType !== three__default.MeshBasicMaterial) {
        pending.push(parser.assignTexture(materialParams, 'emissiveMap', materialDef.emissiveTexture));
      }

      return Promise.all(pending).then(function () {
        var material;

        if (materialType === three__default.ShaderMaterial) {
          material = extensions[EXTENSIONS.KHR_MATERIALS_PBR_SPECULAR_GLOSSINESS].createMaterial(materialParams);
        } else {
          material = new materialType(materialParams);
        }

        if (materialDef.name !== undefined) material.name = materialDef.name;
        if (material.map) material.map.encoding = three__default.sRGBEncoding;
        if (material.emissiveMap) material.emissiveMap.encoding = three__default.sRGBEncoding;
        if (material.specularMap) material.specularMap.encoding = three__default.sRGBEncoding;
        assignExtrasToUserData(material, materialDef);
        if (materialDef.extensions) addUnknownExtensionsToUserData(extensions, material, materialDef);
        return material;
      });
    };

    function addPrimitiveAttributes(geometry, primitiveDef, parser) {
      var attributes = primitiveDef.attributes;
      var pending = [];

      function assignAttributeAccessor(accessorIndex, attributeName) {
        return parser.getDependency('accessor', accessorIndex).then(function (accessor) {
          geometry.addAttribute(attributeName, accessor);
        });
      }

      for (var gltfAttributeName in attributes) {
        var threeAttributeName = ATTRIBUTES[gltfAttributeName] || gltfAttributeName.toLowerCase();
        if (threeAttributeName in geometry.attributes) continue;
        pending.push(assignAttributeAccessor(attributes[gltfAttributeName], threeAttributeName));
      }

      if (primitiveDef.indices !== undefined && !geometry.index) {
        var accessor = parser.getDependency('accessor', primitiveDef.indices).then(function (accessor) {
          geometry.setIndex(accessor);
        });
        pending.push(accessor);
      }

      assignExtrasToUserData(geometry, primitiveDef);
      return Promise.all(pending).then(function () {
        return primitiveDef.targets !== undefined ? addMorphTargets(geometry, primitiveDef.targets, parser) : geometry;
      });
    }

    GLTFParser.prototype.loadGeometries = function (primitives) {
      var parser = this;
      var extensions = this.extensions;
      var cache = this.primitiveCache;

      function createDracoPrimitive(primitive) {
        return extensions[EXTENSIONS.KHR_DRACO_MESH_COMPRESSION].decodePrimitive(primitive, parser).then(function (geometry) {
          return addPrimitiveAttributes(geometry, primitive, parser);
        });
      }

      var pending = [];

      for (var i = 0, il = primitives.length; i < il; i++) {
        var primitive = primitives[i];
        var cacheKey = createPrimitiveKey(primitive);
        var cached = cache[cacheKey];

        if (cached) {
          pending.push(cached.promise);
        } else {
          var geometryPromise;

          if (primitive.extensions && primitive.extensions[EXTENSIONS.KHR_DRACO_MESH_COMPRESSION]) {
            geometryPromise = createDracoPrimitive(primitive);
          } else {
            geometryPromise = addPrimitiveAttributes(new three__default.BufferGeometry(), primitive, parser);
          }

          cache[cacheKey] = {
            primitive: primitive,
            promise: geometryPromise
          };
          pending.push(geometryPromise);
        }
      }

      return Promise.all(pending);
    };

    GLTFParser.prototype.loadMesh = function (meshIndex) {
      var parser = this;
      var json = this.json;
      var meshDef = json.meshes[meshIndex];
      var primitives = meshDef.primitives;
      var pending = [];

      for (var i = 0, il = primitives.length; i < il; i++) {
        var material = primitives[i].material === undefined ? createDefaultMaterial() : this.getDependency('material', primitives[i].material);
        pending.push(material);
      }

      return Promise.all(pending).then(function (originalMaterials) {
        return parser.loadGeometries(primitives).then(function (geometries) {
          var meshes = [];

          for (var i = 0, il = geometries.length; i < il; i++) {
            var geometry = geometries[i];
            var primitive = primitives[i];
            var mesh;
            var material = originalMaterials[i];

            if (primitive.mode === WEBGL_CONSTANTS.TRIANGLES || primitive.mode === WEBGL_CONSTANTS.TRIANGLE_STRIP || primitive.mode === WEBGL_CONSTANTS.TRIANGLE_FAN || primitive.mode === undefined) {
              mesh = meshDef.isSkinnedMesh === true ? new three__default.SkinnedMesh(geometry, material) : new three__default.Mesh(geometry, material);

              if (mesh.isSkinnedMesh === true && !mesh.geometry.attributes.skinWeight.normalized) {
                mesh.normalizeSkinWeights();
              }

              if (primitive.mode === WEBGL_CONSTANTS.TRIANGLE_STRIP) {
                mesh.drawMode = three__default.TriangleStripDrawMode;
              } else if (primitive.mode === WEBGL_CONSTANTS.TRIANGLE_FAN) {
                mesh.drawMode = three__default.TriangleFanDrawMode;
              }
            } else if (primitive.mode === WEBGL_CONSTANTS.LINES) {
              mesh = new three__default.LineSegments(geometry, material);
            } else if (primitive.mode === WEBGL_CONSTANTS.LINE_STRIP) {
              mesh = new three__default.Line(geometry, material);
            } else if (primitive.mode === WEBGL_CONSTANTS.LINE_LOOP) {
              mesh = new three__default.LineLoop(geometry, material);
            } else if (primitive.mode === WEBGL_CONSTANTS.POINTS) {
              mesh = new three__default.Points(geometry, material);
            } else {
              throw new Error('THREE.GLTFLoader: Primitive mode unsupported: ' + primitive.mode);
            }

            if (Object.keys(mesh.geometry.morphAttributes).length > 0) {
              updateMorphTargets(mesh, meshDef);
            }

            mesh.name = meshDef.name || 'mesh_' + meshIndex;
            if (geometries.length > 1) mesh.name += '_' + i;
            assignExtrasToUserData(mesh, meshDef);
            parser.assignFinalMaterial(mesh);
            meshes.push(mesh);
          }

          if (meshes.length === 1) {
            return meshes[0];
          }

          var group = new three__default.Group();

          for (var i = 0, il = meshes.length; i < il; i++) {
            group.add(meshes[i]);
          }

          return group;
        });
      });
    };

    GLTFParser.prototype.loadCamera = function (cameraIndex) {
      var camera;
      var cameraDef = this.json.cameras[cameraIndex];
      var params = cameraDef[cameraDef.type];

      if (!params) {
        console.warn('THREE.GLTFLoader: Missing camera parameters.');
        return;
      }

      if (cameraDef.type === 'perspective') {
        camera = new three__default.PerspectiveCamera(three__default.Math.radToDeg(params.yfov), params.aspectRatio || 1, params.znear || 1, params.zfar || 2e6);
      } else if (cameraDef.type === 'orthographic') {
        camera = new three__default.OrthographicCamera(params.xmag / -2, params.xmag / 2, params.ymag / 2, params.ymag / -2, params.znear, params.zfar);
      }

      if (cameraDef.name !== undefined) camera.name = cameraDef.name;
      assignExtrasToUserData(camera, cameraDef);
      return Promise.resolve(camera);
    };

    GLTFParser.prototype.loadSkin = function (skinIndex) {
      var skinDef = this.json.skins[skinIndex];
      var skinEntry = {
        joints: skinDef.joints
      };

      if (skinDef.inverseBindMatrices === undefined) {
        return Promise.resolve(skinEntry);
      }

      return this.getDependency('accessor', skinDef.inverseBindMatrices).then(function (accessor) {
        skinEntry.inverseBindMatrices = accessor;
        return skinEntry;
      });
    };

    GLTFParser.prototype.loadAnimation = function (animationIndex) {
      var json = this.json;
      var animationDef = json.animations[animationIndex];
      var pendingNodes = [];
      var pendingInputAccessors = [];
      var pendingOutputAccessors = [];
      var pendingSamplers = [];
      var pendingTargets = [];

      for (var i = 0, il = animationDef.channels.length; i < il; i++) {
        var channel = animationDef.channels[i];
        var sampler = animationDef.samplers[channel.sampler];
        var target = channel.target;
        var name = target.node !== undefined ? target.node : target.id;
        var input = animationDef.parameters !== undefined ? animationDef.parameters[sampler.input] : sampler.input;
        var output = animationDef.parameters !== undefined ? animationDef.parameters[sampler.output] : sampler.output;
        pendingNodes.push(this.getDependency('node', name));
        pendingInputAccessors.push(this.getDependency('accessor', input));
        pendingOutputAccessors.push(this.getDependency('accessor', output));
        pendingSamplers.push(sampler);
        pendingTargets.push(target);
      }

      return Promise.all([Promise.all(pendingNodes), Promise.all(pendingInputAccessors), Promise.all(pendingOutputAccessors), Promise.all(pendingSamplers), Promise.all(pendingTargets)]).then(function (dependencies) {
        var nodes = dependencies[0];
        var inputAccessors = dependencies[1];
        var outputAccessors = dependencies[2];
        var samplers = dependencies[3];
        var targets = dependencies[4];
        var tracks = [];

        for (var i = 0, il = nodes.length; i < il; i++) {
          var node = nodes[i];
          var inputAccessor = inputAccessors[i];
          var outputAccessor = outputAccessors[i];
          var sampler = samplers[i];
          var target = targets[i];
          if (node === undefined) continue;
          node.updateMatrix();
          node.matrixAutoUpdate = true;
          var TypedKeyframeTrack;

          switch (PATH_PROPERTIES[target.path]) {
            case PATH_PROPERTIES.weights:
              TypedKeyframeTrack = three__default.NumberKeyframeTrack;
              break;

            case PATH_PROPERTIES.rotation:
              TypedKeyframeTrack = three__default.QuaternionKeyframeTrack;
              break;

            case PATH_PROPERTIES.position:
            case PATH_PROPERTIES.scale:
            default:
              TypedKeyframeTrack = three__default.VectorKeyframeTrack;
              break;
          }

          var targetName = node.name ? node.name : node.uuid;
          var interpolation = sampler.interpolation !== undefined ? INTERPOLATION[sampler.interpolation] : three__default.InterpolateLinear;
          var targetNames = [];

          if (PATH_PROPERTIES[target.path] === PATH_PROPERTIES.weights) {
            node.traverse(function (object) {
              if (object.isMesh === true && object.morphTargetInfluences) {
                targetNames.push(object.name ? object.name : object.uuid);
              }
            });
          } else {
            targetNames.push(targetName);
          }

          var outputArray = outputAccessor.array;

          if (outputAccessor.normalized) {
            var scale;

            if (outputArray.constructor === Int8Array) {
              scale = 1 / 127;
            } else if (outputArray.constructor === Uint8Array) {
              scale = 1 / 255;
            } else if (outputArray.constructor == Int16Array) {
              scale = 1 / 32767;
            } else if (outputArray.constructor === Uint16Array) {
              scale = 1 / 65535;
            } else {
              throw new Error('THREE.GLTFLoader: Unsupported output accessor component type.');
            }

            var scaled = new Float32Array(outputArray.length);

            for (var j = 0, jl = outputArray.length; j < jl; j++) {
              scaled[j] = outputArray[j] * scale;
            }

            outputArray = scaled;
          }

          for (var j = 0, jl = targetNames.length; j < jl; j++) {
            var track = new TypedKeyframeTrack(targetNames[j] + '.' + PATH_PROPERTIES[target.path], inputAccessor.array, outputArray, interpolation);

            if (sampler.interpolation === 'CUBICSPLINE') {
              track.createInterpolant = function InterpolantFactoryMethodGLTFCubicSpline(result) {
                return new GLTFCubicSplineInterpolant(this.times, this.values, this.getValueSize() / 3, result);
              };

              track.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline = true;
            }

            tracks.push(track);
          }
        }

        var name = animationDef.name !== undefined ? animationDef.name : 'animation_' + animationIndex;
        return new three__default.AnimationClip(name, undefined, tracks);
      });
    };

    GLTFParser.prototype.loadNode = function (nodeIndex) {
      var json = this.json;
      var extensions = this.extensions;
      var parser = this;
      var meshReferences = json.meshReferences;
      var meshUses = json.meshUses;
      var nodeDef = json.nodes[nodeIndex];
      return function () {
        var pending = [];

        if (nodeDef.mesh !== undefined) {
          pending.push(parser.getDependency('mesh', nodeDef.mesh).then(function (mesh) {
            var node;

            if (meshReferences[nodeDef.mesh] > 1) {
              var instanceNum = meshUses[nodeDef.mesh]++;
              node = mesh.clone();
              node.name += '_instance_' + instanceNum;
              node.onBeforeRender = mesh.onBeforeRender;

              for (var i = 0, il = node.children.length; i < il; i++) {
                node.children[i].name += '_instance_' + instanceNum;
                node.children[i].onBeforeRender = mesh.children[i].onBeforeRender;
              }
            } else {
              node = mesh;
            }

            if (nodeDef.weights !== undefined) {
              node.traverse(function (o) {
                if (!o.isMesh) return;

                for (var i = 0, il = nodeDef.weights.length; i < il; i++) {
                  o.morphTargetInfluences[i] = nodeDef.weights[i];
                }
              });
            }

            return node;
          }));
        }

        if (nodeDef.camera !== undefined) {
          pending.push(parser.getDependency('camera', nodeDef.camera));
        }

        if (nodeDef.extensions && nodeDef.extensions[EXTENSIONS.KHR_LIGHTS_PUNCTUAL] && nodeDef.extensions[EXTENSIONS.KHR_LIGHTS_PUNCTUAL].light !== undefined) {
          pending.push(parser.getDependency('light', nodeDef.extensions[EXTENSIONS.KHR_LIGHTS_PUNCTUAL].light));
        }

        return Promise.all(pending);
      }().then(function (objects) {
        var node;

        if (nodeDef.isBone === true) {
          node = new three__default.Bone();
        } else if (objects.length > 1) {
          node = new three__default.Group();
        } else if (objects.length === 1) {
          node = objects[0];
        } else {
          node = new three__default.Object3D();
        }

        if (node !== objects[0]) {
          for (var i = 0, il = objects.length; i < il; i++) {
            node.add(objects[i]);
          }
        }

        if (nodeDef.name !== undefined) {
          node.userData.name = nodeDef.name;
          node.name = three__default.PropertyBinding.sanitizeNodeName(nodeDef.name);
        }

        assignExtrasToUserData(node, nodeDef);
        if (nodeDef.extensions) addUnknownExtensionsToUserData(extensions, node, nodeDef);

        if (nodeDef.matrix !== undefined) {
          var matrix = new three__default.Matrix4();
          matrix.fromArray(nodeDef.matrix);
          node.applyMatrix(matrix);
        } else {
          if (nodeDef.translation !== undefined) {
            node.position.fromArray(nodeDef.translation);
          }

          if (nodeDef.rotation !== undefined) {
            node.quaternion.fromArray(nodeDef.rotation);
          }

          if (nodeDef.scale !== undefined) {
            node.scale.fromArray(nodeDef.scale);
          }
        }

        return node;
      });
    };

    GLTFParser.prototype.loadScene = function () {
      function buildNodeHierachy(nodeId, parentObject, json, parser) {
        var nodeDef = json.nodes[nodeId];
        return parser.getDependency('node', nodeId).then(function (node) {
          if (nodeDef.skin === undefined) return node;
          var skinEntry;
          return parser.getDependency('skin', nodeDef.skin).then(function (skin) {
            skinEntry = skin;
            var pendingJoints = [];

            for (var i = 0, il = skinEntry.joints.length; i < il; i++) {
              pendingJoints.push(parser.getDependency('node', skinEntry.joints[i]));
            }

            return Promise.all(pendingJoints);
          }).then(function (jointNodes) {
            node.traverse(function (mesh) {
              if (!mesh.isMesh) return;
              var bones = [];
              var boneInverses = [];

              for (var j = 0, jl = jointNodes.length; j < jl; j++) {
                var jointNode = jointNodes[j];

                if (jointNode) {
                  bones.push(jointNode);
                  var mat = new three__default.Matrix4();

                  if (skinEntry.inverseBindMatrices !== undefined) {
                    mat.fromArray(skinEntry.inverseBindMatrices.array, j * 16);
                  }

                  boneInverses.push(mat);
                } else {
                  console.warn('THREE.GLTFLoader: Joint "%s" could not be found.', skinEntry.joints[j]);
                }
              }

              mesh.bind(new three__default.Skeleton(bones, boneInverses), mesh.matrixWorld);
            });
            return node;
          });
        }).then(function (node) {
          parentObject.add(node);
          var pending = [];

          if (nodeDef.children) {
            var children = nodeDef.children;

            for (var i = 0, il = children.length; i < il; i++) {
              var child = children[i];
              pending.push(buildNodeHierachy(child, node, json, parser));
            }
          }

          return Promise.all(pending);
        });
      }

      return function loadScene(sceneIndex) {
        var json = this.json;
        var extensions = this.extensions;
        var sceneDef = this.json.scenes[sceneIndex];
        var parser = this;
        var scene = new three__default.Scene();
        if (sceneDef.name !== undefined) scene.name = sceneDef.name;
        assignExtrasToUserData(scene, sceneDef);
        if (sceneDef.extensions) addUnknownExtensionsToUserData(extensions, scene, sceneDef);
        var nodeIds = sceneDef.nodes || [];
        var pending = [];

        for (var i = 0, il = nodeIds.length; i < il; i++) {
          pending.push(buildNodeHierachy(nodeIds[i], scene, json, parser));
        }

        return Promise.all(pending).then(function () {
          return scene;
        });
      };
    }();

    return GLTFLoader;
  }();

  var threeGltfLoader = _GLTFLoader;

  var GodRaysDemo = function (_PostProcessingDemo8) {
    _inherits(GodRaysDemo, _PostProcessingDemo8);

    function GodRaysDemo(composer) {
      var _this58;

      _classCallCheck(this, GodRaysDemo);

      _this58 = _possibleConstructorReturn(this, _getPrototypeOf(GodRaysDemo).call(this, "god-rays", composer));
      _this58.pass = null;
      _this58.effect = null;
      _this58.sun = null;
      _this58.light = null;
      return _this58;
    }

    _createClass(GodRaysDemo, [{
      key: "load",
      value: function load() {
        var _this59 = this;

        var assets = this.assets;
        var loadingManager = this.loadingManager;
        var cubeTextureLoader = new three.CubeTextureLoader(loadingManager);
        var textureLoader = new three.TextureLoader(loadingManager);
        var modelLoader = new threeGltfLoader(loadingManager);
        var path = "textures/skies/starry/";
        var format = ".png";
        var urls = [path + "px" + format, path + "nx" + format, path + "py" + format, path + "ny" + format, path + "pz" + format, path + "nz" + format];
        return new Promise(function (resolve, reject) {
          if (assets.size === 0) {
            loadingManager.onError = reject;

            loadingManager.onProgress = function (item, loaded, total) {
              if (loaded === total) {
                resolve();
              }
            };

            cubeTextureLoader.load(urls, function (textureCube) {
              assets.set("sky", textureCube);
            });
            modelLoader.load("models/tree/scene.gltf", function (gltf) {
              gltf.scene.scale.multiplyScalar(2.5);
              gltf.scene.position.set(0, -2.3, 0);
              gltf.scene.rotation.set(0, 3, 0);
              assets.set("model", gltf.scene);
            });
            textureLoader.load("textures/sun.png", function (texture) {
              assets.set("sun-diffuse", texture);
            });

            _this59.loadSMAAImages();
          } else {
            resolve();
          }
        });
      }
    }, {
      key: "initialize",
      value: function initialize() {
        var scene = this.scene;
        var assets = this.assets;
        var composer = this.composer;
        var renderer = composer.renderer;
        var camera = new three.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
        camera.position.set(-6, -1, -6);
        this.camera = camera;
        var target = new three.Vector3(0, 0.5, 0);
        var controls = new DeltaControls(camera.position, camera.quaternion, renderer.domElement);
        controls.settings.pointer.lock = false;
        controls.settings.translation.enabled = false;
        controls.settings.sensitivity.rotation = 0.00125;
        controls.settings.sensitivity.zoom = 1.0;
        controls.lookAt(target);
        this.controls = controls;
        scene.background = assets.get("sky");
        var ambientLight = new three.AmbientLight(0x808080);
        var directionalLight = new three.DirectionalLight(0xffbbaa);
        directionalLight.position.set(75, 25, 100);
        directionalLight.target = scene;
        this.light = directionalLight;
        scene.add(ambientLight);
        scene.add(directionalLight);
        scene.add(assets.get("model"));
        var sunMaterial = new three.MeshBasicMaterial({
          color: 0xffddaa,
          transparent: true,
          fog: false
        });
        var sunGeometry = new three.SphereBufferGeometry(16, 32, 32);
        var sun = new three.Mesh(sunGeometry, sunMaterial);
        sun.frustumCulled = false;
        var group = new three.Group();
        group.position.copy(this.light.position);
        group.add(sun);
        sun.matrixAutoUpdate = false;
        this.sun = sun;
        var smaaEffect = new SMAAEffect(assets.get("smaa-search"), assets.get("smaa-area"));
        smaaEffect.colorEdgesMaterial.setEdgeDetectionThreshold(0.065);
        var godRaysEffect = new GodRaysEffect(camera, sun, {
          height: 720,
          kernelSize: KernelSize.SMALL,
          density: 0.96,
          decay: 0.92,
          weight: 0.3,
          exposure: 0.54,
          samples: 60,
          clampMax: 1.0
        });
        godRaysEffect.dithering = true;
        this.effect = godRaysEffect;
        var pass = new EffectPass(camera, smaaEffect, godRaysEffect);
        this.pass = pass;
        this.renderPass.renderToScreen = false;
        pass.renderToScreen = true;
        composer.addPass(pass);
      }
    }, {
      key: "registerOptions",
      value: function registerOptions(menu) {
        var sun = this.sun;
        var light = this.light;
        var pass = this.pass;
        var effect = this.effect;
        var uniforms = effect.godRaysMaterial.uniforms;
        var blendMode = effect.blendMode;
        var params = {
          "resolution": effect.height,
          "blurriness": effect.blurPass.kernelSize + 1,
          "density": uniforms.density.value,
          "decay": uniforms.decay.value,
          "weight": uniforms.weight.value,
          "exposure": uniforms.exposure.value,
          "clampMax": uniforms.clampMax.value,
          "samples": effect.samples,
          "color": sun.material.color.getHex(),
          "opacity": blendMode.opacity.value,
          "blend mode": blendMode.blendFunction
        };
        menu.add(params, "resolution", [240, 360, 480, 720, 1080]).onChange(function () {
          effect.height = Number.parseInt(params.resolution);
        });
        menu.add(effect, "dithering");
        menu.add(params, "blurriness").min(KernelSize.VERY_SMALL).max(KernelSize.HUGE + 1).step(1).onChange(function () {
          effect.blur = params.blurriness > 0;
          effect.blurPass.kernelSize = params.blurriness - 1;
        });
        menu.add(params, "density").min(0.0).max(1.0).step(0.01).onChange(function () {
          uniforms.density.value = params.density;
        });
        menu.add(params, "decay").min(0.0).max(1.0).step(0.01).onChange(function () {
          uniforms.decay.value = params.decay;
        });
        menu.add(params, "weight").min(0.0).max(1.0).step(0.01).onChange(function () {
          uniforms.weight.value = params.weight;
        });
        menu.add(params, "exposure").min(0.0).max(1.0).step(0.01).onChange(function () {
          uniforms.exposure.value = params.exposure;
        });
        menu.add(params, "clampMax").min(0.0).max(1.0).step(0.01).onChange(function () {
          uniforms.clampMax.value = params.clampMax;
        });
        menu.add(effect, "samples").min(15).max(200).step(1);
        menu.addColor(params, "color").onChange(function () {
          sun.material.color.setHex(params.color);
          light.color.setHex(params.color);
        });
        menu.add(params, "opacity").min(0.0).max(1.0).step(0.01).onChange(function () {
          blendMode.opacity.value = params.opacity;
        });
        menu.add(params, "blend mode", BlendFunction).onChange(function () {
          blendMode.blendFunction = Number.parseInt(params["blend mode"]);
          pass.recompile();
        });
      }
    }]);

    return GodRaysDemo;
  }(PostProcessingDemo);

  var mouse = new three.Vector2();

  var OutlineDemo = function (_PostProcessingDemo9) {
    _inherits(OutlineDemo, _PostProcessingDemo9);

    function OutlineDemo(composer) {
      var _this60;

      _classCallCheck(this, OutlineDemo);

      _this60 = _possibleConstructorReturn(this, _getPrototypeOf(OutlineDemo).call(this, "outline", composer));
      _this60.raycaster = null;
      _this60.selectedObject = null;
      _this60.effect = null;
      _this60.pass = null;
      return _this60;
    }

    _createClass(OutlineDemo, [{
      key: "raycast",
      value: function raycast(event) {
        var raycaster = this.raycaster;
        var intersects, x;
        mouse.x = event.clientX / window.innerWidth * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, this.camera);
        intersects = raycaster.intersectObjects(this.scene.children);

        if (this.selectedObject !== null) {
          this.selectedObject = null;
        }

        if (intersects.length > 0) {
          x = intersects[0];

          if (x.object !== undefined) {
            this.selectedObject = x.object;
          } else {
            console.warn("Encountered an undefined object", intersects);
          }
        }
      }
    }, {
      key: "handleSelection",
      value: function handleSelection() {
        var effect = this.effect;
        var selection = effect.selection;
        var selectedObject = this.selectedObject;

        if (selectedObject !== null) {
          if (selection.indexOf(selectedObject) >= 0) {
            effect.deselectObject(selectedObject);
          } else {
            effect.selectObject(selectedObject);
          }
        }
      }
    }, {
      key: "handleEvent",
      value: function handleEvent(event) {
        switch (event.type) {
          case "mousemove":
            this.raycast(event);
            break;

          case "mousedown":
            this.handleSelection();
            break;
        }
      }
    }, {
      key: "load",
      value: function load() {
        var _this61 = this;

        var assets = this.assets;
        var loadingManager = this.loadingManager;
        var textureLoader = new three.TextureLoader(loadingManager);
        var cubeTextureLoader = new three.CubeTextureLoader(loadingManager);
        var path = "textures/skies/sunset/";
        var format = ".png";
        var urls = [path + "px" + format, path + "nx" + format, path + "py" + format, path + "ny" + format, path + "pz" + format, path + "nz" + format];
        return new Promise(function (resolve, reject) {
          if (assets.size === 0) {
            loadingManager.onError = reject;

            loadingManager.onProgress = function (item, loaded, total) {
              if (loaded === total) {
                resolve();
              }
            };

            cubeTextureLoader.load(urls, function (textureCube) {
              assets.set("sky", textureCube);
            });
            textureLoader.load("textures/pattern.png", function (texture) {
              assets.set("pattern-color", texture);
            });

            _this61.loadSMAAImages();
          } else {
            resolve();
          }
        });
      }
    }, {
      key: "initialize",
      value: function initialize() {
        var scene = this.scene;
        var assets = this.assets;
        var composer = this.composer;
        var renderer = composer.renderer;
        var camera = new three.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 2000);
        camera.position.set(-4, 1.25, -5);
        camera.lookAt(scene.position);
        this.camera = camera;
        var controls = new DeltaControls(camera.position, camera.quaternion, renderer.domElement);
        controls.settings.pointer.lock = false;
        controls.settings.translation.enabled = false;
        controls.settings.sensitivity.zoom = 1.0;
        controls.lookAt(scene.position);
        this.controls = controls;
        scene.fog = new three.FogExp2(0x000000, 0.0025);
        renderer.setClearColor(scene.fog.color, 0.0);
        scene.background = assets.get("sky");
        var ambientLight = new three.AmbientLight(0x404040);
        var directionalLight = new three.DirectionalLight(0xffbbaa);
        directionalLight.position.set(1440, 200, 2000);
        directionalLight.target.position.copy(scene.position);
        scene.add(directionalLight);
        scene.add(ambientLight);
        var mesh = new three.Mesh(new three.SphereBufferGeometry(1, 32, 32), new three.MeshPhongMaterial({
          color: 0xffff00
        }));
        mesh.position.set(2, 0, -2);
        scene.add(mesh);
        mesh = new three.Mesh(new three.ConeBufferGeometry(1, 1, 32), new three.MeshPhongMaterial({
          color: 0x00ff00
        }));
        mesh.position.set(-2, 0, 2);
        scene.add(mesh);
        mesh = new three.Mesh(new three.OctahedronBufferGeometry(), new three.MeshPhongMaterial({
          color: 0xff00ff
        }));
        mesh.position.set(2, 0, 2);
        scene.add(mesh);
        mesh = new three.Mesh(new three.BoxBufferGeometry(1, 1, 1), new three.MeshPhongMaterial({
          color: 0x00ffff
        }));
        mesh.position.set(-2, 0, -2);
        scene.add(mesh);
        this.raycaster = new three.Raycaster();
        renderer.domElement.addEventListener("mousemove", this);
        renderer.domElement.addEventListener("mousedown", this);
        var smaaEffect = new SMAAEffect(assets.get("smaa-search"), assets.get("smaa-area"));
        smaaEffect.colorEdgesMaterial.setEdgeDetectionThreshold(0.05);
        var outlineEffect = new OutlineEffect(scene, camera, {
          blendFunction: BlendFunction.SCREEN,
          edgeStrength: 2.5,
          pulseSpeed: 0.0,
          visibleEdgeColor: 0xffffff,
          hiddenEdgeColor: 0x22090a,
          resolutionScale: 1.0,
          height: 480,
          blur: false,
          xRay: true
        });
        outlineEffect.setSelection(scene.children);
        outlineEffect.deselectObject(mesh);
        var smaaPass = new EffectPass(camera, smaaEffect);
        var outlinePass = new EffectPass(camera, outlineEffect);
        this.renderPass.renderToScreen = false;
        smaaPass.renderToScreen = true;
        this.effect = outlineEffect;
        this.pass = outlinePass;
        composer.addPass(outlinePass);
        composer.addPass(smaaPass);
      }
    }, {
      key: "registerOptions",
      value: function registerOptions(menu) {
        var assets = this.assets;
        var pass = this.pass;
        var effect = this.effect;
        var uniforms = effect.uniforms;
        var blendMode = effect.blendMode;
        var params = {
          "resolution": effect.height,
          "blurriness": 0,
          "use pattern": false,
          "pattern scale": 60.0,
          "pulse speed": effect.pulseSpeed,
          "edge strength": uniforms.get("edgeStrength").value,
          "visible edge": uniforms.get("visibleEdgeColor").value.getHex(),
          "hidden edge": uniforms.get("hiddenEdgeColor").value.getHex(),
          "x-ray": true,
          "opacity": blendMode.opacity.value,
          "blend mode": blendMode.blendFunction
        };
        menu.add(params, "resolution", [240, 360, 480, 720, 1080]).onChange(function () {
          effect.height = Number.parseInt(params.resolution);
        });
        menu.add(effect, "dithering");
        menu.add(params, "blurriness").min(KernelSize.VERY_SMALL).max(KernelSize.HUGE + 1).step(1).onChange(function () {
          effect.blur = params.blurriness > 0;
          effect.blurPass.kernelSize = params.blurriness - 1;
        });
        menu.add(params, "use pattern").onChange(function () {
          if (params["use pattern"]) {
            effect.setPatternTexture(assets.get("pattern-color"));
            uniforms.get("patternScale").value = params["pattern scale"];
          } else {
            effect.setPatternTexture(null);
          }

          pass.recompile();
        });
        menu.add(params, "pattern scale").min(20.0).max(100.0).step(0.1).onChange(function () {
          if (uniforms.has("patternScale")) {
            uniforms.get("patternScale").value = params["pattern scale"];
          }
        });
        menu.add(params, "edge strength").min(0.0).max(10.0).step(0.01).onChange(function () {
          uniforms.get("edgeStrength").value = params["edge strength"];
        });
        menu.add(params, "pulse speed").min(0.0).max(2.0).step(0.01).onChange(function () {
          effect.pulseSpeed = params["pulse speed"];
        });
        menu.addColor(params, "visible edge").onChange(function () {
          uniforms.get("visibleEdgeColor").value.setHex(params["visible edge"]);
        });
        menu.addColor(params, "hidden edge").onChange(function () {
          uniforms.get("hiddenEdgeColor").value.setHex(params["hidden edge"]);
        });
        menu.add(effect, "xRay").onChange(function () {
          return pass.recompile();
        });
        menu.add(params, "opacity").min(0.0).max(1.0).step(0.01).onChange(function () {
          blendMode.opacity.value = params.opacity;
        });
        menu.add(params, "blend mode", BlendFunction).onChange(function () {
          blendMode.blendFunction = Number.parseInt(params["blend mode"]);
          pass.recompile();
        });
      }
    }, {
      key: "reset",
      value: function reset() {
        _get(_getPrototypeOf(OutlineDemo.prototype), "reset", this).call(this);

        var dom = this.composer.renderer.domElement;
        dom.removeEventListener("mousemove", this);
        dom.removeEventListener("mousedown", this);
        return this;
      }
    }]);

    return OutlineDemo;
  }(PostProcessingDemo);

  var PatternDemo = function (_PostProcessingDemo10) {
    _inherits(PatternDemo, _PostProcessingDemo10);

    function PatternDemo(composer) {
      var _this62;

      _classCallCheck(this, PatternDemo);

      _this62 = _possibleConstructorReturn(this, _getPrototypeOf(PatternDemo).call(this, "pattern", composer));
      _this62.dotScreenEffect = null;
      _this62.gridEffect = null;
      _this62.scanlineEffect = null;
      _this62.pass = null;
      _this62.object = null;
      return _this62;
    }

    _createClass(PatternDemo, [{
      key: "load",
      value: function load() {
        var assets = this.assets;
        var loadingManager = this.loadingManager;
        var cubeTextureLoader = new three.CubeTextureLoader(loadingManager);
        var path = "textures/skies/space/";
        var format = ".jpg";
        var urls = [path + "px" + format, path + "nx" + format, path + "py" + format, path + "ny" + format, path + "pz" + format, path + "nz" + format];
        return new Promise(function (resolve, reject) {
          if (assets.size === 0) {
            loadingManager.onError = reject;

            loadingManager.onProgress = function (item, loaded, total) {
              if (loaded === total) {
                resolve();
              }
            };

            cubeTextureLoader.load(urls, function (textureCube) {
              assets.set("sky", textureCube);
            });
          } else {
            resolve();
          }
        });
      }
    }, {
      key: "initialize",
      value: function initialize() {
        var scene = this.scene;
        var assets = this.assets;
        var composer = this.composer;
        var renderer = composer.renderer;
        var camera = new three.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 2000);
        camera.position.set(10, 1, 10);
        camera.lookAt(scene.position);
        this.camera = camera;
        var controls = new DeltaControls(camera.position, camera.quaternion, renderer.domElement);
        controls.settings.pointer.lock = false;
        controls.settings.translation.enabled = false;
        controls.settings.sensitivity.zoom = 1.0;
        controls.lookAt(scene.position);
        this.controls = controls;
        scene.fog = new three.FogExp2(0x000000, 0.0025);
        renderer.setClearColor(scene.fog.color);
        scene.background = assets.get("sky");
        var ambientLight = new three.AmbientLight(0x666666);
        var directionalLight = new three.DirectionalLight(0xffbbaa);
        directionalLight.position.set(-1, 1, 1);
        directionalLight.target.position.copy(scene.position);
        scene.add(directionalLight);
        scene.add(ambientLight);
        var object = new three.Object3D();
        var geometry = new three.SphereBufferGeometry(1, 4, 4);
        var material, mesh;
        var i;

        for (i = 0; i < 100; ++i) {
          material = new three.MeshPhongMaterial({
            color: 0xffffff * Math.random(),
            flatShading: true
          });
          mesh = new three.Mesh(geometry, material);
          mesh.position.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
          mesh.position.multiplyScalar(Math.random() * 10);
          mesh.rotation.set(Math.random() * 2, Math.random() * 2, Math.random() * 2);
          mesh.scale.multiplyScalar(Math.random());
          object.add(mesh);
        }

        this.object = object;
        scene.add(object);
        var dotScreenEffect = new DotScreenEffect({
          blendFunction: BlendFunction.OVERLAY,
          scale: 0.9,
          angle: Math.PI * 0.58
        });
        var gridEffect = new GridEffect({
          blendFunction: BlendFunction.SKIP,
          scale: 1.75,
          lineWidth: 0.25
        });
        var scanlineEffect = new ScanlineEffect({
          blendFunction: BlendFunction.SKIP,
          density: 1.5
        });
        var pass = new EffectPass(camera, dotScreenEffect, gridEffect, scanlineEffect);
        this.dotScreenEffect = dotScreenEffect;
        this.gridEffect = gridEffect;
        this.scanlineEffect = scanlineEffect;
        this.pass = pass;
        this.renderPass.renderToScreen = false;
        pass.renderToScreen = true;
        composer.addPass(pass);
      }
    }, {
      key: "render",
      value: function render(delta) {
        var object = this.object;
        var twoPI = 2.0 * Math.PI;
        object.rotation.x += 0.0005;
        object.rotation.y += 0.001;

        if (object.rotation.x >= twoPI) {
          object.rotation.x -= twoPI;
        }

        if (object.rotation.y >= twoPI) {
          object.rotation.y -= twoPI;
        }

        _get(_getPrototypeOf(PatternDemo.prototype), "render", this).call(this, delta);
      }
    }, {
      key: "registerOptions",
      value: function registerOptions(menu) {
        var pass = this.pass;
        var dotScreenEffect = this.dotScreenEffect;
        var gridEffect = this.gridEffect;
        var scanlineEffect = this.scanlineEffect;
        var params = {
          dotScreen: {
            "angle": Math.PI * 0.58,
            "scale": dotScreenEffect.uniforms.get("scale").value,
            "opacity": dotScreenEffect.blendMode.opacity.value,
            "blend mode": dotScreenEffect.blendMode.blendFunction
          },
          grid: {
            "scale": gridEffect.getScale(),
            "line width": gridEffect.getLineWidth(),
            "opacity": gridEffect.blendMode.opacity.value,
            "blend mode": gridEffect.blendMode.blendFunction
          },
          scanline: {
            "density": scanlineEffect.getDensity(),
            "opacity": scanlineEffect.blendMode.opacity.value,
            "blend mode": scanlineEffect.blendMode.blendFunction
          }
        };
        var folder = menu.addFolder("Dot Screen");
        folder.add(params.dotScreen, "angle").min(0.0).max(Math.PI).step(0.001).onChange(function () {
          dotScreenEffect.setAngle(params.dotScreen.angle);
        });
        folder.add(params.dotScreen, "scale").min(0.0).max(1.0).step(0.01).onChange(function () {
          dotScreenEffect.uniforms.get("scale").value = params.dotScreen.scale;
        });
        folder.add(params.dotScreen, "opacity").min(0.0).max(1.0).step(0.01).onChange(function () {
          dotScreenEffect.blendMode.opacity.value = params.dotScreen.opacity;
        });
        folder.add(params.dotScreen, "blend mode", BlendFunction).onChange(function () {
          dotScreenEffect.blendMode.blendFunction = Number.parseInt(params.dotScreen["blend mode"]);
          pass.recompile();
        });
        folder.open();
        folder = menu.addFolder("Grid");
        folder.add(params.grid, "scale").min(0.01).max(3.0).step(0.01).onChange(function () {
          gridEffect.setScale(params.grid.scale);
        });
        folder.add(params.grid, "line width").min(0.0).max(1.0).step(0.01).onChange(function () {
          gridEffect.setLineWidth(params.grid["line width"]);
        });
        folder.add(params.grid, "opacity").min(0.0).max(1.0).step(0.01).onChange(function () {
          gridEffect.blendMode.opacity.value = params.grid.opacity;
        });
        folder.add(params.grid, "blend mode", BlendFunction).onChange(function () {
          gridEffect.blendMode.blendFunction = Number.parseInt(params.grid["blend mode"]);
          pass.recompile();
        });
        folder.open();
        folder = menu.addFolder("Scanline");
        folder.add(params.scanline, "density").min(0.001).max(2.0).step(0.001).onChange(function () {
          scanlineEffect.setDensity(params.scanline.density);
        });
        folder.add(params.scanline, "opacity").min(0.0).max(1.0).step(0.01).onChange(function () {
          scanlineEffect.blendMode.opacity.value = params.scanline.opacity;
        });
        folder.add(params.scanline, "blend mode", BlendFunction).onChange(function () {
          scanlineEffect.blendMode.blendFunction = Number.parseInt(params.scanline["blend mode"]);
          pass.recompile();
        });
        folder.open();
      }
    }]);

    return PatternDemo;
  }(PostProcessingDemo);

  var PixelationDemo = function (_PostProcessingDemo11) {
    _inherits(PixelationDemo, _PostProcessingDemo11);

    function PixelationDemo(composer) {
      var _this63;

      _classCallCheck(this, PixelationDemo);

      _this63 = _possibleConstructorReturn(this, _getPrototypeOf(PixelationDemo).call(this, "pixelation", composer));
      _this63.effect = null;
      _this63.object = null;
      _this63.maskPass = null;
      _this63.maskObject = null;
      return _this63;
    }

    _createClass(PixelationDemo, [{
      key: "load",
      value: function load() {
        var _this64 = this;

        var assets = this.assets;
        var loadingManager = this.loadingManager;
        var cubeTextureLoader = new three.CubeTextureLoader(loadingManager);
        var path = "textures/skies/space/";
        var format = ".jpg";
        var urls = [path + "px" + format, path + "nx" + format, path + "py" + format, path + "ny" + format, path + "pz" + format, path + "nz" + format];
        return new Promise(function (resolve, reject) {
          if (assets.size === 0) {
            loadingManager.onError = reject;

            loadingManager.onProgress = function (item, loaded, total) {
              if (loaded === total) {
                resolve();
              }
            };

            cubeTextureLoader.load(urls, function (textureCube) {
              assets.set("sky", textureCube);
            });

            _this64.loadSMAAImages();
          } else {
            resolve();
          }
        });
      }
    }, {
      key: "initialize",
      value: function initialize() {
        var scene = this.scene;
        var assets = this.assets;
        var composer = this.composer;
        var renderer = composer.renderer;
        var camera = new three.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 2000);
        camera.position.set(10, 1, 10);
        camera.lookAt(scene.position);
        this.camera = camera;
        var controls = new DeltaControls(camera.position, camera.quaternion, renderer.domElement);
        controls.settings.pointer.lock = false;
        controls.settings.translation.enabled = false;
        controls.settings.sensitivity.zoom = 1.0;
        controls.lookAt(scene.position);
        this.controls = controls;
        scene.fog = new three.FogExp2(0x000000, 0.0025);
        renderer.setClearColor(scene.fog.color);
        scene.background = assets.get("sky");
        var ambientLight = new three.AmbientLight(0x666666);
        var directionalLight = new three.DirectionalLight(0xffbbaa);
        directionalLight.position.set(-1, 1, 1);
        directionalLight.target.position.copy(scene.position);
        scene.add(directionalLight);
        scene.add(ambientLight);
        var object = new three.Object3D();
        var geometry = new three.SphereBufferGeometry(1, 4, 4);
        var material, mesh;
        var i;

        for (i = 0; i < 100; ++i) {
          material = new three.MeshPhongMaterial({
            color: 0xffffff * Math.random(),
            flatShading: true
          });
          mesh = new three.Mesh(geometry, material);
          mesh.position.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
          mesh.position.multiplyScalar(Math.random() * 10);
          mesh.rotation.set(Math.random() * 2, Math.random() * 2, Math.random() * 2);
          mesh.scale.multiplyScalar(Math.random());
          object.add(mesh);
        }

        this.object = object;
        scene.add(object);
        var maskScene = new three.Scene();
        mesh = new three.Mesh(new three.BoxBufferGeometry(4, 4, 4));
        this.maskObject = mesh;
        maskScene.add(mesh);
        var smaaEffect = new SMAAEffect(assets.get("smaa-search"), assets.get("smaa-area"));
        var pixelationEffect = new PixelationEffect(5.0);
        var effectPass = new EffectPass(camera, pixelationEffect);
        var maskPass = new MaskPass(maskScene, camera);
        var smaaPass = new EffectPass(camera, smaaEffect);
        this.renderPass.renderToScreen = false;
        smaaPass.renderToScreen = true;
        composer.addPass(maskPass);
        composer.addPass(effectPass);
        composer.addPass(new ClearMaskPass());
        composer.addPass(smaaPass);
        this.effect = pixelationEffect;
        this.maskPass = maskPass;
      }
    }, {
      key: "render",
      value: function render(delta) {
        var object = this.object;
        var maskObject = this.maskObject;
        var twoPI = 2.0 * Math.PI;
        var time = performance.now() * 0.001;
        object.rotation.x += 0.001;
        object.rotation.y += 0.005;

        if (object.rotation.x >= twoPI) {
          object.rotation.x -= twoPI;
        }

        if (object.rotation.y >= twoPI) {
          object.rotation.y -= twoPI;
        }

        maskObject.position.x = Math.cos(time / 1.5) * 4;
        maskObject.position.y = Math.sin(time) * 4;
        maskObject.rotation.x = time;
        maskObject.rotation.y = time * 0.5;

        _get(_getPrototypeOf(PixelationDemo.prototype), "render", this).call(this, delta);
      }
    }, {
      key: "registerOptions",
      value: function registerOptions(menu) {
        var effect = this.effect;
        var maskPass = this.maskPass;
        var params = {
          "use mask": maskPass.enabled,
          "granularity": effect.getGranularity()
        };
        menu.add(params, "granularity").min(0.0).max(50.0).step(0.1).onChange(function () {
          effect.setGranularity(params.granularity);
        });
        menu.add(params, "use mask").onChange(function () {
          maskPass.enabled = params["use mask"];
        });
      }
    }]);

    return PixelationDemo;
  }(PostProcessingDemo);

  var ShockWaveDemo = function (_PostProcessingDemo12) {
    _inherits(ShockWaveDemo, _PostProcessingDemo12);

    function ShockWaveDemo(composer) {
      var _this65;

      _classCallCheck(this, ShockWaveDemo);

      _this65 = _possibleConstructorReturn(this, _getPrototypeOf(ShockWaveDemo).call(this, "shock-wave", composer));
      _this65.effect = null;
      return _this65;
    }

    _createClass(ShockWaveDemo, [{
      key: "load",
      value: function load() {
        var _this66 = this;

        var assets = this.assets;
        var loadingManager = this.loadingManager;
        var cubeTextureLoader = new three.CubeTextureLoader(loadingManager);
        var path = "textures/skies/space3/";
        var format = ".jpg";
        var urls = [path + "px" + format, path + "nx" + format, path + "py" + format, path + "ny" + format, path + "pz" + format, path + "nz" + format];
        return new Promise(function (resolve, reject) {
          if (assets.size === 0) {
            loadingManager.onError = reject;

            loadingManager.onProgress = function (item, loaded, total) {
              if (loaded === total) {
                resolve();
              }
            };

            cubeTextureLoader.load(urls, function (textureCube) {
              assets.set("sky", textureCube);
            });

            _this66.loadSMAAImages();
          } else {
            resolve();
          }
        });
      }
    }, {
      key: "initialize",
      value: function initialize() {
        var scene = this.scene;
        var assets = this.assets;
        var composer = this.composer;
        var renderer = composer.renderer;
        var camera = new three.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 2000);
        camera.position.set(5, 1, 5);
        camera.lookAt(scene.position);
        this.camera = camera;
        var controls = new DeltaControls(camera.position, camera.quaternion, renderer.domElement);
        controls.settings.pointer.lock = false;
        controls.settings.translation.enabled = false;
        controls.settings.sensitivity.zoom = 1.0;
        controls.lookAt(scene.position);
        this.controls = controls;
        scene.fog = new three.FogExp2(0x000000, 0.0025);
        renderer.setClearColor(scene.fog.color);
        scene.background = assets.get("sky");
        var ambientLight = new three.AmbientLight(0x666666);
        var directionalLight = new three.DirectionalLight(0xffbbaa);
        directionalLight.position.set(-1, 1, 1);
        directionalLight.target.position.copy(scene.position);
        scene.add(directionalLight);
        scene.add(ambientLight);
        var geometry = new three.SphereBufferGeometry(1, 64, 64);
        var material = new three.MeshBasicMaterial({
          color: 0xffff00,
          envMap: assets.get("sky")
        });
        var mesh = new three.Mesh(geometry, material);
        scene.add(mesh);
        var smaaEffect = new SMAAEffect(assets.get("smaa-search"), assets.get("smaa-area"));
        var shockWaveEffect = new ShockWaveEffect(camera, mesh.position, {
          speed: 1.25,
          maxRadius: 0.5,
          waveSize: 0.2,
          amplitude: 0.05
        });
        var effectPass = new EffectPass(camera, shockWaveEffect);
        var smaaPass = new EffectPass(camera, smaaEffect);
        this.renderPass.renderToScreen = false;
        smaaPass.renderToScreen = true;
        this.effect = shockWaveEffect;
        composer.addPass(effectPass);
        composer.addPass(smaaPass);
      }
    }, {
      key: "registerOptions",
      value: function registerOptions(menu) {
        var effect = this.effect;
        var uniforms = effect.uniforms;
        var params = {
          "size": uniforms.get("size").value,
          "extent": uniforms.get("maxRadius").value,
          "waveSize": uniforms.get("waveSize").value,
          "amplitude": uniforms.get("amplitude").value
        };
        menu.add(effect, "speed").min(0.0).max(10.0).step(0.001);
        menu.add(params, "size").min(0.01).max(2.0).step(0.001).onChange(function () {
          uniforms.get("size").value = params.size;
        });
        menu.add(params, "extent").min(0.0).max(10.0).step(0.001).onChange(function () {
          uniforms.get("maxRadius").value = params.extent;
        });
        menu.add(params, "waveSize").min(0.0).max(2.0).step(0.001).onChange(function () {
          uniforms.get("waveSize").value = params.waveSize;
        });
        menu.add(params, "amplitude").min(0.0).max(0.25).step(0.001).onChange(function () {
          uniforms.get("amplitude").value = params.amplitude;
        });
        menu.add(effect, "explode");
      }
    }]);

    return ShockWaveDemo;
  }(PostProcessingDemo);

  var SMAADemo = function (_PostProcessingDemo13) {
    _inherits(SMAADemo, _PostProcessingDemo13);

    function SMAADemo(composer) {
      var _this67;

      _classCallCheck(this, SMAADemo);

      _this67 = _possibleConstructorReturn(this, _getPrototypeOf(SMAADemo).call(this, "smaa", composer));
      _this67.originalRenderer = null;
      _this67.rendererAA = null;
      _this67.controls2 = null;
      _this67.smaaEffect = null;
      _this67.pass = null;
      _this67.edgesTextureEffect = null;
      _this67.weightsTextureEffect = null;
      _this67.objectA = null;
      _this67.objectB = null;
      _this67.objectC = null;
      return _this67;
    }

    _createClass(SMAADemo, [{
      key: "load",
      value: function load() {
        var _this68 = this;

        var maxAnisotropy = this.composer.renderer.capabilities.getMaxAnisotropy();
        var assets = this.assets;
        var loadingManager = this.loadingManager;
        var textureLoader = new three.TextureLoader(loadingManager);
        var cubeTextureLoader = new three.CubeTextureLoader(loadingManager);
        var path = "textures/skies/sunset/";
        var format = ".png";
        var urls = [path + "px" + format, path + "nx" + format, path + "py" + format, path + "ny" + format, path + "pz" + format, path + "nz" + format];
        return new Promise(function (resolve, reject) {
          if (assets.size === 0) {
            loadingManager.onError = reject;

            loadingManager.onProgress = function (item, loaded, total) {
              if (loaded === total) {
                resolve();
              }
            };

            cubeTextureLoader.load(urls, function (textureCube) {
              assets.set("sky", textureCube);
            });
            textureLoader.load("textures/crate.jpg", function (texture) {
              texture.wrapS = texture.wrapT = three.RepeatWrapping;
              texture.anisotropy = Math.min(4, maxAnisotropy);
              assets.set("crate-color", texture);
            });

            _this68.loadSMAAImages();
          } else {
            resolve();
          }
        });
      }
    }, {
      key: "initialize",
      value: function initialize() {
        var scene = this.scene;
        var assets = this.assets;
        var composer = this.composer;
        var renderer = composer.renderer;
        var camera = new three.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 2000);
        camera.position.set(-3, 0, -3);
        camera.lookAt(scene.position);
        this.camera = camera;
        scene.fog = new three.FogExp2(0x000000, 0.0025);
        renderer.setClearColor(scene.fog.color);

        var rendererAA = function (size, clearColor, pixelRatio) {
          var renderer = new three.WebGLRenderer({
            logarithmicDepthBuffer: true,
            antialias: true
          });
          renderer.setSize(size.width, size.height);
          renderer.setClearColor(clearColor);
          renderer.setPixelRatio(pixelRatio);
          return renderer;
        }(renderer.getSize(new three.Vector2()), renderer.getClearColor(), renderer.getPixelRatio());

        this.originalRenderer = composer.renderer;
        this.rendererAA = rendererAA;
        var controls = new DeltaControls(camera.position, camera.quaternion, renderer.domElement);
        controls.settings.pointer.lock = false;
        controls.settings.translation.enabled = false;
        controls.settings.sensitivity.zoom = 1.0;
        controls.lookAt(scene.position);
        this.controls = controls;
        var controls2 = controls.clone();
        controls2.setDom(rendererAA.domElement);
        controls2.setEnabled(false);
        this.controls2 = controls2;
        scene.background = assets.get("sky");
        var ambientLight = new three.AmbientLight(0x666666);
        var directionalLight = new three.DirectionalLight(0xffbbaa);
        directionalLight.position.set(1440, 200, 2000);
        directionalLight.target.position.copy(scene.position);
        scene.add(directionalLight);
        scene.add(ambientLight);
        var mesh = new three.Mesh(new three.BoxBufferGeometry(1, 1, 1), new three.MeshBasicMaterial({
          color: 0x000000,
          wireframe: true
        }));
        mesh.position.set(1.25, 0, -1.25);
        this.objectA = mesh;
        scene.add(mesh);
        mesh = new three.Mesh(new three.BoxBufferGeometry(1, 1, 1), new three.MeshPhongMaterial({
          map: assets.get("crate-color")
        }));
        mesh.position.set(-1.25, 0, 1.25);
        this.objectB = mesh;
        scene.add(mesh);
        mesh = new three.Mesh(new three.BoxBufferGeometry(0.25, 8.25, 0.25), new three.MeshPhongMaterial({
          color: 0x0d0d0d
        }));
        var object = new three.Object3D();
        var o0, o1, o2;
        o0 = object.clone();
        var clone = mesh.clone();
        clone.position.set(-4, 0, 4);
        o0.add(clone);
        clone = mesh.clone();
        clone.position.set(4, 0, 4);
        o0.add(clone);
        clone = mesh.clone();
        clone.position.set(-4, 0, -4);
        o0.add(clone);
        clone = mesh.clone();
        clone.position.set(4, 0, -4);
        o0.add(clone);
        o1 = o0.clone();
        o1.rotation.set(Math.PI / 2, 0, 0);
        o2 = o0.clone();
        o2.rotation.set(0, 0, Math.PI / 2);
        object.add(o0);
        object.add(o1);
        object.add(o2);
        object.scale.set(0.1, 0.1, 0.1);
        this.objectC = object;
        scene.add(object);
        var smaaEffect = new SMAAEffect(assets.get("smaa-search"), assets.get("smaa-area"));
        var edgesTextureEffect = new TextureEffect({
          blendFunction: BlendFunction.SKIP,
          texture: smaaEffect.renderTargetColorEdges.texture
        });
        var weightsTextureEffect = new TextureEffect({
          blendFunction: BlendFunction.SKIP,
          texture: smaaEffect.renderTargetWeights.texture
        });
        var pass = new EffectPass(camera, smaaEffect, edgesTextureEffect, weightsTextureEffect);
        this.renderPass.renderToScreen = false;
        pass.renderToScreen = true;
        this.smaaEffect = smaaEffect;
        this.edgesTextureEffect = edgesTextureEffect;
        this.weightsTextureEffect = weightsTextureEffect;
        this.pass = pass;
        composer.addPass(pass);
      }
    }, {
      key: "render",
      value: function render(delta) {
        var objectA = this.objectA;
        var objectB = this.objectB;
        var objectC = this.objectC;
        var twoPI = 2.0 * Math.PI;
        objectA.rotation.x += 0.0005;
        objectA.rotation.y += 0.001;
        objectB.rotation.copy(objectA.rotation);
        objectC.rotation.copy(objectA.rotation);

        if (objectA.rotation.x >= twoPI) {
          objectA.rotation.x -= twoPI;
        }

        if (objectA.rotation.y >= twoPI) {
          objectA.rotation.y -= twoPI;
        }

        _get(_getPrototypeOf(SMAADemo.prototype), "render", this).call(this, delta);
      }
    }, {
      key: "registerOptions",
      value: function registerOptions(menu) {
        var pass = this.pass;
        var composer = this.composer;
        var renderPass = this.renderPass;
        var smaaEffect = this.smaaEffect;
        var edgesTextureEffect = this.edgesTextureEffect;
        var weightsTextureEffect = this.weightsTextureEffect;
        var blendMode = smaaEffect.blendMode;
        var colorEdgesMaterial = smaaEffect.colorEdgesMaterial;
        var renderer1 = this.originalRenderer;
        var renderer2 = this.rendererAA;
        var controls1 = this.controls;
        var controls2 = this.controls2;
        var AAMode = {
          DISABLED: 0,
          BROWSER: 1,
          SMAA_EDGES: 2,
          SMAA_WEIGHTS: 3,
          SMAA: 4
        };
        var params = {
          "AA mode": AAMode.SMAA,
          "preset": SMAAPreset.HIGH,
          "contrast factor": Number.parseFloat(colorEdgesMaterial.defines.LOCAL_CONTRAST_ADAPTATION_FACTOR),
          "opacity": blendMode.opacity.value,
          "blend mode": blendMode.blendFunction
        };

        function swapRenderers(browser) {
          var size = composer.renderer.getSize(new three.Vector2());

          if (browser && composer.renderer !== renderer2) {
            renderer2.setSize(size.width, size.height);
            composer.replaceRenderer(renderer2);
            controls1.setEnabled(false);
            controls2.setEnabled(true).lookAt(controls1.getTarget());
          } else {
            renderer1.setSize(size.width, size.height);
            composer.replaceRenderer(renderer1);
            controls1.setEnabled(true).lookAt(controls2.getTarget());
            controls2.setEnabled(false);
          }
        }

        function toggleAAMode() {
          var mode = Number.parseInt(params["AA mode"]);
          pass.enabled = mode === AAMode.SMAA || mode === AAMode.SMAA_EDGES || mode === AAMode.SMAA_WEIGHTS;
          renderPass.renderToScreen = mode === AAMode.DISABLED || mode === AAMode.BROWSER;
          edgesTextureEffect.blendMode.blendFunction = mode === AAMode.SMAA_EDGES ? BlendFunction.NORMAL : BlendFunction.SKIP;
          weightsTextureEffect.blendMode.blendFunction = mode === AAMode.SMAA_WEIGHTS ? BlendFunction.NORMAL : BlendFunction.SKIP;
          swapRenderers(mode === AAMode.BROWSER);
          pass.recompile();
        }

        menu.add(params, "AA mode", AAMode).onChange(toggleAAMode);
        menu.add(params, "preset", SMAAPreset).onChange(function () {
          smaaEffect.applyPreset(Number.parseInt(params.preset));
        });
        menu.add(params, "contrast factor").min(1.0).max(3.0).step(0.01).onChange(function () {
          colorEdgesMaterial.setLocalContrastAdaptationFactor(Number.parseFloat(params["contrast factor"]));
        });
        menu.add(params, "opacity").min(0.0).max(1.0).step(0.01).onChange(function () {
          blendMode.opacity.value = params.opacity;
        });
        menu.add(params, "blend mode", BlendFunction).onChange(function () {
          blendMode.blendFunction = Number.parseInt(params["blend mode"]);
          pass.recompile();
        });
      }
    }, {
      key: "reset",
      value: function reset() {
        _get(_getPrototypeOf(SMAADemo.prototype), "reset", this).call(this);

        if (this.rendererAA !== null) {
          this.rendererAA.dispose();
          this.rendererAA = null;
        }

        if (this.controls2 !== null) {
          this.controls2.dispose();
          this.controls2 = null;
        }
      }
    }]);

    return SMAADemo;
  }(PostProcessingDemo);

  var SSAODemo = function (_PostProcessingDemo14) {
    _inherits(SSAODemo, _PostProcessingDemo14);

    function SSAODemo(composer) {
      var _this69;

      _classCallCheck(this, SSAODemo);

      _this69 = _possibleConstructorReturn(this, _getPrototypeOf(SSAODemo).call(this, "ssao", composer));
      _this69.renderer = null;
      _this69.effect = null;
      _this69.effectPass = null;
      _this69.normalPass = null;
      return _this69;
    }

    _createClass(SSAODemo, [{
      key: "load",
      value: function load() {
        var _this70 = this;

        var assets = this.assets;
        var loadingManager = this.loadingManager;
        var cubeTextureLoader = new three.CubeTextureLoader(loadingManager);
        var path = "textures/skies/starry/";
        var format = ".png";
        var urls = [path + "px" + format, path + "nx" + format, path + "py" + format, path + "ny" + format, path + "pz" + format, path + "nz" + format];
        return new Promise(function (resolve, reject) {
          if (assets.size === 0) {
            loadingManager.onError = reject;

            loadingManager.onProgress = function (item, loaded, total) {
              if (loaded === total) {
                resolve();
              }
            };

            cubeTextureLoader.load(urls, function (textureCube) {
              assets.set("sky", textureCube);
            });

            _this70.loadSMAAImages();
          } else {
            resolve();
          }
        });
      }
    }, {
      key: "initialize",
      value: function initialize() {
        var scene = this.scene;
        var assets = this.assets;
        var composer = this.composer;

        var renderer = function (renderer) {
          var size = renderer.getSize(new three.Vector2());
          var pixelRatio = renderer.getPixelRatio();
          renderer = new three.WebGLRenderer({
            logarithmicDepthBuffer: true,
            antialias: false
          });
          renderer.setSize(size.width, size.height);
          renderer.setPixelRatio(pixelRatio);
          renderer.shadowMap.enabled = true;
          return renderer;
        }(composer.renderer);

        composer.replaceRenderer(renderer);
        this.renderer = renderer;
        var camera = new three.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.3, 1000);
        camera.position.set(0, 0, 30);
        camera.lookAt(scene.position);
        this.camera = camera;
        var controls = new DeltaControls(camera.position, camera.quaternion, renderer.domElement);
        controls.settings.pointer.lock = false;
        controls.settings.translation.enabled = false;
        controls.settings.sensitivity.zoom = 1.0;
        controls.lookAt(scene.position);
        this.controls = controls;
        scene.fog = new three.FogExp2(0x000000, 0.0025);
        renderer.setClearColor(scene.fog.color);
        scene.background = assets.get("sky");
        var ambientLight = new three.AmbientLight(0x544121);
        var lightCeiling = new three.PointLight(0xffe3b1, 1.0, 25);
        lightCeiling.position.set(0, 9.3, 0);
        lightCeiling.castShadow = true;
        lightCeiling.shadow.mapSize.width = 1024;
        lightCeiling.shadow.mapSize.height = 1024;
        lightCeiling.shadow.bias = 1e-4;
        lightCeiling.shadow.radius = 4;
        var lightRed = new three.DirectionalLight(0xff0000, 0.1);
        lightRed.position.set(-10, 0, 0);
        lightRed.target.position.copy(scene.position);
        var lightGreen = new three.DirectionalLight(0x00ff00, 0.1);
        lightGreen.position.set(10, 0, 0);
        lightGreen.target.position.copy(scene.position);
        scene.add(lightCeiling);
        scene.add(lightRed);
        scene.add(lightGreen);
        scene.add(ambientLight);
        var environment = new three.Group();
        var actors = new three.Group();
        var shininess = 5;
        var planeGeometry = new three.PlaneBufferGeometry();
        var planeMaterial = new three.MeshPhongMaterial({
          color: 0xffffff,
          shininess: shininess
        });
        var plane00 = new three.Mesh(planeGeometry, planeMaterial);
        var plane01 = new three.Mesh(planeGeometry, planeMaterial);
        var plane02 = new three.Mesh(planeGeometry, planeMaterial);
        var plane03 = new three.Mesh(planeGeometry, planeMaterial);
        var plane04 = new three.Mesh(planeGeometry, planeMaterial);
        plane00.position.y = -10;
        plane00.rotation.x = Math.PI * 0.5;
        plane00.scale.set(20, 20, 1);
        plane01.position.y = -10;
        plane01.rotation.x = Math.PI * -0.5;
        plane01.scale.set(20, 20, 1);
        plane01.receiveShadow = true;
        plane02.position.y = 10;
        plane02.rotation.x = Math.PI * 0.5;
        plane02.scale.set(20, 20, 1);
        plane02.receiveShadow = true;
        plane03.position.z = -10;
        plane03.scale.set(20, 20, 1);
        plane03.receiveShadow = true;
        plane04.position.z = 10;
        plane04.rotation.y = Math.PI;
        plane04.scale.set(20, 20, 1);
        plane04.receiveShadow = true;
        var plane05 = new three.Mesh(planeGeometry, new three.MeshPhongMaterial({
          color: 0xff0000,
          shininess: shininess
        }));
        var plane06 = new three.Mesh(planeGeometry, new three.MeshPhongMaterial({
          color: 0x00ff00,
          shininess: shininess
        }));
        var plane07 = new three.Mesh(planeGeometry, new three.MeshPhongMaterial({
          color: 0xffffff,
          emissive: 0xffffff,
          shininess: shininess
        }));
        plane05.position.x = -10;
        plane05.rotation.y = Math.PI * 0.5;
        plane05.scale.set(20, 20, 1);
        plane05.receiveShadow = true;
        plane06.position.x = 10;
        plane06.rotation.y = Math.PI * -0.5;
        plane06.scale.set(20, 20, 1);
        plane06.receiveShadow = true;
        plane07.position.y = 10 - 1e-2;
        plane07.rotation.x = Math.PI * 0.5;
        plane07.scale.set(4, 4, 1);
        var actorMaterial = new three.MeshPhongMaterial({
          color: 0xffffff,
          shininess: shininess
        });
        var box01 = new three.Mesh(new three.BoxBufferGeometry(1, 1, 1), actorMaterial);
        var box02 = new three.Mesh(new three.BoxBufferGeometry(1, 1, 1), actorMaterial);
        box01.position.set(-3.5, -4, -3);
        box01.rotation.y = Math.PI * 0.1;
        box01.scale.set(6, 12, 6);
        box01.castShadow = true;
        box02.position.set(3.5, -7, 3);
        box02.rotation.y = Math.PI * -0.1;
        box02.scale.set(6, 6, 6);
        box02.castShadow = true;
        environment.add(plane00, plane01, plane02, plane03, plane04, plane05, plane06, plane07);
        actors.add(box01, box02);
        scene.add(environment, actors);
        var normalPass = new NormalPass(scene, camera, {
          resolutionScale: 1.0
        });
        var smaaEffect = new SMAAEffect(assets.get("smaa-search"), assets.get("smaa-area"));
        var ssaoEffect = new SSAOEffect(camera, normalPass.renderTarget.texture, {
          blendFunction: BlendFunction.MULTIPLY,
          samples: 11,
          rings: 4,
          distanceThreshold: 0.6,
          distanceFalloff: 0.1,
          rangeThreshold: 0.0015,
          rangeFalloff: 0.01,
          luminanceInfluence: 0.7,
          radius: 18.25,
          scale: 1.0,
          bias: 0.5
        });
        ssaoEffect.blendMode.opacity.value = 1.5;
        var effectPass = new EffectPass(camera, smaaEffect, ssaoEffect);
        this.renderPass.renderToScreen = false;
        effectPass.renderToScreen = true;
        this.effect = ssaoEffect;
        this.effectPass = effectPass;
        this.normalPass = normalPass;
        composer.addPass(normalPass);
        composer.addPass(effectPass);
      }
    }, {
      key: "registerOptions",
      value: function registerOptions(menu) {
        var effectPass = this.effectPass;
        var effect = this.effect;
        var blendMode = effect.blendMode;
        var uniforms = effect.uniforms;
        var params = {
          "distance": {
            "threshold": uniforms.get("distanceCutoff").value.x,
            "falloff": uniforms.get("distanceCutoff").value.y - uniforms.get("distanceCutoff").value.x
          },
          "proximity": {
            "threshold": uniforms.get("proximityCutoff").value.x,
            "falloff": uniforms.get("proximityCutoff").value.y - uniforms.get("proximityCutoff").value.x
          },
          "lum influence": uniforms.get("luminanceInfluence").value,
          "scale": uniforms.get("scale").value,
          "bias": uniforms.get("bias").value,
          "opacity": blendMode.opacity.value,
          "blend mode": blendMode.blendFunction
        };
        menu.add(effect, "samples").min(1).max(32).step(1).onChange(function () {
          return effectPass.recompile();
        });
        menu.add(effect, "rings").min(1).max(16).step(1).onChange(function () {
          return effectPass.recompile();
        });
        menu.add(effect, "radius").min(0.01).max(50.0).step(0.01);
        menu.add(params, "lum influence").min(0.0).max(1.0).step(0.001).onChange(function () {
          uniforms.get("luminanceInfluence").value = params["lum influence"];
        });
        var f = menu.addFolder("Distance Cutoff");
        f.add(params.distance, "threshold").min(0.0).max(1.0).step(0.001).onChange(function () {
          effect.setDistanceCutoff(params.distance.threshold, params.distance.falloff);
        });
        f.add(params.distance, "falloff").min(0.0).max(1.0).step(0.001).onChange(function () {
          effect.setDistanceCutoff(params.distance.threshold, params.distance.falloff);
        });
        f = menu.addFolder("Proximity Cutoff");
        f.add(params.proximity, "threshold").min(0.0).max(0.05).step(0.0001).onChange(function () {
          effect.setProximityCutoff(params.proximity.threshold, params.proximity.falloff);
        });
        f.add(params.proximity, "falloff").min(0.0).max(0.1).step(0.0001).onChange(function () {
          effect.setProximityCutoff(params.proximity.threshold, params.proximity.falloff);
        });
        menu.add(params, "bias").min(-1.0).max(1.0).step(0.001).onChange(function () {
          uniforms.get("bias").value = params.bias;
        });
        menu.add(params, "scale").min(0.0).max(2.0).step(0.001).onChange(function () {
          uniforms.get("scale").value = params.scale;
        });
        menu.add(params, "opacity").min(0.0).max(3.0).step(0.01).onChange(function () {
          blendMode.opacity.value = params.opacity;
        });
        menu.add(params, "blend mode", BlendFunction).onChange(function () {
          blendMode.blendFunction = Number.parseInt(params["blend mode"]);
          effectPass.recompile();
        });
      }
    }, {
      key: "reset",
      value: function reset() {
        _get(_getPrototypeOf(SSAODemo.prototype), "reset", this).call(this);

        this.renderer.dispose();
      }
    }]);

    return SSAODemo;
  }(PostProcessingDemo);

  var TextureDemo = function (_PostProcessingDemo15) {
    _inherits(TextureDemo, _PostProcessingDemo15);

    function TextureDemo(composer) {
      var _this71;

      _classCallCheck(this, TextureDemo);

      _this71 = _possibleConstructorReturn(this, _getPrototypeOf(TextureDemo).call(this, "texture", composer));
      _this71.effect = null;
      _this71.pass = null;
      return _this71;
    }

    _createClass(TextureDemo, [{
      key: "load",
      value: function load() {
        var _this72 = this;

        var assets = this.assets;
        var loadingManager = this.loadingManager;
        var textureLoader = new three.TextureLoader(loadingManager);
        var cubeTextureLoader = new three.CubeTextureLoader(loadingManager);
        var path = "textures/skies/sunset/";
        var format = ".png";
        var urls = [path + "px" + format, path + "nx" + format, path + "py" + format, path + "ny" + format, path + "pz" + format, path + "nz" + format];
        return new Promise(function (resolve, reject) {
          if (assets.size === 0) {
            loadingManager.onError = reject;

            loadingManager.onProgress = function (item, loaded, total) {
              if (loaded === total) {
                resolve();
              }
            };

            cubeTextureLoader.load(urls, function (textureCube) {
              assets.set("sky", textureCube);
            });
            textureLoader.load("textures/scratches.jpg", function (texture) {
              texture.wrapS = texture.wrapT = three.RepeatWrapping;
              assets.set("scratches-color", texture);
            });

            _this72.loadSMAAImages();
          } else {
            resolve();
          }
        });
      }
    }, {
      key: "initialize",
      value: function initialize() {
        var scene = this.scene;
        var assets = this.assets;
        var composer = this.composer;
        var renderer = composer.renderer;
        var camera = new three.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 2000);
        camera.position.set(-0.75, -0.1, -1);
        camera.lookAt(scene.position);
        this.camera = camera;
        var controls = new DeltaControls(camera.position, camera.quaternion, renderer.domElement);
        controls.settings.pointer.lock = false;
        controls.settings.translation.enabled = false;
        controls.settings.sensitivity.zoom = 1.0;
        controls.lookAt(scene.position);
        this.controls = controls;
        scene.background = assets.get("sky");
        var smaaEffect = new SMAAEffect(assets.get("smaa-search"), assets.get("smaa-area"));
        var textureEffect = new TextureEffect({
          blendFunction: BlendFunction.REFLECT,
          texture: assets.get("scratches-color")
        });
        textureEffect.blendMode.opacity.value = 0.8;
        var pass = new EffectPass(camera, smaaEffect, textureEffect);
        this.renderPass.renderToScreen = false;
        pass.renderToScreen = true;
        this.effect = textureEffect;
        this.pass = pass;
        composer.addPass(pass);
      }
    }, {
      key: "registerOptions",
      value: function registerOptions(menu) {
        var pass = this.pass;
        var effect = this.effect;
        var blendMode = effect.blendMode;
        var params = {
          "opacity": blendMode.opacity.value,
          "blend mode": blendMode.blendFunction
        };
        menu.add(params, "opacity").min(0.0).max(1.0).step(0.01).onChange(function () {
          blendMode.opacity.value = params.opacity;
        });
        menu.add(params, "blend mode", BlendFunction).onChange(function () {
          blendMode.blendFunction = Number.parseInt(params["blend mode"]);
          pass.recompile();
        });
        menu.add(pass, "dithering");
      }
    }]);

    return TextureDemo;
  }(PostProcessingDemo);

  var ToneMappingDemo = function (_PostProcessingDemo16) {
    _inherits(ToneMappingDemo, _PostProcessingDemo16);

    function ToneMappingDemo(composer) {
      var _this73;

      _classCallCheck(this, ToneMappingDemo);

      _this73 = _possibleConstructorReturn(this, _getPrototypeOf(ToneMappingDemo).call(this, "tone-mapping", composer));
      _this73.effect = null;
      _this73.pass = null;
      _this73.object = null;
      return _this73;
    }

    _createClass(ToneMappingDemo, [{
      key: "load",
      value: function load() {
        var _this74 = this;

        var assets = this.assets;
        var loadingManager = this.loadingManager;
        var textureLoader = new three.TextureLoader(loadingManager);
        var cubeTextureLoader = new three.CubeTextureLoader(loadingManager);
        var path = "textures/skies/sunset/";
        var format = ".png";
        var urls = [path + "px" + format, path + "nx" + format, path + "py" + format, path + "ny" + format, path + "pz" + format, path + "nz" + format];
        return new Promise(function (resolve, reject) {
          if (assets.size === 0) {
            loadingManager.onError = reject;

            loadingManager.onProgress = function (item, loaded, total) {
              if (loaded === total) {
                resolve();
              }
            };

            cubeTextureLoader.load(urls, function (textureCube) {
              assets.set("sky", textureCube);
            });
            textureLoader.load("textures/crate.jpg", function (texture) {
              texture.wrapS = texture.wrapT = three.RepeatWrapping;
              assets.set("crate-color", texture);
            });

            _this74.loadSMAAImages();
          } else {
            resolve();
          }
        });
      }
    }, {
      key: "initialize",
      value: function initialize() {
        var scene = this.scene;
        var assets = this.assets;
        var composer = this.composer;
        var renderer = composer.renderer;
        var camera = new three.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 2000);
        camera.position.set(-3, 0, -3);
        camera.lookAt(scene.position);
        this.camera = camera;
        var controls = new DeltaControls(camera.position, camera.quaternion, renderer.domElement);
        controls.settings.pointer.lock = false;
        controls.settings.translation.enabled = false;
        controls.settings.sensitivity.zoom = 1.0;
        controls.settings.zoom.minDistance = 2.5;
        controls.settings.zoom.maxDistance = 40.0;
        controls.lookAt(scene.position);
        this.controls = controls;
        scene.fog = new three.FogExp2(0x000000, 0.0025);
        renderer.setClearColor(scene.fog.color);
        scene.background = assets.get("sky");
        var ambientLight = new three.AmbientLight(0x666666);
        var directionalLight = new three.DirectionalLight(0xffbbaa);
        directionalLight.position.set(1440, 200, 2000);
        directionalLight.target.position.copy(scene.position);
        scene.add(directionalLight);
        scene.add(ambientLight);
        var mesh = new three.Mesh(new three.BoxBufferGeometry(1, 1, 1), new three.MeshPhongMaterial({
          map: assets.get("crate-color")
        }));
        this.object = mesh;
        scene.add(mesh);
        var smaaEffect = new SMAAEffect(assets.get("smaa-search"), assets.get("smaa-area"));
        smaaEffect.setEdgeDetectionThreshold(0.06);
        var toneMappingEffect = new ToneMappingEffect({
          blendFunction: BlendFunction.NORMAL,
          adaptive: true,
          resolution: 256,
          middleGrey: 0.6,
          maxLuminance: 16.0,
          averageLuminance: 1.0,
          adaptationRate: 2.0
        });
        this.effect = toneMappingEffect;
        var pass = new EffectPass(camera, smaaEffect, toneMappingEffect);
        pass.dithering = true;
        this.pass = pass;
        this.renderPass.renderToScreen = false;
        pass.renderToScreen = true;
        composer.addPass(pass);
      }
    }, {
      key: "render",
      value: function render(delta) {
        var object = this.object;
        var twoPI = 2.0 * Math.PI;
        object.rotation.x += 0.0005;
        object.rotation.y += 0.001;

        if (object.rotation.x >= twoPI) {
          object.rotation.x -= twoPI;
        }

        if (object.rotation.y >= twoPI) {
          object.rotation.y -= twoPI;
        }

        _get(_getPrototypeOf(ToneMappingDemo.prototype), "render", this).call(this, delta);
      }
    }, {
      key: "registerOptions",
      value: function registerOptions(menu) {
        var pass = this.pass;
        var effect = this.effect;
        var blendMode = effect.blendMode;
        var params = {
          "resolution": effect.resolution,
          "adaptation rate": effect.adaptationRate,
          "average lum": effect.uniforms.get("averageLuminance").value,
          "max lum": effect.uniforms.get("maxLuminance").value,
          "middle grey": effect.uniforms.get("middleGrey").value,
          "opacity": blendMode.opacity.value,
          "blend mode": blendMode.blendFunction
        };
        menu.add(params, "resolution", [64, 128, 256, 512, 1024]).onChange(function () {
          effect.resolution = Number.parseInt(params.resolution);
        });
        var f = menu.addFolder("Luminance");
        f.add(effect, "adaptive").onChange(function () {
          pass.recompile();
        });
        f.add(params, "adaptation rate").min(0.0).max(5.0).step(0.01).onChange(function () {
          effect.adaptationRate = params["adaptation rate"];
        });
        f.add(params, "average lum").min(0.01).max(1.0).step(0.01).onChange(function () {
          effect.uniforms.get("averageLuminance").value = params["average lum"];
        });
        f.add(params, "max lum").min(0.0).max(32.0).step(1).onChange(function () {
          effect.uniforms.get("maxLuminance").value = params["max lum"];
        });
        f.add(params, "middle grey").min(0.0).max(1.0).step(0.01).onChange(function () {
          effect.uniforms.get("middleGrey").value = params["middle grey"];
        });
        f.open();
        menu.add(params, "opacity").min(0.0).max(1.0).step(0.01).onChange(function () {
          blendMode.opacity.value = params.opacity;
        });
        menu.add(params, "blend mode", BlendFunction).onChange(function () {
          blendMode.blendFunction = Number.parseInt(params["blend mode"]);
          pass.recompile();
        });
        menu.add(pass, "dithering");
      }
    }]);

    return ToneMappingDemo;
  }(PostProcessingDemo);

  var VignetteDemo = function (_PostProcessingDemo17) {
    _inherits(VignetteDemo, _PostProcessingDemo17);

    function VignetteDemo(composer) {
      var _this75;

      _classCallCheck(this, VignetteDemo);

      _this75 = _possibleConstructorReturn(this, _getPrototypeOf(VignetteDemo).call(this, "vignette", composer));
      _this75.effect = null;
      _this75.pass = null;
      _this75.object = null;
      return _this75;
    }

    _createClass(VignetteDemo, [{
      key: "load",
      value: function load() {
        var _this76 = this;

        var assets = this.assets;
        var loadingManager = this.loadingManager;
        var cubeTextureLoader = new three.CubeTextureLoader(loadingManager);
        var path = "textures/skies/space/";
        var format = ".jpg";
        var urls = [path + "px" + format, path + "nx" + format, path + "py" + format, path + "ny" + format, path + "pz" + format, path + "nz" + format];
        return new Promise(function (resolve, reject) {
          if (assets.size === 0) {
            loadingManager.onError = reject;

            loadingManager.onProgress = function (item, loaded, total) {
              if (loaded === total) {
                resolve();
              }
            };

            cubeTextureLoader.load(urls, function (textureCube) {
              assets.set("sky", textureCube);
            });

            _this76.loadSMAAImages();
          } else {
            resolve();
          }
        });
      }
    }, {
      key: "initialize",
      value: function initialize() {
        var scene = this.scene;
        var assets = this.assets;
        var composer = this.composer;
        var renderer = composer.renderer;
        var camera = new three.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 2000);
        camera.position.set(10, 1, 10);
        camera.lookAt(scene.position);
        this.camera = camera;
        var controls = new DeltaControls(camera.position, camera.quaternion, renderer.domElement);
        controls.settings.pointer.lock = false;
        controls.settings.translation.enabled = false;
        controls.settings.sensitivity.zoom = 1.0;
        controls.lookAt(scene.position);
        this.controls = controls;
        scene.fog = new three.FogExp2(0x000000, 0.0025);
        renderer.setClearColor(scene.fog.color);
        scene.background = assets.get("sky");
        var ambientLight = new three.AmbientLight(0x666666);
        var directionalLight = new three.DirectionalLight(0xffbbaa);
        directionalLight.position.set(-1, 1, 1);
        directionalLight.target.position.copy(scene.position);
        scene.add(directionalLight);
        scene.add(ambientLight);
        var object = new three.Object3D();
        var geometry = new three.SphereBufferGeometry(1, 4, 4);
        var material, mesh;
        var i;

        for (i = 0; i < 100; ++i) {
          material = new three.MeshPhongMaterial({
            color: 0xffffff * Math.random(),
            flatShading: true
          });
          mesh = new three.Mesh(geometry, material);
          mesh.position.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
          mesh.position.multiplyScalar(Math.random() * 10);
          mesh.rotation.set(Math.random() * 2, Math.random() * 2, Math.random() * 2);
          mesh.scale.multiplyScalar(Math.random());
          object.add(mesh);
        }

        this.object = object;
        scene.add(object);
        var smaaEffect = new SMAAEffect(assets.get("smaa-search"), assets.get("smaa-area"));
        var vignetteEffect = new VignetteEffect({
          eskil: false,
          offset: 0.35,
          darkness: 0.75
        });
        var pass = new EffectPass(camera, smaaEffect, vignetteEffect);
        this.renderPass.renderToScreen = false;
        pass.renderToScreen = true;
        this.effect = vignetteEffect;
        this.pass = pass;
        composer.addPass(pass);
      }
    }, {
      key: "render",
      value: function render(delta) {
        var object = this.object;
        var twoPI = 2.0 * Math.PI;
        object.rotation.x += 0.001;
        object.rotation.y += 0.005;

        if (object.rotation.x >= twoPI) {
          object.rotation.x -= twoPI;
        }

        if (object.rotation.y >= twoPI) {
          object.rotation.y -= twoPI;
        }

        _get(_getPrototypeOf(VignetteDemo.prototype), "render", this).call(this, delta);
      }
    }, {
      key: "registerOptions",
      value: function registerOptions(menu) {
        var pass = this.pass;
        var effect = this.effect;
        var blendMode = effect.blendMode;
        var params = {
          "offset": effect.uniforms.get("offset").value,
          "darkness": effect.uniforms.get("darkness").value,
          "opacity": blendMode.opacity.value,
          "blend mode": blendMode.blendFunction
        };
        menu.add(effect, "eskil").onChange(function () {
          return pass.recompile();
        });
        menu.add(params, "offset").min(0.0).max(1.0).step(0.001).onChange(function () {
          effect.uniforms.get("offset").value = params.offset;
        });
        menu.add(params, "darkness").min(0.0).max(1.0).step(0.001).onChange(function () {
          effect.uniforms.get("darkness").value = params.darkness;
        });
        menu.add(params, "opacity").min(0.0).max(1.0).step(0.01).onChange(function () {
          blendMode.opacity.value = params.opacity;
        });
        menu.add(params, "blend mode", BlendFunction).onChange(function () {
          blendMode.blendFunction = Number.parseInt(params["blend mode"]);
          pass.recompile();
        });
        menu.add(pass, "dithering");
      }
    }]);

    return VignetteDemo;
  }(PostProcessingDemo);

  var PerformanceDemo = function (_PostProcessingDemo18) {
    _inherits(PerformanceDemo, _PostProcessingDemo18);

    function PerformanceDemo(composer) {
      var _this77;

      _classCallCheck(this, PerformanceDemo);

      _this77 = _possibleConstructorReturn(this, _getPrototypeOf(PerformanceDemo).call(this, "performance", composer));
      _this77.renderer = null;
      _this77.effects = null;
      _this77.effectPass = null;
      _this77.passes = null;
      _this77.sun = null;
      _this77.light = null;
      _this77.fps = "0";
      _this77.acc0 = 0;
      _this77.acc1 = 0;
      _this77.frames = 0;
      return _this77;
    }

    _createClass(PerformanceDemo, [{
      key: "load",
      value: function load() {
        var _this78 = this;

        var assets = this.assets;
        var loadingManager = this.loadingManager;
        var cubeTextureLoader = new three.CubeTextureLoader(loadingManager);
        var textureLoader = new three.TextureLoader(loadingManager);
        var path = "textures/skies/space5/";
        var format = ".jpg";
        var urls = [path + "px" + format, path + "nx" + format, path + "py" + format, path + "ny" + format, path + "pz" + format, path + "nz" + format];
        return new Promise(function (resolve, reject) {
          if (assets.size === 0) {
            loadingManager.onError = reject;

            loadingManager.onProgress = function (item, loaded, total) {
              if (loaded === total) {
                resolve();
              }
            };

            cubeTextureLoader.load(urls, function (textureCube) {
              assets.set("sky", textureCube);
            });
            textureLoader.load("textures/sun.png", function (texture) {
              assets.set("sun-diffuse", texture);
            });

            _this78.loadSMAAImages();
          } else {
            resolve();
          }
        });
      }
    }, {
      key: "initialize",
      value: function initialize() {
        var scene = this.scene;
        var assets = this.assets;
        var composer = this.composer;

        var renderer = function (renderer) {
          var size = renderer.getSize(new three.Vector2());
          var pixelRatio = renderer.getPixelRatio();
          renderer = new three.WebGLRenderer({
            powerPreference: "high-performance",
            logarithmicDepthBuffer: true,
            antialias: false
          });
          renderer.setSize(size.width, size.height);
          renderer.setPixelRatio(pixelRatio);
          return renderer;
        }(composer.renderer);

        composer.replaceRenderer(renderer);
        this.renderer = renderer;
        var camera = new three.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.3, 2000);
        camera.position.set(-10, 1.125, 0);
        camera.lookAt(scene.position);
        this.camera = camera;
        scene.fog = new three.FogExp2(0x000000, 0.0025);
        renderer.setClearColor(scene.fog.color);
        scene.background = assets.get("sky");
        var ambientLight = new three.AmbientLight(0x666666);
        var pointLight = new three.PointLight(0xffbbaa, 5.5, 12);
        scene.add(ambientLight);
        scene.add(pointLight);
        this.light = pointLight;
        var material = new three.MeshPhongMaterial({
          color: 0xffaaaa,
          flatShading: true,
          envMap: assets.get("sky")
        });
        var cylinderGeometry = new three.CylinderBufferGeometry(1, 1, 20, 6);
        var cylinderMesh = new three.Mesh(cylinderGeometry, material);
        cylinderMesh.rotation.set(0, 0, Math.PI / 2);
        scene.add(cylinderMesh);
        var torusGeometry = new three.TorusBufferGeometry(1, 0.4, 16, 100);
        var torusMeshes = [new three.Mesh(torusGeometry, material), new three.Mesh(torusGeometry, material), new three.Mesh(torusGeometry, material)];
        torusMeshes[0].position.set(0, 2.5, -5);
        torusMeshes[1].position.set(0, 2.5, 0);
        torusMeshes[2].position.set(0, 2.5, 5);
        scene.add(torusMeshes[0]);
        scene.add(torusMeshes[1]);
        scene.add(torusMeshes[2]);
        var sunMaterial = new three.MeshBasicMaterial({
          color: 0xffddaa,
          transparent: true,
          fog: false
        });
        var sunGeometry = new three.SphereBufferGeometry(0.65, 32, 32);
        var sun = new three.Mesh(sunGeometry, sunMaterial);
        sun.frustumCulled = false;
        this.sun = sun;
        this.renderPass.renderToScreen = false;
        var smaaEffect = new SMAAEffect(assets.get("smaa-search"), assets.get("smaa-area"));
        smaaEffect.setEdgeDetectionThreshold(0.06);
        var bloomEffect = new BloomEffect({
          blendFunction: BlendFunction.SCREEN,
          kernelSize: KernelSize.MEDIUM,
          luminanceThreshold: 0.825,
          luminanceSmoothing: 0.075,
          height: 480
        });
        var godRaysEffect = new GodRaysEffect(camera, sun, {
          kernelSize: KernelSize.SMALL,
          height: 720,
          density: 0.96,
          decay: 0.92,
          weight: 0.3,
          exposure: 0.55,
          samples: 60,
          clampMax: 1.0
        });
        var dotScreenEffect = new DotScreenEffect({
          blendFunction: BlendFunction.OVERLAY
        });
        var gridEffect = new GridEffect({
          blendFunction: BlendFunction.DARKEN,
          scale: 2.4,
          lineWidth: 0.0
        });
        var scanlineEffect = new ScanlineEffect({
          blendFunction: BlendFunction.OVERLAY,
          density: 1.04
        });
        var colorAverageEffect = new ColorAverageEffect(BlendFunction.COLOR_DODGE);
        var colorDepthEffect = new ColorDepthEffect({
          bits: 16
        });
        var sepiaEffect = new SepiaEffect({
          blendFunction: BlendFunction.NORMAL
        });
        var brightnessContrastEffect = new BrightnessContrastEffect({
          contrast: 0.0
        });
        var gammaCorrectionEffect = new GammaCorrectionEffect({
          gamma: 1.1
        });
        var hueSaturationEffect = new HueSaturationEffect({
          saturation: 0.125
        });
        var noiseEffect = new NoiseEffect({
          premultiply: true
        });
        var vignetteEffect = new VignetteEffect();
        godRaysEffect.dithering = true;
        bloomEffect.blendMode.opacity.value = 2.3;
        colorAverageEffect.blendMode.opacity.value = 0.01;
        sepiaEffect.blendMode.opacity.value = 0.01;
        dotScreenEffect.blendMode.opacity.value = 0.01;
        gridEffect.blendMode.opacity.value = 0.01;
        scanlineEffect.blendMode.opacity.value = 0.01;
        noiseEffect.blendMode.opacity.value = 0.25;
        var effects = [smaaEffect, bloomEffect, godRaysEffect, colorAverageEffect, colorDepthEffect, dotScreenEffect, gridEffect, scanlineEffect, brightnessContrastEffect, gammaCorrectionEffect, hueSaturationEffect, sepiaEffect, noiseEffect, vignetteEffect];

        var effectPass = _construct(EffectPass, [camera].concat(effects));

        effectPass.renderToScreen = true;
        var passes = effects.map(function (effect) {
          return new EffectPass(camera, effect);
        });
        passes[passes.length - 1].renderToScreen = true;
        var _iteratorNormalCompletion21 = true;
        var _didIteratorError21 = false;
        var _iteratorError21 = undefined;

        try {
          for (var _iterator21 = passes[Symbol.iterator](), _step21; !(_iteratorNormalCompletion21 = (_step21 = _iterator21.next()).done); _iteratorNormalCompletion21 = true) {
            var pass = _step21.value;
            pass.enabled = false;
            composer.addPass(pass);
          }
        } catch (err) {
          _didIteratorError21 = true;
          _iteratorError21 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion21 && _iterator21["return"] != null) {
              _iterator21["return"]();
            }
          } finally {
            if (_didIteratorError21) {
              throw _iteratorError21;
            }
          }
        }

        composer.addPass(effectPass);
        this.effectPass = effectPass;
        this.effects = effects;
        this.passes = passes;
      }
    }, {
      key: "render",
      value: function render(delta) {
        this.acc0 += delta;
        this.acc1 += delta;

        if (this.acc0 >= 1.0) {
          this.fps = this.frames.toFixed();
          this.acc0 = 0.0;
          this.frames = 0;
        } else {
          ++this.frames;
        }

        this.sun.position.set(0, 2.5, Math.sin(this.acc1 * 0.4) * 8);
        this.sun.updateWorldMatrix(true, false);
        this.light.position.copy(this.sun.position);

        _get(_getPrototypeOf(PerformanceDemo.prototype), "render", this).call(this, delta);
      }
    }, {
      key: "registerOptions",
      value: function registerOptions(menu) {
        var _this79 = this;

        var params = {
          "merge effects": true,
          "firefox": function firefox() {
            window.open("https://www.google.com/search?q=firefox+layout.frame_rate", "_blank");
          },
          "chrome": function chrome() {
            window.open("https://www.google.com/search?q=chrome+--disable-gpu-vsync", "_blank");
          }
        };
        menu.add(params, "merge effects").onChange(function () {
          _this79.effectPass.enabled = params["merge effects"];

          _this79.passes.forEach(function (pass) {
            pass.enabled = !params["merge effects"];
          });
        });
        menu.add(this, "fps").listen();
        var folder = menu.addFolder("Disable VSync");
        folder.add(params, "firefox");
        folder.add(params, "chrome");
      }
    }, {
      key: "reset",
      value: function reset() {
        _get(_getPrototypeOf(PerformanceDemo.prototype), "reset", this).call(this);

        this.acc0 = 0.0;
        this.acc1 = 0.0;
        this.frames = 0;
      }
    }]);

    return PerformanceDemo;
  }(PostProcessingDemo);

  var renderer;
  var composer;
  var manager;

  function render(now) {
    requestAnimationFrame(render);
    manager.render(now);
  }

  function onChange(event) {
    var demo = event.demo;
    var size = composer.getRenderer().getSize(new three.Vector2());
    renderer.setSize(size.width, size.height);
    composer.replaceRenderer(renderer);
    composer.reset();
    composer.addPass(demo.renderPass);
    document.getElementById("viewport").children[0].style.display = "initial";
  }

  function onLoad(event) {
    event.demo.renderPass.camera = event.demo.camera;
    document.getElementById("viewport").children[0].style.display = "none";
  }

  window.addEventListener("load", function main(event) {
    this.removeEventListener("load", main);
    var viewport = document.getElementById("viewport");
    renderer = new three.WebGLRenderer({
      logarithmicDepthBuffer: true,
      antialias: false
    });
    renderer.debug.checkShaderErrors = true;
    renderer.setSize(viewport.clientWidth, viewport.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000, 0.0);
    composer = new EffectComposer(renderer, {
      stencilBuffer: true
    });
    manager = new DemoManager(viewport, {
      aside: document.getElementById("aside"),
      renderer: renderer
    });
    manager.addEventListener("change", onChange);
    manager.addEventListener("load", onLoad);
    var demos = [new BloomDemo(composer), new BlurDemo(composer), new BokehDemo(composer), new RealisticBokehDemo(composer), new ColorDepthDemo(composer), new ColorGradingDemo(composer), new GlitchDemo(composer), new GodRaysDemo(composer), new OutlineDemo(composer), new PatternDemo(composer), new PixelationDemo(composer), new ShockWaveDemo(composer), new SMAADemo(composer), new SSAODemo(composer), new TextureDemo(composer), new ToneMappingDemo(composer), new VignetteDemo(composer), new PerformanceDemo(composer)];

    if (demos.map(function (demo) {
      return demo.id;
    }).indexOf(window.location.hash.slice(1)) === -1) {
      window.location.hash = "";
    }

    for (var _i3 = 0, _demos = demos; _i3 < _demos.length; _i3++) {
      var demo = _demos[_i3];
      manager.addDemo(demo);
    }

    render();
  });
  window.addEventListener("resize", function () {
    var timeoutId = 0;

    function handleResize(event) {
      var width = event.target.innerWidth;
      var height = event.target.innerHeight;
      manager.setSize(width, height);
      composer.setSize(width, height);
      timeoutId = 0;
    }

    return function onResize(event) {
      if (timeoutId === 0) {
        timeoutId = setTimeout(handleResize, 66, event);
      }
    };
  }());
  document.addEventListener("keydown", function onKeyDown(event) {
    var aside = this.getElementById("aside");

    if (event.altKey && aside !== null) {
      event.preventDefault();
      aside.style.visibility = aside.style.visibility === "hidden" ? "visible" : "hidden";
    }
  });

}(THREE));
