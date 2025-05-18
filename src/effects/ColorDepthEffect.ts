import { Uniform, Vector3 } from "three";
import { Effect } from "./Effect.js";

import fragmentShader from "./shaders/color-depth.frag";

/**
 * ColorDepthEffect options.
 *
 * @category Effects
 */

export interface ColorDepthEffectOptions {

	/**
	 * The virtual bit depth of the red channel.
	 *
	 * @defaultValue 16
	 */

	r?: number;

	/**
	 * The virtual bit depth of the green channel.
	 *
	 * @defaultValue 16
	 */

	g?: number;

	/**
	 * The virtual bit depth of the blue channel.
	 *
	 * @defaultValue 16
	 */

	b?: number;

}

/**
 * A color depth effect.
 *
 * Simulates a hardware limitation to create a retro aesthetic. The real color depth remains unchanged.
 *
 * Note: This effect should be applied _after_ tone mapping because it expects LDR input colors.
 *
 * @category Effects
 */

export class ColorDepthEffect extends Effect implements ColorDepthEffectOptions {

	/**
	 * The current color bit depths.
	 */

	private readonly bits: Vector3;

	/**
	 * Constructs a new color depth effect.
	 *
	 * @param options - The options.
	 */

	constructor({ r = 16, g = 16, b = 16 }: ColorDepthEffectOptions = {}) {

		super("ColorDepthEffect");

		this.fragmentShader = fragmentShader;

		const uniforms = this.input.uniforms;
		uniforms.set("colorRanges", new Uniform(new Vector3()));

		this.bits = new Vector3(r, g, b);
		this.updateFactors();

	}

	/**
	 * Updates the color ranges.
	 */

	private updateFactors(): void {

		const colorRanges = this.input.uniforms.get("colorRanges")!.value as Vector3;
		const bits = this.bits;

		colorRanges.set(
			Math.pow(2.0, bits.x),
			Math.pow(2.0, bits.y),
			Math.pow(2.0, bits.z)
		);

	}

	get r(): number {

		return this.bits.x;

	}

	set r(value: number) {

		this.bits.x = value;
		this.updateFactors();

	}

	get g(): number {

		return this.bits.y;

	}

	set g(value: number) {

		this.bits.y = value;
		this.updateFactors();

	}

	get b(): number {

		return this.bits.z;

	}

	set b(value: number) {

		this.bits.z = value;
		this.updateFactors();

	}

}
