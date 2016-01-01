import shader from "./inlined/shader";
import THREE from "three";

/**
 * Depth-of-field shader with bokeh ported from GLSL shader by Martins Upitis.
 * http://blenderartists.org/forum/showthread.php?237488-GLSL-depth-of-field-with-bokeh-v2-4-(update)
 *
 * @class BokehMaterial
 * @constructor
 * @extends ShaderMaterial
 */

export function BokehMaterial() {

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

		fragmentShader: shader.fragment,
		vertexShader: shader.vertex,

	});

}

BokehMaterial.prototype = Object.create(THREE.ShaderMaterial.prototype);
BokehMaterial.prototype.constructor = BokehMaterial;
