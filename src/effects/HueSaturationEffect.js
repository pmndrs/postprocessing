import { Uniform, Vector3 } from "three";
import { BlendFunction } from "./blending/BlendFunction";
import { Effect } from "./Effect";

import fragmentShader from "./glsl/hue-saturation/shader.frag";

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
	 * @param {BlendFunction} [options.blendFunction=BlendFunction.NORMAL] - The blend function of this effect.
	 * @param {Number} [options.hue=0.0] - The hue in radians.
	 * @param {Number} [options.saturation=0.0] - The saturation factor, ranging from -1 to 1, where 0 means no change.
	 */

	constructor({
		blendFunction = BlendFunction.NORMAL,
		hue = 0.0,
		saturation = 0.0
	} = {}) {

		super("HueSaturationEffect", fragmentShader, {
			blendFunction,
			uniforms: new Map([
				["hue", new Uniform(new Vector3())],
				["saturation", new Uniform(saturation)]
			])
		});

		this.setHue(hue);

	}

	/**
	 * Returns the saturation.
	 *
	 * @return {Number} The saturation.
	 */

	getSaturation(value) {

		return this.uniforms.get("saturation").value;

	}

	/**
	 * Sets the saturation.
	 *
	 * @param {Number} value - The saturation.
	 */

	setSaturation(value) {

		this.uniforms.get("saturation").value = value;

	}

	/**
	 * Returns the hue.
	 *
	 * @return {Number} The hue in radians.
	 */

	getHue(value) {

		const hue = this.uniforms.get("hue").value;
		return Math.acos((hue.x * 3.0 - 1.0) / 2.0);

	}

	/**
	 * Sets the hue.
	 *
	 * @param {Number} value - The hue in radians.
	 */

	setHue(value) {

		const s = Math.sin(value), c = Math.cos(value);

		this.uniforms.get("hue").value.set(
			(2.0 * c + 1.0) / 3.0,
			(-Math.sqrt(3.0) * s - c + 1.0) / 3.0,
			(Math.sqrt(3.0) * s - c + 1.0) / 3.0
		);

	}

}
