import { Uniform, Vector3 } from "three";
import { HalftoneShape } from "../enums/HalftoneShape.js";
import { LinearDodgeBlendFunction } from "./blending/blend-functions/LinearDodgeBlendFunction.js";
import { Effect } from "./Effect.js";

import fragmentShader from "./shaders/halftone.frag";

/**
 * HalftoneEffect options.
 *
 * @category Effects
 */

export interface HalftoneEffectOptions {

	/**
	 * The halftone shape.
	 *
	 * @defaultValue {@link HalftoneShape.DOT}
	 */

	shape?: HalftoneShape;

	/**
	 * The pattern radius.
	 *
	 * @defaultValue 6.0
	 */

	radius?: number;

	/**
	 * The grid rotation for all color channels in radians.
	 *
	 * This setting yields better performance compared to individual rotations per channel.
	 *
	 * @defaultValue 0
	 */

	rotation?: number;

	/**
	 * The grid rotation for the red channel in radians.
	 *
	 * @defaultValue {@link rotation}
	 */

	rotationR?: number;

	/**
	 * The grid rotation for the green channel in radians.
	 *
	 * @defaultValue {@link rotationR}
	 */

	rotationG?: number;

	/**
	 * The grid rotation for the blue channel in radians.
	 *
	 * @defaultValue {@link rotationG}
	 */

	rotationB?: number;

	/**
	 * The halftone scatter factor.
	 *
	 * @defaultValue 0
	 */

	scatterFactor?: number;

	/**
	 * The sample count.
	 *
	 * @defaultValue 8
	 */

	samples?: number;

}

/**
 * A halftone effect.
 *
 * Based on the implementation found in Three.js:
 * https://github.com/mrdoob/three.js/blob/0bf3908b73b2cf73d7361cce17cfc8b816cb2a00/examples/jsm/postprocessing/HalftonePass.js
 *
 * @category Effects
 */

export class HalftoneEffect extends Effect {

	/**
	 * @see {@link radius}
	 */

	private _radius: number;

	/**
	 * Constructs a new halftone effect.
	 *
	 * @param options - The options.
	 */

	constructor({
		shape = HalftoneShape.DOT,
		radius = 6.0,
		rotation = 0,
		rotationR = rotation,
		rotationG = rotationR,
		rotationB = rotationG,
		scatterFactor = 0,
		samples = 8
	}: HalftoneEffectOptions = {}) {

		super("HalftoneEffect");

		this.fragmentShader = fragmentShader;
		this.blendMode.blendFunction = new LinearDodgeBlendFunction();

		const uniforms = this.input.uniforms;
		uniforms.set("radius", new Uniform(1.0));
		uniforms.set("rotationRGB", new Uniform(new Vector3(rotationR, rotationG, rotationB)));
		uniforms.set("scatterFactor", new Uniform(scatterFactor));

		this._radius = radius;
		this.shape = shape;
		this.samples = samples;

		this.updateRGBRotation();

	}

	/**
	 * The halftone shape.
	 */

	get shape() {

		return this.input.defines.get("SHAPE") as number;

	}

	set shape(value: HalftoneShape) {

		this.input.defines.set("SHAPE", value);
		this.setChanged();

	}

	/**
	 * The amount of samples.
	 */

	get samples(): number {

		return this.input.defines.get("SAMPLES") as number;

	}

	set samples(value: number) {

		value = Math.max(value, 1);

		this.input.defines.set("SAMPLES", value);
		this.input.defines.set("INV_SAMPLES", (1.0 / value).toFixed(9));
		this.input.defines.set("INV_SAMPLES_PLUS_ONE", (1.0 / (value + 1.0)).toFixed(9));
		this.setChanged();

	}

	/**
	 * The pattern radius.
	 */

	get radius() {

		return this._radius;

	}

	set radius(value: number) {

		this._radius = value;
		this.onResolutionChange();

	}

	/**
	 * The halftone scatter factor.
	 */

	get scatterFactor() {

		return this.input.uniforms.get("scatterFactor")!.value as number;

	}

	set scatterFactor(value: number) {

		this.input.uniforms.get("scatterFactor")!.value = value;

	}

	/**
	 * The grid rotation in radians.
	 */

	set rotation(value: number) {

		const rotationRGB = this.input.uniforms.get("rotationRGB")!.value as Vector3;
		rotationRGB.setScalar(value);
		this.updateRGBRotation();

	}

	/**
	 * The grid rotation for the red channel in radians.
	 */

	get rotationR() {

		const rotationRGB = this.input.uniforms.get("rotationRGB")!.value as Vector3;
		return rotationRGB.x;

	}

	set rotationR(value: number) {

		const rotationRGB = this.input.uniforms.get("rotationRGB")!.value as Vector3;
		rotationRGB.x = value;
		this.updateRGBRotation();

	}

	/**
	 * The grid rotation for the green channel in radians.
	 */

	get rotationG() {

		const rotationRGB = this.input.uniforms.get("rotationRGB")!.value as Vector3;
		return rotationRGB.y;

	}

	set rotationG(value: number) {

		const rotationRGB = this.input.uniforms.get("rotationRGB")!.value as Vector3;
		rotationRGB.y = value;
		this.updateRGBRotation();

	}

	/**
	 * The grid rotation for the blue channel in radians.
	 */

	get rotationB() {

		const rotationRGB = this.input.uniforms.get("rotationRGB")!.value as Vector3;
		return rotationRGB.z;

	}

	set rotationB(value: number) {

		const rotationRGB = this.input.uniforms.get("rotationRGB")!.value as Vector3;
		rotationRGB.z = value;
		this.updateRGBRotation();

	}

	/**
	 * Enables or disables RGB rotation based on the current rotation settings.
	 */

	private updateRGBRotation() {

		const currentlyEnabled = this.input.defines.has("RGB_ROTATION");

		const shouldBeEnabled = (
			this.rotationR !== this.rotationG ||
			this.rotationR !== this.rotationB ||
			this.rotationG !== this.rotationB
		);

		if(shouldBeEnabled) {

			this.input.defines.set("RGB_ROTATION", true);

		} else {

			this.input.defines.delete("RGB_ROTATION");

		}

		if(currentlyEnabled !== shouldBeEnabled) {

			this.setChanged();

		}

	}

	protected override onResolutionChange(): void {

		const r = this.radius * this.resolution.scaledPixelRatio;
		this.input.uniforms.get("radius")!.value = Math.max(r, 1e-9);

	}

}
