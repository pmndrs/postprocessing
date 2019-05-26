import { Uniform, Vector3 } from "three";
import { BlendFunction } from "./blending/BlendFunction.js";
import { Effect } from "./Effect.js";

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

	constructor({ blendFunction = BlendFunction.NORMAL, hue = 0.0, saturation = 0.0 } = {}) {

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
	 * Sets the hue.
	 *
	 * @param {Number} hue - The hue in radians.
	 */

	setHue(hue) {

		const s = Math.sin(hue), c = Math.cos(hue);

		this.uniforms.get("hue").value.set(
			2.0 * c, -Math.sqrt(3.0) * s - c, Math.sqrt(3.0) * s - c
		).addScalar(1.0).divideScalar(3.0);

	}

}
