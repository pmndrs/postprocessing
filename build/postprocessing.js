/**
 * postprocessing v6.17.0 build Thu Aug 20 2020
 * https://github.com/vanruesc/postprocessing
 * Copyright 2020 Raoul van Rüschen
 * @license Zlib
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('three')) :
	typeof define === 'function' && define.amd ? define(['exports', 'three'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.POSTPROCESSING = {}, global.THREE));
}(this, (function (exports, three) { 'use strict';

	/**
	 * A color channel enumeration.
	 *
	 * @type {Object}
	 * @property {Number} RED - Red.
	 * @property {Number} GREEN - Green.
	 * @property {Number} BLUE - Blue.
	 * @property {Number} ALPHA - Alpha.
	 */

	var ColorChannel = {

		RED: 0,
		GREEN: 1,
		BLUE: 2,
		ALPHA: 3

	};

	/**
	 * The Disposable contract.
	 *
	 * Implemented by objects that can free internal resources.
	 *
	 * @interface
	 */

	var Disposable = function Disposable () {};

	Disposable.prototype.dispose = function dispose () {};

	var fragmentShader = "uniform sampler2D previousLuminanceBuffer;uniform sampler2D currentLuminanceBuffer;uniform float minLuminance;uniform float deltaTime;uniform float tau;varying vec2 vUv;void main(){float previousLuminance=texture2D(previousLuminanceBuffer,vUv,MIP_LEVEL_1X1).r;float currentLuminance=texture2D(currentLuminanceBuffer,vUv,MIP_LEVEL_1X1).r;previousLuminance=max(minLuminance,previousLuminance);currentLuminance=max(minLuminance,currentLuminance);float adaptedLum=previousLuminance+(currentLuminance-previousLuminance)*(1.0-exp(-deltaTime*tau));gl_FragColor.r=adaptedLum;}";

	var vertexShader = "varying vec2 vUv;void main(){vUv=position.xy*0.5+0.5;gl_Position=vec4(position.xy,1.0,1.0);}";

	/**
	 * An adaptive luminance shader material.
	 */

	var AdaptiveLuminanceMaterial = /*@__PURE__*/(function (ShaderMaterial) {
		function AdaptiveLuminanceMaterial() {

			ShaderMaterial.call(this, {

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

			/** @ignore */
			this.toneMapped = false;

		}

		if ( ShaderMaterial ) AdaptiveLuminanceMaterial.__proto__ = ShaderMaterial;
		AdaptiveLuminanceMaterial.prototype = Object.create( ShaderMaterial && ShaderMaterial.prototype );
		AdaptiveLuminanceMaterial.prototype.constructor = AdaptiveLuminanceMaterial;

		return AdaptiveLuminanceMaterial;
	}(three.ShaderMaterial));

	var fragmentShader$1 = "uniform sampler2D inputBuffer;uniform sampler2D cocBuffer;uniform vec2 texelSize;uniform float scale;\n#if PASS == 1\nuniform vec4 kernel64[32];\n#else\nuniform vec4 kernel16[8];\n#endif\nvarying vec2 vUv;void main(){\n#ifdef FOREGROUND\nvec2 CoCNearFar=texture2D(cocBuffer,vUv).rg;float CoC=CoCNearFar.r*scale;\n#else\nfloat CoC=texture2D(cocBuffer,vUv).g*scale;\n#endif\nif(CoC==0.0){gl_FragColor=texture2D(inputBuffer,vUv);}else{\n#ifdef FOREGROUND\nvec2 step=texelSize*max(CoC,CoCNearFar.g*scale);\n#else\nvec2 step=texelSize*CoC;\n#endif\n#if PASS == 1\nvec4 acc=vec4(0.0);for(int i=0;i<32;++i){vec4 kernel=kernel64[i];vec2 uv=step*kernel.xy+vUv;acc+=texture2D(inputBuffer,uv);uv=step*kernel.zw+vUv;acc+=texture2D(inputBuffer,uv);}gl_FragColor=acc/64.0;\n#else\nvec4 maxValue=texture2D(inputBuffer,vUv);for(int i=0;i<8;++i){vec4 kernel=kernel16[i];vec2 uv=step*kernel.xy+vUv;maxValue=max(texture2D(inputBuffer,uv),maxValue);uv=step*kernel.zw+vUv;maxValue=max(texture2D(inputBuffer,uv),maxValue);}gl_FragColor=maxValue;\n#endif\n}}";

	/**
	 * A bokeh blur material.
	 *
	 * This material should be applied twice in a row, with `fill` mode enabled for
	 * the second pass.
	 *
	 * Enabling the `foreground` option causes the shader to combine the near and
	 * far CoC values around foreground objects.
	 */

	var BokehMaterial = /*@__PURE__*/(function (ShaderMaterial) {
		function BokehMaterial(fill, foreground) {
			if ( fill === void 0 ) fill = false;
			if ( foreground === void 0 ) foreground = false;


			ShaderMaterial.call(this, {

				type: "BokehMaterial",

				defines: {
					PASS: fill ? "2" : "1"
				},

				uniforms: {
					kernel64: new three.Uniform(null),
					kernel16: new three.Uniform(null),
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

			/** @ignore */
			this.toneMapped = false;

			if(foreground) {

				this.defines.FOREGROUND = "1";

			}

			this.generateKernel();

		}

		if ( ShaderMaterial ) BokehMaterial.__proto__ = ShaderMaterial;
		BokehMaterial.prototype = Object.create( ShaderMaterial && ShaderMaterial.prototype );
		BokehMaterial.prototype.constructor = BokehMaterial;

		/**
		 * Generates the blur kernels.
		 *
		 * @private
		 */

		BokehMaterial.prototype.generateKernel = function generateKernel () {

			var GOLDEN_ANGLE = 2.39996323;
			var points64 = new Float32Array(128);
			var points16 = new Float32Array(32);

			var i64 = 0, i16 = 0;

			for(var i = 0; i < 80; ++i) {

				var theta = i * GOLDEN_ANGLE;
				var r = Math.sqrt(i) / Math.sqrt(80);
				var u = r * Math.cos(theta), v = r * Math.sin(theta);

				if(i % 5 === 0) {

					points16[i16++] = u;
					points16[i16++] = v;

				} else {

					points64[i64++] = u;
					points64[i64++] = v;

				}

			}

			// Pack points into vec4 instances to reduce the uniform count.
			var kernel64 = [];
			var kernel16 = [];

			for(var i$1 = 0; i$1 < 128;) {

				kernel64.push(new three.Vector4(
					points64[i$1++], points64[i$1++],
					points64[i$1++], points64[i$1++]
				));

			}

			for(var i$2 = 0; i$2 < 32;) {

				kernel16.push(new three.Vector4(
					points16[i$2++], points16[i$2++],
					points16[i$2++], points16[i$2++]
				));

			}

			this.uniforms.kernel64.value = kernel64;
			this.uniforms.kernel16.value = kernel16;

		};

		/**
		 * Sets the texel size.
		 *
		 * @param {Number} x - The texel width.
		 * @param {Number} y - The texel height.
		 */

		BokehMaterial.prototype.setTexelSize = function setTexelSize (x, y) {

			this.uniforms.texelSize.value.set(x, y);

		};

		return BokehMaterial;
	}(three.ShaderMaterial));

	var fragmentShader$2 = "#include <common>\n#include <packing>\n#ifdef GL_FRAGMENT_PRECISION_HIGH\nuniform highp sampler2D depthBuffer;\n#else\nuniform mediump sampler2D depthBuffer;\n#endif\nuniform float focusDistance;uniform float focalLength;uniform float cameraNear;uniform float cameraFar;varying vec2 vUv;float readDepth(const in vec2 uv){\n#if DEPTH_PACKING == 3201\nreturn unpackRGBAToDepth(texture2D(depthBuffer,uv));\n#else\nreturn texture2D(depthBuffer,uv).r;\n#endif\n}void main(){float depth=readDepth(vUv);\n#ifdef PERSPECTIVE_CAMERA\nfloat viewZ=perspectiveDepthToViewZ(depth,cameraNear,cameraFar);float linearDepth=viewZToOrthographicDepth(viewZ,cameraNear,cameraFar);\n#else\nfloat linearDepth=depth;\n#endif\nfloat signedDistance=linearDepth-focusDistance;float magnitude=smoothstep(0.0,focalLength,abs(signedDistance));gl_FragColor.rg=vec2(step(signedDistance,0.0)*magnitude,step(0.0,signedDistance)*magnitude);}";

	/**
	 * A CoC shader material.
	 */

	var CircleOfConfusionMaterial = /*@__PURE__*/(function (ShaderMaterial) {
		function CircleOfConfusionMaterial(camera) {

			ShaderMaterial.call(this, {

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

			/** @ignore */
			this.toneMapped = false;

			this.adoptCameraSettings(camera);

		}

		if ( ShaderMaterial ) CircleOfConfusionMaterial.__proto__ = ShaderMaterial;
		CircleOfConfusionMaterial.prototype = Object.create( ShaderMaterial && ShaderMaterial.prototype );
		CircleOfConfusionMaterial.prototype.constructor = CircleOfConfusionMaterial;

		var prototypeAccessors = { depthPacking: { configurable: true } };

		/**
		 * The current depth packing.
		 *
		 * @type {Number}
		 */

		prototypeAccessors.depthPacking.get = function () {

			return Number(this.defines.DEPTH_PACKING);

		};

		/**
		 * Sets the depth packing.
		 *
		 * @type {Number}
		 */

		prototypeAccessors.depthPacking.set = function (value) {

			this.defines.DEPTH_PACKING = value.toFixed(0);
			this.needsUpdate = true;

		};

		/**
		 * Adopts the settings of the given camera.
		 *
		 * @param {Camera} [camera=null] - A camera.
		 */

		CircleOfConfusionMaterial.prototype.adoptCameraSettings = function adoptCameraSettings (camera) {
			if ( camera === void 0 ) camera = null;


			if(camera !== null) {

				this.uniforms.cameraNear.value = camera.near;
				this.uniforms.cameraFar.value = camera.far;

				if(camera instanceof three.PerspectiveCamera) {

					this.defines.PERSPECTIVE_CAMERA = "1";

				} else {

					delete this.defines.PERSPECTIVE_CAMERA;

				}

				this.needsUpdate = true;

			}

		};

		Object.defineProperties( CircleOfConfusionMaterial.prototype, prototypeAccessors );

		return CircleOfConfusionMaterial;
	}(three.ShaderMaterial));

	var fragmentShaderColor = "uniform sampler2D inputBuffer;varying vec2 vUv;varying vec2 vUv0;varying vec2 vUv1;varying vec2 vUv2;varying vec2 vUv3;varying vec2 vUv4;varying vec2 vUv5;void main(){const vec2 threshold=vec2(EDGE_THRESHOLD);vec4 delta;vec3 c=texture2D(inputBuffer,vUv).rgb;vec3 cLeft=texture2D(inputBuffer,vUv0).rgb;vec3 t=abs(c-cLeft);delta.x=max(max(t.r,t.g),t.b);vec3 cTop=texture2D(inputBuffer,vUv1).rgb;t=abs(c-cTop);delta.y=max(max(t.r,t.g),t.b);vec2 edges=step(threshold,delta.xy);if(dot(edges,vec2(1.0))==0.0){discard;}vec3 cRight=texture2D(inputBuffer,vUv2).rgb;t=abs(c-cRight);delta.z=max(max(t.r,t.g),t.b);vec3 cBottom=texture2D(inputBuffer,vUv3).rgb;t=abs(c-cBottom);delta.w=max(max(t.r,t.g),t.b);vec2 maxDelta=max(delta.xy,delta.zw);vec3 cLeftLeft=texture2D(inputBuffer,vUv4).rgb;t=abs(c-cLeftLeft);delta.z=max(max(t.r,t.g),t.b);vec3 cTopTop=texture2D(inputBuffer,vUv5).rgb;t=abs(c-cTopTop);delta.w=max(max(t.r,t.g),t.b);maxDelta=max(maxDelta.xy,delta.zw);float finalDelta=max(maxDelta.x,maxDelta.y);edges*=step(finalDelta,LOCAL_CONTRAST_ADAPTATION_FACTOR*delta.xy);gl_FragColor=vec4(edges,0.0,1.0);}";

	var vertexShader$1 = "uniform vec2 texelSize;varying vec2 vUv;varying vec2 vUv0;varying vec2 vUv1;\n#if EDGE_DETECTION_MODE != 0\nvarying vec2 vUv2;varying vec2 vUv3;varying vec2 vUv4;varying vec2 vUv5;\n#endif\nvoid main(){vUv=position.xy*0.5+0.5;vUv0=vUv+texelSize*vec2(-1.0,0.0);vUv1=vUv+texelSize*vec2(0.0,-1.0);\n#if EDGE_DETECTION_MODE != 0\nvUv2=vUv+texelSize*vec2(1.0,0.0);vUv3=vUv+texelSize*vec2(0.0,1.0);vUv4=vUv+texelSize*vec2(-2.0,0.0);vUv5=vUv+texelSize*vec2(0.0,-2.0);\n#endif\ngl_Position=vec4(position.xy,1.0,1.0);}";

	/**
	 * A material that detects edges in a color texture.
	 *
	 * @deprecated Use EdgeDetectionMaterial instead.
	 */

	var ColorEdgesMaterial = /*@__PURE__*/(function (ShaderMaterial) {
		function ColorEdgesMaterial(texelSize) {
			if ( texelSize === void 0 ) texelSize = new three.Vector2();


			ShaderMaterial.call(this, {

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

			/** @ignore */
			this.toneMapped = false;

		}

		if ( ShaderMaterial ) ColorEdgesMaterial.__proto__ = ShaderMaterial;
		ColorEdgesMaterial.prototype = Object.create( ShaderMaterial && ShaderMaterial.prototype );
		ColorEdgesMaterial.prototype.constructor = ColorEdgesMaterial;

		/**
		 * Sets the local contrast adaptation factor.
		 *
		 * If there is a neighbor edge that has _factor_ times bigger contrast than
		 * the current edge, the edge will be discarded.
		 *
		 * This allows to eliminate spurious crossing edges and is based on the fact
		 * that if there is too much contrast in a direction, the perceptual contrast
		 * in the other neighbors will be hidden.
		 *
		 * @param {Number} factor - The local contrast adaptation factor. Default is 2.0.
		 */

		ColorEdgesMaterial.prototype.setLocalContrastAdaptationFactor = function setLocalContrastAdaptationFactor (factor) {

			this.defines.LOCAL_CONTRAST_ADAPTATION_FACTOR = factor.toFixed("2");
			this.needsUpdate = true;

		};

		/**
		 * Sets the edge detection sensitivity.
		 *
		 * A lower value results in more edges being detected at the expense of
		 * performance.
		 *
		 * 0.1 is a reasonable value, and allows to catch most visible edges.
		 * 0.05 is a rather overkill value, that allows to catch 'em all.
		 *
		 * If temporal supersampling is used, 0.2 could be a reasonable value, as low
		 * contrast edges are properly filtered by just 2x.
		 *
		 * @param {Number} threshold - The edge detection sensitivity. Range: [0.05, 0.5].
		 */

		ColorEdgesMaterial.prototype.setEdgeDetectionThreshold = function setEdgeDetectionThreshold (threshold) {

			var t = Math.min(Math.max(threshold, 0.05), 0.5);
			this.defines.EDGE_THRESHOLD = t.toFixed("2");
			this.needsUpdate = true;

		};

		return ColorEdgesMaterial;
	}(three.ShaderMaterial));

	var fragmentShader$3 = "#include <common>\n#include <dithering_pars_fragment>\nuniform sampler2D inputBuffer;varying vec2 vUv0;varying vec2 vUv1;varying vec2 vUv2;varying vec2 vUv3;void main(){vec4 sum=texture2D(inputBuffer,vUv0);sum+=texture2D(inputBuffer,vUv1);sum+=texture2D(inputBuffer,vUv2);sum+=texture2D(inputBuffer,vUv3);gl_FragColor=sum*0.25;\n#include <dithering_fragment>\n}";

	var vertexShader$2 = "uniform vec2 texelSize;uniform vec2 halfTexelSize;uniform float kernel;uniform float scale;/*Packing multiple texture coordinates into one varying and using a swizzle toextract them in the fragment shader still causes a dependent texture read.*/varying vec2 vUv0;varying vec2 vUv1;varying vec2 vUv2;varying vec2 vUv3;void main(){vec2 uv=position.xy*0.5+0.5;vec2 dUv=(texelSize*vec2(kernel)+halfTexelSize)*scale;vUv0=vec2(uv.x-dUv.x,uv.y+dUv.y);vUv1=vec2(uv.x+dUv.x,uv.y+dUv.y);vUv2=vec2(uv.x+dUv.x,uv.y-dUv.y);vUv3=vec2(uv.x-dUv.x,uv.y-dUv.y);gl_Position=vec4(position.xy,1.0,1.0);}";

	/**
	 * An optimised convolution shader material.
	 *
	 * This material supports dithering.
	 *
	 * Based on the GDC2003 Presentation by Masaki Kawase, Bunkasha Games:
	 *  Frame Buffer Postprocessing Effects in DOUBLE-S.T.E.A.L (Wreckless)
	 * and an article by Filip Strugar, Intel:
	 *  An investigation of fast real-time GPU-based image blur algorithms
	 *
	 * Further modified according to Apple's
	 * [Best Practices for Shaders](https://goo.gl/lmRoM5).
	 *
	 * @todo Remove dithering code from fragment shader.
	 */

	var ConvolutionMaterial = /*@__PURE__*/(function (ShaderMaterial) {
		function ConvolutionMaterial(texelSize) {
			if ( texelSize === void 0 ) texelSize = new three.Vector2();


			ShaderMaterial.call(this, {

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

			/** @ignore */
			this.toneMapped = false;

			this.setTexelSize(texelSize.x, texelSize.y);

			/**
			 * The current kernel size.
			 *
			 * @type {KernelSize}
			 */

			this.kernelSize = KernelSize.LARGE;

		}

		if ( ShaderMaterial ) ConvolutionMaterial.__proto__ = ShaderMaterial;
		ConvolutionMaterial.prototype = Object.create( ShaderMaterial && ShaderMaterial.prototype );
		ConvolutionMaterial.prototype.constructor = ConvolutionMaterial;

		/**
		 * Returns the kernel.
		 *
		 * @return {Float32Array} The kernel.
		 */

		ConvolutionMaterial.prototype.getKernel = function getKernel () {

			return kernelPresets[this.kernelSize];

		};

		/**
		 * Sets the texel size.
		 *
		 * @param {Number} x - The texel width.
		 * @param {Number} y - The texel height.
		 */

		ConvolutionMaterial.prototype.setTexelSize = function setTexelSize (x, y) {

			this.uniforms.texelSize.value.set(x, y);
			this.uniforms.halfTexelSize.value.set(x, y).multiplyScalar(0.5);

		};

		return ConvolutionMaterial;
	}(three.ShaderMaterial));

	/**
	 * The Kawase blur kernel presets.
	 *
	 * @type {Float32Array[]}
	 * @private
	 */

	var kernelPresets = [
		new Float32Array([0.0, 0.0]),
		new Float32Array([0.0, 1.0, 1.0]),
		new Float32Array([0.0, 1.0, 1.0, 2.0]),
		new Float32Array([0.0, 1.0, 2.0, 2.0, 3.0]),
		new Float32Array([0.0, 1.0, 2.0, 3.0, 4.0, 4.0, 5.0]),
		new Float32Array([0.0, 1.0, 2.0, 3.0, 4.0, 5.0, 7.0, 8.0, 9.0, 10.0])
	];

	/**
	 * A kernel size enumeration.
	 *
	 * @type {Object}
	 * @property {Number} VERY_SMALL - A very small kernel that matches a 7x7 Gauss blur kernel.
	 * @property {Number} SMALL - A small kernel that matches a 15x15 Gauss blur kernel.
	 * @property {Number} MEDIUM - A medium sized kernel that matches a 23x23 Gauss blur kernel.
	 * @property {Number} LARGE - A large kernel that matches a 35x35 Gauss blur kernel.
	 * @property {Number} VERY_LARGE - A very large kernel that matches a 63x63 Gauss blur kernel.
	 * @property {Number} HUGE - A huge kernel that matches a 127x127 Gauss blur kernel.
	 */

	var KernelSize = {

		VERY_SMALL: 0,
		SMALL: 1,
		MEDIUM: 2,
		LARGE: 3,
		VERY_LARGE: 4,
		HUGE: 5

	};

	var fragmentShader$4 = "uniform sampler2D inputBuffer;uniform float opacity;varying vec2 vUv;void main(){vec4 texel=texture2D(inputBuffer,vUv);gl_FragColor=opacity*texel;\n#include <encodings_fragment>\n}";

	/**
	 * A simple copy shader material.
	 */

	var CopyMaterial = /*@__PURE__*/(function (ShaderMaterial) {
		function CopyMaterial() {

			ShaderMaterial.call(this, {

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

			/** @ignore */
			this.toneMapped = false;

		}

		if ( ShaderMaterial ) CopyMaterial.__proto__ = ShaderMaterial;
		CopyMaterial.prototype = Object.create( ShaderMaterial && ShaderMaterial.prototype );
		CopyMaterial.prototype.constructor = CopyMaterial;

		return CopyMaterial;
	}(three.ShaderMaterial));

	var fragmentShader$5 = "#include <packing>\n#include <clipping_planes_pars_fragment>\n#ifdef GL_FRAGMENT_PRECISION_HIGH\nuniform highp sampler2D depthBuffer;\n#else\nuniform mediump sampler2D depthBuffer;\n#endif\nuniform float cameraNear;uniform float cameraFar;varying float vViewZ;varying vec4 vProjTexCoord;void main(){\n#include <clipping_planes_fragment>\nvec2 projTexCoord=(vProjTexCoord.xy/vProjTexCoord.w)*0.5+0.5;projTexCoord=clamp(projTexCoord,0.002,0.998);float fragCoordZ=unpackRGBAToDepth(texture2D(depthBuffer,projTexCoord));\n#ifdef PERSPECTIVE_CAMERA\nfloat viewZ=perspectiveDepthToViewZ(fragCoordZ,cameraNear,cameraFar);\n#else\nfloat viewZ=orthographicDepthToViewZ(fragCoordZ,cameraNear,cameraFar);\n#endif\nfloat depthTest=(-vViewZ>-viewZ)? 1.0 : 0.0;gl_FragColor.rg=vec2(0.0,depthTest);}";

	var vertexShader$3 = "#include <common>\n#include <morphtarget_pars_vertex>\n#include <skinning_pars_vertex>\n#include <clipping_planes_pars_vertex>\nvarying float vViewZ;varying vec4 vProjTexCoord;void main(){\n#include <skinbase_vertex>\n#include <begin_vertex>\n#include <morphtarget_vertex>\n#include <skinning_vertex>\n#include <project_vertex>\nvViewZ=mvPosition.z;vProjTexCoord=gl_Position;\n#include <clipping_planes_vertex>\n}";

	/**
	 * A depth comparison shader material.
	 */

	var DepthComparisonMaterial = /*@__PURE__*/(function (ShaderMaterial) {
		function DepthComparisonMaterial(depthTexture, camera) {
			if ( depthTexture === void 0 ) depthTexture = null;


			ShaderMaterial.call(this, {

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

			/** @ignore */
			this.toneMapped = false;

			this.adoptCameraSettings(camera);

		}

		if ( ShaderMaterial ) DepthComparisonMaterial.__proto__ = ShaderMaterial;
		DepthComparisonMaterial.prototype = Object.create( ShaderMaterial && ShaderMaterial.prototype );
		DepthComparisonMaterial.prototype.constructor = DepthComparisonMaterial;

		/**
		 * Adopts the settings of the given camera.
		 *
		 * @param {Camera} [camera=null] - A camera.
		 */

		DepthComparisonMaterial.prototype.adoptCameraSettings = function adoptCameraSettings (camera) {
			if ( camera === void 0 ) camera = null;


			if(camera !== null) {

				this.uniforms.cameraNear.value = camera.near;
				this.uniforms.cameraFar.value = camera.far;

				if(camera instanceof three.PerspectiveCamera) {

					this.defines.PERSPECTIVE_CAMERA = "1";

				} else {

					delete this.defines.PERSPECTIVE_CAMERA;

				}

			}

		};

		return DepthComparisonMaterial;
	}(three.ShaderMaterial));

	var fragmentShader$6 = "#include <packing>\n#ifdef GL_FRAGMENT_PRECISION_HIGH\nuniform highp sampler2D depthBuffer;\n#else\nuniform mediump sampler2D depthBuffer;\n#endif\n#ifdef DOWNSAMPLE_NORMALS\nuniform sampler2D normalBuffer;\n#endif\nvarying vec2 vUv0;varying vec2 vUv1;varying vec2 vUv2;varying vec2 vUv3;float readDepth(const in vec2 uv){\n#if DEPTH_PACKING == 3201\nreturn unpackRGBAToDepth(texture2D(depthBuffer,uv));\n#else\nreturn texture2D(depthBuffer,uv).r;\n#endif\n}/***Returns the index of the most representative depth in the 2x2 neighborhood.*/int findBestDepth(const in float samples[4]){float c=(samples[0]+samples[1]+samples[2]+samples[3])/4.0;float distances[4]=float[](abs(c-samples[0]),abs(c-samples[1]),abs(c-samples[2]),abs(c-samples[3]));float maxDistance=max(max(distances[0],distances[1]),max(distances[2],distances[3]));int remaining[3];int rejected[3];int i,j,k;for(i=0,j=0,k=0;i<4;++i){if(distances[i]<maxDistance){remaining[j++]=i;}else{rejected[k++]=i;}}for(;j<3;++j){remaining[j]=rejected[--k];}vec3 s=vec3(samples[remaining[0]],samples[remaining[1]],samples[remaining[2]]);c=(s.x+s.y+s.z)/3.0;distances[0]=abs(c-s.x);distances[1]=abs(c-s.y);distances[2]=abs(c-s.z);float minDistance=min(distances[0],min(distances[1],distances[2]));for(i=0;i<3;++i){if(distances[i]==minDistance){break;}}return remaining[i];}void main(){float d[4]=float[](readDepth(vUv0),readDepth(vUv1),readDepth(vUv2),readDepth(vUv3));int index=findBestDepth(d);\n#ifdef DOWNSAMPLE_NORMALS\nvec2 uvs[4]=vec2[](vUv0,vUv1,vUv2,vUv3);vec3 n=texture2D(normalBuffer,uvs[index]).rgb;\n#else\nvec3 n=vec3(0.0);\n#endif\ngl_FragColor=vec4(n,d[index]);}";

	var vertexShader$4 = "uniform vec2 texelSize;varying vec2 vUv0;varying vec2 vUv1;varying vec2 vUv2;varying vec2 vUv3;void main(){vec2 uv=position.xy*0.5+0.5;vUv0=uv;vUv1=vec2(uv.x,uv.y+texelSize.y);vUv2=vec2(uv.x+texelSize.x,uv.y);vUv3=uv+texelSize;gl_Position=vec4(position.xy,1.0,1.0);}";

	/**
	 * A depth downsampling shader material.
	 *
	 * Based on an article by Eleni Maria Stea:
	 * https://eleni.mutantstargoat.com/hikiko/depth-aware-upsampling-6
	 */

	var DepthDownsamplingMaterial = /*@__PURE__*/(function (ShaderMaterial) {
		function DepthDownsamplingMaterial() {

			ShaderMaterial.call(this, {

				type: "DepthDownsamplingMaterial",

				defines: {
					DEPTH_PACKING: "0"
				},

				uniforms: {
					depthBuffer: new three.Uniform(null),
					normalBuffer: new three.Uniform(null),
					texelSize: new three.Uniform(new three.Vector2())
				},

				fragmentShader: fragmentShader$6,
				vertexShader: vertexShader$4,

				depthWrite: false,
				depthTest: false

			});

			/** @ignore */
			this.toneMapped = false;

		}

		if ( ShaderMaterial ) DepthDownsamplingMaterial.__proto__ = ShaderMaterial;
		DepthDownsamplingMaterial.prototype = Object.create( ShaderMaterial && ShaderMaterial.prototype );
		DepthDownsamplingMaterial.prototype.constructor = DepthDownsamplingMaterial;

		var prototypeAccessors = { depthPacking: { configurable: true } };

		/**
		 * The depth packing of the source depth buffer.
		 *
		 * @type {Number}
		 */

		prototypeAccessors.depthPacking.get = function () {

			return Number(this.defines.DEPTH_PACKING);

		};

		/**
		 * Sets the depth packing.
		 *
		 * @type {Number}
		 */

		prototypeAccessors.depthPacking.set = function (value) {

			this.defines.DEPTH_PACKING = value.toFixed(0);
			this.needsUpdate = true;

		};

		/**
		 * Sets the texel size.
		 *
		 * @param {Number} x - The texel width.
		 * @param {Number} y - The texel height.
		 */

		DepthDownsamplingMaterial.prototype.setTexelSize = function setTexelSize (x, y) {

			this.uniforms.texelSize.value.set(x, y);

		};

		Object.defineProperties( DepthDownsamplingMaterial.prototype, prototypeAccessors );

		return DepthDownsamplingMaterial;
	}(three.ShaderMaterial));

	var fragmentShader$7 = "#include <common>\n#include <packing>\n#ifdef GL_FRAGMENT_PRECISION_HIGH\nuniform highp sampler2D depthBuffer0;uniform highp sampler2D depthBuffer1;\n#else\nuniform mediump sampler2D depthBuffer0;uniform mediump sampler2D depthBuffer1;\n#endif\nuniform sampler2D inputBuffer;varying vec2 vUv;void main(){\n#if DEPTH_PACKING_0 == 3201\nfloat d0=unpackRGBAToDepth(texture2D(depthBuffer0,vUv));\n#else\nfloat d0=texture2D(depthBuffer0,vUv).r;\n#endif\n#if DEPTH_PACKING_1 == 3201\nfloat d1=unpackRGBAToDepth(texture2D(depthBuffer1,vUv));\n#else\nfloat d1=texture2D(depthBuffer1,vUv).r;\n#endif\nif(d0<d1){discard;}gl_FragColor=texture2D(inputBuffer,vUv);}";

	/**
	 * A depth mask shader material.
	 *
	 * This material masks a color buffer by comparing two depth textures.
	 */

	var DepthMaskMaterial = /*@__PURE__*/(function (ShaderMaterial) {
		function DepthMaskMaterial() {

			ShaderMaterial.call(this, {

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

				fragmentShader: fragmentShader$7,
				vertexShader: vertexShader,

				depthWrite: false,
				depthTest: false

			});

			/** @ignore */
			this.toneMapped = false;

		}

		if ( ShaderMaterial ) DepthMaskMaterial.__proto__ = ShaderMaterial;
		DepthMaskMaterial.prototype = Object.create( ShaderMaterial && ShaderMaterial.prototype );
		DepthMaskMaterial.prototype.constructor = DepthMaskMaterial;

		return DepthMaskMaterial;
	}(three.ShaderMaterial));

	var fragmentShaderDepth = "#include <packing>\n#ifdef GL_FRAGMENT_PRECISION_HIGH\nuniform highp sampler2D depthBuffer;\n#else\nuniform mediump sampler2D depthBuffer;\n#endif\nvarying vec2 vUv;varying vec2 vUv0;varying vec2 vUv1;float readDepth(const in vec2 uv){\n#if DEPTH_PACKING == 3201\nreturn unpackRGBAToDepth(texture2D(depthBuffer,uv));\n#else\nreturn texture2D(depthBuffer,uv).r;\n#endif\n}/***Gathers the current texel,and the top-left neighbors.*/vec3 gatherNeighbors(){float p=readDepth(vUv);float pLeft=readDepth(vUv0);float pTop=readDepth(vUv1);return vec3(p,pLeft,pTop);}void main(){const vec2 threshold=vec2(DEPTH_THRESHOLD);vec3 neighbors=gatherNeighbors();vec2 delta=abs(neighbors.xx-vec2(neighbors.y,neighbors.z));vec2 edges=step(threshold,delta);if(dot(edges,vec2(1.0))==0.0){discard;}gl_FragColor=vec4(edges,0.0,1.0);}";

	var fragmentShaderLuma = "#include <common>\nuniform sampler2D inputBuffer;varying vec2 vUv;varying vec2 vUv0;varying vec2 vUv1;varying vec2 vUv2;varying vec2 vUv3;varying vec2 vUv4;varying vec2 vUv5;void main(){const vec2 threshold=vec2(EDGE_THRESHOLD);float l=linearToRelativeLuminance(texture2D(inputBuffer,vUv).rgb);float lLeft=linearToRelativeLuminance(texture2D(inputBuffer,vUv0).rgb);float lTop=linearToRelativeLuminance(texture2D(inputBuffer,vUv1).rgb);vec4 delta;delta.xy=abs(l-vec2(lLeft,lTop));vec2 edges=step(threshold,delta.xy);if(dot(edges,vec2(1.0))==0.0){discard;}float lRight=linearToRelativeLuminance(texture2D(inputBuffer,vUv2).rgb);float lBottom=linearToRelativeLuminance(texture2D(inputBuffer,vUv3).rgb);delta.zw=abs(l-vec2(lRight,lBottom));vec2 maxDelta=max(delta.xy,delta.zw);float lLeftLeft=linearToRelativeLuminance(texture2D(inputBuffer,vUv4).rgb);float lTopTop=linearToRelativeLuminance(texture2D(inputBuffer,vUv5).rgb);delta.zw=abs(vec2(lLeft,lTop)-vec2(lLeftLeft,lTopTop));maxDelta=max(maxDelta.xy,delta.zw);float finalDelta=max(maxDelta.x,maxDelta.y);edges.xy*=step(finalDelta,LOCAL_CONTRAST_ADAPTATION_FACTOR*delta.xy);gl_FragColor=vec4(edges,0.0,1.0);}";

	/**
	 * An edge detection material.
	 *
	 * Mainly used for Subpixel Morphological Antialiasing.
	 */

	var EdgeDetectionMaterial = /*@__PURE__*/(function (ShaderMaterial) {
		function EdgeDetectionMaterial(texelSize, mode) {
			if ( texelSize === void 0 ) texelSize = new three.Vector2();
			if ( mode === void 0 ) mode = EdgeDetectionMode.COLOR;


			ShaderMaterial.call(this, {

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

			/** @ignore */
			this.toneMapped = false;

			this.setEdgeDetectionMode(mode);

		}

		if ( ShaderMaterial ) EdgeDetectionMaterial.__proto__ = ShaderMaterial;
		EdgeDetectionMaterial.prototype = Object.create( ShaderMaterial && ShaderMaterial.prototype );
		EdgeDetectionMaterial.prototype.constructor = EdgeDetectionMaterial;

		var prototypeAccessors = { depthPacking: { configurable: true } };

		/**
		 * The current depth packing.
		 *
		 * @type {Number}
		 */

		prototypeAccessors.depthPacking.get = function () {

			return Number(this.defines.DEPTH_PACKING);

		};

		/**
		 * Sets the depth packing.
		 *
		 * @type {Number}
		 */

		prototypeAccessors.depthPacking.set = function (value) {

			this.defines.DEPTH_PACKING = value.toFixed(0);
			this.needsUpdate = true;

		};

		/**
		 * Sets the edge detection mode.
		 *
		 * Warning: If you intend to change the edge detection mode at runtime, make
		 * sure that {@link EffectPass.needsDepthTexture} is set to `true` _before_
		 * the EffectPass is added to the composer.
		 *
		 * @param {EdgeDetectionMode} mode - The edge detection mode.
		 */

		EdgeDetectionMaterial.prototype.setEdgeDetectionMode = function setEdgeDetectionMode (mode) {

			switch(mode) {

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

		};

		/**
		 * Sets the local contrast adaptation factor. Has no effect if the edge
		 * detection mode is set to DEPTH.
		 *
		 * If there is a neighbor edge that has _factor_ times bigger contrast than
		 * the current edge, the edge will be discarded.
		 *
		 * This allows to eliminate spurious crossing edges and is based on the fact
		 * that if there is too much contrast in a direction, the perceptual contrast
		 * in the other neighbors will be hidden.
		 *
		 * @param {Number} factor - The local contrast adaptation factor. Default is 2.0.
		 */

		EdgeDetectionMaterial.prototype.setLocalContrastAdaptationFactor = function setLocalContrastAdaptationFactor (factor) {

			this.defines.LOCAL_CONTRAST_ADAPTATION_FACTOR = factor.toFixed("2");
			this.needsUpdate = true;

		};

		/**
		 * Sets the edge detection sensitivity.
		 *
		 * A lower value results in more edges being detected at the expense of
		 * performance.
		 *
		 * 0.1 is a reasonable value, and allows to catch most visible edges.
		 * 0.05 is a rather overkill value, that allows to catch 'em all.
		 *
		 * If temporal supersampling is used, 0.2 could be a reasonable value, as low
		 * contrast edges are properly filtered by just 2x.
		 *
		 * @param {Number} threshold - The edge detection sensitivity. Range: [0.05, 0.5].
		 */

		EdgeDetectionMaterial.prototype.setEdgeDetectionThreshold = function setEdgeDetectionThreshold (threshold) {

			var t = Math.min(Math.max(threshold, 0.05), 0.5);

			this.defines.EDGE_THRESHOLD = t.toFixed("2");
			this.defines.DEPTH_THRESHOLD = (t * 0.1).toFixed("3");
			this.needsUpdate = true;

		};

		Object.defineProperties( EdgeDetectionMaterial.prototype, prototypeAccessors );

		return EdgeDetectionMaterial;
	}(three.ShaderMaterial));

	/**
	 * An enumeration of edge detection modes.
	 *
	 * @type {Object}
	 * @property {Number} DEPTH - Depth-based edge detection.
	 * @property {Number} LUMA - Luminance-based edge detection.
	 * @property {Number} COLOR - Chroma-based edge detection.
	 */

	var EdgeDetectionMode = {

		DEPTH: 0,
		LUMA: 1,
		COLOR: 2

	};

	var fragmentTemplate = "#include <common>\n#include <packing>\n#include <dithering_pars_fragment>\nuniform sampler2D inputBuffer;\n#ifdef GL_FRAGMENT_PRECISION_HIGH\nuniform highp sampler2D depthBuffer;\n#else\nuniform mediump sampler2D depthBuffer;\n#endif\nuniform vec2 resolution;uniform vec2 texelSize;uniform float cameraNear;uniform float cameraFar;uniform float aspect;uniform float time;varying vec2 vUv;float readDepth(const in vec2 uv){\n#if DEPTH_PACKING == 3201\nreturn unpackRGBAToDepth(texture2D(depthBuffer,uv));\n#else\nreturn texture2D(depthBuffer,uv).r;\n#endif\n}float getViewZ(const in float depth){\n#ifdef PERSPECTIVE_CAMERA\nreturn perspectiveDepthToViewZ(depth,cameraNear,cameraFar);\n#else\nreturn orthographicDepthToViewZ(depth,cameraNear,cameraFar);\n#endif\n}FRAGMENT_HEADvoid main(){FRAGMENT_MAIN_UVvec4 color0=texture2D(inputBuffer,UV);vec4 color1=vec4(0.0);FRAGMENT_MAIN_IMAGEgl_FragColor=color0;\n#ifdef ENCODE_OUTPUT\n#include <encodings_fragment>\n#endif\n#include <dithering_fragment>\n}";

	var vertexTemplate = "uniform vec2 resolution;uniform vec2 texelSize;uniform float cameraNear;uniform float cameraFar;uniform float aspect;uniform float time;varying vec2 vUv;VERTEX_HEADvoid main(){vUv=position.xy*0.5+0.5;VERTEX_MAIN_SUPPORTgl_Position=vec4(position.xy,1.0,1.0);}";

	/**
	 * An effect material for compound shaders.
	 *
	 * This material supports dithering.
	 *
	 * @implements {Resizable}
	 */

	var EffectMaterial = /*@__PURE__*/(function (ShaderMaterial) {
		function EffectMaterial(shaderParts, defines, uniforms, camera, dithering) {
			if ( shaderParts === void 0 ) shaderParts = null;
			if ( defines === void 0 ) defines = null;
			if ( uniforms === void 0 ) uniforms = null;
			if ( camera === void 0 ) camera = null;
			if ( dithering === void 0 ) dithering = false;


			ShaderMaterial.call(this, {

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

			/** @ignore */
			this.toneMapped = false;

			if(shaderParts !== null) {

				this.setShaderParts(shaderParts);

			}

			if(defines !== null) {

				this.setDefines(defines);

			}

			if(uniforms !== null) {

				this.setUniforms(uniforms);

			}

			this.adoptCameraSettings(camera);

		}

		if ( ShaderMaterial ) EffectMaterial.__proto__ = ShaderMaterial;
		EffectMaterial.prototype = Object.create( ShaderMaterial && ShaderMaterial.prototype );
		EffectMaterial.prototype.constructor = EffectMaterial;

		var prototypeAccessors = { depthPacking: { configurable: true } };

		/**
		 * The current depth packing.
		 *
		 * @type {Number}
		 */

		prototypeAccessors.depthPacking.get = function () {

			return Number(this.defines.DEPTH_PACKING);

		};

		/**
		 * Sets the depth packing.
		 *
		 * Use `BasicDepthPacking` or `RGBADepthPacking` if your depth texture
		 * contains packed depth.
		 *
		 * @type {Number}
		 */

		prototypeAccessors.depthPacking.set = function (value) {

			this.defines.DEPTH_PACKING = value.toFixed(0);
			this.needsUpdate = true;

		};

		/**
		 * Sets the shader parts.
		 *
		 * @param {Map<String, String>} shaderParts - A collection of shader snippets. See {@link Section}.
		 * @return {EffectMaterial} This material.
		 */

		EffectMaterial.prototype.setShaderParts = function setShaderParts (shaderParts) {

			this.fragmentShader = fragmentTemplate
				.replace(Section.FRAGMENT_HEAD, shaderParts.get(Section.FRAGMENT_HEAD))
				.replace(Section.FRAGMENT_MAIN_UV, shaderParts.get(Section.FRAGMENT_MAIN_UV))
				.replace(Section.FRAGMENT_MAIN_IMAGE, shaderParts.get(Section.FRAGMENT_MAIN_IMAGE));

			this.vertexShader = vertexTemplate
				.replace(Section.VERTEX_HEAD, shaderParts.get(Section.VERTEX_HEAD))
				.replace(Section.VERTEX_MAIN_SUPPORT, shaderParts.get(Section.VERTEX_MAIN_SUPPORT));

			this.needsUpdate = true;

			return this;

		};

		/**
		 * Sets the shader macros.
		 *
		 * @param {Map<String, String>} defines - A collection of preprocessor macro definitions.
		 * @return {EffectMaterial} This material.
		 */

		EffectMaterial.prototype.setDefines = function setDefines (defines) {

			for(var i = 0, list = defines.entries(); i < list.length; i += 1) {

				var entry = list[i];

				this.defines[entry[0]] = entry[1];

			}

			this.needsUpdate = true;

			return this;

		};

		/**
		 * Sets the shader uniforms.
		 *
		 * @param {Map<String, Uniform>} uniforms - A collection of uniforms.
		 * @return {EffectMaterial} This material.
		 */

		EffectMaterial.prototype.setUniforms = function setUniforms (uniforms) {

			for(var i = 0, list = uniforms.entries(); i < list.length; i += 1) {

				var entry = list[i];

				this.uniforms[entry[0]] = entry[1];

			}

			return this;

		};

		/**
		 * Adopts the settings of the given camera.
		 *
		 * @param {Camera} [camera=null] - A camera.
		 */

		EffectMaterial.prototype.adoptCameraSettings = function adoptCameraSettings (camera) {
			if ( camera === void 0 ) camera = null;


			if(camera !== null) {

				this.uniforms.cameraNear.value = camera.near;
				this.uniforms.cameraFar.value = camera.far;

				if(camera instanceof three.PerspectiveCamera) {

					this.defines.PERSPECTIVE_CAMERA = "1";

				} else {

					delete this.defines.PERSPECTIVE_CAMERA;

				}

				this.needsUpdate = true;

			}

		};

		/**
		 * Sets the resolution.
		 *
		 * @param {Number} width - The width.
		 * @param {Number} height - The height.
		 */

		EffectMaterial.prototype.setSize = function setSize (width, height) {

			var w = Math.max(width, 1);
			var h = Math.max(height, 1);

			this.uniforms.resolution.value.set(w, h);
			this.uniforms.texelSize.value.set(1.0 / w, 1.0 / h);
			this.uniforms.aspect.value = w / h;

		};

		Object.defineProperties( EffectMaterial.prototype, prototypeAccessors );

		return EffectMaterial;
	}(three.ShaderMaterial));

	/**
	 * An enumeration of shader code placeholders used by the {@link EffectPass}.
	 *
	 * @type {Object}
	 * @property {String} FRAGMENT_HEAD - A placeholder for function and variable declarations inside the fragment shader.
	 * @property {String} FRAGMENT_MAIN_UV - A placeholder for UV transformations inside the fragment shader.
	 * @property {String} FRAGMENT_MAIN_IMAGE - A placeholder for color calculations inside the fragment shader.
	 * @property {String} VERTEX_HEAD - A placeholder for function and variable declarations inside the vertex shader.
	 * @property {String} VERTEX_MAIN_SUPPORT - A placeholder for supporting calculations inside the vertex shader.
	 */

	var Section = {

		FRAGMENT_HEAD: "FRAGMENT_HEAD",
		FRAGMENT_MAIN_UV: "FRAGMENT_MAIN_UV",
		FRAGMENT_MAIN_IMAGE: "FRAGMENT_MAIN_IMAGE",
		VERTEX_HEAD: "VERTEX_HEAD",
		VERTEX_MAIN_SUPPORT: "VERTEX_MAIN_SUPPORT"

	};

	var fragmentShader$8 = "#include <common>\n#include <dithering_pars_fragment>\nuniform sampler2D inputBuffer;uniform vec2 lightPosition;uniform float exposure;uniform float decay;uniform float density;uniform float weight;uniform float clampMax;varying vec2 vUv;void main(){vec2 coord=vUv;vec2 delta=lightPosition-coord;delta*=1.0/SAMPLES_FLOAT*density;float illuminationDecay=1.0;vec4 color=vec4(0.0);/*Estimate the probability of occlusion at each pixel by summing samplesalong a ray to the light position.*/for(int i=0;i<SAMPLES_INT;++i){coord+=delta;vec4 texel=texture2D(inputBuffer,coord);texel*=illuminationDecay*weight;color+=texel;illuminationDecay*=decay;}gl_FragColor=clamp(color*exposure,0.0,clampMax);\n#include <dithering_fragment>\n}";

	/**
	 * A crepuscular rays shader material.
	 *
	 * This material supports dithering.
	 *
	 * References:
	 *
	 * Thibaut Despoulain, 2012:
	 *  [(WebGL) Volumetric Light Approximation in Three.js](
	 *  http://bkcore.com/blog/3d/webgl-three-js-volumetric-light-godrays.html)
	 *
	 * Nvidia, GPU Gems 3, 2008:
	 *  [Chapter 13. Volumetric Light Scattering as a Post-Process](
	 *  https://developer.nvidia.com/gpugems/GPUGems3/gpugems3_ch13.html)
	 *
	 * @todo Remove dithering code from fragment shader.
	 */

	var GodRaysMaterial = /*@__PURE__*/(function (ShaderMaterial) {
		function GodRaysMaterial(lightPosition) {

			ShaderMaterial.call(this, {

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

				fragmentShader: fragmentShader$8,
				vertexShader: vertexShader,

				depthWrite: false,
				depthTest: false

			});

			/** @ignore */
			this.toneMapped = false;

		}

		if ( ShaderMaterial ) GodRaysMaterial.__proto__ = ShaderMaterial;
		GodRaysMaterial.prototype = Object.create( ShaderMaterial && ShaderMaterial.prototype );
		GodRaysMaterial.prototype.constructor = GodRaysMaterial;

		var prototypeAccessors = { samples: { configurable: true } };

		/**
		 * The amount of samples per pixel.
		 *
		 * @type {Number}
		 */

		prototypeAccessors.samples.get = function () {

			return Number(this.defines.SAMPLES_INT);

		};

		/**
		 * Sets the amount of samples per pixel.
		 *
		 * @type {Number}
		 */

		prototypeAccessors.samples.set = function (value) {

			var s = Math.floor(value);

			this.defines.SAMPLES_INT = s.toFixed(0);
			this.defines.SAMPLES_FLOAT = s.toFixed(1);
			this.needsUpdate = true;

		};

		Object.defineProperties( GodRaysMaterial.prototype, prototypeAccessors );

		return GodRaysMaterial;
	}(three.ShaderMaterial));

	var fragmentShader$9 = "#include <common>\nuniform sampler2D inputBuffer;\n#ifdef RANGE\nuniform vec2 range;\n#elif defined(THRESHOLD)\nuniform float threshold;uniform float smoothing;\n#endif\nvarying vec2 vUv;void main(){vec4 texel=texture2D(inputBuffer,vUv);float l=linearToRelativeLuminance(texel.rgb);\n#ifdef RANGE\nfloat low=step(range.x,l);float high=step(l,range.y);l*=low*high;\n#elif defined(THRESHOLD)\nl=smoothstep(threshold,threshold+smoothing,l);\n#endif\n#ifdef COLOR\ngl_FragColor=vec4(texel.rgb*l,l);\n#else\ngl_FragColor=vec4(l);\n#endif\n}";

	/**
	 * A luminance shader material.
	 *
	 * This shader produces a greyscale luminance map that describes the absolute
	 * amount of light emitted by a scene. It can also be configured to output
	 * colours that are scaled with their respective luminance value. Additionally,
	 * a range may be provided to mask out undesired texels.
	 *
	 * The alpha channel always contains the luminance value.
	 *
	 * On luminance coefficients:
	 *  http://www.poynton.com/notes/colour_and_gamma/ColorFAQ.html#RTFToC9
	 *
	 * Coefficients for different colour spaces:
	 *  https://hsto.org/getpro/habr/post_images/2ab/69d/084/2ab69d084f9a597e032624bcd74d57a7.png
	 *
	 * Luminance range reference:
	 *  https://cycling74.com/2007/05/23/your-first-shader/#.Vty9FfkrL4Z
	 */

	var LuminanceMaterial = /*@__PURE__*/(function (ShaderMaterial) {
		function LuminanceMaterial(colorOutput, luminanceRange) {
			if ( colorOutput === void 0 ) colorOutput = false;
			if ( luminanceRange === void 0 ) luminanceRange = null;


			var useRange = (luminanceRange !== null);

			ShaderMaterial.call(this, {

				type: "LuminanceMaterial",

				uniforms: {
					inputBuffer: new three.Uniform(null),
					threshold: new three.Uniform(0.0),
					smoothing: new three.Uniform(1.0),
					range: new three.Uniform(useRange ? luminanceRange : new three.Vector2())
				},

				fragmentShader: fragmentShader$9,
				vertexShader: vertexShader,

				depthWrite: false,
				depthTest: false

			});

			/** @ignore */
			this.toneMapped = false;

			this.colorOutput = colorOutput;
			this.useThreshold = true;
			this.useRange = useRange;

		}

		if ( ShaderMaterial ) LuminanceMaterial.__proto__ = ShaderMaterial;
		LuminanceMaterial.prototype = Object.create( ShaderMaterial && ShaderMaterial.prototype );
		LuminanceMaterial.prototype.constructor = LuminanceMaterial;

		var prototypeAccessors = { threshold: { configurable: true },smoothing: { configurable: true },useThreshold: { configurable: true },colorOutput: { configurable: true },useRange: { configurable: true },luminanceRange: { configurable: true } };

		/**
		 * The luminance threshold.
		 *
		 * @type {Number}
		 */

		prototypeAccessors.threshold.get = function () {

			return this.uniforms.threshold.value;

		};

		/**
		 * Sets the luminance threshold.
		 *
		 * @type {Number}
		 */

		prototypeAccessors.threshold.set = function (value) {

			this.uniforms.threshold.value = value;

		};

		/**
		 * The luminance threshold smoothing.
		 *
		 * @type {Number}
		 */

		prototypeAccessors.smoothing.get = function () {

			return this.uniforms.smoothing.value;

		};

		/**
		 * Sets the luminance threshold smoothing.
		 *
		 * @type {Number}
		 */

		prototypeAccessors.smoothing.set = function (value) {

			this.uniforms.smoothing.value = value;

		};

		/**
		 * Indicates whether the luminance threshold is enabled.
		 *
		 * @type {Boolean}
		 */

		prototypeAccessors.useThreshold.get = function () {

			return (this.defines.THRESHOLD !== undefined);

		};

		/**
		 * Enables or disables the luminance threshold.
		 *
		 * @type {Boolean}
		 */

		prototypeAccessors.useThreshold.set = function (value) {

			if(value) {

				this.defines.THRESHOLD = "1";

			} else {

				delete this.defines.THRESHOLD;

			}

			this.needsUpdate = true;

		};

		/**
		 * Indicates whether color output is enabled.
		 *
		 * @type {Boolean}
		 */

		prototypeAccessors.colorOutput.get = function () {

			return (this.defines.COLOR !== undefined);

		};

		/**
		 * Enables or disables color output.
		 *
		 * @type {Boolean}
		 */

		prototypeAccessors.colorOutput.set = function (value) {

			if(value) {

				this.defines.COLOR = "1";

			} else {

				delete this.defines.COLOR;

			}

			this.needsUpdate = true;

		};

		/**
		 * Enables or disables color output.
		 *
		 * @deprecated Use colorOutput instead.
		 * @param {Boolean} enabled - Whether color output should be enabled.
		 */

		LuminanceMaterial.prototype.setColorOutputEnabled = function setColorOutputEnabled (enabled) {

			this.colorOutput = enabled;

		};

		/**
		 * Indicates whether luminance masking is enabled.
		 *
		 * @type {Boolean}
		 */

		prototypeAccessors.useRange.get = function () {

			return (this.defines.RANGE !== undefined);

		};

		/**
		 * Enables or disables luminance masking.
		 *
		 * If enabled, the threshold will be ignored.
		 *
		 * @type {Boolean}
		 */

		prototypeAccessors.useRange.set = function (value) {

			if(value) {

				this.defines.RANGE = "1";

			} else {

				delete this.defines.RANGE;

			}

			this.needsUpdate = true;

		};

		/**
		 * Indicates whether luminance masking is enabled.
		 *
		 * @type {Boolean}
		 * @deprecated Use useRange instead.
		 */

		prototypeAccessors.luminanceRange.get = function () {

			return this.useRange;

		};

		/**
		 * Enables or disables luminance masking.
		 *
		 * @type {Boolean}
		 * @deprecated Use useRange instead.
		 */

		prototypeAccessors.luminanceRange.set = function (value) {

			this.useRange = value;

		};

		/**
		 * Enables or disables the luminance mask.
		 *
		 * @deprecated Use luminanceRange instead.
		 * @param {Boolean} enabled - Whether the luminance mask should be enabled.
		 */

		LuminanceMaterial.prototype.setLuminanceRangeEnabled = function setLuminanceRangeEnabled (enabled) {

			this.useRange = enabled;

		};

		Object.defineProperties( LuminanceMaterial.prototype, prototypeAccessors );

		return LuminanceMaterial;
	}(three.ShaderMaterial));

	var fragmentShader$a = "uniform sampler2D maskTexture;uniform sampler2D inputBuffer;\n#if MASK_FUNCTION != 0\nuniform float strength;\n#endif\nvarying vec2 vUv;void main(){\n#if COLOR_CHANNEL == 0\nfloat mask=texture2D(maskTexture,vUv).r;\n#elif COLOR_CHANNEL == 1\nfloat mask=texture2D(maskTexture,vUv).g;\n#elif COLOR_CHANNEL == 2\nfloat mask=texture2D(maskTexture,vUv).b;\n#else\nfloat mask=texture2D(maskTexture,vUv).a;\n#endif\n#if MASK_FUNCTION == 0\n#ifdef INVERTED\nif(mask>0.0){discard;}\n#else\nif(mask==0.0){discard;}\n#endif\n#else\nmask=clamp(mask*strength,0.0,1.0);\n#ifdef INVERTED\nmask=(1.0-mask);\n#endif\n#if MASK_FUNCTION == 1\ngl_FragColor=mask*texture2D(inputBuffer,vUv);\n#else\ngl_FragColor=vec4(mask*texture2D(inputBuffer,vUv).rgb,mask);\n#endif\n#endif\n}";

	/**
	 * A mask shader material.
	 *
	 * This material applies a mask texture to a buffer.
	 */

	var MaskMaterial = /*@__PURE__*/(function (ShaderMaterial) {
		function MaskMaterial(maskTexture) {
			if ( maskTexture === void 0 ) maskTexture = null;


			ShaderMaterial.call(this, {

				type: "MaskMaterial",

				uniforms: {
					maskTexture: new three.Uniform(maskTexture),
					inputBuffer: new three.Uniform(null),
					strength: new three.Uniform(1.0)
				},

				fragmentShader: fragmentShader$a,
				vertexShader: vertexShader,

				depthWrite: false,
				depthTest: false

			});

			/** @ignore */
			this.toneMapped = false;

			this.colorChannel = ColorChannel.RED;
			this.maskFunction = MaskFunction.DISCARD;

		}

		if ( ShaderMaterial ) MaskMaterial.__proto__ = ShaderMaterial;
		MaskMaterial.prototype = Object.create( ShaderMaterial && ShaderMaterial.prototype );
		MaskMaterial.prototype.constructor = MaskMaterial;

		var prototypeAccessors = { maskTexture: { configurable: true },colorChannel: { configurable: true },maskFunction: { configurable: true },inverted: { configurable: true },strength: { configurable: true } };

		/**
		 * Sets the mask texture.
		 *
		 * @type {Texture}
		 */

		prototypeAccessors.maskTexture.set = function (value) {

			this.uniforms.maskTexture.value = value;

		};

		/**
		 * Sets the color channel to use for masking.
		 *
		 * The default channel is `RED`.
		 *
		 * @type {ColorChannel}
		 */

		prototypeAccessors.colorChannel.set = function (value) {

			this.defines.COLOR_CHANNEL = value.toFixed(0);
			this.needsUpdate = true;

		};

		/**
		 * Sets the masking technique.
		 *
		 * The default function is `DISCARD`.
		 *
		 * @type {MaskFunction}
		 */

		prototypeAccessors.maskFunction.set = function (value) {

			this.defines.MASK_FUNCTION = value.toFixed(0);
			this.needsUpdate = true;

		};

		/**
		 * Indicates whether the masking is inverted.
		 *
		 * @type {Boolean}
		 */

		prototypeAccessors.inverted.get = function () {

			return (this.defines.INVERTED !== undefined);

		};

		/**
		 * Determines whether the masking should be inverted.
		 *
		 * @type {Boolean}
		 */

		prototypeAccessors.inverted.set = function (value) {

			if(this.inverted && !value) {

				delete this.defines.INVERTED;

			} else if(value) {

				this.defines.INVERTED = "1";

			}

			this.needsUpdate = true;

		};

		/**
		 * The current mask strength.
		 *
		 * Individual mask values will be clamped to [0.0, 1.0].
		 *
		 * @type {Number}
		 */

		prototypeAccessors.strength.get = function () {

			return this.uniforms.strength.value;

		};

		/**
		 * Sets the strength of the mask.
		 *
		 * Has no effect when the mask function is set to `DISCARD`.
		 *
		 * @type {Number}
		 */

		prototypeAccessors.strength.set = function (value) {

			this.uniforms.strength.value = value;

		};

		Object.defineProperties( MaskMaterial.prototype, prototypeAccessors );

		return MaskMaterial;
	}(three.ShaderMaterial));

	/**
	 * A mask function enumeration.
	 *
	 * @type {Object}
	 * @property {Number} DISCARD - Discards elements when the respective mask value is zero.
	 * @property {Number} MULTIPLY - Multiplies the input buffer with the mask texture.
	 * @property {Number} MULTIPLY_RGB_SET_ALPHA - Multiplies the input RGB values with the mask and sets alpha to the mask value.
	 */

	var MaskFunction = {

		DISCARD: 0,
		MULTIPLY: 1,
		MULTIPLY_RGB_SET_ALPHA: 2

	};

	var fragmentShader$b = "uniform sampler2D inputBuffer;varying vec2 vUv0;varying vec2 vUv1;varying vec2 vUv2;varying vec2 vUv3;void main(){vec2 c0=texture2D(inputBuffer,vUv0).rg;vec2 c1=texture2D(inputBuffer,vUv1).rg;vec2 c2=texture2D(inputBuffer,vUv2).rg;vec2 c3=texture2D(inputBuffer,vUv3).rg;float d0=(c0.x-c1.x)*0.5;float d1=(c2.x-c3.x)*0.5;float d=length(vec2(d0,d1));float a0=min(c0.y,c1.y);float a1=min(c2.y,c3.y);float visibilityFactor=min(a0,a1);gl_FragColor.rg=(1.0-visibilityFactor>0.001)? vec2(d,0.0): vec2(0.0,d);}";

	var vertexShader$5 = "uniform vec2 texelSize;varying vec2 vUv0;varying vec2 vUv1;varying vec2 vUv2;varying vec2 vUv3;void main(){vec2 uv=position.xy*0.5+0.5;vUv0=vec2(uv.x+texelSize.x,uv.y);vUv1=vec2(uv.x-texelSize.x,uv.y);vUv2=vec2(uv.x,uv.y+texelSize.y);vUv3=vec2(uv.x,uv.y-texelSize.y);gl_Position=vec4(position.xy,1.0,1.0);}";

	/**
	 * An outline shader material.
	 */

	var OutlineMaterial = /*@__PURE__*/(function (ShaderMaterial) {
		function OutlineMaterial(texelSize) {
			if ( texelSize === void 0 ) texelSize = new three.Vector2();


			ShaderMaterial.call(this, {

				type: "OutlineMaterial",

				uniforms: {
					inputBuffer: new three.Uniform(null),
					texelSize: new three.Uniform(new three.Vector2())
				},

				fragmentShader: fragmentShader$b,
				vertexShader: vertexShader$5,

				depthWrite: false,
				depthTest: false

			});

			/** @ignore */
			this.toneMapped = false;

			this.setTexelSize(texelSize.x, texelSize.y);

			// @todo Added for backward compatibility.
			this.uniforms.maskTexture = this.uniforms.inputBuffer;

		}

		if ( ShaderMaterial ) OutlineMaterial.__proto__ = ShaderMaterial;
		OutlineMaterial.prototype = Object.create( ShaderMaterial && ShaderMaterial.prototype );
		OutlineMaterial.prototype.constructor = OutlineMaterial;

		/**
		 * Sets the texel size.
		 *
		 * @param {Number} x - The texel width.
		 * @param {Number} y - The texel height.
		 */

		OutlineMaterial.prototype.setTexelSize = function setTexelSize (x, y) {

			this.uniforms.texelSize.value.set(x, y);

		};

		return OutlineMaterial;
	}(three.ShaderMaterial));

	/**
	 * An outline shader material.
	 *
	 * @deprecated Use OutlineMaterial instead.
	 */

	var OutlineEdgesMaterial = OutlineMaterial;

	var fragmentShader$c = "#define sampleLevelZeroOffset(t, coord, offset) texture2D(t, coord + offset * texelSize)\n#if __VERSION__ < 300\n#define round(v) floor(v + 0.5)\n#endif\nuniform sampler2D inputBuffer;uniform sampler2D areaTexture;uniform sampler2D searchTexture;uniform vec2 texelSize;uniform vec2 resolution;varying vec2 vUv;varying vec4 vOffset[3];varying vec2 vPixCoord;/***Moves values to a target vector based on a given conditional vector.*/void movec(const in bvec2 c,inout vec2 variable,const in vec2 value){if(c.x){variable.x=value.x;}if(c.y){variable.y=value.y;}}void movec(const in bvec4 c,inout vec4 variable,const in vec4 value){movec(c.xy,variable.xy,value.xy);movec(c.zw,variable.zw,value.zw);}/***Allows to decode two binary values from a bilinear-filtered access.**Bilinear access for fetching 'e' have a 0.25 offset,and we are interested*in the R and G edges:**+---G---+-------+*|x o R   x|*+-------+-------+**Then,if one of these edge is enabled:*Red:(0.75*X+0.25*1)=>0.25 or 1.0*Green:(0.75*1+0.25*X)=>0.75 or 1.0**This function will unpack the values(mad+mul+round):*wolframalpha.com: round(x*abs(5*x-5*0.75))plot 0 to 1*/vec2 decodeDiagBilinearAccess(in vec2 e){e.r=e.r*abs(5.0*e.r-5.0*0.75);return round(e);}vec4 decodeDiagBilinearAccess(in vec4 e){e.rb=e.rb*abs(5.0*e.rb-5.0*0.75);return round(e);}/***Diagonal pattern searches.*/vec2 searchDiag1(const in vec2 texCoord,const in vec2 dir,out vec2 e){vec4 coord=vec4(texCoord,-1.0,1.0);vec3 t=vec3(texelSize,1.0);for(int i=0;i<MAX_SEARCH_STEPS_INT;++i){if(!(coord.z<float(MAX_SEARCH_STEPS_DIAG_INT-1)&&coord.w>0.9)){break;}coord.xyz=t*vec3(dir,1.0)+coord.xyz;e=texture2D(inputBuffer,coord.xy).rg;coord.w=dot(e,vec2(0.5));}return coord.zw;}vec2 searchDiag2(const in vec2 texCoord,const in vec2 dir,out vec2 e){vec4 coord=vec4(texCoord,-1.0,1.0);coord.x+=0.25*texelSize.x;vec3 t=vec3(texelSize,1.0);for(int i=0;i<MAX_SEARCH_STEPS_INT;++i){if(!(coord.z<float(MAX_SEARCH_STEPS_DIAG_INT-1)&&coord.w>0.9)){break;}coord.xyz=t*vec3(dir,1.0)+coord.xyz;e=texture2D(inputBuffer,coord.xy).rg;e=decodeDiagBilinearAccess(e);coord.w=dot(e,vec2(0.5));}return coord.zw;}/***Calculates the area corresponding to a certain diagonal distance and crossing*edges 'e'.*/vec2 areaDiag(const in vec2 dist,const in vec2 e,const in float offset){vec2 texCoord=vec2(AREATEX_MAX_DISTANCE_DIAG,AREATEX_MAX_DISTANCE_DIAG)*e+dist;texCoord=AREATEX_PIXEL_SIZE*texCoord+0.5*AREATEX_PIXEL_SIZE;texCoord.x+=0.5;texCoord.y+=AREATEX_SUBTEX_SIZE*offset;return texture2D(areaTexture,texCoord).rg;}/***Searches for diagonal patterns and returns the corresponding weights.*/vec2 calculateDiagWeights(const in vec2 texCoord,const in vec2 e,const in vec4 subsampleIndices){vec2 weights=vec2(0.0);vec4 d;vec2 end;if(e.r>0.0){d.xz=searchDiag1(texCoord,vec2(-1.0,1.0),end);d.x+=float(end.y>0.9);}else{d.xz=vec2(0.0);}d.yw=searchDiag1(texCoord,vec2(1.0,-1.0),end);if(d.x+d.y>2.0){vec4 coords=vec4(-d.x+0.25,d.x,d.y,-d.y-0.25)*texelSize.xyxy+texCoord.xyxy;vec4 c;c.xy=sampleLevelZeroOffset(inputBuffer,coords.xy,vec2(-1,0)).rg;c.zw=sampleLevelZeroOffset(inputBuffer,coords.zw,vec2(1,0)).rg;c.yxwz=decodeDiagBilinearAccess(c.xyzw);vec2 cc=vec2(2.0)*c.xz+c.yw;movec(bvec2(step(0.9,d.zw)),cc,vec2(0.0));weights+=areaDiag(d.xy,cc,subsampleIndices.z);}d.xz=searchDiag2(texCoord,vec2(-1.0,-1.0),end);if(sampleLevelZeroOffset(inputBuffer,texCoord,vec2(1,0)).r>0.0){d.yw=searchDiag2(texCoord,vec2(1.0),end);d.y+=float(end.y>0.9);}else{d.yw=vec2(0.0);}if(d.x+d.y>2.0){vec4 coords=vec4(-d.x,-d.x,d.y,d.y)*texelSize.xyxy+texCoord.xyxy;vec4 c;c.x=sampleLevelZeroOffset(inputBuffer,coords.xy,vec2(-1,0)).g;c.y=sampleLevelZeroOffset(inputBuffer,coords.xy,vec2(0,-1)).r;c.zw=sampleLevelZeroOffset(inputBuffer,coords.zw,vec2(1,0)).gr;vec2 cc=vec2(2.0)*c.xz+c.yw;movec(bvec2(step(0.9,d.zw)),cc,vec2(0.0));weights+=areaDiag(d.xy,cc,subsampleIndices.w).gr;}return weights;}/***Determines how much length should be added in the last step of the searches.**Takes the bilinearly interpolated edge(see @PSEUDO_GATHER4),and adds 0,1*or 2 depending on which edges and crossing edges are active.*/float searchLength(const in vec2 e,const in float offset){/*The texture is flipped vertically,with left and right cases taking halfof the space horizontally.*/vec2 scale=SEARCHTEX_SIZE*vec2(0.5,-1.0);vec2 bias=SEARCHTEX_SIZE*vec2(offset,1.0);scale+=vec2(-1.0,1.0);bias+=vec2(0.5,-0.5);scale*=1.0/SEARCHTEX_PACKED_SIZE;bias*=1.0/SEARCHTEX_PACKED_SIZE;return texture2D(searchTexture,scale*e+bias).r;}/***Horizontal search for the second pass.*/float searchXLeft(in vec2 texCoord,const in float end){/*@PSEUDO_GATHER4This texCoord has been offset by(-0.25,-0.125)in the vertex shader tosample between edges,thus fetching four edges in a row.Sampling with different offsets in each direction allows to disambiguatewhich edges are active from the four fetched ones.*/vec2 e=vec2(0.0,1.0);for(int i=0;i<MAX_SEARCH_STEPS_INT;++i){if(!(texCoord.x>end&&e.g>0.8281&&e.r==0.0)){break;}e=texture2D(inputBuffer,texCoord).rg;texCoord=vec2(-2.0,0.0)*texelSize+texCoord;}float offset=-(255.0/127.0)*searchLength(e,0.0)+3.25;return texelSize.x*offset+texCoord.x;}float searchXRight(vec2 texCoord,const in float end){vec2 e=vec2(0.0,1.0);for(int i=0;i<MAX_SEARCH_STEPS_INT;++i){if(!(texCoord.x<end&&e.g>0.8281&&e.r==0.0)){break;}e=texture2D(inputBuffer,texCoord).rg;texCoord=vec2(2.0,0.0)*texelSize.xy+texCoord;}float offset=-(255.0/127.0)*searchLength(e,0.5)+3.25;return-texelSize.x*offset+texCoord.x;}/***Vertical search for the second pass.*/float searchYUp(vec2 texCoord,const in float end){vec2 e=vec2(1.0,0.0);for(int i=0;i<MAX_SEARCH_STEPS_INT;++i){if(!(texCoord.y>end&&e.r>0.8281&&e.g==0.0)){break;}e=texture2D(inputBuffer,texCoord).rg;texCoord=-vec2(0.0,2.0)*texelSize.xy+texCoord;}float offset=-(255.0/127.0)*searchLength(e.gr,0.0)+3.25;return texelSize.y*offset+texCoord.y;}float searchYDown(vec2 texCoord,const in float end){vec2 e=vec2(1.0,0.0);for(int i=0;i<MAX_SEARCH_STEPS_INT;i++){if(!(texCoord.y<end&&e.r>0.8281&&e.g==0.0)){break;}e=texture2D(inputBuffer,texCoord).rg;texCoord=vec2(0.0,2.0)*texelSize.xy+texCoord;}float offset=-(255.0/127.0)*searchLength(e.gr,0.5)+3.25;return-texelSize.y*offset+texCoord.y;}/***Determines the areas at each side of the current edge.*/vec2 area(const in vec2 dist,const in float e1,const in float e2,const in float offset){vec2 texCoord=vec2(AREATEX_MAX_DISTANCE)*round(4.0*vec2(e1,e2))+dist;texCoord=AREATEX_PIXEL_SIZE*texCoord+0.5*AREATEX_PIXEL_SIZE;texCoord.y=AREATEX_SUBTEX_SIZE*offset+texCoord.y;return texture2D(areaTexture,texCoord).rg;}/***Corner detection.*/void detectHorizontalCornerPattern(inout vec2 weights,const in vec4 texCoord,const in vec2 d){\n#if !defined(DISABLE_CORNER_DETECTION)\nvec2 leftRight=step(d.xy,d.yx);vec2 rounding=(1.0-CORNER_ROUNDING_NORM)*leftRight;rounding/=leftRight.x+leftRight.y;vec2 factor=vec2(1.0);factor.x-=rounding.x*sampleLevelZeroOffset(inputBuffer,texCoord.xy,vec2(0,1)).r;factor.x-=rounding.y*sampleLevelZeroOffset(inputBuffer,texCoord.zw,vec2(1,1)).r;factor.y-=rounding.x*sampleLevelZeroOffset(inputBuffer,texCoord.xy,vec2(0,-2)).r;factor.y-=rounding.y*sampleLevelZeroOffset(inputBuffer,texCoord.zw,vec2(1,-2)).r;weights*=clamp(factor,0.0,1.0);\n#endif\n}void detectVerticalCornerPattern(inout vec2 weights,const in vec4 texCoord,const in vec2 d){\n#if !defined(DISABLE_CORNER_DETECTION)\nvec2 leftRight=step(d.xy,d.yx);vec2 rounding=(1.0-CORNER_ROUNDING_NORM)*leftRight;rounding/=leftRight.x+leftRight.y;vec2 factor=vec2(1.0);factor.x-=rounding.x*sampleLevelZeroOffset(inputBuffer,texCoord.xy,vec2(1,0)).g;factor.x-=rounding.y*sampleLevelZeroOffset(inputBuffer,texCoord.zw,vec2(1,1)).g;factor.y-=rounding.x*sampleLevelZeroOffset(inputBuffer,texCoord.xy,vec2(-2,0)).g;factor.y-=rounding.y*sampleLevelZeroOffset(inputBuffer,texCoord.zw,vec2(-2,1)).g;weights*=clamp(factor,0.0,1.0);\n#endif\n}void main(){vec4 weights=vec4(0.0);vec4 subsampleIndices=vec4(0.0);vec2 e=texture2D(inputBuffer,vUv).rg;if(e.g>0.0){\n#if !defined(DISABLE_DIAG_DETECTION)\n/*Diagonals have both north and west edges,so searching for them in one ofthe boundaries is enough.*/weights.rg=calculateDiagWeights(vUv,e,subsampleIndices);if(weights.r==-weights.g){\n#endif\nvec2 d;vec3 coords;coords.x=searchXLeft(vOffset[0].xy,vOffset[2].x);coords.y=vOffset[1].y;d.x=coords.x;/*Now fetch the left crossing edges,two at a time using bilinearfiltering. Sampling at-0.25(see @CROSSING_OFFSET)enables to discern whatvalue each edge has.*/float e1=texture2D(inputBuffer,coords.xy).r;coords.z=searchXRight(vOffset[0].zw,vOffset[2].y);d.y=coords.z;/*Translate distances to pixel units for better interleave arithmetic andmemory accesses.*/d=round(resolution.xx*d+-vPixCoord.xx);vec2 sqrtD=sqrt(abs(d));float e2=sampleLevelZeroOffset(inputBuffer,coords.zy,vec2(1,0)).r;weights.rg=area(sqrtD,e1,e2,subsampleIndices.y);coords.y=vUv.y;detectHorizontalCornerPattern(weights.rg,coords.xyzy,d);\n#if !defined(DISABLE_DIAG_DETECTION)\n}else{e.r=0.0;}\n#endif\n}if(e.r>0.0){vec2 d;vec3 coords;coords.y=searchYUp(vOffset[1].xy,vOffset[2].z);coords.x=vOffset[0].x;d.x=coords.y;float e1=texture2D(inputBuffer,coords.xy).g;coords.z=searchYDown(vOffset[1].zw,vOffset[2].w);d.y=coords.z;d=round(resolution.yy*d-vPixCoord.yy);vec2 sqrtD=sqrt(abs(d));float e2=sampleLevelZeroOffset(inputBuffer,coords.xz,vec2(0,1)).g;weights.ba=area(sqrtD,e1,e2,subsampleIndices.x);coords.x=vUv.x;detectVerticalCornerPattern(weights.ba,coords.xyxz,d);}gl_FragColor=weights;}";

	var vertexShader$6 = "uniform vec2 texelSize;uniform vec2 resolution;varying vec2 vUv;varying vec4 vOffset[3];varying vec2 vPixCoord;void main(){vUv=position.xy*0.5+0.5;vPixCoord=vUv*resolution;vOffset[0]=vUv.xyxy+texelSize.xyxy*vec4(-0.25,-0.125,1.25,-0.125);vOffset[1]=vUv.xyxy+texelSize.xyxy*vec4(-0.125,-0.25,-0.125,1.25);vOffset[2]=vec4(vOffset[0].xz,vOffset[1].yw)+vec4(-2.0,2.0,-2.0,2.0)*texelSize.xxyy*MAX_SEARCH_STEPS_FLOAT;gl_Position=vec4(position.xy,1.0,1.0);}";

	/**
	 * Subpixel Morphological Antialiasing.
	 *
	 * This material computes weights for detected edges.
	 */

	var SMAAWeightsMaterial = /*@__PURE__*/(function (ShaderMaterial) {
		function SMAAWeightsMaterial(texelSize, resolution) {
			if ( texelSize === void 0 ) texelSize = new three.Vector2();
			if ( resolution === void 0 ) resolution = new three.Vector2();


			ShaderMaterial.call(this, {

				type: "SMAAWeightsMaterial",

				defines: {

					// Configurable settings:
					MAX_SEARCH_STEPS_INT: "16",
					MAX_SEARCH_STEPS_FLOAT: "16.0",
					MAX_SEARCH_STEPS_DIAG_INT: "8",
					MAX_SEARCH_STEPS_DIAG_FLOAT: "8.0",
					CORNER_ROUNDING: "25",
					CORNER_ROUNDING_NORM: "0.25",

					// Non-configurable settings:
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

				fragmentShader: fragmentShader$c,
				vertexShader: vertexShader$6,

				depthWrite: false,
				depthTest: false

			});

			/** @ignore */
			this.toneMapped = false;

		}

		if ( ShaderMaterial ) SMAAWeightsMaterial.__proto__ = ShaderMaterial;
		SMAAWeightsMaterial.prototype = Object.create( ShaderMaterial && ShaderMaterial.prototype );
		SMAAWeightsMaterial.prototype.constructor = SMAAWeightsMaterial;

		var prototypeAccessors = { diagonalDetection: { configurable: true },cornerRounding: { configurable: true } };

		/**
		 * Sets the maximum amount of steps performed in the horizontal/vertical
		 * pattern searches, at each side of the pixel.
		 *
		 * In number of pixels, it's actually the double. So the maximum line length
		 * perfectly handled by, for example 16, is 64 (perfectly means that longer
		 * lines won't look as good, but are still antialiased).
		 *
		 * @param {Number} steps - The search steps. Range: [0, 112].
		 */

		SMAAWeightsMaterial.prototype.setOrthogonalSearchSteps = function setOrthogonalSearchSteps (steps) {

			var s = Math.min(Math.max(steps, 0), 112);

			this.defines.MAX_SEARCH_STEPS_INT = s.toFixed("0");
			this.defines.MAX_SEARCH_STEPS_FLOAT = s.toFixed("1");
			this.needsUpdate = true;

		};

		/**
		 * Specifies the maximum steps performed in the diagonal pattern searches, at
		 * each side of the pixel. This search jumps one pixel at time.
		 *
		 * On high-end machines this search is cheap (between 0.8x and 0.9x slower for
		 * 16 steps), but it can have a significant impact on older machines.
		 *
		 * @param {Number} steps - The search steps. Range: [0, 20].
		 */

		SMAAWeightsMaterial.prototype.setDiagonalSearchSteps = function setDiagonalSearchSteps (steps) {

			var s = Math.min(Math.max(steps, 0), 20);

			this.defines.MAX_SEARCH_STEPS_DIAG_INT = s.toFixed("0");
			this.defines.MAX_SEARCH_STEPS_DIAG_FLOAT = s.toFixed("1");
			this.needsUpdate = true;

		};

		/**
		 * Specifies how much sharp corners will be rounded.
		 *
		 * @param {Number} rounding - The corner rounding amount. Range: [0, 100].
		 */

		SMAAWeightsMaterial.prototype.setCornerRounding = function setCornerRounding (rounding) {

			var r = Math.min(Math.max(rounding, 0), 100);

			this.defines.CORNER_ROUNDING = r.toFixed("4");
			this.defines.CORNER_ROUNDING_NORM = (r / 100.0).toFixed("4");
			this.needsUpdate = true;

		};

		/**
		 * Indicates whether diagonal pattern detection is enabled.
		 *
		 * @type {Boolean}
		 */

		prototypeAccessors.diagonalDetection.get = function () {

			return (this.defines.DISABLE_DIAG_DETECTION === undefined);

		};

		/**
		 * Enables or disables diagonal pattern detection.
		 *
		 * @type {Boolean}
		 */

		prototypeAccessors.diagonalDetection.set = function (value) {

			if(value) {

				delete this.defines.DISABLE_DIAG_DETECTION;

			} else {

				this.defines.DISABLE_DIAG_DETECTION = "1";

			}

			this.needsUpdate = true;

		};

		/**
		 * Indicates whether corner rounding is enabled.
		 *
		 * @type {Boolean}
		 */

		prototypeAccessors.cornerRounding.get = function () {

			return (this.defines.DISABLE_CORNER_DETECTION === undefined);

		};

		/**
		 * Enables or disables corner rounding.
		 *
		 * @type {Boolean}
		 */

		prototypeAccessors.cornerRounding.set = function (value) {

			if(value) {

				delete this.defines.DISABLE_CORNER_DETECTION;

			} else {

				this.defines.DISABLE_CORNER_DETECTION = "1";

			}

			this.needsUpdate = true;

		};

		Object.defineProperties( SMAAWeightsMaterial.prototype, prototypeAccessors );

		return SMAAWeightsMaterial;
	}(three.ShaderMaterial));

	var fragmentShader$d = "#include <common>\n#include <packing>\n#ifdef GL_FRAGMENT_PRECISION_HIGH\nuniform highp sampler2D normalDepthBuffer;\n#else\nuniform mediump sampler2D normalDepthBuffer;\n#endif\n#ifndef NORMAL_DEPTH\nuniform sampler2D normalBuffer;float readDepth(const in vec2 uv){\n#if DEPTH_PACKING == 3201\nreturn unpackRGBAToDepth(texture2D(normalDepthBuffer,uv));\n#else\nreturn texture2D(normalDepthBuffer,uv).r;\n#endif\n}\n#endif\nuniform sampler2D noiseTexture;uniform mat4 inverseProjectionMatrix;uniform mat4 projectionMatrix;uniform vec2 texelSize;uniform float cameraNear;uniform float cameraFar;uniform float minRadiusScale;uniform float intensity;uniform float fade;uniform float bias;uniform vec2 distanceCutoff;uniform vec2 proximityCutoff;varying vec2 vUv;varying vec2 vUv2;float getViewZ(const in float depth){\n#ifdef PERSPECTIVE_CAMERA\nreturn perspectiveDepthToViewZ(depth,cameraNear,cameraFar);\n#else\nreturn orthographicDepthToViewZ(depth,cameraNear,cameraFar);\n#endif\n}vec3 getViewPosition(const in vec2 screenPosition,const in float depth,const in float viewZ){float clipW=projectionMatrix[2][3]*viewZ+projectionMatrix[3][3];vec4 clipPosition=vec4((vec3(screenPosition,depth)-0.5)*2.0,1.0);clipPosition*=clipW;return(inverseProjectionMatrix*clipPosition).xyz;}float getAmbientOcclusion(const in vec3 p,const in vec3 n,const in float depth,const in vec2 uv){\n#ifdef DISTANCE_SCALING\nfloat radiusScale=1.0-smoothstep(0.0,distanceCutoff.y,depth);radiusScale=radiusScale*(1.0-minRadiusScale)+minRadiusScale;float radius=RADIUS*radiusScale;\n#else\nfloat radius=RADIUS;\n#endif\nfloat noise=texture2D(noiseTexture,vUv2).r;float baseAngle=noise*PI2;float inv_samples=1.0/SAMPLES_FLOAT;float rings=SPIRAL_TURNS*PI2;float occlusion=0.0;int taps=0;for(int i=0;i<SAMPLES_INT;++i){float alpha=(float(i)+0.5)*inv_samples;float angle=alpha*rings+baseAngle;vec2 coord=alpha*radius*vec2(cos(angle),sin(angle))*texelSize+uv;if(coord.s<0.0||coord.s>1.0||coord.t<0.0||coord.t>1.0){continue;}\n#ifdef NORMAL_DEPTH\nfloat sampleDepth=texture2D(normalDepthBuffer,coord).a;\n#else\nfloat sampleDepth=readDepth(coord);\n#endif\nfloat viewZ=getViewZ(sampleDepth);\n#ifdef PERSPECTIVE_CAMERA\nfloat linearSampleDepth=viewZToOrthographicDepth(viewZ,cameraNear,cameraFar);\n#else\nfloat linearSampleDepth=sampleDepth;\n#endif\nfloat proximity=abs(depth-linearSampleDepth);if(proximity<proximityCutoff.y){float falloff=1.0-smoothstep(proximityCutoff.x,proximityCutoff.y,proximity);vec3 Q=getViewPosition(coord,sampleDepth,viewZ);vec3 v=Q-p;float vv=dot(v,v);float vn=dot(v,n)-bias;float f=max(RADIUS_SQ-vv,0.0)/RADIUS_SQ;occlusion+=(f*f*f*max(vn/(fade+vv),0.0))*falloff;}++taps;}return occlusion/(4.0*max(float(taps),1.0));}void main(){\n#ifdef NORMAL_DEPTH\nvec4 normalDepth=texture2D(normalDepthBuffer,vUv);\n#else\nvec4 normalDepth=vec4(texture2D(normalBuffer,vUv).rgb,readDepth(vUv));\n#endif\nfloat ao=1.0;float depth=normalDepth.a;float viewZ=getViewZ(depth);\n#ifdef PERSPECTIVE_CAMERA\nfloat linearDepth=viewZToOrthographicDepth(viewZ,cameraNear,cameraFar);\n#else\nfloat linearDepth=depth;\n#endif\nif(linearDepth<distanceCutoff.y){vec3 viewPosition=getViewPosition(vUv,depth,viewZ);vec3 viewNormal=unpackRGBToNormal(normalDepth.rgb);ao-=getAmbientOcclusion(viewPosition,viewNormal,linearDepth,vUv);float d=smoothstep(distanceCutoff.x,distanceCutoff.y,linearDepth);ao=mix(ao,1.0,d);ao=clamp(pow(ao,abs(intensity)),0.0,1.0);}gl_FragColor.r=ao;}";

	var vertexShader$7 = "uniform vec2 noiseScale;varying vec2 vUv;varying vec2 vUv2;void main(){vUv=position.xy*0.5+0.5;vUv2=vUv*noiseScale;gl_Position=vec4(position.xy,1.0,1.0);}";

	/**
	 * A Screen Space Ambient Occlusion (SSAO) shader material.
	 */

	var SSAOMaterial = /*@__PURE__*/(function (ShaderMaterial) {
		function SSAOMaterial(camera) {

			ShaderMaterial.call(this, {

				type: "SSAOMaterial",

				defines: {
					SAMPLES_INT: "0",
					SAMPLES_FLOAT: "0.0",
					SPIRAL_TURNS: "0.0",
					RADIUS: "1.0",
					RADIUS_SQ: "1.0",
					DISTANCE_SCALING: "1",
					DEPTH_PACKING: "0"
				},

				uniforms: {

					normalBuffer: new three.Uniform(null),
					normalDepthBuffer: new three.Uniform(null),
					noiseTexture: new three.Uniform(null),

					inverseProjectionMatrix: new three.Uniform(new three.Matrix4()),
					projectionMatrix: new three.Uniform(new three.Matrix4()),
					texelSize: new three.Uniform(new three.Vector2()),
					cameraNear: new three.Uniform(0.0),
					cameraFar: new three.Uniform(0.0),

					distanceCutoff: new three.Uniform(new three.Vector2()),
					proximityCutoff: new three.Uniform(new three.Vector2()),
					noiseScale: new three.Uniform(new three.Vector2()),
					minRadiusScale: new three.Uniform(0.33),
					intensity: new three.Uniform(1.0),
					fade: new three.Uniform(0.01),
					bias: new three.Uniform(0.0)

				},

				fragmentShader: fragmentShader$d,
				vertexShader: vertexShader$7,

				depthWrite: false,
				depthTest: false

			});

			/** @ignore */
			this.toneMapped = false;

			this.adoptCameraSettings(camera);

		}

		if ( ShaderMaterial ) SSAOMaterial.__proto__ = ShaderMaterial;
		SSAOMaterial.prototype = Object.create( ShaderMaterial && ShaderMaterial.prototype );
		SSAOMaterial.prototype.constructor = SSAOMaterial;

		var prototypeAccessors = { depthPacking: { configurable: true } };

		/**
		 * The depth packing of the source depth buffer.
		 *
		 * @type {Number}
		 */

		prototypeAccessors.depthPacking.get = function () {

			return Number(this.defines.DEPTH_PACKING);

		};

		/**
		 * Sets the depth packing.
		 *
		 * @type {Number}
		 */

		prototypeAccessors.depthPacking.set = function (value) {

			this.defines.DEPTH_PACKING = value.toFixed(0);
			this.needsUpdate = true;

		};

		/**
		 * Sets the texel size.
		 *
		 * @param {Number} x - The texel width.
		 * @param {Number} y - The texel height.
		 */

		SSAOMaterial.prototype.setTexelSize = function setTexelSize (x, y) {

			this.uniforms.texelSize.value.set(x, y);

		};

		/**
		 * Adopts the settings of the given camera.
		 *
		 * @param {Camera} [camera=null] - A camera.
		 */

		SSAOMaterial.prototype.adoptCameraSettings = function adoptCameraSettings (camera) {
			if ( camera === void 0 ) camera = null;


			if(camera !== null) {

				var uniforms = this.uniforms;

				uniforms.cameraNear.value = camera.near;
				uniforms.cameraFar.value = camera.far;

				if(camera instanceof three.PerspectiveCamera) {

					this.defines.PERSPECTIVE_CAMERA = "1";

				} else {

					delete this.defines.PERSPECTIVE_CAMERA;

				}

				this.needsUpdate = true;

			}

		};

		Object.defineProperties( SSAOMaterial.prototype, prototypeAccessors );

		return SSAOMaterial;
	}(three.ShaderMaterial));

	/**
	 * An auto sizing constant.
	 *
	 * @type {Number}
	 * @private
	 */

	var AUTO_SIZE = -1;

	/**
	 * A resizer that can be used to store a base and a target resolution.
	 *
	 * The attached resizeable will be updated with the base resolution when the
	 * target resolution changes. The new calculated resolution can then be
	 * retrieved via {@link Resizer.width} and {@link Resizer.height}.
	 */

	var Resizer = function Resizer(resizable, width, height, scale) {
		if ( width === void 0 ) width = AUTO_SIZE;
		if ( height === void 0 ) height = AUTO_SIZE;
		if ( scale === void 0 ) scale = 1.0;


		/**
			 * A resizable object.
			 *
			 * @type {Resizable}
			 */

		this.resizable = resizable;

		/**
			 * The base size.
			 *
			 * This size will be passed to the resizable object every time the target
			 * width, height or scale is changed.
			 *
			 * @type {Vector2}
			 */

		this.base = new three.Vector2(1, 1);

		/**
			 * The target size.
			 *
			 * @type {Vector2}
			 * @private
			 */

		this.target = new three.Vector2(width, height);

		/**
			 * A scale.
			 *
			 * If both the width and the height are set to {@link Resizer.AUTO_SIZE},
			 * they will be scaled uniformly using this scalar.
			 *
			 * @type {Number}
			 * @private
			 */

		this.s = scale;

	};

	var prototypeAccessors = { scale: { configurable: true },width: { configurable: true },height: { configurable: true } };
	var staticAccessors = { AUTO_SIZE: { configurable: true } };

	/**
		 * The current resolution scale.
		 *
		 * @type {Number}
		 */

	prototypeAccessors.scale.get = function () {

		return this.s;

	};

	/**
		 * Sets the resolution scale.
		 *
		 * Also sets the width and height to {@link Resizer.AUTO_SIZE}.
		 *
		 * @type {Number}
		 */

	prototypeAccessors.scale.set = function (value) {

		this.s = value;

		this.target.x = AUTO_SIZE;
		this.target.y = AUTO_SIZE;

		this.resizable.setSize(this.base.x, this.base.y);

	};

	/**
		 * The calculated width.
		 *
		 * If both the width and the height are set to {@link Resizer.AUTO_SIZE}, the
		 * base width will be returned.
		 *
		 * @type {Number}
		 */

	prototypeAccessors.width.get = function () {

		var base = this.base;
		var target = this.target;

		var result;

		if(target.x !== AUTO_SIZE) {

			result = target.x;

		} else if(target.y !== AUTO_SIZE) {

			result = Math.round(target.y * (base.x / base.y));

		} else {

			result = Math.round(base.x * this.s);

		}

		return result;

	};

	/**
		 * Sets the target width.
		 *
		 * Use {@link Resizer.AUTO_SIZE} to automatically calculate the width based
		 * on the height and the original aspect ratio.
		 *
		 * @type {Number}
		 */

	prototypeAccessors.width.set = function (value) {

		this.target.x = value;
		this.resizable.setSize(this.base.x, this.base.y);

	};

	/**
		 * The calculated height.
		 *
		 * If both the width and the height are set to {@link Resizer.AUTO_SIZE}, the
		 * base height will be returned.
		 *
		 * @type {Number}
		 */

	prototypeAccessors.height.get = function () {

		var base = this.base;
		var target = this.target;

		var result;

		if(target.y !== AUTO_SIZE) {

			result = target.y;

		} else if(target.x !== AUTO_SIZE) {

			result = Math.round(target.x / (base.x / base.y));

		} else {

			result = Math.round(base.y * this.s);

		}

		return result;

	};

	/**
		 * Sets the target height.
		 *
		 * Use {@link Resizer.AUTO_SIZE} to automatically calculate the height based
		 * on the width and the original aspect ratio.
		 *
		 * @type {Number}
		 */

	prototypeAccessors.height.set = function (value) {

		this.target.y = value;
		this.resizable.setSize(this.base.x, this.base.y);

	};

	/**
		 * An auto sizing constant.
		 *
		 * Can be used to automatically calculate the width or height based on the
		 * original aspect ratio.
		 *
		 * @type {Number}
		 */

	staticAccessors.AUTO_SIZE.get = function () {

		return AUTO_SIZE;

	};

	Object.defineProperties( Resizer.prototype, prototypeAccessors );
	Object.defineProperties( Resizer, staticAccessors );

	/**
	 * A dummy camera
	 *
	 * @type {Camera}
	 * @private
	 */

	var dummyCamera = new three.Camera();

	/**
	 * Shared fullscreen geometry.
	 *
	 * @type {BufferGeometry}
	 * @private
	 */

	var geometry = null;

	/**
	 * Returns a shared fullscreen triangle.
	 *
	 * The size of the screen is 2x2 units (NDC). A triangle that fills the screen
	 * needs to be 4 units wide and 4 units tall.
	 *
	 * @private
	 * @return {BufferGeometry} The fullscreen geometry.
	 */

	function getFullscreenTriangle() {

		if(geometry === null) {

			var vertices = new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]);
			var uvs = new Float32Array([0, 0, 2, 0, 0, 2]);
			geometry = new three.BufferGeometry();

			// Added for backward compatibility (setAttribute was added in three r110).
			if(geometry.setAttribute !== undefined) {

				geometry.setAttribute("position", new three.BufferAttribute(vertices, 3));
				geometry.setAttribute("uv", new three.BufferAttribute(uvs, 2));

			} else {

				geometry.addAttribute("position", new three.BufferAttribute(vertices, 3));
				geometry.addAttribute("uv", new three.BufferAttribute(uvs, 2));

			}

		}

		return geometry;

	}

	/**
	 * An abstract pass.
	 *
	 * Passes that do not rely on the depth buffer should explicitly disable the
	 * depth test and depth write flags of their fullscreen shader material.
	 *
	 * Fullscreen passes use a shared fullscreen triangle:
	 * https://michaldrobot.com/2014/04/01/gcn-execution-patterns-in-full-screen-passes/
	 *
	 * @implements {Initializable}
	 * @implements {Resizable}
	 * @implements {Disposable}
	 */

	var Pass = function Pass(name, scene, camera) {
		if ( name === void 0 ) name = "Pass";
		if ( scene === void 0 ) scene = new three.Scene();
		if ( camera === void 0 ) camera = dummyCamera;


		/**
			 * The name of this pass.
			 *
			 * @type {String}
			 */

		this.name = name;

		/**
			 * The scene to render.
			 *
			 * @type {Scene}
			 * @protected
			 */

		this.scene = scene;

		/**
			 * The camera.
			 *
			 * @type {Camera}
			 * @protected
			 */

		this.camera = camera;

		/**
			 * A mesh that fills the screen.
			 *
			 * @type {Mesh}
			 * @private
			 */

		this.screen = null;

		/**
			 * Indicates whether this pass should render to texture.
			 *
			 * @type {Boolean}
			 * @private
			 */

		this.rtt = true;

		/**
			 * Only relevant for subclassing.
			 *
			 * Indicates whether the {@link EffectComposer} should swap the frame
			 * buffers after this pass has finished rendering.
			 *
			 * Set this to `false` if this pass doesn't render to the output buffer or
			 * the screen. Otherwise, the contents of the input buffer will be lost.
			 *
			 * @type {Boolean}
			 */

		this.needsSwap = true;

		/**
			 * Only relevant for subclassing.
			 *
			 * Indicates whether the {@link EffectComposer} should prepare a depth
			 * texture for this pass.
			 *
			 * Set this to `true` if this pass relies on depth information from a
			 * preceding {@link RenderPass}.
			 *
			 * @type {Boolean}
			 */

		this.needsDepthTexture = false;

		/**
			 * Indicates whether this pass should be executed.
			 *
			 * @type {Boolean}
			 */

		this.enabled = true;

	};

	var prototypeAccessors$1 = { renderToScreen: { configurable: true } };

	/**
		 * Indicates whether this pass should render to screen.
		 *
		 * @type {Boolean}
		 */

	prototypeAccessors$1.renderToScreen.get = function () {

		return !this.rtt;

	};

	/**
		 * Sets the render to screen flag.
		 *
		 * If the flag is changed to a different value, the fullscreen material will
		 * be updated as well.
		 *
		 * @type {Boolean}
		 */

	prototypeAccessors$1.renderToScreen.set = function (value) {

		if(this.rtt === value) {

			var material = this.getFullscreenMaterial();

			if(material !== null) {

				material.needsUpdate = true;

			}

			this.rtt = !value;

		}

	};

	/**
		 * Returns the current fullscreen material.
		 *
		 * @return {Material} The current fullscreen material, or null if there is none.
		 */

	Pass.prototype.getFullscreenMaterial = function getFullscreenMaterial () {

		return (this.screen !== null) ? this.screen.material : null;

	};

	/**
		 * Sets the fullscreen material.
		 *
		 * The material will be assigned to a mesh that fills the screen. The mesh
		 * will be created once a material is assigned via this method.
		 *
		 * @protected
		 * @param {Material} material - A fullscreen material.
		 */

	Pass.prototype.setFullscreenMaterial = function setFullscreenMaterial (material) {

		var screen = this.screen;

		if(screen !== null) {

			screen.material = material;

		} else {

			screen = new three.Mesh(getFullscreenTriangle(), material);
			screen.frustumCulled = false;

			if(this.scene === null) {

				this.scene = new three.Scene();

			}

			this.scene.add(screen);
			this.screen = screen;

		}

	};

	/**
		 * Returns the current depth texture.
		 *
		 * @return {Texture} The current depth texture, or null if there is none.
		 */

	Pass.prototype.getDepthTexture = function getDepthTexture () {

		return null;

	};

	/**
		 * Sets the depth texture.
		 *
		 * This method will be called automatically by the {@link EffectComposer}.
		 *
		 * You may override this method if your pass relies on the depth information
		 * of a preceding {@link RenderPass}.
		 *
		 * @param {Texture} depthTexture - A depth texture.
		 * @param {Number} [depthPacking=0] - The depth packing.
		 */

	Pass.prototype.setDepthTexture = function setDepthTexture (depthTexture, depthPacking) {
	};

	/**
		 * Renders the effect.
		 *
		 * This is an abstract method that must be overridden.
		 *
		 * @abstract
		 * @throws {Error} An error is thrown if the method is not overridden.
		 * @param {WebGLRenderer} renderer - The renderer.
		 * @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
		 * @param {WebGLRenderTarget} outputBuffer - A frame buffer that serves as the output render target unless this pass renders to screen.
		 * @param {Number} [deltaTime] - The time between the last frame and the current one in seconds.
		 * @param {Boolean} [stencilTest] - Indicates whether a stencil mask is active.
		 */

	Pass.prototype.render = function render (renderer, inputBuffer, outputBuffer, deltaTime, stencilTest) {

		throw new Error("Render method not implemented!");

	};

	/**
		 * Updates this pass with the renderer's size.
		 *
		 * You may override this method in case you want to be informed about the size
		 * of the main frame buffer.
		 *
		 * The {@link EffectComposer} calls this method before this pass is
		 * initialized and every time its own size is updated.
		 *
		 * @param {Number} width - The renderer's width.
		 * @param {Number} height - The renderer's height.
		 * @example this.myRenderTarget.setSize(width, height);
		 */

	Pass.prototype.setSize = function setSize (width, height) {};

	/**
		 * Performs initialization tasks.
		 *
		 * By overriding this method you gain access to the renderer. You'll also be
		 * able to configure your custom render targets to use the appropriate format
		 * (RGB or RGBA).
		 *
		 * The provided renderer can be used to warm up special off-screen render
		 * targets by performing a preliminary render operation.
		 *
		 * The {@link EffectComposer} calls this method when this pass is added to its
		 * queue, but not before its size has been set.
		 *
		 * @param {WebGLRenderer} renderer - The renderer.
		 * @param {Boolean} alpha - Whether the renderer uses the alpha channel or not.
		 * @param {Number} frameBufferType - The type of the main frame buffers.
		 * @example if(!alpha && frameBufferType === UnsignedByteType) { this.myRenderTarget.texture.format = RGBFormat; }
		 */

	Pass.prototype.initialize = function initialize (renderer, alpha, frameBufferType) {};

	/**
		 * Performs a shallow search for disposable properties and deletes them. The
		 * pass will be inoperative after this method was called!
		 *
		 * The {@link EffectComposer} calls this method when it is being destroyed.
		 * You may, however, use it independently to free memory when you are certain
		 * that you don't need this pass anymore.
		 */

	Pass.prototype.dispose = function dispose () {

		var material = this.getFullscreenMaterial();

		if(material !== null) {

			material.dispose();

		}

		for(var i = 0, list = Object.keys(this); i < list.length; i += 1) {

			var key = list[i];

				if(this[key] !== null && typeof this[key].dispose === "function") {

				/** @ignore */
				this[key].dispose();

			}

		}

	};

	Object.defineProperties( Pass.prototype, prototypeAccessors$1 );

	/**
	 * An efficient, incremental blur pass.
	 */

	var BlurPass = /*@__PURE__*/(function (Pass) {
		function BlurPass(ref) {
			if ( ref === void 0 ) ref = {};
			var resolutionScale = ref.resolutionScale; if ( resolutionScale === void 0 ) resolutionScale = 0.5;
			var width = ref.width; if ( width === void 0 ) width = Resizer.AUTO_SIZE;
			var height = ref.height; if ( height === void 0 ) height = Resizer.AUTO_SIZE;
			var kernelSize = ref.kernelSize; if ( kernelSize === void 0 ) kernelSize = KernelSize.LARGE;


			Pass.call(this, "BlurPass");

			/**
			 * A render target.
			 *
			 * @type {WebGLRenderTarget}
			 * @private
			 */

			this.renderTargetA = new three.WebGLRenderTarget(1, 1, {
				minFilter: three.LinearFilter,
				magFilter: three.LinearFilter,
				stencilBuffer: false,
				depthBuffer: false
			});

			this.renderTargetA.texture.name = "Blur.Target.A";

			/**
			 * A second render target.
			 *
			 * @type {WebGLRenderTarget}
			 * @private
			 */

			this.renderTargetB = this.renderTargetA.clone();
			this.renderTargetB.texture.name = "Blur.Target.B";

			/**
			 * The render resolution.
			 *
			 * It's recommended to set the height or the width to an absolute value for
			 * consistent results across different devices and resolutions.
			 *
			 * @type {Resizer}
			 */

			this.resolution = new Resizer(this, width, height, resolutionScale);

			/**
			 * A convolution shader material.
			 *
			 * @type {ConvolutionMaterial}
			 * @private
			 */

			this.convolutionMaterial = new ConvolutionMaterial();

			/**
			 * A convolution shader material that uses dithering.
			 *
			 * @type {ConvolutionMaterial}
			 * @private
			 */

			this.ditheredConvolutionMaterial = new ConvolutionMaterial();
			this.ditheredConvolutionMaterial.dithering = true;

			/**
			 * Whether the blurred result should also be dithered using noise.
			 *
			 * @type {Boolean}
			 * @deprecated Set the frameBufferType of the EffectComposer to HalfFloatType instead.
			 */

			this.dithering = false;

			this.kernelSize = kernelSize;

		}

		if ( Pass ) BlurPass.__proto__ = Pass;
		BlurPass.prototype = Object.create( Pass && Pass.prototype );
		BlurPass.prototype.constructor = BlurPass;

		var prototypeAccessors = { width: { configurable: true },height: { configurable: true },scale: { configurable: true },kernelSize: { configurable: true } };
		var staticAccessors = { AUTO_SIZE: { configurable: true } };

		/**
		 * The current width of the internal render targets.
		 *
		 * @type {Number}
		 * @deprecated Use resolution.width instead.
		 */

		prototypeAccessors.width.get = function () {

			return this.resolution.width;

		};

		/**
		 * Sets the render width.
		 *
		 * @type {Number}
		 * @deprecated Use resolution.width instead.
		 */

		prototypeAccessors.width.set = function (value) {

			this.resolution.width = value;

		};

		/**
		 * The current height of the internal render targets.
		 *
		 * @type {Number}
		 * @deprecated Use resolution.height instead.
		 */

		prototypeAccessors.height.get = function () {

			return this.resolution.height;

		};

		/**
		 * Sets the render height.
		 *
		 * @type {Number}
		 * @deprecated Use resolution.height instead.
		 */

		prototypeAccessors.height.set = function (value) {

			this.resolution.height = value;

		};

		/**
		 * The current blur scale.
		 *
		 * @type {Number}
		 */

		prototypeAccessors.scale.get = function () {

			return this.convolutionMaterial.uniforms.scale.value;

		};

		/**
		 * Sets the blur scale.
		 *
		 * This value influences the overall blur strength and should not be greater
		 * than 1. For larger blurs please increase the {@link kernelSize}!
		 *
		 * Note that the blur strength is closely tied to the resolution. For a smooth
		 * transition from no blur to full blur, set the width or the height to a high
		 * enough value.
		 *
		 * @type {Number}
		 */

		prototypeAccessors.scale.set = function (value) {

			this.convolutionMaterial.uniforms.scale.value = value;
			this.ditheredConvolutionMaterial.uniforms.scale.value = value;

		};

		/**
		 * The kernel size.
		 *
		 * @type {KernelSize}
		 */

		prototypeAccessors.kernelSize.get = function () {

			return this.convolutionMaterial.kernelSize;

		};

		/**
		 * Sets the kernel size.
		 *
		 * Larger kernels require more processing power but scale well with larger
		 * render resolutions.
		 *
		 * @type {KernelSize}
		 */

		prototypeAccessors.kernelSize.set = function (value) {

			this.convolutionMaterial.kernelSize = value;
			this.ditheredConvolutionMaterial.kernelSize = value;

		};

		/**
		 * Returns the current resolution scale.
		 *
		 * @return {Number} The resolution scale.
		 * @deprecated Adjust the fixed resolution width or height instead.
		 */

		BlurPass.prototype.getResolutionScale = function getResolutionScale () {

			return this.resolution.scale;

		};

		/**
		 * Sets the resolution scale.
		 *
		 * @param {Number} scale - The new resolution scale.
		 * @deprecated Adjust the fixed resolution width or height instead.
		 */

		BlurPass.prototype.setResolutionScale = function setResolutionScale (scale) {

			this.resolution.scale = scale;

		};

		/**
		 * Blurs the input buffer and writes the result to the output buffer. The
		 * input buffer remains intact, unless it's also the output buffer.
		 *
		 * @param {WebGLRenderer} renderer - The renderer.
		 * @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
		 * @param {WebGLRenderTarget} outputBuffer - A frame buffer that serves as the output render target unless this pass renders to screen.
		 * @param {Number} [deltaTime] - The time between the last frame and the current one in seconds.
		 * @param {Boolean} [stencilTest] - Indicates whether a stencil mask is active.
		 */

		BlurPass.prototype.render = function render (renderer, inputBuffer, outputBuffer, deltaTime, stencilTest) {

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

			// Apply the multi-pass blur.
			for(i = 0, l = kernel.length - 1; i < l; ++i) {

				// Alternate between targets.
				destRT = ((i & 1) === 0) ? renderTargetA : renderTargetB;

				uniforms.kernel.value = kernel[i];
				uniforms.inputBuffer.value = lastRT.texture;
				renderer.setRenderTarget(destRT);
				renderer.render(scene, camera);

				lastRT = destRT;

			}

			if(this.dithering) {

				material = this.ditheredConvolutionMaterial;
				uniforms = material.uniforms;
				this.setFullscreenMaterial(material);

			}

			uniforms.kernel.value = kernel[i];
			uniforms.inputBuffer.value = lastRT.texture;
			renderer.setRenderTarget(this.renderToScreen ? null : outputBuffer);
			renderer.render(scene, camera);

		};

		/**
		 * Updates the size of this pass.
		 *
		 * @param {Number} width - The width.
		 * @param {Number} height - The height.
		 */

		BlurPass.prototype.setSize = function setSize (width, height) {

			var resolution = this.resolution;
			resolution.base.set(width, height);

			var w = resolution.width;
			var h = resolution.height;

			this.renderTargetA.setSize(w, h);
			this.renderTargetB.setSize(w, h);

			this.convolutionMaterial.setTexelSize(1.0 / w, 1.0 / h);
			this.ditheredConvolutionMaterial.setTexelSize(1.0 / w, 1.0 / h);

		};

		/**
		 * Performs initialization tasks.
		 *
		 * @param {WebGLRenderer} renderer - The renderer.
		 * @param {Boolean} alpha - Whether the renderer uses the alpha channel or not.
		 * @param {Number} frameBufferType - The type of the main frame buffers.
		 */

		BlurPass.prototype.initialize = function initialize (renderer, alpha, frameBufferType) {

			if(!alpha && frameBufferType === three.UnsignedByteType) {

				this.renderTargetA.texture.format = three.RGBFormat;
				this.renderTargetB.texture.format = three.RGBFormat;

			}

			if(frameBufferType !== undefined) {

				this.renderTargetA.texture.type = frameBufferType;
				this.renderTargetB.texture.type = frameBufferType;

			}

		};

		/**
		 * An auto sizing flag.
		 *
		 * @type {Number}
		 * @deprecated Use {@link Resizer.AUTO_SIZE} instead.
		 */

		staticAccessors.AUTO_SIZE.get = function () {

			return Resizer.AUTO_SIZE;

		};

		Object.defineProperties( BlurPass.prototype, prototypeAccessors );
		Object.defineProperties( BlurPass, staticAccessors );

		return BlurPass;
	}(Pass));

	/**
	 * A pass that disables the stencil test.
	 */

	var ClearMaskPass = /*@__PURE__*/(function (Pass) {
		function ClearMaskPass() {

			Pass.call(this, "ClearMaskPass", null, null);

			this.needsSwap = false;

		}

		if ( Pass ) ClearMaskPass.__proto__ = Pass;
		ClearMaskPass.prototype = Object.create( Pass && Pass.prototype );
		ClearMaskPass.prototype.constructor = ClearMaskPass;

		/**
		 * Disables the global stencil test.
		 *
		 * @param {WebGLRenderer} renderer - The renderer.
		 * @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
		 * @param {WebGLRenderTarget} outputBuffer - A frame buffer that serves as the output render target unless this pass renders to screen.
		 * @param {Number} [deltaTime] - The time between the last frame and the current one in seconds.
		 * @param {Boolean} [stencilTest] - Indicates whether a stencil mask is active.
		 */

		ClearMaskPass.prototype.render = function render (renderer, inputBuffer, outputBuffer, deltaTime, stencilTest) {

			var stencil = renderer.state.buffers.stencil;

			stencil.setLocked(false);
			stencil.setTest(false);

		};

		return ClearMaskPass;
	}(Pass));

	/**
	 * Stores the original clear color of the renderer.
	 *
	 * @type {Color}
	 * @private
	 */

	var color = new three.Color();

	/**
	 * A pass that clears the input buffer or the screen.
	 */

	var ClearPass = /*@__PURE__*/(function (Pass) {
		function ClearPass(color, depth, stencil) {
			if ( color === void 0 ) color = true;
			if ( depth === void 0 ) depth = true;
			if ( stencil === void 0 ) stencil = false;


			Pass.call(this, "ClearPass", null, null);

			this.needsSwap = false;

			/**
			 * Indicates whether the color buffer should be cleared.
			 *
			 * @type {Boolean}
			 */

			this.color = color;

			/**
			 * Indicates whether the depth buffer should be cleared.
			 *
			 * @type {Boolean}
			 */

			this.depth = depth;

			/**
			 * Indicates whether the stencil buffer should be cleared.
			 *
			 * @type {Boolean}
			 */

			this.stencil = stencil;

			/**
			 * An override clear color.
			 *
			 * The default value is null.
			 *
			 * @type {Color}
			 */

			this.overrideClearColor = null;

			/**
			 * An override clear alpha.
			 *
			 * The default value is -1.
			 *
			 * @type {Number}
			 */

			this.overrideClearAlpha = -1.0;

		}

		if ( Pass ) ClearPass.__proto__ = Pass;
		ClearPass.prototype = Object.create( Pass && Pass.prototype );
		ClearPass.prototype.constructor = ClearPass;

		/**
		 * Clears the input buffer or the screen.
		 *
		 * @param {WebGLRenderer} renderer - The renderer.
		 * @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
		 * @param {WebGLRenderTarget} outputBuffer - A frame buffer that serves as the output render target unless this pass renders to screen.
		 * @param {Number} [deltaTime] - The time between the last frame and the current one in seconds.
		 * @param {Boolean} [stencilTest] - Indicates whether a stencil mask is active.
		 */

		ClearPass.prototype.render = function render (renderer, inputBuffer, outputBuffer, deltaTime, stencilTest) {

			var overrideClearColor = this.overrideClearColor;
			var overrideClearAlpha = this.overrideClearAlpha;
			var clearAlpha = renderer.getClearAlpha();

			var hasOverrideClearColor = (overrideClearColor !== null);
			var hasOverrideClearAlpha = (overrideClearAlpha >= 0.0);

			if(hasOverrideClearColor) {

				color.copy(renderer.getClearColor());
				renderer.setClearColor(overrideClearColor, hasOverrideClearAlpha ?
					overrideClearAlpha : clearAlpha);

			} else if(hasOverrideClearAlpha) {

				renderer.setClearAlpha(overrideClearAlpha);

			}

			renderer.setRenderTarget(this.renderToScreen ? null : inputBuffer);
			renderer.clear(this.color, this.depth, this.stencil);

			if(hasOverrideClearColor) {

				renderer.setClearColor(color, clearAlpha);

			} else if(hasOverrideClearAlpha) {

				renderer.setClearAlpha(clearAlpha);

			}

		};

		return ClearPass;
	}(Pass));

	/**
	 * A flag that indicates whether the override material workaround is enabled.
	 *
	 * @type {Boolean}
	 * @private
	 */

	var workaroundEnabled = false;

	/**
	 * An override material manager.
	 *
	 * Includes a workaround that fixes override materials for skinned meshes and
	 * instancing. Doesn't fix uniforms such as normal maps and displacement maps.
	 * Using the workaround may have a negative impact on performance if the scene
	 * contains a lot of meshes.
	 *
	 * @implements {Disposable}
	 */

	var OverrideMaterialManager = function OverrideMaterialManager(material) {
		if ( material === void 0 ) material = null;


		/**
			 * Keeps track of original materials.
			 *
			 * @type {Map<Object3D, Material>}
			 * @private
			 */

		this.originalMaterials = new Map();

		/**
			 * The override material.
			 *
			 * @type {Material}
			 * @private
			 */

		this.material = null;

		/**
			 * A clone of the override material.
			 *
			 * @type {Material}
			 * @private
			 */

		this.materialInstanced = null;

		/**
			 * A clone of the override material.
			 *
			 * @type {Material}
			 * @private
			 */

		this.materialSkinning = null;

		this.setMaterial(material);

	};

	var staticAccessors$1 = { workaroundEnabled: { configurable: true } };

	/**
		 * Sets the override material.
		 *
		 * @param {Material} material - The material.
		 */

	OverrideMaterialManager.prototype.setMaterial = function setMaterial (material) {

		this.disposeMaterials();

		if(material !== null) {

			this.material = material;

			this.materialInstanced = material.clone();
			this.materialInstanced.uniforms = Object.assign({}, material.uniforms);

			this.materialSkinning = material.clone();
			this.materialSkinning.uniforms = Object.assign({}, material.uniforms);
			this.materialSkinning.skinning = true;

		}

	};

	/**
		 * Renders the scene with the override material.
		 *
		 * @private
		 * @param {WebGLRenderer} renderer - The renderer.
		 * @param {Scene} scene - A scene.
		 * @param {Camera} camera - A camera.
		 */

	OverrideMaterialManager.prototype.render = function render (renderer, scene, camera) {

		var material = this.material;
		var materialSkinning = this.materialSkinning;
		var materialInstanced = this.materialInstanced;
		var originalMaterials = this.originalMaterials;

		// Ignore shadows.
		var shadowMapEnabled = renderer.shadowMap.enabled;
		renderer.shadowMap.enabled = false;

		if(workaroundEnabled) {

			var meshCount = 0;

			// Replace materials of all meshes with the correct override materials.
			scene.traverse(function (node) {

				if(node.isMesh) {

					originalMaterials.set(node, node.material);

					if(node.isInstancedMesh) {

						node.material = materialInstanced;

					} else if(node.isSkinnedMesh) {

						node.material = materialSkinning;

					} else {

						node.material = material;

					}

					++meshCount;

				}

			});

			renderer.render(scene, camera);

			for(var i = 0, list = originalMaterials; i < list.length; i += 1) {

				var entry = list[i];

					entry[0].material = entry[1];

			}

			if(meshCount !== originalMaterials.size) {

				originalMaterials.clear();

			}

		} else {

			var overrideMaterial = scene.overrideMaterial;
			scene.overrideMaterial = material;
			renderer.render(scene, camera);
			scene.overrideMaterial = overrideMaterial;

		}

		renderer.shadowMap.enabled = shadowMapEnabled;

	};

	/**
		 * Deletes cloned override materials.
		 *
		 * @private
		 */

	OverrideMaterialManager.prototype.disposeMaterials = function disposeMaterials () {

		if(this.materialInstanced !== null) {

			this.materialInstanced.dispose();

		}

		if(this.materialSkinning !== null) {

			this.materialSkinning.dispose();

		}

	};

	/**
		 * Performs cleanup tasks.
		 */

	OverrideMaterialManager.prototype.dispose = function dispose () {

		this.originalMaterials.clear();
		this.disposeMaterials();

	};

	/**
		 * Indicates whether the override material workaround is enabled.
		 *
		 * @type {Boolean}
		 */

	staticAccessors$1.workaroundEnabled.get = function () {

		return workaroundEnabled;

	};

	/**
		 * Enables or disables the override material workaround globally.
		 *
		 * This only affects post processing passes and effects.
		 *
		 * @type {Boolean}
		 */

	staticAccessors$1.workaroundEnabled.set = function (value) {

		workaroundEnabled = value;

	};

	Object.defineProperties( OverrideMaterialManager, staticAccessors$1 );

	/**
	 * A pass that renders a given scene into the input buffer or to screen.
	 *
	 * This pass uses a {@link ClearPass} to clear the target buffer.
	 */

	var RenderPass = /*@__PURE__*/(function (Pass) {
		function RenderPass(scene, camera, overrideMaterial) {
			if ( overrideMaterial === void 0 ) overrideMaterial = null;


			Pass.call(this, "RenderPass", scene, camera);

			this.needsSwap = false;

			/**
			 * A clear pass.
			 *
			 * @type {ClearPass}
			 * @private
			 */

			this.clearPass = new ClearPass();

			/**
			 * A depth texture.
			 *
			 * @type {DepthTexture}
			 * @private
			 */

			this.depthTexture = null;

			/**
			 * An override material manager.
			 *
			 * @type {OverrideMaterialManager}
			 * @private
			 */

			this.overrideMaterialManager = (overrideMaterial === null) ? null :
				new OverrideMaterialManager(overrideMaterial);

		}

		if ( Pass ) RenderPass.__proto__ = Pass;
		RenderPass.prototype = Object.create( Pass && Pass.prototype );
		RenderPass.prototype.constructor = RenderPass;

		var prototypeAccessors = { renderToScreen: { configurable: true },overrideMaterial: { configurable: true },clear: { configurable: true } };

		/**
		 * Indicates whether this pass should render to screen.
		 *
		 * @type {Boolean}
		 */

		prototypeAccessors.renderToScreen.get = function () {

			return Pass.prototype.renderToScreen;

		};

		/**
		 * Sets the render to screen flag.
		 *
		 * @type {Boolean}
		 */

		prototypeAccessors.renderToScreen.set = function (value) {

			Pass.prototype.renderToScreen = value;
			this.clearPass.renderToScreen = value;

		};

		/**
		 * The current override material.
		 *
		 * @type {Material}
		 */

		prototypeAccessors.overrideMaterial.get = function () {

			var manager = this.overrideMaterialManager;

			return (manager !== null) ? manager.material : null;

		};

		/**
		 * Sets the override material.
		 *
		 * @type {Material}
		 */

		prototypeAccessors.overrideMaterial.set = function (value) {

			var manager = this.overrideMaterialManager;

			if(value !== null) {

				if(manager !== null) {

					manager.setMaterial(value);

				} else {

					this.overrideMaterialManager = new OverrideMaterialManager(value);

				}

			} else if(manager !== null) {

				manager.dispose();
				this.overrideMaterialManager = null;

			}

		};

		/**
		 * Indicates whether the target buffer should be cleared before rendering.
		 *
		 * @type {Boolean}
		 */

		prototypeAccessors.clear.get = function () {

			return this.clearPass.enabled;

		};

		/**
		 * Enables or disables auto clear.
		 *
		 * @type {Boolean}
		 */

		prototypeAccessors.clear.set = function (value) {

			this.clearPass.enabled = value;

		};

		/**
		 * Returns the clear pass.
		 *
		 * @return {ClearPass} The clear pass.
		 */

		RenderPass.prototype.getClearPass = function getClearPass () {

			return this.clearPass;

		};

		/**
		 * Returns the current depth texture.
		 *
		 * @return {Texture} The current depth texture, or null if there is none.
		 */

		RenderPass.prototype.getDepthTexture = function getDepthTexture () {

			return this.depthTexture;

		};

		/**
		 * Sets the depth texture.
		 *
		 * The provided texture will be attached to the input buffer unless this pass
		 * renders to screen.
		 *
		 * @param {DepthTexture} depthTexture - A depth texture.
		 * @param {Number} [depthPacking=0] - The depth packing.
		 */

		RenderPass.prototype.setDepthTexture = function setDepthTexture (depthTexture, depthPacking) {


			this.depthTexture = depthTexture;

		};

		/**
		 * Renders the scene.
		 *
		 * @param {WebGLRenderer} renderer - The renderer.
		 * @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
		 * @param {WebGLRenderTarget} outputBuffer - A frame buffer that serves as the output render target unless this pass renders to screen.
		 * @param {Number} [deltaTime] - The time between the last frame and the current one in seconds.
		 * @param {Boolean} [stencilTest] - Indicates whether a stencil mask is active.
		 */

		RenderPass.prototype.render = function render (renderer, inputBuffer, outputBuffer, deltaTime, stencilTest) {

			var scene = this.scene;
			var camera = this.camera;
			var renderTarget = this.renderToScreen ? null : inputBuffer;

			if(this.depthTexture !== null && !this.renderToScreen) {

				inputBuffer.depthTexture = this.depthTexture;
				outputBuffer.depthTexture = null;

			}

			if(this.clear) {

				this.clearPass.render(renderer, inputBuffer);

			}

			renderer.setRenderTarget(renderTarget);

			if(this.overrideMaterialManager !== null) {

				this.overrideMaterialManager.render(renderer, scene, camera);

			} else {

				renderer.render(scene, camera);

			}

		};

		Object.defineProperties( RenderPass.prototype, prototypeAccessors );

		return RenderPass;
	}(Pass));

	/**
	 * A pass that renders the depth of a given scene into a color buffer.
	 */

	var DepthPass = /*@__PURE__*/(function (Pass) {
		function DepthPass(scene, camera, ref) {
			if ( ref === void 0 ) ref = {};
			var resolutionScale = ref.resolutionScale; if ( resolutionScale === void 0 ) resolutionScale = 1.0;
			var width = ref.width; if ( width === void 0 ) width = Resizer.AUTO_SIZE;
			var height = ref.height; if ( height === void 0 ) height = Resizer.AUTO_SIZE;
			var renderTarget = ref.renderTarget;


			Pass.call(this, "DepthPass");

			this.needsSwap = false;

			/**
			 * A render pass.
			 *
			 * @type {RenderPass}
			 * @private
			 */

			this.renderPass = new RenderPass(scene, camera, new three.MeshDepthMaterial({
				depthPacking: three.RGBADepthPacking,
				morphTargets: true,
				skinning: true
			}));

			var clearPass = this.renderPass.getClearPass();
			clearPass.overrideClearColor = new three.Color(0xffffff);
			clearPass.overrideClearAlpha = 1.0;

			/**
			 * A render target that contains the scene depth.
			 *
			 * @type {WebGLRenderTarget}
			 */

			this.renderTarget = renderTarget;

			if(this.renderTarget === undefined) {

				this.renderTarget = new three.WebGLRenderTarget(1, 1, {
					minFilter: three.NearestFilter,
					magFilter: three.NearestFilter,
					stencilBuffer: false
				});

				this.renderTarget.texture.name = "DepthPass.Target";

			}

			/**
			 * The desired render resolution.
			 *
			 * Use {@link Resizer.AUTO_SIZE} for the width or height to automatically
			 * calculate it based on its counterpart and the original aspect ratio.
			 *
			 * @type {Resizer}
			 */

			this.resolution = new Resizer(this, width, height, resolutionScale);

		}

		if ( Pass ) DepthPass.__proto__ = Pass;
		DepthPass.prototype = Object.create( Pass && Pass.prototype );
		DepthPass.prototype.constructor = DepthPass;

		var prototypeAccessors = { texture: { configurable: true } };

		/**
		 * The depth texture.
		 *
		 * @type {Texture}
		 */

		prototypeAccessors.texture.get = function () {

			return this.renderTarget.texture;

		};

		/**
		 * Returns the current resolution scale.
		 *
		 * @return {Number} The resolution scale.
		 * @deprecated Adjust the fixed resolution width or height instead.
		 */

		DepthPass.prototype.getResolutionScale = function getResolutionScale () {

			return this.resolutionScale;

		};

		/**
		 * Sets the resolution scale.
		 *
		 * @param {Number} scale - The new resolution scale.
		 * @deprecated Adjust the fixed resolution width or height instead.
		 */

		DepthPass.prototype.setResolutionScale = function setResolutionScale (scale) {

			this.resolutionScale = scale;
			this.setSize(this.resolution.base.x, this.resolution.base.y);

		};

		/**
		 * Renders the scene depth.
		 *
		 * @param {WebGLRenderer} renderer - The renderer.
		 * @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
		 * @param {WebGLRenderTarget} outputBuffer - A frame buffer that serves as the output render target unless this pass renders to screen.
		 * @param {Number} [deltaTime] - The time between the last frame and the current one in seconds.
		 * @param {Boolean} [stencilTest] - Indicates whether a stencil mask is active.
		 */

		DepthPass.prototype.render = function render (renderer, inputBuffer, outputBuffer, deltaTime, stencilTest) {

			var renderTarget = this.renderToScreen ? null : this.renderTarget;
			this.renderPass.render(renderer, renderTarget);

		};

		/**
		 * Updates the size of this pass.
		 *
		 * @param {Number} width - The width.
		 * @param {Number} height - The height.
		 */

		DepthPass.prototype.setSize = function setSize (width, height) {

			var resolution = this.resolution;
			resolution.base.set(width, height);

			this.renderTarget.setSize(resolution.width, resolution.height);

		};

		Object.defineProperties( DepthPass.prototype, prototypeAccessors );

		return DepthPass;
	}(Pass));

	/**
	 * A pass that downsamples the scene depth by picking the most representative
	 * depth in 2x2 texel neighborhoods. If a normal buffer is provided, the
	 * corresponding normals will be stored as well.
	 *
	 * Attention: This pass requires WebGL 2.
	 */

	var DepthDownsamplingPass = /*@__PURE__*/(function (Pass) {
		function DepthDownsamplingPass(ref) {
			if ( ref === void 0 ) ref = {};
			var normalBuffer = ref.normalBuffer; if ( normalBuffer === void 0 ) normalBuffer = null;
			var resolutionScale = ref.resolutionScale; if ( resolutionScale === void 0 ) resolutionScale = 0.5;
			var width = ref.width; if ( width === void 0 ) width = Resizer.AUTO_SIZE;
			var height = ref.height; if ( height === void 0 ) height = Resizer.AUTO_SIZE;


			Pass.call(this, "DepthDownsamplingPass");

			this.setFullscreenMaterial(new DepthDownsamplingMaterial());
			this.needsDepthTexture = true;
			this.needsSwap = false;

			if(normalBuffer !== null) {

				var material = this.getFullscreenMaterial();
				material.uniforms.normalBuffer.value = normalBuffer;
				material.defines.DOWNSAMPLE_NORMALS = "1";

			}

			/**
			 * A render target that contains the downsampled normals and depth.
			 *
			 * Normals are stored as RGB and depth is stored as alpha.
			 *
			 * @type {WebGLRenderTarget}
			 */

			this.renderTarget = new three.WebGLRenderTarget(1, 1, {
				minFilter: three.NearestFilter,
				magFilter: three.NearestFilter,
				stencilBuffer: false,
				depthBuffer: false,
				type: three.FloatType
			});

			this.renderTarget.texture.name = "DepthDownsamplingPass.Target";
			this.renderTarget.texture.generateMipmaps = false;

			/**
			 * The resolution of this effect.
			 *
			 * @type {Resizer}
			 */

			this.resolution = new Resizer(this, width, height);
			this.resolution.scale = resolutionScale;

		}

		if ( Pass ) DepthDownsamplingPass.__proto__ = Pass;
		DepthDownsamplingPass.prototype = Object.create( Pass && Pass.prototype );
		DepthDownsamplingPass.prototype.constructor = DepthDownsamplingPass;

		var prototypeAccessors = { texture: { configurable: true } };

		/**
		 * The normal(RGB) + depth(A) texture.
		 *
		 * @type {Texture}
		 */

		prototypeAccessors.texture.get = function () {

			return this.renderTarget.texture;

		};

		/**
		 * Sets the depth texture.
		 *
		 * @param {Texture} depthTexture - A depth texture.
		 * @param {Number} [depthPacking=0] - The depth packing.
		 */

		DepthDownsamplingPass.prototype.setDepthTexture = function setDepthTexture (depthTexture, depthPacking) {
			if ( depthPacking === void 0 ) depthPacking = 0;


			var material = this.getFullscreenMaterial();
			material.uniforms.depthBuffer.value = depthTexture;
			material.depthPacking = depthPacking;

		};

		/**
		 * Downsamples depth and scene normals.
		 *
		 * @param {WebGLRenderer} renderer - The renderer.
		 * @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
		 * @param {WebGLRenderTarget} outputBuffer - A frame buffer that serves as the output render target unless this pass renders to screen.
		 * @param {Number} [deltaTime] - The time between the last frame and the current one in seconds.
		 * @param {Boolean} [stencilTest] - Indicates whether a stencil mask is active.
		 */

		DepthDownsamplingPass.prototype.render = function render (renderer, inputBuffer, outputBuffer, deltaTime, stencilTest) {

			renderer.setRenderTarget(this.renderToScreen ? null : this.renderTarget);
			renderer.render(this.scene, this.camera);

		};

		/**
		 * Updates the size of this pass.
		 *
		 * @param {Number} width - The width.
		 * @param {Number} height - The height.
		 */

		DepthDownsamplingPass.prototype.setSize = function setSize (width, height) {

			var resolution = this.resolution;
			resolution.base.set(width, height);

			// Use the full resolution to calculate the depth/normal buffer texel size.
			this.getFullscreenMaterial().setTexelSize(1.0 / width, 1.0 / height);

			this.renderTarget.setSize(resolution.width, resolution.height);

		};

		/**
		 * Performs initialization tasks.
		 *
		 * @param {WebGLRenderer} renderer - The renderer.
		 * @param {Boolean} alpha - Whether the renderer uses the alpha channel or not.
		 * @param {Number} frameBufferType - The type of the main frame buffers.
		 */

		DepthDownsamplingPass.prototype.initialize = function initialize (renderer, alpha, frameBufferType) {

			if(!renderer.capabilities.isWebGL2) {

				console.error("The DepthDownsamplingPass requires WebGL 2");

			}

		};

		Object.defineProperties( DepthDownsamplingPass.prototype, prototypeAccessors );

		return DepthDownsamplingPass;
	}(Pass));

	/**
	 * A blend function enumeration.
	 *
	 * @type {Object}
	 * @property {Number} SKIP - No blending. The effect will not be included in the final shader.
	 * @property {Number} ADD - Additive blending. Fast, but may produce washed out results.
	 * @property {Number} ALPHA - Alpha blending. Blends based on the alpha value of the new color.
	 * @property {Number} AVERAGE - Average blending.
	 * @property {Number} COLOR_BURN - Color burn.
	 * @property {Number} COLOR_DODGE - Color dodge.
	 * @property {Number} DARKEN - Prioritize darker colors.
	 * @property {Number} DIFFERENCE - Color difference.
	 * @property {Number} EXCLUSION - Color exclusion.
	 * @property {Number} LIGHTEN - Prioritize lighter colors.
	 * @property {Number} MULTIPLY - Color multiplication.
	 * @property {Number} DIVIDE - Color division.
	 * @property {Number} NEGATION - Color negation.
	 * @property {Number} NORMAL - Normal blending. The new color overwrites the old one.
	 * @property {Number} OVERLAY - Color overlay.
	 * @property {Number} REFLECT - Color reflection.
	 * @property {Number} SCREEN - Screen blending. The two colors are effectively projected on a white screen simultaneously.
	 * @property {Number} SOFT_LIGHT - Soft light blending.
	 * @property {Number} SUBTRACT - Color subtraction.
	 */

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

	/**
	 * A blend function shader code catalogue.
	 *
	 * @type {Map<BlendFunction, String>}
	 * @private
	 */

	var blendFunctions = new Map([
		[BlendFunction.SKIP, null],
		[BlendFunction.ADD, addBlendFunction],
		[BlendFunction.ALPHA, alphaBlendFunction],
		[BlendFunction.AVERAGE, averageBlendFunction],
		[BlendFunction.COLOR_BURN, colorBurnBlendFunction],
		[BlendFunction.COLOR_DODGE, colorDodgeBlendFunction],
		[BlendFunction.DARKEN, darkenBlendFunction],
		[BlendFunction.DIFFERENCE, differenceBlendFunction],
		[BlendFunction.EXCLUSION, exclusionBlendFunction],
		[BlendFunction.LIGHTEN, lightenBlendFunction],
		[BlendFunction.MULTIPLY, multiplyBlendFunction],
		[BlendFunction.DIVIDE, divideBlendFunction],
		[BlendFunction.NEGATION, negationBlendFunction],
		[BlendFunction.NORMAL, normalBlendFunction],
		[BlendFunction.OVERLAY, overlayBlendFunction],
		[BlendFunction.REFLECT, reflectBlendFunction],
		[BlendFunction.SCREEN, screenBlendFunction],
		[BlendFunction.SOFT_LIGHT, softLightBlendFunction],
		[BlendFunction.SUBTRACT, subtractBlendFunction]
	]);

	/**
	 * A blend mode.
	 */

	var BlendMode = /*@__PURE__*/(function (EventDispatcher) {
		function BlendMode(blendFunction, opacity) {
			if ( opacity === void 0 ) opacity = 1.0;


			EventDispatcher.call(this);

			/**
			 * The blend function.
			 *
			 * @type {BlendFunction}
			 * @private
			 */

			this.blendFunction = blendFunction;

			/**
			 * The opacity of the color that will be blended with the base color.
			 *
			 * @type {Uniform}
			 */

			this.opacity = new three.Uniform(opacity);

		}

		if ( EventDispatcher ) BlendMode.__proto__ = EventDispatcher;
		BlendMode.prototype = Object.create( EventDispatcher && EventDispatcher.prototype );
		BlendMode.prototype.constructor = BlendMode;

		/**
		 * Returns the blend function.
		 *
		 * @return {BlendFunction} The blend function.
		 */

		BlendMode.prototype.getBlendFunction = function getBlendFunction () {

			return this.blendFunction;

		};

		/**
		 * Sets the blend function.
		 *
		 * @param {BlendFunction} blendFunction - The blend function.
		 */

		BlendMode.prototype.setBlendFunction = function setBlendFunction (blendFunction) {

			this.blendFunction = blendFunction;
			this.dispatchEvent({ type: "change" });

		};

		/**
		 * Returns the blend function shader code.
		 *
		 * @return {String} The blend function shader code.
		 */

		BlendMode.prototype.getShaderCode = function getShaderCode () {

			return blendFunctions.get(this.blendFunction);

		};

		return BlendMode;
	}(three.EventDispatcher));

	/**
	 * An abstract effect.
	 *
	 * Effects can be combined using the {@link EffectPass}.
	 *
	 * @implements {Initializable}
	 * @implements {Resizable}
	 * @implements {Disposable}
	 */

	var Effect = /*@__PURE__*/(function (EventDispatcher) {
		function Effect(name, fragmentShader, ref) {
			var this$1 = this;
			if ( ref === void 0 ) ref = {};
			var attributes = ref.attributes; if ( attributes === void 0 ) attributes = EffectAttribute.NONE;
			var blendFunction = ref.blendFunction; if ( blendFunction === void 0 ) blendFunction = BlendFunction.SCREEN;
			var defines = ref.defines; if ( defines === void 0 ) defines = new Map();
			var uniforms = ref.uniforms; if ( uniforms === void 0 ) uniforms = new Map();
			var extensions = ref.extensions; if ( extensions === void 0 ) extensions = null;
			var vertexShader = ref.vertexShader; if ( vertexShader === void 0 ) vertexShader = null;


			EventDispatcher.call(this);

			/**
			 * The name of this effect.
			 *
			 * @type {String}
			 */

			this.name = name;

			/**
			 * The effect attributes.
			 *
			 * @type {EffectAttribute}
			 * @private
			 */

			this.attributes = attributes;

			/**
			 * The fragment shader.
			 *
			 * @type {String}
			 * @private
			 */

			this.fragmentShader = fragmentShader;

			/**
			 * The vertex shader.
			 *
			 * @type {String}
			 * @private
			 */

			this.vertexShader = vertexShader;

			/**
			 * Preprocessor macro definitions.
			 *
			 * Call {@link Effect.setChanged} after changing macro definitions.
			 *
			 * @type {Map<String, String>}
			 */

			this.defines = defines;

			/**
			 * Shader uniforms.
			 *
			 * You may freely modify the values of these uniforms at runtime. However,
			 * uniforms should not be removed or added after the effect was created.
			 *
			 * Call {@link Effect.setChanged} after adding or removing uniforms.
			 *
			 * @type {Map<String, Uniform>}
			 */

			this.uniforms = uniforms;

			/**
			 * WebGL extensions that are required by this effect.
			 *
			 * Call {@link Effect.setChanged} after adding or removing extensions.
			 *
			 * @type {Set<WebGLExtension>}
			 */

			this.extensions = extensions;

			/**
			 * The blend mode of this effect.
			 *
			 * The result of this effect will be blended with the result of the previous
			 * effect using this blend mode.
			 *
			 * @type {BlendMode}
			 */

			this.blendMode = new BlendMode(blendFunction);
			this.blendMode.addEventListener("change", function (event) { return this$1.setChanged(); });

		}

		if ( EventDispatcher ) Effect.__proto__ = EventDispatcher;
		Effect.prototype = Object.create( EventDispatcher && EventDispatcher.prototype );
		Effect.prototype.constructor = Effect;

		/**
		 * Informs the associated {@link EffectPass} that this effect has changed in
		 * a way that requires a shader recompilation.
		 *
		 * Call this method after changing macro definitions or extensions and after
		 * adding or removing uniforms.
		 *
		 * @protected
		 */

		Effect.prototype.setChanged = function setChanged () {

			this.dispatchEvent({ type: "change" });

		};

		/**
		 * Returns the effect attributes.
		 *
		 * @return {EffectAttribute} The attributes.
		 */

		Effect.prototype.getAttributes = function getAttributes () {

			return this.attributes;

		};

		/**
		 * Sets the effect attributes.
		 *
		 * Effects that have the same attributes will be executed in the order in
		 * which they were registered. Some attributes imply a higher priority.
		 *
		 * @protected
		 * @param {EffectAttribute} attributes - The attributes.
		 */

		Effect.prototype.setAttributes = function setAttributes (attributes) {

			this.attributes = attributes;
			this.setChanged();

		};

		/**
		 * Returns the fragment shader.
		 *
		 * @return {String} The fragment shader.
		 */

		Effect.prototype.getFragmentShader = function getFragmentShader () {

			return this.fragmentShader;

		};

		/**
		 * Sets the fragment shader.
		 *
		 * @protected
		 * @param {String} fragmentShader - The fragment shader.
		 */

		Effect.prototype.setFragmentShader = function setFragmentShader (fragmentShader) {

			this.fragmentShader = fragmentShader;
			this.setChanged();

		};

		/**
		 * Returns the vertex shader.
		 *
		 * @return {String} The vertex shader.
		 */

		Effect.prototype.getVertexShader = function getVertexShader () {

			return this.vertexShader;

		};

		/**
		 * Sets the vertex shader.
		 *
		 * @protected
		 * @param {String} vertexShader - The vertex shader.
		 */

		Effect.prototype.setVertexShader = function setVertexShader (vertexShader) {

			this.vertexShader = vertexShader;
			this.setChanged();

		};

		/**
		 * Sets the depth texture.
		 *
		 * You may override this method if your effect requires direct access to the
		 * depth texture that is bound to the associated {@link EffectPass}.
		 *
		 * @param {Texture} depthTexture - A depth texture.
		 * @param {Number} [depthPacking=0] - The depth packing.
		 */

		Effect.prototype.setDepthTexture = function setDepthTexture (depthTexture, depthPacking) {
	};

		/**
		 * Updates the effect by performing supporting operations.
		 *
		 * This method is called by the {@link EffectPass} right before the main
		 * fullscreen render operation, even if the blend function is set to `SKIP`.
		 *
		 * You may override this method if you need to render additional off-screen
		 * textures or update custom uniforms.
		 *
		 * @param {WebGLRenderer} renderer - The renderer.
		 * @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
		 * @param {Number} [deltaTime] - The time between the last frame and the current one in seconds.
		 */

		Effect.prototype.update = function update (renderer, inputBuffer, deltaTime) {};

		/**
		 * Updates the size of this effect.
		 *
		 * You may override this method in case you want to be informed about the main
		 * render size.
		 *
		 * The {@link EffectPass} calls this method before this effect is initialized
		 * and every time its own size is updated.
		 *
		 * @param {Number} width - The width.
		 * @param {Number} height - The height.
		 * @example this.myRenderTarget.setSize(width, height);
		 */

		Effect.prototype.setSize = function setSize (width, height) {};

		/**
		 * Performs initialization tasks.
		 *
		 * By overriding this method you gain access to the renderer. You'll also be
		 * able to configure your custom render targets to use the appropriate format
		 * (RGB or RGBA).
		 *
		 * The provided renderer can be used to warm up special off-screen render
		 * targets by performing a preliminary render operation.
		 *
		 * The {@link EffectPass} calls this method during its own initialization
		 * which happens after the size has been set.
		 *
		 * @param {WebGLRenderer} renderer - The renderer.
		 * @param {Boolean} alpha - Whether the renderer uses the alpha channel or not.
		 * @param {Number} frameBufferType - The type of the main frame buffers.
		 * @example if(!alpha && frameBufferType === UnsignedByteType) { this.myRenderTarget.texture.format = RGBFormat; }
		 */

		Effect.prototype.initialize = function initialize (renderer, alpha, frameBufferType) {};

		/**
		 * Performs a shallow search for properties that define a dispose method and
		 * deletes them. The effect will be inoperative after this method was called!
		 *
		 * The {@link EffectPass} calls this method when it is being destroyed. Do not
		 * call this method directly.
		 */

		Effect.prototype.dispose = function dispose () {

			for(var i = 0, list = Object.keys(this); i < list.length; i += 1) {

				var key = list[i];

				if(this[key] !== null && typeof this[key].dispose === "function") {

					/** @ignore */
					this[key].dispose();

				}

			}

		};

		return Effect;
	}(three.EventDispatcher));

	/**
	 * An enumeration of effect attributes.
	 *
	 * Attributes can be concatenated using the bitwise OR operator.
	 *
	 * @type {Object}
	 * @property {Number} NONE - No attributes. Most effects don't need to specify any attributes.
	 * @property {Number} DEPTH - Describes effects that require a depth texture.
	 * @property {Number} CONVOLUTION - Describes effects that fetch additional samples from the input buffer. There cannot be more than one effect with this attribute per {@link EffectPass}.
	 * @example const attributes = EffectAttribute.CONVOLUTION | EffectAttribute.DEPTH;
	 */

	var EffectAttribute = {

		NONE: 0,
		DEPTH: 1,
		CONVOLUTION: 2

	};

	/**
	 * An enumeration of WebGL extensions.
	 *
	 * @type {Object}
	 * @property {String} DERIVATIVES - Enables derivatives by adding the functions dFdx, dFdy and fwidth.
	 * @property {String} FRAG_DEPTH - Enables gl_FragDepthEXT to set a depth value of a fragment from within the fragment shader.
	 * @property {String} DRAW_BUFFERS - Enables multiple render targets (MRT) support.
	 * @property {String} SHADER_TEXTURE_LOD - Enables explicit control of texture LOD.
	 */

	var WebGLExtension = {

		DERIVATIVES: "derivatives",
		FRAG_DEPTH: "fragDepth",
		DRAW_BUFFERS: "drawBuffers",
		SHADER_TEXTURE_LOD: "shaderTextureLOD"

	};

	/**
	 * Finds and collects substrings that match the given regular expression.
	 *
	 * @private
	 * @param {RegExp} regExp - A regular expression.
	 * @param {String} string - A string.
	 * @return {String[]} The matching substrings.
	 */

	function findSubstrings(regExp, string) {

		var substrings = [];
		var result;

		while((result = regExp.exec(string)) !== null) {

			substrings.push(result[1]);

		}

		return substrings;

	}

	/**
	 * Prefixes substrings within the given strings.
	 *
	 * @private
	 * @param {String} prefix - A prefix.
	 * @param {String[]} substrings - The substrings.
	 * @param {Map<String, String>} strings - A collection of named strings.
	 */

	function prefixSubstrings(prefix, substrings, strings) {

		var prefixed, regExp;

		for(var i$1 = 0, list$1 = substrings; i$1 < list$1.length; i$1 += 1) {

			var substring = list$1[i$1];

			prefixed = "$1" + prefix + substring.charAt(0).toUpperCase() + substring.slice(1);
			regExp = new RegExp("([^\\.])(\\b" + substring + "\\b)", "g");

			for(var i = 0, list = strings.entries(); i < list.length; i += 1) {

				var entry = list[i];

				if(entry[1] !== null) {

					strings.set(entry[0], entry[1].replace(regExp, prefixed));

				}

			}

		}

	}

	/**
	 * Integrates the given effect.
	 *
	 * @private
	 * @param {String} prefix - A prefix.
	 * @param {Effect} effect - An effect.
	 * @param {Map<String, String>} shaderParts - The shader parts.
	 * @param {Map<BlendFunction, BlendMode>} blendModes - The blend modes.
	 * @param {Map<String, String>} defines - The macro definitions.
	 * @param {Map<String, Uniform>} uniforms - The uniforms.
	 * @param {EffectAttribute} attributes - The global, collective attributes.
	 * @return {Object} The results.
	 * @property {String[]} varyings - The varyings used by the given effect.
	 * @property {Boolean} transformedUv - Indicates whether the effect transforms UV coordinates in the fragment shader.
	 * @property {Boolean} readDepth - Indicates whether the effect actually uses depth in the fragment shader.
	 */

	function integrateEffect(prefix, effect, shaderParts, blendModes, defines, uniforms, attributes) {

		var functionRegExp = /(?:\w+\s+(\w+)\([\w\s,]*\)\s*{[^}]+})/g;
		var varyingRegExp = /(?:varying\s+\w+\s+(\w*))/g;

		var blendMode = effect.blendMode;
		var shaders = new Map([
			["fragment", effect.getFragmentShader()],
			["vertex", effect.getVertexShader()]
		]);

		var mainImageExists = (shaders.get("fragment") !== undefined && shaders.get("fragment").indexOf("mainImage") >= 0);
		var mainUvExists = (shaders.get("fragment") !== undefined && shaders.get("fragment").indexOf("mainUv") >= 0);

		var varyings = [], names = [];
		var transformedUv = false;
		var readDepth = false;

		if(shaders.get("fragment") === undefined) {

			console.error("Missing fragment shader", effect);

		} else if(mainUvExists && (attributes & EffectAttribute.CONVOLUTION) !== 0) {

			console.error("Effects that transform UV coordinates are incompatible with convolution effects", effect);

		} else if(!mainImageExists && !mainUvExists) {

			console.error("The fragment shader contains neither a mainImage nor a mainUv function", effect);

		} else {

			if(mainUvExists) {

				shaderParts.set(Section.FRAGMENT_MAIN_UV, shaderParts.get(Section.FRAGMENT_MAIN_UV) +
					"\t" + prefix + "MainUv(UV);\n");

				transformedUv = true;

			}

			if(shaders.get("vertex") !== null && shaders.get("vertex").indexOf("mainSupport") >= 0) {

				var string = "\t" + prefix + "MainSupport(";

				// Check if the vertex shader expects uv coordinates.
				if(shaders.get("vertex").indexOf("uv") >= 0) {

					string += "vUv";

				}

				string += ");\n";

				shaderParts.set(Section.VERTEX_MAIN_SUPPORT,
					shaderParts.get(Section.VERTEX_MAIN_SUPPORT) + string);

				varyings = varyings.concat(findSubstrings(varyingRegExp, shaders.get("vertex")));
				names = names.concat(varyings).concat(findSubstrings(functionRegExp, shaders.get("vertex")));

			}

			// Assemble all names while ignoring parameters of function-like macros.
			names = names.concat(findSubstrings(functionRegExp, shaders.get("fragment")))
				.concat(Array.from(effect.defines.keys()).map(function (s) { return s.replace(/\([\w\s,]*\)/g, ""); }))
				.concat(Array.from(effect.uniforms.keys()));

			// Store prefixed uniforms and macros.
			effect.uniforms.forEach(function (value, key) { return uniforms.set(prefix + key.charAt(0).toUpperCase() + key.slice(1), value); });
			effect.defines.forEach(function (value, key) { return defines.set(prefix + key.charAt(0).toUpperCase() + key.slice(1), value); });

			// Prefix varyings, functions, uniforms and macros.
			prefixSubstrings(prefix, names, defines);
			prefixSubstrings(prefix, names, shaders);

			// Collect unique blend modes.
			blendModes.set(blendMode.blendFunction, blendMode);

			if(mainImageExists) {

				var string$1 = prefix + "MainImage(color0, UV, ";

				// The effect may sample depth in a different shader.
				if((attributes & EffectAttribute.DEPTH) !== 0 && shaders.get("fragment").indexOf("depth") >= 0) {

					string$1 += "depth, ";
					readDepth = true;

				}

				string$1 += "color1);\n\t";

				// Include the blend opacity uniform of this effect.
				var blendOpacity = prefix + "BlendOpacity";
				uniforms.set(blendOpacity, blendMode.opacity);

				// Blend the result of this effect with the input color.
				string$1 += "color0 = blend" + blendMode.getBlendFunction() +
					"(color0, color1, " + blendOpacity + ");\n\n\t";

				shaderParts.set(Section.FRAGMENT_MAIN_IMAGE,
					shaderParts.get(Section.FRAGMENT_MAIN_IMAGE) + string$1);

				shaderParts.set(Section.FRAGMENT_HEAD, shaderParts.get(Section.FRAGMENT_HEAD) +
					"uniform float " + blendOpacity + ";\n\n");

			}

			// Include the modified code in the final shader.
			shaderParts.set(Section.FRAGMENT_HEAD, shaderParts.get(Section.FRAGMENT_HEAD) +
				shaders.get("fragment") + "\n");

			if(shaders.get("vertex") !== null) {

				shaderParts.set(Section.VERTEX_HEAD, shaderParts.get(Section.VERTEX_HEAD) +
					shaders.get("vertex") + "\n");

			}

		}

		return { varyings: varyings, transformedUv: transformedUv, readDepth: readDepth };

	}

	/**
	 * An effect pass.
	 *
	 * Use this pass to combine {@link Effect} instances.
	 *
	 * @implements {EventListener}
	 */

	var EffectPass = /*@__PURE__*/(function (Pass) {
		function EffectPass(camera) {
			var effects = [], len = arguments.length - 1;
			while ( len-- > 0 ) effects[ len ] = arguments[ len + 1 ];


			Pass.call(this, "EffectPass");

			this.setFullscreenMaterial(new EffectMaterial(null, null, null, camera));

			/**
			 * The effects, sorted by attribute priority, DESC.
			 *
			 * @type {Effect[]}
			 * @private
			 */

			this.effects = effects.sort(function (a, b) { return (b.attributes - a.attributes); });

			/**
			 * Indicates whether this pass should skip rendering.
			 *
			 * Effects will still be updated, even if this flag is true.
			 *
			 * @type {Boolean}
			 * @private
			 */

			this.skipRendering = false;

			/**
			 * The amount of shader uniforms that this pass uses.
			 *
			 * @type {Number}
			 * @private
			 */

			this.uniforms = 0;

			/**
			 * The amount of shader varyings that this pass uses.
			 *
			 * @type {Number}
			 * @private
			 */

			this.varyings = 0;

			/**
			 * A time offset.
			 *
			 * Elapsed time will start at this value.
			 *
			 * @type {Number}
			 */

			this.minTime = 1.0;

			/**
			 * The maximum time.
			 *
			 * If the elapsed time exceeds this value, it will be reset.
			 *
			 * @type {Number}
			 */

			this.maxTime = Number.POSITIVE_INFINITY;

		}

		if ( Pass ) EffectPass.__proto__ = Pass;
		EffectPass.prototype = Object.create( Pass && Pass.prototype );
		EffectPass.prototype.constructor = EffectPass;

		var prototypeAccessors = { encodeOutput: { configurable: true },dithering: { configurable: true } };

		/**
		 * Indicates whether this pass encodes its output when rendering to screen.
		 *
		 * @type {Boolean}
		 */

		prototypeAccessors.encodeOutput.get = function () {

			return (this.getFullscreenMaterial().defines.ENCODE_OUTPUT !== undefined);

		};

		/**
		 * Enables or disables output encoding.
		 *
		 * @type {Boolean}
		 */

		prototypeAccessors.encodeOutput.set = function (value) {

			if(this.encodeOutput !== value) {

				var material = this.getFullscreenMaterial();
				material.needsUpdate = true;

				if(value) {

					material.defines.ENCODE_OUTPUT = "1";

				} else {

					delete material.defines.ENCODE_OUTPUT;

				}

			}

		};

		/**
		 * Indicates whether dithering is enabled.
		 *
		 * Color quantization reduces banding artifacts but degrades performance.
		 *
		 * @type {Boolean}
		 */

		prototypeAccessors.dithering.get = function () {

			return this.getFullscreenMaterial().dithering;

		};

		/**
		 * Enables or disables dithering.
		 *
		 * @type {Boolean}
		 */

		prototypeAccessors.dithering.set = function (value) {

			var material = this.getFullscreenMaterial();

			if(material.dithering !== value) {

				material.dithering = value;
				material.needsUpdate = true;

			}

		};

		/**
		 * Compares required resources with device capabilities.
		 *
		 * @private
		 * @param {WebGLRenderer} renderer - The renderer.
		 */

		EffectPass.prototype.verifyResources = function verifyResources (renderer) {

			var capabilities = renderer.capabilities;
			var max = Math.min(capabilities.maxFragmentUniforms, capabilities.maxVertexUniforms);

			if(this.uniforms > max) {

				console.warn("The current rendering context doesn't support more than " +
					max + " uniforms, but " + this.uniforms + " were defined");

			}

			max = capabilities.maxVaryings;

			if(this.varyings > max) {

				console.warn("The current rendering context doesn't support more than " +
					max + " varyings, but " + this.varyings + " were defined");

			}

		};

		/**
		 * Updates the compound shader material.
		 *
		 * @private
		 */

		EffectPass.prototype.updateMaterial = function updateMaterial () {

			var blendRegExp = /\bblend\b/g;

			var shaderParts = new Map([
				[Section.FRAGMENT_HEAD, ""],
				[Section.FRAGMENT_MAIN_UV, ""],
				[Section.FRAGMENT_MAIN_IMAGE, ""],
				[Section.VERTEX_HEAD, ""],
				[Section.VERTEX_MAIN_SUPPORT, ""]
			]);

			var blendModes = new Map();
			var defines = new Map();
			var uniforms = new Map();
			var extensions = new Set();

			var id = 0, varyings = 0, attributes = 0;
			var transformedUv = false;
			var readDepth = false;
			var result;

			for(var i$1 = 0, list$1 = this.effects; i$1 < list$1.length; i$1 += 1) {

				var effect = list$1[i$1];

				if(effect.blendMode.getBlendFunction() === BlendFunction.SKIP) {

					// Check if this effect relies on depth and then continue.
					attributes |= (effect.getAttributes() & EffectAttribute.DEPTH);

				} else if((attributes & EffectAttribute.CONVOLUTION) !== 0 &&
					(effect.getAttributes() & EffectAttribute.CONVOLUTION) !== 0) {

					console.error("Convolution effects cannot be merged", effect);

				} else {

					attributes |= effect.getAttributes();

					result = integrateEffect(("e" + id++), effect, shaderParts, blendModes, defines, uniforms, attributes);

					varyings += result.varyings.length;
					transformedUv = transformedUv || result.transformedUv;
					readDepth = readDepth || result.readDepth;

					if(effect.extensions !== null) {

						// Collect the WebGL extensions that are required by this effect.
						for(var i = 0, list = effect.extensions; i < list.length; i += 1) {

							var extension = list[i];

							extensions.add(extension);

						}

					}

				}

			}

			// Integrate the relevant blend functions.
			for(var i$2 = 0, list$2 = blendModes.values(); i$2 < list$2.length; i$2 += 1) {

				var blendMode = list$2[i$2];

				shaderParts.set(Section.FRAGMENT_HEAD, shaderParts.get(Section.FRAGMENT_HEAD) +
					blendMode.getShaderCode().replace(blendRegExp, "blend" + blendMode.getBlendFunction()) + "\n");

			}

			// Check if any effect relies on depth.
			if((attributes & EffectAttribute.DEPTH) !== 0) {

				// Only read depth if any effect actually uses this information.
				if(readDepth) {

					shaderParts.set(Section.FRAGMENT_MAIN_IMAGE, "float depth = readDepth(UV);\n\n\t" +
						shaderParts.get(Section.FRAGMENT_MAIN_IMAGE));

				}

				// Only request a depth texture if none has been provided yet.
				this.needsDepthTexture = (this.getDepthTexture() === null);

			} else {

				this.needsDepthTexture = false;

			}

			// Check if any effect transforms UVs in the fragment shader.
			if(transformedUv) {

				shaderParts.set(Section.FRAGMENT_MAIN_UV, "vec2 transformedUv = vUv;\n" +
					shaderParts.get(Section.FRAGMENT_MAIN_UV));

				defines.set("UV", "transformedUv");

			} else {

				defines.set("UV", "vUv");

			}

			// Ensure that leading preprocessor directives start at a new line.
			shaderParts.forEach(function (value, key, map) { return map.set(key, value.trim().replace(/^#/, "\n#")); });

			this.uniforms = uniforms.size;
			this.varyings = varyings;

			this.skipRendering = (id === 0);
			this.needsSwap = !this.skipRendering;

			var material = this.getFullscreenMaterial();
			material.setShaderParts(shaderParts).setDefines(defines).setUniforms(uniforms);
			material.extensions = {};

			if(extensions.size > 0) {

				// Enable required WebGL extensions.
				for(var i$3 = 0, list$3 = extensions; i$3 < list$3.length; i$3 += 1) {

					var extension$1 = list$3[i$3];

					material.extensions[extension$1] = true;

				}

			}

			this.needsUpdate = false;

		};

		/**
		 * Updates the shader material.
		 *
		 * Warning: This method triggers a relatively expensive shader recompilation.
		 *
		 * @param {WebGLRenderer} [renderer] - The renderer.
		 */

		EffectPass.prototype.recompile = function recompile (renderer) {

			this.updateMaterial();

			if(renderer !== undefined) {

				this.verifyResources(renderer);

			}

		};

		/**
		 * Returns the current depth texture.
		 *
		 * @return {Texture} The current depth texture, or null if there is none.
		 */

		EffectPass.prototype.getDepthTexture = function getDepthTexture () {

			return this.getFullscreenMaterial().uniforms.depthBuffer.value;

		};

		/**
		 * Sets the depth texture.
		 *
		 * @param {Texture} depthTexture - A depth texture.
		 * @param {Number} [depthPacking=0] - The depth packing.
		 */

		EffectPass.prototype.setDepthTexture = function setDepthTexture (depthTexture, depthPacking) {
			if ( depthPacking === void 0 ) depthPacking = 0;


			var material = this.getFullscreenMaterial();
			material.uniforms.depthBuffer.value = depthTexture;
			material.depthPacking = depthPacking;
			material.needsUpdate = true;

			for(var i = 0, list = this.effects; i < list.length; i += 1) {

				var effect = list[i];

				effect.setDepthTexture(depthTexture, depthPacking);

			}

		};

		/**
		 * Renders the effect.
		 *
		 * @param {WebGLRenderer} renderer - The renderer.
		 * @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
		 * @param {WebGLRenderTarget} outputBuffer - A frame buffer that serves as the output render target unless this pass renders to screen.
		 * @param {Number} [deltaTime] - The time between the last frame and the current one in seconds.
		 * @param {Boolean} [stencilTest] - Indicates whether a stencil mask is active.
		 */

		EffectPass.prototype.render = function render (renderer, inputBuffer, outputBuffer, deltaTime, stencilTest) {

			var material = this.getFullscreenMaterial();
			var time = material.uniforms.time.value + deltaTime;

			if(this.needsUpdate) {

				this.recompile(renderer);

			}

			for(var i = 0, list = this.effects; i < list.length; i += 1) {

				var effect = list[i];

				effect.update(renderer, inputBuffer, deltaTime);

			}

			if(!this.skipRendering || this.renderToScreen) {

				material.uniforms.inputBuffer.value = inputBuffer.texture;
				material.uniforms.time.value = (time <= this.maxTime) ? time : this.minTime;
				renderer.setRenderTarget(this.renderToScreen ? null : outputBuffer);
				renderer.render(this.scene, this.camera);

			}

		};

		/**
		 * Updates the size of this pass.
		 *
		 * @param {Number} width - The width.
		 * @param {Number} height - The height.
		 */

		EffectPass.prototype.setSize = function setSize (width, height) {

			this.getFullscreenMaterial().setSize(width, height);

			for(var i = 0, list = this.effects; i < list.length; i += 1) {

				var effect = list[i];

				effect.setSize(width, height);

			}

		};

		/**
		 * Performs initialization tasks.
		 *
		 * @param {WebGLRenderer} renderer - The renderer.
		 * @param {Boolean} alpha - Whether the renderer uses the alpha channel or not.
		 * @param {Number} frameBufferType - The type of the main frame buffers.
		 */

		EffectPass.prototype.initialize = function initialize (renderer, alpha, frameBufferType) {
			var this$1 = this;


			this.capabilities = renderer.capabilities;

			// Initialize effects before building the shader.
			for(var i = 0, list = this.effects; i < list.length; i += 1) {

				var effect = list[i];

				effect.initialize(renderer, alpha, frameBufferType);
				effect.addEventListener("change", function (event) { return this$1.handleEvent(event); });

			}

			// Initialize the fullscreen material.
			this.updateMaterial();
			this.verifyResources(renderer);

		};

		/**
		 * Deletes disposable objects.
		 *
		 * This pass will be inoperative after this method was called!
		 */

		EffectPass.prototype.dispose = function dispose () {

			Pass.prototype.dispose.call(this);

			for(var i = 0, list = this.effects; i < list.length; i += 1) {

				var effect = list[i];

				effect.dispose();

			}

		};

		/**
		 * Handles events.
		 *
		 * @param {Event} event - An event.
		 */

		EffectPass.prototype.handleEvent = function handleEvent (event) {

			switch(event.type) {

				case "change":
					this.needsUpdate = true;
					break;

			}

		};

		Object.defineProperties( EffectPass.prototype, prototypeAccessors );

		return EffectPass;
	}(Pass));

	/**
	 * A stencil mask pass.
	 *
	 * This pass requires that the input and output buffers have a stencil buffer.
	 * You can enable the stencil buffer via the {@link EffectComposer} constructor.
	 */

	var MaskPass = /*@__PURE__*/(function (Pass) {
		function MaskPass(scene, camera) {

			Pass.call(this, "MaskPass", scene, camera);

			this.needsSwap = false;

			/**
			 * A clear pass.
			 *
			 * @type {ClearPass}
			 * @private
			 */

			this.clearPass = new ClearPass(false, false, true);

			/**
			 * Inverse flag.
			 *
			 * @type {Boolean}
			 */

			this.inverse = false;

		}

		if ( Pass ) MaskPass.__proto__ = Pass;
		MaskPass.prototype = Object.create( Pass && Pass.prototype );
		MaskPass.prototype.constructor = MaskPass;

		var prototypeAccessors = { clear: { configurable: true } };

		/**
		 * Indicates whether this pass should clear the stencil buffer.
		 *
		 * @type {Boolean}
		 */

		prototypeAccessors.clear.get = function () {

			return this.clearPass.enabled;

		};

		/**
		 * Enables or disables auto clear.
		 *
		 * @type {Boolean}
		 */

		prototypeAccessors.clear.set = function (value) {

			this.clearPass.enabled = value;

		};

		/**
		 * Renders the effect.
		 *
		 * @param {WebGLRenderer} renderer - The renderer.
		 * @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
		 * @param {WebGLRenderTarget} outputBuffer - A frame buffer that serves as the output render target unless this pass renders to screen.
		 * @param {Number} [deltaTime] - The time between the last frame and the current one in seconds.
		 * @param {Boolean} [stencilTest] - Indicates whether a stencil mask is active.
		 */

		MaskPass.prototype.render = function render (renderer, inputBuffer, outputBuffer, deltaTime, stencilTest) {

			var context = renderer.getContext();
			var buffers = renderer.state.buffers;

			var scene = this.scene;
			var camera = this.camera;
			var clearPass = this.clearPass;

			var writeValue = this.inverse ? 0 : 1;
			var clearValue = 1 - writeValue;

			// Don't update color or depth.
			buffers.color.setMask(false);
			buffers.depth.setMask(false);

			// Lock the buffers.
			buffers.color.setLocked(true);
			buffers.depth.setLocked(true);

			// Configure the stencil.
			buffers.stencil.setTest(true);
			buffers.stencil.setOp(context.REPLACE, context.REPLACE, context.REPLACE);
			buffers.stencil.setFunc(context.ALWAYS, writeValue, 0xffffffff);
			buffers.stencil.setClear(clearValue);
			buffers.stencil.setLocked(true);

			// Clear the stencil.
			if(this.clear) {

				if(this.renderToScreen) {

					clearPass.render(renderer, null);

				} else {

					clearPass.render(renderer, inputBuffer);
					clearPass.render(renderer, outputBuffer);

				}

			}

			// Draw the mask.
			if(this.renderToScreen) {

				renderer.setRenderTarget(null);
				renderer.render(scene, camera);

			} else {

				renderer.setRenderTarget(inputBuffer);
				renderer.render(scene, camera);
				renderer.setRenderTarget(outputBuffer);
				renderer.render(scene, camera);

			}

			// Unlock the buffers.
			buffers.color.setLocked(false);
			buffers.depth.setLocked(false);

			// Only render where the stencil is set to 1.
			buffers.stencil.setLocked(false);
			buffers.stencil.setFunc(context.EQUAL, 1, 0xffffffff);
			buffers.stencil.setOp(context.KEEP, context.KEEP, context.KEEP);
			buffers.stencil.setLocked(true);

		};

		Object.defineProperties( MaskPass.prototype, prototypeAccessors );

		return MaskPass;
	}(Pass));

	/**
	 * A pass that renders the normals of a given scene.
	 */

	var NormalPass = /*@__PURE__*/(function (Pass) {
		function NormalPass(scene, camera, ref) {
			if ( ref === void 0 ) ref = {};
			var resolutionScale = ref.resolutionScale; if ( resolutionScale === void 0 ) resolutionScale = 1.0;
			var width = ref.width; if ( width === void 0 ) width = Resizer.AUTO_SIZE;
			var height = ref.height; if ( height === void 0 ) height = Resizer.AUTO_SIZE;
			var renderTarget = ref.renderTarget;


			Pass.call(this, "NormalPass");

			this.needsSwap = false;

			/**
			 * A render pass.
			 *
			 * @type {RenderPass}
			 * @private
			 */

			this.renderPass = new RenderPass(scene, camera, new three.MeshNormalMaterial({
				morphTargets: true,
				morphNormals: true,
				skinning: true
			}));

			var clearPass = this.renderPass.getClearPass();
			clearPass.overrideClearColor = new three.Color(0x7777ff);
			clearPass.overrideClearAlpha = 1.0;

			/**
			 * A render target that contains the scene normals.
			 *
			 * @type {WebGLRenderTarget}
			 */

			this.renderTarget = renderTarget;

			if(this.renderTarget === undefined) {

				this.renderTarget = new three.WebGLRenderTarget(1, 1, {
					minFilter: three.NearestFilter,
					magFilter: three.NearestFilter,
					format: three.RGBFormat,
					stencilBuffer: false
				});

				this.renderTarget.texture.name = "NormalPass.Target";

			}

			/**
			 * The desired render resolution.
			 *
			 * Use {@link Resizer.AUTO_SIZE} for the width or height to automatically
			 * calculate it based on its counterpart and the original aspect ratio.
			 *
			 * @type {Resizer}
			 */

			this.resolution = new Resizer(this, width, height, resolutionScale);

		}

		if ( Pass ) NormalPass.__proto__ = Pass;
		NormalPass.prototype = Object.create( Pass && Pass.prototype );
		NormalPass.prototype.constructor = NormalPass;

		var prototypeAccessors = { texture: { configurable: true } };

		/**
		 * The normal texture.
		 *
		 * @type {Texture}
		 */

		prototypeAccessors.texture.get = function () {

			return this.renderTarget.texture;

		};

		/**
		 * Returns the current resolution scale.
		 *
		 * @return {Number} The resolution scale.
		 * @deprecated Adjust the fixed resolution width or height instead.
		 */

		NormalPass.prototype.getResolutionScale = function getResolutionScale () {

			return this.resolutionScale;

		};

		/**
		 * Sets the resolution scale.
		 *
		 * @param {Number} scale - The new resolution scale.
		 * @deprecated Adjust the fixed resolution width or height instead.
		 */

		NormalPass.prototype.setResolutionScale = function setResolutionScale (scale) {

			this.resolutionScale = scale;
			this.setSize(this.resolution.base.x, this.resolution.base.y);

		};

		/**
		 * Renders the scene normals.
		 *
		 * @param {WebGLRenderer} renderer - The renderer.
		 * @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
		 * @param {WebGLRenderTarget} outputBuffer - A frame buffer that serves as the output render target unless this pass renders to screen.
		 * @param {Number} [deltaTime] - The time between the last frame and the current one in seconds.
		 * @param {Boolean} [stencilTest] - Indicates whether a stencil mask is active.
		 */

		NormalPass.prototype.render = function render (renderer, inputBuffer, outputBuffer, deltaTime, stencilTest) {

			var renderTarget = this.renderToScreen ? null : this.renderTarget;
			this.renderPass.render(renderer, renderTarget, renderTarget);

		};

		/**
		 * Updates the size of this pass.
		 *
		 * @param {Number} width - The width.
		 * @param {Number} height - The height.
		 */

		NormalPass.prototype.setSize = function setSize (width, height) {

			var resolution = this.resolution;
			resolution.base.set(width, height);

			this.renderTarget.setSize(resolution.width, resolution.height);

		};

		Object.defineProperties( NormalPass.prototype, prototypeAccessors );

		return NormalPass;
	}(Pass));

	/**
	 * A pass that renders the result from a previous pass to another render target.
	 */

	var SavePass = /*@__PURE__*/(function (Pass) {
		function SavePass(renderTarget, resize) {
			if ( resize === void 0 ) resize = true;


			Pass.call(this, "SavePass");

			this.setFullscreenMaterial(new CopyMaterial());

			this.needsSwap = false;

			/**
			 * The render target.
			 *
			 * @type {WebGLRenderTarget}
			 */

			this.renderTarget = renderTarget;

			if(renderTarget === undefined) {

				this.renderTarget = new three.WebGLRenderTarget(1, 1, {
					minFilter: three.LinearFilter,
					magFilter: three.LinearFilter,
					stencilBuffer: false,
					depthBuffer: false
				});

				this.renderTarget.texture.name = "SavePass.Target";

			}

			/**
			 * Indicates whether the render target should be resized automatically.
			 *
			 * @type {Boolean}
			 */

			this.resize = resize;

		}

		if ( Pass ) SavePass.__proto__ = Pass;
		SavePass.prototype = Object.create( Pass && Pass.prototype );
		SavePass.prototype.constructor = SavePass;

		/**
		 * Saves the input buffer.
		 *
		 * @param {WebGLRenderer} renderer - The renderer.
		 * @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
		 * @param {WebGLRenderTarget} outputBuffer - A frame buffer that serves as the output render target unless this pass renders to screen.
		 * @param {Number} [deltaTime] - The time between the last frame and the current one in seconds.
		 * @param {Boolean} [stencilTest] - Indicates whether a stencil mask is active.
		 */

		SavePass.prototype.render = function render (renderer, inputBuffer, outputBuffer, deltaTime, stencilTest) {

			this.getFullscreenMaterial().uniforms.inputBuffer.value = inputBuffer.texture;

			renderer.setRenderTarget(this.renderToScreen ? null : this.renderTarget);
			renderer.render(this.scene, this.camera);

		};

		/**
		 * Updates the size of this pass.
		 *
		 * @param {Number} width - The width.
		 * @param {Number} height - The height.
		 */

		SavePass.prototype.setSize = function setSize (width, height) {

			if(this.resize) {

				var w = Math.max(width, 1);
				var h = Math.max(height, 1);

				this.renderTarget.setSize(w, h);

			}

		};

		/**
		 * Performs initialization tasks.
		 *
		 * @param {WebGLRenderer} renderer - A renderer.
		 * @param {Boolean} alpha - Whether the renderer uses the alpha channel.
		 * @param {Number} frameBufferType - The type of the main frame buffers.
		 */

		SavePass.prototype.initialize = function initialize (renderer, alpha, frameBufferType) {

			if(!alpha && frameBufferType === three.UnsignedByteType) {

				this.renderTarget.texture.format = three.RGBFormat;

			}

			if(frameBufferType !== undefined) {

				this.renderTarget.texture.type = frameBufferType;

			}

		};

		return SavePass;
	}(Pass));

	/**
	 * A shader pass.
	 *
	 * Renders any shader material as a fullscreen effect.
	 *
	 * This pass should not be used to create multiple chained effects. For a more
	 * efficient solution, please refer to the {@link EffectPass}.
	 */

	var ShaderPass = /*@__PURE__*/(function (Pass) {
		function ShaderPass(material, input) {
			if ( input === void 0 ) input = "inputBuffer";


			Pass.call(this, "ShaderPass");

			this.setFullscreenMaterial(material);

			/**
			 * The input buffer uniform.
			 *
			 * @type {String}
			 * @private
			 */

			this.uniform = null;
			this.setInput(input);

		}

		if ( Pass ) ShaderPass.__proto__ = Pass;
		ShaderPass.prototype = Object.create( Pass && Pass.prototype );
		ShaderPass.prototype.constructor = ShaderPass;

		/**
		 * Sets the name of the input buffer uniform.
		 *
		 * Most fullscreen materials modify texels from an input texture. This pass
		 * automatically assigns the main input buffer to the uniform identified by
		 * the given name.
		 *
		 * @param {String} input - The name of the input buffer uniform.
		 */

		ShaderPass.prototype.setInput = function setInput (input) {

			var material = this.getFullscreenMaterial();

			this.uniform = null;

			if(material !== null) {

				var uniforms = material.uniforms;

				if(uniforms !== undefined && uniforms[input] !== undefined) {

					this.uniform = uniforms[input];

				}

			}

		};

		/**
		 * Renders the effect.
		 *
		 * @param {WebGLRenderer} renderer - The renderer.
		 * @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
		 * @param {WebGLRenderTarget} outputBuffer - A frame buffer that serves as the output render target unless this pass renders to screen.
		 * @param {Number} [deltaTime] - The time between the last frame and the current one in seconds.
		 * @param {Boolean} [stencilTest] - Indicates whether a stencil mask is active.
		 */

		ShaderPass.prototype.render = function render (renderer, inputBuffer, outputBuffer, deltaTime, stencilTest) {

			if(this.uniform !== null && inputBuffer !== null) {

				this.uniform.value = inputBuffer.texture;

			}

			renderer.setRenderTarget(this.renderToScreen ? null : outputBuffer);
			renderer.render(this.scene, this.camera);

		};

		return ShaderPass;
	}(Pass));

	/**
	 * The EffectComposer may be used in place of a normal WebGLRenderer.
	 *
	 * The auto clear behaviour of the provided renderer will be disabled to prevent
	 * unnecessary clear operations.
	 *
	 * It is common practice to use a {@link RenderPass} as the first pass to
	 * automatically clear the buffers and render a scene for further processing.
	 *
	 * @implements {Resizable}
	 * @implements {Disposable}
	 */

	var EffectComposer = function EffectComposer(renderer, ref) {
		if ( renderer === void 0 ) renderer = null;
		if ( ref === void 0 ) ref = {};
		var depthBuffer = ref.depthBuffer; if ( depthBuffer === void 0 ) depthBuffer = true;
		var stencilBuffer = ref.stencilBuffer; if ( stencilBuffer === void 0 ) stencilBuffer = false;
		var multisampling = ref.multisampling; if ( multisampling === void 0 ) multisampling = 0;
		var frameBufferType = ref.frameBufferType;


		/**
			 * The renderer.
			 *
			 * @type {WebGLRenderer}
			 * @private
			 */

		this.renderer = renderer;

		/**
			 * The input buffer.
			 *
			 * Reading from and writing to the same render target should be avoided.
			 * Therefore, two seperate yet identical buffers are used.
			 *
			 * @type {WebGLRenderTarget}
			 * @private
			 */

		this.inputBuffer = null;

		/**
			 * The output buffer.
			 *
			 * @type {WebGLRenderTarget}
			 * @private
			 */

		this.outputBuffer = null;

		if(this.renderer !== null) {

			this.renderer.autoClear = false;
			this.inputBuffer = this.createBuffer(depthBuffer, stencilBuffer, frameBufferType, multisampling);
			this.outputBuffer = this.inputBuffer.clone();
			this.enableExtensions();

		}

		/**
			 * A copy pass used for copying masked scenes.
			 *
			 * @type {ShaderPass}
			 * @private
			 */

		this.copyPass = new ShaderPass(new CopyMaterial());

		/**
			 * A depth texture.
			 *
			 * @type {DepthTexture}
			 * @private
			 */

		this.depthTexture = null;

		/**
			 * The passes.
			 *
			 * @type {Pass[]}
			 * @private
			 */

		this.passes = [];

		/**
			 * Determines whether the last pass automatically renders to screen.
			 *
			 * @type {Boolean}
			 */

		this.autoRenderToScreen = true;

	};

	var prototypeAccessors$2 = { multisampling: { configurable: true } };

	/**
		 * The current amount of samples used for multisample antialiasing.
		 *
		 * @type {Number}
		 */

	prototypeAccessors$2.multisampling.get = function () {

		return (this.inputBuffer instanceof three.WebGLMultisampleRenderTarget) ?
			this.inputBuffer.samples : 0;

	};

	/**
		 * Sets the amount of MSAA samples.
		 *
		 * Requires WebGL 2. Set to zero to disable multisampling.
		 *
		 * @type {Number}
		 */

	prototypeAccessors$2.multisampling.set = function (value) {

		var buffer = this.inputBuffer;
		var multisampling = this.multisampling;

		if(multisampling > 0 && value > 0) {

			this.inputBuffer.samples = value;
			this.outputBuffer.samples = value;

		} else if(multisampling !== value) {

			this.inputBuffer.dispose();
			this.outputBuffer.dispose();

			// Enable or disable MSAA.
			this.inputBuffer = this.createBuffer(
				buffer.depthBuffer,
				buffer.stencilBuffer,
				buffer.texture.type,
				value
			);

			this.outputBuffer = this.inputBuffer.clone();

		}

	};

	/**
		 * Returns the WebGL renderer.
		 *
		 * You may replace the renderer at any time by using
		 * {@link EffectComposer#replaceRenderer}.
		 *
		 * @return {WebGLRenderer} The renderer.
		 */

	EffectComposer.prototype.getRenderer = function getRenderer () {

		return this.renderer;

	};

	/**
		 * Explicitly enables required WebGL extensions.
		 *
		 * @private
		 */

	EffectComposer.prototype.enableExtensions = function enableExtensions () {

		var frameBufferType = this.inputBuffer.texture.type;
		var capabilities = this.renderer.capabilities;
		var context = this.renderer.getContext();

		if(frameBufferType !== three.UnsignedByteType) {

			if(capabilities.isWebGL2) {

				context.getExtension("EXT_color_buffer_float");

			} else {

				context.getExtension("EXT_color_buffer_half_float");

			}

		}

	};

	/**
		 * Replaces the current renderer with the given one.
		 *
		 * The auto clear mechanism of the provided renderer will be disabled. If the
		 * new render size differs from the previous one, all passes will be updated.
		 *
		 * By default, the DOM element of the current renderer will automatically be
		 * removed from its parent node and the DOM element of the new renderer will
		 * take its place.
		 *
		 * @param {WebGLRenderer} renderer - The new renderer.
		 * @param {Boolean} updateDOM - Indicates whether the old canvas should be replaced by the new one in the DOM.
		 * @return {WebGLRenderer} The old renderer.
		 */

	EffectComposer.prototype.replaceRenderer = function replaceRenderer (renderer, updateDOM) {
			if ( updateDOM === void 0 ) updateDOM = true;


		var oldRenderer = this.renderer;

		if(oldRenderer !== null && oldRenderer !== renderer) {

			var oldSize = oldRenderer.getSize(new three.Vector2());
			var newSize = renderer.getSize(new three.Vector2());
			var parent = oldRenderer.domElement.parentNode;

			this.renderer = renderer;
			this.renderer.autoClear = false;

			if(!oldSize.equals(newSize)) {

				this.setSize();

			}

			if(updateDOM && parent !== null) {

				parent.removeChild(oldRenderer.domElement);
				parent.appendChild(renderer.domElement);

			}

			this.enableExtensions();

		}

		return oldRenderer;

	};

	/**
		 * Creates a depth texture attachment that will be provided to all passes.
		 *
		 * Note: When a shader reads from a depth texture and writes to a render
		 * target that uses the same depth texture attachment, the depth information
		 * will be lost. This happens even if `depthWrite` is disabled.
		 *
		 * @private
		 * @return {DepthTexture} The depth texture.
		 */

	EffectComposer.prototype.createDepthTexture = function createDepthTexture () {

		var depthTexture = this.depthTexture = new three.DepthTexture();

		if(this.inputBuffer.stencilBuffer) {

			depthTexture.format = three.DepthStencilFormat;
			depthTexture.type = three.UnsignedInt248Type;

		} else {

			depthTexture.type = three.UnsignedIntType;

		}

		return depthTexture;

	};

	/**
		 * Deletes the current depth texture.
		 *
		 * @private
		 */

	EffectComposer.prototype.deleteDepthTexture = function deleteDepthTexture () {

		if(this.depthTexture !== null) {

			this.depthTexture.dispose();
			this.depthTexture = null;

			this.inputBuffer.depthTexture = null;
			this.outputBuffer.depthTexture = null;

			for(var i = 0, list = this.passes; i < list.length; i += 1) {

				var pass = list[i];

					pass.setDepthTexture(null);

			}

		}

	};

	/**
		 * Creates a new render target by replicating the renderer's canvas.
		 *
		 * The created render target uses a linear filter for texel minification and
		 * magnification. Its render texture format depends on whether the renderer
		 * uses the alpha channel. Mipmaps are disabled.
		 *
		 * Note: The buffer format will also be set to RGBA if the frame buffer type
		 * is HalfFloatType because RGB16F buffers are not renderable.
		 *
		 * @param {Boolean} depthBuffer - Whether the render target should have a depth buffer.
		 * @param {Boolean} stencilBuffer - Whether the render target should have a stencil buffer.
		 * @param {Number} type - The frame buffer type.
		 * @param {Number} multisampling - The number of samples to use for antialiasing.
		 * @return {WebGLRenderTarget} A new render target that equals the renderer's canvas.
		 */

	EffectComposer.prototype.createBuffer = function createBuffer (depthBuffer, stencilBuffer, type, multisampling) {

		var size = this.renderer.getDrawingBufferSize(new three.Vector2());
		var alpha = this.renderer.getContext().getContextAttributes().alpha;

		var options = {
			format: (!alpha && type === three.UnsignedByteType) ? three.RGBFormat : three.RGBAFormat,
			minFilter: three.LinearFilter,
			magFilter: three.LinearFilter,
			stencilBuffer: stencilBuffer,
			depthBuffer: depthBuffer,
			type: type
		};

		var renderTarget = (multisampling > 0) ?
			new three.WebGLMultisampleRenderTarget(size.width, size.height, options) :
			new three.WebGLRenderTarget(size.width, size.height, options);

		if(multisampling > 0) {

			renderTarget.samples = multisampling;

		}

		renderTarget.texture.name = "EffectComposer.Buffer";
		renderTarget.texture.generateMipmaps = false;

		return renderTarget;

	};

	/**
		 * Adds a pass, optionally at a specific index.
		 *
		 * @param {Pass} pass - A new pass.
		 * @param {Number} [index] - An index at which the pass should be inserted.
		 */

	EffectComposer.prototype.addPass = function addPass (pass, index) {

		var passes = this.passes;
		var renderer = this.renderer;
		var alpha = renderer.getContext().getContextAttributes().alpha;
		var frameBufferType = this.inputBuffer.texture.type;
		var drawingBufferSize = renderer.getDrawingBufferSize(new three.Vector2());

		pass.setSize(drawingBufferSize.width, drawingBufferSize.height);
		pass.initialize(renderer, alpha, frameBufferType);

		if(this.autoRenderToScreen) {

			if(passes.length > 0) {

				passes[passes.length - 1].renderToScreen = false;

			}

			if(pass.renderToScreen) {

				this.autoRenderToScreen = false;

			}

		}

		if(index !== undefined) {

			passes.splice(index, 0, pass);

		} else {

			passes.push(pass);

		}

		if(this.autoRenderToScreen) {

			passes[passes.length - 1].renderToScreen = true;

		}

		if(pass.needsDepthTexture || this.depthTexture !== null) {

			if(this.depthTexture === null) {

				var depthTexture = this.createDepthTexture();

				for(var i = 0, list = passes; i < list.length; i += 1) {

					pass = list[i];

						pass.setDepthTexture(depthTexture);

				}

			} else {

				pass.setDepthTexture(this.depthTexture);

			}

		}

	};

	/**
		 * Removes a pass.
		 *
		 * @param {Pass} pass - The pass.
		 */

	EffectComposer.prototype.removePass = function removePass (pass) {

		var passes = this.passes;
		var index = passes.indexOf(pass);
		var removed = (passes.splice(index, 1).length > 0);

		if(removed) {

			if(this.depthTexture !== null) {

				// Check if the depth texture is still required.
				var reducer = function (a, b) { return (a || b.needsDepthTexture); };
				var depthTextureRequired = passes.reduce(reducer, false);

				if(!depthTextureRequired) {

					this.deleteDepthTexture();

				}

			}

			if(this.autoRenderToScreen) {

				// Check if the removed pass was the last one.
				if(index === passes.length) {

					pass.renderToScreen = false;

					if(passes.length > 0) {

						passes[passes.length - 1].renderToScreen = true;

					}

				}

			}

		}

	};

	/**
		 * Removes all passes without deleting them.
		 */

	EffectComposer.prototype.removeAllPasses = function removeAllPasses () {

		var passes = this.passes;

		this.deleteDepthTexture();

		if(passes.length > 0) {

			if(this.autoRenderToScreen) {

				passes[passes.length - 1].renderToScreen = false;

			}

			this.passes = [];

		}

	};

	/**
		 * Renders all enabled passes in the order in which they were added.
		 *
		 * @param {Number} deltaTime - The time since the last frame in seconds.
		 */

	EffectComposer.prototype.render = function render (deltaTime) {

		var renderer = this.renderer;
		var copyPass = this.copyPass;

		var inputBuffer = this.inputBuffer;
		var outputBuffer = this.outputBuffer;

		var stencilTest = false;
		var context, stencil, buffer;

		for(var i = 0, list = this.passes; i < list.length; i += 1) {

			var pass = list[i];

				if(pass.enabled) {

				pass.render(renderer, inputBuffer, outputBuffer, deltaTime, stencilTest);

				if(pass.needsSwap) {

					if(stencilTest) {

						copyPass.renderToScreen = pass.renderToScreen;
						context = renderer.getContext();
						stencil = renderer.state.buffers.stencil;

						// Preserve the unaffected pixels.
						stencil.setFunc(context.NOTEQUAL, 1, 0xffffffff);
						copyPass.render(renderer, inputBuffer, outputBuffer, deltaTime, stencilTest);
						stencil.setFunc(context.EQUAL, 1, 0xffffffff);

					}

					buffer = inputBuffer;
					inputBuffer = outputBuffer;
					outputBuffer = buffer;

				}

				if(pass instanceof MaskPass) {

					stencilTest = true;

				} else if(pass instanceof ClearMaskPass) {

					stencilTest = false;

				}

			}

		}

	};

	/**
		 * Sets the size of the buffers and the renderer's output canvas.
		 *
		 * Every pass will be informed of the new size. It's up to each pass how that
		 * information is used.
		 *
		 * If no width or height is specified, the render targets and passes will be
		 * updated with the current size of the renderer.
		 *
		 * @param {Number} [width] - The width.
		 * @param {Number} [height] - The height.
		 * @param {Boolean} [updateStyle] - Determines whether the style of the canvas should be updated.
		 */

	EffectComposer.prototype.setSize = function setSize (width, height, updateStyle) {

		var renderer = this.renderer;

		if(width === undefined || height === undefined) {

			var size = renderer.getSize(new three.Vector2());
			width = size.width; height = size.height;

		}

		// Update the logical render size.
		renderer.setSize(width, height, updateStyle);

		// The drawing buffer size takes the device pixel ratio into account.
		var drawingBufferSize = renderer.getDrawingBufferSize(new three.Vector2());

		this.inputBuffer.setSize(drawingBufferSize.width, drawingBufferSize.height);
		this.outputBuffer.setSize(drawingBufferSize.width, drawingBufferSize.height);

		for(var i = 0, list = this.passes; i < list.length; i += 1) {

			var pass = list[i];

				pass.setSize(drawingBufferSize.width, drawingBufferSize.height);

		}

	};

	/**
		 * Resets this composer by deleting all passes and creating new buffers.
		 */

	EffectComposer.prototype.reset = function reset () {

		var renderTarget = this.inputBuffer.clone();

		this.dispose();

		// Reanimate.
		this.inputBuffer = renderTarget;
		this.outputBuffer = renderTarget.clone();
		this.depthTexture = null;
		this.copyPass = new ShaderPass(new CopyMaterial());
		this.autoRenderToScreen = true;

	};

	/**
		 * Destroys this composer and all passes.
		 *
		 * This method deallocates all disposable objects created by the passes. It
		 * also deletes the main frame buffers of this composer.
		 */

	EffectComposer.prototype.dispose = function dispose () {

		for(var i = 0, list = this.passes; i < list.length; i += 1) {

			var pass = list[i];

				pass.dispose();

		}

		this.passes = [];

		if(this.inputBuffer !== null) {

			this.inputBuffer.dispose();
			this.inputBuffer = null;

		}

		if(this.outputBuffer !== null) {

			this.outputBuffer.dispose();
			this.outputBuffer = null;

		}

		if(this.depthTexture !== null) {

			this.depthTexture.dispose();

		}

		this.copyPass.dispose();

	};

	Object.defineProperties( EffectComposer.prototype, prototypeAccessors$2 );

	/**
	 * The initializable contract.
	 *
	 * Implemented by objects that can be initialized.
	 *
	 * @interface
	 */

	var Initializable = function Initializable () {};

	Initializable.prototype.initialize = function initialize (renderer, alpha, frameBufferType) {};

	/**
	 * The Resizable contract.
	 *
	 * Implemented by objects that can be resized.
	 *
	 * @interface
	 */

	var Resizable = function Resizable () {};

	Resizable.prototype.setSize = function setSize (width, height) {};

	/**
	 * An object selection.
	 *
	 * Object selections use render layers to facilitate quick and efficient
	 * visibility changes.
	 */

	var Selection = /*@__PURE__*/(function (Set) {
		function Selection(iterable, layer) {
			if ( layer === void 0 ) layer = 10;


			Set.call(this);

			/**
			 * The current render layer for selected objects.
			 *
			 * @type {Number}
			 * @private
			 */

			this.currentLayer = layer;

			if(iterable !== undefined) {

				this.set(iterable);

			}

		}

		if ( Set ) Selection.__proto__ = Set;
		Selection.prototype = Object.create( Set && Set.prototype );
		Selection.prototype.constructor = Selection;

		var prototypeAccessors = { layer: { configurable: true } };

		/**
		 * A dedicated render layer for selected objects.
		 *
		 * This layer is set to 10 by default. If this collides with your own custom
		 * layers, please change it to a free layer before rendering!
		 *
		 * @type {Number}
		 */

		prototypeAccessors.layer.get = function () {

			return this.currentLayer;

		};

		/**
		 * Sets the render layer of selected objects.
		 *
		 * The current selection will be updated accordingly.
		 *
		 * @type {Number}
		 */

		prototypeAccessors.layer.set = function (value) {

			var currentLayer = this.currentLayer;

			for(var i = 0, list = this; i < list.length; i += 1) {

				var object = list[i];

				object.layers.disable(currentLayer);
				object.layers.enable(value);

			}

			this.currentLayer = value;

		};

		/**
		 * Clears this selection.
		 *
		 * @return {Selection} This selection.
		 */

		Selection.prototype.clear = function clear () {

			var layer = this.layer;

			for(var i = 0, list = this; i < list.length; i += 1) {

				var object = list[i];

				object.layers.disable(layer);

			}

			return Set.prototype.clear.call(this);

		};

		/**
		 * Clears this selection and adds the given objects.
		 *
		 * @param {Iterable<Object3D>} objects - The objects that should be selected. This array will be copied.
		 * @return {Selection} This selection.
		 */

		Selection.prototype.set = function set (objects) {

			this.clear();

			for(var i = 0, list = objects; i < list.length; i += 1) {

				var object = list[i];

				this.add(object);

			}

			return this;

		};

		/**
		 * An alias for {@link has}.
		 *
		 * @param {Object3D} object - An object.
		 * @return {Number} Returns 0 if the given object is currently selected, or -1 otherwise.
		 * @deprecated Added for backward compatibility. Use has instead.
		 */

		Selection.prototype.indexOf = function indexOf (object) {

			return this.has(object) ? 0 : -1;

		};

		/**
		 * Adds an object to this selection.
		 *
		 * @param {Object3D} object - The object that should be selected.
		 * @return {Selection} This selection.
		 */

		Selection.prototype.add = function add (object) {

			object.layers.enable(this.layer);
			Set.prototype.add.call(this, object);

			return this;

		};

		/**
		 * Removes an object from this selection.
		 *
		 * @param {Object3D} object - The object that should be deselected.
		 * @return {Boolean} Returns true if an object has successfully been removed from this selection; otherwise false.
		 */

		Selection.prototype.delete = function delete$1 (object) {

			if(this.has(object)) {

				object.layers.disable(this.layer);

			}

			return Set.prototype.delete.call(this, object);

		};

		/**
		 * Sets the visibility of all selected objects.
		 *
		 * This method enables or disables render layer 0 of all selected objects.
		 *
		 * @param {Boolean} visible - Whether the selected objects should be visible.
		 * @return {Selection} This selection.
		 */

		Selection.prototype.setVisible = function setVisible (visible) {

			for(var i = 0, list = this; i < list.length; i += 1) {

				var object = list[i];

				if(visible) {

					object.layers.enable(0);

				} else {

					object.layers.disable(0);

				}

			}

			return this;

		};

		Object.defineProperties( Selection.prototype, prototypeAccessors );

		return Selection;
	}(Set));

	var fragmentShader$e = "uniform sampler2D texture;uniform float intensity;void mainImage(const in vec4 inputColor,const in vec2 uv,out vec4 outputColor){outputColor=clamp(texture2D(texture,uv)*intensity,0.0,1.0);}";

	/**
	 * A bloom effect.
	 *
	 * This effect uses the fast Kawase convolution technique and a luminance filter
	 * to blur bright highlights.
	 */

	var BloomEffect = /*@__PURE__*/(function (Effect) {
		function BloomEffect(ref) {
			if ( ref === void 0 ) ref = {};
			var blendFunction = ref.blendFunction; if ( blendFunction === void 0 ) blendFunction = BlendFunction.SCREEN;
			var luminanceThreshold = ref.luminanceThreshold; if ( luminanceThreshold === void 0 ) luminanceThreshold = 0.9;
			var luminanceSmoothing = ref.luminanceSmoothing; if ( luminanceSmoothing === void 0 ) luminanceSmoothing = 0.025;
			var resolutionScale = ref.resolutionScale; if ( resolutionScale === void 0 ) resolutionScale = 0.5;
			var intensity = ref.intensity; if ( intensity === void 0 ) intensity = 1.0;
			var width = ref.width; if ( width === void 0 ) width = Resizer.AUTO_SIZE;
			var height = ref.height; if ( height === void 0 ) height = Resizer.AUTO_SIZE;
			var kernelSize = ref.kernelSize; if ( kernelSize === void 0 ) kernelSize = KernelSize.LARGE;


			Effect.call(this, "BloomEffect", fragmentShader$e, {

				blendFunction: blendFunction,

				uniforms: new Map([
					["texture", new three.Uniform(null)],
					["intensity", new three.Uniform(intensity)]
				])

			});

			/**
			 * A render target.
			 *
			 * @type {WebGLRenderTarget}
			 * @private
			 */

			this.renderTarget = new three.WebGLRenderTarget(1, 1, {
				minFilter: three.LinearFilter,
				magFilter: three.LinearFilter,
				stencilBuffer: false,
				depthBuffer: false
			});

			this.renderTarget.texture.name = "Bloom.Target";
			this.renderTarget.texture.generateMipmaps = false;

			this.uniforms.get("texture").value = this.renderTarget.texture;

			/**
			 * A blur pass.
			 *
			 * @type {BlurPass}
			 */

			this.blurPass = new BlurPass({ resolutionScale: resolutionScale, width: width, height: height, kernelSize: kernelSize });
			this.blurPass.resolution.resizable = this;

			/**
			 * A luminance shader pass.
			 *
			 * You may disable this pass to deactivate luminance filtering.
			 *
			 * @type {ShaderPass}
			 */

			this.luminancePass = new ShaderPass(new LuminanceMaterial(true));

			this.luminanceMaterial.threshold = luminanceThreshold;
			this.luminanceMaterial.smoothing = luminanceSmoothing;

		}

		if ( Effect ) BloomEffect.__proto__ = Effect;
		BloomEffect.prototype = Object.create( Effect && Effect.prototype );
		BloomEffect.prototype.constructor = BloomEffect;

		var prototypeAccessors = { texture: { configurable: true },luminanceMaterial: { configurable: true },resolution: { configurable: true },width: { configurable: true },height: { configurable: true },dithering: { configurable: true },kernelSize: { configurable: true },distinction: { configurable: true },intensity: { configurable: true } };

		/**
		 * A texture that contains the intermediate result of this effect.
		 *
		 * This texture will be applied to the scene colors unless the blend function
		 * is set to `SKIP`.
		 *
		 * @type {Texture}
		 */

		prototypeAccessors.texture.get = function () {

			return this.renderTarget.texture;

		};

		/**
		 * The luminance material.
		 *
		 * @type {LuminanceMaterial}
		 */

		prototypeAccessors.luminanceMaterial.get = function () {

			return this.luminancePass.getFullscreenMaterial();

		};

		/**
		 * The resolution of this effect.
		 *
		 * @type {Resizer}
		 */

		prototypeAccessors.resolution.get = function () {

			return this.blurPass.resolution;

		};

		/**
		 * The current width of the internal render targets.
		 *
		 * @type {Number}
		 * @deprecated Use resolution.width instead.
		 */

		prototypeAccessors.width.get = function () {

			return this.resolution.width;

		};

		/**
		 * Sets the render width.
		 *
		 * @type {Number}
		 * @deprecated Use resolution.width instead.
		 */

		prototypeAccessors.width.set = function (value) {

			this.resolution.width = value;

		};

		/**
		 * The current height of the internal render targets.
		 *
		 * @type {Number}
		 * @deprecated Use resolution.height instead.
		 */

		prototypeAccessors.height.get = function () {

			return this.resolution.height;

		};

		/**
		 * Sets the render height.
		 *
		 * @type {Number}
		 * @deprecated Use resolution.height instead.
		 */

		prototypeAccessors.height.set = function (value) {

			this.resolution.height = value;

		};

		/**
		 * Indicates whether dithering is enabled.
		 *
		 * @type {Boolean}
		 * @deprecated Set the frameBufferType of the EffectComposer to HalfFloatType instead.
		 */

		prototypeAccessors.dithering.get = function () {

			return this.blurPass.dithering;

		};

		/**
		 * Enables or disables dithering.
		 *
		 * @type {Boolean}
		 * @deprecated Set the frameBufferType of the EffectComposer to HalfFloatType instead.
		 */

		prototypeAccessors.dithering.set = function (value) {

			this.blurPass.dithering = value;

		};

		/**
		 * The blur kernel size.
		 *
		 * @type {KernelSize}
		 * @deprecated Use blurPass.kernelSize instead.
		 */

		prototypeAccessors.kernelSize.get = function () {

			return this.blurPass.kernelSize;

		};

		/**
		 * @type {KernelSize}
		 * @deprecated Use blurPass.kernelSize instead.
		 */

		prototypeAccessors.kernelSize.set = function (value) {

			this.blurPass.kernelSize = value;

		};

		/**
		 * @type {Number}
		 * @deprecated Use luminanceMaterial.threshold and luminanceMaterial.smoothing instead.
		 */

		prototypeAccessors.distinction.get = function () {

			console.warn(this.name, "The distinction field has been removed, use luminanceMaterial.threshold and luminanceMaterial.smoothing instead.");

			return 1.0;

		};

		/**
		 * @type {Number}
		 * @deprecated Use luminanceMaterial.threshold and luminanceMaterial.smoothing instead.
		 */

		prototypeAccessors.distinction.set = function (value) {

			console.warn(this.name, "The distinction field has been removed, use luminanceMaterial.threshold and luminanceMaterial.smoothing instead.");

		};

		/**
		 * The bloom intensity.
		 *
		 * @type {Number}
		 */

		prototypeAccessors.intensity.get = function () {

			return this.uniforms.get("intensity").value;

		};

		/**
		 * Sets the bloom intensity.
		 *
		 * @type {Number}
		 */

		prototypeAccessors.intensity.set = function (value) {

			this.uniforms.get("intensity").value = value;

		};

		/**
		 * Returns the current resolution scale.
		 *
		 * @return {Number} The resolution scale.
		 * @deprecated Adjust the fixed resolution width or height instead.
		 */

		BloomEffect.prototype.getResolutionScale = function getResolutionScale () {

			return this.resolution.scale;

		};

		/**
		 * Sets the resolution scale.
		 *
		 * @param {Number} scale - The new resolution scale.
		 * @deprecated Adjust the fixed resolution width or height instead.
		 */

		BloomEffect.prototype.setResolutionScale = function setResolutionScale (scale) {

			this.resolution.scale = scale;

		};

		/**
		 * Updates this effect.
		 *
		 * @param {WebGLRenderer} renderer - The renderer.
		 * @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
		 * @param {Number} [deltaTime] - The time between the last frame and the current one in seconds.
		 */

		BloomEffect.prototype.update = function update (renderer, inputBuffer, deltaTime) {

			var renderTarget = this.renderTarget;

			if(this.luminancePass.enabled) {

				this.luminancePass.render(renderer, inputBuffer, renderTarget);
				this.blurPass.render(renderer, renderTarget, renderTarget);

			} else {

				this.blurPass.render(renderer, inputBuffer, renderTarget);

			}

		};

		/**
		 * Updates the size of internal render targets.
		 *
		 * @param {Number} width - The width.
		 * @param {Number} height - The height.
		 */

		BloomEffect.prototype.setSize = function setSize (width, height) {

			this.blurPass.setSize(width, height);
			this.renderTarget.setSize(this.resolution.width, this.resolution.height);

		};

		/**
		 * Performs initialization tasks.
		 *
		 * @param {WebGLRenderer} renderer - The renderer.
		 * @param {Boolean} alpha - Whether the renderer uses the alpha channel or not.
		 * @param {Number} frameBufferType - The type of the main frame buffers.
		 */

		BloomEffect.prototype.initialize = function initialize (renderer, alpha, frameBufferType) {

			this.blurPass.initialize(renderer, alpha, frameBufferType);

			if(!alpha && frameBufferType === three.UnsignedByteType) {

				this.renderTarget.texture.format = three.RGBFormat;

			}

			if(frameBufferType !== undefined) {

				this.renderTarget.texture.type = frameBufferType;

			}

		};

		Object.defineProperties( BloomEffect.prototype, prototypeAccessors );

		return BloomEffect;
	}(Effect));

	var fragmentShader$f = "uniform float focus;uniform float dof;uniform float aperture;uniform float maxBlur;void mainImage(const in vec4 inputColor,const in vec2 uv,const in float depth,out vec4 outputColor){vec2 aspectCorrection=vec2(1.0,aspect);\n#ifdef PERSPECTIVE_CAMERA\nfloat viewZ=perspectiveDepthToViewZ(depth,cameraNear,cameraFar);float linearDepth=viewZToOrthographicDepth(viewZ,cameraNear,cameraFar);\n#else\nfloat linearDepth=depth;\n#endif\nfloat focusNear=clamp(focus-dof,0.0,1.0);float focusFar=clamp(focus+dof,0.0,1.0);float low=step(linearDepth,focusNear);float high=step(focusFar,linearDepth);float factor=(linearDepth-focusNear)*low+(linearDepth-focusFar)*high;vec2 dofBlur=vec2(clamp(factor*aperture,-maxBlur,maxBlur));vec2 dofblur9=dofBlur*0.9;vec2 dofblur7=dofBlur*0.7;vec2 dofblur4=dofBlur*0.4;vec4 color=inputColor;color+=texture2D(inputBuffer,uv+(vec2(0.0,0.4)*aspectCorrection)*dofBlur);color+=texture2D(inputBuffer,uv+(vec2(0.15,0.37)*aspectCorrection)*dofBlur);color+=texture2D(inputBuffer,uv+(vec2(0.29,0.29)*aspectCorrection)*dofBlur);color+=texture2D(inputBuffer,uv+(vec2(-0.37,0.15)*aspectCorrection)*dofBlur);color+=texture2D(inputBuffer,uv+(vec2(0.40,0.0)*aspectCorrection)*dofBlur);color+=texture2D(inputBuffer,uv+(vec2(0.37,-0.15)*aspectCorrection)*dofBlur);color+=texture2D(inputBuffer,uv+(vec2(0.29,-0.29)*aspectCorrection)*dofBlur);color+=texture2D(inputBuffer,uv+(vec2(-0.15,-0.37)*aspectCorrection)*dofBlur);color+=texture2D(inputBuffer,uv+(vec2(0.0,-0.4)*aspectCorrection)*dofBlur);color+=texture2D(inputBuffer,uv+(vec2(-0.15,0.37)*aspectCorrection)*dofBlur);color+=texture2D(inputBuffer,uv+(vec2(-0.29,0.29)*aspectCorrection)*dofBlur);color+=texture2D(inputBuffer,uv+(vec2(0.37,0.15)*aspectCorrection)*dofBlur);color+=texture2D(inputBuffer,uv+(vec2(-0.4,0.0)*aspectCorrection)*dofBlur);color+=texture2D(inputBuffer,uv+(vec2(-0.37,-0.15)*aspectCorrection)*dofBlur);color+=texture2D(inputBuffer,uv+(vec2(-0.29,-0.29)*aspectCorrection)*dofBlur);color+=texture2D(inputBuffer,uv+(vec2(0.15,-0.37)*aspectCorrection)*dofBlur);color+=texture2D(inputBuffer,uv+(vec2(0.15,0.37)*aspectCorrection)*dofblur9);color+=texture2D(inputBuffer,uv+(vec2(-0.37,0.15)*aspectCorrection)*dofblur9);color+=texture2D(inputBuffer,uv+(vec2(0.37,-0.15)*aspectCorrection)*dofblur9);color+=texture2D(inputBuffer,uv+(vec2(-0.15,-0.37)*aspectCorrection)*dofblur9);color+=texture2D(inputBuffer,uv+(vec2(-0.15,0.37)*aspectCorrection)*dofblur9);color+=texture2D(inputBuffer,uv+(vec2(0.37,0.15)*aspectCorrection)*dofblur9);color+=texture2D(inputBuffer,uv+(vec2(-0.37,-0.15)*aspectCorrection)*dofblur9);color+=texture2D(inputBuffer,uv+(vec2(0.15,-0.37)*aspectCorrection)*dofblur9);color+=texture2D(inputBuffer,uv+(vec2(0.29,0.29)*aspectCorrection)*dofblur7);color+=texture2D(inputBuffer,uv+(vec2(0.40,0.0)*aspectCorrection)*dofblur7);color+=texture2D(inputBuffer,uv+(vec2(0.29,-0.29)*aspectCorrection)*dofblur7);color+=texture2D(inputBuffer,uv+(vec2(0.0,-0.4)*aspectCorrection)*dofblur7);color+=texture2D(inputBuffer,uv+(vec2(-0.29,0.29)*aspectCorrection)*dofblur7);color+=texture2D(inputBuffer,uv+(vec2(-0.4,0.0)*aspectCorrection)*dofblur7);color+=texture2D(inputBuffer,uv+(vec2(-0.29,-0.29)*aspectCorrection)*dofblur7);color+=texture2D(inputBuffer,uv+(vec2(0.0,0.4)*aspectCorrection)*dofblur7);color+=texture2D(inputBuffer,uv+(vec2(0.29,0.29)*aspectCorrection)*dofblur4);color+=texture2D(inputBuffer,uv+(vec2(0.4,0.0)*aspectCorrection)*dofblur4);color+=texture2D(inputBuffer,uv+(vec2(0.29,-0.29)*aspectCorrection)*dofblur4);color+=texture2D(inputBuffer,uv+(vec2(0.0,-0.4)*aspectCorrection)*dofblur4);color+=texture2D(inputBuffer,uv+(vec2(-0.29,0.29)*aspectCorrection)*dofblur4);color+=texture2D(inputBuffer,uv+(vec2(-0.4,0.0)*aspectCorrection)*dofblur4);color+=texture2D(inputBuffer,uv+(vec2(-0.29,-0.29)*aspectCorrection)*dofblur4);color+=texture2D(inputBuffer,uv+(vec2(0.0,0.4)*aspectCorrection)*dofblur4);outputColor=color/41.0;}";

	/**
	 * A depth of field (bokeh) effect.
	 *
	 * Original shader code by Martins Upitis:
	 *  http://artmartinsh.blogspot.com/2010/02/glsl-lens-blur-filter-with-bokeh.html
	 *
	 * @deprecated Use DepthOfFieldEffect instead.
	 */

	var BokehEffect = /*@__PURE__*/(function (Effect) {
		function BokehEffect(ref) {
			if ( ref === void 0 ) ref = {};
			var blendFunction = ref.blendFunction; if ( blendFunction === void 0 ) blendFunction = BlendFunction.NORMAL;
			var focus = ref.focus; if ( focus === void 0 ) focus = 0.5;
			var dof = ref.dof; if ( dof === void 0 ) dof = 0.02;
			var aperture = ref.aperture; if ( aperture === void 0 ) aperture = 0.015;
			var maxBlur = ref.maxBlur; if ( maxBlur === void 0 ) maxBlur = 1.0;


			Effect.call(this, "BokehEffect", fragmentShader$f, {

				blendFunction: blendFunction,
				attributes: EffectAttribute.CONVOLUTION | EffectAttribute.DEPTH,

				uniforms: new Map([
					["focus", new three.Uniform(focus)],
					["dof", new three.Uniform(dof)],
					["aperture", new three.Uniform(aperture)],
					["maxBlur", new three.Uniform(maxBlur)]
				])

			});

		}

		if ( Effect ) BokehEffect.__proto__ = Effect;
		BokehEffect.prototype = Object.create( Effect && Effect.prototype );
		BokehEffect.prototype.constructor = BokehEffect;

		return BokehEffect;
	}(Effect));

	var fragmentShader$g = "uniform float brightness;uniform float contrast;void mainImage(const in vec4 inputColor,const in vec2 uv,out vec4 outputColor){vec3 color=inputColor.rgb+vec3(brightness-0.5);if(contrast>0.0){color/=vec3(1.0-contrast);}else{color*=vec3(1.0+contrast);}outputColor=vec4(min(color+vec3(0.5),1.0),inputColor.a);}";

	/**
	 * A brightness/contrast effect.
	 *
	 * Reference: https://github.com/evanw/glfx.js
	 */

	var BrightnessContrastEffect = /*@__PURE__*/(function (Effect) {
		function BrightnessContrastEffect(ref) {
			if ( ref === void 0 ) ref = {};
			var blendFunction = ref.blendFunction; if ( blendFunction === void 0 ) blendFunction = BlendFunction.NORMAL;
			var brightness = ref.brightness; if ( brightness === void 0 ) brightness = 0.0;
			var contrast = ref.contrast; if ( contrast === void 0 ) contrast = 0.0;


			Effect.call(this, "BrightnessContrastEffect", fragmentShader$g, {

				blendFunction: blendFunction,

				uniforms: new Map([
					["brightness", new three.Uniform(brightness)],
					["contrast", new three.Uniform(contrast)]
				])

			});

		}

		if ( Effect ) BrightnessContrastEffect.__proto__ = Effect;
		BrightnessContrastEffect.prototype = Object.create( Effect && Effect.prototype );
		BrightnessContrastEffect.prototype.constructor = BrightnessContrastEffect;

		return BrightnessContrastEffect;
	}(Effect));

	var fragmentShader$h = "void mainImage(const in vec4 inputColor,const in vec2 uv,out vec4 outputColor){float sum=inputColor.r+inputColor.g+inputColor.b;outputColor=vec4(vec3(sum/3.0),inputColor.a);}";

	/**
	 * A color average effect.
	 */

	var ColorAverageEffect = /*@__PURE__*/(function (Effect) {
		function ColorAverageEffect(blendFunction) {
			if ( blendFunction === void 0 ) blendFunction = BlendFunction.NORMAL;


			Effect.call(this, "ColorAverageEffect", fragmentShader$h, { blendFunction: blendFunction });

		}

		if ( Effect ) ColorAverageEffect.__proto__ = Effect;
		ColorAverageEffect.prototype = Object.create( Effect && Effect.prototype );
		ColorAverageEffect.prototype.constructor = ColorAverageEffect;

		return ColorAverageEffect;
	}(Effect));

	var fragmentShader$i = "uniform float factor;void mainImage(const in vec4 inputColor,const in vec2 uv,out vec4 outputColor){outputColor=vec4(floor(inputColor.rgb*factor+0.5)/factor,inputColor.a);}";

	/**
	 * A color depth effect.
	 *
	 * Simulates a hardware limitation to achieve a retro feel.
	 */

	var ColorDepthEffect = /*@__PURE__*/(function (Effect) {
		function ColorDepthEffect(ref) {
			if ( ref === void 0 ) ref = {};
			var blendFunction = ref.blendFunction; if ( blendFunction === void 0 ) blendFunction = BlendFunction.NORMAL;
			var bits = ref.bits; if ( bits === void 0 ) bits = 16;


			Effect.call(this, "ColorDepthEffect", fragmentShader$i, {

				blendFunction: blendFunction,

				uniforms: new Map([
					["factor", new three.Uniform(1.0)]
				])

			});

			/**
			 * The current amount of bits.
			 *
			 * @type {Number}
			 * @private
			 */

			this.bits = 0;

			this.setBitDepth(bits);

		}

		if ( Effect ) ColorDepthEffect.__proto__ = Effect;
		ColorDepthEffect.prototype = Object.create( Effect && Effect.prototype );
		ColorDepthEffect.prototype.constructor = ColorDepthEffect;

		/**
		 * Returns the current color bit depth.
		 *
		 * @return {Number} The color bit depth.
		 */

		ColorDepthEffect.prototype.getBitDepth = function getBitDepth () {

			return this.bits;

		};

		/**
		 * Sets the virtual amount of color bits.
		 *
		 * Each color channel will use a third of the available bits. The alpha
		 * channel remains unaffected.
		 *
		 * Note that the real color depth will not be altered by this effect.
		 *
		 * @param {Number} bits - The new color bit depth.
		 */

		ColorDepthEffect.prototype.setBitDepth = function setBitDepth (bits) {

			this.bits = bits;
			this.uniforms.get("factor").value = Math.pow(2.0, bits / 3.0);

		};

		return ColorDepthEffect;
	}(Effect));

	var fragmentShader$j = "varying vec2 vUvR;varying vec2 vUvB;void mainImage(const in vec4 inputColor,const in vec2 uv,out vec4 outputColor){vec4 color=inputColor;\n#ifdef ALPHA\nvec2 ra=texture2D(inputBuffer,vUvR).ra;vec2 ba=texture2D(inputBuffer,vUvB).ba;color.r=ra.x;color.b=ba.x;color.a=max(max(ra.y,ba.y),inputColor.a);\n#else\ncolor.r=texture2D(inputBuffer,vUvR).r;color.b=texture2D(inputBuffer,vUvB).b;\n#endif\noutputColor=color;}";

	var vertexShader$8 = "uniform vec2 offset;varying vec2 vUvR;varying vec2 vUvB;void mainSupport(const in vec2 uv){vUvR=uv+offset;vUvB=uv-offset;}";

	/**
	 * A chromatic aberration effect.
	 */

	var ChromaticAberrationEffect = /*@__PURE__*/(function (Effect) {
		function ChromaticAberrationEffect(ref) {
			if ( ref === void 0 ) ref = {};
			var blendFunction = ref.blendFunction; if ( blendFunction === void 0 ) blendFunction = BlendFunction.NORMAL;
			var offset = ref.offset; if ( offset === void 0 ) offset = new three.Vector2(0.001, 0.0005);


			Effect.call(this, "ChromaticAberrationEffect", fragmentShader$j, {

				vertexShader: vertexShader$8,
				blendFunction: blendFunction,
				attributes: EffectAttribute.CONVOLUTION,

				uniforms: new Map([
					["offset", new three.Uniform(offset)]
				])

			});

		}

		if ( Effect ) ChromaticAberrationEffect.__proto__ = Effect;
		ChromaticAberrationEffect.prototype = Object.create( Effect && Effect.prototype );
		ChromaticAberrationEffect.prototype.constructor = ChromaticAberrationEffect;

		var prototypeAccessors = { offset: { configurable: true } };

		/**
		 * The color offset.
		 *
		 * @type {Vector2}
		 */

		prototypeAccessors.offset.get = function () {

			return this.uniforms.get("offset").value;

		};

		/**
		 * @type {Vector2}
		 */

		prototypeAccessors.offset.set = function (value) {

			this.uniforms.get("offset").value = value;

		};

		/**
		 * Performs initialization tasks.
		 *
		 * @param {WebGLRenderer} renderer - The renderer.
		 * @param {Boolean} alpha - Whether the renderer uses the alpha channel or not.
		 * @param {Number} frameBufferType - The type of the main frame buffers.
		 */

		ChromaticAberrationEffect.prototype.initialize = function initialize (renderer, alpha, frameBufferType) {

			if(alpha) {

				this.defines.set("ALPHA", "1");

			} else {

				this.defines.delete("ALPHA");

			}

		};

		Object.defineProperties( ChromaticAberrationEffect.prototype, prototypeAccessors );

		return ChromaticAberrationEffect;
	}(Effect));

	var fragmentShader$k = "void mainImage(const in vec4 inputColor,const in vec2 uv,const in float depth,out vec4 outputColor){\n#ifdef INVERTED\nvec3 color=vec3(1.0-depth);\n#else\nvec3 color=vec3(depth);\n#endif\noutputColor=vec4(color,inputColor.a);}";

	/**
	 * A depth visualization effect.
	 *
	 * Useful for debugging.
	 */

	var DepthEffect = /*@__PURE__*/(function (Effect) {
		function DepthEffect(ref) {
			if ( ref === void 0 ) ref = {};
			var blendFunction = ref.blendFunction; if ( blendFunction === void 0 ) blendFunction = BlendFunction.NORMAL;
			var inverted = ref.inverted; if ( inverted === void 0 ) inverted = false;


			Effect.call(this, "DepthEffect", fragmentShader$k, {

				blendFunction: blendFunction,
				attributes: EffectAttribute.DEPTH

			});

			this.inverted = inverted;

		}

		if ( Effect ) DepthEffect.__proto__ = Effect;
		DepthEffect.prototype = Object.create( Effect && Effect.prototype );
		DepthEffect.prototype.constructor = DepthEffect;

		var prototypeAccessors = { inverted: { configurable: true } };

		/**
		 * Indicates whether depth should be inverted.
		 *
		 * @type {Boolean}
		 */

		prototypeAccessors.inverted.get = function () {

			return this.defines.has("INVERTED");

		};

		/**
		 * Enables or disables depth inversion.
		 *
		 * @type {Boolean}
		 */

		prototypeAccessors.inverted.set = function (value) {

			if(this.inverted !== value) {

				if(value) {

					this.defines.set("INVERTED", "1");

				} else {

					this.defines.delete("INVERTED");

				}

				this.setChanged();

			}

		};

		Object.defineProperties( DepthEffect.prototype, prototypeAccessors );

		return DepthEffect;
	}(Effect));

	var fragmentShader$l = "uniform sampler2D nearColorBuffer;uniform sampler2D farColorBuffer;uniform sampler2D nearCoCBuffer;uniform float scale;void mainImage(const in vec4 inputColor,const in vec2 uv,const in float depth,out vec4 outputColor){vec4 colorNear=texture2D(nearColorBuffer,uv);vec4 colorFar=texture2D(farColorBuffer,uv);float CoCNear=texture2D(nearCoCBuffer,uv).r;CoCNear=min(CoCNear*scale,1.0);vec4 result=inputColor*(1.0-colorFar.a)+colorFar;result=mix(result,colorNear,CoCNear);outputColor=result;}";

	/**
	 * A depth of field effect.
	 *
	 * Based on a graphics study by Adrian Courrèges and an article by Steve Avery:
	 *  https://www.adriancourreges.com/blog/2016/09/09/doom-2016-graphics-study/
	 *  https://pixelmischiefblog.wordpress.com/2016/11/25/bokeh-depth-of-field/
	 */

	var DepthOfFieldEffect = /*@__PURE__*/(function (Effect) {
		function DepthOfFieldEffect(camera, ref) {
			if ( ref === void 0 ) ref = {};
			var blendFunction = ref.blendFunction; if ( blendFunction === void 0 ) blendFunction = BlendFunction.NORMAL;
			var focusDistance = ref.focusDistance; if ( focusDistance === void 0 ) focusDistance = 0.0;
			var focalLength = ref.focalLength; if ( focalLength === void 0 ) focalLength = 0.1;
			var bokehScale = ref.bokehScale; if ( bokehScale === void 0 ) bokehScale = 1.0;
			var width = ref.width; if ( width === void 0 ) width = Resizer.AUTO_SIZE;
			var height = ref.height; if ( height === void 0 ) height = Resizer.AUTO_SIZE;


			Effect.call(this, "DepthOfFieldEffect", fragmentShader$l, {

				blendFunction: blendFunction,
				attributes: EffectAttribute.DEPTH,

				uniforms: new Map([
					["nearColorBuffer", new three.Uniform(null)],
					["farColorBuffer", new three.Uniform(null)],
					["nearCoCBuffer", new three.Uniform(null)],
					["scale", new three.Uniform(1.0)]
				])

			});

			/**
			 * The main camera.
			 *
			 * @type {Camera}
			 * @private
			 */

			this.camera = camera;

			/**
			 * A render target for intermediate results.
			 *
			 * @type {WebGLRenderTarget}
			 * @private
			 */

			this.renderTarget = new three.WebGLRenderTarget(1, 1, {
				minFilter: three.LinearFilter,
				magFilter: three.LinearFilter,
				stencilBuffer: false,
				depthBuffer: false
			});

			this.renderTarget.texture.name = "DoF.Intermediate";
			this.renderTarget.texture.generateMipmaps = false;

			/**
			 * A render target for masked background colors (premultiplied with CoC).
			 *
			 * @type {WebGLRenderTarget}
			 * @private
			 */

			this.renderTargetMasked = this.renderTarget.clone();
			this.renderTargetMasked.texture.name = "DoF.Masked.Far";

			/**
			 * A render target for the blurred foreground colors.
			 *
			 * @type {WebGLRenderTarget}
			 * @private
			 */

			this.renderTargetNear = this.renderTarget.clone();
			this.renderTargetNear.texture.name = "DoF.Bokeh.Near";

			this.uniforms.get("nearColorBuffer").value = this.renderTargetNear.texture;

			/**
			 * A render target for the blurred background colors.
			 *
			 * @type {WebGLRenderTarget}
			 * @private
			 */

			this.renderTargetFar = this.renderTarget.clone();
			this.renderTargetFar.texture.name = "DoF.Bokeh.Far";

			this.uniforms.get("farColorBuffer").value = this.renderTargetFar.texture;

			/**
			 * A render target for the circle of confusion.
			 *
			 * - Negative values are stored in the `RED` channel (foreground).
			 * - Positive values are stored in the `GREEN` channel (background).
			 *
			 * @type {WebGLRenderTarget}
			 * @private
			 */

			this.renderTargetCoC = this.renderTarget.clone();
			this.renderTargetCoC.texture.format = three.RGBFormat;
			this.renderTargetCoC.texture.name = "DoF.CoC";

			/**
			 * A render target that stores a blurred copy of the circle of confusion.
			 *
			 * @type {WebGLRenderTarget}
			 * @private
			 */

			this.renderTargetCoCBlurred = this.renderTargetCoC.clone();
			this.renderTargetCoCBlurred.texture.name = "DoF.CoC.Blurred";

			this.uniforms.get("nearCoCBuffer").value = this.renderTargetCoCBlurred.texture;

			/**
			 * A circle of confusion pass.
			 *
			 * @type {ShaderPass}
			 * @private
			 */

			this.cocPass = new ShaderPass(new CircleOfConfusionMaterial(camera));
			var cocMaterial = this.circleOfConfusionMaterial;
			cocMaterial.uniforms.focusDistance.value = focusDistance;
			cocMaterial.uniforms.focalLength.value = focalLength;

			/**
			 * This pass blurs the foreground CoC buffer to soften edges.
			 *
			 * @type {BlurPass}
			 */

			this.blurPass = new BlurPass({ width: width, height: height, kernelSize: KernelSize.MEDIUM });
			this.blurPass.resolution.resizable = this;

			/**
			 * A mask pass.
			 *
			 * @type {ShaderPass}
			 * @private
			 */

			this.maskPass = new ShaderPass(new MaskMaterial(this.renderTargetCoC.texture));
			var maskMaterial = this.maskPass.getFullscreenMaterial();
			maskMaterial.maskFunction = MaskFunction.MULTIPLY_RGB_SET_ALPHA;
			maskMaterial.colorChannel = ColorChannel.GREEN;

			/**
			 * A bokeh blur pass for the foreground colors.
			 *
			 * @type {ShaderPass}
			 * @private
			 */

			this.bokehNearBasePass = new ShaderPass(new BokehMaterial(false, true));

			/**
			 * A bokeh fill pass for the foreground colors.
			 *
			 * @type {ShaderPass}
			 * @private
			 */

			this.bokehNearFillPass = new ShaderPass(new BokehMaterial(true, true));

			/**
			 * A bokeh blur pass for the background colors.
			 *
			 * @type {ShaderPass}
			 * @private
			 */

			this.bokehFarBasePass = new ShaderPass(new BokehMaterial(false, false));

			/**
			 * A bokeh fill pass for the background colors.
			 *
			 * @type {ShaderPass}
			 * @private
			 */

			this.bokehFarFillPass = new ShaderPass(new BokehMaterial(true, false));

			this.bokehScale = bokehScale;

			/**
			 * A target position that should be kept in focus.
			 *
			 * Set this to `null` to disable auto focus.
			 *
			 * @type {Vector3}
			 */

			this.target = null;

		}

		if ( Effect ) DepthOfFieldEffect.__proto__ = Effect;
		DepthOfFieldEffect.prototype = Object.create( Effect && Effect.prototype );
		DepthOfFieldEffect.prototype.constructor = DepthOfFieldEffect;

		var prototypeAccessors = { circleOfConfusionMaterial: { configurable: true },resolution: { configurable: true },bokehScale: { configurable: true } };

		/**
		 * The circle of confusion material.
		 *
		 * @type {CircleOfConfusionMaterial}
		 */

		prototypeAccessors.circleOfConfusionMaterial.get = function () {

			return this.cocPass.getFullscreenMaterial();

		};

		/**
		 * The resolution of this effect.
		 *
		 * @type {Resizer}
		 */

		prototypeAccessors.resolution.get = function () {

			return this.blurPass.resolution;

		};

		/**
		 * The current bokeh scale.
		 *
		 * @type {Number}
		 */

		prototypeAccessors.bokehScale.get = function () {

			return this.uniforms.get("scale").value;

		};

		/**
		 * Sets the bokeh scale.
		 *
		 * @type {Number}
		 */

		prototypeAccessors.bokehScale.set = function (value) {

			var passes = [
				this.bokehNearBasePass,
				this.bokehNearFillPass,
				this.bokehFarBasePass,
				this.bokehFarFillPass
			];

			passes.map(function (p) { return p.getFullscreenMaterial().uniforms.scale; }).forEach(function (u) {

				u.value = value;

			});

			this.maskPass.getFullscreenMaterial().uniforms.strength.value = value;
			this.uniforms.get("scale").value = value;

		};

		/**
		 * Calculates the focus distance from the camera to the given position.
		 *
		 * @param {Vector3} target - The target.
		 * @return {Number} The normalized focus distance.
		 */

		DepthOfFieldEffect.prototype.calculateFocusDistance = function calculateFocusDistance (target) {

			var camera = this.camera;
			var viewDistance = camera.far - camera.near;
			var distance = camera.position.distanceTo(target);

			return Math.min(Math.max((distance / viewDistance), 0.0), 1.0);

		};

		/**
		 * Sets the depth texture.
		 *
		 * @param {Texture} depthTexture - A depth texture.
		 * @param {Number} [depthPacking=0] - The depth packing.
		 */

		DepthOfFieldEffect.prototype.setDepthTexture = function setDepthTexture (depthTexture, depthPacking) {
			if ( depthPacking === void 0 ) depthPacking = 0;


			var material = this.circleOfConfusionMaterial;
			material.uniforms.depthBuffer.value = depthTexture;
			material.depthPacking = depthPacking;

		};

		/**
		 * Updates this effect.
		 *
		 * @param {WebGLRenderer} renderer - The renderer.
		 * @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
		 * @param {Number} [deltaTime] - The time between the last frame and the current one in seconds.
		 */

		DepthOfFieldEffect.prototype.update = function update (renderer, inputBuffer, deltaTime) {

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

			// Auto focus.
			if(this.target !== null) {

				var distance = this.calculateFocusDistance(this.target);
				this.circleOfConfusionMaterial.uniforms.focusDistance.value = distance;

			}

			// Render the CoC and create a blurred version for soft near field blending.
			this.cocPass.render(renderer, null, renderTargetCoC);
			this.blurPass.render(renderer, renderTargetCoC, renderTargetCoCBlurred);

			// Prevent sharp colors from bleeding onto the background.
			this.maskPass.render(renderer, inputBuffer, renderTargetMasked);

			// Use the sharp CoC buffer and render the background bokeh.
			farBaseUniforms.cocBuffer.value = farFillUniforms.cocBuffer.value = renderTargetCoC.texture;
			bokehFarBasePass.render(renderer, renderTargetMasked, renderTarget);
			bokehFarFillPass.render(renderer, renderTarget, this.renderTargetFar);

			// Use the blurred CoC buffer and render the foreground bokeh.
			nearBaseUniforms.cocBuffer.value = nearFillUniforms.cocBuffer.value = renderTargetCoCBlurred.texture;
			bokehNearBasePass.render(renderer, inputBuffer, renderTarget);
			bokehNearFillPass.render(renderer, renderTarget, this.renderTargetNear);

		};

		/**
		 * Updates the size of internal render targets.
		 *
		 * @param {Number} width - The width.
		 * @param {Number} height - The height.
		 */

		DepthOfFieldEffect.prototype.setSize = function setSize (width, height) {

			var resolution = this.resolution;

			var resizables = [
				this.cocPass,
				this.blurPass,
				this.maskPass,
				this.bokehNearBasePass,
				this.bokehNearFillPass,
				this.bokehFarBasePass,
				this.bokehFarFillPass
			];

			// These buffers require full resolution to prevent bleeding artifacts.
			resizables.push(this.renderTargetCoC, this.renderTargetMasked);
			resizables.forEach(function (r) { return r.setSize(width, height); });

			var w = resolution.width;
			var h = resolution.height;

			resizables = [
				this.renderTarget,
				this.renderTargetNear,
				this.renderTargetFar,
				this.renderTargetCoCBlurred
			];

			resizables.forEach(function (r) { return r.setSize(w, h); });

			// The bokeh blur passes operate on the low resolution buffers.
			var passes = [
				this.bokehNearBasePass,
				this.bokehNearFillPass,
				this.bokehFarBasePass,
				this.bokehFarFillPass
			];

			passes.forEach(function (p) { return p.getFullscreenMaterial().setTexelSize(1.0 / w, 1.0 / h); });

		};

		/**
		 * Performs initialization tasks.
		 *
		 * @param {WebGLRenderer} renderer - The renderer.
		 * @param {Boolean} alpha - Whether the renderer uses the alpha channel or not.
		 * @param {Number} frameBufferType - The type of the main frame buffers.
		 */

		DepthOfFieldEffect.prototype.initialize = function initialize (renderer, alpha, frameBufferType) {

			var initializables = [
				this.cocPass,
				this.maskPass,
				this.bokehNearBasePass,
				this.bokehNearFillPass,
				this.bokehFarBasePass,
				this.bokehFarFillPass
			];

			initializables.forEach(function (i) { return i.initialize(renderer, alpha, frameBufferType); });

			// The blur pass operates on the CoC buffer.
			this.blurPass.initialize(renderer, alpha, three.UnsignedByteType);

			if(!alpha && frameBufferType === three.UnsignedByteType) {

				this.renderTargetNear.texture.type = three.RGBFormat;

			}

			if(frameBufferType !== undefined) {

				this.renderTarget.texture.type = frameBufferType;
				this.renderTargetNear.texture.type = frameBufferType;
				this.renderTargetFar.texture.type = frameBufferType;
				this.renderTargetMasked.texture.type = frameBufferType;

			}

		};

		Object.defineProperties( DepthOfFieldEffect.prototype, prototypeAccessors );

		return DepthOfFieldEffect;
	}(Effect));

	var fragmentShader$m = "uniform vec2 angle;uniform float scale;float pattern(const in vec2 uv){vec2 point=scale*vec2(dot(angle.yx,vec2(uv.x,-uv.y)),dot(angle,uv));return(sin(point.x)*sin(point.y))*4.0;}void mainImage(const in vec4 inputColor,const in vec2 uv,out vec4 outputColor){vec3 color=vec3(inputColor.rgb*10.0-5.0+pattern(uv*resolution));outputColor=vec4(color,inputColor.a);}";

	/**
	 * A dot screen effect.
	 */

	var DotScreenEffect = /*@__PURE__*/(function (Effect) {
		function DotScreenEffect(ref) {
			if ( ref === void 0 ) ref = {};
			var blendFunction = ref.blendFunction; if ( blendFunction === void 0 ) blendFunction = BlendFunction.NORMAL;
			var angle = ref.angle; if ( angle === void 0 ) angle = Math.PI * 0.5;
			var scale = ref.scale; if ( scale === void 0 ) scale = 1.0;


			Effect.call(this, "DotScreenEffect", fragmentShader$m, {

				blendFunction: blendFunction,

				uniforms: new Map([
					["angle", new three.Uniform(new three.Vector2())],
					["scale", new three.Uniform(scale)]
				])

			});

			this.setAngle(angle);

		}

		if ( Effect ) DotScreenEffect.__proto__ = Effect;
		DotScreenEffect.prototype = Object.create( Effect && Effect.prototype );
		DotScreenEffect.prototype.constructor = DotScreenEffect;

		/**
		 * Sets the pattern angle.
		 *
		 * @param {Number} [angle] - The angle of the dot pattern.
		 */

		DotScreenEffect.prototype.setAngle = function setAngle (angle) {

			this.uniforms.get("angle").value.set(Math.sin(angle), Math.cos(angle));

		};

		return DotScreenEffect;
	}(Effect));

	var fragmentShader$n = "uniform float gamma;void mainImage(const in vec4 inputColor,const in vec2 uv,out vec4 outputColor){outputColor=LinearToGamma(max(inputColor,0.0),gamma);}";

	/**
	 * A gamma correction effect.
	 *
	 * @deprecated Set WebGLRenderer.outputEncoding to sRGBEncoding or GammaEncoding instead.
	 */

	var GammaCorrectionEffect = /*@__PURE__*/(function (Effect) {
		function GammaCorrectionEffect(ref) {
			if ( ref === void 0 ) ref = {};
			var blendFunction = ref.blendFunction; if ( blendFunction === void 0 ) blendFunction = BlendFunction.NORMAL;
			var gamma = ref.gamma; if ( gamma === void 0 ) gamma = 2.0;


			Effect.call(this, "GammaCorrectionEffect", fragmentShader$n, {

				blendFunction: blendFunction,

				uniforms: new Map([
					["gamma", new three.Uniform(gamma)]
				])

			});

		}

		if ( Effect ) GammaCorrectionEffect.__proto__ = Effect;
		GammaCorrectionEffect.prototype = Object.create( Effect && Effect.prototype );
		GammaCorrectionEffect.prototype.constructor = GammaCorrectionEffect;

		return GammaCorrectionEffect;
	}(Effect));

	/**
	 * Generates noise.
	 *
	 * @private
	 * @param {Number} size - The linear texture size.
	 * @param {Number} format - The texture format.
	 * @param {Number} type - The texture type.
	 * @return {TypedArray} The noise data.
	 */

	function getNoise(size, format, type) {

		var channels = new Map([
			[three.LuminanceFormat, 1],
			[three.RedFormat, 1],
			[three.RGFormat, 2],
			[three.RGBFormat, 3],
			[three.RGBAFormat, 4]
		]);

		var data;

		if(!channels.has(format)) {

			console.error("Invalid noise texture format");

		}

		if(type === three.UnsignedByteType) {

			data = new Uint8Array(size * channels.get(format));

			for(var i = 0, l = data.length; i < l; ++i) {

				data[i] = Math.random() * 255;

			}

		} else {

			data = new Float32Array(size * channels.get(format));

			for(var i$1 = 0, l$1 = data.length; i$1 < l$1; ++i$1) {

				data[i$1] = Math.random();

			}

		}

		return data;

	}

	/**
	 * A simple noise texture.
	 */

	var NoiseTexture = /*@__PURE__*/(function (DataTexture) {
		function NoiseTexture(width, height, format, type) {
			if ( format === void 0 ) format = three.LuminanceFormat;
			if ( type === void 0 ) type = three.UnsignedByteType;


			DataTexture.call(this, getNoise(width * height, format, type), width, height, format, type);

		}

		if ( DataTexture ) NoiseTexture.__proto__ = DataTexture;
		NoiseTexture.prototype = Object.create( DataTexture && DataTexture.prototype );
		NoiseTexture.prototype.constructor = NoiseTexture;

		return NoiseTexture;
	}(three.DataTexture));

	var fragmentShader$o = "uniform sampler2D perturbationMap;uniform bool active;uniform float columns;uniform float random;uniform vec2 seed;uniform vec2 distortion;void mainUv(inout vec2 uv){if(active){if(uv.y<distortion.x+columns&&uv.y>distortion.x-columns*random){float sx=clamp(ceil(seed.x),0.0,1.0);uv.y=sx*(1.0-(uv.y+distortion.y))+(1.0-sx)*distortion.y;}if(uv.x<distortion.y+columns&&uv.x>distortion.y-columns*random){float sy=clamp(ceil(seed.y),0.0,1.0);uv.x=sy*distortion.x+(1.0-sy)*(1.0-(uv.x+distortion.x));}vec2 normal=texture2D(perturbationMap,uv*random*random).rg;uv+=normal*seed*(random*0.2);}}";

	/**
	 * A label for generated data textures.
	 *
	 * @type {String}
	 * @private
	 */

	var tag = "Glitch.Generated";

	/**
	 * Returns a random float in the specified range.
	 *
	 * @private
	 * @param {Number} low - The lowest possible value.
	 * @param {Number} high - The highest possible value.
	 * @return {Number} The random value.
	 */

	function randomFloat(low, high) {

		return low + Math.random() * (high - low);

	}

	/**
	 * A glitch effect.
	 *
	 * This effect can influence the {@link ChromaticAberrationEffect}.
	 *
	 * Reference: https://github.com/staffantan/unityglitch
	 *
	 * Warning: This effect cannot be merged with convolution effects.
	 */

	var GlitchEffect = /*@__PURE__*/(function (Effect) {
		function GlitchEffect(ref) {
			if ( ref === void 0 ) ref = {};
			var blendFunction = ref.blendFunction; if ( blendFunction === void 0 ) blendFunction = BlendFunction.NORMAL;
			var chromaticAberrationOffset = ref.chromaticAberrationOffset; if ( chromaticAberrationOffset === void 0 ) chromaticAberrationOffset = null;
			var delay = ref.delay; if ( delay === void 0 ) delay = new three.Vector2(1.5, 3.5);
			var duration = ref.duration; if ( duration === void 0 ) duration = new three.Vector2(0.6, 1.0);
			var strength = ref.strength; if ( strength === void 0 ) strength = new three.Vector2(0.3, 1.0);
			var columns = ref.columns; if ( columns === void 0 ) columns = 0.05;
			var ratio = ref.ratio; if ( ratio === void 0 ) ratio = 0.85;
			var perturbationMap = ref.perturbationMap; if ( perturbationMap === void 0 ) perturbationMap = null;
			var dtSize = ref.dtSize; if ( dtSize === void 0 ) dtSize = 64;


			Effect.call(this, "GlitchEffect", fragmentShader$o, {

				blendFunction: blendFunction,

				uniforms: new Map([
					["perturbationMap", new three.Uniform(null)],
					["columns", new three.Uniform(columns)],
					["active", new three.Uniform(false)],
					["random", new three.Uniform(1.0)],
					["seed", new three.Uniform(new three.Vector2())],
					["distortion", new three.Uniform(new three.Vector2())]
				])

			});

			this.setPerturbationMap((perturbationMap === null) ?
				this.generatePerturbationMap(dtSize) :
				perturbationMap
			);

			/**
			 * The minimum and maximum delay between glitch activations in seconds.
			 *
			 * @type {Vector2}
			 */

			this.delay = delay;

			/**
			 * The minimum and maximum duration of a glitch in seconds.
			 *
			 * @type {Vector2}
			 */

			this.duration = duration;

			/**
			 * A random glitch break point.
			 *
			 * @type {Number}
			 * @private
			 */

			this.breakPoint = new three.Vector2(
				randomFloat(this.delay.x, this.delay.y),
				randomFloat(this.duration.x, this.duration.y)
			);

			/**
			 * A time accumulator.
			 *
			 * @type {Number}
			 * @private
			 */

			this.time = 0;

			/**
			 * Random seeds.
			 *
			 * @type {Vector2}
			 * @private
			 */

			this.seed = this.uniforms.get("seed").value;

			/**
			 * A distortion vector.
			 *
			 * @type {Vector2}
			 * @private
			 */

			this.distortion = this.uniforms.get("distortion").value;

			/**
			 * The effect mode.
			 *
			 * @type {GlitchMode}
			 */

			this.mode = GlitchMode.SPORADIC;

			/**
			 * The strength of weak and strong glitches.
			 *
			 * @type {Vector2}
			 */

			this.strength = strength;

			/**
			 * The threshold for strong glitches, ranging from 0 to 1 where 0 means no
			 * weak glitches and 1 means no strong ones. The default ratio of 0.85
			 * offers a decent balance.
			 *
			 * @type {Number}
			 */

			this.ratio = ratio;

			/**
			 * The chromatic aberration offset.
			 *
			 * @type {Vector2}
			 */

			this.chromaticAberrationOffset = chromaticAberrationOffset;

		}

		if ( Effect ) GlitchEffect.__proto__ = Effect;
		GlitchEffect.prototype = Object.create( Effect && Effect.prototype );
		GlitchEffect.prototype.constructor = GlitchEffect;

		var prototypeAccessors = { active: { configurable: true } };

		/**
		 * Indicates whether the glitch effect is currently active.
		 *
		 * @type {Boolean}
		 */

		prototypeAccessors.active.get = function () {

			return this.uniforms.get("active").value;

		};

		/**
		 * Returns the current perturbation map.
		 *
		 * @return {Texture} The current perturbation map.
		 */

		GlitchEffect.prototype.getPerturbationMap = function getPerturbationMap () {

			return this.uniforms.get("perturbationMap").value;

		};

		/**
		 * Replaces the current perturbation map with the given one.
		 *
		 * The current map will be disposed if it was generated by this effect.
		 *
		 * @param {Texture} map - The new perturbation map.
		 */

		GlitchEffect.prototype.setPerturbationMap = function setPerturbationMap (map) {

			var currentMap = this.getPerturbationMap();

			if(currentMap !== null && currentMap.name === tag) {

				currentMap.dispose();

			}

			map.minFilter = map.magFilter = three.NearestFilter;
			map.wrapS = map.wrapT = three.RepeatWrapping;
			map.generateMipmaps = false;

			this.uniforms.get("perturbationMap").value = map;

		};

		/**
		 * Generates a perturbation map.
		 *
		 * @param {Number} [size=64] - The texture size.
		 * @return {DataTexture} The perturbation map.
		 */

		GlitchEffect.prototype.generatePerturbationMap = function generatePerturbationMap (size) {
			if ( size === void 0 ) size = 64;


			var map = new NoiseTexture(size, size, three.RGBFormat);
			map.name = tag;

			return map;

		};

		/**
		 * Updates this effect.
		 *
		 * @param {WebGLRenderer} renderer - The renderer.
		 * @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
		 * @param {Number} [deltaTime] - The time between the last frame and the current one in seconds.
		 */

		GlitchEffect.prototype.update = function update (renderer, inputBuffer, deltaTime) {

			var mode = this.mode;
			var breakPoint = this.breakPoint;
			var offset = this.chromaticAberrationOffset;
			var s = this.strength;

			var time = this.time;
			var active = false;
			var r = 0.0, a = 0.0;
			var trigger;

			if(mode !== GlitchMode.DISABLED) {

				if(mode === GlitchMode.SPORADIC) {

					time += deltaTime;
					trigger = (time > breakPoint.x);

					if(time >= (breakPoint.x + breakPoint.y)) {

						breakPoint.set(
							randomFloat(this.delay.x, this.delay.y),
							randomFloat(this.duration.x, this.duration.y)
						);

						time = 0;

					}

				}

				r = Math.random();
				this.uniforms.get("random").value = r;

				if((trigger && r > this.ratio) || mode === GlitchMode.CONSTANT_WILD) {

					active = true;

					r *= s.y * 0.03;
					a = randomFloat(-Math.PI, Math.PI);

					this.seed.set(randomFloat(-s.y, s.y), randomFloat(-s.y, s.y));
					this.distortion.set(randomFloat(0.0, 1.0), randomFloat(0.0, 1.0));

				} else if(trigger || mode === GlitchMode.CONSTANT_MILD) {

					active = true;

					r *= s.x * 0.03;
					a = randomFloat(-Math.PI, Math.PI);

					this.seed.set(randomFloat(-s.x, s.x), randomFloat(-s.x, s.x));
					this.distortion.set(randomFloat(0.0, 1.0), randomFloat(0.0, 1.0));

				}

				this.time = time;

			}

			if(offset !== null) {

				if(active) {

					offset.set(Math.cos(a), Math.sin(a)).multiplyScalar(r);

				} else {

					offset.set(0.0, 0.0);

				}

			}

			this.uniforms.get("active").value = active;

		};

		Object.defineProperties( GlitchEffect.prototype, prototypeAccessors );

		return GlitchEffect;
	}(Effect));

	/**
	 * A glitch mode enumeration.
	 *
	 * @type {Object}
	 * @property {Number} DISABLED - No glitches.
	 * @property {Number} SPORADIC - Sporadic glitches.
	 * @property {Number} CONSTANT_MILD - Constant mild glitches.
	 * @property {Number} CONSTANT_WILD - Constant wild glitches.
	 */

	var GlitchMode = {

		DISABLED: 0,
		SPORADIC: 1,
		CONSTANT_MILD: 2,
		CONSTANT_WILD: 3

	};

	var fragmentShader$p = "uniform sampler2D texture;void mainImage(const in vec4 inputColor,const in vec2 uv,out vec4 outputColor){outputColor=texture2D(texture,uv);}";

	/**
	 * A vector.
	 *
	 * @type {Vector3}
	 * @private
	 */

	var v = new three.Vector3();

	/**
	 * A matrix.
	 *
	 * @type {Matrix4}
	 * @private
	 */

	var m = new three.Matrix4();

	/**
	 * A god rays effect.
	 */

	var GodRaysEffect = /*@__PURE__*/(function (Effect) {
		function GodRaysEffect(camera, lightSource, ref) {
			var this$1 = this;
			if ( ref === void 0 ) ref = {};
			var blendFunction = ref.blendFunction; if ( blendFunction === void 0 ) blendFunction = BlendFunction.SCREEN;
			var samples = ref.samples; if ( samples === void 0 ) samples = 60.0;
			var density = ref.density; if ( density === void 0 ) density = 0.96;
			var decay = ref.decay; if ( decay === void 0 ) decay = 0.9;
			var weight = ref.weight; if ( weight === void 0 ) weight = 0.4;
			var exposure = ref.exposure; if ( exposure === void 0 ) exposure = 0.6;
			var clampMax = ref.clampMax; if ( clampMax === void 0 ) clampMax = 1.0;
			var resolutionScale = ref.resolutionScale; if ( resolutionScale === void 0 ) resolutionScale = 0.5;
			var width = ref.width; if ( width === void 0 ) width = Resizer.AUTO_SIZE;
			var height = ref.height; if ( height === void 0 ) height = Resizer.AUTO_SIZE;
			var kernelSize = ref.kernelSize; if ( kernelSize === void 0 ) kernelSize = KernelSize.SMALL;
			var blur = ref.blur; if ( blur === void 0 ) blur = true;


			Effect.call(this, "GodRaysEffect", fragmentShader$p, {

				blendFunction: blendFunction,
				attributes: EffectAttribute.DEPTH,

				uniforms: new Map([
					["texture", new three.Uniform(null)]
				])

			});

			/**
			 * The main camera.
			 *
			 * @type {Camera}
			 * @private
			 */

			this.camera = camera;

			/**
			 * The light source.
			 *
			 * @type {Mesh|Points}
			 * @private
			 */

			this.lightSource = lightSource;
			this.lightSource.material.depthWrite = false;
			this.lightSource.material.transparent = true;

			/**
			 * A scene that only contains the light source.
			 *
			 * @type {Scene}
			 * @private
			 */

			this.lightScene = new three.Scene();

			/**
			 * The light position in screen space.
			 *
			 * @type {Vector3}
			 * @private
			 */

			this.screenPosition = new three.Vector2();

			/**
			 * A render target.
			 *
			 * @type {WebGLRenderTarget}
			 * @private
			 */

			this.renderTargetA = new three.WebGLRenderTarget(1, 1, {
				minFilter: three.LinearFilter,
				magFilter: three.LinearFilter,
				stencilBuffer: false,
				depthBuffer: false
			});

			this.renderTargetA.texture.name = "GodRays.Target.A";

			/**
			 * A render target.
			 *
			 * @type {WebGLRenderTarget}
			 * @private
			 */

			this.renderTargetB = this.renderTargetA.clone();
			this.renderTargetB.texture.name = "GodRays.Target.B";
			this.uniforms.get("texture").value = this.renderTargetB.texture;

			/**
			 * A render target for the light scene.
			 *
			 * @type {WebGLRenderTarget}
			 * @private
			 */

			this.renderTargetLight = this.renderTargetA.clone();
			this.renderTargetLight.texture.name = "GodRays.Light";
			this.renderTargetLight.depthBuffer = true;
			this.renderTargetLight.depthTexture = new three.DepthTexture();

			/**
			 * A pass that only renders the light source.
			 *
			 * @type {RenderPass}
			 * @private
			 */

			this.renderPassLight = new RenderPass(this.lightScene, camera);
			this.renderPassLight.getClearPass().overrideClearColor = new three.Color(0x000000);

			/**
			 * A clear pass.
			 *
			 * @type {ClearPass}
			 * @private
			 */

			this.clearPass = new ClearPass(true, false, false);
			this.clearPass.overrideClearColor = new three.Color(0x000000);

			/**
			 * A blur pass that reduces aliasing artifacts and makes the light softer.
			 *
			 * Disable this pass to improve performance.
			 *
			 * @type {BlurPass}
			 */

			this.blurPass = new BlurPass({ resolutionScale: resolutionScale, width: width, height: height, kernelSize: kernelSize });
			this.blurPass.resolution.resizable = this;

			/**
			 * A depth mask pass.
			 *
			 * @type {ShaderPass}
			 * @private
			 */

			this.depthMaskPass = new ShaderPass((function (depthTexture) {

				var material = new DepthMaskMaterial();
				material.uniforms.depthBuffer1.value = depthTexture;

				return material;

			})(this.renderTargetLight.depthTexture));

			/**
			 * A god rays blur pass.
			 *
			 * @type {ShaderPass}
			 * @private
			 */

			this.godRaysPass = new ShaderPass((function () {

				var material = new GodRaysMaterial(this$1.screenPosition);
				material.uniforms.density.value = density;
				material.uniforms.decay.value = decay;
				material.uniforms.weight.value = weight;
				material.uniforms.exposure.value = exposure;
				material.uniforms.clampMax.value = clampMax;

				return material;

			})());

			this.samples = samples;
			this.blur = blur;

		}

		if ( Effect ) GodRaysEffect.__proto__ = Effect;
		GodRaysEffect.prototype = Object.create( Effect && Effect.prototype );
		GodRaysEffect.prototype.constructor = GodRaysEffect;

		var prototypeAccessors = { texture: { configurable: true },godRaysMaterial: { configurable: true },resolution: { configurable: true },width: { configurable: true },height: { configurable: true },dithering: { configurable: true },blur: { configurable: true },kernelSize: { configurable: true },samples: { configurable: true } };

		/**
		 * A texture that contains the intermediate result of this effect.
		 *
		 * This texture will be applied to the scene colors unless the blend function
		 * is set to `SKIP`.
		 *
		 * @type {Texture}
		 */

		prototypeAccessors.texture.get = function () {

			return this.renderTargetB.texture;

		};

		/**
		 * The internal god rays material.
		 *
		 * @type {GodRaysMaterial}
		 */

		prototypeAccessors.godRaysMaterial.get = function () {

			return this.godRaysPass.getFullscreenMaterial();

		};

		/**
		 * The resolution of this effect.
		 *
		 * @type {Resizer}
		 */

		prototypeAccessors.resolution.get = function () {

			return this.blurPass.resolution;

		};

		/**
		 * The current width of the internal render targets.
		 *
		 * @type {Number}
		 * @deprecated Use resolution.width instead.
		 */

		prototypeAccessors.width.get = function () {

			return this.resolution.width;

		};

		/**
		 * Sets the render width.
		 *
		 * @type {Number}
		 * @deprecated Use resolution.width instead.
		 */

		prototypeAccessors.width.set = function (value) {

			this.resolution.width = value;

		};

		/**
		 * The current height of the internal render targets.
		 *
		 * @type {Number}
		 * @deprecated Use resolution.height instead.
		 */

		prototypeAccessors.height.get = function () {

			return this.resolution.height;

		};

		/**
		 * Sets the render height.
		 *
		 * @type {Number}
		 * @deprecated Use resolution.height instead.
		 */

		prototypeAccessors.height.set = function (value) {

			this.resolution.height = value;

		};

		/**
		 * Indicates whether dithering is enabled.
		 *
		 * @type {Boolean}
		 * @deprecated Set the frameBufferType of the EffectComposer to HalfFloatType instead.
		 */

		prototypeAccessors.dithering.get = function () {

			return this.godRaysMaterial.dithering;

		};

		/**
		 * Enables or disables dithering.
		 *
		 * @type {Boolean}
		 * @deprecated Set the frameBufferType of the EffectComposer to HalfFloatType instead.
		 */

		prototypeAccessors.dithering.set = function (value) {

			var material = this.godRaysMaterial;

			material.dithering = value;
			material.needsUpdate = true;

		};

		/**
		 * Indicates whether the god rays should be blurred to reduce artifacts.
		 *
		 * @type {Boolean}
		 */

		prototypeAccessors.blur.get = function () {

			return this.blurPass.enabled;

		};

		/**
		 * @type {Boolean}
		 */

		prototypeAccessors.blur.set = function (value) {

			this.blurPass.enabled = value;

		};

		/**
		 * The blur kernel size.
		 *
		 * @type {KernelSize}
		 * @deprecated Use blurPass.kernelSize instead.
		 */

		prototypeAccessors.kernelSize.get = function () {

			return this.blurPass.kernelSize;

		};

		/**
		 * Sets the blur kernel size.
		 *
		 * @type {KernelSize}
		 * @deprecated Use blurPass.kernelSize instead.
		 */

		prototypeAccessors.kernelSize.set = function (value) {

			this.blurPass.kernelSize = value;

		};

		/**
		 * Returns the current resolution scale.
		 *
		 * @return {Number} The resolution scale.
		 * @deprecated Adjust the fixed resolution width or height instead.
		 */

		GodRaysEffect.prototype.getResolutionScale = function getResolutionScale () {

			return this.resolution.scale;

		};

		/**
		 * Sets the resolution scale.
		 *
		 * @param {Number} scale - The new resolution scale.
		 * @deprecated Adjust the fixed resolution width or height instead.
		 */

		GodRaysEffect.prototype.setResolutionScale = function setResolutionScale (scale) {

			this.resolution.scale = scale;

		};

		/**
		 * The number of samples per pixel.
		 *
		 * @type {Number}
		 */

		prototypeAccessors.samples.get = function () {

			return this.godRaysMaterial.samples;

		};

		/**
		 * A higher sample count improves quality at the cost of performance.
		 *
		 * @type {Number}
		 */

		prototypeAccessors.samples.set = function (value) {

			this.godRaysMaterial.samples = value;

		};

		/**
		 * Sets the depth texture.
		 *
		 * @param {Texture} depthTexture - A depth texture.
		 * @param {Number} [depthPacking=0] - The depth packing.
		 */

		GodRaysEffect.prototype.setDepthTexture = function setDepthTexture (depthTexture, depthPacking) {
			if ( depthPacking === void 0 ) depthPacking = 0;


			var material = this.depthMaskPass.getFullscreenMaterial();
			material.uniforms.depthBuffer0.value = depthTexture;
			material.defines.DEPTH_PACKING_0 = depthPacking.toFixed(0);

		};

		/**
		 * Updates this effect.
		 *
		 * @param {WebGLRenderer} renderer - The renderer.
		 * @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
		 * @param {Number} [deltaTime] - The time between the last frame and the current one in seconds.
		 */

		GodRaysEffect.prototype.update = function update (renderer, inputBuffer, deltaTime) {

			var lightSource = this.lightSource;
			var parent = lightSource.parent;
			var matrixAutoUpdate = lightSource.matrixAutoUpdate;

			var renderTargetA = this.renderTargetA;
			var renderTargetLight = this.renderTargetLight;

			// Enable depth write for the light scene render pass.
			lightSource.material.depthWrite = true;

			// Update the world matrix.
			lightSource.matrixAutoUpdate = false;
			lightSource.updateWorldMatrix(true, false);

			if(parent !== null) {

				if(!matrixAutoUpdate) {

					// Remember the local transformation to restore it later.
					m.copy(lightSource.matrix);

				}

				// Apply parent transformations.
				lightSource.matrix.copy(lightSource.matrixWorld);

			}

			// Render the light source and mask it based on depth.
			this.lightScene.add(lightSource);
			this.renderPassLight.render(renderer, renderTargetLight);
			this.clearPass.render(renderer, renderTargetA);
			this.depthMaskPass.render(renderer, renderTargetLight, renderTargetA);

			// Restore the original values.
			lightSource.material.depthWrite = false;
			lightSource.matrixAutoUpdate = matrixAutoUpdate;

			if(parent !== null) {

				if(!matrixAutoUpdate) {

					lightSource.matrix.copy(m);

				}

				parent.add(lightSource);

			}

			// Calculate the screen light position.
			v.setFromMatrixPosition(lightSource.matrixWorld).project(this.camera);

			// Translate to [0.0, 1.0] and clamp to screen with a bias of 1.0.
			this.screenPosition.set(
				Math.min(Math.max((v.x + 1.0) * 0.5, -1.0), 2.0),
				Math.min(Math.max((v.y + 1.0) * 0.5, -1.0), 2.0)
			);

			if(this.blur) {

				// Blur the masked scene to reduce artifacts.
				this.blurPass.render(renderer, renderTargetA, renderTargetA);

			}

			// Blur the masked scene along radial lines towards the light source.
			this.godRaysPass.render(renderer, renderTargetA, this.renderTargetB);

		};

		/**
		 * Updates the size of internal render targets.
		 *
		 * @param {Number} width - The width.
		 * @param {Number} height - The height.
		 */

		GodRaysEffect.prototype.setSize = function setSize (width, height) {

			this.blurPass.setSize(width, height);
			this.renderPassLight.setSize(width, height);
			this.depthMaskPass.setSize(width, height);
			this.godRaysPass.setSize(width, height);

			var w = this.resolution.width;
			var h = this.resolution.height;

			this.renderTargetA.setSize(w, h);
			this.renderTargetB.setSize(w, h);
			this.renderTargetLight.setSize(w, h);

		};

		/**
		 * Performs initialization tasks.
		 *
		 * @param {WebGLRenderer} renderer - The renderer.
		 * @param {Boolean} alpha - Whether the renderer uses the alpha channel or not.
		 * @param {Number} frameBufferType - The type of the main frame buffers.
		 */

		GodRaysEffect.prototype.initialize = function initialize (renderer, alpha, frameBufferType) {

			this.blurPass.initialize(renderer, alpha, frameBufferType);
			this.renderPassLight.initialize(renderer, alpha, frameBufferType);
			this.depthMaskPass.initialize(renderer, alpha, frameBufferType);
			this.godRaysPass.initialize(renderer, alpha, frameBufferType);

			if(!alpha && frameBufferType === three.UnsignedByteType) {

				this.renderTargetA.texture.format = three.RGBFormat;
				this.renderTargetB.texture.format = three.RGBFormat;
				this.renderTargetLight.texture.format = three.RGBFormat;

			}

			if(frameBufferType !== undefined) {

				this.renderTargetA.texture.type = frameBufferType;
				this.renderTargetB.texture.type = frameBufferType;
				this.renderTargetLight.texture.type = frameBufferType;

			}

		};

		Object.defineProperties( GodRaysEffect.prototype, prototypeAccessors );

		return GodRaysEffect;
	}(Effect));

	var fragmentShader$q = "uniform vec2 scale;uniform float lineWidth;void mainImage(const in vec4 inputColor,const in vec2 uv,out vec4 outputColor){float grid=0.5-max(abs(mod(uv.x*scale.x,1.0)-0.5),abs(mod(uv.y*scale.y,1.0)-0.5));outputColor=vec4(vec3(smoothstep(0.0,lineWidth,grid)),inputColor.a);}";

	/**
	 * A grid effect.
	 */

	var GridEffect = /*@__PURE__*/(function (Effect) {
		function GridEffect(ref) {
			if ( ref === void 0 ) ref = {};
			var blendFunction = ref.blendFunction; if ( blendFunction === void 0 ) blendFunction = BlendFunction.OVERLAY;
			var scale = ref.scale; if ( scale === void 0 ) scale = 1.0;
			var lineWidth = ref.lineWidth; if ( lineWidth === void 0 ) lineWidth = 0.0;


			Effect.call(this, "GridEffect", fragmentShader$q, {

				blendFunction: blendFunction,

				uniforms: new Map([
					["scale", new three.Uniform(new three.Vector2())],
					["lineWidth", new three.Uniform(lineWidth)]
				])

			});

			/**
			 * The original resolution.
			 *
			 * @type {Vector2}
			 * @private
			 */

			this.resolution = new three.Vector2();

			/**
			 * The grid scale, relative to the screen height.
			 *
			 * @type {Number}
			 * @private
			 */

			this.scale = Math.max(scale, 1e-6);

			/**
			 * The grid line width.
			 *
			 * @type {Number}
			 * @private
			 */

			this.lineWidth = Math.max(lineWidth, 0.0);

		}

		if ( Effect ) GridEffect.__proto__ = Effect;
		GridEffect.prototype = Object.create( Effect && Effect.prototype );
		GridEffect.prototype.constructor = GridEffect;

		/**
		 * Returns the current grid scale.
		 *
		 * @return {Number} The grid scale.
		 */

		GridEffect.prototype.getScale = function getScale () {

			return this.scale;

		};

		/**
		 * Sets the grid scale.
		 *
		 * @param {Number} scale - The new grid scale.
		 */

		GridEffect.prototype.setScale = function setScale (scale) {

			this.scale = scale;
			this.setSize(this.resolution.x, this.resolution.y);

		};

		/**
		 * Returns the current grid line width.
		 *
		 * @return {Number} The grid line width.
		 */

		GridEffect.prototype.getLineWidth = function getLineWidth () {

			return this.lineWidth;

		};

		/**
		 * Sets the grid line width.
		 *
		 * @param {Number} lineWidth - The new grid line width.
		 */

		GridEffect.prototype.setLineWidth = function setLineWidth (lineWidth) {

			this.lineWidth = lineWidth;
			this.setSize(this.resolution.x, this.resolution.y);

		};

		/**
		 * Updates the size of this pass.
		 *
		 * @param {Number} width - The width.
		 * @param {Number} height - The height.
		 */

		GridEffect.prototype.setSize = function setSize (width, height) {

			this.resolution.set(width, height);

			var aspect = width / height;
			var scale = this.scale * (height * 0.125);

			this.uniforms.get("scale").value.set(aspect * scale, scale);
			this.uniforms.get("lineWidth").value = (scale / height) + this.lineWidth;

		};

		return GridEffect;
	}(Effect));

	var fragmentShader$r = "uniform vec3 hue;uniform float saturation;void mainImage(const in vec4 inputColor,const in vec2 uv,out vec4 outputColor){vec3 color=vec3(dot(inputColor.rgb,hue.xyz),dot(inputColor.rgb,hue.zxy),dot(inputColor.rgb,hue.yzx));float average=(color.r+color.g+color.b)/3.0;vec3 diff=average-color;if(saturation>0.0){color+=diff*(1.0-1.0/(1.001-saturation));}else{color+=diff*-saturation;}outputColor=vec4(min(color,1.0),inputColor.a);}";

	/**
	 * A hue/saturation effect.
	 *
	 * Reference: https://github.com/evanw/glfx.js
	 */

	var HueSaturationEffect = /*@__PURE__*/(function (Effect) {
		function HueSaturationEffect(ref) {
			if ( ref === void 0 ) ref = {};
			var blendFunction = ref.blendFunction; if ( blendFunction === void 0 ) blendFunction = BlendFunction.NORMAL;
			var hue = ref.hue; if ( hue === void 0 ) hue = 0.0;
			var saturation = ref.saturation; if ( saturation === void 0 ) saturation = 0.0;


			Effect.call(this, "HueSaturationEffect", fragmentShader$r, {

				blendFunction: blendFunction,

				uniforms: new Map([
					["hue", new three.Uniform(new three.Vector3())],
					["saturation", new three.Uniform(saturation)]
				])

			});

			this.setHue(hue);

		}

		if ( Effect ) HueSaturationEffect.__proto__ = Effect;
		HueSaturationEffect.prototype = Object.create( Effect && Effect.prototype );
		HueSaturationEffect.prototype.constructor = HueSaturationEffect;

		/**
		 * Sets the hue.
		 *
		 * @param {Number} hue - The hue in radians.
		 */

		HueSaturationEffect.prototype.setHue = function setHue (hue) {

			var s = Math.sin(hue), c = Math.cos(hue);

			this.uniforms.get("hue").value.set(
				2.0 * c, -Math.sqrt(3.0) * s - c, Math.sqrt(3.0) * s - c
			).addScalar(1.0).divideScalar(3.0);

		};

		return HueSaturationEffect;
	}(Effect));

	var fragmentShader$s = "void mainImage(const in vec4 inputColor,const in vec2 uv,out vec4 outputColor){vec3 noise=vec3(rand(uv*time));\n#ifdef PREMULTIPLY\noutputColor=vec4(min(inputColor.rgb*noise,vec3(1.0)),inputColor.a);\n#else\noutputColor=vec4(noise,inputColor.a);\n#endif\n}";

	/**
	 * A noise effect.
	 */

	var NoiseEffect = /*@__PURE__*/(function (Effect) {
		function NoiseEffect(ref) {
			if ( ref === void 0 ) ref = {};
			var blendFunction = ref.blendFunction; if ( blendFunction === void 0 ) blendFunction = BlendFunction.SCREEN;
			var premultiply = ref.premultiply; if ( premultiply === void 0 ) premultiply = false;


			Effect.call(this, "NoiseEffect", fragmentShader$s, { blendFunction: blendFunction });

			this.premultiply = premultiply;

		}

		if ( Effect ) NoiseEffect.__proto__ = Effect;
		NoiseEffect.prototype = Object.create( Effect && Effect.prototype );
		NoiseEffect.prototype.constructor = NoiseEffect;

		var prototypeAccessors = { premultiply: { configurable: true } };

		/**
		 * Indicates whether the noise should be multiplied with the input color.
		 *
		 * @type {Boolean}
		 */

		prototypeAccessors.premultiply.get = function () {

			return this.defines.has("PREMULTIPLY");

		};

		/**
		 * Enables or disables noise premultiplication.
		 *
		 * @type {Boolean}
		 */

		prototypeAccessors.premultiply.set = function (value) {

			if(this.premultiply !== value) {

				if(value) {

					this.defines.set("PREMULTIPLY", "1");

				} else {

					this.defines.delete("PREMULTIPLY");

				}

				this.setChanged();

			}

		};

		Object.defineProperties( NoiseEffect.prototype, prototypeAccessors );

		return NoiseEffect;
	}(Effect));

	var fragmentShader$t = "uniform sampler2D edgeTexture;uniform sampler2D maskTexture;uniform vec3 visibleEdgeColor;uniform vec3 hiddenEdgeColor;uniform float pulse;uniform float edgeStrength;\n#ifdef USE_PATTERN\nuniform sampler2D patternTexture;varying vec2 vUvPattern;\n#endif\nvoid mainImage(const in vec4 inputColor,const in vec2 uv,out vec4 outputColor){vec2 edge=texture2D(edgeTexture,uv).rg;vec2 mask=texture2D(maskTexture,uv).rg;\n#ifndef X_RAY\nedge.y=0.0;\n#endif\nedge*=(edgeStrength*mask.x*pulse);vec3 color=edge.x*visibleEdgeColor+edge.y*hiddenEdgeColor;float visibilityFactor=0.0;\n#ifdef USE_PATTERN\nvec4 patternColor=texture2D(patternTexture,vUvPattern);\n#ifdef X_RAY\nfloat hiddenFactor=0.5;\n#else\nfloat hiddenFactor=0.0;\n#endif\nvisibilityFactor=(1.0-mask.y>0.0)? 1.0 : hiddenFactor;visibilityFactor*=(1.0-mask.x)*patternColor.a;color+=visibilityFactor*patternColor.rgb;\n#endif\nfloat alpha=max(max(edge.x,edge.y),visibilityFactor);\n#ifdef ALPHA\noutputColor=vec4(color,alpha);\n#else\noutputColor=vec4(color,max(alpha,inputColor.a));\n#endif\n}";

	var vertexShader$9 = "uniform float patternScale;varying vec2 vUvPattern;void mainSupport(const in vec2 uv){vUvPattern=uv*vec2(aspect,1.0)*patternScale;}";

	/**
	 * An outline effect.
	 */

	var OutlineEffect = /*@__PURE__*/(function (Effect) {
		function OutlineEffect(scene, camera, ref) {
			var this$1 = this;
			if ( ref === void 0 ) ref = {};
			var blendFunction = ref.blendFunction; if ( blendFunction === void 0 ) blendFunction = BlendFunction.SCREEN;
			var patternTexture = ref.patternTexture; if ( patternTexture === void 0 ) patternTexture = null;
			var edgeStrength = ref.edgeStrength; if ( edgeStrength === void 0 ) edgeStrength = 1.0;
			var pulseSpeed = ref.pulseSpeed; if ( pulseSpeed === void 0 ) pulseSpeed = 0.0;
			var visibleEdgeColor = ref.visibleEdgeColor; if ( visibleEdgeColor === void 0 ) visibleEdgeColor = 0xffffff;
			var hiddenEdgeColor = ref.hiddenEdgeColor; if ( hiddenEdgeColor === void 0 ) hiddenEdgeColor = 0x22090a;
			var resolutionScale = ref.resolutionScale; if ( resolutionScale === void 0 ) resolutionScale = 0.5;
			var width = ref.width; if ( width === void 0 ) width = Resizer.AUTO_SIZE;
			var height = ref.height; if ( height === void 0 ) height = Resizer.AUTO_SIZE;
			var kernelSize = ref.kernelSize; if ( kernelSize === void 0 ) kernelSize = KernelSize.VERY_SMALL;
			var blur = ref.blur; if ( blur === void 0 ) blur = false;
			var xRay = ref.xRay; if ( xRay === void 0 ) xRay = true;


			Effect.call(this, "OutlineEffect", fragmentShader$t, {

				uniforms: new Map([
					["maskTexture", new three.Uniform(null)],
					["edgeTexture", new three.Uniform(null)],
					["edgeStrength", new three.Uniform(edgeStrength)],
					["visibleEdgeColor", new three.Uniform(new three.Color(visibleEdgeColor))],
					["hiddenEdgeColor", new three.Uniform(new three.Color(hiddenEdgeColor))],
					["pulse", new three.Uniform(1.0)],
					["patternScale", new three.Uniform(1.0)],
					["patternTexture", new three.Uniform(null)]
				])

			});

			// Handle alpha blending.
			this.blendMode.addEventListener("change", function (event) {

				if(this$1.blendMode.getBlendFunction() === BlendFunction.ALPHA) {

					this$1.defines.set("ALPHA", "1");

				} else {

					this$1.defines.delete("ALPHA");

				}

				this$1.setChanged();

			});

			this.blendMode.setBlendFunction(blendFunction);
			this.setPatternTexture(patternTexture);
			this.xRay = xRay;

			/**
			 * The main scene.
			 *
			 * @type {Scene}
			 * @private
			 */

			this.scene = scene;

			/**
			 * The main camera.
			 *
			 * @type {Camera}
			 * @private
			 */

			this.camera = camera;

			/**
			 * A render target for the outline mask.
			 *
			 * @type {WebGLRenderTarget}
			 * @private
			 */

			this.renderTargetMask = new three.WebGLRenderTarget(1, 1, {
				minFilter: three.LinearFilter,
				magFilter: three.LinearFilter,
				stencilBuffer: false,
				format: three.RGBFormat
			});

			this.renderTargetMask.texture.name = "Outline.Mask";

			this.uniforms.get("maskTexture").value = this.renderTargetMask.texture;

			/**
			 * A render target for the edge detection.
			 *
			 * @type {WebGLRenderTarget}
			 * @private
			 */

			this.renderTargetOutline = this.renderTargetMask.clone();
			this.renderTargetOutline.texture.name = "Outline.Edges";
			this.renderTargetOutline.depthBuffer = false;

			/**
			 * A render target for the blurred outline overlay.
			 *
			 * @type {WebGLRenderTarget}
			 * @private
			 */

			this.renderTargetBlurredOutline = this.renderTargetOutline.clone();
			this.renderTargetBlurredOutline.texture.name = "Outline.BlurredEdges";

			/**
			 * A clear pass.
			 *
			 * @type {ClearPass}
			 * @private
			 */

			this.clearPass = new ClearPass();
			this.clearPass.overrideClearColor = new three.Color(0x000000);
			this.clearPass.overrideClearAlpha = 1.0;

			/**
			 * A depth pass.
			 *
			 * @type {DepthPass}
			 * @private
			 */

			this.depthPass = new DepthPass(scene, camera);

			/**
			 * A depth comparison mask pass.
			 *
			 * @type {RenderPass}
			 * @private
			 */

			this.maskPass = new RenderPass(scene, camera,
				new DepthComparisonMaterial(this.depthPass.texture, camera));

			var clearPass = this.maskPass.getClearPass();
			clearPass.overrideClearColor = new three.Color(0xffffff);
			clearPass.overrideClearAlpha = 1.0;

			/**
			 * A blur pass.
			 *
			 * @type {BlurPass}
			 */

			this.blurPass = new BlurPass({ resolutionScale: resolutionScale, width: width, height: height, kernelSize: kernelSize });
			this.blurPass.resolution.resizable = this;
			this.blur = blur;

			/**
			 * An outline detection pass.
			 *
			 * @type {ShaderPass}
			 * @private
			 */

			this.outlinePass = new ShaderPass(new OutlineMaterial());
			this.outlinePass.getFullscreenMaterial().uniforms.inputBuffer.value = this.renderTargetMask.texture;

			/**
			 * The current animation time.
			 *
			 * @type {Number}
			 * @private
			 */

			this.time = 0.0;

			/**
			 * A selection of objects that will be outlined.
			 *
			 * @type {Selection}
			 */

			this.selection = new Selection();

			/**
			 * The pulse speed. A value of zero disables the pulse effect.
			 *
			 * @type {Number}
			 */

			this.pulseSpeed = pulseSpeed;

		}

		if ( Effect ) OutlineEffect.__proto__ = Effect;
		OutlineEffect.prototype = Object.create( Effect && Effect.prototype );
		OutlineEffect.prototype.constructor = OutlineEffect;

		var prototypeAccessors = { resolution: { configurable: true },width: { configurable: true },height: { configurable: true },selectionLayer: { configurable: true },dithering: { configurable: true },kernelSize: { configurable: true },blur: { configurable: true },xRay: { configurable: true } };

		/**
		 * The resolution of this effect.
		 *
		 * @type {Resizer}
		 */

		prototypeAccessors.resolution.get = function () {

			return this.blurPass.resolution;

		};

		/**
		 * The current width of the internal render targets.
		 *
		 * @type {Number}
		 * @deprecated Use resolution.width instead.
		 */

		prototypeAccessors.width.get = function () {

			return this.resolution.width;

		};

		/**
		 * Sets the render width.
		 *
		 * @type {Number}
		 * @deprecated Use resolution.width instead.
		 */

		prototypeAccessors.width.set = function (value) {

			this.resolution.width = value;

		};

		/**
		 * The current height of the internal render targets.
		 *
		 * @type {Number}
		 * @deprecated Use resolution.height instead.
		 */

		prototypeAccessors.height.get = function () {

			return this.resolution.height;

		};

		/**
		 * Sets the render height.
		 *
		 * @type {Number}
		 * @deprecated Use resolution.height instead.
		 */

		prototypeAccessors.height.set = function (value) {

			this.resolution.height = value;

		};

		/**
		 * @type {Number}
		 * @deprecated Use selection.layer instead.
		 */

		prototypeAccessors.selectionLayer.get = function () {

			return this.selection.layer;

		};

		/**
		 * @type {Number}
		 * @deprecated Use selection.layer instead.
		 */

		prototypeAccessors.selectionLayer.set = function (value) {

			this.selection.layer = value;

		};

		/**
		 * Indicates whether dithering is enabled.
		 *
		 * @type {Boolean}
		 * @deprecated Set the frameBufferType of the EffectComposer to HalfFloatType instead.
		 */

		prototypeAccessors.dithering.get = function () {

			return this.blurPass.dithering;

		};

		/**
		 * Enables or disables dithering.
		 *
		 * @type {Boolean}
		 * @deprecated Set the frameBufferType of the EffectComposer to HalfFloatType instead.
		 */

		prototypeAccessors.dithering.set = function (value) {

			this.blurPass.dithering = value;

		};

		/**
		 * The blur kernel size.
		 *
		 * @type {KernelSize}
		 * @deprecated Use blurPass.kernelSize instead.
		 */

		prototypeAccessors.kernelSize.get = function () {

			return this.blurPass.kernelSize;

		};

		/**
		 * Sets the kernel size.
		 *
		 * @type {KernelSize}
		 * @deprecated Use blurPass.kernelSize instead.
		 */

		prototypeAccessors.kernelSize.set = function (value) {

			this.blurPass.kernelSize = value;

		};

		/**
		 * Indicates whether the outlines should be blurred.
		 *
		 * @type {Boolean}
		 */

		prototypeAccessors.blur.get = function () {

			return this.blurPass.enabled;

		};

		/**
		 * @type {Boolean}
		 */

		prototypeAccessors.blur.set = function (value) {

			this.blurPass.enabled = value;

			this.uniforms.get("edgeTexture").value = value ?
				this.renderTargetBlurredOutline.texture :
				this.renderTargetOutline.texture;

		};

		/**
		 * Indicates whether X-Ray outlines are enabled.
		 *
		 * @type {Boolean}
		 */

		prototypeAccessors.xRay.get = function () {

			return this.defines.has("X_RAY");

		};

		/**
		 * Enables or disables X-Ray outlines.
		 *
		 * @type {Boolean}
		 */

		prototypeAccessors.xRay.set = function (value) {

			if(this.xRay !== value) {

				if(value) {

					this.defines.set("X_RAY", "1");

				} else {

					this.defines.delete("X_RAY");

				}

				this.setChanged();

			}

		};

		/**
		 * Sets the pattern texture.
		 *
		 * @param {Texture} texture - The new texture.
		 */

		OutlineEffect.prototype.setPatternTexture = function setPatternTexture (texture) {

			if(texture !== null) {

				texture.wrapS = texture.wrapT = three.RepeatWrapping;

				this.defines.set("USE_PATTERN", "1");
				this.uniforms.get("patternTexture").value = texture;
				this.setVertexShader(vertexShader$9);

			} else {

				this.defines.delete("USE_PATTERN");
				this.uniforms.get("patternTexture").value = null;
				this.setVertexShader(null);

			}

			this.setChanged();

		};

		/**
		 * Returns the current resolution scale.
		 *
		 * @return {Number} The resolution scale.
		 * @deprecated Adjust the fixed resolution width or height instead.
		 */

		OutlineEffect.prototype.getResolutionScale = function getResolutionScale () {

			return this.resolution.scale;

		};

		/**
		 * Sets the resolution scale.
		 *
		 * @param {Number} scale - The new resolution scale.
		 * @deprecated Adjust the fixed resolution width or height instead.
		 */

		OutlineEffect.prototype.setResolutionScale = function setResolutionScale (scale) {

			this.resolution.scale = scale;

		};

		/**
		 * Clears the current selection and selects a list of objects.
		 *
		 * @param {Object3D[]} objects - The objects that should be outlined. This array will be copied.
		 * @return {OutlinePass} This pass.
		 * @deprecated Use selection.set instead.
		 */

		OutlineEffect.prototype.setSelection = function setSelection (objects) {

			this.selection.set(objects);

			return this;

		};

		/**
		 * Clears the list of selected objects.
		 *
		 * @return {OutlinePass} This pass.
		 * @deprecated Use selection.clear instead.
		 */

		OutlineEffect.prototype.clearSelection = function clearSelection () {

			this.selection.clear();

			return this;

		};

		/**
		 * Selects an object.
		 *
		 * @param {Object3D} object - The object that should be outlined.
		 * @return {OutlinePass} This pass.
		 * @deprecated Use selection.add instead.
		 */

		OutlineEffect.prototype.selectObject = function selectObject (object) {

			this.selection.add(object);

			return this;

		};

		/**
		 * Deselects an object.
		 *
		 * @param {Object3D} object - The object that should no longer be outlined.
		 * @return {OutlinePass} This pass.
		 * @deprecated Use selection.delete instead.
		 */

		OutlineEffect.prototype.deselectObject = function deselectObject (object) {

			this.selection.delete(object);

			return this;

		};

		/**
		 * Updates this effect.
		 *
		 * @param {WebGLRenderer} renderer - The renderer.
		 * @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
		 * @param {Number} [deltaTime] - The time between the last frame and the current one in seconds.
		 */

		OutlineEffect.prototype.update = function update (renderer, inputBuffer, deltaTime) {

			var scene = this.scene;
			var camera = this.camera;
			var selection = this.selection;
			var pulse = this.uniforms.get("pulse");

			var background = scene.background;
			var mask = camera.layers.mask;

			if(selection.size > 0) {

				scene.background = null;
				pulse.value = 1.0;

				if(this.pulseSpeed > 0.0) {

					pulse.value = 0.625 + Math.cos(this.time * this.pulseSpeed * 10.0) * 0.375;

				}

				this.time += deltaTime;

				// Render a custom depth texture and ignore selected objects.
				selection.setVisible(false);
				this.depthPass.render(renderer);
				selection.setVisible(true);

				// Compare the depth of the selected objects with the depth texture.
				camera.layers.set(selection.layer);
				this.maskPass.render(renderer, this.renderTargetMask);

				// Restore the camera layer mask and the scene background.
				camera.layers.mask = mask;
				scene.background = background;

				// Detect the outline.
				this.outlinePass.render(renderer, null, this.renderTargetOutline);

				if(this.blur) {

					this.blurPass.render(renderer, this.renderTargetOutline, this.renderTargetBlurredOutline);

				}

			} else if(this.time > 0.0) {

				this.clearPass.render(renderer, this.renderTargetMask);
				this.time = 0.0;

			}

		};

		/**
		 * Updates the size of internal render targets.
		 *
		 * @param {Number} width - The width.
		 * @param {Number} height - The height.
		 */

		OutlineEffect.prototype.setSize = function setSize (width, height) {

			this.blurPass.setSize(width, height);
			this.renderTargetMask.setSize(width, height);

			var w = this.resolution.width;
			var h = this.resolution.height;

			this.depthPass.setSize(w, h);
			this.renderTargetOutline.setSize(w, h);
			this.renderTargetBlurredOutline.setSize(w, h);
			this.outlinePass.getFullscreenMaterial().setTexelSize(1.0 / w, 1.0 / h);

		};

		/**
		 * Performs initialization tasks.
		 *
		 * @param {WebGLRenderer} renderer - The renderer.
		 * @param {Boolean} alpha - Whether the renderer uses the alpha channel or not.
		 * @param {Number} frameBufferType - The type of the main frame buffers.
		 */

		OutlineEffect.prototype.initialize = function initialize (renderer, alpha, frameBufferType) {

			// No need for high precision: the blur pass operates on a mask texture.
			this.blurPass.initialize(renderer, alpha, three.UnsignedByteType);

			if(frameBufferType !== undefined) {

				// These passes ignore the buffer type.
				this.depthPass.initialize(renderer, alpha, frameBufferType);
				this.maskPass.initialize(renderer, alpha, frameBufferType);
				this.outlinePass.initialize(renderer, alpha, frameBufferType);

			}

		};

		Object.defineProperties( OutlineEffect.prototype, prototypeAccessors );

		return OutlineEffect;
	}(Effect));

	var fragmentShader$u = "uniform bool active;uniform vec2 d;void mainUv(inout vec2 uv){if(active){uv=vec2(d.x*(floor(uv.x/d.x)+0.5),d.y*(floor(uv.y/d.y)+0.5));}}";

	/**
	 * A pixelation effect.
	 *
	 * Warning: This effect cannot be merged with convolution effects.
	 */

	var PixelationEffect = /*@__PURE__*/(function (Effect) {
		function PixelationEffect(granularity) {
			if ( granularity === void 0 ) granularity = 30.0;


			Effect.call(this, "PixelationEffect", fragmentShader$u, {

				uniforms: new Map([
					["active", new three.Uniform(false)],
					["d", new three.Uniform(new three.Vector2())]
				])

			});

			/**
			 * The original resolution.
			 *
			 * @type {Vector2}
			 * @private
			 */

			this.resolution = new three.Vector2();

			/**
			 * The pixel granularity.
			 *
			 * @type {Number}
			 * @private
			 */

			this.granularity = granularity;

		}

		if ( Effect ) PixelationEffect.__proto__ = Effect;
		PixelationEffect.prototype = Object.create( Effect && Effect.prototype );
		PixelationEffect.prototype.constructor = PixelationEffect;

		/**
		 * Returns the pixel granularity.
		 *
		 * @return {Number} The granularity.
		 */

		PixelationEffect.prototype.getGranularity = function getGranularity () {

			return this.granularity;

		};

		/**
		 * Sets the pixel granularity.
		 *
		 * A higher value yields coarser visuals.
		 *
		 * @param {Number} granularity - The new granularity.
		 */

		PixelationEffect.prototype.setGranularity = function setGranularity (granularity) {

			granularity = Math.floor(granularity);

			if(granularity % 2 > 0) {

				granularity += 1;

			}

			var uniforms = this.uniforms;
			uniforms.get("active").value = (granularity > 0.0);
			uniforms.get("d").value.set(granularity, granularity).divide(this.resolution);

			this.granularity = granularity;

		};

		/**
		 * Updates the granularity.
		 *
		 * @param {Number} width - The width.
		 * @param {Number} height - The height.
		 */

		PixelationEffect.prototype.setSize = function setSize (width, height) {

			this.resolution.set(width, height);
			this.setGranularity(this.granularity);

		};

		return PixelationEffect;
	}(Effect));

	var fragmentShader$v = "uniform float focus;uniform float focalLength;uniform float fStop;uniform float maxBlur;uniform float luminanceThreshold;uniform float luminanceGain;uniform float bias;uniform float fringe;\n#ifdef MANUAL_DOF\nuniform vec4 dof;\n#endif\n#ifdef PENTAGON\nfloat pentagon(const in vec2 coords){const vec4 HS0=vec4(1.0,0.0,0.0,1.0);const vec4 HS1=vec4(0.309016994,0.951056516,0.0,1.0);const vec4 HS2=vec4(-0.809016994,0.587785252,0.0,1.0);const vec4 HS3=vec4(-0.809016994,-0.587785252,0.0,1.0);const vec4 HS4=vec4(0.309016994,-0.951056516,0.0,1.0);const vec4 HS5=vec4(0.0,0.0,1.0,1.0);const vec4 ONE=vec4(1.0);const float P_FEATHER=0.4;const float N_FEATHER=-P_FEATHER;float inOrOut=-4.0;vec4 P=vec4(coords,vec2(RINGS_FLOAT-1.3));vec4 dist=vec4(dot(P,HS0),dot(P,HS1),dot(P,HS2),dot(P,HS3));dist=smoothstep(N_FEATHER,P_FEATHER,dist);inOrOut+=dot(dist,ONE);dist.x=dot(P,HS4);dist.y=HS5.w-abs(P.z);dist=smoothstep(N_FEATHER,P_FEATHER,dist);inOrOut+=dist.x;return clamp(inOrOut,0.0,1.0);}\n#endif\nvec3 processTexel(const in vec2 coords,const in float blur){vec2 scale=texelSize*fringe*blur;vec3 c=vec3(texture2D(inputBuffer,coords+vec2(0.0,1.0)*scale).r,texture2D(inputBuffer,coords+vec2(-0.866,-0.5)*scale).g,texture2D(inputBuffer,coords+vec2(0.866,-0.5)*scale).b);float luminance=linearToRelativeLuminance(c);float threshold=max((luminance-luminanceThreshold)*luminanceGain,0.0);return c+mix(vec3(0.0),c,threshold*blur);}float gather(const in float i,const in float j,const in float ringSamples,const in vec2 uv,const in vec2 blurFactor,const in float blur,inout vec3 color){float step=PI2/ringSamples;vec2 wh=vec2(cos(j*step)*i,sin(j*step)*i);\n#ifdef PENTAGON\nfloat p=pentagon(wh);\n#else\nfloat p=1.0;\n#endif\ncolor+=processTexel(wh*blurFactor+uv,blur)*mix(1.0,i/RINGS_FLOAT,bias)*p;return mix(1.0,i/RINGS_FLOAT,bias)*p;}void mainImage(const in vec4 inputColor,const in vec2 uv,const in float depth,out vec4 outputColor){\n#ifdef PERSPECTIVE_CAMERA\nfloat viewZ=perspectiveDepthToViewZ(depth,cameraNear,cameraFar);float linearDepth=viewZToOrthographicDepth(viewZ,cameraNear,cameraFar);\n#else\nfloat linearDepth=depth;\n#endif\n#ifdef MANUAL_DOF\nfloat focalPlane=linearDepth-focus;float farDoF=(focalPlane-dof.z)/dof.w;float nearDoF=(-focalPlane-dof.x)/dof.y;float blur=(focalPlane>0.0)? farDoF : nearDoF;\n#else\nconst float CIRCLE_OF_CONFUSION=0.03;float focalPlaneMM=focus*1000.0;float depthMM=linearDepth*1000.0;float focalPlane=(depthMM*focalLength)/(depthMM-focalLength);float farDoF=(focalPlaneMM*focalLength)/(focalPlaneMM-focalLength);float nearDoF=(focalPlaneMM-focalLength)/(focalPlaneMM*fStop*CIRCLE_OF_CONFUSION);float blur=abs(focalPlane-farDoF)*nearDoF;\n#endif\nconst int MAX_RING_SAMPLES=RINGS_INT*SAMPLES_INT;blur=clamp(blur,0.0,1.0);vec3 color=inputColor.rgb;if(blur>=0.05){vec2 blurFactor=blur*maxBlur*texelSize;float s=1.0;int ringSamples;for(int i=1;i<=RINGS_INT;i++){ringSamples=i*SAMPLES_INT;for(int j=0;j<MAX_RING_SAMPLES;j++){if(j>=ringSamples){break;}s+=gather(float(i),float(j),float(ringSamples),uv,blurFactor,blur,color);}}color/=s;}\n#ifdef SHOW_FOCUS\nfloat edge=0.002*linearDepth;float m=clamp(smoothstep(0.0,edge,blur),0.0,1.0);float e=clamp(smoothstep(1.0-edge,1.0,blur),0.0,1.0);color=mix(color,vec3(1.0,0.5,0.0),(1.0-m)*0.6);color=mix(color,vec3(0.0,0.5,1.0),((1.0-e)-(1.0-m))*0.2);\n#endif\noutputColor=vec4(color,inputColor.a);}";

	/**
	 * Depth of Field shader v2.4.
	 *
	 * Yields more realistic results but is also more demanding.
	 *
	 * Original shader code by Martins Upitis:
	 *  http://blenderartists.org/forum/showthread.php?237488-GLSL-depth-of-field-with-bokeh-v2-4-(update)
	 *
	 * @deprecated Use DepthOfFieldEffect instead.
	 */

	var RealisticBokehEffect = /*@__PURE__*/(function (Effect) {
		function RealisticBokehEffect(ref) {
			if ( ref === void 0 ) ref = {};
			var blendFunction = ref.blendFunction; if ( blendFunction === void 0 ) blendFunction = BlendFunction.NORMAL;
			var focus = ref.focus; if ( focus === void 0 ) focus = 1.0;
			var focalLength = ref.focalLength; if ( focalLength === void 0 ) focalLength = 24.0;
			var fStop = ref.fStop; if ( fStop === void 0 ) fStop = 0.9;
			var luminanceThreshold = ref.luminanceThreshold; if ( luminanceThreshold === void 0 ) luminanceThreshold = 0.5;
			var luminanceGain = ref.luminanceGain; if ( luminanceGain === void 0 ) luminanceGain = 2.0;
			var bias = ref.bias; if ( bias === void 0 ) bias = 0.5;
			var fringe = ref.fringe; if ( fringe === void 0 ) fringe = 0.7;
			var maxBlur = ref.maxBlur; if ( maxBlur === void 0 ) maxBlur = 1.0;
			var rings = ref.rings; if ( rings === void 0 ) rings = 3;
			var samples = ref.samples; if ( samples === void 0 ) samples = 2;
			var showFocus = ref.showFocus; if ( showFocus === void 0 ) showFocus = false;
			var manualDoF = ref.manualDoF; if ( manualDoF === void 0 ) manualDoF = false;
			var pentagon = ref.pentagon; if ( pentagon === void 0 ) pentagon = false;


			Effect.call(this, "RealisticBokehEffect", fragmentShader$v, {

				blendFunction: blendFunction,
				attributes: EffectAttribute.CONVOLUTION | EffectAttribute.DEPTH,

				uniforms: new Map([
					["focus", new three.Uniform(focus)],
					["focalLength", new three.Uniform(focalLength)],
					["fStop", new three.Uniform(fStop)],
					["luminanceThreshold", new three.Uniform(luminanceThreshold)],
					["luminanceGain", new three.Uniform(luminanceGain)],
					["bias", new three.Uniform(bias)],
					["fringe", new three.Uniform(fringe)],
					["maxBlur", new three.Uniform(maxBlur)],
					["dof", new three.Uniform(null)]
				])

			});

			this.rings = rings;
			this.samples = samples;
			this.showFocus = showFocus;
			this.manualDoF = manualDoF;
			this.pentagon = pentagon;

		}

		if ( Effect ) RealisticBokehEffect.__proto__ = Effect;
		RealisticBokehEffect.prototype = Object.create( Effect && Effect.prototype );
		RealisticBokehEffect.prototype.constructor = RealisticBokehEffect;

		var prototypeAccessors = { rings: { configurable: true },samples: { configurable: true },showFocus: { configurable: true },manualDoF: { configurable: true },pentagon: { configurable: true } };

		/**
		 * The amount of blur iterations.
		 *
		 * @type {Number}
		 */

		prototypeAccessors.rings.get = function () {

			return Number.parseInt(this.defines.get("RINGS_INT"));

		};

		/**
		 * Sets the amount of blur iterations.
		 *
		 * @type {Number}
		 */

		prototypeAccessors.rings.set = function (value) {

			var r = Math.floor(value);
			this.defines.set("RINGS_INT", r.toFixed(0));
			this.defines.set("RINGS_FLOAT", r.toFixed(1));

			this.setChanged();

		};

		/**
		 * The amount of blur samples per ring.
		 *
		 * @type {Number}
		 */

		prototypeAccessors.samples.get = function () {

			return Number.parseInt(this.defines.get("SAMPLES_INT"));

		};

		/**
		 * Sets the amount of blur samples per ring.
		 *
		 * @type {Number}
		 */

		prototypeAccessors.samples.set = function (value) {

			var s = Math.floor(value);
			this.defines.set("SAMPLES_INT", s.toFixed(0));
			this.defines.set("SAMPLES_FLOAT", s.toFixed(1));

			this.setChanged();

		};

		/**
		 * Indicates whether the focal point will be highlighted.
		 *
		 * @type {Boolean}
		 */

		prototypeAccessors.showFocus.get = function () {

			return this.defines.has("SHOW_FOCUS");

		};

		/**
		 * Enables or disables focal point highlighting.
		 *
		 * @type {Boolean}
		 */

		prototypeAccessors.showFocus.set = function (value) {

			if(this.showFocus !== value) {

				if(value) {

					this.defines.set("SHOW_FOCUS", "1");

				} else {

					this.defines.delete("SHOW_FOCUS");

				}

				this.setChanged();

			}

		};

		/**
		 * Indicates whether the Depth of Field should be calculated manually.
		 *
		 * If enabled, the Depth of Field can be adjusted via the `dof` uniform.
		 *
		 * @type {Boolean}
		 */

		prototypeAccessors.manualDoF.get = function () {

			return this.defines.has("MANUAL_DOF");

		};

		/**
		 * Enables or disables manual Depth of Field.
		 *
		 * @type {Boolean}
		 */

		prototypeAccessors.manualDoF.set = function (value) {

			if(this.manualDoF !== value) {

				if(value) {

					this.defines.set("MANUAL_DOF", "1");
					this.uniforms.get("dof").value = new three.Vector4(0.2, 1.0, 0.2, 2.0);

				} else {

					this.defines.delete("MANUAL_DOF");
					this.uniforms.get("dof").value = null;

				}

				this.setChanged();

			}

		};

		/**
		 * Indicates whether the blur shape should be pentagonal.
		 *
		 * @type {Boolean}
		 */

		prototypeAccessors.pentagon.get = function () {

			return this.defines.has("PENTAGON");

		};

		/**
		 * Enables or disables pentagonal blur.
		 *
		 * @type {Boolean}
		 */

		prototypeAccessors.pentagon.set = function (value) {

			if(this.pentagon !== value) {

				if(value) {

					this.defines.set("PENTAGON", "1");

				} else {

					this.defines.delete("PENTAGON");

				}

				this.setChanged();

			}

		};

		Object.defineProperties( RealisticBokehEffect.prototype, prototypeAccessors );

		return RealisticBokehEffect;
	}(Effect));

	var fragmentShader$w = "uniform float count;void mainImage(const in vec4 inputColor,const in vec2 uv,out vec4 outputColor){vec2 sl=vec2(sin(uv.y*count),cos(uv.y*count));vec3 scanlines=vec3(sl.x,sl.y,sl.x);outputColor=vec4(scanlines,inputColor.a);}";

	/**
	 * A scanline effect.
	 *
	 * Based on an implementation by Georg 'Leviathan' Steinrohder (CC BY 3.0):
	 * http://www.truevision3d.com/forums/showcase/staticnoise_colorblackwhite_scanline_shaders-t18698.0.html
	 */

	var ScanlineEffect = /*@__PURE__*/(function (Effect) {
		function ScanlineEffect(ref) {
			if ( ref === void 0 ) ref = {};
			var blendFunction = ref.blendFunction; if ( blendFunction === void 0 ) blendFunction = BlendFunction.OVERLAY;
			var density = ref.density; if ( density === void 0 ) density = 1.25;


			Effect.call(this, "ScanlineEffect", fragmentShader$w, {

				blendFunction: blendFunction,

				uniforms: new Map([
					["count", new three.Uniform(0.0)]
				])

			});

			/**
			 * The original resolution.
			 *
			 * @type {Vector2}
			 * @private
			 */

			this.resolution = new three.Vector2();

			/**
			 * The amount of scanlines, relative to the screen height.
			 *
			 * @type {Number}
			 * @private
			 */

			this.density = density;

		}

		if ( Effect ) ScanlineEffect.__proto__ = Effect;
		ScanlineEffect.prototype = Object.create( Effect && Effect.prototype );
		ScanlineEffect.prototype.constructor = ScanlineEffect;

		/**
		 * Returns the current scanline density.
		 *
		 * @return {Number} The scanline density.
		 */

		ScanlineEffect.prototype.getDensity = function getDensity () {

			return this.density;

		};

		/**
		 * Sets the scanline density.
		 *
		 * @param {Number} density - The new scanline density.
		 */

		ScanlineEffect.prototype.setDensity = function setDensity (density) {

			this.density = density;
			this.setSize(this.resolution.x, this.resolution.y);

		};

		/**
		 * Updates the size of this pass.
		 *
		 * @param {Number} width - The width.
		 * @param {Number} height - The height.
		 */

		ScanlineEffect.prototype.setSize = function setSize (width, height) {

			this.resolution.set(width, height);
			this.uniforms.get("count").value = Math.round(height * this.density);

		};

		return ScanlineEffect;
	}(Effect));

	var fragmentShader$x = "uniform bool active;uniform vec2 center;uniform float waveSize;uniform float radius;uniform float maxRadius;uniform float amplitude;varying float vSize;void mainUv(inout vec2 uv){if(active){vec2 aspectCorrection=vec2(aspect,1.0);vec2 difference=uv*aspectCorrection-center*aspectCorrection;float distance=sqrt(dot(difference,difference))*vSize;if(distance>radius){if(distance<radius+waveSize){float angle=(distance-radius)*PI2/waveSize;float cosSin=(1.0-cos(angle))*0.5;float extent=maxRadius+waveSize;float decay=max(extent-distance*distance,0.0)/extent;uv-=((cosSin*amplitude*difference)/distance)*decay;}}}}";

	var vertexShader$a = "uniform float size;uniform float cameraDistance;varying float vSize;void mainSupport(){vSize=(0.1*cameraDistance)/size;}";

	/**
	 * Half PI.
	 *
	 * @type {Number}
	 * @private
	 */

	var HALF_PI = Math.PI * 0.5;

	/**
	 * A vector.
	 *
	 * @type {Vector3}
	 * @private
	 */

	var v$1 = new three.Vector3();

	/**
	 * A vector.
	 *
	 * @type {Vector3}
	 * @private
	 */

	var ab = new three.Vector3();

	/**
	 * A shock wave effect.
	 *
	 * Based on a Gist by Jean-Philippe Sarda:
	 *  https://gist.github.com/jpsarda/33cea67a9f2ecb0a0eda
	 *
	 * Warning: This effect cannot be merged with convolution effects.
	 */

	var ShockWaveEffect = /*@__PURE__*/(function (Effect) {
		function ShockWaveEffect(camera, epicenter, ref) {
			if ( epicenter === void 0 ) epicenter = new three.Vector3();
			if ( ref === void 0 ) ref = {};
			var speed = ref.speed; if ( speed === void 0 ) speed = 2.0;
			var maxRadius = ref.maxRadius; if ( maxRadius === void 0 ) maxRadius = 1.0;
			var waveSize = ref.waveSize; if ( waveSize === void 0 ) waveSize = 0.2;
			var amplitude = ref.amplitude; if ( amplitude === void 0 ) amplitude = 0.05;


			Effect.call(this, "ShockWaveEffect", fragmentShader$x, {

				vertexShader: vertexShader$a,

				uniforms: new Map([
					["active", new three.Uniform(false)],
					["center", new three.Uniform(new three.Vector2(0.5, 0.5))],
					["cameraDistance", new three.Uniform(1.0)],
					["size", new three.Uniform(1.0)],
					["radius", new three.Uniform(-waveSize)],
					["maxRadius", new three.Uniform(maxRadius)],
					["waveSize", new three.Uniform(waveSize)],
					["amplitude", new three.Uniform(amplitude)]
				])

			});

			/**
			 * The main camera.
			 *
			 * @type {Camera}
			 */

			this.camera = camera;

			/**
			 * The epicenter.
			 *
			 * @type {Vector3}
			 * @example shockWavePass.epicenter = myMesh.position;
			 */

			this.epicenter = epicenter;

			/**
			 * The object position in screen space.
			 *
			 * @type {Vector3}
			 * @private
			 */

			this.screenPosition = this.uniforms.get("center").value;

			/**
			 * The speed of the shock wave animation.
			 *
			 * @type {Number}
			 */

			this.speed = speed;

			/**
			 * A time accumulator.
			 *
			 * @type {Number}
			 * @private
			 */

			this.time = 0.0;

			/**
			 * Indicates whether the shock wave animation is active.
			 *
			 * @type {Boolean}
			 * @private
			 */

			this.active = false;

		}

		if ( Effect ) ShockWaveEffect.__proto__ = Effect;
		ShockWaveEffect.prototype = Object.create( Effect && Effect.prototype );
		ShockWaveEffect.prototype.constructor = ShockWaveEffect;

		/**
		 * Emits the shock wave.
		 */

		ShockWaveEffect.prototype.explode = function explode () {

			this.time = 0.0;
			this.active = true;
			this.uniforms.get("active").value = true;

		};

		/**
		 * Updates this effect.
		 *
		 * @param {WebGLRenderer} renderer - The renderer.
		 * @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
		 * @param {Number} [delta] - The time between the last frame and the current one in seconds.
		 */

		ShockWaveEffect.prototype.update = function update (renderer, inputBuffer, delta) {

			var epicenter = this.epicenter;
			var camera = this.camera;
			var uniforms = this.uniforms;
			var uniformActive = uniforms.get("active");

			if(this.active) {

				var waveSize = uniforms.get("waveSize").value;

				// Calculate direction vectors.
				camera.getWorldDirection(v$1);
				ab.copy(camera.position).sub(epicenter);

				// Don't render the effect if the object is behind the camera.
				uniformActive.value = (v$1.angleTo(ab) > HALF_PI);

				if(uniformActive.value) {

					// Scale the effect based on distance to the object.
					uniforms.get("cameraDistance").value = camera.position.distanceTo(epicenter);

					// Calculate the screen position of the epicenter.
					v$1.copy(epicenter).project(camera);
					this.screenPosition.set((v$1.x + 1.0) * 0.5, (v$1.y + 1.0) * 0.5);

				}

				// Update the shock wave radius based on time.
				this.time += delta * this.speed;
				var radius = this.time - waveSize;
				uniforms.get("radius").value = radius;

				if(radius >= (uniforms.get("maxRadius").value + waveSize) * 2.0) {

					this.active = false;
					uniformActive.value = false;

				}

			}

		};

		return ShockWaveEffect;
	}(Effect));

	/**
	 * A selective bloom effect.
	 *
	 * This effect applies bloom only to selected objects by using layers. Make sure
	 * to enable the selection layer for all relevant lights:
	 *
	 * `lights.forEach((l) => l.layers.enable(bloomEffect.selection.layer));`
	 *
	 * Attention: If you don't need to limit bloom to a subset of objects, consider
	 * using the {@link BloomEffect} instead for better performance.
	 */

	var SelectiveBloomEffect = /*@__PURE__*/(function (BloomEffect) {
		function SelectiveBloomEffect(scene, camera, options) {

			BloomEffect.call(this, options);

			/**
			 * The main scene.
			 *
			 * @type {Scene}
			 * @private
			 */

			this.scene = scene;

			/**
			 * The main camera.
			 *
			 * @type {Camera}
			 * @private
			 */

			this.camera = camera;

			/**
			 * A clear pass.
			 *
			 * @type {ClearPass}
			 * @private
			 */

			this.clearPass = new ClearPass(true, true, false);
			this.clearPass.overrideClearColor = new three.Color(0x000000);

			/**
			 * A render pass.
			 *
			 * @type {RenderPass}
			 * @private
			 */

			this.renderPass = new RenderPass(scene, camera);
			this.renderPass.clear = false;

			/**
			 * A render pass that renders all objects solid black.
			 *
			 * @type {RenderPass}
			 * @private
			 */

			this.blackoutPass = new RenderPass(scene, camera, new three.MeshBasicMaterial({ color: 0x000000 }));
			this.blackoutPass.clear = false;

			/**
			 * A render pass that only renders the background of the main scene.
			 *
			 * @type {RenderPass}
			 * @private
			 */

			this.backgroundPass = (function () {

				var backgroundScene = new three.Scene();
				var pass = new RenderPass(backgroundScene, camera);

				backgroundScene.background = scene.background;
				pass.clear = false;

				return pass;

			})();

			/**
			 * A render target.
			 *
			 * @type {WebGLRenderTarget}
			 * @private
			 */

			this.renderTargetSelection = new three.WebGLRenderTarget(1, 1, {
				minFilter: three.LinearFilter,
				magFilter: three.LinearFilter,
				stencilBuffer: false,
				depthBuffer: true
			});

			this.renderTargetSelection.texture.name = "Bloom.Selection";
			this.renderTargetSelection.texture.generateMipmaps = false;

			/**
			 * A selection of objects.
			 *
			 * @type {Selection}
			 */

			this.selection = new Selection();

			/**
			 * Indicates whether the selection should be considered inverted.
			 *
			 * @type {Boolean}
			 */

			this.inverted = false;

		}

		if ( BloomEffect ) SelectiveBloomEffect.__proto__ = BloomEffect;
		SelectiveBloomEffect.prototype = Object.create( BloomEffect && BloomEffect.prototype );
		SelectiveBloomEffect.prototype.constructor = SelectiveBloomEffect;

		var prototypeAccessors = { ignoreBackground: { configurable: true } };

		/**
		 * Indicates whether the scene background should be ignored.
		 *
		 * @type {Boolean}
		 */

		prototypeAccessors.ignoreBackground.get = function () {

			return !this.backgroundPass.enabled;

		};

		/**
		 * Enables or disables background rendering.
		 *
		 * @type {Boolean}
		 */

		prototypeAccessors.ignoreBackground.set = function (value) {

			this.backgroundPass.enabled = !value;

		};

		/**
		 * Updates this effect.
		 *
		 * @param {WebGLRenderer} renderer - The renderer.
		 * @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
		 * @param {Number} [deltaTime] - The time between the last frame and the current one in seconds.
		 */

		SelectiveBloomEffect.prototype.update = function update (renderer, inputBuffer, deltaTime) {

			var scene = this.scene;
			var camera = this.camera;
			var selection = this.selection;
			var renderTarget = this.renderTargetSelection;

			var background = scene.background;
			var mask = camera.layers.mask;

			this.clearPass.render(renderer, renderTarget);

			if(!this.ignoreBackground) {

				this.backgroundPass.render(renderer, renderTarget);

			}

			scene.background = null;

			if(this.inverted) {

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
			BloomEffect.prototype.update.call(this, renderer, renderTarget, deltaTime);

		};

		/**
		 * Updates the size of internal render targets.
		 *
		 * @param {Number} width - The width.
		 * @param {Number} height - The height.
		 */

		SelectiveBloomEffect.prototype.setSize = function setSize (width, height) {

			BloomEffect.prototype.setSize.call(this, width, height);

			this.backgroundPass.setSize(width, height);
			this.blackoutPass.setSize(width, height);
			this.renderPass.setSize(width, height);

			this.renderTargetSelection.setSize(
				this.resolution.width,
				this.resolution.height
			);

		};

		/**
		 * Performs initialization tasks.
		 *
		 * @param {WebGLRenderer} renderer - The renderer.
		 * @param {Boolean} alpha - Whether the renderer uses the alpha channel.
		 * @param {Number} frameBufferType - The type of the main frame buffers.
		 */

		SelectiveBloomEffect.prototype.initialize = function initialize (renderer, alpha, frameBufferType) {

			BloomEffect.prototype.initialize.call(this, renderer, alpha, frameBufferType);

			this.backgroundPass.initialize(renderer, alpha, frameBufferType);
			this.blackoutPass.initialize(renderer, alpha, frameBufferType);
			this.renderPass.initialize(renderer, alpha, frameBufferType);

			if(!alpha && frameBufferType === three.UnsignedByteType) {

				this.renderTargetSelection.texture.format = three.RGBFormat;

			}

			if(frameBufferType !== undefined) {

				this.renderTargetSelection.texture.type = frameBufferType;

			}

		};

		Object.defineProperties( SelectiveBloomEffect.prototype, prototypeAccessors );

		return SelectiveBloomEffect;
	}(BloomEffect));

	var fragmentShader$y = "uniform float intensity;void mainImage(const in vec4 inputColor,const in vec2 uv,out vec4 outputColor){vec3 color=vec3(dot(inputColor.rgb,vec3(1.0-0.607*intensity,0.769*intensity,0.189*intensity)),dot(inputColor.rgb,vec3(0.349*intensity,1.0-0.314*intensity,0.168*intensity)),dot(inputColor.rgb,vec3(0.272*intensity,0.534*intensity,1.0-0.869*intensity)));outputColor=vec4(color,inputColor.a);}";

	/**
	 * A sepia effect.
	 */

	var SepiaEffect = /*@__PURE__*/(function (Effect) {
		function SepiaEffect(ref) {
			if ( ref === void 0 ) ref = {};
			var blendFunction = ref.blendFunction; if ( blendFunction === void 0 ) blendFunction = BlendFunction.NORMAL;
			var intensity = ref.intensity; if ( intensity === void 0 ) intensity = 1.0;


			Effect.call(this, "SepiaEffect", fragmentShader$y, {

				blendFunction: blendFunction,

				uniforms: new Map([
					["intensity", new three.Uniform(intensity)]
				])

			});

		}

		if ( Effect ) SepiaEffect.__proto__ = Effect;
		SepiaEffect.prototype = Object.create( Effect && Effect.prototype );
		SepiaEffect.prototype.constructor = SepiaEffect;

		return SepiaEffect;
	}(Effect));

	// Generated with SMAASearchImageData.generate().toCanvas().toDataURL(), cropped, high dynamic range.
	var searchImageDataURL = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAAAQCAYAAACm53kpAAAAeElEQVRYR+2XSwqAMAxEJ168ePEqwRSKhIIiuHjJqiU0gWE+1CQdApcVAMUAuARaMGCX1MIL/Ow13++9lW2s3mW9MWvsnWc/2fvGygwPAN4E8QzAA4CXAB6AHjG4JTHYI1ey3pcx6FHnEfhLDOIBKAmUBK6/ANUDTlROXAHd9EC1AAAAAElFTkSuQmCC";

	// Generated with SMAAAreaImageData.generate().toCanvas().toDataURL().
	var areaImageDataURL = "data:image/png;base64,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";

	var fragmentShader$z = "uniform sampler2D weightMap;varying vec2 vOffset0;varying vec2 vOffset1;/***Moves values to a target vector based on a given conditional vector.*/void movec(const in bvec2 c,inout vec2 variable,const in vec2 value){if(c.x){variable.x=value.x;}if(c.y){variable.y=value.y;}}void movec(const in bvec4 c,inout vec4 variable,const in vec4 value){movec(c.xy,variable.xy,value.xy);movec(c.zw,variable.zw,value.zw);}void mainImage(const in vec4 inputColor,const in vec2 uv,out vec4 outputColor){vec4 a;a.x=texture2D(weightMap,vOffset0).a;a.y=texture2D(weightMap,vOffset1).g;a.wz=texture2D(weightMap,uv).rb;vec4 color=inputColor;if(dot(a,vec4(1.0))>=1e-5){bool h=max(a.x,a.z)>max(a.y,a.w);vec4 blendingOffset=vec4(0.0,a.y,0.0,a.w);vec2 blendingWeight=a.yw;movec(bvec4(h),blendingOffset,vec4(a.x,0.0,a.z,0.0));movec(bvec2(h),blendingWeight,a.xz);blendingWeight/=dot(blendingWeight,vec2(1.0));vec4 blendingCoord=blendingOffset*vec4(texelSize,-texelSize)+uv.xyxy;color=blendingWeight.x*texture2D(inputBuffer,blendingCoord.xy);color+=blendingWeight.y*texture2D(inputBuffer,blendingCoord.zw);}outputColor=color;}";

	var vertexShader$b = "varying vec2 vOffset0;varying vec2 vOffset1;void mainSupport(const in vec2 uv){vOffset0=uv+texelSize*vec2(1.0,0.0);vOffset1=uv+texelSize*vec2(0.0,1.0);}";

	/**
	 * Subpixel Morphological Antialiasing (SMAA).
	 *
	 * https://github.com/iryoku/smaa/releases/tag/v2.8
	 */

	var SMAAEffect = /*@__PURE__*/(function (Effect) {
		function SMAAEffect(searchImage, areaImage, preset, edgeDetectionMode) {
			if ( preset === void 0 ) preset = SMAAPreset.HIGH;
			if ( edgeDetectionMode === void 0 ) edgeDetectionMode = EdgeDetectionMode.COLOR;


			Effect.call(this, "SMAAEffect", fragmentShader$z, {

				vertexShader: vertexShader$b,
				blendFunction: BlendFunction.NORMAL,
				attributes: EffectAttribute.CONVOLUTION,

				uniforms: new Map([
					["weightMap", new three.Uniform(null)]
				])

			});

			/**
			 * A render target for the edge detection.
			 *
			 * @type {WebGLRenderTarget}
			 * @private
			 */

			this.renderTargetEdges = new three.WebGLRenderTarget(1, 1, {
				minFilter: three.LinearFilter,
				stencilBuffer: false,
				depthBuffer: false,
				format: three.RGBFormat
			});

			this.renderTargetEdges.texture.name = "SMAA.Edges";

			/**
			 * A render target for the edge weights.
			 *
			 * @type {WebGLRenderTarget}
			 * @private
			 */

			this.renderTargetWeights = this.renderTargetEdges.clone();

			this.renderTargetWeights.texture.name = "SMAA.Weights";
			this.renderTargetWeights.texture.format = three.RGBAFormat;

			this.uniforms.get("weightMap").value = this.renderTargetWeights.texture;

			/**
			 * A clear pass for the edges buffer.
			 *
			 * @type {ClearPass}
			 * @private
			 */

			this.clearPass = new ClearPass(true, false, false);
			this.clearPass.overrideClearColor = new three.Color(0x000000);
			this.clearPass.overrideClearAlpha = 1.0;

			/**
			 * An edge detection pass.
			 *
			 * @type {ShaderPass}
			 * @private
			 */

			this.edgeDetectionPass = new ShaderPass(
				new EdgeDetectionMaterial(new three.Vector2(), edgeDetectionMode)
			);

			if(edgeDetectionMode === EdgeDetectionMode.DEPTH) {

				this.setAttributes(this.getAttributes() | EffectAttribute.DEPTH);

			}

			/**
			 * An SMAA weights pass.
			 *
			 * @type {ShaderPass}
			 * @private
			 */

			this.weightsPass = new ShaderPass(new SMAAWeightsMaterial());

			this.weightsPass.getFullscreenMaterial().uniforms.searchTexture.value = (function () {

				var searchTexture = new three.Texture(searchImage);
				searchTexture.name = "SMAA.Search";
				searchTexture.magFilter = three.NearestFilter;
				searchTexture.minFilter = three.NearestFilter;
				searchTexture.format = three.RGBAFormat;
				searchTexture.generateMipmaps = false;
				searchTexture.needsUpdate = true;
				searchTexture.flipY = true;

				return searchTexture;

			})();

			this.weightsPass.getFullscreenMaterial().uniforms.areaTexture.value = (function () {

				var areaTexture = new three.Texture(areaImage);
				areaTexture.name = "SMAA.Area";
				areaTexture.minFilter = three.LinearFilter;
				areaTexture.format = three.RGBAFormat;
				areaTexture.generateMipmaps = false;
				areaTexture.needsUpdate = true;
				areaTexture.flipY = false;

				return areaTexture;

			})();

			this.applyPreset(preset);

		}

		if ( Effect ) SMAAEffect.__proto__ = Effect;
		SMAAEffect.prototype = Object.create( Effect && Effect.prototype );
		SMAAEffect.prototype.constructor = SMAAEffect;

		var prototypeAccessors = { edgeDetectionMaterial: { configurable: true },colorEdgesMaterial: { configurable: true },weightsMaterial: { configurable: true } };
		var staticAccessors = { searchImageDataURL: { configurable: true },areaImageDataURL: { configurable: true } };

		/**
		 * The internal edge detection material.
		 *
		 * @type {EdgeDetectionMaterial}
		 */

		prototypeAccessors.edgeDetectionMaterial.get = function () {

			return this.edgeDetectionPass.getFullscreenMaterial();

		};

		/**
		 * The internal edge detection material.
		 *
		 * @type {EdgeDetectionMaterial}
		 * @deprecated Use edgeDetectionMaterial instead.
		 */

		prototypeAccessors.colorEdgesMaterial.get = function () {

			return this.edgeDetectionMaterial;

		};

		/**
		 * The internal edge weights material.
		 *
		 * @type {SMAAWeightsMaterial}
		 */

		prototypeAccessors.weightsMaterial.get = function () {

			return this.weightsPass.getFullscreenMaterial();

		};

		/**
		 * Sets the edge detection sensitivity.
		 *
		 * See {@link EdgeDetectionMaterial#setEdgeDetectionThreshold} for more details.
		 *
		 * @deprecated Use applyPreset or edgeDetectionMaterial instead.
		 * @param {Number} threshold - The edge detection sensitivity. Range: [0.05, 0.5].
		 */

		SMAAEffect.prototype.setEdgeDetectionThreshold = function setEdgeDetectionThreshold (threshold) {

			this.edgeDetectionPass.getFullscreenMaterial().setEdgeDetectionThreshold(threshold);

		};

		/**
		 * Sets the maximum amount of horizontal/vertical search steps.
		 *
		 * See {@link SMAAWeightsMaterial#setOrthogonalSearchSteps} for more details.
		 *
		 * @deprecated Use applyPreset or weightsMaterial instead.
		 * @param {Number} steps - The search steps. Range: [0, 112].
		 */

		SMAAEffect.prototype.setOrthogonalSearchSteps = function setOrthogonalSearchSteps (steps) {

			this.weightsPass.getFullscreenMaterial().setOrthogonalSearchSteps(steps);

		};

		/**
		 * Applies the given quality preset.
		 *
		 * @param {SMAAPreset} preset - The preset.
		 */

		SMAAEffect.prototype.applyPreset = function applyPreset (preset) {

			var edgeDetectionMaterial = this.edgeDetectionMaterial;
			var weightsMaterial = this.weightsMaterial;

			switch(preset) {

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

		};

		/**
		 * Sets the depth texture.
		 *
		 * @param {Texture} depthTexture - A depth texture.
		 * @param {Number} [depthPacking=0] - The depth packing.
		 */

		SMAAEffect.prototype.setDepthTexture = function setDepthTexture (depthTexture, depthPacking) {
			if ( depthPacking === void 0 ) depthPacking = 0;


			var material = this.edgeDetectionMaterial;
			material.uniforms.depthBuffer.value = depthTexture;
			material.depthPacking = depthPacking;

		};

		/**
		 * Updates this effect.
		 *
		 * @param {WebGLRenderer} renderer - The renderer.
		 * @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
		 * @param {Number} [deltaTime] - The time between the last frame and the current one in seconds.
		 */

		SMAAEffect.prototype.update = function update (renderer, inputBuffer, deltaTime) {

			this.clearPass.render(renderer, this.renderTargetEdges);
			this.edgeDetectionPass.render(renderer, inputBuffer, this.renderTargetEdges);
			this.weightsPass.render(renderer, this.renderTargetEdges, this.renderTargetWeights);

		};

		/**
		 * Updates the size of internal render targets.
		 *
		 * @param {Number} width - The width.
		 * @param {Number} height - The height.
		 */

		SMAAEffect.prototype.setSize = function setSize (width, height) {

			var edgeDetectionMaterial = this.edgeDetectionPass.getFullscreenMaterial();
			var weightsMaterial = this.weightsPass.getFullscreenMaterial();

			this.renderTargetEdges.setSize(width, height);
			this.renderTargetWeights.setSize(width, height);

			weightsMaterial.uniforms.resolution.value.set(width, height);
			weightsMaterial.uniforms.texelSize.value.set(1.0 / width, 1.0 / height);
			edgeDetectionMaterial.uniforms.texelSize.value.copy(weightsMaterial.uniforms.texelSize.value);

		};

		/**
		 * Deletes internal render targets and textures.
		 */

		SMAAEffect.prototype.dispose = function dispose () {

			var uniforms = this.weightsPass.getFullscreenMaterial().uniforms;
			uniforms.searchTexture.value.dispose();
			uniforms.areaTexture.value.dispose();

			Effect.prototype.dispose.call(this);

		};

		/**
		 * The SMAA search image, encoded as a base64 data URL.
		 *
		 * Use this image data to create an Image instance and use it together with
		 * the area image to create an {@link SMAAEffect}.
		 *
		 * @type {String}
		 * @deprecated Use SMAAImageLoader instead.
		 * @example
		 * const searchImage = new Image();
		 * searchImage.addEventListener("load", progress);
		 * searchImage.src = SMAAEffect.searchImageDataURL;
		 */

		staticAccessors.searchImageDataURL.get = function () {

			return searchImageDataURL;

		};

		/**
		 * The SMAA area image, encoded as a base64 data URL.
		 *
		 * Use this image data to create an Image instance and use it together with
		 * the search image to create an {@link SMAAEffect}.
		 *
		 * @type {String}
		 * @deprecated Use SMAAImageLoader instead.
		 * @example
		 * const areaImage = new Image();
		 * areaImage.addEventListener("load", progress);
		 * areaImage.src = SMAAEffect.areaImageDataURL;
		 */

		staticAccessors.areaImageDataURL.get = function () {

			return areaImageDataURL;

		};

		Object.defineProperties( SMAAEffect.prototype, prototypeAccessors );
		Object.defineProperties( SMAAEffect, staticAccessors );

		return SMAAEffect;
	}(Effect));

	/**
	 * An enumeration of SMAA presets.
	 *
	 * @type {Object}
	 * @property {Number} LOW - Results in around 60% of the maximum quality.
	 * @property {Number} MEDIUM - Results in around 80% of the maximum quality.
	 * @property {Number} HIGH - Results in around 95% of the maximum quality.
	 * @property {Number} ULTRA - Results in around 99% of the maximum quality.
	 */

	var SMAAPreset = {

		LOW: 0,
		MEDIUM: 1,
		HIGH: 2,
		ULTRA: 3

	};

	var fragmentShader$A = "uniform sampler2D aoBuffer;uniform float luminanceInfluence;\n#ifdef DEPTH_AWARE_UPSAMPLING\n#ifdef GL_FRAGMENT_PRECISION_HIGH\nuniform highp sampler2D normalDepthBuffer;\n#else\nuniform mediump sampler2D normalDepthBuffer;\n#endif\n#endif\n#ifdef COLORIZE\nuniform vec3 color;\n#endif\nvoid mainImage(const in vec4 inputColor,const in vec2 uv,const in float depth,out vec4 outputColor){float aoLinear=texture2D(aoBuffer,uv).r;\n#if defined(DEPTH_AWARE_UPSAMPLING) && __VERSION__ == 300\nvec4 normalDepth[4]=vec4[](textureOffset(normalDepthBuffer,uv,ivec2(0,0)),textureOffset(normalDepthBuffer,uv,ivec2(0,1)),textureOffset(normalDepthBuffer,uv,ivec2(1,0)),textureOffset(normalDepthBuffer,uv,ivec2(1,1)));float dot01=dot(normalDepth[0].rgb,normalDepth[1].rgb);float dot02=dot(normalDepth[0].rgb,normalDepth[2].rgb);float dot03=dot(normalDepth[0].rgb,normalDepth[3].rgb);float minDot=min(dot01,min(dot02,dot03));float s=step(THRESHOLD,minDot);float smallestDistance=1.0;int index;for(int i=0;i<4;++i){float distance=abs(depth-normalDepth[i].a);if(distance<smallestDistance){smallestDistance=distance;index=i;}}ivec2 offsets[4]=ivec2[](ivec2(0,0),ivec2(0,1),ivec2(1,0),ivec2(1,1));ivec2 coord=ivec2(uv*vec2(textureSize(aoBuffer,0)))+offsets[index];float aoNearest=texelFetch(aoBuffer,coord,0).r;float ao=mix(aoNearest,aoLinear,s);\n#else\nfloat ao=aoLinear;\n#endif\nfloat l=linearToRelativeLuminance(inputColor.rgb);ao=mix(ao,1.0,l*luminanceInfluence);\n#ifdef COLORIZE\noutputColor=vec4(1.0-(1.0-ao)*(1.0-color),inputColor.a);\n#else\noutputColor=vec4(vec3(ao),inputColor.a);\n#endif\n}";

	/**
	 * The size of the generated noise texture.
	 *
	 * @type {Number}
	 * @private
	 */

	var NOISE_TEXTURE_SIZE = 64;

	/**
	 * A Screen Space Ambient Occlusion (SSAO) effect.
	 *
	 * For high quality visuals use two SSAO effect instances in a row with
	 * different radii, one for rough AO and one for fine details.
	 *
	 * This effect supports depth-aware upsampling and should be rendered at a lower
	 * resolution. The resolution should match that of the downsampled normals and
	 * depth. If you intend to render SSAO at full resolution, do not provide a
	 * downsampled `normalDepthBuffer` and make sure to disable
	 * `depthAwareUpsampling`.
	 *
	 * It's recommended to specify a relative render resolution using the
	 * `resolutionScale` constructor parameter to avoid undesired sampling patterns.
	 *
	 * Based on "Scalable Ambient Obscurance" by Morgan McGuire et al. and
	 * "Depth-aware upsampling experiments" by Eleni Maria Stea:
	 * https://research.nvidia.com/publication/scalable-ambient-obscurance
	 * https://eleni.mutantstargoat.com/hikiko/on-depth-aware-upsampling
	 */

	var SSAOEffect = /*@__PURE__*/(function (Effect) {
		function SSAOEffect(camera, normalBuffer, ref) {
			var this$1 = this;
			if ( ref === void 0 ) ref = {};
			var blendFunction = ref.blendFunction; if ( blendFunction === void 0 ) blendFunction = BlendFunction.MULTIPLY;
			var distanceScaling = ref.distanceScaling; if ( distanceScaling === void 0 ) distanceScaling = true;
			var depthAwareUpsampling = ref.depthAwareUpsampling; if ( depthAwareUpsampling === void 0 ) depthAwareUpsampling = true;
			var normalDepthBuffer = ref.normalDepthBuffer; if ( normalDepthBuffer === void 0 ) normalDepthBuffer = null;
			var samples = ref.samples; if ( samples === void 0 ) samples = 9;
			var rings = ref.rings; if ( rings === void 0 ) rings = 7;
			var distanceThreshold = ref.distanceThreshold; if ( distanceThreshold === void 0 ) distanceThreshold = 0.97;
			var distanceFalloff = ref.distanceFalloff; if ( distanceFalloff === void 0 ) distanceFalloff = 0.03;
			var rangeThreshold = ref.rangeThreshold; if ( rangeThreshold === void 0 ) rangeThreshold = 0.0005;
			var rangeFalloff = ref.rangeFalloff; if ( rangeFalloff === void 0 ) rangeFalloff = 0.001;
			var minRadiusScale = ref.minRadiusScale; if ( minRadiusScale === void 0 ) minRadiusScale = 0.33;
			var luminanceInfluence = ref.luminanceInfluence; if ( luminanceInfluence === void 0 ) luminanceInfluence = 0.7;
			var radius = ref.radius; if ( radius === void 0 ) radius = 0.1825;
			var intensity = ref.intensity; if ( intensity === void 0 ) intensity = 1.0;
			var bias = ref.bias; if ( bias === void 0 ) bias = 0.025;
			var fade = ref.fade; if ( fade === void 0 ) fade = 0.01;
			var color = ref.color; if ( color === void 0 ) color = null;
			var resolutionScale = ref.resolutionScale; if ( resolutionScale === void 0 ) resolutionScale = 1.0;
			var width = ref.width; if ( width === void 0 ) width = Resizer.AUTO_SIZE;
			var height = ref.height; if ( height === void 0 ) height = Resizer.AUTO_SIZE;


			Effect.call(this, "SSAOEffect", fragmentShader$A, {

				blendFunction: blendFunction,
				attributes: EffectAttribute.DEPTH,

				uniforms: new Map([
					["aoBuffer", new three.Uniform(null)],
					["normalDepthBuffer", new three.Uniform(null)],
					["luminanceInfluence", new three.Uniform(luminanceInfluence)],
					["color", new three.Uniform(null)],
					["scale", new three.Uniform(0.0)] // Unused.
				])

			});

			/**
			 * A render target for the ambient occlusion shadows.
			 *
			 * @type {WebGLRenderTarget}
			 * @private
			 */

			this.renderTargetAO = new three.WebGLRenderTarget(1, 1, {
				minFilter: three.LinearFilter,
				magFilter: three.LinearFilter,
				stencilBuffer: false,
				depthBuffer: false,
				format: three.RGBFormat
			});

			this.renderTargetAO.texture.name = "AO.Target";
			this.renderTargetAO.texture.generateMipmaps = false;

			this.uniforms.get("aoBuffer").value = this.renderTargetAO.texture;

			/**
			 * The resolution of this effect.
			 *
			 * @type {Resizer}
			 */

			this.resolution = new Resizer(this, width, height, resolutionScale);

			/**
			 * The current radius relative to the render height.
			 *
			 * @type {Camera}
			 * @private
			 */

			this.r = 1.0;

			/**
			 * The main camera.
			 *
			 * @type {Camera}
			 * @private
			 */

			this.camera = camera;

			/**
			 * An SSAO pass.
			 *
			 * @type {ShaderPass}
			 * @private
			 */

			this.ssaoPass = new ShaderPass((function () {

				var noiseTexture = new NoiseTexture(NOISE_TEXTURE_SIZE, NOISE_TEXTURE_SIZE);
				noiseTexture.wrapS = noiseTexture.wrapT = three.RepeatWrapping;

				var material = new SSAOMaterial(camera);
				material.uniforms.noiseTexture.value = noiseTexture;
				material.uniforms.intensity.value = intensity;
				material.uniforms.minRadiusScale.value = minRadiusScale;
				material.uniforms.fade.value = fade;
				material.uniforms.bias.value = bias;

				if(normalDepthBuffer !== null) {

					material.uniforms.normalDepthBuffer.value = normalDepthBuffer;
					material.defines.NORMAL_DEPTH = "1";

					if(depthAwareUpsampling) {

						this$1.depthAwareUpsampling = depthAwareUpsampling;
						this$1.uniforms.get("normalDepthBuffer").value = normalDepthBuffer;
						this$1.defines.set("THRESHOLD", "0.997");

					}

				} else {

					material.uniforms.normalBuffer.value = normalBuffer;

				}

				return material;

			})());

			this.distanceScaling = distanceScaling;
			this.samples = samples;
			this.rings = rings;
			this.color = color;

			// @todo Special case treatment added for backwards-compatibility.
			this.radius = (radius > 1.0) ? (radius / 100.0) : radius;

			this.setDistanceCutoff(distanceThreshold, distanceFalloff);
			this.setProximityCutoff(rangeThreshold, rangeFalloff);

		}

		if ( Effect ) SSAOEffect.__proto__ = Effect;
		SSAOEffect.prototype = Object.create( Effect && Effect.prototype );
		SSAOEffect.prototype.constructor = SSAOEffect;

		var prototypeAccessors = { ssaoMaterial: { configurable: true },samples: { configurable: true },rings: { configurable: true },radius: { configurable: true },depthAwareUpsampling: { configurable: true },distanceScaling: { configurable: true },color: { configurable: true } };

		/**
		 * The SSAO material.
		 *
		 * @type {SSAOMaterial}
		 */

		prototypeAccessors.ssaoMaterial.get = function () {

			return this.ssaoPass.getFullscreenMaterial();

		};

		/**
		 * The amount of occlusion samples per pixel.
		 *
		 * @type {Number}
		 */

		prototypeAccessors.samples.get = function () {

			return Number(this.ssaoMaterial.defines.SAMPLES_INT);

		};

		/**
		 * Sets the amount of occlusion samples per pixel.
		 *
		 * @type {Number}
		 */

		prototypeAccessors.samples.set = function (value) {

			var material = this.ssaoMaterial;
			material.defines.SAMPLES_INT = value.toFixed(0);
			material.defines.SAMPLES_FLOAT = value.toFixed(1);
			material.needsUpdate = true;

		};

		/**
		 * The amount of spiral turns in the occlusion sampling pattern.
		 *
		 * @type {Number}
		 */

		prototypeAccessors.rings.get = function () {

			return Number(this.ssaoMaterial.defines.SPIRAL_TURNS);

		};

		/**
		 * Sets the amount of spiral turns in the occlusion sampling pattern.
		 *
		 * @type {Number}
		 */

		prototypeAccessors.rings.set = function (value) {

			var material = this.ssaoMaterial;
			material.defines.SPIRAL_TURNS = value.toFixed(1);
			material.needsUpdate = true;

		};

		/**
		 * The occlusion sampling radius.
		 *
		 * @type {Number}
		 */

		prototypeAccessors.radius.get = function () {

			return this.r;

		};

		/**
		 * Sets the occlusion sampling radius. Range [1e-6, 1.0].
		 *
		 * @type {Number}
		 */

		prototypeAccessors.radius.set = function (value) {

			this.r = Math.min(Math.max(value, 1e-6), 1.0);

			var radius = this.r * this.resolution.height;
			var material = this.ssaoMaterial;
			material.defines.RADIUS = radius.toFixed(11);
			material.defines.RADIUS_SQ = (radius * radius).toFixed(11);
			material.needsUpdate = true;

		};

		/**
		 * Indicates whether depth-aware upsampling is enabled.
		 *
		 * @type {Boolean}
		 */

		prototypeAccessors.depthAwareUpsampling.get = function () {

			return this.defines.has("DEPTH_AWARE_UPSAMPLING");

		};

		/**
		 * Enables or disables depth-aware upsampling.
		 *
		 * @type {Boolean}
		 */

		prototypeAccessors.depthAwareUpsampling.set = function (value) {

			if(this.depthAwareUpsampling !== value) {

				if(value) {

					this.defines.set("DEPTH_AWARE_UPSAMPLING", "1");

				} else {

					this.defines.delete("DEPTH_AWARE_UPSAMPLING");

				}

				this.setChanged();

			}

		};

		/**
		 * Indicates whether distance-based radius scaling is enabled.
		 *
		 * @type {Boolean}
		 */

		prototypeAccessors.distanceScaling.get = function () {

			return (this.ssaoMaterial.defines.DISTANCE_SCALING !== undefined);

		};

		/**
		 * Enables or disables distance-based radius scaling.
		 *
		 * @type {Boolean}
		 */

		prototypeAccessors.distanceScaling.set = function (value) {

			if(this.distanceScaling !== value) {

				var material = this.ssaoMaterial;

				if(value) {

					material.defines.DISTANCE_SCALING = "1";

				} else {

					delete material.defines.DISTANCE_SCALING;

				}

				material.needsUpdate = true;

			}

		};

		/**
		 * The color of the ambient occlusion.
		 *
		 * @type {Color}
		 */

		prototypeAccessors.color.get = function () {

			return this.uniforms.get("color").value;

		};

		/**
		 * Sets the color of the ambient occlusion.
		 *
		 * Set to `null` to disable colorization.
		 *
		 * @type {Color}
		 */

		prototypeAccessors.color.set = function (value) {

			var uniforms = this.uniforms;
			var defines = this.defines;

			if(value !== null) {

				if(defines.has("COLORIZE")) {

					uniforms.get("color").value.set(value);

				} else {

					defines.set("COLORIZE", "1");
					uniforms.get("color").value = new three.Color(value);
					this.setChanged();

				}

			} else if(defines.has("COLORIZE")) {

				defines.delete("COLORIZE");
				uniforms.get("color").value = null;
				this.setChanged();

			}

		};

		/**
		 * Sets the occlusion distance cutoff.
		 *
		 * @param {Number} threshold - The distance threshold. Range [0.0, 1.0].
		 * @param {Number} falloff - The falloff. Range [0.0, 1.0].
		 */

		SSAOEffect.prototype.setDistanceCutoff = function setDistanceCutoff (threshold, falloff) {

			this.ssaoMaterial.uniforms.distanceCutoff.value.set(
				Math.min(Math.max(threshold, 0.0), 1.0),
				Math.min(Math.max(threshold + falloff, 0.0), 1.0)
			);

		};

		/**
		 * Sets the occlusion proximity cutoff.
		 *
		 * @param {Number} threshold - The range threshold. Range [0.0, 1.0].
		 * @param {Number} falloff - The falloff. Range [0.0, 1.0].
		 */

		SSAOEffect.prototype.setProximityCutoff = function setProximityCutoff (threshold, falloff) {

			this.ssaoMaterial.uniforms.proximityCutoff.value.set(
				Math.min(Math.max(threshold, 0.0), 1.0),
				Math.min(Math.max(threshold + falloff, 0.0), 1.0)
			);

		};

		/**
		 * Sets the depth texture.
		 *
		 * @param {Texture} depthTexture - A depth texture.
		 * @param {Number} [depthPacking=0] - The depth packing.
		 */

		SSAOEffect.prototype.setDepthTexture = function setDepthTexture (depthTexture, depthPacking) {
			if ( depthPacking === void 0 ) depthPacking = 0;


			var material = this.ssaoMaterial;

			if(material.defines.NORMAL_DEPTH === undefined) {

				material.uniforms.normalDepthBuffer.value = depthTexture;
				material.depthPacking = depthPacking;

			}

		};

		/**
		 * Updates this effect.
		 *
		 * @param {WebGLRenderer} renderer - The renderer.
		 * @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
		 * @param {Number} [deltaTime] - The time between the last frame and the current one in seconds.
		 */

		SSAOEffect.prototype.update = function update (renderer, inputBuffer, deltaTime) {

			this.ssaoPass.render(renderer, null, this.renderTargetAO);

		};

		/**
		 * Updates the camera projection matrix uniforms and the size of internal
		 * render targets.
		 *
		 * @param {Number} width - The width.
		 * @param {Number} height - The height.
		 */

		SSAOEffect.prototype.setSize = function setSize (width, height) {

			var resolution = this.resolution;
			resolution.base.set(width, height);

			var w = resolution.width;
			var h = resolution.height;

			this.renderTargetAO.setSize(w, h);
			this.ssaoMaterial.setTexelSize(1.0 / w, 1.0 / h);

			var camera = this.camera;
			var uniforms = this.ssaoMaterial.uniforms;
			uniforms.noiseScale.value.set(w, h).divideScalar(NOISE_TEXTURE_SIZE);
			uniforms.inverseProjectionMatrix.value.getInverse(camera.projectionMatrix);
			uniforms.projectionMatrix.value.copy(camera.projectionMatrix);

			// Update the absolute radius.
			this.radius = this.r;

		};

		Object.defineProperties( SSAOEffect.prototype, prototypeAccessors );

		return SSAOEffect;
	}(Effect));

	var fragmentShader$B = "uniform sampler2D texture;\n#if defined(ASPECT_CORRECTION) || defined(UV_TRANSFORM)\nvarying vec2 vUv2;\n#endif\nvoid mainImage(const in vec4 inputColor,const in vec2 uv,out vec4 outputColor){\n#if defined(ASPECT_CORRECTION) || defined(UV_TRANSFORM)\nvec4 texel=texelToLinear(texture2D(texture,vUv2));\n#else\nvec4 texel=texelToLinear(texture2D(texture,uv));\n#endif\noutputColor=TEXEL;}";

	var vertexShader$c = "#ifdef ASPECT_CORRECTION\nuniform float scale;\n#else\nuniform mat3 uvTransform;\n#endif\nvarying vec2 vUv2;void mainSupport(const in vec2 uv){\n#ifdef ASPECT_CORRECTION\nvUv2=uv*vec2(aspect,1.0)*scale;\n#else\nvUv2=(uvTransform*vec3(uv,1.0)).xy;\n#endif\n}";

	/**
	 * A texture effect.
	 */

	var TextureEffect = /*@__PURE__*/(function (Effect) {
		function TextureEffect(ref) {
			if ( ref === void 0 ) ref = {};
			var blendFunction = ref.blendFunction; if ( blendFunction === void 0 ) blendFunction = BlendFunction.NORMAL;
			var texture = ref.texture; if ( texture === void 0 ) texture = null;
			var aspectCorrection = ref.aspectCorrection; if ( aspectCorrection === void 0 ) aspectCorrection = false;


			Effect.call(this, "TextureEffect", fragmentShader$B, {

				blendFunction: blendFunction,

				defines: new Map([
					["TEXEL", "texel"]
				]),

				uniforms: new Map([
					["texture", new three.Uniform(null)],
					["scale", new three.Uniform(1.0)],
					["uvTransform", new three.Uniform(null)]
				])

			});

			this.texture = texture;
			this.aspectCorrection = aspectCorrection;

		}

		if ( Effect ) TextureEffect.__proto__ = Effect;
		TextureEffect.prototype = Object.create( Effect && Effect.prototype );
		TextureEffect.prototype.constructor = TextureEffect;

		var prototypeAccessors = { texture: { configurable: true },aspectCorrection: { configurable: true },uvTransform: { configurable: true } };

		/**
		 * The texture.
		 *
		 * @type {Texture}
		 */

		prototypeAccessors.texture.get = function () {

			return this.uniforms.get("texture").value;

		};

		/**
		 * Sets the texture.
		 *
		 * @type {Texture}
		 */

		prototypeAccessors.texture.set = function (value) {

			var currentTexture = this.texture;

			if(currentTexture !== value) {

				var previousEncoding = (currentTexture !== null) ? currentTexture.encoding : null;
				this.uniforms.get("texture").value = value;

				if(value !== null) {

					if(value.encoding === three.sRGBEncoding) {

						this.defines.set("texelToLinear(texel)", "sRGBToLinear(texel)");

					} else if(value.encoding === three.LinearEncoding) {

						this.defines.set("texelToLinear(texel)", "texel");

					} else {

						console.log("Unsupported encoding: " + value.encoding);

					}

					if(previousEncoding !== value.encoding) {

						this.setChanged();

					}

				}

			}

		};

		/**
		 * Indicates whether aspect correction is enabled.
		 *
		 * If enabled, the texture can be scaled using the `scale` uniform.
		 *
		 * @type {Number}
		 * @deprecated Use uvTransform instead for full control over the texture coordinates.
		 */

		prototypeAccessors.aspectCorrection.get = function () {

			return this.defines.has("ASPECT_CORRECTION");

		};

		/**
		 * Enables or disables aspect correction.
		 *
		 * @type {Number}
		 * @deprecated Use uvTransform instead for full control over the texture coordinates.
		 */

		prototypeAccessors.aspectCorrection.set = function (value) {

			if(this.aspectCorrection !== value) {

				if(value) {

					if(this.uvTransform) {

						this.uvTransform = false;

					}

					this.defines.set("ASPECT_CORRECTION", "1");
					this.setVertexShader(vertexShader$c);

				} else {

					this.defines.delete("ASPECT_CORRECTION");
					this.setVertexShader(null);

				}

				this.setChanged();

			}

		};

		/**
		 * Indicates whether the texture UV coordinates will be transformed using the
		 * transformation matrix of the texture.
		 *
		 * Cannot be used if aspect correction is enabled.
		 *
		 * @type {Boolean}
		 */

		prototypeAccessors.uvTransform.get = function () {

			return this.defines.has("UV_TRANSFORM");

		};

		/**
		 * Enables or disables texture UV transformation.
		 *
		 * @type {Boolean}
		 */

		prototypeAccessors.uvTransform.set = function (value) {

			if(this.uvTransform !== value) {

				if(value) {

					if(this.aspectCorrection) {

						this.aspectCorrection = false;

					}

					this.defines.set("UV_TRANSFORM", "1");
					this.uniforms.get("uvTransform").value = new three.Matrix3();
					this.setVertexShader(vertexShader$c);

				} else {

					this.defines.delete("UV_TRANSFORM");
					this.uniforms.get("uvTransform").value = null;
					this.setVertexShader(null);

				}

				this.setChanged();

			}

		};

		/**
		 * Sets the swizzles that will be applied to the `r`, `g`, `b`, and `a`
		 * components of a texel before it is written to the output color.
		 *
		 * @param {ColorChannel} r - The swizzle for the `r` component.
		 * @param {ColorChannel} [g=r] - The swizzle for the `g` component.
		 * @param {ColorChannel} [b=r] - The swizzle for the `b` component.
		 * @param {ColorChannel} [a=r] - The swizzle for the `a` component.
		 */

		TextureEffect.prototype.setTextureSwizzleRGBA = function setTextureSwizzleRGBA (r, g, b, a) {
			if ( g === void 0 ) g = r;
			if ( b === void 0 ) b = r;
			if ( a === void 0 ) a = r;


			var rgba = "rgba";
			var swizzle = "";

			if(r !== ColorChannel.RED || g !== ColorChannel.GREEN ||
				b !== ColorChannel.BLUE || a !== ColorChannel.ALPHA) {

				swizzle = [".", rgba[r], rgba[g], rgba[b], rgba[a]].join("");

			}

			this.defines.set("TEXEL", "texel" + swizzle);
			this.setChanged();

		};

		/**
		 * Updates this effect.
		 *
		 * @param {WebGLRenderer} renderer - The renderer.
		 * @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
		 * @param {Number} [deltaTime] - The time between the last frame and the current one in seconds.
		 */

		TextureEffect.prototype.update = function update (renderer, inputBuffer, deltaTime) {

			var texture = this.uniforms.get("texture").value;

			if(this.uvTransform && texture.matrixAutoUpdate) {

				texture.updateMatrix();
				this.uniforms.get("uvTransform").value.copy(texture.matrix);

			}

		};

		Object.defineProperties( TextureEffect.prototype, prototypeAccessors );

		return TextureEffect;
	}(Effect));

	var fragmentShader$C = "uniform sampler2D luminanceMap;uniform float middleGrey;uniform float maxLuminance;uniform float averageLuminance;vec3 toneMap(vec3 c){\n#ifdef ADAPTED_LUMINANCE\nfloat lumAvg=texture2D(luminanceMap,vec2(0.5)).r;\n#else\nfloat lumAvg=averageLuminance;\n#endif\nfloat lumPixel=linearToRelativeLuminance(c);float lumScaled=(lumPixel*middleGrey)/lumAvg;float lumCompressed=(lumScaled*(1.0+(lumScaled/(maxLuminance*maxLuminance))))/(1.0+lumScaled);return lumCompressed*c;}void mainImage(const in vec4 inputColor,const in vec2 uv,out vec4 outputColor){outputColor=vec4(toneMap(inputColor.rgb),inputColor.a);}";

	/**
	 * A tone mapping effect that supports adaptive luminosity.
	 *
	 * If adaptivity is enabled, this effect generates a texture that represents the
	 * luminosity of the current scene and adjusts it over time to simulate the
	 * optic nerve responding to the amount of light it is receiving.
	 *
	 * Reference:
	 *  GDC2007 - Wolfgang Engel, Post-Processing Pipeline
	 *  http://perso.univ-lyon1.fr/jean-claude.iehl/Public/educ/GAMA/2007/gdc07/Post-Processing_Pipeline.pdf
	 */

	var ToneMappingEffect = /*@__PURE__*/(function (Effect) {
		function ToneMappingEffect(ref) {
			if ( ref === void 0 ) ref = {};
			var blendFunction = ref.blendFunction; if ( blendFunction === void 0 ) blendFunction = BlendFunction.NORMAL;
			var adaptive = ref.adaptive; if ( adaptive === void 0 ) adaptive = true;
			var resolution = ref.resolution; if ( resolution === void 0 ) resolution = 256;
			var middleGrey = ref.middleGrey; if ( middleGrey === void 0 ) middleGrey = 0.6;
			var maxLuminance = ref.maxLuminance; if ( maxLuminance === void 0 ) maxLuminance = 16.0;
			var averageLuminance = ref.averageLuminance; if ( averageLuminance === void 0 ) averageLuminance = 1.0;
			var adaptationRate = ref.adaptationRate; if ( adaptationRate === void 0 ) adaptationRate = 2.0;


			Effect.call(this, "ToneMappingEffect", fragmentShader$C, {

				blendFunction: blendFunction,

				uniforms: new Map([
					["luminanceMap", new three.Uniform(null)],
					["middleGrey", new three.Uniform(middleGrey)],
					["maxLuminance", new three.Uniform(maxLuminance)],
					["averageLuminance", new three.Uniform(averageLuminance)]
				])

			});

			/**
			 * The render target for the current luminance.
			 *
			 * @type {WebGLRenderTarget}
			 * @private
			 * @todo Remove LinearMipMapLinearFilter in next major release.
			 */

			this.renderTargetLuminance = new three.WebGLRenderTarget(1, 1, {
				minFilter: (three.LinearMipmapLinearFilter !== undefined) ? three.LinearMipmapLinearFilter : three.LinearMipMapLinearFilter,
				magFilter: three.LinearFilter,
				stencilBuffer: false,
				depthBuffer: false,
				format: three.RGBFormat
			});

			this.renderTargetLuminance.texture.name = "ToneMapping.Luminance";
			this.renderTargetLuminance.texture.generateMipmaps = true;

			/**
			 * The render target for adapted luminance.
			 *
			 * @type {WebGLRenderTarget}
			 * @private
			 */

			this.renderTargetAdapted = this.renderTargetLuminance.clone();
			this.renderTargetAdapted.texture.name = "ToneMapping.AdaptedLuminance";
			this.renderTargetAdapted.texture.generateMipmaps = false;
			this.renderTargetAdapted.texture.minFilter = three.LinearFilter;

			/**
			 * A render target that holds a copy of the adapted luminance.
			 *
			 * @type {WebGLRenderTarget}
			 * @private
			 */

			this.renderTargetPrevious = this.renderTargetAdapted.clone();
			this.renderTargetPrevious.texture.name = "ToneMapping.PreviousLuminance";

			/**
			 * A save pass.
			 *
			 * @type {SavePass}
			 * @private
			 */

			this.savePass = new SavePass(this.renderTargetPrevious, false);

			/**
			 * A luminance shader pass.
			 *
			 * @type {ShaderPass}
			 * @private
			 */

			this.luminancePass = new ShaderPass(new LuminanceMaterial());

			var luminanceMaterial = this.luminancePass.getFullscreenMaterial();
			luminanceMaterial.useThreshold = false;

			/**
			 * An adaptive luminance shader pass.
			 *
			 * @type {ShaderPass}
			 * @private
			 */

			this.adaptiveLuminancePass = new ShaderPass(new AdaptiveLuminanceMaterial());

			var uniforms = this.adaptiveLuminancePass.getFullscreenMaterial().uniforms;
			uniforms.previousLuminanceBuffer.value = this.renderTargetPrevious.texture;
			uniforms.currentLuminanceBuffer.value = this.renderTargetLuminance.texture;

			this.adaptationRate = adaptationRate;
			this.resolution = resolution;
			this.adaptive = adaptive;

		}

		if ( Effect ) ToneMappingEffect.__proto__ = Effect;
		ToneMappingEffect.prototype = Object.create( Effect && Effect.prototype );
		ToneMappingEffect.prototype.constructor = ToneMappingEffect;

		var prototypeAccessors = { resolution: { configurable: true },adaptive: { configurable: true },adaptationRate: { configurable: true },distinction: { configurable: true } };

		/**
		 * The resolution of the render targets.
		 *
		 * @type {Number}
		 */

		prototypeAccessors.resolution.get = function () {

			return this.renderTargetLuminance.width;

		};

		/**
		 * Sets the resolution of the internal render targets.
		 *
		 * @type {Number}
		 */

		prototypeAccessors.resolution.set = function (value) {

			// Round the given value to the next power of two.
			var exponent = Math.max(0, Math.ceil(Math.log2(value)));
			var size = Math.pow(2, exponent);

			this.renderTargetLuminance.setSize(size, size);
			this.renderTargetPrevious.setSize(size, size);
			this.renderTargetAdapted.setSize(size, size);

			var material = this.adaptiveLuminancePass.getFullscreenMaterial();
			material.defines.MIP_LEVEL_1X1 = exponent.toFixed(1);
			material.needsUpdate = true;

		};

		/**
		 * Indicates whether this pass uses adaptive luminance.
		 *
		 * @type {Boolean}
		 */

		prototypeAccessors.adaptive.get = function () {

			return this.defines.has("ADAPTED_LUMINANCE");

		};

		/**
		 * Enables or disables adaptive luminance.
		 *
		 * @type {Boolean}
		 */

		prototypeAccessors.adaptive.set = function (value) {

			if(this.adaptive !== value) {

				if(value) {

					this.defines.set("ADAPTED_LUMINANCE", "1");
					this.uniforms.get("luminanceMap").value = this.renderTargetAdapted.texture;

				} else {

					this.defines.delete("ADAPTED_LUMINANCE");
					this.uniforms.get("luminanceMap").value = null;

				}

				this.setChanged();

			}

		};

		/**
		 * The luminance adaptation rate.
		 *
		 * @type {Number}
		 */

		prototypeAccessors.adaptationRate.get = function () {

			return this.adaptiveLuminancePass.getFullscreenMaterial().uniforms.tau.value;

		};

		/**
		 * @type {Number}
		 */

		prototypeAccessors.adaptationRate.set = function (value) {

			this.adaptiveLuminancePass.getFullscreenMaterial().uniforms.tau.value = value;

		};

		/**
		 * @type {Number}
		 * @deprecated
		 */

		prototypeAccessors.distinction.get = function () {

			console.warn(this.name, "The distinction field has been removed.");

			return 1.0;

		};

		/**
		 * @type {Number}
		 * @deprecated
		 */

		prototypeAccessors.distinction.set = function (value) {

			console.warn(this.name, "The distinction field has been removed.");

		};

		/**
		 * Updates this effect.
		 *
		 * @param {WebGLRenderer} renderer - The renderer.
		 * @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
		 * @param {Number} [deltaTime] - The time between the last frame and the current one in seconds.
		 */

		ToneMappingEffect.prototype.update = function update (renderer, inputBuffer, deltaTime) {

			if(this.adaptive) {

				// Render the luminance of the current scene into a mipmap render target.
				this.luminancePass.render(renderer, inputBuffer, this.renderTargetLuminance);

				// Use the frame delta to adapt the luminance over time.
				var uniforms = this.adaptiveLuminancePass.getFullscreenMaterial().uniforms;
				uniforms.deltaTime.value = deltaTime;
				this.adaptiveLuminancePass.render(renderer, null, this.renderTargetAdapted);

				// Save the adapted luminance for the next frame.
				this.savePass.render(renderer, this.renderTargetAdapted);

			}

		};

		/**
		 * Updates the size of internal render targets.
		 *
		 * @param {Number} width - The width.
		 * @param {Number} height - The height.
		 */

		ToneMappingEffect.prototype.setSize = function setSize (width, height) {

			this.savePass.setSize(width, height);

		};

		/**
		 * Performs initialization tasks.
		 *
		 * @param {WebGLRenderer} renderer - The renderer.
		 * @param {Boolean} alpha - Whether the renderer uses the alpha channel or not.
		 * @param {Number} frameBufferType - The type of the main frame buffers.
		 */

		ToneMappingEffect.prototype.initialize = function initialize (renderer, alpha, frameBufferType) {

			var clearPass = new ClearPass(true, false, false);
			clearPass.overrideClearColor = new three.Color(0x7fffff);
			clearPass.render(renderer, this.renderTargetPrevious);
			clearPass.dispose();

		};

		Object.defineProperties( ToneMappingEffect.prototype, prototypeAccessors );

		return ToneMappingEffect;
	}(Effect));

	var fragmentShader$D = "uniform float offset;uniform float darkness;void mainImage(const in vec4 inputColor,const in vec2 uv,out vec4 outputColor){const vec2 center=vec2(0.5);vec3 color=inputColor.rgb;\n#ifdef ESKIL\nvec2 coord=(uv-center)*vec2(offset);color=mix(color,vec3(1.0-darkness),dot(coord,coord));\n#else\nfloat d=distance(uv,center);color*=smoothstep(0.8,offset*0.799,d*(darkness+offset));\n#endif\noutputColor=vec4(color,inputColor.a);}";

	/**
	 * A vignette effect.
	 */

	var VignetteEffect = /*@__PURE__*/(function (Effect) {
		function VignetteEffect(options) {
			if ( options === void 0 ) options = {};


			var settings = Object.assign({
				blendFunction: BlendFunction.NORMAL,
				eskil: false,
				offset: 0.5,
				darkness: 0.5
			}, options);

			Effect.call(this, "VignetteEffect", fragmentShader$D, {

				blendFunction: settings.blendFunction,

				uniforms: new Map([
					["offset", new three.Uniform(settings.offset)],
					["darkness", new three.Uniform(settings.darkness)]
				])

			});

			this.eskil = settings.eskil;

		}

		if ( Effect ) VignetteEffect.__proto__ = Effect;
		VignetteEffect.prototype = Object.create( Effect && Effect.prototype );
		VignetteEffect.prototype.constructor = VignetteEffect;

		var prototypeAccessors = { eskil: { configurable: true } };

		/**
		 * Indicates whether Eskil's vignette technique is enabled.
		 *
		 * @type {Boolean}
		 */

		prototypeAccessors.eskil.get = function () {

			return this.defines.has("ESKIL");

		};

		/**
		 * Enables or disables Eskil's vignette technique.
		 *
		 * @type {Boolean}
		 */

		prototypeAccessors.eskil.set = function (value) {

			if(this.eskil !== value) {

				if(value) {

					this.defines.set("ESKIL", "1");

				} else {

					this.defines.delete("ESKIL");

				}

				this.setChanged();

			}

		};

		Object.defineProperties( VignetteEffect.prototype, prototypeAccessors );

		return VignetteEffect;
	}(Effect));

	/**
	 * Creates a new canvas from raw image data.
	 *
	 * @private
	 * @param {Number} width - The image width.
	 * @param {Number} height - The image height.
	 * @param {Uint8ClampedArray} data - The image data.
	 * @return {Canvas} The canvas.
	 */

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

	/**
	 * A container for raw image data.
	 */

	var RawImageData = function RawImageData(width, height, data) {
		if ( width === void 0 ) width = 0;
		if ( height === void 0 ) height = 0;
		if ( data === void 0 ) data = null;


		/**
			 * The width of the image.
			 *
			 * @type {Number}
			 */

		this.width = width;

		/**
			 * The height of the image.
			 *
			 * @type {Number}
			 */

		this.height = height;

		/**
			 * The image data.
			 *
			 * @type {Uint8ClampedArray}
			 */

		this.data = data;

	};

	/**
		 * Creates a canvas from this image data.
		 *
		 * @return {Canvas} The canvas or null if it couldn't be created.
		 */

	RawImageData.prototype.toCanvas = function toCanvas () {

		return (typeof document === "undefined") ? null : createCanvas(
			this.width,
			this.height,
			this.data
		);

	};

	/**
		 * Creates a new image data container.
		 *
		 * @param {Object} data - Raw image data.
		 * @return {RawImageData} The image data.
		 */

	RawImageData.from = function from (data) {

		return new RawImageData(data.width, data.height, data.data);

	};

	var workerProgram = "!function(){\"use strict\";var e=function(e,t,a){void 0===e&&(e=0),void 0===t&&(t=0),void 0===a&&(a=null),this.width=e,this.height=t,this.data=a};e.prototype.toCanvas=function(){return\"undefined\"==typeof document?null:(e=this.width,t=this.height,a=this.data,s=document.createElementNS(\"http://www.w3.org/1999/xhtml\",\"canvas\"),r=s.getContext(\"2d\"),(n=r.createImageData(e,t)).data.set(a),s.width=e,s.height=t,r.putImageData(n,0,0),s);var e,t,a,s,r,n},e.from=function(t){return new e(t.width,t.height,t.data)};var t=function(e,t){void 0===e&&(e=0),void 0===t&&(t=0),this.x=e,this.y=t};t.prototype.set=function(e,t){return this.x=e,this.y=t,this},t.prototype.equals=function(e){return this===e||this.x===e.x&&this.y===e.y};var a=function(){this.min=new t,this.max=new t},s=new a,r=new a,n=16,i=30,y=new Float32Array([0,-.25,.25,-.125,.125,-.375,.375]),x=[new Float32Array([0,0]),new Float32Array([.25,-.25]),new Float32Array([-.25,.25]),new Float32Array([.125,-.125]),new Float32Array([-.125,.125])],c=[new Uint8Array([0,0]),new Uint8Array([3,0]),new Uint8Array([0,3]),new Uint8Array([3,3]),new Uint8Array([1,0]),new Uint8Array([4,0]),new Uint8Array([1,3]),new Uint8Array([4,3]),new Uint8Array([0,1]),new Uint8Array([3,1]),new Uint8Array([0,4]),new Uint8Array([3,4]),new Uint8Array([1,1]),new Uint8Array([4,1]),new Uint8Array([1,4]),new Uint8Array([4,4])],w=[new Uint8Array([0,0]),new Uint8Array([1,0]),new Uint8Array([0,2]),new Uint8Array([1,2]),new Uint8Array([2,0]),new Uint8Array([3,0]),new Uint8Array([2,2]),new Uint8Array([3,2]),new Uint8Array([0,1]),new Uint8Array([1,1]),new Uint8Array([0,3]),new Uint8Array([1,3]),new Uint8Array([2,1]),new Uint8Array([3,1]),new Uint8Array([2,3]),new Uint8Array([3,3])];function o(e,t,a){return e+(t-e)*a}function h(e,t){var a,s=t.min,r=t.max,n=.5*Math.sqrt(2*s.x),i=.5*Math.sqrt(2*s.y),y=.5*Math.sqrt(2*r.x),x=.5*Math.sqrt(2*r.y),c=(a=e/32,Math.min(Math.max(a,0),1));return s.set(o(n,s.x,c),o(i,s.y,c)),r.set(o(y,r.x,c),o(x,r.y,c)),t}function u(e,t,a,s){var r,n,i,y,x=t.x-e.x,c=t.y-e.y,w=a,o=a+1,h=e.y+c*(w-e.x)/x,u=e.y+c*(o-e.x)/x;return w>=e.x&&w<t.x||o>e.x&&o<=t.x?Math.sign(h)===Math.sign(u)||Math.abs(h)<1e-4||Math.abs(u)<1e-4?(r=(h+u)/2)<0?s.set(Math.abs(r),0):s.set(0,Math.abs(r)):(n=(y=-e.y*x/c+e.x)>e.x?h*(y-Math.trunc(y))/2:0,i=y<t.x?u*(1-(y-Math.trunc(y)))/2:0,(r=Math.abs(n)>Math.abs(i)?n:-i)<0?s.set(Math.abs(n),Math.abs(i)):s.set(Math.abs(i),Math.abs(n))):s.set(0,0),s}function f(e,t,a,n,i){var y=s.min,x=s.max,c=r.min,w=r.max,o=r,f=.5+n,b=.5+n-1,A=t+a+1;switch(e){case 0:i.set(0,0);break;case 1:t<=a?u(y.set(0,b),x.set(A/2,0),t,i):i.set(0,0);break;case 2:t>=a?u(y.set(A/2,0),x.set(A,b),t,i):i.set(0,0);break;case 3:u(y.set(0,b),x.set(A/2,0),t,c),u(y.set(A/2,0),x.set(A,b),t,w),h(A,o),i.set(c.x+w.x,c.y+w.y);break;case 4:t<=a?u(y.set(0,f),x.set(A/2,0),t,i):i.set(0,0);break;case 5:i.set(0,0);break;case 6:Math.abs(n)>0?(u(y.set(0,f),x.set(A,b),t,c),u(y.set(0,f),x.set(A/2,0),t,w),u(y.set(A/2,0),x.set(A,b),t,i),w.set(w.x+i.x,w.y+i.y),i.set((c.x+w.x)/2,(c.y+w.y)/2)):u(y.set(0,f),x.set(A,b),t,i);break;case 7:u(y.set(0,f),x.set(A,b),t,i);break;case 8:t>=a?u(y.set(A/2,0),x.set(A,f),t,i):i.set(0,0);break;case 9:Math.abs(n)>0?(u(y.set(0,b),x.set(A,f),t,c),u(y.set(0,b),x.set(A/2,0),t,w),u(y.set(A/2,0),x.set(A,f),t,i),w.set(w.x+i.x,w.y+i.y),i.set((c.x+w.x)/2,(c.y+w.y)/2)):u(y.set(0,b),x.set(A,f),t,i);break;case 10:i.set(0,0);break;case 11:u(y.set(0,b),x.set(A,f),t,i);break;case 12:u(y.set(0,f),x.set(A/2,0),t,c),u(y.set(A/2,0),x.set(A,f),t,w),h(A,o),i.set(c.x+w.x,c.y+w.y);break;case 13:u(y.set(0,b),x.set(A,f),t,i);break;case 14:u(y.set(0,f),x.set(A,b),t,i);break;case 15:i.set(0,0)}return i}function b(e,t,a,s){var r=e.equals(t);if(!r){var n=(e.x+t.x)/2,i=(e.y+t.y)/2;r=(t.y-e.y)*(a-n)+(e.x-t.x)*(s-i)>0}return r}function A(e,t,a,s){var r,n,y;for(r=0,y=0;y<i;++y)for(n=0;n<i;++n)b(e,t,a+n/29,s+y/29)&&++r;return r/900}function U(e,t,a,s,r,n){var i=w[e],y=i[0],x=i[1];return y>0&&(t.x+=r[0],t.y+=r[1]),x>0&&(a.x+=r[0],a.y+=r[1]),n.set(1-A(t,a,1+s,0+s),A(t,a,1+s,1+s))}function d(e,t,a,n,i){var y=s.min,x=s.max,c=r.min,w=r.max,o=t+a+1;switch(e){case 0:U(e,y.set(1,1),x.set(1+o,1+o),t,n,c),U(e,y.set(1,0),x.set(1+o,0+o),t,n,w),i.set((c.x+w.x)/2,(c.y+w.y)/2);break;case 1:U(e,y.set(1,0),x.set(0+o,0+o),t,n,c),U(e,y.set(1,0),x.set(1+o,0+o),t,n,w),i.set((c.x+w.x)/2,(c.y+w.y)/2);break;case 2:U(e,y.set(0,0),x.set(1+o,0+o),t,n,c),U(e,y.set(1,0),x.set(1+o,0+o),t,n,w),i.set((c.x+w.x)/2,(c.y+w.y)/2);break;case 3:U(e,y.set(1,0),x.set(1+o,0+o),t,n,i);break;case 4:U(e,y.set(1,1),x.set(0+o,0+o),t,n,c),U(e,y.set(1,1),x.set(1+o,0+o),t,n,w),i.set((c.x+w.x)/2,(c.y+w.y)/2);break;case 5:U(e,y.set(1,1),x.set(0+o,0+o),t,n,c),U(e,y.set(1,0),x.set(1+o,0+o),t,n,w),i.set((c.x+w.x)/2,(c.y+w.y)/2);break;case 6:U(e,y.set(1,1),x.set(1+o,0+o),t,n,i);break;case 7:U(e,y.set(1,1),x.set(1+o,0+o),t,n,c),U(e,y.set(1,0),x.set(1+o,0+o),t,n,w),i.set((c.x+w.x)/2,(c.y+w.y)/2);break;case 8:U(e,y.set(0,0),x.set(1+o,1+o),t,n,c),U(e,y.set(1,0),x.set(1+o,1+o),t,n,w),i.set((c.x+w.x)/2,(c.y+w.y)/2);break;case 9:U(e,y.set(1,0),x.set(1+o,1+o),t,n,i);break;case 10:U(e,y.set(0,0),x.set(1+o,1+o),t,n,c),U(e,y.set(1,0),x.set(1+o,0+o),t,n,w),i.set((c.x+w.x)/2,(c.y+w.y)/2);break;case 11:U(e,y.set(1,0),x.set(1+o,1+o),t,n,c),U(e,y.set(1,0),x.set(1+o,0+o),t,n,w),i.set((c.x+w.x)/2,(c.y+w.y)/2);break;case 12:U(e,y.set(1,1),x.set(1+o,1+o),t,n,i);break;case 13:U(e,y.set(1,1),x.set(1+o,1+o),t,n,c),U(e,y.set(1,0),x.set(1+o,1+o),t,n,w),i.set((c.x+w.x)/2,(c.y+w.y)/2);break;case 14:U(e,y.set(1,1),x.set(1+o,1+o),t,n,c),U(e,y.set(1,1),x.set(1+o,0+o),t,n,w),i.set((c.x+w.x)/2,(c.y+w.y)/2);break;case 15:U(e,y.set(1,1),x.set(1+o,1+o),t,n,c),U(e,y.set(1,0),x.set(1+o,0+o),t,n,w),i.set((c.x+w.x)/2,(c.y+w.y)/2)}return i}function v(e,a,s){var r,n,i,y,x,c,w,o,h=new t;for(r=0,n=e.length;r<n;++r)for(w=(c=e[r]).data,o=c.width,y=0;y<o;++y)for(i=0;i<o;++i)s?f(r,i,y,a,h):d(r,i,y,a,h),w[x=2*(y*o+i)]=255*h.x,w[x+1]=255*h.y}function k(e,a,s,r,n,i){var y,x,c,w,o,h,u,f,b,A,U=new t,d=i.data,v=i.width;for(y=0,x=a.length;y<x;++y)for(u=s[y],b=(f=a[y]).data,A=f.width,w=0;w<r;++w)for(c=0;c<r;++c)U.set(u[0]*r+e.x+c,u[1]*r+e.y+w),h=n?2*(w*w*A+c*c):2*(w*A+c),d[o=4*(U.y*v+U.x)]=b[h],d[o+1]=b[h+1],d[o+2]=0,d[o+3]=255}var m=function(){};m.generate=function(){var a,s,r=5*y.length*n,i=new Uint8ClampedArray(160*r*4),o=new e(160,r,i),h=Math.pow(15,2)+1,u=[],f=[],b=new t;for(a=0;a<16;++a)u.push(new e(h,h,new Uint8ClampedArray(h*h*2),2)),f.push(new e(20,20,new Uint8ClampedArray(800),2));for(a=0,s=y.length;a<s;++a)v(u,y[a],!0),b.set(0,80*a),k(b,u,c,n,!0,o);for(a=0,s=x.length;a<s;++a)v(f,x[a],!1),b.set(80,80*a),k(b,f,w,20,!1,o);return o};var l=new Map([[M([0,0,0,0]),[0,0,0,0]],[M([0,0,0,1]),[0,0,0,1]],[M([0,0,1,0]),[0,0,1,0]],[M([0,0,1,1]),[0,0,1,1]],[M([0,1,0,0]),[0,1,0,0]],[M([0,1,0,1]),[0,1,0,1]],[M([0,1,1,0]),[0,1,1,0]],[M([0,1,1,1]),[0,1,1,1]],[M([1,0,0,0]),[1,0,0,0]],[M([1,0,0,1]),[1,0,0,1]],[M([1,0,1,0]),[1,0,1,0]],[M([1,0,1,1]),[1,0,1,1]],[M([1,1,0,0]),[1,1,0,0]],[M([1,1,0,1]),[1,1,0,1]],[M([1,1,1,0]),[1,1,1,0]],[M([1,1,1,1]),[1,1,1,1]]]);function g(e,t,a){return e+(t-e)*a}function M(e){var t=g(e[0],e[1],.75),a=g(e[2],e[3],.75);return g(t,a,.875)}function p(e,t){var a=0;return 1===t[3]&&1!==e[1]&&1!==e[3]&&(a+=1),1===a&&1===t[2]&&1!==e[0]&&1!==e[2]&&(a+=1),a}var C=function(){};C.generate=function(){var t,a,s,r,n,i,y,x,c,w,o=new Uint8ClampedArray(2178),h=new Uint8ClampedArray(4096);for(a=0;a<33;++a)for(t=0;t<66;++t)s=.03125*t,r=.03125*a,l.has(s)&&l.has(r)&&(i=l.get(s),y=l.get(r),o[n=66*a+t]=127*(x=i,w=void 0,w=0,1===(c=y)[3]&&(w+=1),1===w&&1===c[2]&&1!==x[1]&&1!==x[3]&&(w+=1),w),o[n+33]=127*p(i,y));for(n=0,a=17;a<33;++a)for(t=0;t<64;++t,n+=4)h[n]=o[66*a+t],h[n+3]=255;return new e(64,16,h)},self.addEventListener(\"message\",(function(e){var t=m.generate(),a=C.generate();postMessage({areaImageData:t,searchImageData:a},[t.data.buffer,a.data.buffer]),close()}))}();\n";

	/**
	 * Generates the SMAA data images.
	 *
	 * @private
	 * @param {Boolean} [disableCache=false] - Determines whether the generated image data should be cached.
	 * @return {Promise} A promise that returns the search image and area image as a data URL pair.
	 */

	function generate(disableCache) {
		if ( disableCache === void 0 ) disableCache = false;


		var workerURL = URL.createObjectURL(new Blob([workerProgram], { type: "text/javascript" }));
		var worker = new Worker(workerURL);

		return new Promise(function (resolve, reject) {

			worker.addEventListener("error", function (event) { return reject(event.error); });
			worker.addEventListener("message", function (event) {

				var searchImageData = RawImageData.from(event.data.searchImageData);
				var areaImageData = RawImageData.from(event.data.areaImageData);

				var urls = [
					searchImageData.toCanvas().toDataURL(),
					areaImageData.toCanvas().toDataURL()
				];

				if(!disableCache && window.localStorage !== undefined) {

					localStorage.setItem("smaa-search", urls[0]);
					localStorage.setItem("smaa-area", urls[1]);

				}

				URL.revokeObjectURL(workerURL);
				resolve(urls);

			});

			worker.postMessage(null);

		});

	}

	/**
	 * An SMAA image loader.
	 *
	 * This loader uses a worker thread to generate the search and area images. The
	 * Generated data URLs will be cached using localStorage, if available. To
	 * disable caching, please refer to {@link SMAAImageLoader.disableCache}.
	 *
	 * @experimental Added for testing, API might change in patch or minor releases. Requires three >= r108.
	 */

	var SMAAImageLoader = /*@__PURE__*/(function (Loader) {
		function SMAAImageLoader(manager) {

			Loader.call(this, manager);

			/**
			 * Indicates whether data image caching is disabled.
			 *
			 * @type {Boolean}
			 */

			this.disableCache = false;

		}

		if ( Loader ) SMAAImageLoader.__proto__ = Loader;
		SMAAImageLoader.prototype = Object.create( Loader && Loader.prototype );
		SMAAImageLoader.prototype.constructor = SMAAImageLoader;

		/**
		 * Loads the SMAA data images.
		 *
		 * @param {Function} [onLoad] - A function to call when the loading process is done.
		 * @param {Function} [onError] - A function to call when an error occurs.
		 * @return {Promise} A promise that returns the search image and area image as a pair.
		 */

		SMAAImageLoader.prototype.load = function load (onLoad, onError) {
			var this$1 = this;
			if ( onLoad === void 0 ) onLoad = function () {};
			if ( onError === void 0 ) onError = function () {};


			// Conform to the signature (url, onLoad, onProgress, onError).
			if(arguments.length === 4) {

				onLoad = arguments[1];
				onError = arguments[3];

			} else if(arguments.length === 3 || typeof arguments[0] !== "function") {

				onLoad = arguments[1];
				onError = function () {};

			}

			var externalManager = this.manager;
			var internalManager = new three.LoadingManager();

			externalManager.itemStart("smaa-search");
			externalManager.itemStart("smaa-area");
			internalManager.itemStart("smaa-search");
			internalManager.itemStart("smaa-area");

			return new Promise(function (resolve, reject) {

				var cachedURLs = (!this$1.disableCache && window.localStorage !== undefined) ? [
					localStorage.getItem("smaa-search"),
					localStorage.getItem("smaa-area")
				] : [null, null];

				var promise = (cachedURLs[0] !== null && cachedURLs[1] !== null) ?
					Promise.resolve(cachedURLs) : generate(this$1.disableCache);

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

				}).catch(function (error) {

					externalManager.itemError("smaa-search");
					externalManager.itemError("smaa-area");

					onError(error);
					reject(error);

				});

			});

		};

		return SMAAImageLoader;
	}(three.Loader));

	/**
	 * A 2D vector.
	 *
	 * @private
	 */

	var Vector2 = function Vector2(x, y) {
		if ( x === void 0 ) x = 0;
		if ( y === void 0 ) y = 0;


		/**
			 * The X component.
			 *
			 * @type {Number}
			 */

		this.x = x;

		/**
			 * The Y component.
			 *
			 * @type {Number}
			 */

		this.y = y;

	};

	/**
		 * Sets the components of this vector.
		 *
		 * @param {Number} x - The new x value.
		 * @param {Number} y - The new y value.
		 * @return {Vector2} This vector.
		 */

	Vector2.prototype.set = function set (x, y) {

		this.x = x;
		this.y = y;

		return this;

	};

	/**
		 * Checks if the given vector equals this vector.
		 *
		 * @param {Vector2} v - A vector.
		 * @return {Boolean} Whether this vector equals the given one.
		 */

	Vector2.prototype.equals = function equals (v) {

		return (this === v || (this.x === v.x && this.y === v.y));

	};

	/**
	 * A 2D box.
	 *
	 * @private
	 */

	var Box2 = function Box2() {

		this.min = new Vector2();
		this.max = new Vector2();

	};

	/**
	 * A box.
	 *
	 * @type {Box2}
	 * @private
	 */

	var b0 = new Box2();

	/**
	 * A box.
	 *
	 * @type {Box2}
	 * @private
	 */

	var b1 = new Box2();

	/**
	 * The orthogonal texture size.
	 *
	 * @type {Number}
	 * @private
	 */

	var ORTHOGONAL_SIZE = 16;

	/**
	 * The diagonal texture size.
	 *
	 * @type {Number}
	 * @private
	 */

	var DIAGONAL_SIZE = 20;

	/**
	 * The number of samples for calculating areas in the diagonal textures.
	 * Diagonal areas are calculated using brute force sampling.
	 *
	 * @type {Number}
	 * @private
	 */

	var DIAGONAL_SAMPLES = 30;

	/**
	 * The maximum distance for smoothing U-shapes.
	 *
	 * @type {Number}
	 * @private
	 */

	var SMOOTH_MAX_DISTANCE = 32;

	/**
	 * Subsampling offsets for orthogonal areas.
	 *
	 * @type {Float32Array}
	 * @private
	 */

	var orthogonalSubsamplingOffsets = new Float32Array([
		0.0, -0.25, 0.25, -0.125, 0.125, -0.375, 0.375
	]);

	/**
	 * Subsampling offset pairs for diagonal areas.
	 *
	 * @type {Float32Array[]}
	 * @private
	 */

	var diagonalSubsamplingOffsets = [

		new Float32Array([0.0, 0.0]),
		new Float32Array([0.25, -0.25]),
		new Float32Array([-0.25, 0.25]),
		new Float32Array([0.125, -0.125]),
		new Float32Array([-0.125, 0.125])

	];

	/**
	 * Orthogonal pattern positioning coordinates.
	 *
	 * Used for placing each pattern subtexture into a specific spot.
	 *
	 * @type {Uint8Array[]}
	 * @private
	 */

	var orthogonalEdges = [

		new Uint8Array([0, 0]),
		new Uint8Array([3, 0]),
		new Uint8Array([0, 3]),
		new Uint8Array([3, 3]),

		new Uint8Array([1, 0]),
		new Uint8Array([4, 0]),
		new Uint8Array([1, 3]),
		new Uint8Array([4, 3]),

		new Uint8Array([0, 1]),
		new Uint8Array([3, 1]),
		new Uint8Array([0, 4]),
		new Uint8Array([3, 4]),

		new Uint8Array([1, 1]),
		new Uint8Array([4, 1]),
		new Uint8Array([1, 4]),
		new Uint8Array([4, 4])

	];

	/**
	 * Diagonal pattern positioning coordinates.
	 *
	 * Used for placing each pattern subtexture into a specific spot.
	 *
	 * @type {Uint8Array[]}
	 * @private
	 */

	var diagonalEdges = [

		new Uint8Array([0, 0]),
		new Uint8Array([1, 0]),
		new Uint8Array([0, 2]),
		new Uint8Array([1, 2]),

		new Uint8Array([2, 0]),
		new Uint8Array([3, 0]),
		new Uint8Array([2, 2]),
		new Uint8Array([3, 2]),

		new Uint8Array([0, 1]),
		new Uint8Array([1, 1]),
		new Uint8Array([0, 3]),
		new Uint8Array([1, 3]),

		new Uint8Array([2, 1]),
		new Uint8Array([3, 1]),
		new Uint8Array([2, 3]),
		new Uint8Array([3, 3])

	];

	/**
	 * Linearly interpolates between two values.
	 *
	 * @private
	 * @param {Number} a - The initial value.
	 * @param {Number} b - The target value.
	 * @param {Number} p - The interpolation value.
	 * @return {Number} The interpolated value.
	 */

	function lerp(a, b, p) {

		return a + (b - a) * p;

	}

	/**
	 * Clamps a value to the range [0, 1].
	 *
	 * @private
	 * @param {Number} a - The value.
	 * @return {Number} The saturated value.
	 */

	function saturate(a) {

		return Math.min(Math.max(a, 0.0), 1.0);

	}

	/**
	 * A smoothing function for small U-patterns.
	 *
	 * @private
	 * @param {Number} d - A smoothing factor.
	 * @param {Box2} b - The area that should be smoothed.
	 * @return {Box2} The smoothed area.
	 */

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

	/**
	 * Calculates the area under the line p1 -> p2, for the pixels (x, x + 1).
	 *
	 * @private
	 * @param {Vector2} p1 - The starting point of the line.
	 * @param {Vector2} p2 - The ending point of the line.
	 * @param {Number} x - The pixel index.
	 * @param {Vector2} result - A target vector to store the area in.
	 * @return {Vector2} The area.
	 */

	function calculateOrthogonalArea(p1, p2, x, result) {

		var dX = p2.x - p1.x;
		var dY = p2.y - p1.y;

		var x1 = x;
		var x2 = x + 1.0;

		var y1 = p1.y + dY * (x1 - p1.x) / dX;
		var y2 = p1.y + dY * (x2 - p1.x) / dX;

		var a, a1, a2, t;

		// Check if x is inside the area.
		if((x1 >= p1.x && x1 < p2.x) || (x2 > p1.x && x2 <= p2.x)) {

			// Check if this is a trapezoid.
			if(Math.sign(y1) === Math.sign(y2) || Math.abs(y1) < 1e-4 || Math.abs(y2) < 1e-4) {

				a = (y1 + y2) / 2.0;

				if(a < 0.0) {

					result.set(Math.abs(a), 0.0);

				} else {

					result.set(0.0, Math.abs(a));

				}

			} else {

				// Two triangles.
				t = -p1.y * dX / dY + p1.x;

				a1 = (t > p1.x) ? y1 * (t - Math.trunc(t)) / 2.0 : 0.0;
				a2 = (t < p2.x) ? y2 * (1.0 - (t - Math.trunc(t))) / 2.0 : 0.0;

				a = (Math.abs(a1) > Math.abs(a2)) ? a1 : -a2;

				if(a < 0.0) {

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

	/**
	 * Calculates the area for a given pattern and distances to the left and to the
	 * right, biased by an offset.
	 *
	 * @private
	 * @param {Number} pattern - A pattern index.
	 * @param {Number} left - The left distance.
	 * @param {Number} right - The right distance.
	 * @param {Number} offset - An offset.
	 * @param {Vector2} result - A target vector to store the area in.
	 * @return {Vector2} The orthogonal area.
	 */

	function calculateOrthogonalAreaForPattern(pattern, left, right, offset, result) {

		var p1 = b0.min;
		var p2 = b0.max;
		var a1 = b1.min;
		var a2 = b1.max;
		var a = b1;

		/* o1           |
		 *      .-------´
		 * o2   |
		 *
		 *      <---d--->
		 */

		var o1 = 0.5 + offset;
		var o2 = 0.5 + offset - 1.0;
		var d = left + right + 1;

		switch(pattern) {

			case 0: {

				//    ------

				result.set(0, 0);

				break;

			}

			case 1: {

				/*   .------
				 *   |
				 *
				 * The offset is only applied to L patterns in the crossing edge side to
				 * make it converge with the unfiltered pattern 0.
				 * The pattern 0 must not be filtered to avoid artifacts.
				 */

				if(left <= right) {

					calculateOrthogonalArea(p1.set(0.0, o2), p2.set(d / 2.0, 0.0), left, result);

				} else {

					result.set(0, 0);

				}

				break;

			}

			case 2: {

				/*    ------.
				 *          |
				 */

				if(left >= right) {

					calculateOrthogonalArea(p1.set(d / 2.0, 0.0), p2.set(d, o2), left, result);

				} else {

					result.set(0, 0);

				}

				break;

			}

			case 3: {

				/*   .------.
				 *   |      |
				 */

				calculateOrthogonalArea(p1.set(0.0, o2), p2.set(d / 2.0, 0.0), left, a1);
				calculateOrthogonalArea(p1.set(d / 2.0, 0.0), p2.set(d, o2), left, a2);

				smoothArea(d, a);

				result.set(a1.x + a2.x, a1.y + a2.y);

				break;

			}

			case 4: {

				/*   |
				 *   `------
				 */

				if(left <= right) {

					calculateOrthogonalArea(p1.set(0.0, o1), p2.set(d / 2.0, 0.0), left, result);

				} else {

					result.set(0, 0);

				}

				break;

			}

			case 5: {

				/*   |
				 *   +------
				 *   |
				 */

				result.set(0, 0);

				break;

			}

			case 6: {

				/*   |
				 *   `------.
				 *          |
				 *
				 * A problem of not offseting L patterns (see above) is that for certain
				 * max search distances, the pixels in the center of a Z pattern will
				 * detect the full Z pattern, while the pixels in the sides will detect an
				 * L pattern. To avoid discontinuities, the full offsetted Z
				 * revectorization is blended with partially offsetted L patterns.
				 */

				if(Math.abs(offset) > 0.0) {

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

			case 7: {

				/*   |
				 *   +------.
				 *   |      |
				 */

				calculateOrthogonalArea(p1.set(0.0, o1), p2.set(d, o2), left, result);

				break;

			}

			case 8: {

				/*          |
				 *    ------´
				 */

				if(left >= right) {

					calculateOrthogonalArea(p1.set(d / 2.0, 0.0), p2.set(d, o1), left, result);

				} else {

					result.set(0, 0);

				}

				break;

			}

			case 9: {

				/*          |
				 *   .------´
				 *   |
				 */

				if(Math.abs(offset) > 0.0) {

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

			case 10: {

				/*          |
				 *    ------+
				 *          |
				 */

				result.set(0, 0);

				break;

			}

			case 11: {

				/*          |
				 *   .------+
				 *   |      |
				 */

				calculateOrthogonalArea(p1.set(0.0, o2), p2.set(d, o1), left, result);

				break;

			}

			case 12: {

				/*   |      |
				 *   `------´
				 */

				calculateOrthogonalArea(p1.set(0.0, o1), p2.set(d / 2.0, 0.0), left, a1);
				calculateOrthogonalArea(p1.set(d / 2.0, 0.0), p2.set(d, o1), left, a2);

				smoothArea(d, a);

				result.set(a1.x + a2.x, a1.y + a2.y);

				break;

			}

			case 13: {

				/*   |      |
				 *   +------´
				 *   |
				 */

				calculateOrthogonalArea(p1.set(0.0, o2), p2.set(d, o1), left, result);

				break;

			}

			case 14: {

				/*   |      |
				 *   `------+
				 *          |
				 */

				calculateOrthogonalArea(p1.set(0.0, o1), p2.set(d, o2), left, result);

				break;

			}

			case 15: {

				/*   |      |
				 *   +------+
				 *   |      |
				 */

				result.set(0, 0);

				break;

			}

		}

		return result;

	}

	/**
	 * Determines whether the given pixel is inside the specified area.
	 *
	 * @private
	 * @param {Vector2} p1 - The lower bounds of the area.
	 * @param {Vector2} p2 - The upper bounds of the area.
	 * @param {Vector2} x - The X-coordinates.
	 * @param {Vector2} y - The Y-coordinates.
	 * @return {Vector2} Whether the pixel lies inside the area.
	 */

	function isInsideArea(p1, p2, x, y) {

		var result = p1.equals(p2);

		if(!result) {

			var xm = (p1.x + p2.x) / 2.0;
			var ym = (p1.y + p2.y) / 2.0;

			var a = p2.y - p1.y;
			var b = p1.x - p2.x;

			var c = a * (x - xm) + b * (y - ym);

			result = (c > 0.0);

		}

		return result;

	}

	/**
	 * Calculates the area under the line p1 -> p2 for the pixel p using brute force
	 * sampling.
	 *
	 * @private
	 * @param {Vector2} p1 - The lower bounds of the area.
	 * @param {Vector2} p2 - The upper bounds of the area.
	 * @param {Number} pX - The X-coordinates.
	 * @param {Number} pY - The Y-coordinates.
	 * @return {Number} The amount of pixels inside the area relative to the total amount of sampled pixels.
	 */

	function calculateDiagonalAreaForPixel(p1, p2, pX, pY) {

		var a;
		var x, y;
		var offsetX, offsetY;

		for(a = 0, y = 0; y < DIAGONAL_SAMPLES; ++y) {

			for(x = 0; x < DIAGONAL_SAMPLES; ++x) {

				offsetX = x / (DIAGONAL_SAMPLES - 1.0);
				offsetY = y / (DIAGONAL_SAMPLES - 1.0);

				if(isInsideArea(p1, p2, pX + offsetX, pY + offsetY)) {

					++a;

				}

			}

		}

		return a / (DIAGONAL_SAMPLES * DIAGONAL_SAMPLES);

	}

	/**
	 * Calculates the area under the line p1 -> p2. This includes the pixel and its
	 * opposite.
	 *
	 * @private
	 * @param {Number} pattern - A pattern index.
	 * @param {Vector2} p1 - The lower bounds of the area.
	 * @param {Vector2} p2 - The upper bounds of the area.
	 * @param {Number} left - The left distance.
	 * @param {Float32Array} offset - An offset.
	 * @param {Vector2} result - A target vector to store the area in.
	 * @return {Vector2} The area.
	 */

	function calculateDiagonalArea(pattern, p1, p2, left, offset, result) {

		var e = diagonalEdges[pattern];
		var e1 = e[0];
		var e2 = e[1];

		if(e1 > 0) {

			p1.x += offset[0];
			p1.y += offset[1];

		}

		if(e2 > 0) {

			p2.x += offset[0];
			p2.y += offset[1];

		}

		return result.set(
			1.0 - calculateDiagonalAreaForPixel(p1, p2, 1.0 + left, 0.0 + left),
			calculateDiagonalAreaForPixel(p1, p2, 1.0 + left, 1.0 + left)
		);

	}

	/**
	 * Calculates the area for a given pattern and distances to the left and to the
	 * right, biased by an offset.
	 *
	 * @private
	 * @param {Number} pattern - A pattern index.
	 * @param {Number} left - The left distance.
	 * @param {Number} right - The right distance.
	 * @param {Float32Array} offset - An offset.
	 * @param {Vector2} result - A target vector to store the area in.
	 * @return {Vector2} The orthogonal area.
	 */

	function calculateDiagonalAreaForPattern(pattern, left, right, offset, result) {

		var p1 = b0.min;
		var p2 = b0.max;
		var a1 = b1.min;
		var a2 = b1.max;

		var d = left + right + 1;

		/* There is some Black Magic involved in the diagonal area calculations.
		 *
		 * Unlike orthogonal patterns, the "null" pattern (one without crossing edges)
		 * must be filtered, and the ends of both the "null" and L patterns are not
		 * known: L and U patterns have different endings, and the adjacent pattern is
		 * unknown. Therefore, a blend of both possibilities is computed.
		 */

		switch(pattern) {

			case 0: {

				/*         .-´
				 *       .-´
				 *     .-´
				 *   .-´
				 *   ´
				 */

				// First possibility.
				calculateDiagonalArea(pattern, p1.set(1.0, 1.0), p2.set(1.0 + d, 1.0 + d), left, offset, a1);

				// Second possibility.
				calculateDiagonalArea(pattern, p1.set(1.0, 0.0), p2.set(1.0 + d, 0.0 + d), left, offset, a2);

				// Blend both possibilities together.
				result.set((a1.x + a2.x) / 2.0, (a1.y + a2.y) / 2.0);

				break;

			}

			case 1: {

				/*         .-´
				 *       .-´
				 *     .-´
				 *   .-´
				 *   |
				 *   |
				 */

				calculateDiagonalArea(pattern, p1.set(1.0, 0.0), p2.set(0.0 + d, 0.0 + d), left, offset, a1);
				calculateDiagonalArea(pattern, p1.set(1.0, 0.0), p2.set(1.0 + d, 0.0 + d), left, offset, a2);

				result.set((a1.x + a2.x) / 2.0, (a1.y + a2.y) / 2.0);

				break;

			}

			case 2: {

				/*         .----
				 *       .-´
				 *     .-´
				 *   .-´
				 *   ´
				 */

				calculateDiagonalArea(pattern, p1.set(0.0, 0.0), p2.set(1.0 + d, 0.0 + d), left, offset, a1);
				calculateDiagonalArea(pattern, p1.set(1.0, 0.0), p2.set(1.0 + d, 0.0 + d), left, offset, a2);

				result.set((a1.x + a2.x) / 2.0, (a1.y + a2.y) / 2.0);

				break;

			}

			case 3: {

				/*
				 *         .----
				 *       .-´
				 *     .-´
				 *   .-´
				 *   |
				 *   |
				 */

				calculateDiagonalArea(pattern, p1.set(1.0, 0.0), p2.set(1.0 + d, 0.0 + d), left, offset, result);

				break;

			}

			case 4: {

				/*         .-´
				 *       .-´
				 *     .-´
				 * ----´
				 */

				calculateDiagonalArea(pattern, p1.set(1.0, 1.0), p2.set(0.0 + d, 0.0 + d), left, offset, a1);
				calculateDiagonalArea(pattern, p1.set(1.0, 1.0), p2.set(1.0 + d, 0.0 + d), left, offset, a2);

				result.set((a1.x + a2.x) / 2.0, (a1.y + a2.y) / 2.0);

				break;

			}

			case 5: {

				/*         .-´
				 *       .-´
				 *     .-´
				 * --.-´
				 *   |
				 *   |
				 */

				calculateDiagonalArea(pattern, p1.set(1.0, 1.0), p2.set(0.0 + d, 0.0 + d), left, offset, a1);
				calculateDiagonalArea(pattern, p1.set(1.0, 0.0), p2.set(1.0 + d, 0.0 + d), left, offset, a2);

				result.set((a1.x + a2.x) / 2.0, (a1.y + a2.y) / 2.0);

				break;

			}

			case 6: {

				/*         .----
				 *       .-´
				 *     .-´
				 * ----´
				 */

				calculateDiagonalArea(pattern, p1.set(1.0, 1.0), p2.set(1.0 + d, 0.0 + d), left, offset, result);

				break;

			}

			case 7: {

				/*         .----
				 *       .-´
				 *     .-´
				 * --.-´
				 *   |
				 *   |
				 */

				calculateDiagonalArea(pattern, p1.set(1.0, 1.0), p2.set(1.0 + d, 0.0 + d), left, offset, a1);
				calculateDiagonalArea(pattern, p1.set(1.0, 0.0), p2.set(1.0 + d, 0.0 + d), left, offset, a2);

				result.set((a1.x + a2.x) / 2.0, (a1.y + a2.y) / 2.0);

				break;

			}

			case 8: {

				/*         |
				 *         |
				 *       .-´
				 *     .-´
				 *   .-´
				 *   ´
				 */

				calculateDiagonalArea(pattern, p1.set(0.0, 0.0), p2.set(1.0 + d, 1.0 + d), left, offset, a1);
				calculateDiagonalArea(pattern, p1.set(1.0, 0.0), p2.set(1.0 + d, 1.0 + d), left, offset, a2);

				result.set((a1.x + a2.x) / 2.0, (a1.y + a2.y) / 2.0);

				break;

			}

			case 9: {

				/*         |
				 *         |
				 *       .-´
				 *     .-´
				 *   .-´
				 *   |
				 *   |
				 */

				calculateDiagonalArea(pattern, p1.set(1.0, 0.0), p2.set(1.0 + d, 1.0 + d), left, offset, result);

				break;

			}

			case 10: {

				/*         |
				 *         .----
				 *       .-´
				 *     .-´
				 *   .-´
				 *   ´
				 */

				calculateDiagonalArea(pattern, p1.set(0.0, 0.0), p2.set(1.0 + d, 1.0 + d), left, offset, a1);
				calculateDiagonalArea(pattern, p1.set(1.0, 0.0), p2.set(1.0 + d, 0.0 + d), left, offset, a2);

				result.set((a1.x + a2.x) / 2.0, (a1.y + a2.y) / 2.0);

				break;

			}

			case 11: {

				/*         |
				 *         .----
				 *       .-´
				 *     .-´
				 *   .-´
				 *   |
				 *   |
				 */

				calculateDiagonalArea(pattern, p1.set(1.0, 0.0), p2.set(1.0 + d, 1.0 + d), left, offset, a1);
				calculateDiagonalArea(pattern, p1.set(1.0, 0.0), p2.set(1.0 + d, 0.0 + d), left, offset, a2);

				result.set((a1.x + a2.x) / 2.0, (a1.y + a2.y) / 2.0);

				break;

			}

			case 12: {

				/*         |
				 *         |
				 *       .-´
				 *     .-´
				 * ----´
				 */

				calculateDiagonalArea(pattern, p1.set(1.0, 1.0), p2.set(1.0 + d, 1.0 + d), left, offset, result);

				break;

			}

			case 13: {

				/*         |
				 *         |
				 *       .-´
				 *     .-´
				 * --.-´
				 *   |
				 *   |
				 */

				calculateDiagonalArea(pattern, p1.set(1.0, 1.0), p2.set(1.0 + d, 1.0 + d), left, offset, a1);
				calculateDiagonalArea(pattern, p1.set(1.0, 0.0), p2.set(1.0 + d, 1.0 + d), left, offset, a2);

				result.set((a1.x + a2.x) / 2.0, (a1.y + a2.y) / 2.0);

				break;

			}

			case 14: {

				/*         |
				 *         .----
				 *       .-´
				 *     .-´
				 * ----´
				 */

				calculateDiagonalArea(pattern, p1.set(1.0, 1.0), p2.set(1.0 + d, 1.0 + d), left, offset, a1);
				calculateDiagonalArea(pattern, p1.set(1.0, 1.0), p2.set(1.0 + d, 0.0 + d), left, offset, a2);

				result.set((a1.x + a2.x) / 2.0, (a1.y + a2.y) / 2.0);

				break;

			}

			case 15: {

				/*         |
				 *         .----
				 *       .-´
				 *     .-´
				 * --.-´
				 *   |
				 *   |
				 */

				calculateDiagonalArea(pattern, p1.set(1.0, 1.0), p2.set(1.0 + d, 1.0 + d), left, offset, a1);
				calculateDiagonalArea(pattern, p1.set(1.0, 0.0), p2.set(1.0 + d, 0.0 + d), left, offset, a2);

				result.set((a1.x + a2.x) / 2.0, (a1.y + a2.y) / 2.0);

				break;

			}

		}

		return result;

	}

	/**
	 * Calculates orthogonal or diagonal patterns for a given offset.
	 *
	 * @private
	 * @param {RawImageData[]} patterns - The patterns to assemble.
	 * @param {Number|Float32Array} offset - A pattern offset. Diagonal offsets are pairs.
	 * @param {Boolean} orthogonal - Whether the patterns are orthogonal or diagonal.
	 */

	function generatePatterns(patterns, offset, orthogonal) {

		var result = new Vector2();

		var i, l;
		var x, y;
		var c;

		var pattern;
		var data, size;

		for(i = 0, l = patterns.length; i < l; ++i) {

			pattern = patterns[i];

			data = pattern.data;
			size = pattern.width;

			for(y = 0; y < size; ++y) {

				for(x = 0; x < size; ++x) {

					if(orthogonal) {

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

	/**
	 * Assembles orthogonal or diagonal patterns into the final area image.
	 *
	 * @private
	 * @param {Vector2} base - A base position.
	 * @param {RawImageData[]} patterns - The patterns to assemble.
	 * @param {Uint8Array[]} edges - Edge coordinate pairs, used for positioning.
	 * @param {Number} size - The pattern size.
	 * @param {Boolean} orthogonal - Whether the patterns are orthogonal or diagonal.
	 * @param {RawImageData} target - The target image data.
	 */

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

		for(i = 0, l = patterns.length; i < l; ++i) {

			edge = edges[i];
			pattern = patterns[i];

			srcData = pattern.data;
			srcWidth = pattern.width;

			for(y = 0; y < size; ++y) {

				for(x = 0; x < size; ++x) {

					p.set(
						edge[0] * size + base.x + x,
						edge[1] * size + base.y + y
					);

					c = (p.y * dstWidth + p.x) * 4;

					/* The texture coordinates of orthogonal patterns are compressed
					quadratically to reach longer distances for a given texture size. */
					d = orthogonal ? ((y * y * srcWidth + x * x) * 2) :
						((y * srcWidth + x) * 2);

					dstData[c] = srcData[d];
					dstData[c + 1] = srcData[d + 1];
					dstData[c + 2] = 0;
					dstData[c + 3] = 255;

				}

			}

		}

	}

	/**
	 * SMAA area image data.
	 *
	 * This texture allows to obtain the area for a certain pattern and distances
	 * to the left and to the right of the identified line.
	 *
	 * Based on the official python scripts:
	 *  https://github.com/iryoku/smaa/tree/master/Scripts
	 */

	var SMAAAreaImageData = function SMAAAreaImageData () {};

	SMAAAreaImageData.generate = function generate () {

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

		// Prepare 16 image data sets for the orthogonal and diagonal subtextures.
		for(i = 0; i < 16; ++i) {

			orthogonalPatterns.push(new RawImageData(orthogonalPatternSize, orthogonalPatternSize,
				new Uint8ClampedArray(orthogonalPatternSize * orthogonalPatternSize * 2), 2));

			diagonalPatterns.push(new RawImageData(diagonalPatternSize, diagonalPatternSize,
				new Uint8ClampedArray(diagonalPatternSize * diagonalPatternSize * 2), 2));

		}

		for(i = 0, l = orthogonalSubsamplingOffsets.length; i < l; ++i) {

			// Generate 16 orthogonal patterns for each offset.
			generatePatterns(orthogonalPatterns, orthogonalSubsamplingOffsets[i], true);

			// Assemble the orthogonal patterns and place them on the left side.
			base.set(0, 5 * ORTHOGONAL_SIZE * i);
			assemble(base, orthogonalPatterns, orthogonalEdges, ORTHOGONAL_SIZE, true, result);

		}

		for(i = 0, l = diagonalSubsamplingOffsets.length; i < l; ++i) {

			// Generate 16 diagonal patterns for each offset.
			generatePatterns(diagonalPatterns, diagonalSubsamplingOffsets[i], false);

			// Assemble the diagonal patterns and place them on the right side.
			base.set(5 * ORTHOGONAL_SIZE, 4 * DIAGONAL_SIZE * i);
			assemble(base, diagonalPatterns, diagonalEdges, DIAGONAL_SIZE, false, result);

		}

		return result;

	};

	/**
	 * This dictionary returns which edges are active for a certain bilinear fetch:
	 * it's the reverse lookup of the bilinear function.
	 *
	 * @type {Map}
	 * @private
	 */

	var edges = new Map([

		[bilinear([0, 0, 0, 0]), [0, 0, 0, 0]],
		[bilinear([0, 0, 0, 1]), [0, 0, 0, 1]],
		[bilinear([0, 0, 1, 0]), [0, 0, 1, 0]],
		[bilinear([0, 0, 1, 1]), [0, 0, 1, 1]],

		[bilinear([0, 1, 0, 0]), [0, 1, 0, 0]],
		[bilinear([0, 1, 0, 1]), [0, 1, 0, 1]],
		[bilinear([0, 1, 1, 0]), [0, 1, 1, 0]],
		[bilinear([0, 1, 1, 1]), [0, 1, 1, 1]],

		[bilinear([1, 0, 0, 0]), [1, 0, 0, 0]],
		[bilinear([1, 0, 0, 1]), [1, 0, 0, 1]],
		[bilinear([1, 0, 1, 0]), [1, 0, 1, 0]],
		[bilinear([1, 0, 1, 1]), [1, 0, 1, 1]],

		[bilinear([1, 1, 0, 0]), [1, 1, 0, 0]],
		[bilinear([1, 1, 0, 1]), [1, 1, 0, 1]],
		[bilinear([1, 1, 1, 0]), [1, 1, 1, 0]],
		[bilinear([1, 1, 1, 1]), [1, 1, 1, 1]]

	]);

	/**
	 * Linearly interpolates between two values.
	 *
	 * @private
	 * @param {Number} a - The initial value.
	 * @param {Number} b - The target value.
	 * @param {Number} p - The interpolation value.
	 * @return {Number} The interpolated value.
	 */

	function lerp$1(a, b, p) {

		return a + (b - a) * p;

	}

	/**
	 * Calculates the bilinear fetch for a certain edge combination.
	 *
	 *     e[0]       e[1]
	 *
	 *              x <-------- Sample Position: (-0.25, -0.125)
	 *     e[2]       e[3] <--- Current Pixel [3]: (0.0, 0.0)
	 *
	 * @private
	 * @param {Number[]} e - The edge combination.
	 * @return {Number} The interpolated value.
	 */

	function bilinear(e) {

		var a = lerp$1(e[0], e[1], 1.0 - 0.25);
		var b = lerp$1(e[2], e[3], 1.0 - 0.25);

		return lerp$1(a, b, 1.0 - 0.125);

	}

	/**
	 * Computes the delta distance to add in the last step of searches to the left.
	 *
	 * @private
	 * @param {Number[]} left - The left edge combination.
	 * @param {Number[]} top - The top edge combination.
	 * @return {Number} The left delta distance.
	 */

	function deltaLeft(left, top) {

		var d = 0;

		// If there is an edge, continue.
		if(top[3] === 1) {

			d += 1;

		}

		/* If an edge was previously found, there is another edge and there are no
		crossing edges, continue. */
		if(d === 1 && top[2] === 1 && left[1] !== 1 && left[3] !== 1) {

			d += 1;

		}

		return d;

	}

	/**
	 * Computes the delta distance to add in the last step of searches to the right.
	 *
	 * @private
	 * @param {Number[]} left - The left edge combination.
	 * @param {Number[]} top - The top edge combination.
	 * @return {Number} The right delta distance.
	 */

	function deltaRight(left, top) {

		var d = 0;

		// If there is an edge, and no crossing edges, continue.
		if(top[3] === 1 && left[1] !== 1 && left[3] !== 1) {

			d += 1;

		}

		/* If an edge was previously found, there is another edge and there are no
		crossing edges, continue. */
		if(d === 1 && top[2] === 1 && left[0] !== 1 && left[2] !== 1) {

			d += 1;

		}

		return d;

	}

	/**
	 * SMAA search image data.
	 *
	 * This image stores information about how many pixels the line search
	 * algorithm must advance in the last step.
	 *
	 * Based on the official python scripts:
	 *  https://github.com/iryoku/smaa/tree/master/Scripts
	 */

	var SMAASearchImageData = function SMAASearchImageData () {};

	SMAASearchImageData.generate = function generate () {

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

		// Calculate delta distances.
		for(y = 0; y < height; ++y) {

			for(x = 0; x < width; ++x) {

				s = 0.03125 * x;
				t = 0.03125 * y;

				if(edges.has(s) && edges.has(t)) {

					e1 = edges.get(s);
					e2 = edges.get(t);

					i = y * width + x;

					// Maximize the dynamic range to help the compression.
					data[i] = (127 * deltaLeft(e1, e2));
					data[i + halfWidth] = (127 * deltaRight(e1, e2));

				}

			}

		}

		// Crop the result to powers-of-two to make it BC4-friendly.
		for(i = 0, y = height - croppedHeight; y < height; ++y) {

			for(x = 0; x < croppedWidth; ++x, i += 4) {

				croppedData[i] = data[y * width + x];
				croppedData[i + 3] = 255;

			}

		}

		return new RawImageData(croppedWidth, croppedHeight, croppedData);

	};

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
	exports.DepthDownsamplingMaterial = DepthDownsamplingMaterial;
	exports.DepthDownsamplingPass = DepthDownsamplingPass;
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
	exports.NoiseTexture = NoiseTexture;
	exports.NormalPass = NormalPass;
	exports.OutlineEdgesMaterial = OutlineEdgesMaterial;
	exports.OutlineEffect = OutlineEffect;
	exports.OutlineMaterial = OutlineMaterial;
	exports.OverrideMaterialManager = OverrideMaterialManager;
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
	exports.SSAOMaterial = SSAOMaterial;
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
