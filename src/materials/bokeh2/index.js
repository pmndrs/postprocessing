import THREE from "three";

import fragment from "./glsl/shader.frag";
import vertex from "./glsl/shader.vert";

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

export class Bokeh2Material extends THREE.ShaderMaterial {

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

			fragmentShader: fragment,
			vertexShader: vertex

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
