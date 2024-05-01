import { Uniform, Vector2 } from "three";
import { Effect } from "./Effect.js";

import fragmentShader from "./shaders/lens-distortion.frag";

/**
 * LensDistortionEffect options.
 *
 * @category Effects
 */

export interface LensDistortionEffectOptions {

	/**
	 * The radial distortion coefficients.
	 *
	 * @defaultValue (0, 0)
	 */

	distortion?: Vector2;

	/**
	 * The principal point.
	 *
	 * @defaultValue (0, 0)
	 */

	principalPoint?: Vector2;

	/**
	 * The focal length.
	 *
	 * @defaultValue (1, 1)
	 */

	focalLength?: Vector2;

	/**
	 * The skew factor in radians.
	 *
	 * @defaultValue 0
	 */

	skew?: number;

}

/**
 * A lens distortion effect.
 *
 * Original shader ported from https://github.com/ycw/three-lens-distortion
 */

export class LensDistortionEffect extends Effect {

	/**
	 * Constructs a new lens distortion effect.
	 *
	 * @param options - The options.
	 */

	constructor({
		distortion = new Vector2(0, 0),
		principalPoint = new Vector2(0, 0),
		focalLength = new Vector2(1, 1),
		skew = 0
	}: LensDistortionEffectOptions = {}) {

		super("LensDistortionEffect");

		this.fragmentShader = fragmentShader;
		const uniforms = this.input.uniforms;
		uniforms.set("distortion", new Uniform(distortion));
		uniforms.set("principalPoint", new Uniform(principalPoint));
		uniforms.set("focalLength", new Uniform(focalLength));
		uniforms.set("skew", new Uniform(skew));

	}

	/**
	 * The radial distortion coefficients.
	 *
	 * @defaultValue (0, 0)
	 */

	get distortion(): Vector2 {

		return this.input.uniforms.get("distortion")!.value as Vector2;

	}

	set distortion(value: Vector2) {

		this.input.uniforms.get("distortion")!.value = value;

	}

	/**
	 * The principal point.
	 *
	 * @defaultValue (0, 0)
	 */

	get principalPoint(): Vector2 {

		return this.input.uniforms.get("principalPoint")!.value as Vector2;

	}

	set principalPoint(value) {

		this.input.uniforms.get("principalPoint")!.value = value;

	}

	/**
	 * The focal length.
	 *
	 * @defaultValue (1, 1)
	 */

	get focalLength(): Vector2 {

		return this.input.uniforms.get("focalLength")!.value as Vector2;

	}

	set focalLength(value) {

		this.input.uniforms.get("focalLength")!.value = value;

	}

	/**
	 * The skew factor in radians.
	 *
	 * @defaultValue 0
	 */

	get skew(): number {

		return this.input.uniforms.get("skew")!.value as number;

	}

	set skew(value) {

		this.input.uniforms.get("skew")!.value = value;

	}

}
