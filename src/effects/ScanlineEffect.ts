import { Uniform, Vector2 } from "three";
import { Effect } from "./Effect.js";
import { OverlayBlendFunction } from "./blending/blend-functions/OverlayBlendFunction.js";

import fragmentShader from "./shaders/scanline.frag";

/**
 * ScanlineEffect options.
 *
 * @category Effects
 */

export interface ScanlineEffectOptions {

	/**
	 * The scanline density.
	 *
	 * @defaultValue 1.0
	 */

	density?: number;

	/**
	 * A scanline offset in the range [0.0, 1.0].
	 *
	 * @defaultValue 0.0
	 */

	offset?: number;

	/**
	 * The scanline scroll speed.
	 *
	 * @defaultValue 0.0
	 */

	scrollSpeed?: number;

}

/**
 * A scanline effect.
 *
 * Based on an implementation by Georg 'Leviathan' Steinrohder (CC BY 3.0):
 * http://www.truevision3d.com/forums/showcase/staticnoise_colorblackwhite_scanline_shaders-t18698.0.html
 *
 * @category Effects
 */

export class ScanlineEffect extends Effect implements ScanlineEffectOptions {

	/**
	 * @see {@link density}
	 */

	private _density: number;

	/**
	 * Constructs a new scanline effect.
	 *
	 * @param options - The options.
	 */

	constructor({
		density = 1.0,
		offset = 0.0,
		scrollSpeed = 0.0
	}: ScanlineEffectOptions = {}) {

		super("ScanlineEffectOptions");

		this.fragmentShader = fragmentShader;
		this.blendMode.blendFunction = new OverlayBlendFunction();

		const uniforms = this.input.uniforms;
		uniforms.set("params", new Uniform(new Vector2(offset, 0.0)));
		uniforms.set("scrollSpeed", new Uniform(0.0));

		this._density = density;
		this.scrollSpeed = scrollSpeed;

	}

	get density() {

		return this._density;

	}

	set density(value: number) {

		this._density = value;
		this.onResolutionChange();

	}

	get offset() {

		const params = this.input.uniforms.get("params")!.value as Vector2;
		return params.x;

	}

	set offset(value: number) {

		const params = this.input.uniforms.get("params")!.value as Vector2;
		params.x = value;

	}

	get scrollSpeed() {

		return this.input.uniforms.get("scrollSpeed")!.value as number;

	}

	set scrollSpeed(value: number) {

		this.input.uniforms.get("scrollSpeed")!.value = value;

		if(value === 0) {

			if(this.input.defines.delete("SCROLL")) {

				this.setChanged();

			}

		} else if(!this.input.defines.has("SCROLL")) {

			this.input.defines.set("SCROLL", "1");
			this.setChanged();

		}

	}

	protected override onResolutionChange(): void {

		const resolution = this.resolution;
		const params = this.input.uniforms.get("params")!.value as Vector2;
		params.y = this.density * resolution.baseHeight;

	}

}
