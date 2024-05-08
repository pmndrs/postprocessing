import { Uniform } from "three";
import { Resolution } from "../utils/Resolution.js";
import { Effect } from "./Effect.js";

import fragmentShader from "./shaders/bloom.frag";
import { SrcBlendFunction } from "./blending/index.js";
import { MultiPassKawaseBlurPass } from "postprocessing";

/**
 * KawaseBlurEffect options.
 *
 * @category Effects
 */

export interface MultiPassKawaseBlurEffectOptions {

	/**
	 * The scale of the blur kernel.
	 *
	 * @defaultValue 0.35
	 */

	scale?: number;

	/**
	 * The blur effect intensity.
	 *
	 * @defaultValue 1
	 */

	intensity?: number;

	/**
	 * The number of up/downsample passes performed.
	 *
	 * @defaultValue 2
	 */

	levels?: number;

}

/**
 * A multi pass Kawase Blur effect.
 *
 * Based on alex47's ShaderToy implementation of the Dual Kawase Blur Algorithm.
 *
 * @see https://www.shadertoy.com/view/3td3W8
 * @category Effects
 */

export class MultiPassKawaseBlurEffect extends Effect {

	/**
	 * A multi pass Kawase blur pass.
	 */

	readonly multiPassKawaseBlurPass: MultiPassKawaseBlurPass;

	/**
	 * Constructs a new blur effect.
	 *
	 * @param options - The options.
	 */

	constructor({
		intensity = 1,
		scale = 0.35,
		levels = 2
	}: MultiPassKawaseBlurEffectOptions = {}) {

		super("MultiPassKawaseBlurEffect");

		this.fragmentShader = fragmentShader;
		this.blendMode.blendFunction = new SrcBlendFunction();

		this.multiPassKawaseBlurPass = new MultiPassKawaseBlurPass({
			scale,
			levels
		});

		const uniforms = this.input.uniforms;
		uniforms.set("map", new Uniform(this.multiPassKawaseBlurPass.texture));
		uniforms.set("intensity", new Uniform(intensity));

		this.subpasses = [this.multiPassKawaseBlurPass];

	}

	/**
	 * The blur effect intensity.
	 */

	get intensity(): number {

		return this.input.uniforms.get("intensity")!.value as number;

	}

	set intensity(value: number) {

		this.input.uniforms.get("intensity")!.value = value;

	}

	protected override onResolutionChange(resolution: Resolution) {

		this.multiPassKawaseBlurPass.resolution.copy(resolution);

	}

	protected override onInputChange(): void {

		this.multiPassKawaseBlurPass.input.defaultBuffer = this.input.defaultBuffer?.value ?? null;

	}

	override render(): void {

		this.multiPassKawaseBlurPass.render();

	}

}
