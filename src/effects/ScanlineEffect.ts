import { Uniform } from "three";
import { Effect } from "./Effect.js";
import { Resolution } from "../utils/Resolution.js";

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
	 * @defaultValue 1.25
	 */

	density?: number;

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

export class ScanlineEffect extends Effect {

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
		density = 1.25,
		scrollSpeed = 0.0
	}: ScanlineEffectOptions = {}) {

		super("ScanlineEffectOptions");

		this.fragmentShader = fragmentShader;

		const uniforms = this.input.uniforms;
		uniforms.set("count", new Uniform(0.0));
		uniforms.set("scrollSpeed", new Uniform(0.0));

		this._density = density;
		this.scrollSpeed = scrollSpeed;

	}

	/**
	 * The scanline density.
	 */

	get density() {

		return this._density;

	}

	set density(value: number) {

		this._density = value;
		this.onResolutionChange(this.resolution);

	}

	/**
	 * The scanline scroll speed.
	 */

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

	protected override onResolutionChange(resolution: Resolution) {

		this.input.uniforms.get("count")!.value = Math.round(resolution.height * this.density);

	}

}
