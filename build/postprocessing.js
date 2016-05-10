/**
 * postprocessing v1.1.1 build May 10 2016
 * https://github.com/vanruesc/postprocessing
 * Copyright 2016 Raoul van Rüschen, Zlib
 */

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('three')) :
	typeof define === 'function' && define.amd ? define(['exports', 'three'], factory) :
	(factory((global.POSTPROCESSING = global.POSTPROCESSING || {}),global.THREE));
}(this, function (exports,THREE) { 'use strict';

	THREE = 'default' in THREE ? THREE['default'] : THREE;

	var fragment = "uniform sampler2D tPreviousLum;\r\nuniform sampler2D tCurrentLum;\r\nuniform float delta;\r\nuniform float tau;\r\n\r\nvarying vec2 vUv;\r\n\r\nvoid main() {\r\n\r\n\tfloat previousLum = texture2D(tPreviousLum, vUv, MIP_LEVEL_1X1).r;\r\n\tfloat currentLum = texture2D(tCurrentLum, vUv, MIP_LEVEL_1X1).r;\r\n\r\n\t// Adapt the luminance using Pattanaik's technique.\r\n\tfloat adaptedLum = previousLum + (currentLum - previousLum) * (1.0 - exp(-delta * tau));\r\n\r\n\tgl_FragColor = vec4(adaptedLum, adaptedLum, adaptedLum, 1.0);\r\n\r\n}\r\n";

	var vertex = "varying vec2 vUv;\r\n\r\nvoid main() {\r\n\r\n\tvUv = uv;\r\n\tgl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\r\n\r\n}\r\n";

	/**
	 * An adaptive luminosity shader material.
	 *
	 * @class AdaptiveLuminosityMaterial
	 * @submodule materials
	 * @extends ShaderMaterial
	 * @constructor
	 */

	class AdaptiveLuminosityMaterial extends THREE.ShaderMaterial {

		constructor() {

			super({

				type: "AdaptiveLuminosityMaterial",

				defines: {

					MIP_LEVEL_1X1: "0.0"

				},

				uniforms: {

					tPreviousLum: {value: null},
					tCurrentLum: {value: null},
					delta: {value: 0.0},
					tau: {value: 1.0}

				},

				fragmentShader: fragment,
				vertexShader: vertex

			});

		}

	}

	var fragment$1 = "#include <packing>\r\n\r\nuniform sampler2D tDiffuse;\r\nuniform sampler2D tDepth;\r\n\r\nuniform float cameraNear;\r\nuniform float cameraFar;\r\n\r\nuniform float focus;\r\nuniform float aspect;\r\nuniform float aperture;\r\nuniform float maxBlur;\r\n\r\nvarying vec2 vUv;\r\n\r\nfloat readDepth(sampler2D depthSampler, vec2 coord) {\r\n\r\n\tfloat fragCoordZ = texture2D(depthSampler, coord).x;\r\n\tfloat viewZ = perspectiveDepthToViewZ(fragCoordZ, cameraNear, cameraFar);\r\n\r\n\treturn viewZToOrthoDepth(viewZ, cameraNear, cameraFar);\r\n\r\n}\r\n\r\nvoid main() {\r\n\r\n\tvec2 aspectCorrection = vec2(1.0, aspect);\r\n\r\n\tfloat depth = readDepth(tDepth, vUv);\r\n\r\n\tfloat factor = depth - focus;\r\n\r\n\tvec2 dofBlur = vec2(clamp(factor * aperture, -maxBlur, maxBlur));\r\n\r\n\tvec2 dofblur9 = dofBlur * 0.9;\r\n\tvec2 dofblur7 = dofBlur * 0.7;\r\n\tvec2 dofblur4 = dofBlur * 0.4;\r\n\r\n\tvec4 color = vec4(0.0);\r\n\r\n\tcolor += texture2D(tDiffuse, vUv);\r\n\tcolor += texture2D(tDiffuse, vUv + (vec2( 0.0,   0.4 ) * aspectCorrection) * dofBlur);\r\n\tcolor += texture2D(tDiffuse, vUv + (vec2( 0.15,  0.37) * aspectCorrection) * dofBlur);\r\n\tcolor += texture2D(tDiffuse, vUv + (vec2( 0.29,  0.29) * aspectCorrection) * dofBlur);\r\n\tcolor += texture2D(tDiffuse, vUv + (vec2(-0.37,  0.15) * aspectCorrection) * dofBlur);\r\n\tcolor += texture2D(tDiffuse, vUv + (vec2( 0.40,  0.0 ) * aspectCorrection) * dofBlur);\r\n\tcolor += texture2D(tDiffuse, vUv + (vec2( 0.37, -0.15) * aspectCorrection) * dofBlur);\r\n\tcolor += texture2D(tDiffuse, vUv + (vec2( 0.29, -0.29) * aspectCorrection) * dofBlur);\r\n\tcolor += texture2D(tDiffuse, vUv + (vec2(-0.15, -0.37) * aspectCorrection) * dofBlur);\r\n\tcolor += texture2D(tDiffuse, vUv + (vec2( 0.0,  -0.4 ) * aspectCorrection) * dofBlur);\r\n\tcolor += texture2D(tDiffuse, vUv + (vec2(-0.15,  0.37) * aspectCorrection) * dofBlur);\r\n\tcolor += texture2D(tDiffuse, vUv + (vec2(-0.29,  0.29) * aspectCorrection) * dofBlur);\r\n\tcolor += texture2D(tDiffuse, vUv + (vec2( 0.37,  0.15) * aspectCorrection) * dofBlur);\r\n\tcolor += texture2D(tDiffuse, vUv + (vec2(-0.4,   0.0 ) * aspectCorrection) * dofBlur);\r\n\tcolor += texture2D(tDiffuse, vUv + (vec2(-0.37, -0.15) * aspectCorrection) * dofBlur);\r\n\tcolor += texture2D(tDiffuse, vUv + (vec2(-0.29, -0.29) * aspectCorrection) * dofBlur);\r\n\tcolor += texture2D(tDiffuse, vUv + (vec2( 0.15, -0.37) * aspectCorrection) * dofBlur);\r\n\r\n\tcolor += texture2D(tDiffuse, vUv + (vec2( 0.15,  0.37) * aspectCorrection) * dofblur9);\r\n\tcolor += texture2D(tDiffuse, vUv + (vec2(-0.37,  0.15) * aspectCorrection) * dofblur9);\r\n\tcolor += texture2D(tDiffuse, vUv + (vec2( 0.37, -0.15) * aspectCorrection) * dofblur9);\r\n\tcolor += texture2D(tDiffuse, vUv + (vec2(-0.15, -0.37) * aspectCorrection) * dofblur9);\r\n\tcolor += texture2D(tDiffuse, vUv + (vec2(-0.15,  0.37) * aspectCorrection) * dofblur9);\r\n\tcolor += texture2D(tDiffuse, vUv + (vec2( 0.37,  0.15) * aspectCorrection) * dofblur9);\r\n\tcolor += texture2D(tDiffuse, vUv + (vec2(-0.37, -0.15) * aspectCorrection) * dofblur9);\r\n\tcolor += texture2D(tDiffuse, vUv + (vec2( 0.15, -0.37) * aspectCorrection) * dofblur9);\r\n\r\n\tcolor += texture2D(tDiffuse, vUv + (vec2( 0.29,  0.29) * aspectCorrection) * dofblur7);\r\n\tcolor += texture2D(tDiffuse, vUv + (vec2( 0.40,  0.0 ) * aspectCorrection) * dofblur7);\r\n\tcolor += texture2D(tDiffuse, vUv + (vec2( 0.29, -0.29) * aspectCorrection) * dofblur7);\r\n\tcolor += texture2D(tDiffuse, vUv + (vec2( 0.0,  -0.4 ) * aspectCorrection) * dofblur7);\r\n\tcolor += texture2D(tDiffuse, vUv + (vec2(-0.29,  0.29) * aspectCorrection) * dofblur7);\r\n\tcolor += texture2D(tDiffuse, vUv + (vec2(-0.4,   0.0 ) * aspectCorrection) * dofblur7);\r\n\tcolor += texture2D(tDiffuse, vUv + (vec2(-0.29, -0.29) * aspectCorrection) * dofblur7);\r\n\tcolor += texture2D(tDiffuse, vUv + (vec2( 0.0,   0.4 ) * aspectCorrection) * dofblur7);\r\n\r\n\tcolor += texture2D(tDiffuse, vUv + (vec2( 0.29,  0.29) * aspectCorrection) * dofblur4);\r\n\tcolor += texture2D(tDiffuse, vUv + (vec2( 0.4,   0.0 ) * aspectCorrection) * dofblur4);\r\n\tcolor += texture2D(tDiffuse, vUv + (vec2( 0.29, -0.29) * aspectCorrection) * dofblur4);\r\n\tcolor += texture2D(tDiffuse, vUv + (vec2( 0.0,  -0.4 ) * aspectCorrection) * dofblur4);\r\n\tcolor += texture2D(tDiffuse, vUv + (vec2(-0.29,  0.29) * aspectCorrection) * dofblur4);\r\n\tcolor += texture2D(tDiffuse, vUv + (vec2(-0.4,   0.0 ) * aspectCorrection) * dofblur4);\r\n\tcolor += texture2D(tDiffuse, vUv + (vec2(-0.29, -0.29) * aspectCorrection) * dofblur4);\r\n\tcolor += texture2D(tDiffuse, vUv + (vec2( 0.0,   0.4 ) * aspectCorrection) * dofblur4);\r\n\r\n\tgl_FragColor = color / 41.0;\r\n\r\n}\r\n";

	var vertex$1 = "varying vec2 vUv;\r\n\r\nvoid main() {\r\n\r\n\tvUv = uv;\r\n\tgl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\r\n\r\n}\r\n";

	/**
	 * Depth of Field shader (Bokeh).
	 *
	 * Original code by Martins Upitis:
	 *  http://artmartinsh.blogspot.com/2010/02/glsl-lens-blur-filter-with-bokeh.html
	 *
	 * @class BokehMaterial
	 * @submodule materials
	 * @extends ShaderMaterial
	 * @constructor
	 * @param {PerspectiveCamera} [camera] - The main camera.
	 * @param {Object} [options] - The options.
	 * @param {Number} [options.focus=1.0] - Focus distance.
	 * @param {Number} [options.aspect=1.0] - Camera aspect factor.
	 * @param {Number} [options.aperture=0.025] - Camera aperture scale. Bigger values for shallower depth of field.
	 * @param {Number} [options.maxBlur=1.0] - Maximum blur strength.
	 */

	class BokehMaterial extends THREE.ShaderMaterial {

		constructor(camera, options) {

			if(options === undefined) { options = {}; }

			super({

				type: "BokehMaterial",

				uniforms: {

					tDiffuse: {value: null},
					tDepth: {value: null},

					cameraNear: {value: 0.1},
					cameraFar: {value: 2000},

					focus: {value: (options.focus !== undefined) ? options.focus : 1.0},
					aspect: {value: (options.aspect !== undefined) ? options.aspect : 1.0},
					aperture: {value: (options.aperture !== undefined) ? options.aperture : 0.025},
					maxBlur: {value: (options.maxBlur !== undefined) ? options.maxBlur : 1.0}

				},

				fragmentShader: fragment$1,
				vertexShader: vertex$1

			});

			if(camera !== undefined) { this.adoptCameraSettings(camera); }

		}

		/**
		 * Adopts the near and far plane settings of the given camera.
		 *
		 * @method adoptCameraSettings
		 * @param {PerspectiveCamera} camera - The main camera.
		 */

		adoptCameraSettings(camera) {

			this.uniforms.cameraNear.value = camera.near;
			this.uniforms.cameraFar.value = camera.far;

		}

	}

	var fragment$2 = "#include <packing>\r\n\r\nuniform sampler2D tDiffuse;\r\nuniform sampler2D tDepth;\r\n\r\nuniform vec2 texelSize;\r\nuniform vec2 halfTexelSize;\r\n\r\nuniform float cameraNear;\r\nuniform float cameraFar;\r\n\r\nuniform float focalLength;\r\nuniform float fStop;\r\n\r\nuniform float maxBlur;\r\nuniform float luminanceThreshold;\r\nuniform float luminanceGain;\r\nuniform float bias;\r\nuniform float fringe;\r\nuniform float ditherStrength;\r\n\r\n#ifdef SHADER_FOCUS\r\n\r\n\tuniform vec2 focusCoords;\r\n\r\n#else\r\n\r\n\tuniform float focalDepth;\r\n\r\n#endif\r\n\r\nvarying vec2 vUv;\r\n\r\n#ifdef PENTAGON\r\n\r\n\tfloat penta(vec2 coords) {\r\n\r\n\t\tconst vec4 HS0 = vec4( 1.0,          0.0,         0.0, 1.0);\r\n\t\tconst vec4 HS1 = vec4( 0.309016994,  0.951056516, 0.0, 1.0);\r\n\t\tconst vec4 HS2 = vec4(-0.809016994,  0.587785252, 0.0, 1.0);\r\n\t\tconst vec4 HS3 = vec4(-0.809016994, -0.587785252, 0.0, 1.0);\r\n\t\tconst vec4 HS4 = vec4( 0.309016994, -0.951056516, 0.0, 1.0);\r\n\t\tconst vec4 HS5 = vec4( 0.0,          0.0,         1.0, 1.0);\r\n\r\n\t\tconst vec4 ONE = vec4(1.0);\r\n\r\n\t\tconst float P_FEATHER = 0.4;\r\n\t\tconst float N_FEATHER = -P_FEATHER;\r\n\r\n\t\tfloat inOrOut = -4.0;\r\n\r\n\t\tvec4 P = vec4(coords, vec2(RINGS_FLOAT - 1.3));\r\n\r\n\t\tvec4 dist = vec4(\r\n\t\t\tdot(P, HS0),\r\n\t\t\tdot(P, HS1),\r\n\t\t\tdot(P, HS2),\r\n\t\t\tdot(P, HS3)\r\n\t\t);\r\n\r\n\t\tdist = smoothstep(N_FEATHER, P_FEATHER, dist);\r\n\r\n\t\tinOrOut += dot(dist, ONE);\r\n\r\n\t\tdist.x = dot(P, HS4);\r\n\t\tdist.y = HS5.w - abs(P.z);\r\n\r\n\t\tdist = smoothstep(N_FEATHER, P_FEATHER, dist);\r\n\t\tinOrOut += dist.x;\r\n\r\n\t\treturn clamp(inOrOut, 0.0, 1.0);\r\n\r\n\t}\r\n\r\n#endif\r\n\r\n#ifdef SHOW_FOCUS\r\n\r\n\tvec3 debugFocus(vec3 c, float blur, float depth) {\r\n\r\n\t\tfloat edge = 0.002 * depth;\r\n\t\tfloat m = clamp(smoothstep(0.0, edge, blur), 0.0, 1.0);\r\n\t\tfloat e = clamp(smoothstep(1.0 - edge, 1.0, blur), 0.0, 1.0);\r\n\r\n\t\tc = mix(c, vec3(1.0, 0.5, 0.0), (1.0 - m) * 0.6);\r\n\t\tc = mix(c, vec3(0.0, 0.5, 1.0), ((1.0 - e) - (1.0 - m)) * 0.2);\r\n\r\n\t\treturn c;\r\n\r\n\t}\r\n\r\n#endif\r\n\r\n#ifdef VIGNETTE\r\n\r\n\tfloat vignette() {\r\n\r\n\t\tconst vec2 CENTER = vec2(0.5);\r\n\r\n\t\tconst float VIGNETTE_OUT = 1.3;\r\n\t\tconst float VIGNETTE_IN = 0.0;\r\n\t\tconst float VIGNETTE_FADE = 22.0; \r\n\r\n\t\tfloat d = distance(vUv, CENTER);\r\n\t\td = smoothstep(VIGNETTE_OUT + (fStop / VIGNETTE_FADE), VIGNETTE_IN + (fStop / VIGNETTE_FADE), d);\r\n\r\n\t\treturn clamp(d, 0.0, 1.0);\r\n\r\n\t}\r\n\r\n#endif\r\n\r\nvec2 rand(vec2 coord) {\r\n\r\n\tvec2 noise;\r\n\r\n\t#ifdef NOISE\r\n\r\n\t\tconst float a = 12.9898;\r\n\t\tconst float b = 78.233;\r\n\t\tconst float c = 43758.5453;\r\n\r\n\t\tnoise.x = clamp(fract(sin(mod(dot(coord, vec2(a, b)), 3.14)) * c), 0.0, 1.0) * 2.0 - 1.0;\r\n\t\tnoise.y = clamp(fract(sin(mod(dot(coord, vec2(a, b) * 2.0), 3.14)) * c), 0.0, 1.0) * 2.0 - 1.0;\r\n\r\n\t#else\r\n\r\n\t\tnoise.x = ((fract(1.0 - coord.s * halfTexelSize.x) * 0.25) + (fract(coord.t * halfTexelSize.y) * 0.75)) * 2.0 - 1.0;\r\n\t\tnoise.y = ((fract(1.0 - coord.s * halfTexelSize.x) * 0.75) + (fract(coord.t * halfTexelSize.y) * 0.25)) * 2.0 - 1.0;\r\n\r\n\t#endif\r\n\r\n\treturn noise;\r\n\r\n}\r\n\r\nvec3 processTexel(vec2 coords, float blur) {\r\n\r\n\tconst vec3 LUM_COEFF = vec3(0.299, 0.587, 0.114);\r\n\r\n\tvec3 c;\r\n\tc.r = texture2D(tDiffuse, coords + vec2(0.0, 1.0) * texelSize * fringe * blur).r;\r\n\tc.g = texture2D(tDiffuse, coords + vec2(-0.866, -0.5) * texelSize * fringe * blur).g;\r\n\tc.b = texture2D(tDiffuse, coords + vec2(0.866, -0.5) * texelSize * fringe * blur).b;\r\n\r\n\t// Calculate the luminance of the constructed colour.\r\n\tfloat luminance = dot(c.rgb, LUM_COEFF);\r\n\tfloat threshold = max((luminance - luminanceThreshold) * luminanceGain, 0.0);\r\n\r\n\treturn c + mix(vec3(0.0), c, threshold * blur);\r\n\r\n}\r\n\r\nfloat readDepth(sampler2D depthSampler, vec2 coord) {\r\n\r\n\tfloat fragCoordZ = texture2D(depthSampler, coord).x;\r\n\tfloat viewZ = perspectiveDepthToViewZ(fragCoordZ, cameraNear, cameraFar);\r\n\r\n\treturn viewZToOrthoDepth(viewZ, cameraNear, cameraFar);\r\n\r\n}\r\n\r\nfloat linearize(float depth) {\r\n\r\n\treturn -cameraFar * cameraNear / (depth * (cameraFar - cameraNear) - cameraFar);\r\n\r\n}\r\n\r\nfloat gather(float i, float j, float ringSamples, inout vec3 color, float w, float h, float blur) {\r\n\r\n\tconst float TWO_PI = 6.28318531;\r\n\r\n\tfloat step = TWO_PI / ringSamples;\r\n\tfloat pw = cos(j * step) * i;\r\n\tfloat ph = sin(j * step) * i;\r\n\r\n\t#ifdef PENTAGON\r\n\r\n\t\tfloat p = penta(vec2(pw, ph));\r\n\r\n\t#else\r\n\r\n\t\tfloat p = 1.0;\r\n\r\n\t#endif\r\n\r\n\tcolor += processTexel(vUv + vec2(pw * w, ph * h), blur) * mix(1.0, i / RINGS_FLOAT, bias) * p;\r\n\r\n\treturn mix(1.0, i / RINGS_FLOAT, bias) * p;\r\n\r\n}\r\n\r\nvoid main() {\r\n\r\n\tfloat depth = linearize(readDepth(tDepth, vUv));\r\n\r\n\t#ifdef SHADER_FOCUS\r\n\r\n\t\tfloat fDepth = linearize(readDepth(tDepth, focusCoords));\r\n\r\n\t#else\r\n\r\n\t\tfloat fDepth = focalDepth;\r\n\r\n\t#endif\r\n\r\n\t#ifdef MANUAL_DOF\r\n\r\n\t\tconst float nDoFStart = 1.0; \r\n\t\tconst float nDoFDist = 2.0;\r\n\t\tconst float fDoFStart = 1.0;\r\n\t\tconst float fDoFDist = 3.0;\r\n\r\n\t\tfloat focalPlane = depth - fDepth;\r\n\t\tfloat farDoF = (focalPlane - fDoFStart) / fDoFDist;\r\n\t\tfloat nearDoF = (-focalPlane - nDoFStart) / nDoFDist;\r\n\r\n\t\tfloat blur = (focalPlane > 0.0) ? farDoF : nearDoF;\r\n\r\n\t#else\r\n\r\n\t\tconst float CIRCLE_OF_CONFUSION = 0.03; // 35mm film = 0.03mm CoC.\r\n\r\n\t\tfloat focalPlaneMM = fDepth * 1000.0;\r\n\t\tfloat depthMM = depth * 1000.0;\r\n\r\n\t\tfloat focalPlane = (depthMM * focalLength) / (depthMM - focalLength);\r\n\t\tfloat farDoF = (focalPlaneMM * focalLength) / (focalPlaneMM - focalLength);\r\n\t\tfloat nearDoF = (focalPlaneMM - focalLength) / (focalPlaneMM * fStop * CIRCLE_OF_CONFUSION);\r\n\r\n\t\tfloat blur = abs(focalPlane - farDoF) * nearDoF;\r\n\r\n\t#endif\r\n\r\n\tblur = clamp(blur, 0.0, 1.0);\r\n\r\n\t// Dithering.\r\n\tvec2 noise = rand(vUv) * ditherStrength * blur;\r\n\r\n\tfloat blurFactorX = texelSize.x * blur * maxBlur + noise.x;\r\n\tfloat blurFactorY = texelSize.y * blur * maxBlur + noise.y;\r\n\r\n\tconst int MAX_RING_SAMPLES = RINGS_INT * SAMPLES_INT;\r\n\r\n\t// Calculation of final color.\r\n\tvec4 color;\r\n\r\n\tif(blur < 0.05) {\r\n\r\n\t\tcolor = texture2D(tDiffuse, vUv);\r\n\r\n\t} else {\r\n\r\n\t\tcolor = texture2D(tDiffuse, vUv);\r\n\r\n\t\tfloat s = 1.0;\r\n\t\tint ringSamples;\r\n\r\n\t\tfor(int i = 1; i <= RINGS_INT; ++i) {\r\n\r\n\t\t\tringSamples = i * SAMPLES_INT;\r\n\r\n\t\t\t// Constant loop.\r\n\t\t\tfor(int j = 0; j < MAX_RING_SAMPLES; ++j) {\r\n\r\n\t\t\t\t// Break earlier.\r\n\t\t\t\tif(j >= ringSamples) { break; }\r\n\r\n\t\t\t\ts += gather(float(i), float(j), float(ringSamples), color.rgb, blurFactorX, blurFactorY, blur);\r\n\r\n\t\t\t}\r\n\r\n\t\t}\r\n\r\n\t\tcolor.rgb /= s; // Divide by sample count.\r\n\r\n\t}\r\n\r\n\t#ifdef SHOW_FOCUS\r\n\r\n\t\tcolor.rgb = debugFocus(color.rgb, blur, depth);\r\n\r\n\t#endif\r\n\r\n\t#ifdef VIGNETTE\r\n\r\n\t\tcolor.rgb *= vignette();\r\n\r\n\t#endif\r\n\r\n\tgl_FragColor = color;\r\n\r\n}\r\n";

	var vertex$2 = "varying vec2 vUv;\r\n\r\nvoid main() {\r\n\r\n\tvUv = uv;\r\n\tgl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\r\n\r\n}\r\n";

	/**
	 * Depth of Field shader version 2.
	 *
	 * Original code by Martins Upitis:
	 *  http://blenderartists.org/forum/showthread.php?237488-GLSL-depth-of-field-with-bokeh-v2-4-(update)
	 *
	 * @class Bokeh2Material
	 * @submodule materials
	 * @extends ShaderMaterial
	 * @constructor
	 * @param {PerspectiveCamera} [camera] - The main camera.
	 * @param {Object} [options] - Additional options.
	 * @param {Vector2} [options.texelSize] - The absolute screen texel size.
	 * @param {Boolean} [options.showFocus=false] - Whether the focus point should be highlighted.
	 * @param {Boolean} [options.manualDoF=false] - Enables manual depth of field blur.
	 * @param {Boolean} [options.vignette=false] - Enables a vignette effect.
	 * @param {Boolean} [options.pentagon=false] - Enable to use a pentagonal shape to scale gathered texels.
	 * @param {Boolean} [options.shaderFocus=true] - Disable if you compute your own focalDepth (in metres!).
	 * @param {Boolean} [options.noise=true] - Disable if you don't want noise patterns for dithering.
	 */

	class Bokeh2Material extends THREE.ShaderMaterial {

		constructor(camera, options) {

			if(options === undefined) { options = {}; }
			if(options.rings === undefined) { options.rings = 3; }
			if(options.samples === undefined) { options.samples = 2; }
			if(options.showFocus === undefined) { options.showFocus = false; }
			if(options.showFocus === undefined) { options.showFocus = false; }
			if(options.manualDoF === undefined) { options.manualDoF = false; }
			if(options.vignette === undefined) { options.vignette = false; }
			if(options.pentagon === undefined) { options.pentagon = false; }
			if(options.shaderFocus === undefined) { options.shaderFocus = true; }
			if(options.noise === undefined) { options.noise = true; }

			super({

				type: "Bokeh2Material",

				defines: {

					RINGS_INT: options.rings.toFixed(0),
					RINGS_FLOAT: options.rings.toFixed(1),
					SAMPLES_INT: options.samples.toFixed(0),
					SAMPLES_FLOAT: options.samples.toFixed(1)

				},

				uniforms: {

					tDiffuse: {value: null},
					tDepth: {value: null},

					texelSize: {value: new THREE.Vector2()},
					halfTexelSize: {value: new THREE.Vector2()},

					cameraNear: {value: 0.1},
					cameraFar: {value: 2000},

					focalLength: {value: 24.0},
					fStop: {value: 0.9},

					maxBlur: {value: 1.0},
					luminanceThreshold: {value: 0.5},
					luminanceGain: {value: 2.0},
					bias: {value: 0.5},
					fringe: {value: 0.7},
					ditherStrength: {value: 0.0001},

					focusCoords: {value: new THREE.Vector2(0.5, 0.5)},
					focalDepth: {value: 1.0}

				},

				fragmentShader: fragment$2,
				vertexShader: vertex$2

			});

			if(options.showFocus) { this.defines.SHOW_FOCUS = "1"; }
			if(options.manualDoF) { this.defines.MANUAL_DOF = "1"; }
			if(options.vignette) { this.defines.VIGNETTE = "1"; }
			if(options.pentagon) { this.defines.PENTAGON = "1"; }
			if(options.shaderFocus) { this.defines.SHADER_FOCUS = "1"; }
			if(options.noise) { this.defines.NOISE = "1"; }

			if(options.texelSize !== undefined) { this.setTexelSize(options.texelSize.x, options.texelSize.y); }
			if(camera !== undefined) { this.adoptCameraSettings(camera); }

		}

		/**
		 * Sets the texel size.
		 *
		 * @method setTexelSize
		 * @param {Number} x - The texel width.
		 * @param {Number} y - The texel height.
		 */

		setTexelSize(x, y) {

			this.uniforms.texelSize.value.set(x, y);
			this.uniforms.halfTexelSize.value.set(x, y).multiplyScalar(0.5);

		}

		/**
		 * Adopts the near and far plane and the focal length of the given camera.
		 *
		 * @method adoptCameraSettings
		 * @param {PerspectiveCamera} camera - The main camera.
		 */

		adoptCameraSettings(camera) {

			this.uniforms.cameraNear.value = camera.near;
			this.uniforms.cameraFar.value = camera.far;
			this.uniforms.focalLength.value = camera.getFocalLength(); // unit: mm.

		}

	}

	var fragment$3 = "uniform sampler2D texture1;\r\nuniform sampler2D texture2;\r\n\r\nuniform float opacity1;\r\nuniform float opacity2;\r\n\r\nvarying vec2 vUv;\r\n\r\nvoid main() {\r\n\r\n\tvec4 texel1 = texture2D(texture1, vUv);\r\n\tvec4 texel2 = texture2D(texture2, vUv);\r\n\r\n\t#ifdef INVERT_TEX1\r\n\r\n\t\ttexel1.rgb = vec3(1.0) - texel1.rgb;\r\n\r\n\t#endif\r\n\r\n\t#ifdef INVERT_TEX2\r\n\r\n\t\ttexel2.rgb = vec3(1.0) - texel2.rgb;\r\n\r\n\t#endif\r\n\r\n\tgl_FragColor = opacity1 * texel1 + opacity2 * texel2;\r\n\r\n}\r\n";

	var vertex$3 = "varying vec2 vUv;\r\n\r\nvoid main() {\r\n\r\n\tvUv = uv;\r\n\tgl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\r\n\r\n}\r\n";

	/**
	 * A material for combining two textures.
	 *
	 * @class CombineMaterial
	 * @submodule materials
	 * @extends ShaderMaterial
	 * @constructor
	 * @param {Boolean} [invertTexture1=false] - Invert the first texture's rgb values.
	 * @param {Boolean} [invertTexture2=false] - Invert the second texture's rgb values.
	 */

	class CombineMaterial extends THREE.ShaderMaterial {

		constructor(invertTexture1, invertTexture2) {

			super({

				type: "CombineMaterial",

				uniforms: {

					texture1: {value: null},
					texture2: {value: null},

					opacity1: {value: 1.0},
					opacity2: {value: 1.0}

				},

				fragmentShader: fragment$3,
				vertexShader: vertex$3

			});

			if(invertTexture1) { this.defines.INVERT_TEX1 = "1"; }
			if(invertTexture2) { this.defines.INVERT_TEX2 = "1"; }

		}

	}

	var fragment$4 = "uniform sampler2D tDiffuse;\r\n\r\nvarying vec2 vUv0;\r\nvarying vec2 vUv1;\r\nvarying vec2 vUv2;\r\nvarying vec2 vUv3;\r\n\r\nvoid main() {\r\n\r\n\t// Sample top left texel.\r\n\tvec4 sum = texture2D(tDiffuse, vUv0);\r\n\r\n\t// Sample top right texel.\r\n\tsum += texture2D(tDiffuse, vUv1);\r\n\r\n\t// Sample bottom right texel.\r\n\tsum += texture2D(tDiffuse, vUv2);\r\n\r\n\t// Sample bottom left texel.\r\n\tsum += texture2D(tDiffuse, vUv3);\r\n\r\n\t// Compute the average.\r\n\tgl_FragColor = sum * 0.25;\r\n\r\n}\r\n";

	var vertex$4 = "uniform vec2 texelSize;\r\nuniform vec2 halfTexelSize;\r\nuniform float kernel;\r\n\r\nvarying vec2 vUv0;\r\nvarying vec2 vUv1;\r\nvarying vec2 vUv2;\r\nvarying vec2 vUv3;\r\n\r\nvoid main() {\r\n\r\n\tvec2 dUv = (texelSize * vec2(kernel)) + halfTexelSize;\r\n\r\n\tvUv0 = vec2(uv.x - dUv.x, uv.y + dUv.y);\r\n\tvUv1 = vec2(uv.x + dUv.x, uv.y + dUv.y);\r\n\tvUv2 = vec2(uv.x + dUv.x, uv.y - dUv.y);\r\n\tvUv3 = vec2(uv.x - dUv.x, uv.y - dUv.y);\r\n\r\n\tgl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\r\n\r\n}\r\n";

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
	 *  https://developer.apple.com/library/ios/documentation/3DDrawing/Conceptual/OpenGLES_ProgrammingGuide/BestPracticesforShaders/BestPracticesforShaders.html#//apple_ref/doc/uid/TP40008793-CH7-SW15
	 *
	 * @class ConvolutionMaterial
	 * @submodule materials
	 * @extends ShaderMaterial
	 * @constructor
	 * @param {Vector2} [texelSize] - The absolute screen texel size.
	 */

	class ConvolutionMaterial extends THREE.ShaderMaterial {

		constructor(texelSize) {

			super({

				type: "ConvolutionMaterial",

				uniforms: {

					tDiffuse: {value: null},
					texelSize: {value: new THREE.Vector2()},
					halfTexelSize: {value: new THREE.Vector2()},
					kernel: {value: 0.0}

				},

				fragmentShader: fragment$4,
				vertexShader: vertex$4

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
			 * @property scale
			 * @type Number
			 * @default 1.0
			 */

			this.scale = 1.0;

			/**
			 * The current kernel.
			 *
			 * @property currentKernel
			 * @type Number
			 * @private
			 */

			this.currentKernel = 0;

			if(texelSize !== undefined) { this.setTexelSize(texelSize.x, texelSize.y); }

		}

		/**
		 * Sets the texel size.
		 *
		 * @method setTexelSize
		 * @param {Number} x - The texel width.
		 * @param {Number} y - The texel height.
		 */

		setTexelSize(x, y) {

			this.uniforms.texelSize.value.set(x, y);
			this.uniforms.halfTexelSize.value.set(x, y).multiplyScalar(0.5);

		}

		/**
		 * Adjusts the kernel for the next blur pass.
		 * Call this method before each render iteration.
		 *
		 * @method adjustKernel
		 */

		adjustKernel() {

			this.uniforms.kernel.value = this.kernels[this.currentKernel] * this.scale;
			if(++this.currentKernel >= this.kernels.length) { this.currentKernel = 0; }

		}

	}

	var fragment$5 = "uniform sampler2D tDiffuse;\r\nuniform float opacity;\r\n\r\nvarying vec2 vUv;\r\n\r\nvoid main() {\r\n\r\n\tvec4 texel = texture2D(tDiffuse, vUv);\r\n\tgl_FragColor = opacity * texel;\r\n\r\n}\r\n";

	var vertex$5 = "varying vec2 vUv;\r\n\r\nvoid main() {\r\n\r\n\tvUv = uv;\r\n\tgl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\r\n\r\n}\r\n";

	/**
	 * A simple copy shader material.
	 *
	 * @class CopyMaterial
	 * @submodule materials
	 * @extends ShaderMaterial
	 * @constructor
	 */

	class CopyMaterial extends THREE.ShaderMaterial {

		constructor() {

			super({

				type: "CopyMaterial",

				uniforms: {

					tDiffuse: {value: null},
					opacity: {value: 1.0}

				},

				fragmentShader: fragment$5,
				vertexShader: vertex$5

			});

		}

	}

	var fragment$6 = "uniform sampler2D tDiffuse;\r\n\r\nuniform float angle;\r\nuniform float scale;\r\nuniform float intensity;\r\n\r\nvarying vec2 vUv;\r\nvarying vec2 vUvPattern;\r\n\r\nfloat pattern() {\r\n\r\n\tfloat s = sin(angle);\r\n\tfloat c = cos(angle);\r\n\r\n\tvec2 point = vec2(c * vUvPattern.x - s * vUvPattern.y, s * vUvPattern.x + c * vUvPattern.y) * scale;\r\n\r\n\treturn (sin(point.x) * sin(point.y)) * 4.0;\r\n\r\n}\r\n\r\nvoid main() {\r\n\r\n\tvec4 texel = texture2D(tDiffuse, vUv);\r\n\tvec3 color = texel.rgb;\r\n\r\n\t#ifdef AVERAGE\r\n\r\n\t\tcolor = vec3((color.r + color.g + color.b) / 3.0);\r\n\r\n\t#endif\r\n\r\n\tcolor = vec3(color * 10.0 - 5.0 + pattern());\r\n\tcolor = texel.rgb + (color - texel.rgb) * intensity;\r\n\r\n\tgl_FragColor = vec4(color, texel.a);\r\n\r\n}\r\n";

	var vertex$6 = "uniform vec4 offsetRepeat;\r\n\r\nvarying vec2 vUv;\r\nvarying vec2 vUvPattern;\r\n\r\nvoid main() {\r\n\r\n\tvUv = uv;\r\n\tvUvPattern = uv * offsetRepeat.zw + offsetRepeat.xy;\r\n\tgl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\r\n\r\n}\r\n";

	/**
	 * A dot screen shader material.
	 *
	 * @class DotScreenMaterial
	 * @submodule materials
	 * @extends ShaderMaterial
	 * @constructor
	 * @param {Boolean} [average] - Whether the shader should output the colour average (black and white).
	 */

	class DotScreenMaterial extends THREE.ShaderMaterial {

		constructor(average) {

			super({

				type: "DotScreenMaterial",

				uniforms: {

					tDiffuse: {value: null},

					angle: {value: 1.57},
					scale: {value: 1.0},
					intensity: {value: 1.0},

					offsetRepeat: {value: new THREE.Vector4(0.5, 0.5, 1.0, 1.0)}

				},

				fragmentShader: fragment$6,
				vertexShader: vertex$6

			});

		}

		if(average) { this.defines.AVERAGE = "1"; }

	}

	var fragment$7 = "uniform sampler2D tDiffuse;\r\nuniform float time;\r\n\r\nvarying vec2 vUv;\r\n\r\n#ifdef NOISE\r\n\r\n\tuniform float noiseIntensity;\r\n\r\n#endif\r\n\r\n#ifdef SCANLINES\r\n\r\n\tuniform float scanlineIntensity;\r\n\tuniform float scanlineCount;\r\n\r\n#endif\r\n\r\n#ifdef GREYSCALE\r\n\r\n\tuniform float greyscaleIntensity;\r\n\r\n\tconst vec3 LUM_COEFF = vec3(0.299, 0.587, 0.114);\r\n\r\n#elif defined(SEPIA)\r\n\r\n\tuniform float sepiaIntensity;\r\n\r\n#endif\r\n\r\n#ifdef VIGNETTE\r\n\r\n\tuniform float vignetteOffset;\r\n\tuniform float vignetteDarkness;\r\n\r\n#endif\r\n\r\nvoid main() {\r\n\r\n\tvec4 texel = texture2D(tDiffuse, vUv);\r\n\tvec3 color = texel.rgb;\r\n\r\n\t#ifdef NOISE\r\n\r\n\t\tfloat x = vUv.x * vUv.y * time * 1000.0;\r\n\t\tx = mod(x, 13.0) * mod(x, 123.0);\r\n\t\tx = mod(x, 0.01);\r\n\r\n\t\tcolor += texel.rgb * clamp(0.1 + x * 100.0, 0.0, 1.0) * noiseIntensity;\r\n\r\n\t#endif\r\n\r\n\t#ifdef SCANLINES\r\n\r\n\t\tvec2 sl = vec2(sin(vUv.y * scanlineCount), cos(vUv.y * scanlineCount));\r\n\t\tcolor += texel.rgb * vec3(sl.x, sl.y, sl.x) * scanlineIntensity;\r\n\r\n\t#endif\r\n\r\n\t#ifdef GREYSCALE\r\n\r\n\t\tcolor = mix(color, vec3(dot(color, LUM_COEFF)), greyscaleIntensity);\r\n\r\n\t#elif defined(SEPIA)\r\n\r\n\t\tvec3 c = color.rgb;\r\n\r\n\t\tcolor.r = dot(c, vec3(1.0 - 0.607 * sepiaIntensity, 0.769 * sepiaIntensity, 0.189 * sepiaIntensity));\r\n\t\tcolor.g = dot(c, vec3(0.349 * sepiaIntensity, 1.0 - 0.314 * sepiaIntensity, 0.168 * sepiaIntensity));\r\n\t\tcolor.b = dot(c, vec3(0.272 * sepiaIntensity, 0.534 * sepiaIntensity, 1.0 - 0.869 * sepiaIntensity));\r\n\r\n\t#endif\r\n\r\n\t#ifdef VIGNETTE\r\n\r\n\tconst vec2 CENTER = vec2(0.5);\r\n\r\n\t\t#ifdef ESKIL\r\n\r\n\t\t\tvec2 uv = (vUv - CENTER) * vec2(vignetteOffset);\r\n\t\t\tcolor = mix(color.rgb, vec3(1.0 - vignetteDarkness), dot(uv, uv));\r\n\r\n\t\t#else\r\n\r\n\t\t\tfloat dist = distance(vUv, CENTER);\r\n\t\t\tcolor *= smoothstep(0.8, vignetteOffset * 0.799, dist * (vignetteDarkness + vignetteOffset));\r\n\r\n\t\t#endif\t\t\r\n\r\n\t#endif\r\n\r\n\tgl_FragColor = vec4(clamp(color, 0.0, 1.0), texel.a);\r\n\r\n}\r\n";

	var vertex$7 = "varying vec2 vUv;\r\n\r\nvoid main() {\r\n\r\n\tvUv = uv;\r\n\tgl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\r\n\r\n}\r\n";

	/**
	 * A cinematic shader that provides the following effects:
	 *  - Film Grain
	 *  - Scanlines
	 *  - Vignette
	 *  - Greyscale
	 *  - Sepia
	 *
	 * Original scanlines algorithm by Pat "Hawthorne" Shearon.
	 * http://www.truevision3d.com/forums/showcase/staticnoise_colorblackwhite_scanline_shaders-t18698.0.html
	 *
	 * Optimized scanlines + noise version with intensity scaling by Georg "Leviathan" Steinrohder.
	 * This version is provided under a Creative Commons Attribution 3.0 License
	 * http://creativecommons.org/licenses/by/3.0/
	 *
	 * The sepia effect is based on:
	 *  https://github.com/evanw/glfx.js
	 *
	 * The vignette code is based on PaintEffect postprocess from ro.me:
	 *  http://code.google.com/p/3-dreams-of-black/source/browse/deploy/js/effects/PaintEffect.js
	 *
	 * @class FilmMaterial
	 * @submodule materials
	 * @extends ShaderMaterial
	 * @constructor
	 * @param {Object} [options] - The options.
	 * @param {Boolean} [options.greyscale=false] - Enable greyscale effect. Greyscale and sepia are mutually exclusive.
	 * @param {Boolean} [options.sepia=false] - Enable sepia effect. Greyscale and sepia are mutually exclusive.
	 * @param {Boolean} [options.vignette=false] - Apply vignette effect.
	 * @param {Boolean} [options.eskil=false] - Use Eskil's vignette approach. The default looks dusty while Eskil looks burned out.
	 * @param {Boolean} [options.scanlines=true] - Show scanlines.
	 * @param {Boolean} [options.noise=true] - Show noise-based film grain.
	 * @param {Number} [options.noiseIntensity=0.5] - The noise intensity. 0.0 to 1.0.
	 * @param {Number} [options.scanlineIntensity=0.05] - The scanline intensity. 0.0 to 1.0.
	 * @param {Number} [options.greyscaleIntensity=1.0] - The intensity of the greyscale effect.
	 * @param {Number} [options.sepiaIntensity=1.0] - The intensity of the sepia effect.
	 * @param {Number} [options.vignetteOffset=1.0] - The offset of the vignette effect.
	 * @param {Number} [options.vignetteDarkness=1.0] - The darkness of the vignette effect.
	 */

	class FilmMaterial extends THREE.ShaderMaterial {

		constructor(options) {

			if(options === undefined) { options = {}; }

			super({

				type: "FilmMaterial",

				uniforms: {

					tDiffuse: {value: null},
					time: {value: 0.0},

					noiseIntensity: {value: (options.noiseIntensity !== undefined) ? options.noiseIntensity : 0.5},
					scanlineIntensity: {value: (options.scanlineIntensity !== undefined) ? options.scanlineIntensity : 0.05},
					scanlineCount: {value: 0.0},

					greyscaleIntensity: {value: (options.greyscaleIntensity !== undefined) ? options.greyscaleIntensity : 1.0},
					sepiaIntensity: {value: (options.sepiaIntensity !== undefined) ? options.sepiaIntensity : 1.0},

					vignetteOffset: {value: (options.vignetteOffset !== undefined) ? options.vignetteOffset : 1.0},
					vignetteDarkness: {value: (options.vignetteDarkness !== undefined) ? options.vignetteDarkness : 1.0}

				},

				fragmentShader: fragment$7,
				vertexShader: vertex$7

			});

			// These are enabled by default.
			if(options.scanlines === undefined || options.scanlines) { this.defines.SCANLINES = "1"; }
			if(options.noise === undefined || options.noise) { this.defines.NOISE = "1"; }

			if(options.greyscale) { this.defines.GREYSCALE = "1"; }
			if(options.sepia) { this.defines.SEPIA = "1"; }
			if(options.vignette) { this.defines.VIGNETTE = "1"; }
			if(options.eskil) { this.defines.ESKIL = "1"; }

		}

	}

	var fragment$8 = "uniform sampler2D tDiffuse;\r\nuniform sampler2D tPerturb;\r\n\r\nuniform bool active;\r\n\r\nuniform float amount;\r\nuniform float angle;\r\nuniform float seed;\r\nuniform float seedX;\r\nuniform float seedY;\r\nuniform float distortionX;\r\nuniform float distortionY;\r\nuniform float colS;\r\n\r\nvarying vec2 vUv;\r\n\r\nfloat rand(vec2 tc) {\r\n\r\n\tconst float a = 12.9898;\r\n\tconst float b = 78.233;\r\n\tconst float c = 43758.5453;\r\n\r\n\tfloat dt = dot(tc, vec2(a, b));\r\n\tfloat sn = mod(dt, 3.14);\r\n\r\n\treturn fract(sin(sn) * c);\r\n\r\n}\r\n\r\nvoid main() {\r\n\r\n\tvec2 coord = vUv;\r\n\r\n\tfloat xs, ys;\r\n\tvec4 normal;\r\n\r\n\tvec2 offset;\r\n\tvec4 cr, cga, cb;\r\n\tvec4 snow, color;\r\n\r\n\tfloat sx, sy;\r\n\r\n\tif(active) {\r\n\r\n\t\txs = floor(gl_FragCoord.x / 0.5);\r\n\t\tys = floor(gl_FragCoord.y / 0.5);\r\n\r\n\t\tnormal = texture2D(tPerturb, coord * seed * seed);\r\n\r\n\t\tif(coord.y < distortionX + colS && coord.y > distortionX - colS * seed) {\r\n\r\n\t\t\tsx = clamp(ceil(seedX), 0.0, 1.0);\r\n\t\t\tcoord.y = sx * (1.0 - (coord.y + distortionY)) + (1.0 - sx) * distortionY;\r\n\r\n\t\t}\r\n\r\n\t\tif(coord.x < distortionY + colS && coord.x > distortionY - colS * seed) {\r\n\r\n\t\t\tsy = clamp(ceil(seedY), 0.0, 1.0);\r\n\t\t\tcoord.x = sy * distortionX + (1.0 - sy) * (1.0 - (coord.x + distortionX));\r\n\r\n\t\t}\r\n\r\n\t\tcoord.x += normal.x * seedX * (seed / 5.0);\r\n\t\tcoord.y += normal.y * seedY * (seed / 5.0);\r\n\r\n\t\toffset = amount * vec2(cos(angle), sin(angle));\r\n\r\n\t\tcr = texture2D(tDiffuse, coord + offset);\r\n\t\tcga = texture2D(tDiffuse, coord);\r\n\t\tcb = texture2D(tDiffuse, coord - offset);\r\n\r\n\t\tcolor = vec4(cr.r, cga.g, cb.b, cga.a);\r\n\t\tsnow = 200.0 * amount * vec4(rand(vec2(xs * seed, ys * seed * 50.0)) * 0.2);\r\n\t\tcolor += snow;\r\n\r\n\t} else {\r\n\r\n\t\tcolor = texture2D(tDiffuse, vUv);\r\n\r\n\t}\r\n\r\n\tgl_FragColor = color;\r\n\r\n}\r\n";

	var vertex$8 = "varying vec2 vUv;\r\n\r\nvoid main() {\r\n\r\n\tvUv = uv;\r\n\tgl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\r\n\r\n}\r\n";

	/**
	 * A glitch shader material.
	 * Based on https://github.com/staffantan/unityglitch
	 *
	 * @class GlitchMaterial
	 * @submodule materials
	 * @extends ShaderMaterial
	 * @constructor
	 */

	class GlitchMaterial extends THREE.ShaderMaterial {

		constructor() {

			super({

				type: "GlitchMaterial",

				uniforms: {

					tDiffuse: {value: null},
					tPerturb: {value: null},

					active: {value: 1},

					amount: {value: 0.8},
					angle: {value: 0.02},
					seed: {value: 0.02},
					seedX: {value: 0.02},
					seedY: {value: 0.02},
					distortionX: {value: 0.5},
					distortionY: {value: 0.6},
					colS: {value: 0.05}

				},

				fragmentShader: fragment$8,
				vertexShader: vertex$8

			});

		}

	}

	var fragment$9 = "uniform sampler2D tDiffuse;\r\nuniform vec3 lightPosition;\r\n\r\nuniform float exposure;\r\nuniform float decay;\r\nuniform float density;\r\nuniform float weight;\r\nuniform float clampMax;\r\n\r\nvarying vec2 vUv;\r\n\r\nvoid main() {\r\n\r\n\tvec2 texCoord = vUv;\r\n\r\n\t// Calculate vector from pixel to light source in screen space.\r\n\tvec2 deltaTexCoord = texCoord - lightPosition.st;\r\n\tdeltaTexCoord *= 1.0 / NUM_SAMPLES_FLOAT * density;\r\n\r\n\t// A decreasing illumination factor.\r\n\tfloat illuminationDecay = 1.0;\r\n\r\n\tvec4 sample;\r\n\tvec4 color = vec4(0.0);\r\n\r\n\t// Estimate the probability of occlusion at each pixel by summing samples along a ray to the light source.\r\n\tfor(int i = 0; i < NUM_SAMPLES_INT; ++i) {\r\n\r\n\t\ttexCoord -= deltaTexCoord;\r\n\t\tsample = texture2D(tDiffuse, texCoord);\r\n\r\n\t\t// Apply sample attenuation scale/decay factors.\r\n\t\tsample *= illuminationDecay * weight;\r\n\r\n\t\tcolor += sample;\r\n\r\n\t\t// Update exponential decay factor.\r\n\t\tilluminationDecay *= decay;\r\n\r\n\t}\r\n\r\n\tgl_FragColor = clamp(color * exposure, 0.0, clampMax);\r\n\r\n}\r\n";

	var vertex$9 = "varying vec2 vUv;\r\n\r\nvoid main() {\r\n\r\n\tvUv = uv;\r\n\tgl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\r\n\r\n}\r\n";

	/**
	 * A crepuscular rays shader material.
	 *
	 * References:
	 *
	 * Thibaut Despoulain, 2012:
	 *  (WebGL) Volumetric Light Approximation in Three.js
	 *  http://bkcore.com/blog/3d/webgl-three-js-volumetric-light-godrays.html
	 *
	 * Nvidia, GPU Gems 3, 2008:
	 *  Chapter 13. Volumetric Light Scattering as a Post-Process
	 *  http://http.developer.nvidia.com/GPUGems3/gpugems3_ch13.html
	 *
	 * @class GodRaysMaterial
	 * @submodule materials
	 * @extends ShaderMaterial
	 * @constructor
	 */

	class GodRaysMaterial extends THREE.ShaderMaterial {

		constructor() {

			super({

				type: "GodRaysMaterial",

				defines: {

					NUM_SAMPLES_FLOAT: "60.0",
					NUM_SAMPLES_INT: "60"

				},

				uniforms: {

					tDiffuse: {value: null},
					lightPosition: {value: null},

					exposure: {value: 0.6},
					decay: {value: 0.93},
					density: {value: 0.96},
					weight: {value: 0.4},
					clampMax: {value: 1.0}

				},

				fragmentShader: fragment$9,
				vertexShader: vertex$9

			});

		}

	}

	var fragment$10 = "uniform sampler2D tDiffuse;\r\nuniform float distinction;\r\nuniform vec2 range;\r\n\r\nvarying vec2 vUv;\r\n\r\nvoid main() {\r\n\r\n\tconst vec4 LUM_COEFF = vec4(0.299, 0.587, 0.114, 0.0);\r\n\r\n\tvec4 texel = texture2D(tDiffuse, vUv);\r\n\tfloat v = dot(texel, LUM_COEFF);\r\n\r\n\t#ifdef RANGE\r\n\r\n\t\tfloat low = step(range.x, v);\r\n\t\tfloat high = step(v, range.y);\r\n\r\n\t\t// Apply the mask.\r\n\t\tv *= low * high;\r\n\r\n\t#endif\r\n\r\n\tv = pow(abs(v), distinction);\r\n\r\n\t#ifdef COLOR\r\n\r\n\t\tgl_FragColor = vec4(texel.rgb * v, texel.a);\r\n\r\n\t#else\r\n\r\n\t\tgl_FragColor = vec4(v, v, v, texel.a);\r\n\r\n\t#endif\r\n\r\n}\r\n";

	var vertex$10 = "varying vec2 vUv;\r\n\r\nvoid main() {\r\n\r\n\tvUv = uv;\r\n\tgl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\r\n\r\n}\r\n";

	/**
	 * A luminance shader material.
	 *
	 * This shader produces a greyscale luminance map. 
	 * It can also be configured to output colors that are scaled with their 
	 * respective luminance value. Additionally, a range may be provided to 
	 * mask out undesired texels.
	 *
	 * The alpha channel will remain unaffected in all cases.
	 *
	 * Luminance range reference:
	 *  https://cycling74.com/2007/05/23/your-first-shader/#.Vty9FfkrL4Z
	 *
	 * @class LuminosityMaterial
	 * @submodule materials
	 * @extends ShaderMaterial
	 * @constructor
	 * @params {Boolean} [color=false] - Defines whether the shader should output colours scaled with their luminance value.
	 * @params {Vector2} [range] - If provided, the shader will mask out texels that aren't in the specified range.
	 */

	class LuminosityMaterial extends THREE.ShaderMaterial {

		constructor(color, range) {

			super({

				type: "LuminosityMaterial",

				uniforms: {

					tDiffuse: {value: null},
					distinction: {value: 1.0},
					range: {value: (range !== undefined) ? range : new THREE.Vector2()}

				},

				fragmentShader: fragment$10,
				vertexShader: vertex$10

			});

			if(color !== undefined) { this.defines.COLOR = "1"; }
			if(range !== undefined) { this.defines.RANGE = "1"; }

		}

	}

	var fragment$11 = "uniform sampler2D tDiffuse;\r\nuniform sampler2D tWeights;\r\n\r\nuniform vec2 texelSize;\r\n\r\nvarying vec2 vUv;\r\nvarying vec4 vOffset;\r\n\r\nvoid main() {\r\n\r\n\t// Fetch the blending weights for current pixel.\r\n\tvec4 a;\r\n\ta.xz = texture2D(tWeights, vUv).xz;\r\n\ta.y = texture2D(tWeights, vOffset.zw).g;\r\n\ta.w = texture2D(tWeights, vOffset.xy).a;\r\n\r\n\tvec4 color;\r\n\r\n\t// Check if there is any blending weight with a value greater than 0.0.\r\n\tif(dot(a, vec4(1.0)) < 1e-5) {\r\n\r\n\t\tcolor = texture2D(tDiffuse, vUv, 0.0);\r\n\r\n\t} else {\r\n\r\n\t\t/* Up to four lines can be crossing a pixel (one through each edge). We favor\r\n\t\t * blending by choosing the line with the maximum weight for each direction.\r\n\t\t */\r\n\r\n\t\tvec2 offset;\r\n\t\toffset.x = a.a > a.b ? a.a : -a.b; // Left vs. right.\r\n\t\toffset.y = a.g > a.r ? -a.g : a.r; // Top vs. bottom (changed signs).\r\n\r\n\t\t// Then we go in the direction that has the maximum weight (horizontal vs. vertical).\r\n\t\tif(abs(offset.x) > abs(offset.y)) {\r\n\r\n\t\t\toffset.y = 0.0;\r\n\r\n\t\t} else {\r\n\r\n\t\t\toffset.x = 0.0;\r\n\r\n\t\t}\r\n\r\n\t\t// Fetch the opposite color and lerp by hand.\r\n\t\tcolor = texture2D(tDiffuse, vUv, 0.0);\r\n\t\tvec2 coord = vUv + sign(offset) * texelSize;\r\n\t\tvec4 oppositeColor = texture2D(tDiffuse, coord, 0.0);\r\n\t\tfloat s = abs(offset.x) > abs(offset.y) ? abs(offset.x) : abs(offset.y);\r\n\r\n\t\t// Gamma correction.\r\n\t\tcolor.rgb = pow(abs(color.rgb), vec3(2.2));\r\n\t\toppositeColor.rgb = pow(abs(oppositeColor.rgb), vec3(2.2));\r\n\t\tcolor = mix(color, oppositeColor, s);\r\n\t\tcolor.rgb = pow(abs(color.rgb), vec3(1.0 / 2.2));\r\n\r\n\t}\r\n\r\n\tgl_FragColor = color;\r\n\r\n}\r\n";

	var vertex$11 = "uniform vec2 texelSize;\r\n\r\nvarying vec2 vUv;\r\nvarying vec4 vOffset;\r\n\r\nvoid main() {\r\n\r\n\tvUv = uv;\r\n\r\n\tvOffset = uv.xyxy + texelSize.xyxy * vec4(1.0, 0.0, 0.0, -1.0); // Changed sign in W component.\r\n\r\n\tgl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\r\n\r\n}\r\n";

	/**
	 * Subpixel Morphological Antialiasing.
	 *
	 * This material is used to render the final antialiasing.
	 *
	 * @class SMAABlendMaterial
	 * @submodule materials
	 * @extends ShaderMaterial
	 * @constructor
	 * @param {Vector2} [texelSize] - The absolute screen texel size.
	 */

	class SMAABlendMaterial extends THREE.ShaderMaterial {

		constructor(texelSize) {

			super({

				type: "SMAABlendMaterial",

				uniforms: {

					tDiffuse: {value: null},
					tWeights: {value: null},
					texelSize: {value: (texelSize !== undefined) ? texelSize : new THREE.Vector2()}

				},

				fragmentShader: fragment$11,
				vertexShader: vertex$11

			});

		}

	}

	var fragment$12 = "uniform sampler2D tDiffuse;\r\n\r\nvarying vec2 vUv;\r\nvarying vec4 vOffset[3];\r\n\r\nvoid main() {\r\n\r\n\tconst vec2 THRESHOLD = vec2(EDGE_THRESHOLD);\r\n\r\n\t// Calculate color deltas.\r\n\tvec4 delta;\r\n\tvec3 c = texture2D(tDiffuse, vUv).rgb;\r\n\r\n\tvec3 cLeft = texture2D(tDiffuse, vOffset[0].xy).rgb;\r\n\tvec3 t = abs(c - cLeft);\r\n\tdelta.x = max(max(t.r, t.g), t.b);\r\n\r\n\tvec3 cTop = texture2D(tDiffuse, vOffset[0].zw).rgb;\r\n\tt = abs(c - cTop);\r\n\tdelta.y = max(max(t.r, t.g), t.b);\r\n\r\n\t// We do the usual threshold.\r\n\tvec2 edges = step(THRESHOLD, delta.xy);\r\n\r\n\t// Then discard if there is no edge.\r\n\tif(dot(edges, vec2(1.0)) == 0.0) {\r\n\r\n\t\tdiscard;\r\n\r\n\t}\r\n\r\n\t// Calculate right and bottom deltas.\r\n\tvec3 cRight = texture2D(tDiffuse, vOffset[1].xy).rgb;\r\n\tt = abs(c - cRight);\r\n\tdelta.z = max(max(t.r, t.g), t.b);\r\n\r\n\tvec3 cBottom  = texture2D(tDiffuse, vOffset[1].zw).rgb;\r\n\tt = abs(c - cBottom);\r\n\tdelta.w = max(max(t.r, t.g), t.b);\r\n\r\n\t// Calculate the maximum delta in the direct neighborhood.\r\n\tfloat maxDelta = max(max(max(delta.x, delta.y), delta.z), delta.w);\r\n\r\n\t// Calculate left-left and top-top deltas.\r\n\tvec3 cLeftLeft  = texture2D(tDiffuse, vOffset[2].xy).rgb;\r\n\tt = abs(c - cLeftLeft);\r\n\tdelta.z = max(max(t.r, t.g), t.b);\r\n\r\n\tvec3 cTopTop = texture2D(tDiffuse, vOffset[2].zw).rgb;\r\n\tt = abs(c - cTopTop);\r\n\tdelta.w = max(max(t.r, t.g), t.b);\r\n\r\n\t// Calculate the final maximum delta.\r\n\tmaxDelta = max(max(maxDelta, delta.z), delta.w);\r\n\r\n\t// Local contrast adaptation in action.\r\n\tedges.xy *= step(0.5 * maxDelta, delta.xy);\r\n\r\n\tgl_FragColor = vec4(edges, 0.0, 0.0);\r\n\r\n}\r\n";

	var vertex$12 = "uniform vec2 texelSize;\r\n\r\nvarying vec2 vUv;\r\nvarying vec4 vOffset[3];\r\n\r\nvoid main() {\r\n\r\n\tvUv = uv;\r\n\r\n\tvOffset[0] = uv.xyxy + texelSize.xyxy * vec4(-1.0, 0.0, 0.0, 1.0); // Changed sign in W component.\r\n\tvOffset[1] = uv.xyxy + texelSize.xyxy * vec4(1.0, 0.0, 0.0, -1.0); // Changed sign in W component.\r\n\tvOffset[2] = uv.xyxy + texelSize.xyxy * vec4(-2.0, 0.0, 0.0, 2.0); // Changed sign in W component.\r\n\r\n\tgl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\r\n\r\n}\r\n";

	/**
	 * Subpixel Morphological Antialiasing.
	 *
	 * This material detects edges in a color texture.
	 *
	 * @class SMAAColorEdgesMaterial
	 * @submodule materials
	 * @extends ShaderMaterial
	 * @constructor
	 * @param {Vector2} [texelSize] - The absolute screen texel size.
	 */

	class SMAAColorEdgesMaterial extends THREE.ShaderMaterial {

		constructor(texelSize) {

			super({

				type: "SMAAColorEdgesMaterial",

				defines: {

					EDGE_THRESHOLD: "0.1"

				},

				uniforms: {

					tDiffuse: {value: null},
					texelSize: {value: (texelSize !== undefined) ? texelSize : new THREE.Vector2()}

				},

				fragmentShader: fragment$12,
				vertexShader: vertex$12

			});

		}

	}

	var areaImage = "data:image/png;base64,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";

	var searchImage = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEIAAAAhCAAAAABIXyLAAAAAOElEQVRIx2NgGAWjYBSMglEwEICREYRgFBZBqDCSLA2MGPUIVQETE9iNUAqLR5gIeoQKRgwXjwAAGn4AtaFeYLEAAAAASUVORK5CYII=";

	var fragment$13 = "#define sampleLevelZeroOffset(t, coord, offset) texture2D(t, coord + float(offset) * texelSize, 0.0)\r\n\r\nuniform sampler2D tDiffuse;\r\nuniform sampler2D tArea;\r\nuniform sampler2D tSearch;\r\n\r\nuniform vec2 texelSize;\r\n\r\nvarying vec2 vUv;\r\nvarying vec4 vOffset[3];\r\nvarying vec2 vPixCoord;\r\n\r\nvec2 round(vec2 x) {\r\n\r\n\treturn sign(x) * floor(abs(x) + 0.5);\r\n\r\n}\r\n\r\nfloat searchLength(vec2 e, float bias, float scale) {\r\n\r\n\t// Not required if tSearch accesses are set to point.\r\n\t// const vec2 SEARCH_TEX_PIXEL_SIZE = 1.0 / vec2(66.0, 33.0);\r\n\t// e = vec2(bias, 0.0) + 0.5 * SEARCH_TEX_PIXEL_SIZE + e * vec2(scale, 1.0) * vec2(64.0, 32.0) * SEARCH_TEX_PIXEL_SIZE;\r\n\r\n\te.r = bias + e.r * scale;\r\n\r\n\treturn 255.0 * texture2D(tSearch, e, 0.0).r;\r\n\r\n}\r\n\r\nfloat searchXLeft(vec2 texCoord, float end) {\r\n\r\n\t/* @PSEUDO_GATHER4\r\n\t * This texCoord has been offset by (-0.25, -0.125) in the vertex shader to\r\n\t * sample between edge, thus fetching four edges in a row.\r\n\t * Sampling with different offsets in each direction allows to disambiguate\r\n\t * which edges are active from the four fetched ones.\r\n\t */\r\n\r\n\tvec2 e = vec2(0.0, 1.0);\r\n\r\n\tfor(int i = 0; i < SMAA_MAX_SEARCH_STEPS_INT; ++i) {\r\n\r\n\t\te = texture2D(tDiffuse, texCoord, 0.0).rg;\r\n\t\ttexCoord -= vec2(2.0, 0.0) * texelSize;\r\n\r\n\t\tif(!(texCoord.x > end && e.g > 0.8281 && e.r == 0.0)) { break; }\r\n\r\n\t}\r\n\r\n\t// Correct the previously applied offset (-0.25, -0.125).\r\n\ttexCoord.x += 0.25 * texelSize.x;\r\n\r\n\t// The searches are biased by 1, so adjust the coords accordingly.\r\n\ttexCoord.x += texelSize.x;\r\n\r\n\t// Disambiguate the length added by the last step.\r\n\ttexCoord.x += 2.0 * texelSize.x; // Undo last step.\r\n\ttexCoord.x -= texelSize.x * searchLength(e, 0.0, 0.5);\r\n\r\n\treturn texCoord.x;\r\n\r\n}\r\n\r\nfloat searchXRight(vec2 texCoord, float end) {\r\n\r\n\tvec2 e = vec2(0.0, 1.0);\r\n\r\n\tfor(int i = 0; i < SMAA_MAX_SEARCH_STEPS_INT; ++i) {\r\n\r\n\t\te = texture2D(tDiffuse, texCoord, 0.0).rg;\r\n\t\ttexCoord += vec2(2.0, 0.0) * texelSize;\r\n\r\n\t\tif(!(texCoord.x < end && e.g > 0.8281 && e.r == 0.0)) { break; }\r\n\r\n\t}\r\n\r\n\ttexCoord.x -= 0.25 * texelSize.x;\r\n\ttexCoord.x -= texelSize.x;\r\n\ttexCoord.x -= 2.0 * texelSize.x;\r\n\ttexCoord.x += texelSize.x * searchLength(e, 0.5, 0.5);\r\n\r\n\treturn texCoord.x;\r\n\r\n}\r\n\r\nfloat searchYUp(vec2 texCoord, float end) {\r\n\r\n\tvec2 e = vec2(1.0, 0.0);\r\n\r\n\tfor(int i = 0; i < SMAA_MAX_SEARCH_STEPS_INT; ++i) {\r\n\r\n\t\te = texture2D(tDiffuse, texCoord, 0.0).rg;\r\n\t\ttexCoord += vec2(0.0, 2.0) * texelSize; // Changed sign.\r\n\r\n\t\tif(!(texCoord.y > end && e.r > 0.8281 && e.g == 0.0)) { break; }\r\n\r\n\t}\r\n\r\n\ttexCoord.y -= 0.25 * texelSize.y; // Changed sign.\r\n\ttexCoord.y -= texelSize.y; // Changed sign.\r\n\ttexCoord.y -= 2.0 * texelSize.y; // Changed sign.\r\n\ttexCoord.y += texelSize.y * searchLength(e.gr, 0.0, 0.5); // Changed sign.\r\n\r\n\treturn texCoord.y;\r\n\r\n}\r\n\r\nfloat searchYDown(vec2 texCoord, float end) {\r\n\r\n\tvec2 e = vec2(1.0, 0.0);\r\n\r\n\tfor(int i = 0; i < SMAA_MAX_SEARCH_STEPS_INT; ++i ) {\r\n\r\n\t\te = texture2D(tDiffuse, texCoord, 0.0).rg;\r\n\t\ttexCoord -= vec2(0.0, 2.0) * texelSize; // Changed sign.\r\n\r\n\t\tif(!(texCoord.y < end && e.r > 0.8281 && e.g == 0.0)) { break; }\r\n\r\n\t}\r\n\r\n\ttexCoord.y += 0.25 * texelSize.y; // Changed sign.\r\n\ttexCoord.y += texelSize.y; // Changed sign.\r\n\ttexCoord.y += 2.0 * texelSize.y; // Changed sign.\r\n\ttexCoord.y -= texelSize.y * searchLength(e.gr, 0.5, 0.5); // Changed sign.\r\n\r\n\treturn texCoord.y;\r\n\r\n}\r\n\r\nvec2 area(vec2 dist, float e1, float e2, float offset) {\r\n\r\n\t// Rounding prevents precision errors of bilinear filtering.\r\n\tvec2 texCoord = SMAA_AREATEX_MAX_DISTANCE * round(4.0 * vec2(e1, e2)) + dist;\r\n\r\n\t// Scale and bias for texel space translation.\r\n\ttexCoord = SMAA_AREATEX_PIXEL_SIZE * texCoord + (0.5 * SMAA_AREATEX_PIXEL_SIZE);\r\n\r\n\t// Move to proper place, according to the subpixel offset.\r\n\ttexCoord.y += SMAA_AREATEX_SUBTEX_SIZE * offset;\r\n\r\n\treturn texture2D(tArea, texCoord, 0.0).rg;\r\n\r\n}\r\n\r\nvoid main() {\r\n\r\n\tvec4 weights = vec4(0.0);\r\n\tvec4 subsampleIndices = vec4(0.0);\r\n\tvec2 e = texture2D(tDiffuse, vUv).rg;\r\n\r\n\tif(e.g > 0.0) {\r\n\r\n\t\t// Edge at north.\r\n\t\tvec2 d;\r\n\r\n\t\t// Find the distance to the left.\r\n\t\tvec2 coords;\r\n\t\tcoords.x = searchXLeft(vOffset[0].xy, vOffset[2].x);\r\n\t\tcoords.y = vOffset[1].y; // vOffset[1].y = vUv.y - 0.25 * texelSize.y (@CROSSING_OFFSET)\r\n\t\td.x = coords.x;\r\n\r\n\t\t/* Now fetch the left crossing edges, two at a time using bilinear filtering.\r\n\t\t * Sampling at -0.25 (see @CROSSING_OFFSET) enables to discern what value each edge has.\r\n\t\t */\r\n\r\n\t\tfloat e1 = texture2D(tDiffuse, coords, 0.0).r;\r\n\r\n\t\t// Find the distance to the right.\r\n\t\tcoords.x = searchXRight(vOffset[0].zw, vOffset[2].y);\r\n\t\td.y = coords.x;\r\n\r\n\t\t// Translate distances to pixel units for better interleave arithmetic and memory accesses.\r\n\t\td = d / texelSize.x - vPixCoord.x;\r\n\r\n\t\t// The area below needs a sqrt, as the areas texture is compressed quadratically.\r\n\t\tvec2 sqrtD = sqrt(abs(d));\r\n\r\n\t\t// Fetch the right crossing edges.\r\n\t\tcoords.y -= texelSize.y; // WebGL port note: Added.\r\n\t\tfloat e2 = sampleLevelZeroOffset(tDiffuse, coords, ivec2(1, 0)).r;\r\n\r\n\t\t// Pattern recognised, now get the actual area.\r\n\t\tweights.rg = area(sqrtD, e1, e2, subsampleIndices.y);\r\n\r\n\t}\r\n\r\n\tif(e.r > 0.0) {\r\n\r\n\t\t// Edge at west.\r\n\t\tvec2 d;\r\n\r\n\t\t// Find the distance to the top.\r\n\t\tvec2 coords;\r\n\r\n\t\tcoords.y = searchYUp(vOffset[1].xy, vOffset[2].z);\r\n\t\tcoords.x = vOffset[0].x; // vOffset[1].x = vUv.x - 0.25 * texelSize.x;\r\n\t\td.x = coords.y;\r\n\r\n\t\t// Fetch the top crossing edges.\r\n\t\tfloat e1 = texture2D(tDiffuse, coords, 0.0).g;\r\n\r\n\t\t// Find the distance to the bottom.\r\n\t\tcoords.y = searchYDown(vOffset[1].zw, vOffset[2].w);\r\n\t\td.y = coords.y;\r\n\r\n\t\t// Distances in pixel units.\r\n\t\td = d / texelSize.y - vPixCoord.y;\r\n\r\n\t\t// The area below needs a sqrt, as the areas texture is compressed quadratically.\r\n\t\tvec2 sqrtD = sqrt(abs(d));\r\n\r\n\t\t// Fetch the bottom crossing edges.\r\n\t\tcoords.y -= texelSize.y; // WebGL port note: Added.\r\n\t\tfloat e2 = sampleLevelZeroOffset(tDiffuse, coords, ivec2(0, 1)).g;\r\n\r\n\t\t// Get the area for this direction.\r\n\t\tweights.ba = area(sqrtD, e1, e2, subsampleIndices.x);\r\n\r\n\t}\r\n\r\n\tgl_FragColor = weights;\r\n\r\n}\r\n";

	var vertex$13 = "uniform vec2 texelSize;\r\n\r\nvarying vec2 vUv;\r\nvarying vec4 vOffset[3];\r\nvarying vec2 vPixCoord;\r\n\r\nvoid main() {\r\n\r\n\tvUv = uv;\r\n\r\n\tvPixCoord = uv / texelSize;\r\n\r\n\t// Offsets for the searches (see @PSEUDO_GATHER4).\r\n\tvOffset[0] = uv.xyxy + texelSize.xyxy * vec4(-0.25, 0.125, 1.25, 0.125); // Changed sign in Y and W components.\r\n\tvOffset[1] = uv.xyxy + texelSize.xyxy * vec4(-0.125, 0.25, -0.125, -1.25); //Changed sign in Y and W components.\r\n\r\n\t// This indicates the ends of the loops.\r\n\tvOffset[2] = vec4(vOffset[0].xz, vOffset[1].yw) + vec4(-2.0, 2.0, -2.0, 2.0) * texelSize.xxyy * SMAA_MAX_SEARCH_STEPS_FLOAT;\r\n\r\n\tgl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\r\n\r\n}\r\n";

	/**
	 * Subpixel Morphological Antialiasing.
	 *
	 * This material computes weights for detected edges.
	 *
	 * @class SMAAWeightsMaterial
	 * @submodule materials
	 * @extends ShaderMaterial
	 * @constructor
	 * @param {Vector2} [texelSize] - The absolute screen texel size.
	 */

	class SMAAWeightsMaterial extends THREE.ShaderMaterial {

		constructor(texelSize) {

			super({

				type: "SMAAWeightsMaterial",

				defines: {

					SMAA_MAX_SEARCH_STEPS_INT: "8",
					SMAA_MAX_SEARCH_STEPS_FLOAT: "8.0",

					SMAA_AREATEX_MAX_DISTANCE: "16.0",

					SMAA_AREATEX_PIXEL_SIZE: "(1.0 / vec2(160.0, 560.0))",
					SMAA_AREATEX_SUBTEX_SIZE: "(1.0 / 7.0)"

				},

				uniforms: {

					tDiffuse: {value: null},
					tArea: {value: null},
					tSearch: {value: null},
					texelSize: {value: (texelSize !== undefined) ? texelSize : new THREE.Vector2()}

				},

				fragmentShader: fragment$13,
				vertexShader: vertex$13

			});

			/**
			 * The area pattern recognition image.
			 *
			 * @property areaImage
			 * @type String
			 */

			this.areaImage = areaImage;

			/**
			 * The search image.
			 *
			 * @property searchImage
			 * @type String
			 */

			this.searchImage = searchImage;

		}

	}

	var fragment$14 = "uniform sampler2D tDiffuse;\r\nuniform float middleGrey;\r\nuniform float maxLuminance;\r\n\r\n#ifdef ADAPTED_LUMINANCE\r\n\r\n\tuniform sampler2D luminanceMap;\r\n\r\n#else\r\n\r\n\tuniform float averageLuminance;\r\n\r\n#endif\r\n\r\nvarying vec2 vUv;\r\n\r\nconst vec3 LUM_COEFF = vec3(0.299, 0.587, 0.114);\r\nconst vec2 CENTER = vec2(0.5, 0.5);\r\n\r\nvec3 toneMap(vec3 c) {\r\n\r\n\t#ifdef ADAPTED_LUMINANCE\r\n\r\n\t\t// Get the calculated average luminance.\r\n\t\tfloat lumAvg = texture2D(luminanceMap, CENTER).r;\r\n\r\n\t#else\r\n\r\n\t\tfloat lumAvg = averageLuminance;\r\n\r\n\t#endif\r\n\r\n\t// Calculate the luminance of the current pixel.\r\n\tfloat lumPixel = dot(c, LUM_COEFF);\r\n\r\n\t// Apply the modified operator (Reinhard Eq. 4).\r\n\tfloat lumScaled = (lumPixel * middleGrey) / lumAvg;\r\n\r\n\tfloat lumCompressed = (lumScaled * (1.0 + (lumScaled / (maxLuminance * maxLuminance)))) / (1.0 + lumScaled);\r\n\r\n\treturn lumCompressed * c;\r\n\r\n}\r\n\r\nvoid main() {\r\n\r\n\tvec4 texel = texture2D(tDiffuse, vUv);\r\n\tgl_FragColor = vec4(toneMap(texel.rgb), texel.a);\r\n\r\n}\r\n";

	var vertex$14 = "varying vec2 vUv;\r\n\r\nvoid main() {\r\n\r\n\tvUv = uv;\r\n\tgl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\r\n\r\n}\r\n";

	/**
	 * Full-screen tone-mapping shader material.
	 * http://www.graphics.cornell.edu/~jaf/publications/sig02_paper.pdf
	 *
	 * @class ToneMappingMaterial
	 * @submodule materials
	 * @extends ShaderMaterial
	 * @constructor
	 */

	class ToneMappingMaterial extends THREE.ShaderMaterial {

		constructor() {

			super({

				type: "ToneMappingMaterial",

				uniforms: {

					tDiffuse: {value: null},
					luminanceMap: {value: null},
					averageLuminance: {value: 1.0},
					maxLuminance: {value: 16.0},
					middleGrey: {value: 0.6}

				},

				fragmentShader: fragment$14,
				vertexShader: vertex$14

			});

		}

	}

	/**
	 * An abstract pass.
	 *
	 * This class implements a dispose method that frees memory on demand.
	 * The EffectComposer calls this method when it is being destroyed.
	 *
	 * For this mechanism to work properly, please assign your render targets, 
	 * materials or textures directly to your pass!
	 *
	 * You can prevent your disposable objects from being deleted by keeping them 
	 * inside deeper structures such as arrays or objects.
	 *
	 * @class Pass
	 * @submodule passes
	 * @constructor
	 * @param {Scene} [scene] - The scene to render.
	 * @param {Camera} [camera] - The camera will be added to the given scene if it has no parent.
	 * @param {Mesh} [quad] - A quad that fills the screen. Used for rendering a pure 2D effect. Set this to null, if you don't need it (see RenderPass).
	 */

	class Pass {

		constructor(scene, camera, quad) {

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
			 *
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
			 * Indicates whether the read and write buffers should be swapped after this 
			 * pass has finished rendering.
			 *
			 * Set this to true if this pass renders to the write buffer so that a 
			 * following pass can find the result in the read buffer.
			 *
			 * @property needsSwap
			 * @type Boolean
			 * @private
			 * @default false
			 */

			this.needsSwap = false;

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

			// Finally, add the camera and the quad to the scene.
			if(this.scene !== null) {

				if(this.camera !== null && this.camera.parent === null) { this.scene.add(this.camera); }
				if(this.quad !== null) { this.scene.add(this.quad); }

			}

		}

		/**
		 * Renders the effect.
		 *
		 * This is an abstract method that must be overridden.
		 *
		 * @method render
		 * @throws {Error} An error is thrown if the method is not overridden.
		 * @param {WebGLRenderer} renderer - The renderer to use.
		 * @param {WebGLRenderTarget} readBuffer - A read buffer. Contains the result of the previous pass.
		 * @param {WebGLRenderTarget} writeBuffer - A write buffer. Normally used as the render target.
		 * @param {Number} [delta] - The delta time.
		 * @param {Boolean} [maskActive] - Indicates whether a stencil test mask is active or not.
		 */

		render(renderer, readBuffer, writeBuffer, delta, maskActive) {

			throw new Error("Render method not implemented!");

		}

		/**
		 * Performs initialisation tasks.
		 *
		 * By implementing this abstract method you gain access to the renderer.
		 * You'll also be able to configure your custom render targets to use the 
		 * appropriate format (RGB or RGBA).
		 *
		 * The provided renderer can be used to warm up special off-screen render 
		 * targets by performing a preliminary render operation.
		 *
		 * The effect composer calls this method when this pass is added to its queue.
		 *
		 * @method initialise
		 * @param {WebGLRenderer} renderer - The renderer.
		 * @param {Boolean} alpha - Whether the renderer uses the alpha channel or not.
		 */

		initialise(renderer, alpha) {}

		/**
		 * Updates this pass with the renderer's size.
		 *
		 * This is an abstract method that may be overriden in case you want to be 
		 * informed about the main render size.
		 *
		 * The effect composer calls this method when its own size is updated.
		 *
		 * @method setSize
		 * @param {Number} width - The renderer's width.
		 * @param {Number} height - The renderer's height.
		 * @example
		 *  this.myRenderTarget.setSize(width, height);
		 */

		setSize(width, height) {}

		/**
		 * Performs a shallow search for properties that define a dispose method and 
		 * deletes them. The pass will be inoperative after this method was called!
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

		dispose() {

			let i, p;
			let keys = Object.keys(this);

			for(i = keys.length - 1; i >= 0; --i) {

				p = this[keys[i]];

				if(p !== null && typeof p.dispose === "function") {

					p.dispose();
					this[keys[i]] = null;

				}

			}

		}

	}

	/**
	 * A bloom pass.
	 *
	 * This pass renders a scene with superimposed blur 
	 * by utilising the fast Kawase convolution approach.
	 *
	 * @class BloomPass
	 * @submodule passes
	 * @extends Pass
	 * @constructor
	 * @param {Object} [options] - The options.
	 * @param {Number} [options.resolutionScale=0.5] - The render texture resolution scale, relative to the screen render size.
	 * @param {Number} [options.blurriness=1.0] - The scale of the blur.
	 * @param {Number} [options.strength=1.0] - The bloom strength.
	 * @param {Number} [options.distinction=1.0] - The luminance distinction factor. Raise this value to bring out the brighter elements in the scene.
	 */

	class BloomPass extends Pass {

		constructor(options) {

			super();

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
				generateMipmaps: false,
				stencilBuffer: false,
				depthBuffer: false
			});

			/**
			 * A second render target.
			 *
			 * @property renderTargetY
			 * @type WebGLRenderTarget
			 * @private
			 */

			this.renderTargetY = this.renderTargetX.clone();

			/**
			 * The resolution scale.
			 *
			 * You need to call the setSize method of the EffectComposer after 
			 * changing this value.
			 *
			 * @property resolutionScale
			 * @type Number
			 * @default 0.5
			 */

			this.resolutionScale = (options.resolutionScale === undefined) ? 0.5 : options.resolutionScale;

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
			 * Luminance shader material.
			 *
			 * @property luminosityMaterial
			 * @type LuminosityMaterial
			 * @private
			 */

			this.luminosityMaterial = new LuminosityMaterial(true);

			if(options.distinction !== undefined) { this.luminosityMaterial.uniforms.distinction.value = options.distinction; }

			/**
			 * Convolution shader material.
			 *
			 * @property convolutionMaterial
			 * @type ConvolutionMaterial
			 * @private
			 */

			this.convolutionMaterial = new ConvolutionMaterial();

			this.blurriness = options.blurriness;

		}

		/**
		 * The strength of the preliminary blur phase.
		 *
		 * @property blurriness
		 * @type Number
		 * @default 1.0
		 */

		get blurriness() { return this.convolutionMaterial.scale; }

		set blurriness(x) {

			if(typeof x === "number") {

				this.convolutionMaterial.scale = x;

			}

		}

		/**
		 * Renders the effect.
		 *
		 * Applies a luminance filter and convolution blur to the read buffer and 
		 * renders the result into a seperate render target. The result is additively 
		 * blended with the read buffer.
		 *
		 * @method render
		 * @param {WebGLRenderer} renderer - The renderer to use.
		 * @param {WebGLRenderTarget} readBuffer - The read buffer.
		 */

		render(renderer, readBuffer) {

			let state = renderer.state;

			// Luminance filter.
			this.quad.material = this.luminosityMaterial;
			this.luminosityMaterial.uniforms.tDiffuse.value = readBuffer.texture;
			state.setDepthWrite(true);
			renderer.render(this.scene, this.camera, this.renderTargetX);
			state.setDepthWrite(false);

			// Convolution phase.
			this.quad.material = this.convolutionMaterial;

			this.convolutionMaterial.adjustKernel();
			this.convolutionMaterial.uniforms.tDiffuse.value = this.renderTargetX.texture;
			renderer.render(this.scene, this.camera, this.renderTargetY);

			this.convolutionMaterial.adjustKernel();
			this.convolutionMaterial.uniforms.tDiffuse.value = this.renderTargetY.texture;
			renderer.render(this.scene, this.camera, this.renderTargetX);

			this.convolutionMaterial.adjustKernel();
			this.convolutionMaterial.uniforms.tDiffuse.value = this.renderTargetX.texture;
			renderer.render(this.scene, this.camera, this.renderTargetY);

			this.convolutionMaterial.adjustKernel();
			this.convolutionMaterial.uniforms.tDiffuse.value = this.renderTargetY.texture;
			renderer.render(this.scene, this.camera, this.renderTargetX);

			this.convolutionMaterial.adjustKernel();
			this.convolutionMaterial.uniforms.tDiffuse.value = this.renderTargetX.texture;
			renderer.render(this.scene, this.camera, this.renderTargetY);

			// Render the original scene with superimposed blur.
			if(this.renderToScreen) {

				this.quad.material = this.combineMaterial;
				this.combineMaterial.uniforms.texture1.value = readBuffer.texture;
				this.combineMaterial.uniforms.texture2.value = this.renderTargetY.texture;

				renderer.render(this.scene, this.camera);

			} else {

				this.quad.material = this.copyMaterial;
				this.copyMaterial.uniforms.tDiffuse.value = this.renderTargetY.texture;

				renderer.render(this.scene, this.camera, readBuffer, false);

			}

		}

		/**
		 * Adjusts the format and size of the render targets.
		 *
		 * @method initialise
		 * @param {WebGLRenderer} renderer - The renderer.
		 * @param {Boolean} alpha - Whether the renderer uses the alpha channel or not.
		 */

		initialise(renderer, alpha) {

			let size = renderer.getSize();
			this.setSize(size.width, size.height);

			if(!alpha) {

				this.renderTargetX.texture.format = THREE.RGBFormat;
				this.renderTargetY.texture.format = THREE.RGBFormat;

			}

		}

		/**
		 * Updates this pass with the renderer's size.
		 *
		 * @method setSize
		 * @param {Number} width - The width.
		 * @param {Number} height - The height.
		 */

		setSize(width, height) {

			width = Math.floor(width * this.resolutionScale);
			height = Math.floor(height * this.resolutionScale);

			if(width <= 0) { width = 1; }
			if(height <= 0) { height = 1; }

			this.renderTargetX.setSize(width, height);
			this.renderTargetY.setSize(width, height);

			this.convolutionMaterial.setTexelSize(1.0 / width, 1.0 / height);

		}

	}

	/**
	 * Depth of Field pass using a bokeh shader.
	 *
	 * @class BokehPass
	 * @submodule passes
	 * @extends Pass
	 * @constructor
	 * @param {PerspectiveCamera} camera - The main camera. Used to adjust the near and far plane settings.
	 * @param {Object} [options] - Additional parameters.
	 * @param {Number} [options.focus=1.0] - Focus distance.
	 * @param {Number} [options.aperture=0.025] - Camera aperture scale. Bigger values for shallower depth of field.
	 * @param {Number} [options.maxBlur=1.0] - Maximum blur strength.
	 */

	class BokehPass extends Pass {

		constructor(camera, options) {

			super();

			this.needsSwap = true;

			if(options === undefined) { options = {}; }

			/**
			 * Bokeh shader material.
			 *
			 * @property bokehMaterial
			 * @type BokehMaterial
			 * @private
			 */

			this.bokehMaterial = new BokehMaterial(camera, options);

			this.quad.material = this.bokehMaterial;

		}

		/**
		 * Renders the effect.
		 *
		 * @method render
		 * @param {WebGLRenderer} renderer - The renderer to use.
		 * @param {WebGLRenderTarget} readBuffer - The read buffer.
		 * @param {WebGLRenderTarget} writeBuffer - The write buffer.
		 */

		render(renderer, readBuffer, writeBuffer) {

			this.bokehMaterial.uniforms.tDiffuse.value = readBuffer.texture;
			this.bokehMaterial.uniforms.tDepth.value = readBuffer.depthTexture;

			if(this.renderToScreen) {

				renderer.render(this.scene, this.camera);

			} else {

				renderer.render(this.scene, this.camera, writeBuffer, false);

			}

		}

		/**
		 * Adjusts the format and size of the render targets.
		 *
		 * @method initialise
		 * @param {WebGLRenderer} renderer - The renderer.
		 * @param {Boolean} alpha - Whether the renderer uses the alpha channel or not.
		 */

		initialise(renderer, alpha) {

			let size = renderer.getSize();
			this.setSize(size.width, size.height);

		}

		/**
		 * Updates this pass with the renderer's size.
		 *
		 * @method setSize
		 * @param {Number} width - The width.
		 * @param {Number} height - The height.
		 */

		setSize(width, height) {

			this.bokehMaterial.uniforms.aspect.value = width / height;

		}

	}

	/**
	 * Depth of Field pass version 2.
	 *
	 * This pass yields more realistic results but is also more demanding.
	 *
	 * @class Bokeh2Pass
	 * @submodule passes
	 * @extends Pass
	 * @constructor
	 * @param {PerspectiveCamera} camera - The main camera. Used to adjust near and far plane and focal length settings.
	 * @param {Object} [options] - Additional parameters.
	 * @param {Number} [options.rings=3] - The amount of blur rings.
	 * @param {Number} [options.samples=4] - The amount of samples per ring.
	 * @param {Boolean} [options.showFocus=false] - Whether the focus point should be highlighted.
	 * @param {Boolean} [options.manualDoF=false] - Enables manual depth of field blur.
	 * @param {Boolean} [options.vignette=false] - Enables a vignette effect.
	 * @param {Boolean} [options.pentagon=false] - Enable to use a pentagonal shape to scale gathered texels.
	 * @param {Boolean} [options.shaderFocus=true] - Disable if you compute your own focalDepth (in metres!).
	 * @param {Boolean} [options.noise=true] - Disable if you don't want noise patterns for dithering.
	 */

	class Bokeh2Pass extends Pass {

		constructor(camera, options) {

			super();

			if(options === undefined) { options = {}; }

			/**
			 * Bokeh shader material.
			 *
			 * @property bokehMaterial
			 * @type BokehMaterial
			 * @private
			 */

			this.bokehMaterial = new Bokeh2Material(camera, options);

			this.quad.material = this.bokehMaterial;

		}

		/**
		 * Renders the effect.
		 *
		 * @method render
		 * @param {WebGLRenderer} renderer - The renderer to use.
		 * @param {WebGLRenderTarget} readBuffer - The read buffer.
		 * @param {WebGLRenderTarget} writeBuffer - The write buffer.
		 */

		render(renderer, readBuffer, writeBuffer) {

			this.bokehMaterial.uniforms.tDiffuse.value = readBuffer.texture;
			this.bokehMaterial.uniforms.tDepth.value = readBuffer.depthTexture;

			if(this.renderToScreen) {

				renderer.render(this.scene, this.camera);

			} else {

				renderer.render(this.scene, this.camera, writeBuffer, false);

			}

		}

		/**
		 * Adjusts the format and size of the render targets.
		 *
		 * @method initialise
		 * @param {WebGLRenderer} renderer - The renderer.
		 * @param {Boolean} alpha - Whether the renderer uses the alpha channel or not.
		 */

		initialise(renderer, alpha) {

			let size = renderer.getSize();
			this.setSize(size.width, size.height);

		}

		/**
		 * Updates this pass with the renderer's size.
		 *
		 * @method setSize
		 * @param {Number} width - The width.
		 * @param {Number} height - The height.
		 */

		setSize(width, height) {

			this.bokehMaterial.setTexelSize(1.0 / width, 1.0 / height);

		}

	}

	/**
	 * A clear mask pass.
	 *
	 * @class ClearMaskPass
	 * @submodule passes
	 * @extends Pass
	 * @constructor
	 */

	class ClearMaskPass extends Pass {

		constructor() {

			super(null, null, null);

		}

		/**
		 * This pass disables the stencil test.
		 *
		 * @method render
		 * @param {WebGLRenderer} renderer - The renderer to use.
		 */

		render(renderer) {

			renderer.context.disable(renderer.context.STENCIL_TEST);

		}

	}

	/**
	 * A render pass.
	 *
	 * @class DotScreenPass
	 * @submodule passes
	 * @extends Pass
	 * @constructor
	 * @param {Object} [options] - The options.
	 * @param {Number} [options.angle=1.57] - The angle of the pattern.
	 * @param {Number} [options.scale=1.0] - The scale of the overall effect.
	 * @param {Number} [options.intensity=1.0] - The intensity of the effect.
	 * @param {Boolean} [options.average=false] - Whether the shader should output a colour average (black and white).
	 */

	class DotScreenPass extends Pass {

		constructor(options) {

			super();

			this.needsSwap = true;

			if(options === undefined) { options = {}; }

			/**
			 * Dot screen shader material description.
			 *
			 * @property material
			 * @type DotScreenMaterial
			 * @private
			 */

			this.material = new DotScreenMaterial(options.average);

			if(options.angle !== undefined) { this.material.uniforms.angle.value = options.angle; }
			if(options.scale !== undefined) { this.material.uniforms.scale.value = options.scale; }
			if(options.intensity !== undefined) { this.material.uniforms.intensity.value = options.intensity; }

			this.quad.material = this.material;

		}

		/**
		 * Renders the effect.
		 *
		 * @method render
		 * @param {WebGLRenderer} renderer - The renderer to use.
		 * @param {WebGLRenderTarget} readBuffer - The read buffer.
		 * @param {WebGLRenderTarget} writeBuffer - The write buffer.
		 */

		render(renderer, readBuffer, writeBuffer) {

			this.material.uniforms.tDiffuse.value = readBuffer.texture;

			if(this.renderToScreen) {

				renderer.render(this.scene, this.camera);

			} else {

				renderer.render(this.scene, this.camera, writeBuffer, false);

			}

		}

		/**
		 * Adjusts the size of the effect.
		 *
		 * @method initialise
		 * @param {WebGLRenderer} renderer - The renderer.
		 */

		initialise(renderer) {

			let size = renderer.getSize();
			this.setSize(size.width, size.height);

		}

		/**
		 * Updates this pass with the renderer's size.
		 *
		 * @method setSize
		 * @param {Number} width - The width.
		 * @param {Number} heght - The height.
		 */

		setSize(width, height) {

			if(width <= 0) { width = 1; }
			if(height <= 0) { height = 1; }

			this.material.uniforms.offsetRepeat.value.z = width;
			this.material.uniforms.offsetRepeat.value.w = height;

		}

	}

	/**
	 * A film pass providing various cinematic effects.
	 *
	 * @class FilmPass
	 * @submodule passes
	 * @extends Pass
	 * @constructor
	 * @param {Object} [options] - The options.
	 * @param {Boolean} [options.greyscale=false] - Enable greyscale effect. Greyscale and sepia are mutually exclusive.
	 * @param {Boolean} [options.sepia=false] - Enable sepia effect. Greyscale and sepia are mutually exclusive.
	 * @param {Boolean} [options.vignette=false] - Apply vignette effect.
	 * @param {Boolean} [options.eskil=false] - Use Eskil's vignette approach. The default looks dusty while Eskil looks more burned out.
	 * @param {Boolean} [options.scanlines=true] - Show scanlines.
	 * @param {Boolean} [options.noise=true] - Show noise-based film grain.
	 * @param {Number} [options.noiseIntensity=0.5] - The noise intensity. 0.0 to 1.0.
	 * @param {Number} [options.scanlineIntensity=0.05] - The scanline intensity. 0.0 to 1.0.
	 * @param {Number} [options.scanlineDensity=1.0] - The number of scanlines in percent, relative to the screen height.
	 * @param {Number} [options.greyscaleIntensity=1.0] - The intensity of the greyscale effect.
	 * @param {Number} [options.sepiaIntensity=1.0] - The intensity of the sepia effect.
	 * @param {Number} [options.vignetteOffset=1.0] - The offset of the vignette effect.
	 * @param {Number} [options.vignetteDarkness=1.0] - The darkness of the vignette effect.
	 */

	class FilmPass extends Pass {

		constructor(options) {

			super();

			this.needsSwap = true;

			if(options === undefined) { options = {}; }

			/**
			 * Film shader material.
			 *
			 * @property material
			 * @type FilmMaterial
			 * @private
			 */

			this.material = new FilmMaterial(options);

			this.quad.material = this.material;

			/**
			 * The amount of scanlines in percent, relative to the screen height.
			 *
			 * You need to call the setSize method of the EffectComposer after 
			 * changing this value.
			 *
			 * @property scanlineDensity
			 * @type Number
			 * @default 1.25
			 */

			this.scanlineDensity = (options.scanlineDensity === undefined) ? 1.25 : options.scanlineDensity;

		}

		/**
		 * Renders the effect.
		 *
		 * @method render
		 * @param {WebGLRenderer} renderer - The renderer to use.
		 * @param {WebGLRenderTarget} readBuffer - The read buffer.
		 * @param {WebGLRenderTarget} writeBuffer - The write buffer.
		 * @param {Number} delta - The render delta time.
		 */

		render(renderer, readBuffer, writeBuffer, delta) {

			this.material.uniforms.tDiffuse.value = readBuffer.texture;
			this.material.uniforms.time.value += delta;

			if(this.renderToScreen) {

				renderer.render(this.scene, this.camera);

			} else {

				renderer.render(this.scene, this.camera, writeBuffer, false);

			}

		}

		/**
		 * Adjusts the scanline count using the renderer's height.
		 *
		 * @method initialise
		 * @param {WebGLRenderer} renderer - The renderer.
		 */

		initialise(renderer) {

			let size = renderer.getSize();
			this.setSize(size.width, size.height);

		}

		/**
		 * Adjusts the scanline count using the renderer's height.
		 *
		 * @method setSize
		 * @param {Number} width - The width.
		 * @param {Number} height - The height.
		 */

		setSize(width, height) {

			this.material.uniforms.scanlineCount.value = Math.round(height * this.scanlineDensity);

		}

	}

	/**
	 * A glitch pass.
	 *
	 * @class GlitchPass
	 * @submodule passes
	 * @extends Pass
	 * @constructor
	 * @param {Object} [options] - The options.
	 * @param {Texture} [options.perturbMap] - A perturbation map.
	 * @param {Number} [options.dtSize=64] - The size of the generated noise map. Will be ignored if a perturbation map is provided.
	 */

	class GlitchPass extends Pass {

		constructor(options) {

			super();

			this.needsSwap = true;

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

			this.quad.material = this.material;

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

			/**
			 * A random break point for the sporadic glitch activation.
			 *
			 * @property breakPoint
			 * @type Number
			 * @private
			 */

			this.breakPoint = 0;
			this.generateTrigger();

		}

		/**
		 * Renders the effect.
		 *
		 * @method render
		 * @param {WebGLRenderer} renderer - The renderer to use.
		 * @param {WebGLRenderTarget} readBuffer - The read buffer.
		 * @param {WebGLRenderTarget} writeBuffer - The write buffer.
		 */

		render(renderer, readBuffer, writeBuffer) {

			let uniforms = this.material.uniforms;

			uniforms.tDiffuse.value = readBuffer.texture;
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

		}

		/**
		 * Creates a random break point for the glitch effect.
		 *
		 * @method generateTrigger
		 * @private
		 */

		generateTrigger() {

			this.breakPoint = THREE.Math.randInt(120, 240);

		}

		/**
		 * Destroys the currently set texture, if any, and 
		 * generates a simple noise map.
		 *
		 * @method generatePerturbMap
		 * @private
		 * @param {Number} size - The texture size.
		 */

		generatePerturbMap(size) {

			let i, x;
			let l = size * size;
			let data = new Float32Array(l * 3);

			for(i = 0; i < l; ++i) {

				x = THREE.Math.randFloat(0, 1);

				data[i * 3] = x;
				data[i * 3 + 1] = x;
				data[i * 3 + 2] = x;

			}

			if(this.perturbMap !== null) { this.perturbMap.dispose(); }

			this.perturbMap = new THREE.DataTexture(data, size, size, THREE.RGBFormat, THREE.FloatType);
			this.perturbMap.needsUpdate = true;

			this.material.uniforms.tPerturb.value = this.perturbMap;

		}

	}

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

	GlitchPass.Mode = {
		SPORADIC: 0,
		CONSTANT_MILD: 1,
		CONSTANT_WILD: 2
	};

	/**
	 * Used for saving the original clear color during 
	 * the rendering process of the masked scene.
	 *
	 * @property clearColor
	 * @type Color
	 * @private
	 * @static
	 */

	const clearColor = new THREE.Color();

	/**
	 * A crepuscular rays pass.
	 *
	 * @class GodRaysPass
	 * @submodule passes
	 * @extends Pass
	 * @constructor
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

	class GodRaysPass extends Pass {

		constructor(scene, camera, lightSource, options) {

			super();

			if(options === undefined) { options = {}; }

			/**
			 * A render target for rendering the masked scene.
			 *
			 * @property renderTargetMask
			 * @type WebGLRenderTarget
			 * @private
			 */

			this.renderTargetMask = new THREE.WebGLRenderTarget(1, 1, {
				minFilter: THREE.LinearFilter,
				magFilter: THREE.LinearFilter,
				generateMipmaps: false
			});

			/**
			 * A render target.
			 *
			 * @property renderTargetX
			 * @type WebGLRenderTarget
			 * @private
			 */

			this.renderTargetX = this.renderTargetMask.clone();
			this.renderTargetX.stencilBuffer = false;
			this.renderTargetX.depthBuffer = false;

			/**
			 * A second render target.
			 *
			 * @property renderTargetY
			 * @type WebGLRenderTarget
			 * @private
			 */

			this.renderTargetY = this.renderTargetX.clone();

			/**
			 * The resolution scale.
			 *
			 * You need to call the setSize method of the EffectComposer 
			 * after changing this value.
			 *
			 * @property resolutionScale
			 * @type Number
			 * @default 0.5
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
			 * A convolution blur shader material.
			 *
			 * @property convolutionMaterial
			 * @type ConvolutionMaterial
			 * @private
			 */

			this.convolutionMaterial = new ConvolutionMaterial();

			this.blurriness = (options.blurriness !== undefined) ? options.blurriness : 0.1;

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
			 * The main scene.
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

		}

		/**
		 * The strength of the preliminary blur phase.
		 *
		 * @property blurriness
		 * @type Number
		 * @default 0.1
		 */

		get blurriness() { return this.convolutionMaterial.scale; }

		set blurriness(x) {

			if(typeof x === "number") {

				this.convolutionMaterial.scale = x;

			}

		}

		/**
		 * The overall intensity of the effect.
		 *
		 * @property intensity
		 * @type Number
		 * @default 1.0
		 */

		get intensity() { return this.combineMaterial.uniforms.opacity2.value; }

		set intensity(x) {

			if(typeof x === "number") {

				this.combineMaterial.uniforms.opacity2.value = x;
				this.copyMaterial.uniforms.opacity.value = x;

			}

		}

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

		get samples() { return Number.parseInt(this.godRaysMaterial.defines.NUM_SAMPLES_INT); }

		set samples(x) {

			if(typeof x === "number" && x > 0) {

				x = Math.floor(x);

				this.godRaysMaterial.defines.NUM_SAMPLES_FLOAT = x.toFixed(1);
				this.godRaysMaterial.defines.NUM_SAMPLES_INT = x.toFixed(0);
				this.godRaysMaterial.needsUpdate = true;

			}

		}

		/**
		 * Renders the scene.
		 *
		 * The read buffer is assumed to contain the normally rendered scene.
		 * The god rays pass has four phases with a total of 8 render steps.
		 *
		 * Mask Phase:
		 *  The scene is rendered using a mask material.
		 *
		 * Preliminary Blur Phase:
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
		 * @param {WebGLRenderTarget} readBuffer - The read buffer.
		 */

		render(renderer, readBuffer) {

			let clearAlpha;
			let state = renderer.state;

			// Compute the screen light position and translate the coordinates to [0, 1].
			this.screenPosition.copy(this.lightSource.position).project(this.mainCamera);
			this.screenPosition.x = THREE.Math.clamp((this.screenPosition.x + 1.0) * 0.5, 0.0, 1.0);
			this.screenPosition.y = THREE.Math.clamp((this.screenPosition.y + 1.0) * 0.5, 0.0, 1.0);

			// Render the masked scene.
			this.mainScene.overrideMaterial = this.maskMaterial;
			clearColor.copy(renderer.getClearColor());
			clearAlpha = renderer.getClearAlpha();
			renderer.setClearColor(0x000000, 1);
			state.setDepthWrite(true);
			renderer.render(this.mainScene, this.mainCamera, this.renderTargetMask, true);
			state.setDepthWrite(false);
			renderer.setClearColor(clearColor, clearAlpha);
			this.mainScene.overrideMaterial = null;

			// Convolution phase (5 passes).
			this.quad.material = this.convolutionMaterial;

			this.convolutionMaterial.adjustKernel();
			this.convolutionMaterial.uniforms.tDiffuse.value = this.renderTargetMask.texture;
			renderer.render(this.scene, this.camera, this.renderTargetX);

			this.convolutionMaterial.adjustKernel();
			this.convolutionMaterial.uniforms.tDiffuse.value = this.renderTargetX.texture;
			renderer.render(this.scene, this.camera, this.renderTargetY);

			this.convolutionMaterial.adjustKernel();
			this.convolutionMaterial.uniforms.tDiffuse.value = this.renderTargetY.texture;
			renderer.render(this.scene, this.camera, this.renderTargetX);

			this.convolutionMaterial.adjustKernel();
			this.convolutionMaterial.uniforms.tDiffuse.value = this.renderTargetX.texture;
			renderer.render(this.scene, this.camera, this.renderTargetY);

			this.convolutionMaterial.adjustKernel();
			this.convolutionMaterial.uniforms.tDiffuse.value = this.renderTargetY.texture;
			renderer.render(this.scene, this.camera, this.renderTargetX);

			// God rays pass.
			this.quad.material = this.godRaysMaterial;
			this.godRaysMaterial.uniforms.tDiffuse.value = this.renderTargetX.texture;
			renderer.render(this.scene, this.camera, this.renderTargetY);

			// Final pass - composite god rays onto colors.
			if(this.renderToScreen) {

				this.quad.material = this.combineMaterial;
				this.combineMaterial.uniforms.texture1.value = readBuffer.texture;
				this.combineMaterial.uniforms.texture2.value = this.renderTargetY.texture;

				renderer.render(this.scene, this.camera);

			} else {

				this.quad.material = this.copyMaterial;
				this.copyMaterial.uniforms.tDiffuse.value = this.renderTargetY.texture;

				renderer.render(this.scene, this.camera, readBuffer);

			}

		}

		/**
		 * Adjusts the format and size of the render targets.
		 *
		 * @method initialise
		 * @param {WebGLRenderer} renderer - The renderer.
		 * @param {Boolean} alpha - Whether the renderer uses the alpha channel or not.
		 */

		initialise(renderer, alpha) {

			let size = renderer.getSize();
			this.setSize(size.width, size.height);

			if(!alpha) {

				this.renderTargetMask.texture.format = THREE.RGBFormat;
				this.renderTargetX.texture.format = THREE.RGBFormat;
				this.renderTargetY.texture.format = THREE.RGBFormat;

			}

		}

		/**
		 * Updates this pass with the renderer's size.
		 *
		 * @method setSize
		 * @param {Number} width - The width.
		 * @param {Number} height - The height.
		 */

		setSize(width, height) {

			width = Math.floor(width * this.resolutionScale);
			height = Math.floor(height * this.resolutionScale);

			if(width <= 0) { width = 1; }
			if(height <= 0) { height = 1; }

			this.renderTargetMask.setSize(width, height);
			this.renderTargetX.setSize(width, height);
			this.renderTargetY.setSize(width, height);

			this.convolutionMaterial.setTexelSize(1.0 / width, 1.0 / height);

		}

	}

	/**
	 * A mask pass.
	 *
	 * @class MaskPass
	 * @submodule passes
	 * @extends Pass
	 * @constructor
	 * @param {Scene} scene - The scene to render.
	 * @param {Camera} camera - The camera to use to render the scene.
	 */

	class MaskPass extends Pass {

		constructor(scene, camera) {

			super(scene, camera, null);

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

		/**
		 * Renders the scene as a mask by only setting the stencil bits.
		 * The buffers will both be cleared first.
		 *
		 * @method render
		 * @param {WebGLRenderer} renderer - The renderer to use.
		 * @param {WebGLRenderTarget} readBuffer - The read buffer containing the result of the previous pass.
		 * @param {WebGLRenderTarget} readBuffer - The write buffer.
		 */

		render(renderer, readBuffer, writeBuffer) {

			let ctx = renderer.context;
			let state = renderer.state;

			let writeValue = this.inverse ? 0 : 1;
			let clearValue = 1 - writeValue;

			// Don't update color or depth.
			state.setColorWrite(false);
			state.setDepthWrite(false);

			state.setStencilTest(true);
			state.setStencilOp(ctx.REPLACE, ctx.REPLACE, ctx.REPLACE);
			state.setStencilFunc(ctx.ALWAYS, writeValue, 0xffffffff);
			state.clearStencil(clearValue);

			// Draw the mask into both buffers.
			renderer.render(this.scene, this.camera, readBuffer, this.clear);
			renderer.render(this.scene, this.camera, writeBuffer, this.clear);

			// Re-enable update of color and depth.
			state.setColorWrite(true);
			state.setDepthWrite(true);

			// Only render where stencil is set to 1.
			state.setStencilFunc(ctx.EQUAL, 1, 0xffffffff); // draw if == 1
			state.setStencilOp(ctx.KEEP, ctx.KEEP, ctx.KEEP);

		}

	}

	/**
	 * Used for saving the original clear color during rendering.
	 *
	 * @property clearColor
	 * @type Color
	 * @private
	 * @static
	 */

	const clearColor$1 = new THREE.Color();

	/**
	 * A pass that renders a given scene directly on screen
	 * or into the read buffer for further processing.
	 *
	 * In addition to that, this pass can also render a depth 
	 * texture which may be used by other passes.
	 *
	 * @class RenderPass
	 * @submodule passes
	 * @extends Pass
	 * @constructor
	 * @param {Scene} scene - The scene to render.
	 * @param {Camera} camera - The camera to use to render the scene.
	 * @param {Object} [options] - Additional options.
	 * @param {Material} [options.overrideMaterial] - An override material for the scene.
	 * @param {Color} [options.clearColor] - An override clear color.
	 * @param {Number} [options.clearAlpha] - An override clear alpha.
	 */

	class RenderPass extends Pass {

		constructor(scene, camera, options) {

			super(scene, camera, null);

			if(options === undefined) { options = {}; }

			/**
			 * Override material.
			 *
			 * @property overrideMaterial
			 * @type Material
			 */

			this.overrideMaterial = (options.overrideMaterial !== undefined) ? options.overrideMaterial : null;

			/**
			 * Clear color.
			 *
			 * @property clearColor
			 * @type Color
			 */

			this.clearColor = (options.clearColor !== undefined) ? options.clearColor : null;

			/**
			 * Clear alpha.
			 *
			 * @property clearAlpha
			 * @type Number
			 */

			this.clearAlpha = (options.clearAlpha === undefined) ? 1.0 : THREE.Math.clamp(options.clearAlpha, 0.0, 1.0);

			/**
			 * Clear flag.
			 *
			 * @property clear
			 * @type Boolean
			 * @default true
			 */

			this.clear = true;

		}

		/**
		 * Renders the scene.
		 *
		 * @method render
		 * @param {WebGLRenderer} renderer - The renderer to use.
		 * @param {WebGLRenderTarget} readBuffer - The read buffer.
		 */

		render(renderer, readBuffer) {

			let clearAlpha;
			let state = renderer.state;

			state.setDepthWrite(true);

			this.scene.overrideMaterial = this.overrideMaterial;

			if(this.clearColor !== null) {

				clearColor$1.copy(renderer.getClearColor());
				clearAlpha = renderer.getClearAlpha();
				renderer.setClearColor(this.clearColor, this.clearAlpha);

			}

			if(this.renderToScreen) {

				renderer.render(this.scene, this.camera, null, this.clear);

			} else {

				renderer.render(this.scene, this.camera, readBuffer, this.clear);

			}

			if(this.clearColor !== null) {

				renderer.setClearColor(clearColor$1, clearAlpha);

			}

			this.scene.overrideMaterial = null;

			state.setDepthWrite(false);

		}

	}

	/**
	 * A save pass that renders the result from a previous 
	 * pass (read buffer) to an arbitrary render target.
	 *
	 * @class SavePass
	 * @submodule passes
	 * @extends Pass
	 * @constructor
	 * @param {Scene} renderTarget - The render target to use for saving the read buffer.
	 * @param {Boolean} [resize] - Whether the render target should adjust to the size of the read/write buffer.
	 */

	class SavePass extends Pass {

		constructor(renderTarget, resize) {

			super();

			/**
			 * Copy shader material.
			 *
			 * @property material
			 * @type CopyMaterial
			 * @private
			 */

			this.material = new CopyMaterial();

			this.quad.material = this.material;

			/**
			 * The render target.
			 *
			 * @property renderTarget
			 * @type WebGLRenderTarget
			 * @private
			 */

			this.renderTarget = (renderTarget !== undefined) ? renderTarget : null;

			/**
			 * Indicates whether the render target should be resized when
			 * the size of the composer's read/write buffer changes.
			 *
			 * @property resize
			 * @type Boolean
			 * @default true
			 */

			this.resize = (resize !== undefined) ? resize : true;

		}

		/**
		 * Saves the read buffer.
		 *
		 * @method render
		 * @param {WebGLRenderer} renderer - The renderer to use.
		 * @param {WebGLRenderTarget} readBuffer - The read buffer.
		 */

		render(renderer, readBuffer) {

			this.material.uniforms.tDiffuse.value = readBuffer.texture;
			renderer.render(this.scene, this.camera, this.renderTarget, this.clear);

		}

		/**
		 * Updates this pass with the renderer's size.
		 *
		 * @method setSize
		 * @param {Number} width - The width.
		 * @param {Number} height - The height.
		 */

		setSize(width, height) {

			if(this.resize && this.renderTarget !== null) {

				if(width <= 0) { width = 1; }
				if(height <= 0) { height = 1; }

				this.renderTarget.setSize(width, height);

			}

		}

	}

	/**
	 * Subpixel Morphological Antialiasing (SMAA) v2.8.
	 *
	 * Preset: SMAA 1x Medium (with color edge detection).
	 *  https://github.com/iryoku/smaa/releases/tag/v2.8
	 *
	 * @class SMAAPass
	 * @submodule passes
	 * @extends Pass
	 * @constructor
	 * @param {Image} Image - This pass requires an Image class to create internal textures. Provide window.Image in a browser environment.
	 */

	class SMAAPass extends Pass {

		constructor(Image) {

			super();

			this.needsSwap = true;

			/**
			 * A render target for the color edge detection.
			 *
			 * @property renderTargetColorEdges
			 * @type WebGLRenderTarget
			 * @private
			 */

			this.renderTargetColorEdges = new THREE.WebGLRenderTarget(1, 1, {
				minFilter: THREE.LinearFilter,
				format: THREE.RGBFormat,
				generateMipmaps: false,
				stencilBuffer: false,
				depthBuffer: false
			});

			/**
			 * A render target for the SMAA weights.
			 *
			 * @property renderTargetWeights
			 * @type Material
			 * @private
			 */

			this.renderTargetWeights = this.renderTargetColorEdges.clone();

			this.renderTargetWeights.texture.format = THREE.RGBAFormat;

			/**
			 * SMAA color edge detection shader material.
			 *
			 * @property colorEdgesMaterial
			 * @type SMAAColorEdgesMaterial
			 * @private
			 */

			this.colorEdgesMaterial = new SMAAColorEdgesMaterial();

			/**
			 * SMAA weights shader material.
			 *
			 * @property weightsMaterial
			 * @type SMAAWeightsMaterial
			 * @private
			 */

			this.weightsMaterial = new SMAAWeightsMaterial();

			let areaImage = new Image();
			areaImage.src = this.weightsMaterial.areaImage;

			let areaTexture = new THREE.Texture();
			areaTexture.image = areaImage;
			areaTexture.minFilter = THREE.LinearFilter;
			areaTexture.format = THREE.RGBFormat;
			areaTexture.generateMipmaps = false;
			areaTexture.needsUpdate = true;
			areaTexture.flipY = false;

			let searchImage = new Image();
			searchImage.src = this.weightsMaterial.searchImage;

			let searchTexture = new THREE.Texture();
			searchTexture.image = searchImage;
			searchTexture.magFilter = THREE.NearestFilter;
			searchTexture.minFilter = THREE.NearestFilter;
			searchTexture.generateMipmaps = false;
			searchTexture.needsUpdate = true;
			searchTexture.flipY = false;

			this.weightsMaterial.uniforms.tDiffuse.value = this.renderTargetColorEdges.texture;
			this.weightsMaterial.uniforms.tArea.value = areaTexture;
			this.weightsMaterial.uniforms.tSearch.value = searchTexture;

			/**
			 * SMAA blend shader material.
			 *
			 * @property blendMaterial
			 * @type SMAABlendMaterial
			 * @private
			 */

			this.blendMaterial = new SMAABlendMaterial();

			this.blendMaterial.uniforms.tWeights.value = this.renderTargetWeights.texture;

			this.quad.material = this.blendMaterial;

		}

		/**
		 * Antialiases the scene.
		 *
		 * @method render
		 * @param {WebGLRenderer} renderer - The renderer to use.
		 * @param {WebGLRenderTarget} readBuffer - The read buffer.
		 * @param {WebGLRenderTarget} writeBuffer - The write buffer.
		 */

		render(renderer, readBuffer, writeBuffer) {

			// Detect color edges.
			this.quad.material = this.colorEdgesMaterial;
			this.colorEdgesMaterial.uniforms.tDiffuse.value = readBuffer.texture;
			renderer.render(this.scene, this.camera, this.renderTargetColorEdges, true);

			// Compute edge weights.
			this.quad.material = this.weightsMaterial;
			renderer.render(this.scene, this.camera, this.renderTargetWeights, false);

			// Apply the antialiasing filter to the colors.
			this.quad.material = this.blendMaterial;
			this.blendMaterial.uniforms.tDiffuse.value = readBuffer.texture;

			if(this.renderToScreen) {

				renderer.render(this.scene, this.camera);

			} else {

				renderer.render(this.scene, this.camera, writeBuffer, false);

			}

		}

		/**
		 * Adjusts the format and size of the render targets.
		 *
		 * @method initialise
		 * @param {WebGLRenderer} renderer - The renderer.
		 * @param {Boolean} alpha - Whether the renderer uses the alpha channel or not.
		 */

		initialise(renderer, alpha) {

			let size = renderer.getSize();
			this.setSize(size.width, size.height);

		}

		/**
		 * Updates this pass with the renderer's size.
		 *
		 * @method setSize
		 * @param {Number} width - The width.
		 * @param {Number} height - The height.
		 */

		setSize(width, height) {

			this.renderTargetColorEdges.setSize(width, height);
			this.renderTargetWeights.setSize(width, height);

			this.colorEdgesMaterial.uniforms.texelSize.value.copy(
				this.weightsMaterial.uniforms.texelSize.value.copy(
					this.blendMaterial.uniforms.texelSize.value.set(1.0 / width, 1.0 / height)
			));

		}

	}

	/**
	 * A shader pass.
	 *
	 * Used to render any shader material as a 2D filter.
	 *
	 * @class ShaderPass
	 * @submodule passes
	 * @extends Pass
	 * @constructor
	 * @param {ShaderMaterial} material - The shader material to use.
	 * @param {String} [textureID="tDiffuse"] - The texture uniform identifier.
	 */

	class ShaderPass extends Pass {

		constructor(material, textureID) {

			super();

			this.needsSwap = true;

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

			this.quad.material = this.material;

		}

		/**
		 * Renders the effect.
		 *
		 * @method render
		 * @param {WebGLRenderer} renderer - The renderer to use.
		 * @param {WebGLRenderTarget} buffer - The read/write buffer.
		 */

		render(renderer, readBuffer, writeBuffer) {

			if(this.material.uniforms[this.textureID] !== undefined) {

				this.material.uniforms[this.textureID].value = readBuffer.texture;

			}

			if(this.renderToScreen) {

				renderer.render(this.scene, this.camera);

			} else {

				renderer.render(this.scene, this.camera, writeBuffer, this.clear);

			}

		}

	}

	/**
	 * A tone mapping pass that supports adaptive luminosity.
	 *
	 * If adaptivity is enabled, this pass generates a texture that represents 
	 * the luminosity of the current scene and adjusts it over time to simulate 
	 * the optic nerve responding to the amount of light it is receiving.
	 *
	 * Reference:
	 *  GDC2007 - Wolfgang Engel, Post-Processing Pipeline
	 *  http://www.graphics.cornell.edu/~jaf/publications/sig02_paper.pdf
	 *
	 * @class ToneMappingPass
	 * @submodule passes
	 * @extends Pass
	 * @constructor
	 * @param {Object} [options] - The options.
	 * @param {Boolean} [options.adaptive=true] - Whether the tone mapping should use an adaptive luminance map.
	 * @param {Number} [options.resolution=256] - The render texture resolution.
	 * @param {Number} [options.distinction=1.0] - A luminance distinction factor.
	 */

	class ToneMappingPass extends Pass {

		constructor(options) {

			super();

			this.needsSwap = true;

			if(options === undefined) { options = {}; }

			/**
			 * Render target for the current limonosity.
			 *
			 * @property renderTargetLuminosity
			 * @type WebGLRenderTarget
			 * @private
			 */

			this.renderTargetLuminosity = new THREE.WebGLRenderTarget(1, 1, {
				minFilter: THREE.LinearMipMapLinearFilter,
				magFilter: THREE.LinearFilter,
				format: THREE.RGBFormat, // Change to RED format in WebGL 2.0! Don't need colours.
				stencilBuffer: false,
				depthBuffer: false
			});

			/**
			 * Adapted luminance render target.
			 *
			 * @property renderTargetLuminosity
			 * @type WebGLRenderTarget
			 * @private
			 */

			this.renderTargetAdapted = this.renderTargetLuminosity.clone();

			this.renderTargetAdapted.texture.generateMipmaps = false;
			this.renderTargetAdapted.texture.minFilter = THREE.LinearFilter;

			/**
			 * Render target that holds a copy of the adapted limonosity.
			 *
			 * @property renderTargetX
			 * @type WebGLRenderTarget
			 * @private
			 */

			this.renderTargetPrevious = this.renderTargetAdapted.clone();

			/**
			 * Copy shader material used for saving the luminance map.
			 *
			 * @property copyMaterial
			 * @type CopyMaterial
			 * @private
			 */

			this.copyMaterial = new CopyMaterial();

			/**
			 * Luminosity shader material.
			 *
			 * @property luminosityMaterial
			 * @type LuminosityMaterial
			 * @private
			 */

			this.luminosityMaterial = new LuminosityMaterial();

			this.luminosityMaterial.uniforms.distinction.value = (options.distinction === undefined) ? 1.0 : options.distinction;

			/**
			 * Adaptive luminance shader material.
			 *
			 * @property adaptiveLuminosityMaterial
			 * @type AdaptiveLuminosityMaterial
			 * @private
			 */

			this.adaptiveLuminosityMaterial = new AdaptiveLuminosityMaterial();

			this.resolution = (options.resolution === undefined) ? 256 : options.resolution;

			/**
			 * Tone mapping shader material.
			 *
			 * @property toneMappingMaterial
			 * @type ToneMappingMaterial
			 * @private
			 */

			this.toneMappingMaterial = new ToneMappingMaterial();

			this.adaptive = (options.adaptive === undefined) ? true : options.adaptive;

		}

		/**
		 * The resolution of the render targets. Must be a power of two for mipmapping.
		 *
		 * @property resolution
		 * @type Number
		 * @default 256
		 */

		get resolution() { return this.renderTargetLuminosity.width; }

		set resolution(x) {

			if(typeof x === "number" && x > 0) {

				this.renderTargetLuminosity.setSize(x, x);
				this.renderTargetPrevious.setSize(x, x); // Hm..
				this.renderTargetAdapted.setSize(x, x);

				this.adaptiveLuminosityMaterial.defines.MIP_LEVEL_1X1 = (Math.round(Math.log(x)) / Math.log(2)).toFixed(1);
				this.adaptiveLuminosityMaterial.needsUpdate = true;

			}

		}

		/**
		 * Whether this pass uses adaptive luminosity.
		 *
		 * @property adaptive
		 * @type Boolean
		 */

		get adaptive() { return this.toneMappingMaterial.defines.ADAPTED_LUMINANCE !== undefined; }

		set adaptive(x) {

			if(x) {

				this.toneMappingMaterial.defines.ADAPTED_LUMINANCE = "1";
				this.toneMappingMaterial.uniforms.luminanceMap.value = this.renderTargetAdapted.texture;

			} else {

				delete this.toneMappingMaterial.defines.ADAPTED_LUMINANCE;
				this.toneMappingMaterial.uniforms.luminanceMap.value = null;

			}

			this.toneMappingMaterial.needsUpdate = true;

		}

		/**
		 * Renders the effect.
		 *
		 * @method render
		 * @param {WebGLRenderer} renderer - The renderer to use.
		 * @param {WebGLRenderTarget} readBuffer - The read buffer.
		 * @param {WebGLRenderTarget} writeBuffer - The write buffer.
		 * @param {Number} delta - The render delta time.
		 */

		render(renderer, readBuffer, writeBuffer, delta) {

			let state = renderer.state;

			if(this.adaptive) {

				// Render the luminance of the current scene into a render target with mipmapping enabled.
				this.quad.material = this.luminosityMaterial;
				this.luminosityMaterial.uniforms.tDiffuse.value = readBuffer.texture;
				state.setDepthWrite(true);
				renderer.render(this.scene, this.camera, this.renderTargetLuminosity);
				state.setDepthWrite(false);

				// Use the new luminance values, the previous luminance and the frame delta to adapt the luminance over time.
				this.quad.material = this.adaptiveLuminosityMaterial;
				this.adaptiveLuminosityMaterial.uniforms.delta.value = delta;
				this.adaptiveLuminosityMaterial.uniforms.tPreviousLum.value = this.renderTargetPrevious.texture;
				this.adaptiveLuminosityMaterial.uniforms.tCurrentLum.value = this.renderTargetLuminosity.texture;
				renderer.render(this.scene, this.camera, this.renderTargetAdapted);

				// Copy the new adapted luminance value so that it can be used by the next frame.
				this.quad.material = this.copyMaterial;
				this.copyMaterial.uniforms.tDiffuse.value = this.renderTargetAdapted.texture;
				renderer.render(this.scene, this.camera, this.renderTargetPrevious);

			}

			// Apply the tone mapping to the colours.
			this.quad.material = this.toneMappingMaterial;
			this.toneMappingMaterial.uniforms.tDiffuse.value = readBuffer.texture;

			if(this.renderToScreen) {

				renderer.render(this.scene, this.camera);

			} else {

				renderer.render(this.scene, this.camera, writeBuffer, false);

			}

		}

		/**
		 * Renders something into the previous luminosity texture.
		 *
		 * @method initialise
		 * @param {WebGLRenderer} renderer - The renderer.
		 */

		initialise(renderer) {

			this.quad.material = new THREE.MeshBasicMaterial({color: 0x7fffff});
			renderer.render(this.scene, this.camera, this.renderTargetPrevious);
			this.quad.material.dispose();

		}

	}

	/**
	 * The EffectComposer may be used in place of a normal WebGLRenderer.
	 *
	 * It will disable the auto clear behaviour of the provided renderer to prevent 
	 * unnecessary clear operations. The depth buffer will also be disabled for 
	 * writing. Passes that rely on the depth test must explicitly enable it.
	 *
	 * You may want to use a {{#crossLink "RenderPass"}}{{/crossLink}} as your first 
	 * pass to automatically clear the screen and render the scene to a texture for 
	 * further processing.
	 *
	 * @class EffectComposer
	 * @constructor
	 * @module postprocessing
	 * @param {WebGLRenderer} [renderer] - The renderer that should be used in the passes.
	 * @param {Boolean} [depthTexture=false] - Set to true, if one of your passes relies on the depth of the main scene.
	 * @param {Boolean} [stencilBuffer=false] - Whether the main render targets should have a stencil buffer.
	 */

	class EffectComposer {

		constructor(renderer, depthTexture, stencilBuffer) {

			if(depthTexture === undefined) { depthTexture = false; }
			if(stencilBuffer === undefined) { stencilBuffer = false; }

			/**
			 * The renderer.
			 *
			 * @property renderer
			 * @type WebGLRenderer
			 */

			this.renderer = (renderer !== undefined) ? renderer : new THREE.WebGLRenderer();

			this.renderer.autoClear = false;
			this.renderer.state.setDepthWrite(false);

			/**
			 * The read buffer.
			 *
			 * Reading from and writing to the same render target should be avoided. 
			 * Therefore, two seperate, yet identical buffers are used.
			 *
			 * @property readBuffer
			 * @type WebGLRenderTarget
			 * @private
			 */

			this.readBuffer = this.createBuffer(stencilBuffer);

			this.readBuffer.texture.generateMipmaps = false;

			/**
			 * The write buffer.
			 *
			 * @property writeBuffer
			 * @type WebGLRenderTarget
			 * @private
			 */

			this.writeBuffer = this.readBuffer.clone();

			if(depthTexture) {

				this.readBuffer.depthTexture = this.writeBuffer.depthTexture = new THREE.DepthTexture();

			}

			/**
			 * A copy pass used for copying masked scenes.
			 *
			 * @property copyPass
			 * @type ShaderPass
			 * @private
			 */

			this.copyPass = new ShaderPass(new CopyMaterial());

			/**
			 * The render passes.
			 *
			 * @property passes
			 * @type Array
			 * @private
			 */

			this.passes = [];

		}

		/**
		 * Creates a new render target by replicating the renderer's canvas.
		 *
		 * @method createBuffer
		 * @param {Boolean} stencilBuffer - Whether the render target should have a stencil buffer.
		 * @return {WebGLRenderTarget} A fresh render target that equals the renderer's canvas.
		 */

		createBuffer(stencilBuffer) {

			let size = this.renderer.getSize();
			let alpha = this.renderer.context.getContextAttributes().alpha;

			return new THREE.WebGLRenderTarget(size.width, size.height, {
				minFilter: THREE.LinearFilter,
				magFilter: THREE.LinearFilter,
				format: alpha ? THREE.RGBAFormat : THREE.RGBFormat,
				stencilBuffer: stencilBuffer
			});

		}

		/**
		 * Adds a pass, optionally at a specific index.
		 *
		 * @method addPass
		 * @param {Pass} pass - A new pass.
		 * @param {Number} [index] - An index at which the pass should be inserted.
		 */

		addPass(pass, index) {

			pass.initialise(this.renderer, this.renderer.context.getContextAttributes().alpha);

			if(index !== undefined) {

				this.passes.splice(index, 0, pass);

			}	else {

				this.passes.push(pass);

			}

		}

		/**
		 * Removes a pass.
		 *
		 * @method removePass
		 * @param {Pass} pass - The pass.
		 */

		removePass(pass) {

			this.passes.splice(this.passes.indexOf(pass), 1);

		}

		/**
		 * Renders all enabled passes in the order in which they were added.
		 *
		 * @method render
		 * @param {Number} delta - The time between the last frame and the current one in seconds.
		 */

		render(delta) {

			let readBuffer = this.readBuffer;
			let writeBuffer = this.writeBuffer;

			let maskActive = false;
			let i, l, pass, buffer, ctx;

			for(i = 0, l = this.passes.length; i < l; ++i) {

				pass = this.passes[i];

				if(pass.enabled) {

					pass.render(this.renderer, readBuffer, writeBuffer, delta, maskActive);

					if(pass.needsSwap) {

						if(maskActive) {

							ctx = this.renderer.context;
							ctx.stencilFunc(ctx.NOTEQUAL, 1, 0xffffffff);
							this.copyPass.render(this.renderer, readBuffer, writeBuffer);
							ctx.stencilFunc(ctx.EQUAL, 1, 0xffffffff);

						}

						buffer = readBuffer;
						readBuffer = writeBuffer;
						writeBuffer = buffer;

					}

					if(pass instanceof MaskPass) {

						maskActive = true;

					} else if(pass instanceof ClearMaskPass) {

						maskActive = false;

					}

				}

			}

		}

		/**
		 * Sets the size of the buffers and the renderer's output canvas.
		 *
		 * Every pass will be informed of the new size. It's up to each pass how that 
		 * information is used.
		 *
		 * If no width or height is specified, the render targets and passes will be 
		 * updated with the current size of the renderer.
		 *
		 * @method setSize
		 * @param {Number} [width] - The width.
		 * @param {Number} [height] - The height.
		 */

		setSize(width, height) {

			let i, l;
			let size;

			if(width === undefined || height === undefined) {

				size = this.renderer.getSize();
				width = size.width;
				height = size.height;

			}

			this.renderer.setSize(width, height);
			this.readBuffer.setSize(width, height);
			this.writeBuffer.setSize(width, height);

			for(i = 0, l = this.passes.length; i < l; ++i) {

				this.passes[i].setSize(width, height);

			}

		}

		/**
		 * Resets this composer by deleting all passes and creating new buffers.
		 *
		 * @method reset
		 * @param {WebGLRenderTarget} [renderTarget] - A new render target to use. If none is provided, the settings of the renderer will be used.
		 */

		reset(renderTarget) {

			this.dispose((renderTarget === undefined) ? this.createBuffer() : renderTarget);

		}

		/**
		 * Destroys all passes and render targets.
		 *
		 * This method deallocates all render targets, textures and materials created 
		 * by the passes. It also deletes this composer's frame buffers.
		 *
		 * Note: the reset method uses the dispose method internally.
		 *
		 * @method dispose
		 * @param {WebGLRenderTarget} [renderTarget] - A new render target. If none is provided, the composer will become inoperative.
		 */

		dispose(renderTarget) {

			this.readBuffer.dispose();
			this.writeBuffer.dispose();

			this.readBuffer = this.writeBuffer = null;

			while(this.passes.length > 0) {

				this.passes.pop().dispose();

			}

			if(renderTarget !== undefined) {

				// Reanimate.
				this.readBuffer = renderTarget;
				this.writeBuffer = this.readBuffer.clone();

			} else {

				this.copyPass.dispose();

			}

		}

	}

	exports.EffectComposer = EffectComposer;
	exports.BloomPass = BloomPass;
	exports.BokehPass = BokehPass;
	exports.Bokeh2Pass = Bokeh2Pass;
	exports.ClearMaskPass = ClearMaskPass;
	exports.DotScreenPass = DotScreenPass;
	exports.FilmPass = FilmPass;
	exports.GlitchPass = GlitchPass;
	exports.GodRaysPass = GodRaysPass;
	exports.MaskPass = MaskPass;
	exports.Pass = Pass;
	exports.RenderPass = RenderPass;
	exports.SavePass = SavePass;
	exports.SMAAPass = SMAAPass;
	exports.ShaderPass = ShaderPass;
	exports.ToneMappingPass = ToneMappingPass;
	exports.AdaptiveLuminosityMaterial = AdaptiveLuminosityMaterial;
	exports.BokehMaterial = BokehMaterial;
	exports.Bokeh2Material = Bokeh2Material;
	exports.CombineMaterial = CombineMaterial;
	exports.ConvolutionMaterial = ConvolutionMaterial;
	exports.CopyMaterial = CopyMaterial;
	exports.DotScreenMaterial = DotScreenMaterial;
	exports.FilmMaterial = FilmMaterial;
	exports.GlitchMaterial = GlitchMaterial;
	exports.GodRaysMaterial = GodRaysMaterial;
	exports.LuminosityMaterial = LuminosityMaterial;
	exports.SMAABlendMaterial = SMAABlendMaterial;
	exports.SMAAColorEdgesMaterial = SMAAColorEdgesMaterial;
	exports.SMAAWeightsMaterial = SMAAWeightsMaterial;
	exports.ToneMappingMaterial = ToneMappingMaterial;

}));