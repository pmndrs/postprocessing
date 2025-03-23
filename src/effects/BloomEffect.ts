import { Uniform } from "three";
import { Pass } from "../core/Pass.js";
import { LuminancePass } from "../passes/LuminancePass.js";
import { MipmapBlurPass, MipmapBlurPassOptions } from "../passes/MipmapBlurPass.js";
import { LuminanceMaterial } from "../materials/LuminanceMaterial.js";
import { AddBlendFunction } from "./blending/blend-functions/AddBlendFunction.js";
import { Effect } from "./Effect.js";

import fragmentShader from "./shaders/bloom.frag";

/**
 * BloomEffect options.
 *
 * @category Effects
 */

export interface BloomEffectOptions extends MipmapBlurPassOptions {

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
		levels = 8,
		fullResolutionUpsampling,
		clampToBorder
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

		const mipmapBlurPass = new MipmapBlurPass({ levels, radius, fullResolutionUpsampling, clampToBorder });
		this.mipmapBlurPass = mipmapBlurPass;

		const uniforms = this.input.uniforms;
		uniforms.set("intensity", new Uniform(intensity));
		uniforms.set("map", new Uniform(null));
		mipmapBlurPass.texture.bindUniform(uniforms.get("map")!);

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

	protected override onResolutionChange(): void {

		const resolution = this.resolution;
		this.luminancePass.resolution.copy(resolution);
		this.mipmapBlurPass.resolution.copy(resolution);

	}

	protected override onInputChange(): void {

		if(this.input.defaultBuffer === null) {

			// Discard the texture resources.
			this.luminancePass.input.removeDefaultBuffer();
			this.mipmapBlurPass.input.removeDefaultBuffer();

			return;

		}

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
