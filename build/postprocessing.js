/**
 * postprocessing v6.13.5 build Wed May 06 2020
 * https://github.com/vanruesc/postprocessing
 * Copyright 2020 Raoul van Rüschen
 * @license Zlib
 */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('three')) :
  typeof define === 'function' && define.amd ? define(['exports', 'three'], factory) :
  (global = global || self, factory(global.POSTPROCESSING = {}, global.THREE));
}(this, (function (exports, three) { 'use strict';

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

  function _isNativeReflectConstruct() {
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
    if (_isNativeReflectConstruct()) {
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

  function _isNativeFunction(fn) {
    return Function.toString.call(fn).indexOf("[native code]") !== -1;
  }

  function _wrapNativeSuper(Class) {
    var _cache = typeof Map === "function" ? new Map() : undefined;

    _wrapNativeSuper = function _wrapNativeSuper(Class) {
      if (Class === null || !_isNativeFunction(Class)) return Class;

      if (typeof Class !== "function") {
        throw new TypeError("Super expression must either be null or a function");
      }

      if (typeof _cache !== "undefined") {
        if (_cache.has(Class)) return _cache.get(Class);

        _cache.set(Class, Wrapper);
      }

      function Wrapper() {
        return _construct(Class, arguments, _getPrototypeOf(this).constructor);
      }

      Wrapper.prototype = Object.create(Class.prototype, {
        constructor: {
          value: Wrapper,
          enumerable: false,
          writable: true,
          configurable: true
        }
      });
      return _setPrototypeOf(Wrapper, Class);
    };

    return _wrapNativeSuper(Class);
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

  function _createSuper(Derived) {
    var hasNativeReflectConstruct = _isNativeReflectConstruct();

    return function () {
      var Super = _getPrototypeOf(Derived),
          result;

      if (hasNativeReflectConstruct) {
        var NewTarget = _getPrototypeOf(this).constructor;

        result = Reflect.construct(Super, arguments, NewTarget);
      } else {
        result = Super.apply(this, arguments);
      }

      return _possibleConstructorReturn(this, result);
    };
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

  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }

  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;

    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

    return arr2;
  }

  function _createForOfIteratorHelper(o) {
    if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) {
      if (Array.isArray(o) || (o = _unsupportedIterableToArray(o))) {
        var i = 0;

        var F = function () {};

        return {
          s: F,
          n: function () {
            if (i >= o.length) return {
              done: true
            };
            return {
              done: false,
              value: o[i++]
            };
          },
          e: function (e) {
            throw e;
          },
          f: F
        };
      }

      throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }

    var it,
        normalCompletion = true,
        didErr = false,
        err;
    return {
      s: function () {
        it = o[Symbol.iterator]();
      },
      n: function () {
        var step = it.next();
        normalCompletion = step.done;
        return step;
      },
      e: function (e) {
        didErr = true;
        err = e;
      },
      f: function () {
        try {
          if (!normalCompletion && it.return != null) it.return();
        } finally {
          if (didErr) throw err;
        }
      }
    };
  }

  var ColorChannel = {
    RED: 0,
    GREEN: 1,
    BLUE: 2,
    ALPHA: 3
  };

  var Disposable = function () {
    function Disposable() {
      _classCallCheck(this, Disposable);
    }

    _createClass(Disposable, [{
      key: "dispose",
      value: function dispose() {}
    }]);

    return Disposable;
  }();

  var Initializable = function () {
    function Initializable() {
      _classCallCheck(this, Initializable);
    }

    _createClass(Initializable, [{
      key: "initialize",
      value: function initialize(renderer, alpha, frameBufferType) {}
    }]);

    return Initializable;
  }();

  var fragmentShader = "uniform sampler2D previousLuminanceBuffer;uniform sampler2D currentLuminanceBuffer;uniform float minLuminance;uniform float deltaTime;uniform float tau;varying vec2 vUv;void main(){float previousLuminance=texture2D(previousLuminanceBuffer,vUv,MIP_LEVEL_1X1).r;float currentLuminance=texture2D(currentLuminanceBuffer,vUv,MIP_LEVEL_1X1).r;previousLuminance=max(minLuminance,previousLuminance);currentLuminance=max(minLuminance,currentLuminance);float adaptedLum=previousLuminance+(currentLuminance-previousLuminance)*(1.0-exp(-deltaTime*tau));gl_FragColor.r=adaptedLum;}";
  var vertexShader = "varying vec2 vUv;void main(){vUv=position.xy*0.5+0.5;gl_Position=vec4(position.xy,1.0,1.0);}";

  var AdaptiveLuminanceMaterial = function (_ShaderMaterial) {
    _inherits(AdaptiveLuminanceMaterial, _ShaderMaterial);

    var _super = _createSuper(AdaptiveLuminanceMaterial);

    function AdaptiveLuminanceMaterial() {
      var _this;

      _classCallCheck(this, AdaptiveLuminanceMaterial);

      _this = _super.call(this, {
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
      });
      _this.toneMapped = false;
      return _this;
    }

    return AdaptiveLuminanceMaterial;
  }(three.ShaderMaterial);

  var fragmentShader$1 = "uniform sampler2D inputBuffer;uniform sampler2D cocBuffer;uniform vec2 texelSize;uniform float scale;\n#if PASS == 1\nuniform float kernel64[128];\n#else\nuniform float kernel16[32];\n#endif\nvarying vec2 vUv;void main(){\n#ifdef FOREGROUND\nvec2 CoCNearFar=texture2D(cocBuffer,vUv).rg;float CoC=CoCNearFar.r*scale;\n#else\nfloat CoC=texture2D(cocBuffer,vUv).g*scale;\n#endif\nif(CoC==0.0){gl_FragColor=texture2D(inputBuffer,vUv);}else{\n#ifdef FOREGROUND\nvec2 step=texelSize*max(CoC,CoCNearFar.g*scale);\n#else\nvec2 step=texelSize*CoC;\n#endif\n#if PASS == 1\nvec4 acc=vec4(0.0);for(int i=0;i<128;i+=2){vec2 uv=step*vec2(kernel64[i],kernel64[i+1])+vUv;acc+=texture2D(inputBuffer,uv);}gl_FragColor=acc/64.0;\n#else\nvec4 maxValue=texture2D(inputBuffer,vUv);for(int i=0;i<32;i+=2){vec2 uv=step*vec2(kernel16[i],kernel16[i+1])+vUv;maxValue=max(texture2D(inputBuffer,uv),maxValue);}gl_FragColor=maxValue;\n#endif\n}}";

  var BokehMaterial = function (_ShaderMaterial2) {
    _inherits(BokehMaterial, _ShaderMaterial2);

    var _super2 = _createSuper(BokehMaterial);

    function BokehMaterial() {
      var _this2;

      var fill = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
      var foreground = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

      _classCallCheck(this, BokehMaterial);

      _this2 = _super2.call(this, {
        type: "BokehMaterial",
        defines: {
          PASS: fill ? "2" : "1"
        },
        uniforms: {
          kernel64: new three.Uniform(new Float32Array(128)),
          kernel16: new three.Uniform(new Float32Array(32)),
          inputBuffer: new three.Uniform(null),
          cocBuffer: new three.Uniform(null),
          texelSize: new three.Uniform(new three.Vector2()),
          scale: new three.Uniform(1.0)
        },
        fragmentShader: fragmentShader$1,
        vertexShader: vertexShader,
        depthWrite: false,
        depthTest: false
      });
      _this2.toneMapped = false;

      if (foreground) {
        _this2.defines.FOREGROUND = "1";
      }

      _this2.generateKernel();

      return _this2;
    }

    _createClass(BokehMaterial, [{
      key: "generateKernel",
      value: function generateKernel() {
        var GOLDEN_ANGLE = 2.39996323;
        var points64 = this.uniforms.kernel64.value;
        var points16 = this.uniforms.kernel16.value;
        var i64 = 0,
            i16 = 0;

        for (var i = 0; i < 80; ++i) {
          var theta = i * GOLDEN_ANGLE;
          var r = Math.sqrt(i) / Math.sqrt(80);

          var u = r * Math.cos(theta),
              _v = r * Math.sin(theta);

          if (i % 5 === 0) {
            points16[i16++] = u;
            points16[i16++] = _v;
          } else {
            points64[i64++] = u;
            points64[i64++] = _v;
          }
        }
      }
    }, {
      key: "setTexelSize",
      value: function setTexelSize(x, y) {
        this.uniforms.texelSize.value.set(x, y);
      }
    }]);

    return BokehMaterial;
  }(three.ShaderMaterial);

  var fragmentShader$2 = "#include <common>\n#include <packing>\n#ifdef GL_FRAGMENT_PRECISION_HIGH\nuniform highp sampler2D depthBuffer;\n#else\nuniform mediump sampler2D depthBuffer;\n#endif\nuniform float focusDistance;uniform float focalLength;uniform float cameraNear;uniform float cameraFar;varying vec2 vUv;float readDepth(const in vec2 uv){\n#if DEPTH_PACKING == 3201\nreturn unpackRGBAToDepth(texture2D(depthBuffer,uv));\n#else\nreturn texture2D(depthBuffer,uv).r;\n#endif\n}void main(){float depth=readDepth(vUv);\n#ifdef PERSPECTIVE_CAMERA\nfloat viewZ=perspectiveDepthToViewZ(depth,cameraNear,cameraFar);float linearDepth=viewZToOrthographicDepth(viewZ,cameraNear,cameraFar);\n#else\nfloat linearDepth=depth;\n#endif\nfloat signedDistance=linearDepth-focusDistance;float magnitude=smoothstep(0.0,focalLength,abs(signedDistance));gl_FragColor.rg=vec2(step(signedDistance,0.0)*magnitude,step(0.0,signedDistance)*magnitude);}";

  var CircleOfConfusionMaterial = function (_ShaderMaterial3) {
    _inherits(CircleOfConfusionMaterial, _ShaderMaterial3);

    var _super3 = _createSuper(CircleOfConfusionMaterial);

    function CircleOfConfusionMaterial(camera) {
      var _this3;

      _classCallCheck(this, CircleOfConfusionMaterial);

      _this3 = _super3.call(this, {
        type: "CircleOfConfusionMaterial",
        defines: {
          DEPTH_PACKING: "0"
        },
        uniforms: {
          depthBuffer: new three.Uniform(null),
          focusDistance: new three.Uniform(0.0),
          focalLength: new three.Uniform(0.0),
          cameraNear: new three.Uniform(0.3),
          cameraFar: new three.Uniform(1000)
        },
        fragmentShader: fragmentShader$2,
        vertexShader: vertexShader,
        depthWrite: false,
        depthTest: false
      });
      _this3.toneMapped = false;

      _this3.adoptCameraSettings(camera);

      return _this3;
    }

    _createClass(CircleOfConfusionMaterial, [{
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

          this.needsUpdate = true;
        }
      }
    }, {
      key: "depthPacking",
      get: function get() {
        return Number(this.defines.DEPTH_PACKING);
      },
      set: function set(value) {
        this.defines.DEPTH_PACKING = value.toFixed(0);
        this.needsUpdate = true;
      }
    }]);

    return CircleOfConfusionMaterial;
  }(three.ShaderMaterial);

  var fragmentShaderColor = "uniform sampler2D inputBuffer;varying vec2 vUv;varying vec2 vUv0;varying vec2 vUv1;varying vec2 vUv2;varying vec2 vUv3;varying vec2 vUv4;varying vec2 vUv5;void main(){const vec2 threshold=vec2(EDGE_THRESHOLD);vec4 delta;vec3 c=texture2D(inputBuffer,vUv).rgb;vec3 cLeft=texture2D(inputBuffer,vUv0).rgb;vec3 t=abs(c-cLeft);delta.x=max(max(t.r,t.g),t.b);vec3 cTop=texture2D(inputBuffer,vUv1).rgb;t=abs(c-cTop);delta.y=max(max(t.r,t.g),t.b);vec2 edges=step(threshold,delta.xy);if(dot(edges,vec2(1.0))==0.0){discard;}vec3 cRight=texture2D(inputBuffer,vUv2).rgb;t=abs(c-cRight);delta.z=max(max(t.r,t.g),t.b);vec3 cBottom=texture2D(inputBuffer,vUv3).rgb;t=abs(c-cBottom);delta.w=max(max(t.r,t.g),t.b);vec2 maxDelta=max(delta.xy,delta.zw);vec3 cLeftLeft=texture2D(inputBuffer,vUv4).rgb;t=abs(c-cLeftLeft);delta.z=max(max(t.r,t.g),t.b);vec3 cTopTop=texture2D(inputBuffer,vUv5).rgb;t=abs(c-cTopTop);delta.w=max(max(t.r,t.g),t.b);maxDelta=max(maxDelta.xy,delta.zw);float finalDelta=max(maxDelta.x,maxDelta.y);edges*=step(finalDelta,LOCAL_CONTRAST_ADAPTATION_FACTOR*delta.xy);gl_FragColor=vec4(edges,0.0,1.0);}";
  var vertexShader$1 = "uniform vec2 texelSize;varying vec2 vUv;varying vec2 vUv0;varying vec2 vUv1;\n#if EDGE_DETECTION_MODE != 0\nvarying vec2 vUv2;varying vec2 vUv3;varying vec2 vUv4;varying vec2 vUv5;\n#endif\nvoid main(){vUv=position.xy*0.5+0.5;vUv0=vUv+texelSize*vec2(-1.0,0.0);vUv1=vUv+texelSize*vec2(0.0,-1.0);\n#if EDGE_DETECTION_MODE != 0\nvUv2=vUv+texelSize*vec2(1.0,0.0);vUv3=vUv+texelSize*vec2(0.0,1.0);vUv4=vUv+texelSize*vec2(-2.0,0.0);vUv5=vUv+texelSize*vec2(0.0,-2.0);\n#endif\ngl_Position=vec4(position.xy,1.0,1.0);}";

  var ColorEdgesMaterial = function (_ShaderMaterial4) {
    _inherits(ColorEdgesMaterial, _ShaderMaterial4);

    var _super4 = _createSuper(ColorEdgesMaterial);

    function ColorEdgesMaterial() {
      var _this4;

      var texelSize = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : new three.Vector2();

      _classCallCheck(this, ColorEdgesMaterial);

      _this4 = _super4.call(this, {
        type: "ColorEdgesMaterial",
        defines: {
          LOCAL_CONTRAST_ADAPTATION_FACTOR: "2.0",
          EDGE_THRESHOLD: "0.1"
        },
        uniforms: {
          inputBuffer: new three.Uniform(null),
          texelSize: new three.Uniform(texelSize)
        },
        fragmentShader: fragmentShaderColor,
        vertexShader: vertexShader$1,
        depthWrite: false,
        depthTest: false
      });
      _this4.toneMapped = false;
      return _this4;
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

  var fragmentShader$3 = "#include <common>\n#include <dithering_pars_fragment>\nuniform sampler2D inputBuffer;varying vec2 vUv0;varying vec2 vUv1;varying vec2 vUv2;varying vec2 vUv3;void main(){vec4 sum=texture2D(inputBuffer,vUv0);sum+=texture2D(inputBuffer,vUv1);sum+=texture2D(inputBuffer,vUv2);sum+=texture2D(inputBuffer,vUv3);gl_FragColor=sum*0.25;\n#include <dithering_fragment>\n}";
  var vertexShader$2 = "uniform vec2 texelSize;uniform vec2 halfTexelSize;uniform float kernel;uniform float scale;/*Packing multiple texture coordinates into one varying and using a swizzle toextract them in the fragment shader still causes a dependent texture read.*/varying vec2 vUv0;varying vec2 vUv1;varying vec2 vUv2;varying vec2 vUv3;void main(){vec2 uv=position.xy*0.5+0.5;vec2 dUv=(texelSize*vec2(kernel)+halfTexelSize)*scale;vUv0=vec2(uv.x-dUv.x,uv.y+dUv.y);vUv1=vec2(uv.x+dUv.x,uv.y+dUv.y);vUv2=vec2(uv.x+dUv.x,uv.y-dUv.y);vUv3=vec2(uv.x-dUv.x,uv.y-dUv.y);gl_Position=vec4(position.xy,1.0,1.0);}";

  var ConvolutionMaterial = function (_ShaderMaterial5) {
    _inherits(ConvolutionMaterial, _ShaderMaterial5);

    var _super5 = _createSuper(ConvolutionMaterial);

    function ConvolutionMaterial() {
      var _this5;

      var texelSize = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : new three.Vector2();

      _classCallCheck(this, ConvolutionMaterial);

      _this5 = _super5.call(this, {
        type: "ConvolutionMaterial",
        uniforms: {
          inputBuffer: new three.Uniform(null),
          texelSize: new three.Uniform(new three.Vector2()),
          halfTexelSize: new three.Uniform(new three.Vector2()),
          kernel: new three.Uniform(0.0),
          scale: new three.Uniform(1.0)
        },
        fragmentShader: fragmentShader$3,
        vertexShader: vertexShader$2,
        depthWrite: false,
        depthTest: false
      });
      _this5.toneMapped = false;

      _this5.setTexelSize(texelSize.x, texelSize.y);

      _this5.kernelSize = KernelSize.LARGE;
      return _this5;
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
  var fragmentShader$4 = "uniform sampler2D inputBuffer;uniform float opacity;varying vec2 vUv;void main(){vec4 texel=texture2D(inputBuffer,vUv);gl_FragColor=opacity*texel;\n#include <encodings_fragment>\n}";

  var CopyMaterial = function (_ShaderMaterial6) {
    _inherits(CopyMaterial, _ShaderMaterial6);

    var _super6 = _createSuper(CopyMaterial);

    function CopyMaterial() {
      var _this6;

      _classCallCheck(this, CopyMaterial);

      _this6 = _super6.call(this, {
        type: "CopyMaterial",
        uniforms: {
          inputBuffer: new three.Uniform(null),
          opacity: new three.Uniform(1.0)
        },
        fragmentShader: fragmentShader$4,
        vertexShader: vertexShader,
        depthWrite: false,
        depthTest: false
      });
      _this6.toneMapped = false;
      return _this6;
    }

    return CopyMaterial;
  }(three.ShaderMaterial);

  var fragmentShader$5 = "#include <packing>\n#include <clipping_planes_pars_fragment>\n#ifdef GL_FRAGMENT_PRECISION_HIGH\nuniform highp sampler2D depthBuffer;\n#else\nuniform mediump sampler2D depthBuffer;\n#endif\nuniform float cameraNear;uniform float cameraFar;varying float vViewZ;varying vec4 vProjTexCoord;void main(){\n#include <clipping_planes_fragment>\nvec2 projTexCoord=(vProjTexCoord.xy/vProjTexCoord.w)*0.5+0.5;projTexCoord=clamp(projTexCoord,0.002,0.998);float fragCoordZ=unpackRGBAToDepth(texture2D(depthBuffer,projTexCoord));\n#ifdef PERSPECTIVE_CAMERA\nfloat viewZ=perspectiveDepthToViewZ(fragCoordZ,cameraNear,cameraFar);\n#else\nfloat viewZ=orthographicDepthToViewZ(fragCoordZ,cameraNear,cameraFar);\n#endif\nfloat depthTest=(-vViewZ>-viewZ)? 1.0 : 0.0;gl_FragColor.rg=vec2(0.0,depthTest);}";
  var vertexShader$3 = "#include <common>\n#include <morphtarget_pars_vertex>\n#include <skinning_pars_vertex>\n#include <clipping_planes_pars_vertex>\nvarying float vViewZ;varying vec4 vProjTexCoord;void main(){\n#include <skinbase_vertex>\n#include <begin_vertex>\n#include <morphtarget_vertex>\n#include <skinning_vertex>\n#include <project_vertex>\nvViewZ=mvPosition.z;vProjTexCoord=gl_Position;\n#include <clipping_planes_vertex>\n}";

  var DepthComparisonMaterial = function (_ShaderMaterial7) {
    _inherits(DepthComparisonMaterial, _ShaderMaterial7);

    var _super7 = _createSuper(DepthComparisonMaterial);

    function DepthComparisonMaterial() {
      var _this7;

      var depthTexture = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      var camera = arguments.length > 1 ? arguments[1] : undefined;

      _classCallCheck(this, DepthComparisonMaterial);

      _this7 = _super7.call(this, {
        type: "DepthComparisonMaterial",
        uniforms: {
          depthBuffer: new three.Uniform(depthTexture),
          cameraNear: new three.Uniform(0.3),
          cameraFar: new three.Uniform(1000)
        },
        fragmentShader: fragmentShader$5,
        vertexShader: vertexShader$3,
        depthWrite: false,
        depthTest: false,
        morphTargets: true,
        skinning: true
      });
      _this7.toneMapped = false;

      _this7.adoptCameraSettings(camera);

      return _this7;
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

  var fragmentShader$6 = "#include <common>\n#include <packing>\n#ifdef GL_FRAGMENT_PRECISION_HIGH\nuniform highp sampler2D depthBuffer0;uniform highp sampler2D depthBuffer1;\n#else\nuniform mediump sampler2D depthBuffer0;uniform mediump sampler2D depthBuffer1;\n#endif\nuniform sampler2D inputBuffer;varying vec2 vUv;void main(){\n#if DEPTH_PACKING_0 == 3201\nfloat d0=unpackRGBAToDepth(texture2D(depthBuffer0,vUv));\n#else\nfloat d0=texture2D(depthBuffer0,vUv).r;\n#endif\n#if DEPTH_PACKING_1 == 3201\nfloat d1=unpackRGBAToDepth(texture2D(depthBuffer1,vUv));\n#else\nfloat d1=texture2D(depthBuffer1,vUv).r;\n#endif\nif(d0<d1){discard;}gl_FragColor=texture2D(inputBuffer,vUv);}";

  var DepthMaskMaterial = function (_ShaderMaterial8) {
    _inherits(DepthMaskMaterial, _ShaderMaterial8);

    var _super8 = _createSuper(DepthMaskMaterial);

    function DepthMaskMaterial() {
      var _this8;

      _classCallCheck(this, DepthMaskMaterial);

      _this8 = _super8.call(this, {
        type: "DepthMaskMaterial",
        defines: {
          DEPTH_PACKING_0: "0",
          DEPTH_PACKING_1: "0"
        },
        uniforms: {
          depthBuffer0: new three.Uniform(null),
          depthBuffer1: new three.Uniform(null),
          inputBuffer: new three.Uniform(null)
        },
        fragmentShader: fragmentShader$6,
        vertexShader: vertexShader,
        depthWrite: false,
        depthTest: false
      });
      _this8.toneMapped = false;
      return _this8;
    }

    return DepthMaskMaterial;
  }(three.ShaderMaterial);

  var fragmentShaderDepth = "#include <packing>\n#ifdef GL_FRAGMENT_PRECISION_HIGH\nuniform highp sampler2D depthBuffer;\n#else\nuniform mediump sampler2D depthBuffer;\n#endif\nvarying vec2 vUv;varying vec2 vUv0;varying vec2 vUv1;float readDepth(const in vec2 uv){\n#if DEPTH_PACKING == 3201\nreturn unpackRGBAToDepth(texture2D(depthBuffer,uv));\n#else\nreturn texture2D(depthBuffer,uv).r;\n#endif\n}/***Gathers the current texel,and the top-left neighbors.*/vec3 gatherNeighbors(){float p=readDepth(vUv);float pLeft=readDepth(vUv0);float pTop=readDepth(vUv1);return vec3(p,pLeft,pTop);}void main(){const vec2 threshold=vec2(DEPTH_THRESHOLD);vec3 neighbors=gatherNeighbors();vec2 delta=abs(neighbors.xx-vec2(neighbors.y,neighbors.z));vec2 edges=step(threshold,delta);if(dot(edges,vec2(1.0))==0.0){discard;}gl_FragColor=vec4(edges,0.0,1.0);}";
  var fragmentShaderLuma = "#include <common>\nuniform sampler2D inputBuffer;varying vec2 vUv;varying vec2 vUv0;varying vec2 vUv1;varying vec2 vUv2;varying vec2 vUv3;varying vec2 vUv4;varying vec2 vUv5;void main(){const vec2 threshold=vec2(EDGE_THRESHOLD);float l=linearToRelativeLuminance(texture2D(inputBuffer,vUv).rgb);float lLeft=linearToRelativeLuminance(texture2D(inputBuffer,vUv0).rgb);float lTop=linearToRelativeLuminance(texture2D(inputBuffer,vUv1).rgb);vec4 delta;delta.xy=abs(l-vec2(lLeft,lTop));vec2 edges=step(threshold,delta.xy);if(dot(edges,vec2(1.0))==0.0){discard;}float lRight=linearToRelativeLuminance(texture2D(inputBuffer,vUv2).rgb);float lBottom=linearToRelativeLuminance(texture2D(inputBuffer,vUv3).rgb);delta.zw=abs(l-vec2(lRight,lBottom));vec2 maxDelta=max(delta.xy,delta.zw);float lLeftLeft=linearToRelativeLuminance(texture2D(inputBuffer,vUv4).rgb);float lTopTop=linearToRelativeLuminance(texture2D(inputBuffer,vUv5).rgb);delta.zw=abs(vec2(lLeft,lTop)-vec2(lLeftLeft,lTopTop));maxDelta=max(maxDelta.xy,delta.zw);float finalDelta=max(maxDelta.x,maxDelta.y);edges.xy*=step(finalDelta,LOCAL_CONTRAST_ADAPTATION_FACTOR*delta.xy);gl_FragColor=vec4(edges,0.0,1.0);}";

  var EdgeDetectionMaterial = function (_ShaderMaterial9) {
    _inherits(EdgeDetectionMaterial, _ShaderMaterial9);

    var _super9 = _createSuper(EdgeDetectionMaterial);

    function EdgeDetectionMaterial() {
      var _this9;

      var texelSize = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : new three.Vector2();
      var mode = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : EdgeDetectionMode.COLOR;

      _classCallCheck(this, EdgeDetectionMaterial);

      _this9 = _super9.call(this, {
        type: "EdgeDetectionMaterial",
        defines: {
          LOCAL_CONTRAST_ADAPTATION_FACTOR: "2.0",
          EDGE_THRESHOLD: "0.1",
          DEPTH_THRESHOLD: "0.01",
          DEPTH_PACKING: "0"
        },
        uniforms: {
          inputBuffer: new three.Uniform(null),
          depthBuffer: new three.Uniform(null),
          texelSize: new three.Uniform(texelSize)
        },
        vertexShader: vertexShader$1,
        depthWrite: false,
        depthTest: false
      });
      _this9.toneMapped = false;

      _this9.setEdgeDetectionMode(mode);

      return _this9;
    }

    _createClass(EdgeDetectionMaterial, [{
      key: "setEdgeDetectionMode",
      value: function setEdgeDetectionMode(mode) {
        switch (mode) {
          case EdgeDetectionMode.DEPTH:
            this.fragmentShader = fragmentShaderDepth;
            break;

          case EdgeDetectionMode.LUMA:
            this.fragmentShader = fragmentShaderLuma;
            break;

          case EdgeDetectionMode.COLOR:
          default:
            this.fragmentShader = fragmentShaderColor;
            break;
        }

        this.defines.EDGE_DETECTION_MODE = mode.toFixed(0);
        this.needsUpdate = true;
      }
    }, {
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
        this.defines.DEPTH_THRESHOLD = (threshold * 0.1).toFixed("3");
        this.needsUpdate = true;
      }
    }, {
      key: "depthPacking",
      get: function get() {
        return Number(this.defines.DEPTH_PACKING);
      },
      set: function set(value) {
        this.defines.DEPTH_PACKING = value.toFixed(0);
        this.needsUpdate = true;
      }
    }]);

    return EdgeDetectionMaterial;
  }(three.ShaderMaterial);

  var EdgeDetectionMode = {
    DEPTH: 0,
    LUMA: 1,
    COLOR: 2
  };
  var fragmentTemplate = "#include <common>\n#include <packing>\n#include <dithering_pars_fragment>\nuniform sampler2D inputBuffer;\n#ifdef GL_FRAGMENT_PRECISION_HIGH\nuniform highp sampler2D depthBuffer;\n#else\nuniform mediump sampler2D depthBuffer;\n#endif\nuniform vec2 resolution;uniform vec2 texelSize;uniform float cameraNear;uniform float cameraFar;uniform float aspect;uniform float time;varying vec2 vUv;float readDepth(const in vec2 uv){\n#if DEPTH_PACKING == 3201\nreturn unpackRGBAToDepth(texture2D(depthBuffer,uv));\n#else\nreturn texture2D(depthBuffer,uv).r;\n#endif\n}float getViewZ(const in float depth){\n#ifdef PERSPECTIVE_CAMERA\nreturn perspectiveDepthToViewZ(depth,cameraNear,cameraFar);\n#else\nreturn orthographicDepthToViewZ(depth,cameraNear,cameraFar);\n#endif\n}FRAGMENT_HEADvoid main(){FRAGMENT_MAIN_UVvec4 color0=texture2D(inputBuffer,UV);vec4 color1=vec4(0.0);FRAGMENT_MAIN_IMAGEgl_FragColor=color0;\n#ifdef ENCODE_OUTPUT\n#include <encodings_fragment>\n#endif\n#include <dithering_fragment>\n}";
  var vertexTemplate = "uniform vec2 resolution;uniform vec2 texelSize;uniform float cameraNear;uniform float cameraFar;uniform float aspect;uniform float time;varying vec2 vUv;VERTEX_HEADvoid main(){vUv=position.xy*0.5+0.5;VERTEX_MAIN_SUPPORTgl_Position=vec4(position.xy,1.0,1.0);}";

  var EffectMaterial = function (_ShaderMaterial10) {
    _inherits(EffectMaterial, _ShaderMaterial10);

    var _super10 = _createSuper(EffectMaterial);

    function EffectMaterial() {
      var _this10;

      var shaderParts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      var defines = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      var uniforms = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
      var camera = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
      var dithering = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;

      _classCallCheck(this, EffectMaterial);

      _this10 = _super10.call(this, {
        type: "EffectMaterial",
        defines: {
          DEPTH_PACKING: "0",
          ENCODE_OUTPUT: "1"
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
        depthWrite: false,
        depthTest: false,
        dithering: dithering
      });
      _this10.toneMapped = false;

      if (shaderParts !== null) {
        _this10.setShaderParts(shaderParts);
      }

      if (defines !== null) {
        _this10.setDefines(defines);
      }

      if (uniforms !== null) {
        _this10.setUniforms(uniforms);
      }

      _this10.adoptCameraSettings(camera);

      return _this10;
    }

    _createClass(EffectMaterial, [{
      key: "setShaderParts",
      value: function setShaderParts(shaderParts) {
        this.fragmentShader = fragmentTemplate.replace(Section.FRAGMENT_HEAD, shaderParts.get(Section.FRAGMENT_HEAD)).replace(Section.FRAGMENT_MAIN_UV, shaderParts.get(Section.FRAGMENT_MAIN_UV)).replace(Section.FRAGMENT_MAIN_IMAGE, shaderParts.get(Section.FRAGMENT_MAIN_IMAGE));
        this.vertexShader = vertexTemplate.replace(Section.VERTEX_HEAD, shaderParts.get(Section.VERTEX_HEAD)).replace(Section.VERTEX_MAIN_SUPPORT, shaderParts.get(Section.VERTEX_MAIN_SUPPORT));
        this.needsUpdate = true;
        return this;
      }
    }, {
      key: "setDefines",
      value: function setDefines(defines) {
        var _iterator = _createForOfIteratorHelper(defines.entries()),
            _step;

        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var entry = _step.value;
            this.defines[entry[0]] = entry[1];
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }

        this.needsUpdate = true;
        return this;
      }
    }, {
      key: "setUniforms",
      value: function setUniforms(uniforms) {
        var _iterator2 = _createForOfIteratorHelper(uniforms.entries()),
            _step2;

        try {
          for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
            var entry = _step2.value;
            this.uniforms[entry[0]] = entry[1];
          }
        } catch (err) {
          _iterator2.e(err);
        } finally {
          _iterator2.f();
        }

        return this;
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

          this.needsUpdate = true;
        }
      }
    }, {
      key: "setSize",
      value: function setSize(width, height) {
        width = Math.max(width, 1.0);
        height = Math.max(height, 1.0);
        this.uniforms.resolution.value.set(width, height);
        this.uniforms.texelSize.value.set(1.0 / width, 1.0 / height);
        this.uniforms.aspect.value = width / height;
      }
    }, {
      key: "depthPacking",
      get: function get() {
        return Number(this.defines.DEPTH_PACKING);
      },
      set: function set(value) {
        this.defines.DEPTH_PACKING = value.toFixed(0);
        this.needsUpdate = true;
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
  var fragmentShader$7 = "#include <common>\n#include <dithering_pars_fragment>\nuniform sampler2D inputBuffer;uniform vec2 lightPosition;uniform float exposure;uniform float decay;uniform float density;uniform float weight;uniform float clampMax;varying vec2 vUv;void main(){vec2 coord=vUv;vec2 delta=lightPosition-coord;delta*=1.0/SAMPLES_FLOAT*density;float illuminationDecay=1.0;vec4 color=vec4(0.0);/*Estimate the probability of occlusion at each pixel by summing samplesalong a ray to the light position.*/for(int i=0;i<SAMPLES_INT;++i){coord+=delta;vec4 texel=texture2D(inputBuffer,coord);texel*=illuminationDecay*weight;color+=texel;illuminationDecay*=decay;}gl_FragColor=clamp(color*exposure,0.0,clampMax);\n#include <dithering_fragment>\n}";

  var GodRaysMaterial = function (_ShaderMaterial11) {
    _inherits(GodRaysMaterial, _ShaderMaterial11);

    var _super11 = _createSuper(GodRaysMaterial);

    function GodRaysMaterial(lightPosition) {
      var _this11;

      _classCallCheck(this, GodRaysMaterial);

      _this11 = _super11.call(this, {
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
        fragmentShader: fragmentShader$7,
        vertexShader: vertexShader,
        depthWrite: false,
        depthTest: false
      });
      _this11.toneMapped = false;
      return _this11;
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

  var fragmentShader$8 = "#include <common>\nuniform sampler2D inputBuffer;\n#ifdef RANGE\nuniform vec2 range;\n#elif defined(THRESHOLD)\nuniform float threshold;uniform float smoothing;\n#endif\nvarying vec2 vUv;void main(){vec4 texel=texture2D(inputBuffer,vUv);float l=linearToRelativeLuminance(texel.rgb);\n#ifdef RANGE\nfloat low=step(range.x,l);float high=step(l,range.y);l*=low*high;\n#elif defined(THRESHOLD)\nl=smoothstep(threshold,threshold+smoothing,l);\n#endif\n#ifdef COLOR\ngl_FragColor=vec4(texel.rgb*l,l);\n#else\ngl_FragColor=vec4(l);\n#endif\n}";

  var LuminanceMaterial = function (_ShaderMaterial12) {
    _inherits(LuminanceMaterial, _ShaderMaterial12);

    var _super12 = _createSuper(LuminanceMaterial);

    function LuminanceMaterial() {
      var _this12;

      var colorOutput = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
      var luminanceRange = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

      _classCallCheck(this, LuminanceMaterial);

      var useRange = luminanceRange !== null;
      _this12 = _super12.call(this, {
        type: "LuminanceMaterial",
        uniforms: {
          inputBuffer: new three.Uniform(null),
          threshold: new three.Uniform(0.0),
          smoothing: new three.Uniform(1.0),
          range: new three.Uniform(useRange ? luminanceRange : new three.Vector2())
        },
        fragmentShader: fragmentShader$8,
        vertexShader: vertexShader,
        depthWrite: false,
        depthTest: false
      });
      _this12.toneMapped = false;
      _this12.colorOutput = colorOutput;
      _this12.useThreshold = true;
      _this12.useRange = useRange;
      return _this12;
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

  var fragmentShader$9 = "uniform sampler2D maskTexture;uniform sampler2D inputBuffer;\n#if MASK_FUNCTION != 0\nuniform float strength;\n#endif\nvarying vec2 vUv;void main(){\n#if COLOR_CHANNEL == 0\nfloat mask=texture2D(maskTexture,vUv).r;\n#elif COLOR_CHANNEL == 1\nfloat mask=texture2D(maskTexture,vUv).g;\n#elif COLOR_CHANNEL == 2\nfloat mask=texture2D(maskTexture,vUv).b;\n#else\nfloat mask=texture2D(maskTexture,vUv).a;\n#endif\n#if MASK_FUNCTION == 0\n#ifdef INVERTED\nif(mask>0.0){discard;}\n#else\nif(mask==0.0){discard;}\n#endif\n#else\nmask=clamp(mask*strength,0.0,1.0);\n#ifdef INVERTED\nmask=(1.0-mask);\n#endif\n#if MASK_FUNCTION == 1\ngl_FragColor=mask*texture2D(inputBuffer,vUv);\n#else\ngl_FragColor=vec4(mask*texture2D(inputBuffer,vUv).rgb,mask);\n#endif\n#endif\n}";

  var MaskMaterial = function (_ShaderMaterial13) {
    _inherits(MaskMaterial, _ShaderMaterial13);

    var _super13 = _createSuper(MaskMaterial);

    function MaskMaterial() {
      var _this13;

      var maskTexture = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

      _classCallCheck(this, MaskMaterial);

      _this13 = _super13.call(this, {
        type: "MaskMaterial",
        uniforms: {
          maskTexture: new three.Uniform(maskTexture),
          inputBuffer: new three.Uniform(null),
          strength: new three.Uniform(1.0)
        },
        fragmentShader: fragmentShader$9,
        vertexShader: vertexShader,
        depthWrite: false,
        depthTest: false
      });
      _this13.toneMapped = false;
      _this13.colorChannel = ColorChannel.RED;
      _this13.maskFunction = MaskFunction.DISCARD;
      return _this13;
    }

    _createClass(MaskMaterial, [{
      key: "maskTexture",
      set: function set(value) {
        this.uniforms.maskTexture.value = value;
      }
    }, {
      key: "colorChannel",
      set: function set(value) {
        this.defines.COLOR_CHANNEL = value.toFixed(0);
        this.needsUpdate = true;
      }
    }, {
      key: "maskFunction",
      set: function set(value) {
        this.defines.MASK_FUNCTION = value.toFixed(0);
        this.needsUpdate = true;
      }
    }, {
      key: "inverted",
      get: function get() {
        return this.defines.INVERTED !== undefined;
      },
      set: function set(value) {
        if (this.inverted && !value) {
          delete this.defines.INVERTED;
        } else if (value) {
          this.defines.INVERTED = "1";
        }

        this.needsUpdate = true;
      }
    }, {
      key: "strength",
      get: function get() {
        return this.uniforms.strength.value;
      },
      set: function set(value) {
        this.uniforms.strength.value = value;
      }
    }]);

    return MaskMaterial;
  }(three.ShaderMaterial);

  var MaskFunction = {
    DISCARD: 0,
    MULTIPLY: 1,
    MULTIPLY_RGB_SET_ALPHA: 2
  };
  var fragmentShader$a = "uniform sampler2D inputBuffer;varying vec2 vUv0;varying vec2 vUv1;varying vec2 vUv2;varying vec2 vUv3;void main(){vec2 c0=texture2D(inputBuffer,vUv0).rg;vec2 c1=texture2D(inputBuffer,vUv1).rg;vec2 c2=texture2D(inputBuffer,vUv2).rg;vec2 c3=texture2D(inputBuffer,vUv3).rg;float d0=(c0.x-c1.x)*0.5;float d1=(c2.x-c3.x)*0.5;float d=length(vec2(d0,d1));float a0=min(c0.y,c1.y);float a1=min(c2.y,c3.y);float visibilityFactor=min(a0,a1);gl_FragColor.rg=(1.0-visibilityFactor>0.001)? vec2(d,0.0): vec2(0.0,d);}";
  var vertexShader$4 = "uniform vec2 texelSize;varying vec2 vUv0;varying vec2 vUv1;varying vec2 vUv2;varying vec2 vUv3;void main(){vec2 uv=position.xy*0.5+0.5;vUv0=vec2(uv.x+texelSize.x,uv.y);vUv1=vec2(uv.x-texelSize.x,uv.y);vUv2=vec2(uv.x,uv.y+texelSize.y);vUv3=vec2(uv.x,uv.y-texelSize.y);gl_Position=vec4(position.xy,1.0,1.0);}";

  var OutlineMaterial = function (_ShaderMaterial14) {
    _inherits(OutlineMaterial, _ShaderMaterial14);

    var _super14 = _createSuper(OutlineMaterial);

    function OutlineMaterial() {
      var _this14;

      var texelSize = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : new three.Vector2();

      _classCallCheck(this, OutlineMaterial);

      _this14 = _super14.call(this, {
        type: "OutlineMaterial",
        uniforms: {
          inputBuffer: new three.Uniform(null),
          texelSize: new three.Uniform(new three.Vector2())
        },
        fragmentShader: fragmentShader$a,
        vertexShader: vertexShader$4,
        depthWrite: false,
        depthTest: false
      });
      _this14.toneMapped = false;

      _this14.setTexelSize(texelSize.x, texelSize.y);

      _this14.uniforms.maskTexture = _this14.uniforms.inputBuffer;
      return _this14;
    }

    _createClass(OutlineMaterial, [{
      key: "setTexelSize",
      value: function setTexelSize(x, y) {
        this.uniforms.texelSize.value.set(x, y);
      }
    }]);

    return OutlineMaterial;
  }(three.ShaderMaterial);

  var OutlineEdgesMaterial = OutlineMaterial;
  var fragmentShader$b = "#define sampleLevelZeroOffset(t, coord, offset) texture2D(t, coord + offset * texelSize)\n#if __VERSION__ < 300\n#define round(v) floor(v + 0.5)\n#endif\nuniform sampler2D inputBuffer;uniform sampler2D areaTexture;uniform sampler2D searchTexture;uniform vec2 texelSize;uniform vec2 resolution;varying vec2 vUv;varying vec4 vOffset[3];varying vec2 vPixCoord;/***Moves values to a target vector based on a given conditional vector.*/void movec(const in bvec2 c,inout vec2 variable,const in vec2 value){if(c.x){variable.x=value.x;}if(c.y){variable.y=value.y;}}void movec(const in bvec4 c,inout vec4 variable,const in vec4 value){movec(c.xy,variable.xy,value.xy);movec(c.zw,variable.zw,value.zw);}/***Allows to decode two binary values from a bilinear-filtered access.**Bilinear access for fetching 'e' have a 0.25 offset,and we are interested*in the R and G edges:**+---G---+-------+*|x o R   x|*+-------+-------+**Then,if one of these edge is enabled:*Red:(0.75*X+0.25*1)=>0.25 or 1.0*Green:(0.75*1+0.25*X)=>0.75 or 1.0**This function will unpack the values(mad+mul+round):*wolframalpha.com: round(x*abs(5*x-5*0.75))plot 0 to 1*/vec2 decodeDiagBilinearAccess(in vec2 e){e.r=e.r*abs(5.0*e.r-5.0*0.75);return round(e);}vec4 decodeDiagBilinearAccess(in vec4 e){e.rb=e.rb*abs(5.0*e.rb-5.0*0.75);return round(e);}/***Diagonal pattern searches.*/vec2 searchDiag1(const in vec2 texCoord,const in vec2 dir,out vec2 e){vec4 coord=vec4(texCoord,-1.0,1.0);vec3 t=vec3(texelSize,1.0);for(int i=0;i<MAX_SEARCH_STEPS_INT;++i){if(!(coord.z<float(MAX_SEARCH_STEPS_DIAG_INT-1)&&coord.w>0.9)){break;}coord.xyz=t*vec3(dir,1.0)+coord.xyz;e=texture2D(inputBuffer,coord.xy).rg;coord.w=dot(e,vec2(0.5));}return coord.zw;}vec2 searchDiag2(const in vec2 texCoord,const in vec2 dir,out vec2 e){vec4 coord=vec4(texCoord,-1.0,1.0);coord.x+=0.25*texelSize.x;vec3 t=vec3(texelSize,1.0);for(int i=0;i<MAX_SEARCH_STEPS_INT;++i){if(!(coord.z<float(MAX_SEARCH_STEPS_DIAG_INT-1)&&coord.w>0.9)){break;}coord.xyz=t*vec3(dir,1.0)+coord.xyz;e=texture2D(inputBuffer,coord.xy).rg;e=decodeDiagBilinearAccess(e);coord.w=dot(e,vec2(0.5));}return coord.zw;}/***Calculates the area corresponding to a certain diagonal distance and crossing*edges 'e'.*/vec2 areaDiag(const in vec2 dist,const in vec2 e,const in float offset){vec2 texCoord=vec2(AREATEX_MAX_DISTANCE_DIAG,AREATEX_MAX_DISTANCE_DIAG)*e+dist;texCoord=AREATEX_PIXEL_SIZE*texCoord+0.5*AREATEX_PIXEL_SIZE;texCoord.x+=0.5;texCoord.y+=AREATEX_SUBTEX_SIZE*offset;return texture2D(areaTexture,texCoord).rg;}/***Searches for diagonal patterns and returns the corresponding weights.*/vec2 calculateDiagWeights(const in vec2 texCoord,const in vec2 e,const in vec4 subsampleIndices){vec2 weights=vec2(0.0);vec4 d;vec2 end;if(e.r>0.0){d.xz=searchDiag1(texCoord,vec2(-1.0,1.0),end);d.x+=float(end.y>0.9);}else{d.xz=vec2(0.0);}d.yw=searchDiag1(texCoord,vec2(1.0,-1.0),end);if(d.x+d.y>2.0){vec4 coords=vec4(-d.x+0.25,d.x,d.y,-d.y-0.25)*texelSize.xyxy+texCoord.xyxy;vec4 c;c.xy=sampleLevelZeroOffset(inputBuffer,coords.xy,vec2(-1,0)).rg;c.zw=sampleLevelZeroOffset(inputBuffer,coords.zw,vec2(1,0)).rg;c.yxwz=decodeDiagBilinearAccess(c.xyzw);vec2 cc=vec2(2.0)*c.xz+c.yw;movec(bvec2(step(0.9,d.zw)),cc,vec2(0.0));weights+=areaDiag(d.xy,cc,subsampleIndices.z);}d.xz=searchDiag2(texCoord,vec2(-1.0,-1.0),end);if(sampleLevelZeroOffset(inputBuffer,texCoord,vec2(1,0)).r>0.0){d.yw=searchDiag2(texCoord,vec2(1.0),end);d.y+=float(end.y>0.9);}else{d.yw=vec2(0.0);}if(d.x+d.y>2.0){vec4 coords=vec4(-d.x,-d.x,d.y,d.y)*texelSize.xyxy+texCoord.xyxy;vec4 c;c.x=sampleLevelZeroOffset(inputBuffer,coords.xy,vec2(-1,0)).g;c.y=sampleLevelZeroOffset(inputBuffer,coords.xy,vec2(0,-1)).r;c.zw=sampleLevelZeroOffset(inputBuffer,coords.zw,vec2(1,0)).gr;vec2 cc=vec2(2.0)*c.xz+c.yw;movec(bvec2(step(0.9,d.zw)),cc,vec2(0.0));weights+=areaDiag(d.xy,cc,subsampleIndices.w).gr;}return weights;}/***Determines how much length should be added in the last step of the searches.**Takes the bilinearly interpolated edge(see @PSEUDO_GATHER4),and adds 0,1*or 2 depending on which edges and crossing edges are active.*/float searchLength(const in vec2 e,const in float offset){/*The texture is flipped vertically,with left and right cases taking halfof the space horizontally.*/vec2 scale=SEARCHTEX_SIZE*vec2(0.5,-1.0);vec2 bias=SEARCHTEX_SIZE*vec2(offset,1.0);scale+=vec2(-1.0,1.0);bias+=vec2(0.5,-0.5);scale*=1.0/SEARCHTEX_PACKED_SIZE;bias*=1.0/SEARCHTEX_PACKED_SIZE;return texture2D(searchTexture,scale*e+bias).r;}/***Horizontal search for the second pass.*/float searchXLeft(in vec2 texCoord,const in float end){/*@PSEUDO_GATHER4This texCoord has been offset by(-0.25,-0.125)in the vertex shader tosample between edges,thus fetching four edges in a row.Sampling with different offsets in each direction allows to disambiguatewhich edges are active from the four fetched ones.*/vec2 e=vec2(0.0,1.0);for(int i=0;i<MAX_SEARCH_STEPS_INT;++i){if(!(texCoord.x>end&&e.g>0.8281&&e.r==0.0)){break;}e=texture2D(inputBuffer,texCoord).rg;texCoord=vec2(-2.0,0.0)*texelSize+texCoord;}float offset=-(255.0/127.0)*searchLength(e,0.0)+3.25;return texelSize.x*offset+texCoord.x;}float searchXRight(vec2 texCoord,const in float end){vec2 e=vec2(0.0,1.0);for(int i=0;i<MAX_SEARCH_STEPS_INT;++i){if(!(texCoord.x<end&&e.g>0.8281&&e.r==0.0)){break;}e=texture2D(inputBuffer,texCoord).rg;texCoord=vec2(2.0,0.0)*texelSize.xy+texCoord;}float offset=-(255.0/127.0)*searchLength(e,0.5)+3.25;return-texelSize.x*offset+texCoord.x;}/***Vertical search for the second pass.*/float searchYUp(vec2 texCoord,const in float end){vec2 e=vec2(1.0,0.0);for(int i=0;i<MAX_SEARCH_STEPS_INT;++i){if(!(texCoord.y>end&&e.r>0.8281&&e.g==0.0)){break;}e=texture2D(inputBuffer,texCoord).rg;texCoord=-vec2(0.0,2.0)*texelSize.xy+texCoord;}float offset=-(255.0/127.0)*searchLength(e.gr,0.0)+3.25;return texelSize.y*offset+texCoord.y;}float searchYDown(vec2 texCoord,const in float end){vec2 e=vec2(1.0,0.0);for(int i=0;i<MAX_SEARCH_STEPS_INT;i++){if(!(texCoord.y<end&&e.r>0.8281&&e.g==0.0)){break;}e=texture2D(inputBuffer,texCoord).rg;texCoord=vec2(0.0,2.0)*texelSize.xy+texCoord;}float offset=-(255.0/127.0)*searchLength(e.gr,0.5)+3.25;return-texelSize.y*offset+texCoord.y;}/***Determines the areas at each side of the current edge.*/vec2 area(const in vec2 dist,const in float e1,const in float e2,const in float offset){vec2 texCoord=vec2(AREATEX_MAX_DISTANCE)*round(4.0*vec2(e1,e2))+dist;texCoord=AREATEX_PIXEL_SIZE*texCoord+0.5*AREATEX_PIXEL_SIZE;texCoord.y=AREATEX_SUBTEX_SIZE*offset+texCoord.y;return texture2D(areaTexture,texCoord).rg;}/***Corner detection.*/void detectHorizontalCornerPattern(inout vec2 weights,const in vec4 texCoord,const in vec2 d){\n#if !defined(DISABLE_CORNER_DETECTION)\nvec2 leftRight=step(d.xy,d.yx);vec2 rounding=(1.0-CORNER_ROUNDING_NORM)*leftRight;rounding/=leftRight.x+leftRight.y;vec2 factor=vec2(1.0);factor.x-=rounding.x*sampleLevelZeroOffset(inputBuffer,texCoord.xy,vec2(0,1)).r;factor.x-=rounding.y*sampleLevelZeroOffset(inputBuffer,texCoord.zw,vec2(1,1)).r;factor.y-=rounding.x*sampleLevelZeroOffset(inputBuffer,texCoord.xy,vec2(0,-2)).r;factor.y-=rounding.y*sampleLevelZeroOffset(inputBuffer,texCoord.zw,vec2(1,-2)).r;weights*=clamp(factor,0.0,1.0);\n#endif\n}void detectVerticalCornerPattern(inout vec2 weights,const in vec4 texCoord,const in vec2 d){\n#if !defined(DISABLE_CORNER_DETECTION)\nvec2 leftRight=step(d.xy,d.yx);vec2 rounding=(1.0-CORNER_ROUNDING_NORM)*leftRight;rounding/=leftRight.x+leftRight.y;vec2 factor=vec2(1.0);factor.x-=rounding.x*sampleLevelZeroOffset(inputBuffer,texCoord.xy,vec2(1,0)).g;factor.x-=rounding.y*sampleLevelZeroOffset(inputBuffer,texCoord.zw,vec2(1,1)).g;factor.y-=rounding.x*sampleLevelZeroOffset(inputBuffer,texCoord.xy,vec2(-2,0)).g;factor.y-=rounding.y*sampleLevelZeroOffset(inputBuffer,texCoord.zw,vec2(-2,1)).g;weights*=clamp(factor,0.0,1.0);\n#endif\n}void main(){vec4 weights=vec4(0.0);vec4 subsampleIndices=vec4(0.0);vec2 e=texture2D(inputBuffer,vUv).rg;if(e.g>0.0){\n#if !defined(DISABLE_DIAG_DETECTION)\n/*Diagonals have both north and west edges,so searching for them in one ofthe boundaries is enough.*/weights.rg=calculateDiagWeights(vUv,e,subsampleIndices);if(weights.r==-weights.g){\n#endif\nvec2 d;vec3 coords;coords.x=searchXLeft(vOffset[0].xy,vOffset[2].x);coords.y=vOffset[1].y;d.x=coords.x;/*Now fetch the left crossing edges,two at a time using bilinearfiltering. Sampling at-0.25(see @CROSSING_OFFSET)enables to discern whatvalue each edge has.*/float e1=texture2D(inputBuffer,coords.xy).r;coords.z=searchXRight(vOffset[0].zw,vOffset[2].y);d.y=coords.z;/*Translate distances to pixel units for better interleave arithmetic andmemory accesses.*/d=round(resolution.xx*d+-vPixCoord.xx);vec2 sqrtD=sqrt(abs(d));float e2=sampleLevelZeroOffset(inputBuffer,coords.zy,vec2(1,0)).r;weights.rg=area(sqrtD,e1,e2,subsampleIndices.y);coords.y=vUv.y;detectHorizontalCornerPattern(weights.rg,coords.xyzy,d);\n#if !defined(DISABLE_DIAG_DETECTION)\n}else{e.r=0.0;}\n#endif\n}if(e.r>0.0){vec2 d;vec3 coords;coords.y=searchYUp(vOffset[1].xy,vOffset[2].z);coords.x=vOffset[0].x;d.x=coords.y;float e1=texture2D(inputBuffer,coords.xy).g;coords.z=searchYDown(vOffset[1].zw,vOffset[2].w);d.y=coords.z;d=round(resolution.yy*d-vPixCoord.yy);vec2 sqrtD=sqrt(abs(d));float e2=sampleLevelZeroOffset(inputBuffer,coords.xz,vec2(0,1)).g;weights.ba=area(sqrtD,e1,e2,subsampleIndices.x);coords.x=vUv.x;detectVerticalCornerPattern(weights.ba,coords.xyxz,d);}gl_FragColor=weights;}";
  var vertexShader$5 = "uniform vec2 texelSize;uniform vec2 resolution;varying vec2 vUv;varying vec4 vOffset[3];varying vec2 vPixCoord;void main(){vUv=position.xy*0.5+0.5;vPixCoord=vUv*resolution;vOffset[0]=vUv.xyxy+texelSize.xyxy*vec4(-0.25,-0.125,1.25,-0.125);vOffset[1]=vUv.xyxy+texelSize.xyxy*vec4(-0.125,-0.25,-0.125,1.25);vOffset[2]=vec4(vOffset[0].xz,vOffset[1].yw)+vec4(-2.0,2.0,-2.0,2.0)*texelSize.xxyy*MAX_SEARCH_STEPS_FLOAT;gl_Position=vec4(position.xy,1.0,1.0);}";

  var SMAAWeightsMaterial = function (_ShaderMaterial15) {
    _inherits(SMAAWeightsMaterial, _ShaderMaterial15);

    var _super15 = _createSuper(SMAAWeightsMaterial);

    function SMAAWeightsMaterial() {
      var _this15;

      var texelSize = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : new three.Vector2();
      var resolution = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : new three.Vector2();

      _classCallCheck(this, SMAAWeightsMaterial);

      _this15 = _super15.call(this, {
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
        fragmentShader: fragmentShader$b,
        vertexShader: vertexShader$5,
        depthWrite: false,
        depthTest: false
      });
      _this15.toneMapped = false;
      return _this15;
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

  var AUTO_SIZE = -1;

  var Resizer = function () {
    function Resizer(resizable) {
      var width = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : AUTO_SIZE;
      var height = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : AUTO_SIZE;

      _classCallCheck(this, Resizer);

      this.resizable = resizable;
      this.base = new three.Vector2(1, 1);
      this.target = new three.Vector2(width, height);
      this.scale = 1.0;
    }

    _createClass(Resizer, [{
      key: "width",
      get: function get() {
        var base = this.base;
        var target = this.target;
        var result;

        if (target.x !== AUTO_SIZE) {
          result = target.x;
        } else if (target.y !== AUTO_SIZE) {
          result = Math.round(target.y * (base.x / base.y));
        } else {
          result = Math.round(base.x * this.scale);
        }

        return result;
      },
      set: function set(value) {
        this.target.x = value;
        this.resizable.setSize(this.base.x, this.base.y);
      }
    }, {
      key: "height",
      get: function get() {
        var base = this.base;
        var target = this.target;
        var result;

        if (target.y !== AUTO_SIZE) {
          result = target.y;
        } else if (target.x !== AUTO_SIZE) {
          result = Math.round(target.x / (base.x / base.y));
        } else {
          result = Math.round(base.y * this.scale);
        }

        return result;
      },
      set: function set(value) {
        this.target.y = value;
        this.resizable.setSize(this.base.x, this.base.y);
      }
    }], [{
      key: "AUTO_SIZE",
      get: function get() {
        return AUTO_SIZE;
      }
    }]);

    return Resizer;
  }();

  var dummyCamera = new three.Camera();
  var geometry = null;

  function getFullscreenTriangle() {
    if (geometry === null) {
      var vertices = new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]);
      var uvs = new Float32Array([0, 0, 2, 0, 0, 2]);
      geometry = new three.BufferGeometry();

      if (geometry.setAttribute !== undefined) {
        geometry.setAttribute("position", new three.BufferAttribute(vertices, 3));
        geometry.setAttribute("uv", new three.BufferAttribute(uvs, 2));
      } else {
        geometry.addAttribute("position", new three.BufferAttribute(vertices, 3));
        geometry.addAttribute("uv", new three.BufferAttribute(uvs, 2));
      }
    }

    return geometry;
  }

  var Pass = function () {
    function Pass() {
      var name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "Pass";
      var scene = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : new three.Scene();
      var camera = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : dummyCamera;

      _classCallCheck(this, Pass);

      this.name = name;
      this.scene = scene;
      this.camera = camera;
      this.screen = null;
      this.rtt = true;
      this.needsSwap = true;
      this.needsDepthTexture = false;
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
      value: function initialize(renderer, alpha, frameBufferType) {}
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
    }, {
      key: "renderToScreen",
      get: function get() {
        return !this.rtt;
      },
      set: function set(value) {
        if (this.rtt === value) {
          var material = this.getFullscreenMaterial();

          if (material !== null) {
            material.needsUpdate = true;
          }

          this.rtt = !value;
        }
      }
    }]);

    return Pass;
  }();

  var BlurPass = function (_Pass) {
    _inherits(BlurPass, _Pass);

    var _super16 = _createSuper(BlurPass);

    function BlurPass() {
      var _this16;

      var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          _ref$resolutionScale = _ref.resolutionScale,
          resolutionScale = _ref$resolutionScale === void 0 ? 0.5 : _ref$resolutionScale,
          _ref$width = _ref.width,
          width = _ref$width === void 0 ? Resizer.AUTO_SIZE : _ref$width,
          _ref$height = _ref.height,
          height = _ref$height === void 0 ? Resizer.AUTO_SIZE : _ref$height,
          _ref$kernelSize = _ref.kernelSize,
          kernelSize = _ref$kernelSize === void 0 ? KernelSize.LARGE : _ref$kernelSize;

      _classCallCheck(this, BlurPass);

      _this16 = _super16.call(this, "BlurPass");
      _this16.renderTargetA = new three.WebGLRenderTarget(1, 1, {
        minFilter: three.LinearFilter,
        magFilter: three.LinearFilter,
        stencilBuffer: false,
        depthBuffer: false
      });
      _this16.renderTargetA.texture.name = "Blur.Target.A";
      _this16.renderTargetB = _this16.renderTargetA.clone();
      _this16.renderTargetB.texture.name = "Blur.Target.B";
      _this16.resolution = new Resizer(_assertThisInitialized(_this16), width, height);
      _this16.resolution.scale = resolutionScale;
      _this16.convolutionMaterial = new ConvolutionMaterial();
      _this16.ditheredConvolutionMaterial = new ConvolutionMaterial();
      _this16.ditheredConvolutionMaterial.dithering = true;
      _this16.dithering = false;
      _this16.kernelSize = kernelSize;
      return _this16;
    }

    _createClass(BlurPass, [{
      key: "getResolutionScale",
      value: function getResolutionScale() {
        return this.resolution.scale;
      }
    }, {
      key: "setResolutionScale",
      value: function setResolutionScale(scale) {
        this.resolution.scale = scale;
        this.setSize(this.resolution.base.x, this.resolution.base.y);
      }
    }, {
      key: "render",
      value: function render(renderer, inputBuffer, outputBuffer, deltaTime, stencilTest) {
        var scene = this.scene;
        var camera = this.camera;
        var renderTargetA = this.renderTargetA;
        var renderTargetB = this.renderTargetB;
        var material = this.convolutionMaterial;
        var uniforms = material.uniforms;
        var kernel = material.getKernel();
        var lastRT = inputBuffer;
        var destRT;
        var i, l;
        this.setFullscreenMaterial(material);

        for (i = 0, l = kernel.length - 1; i < l; ++i) {
          destRT = (i & 1) === 0 ? renderTargetA : renderTargetB;
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
        resolution.base.set(width, height);
        width = resolution.width;
        height = resolution.height;
        this.renderTargetA.setSize(width, height);
        this.renderTargetB.setSize(width, height);
        this.convolutionMaterial.setTexelSize(1.0 / width, 1.0 / height);
        this.ditheredConvolutionMaterial.setTexelSize(1.0 / width, 1.0 / height);
      }
    }, {
      key: "initialize",
      value: function initialize(renderer, alpha, frameBufferType) {
        if (!alpha && frameBufferType === three.UnsignedByteType) {
          this.renderTargetA.texture.format = three.RGBFormat;
          this.renderTargetB.texture.format = three.RGBFormat;
        }

        if (frameBufferType !== undefined) {
          this.renderTargetA.texture.type = frameBufferType;
          this.renderTargetB.texture.type = frameBufferType;
        }
      }
    }, {
      key: "width",
      get: function get() {
        return this.resolution.width;
      },
      set: function set(value) {
        this.resolution.width = value;
      }
    }, {
      key: "height",
      get: function get() {
        return this.resolution.height;
      },
      set: function set(value) {
        this.resolution.height = value;
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
        return Resizer.AUTO_SIZE;
      }
    }]);

    return BlurPass;
  }(Pass);

  var ClearMaskPass = function (_Pass2) {
    _inherits(ClearMaskPass, _Pass2);

    var _super17 = _createSuper(ClearMaskPass);

    function ClearMaskPass() {
      var _this17;

      _classCallCheck(this, ClearMaskPass);

      _this17 = _super17.call(this, "ClearMaskPass", null, null);
      _this17.needsSwap = false;
      return _this17;
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

    var _super18 = _createSuper(ClearPass);

    function ClearPass() {
      var _this18;

      var color = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
      var depth = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
      var stencil = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

      _classCallCheck(this, ClearPass);

      _this18 = _super18.call(this, "ClearPass", null, null);
      _this18.needsSwap = false;
      _this18.color = color;
      _this18.depth = depth;
      _this18.stencil = stencil;
      _this18.overrideClearColor = null;
      _this18.overrideClearAlpha = -1.0;
      return _this18;
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

    var _super19 = _createSuper(RenderPass);

    function RenderPass(scene, camera) {
      var _this19;

      var overrideMaterial = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

      _classCallCheck(this, RenderPass);

      _this19 = _super19.call(this, "RenderPass", scene, camera);
      _this19.needsSwap = false;
      _this19.overrideMaterial = overrideMaterial;
      _this19.clearPass = new ClearPass();
      _this19.depthTexture = null;
      return _this19;
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

    var _super20 = _createSuper(DepthPass);

    function DepthPass(scene, camera) {
      var _this20;

      var _ref2 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
          _ref2$resolutionScale = _ref2.resolutionScale,
          resolutionScale = _ref2$resolutionScale === void 0 ? 1.0 : _ref2$resolutionScale,
          _ref2$width = _ref2.width,
          width = _ref2$width === void 0 ? Resizer.AUTO_SIZE : _ref2$width,
          _ref2$height = _ref2.height,
          height = _ref2$height === void 0 ? Resizer.AUTO_SIZE : _ref2$height,
          renderTarget = _ref2.renderTarget;

      _classCallCheck(this, DepthPass);

      _this20 = _super20.call(this, "DepthPass");
      _this20.needsSwap = false;
      _this20.renderPass = new RenderPass(scene, camera, new three.MeshDepthMaterial({
        depthPacking: three.RGBADepthPacking,
        morphTargets: true,
        skinning: true
      }));

      var clearPass = _this20.renderPass.getClearPass();

      clearPass.overrideClearColor = new three.Color(0xffffff);
      clearPass.overrideClearAlpha = 1.0;
      _this20.renderTarget = renderTarget;

      if (_this20.renderTarget === undefined) {
        _this20.renderTarget = new three.WebGLRenderTarget(1, 1, {
          minFilter: three.NearestFilter,
          magFilter: three.NearestFilter,
          stencilBuffer: false
        });
        _this20.renderTarget.texture.name = "DepthPass.Target";
      }

      _this20.resolution = new Resizer(_assertThisInitialized(_this20), width, height);
      _this20.resolution.scale = resolutionScale;
      return _this20;
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
        var resolution = this.resolution;
        resolution.base.set(width, height);
        width = resolution.width;
        height = resolution.height;
        this.renderTarget.setSize(width, height);
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
      var _ref3 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
          _ref3$attributes = _ref3.attributes,
          attributes = _ref3$attributes === void 0 ? EffectAttribute.NONE : _ref3$attributes,
          _ref3$blendFunction = _ref3.blendFunction,
          blendFunction = _ref3$blendFunction === void 0 ? BlendFunction.SCREEN : _ref3$blendFunction,
          _ref3$defines = _ref3.defines,
          defines = _ref3$defines === void 0 ? new Map() : _ref3$defines,
          _ref3$uniforms = _ref3.uniforms,
          uniforms = _ref3$uniforms === void 0 ? new Map() : _ref3$uniforms,
          _ref3$extensions = _ref3.extensions,
          extensions = _ref3$extensions === void 0 ? null : _ref3$extensions,
          _ref3$vertexShader = _ref3.vertexShader,
          vertexShader = _ref3$vertexShader === void 0 ? null : _ref3$vertexShader;

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
      value: function initialize(renderer, alpha, frameBufferType) {}
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
  var WebGLExtension = {
    DERIVATIVES: "derivatives",
    FRAG_DEPTH: "fragDepth",
    DRAW_BUFFERS: "drawBuffers",
    SHADER_TEXTURE_LOD: "shaderTextureLOD"
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

    var _iterator3 = _createForOfIteratorHelper(substrings),
        _step3;

    try {
      for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
        var substring = _step3.value;
        prefixed = "$1" + prefix + substring.charAt(0).toUpperCase() + substring.slice(1);
        regExp = new RegExp("([^\\.])(\\b" + substring + "\\b)", "g");

        var _iterator4 = _createForOfIteratorHelper(strings.entries()),
            _step4;

        try {
          for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
            var entry = _step4.value;

            if (entry[1] !== null) {
              strings.set(entry[0], entry[1].replace(regExp, prefixed));
            }
          }
        } catch (err) {
          _iterator4.e(err);
        } finally {
          _iterator4.f();
        }
      }
    } catch (err) {
      _iterator3.e(err);
    } finally {
      _iterator3.f();
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

      names = names.concat(findSubstrings(functionRegExp, shaders.get("fragment"))).concat(Array.from(effect.defines.keys()).map(function (s) {
        return s.replace(/\([\w\s,]*\)/g, "");
      })).concat(Array.from(effect.uniforms.keys()));
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

    var _super21 = _createSuper(EffectPass);

    function EffectPass(camera) {
      var _this21;

      _classCallCheck(this, EffectPass);

      _this21 = _super21.call(this, "EffectPass");

      _this21.setFullscreenMaterial(new EffectMaterial(null, null, null, camera));

      for (var _len = arguments.length, effects = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        effects[_key - 1] = arguments[_key];
      }

      _this21.effects = effects.sort(function (a, b) {
        return b.attributes - a.attributes;
      });
      _this21.skipRendering = false;
      _this21.uniforms = 0;
      _this21.varyings = 0;
      _this21.minTime = 1.0;
      _this21.maxTime = 1e3;
      return _this21;
    }

    _createClass(EffectPass, [{
      key: "updateMaterial",
      value: function updateMaterial() {
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

        var _iterator5 = _createForOfIteratorHelper(this.effects),
            _step5;

        try {
          for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
            var effect = _step5.value;

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
                var _iterator8 = _createForOfIteratorHelper(effect.extensions),
                    _step8;

                try {
                  for (_iterator8.s(); !(_step8 = _iterator8.n()).done;) {
                    var _extension = _step8.value;
                    extensions.add(_extension);
                  }
                } catch (err) {
                  _iterator8.e(err);
                } finally {
                  _iterator8.f();
                }
              }
            }
          }
        } catch (err) {
          _iterator5.e(err);
        } finally {
          _iterator5.f();
        }

        var _iterator6 = _createForOfIteratorHelper(blendModes.values()),
            _step6;

        try {
          for (_iterator6.s(); !(_step6 = _iterator6.n()).done;) {
            var blendMode = _step6.value;
            shaderParts.set(Section.FRAGMENT_HEAD, shaderParts.get(Section.FRAGMENT_HEAD) + blendMode.getShaderCode().replace(blendRegExp, "blend" + blendMode.blendFunction) + "\n");
          }
        } catch (err) {
          _iterator6.e(err);
        } finally {
          _iterator6.f();
        }

        if ((attributes & EffectAttribute.DEPTH) !== 0) {
          if (readDepth) {
            shaderParts.set(Section.FRAGMENT_MAIN_IMAGE, "float depth = readDepth(UV);\n\n\t" + shaderParts.get(Section.FRAGMENT_MAIN_IMAGE));
          }

          this.needsDepthTexture = this.getDepthTexture() === null;
        } else {
          this.needsDepthTexture = false;
        }

        if (transformedUv) {
          shaderParts.set(Section.FRAGMENT_MAIN_UV, "vec2 transformedUv = vUv;\n" + shaderParts.get(Section.FRAGMENT_MAIN_UV));
          defines.set("UV", "transformedUv");
        } else {
          defines.set("UV", "vUv");
        }

        shaderParts.forEach(function (value, key, map) {
          return map.set(key, value.trim().replace(/^#/, "\n#"));
        });
        this.uniforms = uniforms.size;
        this.varyings = varyings;
        this.skipRendering = id === 0;
        this.needsSwap = !this.skipRendering;
        var material = this.getFullscreenMaterial();
        material.setShaderParts(shaderParts).setDefines(defines).setUniforms(uniforms);
        material.extensions = {};

        if (extensions.size > 0) {
          var _iterator7 = _createForOfIteratorHelper(extensions),
              _step7;

          try {
            for (_iterator7.s(); !(_step7 = _iterator7.n()).done;) {
              var extension = _step7.value;
              material.extensions[extension] = true;
            }
          } catch (err) {
            _iterator7.e(err);
          } finally {
            _iterator7.f();
          }
        }
      }
    }, {
      key: "recompile",
      value: function recompile() {
        this.updateMaterial();
      }
    }, {
      key: "getDepthTexture",
      value: function getDepthTexture() {
        return this.getFullscreenMaterial().uniforms.depthBuffer.value;
      }
    }, {
      key: "setDepthTexture",
      value: function setDepthTexture(depthTexture) {
        var depthPacking = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
        var material = this.getFullscreenMaterial();
        material.uniforms.depthBuffer.value = depthTexture;
        material.depthPacking = depthPacking;
        material.needsUpdate = true;

        var _iterator9 = _createForOfIteratorHelper(this.effects),
            _step9;

        try {
          for (_iterator9.s(); !(_step9 = _iterator9.n()).done;) {
            var effect = _step9.value;
            effect.setDepthTexture(depthTexture, depthPacking);
          }
        } catch (err) {
          _iterator9.e(err);
        } finally {
          _iterator9.f();
        }
      }
    }, {
      key: "render",
      value: function render(renderer, inputBuffer, outputBuffer, deltaTime, stencilTest) {
        var material = this.getFullscreenMaterial();
        var time = material.uniforms.time.value + deltaTime;

        var _iterator10 = _createForOfIteratorHelper(this.effects),
            _step10;

        try {
          for (_iterator10.s(); !(_step10 = _iterator10.n()).done;) {
            var effect = _step10.value;
            effect.update(renderer, inputBuffer, deltaTime);
          }
        } catch (err) {
          _iterator10.e(err);
        } finally {
          _iterator10.f();
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

        var _iterator11 = _createForOfIteratorHelper(this.effects),
            _step11;

        try {
          for (_iterator11.s(); !(_step11 = _iterator11.n()).done;) {
            var effect = _step11.value;
            effect.setSize(width, height);
          }
        } catch (err) {
          _iterator11.e(err);
        } finally {
          _iterator11.f();
        }
      }
    }, {
      key: "initialize",
      value: function initialize(renderer, alpha, frameBufferType) {
        var _iterator12 = _createForOfIteratorHelper(this.effects),
            _step12;

        try {
          for (_iterator12.s(); !(_step12 = _iterator12.n()).done;) {
            var effect = _step12.value;
            effect.initialize(renderer, alpha, frameBufferType);
          }
        } catch (err) {
          _iterator12.e(err);
        } finally {
          _iterator12.f();
        }

        this.updateMaterial();
        var capabilities = renderer.capabilities;
        var max = Math.min(capabilities.maxFragmentUniforms, capabilities.maxVertexUniforms);

        if (this.uniforms > max) {
          console.warn("The current rendering context doesn't support more than " + max + " uniforms, but " + this.uniforms + " were defined");
        }

        max = capabilities.maxVaryings;

        if (this.varyings > max) {
          console.warn("The current rendering context doesn't support more than " + max + " varyings, but " + this.varyings + " were defined");
        }
      }
    }, {
      key: "dispose",
      value: function dispose() {
        _get(_getPrototypeOf(EffectPass.prototype), "dispose", this).call(this);

        var _iterator13 = _createForOfIteratorHelper(this.effects),
            _step13;

        try {
          for (_iterator13.s(); !(_step13 = _iterator13.n()).done;) {
            var effect = _step13.value;
            effect.dispose();
          }
        } catch (err) {
          _iterator13.e(err);
        } finally {
          _iterator13.f();
        }
      }
    }, {
      key: "encodeOutput",
      get: function get() {
        return this.getFullscreenMaterial().defines.ENCODE_OUTPUT !== undefined;
      },
      set: function set(value) {
        if (this.encodeOutput !== value) {
          var material = this.getFullscreenMaterial();
          material.needsUpdate = true;

          if (value) {
            material.defines.ENCODE_OUTPUT = "1";
          } else {
            delete material.defines.ENCODE_OUTPUT;
          }
        }
      }
    }, {
      key: "dithering",
      get: function get() {
        return this.getFullscreenMaterial().dithering;
      },
      set: function set(value) {
        var material = this.getFullscreenMaterial();

        if (material.dithering !== value) {
          material.dithering = value;
          material.needsUpdate = true;
        }
      }
    }]);

    return EffectPass;
  }(Pass);

  var MaskPass = function (_Pass7) {
    _inherits(MaskPass, _Pass7);

    var _super22 = _createSuper(MaskPass);

    function MaskPass(scene, camera) {
      var _this22;

      _classCallCheck(this, MaskPass);

      _this22 = _super22.call(this, "MaskPass", scene, camera);
      _this22.needsSwap = false;
      _this22.clearPass = new ClearPass(false, false, true);
      _this22.inverse = false;
      return _this22;
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

    var _super23 = _createSuper(NormalPass);

    function NormalPass(scene, camera) {
      var _this23;

      var _ref4 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
          _ref4$resolutionScale = _ref4.resolutionScale,
          resolutionScale = _ref4$resolutionScale === void 0 ? 1.0 : _ref4$resolutionScale,
          _ref4$width = _ref4.width,
          width = _ref4$width === void 0 ? Resizer.AUTO_SIZE : _ref4$width,
          _ref4$height = _ref4.height,
          height = _ref4$height === void 0 ? Resizer.AUTO_SIZE : _ref4$height,
          renderTarget = _ref4.renderTarget;

      _classCallCheck(this, NormalPass);

      _this23 = _super23.call(this, "NormalPass");
      _this23.needsSwap = false;
      _this23.renderPass = new RenderPass(scene, camera, new three.MeshNormalMaterial({
        morphTargets: true,
        morphNormals: true,
        skinning: true
      }));

      var clearPass = _this23.renderPass.getClearPass();

      clearPass.overrideClearColor = new three.Color(0x7777ff);
      clearPass.overrideClearAlpha = 1.0;
      _this23.renderTarget = renderTarget;

      if (_this23.renderTarget === undefined) {
        _this23.renderTarget = new three.WebGLRenderTarget(1, 1, {
          minFilter: three.NearestFilter,
          magFilter: three.NearestFilter,
          format: three.RGBFormat,
          stencilBuffer: false
        });
        _this23.renderTarget.texture.name = "NormalPass.Target";
      }

      _this23.resolution = new Resizer(_assertThisInitialized(_this23), width, height);
      _this23.resolution.scale = resolutionScale;
      return _this23;
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
        var resolution = this.resolution;
        resolution.base.set(width, height);
        width = resolution.width;
        height = resolution.height;
        this.renderTarget.setSize(width, height);
      }
    }]);

    return NormalPass;
  }(Pass);

  var SavePass = function (_Pass9) {
    _inherits(SavePass, _Pass9);

    var _super24 = _createSuper(SavePass);

    function SavePass(renderTarget) {
      var _this24;

      var resize = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

      _classCallCheck(this, SavePass);

      _this24 = _super24.call(this, "SavePass");

      _this24.setFullscreenMaterial(new CopyMaterial());

      _this24.needsSwap = false;
      _this24.renderTarget = renderTarget;

      if (renderTarget === undefined) {
        _this24.renderTarget = new three.WebGLRenderTarget(1, 1, {
          minFilter: three.LinearFilter,
          magFilter: three.LinearFilter,
          stencilBuffer: false,
          depthBuffer: false
        });
        _this24.renderTarget.texture.name = "SavePass.Target";
      }

      _this24.resize = resize;
      return _this24;
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
    }, {
      key: "initialize",
      value: function initialize(renderer, alpha, frameBufferType) {
        if (!alpha && frameBufferType === three.UnsignedByteType) {
          this.renderTarget.texture.format = three.RGBFormat;
        }

        if (frameBufferType !== undefined) {
          this.renderTarget.texture.type = frameBufferType;
        }
      }
    }]);

    return SavePass;
  }(Pass);

  var ShaderPass = function (_Pass10) {
    _inherits(ShaderPass, _Pass10);

    var _super25 = _createSuper(ShaderPass);

    function ShaderPass(material) {
      var _this25;

      var input = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "inputBuffer";

      _classCallCheck(this, ShaderPass);

      _this25 = _super25.call(this, "ShaderPass");

      _this25.setFullscreenMaterial(material);

      _this25.uniform = null;

      _this25.setInput(input);

      return _this25;
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
        if (this.uniform !== null && inputBuffer !== null) {
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

      var _ref5 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
          _ref5$depthBuffer = _ref5.depthBuffer,
          depthBuffer = _ref5$depthBuffer === void 0 ? true : _ref5$depthBuffer,
          _ref5$stencilBuffer = _ref5.stencilBuffer,
          stencilBuffer = _ref5$stencilBuffer === void 0 ? false : _ref5$stencilBuffer,
          _ref5$multisampling = _ref5.multisampling,
          multisampling = _ref5$multisampling === void 0 ? 0 : _ref5$multisampling,
          frameBufferType = _ref5.frameBufferType;

      _classCallCheck(this, EffectComposer);

      this.renderer = renderer;
      this.inputBuffer = null;
      this.outputBuffer = null;

      if (this.renderer !== null) {
        this.renderer.autoClear = false;
        this.inputBuffer = this.createBuffer(depthBuffer, stencilBuffer, frameBufferType, multisampling);
        this.outputBuffer = this.inputBuffer.clone();
        this.enableExtensions();
      }

      this.copyPass = new ShaderPass(new CopyMaterial());
      this.depthTexture = null;
      this.passes = [];
      this.autoRenderToScreen = true;
    }

    _createClass(EffectComposer, [{
      key: "getRenderer",
      value: function getRenderer() {
        return this.renderer;
      }
    }, {
      key: "enableExtensions",
      value: function enableExtensions() {
        var frameBufferType = this.inputBuffer.texture.type;
        var capabilities = this.renderer.capabilities;
        var context = this.renderer.getContext();

        if (frameBufferType !== three.UnsignedByteType) {
          if (capabilities.isWebGL2) {
            context.getExtension("EXT_color_buffer_float");
          } else {
            context.getExtension("EXT_color_buffer_half_float");
          }
        }
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

          this.enableExtensions();
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
        } else {
          depthTexture.type = three.UnsignedIntType;
        }

        return depthTexture;
      }
    }, {
      key: "createBuffer",
      value: function createBuffer(depthBuffer, stencilBuffer, type, multisampling) {
        var size = this.renderer.getDrawingBufferSize(new three.Vector2());
        var alpha = this.renderer.getContext().getContextAttributes().alpha;
        var options = {
          format: !alpha && type === three.UnsignedByteType ? three.RGBFormat : three.RGBAFormat,
          minFilter: three.LinearFilter,
          magFilter: three.LinearFilter,
          stencilBuffer: stencilBuffer,
          depthBuffer: depthBuffer,
          type: type
        };
        var renderTarget = multisampling > 0 ? new three.WebGLMultisampleRenderTarget(size.width, size.height, options) : new three.WebGLRenderTarget(size.width, size.height, options);

        if (multisampling > 0) {
          renderTarget.samples = multisampling;
        }

        renderTarget.texture.name = "EffectComposer.Buffer";
        renderTarget.texture.generateMipmaps = false;
        return renderTarget;
      }
    }, {
      key: "addPass",
      value: function addPass(pass, index) {
        var passes = this.passes;
        var renderer = this.renderer;
        var alpha = renderer.getContext().getContextAttributes().alpha;
        var frameBufferType = this.inputBuffer.texture.type;
        var drawingBufferSize = renderer.getDrawingBufferSize(new three.Vector2());
        pass.setSize(drawingBufferSize.width, drawingBufferSize.height);
        pass.initialize(renderer, alpha, frameBufferType);

        if (this.autoRenderToScreen) {
          if (passes.length > 0) {
            passes[passes.length - 1].renderToScreen = false;
          }

          if (pass.renderToScreen) {
            this.autoRenderToScreen = false;
          }
        }

        if (index !== undefined) {
          passes.splice(index, 0, pass);
        } else {
          passes.push(pass);
        }

        if (this.autoRenderToScreen) {
          passes[passes.length - 1].renderToScreen = true;
        }

        if (pass.needsDepthTexture || this.depthTexture !== null) {
          if (this.depthTexture === null) {
            var depthTexture = this.createDepthTexture();

            var _iterator14 = _createForOfIteratorHelper(passes),
                _step14;

            try {
              for (_iterator14.s(); !(_step14 = _iterator14.n()).done;) {
                pass = _step14.value;
                pass.setDepthTexture(depthTexture);
              }
            } catch (err) {
              _iterator14.e(err);
            } finally {
              _iterator14.f();
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
        var index = passes.indexOf(pass);
        var removed = passes.splice(index, 1).length > 0;

        if (removed) {
          if (this.depthTexture !== null) {
            var reducer = function reducer(a, b) {
              return a || b.needsDepthTexture;
            };

            var depthTextureRequired = passes.reduce(reducer, false);

            if (!depthTextureRequired) {
              this.depthTexture.dispose();
              this.depthTexture = null;
              this.inputBuffer.depthTexture = null;
              this.outputBuffer.depthTexture = null;
              pass.setDepthTexture(null);

              var _iterator15 = _createForOfIteratorHelper(passes),
                  _step15;

              try {
                for (_iterator15.s(); !(_step15 = _iterator15.n()).done;) {
                  pass = _step15.value;
                  pass.setDepthTexture(null);
                }
              } catch (err) {
                _iterator15.e(err);
              } finally {
                _iterator15.f();
              }
            }
          }

          if (this.autoRenderToScreen && passes.length > 0) {
            if (index === passes.length) {
              passes[passes.length - 1].renderToScreen = true;
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

        var _iterator16 = _createForOfIteratorHelper(this.passes),
            _step16;

        try {
          for (_iterator16.s(); !(_step16 = _iterator16.n()).done;) {
            var pass = _step16.value;

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
          _iterator16.e(err);
        } finally {
          _iterator16.f();
        }
      }
    }, {
      key: "setSize",
      value: function setSize(width, height, updateStyle) {
        var renderer = this.renderer;

        if (width === undefined || height === undefined) {
          var size = renderer.getSize(new three.Vector2());
          width = size.width;
          height = size.height;
        }

        renderer.setSize(width, height, updateStyle);
        var drawingBufferSize = renderer.getDrawingBufferSize(new three.Vector2());
        this.inputBuffer.setSize(drawingBufferSize.width, drawingBufferSize.height);
        this.outputBuffer.setSize(drawingBufferSize.width, drawingBufferSize.height);

        var _iterator17 = _createForOfIteratorHelper(this.passes),
            _step17;

        try {
          for (_iterator17.s(); !(_step17 = _iterator17.n()).done;) {
            var pass = _step17.value;
            pass.setSize(drawingBufferSize.width, drawingBufferSize.height);
          }
        } catch (err) {
          _iterator17.e(err);
        } finally {
          _iterator17.f();
        }
      }
    }, {
      key: "reset",
      value: function reset() {
        var renderTarget = this.inputBuffer.clone();
        this.dispose();
        this.inputBuffer = renderTarget;
        this.outputBuffer = renderTarget.clone();
        this.depthTexture = null;
        this.copyPass = new ShaderPass(new CopyMaterial());
        this.autoRenderToScreen = true;
      }
    }, {
      key: "dispose",
      value: function dispose() {
        var _iterator18 = _createForOfIteratorHelper(this.passes),
            _step18;

        try {
          for (_iterator18.s(); !(_step18 = _iterator18.n()).done;) {
            var pass = _step18.value;
            pass.dispose();
          }
        } catch (err) {
          _iterator18.e(err);
        } finally {
          _iterator18.f();
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
    }, {
      key: "multisampling",
      get: function get() {
        return this.inputBuffer instanceof three.WebGLMultisampleRenderTarget ? this.inputBuffer.samples : 0;
      },
      set: function set(value) {
        var buffer = this.inputBuffer;
        var multisampling = this.multisampling;

        if (multisampling > 0 && value > 0) {
          this.inputBuffer.samples = value;
          this.outputBuffer.samples = value;
        } else if (multisampling !== value) {
          this.inputBuffer.dispose();
          this.outputBuffer.dispose();
          this.inputBuffer = this.createBuffer(buffer.depthBuffer, buffer.stencilBuffer, buffer.texture.type, value);
          this.outputBuffer = this.inputBuffer.clone();
        }
      }
    }]);

    return EffectComposer;
  }();

  var Resizable = function () {
    function Resizable() {
      _classCallCheck(this, Resizable);
    }

    _createClass(Resizable, [{
      key: "setSize",
      value: function setSize(width, height) {}
    }]);

    return Resizable;
  }();

  var Selection = function (_Set) {
    _inherits(Selection, _Set);

    var _super26 = _createSuper(Selection);

    function Selection(iterable) {
      var _this26;

      var layer = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 10;

      _classCallCheck(this, Selection);

      _this26 = _super26.call(this);
      _this26.currentLayer = layer;

      if (iterable !== undefined) {
        _this26.set(iterable);
      }

      return _this26;
    }

    _createClass(Selection, [{
      key: "clear",
      value: function clear() {
        var layer = this.layer;

        var _iterator19 = _createForOfIteratorHelper(this),
            _step19;

        try {
          for (_iterator19.s(); !(_step19 = _iterator19.n()).done;) {
            var object = _step19.value;
            object.layers.disable(layer);
          }
        } catch (err) {
          _iterator19.e(err);
        } finally {
          _iterator19.f();
        }

        return _get(_getPrototypeOf(Selection.prototype), "clear", this).call(this);
      }
    }, {
      key: "set",
      value: function set(objects) {
        this.clear();

        var _iterator20 = _createForOfIteratorHelper(objects),
            _step20;

        try {
          for (_iterator20.s(); !(_step20 = _iterator20.n()).done;) {
            var object = _step20.value;
            this.add(object);
          }
        } catch (err) {
          _iterator20.e(err);
        } finally {
          _iterator20.f();
        }

        return this;
      }
    }, {
      key: "indexOf",
      value: function indexOf(object) {
        return this.has(object) ? 0 : -1;
      }
    }, {
      key: "add",
      value: function add(object) {
        object.layers.enable(this.layer);

        _get(_getPrototypeOf(Selection.prototype), "add", this).call(this, object);

        return this;
      }
    }, {
      key: "delete",
      value: function _delete(object) {
        if (this.has(object)) {
          object.layers.disable(this.layer);
        }

        return _get(_getPrototypeOf(Selection.prototype), "delete", this).call(this, object);
      }
    }, {
      key: "setVisible",
      value: function setVisible(visible) {
        var _iterator21 = _createForOfIteratorHelper(this),
            _step21;

        try {
          for (_iterator21.s(); !(_step21 = _iterator21.n()).done;) {
            var object = _step21.value;

            if (visible) {
              object.layers.enable(0);
            } else {
              object.layers.disable(0);
            }
          }
        } catch (err) {
          _iterator21.e(err);
        } finally {
          _iterator21.f();
        }

        return this;
      }
    }, {
      key: "layer",
      get: function get() {
        return this.currentLayer;
      },
      set: function set(value) {
        var currentLayer = this.currentLayer;

        var _iterator22 = _createForOfIteratorHelper(this),
            _step22;

        try {
          for (_iterator22.s(); !(_step22 = _iterator22.n()).done;) {
            var object = _step22.value;
            object.layers.disable(currentLayer);
            object.layers.enable(value);
          }
        } catch (err) {
          _iterator22.e(err);
        } finally {
          _iterator22.f();
        }

        this.currentLayer = value;
      }
    }]);

    return Selection;
  }(_wrapNativeSuper(Set));

  var fragmentShader$c = "uniform sampler2D texture;uniform float intensity;void mainImage(const in vec4 inputColor,const in vec2 uv,out vec4 outputColor){outputColor=clamp(texture2D(texture,uv)*intensity,0.0,1.0);}";

  var BloomEffect = function (_Effect) {
    _inherits(BloomEffect, _Effect);

    var _super27 = _createSuper(BloomEffect);

    function BloomEffect() {
      var _this27;

      var _ref6 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          _ref6$blendFunction = _ref6.blendFunction,
          blendFunction = _ref6$blendFunction === void 0 ? BlendFunction.SCREEN : _ref6$blendFunction,
          _ref6$luminanceThresh = _ref6.luminanceThreshold,
          luminanceThreshold = _ref6$luminanceThresh === void 0 ? 0.9 : _ref6$luminanceThresh,
          _ref6$luminanceSmooth = _ref6.luminanceSmoothing,
          luminanceSmoothing = _ref6$luminanceSmooth === void 0 ? 0.025 : _ref6$luminanceSmooth,
          _ref6$resolutionScale = _ref6.resolutionScale,
          resolutionScale = _ref6$resolutionScale === void 0 ? 0.5 : _ref6$resolutionScale,
          _ref6$intensity = _ref6.intensity,
          intensity = _ref6$intensity === void 0 ? 1.0 : _ref6$intensity,
          _ref6$width = _ref6.width,
          width = _ref6$width === void 0 ? Resizer.AUTO_SIZE : _ref6$width,
          _ref6$height = _ref6.height,
          height = _ref6$height === void 0 ? Resizer.AUTO_SIZE : _ref6$height,
          _ref6$kernelSize = _ref6.kernelSize,
          kernelSize = _ref6$kernelSize === void 0 ? KernelSize.LARGE : _ref6$kernelSize;

      _classCallCheck(this, BloomEffect);

      _this27 = _super27.call(this, "BloomEffect", fragmentShader$c, {
        blendFunction: blendFunction,
        uniforms: new Map([["texture", new three.Uniform(null)], ["intensity", new three.Uniform(intensity)]])
      });
      _this27.renderTarget = new three.WebGLRenderTarget(1, 1, {
        minFilter: three.LinearFilter,
        magFilter: three.LinearFilter,
        stencilBuffer: false,
        depthBuffer: false
      });
      _this27.renderTarget.texture.name = "Bloom.Target";
      _this27.renderTarget.texture.generateMipmaps = false;
      _this27.uniforms.get("texture").value = _this27.renderTarget.texture;
      _this27.blurPass = new BlurPass({
        resolutionScale: resolutionScale,
        width: width,
        height: height,
        kernelSize: kernelSize
      });
      _this27.blurPass.resolution.resizable = _assertThisInitialized(_this27);
      _this27.luminancePass = new ShaderPass(new LuminanceMaterial(true));
      _this27.luminanceMaterial.threshold = luminanceThreshold;
      _this27.luminanceMaterial.smoothing = luminanceSmoothing;
      return _this27;
    }

    _createClass(BloomEffect, [{
      key: "getResolutionScale",
      value: function getResolutionScale() {
        return this.resolution.scale;
      }
    }, {
      key: "setResolutionScale",
      value: function setResolutionScale(scale) {
        this.resolution.scale = scale;
        this.setSize(this.resolution.base.x, this.resolution.base.y);
      }
    }, {
      key: "update",
      value: function update(renderer, inputBuffer, deltaTime) {
        var renderTarget = this.renderTarget;

        if (this.luminancePass.enabled) {
          this.luminancePass.render(renderer, inputBuffer, renderTarget);
          this.blurPass.render(renderer, renderTarget, renderTarget);
        } else {
          this.blurPass.render(renderer, inputBuffer, renderTarget);
        }
      }
    }, {
      key: "setSize",
      value: function setSize(width, height) {
        this.blurPass.setSize(width, height);
        this.renderTarget.setSize(this.resolution.width, this.resolution.height);
      }
    }, {
      key: "initialize",
      value: function initialize(renderer, alpha, frameBufferType) {
        this.blurPass.initialize(renderer, alpha, frameBufferType);

        if (!alpha && frameBufferType === three.UnsignedByteType) {
          this.renderTarget.texture.format = three.RGBFormat;
        }

        if (frameBufferType !== undefined) {
          this.renderTarget.texture.type = frameBufferType;
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
      key: "resolution",
      get: function get() {
        return this.blurPass.resolution;
      }
    }, {
      key: "width",
      get: function get() {
        return this.resolution.width;
      },
      set: function set(value) {
        this.resolution.width = value;
      }
    }, {
      key: "height",
      get: function get() {
        return this.resolution.height;
      },
      set: function set(value) {
        this.resolution.height = value;
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
    }, {
      key: "intensity",
      get: function get() {
        return this.uniforms.get("intensity").value;
      },
      set: function set(value) {
        this.uniforms.get("intensity").value = value;
      }
    }]);

    return BloomEffect;
  }(Effect);

  var fragmentShader$d = "uniform float focus;uniform float dof;uniform float aperture;uniform float maxBlur;void mainImage(const in vec4 inputColor,const in vec2 uv,const in float depth,out vec4 outputColor){vec2 aspectCorrection=vec2(1.0,aspect);\n#ifdef PERSPECTIVE_CAMERA\nfloat viewZ=perspectiveDepthToViewZ(depth,cameraNear,cameraFar);float linearDepth=viewZToOrthographicDepth(viewZ,cameraNear,cameraFar);\n#else\nfloat linearDepth=depth;\n#endif\nfloat focusNear=clamp(focus-dof,0.0,1.0);float focusFar=clamp(focus+dof,0.0,1.0);float low=step(linearDepth,focusNear);float high=step(focusFar,linearDepth);float factor=(linearDepth-focusNear)*low+(linearDepth-focusFar)*high;vec2 dofBlur=vec2(clamp(factor*aperture,-maxBlur,maxBlur));vec2 dofblur9=dofBlur*0.9;vec2 dofblur7=dofBlur*0.7;vec2 dofblur4=dofBlur*0.4;vec4 color=inputColor;color+=texture2D(inputBuffer,uv+(vec2(0.0,0.4)*aspectCorrection)*dofBlur);color+=texture2D(inputBuffer,uv+(vec2(0.15,0.37)*aspectCorrection)*dofBlur);color+=texture2D(inputBuffer,uv+(vec2(0.29,0.29)*aspectCorrection)*dofBlur);color+=texture2D(inputBuffer,uv+(vec2(-0.37,0.15)*aspectCorrection)*dofBlur);color+=texture2D(inputBuffer,uv+(vec2(0.40,0.0)*aspectCorrection)*dofBlur);color+=texture2D(inputBuffer,uv+(vec2(0.37,-0.15)*aspectCorrection)*dofBlur);color+=texture2D(inputBuffer,uv+(vec2(0.29,-0.29)*aspectCorrection)*dofBlur);color+=texture2D(inputBuffer,uv+(vec2(-0.15,-0.37)*aspectCorrection)*dofBlur);color+=texture2D(inputBuffer,uv+(vec2(0.0,-0.4)*aspectCorrection)*dofBlur);color+=texture2D(inputBuffer,uv+(vec2(-0.15,0.37)*aspectCorrection)*dofBlur);color+=texture2D(inputBuffer,uv+(vec2(-0.29,0.29)*aspectCorrection)*dofBlur);color+=texture2D(inputBuffer,uv+(vec2(0.37,0.15)*aspectCorrection)*dofBlur);color+=texture2D(inputBuffer,uv+(vec2(-0.4,0.0)*aspectCorrection)*dofBlur);color+=texture2D(inputBuffer,uv+(vec2(-0.37,-0.15)*aspectCorrection)*dofBlur);color+=texture2D(inputBuffer,uv+(vec2(-0.29,-0.29)*aspectCorrection)*dofBlur);color+=texture2D(inputBuffer,uv+(vec2(0.15,-0.37)*aspectCorrection)*dofBlur);color+=texture2D(inputBuffer,uv+(vec2(0.15,0.37)*aspectCorrection)*dofblur9);color+=texture2D(inputBuffer,uv+(vec2(-0.37,0.15)*aspectCorrection)*dofblur9);color+=texture2D(inputBuffer,uv+(vec2(0.37,-0.15)*aspectCorrection)*dofblur9);color+=texture2D(inputBuffer,uv+(vec2(-0.15,-0.37)*aspectCorrection)*dofblur9);color+=texture2D(inputBuffer,uv+(vec2(-0.15,0.37)*aspectCorrection)*dofblur9);color+=texture2D(inputBuffer,uv+(vec2(0.37,0.15)*aspectCorrection)*dofblur9);color+=texture2D(inputBuffer,uv+(vec2(-0.37,-0.15)*aspectCorrection)*dofblur9);color+=texture2D(inputBuffer,uv+(vec2(0.15,-0.37)*aspectCorrection)*dofblur9);color+=texture2D(inputBuffer,uv+(vec2(0.29,0.29)*aspectCorrection)*dofblur7);color+=texture2D(inputBuffer,uv+(vec2(0.40,0.0)*aspectCorrection)*dofblur7);color+=texture2D(inputBuffer,uv+(vec2(0.29,-0.29)*aspectCorrection)*dofblur7);color+=texture2D(inputBuffer,uv+(vec2(0.0,-0.4)*aspectCorrection)*dofblur7);color+=texture2D(inputBuffer,uv+(vec2(-0.29,0.29)*aspectCorrection)*dofblur7);color+=texture2D(inputBuffer,uv+(vec2(-0.4,0.0)*aspectCorrection)*dofblur7);color+=texture2D(inputBuffer,uv+(vec2(-0.29,-0.29)*aspectCorrection)*dofblur7);color+=texture2D(inputBuffer,uv+(vec2(0.0,0.4)*aspectCorrection)*dofblur7);color+=texture2D(inputBuffer,uv+(vec2(0.29,0.29)*aspectCorrection)*dofblur4);color+=texture2D(inputBuffer,uv+(vec2(0.4,0.0)*aspectCorrection)*dofblur4);color+=texture2D(inputBuffer,uv+(vec2(0.29,-0.29)*aspectCorrection)*dofblur4);color+=texture2D(inputBuffer,uv+(vec2(0.0,-0.4)*aspectCorrection)*dofblur4);color+=texture2D(inputBuffer,uv+(vec2(-0.29,0.29)*aspectCorrection)*dofblur4);color+=texture2D(inputBuffer,uv+(vec2(-0.4,0.0)*aspectCorrection)*dofblur4);color+=texture2D(inputBuffer,uv+(vec2(-0.29,-0.29)*aspectCorrection)*dofblur4);color+=texture2D(inputBuffer,uv+(vec2(0.0,0.4)*aspectCorrection)*dofblur4);outputColor=color/41.0;}";

  var BokehEffect = function (_Effect2) {
    _inherits(BokehEffect, _Effect2);

    var _super28 = _createSuper(BokehEffect);

    function BokehEffect() {
      var _ref7 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          _ref7$blendFunction = _ref7.blendFunction,
          blendFunction = _ref7$blendFunction === void 0 ? BlendFunction.NORMAL : _ref7$blendFunction,
          _ref7$focus = _ref7.focus,
          focus = _ref7$focus === void 0 ? 0.5 : _ref7$focus,
          _ref7$dof = _ref7.dof,
          dof = _ref7$dof === void 0 ? 0.02 : _ref7$dof,
          _ref7$aperture = _ref7.aperture,
          aperture = _ref7$aperture === void 0 ? 0.015 : _ref7$aperture,
          _ref7$maxBlur = _ref7.maxBlur,
          maxBlur = _ref7$maxBlur === void 0 ? 1.0 : _ref7$maxBlur;

      _classCallCheck(this, BokehEffect);

      return _super28.call(this, "BokehEffect", fragmentShader$d, {
        blendFunction: blendFunction,
        attributes: EffectAttribute.CONVOLUTION | EffectAttribute.DEPTH,
        uniforms: new Map([["focus", new three.Uniform(focus)], ["dof", new three.Uniform(dof)], ["aperture", new three.Uniform(aperture)], ["maxBlur", new three.Uniform(maxBlur)]])
      });
    }

    return BokehEffect;
  }(Effect);

  var fragmentShader$e = "uniform float brightness;uniform float contrast;void mainImage(const in vec4 inputColor,const in vec2 uv,out vec4 outputColor){vec3 color=inputColor.rgb+vec3(brightness-0.5);if(contrast>0.0){color/=vec3(1.0-contrast);}else{color*=vec3(1.0+contrast);}outputColor=vec4(min(color+vec3(0.5),1.0),inputColor.a);}";

  var BrightnessContrastEffect = function (_Effect3) {
    _inherits(BrightnessContrastEffect, _Effect3);

    var _super29 = _createSuper(BrightnessContrastEffect);

    function BrightnessContrastEffect() {
      var _ref8 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          _ref8$blendFunction = _ref8.blendFunction,
          blendFunction = _ref8$blendFunction === void 0 ? BlendFunction.NORMAL : _ref8$blendFunction,
          _ref8$brightness = _ref8.brightness,
          brightness = _ref8$brightness === void 0 ? 0.0 : _ref8$brightness,
          _ref8$contrast = _ref8.contrast,
          contrast = _ref8$contrast === void 0 ? 0.0 : _ref8$contrast;

      _classCallCheck(this, BrightnessContrastEffect);

      return _super29.call(this, "BrightnessContrastEffect", fragmentShader$e, {
        blendFunction: blendFunction,
        uniforms: new Map([["brightness", new three.Uniform(brightness)], ["contrast", new three.Uniform(contrast)]])
      });
    }

    return BrightnessContrastEffect;
  }(Effect);

  var fragmentShader$f = "void mainImage(const in vec4 inputColor,const in vec2 uv,out vec4 outputColor){float sum=inputColor.r+inputColor.g+inputColor.b;outputColor=vec4(vec3(sum/3.0),inputColor.a);}";

  var ColorAverageEffect = function (_Effect4) {
    _inherits(ColorAverageEffect, _Effect4);

    var _super30 = _createSuper(ColorAverageEffect);

    function ColorAverageEffect() {
      var blendFunction = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : BlendFunction.NORMAL;

      _classCallCheck(this, ColorAverageEffect);

      return _super30.call(this, "ColorAverageEffect", fragmentShader$f, {
        blendFunction: blendFunction
      });
    }

    return ColorAverageEffect;
  }(Effect);

  var fragmentShader$g = "uniform float factor;void mainImage(const in vec4 inputColor,const in vec2 uv,out vec4 outputColor){outputColor=vec4(floor(inputColor.rgb*factor+0.5)/factor,inputColor.a);}";

  var ColorDepthEffect = function (_Effect5) {
    _inherits(ColorDepthEffect, _Effect5);

    var _super31 = _createSuper(ColorDepthEffect);

    function ColorDepthEffect() {
      var _this28;

      var _ref9 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          _ref9$blendFunction = _ref9.blendFunction,
          blendFunction = _ref9$blendFunction === void 0 ? BlendFunction.NORMAL : _ref9$blendFunction,
          _ref9$bits = _ref9.bits,
          bits = _ref9$bits === void 0 ? 16 : _ref9$bits;

      _classCallCheck(this, ColorDepthEffect);

      _this28 = _super31.call(this, "ColorDepthEffect", fragmentShader$g, {
        blendFunction: blendFunction,
        uniforms: new Map([["factor", new three.Uniform(1.0)]])
      });
      _this28.bits = 0;

      _this28.setBitDepth(bits);

      return _this28;
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

  var fragmentShader$h = "varying vec2 vUvR;varying vec2 vUvB;void mainImage(const in vec4 inputColor,const in vec2 uv,out vec4 outputColor){vec4 color=inputColor;\n#ifdef ALPHA\nvec2 ra=texture2D(inputBuffer,vUvR).ra;vec2 ba=texture2D(inputBuffer,vUvB).ba;color.r=ra.x;color.b=ba.x;color.a=max(max(ra.y,ba.y),inputColor.a);\n#else\ncolor.r=texture2D(inputBuffer,vUvR).r;color.b=texture2D(inputBuffer,vUvB).b;\n#endif\noutputColor=color;}";
  var vertexShader$6 = "uniform vec2 offset;varying vec2 vUvR;varying vec2 vUvB;void mainSupport(const in vec2 uv){vUvR=uv+offset;vUvB=uv-offset;}";

  var ChromaticAberrationEffect = function (_Effect6) {
    _inherits(ChromaticAberrationEffect, _Effect6);

    var _super32 = _createSuper(ChromaticAberrationEffect);

    function ChromaticAberrationEffect() {
      var _ref10 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          _ref10$blendFunction = _ref10.blendFunction,
          blendFunction = _ref10$blendFunction === void 0 ? BlendFunction.NORMAL : _ref10$blendFunction,
          _ref10$offset = _ref10.offset,
          offset = _ref10$offset === void 0 ? new three.Vector2(0.001, 0.0005) : _ref10$offset;

      _classCallCheck(this, ChromaticAberrationEffect);

      return _super32.call(this, "ChromaticAberrationEffect", fragmentShader$h, {
        vertexShader: vertexShader$6,
        blendFunction: blendFunction,
        attributes: EffectAttribute.CONVOLUTION,
        uniforms: new Map([["offset", new three.Uniform(offset)]])
      });
    }

    _createClass(ChromaticAberrationEffect, [{
      key: "initialize",
      value: function initialize(renderer, alpha, frameBufferType) {
        if (alpha) {
          this.defines.set("ALPHA", "1");
        } else {
          this.defines["delete"]("ALPHA");
        }
      }
    }, {
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

  var fragmentShader$i = "void mainImage(const in vec4 inputColor,const in vec2 uv,const in float depth,out vec4 outputColor){\n#ifdef INVERTED\nvec3 color=vec3(1.0-depth);\n#else\nvec3 color=vec3(depth);\n#endif\noutputColor=vec4(color,inputColor.a);}";

  var DepthEffect = function (_Effect7) {
    _inherits(DepthEffect, _Effect7);

    var _super33 = _createSuper(DepthEffect);

    function DepthEffect() {
      var _this29;

      var _ref11 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          _ref11$blendFunction = _ref11.blendFunction,
          blendFunction = _ref11$blendFunction === void 0 ? BlendFunction.NORMAL : _ref11$blendFunction,
          _ref11$inverted = _ref11.inverted,
          inverted = _ref11$inverted === void 0 ? false : _ref11$inverted;

      _classCallCheck(this, DepthEffect);

      _this29 = _super33.call(this, "DepthEffect", fragmentShader$i, {
        blendFunction: blendFunction,
        attributes: EffectAttribute.DEPTH
      });
      _this29.inverted = inverted;
      return _this29;
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

  var fragmentShader$j = "uniform sampler2D nearColorBuffer;uniform sampler2D farColorBuffer;uniform sampler2D nearCoCBuffer;uniform float scale;void mainImage(const in vec4 inputColor,const in vec2 uv,const in float depth,out vec4 outputColor){vec4 colorNear=texture2D(nearColorBuffer,uv);vec4 colorFar=texture2D(farColorBuffer,uv);float CoCNear=texture2D(nearCoCBuffer,uv).r;CoCNear=min(CoCNear*scale,1.0);vec4 result=inputColor*(1.0-colorFar.a)+colorFar;result=mix(result,colorNear,CoCNear);outputColor=result;}";

  var DepthOfFieldEffect = function (_Effect8) {
    _inherits(DepthOfFieldEffect, _Effect8);

    var _super34 = _createSuper(DepthOfFieldEffect);

    function DepthOfFieldEffect(camera) {
      var _this30;

      var _ref12 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
          _ref12$blendFunction = _ref12.blendFunction,
          blendFunction = _ref12$blendFunction === void 0 ? BlendFunction.NORMAL : _ref12$blendFunction,
          _ref12$focusDistance = _ref12.focusDistance,
          focusDistance = _ref12$focusDistance === void 0 ? 0.0 : _ref12$focusDistance,
          _ref12$focalLength = _ref12.focalLength,
          focalLength = _ref12$focalLength === void 0 ? 0.1 : _ref12$focalLength,
          _ref12$bokehScale = _ref12.bokehScale,
          bokehScale = _ref12$bokehScale === void 0 ? 1.0 : _ref12$bokehScale,
          _ref12$width = _ref12.width,
          width = _ref12$width === void 0 ? Resizer.AUTO_SIZE : _ref12$width,
          _ref12$height = _ref12.height,
          height = _ref12$height === void 0 ? Resizer.AUTO_SIZE : _ref12$height;

      _classCallCheck(this, DepthOfFieldEffect);

      _this30 = _super34.call(this, "DepthOfFieldEffect", fragmentShader$j, {
        blendFunction: blendFunction,
        attributes: EffectAttribute.DEPTH,
        uniforms: new Map([["nearColorBuffer", new three.Uniform(null)], ["farColorBuffer", new three.Uniform(null)], ["nearCoCBuffer", new three.Uniform(null)], ["scale", new three.Uniform(1.0)]])
      });
      _this30.camera = camera;
      _this30.renderTarget = new three.WebGLRenderTarget(1, 1, {
        minFilter: three.LinearFilter,
        magFilter: three.LinearFilter,
        stencilBuffer: false,
        depthBuffer: false
      });
      _this30.renderTarget.texture.name = "DoF.Intermediate";
      _this30.renderTarget.texture.generateMipmaps = false;
      _this30.renderTargetMasked = _this30.renderTarget.clone();
      _this30.renderTargetMasked.texture.name = "DoF.Masked.Far";
      _this30.renderTargetNear = _this30.renderTarget.clone();
      _this30.renderTargetNear.texture.name = "DoF.Bokeh.Near";
      _this30.uniforms.get("nearColorBuffer").value = _this30.renderTargetNear.texture;
      _this30.renderTargetFar = _this30.renderTarget.clone();
      _this30.renderTargetFar.texture.name = "DoF.Bokeh.Far";
      _this30.uniforms.get("farColorBuffer").value = _this30.renderTargetFar.texture;
      _this30.renderTargetCoC = _this30.renderTarget.clone();
      _this30.renderTargetCoC.texture.format = three.RGBFormat;
      _this30.renderTargetCoC.texture.name = "DoF.CoC";
      _this30.renderTargetCoCBlurred = _this30.renderTargetCoC.clone();
      _this30.renderTargetCoCBlurred.texture.name = "DoF.CoC.Blurred";
      _this30.uniforms.get("nearCoCBuffer").value = _this30.renderTargetCoCBlurred.texture;
      _this30.cocPass = new ShaderPass(new CircleOfConfusionMaterial(camera));
      var cocMaterial = _this30.circleOfConfusionMaterial;
      cocMaterial.uniforms.focusDistance.value = focusDistance;
      cocMaterial.uniforms.focalLength.value = focalLength;
      _this30.blurPass = new BlurPass({
        width: width,
        height: height,
        kernelSize: KernelSize.MEDIUM
      });
      _this30.blurPass.resolution.resizable = _assertThisInitialized(_this30);
      _this30.maskPass = new ShaderPass(new MaskMaterial(_this30.renderTargetCoC.texture));

      var maskMaterial = _this30.maskPass.getFullscreenMaterial();

      maskMaterial.maskFunction = MaskFunction.MULTIPLY_RGB_SET_ALPHA;
      maskMaterial.colorChannel = ColorChannel.GREEN;
      _this30.bokehNearBasePass = new ShaderPass(new BokehMaterial(false, true));
      _this30.bokehNearFillPass = new ShaderPass(new BokehMaterial(true, true));
      _this30.bokehFarBasePass = new ShaderPass(new BokehMaterial(false, false));
      _this30.bokehFarFillPass = new ShaderPass(new BokehMaterial(true, false));
      _this30.bokehScale = bokehScale;
      _this30.target = null;
      return _this30;
    }

    _createClass(DepthOfFieldEffect, [{
      key: "calculateFocusDistance",
      value: function calculateFocusDistance(target) {
        var camera = this.camera;
        var viewDistance = camera.far - camera.near;
        var distance = camera.position.distanceTo(target);
        return Math.min(Math.max(distance / viewDistance, 0.0), 1.0);
      }
    }, {
      key: "setDepthTexture",
      value: function setDepthTexture(depthTexture) {
        var depthPacking = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
        var material = this.circleOfConfusionMaterial;
        material.uniforms.depthBuffer.value = depthTexture;
        material.depthPacking = depthPacking;
      }
    }, {
      key: "update",
      value: function update(renderer, inputBuffer, deltaTime) {
        var renderTarget = this.renderTarget;
        var renderTargetCoC = this.renderTargetCoC;
        var renderTargetCoCBlurred = this.renderTargetCoCBlurred;
        var renderTargetMasked = this.renderTargetMasked;
        var bokehFarBasePass = this.bokehFarBasePass;
        var bokehFarFillPass = this.bokehFarFillPass;
        var farBaseUniforms = bokehFarBasePass.getFullscreenMaterial().uniforms;
        var farFillUniforms = bokehFarFillPass.getFullscreenMaterial().uniforms;
        var bokehNearBasePass = this.bokehNearBasePass;
        var bokehNearFillPass = this.bokehNearFillPass;
        var nearBaseUniforms = bokehNearBasePass.getFullscreenMaterial().uniforms;
        var nearFillUniforms = bokehNearFillPass.getFullscreenMaterial().uniforms;

        if (this.target !== null) {
          var distance = this.calculateFocusDistance(this.target);
          this.circleOfConfusionMaterial.uniforms.focusDistance.value = distance;
        }

        this.cocPass.render(renderer, null, renderTargetCoC);
        this.blurPass.render(renderer, renderTargetCoC, renderTargetCoCBlurred);
        this.maskPass.render(renderer, inputBuffer, renderTargetMasked);
        farBaseUniforms.cocBuffer.value = farFillUniforms.cocBuffer.value = renderTargetCoC.texture;
        bokehFarBasePass.render(renderer, renderTargetMasked, renderTarget);
        bokehFarFillPass.render(renderer, renderTarget, this.renderTargetFar);
        nearBaseUniforms.cocBuffer.value = nearFillUniforms.cocBuffer.value = renderTargetCoCBlurred.texture;
        bokehNearBasePass.render(renderer, inputBuffer, renderTarget);
        bokehNearFillPass.render(renderer, renderTarget, this.renderTargetNear);
      }
    }, {
      key: "setSize",
      value: function setSize(width, height) {
        var resolution = this.resolution;
        var resizables = [this.cocPass, this.blurPass, this.maskPass, this.bokehNearBasePass, this.bokehNearFillPass, this.bokehFarBasePass, this.bokehFarFillPass];
        resizables.push(this.renderTargetCoC, this.renderTargetMasked);
        resizables.forEach(function (r) {
          return r.setSize(width, height);
        });
        width = resolution.width;
        height = resolution.height;
        resizables = [this.renderTarget, this.renderTargetNear, this.renderTargetFar, this.renderTargetCoCBlurred];
        resizables.forEach(function (r) {
          return r.setSize(width, height);
        });
        var passes = [this.bokehNearBasePass, this.bokehNearFillPass, this.bokehFarBasePass, this.bokehFarFillPass];
        passes.forEach(function (p) {
          return p.getFullscreenMaterial().setTexelSize(1.0 / width, 1.0 / height);
        });
      }
    }, {
      key: "initialize",
      value: function initialize(renderer, alpha, frameBufferType) {
        var initializables = [this.cocPass, this.maskPass, this.bokehNearBasePass, this.bokehNearFillPass, this.bokehFarBasePass, this.bokehFarFillPass];
        initializables.forEach(function (i) {
          return i.initialize(renderer, alpha, frameBufferType);
        });
        this.blurPass.initialize(renderer, alpha, three.UnsignedByteType);

        if (!alpha && frameBufferType === three.UnsignedByteType) {
          this.renderTargetNear.texture.type = three.RGBFormat;
        }

        if (frameBufferType !== undefined) {
          this.renderTarget.texture.type = frameBufferType;
          this.renderTargetNear.texture.type = frameBufferType;
          this.renderTargetFar.texture.type = frameBufferType;
          this.renderTargetMasked.texture.type = frameBufferType;
        }
      }
    }, {
      key: "circleOfConfusionMaterial",
      get: function get() {
        return this.cocPass.getFullscreenMaterial();
      }
    }, {
      key: "resolution",
      get: function get() {
        return this.blurPass.resolution;
      }
    }, {
      key: "bokehScale",
      get: function get() {
        return this.uniforms.get("scale").value;
      },
      set: function set(value) {
        var passes = [this.bokehNearBasePass, this.bokehNearFillPass, this.bokehFarBasePass, this.bokehFarFillPass];
        passes.map(function (p) {
          return p.getFullscreenMaterial().uniforms.scale;
        }).forEach(function (u) {
          u.value = value;
        });
        this.maskPass.getFullscreenMaterial().uniforms.strength.value = value;
        this.uniforms.get("scale").value = value;
      }
    }]);

    return DepthOfFieldEffect;
  }(Effect);

  var fragmentShader$k = "uniform vec2 angle;uniform float scale;float pattern(const in vec2 uv){vec2 point=scale*vec2(dot(angle.yx,vec2(uv.x,-uv.y)),dot(angle,uv));return(sin(point.x)*sin(point.y))*4.0;}void mainImage(const in vec4 inputColor,const in vec2 uv,out vec4 outputColor){vec3 color=vec3(inputColor.rgb*10.0-5.0+pattern(uv*resolution));outputColor=vec4(color,inputColor.a);}";

  var DotScreenEffect = function (_Effect9) {
    _inherits(DotScreenEffect, _Effect9);

    var _super35 = _createSuper(DotScreenEffect);

    function DotScreenEffect() {
      var _this31;

      var _ref13 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          _ref13$blendFunction = _ref13.blendFunction,
          blendFunction = _ref13$blendFunction === void 0 ? BlendFunction.NORMAL : _ref13$blendFunction,
          _ref13$angle = _ref13.angle,
          angle = _ref13$angle === void 0 ? Math.PI * 0.5 : _ref13$angle,
          _ref13$scale = _ref13.scale,
          scale = _ref13$scale === void 0 ? 1.0 : _ref13$scale;

      _classCallCheck(this, DotScreenEffect);

      _this31 = _super35.call(this, "DotScreenEffect", fragmentShader$k, {
        blendFunction: blendFunction,
        uniforms: new Map([["angle", new three.Uniform(new three.Vector2())], ["scale", new three.Uniform(scale)]])
      });

      _this31.setAngle(angle);

      return _this31;
    }

    _createClass(DotScreenEffect, [{
      key: "setAngle",
      value: function setAngle(angle) {
        this.uniforms.get("angle").value.set(Math.sin(angle), Math.cos(angle));
      }
    }]);

    return DotScreenEffect;
  }(Effect);

  var fragmentShader$l = "uniform float gamma;void mainImage(const in vec4 inputColor,const in vec2 uv,out vec4 outputColor){outputColor=LinearToGamma(max(inputColor,0.0),gamma);}";

  var GammaCorrectionEffect = function (_Effect10) {
    _inherits(GammaCorrectionEffect, _Effect10);

    var _super36 = _createSuper(GammaCorrectionEffect);

    function GammaCorrectionEffect() {
      var _ref14 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          _ref14$blendFunction = _ref14.blendFunction,
          blendFunction = _ref14$blendFunction === void 0 ? BlendFunction.NORMAL : _ref14$blendFunction,
          _ref14$gamma = _ref14.gamma,
          gamma = _ref14$gamma === void 0 ? 2.0 : _ref14$gamma;

      _classCallCheck(this, GammaCorrectionEffect);

      return _super36.call(this, "GammaCorrectionEffect", fragmentShader$l, {
        blendFunction: blendFunction,
        uniforms: new Map([["gamma", new three.Uniform(gamma)]])
      });
    }

    return GammaCorrectionEffect;
  }(Effect);

  var fragmentShader$m = "uniform sampler2D perturbationMap;uniform bool active;uniform float columns;uniform float random;uniform vec2 seed;uniform vec2 distortion;void mainUv(inout vec2 uv){if(active){if(uv.y<distortion.x+columns&&uv.y>distortion.x-columns*random){float sx=clamp(ceil(seed.x),0.0,1.0);uv.y=sx*(1.0-(uv.y+distortion.y))+(1.0-sx)*distortion.y;}if(uv.x<distortion.y+columns&&uv.x>distortion.y-columns*random){float sy=clamp(ceil(seed.y),0.0,1.0);uv.x=sy*distortion.x+(1.0-sy)*(1.0-(uv.x+distortion.x));}vec2 normal=texture2D(perturbationMap,uv*random*random).rg;uv+=normal*seed*(random*0.2);}}";
  var tag = "Glitch.Generated";

  function randomFloat(low, high) {
    return low + Math.random() * (high - low);
  }

  var GlitchEffect = function (_Effect11) {
    _inherits(GlitchEffect, _Effect11);

    var _super37 = _createSuper(GlitchEffect);

    function GlitchEffect() {
      var _this32;

      var _ref15 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          _ref15$blendFunction = _ref15.blendFunction,
          blendFunction = _ref15$blendFunction === void 0 ? BlendFunction.NORMAL : _ref15$blendFunction,
          _ref15$chromaticAberr = _ref15.chromaticAberrationOffset,
          chromaticAberrationOffset = _ref15$chromaticAberr === void 0 ? null : _ref15$chromaticAberr,
          _ref15$delay = _ref15.delay,
          delay = _ref15$delay === void 0 ? new three.Vector2(1.5, 3.5) : _ref15$delay,
          _ref15$duration = _ref15.duration,
          duration = _ref15$duration === void 0 ? new three.Vector2(0.6, 1.0) : _ref15$duration,
          _ref15$strength = _ref15.strength,
          strength = _ref15$strength === void 0 ? new three.Vector2(0.3, 1.0) : _ref15$strength,
          _ref15$columns = _ref15.columns,
          columns = _ref15$columns === void 0 ? 0.05 : _ref15$columns,
          _ref15$ratio = _ref15.ratio,
          ratio = _ref15$ratio === void 0 ? 0.85 : _ref15$ratio,
          _ref15$perturbationMa = _ref15.perturbationMap,
          perturbationMap = _ref15$perturbationMa === void 0 ? null : _ref15$perturbationMa,
          _ref15$dtSize = _ref15.dtSize,
          dtSize = _ref15$dtSize === void 0 ? 64 : _ref15$dtSize;

      _classCallCheck(this, GlitchEffect);

      _this32 = _super37.call(this, "GlitchEffect", fragmentShader$m, {
        blendFunction: blendFunction,
        uniforms: new Map([["perturbationMap", new three.Uniform(null)], ["columns", new three.Uniform(columns)], ["active", new three.Uniform(false)], ["random", new three.Uniform(0.02)], ["seed", new three.Uniform(new three.Vector2())], ["distortion", new three.Uniform(new three.Vector2())]])
      });
      _this32.perturbationMap = null;

      _this32.setPerturbationMap(perturbationMap === null ? _this32.generatePerturbationMap(dtSize) : perturbationMap);

      _this32.perturbationMap.generateMipmaps = false;
      _this32.delay = delay;
      _this32.duration = duration;
      _this32.breakPoint = new three.Vector2(randomFloat(_this32.delay.x, _this32.delay.y), randomFloat(_this32.duration.x, _this32.duration.y));
      _this32.time = 0;
      _this32.seed = _this32.uniforms.get("seed").value;
      _this32.distortion = _this32.uniforms.get("distortion").value;
      _this32.mode = GlitchMode.SPORADIC;
      _this32.strength = strength;
      _this32.ratio = ratio;
      _this32.chromaticAberrationOffset = chromaticAberrationOffset;
      return _this32;
    }

    _createClass(GlitchEffect, [{
      key: "getPerturbationMap",
      value: function getPerturbationMap() {
        return this.perturbationMap;
      }
    }, {
      key: "setPerturbationMap",
      value: function setPerturbationMap(perturbationMap) {
        if (this.perturbationMap !== null && this.perturbationMap.name === tag) {
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
        var data = new Uint8Array(pixels * 3);
        var i, l, x;

        for (i = 0, l = data.length; i < l; i += 3) {
          x = Math.random() * 255;
          data[i] = x;
          data[i + 1] = x;
          data[i + 2] = x;
        }

        var map = new three.DataTexture(data, size, size, three.RGBFormat);
        map.name = tag;
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
  var fragmentShader$n = "uniform sampler2D texture;void mainImage(const in vec4 inputColor,const in vec2 uv,out vec4 outputColor){outputColor=texture2D(texture,uv);}";
  var v = new three.Vector3();
  var m = new three.Matrix4();

  var GodRaysEffect = function (_Effect12) {
    _inherits(GodRaysEffect, _Effect12);

    var _super38 = _createSuper(GodRaysEffect);

    function GodRaysEffect(camera, lightSource) {
      var _this33;

      var _ref16 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
          _ref16$blendFunction = _ref16.blendFunction,
          blendFunction = _ref16$blendFunction === void 0 ? BlendFunction.SCREEN : _ref16$blendFunction,
          _ref16$samples = _ref16.samples,
          samples = _ref16$samples === void 0 ? 60.0 : _ref16$samples,
          _ref16$density = _ref16.density,
          density = _ref16$density === void 0 ? 0.96 : _ref16$density,
          _ref16$decay = _ref16.decay,
          decay = _ref16$decay === void 0 ? 0.9 : _ref16$decay,
          _ref16$weight = _ref16.weight,
          weight = _ref16$weight === void 0 ? 0.4 : _ref16$weight,
          _ref16$exposure = _ref16.exposure,
          exposure = _ref16$exposure === void 0 ? 0.6 : _ref16$exposure,
          _ref16$clampMax = _ref16.clampMax,
          clampMax = _ref16$clampMax === void 0 ? 1.0 : _ref16$clampMax,
          _ref16$resolutionScal = _ref16.resolutionScale,
          resolutionScale = _ref16$resolutionScal === void 0 ? 0.5 : _ref16$resolutionScal,
          _ref16$width = _ref16.width,
          width = _ref16$width === void 0 ? Resizer.AUTO_SIZE : _ref16$width,
          _ref16$height = _ref16.height,
          height = _ref16$height === void 0 ? Resizer.AUTO_SIZE : _ref16$height,
          _ref16$kernelSize = _ref16.kernelSize,
          kernelSize = _ref16$kernelSize === void 0 ? KernelSize.SMALL : _ref16$kernelSize,
          _ref16$blur = _ref16.blur,
          blur = _ref16$blur === void 0 ? true : _ref16$blur;

      _classCallCheck(this, GodRaysEffect);

      _this33 = _super38.call(this, "GodRaysEffect", fragmentShader$n, {
        blendFunction: blendFunction,
        attributes: EffectAttribute.DEPTH,
        uniforms: new Map([["texture", new three.Uniform(null)]])
      });
      _this33.camera = camera;
      _this33.lightSource = lightSource;
      _this33.lightSource.material.depthWrite = false;
      _this33.lightSource.material.transparent = true;
      _this33.lightScene = new three.Scene();
      _this33.screenPosition = new three.Vector2();
      _this33.renderTargetA = new three.WebGLRenderTarget(1, 1, {
        minFilter: three.LinearFilter,
        magFilter: three.LinearFilter,
        stencilBuffer: false,
        depthBuffer: false
      });
      _this33.renderTargetA.texture.name = "GodRays.Target.A";
      _this33.renderTargetB = _this33.renderTargetA.clone();
      _this33.renderTargetB.texture.name = "GodRays.Target.B";
      _this33.uniforms.get("texture").value = _this33.renderTargetB.texture;
      _this33.renderTargetLight = _this33.renderTargetA.clone();
      _this33.renderTargetLight.texture.name = "GodRays.Light";
      _this33.renderTargetLight.depthBuffer = true;
      _this33.renderTargetLight.depthTexture = new three.DepthTexture();
      _this33.renderPassLight = new RenderPass(_this33.lightScene, camera);
      _this33.renderPassLight.getClearPass().overrideClearColor = new three.Color(0x000000);
      _this33.clearPass = new ClearPass(true, false, false);
      _this33.clearPass.overrideClearColor = new three.Color(0x000000);
      _this33.blurPass = new BlurPass({
        resolutionScale: resolutionScale,
        width: width,
        height: height,
        kernelSize: kernelSize
      });
      _this33.blurPass.resolution.resizable = _assertThisInitialized(_this33);
      _this33.depthMaskPass = new ShaderPass(function (depthTexture) {
        var material = new DepthMaskMaterial();
        material.uniforms.depthBuffer1.value = depthTexture;
        return material;
      }(_this33.renderTargetLight.depthTexture));
      _this33.godRaysPass = new ShaderPass(function () {
        var material = new GodRaysMaterial(_this33.screenPosition);
        material.uniforms.density.value = density;
        material.uniforms.decay.value = decay;
        material.uniforms.weight.value = weight;
        material.uniforms.exposure.value = exposure;
        material.uniforms.clampMax.value = clampMax;
        return material;
      }());
      _this33.samples = samples;
      _this33.blur = blur;
      return _this33;
    }

    _createClass(GodRaysEffect, [{
      key: "getResolutionScale",
      value: function getResolutionScale() {
        return this.resolution.scale;
      }
    }, {
      key: "setResolutionScale",
      value: function setResolutionScale(scale) {
        this.resolution.scale = scale;
        this.setSize(this.resolution.base.x, this.resolution.base.y);
      }
    }, {
      key: "setDepthTexture",
      value: function setDepthTexture(depthTexture) {
        var depthPacking = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
        var material = this.depthMaskPass.getFullscreenMaterial();
        material.uniforms.depthBuffer0.value = depthTexture;
        material.defines.DEPTH_PACKING_0 = depthPacking.toFixed(0);
      }
    }, {
      key: "update",
      value: function update(renderer, inputBuffer, deltaTime) {
        var lightSource = this.lightSource;
        var parent = lightSource.parent;
        var matrixAutoUpdate = lightSource.matrixAutoUpdate;
        var renderTargetA = this.renderTargetA;
        var renderTargetLight = this.renderTargetLight;
        lightSource.material.depthWrite = true;
        lightSource.matrixAutoUpdate = false;
        lightSource.updateWorldMatrix(true, false);

        if (parent !== null) {
          if (!matrixAutoUpdate) {
            m.copy(lightSource.matrix);
          }

          lightSource.matrix.copy(lightSource.matrixWorld);
        }

        this.lightScene.add(lightSource);
        this.renderPassLight.render(renderer, renderTargetLight);
        this.clearPass.render(renderer, renderTargetA);
        this.depthMaskPass.render(renderer, renderTargetLight, renderTargetA);
        lightSource.material.depthWrite = false;
        lightSource.matrixAutoUpdate = matrixAutoUpdate;

        if (parent !== null) {
          if (!matrixAutoUpdate) {
            lightSource.matrix.copy(m);
          }

          parent.add(lightSource);
        }

        v.setFromMatrixPosition(lightSource.matrixWorld).project(this.camera);
        this.screenPosition.set(Math.min(Math.max((v.x + 1.0) * 0.5, -1.0), 2.0), Math.min(Math.max((v.y + 1.0) * 0.5, -1.0), 2.0));

        if (this.blur) {
          this.blurPass.render(renderer, renderTargetA, renderTargetA);
        }

        this.godRaysPass.render(renderer, renderTargetA, this.renderTargetB);
      }
    }, {
      key: "setSize",
      value: function setSize(width, height) {
        this.blurPass.setSize(width, height);
        this.renderPassLight.setSize(width, height);
        this.depthMaskPass.setSize(width, height);
        this.godRaysPass.setSize(width, height);
        width = this.resolution.width;
        height = this.resolution.height;
        this.renderTargetA.setSize(width, height);
        this.renderTargetB.setSize(width, height);
        this.renderTargetLight.setSize(width, height);
      }
    }, {
      key: "initialize",
      value: function initialize(renderer, alpha, frameBufferType) {
        this.blurPass.initialize(renderer, alpha, frameBufferType);
        this.renderPassLight.initialize(renderer, alpha, frameBufferType);
        this.depthMaskPass.initialize(renderer, alpha, frameBufferType);
        this.godRaysPass.initialize(renderer, alpha, frameBufferType);

        if (!alpha && frameBufferType === three.UnsignedByteType) {
          this.renderTargetA.texture.format = three.RGBFormat;
          this.renderTargetB.texture.format = three.RGBFormat;
          this.renderTargetLight.texture.format = three.RGBFormat;
        }

        if (frameBufferType !== undefined) {
          this.renderTargetA.texture.type = frameBufferType;
          this.renderTargetB.texture.type = frameBufferType;
          this.renderTargetLight.texture.type = frameBufferType;
        }
      }
    }, {
      key: "texture",
      get: function get() {
        return this.renderTargetB.texture;
      }
    }, {
      key: "godRaysMaterial",
      get: function get() {
        return this.godRaysPass.getFullscreenMaterial();
      }
    }, {
      key: "resolution",
      get: function get() {
        return this.blurPass.resolution;
      }
    }, {
      key: "width",
      get: function get() {
        return this.resolution.width;
      },
      set: function set(value) {
        this.resolution.width = value;
      }
    }, {
      key: "height",
      get: function get() {
        return this.resolution.height;
      },
      set: function set(value) {
        this.resolution.height = value;
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

  var fragmentShader$o = "uniform vec2 scale;uniform float lineWidth;void mainImage(const in vec4 inputColor,const in vec2 uv,out vec4 outputColor){float grid=0.5-max(abs(mod(uv.x*scale.x,1.0)-0.5),abs(mod(uv.y*scale.y,1.0)-0.5));outputColor=vec4(vec3(smoothstep(0.0,lineWidth,grid)),inputColor.a);}";

  var GridEffect = function (_Effect13) {
    _inherits(GridEffect, _Effect13);

    var _super39 = _createSuper(GridEffect);

    function GridEffect() {
      var _this34;

      var _ref17 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          _ref17$blendFunction = _ref17.blendFunction,
          blendFunction = _ref17$blendFunction === void 0 ? BlendFunction.OVERLAY : _ref17$blendFunction,
          _ref17$scale = _ref17.scale,
          scale = _ref17$scale === void 0 ? 1.0 : _ref17$scale,
          _ref17$lineWidth = _ref17.lineWidth,
          lineWidth = _ref17$lineWidth === void 0 ? 0.0 : _ref17$lineWidth;

      _classCallCheck(this, GridEffect);

      _this34 = _super39.call(this, "GridEffect", fragmentShader$o, {
        blendFunction: blendFunction,
        uniforms: new Map([["scale", new three.Uniform(new three.Vector2())], ["lineWidth", new three.Uniform(lineWidth)]])
      });
      _this34.resolution = new three.Vector2();
      _this34.scale = Math.max(scale, 1e-6);
      _this34.lineWidth = Math.max(lineWidth, 0.0);
      return _this34;
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

  var fragmentShader$p = "uniform vec3 hue;uniform float saturation;void mainImage(const in vec4 inputColor,const in vec2 uv,out vec4 outputColor){vec3 color=vec3(dot(inputColor.rgb,hue.xyz),dot(inputColor.rgb,hue.zxy),dot(inputColor.rgb,hue.yzx));float average=(color.r+color.g+color.b)/3.0;vec3 diff=average-color;if(saturation>0.0){color+=diff*(1.0-1.0/(1.001-saturation));}else{color+=diff*-saturation;}outputColor=vec4(min(color,1.0),inputColor.a);}";

  var HueSaturationEffect = function (_Effect14) {
    _inherits(HueSaturationEffect, _Effect14);

    var _super40 = _createSuper(HueSaturationEffect);

    function HueSaturationEffect() {
      var _this35;

      var _ref18 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          _ref18$blendFunction = _ref18.blendFunction,
          blendFunction = _ref18$blendFunction === void 0 ? BlendFunction.NORMAL : _ref18$blendFunction,
          _ref18$hue = _ref18.hue,
          hue = _ref18$hue === void 0 ? 0.0 : _ref18$hue,
          _ref18$saturation = _ref18.saturation,
          saturation = _ref18$saturation === void 0 ? 0.0 : _ref18$saturation;

      _classCallCheck(this, HueSaturationEffect);

      _this35 = _super40.call(this, "HueSaturationEffect", fragmentShader$p, {
        blendFunction: blendFunction,
        uniforms: new Map([["hue", new three.Uniform(new three.Vector3())], ["saturation", new three.Uniform(saturation)]])
      });

      _this35.setHue(hue);

      return _this35;
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

  var fragmentShader$q = "void mainImage(const in vec4 inputColor,const in vec2 uv,out vec4 outputColor){vec3 noise=vec3(rand(uv*time));\n#ifdef PREMULTIPLY\noutputColor=vec4(min(inputColor.rgb*noise,vec3(1.0)),inputColor.a);\n#else\noutputColor=vec4(noise,inputColor.a);\n#endif\n}";

  var NoiseEffect = function (_Effect15) {
    _inherits(NoiseEffect, _Effect15);

    var _super41 = _createSuper(NoiseEffect);

    function NoiseEffect() {
      var _this36;

      var _ref19 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          _ref19$blendFunction = _ref19.blendFunction,
          blendFunction = _ref19$blendFunction === void 0 ? BlendFunction.SCREEN : _ref19$blendFunction,
          _ref19$premultiply = _ref19.premultiply,
          premultiply = _ref19$premultiply === void 0 ? false : _ref19$premultiply;

      _classCallCheck(this, NoiseEffect);

      _this36 = _super41.call(this, "NoiseEffect", fragmentShader$q, {
        blendFunction: blendFunction
      });
      _this36.premultiply = premultiply;
      return _this36;
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

  var fragmentShader$r = "uniform sampler2D edgeTexture;uniform sampler2D maskTexture;uniform vec3 visibleEdgeColor;uniform vec3 hiddenEdgeColor;uniform float pulse;uniform float edgeStrength;\n#ifdef USE_PATTERN\nuniform sampler2D patternTexture;varying vec2 vUvPattern;\n#endif\nvoid mainImage(const in vec4 inputColor,const in vec2 uv,out vec4 outputColor){vec2 edge=texture2D(edgeTexture,uv).rg;vec2 mask=texture2D(maskTexture,uv).rg;\n#ifndef X_RAY\nedge.y=0.0;\n#endif\nedge*=(edgeStrength*mask.x*pulse);vec3 color=edge.x*visibleEdgeColor+edge.y*hiddenEdgeColor;float visibilityFactor=0.0;\n#ifdef USE_PATTERN\nvec4 patternColor=texture2D(patternTexture,vUvPattern);\n#ifdef X_RAY\nfloat hiddenFactor=0.5;\n#else\nfloat hiddenFactor=0.0;\n#endif\nvisibilityFactor=(1.0-mask.y>0.0)? 1.0 : hiddenFactor;visibilityFactor*=(1.0-mask.x)*patternColor.a;color+=visibilityFactor*patternColor.rgb;\n#endif\nfloat alpha=max(max(edge.x,edge.y),visibilityFactor);\n#ifdef ALPHA\noutputColor=vec4(color,alpha);\n#else\noutputColor=vec4(color,max(alpha,inputColor.a));\n#endif\n}";
  var vertexShader$7 = "uniform float patternScale;varying vec2 vUvPattern;void mainSupport(const in vec2 uv){vUvPattern=uv*vec2(aspect,1.0)*patternScale;}";

  var OutlineEffect = function (_Effect16) {
    _inherits(OutlineEffect, _Effect16);

    var _super42 = _createSuper(OutlineEffect);

    function OutlineEffect(scene, camera) {
      var _this37;

      var _ref20 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
          _ref20$blendFunction = _ref20.blendFunction,
          blendFunction = _ref20$blendFunction === void 0 ? BlendFunction.SCREEN : _ref20$blendFunction,
          _ref20$patternTexture = _ref20.patternTexture,
          patternTexture = _ref20$patternTexture === void 0 ? null : _ref20$patternTexture,
          _ref20$edgeStrength = _ref20.edgeStrength,
          edgeStrength = _ref20$edgeStrength === void 0 ? 1.0 : _ref20$edgeStrength,
          _ref20$pulseSpeed = _ref20.pulseSpeed,
          pulseSpeed = _ref20$pulseSpeed === void 0 ? 0.0 : _ref20$pulseSpeed,
          _ref20$visibleEdgeCol = _ref20.visibleEdgeColor,
          visibleEdgeColor = _ref20$visibleEdgeCol === void 0 ? 0xffffff : _ref20$visibleEdgeCol,
          _ref20$hiddenEdgeColo = _ref20.hiddenEdgeColor,
          hiddenEdgeColor = _ref20$hiddenEdgeColo === void 0 ? 0x22090a : _ref20$hiddenEdgeColo,
          _ref20$resolutionScal = _ref20.resolutionScale,
          resolutionScale = _ref20$resolutionScal === void 0 ? 0.5 : _ref20$resolutionScal,
          _ref20$width = _ref20.width,
          width = _ref20$width === void 0 ? Resizer.AUTO_SIZE : _ref20$width,
          _ref20$height = _ref20.height,
          height = _ref20$height === void 0 ? Resizer.AUTO_SIZE : _ref20$height,
          _ref20$kernelSize = _ref20.kernelSize,
          kernelSize = _ref20$kernelSize === void 0 ? KernelSize.VERY_SMALL : _ref20$kernelSize,
          _ref20$blur = _ref20.blur,
          blur = _ref20$blur === void 0 ? false : _ref20$blur,
          _ref20$xRay = _ref20.xRay,
          xRay = _ref20$xRay === void 0 ? true : _ref20$xRay;

      _classCallCheck(this, OutlineEffect);

      _this37 = _super42.call(this, "OutlineEffect", fragmentShader$r, {
        uniforms: new Map([["maskTexture", new three.Uniform(null)], ["edgeTexture", new three.Uniform(null)], ["edgeStrength", new three.Uniform(edgeStrength)], ["visibleEdgeColor", new three.Uniform(new three.Color(visibleEdgeColor))], ["hiddenEdgeColor", new three.Uniform(new three.Color(hiddenEdgeColor))], ["pulse", new three.Uniform(1.0)]])
      });

      _this37.blendMode = function (defines) {
        return new Proxy(_this37.blendMode, {
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
      }(_this37.defines);

      _this37.blendMode.blendFunction = blendFunction;

      _this37.setPatternTexture(patternTexture);

      _this37.xRay = xRay;
      _this37.scene = scene;
      _this37.camera = camera;
      _this37.renderTargetMask = new three.WebGLRenderTarget(1, 1, {
        minFilter: three.LinearFilter,
        magFilter: three.LinearFilter,
        stencilBuffer: false,
        format: three.RGBFormat
      });
      _this37.renderTargetMask.texture.name = "Outline.Mask";
      _this37.uniforms.get("maskTexture").value = _this37.renderTargetMask.texture;
      _this37.renderTargetOutline = _this37.renderTargetMask.clone();
      _this37.renderTargetOutline.texture.name = "Outline.Edges";
      _this37.renderTargetOutline.depthBuffer = false;
      _this37.renderTargetBlurredOutline = _this37.renderTargetOutline.clone();
      _this37.renderTargetBlurredOutline.texture.name = "Outline.BlurredEdges";
      _this37.clearPass = new ClearPass();
      _this37.clearPass.overrideClearColor = new three.Color(0x000000);
      _this37.clearPass.overrideClearAlpha = 1.0;
      _this37.depthPass = new DepthPass(scene, camera);
      _this37.maskPass = new RenderPass(scene, camera, new DepthComparisonMaterial(_this37.depthPass.renderTarget.texture, camera));

      var clearPass = _this37.maskPass.getClearPass();

      clearPass.overrideClearColor = new three.Color(0xffffff);
      clearPass.overrideClearAlpha = 1.0;
      _this37.blurPass = new BlurPass({
        resolutionScale: resolutionScale,
        width: width,
        height: height,
        kernelSize: kernelSize
      });
      _this37.blurPass.resolution.resizable = _assertThisInitialized(_this37);
      _this37.blur = blur;
      _this37.outlinePass = new ShaderPass(new OutlineMaterial());
      _this37.outlinePass.getFullscreenMaterial().uniforms.inputBuffer.value = _this37.renderTargetMask.texture;
      _this37.time = 0.0;
      _this37.selection = new Selection();
      _this37.pulseSpeed = pulseSpeed;
      return _this37;
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
        return this.resolution.scale;
      }
    }, {
      key: "setResolutionScale",
      value: function setResolutionScale(scale) {
        this.resolution.scale = scale;
        this.setSize(this.resolution.base.x, this.resolution.base.y);
      }
    }, {
      key: "setSelection",
      value: function setSelection(objects) {
        this.selection.set(objects);
        return this;
      }
    }, {
      key: "clearSelection",
      value: function clearSelection() {
        this.selection.clear();
        return this;
      }
    }, {
      key: "selectObject",
      value: function selectObject(object) {
        this.selection.add(object);
        return this;
      }
    }, {
      key: "deselectObject",
      value: function deselectObject(object) {
        this.selection["delete"](object);
        return this;
      }
    }, {
      key: "update",
      value: function update(renderer, inputBuffer, deltaTime) {
        var scene = this.scene;
        var camera = this.camera;
        var selection = this.selection;
        var pulse = this.uniforms.get("pulse");
        var background = scene.background;
        var mask = camera.layers.mask;

        if (selection.size > 0) {
          scene.background = null;
          pulse.value = 1.0;

          if (this.pulseSpeed > 0.0) {
            pulse.value = 0.625 + Math.cos(this.time * this.pulseSpeed * 10.0) * 0.375;
          }

          this.time += deltaTime;
          selection.setVisible(false);
          this.depthPass.render(renderer);
          selection.setVisible(true);
          camera.layers.set(selection.layer);
          this.maskPass.render(renderer, this.renderTargetMask);
          camera.layers.mask = mask;
          scene.background = background;
          this.outlinePass.render(renderer, null, this.renderTargetOutline);

          if (this.blur) {
            this.blurPass.render(renderer, this.renderTargetOutline, this.renderTargetBlurredOutline);
          }
        } else if (this.time > 0.0) {
          this.clearPass.render(renderer, this.renderTargetMask);
          this.time = 0.0;
        }
      }
    }, {
      key: "setSize",
      value: function setSize(width, height) {
        this.blurPass.setSize(width, height);
        this.renderTargetMask.setSize(width, height);
        width = this.resolution.width;
        height = this.resolution.height;
        this.depthPass.setSize(width, height);
        this.renderTargetOutline.setSize(width, height);
        this.renderTargetBlurredOutline.setSize(width, height);
        this.outlinePass.getFullscreenMaterial().setTexelSize(1.0 / width, 1.0 / height);
      }
    }, {
      key: "initialize",
      value: function initialize(renderer, alpha, frameBufferType) {
        this.blurPass.initialize(renderer, alpha, three.UnsignedByteType);

        if (frameBufferType !== undefined) {
          this.depthPass.initialize(renderer, alpha, frameBufferType);
          this.maskPass.initialize(renderer, alpha, frameBufferType);
          this.outlinePass.initialize(renderer, alpha, frameBufferType);
        }
      }
    }, {
      key: "resolution",
      get: function get() {
        return this.blurPass.resolution;
      }
    }, {
      key: "width",
      get: function get() {
        return this.resolution.width;
      },
      set: function set(value) {
        this.resolution.width = value;
      }
    }, {
      key: "height",
      get: function get() {
        return this.resolution.height;
      },
      set: function set(value) {
        this.resolution.height = value;
      }
    }, {
      key: "selectionLayer",
      get: function get() {
        return this.selection.layer;
      },
      set: function set(value) {
        this.selection.layer = value;
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
        this.uniforms.get("edgeTexture").value = value ? this.renderTargetBlurredOutline.texture : this.renderTargetOutline.texture;
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

  var fragmentShader$s = "uniform bool active;uniform vec2 d;void mainUv(inout vec2 uv){if(active){uv=vec2(d.x*(floor(uv.x/d.x)+0.5),d.y*(floor(uv.y/d.y)+0.5));}}";

  var PixelationEffect = function (_Effect17) {
    _inherits(PixelationEffect, _Effect17);

    var _super43 = _createSuper(PixelationEffect);

    function PixelationEffect() {
      var _this38;

      var granularity = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 30.0;

      _classCallCheck(this, PixelationEffect);

      _this38 = _super43.call(this, "PixelationEffect", fragmentShader$s, {
        uniforms: new Map([["active", new three.Uniform(false)], ["d", new three.Uniform(new three.Vector2())]])
      });
      _this38.resolution = new three.Vector2();
      _this38.granularity = granularity;
      return _this38;
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

  var fragmentShader$t = "uniform float focus;uniform float focalLength;uniform float fStop;uniform float maxBlur;uniform float luminanceThreshold;uniform float luminanceGain;uniform float bias;uniform float fringe;\n#ifdef MANUAL_DOF\nuniform vec4 dof;\n#endif\n#ifdef PENTAGON\nfloat pentagon(const in vec2 coords){const vec4 HS0=vec4(1.0,0.0,0.0,1.0);const vec4 HS1=vec4(0.309016994,0.951056516,0.0,1.0);const vec4 HS2=vec4(-0.809016994,0.587785252,0.0,1.0);const vec4 HS3=vec4(-0.809016994,-0.587785252,0.0,1.0);const vec4 HS4=vec4(0.309016994,-0.951056516,0.0,1.0);const vec4 HS5=vec4(0.0,0.0,1.0,1.0);const vec4 ONE=vec4(1.0);const float P_FEATHER=0.4;const float N_FEATHER=-P_FEATHER;float inOrOut=-4.0;vec4 P=vec4(coords,vec2(RINGS_FLOAT-1.3));vec4 dist=vec4(dot(P,HS0),dot(P,HS1),dot(P,HS2),dot(P,HS3));dist=smoothstep(N_FEATHER,P_FEATHER,dist);inOrOut+=dot(dist,ONE);dist.x=dot(P,HS4);dist.y=HS5.w-abs(P.z);dist=smoothstep(N_FEATHER,P_FEATHER,dist);inOrOut+=dist.x;return clamp(inOrOut,0.0,1.0);}\n#endif\nvec3 processTexel(const in vec2 coords,const in float blur){vec2 scale=texelSize*fringe*blur;vec3 c=vec3(texture2D(inputBuffer,coords+vec2(0.0,1.0)*scale).r,texture2D(inputBuffer,coords+vec2(-0.866,-0.5)*scale).g,texture2D(inputBuffer,coords+vec2(0.866,-0.5)*scale).b);float luminance=linearToRelativeLuminance(c);float threshold=max((luminance-luminanceThreshold)*luminanceGain,0.0);return c+mix(vec3(0.0),c,threshold*blur);}float gather(const in float i,const in float j,const in float ringSamples,const in vec2 uv,const in vec2 blurFactor,const in float blur,inout vec3 color){float step=PI2/ringSamples;vec2 wh=vec2(cos(j*step)*i,sin(j*step)*i);\n#ifdef PENTAGON\nfloat p=pentagon(wh);\n#else\nfloat p=1.0;\n#endif\ncolor+=processTexel(wh*blurFactor+uv,blur)*mix(1.0,i/RINGS_FLOAT,bias)*p;return mix(1.0,i/RINGS_FLOAT,bias)*p;}void mainImage(const in vec4 inputColor,const in vec2 uv,const in float depth,out vec4 outputColor){\n#ifdef PERSPECTIVE_CAMERA\nfloat viewZ=perspectiveDepthToViewZ(depth,cameraNear,cameraFar);float linearDepth=viewZToOrthographicDepth(viewZ,cameraNear,cameraFar);\n#else\nfloat linearDepth=depth;\n#endif\n#ifdef MANUAL_DOF\nfloat focalPlane=linearDepth-focus;float farDoF=(focalPlane-dof.z)/dof.w;float nearDoF=(-focalPlane-dof.x)/dof.y;float blur=(focalPlane>0.0)? farDoF : nearDoF;\n#else\nconst float CIRCLE_OF_CONFUSION=0.03;float focalPlaneMM=focus*1000.0;float depthMM=linearDepth*1000.0;float focalPlane=(depthMM*focalLength)/(depthMM-focalLength);float farDoF=(focalPlaneMM*focalLength)/(focalPlaneMM-focalLength);float nearDoF=(focalPlaneMM-focalLength)/(focalPlaneMM*fStop*CIRCLE_OF_CONFUSION);float blur=abs(focalPlane-farDoF)*nearDoF;\n#endif\nconst int MAX_RING_SAMPLES=RINGS_INT*SAMPLES_INT;blur=clamp(blur,0.0,1.0);vec3 color=inputColor.rgb;if(blur>=0.05){vec2 blurFactor=blur*maxBlur*texelSize;float s=1.0;int ringSamples;for(int i=1;i<=RINGS_INT;i++){ringSamples=i*SAMPLES_INT;for(int j=0;j<MAX_RING_SAMPLES;j++){if(j>=ringSamples){break;}s+=gather(float(i),float(j),float(ringSamples),uv,blurFactor,blur,color);}}color/=s;}\n#ifdef SHOW_FOCUS\nfloat edge=0.002*linearDepth;float m=clamp(smoothstep(0.0,edge,blur),0.0,1.0);float e=clamp(smoothstep(1.0-edge,1.0,blur),0.0,1.0);color=mix(color,vec3(1.0,0.5,0.0),(1.0-m)*0.6);color=mix(color,vec3(0.0,0.5,1.0),((1.0-e)-(1.0-m))*0.2);\n#endif\noutputColor=vec4(color,inputColor.a);}";

  var RealisticBokehEffect = function (_Effect18) {
    _inherits(RealisticBokehEffect, _Effect18);

    var _super44 = _createSuper(RealisticBokehEffect);

    function RealisticBokehEffect() {
      var _this39;

      var _ref21 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          _ref21$blendFunction = _ref21.blendFunction,
          blendFunction = _ref21$blendFunction === void 0 ? BlendFunction.NORMAL : _ref21$blendFunction,
          _ref21$focus = _ref21.focus,
          focus = _ref21$focus === void 0 ? 1.0 : _ref21$focus,
          _ref21$focalLength = _ref21.focalLength,
          focalLength = _ref21$focalLength === void 0 ? 24.0 : _ref21$focalLength,
          _ref21$fStop = _ref21.fStop,
          fStop = _ref21$fStop === void 0 ? 0.9 : _ref21$fStop,
          _ref21$luminanceThres = _ref21.luminanceThreshold,
          luminanceThreshold = _ref21$luminanceThres === void 0 ? 0.5 : _ref21$luminanceThres,
          _ref21$luminanceGain = _ref21.luminanceGain,
          luminanceGain = _ref21$luminanceGain === void 0 ? 2.0 : _ref21$luminanceGain,
          _ref21$bias = _ref21.bias,
          bias = _ref21$bias === void 0 ? 0.5 : _ref21$bias,
          _ref21$fringe = _ref21.fringe,
          fringe = _ref21$fringe === void 0 ? 0.7 : _ref21$fringe,
          _ref21$maxBlur = _ref21.maxBlur,
          maxBlur = _ref21$maxBlur === void 0 ? 1.0 : _ref21$maxBlur,
          _ref21$rings = _ref21.rings,
          rings = _ref21$rings === void 0 ? 3 : _ref21$rings,
          _ref21$samples = _ref21.samples,
          samples = _ref21$samples === void 0 ? 2 : _ref21$samples,
          _ref21$showFocus = _ref21.showFocus,
          showFocus = _ref21$showFocus === void 0 ? false : _ref21$showFocus,
          _ref21$manualDoF = _ref21.manualDoF,
          manualDoF = _ref21$manualDoF === void 0 ? false : _ref21$manualDoF,
          _ref21$pentagon = _ref21.pentagon,
          pentagon = _ref21$pentagon === void 0 ? false : _ref21$pentagon;

      _classCallCheck(this, RealisticBokehEffect);

      _this39 = _super44.call(this, "RealisticBokehEffect", fragmentShader$t, {
        blendFunction: blendFunction,
        attributes: EffectAttribute.CONVOLUTION | EffectAttribute.DEPTH,
        uniforms: new Map([["focus", new three.Uniform(focus)], ["focalLength", new three.Uniform(focalLength)], ["fStop", new three.Uniform(fStop)], ["luminanceThreshold", new three.Uniform(luminanceThreshold)], ["luminanceGain", new three.Uniform(luminanceGain)], ["bias", new three.Uniform(bias)], ["fringe", new three.Uniform(fringe)], ["maxBlur", new three.Uniform(maxBlur)]])
      });
      _this39.rings = rings;
      _this39.samples = samples;
      _this39.showFocus = showFocus;
      _this39.manualDoF = manualDoF;
      _this39.pentagon = pentagon;
      return _this39;
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

  var fragmentShader$u = "uniform float count;void mainImage(const in vec4 inputColor,const in vec2 uv,out vec4 outputColor){vec2 sl=vec2(sin(uv.y*count),cos(uv.y*count));vec3 scanlines=vec3(sl.x,sl.y,sl.x);outputColor=vec4(scanlines,inputColor.a);}";

  var ScanlineEffect = function (_Effect19) {
    _inherits(ScanlineEffect, _Effect19);

    var _super45 = _createSuper(ScanlineEffect);

    function ScanlineEffect() {
      var _this40;

      var _ref22 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          _ref22$blendFunction = _ref22.blendFunction,
          blendFunction = _ref22$blendFunction === void 0 ? BlendFunction.OVERLAY : _ref22$blendFunction,
          _ref22$density = _ref22.density,
          density = _ref22$density === void 0 ? 1.25 : _ref22$density;

      _classCallCheck(this, ScanlineEffect);

      _this40 = _super45.call(this, "ScanlineEffect", fragmentShader$u, {
        blendFunction: blendFunction,
        uniforms: new Map([["count", new three.Uniform(0.0)]])
      });
      _this40.resolution = new three.Vector2();
      _this40.density = density;
      return _this40;
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

  var fragmentShader$v = "uniform bool active;uniform vec2 center;uniform float waveSize;uniform float radius;uniform float maxRadius;uniform float amplitude;varying float vSize;void mainUv(inout vec2 uv){if(active){vec2 aspectCorrection=vec2(aspect,1.0);vec2 difference=uv*aspectCorrection-center*aspectCorrection;float distance=sqrt(dot(difference,difference))*vSize;if(distance>radius){if(distance<radius+waveSize){float angle=(distance-radius)*PI2/waveSize;float cosSin=(1.0-cos(angle))*0.5;float extent=maxRadius+waveSize;float decay=max(extent-distance*distance,0.0)/extent;uv-=((cosSin*amplitude*difference)/distance)*decay;}}}}";
  var vertexShader$8 = "uniform float size;uniform float cameraDistance;varying float vSize;void mainSupport(){vSize=(0.1*cameraDistance)/size;}";
  var HALF_PI = Math.PI * 0.5;
  var v$1 = new three.Vector3();
  var ab = new three.Vector3();

  var ShockWaveEffect = function (_Effect20) {
    _inherits(ShockWaveEffect, _Effect20);

    var _super46 = _createSuper(ShockWaveEffect);

    function ShockWaveEffect(camera) {
      var _this41;

      var epicenter = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : new three.Vector3();

      var _ref23 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
          _ref23$speed = _ref23.speed,
          speed = _ref23$speed === void 0 ? 2.0 : _ref23$speed,
          _ref23$maxRadius = _ref23.maxRadius,
          maxRadius = _ref23$maxRadius === void 0 ? 1.0 : _ref23$maxRadius,
          _ref23$waveSize = _ref23.waveSize,
          waveSize = _ref23$waveSize === void 0 ? 0.2 : _ref23$waveSize,
          _ref23$amplitude = _ref23.amplitude,
          amplitude = _ref23$amplitude === void 0 ? 0.05 : _ref23$amplitude;

      _classCallCheck(this, ShockWaveEffect);

      _this41 = _super46.call(this, "ShockWaveEffect", fragmentShader$v, {
        vertexShader: vertexShader$8,
        uniforms: new Map([["active", new three.Uniform(false)], ["center", new three.Uniform(new three.Vector2(0.5, 0.5))], ["cameraDistance", new three.Uniform(1.0)], ["size", new three.Uniform(1.0)], ["radius", new three.Uniform(-waveSize)], ["maxRadius", new three.Uniform(maxRadius)], ["waveSize", new three.Uniform(waveSize)], ["amplitude", new three.Uniform(amplitude)]])
      });
      _this41.camera = camera;
      _this41.epicenter = epicenter;
      _this41.screenPosition = _this41.uniforms.get("center").value;
      _this41.speed = speed;
      _this41.time = 0.0;
      _this41.active = false;
      return _this41;
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
        var uniformActive = uniforms.get("active");

        if (this.active) {
          var waveSize = uniforms.get("waveSize").value;
          camera.getWorldDirection(v$1);
          ab.copy(camera.position).sub(epicenter);
          uniformActive.value = v$1.angleTo(ab) > HALF_PI;

          if (uniformActive.value) {
            uniforms.get("cameraDistance").value = camera.position.distanceTo(epicenter);
            v$1.copy(epicenter).project(camera);
            this.screenPosition.set((v$1.x + 1.0) * 0.5, (v$1.y + 1.0) * 0.5);
          }

          this.time += delta * this.speed;
          var radius = this.time - waveSize;
          uniforms.get("radius").value = radius;

          if (radius >= (uniforms.get("maxRadius").value + waveSize) * 2.0) {
            this.active = false;
            uniformActive.value = false;
          }
        }
      }
    }]);

    return ShockWaveEffect;
  }(Effect);

  var SelectiveBloomEffect = function (_BloomEffect) {
    _inherits(SelectiveBloomEffect, _BloomEffect);

    var _super47 = _createSuper(SelectiveBloomEffect);

    function SelectiveBloomEffect(scene, camera, options) {
      var _this42;

      _classCallCheck(this, SelectiveBloomEffect);

      _this42 = _super47.call(this, options);
      _this42.scene = scene;
      _this42.camera = camera;
      _this42.clearPass = new ClearPass(true, true, false);
      _this42.clearPass.overrideClearColor = new three.Color(0x000000);
      _this42.renderPass = new RenderPass(scene, camera);
      _this42.renderPass.clear = false;
      _this42.blackoutPass = new RenderPass(scene, camera, new three.MeshBasicMaterial({
        color: 0x000000
      }));
      _this42.blackoutPass.clear = false;

      _this42.backgroundPass = function () {
        var backgroundScene = new three.Scene();
        var pass = new RenderPass(backgroundScene, camera);
        backgroundScene.background = scene.background;
        pass.clear = false;
        return pass;
      }();

      _this42.renderTargetSelection = new three.WebGLRenderTarget(1, 1, {
        minFilter: three.LinearFilter,
        magFilter: three.LinearFilter,
        stencilBuffer: false,
        depthBuffer: true
      });
      _this42.renderTargetSelection.texture.name = "Bloom.Selection";
      _this42.renderTargetSelection.texture.generateMipmaps = false;
      _this42.selection = new Selection();
      _this42.inverted = false;
      return _this42;
    }

    _createClass(SelectiveBloomEffect, [{
      key: "update",
      value: function update(renderer, inputBuffer, deltaTime) {
        var scene = this.scene;
        var camera = this.camera;
        var selection = this.selection;
        var renderTarget = this.renderTargetSelection;
        var background = scene.background;
        var mask = camera.layers.mask;
        this.clearPass.render(renderer, renderTarget);

        if (!this.ignoreBackground) {
          this.backgroundPass.render(renderer, renderTarget);
        }

        scene.background = null;

        if (this.inverted) {
          camera.layers.set(selection.layer);
          this.blackoutPass.render(renderer, renderTarget);
          camera.layers.mask = mask;
          selection.setVisible(false);
          this.renderPass.render(renderer, renderTarget);
          selection.setVisible(true);
        } else {
          selection.setVisible(false);
          this.blackoutPass.render(renderer, renderTarget);
          selection.setVisible(true);
          camera.layers.set(selection.layer);
          this.renderPass.render(renderer, renderTarget);
          camera.layers.mask = mask;
        }

        scene.background = background;

        _get(_getPrototypeOf(SelectiveBloomEffect.prototype), "update", this).call(this, renderer, renderTarget, deltaTime);
      }
    }, {
      key: "setSize",
      value: function setSize(width, height) {
        _get(_getPrototypeOf(SelectiveBloomEffect.prototype), "setSize", this).call(this, width, height);

        this.backgroundPass.setSize(width, height);
        this.blackoutPass.setSize(width, height);
        this.renderPass.setSize(width, height);
        this.renderTargetSelection.setSize(this.resolution.width, this.resolution.height);
      }
    }, {
      key: "initialize",
      value: function initialize(renderer, alpha, frameBufferType) {
        _get(_getPrototypeOf(SelectiveBloomEffect.prototype), "initialize", this).call(this, renderer, alpha, frameBufferType);

        this.backgroundPass.initialize(renderer, alpha, frameBufferType);
        this.blackoutPass.initialize(renderer, alpha, frameBufferType);
        this.renderPass.initialize(renderer, alpha, frameBufferType);

        if (!alpha && frameBufferType === three.UnsignedByteType) {
          this.renderTargetSelection.texture.format = three.RGBFormat;
        }

        if (frameBufferType !== undefined) {
          this.renderTargetSelection.texture.type = frameBufferType;
        }
      }
    }, {
      key: "ignoreBackground",
      get: function get() {
        return !this.backgroundPass.enabled;
      },
      set: function set(value) {
        this.backgroundPass.enabled = !value;
      }
    }]);

    return SelectiveBloomEffect;
  }(BloomEffect);

  var fragmentShader$w = "uniform float intensity;void mainImage(const in vec4 inputColor,const in vec2 uv,out vec4 outputColor){vec3 color=vec3(dot(inputColor.rgb,vec3(1.0-0.607*intensity,0.769*intensity,0.189*intensity)),dot(inputColor.rgb,vec3(0.349*intensity,1.0-0.314*intensity,0.168*intensity)),dot(inputColor.rgb,vec3(0.272*intensity,0.534*intensity,1.0-0.869*intensity)));outputColor=vec4(color,inputColor.a);}";

  var SepiaEffect = function (_Effect21) {
    _inherits(SepiaEffect, _Effect21);

    var _super48 = _createSuper(SepiaEffect);

    function SepiaEffect() {
      var _ref24 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          _ref24$blendFunction = _ref24.blendFunction,
          blendFunction = _ref24$blendFunction === void 0 ? BlendFunction.NORMAL : _ref24$blendFunction,
          _ref24$intensity = _ref24.intensity,
          intensity = _ref24$intensity === void 0 ? 1.0 : _ref24$intensity;

      _classCallCheck(this, SepiaEffect);

      return _super48.call(this, "SepiaEffect", fragmentShader$w, {
        blendFunction: blendFunction,
        uniforms: new Map([["intensity", new three.Uniform(intensity)]])
      });
    }

    return SepiaEffect;
  }(Effect);

  var searchImageDataURL = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAAAQCAYAAACm53kpAAAAeElEQVRYR+2XSwqAMAxEJ168ePEqwRSKhIIiuHjJqiU0gWE+1CQdApcVAMUAuARaMGCX1MIL/Ow13++9lW2s3mW9MWvsnWc/2fvGygwPAN4E8QzAA4CXAB6AHjG4JTHYI1ey3pcx6FHnEfhLDOIBKAmUBK6/ANUDTlROXAHd9EC1AAAAAElFTkSuQmCC";
  var areaImageDataURL = "data:image/png;base64,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";
  var fragmentShader$x = "uniform sampler2D weightMap;varying vec2 vOffset0;varying vec2 vOffset1;/***Moves values to a target vector based on a given conditional vector.*/void movec(const in bvec2 c,inout vec2 variable,const in vec2 value){if(c.x){variable.x=value.x;}if(c.y){variable.y=value.y;}}void movec(const in bvec4 c,inout vec4 variable,const in vec4 value){movec(c.xy,variable.xy,value.xy);movec(c.zw,variable.zw,value.zw);}void mainImage(const in vec4 inputColor,const in vec2 uv,out vec4 outputColor){vec4 a;a.x=texture2D(weightMap,vOffset0).a;a.y=texture2D(weightMap,vOffset1).g;a.wz=texture2D(weightMap,uv).rb;vec4 color=inputColor;if(dot(a,vec4(1.0))>=1e-5){bool h=max(a.x,a.z)>max(a.y,a.w);vec4 blendingOffset=vec4(0.0,a.y,0.0,a.w);vec2 blendingWeight=a.yw;movec(bvec4(h),blendingOffset,vec4(a.x,0.0,a.z,0.0));movec(bvec2(h),blendingWeight,a.xz);blendingWeight/=dot(blendingWeight,vec2(1.0));vec4 blendingCoord=blendingOffset*vec4(texelSize,-texelSize)+uv.xyxy;color=blendingWeight.x*texture2D(inputBuffer,blendingCoord.xy);color+=blendingWeight.y*texture2D(inputBuffer,blendingCoord.zw);}outputColor=color;}";
  var vertexShader$9 = "varying vec2 vOffset0;varying vec2 vOffset1;void mainSupport(const in vec2 uv){vOffset0=uv+texelSize*vec2(1.0,0.0);vOffset1=uv+texelSize*vec2(0.0,1.0);}";

  var SMAAEffect = function (_Effect22) {
    _inherits(SMAAEffect, _Effect22);

    var _super49 = _createSuper(SMAAEffect);

    function SMAAEffect(searchImage, areaImage) {
      var _this43;

      var preset = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : SMAAPreset.HIGH;
      var edgeDetectionMode = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : EdgeDetectionMode.COLOR;

      _classCallCheck(this, SMAAEffect);

      _this43 = _super49.call(this, "SMAAEffect", fragmentShader$x, {
        vertexShader: vertexShader$9,
        blendFunction: BlendFunction.NORMAL,
        attributes: EffectAttribute.CONVOLUTION,
        uniforms: new Map([["weightMap", new three.Uniform(null)]])
      });
      _this43.renderTargetEdges = new three.WebGLRenderTarget(1, 1, {
        minFilter: three.LinearFilter,
        stencilBuffer: false,
        depthBuffer: false,
        format: three.RGBFormat
      });
      _this43.renderTargetEdges.texture.name = "SMAA.Edges";
      _this43.renderTargetWeights = _this43.renderTargetEdges.clone();
      _this43.renderTargetWeights.texture.name = "SMAA.Weights";
      _this43.renderTargetWeights.texture.format = three.RGBAFormat;
      _this43.uniforms.get("weightMap").value = _this43.renderTargetWeights.texture;
      _this43.clearPass = new ClearPass(true, false, false);
      _this43.clearPass.overrideClearColor = new three.Color(0x000000);
      _this43.clearPass.overrideClearAlpha = 1.0;
      _this43.edgeDetectionPass = new ShaderPass(new EdgeDetectionMaterial(new three.Vector2(), edgeDetectionMode));

      if (edgeDetectionMode === EdgeDetectionMode.DEPTH) {
        _this43.attributes |= EffectAttribute.DEPTH;
      }

      _this43.weightsPass = new ShaderPass(new SMAAWeightsMaterial());

      _this43.weightsPass.getFullscreenMaterial().uniforms.searchTexture.value = function () {
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

      _this43.weightsPass.getFullscreenMaterial().uniforms.areaTexture.value = function () {
        var areaTexture = new three.Texture(areaImage);
        areaTexture.name = "SMAA.Area";
        areaTexture.minFilter = three.LinearFilter;
        areaTexture.format = three.RGBAFormat;
        areaTexture.generateMipmaps = false;
        areaTexture.needsUpdate = true;
        areaTexture.flipY = false;
        return areaTexture;
      }();

      _this43.applyPreset(preset);

      return _this43;
    }

    _createClass(SMAAEffect, [{
      key: "setEdgeDetectionThreshold",
      value: function setEdgeDetectionThreshold(threshold) {
        this.edgeDetectionPass.getFullscreenMaterial().setEdgeDetectionThreshold(threshold);
      }
    }, {
      key: "setOrthogonalSearchSteps",
      value: function setOrthogonalSearchSteps(steps) {
        this.weightsPass.getFullscreenMaterial().setOrthogonalSearchSteps(steps);
      }
    }, {
      key: "applyPreset",
      value: function applyPreset(preset) {
        var edgeDetectionMaterial = this.edgeDetectionMaterial;
        var weightsMaterial = this.weightsMaterial;

        switch (preset) {
          case SMAAPreset.LOW:
            edgeDetectionMaterial.setEdgeDetectionThreshold(0.15);
            weightsMaterial.setOrthogonalSearchSteps(4);
            weightsMaterial.diagonalDetection = false;
            weightsMaterial.cornerRounding = false;
            break;

          case SMAAPreset.MEDIUM:
            edgeDetectionMaterial.setEdgeDetectionThreshold(0.1);
            weightsMaterial.setOrthogonalSearchSteps(8);
            weightsMaterial.diagonalDetection = false;
            weightsMaterial.cornerRounding = false;
            break;

          case SMAAPreset.HIGH:
            edgeDetectionMaterial.setEdgeDetectionThreshold(0.1);
            weightsMaterial.setOrthogonalSearchSteps(16);
            weightsMaterial.setDiagonalSearchSteps(8);
            weightsMaterial.setCornerRounding(25);
            weightsMaterial.diagonalDetection = true;
            weightsMaterial.cornerRounding = true;
            break;

          case SMAAPreset.ULTRA:
            edgeDetectionMaterial.setEdgeDetectionThreshold(0.05);
            weightsMaterial.setOrthogonalSearchSteps(32);
            weightsMaterial.setDiagonalSearchSteps(16);
            weightsMaterial.setCornerRounding(25);
            weightsMaterial.diagonalDetection = true;
            weightsMaterial.cornerRounding = true;
            break;
        }
      }
    }, {
      key: "setDepthTexture",
      value: function setDepthTexture(depthTexture) {
        var depthPacking = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
        var material = this.edgeDetectionMaterial;
        material.uniforms.depthBuffer.value = depthTexture;
        material.depthPacking = depthPacking;
      }
    }, {
      key: "update",
      value: function update(renderer, inputBuffer, deltaTime) {
        this.clearPass.render(renderer, this.renderTargetEdges);
        this.edgeDetectionPass.render(renderer, inputBuffer, this.renderTargetEdges);
        this.weightsPass.render(renderer, this.renderTargetEdges, this.renderTargetWeights);
      }
    }, {
      key: "setSize",
      value: function setSize(width, height) {
        var edgeDetectionMaterial = this.edgeDetectionPass.getFullscreenMaterial();
        var weightsMaterial = this.weightsPass.getFullscreenMaterial();
        this.renderTargetEdges.setSize(width, height);
        this.renderTargetWeights.setSize(width, height);
        weightsMaterial.uniforms.resolution.value.set(width, height);
        weightsMaterial.uniforms.texelSize.value.set(1.0 / width, 1.0 / height);
        edgeDetectionMaterial.uniforms.texelSize.value.copy(weightsMaterial.uniforms.texelSize.value);
      }
    }, {
      key: "dispose",
      value: function dispose() {
        var uniforms = this.weightsPass.getFullscreenMaterial().uniforms;
        uniforms.searchTexture.value.dispose();
        uniforms.areaTexture.value.dispose();

        _get(_getPrototypeOf(SMAAEffect.prototype), "dispose", this).call(this);
      }
    }, {
      key: "edgeDetectionMaterial",
      get: function get() {
        return this.edgeDetectionPass.getFullscreenMaterial();
      }
    }, {
      key: "colorEdgesMaterial",
      get: function get() {
        return this.edgeDetectionMaterial;
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
  var fragmentShader$y = "uniform sampler2D normalBuffer;uniform mat4 cameraProjectionMatrix;uniform mat4 cameraInverseProjectionMatrix;uniform vec2 radiusStep;uniform vec2 distanceCutoff;uniform vec2 proximityCutoff;uniform float seed;uniform float luminanceInfluence;uniform float scale;uniform float bias;vec3 getViewPosition(const in vec2 screenPosition,const in float depth,const in float viewZ){float clipW=cameraProjectionMatrix[2][3]*viewZ+cameraProjectionMatrix[3][3];vec4 clipPosition=vec4((vec3(screenPosition,depth)-0.5)*2.0,1.0);clipPosition*=clipW;return(cameraInverseProjectionMatrix*clipPosition).xyz;}float getOcclusion(const in vec3 p,const in vec3 n,const in vec3 sampleViewPosition){vec3 viewDelta=sampleViewPosition-p;float d=length(viewDelta)*scale;return max(0.0,dot(n,viewDelta)/d-bias)/(1.0+pow2(d));}float getAmbientOcclusion(const in vec3 p,const in vec3 n,const in float depth,const in vec2 uv){vec2 radius=radiusStep;float angle=rand(uv+seed)*PI2;float occlusionSum=0.0;for(int i=0;i<SAMPLES_INT;++i){vec2 coord=uv+vec2(cos(angle),sin(angle))*radius;radius+=radiusStep;angle+=ANGLE_STEP;float sampleDepth=readDepth(coord);float viewZ=getViewZ(sampleDepth);\n#ifdef PERSPECTIVE_CAMERA\nfloat linearSampleDepth=viewZToOrthographicDepth(viewZ,cameraNear,cameraFar);\n#else\nfloat linearSampleDepth=sampleDepth;\n#endif\nfloat proximity=abs(depth-linearSampleDepth);if(linearSampleDepth<distanceCutoff.y&&proximity<proximityCutoff.y){float falloff=1.0-smoothstep(proximityCutoff.x,proximityCutoff.y,proximity);vec3 sampleViewPosition=getViewPosition(coord,sampleDepth,viewZ);occlusionSum+=getOcclusion(p,n,sampleViewPosition)*falloff;}}return occlusionSum/SAMPLES_FLOAT;}void mainImage(const in vec4 inputColor,const in vec2 uv,const in float depth,out vec4 outputColor){float ao=1.0;float viewZ=getViewZ(depth);\n#ifdef PERSPECTIVE_CAMERA\nfloat linearDepth=viewZToOrthographicDepth(viewZ,cameraNear,cameraFar);\n#else\nfloat linearDepth=depth;\n#endif\nif(linearDepth<distanceCutoff.y){vec3 viewPosition=getViewPosition(uv,depth,viewZ);vec3 viewNormal=unpackRGBToNormal(texture2D(normalBuffer,uv).xyz);ao-=getAmbientOcclusion(viewPosition,viewNormal,linearDepth,uv);float l=linearToRelativeLuminance(inputColor.rgb);float d=smoothstep(distanceCutoff.x,distanceCutoff.y,linearDepth);float f=max(l*luminanceInfluence,d);ao=mix(ao,1.0,f);}outputColor=vec4(vec3(ao),inputColor.a);}";

  var SSAOEffect = function (_Effect23) {
    _inherits(SSAOEffect, _Effect23);

    var _super50 = _createSuper(SSAOEffect);

    function SSAOEffect(camera, normalBuffer) {
      var _this44;

      var _ref25 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
          _ref25$blendFunction = _ref25.blendFunction,
          blendFunction = _ref25$blendFunction === void 0 ? BlendFunction.MULTIPLY : _ref25$blendFunction,
          _ref25$samples = _ref25.samples,
          samples = _ref25$samples === void 0 ? 11 : _ref25$samples,
          _ref25$rings = _ref25.rings,
          rings = _ref25$rings === void 0 ? 4 : _ref25$rings,
          _ref25$distanceThresh = _ref25.distanceThreshold,
          distanceThreshold = _ref25$distanceThresh === void 0 ? 0.97 : _ref25$distanceThresh,
          _ref25$distanceFallof = _ref25.distanceFalloff,
          distanceFalloff = _ref25$distanceFallof === void 0 ? 0.03 : _ref25$distanceFallof,
          _ref25$rangeThreshold = _ref25.rangeThreshold,
          rangeThreshold = _ref25$rangeThreshold === void 0 ? 0.0005 : _ref25$rangeThreshold,
          _ref25$rangeFalloff = _ref25.rangeFalloff,
          rangeFalloff = _ref25$rangeFalloff === void 0 ? 0.001 : _ref25$rangeFalloff,
          _ref25$luminanceInflu = _ref25.luminanceInfluence,
          luminanceInfluence = _ref25$luminanceInflu === void 0 ? 0.7 : _ref25$luminanceInflu,
          _ref25$radius = _ref25.radius,
          radius = _ref25$radius === void 0 ? 18.25 : _ref25$radius,
          _ref25$scale = _ref25.scale,
          scale = _ref25$scale === void 0 ? 1.0 : _ref25$scale,
          _ref25$bias = _ref25.bias,
          bias = _ref25$bias === void 0 ? 0.0 : _ref25$bias;

      _classCallCheck(this, SSAOEffect);

      _this44 = _super50.call(this, "SSAOEffect", fragmentShader$y, {
        blendFunction: blendFunction,
        attributes: EffectAttribute.DEPTH,
        defines: new Map([["RINGS_INT", "0"], ["SAMPLES_INT", "0"], ["SAMPLES_FLOAT", "0.0"]]),
        uniforms: new Map([["normalBuffer", new three.Uniform(normalBuffer)], ["cameraInverseProjectionMatrix", new three.Uniform(new three.Matrix4())], ["cameraProjectionMatrix", new three.Uniform(new three.Matrix4())], ["radiusStep", new three.Uniform(new three.Vector2())], ["distanceCutoff", new three.Uniform(new three.Vector2())], ["proximityCutoff", new three.Uniform(new three.Vector2())], ["seed", new three.Uniform(Math.random())], ["luminanceInfluence", new three.Uniform(luminanceInfluence)], ["scale", new three.Uniform(scale)], ["bias", new three.Uniform(bias)]])
      });
      _this44.r = 0.0;
      _this44.resolution = new three.Vector2(1, 1);
      _this44.camera = camera;
      _this44.samples = samples;
      _this44.rings = rings;
      _this44.radius = radius;

      _this44.setDistanceCutoff(distanceThreshold, distanceFalloff);

      _this44.setProximityCutoff(rangeThreshold, rangeFalloff);

      return _this44;
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
        this.uniforms.get("distanceCutoff").value.set(Math.min(Math.max(threshold, 0.0), 1.0), Math.min(Math.max(threshold + falloff, 0.0), 1.0));
      }
    }, {
      key: "setProximityCutoff",
      value: function setProximityCutoff(threshold, falloff) {
        this.uniforms.get("proximityCutoff").value.set(Math.min(Math.max(threshold, 0.0), 1.0), Math.min(Math.max(threshold + falloff, 0.0), 1.0));
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
        return Number(this.defines.get("SAMPLES_INT"));
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
        return Number(this.defines.get("RINGS_INT"));
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

  var fragmentShader$z = "uniform sampler2D texture;\n#if defined(ASPECT_CORRECTION) || defined(UV_TRANSFORM)\nvarying vec2 vUv2;\n#endif\nvoid mainImage(const in vec4 inputColor,const in vec2 uv,out vec4 outputColor){\n#if defined(ASPECT_CORRECTION) || defined(UV_TRANSFORM)\noutputColor=texelToLinear(texture2D(texture,vUv2));\n#else\noutputColor=texelToLinear(texture2D(texture,uv));\n#endif\n}";
  var vertexShader$a = "#ifdef ASPECT_CORRECTION\nuniform float scale;\n#else\nuniform mat3 uvTransform;\n#endif\nvarying vec2 vUv2;void mainSupport(const in vec2 uv){\n#ifdef ASPECT_CORRECTION\nvUv2=uv*vec2(aspect,1.0)*scale;\n#else\nvUv2=(uvTransform*vec3(uv,1.0)).xy;\n#endif\n}";

  var TextureEffect = function (_Effect24) {
    _inherits(TextureEffect, _Effect24);

    var _super51 = _createSuper(TextureEffect);

    function TextureEffect() {
      var _this45;

      var _ref26 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          _ref26$blendFunction = _ref26.blendFunction,
          blendFunction = _ref26$blendFunction === void 0 ? BlendFunction.NORMAL : _ref26$blendFunction,
          _ref26$texture = _ref26.texture,
          texture = _ref26$texture === void 0 ? null : _ref26$texture,
          _ref26$aspectCorrecti = _ref26.aspectCorrection,
          aspectCorrection = _ref26$aspectCorrecti === void 0 ? false : _ref26$aspectCorrecti;

      _classCallCheck(this, TextureEffect);

      _this45 = _super51.call(this, "TextureEffect", fragmentShader$z, {
        blendFunction: blendFunction,
        uniforms: new Map([["texture", new three.Uniform(null)]])
      });
      _this45.texture = texture;
      _this45.aspectCorrection = aspectCorrection;
      return _this45;
    }

    _createClass(TextureEffect, [{
      key: "update",
      value: function update(renderer, inputBuffer, deltaTime) {
        var texture = this.uniforms.get("texture").value;

        if (this.uvTransform && texture.matrixAutoUpdate) {
          texture.updateMatrix();
          this.uniforms.get("uvTransform").value.copy(texture.matrix);
        }
      }
    }, {
      key: "texture",
      get: function get() {
        return this.uniforms.get("texture").value;
      },
      set: function set(value) {
        this.uniforms.get("texture").value = value;

        if (value !== null) {
          if (value.encoding === three.sRGBEncoding) {
            this.defines.set("texelToLinear(texel)", "sRGBToLinear(texel)");
          } else if (value.encoding === three.LinearEncoding) {
            this.defines.set("texelToLinear(texel)", "texel");
          } else {
            console.log("unsupported encoding: " + value.encoding);
          }
        }
      }
    }, {
      key: "aspectCorrection",
      get: function get() {
        return this.defines.has("ASPECT_CORRECTION");
      },
      set: function set(value) {
        if (value) {
          if (this.uvTransform) {
            this.uvTransform = false;
          }

          this.defines.set("ASPECT_CORRECTION", "1");
          this.uniforms.set("scale", new three.Uniform(1.0));
          this.vertexShader = vertexShader$a;
        } else {
          this.defines["delete"]("ASPECT_CORRECTION");
          this.uniforms["delete"]("scale");
          this.vertexShader = null;
        }
      }
    }, {
      key: "uvTransform",
      get: function get() {
        return this.defines.has("UV_TRANSFORM");
      },
      set: function set(value) {
        if (value) {
          if (this.aspectCorrection) {
            this.aspectCorrection = false;
          }

          this.defines.set("UV_TRANSFORM", "1");
          this.uniforms.set("uvTransform", new three.Uniform(new three.Matrix3()));
          this.vertexShader = vertexShader$a;
        } else {
          this.defines["delete"]("UV_TRANSFORM");
          this.uniforms["delete"]("uvTransform");
          this.vertexShader = null;
        }
      }
    }]);

    return TextureEffect;
  }(Effect);

  var fragmentShader$A = "uniform sampler2D luminanceMap;uniform float middleGrey;uniform float maxLuminance;uniform float averageLuminance;vec3 toneMap(vec3 c){\n#ifdef ADAPTED_LUMINANCE\nfloat lumAvg=texture2D(luminanceMap,vec2(0.5)).r;\n#else\nfloat lumAvg=averageLuminance;\n#endif\nfloat lumPixel=linearToRelativeLuminance(c);float lumScaled=(lumPixel*middleGrey)/lumAvg;float lumCompressed=(lumScaled*(1.0+(lumScaled/(maxLuminance*maxLuminance))))/(1.0+lumScaled);return lumCompressed*c;}void mainImage(const in vec4 inputColor,const in vec2 uv,out vec4 outputColor){outputColor=vec4(toneMap(inputColor.rgb),inputColor.a);}";

  var ToneMappingEffect = function (_Effect25) {
    _inherits(ToneMappingEffect, _Effect25);

    var _super52 = _createSuper(ToneMappingEffect);

    function ToneMappingEffect() {
      var _this46;

      var _ref27 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          _ref27$blendFunction = _ref27.blendFunction,
          blendFunction = _ref27$blendFunction === void 0 ? BlendFunction.NORMAL : _ref27$blendFunction,
          _ref27$adaptive = _ref27.adaptive,
          adaptive = _ref27$adaptive === void 0 ? true : _ref27$adaptive,
          _ref27$resolution = _ref27.resolution,
          resolution = _ref27$resolution === void 0 ? 256 : _ref27$resolution,
          _ref27$middleGrey = _ref27.middleGrey,
          middleGrey = _ref27$middleGrey === void 0 ? 0.6 : _ref27$middleGrey,
          _ref27$maxLuminance = _ref27.maxLuminance,
          maxLuminance = _ref27$maxLuminance === void 0 ? 16.0 : _ref27$maxLuminance,
          _ref27$averageLuminan = _ref27.averageLuminance,
          averageLuminance = _ref27$averageLuminan === void 0 ? 1.0 : _ref27$averageLuminan,
          _ref27$adaptationRate = _ref27.adaptationRate,
          adaptationRate = _ref27$adaptationRate === void 0 ? 2.0 : _ref27$adaptationRate;

      _classCallCheck(this, ToneMappingEffect);

      _this46 = _super52.call(this, "ToneMappingEffect", fragmentShader$A, {
        blendFunction: blendFunction,
        uniforms: new Map([["luminanceMap", new three.Uniform(null)], ["middleGrey", new three.Uniform(middleGrey)], ["maxLuminance", new three.Uniform(maxLuminance)], ["averageLuminance", new three.Uniform(averageLuminance)]])
      });
      _this46.renderTargetLuminance = new three.WebGLRenderTarget(1, 1, {
        minFilter: three.LinearMipmapLinearFilter !== undefined ? three.LinearMipmapLinearFilter : three.LinearMipMapLinearFilter,
        magFilter: three.LinearFilter,
        stencilBuffer: false,
        depthBuffer: false,
        format: three.RGBFormat
      });
      _this46.renderTargetLuminance.texture.name = "ToneMapping.Luminance";
      _this46.renderTargetLuminance.texture.generateMipmaps = true;
      _this46.renderTargetAdapted = _this46.renderTargetLuminance.clone();
      _this46.renderTargetAdapted.texture.name = "ToneMapping.AdaptedLuminance";
      _this46.renderTargetAdapted.texture.generateMipmaps = false;
      _this46.renderTargetAdapted.texture.minFilter = three.LinearFilter;
      _this46.renderTargetPrevious = _this46.renderTargetAdapted.clone();
      _this46.renderTargetPrevious.texture.name = "ToneMapping.PreviousLuminance";
      _this46.savePass = new SavePass(_this46.renderTargetPrevious, false);
      _this46.luminancePass = new ShaderPass(new LuminanceMaterial());

      var luminanceMaterial = _this46.luminancePass.getFullscreenMaterial();

      luminanceMaterial.useThreshold = false;
      _this46.adaptiveLuminancePass = new ShaderPass(new AdaptiveLuminanceMaterial());

      var uniforms = _this46.adaptiveLuminancePass.getFullscreenMaterial().uniforms;

      uniforms.previousLuminanceBuffer.value = _this46.renderTargetPrevious.texture;
      uniforms.currentLuminanceBuffer.value = _this46.renderTargetLuminance.texture;
      _this46.adaptationRate = adaptationRate;
      _this46.resolution = resolution;
      _this46.adaptive = adaptive;
      return _this46;
    }

    _createClass(ToneMappingEffect, [{
      key: "update",
      value: function update(renderer, inputBuffer, deltaTime) {
        if (this.adaptive) {
          this.luminancePass.render(renderer, inputBuffer, this.renderTargetLuminance);
          var uniforms = this.adaptiveLuminancePass.getFullscreenMaterial().uniforms;
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
      value: function initialize(renderer, alpha, frameBufferType) {
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

  var fragmentShader$B = "uniform float offset;uniform float darkness;void mainImage(const in vec4 inputColor,const in vec2 uv,out vec4 outputColor){const vec2 center=vec2(0.5);vec3 color=inputColor.rgb;\n#ifdef ESKIL\nvec2 coord=(uv-center)*vec2(offset);color=mix(color,vec3(1.0-darkness),dot(coord,coord));\n#else\nfloat d=distance(uv,center);color*=smoothstep(0.8,offset*0.799,d*(darkness+offset));\n#endif\noutputColor=vec4(color,inputColor.a);}";

  var VignetteEffect = function (_Effect26) {
    _inherits(VignetteEffect, _Effect26);

    var _super53 = _createSuper(VignetteEffect);

    function VignetteEffect() {
      var _this47;

      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      _classCallCheck(this, VignetteEffect);

      var settings = Object.assign({
        blendFunction: BlendFunction.NORMAL,
        eskil: false,
        offset: 0.5,
        darkness: 0.5
      }, options);
      _this47 = _super53.call(this, "VignetteEffect", fragmentShader$B, {
        blendFunction: settings.blendFunction,
        uniforms: new Map([["offset", new three.Uniform(settings.offset)], ["darkness", new three.Uniform(settings.darkness)]])
      });
      _this47.eskil = settings.eskil;
      return _this47;
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

  function createCanvas(width, height, data) {
    var canvas = document.createElementNS("http://www.w3.org/1999/xhtml", "canvas");
    var context = canvas.getContext("2d");
    var imageData = context.createImageData(width, height);
    imageData.data.set(data);
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

      _classCallCheck(this, RawImageData);

      this.width = width;
      this.height = height;
      this.data = data;
    }

    _createClass(RawImageData, [{
      key: "toCanvas",
      value: function toCanvas() {
        return typeof document === "undefined" ? null : createCanvas(this.width, this.height, this.data);
      }
    }], [{
      key: "from",
      value: function from(data) {
        return new RawImageData(data.width, data.height, data.data);
      }
    }]);

    return RawImageData;
  }();

  var workerProgram = "!function(){\"use strict\";function e(e,t){if(!(e instanceof t))throw new TypeError(\"Cannot call a class as a function\")}function t(e,t){for(var a=0;a<t.length;a++){var n=t[a];n.enumerable=n.enumerable||!1,n.configurable=!0,\"value\"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n)}}function a(e,a,n){return a&&t(e.prototype,a),n&&t(e,n),e}var n=function(){function t(){var a=arguments.length>0&&void 0!==arguments[0]?arguments[0]:0,n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:0,s=arguments.length>2&&void 0!==arguments[2]?arguments[2]:null;e(this,t),this.width=a,this.height=n,this.data=s}return a(t,[{key:\"toCanvas\",value:function(){return\"undefined\"==typeof document?null:(e=this.width,t=this.height,a=this.data,n=document.createElementNS(\"http://www.w3.org/1999/xhtml\",\"canvas\"),s=n.getContext(\"2d\"),(r=s.createImageData(e,t)).data.set(a),n.width=e,n.height=t,s.putImageData(r,0,0),n);var e,t,a,n,s,r}}],[{key:\"from\",value:function(e){return new t(e.width,e.height,e.data)}}]),t}(),s=function(){function t(){var a=arguments.length>0&&void 0!==arguments[0]?arguments[0]:0,n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:0;e(this,t),this.x=a,this.y=n}return a(t,[{key:\"set\",value:function(e,t){return this.x=e,this.y=t,this}},{key:\"equals\",value:function(e){return this===e||this.x===e.x&&this.y===e.y}}]),t}(),r=function t(){e(this,t),this.min=new s,this.max=new s},i=new r,y=new r,c=new Float32Array([0,-.25,.25,-.125,.125,-.375,.375]),u=[new Float32Array([0,0]),new Float32Array([.25,-.25]),new Float32Array([-.25,.25]),new Float32Array([.125,-.125]),new Float32Array([-.125,.125])],h=[new Uint8Array([0,0]),new Uint8Array([3,0]),new Uint8Array([0,3]),new Uint8Array([3,3]),new Uint8Array([1,0]),new Uint8Array([4,0]),new Uint8Array([1,3]),new Uint8Array([4,3]),new Uint8Array([0,1]),new Uint8Array([3,1]),new Uint8Array([0,4]),new Uint8Array([3,4]),new Uint8Array([1,1]),new Uint8Array([4,1]),new Uint8Array([1,4]),new Uint8Array([4,4])],o=[new Uint8Array([0,0]),new Uint8Array([1,0]),new Uint8Array([0,2]),new Uint8Array([1,2]),new Uint8Array([2,0]),new Uint8Array([3,0]),new Uint8Array([2,2]),new Uint8Array([3,2]),new Uint8Array([0,1]),new Uint8Array([1,1]),new Uint8Array([0,3]),new Uint8Array([1,3]),new Uint8Array([2,1]),new Uint8Array([3,1]),new Uint8Array([2,3]),new Uint8Array([3,3])];function w(e,t,a){return e+(t-e)*a}function x(e,t){var a,n=t.min,s=t.max,r=.5*Math.sqrt(2*n.x),i=.5*Math.sqrt(2*n.y),y=.5*Math.sqrt(2*s.x),c=.5*Math.sqrt(2*s.y),u=(a=e/32,Math.min(Math.max(a,0),1));return n.set(w(r,n.x,u),w(i,n.y,u)),s.set(w(y,s.x,u),w(c,s.y,u)),t}function f(e,t,a,n){var s,r,i,y,c=t.x-e.x,u=t.y-e.y,h=a,o=a+1,w=e.y+u*(h-e.x)/c,x=e.y+u*(o-e.x)/c;return h>=e.x&&h<t.x||o>e.x&&o<=t.x?Math.sign(w)===Math.sign(x)||Math.abs(w)<1e-4||Math.abs(x)<1e-4?(s=(w+x)/2)<0?n.set(Math.abs(s),0):n.set(0,Math.abs(s)):(r=(y=-e.y*c/u+e.x)>e.x?w*(y-Math.trunc(y))/2:0,i=y<t.x?x*(1-(y-Math.trunc(y)))/2:0,(s=Math.abs(r)>Math.abs(i)?r:-i)<0?n.set(Math.abs(r),Math.abs(i)):n.set(Math.abs(i),Math.abs(r))):n.set(0,0),n}function l(e,t,a,n,s){var r=i.min,c=i.max,u=y.min,h=y.max,o=y,w=.5+n,l=.5+n-1,b=t+a+1;switch(e){case 0:s.set(0,0);break;case 1:t<=a?f(r.set(0,l),c.set(b/2,0),t,s):s.set(0,0);break;case 2:t>=a?f(r.set(b/2,0),c.set(b,l),t,s):s.set(0,0);break;case 3:f(r.set(0,l),c.set(b/2,0),t,u),f(r.set(b/2,0),c.set(b,l),t,h),x(b,o),s.set(u.x+h.x,u.y+h.y);break;case 4:t<=a?f(r.set(0,w),c.set(b/2,0),t,s):s.set(0,0);break;case 5:s.set(0,0);break;case 6:Math.abs(n)>0?(f(r.set(0,w),c.set(b,l),t,u),f(r.set(0,w),c.set(b/2,0),t,h),f(r.set(b/2,0),c.set(b,l),t,s),h.set(h.x+s.x,h.y+s.y),s.set((u.x+h.x)/2,(u.y+h.y)/2)):f(r.set(0,w),c.set(b,l),t,s);break;case 7:f(r.set(0,w),c.set(b,l),t,s);break;case 8:t>=a?f(r.set(b/2,0),c.set(b,w),t,s):s.set(0,0);break;case 9:Math.abs(n)>0?(f(r.set(0,l),c.set(b,w),t,u),f(r.set(0,l),c.set(b/2,0),t,h),f(r.set(b/2,0),c.set(b,w),t,s),h.set(h.x+s.x,h.y+s.y),s.set((u.x+h.x)/2,(u.y+h.y)/2)):f(r.set(0,l),c.set(b,w),t,s);break;case 10:s.set(0,0);break;case 11:f(r.set(0,l),c.set(b,w),t,s);break;case 12:f(r.set(0,w),c.set(b/2,0),t,u),f(r.set(b/2,0),c.set(b,w),t,h),x(b,o),s.set(u.x+h.x,u.y+h.y);break;case 13:f(r.set(0,l),c.set(b,w),t,s);break;case 14:f(r.set(0,w),c.set(b,l),t,s);break;case 15:s.set(0,0)}return s}function b(e,t,a,n){var s=e.equals(t);if(!s){var r=(e.x+t.x)/2,i=(e.y+t.y)/2;s=(t.y-e.y)*(a-r)+(e.x-t.x)*(n-i)>0}return s}function A(e,t,a,n){var s,r,i;for(s=0,i=0;i<30;++i)for(r=0;r<30;++r)b(e,t,a+r/29,n+i/29)&&++s;return s/900}function v(e,t,a,n,s,r){var i=o[e],y=i[0],c=i[1];return y>0&&(t.x+=s[0],t.y+=s[1]),c>0&&(a.x+=s[0],a.y+=s[1]),r.set(1-A(t,a,1+n,0+n),A(t,a,1+n,1+n))}function k(e,t,a,n,s){var r=i.min,c=i.max,u=y.min,h=y.max,o=t+a+1;switch(e){case 0:v(e,r.set(1,1),c.set(1+o,1+o),t,n,u),v(e,r.set(1,0),c.set(1+o,0+o),t,n,h),s.set((u.x+h.x)/2,(u.y+h.y)/2);break;case 1:v(e,r.set(1,0),c.set(0+o,0+o),t,n,u),v(e,r.set(1,0),c.set(1+o,0+o),t,n,h),s.set((u.x+h.x)/2,(u.y+h.y)/2);break;case 2:v(e,r.set(0,0),c.set(1+o,0+o),t,n,u),v(e,r.set(1,0),c.set(1+o,0+o),t,n,h),s.set((u.x+h.x)/2,(u.y+h.y)/2);break;case 3:v(e,r.set(1,0),c.set(1+o,0+o),t,n,s);break;case 4:v(e,r.set(1,1),c.set(0+o,0+o),t,n,u),v(e,r.set(1,1),c.set(1+o,0+o),t,n,h),s.set((u.x+h.x)/2,(u.y+h.y)/2);break;case 5:v(e,r.set(1,1),c.set(0+o,0+o),t,n,u),v(e,r.set(1,0),c.set(1+o,0+o),t,n,h),s.set((u.x+h.x)/2,(u.y+h.y)/2);break;case 6:v(e,r.set(1,1),c.set(1+o,0+o),t,n,s);break;case 7:v(e,r.set(1,1),c.set(1+o,0+o),t,n,u),v(e,r.set(1,0),c.set(1+o,0+o),t,n,h),s.set((u.x+h.x)/2,(u.y+h.y)/2);break;case 8:v(e,r.set(0,0),c.set(1+o,1+o),t,n,u),v(e,r.set(1,0),c.set(1+o,1+o),t,n,h),s.set((u.x+h.x)/2,(u.y+h.y)/2);break;case 9:v(e,r.set(1,0),c.set(1+o,1+o),t,n,s);break;case 10:v(e,r.set(0,0),c.set(1+o,1+o),t,n,u),v(e,r.set(1,0),c.set(1+o,0+o),t,n,h),s.set((u.x+h.x)/2,(u.y+h.y)/2);break;case 11:v(e,r.set(1,0),c.set(1+o,1+o),t,n,u),v(e,r.set(1,0),c.set(1+o,0+o),t,n,h),s.set((u.x+h.x)/2,(u.y+h.y)/2);break;case 12:v(e,r.set(1,1),c.set(1+o,1+o),t,n,s);break;case 13:v(e,r.set(1,1),c.set(1+o,1+o),t,n,u),v(e,r.set(1,0),c.set(1+o,1+o),t,n,h),s.set((u.x+h.x)/2,(u.y+h.y)/2);break;case 14:v(e,r.set(1,1),c.set(1+o,1+o),t,n,u),v(e,r.set(1,1),c.set(1+o,0+o),t,n,h),s.set((u.x+h.x)/2,(u.y+h.y)/2);break;case 15:v(e,r.set(1,1),c.set(1+o,1+o),t,n,u),v(e,r.set(1,0),c.set(1+o,0+o),t,n,h),s.set((u.x+h.x)/2,(u.y+h.y)/2)}return s}function U(e,t,a){var n,r,i,y,c,u,h,o,w=new s;for(n=0,r=e.length;n<r;++n)for(h=(u=e[n]).data,o=u.width,y=0;y<o;++y)for(i=0;i<o;++i)a?l(n,i,y,t,w):k(n,i,y,t,w),h[c=2*(y*o+i)]=255*w.x,h[c+1]=255*w.y}function d(e,t,a,n,r,i){var y,c,u,h,o,w,x,f,l,b,A=new s,v=i.data,k=i.width;for(y=0,c=t.length;y<c;++y)for(x=a[y],l=(f=t[y]).data,b=f.width,h=0;h<n;++h)for(u=0;u<n;++u)A.set(x[0]*n+e.x+u,x[1]*n+e.y+h),w=r?2*(h*h*b+u*u):2*(h*b+u),v[o=4*(A.y*k+A.x)]=l[w],v[o+1]=l[w+1],v[o+2]=0,v[o+3]=255}var g=function(){function t(){e(this,t)}return a(t,null,[{key:\"generate\",value:function(){var e,t,a=5*c.length*16,r=new Uint8ClampedArray(160*a*4),i=new n(160,a,r),y=Math.pow(15,2)+1,w=[],x=[],f=new s;for(e=0;e<16;++e)w.push(new n(y,y,new Uint8ClampedArray(y*y*2),2)),x.push(new n(20,20,new Uint8ClampedArray(800),2));for(e=0,t=c.length;e<t;++e)U(w,c[e],!0),f.set(0,80*e),d(f,w,h,16,!0,i);for(e=0,t=u.length;e<t;++e)U(x,u[e],!1),f.set(80,80*e),d(f,x,o,20,!1,i);return i}}]),t}(),m=new Map([[p([0,0,0,0]),[0,0,0,0]],[p([0,0,0,1]),[0,0,0,1]],[p([0,0,1,0]),[0,0,1,0]],[p([0,0,1,1]),[0,0,1,1]],[p([0,1,0,0]),[0,1,0,0]],[p([0,1,0,1]),[0,1,0,1]],[p([0,1,1,0]),[0,1,1,0]],[p([0,1,1,1]),[0,1,1,1]],[p([1,0,0,0]),[1,0,0,0]],[p([1,0,0,1]),[1,0,0,1]],[p([1,0,1,0]),[1,0,1,0]],[p([1,0,1,1]),[1,0,1,1]],[p([1,1,0,0]),[1,1,0,0]],[p([1,1,0,1]),[1,1,0,1]],[p([1,1,1,0]),[1,1,1,0]],[p([1,1,1,1]),[1,1,1,1]]]);function M(e,t,a){return e+(t-e)*a}function p(e){var t=M(e[0],e[1],.75),a=M(e[2],e[3],.75);return M(t,a,.875)}function C(e,t){var a=0;return 1===t[3]&&1!==e[1]&&1!==e[3]&&(a+=1),1===a&&1===t[2]&&1!==e[0]&&1!==e[2]&&(a+=1),a}var q=function(){function t(){e(this,t)}return a(t,null,[{key:\"generate\",value:function(){var e,t,a,s,r,i,y,c,u,h,o=new Uint8ClampedArray(2178),w=new Uint8ClampedArray(4096);for(t=0;t<33;++t)for(e=0;e<66;++e)a=.03125*e,s=.03125*t,m.has(a)&&m.has(s)&&(i=m.get(a),y=m.get(s),o[r=66*t+e]=127*(c=i,h=void 0,h=0,1===(u=y)[3]&&(h+=1),1===h&&1===u[2]&&1!==c[1]&&1!==c[3]&&(h+=1),h),o[r+33]=127*C(i,y));for(r=0,t=17;t<33;++t)for(e=0;e<64;++e,r+=4)w[r]=o[66*t+e],w[r+3]=255;return new n(64,16,w)}}]),t}();self.addEventListener(\"message\",(function(e){var t=g.generate(),a=q.generate();postMessage({areaImageData:t,searchImageData:a},[t.data.buffer,a.data.buffer]),close()}))}();\n";

  function generate() {
    var disableCache = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
    var workerURL = URL.createObjectURL(new Blob([workerProgram], {
      type: "text/javascript"
    }));
    var worker = new Worker(workerURL);
    return new Promise(function (resolve, reject) {
      worker.addEventListener("error", function (event) {
        return reject(event.error);
      });
      worker.addEventListener("message", function (event) {
        var searchImageData = RawImageData.from(event.data.searchImageData);
        var areaImageData = RawImageData.from(event.data.areaImageData);
        var urls = [searchImageData.toCanvas().toDataURL(), areaImageData.toCanvas().toDataURL()];

        if (!disableCache && window.localStorage !== undefined) {
          localStorage.setItem("smaa-search", urls[0]);
          localStorage.setItem("smaa-area", urls[1]);
        }

        URL.revokeObjectURL(workerURL);
        resolve(urls);
      });
      worker.postMessage(null);
    });
  }

  var SMAAImageLoader = function (_Loader) {
    _inherits(SMAAImageLoader, _Loader);

    var _super54 = _createSuper(SMAAImageLoader);

    function SMAAImageLoader(manager) {
      var _this48;

      _classCallCheck(this, SMAAImageLoader);

      _this48 = _super54.call(this, manager);
      _this48.disableCache = false;
      return _this48;
    }

    _createClass(SMAAImageLoader, [{
      key: "load",
      value: function load() {
        var _this49 = this;

        var onLoad = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function () {};
        var onError = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function () {};

        if (arguments.length === 4) {
          onLoad = arguments[1];
          onError = arguments[3];
        } else if (arguments.length === 3 || typeof arguments[0] !== "function") {
          onLoad = arguments[1];

          onError = function onError() {};
        }

        var externalManager = this.manager;
        var internalManager = new three.LoadingManager();
        externalManager.itemStart("smaa-search");
        externalManager.itemStart("smaa-area");
        internalManager.itemStart("smaa-search");
        internalManager.itemStart("smaa-area");
        return new Promise(function (resolve, reject) {
          var cachedURLs = !_this49.disableCache && window.localStorage !== undefined ? [localStorage.getItem("smaa-search"), localStorage.getItem("smaa-area")] : [null, null];
          var promise = cachedURLs[0] !== null && cachedURLs[1] !== null ? Promise.resolve(cachedURLs) : generate(_this49.disableCache);
          promise.then(function (urls) {
            var result = [new Image(), new Image()];

            internalManager.onLoad = function () {
              onLoad(result);
              resolve(result);
            };

            result[0].addEventListener("load", function () {
              externalManager.itemEnd("smaa-search");
              internalManager.itemEnd("smaa-search");
            });
            result[1].addEventListener("load", function () {
              externalManager.itemEnd("smaa-area");
              internalManager.itemEnd("smaa-area");
            });
            result[0].src = urls[0];
            result[1].src = urls[1];
          })["catch"](function (error) {
            externalManager.itemError("smaa-search");
            externalManager.itemError("smaa-area");
            onError(error);
            reject(error);
          });
        });
      }
    }]);

    return SMAAImageLoader;
  }(three.Loader);

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
      key: "equals",
      value: function equals(v) {
        return this === v || this.x === v.x && this.y === v.y;
      }
    }]);

    return Vector2;
  }();

  var Box2 = function Box2() {
    _classCallCheck(this, Box2);

    this.min = new Vector2();
    this.max = new Vector2();
  };

  var b0 = new Box2();
  var b1 = new Box2();
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
    var a, a1, a2, t;

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
          result.set(a1.x + a2.x, a1.y + a2.y);
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
            calculateOrthogonalArea(p1.set(d / 2.0, 0.0), p2.set(d, o2), left, result);
            a2.set(a2.x + result.x, a2.y + result.y);
            result.set((a1.x + a2.x) / 2.0, (a1.y + a2.y) / 2.0);
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
            calculateOrthogonalArea(p1.set(d / 2.0, 0.0), p2.set(d, o1), left, result);
            a2.set(a2.x + result.x, a2.y + result.y);
            result.set((a1.x + a2.x) / 2.0, (a1.y + a2.y) / 2.0);
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
          result.set(a1.x + a2.x, a1.y + a2.y);
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

    if (!result) {
      var xm = (p1.x + p2.x) / 2.0;
      var ym = (p1.y + p2.y) / 2.0;
      var a = p2.y - p1.y;
      var b = p1.x - p2.x;
      var c = a * (x - xm) + b * (y - ym);
      result = c > 0.0;
    }

    return result;
  }

  function calculateDiagonalAreaForPixel(p1, p2, pX, pY) {
    var a;
    var x, y;
    var offsetX, offsetY;

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
          result.set((a1.x + a2.x) / 2.0, (a1.y + a2.y) / 2.0);
          break;
        }

      case 1:
        {
          calculateDiagonalArea(pattern, p1.set(1.0, 0.0), p2.set(0.0 + d, 0.0 + d), left, offset, a1);
          calculateDiagonalArea(pattern, p1.set(1.0, 0.0), p2.set(1.0 + d, 0.0 + d), left, offset, a2);
          result.set((a1.x + a2.x) / 2.0, (a1.y + a2.y) / 2.0);
          break;
        }

      case 2:
        {
          calculateDiagonalArea(pattern, p1.set(0.0, 0.0), p2.set(1.0 + d, 0.0 + d), left, offset, a1);
          calculateDiagonalArea(pattern, p1.set(1.0, 0.0), p2.set(1.0 + d, 0.0 + d), left, offset, a2);
          result.set((a1.x + a2.x) / 2.0, (a1.y + a2.y) / 2.0);
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
          result.set((a1.x + a2.x) / 2.0, (a1.y + a2.y) / 2.0);
          break;
        }

      case 5:
        {
          calculateDiagonalArea(pattern, p1.set(1.0, 1.0), p2.set(0.0 + d, 0.0 + d), left, offset, a1);
          calculateDiagonalArea(pattern, p1.set(1.0, 0.0), p2.set(1.0 + d, 0.0 + d), left, offset, a2);
          result.set((a1.x + a2.x) / 2.0, (a1.y + a2.y) / 2.0);
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
          result.set((a1.x + a2.x) / 2.0, (a1.y + a2.y) / 2.0);
          break;
        }

      case 8:
        {
          calculateDiagonalArea(pattern, p1.set(0.0, 0.0), p2.set(1.0 + d, 1.0 + d), left, offset, a1);
          calculateDiagonalArea(pattern, p1.set(1.0, 0.0), p2.set(1.0 + d, 1.0 + d), left, offset, a2);
          result.set((a1.x + a2.x) / 2.0, (a1.y + a2.y) / 2.0);
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
          result.set((a1.x + a2.x) / 2.0, (a1.y + a2.y) / 2.0);
          break;
        }

      case 11:
        {
          calculateDiagonalArea(pattern, p1.set(1.0, 0.0), p2.set(1.0 + d, 1.0 + d), left, offset, a1);
          calculateDiagonalArea(pattern, p1.set(1.0, 0.0), p2.set(1.0 + d, 0.0 + d), left, offset, a2);
          result.set((a1.x + a2.x) / 2.0, (a1.y + a2.y) / 2.0);
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
          result.set((a1.x + a2.x) / 2.0, (a1.y + a2.y) / 2.0);
          break;
        }

      case 14:
        {
          calculateDiagonalArea(pattern, p1.set(1.0, 1.0), p2.set(1.0 + d, 1.0 + d), left, offset, a1);
          calculateDiagonalArea(pattern, p1.set(1.0, 1.0), p2.set(1.0 + d, 0.0 + d), left, offset, a2);
          result.set((a1.x + a2.x) / 2.0, (a1.y + a2.y) / 2.0);
          break;
        }

      case 15:
        {
          calculateDiagonalArea(pattern, p1.set(1.0, 1.0), p2.set(1.0 + d, 1.0 + d), left, offset, a1);
          calculateDiagonalArea(pattern, p1.set(1.0, 0.0), p2.set(1.0 + d, 0.0 + d), left, offset, a2);
          result.set((a1.x + a2.x) / 2.0, (a1.y + a2.y) / 2.0);
          break;
        }
    }

    return result;
  }

  function generatePatterns(patterns, offset, orthogonal) {
    var result = new Vector2();
    var i, l;
    var x, y;
    var c;
    var pattern;
    var data, size;

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
    var p = new Vector2();
    var dstData = target.data;
    var dstWidth = target.width;
    var i, l;
    var x, y;
    var c, d;
    var edge;
    var pattern;
    var srcData, srcWidth;

    for (i = 0, l = patterns.length; i < l; ++i) {
      edge = edges[i];
      pattern = patterns[i];
      srcData = pattern.data;
      srcWidth = pattern.width;

      for (y = 0; y < size; ++y) {
        for (x = 0; x < size; ++x) {
          p.set(edge[0] * size + base.x + x, edge[1] * size + base.y + y);
          c = (p.y * dstWidth + p.x) * 4;
          d = orthogonal ? (y * y * srcWidth + x * x) * 2 : (y * srcWidth + x) * 2;
          dstData[c] = srcData[d];
          dstData[c + 1] = srcData[d + 1];
          dstData[c + 2] = 0;
          dstData[c + 3] = 255;
        }
      }
    }
  }

  var SMAAAreaImageData = function () {
    function SMAAAreaImageData() {
      _classCallCheck(this, SMAAAreaImageData);
    }

    _createClass(SMAAAreaImageData, null, [{
      key: "generate",
      value: function generate() {
        var width = 2 * 5 * ORTHOGONAL_SIZE;
        var height = orthogonalSubsamplingOffsets.length * 5 * ORTHOGONAL_SIZE;
        var data = new Uint8ClampedArray(width * height * 4);
        var result = new RawImageData(width, height, data);
        var orthogonalPatternSize = Math.pow(ORTHOGONAL_SIZE - 1, 2) + 1;
        var diagonalPatternSize = DIAGONAL_SIZE;
        var orthogonalPatterns = [];
        var diagonalPatterns = [];
        var base = new Vector2();
        var i, l;

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
      _classCallCheck(this, SMAASearchImageData);
    }

    _createClass(SMAASearchImageData, null, [{
      key: "generate",
      value: function generate() {
        var width = 66;
        var height = 33;
        var halfWidth = width / 2;
        var croppedWidth = 64;
        var croppedHeight = 16;
        var data = new Uint8ClampedArray(width * height);
        var croppedData = new Uint8ClampedArray(croppedWidth * croppedHeight * 4);
        var x, y;
        var s, t, i;
        var e1, e2;

        for (y = 0; y < height; ++y) {
          for (x = 0; x < width; ++x) {
            s = 0.03125 * x;
            t = 0.03125 * y;

            if (edges.has(s) && edges.has(t)) {
              e1 = edges.get(s);
              e2 = edges.get(t);
              i = y * width + x;
              data[i] = 127 * deltaLeft(e1, e2);
              data[i + halfWidth] = 127 * deltaRight(e1, e2);
            }
          }
        }

        for (i = 0, y = height - croppedHeight; y < height; ++y) {
          for (x = 0; x < croppedWidth; ++x, i += 4) {
            croppedData[i] = data[y * width + x];
            croppedData[i + 3] = 255;
          }
        }

        return new RawImageData(croppedWidth, croppedHeight, croppedData);
      }
    }]);

    return SMAASearchImageData;
  }();

  exports.AdaptiveLuminanceMaterial = AdaptiveLuminanceMaterial;
  exports.BlendFunction = BlendFunction;
  exports.BlendMode = BlendMode;
  exports.BloomEffect = BloomEffect;
  exports.BlurPass = BlurPass;
  exports.BokehEffect = BokehEffect;
  exports.BokehMaterial = BokehMaterial;
  exports.BrightnessContrastEffect = BrightnessContrastEffect;
  exports.ChromaticAberrationEffect = ChromaticAberrationEffect;
  exports.CircleOfConfusionMaterial = CircleOfConfusionMaterial;
  exports.ClearMaskPass = ClearMaskPass;
  exports.ClearPass = ClearPass;
  exports.ColorAverageEffect = ColorAverageEffect;
  exports.ColorChannel = ColorChannel;
  exports.ColorDepthEffect = ColorDepthEffect;
  exports.ColorEdgesMaterial = ColorEdgesMaterial;
  exports.ConvolutionMaterial = ConvolutionMaterial;
  exports.CopyMaterial = CopyMaterial;
  exports.DepthComparisonMaterial = DepthComparisonMaterial;
  exports.DepthEffect = DepthEffect;
  exports.DepthMaskMaterial = DepthMaskMaterial;
  exports.DepthOfFieldEffect = DepthOfFieldEffect;
  exports.DepthPass = DepthPass;
  exports.Disposable = Disposable;
  exports.DotScreenEffect = DotScreenEffect;
  exports.EdgeDetectionMaterial = EdgeDetectionMaterial;
  exports.EdgeDetectionMode = EdgeDetectionMode;
  exports.Effect = Effect;
  exports.EffectAttribute = EffectAttribute;
  exports.EffectComposer = EffectComposer;
  exports.EffectMaterial = EffectMaterial;
  exports.EffectPass = EffectPass;
  exports.GammaCorrectionEffect = GammaCorrectionEffect;
  exports.GlitchEffect = GlitchEffect;
  exports.GlitchMode = GlitchMode;
  exports.GodRaysEffect = GodRaysEffect;
  exports.GodRaysMaterial = GodRaysMaterial;
  exports.GridEffect = GridEffect;
  exports.HueSaturationEffect = HueSaturationEffect;
  exports.Initializable = Initializable;
  exports.KernelSize = KernelSize;
  exports.LuminanceMaterial = LuminanceMaterial;
  exports.MaskFunction = MaskFunction;
  exports.MaskMaterial = MaskMaterial;
  exports.MaskPass = MaskPass;
  exports.NoiseEffect = NoiseEffect;
  exports.NormalPass = NormalPass;
  exports.OutlineEdgesMaterial = OutlineEdgesMaterial;
  exports.OutlineEffect = OutlineEffect;
  exports.OutlineMaterial = OutlineMaterial;
  exports.Pass = Pass;
  exports.PixelationEffect = PixelationEffect;
  exports.RawImageData = RawImageData;
  exports.RealisticBokehEffect = RealisticBokehEffect;
  exports.RenderPass = RenderPass;
  exports.Resizable = Resizable;
  exports.Resizer = Resizer;
  exports.SMAAAreaImageData = SMAAAreaImageData;
  exports.SMAAEffect = SMAAEffect;
  exports.SMAAImageLoader = SMAAImageLoader;
  exports.SMAAPreset = SMAAPreset;
  exports.SMAASearchImageData = SMAASearchImageData;
  exports.SMAAWeightsMaterial = SMAAWeightsMaterial;
  exports.SSAOEffect = SSAOEffect;
  exports.SavePass = SavePass;
  exports.ScanlineEffect = ScanlineEffect;
  exports.Section = Section;
  exports.Selection = Selection;
  exports.SelectiveBloomEffect = SelectiveBloomEffect;
  exports.SepiaEffect = SepiaEffect;
  exports.ShaderPass = ShaderPass;
  exports.ShockWaveEffect = ShockWaveEffect;
  exports.TextureEffect = TextureEffect;
  exports.ToneMappingEffect = ToneMappingEffect;
  exports.VignetteEffect = VignetteEffect;
  exports.WebGLExtension = WebGLExtension;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
