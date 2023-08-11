import { Uniform, Vector2 } from "three";
import { Effect } from "./Effect.js";

import fragmentShader from "./glsl/lens-distortion.frag";

/**
 * A lens distortion effect.
 *
 * Original shader ported from https://github.com/ycw/three-lens-distortion
 */

export class LensDistortionEffect extends Effect {

	/**
	 * Constructs a new lens distortion effect.
	 *
	 * @param {Object} [options] - The options.
	 * @param {Vector2} [options.distortion] - The distortion value.
	 * @param {Vector2} [options.principalPoint] - The center point.
	 * @param {Vector2} [options.focalLength] - The focal length.
	 * @param {Number} [options.skew=0] - The skew value.
	 */

	constructor({
		distortion = new Vector2(0, 0),
		principalPoint = new Vector2(0, 0),
		focalLength = new Vector2(1, 1),
		skew = 0
	} = {}) {

		super("LensDistortionEffect", fragmentShader, {
			uniforms: new Map([
				["distortion", new Uniform(distortion)],
				["principalPoint", new Uniform(principalPoint)],
				["focalLength", new Uniform(focalLength)],
				["skew", new Uniform(skew)]
			])
		});

	}

	/**
	 * The radial distortion coefficients. Default is (0, 0).
	 *
	 * @type {Vector2}
	 */

	get distortion() {

		return this.uniforms.get("distortion").value;

	}

	set distortion(value) {

		this.uniforms.get("distortion").value = value;

	}

	/**
	 * The principal point. Default is (0, 0).
	 *
	 * @type {Vector2}
	 */

	get principalPoint() {

		return this.uniforms.get("principalPoint").value;

	}

	set principalPoint(value) {

		this.uniforms.get("principalPoint").value = value;

	}

	/**
	 * The focal length. Default is (1, 1).
	 *
	 * @type {Vector2}
	 */

	get focalLength() {

		return this.uniforms.get("focalLength").value;

	}

	set focalLength(value) {

		this.uniforms.get("focalLength").value = value;

	}

	/**
	 * The skew factor in radians.
	 *
	 * @type {Number}
	 */

	get skew() {

		return this.uniforms.get("skew").value;

	}

	set skew(value) {

		this.uniforms.get("skew").value = value;

	}

}
