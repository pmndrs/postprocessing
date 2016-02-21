/**
 * postprocessing v0.1.2 build Feb 21 2016
 * https://github.com/vanruesc/postprocessing
 * Copyright 2016 Raoul van Rüschen, Zlib
 */

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('three')) :
	typeof define === 'function' && define.amd ? define(['exports', 'three'], factory) :
	(factory((global.POSTPROCESSING = global.POSTPROCESSING || {}),global.THREE));
}(this, function (exports,THREE) { 'use strict';

	THREE = 'default' in THREE ? THREE['default'] : THREE;

	var shader = {
		fragment: "uniform sampler2D lastLuminanceMap;\r\nuniform sampler2D currentLuminanceMap;\r\nuniform float delta;\r\nuniform float tau;\r\n\r\nvarying vec2 vUv;\r\n\r\nvoid main() {\r\n\r\n\tvec4 lastLumTexel = texture2D(lastLuminanceMap, vUv, MIP_LEVEL_1X1);\r\n\tvec4 currentLumTexel = texture2D(currentLuminanceMap, vUv, MIP_LEVEL_1X1);\r\n\r\n\tfloat lastLum = lastLumTexel.r;\r\n\tfloat currentLum = currentLumTexel.r;\r\n\r\n\t// Better results with squared input luminance.\r\n\tcurrentLum *= currentLum;\r\n\r\n\t// Adapt the luminance using Pattanaik's technique.\r\n\tfloat adaptedLum = lastLum + (currentLum - lastLum) * (1.0 - exp(-delta * tau));\r\n\t//adaptedLum = sqrt(adaptedLum);\r\n\r\n\tgl_FragColor = vec4(adaptedLum, adaptedLum, adaptedLum, 1.0);\r\n\r\n}\r\n",
		vertex: "varying vec2 vUv;\r\n\r\nvoid main() {\r\n\r\n\tvUv = uv;\r\n\tgl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\r\n\r\n}\r\n",
	};

	/**
	 * An adaptive luminosity shader material.
	 *
	 * @class AdaptiveLuminosityMaterial
	 * @constructor
	 * @extends ShaderMaterial
	 */

	function AdaptiveLuminosityMaterial() {

		THREE.ShaderMaterial.call(this, {

			defines: {

				MIP_LEVEL_1X1: 0.0

			},

			uniforms: {

				lastLum: {type: "t", value: null},
				currentLum: {type: "t", value: null},
				delta: {type: "f", value: 0.016},
				tau: {type: "f", value: 1.0}

			},

			fragmentShader: shader.fragment,
			vertexShader: shader.vertex,

		});

	}

	AdaptiveLuminosityMaterial.prototype = Object.create(THREE.ShaderMaterial.prototype);
	AdaptiveLuminosityMaterial.prototype.constructor = AdaptiveLuminosityMaterial;

	var shader$1 = {
		fragment: "uniform sampler2D tColor;\r\nuniform sampler2D tDepth;\r\nuniform float textureWidth;\r\nuniform float textureHeight;\r\n\r\nuniform float focalDepth;\r\nuniform float focalLength;\r\nuniform float fstop;\r\nuniform bool showFocus;\r\n\r\nuniform float znear;\r\nuniform float zfar;\r\n\r\nuniform bool manualdof;\r\nuniform bool vignetting;\r\nuniform bool shaderFocus;\r\nuniform bool noise;\r\nuniform bool depthblur;\r\nuniform bool pentagon;\r\n\r\nuniform vec2 focusCoords;\r\nuniform float maxblur;\r\nuniform float threshold;\r\nuniform float gain;\r\nuniform float bias;\r\nuniform float fringe;\r\nuniform float dithering;\r\n\r\nvarying vec2 vUv;\r\n\r\nconst float PI = 3.14159265;\r\nconst float TWO_PI = PI * 2.0;\r\nconst int samples = SAMPLES; // Samples on the first ring.\r\nconst int rings = RINGS;\r\nconst int maxringsamples = rings * samples;\r\n\r\nfloat ndofstart = 1.0; \r\nfloat ndofdist = 2.0;\r\nfloat fdofstart = 1.0;\r\nfloat fdofdist = 3.0;\r\n\r\nfloat CoC = 0.03; // Circle of Confusion size in mm (35mm film = 0.03mm).\r\n\r\nfloat vignout = 1.3;\r\nfloat vignin = 0.0;\r\nfloat vignfade = 22.0; \r\n\r\nfloat dbsize = 1.25;\r\nfloat feather = 0.4;\r\n\r\n/**\r\n * Pentagonal shape creation.\r\n */\r\n\r\nfloat penta(vec2 coords) {\r\n\r\n\tfloat scale = float(rings) - 1.3;\r\n\r\n\tvec4  HS0 = vec4( 1.0,          0.0,         0.0,  1.0);\r\n\tvec4  HS1 = vec4( 0.309016994,  0.951056516, 0.0,  1.0);\r\n\tvec4  HS2 = vec4(-0.809016994,  0.587785252, 0.0,  1.0);\r\n\tvec4  HS3 = vec4(-0.809016994, -0.587785252, 0.0,  1.0);\r\n\tvec4  HS4 = vec4( 0.309016994, -0.951056516, 0.0,  1.0);\r\n\tvec4  HS5 = vec4( 0.0        ,  0.0        , 1.0,  1.0);\r\n\r\n\tvec4  one = vec4(1.0);\r\n\r\n\tvec4 P = vec4((coords), vec2(scale, scale));\r\n\r\n\tvec4 dist = vec4(0.0);\r\n\tfloat inorout = -4.0;\r\n\r\n\tdist.x = dot(P, HS0);\r\n\tdist.y = dot(P, HS1);\r\n\tdist.z = dot(P, HS2);\r\n\tdist.w = dot(P, HS3);\r\n\r\n\tdist = smoothstep(-feather, feather, dist);\r\n\r\n\tinorout += dot(dist, one);\r\n\r\n\tdist.x = dot(P, HS4);\r\n\tdist.y = HS5.w - abs(P.z);\r\n\r\n\tdist = smoothstep(-feather, feather, dist);\r\n\tinorout += dist.x;\r\n\r\n\treturn clamp(inorout, 0.0, 1.0);\r\n\r\n}\r\n\r\n/**\r\n * Depth buffer blur.\r\n */\r\n\r\nfloat bdepth(vec2 coords) {\r\n\r\n\tfloat d = 0.0;\r\n\tfloat kernel[9];\r\n\tvec2 offset[9];\r\n\r\n\tvec2 wh = vec2(1.0 / textureWidth,1.0 / textureHeight) * dbsize;\r\n\r\n\toffset[0] = vec2(-wh.x, -wh.y);\r\n\toffset[1] = vec2(0.0, -wh.y);\r\n\toffset[2] = vec2(wh.x -wh.y);\r\n\r\n\toffset[3] = vec2(-wh.x,  0.0);\r\n\toffset[4] = vec2(0.0,   0.0);\r\n\toffset[5] = vec2(wh.x,  0.0);\r\n\r\n\toffset[6] = vec2(-wh.x, wh.y);\r\n\toffset[7] = vec2(0.0, wh.y);\r\n\toffset[8] = vec2(wh.x, wh.y);\r\n\r\n\tkernel[0] = 1.0 / 16.0; kernel[1] = 2.0 / 16.0; kernel[2] = 1.0 / 16.0;\r\n\tkernel[3] = 2.0 / 16.0; kernel[4] = 4.0 / 16.0; kernel[5] = 2.0 / 16.0;\r\n\tkernel[6] = 1.0 / 16.0; kernel[7] = 2.0 / 16.0; kernel[8] = 1.0 / 16.0;\r\n\r\n\tfor(int i = 0; i < 9; ++i) {\r\n\r\n\t\tfloat tmp = texture2D(tDepth, coords + offset[i]).r;\r\n\t\td += tmp * kernel[i];\r\n\r\n\t}\r\n\r\n\treturn d;\r\n\r\n}\r\n\r\n/**\r\n * Processing the sample.\r\n */\r\n\r\nvec3 color(vec2 coords, float blur) {\r\n\r\n\tvec3 col = vec3(0.0);\r\n\tvec2 texel = vec2(1.0 / textureWidth, 1.0 / textureHeight);\r\n\r\n\tcol.r = texture2D(tColor, coords + vec2(0.0, 1.0) * texel * fringe * blur).r;\r\n\tcol.g = texture2D(tColor, coords + vec2(-0.866, -0.5) * texel * fringe * blur).g;\r\n\tcol.b = texture2D(tColor, coords + vec2(0.866, -0.5) * texel * fringe * blur).b;\r\n\r\n\tvec3 lumcoeff = vec3(0.299, 0.587, 0.114);\r\n\tfloat lum = dot(col.rgb, lumcoeff);\r\n\tfloat thresh = max((lum - threshold) * gain, 0.0);\r\n\r\n\treturn col + mix(vec3(0.0), col, thresh * blur);\r\n\r\n}\r\n\r\n/**\r\n * Generating noise/pattern texture for dithering.\r\n */\r\n\r\nvec2 rand(vec2 coord) {\r\n\r\n\tfloat noiseX = ((fract(1.0 - coord.s * (textureWidth / 2.0)) * 0.25) + (fract(coord.t * (textureHeight / 2.0)) * 0.75)) * 2.0 - 1.0;\r\n\tfloat noiseY = ((fract(1.0 - coord.s * (textureWidth / 2.0)) * 0.75) + (fract(coord.t * (textureHeight / 2.0)) * 0.25)) * 2.0 - 1.0;\r\n\r\n\tif(noise) {\r\n\r\n\t\tnoiseX = clamp(fract(sin(dot(coord, vec2(12.9898, 78.233))) * 43758.5453), 0.0, 1.0) * 2.0 - 1.0;\r\n\t\tnoiseY = clamp(fract(sin(dot(coord, vec2(12.9898, 78.233) * 2.0)) * 43758.5453), 0.0, 1.0) * 2.0 - 1.0;\r\n\r\n\t}\r\n\r\n\treturn vec2(noiseX, noiseY);\r\n\r\n}\r\n\r\n/**\r\n * Distance based edge smoothing.\r\n */\r\n\r\nvec3 debugFocus(vec3 col, float blur, float depth) {\r\n\r\n\tfloat edge = 0.002 * depth;\r\n\tfloat m = clamp(smoothstep(0.0, edge, blur), 0.0, 1.0);\r\n\tfloat e = clamp(smoothstep(1.0 - edge, 1.0, blur), 0.0, 1.0);\r\n\r\n\tcol = mix(col, vec3(1.0, 0.5, 0.0), (1.0 - m) * 0.6);\r\n\tcol = mix(col, vec3(0.0, 0.5, 1.0), ((1.0 - e) - (1.0 - m)) * 0.2);\r\n\r\n\treturn col;\r\n\r\n}\r\n\r\nfloat linearize(float depth) {\r\n\r\n\treturn -zfar * znear / (depth * (zfar - znear) - zfar);\r\n\r\n}\r\n\r\nfloat vignette() {\r\n\r\n\tfloat dist = distance(vUv.xy, vec2(0.5, 0.5));\r\n\tdist = smoothstep(vignout + (fstop / vignfade), vignin + (fstop / vignfade), dist);\r\n\r\n\treturn clamp(dist, 0.0, 1.0);\r\n\r\n}\r\n\r\nfloat gather(float i, float j, int ringsamples, inout vec3 col, float w, float h, float blur) {\r\n\r\n\tfloat rings2 = float(rings);\r\n\tfloat step = TWO_PI / float(ringsamples);\r\n\tfloat pw = cos(j * step) * i;\r\n\tfloat ph = sin(j * step) * i;\r\n\tfloat p = 1.0;\r\n\r\n\tif(pentagon) {\r\n\r\n\t\tp = penta(vec2(pw,ph));\r\n\r\n\t}\r\n\r\n\tcol += color(vUv.xy + vec2(pw * w, ph * h), blur) * mix(1.0, i / rings2, bias) * p;\r\n\r\n\treturn 1.0 * mix(1.0, i / rings2, bias) * p;\r\n\r\n}\r\n\r\nvoid main() {\r\n\r\n\t// Scene depth calculation.\r\n\r\n\tfloat depth = linearize(texture2D(tDepth, vUv.xy).x);\r\n\r\n\tif(depthblur) { depth = linearize(bdepth(vUv.xy)); }\r\n\r\n\t// Focal plane calculation.\r\n\r\n\tfloat fDepth = focalDepth;\r\n\r\n\tif(shaderFocus) { fDepth = linearize(texture2D(tDepth, focusCoords).x); }\r\n\r\n\t// Dof blur factor calculation.\r\n\r\n\tfloat blur = 0.0;\r\n\r\n\tfloat a, b, c, d, o;\r\n\r\n\tif(manualdof) {\r\n\r\n\t\ta = depth - fDepth; // Focal plane.\r\n\t\tb = (a - fdofstart) / fdofdist; // Far DoF.\r\n\t\tc = (-a - ndofstart) / ndofdist; // Near Dof.\r\n\t\tblur = (a > 0.0) ? b : c;\r\n\r\n\t} else {\r\n\r\n\t\tf = focalLength; // Focal length in mm.\r\n\t\td = fDepth * 1000.0; // Focal plane in mm.\r\n\t\to = depth * 1000.0; // Depth in mm.\r\n\r\n\t\ta = (o * f) / (o - f);\r\n\t\tb = (d * f) / (d - f);\r\n\t\tc = (d - f) / (d * fstop * CoC);\r\n\r\n\t\tblur = abs(a - b) * c;\r\n\t}\r\n\r\n\tblur = clamp(blur, 0.0, 1.0);\r\n\r\n\t// Calculation of pattern for dithering.\r\n\r\n\tvec2 noise = rand(vUv.xy) * dithering * blur;\r\n\r\n\t// Getting blur x and y step factor.\r\n\r\n\tfloat w = (1.0 / textureWidth) * blur * maxblur + noise.x;\r\n\tfloat h = (1.0 / textureHeight) * blur * maxblur + noise.y;\r\n\r\n\t// Calculation of final color.\r\n\r\n\tvec3 col = vec3(0.0);\r\n\r\n\tif(blur < 0.05) {\r\n\r\n\t\t// Some optimization thingy.\r\n\t\tcol = texture2D(tColor, vUv.xy).rgb;\r\n\r\n\t} else {\r\n\r\n\t\tcol = texture2D(tColor, vUv.xy).rgb;\r\n\t\tfloat s = 1.0;\r\n\t\tint ringsamples;\r\n\r\n\t\tfor(int i = 1; i <= rings; ++i) {\r\n\r\n\t\t\t// Unboxing.\r\n\t\t\tringsamples = i * samples;\r\n\r\n\t\t\tfor(int j = 0; j < maxringsamples; ++j) {\r\n\r\n\t\t\t\tif(j >= ringsamples) { break; }\r\n\r\n\t\t\t\ts += gather(float(i), float(j), ringsamples, col, w, h, blur);\r\n\r\n\t\t\t}\r\n\r\n\t\t}\r\n\r\n\t\tcol /= s; // Divide by sample count.\r\n\r\n\t}\r\n\r\n\tif(showFocus) { col = debugFocus(col, blur, depth); }\r\n\r\n\tif(vignetting) { col *= vignette(); }\r\n\r\n\tgl_FragColor.rgb = col;\r\n\tgl_FragColor.a = 1.0;\r\n\r\n}\r\n",
		vertex: "varying vec2 vUv;\r\n\r\nvoid main() {\r\n\r\n\tvUv = uv;\r\n\tgl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\r\n\r\n}\r\n",
	};

	/**
	 * Depth-of-field shader with bokeh ported from GLSL shader by Martins Upitis.
	 * http://blenderartists.org/forum/showthread.php?237488-GLSL-depth-of-field-with-bokeh-v2-4-(update)
	 *
	 * @class BokehMaterial
	 * @constructor
	 * @extends ShaderMaterial
	 */

	function BokehMaterial() {

		THREE.ShaderMaterial.call(this, {

			defines: {

				RINGS: "3",
				SAMPLES: "4"

			},

			uniforms: {

				textureWidth: {type: "f", value: 1.0},
				textureHeight: {type: "f", value: 1.0},

				focalDepth: {type: "f", value: 1.0}, // Metres.
				focalLength: {type: "f", value: 24.0}, // Milimetres.
				fstop: {type: "f", value: 0.9},

				tColor: {type: "t", value: null},
				tDepth: {type: "t", value: null},

				maxblur: {type: "f", value: 1.0},

				showFocus: {type: "i", value: 0},
				manualdof: {type: "i", value: 0},
				vignetting: {type: "i", value: 0},
				depthblur: {type: "i", value: 0},

				threshold: {type: "f", value: 0.5},
				gain: {type: "f", value: 2.0},
				bias: {type: "f", value: 0.5},
				fringe: {type: "f", value: 0.7},

				/* Make sure that these are the same as your camera's. */
				znear: {type: "f", value: 0.1},
				zfar: {type: "f", value: 2000},

				noise: {type: "i", value: 1}, // Use noise instead of sampling.
				dithering: {type: "f", value: 0.0001},
				pentagon: {type: "i", value: 0},

				shaderFocus: {type: "i", value: 1}, // Disable if you use external focalDepth value

				/* Autofocus point on screen (0.0, 0.0 - leftLowerCorner, 1.0, 1.0 - upperRightCorner). If center of screen use vec2(0.5, 0.5) */
				focusCoords: {type: "v2", value: new THREE.Vector2()},

			},

			fragmentShader: shader$1.fragment,
			vertexShader: shader$1.vertex,

		});

	}

	BokehMaterial.prototype = Object.create(THREE.ShaderMaterial.prototype);
	BokehMaterial.prototype.constructor = BokehMaterial;

	var shader$2 = {
		fragment: "uniform sampler2D texture1;\r\nuniform sampler2D texture2;\r\n\r\nuniform float opacity1;\r\nuniform float opacity2;\r\n\r\nvarying vec2 vUv;\r\n\r\nvoid main() {\r\n\r\n\tvec4 texel1 = texture2D(texture1, vUv);\r\n\tvec4 texel2 = texture2D(texture2, vUv);\r\n\r\n\t#ifdef INVERT_TEX1\r\n\r\n\t\ttexel1.rgb = vec3(1.0) - texel1.rgb;\r\n\r\n\t#endif\r\n\r\n\t#ifdef INVERT_TEX2\r\n\r\n\t\ttexel2.rgb = vec3(1.0) - texel2.rgb;\r\n\r\n\t#endif\r\n\r\n\tgl_FragColor = opacity1 * texel1 + opacity2 * texel2;\r\n\r\n}\r\n",
		vertex: "varying vec2 vUv;\r\n\r\nvoid main() {\r\n\r\n\tvUv = uv;\r\n\tgl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\r\n\r\n}\r\n"
	};

	/**
	 * A material for combining two textures.
	 *
	 * @class CombineMaterial
	 * @constructor
	 * @extends ShaderMaterial
	 * @param {Boolean} [invertTexture1=false] - Invert the first texture's rgb values.
	 * @param {Boolean} [invertTexture2=false] - Invert the second texture's rgb values.
	 */

	function CombineMaterial(invertTexture1, invertTexture2) {

		THREE.ShaderMaterial.call(this, {

			uniforms: {

				texture1: {type: "t", value: null},
				texture2: {type: "t", value: null},

				opacity1: {type: "f", value: 1.0},
				opacity2: {type: "f", value: 1.0}

			},

			fragmentShader: shader$2.fragment,
			vertexShader: shader$2.vertex

		});

		if(invertTexture1) { this.defines.INVERT_TEX1 = "1"; }
		if(invertTexture2) { this.defines.INVERT_TEX2 = "1"; }

	}

	CombineMaterial.prototype = Object.create(THREE.ShaderMaterial.prototype);
	CombineMaterial.prototype.constructor = CombineMaterial;

	var shader$3 = {
		fragment: "uniform sampler2D tDiffuse;\r\n\r\nvarying vec2 vUv0;\r\nvarying vec2 vUv1;\r\nvarying vec2 vUv2;\r\nvarying vec2 vUv3;\r\n\r\nvoid main() {\r\n\r\n\t// Sample top left texel.\r\n\tvec4 sum = texture2D(tDiffuse, vUv0);\r\n\r\n\t// Sample top right texel.\r\n\tsum += texture2D(tDiffuse, vUv1);\r\n\r\n\t// Sample bottom right texel.\r\n\tsum += texture2D(tDiffuse, vUv2);\r\n\r\n\t// Sample bottom left texel.\r\n\tsum += texture2D(tDiffuse, vUv3);\r\n\r\n\t// Compute the average.\r\n\tgl_FragColor = sum * 0.25;\r\n\r\n}\r\n",
		vertex: "uniform vec2 texelSize;\r\nuniform vec2 halfTexelSize;\r\nuniform float kernel;\r\n\r\nvarying vec2 vUv0;\r\nvarying vec2 vUv1;\r\nvarying vec2 vUv2;\r\nvarying vec2 vUv3;\r\n\r\nvoid main() {\r\n\r\n\tvec2 dUv = (texelSize * vec2(kernel)) + halfTexelSize;\r\n\r\n\tvUv0 = vec2(uv.x - dUv.x, uv.y + dUv.y);\r\n\tvUv1 = vec2(uv.x + dUv.x, uv.y + dUv.y);\r\n\tvUv2 = vec2(uv.x + dUv.x, uv.y - dUv.y);\r\n\tvUv3 = vec2(uv.x - dUv.x, uv.y - dUv.y);\r\n\r\n\tgl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\r\n\r\n}\r\n",
	};

	/**
	 * A convolution blur shader material.
	 *
	 * Use this shader five times in a row while adjusting the kernel 
	 * before each render call in order to get the same result as with 
	 * a 35x35 Gauss filter.
	 *
	 * Implementation based on the GDC2003 Presentation by Masaki Kawase, Bunkasha Games:
	 * Frame Buffer Postprocessing Effects in DOUBLE-S.T.E.A.L (Wreckless)
	 *
	 * Further modified according to:
	 *  https://developer.apple.com/library/ios/documentation/3DDrawing/Conceptual/
	 *  OpenGLES_ProgrammingGuide/BestPracticesforShaders/BestPracticesforShaders.html#//
	 *  apple_ref/doc/uid/TP40008793-CH7-SW15
	 *
	 * @class ConvolutionMaterial
	 * @constructor
	 * @extends ShaderMaterial
	 * @param {Vector2} texelSize - The absolute screen texel size.
	 */

	function ConvolutionMaterial(texelSize) {

		THREE.ShaderMaterial.call(this, {

			uniforms: {

				tDiffuse: {type: "t", value: null},
				texelSize: {type: "v2", value: new THREE.Vector2()},
				halfTexelSize: {type: "v2", value: new THREE.Vector2()},
				kernel: {type: "f", value: 0.0}

			},

			fragmentShader: shader$3.fragment,
			vertexShader: shader$3.vertex,

		});

		/**
		 * The Kawase blur kernels for five consecutive convolution passes.
		 * The result matches the 35x35 Gauss filter.
		 *
		 * @property kernels
		 * @type Number
		 * @private
		 */

		this.kernels = new Float32Array([0.0, 1.0, 2.0, 2.0, 3.0]);

		/**
		 * Scales the kernels.
		 *
		 * @property blurriness
		 * @type Number
		 * @default 1.0
		 */

		this.blurriness = 1.0;

		/**
		 * The current kernel.
		 *
		 * @property i
		 * @type Number
		 * @private
		 */

		this.i = 0;

		// Set the texel size if already provided.
		this.setTexelSize(texelSize);

	}

	ConvolutionMaterial.prototype = Object.create(THREE.ShaderMaterial.prototype);
	ConvolutionMaterial.prototype.constructor = ConvolutionMaterial;

	/**
	 * Sets the texel size.
	 *
	 * @method setTexelSize
	 * @param {Vector2} texelSize - The new texel size.
	 */

	ConvolutionMaterial.prototype.setTexelSize = function(texelSize) {

		if(texelSize !== undefined) {

			this.uniforms.texelSize.value.copy(texelSize);
			this.uniforms.halfTexelSize.value.copy(texelSize).multiplyScalar(0.5);

		}

	};

	/**
	 * Adjusts the kernel for the next blur pass.
	 * Call this method before each render iteration.
	 *
	 * @method adjustKernel
	 */

	ConvolutionMaterial.prototype.adjustKernel = function() {

		this.uniforms.kernel.value = this.kernels[this.i] * this.blurriness;
		if(++this.i >= this.kernels.length) { this.i = 0; }

	};

	var shader$4 = {
		fragment: "uniform sampler2D tDiffuse;\r\nuniform float opacity;\r\n\r\nvarying vec2 vUv;\r\n\r\nvoid main() {\r\n\r\n\tvec4 texel = texture2D(tDiffuse, vUv);\r\n\tgl_FragColor = opacity * texel;\r\n\r\n}\r\n",
		vertex: "varying vec2 vUv;\r\n\r\nvoid main() {\r\n\r\n\tvUv = uv;\r\n\tgl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\r\n\r\n}\r\n",
	};

	/**
	 * A simple copy shader material.
	 *
	 * @class CopyMaterial
	 * @constructor
	 * @extends ShaderMaterial
	 */

	function CopyMaterial() {

		THREE.ShaderMaterial.call(this, {

			uniforms: {

				tDiffuse: {type: "t", value: null},
				opacity: {type: "f", value: 1.0}

			},

			fragmentShader: shader$4.fragment,
			vertexShader: shader$4.vertex,

		});

	}

	CopyMaterial.prototype = Object.create(THREE.ShaderMaterial.prototype);
	CopyMaterial.prototype.constructor = CopyMaterial;

	var shader$5 = {
		fragment: "uniform sampler2D tDiffuse;\r\n\r\nuniform float angle;\r\nuniform float scale;\r\n\r\nvarying vec2 vUv;\r\nvarying vec2 vUvPattern;\r\n\r\nfloat pattern() {\r\n\r\n\tfloat s = sin(angle);\r\n\tfloat c = cos(angle);\r\n\r\n\tvec2 point = vec2(c * vUvPattern.x - s * vUvPattern.y, s * vUvPattern.x + c * vUvPattern.y) * scale;\r\n\r\n\treturn (sin(point.x) * sin(point.y)) * 4.0;\r\n\r\n}\r\n\r\nvoid main() {\r\n\r\n\tvec4 color = texture2D(tDiffuse, vUv);\r\n\tfloat average = (color.r + color.g + color.b) / 3.0;\r\n\r\n\tgl_FragColor = vec4(vec3(average * 10.0 - 5.0 + pattern()), color.a);\r\n\r\n}\r\n",
		vertex: "uniform vec4 offsetRepeat;\r\n\r\nvarying vec2 vUv;\r\nvarying vec2 vUvPattern;\r\n\r\nvoid main() {\r\n\r\n\tvUv = uv;\r\n\tvUvPattern = uv * offsetRepeat.zw + offsetRepeat.xy;\r\n\tgl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\r\n\r\n}\r\n",
	};

	/**
	 * A dot screen shader material.
	 *
	 * @class DotScreenMaterial
	 * @constructor
	 * @extends ShaderMaterial
	 */

	function DotScreenMaterial() {

		THREE.ShaderMaterial.call(this, {

			uniforms: {

				tDiffuse: {type: "t", value: null},

				angle: {type: "f", value: 1.57},
				scale: {type: "f", value: 1.0},

				offsetRepeat: {type: "v4", value: new THREE.Vector4(0.5, 0.5, 1.0, 1.0)}

			},

			fragmentShader: shader$5.fragment,
			vertexShader: shader$5.vertex,

		});

	}

	DotScreenMaterial.prototype = Object.create(THREE.ShaderMaterial.prototype);
	DotScreenMaterial.prototype.constructor = DotScreenMaterial;

	var shader$6 = {
		fragment: "uniform sampler2D tDiffuse;\r\nuniform float time;\r\nuniform bool grayscale;\r\nuniform float nIntensity;\r\nuniform float sIntensity;\r\nuniform float sCount;\r\n\r\nvarying vec2 vUv;\r\n\r\nvoid main() {\r\n\r\n\tvec4 cTextureScreen = texture2D(tDiffuse, vUv);\r\n\r\n\t// Noise.\r\n\r\n\tfloat x = vUv.x * vUv.y * time * 1000.0;\r\n\tx = mod(x, 13.0) * mod(x, 123.0);\r\n\tfloat dx = mod(x, 0.01);\r\n\r\n\tvec3 cResult = cTextureScreen.rgb + cTextureScreen.rgb * clamp(0.1 + dx * 100.0, 0.0, 1.0);\r\n\r\n\tvec2 sc = vec2(sin(vUv.y * sCount), cos(vUv.y * sCount));\r\n\r\n\t// Scanlines.\r\n\r\n\tcResult += cTextureScreen.rgb * vec3(sc.x, sc.y, sc.x) * sIntensity;\r\n\r\n\tcResult = cTextureScreen.rgb + clamp(nIntensity, 0.0, 1.0) * (cResult - cTextureScreen.rgb);\r\n\r\n\tif(grayscale) {\r\n\r\n\t\tcResult = vec3(cResult.r * 0.3 + cResult.g * 0.59 + cResult.b * 0.11);\r\n\r\n\t}\r\n\r\n\tgl_FragColor =  vec4(cResult, cTextureScreen.a);\r\n\r\n}\r\n",
		vertex: "varying vec2 vUv;\r\n\r\nvoid main() {\r\n\r\n\tvUv = uv;\r\n\tgl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\r\n\r\n}\r\n",
	};

	/**
	 * Film grain & scanlines shader
	 *
	 * - ported from HLSL to WebGL / GLSL
	 * http://www.truevision3d.com/forums/showcase/staticnoise_colorblackwhite_scanline_shaders-t18698.0.html
	 *
	 * Screen Space Static Postprocessor
	 *
	 * Produces an analogue noise overlay similar to a film grain / TV static
	 *
	 * Original implementation and noise algorithm
	 * Pat "Hawthorne" Shearon
	 *
	 * Optimized scanlines + noise version with intensity scaling
	 * Georg "Leviathan" Steinrohder
	 *
	 * This version is provided under a Creative Commons Attribution 3.0 License
	 * http://creativecommons.org/licenses/by/3.0/
	 *
	 * @class FilmMaterial
	 * @constructor
	 * @extends ShaderMaterial
	 */

	function FilmMaterial() {

		THREE.ShaderMaterial.call(this, {

			uniforms: {

				tDiffuse: {type: "t", value: null},
				time: {type: "f", value: 0.0},
				nIntensity: {type: "f", value: 0.5},
				sIntensity: {type: "f", value: 0.05},
				sCount: {type: "f", value: 4096.0},
				grayscale: {type: "i", value: 1}

			},

			fragmentShader: shader$6.fragment,
			vertexShader: shader$6.vertex,

		});

	}

	FilmMaterial.prototype = Object.create(THREE.ShaderMaterial.prototype);
	FilmMaterial.prototype.constructor = FilmMaterial;

	var shader$7 = {
		fragment: "uniform sampler2D tDiffuse;\r\nuniform sampler2D tPerturb;\r\n\r\nuniform bool active;\r\n\r\nuniform float amount;\r\nuniform float angle;\r\nuniform float seed;\r\nuniform float seedX;\r\nuniform float seedY;\r\nuniform float distortionX;\r\nuniform float distortionY;\r\nuniform float colS;\r\n\r\nvarying vec2 vUv;\r\n\r\nfloat rand(vec2 co) {\r\n\r\n\treturn fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);\r\n\r\n}\r\n\r\nvoid main() {\r\n\r\n\tvec2 coord = vUv;\r\n\r\n\tfloat xs, ys;\r\n\tvec4 normal;\r\n\r\n\tvec2 offset;\r\n\tvec4 cr, cga, cb;\r\n\tvec4 snow, color;\r\n\r\n\tfloat sx, sy;\r\n\r\n\tif(active) {\r\n\r\n\t\txs = floor(gl_FragCoord.x / 0.5);\r\n\t\tys = floor(gl_FragCoord.y / 0.5);\r\n\r\n\t\tnormal = texture2D(tPerturb, coord * seed * seed);\r\n\r\n\t\tif(coord.y < distortionX + colS && coord.y > distortionX - colS * seed) {\r\n\r\n\t\t\tsx = clamp(ceil(seedX), 0.0, 1.0);\r\n\t\t\tcoord.y = sx * (1.0 - (coord.y + distortionY)) + (1.0 - sx) * distortionY;\r\n\r\n\t\t}\r\n\r\n\t\tif(coord.x < distortionY + colS && coord.x > distortionY - colS * seed) {\r\n\r\n\t\t\tsy = clamp(ceil(seedY), 0.0, 1.0);\r\n\t\t\tcoord.x = sy * distortionX + (1.0 - sy) * (1.0 - (coord.x + distortionX));\r\n\r\n\t\t}\r\n\r\n\t\tcoord.x += normal.x * seedX * (seed / 5.0);\r\n\t\tcoord.y += normal.y * seedY * (seed / 5.0);\r\n\r\n\t\toffset = amount * vec2(cos(angle), sin(angle));\r\n\r\n\t\tcr = texture2D(tDiffuse, coord + offset);\r\n\t\tcga = texture2D(tDiffuse, coord);\r\n\t\tcb = texture2D(tDiffuse, coord - offset);\r\n\r\n\t\tcolor = vec4(cr.r, cga.g, cb.b, cga.a);\r\n\t\tsnow = 200.0 * amount * vec4(rand(vec2(xs * seed, ys * seed * 50.0)) * 0.2);\r\n\t\tcolor += snow;\r\n\r\n\t} else {\r\n\r\n\t\tcolor = texture2D(tDiffuse, vUv);\r\n\r\n\t}\r\n\r\n\tgl_FragColor = color;\r\n\r\n}\r\n",
		vertex: "varying vec2 vUv;\r\n\r\nvoid main() {\r\n\r\n\tvUv = uv;\r\n\tgl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\r\n\r\n}\r\n",
	};

	/**
	 * A glitch shader material.
	 * Based on https://github.com/staffantan/unityglitch
	 *
	 * @class GlitchMaterial
	 * @constructor
	 * @extends ShaderMaterial
	 */

	function GlitchMaterial() {

		THREE.ShaderMaterial.call(this, {

			uniforms: {

				tDiffuse: {type: "t", value: null},
				tPerturb: {type: "t", value: null},

				active: {type: "i", value: 1},

				amount: {type: "f", value: 0.8},
				angle: {type: "f", value: 0.02},
				seed: {type: "f", value: 0.02},
				seedX: {type: "f", value: 0.02},
				seedY: {type: "f", value: 0.02},
				distortionX: {type: "f", value: 0.5},
				distortionY: {type: "f", value: 0.6},
				colS: {type: "f", value: 0.05}

			},

			fragmentShader: shader$7.fragment,
			vertexShader: shader$7.vertex,

		});

	}

	GlitchMaterial.prototype = Object.create(THREE.ShaderMaterial.prototype);
	GlitchMaterial.prototype.constructor = GlitchMaterial;

	var shader$8 = {
		fragment: "uniform sampler2D tDiffuse;\r\nuniform vec3 lightPosition;\r\n\r\nuniform float exposure;\r\nuniform float decay;\r\nuniform float density;\r\nuniform float weight;\r\nuniform float clampMax;\r\n\r\nvarying vec2 vUv;\r\n\r\nvoid main() {\r\n\r\n\tvec2 texCoord = vUv;\r\n\r\n\t// Calculate vector from pixel to light source in screen space.\r\n\tvec2 deltaTexCoord = texCoord - lightPosition.st;\r\n\tdeltaTexCoord *= 1.0 / NUM_SAMPLES_FLOAT * density;\r\n\r\n\t// A decreasing illumination factor.\r\n\tfloat illuminationDecay = 1.0;\r\n\r\n\tvec4 sample;\r\n\tvec4 color = vec4(0.0);\r\n\r\n\t// Estimate the probability of occlusion at each pixel by summing samples along a ray to the light source.\r\n\tfor(int i = 0; i < NUM_SAMPLES_INT; ++i) {\r\n\r\n\t\ttexCoord -= deltaTexCoord;\r\n\t\tsample = texture2D(tDiffuse, texCoord);\r\n\r\n\t\t// Apply sample attenuation scale/decay factors.\r\n\t\tsample *= illuminationDecay * weight;\r\n\r\n\t\tcolor += sample;\r\n\r\n\t\t// Update exponential decay factor.\r\n\t\tilluminationDecay *= decay;\r\n\r\n\t}\r\n\r\n\tgl_FragColor = clamp(color * exposure, 0.0, clampMax);\r\n\r\n}\r\n",
		vertex: "varying vec2 vUv;\r\n\r\nvoid main() {\r\n\r\n\tvUv = uv;\r\n\tgl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\r\n\r\n}\r\n"
	};

	/**
	 * A crepuscular rays shader material.
	 *
	 * References:
	 *
	 * Thibaut Despoulain, 2012:
	 *  (WebGL) Volumetric Light Approximation in Three.js
	 *  http://bkcore.com/blog/3d/webgl-three-js-volumetric-light-godrays.html
	 *
	 * Nvidia, GPU Gems 3 - Chapter 13:
	 *  Volumetric Light Scattering as a Post-Process
	 *  http://http.developer.nvidia.com/GPUGems3/gpugems3_ch13.html
	 *
	 * @class GodRaysMaterial
	 * @constructor
	 * @extends ShaderMaterial
	 */

	function GodRaysMaterial() {

		THREE.ShaderMaterial.call(this, {

			defines: {

				NUM_SAMPLES_FLOAT: "60.0",
				NUM_SAMPLES_INT: "60"

			},

			uniforms: {

				tDiffuse: {type: "t", value: null},
				lightPosition: {type: "v3", value: null},

				exposure: {type: "f", value: 0.6},
				decay: {type: "f", value: 0.93},
				density: {type: "f", value: 0.96},
				weight: {type: "f", value: 0.4},
				clampMax: {type: "f", value: 1.0}

			},

			fragmentShader: shader$8.fragment,
			vertexShader: shader$8.vertex

		});

	}

	GodRaysMaterial.prototype = Object.create(THREE.ShaderMaterial.prototype);
	GodRaysMaterial.prototype.constructor = GodRaysMaterial;

	var shader$9 = {
		fragment: "uniform sampler2D tDiffuse;\r\nvarying vec2 vUv;\r\n\r\nvoid main() {\r\n\r\n\tvec4 texel = texture2D(tDiffuse, vUv);\r\n\tvec3 luma = vec3(0.299, 0.587, 0.114);\r\n\tfloat v = dot(texel.rgb, luma);\r\n\r\n\tgl_FragColor = vec4(v, v, v, texel.a);\r\n\r\n}\r\n",
		vertex: "varying vec2 vUv;\r\n\r\nvoid main() {\r\n\r\n\tvUv = uv;\r\n\tgl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\r\n\r\n}\r\n",
	};

	/**
	 * A luminosity shader material.
	 * http://en.wikipedia.org/wiki/Luminosity
	 *
	 * @class LuminosityMaterial
	 * @constructor
	 * @extends ShaderMaterial
	 */

	function LuminosityMaterial() {

		THREE.ShaderMaterial.call(this, {

			uniforms: {

				tDiffuse: {type: "t", value: null}

			},

			fragmentShader: shader$9.fragment,
			vertexShader: shader$9.vertex,

		});

	}

	LuminosityMaterial.prototype = Object.create(THREE.ShaderMaterial.prototype);
	LuminosityMaterial.prototype.constructor = LuminosityMaterial;

	var shader$10 = {
		fragment: "uniform sampler2D tDiffuse;\r\nuniform float middleGrey;\r\nuniform float maxLuminance;\r\n\r\n#ifdef ADAPTED_LUMINANCE\r\n\r\n\tuniform sampler2D luminanceMap;\r\n\r\n#else\r\n\r\n\tuniform float averageLuminance;\r\n\r\n#endif\r\n\r\nvarying vec2 vUv;\r\n\r\nconst vec3 LUM_CONVERT = vec3(0.299, 0.587, 0.114);\r\nconst vec2 CENTER = vec2(0.5, 0.5);\r\n\r\nvec3 toneMap(vec3 c) {\r\n\r\n\t#ifdef ADAPTED_LUMINANCE\r\n\r\n\t\t// Get the calculated average luminance.\r\n\t\tfloat lumAvg = texture2D(luminanceMap, CENTER).r;\r\n\r\n\t#else\r\n\r\n\t\tfloat lumAvg = averageLuminance;\r\n\r\n\t#endif\r\n\r\n\t// Calculate the luminance of the current pixel.\r\n\tfloat lumPixel = dot(c, LUM_CONVERT);\r\n\r\n\t// Apply the modified operator (Eq. 4).\r\n\tfloat lumScaled = (lumPixel * middleGrey) / lumAvg;\r\n\r\n\tfloat lumCompressed = (lumScaled * (1.0 + (lumScaled / (maxLuminance * maxLuminance)))) / (1.0 + lumScaled);\r\n\treturn lumCompressed * c;\r\n\r\n}\r\n\r\nvoid main() {\r\n\r\n\tvec4 texel = texture2D(tDiffuse, vUv);\r\n\tgl_FragColor = vec4(toneMap(texel.rgb), texel.a);\r\n\r\n}\r\n",
		vertex: "varying vec2 vUv;\r\n\r\nvoid main() {\r\n\r\n\tvUv = uv;\r\n\tgl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\r\n\r\n}\r\n",
	};

	/**
	 * Full-screen tone-mapping shader material.
	 * http://www.graphics.cornell.edu/~jaf/publications/sig02_paper.pdf
	 *
	 * @class ToneMappingMaterial
	 * @constructor
	 * @extends ShaderMaterial
	 */

	function ToneMappingMaterial() {

		THREE.ShaderMaterial.call(this, {

			uniforms: {

				tDiffuse: {type: "t", value: null},
				luminanceMap: {type: "t", value: null},
				averageLuminance: {type: "f", value: 1.0},
				maxLuminance: {type: "f", value: 16.0},
				middleGrey: {type: "f", value: 0.6}

			},

			fragmentShader: shader$10.fragment,
			vertexShader: shader$10.vertex,

		});

	}

	ToneMappingMaterial.prototype = Object.create(THREE.ShaderMaterial.prototype);
	ToneMappingMaterial.prototype.constructor = ToneMappingMaterial;

	/**
	 * An abstract pass.
	 *
	 * This class implements a dispose method that frees memory on demand.
	 * The EffectComposer calls this method when it is being destroyed.
	 *
	 * For this mechanism to work properly, please assign your render targets, 
	 * materials or textures directly to your pass!
	 *
	 * You can prevent your disposable objects from being deleted by keeping 
	 * them inside deeper structures such as arrays or objects.
	 *
	 * @class Pass
	 * @constructor
	 * @param {Scene} [scene] - The scene to render.
	 * @param {Camera} [camera] - The camera will be added to the given scene if it has no parent.
	 * @param {Mesh} [quad] - A quad that fills the screen. Used for rendering a pure 2D effect. Set this to null, if you don't need it.
	 */

	function Pass(scene, camera, quad) {

		/**
		 * The scene to render.
		 *
		 * @property scene
		 * @type Scene
		 * @private
		 * @default Scene()
		 */

		this.scene = (scene !== undefined) ? scene : new THREE.Scene();

		/**
		 * The camera to render with.
		 *
		 * @property camera
		 * @type Camera
		 * @private
		 * @default OrthographicCamera(-1, 1, 1, -1, 0, 1)
		 */

		this.camera = (camera !== undefined) ? camera : new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

		/**
		 * The quad mesh to use for rendering.
		 * Assign your shader material to this mesh!
		 *
		 * @property quad
		 * @type Mesh
		 * @private
		 * @default Mesh(PlaneBufferGeometry(2, 2), null)
		 * @example
		 *  this.quad.material = this.myMaterial;
		 */

		this.quad = (quad !== undefined) ? quad : new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 2), null);

		/**
		 * Enabled flag.
		 *
		 * @property enabled
		 * @type Boolean
		 * @default true
		 */

		this.enabled = true;

		/**
		 * Render to screen flag.
		 *
		 * @property renderToScreen
		 * @type Boolean
		 * @default false
		 */

		this.renderToScreen = false;

		/**
		 * Render target swap flag.
		 *
		 * When set to true, the read and write buffers will be swapped 
		 * after this pass is done with rendering so that any following  
		 * pass can find the rendered result in the read buffer.
		 * Swapping is not necessary if, for example, a pass additively 
		 * renders into the read buffer.
		 *
		 * @property needsSwap
		 * @type Boolean
		 * @default false
		 */

		this.needsSwap = false;

		// Finally, add the camera and the quad to the scene.
		if(this.scene !== null) {

			if(this.camera !== null && this.camera.parent === null) { this.scene.add(this.camera); }
			if(this.quad !== null) { this.scene.add(this.quad);	}

		}

	}

	/**
	 * Renders the scene.
	 *
	 * This is an abstract method that must be overriden.
	 *
	 * @method render
	 * @throws {Error} An error is thrown if the method is not overridden.
	 * @param {WebGLRenderer} renderer - The renderer to use.
	 * @param {WebGLRenderTarget} writeBuffer - The write buffer.
	 * @param {WebGLRenderTarget} readBuffer - The read buffer.
	 * @param {Number} [delta] - The render delta time.
	 * @param {Boolean} [maskActive] - Disable stencil test.
	 */

	Pass.prototype.render = function(renderer, writeBuffer, readBuffer, delta, maskActive) {

		throw new Error("Render method not implemented!");

	};

	/**
	 * Updates this pass with the main render target's size.
	 *
	 * This is an abstract method that may be overriden in case 
	 * you want to be informed about the main render size.
	 *
	 * The effect composer calls this method when the pass is added 
	 * and when the effect composer is reset.
	 *
	 * @method setSize
	 * @param {Number} width - The width.
	 * @param {Number} height - The height.
	 * @example
	 *  this.myRenderTarget.width = width / 2;
	 */

	Pass.prototype.setSize = function(width, height) {};

	/**
	 * Performs a shallow search for properties that define a dispose
	 * method and deletes them. The pass will be inoperative after 
	 * this method was called!
	 *
	 * Disposable objects:
	 *  - render targets
	 *  - materials
	 *  - textures
	 *
	 * The EffectComposer calls this method automatically when it is being
	 * destroyed. You may, however, use it independently to free memory 
	 * when you are certain that you don't need this pass anymore.
	 *
	 * @method dispose
	 */

	Pass.prototype.dispose = function() {

		var i, p;
		var keys = Object.keys(this);

		for(i = keys.length - 1; i >= 0; --i) {

			p = this[keys[i]];

			if(p !== null && typeof p.dispose === "function") {

				p.dispose();
				this[keys[i]] = null;

			}

		}

	};

	/**
	 * Generates a texture that represents the luminosity of the current scene, adapted over time
	 * to simulate the optic nerve responding to the amount of light it is receiving.
	 * Based on a GDC2007 presentation by Wolfgang Engel titled "Post-Processing Pipeline"
	 *
	 * Full-screen tone-mapping shader based on http://www.graphics.cornell.edu/~jaf/publications/sig02_paper.pdf
	 *
	 * @class AdaptiveToneMappingPass
	 * @constructor
	 * @extends Pass
	 * @param {Boolean} adaptive - Adaptivity flag.
	 * @param {Number} [opacity] - The resolution.
	 */

	function AdaptiveToneMappingPass(adaptive, resolution) {

		Pass.call(this);

		/**
		 * Render resolution.
		 *
		 * @property adaptive
		 * @type Number
		 * @default 256
		 */

		this.resolution = (resolution !== undefined) ? resolution : 256;

		/**
		 * Adaptivity flag.
		 *
		 * @property adaptive
		 * @type Boolean
		 * @default false
		 */

		this.adaptive = (adaptive !== undefined) ? false : true;

		/**
		 * Initialisation flag.
		 *
		 * @property needsInit
		 * @type Boolean
		 * @default true
		 */

		this.needsInit = true;

		/**
		 * Luminance render target.
		 *
		 * @property luminanceRT
		 * @type WebGLRenderTarget
		 * @private
		 */

		this.luminanceRT = null;

		/**
		 * Previous luminance render target.
		 *
		 * @property previousLuminanceRT
		 * @type WebGLRenderTarget
		 * @private
		 */

		this.previousLuminanceRT = null;

		/**
		 * Current luminance render target.
		 *
		 * @property currentLuminanceRT
		 * @type WebGLRenderTarget
		 * @private
		 */

		this.currentLuminanceRT = null;

		/**
		 * Copy shader material.
		 *
		 * @property materialCopy
		 * @type CopyMaterial
		 * @private
		 */

		this.materialCopy = new CopyMaterial();
		this.materialCopy.blending = THREE.NoBlending;
		this.materialCopy.depthTest = false;

		/**
		 * Luminance shader material.
		 *
		 * @property materialLuminance
		 * @type LuminosityMaterial
		 * @private
		 */

		this.materialLuminance = new LuminosityMaterial();
		this.materialLuminance.blending = THREE.NoBlending;

		/**
		 * Adaptive luminance shader material.
		 *
		 * @property materialAdaptiveLuminosity
		 * @type AdaptiveLuminosityMaterial
		 * @private
		 */

		this.materialAdaptiveLuminosity = new AdaptiveLuminosityMaterial();
		this.materialAdaptiveLuminosity.defines.MIP_LEVEL_1X1 = (Math.log(this.resolution) / Math.log(2.0)).toFixed(1);
		this.materialAdaptiveLuminosity.blending = THREE.NoBlending;

		/**
		 * Tone mapping shader material.
		 *
		 * @property materialToneMapping
		 * @type ToneMappingMaterial
		 * @private
		 */

		this.materialToneMapping = new ToneMappingMaterial();
		this.materialToneMapping.blending = THREE.NoBlending;

		// Swap the render targets in this pass.
		this.needsSwap = true;

	}

	AdaptiveToneMappingPass.prototype = Object.create(Pass.prototype);
	AdaptiveToneMappingPass.prototype.constructor = AdaptiveToneMappingPass;

	/**
	 * Renders the scene.
	 *
	 * @method render
	 * @param {WebGLRenderer} renderer - The renderer to use.
	 * @param {WebGLRenderTarget} writeBuffer - The write buffer.
	 * @param {WebGLRenderTarget} readBuffer - The read buffer.
	 * @param {Number} delta - The render delta time.
	 */

	AdaptiveToneMappingPass.prototype.render = function(renderer, writeBuffer, readBuffer, delta) {

		if(this.needsInit) {

			this.reset(renderer);
			this.luminanceRT.texture.type = readBuffer.texture.type;
			this.previousLuminanceRT.texture.type = readBuffer.texture.type;
			this.currentLuminanceRT.texture.type = readBuffer.texture.type;
			this.needsInit = false;

		}

		if(this.adaptive) {

			// Render the luminance of the current scene into a render target with mipmapping enabled.
			this.quad.material = this.materialLuminance;
			this.materialLuminance.uniforms.tDiffuse.value = readBuffer;
			renderer.render(this.scene, this.camera, this.currentLuminanceRT);

			// Use the new luminance values, the previous luminance and the frame delta to adapt the luminance over time.
			this.quad.material = this.materialAdaptiveLuminosity;
			this.materialAdaptiveLuminosity.uniforms.delta.value = delta;
			this.materialAdaptiveLuminosity.uniforms.lastLum.value = this.previousLuminanceRT;
			this.materialAdaptiveLuminosity.uniforms.currentLum.value = this.currentLuminanceRT;
			renderer.render(this.scene, this.camera, this.luminanceRT);

			// Copy the new adapted luminance value so that it can be used by the next frame.
			this.quad.material = this.materialCopy;
			this.materialCopy.uniforms.tDiffuse.value = this.luminanceRT;
			renderer.render(this.scene, this.camera, this.previousLuminanceRT);

		}

		this.quad.material = this.materialToneMapping;
		this.materialToneMapping.uniforms.tDiffuse.value = readBuffer;
		renderer.render(this.scene, this.camera, writeBuffer, this.clear);

	};

	/**
	 * Resets this pass.
	 *
	 * @method reset
	 * @param {WebGLRender} renderer - The renderer to use.
	 * @private
	 */

	AdaptiveToneMappingPass.prototype.reset = function(renderer) {

		// Create new render targets.
		if(this.luminanceRT !== null) { this.luminanceRT.dispose(); }
		if(this.currentLuminanceRT !== null) { this.currentLuminanceRT.dispose(); }
		if(this.previousLuminanceRT !== null) { this.previousLuminanceRT.dispose(); }

		var pars = {minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat};

		this.luminanceRT = new THREE.WebGLRenderTarget(this.resolution, this.resolution, pars);
		this.luminanceRT.texture.generateMipmaps = false;
		this.previousLuminanceRT = new THREE.WebGLRenderTarget(this.resolution, this.resolution, pars);
		this.previousLuminanceRT.texture.generateMipmaps = false;

		// Only mipmap the current luminosity. A down-sampled version is desired in the adaptive shader.
		pars.minFilter = THREE.LinearMipMapLinearFilter;
		this.currentLuminanceRT = new THREE.WebGLRenderTarget(this.resolution, this.resolution, pars);//change filter then?

		if(this.adaptive) {

			this.materialToneMapping.defines.ADAPTED_LUMINANCE = 1;
			this.materialToneMapping.uniforms.luminanceMap.value = this.luminanceRT;

		}

		//Put something in the adaptive luminance texture so that the scene can render initially.
		this.quad.material = new THREE.MeshBasicMaterial({color: 0x777777});
		this.materialLuminance.needsUpdate = true;
		this.materialAdaptiveLuminosity.needsUpdate = true;
		this.materialToneMapping.needsUpdate = true;
		// renderer.render(this.scene, this.camera, this.luminanceRT);
		// renderer.render(this.scene, this.camera, this.previousLuminanceRT);
		// renderer.render(this.scene, this.camera, this.currentLuminanceRT);

	};

	/**
	 * Sets whether this pass uses adaptive luminosity.
	 *
	 * @method setAdaptive
	 * @param {Boolean} adaptive - Adaptivity flag.
	 */

	AdaptiveToneMappingPass.prototype.setAdaptive = function( adaptive ) {

		if(adaptive) {

			this.adaptive = true;
			this.materialToneMapping.defines.ADAPTED_LUMINANCE = 1;
			this.materialToneMapping.uniforms.luminanceMap.value = this.luminanceRT;

		} else {

			this.adaptive = false;
			delete this.materialToneMapping.defines.ADAPTED_LUMINANCE;
			this.materialToneMapping.uniforms.luminanceMap.value = undefined;

		}

		this.materialToneMapping.needsUpdate = true;

	};

	/**
	 * Sets the adaption rate (tau) for the adaptive luminosity.
	 *
	 * @method setAdaptionRate
	 * @param {Number} tau - The new rate.
	 */

	AdaptiveToneMappingPass.prototype.setAdaptionRate = function(tau) {

		if(tau !== undefined) {

			this.materialAdaptiveLuminosity.uniforms.tau.value = Math.abs(tau);

		}

	};

	/**
	 * Sets the maximum luminosity value for the adaptive luminosity.
	 *
	 * @method setMaxLuminance
	 * @param {Number} maxLum - The new maximum luminosity.
	 */

	AdaptiveToneMappingPass.prototype.setMaxLuminance = function(maxLum) {

		if(maxLum !== undefined) {

			this.materialToneMapping.uniforms.maxLuminance.value = maxLum;

		}

	};

	/**
	 * Sets the average luminance value for tone-mapping.
	 *
	 * @method setAverageLuminance
	 * @param {Number} avgLum - The new average.
	 */

	AdaptiveToneMappingPass.prototype.setAverageLuminance = function(avgLum) {

		if(avgLum !== undefined) {

			this.materialToneMapping.uniforms.averageLuminance.value = avgLum;

		}

	};

	/**
	 * Sets the middle grey value for tone-mapping.
	 *
	 * @method setMiddleGrey
	 * @param {Number} middleGrey - The new middle grey value.
	 */

	AdaptiveToneMappingPass.prototype.setMiddleGrey = function(middleGrey) {

		if(middleGrey !== undefined) {

			this.materialToneMapping.uniforms.middleGrey.value = middleGrey;

		}

	};

	/**
	 * Deletes all render targets and materials.
	 *
	 * @method dispose
	 */

	AdaptiveToneMappingPass.prototype.dispose = function() {

		if(this.luminanceRT) { this.luminanceRT.dispose(); }
		if(this.previousLuminanceRT) { this.previousLuminanceRT.dispose(); }
		if(this.currentLuminanceRT) { this.currentLuminanceRT.dispose(); }
		if(this.materialLuminance) { this.materialLuminance.dispose(); }
		if(this.materialAdaptiveLuminosity) { this.materialAdaptiveLuminosity.dispose(); }
		if(this.materialCopy) { this.materialCopy.dispose(); }
		if(this.materialToneMapping) { this.materialToneMapping.dispose(); }

	};

	/**
	 * A bloom pass.
	 *
	 * This pass renders a scene with superimposed blur 
	 * by utilising the fast Kawase convolution approach.
	 *
	 * @class BloomPass
	 * @constructor
	 * @extends Pass
	 * @param {Object} [options] - The options.
	 * @param {Number} [options.resolutionScale=0.5] - The render texture resolution scale, relative to the screen render size.
	 * @param {Number} [options.blurriness=1.0] - The scale of the blur kernels.
	 * @param {Number} [options.strength=1.0] - The bloom strength.
	 */

	function BloomPass(options) {

		Pass.call(this);

		if(options === undefined) { options = {}; }

		/**
		 * A render target.
		 *
		 * @property renderTargetX
		 * @type WebGLRenderTarget
		 * @private
		 */

		this.renderTargetX = new THREE.WebGLRenderTarget(1, 1, {
			minFilter: THREE.LinearFilter,
			magFilter: THREE.LinearFilter,
			format: THREE.RGBFormat,
			stencilBuffer: false,
			depthBuffer: false
		});

		this.renderTargetX.texture.generateMipmaps = false;

		/**
		 * Another render target.
		 *
		 * @property renderTargetY
		 * @type WebGLRenderTarget
		 * @private
		 */

		this.renderTargetY = this.renderTargetX.clone();

		/**
		 * The resolution scale.
		 *
		 * You need to call the reset method of the EffectComposer after 
		 * changing this value.
		 *
		 * @property renderTargetY
		 * @type WebGLRenderTarget
		 * @private
		 */

		this.resolutionScale = (options.resolutionScale === undefined) ? 0.5 : options.resolutionScale;

		/**
		 * The texel size for the blur.
		 *
		 * @property texelSize
		 * @type Vector2
		 * @private
		 */

		this.texelSize = new THREE.Vector2();

		/**
		 * Combine shader material.
		 *
		 * @property combineMaterial
		 * @type CombineMaterial
		 * @private
		 */

		this.combineMaterial = new CombineMaterial();

		if(options.strength !== undefined) { this.combineMaterial.uniforms.opacity2.value = options.strength; }

		/**
		 * Copy shader material.
		 *
		 * @property copyMaterial
		 * @type CopyMaterial
		 * @private
		 */

		this.copyMaterial = new CopyMaterial();
		this.copyMaterial.blending = THREE.AdditiveBlending;
		this.copyMaterial.transparent = true;

		if(options.strength !== undefined) { this.copyMaterial.uniforms.opacity.value = options.strength; }

		/**
		 * Tone-mapping shader material.
		 *
		 * @property toneMappingMaterial
		 * @type ToneMappingMaterial
		 * @private
		 */

		this.toneMappingMaterial = new ToneMappingMaterial();

		/**
		 * Convolution shader material.
		 *
		 * @property convolutionMaterial
		 * @type ConvolutionMaterial
		 * @private
		 */

		this.convolutionMaterial = new ConvolutionMaterial();

		// Set the blur strength.
		this.blurriness = options.blurriness;

	}

	BloomPass.prototype = Object.create(Pass.prototype);
	BloomPass.prototype.constructor = BloomPass;

	/**
	 * The strength of the preliminary blur phase.
	 *
	 * @property blurriness
	 * @type Number
	 * @default 1.0
	 */

	Object.defineProperty(BloomPass.prototype, "blurriness", {

		get: function() { return this.convolutionMaterial.blurriness; },

		set: function(x) {

			if(typeof x === "number") {

				this.convolutionMaterial.blurriness = x;

			}

		}

	});

	/**
	 * Renders the bloom effect.
	 *
	 * Applies a tone-mapping pass and convolution blur to the readBuffer and 
	 * renders the result into a seperate render target. The result is additively 
	 * blended with the readBuffer.
	 *
	 * @method render
	 * @param {WebGLRenderer} renderer - The renderer to use.
	 * @param {WebGLRenderTarget} writeBuffer - The write buffer.
	 * @param {WebGLRenderTarget} readBuffer - The read buffer.
	 * @param {Number} delta - The render delta time.
	 * @param {Boolean} maskActive - Disable stencil test.
	 */

	BloomPass.prototype.render = function(renderer, writeBuffer, readBuffer, delta, maskActive) {

		if(maskActive) { renderer.context.disable(renderer.context.STENCIL_TEST); }

		// Tone-mapping.
		this.quad.material = this.toneMappingMaterial;
		this.toneMappingMaterial.uniforms.tDiffuse.value = readBuffer;
		renderer.render(this.scene, this.camera, this.renderTargetX);

		// Convolution blur (5 passes).
		this.quad.material = this.convolutionMaterial;

		this.convolutionMaterial.adjustKernel();
		this.convolutionMaterial.uniforms.tDiffuse.value = this.renderTargetX;
		renderer.render(this.scene, this.camera, this.renderTargetY);

		this.convolutionMaterial.adjustKernel();
		this.convolutionMaterial.uniforms.tDiffuse.value = this.renderTargetY;
		renderer.render(this.scene, this.camera, this.renderTargetX);

		this.convolutionMaterial.adjustKernel();
		this.convolutionMaterial.uniforms.tDiffuse.value = this.renderTargetX;
		renderer.render(this.scene, this.camera, this.renderTargetY);

		this.convolutionMaterial.adjustKernel();
		this.convolutionMaterial.uniforms.tDiffuse.value = this.renderTargetY;
		renderer.render(this.scene, this.camera, this.renderTargetX);

		this.convolutionMaterial.adjustKernel();
		this.convolutionMaterial.uniforms.tDiffuse.value = this.renderTargetX;
		renderer.render(this.scene, this.camera, this.renderTargetY);

		if(maskActive) { renderer.context.enable(renderer.context.STENCIL_TEST); }

		// Render original scene with superimposed blur.
		if(this.renderToScreen) {

			this.quad.material = this.combineMaterial;
			this.combineMaterial.uniforms.texture1.value = readBuffer;
			//this.combineMaterial.uniforms.opacity1.value = 0.0;
			this.combineMaterial.uniforms.texture2.value = this.renderTargetY;

			renderer.render(this.scene, this.camera);

		} else {

			this.quad.material = this.copyMaterial;
			this.copyMaterial.uniforms.tDiffuse.value = this.renderTargetY;

			renderer.render(this.scene, this.camera, readBuffer, false);

		}

	};

	/**
	 * Updates this pass with the main render target's size.
	 *
	 * @method setSize
	 * @param {Number} width - The width.
	 * @param {Number} height - The height.
	 */

	BloomPass.prototype.setSize = function(width, height) {

		width = Math.floor(width * this.resolutionScale);
		height = Math.floor(height * this.resolutionScale);

		if(width <= 0) { width = 1; }
		if(height <= 0) { height = 1; }

		this.renderTargetX.setSize(width, height);
		this.renderTargetY.setSize(width, height);

		this.texelSize.set(1.0 / width, 1.0 / height);
		this.convolutionMaterial.setTexelSize(this.texelSize);

	};

	/**
	 * Depth-of-field pass using a bokeh shader.
	 *
	 * @class BokehPass
	 * @constructor
	 * @extends Pass
	 * @param {Scene} scene - The scene to render.
	 * @param {Camera} camera - The camera to use to render the scene.
	 * @param {Object} [options] - Additional parameters.
	 * @param {Number} [options.focus] - The focus.
	 * @param {Number} [options.aspect] - The aspect.
	 * @param {Number} [options.aperture] - The aperture.
	 * @param {Number} [options.maxBlur] - The maximum blur.
	 * @param {Number} [options.resolution] - The render resolution.
	 */

	function BokehPass(scene, camera, options) {

		Pass.call(this);

		if(options === undefined) { options = {}; }
		if(options.resolution === undefined) { options.resolution = 256; }

		/**
		 * A render target.
		 *
		 * @property renderTargetDepth
		 * @type WebGLRenderTarget
		 * @private
		 */

		this.renderTargetDepth = new THREE.WebGLRenderTarget(1, 1, {
			minFilter: THREE.LinearFilter,
			magFilter: THREE.LinearFilter,
			format: THREE.RGBFormat,
			stencilBuffer: false
		});

		this.renderTargetDepth.texture.generateMipmaps = false;

		/**
		 * Depth shader material.
		 *
		 * @property depthMaterial
		 * @type MeshDepthMaterial
		 * @private
		 */

		this.depthMaterial = new THREE.MeshDepthMaterial();

		/**
		 * Bokeh shader material.
		 *
		 * @property bokehMaterial
		 * @type BokehMaterial
		 * @private
		 */

		this.bokehMaterial = new BokehMaterial();
		this.bokehMaterial.uniforms.tDepth.value = this.renderTargetDepth;

		if(options.focus !== undefined) { this.bokehMaterial.uniforms.focus.value = options.focus; }
		if(options.aspect !== undefined) { this.bokehMaterial.uniforms.aspect.value = options.aspect; }
		if(options.aperture !== undefined) { this.bokehMaterial.uniforms.aperture.value = options.aperture; }
		if(options.maxBlur !== undefined) { this.bokehMaterial.uniforms.maxBlur.value = options.maxBlur; }

		/**
		 * Render to screen flag.
		 *
		 * @property renderToScreen
		 * @type Boolean
		 * @default false
		 */

		this.renderToScreen = false;

		/**
		 * A main scene.
		 *
		 * @property mainScene
		 * @type Scene
		 */

		this.mainScene = (scene !== undefined) ? scene : new THREE.Scene();

		/**
		 * A main camera.
		 *
		 * @property mainCamera
		 * @type Camera
		 */

		this.mainCamera = (camera !== undefined) ? camera : new THREE.PerspectiveCamera();

		// Set the material of the rendering quad.
		this.quad.material = this.bokehMaterial;

	}

	BokehPass.prototype = Object.create(Pass.prototype);
	BokehPass.prototype.constructor = BokehPass;

	/**
	 * Renders the scene.
	 *
	 * @method render
	 * @param {WebGLRenderer} renderer - The renderer to use.
	 * @param {WebGLRenderTarget} writeBuffer - The write buffer.
	 * @param {WebGLRenderTarget} readBuffer - The read buffer.
	 * @param {Number} delta - The render delta time.
	 * @param {Boolean} maskActive - Disable stencil test.
	 */

	BokehPass.prototype.render = function(renderer, writeBuffer, readBuffer, delta, maskActive) {

		// Render depth into texture.
		this.mainScene.overrideMaterial = this.depthMaterial;
		renderer.render(this.mainScene, this.mainCamera, this.renderTargetDepth, true);
		this.mainScene.overrideMaterial = null;

		// Render bokeh composite.
		this.bokehMaterial.uniforms.tColor.value = readBuffer;

		if(this.renderToScreen) {

			renderer.render(this.scene, this.camera);

		} else {

			renderer.render(this.scene, this.camera, writeBuffer, this.clear);

		}

	};

	/**
	 * A clear mask pass.
	 *
	 * @class ClearMaskPass
	 * @constructor
	 * @extends Pass
	 */

	function ClearMaskPass() {

		Pass.call(this, null, null, null);

	}

	ClearMaskPass.prototype = Object.create(Pass.prototype);
	ClearMaskPass.prototype.constructor = ClearMaskPass;

	/**
	 * This pass's render method disables the stencil test.
	 *
	 * @method render
	 * @param {WebGLRenderer} renderer - The renderer to use.
	 */

	ClearMaskPass.prototype.render = function(renderer) {

		renderer.context.disable(context.STENCIL_TEST);

	};

	/**
	 * A render pass.
	 *
	 * @class DotScreenPass
	 * @constructor
	 * @extends Pass
	 * @param {Object} [options] - The options.
	 * @param {Number} [patternSize=1.0] - The pattern size.
	 * @param {Number} [angle=1.57] - The angle of the pattern.
	 * @param {Number} [scale=1.0] - The scale of the overall effect.
	 */

	function DotScreenPass(options) {

		Pass.call(this);

		if(options === undefined) { options = {}; }

		/**
		 * Dot screen shader material description.
		 *
		 * @property material
		 * @type DotScreenMaterial
		 * @private
		 */

		this.material = new DotScreenMaterial();

		if(options.angle !== undefined) { this.material.uniforms.angle.value = options.angle; }
		if(options.scale !== undefined) { this.material.uniforms.scale.value = options.scale; }

		// Swap read and write buffer when done.
		this.needsSwap = true;

	}

	DotScreenPass.prototype = Object.create(Pass.prototype);
	DotScreenPass.prototype.constructor = DotScreenPass;

	/**
	 * Renders the scene.
	 *
	 * @method render
	 * @param {WebGLRenderer} renderer - The renderer to use.
	 * @param {WebGLRenderTarget} writeBuffer - The write buffer.
	 * @param {WebGLRenderTarget} readBuffer - The read buffer.
	 */

	DotScreenPass.prototype.render = function(renderer, writeBuffer, readBuffer) {

		this.material.uniforms.tDiffuse.value = readBuffer;
		this.quad.material = this.material;

		if(this.renderToScreen) {

			renderer.render(this.scene, this.camera);

		} else {

			renderer.render(this.scene, this.camera, writeBuffer, false);

		}

	};

	/**
	 * Sets the pattern size relative to the render size.
	 *
	 * @method setSize
	 * @param {Number} width - The width.
	 * @param {Number} heght - The height.
	 */

	DotScreenPass.prototype.setSize = function(width, height) {

		if(width <= 0) { width = 1; }
		if(height <= 0) { height = 1; }

		this.material.uniforms.offsetRepeat.value.z = width;
		this.material.uniforms.offsetRepeat.value.w = height;

	};

	/**
	 * A film pass providing scan lines, greyscale and noise effects.
	 *
	 * @class FilmPass
	 * @constructor
	 * @extends Pass
	 * @param {Object} [options] - The options.
	 * @param {Boolean} [options.grayscale=true] - Convert to greyscale.
	 * @param {Number} [options.noiseIntensity=0.5] - The noise intensity. 0.0 to 1.0.
	 * @param {Number} [options.scanlinesIntensity=0.05] - The scanline intensity. 0.0 to 1.0.
	 * @param {Number} [options.scanlines=1.0] - The number of scanlines in percent, relative to the screen height.
	 */

	function FilmPass(options) {

		Pass.call(this);

		if(options === undefined) { options = {}; }

		/**
		 * Film shader material.
		 *
		 * @property material
		 * @type FilmMaterial
		 * @private
		 */

		this.material = new FilmMaterial();

		if(options !== undefined) {

			if(options.grayscale !== undefined) { this.material.uniforms.grayscale.value = options.grayscale; }
			if(options.noiseIntensity !== undefined) { this.material.uniforms.nIntensity.value = options.noiseIntensity; }
			if(options.scanlinesIntensity !== undefined) { this.material.uniforms.sIntensity.value = options.scanlinesIntensity; }

		}

		/**
		 * The amount of scanlines in percent, relative to the screen height.
		 *
		 * You need to call the reset method of the EffectComposer after 
		 * changing this value.
		 *
		 * @property scanlines
		 * @type Number
		 */

		this.scanlines = (options.scanlines === undefined) ? 1.0 : options.scanlines;

		// Set the material of the rendering quad once.
		this.quad.material = this.material;

		// Swap read and write buffer when done.
		this.needsSwap = true;

	}

	FilmPass.prototype = Object.create(Pass.prototype);
	FilmPass.prototype.constructor = FilmPass;

	/**
	 * Renders the scene.
	 *
	 * @method render
	 * @param {WebGLRenderer} renderer - The renderer to use.
	 * @param {WebGLRenderTarget} writeBuffer - The write buffer.
	 * @param {WebGLRenderTarget} readBuffer - The read buffer.
	 * @param {Number} delta - The render delta time.
	 */

	FilmPass.prototype.render = function(renderer, writeBuffer, readBuffer, delta) {

		this.material.uniforms.tDiffuse.value = readBuffer;
		this.material.uniforms.time.value += delta;

		if(this.renderToScreen) {

			renderer.render(this.scene, this.camera);

		} else {

			renderer.render(this.scene, this.camera, writeBuffer, false);

		}

	};

	/**
	 * Updates this pass with the main render target's size.
	 *
	 * @method setSize
	 * @param {Number} width - The width.
	 * @param {Number} height - The height.
	 */

	FilmPass.prototype.setSize = function(width, height) {

		this.material.uniforms.sCount.value = Math.floor(height * this.scanlines);

	};

	/**
	 * A glitch pass.
	 *
	 * @class GlitchPass
	 * @constructor
	 * @extends Pass
	 * @param {Object} [options] - The options.
	 * @param {Texture} [options.perturbMap] - A perturbation map.
	 * @param {Number} [options.dtSize=64] - The size of the generated noise map.
	 */

	function GlitchPass(options) {

		Pass.call(this);

		if(options === undefined) { options = {}; }
		if(options.dtSize === undefined) { options.dtSize = 64; }

		/**
		 * Glitch shader material.
		 *
		 * @property material
		 * @type GlitchMaterial
		 * @private
		 */

		this.material = new GlitchMaterial();

		/**
		 * A perturbation map.
		 *
		 * If none is provided, a noise texture will be created.
		 * The texture will automatically be destroyed when the 
		 * EffectComposer is deleted.
		 *
		 * @property perturbMap
		 * @type Texture
		 */

		if(options.perturbMap !== undefined) {

			this.perturbMap = options.perturbMap;
			this.perturbMap.generateMipmaps = false;
			this.material.uniforms.tPerturb.value = this.perturbMap;

		} else {

			this.perturbMap = null;
			this.generatePerturbMap(options.dtSize);

		}

		/**
		 * The effect mode.
		 *
		 * Check the Mode enumeration for available modes.
		 *
		 * @property mode
		 * @type GlitchPass.Mode
		 * @default GlitchPass.Mode.SPORADIC
		 */

		this.mode = GlitchPass.Mode.SPORADIC;

		/**
		 * Counter for glitch activation/deactivation.
		 *
		 * @property counter
		 * @type Number
		 * @private
		 */

		this.counter = 0;

		// Set the material of the rendering quad.
		this.quad.material = this.material;

		// Swap read and write buffer when done.
		this.needsSwap = true;

		// Create a new glitch point.
		this.generateTrigger();

	}

	GlitchPass.prototype = Object.create(Pass.prototype);
	GlitchPass.prototype.constructor = GlitchPass;

	/**
	 * Renders the scene.
	 *
	 * @method render
	 * @param {WebGLRenderer} renderer - The renderer to use.
	 * @param {WebGLRenderTarget} writeBuffer - The write buffer.
	 * @param {WebGLRenderTarget} readBuffer - The read buffer.
	 */

	GlitchPass.prototype.render = function(renderer, writeBuffer, readBuffer) {

		let uniforms = this.material.uniforms;

		uniforms.tDiffuse.value = readBuffer;
		uniforms.seed.value = Math.random();
		uniforms.active.value = true;

		if(this.counter % this.breakPoint === 0 || this.mode === GlitchPass.Mode.CONSTANT_WILD) {

			uniforms.amount.value = Math.random() / 30.0;
			uniforms.angle.value = THREE.Math.randFloat(-Math.PI, Math.PI);
			uniforms.seedX.value = THREE.Math.randFloat(-1.0, 1.0);
			uniforms.seedY.value = THREE.Math.randFloat(-1.0, 1.0);
			uniforms.distortionX.value = THREE.Math.randFloat(0.0, 1.0);
			uniforms.distortionY.value = THREE.Math.randFloat(0.0, 1.0);
			this.counter = 0;
			this.generateTrigger();

		} else if(this.counter % this.breakPoint < this.breakPoint / 5 || this.mode === GlitchPass.Mode.CONSTANT_MILD) {

			uniforms.amount.value = Math.random() / 90.0;
			uniforms.angle.value = THREE.Math.randFloat(-Math.PI, Math.PI);
			uniforms.distortionX.value = THREE.Math.randFloat(0.0, 1.0);
			uniforms.distortionY.value = THREE.Math.randFloat(0.0, 1.0);
			uniforms.seedX.value = THREE.Math.randFloat(-0.3, 0.3);
			uniforms.seedY.value = THREE.Math.randFloat(-0.3, 0.3);

		} else if(this.mode === GlitchPass.Mode.SPORADIC) {

			uniforms.active.value = false;

		}

		++this.counter;

		if(this.renderToScreen) {

			renderer.render(this.scene, this.camera);

		} else {

			renderer.render(this.scene, this.camera, writeBuffer, false);

		}

	};

	/**
	 * Creates a random break point for the glitch effect.
	 *
	 * @method generateTrigger
	 */

	GlitchPass.prototype.generateTrigger = function() {

		this.breakPoint = THREE.Math.randInt(120, 240);

	};

	/**
	 * Destroys the currently set texture, if any, and 
	 * generates a simple noise map.
	 *
	 * @method generatePerturbMap
	 * @param {Number} size - The texture size.
	 * @private
	 */

	GlitchPass.prototype.generatePerturbMap = function(size) {

		let i, x;
		let l = size * size;
		let data = new Float32Array(l * 3);

		for(i = 0; i < l; ++i) {

			x = THREE.Math.randFloat(0, 1);

			data[i * 3] = x;
			data[i * 3 + 1] = x;
			data[i * 3 + 2] = x;

		}

		// If there's a texture, delete it.
		if(this.perturbMap !== null) { this.perturbMap.dispose(); }

		this.perturbMap = new THREE.DataTexture(data, size, size, THREE.RGBFormat, THREE.FloatType);
		this.perturbMap.needsUpdate = true;

		this.material.uniforms.tPerturb.value = this.perturbMap;

	};

	/**
	 * A glitch mode enumeration.
	 *
	 * SPORADIC is the default mode (randomly timed glitches).
	 *
	 * @property GlitchPass.Mode
	 * @type Object
	 * @static
	 * @final
	 */

	GlitchPass.Mode = Object.freeze({
		SPORADIC: 0,
		CONSTANT_MILD: 1,
		CONSTANT_WILD: 2
	});

	/**
	 * A crepuscular rays pass.
	 *
	 * @class GodRaysPass
	 * @constructor
	 * @extends Pass
	 * @param {Scene} scene - The main scene.
	 * @param {Camera} camera - The main camera.
	 * @param {Vector3} lightSource - The main light source.
	 * @param {Object} [options] - The options.
	 * @param {Number} [options.density=0.96] - The density of the light rays.
	 * @param {Number} [options.decay=0.93] - An illumination decay factor.
	 * @param {Number} [options.weight=0.4] - A light ray weight factor.
	 * @param {Number} [options.exposure=0.6] - A constant attenuation coefficient.
	 * @param {Number} [options.clampMax=1.0] - An upper bound for the saturation of the overall effect.
	 * @param {Number} [options.intensity=1.0] - A constant factor for additive blending.
	 * @param {Number} [options.blurriness=0.1] - The strength of the preliminary blur phase.
	 * @param {Number} [options.resolutionScale=0.5] - The render texture resolution scale, relative to the screen render size.
	 * @param {Number} [options.samples=60] - The number of samples per pixel.
	 */

	function GodRaysPass(scene, camera, lightSource, options) {

		Pass.call(this);

		if(options === undefined) { options = {}; }

		/**
		 * A render target.
		 *
		 * @property renderTargetX
		 * @type WebGLRenderTarget
		 * @private
		 */

		this.renderTargetX = new THREE.WebGLRenderTarget(1, 1, {
			minFilter: THREE.LinearFilter,
			magFilter: THREE.LinearFilter,
			format: THREE.RGBFormat,
			stencilBuffer: false
		});

		this.renderTargetX.texture.generateMipmaps = false;

		/**
		 * Another render target.
		 *
		 * @property renderTargetY
		 * @type WebGLRenderTarget
		 * @private
		 */

		this.renderTargetY = this.renderTargetX.clone();
		this.renderTargetY.depthBuffer = false;

		/**
		 * The resolution scale.
		 *
		 * You need to call the reset method of the EffectComposer 
		 * after changing this value.
		 *
		 * @property renderTargetY
		 * @type WebGLRenderTarget
		 * @private
		 */

		this.resolutionScale = (options.resolutionScale === undefined) ? 0.5 : options.resolutionScale;

		/**
		 * The light source.
		 *
		 * @property lightSource
		 * @type Object3D
		 */

		this.lightSource = (lightSource !== undefined) ? lightSource : new THREE.Object3D();

		/**
		 * The light position in screen space.
		 *
		 * @property screenPosition
		 * @type Vector3
		 * @private
		 */

		this.screenPosition = new THREE.Vector3();

		/**
		 * The texel size for the blur.
		 *
		 * @property texelSize
		 * @type Vector2
		 * @private
		 */

		this.texelSize = new THREE.Vector2();

		/**
		 * A convolution blur shader material.
		 *
		 * @property convolutionMaterial
		 * @type ConvolutionMaterial
		 * @private
		 */

		this.convolutionMaterial = new ConvolutionMaterial();

		/**
		 * A combine shader material used for rendering to screen.
		 *
		 * @property combineMaterial
		 * @type CombineMaterial
		 * @private
		 */

		this.combineMaterial = new CombineMaterial();

		/**
		 * A copy shader material used for rendering to texture.
		 *
		 * @property copyMaterial
		 * @type CopyMaterial
		 * @private
		 */

		this.copyMaterial = new CopyMaterial();
		this.copyMaterial.blending = THREE.AdditiveBlending;
		this.copyMaterial.transparent = true;

		/**
		 * A material used for masking the scene objects.
		 *
		 * @property maskMaterial
		 * @type MeshBasicMaterial
		 * @private
		 */

		this.maskMaterial = new THREE.MeshBasicMaterial({color: 0x000000});

		/**
		 * God rays shader material.
		 *
		 * @property godRaysMaterial
		 * @type GodRaysMaterial
		 * @private
		 */

		this.godRaysMaterial = new GodRaysMaterial();
		this.godRaysMaterial.uniforms.lightPosition.value = this.screenPosition;

		if(options.exposure !== undefined) { this.godRaysMaterial.uniforms.exposure.value = options.exposure; }
		if(options.density !== undefined) { this.godRaysMaterial.uniforms.density.value = options.density; }
		if(options.decay !== undefined) { this.godRaysMaterial.uniforms.decay.value = options.decay; }
		if(options.weight !== undefined) { this.godRaysMaterial.uniforms.weight.value = options.weight; }
		if(options.clampMax !== undefined) { this.godRaysMaterial.uniforms.clampMax.value = options.clampMax; }

		this.samples = options.samples;
		this.intensity = options.intensity;

		/**
		 * A main scene.
		 *
		 * @property mainScene
		 * @type Scene
		 */

		this.mainScene = (scene !== undefined) ? scene : new THREE.Scene();

		/**
		 * The main camera.
		 *
		 * @property mainCamera
		 * @type Camera
		 */

		this.mainCamera = (camera !== undefined) ? camera : new THREE.PerspectiveCamera();

		// Swap read and write buffer when done.
		this.needsSwap = true;

		// Set the blur strength.
		this.blurriness = (options.blurriness !== undefined) ? options.blurriness : 0.1;

	}

	GodRaysPass.prototype = Object.create(Pass.prototype);
	GodRaysPass.prototype.constructor = GodRaysPass;

	/**
	 * The strength of the preliminary blur phase.
	 *
	 * @property blurriness
	 * @type Number
	 * @default 0.1
	 */

	Object.defineProperty(GodRaysPass.prototype, "blurriness", {

		get: function() { return this.convolutionMaterial.blurriness; },

		set: function(x) {

			if(typeof x === "number") {

				this.convolutionMaterial.blurriness = x;

			}

		}

	});

	/**
	 * The overall intensity of the effect.
	 *
	 * @property intensity
	 * @type Number
	 * @default 1.0
	 */

	Object.defineProperty(GodRaysPass.prototype, "intensity", {

		get: function() { return this.combineMaterial.uniforms.opacity2.value; },

		set: function(x) {

			if(typeof x === "number") {

				this.combineMaterial.uniforms.opacity2.value = x;
				this.copyMaterial.uniforms.opacity.value = x;

			}

		}

	});

	/**
	 * The number of samples per pixel.
	 *
	 * This value must be carefully chosen. A higher value increases the 
	 * GPU load directly and doesn't necessarily yield better results!
	 *
	 * @property samples
	 * @type Number
	 * @default 60
	 */

	Object.defineProperty(GodRaysPass.prototype, "samples", {

		get: function() {

			return Number.parseInt(this.godRaysMaterial.defines.NUM_SAMPLES_INT);

		},

		set: function(x) {

			if(typeof x === "number" && x > 0) {

				x = Math.floor(x);

				this.godRaysMaterial.defines.NUM_SAMPLES_FLOAT = x.toFixed(1);
				this.godRaysMaterial.defines.NUM_SAMPLES_INT = x.toFixed(0);
				this.godRaysMaterial.needsUpdate = true;

			}

		}

	});

	/**
	 * Used for saving the original clear color 
	 * during the rendering process of the masked scene.
	 *
	 * @property CLEAR_COLOR
	 * @type Color
	 * @private
	 * @static
	 */

	const CLEAR_COLOR = new THREE.Color();

	/**
	 * Renders the scene.
	 *
	 * The read buffer is assumed to contain the normally rendered scene.
	 * The god rays pass has four phases with a total of 8 render steps.
	 *
	 * Mask Phase:
	 *  The scene is rendered using a mask material.
	 *
	 * Prelminiary Blur Phase:
	 *  The masked scene is blurred five consecutive times.
	 *
	 * God Rays Phase:
	 *  The blurred scene is blurred again, but this time along radial lines towards the light source.
	 *
	 * Composite Phase:
	 *  The final result is added to the normal scene.
	 *
	 * @method render
	 * @param {WebGLRenderer} renderer - The renderer to use.
	 * @param {WebGLRenderTarget} writeBuffer - The write buffer.
	 * @param {WebGLRenderTarget} readBuffer - The read buffer.
	 */

	GodRaysPass.prototype.render = function(renderer, writeBuffer, readBuffer) {

		let clearAlpha;

		// Compute the screen light position and translate the coordinates to [0, 1].
		this.screenPosition.copy(this.lightSource.position).project(this.mainCamera);
		this.screenPosition.x = THREE.Math.clamp((this.screenPosition.x + 1.0) * 0.5, 0.0, 1.0);
		this.screenPosition.y = THREE.Math.clamp((this.screenPosition.y + 1.0) * 0.5, 0.0, 1.0);

		// Render the masked scene.
		this.mainScene.overrideMaterial = this.maskMaterial;
		CLEAR_COLOR.copy(renderer.getClearColor());
		clearAlpha = renderer.getClearAlpha();
		renderer.setClearColor(0x000000, 1);
		//renderer.render(this.mainScene, this.mainCamera, null, true); // Debug.
		renderer.render(this.mainScene, this.mainCamera, this.renderTargetX, true);
		renderer.setClearColor(CLEAR_COLOR, clearAlpha);
		this.mainScene.overrideMaterial = null;

		// Convolution phase (5 passes).
		this.quad.material = this.convolutionMaterial;

		this.convolutionMaterial.adjustKernel();
		this.convolutionMaterial.uniforms.tDiffuse.value = this.renderTargetX;
		renderer.render(this.scene, this.camera, this.renderTargetY);

		this.convolutionMaterial.adjustKernel();
		this.convolutionMaterial.uniforms.tDiffuse.value = this.renderTargetY;
		renderer.render(this.scene, this.camera, this.renderTargetX);

		this.convolutionMaterial.adjustKernel();
		this.convolutionMaterial.uniforms.tDiffuse.value = this.renderTargetX;
		renderer.render(this.scene, this.camera, this.renderTargetY);

		this.convolutionMaterial.adjustKernel();
		this.convolutionMaterial.uniforms.tDiffuse.value = this.renderTargetY;
		renderer.render(this.scene, this.camera, this.renderTargetX);

		this.convolutionMaterial.adjustKernel();
		this.convolutionMaterial.uniforms.tDiffuse.value = this.renderTargetX;
		renderer.render(this.scene, this.camera, this.renderTargetY);

		// God rays pass.
		this.quad.material = this.godRaysMaterial;
		this.godRaysMaterial.uniforms.tDiffuse.value = this.renderTargetY;
		renderer.render(this.scene, this.camera, this.renderTargetX);

		// Final pass - composite god rays onto colors.
		if(this.renderToScreen) {

			this.quad.material = this.combineMaterial;
			this.combineMaterial.uniforms.texture1.value = readBuffer;
			this.combineMaterial.uniforms.texture2.value = this.renderTargetX;

			renderer.render(this.scene, this.camera);

		} else {

			this.quad.material = this.copyMaterial;
			this.copyMaterial.uniforms.tDiffuse.value = this.renderTargetX;

			renderer.render(this.scene, this.camera, readBuffer);

		}

	};

	/**
	 * Updates this pass with the main render target's size.
	 *
	 * @method setSize
	 * @param {Number} width - The width.
	 * @param {Number} height - The height.
	 */

	GodRaysPass.prototype.setSize = function(width, height) {

		width = Math.floor(width * this.resolutionScale);
		height = Math.floor(height * this.resolutionScale);

		if(width <= 0) { width = 1; }
		if(height <= 0) { height = 1; }

		this.renderTargetX.setSize(width, height);
		this.renderTargetY.setSize(width, height);

		this.texelSize.set(1.0 / width, 1.0 / height);
		this.convolutionMaterial.setTexelSize(this.texelSize);

	};

	/**
	 * A mask pass.
	 *
	 * @class MaskPass
	 * @constructor
	 * @extends Pass
	 * @param {Scene} scene - The scene to render.
	 * @param {Camera} camera - The camera to use to render the scene.
	 */

	function MaskPass(scene, camera) {

		Pass.call(this, scene, camera, null);

		/**
		 * Inverse flag.
		 *
		 * @property inverse
		 * @type Boolean
		 * @default false
		 */

		this.inverse = false;

		/**
		 * Clear flag.
		 *
		 * @property clear
		 * @type Boolean
		 * @default true
		 */

		this.clear = true;

	}

	MaskPass.prototype = Object.create(Pass.prototype);
	MaskPass.prototype.constructor = MaskPass;

	/**
	 * Renders the scene.
	 *
	 * @method render
	 * @param {WebGLRenderer} renderer - The renderer to use.
	 * @param {WebGLRenderTarget} writeBuffer - The write buffer.
	 * @param {WebGLRenderTarget} readBuffer - The read buffer.
	 */

	MaskPass.prototype.render = function(renderer, writeBuffer, readBuffer) {

		let ctx = renderer.context;
		let writeValue, clearValue;

		// Don't update color or depth.
		ctx.colorMask(false, false, false, false);
		ctx.depthMask(false);

		if(this.inverse) {

			writeValue = 0;
			clearValue = 1;

		} else {

			writeValue = 1;
			clearValue = 0;

		}

		ctx.enable(ctx.STENCIL_TEST);
		ctx.stencilOp(ctx.REPLACE, ctx.REPLACE, ctx.REPLACE);
		ctx.stencilFunc(ctx.ALWAYS, writeValue, 0xffffffff);
		ctx.clearStencil(clearValue);

		// Draw into the stencil buffer.
		renderer.render(this.scene, this.camera, readBuffer, this.clear);
		renderer.render(this.scene, this.camera, writeBuffer, this.clear);

		// Re-enable update of color and depth.
		ctx.colorMask(true, true, true, true);
		ctx.depthMask(true);

		// Only render where stencil is set to 1.
		ctx.stencilFunc(ctx.EQUAL, 1, 0xffffffff);
		ctx.stencilOp(ctx.KEEP, ctx.KEEP, ctx.KEEP);

	};

	/**
	 * A pass that renders a given scene directly on screen
	 * or into the readBuffer for further processing.
	 *
	 * @class RenderPass
	 * @constructor
	 * @extends Pass
	 * @param {Scene} scene - The scene to render.
	 * @param {Camera} camera - The camera to use to render the scene.
	 * @param {Material} [overrideMaterial] - An override material for the scene.
	 * @param {Color} [clearColor] - A clear color.
	 * @param {Number} [clearAlpha] - A clear alpha value.
	 */

	function RenderPass(scene, camera, overrideMaterial, clearColor, clearAlpha) {

		Pass.call(this, scene, camera, null);

		/**
		 * Override material.
		 *
		 * @property overrideMaterial
		 * @type Material
		 */

		this.overrideMaterial = (overrideMaterial !== undefined) ? overrideMaterial : null;

		/**
		 * Clear color.
		 *
		 * @property clearColor
		 * @type Color
		 */

		this.clearColor = (clearColor !== undefined) ? clearColor : null;

		/**
		 * Clear alpha.
		 *
		 * @property clearAlpha
		 * @type Number
		 */

		this.clearAlpha = (clearAlpha === undefined) ? 1.0 : THREE.Math.clamp(clearAlpha, 0.0, 1.0);

		/**
		 * Clear flag.
		 *
		 * @property clear
		 * @type Boolean
		 * @default true
		 */

		this.clear = true;

	}

	RenderPass.prototype = Object.create(Pass.prototype);
	RenderPass.prototype.constructor = RenderPass;

	/**
	 * Used for saving the original clear color during rendering.
	 *
	 * @property CLEAR_COLOR
	 * @type Color
	 * @private
	 * @static
	 */

	const CLEAR_COLOR$1 = new THREE.Color();

	/**
	 * Renders the scene.
	 *
	 * @method render
	 * @param {WebGLRenderer} renderer - The renderer to use.
	 * @param {WebGLRenderTarget} writeBuffer - The write buffer.
	 * @param {WebGLRenderTarget} readBuffer - The read buffer.
	 * @param {Number} delta - The render delta time.
	 */

	RenderPass.prototype.render = function(renderer, writeBuffer, readBuffer, delta) {

		let clearAlpha;

		this.scene.overrideMaterial = this.overrideMaterial;

		if(this.clearColor !== null) {

			CLEAR_COLOR$1.copy(renderer.getClearColor());
			clearAlpha = renderer.getClearAlpha();
			renderer.setClearColor(this.clearColor, this.clearAlpha);

		}

		if(this.renderToScreen) {

			renderer.render(this.scene, this.camera);

		} else {

			renderer.render(this.scene, this.camera, readBuffer, this.clear);

		}

		if(this.clearColor !== null) {

			renderer.setClearColor(CLEAR_COLOR$1, clearAlpha);

		}

		this.scene.overrideMaterial = null;

	};

	/**
	 * A save pass that renders the result from a previous 
	 * pass (readBuffer) to an arbitrary render target.
	 *
	 * @class SavePass
	 * @constructor
	 * @extends Pass
	 * @param {Scene} [renderTarget] - The render target to use for saving the read buffer.
	 */

	function SavePass(renderTarget) {

		Pass.call(this);

		/**
		 * Copy shader material.
		 *
		 * @property material
		 * @type CopyMaterial
		 * @private
		 */

		this.material = new CopyMaterial();

		/**
		 * The render target.
		 *
		 * @property renderTarget
		 * @type WebGLRenderTarget
		 * @private
		 */

		if(renderTarget === undefined) {

			renderTarget = new THREE.WebGLRenderTarget(1, 1, {
				minFilter: THREE.LinearFilter,
				magFilter: THREE.LinearFilter,
				format: THREE.RGBFormat,
				stencilBuffer: false
			});

		}

		this.renderTarget = renderTarget;
		this.renderTarget.texture.generateMipmaps = false;

		// Set the material of the rendering quad.
		this.quad.material = this.material;

	}

	SavePass.prototype = Object.create(Pass.prototype);
	SavePass.prototype.constructor = SavePass;

	/**
	 * Renders the scene.
	 *
	 * @method render
	 * @param {WebGLRenderer} renderer - The renderer to use.
	 * @param {WebGLRenderTarget} writeBuffer - The write buffer.
	 * @param {WebGLRenderTarget} readBuffer - The read buffer.
	 */

	SavePass.prototype.render = function(renderer, writeBuffer, readBuffer) {

		this.material.uniforms.tDiffuse.value = readBuffer;
		renderer.render(this.scene, this.camera, this.renderTarget, this.clear);

	};

	/**
	 * Updates this pass with the main render target's size.
	 *
	 * @method setSize
	 * @param {Number} width - The width.
	 * @param {Number} height - The height.
	 */

	SavePass.prototype.setSize = function(width, height) {

		if(width <= 0) { width = 1; }
		if(height <= 0) { height = 1; }

		this.renderTarget.setSize(width, height);

	};

	/**
	 * A shader pass.
	 *
	 * Used to render any shader material as a 2D filter.
	 *
	 * @class ShaderPass
	 * @constructor
	 * @extends Pass
	 * @param {ShaderMaterial} material - The shader material to use.
	 * @param {String} [textureID="tDiffuse"] - The texture uniform identifier.
	 */

	function ShaderPass(material, textureID) {

		Pass.call(this);

		/**
		 * The name of the color sampler uniform of the given material.
		 * The read buffer will be bound to this.
		 *
		 * @property textureID
		 * @type String
		 * @default "tDiffuse"
		 */

		this.textureID = (textureID !== undefined) ? textureID : "tDiffuse";

		/**
		 * The shader material to use for rendering.
		 *
		 * @property material
		 * @type ShaderMaterial
		 */

		this.material = (material !== undefined) ? material : null;

		// Swap read and write buffer when done.
		this.needsSwap = true;

		// Set the material of the rendering quad.
		this.quad.material = this.material;

	}

	ShaderPass.prototype = Object.create(Pass.prototype);
	ShaderPass.prototype.constructor = ShaderPass;

	/**
	 * Renders the scene.
	 *
	 * @method render
	 * @param {WebGLRenderer} renderer - The renderer to use.
	 * @param {WebGLRenderTarget} writeBuffer - The write buffer.
	 * @param {WebGLRenderTarget} readBuffer - The read buffer.
	 */

	ShaderPass.prototype.render = function(renderer, writeBuffer, readBuffer) {

		if(this.material.uniforms[this.textureID] !== undefined) {

			this.material.uniforms[this.textureID].value = readBuffer;

		}

		if(this.renderToScreen) {

			renderer.render(this.scene, this.camera);

		} else {

			renderer.render(this.scene, this.camera, writeBuffer, this.clear);

		}

	};

	/**
	 * A texture pass.
	 *
	 * This pass doesn't destroy the given texture when it's being disposed.
	 *
	 * @class TexturePass
	 * @constructor
	 * @extends Pass
	 * @param {Texture} texture - The texture.
	 * @param {Number} [opacity=1.0] - The opacity to apply to the texture.
	 */

	function TexturePass(texture, opacity) {

		Pass.call(this);

		/**
		 * Combine shader material.
		 *
		 * @property combineMaterial
		 * @type CombineMaterial
		 * @private
		 */

		this.combineMaterial = new CombineMaterial();
		this.combineMaterial.uniforms.texture2.value = texture;

		if(opacity !== undefined) { this.combineMaterial.uniforms.opacity2.value = opacity; }

		/**
		 * Copy shader material.
		 *
		 * @property copyMaterial
		 * @type CopyMaterial
		 * @private
		 */

		this.copyMaterial = new CopyMaterial();
		this.copyMaterial.blending = THREE.AdditiveBlending;
		this.copyMaterial.transparent = true;

		this.copyMaterial.uniforms.tDiffuse.value = texture;
		this.copyMaterial.uniforms.opacity.value = (opacity === undefined) ? 1.0 : opacity;

	}

	TexturePass.prototype = Object.create(Pass.prototype);
	TexturePass.prototype.constructor = TexturePass;

	/**
	 * Renders the scene.
	 *
	 * @method render
	 * @param {WebGLRenderer} renderer - The renderer to use.
	 * @param {WebGLRenderTarget} writeBuffer - The write buffer.
	 * @param {WebGLRenderTarget} readBuffer - The read buffer.
	 */

	TexturePass.prototype.render = function(renderer, writeBuffer, readBuffer) {

		if(this.renderToScreen) {

			this.quad.material = this.combineMaterial;
			this.combineMaterial.uniforms.texture1.value = readBuffer;

			renderer.render(this.scene, this.camera);

		} else {

			this.quad.material = this.copyMaterial;

			renderer.render(this.scene, this.camera, readBuffer, false);

		}

	};

	/**
	 * The EffectComposer may be used in place of a normal WebGLRenderer.
	 *
	 * The composer will disable the auto clear behaviour of the provided 
	 * renderer in order to prevent unnecessary clear operations.
	 *
	 * You may want to use a RenderPass as your first pass to automatically 
	 * clear the screen and render the scene to a texture for further processing. 
	 *
	 * @class EffectComposer
	 * @constructor
	 * @param {WebGLRenderer} [renderer] - The pre-configured renderer that should be used for rendering the passes.
	 * @param {WebGLRenderTarget} [renderTarget] - A pre-configured render target to use for the post processing.
	 */

	function EffectComposer(renderer, renderTarget) {

		let pixelRatio, width, height;

		/**
		 * The renderer.
		 *
		 * @property renderer
		 * @type WebGLRenderer
		 */

		this.renderer = (renderer !== undefined) ? renderer : new THREE.WebGLRenderer();
		this.renderer.autoClear = false;

		/**
		 * The render target.
		 *
		 * @property renderTarget1
		 * @type WebGLRenderTarget
		 * @private
		 */

		if(renderTarget === undefined) {

			pixelRatio = this.renderer.getPixelRatio();
			width = Math.floor(this.renderer.context.canvas.width / pixelRatio) || 1;
			height = Math.floor(this.renderer.context.canvas.height / pixelRatio) || 1;

			renderTarget = new THREE.WebGLRenderTarget(width, height, {
				minFilter: THREE.LinearFilter,
				magFilter: THREE.LinearFilter,
				format: THREE.RGBFormat,
				stencilBuffer: false
			});

		}

		this.renderTarget1 = renderTarget;

		/**
		 * A copy of the render target.
		 *
		 * @property renderTarget2
		 * @type WebGLRenderTarget
		 * @private
		 */

		this.renderTarget2 = renderTarget.clone();

		/**
		 * The write buffer.
		 *
		 * @property writeBuffer
		 * @type WebGLRenderTarget
		 * @private
		 */

		this.writeBuffer = this.renderTarget1;

		/**
		 * The read buffer.
		 *
		 * @property readBuffer
		 * @type WebGLRenderTarget
		 * @private
		 */

		this.readBuffer = this.renderTarget2;

		/**
		 * The render passes.
		 *
		 * @property passes
		 * @type Array
		 * @private
		 */

		this.passes = [];

		/**
		 * A copy pass.
		 *
		 * @property copyPass
		 * @type ShaderPass
		 * @private
		 */

		this.copyPass = new ShaderPass(new CopyMaterial());

	}

	/**
	 * Adds another pass.
	 *
	 * @method addPass
	 * @param {Pass} pass - A new pass.
	 */

	EffectComposer.prototype.addPass = function(pass) {

		pass.setSize(this.renderTarget1.width, this.renderTarget1.height);
		this.passes.push(pass);

	};

	/**
	 * Inserts a new pass at a specific index.
	 *
	 * @method insertPass
	 * @param {Pass} pass - The pass.
	 * @param {Number} index - The index.
	 */

	EffectComposer.prototype.insertPass = function(pass, index) {

		pass.setSize(this.renderTarget1.width, this.renderTarget1.height);
		this.passes.splice(index, 0, pass);

	};

	/**
	 * Swaps the render targets on demand.
	 * You can toggle swapping in your pass by setting the needsSwap flag.
	 *
	 * @method swapBuffers
	 * @private
	 */

	EffectComposer.prototype.swapBuffers = function() {

		var tmp = this.readBuffer;
		this.readBuffer = this.writeBuffer;
		this.writeBuffer = tmp;

	};

	/**
	 * Renders all passes in order.
	 *
	 * @method render
	 * @param {Number} delta - The delta time between the last frame and the current one.
	 */

	EffectComposer.prototype.render = function(delta) {

		this.writeBuffer = this.renderTarget1;
		this.readBuffer = this.renderTarget2;

		let maskActive = false;
		let i, l, pass, context;

		for(i = 0, l = this.passes.length; i < l; ++i) {

			pass = this.passes[i];

			if(pass.enabled) {

				pass.render(this.renderer, this.writeBuffer, this.readBuffer, delta, maskActive);

				if(pass.needsSwap) {

					if(maskActive) {

						context = this.renderer.context;
						context.stencilFunc(context.NOTEQUAL, 1, 0xffffffff);
						this.copyPass.render(this.renderer, this.writeBuffer, this.readBuffer, delta);
						context.stencilFunc(context.EQUAL, 1, 0xffffffff);

					}

					this.swapBuffers();

				}

				if(pass instanceof MaskPass) {

					maskActive = true;

				} else if(pass instanceof ClearMaskPass) {

					maskActive = false;

				}

			}

		}

	};

	/**
	 * Resets the composer's render textures.
	 *
	 * Call this method when the size of the renderer's canvas has changed or
	 * if you want to drop the old read/write buffers and create new ones.
	 *
	 * @method reset
	 * @param {WebGLRenderTarget} [renderTarget] - A new render target to use.
	 */

	EffectComposer.prototype.reset = function(renderTarget) {

		let pixelRatio, width, height;

		if(renderTarget === undefined) {

			renderTarget = this.renderTarget1.clone();

			pixelRatio = this.renderer.getPixelRatio();
			width = Math.floor(this.renderer.context.canvas.width / pixelRatio);
			height = Math.floor(this.renderer.context.canvas.height / pixelRatio);

		} else {

			width = renderTarget.width;
			height = renderTarget.height;

		}

		this.renderTarget1.dispose();
		this.renderTarget1 = renderTarget;
		this.renderTarget2.dispose();
		this.renderTarget2 = renderTarget.clone();

		this.writeBuffer = this.renderTarget1;
		this.readBuffer = this.renderTarget2;

		this.setSize(width, height);

	};

	/**
	 * Sets the render size.
	 *
	 * @method setSize
	 * @param {Number} width - The width.
	 * @param {Number} height - The height.
	 */

	EffectComposer.prototype.setSize = function(width, height) {

		let i, l;

		this.renderTarget1.setSize(width, height);
		this.renderTarget2.setSize(width, height);

		// Let all passes adjust to the new size.
		for(i = 0, l = this.passes.length; i < l; ++i) {

			this.passes[i].setSize(width, height);

		}

	};

	/**
	 * Destroys all passes and render targets.
	 *
	 * This method deallocates any render targets, textures and materials created by the passes.
	 * It also deletes this composer's render targets and copy material.
	 *
	 * @method dispose
	 */

	EffectComposer.prototype.dispose = function(width, height) {

		this.renderTarget1.dispose();
		this.renderTarget2.dispose();
		this.copyPass.dispose();

		this.renderTarget1 = null;
		this.renderTarget2 = null;
		this.copyPass = null;

		while(this.passes.length > 0) {

			this.passes.pop().dispose();

		}

	};

	exports.EffectComposer = EffectComposer;
	exports.AdaptiveToneMappingPass = AdaptiveToneMappingPass;
	exports.BloomPass = BloomPass;
	exports.BokehPass = BokehPass;
	exports.ClearMaskPass = ClearMaskPass;
	exports.DotScreenPass = DotScreenPass;
	exports.FilmPass = FilmPass;
	exports.GlitchPass = GlitchPass;
	exports.GodRaysPass = GodRaysPass;
	exports.MaskPass = MaskPass;
	exports.Pass = Pass;
	exports.RenderPass = RenderPass;
	exports.SavePass = SavePass;
	exports.ShaderPass = ShaderPass;
	exports.TexturePass = TexturePass;
	exports.AdaptiveLuminosityMaterial = AdaptiveLuminosityMaterial;
	exports.BokehMaterial = BokehMaterial;
	exports.CombineMaterial = CombineMaterial;
	exports.ConvolutionMaterial = ConvolutionMaterial;
	exports.CopyMaterial = CopyMaterial;
	exports.DotScreenMaterial = DotScreenMaterial;
	exports.FilmMaterial = FilmMaterial;
	exports.GlitchMaterial = GlitchMaterial;
	exports.GodRaysMaterial = GodRaysMaterial;
	exports.LuminosityMaterial = LuminosityMaterial;
	exports.ToneMappingMaterial = ToneMappingMaterial;

}));