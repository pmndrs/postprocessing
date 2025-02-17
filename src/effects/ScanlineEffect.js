import { Uniform, Vector2 } from "three";
import { BlendFunction } from "../enums/BlendFunction.js";
import { Effect } from "./Effect.js";

import fragmentShader from "./glsl/scanlines.frag";

/**
 * A scanline effect.
 *
 * Based on an implementation by Georg 'Leviathan' Steinrohder (CC BY 3.0):
 * http://www.truevision3d.com/forums/showcase/staticnoise_colorblackwhite_scanline_shaders-t18698.0.html
 */

export class ScanlineEffect extends Effect {

	/**
	 * Constructs a new scanline effect.
	 *
	 * @param {Object} [options] - The options.
	 * @param {BlendFunction} [options.blendFunction=BlendFunction.OVERLAY] - The blend function of this effect.
	 * @param {Number} [options.density=1.25] - The scanline density.
	 * @param {Number} [options.scrollSpeed=0.0] - The scanline scroll speed.
	 */

	constructor({ blendFunction = BlendFunction.OVERLAY, density = 1.25, scrollSpeed = 0.0 } = {}) {

		super("ScanlineEffect", fragmentShader, {
			blendFunction,
			uniforms: new Map([
				["count", new Uniform(0.0)],
				["scrollSpeed", new Uniform(0.0)]
			])
		});

		/**
		 * The current resolution.
		 *
		 * @type {Vector2}
		 * @private
		 */

		this.resolution = new Vector2();

		/**
		 * The amount of scanlines, relative to the screen height.
		 *
		 * @type {Number}
		 * @private
		 */

		this.d = density;

		this.scrollSpeed = scrollSpeed;

	}

	/**
	 * The scanline density.
	 *
	 * @type {Number}
	 */

	get density() {

		return this.d;

	}

	set density(value) {

		this.d = value;
		this.setSize(this.resolution.width, this.resolution.height);

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
	 * @param {Number} value - The new scanline density.
	 */

	setDensity(value) {

		this.density = value;

	}

	/**
	 * The scanline scroll speed. Default is 0 (disabled).
	 *
	 * @type {Number}
	 */

	get scrollSpeed() {

		return this.uniforms.get("scrollSpeed").value;

	}

	set scrollSpeed(value) {

		this.uniforms.get("scrollSpeed").value = value;

		if(value === 0) {

			if(this.defines.delete("SCROLL")) {

				this.setChanged();

			}

		} else if(!this.defines.has("SCROLL")) {

			this.defines.set("SCROLL", "1");
			this.setChanged();

		}

	}

	/**
	 * Updates the size of this pass.
	 *
	 * @param {Number} width - The width.
	 * @param {Number} height - The height.
	 */

	setSize(width, height) {

		this.resolution.set(width, height);
		this.uniforms.get("count").value = Math.round(height * this.density);

	}

}
