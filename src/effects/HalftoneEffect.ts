import { HalftoneShape } from "../enums/HalftoneShape.js";
import { Effect } from "./Effect.js";
import { OverlayBlendFunction } from "./blending/blend-functions/OverlayBlendFunction.js";

import fragmentShader from "./shaders/halftone.frag";
import { Uniform, Vector3 } from "three";

/**
 * HalftoneEffect options.
 *
 * @category Effects
 */

export interface HalftoneEffectOptions {
	shape?: HalftoneShape;
	radius?: number;
	rotationR?: number;
	rotationG?: number;
	rotationB?: number;
	scatterFactor?: number;
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
	 * Constructs a new halftone effect.
	 *
	 * @param options - The options.
	 */

	constructor({
		shape = HalftoneShape.ELLIPSE,
		radius = 6,
		rotationR = 14,
		rotationG = 45,
		rotationB = 30,
		scatterFactor = 0,
		samples = 8
	}: HalftoneEffectOptions = {}) {

		super("HalftoneEffect");

		this.fragmentShader = fragmentShader;
		this.samples = samples;

		this.blendMode.blendFunction = new OverlayBlendFunction();

		const uniforms = this.input.uniforms;
		uniforms.set("radius", new Uniform(radius));
		uniforms.set("rotationRGB", new Uniform(new Vector3(rotationR, rotationG, rotationB)));
		uniforms.set("scatterFactor", new Uniform(scatterFactor));
		uniforms.set("shape", new Uniform(shape));

	}

	/**
	 * The halftone dot radius.
	 */

	get radius() {

		return this.input.uniforms.get("radius")!.value as number;

	}

	set radius(value: number) {

		this.input.uniforms.get("radius")!.value = value;

	}

	/**
	 * The halftone dot scatterFactor.
	 */

	get scatterFactor() {

		return this.input.uniforms.get("scatterFactor")!.value as number;

	}

	set scatterFactor(value: number) {

		this.input.uniforms.get("scatterFactor")!.value = value;

	}

	/**
	 * The halftone dot grid rotation in the red channel.
	 */

	get rotationR() {

		const rotationRGB = this.input.uniforms.get("rotationRGB")!.value as Vector3;
		return rotationRGB.x;

	}

	set rotationR(value: number) {

		const rotationRGB = this.input.uniforms.get("rotationRGB")!.value as Vector3;
		rotationRGB.x = value;
		this.input.uniforms.get("rotationRGB")!.value = rotationRGB;

	}

	/**
	 * The halftone dot grid rotation in the green channel.
	 */

	get rotationG() {

		const rotationRGB = this.input.uniforms.get("rotationRGB")!.value as Vector3;
		return rotationRGB.y;

	}

	set rotationG(value: number) {

		const rotationRGB = this.input.uniforms.get("rotationRGB")!.value as Vector3;
		rotationRGB.y = value;
		this.input.uniforms.get("rotationRGB")!.value = rotationRGB;

	}

	/**
	 * The halftone dot grid rotation in the red channel.
	 */

	get rotationB() {

		const rotationRGB = this.input.uniforms.get("rotationRGB")!.value as Vector3;
		return rotationRGB.z;

	}

	set rotationB(value: number) {

		const rotationRGB = this.input.uniforms.get("rotationRGB")!.value as Vector3;
		rotationRGB.z = value;
		this.input.uniforms.get("rotationRGB")!.value = rotationRGB;

	}

	/**
	 * The halftone dot shape.
	 */

	get shape() {

		return this.input.uniforms.get("shape")!.value as HalftoneShape;

	}

	set shape(value: HalftoneShape) {

		this.input.uniforms.get("shape")!.value = value;

	}

	/**
	 * The amount of samples.
	 */

	get samples(): number {

		return this.input.defines.get("SAMPLES") as number;

	}

	set samples(value: number) {

		this.input.defines.set("SAMPLES", value);
		this.setChanged();

	}

}
