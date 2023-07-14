import { Uniform, Vector2 } from "three";
import { Effect } from "postprocessing";

import fragmentShader from "./glsl/lens-distortion.frag";

/**
 * Lens distortion effect.
 * Original shader ported from https://github.com/ycw/three-lens-distortion
 */
export class LensDistortionEffect extends Effect {

	/**
	 * Constructs a new lens distortion effect.
	 * @param {Object} [options] - The options.
	 * @param {Vector2} [options.distortion={x: 0, y: 0 }] - The distortion value as vec2.
	 * @param {Vector2} [options.principalPoint={x: 0, y: 0}] - The center point as vec2.
	 * @param {Vector2} [options.focalLength={x: 1, y: 1}] - The focal length as vec2.
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
				["distortion", new Uniform(distortion)], // radial distortion coeff 0 // radial distortion coeff of term r^2
				["principalPoint", new Uniform(principalPoint)],
				["focalLength", new Uniform(focalLength)],
				["skew", new Uniform(skew)]
			])
		});

	}

	/**
	 * Get distortion uniform value
	 * @type {Vector2}
	 */
	get distortion() {

		return this.uniforms.get("distortion").value;

	}

	/**
	 * Set distortion uniform value
	 * @param {Vector2} the distortion value
	 */
	set distortion(value) {

		this.uniforms.get("distortion").value = value;

	}

	/**
	 * Get principal point uniform value
	 * @type {Vector2}
	 */
	get principalPoint() {

		return this.uniforms.get("principalPoint").value;

	}

	/**
	 * Set principal point uniform value
	 * @param {Vector2} the principle center point value
	 */
	set principalPoint(value) {

		this.uniforms.get("principalPoint").value = value;

	}

	/**
	 * Get focal length uniform value
	 * @type {Vector2}
	 */
	get focalLength() {

		return this.uniforms.get("focalLength").value;

	}

	/**
	 * Set focal length uniform value
	 * @param {Vector2} the focal length value
	 */
	set focalLength(value) {

		this.uniforms.get("focalLength").value = value;

	}

	/**
	 * Get skew uniform value
	 * @type {Vector2}
	 */
	get skew() {

		return this.uniforms.get("skew").value;

	}

	/**
	 * Set skew uniform value
	 * @param {Number} the skew value
	 */
	set skew(value) {

		this.uniforms.get("skew").value = value;

	}

}
