import { Uniform, Vector3 } from "three";
import { Effect } from "./Effect.js";

import fragmentShader from "./glsl/sepia.frag";

/**
 * A sepia effect.
 *
 * Based on https://github.com/evanw/glfx.js
 */

export class SepiaEffect extends Effect {

	/**
	 * Constructs a new sepia effect.
	 *
	 * @param {Object} [options] - The options.
	 * @param {BlendFunction} [options.blendFunction] - The blend function of this effect.
	 * @param {Number} [options.intensity=1.0] - The intensity of the effect.
	 */

	constructor({ blendFunction, intensity = 1.0 } = {}) {

		super("SepiaEffect", fragmentShader, {
			blendFunction,
			uniforms: new Map([
				["weightsR", new Uniform(new Vector3(0.393, 0.769, 0.189))],
				["weightsG", new Uniform(new Vector3(0.349, 0.686, 0.168))],
				["weightsB", new Uniform(new Vector3(0.272, 0.534, 0.131))]
			])
		});

	}

	/**
	 * The intensity.
	 *
	 * @deprecated Use blendMode.opacity instead.
	 * @type {Number}
	 */

	get intensity() {

		return this.blendMode.opacity.value;

	}

	set intensity(value) {

		this.blendMode.opacity.value = value;

	}

	/**
	 * Returns the current sepia intensity.
	 *
	 * @deprecated Use blendMode.opacity instead.
	 * @return {Number} The intensity.
	 */

	getIntensity() {

		return this.intensity;

	}

	/**
	 * Sets the sepia intensity.
	 *
	 * @deprecated Use blendMode.opacity instead.
	 * @param {Number} value - The intensity.
	 */

	setIntensity(value) {

		this.intensity = value;

	}

	/**
	 * The weights for the red channel. Default is `(0.393, 0.769, 0.189)`.
	 *
	 * @type {Vector3}
	 */

	get weightsR() {

		return this.uniforms.get("weightsR").value;

	}

	/**
	 * The weights for the green channel. Default is `(0.349, 0.686, 0.168)`.
	 *
	 * @type {Vector3}
	 */

	get weightsG() {

		return this.uniforms.get("weightsG").value;

	}

	/**
	 * The weights for the blue channel. Default is `(0.272, 0.534, 0.131)`.
	 *
	 * @type {Vector3}
	 */

	get weightsB() {

		return this.uniforms.get("weightsB").value;

	}

}
