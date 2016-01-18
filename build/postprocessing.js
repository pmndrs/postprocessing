/**
 * postprocessing v0.0.9 build Jan 18 2016
 * https://github.com/vanruesc/postprocessing
 * Copyright 2016 Raoul van Rüschen, Zlib
 */

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('three')) :
	typeof define === 'function' && define.amd ? define(['exports', 'three'], factory) :
	factory((global.POSTPROCESSING = {}),global.THREE);
}(this, function (exports,THREE) { 'use strict';

	THREE = 'default' in THREE ? THREE['default'] : THREE;

	var shader = {
		fragment: "uniform sampler2D tDiffuse;\nuniform float opacity;\n\nvarying vec2 vUv;\n\nvoid main() {\n\n\tvec4 texel = texture2D(tDiffuse, vUv);\n\tgl_FragColor = opacity * texel;\n\n}\n",
		vertex: "varying vec2 vUv;\n\nvoid main() {\n\n\tvUv = uv;\n\tgl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n\n}\n",
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

			fragmentShader: shader.fragment,
			vertexShader: shader.vertex,

		});

	}

	CopyMaterial.prototype = Object.create(THREE.ShaderMaterial.prototype);
	CopyMaterial.prototype.constructor = CopyMaterial;

	var shader$1 = {
		fragment: "uniform sampler2D texture1;\nuniform sampler2D texture2;\n\nuniform float opacity1;\nuniform float opacity2;\n\nvarying vec2 vUv;\n\nvoid main() {\n\n\tvec4 texel1 = texture2D(texture1, vUv);\n\tvec4 texel2 = texture2D(texture2, vUv);\n\n\t#ifdef INVERT_TEX1\n\n\t\ttexel1.rgb = vec3(1.0) - texel1.rgb;\n\n\t#endif\n\n\t#ifdef INVERT_TEX2\n\n\t\ttexel2.rgb = vec3(1.0) - texel2.rgb;\n\n\t#endif\n\n\tgl_FragColor = opacity1 * texel1 + opacity2 * texel2;\n\n}\n",
		vertex: "varying vec2 vUv;\n\nvoid main() {\n\n\tvUv = uv;\n\tgl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n\n}\n"
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

			fragmentShader: shader$1.fragment,
			vertexShader: shader$1.vertex

		});

		if(invertTexture1) { this.defines.INVERT_TEX1 = "1"; }
		if(invertTexture2) { this.defines.INVERT_TEX2 = "1"; }

	}

	CombineMaterial.prototype = Object.create(THREE.ShaderMaterial.prototype);
	CombineMaterial.prototype.constructor = CombineMaterial;

	var shader$2 = {
		fragment: "uniform sampler2D tDiffuse;\nvarying vec2 vUv;\n\nvoid main() {\n\n\tvec4 texel = texture2D(tDiffuse, vUv);\n\tvec3 luma = vec3(0.299, 0.587, 0.114);\n\tfloat v = dot(texel.rgb, luma);\n\n\tgl_FragColor = vec4(v, v, v, texel.a);\n\n}\n",
		vertex: "varying vec2 vUv;\n\nvoid main() {\n\n\tvUv = uv;\n\tgl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n\n}\n",
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

			fragmentShader: shader$2.fragment,
			vertexShader: shader$2.vertex,

		});

	}

	LuminosityMaterial.prototype = Object.create(THREE.ShaderMaterial.prototype);
	LuminosityMaterial.prototype.constructor = LuminosityMaterial;

	var shader$5 = {
		fragment: "uniform sampler2D lastLum;\nuniform sampler2D currentLum;\nuniform float delta;\nuniform float tau;\n\nvarying vec2 vUv;\n\nvoid main() {\n\n\tvec4 lastLum = texture2D(lastLum, vUv, MIP_LEVEL_1X1);\n\tvec4 currentLum = texture2D(currentLum, vUv, MIP_LEVEL_1X1);\n\n\tfloat fLastLum = lastLum.r;\n\tfloat fCurrentLum = currentLum.r;\n\n\t// Better results with squared input luminance.\n\tfCurrentLum *= fCurrentLum;\n\n\t// Adapt the luminance using Pattanaik's technique.\n\tfloat fAdaptedLum = fLastLum + (fCurrentLum - fLastLum) * (1.0 - exp(-delta * tau));\n\t// fAdaptedLum = sqrt(fAdaptedLum);\n\n\tgl_FragColor = vec4(fAdaptedLum, fAdaptedLum, fAdaptedLum, 1.0);\n\n}\n",
		vertex: "varying vec2 vUv;\n\nvoid main() {\n\n\tvUv = uv;\n\tgl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n\n}\n",
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

			fragmentShader: shader$5.fragment,
			vertexShader: shader$5.vertex,

		});

	}

	AdaptiveLuminosityMaterial.prototype = Object.create(THREE.ShaderMaterial.prototype);
	AdaptiveLuminosityMaterial.prototype.constructor = AdaptiveLuminosityMaterial;

	var shader$4 = {
		fragment: "uniform sampler2D tDiffuse;\nuniform float middleGrey;\nuniform float maxLuminance;\n\n#ifdef ADAPTED_LUMINANCE\n\n\tuniform sampler2D luminanceMap;\n\n#else\n\n\tuniform float averageLuminance;\n\n#endif\n\nvarying vec2 vUv;\n\nconst vec3 LUM_CONVERT = vec3(0.299, 0.587, 0.114);\n\nvec3 toneMap(vec3 vColor) {\n\n\t#ifdef ADAPTED_LUMINANCE\n\n\t\t// Get the calculated average luminance.\n\t\tfloat fLumAvg = texture2D(luminanceMap, vec2(0.5, 0.5)).r;\n\n\t#else\n\n\t\tfloat fLumAvg = averageLuminance;\n\n\t#endif\n\n\t// Calculate the luminance of the current pixel.\n\tfloat fLumPixel = dot(vColor, LUM_CONVERT);\n\n\t// Apply the modified operator (Eq. 4).\n\tfloat fLumScaled = (fLumPixel * middleGrey) / fLumAvg;\n\n\tfloat fLumCompressed = (fLumScaled * (1.0 + (fLumScaled / (maxLuminance * maxLuminance)))) / (1.0 + fLumScaled);\n\treturn fLumCompressed * vColor;\n\n}\n\nvoid main() {\n\n\tvec4 texel = texture2D(tDiffuse, vUv);\n\tgl_FragColor = vec4(toneMap(texel.rgb), texel.a);\n\n}\n",
		vertex: "varying vec2 vUv;\n\nvoid main() {\n\n\tvUv = uv;\n\tgl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n\n}\n",
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

			fragmentShader: shader$4.fragment,
			vertexShader: shader$4.vertex,

		});

	}

	ToneMappingMaterial.prototype = Object.create(THREE.ShaderMaterial.prototype);
	ToneMappingMaterial.prototype.constructor = ToneMappingMaterial;

	var shader$3 = {
		fragment: "uniform sampler2D tDiffuse;\nuniform vec2 center;\nuniform vec2 tSize;\nuniform float angle;\nuniform float scale;\n\nvarying vec2 vUv;\n\nfloat pattern() {\n\n\tfloat s = sin(angle);\n\tfloat c = cos(angle);\n\n\tvec2 tex = vUv * tSize - center;\n\tvec2 point = vec2(c * tex.x - s * tex.y, s * tex.x + c * tex.y) * scale;\n\n\treturn (sin(point.x) * sin(point.y)) * 4.0;\n\n}\n\nvoid main() {\n\n\tvec4 color = texture2D(tDiffuse, vUv);\n\tfloat average = (color.r + color.g + color.b) / 3.0;\n\n\tgl_FragColor = vec4(vec3(average * 10.0 - 5.0 + pattern()), color.a);\n\n}\n",
		vertex: "varying vec2 vUv;\n\nvoid main() {\n\n\tvUv = uv;\n\tgl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n\n}\n",
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
				tSize: {type: "v2", value: new THREE.Vector2(256.0, 256.0)},
				center: {type: "v2", value: new THREE.Vector2(0.5, 0.5)},
				angle: {type: "f", value: 1.57},
				scale: {type: "f", value: 1.0}

			},

			fragmentShader: shader$3.fragment,
			vertexShader: shader$3.vertex,

		});

	}

	DotScreenMaterial.prototype = Object.create(THREE.ShaderMaterial.prototype);
	DotScreenMaterial.prototype.constructor = DotScreenMaterial;

	var shader$6 = {
		fragment: "uniform sampler2D tDiffuse;\nuniform sampler2D tDisp;\nuniform int byp;\nuniform float amount;\nuniform float angle;\nuniform float seed;\nuniform float seedX;\nuniform float seedY;\nuniform float distortionX;\nuniform float distortionY;\nuniform float colS;\n\nvarying vec2 vUv;\n\nfloat rand(vec2 co) {\n\n\treturn fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);\n\n}\n\nvoid main() {\n\n\tvec2 coord = vUv;\n\n\tfloat xs, ys;\n\tvec4 normal;\n\n\tvec2 offset;\n\tvec4 cr, cga, cb;\n\tvec4 snow, color;\n\n\tif(byp < 1) {\n\n\t\txs = floor(gl_FragCoord.x / 0.5);\n\t\tys = floor(gl_FragCoord.y / 0.5);\n\n\t\tnormal = texture2D(tDisp, coord * seed * seed);\n\n\t\tif(coord.y < distortionX + colS && coord.y > distortionX - colS * seed) {\n\n\t\t\tif(seedX > 0.0){\n\n\t\t\t\tcoord.y = 1.0 - (coord.y + distortionY);\n\n\t\t\t} else {\n\n\t\t\t\tcoord.y = distortionY;\n\n\t\t\t}\n\n\t\t}\n\n\t\tif(coord.x < distortionY + colS && coord.x > distortionY - colS * seed) {\n\n\t\t\tif(seedY > 0.0){\n\n\t\t\t\tcoord.x = distortionX;\n\n\t\t\t} else {\n\n\t\t\t\tcoord.x = 1. - (coord.x + distortionX);\n\n\t\t\t}\n\n\t\t}\n\n\t\tcoord.x += normal.x * seedX * (seed / 5.0);\n\t\tcoord.y += normal.y * seedY * (seed / 5.0);\n\n\t\t// Adopted from RGB shift shader.\n\t\toffset = amount * vec2(cos(angle), sin(angle));\n\t\tcr = texture2D(tDiffuse, coord + offset);\n\t\tcga = texture2D(tDiffuse, coord);\n\t\tcb = texture2D(tDiffuse, coord - offset);\n\t\tcolor = vec4(cr.r, cga.g, cb.b, cga.a);\n\t\tsnow = 200.0 * amount * vec4(rand(vec2(xs * seed,ys * seed * 50.0)) * 0.2);\n\t\tcolor += snow;\n\n\t} else {\n\n\t\tcolor = texture2D(tDiffuse, vUv);\n\n\t}\n\n\tgl_FragColor = color;\n\n}\n",
		vertex: "varying vec2 vUv;\n\nvoid main() {\n\n\tvUv = uv;\n\tgl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n\n}\n",
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
				tDisp: {type: "t", value: null},
				byp: {type: "i", value: 0},
				amount: {type: "f", value: 0.8},
				angle: {type: "f", value: 0.02},
				seed: {type: "f", value: 0.02},
				seedX: {type: "f", value: 0.02},
				seedY: {type: "f", value: 0.02},
				distortionX: {type: "f", value: 0.5},
				distortionY: {type: "f", value: 0.6},
				colS: {type: "f", value: 0.05}

			},

			fragmentShader: shader$6.fragment,
			vertexShader: shader$6.vertex,

		});

	}

	GlitchMaterial.prototype = Object.create(THREE.ShaderMaterial.prototype);
	GlitchMaterial.prototype.constructor = GlitchMaterial;

	var shader$7 = {
		fragment: "uniform sampler2D tDiffuse;\nuniform vec2 uImageIncrement;\nuniform float cKernel[KERNEL_SIZE_INT];\n\nvarying vec2 vUv;\n\nvoid main() {\n\n\tvec2 coord = vUv;\n\tvec4 sum = vec4(0.0, 0.0, 0.0, 0.0);\n\n\tfor(int i = 0; i < KERNEL_SIZE_INT; ++i) {\n\n\t\tsum += texture2D(tDiffuse, coord) * cKernel[i];\n\t\tcoord += uImageIncrement;\n\n\t}\n\n\tgl_FragColor = sum;\n\n}\n",
		vertex: "uniform vec2 uImageIncrement;\n\nvarying vec2 vUv;\n\nvoid main() {\n\n\tvUv = uv - ((KERNEL_SIZE_FLOAT - 1.0) / 2.0) * uImageIncrement;\n\tgl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n\n}\n",
	};

	/**
	 * Gauss kernel.
	 *
	 * Dropped [ sqrt(2 * pi) * sigma ] term (unnecessary when normalizing).
	 *
	 * @method gauss
	 * @param {Number} x - X.
	 * @param {Number} sigma - Sigma.
	 * @private
	 * @static
	 */

	function gauss(x, sigma) { return Math.exp(-(x * x) / (2.0 * sigma * sigma)); }

	/**
	 * A convolution shader material.
	 *
	 * @class ConvolutionMaterial
	 * @constructor
	 * @extends ShaderMaterial
	 */

	function ConvolutionMaterial() {

		THREE.ShaderMaterial.call(this, {

			defines: {

				KERNEL_SIZE_FLOAT: "25.0",
				KERNEL_SIZE_INT: "25"

			},

			uniforms: {

				tDiffuse: {type: "t", value: null},
				uImageIncrement: {type: "v2", value: new THREE.Vector2(0.001953125, 0.0)},
				cKernel: {type: "fv1", value: []}

			},

			fragmentShader: shader$7.fragment,
			vertexShader: shader$7.vertex,

		});

	}

	ConvolutionMaterial.prototype = Object.create(THREE.ShaderMaterial.prototype);
	ConvolutionMaterial.prototype.constructor = ConvolutionMaterial;

	/**
	 * Creates a new kernel for this material.
	 *
	 * @param {Number} sigma - Sigma value.
	 * @private
	 */

	ConvolutionMaterial.prototype.buildKernel = function(sigma) {

		var i, values, sum, halfWidth;
		var kMaxKernelSize = 25;
		var kernelSize = 2 * Math.ceil(sigma * 3.0) + 1;

		if(kernelSize > kMaxKernelSize) { kernelSize = kMaxKernelSize; }

		halfWidth = (kernelSize - 1) * 0.5;
		values = this.uniforms.cKernel.value;
		values.length = 0;
		sum = 0.0;

		for(i = 0; i < kernelSize; ++i) {

			values[i] = gauss(i - halfWidth, sigma);
			sum += values[i];

		}

		// Normalize the kernel.
		for(i = 0; i < kernelSize; ++i) { values[i] /= sum; }

	};

	var shader$9 = {
		fragment: "uniform sampler2D tColor;\nuniform sampler2D tDepth;\nuniform float textureWidth;\nuniform float textureHeight;\n\nuniform float focalDepth;\nuniform float focalLength;\nuniform float fstop;\nuniform bool showFocus;\n\nuniform float znear;\nuniform float zfar;\n\nuniform bool manualdof;\nuniform bool vignetting;\nuniform bool shaderFocus;\nuniform bool noise;\nuniform bool depthblur;\nuniform bool pentagon;\n\nuniform vec2 focusCoords;\nuniform float maxblur;\nuniform float threshold;\nuniform float gain;\nuniform float bias;\nuniform float fringe;\nuniform float dithering;\n\nvarying vec2 vUv;\n\nconst float PI = 3.14159265;\nconst float TWO_PI = PI * 2.0;\nconst int samples = SAMPLES; // Samples on the first ring.\nconst int rings = RINGS;\nconst int maxringsamples = rings * samples;\n\nfloat ndofstart = 1.0; \nfloat ndofdist = 2.0;\nfloat fdofstart = 1.0;\nfloat fdofdist = 3.0;\n\nfloat CoC = 0.03; // Circle of Confusion size in mm (35mm film = 0.03mm).\n\nfloat vignout = 1.3;\nfloat vignin = 0.0;\nfloat vignfade = 22.0; \n\nfloat dbsize = 1.25;\nfloat feather = 0.4;\n\n/**\n * Pentagonal shape creation.\n */\n\nfloat penta(vec2 coords) {\n\n\tfloat scale = float(rings) - 1.3;\n\n\tvec4  HS0 = vec4( 1.0,          0.0,         0.0,  1.0);\n\tvec4  HS1 = vec4( 0.309016994,  0.951056516, 0.0,  1.0);\n\tvec4  HS2 = vec4(-0.809016994,  0.587785252, 0.0,  1.0);\n\tvec4  HS3 = vec4(-0.809016994, -0.587785252, 0.0,  1.0);\n\tvec4  HS4 = vec4( 0.309016994, -0.951056516, 0.0,  1.0);\n\tvec4  HS5 = vec4( 0.0        ,  0.0        , 1.0,  1.0);\n\n\tvec4  one = vec4(1.0);\n\n\tvec4 P = vec4((coords), vec2(scale, scale));\n\n\tvec4 dist = vec4(0.0);\n\tfloat inorout = -4.0;\n\n\tdist.x = dot(P, HS0);\n\tdist.y = dot(P, HS1);\n\tdist.z = dot(P, HS2);\n\tdist.w = dot(P, HS3);\n\n\tdist = smoothstep(-feather, feather, dist);\n\n\tinorout += dot(dist, one);\n\n\tdist.x = dot(P, HS4);\n\tdist.y = HS5.w - abs(P.z);\n\n\tdist = smoothstep(-feather, feather, dist);\n\tinorout += dist.x;\n\n\treturn clamp(inorout, 0.0, 1.0);\n\n}\n\n/**\n * Depth buffer blur.\n */\n\nfloat bdepth(vec2 coords) {\n\n\tfloat d = 0.0;\n\tfloat kernel[9];\n\tvec2 offset[9];\n\n\tvec2 wh = vec2(1.0 / textureWidth,1.0 / textureHeight) * dbsize;\n\n\toffset[0] = vec2(-wh.x, -wh.y);\n\toffset[1] = vec2(0.0, -wh.y);\n\toffset[2] = vec2(wh.x -wh.y);\n\n\toffset[3] = vec2(-wh.x,  0.0);\n\toffset[4] = vec2(0.0,   0.0);\n\toffset[5] = vec2(wh.x,  0.0);\n\n\toffset[6] = vec2(-wh.x, wh.y);\n\toffset[7] = vec2(0.0, wh.y);\n\toffset[8] = vec2(wh.x, wh.y);\n\n\tkernel[0] = 1.0 / 16.0; kernel[1] = 2.0 / 16.0; kernel[2] = 1.0 / 16.0;\n\tkernel[3] = 2.0 / 16.0; kernel[4] = 4.0 / 16.0; kernel[5] = 2.0 / 16.0;\n\tkernel[6] = 1.0 / 16.0; kernel[7] = 2.0 / 16.0; kernel[8] = 1.0 / 16.0;\n\n\tfor(int i = 0; i < 9; ++i) {\n\n\t\tfloat tmp = texture2D(tDepth, coords + offset[i]).r;\n\t\td += tmp * kernel[i];\n\n\t}\n\n\treturn d;\n\n}\n\n/**\n * Processing the sample.\n */\n\nvec3 color(vec2 coords, float blur) {\n\n\tvec3 col = vec3(0.0);\n\tvec2 texel = vec2(1.0 / textureWidth, 1.0 / textureHeight);\n\n\tcol.r = texture2D(tColor, coords + vec2(0.0, 1.0) * texel * fringe * blur).r;\n\tcol.g = texture2D(tColor, coords + vec2(-0.866, -0.5) * texel * fringe * blur).g;\n\tcol.b = texture2D(tColor, coords + vec2(0.866, -0.5) * texel * fringe * blur).b;\n\n\tvec3 lumcoeff = vec3(0.299, 0.587, 0.114);\n\tfloat lum = dot(col.rgb, lumcoeff);\n\tfloat thresh = max((lum - threshold) * gain, 0.0);\n\n\treturn col + mix(vec3(0.0), col, thresh * blur);\n\n}\n\n/**\n * Generating noise/pattern texture for dithering.\n */\n\nvec2 rand(vec2 coord) {\n\n\tfloat noiseX = ((fract(1.0 - coord.s * (textureWidth / 2.0)) * 0.25) + (fract(coord.t * (textureHeight / 2.0)) * 0.75)) * 2.0 - 1.0;\n\tfloat noiseY = ((fract(1.0 - coord.s * (textureWidth / 2.0)) * 0.75) + (fract(coord.t * (textureHeight / 2.0)) * 0.25)) * 2.0 - 1.0;\n\n\tif(noise) {\n\n\t\tnoiseX = clamp(fract(sin(dot(coord, vec2(12.9898, 78.233))) * 43758.5453), 0.0, 1.0) * 2.0 - 1.0;\n\t\tnoiseY = clamp(fract(sin(dot(coord, vec2(12.9898, 78.233) * 2.0)) * 43758.5453), 0.0, 1.0) * 2.0 - 1.0;\n\n\t}\n\n\treturn vec2(noiseX, noiseY);\n\n}\n\n/**\n * Distance based edge smoothing.\n */\n\nvec3 debugFocus(vec3 col, float blur, float depth) {\n\n\tfloat edge = 0.002 * depth;\n\tfloat m = clamp(smoothstep(0.0, edge, blur), 0.0, 1.0);\n\tfloat e = clamp(smoothstep(1.0 - edge, 1.0, blur), 0.0, 1.0);\n\n\tcol = mix(col, vec3(1.0, 0.5, 0.0), (1.0 - m) * 0.6);\n\tcol = mix(col, vec3(0.0, 0.5, 1.0), ((1.0 - e) - (1.0 - m)) * 0.2);\n\n\treturn col;\n\n}\n\nfloat linearize(float depth) {\n\n\treturn -zfar * znear / (depth * (zfar - znear) - zfar);\n\n}\n\nfloat vignette() {\n\n\tfloat dist = distance(vUv.xy, vec2(0.5, 0.5));\n\tdist = smoothstep(vignout + (fstop / vignfade), vignin + (fstop / vignfade), dist);\n\n\treturn clamp(dist, 0.0, 1.0);\n\n}\n\nfloat gather(float i, float j, int ringsamples, inout vec3 col, float w, float h, float blur) {\n\n\tfloat rings2 = float(rings);\n\tfloat step = TWO_PI / float(ringsamples);\n\tfloat pw = cos(j * step) * i;\n\tfloat ph = sin(j * step) * i;\n\tfloat p = 1.0;\n\n\tif(pentagon) {\n\n\t\tp = penta(vec2(pw,ph));\n\n\t}\n\n\tcol += color(vUv.xy + vec2(pw * w, ph * h), blur) * mix(1.0, i / rings2, bias) * p;\n\n\treturn 1.0 * mix(1.0, i / rings2, bias) * p;\n\n}\n\nvoid main() {\n\n\t// Scene depth calculation.\n\n\tfloat depth = linearize(texture2D(tDepth, vUv.xy).x);\n\n\tif(depthblur) { depth = linearize(bdepth(vUv.xy)); }\n\n\t// Focal plane calculation.\n\n\tfloat fDepth = focalDepth;\n\n\tif(shaderFocus) { fDepth = linearize(texture2D(tDepth, focusCoords).x); }\n\n\t// Dof blur factor calculation.\n\n\tfloat blur = 0.0;\n\n\tfloat a, b, c, d, o;\n\n\tif(manualdof) {\n\n\t\ta = depth - fDepth; // Focal plane.\n\t\tb = (a - fdofstart) / fdofdist; // Far DoF.\n\t\tc = (-a - ndofstart) / ndofdist; // Near Dof.\n\t\tblur = (a > 0.0) ? b : c;\n\n\t} else {\n\n\t\tf = focalLength; // Focal length in mm.\n\t\td = fDepth * 1000.0; // Focal plane in mm.\n\t\to = depth * 1000.0; // Depth in mm.\n\n\t\ta = (o * f) / (o - f);\n\t\tb = (d * f) / (d - f);\n\t\tc = (d - f) / (d * fstop * CoC);\n\n\t\tblur = abs(a - b) * c;\n\t}\n\n\tblur = clamp(blur, 0.0, 1.0);\n\n\t// Calculation of pattern for dithering.\n\n\tvec2 noise = rand(vUv.xy) * dithering * blur;\n\n\t// Getting blur x and y step factor.\n\n\tfloat w = (1.0 / textureWidth) * blur * maxblur + noise.x;\n\tfloat h = (1.0 / textureHeight) * blur * maxblur + noise.y;\n\n\t// Calculation of final color.\n\n\tvec3 col = vec3(0.0);\n\n\tif(blur < 0.05) {\n\n\t\t// Some optimization thingy.\n\t\tcol = texture2D(tColor, vUv.xy).rgb;\n\n\t} else {\n\n\t\tcol = texture2D(tColor, vUv.xy).rgb;\n\t\tfloat s = 1.0;\n\t\tint ringsamples;\n\n\t\tfor(int i = 1; i <= rings; ++i) {\n\n\t\t\t// Unboxing.\n\t\t\tringsamples = i * samples;\n\n\t\t\tfor(int j = 0; j < maxringsamples; ++j) {\n\n\t\t\t\tif(j >= ringsamples) { break; }\n\n\t\t\t\ts += gather(float(i), float(j), ringsamples, col, w, h, blur);\n\n\t\t\t}\n\n\t\t}\n\n\t\tcol /= s; // Divide by sample count.\n\n\t}\n\n\tif(showFocus) { col = debugFocus(col, blur, depth); }\n\n\tif(vignetting) { col *= vignette(); }\n\n\tgl_FragColor.rgb = col;\n\tgl_FragColor.a = 1.0;\n\n}\n",
		vertex: "varying vec2 vUv;\n\nvoid main() {\n\n\tvUv = uv;\n\tgl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n\n}\n",
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

			fragmentShader: shader$9.fragment,
			vertexShader: shader$9.vertex,

		});

	}

	BokehMaterial.prototype = Object.create(THREE.ShaderMaterial.prototype);
	BokehMaterial.prototype.constructor = BokehMaterial;

	var shader$8 = {
		fragment: "uniform sampler2D tDiffuse;\nuniform float time;\nuniform bool grayscale;\nuniform float nIntensity;\nuniform float sIntensity;\nuniform float sCount;\n\nvarying vec2 vUv;\n\nvoid main() {\n\n\tvec4 cTextureScreen = texture2D(tDiffuse, vUv);\n\n\t// Noise.\n\n\tfloat x = vUv.x * vUv.y * time * 1000.0;\n\tx = mod(x, 13.0) * mod(x, 123.0);\n\tfloat dx = mod(x, 0.01);\n\n\tvec3 cResult = cTextureScreen.rgb + cTextureScreen.rgb * clamp(0.1 + dx * 100.0, 0.0, 1.0);\n\n\tvec2 sc = vec2(sin(vUv.y * sCount), cos(vUv.y * sCount));\n\n\t// Scanlines.\n\n\tcResult += cTextureScreen.rgb * vec3(sc.x, sc.y, sc.x) * sIntensity;\n\n\tcResult = cTextureScreen.rgb + clamp(nIntensity, 0.0, 1.0) * (cResult - cTextureScreen.rgb);\n\n\tif(grayscale) {\n\n\t\tcResult = vec3(cResult.r * 0.3 + cResult.g * 0.59 + cResult.b * 0.11);\n\n\t}\n\n\tgl_FragColor =  vec4(cResult, cTextureScreen.a);\n\n}\n",
		vertex: "varying vec2 vUv;\n\nvoid main() {\n\n\tvUv = uv;\n\tgl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n\n}\n",
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

			fragmentShader: shader$8.fragment,
			vertexShader: shader$8.vertex,

		});

	}

	FilmMaterial.prototype = Object.create(THREE.ShaderMaterial.prototype);
	FilmMaterial.prototype.constructor = FilmMaterial;

	var shader$10 = {
		fragment: "uniform sampler2D tDiffuse;\nuniform float stepSize;\nuniform float decay;\nuniform float weight;\nuniform float exposure;\nuniform vec3 lightPosition;\n\nvarying vec2 vUv;\n\nvoid main() {\n\n\tvec2 texCoord = vUv;\n\n\t// Calculate vector from pixel to light source in screen space.\n\tvec2 deltaTexCoord = texCoord - lightPosition.st;\n\tfloat distance = length(deltaTexCoord);\n\n\t// Step vector (uv space).\n\tvec2 step = stepSize * deltaTexCoord / distance;\n\n\t// Number of iterations between pixel and sun.\n\tint iterations = int(distance / stepSize);\n\n\t// Set up illumination decay factor.\n\tfloat illuminationDecay = 1.0;\n\n\t// Sample color.\n\tvec4 sample;\n\n\t// Color accumulator.\n\tvec4 color = vec4(0.0);\n\n\t// Estimate the probability of occlusion at each pixel by summing samples along a ray to the light source.\n\tfor(int i = 0; i < NUM_SAMPLES_INT; ++i) {\n\n\t\t// Don't do more than necessary.\n\t\tif(i <= iterations && texCoord.y < 1.0) {\n\n\t\t\tsample = texture2D(tDiffuse, texCoord);\n\n\t\t\t// Apply sample attenuation scale/decay factors.\n\t\t\tsample *= illuminationDecay * weight;\n\n\t\t\tcolor += sample;\n\n\t\t\t// Update exponential decay factor.\n\t\t\tilluminationDecay *= decay;\n\n\t\t}\n\n\t\ttexCoord -= step;\n\n\t}\n\n\t// Output final color with a further scale control factor.\n\tgl_FragColor = (color / NUM_SAMPLES_FLOAT) * exposure;\n\n}\n",
		vertex: "varying vec2 vUv;\n\nvoid main() {\n\n\tvUv = uv;\n\tgl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n\n}\n"
	};

	/**
	 * A crepuscular rays shader material.
	 *
	 * References:
	 *
	 * Nvidia, GPU Gems 3 - Chapter 13:
	 *  Volumetric Light Scattering as a Post-Process
	 *  http://http.developer.nvidia.com/GPUGems3/gpugems3_ch13.html
	 *
	 * Crytek, Sousa - GDC2008:
	 *  Crysis Next Gen Effects
	 *  http://www.crytek.com/sites/default/files/GDC08_SousaT_CrysisEffects.ppt
	 *
	 * @class GodRaysMaterial
	 * @constructor
	 * @extends ShaderMaterial
	 */

	function GodRaysMaterial() {

		THREE.ShaderMaterial.call(this, {

			defines: {

				NUM_SAMPLES_FLOAT: "6.0",
				NUM_SAMPLES_INT: "6"

			},

			uniforms: {

				tDiffuse: {type: "t", value: null},
				stepSize: {type: "f", value: 1.5},
				decay: {type: "f", value: 1.0},
				weight: {type: "f", value: 1.0},
				exposure: {type: "f", value: 1.0},
				lightPosition: {type: "v3", value: null}

			},

			fragmentShader: shader$10.fragment,
			vertexShader: shader$10.vertex

		});

	}

	GodRaysMaterial.prototype = Object.create(THREE.ShaderMaterial.prototype);
	GodRaysMaterial.prototype.constructor = GodRaysMaterial;

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
	 * @param {Mesh} [quad] - A quad that fills the screen. Used for rendering the effect.
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
	 * @param {Number} delta - The render delta time.
	 */

	Pass.prototype.render = function(renderer, writeBuffer, readBuffer, delta) {

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
	 * A save pass that renders the result from a previous 
	 * pass to an arbitrary render target.
	 *
	 * @class SavePass
	 * @constructor
	 * @extends Pass
	 * @param {Scene} renderTarget - The render target to use for saving the read buffer.
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
	 * @param {Number} delta - The render delta time.
	 */

	SavePass.prototype.render = function(renderer, writeBuffer, readBuffer, delta) {

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
	 * @param {Number} delta - The render delta time.
	 * @param {Boolean} maskActive - This flag is supposed to mask this pass, but it isn't used here :/ hm.
	 */

	MaskPass.prototype.render = function(renderer, writeBuffer, readBuffer, delta, maskActive) {

		var context = renderer.context;
		var writeValue, clearValue;

		// Don't update color or depth.
		context.colorMask(false, false, false, false);
		context.depthMask(false);

		if(this.inverse) {

			writeValue = 0;
			clearValue = 1;

		} else {

			writeValue = 1;
			clearValue = 0;

		}

		context.enable(context.STENCIL_TEST);
		context.stencilOp(context.REPLACE, context.REPLACE, context.REPLACE);
		context.stencilFunc(context.ALWAYS, writeValue, 0xffffffff);
		context.clearStencil(clearValue);

		// Draw into the stencil buffer.
		renderer.render(this.scene, this.camera, readBuffer, this.clear);
		renderer.render(this.scene, this.camera, writeBuffer, this.clear);

		// Re-enable update of color and depth.
		context.colorMask(true, true, true, true);
		context.depthMask(true);

		// Only render where stencil is set to 1.
		context.stencilFunc(context.EQUAL, 1, 0xffffffff);
		context.stencilOp(context.KEEP, context.KEEP, context.KEEP);

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
	 * @param {WebGLRenderTarget} writeBuffer - The write buffer.
	 * @param {WebGLRenderTarget} readBuffer - The read buffer.
	 * @param {Number} delta - The render delta time.
	 * @param {Boolean} maskActive - This flag is supposed to mask this pass, but it isn't used here :/ hm.
	 */

	ClearMaskPass.prototype.render = function(renderer, writeBuffer, readBuffer, delta, maskActive) {

		renderer.context.disable(context.STENCIL_TEST);

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
	 * @param {String} [textureID=tDiffuse] - The texture uniform identifier.
	 */

	function ShaderPass(material, textureID) {

		Pass.call(this);

		/**
		 * The name of the color sampler uniform of the given material.
		 * The read buffer will be bound to this.
		 *
		 * @property textureID
		 * @type String
		 * @default tDiffuse
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

		// Set the mateiral of the rendering quad.
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
	 * @param {Number} delta - The render delta time.
	 */

	ShaderPass.prototype.render = function(renderer, writeBuffer, readBuffer, delta) {

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
	 * A pass that renders a given scene directly on screen
	 * or into the read buffer for further processing.
	 *
	 * @class RenderPass
	 * @constructor
	 * @extends Pass
	 * @param {Scene} scene - The scene to render.
	 * @param {Camera} camera - The camera to use to render the scene.
	 * @param {Material} overrideMaterial - An override material for the scene.
	 * @param {Color} clearColor - A clear color.
	 * @param {Number} clearAlpha - A clear alpha value.
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
	 * @property clearColor
	 * @type Color
	 * @private
	 * @static
	 */

	var clearColor = new THREE.Color();

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

		var clear = this.clearColor !== undefined;
		var clearAlpha;

		this.scene.overrideMaterial = this.overrideMaterial;

		if(clear) {

			clearColor.copy(renderer.getClearColor());
			clearAlpha = renderer.getClearAlpha();

			renderer.setClearColor(this.clearColor, this.clearAlpha);

		}

		if(this.renderToScreen) {

			renderer.render(this.scene, this.camera);

		} else {

			renderer.render(this.scene, this.camera, readBuffer, this.clear);

		}

		if(clear) {

			renderer.setClearColor(clearColor, clearAlpha);

		}

		this.scene.overrideMaterial = null;

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
	 * @param {Number} [opacity] - The opacity to apply to the texture.
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
	 * @param {Number} delta - The render delta time.
	 */

	TexturePass.prototype.render = function(renderer, writeBuffer, readBuffer, delta) {

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
	 * A render pass.
	 *
	 * @class DotScreenPass
	 * @constructor
	 * @extends Pass
	 * @param {Object} [options] - The options.
	 * @param {Vector2} [tSize=(256.0, 256.0)] - The pattern texture size.
	 * @param {Vector2} [center=(0.5, 0.5)] - The center.
	 * @param {Number} [angle=1.57] - The angle.
	 * @param {Number} [scale=1.0] - The scale.
	 */

	function DotScreenPass(options) {

		Pass.call(this);

		/**
		 * Dot screen shader material description.
		 *
		 * @property material
		 * @type DotScreenMaterial
		 * @private
		 */

		this.material = new DotScreenMaterial();

		if(options !== undefined) {

			if(options.tSize !== undefined) { this.material.uniforms.tSize.value.copy(options.tSize); }
			if(options.center !== undefined) { this.material.uniforms.center.value.copy(options.center); }
			if(options.angle !== undefined) { this.material.uniforms.angle.value = options.angle; }
			if(options.scale !== undefined) { this.material.uniforms.scale.value = options.scale; }

		}

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
	 * @param {Number} delta - The render delta time.
	 */

	DotScreenPass.prototype.render = function(renderer, writeBuffer, readBuffer, delta) {

		this.material.uniforms.tDiffuse.value = readBuffer;
		this.material.uniforms.tSize.value.set(readBuffer.width, readBuffer.height);

		this.quad.material = this.material;

		if(this.renderToScreen) {

			renderer.render(this.scene, this.camera);

		} else {

			renderer.render(this.scene, this.camera, writeBuffer, false);

		}

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
			this.material.uniforms.tDisp.value = this.perturbMap;

		} else {

			this.perturbMap = null;
			this.generatePerturbMap(options.dtSize);

		}

		/**
		 * The quad mesh to render.
		 *
		 * @property quad
		 * @type Mesh
		 */

		this.goWild = false;

		/**
		 * Counter for glitch activation/deactivation.
		 *
		 * @property curF
		 * @type Number
		 * @private
		 */

		this.curF = 0;

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

		var uniforms = this.material.uniforms;

		uniforms.tDiffuse.value = readBuffer;
		uniforms.seed.value = Math.random();
		uniforms.byp.value = 0;

		if(this.curF % this.randX === 0 || this.goWild) {

			uniforms.amount.value = Math.random() / 30;
			uniforms.angle.value = THREE.Math.randFloat(-Math.PI, Math.PI);
			uniforms.seedX.value = THREE.Math.randFloat(-1, 1);
			uniforms.seedY.value = THREE.Math.randFloat(-1, 1);
			uniforms.distortionX.value = THREE.Math.randFloat(0, 1);
			uniforms.distortionY.value = THREE.Math.randFloat(0, 1);
			this.curF = 0;
			this.generateTrigger();

		} else if(this.curF % this.randX < this.randX / 5) {

			uniforms.amount.value = Math.random() / 90;
			uniforms.angle.value = THREE.Math.randFloat(-Math.PI, Math.PI);
			uniforms.distortionX.value = THREE.Math.randFloat(0, 1);
			uniforms.distortionY.value = THREE.Math.randFloat(0, 1);
			uniforms.seedX.value = THREE.Math.randFloat(-0.3, 0.3);
			uniforms.seedY.value = THREE.Math.randFloat(-0.3, 0.3);

		} else if(!this.goWild) {

			uniforms.byp.value = 1;

		}

		++this.curF;

		if(this.renderToScreen) {

			renderer.render(this.scene, this.camera);

		} else {

			renderer.render(this.scene, this.camera, writeBuffer, false);

		}

	};

	/**
	 * Creates a new break point for the glitch effect.
	 *
	 * @method generateTrigger
	 */

	GlitchPass.prototype.generateTrigger = function() {

		this.randX = THREE.Math.randInt(120, 240);

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

		var i, x;
		var l = size * size;
		var data = new Float32Array(l * 3);

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

		this.material.uniforms.tDisp.value = this.perturbMap;

	};

	// A constant blur spread factor.
	var BLUR = 0.001953125;

	/**
	 * A bloom pass.
	 *
	 * This pass renders a scene with superimposed blur 
	 * by utilising an approximated gauss kernel.
	 *
	 * Since the effect will be written to the readBuffer 
	 * render texture, you'll need to use a ShaderPass with 
	 * a CopyMaterial to render the texture to screen.
	 *
	 * @class BloomPass
	 * @constructor
	 * @extends Pass
	 * @param {Object} [options] - The options.
	 * @param {Number} [options.strength=1.0] - The bloom strength.
	 * @param {Number} [options.kernelSize=25] - The kernel size.
	 * @param {Number} [options.sigma=4.0] - The sigma value.
	 * @param {Number} [options.resolution=256] - The render resolution.
	 */

	function BloomPass(options) {

		Pass.call(this);

		if(options === undefined) { options = {}; }
		if(options.kernelSize === undefined) { options.kernelSize = 25; }

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
			format: THREE.RGBFormat
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
		this.renderTargetY.stencilBuffer = false;
		this.renderTargetY.depthBuffer = false;

		// Set the resolution.
		this.resolution = (options.resolution === undefined) ? 256 : options.resolution;

		/**
		 * The horizontal blur factor.
		 *
		 * @property blurX
		 * @type Vector2
		 * @private
		 */

		this.blurX = new THREE.Vector2(BLUR, 0.0);

		/**
		 * The vertical blur factor.
		 *
		 * @property blurY
		 * @type Vector2
		 * @private
		 */

		this.blurY = new THREE.Vector2(0.0, BLUR);

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
		 * Convolution shader material.
		 *
		 * @property convolutionMaterial
		 * @type ConvolutionMaterial
		 * @private
		 */

		this.convolutionMaterial = new ConvolutionMaterial();

		this.convolutionMaterial.buildKernel((options.sigma !== undefined) ? options.sigma : 4.0);
		this.convolutionMaterial.defines.KERNEL_SIZE_FLOAT = options.kernelSize.toFixed(1);
		this.convolutionMaterial.defines.KERNEL_SIZE_INT = options.kernelSize.toFixed(0);

		/**
		 * Clear flag.
		 *
		 * This pass draws the blurred scene over the normal one.
		 * Set to true to see the fully blurred scene.
		 *
		 * @property clear
		 * @type Boolean
		 * @default true
		 */

		this.clear = false;

	}

	BloomPass.prototype = Object.create(Pass.prototype);
	BloomPass.prototype.constructor = BloomPass;

	/**
	 * The resolution of the render targets. Needs to be a power of 2.
	 *
	 * @property resolution
	 * @type Number
	 */

	Object.defineProperty(BloomPass.prototype, "resolution", {

		get: function() { return this.renderTargetX.width; },

		set: function(x) {

			if(typeof x === "number") {

				if(x <= 0) { x = 1; }

				this.renderTargetX.setSize(x, x);
				this.renderTargetY.setSize(x, x);

			}

		}

	});

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

	BloomPass.prototype.render = function(renderer, writeBuffer, readBuffer, delta, maskActive) {

		if(maskActive) { renderer.context.disable(renderer.context.STENCIL_TEST); }

		// Render quad with blurred scene into texture (convolution pass 1).
		this.quad.material = this.convolutionMaterial;
		this.convolutionMaterial.uniforms.tDiffuse.value = readBuffer;
		this.convolutionMaterial.uniforms.uImageIncrement.value.copy(this.blurX);
		renderer.render(this.scene, this.camera, this.renderTargetX, true);

		// Render quad with blurred scene into texture (convolution pass 2).
		this.convolutionMaterial.uniforms.tDiffuse.value = this.renderTargetX;
		this.convolutionMaterial.uniforms.uImageIncrement.value.copy(this.blurY);
		renderer.render(this.scene, this.camera, this.renderTargetY, true);

		if(maskActive) { renderer.context.enable(renderer.context.STENCIL_TEST); }

		// Render original scene with superimposed blur.
		if(this.renderToScreen) {

			// Combine read buffer with the generated blur and render the result to screen.
			this.quad.material = this.combineMaterial;
			this.combineMaterial.uniforms.texture1.value = readBuffer;
			this.combineMaterial.uniforms.texture2.value = this.renderTargetY;

			renderer.render(this.scene, this.camera);

		} else {

			// Render directly onto the read buffer. Saves one texel fetch compared to the combine strategy.
			this.quad.material = this.copyMaterial;
			this.copyMaterial.uniforms.tDiffuse.value = this.renderTargetY;

			renderer.render(this.scene, this.camera, readBuffer, this.clear);

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

		if(width <= 0) { width = 1; }
		if(height <= 0) { height = 1; }

		// Scale one of the blur factors with the render target ratio.
		this.blurY.set(0.0, (width / height) * BLUR);

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
	 * Depth-of-field pass using a bokeh shader.
	 *
	 * @class TexturePass
	 * @constructor
	 * @extends Pass
	 * @param {Object} [options] - The options.
	 * @param {Boolean} [options.grayscale=true] - Convert to greyscale.
	 * @param {Number} [options.noiseIntensity=0.5] - The noise intensity. 0.0 to 1.0.
	 * @param {Number} [options.scanlinesIntensity=0.05] - The scanline intensity. 0.0 to 1.0.
	 * @param {Number} [options.scanlinesCount=4096.0] - The number of scanlines. 0.0 to 4096.0.
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
			if(options.scanlinesCount !== undefined) { this.material.uniforms.sCount.value = options.scanlinesCount; }

		}

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
	 * A crepuscular rays pass.
	 *
	 * @class GodRaysPass
	 * @constructor
	 * @extends Pass
	 * @param {Scene} scene - The main scene.
	 * @param {Camera} camera - The main camera.
	 * @param {Vector3} lightSource - The most important light source.
	 * @param {Object} [options] - The options.
	 * @param {Number} [options.rayLength=1.0] - The maximum length of god rays.
	 * @param {Number} [options.decay=1.0] - A constant attenuation coefficient.
	 * @param {Number} [options.weight=1.0] - A constant attenuation coefficient.
	 * @param {Number} [options.exposure=1.0] - A constant attenuation coefficient.
	 * @param {Number} [options.intensity=1.0] - A constant factor for additive blending.
	 * @param {Number} [options.resolution=512] - The god rays render texture resolution.
	 * @param {Number} [options.samples=9] - The number of samples per pixel.
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
			format: THREE.RGBFormat
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
		this.renderTargetY.stencilBuffer = false;
		this.renderTargetY.depthBuffer = false;

		// Set the resolution.
		this.resolution = (options.resolution === undefined) ? 512 : options.resolution;

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
		 * @property screenLightPosition
		 * @type Vector3
		 * @private
		 */

		this.screenLightPosition = new THREE.Vector3();

		/**
		 * God rays shader material for the generate phase.
		 *
		 * @property godRaysMaterial
		 * @type GodRaysMaterial
		 * @private
		 */

		this.godRaysMaterial = new GodRaysMaterial();
		this.godRaysMaterial.uniforms.lightPosition.value = this.screenLightPosition;

		if(options.decay !== undefined) { this.godRaysMaterial.uniforms.decay.value = options.decay; }
		if(options.weight !== undefined) { this.godRaysMaterial.uniforms.weight.value = options.weight; }

		/**
		 * The exposure coefficient.
		 *
		 * This value is scaled based on the user's view direction. 
		 * The product is sent to the god rays shader each frame.
		 *
		 * @property exposure
		 * @type Number
		 */

		if(options.exposure !== undefined) { this.godRaysMaterial.uniforms.exposure.value = options.exposure; }

		this.exposure = this.godRaysMaterial.uniforms.exposure.value;

		/**
		 * Combine shader material for the final composite phase.
		 *
		 * @property combineMaterial
		 * @type CombineMaterial
		 * @private
		 */

		this.combineMaterial = new CombineMaterial();

		if(options.intensity !== undefined) { this.combineMaterial.uniforms.opacity2.value = options.intensity; }

		/**
		 * A material used for masking the scene objects.
		 *
		 * @property maskMaterial
		 * @type MeshBasicMaterial
		 * @private
		 */

		this.maskMaterial = new THREE.MeshBasicMaterial({color: 0x000000});

		/**
		 * The maximum length of god-rays.
		 *
		 * @property _rayLength
		 * @type Number
		 * @private
		 */

		this._rayLength = (options.rayLength !== undefined) ? options.rayLength : 1.0;

		/**
		 * The maximum ray length translated to step sizes for the 3 generate passes.
		 *
		 * @property stepSizes
		 * @type Float32Array
		 * @private
		 */

		this.stepSizes = new Float32Array(3);

		// Setting the amount of samples indirectly computes the actual step sizes.
		this.samples = options.samples;

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

	}

	GodRaysPass.prototype = Object.create(Pass.prototype);
	GodRaysPass.prototype.constructor = GodRaysPass;

	/**
	 * The overall intensity of the effect.
	 *
	 * @property intensity
	 * @type Number
	 * @default 1.0
	 */

	Object.defineProperty(GodRaysPass.prototype, "intensity", {

		get: function() { return this.combineMaterial.uniforms.intensity.value; },

		set: function(x) {

			if(typeof x === "number") {

				this.combineMaterial.uniforms.intensity.value = x;

			}

		}

	});

	/**
	 * The resolution of the render targets. Needs to be a power of 2.
	 *
	 * @property resolution
	 * @type Number
	 * @default 512
	 */

	Object.defineProperty(GodRaysPass.prototype, "resolution", {

		get: function() { return this.renderTargetX.width; },

		set: function(x) {

			if(typeof x === "number") {

				if(x <= 0) { x = 1; }

				this.renderTargetX.setSize(x, x);
				this.renderTargetY.setSize(x, x);

			}

		}

	});

	/**
	 * The maximum length of god rays.
	 *
	 * A value of 1.5 is recommended, to ensure that the effect 
	 * fills the entire screen at all times.
	 *
	 * As a result, the whole effect will be spread out further 
	 * which requires a slightly higher number of samples per pixel  
	 * to prevent visual gaps along the rays. 
	 *
	 * @property rayLength
	 * @type Number
	 * @default 1.5
	 */

	Object.defineProperty(GodRaysPass.prototype, "rayLength", {

		get: function() { return this._rayLength; },

		set: function(x) {

			if(typeof x === "number" && x >= 0.0) {

				this._rayLength = x;
				this.calculateStepSizes();

			}

		}

	});

	/**
	 * The number of samples per pixel.
	 *
	 * This value must be carefully chosen. A higher value increases the 
	 * GPU load directly and doesn't necessarily yield better results!
	 *
	 * The recommended number of samples is 9.
	 * For render resolutions below 1024 and a ray length of 1.0, 7 samples 
	 * might also be sufficient.
	 *
	 * Values above 9 don't have a noticable impact on the quality.
	 *
	 * @property samples
	 * @type Number
	 * @default 9
	 */

	Object.defineProperty(GodRaysPass.prototype, "samples", {

		get: function() {

			return Number.parseInt(this.godRaysMaterial.defines.NUM_SAMPLES_INT);

		},

		set: function(x) {

			if(typeof x === "number" && x >= 1) {

				x = Math.floor(x);

				this.godRaysMaterial.defines.NUM_SAMPLES_FLOAT = x.toFixed(1);
				this.godRaysMaterial.defines.NUM_SAMPLES_INT = x.toFixed(0);

			}

			this.calculateStepSizes();

		}

	});

	/**
	 * Adjusts the sampling step sizes for the three generate passes.
	 *
	 * @method calculateStepSizes
	 * @private
	 */

	GodRaysPass.prototype.calculateStepSizes = function() {

		var x = this.samples;

		this.stepSizes[0] = this.rayLength * Math.pow(x, -1.0);
		this.stepSizes[1] = this.rayLength * Math.pow(x, -2.0);
		this.stepSizes[2] = this.rayLength * Math.pow(x, -3.0);

	};

	/**
	 * Used for saving the original clear color 
	 * during rendering the masked scene.
	 *
	 * @property clearColor
	 * @type Color
	 * @private
	 * @static
	 */

	var clearColor$1 = new THREE.Color();

	/**
	 * Renders the scene.
	 *
	 * The god rays pass has two phases with a total of 4 render steps.
	 *
	 * Generate-phase:
	 *  In the first pass, the masked scene is blurred along radial lines towards the light source.
	 *  The result of the previous pass is re-blurred twice with a decreased distance between the samples.
	 *
	 * Combine-phase:
	 *  The result is added to the normal scene.
	 *
	 * @method render
	 * @param {WebGLRenderer} renderer - The renderer to use.
	 * @param {WebGLRenderTarget} writeBuffer - The write buffer.
	 * @param {WebGLRenderTarget} readBuffer - The read buffer.
	 */

	GodRaysPass.prototype.render = function(renderer, writeBuffer, readBuffer) {

		var clearAlpha;

		// Compute the screen light position and translate the coordinates to [-1, 1].
		this.screenLightPosition.copy(this.lightSource.position).project(this.mainCamera);
		this.screenLightPosition.x = THREE.Math.clamp((this.screenLightPosition.x + 1.0) * 0.5, -1.0, 1.0);
		this.screenLightPosition.y = THREE.Math.clamp((this.screenLightPosition.y + 1.0) * 0.5, -1.0, 1.0);

		// Don't show the rays from acute angles.
		this.godRaysMaterial.uniforms.exposure.value = this.computeAngularScalar() * this.exposure;

		// Render the masked scene into texture.
		this.mainScene.overrideMaterial = this.maskMaterial;
		clearColor$1.copy(renderer.getClearColor());
		clearAlpha = renderer.getClearAlpha();
		renderer.setClearColor(0x000000, 1);
		//renderer.render(this.mainScene, this.mainCamera, undefined, true); // Debug.
		renderer.render(this.mainScene, this.mainCamera, this.renderTargetX, true);
		renderer.setClearColor(clearColor$1, clearAlpha);
		this.mainScene.overrideMaterial = null;

		// God rays - Pass 1.
		this.quad.material = this.godRaysMaterial;
		this.godRaysMaterial.uniforms.stepSize.value = this.stepSizes[0];
		this.godRaysMaterial.uniforms.tDiffuse.value = this.renderTargetX;
		renderer.render(this.scene, this.camera, this.renderTargetY);

		// God rays - Pass 2.
		this.godRaysMaterial.uniforms.stepSize.value = this.stepSizes[1];
		this.godRaysMaterial.uniforms.tDiffuse.value = this.renderTargetY;
		renderer.render(this.scene, this.camera, this.renderTargetX);

		// God rays - Pass 3.
		this.godRaysMaterial.uniforms.stepSize.value = this.stepSizes[2];
		this.godRaysMaterial.uniforms.tDiffuse.value = this.renderTargetX;
		renderer.render(this.scene, this.camera, this.renderTargetY);

		// Final pass - Composite god rays onto colors.
		this.quad.material = this.combineMaterial;
		this.combineMaterial.uniforms.texture1.value = readBuffer;
		this.combineMaterial.uniforms.texture2.value = this.renderTargetY;

		if(this.renderToScreen) {

			renderer.render(this.scene, this.camera);

		} else {

			renderer.render(this.scene, this.camera, writeBuffer);

		}

	};

	/**
	 * Computes the angle between the camera look direction and the light
	 * direction in order to create a scalar for the god rays exposure.
	 *
	 * @method computeAngularScalar
	 * @private
	 * @return {Number} A scalar in the range 0.0 to 1.0 for a linear transition.
	 */

	// Static computation helpers.
	var HALF_PI = Math.PI * 0.5;
	var localPoint = new THREE.Vector3(0, 0, -1);
	var cameraDirection = new THREE.Vector3();
	var lightDirection = new THREE.Vector3();

	GodRaysPass.prototype.computeAngularScalar = function() {

		//this.camera.getWorldDirection(cameraDirection);

		// Save camera space point. Using lightDirection as a clipboard.
		lightDirection.copy(localPoint);
		// Camera space to world space.
		cameraDirection.copy(localPoint.applyMatrix4(this.mainCamera.matrixWorld));
		// Restore local point.
		localPoint.copy(lightDirection);

		// Let these be one and the same point.
		lightDirection.copy(cameraDirection);
		// Now compute the actual directions.
		cameraDirection.sub(this.mainCamera.position);
		lightDirection.sub(this.lightSource.position);

		// Compute the angle between the directions.
		// Don't allow acute angles and make a scalar out of it.
		return THREE.Math.clamp(cameraDirection.angleTo(lightDirection) - HALF_PI, 0.0, 1.0);

	};

	/**
	 * The effect composer may be used in place of a normal WebGLRenderer.
	 *
	 * The composer will disable the auto clear behaviour of the provided
	 * renderer in order to prevent unnecessary clear operations. 
	 * You might want to use a RenderPass as your first pass to automatically 
	 * clear the screen and render the scene to a texture for further processing. 
	 *
	 * @class EffectComposer
	 * @constructor
	 * @param {WebGLRenderer} renderer - The renderer that should be used.
	 * @param {WebGLRenderTarget} [renderTarget] - A render target to use for the post processing. If none is provided, a new one will be created.
	 */

	function EffectComposer(renderer, renderTarget) {

		var pixelRatio, width, height;

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
		 * The write buffer. Alias for renderTarget1.
		 *
		 * @property writeBuffer
		 * @type WebGLRenderTarget
		 * @private
		 */

		this.writeBuffer = this.renderTarget1;

		/**
		 * The read buffer. Alias for renderTarget2.
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
	 * Renders all passes in order.
	 *
	 * @method render
	 * @param {Number} delta - The delta time between the last frame and the current one.
	 */

	EffectComposer.prototype.render = function(delta) {

		this.writeBuffer = this.renderTarget1;
		this.readBuffer = this.renderTarget2;

		var maskActive = false;
		var i, l, pass, context;

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
	 * Call this method when the size of the renderer's canvas changed or
	 * if you want to drop the old read/write buffers and create new ones.
	 *
	 * @method reset
	 * @param {WebGLRenderTarget} [renderTarget] - A new render target to use.
	 */

	EffectComposer.prototype.reset = function(renderTarget) {

		var pixelRatio, width, height;

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

		var i, l;

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
	exports.Pass = Pass;
	exports.SavePass = SavePass;
	exports.MaskPass = MaskPass;
	exports.ClearMaskPass = ClearMaskPass;
	exports.ShaderPass = ShaderPass;
	exports.RenderPass = RenderPass;
	exports.TexturePass = TexturePass;
	exports.AdaptiveToneMappingPass = AdaptiveToneMappingPass;
	exports.DotScreenPass = DotScreenPass;
	exports.GlitchPass = GlitchPass;
	exports.BloomPass = BloomPass;
	exports.BokehPass = BokehPass;
	exports.FilmPass = FilmPass;
	exports.GodRaysPass = GodRaysPass;
	exports.CopyMaterial = CopyMaterial;
	exports.CombineMaterial = CombineMaterial;
	exports.LuminosityMaterial = LuminosityMaterial;
	exports.AdaptiveLuminosityMaterial = AdaptiveLuminosityMaterial;
	exports.ToneMappingMaterial = ToneMappingMaterial;
	exports.DotScreenMaterial = DotScreenMaterial;
	exports.GlitchMaterial = GlitchMaterial;
	exports.ConvolutionMaterial = ConvolutionMaterial;
	exports.BokehMaterial = BokehMaterial;
	exports.FilmMaterial = FilmMaterial;
	exports.GodRaysMaterial = GodRaysMaterial;

}));