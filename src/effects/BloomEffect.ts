import { Uniform } from "three";
import { Pass } from "../core/Pass.js";
import { LuminancePass } from "../passes/LuminancePass.js";
import { MipmapBlurPass } from "../passes/MipmapBlurPass.js";
import { LuminanceMaterial } from "../materials/LuminanceMaterial.js";
import { Resolution } from "../utils/Resolution.js";
import { AddBlendFunction } from "./blending/blend-functions/AddBlendFunction.js";
import { Effect } from "./Effect.js";

import fragmentShader from "./shaders/bloom.frag";

/**
 * BloomEffect options.
 *
 * @category Effects
 */

export interface BloomEffectOptions {

	/**
	 * The luminance threshold. Raise this value to mask out darker elements in the scene.
	 *
	 * @defaultValue 1
	 */

	luminanceThreshold?: number;

	/**
	 * Controls the smoothness of the luminance threshold.
	 *
	 * @defaultValue 0.03
	 */

	luminanceSmoothing?: number;

	/**
	 * The bloom intensity.
	 *
	 * @defaultValue 1
	 */

	intensity?: number;

	/**
	 * The blur radius.
	 *
	 * @defaultValue 0.85
	 */

	radius?: number;

	/**
	 * The amount of MIP levels.
	 *
	 * At 720p 8 steps are likely too much, while at 4K a they might not be enough.
	 *
	 * @defaultValue 8
	 */

	levels?: number;

}

/**
 * A bloom effect.
 *
 * Based on an article by Fabrice Piquet.
 *
 * @see https://www.froyok.fr/blog/2021-12-ue4-custom-bloom/
 * @category Effects
 */

export class BloomEffect extends Effect {

	/**
	 * A luminance pass.
	 */

	readonly luminancePass: LuminancePass;

	/**
	 * A mipmap blur pass.
	 */

	readonly mipmapBlurPass: MipmapBlurPass;

	/**
	 * Constructs a new bloom effect.
	 *
	 * @param options - The options.
	 */

	constructor({
		luminanceThreshold = 1.0,
		luminanceSmoothing = 0.03,
		intensity = 1.0,
		radius = 0.85,
		levels = 8
	}: BloomEffectOptions = {}) {

		super("BloomEffect");

		this.fragmentShader = fragmentShader;
		this.blendMode.blendFunction = new AddBlendFunction();

		const luminancePass = new LuminancePass();
		luminancePass.addEventListener(Pass.EVENT_TOGGLE, () => this.onInputChange());
		this.luminancePass = luminancePass;

		const luminanceMaterial = this.luminanceMaterial;
		luminanceMaterial.threshold = luminanceThreshold;
		luminanceMaterial.smoothing = luminanceSmoothing;
		luminanceMaterial.colorOutput = true;

		const mipmapBlurPass = new MipmapBlurPass();
		mipmapBlurPass.radius = radius;
		mipmapBlurPass.levels = levels;
		this.mipmapBlurPass = mipmapBlurPass;

		const uniforms = this.input.uniforms;
		uniforms.set("map", new Uniform(this.mipmapBlurPass.texture));
		uniforms.set("intensity", new Uniform(intensity));

		this.subpasses = [luminancePass, mipmapBlurPass];

	}

	/**
	 * The luminance material.
	 */

	get luminanceMaterial(): LuminanceMaterial {

		return this.luminancePass.fullscreenMaterial;

	}

	/**
	 * The bloom intensity.
	 */

	get intensity(): number {

		return this.input.uniforms.get("intensity")!.value as number;

	}

	set intensity(value: number) {

		this.input.uniforms.get("intensity")!.value = value;

	}

	protected override onResolutionChange(resolution: Resolution) {

		this.luminancePass.resolution.copy(resolution);
		this.mipmapBlurPass.resolution.copy(resolution);

	}

	protected override onInputChange(): void {

		if(this.luminancePass.enabled) {

			this.luminancePass.input.defaultBuffer = this.input.defaultBuffer;
			this.mipmapBlurPass.input.defaultBuffer = this.luminancePass.texture;

		} else {

			this.mipmapBlurPass.input.defaultBuffer = this.input.defaultBuffer;

		}

	}

	override render(): void {

		if(this.luminancePass.enabled) {

			this.luminancePass.render();

		}

		this.mipmapBlurPass.render();

	}

}
