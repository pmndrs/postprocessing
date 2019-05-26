import { Uniform, Vector2 } from "three";
import { BlendFunction } from "./blending/BlendFunction.js";
import { Effect } from "./Effect.js";

import fragmentShader from "./glsl/scanlines/shader.frag";

/**
 * A scanline effect.
 */

export class ScanlineEffect extends Effect {

	/**
	 * Constructs a new scanline effect.
	 *
	 * @param {Object} [options] - The options.
	 * @param {BlendFunction} [options.blendFunction=BlendFunction.OVERLAY] - The blend function of this effect.
	 * @param {Number} [options.density=1.25] - The scanline density.
	 */

	constructor({ blendFunction = BlendFunction.OVERLAY, density = 1.25 } = {}) {

		super("ScanlineEffect", fragmentShader, {

			blendFunction,

			uniforms: new Map([
				["count", new Uniform(0.0)]
			])

		});

		/**
		 * The original resolution.
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

		this.density = density;

	}

	/**
	 * Returns the current scanline density.
	 *
	 * @return {Number} The scanline density.
	 */

	getDensity() {

		return this.density;

	}

	/**
	 * Sets the scanline density.
	 *
	 * @param {Number} density - The new scanline density.
	 */

	setDensity(density) {

		this.density = density;
		this.setSize(this.resolution.x, this.resolution.y);

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
