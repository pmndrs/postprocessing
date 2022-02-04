import { Uniform, Vector2 } from "three";
import { BlendFunction } from "./blending/BlendFunction";
import { Effect } from "./Effect";

import fragmentShader from "./glsl/dot-screen/shader.frag";

/**
 * A dot screen effect.
 */

export class DotScreenEffect extends Effect {

	/**
	 * Constructs a new dot screen effect.
	 *
	 * @param {Object} [options] - The options.
	 * @param {BlendFunction} [options.blendFunction=BlendFunction.NORMAL] - The blend function of this effect.
	 * @param {Number} [options.angle=1.57] - The angle of the dot pattern.
	 * @param {Number} [options.scale=1.0] - The scale of the dot pattern.
	 */

	constructor({
		blendFunction = BlendFunction.NORMAL,
		angle = Math.PI * 0.5,
		scale = 1.0
	} = {}) {

		super("DotScreenEffect", fragmentShader, {
			blendFunction,
			uniforms: new Map([
				["angle", new Uniform(new Vector2())],
				["scale", new Uniform(scale)]
			])
		});

		this.setAngle(angle);

	}

	/**
	 * Returns the pattern angle.
	 *
	 * @return {Number} The angle in radians.
	 */

	getAngle(angle) {

		return Math.acos(this.uniforms.get("angle").value.y);

	}

	/**
	 * Sets the pattern angle.
	 *
	 * @param {Number} angle - The angle in radians.
	 */

	setAngle(angle) {

		this.uniforms.get("angle").value.set(Math.sin(angle), Math.cos(angle));

	}

}
