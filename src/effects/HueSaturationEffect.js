import { Uniform, Vector3 } from "three";
import { BlendFunction } from "../enums/BlendFunction.js";
import { Effect } from "./Effect.js";

import fragmentShader from "./glsl/hue-saturation.frag";

/**
 * A hue/saturation effect.
 *
 * Reference: https://github.com/evanw/glfx.js
 */

export class HueSaturationEffect extends Effect {

	/**
	 * Constructs a new hue/saturation effect.
	 *
	 * @param {Object} [options] - The options.
	 * @param {BlendFunction} [options.blendFunction=BlendFunction.SRC] - The blend function of this effect.
	 * @param {Number} [options.hue=0.0] - The hue in radians.
	 * @param {Number} [options.saturation=0.0] - The saturation factor, ranging from -1 to 1, where 0 means no change.
	 */

	constructor({ blendFunction = BlendFunction.SRC, hue = 0.0, saturation = 0.0 } = {}) {

		super("HueSaturationEffect", fragmentShader, {
			blendFunction,
			uniforms: new Map([
				["hue", new Uniform(new Vector3())],
				["saturation", new Uniform(saturation)]
			])
		});

		this.hue = hue;

	}

	/**
	 * The saturation.
	 *
	 * @type {Number}
	 */

	get saturation() {

		return this.uniforms.get("saturation").value;

	}

	set saturation(value) {

		this.uniforms.get("saturation").value = value;

	}

	/**
	 * Returns the saturation.
	 *
	 * @deprecated Use saturation instead.
	 * @return {Number} The saturation.
	 */

	getSaturation() {

		return this.saturation;

	}

	/**
	 * Sets the saturation.
	 *
	 * @deprecated Use saturation instead.
	 * @param {Number} value - The saturation.
	 */

	setSaturation(value) {

		this.saturation = value;

	}

	/**
	 * The hue.
	 *
	 * @type {Number}
	 */

	get hue() {

		const hue = this.uniforms.get("hue").value;
		return Math.acos((hue.x * 3.0 - 1.0) / 2.0);

	}

	set hue(value) {

		const s = Math.sin(value), c = Math.cos(value);

		this.uniforms.get("hue").value.set(
			(2.0 * c + 1.0) / 3.0,
			(-Math.sqrt(3.0) * s - c + 1.0) / 3.0,
			(Math.sqrt(3.0) * s - c + 1.0) / 3.0
		);

	}

	/**
	 * Returns the hue.
	 *
	 * @deprecated Use hue instead.
	 * @return {Number} The hue in radians.
	 */

	getHue() {

		return this.hue;

	}

	/**
	 * Sets the hue.
	 *
	 * @deprecated Use hue instead.
	 * @param {Number} value - The hue in radians.
	 */

	setHue(value) {

		this.hue = value;

	}

}
