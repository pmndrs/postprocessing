(function (three) {
  'use strict';

  var classCallCheck = function (instance, Constructor) {
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

  var inherits = function (subClass, superClass) {
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
  };

  var possibleConstructorReturn = function (self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return call && (typeof call === "object" || typeof call === "function") ? call : self;
  };

  var toConsumableArray = function (arr) {
    if (Array.isArray(arr)) {
      for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

      return arr2;
    } else {
      return Array.from(arr);
    }
  };

  var Demo = function () {
  		function Demo() {
  				var id = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "demo";
  				classCallCheck(this, Demo);


  				this.id = id;

  				this.renderer = null;

  				this.loadingManager = new three.LoadingManager();

  				this.assets = new Map();

  				this.scene = new three.Scene();

  				this.camera = null;

  				this.controls = null;

  				this.ready = false;
  		}

  		createClass(Demo, [{
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
  		classCallCheck(this, Event);


  		this.type = type;

  		this.target = null;
  };

  var EventTarget = function () {
  		function EventTarget() {
  				classCallCheck(this, EventTarget);


  				this.listenerFunctions = new Map();

  				this.listenerObjects = new Map();
  		}

  		createClass(EventTarget, [{
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

  						var listeners = void 0;

  						if (m.has(type)) {

  								listeners = m.get(type);
  								listeners.delete(listener);

  								if (listeners.size === 0) {

  										m.delete(type);
  								}
  						}
  				}
  		}, {
  				key: "dispatchEvent",
  				value: function dispatchEvent(event) {
  						var target = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this;


  						var listenerFunctions = target.listenerFunctions;
  						var listenerObjects = target.listenerObjects;

  						var listeners = void 0;
  						var listener = void 0;

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
  												if (!_iteratorNormalCompletion && _iterator.return) {
  														_iterator.return();
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
  												if (!_iteratorNormalCompletion2 && _iterator2.return) {
  														_iterator2.return();
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

  var _typeof2 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

  /**
   * dat-gui JavaScript Controller Library
   * http://code.google.com/p/dat-gui
   *
   * Copyright 2011 Data Arts Team, Google Creative Lab
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   */

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

  var _typeof$1 = typeof Symbol === "function" && _typeof2(Symbol.iterator) === "symbol" ? function (obj) {
    return typeof obj === 'undefined' ? 'undefined' : _typeof2(obj);
  } : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj === 'undefined' ? 'undefined' : _typeof2(obj);
  };

  var classCallCheck$1 = function classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  };

  var createClass$1 = function () {
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

  var get$1 = function get(object, property, receiver) {
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

  var inherits$1 = function inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + (typeof superClass === 'undefined' ? 'undefined' : _typeof2(superClass)));
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

  var possibleConstructorReturn$1 = function possibleConstructorReturn(self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return call && ((typeof call === 'undefined' ? 'undefined' : _typeof2(call)) === "object" || typeof call === "function") ? call : self;
  };

  var Color = function () {
    function Color() {
      classCallCheck$1(this, Color);
      this.__state = interpret.apply(this, arguments);
      if (this.__state === false) {
        throw new Error('Failed to interpret color arguments');
      }
      this.__state.a = this.__state.a || 1;
    }
    createClass$1(Color, [{
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
      classCallCheck$1(this, Controller);
      this.initialValue = object[property];
      this.domElement = document.createElement('div');
      this.object = object;
      this.property = property;
      this.__onChange = undefined;
      this.__onFinishChange = undefined;
    }
    createClass$1(Controller, [{
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
      var offset = { left: 0, top: 0 };
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
    inherits$1(BooleanController, _Controller);
    function BooleanController(object, property) {
      classCallCheck$1(this, BooleanController);
      var _this2 = possibleConstructorReturn$1(this, (BooleanController.__proto__ || Object.getPrototypeOf(BooleanController)).call(this, object, property));
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
    createClass$1(BooleanController, [{
      key: 'setValue',
      value: function setValue(v) {
        var toReturn = get$1(BooleanController.prototype.__proto__ || Object.getPrototypeOf(BooleanController.prototype), 'setValue', this).call(this, v);
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
        return get$1(BooleanController.prototype.__proto__ || Object.getPrototypeOf(BooleanController.prototype), 'updateDisplay', this).call(this);
      }
    }]);
    return BooleanController;
  }(Controller);

  var OptionController = function (_Controller) {
    inherits$1(OptionController, _Controller);
    function OptionController(object, property, opts) {
      classCallCheck$1(this, OptionController);
      var _this2 = possibleConstructorReturn$1(this, (OptionController.__proto__ || Object.getPrototypeOf(OptionController)).call(this, object, property));
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
    createClass$1(OptionController, [{
      key: 'setValue',
      value: function setValue(v) {
        var toReturn = get$1(OptionController.prototype.__proto__ || Object.getPrototypeOf(OptionController.prototype), 'setValue', this).call(this, v);
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
        return get$1(OptionController.prototype.__proto__ || Object.getPrototypeOf(OptionController.prototype), 'updateDisplay', this).call(this);
      }
    }]);
    return OptionController;
  }(Controller);

  var StringController = function (_Controller) {
    inherits$1(StringController, _Controller);
    function StringController(object, property) {
      classCallCheck$1(this, StringController);
      var _this2 = possibleConstructorReturn$1(this, (StringController.__proto__ || Object.getPrototypeOf(StringController)).call(this, object, property));
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
    createClass$1(StringController, [{
      key: 'updateDisplay',
      value: function updateDisplay() {
        if (!dom.isActive(this.__input)) {
          this.__input.value = this.getValue();
        }
        return get$1(StringController.prototype.__proto__ || Object.getPrototypeOf(StringController.prototype), 'updateDisplay', this).call(this);
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
    inherits$1(NumberController, _Controller);
    function NumberController(object, property, params) {
      classCallCheck$1(this, NumberController);
      var _this = possibleConstructorReturn$1(this, (NumberController.__proto__ || Object.getPrototypeOf(NumberController)).call(this, object, property));
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
    createClass$1(NumberController, [{
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
        return get$1(NumberController.prototype.__proto__ || Object.getPrototypeOf(NumberController.prototype), 'setValue', this).call(this, _v);
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
    inherits$1(NumberControllerBox, _NumberController);
    function NumberControllerBox(object, property, params) {
      classCallCheck$1(this, NumberControllerBox);
      var _this2 = possibleConstructorReturn$1(this, (NumberControllerBox.__proto__ || Object.getPrototypeOf(NumberControllerBox)).call(this, object, property, params));
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
    createClass$1(NumberControllerBox, [{
      key: 'updateDisplay',
      value: function updateDisplay() {
        this.__input.value = this.__truncationSuspended ? this.getValue() : roundToDecimal(this.getValue(), this.__precision);
        return get$1(NumberControllerBox.prototype.__proto__ || Object.getPrototypeOf(NumberControllerBox.prototype), 'updateDisplay', this).call(this);
      }
    }]);
    return NumberControllerBox;
  }(NumberController);

  function map(v, i1, i2, o1, o2) {
    return o1 + (o2 - o1) * ((v - i1) / (i2 - i1));
  }
  var NumberControllerSlider = function (_NumberController) {
    inherits$1(NumberControllerSlider, _NumberController);
    function NumberControllerSlider(object, property, min, max, step) {
      classCallCheck$1(this, NumberControllerSlider);
      var _this2 = possibleConstructorReturn$1(this, (NumberControllerSlider.__proto__ || Object.getPrototypeOf(NumberControllerSlider)).call(this, object, property, { min: min, max: max, step: step }));
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
    createClass$1(NumberControllerSlider, [{
      key: 'updateDisplay',
      value: function updateDisplay() {
        var pct = (this.getValue() - this.__min) / (this.__max - this.__min);
        this.__foreground.style.width = pct * 100 + '%';
        return get$1(NumberControllerSlider.prototype.__proto__ || Object.getPrototypeOf(NumberControllerSlider.prototype), 'updateDisplay', this).call(this);
      }
    }]);
    return NumberControllerSlider;
  }(NumberController);

  var FunctionController = function (_Controller) {
    inherits$1(FunctionController, _Controller);
    function FunctionController(object, property, text) {
      classCallCheck$1(this, FunctionController);
      var _this2 = possibleConstructorReturn$1(this, (FunctionController.__proto__ || Object.getPrototypeOf(FunctionController)).call(this, object, property));
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
    createClass$1(FunctionController, [{
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
    inherits$1(ColorController, _Controller);
    function ColorController(object, property) {
      classCallCheck$1(this, ColorController);
      var _this2 = possibleConstructorReturn$1(this, (ColorController.__proto__ || Object.getPrototypeOf(ColorController)).call(this, object, property));
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
    createClass$1(ColorController, [{
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
        return new NumberControllerBox(object, property, { min: arguments[2], max: arguments[3], step: arguments[4] });
      }
      return new NumberControllerBox(object, property, { min: arguments[2], max: arguments[3] });
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
      classCallCheck$1(this, CenteredDiv);
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
    createClass$1(CenteredDiv, [{
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
      params.load = { preset: DEFAULT_DEFAULT_PRESET_NAME };
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
          if (titleRowName) {
            titleRowName.innerHTML = params.name;
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
      params.closed = false;
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
      var _titleRowName = document.createTextNode(params.name);
      dom.addClass(_titleRowName, 'controller-name');
      var titleRow = addRow(_this, _titleRowName);
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
      var newGuiParams = { name: name, parent: this };
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
      var box = new NumberControllerBox(controller.object, controller.property, { min: controller.__min, max: controller.__max, step: controller.__step });
      Common.each(['updateDisplay', 'onChange', 'onFinishChange', 'step'], function (method) {
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
  		inherits(DemoManagerEvent, _Event);

  		function DemoManagerEvent(type) {
  				classCallCheck(this, DemoManagerEvent);

  				var _this = possibleConstructorReturn(this, (DemoManagerEvent.__proto__ || Object.getPrototypeOf(DemoManagerEvent)).call(this, type));

  				_this.previousDemo = null;

  				_this.demo = null;

  				return _this;
  		}

  		return DemoManagerEvent;
  }(Event);

  var change = new DemoManagerEvent("change");

  var load = new DemoManagerEvent("load");

  var initialHash = window.location.hash.slice(1);

  var DemoManager = function (_EventTarget) {
  		inherits(DemoManager, _EventTarget);

  		function DemoManager(viewport) {
  				var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  				classCallCheck(this, DemoManager);


  				var aside = options.aside !== undefined ? options.aside : viewport;

  				var _this = possibleConstructorReturn(this, (DemoManager.__proto__ || Object.getPrototypeOf(DemoManager)).call(this));

  				_this.renderer = options.renderer !== undefined ? options.renderer : function () {

  						var renderer = new three.WebGLRenderer();
  						renderer.setSize(viewport.clientWidth, viewport.clientHeight);
  						renderer.setPixelRatio(window.devicePixelRatio);

  						return renderer;
  				}();

  				viewport.appendChild(_this.renderer.domElement);

  				_this.clock = new three.Clock();

  				_this.menu = new GUI$1({ autoPlace: false });

  				aside.appendChild(_this.menu.domElement);

  				_this.demos = new Map();

  				_this.demo = null;

  				_this.currentDemo = null;

  				return _this;
  		}

  		createClass(DemoManager, [{
  				key: "resetMenu",
  				value: function resetMenu() {
  						var _this2 = this;

  						var node = this.menu.domElement.parentNode;
  						var menu = new GUI$1({ autoPlace: false });

  						if (this.demos.size > 1) {

  								var selection = menu.add(this, "demo", Array.from(this.demos.keys()));
  								selection.onChange(function () {
  										return _this2.loadDemo();
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
  						var _this3 = this;

  						var id = this.demo;
  						var demos = this.demos;
  						var demo = demos.get(id);
  						var previousDemo = this.currentDemo;
  						var renderer = this.renderer;

  						window.location.hash = id;

  						if (previousDemo !== null) {

  								previousDemo.reset();
  						}

  						this.menu.domElement.style.display = "none";

  						renderer.clear();

  						change.previousDemo = previousDemo;
  						change.demo = demo;
  						this.currentDemo = demo;
  						this.dispatchEvent(change);

  						demo.load().then(function () {
  								return _this3.startDemo(demo);
  						}).catch(function (e) {
  								return console.error(e);
  						});
  				}
  		}, {
  				key: "addDemo",
  				value: function addDemo(demo) {

  						var currentDemo = this.currentDemo;

  						this.demos.set(demo.id, demo.setRenderer(this.renderer));

  						if (this.demo === null || demo.id === initialHash) {

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

  						var firstEntry = void 0;

  						if (demos.has(id)) {

  								demos.delete(id);

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

  								demo.camera.aspect = width / height;
  								demo.camera.updateProjectionMatrix();
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

  var Disposable = function () {
    function Disposable() {
      classCallCheck(this, Disposable);
    }

    createClass(Disposable, [{
      key: "dispose",
      value: function dispose() {}
    }]);
    return Disposable;
  }();

  var fragment = "uniform sampler2D tPreviousLum;\r\nuniform sampler2D tCurrentLum;\r\nuniform float minLuminance;\r\nuniform float delta;\r\nuniform float tau;\r\n\r\nvarying vec2 vUv;\r\n\r\nvoid main() {\r\n\r\n\tfloat previousLum = texture2D(tPreviousLum, vUv, MIP_LEVEL_1X1).r;\r\n\tfloat currentLum = texture2D(tCurrentLum, vUv, MIP_LEVEL_1X1).r;\r\n\r\n\tpreviousLum = max(minLuminance, previousLum);\r\n\tcurrentLum = max(minLuminance, currentLum);\r\n\r\n\t// Adapt the luminance using Pattanaik's technique.\r\n\tfloat adaptedLum = previousLum + (currentLum - previousLum) * (1.0 - exp(-delta * tau));\r\n\r\n\tgl_FragColor.r = adaptedLum;\r\n\r\n}\r\n";

  var vertex = "varying vec2 vUv;\r\n\r\nvoid main() {\r\n\r\n\tvUv = uv;\r\n\tgl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\r\n\r\n}\r\n";

  var AdaptiveLuminosityMaterial = function (_ShaderMaterial) {
  			inherits(AdaptiveLuminosityMaterial, _ShaderMaterial);

  			function AdaptiveLuminosityMaterial() {
  						classCallCheck(this, AdaptiveLuminosityMaterial);
  						return possibleConstructorReturn(this, (AdaptiveLuminosityMaterial.__proto__ || Object.getPrototypeOf(AdaptiveLuminosityMaterial)).call(this, {

  									type: "AdaptiveLuminosityMaterial",

  									defines: {

  												MIP_LEVEL_1X1: "0.0"

  									},

  									uniforms: {

  												tPreviousLum: new three.Uniform(null),
  												tCurrentLum: new three.Uniform(null),
  												minLuminance: new three.Uniform(0.01),
  												delta: new three.Uniform(0.0),
  												tau: new three.Uniform(1.0)

  									},

  									fragmentShader: fragment,
  									vertexShader: vertex,

  									depthWrite: false,
  									depthTest: false

  						}));
  			}

  			return AdaptiveLuminosityMaterial;
  }(three.ShaderMaterial);

  var fragment$1 = "uniform sampler2D tDiffuse;\r\nuniform sampler2D tDepth;\r\n\r\nuniform float focus;\r\nuniform float dof;\r\nuniform float aspect;\r\nuniform float aperture;\r\nuniform float maxBlur;\r\n\r\nvarying vec2 vUv;\r\n\r\n#ifndef USE_LOGDEPTHBUF\r\n\r\n\t#include <packing>\r\n\r\n\tuniform float cameraNear;\r\n\tuniform float cameraFar;\r\n\r\n\tfloat readDepth(sampler2D depthSampler, vec2 coord) {\r\n\r\n\t\tfloat fragCoordZ = texture2D(depthSampler, coord).x;\r\n\t\tfloat viewZ = perspectiveDepthToViewZ(fragCoordZ, cameraNear, cameraFar);\r\n\r\n\t\treturn viewZToOrthographicDepth(viewZ, cameraNear, cameraFar);\r\n\r\n\t}\r\n\r\n#endif\r\n\r\nvoid main() {\r\n\r\n\tvec2 aspectCorrection = vec2(1.0, aspect);\r\n\r\n\t#ifdef USE_LOGDEPTHBUF\r\n\r\n\t\tfloat depth = texture2D(tDepth, vUv).x;\r\n\r\n\t#else\r\n\r\n\t\tfloat depth = readDepth(tDepth, vUv);\r\n\r\n\t#endif\r\n\r\n\tfloat focusNear = clamp(focus - dof, 0.0, 1.0);\r\n\tfloat focusFar = clamp(focus + dof, 0.0, 1.0);\r\n\r\n\t// Calculate a DoF mask.\r\n\tfloat low = step(depth, focusNear);\r\n\tfloat high = step(focusFar, depth);\r\n\r\n\tfloat factor = (depth - focusNear) * low + (depth - focusFar) * high;\r\n\r\n\tvec2 dofBlur = vec2(clamp(factor * aperture, -maxBlur, maxBlur));\r\n\r\n\tvec2 dofblur9 = dofBlur * 0.9;\r\n\tvec2 dofblur7 = dofBlur * 0.7;\r\n\tvec2 dofblur4 = dofBlur * 0.4;\r\n\r\n\tvec4 color = vec4(0.0);\r\n\r\n\tcolor += texture2D(tDiffuse, vUv);\r\n\tcolor += texture2D(tDiffuse, vUv + (vec2( 0.0,   0.4 ) * aspectCorrection) * dofBlur);\r\n\tcolor += texture2D(tDiffuse, vUv + (vec2( 0.15,  0.37) * aspectCorrection) * dofBlur);\r\n\tcolor += texture2D(tDiffuse, vUv + (vec2( 0.29,  0.29) * aspectCorrection) * dofBlur);\r\n\tcolor += texture2D(tDiffuse, vUv + (vec2(-0.37,  0.15) * aspectCorrection) * dofBlur);\r\n\tcolor += texture2D(tDiffuse, vUv + (vec2( 0.40,  0.0 ) * aspectCorrection) * dofBlur);\r\n\tcolor += texture2D(tDiffuse, vUv + (vec2( 0.37, -0.15) * aspectCorrection) * dofBlur);\r\n\tcolor += texture2D(tDiffuse, vUv + (vec2( 0.29, -0.29) * aspectCorrection) * dofBlur);\r\n\tcolor += texture2D(tDiffuse, vUv + (vec2(-0.15, -0.37) * aspectCorrection) * dofBlur);\r\n\tcolor += texture2D(tDiffuse, vUv + (vec2( 0.0,  -0.4 ) * aspectCorrection) * dofBlur);\r\n\tcolor += texture2D(tDiffuse, vUv + (vec2(-0.15,  0.37) * aspectCorrection) * dofBlur);\r\n\tcolor += texture2D(tDiffuse, vUv + (vec2(-0.29,  0.29) * aspectCorrection) * dofBlur);\r\n\tcolor += texture2D(tDiffuse, vUv + (vec2( 0.37,  0.15) * aspectCorrection) * dofBlur);\r\n\tcolor += texture2D(tDiffuse, vUv + (vec2(-0.4,   0.0 ) * aspectCorrection) * dofBlur);\r\n\tcolor += texture2D(tDiffuse, vUv + (vec2(-0.37, -0.15) * aspectCorrection) * dofBlur);\r\n\tcolor += texture2D(tDiffuse, vUv + (vec2(-0.29, -0.29) * aspectCorrection) * dofBlur);\r\n\tcolor += texture2D(tDiffuse, vUv + (vec2( 0.15, -0.37) * aspectCorrection) * dofBlur);\r\n\r\n\tcolor += texture2D(tDiffuse, vUv + (vec2( 0.15,  0.37) * aspectCorrection) * dofblur9);\r\n\tcolor += texture2D(tDiffuse, vUv + (vec2(-0.37,  0.15) * aspectCorrection) * dofblur9);\r\n\tcolor += texture2D(tDiffuse, vUv + (vec2( 0.37, -0.15) * aspectCorrection) * dofblur9);\r\n\tcolor += texture2D(tDiffuse, vUv + (vec2(-0.15, -0.37) * aspectCorrection) * dofblur9);\r\n\tcolor += texture2D(tDiffuse, vUv + (vec2(-0.15,  0.37) * aspectCorrection) * dofblur9);\r\n\tcolor += texture2D(tDiffuse, vUv + (vec2( 0.37,  0.15) * aspectCorrection) * dofblur9);\r\n\tcolor += texture2D(tDiffuse, vUv + (vec2(-0.37, -0.15) * aspectCorrection) * dofblur9);\r\n\tcolor += texture2D(tDiffuse, vUv + (vec2( 0.15, -0.37) * aspectCorrection) * dofblur9);\r\n\r\n\tcolor += texture2D(tDiffuse, vUv + (vec2( 0.29,  0.29) * aspectCorrection) * dofblur7);\r\n\tcolor += texture2D(tDiffuse, vUv + (vec2( 0.40,  0.0 ) * aspectCorrection) * dofblur7);\r\n\tcolor += texture2D(tDiffuse, vUv + (vec2( 0.29, -0.29) * aspectCorrection) * dofblur7);\r\n\tcolor += texture2D(tDiffuse, vUv + (vec2( 0.0,  -0.4 ) * aspectCorrection) * dofblur7);\r\n\tcolor += texture2D(tDiffuse, vUv + (vec2(-0.29,  0.29) * aspectCorrection) * dofblur7);\r\n\tcolor += texture2D(tDiffuse, vUv + (vec2(-0.4,   0.0 ) * aspectCorrection) * dofblur7);\r\n\tcolor += texture2D(tDiffuse, vUv + (vec2(-0.29, -0.29) * aspectCorrection) * dofblur7);\r\n\tcolor += texture2D(tDiffuse, vUv + (vec2( 0.0,   0.4 ) * aspectCorrection) * dofblur7);\r\n\r\n\tcolor += texture2D(tDiffuse, vUv + (vec2( 0.29,  0.29) * aspectCorrection) * dofblur4);\r\n\tcolor += texture2D(tDiffuse, vUv + (vec2( 0.4,   0.0 ) * aspectCorrection) * dofblur4);\r\n\tcolor += texture2D(tDiffuse, vUv + (vec2( 0.29, -0.29) * aspectCorrection) * dofblur4);\r\n\tcolor += texture2D(tDiffuse, vUv + (vec2( 0.0,  -0.4 ) * aspectCorrection) * dofblur4);\r\n\tcolor += texture2D(tDiffuse, vUv + (vec2(-0.29,  0.29) * aspectCorrection) * dofblur4);\r\n\tcolor += texture2D(tDiffuse, vUv + (vec2(-0.4,   0.0 ) * aspectCorrection) * dofblur4);\r\n\tcolor += texture2D(tDiffuse, vUv + (vec2(-0.29, -0.29) * aspectCorrection) * dofblur4);\r\n\tcolor += texture2D(tDiffuse, vUv + (vec2( 0.0,   0.4 ) * aspectCorrection) * dofblur4);\r\n\r\n\tgl_FragColor = color / 41.0;\r\n\r\n}\r\n";

  var vertex$1 = "varying vec2 vUv;\r\n\r\nvoid main() {\r\n\r\n\tvUv = uv;\r\n\tgl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\r\n\r\n}\r\n";

  var BokehMaterial = function (_ShaderMaterial) {
  	inherits(BokehMaterial, _ShaderMaterial);

  	function BokehMaterial(camera) {
  		var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  		classCallCheck(this, BokehMaterial);


  		var settings = Object.assign({
  			focus: 1.0,
  			dof: 0.02,
  			aperture: 0.025,
  			maxBlur: 1.0
  		}, options);

  		var _this = possibleConstructorReturn(this, (BokehMaterial.__proto__ || Object.getPrototypeOf(BokehMaterial)).call(this, {

  			type: "BokehMaterial",

  			uniforms: {

  				cameraNear: new three.Uniform(0.1),
  				cameraFar: new three.Uniform(2000),
  				aspect: new three.Uniform(1.0),

  				tDiffuse: new three.Uniform(null),
  				tDepth: new three.Uniform(null),

  				focus: new three.Uniform(settings.focus),
  				dof: new three.Uniform(settings.dof),
  				aperture: new three.Uniform(settings.aperture),
  				maxBlur: new three.Uniform(settings.maxBlur)

  			},

  			fragmentShader: fragment$1,
  			vertexShader: vertex$1,

  			depthWrite: false,
  			depthTest: false

  		}));

  		_this.adoptCameraSettings(camera);

  		return _this;
  	}

  	createClass(BokehMaterial, [{
  		key: "adoptCameraSettings",
  		value: function adoptCameraSettings() {
  			var camera = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;


  			if (camera !== null) {

  				this.uniforms.cameraNear.value = camera.near;
  				this.uniforms.cameraFar.value = camera.far;
  				this.uniforms.aspect.value = camera.aspect;
  			}
  		}
  	}]);
  	return BokehMaterial;
  }(three.ShaderMaterial);

  var fragment$2 = "uniform sampler2D tDiffuse;\r\n\r\nvarying vec2 vUv;\r\nvarying vec4 vOffset[3];\r\n\r\nvoid main() {\r\n\r\n\tconst vec2 threshold = vec2(EDGE_THRESHOLD);\r\n\r\n\t// Calculate color deltas.\r\n\tvec4 delta;\r\n\tvec3 c = texture2D(tDiffuse, vUv).rgb;\r\n\r\n\tvec3 cLeft = texture2D(tDiffuse, vOffset[0].xy).rgb;\r\n\tvec3 t = abs(c - cLeft);\r\n\tdelta.x = max(max(t.r, t.g), t.b);\r\n\r\n\tvec3 cTop = texture2D(tDiffuse, vOffset[0].zw).rgb;\r\n\tt = abs(c - cTop);\r\n\tdelta.y = max(max(t.r, t.g), t.b);\r\n\r\n\t// We do the usual threshold.\r\n\tvec2 edges = step(threshold, delta.xy);\r\n\r\n\t// Then discard if there is no edge.\r\n\tif(dot(edges, vec2(1.0)) == 0.0) {\r\n\r\n\t\tdiscard;\r\n\r\n\t}\r\n\r\n\t// Calculate right and bottom deltas.\r\n\tvec3 cRight = texture2D(tDiffuse, vOffset[1].xy).rgb;\r\n\tt = abs(c - cRight);\r\n\tdelta.z = max(max(t.r, t.g), t.b);\r\n\r\n\tvec3 cBottom = texture2D(tDiffuse, vOffset[1].zw).rgb;\r\n\tt = abs(c - cBottom);\r\n\tdelta.w = max(max(t.r, t.g), t.b);\r\n\r\n\t// Calculate the maximum delta in the direct neighborhood.\r\n\tfloat maxDelta = max(max(max(delta.x, delta.y), delta.z), delta.w);\r\n\r\n\t// Calculate left-left and top-top deltas.\r\n\tvec3 cLeftLeft = texture2D(tDiffuse, vOffset[2].xy).rgb;\r\n\tt = abs(c - cLeftLeft);\r\n\tdelta.z = max(max(t.r, t.g), t.b);\r\n\r\n\tvec3 cTopTop = texture2D(tDiffuse, vOffset[2].zw).rgb;\r\n\tt = abs(c - cTopTop);\r\n\tdelta.w = max(max(t.r, t.g), t.b);\r\n\r\n\t// Calculate the final maximum delta.\r\n\tmaxDelta = max(max(maxDelta, delta.z), delta.w);\r\n\r\n\t// Local contrast adaptation in action.\r\n\tedges.xy *= step(0.5 * maxDelta, delta.xy);\r\n\r\n\tgl_FragColor = vec4(edges, 0.0, 0.0);\r\n\r\n}\r\n";

  var vertex$2 = "uniform vec2 texelSize;\r\n\r\nvarying vec2 vUv;\r\nvarying vec4 vOffset[3];\r\n\r\nvoid main() {\r\n\r\n\tvUv = uv;\r\n\r\n\tvOffset[0] = uv.xyxy + texelSize.xyxy * vec4(-1.0, 0.0, 0.0, 1.0); // Changed sign in W component.\r\n\tvOffset[1] = uv.xyxy + texelSize.xyxy * vec4(1.0, 0.0, 0.0, -1.0); // Changed sign in W component.\r\n\tvOffset[2] = uv.xyxy + texelSize.xyxy * vec4(-2.0, 0.0, 0.0, 2.0); // Changed sign in W component.\r\n\r\n\tgl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\r\n\r\n}\r\n";

  var ColorEdgesMaterial = function (_ShaderMaterial) {
  	inherits(ColorEdgesMaterial, _ShaderMaterial);

  	function ColorEdgesMaterial() {
  		var texelSize = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : new three.Vector2();
  		classCallCheck(this, ColorEdgesMaterial);
  		return possibleConstructorReturn(this, (ColorEdgesMaterial.__proto__ || Object.getPrototypeOf(ColorEdgesMaterial)).call(this, {

  			type: "ColorEdgesMaterial",

  			defines: {

  				EDGE_THRESHOLD: "0.1"

  			},

  			uniforms: {

  				tDiffuse: new three.Uniform(null),
  				texelSize: new three.Uniform(texelSize)

  			},

  			fragmentShader: fragment$2,
  			vertexShader: vertex$2,

  			depthWrite: false,
  			depthTest: false

  		}));
  	}

  	createClass(ColorEdgesMaterial, [{
  		key: "setEdgeDetectionThreshold",
  		value: function setEdgeDetectionThreshold(threshold) {

  			this.defines.EDGE_THRESHOLD = threshold.toFixed("2");

  			this.needsUpdate = true;
  		}
  	}]);
  	return ColorEdgesMaterial;
  }(three.ShaderMaterial);

  var fragment$3 = "uniform sampler2D texture1;\r\nuniform sampler2D texture2;\r\n\r\nuniform float opacity1;\r\nuniform float opacity2;\r\n\r\nvarying vec2 vUv;\r\n\r\nvoid main() {\r\n\r\n\tvec4 texel1 = opacity1 * texture2D(texture1, vUv);\r\n\tvec4 texel2 = opacity2 * texture2D(texture2, vUv);\r\n\r\n\t#ifdef SCREEN_MODE\r\n\r\n\t\tvec3 invTexel1 = vec3(1.0) - texel1.rgb;\r\n\t\tvec3 invTexel2 = vec3(1.0) - texel2.rgb;\r\n\r\n\t\tvec4 color = vec4(\r\n\t\t\tvec3(1.0) - invTexel1 * invTexel2,\r\n\t\t\ttexel1.a + texel2.a\r\n\t\t);\r\n\r\n\t#else\r\n\r\n\t\tvec4 color = texel1 + texel2;\r\n\r\n\t#endif\r\n\r\n\tgl_FragColor = color;\r\n\r\n}\r\n";

  var vertex$3 = "varying vec2 vUv;\r\n\r\nvoid main() {\r\n\r\n\tvUv = uv;\r\n\tgl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\r\n\r\n}\r\n";

  var CombineMaterial = function (_ShaderMaterial) {
  	inherits(CombineMaterial, _ShaderMaterial);

  	function CombineMaterial() {
  		var screenMode = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
  		classCallCheck(this, CombineMaterial);

  		var _this = possibleConstructorReturn(this, (CombineMaterial.__proto__ || Object.getPrototypeOf(CombineMaterial)).call(this, {

  			type: "CombineMaterial",

  			uniforms: {

  				texture1: new three.Uniform(null),
  				texture2: new three.Uniform(null),

  				opacity1: new three.Uniform(1.0),
  				opacity2: new three.Uniform(1.0)

  			},

  			fragmentShader: fragment$3,
  			vertexShader: vertex$3,

  			depthWrite: false,
  			depthTest: false

  		}));

  		_this.setScreenModeEnabled(screenMode);

  		return _this;
  	}

  	createClass(CombineMaterial, [{
  		key: "setScreenModeEnabled",
  		value: function setScreenModeEnabled(enabled) {

  			if (enabled) {

  				this.defines.SCREEN_MODE = "1";
  			} else {

  				delete this.defines.SCREEN_MODE;
  			}

  			this.needsUpdate = true;
  		}
  	}]);
  	return CombineMaterial;
  }(three.ShaderMaterial);

  var fragment$4 = "#include <common>\r\n#include <dithering_pars_fragment>\r\n\r\nuniform sampler2D tDiffuse;\r\n\r\nvarying vec2 vUv0;\r\nvarying vec2 vUv1;\r\nvarying vec2 vUv2;\r\nvarying vec2 vUv3;\r\n\r\nvoid main() {\r\n\r\n\t// Sample top left texel.\r\n\tvec4 sum = texture2D(tDiffuse, vUv0);\r\n\r\n\t// Sample top right texel.\r\n\tsum += texture2D(tDiffuse, vUv1);\r\n\r\n\t// Sample bottom right texel.\r\n\tsum += texture2D(tDiffuse, vUv2);\r\n\r\n\t// Sample bottom left texel.\r\n\tsum += texture2D(tDiffuse, vUv3);\r\n\r\n\t// Compute the average.\r\n\tgl_FragColor = sum * 0.25;\r\n\r\n\t#include <dithering_fragment>\r\n\r\n}\r\n";

  var vertex$4 = "uniform vec2 texelSize;\r\nuniform vec2 halfTexelSize;\r\nuniform float kernel;\r\n\r\nvarying vec2 vUv0;\r\nvarying vec2 vUv1;\r\nvarying vec2 vUv2;\r\nvarying vec2 vUv3;\r\n\r\nvoid main() {\r\n\r\n\tvec2 dUv = (texelSize * vec2(kernel)) + halfTexelSize;\r\n\r\n\tvUv0 = vec2(uv.x - dUv.x, uv.y + dUv.y);\r\n\tvUv1 = vec2(uv.x + dUv.x, uv.y + dUv.y);\r\n\tvUv2 = vec2(uv.x + dUv.x, uv.y - dUv.y);\r\n\tvUv3 = vec2(uv.x - dUv.x, uv.y - dUv.y);\r\n\r\n\tgl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\r\n\r\n}\r\n";

  var ConvolutionMaterial = function (_ShaderMaterial) {
  	inherits(ConvolutionMaterial, _ShaderMaterial);

  	function ConvolutionMaterial() {
  		var texelSize = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : new three.Vector2();
  		classCallCheck(this, ConvolutionMaterial);

  		var _this = possibleConstructorReturn(this, (ConvolutionMaterial.__proto__ || Object.getPrototypeOf(ConvolutionMaterial)).call(this, {

  			type: "ConvolutionMaterial",

  			uniforms: {

  				tDiffuse: new three.Uniform(null),
  				texelSize: new three.Uniform(new three.Vector2()),
  				halfTexelSize: new three.Uniform(new three.Vector2()),
  				kernel: new three.Uniform(0.0)

  			},

  			fragmentShader: fragment$4,
  			vertexShader: vertex$4,

  			depthWrite: false,
  			depthTest: false

  		}));

  		_this.setTexelSize(texelSize.x, texelSize.y);

  		_this.kernelSize = KernelSize.LARGE;

  		return _this;
  	}

  	createClass(ConvolutionMaterial, [{
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

  var fragment$5 = "uniform sampler2D tDiffuse;\r\nuniform float opacity;\r\n\r\nvarying vec2 vUv;\r\n\r\nvoid main() {\r\n\r\n\tvec4 texel = texture2D(tDiffuse, vUv);\r\n\tgl_FragColor = opacity * texel;\r\n\r\n}\r\n";

  var vertex$5 = "varying vec2 vUv;\r\n\r\nvoid main() {\r\n\r\n\tvUv = uv;\r\n\tgl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\r\n\r\n}\r\n";

  var CopyMaterial = function (_ShaderMaterial) {
  			inherits(CopyMaterial, _ShaderMaterial);

  			function CopyMaterial() {
  						classCallCheck(this, CopyMaterial);
  						return possibleConstructorReturn(this, (CopyMaterial.__proto__ || Object.getPrototypeOf(CopyMaterial)).call(this, {

  									type: "CopyMaterial",

  									uniforms: {

  												tDiffuse: new three.Uniform(null),
  												opacity: new three.Uniform(1.0)

  									},

  									fragmentShader: fragment$5,
  									vertexShader: vertex$5,

  									depthWrite: false,
  									depthTest: false

  						}));
  			}

  			return CopyMaterial;
  }(three.ShaderMaterial);

  var fragment$6 = "#include <packing>\r\n#include <clipping_planes_pars_fragment>\r\n\r\nuniform sampler2D tDepth;\r\nuniform float cameraNear;\r\nuniform float cameraFar;\r\n\r\nvarying float vViewZ;\r\nvarying vec4 vProjTexCoord;\r\n\r\nvoid main() {\r\n\r\n\t#include <clipping_planes_fragment>\r\n\r\n\t// Transform into Cartesian coordinate (not mirrored).\r\n\tvec2 projTexCoord = (vProjTexCoord.xy / vProjTexCoord.w) * 0.5 + 0.5;\r\n\tprojTexCoord = clamp(projTexCoord, 0.002, 0.998);\r\n\r\n\tfloat fragCoordZ = unpackRGBAToDepth(texture2D(tDepth, projTexCoord));\r\n\r\n\t#ifdef PERSPECTIVE_CAMERA\r\n\r\n\t\tfloat viewZ = perspectiveDepthToViewZ(fragCoordZ, cameraNear, cameraFar);\r\n\r\n\t#else\r\n\r\n\t\tfloat viewZ = orthographicDepthToViewZ(fragCoordZ, cameraNear, cameraFar);\r\n\r\n\t#endif\r\n\r\n\tfloat depthTest = (-vViewZ > -viewZ) ? 1.0 : 0.0;\r\n\r\n\tgl_FragColor.rgb = vec3(0.0, depthTest, 1.0);\r\n\r\n}\r\n";

  var vertex$6 = "#include <common>\r\n#include <morphtarget_pars_vertex>\r\n#include <skinning_pars_vertex>\r\n#include <clipping_planes_pars_vertex>\r\n\r\nvarying float vViewZ;\r\nvarying vec4 vProjTexCoord;\r\n\r\nvoid main() {\r\n\r\n\t#include <skinbase_vertex>\r\n\r\n\t#include <begin_vertex>\r\n\t#include <morphtarget_vertex>\r\n\t#include <skinning_vertex>\r\n\t#include <project_vertex>\r\n\r\n\tvViewZ = mvPosition.z;\r\n\tvProjTexCoord = gl_Position;\r\n\r\n\t#include <clipping_planes_vertex>\r\n\r\n}\r\n";

  var DepthComparisonMaterial = function (_ShaderMaterial) {
  			inherits(DepthComparisonMaterial, _ShaderMaterial);

  			function DepthComparisonMaterial() {
  						var depthTexture = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
  						var camera = arguments[1];
  						classCallCheck(this, DepthComparisonMaterial);

  						var _this = possibleConstructorReturn(this, (DepthComparisonMaterial.__proto__ || Object.getPrototypeOf(DepthComparisonMaterial)).call(this, {

  									type: "DepthComparisonMaterial",

  									uniforms: {

  												tDepth: new three.Uniform(depthTexture),
  												cameraNear: new three.Uniform(0.1),
  												cameraFar: new three.Uniform(2000)

  									},

  									fragmentShader: fragment$6,
  									vertexShader: vertex$6,

  									depthWrite: false,
  									depthTest: false,

  									morphTargets: true,
  									skinning: true

  						}));

  						_this.adoptCameraSettings(camera);

  						return _this;
  			}

  			createClass(DepthComparisonMaterial, [{
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

  var fragment$7 = "uniform sampler2D tDiffuse;\r\n\r\nuniform float angle;\r\nuniform float scale;\r\nuniform float intensity;\r\n\r\nvarying vec2 vUv;\r\nvarying vec2 vUvPattern;\r\n\r\nfloat pattern() {\r\n\r\n\tfloat s = sin(angle);\r\n\tfloat c = cos(angle);\r\n\r\n\tvec2 point = vec2(c * vUvPattern.x - s * vUvPattern.y, s * vUvPattern.x + c * vUvPattern.y) * scale;\r\n\r\n\treturn (sin(point.x) * sin(point.y)) * 4.0;\r\n\r\n}\r\n\r\nvoid main() {\r\n\r\n\tvec4 texel = texture2D(tDiffuse, vUv);\r\n\tvec3 color = texel.rgb;\r\n\r\n\t#ifdef AVERAGE\r\n\r\n\t\tcolor = vec3((color.r + color.g + color.b) / 3.0);\r\n\r\n\t#endif\r\n\r\n\tcolor = vec3(color * 10.0 - 5.0 + pattern());\r\n\tcolor = texel.rgb + (color - texel.rgb) * intensity;\r\n\r\n\tgl_FragColor = vec4(color, texel.a);\r\n\r\n}\r\n";

  var vertex$7 = "uniform vec4 offsetRepeat;\r\n\r\nvarying vec2 vUv;\r\nvarying vec2 vUvPattern;\r\n\r\nvoid main() {\r\n\r\n\tvUv = uv;\r\n\tvUvPattern = uv * offsetRepeat.zw + offsetRepeat.xy;\r\n\tgl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\r\n\r\n}\r\n";

  var DotScreenMaterial = function (_ShaderMaterial) {
  	inherits(DotScreenMaterial, _ShaderMaterial);

  	function DotScreenMaterial() {
  		var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  		classCallCheck(this, DotScreenMaterial);


  		var settings = Object.assign({
  			average: false,
  			angle: 1.57,
  			scale: 1.0,
  			intensity: 1.0
  		}, options);

  		var _this = possibleConstructorReturn(this, (DotScreenMaterial.__proto__ || Object.getPrototypeOf(DotScreenMaterial)).call(this, {

  			type: "DotScreenMaterial",

  			uniforms: {

  				tDiffuse: new three.Uniform(null),

  				angle: new three.Uniform(settings.angle),
  				scale: new three.Uniform(settings.scale),
  				intensity: new three.Uniform(settings.intensity),

  				offsetRepeat: new three.Uniform(new three.Vector4(0.5, 0.5, 1.0, 1.0))

  			},

  			fragmentShader: fragment$7,
  			vertexShader: vertex$7,

  			depthWrite: false,
  			depthTest: false

  		}));

  		_this.setAverageEnabled(settings.average);

  		return _this;
  	}

  	createClass(DotScreenMaterial, [{
  		key: "setAverageEnabled",
  		value: function setAverageEnabled(enabled) {

  			if (enabled) {

  				this.defines.AVERAGE = "1";
  			} else {

  				delete this.defines.AVERAGE;
  			}

  			this.needsUpdate = true;
  		}
  	}]);
  	return DotScreenMaterial;
  }(three.ShaderMaterial);

  var fragment$8 = "uniform sampler2D tDiffuse;\r\nuniform float time;\r\n\r\nvarying vec2 vUv;\r\n\r\n#ifdef NOISE\r\n\r\n\tuniform float noiseIntensity;\r\n\r\n#endif\r\n\r\n#ifdef SCANLINES\r\n\r\n\tuniform float scanlineIntensity;\r\n\tuniform float scanlineCount;\r\n\r\n#endif\r\n\r\n#ifdef GRID\r\n\r\n\tuniform float gridIntensity;\r\n\tuniform vec2 gridScale;\r\n\tuniform float gridLineWidth;\r\n\r\n#endif\r\n\r\n#ifdef GREYSCALE\r\n\r\n\t#include <common>\r\n\r\n\tuniform float greyscaleIntensity;\r\n\r\n#elif defined(SEPIA)\r\n\r\n\tuniform float sepiaIntensity;\r\n\r\n#endif\r\n\r\n#ifdef VIGNETTE\r\n\r\n\tuniform float vignetteOffset;\r\n\tuniform float vignetteDarkness;\r\n\r\n#endif\r\n\r\nvoid main() {\r\n\r\n\tvec4 texel = texture2D(tDiffuse, vUv);\r\n\tvec3 color = texel.rgb;\r\n\r\n\t#ifdef SCREEN_MODE\r\n\r\n\t\tvec3 invColor;\r\n\r\n\t#endif\r\n\r\n\t#ifdef NOISE\r\n\r\n\t\tfloat x = vUv.x * vUv.y * time * 1000.0;\r\n\t\tx = mod(x, 13.0) * mod(x, 123.0);\r\n\t\tx = mod(x, 0.01);\r\n\r\n\t\tvec3 noise = texel.rgb * clamp(0.1 + x * 100.0, 0.0, 1.0) * noiseIntensity;\r\n\r\n\t\t#ifdef SCREEN_MODE\r\n\r\n\t\t\tinvColor = vec3(1.0) - color;\r\n\t\t\tvec3 invNoise = vec3(1.0) - noise;\r\n\r\n\t\t\tcolor = vec3(1.0) - invColor * invNoise;\r\n\r\n\t\t#else\r\n\r\n\t\t\tcolor += noise;\r\n\r\n\t\t#endif\r\n\r\n\t#endif\r\n\r\n\t#ifdef SCANLINES\r\n\r\n\t\tvec2 sl = vec2(sin(vUv.y * scanlineCount), cos(vUv.y * scanlineCount));\r\n\t\tvec3 scanlines = texel.rgb * vec3(sl.x, sl.y, sl.x) * scanlineIntensity;\r\n\r\n\t\t#ifdef SCREEN_MODE\r\n\r\n\t\t\tinvColor = vec3(1.0) - color;\r\n\t\t\tvec3 invScanlines = vec3(1.0) - scanlines;\r\n\r\n\t\t\tcolor = vec3(1.0) - invColor * invScanlines;\r\n\r\n\t\t#else\r\n\r\n\t\t\tcolor += scanlines;\r\n\r\n\t\t#endif\r\n\r\n\t#endif\r\n\r\n\t#ifdef GRID\r\n\r\n\t\tfloat grid = 0.5 - max(abs(mod(vUv.x * gridScale.x, 1.0) - 0.5), abs(mod(vUv.y * gridScale.y, 1.0) - 0.5));\r\n\t\tcolor *= (1.0 - gridIntensity) + vec3(smoothstep(0.0, gridLineWidth, grid)) * gridIntensity;\r\n\r\n\t#endif\r\n\r\n\t#ifdef GREYSCALE\r\n\r\n\t\tcolor = mix(color, vec3(linearToRelativeLuminance(color)), greyscaleIntensity);\r\n\r\n\t#elif defined(SEPIA)\r\n\r\n\t\tvec3 c = color.rgb;\r\n\r\n\t\tcolor.r = dot(c, vec3(1.0 - 0.607 * sepiaIntensity, 0.769 * sepiaIntensity, 0.189 * sepiaIntensity));\r\n\t\tcolor.g = dot(c, vec3(0.349 * sepiaIntensity, 1.0 - 0.314 * sepiaIntensity, 0.168 * sepiaIntensity));\r\n\t\tcolor.b = dot(c, vec3(0.272 * sepiaIntensity, 0.534 * sepiaIntensity, 1.0 - 0.869 * sepiaIntensity));\r\n\r\n\t#endif\r\n\r\n\t#ifdef VIGNETTE\r\n\r\n\t\tconst vec2 center = vec2(0.5);\r\n\r\n\t\t#ifdef ESKIL\r\n\r\n\t\t\tvec2 uv = (vUv - center) * vec2(vignetteOffset);\r\n\t\t\tcolor = mix(color.rgb, vec3(1.0 - vignetteDarkness), dot(uv, uv));\r\n\r\n\t\t#else\r\n\r\n\t\t\tfloat dist = distance(vUv, center);\r\n\t\t\tcolor *= smoothstep(0.8, vignetteOffset * 0.799, dist * (vignetteDarkness + vignetteOffset));\r\n\r\n\t\t#endif\t\t\r\n\r\n\t#endif\r\n\r\n\tgl_FragColor = vec4(clamp(color, 0.0, 1.0), texel.a);\r\n\r\n}\r\n";

  var vertex$8 = "varying vec2 vUv;\r\n\r\nvoid main() {\r\n\r\n\tvUv = uv;\r\n\tgl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\r\n\r\n}\r\n";

  var FilmMaterial = function (_ShaderMaterial) {
  		inherits(FilmMaterial, _ShaderMaterial);

  		function FilmMaterial() {
  				var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  				classCallCheck(this, FilmMaterial);


  				var settings = Object.assign({

  						screenMode: true,
  						noise: true,
  						scanlines: true,
  						grid: false,

  						greyscale: false,
  						sepia: false,
  						vignette: false,
  						eskil: false,

  						noiseIntensity: 0.5,
  						scanlineIntensity: 0.05,
  						gridIntensity: 1.0,
  						greyscaleIntensity: 1.0,
  						sepiaIntensity: 1.0,

  						vignetteOffset: 1.0,
  						vignetteDarkness: 1.0

  				}, options);

  				var _this = possibleConstructorReturn(this, (FilmMaterial.__proto__ || Object.getPrototypeOf(FilmMaterial)).call(this, {

  						type: "FilmMaterial",

  						uniforms: {

  								tDiffuse: new three.Uniform(null),
  								time: new three.Uniform(0.0),

  								noiseIntensity: new three.Uniform(settings.noiseIntensity),
  								scanlineIntensity: new three.Uniform(settings.scanlineIntensity),
  								gridIntensity: new three.Uniform(settings.gridIntensity),

  								scanlineCount: new three.Uniform(0.0),
  								gridScale: new three.Uniform(new three.Vector2()),
  								gridLineWidth: new three.Uniform(0.0),

  								greyscaleIntensity: new three.Uniform(settings.greyscaleIntensity),
  								sepiaIntensity: new three.Uniform(settings.sepiaIntensity),

  								vignetteOffset: new three.Uniform(settings.vignetteOffset),
  								vignetteDarkness: new three.Uniform(settings.vignetteDarkness)

  						},

  						fragmentShader: fragment$8,
  						vertexShader: vertex$8,

  						depthWrite: false,
  						depthTest: false

  				}));

  				_this.setScreenModeEnabled(settings.screenMode);
  				_this.setNoiseEnabled(settings.noise);
  				_this.setScanlinesEnabled(settings.scanlines);
  				_this.setGridEnabled(settings.grid);
  				_this.setGreyscaleEnabled(settings.greyscale);
  				_this.setSepiaEnabled(settings.sepia);
  				_this.setVignetteEnabled(settings.vignette);
  				_this.setEskilEnabled(settings.eskil);

  				return _this;
  		}

  		createClass(FilmMaterial, [{
  				key: "setScreenModeEnabled",
  				value: function setScreenModeEnabled(enabled) {

  						if (enabled) {

  								this.defines.SCREEN_MODE = "1";
  						} else {

  								delete this.defines.SCREEN_MODE;
  						}

  						this.needsUpdate = true;
  				}
  		}, {
  				key: "setNoiseEnabled",
  				value: function setNoiseEnabled(enabled) {

  						if (enabled) {

  								this.defines.NOISE = "1";
  						} else {

  								delete this.defines.NOISE;
  						}

  						this.needsUpdate = true;
  				}
  		}, {
  				key: "setScanlinesEnabled",
  				value: function setScanlinesEnabled(enabled) {

  						if (enabled) {

  								this.defines.SCANLINES = "1";
  						} else {

  								delete this.defines.SCANLINES;
  						}

  						this.needsUpdate = true;
  				}
  		}, {
  				key: "setGridEnabled",
  				value: function setGridEnabled(enabled) {

  						if (enabled) {

  								this.defines.GRID = "1";
  						} else {

  								delete this.defines.GRID;
  						}

  						this.needsUpdate = true;
  				}
  		}, {
  				key: "setGreyscaleEnabled",
  				value: function setGreyscaleEnabled(enabled) {

  						if (enabled) {

  								this.defines.GREYSCALE = "1";
  						} else {

  								delete this.defines.GREYSCALE;
  						}

  						this.needsUpdate = true;
  				}
  		}, {
  				key: "setSepiaEnabled",
  				value: function setSepiaEnabled(enabled) {

  						if (enabled) {

  								this.defines.SEPIA = "1";
  						} else {

  								delete this.defines.SEPIA;
  						}

  						this.needsUpdate = true;
  				}
  		}, {
  				key: "setVignetteEnabled",
  				value: function setVignetteEnabled(enabled) {

  						if (enabled) {

  								this.defines.VIGNETTE = "1";
  						} else {

  								delete this.defines.VIGNETTE;
  						}

  						this.needsUpdate = true;
  				}
  		}, {
  				key: "setEskilEnabled",
  				value: function setEskilEnabled(enabled) {

  						if (enabled) {

  								this.defines.ESKIL = "1";
  						} else {

  								delete this.defines.ESKIL;
  						}

  						this.needsUpdate = true;
  				}
  		}]);
  		return FilmMaterial;
  }(three.ShaderMaterial);

  var fragment$9 = "uniform sampler2D tDiffuse;\r\nuniform sampler2D tPerturb;\r\n\r\nuniform bool active;\r\n\r\nuniform float amount;\r\nuniform float angle;\r\nuniform float seed;\r\nuniform float seedX;\r\nuniform float seedY;\r\nuniform float distortionX;\r\nuniform float distortionY;\r\nuniform float colS;\r\n\r\nvarying vec2 vUv;\r\n\r\nfloat rand(vec2 tc) {\r\n\r\n\tconst float a = 12.9898;\r\n\tconst float b = 78.233;\r\n\tconst float c = 43758.5453;\r\n\r\n\tfloat dt = dot(tc, vec2(a, b));\r\n\tfloat sn = mod(dt, 3.14);\r\n\r\n\treturn fract(sin(sn) * c);\r\n\r\n}\r\n\r\nvoid main() {\r\n\r\n\tvec2 coord = vUv;\r\n\r\n\tfloat xs, ys;\r\n\tvec4 normal;\r\n\r\n\tvec2 offset;\r\n\tvec4 cr, cga, cb;\r\n\tvec4 snow, color;\r\n\r\n\tfloat sx, sy;\r\n\r\n\tif(active) {\r\n\r\n\t\txs = floor(gl_FragCoord.x / 0.5);\r\n\t\tys = floor(gl_FragCoord.y / 0.5);\r\n\r\n\t\tnormal = texture2D(tPerturb, coord * seed * seed);\r\n\r\n\t\tif(coord.y < distortionX + colS && coord.y > distortionX - colS * seed) {\r\n\r\n\t\t\tsx = clamp(ceil(seedX), 0.0, 1.0);\r\n\t\t\tcoord.y = sx * (1.0 - (coord.y + distortionY)) + (1.0 - sx) * distortionY;\r\n\r\n\t\t}\r\n\r\n\t\tif(coord.x < distortionY + colS && coord.x > distortionY - colS * seed) {\r\n\r\n\t\t\tsy = clamp(ceil(seedY), 0.0, 1.0);\r\n\t\t\tcoord.x = sy * distortionX + (1.0 - sy) * (1.0 - (coord.x + distortionX));\r\n\r\n\t\t}\r\n\r\n\t\tcoord.x += normal.x * seedX * (seed / 5.0);\r\n\t\tcoord.y += normal.y * seedY * (seed / 5.0);\r\n\r\n\t\toffset = amount * vec2(cos(angle), sin(angle));\r\n\r\n\t\tcr = texture2D(tDiffuse, coord + offset);\r\n\t\tcga = texture2D(tDiffuse, coord);\r\n\t\tcb = texture2D(tDiffuse, coord - offset);\r\n\r\n\t\tcolor = vec4(cr.r, cga.g, cb.b, cga.a);\r\n\t\tsnow = 200.0 * amount * vec4(rand(vec2(xs * seed, ys * seed * 50.0)) * 0.2);\r\n\t\tcolor += snow;\r\n\r\n\t} else {\r\n\r\n\t\tcolor = texture2D(tDiffuse, vUv);\r\n\r\n\t}\r\n\r\n\tgl_FragColor = color;\r\n\r\n}\r\n";

  var vertex$9 = "varying vec2 vUv;\r\n\r\nvoid main() {\r\n\r\n\tvUv = uv;\r\n\tgl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\r\n\r\n}\r\n";

  var GlitchMaterial = function (_ShaderMaterial) {
  			inherits(GlitchMaterial, _ShaderMaterial);

  			function GlitchMaterial() {
  						classCallCheck(this, GlitchMaterial);
  						return possibleConstructorReturn(this, (GlitchMaterial.__proto__ || Object.getPrototypeOf(GlitchMaterial)).call(this, {

  									type: "GlitchMaterial",

  									uniforms: {

  												tDiffuse: new three.Uniform(null),
  												tPerturb: new three.Uniform(null),

  												active: new three.Uniform(1),

  												amount: new three.Uniform(0.8),
  												angle: new three.Uniform(0.02),
  												seed: new three.Uniform(0.02),
  												seedX: new three.Uniform(0.02),
  												seedY: new three.Uniform(0.02),
  												distortionX: new three.Uniform(0.5),
  												distortionY: new three.Uniform(0.6),
  												colS: new three.Uniform(0.05)

  									},

  									fragmentShader: fragment$9,
  									vertexShader: vertex$9,

  									depthWrite: false,
  									depthTest: false

  						}));
  			}

  			return GlitchMaterial;
  }(three.ShaderMaterial);

  var fragment$a = "#include <common>\r\n#include <dithering_pars_fragment>\r\n\r\nuniform sampler2D tDiffuse;\r\nuniform vec3 lightPosition;\r\n\r\nuniform float exposure;\r\nuniform float decay;\r\nuniform float density;\r\nuniform float weight;\r\nuniform float clampMax;\r\n\r\nvarying vec2 vUv;\r\n\r\nvoid main() {\r\n\r\n\tvec2 texCoord = vUv;\r\n\r\n\t// Calculate vector from pixel to light source in screen space.\r\n\tvec2 deltaTexCoord = texCoord - lightPosition.st;\r\n\tdeltaTexCoord *= 1.0 / NUM_SAMPLES_FLOAT * density;\r\n\r\n\t// A decreasing illumination factor.\r\n\tfloat illuminationDecay = 1.0;\r\n\r\n\tvec4 sample;\r\n\tvec4 color = vec4(0.0);\r\n\r\n\t// Estimate the probability of occlusion at each pixel by summing samples along a ray to the light source.\r\n\tfor(int i = 0; i < NUM_SAMPLES_INT; ++i) {\r\n\r\n\t\ttexCoord -= deltaTexCoord;\r\n\t\tsample = texture2D(tDiffuse, texCoord);\r\n\r\n\t\t// Apply sample attenuation scale/decay factors.\r\n\t\tsample *= illuminationDecay * weight;\r\n\r\n\t\tcolor += sample;\r\n\r\n\t\t// Update exponential decay factor.\r\n\t\tilluminationDecay *= decay;\r\n\r\n\t}\r\n\r\n\tgl_FragColor = clamp(color * exposure, 0.0, clampMax);\r\n\r\n\t#include <dithering_fragment>\r\n\r\n}\r\n";

  var vertex$a = "varying vec2 vUv;\r\n\r\nvoid main() {\r\n\r\n\tvUv = uv;\r\n\tgl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\r\n\r\n}\r\n";

  var GodRaysMaterial = function (_ShaderMaterial) {
  			inherits(GodRaysMaterial, _ShaderMaterial);

  			function GodRaysMaterial() {
  						var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  						classCallCheck(this, GodRaysMaterial);


  						var settings = Object.assign({
  									exposure: 0.6,
  									density: 0.93,
  									decay: 0.96,
  									weight: 0.4,
  									clampMax: 1.0
  						}, options);

  						return possibleConstructorReturn(this, (GodRaysMaterial.__proto__ || Object.getPrototypeOf(GodRaysMaterial)).call(this, {

  									type: "GodRaysMaterial",

  									defines: {

  												NUM_SAMPLES_FLOAT: "60.0",
  												NUM_SAMPLES_INT: "60"

  									},

  									uniforms: {

  												tDiffuse: new three.Uniform(null),
  												lightPosition: new three.Uniform(null),

  												exposure: new three.Uniform(settings.exposure),
  												decay: new three.Uniform(settings.decay),
  												density: new three.Uniform(settings.density),
  												weight: new three.Uniform(settings.weight),
  												clampMax: new three.Uniform(settings.clampMax)

  									},

  									fragmentShader: fragment$a,
  									vertexShader: vertex$a,

  									depthWrite: false,
  									depthTest: false

  						}));
  			}

  			return GodRaysMaterial;
  }(three.ShaderMaterial);

  var fragment$b = "#include <common>\r\n\r\nuniform sampler2D tDiffuse;\r\nuniform float distinction;\r\nuniform vec2 range;\r\n\r\nvarying vec2 vUv;\r\n\r\nvoid main() {\r\n\r\n\tvec4 texel = texture2D(tDiffuse, vUv);\r\n\tfloat l = linearToRelativeLuminance(texel.rgb);\r\n\r\n\t#ifdef RANGE\r\n\r\n\t\tfloat low = step(range.x, l);\r\n\t\tfloat high = step(l, range.y);\r\n\r\n\t\t// Apply the mask.\r\n\t\tl *= low * high;\r\n\r\n\t#endif\r\n\r\n\tl = pow(abs(l), distinction);\r\n\r\n\t#ifdef COLOR\r\n\r\n\t\tgl_FragColor = vec4(texel.rgb * l, texel.a);\r\n\r\n\t#else\r\n\r\n\t\tgl_FragColor = vec4(l, l, l, texel.a);\r\n\r\n\t#endif\r\n\r\n}\r\n";

  var vertex$b = "varying vec2 vUv;\r\n\r\nvoid main() {\r\n\r\n\tvUv = uv;\r\n\tgl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\r\n\r\n}\r\n";

  var LuminosityMaterial = function (_ShaderMaterial) {
  		inherits(LuminosityMaterial, _ShaderMaterial);

  		function LuminosityMaterial() {
  				var colorOutput = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
  				var luminanceRange = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
  				classCallCheck(this, LuminosityMaterial);


  				var maskLuminance = luminanceRange !== null;

  				var _this = possibleConstructorReturn(this, (LuminosityMaterial.__proto__ || Object.getPrototypeOf(LuminosityMaterial)).call(this, {

  						type: "LuminosityMaterial",

  						uniforms: {

  								tDiffuse: new three.Uniform(null),
  								distinction: new three.Uniform(1.0),
  								range: new three.Uniform(maskLuminance ? luminanceRange : new three.Vector2())

  						},

  						fragmentShader: fragment$b,
  						vertexShader: vertex$b

  				}));

  				_this.setColorOutputEnabled(colorOutput);
  				_this.setLuminanceRangeEnabled(maskLuminance);

  				return _this;
  		}

  		createClass(LuminosityMaterial, [{
  				key: "setColorOutputEnabled",
  				value: function setColorOutputEnabled(enabled) {

  						if (enabled) {

  								this.defines.COLOR = "1";
  						} else {

  								delete this.defines.COLOR;
  						}

  						this.needsUpdate = true;
  				}
  		}, {
  				key: "setLuminanceRangeEnabled",
  				value: function setLuminanceRangeEnabled(enabled) {

  						if (enabled) {

  								this.defines.RANGE = "1";
  						} else {

  								delete this.defines.RANGE;
  						}

  						this.needsUpdate = true;
  				}
  		}]);
  		return LuminosityMaterial;
  }(three.ShaderMaterial);

  var fragment$c = "uniform sampler2D tDiffuse;\r\nuniform sampler2D tMask;\r\nuniform sampler2D tEdges;\r\n\r\nuniform vec3 visibleEdgeColor;\r\nuniform vec3 hiddenEdgeColor;\r\nuniform float pulse;\r\nuniform float edgeStrength;\r\n\r\n#ifdef USE_PATTERN\r\n\r\n\tuniform sampler2D tPattern;\r\n\tvarying vec2 vPatternCoord;\r\n\r\n#endif\r\n\r\nvarying vec2 vUv;\r\n\r\nvoid main() {\r\n\r\n\tvec4 color = texture2D(tDiffuse, vUv);\r\n\tvec2 edge = texture2D(tEdges, vUv).rg;\r\n\tvec2 mask = texture2D(tMask, vUv).rg;\r\n\r\n\t#ifndef X_RAY\r\n\r\n\t\tedge.y = 0.0;\r\n\r\n\t#endif\r\n\r\n\tedge *= (edgeStrength * mask.x * pulse);\r\n\tvec3 outlineColor = edge.x * visibleEdgeColor + edge.y * hiddenEdgeColor;\r\n\r\n\t#ifdef ALPHA_BLENDING\r\n\r\n\t\tcolor.rgb = mix(color.rgb, outlineColor, max(edge.x, edge.y));\r\n\r\n\t#else\r\n\r\n\t\tcolor.rgb += outlineColor;\r\n\r\n\t#endif\r\n\r\n\t#ifdef USE_PATTERN\r\n\r\n\t\tvec3 patternColor = texture2D(tPattern, vPatternCoord).rgb;\r\n\r\n\t\t#ifdef X_RAY\r\n\r\n\t\t\tfloat hiddenFactor = 0.5;\r\n\r\n\t\t#else\r\n\r\n\t\t\tfloat hiddenFactor = 0.0;\r\n\r\n\t\t#endif\r\n\r\n\t\tfloat visibilityFactor = (1.0 - mask.y > 0.0) ? 1.0 : hiddenFactor;\r\n\r\n\t\tcolor.rgb += visibilityFactor * (1.0 - mask.x) * (1.0 - patternColor);\r\n\r\n\t#endif\r\n\r\n\tgl_FragColor = color;\r\n\r\n}\r\n";

  var vertex$c = "#ifdef USE_PATTERN\r\n\r\n\tuniform float aspect;\r\n\tuniform float patternScale;\r\n\tvarying vec2 vPatternCoord;\r\n\r\n#endif\r\n\r\nvarying vec2 vUv;\r\n\r\nvoid main() {\r\n\r\n\t#ifdef USE_PATTERN\r\n\r\n\t\tvec2 aspectCorrection = vec2(aspect, 1.0);\r\n\t\tvPatternCoord = uv * aspectCorrection * patternScale;\r\n\r\n\t#endif\r\n\r\n\tvUv = uv;\r\n\r\n\tgl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\r\n\r\n}\r\n";

  var OutlineBlendMaterial = function (_ShaderMaterial) {
  		inherits(OutlineBlendMaterial, _ShaderMaterial);

  		function OutlineBlendMaterial() {
  				var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  				classCallCheck(this, OutlineBlendMaterial);


  				var settings = Object.assign({
  						edgeStrength: 1.0,
  						patternScale: 1.0,
  						visibleEdgeColor: 0xffffff,
  						hiddenEdgeColor: 0x22090A,
  						alphaBlending: false,
  						xRay: true
  				}, options);

  				var _this = possibleConstructorReturn(this, (OutlineBlendMaterial.__proto__ || Object.getPrototypeOf(OutlineBlendMaterial)).call(this, {

  						type: "OutlineBlendMaterial",

  						uniforms: {

  								pulse: new three.Uniform(1.0),
  								aspect: new three.Uniform(1.0),

  								tDiffuse: new three.Uniform(null),
  								tMask: new three.Uniform(null),
  								tEdges: new three.Uniform(null),
  								tPattern: new three.Uniform(null),

  								edgeStrength: new three.Uniform(settings.edgeStrength),
  								patternScale: new three.Uniform(settings.patternScale),

  								visibleEdgeColor: new three.Uniform(new three.Color(settings.visibleEdgeColor)),
  								hiddenEdgeColor: new three.Uniform(new three.Color(settings.hiddenEdgeColor))

  						},

  						fragmentShader: fragment$c,
  						vertexShader: vertex$c,

  						depthWrite: false,
  						depthTest: false

  				}));

  				_this.setAlphaBlendingEnabled(settings.alphaBlending);
  				_this.setXRayEnabled(settings.xRay);

  				return _this;
  		}

  		createClass(OutlineBlendMaterial, [{
  				key: "setAlphaBlendingEnabled",
  				value: function setAlphaBlendingEnabled(enabled) {

  						if (enabled) {

  								this.defines.ALPHA_BLENDING = "1";
  						} else {

  								delete this.defines.ALPHA_BLENDING;
  						}

  						this.needsUpdate = true;
  				}
  		}, {
  				key: "setXRayEnabled",
  				value: function setXRayEnabled(enabled) {

  						if (enabled) {

  								this.defines.X_RAY = "1";
  						} else {

  								delete this.defines.X_RAY;
  						}

  						this.needsUpdate = true;
  				}
  		}, {
  				key: "setPatternTexture",
  				value: function setPatternTexture() {
  						var texture = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;


  						if (texture !== null) {

  								this.defines.USE_PATTERN = "1";
  						} else {

  								delete this.defines.USE_PATTERN;
  						}

  						this.uniforms.tPattern.value = texture;
  						this.needsUpdate = true;
  				}
  		}]);
  		return OutlineBlendMaterial;
  }(three.ShaderMaterial);

  var fragment$d = "uniform sampler2D tMask;\r\n\r\nvarying vec2 vUv0;\r\nvarying vec2 vUv1;\r\nvarying vec2 vUv2;\r\nvarying vec2 vUv3;\r\n\r\nvoid main() {\r\n\r\n\tvec2 c0 = texture2D(tMask, vUv0).rg;\r\n\tvec2 c1 = texture2D(tMask, vUv1).rg;\r\n\tvec2 c2 = texture2D(tMask, vUv2).rg;\r\n\tvec2 c3 = texture2D(tMask, vUv3).rg;\r\n\r\n\tfloat d0 = (c0.x - c1.x) * 0.5;\r\n\tfloat d1 = (c2.x - c3.x) * 0.5;\r\n\tfloat d = length(vec2(d0, d1));\r\n\r\n\tfloat a0 = min(c0.y, c1.y);\r\n\tfloat a1 = min(c2.y, c3.y);\r\n\tfloat visibilityFactor = min(a0, a1);\r\n\r\n\tgl_FragColor.rg = (1.0 - visibilityFactor > 0.001) ? vec2(d, 0.0) : vec2(0.0, d);\r\n\r\n}\r\n";

  var vertex$d = "uniform vec2 texelSize;\r\n\r\nvarying vec2 vUv0;\r\nvarying vec2 vUv1;\r\nvarying vec2 vUv2;\r\nvarying vec2 vUv3;\r\n\r\nvoid main() {\r\n\r\n\tvUv0 = vec2(uv.x + texelSize.x, uv.y);\r\n\tvUv1 = vec2(uv.x - texelSize.x, uv.y);\r\n\tvUv2 = vec2(uv.x, uv.y + texelSize.y);\r\n\tvUv3 = vec2(uv.x, uv.y - texelSize.y);\r\n\r\n\tgl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\r\n\r\n}\r\n";

  var OutlineEdgesMaterial = function (_ShaderMaterial) {
  	inherits(OutlineEdgesMaterial, _ShaderMaterial);

  	function OutlineEdgesMaterial() {
  		var texelSize = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : new three.Vector2();
  		classCallCheck(this, OutlineEdgesMaterial);

  		var _this = possibleConstructorReturn(this, (OutlineEdgesMaterial.__proto__ || Object.getPrototypeOf(OutlineEdgesMaterial)).call(this, {

  			type: "OutlineEdgesMaterial",

  			uniforms: {

  				tMask: new three.Uniform(null),
  				texelSize: new three.Uniform(new three.Vector2())

  			},

  			fragmentShader: fragment$d,
  			vertexShader: vertex$d,

  			depthWrite: false,
  			depthTest: false

  		}));

  		_this.setTexelSize(texelSize.x, texelSize.y);

  		return _this;
  	}

  	createClass(OutlineEdgesMaterial, [{
  		key: "setTexelSize",
  		value: function setTexelSize(x, y) {

  			this.uniforms.texelSize.value.set(x, y);
  		}
  	}]);
  	return OutlineEdgesMaterial;
  }(three.ShaderMaterial);

  var fragment$e = "uniform sampler2D tDiffuse;\r\nuniform float granularity;\r\nuniform float dx;\r\nuniform float dy;\r\n\r\nvarying vec2 vUv;\r\n\r\nvoid main() {\r\n\r\n\tvec4 texel;\r\n\r\n\tif(granularity > 0.0) {\r\n\r\n\t\tvec2 coord = vec2(\r\n\t\t\tdx * (floor(vUv.x / dx) + 0.5),\r\n\t\t\tdy * (floor(vUv.y / dy) + 0.5)\r\n\t\t);\r\n\r\n\t\ttexel = texture2D(tDiffuse, coord);\r\n\r\n\t} else {\r\n\r\n\t\ttexel = texture2D(tDiffuse, vUv);\r\n\r\n\t}\r\n\r\n\tgl_FragColor = texel;\r\n\r\n}\r\n";

  var vertex$e = "varying vec2 vUv;\r\n\r\nvoid main() {\r\n\r\n\tvUv = uv;\r\n\tgl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\r\n\r\n}\r\n";

  var PixelationMaterial = function (_ShaderMaterial) {
  	inherits(PixelationMaterial, _ShaderMaterial);

  	function PixelationMaterial() {
  		classCallCheck(this, PixelationMaterial);
  		return possibleConstructorReturn(this, (PixelationMaterial.__proto__ || Object.getPrototypeOf(PixelationMaterial)).call(this, {

  			type: "PixelationMaterial",

  			uniforms: {

  				tDiffuse: new three.Uniform(null),
  				granularity: new three.Uniform(1.0),
  				resolution: new three.Uniform(new three.Vector2(1.0, 1.0)),
  				dx: new three.Uniform(1.0),
  				dy: new three.Uniform(1.0)

  			},

  			fragmentShader: fragment$e,
  			vertexShader: vertex$e,

  			depthWrite: false,
  			depthTest: false

  		}));
  	}

  	createClass(PixelationMaterial, [{
  		key: "setResolution",
  		value: function setResolution(width, height) {

  			this.uniforms.resolution.value.set(width, height);
  			this.granularity = this.granularity;
  		}
  	}, {
  		key: "granularity",
  		get: function get$$1() {

  			return this.uniforms.granularity.value;
  		},
  		set: function set$$1(x) {

  			var uniforms = this.uniforms;
  			var resolution = uniforms.resolution.value;

  			uniforms.granularity.value = x;
  			uniforms.dx.value = x / resolution.x;
  			uniforms.dy.value = x / resolution.y;
  		}
  	}]);
  	return PixelationMaterial;
  }(three.ShaderMaterial);

  var fragment$f = "#include <common>\r\n\r\nuniform sampler2D tDiffuse;\r\nuniform sampler2D tDepth;\r\n\r\nuniform vec2 texelSize;\r\nuniform vec2 halfTexelSize;\r\n\r\nuniform float cameraNear;\r\nuniform float cameraFar;\r\n\r\nuniform float focalLength;\r\nuniform float focalStop;\r\n\r\nuniform float maxBlur;\r\nuniform float luminanceThreshold;\r\nuniform float luminanceGain;\r\nuniform float bias;\r\nuniform float fringe;\r\nuniform float ditherStrength;\r\n\r\n#ifdef SHADER_FOCUS\r\n\r\n\tuniform vec2 focusCoords;\r\n\r\n#else\r\n\r\n\tuniform float focalDepth;\r\n\r\n#endif\r\n\r\nvarying vec2 vUv;\r\n\r\n#ifndef USE_LOGDEPTHBUF\r\n\r\n\t#include <packing>\r\n\r\n\tfloat readDepth(sampler2D depthSampler, vec2 coord) {\r\n\r\n\t\tfloat fragCoordZ = texture2D(depthSampler, coord).x;\r\n\t\tfloat viewZ = perspectiveDepthToViewZ(fragCoordZ, cameraNear, cameraFar);\r\n\r\n\t\treturn viewZToOrthographicDepth(viewZ, cameraNear, cameraFar);\r\n\r\n\t}\r\n\r\n#endif\r\n\r\n#ifdef PENTAGON\r\n\r\n\tfloat penta(vec2 coords) {\r\n\r\n\t\tconst vec4 HS0 = vec4( 1.0,          0.0,         0.0, 1.0);\r\n\t\tconst vec4 HS1 = vec4( 0.309016994,  0.951056516, 0.0, 1.0);\r\n\t\tconst vec4 HS2 = vec4(-0.809016994,  0.587785252, 0.0, 1.0);\r\n\t\tconst vec4 HS3 = vec4(-0.809016994, -0.587785252, 0.0, 1.0);\r\n\t\tconst vec4 HS4 = vec4( 0.309016994, -0.951056516, 0.0, 1.0);\r\n\t\tconst vec4 HS5 = vec4( 0.0,          0.0,         1.0, 1.0);\r\n\r\n\t\tconst vec4 ONE = vec4(1.0);\r\n\r\n\t\tconst float P_FEATHER = 0.4;\r\n\t\tconst float N_FEATHER = -P_FEATHER;\r\n\r\n\t\tfloat inOrOut = -4.0;\r\n\r\n\t\tvec4 P = vec4(coords, vec2(RINGS_FLOAT - 1.3));\r\n\r\n\t\tvec4 dist = vec4(\r\n\t\t\tdot(P, HS0),\r\n\t\t\tdot(P, HS1),\r\n\t\t\tdot(P, HS2),\r\n\t\t\tdot(P, HS3)\r\n\t\t);\r\n\r\n\t\tdist = smoothstep(N_FEATHER, P_FEATHER, dist);\r\n\r\n\t\tinOrOut += dot(dist, ONE);\r\n\r\n\t\tdist.x = dot(P, HS4);\r\n\t\tdist.y = HS5.w - abs(P.z);\r\n\r\n\t\tdist = smoothstep(N_FEATHER, P_FEATHER, dist);\r\n\t\tinOrOut += dist.x;\r\n\r\n\t\treturn clamp(inOrOut, 0.0, 1.0);\r\n\r\n\t}\r\n\r\n#endif\r\n\r\n#ifdef SHOW_FOCUS\r\n\r\n\tvec3 debugFocus(vec3 c, float blur, float depth) {\r\n\r\n\t\tfloat edge = 0.002 * depth;\r\n\t\tfloat m = clamp(smoothstep(0.0, edge, blur), 0.0, 1.0);\r\n\t\tfloat e = clamp(smoothstep(1.0 - edge, 1.0, blur), 0.0, 1.0);\r\n\r\n\t\tc = mix(c, vec3(1.0, 0.5, 0.0), (1.0 - m) * 0.6);\r\n\t\tc = mix(c, vec3(0.0, 0.5, 1.0), ((1.0 - e) - (1.0 - m)) * 0.2);\r\n\r\n\t\treturn c;\r\n\r\n\t}\r\n\r\n#endif\r\n\r\n#ifdef VIGNETTE\r\n\r\n\tfloat vignette() {\r\n\r\n\t\tconst vec2 CENTER = vec2(0.5);\r\n\r\n\t\tconst float VIGNETTE_OUT = 1.3;\r\n\t\tconst float VIGNETTE_IN = 0.0;\r\n\t\tconst float VIGNETTE_FADE = 22.0; \r\n\r\n\t\tfloat d = distance(vUv, CENTER);\r\n\t\td = smoothstep(VIGNETTE_OUT + (focalStop / VIGNETTE_FADE), VIGNETTE_IN + (focalStop / VIGNETTE_FADE), d);\r\n\r\n\t\treturn clamp(d, 0.0, 1.0);\r\n\r\n\t}\r\n\r\n#endif\r\n\r\nvec2 rand2(vec2 coord) {\r\n\r\n\tvec2 noise;\r\n\r\n\t#ifdef NOISE\r\n\r\n\t\tconst float a = 12.9898;\r\n\t\tconst float b = 78.233;\r\n\t\tconst float c = 43758.5453;\r\n\r\n\t\tnoise.x = clamp(fract(sin(mod(dot(coord, vec2(a, b)), 3.14)) * c), 0.0, 1.0) * 2.0 - 1.0;\r\n\t\tnoise.y = clamp(fract(sin(mod(dot(coord, vec2(a, b) * 2.0), 3.14)) * c), 0.0, 1.0) * 2.0 - 1.0;\r\n\r\n\t#else\r\n\r\n\t\tnoise.x = ((fract(1.0 - coord.s * halfTexelSize.x) * 0.25) + (fract(coord.t * halfTexelSize.y) * 0.75)) * 2.0 - 1.0;\r\n\t\tnoise.y = ((fract(1.0 - coord.s * halfTexelSize.x) * 0.75) + (fract(coord.t * halfTexelSize.y) * 0.25)) * 2.0 - 1.0;\r\n\r\n\t#endif\r\n\r\n\treturn noise;\r\n\r\n}\r\n\r\nvec3 processTexel(vec2 coords, float blur) {\r\n\r\n\tvec3 c;\r\n\tc.r = texture2D(tDiffuse, coords + vec2(0.0, 1.0) * texelSize * fringe * blur).r;\r\n\tc.g = texture2D(tDiffuse, coords + vec2(-0.866, -0.5) * texelSize * fringe * blur).g;\r\n\tc.b = texture2D(tDiffuse, coords + vec2(0.866, -0.5) * texelSize * fringe * blur).b;\r\n\r\n\t// Calculate the luminance of the constructed colour.\r\n\tfloat luminance = linearToRelativeLuminance(c);\r\n\tfloat threshold = max((luminance - luminanceThreshold) * luminanceGain, 0.0);\r\n\r\n\treturn c + mix(vec3(0.0), c, threshold * blur);\r\n\r\n}\r\n\r\nfloat linearize(float depth) {\r\n\r\n\treturn -cameraFar * cameraNear / (depth * (cameraFar - cameraNear) - cameraFar);\r\n\r\n}\r\n\r\nfloat gather(float i, float j, float ringSamples, inout vec3 color, float w, float h, float blur) {\r\n\r\n\tconst float TWO_PI = 6.28318531;\r\n\r\n\tfloat step = TWO_PI / ringSamples;\r\n\tfloat pw = cos(j * step) * i;\r\n\tfloat ph = sin(j * step) * i;\r\n\r\n\t#ifdef PENTAGON\r\n\r\n\t\tfloat p = penta(vec2(pw, ph));\r\n\r\n\t#else\r\n\r\n\t\tfloat p = 1.0;\r\n\r\n\t#endif\r\n\r\n\tcolor += processTexel(vUv + vec2(pw * w, ph * h), blur) * mix(1.0, i / RINGS_FLOAT, bias) * p;\r\n\r\n\treturn mix(1.0, i / RINGS_FLOAT, bias) * p;\r\n\r\n}\r\n\r\nvoid main() {\r\n\r\n\t#ifdef USE_LOGDEPTHBUF\r\n\r\n\t\tfloat depth = linearize(texture2D(tDepth, vUv).x);\r\n\r\n\t#else\r\n\r\n\t\tfloat depth = linearize(readDepth(tDepth, vUv));\r\n\r\n\t#endif\r\n\r\n\t#ifdef SHADER_FOCUS\r\n\r\n\t\t#ifdef USE_LOGDEPTHBUF\r\n\r\n\t\t\tfloat fDepth = linearize(texture2D(tDepth, focusCoords).x);\r\n\r\n\t\t#else\r\n\r\n\t\t\tfloat fDepth = linearize(readDepth(tDepth, focusCoords));\r\n\r\n\t\t#endif\r\n\r\n\t#else\r\n\r\n\t\tfloat fDepth = focalDepth;\r\n\r\n\t#endif\r\n\r\n\t#ifdef MANUAL_DOF\r\n\r\n\t\tconst float nDoFStart = 1.0; \r\n\t\tconst float nDoFDist = 2.0;\r\n\t\tconst float fDoFStart = 1.0;\r\n\t\tconst float fDoFDist = 3.0;\r\n\r\n\t\tfloat focalPlane = depth - fDepth;\r\n\t\tfloat farDoF = (focalPlane - fDoFStart) / fDoFDist;\r\n\t\tfloat nearDoF = (-focalPlane - nDoFStart) / nDoFDist;\r\n\r\n\t\tfloat blur = (focalPlane > 0.0) ? farDoF : nearDoF;\r\n\r\n\t#else\r\n\r\n\t\tconst float CIRCLE_OF_CONFUSION = 0.03; // 35mm film = 0.03mm CoC.\r\n\r\n\t\tfloat focalPlaneMM = fDepth * 1000.0;\r\n\t\tfloat depthMM = depth * 1000.0;\r\n\r\n\t\tfloat focalPlane = (depthMM * focalLength) / (depthMM - focalLength);\r\n\t\tfloat farDoF = (focalPlaneMM * focalLength) / (focalPlaneMM - focalLength);\r\n\t\tfloat nearDoF = (focalPlaneMM - focalLength) / (focalPlaneMM * focalStop * CIRCLE_OF_CONFUSION);\r\n\r\n\t\tfloat blur = abs(focalPlane - farDoF) * nearDoF;\r\n\r\n\t#endif\r\n\r\n\tblur = clamp(blur, 0.0, 1.0);\r\n\r\n\t// Dithering.\r\n\tvec2 noise = rand2(vUv) * ditherStrength * blur;\r\n\r\n\tfloat blurFactorX = texelSize.x * blur * maxBlur + noise.x;\r\n\tfloat blurFactorY = texelSize.y * blur * maxBlur + noise.y;\r\n\r\n\tconst int MAX_RING_SAMPLES = RINGS_INT * SAMPLES_INT;\r\n\r\n\t// Calculation of final color.\r\n\tvec4 color;\r\n\r\n\tif(blur < 0.05) {\r\n\r\n\t\tcolor = texture2D(tDiffuse, vUv);\r\n\r\n\t} else {\r\n\r\n\t\tcolor = texture2D(tDiffuse, vUv);\r\n\r\n\t\tfloat s = 1.0;\r\n\t\tint ringSamples;\r\n\r\n\t\tfor(int i = 1; i <= RINGS_INT; ++i) {\r\n\r\n\t\t\tringSamples = i * SAMPLES_INT;\r\n\r\n\t\t\t// Constant loop.\r\n\t\t\tfor(int j = 0; j < MAX_RING_SAMPLES; ++j) {\r\n\r\n\t\t\t\t// Break earlier.\r\n\t\t\t\tif(j >= ringSamples) { break; }\r\n\r\n\t\t\t\ts += gather(float(i), float(j), float(ringSamples), color.rgb, blurFactorX, blurFactorY, blur);\r\n\r\n\t\t\t}\r\n\r\n\t\t}\r\n\r\n\t\tcolor.rgb /= s; // Divide by sample count.\r\n\r\n\t}\r\n\r\n\t#ifdef SHOW_FOCUS\r\n\r\n\t\tcolor.rgb = debugFocus(color.rgb, blur, depth);\r\n\r\n\t#endif\r\n\r\n\t#ifdef VIGNETTE\r\n\r\n\t\tcolor.rgb *= vignette();\r\n\r\n\t#endif\r\n\r\n\tgl_FragColor = color;\r\n\r\n}\r\n";

  var vertex$f = "varying vec2 vUv;\r\n\r\nvoid main() {\r\n\r\n\tvUv = uv;\r\n\tgl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\r\n\r\n}\r\n";

  var RealisticBokehMaterial = function (_ShaderMaterial) {
  		inherits(RealisticBokehMaterial, _ShaderMaterial);

  		function RealisticBokehMaterial() {
  				var camera = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
  				var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  				classCallCheck(this, RealisticBokehMaterial);


  				var settings = Object.assign({
  						texelSize: null,
  						rings: 3,
  						samples: 2,
  						showFocus: false,
  						manualDoF: false,
  						vignette: false,
  						pentagon: false,
  						shaderFocus: true,
  						noise: true,
  						maxBlur: 1.0,
  						luminanceThreshold: 0.5,
  						luminanceGain: 2.0,
  						bias: 0.5,
  						fringe: 0.7,
  						ditherStrength: 0.0001
  				}, options);

  				var _this = possibleConstructorReturn(this, (RealisticBokehMaterial.__proto__ || Object.getPrototypeOf(RealisticBokehMaterial)).call(this, {

  						type: "RealisticBokehMaterial",

  						defines: {

  								RINGS_INT: settings.rings.toFixed(0),
  								RINGS_FLOAT: settings.rings.toFixed(1),
  								SAMPLES_INT: settings.samples.toFixed(0),
  								SAMPLES_FLOAT: settings.samples.toFixed(1)

  						},

  						uniforms: {

  								tDiffuse: new three.Uniform(null),
  								tDepth: new three.Uniform(null),

  								texelSize: new three.Uniform(new three.Vector2()),
  								halfTexelSize: new three.Uniform(new three.Vector2()),

  								cameraNear: new three.Uniform(0.1),
  								cameraFar: new three.Uniform(2000),

  								focalLength: new three.Uniform(24.0),
  								focalStop: new three.Uniform(0.9),

  								maxBlur: new three.Uniform(settings.maxBlur),
  								luminanceThreshold: new three.Uniform(settings.luminanceThreshold),
  								luminanceGain: new three.Uniform(settings.luminanceGain),
  								bias: new three.Uniform(settings.bias),
  								fringe: new three.Uniform(settings.fringe),
  								ditherStrength: new three.Uniform(settings.ditherStrength),

  								focusCoords: new three.Uniform(new three.Vector2(0.5, 0.5)),
  								focalDepth: new three.Uniform(1.0)

  						},

  						fragmentShader: fragment$f,
  						vertexShader: vertex$f,

  						depthWrite: false,
  						depthTest: false

  				}));

  				_this.setShowFocusEnabled(settings.showFocus);
  				_this.setManualDepthOfFieldEnabled(settings.manualDoF);
  				_this.setVignetteEnabled(settings.vignette);
  				_this.setPentagonEnabled(settings.pentagon);
  				_this.setShaderFocusEnabled(settings.shaderFocus);
  				_this.setNoiseEnabled(settings.noise);

  				if (settings.texelSize !== null) {

  						_this.setTexelSize(settings.texelSize.x, settings.texelSize.y);
  				}

  				_this.adoptCameraSettings(camera);

  				return _this;
  		}

  		createClass(RealisticBokehMaterial, [{
  				key: "setShowFocusEnabled",
  				value: function setShowFocusEnabled(enabled) {

  						if (enabled) {

  								this.defines.SHOW_FOCUS = "1";
  						} else {

  								delete this.defines.SHOW_FOCUS;
  						}

  						this.needsUpdate = true;
  				}
  		}, {
  				key: "setManualDepthOfFieldEnabled",
  				value: function setManualDepthOfFieldEnabled(enabled) {

  						if (enabled) {

  								this.defines.MANUAL_DOF = "1";
  						} else {

  								delete this.defines.MANUAL_DOF;
  						}

  						this.needsUpdate = true;
  				}
  		}, {
  				key: "setVignetteEnabled",
  				value: function setVignetteEnabled(enabled) {

  						if (enabled) {

  								this.defines.VIGNETTE = "1";
  						} else {

  								delete this.defines.VIGNETTE;
  						}

  						this.needsUpdate = true;
  				}
  		}, {
  				key: "setPentagonEnabled",
  				value: function setPentagonEnabled(enabled) {

  						if (enabled) {

  								this.defines.PENTAGON = "1";
  						} else {

  								delete this.defines.PENTAGON;
  						}

  						this.needsUpdate = true;
  				}
  		}, {
  				key: "setShaderFocusEnabled",
  				value: function setShaderFocusEnabled(enabled) {

  						if (enabled) {

  								this.defines.SHADER_FOCUS = "1";
  						} else {

  								delete this.defines.SHADER_FOCUS;
  						}

  						this.needsUpdate = true;
  				}
  		}, {
  				key: "setNoiseEnabled",
  				value: function setNoiseEnabled(enabled) {

  						if (enabled) {

  								this.defines.NOISE = "1";
  						} else {

  								delete this.defines.NOISE;
  						}

  						this.needsUpdate = true;
  				}
  		}, {
  				key: "setTexelSize",
  				value: function setTexelSize(x, y) {

  						this.uniforms.texelSize.value.set(x, y);
  						this.uniforms.halfTexelSize.value.set(x, y).multiplyScalar(0.5);
  				}
  		}, {
  				key: "adoptCameraSettings",
  				value: function adoptCameraSettings(camera) {

  						if (camera !== null) {

  								this.uniforms.cameraNear.value = camera.near;
  								this.uniforms.cameraFar.value = camera.far;
  								this.uniforms.focalLength.value = camera.getFocalLength();
  						}
  				}
  		}]);
  		return RealisticBokehMaterial;
  }(three.ShaderMaterial);

  var fragment$g = "#include <common>\r\n\r\nuniform sampler2D tDiffuse;\r\nuniform vec2 center;\r\nuniform float aspect;\r\nuniform float waveSize;\r\nuniform float radius;\r\nuniform float maxRadius;\r\nuniform float amplitude;\r\n\r\nvarying vec2 vUv;\r\nvarying float vSize;\r\n\r\nvoid main() {\r\n\r\n\tvec2 aspectCorrection = vec2(aspect, 1.0);\r\n\r\n\tvec2 difference = vUv * aspectCorrection - center * aspectCorrection;\r\n\tfloat distance = sqrt(dot(difference, difference)) * vSize;\r\n\r\n\tvec2 displacement = vec2(0.0);\r\n\r\n\tif(distance > radius) {\r\n\r\n\t\tif(distance < radius + waveSize) {\r\n\r\n\t\t\tfloat angle = (distance - radius) * PI2 / waveSize;\r\n\t\t\tfloat cosSin = (1.0 - cos(angle)) * 0.5;\r\n\r\n\t\t\tfloat extent = maxRadius + waveSize;\r\n\t\t\tfloat decay = max(extent - distance * distance, 0.0) / extent;\r\n\r\n\t\t\tdisplacement = ((cosSin * amplitude * difference) / distance) * decay;\r\n\r\n\t\t}\r\n\r\n\t}\r\n\r\n\tgl_FragColor = texture2D(tDiffuse, vUv - displacement);\r\n\r\n}\r\n";

  var vertex$g = "uniform float size;\r\nuniform float scale;\r\nuniform float cameraDistance;\r\n\r\nvarying vec2 vUv;\r\nvarying float vSize;\r\n\r\nvoid main() {\r\n\r\n\tvUv = uv;\r\n\tvSize = (0.1 * cameraDistance) / size;\r\n\tgl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\r\n\r\n}\r\n";

  var ShockWaveMaterial = function (_ShaderMaterial) {
  	inherits(ShockWaveMaterial, _ShaderMaterial);

  	function ShockWaveMaterial() {
  		var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  		classCallCheck(this, ShockWaveMaterial);


  		var settings = Object.assign({
  			maxRadius: 1.0,
  			waveSize: 0.2,
  			amplitude: 0.05
  		}, options);

  		return possibleConstructorReturn(this, (ShockWaveMaterial.__proto__ || Object.getPrototypeOf(ShockWaveMaterial)).call(this, {

  			type: "ShockWaveMaterial",

  			uniforms: {

  				tDiffuse: new three.Uniform(null),

  				center: new three.Uniform(new three.Vector2(0.5, 0.5)),
  				aspect: new three.Uniform(1.0),
  				cameraDistance: new three.Uniform(1.0),

  				size: new three.Uniform(1.0),
  				radius: new three.Uniform(-settings.waveSize),
  				maxRadius: new three.Uniform(settings.maxRadius),
  				waveSize: new three.Uniform(settings.waveSize),
  				amplitude: new three.Uniform(settings.amplitude)

  			},

  			fragmentShader: fragment$g,
  			vertexShader: vertex$g,

  			depthWrite: false,
  			depthTest: false

  		}));
  	}

  	return ShockWaveMaterial;
  }(three.ShaderMaterial);

  var fragment$h = "uniform sampler2D tDiffuse;\r\nuniform sampler2D tWeights;\r\n\r\nuniform vec2 texelSize;\r\n\r\nvarying vec2 vUv;\r\nvarying vec4 vOffset;\r\n\r\nvoid main() {\r\n\r\n\t// Fetch the blending weights for current pixel.\r\n\tvec4 a;\r\n\ta.xz = texture2D(tWeights, vUv).xz;\r\n\ta.y = texture2D(tWeights, vOffset.zw).g;\r\n\ta.w = texture2D(tWeights, vOffset.xy).a;\r\n\r\n\tvec4 color;\r\n\r\n\t// Check if there is any blending weight with a value greater than 0.0.\r\n\tif(dot(a, vec4(1.0)) < 1e-5) {\r\n\r\n\t\tcolor = texture2D(tDiffuse, vUv, 0.0);\r\n\r\n\t} else {\r\n\r\n\t\t/* Up to four lines can be crossing a pixel (one through each edge).\r\n\t\t * The line with the maximum weight for each direction is favoured.\r\n\t\t */\r\n\r\n\t\tvec2 offset;\r\n\t\toffset.x = a.a > a.b ? a.a : -a.b; // Left vs. right.\r\n\t\toffset.y = a.g > a.r ? -a.g : a.r; // Top vs. bottom (changed signs).\r\n\r\n\t\t// Go in the direction with the maximum weight (horizontal vs. vertical).\r\n\t\tif(abs(offset.x) > abs(offset.y)) {\r\n\r\n\t\t\toffset.y = 0.0;\r\n\r\n\t\t} else {\r\n\r\n\t\t\toffset.x = 0.0;\r\n\r\n\t\t}\r\n\r\n\t\t// Fetch the opposite color and lerp by hand.\r\n\t\tcolor = texture2D(tDiffuse, vUv, 0.0);\r\n\t\tvec2 coord = vUv + sign(offset) * texelSize;\r\n\t\tvec4 oppositeColor = texture2D(tDiffuse, coord, 0.0);\r\n\t\tfloat s = abs(offset.x) > abs(offset.y) ? abs(offset.x) : abs(offset.y);\r\n\r\n\t\t// Gamma correction.\r\n\t\tcolor.rgb = pow(abs(color.rgb), vec3(2.2));\r\n\t\toppositeColor.rgb = pow(abs(oppositeColor.rgb), vec3(2.2));\r\n\t\tcolor = mix(color, oppositeColor, s);\r\n\t\tcolor.rgb = pow(abs(color.rgb), vec3(1.0 / 2.2));\r\n\r\n\t}\r\n\r\n\tgl_FragColor = color;\r\n\r\n}\r\n";

  var vertex$h = "uniform vec2 texelSize;\r\n\r\nvarying vec2 vUv;\r\nvarying vec4 vOffset;\r\n\r\nvoid main() {\r\n\r\n\tvUv = uv;\r\n\r\n\tvOffset = uv.xyxy + texelSize.xyxy * vec4(1.0, 0.0, 0.0, -1.0); // Changed sign in W component.\r\n\r\n\tgl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\r\n\r\n}\r\n";

  var SMAABlendMaterial = function (_ShaderMaterial) {
  			inherits(SMAABlendMaterial, _ShaderMaterial);

  			function SMAABlendMaterial() {
  						var texelSize = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : new three.Vector2();
  						classCallCheck(this, SMAABlendMaterial);
  						return possibleConstructorReturn(this, (SMAABlendMaterial.__proto__ || Object.getPrototypeOf(SMAABlendMaterial)).call(this, {

  									type: "SMAABlendMaterial",

  									uniforms: {

  												tDiffuse: new three.Uniform(null),
  												tWeights: new three.Uniform(null),
  												texelSize: new three.Uniform(texelSize)

  									},

  									fragmentShader: fragment$h,
  									vertexShader: vertex$h,

  									depthWrite: false,
  									depthTest: false

  						}));
  			}

  			return SMAABlendMaterial;
  }(three.ShaderMaterial);

  var fragment$i = "#define sampleLevelZeroOffset(t, coord, offset) texture2D(t, coord + float(offset) * texelSize, 0.0)\r\n\r\nuniform sampler2D tDiffuse;\r\nuniform sampler2D tArea;\r\nuniform sampler2D tSearch;\r\n\r\nuniform vec2 texelSize;\r\n\r\nvarying vec2 vUv;\r\nvarying vec4 vOffset[3];\r\nvarying vec2 vPixCoord;\r\n\r\nvec2 round(vec2 x) {\r\n\r\n\treturn sign(x) * floor(abs(x) + 0.5);\r\n\r\n}\r\n\r\nfloat searchLength(vec2 e, float bias, float scale) {\r\n\r\n\t// Not required if tSearch accesses are set to point.\r\n\t// const vec2 SEARCH_TEX_PIXEL_SIZE = 1.0 / vec2(66.0, 33.0);\r\n\t// e = vec2(bias, 0.0) + 0.5 * SEARCH_TEX_PIXEL_SIZE + e * vec2(scale, 1.0) * vec2(64.0, 32.0) * SEARCH_TEX_PIXEL_SIZE;\r\n\r\n\te.r = bias + e.r * scale;\r\n\r\n\treturn 255.0 * texture2D(tSearch, e, 0.0).r;\r\n\r\n}\r\n\r\nfloat searchXLeft(vec2 texCoord, float end) {\r\n\r\n\t/* @PSEUDO_GATHER4\r\n\t * This texCoord has been offset by (-0.25, -0.125) in the vertex shader to\r\n\t * sample between edge, thus fetching four edges in a row.\r\n\t * Sampling with different offsets in each direction allows to disambiguate\r\n\t * which edges are active from the four fetched ones.\r\n\t */\r\n\r\n\tvec2 e = vec2(0.0, 1.0);\r\n\r\n\tfor(int i = 0; i < MAX_SEARCH_STEPS_INT; ++i) {\r\n\r\n\t\te = texture2D(tDiffuse, texCoord, 0.0).rg;\r\n\t\ttexCoord -= vec2(2.0, 0.0) * texelSize;\r\n\r\n\t\tif(!(texCoord.x > end && e.g > 0.8281 && e.r == 0.0)) { break; }\r\n\r\n\t}\r\n\r\n\t// Correct the previously applied offset (-0.25, -0.125).\r\n\ttexCoord.x += 0.25 * texelSize.x;\r\n\r\n\t// The searches are biased by 1, so adjust the coords accordingly.\r\n\ttexCoord.x += texelSize.x;\r\n\r\n\t// Disambiguate the length added by the last step.\r\n\ttexCoord.x += 2.0 * texelSize.x; // Undo last step.\r\n\ttexCoord.x -= texelSize.x * searchLength(e, 0.0, 0.5);\r\n\r\n\treturn texCoord.x;\r\n\r\n}\r\n\r\nfloat searchXRight(vec2 texCoord, float end) {\r\n\r\n\tvec2 e = vec2(0.0, 1.0);\r\n\r\n\tfor(int i = 0; i < MAX_SEARCH_STEPS_INT; ++i) {\r\n\r\n\t\te = texture2D(tDiffuse, texCoord, 0.0).rg;\r\n\t\ttexCoord += vec2(2.0, 0.0) * texelSize;\r\n\r\n\t\tif(!(texCoord.x < end && e.g > 0.8281 && e.r == 0.0)) { break; }\r\n\r\n\t}\r\n\r\n\ttexCoord.x -= 0.25 * texelSize.x;\r\n\ttexCoord.x -= texelSize.x;\r\n\ttexCoord.x -= 2.0 * texelSize.x;\r\n\ttexCoord.x += texelSize.x * searchLength(e, 0.5, 0.5);\r\n\r\n\treturn texCoord.x;\r\n\r\n}\r\n\r\nfloat searchYUp(vec2 texCoord, float end) {\r\n\r\n\tvec2 e = vec2(1.0, 0.0);\r\n\r\n\tfor(int i = 0; i < MAX_SEARCH_STEPS_INT; ++i) {\r\n\r\n\t\te = texture2D(tDiffuse, texCoord, 0.0).rg;\r\n\t\ttexCoord += vec2(0.0, 2.0) * texelSize; // Changed sign.\r\n\r\n\t\tif(!(texCoord.y > end && e.r > 0.8281 && e.g == 0.0)) { break; }\r\n\r\n\t}\r\n\r\n\ttexCoord.y -= 0.25 * texelSize.y; // Changed sign.\r\n\ttexCoord.y -= texelSize.y; // Changed sign.\r\n\ttexCoord.y -= 2.0 * texelSize.y; // Changed sign.\r\n\ttexCoord.y += texelSize.y * searchLength(e.gr, 0.0, 0.5); // Changed sign.\r\n\r\n\treturn texCoord.y;\r\n\r\n}\r\n\r\nfloat searchYDown(vec2 texCoord, float end) {\r\n\r\n\tvec2 e = vec2(1.0, 0.0);\r\n\r\n\tfor(int i = 0; i < MAX_SEARCH_STEPS_INT; ++i ) {\r\n\r\n\t\te = texture2D(tDiffuse, texCoord, 0.0).rg;\r\n\t\ttexCoord -= vec2(0.0, 2.0) * texelSize; // Changed sign.\r\n\r\n\t\tif(!(texCoord.y < end && e.r > 0.8281 && e.g == 0.0)) { break; }\r\n\r\n\t}\r\n\r\n\ttexCoord.y += 0.25 * texelSize.y; // Changed sign.\r\n\ttexCoord.y += texelSize.y; // Changed sign.\r\n\ttexCoord.y += 2.0 * texelSize.y; // Changed sign.\r\n\ttexCoord.y -= texelSize.y * searchLength(e.gr, 0.5, 0.5); // Changed sign.\r\n\r\n\treturn texCoord.y;\r\n\r\n}\r\n\r\nvec2 area(vec2 dist, float e1, float e2, float offset) {\r\n\r\n\t// Rounding prevents precision errors of bilinear filtering.\r\n\tvec2 texCoord = AREATEX_MAX_DISTANCE * round(4.0 * vec2(e1, e2)) + dist;\r\n\r\n\t// Scale and bias for texel space translation.\r\n\ttexCoord = AREATEX_PIXEL_SIZE * texCoord + (0.5 * AREATEX_PIXEL_SIZE);\r\n\r\n\t// Move to proper place, according to the subpixel offset.\r\n\ttexCoord.y += AREATEX_SUBTEX_SIZE * offset;\r\n\r\n\treturn texture2D(tArea, texCoord, 0.0).rg;\r\n\r\n}\r\n\r\nvoid main() {\r\n\r\n\tvec4 weights = vec4(0.0);\r\n\tvec4 subsampleIndices = vec4(0.0);\r\n\tvec2 e = texture2D(tDiffuse, vUv).rg;\r\n\r\n\tif(e.g > 0.0) {\r\n\r\n\t\t// Edge at north.\r\n\t\tvec2 d;\r\n\r\n\t\t// Find the distance to the left.\r\n\t\tvec2 coords;\r\n\t\tcoords.x = searchXLeft(vOffset[0].xy, vOffset[2].x);\r\n\t\tcoords.y = vOffset[1].y; // vOffset[1].y = vUv.y - 0.25 * texelSize.y (@CROSSING_OFFSET)\r\n\t\td.x = coords.x;\r\n\r\n\t\t/* Now fetch the left crossing edges, two at a time using bilinear\r\n\t\tfiltering. Sampling at -0.25 (see @CROSSING_OFFSET) enables to discern what\r\n\t\tvalue each edge has. */\r\n\t\tfloat e1 = texture2D(tDiffuse, coords, 0.0).r;\r\n\r\n\t\t// Find the distance to the right.\r\n\t\tcoords.x = searchXRight(vOffset[0].zw, vOffset[2].y);\r\n\t\td.y = coords.x;\r\n\r\n\t\t/* Translate distances to pixel units for better interleave arithmetic and\r\n\t\tmemory accesses. */\r\n\t\td = d / texelSize.x - vPixCoord.x;\r\n\r\n\t\t// The area texture is compressed quadratically.\r\n\t\tvec2 sqrtD = sqrt(abs(d));\r\n\r\n\t\t// Fetch the right crossing edges.\r\n\t\tcoords.y -= texelSize.y; // WebGL port note: Added.\r\n\t\tfloat e2 = sampleLevelZeroOffset(tDiffuse, coords, ivec2(1, 0)).r;\r\n\r\n\t\t// Pattern recognised, now get the actual area.\r\n\t\tweights.rg = area(sqrtD, e1, e2, subsampleIndices.y);\r\n\r\n\t}\r\n\r\n\tif(e.r > 0.0) {\r\n\r\n\t\t// Edge at west.\r\n\t\tvec2 d;\r\n\r\n\t\t// Find the distance to the top.\r\n\t\tvec2 coords;\r\n\t\tcoords.y = searchYUp(vOffset[1].xy, vOffset[2].z);\r\n\t\tcoords.x = vOffset[0].x; // vOffset[1].x = vUv.x - 0.25 * texelSize.x;\r\n\t\td.x = coords.y;\r\n\r\n\t\t// Fetch the top crossing edges.\r\n\t\tfloat e1 = texture2D(tDiffuse, coords, 0.0).g;\r\n\r\n\t\t// Find the distance to the bottom.\r\n\t\tcoords.y = searchYDown(vOffset[1].zw, vOffset[2].w);\r\n\t\td.y = coords.y;\r\n\r\n\t\t// Distances in pixel units.\r\n\t\td = d / texelSize.y - vPixCoord.y;\r\n\r\n\t\t// The area texture is compressed quadratically.\r\n\t\tvec2 sqrtD = sqrt(abs(d));\r\n\r\n\t\t// Fetch the bottom crossing edges.\r\n\t\tcoords.y -= texelSize.y; // WebGL port note: Added.\r\n\t\tfloat e2 = sampleLevelZeroOffset(tDiffuse, coords, ivec2(0, 1)).g;\r\n\r\n\t\t// Get the area for this direction.\r\n\t\tweights.ba = area(sqrtD, e1, e2, subsampleIndices.x);\r\n\r\n\t}\r\n\r\n\tgl_FragColor = weights;\r\n\r\n}\r\n";

  var vertex$i = "uniform vec2 texelSize;\r\n\r\nvarying vec2 vUv;\r\nvarying vec4 vOffset[3];\r\nvarying vec2 vPixCoord;\r\n\r\nvoid main() {\r\n\r\n\tvUv = uv;\r\n\r\n\tvPixCoord = uv / texelSize;\r\n\r\n\t// Offsets for the searches (see @PSEUDO_GATHER4).\r\n\tvOffset[0] = uv.xyxy + texelSize.xyxy * vec4(-0.25, 0.125, 1.25, 0.125); // Changed sign in Y and W components.\r\n\tvOffset[1] = uv.xyxy + texelSize.xyxy * vec4(-0.125, 0.25, -0.125, -1.25); //Changed sign in Y and W components.\r\n\r\n\t// This indicates the ends of the loops.\r\n\tvOffset[2] = vec4(vOffset[0].xz, vOffset[1].yw) + vec4(-2.0, 2.0, -2.0, 2.0) * texelSize.xxyy * MAX_SEARCH_STEPS_FLOAT;\r\n\r\n\tgl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\r\n\r\n}\r\n";

  var SMAAWeightsMaterial = function (_ShaderMaterial) {
  	inherits(SMAAWeightsMaterial, _ShaderMaterial);

  	function SMAAWeightsMaterial() {
  		var texelSize = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : new three.Vector2();
  		classCallCheck(this, SMAAWeightsMaterial);
  		return possibleConstructorReturn(this, (SMAAWeightsMaterial.__proto__ || Object.getPrototypeOf(SMAAWeightsMaterial)).call(this, {

  			type: "SMAAWeightsMaterial",

  			defines: {
  				MAX_SEARCH_STEPS_INT: "8",
  				MAX_SEARCH_STEPS_FLOAT: "8.0",

  				AREATEX_MAX_DISTANCE: "16.0",
  				AREATEX_PIXEL_SIZE: "(1.0 / vec2(160.0, 560.0))",
  				AREATEX_SUBTEX_SIZE: "(1.0 / 7.0)",
  				SEARCHTEX_SIZE: "vec2(66.0, 33.0)",
  				SEARCHTEX_PACKED_SIZE: "vec2(64.0, 16.0)"

  			},

  			uniforms: {

  				tDiffuse: new three.Uniform(null),
  				tArea: new three.Uniform(null),
  				tSearch: new three.Uniform(null),
  				texelSize: new three.Uniform(texelSize)

  			},

  			fragmentShader: fragment$i,
  			vertexShader: vertex$i,

  			depthWrite: false,
  			depthTest: false

  		}));
  	}

  	createClass(SMAAWeightsMaterial, [{
  		key: "setOrthogonalSearchSteps",
  		value: function setOrthogonalSearchSteps(steps) {

  			this.defines.MAX_SEARCH_STEPS_INT = steps.toFixed("0");
  			this.defines.MAX_SEARCH_STEPS_FLOAT = steps.toFixed("1");

  			this.needsUpdate = true;
  		}
  	}]);
  	return SMAAWeightsMaterial;
  }(three.ShaderMaterial);

  var fragment$j = "#include <common>\r\n#include <dithering_pars_fragment>\r\n\r\nuniform sampler2D tDiffuse;\r\nuniform float middleGrey;\r\nuniform float maxLuminance;\r\n\r\n#ifdef ADAPTED_LUMINANCE\r\n\r\n\tuniform sampler2D luminanceMap;\r\n\r\n#else\r\n\r\n\tuniform float averageLuminance;\r\n\r\n#endif\r\n\r\nvarying vec2 vUv;\r\n\r\nvec3 toneMap(vec3 c) {\r\n\r\n\t#ifdef ADAPTED_LUMINANCE\r\n\r\n\t\t// Get the calculated average luminance by sampling the center.\r\n\t\tfloat lumAvg = texture2D(luminanceMap, vec2(0.5)).r;\r\n\r\n\t#else\r\n\r\n\t\tfloat lumAvg = averageLuminance;\r\n\r\n\t#endif\r\n\r\n\t// Calculate the luminance of the current pixel.\r\n\tfloat lumPixel = linearToRelativeLuminance(c);\r\n\r\n\t// Apply the modified operator (Reinhard Eq. 4).\r\n\tfloat lumScaled = (lumPixel * middleGrey) / lumAvg;\r\n\r\n\tfloat lumCompressed = (lumScaled * (1.0 + (lumScaled / (maxLuminance * maxLuminance)))) / (1.0 + lumScaled);\r\n\r\n\treturn lumCompressed * c;\r\n\r\n}\r\n\r\nvoid main() {\r\n\r\n\tvec4 texel = texture2D(tDiffuse, vUv);\r\n\tgl_FragColor = vec4(toneMap(texel.rgb), texel.a);\r\n\r\n\t#include <dithering_fragment>\r\n\r\n}\r\n";

  var vertex$j = "varying vec2 vUv;\r\n\r\nvoid main() {\r\n\r\n\tvUv = uv;\r\n\tgl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\r\n\r\n}\r\n";

  var ToneMappingMaterial = function (_ShaderMaterial) {
  			inherits(ToneMappingMaterial, _ShaderMaterial);

  			function ToneMappingMaterial() {
  						classCallCheck(this, ToneMappingMaterial);
  						return possibleConstructorReturn(this, (ToneMappingMaterial.__proto__ || Object.getPrototypeOf(ToneMappingMaterial)).call(this, {

  									type: "ToneMappingMaterial",

  									uniforms: {

  												tDiffuse: new three.Uniform(null),
  												luminanceMap: new three.Uniform(null),
  												averageLuminance: new three.Uniform(1.0),
  												maxLuminance: new three.Uniform(16.0),
  												middleGrey: new three.Uniform(0.6)

  									},

  									fragmentShader: fragment$j,
  									vertexShader: vertex$j,

  									depthWrite: false,
  									depthTest: false

  						}));
  			}

  			return ToneMappingMaterial;
  }(three.ShaderMaterial);

  var Pass = function () {
  		function Pass() {
  				var name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "Pass";
  				var scene = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : new three.Scene();
  				var camera = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : new three.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  				classCallCheck(this, Pass);


  				this.name = name;

  				this.scene = scene;

  				this.camera = camera;

  				this.quad = null;

  				this.renderToScreen = false;

  				this.enabled = true;

  				this.needsSwap = true;
  		}

  		createClass(Pass, [{
  				key: "getFullscreenMaterial",
  				value: function getFullscreenMaterial() {

  						return this.quad !== null ? this.quad.material : null;
  				}
  		}, {
  				key: "setFullscreenMaterial",
  				value: function setFullscreenMaterial(material) {

  						var quad = this.quad;

  						if (quad !== null) {

  								quad.material = material;
  						} else {

  								quad = new three.Mesh(new three.PlaneBufferGeometry(2, 2), material);
  								quad.frustumCulled = false;

  								if (this.scene !== null) {

  										this.scene.add(quad);
  										this.quad = quad;
  								}
  						}
  				}
  		}, {
  				key: "render",
  				value: function render(renderer, inputBuffer, outputBuffer, delta, stencilTest) {

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

  						var _iteratorNormalCompletion = true;
  						var _didIteratorError = false;
  						var _iteratorError = undefined;

  						try {
  								for (var _iterator = Object.keys(this)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
  										var key = _step.value;


  										if (this[key] !== null && typeof this[key].dispose === "function") {

  												this[key].dispose();
  												this[key] = null;
  										}
  								}
  						} catch (err) {
  								_didIteratorError = true;
  								_iteratorError = err;
  						} finally {
  								try {
  										if (!_iteratorNormalCompletion && _iterator.return) {
  												_iterator.return();
  										}
  								} finally {
  										if (_didIteratorError) {
  												throw _iteratorError;
  										}
  								}
  						}
  				}
  		}, {
  				key: "material",
  				get: function get$$1() {

  						console.warn("Pass.material has been deprecated, please use Pass.getFullscreenMaterial()");

  						return this.getFullscreenMaterial();
  				},
  				set: function set$$1(value) {

  						console.warn("Pass.material has been deprecated, please use Pass.setFullscreenMaterial(Material)");

  						this.setFullscreenMaterial(value);
  				}
  		}]);
  		return Pass;
  }();

  var BlurPass = function (_Pass) {
  		inherits(BlurPass, _Pass);

  		function BlurPass() {
  				var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  				classCallCheck(this, BlurPass);

  				var _this = possibleConstructorReturn(this, (BlurPass.__proto__ || Object.getPrototypeOf(BlurPass)).call(this, "BlurPass"));

  				_this.renderTargetX = new three.WebGLRenderTarget(1, 1, {
  						minFilter: three.LinearFilter,
  						magFilter: three.LinearFilter,
  						stencilBuffer: false,
  						depthBuffer: false
  				});

  				_this.renderTargetX.texture.name = "Blur.TargetX";
  				_this.renderTargetX.texture.generateMipmaps = false;

  				_this.renderTargetY = _this.renderTargetX.clone();
  				_this.renderTargetY.texture.name = "Blur.TargetY";

  				_this.resolution = new three.Vector2();

  				_this.resolutionScale = options.resolutionScale !== undefined ? options.resolutionScale : 0.5;

  				_this.convolutionMaterial = new ConvolutionMaterial();

  				_this.ditheredConvolutionMaterial = new ConvolutionMaterial();
  				_this.ditheredConvolutionMaterial.dithering = true;

  				_this.dithering = false;

  				_this.kernelSize = options.kernelSize;

  				return _this;
  		}

  		createClass(BlurPass, [{
  				key: "getResolutionScale",
  				value: function getResolutionScale() {

  						return this.resolutionScale;
  				}
  		}, {
  				key: "setResolutionScale",
  				value: function setResolutionScale(scale) {

  						this.resolutionScale = scale;
  						this.setSize(this.resolution.x, this.resolution.y);
  				}
  		}, {
  				key: "render",
  				value: function render(renderer, inputBuffer, outputBuffer, delta, stencilTest) {

  						var scene = this.scene;
  						var camera = this.camera;

  						var renderTargetX = this.renderTargetX;
  						var renderTargetY = this.renderTargetY;

  						var material = this.convolutionMaterial;
  						var uniforms = material.uniforms;
  						var kernel = material.getKernel();

  						var lastRT = inputBuffer;
  						var destRT = void 0;
  						var i = void 0,
  						    l = void 0;

  						this.setFullscreenMaterial(material);

  						for (i = 0, l = kernel.length - 1; i < l; ++i) {
  								destRT = i % 2 === 0 ? renderTargetX : renderTargetY;

  								uniforms.kernel.value = kernel[i];
  								uniforms.tDiffuse.value = lastRT.texture;
  								renderer.render(scene, camera, destRT);

  								lastRT = destRT;
  						}

  						if (this.dithering) {

  								material = this.ditheredConvolutionMaterial;
  								uniforms = material.uniforms;
  								this.setFullscreenMaterial(material);
  						}

  						uniforms.kernel.value = kernel[i];
  						uniforms.tDiffuse.value = lastRT.texture;
  						renderer.render(scene, camera, this.renderToScreen ? null : outputBuffer);
  				}
  		}, {
  				key: "setSize",
  				value: function setSize(width, height) {
  						this.resolution.set(width, height);

  						width = Math.max(1, Math.floor(width * this.resolutionScale));
  						height = Math.max(1, Math.floor(height * this.resolutionScale));

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
  				get: function get$$1() {

  						return this.renderTargetX.width;
  				}
  		}, {
  				key: "height",
  				get: function get$$1() {

  						return this.renderTargetX.height;
  				}
  		}, {
  				key: "kernelSize",
  				get: function get$$1() {

  						return this.convolutionMaterial.kernelSize;
  				},
  				set: function set$$1() {
  						var value = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : KernelSize.LARGE;


  						this.convolutionMaterial.kernelSize = value;
  						this.ditheredConvolutionMaterial.kernelSize = value;
  				}
  		}]);
  		return BlurPass;
  }(Pass);

  var BloomPass = function (_Pass) {
  	inherits(BloomPass, _Pass);

  	function BloomPass() {
  		var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  		classCallCheck(this, BloomPass);

  		var _this = possibleConstructorReturn(this, (BloomPass.__proto__ || Object.getPrototypeOf(BloomPass)).call(this, "BloomPass"));

  		_this.renderTarget = new three.WebGLRenderTarget(1, 1, {
  			minFilter: three.LinearFilter,
  			magFilter: three.LinearFilter,
  			stencilBuffer: false,
  			depthBuffer: false
  		});

  		_this.renderTarget.texture.name = "Bloom.Target";
  		_this.renderTarget.texture.generateMipmaps = false;

  		_this.blurPass = new BlurPass(options);

  		_this.resolution = new three.Vector2();

  		_this.combineMaterial = new CombineMaterial(options.screenMode !== undefined ? options.screenMode : true);

  		_this.intensity = options.intensity;

  		_this.luminosityMaterial = new LuminosityMaterial(true);

  		_this.distinction = options.distinction;

  		return _this;
  	}

  	createClass(BloomPass, [{
  		key: "getResolutionScale",
  		value: function getResolutionScale() {

  			return this.blurPass.getResolutionScale();
  		}
  	}, {
  		key: "setResolutionScale",
  		value: function setResolutionScale(scale) {

  			this.blurPass.setResolutionScale(scale);
  			this.setSize(this.resolution.x, this.resolution.y);
  		}
  	}, {
  		key: "render",
  		value: function render(renderer, inputBuffer, outputBuffer, delta, stencilTest) {

  			var scene = this.scene;
  			var camera = this.camera;
  			var blurPass = this.blurPass;

  			var luminosityMaterial = this.luminosityMaterial;
  			var combineMaterial = this.combineMaterial;
  			var renderTarget = this.renderTarget;

  			this.setFullscreenMaterial(luminosityMaterial);
  			luminosityMaterial.uniforms.tDiffuse.value = inputBuffer.texture;
  			renderer.render(scene, camera, renderTarget);

  			blurPass.render(renderer, renderTarget, renderTarget);

  			if (this.blend) {
  				this.setFullscreenMaterial(combineMaterial);
  				combineMaterial.uniforms.texture1.value = inputBuffer.texture;
  				combineMaterial.uniforms.texture2.value = renderTarget.texture;

  				renderer.render(scene, camera, this.renderToScreen ? null : outputBuffer);
  			}
  		}
  	}, {
  		key: "setSize",
  		value: function setSize(width, height) {
  			this.resolution.set(width, height);

  			this.blurPass.setSize(width, height);

  			width = this.blurPass.width;
  			height = this.blurPass.height;

  			this.renderTarget.setSize(width, height);
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
  		key: "kernelSize",
  		get: function get$$1() {

  			return this.blurPass.kernelSize;
  		},
  		set: function set$$1() {
  			var value = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : KernelSize.LARGE;


  			this.blurPass.kernelSize = value;
  		}
  	}, {
  		key: "intensity",
  		get: function get$$1() {

  			return this.combineMaterial.uniforms.opacity2.value;
  		},
  		set: function set$$1() {
  			var value = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1.0;


  			this.combineMaterial.uniforms.opacity2.value = value;
  		}
  	}, {
  		key: "distinction",
  		get: function get$$1() {

  			return this.luminosityMaterial.uniforms.distinction.value;
  		},
  		set: function set$$1() {
  			var value = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1.0;


  			this.luminosityMaterial.uniforms.distinction.value = value;
  		}
  	}, {
  		key: "dithering",
  		get: function get$$1() {

  			return this.blurPass.dithering;
  		},
  		set: function set$$1(value) {

  			this.blurPass.dithering = value;
  		}
  	}, {
  		key: "blend",
  		get: function get$$1() {

  			return this.needsSwap;
  		},
  		set: function set$$1(value) {

  			this.needsSwap = value;
  		}
  	}, {
  		key: "overlay",
  		get: function get$$1() {

  			return this.renderTarget.texture;
  		}
  	}, {
  		key: "resolutionScale",
  		get: function get$$1() {

  			console.warn("BloomPass.resolutionScale has been deprecated, please use BloomPass.getResolutionScale()");

  			return this.getResolutionScale();
  		},
  		set: function set$$1(value) {

  			console.warn("BloomPass.resolutionScale has been deprecated, please use BloomPass.setResolutionScale(Number)");

  			this.setResolutionScale(value);
  		}
  	}]);
  	return BloomPass;
  }(Pass);

  var BokehPass = function (_Pass) {
  	inherits(BokehPass, _Pass);

  	function BokehPass(camera) {
  		var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  		classCallCheck(this, BokehPass);

  		var _this = possibleConstructorReturn(this, (BokehPass.__proto__ || Object.getPrototypeOf(BokehPass)).call(this, "BokehPass"));

  		_this.setFullscreenMaterial(new BokehMaterial(camera, options));

  		return _this;
  	}

  	createClass(BokehPass, [{
  		key: "render",
  		value: function render(renderer, inputBuffer, outputBuffer, delta, stencilTest) {

  			var uniforms = this.getFullscreenMaterial().uniforms;

  			uniforms.tDiffuse.value = inputBuffer.texture;
  			uniforms.tDepth.value = inputBuffer.depthTexture;

  			renderer.render(this.scene, this.camera, this.renderToScreen ? null : outputBuffer);
  		}
  	}, {
  		key: "setSize",
  		value: function setSize(width, height) {

  			this.getFullscreenMaterial().uniforms.aspect.value = width / height;
  		}
  	}]);
  	return BokehPass;
  }(Pass);

  var ClearMaskPass = function (_Pass) {
  	inherits(ClearMaskPass, _Pass);

  	function ClearMaskPass() {
  		classCallCheck(this, ClearMaskPass);

  		var _this = possibleConstructorReturn(this, (ClearMaskPass.__proto__ || Object.getPrototypeOf(ClearMaskPass)).call(this, "ClearMaskPass", null, null));

  		_this.needsSwap = false;

  		return _this;
  	}

  	createClass(ClearMaskPass, [{
  		key: "render",
  		value: function render(renderer, inputBuffer, outputBuffer, delta, stencilTest) {

  			renderer.state.buffers.stencil.setTest(false);
  		}
  	}]);
  	return ClearMaskPass;
  }(Pass);

  var color$1 = new three.Color();

  var ClearPass = function (_Pass) {
  		inherits(ClearPass, _Pass);

  		function ClearPass() {
  				var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  				classCallCheck(this, ClearPass);

  				var _this = possibleConstructorReturn(this, (ClearPass.__proto__ || Object.getPrototypeOf(ClearPass)).call(this, "ClearPass", null, null));

  				_this.needsSwap = false;

  				_this.clearColor = options.clearColor !== undefined ? options.clearColor : null;

  				_this.clearAlpha = options.clearAlpha !== undefined ? options.clearAlpha : 0.0;

  				return _this;
  		}

  		createClass(ClearPass, [{
  				key: "render",
  				value: function render(renderer, inputBuffer, outputBuffer, delta, stencilTest) {

  						var clearColor = this.clearColor;

  						var clearAlpha = void 0;

  						if (clearColor !== null) {

  								color$1.copy(renderer.getClearColor());
  								clearAlpha = renderer.getClearAlpha();
  								renderer.setClearColor(clearColor, this.clearAlpha);
  						}

  						renderer.setRenderTarget(this.renderToScreen ? null : inputBuffer);
  						renderer.clear();

  						if (clearColor !== null) {

  								renderer.setClearColor(color$1, clearAlpha);
  						}
  				}
  		}]);
  		return ClearPass;
  }(Pass);

  var DotScreenPass = function (_Pass) {
  	inherits(DotScreenPass, _Pass);

  	function DotScreenPass() {
  		var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  		classCallCheck(this, DotScreenPass);

  		var _this = possibleConstructorReturn(this, (DotScreenPass.__proto__ || Object.getPrototypeOf(DotScreenPass)).call(this, "DotScreenPass"));

  		_this.setFullscreenMaterial(new DotScreenMaterial(options));

  		return _this;
  	}

  	createClass(DotScreenPass, [{
  		key: "render",
  		value: function render(renderer, inputBuffer, outputBuffer, delta, stencilTest) {

  			this.getFullscreenMaterial().uniforms.tDiffuse.value = inputBuffer.texture;

  			renderer.render(this.scene, this.camera, this.renderToScreen ? null : outputBuffer);
  		}
  	}, {
  		key: "setSize",
  		value: function setSize(width, height) {

  			width = Math.max(1, width);
  			height = Math.max(1, height);

  			var uniforms = this.getFullscreenMaterial().uniforms;
  			uniforms.offsetRepeat.value.z = width;
  			uniforms.offsetRepeat.value.w = height;
  		}
  	}]);
  	return DotScreenPass;
  }(Pass);

  var FilmPass = function (_Pass) {
  	inherits(FilmPass, _Pass);

  	function FilmPass() {
  		var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  		classCallCheck(this, FilmPass);

  		var _this = possibleConstructorReturn(this, (FilmPass.__proto__ || Object.getPrototypeOf(FilmPass)).call(this, "FilmPass"));

  		_this.setFullscreenMaterial(new FilmMaterial(options));

  		_this.resolution = new three.Vector2();

  		_this.scanlineDensity = options.scanlineDensity === undefined ? 1.25 : options.scanlineDensity;

  		_this.gridScale = options.gridScale === undefined ? 1.0 : Math.max(options.gridScale, 1e-6);

  		_this.gridLineWidth = options.gridLineWidth === undefined ? 0.0 : Math.max(options.gridLineWidth, 0.0);

  		return _this;
  	}

  	createClass(FilmPass, [{
  		key: "getScanlineDensity",
  		value: function getScanlineDensity() {

  			return this.scanlineDensity;
  		}
  	}, {
  		key: "setScanlineDensity",
  		value: function setScanlineDensity(density) {

  			this.scanlineDensity = density;
  			this.setSize(this.resolution.x, this.resolution.y);
  		}
  	}, {
  		key: "getGridScale",
  		value: function getGridScale() {

  			return this.gridScale;
  		}
  	}, {
  		key: "setGridScale",
  		value: function setGridScale(scale) {

  			this.gridScale = scale;
  			this.setSize(this.resolution.x, this.resolution.y);
  		}
  	}, {
  		key: "getGridLineWidth",
  		value: function getGridLineWidth() {

  			return this.gridLineWidth;
  		}
  	}, {
  		key: "setGridLineWidth",
  		value: function setGridLineWidth(lineWidth) {

  			this.gridLineWidth = lineWidth;
  			this.setSize(this.resolution.x, this.resolution.y);
  		}
  	}, {
  		key: "render",
  		value: function render(renderer, inputBuffer, outputBuffer, delta, stencilTest) {

  			var uniforms = this.getFullscreenMaterial().uniforms;

  			uniforms.tDiffuse.value = inputBuffer.texture;
  			uniforms.time.value += delta;

  			renderer.render(this.scene, this.camera, this.renderToScreen ? null : outputBuffer);
  		}
  	}, {
  		key: "setSize",
  		value: function setSize(width, height) {
  			this.resolution.set(width, height);

  			var aspect = width / height;
  			var gridScale = this.gridScale * (height * 0.125);

  			var uniforms = this.getFullscreenMaterial().uniforms;
  			uniforms.scanlineCount.value = Math.round(height * this.scanlineDensity);
  			uniforms.gridScale.value.set(aspect * gridScale, gridScale);
  			uniforms.gridLineWidth.value = gridScale / height + this.gridLineWidth;
  		}
  	}]);
  	return FilmPass;
  }(Pass);

  function randomInt(low, high) {

  		return low + Math.floor(Math.random() * (high - low + 1));
  }

  function randomFloat(low, high) {

  		return low + Math.random() * (high - low);
  }

  var GlitchPass = function (_Pass) {
  		inherits(GlitchPass, _Pass);

  		function GlitchPass() {
  				var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  				classCallCheck(this, GlitchPass);

  				var _this = possibleConstructorReturn(this, (GlitchPass.__proto__ || Object.getPrototypeOf(GlitchPass)).call(this, "GlitchPass"));

  				_this.setFullscreenMaterial(new GlitchMaterial());

  				_this.texture = null;

  				_this.perturbMap = options.perturbMap !== undefined ? options.perturbMap : _this.generatePerturbMap(options.dtSize);
  				_this.perturbMap.name = "Glitch.Perturbation";
  				_this.perturbMap.generateMipmaps = false;

  				_this.mode = GlitchMode.SPORADIC;

  				_this.counter = 0;

  				_this.breakPoint = randomInt(120, 240);

  				return _this;
  		}

  		createClass(GlitchPass, [{
  				key: "generatePerturbMap",
  				value: function generatePerturbMap() {
  						var size = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 64;


  						var pixels = size * size;
  						var data = new Float32Array(pixels * 3);

  						var dt = this.perturbMap;
  						var i = void 0,
  						    x = void 0;

  						for (i = 0; i < pixels; ++i) {

  								x = Math.random();

  								data[i * 3] = x;
  								data[i * 3 + 1] = x;
  								data[i * 3 + 2] = x;
  						}

  						if (dt !== null) {

  								dt.dispose();
  						}

  						dt = new three.DataTexture(data, size, size, three.RGBFormat, three.FloatType);
  						dt.needsUpdate = true;

  						this.perturbMap = dt;

  						return dt;
  				}
  		}, {
  				key: "render",
  				value: function render(renderer, inputBuffer, outputBuffer, delta, stencilTest) {

  						var mode = this.mode;
  						var counter = this.counter;
  						var breakPoint = this.breakPoint;
  						var uniforms = this.getFullscreenMaterial().uniforms;

  						uniforms.tDiffuse.value = inputBuffer.texture;
  						uniforms.seed.value = Math.random();
  						uniforms.active.value = true;

  						if (counter % breakPoint === 0 || mode === GlitchMode.CONSTANT_WILD) {

  								uniforms.amount.value = Math.random() / 30.0;
  								uniforms.angle.value = randomFloat(-Math.PI, Math.PI);
  								uniforms.seedX.value = randomFloat(-1.0, 1.0);
  								uniforms.seedY.value = randomFloat(-1.0, 1.0);
  								uniforms.distortionX.value = randomFloat(0.0, 1.0);
  								uniforms.distortionY.value = randomFloat(0.0, 1.0);

  								this.breakPoint = randomInt(120, 240);
  								this.counter = 0;
  						} else {

  								if (counter % breakPoint < breakPoint / 5 || mode === GlitchMode.CONSTANT_MILD) {

  										uniforms.amount.value = Math.random() / 90.0;
  										uniforms.angle.value = randomFloat(-Math.PI, Math.PI);
  										uniforms.distortionX.value = randomFloat(0.0, 1.0);
  										uniforms.distortionY.value = randomFloat(0.0, 1.0);
  										uniforms.seedX.value = randomFloat(-0.3, 0.3);
  										uniforms.seedY.value = randomFloat(-0.3, 0.3);
  								} else {
  										uniforms.active.value = false;
  								}
  						}

  						++this.counter;

  						renderer.render(this.scene, this.camera, this.renderToScreen ? null : outputBuffer);
  				}
  		}, {
  				key: "perturbMap",
  				get: function get$$1() {

  						return this.texture;
  				},
  				set: function set$$1(value) {

  						this.texture = value;
  						this.getFullscreenMaterial().uniforms.tPerturb.value = value;
  				}
  		}]);
  		return GlitchPass;
  }(Pass);

  var GlitchMode = {

  		SPORADIC: 0,
  		CONSTANT_MILD: 1,
  		CONSTANT_WILD: 2

  };

  var RenderPass = function (_Pass) {
  		inherits(RenderPass, _Pass);

  		function RenderPass(scene, camera) {
  				var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  				classCallCheck(this, RenderPass);

  				var _this = possibleConstructorReturn(this, (RenderPass.__proto__ || Object.getPrototypeOf(RenderPass)).call(this, "RenderPass", scene, camera));

  				_this.needsSwap = false;

  				_this.clearPass = new ClearPass(options);

  				_this.overrideMaterial = options.overrideMaterial !== undefined ? options.overrideMaterial : null;

  				_this.clearDepth = options.clearDepth !== undefined ? options.clearDepth : false;

  				_this.clear = options.clear !== undefined ? options.clear : true;

  				return _this;
  		}

  		createClass(RenderPass, [{
  				key: "render",
  				value: function render(renderer, inputBuffer, outputBuffer, delta, stencilTest) {

  						var scene = this.scene;
  						var renderTarget = this.renderToScreen ? null : inputBuffer;
  						var overrideMaterial = scene.overrideMaterial;

  						if (this.clear) {

  								this.clearPass.renderToScreen = this.renderToScreen;
  								this.clearPass.render(renderer, inputBuffer);
  						} else if (this.clearDepth) {

  								renderer.setRenderTarget(renderTarget);
  								renderer.clearDepth();
  						}

  						scene.overrideMaterial = this.overrideMaterial;
  						renderer.render(scene, this.camera, renderTarget);
  						scene.overrideMaterial = overrideMaterial;
  				}
  		}]);
  		return RenderPass;
  }(Pass);

  function clamp(value, min, max) {

  		return Math.max(min, Math.min(max, value));
  }

  var GodRaysPass = function (_Pass) {
  		inherits(GodRaysPass, _Pass);

  		function GodRaysPass(scene, camera, lightSource) {
  				var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
  				classCallCheck(this, GodRaysPass);

  				var _this = possibleConstructorReturn(this, (GodRaysPass.__proto__ || Object.getPrototypeOf(GodRaysPass)).call(this, "GodRaysPass"));

  				_this.lightScene = new three.Scene();

  				_this.mainScene = scene;

  				_this.mainCamera = camera;

  				_this.renderTargetX = new three.WebGLRenderTarget(1, 1, {
  						minFilter: three.LinearFilter,
  						magFilter: three.LinearFilter,
  						stencilBuffer: false,
  						depthBuffer: false
  				});

  				_this.renderTargetX.texture.name = "GodRays.TargetX";
  				_this.renderTargetX.texture.generateMipmaps = false;

  				_this.renderTargetY = _this.renderTargetX.clone();

  				_this.renderTargetY.texture.name = "GodRays.TargetY";

  				_this.renderTargetMask = new three.WebGLRenderTarget(1, 1, {
  						minFilter: three.LinearFilter,
  						magFilter: three.LinearFilter
  				});

  				_this.renderTargetMask.texture.name = "GodRays.Mask";
  				_this.renderTargetMask.texture.generateMipmaps = false;

  				_this.renderPassLight = new RenderPass(_this.lightScene, _this.mainCamera, {
  						clearColor: new three.Color(0x000000)
  				});

  				_this.renderPassMask = new RenderPass(_this.mainScene, _this.mainCamera, {
  						overrideMaterial: new three.MeshBasicMaterial({ color: 0x000000 })
  				});

  				_this.renderPassMask.clear = false;

  				_this.blurPass = new BlurPass(options);

  				_this.resolution = new three.Vector2();

  				_this.lightSource = lightSource;

  				_this.screenPosition = new three.Vector3();

  				_this.godRaysMaterial = new GodRaysMaterial(options);
  				_this.godRaysMaterial.uniforms.lightPosition.value = _this.screenPosition;

  				_this.samples = options.samples;

  				_this.combineMaterial = new CombineMaterial(options.screenMode !== undefined ? options.screenMode : true);

  				_this.intensity = options.intensity;

  				return _this;
  		}

  		createClass(GodRaysPass, [{
  				key: "getResolutionScale",
  				value: function getResolutionScale() {

  						return this.blurPass.getResolutionScale();
  				}
  		}, {
  				key: "setResolutionScale",
  				value: function setResolutionScale(scale) {

  						this.blurPass.setResolutionScale(scale);
  						this.setSize(this.resolution.x, this.resolution.y);
  				}
  		}, {
  				key: "render",
  				value: function render(renderer, inputBuffer, outputBuffer, delta, stencilTest) {

  						var scene = this.scene;
  						var camera = this.camera;
  						var mainScene = this.mainScene;

  						var lightSource = this.lightSource;
  						var screenPosition = this.screenPosition;

  						var godRaysMaterial = this.godRaysMaterial;
  						var combineMaterial = this.combineMaterial;

  						var renderTargetMask = this.renderTargetMask;
  						var renderTargetX = this.renderTargetX;
  						var renderTargetY = this.renderTargetY;

  						var background = void 0,
  						    parent = void 0;

  						screenPosition.copy(lightSource.position).project(this.mainCamera);
  						screenPosition.x = clamp((screenPosition.x + 1.0) * 0.5, 0.0, 1.0);
  						screenPosition.y = clamp((screenPosition.y + 1.0) * 0.5, 0.0, 1.0);

  						parent = lightSource.parent;
  						background = mainScene.background;
  						mainScene.background = null;
  						this.lightScene.add(lightSource);

  						this.renderPassLight.render(renderer, renderTargetMask);
  						this.renderPassMask.render(renderer, renderTargetMask);

  						if (parent !== null) {

  								parent.add(lightSource);
  						}

  						mainScene.background = background;

  						this.blurPass.render(renderer, this.renderTargetMask, renderTargetX);

  						this.setFullscreenMaterial(godRaysMaterial);
  						godRaysMaterial.uniforms.tDiffuse.value = renderTargetX.texture;
  						renderer.render(scene, camera, renderTargetY);

  						if (this.blend) {
  								this.setFullscreenMaterial(combineMaterial);
  								combineMaterial.uniforms.texture1.value = inputBuffer.texture;
  								combineMaterial.uniforms.texture2.value = renderTargetY.texture;

  								renderer.render(scene, camera, this.renderToScreen ? null : outputBuffer);
  						}
  				}
  		}, {
  				key: "setSize",
  				value: function setSize(width, height) {
  						this.resolution.set(width, height);

  						this.renderPassLight.setSize(width, height);
  						this.renderPassMask.setSize(width, height);
  						this.blurPass.setSize(width, height);

  						width = this.blurPass.width;
  						height = this.blurPass.height;

  						this.renderTargetMask.setSize(width, height);
  						this.renderTargetX.setSize(width, height);
  						this.renderTargetY.setSize(width, height);
  				}
  		}, {
  				key: "initialize",
  				value: function initialize(renderer, alpha) {

  						this.renderPassLight.initialize(renderer, alpha);
  						this.renderPassMask.initialize(renderer, alpha);
  						this.blurPass.initialize(renderer, alpha);

  						if (!alpha) {

  								this.renderTargetMask.texture.format = three.RGBFormat;
  								this.renderTargetX.texture.format = three.RGBFormat;
  								this.renderTargetY.texture.format = three.RGBFormat;
  						}
  				}
  		}, {
  				key: "kernelSize",
  				get: function get$$1() {

  						return this.blurPass.kernelSize;
  				},
  				set: function set$$1() {
  						var value = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : KernelSize.LARGE;


  						this.blurPass.kernelSize = value;
  				}
  		}, {
  				key: "intensity",
  				get: function get$$1() {

  						return this.combineMaterial.uniforms.opacity2.value;
  				},
  				set: function set$$1() {
  						var value = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1.0;


  						this.combineMaterial.uniforms.opacity2.value = value;
  				}
  		}, {
  				key: "samples",
  				get: function get$$1() {

  						return Number.parseInt(this.godRaysMaterial.defines.NUM_SAMPLES_INT);
  				},
  				set: function set$$1() {
  						var value = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 60;


  						value = Math.floor(value);

  						this.godRaysMaterial.defines.NUM_SAMPLES_FLOAT = value.toFixed(1);
  						this.godRaysMaterial.defines.NUM_SAMPLES_INT = value.toFixed(0);
  						this.godRaysMaterial.needsUpdate = true;
  				}
  		}, {
  				key: "dithering",
  				get: function get$$1() {

  						return this.godRaysMaterial.dithering;
  				},
  				set: function set$$1(value) {

  						if (this.dithering !== value) {

  								this.godRaysMaterial.dithering = value;
  								this.godRaysMaterial.needsUpdate = true;
  						}
  				}
  		}, {
  				key: "blend",
  				get: function get$$1() {

  						return this.needsSwap;
  				},
  				set: function set$$1(value) {

  						this.needsSwap = value;
  				}
  		}, {
  				key: "overlay",
  				get: function get$$1() {

  						return this.renderTargetY.texture;
  				}
  		}, {
  				key: "resolutionScale",
  				get: function get$$1() {

  						console.warn("GodRaysPass.resolutionScale has been deprecated, please use GodRaysPass.getResolutionScale()");

  						return this.getResolutionScale();
  				},
  				set: function set$$1(value) {

  						console.warn("GodRaysPass.resolutionScale has been deprecated, please use GodRaysPass.setResolutionScale(Number)");

  						this.setResolutionScale(value);
  				}
  		}]);
  		return GodRaysPass;
  }(Pass);

  var MaskPass = function (_Pass) {
  		inherits(MaskPass, _Pass);

  		function MaskPass(scene, camera) {
  				classCallCheck(this, MaskPass);

  				var _this = possibleConstructorReturn(this, (MaskPass.__proto__ || Object.getPrototypeOf(MaskPass)).call(this, "MaskPass", scene, camera));

  				_this.needsSwap = false;

  				_this.inverse = false;

  				_this.clearStencil = true;

  				return _this;
  		}

  		createClass(MaskPass, [{
  				key: "render",
  				value: function render(renderer, inputBuffer, outputBuffer, delta, stencilTest) {

  						var context = renderer.context;
  						var state = renderer.state;

  						var scene = this.scene;
  						var camera = this.camera;

  						var writeValue = this.inverse ? 0 : 1;
  						var clearValue = 1 - writeValue;

  						state.buffers.color.setMask(false);
  						state.buffers.depth.setMask(false);

  						state.buffers.color.setLocked(true);
  						state.buffers.depth.setLocked(true);

  						state.buffers.stencil.setTest(true);
  						state.buffers.stencil.setOp(context.REPLACE, context.REPLACE, context.REPLACE);
  						state.buffers.stencil.setFunc(context.ALWAYS, writeValue, 0xffffffff);
  						state.buffers.stencil.setClear(clearValue);

  						if (this.clearStencil) {

  								if (this.renderToScreen) {

  										renderer.setRenderTarget(null);
  										renderer.clearStencil();
  								} else {

  										renderer.setRenderTarget(inputBuffer);
  										renderer.clearStencil();

  										renderer.setRenderTarget(outputBuffer);
  										renderer.clearStencil();
  								}
  						}

  						if (this.renderToScreen) {

  								renderer.render(scene, camera, null);
  						} else {

  								renderer.render(scene, camera, inputBuffer);
  								renderer.render(scene, camera, outputBuffer);
  						}

  						state.buffers.color.setLocked(false);
  						state.buffers.depth.setLocked(false);

  						state.buffers.stencil.setFunc(context.EQUAL, 1, 0xffffffff);
  						state.buffers.stencil.setOp(context.KEEP, context.KEEP, context.KEEP);
  				}
  		}]);
  		return MaskPass;
  }(Pass);

  var ShaderPass = function (_Pass) {
  		inherits(ShaderPass, _Pass);

  		function ShaderPass(material) {
  				var textureID = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "tDiffuse";
  				classCallCheck(this, ShaderPass);

  				var _this = possibleConstructorReturn(this, (ShaderPass.__proto__ || Object.getPrototypeOf(ShaderPass)).call(this, "ShaderPass"));

  				_this.setFullscreenMaterial(material);

  				_this.textureID = textureID;

  				return _this;
  		}

  		createClass(ShaderPass, [{
  				key: "render",
  				value: function render(renderer, inputBuffer, outputBuffer, delta, stencilTest) {

  						var uniforms = this.getFullscreenMaterial().uniforms;

  						if (uniforms[this.textureID] !== undefined) {

  								uniforms[this.textureID].value = inputBuffer.texture;
  						}

  						renderer.render(this.scene, this.camera, this.renderToScreen ? null : outputBuffer);
  				}
  		}]);
  		return ShaderPass;
  }(Pass);

  var OutlinePass = function (_Pass) {
  		inherits(OutlinePass, _Pass);

  		function OutlinePass(scene, camera) {
  				var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  				classCallCheck(this, OutlinePass);

  				var _this = possibleConstructorReturn(this, (OutlinePass.__proto__ || Object.getPrototypeOf(OutlinePass)).call(this, "OutlinePass"));

  				_this.mainScene = scene;

  				_this.mainCamera = camera;

  				_this.renderTargetDepth = new three.WebGLRenderTarget(1, 1, {
  						minFilter: three.LinearFilter,
  						magFilter: three.LinearFilter
  				});

  				_this.renderTargetDepth.texture.name = "Outline.Depth";
  				_this.renderTargetDepth.texture.generateMipmaps = false;

  				_this.renderTargetMask = _this.renderTargetDepth.clone();

  				_this.renderTargetMask.texture.format = three.RGBFormat;
  				_this.renderTargetMask.texture.name = "Outline.Mask";

  				_this.renderTargetEdges = new three.WebGLRenderTarget(1, 1, {
  						minFilter: three.LinearFilter,
  						magFilter: three.LinearFilter,
  						stencilBuffer: false,
  						depthBuffer: false,
  						format: three.RGBFormat
  				});

  				_this.renderTargetEdges.texture.name = "Outline.Edges";
  				_this.renderTargetEdges.texture.generateMipmaps = false;

  				_this.renderTargetBlurredEdges = _this.renderTargetEdges.clone();

  				_this.renderTargetBlurredEdges.texture.name = "Outline.BlurredEdges";

  				_this.renderPassDepth = new RenderPass(_this.mainScene, _this.mainCamera, {
  						overrideMaterial: new three.MeshDepthMaterial({
  								depthPacking: three.RGBADepthPacking,
  								morphTargets: true,
  								skinning: true
  						}),
  						clearColor: new three.Color(0xffffff),
  						clearAlpha: 1.0
  				});

  				_this.renderPassMask = new RenderPass(_this.mainScene, _this.mainCamera, {
  						overrideMaterial: new DepthComparisonMaterial(_this.renderTargetDepth.texture, _this.mainCamera),
  						clearColor: new three.Color(0xffffff),
  						clearAlpha: 1.0
  				});

  				_this.blurPass = new BlurPass(options);

  				_this.kernelSize = options.kernelSize;

  				_this.resolution = new three.Vector2();

  				_this.copyPass = new ShaderPass(new CopyMaterial());
  				_this.copyPass.renderToScreen = true;

  				_this.outlineEdgesMaterial = new OutlineEdgesMaterial(options);
  				_this.outlineEdgesMaterial.uniforms.tMask.value = _this.renderTargetMask.texture;

  				_this.outlineBlendMaterial = new OutlineBlendMaterial(options);
  				_this.outlineBlendMaterial.uniforms.tMask.value = _this.renderTargetMask.texture;

  				_this.blur = options.blur !== undefined ? options.blur : true;

  				_this.selection = [];

  				_this.time = 0.0;

  				_this.pulseSpeed = options.pulseSpeed !== undefined ? options.pulseSpeed : 0.0;

  				_this.selectionLayer = 10;

  				return _this;
  		}

  		createClass(OutlinePass, [{
  				key: "getResolutionScale",
  				value: function getResolutionScale() {

  						return this.blurPass.getResolutionScale();
  				}
  		}, {
  				key: "setResolutionScale",
  				value: function setResolutionScale(scale) {

  						this.blurPass.setResolutionScale(scale);
  						this.setSize(this.resolution.x, this.resolution.y);
  				}
  		}, {
  				key: "setPatternTexture",
  				value: function setPatternTexture() {
  						var texture = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;


  						this.outlineBlendMaterial.setPatternTexture(texture);
  				}
  		}, {
  				key: "setSelection",
  				value: function setSelection(objects) {

  						var selection = objects.slice(0);
  						var selectionLayer = this.selectionLayer;

  						var i = void 0,
  						    l = void 0;

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

  						var i = void 0,
  						    l = void 0;

  						for (i = 0, l = selection.length; i < l; ++i) {

  								selection[i].layers.disable(selectionLayer);
  						}

  						this.selection = [];
  						this.time = 0.0;

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
  								}
  						}

  						return this;
  				}
  		}, {
  				key: "setSelectionVisible",
  				value: function setSelectionVisible(visible) {

  						var selection = this.selection;

  						var i = void 0,
  						    l = void 0;

  						for (i = 0, l = selection.length; i < l; ++i) {

  								if (visible) {

  										selection[i].layers.enable(0);
  								} else {

  										selection[i].layers.disable(0);
  								}
  						}
  				}
  		}, {
  				key: "render",
  				value: function render(renderer, inputBuffer, outputBuffer, delta, stencilTest) {

  						var mainScene = this.mainScene;
  						var mainCamera = this.mainCamera;
  						var pulse = this.outlineBlendMaterial.uniforms.pulse;

  						var background = void 0,
  						    mask = void 0;

  						if (this.selection.length > 0) {

  								background = mainScene.background;
  								mask = mainCamera.layers.mask;
  								mainScene.background = null;

  								pulse.value = 1.0;

  								if (this.pulseSpeed > 0.0) {

  										pulse.value = 0.625 + Math.cos(this.time * this.pulseSpeed * 10.0) * 0.375;
  										this.time += delta;
  								}

  								this.setSelectionVisible(false);
  								this.renderPassDepth.render(renderer, this.renderTargetDepth);
  								this.setSelectionVisible(true);

  								mainCamera.layers.mask = 1 << this.selectionLayer;
  								this.renderPassMask.render(renderer, this.renderTargetMask);

  								mainCamera.layers.mask = mask;
  								mainScene.background = background;

  								this.setFullscreenMaterial(this.outlineEdgesMaterial);
  								renderer.render(this.scene, this.camera, this.renderTargetEdges);

  								if (this.blurPass.enabled) {
  										this.blurPass.render(renderer, this.renderTargetEdges, this.renderTargetBlurredEdges);
  								}

  								if (this.blend) {
  										this.setFullscreenMaterial(this.outlineBlendMaterial);
  										this.outlineBlendMaterial.uniforms.tDiffuse.value = inputBuffer.texture;
  										renderer.render(this.scene, this.camera, this.renderToScreen ? null : outputBuffer);
  								}
  						} else if (this.renderToScreen) {
  								this.copyPass.render(renderer, inputBuffer);
  						}
  				}
  		}, {
  				key: "setSize",
  				value: function setSize(width, height) {
  						this.resolution.set(width, height);

  						this.renderTargetDepth.setSize(width, height);
  						this.renderTargetMask.setSize(width, height);

  						this.renderPassDepth.setSize(width, height);
  						this.renderPassMask.setSize(width, height);
  						this.blurPass.setSize(width, height);

  						width = this.blurPass.width;
  						height = this.blurPass.height;

  						this.renderTargetEdges.setSize(width, height);
  						this.renderTargetBlurredEdges.setSize(width, height);

  						this.outlineBlendMaterial.uniforms.aspect.value = width / height;
  						this.outlineEdgesMaterial.setTexelSize(1.0 / width, 1.0 / height);
  				}
  		}, {
  				key: "initialize",
  				value: function initialize(renderer, alpha) {

  						this.renderPassDepth.initialize(renderer, alpha);
  						this.renderPassMask.initialize(renderer, alpha);
  						this.blurPass.initialize(renderer, alpha);
  				}
  		}, {
  				key: "kernelSize",
  				get: function get$$1() {

  						return this.blurPass.kernelSize;
  				},
  				set: function set$$1() {
  						var value = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : KernelSize.VERY_SMALL;


  						this.blurPass.kernelSize = value;
  				}
  		}, {
  				key: "blur",
  				get: function get$$1() {

  						return this.blurPass.enabled;
  				},
  				set: function set$$1(value) {

  						this.blurPass.enabled = value;

  						this.outlineBlendMaterial.uniforms.tEdges.value = value ? this.renderTargetBlurredEdges.texture : this.renderTargetEdges.texture;
  				}
  		}, {
  				key: "dithering",
  				get: function get$$1() {

  						return this.blurPass.dithering;
  				},
  				set: function set$$1(value) {

  						this.blurPass.dithering = value;
  				}
  		}, {
  				key: "blend",
  				get: function get$$1() {

  						return this.needsSwap;
  				},
  				set: function set$$1(value) {

  						this.needsSwap = value;
  				}
  		}, {
  				key: "overlay",
  				get: function get$$1() {

  						return this.outlineBlendMaterial.uniforms.tEdges.value;
  				}
  		}, {
  				key: "resolutionScale",
  				get: function get$$1() {

  						console.warn("OutlinePass.resolutionScale has been deprecated, please use OutlinePass.getResolutionScale()");

  						return this.getResolutionScale();
  				},
  				set: function set$$1(value) {

  						console.warn("OutlinePass.resolutionScale has been deprecated, please use OutlinePass.setResolutionScale(Number)");

  						this.setResolutionScale(value);
  				}
  		}]);
  		return OutlinePass;
  }(Pass);

  var PixelationPass = function (_Pass) {
  	inherits(PixelationPass, _Pass);

  	function PixelationPass() {
  		var granularity = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 30.0;
  		classCallCheck(this, PixelationPass);

  		var _this = possibleConstructorReturn(this, (PixelationPass.__proto__ || Object.getPrototypeOf(PixelationPass)).call(this, "PixelationPass"));

  		_this.setFullscreenMaterial(new PixelationMaterial());

  		_this.granularity = granularity;

  		return _this;
  	}

  	createClass(PixelationPass, [{
  		key: "render",
  		value: function render(renderer, inputBuffer, outputBuffer, delta, stencilTest) {

  			this.getFullscreenMaterial().uniforms.tDiffuse.value = inputBuffer.texture;

  			renderer.render(this.scene, this.camera, this.renderToScreen ? null : outputBuffer);
  		}
  	}, {
  		key: "setSize",
  		value: function setSize(width, height) {

  			this.getFullscreenMaterial().setResolution(width, height);
  		}
  	}, {
  		key: "granularity",
  		get: function get$$1() {

  			return this.getFullscreenMaterial().granularity;
  		},
  		set: function set$$1() {
  			var value = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 30;


  			value = Math.floor(value);

  			if (value % 2 > 0) {

  				value += 1;
  			}

  			this.getFullscreenMaterial().granularity = value;
  		}
  	}]);
  	return PixelationPass;
  }(Pass);

  var RealisticBokehPass = function (_Pass) {
  	inherits(RealisticBokehPass, _Pass);

  	function RealisticBokehPass(camera) {
  		var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  		classCallCheck(this, RealisticBokehPass);

  		var _this = possibleConstructorReturn(this, (RealisticBokehPass.__proto__ || Object.getPrototypeOf(RealisticBokehPass)).call(this, "RealisticBokehPass"));

  		_this.setFullscreenMaterial(new RealisticBokehMaterial(camera, options));

  		return _this;
  	}

  	createClass(RealisticBokehPass, [{
  		key: "render",
  		value: function render(renderer, inputBuffer, outputBuffer, delta, stencilTest) {

  			var uniforms = this.getFullscreenMaterial().uniforms;

  			uniforms.tDiffuse.value = inputBuffer.texture;
  			uniforms.tDepth.value = inputBuffer.depthTexture;

  			renderer.render(this.scene, this.camera, this.renderToScreen ? null : outputBuffer);
  		}
  	}, {
  		key: "setSize",
  		value: function setSize(width, height) {

  			this.getFullscreenMaterial().setTexelSize(1.0 / width, 1.0 / height);
  		}
  	}]);
  	return RealisticBokehPass;
  }(Pass);

  var SavePass = function (_Pass) {
  	inherits(SavePass, _Pass);

  	function SavePass(renderTarget) {
  		var resize = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
  		classCallCheck(this, SavePass);

  		var _this = possibleConstructorReturn(this, (SavePass.__proto__ || Object.getPrototypeOf(SavePass)).call(this, "SavePass"));

  		_this.setFullscreenMaterial(new CopyMaterial());

  		_this.needsSwap = false;

  		_this.renderTarget = renderTarget !== undefined ? renderTarget : new three.WebGLRenderTarget(1, 1, {
  			minFilter: three.LinearFilter,
  			magFilter: three.LinearFilter,
  			stencilBuffer: false,
  			depthBuffer: false
  		});

  		_this.renderTarget.texture.name = "Save.Target";
  		_this.renderTarget.texture.generateMipmaps = false;

  		_this.resize = resize;

  		return _this;
  	}

  	createClass(SavePass, [{
  		key: "render",
  		value: function render(renderer, inputBuffer, outputBuffer, delta, stencilTest) {

  			this.getFullscreenMaterial().uniforms.tDiffuse.value = inputBuffer.texture;

  			renderer.render(this.scene, this.camera, this.renderTarget);
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
  	}, {
  		key: "initialize",
  		value: function initialize(renderer, alpha) {

  			if (!alpha) {

  				this.renderTarget.texture.format = three.RGBFormat;
  			}
  		}
  	}]);
  	return SavePass;
  }(Pass);

  var HALF_PI = Math.PI * 0.5;

  var v = new three.Vector3();

  var ab = new three.Vector3();

  var ShockWavePass = function (_Pass) {
  		inherits(ShockWavePass, _Pass);

  		function ShockWavePass(camera) {
  				var epicenter = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : new three.Vector3();
  				var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  				classCallCheck(this, ShockWavePass);

  				var _this = possibleConstructorReturn(this, (ShockWavePass.__proto__ || Object.getPrototypeOf(ShockWavePass)).call(this, "ShockWavePass"));

  				_this.mainCamera = camera;

  				_this.epicenter = epicenter;

  				_this.screenPosition = new three.Vector3();

  				_this.speed = options.speed !== undefined ? options.speed : 2.0;

  				_this.time = 0.0;

  				_this.active = false;

  				_this.shockWaveMaterial = new ShockWaveMaterial(options);

  				_this.shockWaveMaterial.uniforms.center.value = _this.screenPosition;

  				_this.copyMaterial = new CopyMaterial();

  				return _this;
  		}

  		createClass(ShockWavePass, [{
  				key: "explode",
  				value: function explode() {

  						this.time = 0.0;
  						this.active = true;
  				}
  		}, {
  				key: "render",
  				value: function render(renderer, inputBuffer, outputBuffer, delta, stencilTest) {

  						var epicenter = this.epicenter;
  						var mainCamera = this.mainCamera;
  						var screenPosition = this.screenPosition;

  						var shockWaveMaterial = this.shockWaveMaterial;
  						var uniforms = shockWaveMaterial.uniforms;
  						var center = uniforms.center;
  						var radius = uniforms.radius;
  						var maxRadius = uniforms.maxRadius;
  						var waveSize = uniforms.waveSize;

  						this.copyMaterial.uniforms.tDiffuse.value = inputBuffer.texture;
  						this.setFullscreenMaterial(this.copyMaterial);

  						if (this.active) {
  								mainCamera.getWorldDirection(v);
  								ab.copy(mainCamera.position).sub(epicenter);

  								if (v.angleTo(ab) > HALF_PI) {
  										uniforms.cameraDistance.value = mainCamera.position.distanceTo(epicenter);

  										screenPosition.copy(epicenter).project(mainCamera);
  										center.value.x = (screenPosition.x + 1.0) * 0.5;
  										center.value.y = (screenPosition.y + 1.0) * 0.5;

  										uniforms.tDiffuse.value = inputBuffer.texture;
  										this.setFullscreenMaterial(shockWaveMaterial);
  								}

  								this.time += delta * this.speed;
  								radius.value = this.time - waveSize.value;

  								if (radius.value >= (maxRadius.value + waveSize.value) * 2) {

  										this.active = false;
  								}
  						}

  						renderer.render(this.scene, this.camera, this.renderToScreen ? null : outputBuffer);
  				}
  		}, {
  				key: "setSize",
  				value: function setSize(width, height) {

  						this.shockWaveMaterial.uniforms.aspect.value = width / height;
  				}
  		}]);
  		return ShockWavePass;
  }(Pass);

  var searchImageDataURL = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEIAAAAhCAAAAABIXyLAAAAAOElEQVRIx2NgGAWjYBSMglEwEICREYRgFBZBqDCSLA2MGPUIVQETE9iNUAqLR5gIeoQKRgwXjwAAGn4AtaFeYLEAAAAASUVORK5CYII";

  var areaImageDataURL = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKAAAAIwCAYAAAABNmBHAAAgAElEQVR4Xuy9CbhlV1ktOvbpq09DkiIkUBI6kxASIH0DlAQiIK1wRfSJTx+i4JX7vKIigs8HXpXvqVcvrcC9agQ7IDTSSWgqCQQliDRBJKkkhDSkqVPNqVOnP+8b//rH3P+eZ+199tlznVTlvVrft7+1T7OaueZY42/m37QALKNk2wHg1pITlB17mC+Pp11W3X/LHyT32vhg48/5SOv+PnwpsHA70JoGlueB1iKApeqzvOzn44GatTB76Xzhd7suBR7+WWADgDEAwwCG/L54b/poDLrHuvvm70Z2Avhsc+PVcxscBU8F8C8ADg5+ipIjD/PlGwfgju8B924E5seARUfLsiNmqQW0IjL8+7L2NYD/7COBzfcCm+aB8SVgdAkYIRCXKyDax4EdAanL5PuNPllNvXDlAHwFgP8AcC2AhRIoDXbsYb48dl5WkVFTE3LGDcC9m4CZCWBuFFgeAZaGAYJQQCRqDHT+McJrVb8zwATUXH02MHYfMHEIGFsAxgjApQqACYQORjtd/B7Axt/z79sC0+cMPgjjlwPwVwHcA+DfAHzTxcVgWBroqMN8+cYBeM71wH0TwKExYHYUWCIAHYRLTlkCYgcIBcAgU/n3qy8GRu4HRgnAOWBkERhddPAJhGJDBxkvw7cqimr+zFM/ZLnZF64cgL8BYD+AWwB8x/dlWuWagHiYL984AJ/0RWBy1AE4AizyM1yxYAcTigW55xMbAkxEiwEdkJ/ZCQxPAiOHgBECcKEC4TBZcKkSv+mTieNcNPNC26mLNsj45QD8LQDTAO4GcJt/7iw2bfoG4WG+vAGwm9ExiEg69zpg/wgwPQLMjgALzn4E4aIzoJjQ9g4024uygkj+pyuAoX0VAIfngOH5NgCHMhAm8Sv2y3XDZeBhNIp8OzJE8OsBzAKYBHAXgDt8/4O+MVT0j4f58o0D8Pxrgf3DwMwIMEPQEYRkNwfgsuuDZLskip0No0gWMD/9HGDoADAkAC4Aw/wsAgZAgs2Z0ABI0GU6IVmKv+f28KDnHxkA/G0A8y6G73N9kOCjXnh/Ebb6OvgwX75xAF5wLTA1VIHPADgMLDj4yIA5AAm6aCUnv4oz46eeDwxNAUMzwJAz4BABSNDFTwSfg7DDKHE23MG5PqIY8A1u/dINs9dBdy8AgnGPM2NfUBrsnw7z5RsH4IXXAAcJviFgluAbygBINnSLWOAjGxJ4pgOKDV0v/OSLKp8iGXBovhLBBOCQM2ACoTOhnYrAdItYbCij5JFzRyIAqRccAnDAQUjg6UNQ7hsMXP0cRQAexss3DsCLCECCLwCQzMcPwUi2MwAScAKbfnY/YRLFQ8DHX+IAJAMSfDkAF13kLvleIjhjQQHxUVS3jjgGpKeeNzYVQEjgUS8k+PghONdhIwAP4+XXBYCHKIJbwJyDTgaIAdCBJx3Q2M8tYAHP9m4df/ylQOsQ0JqtRLCx30K1wtLBggScQOgsKBGcWHAJeOwRC0BSM1mQIKRbhh+Bj98JQP6t4U0APEyXXxcAEnxkQAFwoVUxID9kvQg+c1C7vidRbIDkc24B//hTQGumDcCWA5DgMxASdNIFBUI5pCML8v8API5zfEQx4BudgqiczviSnJhQwCP4BMCGl+wO8+U7AJi/W4O4YS6+pmK/2ciADsAOBhTIIiAJnPB7AvNjP+0AnANaYkAHX2JBAc+tYaJXOqBZv24Vc386XW5dtkHGW+4HFAJonpOe+YYQZAShgKjv3PNvPQaxVoI8zJdfFwASfPzMUwS3Kt1v0UFIlos6oDFdAGFcliMAP/ryAEAGNwQRnDOgLbdlIEwrIs6AZ/QgkMMHQF6ZAKQcJAsSYPwIeAIk9wJgoPK1gi7+PwF4GC/fOAAvIQPSs0URTPBJ/Pp3GSEGRHfBCIQ0xowBtUbcAj7ys5X4Jfu1HIAGQrIgQRXEsAFQIORDFhiDY/rMHmrU4QUgR08AkgUjCAW6CD6CkwBsAIQC4GG6fPMA3OXiNzCg2I9gNCMksmAAoemDzoimFwL48M85AKkiuQVMAAp8CYRRDAt8GQiJ67N6GJODAXAHlsGguscA2AJg1IPGYmxOpBxFWkRN9LsATgIwXnNs/v/5z/9XCf8BO3YAtxbc/46/KDt+5+ea1Yku2VUxHz/z0v24FwMGK1gWsK2OUUxHHdCBeRUB6OxHABr4ZICIBd0QWSF+XRdMTAjgCdTrG9cBNwE4F8CpDkICyYLGsuhFt6zs+gISwUen8zEAjgMw4cfx2H6O/90yAFo84Cbg4ID3/9TfLTt+5+ebnRABkODjx0SwPi5ec/FrYpmqSAxM8Dn60CsqAFI6GfhqAMiDE/gokmvEr0C4PgDkBQm40wE8zMFEUDKEVoxIMLl/KS73mE7H9d+vcKHQQcjwW0Yu9nP8m8sAmOIBuWY6wP2/4s0ezjjg8TuvaR6ABJ70vxUApGrm7EbGE+i472BAB+WHfqHS/eoAaEwY2E9+wLSXTqhI7CXgnB6LCoOJ4BiST+hTnG0HcCwAglCx3ARoZEVFXnBPp/O/A/hXACc7CPs9/i1lAOyIB+RDX+P9/+pbQjjjAMfv/PL6AFDs1wFAgs/9fgKfgdE/ZEpuiQlbwAde6QAMBgiRmsSwA9BY0JfjovGRDBMH4TlcXGhcBOc6HkF0gjPhZgchxTLZMAci/04W/B6Ab3t09EPXcPyflgFwRTwgJ2MN9/8bf5qFM67x+B/aW4XQz42FeL0YrRyikztUFw0704mf9kXgxhOAqc3AAsPyRxxQCs/PdXOFY0W1KHy3QIUGtx+6vdnx1vsB+dsTncm2AogglFgVEAlUWrOMB2RyEmMCGQ/Y7/HvKns6tfGAnJQ+r/9b76oJZ1zD8WdyQjYBh8aBhVEHjELouQ8ukQ7VRSCJAALwkr+sALhnGzDD3JAJYJHg9uhoi4bx8ytkWUtvHT/7+Zc4dw1uZ3612fH2dkQf7yxIEEockwkJQn4IQoq8unhAhmPRKKFx0uv4K8ueTs94wD7u//VX9ghn7OP4c+4G7h8HpseB+dF2AKlFLwuAIZ8jD6NPrOhAffmfA9/ZBuzZCkyRWSeqBCWyoYGQ5yQrBpDbum/ME1HoPo0XEkSD2zlfbna8q6+EUJcTCxKEtHL5EQjP6BEPyIgYAZBvYt3xHyx7OqvGA65y/7/9wVXCGVc5/sl7qxD66dEqiYgRzAqhN1A4CBNAAlDyAFI+iZ9/N3DLJuC+jcDUBmCWyUnOrmTYCMIOkNclLg0B8/RsNLg9+UvNjnd1APLmmQpFHyEBROuWACQT8nN+H/GAvY7/VNnT6SsesMf13/CpahGnZzhjj+PPmwX2MYdDIfQexWyBAwEUOQDrRDN/98p3A7dvAO6fAA5sqHJDBEAyoUVGkwEd6HR12XU4kwzfl6fCXTZzjy57vvnR513X7Hj7AyDvggAUi9EyFgiZqNxPQF6345nOWbD1HQ/Y5fpvuLa/2+82/vNHgAPDFQDnhoF5j2C2qBWCI8bw1eRw5CL5l94L3DEOTI4DB8Y9OWmsEu/zBJ3rgsaybqBob/7A4C7jtWcooRrczr+u2fH2D0AOQgAUCxKEP7aGgLy64+m6KdjWFA9Yc/03/Osa4glrjr+AupqHz1sEs0cxG0BC9HIePLoit9eNkVf9L+DuUWByDJgaq4ybGYLPAWgiXmLedUE7dwC7saL7CqfPKXi4NYdaykCD410bAHlDEsNiwZ9wAPYbkJcfz6T2gm3N8YDZ9d/wHxUA+739fPwXPrSKYGb+BuP3jAFDElFH9HIWwbzCIGkBr/or4J4RYO8oMOW6ZVcAuvi1Cgoha04BCwT5gfMKHm7NoRde2+x41w5A3hQZkADk5+cGiAeMx3+/7AENFA8Yrv/G71cAXFM4Yzj+otOAaQLQA0gZxaIIZtMDFTigKJV8H9Iq6aZ59ZXAvSPAvpEKgBTtBODcSCWCZeRYtpzrmLyeGNCAyFl1v+Hei8qeb370Rdc2O97BAMi7EgB/2QG41nhAHU9LuWAbOB7Qr//GPRUA13r7Gv9FZwIMoVcEswEwfDoimEP0shKKtIphaZQAXv1+YM+wA3DEdcvRKkGJADQQEsQuhi1Tjt95vBsh5nx2IO59SsHDrTmUOStNjndwAAqEry0IyCMICkOyiuIBNwBvPFQQT7gBuPjc9oRYAIHyOEL4vIFEYVNaOou5vCGE/tV/A0wOVcnpzI47NOri3QFIBpSeaSDUdYLOSWvYImSGgftpJDa4MWJbAGxivGUA5MAOc0Be6eVLj7/4Mk+hzCOYPYpZDBiNkLh+G/M3yFyv/ltgL3W3YQfgcFUhgRY2PwY+Z7/EhAR1SFyXCOb57r28QfQBsJQBMn5D4y0HYLPje9Cd7RIC0PM3EiMofF4gVCBp1P840ix/gyz56r+vAMjk9Gl375iB4+CzveuZdLkkEPJ8ZEfX/6R73vOjzT5Si9hucLxHAVg4PwJgRwh9CKOXK8YA4ZEqKZXSQWh5P+5AftXfA/uGKvYjCKn72cctbFrZNECka5L5CPwIPtMH3TVz17MLB5gdLgA2Nd6jACycHwLQxFEUSR5ASvARDB0h9AQb9bXIgCGk6lUfAPYTgEPAITKgg1BObk58srTJgG58WMkWMaAbQQT1nc8rHGANAJsc71EAFs4PAagQestgC1lsBJ4BMCSOK6dDUcwqqaFiQr/0QeAAAdjy+jBiQQeeMSBZT3nCPUDIa9z+/MIB1gCwyfEeBWDh/BCAeQSzgkjFfGLBBD5nxQ4DxN0wv3hVxX5TBGDwL5obxvVA5YqYL5BeMLd66YYxJpRB0gK+96LCAdYAsMnxHgVg4fwIgMrhUPKQ2C+Bz0PmBTqBMQehAbDlIjj4F80KJguSVZ0FuXpjoCOgXawLjALhbT9eOMAuAGxqvEcBWDg/l1IE05Ed0ygZnyHdz0VwCqEPIfNyx0QQvvLDFQCp+8nfZk5und8tXwIgWcHSNX0N2CJmnAl3v6RwgNnhl17T7HiPArBwfghAS7mV/hey2JS9FvM3BLpUUi1YwDRMXvkRYJoAlAh2l0dcZ04s6JUTDIjyBcrl4yDc/dLCAdYAsMnxHgVg4fxwKVwJgGEJNmWtxpQMpX9on2eRhVA+O56AjMfnP+e3Xvf3NwG4xIPTleiY55bpGh6UbafNU0l0z0p+5Jh5HqYJ6b51nP6XP8cx12XNHQVgIQB/bFPVg2OC7Q+WgVFWng/FvtWLI06uWh5oguKEcXVS/9sEAF//VGD7t4ETDgJbF4CNi8CGZWBs2fPL/H6Vwp2KEtVk4fJ+v/EIYPN9wKa5qu+IncfPwXHVZe/aOL3EbwS7xv8A1rQvnO0j8PArTgTGZ4BxFv9mIxhOCGsv+0OPYDRghcLfkWkEuq0+G00x4OtfDGz+d2DbHmDLjL8si8AYP/7CGIAiEEMTG92zXqSbH+d9R2aA0XnvO+JjthiIrOVDHHPOkBrzUQAWAPsZp3oPDpa/Xag6EVkLBK+5rAnJC3/nYk/APD704WiEAV8OTHwX2LQH2DgFbJgFNrBhjd8r79deGoEwsllgNBOzy8CdjweG9wBj08AIAci2D6HafmyAk4/Z7SJ72hGYRwFYAMDLTwOGp4FRFgD3HhzqRGQiyeurqOdG6r0Rm8IEZjzRlkiqCWoEgK8Axm4BJu4HJhyAbFhDxmbDGnZO4j0SgLGDkpibgEq66TJw/1nA0F5gdLpq+zDqFfd5LMeWqu5HNST0uJOIllg+qgMWgI+HPv0xwLA3gWHpW2sC441gCECbmKziaGrnUdMO4aHeh6MxAP4SMHI7ML4HGD8AjHvHJGNAgpDgY/ck3stipRemvVhc+uASMPUEYGh/9dIRgGx8Y+MNbR/00uVtH0wEx94j/v0oAxaA8Ed+GBieAYZZg5kADC0QWGOFzGJlcGPzl1BxNLXD8sk4xftwNAbA/wwM3wGMUmxOOQBnHXzetIYvibonmSiuYTNjriVg7glAiwBk0fNZH6+PmX9P6kfNmCXGpftJ7TgKwBIAnln14BAAYxMYm5C6RjCyCoOyr0qkD/c+HI0B8DXA8N3AyCQwesD1VQKH7EcASm1Q+y4CkN9pUKiVF5nLvy+fBbTUd8QBaH1HvNBROiZvfsNnrF4kcvPwpdsBLBeU18Nf7AB23Dp4ecHC8oBgUlJJecLS+7+WOpE3gbE+HKw+yoevCYkMGKqPJrdEKARutaFYRs1fiEZ0wP8CDN8LDO8FRqYq3W10pgKgfYLaYCzootgA6KXaTA90y374TKB1sBozy77xHFZ536utRgAmEaw6g5kUSFZwSXnA330qsOlfgHMPDlZesLA8IOjoLypPWHj/11EnCiVwkz7kAExtsGraYUWdSDX5TmsagL8KDBGA7Bd30JsW0oWivnEOQNP7yGTSBR101AlZSUtGyfgZDkCWY1HnJdcBVe6325hTvelg2CQjZNDygG/2An0j1wKnL6y9vGBheUC8prQ8YeH9X39OVQSc7Mc6fCaKvAeHdCIVf4yMYCynTpX+nb97NJmlSQb8r8DQHm9YOFUZTKOzoXGhs6AxF0HIexcLBvWBuiHN8s2ne98R3qc6L4Vyb2oBVjfm9MIFHbjDCh6kPOBbQoG+oW8CO5bWVl6wsDwgfr20PGHh/X/1iaEIuDcCTIW/1Q4rFv8OnYiW3c+W2iKwUjKbyjQNwL1uuR6sAEgDgq1brXOmV81PxhNB6DUDBSYzQJwFtz623XcktX1Q1VWKaTF/zZhVazBVYA1tX5MazsGvobwe/jQr0Ne6BTh5uf/ygoXlAfG60vKEhff/rSe1i4DnTWDUACY1guFTDqLYdCBvf6DJYSMYATBfOx1kLfj1v1axH10nQ3Sd0GUkBnTfpemtBJgseIKQAHLQcVxa2TnuMW0Aqui5es8xBIegVdVVE8VhzHnLh65WMB9An+X18K6aAn2tO4ETl6vqbKuVFywsDwhevqg8YeH93/Rk70JE90nowxZbIJjvS3WYNSGUwGHJTpPxwwcbBuBrgRYBeKACn7VtpdUu/c0NJxO9BIxcKu4TTODzbkonPLoaL0vyUQRb2y8HsL1ckfWzMeuFi40Qezqi+yiPhyt7FOjr6/gCFwgP7Xb5vssTFt7/nQRg6MGRWmDRoeyTlpgw68GRTwgZgo1gGmXAX6/8dtaylSKY/koyID9BhzML3q1gAos2AcOrZYSoq/pJp1VtODRm9Z3LS/7WjVkvXOzEtOpKyGrlAT+4SoG+VY8vBGCvy/dVnrDw/vee65NBJiAjBIVcAJQjOm+DkCZEeiGAMw6sAwDZsJrAdhFM9rPGhd4904Co5oVuCZPV6kD40Ec6+9W8dBTBsfdc3nkpvnB82fp2RPcs79dHgb51LA9ofsDV6vut5/3PnxcAmLVBiDqgevDaJLkYrpuQxzcNwN8AWgIgRbB8loEBzXDwl4cGiDGft58SCOWGedgjvOJ+bPvgRkiuA+ZjzhnQQOiFNVbloa7l/fos0LdO5QENgEXlCfs8Qbf7HyMA3QVjYihYhLENgjX9y/qwxQmRU/asfd0ZcLU2CHVGyusJQLKfVi98CS12T5f7iECkHpsMkAhCF8+nshWH2I/jXsOYO144GV/9ApAIrS3vt4YCfetQHtAA2G+/4PW4/2PPbzMgmUMi2NoeSCRxIt2/FvuxWURIWCXg357gfTjEDNIHnTRXRCpH5ugKwGl3HpMBXQc0v6WLYVm/5limj04rG762K2uYY9jBkr9+rI03NL5ZbczS/dJ+LQyoga4o77fGAn0NlwdMAOy3vl/T938KAcj121z8Bn+Y9eWQJRz8Y6kNagDh2ey5EvxjxQD8TWdAuneCCO4An1vw5vdzQMmdktwq7pLZQR+dM34+ZumAxvY1Y04uqOAJ6FsExzeto7zfAAX6GiwPaLWR1lrfr8n7f/Rl3QGzmsis+/uO71V9OFgP2gpPhgr7TGRqRUT6dyvr4aIs/pm/2zVUNbBSv6G8e5pEv0Cvec7Po7+bTtjlBRlkvAMBkDeQyvsNWKCvofKACYBrre/X1P0/oWEAnnFD1YdjhtXxR73mX10FfCHHE9pVWcGAI/S0gKsfA2y+twrFZw6Hxf/F0Pk8Ri/kpGSnMuDx5T0iACgQHioo0NdAecBUHW6QdsV2/cL7v/Cyqr5gnc42CCOcfX1VIZ/V8We9IDmTzVXwPDJiXuKXPxtDBma8+lzP4WAgKkPxCUAPE4v5GzEuMX0PYJPLhB6FJsc7MAMmkVxaYC/K9gG+F1++8AQ7Gwbgk78I7GFpXgIwFiRXOwaJZPUbiR0yCUDRk+cHf+YpwMj9HgfI8ClGPyvsSiH0WSKRuYlitLb/zHM/JOSs5C/YIC9cMQDZr/dwxgOW9gtGYUBi0wA8l304vDQvAchilFbpIBQhZ7Ejq6ZQ0/Yhil8y4j89Axie9DAsD6FX9HOK3QtROTFkviN83kG4felIY8DCeLrSeMDSfsEovAECUFsTjHD+tcB+tkFgcXKvBRir7qtFl9owmO4Xy/1G3bAFfPrZHorFNWBFwHjQAFctIghj2kBarw06If/+MM9ZqTN6DgsDojCerjQesLRfMApvoGkAWh8Ob/tgAPSKWCp8ngNQtadjmTdltvNvn3peFYhgQQgh+iUmEaUAUoXM1yRLmWuFLaE9Z+XIAWBhPF1pPGBpv2AU3kDTALzwmqo6qtVh9kJErAudABia38TC5wJgS2xIhAwBn3yhByL4EhzXfRXxYsDTJ4IvrNN2JFMxZcBzVo4cABbG05XGA5b2C0bhDTQNQLZBYH1AVsQSAAU+imI1obHyblnjG/kJk3U8BHz8xVUQAhnQIl5CyNgKAGp5LKSSCoAySh5Jj79vTagcxUaIBeRNe79g9gq+DXig4wGzy+PONfT7RWFA4noAkGXZVAhcBckJQgNgrLiaNb3paIDo1vHHX+oA9LQBi4DxJcOUPJUnTgU2NJUyROs8irGARxQAC+PpCtsFd40H/AEf0gMQkLgeACT41PiGoLOKqyrJq3K/Ya9mNyr5FusN/uPLPIeDa8Bc+w3rtyl4VFHaMZc3i9RWBM9jjzgAFsbTFbYLRmm/YBTeQNMAtD4cBKDXBTQGdAB2MGBo8SCLmEuS1AFVAJ3A/NhPt0PoCcA8bSDG76XI7aySg6JYuGfKwJHFgH0E5B3ueMCe/Y4L+xVHAOZ+9EHcEgQgwbeiEYx6jwTdz4qfu7EhEJqxGqruf/RnHIAEnxgwBM0aC8aUAYWNBRCmoIll4HTqO122QcZbrgMWxtMVtgvuOx6wa7/jwhtoGoDWh4MBJ16WN4lfr8AqI0TVV1O1fa9BbQzovkAy4Ed+NgCQUSxZCFWvCOaOFREXyUwZOPIA2GdA3uGOB6wPaOz+QPv5S+MA3OXiN9aclghW+d3IgupBF2pPqxcxGenDPxfSRh2ASiKKiVP2PaZScvAKoA0VDc6cOlIB2GdA3uGOB1zR77iwX/F6AFB9ONSOQW0frA50sILVcckWJyIDSgwPAVcJgFbYuZ3FJvAlEHbJ3IsgJLGedeBIA+AAAXmHOx6wo99xYb/i9QKg2iAIfDJEJHqj4SExbEty0gkdhB/6P9oZbBZIGiKYVb9GKaN50lRHBLOvhDxh/5EKwDUG5B3ueMB2QGM/grb7/6wHAPNGMAY+GSGUjC52VX2f2CD4+HO0gqkZfegXKgBaHkcWtS0AWii9xG1ImrLlN5XR8L8fmQD05BVrmEENmpYSP9QX+KHiqj2/82+HqqDWwnbBRfGATdzAegGwru2DpRq7Mzq2fpAf0Nq0Rl2wBXzglZ4yUAPAmDSVWDBPHQjLcgTqOZ6zUvdKHh4ruDCerox/Dnu7YqwXAC1NI/QcEQuK6WK/kdgCTGC0PYAP/KIDMBgglq+hIkrOfsaCviLSofcJgJ5AdM7kkSaCj/HqQKVIGvD4swF8bcBjmzjsaQ2H5D/6acBd9wALB4DFWWB5AVherMp4GKIYEOp7+26UF0aSfT/xYuDG7wDjrIpAERytXf2vajj7ueryQXSFl10K/ON3gIWDwCLvjfGB8Z54O+Ee4ve6513uB2R1yzsqC+twbC8HcNVhfAeaBuDP/TvwtS3A/ePAIfYFVlPq2HHTuyulZCTlhbjhETF5yxTQGgPGhoHhIWC4VSXGD3n0tLkMHXHxu+YyB+MlPwDuZs5K6FlsbCzdVO9DuKfkHM8AEkP7B8fOkwDcD+B7np42+JkGOvKdAL4E4K8P0zvQdET0b14D3DgB3D0B7B8HZka9WzrD88N6sFm+YcUjrn7E1ZDvMtF9DBgeAYaHgSGB0PNHCD4BLwLRsByAyX/ij0/dDUxuqlIG5hix7eFhvLcOVUAtyPSydAFmOQNe6EYGV/9ZESiKgIEgtbaD/gHALQC4ovY5r5KwtjOU/XfTAHzzLuCmIeDuMWDvKHBwpMoN0WQzNtAaYSs0K4ZlOSAjGG9kPjCBRwZ0ABKEBJexYAZEAU3A7Oi1BeDym4EDnjQ1TwCGWMW8MXcKks0YOyZNlQOQjcgYIUHllEzYQ0ktm+r6oz8G4F4AXwXwRd8/kO9A0wB8y65KmPxgGJgcqYJTKYpTv2CCzyddQJRDOjKivn+Deh8BF8BnwBtaCUA+YYEyAU8h+c6Az9gNHHRmrgOgmDA3jHQ+iWupCeUAvNSrA9HNwqx+muk9nJVNg/CTfrmbAPwbgK8D+PcHkIibjob5o13A3XypWsAkG1cPA9PDFQDZM1id0i1KxsWfOrKnAFXlifCFFMMRcASigOcs2MGAIfE9iWXplS6On7UbmPaUUTXQrgsVMzcRj5Folg2V5ayUA5BWYKwOxKUafnosWjcJwk+7W5F2EKvlE3xcXaNYfiCYsGkA/smuqug6hcleAnAImPbO6YwRpMgjCAVAm/yQmKTv5hNsAf/i7SyNBSl2a8Qv/4/M1yF+BZSYlNQCnnVrpbC+mToAACAASURBVJcaI7sOSEY2NpaDXLqpR+vE/OVksDgImgGgghHoYJbTWc7oJtFWc65/cg2AYvh2ALsB3AzgVv95nS/f4QdsIkT9T3cBrGtITWZfC5hqtQHInsEGQn3UDDvEDEY/ICf7SxMOrAg8T+c00JGkvHGd2DABUYZIAONzCUDppCFhSukCBsLQrFtZe/IixYQpSyEoJoqnuPWrVRAubQh83HNlZB23z7j1ywmj6CIIqUPxw2Xeu9bx2jx10wz4Z7sqTYZaDD8EIDuoE3hMVEphWg66JIp90k0sBxBcy+iPIIaT1RtEsHS/yIAqw+VSNPWQfe5tlVEk8auXgVa5BUsEJuT5uoliAbE5AGotmIAjCPnR9xDG3TQernYAUupTdBGEFMf83OkApHG+XlvTAPwfuyrgSZOhas3u6cwTsUBVn2gTwyFMi8wjHZAA1M9fYGHDULJD1m8Cpa8fRxDad+l+Ykf/3XNvd11U+qiL39SxXevSsshdDFvgbI1O2AwAtRZMZzTBRuDFjxe1Xg8QEIB8yyj5yYIUxfQIkfkIRnmHCM712JoG4FsdgHHp3ACoMH2G6jM4lWzoQarSvwQ6MSB/vporVaFkh+mCLlpVR8Z+dqDZLoDOpHSiQeAFDkBjPrlgCHgCUaFifg67H/9uYjn4Ai1vpTERTAASBaoQJBAKeNqHlL6mwPDZYAOROag/EYRkPX34MwHIvzW9rQcA+TLpI22G7EcQKlJGsYIJhC6ClUMiXfBTbFUQAej6nPS/OuAl9pOOqIc2BLzg++3VmWgIEUz82cRuCAtLIHQQm0gO52uOAb22sC3JEWgRfPpZf2sQBQIgLydPEIFGwPEj8MlF2bSbsulghLftqsCXq9HGgHysznrGgi5qzTUTFH8FLhAUn3hIJwCN0HLncw37qaF2zoYvuKNivmQIuUNc7GvWt6sHNs26twA6vhyq8NEMAHlyntFrDCcQehyaPTl+FwAbXDcmAKMRThakEk8Q8kPg8SPL0qzLBl+A9QCgR6uZGs3vfHz8TtBZvkgGQrEPBVAUg2Sij50QAOjiVKI3saADJRm7dSLYWfSFDkCem/dhZeMy9pPY5QvSDYQyUJoDIK8qMezh3wY6fSL49PcGgCAA8pScJLIgAUYQEmz8RPA17StvGoBv39W24eREiBoNQSgWNI1HBkdgxJSw1AI+dFIbgOYmkjimQ1r6XXC3rAbCHycAgytohf8vsB/r2KRaRq7zpZ+D37HMX0s3DDcCUGLYaw53MJ4YUODzusqlGCQAOQCejuxA8UULUkxIwAmMAp8Wa3qkN/R9W+sBwOhIEPjk5SLr8HeKFbTQfb77csPIMHGl/4MPbReslPhNe4+MiTpi9AFGV4nI7MfvagNQLh/pfrYnDAS8aJQ42A2w4em2cAyWQUuJVQTGWLs1uL7DG9J1RjhA+jvYk4t3KXeMqijpzrud4At9z3XtP16yGfjKZmCGooYh1tZzvv8xXPFl4PoJYC97k9FlwZWD+Azi/deMZWeP13eQCGEyoERudChIjbb3mJYwH7V0QIKuCwj/gfMj0asn2I0FXRSHXfL/iRkNgLyeVj8ccMY//J1fyxzTAXT2+xoQViKYD/1hDqLxPiYxTgSvQrphphG97tz4Slqafnj7uk1kIQDZrvWTw8B3jwEW+RLxPgSiCERdPwPR7+wCPg/gulFgfruDkOMQkFc5x84e708JAMmCuRNBXi4TIg5CGRzGiBGE/D4E/C2r2vcAYJoify62i0aJSMhB+2IHoNwu0fkcjQ85pu3ack5nIBREqneYFyWLkAXIJHESe00Cyx5QyeL6F/tyEcDcrOW2n7fX8df0mME+/vQ/PQjhoy3gzo3AISYf80MQaQx1peH9wb7v2mrtmCBkIMMejp3jIJD1MsaxaMZ8v5N/67INAsB3BAYU4JL4DSo1J15AFPAEwuQHZJzkKfUAtOHLJSOQRWndBYQvCQA01cfnNopfsaCJaD2baBn79QjSTiOEP1EcawIpkq2kegBTNgHWEpOKF8Uwq2NRFPM4AqCf46/rA2U9/uVDvurB01zvAJpiiwOl3fEeciCGF+Ij11f+QkbSfMPfIzqw57mEFZ9Dl3Ps5HXWAYByHJAJKV7N+s0cCQQhwSlfm4lGZ0KB8C/rABgZUS6ZHITBSEhCowUYAAksF7cStWREyxRwtuPpOlgw+5s9sq6OaIJIIlUgEhA1edoTgHxa9HVw5jibZNF+j/9yGQA/7pbujZ4bwv2+cWB6tFo0NzYnkxFA+cvEAo43VBoEo2e+48EMXEOmD9F6xhCE8RwZEJ80VblKvDlmzwicfqy93/o+8K8TwB2jVSgW138FrJQTXBNlnJgmrjZwanow9CBP/rL9wF0jwAGWDtFyoN9PHutnIHT05mPXz93dMGQAPniJsjiBXiTbxDZFMF9NLUPQxKR5qezz1Y6/YZDH0D6GkdAkYJIvRalAdHAMmPZoYhb6NhDWvEyf/ma737CXN7R1ZC7hUbPgcFgqt/ZZjADnM1xqEVhYBpb4CUk5UsL7jQvj///5buDrLeCOEeD+YQchYwG9VIfyg1NaZszFiCH6DkRGLze5/dgk8IMWcMCjdCiCzR8od1B8OTwvJM8JEShFut1fzMhi+eRJr6LI7hYP2M/xVLwKNoZjUTwRMAQQmYyhWGQxsSADOflZ4kukj7PhZ75bETjBpkAGahMkcrGgwhsXeCyBHBj1wmOBQwvAwqKzoFeRV8ZaerjKYAuirmPY/o9X7q5Cyr7fAvYMAftCPGAEoYlBiVtFwLjtp2U4irj7yOANbi+crHyrfCbTquJV44O0F1FrwQGIMZFqdQDyP/gGSZ8TC0ZRRsOlVzzgasd/u+zpMByLehAfCgMQCDyGZJHFCCgLZ2f8mgI5qauEcVx9e5vACTgCTwEMWr5TdIpWKJb5MvrnoocDswvAPAG4VLGg6UKeqmi4iuDz4er30oX0FP7u5moMvIf7W8B+jwlUNAzFnlZCIhvGFRCeWzrgXSSIBreXTFZSgVLHAp4UHOFuociEEsn2PJwl/XEk0dzfSojeerFg1IOo5BKAveIBex1P67lgUzgWQaJwLAKRH04i14ItgDKEtGsRnWx49b2Vkk9wUefTGrKCF7R0JxZMqxN8cmPAxWcAcxGABKEAKPA5u9lEaAbCmKMI+sDN1X3z+ro24wEZFc0VEE64ABgT180PF9ZdBcDb6JpqcPtPk+1ACbmKjJnllwyuILunEAWjZHkBsrsRUnfD0qEiC5IJfyisgMhzWhcP2O14Ro4WbASgAMQJ48SJwchmBCDFa8qpyBbSP7OvU4PQ0p2W7+LSnSJUFOrI4V7w5IoBTQQTfJ6oTSYk2mQcpGRyH2syGjIF6EM3V/fM++C1CfwUExhCsmzCaQT43lZC3e1hBpEHh36XEqrB7Scmq5dV0XZxmV8WuDFzAF9iwhow9seAGoBcGtKjqAc+1l9rLb/1igesO55ysmCrC8ei6IxRMAKTWNBi6Xw98xNTFUi0jEcmpYgRAPhddpVi9OIEPP5cYD4CcLkCooHPwaW9kV+iwWrQHT8uA1fd3F7DFvgUHUP2k8jTiogAqLoxFpDgbMj9jXSuN7i9dLIdaxzBp5XVBMIMgFEnFAPKT9qPd6A9BIGI7MfPmf4U+40HzI8nWgq2PBxL4FEkjKJixGRRFyQQPzzd1iAUzCAQas1YOmAEoFjwkecDC/PAwhKw6CxIkCXwOdVJLxTobMjBdyIgfvimNvNJ7Evf4jWtdnRYD1YNGVuG93VWuWs4Jf+mlZCCZxwP/cnJ6mXVKk2+tK8lQQVHRTGc64SDAZB3Ey3JcxyACkToJx4wHl+YwqloGDICmYmTFgMQFBET8yyYzyAG/AfWX8mCGQg0BTRoHwt9KVaPE/HQ890AIfgWK+CRAaMRYnVdxHbhdY8Wslw1V93UDsmPIj9GxgiAioRRMIJNvoti+SW/Ikd0gwAU8+XxJcbGITJPDvI6XdCFREFSknTB83xka40H1PGF9dnycCxFwygkK0bASJQSVAbAYeD98xUAe5U3jKIwBosSgNsuABYogl3/IwgFPrOIg1Xc4ZrpAsSrvruykl2ucykapkMMh4CExD5DwJfWAYAxwk4MKPAJgOIjGSEGwuCakRhemw6Yv0UUwRf7L00L9pnsNx6Qx4feY4O8pDEcixOjsoTKKpMYjSFYYjOC8Eq3Wnnr0YYS+0Tmi2HysrPGLqwASNYzBnT2Mz2QD91laxLB0gs12GAh81cf/o/OcHyJ+qj0S/zxnhUZbSyYWaL8+Rq2S29wowiWkJPan4MvgrDDGAlRe7KIywDIgR3meEDWg9HbJgApNTkXo8o0i7oVgxnEgFr8F7jEdnU5GvqfJQKQKyEOPlsNIQvyvupAGHS/Okv4qv9oh+PHxMLk8ggBCRxvAmEN+AiEzz2iQfQBeNmkh4K52hJBKOaNe/FSLobLRXCz43rQnu2yi9oMSMDxs2jo8303ERz1wsCGZECF4kd3DwEYYwJjhoNlQrgIjlYodbBPrwMAZfEmyzcIv27gs6XDzC/IR1DOgA9a6DRz4wZAsZ+LYXvQYsHoD4ziOFklna6YD3+nnU6dZ7bGDAcBUImIAmEUw/zbJ1i/scGNDJiLXmle3RhQ+l/aq57gUQCWzwwBKPeLsZ/LFrGg/ShRXAe64Ajkv30kALAjF8R11Dy3K7KRwJcsUTaqWScARou3w/INVnCH+A36n8RvM3nB5XP4oD6DATBYwGb5ajlOLOh6X8JaBKRG77+7ygGYp1bn+V25/01AzBnwQ1ypanD7KWfA1QDYC3zJIj7KgOUzc9nFbetX/r+O5biwNhyX5uSEDr5o0xsJwLp8/m4A7GaJUv/j3/5+HQFYJ3oFPPkho/hNeqBcMkcB2BAA6XrxmMBkfFAci/m0JpwzXw0TXvXtzrz+PKc/Ml/ugzM9MDqCAbz/keVjjGcQA/YLvjoguo1mRslRI6RwfsiA5nqhL5D6nscF8gfTdfxpS+/hLzvWfzMQCoB1Fq/8b3VWaPIDZqsRV64DALsZHVHs1gEvsqFAeBSApQC8pHK90Oql4UEAyvCwNeGcBXNLOPMLftgZsI75ouUr9ousp2TEyIJ/sU4AzC1e+WIFshyAHPZREVwItrrD3wGAhibTYBhxVpe/xePyrNBuWaoNp3DgFwC81O+RAepK/a5Lfe51jxr7JwA83nPXYgq1asl0yX5N48+f4VEGLATlK1vAo5YB1gBSRmsM+NFE57lcfPD5pPFWCJImtyvGgGfOAacBYO59zFglgHgPefZsXV6/gPXBYeC0RVgyJNOGYuJjPka9eHWgjL9bWzhWk0/n/wPn+k8bgFNmgYcsVflZnBRmIShtJM/m7JGibGBoOIIez9wKPP4AcNpylfbNlGfdI+9NjBjz8JVzppckZuJ+dBw4aQ44drk6j1LIY9JkPD7P4s2lwVEGLHwJnncscNIh4Nh5YMsSsHm5ndOu1BGFThJ8/K6JrZtoslST2+XHA6ftB05ZAE5crgAups5TfaL6EF+UyIif3gAcOwtsXep82eIYY9JkXpMgMp/AeZQBC2b8OduBYw8C2+aALQvARgJwGZhY7swEzbNa88IRvAVO1qkF91J36DNOBE7eD2yfB45fqphLnevzdGeBKBfL8UX5/CZgyyyweRHYsFwxYHzRNK6oetSBMDLjUQAWTPqPngpsnQK2zgKbCMAlYMMSME4ALrcnR6JYQIwsoUnjpDRstOLy7cBJB4CHUGwuAtuW2nUDVH1EFUhycSwWjGD64mZg0xywcaECoI0z5P3X5P6nWlHdgHgUgAUAfOYOYMtBYNMssHEe2LgITBCADkIzSJZXpCOnIg25uPrhgnupO/TyhwLHHwSOmwW2LVSik2pCrDsQskzNIBGIpBdGI+VfNgMb5oENCxX4yPRjPj4xaJ0+WGeEHRXBDUz2Mx4FbDoIbJypADixUAFwzAFI8KUJChMV2SUaAGc1cE/xFJef3FYRti64nkqWDrqqEhbrsm5zvZCdPCd8nHzJOLZuABRz9hTHZwPL7LnLnoNMIY2VyaKcjtZLHOAbNgNPngKe4BacfGF1pnydD+hphQ/8XV5UiEueLGnDN1tWXj/3/4cTwAUzwGPcRcFJiDpPt3FLmf5vjwE2HAQ2zPrEzDv7OQg5OSM+ScYQy5Xbo8465u/ZfLTJ7fKHAdumKxVh8wKwealSE6inEoSy2MWCdbUHIghv3AqMzwHji9VLZuDzD8cXxxWZs5c7apmW0fMBnIHKn5X7d6I5npvRz94O7LgXuGIReJSb+Xl1tzqflybwRwqf9i97BQRWomWJQ7oZVFtJoqDX/b/oGODsvcBTATB9gsfGqmzdjtVz+G+PAyamgYmZCoDjFE2anCVg1CeJwOMnTRB/DmUINVkkgia3y08BtkwDW+YqAFJFMD1VAAw6XG61R31O9/fdrcDYPDDmY0zjc1UjivBuAMx1QdMB+WAYXU8dhEU16dOSkppbcHFSrng8MHwnsGMPcN5ypURHp2xMIa7zDz2z8Gn/kVe0YomO0wEwBYKujL7v/zHA6C3AxfOVh58g5AsZxx4fZM7sf3h6BcDxWWeGBZ+cMEFiwGEHHRnDzun7ONHs/djkRgBunql0VDOSHIDU3cxSD4aEajhFXS4H4S1bgVGN0V8we7E0Fh9jVDG6Obr1LJMRwn+kOCaTEYT0dsfqZHXl/p7PrLi9wIY7gO0H2yAgCAWCWCowKrYE8nMLn/a7PQn9X7zIJPPkCcK+758y7x7guNsB6l98gZjLLYet3Ay5n0sv4R+fCYxPA2MOwLEAQLIDPyP8uBg2cRYmzFweAYilKkn+OC8/Fdh0CNhEA4nGA40kd6FES13WLO8v1qHKAfh9B+DoYjU2Ak/js/8NAIwg7OUb7LCC+WAfB4CpBJoIiTRNRmS1l13kqWh3Adv2A8cdqqp1MB+aIOSxWv6pq5D2kkIAvt8rF7BLJksN/jMqfa7v+7/Ak4B3A6ceqpasKMq5akAmlLWY37t8ZW97PDB2qALg2BxgAFwANEGcnI5JcrDZRPlkaXL4u1KJUAfAjbTQ59x6dSvdLPXAgGYshZWR6JIRaXB/NwFI8C1WwLMXzMeSwLfcXuKrA2G+wrLCDcN/IIg4ERRn0qvyySAQX6mG1XuA4fuAbTOVwktRRr2MLCoQyvEZ/UY/WwjAj3jtFJZkU79g1ghkgEBf98+0Umb/3A2M3lkBl/fOcdMok2EjkZyv8773LAfgHDDKjwNwxEUw9yailpwdxBAEYhBbAuGzG3aKkQEJwAkCkOCjlb7Y6SYyf2UwlAS+vKYnAXjfNmDEX7DEfA5CjUcsnzvbu1nDtUMmCDkRZEEyGdlAk6G6lQTSa6m0MP6HuY73AxNTlcJLZ6WOJYC5/CNxLpHMgdKIKNl69Qvu6/75AjHOiTU87gKOOViJb748BKCWrnK/maTA+58AjM0Ao7PA6Lx/xBAupoYDC9okBRAmPdBZ47lNA/DhwMRsxX7mPgl+SrmK5EaRNRslXFQ9CKB9DkADn79cZtkHFkysJ103eBbqlh97DpmTQTYgk9VNxu+xYbXKU3lhFoJPOgdFGY+lPkgQxokkgF9Xgj4AvfoFs84eX4Ke9x9fIC+tRfDxvvniif358sSir2LCj5wNjBKAc8CIi2AxxLCzIAGY9L7AhGIKgpATw4l8wToB0JjPrfTkp+SLQbHrOqm5jNyajS6VCMIpApDAWwQ4LrGgXqzIfnq5cv0vN0ZXHTInME5GBNLb1DGdOYQsI7AfGKFjlgqve8wJwG4T+fuFAFytXzCLb+VgWnH/fIGYfc46Hs7iHC8ZkPcdXx4VfVXJw8+cA4wIgM6AHSLKWZCTESfLfg7WsIyRF3ckiRQ+HACXkwHptyP4KHrpJvKVGnOhRF9eBF9wE0mUEogz2wC+WGI/vVxiQQIxAs9+rmHA6E1YFYB8DJwQMZl0OrLZ++i7sfT8zroYHLS9df4RACWKxSZvLXzG/fQLZqk2gqn2/vUCUQ9UZaM9wDaPeSPrC4A5C1KV+NITKwCS/SiCR/jRBDlLmP7nHynsxno1IPwJSyRpbiMADXzuPDYfZfBTEoAmcuVQdiaW0zwXwQsCYDYmMaDA1wG8TBSvaoR0G77EcGSET6hjOvVApfRPAUN0zjr45JzVcSqiTxD+VeGzXku/4Nr7JwDJOkxFIwt6j6+RqUrlkO4bXzp1gCAAv04AzgLDDsBhKugLFUvQUhTwCEKbnKCw14HwJ9cDgGQ9WegRgDI8XEcVEDvAl7lVlglAgi+I4CR+Zf1mLGgMmDFhBGFfDCicRJFERviSABjLS7FC0MFKMU+07wOPE0kGvaoQgGvtF9z1/iODkwn3VWoEXxres5ib9xx1wZufBAwLgAQexbAD0JiQwJOuJBA68/H3Zhk6+3CifqqwWNMKN8wjKgbk6gWJgC+FMaBb5vJVmsUbV2vCqo3cRWZcCIACoax53+ulkqNd7iqOcU1WcC9cxEm5kQBUdZ+sTnSL/jEtTWngi21jhJNJBivZBukXvOL+yYBkcOqxKjJ4AGgxzMrBVwdAMmHrZOAYF2l6y/mwV6xD17zmWo6MbRyeWtOHwxJ91IIhr6rqZS70DPPLXDVUrfBwzHKr1EUp6/h0T/6L/GcCqslt4IhoTcwdAqDSs7I60WQH6R329pHuFyuXDJmEjuOSbdB+wSvuP5bGUjmsA5XoUvcvBXKKAQnApUdXwah0b8jXR2YzJTsC0ZHB33FL+2yiX3h/1YeD1fFZGT81g/H6yqkVa9YEpqMhTADle8erHA6t7Mh6j4ZBXdBGjFyO4CSIm9wGBiBvgqxwIAJQlXIyEJLyI/i0SkAG/FbhaEr6BXfcv+5dLKhCg4z1C1HEBJ8+BODQGZXfk/quAZC6ketAZEQCTWAU8PIJt0fgwHzZvVWNaKqi7JLOmtDWFy42g1FxH/XfqGkII0C+a0tnDkfsGxQjn3VPsk7tXmuy+Xp0JhtoJosAaFcUAJUYKiYJxcqHqKAH9rPlG2cMrmCUbMX9guMLpGTcCMKDlZGhMK8IPnPIn1X5PA2AwegwEEYmDGBMjOI5whGQP3NPBT7VJlRNaKvF4t2IWHbDErtDlSk1p4lJ7/zd246tglGZryIfrFhQ7pU8WCAX0ZENG+57U14Z4YrCeLrSxXdev6TfLwrbxT7znMrfKQXfHLQCnyvmRIv0Q3430ezMmL98P393G3wqz6am1NYzzoGn+svqRmTAU2citctqAX/2EI8F9ACEmLHXLZGoFxtSl2xyK2bAYwrj6Xr12+1noL/jUTCD9vvFrn6u0v1/nvGkaoVBAQi0eummMAuXQHMWJAA7gCixG8U0gFfcXdlBKk4Z6zELgAJfZEKrxpC1xOIl/+Sk7jkcdYlSco90y9+gK6vJrRiADD0piad7RuFo3udNCgft94vCdrGXn+tujgV3QAcHLcFnroelivHkchEL8ue0uQ74S3eubAITS3IQhKkMRjBMokgWG3L//2z3VSnP4VDgQWxUEEUxAZFHL0eR3HDfm3IRbDHkBfF0zy4EIKNhSvr9goGEBdvTz/MIYQLQdVsTwRTFDj5jQmdArRDYJQNDSs961R3tPhx5NXoVgoxleHnarjohgLec3D2HI492yQNvIwvqO9fJm9zKGbAwnu6FhaP5pFuMg/b7tTbpBdvTz68cz/zI8azVj8iAHTqgmFHXDUB89R2dtaC7tUGw4kDOgFb0R2wYRDGZ8g9O8aU4XwPOczhiwGlMjqqLWiFYGu570wADFsbTvaxg8nkow7E8nM/atfKzln6/1mS4YHv6BQ4+Z0BbqHcd0NwwYbVD3+1yWhXJxPBrbq8AqE/XApSqAxiBV2MZ/54DMOZwKE00rnDUWcR5KiV/brjtSAMALIyn+/mCyeehjIYp6fdrvVELth8RAClyHXxmhPi6r1m8FM0ucgk8+y4RHC1kAK/5XgW+2hZYofafWcPq1B5AqDqEYsQ3nepR2gqhV2yiol1COkD0C+aOaoGx4aL7DQCwMJ7uVwomn4fm7VrX2u/XAlELth+5sHPtN+l/Ap6sX2dCsZ/phZkIJgv9l++1wbcq+2WFv2NXIjNKAPzuw7MUAV8DTuynFIEsQy83RgTAhiv+NgBABaQOGE/3mwWTLwAqHnaQfr9GnwUbARgDNBUlkpzQboyYCyYDYdILdf0l4NduW9kGoa4geNdazLElKoA3Prx7DofiETtC6XvE7hGEzJlpcis3Qgrj6d5UOJoYDcMglrX2+y0NPtl5UZUjkfx/Hqbecoe0OZzdF1gHQrln9Bhee4s3f3Zxm4MvAk9VSFdUIw0i+Q2PaBtISiBSSFgCYMjMW00MP7pwvvLDmwFgQTzdHxcOSGvBg/b7ZRZByWYAlOERluKM3Ra9CKWc0q73dTBhMFT4ZwIw9l5Lrpes+HjeBiGCUOKXeuBvPcKTiEIOR0f+RhDBMYi0Lhea4GTaa5NbOQAVDzhgPB1La5RssV3rIP1+7yy5OAADoAchEHBkFbKfGRpiweAPtMs5IFNokyOGk/7rAYC9OhBFwNXVY1at5tftCBHaWVS2AJdEcEinrDNC+Lumiyc1B8AB4+muLARAXTDCWvr93lR4/Z0Xt6ODFQkj8WtumEwHTKDLQejAfN3uds/dfjoQdatGLxb8jQBAYz6/boxiFgAVudzNIc2/s3xLk1szAORoB4yn+2DhaATAGJCtbpkCYq9+v4V+aBgAQ4i66XtaC85YkDog/zdZvzUgfN1N7a633Xqv6fe9msDIHfNaB6Ay2JRE1AHAEDIfI5nzZCLeN4Nbm9yaA+CA8XSsul6yqV0rJ2WQfr+splCyCYBR/HJyKX4phs0PKBZ0lqOYTpvniAiUAmAd+HKjo1cvDjHgr+3wPJQsVCymUZrPMuRsRBDG4AQCsunyJtFGHwAAIABJREFUcc0BUJlxQoH62q8ST8cggpKNAFRGwCD9fkuvbwAkyGgJE3C+Nz1P1q9/T3F1EZBxvZh50s6AEYC5yyUHXt5/Q8zI5/KrAmAIkkipkyGPYwXz1aRT8v5ZO6jJrRyAvKOvNXlLazsXs9bo/ztc29Pohgotp5J49Rcj/pzfIwGS//3OM4CNd1dpntQpFUmjEH4LYIgnyn/OLjL8FeDGhwJbNgFjI8DIEDA8BAy1PFK7FSKf43cNKrvHx+8C/vmxwMgmYHgEaA35J0StpvvzL/nP8RbLAfhyT207TChgDRiu/ZL9DsfWNABvYzbhCDBKoBAk/pEobGWTqp819hzQ1/0k0PoaMDEJbJjxVZFgDad0SaUO5LksWVj+XScDmw5UEUDJ6U4d0nVbC91S3ovfVHp5al64cgC+k7mZAP768KCA0WD3A/ieLz090CDceVmlAuhBljLgrfcAw6PAyDAwPFwBkCAbItM4a/FiNtERjBl76W9ffD2AbwJDdwFj+6syImRXrd5Y2FjIYcnzWPLEqnsfC0zsr6qBMQmfIDR/pyJ6xMhKyMrSDiKD2xja6TADTt0/AGAs1KcAUCFrOLF6tbtiRVFavT/wuMCa7MfVTlH098YBeBcwNAIMEYAUlS4uBULOmK3LCnwOPANlEIOSoF9+C4DvVoWXhvdWZVOYqWgi3vOXDUQhgieB0EElViMYJ08HxqeqnG8D4IIDkAzo51DKQQJvBKUmKACzbM4+5hUivwrgiwC4LzvjmgCh6nBcgiMTcv9Abo0D8E6g5eCjfpUA6AxoQIzgi8ALmWwC4z//DxcPPwBak8DQFDB8yJPpPZHeGCyC0KN5DFCByfh9/+OAsekKgEzCTwD047X0SCPM1IYQjCv2E/MJoGVwUUQoPboq0MdqkWVn7RtDDMahB4g+P6qhXFpjVtkDtRGA2nKjos7IyOyHFUbIrXe0FXsTuzIYfNb4O2M3ATGIYQOmPn6hG6gi3eUkQQAeAIYOAUOzALMVh2pAlESqGFBAXAYOMQVjxll03iO/yYKRAT0FQXkwZkjp1pz51LO2XAT3KtD3AIAwj4Wg05kfiuUHYlsXAJLVnP0INLM0OYFx78AzcRySeTsw2AJueI+Dj2Fne4EWKz5MA0MzDkCCkAByUWqsJzarEanzj2zXwjEGFHuGY+pYsMojzZL1G9EBexXou339IRBrC3lJGmNDuSHX+w7WC4Cm6wWxm8DngLTImgC8pBcGBuTXf/1fXnyTugnFwxTQOgi0CECyIFlsvvJfEnh0mhsYI/s5uxFYi1xZof7oOqSAawwYjRGBzYGXbtWXaCIrlvHUagX6SP/ruMVYCEbEqECXAMjfree2HgA0ESur1/0vtnNwGSsG0RsZME20/+/XWH6Mugk/yngPAGy5GDYALjiIHIgRUIrsZjM7Ax+BSx1S4pfffQVIep8dL7dMDsTGjJB+CvQxTHmdtrw4l0CovFruC2NOe975egDQsCXRK/eK634JhBK90q2C7I1i+Gt0jxF40k1cPJAB7UP2m3MGJAAFQrGei9iUTH9yBUDTHfU3B5+BOIKQ43BWtNtPcWIOzEZE8FoK9K0DCGNxLi3FqaKA9gTgeoFwPQAoI0OulWT11oEwiFz7cwbErzNxWtEYBB+VY76Vh4DWrH8IOoGQ7Ocg1CqMRLPltmxvs1/SHaP4dcAJePYyyUCRIzrTB8tE8FoL9DUMwl61kQQ87Rmy2PS2rgB0a1ci18RudEJH57OsY02y/+83/sZdBKr4FXQTApBvprGgQCg9UEAM+h9F6ugJDkC3gJPBEvRGrYoYCBX9IxEcS5K4i6cZAHIw8oXQ4mLBb35YH5d7OekadtTV1UZSjaEIPH4nQzYNwgjAHNwDuWGYpZc7lzPfX1cQur5oBorfzDf+zi0yVTuSkuxBI2Q+PhQDIUEnMLo1TBCZLufGw/ixbQa0KB8CTODjPohdY78IQmfDjmW7Yo/doAX6GqIiAtDHaYswSmeMubV81kp11L6hy2PdAcgblfslOKC1IiKRmyRxZgV/8++DS8BFrxXi5Hd/U6MeSKdqEsEKhpBRsgRMbAtuG4KU/+9ry5brzP/lPVMv1EPOQegharrVcgZUhVHFxNPcp9VFtlOWkL437C0WABWypFRGsV0sb5Hn2zYBwvUGoKl10v1knDgo0y7XA8Pfv0UACnjaK33Co9gJQAOe64FkNvtZAHQdjz9v2Nz2GSa3jYej2W3KGuZ9ixGdIVSoKT13B2s5AHkGheST6qn0erHv5AIgAAU+LVfw/wq3CEAV7clBKDDGZG9/5oVXx/oyYARczcqH5GyH8eFplTawFvAtrtXLGpNrQDGbejupB3omlIHQGc/ErzOcGSRs8zrhAbbuL1Tco/JfbLlNwHOmi2kIcs3owbdwNpYtynDQhsFcgvuG9/YapGFvYX22zZcAU0/GwA2LJ/4AmGF9mwEbBu98Y3cMF+uAGQCj2HVp3BbPuo3IlqxAy5wHAq4OfARmEBXGfNIBa0BIsG0ecwC67merHgRpZLwocrWaovuTxew/V0txJQ2DWeae3WAGbdhb2DB4+wRw7w5g8Qpv88liyGtoWHzMi4C9fAEHbBi8kwUKu2xNAdBxaGBLbJdZux1LwAGECYAEm6wyfpelJrEgFnRDxESwgyUxIUsVMwjVy5AYO0bG89Auu1/5BF38KqjBHlUAYXsteNCGwTeWNuwtk4JMkrlzGNizA1hm69g1Nix+zDOBW0aBeRZZGqBh8M4emfWNADDT+zqMjQyESdQFHfDbZECCLRgdHeCTe8CBaKJY1rDnBRCIAuGW4TYAZeFG8ZuMkGiQ1IEwGCJtHZBmy1obBsvVMnDD3jIAerti3LEBOMjGcOpa3WfD4ic9t6oveDtLfw7QMHjnH6wPAybW6yaG4+8D4HIQfvtDIVtLejpBFsVvUI7NIBHw3DUjRzL3rDVtsYPOkAScuX3coNDynT2VYJCkn+PjqvUD8hVbS8NgjphGxcANe8sAGNoVY/824BCBtIaGxRe8pLKZdpMkTvXiJ2toGHzSNHDPScAyq3er4qPyGaNc7JCRXWLT2TjwGmCOeQashq6+qSpZmp8vojQpheF58ncdZVjLnjWPHr4VWKTKxrHGUqq97qXu3jp0wPy+eEC/DYNZsZAO6IEb9pY9lNCuGPcNV830ZmkM9dmw+OKfbdcXvJMPdY0Ng0/7GnDXKcDMccBS7MwdKz8KCAKQIgY0MWGCtr4TOHAasMwOkTqf6unyuLykfd254nkb7qsw/iVg7jhgmSX31Vpd9yRHeLx+zRhjEGRbB6wDYT8NdymyubzDzCCGfpMJWfSRYfr9HP/aMgBm7YoxNQHMbQHm+ID6aFh8yS93tAvGQb7da2gYfPoXgbtPAqaPA+a3AEubgGU1RM6B060fgkRoCzj+TcD+04CFE4BldZdRc4/YxlxgjJMewSiwN1zWfsOngdljq3EmY08vm5i/7j5yIMqpvupKyGoNg9lngYosl9wY/0dZdrMzYl8Ne8sAWNOu2MA3zw/F2CoNiy99XbvftrcLriz6PhsGn3U9cM9xMODObQYWCMANwPJ49UliuW6SaqqBn/gGYP8pwPyJwNIxwDK76ahDeN6uXYCuYyABkEza4LbpY5WEWdSLxjF26/dQB0SJ6r4ByAN6NQxmkWcqrnQ00x1DEDJFjR8CcNWGvWVPp6ZdMQ6OVOCb3wAscPJ6NCy+7PerkP5Q3tBY1PrT9tEw+JwbgPu2AlNbgVkCcCOwtAFYcgAuiwWlM/XqDjMEbP9t4MB2YO54YJFMo/5gHIcALV1TRZ17FXOhPtvgtvkqf9H4kvHDlyKK4l6VzvVSBF22uwjOb7pbw+CfcwBSkyeFEHAUx/yw9JTyEbo27C17Ol3aFWNuAlgIn9QxO2tYfNlbK6MvaxeMRYquvL9rTcPgJ30TuH8LcHAzMOugX3QALo21WXBZLEHwRF1OgHS2eOgbgIPHA7PHAezNu7QFWFZ7JnXJ5rnqxHEulvlzwyVNN3+wern5Yovl7SXLGwvn4riLWO4fgMRJXcPd/+pmOymELEhRzBxJAo9gVL4kwVnbsLccgHEpWi3epocCAMeBRU5eTcPiy/6qtl0wpvhA+2gYfO7NwOQm4OBGYGaDs+5ExYDGgqP+ccAkINaVpB8GTv4d4OBxwNw2YGFrxYCmV0YxLNYheCXau7EhV3ga3Lb8g4+R45uoGLADgHWqhsBXA8K1AZADyRvuvtkBSArh+i9DsQhCOtf0UUgW/7aiYW/Z0+nRrhizoxXwFhyAi5y4rGHxU66qAFhT3rDSIVdpGHzencDejcDBDcDsBDBP1uX1CMJRwFiQIBzxieL3KIY1YW5MPOxNwLRb8gs0aghAss1GZ1O+SFHsdRPt0i/PLHu++dFb/x4mXfhcbWxhfCtYMFr/uWvKxfDaAcg7ipPCvFOVpuo3HrCjYW/ZA+rRrti6TS6MVQ+L4NPH2nx698GnXF0BsKa8Iab4dFZpGHz+JLBvApieqAA4J8CPOQuOBBAOV0CUYbIskRkAecrvAdNbXc/aDCxSpyT4CEIyTgRgneiLIp3nP6fs+a4A4N8B8/48CUC+ZGJA29fpuLmxJW+5h5kNFg2jiWHSi0r0Uv4pCoZsxw8DUfnhd4Vk0XGdGvaWPaBV2hVjdjgA0BlpkQ/K9bmn/HOVqtClvKEBqlfD4AtmgP3jDsBxB6DA7tdbcvYzJvQJkii2n4NOeMpbgJktbYPGACiF3wFoEx1ZMNe/4jnPLXu+KwD4t/5SO/iMBcXuesHylyACMBPDgzGg7opM8mEHIGdwrfGA1rC37AH10a64Yr4APvvOSdwEPOVbKxu+K2pdKRTmdI3dqkPPVgbSTBGAY8AsATjWniBdx0QxJylOFCcr6HBiw1P/CDgU3EgEIMW52M8YkLolQRddIN1AyKWiBretf9MJQN6HsaCPxe4rvgDdHOcOxDIAcmDFDXvLnk4f7Yqt63gEIB/Yoj+4p9xaAbBHeUPM8qF2aRh84QQwNQYcGgdmx4C50WqCFngNsgSvQ+Dxu4MuiawhwIAXVk1O+e/A7CZgThY1dcno1nHL2oDIyZULpBsAFTBZ9pjT0QQgn2V6ufRicS8QRgbs5ZYpEsENDejBfpoLrwAOjgIzZMBRZ0AHoUC+SOA56xJwNlEyTFw5FxBPeWvlzpnbANCdQ1eSGTRybMuydgMggVBsKmtYoC6Mt8znZxsZMLzAxoAOvsh+ydDqtXx4FIDl8L/omQ7A0QqA82S/ERdTI22mNfaTuBIIxR4BhKe+y61punQC+MytI/Zz/c9EuvyBeetLAfGZ5WOMZ9j2/gqABB1fMLsHAVBqhfTcyH5d9MByEdzs+B50Z7voGZX+NzNSsd8cwUcG5ASRKYbdHRNYwhhDIHRgGmO0gFP+HJh15jOXjnyKblVT5Cbfoq+yJOszF8P8+VnNPlICkMAzds/YLxlYznrJwIpO6egTPMqA5ZNDAB6iCCYAyYBcBqTRQ0e4630SxZyQJQIvMJ8mSeLrYe+p/GzGfnTpEIBy6US/out+K1wg+brs88rHmDOgAVCMnrEfxxMte1Mt6j7u9zzKgIXzczEBOJIB0BnCJoqgIfDEhM58SWzJEPGJe9hfVH42un/Mfxl9bgSiBySIBWnAJBDGEDAB8QWFA8wO3/a+wH4+rg4RLPYLul8tCI8CsJmJMQAOuwFC9qMI9g9Z0CxhZz65K0wfFBPqu7PEyVdWAOTHVlTcpxhXHZLz1w0ZA6EDLhkCskRf0sw4dRYC0PQ/vVSRAYPo7QCdj7GqVOSMeBSAzUzMxZcDMwLgcKX/zbv45SQlHXDIgagJc+bjZBqAWhUoH/Y+B2D0J7rFa6LYDRmzomsAaOeKqxEvbWacHQB08JkRIteSXiSBLYJOLB+X4xrzAzY7vgfd2S4RAKkDDgPzNEAIxMASSWF38WsgkuXLyXTRSRCe/DduSZMBMwe6ObTd8JBj24Aot07uDObPP9XsIzUGFPs5+JJ/M6oT4buxHv9X7BeY8KgOWDg/Z58GTC9Xq5FxTXOw9c3Cm6k5fPcjgbHbgAlvVG2tH1T3Oavoq6BlniZ+12n5u/2sDbOvasqoFg8x2Lnbcd1GdhSAhXN+7qMrAC4sA8sORJ6yHwD28z+Ft4fdv8UyqUDrDmCEBcpZ39kLS6aq9l4D2rLb/KYsFTPWdfbvh86vQu2s1K/K+zIjTsXIVQ9a59Egs4Y6sZfIA/EcSp/jEXv8BWcAhxaA+SVgSQAkGAMICcwVlNLlqTc9Gbv/HAA7MrL4+f1VlXwrUq7SvCoyGcrrWpGhuur2fNGYwM8YT67hT3s1LaZvqn5MLM0bzmHMmIFSgdFNj/mIBct63NhFZwEzDsBFgpDPeanNgATfCtGsX9TIKwNrg9tuVkhlng7TI/YArX1VkXKrEe1l2SynN1RCsFJsqnQv3UIMxhwIRjU5AGN9QUteVz3BUAvahuNgjC3HxLAND7nBp/cgONXF5wCz8xUDGgCjKPbvevlzcKUHH2ag6cnYzepYBB9Zi2FxDJdjoXJv1WDFiLJ6MKqKZUzoQFTfj2HmwTKcTpVWvcxHKm6kKgoORAEvVclPD6NdzLXpMT8IYNPcLV7yJGB2AVhYrAC4SNA5AxKM9ryDPE5fs6eeVKWGZ2M3S3MQfEyJUKV8L1ZpJXpVJ9pLilmlAxWkVJHKwIhjjD9TtVXVm1HdOy/pJiaMFRWM+bo0rWl4yM1N7oPhTJecC8wRgAttBjQWdBBGESwgSiV0Pb9DRgu0TY19N+M1mRKh8niqFx3rRDsLqjgl9yaGXT80vcL1wnE252PAZCzAHQCoiqoW3yYWFIt664fUpKaREr1NPakH6XkuOQ+YDwy4FMSwgU8GSRSz0UJx3Vx/5vFNbrs/EiLRY+v4ACITww6iJEodQKwBIyBRv9vwhKzUW6z66TUGEwhDS3ezqusAyNxnJn8xa1KRPSFts9YfFB/QDZcAm78CnDBT5U8rCqjfc3yh8Gn/hGd/MsKf1+QzYJ4891Jye13iy1cAE9cDJ+6FpYrEkidxDN3OtXR+FwBGMezoMmxJLOumAuD4J4rxJrfdH/XCoLGFVKiUbw+LAPQqWWaMMLrd6/+JycSIm85w9lOpt1j1MwAwFTiqAWEUxeYH5ENn/jInUVHeMXQ/f/jRePvCa4DhTwLHfBc4frGqqaNJzLPw6iZxV+HTplFGvZrXZT45N39+HW3TujlZv8D6fp8HRq8Dts9XIOR5YtakgBgdrrrt5Qsq8Ssd0BhQ4HMwmVitAWHAY/LbLDQNQDaTVJ8Q6W4qVB51OOqDZDPVB3TLOBepW5jmqaLbec3jGgBGMSxvvemDYkQ9GoKF1ShUCSKCqBeQrvmfVZPC1keBjXcCmw911tTJ8q5XgOLaQgA+x/OdWA2EGZ98gbjleTHdQHQN+2iwls3nK3/Zhj3VeQhovYzdxmArSwQgDRA3QiSCJUrTnjfl4KozRCSCCeYmt90EoJJbVCk/1+FiCwFZxLk4dRfLFia6x8LbYkD9v9cXtLG6+O4AYQRfrgPygVIcqyhTXcWFOJH8fh3rz7EKwnUArq8mcGwK2MCC1i7WY7Zenh56feHT/jE3yliE4TZncd636gPFCKWavGhcRx2J+cvs9MlSw0Ty3cCm+c7n0G0MExdW4BMIbTXE9UCynvyCCX+Ovm4gbByA/xisVgJPpXrzLj4EoRJjJIZrWHArS9iprK+KcefgiyB0XVKGjOmCmW9xhRVMUSyRFnNeFGEdI2q+/HFXclkp9WsAbgTG9wGj08CI64WxRk/OTDcUAvBHXSLQxcVCDMQSWbzv+1e7WVbz+k5w2tJtsbcCYV6WJY7hmAsDA7r1Sz3OgOgoM+KTOJbcjSI5yGIaNE1uuwlAAU/MF+tF5/0sIghVLdVdM2S0bSzHx2Mi+FTxXf8X925NC4BycK8QwfmgVX1LlcFiykEMcL2BndJJ7aQfijKfxLGDwAhByM7aC5U4qwPzNwufNnNuOH4VZaCPlPo2AahqFqoPVFc14ga2m+WEEL0cAz9kdPrOmMu8r1o/rTsXz7f9oswFs+jO6LAqkvC3Ggg5Fg6mwW03CUI6X12h8lyfcz3QHqr3DIl64DbqaQKc9mI87QXACD6vpJqY0EVxz2CEyCI5eMSGX2e7VtI5J4yTRyZhscrvt1nQuivOAaNLlYESwcySgiVbr37Bfd0/u31yEgg2FVaiPCeVOguqAfGov0iR0R9JABJ0bnwk9nMxw+fOh55EbgRhzozrBUA1polN9CLwok5HEEUQBjFMQB7D+j656PW+IrJ8O/bBCo4sGFdGejqiyYCx3mKe9/JtTiBvmI5OFiTisg9LtJFF7gZGDrUbHKs79+hyu5hSaUvh1foFr3r/6vZJCiXgCDwVVFJ7MVmRLsrGltuFCc68yFdACMDAflwR4QM3HPoKgIExt4gz42SuaQb8hBOE2oZmlu+KFlKR3QSssMJxDPWbbjpfLoJrxG8CYT8MKGZSVTCxYFTIb84nkCxCIPLDiby30gXFghaF4c2ReR466Uu2fvoFr3r/fKAEFxvpqMcd9yonIrkuK5LLV7MVCM+/uDJCyIC2J8a0z1iwqyESgMl15Sa33QKgmtPEBnp11mwuXgO70Ud4DHWzfgDYC3zBEOk7HlA6XKyHQzb8HgGoCSQLqsxorIy1Bxie7Wx0rFaf+wr9Xv32C+56/7HbJ5VHtRYT+GJrsehHcya57PyKAQk6+vBkBZPpjPEExlwU59awg3C24W6KBsC6tqHR+MidyVG3i3rdAnAsH2T093XT+zLr197MTA80h3SfsZP2UqpCrPQ46oF317VrpeiKXTJ9MhMLkgGdCacKG/mupV9w1/vnwyGgCDCKWzJe3lqsyzLWZWe6/kc/oKzgKH4jC7oolhdC4jiuzM0WPo+cPQ2AsX1obFCTO5Jzn566PwbReiwnfTWjI4KvDoh1juh+aT+WKSYD3i8Aql2rJk+VsVQly5kkddv2FvHT61icqO7Fr71/IkLNXOi0FQjV0046oBy6wZ922Q95ICqDEaL4XWw3COcf9Mw73DFB9AqE6wZAAS8XuzGQIDKf+oVkqxt00ttAc+YT0PJ9qRFSB8xoye5Xu1ZVeCSgCLbYLVNswoncHxoeLwCzBGjBNki/4BX3z9lXgUCyIIGmhova83cRgO5Te9yLgP3MfmsBS8xs8/U67ePQOqy9umBUruDchqo8sHSd3PMfT5ifo+ack8eFHI6QEcnT5GvdOnVdXof+ptJ+BVPWceiaRHA8Us/nkACo8mzqlqmWrbFDppT5A5UIZm7CPA2Vgm3QfsEd909kKIqB1qJAKCBG8ZstZz3xHOAAiwmpDIdng1maZQAkZzsHZ537YfQrwNyxoQ+HakrnS0h1mUA1C96TdJTmORyhC3oeqdwROi+GDhkFI6bYNrcNDEDeAkXwQizPRpmnIs3OdqZPSaRFUcbchHlgie6agq2kX7Dd/+d8lUJVXuUzk8ERmS+2vfd4uvN2VOV5rSwb0y3JhgIh9wJeN3YMQCIgR78Q+nDEVYBYZUrUpbXFnM7COSdf7N4IPvtDnT2BY/h8Chh10MXQeYGS+7GGjaQiABpuNIFiECnzdWJMIUHcazLptC7YivsF8/7FgLFMqpiQL5TuNbKfA/DC46rqqAbAwIKWK+timRUBEiNGsOQsyQm+Gpjd4n046hbT84KPuYjOmHHyp92gcgDS2OoIuVIeh/xyUkaVwyEWdLrewHE3uBUDcKIwnq40HpDXL+n3CzbaKdguel5VnFJl2awaghLQBTzteZ0cjLq2A2n0M6EPh2pC57Wg41poLzZsAZNso0Hw6eVR/J8bF9YjWGmVCpGKwQLBRCcrbiSxNLgVAxCF8XSl8YDHHFPW7xeFBRwv/rGqOKUBkODzqgdWPYAM53vTASMQu4Bx9J+69OHIF+N71F1O1gUB+AsBfFqKC+4Wi4BWX+CYgOTAU36wdMVNVKka3MoBWBhPxyiuko3xkSX9fvGMkqsDlzzHC1N6SQ4DoINOe7KelWWTheziObeKCdARApD1AdVnRH048gKUAmAEYi6Oh4DJV4VoGDWqjq4XLbO5o1jBoimEPhPJmwu9FvnTLgdgYTwd2wyXbMyRKen3i2eXXB245FlVYUpVxUpGiLtmGBlrTEhVUwV8dEkVKAq3MHJ1uzRbRx+OOgDWFX6MsXJU/36lJoEoA2AKvw8+uwTEDIBbStdOs8ddDsDCeDom7ZdszBIs6fcL9ror2C75US9IxJJsEsHdGFBil4yYuUwknofJgF4XcEUfjrz+X7fKo4EJJ//PkMORO6FrVjQMeL5kJhZMMXzLwNZCt1nzDFgYT8cQwpLt4hDON0i/X7ys5OrAJVe0S/ISgFY7j9ZvnQ7I3+lyqpYaL98CWp/N+nDkZdhi6bW8An1kP3fRTLKVWlwF6RZCH2L4zDDR0k1IqeTNb2OQSYNbOQMWxtMxeqtkY6I+ny9VEz6btfb7xc+XXB249AoXv85+tIBVgJJ6n4lf6oV+mfjdDJNMH0wAVFX90GMk1f5TxlS3Fggh92DyN0IORy5665KIfCktsl+K3VsGtpVOWOMiuDCerlSnjQ2rB+n3C+pIBdulz8wqonrNPLKgwKaC5B3s53qhXVq6oDNg6sOhqvqhEr3V2VNLBjmnSSNdrOLJ1zkAu6VPRjFcFz4fXDJ8i45hG94Gt3IGjOFYA8TTlQZ/qGH1oP1+8ZtlT1MAtHK8mQg25zOZUSCLIliWcbw8wfW5Ln04ssqnHX04euiCk6/3de66MPpuAQVZAEFkw2MKFw6a1wEL4+lSBvmAOMhD8vkOkFX77feLNw14YT/ssmc4A6oOdHBEkwXlgjH2k4Nal6wB4fIuX9LzZjAmorNeHMo5Tc0OewHwDTUh9HXxfGJsYkAbAAAgAElEQVS/uvCpoAcew6zBBrdyBlQwwoDxdLZWXLDFkHyF8xGE/fb7xR8XXByAAVC1oB18HQYIT+8uGfP75SCUs1o64he8v4j6cIQ+IqkPhxrBCHjdjBH6AblQkAeY1ondukSiELmsUPpjbyp7XuvDgAXxdNZVvWCLIfmKg6Bbhrjup98v3lVwcQLw8gqA5v9zC9jErutltg8gMxDWWMBaMVkmANWFyEV6R0uH2I1IzW7ypbkQOTP5f2ch9KsFkwp0kQlDAOmxzHpscGuGAQvi6VD4RgmAg/b7xZVlT5MATNXwqQc6KGwf2U2uGV2uzg3D4ua7fDnPwZcKgIdq9GaIBPZb0YdD7hgyIFWMXiH0eQ5vXS5HcMkc++9lz2t9GLAgns7KxxZsCkgdtN8vWD+vYDMAUpcja7lOR9eLVcIP4tcuob/3AOHCdW02VTX62ApB4Mv1v24gnPy9HiH03fJ366KYHYTHsgBBg1s5AxbG0+HLZaOp65i+ln6/YM5EwdYBwGj1cmUkE7+8THLNdAHhwrUOXtcrO/pwhF4cct2oN68BMDCfmsJM/n6PEPoYPp8bH3kCkbtjji2tJJA962YAWBBPZ0WBCrbYsFoOf9pDAiENk179fkuvf9nTXewKcBSjsn7ldonWbgQpx+26otaLIwAlfi2QQSJY3Yjy5i9dmsFM/oEDMM/Z7Uf0RiYUA7J+ToNbOQC3e0WBBm9qLad6HICG1ZK1XB5PoxnuOOIcxSXe/Of8xHV/P+FpwN47gKUpYHmuSve0pKZgCKSq5wqniWE1WZz/xouBm74KTMwBI17lVBXwtWSs+8/vL45Ff3vhpcAnvwos8d48DZX3M2hx9XIAnu0IIO0chu35AOgLL0yuG/jOmwbg028G/mNz1YWdETbm4I5BrFlov+EtD2wIo7l+Atg8D2xY7iw3V5diEqO54mnj6XdMAYcU+6gon7A3NSO2qFjlyZYDkAX6uD5Iam44YaUfVNDNxaJcLIPXcGGpfi6PnZdVD1wPspQBX/wl4OaNwN6Jqg+xwrxslcVFuYJblehkcYYZGPS3L20BxueBcS8nwg5H5kZkx6TQSbXFZcCQKadx5Cz5mPurAFxrRaa17pAR2PFC+ElSHKQ/0QjQcgCyGyM9v3SnsDBRJgL6msWCf6IfWeUJac8UFlpY8500DcCfvgb43hiwZwyYVhd2D/VSrKGAmIDnBkiafEcN9cprHgKMzgNjS1V7rRjRlceyrqif6KAkMgXIM+6tAnDl+zSL36O9+U8p9jGHQo285/2XA/AnXeNnKAorDXH/AILwbSvLEz6Ql2+cAf/3XcCdw8DkKHBwpOpFbE2wadzIdyh3jjNQirYWEwYq+/zJwMh8pf+xKNSwM6DZMmzNRRbM2K+2Ii6TlFrAWfd5V3i/F7IgT2LBF5LbIdkqxLPWvtzlAGQ3RpU3Y7AiixMxLOUB2t7pKQ8M0qCTnp8HkojJgNqaMEJesQv4AR3Iw8DB4QqAs+6SWRiqgJgY0HVDAdBA4Ba4xN7ndlSFAAjAYX4IPO5dBDMAdS2i+Jx7XTf1eEdTDfgAQnR34p/wQkRmjNAoByDT/ugFphXAmjAEn8qaPQAgZCs0lSckCNmVigEbFMsPBBE3DcBX7gLuawH7hoAD7EM8DMw48AhATrjtQwiXoqkTEwWd7LOneXNCbz6Tiq/TInb2M8ZzIFrTQbGiy92oGz7pXl/7jvdAJnb2470IbB3T77Sai+hyAP5voTqW6sKwFAc/TAdc5+3dvcsTrvPVYSK4SQb8xV3+6IaAqSHg0FDVh3iOIFTIFxtit9orL5Z/LD1Q4s+B8OnHVuXwhhdd5DoLGsgCCJ04q66X/Ju/vSaeAxDPvbdtmdtKDV90gVEPIl/xySkviOhmAEjrlzSkwj40SlQZYZ39I+8JBMx8mZryhOsKwqYB+KpdVSDFvhYwPVR9BD7uyX4SwRS59nNI+bRck/DzJ05v12M0nY8fAk8iWL5BB5qASPGRCi8EVjzv3mqpkC9ACrrwhKukB67GhpqRRowQMqCiYbj8oOoHeUWpdYIBAUj8c8WjrjyhNIJ1unzjDPjqXdUjJAAP8TMEzLYq9uOHICQALe/EwWe+QgddAqCzzD8+vgIgg0qp+5nYjaDzCgjmnCYone0klqP4JSgvvK+6LoFPoFMlkPGh+0rPWta4RHTNJJQz4M8EAGoNTPVU8opS64CC9zoAWTFChcq7lCdch6s3L4J/2QFIEBKA1P9mHIBmhPh3Ai354RyAAmWsR/PRs6vOR8Z8FMPS97yxtIlYgVB/I7jC0rIKSfLXF1EEB+BFFjQ3jCLA49OWsRTTEPzvzQEwry7VrZ5KwzAQAPssT9jw1dcHgCrORQCS/bgn+1HsCYQSveaHkzvGv1scgU/6R55Y1YIxhvOm1EZekQWl8wVDxJgwc88QiJc6AKX/meHDawX9z16M/Em7bO8Q08GBP/jEkAEVjMBoAFWXUjRA3KtNwOBXW3EkAZhrALktpC6lKtTV4OU7RHB+3kHWgv/zrnYZl2kCkF4uF8MGQGc+MqEYUCA0n1tkwxbw4ScHAHr71Q7W4++c8czwcBAmHVB/c7Bcek9b3FuwbdD/kjGWgzJjQ3thGmVA3jhfOyU+RxB6FamOFp8NrhsTgLy8Cpzm5QlVptAU+6CiNgXCaIQ0BcDYV8b0P4pi30vfIxD5+w72C9aliegW8MHzqrmh/meuFhYi0pKbs6D9fsh/n1XFMrYMbPgUByCZz6J+uEknDA9AornWFRb01WZEsACoHhOqyC7wdetT0QAK2KqOb5MCUvPyhLE0oQxzqaYNXL5xBvyVXe12vByLADjXAvgxBvSPGFGMIjCmJbEW8HfntxtQmxT0cmxp9UPAdKAZ1upA6EB7qgDo6oCUxXRtPVSpAwJpnUhuxAqWCCYK1MBExZljY5S8SYr+pxAFAuBayhNG26jw8usCQLX0SAAkwwcAEngyQizaXoziIli+Oe7/9kJvNk1LmBMe9ECO3XRB7aPeF0EYHNVPdT8gj016YBcWtBfBVYJuz7mF7VgGY/pO8f5WdQ1/7U67nIKNS7j0wIbDPFZsyNHHY7od/xdlEHj8CcC3TgCWHgGAPSxiSdt4312u/8SPAl8/Dlh4pDeZW2PD4J1c9+uyDaIDkgEJQKnTfG/N8nUAmu5HUnMW5ARbPfEuIHy/ACjRK7FL5pOR4RaxgTHofKl8r/S1ZWBnAGDKefbn3AFIPRPXB7sFiVQimKVgGdl5ooNwLQ1/1U+DQGSXQ9r5Evy1q9rZbP1lGQDZsPpzI8APHgXgod7qUx11YtBbFzC+/C+BL7SAWwhgdoLkONSLqy5oLogYft3ZI1F7EAC+phsAnekokhP4HIzml/PvthQWmPB9LJ7jxkcSr14jWj4/0wFlgJD5eoDw6fe4DzAYPHokWhHJZ3TFSkn4h7YOSOBwEtiMTv1aY0uktFYTmI2/43EMQmCuAJmUE0gmVD8EFdPpdnxhVhqzDr8F4NMtYM9Jfg98EVTeNu9Q2OFZBX7vr9vtgm/lcezczZ61ZNN8DCvilYCdPXqNDQpAlfGTKm0M6AA0PTAyoMSx64cRfPQHXsniOTI+fEWDFGp+Qb9BeySRBV2kpl0QxxGAlHDmkI56X6z+EP7UDYSdRgh/IouwIZ36lHabBE0GJ0r10Rgb/xA/tt/j/6aMAf+7R4CxzuBXWRGULwBfIrY6UNfpvLae7n0I+LO/reoLMqiVMbW38oUhkNkQIzZO7tIweGePcmWlAFTjAYHPVGwXxWoLYblEDkLuTT8MDPhXLJ4jALpaJB+ggU6xfgJknT7IKXIQXh4Y0FZCog+wxiUTwSkXUbSMV1rB/A31OXWuFpPUda/mRHKi1e6U+hA7Zq7l+A+UAfDtHg/LrptkQpZ727cRWOL9542Pa3rOvuOqagUltgtmJM08j4/PILbIDKz6w5PAHsbraTnMGdZWIwIzxIfeK0rn578J3LAVuH8CODRahV/FFQ/1IumIvXP1QudNfyNT8oVqcHviPcBd48A0g2RDuoDqHdb2SalZAdG9dnfDkAE0gXnH5ijWCDbKCq5/MRiV0QD8HgHQ63jG0hdsLGxA3x9Bw1Asli7hO3BwApgng/Gjvq01IHrXJ7q3Cz7E++YziF2rs1ZLZ+8H9jJsSoECWXj6igmR87aLgfbGq4GvbgLu2gjsHwdmCEIPSI1h+SkCRjpfUC3iNWcpoRrcnrYbuGsUOMBo7QBCxSTG/igxVcBIVGPWM1h1JYQPnyKNExGZMDIJ9b66eEBGxPDY1Y5nv+GCjfGAxD+DDpiawphABWZPjwNzNLAEIH4XCH0M7/5c93bBfI8Yk2cgVAdvdT10ifDkBWC/r9lGH51NhIsnsWHOfPmEUKT94WeAG8eAO8aAfWPAwVEHISNQlKQUglJjJExqC+H6Nq93kOpUg9szbwLuHa66QzFWkaFieXxi6hgVHOMCYGRuJ+5V4jYJIDKI9KlsAvFDq8QDrnb8NWVPh9EwdFkQ79TlSMIsN0Mi5s9MoOGno4U6f3YAvefL7Y7rvdoFLxOANSA8f7xSgWmd0kCQbmZ6mTLEnJ0UqWLhUkxlrBn6n3wWuGkYuGukCsufGq2iojnRFpafsU7MDxErJuZhYCsJosHtWTcBe1oeq+hxigJgXBrMmTBPnJKLrr+VED54ibHYvZos8sO+DNcrHrDX8YVVyglAKud0LtMjFPtNMz6QLDY7VomLJd671AEH4Xu+3g7nWq28ISvX58/hguOBg8vtFQvV/hEzxfqOevuTfpjri8vAWz8L3NYCfjBc6ZYHmBcitnFd06pxyb8W4gPlgonBqffTtdTg9pybqiVNBssyUsdUD7eGO9amnf3sXtxQipl7Wg/sD4A8AwHIyZMYky50Tp/xgN2OL8y051qw2hXzwRCEdT2nmck1RxHG+w5jeO9NFQBpR6ldMIMXlFWgVndqF2dVFsJzuOgRwMElB6DcI6rznemD0RnbwQiSRS3g7Z+tVIl7PC9kahiYZm6IizuLigliT/VoUog+p8P9l3wJ7qGEanB77k3VczroUToWLCsABud4ypaLCUoxf9i/9w9ADiICULrQRWuIB6w7nuZrwaZwLBGwClSqSyz3AhHbaRGEFGOmC44D72UVgjW2C2Z4lIF4ArjodODQcqUGqAxfcpG4mJVuVqcL5tbs2z/veV0tYK/nhTAqesYNHdO5PCJZos+WuzxHJIViuXFyJxupNLg976ZK2lizUKodilGUgzyGhokF8yw5Mf+qRkjdjfuDtwkkm7DTkNaBaQ2ox1q3eMD8+B6O3H6em8Kx1Ccx9ptWl9iYIUAAWrI3I3nHgPdOtsO5eOuxXXBdj0V1vOL/so3Cxef60tlSpYwveKf0pAu6ohfdJ8k4CUqgvr5jV6VGTBKALeCAh+VbZLTnh5gu6D44A6H8cVlkNK95O1WkBrfn31R5HSy+JCwPplAxRegE/2T+AloGncNmbQyogUQx/KwB4gHj8YWNTwRAOW0FIIIndoqNkTAxz/bd09XDGLBdMM6/pLKi5whAX60gCK2ujxzEAqGL2pQ1Jis5AJEAFHvTujYAKjRf+SEugm1d2COQLU/DAwQ44caEw8AtZzSIPgAvuKkdrWMM6M7xCMBoiBn4YpCE2NCfxWAA5MEuwvCCEICwlnhAHV+YORfDsWJGgPpMKwg1b9QpFnzHbD2BK2JGul9s8KkYW17vLALQRTCBpzXZpS4gtCXXMAkduuAy8E7PijPWprXJ5CR38ygw1fJDohh2BlRAgq2OeN7uTWc1D0AFNtmL54ESBsCaJcLkDajxj5ZXRiCIGA0waDwgjy8sk5+HY+X9ppUbJSCp6TnFCMXwny1WAFQ8rUAc2wUrRL6mXTAefWnFfnz3FpbagQKLAqAzoZjAKkkpXkNO5GCEvOMLFXOnnC4xIKOjnQGNdWSM+GqHQGd7JSsxUf+JzQLwhTdV4je1nQvr1MkPGtlf9yP2Dy+gAqZ6rQytfvdHSDxgLwBF8AmAYjHWluEDiKGMiqOVvtejXTBOuRSYJwDJAARgZAGWL9Nk+IM3SzgTydE4eec1nZHbtDaNAf1Dpd/SMx2END6kD0oXtFhBXmcY+OY6AFChnKnzl7NfdMR3qCAae2B+VVMYXASvDs3/X/zHJZcB84vuiqABEo0QPnhnwqQLyRURmZBPytnwHde0M1vN2lR6picoKULaxHDIEdHkW2iWg4/7b5zb7DSQAVd0/griV2JYojfpwRGEYsGBrOBmx/OgP5sAKANkcbFzNWTRnX/GSGImMYH/LYlk+gGvdT+bW+SWH+Ig1GqL5QeTtR2EYj5LVHfjw/ZDwL8yJ6TB7UU3VVoTjTYxYDK+Ivv7dzNAZIxpZSiU8jjKgIWTcykZkBawDBBnQdMr5QeTKI5iWCB09AmEb7+ucnOQ/aTPWn6wuzyS4u+R0Ob6CUGqJpIDA97AdqINbgRgBJ69CG4Jp6q/ckjXqB/RKla4WpkO2ODgHoynigA0JiLwaNiEt95YQKJ4FRC+7brKzRH9jZbN6iJYuSHm9I5iOAOhHNJfZkh+gxsBKPbLu3+JgaWDdojhMO5kkDWSlNTg4B6MpyIAjf3IggJgMD4MCARjFMU9QCgAykhSKnUCYHB9JB0wy5aTRUxmup4h+Q1uAmDs+hpXgFLnB6ULONOn5xACNJqxghsc3IPxVBGAiQG9aLeilWUJW1FvVXEN0TKp1C6At19TMSCBpz1dHtT/JH7N9yaxp6QkF73KBxYIr10nAMproB44qQGTj6sjUrtOFPtLeFQHLES9AdDFrq1E6M13MaxVCTNAXNFThIylLcor40zxtgDAPKuVwDMrOKw+SBTbtR2MND7sZwC7Qvm4wqHa4T/uIrhb+7n0EgbQdTijoyg+agWXT8llDsAFWr/B8qP1K7bT0pvtVwHhW6+t2C/m8svvZlawi2CKe37nhFtapkDnILRqBQA+v04AjMyn79EIkXO/DnzyCBwVweX4wxs9B4rRZgyPVFqykgDd+5JSpBU5r0vHyHz+jsc3ub0KABsZMCyQgeExKyFPVIz3lmcM6OfPAGCADYPE67Jfs6h7G0o+xvi7oyK4cLZfOgpsXwC2Lq9MwuuVERonKn4nSJrcXnQKcM7dwMMXgYcsVxkSebJgzOWPqdB1ad2f3gpsnwK2LXWeR9m3danUIV1lBSCPArBwtp+7DThuBti6UDWDmWA/DvXk8LRptfPtNUlihYZTOPCi04GH3wFsnwGOW6iAs5n3GeJJ+KLoE+9VDClQ8R6vOQHYegDYwuY3S6H/iJ8jb11ck0q9Qhoc9QMWgPBZJwFbpoFN88DGRWBiqQIgWyJY3lPozaGJ1KTEPh36zpTkJrcXPRE44S7g+Cng2DlgyyKwaclfFoIwvCwx9Zn3Q1DmIPx/2/sSaMuusszvjfXq1ZRUElJkKsBEGQyYhJCBSkUqAW1tsBdpuxEVaBzowXZqe1g90G2LotjQdmMjKqtBxQERdAWUAkUlZNBGkQRNyIAEMAkxpFKpqjfUG3t9//m/c/+737njPq9uVeqcte66b7jnnn32/s6///3v//++Tz0dmD0KzC4DM6vAFpd/0L3Gh6yTDgnvLwKzAWDGiH/ThcC2OWDrErB1pRgQisIQhAa+AED+HEEY6uNLyrRnZLSl6tSbrgLOeBQ44yiw8ziwfaV4UGbdegmA5QMTLFlqsfn7XecDW+eAmePAltXiXnkuZSBkRcm4UGXtU2uo3xsAZgz6y54JzMwDWzkgBOAqMMVBCSAUObh8QuN/CiTgcWAuyWhL1amvvBbY+VgxbW477paa7gIBqCnUrbUBiQuhAKDUot13IbBlDtiyBEyvtO5VDxvvVfxW/JkWNFrCeK8NAGsY7BsvKQC4hQCkJNaKy2LRIsg6SJ3IQSe1onKKC2CsOYMeN+0Dtj0ObDsGbFsEZmWp5S74g2Ir2uA22BScAJGA+dJFwPQ8ML0ETAUAkgDTPq9zdK/+sMWpPF19NxYwA4g3PtsHxAE4SQC6FdSgmGWRRIJLZJll8EGKjHiX1jwaN10HzD4BbD0GzC4WrsKMW2pNobZoCu6CLCDfCTqzgg6sr+wFphaAKQfgZHKvpRSYg7HN5XCL2AbAZwPrZGaj6ippXhgn0kqmU1woxnHedg5AATuWHig2FE1uVRwoxoX+Wcbg89S3AqCKPONcCi8oPtVP+9++G3j+oSK2xRBFDElUxbTS+3nvc4FpDsjxllXQoJg8FgdCQoGJJTTicLcQ6vPL6wbg9cDM4cJv27oAzFA5ky9/UOSvmg8oP86n0dICBn25JwjARWDSAUgBHN6vfdbv10AbARh8X91vDM2ss+NvAECKPVLCsHoyUgRqrlbnRwB933OBc+4DXrIC0IEmiLnE75di8HsyAcjzWUVGUi6uICMpVwwJVMXdeOk3XAxc+Hng+vV2esAYw+sWoP31r3eLcLwQBeQUrEHh4Jo2h4vDmJPuAyMLGAeEn7uqbgB+I7DlSWBGCwe31Gb9aL20kGDb/EGRxY6WTz8f2wtM8l4pgL1SgM8esHCvsuylME4nn9cfQLtldg6TZ0kUKorAfij23vAPCmqp3fcCl60XFINid1PlZrf41/dnApB6wSQjutUfIDJR8CGIQOwWEH7DywpKrWc8CFzqRLHkVYrB2jS2FQH5vkuBycXCAlIUUAAkCM2iRBA6+ARCe7DjYmQduLYTleiQ/XTTS4DpI+6nLhZW2nzVCEBaMLd+soIGqjD1ampdugiYWCpeBKA9bBJC9ActAk8LES26SqsftInLZ44dQif4Igdhym5WLrPDyuYH/7HTCNwDnPko8LXrBccjQaioe6BiKad3+QY/MGTH6rS3OBvCnQDuAIyqhiDkQ9RX+29yE3on8IwjxQPI8zkTiApGU3oVkD/4fGDieAuAdMw5MFQjEgg1DYsUku+a3uI0TGBfV7PotwHwaOEmbHEATvuDIutni6UAQoFRIFRYhfe/dhEw7tbe9Of0Si1g8HkrwRcevDajz07gIJ7n05rYyWIpb4ya/7vv8PRdFpj/LXDmkQLAnA4jCCOlTBRN/rFMAJKgkkVHpGUjySSBSFeg7/azqk8EgbSEq8UDRACLKDXSyaQ7Br//DcA4LSCtwnKhTEkQcmAIQhtM+Uaajl0uS9NatITXWzpzfcdNB4DpY+6nBgDaCtanYLN6fCj4u1ay0QIqtML/EYC61wSA9tAJeP6eWsAoDysFpg1eB0HIQRCIIkVeCqQf/05P3WCB+UPA+CPAzvmCaFWDKEuYcl1yMN+Y2dckqGTeHPEvvWDSNhOAfbefX0A6rS8CUw8X9066bFIfdqMHJID++DJgLACQumyc3gyAEYRRKFCLD1eu5ODLF6QvXedx0w3A1BwwxdAJLTXjd8seQnGrZ9bPFxLyA7WIKON63tYtCQBN/sv9QPm6BkLp0vl9t/m6ietR6fbyBA4gnXtORwRRpNnTtPpW6gWLH83lKqcOFTEnDiKtoHwy8RNFhrefyeztbnrBfbWfgttsP+kIyO32ELD1cHHvInrlvWs6TsnB7qAUlg/suFtAWkE55zYQ0QpqcALoNCXTEt7A3KoaDwGQfqoAOEUBa7fUbKctltwCajVbxvSiyvoasM0BaBKwwdKb9fN7NfcqBWGiSWykWXER0umeacUEonQgCKRfIgDFjya5yq8Wfsfs8dYgiuMxgpAg/vnMzu6mF0z6Zj5APdvPQec0TEosnvQosGOhaLuIYvnwEYSithE52F1XFAA0p5yigD4otCqygFKnpHUpLYP0OcKURYv6Mj4MNR433QhM0gL6QongawOg+6rl9CswKoSkEIxPyTsuAPigCYBmAXVfYcVf+n0SRYw6dP1YwNgHsgSajiJP429RrpWOM6cxDiJB6NINM4w7LbUGMQUwB/M9mZ3dSy+YVG0EoBiDBST5ddZ+PkCsAiIlQZDa3LVatJ0WXG2PbL98AB+4omB3oP/HgTUhmGgBfRqWf2TTrUSjExDSP/qWzQDgfAFAWyzR8rkFtDAKX75jo6nUguZxZ8NByHbvvqBQ36T1swcsBaBAGGRg40Ir+rt9WUDhQ5ZAU7Es2e9LLzglqHRxNkbeuW+oQRRls5jaMjnK0a9ecNf2R4LAwO829kQB3LTtEYQPUwzQAWgW0AGo8AQH0ljp/V17pm0KRcEifGuNOnocO1rACQbKPXhs8TtNwVr5uh+n6Zf3wDgu29g2FdMtOc8B6PdpFj08ZFrplw+ZA5FTvAQQ0/BT36FPDkRqBT9Jag7xYlQItY0f88j78sZzCcKPZlrAQfSCK9uvB4h577SCotUiEJ8opq8IQFl/PUBPEoBLxbRE62LSqG4dFB8r5bHcOtiOQSqT5T7RKzYDgJx+BUCCTxZQCwhaQc9oKcEnEBKknj5FsJ1LAPo9xoWWPWDy+6IIoqbeaO0VA+zHB0zxIQDKkn1GgtXiRxMIAx0Vn0Db+lkuFjLRCt5WEwD71Qvu2H5OfekD5FaciQay/GIbFgBXriwAyGmJADR1ck3DwTE3TQ4B0LetzBJErTYAr2BBSI3HTS8tLKBZPo/fWQDZp197Z3scjGb5BDp/L3+njMweB6B83Gj9wj3atOsPWin9WgXCFlVO/3ctf4iD8XkBkH5USlAZlNPZAQqARr5vxu1yjmH0givbX0UQKI63o0Wun/xHuR8E4VnPK5JQLd4VNttTBvK2uoiKOUf/f+GjwMNBh0NMV6J0c0NpcRv7mrYv3kh8/uHxYp+bVpwLp3R7sts2YzouSq3KGa+q7+x7Co4nazAerRKsVlV1QitF59dyyFZaYY0HMu9mWL3gtvZXMbymBIFMZ1ov2h0B+LTLisxgW+Eq5uU92iZ72ud9vvR+4JFp4NjkRh2ONi0OB1/UBCkvEYRhfuNs4OmhhiPKnFQlx6aAjMnSXJUAACAASURBVPjmz1w41nnwO4cCIBvBwZgTAOUHRq3gyDExD4zRGVYEnpm5LqmQc0M5esFt7acFl0SlHiBxuTkYxxdaihUC4QVXFu5FCUD5QtJl85sjGA0ziQxqeu/fem+hw0F2fLLQGxFlYMRvo7v1WmIVtpt1DFkXvOR7LwJ2HSkyoZmEypoVVe8p7b6qEMnidGG/Vl/L2aPOIwuA1pAIQE3DAmFa4j9f7CPaFpCHKujr5xzZesGdHqAqKz5X+FLRAl58le+jui+kTBALMcgZ73CDBkpN2/7+bfcWOhwUyCEAjQTcAVhKdjkPc2RajewKyu/n1//qJcA2uhBMRGXQOcn9U6JIOjXHQqSYOsVoQp1HNgAvz8yny80H5PVz9H6RqVd849WtXQ/zA0Ow2ayGLJ474L0G79vvbulwkJi8BGCg4S01SKqofoNvSIC+5zkhFUupV8rUTpJN06KpaBkFQm5M1HlkA3AyM5/u9Zl38zrk6f0iU6/4hmscgK5ISUtCTowyDqb7UxwsqFJW3fo/vbuIBJEZ1YRgyHwQKNi0KEl1OKTCZJdxtPDn//v8ooaDaVgqFyiTD2IKfcjZS4Fo+7g+HXOPv84jG4DIzKfLzQf8KVfI/FNKrQ6h94tfz+vOA9cGAAbrpylY2SDlVTTt+uCnV3/V3a7DQQAysJAwobZJgUXi78Qayhd812WeiOAZzEyUiAkHMeu5BF5FwZQAWLPwknkLQy9CrPMy8+lIHZFzvN3T+YbV+8X7c64OHHix74V6zIxB+RJ0wQ+UU992tYoFy3fcXcTDxQkoPsCUhFIczKVCegSg5B8A/PILN9ZwxBSxtiKiUAOi7JW0dLTustF8AGbm0/1o3vjjnSGdj+lYlGwdRO8XN+c1wABIoHk6k61yuSCJITq3jDY9Vx0BqK++uwAfX6JkI/hME0SC1EGguiQ+isqcQRLrF6/0jO2w+6FMnZhyZYsQ1W50qOHgPX1NXndtODsfgMwHzMin+0+ZN0S9YOllMzWfLwKQSS396P3iY3kNOLDPM1y065H4gOW3p4uTDkB8zWdb7FgbdDhEgJkCUDRvogTmd/vPv3BVAUBuvylNzAAYi4hisVQnEHoIqWblrxqm4Mx8ujfljT+YjsWBYgIOc0oJPsq1slCpH71fKybJOEoAuuVTRSCnYlmU6P/Z4iSJEcbLv+Yu9/1EAh7JKEXDKxq4ChUiKymRbwjgHdcUWTARgLYXHSr2LOU+BV7MVwzxwOfkOWybYAGZD5iRT0edjpxD6VhcOQ6j94tP51wdOHBdMeXa9OqWRcmWXA1XLUIUH6zyCwlAs3z+YBkfs1u+VIejJEF3ckrjI9T0y/aMA2+/tgAg08VURKT8vbKMUgAMIGzzAcOi5HknHQAz8+l+MW/829KxhtH7tTz+jIMAJPCYMULAWd6fvi+EY9ouoZBM/Kx/4LUBgFLgNC5o16FrE8JJVJgkiFhaQQBv3+dVbMrWVsC8UxFRkjjaVsW2DtRdOJ/vAyohVYK7A+bTvTdj8HlqTMcaRu/XxHkzjgNkIOWuDr8jnYYDKDutgpUhra0uAlAyCCUAK8BXcjBXgLCk/h0D/hcByDxFAdAzoFUqUBYRJTUcMWdPP7ONL6i5bLQeALJRQ+bT/W7G4AuAOXq/lsGdcRgAY+glLkYclJVTsa6ptCX3uQjAKINQstFrAZKIwWxQIhIJuovB/Nx+r2LzFCwlj8Y0evl/MYk0kieVtcvrwGUnHQCVjjVkPl3mItQsIPuElx9G79dOzDgMgGkAWlNyBJn8xKprBRC+zgEo4LWRgcdVcOCjjlNvmx84DrzNAahaFZWLygKWxUNibIhTcPD9BMLLa65bzreAMSGVoXvJ/Cgh1WUfO+XTZS5CDYDs9GH1fnOrIDcAkABTTDCCLYK0Cwi/586WcKJUiEpC8CCBYDsiiSplqUIUmOjf+o2tIiKVUJbgU5uSWl4DWwX4+PcXnrQATBNS+8yny1yEopdcay+930y5YhgAg+9n2OoUeI5TdQer+32fdhmGoOBZanBo+g1yEKU4dYgFSvqB//vZBIBt9RshkTbW8ZZZ2hUgvDL3iU3uux4LSBM0ZD7dPRnTH08VAIfV+2XAOucQAMuVcKfFSD/+IAABsEoGwYAoHZIKEEYxRIHwLS8pUuhjFVs6/ZZhIVWyxVKBBIRXnbQATBNS+8ynI4tBzkEACv+chlUVIKE/5cRGsWmlKfIzudc3APLQSlg3E2OCyVRc1kpU3DgBmKoQsWtlBcswjPu+nfTYtBL+GQdgOf16GCZW6pXlBCqWSgqJypoOAFfXXDifbwFJLvi5HAjlnUsiIe6AjOp4iQNQHRlT2PlgJCUbbc2s+v/hFwFb/q7gm6HlYpBbmTV2sscQyy/qFBj2v0/cAdz/HGD7NDA1AUyOOU+1CwWOewNjKj6/O03F1/WuugW4/XJgfBoYmwDGdH7IxB5kLPIB+I8AfNwZgga5ck2fJbEm8V9zNWPfrasbgMuPAcuseJ8Exsb9FdBhA+7gaQNKB6TfcgCYug+YJT+g89aoBDMmIMScP12uTKj13uDv8zsKig/uJ1uQOsnojm3qB5P5ACRBH3OhPuzzRN9DV88HqQLEWPJnvTy5nm/t/1s4BcuSpRZtGAu4fi+wtBVYEyccrYwn6hF8/FkJp9bKxAKVFsn/d8urgbHPA9NPOEOWl4+2cfoFHhfVrJTZPKHSj5daOtup6JyCpPx8rHWRVQ7WOlrYCMx8AHIzlxkALPD9c0VB+x/A3E/+E2fUYHXdF7KTGwdvTd0AHP9r4PgWYG0KWBdfsBdsMPfPrKKsoL9XAVLAvO2fFylCE4cKliyrDVZNcGS1CqEYhWFiAZV+XntaURdTLmpCEbpchTYLqi6NrkMCzLzt5Xc4HwyJmmkJ+Z73jQOh4NWeDUZiK1K08f0EXt7CMHVawIk7gaVpYJUA9LI1Ao8bzKX1cytoFtFfpdCIWz7rgzHgth8u0oPGDwETc8CEMySUzFaikgtlpW1Ta8JqNba7lVljSRgW+Q6ZP/57WQvj6fydBjXfAjKbgEvMLwWCvhNoipgNpnQshlS4IGFWzIk6ylWwAz93ETLxGWB5ClidLABoIOS7pmGfG+33YAG5mND0G8F4678vkiPJczNOAC4UyQm2N8w94kirFlfIAl7i402d6dbPWWAtrsjOFiuCvAJZOQE0pHTFsckHYDeCvhNgipQNxoAz8/8IPr5nbvH2jd+6AThJAE4AqwTdZKEBLDoDgU4+YVkPHIBoPwareOt/BkDexsMFAFnbzNJYm0IDnVwbt4uyur1kwL7Tp+iZM/08WT9Rc7DHUmuYTr/x+6o4ovvu9fjBbgR9JyA+omwwxvZI5ULg6ZW7y9FPf9QNwKm/CgCcKABovh8ByVy/UCtJq2f+X1yYJPGU27lIZLbuEWDsWBHesZeDz4iURLUWa1TE47LqK12fZmd3OXidFctqm92KatVs1jAEsNv6sdymaa2g8+xUL4I+Pn2beCgbLGWHI/h8G3oTr45iK86POlbBU9yKI/AcfLR+ouQwH9BfmmbLlTHboOnZ/T9+5vaf8FUaAThXsFOQ45mUcgZCWTAxe0UQ+urYMO1/37GtxQmoLCBtRSp30LrDp2SFdzYMgk/R+VNwvwR9mwQDsaspGSfJgYDYNTbp8psCQFJxEIBkQjDrxt8dXCUIY+COH5MVFPi8SOn2n/QYLZ9Gp0cxANIP5IvAkzVzxivRydnKNzBa8fddM84b6AFyAriMF2pajk9kYIeoClXmA3AQgr5NQEHMBqMVFMNaIOayNRL/vhlH3RZwmhbQQUcAasrVVGz4EtjCu/3dfb/ID3PbT7uKAZ/MhcIC0vqRTo4W0IBIEAmEtFwCYqjW03bcmdwBYeoWgetUbrR8snrloiR2drpACf+rD4D9EvTVjIJu7HBV+781X752Czj9lwUZkTEgcPoNPp5Nv4oBRhCG6dd+1DkMz1JIhR1BAHJ7zwqO3fIRRM5tmDK5CoQKsSgOeBYBKFZULTqcB9r6Ni5KYmd3WKDUA0BlhNLM8EbT1QBXBU72aI5ZjUcVOxz7WLkQ8d37vsart/uA6RcPsxNSAtAXHDYNC1AEpf9s01kKwuBwGU7HgVt/1jtD1e60fgQigSe/j5bQp+KYpGB+H62jT7P8/ZypBIC8Dhcx8eY9wF015abhmnoAyJ5WSrKeNgKO9SHxnT/LSasJBim5lRjWBEIVeROInKL1qunybRawLgASdEy74qjaNNzJCgqEEYzBGvK0297mAFSHEIB6ebKDgc8J1ksmV8t29f1en6L5v6cxIK5iK6Xne/5jCTiFcTqVn/r/tWDPWwXnEPTVgIKUHU7ljASawKefIwDpMdRxRB+wFgD+RREDJABpwSzz2c0LfxczVjkVKwaYgtBBezu3SvX08d39P5uO3QKahXMQciourZRAGKZWar/YZ1xXRPe8wQr2AUK7TvbOVTZBXx4MBECRnConUBSFEXT6mf/TK+/qmzAF/0UBOPqBZYF52HrTFCw2LH5G8UCzJEko5nZqmRnPh/uCXmpnVpDTsIPPwKApOaSA2QLDLSHf97iPx0tpISLfz7bl4iFfsUsnj+HZWEeOYDCDnDmCvZkEgedcCjxGseIhBYt3vx049HwMLRh8gA9gh2MoH9ABqKJzxf0McO7XlSAU4HzhYYFq+5D7hwBu/98OQLlIBCKnW39SlXNY+nqeiq2dkQg+gnGPb9/ZpT0lq6MV5D96gLCwgDmCwbdnCvZmCgY/dxy47xxg5SWuUjigYPHFbwA+fyGwfr2rXrMvPB+vp3L3GHCgi9JOHQCkRVPppeUBigXLFymyejYTB4YsgfA20ofRAlYB0FfAlvQqP0/TsX5PLOB5DNu471cmIwiBaRww/F01J+mz2pqChxUMZvpJlmBv3iTocsW4dzewfhkGFix+2febXDAeJO/YEILBB7pU1g8LQFo98QASVGYNQ6DZfEG3fnEqrgLhbf/HV15anbkFNCvohWSl9XPQ2XTM/2s3I4DwPIZwBEDfgitH0Ek6N6x+u/iD7T4g/YdBBYPpWHEaHlqwNw+AQa4Yj54JrJO+aQDB4pt+oCAyYvOPEIQDCgYfeF/9U3AbAMX7ItAlVtAspKZdz5SOlvA2pstxjES3wJ+92NgAGK2gwi78QoVfEhBeQACqNNP1RdoA18kKdgDhxkUI/zKIYDCnqyzB3jwAJnLFOEIW7QEEi1/1Y21ywVglCAcQDD5/Efj7M4CVrZ5AKlkhxeQUaxBI4nvFzxf8IfCVC4HV7cC6ZEX5nen3VX1vAGLZq8ysrvHY+QBwbGfI2E6JpLvdX+ksthpUvQrmX/sVDGZVUJZgb17vJHLFeGQcmCdVb5+Cxd/5xjZ6QzzMLOQBBIOfTV2Ps4HFHQ7CLQUQmUrV0rgKJMsCjsxGAqTn/hzw0EXA4tnAyg5gbTYBorKkUyLnkB9YVhTxu+kT13iccwtwdBewPAus+b2ar9xJAafqfgMQO4dh+J9+BHe5gqZZZzYok1JJUcpaR6bp93P+W/N6p0KuGIemgEWKgPQhWPxdP7NBLhiHKYHUp2DwpZ8rLOD8tmJQVplOLxAqmbRKC6EDYC7/CeCRPcCx3cDSrsISrs04CPm9ArZk55UvKAspYLqPaPdR4/H0g8DRHcDyVr/X6VabLHk2PhjpPVZY7d5xwF6CwS9y/4LbbVyQsEKIufGiKe0p2JvXOx3kinF0GjhOQY+oNRtljji9TQPf/fOV9IZY4Gq4D8Hgy/4W+Oo2YG5bUUy04vUcLCqSJVRWszJbNgxSmMau+q/Ao2cBR88EjtOqbgNWWaTkIFz3YiWrF4nAjtN0nBZrJnU+/8PA3CxwfMYB6LUra3oglL0tps6wlVha5rLiqd9AdDfB4Je6U0s/0BXTDYh80Sr2FOzNA2AXuWIszABL1JaKWq1R+nwGeM17OsoFY5XTVw/B4Cv+Djg0C8xvLYqJCECzgsxmZlq9T8e0XGUyaUizavPtxoFr/zvw2BnA0Z3A8e2FVV3x6c4sqwObckeyhiXAowUSADhD1XhceDMwx37lvU4XxVN2n3rJIocygkr/Vbs7fe+EdBLcfaXXQ3IPWIrpBB6XlnwpR76jYG9e7/SQKzarxM7qJFj8mg8UarMV9IZ4gvNDD8HgKx8HDs8A8zMFAFnPYQPDl0Co2g4fpDZLqKCxT0/7fhJ4fCdwbFvhRiwRgJruCOwUgCpeCvUjZmEFxhfk9W969kW/B8xvKQqnVgg+B6CB0MsI7P70AHgmd2n1NQ0rv7FvALIlVYK73MnQCDLThSGZoDpuP7uCeuX5n8zroB5yxThGnQ0CgyBMxY63Aq/5aBHG6EBviDlOLV0Eg1+0AByZLgbl+HRxnZXJoqqttA4ODovlJZVuSjTQFtq+NwNPbHMAzramdVpVs6wEoPtdNg37wJfvsYiJP9NFqvHY+7vAwjSwxAeNxVO8T6aNVRRRlT6hHrJ0Ovaw0WDJCKng7g86APvNB9wg2JvXO33IFWOBgn8EIf2nRLD4tbe1+AU7yAWbZeskGHwVdd2mgAUCcNKnJgLQrZ/V9/Jnn5JUYmnAE3hCmv3+t8AWQfSzyPK/POOgJgDdsgqA5nfJAvLdLV+bz0kK4RqPZ3wQWJxyAPqDVhZQyQr7gyaXI9axWCFVAGLvRUhV46PgLnUWBs0HbBPszeudPuWKsTRZAJDTo8l8ui/42juL5veQC7ZpsEow+OrZQlqVVuH4FLA8WVyDAOTAmHUQCAWQkOlsQAwDt/9/AE8SgPQpNa07+AhAA6HLXbb5Xr4IaAMfv/eGvP5NzyYA7UGjBWTWjh40v9fSyscHLtaxhJWxFVsNNAXH1khw983+DYPmA5aCvXkdNIBccemfceooAfhAAcA+6A2xLuAGucxrzgKOMexDfV9OwbS2BB/BEoqLSrBoYGgJ3E8qLcIEsP/ngCPuUy7S13L3wb6PU56/m/Xj4Ps0TKCXQA6AXuNeZY3HMz5QANAeND1kwcKXlj6wOZQ+b7R+Pi0PD0DeFAfk590CKg8qncfoFzIRVWVqfFfBhgn25vXOAHLFWCDbvPstBsJZ4LUPt+jdesgFg+qVptWq11bg2gtgfuLiRAAgQeg+oEmsOujsXb5SsAoCIN/3vx04OlNM6Yv0tdx1MKvK7/TFjVmeCD4HQQQhf159eV7/pmc/kwCcKABoeYvR0oept7SEoZQ0Tr1lPuPQFlAtO0nyAcWhpzw/FSjFzGjLx+RGvxzoSeC1hwsA9klvaFN5FAy+9mJgnhaQ0qqagglADo4c9AhCDpJPl5ZommQ8738HcGw6AJBW1VecZv0cePwOY0/wl1lAD/WUCx0mMlDLr8bjmb+Dwp3x4nkDYbD0thIO5aNtfmDi/xGEeRawxhs7Vb/q2huABQJwAlhyy2cC0xoggjAAUCWWAkksOiIY978TmOOqeqqwqAx3WGhHK06n7TDwOcAV/iipPAKjwgrZm2o8nkUA0gKmAHTrp+o9MTrEYvq44o9pZIOtgmu8mafCV72YAKT/RwAy5OPOuVlAAk9Oule6xQRTWUKlWtkU/IvAHAHti5oIwDK841ZPFtCmdr0U8PaC9hVultd4CIC8P2Ztt/m5/qC11TJXlJDGGpfGAmYODgFoCxACkLpuWh3KCgqE8gNVZK4KtxgjJAB/2X1Krao1rfN7CWZf3LSBT4uAEIyWBVpipL7GgwA0AW25GbGENBTRx3rm1M2w39mmrFVwjTd1Kn+VAZALEE5LtIDyMWUBvbLNLGHgd5H/V07BDp7r3uU+Jadgn3ptxekA5MBri0/Wp4wzBjDbCnkMWMqVpE8GJwLQqvfc0pqbkVj5aNk7gbCxgJno30cAjntowtXNaZ1suvSKNhsYTcVKmw9F5xGE+94dfEoP+JYhD/8OC8eIPUsUHokVVKB78XszbzAF4Pvd//PCKVGIpOAr78mn4DZOm8YC1jco+w6EFTDDPJqeCEBZBa5GffVbhmQ8DtZW5TYOvPhXip0GTuu22lTMLSw+aAVl9QhEWjurI/aQiLJkTMLsX9R3r/ymZ73fp1+37OU9hunXSkdl7T3QrhKCtlCM59k2i5CMMSIAGdqxEIwrmptzTsCEut5yilKoJLAcxCq3fe8tLCDBFwO+tKjyuxSCMdYEXoeDrHcHvu0tTwLzmwHA4N/Gh6zNCqqeOSxC2lb8tQSiMwbuqXIqAcjFh2JjBKGJyShQG6ygVbfJegULWBYcMR3rvb6oCRaQwFPgl1M5rR7/JtBZOIZWx/0+s4QeY5z/1/X2tFnAxPpFELaVkdLN8MWGVr4pCBsfMHN8bmTKfCjZ0Ncp456/x58zLzfw6Qf3ABd8pUgEYmqk5bGyek06IQl1bkXScnlN/u8L24Gdx1qVq91KQvrpgwaAAw9p+wnXPw1YjyWMGtDo2ASOFGMU7SIEUzdYD34vMPmXwLbHgdkFYAtlGiim6DpxJtvq9LtlVr/aWKEB8pUXAOOPAFPzwBTZ9r04vdQ9Ts4pAZ3cd+yHxgfMAOH+vcA69/9Uxijmz/AerYpdar1lNSMYzV+vWY/34I8DY58Gph8Bpo8A04vAFEFIknIHohGVR62QhFRSYjQE6qFri2z3iaPAhHNNlxKwArI0Q1IAxwfReacbC5gBPp66/5ICgLKCtqnsrKKlrFZUFPKOr7osMTtdsxzqQRZ93Q1MPARMPllohUxRqkEK6gShOP0S+dY2hlRv99y+ovRi7IiTnTvLqmg6xDPYpqAUgRgsoR7MxgJmgHD/c4E1FXu7FRRbvEgd7evXWlbPpp9EgUjiJpwe6zwOMlvpAWCMVusJYPIYMOlSDZRpoGiNxKzbdIQlXONMWJbGtw4svdgz3El47nzTRvPrrKptAJT6ZrzfintvAJgx4vsvdQvIXK5VYF3sUZxmJUvgA1FOvwF8spKyBtM1y6EepI4LqVMedbEaTp0EIKdPKh5FqYYqSxgo2jgFr13j6XXHnOiSZOeBVSvyC8qC2r05FVvVw9cAMAOA178AWPMp2LJaaekiCPXExwHw660n1oB/niGQazwOkkSepbJ/72I1x4CJ+cJ6lYI1riccrVicUuVSmIW82pkwnHHVOKbFsOozQGkFkwewnBES37ABYMaAX39ZAUCCb82nIlo+40p2gNnvsoKunxH1xGwA/LOzdQOQJPIuHzV2GBg7Cow7AI0l33XfjOsv6oVodes6ISbBsAZMX+kJxU56KY7pkmFVhOciuvTzSt05v0+ryuT/9gDrZNe4wPMsI7VJP3GcP7gUOOdvgL1rRYJ0ZI5IV3hV4/wrGYPPU3/AiRhYusy2K7mU999P+z90ObD7LuBZK0Xdkeq9NSX2+o4HLwfWlopFCC0fgciBMtAFC8CGrYXVoVjnU2G7rTXrzh4kfRzLY1kyGwBoeiGcPiXb5eAzdXWnazPCSScb4j3xfmav8Cx2p50lAMW0VXINitCogl2r9H2dcctWwQxQsn6ZTBbMNtcgdKIbiZj51VcBk38CXPxoQcfCUg8pjcYgZScw/momACnXyr4leBhs5QaBTHpf7X8dMPYJYO8XgAv9e8QJlAZZq8D4xSuANYKPJQn0AR2AHKy1MACKe9nfFI6IEqduEWoHIJ9wlsVKLekoMCa9EAegSTYQeM4TXco2SEMkAHEbBZoj4bbYtdyCVrFqGXgTSxgXYTZeHLi9AMjEQRCVUXP/n4KUaaT8vVTi+Rtg7GPAuYcAWlMCgUVkQfJ2Q12yBvPXMwHImhDWwf81imsTiLSEvHZkr+jY/p9CQRD4p8DOBwteItai05qn31FFdfLlFxYWgCDUIkRkj/TxbCEi/89jfPZ3X2VqYSJQbmUNQY3HQT7hbv2sLoerVwKQHNEEoCsm8R4MhPRjXUGzVEIKIoY7yaEYuY4dgGb5RXruoSgtSCLLarkICQ9f6QNykGjFdjsIBaI4kGlt8W+Rg5g0HJ8qAp47nihAzFpuWtPIMBZJlASILvR6fQ0DCVbJCkJOJCqnk4pGpb99tZ8MopyiKDX7WWDiwYKXiEQOehCrgKh+eJQ+EQHo1Lby/zRlyf8TIbf9XS5ftIb8I92YugH4ay2pLusorl7dAoonWtMwQSTdOFuQSLTGHyIC8kxSIQuA4hwU2WUAoO4/grBcDbsfWElSzg+JCoYDoEGM1ixSkHzgF/wG7y8sIa3J7JPAGWuFJSQIaU01iJHUiYP4e33BrPOHmG/JMaOfTZVYRhwGav87vWKPJ9/rSH4IOGO5sITqg/ggxXs4TOaBAECbeoOsgfl+DrQShFqcEIhyyt0MbMusEkx76iAZXKM8BvXiZAGlF+KaIbaadYpem4aDgpJZQz6YJABV5VcHAJZ0v4FxX6KG5UpYs0KnqjhRuagEVgPglYAl9ciHf8mdUrJh0Qx9vkDBzBywfbkYQIGwahA/kglATsHsDzKA0BATiPyZ4NEDwIeoa/uFYKKXL2f24nQoIgd9R3yQCMTFqwIAfdBWI7+yB5ZLECYLETd85YJl+2YAUNosLIel/xYlu4Jsl6bhNhD6it4WJCvA2Zc4Gxo73RcgJeOqFmGR6rcChLYACyGojmEYdj59KnZ+tIQRhH9IvWA2hiREjDeRI9Cly7fMF3EtWRFawhQIf5IJwE56wdTIYdt7tp9ys1K8JnoJvod9Wn682PNkP4hUy1ndWgstAtBDMLYN5/6PAc5DGNoF4SrZfN+4+IhT8jqwg2Cp8ThIJ5vfSWBXAVCrWN9SMxDK+skaOvhoAc8me654pmUB3f0wyt+E8FyRAGmPlOEoiSD2qgvmAKoOm52fAuiTDHSyIRxx+lI0QxxADubfF5vffMmSajrWlP7nmZ3dSy+4r/ZzAUEHnQ8R70HsXlK+PgJsW68G4XYGZj0EY2EYATCAT6tAhmE0DXcC4faapcwMgAIfLb0kuzT9Qmw5uwAAIABJREFUSi+EfeALkSrpBovbrQDnkm8wAo8/E3i+CCsZ98NCpAp8cUekZyBavI4ET/TnaAk/RQCyAXy6uNSPA0i+wMeB6ePA5HFgZq2wpNGK3FUDAHmv3fSCe7afX8CB4UNEEOolVi/3obastNwJ9cO5BOBKEQMsAcifHWzRAigWWAlCn5K2bQYAOe1KMjTIR2kRUhKVS7IrLia0v+3xwHMZMCbYNP0KfG79zAqK5DxOvyEuWu6VD5KSHy2YAEQAfpaRdl5UkuUctIpBnCIIl4psD03FtIIP1ADAlBuJM47EqqUX3LX9kSBQcuuyftK78xUkHyQ+RLqHZ3Fv1KcgLj5kAQ1s0Qo6IA1nHhNLQzA8ZxvBXuNx8DcS5UYpNnoYxsCnUIqvZo0F3wPTMa7Hv53HOJVbS/l+5bumX7d+5WLE44hxIRJB2NMCqj9ixwuE90svWCaIA6bAp959EKeWChAyA0PTOV2unGMQveCO7bfqHbcS4rJR7Ewqnw5AWhLuImg2uFQAXAVs8RGmntW4+g2hB3P79L/EJ9zGvqrxOPibiVihAOgrWQOf/EBfBcsPNBBqW9Hv6zzGqFzmoXz3B9AePgXiq6bgiv4YOB9QHS8AfpkAFMMjrWAcQA0iO9XJiQyAnos2vV7ESHOOQfWCO7Zf7F40mZFQScRKAYBaSU6vAVcTgN7xXHiUFpDTMK2dFh56912BTiDcvpkATIXzCL4g3WXTZ4jpGfjoF/oihL+fx+0yWUABLwIwtYKKIabgCzHQvi2ggBKn0McEQDaKT5cGkIOo6SuyYzEfjQB0EM5nZgAPoxe8of3sgSqCQM3jkdFLvpRvR13+7UVRuhUFSavNO6otwp88ZZ3+t4M6HLtch6OT9AG/q9cmtf//gV1JDYcnQ2zY6/YakfSrU+Pg1M45NqPt3IEtoM7WFHokyrWKkooglCMWLYjiUXMtK3g8Uzd1WL3gDe3vRRCoUEYCwGtYFxxqgA2E/jI20F5hhmQod98BHNnlxOTig1aGiDanO21yV4DygWuB8YeB6fnC9WEtiKVVKeE0ZGiXWczeJoWMIig5a9V5DA1ANoKDeDylZ9NSXxyAsiKawrQqmCv2HVf5e8aRoxfc1n7xs+khItAUvojvyWryxVcWJZksVSyZoQRA3dcAoHzax4Gj2wtu6FVKM7gMgti02jbV476oUJJs1j/AbA1mQ3Pm8eTRsoZDtR+xZKCiEKmMXTIeXHPGdhYArX8FwG4DGMEnAHIK4yvT58nWC2b73cexaZgWWaEKgU1gjNbPP7PvOYGsUSBkv3hBtmRWNzxjTk9RWktvxp6POj0vARjY9sWkFel8RWxegjIF4RjwAOnZWMPBTGjqvHmszxJOBUD3xyznL2bqROvoP3N3q84jG4C7M/PpcvMBef0cvV9k6hXv+2Yno5QfGArRbaCC0mWv2YtF3ecerNDhkNZIIsXQRv5dlTtGADJSz2gEE1EJQM//026HdIEZLC8B6A0tk0g1Ja8DuzJdphS82QBEZj5dbj7gxZN5er/IZI+67pscgE7QaDOUMyC0Wb8+gXjuR4F5J6YsaXnFhBoAGEVvUhb60jISgCQnoh/OLBgvIrL8v7DdFkEYM5dtNg97tvz5zJqzdfIBmJlPl5sP+DJP5xtW7xffnzeh7H+Z+3+RpkyWT1YxuURJYVtx6T0fCTocouQV85VkHRIGegEuEv/YKpkA/JceVmL8kv6t5/9pu62tfiPWcFQVEa0DZ9WcLJEPwMx8uvfnjT9IgZyj94t/ldeA/S9tMaGa9SNdmsIxbvVscVJ1GScoMt4UPwhAsmMZ0aXzQBsvdGRBjQz0FUpEJRAJQOq4KAnBdz+sfiPJ3bOYn8fsykyVWMfiN3BOzckS+QDMzKe7OW/88aqQzsfE5kH1fvGjeQ0wADodmVGwOeiMsUqHrGOnS4UFy9P/wAEojkEnI+IqOIJQNLgpCXhcmLAtD/D+kgQE235L93tj+YBqgTX9BiCeW/NedT4AmQ+YkU/3sbzxBymQuZhm8g1T+QbV+wWFdjKO/Te2mEFNlCb6gPF708VJ1TXHgKd91GnZpDfi1k/gM2vqU3DUnCuBmNQe3P9vw6pe229KOvB0K1k+ZS+rnrfM2AlA3JMZtah/EZKZT3drxuDz1O/yxAwu9JgJxr3lQfR+8aa8Buy/wdWQZAVl+ZzCrG3q9c/YrkmHy3IRYryAAqAkEBIlopJxNNUbER+fA/H+/+AAdP9PmS9dazicJybm7mlB8nR2dI1HvgVkOlZGPt2nM29GCamcGZjAwlQ+vvrV+8X/zGsAAUiLVPp/wd+zaTMFWw+/kAA0GQQnpCw5mDsAMIrcRB5mC/+MAffTwgfwKY2KfmCZ6ZIkUShrxXxBX4yYaV8Hzmcn13jUA8CMfDqWYeQcSkhVOl8U6uxH7xekrsg49h8oiCENgC5TUG5vKxxT8f2aRtOtcAKQ1s8soPuOVUIwpchNlEEIOyNSIrrvv3hwnckWIZPZsnbcDyzTpvg3lU8mpZQqozyfK74aj3wAKh1LgrsD5tMxiz/nkGD1sHq/YNFOxkEAcuW7oqmXlisuQOT7VV2jwi/kTgj1RkoZhBje8Z83SCAEEJZW0C3gff8tADCt4VASaWIBK0HI9q8BF5yUAMzIp8tNx5Jg9bB6v/jdDPSRns0BWIZeUitIo9IhHmhXTvzCPQddccnZ76U1V/IvC4SBCFyg26DFNg7c++Mhhb6qiCikT7WVUmr6lYn2nRKyrdZ51GMBlZIc07GUBdMjny6XCiUmpA6j94vMZbgBMFo552pu27PXAqXTyAUQcitOQjAm9xX0N9pIwIPmSCmH5QuPqER0L4kDYgp9zOUL6fYxkbZcFceyAreAF3GlV+NRDwAz8uksnT3jiILVSmpWNlhMze+k94vMZfgGAPJeHDjpCrgM01Tdry9OzvmYAzAqLVWIwEShwzbRwwSEn+MqP6bQK5tZlWyhjCCCsC19Xv7gOnBRbgp7cu/5AOyVjqVMmA75dJZ9nHF0yohWNlhMxKnS+0XmMtwAmFq4imnYbrEqNJPc+9kfd62RKh0On8qV9hXZ9askEPgAfI56ziocUgVbzGT28lEtRMoKtg7lBHtznfZNA+CQ+XQWM8k4uglWK/NLYKzS+8U9GReXD0g/Tyvh4Ne17Yb4Zbr6g6y7/aNWcoPpjKRTsJIags5IJwkEAv6en05S6GUBfRWsUExZyVZVQCQwrgN7Wfdd41GPBczIp8ODeXfTSbBa6YYxlY8/p3q/udc3C+jTbtvqt2oadnB2m4oNgMn0W0p+hYWHWbwg9yU/0Kb9EIy+5y2hiCit4UgKyTeAkN8Valk4Le/ldlONRz4AWWBRM6fdIPfHstw/G+SE5rMnVQ/kA5AkLHS0ak7V7reXfhgACaBqDtD3e/nmc5k9kA/A80JReq+U38zGVp3ObJo/BvAOD3dtwiWar9zEHsgHIGlFubqSx7+Jja36anLLcDvvgwA+NDpDfILv+qlzuXwAXuSjrkKemlO2e3U1uWUYnL8dwB/5e2apca9LNv+vsQfyAUheX4VguB+mzIsaG9ntqxhF4Xbe3QD+n7/uHLAW9wQ1tblMRQ/UA0CaHC7plXEh+q4T0OWcfhleYTSHBK0EH/mi+fcRuKQn4I6fWpeoB4AevCz3HOOm9yb3F5mBlZBNclYCj1aRfyfrbgPCTR6AzK+vD4CyglX7jpmN7HY66d1E0ctdIrEEE4wEIMlam+Pk7YF6AMj7EwAVbU82vTerCwhAXopJN9zVI+AYrOeULLZgErY2x8nZA/kAJGWr0naUWdFpy2cT+oCWjpdjLFxE5UzYIBBpEUX5nLnlvAktb76SPVAfAOUHpiAMm96bsVtCAMaKALICMyxDq6cXfycA+b/mOLl6oF4AiqBRIEzBp7/X2Af0+fi1XIioMIlAI+AIPIGPmeROWV3j1Zuvyu2B+gHoFfZiDS2lC0LiY52WUADkQoTTMH1BFSYRdHoRfKSu5v9qrizMHYPT+vx6ARhSuDcAzzmDo5ZGHT1PAKYMwQxME2jiSo/gEwBrrq+u41ZOy++oD4BaCcsXTPiSI3ey8s4KGoG8QwCMFM+0ggQhLR0BF19SXuD/ayakz7uR0/TsMcxg3SjfqWNA0hsrga/ojaq/8WPcC+YIk4Ke4CMSuB2XVht1Oj8zIfXlU8BtU8DhmYRXWdfrdF1fgr3+S8At48CD04DVjXQSDO70PTUnaJ5uOCwsIIFHSSFy1pKPWCDsZxCpw8UVgKSPxLXM937OzxxAljzcPAbcswU4Qh4V3UN8mKoeKm/bu78IfKJQa8VD48CylHQiL3O3/qg5Rf30BKACMtJXjXKQcfBSK8Dfqc3KVCwuN2VFGRnm/yKZtq4Re5ifyQQgM2A+BeB3GHaZBo5MAIue0l7Kt3cC4xhw+5eL7TuCkJk1jBtyerbUfYG5ExjZ/pqrxE5fAOrOq5SmowVIrRp1IyT2R6+fg0bgVYG4CsyZe2UsaiOGKXr4Sfp9k8CxCYAFSKyvXeY1o1BxQux91yMtfsHPutgnnyUuUvhc0ZsgUXib+nVkq6+ZKaABIHsgVZnuwD9sVo66rrR4ImdhLGSQ8zPL/JgBQxeU1ouWkO9PTgDzbgmXxrzMkatl3keivfG5x4r4IRcz5BfkO5vEZ0kgpIfBZ8yKjlL17syy0tMNcOn9dl4Fy6dLFabj1Mpvow9Ify+I4Nlo9Xt+ZqU9VdJpqZh4QDDyxUyYOYJwHDg+DhgI/WUVZl7aSEt93+GO9Ia2iuZKOfA7lhp9JpvAVy61w2mOwO5hmCgMHC1H9O24gu6UD9jP+ZmbtLRaSsei9SL4XDPbAEh/kGQ/pSUcc0lbApFWb67lQUhpVnLBsoKqqZclFMmUtrxPcwxl3X7vOCAtYLSCcugFQmqhdssH7HU+RznjiOlYXA8wqkOfkItTAom+oKygca4ES8jY+N3z7fSG4hfUtp3ihUHruVSsFy1iRvNP+1N7A5BdJACmVpAgZPhGOyCigEjlPLudn7kvFtOxuB4g6OjD8UWLRkCZFRwrLCEXJQQhp2K+37lQeBCRX1A7KPQto1prFEmSYn2mB9EAsO+kYfk8KQhZF8yjVz5gp/MztyOUjiW9bCUhEBhKRCCgSis45uQ/PhX/xfFWMgOnWu2gxB0TF/o0kEZ/kCDM1Ts+3RHYnwVUL6XhDFrAswfIB6w6P1MrTulY0sum1VICglKwCEACqvQFCUK3gHcsFQCM/ILayqP1k9JshVqrncMalOYYvgcGAyCvIwuod8YBJQmZpmGJeyRwkGw4n8jJOJQNw3idLFhMRNB0SgASTJyKoy/4ieXCeFfJBUeV2SoAclFyR0bbm1OHTUiN0/DTAwD7zQeM52dqj8VsGEkVE2jKetG7AEhQ0frJAv6RC0trC1skl+IWlNinGLbSaZg7Mc0xfA8MbgF1LQV1z08A2G8+oM7PVF9Ms2GUE0gQyp+Lwu2yagLgR9ZaYpkSypQ6a6Q2DCqzpkvietXIFdoZfuieGmcOD0DeP0HEbBhNwYPmA/L8zJQsATAKnguEqS+XTqkE4YfWWwCUFZTksYAYwZfIBeN9Tw0cjOwu8gDIZqsoSSvhEeQDiiGYFoyWiSDRypWgi69UP5sc5fIcquSCNeXqe2X9ZAHfM7Khe2pcOB+AT41+aO5iRD3QAHBEHd9ctuiBBoANEkbaAw0AR9r9zcUbADYYGGkPNAAcafc3F28A2GBgpD3QAHCk3d9cvAFgg4GR9kADwJF2f3PxBoANBkbaAw0AR9r9zcUbADYYGGkPNAAcafc3F28A2GBgpD3QAHCk3d9cfOxqYJ2au9RdPtdp/khoEOlglDYT39V1PzQFXLsMXAlgt9PCxJKPbufyf8/KHIPfBPAZABf79Xc5XQ0ZQ1Q7360NbxoHrlsDvs5ZRsgo0une06by6X1mZvtP99PNAp4F4LsBXA5gjw8EGTeqaGF4QhzQF80CX7cAvGIdeDYAfhdZ2sTKUcVrpE7nd31N5gj8e2dIo2osk7NZpMdK0Z19tv+bJ4F9K8D1ACj8yfNSikHeg+5Z969m57Y/8/ZP+dPLKZhP/rcA+AYAF7g1oRUhEMUzFMt6eSJfX78b2DkPfM0i8GIAX+uWlAMppreUUErn8p2gzTl+2flg/sDbTkvIOik+CP20//mzwAXzwDcCuNTPJeFXpEpM6QEjIHm/zTF8D7T5gATYNQCe69aAloRTGulfBESBSYNyxR5g/Bhw7hKwZwl4vk9LnM5JmsBzUyDGAX3B8G23Mz/g9BuUa/0IiutfMkj7zwKmngAuXSvOpUvAWYBtF4BTnspIj/O8zPaf7qdvWITw6eZA0JLQEhKEGgxZhUj/dz3NzSKwbR44exnYvVKcy+mM5Km0JhxInUtrGkmzCPicg3W5LMGkQiZZTm9xS9Z3+4m2o8C5c4X15pTKW2Lb+fCx7WLtjYxzqiql29Icw/dA5SqYf6RTTilg+lYCIXmICKQ4IK9wxfSJY8AZK8CuFWDnanEua9ZTAMsaCog3Dt92O/MvnRGBtGwkqKRmMEkqCaa+2k+0LQDTh4rP88UHj74kF1WaATo9QHQ7mmP4HugYhtEKj4PB6ZQ+FS0hQahpldPya1kXTOqNY8DscgG+HavAttUCvBxInitrkgL4lcO33c7spBdM3kAuSnq2nx9gQfAh4JyVwvrxwel2z3p4aMlzH6DM2z/lT+8aB+Q/OT4EEqckWQSBkGD6EQKQnDCLwBSnYgcf32fXioGUFawC4esyu7CXXnDP9tOCsyD4KLB1rmgvX7zfbu2WG/Jtme0/3U/vKxBNAMoi0KcjkATCN3HOEr3UAjDrwOP71rXixYEkeKMFlSX8ocwR6KUXTJ7AaNE2tF8WfA4Ye7Kw1mwvX/yZn+eKnvcrfzC6IK/ObP/pfnpfAGQnySoISBqUXyAASS1AK0JfagWYcRDOrAF66TxZQU7jBOEbM0egH71gcgXSFZAV54NQtj9YcNIpbONCyh8Ygi8CVospApDuB63g92W2/3Q/vW8AsqM4gLIKBBIH8bcJwMCNMX68BTqBb8s6sGWtsIA6jwDk662ZI9CvXjA5A6NVa2t/IAicnC/aGV+8T74IQPm/AmGuBc+8/VP+9IEAyLslAKMV/LgAyIUInfnjwPQqMOOgI/DstQ5Mr7UAqMF8V2YXDqoXXNl+EQQ6N9v29aKdesUpWJZbAPyPme0/3U8fGIDssDid/pUASCvCaXgJmFguAEfgEXT27gDkuwaUg/nbmSMwjF7whvbLhSDL5TwwvdRqo9oqHzACkCB8U2b7T/fThwIgO01T1IMCoAZxGRhbKoAXQUcQTjkI+a4B5e5FzjGsXvCG9gdqrLGFYrpVG/UuHzBOw2/LaXxzbh43DKeoJwlAHqLndSs4udoCoIBHQE45EPk3DuitmYOQoxdctp8+rFwIWsGFYiFFoLGNchcEQC6e+OJC5J2Z7T/dTx/aApYdJ37AyJK/DIwvFxYvWr0IwEn/H1Opco5sveDUhSAAF4HJpQJkWixp6k2n4IYfMGf0amDHev2I8+l4/UbvNw8Eozw72wJePOJ8und7EkKj9ztKGA1/7WwATo44n45pWI3e7/AAGPWZ2QBkYHCU+XTMfGGQmYIxjd7vqOE0+PXzATjifDrKtTZ6v4MP/MlyRj4AR5xPF+VaqZLJF1UzKdPV6P2eLDDr3I58AI44n07ZMARbo/d78gMubWE+AEecT8e9YOn2Uheu0fs9tUCYD8AR59MpG6bR+z21gKfW1gNAz4geRT5dTEZo9H5PPRDmAzBmRM8BJzqfLiYjSKKr0fs9dYBYDwBHmE9XtRfMsIz04aQZ1+j9npygrA+Akqs8wfl0BCCTWRq935MTYL1aVQ8Ao1zlAnAi8+kEQGZTNXq/vYb75Pt/fQAcUT5dBGCj93vyAaxXi+oDoFLyT3A+3Rcavd9eY3xS/z8fgCQX/LPR3SOzkon55jg1eyAfgD8M4NcAPD6aDmBtB1e4NMDNcer1QD4AbwbwxwDe4UvRE9wHZG1gNSXDLlwLNcep1QP5APxzzwj9IIAPnXhT5ORc5EYCA9HNcWr1QD4AmRH6FQBMTSZZH98ZmD5Bh5g1FopiNns1x6nTA/kAvAfAEwDudnI+EvQxPfkEzYfaCXRSBluQMB7YHKdGD+QDsBNBH/9+AkAobqTADGK7Inw1x8nfA/kA7EXQt8kgrGAGMfBxZ5Cv5ji5eyAfgL0I+r68uR0QmUFoBQU8vfNvzXHy9kA9AORoMw7CdGQCjoUZDwL4kv/+8OZ1gJhBIjGDgMh3vTavBc035/RAPgD7JegjODfhiMwgoqeJwNPPTaB6Ezq/hq+sB4AcXeXEP+ZhGVo9vRimIQD5v5oPAZCupgDI9wg8/qz/1Xz55usyeyAfgMMQ9GU2Op4eAchpOIJQQEz/VuPlm6/K7IH6AMjgGzdl6QtyX5jWjpQFevF3lq3xf6yhrOlIAUgQCojR8gmE+l9Nl2++JrMH6gEgR5UA5KYsc+AZmCbQCDi+IvgEQMob1XBEAHIajgBMLV+0kCdws6aGu3zqfkV9AGTwjftg3JRVVRAtHQEXX/wbAcoXP5d5CID8GoJKvqDAloKOoIz/y7x8c3pmD4zhaqwjRzCYyQg5gr2ZgsFTLweWr8XQgsXjbwLWrnNtMlKgNoLBmZAa7PTCAuYIBlMvlWQswwr2UlUw45jdDSx8HbD+Ctd+HVCwePKbgJV9aASDM8Yg59TWFDysYPBtmYK91IbNOHaPA/M7gUXKXA4hWDz79cA8+W0aweCMURj+1HYfcBjBYO54MMY3tGDv8I3nmWSHOzYOLJ0LLPGXAQWLz3oB8MQUsEa16kYwOG8whjh74yJkUMFgbsNlCfYO0epwissVY34bsHw2sEIRkAEEi/dcU0SP5qhF1ggG5w3GEGdXr4L5134Fg4kAjuDQgr1DtDqcUmZETwArZwAru4BVqsv0KVh8/o3F4v0QXZBGMDhvMIY4u3MYhv95Zh+Cu1xBcxuOU/HfeDIq5cv7FuwdotXhlCBXjOXZAnyrO4BV6in0IVh8wStLuWCsUAyvEQzOG5ABz+4eB+R/ewnu/kOP/3G/l4kJTERlljQtIot2e53/IwO2OPl4FLtcnCqAp9cahT56CBZf+LpSLhhz1N5qBIPzBmTAs/sLRHcTDKbiNHdBGGymOC/3hglEvgjAnoK9A7Y4+XgiV4zVWYDAs/etxaubYPFFP1QkLtCIP8neaASD8wZkwLP7AyC/tJNg8L/xLNBu+YBdBXsHbHEFAINcMVamgdWZAoRrfPdXm8KitLdmgYveWAq+2y7iMqfuRjA4b1AGOLt/APJLqwSD3+y5T1yI0AoSbAxMMzGV1o8/My2ro2DvAK2t+GgiV4zj4+3AIwDXtwBrVJeuECze+9aW4Dut4PxkIhYsdetGMDhvoDqcPRgA+SWp4O4veQ5Uv/mAGwR78+6rQq4Yq9PAOi2fA4/vBkKudKVU7VZw77uKvWFuZbtcMNb5v0YwOG9g+jx7cADyi6Pg7gccgIxlcA5TKhaD01yYKBmVFpBZMfx/m2Bvny3t8LGqoqTliZbVI+gMgHwnMAnCIFi897cLAAZ6QyzFzzSCwXkD1OPs4QDIL5XgLmk5JHk/SD5gKdibd38VcsVYGmuBTaAzEHLHgyCcaokB7/1IkUET5IKxwF5pBIPzBqbPs4cHIC/AaeqvPL9pmHxAE+zts6VdLCD/lcgVY3UyWD0Bj1ZwqgCggXA7sPfWAoAJvaEtZBrB4Lyx6efsPADyCtmCvf00s/NnOsgVY3m8BTRZPZuGBUACdArY+5lWDqGmYbIrLHEx0ggG5w1OH2fnA7CPizQfaXqgUw80AGywMdIeaAA40u5vLt4AsMHASHugAeBIu7+5eAPABgMj7YEGgCPt/ubiDQAbDIy0BxoAjrT7m4s3AGwwMNIeaAA40u5vLt4AsMHASHugAeBIu7+5eAPABgMj7YEGgCPt/ubiDQAbDIy0B8ZYNMbkX+ZekpuIiOQrPar+xs889HJg6jZg5jAwvVZ8B+ll9PlO5/Fc/o+ECjnHfi8zYfkvM5ulmp4qJXVqx5deD4zfAkw/CGxdAZgoHfuh131QkaI5hu8Bs4Ds8B0AWLnIRGCBsFfn87JffDMwdjOw5R5g8giwZa34jnQQUwDo99wBfJ4TM7COiNdlaj2rA/jeV/vfDeATAP4UGH8I2Lrc6gc+SHqY4oMZ74VSKM0xfA+UUzB/oBUUCKMl6zSQ/PsXqZD5KQC/A0w/DEwcAcYXgYnVwppwADuBkefnCim90FmBWXwnK87Uen53BI8sbuwqaz9p5UgnQhBS+ZN1zE8Ak0utviCwq8DI8/nx5hi+Bzb4gJzKZE1SEFZZgS9/2pWR/gTAJ4HJQ8DEMWB8ARhfBsaWCwDquwQKvvNgHXvOcYVbPFJPkw+dDxC/W1Y4tWDpw/Rlgo4lo1T4/KxTihDNpJwj3/UiMLXemprjffC7eWpzDN8DlYsQDiKtVxzEqoHkyX9HRizW+nIgaQnvAiaeBCbmC0s4tgSMu2rMePAR9X252jXklaTFU108K0MHav/nvJ6ZxVVk9OI7GR2IZoGQNc/HgbHgIwqILIVujuF7oOMqWFawCoRxkfEIB5CWgkREBCNf9wMTc8A4QciBWyoGz16rwNgaML5eWKpctYZL3N+TWLX0gvtuP0HHk2n16JDyxXmVhfU0qywbJbr5GSuXKxA/sV5Y9UYWdnjwyS3qKKgarWA69Wg6fjQOIK0HadnIjPVFB+AiME4AuiUkCFnESyCSkmAuU7Cjm15wX+2X2ifBRn9A8mKcW2UFjULVQcgVDl80u40SYh763FfvquhLCxitoBYUsoJfjXKttByMq9CKcHn4sPuCbgXNJwyWkECcz5Q376UX3LNncZyQAAADEklEQVT9fFgIJs6lBBwtn3Tt6FpIz4RWnuQxPh2XIGzm4CwQ9hWIFgBTK0gQHiIAJddKq0ELQh+KL1qUR4MvSEsoENIKrgALHNiMox+94K7tl9qnnMio8MSf6SNwGpYVjCDk/Ju7isq496fCqX0BkDeqlWwKwic1gAQSpzGREnFgREz01eALLvvq2Kfi45m6cf3qBXdsfxRbJMho8dimqOhEK8cXQRr9QVpvPoDNMXQP9A3ACELFxPh+jACkP0fLIKFCCRRqKuPUdqjlC9o07JZwKVNHeBC94DQcZO0XAAkmgotAk9QYrR9f/BvByYfMSATDVMzwTXMM3QMDAVAgVHCZ7/MaQK4QZUHiNCbBQlqUw74YCb7gcmYkelC9YFlwvVv7RRAorTuBkECU9asCID9/x9B935zYzyKkqpfiNHxcA0gLQgvBAaPVkCqm3h2AtC5m/RyEqzw/4xhGL3hD++MmslgqCbgUfLKAcRrmTlBzDN0DA1tAXUlWcDm1IOIIJAjlT/Fd05lbFQFwjdtgGcewesFt7Rc/Gx8iWjUCjGCT1YvWT1MwgUqrf3NG45tTbcu0aximWx9xENcEQHGbcYAEwtSXSqY0gnCdgeuMI0cvuGx/FUGgFhwEYrR80QckWN+X0fjm1DwAWv8RgJFilJZBznz0pQg+AZAAlVWh1GvGka0XzB0cCQi30aSGVa9AF62fLOB7MhrfnJoPwPER59Px+o3e76mL5Kwp2G57xPl0kxc3er+nLvyKtLmhfUC78RHn081ONnq/pzcAR5xPR9mRRu/31IVgvgUccT4dNaobvd/TGYAjzqejumqj93s6A3DE+XRUg2VSCjdaGr3fUw+I+VPwiPPpqJjO8J1Nw43e7ymHwHoAKMFd7QErAeEE5NNJMb3R+z3lsGcNzgfgiPPpomJ6o/d76oGwPgCOKJ8uKqY3er+nKwBHmE+noqRG7/fUA199U/AI8+kEwEbv93QHoEhZTnA+nYqSGr3fBoAtaiqBUImdm5hPJwA2er+nKwBHnE+X1gUzSbnR+z11wPj/AeCpPDD3t7rvAAAAAElFTkSuQmCC";

  var SMAAPass = function (_Pass) {
  		inherits(SMAAPass, _Pass);

  		function SMAAPass(searchImage, areaImage) {
  				classCallCheck(this, SMAAPass);

  				var _this = possibleConstructorReturn(this, (SMAAPass.__proto__ || Object.getPrototypeOf(SMAAPass)).call(this, "SMAAPass"));

  				_this.clearPass = new ClearPass({
  						clearColor: new three.Color(0x000000),
  						clearAlpha: 1.0
  				});

  				_this.renderTargetColorEdges = new three.WebGLRenderTarget(1, 1, {
  						minFilter: three.LinearFilter,
  						format: three.RGBFormat,
  						stencilBuffer: false,
  						depthBuffer: false
  				});

  				_this.renderTargetColorEdges.texture.name = "SMAA.ColorEdges";
  				_this.renderTargetColorEdges.texture.generateMipmaps = false;

  				_this.renderTargetWeights = _this.renderTargetColorEdges.clone();

  				_this.renderTargetWeights.texture.name = "SMAA.Weights";
  				_this.renderTargetWeights.texture.format = three.RGBAFormat;

  				_this.colorEdgesMaterial = new ColorEdgesMaterial();

  				_this.weightsMaterial = new SMAAWeightsMaterial();

  				_this.weightsMaterial.uniforms.tDiffuse.value = _this.renderTargetColorEdges.texture;

  				_this.searchTexture = new three.Texture(searchImage);

  				_this.searchTexture.name = "SMAA.Search";
  				_this.searchTexture.magFilter = three.NearestFilter;
  				_this.searchTexture.minFilter = three.NearestFilter;
  				_this.searchTexture.format = three.RGBAFormat;
  				_this.searchTexture.generateMipmaps = false;
  				_this.searchTexture.needsUpdate = true;
  				_this.searchTexture.flipY = false;

  				_this.weightsMaterial.uniforms.tSearch.value = _this.searchTexture;

  				_this.areaTexture = new three.Texture(areaImage);

  				_this.areaTexture.name = "SMAA.Area";
  				_this.areaTexture.minFilter = three.LinearFilter;
  				_this.areaTexture.format = three.RGBAFormat;
  				_this.areaTexture.generateMipmaps = false;
  				_this.areaTexture.needsUpdate = true;
  				_this.areaTexture.flipY = false;

  				_this.weightsMaterial.uniforms.tArea.value = _this.areaTexture;

  				_this.blendMaterial = new SMAABlendMaterial();

  				_this.blendMaterial.uniforms.tWeights.value = _this.renderTargetWeights.texture;

  				return _this;
  		}

  		createClass(SMAAPass, [{
  				key: "render",
  				value: function render(renderer, inputBuffer, outputBuffer, delta, stencilTest) {
  						this.setFullscreenMaterial(this.colorEdgesMaterial);
  						this.colorEdgesMaterial.uniforms.tDiffuse.value = inputBuffer.texture;
  						this.clearPass.render(renderer, this.renderTargetColorEdges);
  						renderer.render(this.scene, this.camera, this.renderTargetColorEdges);

  						this.setFullscreenMaterial(this.weightsMaterial);
  						renderer.render(this.scene, this.camera, this.renderTargetWeights);

  						this.setFullscreenMaterial(this.blendMaterial);
  						this.blendMaterial.uniforms.tDiffuse.value = inputBuffer.texture;

  						renderer.render(this.scene, this.camera, this.renderToScreen ? null : outputBuffer);
  				}
  		}, {
  				key: "setSize",
  				value: function setSize(width, height) {

  						this.renderTargetColorEdges.setSize(width, height);
  						this.renderTargetWeights.setSize(width, height);

  						this.colorEdgesMaterial.uniforms.texelSize.value.copy(this.weightsMaterial.uniforms.texelSize.value.copy(this.blendMaterial.uniforms.texelSize.value.set(1.0 / width, 1.0 / height)));
  				}
  		}], [{
  				key: "searchImageDataURL",
  				get: function get$$1() {

  						return searchImageDataURL;
  				}
  		}, {
  				key: "areaImageDataURL",
  				get: function get$$1() {

  						return areaImageDataURL;
  				}
  		}]);
  		return SMAAPass;
  }(Pass);

  var TexturePass = function (_Pass) {
  	inherits(TexturePass, _Pass);

  	function TexturePass(texture) {
  		var opacity = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1.0;
  		var screenMode = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
  		classCallCheck(this, TexturePass);

  		var _this = possibleConstructorReturn(this, (TexturePass.__proto__ || Object.getPrototypeOf(TexturePass)).call(this, "TexturePass"));

  		_this.setFullscreenMaterial(new CombineMaterial(screenMode));

  		_this.texture = texture;
  		_this.opacitySource = opacity;

  		return _this;
  	}

  	createClass(TexturePass, [{
  		key: "render",
  		value: function render(renderer, inputBuffer, outputBuffer, delta, stencilTest) {

  			this.getFullscreenMaterial().uniforms.texture1.value = inputBuffer.texture;

  			renderer.render(this.scene, this.camera, this.renderToScreen ? null : outputBuffer);
  		}
  	}, {
  		key: "texture",
  		get: function get$$1() {

  			return this.getFullscreenMaterial().uniforms.texture2.value;
  		},
  		set: function set$$1(value) {

  			this.getFullscreenMaterial().uniforms.texture2.value = value;
  		}
  	}, {
  		key: "opacityDestination",
  		get: function get$$1() {

  			return this.getFullscreenMaterial().uniforms.opacity1.value;
  		},
  		set: function set$$1() {
  			var value = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1.0;


  			this.getFullscreenMaterial().uniforms.opacity1.value = value;
  		}
  	}, {
  		key: "opacitySource",
  		get: function get$$1() {

  			return this.getFullscreenMaterial().uniforms.opacity2.value;
  		},
  		set: function set$$1() {
  			var value = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1.0;


  			this.getFullscreenMaterial().uniforms.opacity2.value = value;
  		}
  	}]);
  	return TexturePass;
  }(Pass);

  var ToneMappingPass = function (_Pass) {
  		inherits(ToneMappingPass, _Pass);

  		function ToneMappingPass() {
  				var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  				classCallCheck(this, ToneMappingPass);

  				var _this = possibleConstructorReturn(this, (ToneMappingPass.__proto__ || Object.getPrototypeOf(ToneMappingPass)).call(this, "ToneMappingPass"));

  				_this.renderTargetLuminosity = new three.WebGLRenderTarget(1, 1, {
  						minFilter: three.LinearMipMapLinearFilter,
  						magFilter: three.LinearFilter,
  						format: three.RGBFormat,
  						stencilBuffer: false,
  						depthBuffer: false
  				});

  				_this.renderTargetLuminosity.texture.name = "ToneMapping.Luminosity";

  				_this.renderTargetAdapted = _this.renderTargetLuminosity.clone();

  				_this.renderTargetAdapted.texture.name = "ToneMapping.AdaptedLuminosity";
  				_this.renderTargetAdapted.texture.generateMipmaps = false;
  				_this.renderTargetAdapted.texture.minFilter = three.LinearFilter;

  				_this.renderTargetPrevious = _this.renderTargetAdapted.clone();

  				_this.renderTargetPrevious.texture.name = "ToneMapping.PreviousLuminosity";

  				_this.copyMaterial = new CopyMaterial();

  				_this.luminosityMaterial = new LuminosityMaterial();

  				_this.luminosityMaterial.uniforms.distinction.value = options.distinction !== undefined ? options.distinction : 1.0;

  				_this.adaptiveLuminosityMaterial = new AdaptiveLuminosityMaterial();

  				_this.resolution = options.resolution;

  				_this.toneMappingMaterial = new ToneMappingMaterial();

  				_this.adaptive = options.adaptive;

  				return _this;
  		}

  		createClass(ToneMappingPass, [{
  				key: "render",
  				value: function render(renderer, inputBuffer, outputBuffer, delta, stencilTest) {

  						var scene = this.scene;
  						var camera = this.camera;

  						var adaptiveLuminosityMaterial = this.adaptiveLuminosityMaterial;
  						var luminosityMaterial = this.luminosityMaterial;
  						var toneMappingMaterial = this.toneMappingMaterial;
  						var copyMaterial = this.copyMaterial;

  						var renderTargetPrevious = this.renderTargetPrevious;
  						var renderTargetLuminosity = this.renderTargetLuminosity;
  						var renderTargetAdapted = this.renderTargetAdapted;

  						if (this.adaptive) {
  								this.setFullscreenMaterial(luminosityMaterial);
  								luminosityMaterial.uniforms.tDiffuse.value = inputBuffer.texture;
  								renderer.render(scene, camera, renderTargetLuminosity);

  								this.setFullscreenMaterial(adaptiveLuminosityMaterial);
  								adaptiveLuminosityMaterial.uniforms.delta.value = delta;
  								adaptiveLuminosityMaterial.uniforms.tPreviousLum.value = renderTargetPrevious.texture;
  								adaptiveLuminosityMaterial.uniforms.tCurrentLum.value = renderTargetLuminosity.texture;
  								renderer.render(scene, camera, renderTargetAdapted);

  								this.setFullscreenMaterial(copyMaterial);
  								copyMaterial.uniforms.tDiffuse.value = renderTargetAdapted.texture;
  								renderer.render(scene, camera, renderTargetPrevious);
  						}

  						this.setFullscreenMaterial(toneMappingMaterial);
  						toneMappingMaterial.uniforms.tDiffuse.value = inputBuffer.texture;

  						renderer.render(this.scene, this.camera, this.renderToScreen ? null : outputBuffer);
  				}
  		}, {
  				key: "initialize",
  				value: function initialize(renderer, alpha) {

  						this.setFullscreenMaterial(new three.MeshBasicMaterial({ color: 0x7fffff }));
  						renderer.render(this.scene, this.camera, this.renderTargetPrevious);
  						this.getFullscreenMaterial().dispose();
  				}
  		}, {
  				key: "resolution",
  				get: function get$$1() {

  						return this.renderTargetLuminosity.width;
  				},
  				set: function set$$1() {
  						var value = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 256;

  						var exponent = Math.max(0, Math.ceil(Math.log2(value)));
  						value = Math.pow(2, exponent);

  						this.renderTargetLuminosity.setSize(value, value);
  						this.renderTargetPrevious.setSize(value, value);
  						this.renderTargetAdapted.setSize(value, value);

  						this.adaptiveLuminosityMaterial.defines.MIP_LEVEL_1X1 = exponent.toFixed(1);
  						this.adaptiveLuminosityMaterial.needsUpdate = true;
  				}
  		}, {
  				key: "adaptive",
  				get: function get$$1() {

  						return this.toneMappingMaterial.defines.ADAPTED_LUMINANCE !== undefined;
  				},
  				set: function set$$1() {
  						var value = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;


  						if (value) {

  								this.toneMappingMaterial.defines.ADAPTED_LUMINANCE = "1";
  								this.toneMappingMaterial.uniforms.luminanceMap.value = this.renderTargetAdapted.texture;
  						} else {

  								delete this.toneMappingMaterial.defines.ADAPTED_LUMINANCE;
  								this.toneMappingMaterial.uniforms.luminanceMap.value = null;
  						}

  						this.toneMappingMaterial.needsUpdate = true;
  				}
  		}, {
  				key: "dithering",
  				get: function get$$1() {

  						return this.toneMappingMaterial.dithering;
  				},
  				set: function set$$1(value) {

  						if (this.dithering !== value) {

  								this.toneMappingMaterial.dithering = value;
  								this.toneMappingMaterial.needsUpdate = true;
  						}
  				}
  		}]);
  		return ToneMappingPass;
  }(Pass);

  var EffectComposer = function () {
  		function EffectComposer() {
  				var renderer = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
  				var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  				classCallCheck(this, EffectComposer);


  				this.renderer = renderer;

  				this.inputBuffer = null;

  				this.outputBuffer = null;

  				if (this.renderer !== null) {

  						this.renderer.autoClear = false;

  						this.inputBuffer = this.createBuffer(options.depthBuffer !== undefined ? options.depthBuffer : true, options.stencilBuffer !== undefined ? options.stencilBuffer : false, options.depthTexture !== undefined ? options.depthTexture : false);

  						this.outputBuffer = this.inputBuffer.clone();
  				}

  				this.copyPass = new ShaderPass(new CopyMaterial());

  				this.passes = [];
  		}

  		createClass(EffectComposer, [{
  				key: "replaceRenderer",
  				value: function replaceRenderer(renderer) {

  						var oldRenderer = this.renderer;

  						var parent = void 0,
  						    oldSize = void 0,
  						    newSize = void 0;

  						if (oldRenderer !== null && oldRenderer !== renderer) {

  								this.renderer = renderer;
  								this.renderer.autoClear = false;

  								parent = oldRenderer.domElement.parentNode;
  								oldSize = oldRenderer.getSize();
  								newSize = renderer.getSize();

  								if (parent !== null) {

  										parent.removeChild(oldRenderer.domElement);
  										parent.appendChild(renderer.domElement);
  								}

  								if (oldSize.width !== newSize.width || oldSize.height !== newSize.height) {

  										this.setSize();
  								}
  						}

  						return oldRenderer;
  				}
  		}, {
  				key: "createBuffer",
  				value: function createBuffer(depthBuffer, stencilBuffer, depthTexture) {

  						var drawingBufferSize = this.renderer.getDrawingBufferSize();
  						var alpha = this.renderer.context.getContextAttributes().alpha;

  						var renderTarget = new three.WebGLRenderTarget(drawingBufferSize.width, drawingBufferSize.height, {
  								minFilter: three.LinearFilter,
  								magFilter: three.LinearFilter,
  								format: alpha ? three.RGBAFormat : three.RGBFormat,
  								depthBuffer: depthBuffer,
  								stencilBuffer: stencilBuffer,
  								depthTexture: depthTexture ? new three.DepthTexture() : null
  						});

  						if (depthTexture && stencilBuffer) {

  								renderTarget.depthTexture.format = three.DepthStencilFormat;
  								renderTarget.depthTexture.type = three.UnsignedInt248Type;
  						}

  						renderTarget.texture.name = "EffectComposer.Buffer";
  						renderTarget.texture.generateMipmaps = false;

  						return renderTarget;
  				}
  		}, {
  				key: "addPass",
  				value: function addPass(pass, index) {

  						var renderer = this.renderer;
  						var drawingBufferSize = renderer.getDrawingBufferSize();

  						pass.setSize(drawingBufferSize.width, drawingBufferSize.height);
  						pass.initialize(renderer, renderer.context.getContextAttributes().alpha);

  						if (index !== undefined) {

  								this.passes.splice(index, 0, pass);
  						} else {

  								this.passes.push(pass);
  						}
  				}
  		}, {
  				key: "removePass",
  				value: function removePass(pass) {

  						this.passes.splice(this.passes.indexOf(pass), 1);
  				}
  		}, {
  				key: "render",
  				value: function render(delta) {

  						var renderer = this.renderer;
  						var copyPass = this.copyPass;

  						var inputBuffer = this.inputBuffer;
  						var outputBuffer = this.outputBuffer;

  						var stencilTest = false;
  						var context = void 0,
  						    state = void 0,
  						    buffer = void 0;

  						var _iteratorNormalCompletion = true;
  						var _didIteratorError = false;
  						var _iteratorError = undefined;

  						try {
  								for (var _iterator = this.passes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
  										var pass = _step.value;


  										if (pass.enabled) {

  												pass.render(renderer, inputBuffer, outputBuffer, delta, stencilTest);

  												if (pass.needsSwap) {

  														if (stencilTest) {

  																copyPass.renderToScreen = pass.renderToScreen;

  																context = renderer.context;
  																state = renderer.state;

  																state.buffers.stencil.setFunc(context.NOTEQUAL, 1, 0xffffffff);
  																copyPass.render(renderer, inputBuffer, outputBuffer, delta, stencilTest);
  																state.buffers.stencil.setFunc(context.EQUAL, 1, 0xffffffff);
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
  								_didIteratorError = true;
  								_iteratorError = err;
  						} finally {
  								try {
  										if (!_iteratorNormalCompletion && _iterator.return) {
  												_iterator.return();
  										}
  								} finally {
  										if (_didIteratorError) {
  												throw _iteratorError;
  										}
  								}
  						}
  				}
  		}, {
  				key: "setSize",
  				value: function setSize(width, height) {

  						var renderer = this.renderer;

  						var size = void 0,
  						    drawingBufferSize = void 0;

  						if (width === undefined || height === undefined) {

  								size = renderer.getSize();
  								width = size.width;
  								height = size.height;
  						}

  						renderer.setSize(width, height);

  						drawingBufferSize = renderer.getDrawingBufferSize();

  						this.inputBuffer.setSize(drawingBufferSize.width, drawingBufferSize.height);
  						this.outputBuffer.setSize(drawingBufferSize.width, drawingBufferSize.height);

  						var _iteratorNormalCompletion2 = true;
  						var _didIteratorError2 = false;
  						var _iteratorError2 = undefined;

  						try {
  								for (var _iterator2 = this.passes[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
  										var pass = _step2.value;


  										pass.setSize(drawingBufferSize.width, drawingBufferSize.height);
  								}
  						} catch (err) {
  								_didIteratorError2 = true;
  								_iteratorError2 = err;
  						} finally {
  								try {
  										if (!_iteratorNormalCompletion2 && _iterator2.return) {
  												_iterator2.return();
  										}
  								} finally {
  										if (_didIteratorError2) {
  												throw _iteratorError2;
  										}
  								}
  						}
  				}
  		}, {
  				key: "reset",
  				value: function reset() {

  						var renderTarget = this.createBuffer(this.inputBuffer.depthBuffer, this.inputBuffer.stencilBuffer, this.inputBuffer.depthTexture !== null);

  						this.dispose();

  						this.inputBuffer = renderTarget;
  						this.outputBuffer = renderTarget.clone();
  						this.copyPass = new ShaderPass(new CopyMaterial());
  				}
  		}, {
  				key: "dispose",
  				value: function dispose() {
  						var _iteratorNormalCompletion3 = true;
  						var _didIteratorError3 = false;
  						var _iteratorError3 = undefined;

  						try {

  								for (var _iterator3 = this.passes[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
  										var pass = _step3.value;


  										pass.dispose();
  								}
  						} catch (err) {
  								_didIteratorError3 = true;
  								_iteratorError3 = err;
  						} finally {
  								try {
  										if (!_iteratorNormalCompletion3 && _iterator3.return) {
  												_iterator3.return();
  										}
  								} finally {
  										if (_didIteratorError3) {
  												throw _iteratorError3;
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

  						this.copyPass.dispose();
  				}
  		}, {
  				key: "depthTexture",
  				get: function get$$1() {

  						return this.inputBuffer.depthTexture;
  				},
  				set: function set$$1(x) {

  						this.inputBuffer.depthTexture = x;
  						this.outputBuffer.depthTexture = x;
  				}
  		}]);
  		return EffectComposer;
  }();

  var Resizable = function () {
  	function Resizable() {
  		classCallCheck(this, Resizable);
  	}

  	createClass(Resizable, [{
  		key: "setSize",
  		value: function setSize(width, height) {}
  	}]);
  	return Resizable;
  }();

  function createCanvas(width, height, data, channels) {

  	var canvas = document.createElementNS("http://www.w3.org/1999/xhtml", "canvas");
  	var context = canvas.getContext("2d");

  	var imageData = context.createImageData(width, height);
  	var target = imageData.data;

  	var x = void 0,
  	    y = void 0;
  	var i = void 0,
  	    j = void 0;

  	for (y = 0; y < height; ++y) {

  		for (x = 0; x < width; ++x) {

  			i = (y * width + x) * 4;
  			j = (y * width + x) * channels;

  			target[i] = channels > 0 ? data[j] : 0;
  			target[i + 1] = channels > 1 ? data[j + 1] : 0;
  			target[i + 2] = channels > 2 ? data[j + 2] : 0;
  			target[i + 3] = channels > 3 ? data[j + 3] : 255;
  		}
  	}

  	canvas.width = width;
  	canvas.height = height;

  	context.putImageData(imageData, 0, 0);

  	return canvas;
  }

  var RawImageData = function () {
  	function RawImageData() {
  		var width = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
  		var height = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  		var data = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
  		var channels = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 4;
  		classCallCheck(this, RawImageData);


  		this.width = width;

  		this.height = height;

  		this.data = data;

  		this.channels = channels;
  	}

  	createClass(RawImageData, [{
  		key: "toCanvas",
  		value: function toCanvas() {

  			return typeof document === "undefined" ? null : createCanvas(this.width, this.height, this.data, this.channels);
  		}
  	}]);
  	return RawImageData;
  }();

  var b0 = new three.Box2();

  var b1 = new three.Box2();

  var ORTHOGONAL_SIZE = 16;

  var DIAGONAL_SIZE = 20;

  var DIAGONAL_SAMPLES = 30;

  var SMOOTH_MAX_DISTANCE = 32;

  var orthogonalSubsamplingOffsets = new Float32Array([0.0, -0.25, 0.25, -0.125, 0.125, -0.375, 0.375]);

  var diagonalSubsamplingOffsets = [new Float32Array([0.0, 0.0]), new Float32Array([0.25, -0.25]), new Float32Array([-0.25, 0.25]), new Float32Array([0.125, -0.125]), new Float32Array([-0.125, 0.125])];

  var orthogonalEdges = [new Uint8Array([0, 0]), new Uint8Array([3, 0]), new Uint8Array([0, 3]), new Uint8Array([3, 3]), new Uint8Array([1, 0]), new Uint8Array([4, 0]), new Uint8Array([1, 3]), new Uint8Array([4, 3]), new Uint8Array([0, 1]), new Uint8Array([3, 1]), new Uint8Array([0, 4]), new Uint8Array([3, 4]), new Uint8Array([1, 1]), new Uint8Array([4, 1]), new Uint8Array([1, 4]), new Uint8Array([4, 4])];

  var diagonalEdges = [new Uint8Array([0, 0]), new Uint8Array([1, 0]), new Uint8Array([0, 2]), new Uint8Array([1, 2]), new Uint8Array([2, 0]), new Uint8Array([3, 0]), new Uint8Array([2, 2]), new Uint8Array([3, 2]), new Uint8Array([0, 1]), new Uint8Array([1, 1]), new Uint8Array([0, 3]), new Uint8Array([1, 3]), new Uint8Array([2, 1]), new Uint8Array([3, 1]), new Uint8Array([2, 3]), new Uint8Array([3, 3])];

  function lerp(a, b, p) {

  			return a + (b - a) * p;
  }

  function saturate(a) {

  			return Math.min(Math.max(a, 0.0), 1.0);
  }

  function smoothArea(d, b) {

  			var a1 = b.min;
  			var a2 = b.max;

  			var b1X = Math.sqrt(a1.x * 2.0) * 0.5;
  			var b1Y = Math.sqrt(a1.y * 2.0) * 0.5;
  			var b2X = Math.sqrt(a2.x * 2.0) * 0.5;
  			var b2Y = Math.sqrt(a2.y * 2.0) * 0.5;

  			var p = saturate(d / SMOOTH_MAX_DISTANCE);

  			a1.set(lerp(b1X, a1.x, p), lerp(b1Y, a1.y, p));
  			a2.set(lerp(b2X, a2.x, p), lerp(b2Y, a2.y, p));

  			return b;
  }

  function calculateOrthogonalArea(p1, p2, x, result) {

  			var dX = p2.x - p1.x;
  			var dY = p2.y - p1.y;

  			var x1 = x;
  			var x2 = x + 1.0;

  			var y1 = p1.y + dY * (x1 - p1.x) / dX;
  			var y2 = p1.y + dY * (x2 - p1.x) / dX;

  			var a = void 0,
  			    a1 = void 0,
  			    a2 = void 0,
  			    t = void 0;

  			if (x1 >= p1.x && x1 < p2.x || x2 > p1.x && x2 <= p2.x) {
  						if (Math.sign(y1) === Math.sign(y2) || Math.abs(y1) < 1e-4 || Math.abs(y2) < 1e-4) {

  									a = (y1 + y2) / 2.0;

  									if (a < 0.0) {

  												result.set(Math.abs(a), 0.0);
  									} else {

  												result.set(0.0, Math.abs(a));
  									}
  						} else {
  									t = -p1.y * dX / dY + p1.x;

  									a1 = t > p1.x ? y1 * (t - Math.trunc(t)) / 2.0 : 0.0;
  									a2 = t < p2.x ? y2 * (1.0 - (t - Math.trunc(t))) / 2.0 : 0.0;

  									a = Math.abs(a1) > Math.abs(a2) ? a1 : -a2;

  									if (a < 0.0) {

  												result.set(Math.abs(a1), Math.abs(a2));
  									} else {

  												result.set(Math.abs(a2), Math.abs(a1));
  									}
  						}
  			} else {

  						result.set(0, 0);
  			}

  			return result;
  }

  function calculateOrthogonalAreaForPattern(pattern, left, right, offset, result) {

  			var p1 = b0.min;
  			var p2 = b0.max;
  			var a1 = b1.min;
  			var a2 = b1.max;
  			var a = b1;

  			var o1 = 0.5 + offset;
  			var o2 = 0.5 + offset - 1.0;
  			var d = left + right + 1;

  			switch (pattern) {

  						case 0:
  									{

  												result.set(0, 0);

  												break;
  									}

  						case 1:
  									{

  												if (left <= right) {

  															calculateOrthogonalArea(p1.set(0.0, o2), p2.set(d / 2.0, 0.0), left, result);
  												} else {

  															result.set(0, 0);
  												}

  												break;
  									}

  						case 2:
  									{

  												if (left >= right) {

  															calculateOrthogonalArea(p1.set(d / 2.0, 0.0), p2.set(d, o2), left, result);
  												} else {

  															result.set(0, 0);
  												}

  												break;
  									}

  						case 3:
  									{

  												calculateOrthogonalArea(p1.set(0.0, o2), p2.set(d / 2.0, 0.0), left, a1);
  												calculateOrthogonalArea(p1.set(d / 2.0, 0.0), p2.set(d, o2), left, a2);

  												smoothArea(d, a);

  												result.addVectors(a1, a2);

  												break;
  									}

  						case 4:
  									{

  												if (left <= right) {

  															calculateOrthogonalArea(p1.set(0.0, o1), p2.set(d / 2.0, 0.0), left, result);
  												} else {

  															result.set(0, 0);
  												}

  												break;
  									}

  						case 5:
  									{

  												result.set(0, 0);

  												break;
  									}

  						case 6:
  									{

  												if (Math.abs(offset) > 0.0) {

  															calculateOrthogonalArea(p1.set(0.0, o1), p2.set(d, o2), left, a1);
  															calculateOrthogonalArea(p1.set(0.0, o1), p2.set(d / 2.0, 0.0), left, a2);
  															a2.add(calculateOrthogonalArea(p1.set(d / 2.0, 0.0), p2.set(d, o2), left, result));

  															result.addVectors(a1, a2).divideScalar(2.0);
  												} else {

  															calculateOrthogonalArea(p1.set(0.0, o1), p2.set(d, o2), left, result);
  												}

  												break;
  									}

  						case 7:
  									{

  												calculateOrthogonalArea(p1.set(0.0, o1), p2.set(d, o2), left, result);

  												break;
  									}

  						case 8:
  									{

  												if (left >= right) {

  															calculateOrthogonalArea(p1.set(d / 2.0, 0.0), p2.set(d, o1), left, result);
  												} else {

  															result.set(0, 0);
  												}

  												break;
  									}

  						case 9:
  									{

  												if (Math.abs(offset) > 0.0) {

  															calculateOrthogonalArea(p1.set(0.0, o2), p2.set(d, o1), left, a1);
  															calculateOrthogonalArea(p1.set(0.0, o2), p2.set(d / 2.0, 0.0), left, a2);
  															a2.add(calculateOrthogonalArea(p1.set(d / 2.0, 0.0), p2.set(d, o1), left, result));

  															result.addVectors(a1, a2).divideScalar(2.0);
  												} else {

  															calculateOrthogonalArea(p1.set(0.0, o2), p2.set(d, o1), left, result);
  												}

  												break;
  									}

  						case 10:
  									{

  												result.set(0, 0);

  												break;
  									}

  						case 11:
  									{

  												calculateOrthogonalArea(p1.set(0.0, o2), p2.set(d, o1), left, result);

  												break;
  									}

  						case 12:
  									{

  												calculateOrthogonalArea(p1.set(0.0, o1), p2.set(d / 2.0, 0.0), left, a1);
  												calculateOrthogonalArea(p1.set(d / 2.0, 0.0), p2.set(d, o1), left, a2);

  												smoothArea(d, a);

  												result.addVectors(a1, a2);

  												break;
  									}

  						case 13:
  									{

  												calculateOrthogonalArea(p1.set(0.0, o2), p2.set(d, o1), left, result);

  												break;
  									}

  						case 14:
  									{

  												calculateOrthogonalArea(p1.set(0.0, o1), p2.set(d, o2), left, result);

  												break;
  									}

  						case 15:
  									{

  												result.set(0, 0);

  												break;
  									}

  			}

  			return result;
  }

  function isInsideArea(p1, p2, x, y) {

  			var result = p1.equals(p2);

  			var xm = void 0,
  			    ym = void 0;
  			var a = void 0,
  			    b = void 0,
  			    c = void 0;

  			if (!result) {

  						xm = (p1.x + p2.x) / 2.0;
  						ym = (p1.y + p2.y) / 2.0;

  						a = p2.y - p1.y;
  						b = p1.x - p2.x;

  						c = a * (x - xm) + b * (y - ym);

  						result = c > 0.0;
  			}

  			return result;
  }

  function calculateDiagonalAreaForPixel(p1, p2, pX, pY) {

  			var a = void 0;
  			var x = void 0,
  			    y = void 0;
  			var offsetX = void 0,
  			    offsetY = void 0;

  			for (a = 0, y = 0; y < DIAGONAL_SAMPLES; ++y) {

  						for (x = 0; x < DIAGONAL_SAMPLES; ++x) {

  									offsetX = x / (DIAGONAL_SAMPLES - 1.0);
  									offsetY = y / (DIAGONAL_SAMPLES - 1.0);

  									if (isInsideArea(p1, p2, pX + offsetX, pY + offsetY)) {

  												++a;
  									}
  						}
  			}

  			return a / (DIAGONAL_SAMPLES * DIAGONAL_SAMPLES);
  }

  function calculateDiagonalArea(pattern, p1, p2, left, offset, result) {

  			var e = diagonalEdges[pattern];
  			var e1 = e[0];
  			var e2 = e[1];

  			if (e1 > 0) {

  						p1.x += offset[0];
  						p1.y += offset[1];
  			}

  			if (e2 > 0) {

  						p2.x += offset[0];
  						p2.y += offset[1];
  			}

  			return result.set(1.0 - calculateDiagonalAreaForPixel(p1, p2, 1.0 + left, 0.0 + left), calculateDiagonalAreaForPixel(p1, p2, 1.0 + left, 1.0 + left));
  }

  function calculateDiagonalAreaForPattern(pattern, left, right, offset, result) {

  			var p1 = b0.min;
  			var p2 = b0.max;
  			var a1 = b1.min;
  			var a2 = b1.max;

  			var d = left + right + 1;

  			switch (pattern) {

  						case 0:
  									{
  												calculateDiagonalArea(pattern, p1.set(1.0, 1.0), p2.set(1.0 + d, 1.0 + d), left, offset, a1);

  												calculateDiagonalArea(pattern, p1.set(1.0, 0.0), p2.set(1.0 + d, 0.0 + d), left, offset, a2);

  												result.addVectors(a1, a2).divideScalar(2.0);

  												break;
  									}

  						case 1:
  									{

  												calculateDiagonalArea(pattern, p1.set(1.0, 0.0), p2.set(0.0 + d, 0.0 + d), left, offset, a1);
  												calculateDiagonalArea(pattern, p1.set(1.0, 0.0), p2.set(1.0 + d, 0.0 + d), left, offset, a2);

  												result.addVectors(a1, a2).divideScalar(2.0);

  												break;
  									}

  						case 2:
  									{

  												calculateDiagonalArea(pattern, p1.set(0.0, 0.0), p2.set(1.0 + d, 0.0 + d), left, offset, a1);
  												calculateDiagonalArea(pattern, p1.set(1.0, 0.0), p2.set(1.0 + d, 0.0 + d), left, offset, a2);

  												result.addVectors(a1, a2).divideScalar(2.0);

  												break;
  									}

  						case 3:
  									{

  												calculateDiagonalArea(pattern, p1.set(1.0, 0.0), p2.set(1.0 + d, 0.0 + d), left, offset, result);

  												break;
  									}

  						case 4:
  									{

  												calculateDiagonalArea(pattern, p1.set(1.0, 1.0), p2.set(0.0 + d, 0.0 + d), left, offset, a1);
  												calculateDiagonalArea(pattern, p1.set(1.0, 1.0), p2.set(1.0 + d, 0.0 + d), left, offset, a2);

  												result.addVectors(a1, a2).divideScalar(2.0);

  												break;
  									}

  						case 5:
  									{

  												calculateDiagonalArea(pattern, p1.set(1.0, 1.0), p2.set(0.0 + d, 0.0 + d), left, offset, a1);
  												calculateDiagonalArea(pattern, p1.set(1.0, 0.0), p2.set(1.0 + d, 0.0 + d), left, offset, a2);

  												result.addVectors(a1, a2).divideScalar(2.0);

  												break;
  									}

  						case 6:
  									{

  												calculateDiagonalArea(pattern, p1.set(1.0, 1.0), p2.set(1.0 + d, 0.0 + d), left, offset, result);

  												break;
  									}

  						case 7:
  									{

  												calculateDiagonalArea(pattern, p1.set(1.0, 1.0), p2.set(1.0 + d, 0.0 + d), left, offset, a1);
  												calculateDiagonalArea(pattern, p1.set(1.0, 0.0), p2.set(1.0 + d, 0.0 + d), left, offset, a2);

  												result.addVectors(a1, a2).divideScalar(2.0);

  												break;
  									}

  						case 8:
  									{

  												calculateDiagonalArea(pattern, p1.set(0.0, 0.0), p2.set(1.0 + d, 1.0 + d), left, offset, a1);
  												calculateDiagonalArea(pattern, p1.set(1.0, 0.0), p2.set(1.0 + d, 1.0 + d), left, offset, a2);

  												result.addVectors(a1, a2).divideScalar(2.0);

  												break;
  									}

  						case 9:
  									{

  												calculateDiagonalArea(pattern, p1.set(1.0, 0.0), p2.set(1.0 + d, 1.0 + d), left, offset, result);

  												break;
  									}

  						case 10:
  									{

  												calculateDiagonalArea(pattern, p1.set(0.0, 0.0), p2.set(1.0 + d, 1.0 + d), left, offset, a1);
  												calculateDiagonalArea(pattern, p1.set(1.0, 0.0), p2.set(1.0 + d, 0.0 + d), left, offset, a2);

  												result.addVectors(a1, a2).divideScalar(2.0);

  												break;
  									}

  						case 11:
  									{

  												calculateDiagonalArea(pattern, p1.set(1.0, 0.0), p2.set(1.0 + d, 1.0 + d), left, offset, a1);
  												calculateDiagonalArea(pattern, p1.set(1.0, 0.0), p2.set(1.0 + d, 0.0 + d), left, offset, a2);

  												result.addVectors(a1, a2).divideScalar(2.0);

  												break;
  									}

  						case 12:
  									{

  												calculateDiagonalArea(pattern, p1.set(1.0, 1.0), p2.set(1.0 + d, 1.0 + d), left, offset, result);

  												break;
  									}

  						case 13:
  									{

  												calculateDiagonalArea(pattern, p1.set(1.0, 1.0), p2.set(1.0 + d, 1.0 + d), left, offset, a1);
  												calculateDiagonalArea(pattern, p1.set(1.0, 0.0), p2.set(1.0 + d, 1.0 + d), left, offset, a2);

  												result.addVectors(a1, a2).divideScalar(2.0);

  												break;
  									}

  						case 14:
  									{

  												calculateDiagonalArea(pattern, p1.set(1.0, 1.0), p2.set(1.0 + d, 1.0 + d), left, offset, a1);
  												calculateDiagonalArea(pattern, p1.set(1.0, 1.0), p2.set(1.0 + d, 0.0 + d), left, offset, a2);

  												result.addVectors(a1, a2).divideScalar(2.0);

  												break;
  									}

  						case 15:
  									{

  												calculateDiagonalArea(pattern, p1.set(1.0, 1.0), p2.set(1.0 + d, 1.0 + d), left, offset, a1);
  												calculateDiagonalArea(pattern, p1.set(1.0, 0.0), p2.set(1.0 + d, 0.0 + d), left, offset, a2);

  												result.addVectors(a1, a2).divideScalar(2.0);

  												break;
  									}

  			}

  			return result;
  }

  function generatePatterns(patterns, offset, orthogonal) {

  			var result = new three.Vector2();

  			var i = void 0,
  			    l = void 0;
  			var x = void 0,
  			    y = void 0;
  			var c = void 0;

  			var pattern = void 0;
  			var data = void 0,
  			    size = void 0;

  			for (i = 0, l = patterns.length; i < l; ++i) {

  						pattern = patterns[i];

  						data = pattern.data;
  						size = pattern.width;

  						for (y = 0; y < size; ++y) {

  									for (x = 0; x < size; ++x) {

  												if (orthogonal) {

  															calculateOrthogonalAreaForPattern(i, x, y, offset, result);
  												} else {

  															calculateDiagonalAreaForPattern(i, x, y, offset, result);
  												}

  												c = (y * size + x) * 2;

  												data[c] = result.x * 255;
  												data[c + 1] = result.y * 255;
  									}
  						}
  			}
  }

  function assemble(base, patterns, edges, size, orthogonal, target) {

  			var p = new three.Vector2();

  			var dstData = target.data;
  			var dstWidth = target.width;

  			var i = void 0,
  			    l = void 0;
  			var x = void 0,
  			    y = void 0;
  			var c = void 0,
  			    d = void 0;

  			var edge = void 0;
  			var pattern = void 0;
  			var srcData = void 0,
  			    srcWidth = void 0;

  			for (i = 0, l = patterns.length; i < l; ++i) {

  						edge = edges[i];
  						pattern = patterns[i];

  						srcData = pattern.data;
  						srcWidth = pattern.width;

  						for (y = 0; y < size; ++y) {

  									for (x = 0; x < size; ++x) {

  												p.fromArray(edge).multiplyScalar(size);
  												p.add(base);
  												p.x += x;
  												p.y += y;

  												c = (p.y * dstWidth + p.x) * 2;

  												d = orthogonal ? (y * y * srcWidth + x * x) * 2 : (y * srcWidth + x) * 2;

  												dstData[c] = srcData[d];
  												dstData[c + 1] = srcData[d + 1];
  									}
  						}
  			}
  }

  var SMAAAreaImageData = function () {
  			function SMAAAreaImageData() {
  						classCallCheck(this, SMAAAreaImageData);
  			}

  			createClass(SMAAAreaImageData, null, [{
  						key: "generate",
  						value: function generate() {

  									var width = 2 * 5 * ORTHOGONAL_SIZE;
  									var height = orthogonalSubsamplingOffsets.length * 5 * ORTHOGONAL_SIZE;

  									var data = new Uint8ClampedArray(width * height * 2);
  									var result = new RawImageData(width, height, data, 2);

  									var orthogonalPatternSize = Math.pow(ORTHOGONAL_SIZE - 1, 2) + 1;
  									var diagonalPatternSize = DIAGONAL_SIZE;

  									var orthogonalPatterns = [];
  									var diagonalPatterns = [];

  									var base = new three.Vector2();

  									var i = void 0,
  									    l = void 0;

  									for (i = 0; i < 16; ++i) {

  												orthogonalPatterns.push(new RawImageData(orthogonalPatternSize, orthogonalPatternSize, new Uint8ClampedArray(orthogonalPatternSize * orthogonalPatternSize * 2), 2));

  												diagonalPatterns.push(new RawImageData(diagonalPatternSize, diagonalPatternSize, new Uint8ClampedArray(diagonalPatternSize * diagonalPatternSize * 2), 2));
  									}

  									for (i = 0, l = orthogonalSubsamplingOffsets.length; i < l; ++i) {
  												generatePatterns(orthogonalPatterns, orthogonalSubsamplingOffsets[i], true);

  												base.set(0, 5 * ORTHOGONAL_SIZE * i);
  												assemble(base, orthogonalPatterns, orthogonalEdges, ORTHOGONAL_SIZE, true, result);
  									}

  									for (i = 0, l = diagonalSubsamplingOffsets.length; i < l; ++i) {
  												generatePatterns(diagonalPatterns, diagonalSubsamplingOffsets[i], false);

  												base.set(5 * ORTHOGONAL_SIZE, 4 * DIAGONAL_SIZE * i);
  												assemble(base, diagonalPatterns, diagonalEdges, DIAGONAL_SIZE, false, result);
  									}

  									return result;
  						}
  			}]);
  			return SMAAAreaImageData;
  }();

  var edges = new Map([[bilinear([0, 0, 0, 0]), [0, 0, 0, 0]], [bilinear([0, 0, 0, 1]), [0, 0, 0, 1]], [bilinear([0, 0, 1, 0]), [0, 0, 1, 0]], [bilinear([0, 0, 1, 1]), [0, 0, 1, 1]], [bilinear([0, 1, 0, 0]), [0, 1, 0, 0]], [bilinear([0, 1, 0, 1]), [0, 1, 0, 1]], [bilinear([0, 1, 1, 0]), [0, 1, 1, 0]], [bilinear([0, 1, 1, 1]), [0, 1, 1, 1]], [bilinear([1, 0, 0, 0]), [1, 0, 0, 0]], [bilinear([1, 0, 0, 1]), [1, 0, 0, 1]], [bilinear([1, 0, 1, 0]), [1, 0, 1, 0]], [bilinear([1, 0, 1, 1]), [1, 0, 1, 1]], [bilinear([1, 1, 0, 0]), [1, 1, 0, 0]], [bilinear([1, 1, 0, 1]), [1, 1, 0, 1]], [bilinear([1, 1, 1, 0]), [1, 1, 1, 0]], [bilinear([1, 1, 1, 1]), [1, 1, 1, 1]]]);

  function lerp$1(a, b, p) {

  	return a + (b - a) * p;
  }

  function bilinear(e) {

  	var a = lerp$1(e[0], e[1], 1.0 - 0.25);
  	var b = lerp$1(e[2], e[3], 1.0 - 0.25);

  	return lerp$1(a, b, 1.0 - 0.125);
  }

  function deltaLeft(left, top) {

  	var d = 0;

  	if (top[3] === 1) {

  		d += 1;
  	}

  	if (d === 1 && top[2] === 1 && left[1] !== 1 && left[3] !== 1) {

  		d += 1;
  	}

  	return d;
  }

  function deltaRight(left, top) {

  	var d = 0;

  	if (top[3] === 1 && left[1] !== 1 && left[3] !== 1) {

  		d += 1;
  	}

  	if (d === 1 && top[2] === 1 && left[0] !== 1 && left[2] !== 1) {

  		d += 1;
  	}

  	return d;
  }

  var SMAASearchImageData = function () {
  	function SMAASearchImageData() {
  		classCallCheck(this, SMAASearchImageData);
  	}

  	createClass(SMAASearchImageData, null, [{
  		key: "generate",
  		value: function generate() {

  			var width = 66;
  			var height = 33;

  			var croppedWidth = 64;
  			var croppedHeight = 16;

  			var data = new Uint8ClampedArray(width * height);
  			var croppedData = new Uint8ClampedArray(croppedWidth * croppedHeight);

  			var x = void 0,
  			    y = void 0;
  			var s = void 0,
  			    t = void 0,
  			    i = void 0;
  			var e1 = void 0,
  			    e2 = void 0;

  			for (y = 0; y < height; ++y) {

  				for (x = 0; x < width; ++x) {

  					s = 0.03125 * x;
  					t = 0.03125 * y;

  					if (edges.has(s) && edges.has(t)) {

  						e1 = edges.get(s);
  						e2 = edges.get(t);

  						data[y * width + x] = 127 * deltaLeft(e1, e2);
  						data[y * width + x + width / 2] = 127 * deltaRight(e1, e2);
  					}
  				}
  			}

  			for (i = 0, y = height - croppedHeight; y < height; ++y) {

  				for (x = 0; x < croppedWidth; ++x, ++i) {

  					croppedData[i] = data[y * width + x];
  				}
  			}

  			return new RawImageData(croppedWidth, croppedHeight, croppedData, 1);
  		}
  	}]);
  	return SMAASearchImageData;
  }();

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
  		classCallCheck(this, Vector3);


  		this.x = x;

  		this.y = y;

  		this.z = z;
  	}

  	createClass(Vector3, [{
  		key: "set",
  		value: function set$$1(x, y, z) {

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
  		value: function toArray$$1() {
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

  			var sinPhiRadius = Math.sin(s.phi) * s.radius;

  			this.x = sinPhiRadius * Math.sin(s.theta);
  			this.y = Math.cos(s.phi) * s.radius;
  			this.z = sinPhiRadius * Math.cos(s.theta);

  			return this;
  		}
  	}, {
  		key: "setFromCylindrical",
  		value: function setFromCylindrical(c) {

  			this.x = c.radius * Math.sin(c.theta);
  			this.y = c.y;
  			this.z = c.radius * Math.cos(c.theta);

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

  var v$1 = new Vector3();

  var Box3 = function () {
  	function Box3() {
  		var min = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : new Vector3(Infinity, Infinity, Infinity);
  		var max = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : new Vector3(-Infinity, -Infinity, -Infinity);
  		classCallCheck(this, Box3);


  		this.min = min;

  		this.max = max;
  	}

  	createClass(Box3, [{
  		key: "set",
  		value: function set$$1(min, max) {

  			this.min.copy(min);
  			this.max.copy(max);

  			return this;
  		}
  	}, {
  		key: "copy",
  		value: function copy(b) {

  			this.min.copy(b.min);
  			this.max.copy(b.max);

  			return this;
  		}
  	}, {
  		key: "clone",
  		value: function clone() {

  			return new this.constructor().copy(this);
  		}
  	}, {
  		key: "makeEmpty",
  		value: function makeEmpty() {

  			this.min.x = this.min.y = this.min.z = Infinity;
  			this.max.x = this.max.y = this.max.z = -Infinity;

  			return this;
  		}
  	}, {
  		key: "isEmpty",
  		value: function isEmpty() {

  			return this.max.x < this.min.x || this.max.y < this.min.y || this.max.z < this.min.z;
  		}
  	}, {
  		key: "getCenter",
  		value: function getCenter() {
  			var target = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : new Vector3();


  			return !this.isEmpty() ? target.addVectors(this.min, this.max).multiplyScalar(0.5) : target.set(0, 0, 0);
  		}
  	}, {
  		key: "getSize",
  		value: function getSize() {
  			var target = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : new Vector3();


  			return !this.isEmpty() ? target.subVectors(this.max, this.min) : target.set(0, 0, 0);
  		}
  	}, {
  		key: "setFromSphere",
  		value: function setFromSphere(sphere) {

  			this.set(sphere.center, sphere.center);
  			this.expandByScalar(sphere.radius);

  			return this;
  		}
  	}, {
  		key: "expandByPoint",
  		value: function expandByPoint(p) {

  			this.min.min(p);
  			this.max.max(p);

  			return this;
  		}
  	}, {
  		key: "expandByVector",
  		value: function expandByVector(v) {

  			this.min.sub(v);
  			this.max.add(v);

  			return this;
  		}
  	}, {
  		key: "expandByScalar",
  		value: function expandByScalar(s) {

  			this.min.addScalar(-s);
  			this.max.addScalar(s);

  			return this;
  		}
  	}, {
  		key: "setFromPoints",
  		value: function setFromPoints(points) {

  			var i = void 0,
  			    l = void 0;

  			this.min.set(0, 0, 0);
  			this.max.set(0, 0, 0);

  			for (i = 0, l = points.length; i < l; ++i) {

  				this.expandByPoint(points[i]);
  			}

  			return this;
  		}
  	}, {
  		key: "setFromCenterAndSize",
  		value: function setFromCenterAndSize(center, size) {

  			var halfSize = v$1.copy(size).multiplyScalar(0.5);

  			this.min.copy(center).sub(halfSize);
  			this.max.copy(center).add(halfSize);

  			return this;
  		}
  	}, {
  		key: "clampPoint",
  		value: function clampPoint(point) {
  			var target = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : new Vector3();


  			return target.copy(point).clamp(this.min, this.max);
  		}
  	}, {
  		key: "distanceToPoint",
  		value: function distanceToPoint(p) {

  			var clampedPoint = v$1.copy(p).clamp(this.min, this.max);

  			return clampedPoint.sub(p).length();
  		}
  	}, {
  		key: "applyMatrix4",
  		value: function applyMatrix4(matrix) {

  			var min = this.min;
  			var max = this.max;

  			if (!this.isEmpty()) {

  				var me = matrix.elements;

  				var xax = me[0] * min.x;
  				var xay = me[1] * min.x;
  				var xaz = me[2] * min.x;

  				var xbx = me[0] * max.x;
  				var xby = me[1] * max.x;
  				var xbz = me[2] * max.x;

  				var yax = me[4] * min.y;
  				var yay = me[5] * min.y;
  				var yaz = me[6] * min.y;

  				var ybx = me[4] * max.y;
  				var yby = me[5] * max.y;
  				var ybz = me[6] * max.y;

  				var zax = me[8] * min.z;
  				var zay = me[9] * min.z;
  				var zaz = me[10] * min.z;

  				var zbx = me[8] * max.z;
  				var zby = me[9] * max.z;
  				var zbz = me[10] * max.z;

  				min.x = Math.min(xax, xbx) + Math.min(yax, ybx) + Math.min(zax, zbx) + me[12];
  				min.y = Math.min(xay, xby) + Math.min(yay, yby) + Math.min(zay, zby) + me[13];
  				min.z = Math.min(xaz, xbz) + Math.min(yaz, ybz) + Math.min(zaz, zbz) + me[14];
  				max.x = Math.max(xax, xbx) + Math.max(yax, ybx) + Math.max(zax, zbx) + me[12];
  				max.y = Math.max(xay, xby) + Math.max(yay, yby) + Math.max(zay, zby) + me[13];
  				max.z = Math.max(xaz, xbz) + Math.max(yaz, ybz) + Math.max(zaz, zbz) + me[14];
  			}

  			return this;
  		}
  	}, {
  		key: "translate",
  		value: function translate(offset) {

  			this.min.add(offset);
  			this.max.add(offset);

  			return this;
  		}
  	}, {
  		key: "intersect",
  		value: function intersect(b) {

  			this.min.max(b.min);
  			this.max.min(b.max);

  			if (this.isEmpty()) {

  				this.makeEmpty();
  			}

  			return this;
  		}
  	}, {
  		key: "union",
  		value: function union(b) {

  			this.min.min(b.min);
  			this.max.max(b.max);

  			return this;
  		}
  	}, {
  		key: "containsPoint",
  		value: function containsPoint(p) {

  			var min = this.min;
  			var max = this.max;

  			return p.x >= min.x && p.y >= min.y && p.z >= min.z && p.x <= max.x && p.y <= max.y && p.z <= max.z;
  		}
  	}, {
  		key: "containsBox",
  		value: function containsBox(b) {

  			var tMin = this.min;
  			var tMax = this.max;
  			var bMin = b.min;
  			var bMax = b.max;

  			return tMin.x <= bMin.x && bMax.x <= tMax.x && tMin.y <= bMin.y && bMax.y <= tMax.y && tMin.z <= bMin.z && bMax.z <= tMax.z;
  		}
  	}, {
  		key: "intersectsBox",
  		value: function intersectsBox(b) {

  			var tMin = this.min;
  			var tMax = this.max;
  			var bMin = b.min;
  			var bMax = b.max;

  			return bMax.x >= tMin.x && bMax.y >= tMin.y && bMax.z >= tMin.z && bMin.x <= tMax.x && bMin.y <= tMax.y && bMin.z <= tMax.z;
  		}
  	}, {
  		key: "intersectsSphere",
  		value: function intersectsSphere(s) {
  			var closestPoint = this.clampPoint(s.center, v$1);

  			return closestPoint.distanceToSquared(s.center) <= s.radius * s.radius;
  		}
  	}, {
  		key: "intersectsPlane",
  		value: function intersectsPlane(p) {

  			var min = void 0,
  			    max = void 0;

  			if (p.normal.x > 0) {

  				min = p.normal.x * this.min.x;
  				max = p.normal.x * this.max.x;
  			} else {

  				min = p.normal.x * this.max.x;
  				max = p.normal.x * this.min.x;
  			}

  			if (p.normal.y > 0) {

  				min += p.normal.y * this.min.y;
  				max += p.normal.y * this.max.y;
  			} else {

  				min += p.normal.y * this.max.y;
  				max += p.normal.y * this.min.y;
  			}

  			if (p.normal.z > 0) {

  				min += p.normal.z * this.min.z;
  				max += p.normal.z * this.max.z;
  			} else {

  				min += p.normal.z * this.max.z;
  				max += p.normal.z * this.min.z;
  			}

  			return min <= p.constant && max >= p.constant;
  		}
  	}, {
  		key: "equals",
  		value: function equals(b) {

  			return b.min.equals(this.min) && b.max.equals(this.max);
  		}
  	}]);
  	return Box3;
  }();

  var box = new Box3();

  var v$2 = new Vector3();

  var Sphere = function () {
  	function Sphere() {
  		var center = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : new Vector3();
  		var radius = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  		classCallCheck(this, Sphere);


  		this.center = center;

  		this.radius = radius;
  	}

  	createClass(Sphere, [{
  		key: "set",
  		value: function set$$1(center, radius) {

  			this.center.copy(center);
  			this.radius = radius;

  			return this;
  		}
  	}, {
  		key: "copy",
  		value: function copy(s) {

  			this.center.copy(s.center);
  			this.radius = s.radius;

  			return this;
  		}
  	}, {
  		key: "clone",
  		value: function clone() {

  			return new this.constructor().copy(this);
  		}
  	}, {
  		key: "setFromPoints",
  		value: function setFromPoints(points) {
  			var center = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : box.setFromPoints(points).getCenter(this.center);


  			var maxRadiusSq = 0;
  			var i = void 0,
  			    l = void 0;

  			for (i = 0, l = points.length; i < l; ++i) {

  				maxRadiusSq = Math.max(maxRadiusSq, center.distanceToSquared(points[i]));
  			}

  			this.radius = Math.sqrt(maxRadiusSq);

  			return this;
  		}
  	}, {
  		key: "setFromBox",
  		value: function setFromBox(box) {

  			box.getCenter(this.center);
  			this.radius = box.getSize(v$2).length() * 0.5;

  			return this;
  		}
  	}, {
  		key: "isEmpty",
  		value: function isEmpty() {

  			return this.radius <= 0;
  		}
  	}, {
  		key: "translate",
  		value: function translate(offset) {

  			this.center.add(offset);

  			return this;
  		}
  	}, {
  		key: "clampPoint",
  		value: function clampPoint(p) {
  			var target = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : new Vector3();


  			var deltaLengthSq = this.center.distanceToSquared(p);

  			target.copy(p);

  			if (deltaLengthSq > this.radius * this.radius) {

  				target.sub(this.center).normalize();
  				target.multiplyScalar(this.radius).add(this.center);
  			}

  			return target;
  		}
  	}, {
  		key: "distanceToPoint",
  		value: function distanceToPoint(p) {

  			return p.distanceTo(this.center) - this.radius;
  		}
  	}, {
  		key: "containsPoint",
  		value: function containsPoint(p) {

  			return p.distanceToSquared(this.center) <= this.radius * this.radius;
  		}
  	}, {
  		key: "intersectsSphere",
  		value: function intersectsSphere(s) {

  			var radiusSum = this.radius + s.radius;

  			return s.center.distanceToSquared(this.center) <= radiusSum * radiusSum;
  		}
  	}, {
  		key: "intersectsBox",
  		value: function intersectsBox(b) {

  			return b.intersectsSphere(this);
  		}
  	}, {
  		key: "intersectsPlane",
  		value: function intersectsPlane(p) {

  			return Math.abs(p.distanceToPoint(this.center)) <= this.radius;
  		}
  	}, {
  		key: "equals",
  		value: function equals(s) {

  			return s.center.equals(this.center) && s.radius === this.radius;
  		}
  	}]);
  	return Sphere;
  }();

  var Vector2 = function () {
  	function Vector2() {
  		var x = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
  		var y = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  		classCallCheck(this, Vector2);


  		this.x = x;

  		this.y = y;
  	}

  	createClass(Vector2, [{
  		key: "set",
  		value: function set$$1(x, y) {

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
  		value: function toArray$$1() {
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
  		get: function get$$1() {

  			return this.x;
  		},
  		set: function set$$1(value) {

  			return this.x = value;
  		}
  	}, {
  		key: "height",
  		get: function get$$1() {

  			return this.y;
  		},
  		set: function set$$1(value) {

  			return this.y = value;
  		}
  	}]);
  	return Vector2;
  }();

  var v$3 = new Vector2();

  var Box2 = function () {
  	function Box2() {
  		var min = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : new Vector2(Infinity, Infinity);
  		var max = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : new Vector2(-Infinity, -Infinity);
  		classCallCheck(this, Box2);


  		this.min = min;

  		this.max = max;
  	}

  	createClass(Box2, [{
  		key: "set",
  		value: function set$$1(min, max) {

  			this.min.copy(min);
  			this.max.copy(max);

  			return this;
  		}
  	}, {
  		key: "copy",
  		value: function copy(b) {

  			this.min.copy(b.min);
  			this.max.copy(b.max);

  			return this;
  		}
  	}, {
  		key: "clone",
  		value: function clone() {

  			return new this.constructor().copy(this);
  		}
  	}, {
  		key: "makeEmpty",
  		value: function makeEmpty() {

  			this.min.x = this.min.y = Infinity;
  			this.max.x = this.max.y = -Infinity;

  			return this;
  		}
  	}, {
  		key: "isEmpty",
  		value: function isEmpty() {

  			return this.max.x < this.min.x || this.max.y < this.min.y;
  		}
  	}, {
  		key: "getCenter",
  		value: function getCenter() {
  			var target = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : new Vector2();


  			return !this.isEmpty() ? target.addVectors(this.min, this.max).multiplyScalar(0.5) : target.set(0, 0);
  		}
  	}, {
  		key: "getSize",
  		value: function getSize() {
  			var target = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : new Vector2();


  			return !this.isEmpty() ? target.subVectors(this.max, this.min) : target.set(0, 0);
  		}
  	}, {
  		key: "getBoundingSphere",
  		value: function getBoundingSphere() {
  			var target = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : new Sphere();


  			this.getCenter(target.center);

  			target.radius = this.getSize(v$3).length() * 0.5;

  			return target;
  		}
  	}, {
  		key: "expandByPoint",
  		value: function expandByPoint(p) {

  			this.min.min(p);
  			this.max.max(p);

  			return this;
  		}
  	}, {
  		key: "expandByVector",
  		value: function expandByVector(v) {

  			this.min.sub(v);
  			this.max.add(v);

  			return this;
  		}
  	}, {
  		key: "expandByScalar",
  		value: function expandByScalar(s) {

  			this.min.addScalar(-s);
  			this.max.addScalar(s);

  			return this;
  		}
  	}, {
  		key: "setFromPoints",
  		value: function setFromPoints(points) {

  			var i = void 0,
  			    l = void 0;

  			this.min.set(0, 0);
  			this.max.set(0, 0);

  			for (i = 0, l = points.length; i < l; ++i) {

  				this.expandByPoint(points[i]);
  			}

  			return this;
  		}
  	}, {
  		key: "setFromCenterAndSize",
  		value: function setFromCenterAndSize(center, size) {

  			var halfSize = v$3.copy(size).multiplyScalar(0.5);

  			this.min.copy(center).sub(halfSize);
  			this.max.copy(center).add(halfSize);

  			return this;
  		}
  	}, {
  		key: "clampPoint",
  		value: function clampPoint(point) {
  			var target = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : new Vector2();


  			return target.copy(point).clamp(this.min, this.max);
  		}
  	}, {
  		key: "distanceToPoint",
  		value: function distanceToPoint(p) {

  			var clampedPoint = v$3.copy(p).clamp(this.min, this.max);

  			return clampedPoint.sub(p).length();
  		}
  	}, {
  		key: "translate",
  		value: function translate(offset) {

  			this.min.add(offset);
  			this.max.add(offset);

  			return this;
  		}
  	}, {
  		key: "intersect",
  		value: function intersect(b) {

  			this.min.max(b.min);
  			this.max.min(b.max);

  			if (this.isEmpty()) {

  				this.makeEmpty();
  			}

  			return this;
  		}
  	}, {
  		key: "union",
  		value: function union(b) {

  			this.min.min(b.min);
  			this.max.max(b.max);

  			return this;
  		}
  	}, {
  		key: "containsPoint",
  		value: function containsPoint(p) {

  			var min = this.min;
  			var max = this.max;

  			return p.x >= min.x && p.y >= min.y && p.x <= max.x && p.y <= max.y;
  		}
  	}, {
  		key: "containsBox",
  		value: function containsBox(b) {

  			var tMin = this.min;
  			var tMax = this.max;
  			var bMin = b.min;
  			var bMax = b.max;

  			return tMin.x <= bMin.x && bMax.x <= tMax.x && tMin.y <= bMin.y && bMax.y <= tMax.y;
  		}
  	}, {
  		key: "intersectsBox",
  		value: function intersectsBox(b) {

  			var tMin = this.min;
  			var tMax = this.max;
  			var bMin = b.min;
  			var bMax = b.max;

  			return bMax.x >= tMin.x && bMax.y >= tMin.y && bMin.x <= tMax.x && bMin.y <= tMax.y;
  		}
  	}, {
  		key: "equals",
  		value: function equals(b) {

  			return b.min.equals(this.min) && b.max.equals(this.max);
  		}
  	}]);
  	return Box2;
  }();

  var Cylindrical = function () {
  	function Cylindrical() {
  		var radius = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
  		var theta = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  		var y = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
  		classCallCheck(this, Cylindrical);


  		this.radius = radius;

  		this.theta = theta;

  		this.y = y;
  	}

  	createClass(Cylindrical, [{
  		key: "set",
  		value: function set$$1(radius, theta, y) {

  			this.radius = radius;
  			this.theta = theta;
  			this.y = y;

  			return this;
  		}
  	}, {
  		key: "copy",
  		value: function copy(c) {

  			this.radius = c.radius;
  			this.theta = c.theta;
  			this.y = c.y;

  			return this;
  		}
  	}, {
  		key: "clone",
  		value: function clone() {

  			return new this.constructor().copy(this);
  		}
  	}, {
  		key: "setFromVector3",
  		value: function setFromVector3(v) {

  			this.radius = Math.sqrt(v.x * v.x + v.z * v.z);
  			this.theta = Math.atan2(v.x, v.z);
  			this.y = v.y;

  			return this;
  		}
  	}]);
  	return Cylindrical;
  }();

  var Matrix3 = function () {
  		function Matrix3() {
  				classCallCheck(this, Matrix3);


  				this.elements = new Float32Array([1, 0, 0, 0, 1, 0, 0, 0, 1]);
  		}

  		createClass(Matrix3, [{
  				key: "set",
  				value: function set$$1(m00, m01, m02, m10, m11, m12, m20, m21, m22) {

  						var te = this.elements;

  						te[0] = m00;te[3] = m01;te[6] = m02;
  						te[1] = m10;te[4] = m11;te[7] = m12;
  						te[2] = m20;te[5] = m21;te[8] = m22;

  						return this;
  				}
  		}, {
  				key: "identity",
  				value: function identity() {

  						this.set(1, 0, 0, 0, 1, 0, 0, 0, 1);

  						return this;
  				}
  		}, {
  				key: "copy",
  				value: function copy(matrix) {

  						var me = matrix.elements;
  						var te = this.elements;

  						te[0] = me[0];te[1] = me[1];te[2] = me[2];
  						te[3] = me[3];te[4] = me[4];te[5] = me[5];
  						te[6] = me[6];te[7] = me[7];te[8] = me[8];

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

  						var i = void 0;

  						for (i = 0; i < 9; ++i) {

  								te[i] = array[i + offset];
  						}

  						return this;
  				}
  		}, {
  				key: "toArray",
  				value: function toArray$$1() {
  						var array = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  						var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;


  						var te = this.elements;

  						var i = void 0;

  						for (i = 0; i < 9; ++i) {

  								array[i + offset] = te[i];
  						}

  						return array;
  				}
  		}, {
  				key: "multiplyMatrices",
  				value: function multiplyMatrices(a, b) {

  						var ae = a.elements;
  						var be = b.elements;
  						var te = this.elements;

  						var a11 = ae[0],
  						    a12 = ae[3],
  						    a13 = ae[6];
  						var a21 = ae[1],
  						    a22 = ae[4],
  						    a23 = ae[7];
  						var a31 = ae[2],
  						    a32 = ae[5],
  						    a33 = ae[8];

  						var b11 = be[0],
  						    b12 = be[3],
  						    b13 = be[6];
  						var b21 = be[1],
  						    b22 = be[4],
  						    b23 = be[7];
  						var b31 = be[2],
  						    b32 = be[5],
  						    b33 = be[8];

  						te[0] = a11 * b11 + a12 * b21 + a13 * b31;
  						te[3] = a11 * b12 + a12 * b22 + a13 * b32;
  						te[6] = a11 * b13 + a12 * b23 + a13 * b33;

  						te[1] = a21 * b11 + a22 * b21 + a23 * b31;
  						te[4] = a21 * b12 + a22 * b22 + a23 * b32;
  						te[7] = a21 * b13 + a22 * b23 + a23 * b33;

  						te[2] = a31 * b11 + a32 * b21 + a33 * b31;
  						te[5] = a31 * b12 + a32 * b22 + a33 * b32;
  						te[8] = a31 * b13 + a32 * b23 + a33 * b33;

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

  						te[0] *= s;te[3] *= s;te[6] *= s;
  						te[1] *= s;te[4] *= s;te[7] *= s;
  						te[2] *= s;te[5] *= s;te[8] *= s;

  						return this;
  				}
  		}, {
  				key: "determinant",
  				value: function determinant() {

  						var te = this.elements;

  						var a = te[0],
  						    b = te[1],
  						    c = te[2];
  						var d = te[3],
  						    e = te[4],
  						    f = te[5];
  						var g = te[6],
  						    h = te[7],
  						    i = te[8];

  						return a * e * i - a * f * h - b * d * i + b * f * g + c * d * h - c * e * g;
  				}
  		}, {
  				key: "getInverse",
  				value: function getInverse(matrix) {

  						var me = matrix.elements;
  						var te = this.elements;

  						var n11 = me[0],
  						    n21 = me[1],
  						    n31 = me[2];
  						var n12 = me[3],
  						    n22 = me[4],
  						    n32 = me[5];
  						var n13 = me[6],
  						    n23 = me[7],
  						    n33 = me[8];

  						var t11 = n33 * n22 - n32 * n23;
  						var t12 = n32 * n13 - n33 * n12;
  						var t13 = n23 * n12 - n22 * n13;

  						var det = n11 * t11 + n21 * t12 + n31 * t13;

  						var invDet = void 0;

  						if (det !== 0) {

  								invDet = 1.0 / det;

  								te[0] = t11 * invDet;
  								te[1] = (n31 * n23 - n33 * n21) * invDet;
  								te[2] = (n32 * n21 - n31 * n22) * invDet;

  								te[3] = t12 * invDet;
  								te[4] = (n33 * n11 - n31 * n13) * invDet;
  								te[5] = (n31 * n12 - n32 * n11) * invDet;

  								te[6] = t13 * invDet;
  								te[7] = (n21 * n13 - n23 * n11) * invDet;
  								te[8] = (n22 * n11 - n21 * n12) * invDet;
  						} else {

  								console.error("Can't invert matrix, determinant is zero", matrix);

  								this.identity();
  						}

  						return this;
  				}
  		}, {
  				key: "transpose",
  				value: function transpose() {

  						var me = this.elements;

  						var t = void 0;

  						t = me[1];me[1] = me[3];me[3] = t;
  						t = me[2];me[2] = me[6];me[6] = t;
  						t = me[5];me[5] = me[7];me[7] = t;

  						return this;
  				}
  		}, {
  				key: "scale",
  				value: function scale(sx, sy) {

  						var te = this.elements;

  						te[0] *= sx;te[3] *= sx;te[6] *= sx;
  						te[1] *= sy;te[4] *= sy;te[7] *= sy;

  						return this;
  				}
  		}, {
  				key: "rotate",
  				value: function rotate(theta) {

  						var c = Math.cos(theta);
  						var s = Math.sin(theta);

  						var te = this.elements;

  						var a11 = te[0],
  						    a12 = te[3],
  						    a13 = te[6];
  						var a21 = te[1],
  						    a22 = te[4],
  						    a23 = te[7];

  						te[0] = c * a11 + s * a21;
  						te[3] = c * a12 + s * a22;
  						te[6] = c * a13 + s * a23;

  						te[1] = -s * a11 + c * a21;
  						te[4] = -s * a12 + c * a22;
  						te[7] = -s * a13 + c * a23;

  						return this;
  				}
  		}, {
  				key: "translate",
  				value: function translate(tx, ty) {

  						var te = this.elements;

  						te[0] += tx * te[2];te[3] += tx * te[5];te[6] += tx * te[8];
  						te[1] += ty * te[2];te[4] += ty * te[5];te[7] += ty * te[8];

  						return this;
  				}
  		}, {
  				key: "equals",
  				value: function equals(m) {

  						var te = this.elements;
  						var me = m.elements;

  						var result = true;
  						var i = void 0;

  						for (i = 0; result && i < 9; ++i) {

  								if (te[i] !== me[i]) {

  										result = false;
  								}
  						}

  						return result;
  				}
  		}]);
  		return Matrix3;
  }();

  var RotationOrder = {

    XYZ: "XYZ",
    YZX: "YZX",
    ZXY: "ZXY",
    XZY: "XZY",
    YXZ: "YXZ",
    ZYX: "ZYX"

  };

  var v$4 = new Vector3();

  var Quaternion = function () {
  	function Quaternion() {
  		var x = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
  		var y = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  		var z = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
  		var w = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
  		classCallCheck(this, Quaternion);


  		this.x = x;

  		this.y = y;

  		this.z = z;

  		this.w = w;
  	}

  	createClass(Quaternion, [{
  		key: "set",
  		value: function set$$1(x, y, z, w) {

  			this.x = x;
  			this.y = y;
  			this.z = z;
  			this.w = w;

  			return this;
  		}
  	}, {
  		key: "copy",
  		value: function copy(q) {

  			this.x = q.x;
  			this.y = q.y;
  			this.z = q.z;
  			this.w = q.w;

  			return this;
  		}
  	}, {
  		key: "clone",
  		value: function clone() {

  			return new this.constructor(this.x, this.y, this.z, this.w);
  		}
  	}, {
  		key: "fromArray",
  		value: function fromArray(array) {
  			var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;


  			this.x = array[offset];
  			this.y = array[offset + 1];
  			this.z = array[offset + 2];
  			this.w = array[offset + 3];

  			return this;
  		}
  	}, {
  		key: "toArray",
  		value: function toArray$$1() {
  			var array = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  			var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;


  			array[offset] = this.x;
  			array[offset + 1] = this.y;
  			array[offset + 2] = this.z;
  			array[offset + 3] = this.w;

  			return array;
  		}
  	}, {
  		key: "setFromEuler",
  		value: function setFromEuler(euler) {

  			var x = euler.x;
  			var y = euler.y;
  			var z = euler.z;

  			var cos = Math.cos;
  			var sin = Math.sin;

  			var c1 = cos(x / 2);
  			var c2 = cos(y / 2);
  			var c3 = cos(z / 2);

  			var s1 = sin(x / 2);
  			var s2 = sin(y / 2);
  			var s3 = sin(z / 2);

  			switch (euler.order) {

  				case RotationOrder.XYZ:
  					this.x = s1 * c2 * c3 + c1 * s2 * s3;
  					this.y = c1 * s2 * c3 - s1 * c2 * s3;
  					this.z = c1 * c2 * s3 + s1 * s2 * c3;
  					this.w = c1 * c2 * c3 - s1 * s2 * s3;
  					break;

  				case RotationOrder.YXZ:
  					this.x = s1 * c2 * c3 + c1 * s2 * s3;
  					this.y = c1 * s2 * c3 - s1 * c2 * s3;
  					this.z = c1 * c2 * s3 - s1 * s2 * c3;
  					this.w = c1 * c2 * c3 + s1 * s2 * s3;
  					break;

  				case RotationOrder.ZXY:
  					this.x = s1 * c2 * c3 - c1 * s2 * s3;
  					this.y = c1 * s2 * c3 + s1 * c2 * s3;
  					this.z = c1 * c2 * s3 + s1 * s2 * c3;
  					this.w = c1 * c2 * c3 - s1 * s2 * s3;
  					break;

  				case RotationOrder.ZYX:
  					this.x = s1 * c2 * c3 - c1 * s2 * s3;
  					this.y = c1 * s2 * c3 + s1 * c2 * s3;
  					this.z = c1 * c2 * s3 - s1 * s2 * c3;
  					this.w = c1 * c2 * c3 + s1 * s2 * s3;
  					break;

  				case RotationOrder.YZX:
  					this.x = s1 * c2 * c3 + c1 * s2 * s3;
  					this.y = c1 * s2 * c3 + s1 * c2 * s3;
  					this.z = c1 * c2 * s3 - s1 * s2 * c3;
  					this.w = c1 * c2 * c3 - s1 * s2 * s3;
  					break;

  				case RotationOrder.XZY:
  					this.x = s1 * c2 * c3 - c1 * s2 * s3;
  					this.y = c1 * s2 * c3 - s1 * c2 * s3;
  					this.z = c1 * c2 * s3 + s1 * s2 * c3;
  					this.w = c1 * c2 * c3 + s1 * s2 * s3;
  					break;

  			}

  			return this;
  		}
  	}, {
  		key: "setFromAxisAngle",
  		value: function setFromAxisAngle(axis, angle) {

  			var halfAngle = angle / 2.0;
  			var s = Math.sin(halfAngle);

  			this.x = axis.x * s;
  			this.y = axis.y * s;
  			this.z = axis.z * s;
  			this.w = Math.cos(halfAngle);

  			return this;
  		}
  	}, {
  		key: "setFromRotationMatrix",
  		value: function setFromRotationMatrix(m) {

  			var te = m.elements;

  			var m00 = te[0],
  			    m01 = te[4],
  			    m02 = te[8];
  			var m10 = te[1],
  			    m11 = te[5],
  			    m12 = te[9];
  			var m20 = te[2],
  			    m21 = te[6],
  			    m22 = te[10];

  			var trace = m00 + m11 + m22;

  			var s = void 0;

  			if (trace > 0) {

  				s = 0.5 / Math.sqrt(trace + 1.0);

  				this.w = 0.25 / s;
  				this.x = (m21 - m12) * s;
  				this.y = (m02 - m20) * s;
  				this.z = (m10 - m01) * s;
  			} else if (m00 > m11 && m00 > m22) {

  				s = 2.0 * Math.sqrt(1.0 + m00 - m11 - m22);

  				this.w = (m21 - m12) / s;
  				this.x = 0.25 * s;
  				this.y = (m01 + m10) / s;
  				this.z = (m02 + m20) / s;
  			} else if (m11 > m22) {

  				s = 2.0 * Math.sqrt(1.0 + m11 - m00 - m22);

  				this.w = (m02 - m20) / s;
  				this.x = (m01 + m10) / s;
  				this.y = 0.25 * s;
  				this.z = (m12 + m21) / s;
  			} else {

  				s = 2.0 * Math.sqrt(1.0 + m22 - m00 - m11);

  				this.w = (m10 - m01) / s;
  				this.x = (m02 + m20) / s;
  				this.y = (m12 + m21) / s;
  				this.z = 0.25 * s;
  			}

  			return this;
  		}
  	}, {
  		key: "setFromUnitVectors",
  		value: function setFromUnitVectors(vFrom, vTo) {

  			var r = vFrom.dot(vTo) + 1;

  			if (r < 1e-6) {

  				r = 0;

  				if (Math.abs(vFrom.x) > Math.abs(vFrom.z)) {

  					v$4.set(-vFrom.y, vFrom.x, 0);
  				} else {

  					v$4.set(0, -vFrom.z, vFrom.y);
  				}
  			} else {

  				v$4.crossVectors(vFrom, vTo);
  			}

  			this.x = v$4.x;
  			this.y = v$4.y;
  			this.z = v$4.z;
  			this.w = r;

  			return this.normalize();
  		}
  	}, {
  		key: "angleTo",
  		value: function angleTo(q) {

  			return 2.0 * Math.acos(Math.abs(Math.min(Math.max(this.dot(q), -1.0), 1.0)));
  		}
  	}, {
  		key: "rotateTowards",
  		value: function rotateTowards(q, step) {

  			var angle = this.angleTo(q);

  			if (angle !== 0.0) {

  				this.slerp(q, Math.min(1.0, step / angle));
  			}

  			return this;
  		}
  	}, {
  		key: "invert",
  		value: function invert() {

  			return this.conjugate();
  		}
  	}, {
  		key: "conjugate",
  		value: function conjugate() {

  			this.x *= -1;
  			this.y *= -1;
  			this.z *= -1;

  			return this;
  		}
  	}, {
  		key: "lengthSquared",
  		value: function lengthSquared() {

  			return this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w;
  		}
  	}, {
  		key: "length",
  		value: function length() {

  			return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
  		}
  	}, {
  		key: "normalize",
  		value: function normalize() {

  			var l = this.length();

  			var invLength = void 0;

  			if (l === 0) {

  				this.x = 0;
  				this.y = 0;
  				this.z = 0;
  				this.w = 1;
  			} else {

  				invLength = 1.0 / l;

  				this.x = this.x * invLength;
  				this.y = this.y * invLength;
  				this.z = this.z * invLength;
  				this.w = this.w * invLength;
  			}

  			return this;
  		}
  	}, {
  		key: "dot",
  		value: function dot(v) {

  			return this.x * v.x + this.y * v.y + this.z * v.z + this.w * v.w;
  		}
  	}, {
  		key: "multiplyQuaternions",
  		value: function multiplyQuaternions(a, b) {

  			var qax = a.x,
  			    qay = a.y,
  			    qaz = a.z,
  			    qaw = a.w;
  			var qbx = b.x,
  			    qby = b.y,
  			    qbz = b.z,
  			    qbw = b.w;

  			this.x = qax * qbw + qaw * qbx + qay * qbz - qaz * qby;
  			this.y = qay * qbw + qaw * qby + qaz * qbx - qax * qbz;
  			this.z = qaz * qbw + qaw * qbz + qax * qby - qay * qbx;
  			this.w = qaw * qbw - qax * qbx - qay * qby - qaz * qbz;

  			return this;
  		}
  	}, {
  		key: "multiply",
  		value: function multiply(q) {

  			return this.multiplyQuaternions(this, q);
  		}
  	}, {
  		key: "premultiply",
  		value: function premultiply(q) {

  			return this.multiplyQuaternions(q, this);
  		}
  	}, {
  		key: "slerp",
  		value: function slerp(q, t) {

  			var x = this.x,
  			    y = this.y,
  			    z = this.z,
  			    w = this.w;

  			var cosHalfTheta = void 0,
  			    sinHalfThetaSquared = void 0,
  			    sinHalfTheta = void 0,
  			    halfTheta = void 0;
  			var s = void 0,
  			    ratioA = void 0,
  			    ratioB = void 0;

  			if (t === 1) {

  				this.copy(q);
  			} else if (t > 0) {

  				cosHalfTheta = w * q.w + x * q.x + y * q.y + z * q.z;

  				if (cosHalfTheta < 0.0) {

  					this.w = -q.w;
  					this.x = -q.x;
  					this.y = -q.y;
  					this.z = -q.z;

  					cosHalfTheta = -cosHalfTheta;
  				} else {

  					this.copy(q);
  				}

  				if (cosHalfTheta >= 1.0) {

  					this.w = w;
  					this.x = x;
  					this.y = y;
  					this.z = z;
  				} else {

  					sinHalfThetaSquared = 1.0 - cosHalfTheta * cosHalfTheta;
  					s = 1.0 - t;

  					if (sinHalfThetaSquared <= Number.EPSILON) {

  						this.w = s * w + t * this.w;
  						this.x = s * x + t * this.x;
  						this.y = s * y + t * this.y;
  						this.z = s * z + t * this.z;

  						this.normalize();
  					} else {

  						sinHalfTheta = Math.sqrt(sinHalfThetaSquared);
  						halfTheta = Math.atan2(sinHalfTheta, cosHalfTheta);
  						ratioA = Math.sin(s * halfTheta) / sinHalfTheta;
  						ratioB = Math.sin(t * halfTheta) / sinHalfTheta;

  						this.w = w * ratioA + this.w * ratioB;
  						this.x = x * ratioA + this.x * ratioB;
  						this.y = y * ratioA + this.y * ratioB;
  						this.z = z * ratioA + this.z * ratioB;
  					}
  				}
  			}

  			return this;
  		}
  	}, {
  		key: "equals",
  		value: function equals(q) {

  			return q.x === this.x && q.y === this.y && q.z === this.z && q.w === this.w;
  		}
  	}], [{
  		key: "slerp",
  		value: function slerp(qa, qb, qr, t) {

  			return qr.copy(qa).slerp(qb, t);
  		}
  	}, {
  		key: "slerpFlat",
  		value: function slerpFlat(dst, dstOffset, src0, srcOffset0, src1, srcOffset1, t) {

  			var x1 = src1[srcOffset1];
  			var y1 = src1[srcOffset1 + 1];
  			var z1 = src1[srcOffset1 + 2];
  			var w1 = src1[srcOffset1 + 3];

  			var x0 = src0[srcOffset0];
  			var y0 = src0[srcOffset0 + 1];
  			var z0 = src0[srcOffset0 + 2];
  			var w0 = src0[srcOffset0 + 3];

  			var s = void 0,
  			    f = void 0;
  			var sin = void 0,
  			    cos = void 0,
  			    sqrSin = void 0;
  			var dir = void 0,
  			    len = void 0,
  			    tDir = void 0;

  			if (w0 !== w1 || x0 !== x1 || y0 !== y1 || z0 !== z1) {

  				s = 1.0 - t;
  				cos = x0 * x1 + y0 * y1 + z0 * z1 + w0 * w1;

  				dir = cos >= 0 ? 1 : -1;
  				sqrSin = 1.0 - cos * cos;

  				if (sqrSin > Number.EPSILON) {

  					sin = Math.sqrt(sqrSin);
  					len = Math.atan2(sin, cos * dir);

  					s = Math.sin(s * len) / sin;
  					t = Math.sin(t * len) / sin;
  				}

  				tDir = t * dir;

  				x0 = x0 * s + x1 * tDir;
  				y0 = y0 * s + y1 * tDir;
  				z0 = z0 * s + z1 * tDir;
  				w0 = w0 * s + w1 * tDir;

  				if (s === 1.0 - t) {

  					f = 1.0 / Math.sqrt(x0 * x0 + y0 * y0 + z0 * z0 + w0 * w0);

  					x0 *= f;
  					y0 *= f;
  					z0 *= f;
  					w0 *= f;
  				}
  			}

  			dst[dstOffset] = x0;
  			dst[dstOffset + 1] = y0;
  			dst[dstOffset + 2] = z0;
  			dst[dstOffset + 3] = w0;
  		}
  	}]);
  	return Quaternion;
  }();

  function clamp$1(value, min, max) {

  	return Math.max(Math.min(value, max), min);
  }

  var m = new Matrix3();

  var q = new Quaternion();

  var Euler = function () {
  	function Euler() {
  		var x = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
  		var y = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  		var z = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
  		classCallCheck(this, Euler);


  		this.x = x;

  		this.y = y;

  		this.z = z;

  		this.order = Euler.defaultOrder;
  	}

  	createClass(Euler, [{
  		key: "set",
  		value: function set$$1(x, y, z, order) {

  			this.x = x;
  			this.y = y;
  			this.z = z;
  			this.order = order;

  			return this;
  		}
  	}, {
  		key: "copy",
  		value: function copy(e) {

  			this.x = e.x;
  			this.y = e.y;
  			this.z = e.z;
  			this.order = e.order;

  			return this;
  		}
  	}, {
  		key: "clone",
  		value: function clone() {

  			return new this.constructor(this.x, this.y, this.z, this.order);
  		}
  	}, {
  		key: "fromArray",
  		value: function fromArray(array) {
  			var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;


  			this.x = array[offset];
  			this.y = array[offset + 1];
  			this.z = array[offset + 2];
  			this.order = array[offset + 3];

  			return this;
  		}
  	}, {
  		key: "toArray",
  		value: function toArray$$1() {
  			var array = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  			var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;


  			array[offset] = this.x;
  			array[offset + 1] = this.y;
  			array[offset + 2] = this.z;
  			array[offset + 3] = this.order;

  			return array;
  		}
  	}, {
  		key: "toVector3",
  		value: function toVector3() {
  			var vector = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : new Vector3();


  			return vector.set(this.x, this.y, this.z);
  		}
  	}, {
  		key: "setFromRotationMatrix",
  		value: function setFromRotationMatrix(m) {
  			var order = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.order;


  			var te = m.elements;
  			var m00 = te[0],
  			    m01 = te[4],
  			    m02 = te[8];
  			var m10 = te[1],
  			    m11 = te[5],
  			    m12 = te[9];
  			var m20 = te[2],
  			    m21 = te[6],
  			    m22 = te[10];

  			var THRESHOLD = 1.0 - 1e-5;

  			switch (order) {

  				case RotationOrder.XYZ:
  					{

  						this.y = Math.asin(clamp$1(m02, -1, 1));

  						if (Math.abs(m02) < THRESHOLD) {

  							this.x = Math.atan2(-m12, m22);
  							this.z = Math.atan2(-m01, m00);
  						} else {

  							this.x = Math.atan2(m21, m11);
  							this.z = 0;
  						}

  						break;
  					}

  				case RotationOrder.YXZ:
  					{

  						this.x = Math.asin(-clamp$1(m12, -1, 1));

  						if (Math.abs(m12) < THRESHOLD) {

  							this.y = Math.atan2(m02, m22);
  							this.z = Math.atan2(m10, m11);
  						} else {

  							this.y = Math.atan2(-m20, m00);
  							this.z = 0;
  						}

  						break;
  					}

  				case RotationOrder.ZXY:
  					{

  						this.x = Math.asin(clamp$1(m21, -1, 1));

  						if (Math.abs(m21) < THRESHOLD) {

  							this.y = Math.atan2(-m20, m22);
  							this.z = Math.atan2(-m01, m11);
  						} else {

  							this.y = 0;
  							this.z = Math.atan2(m10, m00);
  						}

  						break;
  					}

  				case RotationOrder.ZYX:
  					{

  						this.y = Math.asin(-clamp$1(m20, -1, 1));

  						if (Math.abs(m20) < THRESHOLD) {

  							this.x = Math.atan2(m21, m22);
  							this.z = Math.atan2(m10, m00);
  						} else {

  							this.x = 0;
  							this.z = Math.atan2(-m01, m11);
  						}

  						break;
  					}

  				case RotationOrder.YZX:
  					{

  						this.z = Math.asin(clamp$1(m10, -1, 1));

  						if (Math.abs(m10) < THRESHOLD) {

  							this.x = Math.atan2(-m12, m11);
  							this.y = Math.atan2(-m20, m00);
  						} else {

  							this.x = 0;
  							this.y = Math.atan2(m02, m22);
  						}

  						break;
  					}

  				case RotationOrder.XZY:
  					{

  						this.z = Math.asin(-clamp$1(m01, -1, 1));

  						if (Math.abs(m01) < THRESHOLD) {

  							this.x = Math.atan2(m21, m11);
  							this.y = Math.atan2(m02, m00);
  						} else {

  							this.x = Math.atan2(-m12, m22);
  							this.y = 0;
  						}

  						break;
  					}

  			}

  			this.order = order;

  			return this;
  		}
  	}, {
  		key: "setFromQuaternion",
  		value: function setFromQuaternion(q, order) {

  			m.makeRotationFromQuaternion(q);

  			return this.setFromRotationMatrix(m, order);
  		}
  	}, {
  		key: "setFromVector3",
  		value: function setFromVector3(v) {
  			var order = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.order;


  			return this.set(v.x, v.y, v.z, order);
  		}
  	}, {
  		key: "reorder",
  		value: function reorder(newOrder) {

  			q.setFromEuler(this);

  			return this.setFromQuaternion(q, newOrder);
  		}
  	}, {
  		key: "equals",
  		value: function equals(e) {

  			return e.x === this.x && e.y === this.y && e.z === this.z && e.order === this.order;
  		}
  	}], [{
  		key: "defaultOrder",
  		get: function get$$1() {

  			return RotationOrder.XYZ;
  		}
  	}]);
  	return Euler;
  }();

  var a = new Vector3();

  var b = new Vector3();

  var Plane = function () {
  	function Plane() {
  		var normal = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : new Vector3(1, 0, 0);
  		var constant = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  		classCallCheck(this, Plane);


  		this.normal = normal;

  		this.constant = constant;
  	}

  	createClass(Plane, [{
  		key: "set",
  		value: function set$$1(normal, constant) {

  			this.normal.copy(normal);
  			this.constant = constant;

  			return this;
  		}
  	}, {
  		key: "setComponents",
  		value: function setComponents(x, y, z, w) {

  			this.normal.set(x, y, z);
  			this.constant = w;

  			return this;
  		}
  	}, {
  		key: "copy",
  		value: function copy(p) {

  			this.normal.copy(p.normal);
  			this.constant = p.constant;

  			return this;
  		}
  	}, {
  		key: "clone",
  		value: function clone() {

  			return new this.constructor().copy(this);
  		}
  	}, {
  		key: "setFromNormalAndCoplanarPoint",
  		value: function setFromNormalAndCoplanarPoint(n, p) {

  			this.normal.copy(n);
  			this.constant = -p.dot(this.normal);

  			return this;
  		}
  	}, {
  		key: "setFromCoplanarPoints",
  		value: function setFromCoplanarPoints(p0, p1, p2) {

  			var normal = a.subVectors(p2, p1).cross(b.subVectors(p0, p1)).normalize();

  			this.setFromNormalAndCoplanarPoint(normal, a);

  			return this;
  		}
  	}, {
  		key: "normalize",
  		value: function normalize() {

  			var inverseNormalLength = 1.0 / this.normal.length();

  			this.normal.multiplyScalar(inverseNormalLength);
  			this.constant *= inverseNormalLength;

  			return this;
  		}
  	}, {
  		key: "negate",
  		value: function negate() {

  			this.normal.negate();
  			this.constant = -this.constant;

  			return this;
  		}
  	}, {
  		key: "distanceToPoint",
  		value: function distanceToPoint(p) {

  			return this.normal.dot(p) + this.constant;
  		}
  	}, {
  		key: "distanceToSphere",
  		value: function distanceToSphere(s) {

  			return this.distanceToPoint(s.center) - s.radius;
  		}
  	}, {
  		key: "projectPoint",
  		value: function projectPoint(p, target) {

  			return target.copy(this.normal).multiplyScalar(-this.distanceToPoint(p)).add(p);
  		}
  	}, {
  		key: "coplanarPoint",
  		value: function coplanarPoint(target) {

  			return target.copy(this.normal).multiplyScalar(-this.constant);
  		}
  	}, {
  		key: "translate",
  		value: function translate(offset) {

  			this.constant -= offset.dot(this.normal);

  			return this;
  		}
  	}, {
  		key: "intersectLine",
  		value: function intersectLine(l, target) {

  			var direction = l.delta(a);
  			var denominator = this.normal.dot(direction);

  			if (denominator === 0) {
  				if (this.distanceToPoint(l.start) === 0) {

  					target.copy(l.start);
  				}
  			} else {

  				var t = -(l.start.dot(this.normal) + this.constant) / denominator;

  				if (t >= 0 && t <= 1) {

  					target.copy(direction).multiplyScalar(t).add(l.start);
  				}
  			}

  			return target;
  		}
  	}, {
  		key: "intersectsLine",
  		value: function intersectsLine(l) {

  			var startSign = this.distanceToPoint(l.start);
  			var endSign = this.distanceToPoint(l.end);

  			return startSign < 0 && endSign > 0 || endSign < 0 && startSign > 0;
  		}
  	}, {
  		key: "intersectsBox",
  		value: function intersectsBox(b) {

  			return b.intersectsPlane(this);
  		}
  	}, {
  		key: "intersectsSphere",
  		value: function intersectsSphere(s) {

  			return s.intersectsPlane(this);
  		}
  	}, {
  		key: "equals",
  		value: function equals(p) {

  			return p.normal.equals(this.normal) && p.constant === this.constant;
  		}
  	}]);
  	return Plane;
  }();

  var v$5 = new Vector3();

  var Frustum = function () {
  		function Frustum() {
  				var p0 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : new Plane();
  				var p1 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : new Plane();
  				var p2 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : new Plane();
  				var p3 = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : new Plane();
  				var p4 = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : new Plane();
  				var p5 = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : new Plane();
  				classCallCheck(this, Frustum);


  				this.planes = [p0, p1, p2, p3, p4, p5];
  		}

  		createClass(Frustum, [{
  				key: "set",
  				value: function set$$1(p0, p1, p2, p3, p4, p5) {

  						var planes = this.planes;

  						planes[0].copy(p0);
  						planes[1].copy(p1);
  						planes[2].copy(p2);
  						planes[3].copy(p3);
  						planes[4].copy(p4);
  						planes[5].copy(p5);

  						return this;
  				}
  		}, {
  				key: "clone",
  				value: function clone() {

  						return new this.constructor().copy(this);
  				}
  		}, {
  				key: "copy",
  				value: function copy(frustum) {

  						var planes = this.planes;

  						var i = void 0;

  						for (i = 0; i < 6; ++i) {

  								planes[i].copy(frustum.planes[i]);
  						}

  						return this;
  				}
  		}, {
  				key: "setFromMatrix",
  				value: function setFromMatrix(m) {

  						var planes = this.planes;

  						var me = m.elements;
  						var me0 = me[0],
  						    me1 = me[1],
  						    me2 = me[2],
  						    me3 = me[3];
  						var me4 = me[4],
  						    me5 = me[5],
  						    me6 = me[6],
  						    me7 = me[7];
  						var me8 = me[8],
  						    me9 = me[9],
  						    me10 = me[10],
  						    me11 = me[11];
  						var me12 = me[12],
  						    me13 = me[13],
  						    me14 = me[14],
  						    me15 = me[15];

  						planes[0].setComponents(me3 - me0, me7 - me4, me11 - me8, me15 - me12).normalize();
  						planes[1].setComponents(me3 + me0, me7 + me4, me11 + me8, me15 + me12).normalize();
  						planes[2].setComponents(me3 + me1, me7 + me5, me11 + me9, me15 + me13).normalize();
  						planes[3].setComponents(me3 - me1, me7 - me5, me11 - me9, me15 - me13).normalize();
  						planes[4].setComponents(me3 - me2, me7 - me6, me11 - me10, me15 - me14).normalize();
  						planes[5].setComponents(me3 + me2, me7 + me6, me11 + me10, me15 + me14).normalize();

  						return this;
  				}
  		}, {
  				key: "intersectsSphere",
  				value: function intersectsSphere(sphere) {

  						var planes = this.planes;
  						var center = sphere.center;
  						var negativeRadius = -sphere.radius;

  						var result = true;
  						var i = void 0,
  						    d = void 0;

  						for (i = 0; i < 6; ++i) {

  								d = planes[i].distanceToPoint(center);

  								if (d < negativeRadius) {

  										result = false;
  										break;
  								}
  						}

  						return result;
  				}
  		}, {
  				key: "intersectsBox",
  				value: function intersectsBox(box) {

  						var planes = this.planes;
  						var min = box.min,
  						    max = box.max;

  						var i = void 0,
  						    plane = void 0;

  						for (i = 0; i < 6; ++i) {

  								plane = planes[i];

  								v$5.x = plane.normal.x > 0.0 ? max.x : min.x;
  								v$5.y = plane.normal.y > 0.0 ? max.y : min.y;
  								v$5.z = plane.normal.z > 0.0 ? max.z : min.z;

  								if (plane.distanceToPoint(v$5) < 0.0) {

  										return false;
  								}
  						}

  						return true;
  				}
  		}, {
  				key: "containsPoint",
  				value: function containsPoint(point) {

  						var planes = this.planes;

  						var result = true;
  						var i = void 0;

  						for (i = 0; i < 6; ++i) {

  								if (planes[i].distanceToPoint(point) < 0) {

  										result = false;
  										break;
  								}
  						}

  						return result;
  				}
  		}]);
  		return Frustum;
  }();

  var a$1 = new Vector3();

  var b$1 = new Vector3();

  var Line3 = function () {
  	function Line3() {
  		var start = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : new Vector3();
  		var end = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : new Vector3();
  		classCallCheck(this, Line3);


  		this.start = start;

  		this.end = end;
  	}

  	createClass(Line3, [{
  		key: "set",
  		value: function set$$1(start, end) {

  			this.start.copy(start);
  			this.end.copy(end);

  			return this;
  		}
  	}, {
  		key: "copy",
  		value: function copy(l) {

  			this.start.copy(l.start);
  			this.end.copy(l.end);

  			return this;
  		}
  	}, {
  		key: "clone",
  		value: function clone() {

  			return new this.constructor().copy(this);
  		}
  	}, {
  		key: "getCenter",
  		value: function getCenter() {
  			var target = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : new Vector3();


  			return target.addVectors(this.start, this.end).multiplyScalar(0.5);
  		}
  	}, {
  		key: "delta",
  		value: function delta() {
  			var target = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : new Vector3();


  			return target.subVectors(this.end, this.start);
  		}
  	}, {
  		key: "lengthSquared",
  		value: function lengthSquared() {

  			return this.start.distanceToSquared(this.end);
  		}
  	}, {
  		key: "length",
  		value: function length() {

  			return this.start.distanceTo(this.end);
  		}
  	}, {
  		key: "at",
  		value: function at(d, target) {

  			return this.delta(target).multiplyScalar(d).add(this.start);
  		}
  	}, {
  		key: "closestPointToPointParameter",
  		value: function closestPointToPointParameter(p, clampToLine) {

  			a$1.subVectors(p, this.start);
  			b$1.subVectors(this.end, this.start);

  			var bb = b$1.dot(b$1);
  			var ba = b$1.dot(a$1);

  			var t = clampToLine ? Math.min(Math.max(ba / bb, 0), 1) : ba / bb;

  			return t;
  		}
  	}, {
  		key: "closestPointToPoint",
  		value: function closestPointToPoint(p) {
  			var clampToLine = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  			var target = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : new Vector3();


  			var t = this.closestPointToPointParameter(p, clampToLine);

  			return this.delta(target).multiplyScalar(t).add(this.start);
  		}
  	}, {
  		key: "equals",
  		value: function equals(l) {

  			return l.start.equals(this.start) && l.end.equals(this.end);
  		}
  	}]);
  	return Line3;
  }();

  var a$2 = new Vector3();

  var b$2 = new Vector3();

  var c = new Vector3();

  var Matrix4 = function () {
  		function Matrix4() {
  				classCallCheck(this, Matrix4);


  				this.elements = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
  		}

  		createClass(Matrix4, [{
  				key: "set",
  				value: function set$$1(n00, n01, n02, n03, n10, n11, n12, n13, n20, n21, n22, n23, n30, n31, n32, n33) {

  						var te = this.elements;

  						te[0] = n00;te[4] = n01;te[8] = n02;te[12] = n03;
  						te[1] = n10;te[5] = n11;te[9] = n12;te[13] = n13;
  						te[2] = n20;te[6] = n21;te[10] = n22;te[14] = n23;
  						te[3] = n30;te[7] = n31;te[11] = n32;te[15] = n33;

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

  						te[0] = me[0];te[1] = me[1];te[2] = me[2];te[3] = me[3];
  						te[4] = me[4];te[5] = me[5];te[6] = me[6];te[7] = me[7];
  						te[8] = me[8];te[9] = me[9];te[10] = me[10];te[11] = me[11];
  						te[12] = me[12];te[13] = me[13];te[14] = me[14];te[15] = me[15];

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

  						var i = void 0;

  						for (i = 0; i < 16; ++i) {

  								te[i] = array[i + offset];
  						}

  						return this;
  				}
  		}, {
  				key: "toArray",
  				value: function toArray$$1() {
  						var array = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  						var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;


  						var te = this.elements;

  						var i = void 0;

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

  						var ae = void 0,
  						    af = void 0,
  						    be = void 0,
  						    bf = void 0;
  						var ce = void 0,
  						    cf = void 0,
  						    de = void 0,
  						    df = void 0;
  						var ac = void 0,
  						    ad = void 0,
  						    bc = void 0,
  						    bd = void 0;

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

  						te[0] = x.x;te[4] = y.x;te[8] = z.x;
  						te[1] = x.y;te[5] = y.y;te[9] = z.y;
  						te[2] = x.z;te[6] = y.z;te[10] = z.z;

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

  						te[0] *= s;te[4] *= s;te[8] *= s;te[12] *= s;
  						te[1] *= s;te[5] *= s;te[9] *= s;te[13] *= s;
  						te[2] *= s;te[6] *= s;te[10] *= s;te[14] *= s;
  						te[3] *= s;te[7] *= s;te[11] *= s;te[15] *= s;

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

  						var invDet = void 0;

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

  						var t = void 0;

  						t = te[1];te[1] = te[4];te[4] = t;
  						t = te[2];te[2] = te[8];te[8] = t;
  						t = te[6];te[6] = te[9];te[9] = t;

  						t = te[3];te[3] = te[12];te[12] = t;
  						t = te[7];te[7] = te[13];te[13] = t;
  						t = te[11];te[11] = te[14];te[14] = t;

  						return this;
  				}
  		}, {
  				key: "scale",
  				value: function scale(sx, sy, sz) {

  						var te = this.elements;

  						te[0] *= sx;te[4] *= sy;te[8] *= sz;
  						te[1] *= sx;te[5] *= sy;te[9] *= sz;
  						te[2] *= sx;te[6] *= sy;te[10] *= sz;
  						te[3] *= sx;te[7] *= sy;te[11] *= sz;

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

  						te[0] *= invSX;te[1] *= invSX;te[2] *= invSX;
  						te[4] *= invSY;te[5] *= invSY;te[6] *= invSY;
  						te[8] *= invSZ;te[9] *= invSZ;te[10] *= invSZ;

  						quaternion.setFromRotationMatrix(this);

  						te[0] = n00;te[1] = n10;te[2] = n20;
  						te[4] = n01;te[5] = n11;te[6] = n21;
  						te[8] = n02;te[9] = n12;te[10] = n22;

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

  						te[0] = x;te[4] = 0;te[8] = a;te[12] = 0;
  						te[1] = 0;te[5] = y;te[9] = b;te[13] = 0;
  						te[2] = 0;te[6] = 0;te[10] = c;te[14] = d;
  						te[3] = 0;te[7] = 0;te[11] = -1;te[15] = 0;

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

  						te[0] = 2 * w;te[4] = 0;te[8] = 0;te[12] = -x;
  						te[1] = 0;te[5] = 2 * h;te[9] = 0;te[13] = -y;
  						te[2] = 0;te[6] = 0;te[10] = -2 * p;te[14] = -z;
  						te[3] = 0;te[7] = 0;te[11] = 0;te[15] = 1;

  						return this;
  				}
  		}, {
  				key: "equals",
  				value: function equals(m) {

  						var te = this.elements;
  						var me = m.elements;

  						var result = true;
  						var i = void 0;

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

  var v$6 = [new Vector3(), new Vector3(), new Vector3(), new Vector3()];

  var Ray = function () {
  	function Ray() {
  		var origin = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : new Vector3();
  		var direction = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : new Vector3();
  		classCallCheck(this, Ray);


  		this.origin = origin;

  		this.direction = direction;
  	}

  	createClass(Ray, [{
  		key: "set",
  		value: function set$$1(origin, direction) {

  			this.origin.copy(origin);
  			this.direction.copy(direction);

  			return this;
  		}
  	}, {
  		key: "copy",
  		value: function copy(r) {

  			this.origin.copy(r.origin);
  			this.direction.copy(r.direction);

  			return this;
  		}
  	}, {
  		key: "clone",
  		value: function clone() {

  			return new this.constructor().copy(this);
  		}
  	}, {
  		key: "at",
  		value: function at(t) {
  			var target = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : new Vector3();


  			return target.copy(this.direction).multiplyScalar(t).add(this.origin);
  		}
  	}, {
  		key: "lookAt",
  		value: function lookAt(target) {

  			this.direction.copy(target).sub(this.origin).normalize();

  			return this;
  		}
  	}, {
  		key: "recast",
  		value: function recast(t) {

  			this.origin.copy(this.at(t, v$6[0]));

  			return this;
  		}
  	}, {
  		key: "closestPointToPoint",
  		value: function closestPointToPoint(p) {
  			var target = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : new Vector3();


  			var directionDistance = target.subVectors(p, this.origin).dot(this.direction);

  			return directionDistance >= 0.0 ? target.copy(this.direction).multiplyScalar(directionDistance).add(this.origin) : target.copy(this.origin);
  		}
  	}, {
  		key: "distanceSquaredToPoint",
  		value: function distanceSquaredToPoint(p) {

  			var directionDistance = v$6[0].subVectors(p, this.origin).dot(this.direction);

  			return directionDistance < 0.0 ? this.origin.distanceToSquared(p) : v$6[0].copy(this.direction).multiplyScalar(directionDistance).add(this.origin).distanceToSquared(p);
  		}
  	}, {
  		key: "distanceToPoint",
  		value: function distanceToPoint(p) {

  			return Math.sqrt(this.distanceSquaredToPoint(p));
  		}
  	}, {
  		key: "distanceToPlane",
  		value: function distanceToPlane(p) {

  			var denominator = p.normal.dot(this.direction);

  			var t = denominator !== 0.0 ? -(this.origin.dot(p.normal) + p.constant) / denominator : p.distanceToPoint(this.origin) === 0.0 ? 0.0 : -1.0;

  			return t >= 0.0 ? t : null;
  		}
  	}, {
  		key: "distanceSquaredToSegment",
  		value: function distanceSquaredToSegment(v0, v1, pointOnRay, pointOnSegment) {

  			var segCenter = v$6[0].copy(v0).add(v1).multiplyScalar(0.5);
  			var segDir = v$6[1].copy(v1).sub(v0).normalize();
  			var diff = v$6[2].copy(this.origin).sub(segCenter);

  			var segExtent = v0.distanceTo(v1) * 0.5;
  			var a01 = -this.direction.dot(segDir);
  			var b0 = diff.dot(this.direction);
  			var b1 = -diff.dot(segDir);
  			var c = diff.lengthSq();
  			var det = Math.abs(1.0 - a01 * a01);

  			var s0 = void 0,
  			    s1 = void 0,
  			    extDet = void 0,
  			    invDet = void 0,
  			    sqrDist = void 0;

  			if (det > 0.0) {
  				s0 = a01 * b1 - b0;
  				s1 = a01 * b0 - b1;
  				extDet = segExtent * det;

  				if (s0 >= 0.0) {

  					if (s1 >= -extDet) {

  						if (s1 <= extDet) {
  							invDet = 1.0 / det;
  							s0 *= invDet;
  							s1 *= invDet;
  							sqrDist = s0 * (s0 + a01 * s1 + 2.0 * b0) + s1 * (a01 * s0 + s1 + 2.0 * b1) + c;
  						} else {
  							s1 = segExtent;
  							s0 = Math.max(0.0, -(a01 * s1 + b0));
  							sqrDist = -s0 * s0 + s1 * (s1 + 2.0 * b1) + c;
  						}
  					} else {
  						s1 = -segExtent;
  						s0 = Math.max(0.0, -(a01 * s1 + b0));
  						sqrDist = -s0 * s0 + s1 * (s1 + 2.0 * b1) + c;
  					}
  				} else {

  					if (s1 <= -extDet) {
  						s0 = Math.max(0.0, -(-a01 * segExtent + b0));
  						s1 = s0 > 0.0 ? -segExtent : Math.min(Math.max(-segExtent, -b1), segExtent);
  						sqrDist = -s0 * s0 + s1 * (s1 + 2.0 * b1) + c;
  					} else if (s1 <= extDet) {
  						s0 = 0.0;
  						s1 = Math.min(Math.max(-segExtent, -b1), segExtent);
  						sqrDist = s1 * (s1 + 2.0 * b1) + c;
  					} else {
  						s0 = Math.max(0.0, -(a01 * segExtent + b0));
  						s1 = s0 > 0.0 ? segExtent : Math.min(Math.max(-segExtent, -b1), segExtent);
  						sqrDist = -s0 * s0 + s1 * (s1 + 2.0 * b1) + c;
  					}
  				}
  			} else {
  				s1 = a01 > 0.0 ? -segExtent : segExtent;
  				s0 = Math.max(0.0, -(a01 * s1 + b0));
  				sqrDist = -s0 * s0 + s1 * (s1 + 2.0 * b1) + c;
  			}

  			if (pointOnRay !== undefined) {

  				pointOnRay.copy(this.direction).multiplyScalar(s0).add(this.origin);
  			}

  			if (pointOnSegment !== undefined) {

  				pointOnSegment.copy(segDir).multiplyScalar(s1).add(segCenter);
  			}

  			return sqrDist;
  		}
  	}, {
  		key: "intersectSphere",
  		value: function intersectSphere(s) {
  			var target = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : new Vector3();


  			var ab = v$6[0].subVectors(s.center, this.origin);
  			var tca = ab.dot(this.direction);
  			var d2 = ab.dot(ab) - tca * tca;
  			var radius2 = s.radius * s.radius;

  			var result = null;
  			var thc = void 0,
  			    t0 = void 0,
  			    t1 = void 0;

  			if (d2 <= radius2) {

  				thc = Math.sqrt(radius2 - d2);

  				t0 = tca - thc;

  				t1 = tca + thc;

  				if (t0 >= 0.0 || t1 >= 0.0) {
  					result = t0 < 0.0 ? this.at(t1, target) : this.at(t0, target);
  				}
  			}

  			return result;
  		}
  	}, {
  		key: "intersectsSphere",
  		value: function intersectsSphere(s) {

  			return this.distanceToPoint(s.center) <= s.radius;
  		}
  	}, {
  		key: "intersectPlane",
  		value: function intersectPlane(p) {
  			var target = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : new Vector3();


  			var t = this.distanceToPlane(p);

  			return t === null ? null : this.at(t, target);
  		}
  	}, {
  		key: "intersectsPlane",
  		value: function intersectsPlane(p) {

  			var distanceToPoint = p.distanceToPoint(this.origin);

  			return distanceToPoint === 0.0 || p.normal.dot(this.direction) * distanceToPoint < 0.0;
  		}
  	}, {
  		key: "intersectBox",
  		value: function intersectBox(b) {
  			var target = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : new Vector3();


  			var origin = this.origin;
  			var direction = this.direction;
  			var min = b.min;
  			var max = b.max;

  			var invDirX = 1.0 / direction.x;
  			var invDirY = 1.0 / direction.y;
  			var invDirZ = 1.0 / direction.z;

  			var result = null;
  			var tmin = void 0,
  			    tmax = void 0,
  			    tymin = void 0,
  			    tymax = void 0,
  			    tzmin = void 0,
  			    tzmax = void 0;

  			if (invDirX >= 0.0) {

  				tmin = (min.x - origin.x) * invDirX;
  				tmax = (max.x - origin.x) * invDirX;
  			} else {

  				tmin = (max.x - origin.x) * invDirX;
  				tmax = (min.x - origin.x) * invDirX;
  			}

  			if (invDirY >= 0.0) {

  				tymin = (min.y - origin.y) * invDirY;
  				tymax = (max.y - origin.y) * invDirY;
  			} else {

  				tymin = (max.y - origin.y) * invDirY;
  				tymax = (min.y - origin.y) * invDirY;
  			}

  			if (tmin <= tymax && tymin <= tmax) {
  				if (tymin > tmin || tmin !== tmin) {

  					tmin = tymin;
  				}

  				if (tymax < tmax || tmax !== tmax) {

  					tmax = tymax;
  				}

  				if (invDirZ >= 0.0) {

  					tzmin = (min.z - origin.z) * invDirZ;
  					tzmax = (max.z - origin.z) * invDirZ;
  				} else {

  					tzmin = (max.z - origin.z) * invDirZ;
  					tzmax = (min.z - origin.z) * invDirZ;
  				}

  				if (tmin <= tzmax && tzmin <= tmax) {

  					if (tzmin > tmin || tmin !== tmin) {

  						tmin = tzmin;
  					}

  					if (tzmax < tmax || tmax !== tmax) {

  						tmax = tzmax;
  					}

  					if (tmax >= 0.0) {

  						result = this.at(tmin >= 0.0 ? tmin : tmax, target);
  					}
  				}
  			}

  			return result;
  		}
  	}, {
  		key: "intersectsBox",
  		value: function intersectsBox(b) {

  			return this.intersectBox(b, v$6[0]) !== null;
  		}
  	}, {
  		key: "intersectTriangle",
  		value: function intersectTriangle(a, b, c, backfaceCulling, target) {

  			var direction = this.direction;

  			var diff = v$6[0];
  			var edge1 = v$6[1];
  			var edge2 = v$6[2];
  			var normal = v$6[3];

  			var result = null;
  			var DdN = void 0,
  			    sign = void 0,
  			    DdQxE2 = void 0,
  			    DdE1xQ = void 0,
  			    QdN = void 0;

  			edge1.subVectors(b, a);
  			edge2.subVectors(c, a);
  			normal.crossVectors(edge1, edge2);

  			DdN = direction.dot(normal);

  			if (DdN !== 0.0 && !(backfaceCulling && DdN > 0.0)) {

  				if (DdN > 0.0) {

  					sign = 1.0;
  				} else {

  					sign = -1.0;
  					DdN = -DdN;
  				}

  				diff.subVectors(this.origin, a);
  				DdQxE2 = sign * direction.dot(edge2.crossVectors(diff, edge2));

  				if (DdQxE2 >= 0.0) {

  					DdE1xQ = sign * direction.dot(edge1.cross(diff));

  					if (DdE1xQ >= 0.0 && DdQxE2 + DdE1xQ <= DdN) {
  						QdN = -sign * diff.dot(normal);

  						if (QdN >= 0.0) {
  							result = this.at(QdN / DdN, target);
  						}
  					}
  				}
  			}

  			return result;
  		}
  	}, {
  		key: "applyMatrix4",
  		value: function applyMatrix4(m) {

  			this.origin.applyMatrix4(m);
  			this.direction.transformDirection(m);

  			return this;
  		}
  	}, {
  		key: "equals",
  		value: function equals(r) {

  			return r.origin.equals(this.origin) && r.direction.equals(this.direction);
  		}
  	}]);
  	return Ray;
  }();

  var Spherical = function () {
  	function Spherical() {
  		var radius = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
  		var phi = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  		var theta = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
  		classCallCheck(this, Spherical);


  		this.radius = radius;

  		this.phi = phi;

  		this.theta = theta;
  	}

  	createClass(Spherical, [{
  		key: "set",
  		value: function set$$1(radius, phi, theta) {

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
  		key: "setFromVector3",
  		value: function setFromVector3(v) {

  			this.radius = v.length();

  			if (this.radius === 0) {

  				this.theta = 0;
  				this.phi = 0;
  			} else {
  				this.theta = Math.atan2(v.x, v.z);

  				this.phi = Math.acos(Math.min(Math.max(v.y / this.radius, -1), 1));
  			}

  			return this.makeSafe();
  		}
  	}, {
  		key: "makeSafe",
  		value: function makeSafe() {

  			this.phi = Math.max(1e-6, Math.min(Math.PI - 1e-6, this.phi));

  			return this;
  		}
  	}]);
  	return Spherical;
  }();

  var SymmetricMatrix3 = function () {
  	function SymmetricMatrix3() {
  		classCallCheck(this, SymmetricMatrix3);


  		this.elements = new Float32Array([1, 0, 0, 1, 0, 1]);
  	}

  	createClass(SymmetricMatrix3, [{
  		key: "set",
  		value: function set$$1(m00, m01, m02, m11, m12, m22) {

  			var e = this.elements;

  			e[0] = m00;
  			e[1] = m01;e[3] = m11;
  			e[2] = m02;e[4] = m12;e[5] = m22;

  			return this;
  		}
  	}, {
  		key: "identity",
  		value: function identity() {

  			this.set(1, 0, 0, 1, 0, 1);

  			return this;
  		}
  	}, {
  		key: "copy",
  		value: function copy(m) {

  			var me = m.elements;

  			this.set(me[0], me[1], me[2], me[3], me[4], me[5]);

  			return this;
  		}
  	}, {
  		key: "clone",
  		value: function clone() {

  			return new this.constructor().copy(this);
  		}
  	}, {
  		key: "toMatrix3",
  		value: function toMatrix3(m) {

  			var me = m.elements;

  			m.set(me[0], me[1], me[2], me[1], me[3], me[4], me[2], me[4], me[5]);
  		}
  	}, {
  		key: "add",
  		value: function add(m) {

  			var te = this.elements;
  			var me = m.elements;

  			te[0] += me[0];
  			te[1] += me[1];te[3] += me[3];
  			te[2] += me[2];te[4] += me[4];te[5] += me[5];

  			return this;
  		}
  	}, {
  		key: "norm",
  		value: function norm() {

  			var e = this.elements;

  			var m01m01 = e[1] * e[1];
  			var m02m02 = e[2] * e[2];
  			var m12m12 = e[4] * e[4];

  			return Math.sqrt(e[0] * e[0] + m01m01 + m02m02 + m01m01 + e[3] * e[3] + m12m12 + m02m02 + m12m12 + e[5] * e[5]);
  		}
  	}, {
  		key: "off",
  		value: function off() {

  			var e = this.elements;

  			return Math.sqrt(2 * (e[1] * e[1] + e[2] * e[2] + e[4] * e[4]));
  		}
  	}, {
  		key: "applyToVector3",
  		value: function applyToVector3(v) {

  			var x = v.x,
  			    y = v.y,
  			    z = v.z;
  			var e = this.elements;

  			v.x = e[0] * x + e[1] * y + e[2] * z;
  			v.y = e[1] * x + e[3] * y + e[4] * z;
  			v.z = e[2] * x + e[4] * y + e[5] * z;

  			return v;
  		}
  	}, {
  		key: "equals",
  		value: function equals(m) {

  			var te = this.elements;
  			var me = m.elements;

  			var result = true;
  			var i = void 0;

  			for (i = 0; result && i < 6; ++i) {

  				if (te[i] !== me[i]) {

  					result = false;
  				}
  			}

  			return result;
  		}
  	}], [{
  		key: "calculateIndex",
  		value: function calculateIndex(i, j) {

  			return 3 - (3 - i) * (2 - i) / 2 + j;
  		}
  	}]);
  	return SymmetricMatrix3;
  }();

  var Vector4 = function () {
  	function Vector4() {
  		var x = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
  		var y = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  		var z = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
  		var w = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
  		classCallCheck(this, Vector4);


  		this.x = x;

  		this.y = y;

  		this.z = z;

  		this.w = w;
  	}

  	createClass(Vector4, [{
  		key: "set",
  		value: function set$$1(x, y, z, w) {

  			this.x = x;
  			this.y = y;
  			this.z = z;
  			this.w = w;

  			return this;
  		}
  	}, {
  		key: "copy",
  		value: function copy(v) {

  			this.x = v.x;
  			this.y = v.y;
  			this.z = v.z;
  			this.w = v.w;

  			return this;
  		}
  	}, {
  		key: "clone",
  		value: function clone() {

  			return new this.constructor(this.x, this.y, this.z, this.w);
  		}
  	}, {
  		key: "fromArray",
  		value: function fromArray(array) {
  			var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;


  			this.x = array[offset];
  			this.y = array[offset + 1];
  			this.z = array[offset + 2];
  			this.w = array[offset + 3];

  			return this;
  		}
  	}, {
  		key: "toArray",
  		value: function toArray$$1() {
  			var array = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  			var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;


  			array[offset] = this.x;
  			array[offset + 1] = this.y;
  			array[offset + 2] = this.z;
  			array[offset + 3] = this.w;

  			return array;
  		}
  	}, {
  		key: "setAxisAngleFromQuaternion",
  		value: function setAxisAngleFromQuaternion(q) {

  			this.w = 2 * Math.acos(q.w);

  			var s = Math.sqrt(1 - q.w * q.w);

  			if (s < 1e-4) {

  				this.x = 1;
  				this.y = 0;
  				this.z = 0;
  			} else {

  				this.x = q.x / s;
  				this.y = q.y / s;
  				this.z = q.z / s;
  			}

  			return this;
  		}
  	}, {
  		key: "setAxisAngleFromRotationMatrix",
  		value: function setAxisAngleFromRotationMatrix(m) {
  			var E = 0.01;

  			var H = 0.1;

  			var me = m.elements;
  			var m00 = me[0],
  			    m01 = me[4],
  			    m02 = me[8];
  			var m10 = me[1],
  			    m11 = me[5],
  			    m12 = me[9];
  			var m20 = me[2],
  			    m21 = me[6],
  			    m22 = me[10];

  			var angle = void 0;
  			var x = void 0,
  			    y = void 0,
  			    z = void 0;
  			var xx = void 0,
  			    yy = void 0,
  			    zz = void 0;
  			var xy = void 0,
  			    xz = void 0,
  			    yz = void 0;
  			var s = void 0;

  			if (Math.abs(m01 - m10) < E && Math.abs(m02 - m20) < E && Math.abs(m12 - m21) < E) {
  				if (Math.abs(m01 + m10) < H && Math.abs(m02 + m20) < H && Math.abs(m12 + m21) < H && Math.abs(m00 + m11 + m22 - 3) < H) {
  					this.set(1, 0, 0, 0);
  				} else {
  					angle = Math.PI;

  					xx = (m00 + 1) / 2;
  					yy = (m11 + 1) / 2;
  					zz = (m22 + 1) / 2;
  					xy = (m01 + m10) / 4;
  					xz = (m02 + m20) / 4;
  					yz = (m12 + m21) / 4;

  					if (xx > yy && xx > zz) {
  						if (xx < E) {

  							x = 0;
  							y = 0.707106781;
  							z = 0.707106781;
  						} else {

  							x = Math.sqrt(xx);
  							y = xy / x;
  							z = xz / x;
  						}
  					} else if (yy > zz) {
  						if (yy < E) {

  							x = 0.707106781;
  							y = 0;
  							z = 0.707106781;
  						} else {

  							y = Math.sqrt(yy);
  							x = xy / y;
  							z = yz / y;
  						}
  					} else {
  						if (zz < E) {

  							x = 0.707106781;
  							y = 0.707106781;
  							z = 0;
  						} else {

  							z = Math.sqrt(zz);
  							x = xz / z;
  							y = yz / z;
  						}
  					}

  					this.set(x, y, z, angle);
  				}
  			} else {
  				s = Math.sqrt((m21 - m12) * (m21 - m12) + (m02 - m20) * (m02 - m20) + (m10 - m01) * (m10 - m01));

  				if (Math.abs(s) < 0.001) {

  					s = 1;
  				}

  				this.x = (m21 - m12) / s;
  				this.y = (m02 - m20) / s;
  				this.z = (m10 - m01) / s;
  				this.w = Math.acos((m00 + m11 + m22 - 1) / 2);
  			}

  			return this;
  		}
  	}, {
  		key: "add",
  		value: function add(v) {

  			this.x += v.x;
  			this.y += v.y;
  			this.z += v.z;
  			this.w += v.w;

  			return this;
  		}
  	}, {
  		key: "addScalar",
  		value: function addScalar(s) {

  			this.x += s;
  			this.y += s;
  			this.z += s;
  			this.w += s;

  			return this;
  		}
  	}, {
  		key: "addVectors",
  		value: function addVectors(a, b) {

  			this.x = a.x + b.x;
  			this.y = a.y + b.y;
  			this.z = a.z + b.z;
  			this.w = a.w + b.w;

  			return this;
  		}
  	}, {
  		key: "addScaledVector",
  		value: function addScaledVector(v, s) {

  			this.x += v.x * s;
  			this.y += v.y * s;
  			this.z += v.z * s;
  			this.w += v.w * s;

  			return this;
  		}
  	}, {
  		key: "sub",
  		value: function sub(v) {

  			this.x -= v.x;
  			this.y -= v.y;
  			this.z -= v.z;
  			this.w -= v.w;

  			return this;
  		}
  	}, {
  		key: "subScalar",
  		value: function subScalar(s) {

  			this.x -= s;
  			this.y -= s;
  			this.z -= s;
  			this.w -= s;

  			return this;
  		}
  	}, {
  		key: "subVectors",
  		value: function subVectors(a, b) {

  			this.x = a.x - b.x;
  			this.y = a.y - b.y;
  			this.z = a.z - b.z;
  			this.w = a.w - b.w;

  			return this;
  		}
  	}, {
  		key: "multiply",
  		value: function multiply(v) {

  			this.x *= v.x;
  			this.y *= v.y;
  			this.z *= v.z;
  			this.w *= v.w;

  			return this;
  		}
  	}, {
  		key: "multiplyScalar",
  		value: function multiplyScalar(s) {

  			this.x *= s;
  			this.y *= s;
  			this.z *= s;
  			this.w *= s;

  			return this;
  		}
  	}, {
  		key: "multiplyVectors",
  		value: function multiplyVectors(a, b) {

  			this.x = a.x * b.x;
  			this.y = a.y * b.y;
  			this.z = a.z * b.z;
  			this.w = a.w * b.w;

  			return this;
  		}
  	}, {
  		key: "divide",
  		value: function divide(v) {

  			this.x /= v.x;
  			this.y /= v.y;
  			this.z /= v.z;
  			this.w /= v.w;

  			return this;
  		}
  	}, {
  		key: "divideScalar",
  		value: function divideScalar(s) {

  			this.x /= s;
  			this.y /= s;
  			this.z /= s;
  			this.w /= s;

  			return this;
  		}
  	}, {
  		key: "applyMatrix4",
  		value: function applyMatrix4(m) {

  			var x = this.x,
  			    y = this.y,
  			    z = this.z,
  			    w = this.w;
  			var e = m.elements;

  			this.x = e[0] * x + e[4] * y + e[8] * z + e[12] * w;
  			this.y = e[1] * x + e[5] * y + e[9] * z + e[13] * w;
  			this.z = e[2] * x + e[6] * y + e[10] * z + e[14] * w;
  			this.w = e[3] * x + e[7] * y + e[11] * z + e[15] * w;

  			return this;
  		}
  	}, {
  		key: "negate",
  		value: function negate() {

  			this.x = -this.x;
  			this.y = -this.y;
  			this.z = -this.z;
  			this.w = -this.w;

  			return this;
  		}
  	}, {
  		key: "dot",
  		value: function dot(v) {

  			return this.x * v.x + this.y * v.y + this.z * v.z + this.w * v.w;
  		}
  	}, {
  		key: "manhattanLength",
  		value: function manhattanLength() {

  			return Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z) + Math.abs(this.w);
  		}
  	}, {
  		key: "lengthSquared",
  		value: function lengthSquared() {

  			return this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w;
  		}
  	}, {
  		key: "length",
  		value: function length() {

  			return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
  		}
  	}, {
  		key: "manhattanDistanceTo",
  		value: function manhattanDistanceTo(v) {

  			return Math.abs(this.x - v.x) + Math.abs(this.y - v.y) + Math.abs(this.z - v.z) + Math.abs(this.w - v.w);
  		}
  	}, {
  		key: "distanceToSquared",
  		value: function distanceToSquared(v) {

  			var dx = this.x - v.x;
  			var dy = this.y - v.y;
  			var dz = this.z - v.z;
  			var dw = this.w - v.w;

  			return dx * dx + dy * dy + dz * dz + dw * dw;
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
  			this.w = Math.min(this.w, v.w);

  			return this;
  		}
  	}, {
  		key: "max",
  		value: function max(v) {

  			this.x = Math.max(this.x, v.x);
  			this.y = Math.max(this.y, v.y);
  			this.z = Math.max(this.z, v.z);
  			this.w = Math.max(this.w, v.w);

  			return this;
  		}
  	}, {
  		key: "clamp",
  		value: function clamp(min, max) {

  			this.x = Math.max(min.x, Math.min(max.x, this.x));
  			this.y = Math.max(min.y, Math.min(max.y, this.y));
  			this.z = Math.max(min.z, Math.min(max.z, this.z));
  			this.w = Math.max(min.w, Math.min(max.w, this.w));

  			return this;
  		}
  	}, {
  		key: "floor",
  		value: function floor() {

  			this.x = Math.floor(this.x);
  			this.y = Math.floor(this.y);
  			this.z = Math.floor(this.z);
  			this.w = Math.floor(this.w);

  			return this;
  		}
  	}, {
  		key: "ceil",
  		value: function ceil() {

  			this.x = Math.ceil(this.x);
  			this.y = Math.ceil(this.y);
  			this.z = Math.ceil(this.z);
  			this.w = Math.ceil(this.w);

  			return this;
  		}
  	}, {
  		key: "round",
  		value: function round() {

  			this.x = Math.round(this.x);
  			this.y = Math.round(this.y);
  			this.z = Math.round(this.z);
  			this.w = Math.round(this.w);

  			return this;
  		}
  	}, {
  		key: "lerp",
  		value: function lerp(v, alpha) {

  			this.x += (v.x - this.x) * alpha;
  			this.y += (v.y - this.y) * alpha;
  			this.z += (v.z - this.z) * alpha;
  			this.w += (v.w - this.w) * alpha;

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

  			return v.x === this.x && v.y === this.y && v.z === this.z && v.w === this.w;
  		}
  	}]);
  	return Vector4;
  }();

  var PointerButton = {

    MAIN: 0,
    AUXILIARY: 1,
    SECONDARY: 2

  };

  var TWO_PI = Math.PI * 2;

  var v$7 = new Vector3();

  var m$1 = new Matrix4();

  var RotationManager = function () {
  		function RotationManager(position, quaternion, target, settings) {
  				classCallCheck(this, RotationManager);


  				this.position = position;

  				this.quaternion = quaternion;

  				this.target = target;

  				this.settings = settings;

  				this.spherical = new Spherical();
  		}

  		createClass(RotationManager, [{
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

  								m$1.lookAt(v$7.subVectors(this.position, this.target), rotation.pivotOffset, rotation.up);
  						} else {

  								m$1.lookAt(v$7.set(0, 0, 0), this.target.setFromSpherical(this.spherical), rotation.up);
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

  						var amount = void 0,
  						    min = void 0,
  						    max = void 0;

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

  								v$7.subVectors(position, target);
  						} else {

  								v$7.subVectors(target, position).normalize();
  						}

  						spherical.setFromVector3(v$7);
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
  				classCallCheck(this, MovementState);


  				this.left = false;

  				this.right = false;

  				this.forward = false;

  				this.backward = false;

  				this.up = false;

  				this.down = false;
  		}

  		createClass(MovementState, [{
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

  var v$8 = new Vector3();

  var TranslationManager = function () {
  		function TranslationManager(position, quaternion, target, settings) {
  				classCallCheck(this, TranslationManager);


  				this.position = position;

  				this.quaternion = quaternion;

  				this.target = target;

  				this.settings = settings;

  				this.movementState = new MovementState();
  		}

  		createClass(TranslationManager, [{
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

  						v$8.copy(axis).applyQuaternion(this.quaternion).multiplyScalar(distance);

  						this.position.add(v$8);

  						if (this.settings.general.orbit) {

  								this.target.add(v$8);
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
  		classCallCheck(this, GeneralSettings);


  		this.orbit = true;
  	}

  	createClass(GeneralSettings, [{
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
  		classCallCheck(this, KeyBindings);


  		this.defaultActions = new Map();

  		this.actions = new Map();
  	}

  	createClass(KeyBindings, [{
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
  		value: function get$$1(keyCode) {

  			return this.actions.get(keyCode);
  		}
  	}, {
  		key: "set",
  		value: function set$$1(keyCode, action) {

  			this.actions.set(keyCode, action);

  			return this;
  		}
  	}, {
  		key: "delete",
  		value: function _delete(keyCode) {

  			return this.actions.delete(keyCode);
  		}
  	}, {
  		key: "toJSON",
  		value: function toJSON() {

  			return {
  				defaultActions: [].concat(toConsumableArray(this.defaultActions)),
  				actions: [].concat(toConsumableArray(this.actions))
  			};
  		}
  	}]);
  	return KeyBindings;
  }();

  var PointerSettings = function () {
  	function PointerSettings() {
  		classCallCheck(this, PointerSettings);


  		this.hold = false;

  		this.lock = true;
  	}

  	createClass(PointerSettings, [{
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
  				classCallCheck(this, RotationSettings);


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

  		createClass(RotationSettings, [{
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
  		classCallCheck(this, SensitivitySettings);


  		this.rotation = 0.0025;

  		this.translation = 1.0;

  		this.zoom = 0.1;
  	}

  	createClass(SensitivitySettings, [{
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
  		classCallCheck(this, TranslationSettings);


  		this.enabled = true;
  	}

  	createClass(TranslationSettings, [{
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
  				classCallCheck(this, ZoomSettings);


  				this.enabled = true;

  				this.invert = false;

  				this.minDistance = 1e-6;

  				this.maxDistance = Infinity;
  		}

  		createClass(ZoomSettings, [{
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
  				classCallCheck(this, Settings);


  				this.general = new GeneralSettings();

  				this.keyBindings = new KeyBindings();
  				this.keyBindings.setDefault(new Map([[KeyCode.W, Action.MOVE_FORWARD], [KeyCode.UP, Action.MOVE_FORWARD], [KeyCode.A, Action.MOVE_LEFT], [KeyCode.LEFT, Action.MOVE_LEFT], [KeyCode.S, Action.MOVE_BACKWARD], [KeyCode.DOWN, Action.MOVE_BACKWARD], [KeyCode.D, Action.MOVE_RIGHT], [KeyCode.RIGHT, Action.MOVE_RIGHT], [KeyCode.X, Action.MOVE_DOWN], [KeyCode.SPACE, Action.MOVE_UP], [KeyCode.PAGE_DOWN, Action.ZOOM_OUT], [KeyCode.PAGE_UP, Action.ZOOM_IN]]));

  				this.pointer = new PointerSettings();

  				this.rotation = new RotationSettings();

  				this.sensitivity = new SensitivitySettings();

  				this.translation = new TranslationSettings();

  				this.zoom = new ZoomSettings();
  		}

  		createClass(Settings, [{
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

  						return URL.createObjectURL(new Blob([JSON.stringify(this)], { type: "text/json" }));
  				}
  		}]);
  		return Settings;
  }();

  var Strategy = function () {
  	function Strategy() {
  		classCallCheck(this, Strategy);
  	}

  	createClass(Strategy, [{
  		key: "execute",
  		value: function execute(flag) {

  			throw new Error("Strategy#execute method not implemented!");
  		}
  	}]);
  	return Strategy;
  }();

  var MovementStrategy = function (_Strategy) {
  	inherits(MovementStrategy, _Strategy);

  	function MovementStrategy(movementState, direction) {
  		classCallCheck(this, MovementStrategy);

  		var _this = possibleConstructorReturn(this, (MovementStrategy.__proto__ || Object.getPrototypeOf(MovementStrategy)).call(this));

  		_this.movementState = movementState;

  		_this.direction = direction;

  		return _this;
  	}

  	createClass(MovementStrategy, [{
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

  var ZoomStrategy = function (_Strategy) {
  		inherits(ZoomStrategy, _Strategy);

  		function ZoomStrategy(rotationManager, zoomIn) {
  				classCallCheck(this, ZoomStrategy);

  				var _this = possibleConstructorReturn(this, (ZoomStrategy.__proto__ || Object.getPrototypeOf(ZoomStrategy)).call(this));

  				_this.rotationManager = rotationManager;

  				_this.zoomIn = zoomIn;

  				return _this;
  		}

  		createClass(ZoomStrategy, [{
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
  		classCallCheck(this, DeltaControls);


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

  	createClass(DeltaControls, [{
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

  			var movementX = void 0,
  			    movementY = void 0;

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
  	inherits(PostProcessingDemo, _Demo);

  	function PostProcessingDemo(id, composer) {
  		classCallCheck(this, PostProcessingDemo);

  		var _this = possibleConstructorReturn(this, (PostProcessingDemo.__proto__ || Object.getPrototypeOf(PostProcessingDemo)).call(this, id, composer));

  		_this.composer = composer;

  		_this.renderPass = new RenderPass(_this.scene, null);
  		_this.renderPass.renderToScreen = true;

  		return _this;
  	}

  	createClass(PostProcessingDemo, [{
  		key: "render",
  		value: function render(delta) {
  			this.composer.render(delta);
  		}
  	}, {
  		key: "reset",
  		value: function reset() {

  			get(PostProcessingDemo.prototype.__proto__ || Object.getPrototypeOf(PostProcessingDemo.prototype), "reset", this).call(this);

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
  		inherits(BloomDemo, _PostProcessingDemo);

  		function BloomDemo(composer) {
  				classCallCheck(this, BloomDemo);

  				var _this = possibleConstructorReturn(this, (BloomDemo.__proto__ || Object.getPrototypeOf(BloomDemo)).call(this, "bloom", composer));

  				_this.bloomPass = null;

  				_this.texturePass = null;

  				_this.object = null;

  				return _this;
  		}

  		createClass(BloomDemo, [{
  				key: "load",
  				value: function load() {

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
  						var material = void 0;
  						var i = void 0,
  						    mesh = void 0;

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
  						var o0 = void 0,
  						    o1 = void 0,
  						    o2 = void 0;

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

  						this.renderPass.renderToScreen = false;

  						var bloomPass = new BloomPass({
  								resolutionScale: 0.5,
  								intensity: 2.0,
  								distinction: 4.0
  						});

  						bloomPass.renderToScreen = true;
  						this.bloomPass = bloomPass;
  						composer.addPass(bloomPass);

  						var texturePass = new TexturePass(bloomPass.overlay);
  						texturePass.renderToScreen = true;
  						texturePass.enabled = false;
  						texturePass.opacityDestination = 0.0;
  						this.texturePass = texturePass;
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

  						get(BloomDemo.prototype.__proto__ || Object.getPrototypeOf(BloomDemo.prototype), "render", this).call(this, delta);
  				}
  		}, {
  				key: "registerOptions",
  				value: function registerOptions(menu) {

  						var pass = this.bloomPass;
  						var texturePass = this.texturePass;

  						var params = {
  								"resolution": pass.getResolutionScale(),
  								"kernel size": pass.kernelSize,
  								"blend mode": "screen"
  						};

  						menu.add(params, "resolution").min(0.0).max(1.0).step(0.01).onChange(function () {

  								pass.setResolutionScale(params.resolution);
  						});

  						menu.add(params, "kernel size").min(KernelSize.VERY_SMALL).max(KernelSize.HUGE).step(1).onChange(function () {

  								pass.kernelSize = params["kernel size"];
  						});

  						menu.add(pass, "intensity").min(0.0).max(4.0).step(0.01).onChange(function () {

  								texturePass.opacitySource = pass.intensity;
  						});

  						var folder = menu.addFolder("Luminance");
  						folder.add(pass, "distinction").min(1.0).max(10.0).step(0.1);
  						folder.open();

  						menu.add(pass, "blend").onChange(function () {

  								pass.renderToScreen = pass.blend;
  								texturePass.enabled = !pass.blend;
  						});

  						menu.add(pass, "dithering");

  						menu.add(params, "blend mode", ["add", "screen"]).onChange(function () {

  								pass.combineMaterial.setScreenModeEnabled(params["blend mode"] !== "add");
  						});
  				}
  		}]);
  		return BloomDemo;
  }(PostProcessingDemo);

  var BokehDemo = function (_PostProcessingDemo) {
  		inherits(BokehDemo, _PostProcessingDemo);

  		function BokehDemo(composer) {
  				classCallCheck(this, BokehDemo);

  				var _this = possibleConstructorReturn(this, (BokehDemo.__proto__ || Object.getPrototypeOf(BokehDemo)).call(this, "bokeh", composer));

  				_this.bokehPass = null;

  				return _this;
  		}

  		createClass(BokehDemo, [{
  				key: "load",
  				value: function load() {

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

  						var pass = new BokehPass(camera, {
  								focus: 0.32,
  								dof: 0.02,
  								aperture: 0.015,
  								maxBlur: 0.025
  						});

  						this.renderPass.renderToScreen = false;
  						pass.renderToScreen = true;
  						this.bokehPass = pass;
  						composer.addPass(pass);
  				}
  		}, {
  				key: "registerOptions",
  				value: function registerOptions(menu) {

  						var material = this.bokehPass.getFullscreenMaterial();

  						var params = {
  								"focus": material.uniforms.focus.value,
  								"dof": material.uniforms.dof.value,
  								"aperture": material.uniforms.aperture.value,
  								"blur": material.uniforms.maxBlur.value
  						};

  						menu.add(params, "focus").min(0.0).max(1.0).step(0.001).onChange(function () {

  								material.uniforms.focus.value = params.focus;
  						});

  						menu.add(params, "dof").min(0.0).max(1.0).step(0.001).onChange(function () {

  								material.uniforms.dof.value = params.dof;
  						});

  						menu.add(params, "aperture").min(0.0).max(0.05).step(0.0001).onChange(function () {

  								material.uniforms.aperture.value = params.aperture;
  						});

  						menu.add(params, "blur").min(0.0).max(0.1).step(0.001).onChange(function () {

  								material.uniforms.maxBlur.value = params.blur;
  						});
  				}
  		}]);
  		return BokehDemo;
  }(PostProcessingDemo);

  var RealisticBokehDemo = function (_PostProcessingDemo) {
  		inherits(RealisticBokehDemo, _PostProcessingDemo);

  		function RealisticBokehDemo(composer) {
  				classCallCheck(this, RealisticBokehDemo);

  				var _this = possibleConstructorReturn(this, (RealisticBokehDemo.__proto__ || Object.getPrototypeOf(RealisticBokehDemo)).call(this, "realistic-bokeh", composer));

  				_this.bokehPass = null;

  				return _this;
  		}

  		createClass(RealisticBokehDemo, [{
  				key: "load",
  				value: function load() {

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

  						var camera = new three.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.01, 50);
  						camera.position.set(3, 1, 3);
  						camera.lookAt(scene.position);
  						this.camera = camera;

  						var controls = new DeltaControls(camera.position, camera.quaternion, renderer.domElement);
  						controls.settings.pointer.lock = false;
  						controls.settings.translation.enabled = false;
  						controls.settings.sensitivity.zoom = 0.25;
  						controls.settings.zoom.minDistance = 2.5;
  						controls.settings.zoom.maxDistance = 40.0;
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

  						var pass = new RealisticBokehPass(camera, {
  								rings: 5,
  								samples: 5,
  								showFocus: false,
  								manualDoF: true,
  								vignette: true,
  								pentagon: true,
  								shaderFocus: true,
  								noise: false,
  								maxBlur: 2.0,
  								luminanceThreshold: 0.15,
  								luminanceGain: 3.5,
  								bias: 0.25,
  								fringe: 0.33
  						});

  						this.renderPass.renderToScreen = false;
  						pass.renderToScreen = true;
  						this.bokehPass = pass;
  						composer.addPass(pass);
  				}
  		}, {
  				key: "registerOptions",
  				value: function registerOptions(menu) {

  						var material = this.bokehPass.getFullscreenMaterial();

  						var params = {
  								"rings": Number.parseInt(material.defines.RINGS_INT),
  								"samples": Number.parseInt(material.defines.SAMPLES_INT),
  								"focal stop": material.uniforms.focalStop.value,
  								"focal length": material.uniforms.focalLength.value,
  								"shader focus": material.defines.SHADER_FOCUS !== undefined,
  								"focal depth": material.uniforms.focalDepth.value,
  								"focus coord X": material.uniforms.focusCoords.value.x,
  								"focus coord Y": material.uniforms.focusCoords.value.y,
  								"max blur": material.uniforms.maxBlur.value,
  								"lum threshold": material.uniforms.luminanceThreshold.value,
  								"lum gain": material.uniforms.luminanceGain.value,
  								"bias": material.uniforms.bias.value,
  								"fringe": material.uniforms.fringe.value,
  								"dithering": material.uniforms.ditherStrength.value,
  								"vignette": material.defines.VIGNETTE !== undefined,
  								"pentagon": material.defines.PENTAGON !== undefined,
  								"manual DoF": material.defines.MANUAL_DOF !== undefined,
  								"show focus": material.defines.SHOW_FOCUS !== undefined,
  								"noise": material.defines.NOISE !== undefined
  						};

  						var f = menu.addFolder("Focus");

  						f.add(params, "show focus").onChange(function () {

  								material.setShowFocusEnabled(params["show focus"]);
  						});

  						f.add(params, "shader focus").onChange(function () {

  								material.setShaderFocusEnabled(params["shader focus"]);
  						});

  						f.add(params, "manual DoF").onChange(function () {

  								material.setManualDepthOfFieldEnabled(params["manual DoF"]);
  						});

  						f.add(params, "focal stop").min(0.0).max(100.0).step(0.1).onChange(function () {

  								material.uniforms.focalStop.value = params["focal stop"];
  						});

  						f.add(params, "focal depth").min(0.1).max(35.0).step(0.1).onChange(function () {

  								material.uniforms.focalDepth.value = params["focal depth"];
  						});

  						f.add(params, "focus coord X").min(0.0).max(1.0).step(0.01).onChange(function () {

  								material.uniforms.focusCoords.value.x = params["focus coord X"];
  						});

  						f.add(params, "focus coord Y").min(0.0).max(1.0).step(0.01).onChange(function () {

  								material.uniforms.focusCoords.value.y = params["focus coord Y"];
  						});

  						f.open();

  						f = menu.addFolder("Sampling");

  						f.add(params, "rings").min(1).max(6).step(1).onChange(function () {

  								material.defines.RINGS_INT = params.rings.toFixed(0);
  								material.defines.RINGS_FLOAT = params.rings.toFixed(1);
  								material.needsUpdate = true;
  						});

  						f.add(params, "samples").min(1).max(6).step(1).onChange(function () {

  								material.defines.SAMPLES_INT = params.samples.toFixed(0);
  								material.defines.SAMPLES_FLOAT = params.samples.toFixed(1);
  								material.needsUpdate = true;
  						});

  						f = menu.addFolder("Blur");

  						f.add(params, "max blur").min(0.0).max(10.0).step(0.001).onChange(function () {

  								material.uniforms.maxBlur.value = params["max blur"];
  						});

  						f.add(params, "bias").min(0.0).max(3.0).step(0.01).onChange(function () {

  								material.uniforms.bias.value = params.bias;
  						});

  						f.add(params, "fringe").min(0.0).max(2.0).step(0.05).onChange(function () {

  								material.uniforms.fringe.value = params.fringe;
  						});

  						f.add(params, "noise").onChange(function () {

  								material.setNoiseEnabled(params.noise);
  						});

  						f.add(params, "dithering").min(0.0).max(0.01).step(0.0001).onChange(function () {

  								material.uniforms.ditherStrength.value = params.dithering;
  						});

  						f.add(params, "pentagon").onChange(function () {

  								material.setPentagonEnabled(params.pentagon);
  						});

  						f.open();

  						f = menu.addFolder("Luminosity");

  						f.add(params, "lum threshold").min(0.0).max(1.0).step(0.01).onChange(function () {

  								material.uniforms.luminanceThreshold.value = params["lum threshold"];
  						});

  						f.add(params, "lum gain").min(0.0).max(4.0).step(0.01).onChange(function () {

  								material.uniforms.luminanceGain.value = params["lum gain"];
  						});

  						menu.add(params, "vignette").onChange(function () {

  								material.setVignetteEnabled(params.vignette);
  						});
  				}
  		}]);
  		return RealisticBokehDemo;
  }(PostProcessingDemo);

  var BlurDemo = function (_PostProcessingDemo) {
  		inherits(BlurDemo, _PostProcessingDemo);

  		function BlurDemo(composer) {
  				classCallCheck(this, BlurDemo);

  				var _this = possibleConstructorReturn(this, (BlurDemo.__proto__ || Object.getPrototypeOf(BlurDemo)).call(this, "blur", composer));

  				_this.savePass = null;

  				_this.blurPass = null;

  				_this.texturePass = null;

  				_this.object = null;

  				return _this;
  		}

  		createClass(BlurDemo, [{
  				key: "load",
  				value: function load() {

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
  						var material = void 0;
  						var i = void 0,
  						    mesh = void 0;

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

  						var pass = new SavePass();
  						this.savePass = pass;
  						composer.addPass(pass);

  						pass = new BlurPass();
  						this.blurPass = pass;
  						composer.addPass(pass);

  						pass = new TexturePass(this.savePass.renderTarget.texture, 0.0, false);
  						this.renderPass.renderToScreen = false;
  						pass.renderToScreen = true;
  						this.texturePass = pass;
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

  						get(BlurDemo.prototype.__proto__ || Object.getPrototypeOf(BlurDemo.prototype), "render", this).call(this, delta);
  				}
  		}, {
  				key: "registerOptions",
  				value: function registerOptions(menu) {

  						var renderPass = this.renderPass;
  						var blurPass = this.blurPass;
  						var texturePass = this.texturePass;

  						var params = {
  								"enabled": blurPass.enabled,
  								"resolution": blurPass.getResolutionScale(),
  								"kernel size": blurPass.kernelSize,
  								"strength": texturePass.opacityDestination
  						};

  						menu.add(params, "resolution").min(0.0).max(1.0).step(0.01).onChange(function () {

  								blurPass.setResolutionScale(params.resolution);
  						});

  						menu.add(params, "kernel size").min(KernelSize.VERY_SMALL).max(KernelSize.HUGE).step(1).onChange(function () {

  								blurPass.kernelSize = params["kernel size"];
  						});

  						menu.add(params, "strength").min(0.0).max(1.0).step(0.01).onChange(function () {

  								texturePass.opacityDestination = params.strength;
  								texturePass.opacitySource = 1.0 - params.strength;
  						});

  						menu.add(blurPass, "dithering");

  						menu.add(params, "enabled").onChange(function () {

  								renderPass.renderToScreen = !params.enabled;
  								blurPass.enabled = params.enabled;
  								texturePass.enabled = params.enabled;
  						});
  				}
  		}]);
  		return BlurDemo;
  }(PostProcessingDemo);

  var DepthDemo = function (_PostProcessingDemo) {
  		inherits(DepthDemo, _PostProcessingDemo);

  		function DepthDemo(composer) {
  				classCallCheck(this, DepthDemo);

  				var _this = possibleConstructorReturn(this, (DepthDemo.__proto__ || Object.getPrototypeOf(DepthDemo)).call(this, "depth", composer));

  				_this.object = null;

  				return _this;
  		}

  		createClass(DepthDemo, [{
  				key: "initialize",
  				value: function initialize() {

  						var scene = this.scene;
  						var composer = this.composer;
  						var renderer = composer.renderer;

  						var camera = new three.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 2, 10);
  						camera.position.set(2, 1, 2);
  						camera.lookAt(scene.position);
  						this.camera = camera;

  						var controls = new DeltaControls(camera.position, camera.quaternion, renderer.domElement);
  						controls.settings.pointer.lock = false;
  						controls.settings.translation.enabled = false;
  						controls.settings.sensitivity.zoom = 0.25;
  						controls.settings.zoom.minDistance = 3.0;
  						controls.settings.zoom.maxDistance = 9.0;
  						controls.lookAt(scene.position);
  						this.controls = controls;

  						renderer.setClearColor(0x000000);

  						var mesh = new three.Mesh(new three.DodecahedronBufferGeometry(1), new three.MeshBasicMaterial());

  						this.object = mesh;
  						scene.add(mesh);

  						this.renderPass.overrideMaterial = new three.MeshDepthMaterial();
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

  						get(DepthDemo.prototype.__proto__ || Object.getPrototypeOf(DepthDemo.prototype), "render", this).call(this, delta);
  				}
  		}, {
  				key: "registerOptions",
  				value: function registerOptions(menu) {

  						var pass = this.renderPass;

  						menu.add(pass.overrideMaterial, "dithering").onChange(function () {

  								pass.overrideMaterial.needsUpdate = true;
  						});
  				}
  		}]);
  		return DepthDemo;
  }(PostProcessingDemo);

  var DotScreenDemo = function (_PostProcessingDemo) {
  		inherits(DotScreenDemo, _PostProcessingDemo);

  		function DotScreenDemo(composer) {
  				classCallCheck(this, DotScreenDemo);

  				var _this = possibleConstructorReturn(this, (DotScreenDemo.__proto__ || Object.getPrototypeOf(DotScreenDemo)).call(this, "dot-screen", composer));

  				_this.dotScreenPass = null;

  				_this.object = null;

  				return _this;
  		}

  		createClass(DotScreenDemo, [{
  				key: "load",
  				value: function load() {

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

  						var material = void 0,
  						    mesh = void 0;
  						var i = void 0;

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

  						var pass = new DotScreenPass({
  								scale: 0.8,
  								angle: Math.PI * 0.5,
  								intensity: 0.25
  						});

  						this.renderPass.renderToScreen = false;
  						pass.renderToScreen = true;
  						this.dotScreenPass = pass;
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

  						get(DotScreenDemo.prototype.__proto__ || Object.getPrototypeOf(DotScreenDemo.prototype), "render", this).call(this, delta);
  				}
  		}, {
  				key: "registerOptions",
  				value: function registerOptions(menu) {

  						var material = this.dotScreenPass.getFullscreenMaterial();

  						var params = {
  								"average": material.defines.AVERAGE !== undefined,
  								"scale": material.uniforms.scale.value,
  								"angle": material.uniforms.angle.value,
  								"intensity": material.uniforms.intensity.value,
  								"center X": material.uniforms.offsetRepeat.value.x,
  								"center Y": material.uniforms.offsetRepeat.value.y
  						};

  						menu.add(params, "average").onChange(function () {

  								material.setAverageEnabled(params.average);
  						});

  						menu.add(params, "scale").min(0.0).max(1.0).step(0.01).onChange(function () {

  								material.uniforms.scale.value = params.scale;
  						});

  						menu.add(params, "angle").min(0.0).max(Math.PI).step(0.001).onChange(function () {

  								material.uniforms.angle.value = params.angle;
  						});

  						menu.add(params, "intensity").min(0.0).max(1.0).step(0.01).onChange(function () {

  								material.uniforms.intensity.value = params.intensity;
  						});

  						var f = menu.addFolder("Center");

  						f.add(params, "center X").min(-1.0).max(1.0).step(0.01).onChange(function () {

  								material.uniforms.offsetRepeat.value.x = params["center X"];
  						});

  						f.add(params, "center Y").min(-1.0).max(1.0).step(0.01).onChange(function () {

  								material.uniforms.offsetRepeat.value.y = params["center Y"];
  						});
  				}
  		}]);
  		return DotScreenDemo;
  }(PostProcessingDemo);

  var FilmDemo = function (_PostProcessingDemo) {
  		inherits(FilmDemo, _PostProcessingDemo);

  		function FilmDemo(composer) {
  				classCallCheck(this, FilmDemo);

  				var _this = possibleConstructorReturn(this, (FilmDemo.__proto__ || Object.getPrototypeOf(FilmDemo)).call(this, "film", composer));

  				_this.filmPass = null;

  				_this.object = null;

  				return _this;
  		}

  		createClass(FilmDemo, [{
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

  						var material = void 0,
  						    mesh = void 0;
  						var i = void 0;

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

  						var pass = new FilmPass({
  								grayscale: false,
  								sepia: true,
  								vignette: true,
  								eskil: true,
  								scanlines: true,
  								grid: false,
  								noise: true,
  								noiseIntensity: 0.5,
  								scanlineIntensity: 0.5,
  								gridIntensity: 0.2,
  								scanlineDensity: 1.5,
  								gridScale: 1.25,
  								greyscaleIntensity: 1.0,
  								sepiaIntensity: 0.5,
  								vignetteOffset: 1.0,
  								vignetteDarkness: 1.0
  						});

  						this.renderPass.renderToScreen = false;
  						pass.renderToScreen = true;
  						this.filmPass = pass;
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

  						get(FilmDemo.prototype.__proto__ || Object.getPrototypeOf(FilmDemo.prototype), "render", this).call(this, delta);
  				}
  		}, {
  				key: "registerOptions",
  				value: function registerOptions(menu) {

  						var pass = this.filmPass;
  						var material = pass.getFullscreenMaterial();
  						var uniforms = material.uniforms;

  						var params = {
  								"greyscale": material.defines.GREYSCALE !== undefined,
  								"sepia": material.defines.SEPIA !== undefined,
  								"vignette": material.defines.VIGNETTE !== undefined,
  								"eskil": material.defines.ESKIL !== undefined,
  								"noise": material.defines.NOISE !== undefined,
  								"scanlines": material.defines.SCANLINES !== undefined,
  								"grid": material.defines.GRID !== undefined,
  								"noise intensity": uniforms.noiseIntensity.value,
  								"scanlines intensity": uniforms.scanlineIntensity.value,
  								"grid intensity": uniforms.gridIntensity.value,
  								"scanlines count": pass.getScanlineDensity(),
  								"grid scale": pass.getGridScale(),
  								"grid line width": pass.getGridLineWidth(),
  								"blend mode": "screen",
  								"greyscale intensity": uniforms.greyscaleIntensity.value,
  								"sepia intensity": uniforms.sepiaIntensity.value,
  								"vignette offset": uniforms.vignetteOffset.value,
  								"vignette darkness": uniforms.vignetteDarkness.value
  						};

  						var f = menu.addFolder("Greyscale");

  						f.add(params, "greyscale").onChange(function () {

  								material.setGreyscaleEnabled(params.greyscale);
  						});

  						f.add(params, "greyscale intensity").min(0.0).max(1.0).step(0.01).onChange(function () {

  								uniforms.greyscaleIntensity.value = params["greyscale intensity"];
  						});

  						f = menu.addFolder("Noise, Scanlines and Grid");

  						f.add(params, "blend mode", ["add", "screen"]).onChange(function () {

  								material.setScreenModeEnabled(params["blend mode"] !== "add");
  						});

  						f.add(params, "noise").onChange(function () {

  								material.setNoiseEnabled(params.noise);
  						});

  						f.add(params, "noise intensity").min(0.0).max(1.0).step(0.01).onChange(function () {

  								uniforms.noiseIntensity.value = params["noise intensity"];
  						});

  						f.add(params, "scanlines").onChange(function () {

  								material.setScanlinesEnabled(params.scanlines);
  						});

  						f.add(params, "scanlines intensity").min(0.0).max(1.0).step(0.01).onChange(function () {

  								uniforms.scanlineIntensity.value = params["scanlines intensity"];
  						});

  						f.add(params, "scanlines count").min(0.0).max(2.0).step(0.01).onChange(function () {

  								pass.setScanlineDensity(params["scanlines count"]);
  						});

  						f.add(params, "grid").onChange(function () {

  								material.setGridEnabled(params.grid);
  						});

  						f.add(params, "grid intensity").min(0.0).max(1.0).step(0.01).onChange(function () {

  								uniforms.gridIntensity.value = params["grid intensity"];
  						});

  						f.add(params, "grid scale").min(0.01).max(2.0).step(0.01).onChange(function () {

  								pass.setGridScale(params["grid scale"]);
  						});

  						f.add(params, "grid line width").min(0.0).max(1.0).step(0.001).onChange(function () {

  								pass.setGridLineWidth(params["grid line width"]);
  						});

  						f = menu.addFolder("Sepia");

  						f.add(params, "sepia").onChange(function () {

  								material.setSepiaEnabled(params.sepia);
  						});

  						f.add(params, "sepia intensity").min(0.0).max(1.0).step(0.01).onChange(function () {

  								uniforms.sepiaIntensity.value = params["sepia intensity"];
  						});

  						f = menu.addFolder("Vignette");

  						f.add(params, "vignette").onChange(function () {

  								material.setVignetteEnabled(params.vignette);
  						});

  						f.add(params, "eskil").onChange(function () {

  								material.setEskilEnabled(params.eskil);
  						});

  						f.add(params, "vignette offset").min(0.0).max(1.0).step(0.01).onChange(function () {

  								uniforms.vignetteOffset.value = params["vignette offset"];
  						});

  						f.add(params, "vignette darkness").min(0.0).max(1.0).step(0.01).onChange(function () {

  								uniforms.vignetteDarkness.value = params["vignette darkness"];
  						});
  				}
  		}]);
  		return FilmDemo;
  }(PostProcessingDemo);

  var GlitchDemo = function (_PostProcessingDemo) {
  		inherits(GlitchDemo, _PostProcessingDemo);

  		function GlitchDemo(composer) {
  				classCallCheck(this, GlitchDemo);

  				var _this = possibleConstructorReturn(this, (GlitchDemo.__proto__ || Object.getPrototypeOf(GlitchDemo)).call(this, "glitch", composer));

  				_this.glitchPass = null;

  				_this.object = null;

  				return _this;
  		}

  		createClass(GlitchDemo, [{
  				key: "load",
  				value: function load() {

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

  												texture.magFilter = texture.minFilter = three.NearestFilter;
  												assets.set("perturb-map", texture);
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

  						var material = void 0,
  						    mesh = void 0;
  						var i = void 0;

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

  						var pass = new GlitchPass({
  								perturbMap: assets.get("perturb-map")
  						});

  						this.renderPass.renderToScreen = false;
  						pass.renderToScreen = true;
  						this.glitchPass = pass;
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

  						get(GlitchDemo.prototype.__proto__ || Object.getPrototypeOf(GlitchDemo.prototype), "render", this).call(this, delta);
  				}
  		}, {
  				key: "registerOptions",
  				value: function registerOptions(menu) {

  						var pass = this.glitchPass;
  						var perturbMap = pass.perturbMap;

  						var params = {
  								"mode": pass.mode,
  								"custom noise": true
  						};

  						menu.add(params, "mode").min(GlitchMode.SPORADIC).max(GlitchMode.CONSTANT_WILD).step(1).onChange(function () {

  								pass.mode = params.mode;
  						});

  						menu.add(params, "custom noise").onChange(function () {

  								if (params["custom noise"]) {

  										pass.perturbMap = perturbMap;
  								} else {

  										pass.generatePerturbMap(64);
  								}
  						});
  				}
  		}]);
  		return GlitchDemo;
  }(PostProcessingDemo);

  var mouse = new three.Vector2();

  var OutlineDemo = function (_PostProcessingDemo) {
  		inherits(OutlineDemo, _PostProcessingDemo);

  		function OutlineDemo(composer) {
  				classCallCheck(this, OutlineDemo);

  				var _this = possibleConstructorReturn(this, (OutlineDemo.__proto__ || Object.getPrototypeOf(OutlineDemo)).call(this, "outline", composer));

  				_this.raycaster = null;

  				_this.selectedObject = null;

  				_this.outlinePass = null;

  				return _this;
  		}

  		createClass(OutlineDemo, [{
  				key: "raycast",
  				value: function raycast(event) {

  						var raycaster = this.raycaster;

  						var intersects = void 0,
  						    x = void 0;

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

  						var pass = this.outlinePass;
  						var selection = pass.selection;
  						var selectedObject = this.selectedObject;

  						if (selectedObject !== null) {

  								if (selection.indexOf(selectedObject) >= 0) {

  										pass.deselectObject(selectedObject);
  								} else {

  										pass.selectObject(selectedObject);
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

  										textureLoader.load("textures/tripattern.jpg", function (texture) {

  												texture.wrapS = texture.wrapT = three.RepeatWrapping;
  												assets.set("pattern-color", texture);
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
  						renderer.setClearColor(scene.fog.color);

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

  						var pass = new OutlinePass(scene, camera, {
  								edgeStrength: 2.5,
  								patternScale: 7.5
  						});

  						pass.setSelection(scene.children);
  						pass.deselectObject(mesh);

  						this.renderPass.renderToScreen = false;
  						pass.renderToScreen = true;
  						this.outlinePass = pass;
  						composer.addPass(pass);
  				}
  		}, {
  				key: "registerOptions",
  				value: function registerOptions(menu) {

  						var assets = this.assets;
  						var pass = this.outlinePass;

  						var params = {
  								"resolution": pass.getResolutionScale(),
  								"kernel size": pass.kernelSize,
  								"use pattern": false,
  								"pattern scale": pass.outlineBlendMaterial.uniforms.patternScale.value,
  								"edge strength": pass.outlineBlendMaterial.uniforms.edgeStrength.value,
  								"pulse speed": pass.pulseSpeed,
  								"visible edge": pass.outlineBlendMaterial.uniforms.visibleEdgeColor.value.getHex(),
  								"hidden edge": pass.outlineBlendMaterial.uniforms.hiddenEdgeColor.value.getHex(),
  								"alpha blending": false,
  								"x-ray": true
  						};

  						menu.add(params, "resolution").min(0.0).max(1.0).step(0.01).onChange(function () {

  								pass.setResolutionScale(params.resolution);
  						});

  						menu.add(params, "kernel size").min(KernelSize.VERY_SMALL).max(KernelSize.HUGE).step(1).onChange(function () {

  								pass.kernelSize = params["kernel size"];
  						});

  						menu.add(pass, "blur");
  						menu.add(pass, "dithering");

  						menu.add(params, "use pattern").onChange(function () {

  								pass.setPatternTexture(params["use pattern"] ? assets.get("pattern-color") : null);
  						});

  						menu.add(params, "pattern scale").min(1.0).max(10.0).step(0.01).onChange(function () {

  								pass.outlineBlendMaterial.uniforms.patternScale.value = params["pattern scale"];
  						});

  						menu.add(params, "edge strength").min(0.0).max(10.0).step(0.01).onChange(function () {

  								pass.outlineBlendMaterial.uniforms.edgeStrength.value = params["edge strength"];
  						});

  						menu.add(params, "pulse speed").min(0.0).max(2.0).step(0.01).onChange(function () {

  								pass.pulseSpeed = params["pulse speed"];
  						});

  						menu.addColor(params, "visible edge").onChange(function () {

  								pass.outlineBlendMaterial.uniforms.visibleEdgeColor.value.setHex(params["visible edge"]);
  						});

  						menu.addColor(params, "hidden edge").onChange(function () {

  								pass.outlineBlendMaterial.uniforms.hiddenEdgeColor.value.setHex(params["hidden edge"]);
  						});

  						menu.add(params, "alpha blending").onChange(function () {

  								pass.outlineBlendMaterial.setAlphaBlendingEnabled(params["alpha blending"]);
  						});

  						menu.add(params, "x-ray").onChange(function () {

  								pass.outlineBlendMaterial.setXRayEnabled(params["x-ray"]);
  						});
  				}
  		}, {
  				key: "reset",
  				value: function reset() {

  						get(OutlineDemo.prototype.__proto__ || Object.getPrototypeOf(OutlineDemo.prototype), "reset", this).call(this);

  						var dom = this.composer.renderer.domElement;
  						dom.removeEventListener("mousemove", this);
  						dom.removeEventListener("mousedown", this);

  						return this;
  				}
  		}]);
  		return OutlineDemo;
  }(PostProcessingDemo);

  var PixelationDemo = function (_PostProcessingDemo) {
  		inherits(PixelationDemo, _PostProcessingDemo);

  		function PixelationDemo(composer) {
  				classCallCheck(this, PixelationDemo);

  				var _this = possibleConstructorReturn(this, (PixelationDemo.__proto__ || Object.getPrototypeOf(PixelationDemo)).call(this, "pixelation", composer));

  				_this.object = null;

  				_this.maskObject = null;

  				_this.maskPass = null;

  				_this.pixelationPass = null;

  				return _this;
  		}

  		createClass(PixelationDemo, [{
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

  						var material = void 0,
  						    mesh = void 0;
  						var i = void 0;

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

  						this.renderPass.renderToScreen = false;

  						var pass = new MaskPass(maskScene, camera);
  						pass.renderToScreen = true;
  						this.maskPass = pass;
  						composer.addPass(pass);

  						pass = new PixelationPass(5.0);
  						pass.renderToScreen = true;
  						this.pixelationPass = pass;
  						composer.addPass(pass);

  						composer.addPass(new ClearMaskPass());
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

  						get(PixelationDemo.prototype.__proto__ || Object.getPrototypeOf(PixelationDemo.prototype), "render", this).call(this, delta);
  				}
  		}, {
  				key: "registerOptions",
  				value: function registerOptions(menu) {

  						var maskPass = this.maskPass;

  						var params = {
  								"use mask": maskPass.enabled
  						};

  						menu.add(this.pixelationPass, "granularity").min(0.0).max(50.0).step(0.1);

  						menu.add(params, "use mask").onChange(function () {

  								maskPass.enabled = params["use mask"];
  						});
  				}
  		}]);
  		return PixelationDemo;
  }(PostProcessingDemo);

  var GodRaysDemo = function (_PostProcessingDemo) {
  		inherits(GodRaysDemo, _PostProcessingDemo);

  		function GodRaysDemo(composer) {
  				classCallCheck(this, GodRaysDemo);

  				var _this = possibleConstructorReturn(this, (GodRaysDemo.__proto__ || Object.getPrototypeOf(GodRaysDemo)).call(this, "god-rays", composer));

  				_this.godRaysPass = null;

  				_this.sun = null;

  				_this.directionalLight = null;

  				return _this;
  		}

  		createClass(GodRaysDemo, [{
  				key: "load",
  				value: function load() {

  						var assets = this.assets;
  						var loadingManager = this.loadingManager;
  						var cubeTextureLoader = new three.CubeTextureLoader(loadingManager);
  						var textureLoader = new three.TextureLoader(loadingManager);
  						var modelLoader = new three.ObjectLoader(loadingManager);

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

  										modelLoader.load("models/waggon.json", function (object) {

  												object.rotation.x = Math.PI * 0.25;
  												object.rotation.y = Math.PI * 0.75;

  												assets.set("waggon", object);
  										});

  										textureLoader.load("textures/wood.jpg", function (texture) {

  												texture.wrapS = texture.wrapT = three.RepeatWrapping;
  												assets.set("wood-diffuse", texture);
  										});

  										textureLoader.load("textures/woodnormals.jpg", function (texture) {

  												texture.wrapS = texture.wrapT = three.RepeatWrapping;
  												assets.set("wood-normals", texture);
  										});

  										textureLoader.load("textures/sun.png", function (texture) {

  												assets.set("sun-diffuse", texture);
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
  						camera.position.set(-5, -1, -4);
  						this.camera = camera;

  						var target = new three.Vector3(0, 0.5, 0);
  						var controls = new DeltaControls(camera.position, camera.quaternion, renderer.domElement);
  						controls.settings.pointer.lock = false;
  						controls.settings.translation.enabled = false;
  						controls.settings.sensitivity.rotation = 0.00125;
  						controls.settings.sensitivity.zoom = 1.0;
  						controls.lookAt(target);
  						this.controls = controls;

  						scene.fog = new three.FogExp2(0x000000, 0.0025);
  						renderer.setClearColor(scene.fog.color);

  						scene.background = assets.get("sky");

  						var ambientLight = new three.AmbientLight(0x0f0f0f);
  						var directionalLight = new three.DirectionalLight(0xffbbaa);

  						directionalLight.position.set(-1, 1, 1);
  						directionalLight.target.position.copy(scene.position);

  						this.directionalLight = directionalLight;

  						scene.add(directionalLight);
  						scene.add(ambientLight);

  						var object = assets.get("waggon");
  						var material = new three.MeshPhongMaterial({
  								color: 0xffffff,
  								map: assets.get("wood-diffuse"),
  								normalMap: assets.get("wood-normals"),
  								fog: true
  						});

  						object.traverse(function (child) {

  								child.material = material;
  						});

  						scene.add(object);

  						var sunMaterial = new three.PointsMaterial({
  								map: assets.get("sun-diffuse"),
  								size: 100,
  								sizeAttenuation: true,
  								color: 0xffddaa,
  								alphaTest: 0,
  								transparent: true,
  								fog: false
  						});

  						var sunGeometry = new three.BufferGeometry();
  						sunGeometry.addAttribute("position", new three.BufferAttribute(new Float32Array(3), 3));
  						var sun = new three.Points(sunGeometry, sunMaterial);
  						sun.frustumCulled = false;
  						sun.position.set(75, 25, 100);

  						this.sun = sun;
  						scene.add(sun);

  						var pass = new GodRaysPass(scene, camera, sun, {
  								resolutionScale: 0.6,
  								kernelSize: KernelSize.SMALL,
  								intensity: 1.0,
  								density: 0.96,
  								decay: 0.93,
  								weight: 0.4,
  								exposure: 0.6,
  								samples: 60,
  								clampMax: 1.0
  						});

  						this.renderPass.renderToScreen = false;
  						pass.renderToScreen = true;
  						pass.dithering = true;
  						this.godRaysPass = pass;
  						composer.addPass(pass);
  				}
  		}, {
  				key: "registerOptions",
  				value: function registerOptions(menu) {

  						var directionalLight = this.directionalLight;
  						var pass = this.godRaysPass;
  						var sun = this.sun;

  						var params = {
  								"resolution": pass.getResolutionScale(),
  								"blurriness": pass.kernelSize,
  								"intensity": pass.intensity,
  								"density": pass.godRaysMaterial.uniforms.density.value,
  								"decay": pass.godRaysMaterial.uniforms.decay.value,
  								"weight": pass.godRaysMaterial.uniforms.weight.value,
  								"exposure": pass.godRaysMaterial.uniforms.exposure.value,
  								"clampMax": pass.godRaysMaterial.uniforms.clampMax.value,
  								"samples": pass.samples,
  								"color": sun.material.color.getHex(),
  								"blend mode": "screen"
  						};

  						menu.add(params, "resolution").min(0.0).max(1.0).step(0.01).onChange(function () {

  								pass.setResolutionScale(params.resolution);
  						});

  						menu.add(pass, "dithering");

  						menu.add(params, "blurriness").min(KernelSize.VERY_SMALL).max(KernelSize.HUGE).step(1).onChange(function () {

  								pass.kernelSize = params.blurriness;
  						});

  						menu.add(params, "intensity").min(0.0).max(1.0).step(0.01).onChange(function () {

  								pass.intensity = params.intensity;
  						});

  						menu.add(params, "density").min(0.0).max(1.0).step(0.01).onChange(function () {

  								pass.godRaysMaterial.uniforms.density.value = params.density;
  						});

  						menu.add(params, "decay").min(0.0).max(1.0).step(0.01).onChange(function () {

  								pass.godRaysMaterial.uniforms.decay.value = params.decay;
  						});

  						menu.add(params, "weight").min(0.0).max(1.0).step(0.01).onChange(function () {

  								pass.godRaysMaterial.uniforms.weight.value = params.weight;
  						});

  						menu.add(params, "exposure").min(0.0).max(1.0).step(0.01).onChange(function () {

  								pass.godRaysMaterial.uniforms.exposure.value = params.exposure;
  						});

  						menu.add(params, "clampMax").min(0.0).max(1.0).step(0.01).onChange(function () {

  								pass.godRaysMaterial.uniforms.clampMax.value = params.clampMax;
  						});

  						menu.add(params, "samples").min(15).max(200).step(1).onChange(function () {

  								pass.samples = params.samples;
  						});

  						menu.addColor(params, "color").onChange(function () {

  								sun.material.color.setHex(params.color);
  								directionalLight.color.setHex(params.color);
  						});

  						menu.add(params, "blend mode", ["add", "screen"]).onChange(function () {

  								pass.combineMaterial.setScreenModeEnabled(params["blend mode"] !== "add");
  						});
  				}
  		}]);
  		return GodRaysDemo;
  }(PostProcessingDemo);

  var RenderDemo = function (_PostProcessingDemo) {
  		inherits(RenderDemo, _PostProcessingDemo);

  		function RenderDemo(composer) {
  				classCallCheck(this, RenderDemo);

  				var _this = possibleConstructorReturn(this, (RenderDemo.__proto__ || Object.getPrototypeOf(RenderDemo)).call(this, "render", composer));

  				_this.object = null;

  				return _this;
  		}

  		createClass(RenderDemo, [{
  				key: "load",
  				value: function load() {

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
  								color: 0xffffff,
  								map: assets.get("crate-color")
  						}));

  						this.object = mesh;
  						scene.add(mesh);
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

  						get(RenderDemo.prototype.__proto__ || Object.getPrototypeOf(RenderDemo.prototype), "render", this).call(this, delta);
  				}
  		}]);
  		return RenderDemo;
  }(PostProcessingDemo);

  var ShockWaveDemo = function (_PostProcessingDemo) {
  		inherits(ShockWaveDemo, _PostProcessingDemo);

  		function ShockWaveDemo(composer) {
  				classCallCheck(this, ShockWaveDemo);

  				var _this = possibleConstructorReturn(this, (ShockWaveDemo.__proto__ || Object.getPrototypeOf(ShockWaveDemo)).call(this, "shock-wave", composer));

  				_this.shockWavePass = null;

  				return _this;
  		}

  		createClass(ShockWaveDemo, [{
  				key: "load",
  				value: function load() {

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

  						var pass = new ShockWavePass(camera, mesh.position, {
  								speed: 1.0,
  								maxRadius: 0.5,
  								waveSize: 0.2,
  								amplitude: 0.05
  						});

  						this.renderPass.renderToScreen = false;
  						pass.renderToScreen = true;
  						this.shockWavePass = pass;
  						composer.addPass(pass);
  				}
  		}, {
  				key: "registerOptions",
  				value: function registerOptions(menu) {

  						var pass = this.shockWavePass;
  						var material = pass.shockWaveMaterial;

  						var params = {
  								"size": material.uniforms.size.value,
  								"extent": material.uniforms.maxRadius.value,
  								"waveSize": material.uniforms.waveSize.value,
  								"amplitude": material.uniforms.amplitude.value
  						};

  						menu.add(pass, "speed").min(0.0).max(10.0).step(0.001);

  						menu.add(params, "size").min(0.01).max(2.0).step(0.001).onChange(function () {

  								material.uniforms.size.value = params.size;
  						});

  						menu.add(params, "extent").min(0.0).max(10.0).step(0.001).onChange(function () {

  								material.uniforms.maxRadius.value = params.extent;
  						});

  						menu.add(params, "waveSize").min(0.0).max(2.0).step(0.001).onChange(function () {

  								material.uniforms.waveSize.value = params.waveSize;
  						});

  						menu.add(params, "amplitude").min(0.0).max(0.25).step(0.001).onChange(function () {

  								material.uniforms.amplitude.value = params.amplitude;
  						});

  						menu.add(pass, "explode");
  				}
  		}]);
  		return ShockWaveDemo;
  }(PostProcessingDemo);

  var SMAADemo = function (_PostProcessingDemo) {
  		inherits(SMAADemo, _PostProcessingDemo);

  		function SMAADemo(composer) {
  				classCallCheck(this, SMAADemo);

  				var _this = possibleConstructorReturn(this, (SMAADemo.__proto__ || Object.getPrototypeOf(SMAADemo)).call(this, "smaa", composer));

  				_this.originalRenderer = null;

  				_this.rendererAA = null;

  				_this.controls2 = null;

  				_this.smaaPass = null;

  				_this.texturePass = null;

  				_this.objectA = null;

  				_this.objectB = null;

  				_this.objectC = null;

  				return _this;
  		}

  		createClass(SMAADemo, [{
  				key: "load",
  				value: function load() {

  						var assets = this.assets;
  						var loadingManager = this.loadingManager;
  						var textureLoader = new three.TextureLoader(loadingManager);
  						var cubeTextureLoader = new three.CubeTextureLoader(loadingManager);

  						var path = "textures/skies/sunset/";
  						var format = ".png";
  						var urls = [path + "px" + format, path + "nx" + format, path + "py" + format, path + "ny" + format, path + "pz" + format, path + "nz" + format];

  						return new Promise(function (resolve, reject) {

  								var image = void 0;

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

  										image = new Image();
  										image.addEventListener("load", function () {

  												assets.set("smaa-search", this);
  												loadingManager.itemEnd("smaa-search");
  										});

  										loadingManager.itemStart("smaa-search");
  										image.src = SMAAPass.searchImageDataURL;

  										image = new Image();
  										image.addEventListener("load", function () {

  												assets.set("smaa-area", this);
  												loadingManager.itemEnd("smaa-area");
  										});

  										loadingManager.itemStart("smaa-area");
  										image.src = SMAAPass.areaImageDataURL;
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
  						}(renderer.getSize(), renderer.getClearColor(), renderer.getPixelRatio());

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

  						var o0 = void 0,
  						    o1 = void 0,
  						    o2 = void 0;

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

  						this.renderPass.renderToScreen = false;

  						var pass = new SMAAPass(assets.get("smaa-search"), assets.get("smaa-area"));
  						pass.renderToScreen = true;
  						this.smaaPass = pass;
  						composer.addPass(pass);

  						pass = new TexturePass(this.smaaPass.renderTargetColorEdges.texture, 1.0, false);
  						pass.renderToScreen = true;
  						pass.enabled = false;
  						this.texturePass = pass;
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

  						get(SMAADemo.prototype.__proto__ || Object.getPrototypeOf(SMAADemo.prototype), "render", this).call(this, delta);
  				}
  		}, {
  				key: "registerOptions",
  				value: function registerOptions(menu) {

  						var composer = this.composer;
  						var renderPass = this.renderPass;
  						var smaaPass = this.smaaPass;
  						var texturePass = this.texturePass;

  						var renderer1 = this.originalRenderer;
  						var renderer2 = this.rendererAA;

  						var controls1 = this.controls;
  						var controls2 = this.controls2;

  						var SMAAMode = {
  								disabled: "disabled",
  								edges: "edges",
  								blend: "blend"
  						};

  						var params = {
  								"browser AA": false,
  								"SMAA": SMAAMode.blend,
  								"sensitivity": Number.parseFloat(smaaPass.colorEdgesMaterial.defines.EDGE_THRESHOLD),
  								"search steps": Number.parseFloat(smaaPass.weightsMaterial.defines.MAX_SEARCH_STEPS_INT)
  						};

  						function toggleSMAAMode() {

  								renderPass.renderToScreen = params.SMAA === SMAAMode.disabled;
  								smaaPass.renderToScreen = params.SMAA === SMAAMode.blend;
  								smaaPass.enabled = params.SMAA !== SMAAMode.disabled;
  								texturePass.enabled = params.SMAA === SMAAMode.edges;
  						}

  						function swapRenderers() {

  								var size = composer.renderer.getSize();

  								if (params["browser AA"]) {

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

  						menu.add(params, "browser AA").onChange(swapRenderers);
  						menu.add(params, "SMAA", SMAAMode).onChange(toggleSMAAMode);

  						menu.add(params, "sensitivity").min(0.05).max(0.5).step(0.01).onChange(function () {

  								smaaPass.colorEdgesMaterial.setEdgeDetectionThreshold(params.sensitivity);
  						});

  						menu.add(params, "search steps").min(8).max(112).step(1).onChange(function () {

  								smaaPass.weightsMaterial.setOrthogonalSearchSteps(params["search steps"]);
  						});
  				}
  		}, {
  				key: "reset",
  				value: function reset() {

  						get(SMAADemo.prototype.__proto__ || Object.getPrototypeOf(SMAADemo.prototype), "reset", this).call(this);

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

  var ToneMappingDemo = function (_PostProcessingDemo) {
  		inherits(ToneMappingDemo, _PostProcessingDemo);

  		function ToneMappingDemo(composer) {
  				classCallCheck(this, ToneMappingDemo);

  				var _this = possibleConstructorReturn(this, (ToneMappingDemo.__proto__ || Object.getPrototypeOf(ToneMappingDemo)).call(this, "tone-mapping", composer));

  				_this.toneMappingPass = null;

  				_this.object = null;

  				return _this;
  		}

  		createClass(ToneMappingDemo, [{
  				key: "load",
  				value: function load() {

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

  						var pass = new ToneMappingPass({
  								adaptive: true,
  								resolution: 256,
  								distinction: 2.0
  						});

  						pass.adaptiveLuminosityMaterial.uniforms.tau.value = 2.0;

  						this.renderPass.renderToScreen = false;
  						pass.renderToScreen = true;
  						pass.dithering = true;
  						this.toneMappingPass = pass;
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

  						get(ToneMappingDemo.prototype.__proto__ || Object.getPrototypeOf(ToneMappingDemo.prototype), "render", this).call(this, delta);
  				}
  		}, {
  				key: "registerOptions",
  				value: function registerOptions(menu) {

  						var pass = this.toneMappingPass;

  						var params = {
  								"resolution": Math.log2(pass.resolution),
  								"distinction": pass.luminosityMaterial.uniforms.distinction.value,
  								"adaption rate": pass.adaptiveLuminosityMaterial.uniforms.tau.value,
  								"average lum": pass.toneMappingMaterial.uniforms.averageLuminance.value,
  								"min lum": pass.adaptiveLuminosityMaterial.uniforms.minLuminance.value,
  								"max lum": pass.toneMappingMaterial.uniforms.maxLuminance.value,
  								"middle grey": pass.toneMappingMaterial.uniforms.middleGrey.value
  						};

  						menu.add(params, "resolution").min(6).max(11).step(1).onChange(function () {

  								pass.resolution = Math.pow(2, params.resolution);
  						});

  						menu.add(pass, "adaptive");
  						menu.add(pass, "dithering");

  						var f = menu.addFolder("Luminance");

  						f.add(params, "distinction").min(1.0).max(10.0).step(0.1).onChange(function () {

  								pass.luminosityMaterial.uniforms.distinction.value = params.distinction;
  						});

  						f.add(params, "adaption rate").min(1.0).max(3.0).step(0.01).onChange(function () {

  								pass.adaptiveLuminosityMaterial.uniforms.tau.value = params["adaption rate"];
  						});

  						f.add(params, "average lum").min(0.01).max(1.0).step(0.01).onChange(function () {

  								pass.toneMappingMaterial.uniforms.averageLuminance.value = params["average lum"];
  						});

  						f.add(params, "min lum").min(0.0).max(1.0).step(0.01).onChange(function () {

  								pass.adaptiveLuminosityMaterial.uniforms.minLuminance.value = params["min lum"];
  						});

  						f.add(params, "max lum").min(0.0).max(32.0).step(1).onChange(function () {

  								pass.toneMappingMaterial.uniforms.maxLuminance.value = params["max lum"];
  						});

  						f.add(params, "middle grey").min(0.0).max(1.0).step(0.01).onChange(function () {

  								pass.toneMappingMaterial.uniforms.middleGrey.value = params["middle grey"];
  						});

  						f.open();
  				}
  		}]);
  		return ToneMappingDemo;
  }(PostProcessingDemo);

  var renderer = void 0;

  var composer = void 0;

  var manager = void 0;

  function render(now) {

  	requestAnimationFrame(render);
  	manager.render(now);
  }

  function onChange(event) {

  	var demo = event.demo;

  	var size = composer.renderer.getSize();
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

  	renderer.setSize(viewport.clientWidth, viewport.clientHeight);
  	renderer.setPixelRatio(window.devicePixelRatio);
  	renderer.setClearColor(0x000000);

  	composer = new EffectComposer(renderer, {
  		stencilBuffer: true,
  		depthTexture: true
  	});

  	manager = new DemoManager(viewport, {
  		aside: document.getElementById("aside"),
  		renderer: renderer
  	});

  	manager.addEventListener("change", onChange);
  	manager.addEventListener("load", onLoad);

  	manager.addDemo(new RenderDemo(composer));
  	manager.addDemo(new BloomDemo(composer));
  	manager.addDemo(new BlurDemo(composer));
  	manager.addDemo(new BokehDemo(composer));
  	manager.addDemo(new RealisticBokehDemo(composer));
  	manager.addDemo(new DepthDemo(composer));
  	manager.addDemo(new DotScreenDemo(composer));
  	manager.addDemo(new FilmDemo(composer));
  	manager.addDemo(new GlitchDemo(composer));
  	manager.addDemo(new GodRaysDemo(composer));
  	manager.addDemo(new OutlineDemo(composer));
  	manager.addDemo(new PixelationDemo(composer));
  	manager.addDemo(new ShockWaveDemo(composer));
  	manager.addDemo(new SMAADemo(composer));
  	manager.addDemo(new ToneMappingDemo(composer));

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
