import { Uniform } from "three";
import { Effect } from "./Effect.js";

import fragmentShader from "./shaders/scanline.frag";
import { Resolution } from "src/utils/Resolution.js";

/**
 * ScanlineEffect options.
 *
 * @category Effects
 */

export interface ScanlineEffectOptions {

	/**
	 * The Scanline density.
	 *
	 * @defaultValue 1.25
	 */

	density?: number;

	/**
	 * The Scanline scroll speed.
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
 */

export class ScanlineEffect extends Effect {

	/**
	 * Effect density.
	 */

	private d: number;

	/**
	 * Constructs a new scanline effect.
	 *
	 * @param {Object} [options] - The options.
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

		this.d = density;
		this.scrollSpeed = scrollSpeed;

	}

	/**
	 * The scanline density.
	 */

	get density() {

		return this.d;

	}

	set density(value: number) {

		this.d = value;
		this.setSize(this.resolution.height);

	}

	/**
	 * Returns the current scanline density.
	 *
	 * @deprecated Use density instead.
	 * @return {Number} The scanline density.
	 */

	getDensity() {

		return this.density;

	}

	/**
	 * Sets the scanline density.
	 *
	 * @deprecated Use density instead.
	 */

	setDensity(value: number) {

		this.density = value;

	}

	/**
	 * The scanline scroll speed. Default is 0 (disabled).
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

	/**
	 * Updates the size of this pass.
	 */

	setSize(height: number) {

		this.input.uniforms.get("count")!.value = Math.round(height * this.density);

	}

}
