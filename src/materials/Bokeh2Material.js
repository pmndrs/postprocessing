import { ShaderMaterial, Uniform, Vector2 } from "three";

import fragment from "./glsl/bokeh2/shader.frag";
import vertex from "./glsl/bokeh2/shader.vert";

/**
 * Depth of Field shader version 2.4.
 *
 * Original shader code by Martins Upitis:
 *  http://blenderartists.org/forum/showthread.php?237488-GLSL-depth-of-field-with-bokeh-v2-4-(update)
 */

export class Bokeh2Material extends ShaderMaterial {

	/**
	 * Constructs a new bokeh2 material.
	 *
	 * @param {PerspectiveCamera} [camera] - The main camera.
	 * @param {Object} [options] - Additional options.
	 * @param {Vector2} [options.texelSize] - The absolute screen texel size.
	 * @param {Boolean} [options.rings=3] - The number of blurring iterations.
	 * @param {Boolean} [options.samples=2] - The amount of samples taken per ring.
	 * @param {Boolean} [options.showFocus=false] - Whether the focus point should be highlighted.
	 * @param {Boolean} [options.manualDoF=false] - Enables manual depth of field blur.
	 * @param {Boolean} [options.vignette=false] - Enables a vignette effect.
	 * @param {Boolean} [options.pentagon=false] - Enable to use a pentagonal shape to scale gathered texels.
	 * @param {Boolean} [options.shaderFocus=true] - Disable if you compute your own focalDepth (in metres!).
	 * @param {Boolean} [options.noise=true] - Disable if you don't want noise patterns for dithering.
	 */

	constructor(camera = null, options = {}) {

		const settings = Object.assign({
			texelSize: null,
			rings: 3,
			samples: 2,
			showFocus: false,
			manualDoF: false,
			vignette: false,
			pentagon: false,
			shaderFocus: true,
			noise: true
		}, options);

		super({

			type: "Bokeh2Material",

			defines: {

				RINGS_INT: settings.rings.toFixed(0),
				RINGS_FLOAT: settings.rings.toFixed(1),
				SAMPLES_INT: settings.samples.toFixed(0),
				SAMPLES_FLOAT: settings.samples.toFixed(1)

			},

			uniforms: {

				tDiffuse: new Uniform(null),
				tDepth: new Uniform(null),

				texelSize: new Uniform(new Vector2()),
				halfTexelSize: new Uniform(new Vector2()),

				cameraNear: new Uniform(0.1),
				cameraFar: new Uniform(2000),

				focalLength: new Uniform(24.0),
				focalStop: new Uniform(0.9),

				maxBlur: new Uniform(1.0),
				luminanceThreshold: new Uniform(0.5),
				luminanceGain: new Uniform(2.0),
				bias: new Uniform(0.5),
				fringe: new Uniform(0.7),
				ditherStrength: new Uniform(0.0001),

				focusCoords: new Uniform(new Vector2(0.5, 0.5)),
				focalDepth: new Uniform(1.0)

			},

			fragmentShader: fragment,
			vertexShader: vertex,

			depthWrite: false,
			depthTest: false

		});

		this.setShowFocusEnabled(settings.showFocus);
		this.setManualDepthOfFieldEnabled(settings.manualDoF);
		this.setVignetteEnabled(settings.vignette);
		this.setPentagonEnabled(settings.pentagon);
		this.setShaderFocusEnabled(settings.shaderFocus);
		this.setNoiseEnabled(settings.noise);

		if(settings.texelSize !== null) {

			this.setTexelSize(settings.texelSize.x, settings.texelSize.y);

		}

		this.adoptCameraSettings(camera);

	}

	/**
	 * Defines whether the focus should be shown.
	 *
	 * @param {Boolean} enabled - True if the focus should be shown, false otherwise.
	 */

	setShowFocusEnabled(enabled) {

		if(enabled) {

			this.defines.SHOW_FOCUS = "1";

		} else {

			delete this.defines.SHOW_FOCUS;

		}

		this.needsUpdate = true;

	}

	/**
	 * Defines whether manual Depth of Field should be enabled.
	 *
	 * @param {Boolean} enabled - Whether manual DoF should be enabled.
	 */

	setManualDepthOfFieldEnabled(enabled) {

		if(enabled) {

			this.defines.MANUAL_DOF = "1";

		} else {

			delete this.defines.MANUAL_DOF;

		}

		this.needsUpdate = true;

	}

	/**
	 * Defines whether the Vignette effect should be enabled.
	 *
	 * @param {Boolean} enabled - Whether the Vignette effect should be enabled.
	 */

	setVignetteEnabled(enabled) {

		if(enabled) {

			this.defines.VIGNETTE = "1";

		} else {

			delete this.defines.VIGNETTE;

		}

		this.needsUpdate = true;

	}

	/**
	 * Defines whether the pentagonal blur effect should be enabled.
	 *
	 * @param {Boolean} enabled - Whether the pentagonal blur effect should be enabled.
	 */

	setPentagonEnabled(enabled) {

		if(enabled) {

			this.defines.PENTAGON = "1";

		} else {

			delete this.defines.PENTAGON;

		}

		this.needsUpdate = true;

	}

	/**
	 * Enables or disables the automatic shader focus.
	 *
	 * @param {Boolean} enabled - Whether the shader focus should be enabled.
	 */

	setShaderFocusEnabled(enabled) {

		if(enabled) {

			this.defines.SHADER_FOCUS = "1";

		} else {

			delete this.defines.SHADER_FOCUS;

		}

		this.needsUpdate = true;

	}

	/**
	 * Defines whether the dithering should compute noise.
	 *
	 * @param {Boolean} enabled - Whether noise-based dithering should be enabled.
	 */

	setNoiseEnabled(enabled) {

		if(enabled) {

			this.defines.NOISE = "1";

		} else {

			delete this.defines.NOISE;

		}

		this.needsUpdate = true;

	}

	/**
	 * Sets the texel size.
	 *
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
	 * @param {PerspectiveCamera} camera - The main camera.
	 */

	adoptCameraSettings(camera) {

		if(camera !== null) {

			this.uniforms.cameraNear.value = camera.near;
			this.uniforms.cameraFar.value = camera.far;
			this.uniforms.focalLength.value = camera.getFocalLength(); // unit: mm.

		}

	}

}
