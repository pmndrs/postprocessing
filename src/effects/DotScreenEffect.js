import { Uniform, Vector2 } from "three";
import { Effect } from "./Effect.js";

import fragmentShader from "./glsl/dot-screen.frag";

/**
 * A dot screen effect.
 */

export class DotScreenEffect extends Effect {

	/**
	 * Constructs a new dot screen effect.
	 *
	 * @param {Object} [options] - The options.
	 * @param {BlendFunction} [options.blendFunction] - The blend function of this effect.
	 * @param {Number} [options.angle=1.57] - The angle of the dot pattern.
	 * @param {Number} [options.scale=1.0] - The scale of the dot pattern.
	 */

	constructor({ blendFunction, angle = Math.PI * 0.5, scale = 1.0 } = {}) {

		super("DotScreenEffect", fragmentShader, {
			blendFunction,
			uniforms: new Map([
				["angle", new Uniform(new Vector2())],
				["scale", new Uniform(scale)]
			])
		});

		this.angle = angle;

	}

	/**
	 * The angle.
	 *
	 * @type {Number}
	 */

	get angle() {

		return Math.acos(this.uniforms.get("angle").value.y);

	}

	set angle(value) {

		this.uniforms.get("angle").value.set(Math.sin(value), Math.cos(value));

	}

	/**
	 * Returns the pattern angle.
	 *
	 * @deprecated Use angle instead.
	 * @return {Number} The angle in radians.
	 */

	getAngle() {

		return this.angle;

	}

	/**
	 * Sets the pattern angle.
	 *
	 * @deprecated Use angle instead.
	 * @param {Number} value - The angle in radians.
	 */

	setAngle(value) {

		this.angle = value;

	}

	/**
	 * The scale.
	 *
	 * @type {Number}
	 */

	get scale() {

		return this.uniforms.get("scale").value;

	}

	set scale(value) {

		this.uniforms.get("scale").value = value;

	}

}
