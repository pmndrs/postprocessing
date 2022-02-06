import { Uniform } from "three";
import { BlendFunction } from "./blending/BlendFunction";
import { Effect } from "./Effect";

import fragmentShader from "./glsl/brightness-contrast/shader.frag";

/**
 * A brightness/contrast effect.
 *
 * Reference: https://github.com/evanw/glfx.js
 */

export class BrightnessContrastEffect extends Effect {

	/**
	 * Constructs a new brightness/contrast effect.
	 *
	 * @param {Object} [options] - The options.
	 * @param {BlendFunction} [options.blendFunction=BlendFunction.NORMAL] - The blend function of this effect.
	 * @param {Number} [options.brightness=0.0] - The brightness factor, ranging from -1 to 1, where 0 means no change.
	 * @param {Number} [options.contrast=0.0] - The contrast factor, ranging from -1 to 1, where 0 means no change.
	 */

	constructor({ blendFunction = BlendFunction.NORMAL, brightness = 0.0, contrast = 0.0 } = {}) {

		super("BrightnessContrastEffect", fragmentShader, {
			blendFunction,
			uniforms: new Map([
				["brightness", new Uniform(brightness)],
				["contrast", new Uniform(contrast)]
			])
		});

	}

	/**
	 * Returns the brightness.
	 *
	 * @return {Number} The brightness.
	 */

	getBrightness(value) {

		return this.uniforms.get("brightness").value;

	}

	/**
	 * Sets the brightness.
	 *
	 * @param {Number} value - The brightness.
	 */

	setBrightness(value) {

		this.uniforms.get("brightness").value = value;

	}

	/**
	 * Returns the contrast.
	 *
	 * @return {Number} The contrast.
	 */

	getContrast(value) {

		return this.uniforms.get("contrast").value;

	}

	/**
	 * Sets the contrast.
	 *
	 * @param {Number} value - The contrast.
	 */

	setContrast(value) {

		this.uniforms.get("contrast").value = value;

	}

}
