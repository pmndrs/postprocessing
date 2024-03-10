import { SRGBColorSpace, Uniform } from "three";
import { BlendFunction } from "../enums/BlendFunction.js";
import { Effect } from "./Effect.js";

import fragmentShader from "./glsl/brightness-contrast.frag";

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
	 * @param {BlendFunction} [options.blendFunction=BlendFunction.SRC] - The blend function of this effect.
	 * @param {Number} [options.brightness=0.0] - The brightness factor, ranging from -1 to 1, where 0 means no change.
	 * @param {Number} [options.contrast=0.0] - The contrast factor, ranging from -1 to 1, where 0 means no change.
	 */

	constructor({ blendFunction = BlendFunction.SRC, brightness = 0.0, contrast = 0.0 } = {}) {

		super("BrightnessContrastEffect", fragmentShader, {
			blendFunction,
			uniforms: new Map([
				["brightness", new Uniform(brightness)],
				["contrast", new Uniform(contrast)]
			])
		});

		this.inputColorSpace = SRGBColorSpace;

	}

	/**
	 * The brightness.
	 *
	 * @type {Number}
	 */

	get brightness() {

		return this.uniforms.get("brightness").value;

	}

	set brightness(value) {

		this.uniforms.get("brightness").value = value;

	}

	/**
	 * Returns the brightness.
	 *
	 * @deprecated Use brightness instead.
	 * @return {Number} The brightness.
	 */

	getBrightness() {

		return this.brightness;

	}

	/**
	 * Sets the brightness.
	 *
	 * @deprecated Use brightness instead.
	 * @param {Number} value - The brightness.
	 */

	setBrightness(value) {

		this.brightness = value;

	}

	/**
	 * The contrast.
	 *
	 * @type {Number}
	 */

	get contrast() {

		return this.uniforms.get("contrast").value;

	}

	set contrast(value) {

		this.uniforms.get("contrast").value = value;

	}

	/**
	 * Returns the contrast.
	 *
	 * @deprecated Use contrast instead.
	 * @return {Number} The contrast.
	 */

	getContrast() {

		return this.contrast;

	}

	/**
	 * Sets the contrast.
	 *
	 * @deprecated Use contrast instead.
	 * @param {Number} value - The contrast.
	 */

	setContrast(value) {

		this.contrast = value;

	}

}
